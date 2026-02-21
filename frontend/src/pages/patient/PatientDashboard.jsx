import DashboardLayout from "@/components/layout/DashboardLayout";
import StatsCard from "@/components/shared/StatsCard";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  ClipboardList, Pill, FolderHeart, Brain, UserCog, Camera,
  Calendar, Stethoscope, AlertCircle, Download, Clock, FileText
} from "lucide-react";

const sidebarItems = [
  { label: "My Consultations", path: "/patient", icon: ClipboardList },
  { label: "Prescriptions", path: "/patient/prescriptions", icon: Pill },
  { label: "Health Records", path: "/patient/records", icon: FolderHeart },
  { label: "Medicine Info", path: "/patient/medicine-info", icon: Camera },
  { label: "AI Summary", path: "/patient/ai-summary", icon: Brain },
  { label: "Profile Settings", path: "/patient/settings", icon: UserCog },
];

const consultations = [
  { date: "Feb 18, 2026", doctor: "Dr. James Carter", diagnosis: "Hypertensive Urgency", icd: "I16.0", status: "completed" },
  { date: "Feb 10, 2026", doctor: "Dr. Priya Sharma", diagnosis: "Tension Headache", icd: "G44.2", status: "completed" },
  { date: "Jan 28, 2026", doctor: "Dr. James Carter", diagnosis: "Annual Checkup", icd: "Z00.0", status: "completed" },
  { date: "Jan 15, 2026", doctor: "Dr. Michael Brown", diagnosis: "Upper Respiratory Infection", icd: "J06.9", status: "completed" },
];

const prescriptions = [
  { name: "Lisinopril 20mg", frequency: "Once daily", start: "Feb 18", status: "Active" },
  { name: "Amlodipine 5mg", frequency: "Once daily", start: "Feb 18", status: "Active" },
  { name: "Aspirin 81mg", frequency: "Once daily", start: "Jan 2025", status: "Active" },
];

const PatientDashboard = () => {
  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Patient Health Portal" subtitle="Welcome, Emily Richards — PAT-1087">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard label="Upcoming Appointments" value={1} icon={Calendar} trend="Feb 20, 2026" />
          <StatsCard label="Last Diagnosis" value="Hypertension" icon={Stethoscope} trend="Feb 18, 2026" />
          <StatsCard label="Active Prescriptions" value={3} icon={Pill} trend="All on schedule" trendUp />
          <StatsCard label="Health Alerts" value={1} icon={AlertCircle} trend="BP monitoring" />
        </div>

        {/* Consultation History */}
        <div className="panel">
          <div className="panel-header flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Consultation History</h3>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
              <Download className="w-3.5 h-3.5" /> Download All EMRs
            </button>
          </div>
          <div className="panel-body space-y-4">
            {consultations.map((c, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.diagnosis}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.doctor} · {c.date}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-mono rounded-lg">{c.icd}</span>
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                </div>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0" title="Download PDF">
                  <Download className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Prescriptions */}
          <div className="panel">
            <div className="panel-header">
              <h3 className="font-semibold text-foreground">Active Prescriptions</h3>
            </div>
            <div className="panel-body space-y-3">
              {prescriptions.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary">
                  <div className="flex items-center gap-3">
                    <Pill className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.frequency} · Since {p.start}</p>
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
              <h3 className="font-semibold text-foreground">AI Health Summary</h3>
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div className="panel-body space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Latest Diagnosis Explained</h4>
                <p className="text-sm text-foreground leading-relaxed">
                  Your recent visit showed that your blood pressure was too high, a condition called hypertensive urgency. 
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
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <FileText className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-xs font-semibold text-primary">⏰ Follow-up Reminder</p>
                <p className="text-sm text-foreground mt-1">Your next appointment is on <strong>February 20, 2026</strong> with Dr. James Carter.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
