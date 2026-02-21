import DashboardLayout from "@/components/layout/DashboardLayout";
import StatsCard from "@/components/shared/StatsCard";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  LayoutDashboard, UserCog, Users, Database, FileText, BarChart3, Settings,
  Stethoscope, Activity, Cpu, Search, Plus, ChevronLeft, ChevronRight
} from "lucide-react";
import { useState } from "react";

const sidebarItems = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard },
  { label: "Manage Doctors", path: "/admin/doctors", icon: UserCog },
  { label: "Manage Patients", path: "/admin/patients", icon: Users },
  { label: "EMR Integration", path: "/admin/emr", icon: Database },
  { label: "System Logs", path: "/admin/logs", icon: FileText },
  { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];

const doctors = [
  { id: "DOC-042", name: "Dr. James Carter", specialty: "Cardiology", status: "active", patients: 142 },
  { id: "DOC-018", name: "Dr. Priya Sharma", specialty: "Neurology", status: "active", patients: 98 },
  { id: "DOC-067", name: "Dr. Michael Brown", specialty: "General Medicine", status: "active", patients: 215 },
  { id: "DOC-023", name: "Dr. Sarah Kim", specialty: "Pediatrics", status: "inactive", patients: 67 },
  { id: "DOC-051", name: "Dr. Ahmed Hassan", specialty: "Orthopedics", status: "active", patients: 178 },
];

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDoctors = doctors.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="System Administration Panel" subtitle="Manage the CavistaMed AI platform">
      <div className="space-y-4 sm:space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
          <StatsCard label="Total Doctors" value={48} icon={Stethoscope} trend="+2 this month" trendUp />
          <StatsCard label="Total Patients" value="2,847" icon={Users} trend="+124 this week" trendUp />
          <StatsCard label="Total Consultations" value="12,493" icon={Activity} trend="+89 today" trendUp />
          <StatsCard label="Active AI Sessions" value={17} icon={Cpu} />
          <StatsCard label="System Status" value="Online" icon={Activity} trend="99.9% uptime" trendUp />
        </div>

        {/* Manage Doctors */}
        <div className="panel">
          <div className="panel-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">Manage Doctors</h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all"
                />
              </div>
              <button className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Add Doctor
              </button>
            </div>
          </div>

          {/* Mobile card layout */}
          <div className="sm:hidden panel-body space-y-3">
            {filteredDoctors.map((doc) => (
              <div key={doc.id} className="p-3 rounded-xl border border-border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{doc.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{doc.id}</p>
                  </div>
                  <StatusBadge status={doc.status} />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">{doc.specialty}</p>
                  <p className="text-xs text-foreground">{doc.patients} patients</p>
                </div>
                <div className="flex gap-3 mt-3 pt-2 border-t border-border">
                  <button className="text-xs font-medium text-primary hover:underline">Edit</button>
                  <button className="text-xs font-medium text-muted-foreground hover:underline">Disable</button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">ID</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Specialty</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Patients</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.map((doc) => (
                  <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{doc.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{doc.name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{doc.specialty}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{doc.patients}</td>
                    <td className="px-6 py-4"><StatusBadge status={doc.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="text-xs font-medium text-primary hover:underline">Edit</button>
                        <button className="text-xs font-medium text-muted-foreground hover:underline">Disable</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Showing {filteredDoctors.length} of {doctors.length} doctors</p>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg hover:bg-muted transition-colors"><ChevronLeft className="w-4 h-4 text-muted-foreground" /></button>
              <span className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-lg">1</span>
              <button className="p-1.5 rounded-lg hover:bg-muted transition-colors"><ChevronRight className="w-4 h-4 text-muted-foreground" /></button>
            </div>
          </div>
        </div>

        {/* Analytics Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <div className="panel">
            <div className="panel-header">
              <h3 className="font-semibold text-foreground">Diagnosis Distribution</h3>
            </div>
            <div className="panel-body">
              <div className="space-y-3">
                {[
                  { name: "Hypertension", count: 342, pct: 28 },
                  { name: "Type 2 Diabetes", count: 289, pct: 24 },
                  { name: "Respiratory Infections", count: 198, pct: 16 },
                  { name: "Musculoskeletal", count: 156, pct: 13 },
                  { name: "Mental Health", count: 134, pct: 11 },
                  { name: "Other", count: 98, pct: 8 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm text-foreground w-40 truncate">{item.name}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${item.pct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-16 text-right">{item.count} ({item.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h3 className="font-semibold text-foreground">Top ICD Codes</h3>
            </div>
            <div className="panel-body">
              <div className="space-y-2">
                {[
                  { code: "I10", desc: "Essential Hypertension", count: 342 },
                  { code: "E11.9", desc: "Type 2 DM without complications", count: 289 },
                  { code: "J06.9", desc: "Acute upper respiratory infection", count: 198 },
                  { code: "M54.5", desc: "Low back pain", count: 156 },
                  { code: "F32.9", desc: "Major depressive disorder", count: 134 },
                  { code: "J20.9", desc: "Acute bronchitis, unspecified", count: 98 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-mono rounded-lg">{item.code}</span>
                      <span className="text-sm text-foreground">{item.desc}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
