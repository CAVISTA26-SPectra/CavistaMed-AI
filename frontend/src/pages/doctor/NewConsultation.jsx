import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  LayoutDashboard, FilePlus, Users, ClipboardList, Brain, Settings,
  Mic, MicOff, FileText, Download, Send, ChevronDown, ChevronRight,
  AlertTriangle, CheckCircle, Activity, Heart, Thermometer, Wind,
  Stethoscope, Pill, Clock, Shield, User
} from "lucide-react";

const sidebarItems = [
  { label: "Dashboard Overview", path: "/doctor", icon: LayoutDashboard },
  { label: "New Consultation", path: "/doctor/consultation", icon: FilePlus },
  { label: "My Patients", path: "/doctor/patients", icon: Users },
  { label: "Consultation History", path: "/doctor/history", icon: ClipboardList },
  { label: "AI Insights", path: "/doctor/insights", icon: Brain },
  { label: "Settings", path: "/doctor/settings", icon: Settings },
];

const emrSections = [
  { key: "complaint", title: "Chief Complaint", icon: Stethoscope, content: "Patient presents with persistent headache and dizziness for 3 days. Pain described as frontal pressure, severity 7/10." },
  { key: "hpi", title: "History of Present Illness", icon: Clock, content: "Onset 3 days ago, progressively worsening. Associated with visual disturbances and intermittent dizziness. No prior history of migraines. Patient reports elevated home BP readings (~155/90)." },
  { key: "pmh", title: "Past Medical History", icon: FileText, content: "• Hypertension — diagnosed 2019, controlled with Lisinopril 10mg daily\n• Type 2 Diabetes — HbA1c 6.8%, managed with Metformin\n• No surgical history" },
  { key: "medications", title: "Current Medications", icon: Pill, content: "1. Lisinopril 10mg — once daily (antihypertensive)\n2. Aspirin 81mg — once daily (antiplatelet)\n3. Metformin 500mg — twice daily (antidiabetic)" },
  { key: "allergies", title: "Allergies", icon: AlertTriangle, content: "NKDA (No Known Drug Allergies)" },
  { key: "vitals", title: "Vital Signs", icon: Activity, content: "BP: 158/95 mmHg  |  HR: 82 bpm  |  Temp: 98.6°F  |  SpO2: 98%  |  RR: 16 breaths/min  |  Weight: 82 kg" },
  { key: "assessment", title: "Clinical Assessment", icon: Brain, content: "Hypertensive urgency with secondary headache. Elevated blood pressure requires immediate pharmacological management. Risk of hypertensive emergency if left uncontrolled." },
  { key: "plan", title: "Treatment Plan", icon: CheckCircle, content: "1. Increase Lisinopril to 20mg once daily\n2. Initiate Amlodipine 5mg once daily\n3. Home BP monitoring — twice daily log\n4. Follow-up in 48 hours for BP reassessment\n5. Lifestyle modifications: DASH diet, reduce sodium, aerobic exercise 30 min/day" },
];

const diagnoses = [
  { name: "Hypertensive Urgency", confidence: 92, icd: "I16.0", severity: "high" },
  { name: "Tension-Type Headache", confidence: 78, icd: "G44.2", severity: "medium" },
  { name: "Migraine without Aura", confidence: 34, icd: "G43.0", severity: "low" },
];

const treatments = [
  { text: "Increase antihypertensive medication dosage", type: "Medication" },
  { text: "Add calcium channel blocker (Amlodipine 5mg)", type: "Medication" },
  { text: "Daily blood pressure monitoring at home", type: "Monitoring" },
  { text: "Follow-up appointment within 48 hours", type: "Follow-up" },
  { text: "Lifestyle modifications counseling (DASH diet)", type: "Counseling" },
];

const NewConsultation = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [expandedSections, setExpandedSections] = useState(["complaint", "vitals", "assessment", "plan"]);

  const toggleSection = (key) => {
    setExpandedSections(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const transcriptLines = [
    { speaker: "Doctor", text: "Good morning. What brings you in today?" },
    { speaker: "Patient", text: "I've been having these terrible headaches for about three days now. They won't go away." },
    { speaker: "Doctor", text: "Can you describe the pain? Where is it located and how severe is it on a scale of 1-10?" },
    { speaker: "Patient", text: "It's mostly in the front of my head, like a pressure. I'd say about a 7. I also feel dizzy sometimes." },
    { speaker: "Doctor", text: "Have you been monitoring your blood pressure at home?" },
    { speaker: "Patient", text: "Yes, it's been higher than usual. Around 155 over 90." },
  ];

  const getSeverityColor = (s) => {
    if (s === "high") return "text-red-600 bg-red-50";
    if (s === "medium") return "text-amber-600 bg-amber-50";
    return "text-emerald-600 bg-emerald-50";
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

          {/* Mic Button */}
          <div className="flex flex-col items-center py-6 sm:py-8 border-b border-border/50">
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`w-18 h-18 sm:w-22 sm:h-22 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-110"
                : "bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105"
                }`}
              style={{ width: isRecording ? '88px' : '76px', height: isRecording ? '88px' : '76px' }}
            >
              {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>

            {isRecording && (
              <div className="flex items-end gap-1 mt-4 h-8">
                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                  <div key={i} className={`w-1 bg-primary rounded-full animate-waveform${i > 1 ? `-delay-${Math.min(i - 1, 4)}` : ''}`}
                    style={{ animationDelay: `${i * 0.08}s`, height: `${8 + Math.random() * 16}px` }} />
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-3">
              {isRecording ? "Listening... Click to stop" : "Click to start recording"}
            </p>
          </div>

          {/* Transcript */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Transcript</p>
            {transcriptLines.map((line, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold flex-shrink-0 mt-0.5 ${line.speaker === "Doctor"
                  ? "bg-primary/10 text-primary"
                  : "bg-slate-100 text-slate-600"
                  }`}>
                  {line.speaker === "Doctor" ? <Stethoscope className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
                  {line.speaker}
                </span>
                <p className="text-sm text-foreground leading-relaxed">{line.text}</p>
              </div>
            ))}
          </div>

          {/* Generate Button */}
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-t border-border">
            <button className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Generate EMR
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
                <p className="text-[10px] text-muted-foreground">AI-generated medical record</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <button className="px-2.5 py-1.5 text-[11px] font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors flex items-center gap-1">
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
                        defaultValue={section.content}
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
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
              <Shield className="w-3 h-3" /> High Triage
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-5">

            {/* Alert Banner */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-red-700">Hypertensive Emergency Risk</p>
                <p className="text-xs text-red-600 mt-0.5 leading-relaxed">BP reading exceeds urgent threshold. Immediate evaluation and management recommended.</p>
              </div>
            </div>

            {/* AI Confidence Gauge */}
            <div className="flex flex-col items-center py-2">
              <div className="relative w-28 h-28">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 52 * 0.92} ${2 * Math.PI * 52}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-foreground">92%</span>
                  <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">AI Confidence</span>
                </div>
              </div>
            </div>

            {/* Top Diagnoses */}
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Top Diagnoses</p>
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
            </div>

            {/* Treatment Recommendations */}
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Treatment Recommendations</p>
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
            </div>

            {/* Patient-Friendly Summary */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Patient-Friendly Summary</p>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                Your blood pressure is higher than normal, which is causing your headaches and dizziness.
                We're adjusting your medication and adding a new one to help bring it down.
                It's important to check your blood pressure at home twice a day and come back in 2 days.
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
