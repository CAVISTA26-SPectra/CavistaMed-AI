import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatsCard from "@/components/shared/StatsCard";
import StatusBadge from "@/components/shared/StatusBadge";
import { jsPDF } from "jspdf";
import {
  ClipboardList, Pill, FolderHeart, Brain, UserCog, Camera,
  Calendar, Stethoscope, AlertCircle, Download, Clock, FileText,
  Eye, X, AlertTriangle, Heart, Activity, Thermometer, Wind, Shield
} from "lucide-react";

const sidebarItems = [
  { label: "My Consultations", path: "/patient", icon: ClipboardList },
  { label: "Prescriptions", path: "/patient/prescriptions", icon: Pill },
  { label: "Health Records", path: "/patient/records", icon: FolderHeart },
  { label: "Medicine Info", path: "/patient/medicine-info", icon: Camera },
  { label: "AI Summary", path: "/patient/ai-summary", icon: Brain },
  { label: "Profile Settings", path: "/patient/settings", icon: UserCog },
];

// ── Full consultation EMR data for patient Emily Richards ──
const consultations = [
  {
    id: "CON-1038", date: "Feb 18, 2026", time: "11:20 AM",
    doctor: "Dr. James Carter", doctorId: "DOC-042", specialty: "Cardiology",
    diagnosis: "Hypertensive Urgency", icd: "I16.0", icdDescription: "Hypertensive urgency",
    status: "completed", aiConfidence: 92,
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
      { action: "Follow-up in 48 hours", type: "follow-up" },
    ],
    medications: [
      { name: "Amlodipine", dose: "10 mg", route: "Oral", frequency: "Once daily", class: "Calcium Channel Blocker" },
      { name: "Hydrochlorothiazide", dose: "25 mg", route: "Oral", frequency: "Once daily", class: "Thiazide Diuretic" },
    ],
    warnings: ["CONTRAINDICATION: Patient allergic to Aspirin. DO NOT administer Aspirin."],
    patientSummary: "Your blood pressure was dangerously high (hypertensive urgency). We've adjusted your medications and you need close monitoring. Please attend your follow-up appointment.",
    doctorNotes: "BP 192/110 on arrival. No signs of acute end-organ damage. Adjusting antihypertensive regimen. Adding CCB and diuretic. Aspirin contraindicated due to allergy.",
    labResults: [
      { test: "Basic Metabolic Panel", result: "Normal", date: "Feb 18, 2026" },
      { test: "Serum Creatinine", result: "1.1 mg/dL", date: "Feb 18, 2026" },
      { test: "Potassium", result: "4.2 mEq/L", date: "Feb 18, 2026" },
      { test: "ECG", result: "Normal sinus rhythm, no ST changes", date: "Feb 18, 2026" },
    ],
  },
  {
    id: "CON-1029", date: "Feb 10, 2026", time: "02:30 PM",
    doctor: "Dr. Priya Sharma", doctorId: "DOC-018", specialty: "Neurology",
    diagnosis: "Tension-Type Headache", icd: "G44.2", icdDescription: "Tension-type headache",
    status: "completed", aiConfidence: 78,
    chiefComplaint: "Bilateral headache with neck stiffness for 4 days",
    symptoms: ["Headache", "Neck stiffness", "Fatigue"],
    vitals: { heart_rate: 72, systolic_bp: 128, diastolic_bp: 82, SpO2: 99, temp: "98.4°F", resp_rate: 14 },
    history: ["Hypertension", "High cholesterol"],
    allergies: ["Aspirin"],
    currentMedications: ["Lisinopril 20mg daily", "Atorvastatin 40mg daily"],
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
    labResults: [],
  },
  {
    id: "CON-1018", date: "Jan 28, 2026", time: "10:00 AM",
    doctor: "Dr. James Carter", doctorId: "DOC-042", specialty: "Cardiology",
    diagnosis: "Annual Wellness Checkup", icd: "Z00.0", icdDescription: "Encounter for general adult medical examination",
    status: "completed", aiConfidence: 95,
    chiefComplaint: "Routine annual health checkup",
    symptoms: [],
    vitals: { heart_rate: 74, systolic_bp: 134, diastolic_bp: 86, SpO2: 98, temp: "98.6°F", resp_rate: 15 },
    history: ["Hypertension", "High cholesterol"],
    allergies: ["Aspirin"],
    currentMedications: ["Lisinopril 20mg daily", "Atorvastatin 40mg daily"],
    triageLevel: "LOW", triageColor: "GREEN", triageReasoning: "Routine checkup — no acute concerns.",
    redFlags: [],
    treatmentPlan: [
      { action: "Continue current medications", type: "maintenance" },
      { action: "Annual blood work ordered", type: "diagnostic" },
      { action: "Schedule mammogram screening", type: "preventive" },
      { action: "Follow-up in 6 months for BP check", type: "follow-up" },
    ],
    medications: [],
    warnings: [],
    patientSummary: "Your annual checkup looks good overall. Your blood pressure is slightly elevated but controlled with medication. Continue your current medications and maintain a healthy lifestyle.",
    doctorNotes: "Annual exam. BP 134/86 — borderline controlled. Lipid panel and CBC ordered. Continue current regimen. Discussed diet and exercise.",
    labResults: [
      { test: "Complete Blood Count (CBC)", result: "All values within normal limits", date: "Jan 28, 2026" },
      { test: "Lipid Panel", result: "Total cholesterol 195 mg/dL, LDL 118 mg/dL", date: "Jan 28, 2026" },
      { test: "HbA1c", result: "5.4% (Normal)", date: "Jan 28, 2026" },
      { test: "Thyroid (TSH)", result: "2.1 mIU/L (Normal)", date: "Jan 28, 2026" },
    ],
  },
  {
    id: "CON-1005", date: "Jan 15, 2026", time: "04:30 PM",
    doctor: "Dr. Michael Brown", doctorId: "DOC-067", specialty: "General Medicine",
    diagnosis: "Upper Respiratory Infection", icd: "J06.9", icdDescription: "Acute upper respiratory infection, unspecified",
    status: "completed", aiConfidence: 88,
    chiefComplaint: "Sore throat, runny nose, and mild fever for 3 days",
    symptoms: ["Sore throat", "Runny nose", "Fever", "Cough", "Body ache"],
    vitals: { heart_rate: 86, systolic_bp: 122, diastolic_bp: 76, SpO2: 97, temp: "100.2°F", resp_rate: 16 },
    history: ["Hypertension", "High cholesterol"],
    allergies: ["Aspirin"],
    currentMedications: ["Lisinopril 20mg daily", "Atorvastatin 40mg daily"],
    triageLevel: "LOW", triageColor: "GREEN", triageReasoning: "Routine monitoring. Resolve with supportive care.",
    redFlags: [],
    treatmentPlan: [
      { action: "Encourage fluid intake", type: "supportive" },
      { action: "Rest for 3–5 days", type: "supportive" },
      { action: "Return if symptoms worsen or persist beyond 7 days", type: "follow-up" },
    ],
    medications: [
      { name: "Paracetamol", dose: "500–1000 mg", route: "Oral", frequency: "Every 6 hours as needed", class: "Antipyretic" },
    ],
    warnings: [],
    patientSummary: "You have a common cold (upper respiratory infection). This usually resolves on its own with rest, fluids, and over-the-counter medication for symptom relief.",
    doctorNotes: "Classic URI presentation. No signs of bacterial infection. Supportive care only. Advised to return if symptoms persist >7 days.",
    labResults: [],
  },
];

const prescriptions = [
  { name: "Lisinopril 20mg", frequency: "Once daily", start: "Feb 18", status: "Active" },
  { name: "Amlodipine 10mg", frequency: "Once daily", start: "Feb 18", status: "Active" },
  { name: "Hydrochlorothiazide 25mg", frequency: "Once daily", start: "Feb 18", status: "Active" },
  { name: "Atorvastatin 40mg", frequency: "Once daily", start: "Jan 2025", status: "Active" },
];


// ── Triage helpers ──
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

// ── PDF Download (Patient-focused — Professional) ──
const downloadPDF = (c) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 15;
  const left = 14;
  const right = pageWidth - 14;
  const cw = right - left;

  const checkPage = (n = 20) => { if (y + n > pageHeight - 20) { doc.addPage(); y = 20; } };

  // ── Colors ──
  const navy = [30, 42, 74];
  const lightGray = [245, 246, 248];
  const midGray = [230, 232, 236];
  const white = [255, 255, 255];
  const darkText = [30, 30, 30];
  const mutedText = [100, 105, 115];
  const danger = [200, 30, 30];

  // ── Section Banner ──
  const sectionBanner = (title) => {
    checkPage(30);
    y += 4;
    doc.setFillColor(...navy);
    doc.roundedRect(left, y, cw, 8, 1, 1, "F");
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...white);
    doc.text(title, left + 4, y + 5.5);
    y += 13;
  };

  // ── 2-col table ──
  const drawTable = (rows, col1Width = 0.35) => {
    const c1w = cw * col1Width;
    const c2w = cw - c1w;
    const rowH = 8;
    rows.forEach(([label, value], i) => {
      checkPage(rowH + 2);
      const bg = i % 2 === 0 ? lightGray : white;
      doc.setFillColor(...bg);
      doc.rect(left, y, cw, rowH, "F");
      doc.setDrawColor(...midGray);
      doc.setLineWidth(0.3);
      doc.rect(left, y, c1w, rowH, "S");
      doc.rect(left + c1w, y, c2w, rowH, "S");
      doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(...darkText);
      doc.text(String(label), left + 3, y + 5.5);
      doc.setFont("helvetica", "normal"); doc.setTextColor(50, 50, 50);
      const val = doc.splitTextToSize(String(value || "—"), c2w - 6);
      doc.text(val[0] || "—", left + c1w + 3, y + 5.5);
      y += rowH;
    });
    y += 2;
  };

  // ── Multi-col table ──
  const drawMultiColTable = (headers, rows, colWidths) => {
    const rowH = 8;
    checkPage(rowH + 2);
    doc.setFillColor(...navy);
    let xPos = left;
    headers.forEach((h, i) => {
      const w = cw * colWidths[i];
      doc.rect(xPos, y, w, rowH, "F");
      doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(...white);
      doc.text(h, xPos + 3, y + 5.5);
      xPos += w;
    });
    y += rowH;
    rows.forEach((row, ri) => {
      checkPage(rowH + 2);
      const bg = ri % 2 === 0 ? lightGray : white;
      xPos = left;
      row.forEach((cell, ci) => {
        const w = cw * colWidths[ci];
        doc.setFillColor(...bg);
        doc.rect(xPos, y, w, rowH, "F");
        doc.setDrawColor(...midGray);
        doc.setLineWidth(0.2);
        doc.rect(xPos, y, w, rowH, "S");
        doc.setFontSize(7.5);
        doc.setFont("helvetica", ci === 0 ? "bold" : "normal");
        doc.setTextColor(...darkText);
        const t = doc.splitTextToSize(String(cell), w - 6)[0] || "";
        doc.text(t, xPos + 3, y + 5.5);
        xPos += w;
      });
      y += rowH;
    });
    y += 2;
  };

  // ── Paragraph ──
  const drawParagraph = (text, options = {}) => {
    const { italic = false, color = darkText, bg = null } = options;
    doc.setFontSize(8.5);
    doc.setFont("helvetica", italic ? "italic" : "normal");
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(String(text), cw - 8);
    const blockH = lines.length * 4.5 + 6;
    checkPage(blockH + 2);
    if (bg) { doc.setFillColor(...bg); doc.roundedRect(left, y, cw, blockH, 1.5, 1.5, "F"); }
    doc.text(lines, left + 4, y + 5);
    y += blockH + 3;
  };

  // ── Bullets ──
  const drawBullets = (items, options = {}) => {
    const { color = darkText } = options;
    items.forEach(item => {
      checkPage(10);
      doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(...color);
      doc.text("•", left + 4, y);
      const lines = doc.splitTextToSize(String(item), cw - 14);
      doc.text(lines, left + 10, y);
      y += lines.length * 4.5 + 1.5;
    });
    y += 2;
  };


  // ═══════════════════════════════════════════════
  //                GRADIENT HEADER
  // ═══════════════════════════════════════════════
  const gradientSteps = 60;
  const headerH = 28;
  for (let i = 0; i < gradientSteps; i++) {
    const ratio = i / gradientSteps;
    const r = Math.round(180 + (30 - 180) * ratio);
    const g = Math.round(30 + (42 - 30) * ratio);
    const b = Math.round(120 + (74 - 120) * ratio);
    doc.setFillColor(r, g, b);
    doc.rect((pageWidth / gradientSteps) * i, 0, (pageWidth / gradientSteps) + 1, headerH, "F");
  }
  doc.setFontSize(16); doc.setFont("helvetica", "bold"); doc.setTextColor(...white);
  doc.text("Patient Medical Record", left, 12);
  doc.setFontSize(8); doc.setFont("helvetica", "normal");
  doc.text("CavistaMed AI — AI Clinical Co-Pilot", left, 18);
  doc.setFontSize(7);
  doc.text(`Generated: ${new Date().toLocaleString()}`, right - 50, 12);
  doc.text(`Report ID: ${c.id}`, right - 50, 17);
  doc.text(`Status: ${c.status.toUpperCase()}`, right - 50, 22);
  y = headerH + 8;


  // ═══ PATIENT IDENTITY ═══
  sectionBanner("Patient Identity");
  drawTable([
    ["Patient Name", "Emily Richards"],
    ["Patient ID", "PAT-1087"],
    ["Age", "42 years"],
    ["Gender", "Female"],
  ]);

  // ═══ VISIT DETAILS ═══
  sectionBanner("Visit Details");
  drawTable([
    ["Date & Time", `${c.date} at ${c.time}`],
    ["Attending Doctor", `${c.doctor} (${c.doctorId})`],
    ["Specialty", c.specialty],
    ["Consultation ID", c.id],
    ["Status", c.status.charAt(0).toUpperCase() + c.status.slice(1)],
  ]);

  // ═══ CHIEF COMPLAINT ═══
  sectionBanner("Why You Visited");
  drawParagraph(c.chiefComplaint, { bg: [240, 245, 255] });

  // ═══ SYMPTOMS ═══
  if (c.symptoms.length > 0) {
    sectionBanner("Presenting Symptoms");
    drawBullets(c.symptoms);
  }

  // ═══ VITAL SIGNS ═══
  sectionBanner("Vital Signs");
  drawMultiColTable(
    ["Parameter", "Value", "Unit"],
    [
      ["Heart Rate", String(c.vitals.heart_rate), "bpm"],
      ["Systolic BP", String(c.vitals.systolic_bp), "mmHg"],
      ["Diastolic BP", String(c.vitals.diastolic_bp), "mmHg"],
      ["SpO2", String(c.vitals.SpO2), "%"],
      ["Temperature", c.vitals.temp, "°F"],
      ["Respiratory Rate", String(c.vitals.resp_rate), "breaths/min"],
    ],
    [0.4, 0.35, 0.25]
  );

  // ═══ MEDICAL HISTORY ═══
  sectionBanner("Medical History & Allergies");
  drawTable([
    ["Past Medical History", c.history.length > 0 ? c.history.join(", ") : "No significant history"],
    ["Known Allergies", c.allergies.length > 0 ? c.allergies.join(", ") : "No Known Drug Allergies (NKDA)"],
    ["Current Medications", c.currentMedications.length > 0 ? c.currentMedications.join("; ") : "None"],
  ]);

  // ═══ DIAGNOSIS ═══
  sectionBanner("Assessment & Diagnosis");
  drawTable([
    ["Primary Diagnosis", c.diagnosis],
    ["ICD-10 Code", `${c.icd} — ${c.icdDescription}`],
    ["AI Confidence Score", `${c.aiConfidence}%`],
    ["Triage Level", `${c.triageLevel} (${c.triageColor})`],
  ]);

  // ═══ TREATMENT PLAN ═══
  sectionBanner("Treatment Plan");
  drawMultiColTable(
    ["#", "Action", "Type"],
    c.treatmentPlan.map((t, i) => [String(i + 1), t.action, t.type.toUpperCase()]),
    [0.08, 0.67, 0.25]
  );

  // ═══ PRESCRIBED MEDICATIONS ═══
  sectionBanner("Prescribed Medications");
  if (c.medications.length > 0) {
    drawMultiColTable(
      ["Medication", "Dose", "Route", "Frequency", "Class"],
      c.medications.map(m => [m.name, m.dose, m.route, m.frequency, m.class]),
      [0.22, 0.13, 0.12, 0.3, 0.23]
    );
  } else {
    drawParagraph("No new medications prescribed for this visit.", { italic: true, color: mutedText });
  }

  // ═══ LAB RESULTS ═══
  if (c.labResults && c.labResults.length > 0) {
    sectionBanner("Lab & Test Results");
    drawMultiColTable(
      ["Test", "Result", "Date"],
      c.labResults.map(l => [l.test, l.result, l.date]),
      [0.35, 0.40, 0.25]
    );
  }

  // ═══ WARNINGS ═══
  if (c.warnings.length > 0) {
    sectionBanner("⚠ Important Warnings");
    c.warnings.forEach(w => {
      drawParagraph(`⚠  ${w}`, { color: danger, bg: [255, 240, 240] });
    });
  }

  // ═══ DOCTOR'S NOTES ═══
  sectionBanner("Doctor's Notes");
  drawParagraph(c.doctorNotes, { italic: true, bg: [245, 246, 248] });

  // ═══ YOUR HEALTH SUMMARY ═══
  sectionBanner("What This Means For You");
  drawParagraph(c.patientSummary, { bg: [240, 245, 255] });


  // ── Footer ──
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...midGray);
    doc.setLineWidth(0.3);
    doc.line(left, pageHeight - 12, right, pageHeight - 12);
    doc.setFontSize(6.5); doc.setTextColor(...mutedText);
    doc.text("CavistaMed AI — Confidential Patient Medical Record", left, pageHeight - 8);
    doc.text(`Page ${i} of ${pages}`, right - 18, pageHeight - 8);
  }
  doc.save(`EMR_${c.id}_Emily_Richards.pdf`);
};


// ── Full EMR Modal (Patient View — grouped with tables) ──
const PatientEMRModal = ({ consultation, onClose }) => {
  if (!consultation) return null;
  const c = consultation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-card sm:rounded-2xl border-0 sm:border border-border shadow-2xl w-full sm:max-w-4xl h-full sm:h-auto sm:max-h-[92vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-primary/5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold text-foreground truncate">My Medical Record</h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{c.id} · {c.date} at {c.time}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button onClick={() => downloadPDF(c)} className="px-2 sm:px-3 py-1.5 sm:py-2 bg-primary text-primary-foreground rounded-lg text-[10px] sm:text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1">
              <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> PDF
            </button>
            <button onClick={onClose} className="p-1.5 sm:p-2 hover:bg-muted rounded-lg transition-colors">
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-5 sm:space-y-6">

          {/* ═══ SECTION 1: Visit Overview (paragraph + info table) ═══ */}
          <section>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" /> Visit Overview
            </h3>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ["Date & Time", `${c.date} at ${c.time}`],
                    ["Doctor", `${c.doctor} — ${c.specialty}`],
                    ["Doctor ID", c.doctorId],
                    ["Consultation ID", c.id],
                    ["Status", c.status.charAt(0).toUpperCase() + c.status.slice(1)],
                  ].map(([label, val], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-secondary/50" : "bg-card"}>
                      <td className="px-4 py-2.5 text-xs font-medium text-muted-foreground w-1/3 sm:w-1/4">{label}</td>
                      <td className="px-4 py-2.5 text-sm text-foreground font-medium">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ═══ SECTION 2: Chief Complaint (paragraph) ═══ */}
          <section>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <ClipboardList className="w-3.5 h-3.5" /> Why You Visited
            </h3>
            <div className="p-4 rounded-xl bg-primary/[0.03] border border-primary/10">
              <p className="text-sm text-foreground leading-relaxed">{c.chiefComplaint}</p>
            </div>
            {c.symptoms.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {c.symptoms.map((s, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-secondary border border-border text-xs font-medium text-foreground">{s}</span>
                ))}
              </div>
            )}
          </section>

          {/* ═══ SECTION 3: Vital Signs (data table) ═══ */}
          <section>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Heart className="w-3.5 h-3.5" /> Vital Signs
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
              {[
                { label: "Heart Rate", value: `${c.vitals.heart_rate} bpm`, icon: Heart, color: "text-red-500" },
                { label: "Blood Pressure", value: `${c.vitals.systolic_bp}/${c.vitals.diastolic_bp}`, icon: Activity, color: "text-blue-500" },
                { label: "SpO2", value: `${c.vitals.SpO2}%`, icon: Wind, color: "text-cyan-500" },
                { label: "Temperature", value: c.vitals.temp, icon: Thermometer, color: "text-orange-500" },
                { label: "Resp Rate", value: `${c.vitals.resp_rate}/min`, icon: Wind, color: "text-emerald-500" },
              ].map((v, i) => (
                <div key={i} className="p-3 rounded-xl bg-secondary/80 border border-border text-center">
                  <v.icon className={`w-4 h-4 ${v.color} mx-auto mb-1`} />
                  <p className="text-sm font-bold text-foreground">{v.value}</p>
                  <p className="text-[10px] text-muted-foreground">{v.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ═══ SECTION 4: Diagnosis (styled card) ═══ */}
          <section>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Stethoscope className="w-3.5 h-3.5" /> Diagnosis
            </h3>
            <div className="p-4 rounded-xl border-2 border-primary/20 bg-primary/[0.03]">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <p className="text-base sm:text-lg font-bold text-foreground">{c.diagnosis}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.icdDescription}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-mono font-bold rounded-lg">{c.icd}</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getTriageStyles(c.triageLevel)}`}>
                    <span className={`w-2 h-2 rounded-full ${getTriageDot(c.triageLevel)}`} />
                    {c.triageLevel}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-muted-foreground">AI Confidence:</span>
                <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${c.aiConfidence}%` }} />
                </div>
                <span className="text-xs font-bold text-primary">{c.aiConfidence}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{c.triageReasoning}</p>
            </div>
          </section>

          {/* ═══ SECTION 5: Warnings (if any) ═══ */}
          {c.warnings.length > 0 && (
            <section>
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <h3 className="text-xs font-bold text-red-700 uppercase mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Important Warnings
                </h3>
                {c.warnings.map((w, i) => (
                  <p key={i} className="text-sm text-red-700 mt-1">⚠ {w}</p>
                ))}
              </div>
            </section>
          )}

          {/* ═══ SECTION 6: Medical History & Allergies (info table) ═══ */}
          <section>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <FolderHeart className="w-3.5 h-3.5" /> Medical History & Allergies
            </h3>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="bg-secondary/50">
                    <td className="px-4 py-2.5 text-xs font-medium text-muted-foreground w-1/3 sm:w-1/4">Past History</td>
                    <td className="px-4 py-2.5 text-sm text-foreground">{c.history.length > 0 ? c.history.join(", ") : "None reported"}</td>
                  </tr>
                  <tr className="bg-card">
                    <td className="px-4 py-2.5 text-xs font-medium text-muted-foreground">Allergies</td>
                    <td className="px-4 py-2.5">
                      {c.allergies.length > 0
                        ? c.allergies.map((a, i) => <span key={i} className="inline-block px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-medium mr-1">{a}</span>)
                        : <span className="text-sm text-muted-foreground italic">No known drug allergies (NKDA)</span>
                      }
                    </td>
                  </tr>
                  <tr className="bg-secondary/50">
                    <td className="px-4 py-2.5 text-xs font-medium text-muted-foreground">Current Medications</td>
                    <td className="px-4 py-2.5 text-sm text-foreground">{c.currentMedications.length > 0 ? c.currentMedications.join(", ") : "None"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ═══ SECTION 7: Treatment Plan (numbered steps) ═══ */}
          <section>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <ClipboardList className="w-3.5 h-3.5" /> Treatment Plan
            </h3>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary border-b border-border">
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase w-8">#</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase">Action</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase hidden sm:table-cell">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {c.treatmentPlan.map((t, i) => (
                    <tr key={i} className={`${i % 2 === 0 ? "bg-card" : "bg-secondary/30"} border-b border-border last:border-0`}>
                      <td className="px-4 py-2.5">
                        <span className="w-5 h-5 rounded-md bg-primary/10 text-primary text-[10px] font-bold inline-flex items-center justify-center">{i + 1}</span>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-foreground">{t.action}</td>
                      <td className="px-4 py-2.5 hidden sm:table-cell">
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium uppercase">{t.type}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ═══ SECTION 8: Prescribed Medications (table) ═══ */}
          <section>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Pill className="w-3.5 h-3.5" /> Prescribed Medications
            </h3>
            {c.medications.length > 0 ? (
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-secondary border-b border-border">
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase">Medication</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase hidden sm:table-cell">Dose</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase hidden sm:table-cell">Route</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase">Frequency</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase hidden md:table-cell">Class</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.medications.map((m, i) => (
                      <tr key={i} className={`${i % 2 === 0 ? "bg-card" : "bg-secondary/30"} border-b border-border last:border-0`}>
                        <td className="px-4 py-2.5 font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <Pill className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                            <span>{m.name}</span>
                            <span className="sm:hidden text-[10px] text-muted-foreground">({m.dose})</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-foreground hidden sm:table-cell">{m.dose}</td>
                        <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">{m.route}</td>
                        <td className="px-4 py-2.5 text-foreground">{m.frequency}</td>
                        <td className="px-4 py-2.5 text-muted-foreground hidden md:table-cell">{m.class}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic p-3 rounded-xl bg-secondary/50 border border-border">No new medications prescribed for this visit.</p>
            )}
          </section>

          {/* ═══ SECTION 9: Lab Results (table, if any) ═══ */}
          {c.labResults && c.labResults.length > 0 && (
            <section>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" /> Lab & Test Results
              </h3>
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-secondary border-b border-border">
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase">Test</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase">Result</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase hidden sm:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.labResults.map((l, i) => (
                      <tr key={i} className={`${i % 2 === 0 ? "bg-card" : "bg-secondary/30"} border-b border-border last:border-0`}>
                        <td className="px-4 py-2.5 font-medium text-foreground">{l.test}</td>
                        <td className="px-4 py-2.5 text-foreground">{l.result}</td>
                        <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">{l.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ═══ SECTION 10: Doctor's Notes (paragraph) ═══ */}
          <section>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" /> Doctor's Notes
            </h3>
            <div className="p-4 rounded-xl bg-secondary/80 border border-border">
              <p className="text-sm text-foreground italic leading-relaxed">{c.doctorNotes}</p>
            </div>
          </section>

          {/* ═══ SECTION 11: Patient Summary (highlighted paragraph) ═══ */}
          <section>
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
              <Brain className="w-3.5 h-3.5" /> What This Means For You
            </h3>
            <div className="p-4 rounded-xl bg-primary/[0.04] border border-primary/15">
              <p className="text-sm text-foreground leading-relaxed">{c.patientSummary}</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border bg-secondary/50 flex items-center justify-between flex-shrink-0">
          <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">CavistaMed AI — Confidential Patient Record</p>
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => downloadPDF(c)} className="flex-1 sm:flex-initial px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5">
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
const PatientDashboard = () => {
  const [viewingEMR, setViewingEMR] = useState(null);

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Patient Health Portal" subtitle="Welcome, Emily Richards — PAT-1087">
      <div className="space-y-4 sm:space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <StatsCard label="Upcoming Appointments" value={1} icon={Calendar} trend="Feb 20, 2026" />
          <StatsCard label="Last Diagnosis" value="Hypertension" icon={Stethoscope} trend="Feb 18, 2026" />
          <StatsCard label="Active Prescriptions" value={4} icon={Pill} trend="All on schedule" trendUp />
          <StatsCard label="Health Alerts" value={1} icon={AlertCircle} trend="BP monitoring" />
        </div>

        {/* Consultation History */}
        <div className="panel">
          <div className="panel-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">My Consultation History</h3>
          </div>
          <div className="panel-body space-y-3">
            {consultations.map((c, i) => (
              <div key={i} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate">{c.diagnosis}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{c.doctor} · {c.date}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="px-2 py-0.5 sm:py-1 bg-primary/10 text-primary text-[10px] sm:text-xs font-mono rounded-lg">{c.icd}</span>
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setViewingEMR(c)}
                    className="p-1.5 sm:p-2 hover:bg-primary/10 rounded-lg transition-colors group"
                    title="View Full EMR"
                  >
                    <Eye className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                  <button
                    onClick={() => downloadPDF(c)}
                    className="p-1.5 sm:p-2 hover:bg-primary/10 rounded-lg transition-colors group"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {/* Prescriptions */}
          <div className="panel">
            <div className="panel-header">
              <h3 className="font-semibold text-foreground text-sm sm:text-base">Active Prescriptions</h3>
            </div>
            <div className="panel-body space-y-3">
              {prescriptions.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary">
                  <div className="flex items-center gap-3">
                    <Pill className="w-4 h-4 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-foreground">{p.name}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{p.frequency} · Since {p.start}</p>
                    </div>
                  </div>
                  <span className="badge-status bg-status-completed/10 text-status-completed">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-completed" />
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Summary */}
          <div className="panel">
            <div className="panel-header flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm sm:text-base">AI Health Summary</h3>
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div className="panel-body space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Latest Diagnosis Explained</h4>
                <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                  Your recent visit showed that your blood pressure was dangerously high, a condition called hypertensive urgency.
                  This was causing your headaches and dizziness. Your doctor has adjusted your medication to help bring your
                  blood pressure down to a safe level.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Recovery Instructions</h4>
                <ul className="space-y-1.5">
                  {[
                    "Take your new medications as prescribed every day",
                    "Check your blood pressure at home twice daily",
                    "Reduce sodium intake to less than 2,300mg per day",
                    "Engage in 30 minutes of light exercise daily",
                    "Attend your follow-up appointment on Feb 20",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-foreground">
                      <FileText className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-xs font-semibold text-primary">⏰ Follow-up Reminder</p>
                <p className="text-xs sm:text-sm text-foreground mt-1">Your next appointment is on <strong>February 20, 2026</strong> with Dr. James Carter.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EMR Modal */}
      {viewingEMR && <PatientEMRModal consultation={viewingEMR} onClose={() => setViewingEMR(null)} />}
    </DashboardLayout>
  );
};

export default PatientDashboard;
