/**
 * API Service for communicating with the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function withAuthHeaders(token, headers = {}) {
  if (!token) return headers;
  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
}

export async function signupUser({ name, email, password, role }) {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password, role }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Signup failed');
  }

  return data;
}

export async function loginUser({ email, password }) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Login failed');
  }

  return data;
}

export async function fetchCurrentUser(token) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: withAuthHeaders(token),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Session validation failed');
  }

  return data;
}

/**
 * Transcribe audio file to text
 * @param {File} audioFile - The audio file to transcribe
 * @param {string} startingSpeaker - Expected first speaker for this chunk
 * @returns {Promise<{transcript: string, language: string, language_probability: number}>}
 */
export async function transcribeAudio(audioFile, startingSpeaker = 'Doctor') {
  const formData = new FormData();
  formData.append('file', audioFile);
  formData.append('starting_speaker', startingSpeaker);

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
 * Extract clinical entities from transcript using backend pretrained model
 * @param {string} transcript - Raw consultation transcript text
 * @returns {Promise<{symptoms: string[], duration: string, severity: string, vitals: Object, history: string[], medications: string[], allergies: string[]}>}
 */
export async function extractClinicalEntities(transcript) {
  const response = await fetch(`${API_BASE_URL}/extract-clinical-entities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ transcript }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Entity extraction failed');
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

export async function saveConsultationRecord({ patientName, transcript, clinicalData, status = 'completed' }) {
  const response = await fetch(`${API_BASE_URL}/consultations/record`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      patient_name: patientName,
      transcript,
      clinical_data: clinicalData,
      status,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to save consultation record');
  }

  return data;
}

export async function fetchDoctorDashboardOverview() {
  const response = await fetch(`${API_BASE_URL}/dashboard/doctor-overview`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch doctor dashboard overview');
  }

  return data;
}
