"""
Backend API - Integrates speech-to-text transcription with clinical pipeline
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
import torch
import os
import sys
import re
import json
from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import uuid4
from dotenv import load_dotenv
from jose import JWTError, jwt
from passlib.context import CryptContext
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError, PyMongoError

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))
from aegis_s3.backend.models.clinical_data import create_clinical_data
from aegis_s3.backend.pipeline import ClinicalPipeline
from transcribe import transcribe_audio_bytes
try:
    from .pretrained_entity_extractor import extract_entities_with_pretrained_model, is_gemini_configured
except ImportError:
    from pretrained_entity_extractor import extract_entities_with_pretrained_model, is_gemini_configured

app = FastAPI(title="CavistaMed AI API", version="1.0.0")

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB = os.getenv("MONGODB_DB", "cavistamed_ai")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))

mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=3000)
db = mongo_client[MONGODB_DB]
users_collection = db["users"]
consultations_collection = db["consultations"]
mongo_available = True
try:
    mongo_client.admin.command("ping")
    users_collection.create_index("email", unique=True)
    consultations_collection.create_index("created_at")
    consultations_collection.create_index([("patient", 1), ("created_at", -1)])
except PyMongoError:
    mongo_available = False

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize runtime device info
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

# Initialize clinical pipeline
clinical_pipeline = ClinicalPipeline()
consultation_records: list[dict[str, Any]] = []
dashboard_seeded = False


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


def sanitize_user(user_doc: dict) -> dict:
    return {
        "id": str(user_doc.get("_id")),
        "name": user_doc.get("name", ""),
        "email": user_doc.get("email", ""),
        "role": user_doc.get("role", ""),
    }


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=JWT_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def ensure_password_length(password: str):
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > 72:
        raise HTTPException(status_code=400, detail="Password must be 72 bytes or fewer")


def get_current_user(token: str = Depends(oauth2_scheme)):
    if not mongo_available:
        raise HTTPException(status_code=503, detail="MongoDB is unavailable")

    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials")
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_email: str | None = payload.get("sub")
        if not user_email:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user_doc = users_collection.find_one({"email": user_email})
    if not user_doc:
        raise credentials_exception
    return user_doc


def _to_iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat()


def _time_ago(iso_time: str) -> str:
    try:
        created = datetime.fromisoformat(iso_time.replace("Z", "+00:00"))
    except Exception:
        return "just now"

    seconds = max(int((datetime.now(timezone.utc) - created).total_seconds()), 0)
    if seconds < 60:
        return "just now"
    if seconds < 3600:
        mins = seconds // 60
        return f"{mins} min ago"
    if seconds < 86400:
        hrs = seconds // 3600
        return f"{hrs} hr ago"
    days = seconds // 86400
    return f"{days} day ago" if days == 1 else f"{days} days ago"


def _build_record(patient_name: str, transcript: str, clinical_data: dict, pipeline_result: dict, status: str = "completed") -> dict:
    emr = pipeline_result.get("emr") or {}
    triage = pipeline_result.get("triage") or {}
    icd_codes = emr.get("icd_codes") or []
    primary = icd_codes[0] if icd_codes else {}

    return {
        "id": f"CON-{int(datetime.now(timezone.utc).timestamp() * 1000)}",
        "patient": patient_name or "Unknown Patient",
        "transcript": transcript or "",
        "created_at": _to_iso(datetime.now(timezone.utc)),
        "status": status,
        "triage_level": (triage.get("triage_level") or "LOW").upper(),
        "diagnosis": primary.get("diagnosis") or emr.get("assessment") or "Assessment pending",
        "icd": primary.get("icd_code") or "Not Found",
        "confidence": int(primary.get("confidence") or 0),
        "clinical_data": clinical_data,
        "emr": emr,
    }


def _store_record(record: dict):
    record.pop("_id", None)
    consultation_records.insert(0, record)
    if len(consultation_records) > 200:
        consultation_records.pop()

    if not mongo_available:
        return

    try:
        consultations_collection.insert_one(dict(record))
    except PyMongoError:
        # Keep the in-memory fallback working even if Mongo write fails
        pass


def _load_recent_records(limit: int = 8) -> list[dict[str, Any]]:
    if mongo_available:
        try:
            records = list(consultations_collection.find({}, {"_id": 0}).sort("created_at", -1).limit(limit))
            if records:
                return records
        except PyMongoError:
            pass

    return consultation_records[:limit]


def _count_today_records() -> int:
    now = datetime.now(timezone.utc)
    start_of_day = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)

    if mongo_available:
        try:
            return consultations_collection.count_documents({"created_at": {"$gte": _to_iso(start_of_day)}})
        except PyMongoError:
            pass

    total = 0
    for r in consultation_records:
        try:
            created = datetime.fromisoformat(str(r.get("created_at", "")).replace("Z", "+00:00"))
        except Exception:
            continue
        if created >= start_of_day:
            total += 1
    return total


def _seed_dashboard_records_once():
    global dashboard_seeded
    if dashboard_seeded:
        return

    if mongo_available:
        try:
            if consultations_collection.estimated_document_count() > 0:
                dashboard_seeded = True
                return
        except PyMongoError:
            pass

    if consultation_records:
        dashboard_seeded = True
        return

    samples = [
        {
            "patient": "Maria Santos",
            "transcript": "Patient reports frequent urination and excessive thirst with fatigue for 2 weeks.",
            "clinical_data": create_clinical_data(
                symptoms=["frequent urination", "excessive thirst", "fatigue"],
                duration="2 weeks",
                severity="6/10",
                vitals={"blood_pressure": "138/88", "systolic_bp": 138, "diastolic_bp": 88, "heart_rate": 82, "SpO2": 97},
                history=["obesity", "family history of diabetes"],
                medications=["Lisinopril 10mg"],
                allergies=["Sulfonamides"],
            ),
        },
        {
            "patient": "John Williams",
            "transcript": "Persistent headache and dizziness with elevated blood pressure readings.",
            "clinical_data": create_clinical_data(
                symptoms=["headache", "dizziness", "high blood pressure"],
                duration="5 days",
                severity="7/10",
                vitals={"blood_pressure": "172/98", "systolic_bp": 172, "diastolic_bp": 98, "heart_rate": 88, "SpO2": 96},
                history=["hypertension", "high cholesterol"],
                medications=["Atorvastatin 20mg"],
                allergies=["Penicillin"],
            ),
        },
        {
            "patient": "Linda Chen",
            "transcript": "Cough, fever, and mild shortness of breath for one week.",
            "clinical_data": create_clinical_data(
                symptoms=["cough", "fever", "shortness of breath", "fatigue"],
                duration="1 week",
                severity="5/10",
                vitals={"blood_pressure": "118/76", "systolic_bp": 118, "diastolic_bp": 76, "heart_rate": 94, "SpO2": 94},
                history=["asthma"],
                medications=[],
                allergies=[],
            ),
        },
    ]

    now = datetime.now(timezone.utc)
    for idx, sample in enumerate(samples):
        result = clinical_pipeline.process_patient_data(sample["clinical_data"])
        if result.get("status") != "success":
            continue
        record = _build_record(sample["patient"], sample["transcript"], sample["clinical_data"], result)
        record["created_at"] = _to_iso(now - timedelta(minutes=(idx + 1) * 20))
        _store_record(record)

    dashboard_seeded = True


def _find_patient_by_name(patient_name: str) -> dict | None:
    if not mongo_available:
        return None
    try:
        normalized = patient_name.strip()
        if not normalized:
            return None

        # Exact match first
        patient_doc = users_collection.find_one({"role": "patient", "name": normalized})
        if patient_doc:
            return patient_doc

        # Case-insensitive fallback
        return users_collection.find_one({"role": "patient", "name": {"$regex": f"^{normalized}$", "$options": "i"}})
    except PyMongoError:
        return None


def _search_patients_by_name(patient_name_query: str, limit: int = 8) -> list[dict]:
    if not mongo_available:
        return []
    query = (patient_name_query or "").strip()
    if not query:
        return []

    safe = re.escape(query)
    try:
        cursor = users_collection.find(
            {"role": "patient", "name": {"$regex": safe, "$options": "i"}},
            {"name": 1, "email": 1},
        ).limit(limit)
        return list(cursor)
    except PyMongoError:
        return []


@app.get("/")
async def root():
    return {"message": "CavistaMed AI API is running", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "whisper_device": device,
        "mongo_available": mongo_available,
        "gemini_configured": is_gemini_configured(),
    }


@app.post("/auth/signup")
async def signup(payload: SignupRequest):
    if not mongo_available:
        raise HTTPException(status_code=503, detail="MongoDB is unavailable")

    role = payload.role.strip().lower()
    if role not in {"doctor", "patient"}:
        raise HTTPException(status_code=400, detail="Role must be doctor or patient")

    password = payload.password.strip()
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    ensure_password_length(password)

    email = payload.email.lower().strip()
    name = payload.name.strip()
    password_hash = pwd_context.hash(password)

    user_doc = {
        "name": name,
        "email": email,
        "role": role,
        "password_hash": password_hash,
        "created_at": datetime.now(timezone.utc),
    }

    try:
        inserted = users_collection.insert_one(user_doc)
        user_doc["_id"] = inserted.inserted_id
    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="Email already registered")
    except PyMongoError:
        raise HTTPException(status_code=503, detail="MongoDB is unavailable")

    access_token = create_access_token({"sub": user_doc["email"], "role": user_doc["role"]})
    return {"token": access_token, "user": sanitize_user(user_doc)}


@app.post("/auth/login")
async def login(payload: LoginRequest):
    if not mongo_available:
        raise HTTPException(status_code=503, detail="MongoDB is unavailable")

    ensure_password_length(payload.password)
    email = payload.email.lower().strip()
    try:
        user_doc = users_collection.find_one({"email": email})
    except PyMongoError:
        raise HTTPException(status_code=503, detail="MongoDB is unavailable")
    if not user_doc or not pwd_context.verify(payload.password, user_doc.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token({"sub": user_doc["email"], "role": user_doc["role"]})
    return {"token": access_token, "user": sanitize_user(user_doc)}


@app.get("/auth/me")
async def me(current_user: dict = Depends(get_current_user)):
    return {"user": sanitize_user(current_user)}


@app.post("/speech-to-text")
async def transcribe_audio(file: UploadFile = File(...), starting_speaker: str = Form("Doctor")):
    """
    Transcribe audio file to text using Faster Whisper
    """
    try:
        audio_bytes = await file.read()
        return transcribe_audio_bytes(audio_bytes, file.filename, file.content_type, starting_speaker)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription error: {str(e)}")


@app.post("/process-clinical-data")
async def process_clinical_data(clinical_data: dict):
    """
    Process clinical data through the AI pipeline
    """
    try:
        result = clinical_pipeline.process_patient_data(clinical_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")


@app.post("/extract-clinical-entities")
async def extract_clinical_entities(payload: dict):
    """
    Extract structured clinical entities from transcript using a pre-trained model.
    """
    try:
        transcript = (payload or {}).get("transcript", "")
        if not isinstance(transcript, str) or not transcript.strip():
            raise HTTPException(status_code=400, detail="Transcript is required")

        entities = extract_entities_with_pretrained_model(transcript)
        return entities
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Entity extraction error: {str(e)}")


@app.post("/analyze-consultation")
async def analyze_consultation(
    request: Request,
    file: UploadFile = File(None),
    transcript: str = Form(None),
    clinical_data: str = Form(None),
):
    """
    Complete pipeline: Audio/Transcript → Clinical Analysis
    """
    try:
        parsed_clinical_data = None
        content_type = (request.headers.get("content-type") or "").lower()

        if "application/json" in content_type:
            body = await request.json()
            if isinstance(body, dict):
                transcript = (body.get("transcript") if transcript is None else transcript)
                payload_clinical_data = body.get("clinical_data")
                if isinstance(payload_clinical_data, dict):
                    parsed_clinical_data = payload_clinical_data
                elif isinstance(payload_clinical_data, str) and payload_clinical_data.strip():
                    try:
                        parsed_clinical_data = json.loads(payload_clinical_data)
                    except Exception:
                        raise HTTPException(status_code=400, detail="clinical_data must be valid JSON")

        if parsed_clinical_data is None and isinstance(clinical_data, str) and clinical_data.strip():
            try:
                parsed_clinical_data = json.loads(clinical_data)
            except Exception:
                raise HTTPException(status_code=400, detail="clinical_data must be valid JSON")

        final_transcript = ""

        # If audio file provided, transcribe it
        if file:
            audio_bytes = await file.read()
            result = transcribe_audio_bytes(audio_bytes, file.filename, file.content_type)
            final_transcript = result.get("transcript", "")
        elif transcript:
            final_transcript = transcript
        else:
            raise HTTPException(status_code=400, detail="Either audio file or transcript must be provided")

        # If clinical data provided, process through pipeline
        pipeline_result = None
        if parsed_clinical_data:
            pipeline_result = clinical_pipeline.process_patient_data(parsed_clinical_data)

        return {
            "transcript": final_transcript,
            "pipeline_result": pipeline_result
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")


@app.post("/emr/from-transcript")
async def generate_emr_from_transcript(payload: dict):
    """
    Convert transcript to clinical entities (Gemini/Ollama/heuristic), run pipeline,
    and optionally persist consultation record in MongoDB.
    """
    try:
        transcript = str((payload or {}).get("transcript") or "").strip()
        if not transcript:
            raise HTTPException(status_code=400, detail="transcript is required")

        patient_name = str((payload or {}).get("patient_name") or "Unknown Patient").strip() or "Unknown Patient"
        persist_record = bool((payload or {}).get("persist_record", True))
        session_id = str((payload or {}).get("session_id") or "").strip()
        record_status = str((payload or {}).get("status") or "completed").strip().lower() or "completed"

        if persist_record and not mongo_available:
            raise HTTPException(status_code=503, detail="MongoDB is unavailable. Cannot persist consultation record.")

        entities = extract_entities_with_pretrained_model(transcript)
        clinical_data = create_clinical_data(
            symptoms=entities.get("symptoms") or [],
            duration=entities.get("duration"),
            severity=entities.get("severity"),
            vitals=entities.get("vitals") or {},
            history=entities.get("history") or [],
            medications=entities.get("medications") or [],
            allergies=entities.get("allergies") or [],
        )

        pipeline_result = clinical_pipeline.process_patient_data(clinical_data)
        if pipeline_result.get("status") != "success":
            raise HTTPException(
                status_code=500,
                detail=pipeline_result.get("error_message") or "Unable to process consultation",
            )

        record = _build_record(
            patient_name=patient_name,
            transcript=transcript,
            clinical_data=clinical_data,
            pipeline_result=pipeline_result,
            status=record_status,
        )

        if persist_record:
            _store_record(record)

            if mongo_available and session_id and patient_name:
                try:
                    users_collection.update_one(
                        {
                            "role": "patient",
                            "name": {"$regex": f"^{patient_name}$", "$options": "i"},
                            "consultations.session_id": session_id,
                        },
                        {
                            "$set": {
                                "consultations.$.status": "completed",
                                "consultations.$.completed_at": _to_iso(datetime.now(timezone.utc)),
                                "consultations.$.latest_diagnosis": record.get("diagnosis"),
                                "consultations.$.latest_icd": record.get("icd"),
                            },
                            "$push": {
                                "consultations.$.records": {
                                    "record_id": record.get("id"),
                                    "created_at": record.get("created_at"),
                                    "diagnosis": record.get("diagnosis"),
                                    "icd": record.get("icd"),
                                    "confidence": record.get("confidence"),
                                }
                            },
                        },
                    )
                except PyMongoError:
                    pass

        return {
            "status": "success",
            "gemini_configured": is_gemini_configured(),
            "entities": entities,
            "clinical_data": clinical_data,
            "pipeline_result": pipeline_result,
            "record": record,
            "persisted": persist_record,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"EMR generation failed: {str(e)}")


@app.post("/consultations/record")
async def create_consultation_record(payload: dict):
    """
    Persist a generated consultation record and ensure ICD mapping is produced by ClinicalPipeline.
    """
    try:
        if not mongo_available:
            raise HTTPException(status_code=503, detail="MongoDB is unavailable. Cannot persist consultation record.")

        patient_name = str((payload or {}).get("patient_name") or "Unknown Patient").strip()
        session_id = str((payload or {}).get("session_id") or "").strip()
        transcript = str((payload or {}).get("transcript") or "").strip()
        clinical_data = (payload or {}).get("clinical_data") or {}

        if not isinstance(clinical_data, dict):
            raise HTTPException(status_code=400, detail="clinical_data must be an object")

        if not clinical_data.get("symptoms"):
            raise HTTPException(status_code=400, detail="clinical_data.symptoms is required")

        pipeline_result = clinical_pipeline.process_patient_data(clinical_data)
        if pipeline_result.get("status") != "success":
            raise HTTPException(
                status_code=500,
                detail=pipeline_result.get("error_message") or "Unable to process consultation",
            )

        record = _build_record(
            patient_name=patient_name,
            transcript=transcript,
            clinical_data=clinical_data,
            pipeline_result=pipeline_result,
            status=str((payload or {}).get("status") or "completed").lower(),
        )

        _store_record(record)

        if mongo_available and session_id and patient_name:
            try:
                users_collection.update_one(
                    {
                        "role": "patient",
                        "name": {"$regex": f"^{patient_name}$", "$options": "i"},
                        "consultations.session_id": session_id,
                    },
                    {
                        "$set": {
                            "consultations.$.status": "completed",
                            "consultations.$.completed_at": _to_iso(datetime.now(timezone.utc)),
                            "consultations.$.latest_diagnosis": record.get("diagnosis"),
                            "consultations.$.latest_icd": record.get("icd"),
                        },
                        "$push": {
                            "consultations.$.records": {
                                "record_id": record.get("id"),
                                "created_at": record.get("created_at"),
                                "diagnosis": record.get("diagnosis"),
                                "icd": record.get("icd"),
                                "confidence": record.get("confidence"),
                            }
                        },
                    },
                )
            except PyMongoError:
                pass

        return {"status": "success", "record": record}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Record creation failed: {str(e)}")


@app.post("/consultations/start")
async def start_consultation_session(payload: dict, current_user: dict = Depends(get_current_user)):
    """
    Validate patient name from DB and create a consultation section in patient user doc.
    """
    if not mongo_available:
        raise HTTPException(status_code=503, detail="MongoDB is unavailable")

    if (current_user.get("role") or "").lower() != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can start consultations")

    patient_name = str((payload or {}).get("patient_name") or "").strip()
    if not patient_name:
        raise HTTPException(status_code=400, detail="patient_name is required")

    patient_doc = _find_patient_by_name(patient_name)
    if not patient_doc:
        raise HTTPException(status_code=404, detail="Patient not found in users database")

    session_id = f"SES-{uuid4().hex[:10].upper()}"
    consultation_section = {
        "session_id": session_id,
        "doctor_id": str(current_user.get("_id")),
        "doctor_name": current_user.get("name", "Doctor"),
        "patient_name": patient_doc.get("name", patient_name),
        "status": "recording",
        "started_at": _to_iso(datetime.now(timezone.utc)),
        "records": [],
    }

    try:
        users_collection.update_one(
            {"_id": patient_doc.get("_id")},
            {"$push": {"consultations": consultation_section}},
        )
    except PyMongoError:
        raise HTTPException(status_code=503, detail="Failed to create consultation section for patient")

    return {
        "status": "success",
        "session_id": session_id,
        "patient": {
            "id": str(patient_doc.get("_id")),
            "name": patient_doc.get("name", patient_name),
            "email": patient_doc.get("email", ""),
        },
    }


@app.get("/patients/search")
async def search_patients(query: str = "", current_user: dict = Depends(get_current_user)):
    if not mongo_available:
        raise HTTPException(status_code=503, detail="MongoDB is unavailable")

    if (current_user.get("role") or "").lower() != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can search patients")

    matches = _search_patients_by_name(query, limit=8)
    return {
        "status": "success",
        "patients": [
            {
                "id": str(item.get("_id")),
                "name": item.get("name", ""),
                "email": item.get("email", ""),
            }
            for item in matches
        ],
    }


@app.get("/consultations/history")
@app.get("/consultation/history")
async def get_consultation_history(
    limit: int = 100,
    current_user: dict = Depends(get_current_user),
):
    if not mongo_available:
        raise HTTPException(status_code=503, detail="MongoDB is unavailable")

    if (current_user.get("role") or "").lower() != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can view consultation history")

    normalized_limit = max(1, min(int(limit or 100), 500))

    try:
        records = list(
            consultations_collection.find({}, {"_id": 0}).sort("created_at", -1).limit(normalized_limit)
        )
    except PyMongoError:
        raise HTTPException(status_code=503, detail="Failed to fetch consultation history from MongoDB")

    return {
        "status": "success",
        "consultations": records,
        "total": len(records),
        "source": "mongodb",
    }


@app.get("/dashboard/doctor-overview")
async def doctor_dashboard_overview():
    """
    Dynamic dashboard overview data for doctor home page.
    """
    _seed_dashboard_records_once()

    recent = _load_recent_records(8)
    total_patients_today = _count_today_records()
    active_consultations = sum(1 for r in recent if r.get("status") == "processing")
    high_alerts = sum(1 for r in recent if r.get("triage_level") == "HIGH")
    recent_diagnoses = [
        {
            "patient": item.get("patient", "Unknown Patient"),
            "diagnosis": item.get("diagnosis", "Assessment pending"),
            "icd": item.get("icd", "Not Found"),
            "time": _time_ago(item.get("created_at", "")),
            "status": item.get("status", "completed"),
            "confidence": int(item.get("confidence") or 0),
        }
        for item in recent
    ]

    return {
        "status": "success",
        "stats": {
            "total_patients_today": total_patients_today,
            "active_consultations": active_consultations,
            "ai_alerts": high_alerts,
            "recent_diagnoses": len(recent_diagnoses),
        },
        "recent_diagnoses": recent_diagnoses,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
