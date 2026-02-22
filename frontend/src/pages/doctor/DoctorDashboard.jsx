import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatsCard from "@/components/shared/StatsCard";
import StatusBadge from "@/components/shared/StatusBadge";
import { fetchDoctorDashboardOverview } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
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

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [overviewError, setOverviewError] = useState("");
  const [stats, setStats] = useState({
    total_patients_today: 0,
    active_consultations: 0,
    ai_alerts: 0,
    recent_diagnoses: 0,
  });
  const [recentDiagnoses, setRecentDiagnoses] = useState([]);

  useEffect(() => {
    let isActive = true;

    const loadOverview = async () => {
      try {
        setOverviewError("");
        const response = await fetchDoctorDashboardOverview();
        if (!isActive) return;

        setStats(response?.stats || {
          total_patients_today: 0,
          active_consultations: 0,
          ai_alerts: 0,
          recent_diagnoses: 0,
        });
        setRecentDiagnoses(Array.isArray(response?.recent_diagnoses) ? response.recent_diagnoses : []);
      } catch (err) {
        if (!isActive) return;
        setOverviewError(err.message || "Unable to load dashboard overview");
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadOverview();
    return () => {
      isActive = false;
    };
  }, []);

  const subtitle = user?.name ? `Welcome back, ${user.name}` : "Welcome back";

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Doctor Clinical Workspace" subtitle={subtitle}>
      <div className="space-y-4 sm:space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <StatsCard label="Total Patients Today" value={stats.total_patients_today} icon={UserCheck} trend={loading ? "Loading..." : "Updated from live records"} trendUp={stats.total_patients_today > 0} />
          <StatsCard label="Active Consultations" value={stats.active_consultations} icon={Stethoscope} trend="In-progress sessions" />
          <StatsCard label="AI Alerts" value={stats.ai_alerts} icon={AlertTriangle} trend="High triage cases" />
          <StatsCard label="Recent Diagnoses" value={stats.recent_diagnoses} icon={Activity} trend="Latest ICD mapped assessments" trendUp={stats.recent_diagnoses > 0} />
        </div>

        {overviewError ? (
          <div className="panel">
            <div className="panel-body py-3 text-sm text-primary">{overviewError}</div>
          </div>
        ) : null}

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
              <div key={`${d.patient}-${d.time}-${i}`} className="p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">{d.patient}</p>
                  <StatusBadge status={d.status || "completed"} />
                </div>
                <p className="text-xs text-muted-foreground">{d.diagnosis}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-mono rounded-lg">{d.icd}</span>
                  <span className="text-[10px] text-muted-foreground">{d.time}</span>
                </div>
              </div>
            ))}
            {!recentDiagnoses.length && !loading ? (
              <p className="text-xs text-muted-foreground">No diagnoses yet. Start a new consultation to populate live overview data.</p>
            ) : null}
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
                  <tr key={`${d.patient}-${d.time}-${i}`} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{d.patient}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{d.diagnosis}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-primary/10 text-primary text-xs font-mono rounded-lg">{d.icd}</span></td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{d.time}</td>
                    <td className="px-6 py-4"><StatusBadge status={d.status || "completed"} /></td>
                  </tr>
                ))}
                {!recentDiagnoses.length && !loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-6 text-sm text-muted-foreground">No diagnoses yet. Start a new consultation to populate live overview data.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
