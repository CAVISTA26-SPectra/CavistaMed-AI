import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { LayoutDashboard, FilePlus, Users, ClipboardList, Brain, Settings, Mic, MicOff, FileText, Download, Send, ChevronDown, ChevronRight, AlertTriangle, CheckCircle } from "lucide-react";

const sidebarItems = [
  { label: "Dashboard Overview", path: "/doctor", icon: LayoutDashboard },
  { label: "New Consultation", path: "/doctor/consultation", icon: FilePlus },
  { label: "My Patients", path: "/doctor/patients", icon: Users },
  { label: "Consultation History", path: "/doctor/history", icon: ClipboardList },
  { label: "AI Insights", path: "/doctor/insights", icon: Brain },
  { label: "Settings", path: "/doctor/settings", icon: Settings },
];

const emrSections = [
  { key: "complaint", title: "Chief Complaint", content: "Patient presents with persistent headache and dizziness for 3 days." },
  { key: "hpi", title: "History of Present Illness", content: "Onset 3 days ago, worsening, associated with visual disturbances. No prior history of migraines." },
  { key: "pmh", title: "Past Medical History", content: "Hypertension (diagnosed 2019), controlled with Lisinopril 10mg daily." },
  { key: "medications", title: "Medications", content: "Lisinopril 10mg daily, Aspirin 81mg daily." },
  { key: "allergies", title: "Allergies", content: "NKDA (No Known Drug Allergies)" },
  { key: "vitals", title: "Vitals", content: "BP: 158/95 mmHg | HR: 82 bpm | Temp: 98.6°F | SpO2: 98%" },
  { key: "assessment", title: "Assessment", content: "Hypertensive urgency with secondary headache. Elevated BP requires immediate management." },
  { key: "plan", title: "Plan", content: "1. Increase Lisinopril to 20mg daily\n2. Add Amlodipine 5mg daily\n3. Follow-up in 48 hours\n4. Monitor BP at home twice daily" },
];

const diagnoses = [
  { name: "Hypertensive Urgency", confidence: 92, icd: "I16.0" },
  { name: "Tension-Type Headache", confidence: 78, icd: "G44.2" },
  { name: "Migraine without Aura", confidence: 34, icd: "G43.0" },
];

const NewConsultation = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [expandedSections, setExpandedSections] = useState(["complaint", "vitals", "assessment"]);

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

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="New Consultation" subtitle="AI-Assisted Clinical Session">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* LEFT - Live Consultation */}
        <div className="panel flex flex-col">
          <div className="panel-header flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Live Consultation</h3>
            <span className={`badge-status ${isRecording ? "bg-status-recording/10 text-status-recording" : "bg-muted text-muted-foreground"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isRecording ? "bg-status-recording animate-pulse" : "bg-muted-foreground"}`} />
              {isRecording ? "Recording" : "Idle"}
            </span>
          </div>

          <div className="panel-body flex-1 flex flex-col">
            {/* Mic Button */}
            <div className="flex flex-col items-center py-6">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-110"
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
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
            <div className="flex-1 space-y-3 max-h-80 overflow-y-auto">
              {transcriptLines.map((line, i) => (
                <div key={i} className="flex gap-2">
                  <span className={`badge-status flex-shrink-0 mt-0.5 ${line.speaker === "Doctor" ? "bg-primary/10 text-primary" : "bg-foreground/10 text-foreground"
                    }`}>
                    {line.speaker}
                  </span>
                  <p className="text-sm text-foreground">{line.text}</p>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Generate EMR
            </button>
          </div>
        </div>

        {/* CENTER - Structured EMR */}
        <div className="panel flex flex-col">
          <div className="panel-header flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Structured EMR</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors flex items-center gap-1">
                <Download className="w-3 h-3" /> PDF
              </button>
              <button className="px-3 py-1.5 text-xs font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1">
                <Send className="w-3 h-3" /> Push to EMR
              </button>
            </div>
          </div>

          <div className="panel-body space-y-2 max-h-[600px] overflow-y-auto">
            {emrSections.map((section) => {
              const isOpen = expandedSections.includes(section.key);
              return (
                <div key={section.key} className="border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleSection(section.key)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm font-medium text-foreground">{section.title}</span>
                    {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3">
                      <textarea
                        defaultValue={section.content}
                        className="w-full bg-secondary rounded-lg p-3 text-sm text-foreground border-0 focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none min-h-[60px]"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT - AI Diagnostic Insights */}
        <div className="panel flex flex-col">
          <div className="panel-header flex items-center justify-between">
            <h3 className="font-semibold text-foreground">AI Diagnostic Insights</h3>
            <span className="badge-status bg-status-recording/10 text-status-recording">
              <span className="w-1.5 h-1.5 rounded-full bg-status-recording" /> High Triage
            </span>
          </div>

          <div className="panel-body space-y-5 max-h-[600px] overflow-y-auto">
            {/* Alert */}
            <div className="alert-banner">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold">Hypertensive Emergency Risk</p>
                <p className="text-xs mt-0.5 opacity-80">BP reading exceeds urgent threshold. Immediate evaluation recommended.</p>
              </div>
            </div>

            {/* Confidence Meter */}
            <div className="flex items-center justify-center">
              <div className="relative w-28 h-28">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 52 * 0.92} ${2 * Math.PI * 52}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">92%</span>
                  <span className="text-[10px] text-muted-foreground">AI Confidence</span>
                </div>
              </div>
            </div>

            {/* Diagnoses */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Top Diagnoses</h4>
              <div className="space-y-3">
                {diagnoses.map((d, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{d.name}</span>
                      <span className="text-sm font-semibold text-primary">{d.confidence}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${d.confidence}%` }} />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">ICD-10: {d.icd}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Treatment */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Treatment Recommendations</h4>
              <ul className="space-y-2">
                {["Increase antihypertensive medication dosage", "Add calcium channel blocker", "Daily BP monitoring at home", "Follow-up within 48 hours", "Lifestyle modifications counseling"].map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-status-completed flex-shrink-0 mt-0.5" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Patient Summary */}
            <div className="bg-secondary rounded-xl p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Patient-Friendly Summary</h4>
              <p className="text-sm text-foreground leading-relaxed">
                Your blood pressure is higher than normal, which is causing your headaches and dizziness.
                We're adjusting your medication and adding a new one to help bring it down.
                It's important to check your blood pressure at home twice a day and come back in 2 days.
              </p>
              <button className="mt-3 text-xs font-medium text-primary hover:underline flex items-center gap-1">
                <Download className="w-3 h-3" /> Download Summary
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewConsultation;
