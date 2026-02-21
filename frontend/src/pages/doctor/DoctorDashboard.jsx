import DashboardLayout from "@/components/layout/DashboardLayout";
import StatsCard from "@/components/shared/StatsCard";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  LayoutDashboard, FilePlus, Users, ClipboardList, Brain, Settings,
  UserCheck, Stethoscope, AlertTriangle, Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const sidebarItems = [
  { label: "Dashboard Overview", path: "/doctor", icon: LayoutDashboard },
  { label: "New Consultation", path: "/doctor/consultation", icon: FilePlus },
  { label: "My Patients", path: "/doctor/patients", icon: Users },
  { label: "Consultation History", path: "/doctor/history", icon: ClipboardList },
  { label: "AI Insights", path: "/doctor/insights", icon: Brain },
  { label: "Settings", path: "/doctor/settings", icon: Settings },
];

const recentDiagnoses = [
  { patient: "Maria Santos", diagnosis: "Type 2 Diabetes Mellitus", icd: "E11.9", time: "10 min ago", status: "completed" },
  { patient: "John Williams", diagnosis: "Essential Hypertension", icd: "I10", time: "25 min ago", status: "completed" },
  { patient: "Linda Chen", diagnosis: "Acute Bronchitis", icd: "J20.9", time: "1 hr ago", status: "processing" },
  { patient: "Robert Davis", diagnosis: "Major Depressive Disorder", icd: "F32.9", time: "2 hr ago", status: "completed" },
];

const DoctorDashboard = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Doctor Clinical Workspace" subtitle="Welcome back, Dr. James Carter">
      <div className="space-y-4 sm:space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <StatsCard label="Total Patients Today" value={24} icon={UserCheck} trend="+3 from yesterday" trendUp />
          <StatsCard label="Active Consultations" value={3} icon={Stethoscope} trend="2 pending review" />
          <StatsCard label="AI Alerts" value={5} icon={AlertTriangle} trend="1 critical" />
          <StatsCard label="Recent Diagnoses" value={18} icon={Activity} trend="+12% this week" trendUp />
        </div>

        {/* Quick action */}
        <div className="panel">
          <div className="panel-body flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-foreground text-sm sm:text-base">Start New Consultation</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">Begin an AI-assisted consultation session</p>
            </div>
            <button
              onClick={() => navigate("/doctor/consultation")}
              className="w-full sm:w-auto px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              New Consultation
            </button>
          </div>
        </div>

        {/* Recent diagnoses */}
        <div className="panel">
          <div className="panel-header">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">Recent Diagnoses</h3>
          </div>

          {/* Mobile card layout */}
          <div className="sm:hidden panel-body space-y-3">
            {recentDiagnoses.map((d, i) => (
              <div key={i} className="p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">{d.patient}</p>
                  <StatusBadge status={d.status} />
                </div>
                <p className="text-xs text-muted-foreground">{d.diagnosis}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-mono rounded-lg">{d.icd}</span>
                  <span className="text-[10px] text-muted-foreground">{d.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table layout */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Patient</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Diagnosis</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">ICD Code</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Time</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentDiagnoses.map((d, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{d.patient}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{d.diagnosis}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-primary/10 text-primary text-xs font-mono rounded-lg">{d.icd}</span></td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{d.time}</td>
                    <td className="px-6 py-4"><StatusBadge status={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
