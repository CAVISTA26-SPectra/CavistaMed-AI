import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatusBadge from "@/components/shared/StatusBadge";
import { jsPDF } from "jspdf";
import {
  LayoutDashboard, FilePlus, Users, ClipboardList, Brain, Settings,
  Search, Calendar, Download, Eye, Filter, ChevronLeft, ChevronRight,
  X, Activity, AlertTriangle, Thermometer, Heart, Wind, Pill,
  FileText, Shield, Clock
} from "lucide-react";

const sidebarItems = [
  { label: "Dashboard Overview", path: "/doctor", icon: LayoutDashboard },
  { label: "New Consultation", path: "/doctor/consultation", icon: FilePlus },
  { label: "My Patients", path: "/doctor/patients", icon: Users },
  { label: "Consultation History", path: "/doctor/history", icon: ClipboardList },
  { label: "AI Insights", path: "/doctor/insights", icon: Brain },
  { label: "Settings", path: "/doctor/settings", icon: Settings },
];

// ── Rich consultation data with full EMR details ──
const consultations = [
  {
    id: "CON-1042", patient: "Maria Santos", patientId: "PAT-1023", age: 54, gender: "Female",
    diagnosis: "Type 2 Diabetes Mellitus", icd: "E11.9", icdDescription: "Type 2 diabetes mellitus without complications",
    date: "Feb 21, 2026", time: "09:15 AM", aiConfidence: 94, status: "completed",
    chiefComplaint: "Frequent urination and excessive thirst for 2 weeks",
    symptoms: ["Frequent urination", "Excessive thirst", "Fatigue", "Blurred vision"],
    vitals: { heart_rate: 82, systolic_bp: 138, diastolic_bp: 88, SpO2: 97, temp: "98.4°F", resp_rate: 16 },
    history: ["Obesity", "Family history of diabetes"],
    allergies: ["Sulfonamides"],
    currentMedications: ["Lisinopril 10mg daily"],
    triageLevel: "LOW", triageColor: "GREEN", triageReasoning: "Routine monitoring recommended.",
    redFlags: [],
    treatmentPlan: [
      { action: "Check Point-of-Care Blood Glucose", type: "diagnostic" },
      { action: "HbA1c test ordered", type: "diagnostic" },
      { action: "Dietary counseling referral", type: "referral" },
    ],
    medications: [
      { name: "Metformin", dose: "500 mg", route: "Oral", frequency: "Twice daily", class: "Biguanide" },
    ],
    warnings: [],
    patientSummary: "Your tests show that your body is having difficulty managing blood sugar levels, a condition called Type 2 Diabetes. This is very manageable with proper medication, diet, and exercise.",
    doctorNotes: "Patient presents with classic symptoms of T2DM. Fasting glucose 186 mg/dL. Starting Metformin and referring to dietitian.",
  },
  {
    id: "CON-1041", patient: "John Williams", patientId: "PAT-1045", age: 67, gender: "Male",
    diagnosis: "Essential Hypertension", icd: "I10", icdDescription: "Essential (primary) hypertension",
    date: "Feb 21, 2026", time: "08:30 AM", aiConfidence: 89, status: "completed",
    chiefComplaint: "Headache and dizziness for 5 days",
    symptoms: ["Headache", "Dizziness", "Blurred vision"],
    vitals: { heart_rate: 88, systolic_bp: 172, diastolic_bp: 98, SpO2: 96, temp: "98.2°F", resp_rate: 18 },
    history: ["Hypertension", "High cholesterol"],
    allergies: ["Penicillin"],
    currentMedications: ["Atorvastatin 20mg daily"],
    triageLevel: "MEDIUM", triageColor: "YELLOW", triageReasoning: "Requires timely evaluation.",
    redFlags: [],
    treatmentPlan: [
      { action: "Monitor blood pressure every 4 hours", type: "monitoring" },
      { action: "Assess for end-organ damage", type: "diagnostic" },
      { action: "Recheck BP in 2 weeks", type: "follow-up" },
    ],
    medications: [
      { name: "Amlodipine", dose: "5-10 mg", route: "Oral", frequency: "Once daily", class: "Calcium Channel Blocker" },
    ],
    warnings: [],
    patientSummary: "Your blood pressure has been consistently high, a condition called hypertension. Medication has been prescribed to help lower it to a safe level.",
    doctorNotes: "BP 172/98. No signs of end-organ damage. Starting Amlodipine. Follow-up in 2 weeks.",
  },
  {
    id: "CON-1040", patient: "Linda Chen", patientId: "PAT-1087", age: 34, gender: "Female",
    diagnosis: "Acute Bronchitis", icd: "J20.9", icdDescription: "Acute bronchitis, unspecified",
    date: "Feb 20, 2026", time: "03:45 PM", aiConfidence: 82, status: "processing",
    chiefComplaint: "Persistent cough with mucus production for 1 week",
    symptoms: ["Cough", "Fever", "Shortness of breath", "Fatigue", "Body ache"],
    vitals: { heart_rate: 94, systolic_bp: 118, diastolic_bp: 76, SpO2: 94, temp: "100.8°F", resp_rate: 22 },
    history: ["Asthma (childhood)"],
    allergies: [],
    currentMedications: [],
    triageLevel: "MEDIUM", triageColor: "YELLOW", triageReasoning: "Requires timely evaluation due to respiratory symptoms.",
    redFlags: [],
    treatmentPlan: [
      { action: "Chest X-Ray", type: "diagnostic" },
      { action: "Sputum culture if productive cough", type: "diagnostic" },
      { action: "Encourage fluid intake and rest", type: "supportive" },
    ],
    medications: [
      { name: "Azithromycin", dose: "500 mg", route: "Oral", frequency: "Once daily for 3 days", class: "Macrolide Antibiotic" },
      { name: "Paracetamol", dose: "500-1000 mg", route: "Oral", frequency: "Every 6 hours as needed", class: "Antipyretic" },
    ],
    warnings: [],
    patientSummary: "You have a chest infection called bronchitis. Antibiotics have been prescribed to help fight the infection. Rest and drink plenty of fluids.",
    doctorNotes: "Productive cough, mild wheezing bilateral. CXR ordered to rule out pneumonia. Starting empiric antibiotics.",
  },
  {
    id: "CON-1039", patient: "Robert Davis", patientId: "PAT-1012", age: 45, gender: "Male",
    diagnosis: "Major Depressive Disorder", icd: "F32.9", icdDescription: "Major depressive disorder, single episode, unspecified",
    date: "Feb 20, 2026", time: "02:10 PM", aiConfidence: 76, status: "completed",
    chiefComplaint: "Persistent low mood and loss of interest for 3 months",
    symptoms: ["Low mood", "Insomnia", "Fatigue", "Loss of appetite", "Difficulty concentrating"],
    vitals: { heart_rate: 72, systolic_bp: 122, diastolic_bp: 78, SpO2: 98, temp: "98.6°F", resp_rate: 14 },
    history: ["Anxiety disorder"],
    allergies: [],
    currentMedications: ["Alprazolam 0.5mg PRN"],
    triageLevel: "LOW", triageColor: "GREEN", triageReasoning: "Routine follow-up recommended.",
    redFlags: [],
    treatmentPlan: [
      { action: "PHQ-9 assessment completed (Score: 16 — moderately severe)", type: "assessment" },
      { action: "Cognitive behavioral therapy referral", type: "referral" },
      { action: "Follow-up in 4 weeks", type: "follow-up" },
    ],
    medications: [
      { name: "Sertraline", dose: "50 mg", route: "Oral", frequency: "Once daily", class: "SSRI Antidepressant" },
    ],
    warnings: [],
    patientSummary: "You've been experiencing symptoms of depression. We've started a medication to help improve your mood along with a referral for therapy.",
    doctorNotes: "PHQ-9 score 16. Initiating SSRI therapy. Patient counseled on side effects and titration timeline. CBT referral placed.",
  },
  {
    id: "CON-1038", patient: "Emily Richards", patientId: "PAT-1087", age: 42, gender: "Female",
    diagnosis: "Hypertensive Urgency", icd: "I16.0", icdDescription: "Hypertensive urgency",
    date: "Feb 18, 2026", time: "11:20 AM", aiConfidence: 92, status: "completed",
    chiefComplaint: "Severe headache and dizziness for 3 days",
    symptoms: ["Headache", "Dizziness", "Nausea", "Chest tightness"],
    vitals: { heart_rate: 96, systolic_bp: 192, diastolic_bp: 110, SpO2: 96, temp: "98.4°F", resp_rate: 20 },
    history: ["Hypertension", "High cholesterol"],
    allergies: ["Aspirin"],
    currentMedications: ["Lisinopril 20mg daily", "Atorvastatin 40mg daily"],
    triageLevel: "HIGH", triageColor: "RED", triageReasoning: "Immediate medical attention required.",
    redFlags: ["Severely elevated blood pressure (192/110)"],
    treatmentPlan: [
      { action: "Continuous blood pressure monitoring", type: "monitoring" },
      { action: "Assess for end-organ damage (Hypertensive Emergency)", type: "diagnostic" },
      { action: "ECG to rule out cardiac involvement", type: "diagnostic" },
    ],
    medications: [
      { name: "Amlodipine", dose: "10 mg", route: "Oral", frequency: "Once daily", class: "Calcium Channel Blocker" },
      { name: "Hydrochlorothiazide", dose: "25 mg", route: "Oral", frequency: "Once daily", class: "Thiazide Diuretic" },
    ],
    warnings: ["CONTRAINDICATION: Patient allergic to Aspirin. DO NOT administer Aspirin."],
    patientSummary: "Your blood pressure was dangerously high (hypertensive urgency). We've adjusted your medications and you need close monitoring. Please attend your follow-up appointment.",
    doctorNotes: "BP 192/110 on arrival. No signs of acute end-organ damage. Adjusting antihypertensive regimen. Adding CCB and diuretic. Aspirin contraindicated due to allergy.",
  },
  {
    id: "CON-1037", patient: "David Park", patientId: "PAT-1098", age: 29, gender: "Male",
    diagnosis: "Tension-Type Headache", icd: "G44.2", icdDescription: "Tension-type headache",
    date: "Feb 18, 2026", time: "10:00 AM", aiConfidence: 78, status: "completed",
    chiefComplaint: "Bilateral headache with neck stiffness for 4 days",
    symptoms: ["Headache", "Neck stiffness", "Fatigue"],
    vitals: { heart_rate: 70, systolic_bp: 118, diastolic_bp: 74, SpO2: 99, temp: "98.4°F", resp_rate: 14 },
    history: [],
    allergies: [],
    currentMedications: [],
    triageLevel: "LOW", triageColor: "GREEN", triageReasoning: "Routine monitoring recommended.",
    redFlags: [],
    treatmentPlan: [
      { action: "Screen for neurologic deficits", type: "diagnostic" },
      { action: "Recommend stress management techniques", type: "lifestyle" },
      { action: "Follow-up if symptoms persist beyond 2 weeks", type: "follow-up" },
    ],
    medications: [
      { name: "Ibuprofen", dose: "400 mg", route: "Oral", frequency: "Every 8 hours as needed", class: "NSAID" },
    ],
    warnings: [],
    patientSummary: "Your headache appears to be a tension-type headache, commonly caused by stress and muscle tension. Over-the-counter pain relief and stress management should help.",
    doctorNotes: "Bilateral non-pulsatile headache, no red flags. Neuro exam normal. Likely tension-type. OTC analgesics recommended.",
  },
  {
    id: "CON-1036", patient: "Sarah Johnson", patientId: "PAT-1034", age: 38, gender: "Female",
    diagnosis: "Acute Upper Respiratory Infection", icd: "J06.9", icdDescription: "Acute upper respiratory infection, unspecified",
    date: "Feb 17, 2026", time: "04:30 PM", aiConfidence: 88, status: "completed",
    chiefComplaint: "Sore throat, runny nose, and mild fever for 3 days",
    symptoms: ["Sore throat", "Runny nose", "Fever", "Cough", "Body ache"],
    vitals: { heart_rate: 86, systolic_bp: 116, diastolic_bp: 72, SpO2: 97, temp: "100.2°F", resp_rate: 16 },
    history: [],
    allergies: ["Codeine"],
    currentMedications: [],
    triageLevel: "LOW", triageColor: "GREEN", triageReasoning: "Routine monitoring recommended.",
    redFlags: [],
    treatmentPlan: [
      { action: "Encourage fluid intake", type: "supportive" },
      { action: "Rest for 3-5 days", type: "supportive" },
      { action: "Return if symptoms worsen or persist beyond 7 days", type: "follow-up" },
    ],
    medications: [
      { name: "Paracetamol", dose: "500-1000 mg", route: "Oral", frequency: "Every 6 hours as needed", class: "Antipyretic" },
    ],
    warnings: [],
    patientSummary: "You have a common cold (upper respiratory infection). This usually resolves on its own with rest, fluids, and over-the-counter medication for symptom relief.",
    doctorNotes: "Classic URI presentation. No signs of bacterial infection. Supportive care only. Advised to return if symptoms persist >7 days.",
  },
  {
    id: "CON-1035", patient: "Michael Brown", patientId: "PAT-1056", age: 51, gender: "Male",
    diagnosis: "Low Back Pain", icd: "M54.5", icdDescription: "Low back pain",
    date: "Feb 17, 2026", time: "01:15 PM", aiConfidence: 71, status: "completed",
    chiefComplaint: "Persistent lower back pain for 2 weeks, worsening with activity",
    symptoms: ["Lower back pain", "Muscle stiffness", "Limited range of motion"],
    vitals: { heart_rate: 76, systolic_bp: 128, diastolic_bp: 82, SpO2: 98, temp: "98.6°F", resp_rate: 15 },
    history: ["Previous back injury (2020)"],
    allergies: ["NSAIDs"],
    currentMedications: [],
    triageLevel: "LOW", triageColor: "GREEN", triageReasoning: "Routine monitoring recommended.",
    redFlags: [],
    treatmentPlan: [
      { action: "Physical therapy referral", type: "referral" },
      { action: "Lumbar X-ray if no improvement in 4 weeks", type: "diagnostic" },
      { action: "Activity modification and ergonomic counseling", type: "lifestyle" },
    ],
    medications: [
      { name: "Acetaminophen", dose: "500-1000 mg", route: "Oral", frequency: "Every 6 hours as needed", class: "Analgesic" },
    ],
    warnings: ["CONTRAINDICATION: Patient allergic to NSAIDs. DO NOT administer Ibuprofen or similar NSAIDs."],
    patientSummary: "You have lower back pain, likely related to muscle strain. Physical therapy and pain management will help with recovery. Avoid heavy lifting.",
    doctorNotes: "Non-radicular LBP, no red flags for cauda equina. NSAID contraindicated. Using acetaminophen. PT referral placed. Imaging if no improvement.",
  },
];

// ── Triage badge color helper ──
const getTriageStyles = (level) => {
  switch (level) {
    case "HIGH": return "bg-red-100 text-red-700 border-red-200";
    case "MEDIUM": return "bg-amber-100 text-amber-700 border-amber-200";
    case "LOW": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    default: return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getTriageDot = (level) => {
  switch (level) {
    case "HIGH": return "bg-red-500";
    case "MEDIUM": return "bg-amber-500";
    case "LOW": return "bg-emerald-500";
    default: return "bg-gray-500";
  }
};

// ── PDF Download Function ──
const downloadPDF = (c) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;
  const leftMargin = 14;
  const rightMargin = pageWidth - 14;
  const contentWidth = rightMargin - leftMargin;

  const checkPage = (needed = 20) => {
    if (y + needed > 275) {
      doc.addPage();
      y = 15;
    }
  };

  const drawLine = () => {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(leftMargin, y, rightMargin, y);
    y += 6;
  };

  const sectionTitle = (title) => {
    checkPage(25);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 30, 50);
    doc.text(title.toUpperCase(), leftMargin, y);
    y += 2;
    doc.setDrawColor(180, 30, 50);
    doc.setLineWidth(0.5);
    doc.line(leftMargin, y, leftMargin + doc.getTextWidth(title.toUpperCase()) + 4, y);
    y += 7;
  };

  const labelValue = (label, value) => {
    checkPage(12);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text(label + ":", leftMargin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    const labelW = doc.getTextWidth(label + ":  ");
    const lines = doc.splitTextToSize(String(value), contentWidth - labelW);
    doc.text(lines, leftMargin + labelW, y);
    y += lines.length * 5 + 2;
  };

  const bulletItem = (text, indent = 0) => {
    checkPage(10);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    const x = leftMargin + 4 + indent;
    doc.text("•", x - 3, y);
    const lines = doc.splitTextToSize(text, contentWidth - 8 - indent);
    doc.text(lines, x, y);
    y += lines.length * 5 + 1;
  };

  // ──── HEADER ────
  doc.setFillColor(180, 30, 50);
  doc.rect(0, 0, pageWidth, 32, "F");
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("CavistaMed AI", leftMargin, 14);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Electronic Medical Record", leftMargin, 21);
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString()}`, rightMargin - 55, 21);
  doc.text(`Consultation ID: ${c.id}`, rightMargin - 55, 27);
  y = 40;

  // ──── PATIENT INFORMATION ────
  sectionTitle("Patient Information");
  labelValue("Patient Name", c.patient);
  labelValue("Patient ID", c.patientId);
  labelValue("Age / Gender", `${c.age} years / ${c.gender}`);
  labelValue("Date of Visit", `${c.date} at ${c.time}`);
  labelValue("Attending Doctor", "Dr. James Carter (DOC-042)");
  y += 3;
  drawLine();

  // ──── CHIEF COMPLAINT ────
  sectionTitle("Chief Complaint");
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 30, 30);
  const ccLines = doc.splitTextToSize(c.chiefComplaint, contentWidth);
  doc.text(ccLines, leftMargin, y);
  y += ccLines.length * 5 + 5;
  drawLine();

  // ──── SYMPTOMS ────
  sectionTitle("Presenting Symptoms");
  c.symptoms.forEach(s => bulletItem(s));
  y += 3;
  drawLine();

  // ──── VITALS ────
  sectionTitle("Vital Signs");
  labelValue("Heart Rate", `${c.vitals.heart_rate} bpm`);
  labelValue("Blood Pressure", `${c.vitals.systolic_bp}/${c.vitals.diastolic_bp} mmHg`);
  labelValue("SpO2", `${c.vitals.SpO2}%`);
  labelValue("Temperature", c.vitals.temp);
  labelValue("Respiratory Rate", `${c.vitals.resp_rate} breaths/min`);
  y += 3;
  drawLine();

  // ──── MEDICAL HISTORY ────
  sectionTitle("Medical History & Allergies");
  if (c.history.length > 0) {
    labelValue("History", c.history.join(", "));
  } else {
    labelValue("History", "No significant past medical history");
  }
  if (c.allergies.length > 0) {
    labelValue("Allergies", c.allergies.join(", "));
  } else {
    labelValue("Allergies", "No known drug allergies (NKDA)");
  }
  if (c.currentMedications.length > 0) {
    labelValue("Current Medications", c.currentMedications.join(", "));
  }
  y += 3;
  drawLine();

  // ──── TRIAGE ────
  sectionTitle("Triage Assessment");
  labelValue("Severity Level", `${c.triageLevel} (${c.triageColor})`);
  labelValue("Reasoning", c.triageReasoning);
  if (c.redFlags.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(200, 30, 30);
    doc.text("Red Flags:", leftMargin, y);
    y += 5;
    c.redFlags.forEach(f => bulletItem(f));
  }
  y += 3;
  drawLine();

  // ──── DIAGNOSIS ────
  sectionTitle("Assessment & Diagnosis");
  labelValue("Primary Diagnosis", c.diagnosis);
  labelValue("ICD-10 Code", `${c.icd} — ${c.icdDescription}`);
  labelValue("AI Confidence", `${c.aiConfidence}%`);
  y += 3;
  drawLine();

  // ──── TREATMENT PLAN ────
  sectionTitle("Treatment Plan");
  c.treatmentPlan.forEach(t => bulletItem(`[${t.type.toUpperCase()}] ${t.action}`));
  y += 3;

  // ──── MEDICATIONS ────
  sectionTitle("Prescribed Medications");
  if (c.medications.length > 0) {
    c.medications.forEach(m => {
      bulletItem(`${m.name} — ${m.dose} | ${m.route} | ${m.frequency} (${m.class})`);
    });
  } else {
    doc.setFontSize(9);
    doc.text("No medications prescribed.", leftMargin, y);
    y += 6;
  }

  // ──── WARNINGS ────
  if (c.warnings.length > 0) {
    y += 3;
    sectionTitle("⚠ Clinical Warnings");
    doc.setTextColor(200, 30, 30);
    c.warnings.forEach(w => bulletItem(w));
    doc.setTextColor(30, 30, 30);
  }
  y += 3;
  drawLine();

  // ──── DOCTOR NOTES ────
  sectionTitle("Doctor's Clinical Notes");
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(60, 60, 60);
  const noteLines = doc.splitTextToSize(c.doctorNotes, contentWidth);
  checkPage(noteLines.length * 5 + 5);
  doc.text(noteLines, leftMargin, y);
  y += noteLines.length * 5 + 5;
  drawLine();

  // ──── PATIENT SUMMARY ────
  sectionTitle("Patient-Friendly Summary");
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 30, 30);
  const summLines = doc.splitTextToSize(c.patientSummary, contentWidth);
  checkPage(summLines.length * 5 + 5);
  doc.text(summLines, leftMargin, y);
  y += summLines.length * 5 + 10;

  // ──── FOOTER ────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text("CavistaMed AI — Confidential Medical Record", leftMargin, 290);
    doc.text(`Page ${i} of ${totalPages}`, rightMargin - 20, 290);
  }

  doc.save(`EMR_${c.id}_${c.patient.replace(/\s/g, "_")}.pdf`);
};


// ── EMR View Modal ──
const EMRModal = ({ consultation, onClose }) => {
  if (!consultation) return null;
  const c = consultation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-card sm:rounded-2xl border-0 sm:border border-border shadow-2xl w-full sm:max-w-3xl h-full sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-primary/5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold text-foreground truncate">Electronic Medical Record</h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{c.id} · {c.date} at {c.time}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={() => downloadPDF(c)}
              className="px-2 sm:px-3 py-1.5 sm:py-2 bg-primary text-primary-foreground rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1 sm:gap-1.5"
            >
              <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline">PDF</span>
            </button>
            <button onClick={onClose} className="p-1.5 sm:p-2 hover:bg-muted rounded-lg sm:rounded-xl transition-colors">
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Patient Info & Triage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-secondary/80 border border-border space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Patient Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Name</span>
                  <span className="text-sm font-medium text-foreground">{c.patient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">ID</span>
                  <span className="text-sm font-mono text-foreground">{c.patientId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Age / Gender</span>
                  <span className="text-sm text-foreground">{c.age}y / {c.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Doctor</span>
                  <span className="text-sm text-foreground">Dr. James Carter</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-secondary/80 border border-border space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Triage Assessment</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${getTriageStyles(c.triageLevel)}`}>
                  <span className={`w-2 h-2 rounded-full ${getTriageDot(c.triageLevel)}`} />
                  {c.triageLevel} — {c.triageColor}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{c.triageReasoning}</p>
              {c.redFlags.length > 0 && (
                <div className="mt-2 p-2.5 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-xs font-semibold text-red-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Red Flags
                  </p>
                  {c.redFlags.map((f, i) => (
                    <p key={i} className="text-xs text-red-600 mt-1">• {f}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chief Complaint */}
          <div className="p-4 rounded-xl border border-border bg-primary/[0.03]">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Chief Complaint</h3>
            <p className="text-sm text-foreground font-medium">{c.chiefComplaint}</p>
          </div>

          {/* Symptoms */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Presenting Symptoms</h3>
            <div className="flex flex-wrap gap-2">
              {c.symptoms.map((s, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full bg-secondary border border-border text-xs font-medium text-foreground">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Vitals */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Vital Signs</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Heart Rate", value: `${c.vitals.heart_rate} bpm`, icon: Heart, color: "text-red-500" },
                { label: "Blood Pressure", value: `${c.vitals.systolic_bp}/${c.vitals.diastolic_bp}`, icon: Activity, color: "text-blue-500" },
                { label: "SpO2", value: `${c.vitals.SpO2}%`, icon: Wind, color: "text-cyan-500" },
                { label: "Temperature", value: c.vitals.temp, icon: Thermometer, color: "text-orange-500" },
                { label: "Resp Rate", value: `${c.vitals.resp_rate}/min`, icon: Wind, color: "text-emerald-500" },
              ].map((v, i) => (
                <div key={i} className="p-3 rounded-xl bg-secondary/80 border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <v.icon className={`w-3.5 h-3.5 ${v.color}`} />
                    <span className="text-[11px] text-muted-foreground">{v.label}</span>
                  </div>
                  <p className="text-sm font-bold text-foreground">{v.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* History & Allergies */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-secondary/80 border border-border">
              <h4 className="text-[11px] text-muted-foreground font-semibold uppercase mb-2">Medical History</h4>
              {c.history.length > 0 ? c.history.map((h, i) => (
                <p key={i} className="text-xs text-foreground">• {h}</p>
              )) : <p className="text-xs text-muted-foreground italic">None reported</p>}
            </div>
            <div className="p-3 rounded-xl bg-secondary/80 border border-border">
              <h4 className="text-[11px] text-muted-foreground font-semibold uppercase mb-2">Allergies</h4>
              {c.allergies.length > 0 ? c.allergies.map((a, i) => (
                <span key={i} className="inline-block px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-medium mr-1 mb-1">{a}</span>
              )) : <p className="text-xs text-muted-foreground italic">NKDA</p>}
            </div>
            <div className="p-3 rounded-xl bg-secondary/80 border border-border">
              <h4 className="text-[11px] text-muted-foreground font-semibold uppercase mb-2">Current Medications</h4>
              {c.currentMedications.length > 0 ? c.currentMedications.map((m, i) => (
                <p key={i} className="text-xs text-foreground">• {m}</p>
              )) : <p className="text-xs text-muted-foreground italic">None</p>}
            </div>
          </div>

          {/* Diagnosis */}
          <div className="p-4 rounded-xl border-2 border-primary/20 bg-primary/[0.03]">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Assessment & Diagnosis</h3>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-base font-bold text-foreground">{c.diagnosis}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.icdDescription}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-mono font-bold rounded-lg">{c.icd}</span>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${c.aiConfidence}%` }} />
                  </div>
                  <span className="text-xs font-bold text-primary">{c.aiConfidence}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Treatment Plan */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Treatment Plan</h3>
            <div className="space-y-2">
              {c.treatmentPlan.map((t, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/80 border border-border">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm text-foreground">{t.action}</p>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{t.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Medications */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Prescribed Medications</h3>
            {c.medications.length > 0 ? (
              <div className="space-y-2">
                {c.medications.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/80 border border-border">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Pill className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{m.name} — {m.dose}</p>
                      <p className="text-xs text-muted-foreground">{m.route} · {m.frequency} — {m.class}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No medications prescribed.</p>
            )}
          </div>

          {/* Warnings */}
          {c.warnings.length > 0 && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
              <h3 className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Clinical Warnings
              </h3>
              {c.warnings.map((w, i) => (
                <p key={i} className="text-sm text-red-700 mt-1">⚠ {w}</p>
              ))}
            </div>
          )}

          {/* Doctor Notes */}
          <div className="p-4 rounded-xl bg-secondary/80 border border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Doctor's Clinical Notes</h3>
            <p className="text-sm text-foreground italic leading-relaxed">{c.doctorNotes}</p>
          </div>

          {/* Patient Summary */}
          <div className="p-4 rounded-xl bg-primary/[0.04] border border-primary/15">
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" /> Patient-Friendly Summary
            </h3>
            <p className="text-sm text-foreground leading-relaxed">{c.patientSummary}</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border bg-secondary/50 flex items-center justify-between flex-shrink-0">
          <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">CavistaMed AI — Confidential Medical Record</p>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => downloadPDF(c)}
              className="flex-1 sm:flex-initial px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Download PDF
            </button>
            <button onClick={onClose} className="flex-1 sm:flex-initial px-4 py-2 border border-input rounded-xl text-xs font-medium text-foreground hover:bg-muted transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// ── Main Component ──
const ConsultationHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [viewingEMR, setViewingEMR] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  const filtered = consultations.filter(c =>
    c.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.icd.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const selected = consultations.find(c => c.id === selectedDetail);

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Consultation History" subtitle="View and manage past consultations">
      <div className="space-y-4 sm:space-y-6">
        {/* Filters */}
        <div className="panel">
          <div className="panel-body flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="relative flex-1 w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search patient, diagnosis, ICD..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-4 py-2 sm:py-2.5 w-full rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-input bg-background text-xs sm:text-sm font-medium text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5 sm:gap-2">
                <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Filter
              </button>
              <button className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-input bg-background text-xs sm:text-sm font-medium text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5 sm:gap-2">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Date </span>Range
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Table */}
          <div className="lg:col-span-2 panel">
            <div className="panel-header">
              <h3 className="font-semibold text-foreground text-sm sm:text-base">All Consultations ({filtered.length})</h3>
            </div>

            {/* Mobile card layout */}
            <div className="sm:hidden panel-body space-y-3">
              {paginated.map((c) => (
                <div
                  key={c.id}
                  className={`p-3 rounded-xl border transition-colors cursor-pointer ${selectedDetail === c.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"
                    }`}
                  onClick={() => setSelectedDetail(c.id)}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.patient}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{c.id}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{c.diagnosis}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-mono rounded">{c.icd}</span>
                      <span className="text-[10px] text-muted-foreground">{c.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
                        title="View Full EMR"
                        onClick={(e) => { e.stopPropagation(); setViewingEMR(c); }}
                      >
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button
                        className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
                        title="Download PDF"
                        onClick={(e) => { e.stopPropagation(); downloadPDF(c); }}
                      >
                        <Download className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table layout */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 lg:px-6 py-3 text-xs font-medium text-muted-foreground uppercase">ID</th>
                    <th className="text-left px-4 lg:px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Patient</th>
                    <th className="text-left px-4 lg:px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Diagnosis</th>
                    <th className="text-left px-4 lg:px-6 py-3 text-xs font-medium text-muted-foreground uppercase">ICD</th>
                    <th className="text-left px-4 lg:px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Date</th>
                    <th className="text-left px-4 lg:px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="text-left px-4 lg:px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((c) => (
                    <tr key={c.id} className={`border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer ${selectedDetail === c.id ? "bg-primary/5" : ""}`}
                      onClick={() => setSelectedDetail(c.id)}>
                      <td className="px-4 lg:px-6 py-4 text-xs font-mono text-muted-foreground">{c.id}</td>
                      <td className="px-4 lg:px-6 py-4 text-sm font-medium text-foreground">{c.patient}</td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-muted-foreground max-w-[160px] truncate">{c.diagnosis}</td>
                      <td className="px-4 lg:px-6 py-4"><span className="px-2 py-1 bg-primary/10 text-primary text-xs font-mono rounded-lg">{c.icd}</span></td>
                      <td className="px-4 lg:px-6 py-4 text-xs text-muted-foreground">{c.date}</td>
                      <td className="px-4 lg:px-6 py-4"><StatusBadge status={c.status} /></td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors group"
                            title="View Full EMR"
                            onClick={(e) => { e.stopPropagation(); setViewingEMR(c); }}
                          >
                            <Eye className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </button>
                          <button
                            className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors group"
                            title="Download PDF"
                            onClick={(e) => { e.stopPropagation(); downloadPDF(c); }}
                          >
                            <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-3 sm:px-6 py-3 border-t border-border flex items-center justify-between">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Showing {paginated.length} of {filtered.length}</p>
              <div className="flex items-center gap-0.5 sm:gap-1">
                <button
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${currentPage === page
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted cursor-pointer"}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>

          {/* Detail Panel — hidden on mobile unless selected */}
          <div className={`panel ${selectedDetail ? 'block' : 'hidden lg:block'}`}>
            <div className="panel-header flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm sm:text-base">Consultation Detail</h3>
              {selectedDetail && (
                <button
                  onClick={() => setSelectedDetail(null)}
                  className="p-1 hover:bg-muted rounded-lg transition-colors lg:hidden"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <div className="panel-body">
              {selected ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium">Consultation ID</p>
                    <p className="text-sm font-mono text-foreground">{selected.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium">Patient</p>
                    <p className="text-sm font-medium text-foreground">{selected.patient}</p>
                    <p className="text-xs text-muted-foreground">{selected.patientId} · {selected.age}y {selected.gender}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium">Diagnosis</p>
                    <p className="text-sm text-foreground">{selected.diagnosis}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium">ICD-10 Code</p>
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-mono rounded-lg">{selected.icd}</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium">Date & Time</p>
                    <p className="text-sm text-foreground">{selected.date} at {selected.time}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium">Triage Level</p>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border mt-1 ${getTriageStyles(selected.triageLevel)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${getTriageDot(selected.triageLevel)}`} />
                      {selected.triageLevel}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium">AI Confidence</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${selected.aiConfidence}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-primary">{selected.aiConfidence}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium">Status</p>
                    <div className="mt-1"><StatusBadge status={selected.status} /></div>
                  </div>

                  {/* Warnings in detail panel */}
                  {selected.warnings.length > 0 && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                      <p className="text-[10px] font-bold text-red-700 uppercase flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Warnings
                      </p>
                      {selected.warnings.map((w, i) => (
                        <p key={i} className="text-xs text-red-600 mt-1">{w}</p>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => setViewingEMR(selected)}
                      className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" /> View Full EMR
                    </button>
                    <button
                      onClick={() => downloadPDF(selected)}
                      className="px-4 py-2.5 border border-input rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" /> PDF
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ClipboardList className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Select a consultation to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* EMR Modal */}
      {viewingEMR && <EMRModal consultation={viewingEMR} onClose={() => setViewingEMR(null)} />}
    </DashboardLayout>
  );
};

export default ConsultationHistory;
