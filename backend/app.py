"""
Backend API - Integrates speech-to-text transcription with clinical pipeline
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import torch
import os
import sys

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from aegis_s3.backend.models.clinical_data import create_clinical_data
from aegis_s3.backend.pipeline import ClinicalPipeline
from transcribe import transcribe_audio_bytes

app = FastAPI(title="CavistaMed AI API", version="1.0.0")

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8080",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
]

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize runtime device info
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

# Initialize clinical pipeline
clinical_pipeline = ClinicalPipeline()


@app.get("/")
async def root():
    return {"message": "CavistaMed AI API is running", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "whisper_device": device}


@app.post("/speech-to-text")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Transcribe audio file to text using Faster Whisper
    """
    try:
        audio_bytes = await file.read()
        return transcribe_audio_bytes(audio_bytes, file.filename, file.content_type)

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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
