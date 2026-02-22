/**
 * API Service for communicating with the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function getErrorMessage(response, fallbackMessage) {
  try {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return data.detail || data.message || fallbackMessage;
    }
    const text = await response.text();
    return text || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

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
    throw new Error(await getErrorMessage(response, 'Transcription failed'));
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
    throw new Error(await getErrorMessage(response, 'Pipeline processing failed'));
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
    throw new Error(await getErrorMessage(response, 'Entity extraction failed'));
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
    throw new Error(await getErrorMessage(response, 'Analysis failed'));
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

export async function saveConsultationRecord({ patientName, transcript, clinicalData, status = 'completed', sessionId = '' }) {
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
      session_id: sessionId,
    }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Failed to save consultation record'));
  }

  const data = await response.json();

  return data;
}

export async function startConsultationSession({ patientName, token }) {
  const response = await fetch(`${API_BASE_URL}/consultations/start`, {
    method: 'POST',
    headers: withAuthHeaders(token, {
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ patient_name: patientName }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Failed to start consultation session'));
  }

  const data = await response.json();

  return data;
}

export async function searchPatientsByName({ query, token }) {
  const params = new URLSearchParams({ query: query || '' });
  const response = await fetch(`${API_BASE_URL}/patients/search?${params.toString()}`, {
    headers: withAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Failed to search patients'));
  }

  const data = await response.json();

  return data;
}

export async function fetchDoctorDashboardOverview() {
  const response = await fetch(`${API_BASE_URL}/dashboard/doctor-overview`);
  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Failed to fetch doctor dashboard overview'));
  }

  const data = await response.json();

  return data;
}

export async function generateEmrFromTranscript({ transcript, patientName = '', sessionId = '', persistRecord = true, status = 'completed' }) {
  const response = await fetch(`${API_BASE_URL}/emr/from-transcript`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transcript,
      patient_name: patientName,
      session_id: sessionId,
      persist_record: persistRecord,
      status,
    }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Failed to generate EMR from transcript'));
  }

  return response.json();
}

export async function fetchConsultationHistory({ token, limit = 100 } = {}) {
  const params = new URLSearchParams({ limit: String(limit || 100) });
  const response = await fetch(`${API_BASE_URL}/consultations/history?${params.toString()}`, {
    headers: withAuthHeaders(token),
  });

  if (response.ok) {
    return response.json();
  }

  if (response.status !== 404) {
    throw new Error(await getErrorMessage(response, 'Failed to fetch consultation history'));
  }

  const dashboardResponse = await fetch(`${API_BASE_URL}/dashboard/doctor-overview`, {
    headers: withAuthHeaders(token),
  });

  if (!dashboardResponse.ok) {
    throw new Error(await getErrorMessage(response, 'Failed to fetch consultation history'));
  }

  const dashboardData = await dashboardResponse.json();
  const recent = Array.isArray(dashboardData?.recent_diagnoses) ? dashboardData.recent_diagnoses : [];

  const consultations = recent.map((item, index) => ({
    id: `DASH-${index + 1}`,
    patient: item?.patient || 'Unknown Patient',
    diagnosis: item?.diagnosis || 'Assessment pending',
    icd: item?.icd || 'Not Found',
    confidence: Number(item?.confidence || 0),
    status: item?.status || 'completed',
    created_at: new Date().toISOString(),
    triage_level: 'LOW',
    clinical_data: {},
    emr: {},
  }));

  return {
    status: 'success',
    consultations,
    total: consultations.length,
    source: 'dashboard-fallback',
  };
}
