from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
import tempfile
import torch
import os
import re
from functools import lru_cache

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


@lru_cache(maxsize=1)
def _get_whisper_model() -> WhisperModel:
    return WhisperModel("small", device=device)


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


def _normalize_speaker(value: str | None, fallback: str = "Doctor") -> str:
    if not value:
        return fallback
    lowered = value.strip().lower()
    if lowered == "patient":
        return "Patient"
    return "Doctor"


def split_transcript_into_turns(transcript: str, starting_speaker: str = "Doctor") -> tuple[list[dict], str]:
    if not transcript or not transcript.strip():
        return [], _normalize_speaker(starting_speaker, "Doctor")

    cleaned = re.sub(r"\s+", " ", transcript).strip()
    normalized_start = _normalize_speaker(starting_speaker, "Doctor")

    labeled_regex = re.compile(r"(Doctor|Patient)\s*:\s*", re.IGNORECASE)
    labeled_matches = list(labeled_regex.finditer(cleaned))

    if labeled_matches:
        turns = []
        for index, match in enumerate(labeled_matches):
            next_match = labeled_matches[index + 1] if index + 1 < len(labeled_matches) else None
            speaker = _normalize_speaker(match.group(1), "Patient")
            start_idx = match.end()
            end_idx = next_match.start() if next_match else len(cleaned)
            text = cleaned[start_idx:end_idx].strip()
            if text:
                turns.append({"speaker": speaker, "text": text})

        next_speaker = normalized_start
        if turns:
            next_speaker = "Patient" if turns[-1]["speaker"] == "Doctor" else "Doctor"
        return turns, next_speaker

    chunks = re.findall(r"[^.!?]+[.!?]+|[^.!?]+$", cleaned)
    if not chunks:
        chunks = [cleaned]

    turns = []
    active_speaker = normalized_start
    for chunk in chunks:
        text = chunk.strip()
        if not text:
            continue

        turns.append({"speaker": active_speaker, "text": text})

        is_question = "?" in text
        word_count = len(text.split())
        if not is_question and word_count > 16:
            continue

        active_speaker = "Patient" if active_speaker == "Doctor" else "Doctor"

    return turns, active_speaker


def transcribe_audio_bytes(
    audio_bytes: bytes,
    filename: str | None = None,
    content_type: str | None = None,
    starting_speaker: str = "Doctor",
) -> dict:
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Audio payload is empty")

    suffix = _resolve_audio_suffix(filename, content_type)
    temp_audio_path = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_audio:
            temp_audio.write(audio_bytes)
            temp_audio_path = temp_audio.name

        model = _get_whisper_model()
        segments, info = model.transcribe(temp_audio_path)
        transcript = " ".join([segment.text for segment in segments]).strip()

        turns, next_speaker = split_transcript_into_turns(transcript, starting_speaker)

        return {
            "transcript": transcript,
            "language": info.language if hasattr(info, "language") else "en",
            "language_probability": info.language_probability if hasattr(info, "language_probability") else 1.0,
            "turns": turns,
            "next_speaker": next_speaker,
        }
    finally:
        if temp_audio_path and os.path.exists(temp_audio_path):
            os.unlink(temp_audio_path)

@app.post("/speech-to-text")
async def transcribe(file: UploadFile = File(...), starting_speaker: str = Form("Doctor")):
    audio_bytes = await file.read()
    return transcribe_audio_bytes(audio_bytes, file.filename, file.content_type, starting_speaker)