import json
import re
from urllib import request, error

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "meditron:latest"


def _safe_unique(items):
    return list(dict.fromkeys([str(item).strip() for item in (items or []) if str(item).strip()]))


def _heuristic_fallback(transcript: str) -> dict:
    text = transcript or ""
    normalized = text.lower()

    symptoms_map = [
        "chest pain", "sweating", "nausea", "weakness", "facial droop", "slurred speech",
        "headache", "dizziness", "frequent urination", "excessive thirst", "wheezing",
        "shortness of breath", "fever", "cough", "body ache", "fatigue", "diarrhea",
        "vomiting", "abdominal pain", "heartburn", "acid reflux", "palpitations",
    ]
    history_map = [
        "hypertension", "high blood pressure", "diabetes", "asthma", "stroke", "heart disease",
    ]

    symptoms = [item for item in symptoms_map if item in normalized]
    history = [item for item in history_map if item in normalized]

    bp = re.search(r"\b(\d{2,3})\s*(?:\/|over)\s*(\d{2,3})\b", text, re.I)
    hr = re.search(r"(?:heart rate|hr|pulse)\s*(?:is|of|:)?\s*(\d{2,3})\b", text, re.I)

    vitals = {}
    if bp:
        vitals["blood_pressure"] = f"{bp.group(1)}/{bp.group(2)}"
        vitals["systolic_bp"] = int(bp.group(1))
        vitals["diastolic_bp"] = int(bp.group(2))
    if hr:
        vitals["heart_rate"] = int(hr.group(1))

    return {
        "transcript": text.strip(),
        "symptoms": _safe_unique(symptoms),
        "duration": "Not specified",
        "severity": "Not specified",
        "vitals": vitals,
        "history": _safe_unique(history),
        "medications": [],
        "allergies": ["NKDA"] if "nkda" in normalized or "no known drug allergies" in normalized else [],
    }


def _extract_json_object(text: str) -> dict | None:
    if not text:
        return None

    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None

    json_candidate = text[start:end + 1]
    try:
        return json.loads(json_candidate)
    except Exception:
        return None


def extract_entities_with_pretrained_model(transcript: str) -> dict:
    transcript = (transcript or "").strip()
    if not transcript:
        return _heuristic_fallback(transcript)

    prompt = f"""
You are a clinical NLP entity extraction assistant.
Extract entities from this consultation transcript and return ONLY valid JSON with this exact schema:
{{
  "transcript": "string",
  "symptoms": ["string"],
  "duration": "string",
  "severity": "string",
  "vitals": {{
    "blood_pressure": "string",
    "systolic_bp": 0,
    "diastolic_bp": 0,
    "heart_rate": 0,
    "temperature": 0,
    "SpO2": 0,
    "respiratory_rate": 0,
    "weight": "string"
  }},
  "history": ["string"],
  "medications": ["string"],
  "allergies": ["string"]
}}
Rules:
- If unknown, keep empty arrays or omit unknown vital fields.
- Keep terms concise and medical.
- Do not include markdown fences, explanation, or extra text.

Transcript:
{transcript}
""".strip()

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
    }

    req = request.Request(
        OLLAMA_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with request.urlopen(req, timeout=20) as response:
            body = response.read().decode("utf-8")
        parsed = json.loads(body)
        model_text = parsed.get("response", "")
        extracted = _extract_json_object(model_text)

        if not extracted:
            return _heuristic_fallback(transcript)

        return {
            "transcript": extracted.get("transcript") or transcript,
            "symptoms": _safe_unique(extracted.get("symptoms", [])),
            "duration": extracted.get("duration") or "Not specified",
            "severity": extracted.get("severity") or "Not specified",
            "vitals": extracted.get("vitals") or {},
            "history": _safe_unique(extracted.get("history", [])),
            "medications": _safe_unique(extracted.get("medications", [])),
            "allergies": _safe_unique(extracted.get("allergies", [])),
        }
    except (TimeoutError, error.URLError, json.JSONDecodeError, KeyError):
        return _heuristic_fallback(transcript)
