/**
 * API Service for communicating with the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Transcribe audio file to text
 * @param {File} audioFile - The audio file to transcribe
 * @returns {Promise<{transcript: string, language: string, language_probability: number}>}
 */
export async function transcribeAudio(audioFile) {
  const formData = new FormData();
  formData.append('file', audioFile);

  const response = await fetch(`${API_BASE_URL}/speech-to-text`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Transcription failed');
  }

  return response.json();
}

/**
 * Process clinical data through the AI pipeline
 * @param {Object} clinicalData - Clinical data dictionary
 * @returns {Promise<Object>} - Pipeline result with EMR, triage, and patient summary
 */
export async function processClinicalData(clinicalData) {
  const response = await fetch(`${API_BASE_URL}/process-clinical-data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(clinicalData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Pipeline processing failed');
  }

  return response.json();
}

/**
 * Complete analysis: Audio/Transcript → Clinical Analysis
 * @param {File} audioFile - Optional audio file
 * @param {string} transcript - Optional transcript text
 * @param {Object} clinicalData - Optional clinical data
 * @returns {Promise<Object>} - Transcript and pipeline result
 */
export async function analyzeConsultation(audioFile = null, transcript = null, clinicalData = null) {
  const formData = new FormData();
  
  if (audioFile) {
    formData.append('file', audioFile);
  }
  if (transcript) {
    formData.append('transcript', transcript);
  }
  if (clinicalData) {
    formData.append('clinical_data', JSON.stringify(clinicalData));
  }

  const response = await fetch(`${API_BASE_URL}/analyze-consultation`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Analysis failed');
  }

  return response.json();
}

/**
 * Check API health status
 * @returns {Promise<{status: string, whisper_device: string}>}
 */
export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
}
