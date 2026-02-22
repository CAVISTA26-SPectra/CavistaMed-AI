import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { transcribeAudio, processClinicalData, extractClinicalEntities, saveConsultationRecord, startConsultationSession, searchPatientsByName } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, FilePlus, Users, ClipboardList, Brain, Settings,
  Mic, MicOff, FileText, Download, Send, ChevronDown, ChevronRight,
  AlertTriangle, CheckCircle, Activity, Heart, Thermometer, Wind,
  Stethoscope, Pill, Clock, Shield, User, Loader2
} from "lucide-react";

const sidebarItems = [
  { label: "Dashboard Overview", path: "/doctor", icon: LayoutDashboard },
  { label: "New Consultation", path: "/doctor/consultation", icon: FilePlus },
  { label: "My Patients", path: "/doctor/patients", icon: Users },
  { label: "Consultation History", path: "/doctor/history", icon: ClipboardList },
  { label: "AI Insights", path: "/doctor/insights", icon: Brain },
  { label: "Settings", path: "/doctor/settings", icon: Settings },
];

const defaultEmrSections = [
  { key: "complaint", title: "Chief Complaint", icon: Stethoscope, content: "Not generated yet" },
  { key: "hpi", title: "History of Present Illness", icon: Clock, content: "Not generated yet" },
  { key: "pmh", title: "Past Medical History", icon: FileText, content: "Not generated yet" },
  { key: "medications", title: "Current Medications", icon: Pill, content: "Not generated yet" },
  { key: "allergies", title: "Allergies", icon: AlertTriangle, content: "Not generated yet" },
  { key: "vitals", title: "Vital Signs", icon: Activity, content: "Not generated yet" },
  { key: "assessment", title: "Clinical Assessment", icon: Brain, content: "Not generated yet" },
  { key: "plan", title: "Treatment Plan", icon: CheckCircle, content: "Not generated yet" },
];

const defaultDiagnoses = [];

const defaultTreatments = [];

const uniqueItems = (items) => [...new Set((items || []).map((item) => String(item).trim()).filter(Boolean))];

const splitConditions = (value) => value
  .split(/,| and /i)
  .map((part) => part.trim())
  .filter(Boolean);

const formatList = (items, empty = "Not documented") => (
  items && items.length ? items.map((item) => `• ${item}`).join("\n") : empty
);

const toTitle = (value) => value
  .split(" ")
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(" ");

const extractClinicalDataFromTranscript = (lines) => {
  const transcriptText = lines.map((line) => line.text).join(" ").trim();
  const normalized = transcriptText.toLowerCase();

  const symptomKeywords = [
    "chest pain", "sweating", "nausea", "weakness", "facial droop", "slurred speech",
    "headache", "dizziness", "frequent urination", "excessive thirst", "wheezing",
    "shortness of breath", "fever", "cough", "body ache", "fatigue", "sensitivity to light",
    "diarrhea", "vomiting", "abdominal pain", "burning sensation", "heartburn", "acid reflux",
    "high blood pressure", "blurred vision", "chills", "palpitations"
  ];

  const historyKeywords = [
    "hypertension", "high blood pressure", "diabetes", "asthma", "stroke", "heart disease",
    "kidney disease", "thyroid", "migraine"
  ];
  const medicationKeywords = [
    "lisinopril", "amlodipine", "metformin", "aspirin", "ibuprofen", "omeprazole", "albuterol", "paracetamol"
  ];

  const symptoms = symptomKeywords.filter((keyword) => normalized.includes(keyword));
  const history = [...historyKeywords.filter((keyword) => normalized.includes(keyword))];

  const historyPatterns = [
    /history of ([a-z0-9,\-\s]+)/gi,
    /known case of ([a-z0-9,\-\s]+)/gi,
    /diagnosed with ([a-z0-9,\-\s]+)/gi,
  ];
  historyPatterns.forEach((pattern) => {
    const matches = transcriptText.matchAll(pattern);
    for (const match of matches) {
      const captured = match?.[1];
      if (captured) {
        splitConditions(captured).forEach((condition) => history.push(condition.toLowerCase()));
      }
    }
  });

  const medications = [];
  const medicationRegex = /(lisinopril|amlodipine|metformin|aspirin|ibuprofen|omeprazole|albuterol|paracetamol|acetaminophen|nitroglycerin|ondansetron)(?:\s+(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml))?/gi;
  for (const match of transcriptText.matchAll(medicationRegex)) {
    const name = toTitle((match[1] || "").toLowerCase());
    const dose = match[2] && match[3] ? ` ${match[2]}${match[3]}` : "";
    medications.push(`${name}${dose}`.trim());
  }
  medicationKeywords
    .filter((keyword) => normalized.includes(keyword))
    .forEach((keyword) => medications.push(toTitle(keyword)));

  const durationMatch = transcriptText.match(/\b(\d+\s*(?:day|days|week|weeks|month|months|hour|hours))\b/i);
  const severityMatch = transcriptText.match(/\b(\d{1,2}\s*(?:\/|out of)\s*10)\b/i);
  const bpMatch = transcriptText.match(/\b(\d{2,3})\s*(?:\/|over)\s*(\d{2,3})\b/i);
  const hrMatch = transcriptText.match(/(?:heart rate|hr|pulse)\s*(?:is|of|:)?\s*(\d{2,3})\b/i);
  const tempMatch = transcriptText.match(/(?:temp(?:erature)?)\s*(?:is|of|:)?\s*(\d{2,3}(?:\.\d+)?)\b/i);
  const spo2Match = transcriptText.match(/(?:spo2|oxygen saturation)\s*(?:is|of|:)?\s*(\d{2,3})\b/i);
  const rrMatch = transcriptText.match(/(?:respiratory rate|rr)\s*(?:is|of|:)?\s*(\d{1,2})\b/i);
  const weightMatch = transcriptText.match(/(?:weight)\s*(?:is|of|:)?\s*(\d{2,3}(?:\.\d+)?)\s*(kg|kilograms|lbs|pounds)?\b/i);

  const allergies = [];
  if (normalized.includes("nkda") || normalized.includes("no known drug allergies")) {
    allergies.push("NKDA");
  }
  const allergyMatch = transcriptText.match(/allergic to ([a-z0-9,\s-]+)/i);
  if (allergyMatch?.[1]) {
    splitConditions(allergyMatch[1]).forEach((item) => allergies.push(item));
  }

  const vitals = {};
  if (bpMatch) {
    vitals.blood_pressure = `${bpMatch[1]}/${bpMatch[2]}`;
    vitals.systolic_bp = Number(bpMatch[1]);
    vitals.diastolic_bp = Number(bpMatch[2]);
  }
  if (hrMatch) {
    vitals.heart_rate = Number(hrMatch[1]);
  }
  if (tempMatch) {
    vitals.temperature = Number(tempMatch[1]);
  }
  if (spo2Match) {
    vitals.SpO2 = Number(spo2Match[1]);
  }
  if (rrMatch) {
    vitals.respiratory_rate = Number(rrMatch[1]);
  }
  if (weightMatch) {
    const unit = weightMatch[2] ? ` ${weightMatch[2]}` : "";
    vitals.weight = `${weightMatch[1]}${unit}`.trim();
  }

  if (normalized.includes("high blood pressure") && !history.includes("high blood pressure")) {
    history.push("high blood pressure");
  }

  const finalSymptoms = uniqueItems(symptoms);
  const finalHistory = uniqueItems(history);
  const finalMedications = uniqueItems(medications);
  const finalAllergies = uniqueItems(allergies);

  return {
    transcriptText,
    clinicalData: {
      symptoms: finalSymptoms,
      duration: durationMatch ? durationMatch[1] : "Not specified",
      severity: severityMatch ? severityMatch[1].replace(/\s+/g, "") : "Not specified",
      vitals,
      history: finalHistory,
      medications: finalMedications,
      allergies: finalAllergies,
    },
  };
};

const createMandatoryEmrReportText = (report) => {
  if (!report) return "";

  const lines = [
    "CavistaMed AI - EMR Report",
    `Generated On: ${new Date(report.generatedAt).toLocaleString()}`,
    "",
    "1. Chief Complaint",
    report.chiefComplaint || "Not documented",
    "",
    "2. History of Present Illness",
    report.hpi || "Not documented",
    "",
    "3. Past Medical History",
    (report.pastMedicalHistory?.length ? report.pastMedicalHistory.map((item) => `- ${item}`).join("\n") : "Not documented"),
    "",
    "4. Current Medications",
    (report.currentMedications?.length ? report.currentMedications.map((item) => `- ${item}`).join("\n") : "Not documented"),
    "",
    "5. Allergies",
    (report.allergies?.length ? report.allergies.join(", ") : "Not documented"),
    "",
    "6. Vital Signs",
    (report.vitalsSummary || "Not documented"),
    "",
    "7. Assessment and ICD",
    report.assessment || "Not documented",
    (report.diagnoses?.length ? report.diagnoses.map((d) => `- ${d.name} (${d.icd})`).join("\n") : "No mapped ICD diagnosis"),
    "",
    "8. Treatment Plan",
    (report.treatmentPlan?.length ? report.treatmentPlan.map((item, index) => `${index + 1}. ${item}`).join("\n") : "Not documented"),
    "",
    "9. Triage",
    `${report.triageLevel || "LOW"} - ${report.triageReason || "Routine follow-up"}`,
  ];

  return lines.join("\n");
};

const buildPatientSummaryText = (summary) => {
  if (!summary || typeof summary !== "object") {
    return "Summary will appear after EMR generation from transcript.";
  }

  const recommended = Array.isArray(summary.recommended_actions) ? summary.recommended_actions : [];
  const medications = Array.isArray(summary.medications) ? summary.medications : [];

  const parts = [
    summary.what_it_means,
    recommended.length ? `Recommended actions: ${recommended.join("; ")}.` : "",
    medications.length ? `Medicines: ${medications.join(" ")}` : "",
    summary.emergency_note,
  ].filter(Boolean);

  return parts.join(" ");
};

const NewConsultation = () => {
  const { token } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [consultationSessionId, setConsultationSessionId] = useState("");
  const [lockedPatientName, setLockedPatientName] = useState("");
  const [patientSuggestions, setPatientSuggestions] = useState([]);
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);
  const [expandedSections, setExpandedSections] = useState(["complaint", "vitals", "assessment", "plan"]);
  const [transcriptLines, setTranscriptLines] = useState([]);
  const [emrSections, setEmrSections] = useState(defaultEmrSections);
  const [diagnoses, setDiagnoses] = useState(defaultDiagnoses);
  const [treatments, setTreatments] = useState(defaultTreatments);
  const [patientSummaryText, setPatientSummaryText] = useState(
    "Summary will appear after EMR generation from transcript."
  );
  const [generatedReport, setGeneratedReport] = useState(null);
  const [triageInfo, setTriageInfo] = useState({
    triage_level: "LOW",
    reasoning: "Generate EMR to view triage reasoning.",
  });
  const [hasLiveTranscript, setHasLiveTranscript] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioMimeTypeRef = useRef("audio/webm");

  useEffect(() => {
    if (consultationSessionId) {
      setPatientSuggestions([]);
      setShowPatientSuggestions(false);
      return;
    }

    const query = patientName.trim();
    if (!query || !token) {
      setPatientSuggestions([]);
      return;
    }

    let isActive = true;
    const timeoutId = setTimeout(async () => {
      try {
        setIsSearchingPatients(true);
        const response = await searchPatientsByName({ query, token });
        if (!isActive) return;
        setPatientSuggestions(Array.isArray(response?.patients) ? response.patients : []);
        setShowPatientSuggestions(true);
      } catch {
        if (!isActive) return;
        setPatientSuggestions([]);
      } finally {
        if (isActive) setIsSearchingPatients(false);
      }
    }, 250);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [patientName, token, consultationSessionId]);

  const getSupportedAudioMimeType = () => {
    const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg", "audio/mp4"];
    if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) {
      return "audio/webm";
    }
    return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "audio/webm";
  };

  const mimeTypeToExtension = (mimeType) => {
    const normalized = (mimeType || "").split(";")[0];
    if (normalized === "audio/ogg") return "ogg";
    if (normalized === "audio/mp4") return "mp4";
    if (normalized === "audio/mpeg") return "mp3";
    if (normalized === "audio/wav") return "wav";
    return "webm";
  };

  const toggleSection = (key) => {
    setExpandedSections(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const startRecording = async () => {
    try {
      setError(null);

      const normalizedPatientName = patientName.trim();
      if (!normalizedPatientName) {
        setError("Please enter patient name before starting recording.");
        return;
      }

      if (!consultationSessionId) {
        setIsStartingSession(true);
        const session = await startConsultationSession({
          patientName: normalizedPatientName,
          token,
        });
        setConsultationSessionId(session?.session_id || "");
        setLockedPatientName(session?.patient?.name || normalizedPatientName);
      }

      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const supportedMimeType = getSupportedAudioMimeType();
      audioMimeTypeRef.current = supportedMimeType;
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: supportedMimeType });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: audioMimeTypeRef.current });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start(300);
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError(err.message || "Could not access microphone. Please check permissions.");
    } finally {
      setIsStartingSession(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const selectPatient = (patient) => {
    setPatientName(patient?.name || "");
    setShowPatientSuggestions(false);
    setError(null);
  };

  const processAudio = async (audioBlob) => {
    setIsProcessing(true);
    setError(null);

    try {
      if (!audioBlob || audioBlob.size === 0) {
        throw new Error("No audio captured. Please record again.");
      }

      const extension = mimeTypeToExtension(audioMimeTypeRef.current);
      const fileType = (audioMimeTypeRef.current || "audio/webm").split(";")[0];
      const audioFile = new File([audioBlob], `recording.${extension}`, { type: fileType });
      const result = await transcribeAudio(audioFile);
      const rawTranscript = typeof result.transcript === "string" ? result.transcript.trim() : "";

      if (!rawTranscript) {
        throw new Error("No speech recognized from recording. Please speak clearly and try again.");
      }

      const rawLine = { speaker: "Transcript", text: rawTranscript };
      setTranscriptLines((prev) => (hasLiveTranscript ? [...prev, rawLine] : [rawLine]));
      setHasLiveTranscript(true);

    } catch (err) {
      console.error("Error processing audio:", err);
      setError(err.message || "Failed to process audio");
    } finally {
      setIsProcessing(false);
    }
  };

  const generateEMR = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      if (!hasLiveTranscript || !transcriptLines.length) {
        throw new Error("Please record and transcribe consultation before generating EMR.");
      }

      const transcriptText = transcriptLines.map((line) => line.text).join(" ").trim();
      if (!transcriptText) {
        throw new Error("No transcript available for EMR generation.");
      }

      let extracted = null;
      try {
        extracted = await extractClinicalEntities(transcriptText);
      } catch (extractErr) {
        console.warn("Pretrained entity extraction unavailable, using local fallback:", extractErr);
      }

      const fallback = extractClinicalDataFromTranscript(transcriptLines);
      const clinicalData = {
        symptoms: (extracted?.symptoms && extracted.symptoms.length ? extracted.symptoms : fallback.clinicalData.symptoms) || [],
        duration: extracted?.duration || fallback.clinicalData.duration,
        severity: extracted?.severity || fallback.clinicalData.severity,
        vitals: (extracted?.vitals && Object.keys(extracted.vitals).length ? extracted.vitals : fallback.clinicalData.vitals) || {},
        history: (extracted?.history && extracted.history.length ? extracted.history : fallback.clinicalData.history) || [],
        medications: (extracted?.medications && extracted.medications.length ? extracted.medications : fallback.clinicalData.medications) || [],
        allergies: (extracted?.allergies && extracted.allergies.length ? extracted.allergies : fallback.clinicalData.allergies) || [],
      };

      const transcriptForReport = extracted?.transcript || transcriptText;
      if (!clinicalData.symptoms.length) {
        const firstSentence = transcriptForReport.split(/[.!?]/).map((s) => s.trim()).filter(Boolean)[0];
        if (firstSentence) {
          clinicalData.symptoms = [firstSentence.toLowerCase()];
        } else {
          throw new Error("No clinical details found in transcript. Please capture more consultation details.");
        }
      }

      const result = await processClinicalData(clinicalData);
      
      if (result.status === "success") {
        const emr = result.emr || {};
        const triage = result.triage || {};
        const patientSummary = result.patient_summary || {};

        const icdResults = Array.isArray(emr.icd_codes) ? emr.icd_codes : [];
        const diagnosisRows = icdResults.slice(0, 3).map((item) => {
          const confidence = Number(item.confidence || 0);
          return {
            name: item.diagnosis || "Unknown diagnosis",
            confidence,
            icd: item.icd_code || "Not Found",
            severity: confidence >= 80 ? "high" : confidence >= 50 ? "medium" : "low",
          };
        });

        const treatmentRows = [];
        const treatmentPlans = Array.isArray(emr.treatment_plan) ? emr.treatment_plan : [];
        treatmentPlans.forEach((plan) => {
          (plan.recommended_actions || []).forEach((action) => {
            treatmentRows.push({ text: action, type: "Action" });
          });
          (plan.medications || []).forEach((med) => {
            const doseText = med.dose ? ` ${med.dose}` : "";
            treatmentRows.push({ text: `${med.name || "Medication"}${doseText}`.trim(), type: "Medication" });
          });
        });

        const vitals = clinicalData.vitals || {};
        const vitalsText = [
          vitals.blood_pressure ? `BP: ${vitals.blood_pressure} mmHg` : "",
          vitals.heart_rate ? `HR: ${vitals.heart_rate} bpm` : "",
          vitals.temperature ? `Temp: ${vitals.temperature}°F` : "",
          vitals.SpO2 ? `SpO2: ${vitals.SpO2}%` : "",
          vitals.respiratory_rate ? `RR: ${vitals.respiratory_rate} breaths/min` : "",
          vitals.weight ? `Weight: ${vitals.weight}` : "",
        ].filter(Boolean).join("  |  ") || "Not recorded";

        setEmrSections((prev) => prev.map((section) => {
          if (section.key === "complaint") {
            return { ...section, content: emr.chief_complaint || clinicalData.symptoms[0] || "Not documented" };
          }
          if (section.key === "hpi") {
            return { ...section, content: transcriptForReport || "No transcript available" };
          }
          if (section.key === "pmh") {
            return { ...section, content: formatList(clinicalData.history, "No past history captured from transcript") };
          }
          if (section.key === "medications") {
            return { ...section, content: formatList(clinicalData.medications, "No current medications captured from transcript") };
          }
          if (section.key === "allergies") {
            return { ...section, content: clinicalData.allergies.length ? clinicalData.allergies.join(", ") : "NKDA / Not documented" };
          }
          if (section.key === "vitals") {
            return { ...section, content: vitalsText };
          }
          if (section.key === "assessment") {
            return { ...section, content: emr.assessment || triage.reasoning || "Assessment pending" };
          }
          if (section.key === "plan") {
            return {
              ...section,
              content: treatmentRows.length
                ? treatmentRows.map((item, index) => `${index + 1}. ${item.text} (${item.type})`).join("\n")
                : "No treatment recommendations generated",
            };
          }
          return section;
        }));

        if (diagnosisRows.length) {
          setDiagnoses(diagnosisRows);
        }
        if (treatmentRows.length) {
          setTreatments(treatmentRows);
        }
        setTriageInfo({
          triage_level: triage.triage_level || "LOW",
          reasoning: triage.reasoning || "Routine monitoring recommended.",
        });
        setPatientSummaryText(buildPatientSummaryText(patientSummary));

        try {
          await saveConsultationRecord({
            patientName: lockedPatientName || patientName,
            transcript: transcriptForReport,
            clinicalData,
            status: "completed",
            sessionId: consultationSessionId,
          });
        } catch (persistErr) {
          console.warn("Consultation generated but could not be persisted for dashboard overview:", persistErr);
          setError(persistErr?.message || "EMR generated, but MongoDB persistence failed.");
        }

        setGeneratedReport({
          generatedAt: new Date().toISOString(),
          chiefComplaint: emr.chief_complaint || clinicalData.symptoms[0] || "",
          hpi: transcriptForReport,
          pastMedicalHistory: clinicalData.history || [],
          currentMedications: clinicalData.medications || [],
          allergies: clinicalData.allergies || [],
          vitalsSummary: vitalsText,
          assessment: emr.assessment || "",
          diagnoses: diagnosisRows,
          treatmentPlan: treatmentRows.map((item) => `${item.text} (${item.type})`),
          triageLevel: triage.triage_level || "LOW",
          triageReason: triage.reasoning || "Routine monitoring recommended.",
        });
      } else {
        setError(result.error_message || "Failed to generate EMR");
      }

    } catch (err) {
      console.error("Error generating EMR:", err);
      setError(err.message || "Failed to generate EMR");
    } finally {
      setIsProcessing(false);
    }
  };

  const getSeverityColor = (s) => {
    if (s === "high") return "text-red-600 bg-red-50";
    if (s === "medium") return "text-amber-600 bg-amber-50";
    return "text-emerald-600 bg-emerald-50";
  };

  const topConfidence = diagnoses[0]?.confidence || 0;
  const triageBadgeClass = triageInfo.triage_level === "HIGH"
    ? "bg-red-50 text-red-600 border border-red-200"
    : triageInfo.triage_level === "MEDIUM"
      ? "bg-amber-50 text-amber-600 border border-amber-200"
      : "bg-emerald-50 text-emerald-600 border border-emerald-200";
  const triageHeadline = triageInfo.triage_level === "HIGH"
    ? "High-Risk Clinical Alert"
    : triageInfo.triage_level === "MEDIUM"
      ? "Moderate-Risk Clinical Alert"
      : "Routine Clinical Alert";

  const downloadEmrReport = () => {
    if (!generatedReport) {
      setError("Generate EMR first to download the report.");
      return;
    }

    const content = createMandatoryEmrReportText(generatedReport);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    link.href = url;
    link.download = `emr-report-${timestamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="New Consultation" subtitle="AI-Assisted Clinical Session">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">

        {/* ─── LEFT COLUMN — Live Consultation (4 cols) ─── */}
        <div className="lg:col-span-4 panel flex flex-col min-h-[calc(100vh-140px)]">
          {/* Header */}
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mic className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Live Consultation</h3>
                <p className="text-[10px] text-muted-foreground">Real-time transcription</p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold ${isRecording ? "bg-red-50 text-red-600 border border-red-200" : "bg-muted text-muted-foreground"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-muted-foreground"}`} />
              {isRecording ? "Recording" : "Idle"}
            </span>
          </div>

          <div className="px-4 sm:px-5 py-3 border-b border-border/50 space-y-2 relative">
            <label className="block text-xs font-semibold text-foreground">Patient Name</label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              onFocus={() => {
                if (!consultationSessionId && patientSuggestions.length) {
                  setShowPatientSuggestions(true);
                }
              }}
              onBlur={() => setTimeout(() => setShowPatientSuggestions(false), 120)}
              disabled={isRecording || Boolean(consultationSessionId)}
              placeholder="Enter registered patient name"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {!consultationSessionId && showPatientSuggestions && (patientSuggestions.length > 0 || isSearchingPatients) ? (
              <div className="absolute left-4 right-4 top-[72px] z-20 rounded-lg border border-border bg-background shadow-lg max-h-44 overflow-y-auto">
                {isSearchingPatients ? (
                  <div className="px-3 py-2 text-xs text-muted-foreground">Searching patients...</div>
                ) : (
                  patientSuggestions.map((patient) => (
                    <button
                      key={patient.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectPatient(patient)}
                      className="w-full text-left px-3 py-2 hover:bg-muted/40 transition-colors"
                    >
                      <p className="text-sm text-foreground font-medium">{patient.name}</p>
                      <p className="text-[11px] text-muted-foreground">{patient.email || "No email"}</p>
                    </button>
                  ))
                )}
              </div>
            ) : null}
            {consultationSessionId ? (
              <p className="text-[11px] text-emerald-600">Session linked for {lockedPatientName || patientName}</p>
            ) : (
              <p className="text-[11px] text-muted-foreground">Recording starts only if this patient exists in users DB.</p>
            )}
          </div>

          {/* Mic Button with wavy dots */}
          <div className="flex flex-col items-center py-6 sm:py-8 border-b border-border/50">
            {/* Mic Button */}
            <button
              onClick={toggleRecording}
              disabled={isProcessing || isStartingSession}
              className={`rounded-full flex items-center justify-center transition-all duration-500 ${isRecording
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                : "bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105"
                } ${(isProcessing || isStartingSession) ? "opacity-50 cursor-not-allowed" : ""}`}
              style={{ width: '72px', height: '72px' }}
            >
              {(isProcessing || isStartingSession) ? <Loader2 className="w-7 h-7 animate-spin" /> : isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            </button>

            {/* Horizontal wavy dots — visible when recording */}
            {isRecording ? (
              <div className="flex items-center justify-center gap-[5px] mt-5 h-8">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => {
                  const baseSize = [5, 6, 7, 8, 7, 8, 9, 8, 7, 8, 7, 6, 5][i];
                  return (
                    <div
                      key={i}
                      className="rounded-full"
                      style={{
                        width: `${baseSize}px`,
                        minWidth: `${baseSize}px`,
                        height: `${baseSize}px`,
                        backgroundColor: `hsl(355, 89%, ${38 + i * 2}%)`,
                        animation: 'wave-dot 1.2s ease-in-out infinite',
                        animationDelay: `${i * 0.08}s`,
                        boxShadow: `0 0 ${baseSize}px hsl(355, 89%, 42%, 0.3)`,
                      }}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-4">
                {isStartingSession ? "Validating patient in database..." : "Click to start recording"}
              </p>
            )}

            {isRecording && (
              <p className="text-[11px] text-primary font-medium mt-2 animate-pulse">
                Listening... Click to stop
              </p>
            )}

            {error && (
              <p className="mt-3 text-xs text-red-600 text-center max-w-[260px]">{error}</p>
            )}
          </div>

          {/* Transcript */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Transcript</p>
            {transcriptLines.length === 0 ? (
              <p className="text-sm text-muted-foreground">No transcript yet. Start recording to capture consultation.</p>
            ) : (
              transcriptLines.map((line, i) => (
                <div key={i} className="flex gap-2.5 items-start">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold flex-shrink-0 mt-0.5 ${line.speaker === "Doctor"
                    ? "bg-primary/10 text-primary"
                    : line.speaker === "Patient"
                      ? "bg-slate-100 text-slate-600"
                      : "bg-amber-100 text-amber-700"
                    }`}>
                    {line.speaker === "Doctor"
                      ? <Stethoscope className="w-2.5 h-2.5" />
                      : line.speaker === "Patient"
                        ? <User className="w-2.5 h-2.5" />
                        : <FileText className="w-2.5 h-2.5" />}
                    {line.speaker}
                  </span>
                  <p className="text-sm text-foreground leading-relaxed">{line.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Generate Button */}
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-t border-border">
            <button onClick={generateEMR} disabled={isProcessing} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><FileText className="w-4 h-4" /> Generate EMR</>}
            </button>
          </div>
        </div>


        {/* ─── CENTER COLUMN — Structured EMR (5 cols) ─── */}
        <div className="lg:col-span-4 panel flex flex-col min-h-[calc(100vh-140px)]">
          {/* Header */}
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Structured EMR</h3>
                <p className="text-[10px] text-muted-foreground">Generated from live consultation transcript</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <button onClick={downloadEmrReport} className="px-2.5 py-1.5 text-[11px] font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors flex items-center gap-1">
                <Download className="w-3 h-3" /> PDF
              </button>
              <button className="px-2.5 py-1.5 text-[11px] font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1">
                <Send className="w-3 h-3" /> Push to EMR
              </button>
            </div>
          </div>

          {/* EMR Accordion Sections */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-2">
            {emrSections.map((section) => {
              const isOpen = expandedSections.includes(section.key);
              const Icon = section.icon;
              return (
                <div key={section.key} className={`border rounded-xl overflow-hidden transition-all duration-200 ${isOpen ? "border-primary/20 bg-primary/[0.02]" : "border-border hover:border-primary/10"}`}>
                  <button
                    onClick={() => toggleSection(section.key)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isOpen ? "bg-primary/10" : "bg-muted"}`}>
                        <Icon className={`w-3.5 h-3.5 ${isOpen ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <span className={`text-sm font-medium ${isOpen ? "text-primary" : "text-foreground"}`}>{section.title}</span>
                    </div>
                    {isOpen ? <ChevronDown className="w-4 h-4 text-primary" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  {isOpen && (
                    <div className="px-3.5 pb-3">
                      <textarea
                        value={section.content}
                        readOnly
                        className="w-full bg-white rounded-lg p-3 text-sm text-foreground border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 resize-none transition-all"
                        rows={section.content.split('\n').length + 1}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer timestamp */}
          <div className="px-4 sm:px-5 py-2.5 border-t border-border">
            <p className="text-[10px] text-muted-foreground text-center">Last updated: {new Date().toLocaleTimeString()} · AI-Generated Draft</p>
          </div>
        </div>


        {/* ─── RIGHT COLUMN — AI Diagnostic Insights (3 cols) ─── */}
        <div className="lg:col-span-4 panel flex flex-col min-h-[calc(100vh-140px)]">
          {/* Header */}
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Brain className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">AI Diagnostic Insights</h3>
                <p className="text-[10px] text-muted-foreground">Clinical decision support</p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${triageBadgeClass}`}>
              <Shield className="w-3 h-3" /> {triageInfo.triage_level} Triage
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-5">

            {/* Alert Banner */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-red-700">{triageHeadline}</p>
                <p className="text-xs text-red-600 mt-0.5 leading-relaxed">{triageInfo.reasoning}</p>
              </div>
            </div>

            {/* AI Confidence Gauge */}
            <div className="flex flex-col items-center py-2">
              <div className="relative w-28 h-28">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 52 * (topConfidence / 100)} ${2 * Math.PI * 52}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-foreground">{topConfidence}%</span>
                  <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">AI Confidence</span>
                </div>
              </div>
            </div>

            {/* Top Diagnoses */}
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Top Diagnoses</p>
              {diagnoses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No diagnoses yet. Generate EMR to view diagnostic output.</p>
              ) : (
                <div className="space-y-3">
                  {diagnoses.map((d, i) => (
                    <div key={i} className="bg-white border border-border/60 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getSeverityColor(d.severity)}`}>
                            {i + 1}
                          </span>
                          <span className="text-sm font-semibold text-foreground">{d.name}</span>
                        </div>
                        <span className="text-sm font-black text-primary">{d.confidence}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${d.confidence}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-mono text-muted-foreground">ICD-10 : {d.icd}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Treatment Recommendations */}
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Treatment Recommendations</p>
              {treatments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No treatment recommendations yet. Generate EMR to view plan.</p>
              ) : (
                <div className="space-y-2">
                  {treatments.map((t, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-foreground leading-snug">{t.text}</p>
                        <span className="text-[10px] text-muted-foreground">{t.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Patient-Friendly Summary */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Patient-Friendly Summary</p>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {patientSummaryText}
              </p>
              <button className="mt-3 text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                <Download className="w-3 h-3" /> Download Patient Summary
              </button>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default NewConsultation;
