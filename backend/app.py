"""
Backend API - Integrates speech-to-text transcription with clinical pipeline
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
import torch
import os
import sys
from datetime import datetime, timedelta, timezone
from typing import Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError, PyMongoError

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from aegis_s3.backend.models.clinical_data import create_clinical_data
from aegis_s3.backend.pipeline import ClinicalPipeline
from transcribe import transcribe_audio_bytes
from pretrained_entity_extractor import extract_entities_with_pretrained_model

app = FastAPI(title="CavistaMed AI API", version="1.0.0")

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB = os.getenv("MONGODB_DB", "cavistamed_ai")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))

mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=3000)
db = mongo_client[MONGODB_DB]
users_collection = db["users"]
mongo_available = True
try:
    mongo_client.admin.command("ping")
    users_collection.create_index("email", unique=True)
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


def _seed_dashboard_records_once():
    global dashboard_seeded
    if dashboard_seeded or consultation_records:
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
        consultation_records.append(record)

    dashboard_seeded = True


@app.get("/")
async def root():
    return {"message": "CavistaMed AI API is running", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "whisper_device": device}


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
    file: UploadFile = File(None),
    transcript: str = None,
    clinical_data: dict = None
):
    """
    Complete pipeline: Audio/Transcript → Clinical Analysis
    """
    try:
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
        if clinical_data:
            pipeline_result = clinical_pipeline.process_patient_data(clinical_data)

        return {
            "transcript": final_transcript,
            "pipeline_result": pipeline_result
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")


@app.post("/consultations/record")
async def create_consultation_record(payload: dict):
    """
    Persist a generated consultation record and ensure ICD mapping is produced by ClinicalPipeline.
    """
    try:
        patient_name = str((payload or {}).get("patient_name") or "Unknown Patient").strip()
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

        consultation_records.insert(0, record)
        if len(consultation_records) > 200:
            consultation_records.pop()

        return {"status": "success", "record": record}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Record creation failed: {str(e)}")


@app.get("/dashboard/doctor-overview")
async def doctor_dashboard_overview():
    """
    Dynamic dashboard overview data for doctor home page.
    """
    _seed_dashboard_records_once()

    now = datetime.now(timezone.utc)
    start_of_day = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
    today_records = [r for r in consultation_records if datetime.fromisoformat(r["created_at"].replace("Z", "+00:00")) >= start_of_day]

    active_consultations = sum(1 for r in consultation_records if r.get("status") == "processing")
    high_alerts = sum(1 for r in consultation_records if r.get("triage_level") == "HIGH")

    recent = consultation_records[:8]
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
            "total_patients_today": len(today_records),
            "active_consultations": active_consultations,
            "ai_alerts": high_alerts,
            "recent_diagnoses": len(recent_diagnoses),
        },
        "recent_diagnoses": recent_diagnoses,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
