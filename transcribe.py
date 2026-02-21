from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
import tempfile
import torch
import os

app = FastAPI()

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8080",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

device = "cuda" if torch.cuda.is_available() else "cpu"
model = WhisperModel("small", device=device)


CONTENT_TYPE_TO_SUFFIX = {
    "audio/wav": ".wav",
    "audio/x-wav": ".wav",
    "audio/mpeg": ".mp3",
    "audio/mp3": ".mp3",
    "audio/webm": ".webm",
    "audio/ogg": ".ogg",
}


def _resolve_audio_suffix(filename: str | None, content_type: str | None) -> str:
    if filename and "." in filename:
        ext = os.path.splitext(filename)[1].lower()
        if ext:
            return ext

    if content_type:
        normalized = content_type.split(";")[0].strip().lower()
        if normalized in CONTENT_TYPE_TO_SUFFIX:
            return CONTENT_TYPE_TO_SUFFIX[normalized]

    return ".wav"


def transcribe_audio_bytes(audio_bytes: bytes, filename: str | None = None, content_type: str | None = None) -> dict:
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Audio payload is empty")

    suffix = _resolve_audio_suffix(filename, content_type)
    temp_audio_path = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_audio:
            temp_audio.write(audio_bytes)
            temp_audio_path = temp_audio.name

        segments, info = model.transcribe(temp_audio_path)
        transcript = " ".join([segment.text for segment in segments]).strip()

        return {
            "transcript": transcript,
            "language": info.language if hasattr(info, "language") else "en",
            "language_probability": info.language_probability if hasattr(info, "language_probability") else 1.0,
        }
    finally:
        if temp_audio_path and os.path.exists(temp_audio_path):
            os.unlink(temp_audio_path)

@app.post("/speech-to-text")
async def transcribe(file: UploadFile = File(...)):
    audio_bytes = await file.read()
    return transcribe_audio_bytes(audio_bytes, file.filename, file.content_type)