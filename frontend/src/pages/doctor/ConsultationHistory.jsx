import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  LayoutDashboard, FilePlus, Users, ClipboardList, Brain, Settings,
  Search, Calendar, Download, Eye, Filter, ChevronLeft, ChevronRight
} from "lucide-react";

const sidebarItems = [
  { label: "Dashboard Overview", path: "/doctor", icon: LayoutDashboard },
  { label: "New Consultation", path: "/doctor/consultation", icon: FilePlus },
  { label: "My Patients", path: "/doctor/patients", icon: Users },
  { label: "Consultation History", path: "/doctor/history", icon: ClipboardList },
  { label: "AI Insights", path: "/doctor/insights", icon: Brain },
  { label: "Settings", path: "/doctor/settings", icon: Settings },
];

const consultations = [
  { id: "CON-1042", patient: "Maria Santos", patientId: "PAT-1023", diagnosis: "Type 2 Diabetes Mellitus", icd: "E11.9", date: "Feb 21, 2026", time: "09:15 AM", aiConfidence: 94, status: "completed" },
  { id: "CON-1041", patient: "John Williams", patientId: "PAT-1045", diagnosis: "Essential Hypertension", icd: "I10", date: "Feb 21, 2026", time: "08:30 AM", aiConfidence: 89, status: "completed" },
  { id: "CON-1040", patient: "Linda Chen", patientId: "PAT-1087", diagnosis: "Acute Bronchitis", icd: "J20.9", date: "Feb 20, 2026", time: "03:45 PM", aiConfidence: 82, status: "processing" },
  { id: "CON-1039", patient: "Robert Davis", patientId: "PAT-1012", diagnosis: "Major Depressive Disorder", icd: "F32.9", date: "Feb 20, 2026", time: "02:10 PM", aiConfidence: 76, status: "completed" },
  { id: "CON-1038", patient: "Emily Richards", patientId: "PAT-1087", diagnosis: "Hypertensive Urgency", icd: "I16.0", date: "Feb 18, 2026", time: "11:20 AM", aiConfidence: 92, status: "completed" },
  { id: "CON-1037", patient: "David Park", patientId: "PAT-1098", diagnosis: "Tension-Type Headache", icd: "G44.2", date: "Feb 18, 2026", time: "10:00 AM", aiConfidence: 78, status: "completed" },
  { id: "CON-1036", patient: "Sarah Johnson", patientId: "PAT-1034", diagnosis: "Acute Upper Respiratory Infection", icd: "J06.9", date: "Feb 17, 2026", time: "04:30 PM", aiConfidence: 88, status: "completed" },
  { id: "CON-1035", patient: "Michael Brown", patientId: "PAT-1056", diagnosis: "Low Back Pain", icd: "M54.5", date: "Feb 17, 2026", time: "01:15 PM", aiConfidence: 71, status: "completed" },
];

const ConsultationHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDetail, setSelectedDetail] = useState(null);

  const filtered = consultations.filter(c =>
    c.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.icd.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selected = consultations.find(c => c.id === selectedDetail);

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Consultation History" subtitle="View and manage past consultations">
      <div className="space-y-6">
        {/* Filters */}
        <div className="panel">
          <div className="panel-body flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="relative flex-1 w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by patient, diagnosis, ICD code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2.5 w-full rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filter
              </button>
              <button className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Date Range
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Table */}
          <div className="lg:col-span-2 panel">
            <div className="panel-header">
              <h3 className="font-semibold text-foreground">All Consultations ({filtered.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">ID</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Patient</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Diagnosis</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">ICD</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Date</th>
                    {/* <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">AI %</th> */}
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className={`border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer ${selectedDetail === c.id ? "bg-primary/5" : ""}`}
                      onClick={() => setSelectedDetail(c.id)}>
                      <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{c.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{c.patient}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground max-w-[160px] truncate">{c.diagnosis}</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-primary/10 text-primary text-xs font-mono rounded-lg">{c.icd}</span></td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">{c.date}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary">{c.aiConfidence}%</td>
                      <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-1.5 hover:bg-muted rounded-lg transition-colors" title="View"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                          <button className="p-1.5 hover:bg-muted rounded-lg transition-colors" title="Download"><Download className="w-4 h-4 text-muted-foreground" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Showing {filtered.length} consultations</p>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-lg hover:bg-muted transition-colors"><ChevronLeft className="w-4 h-4 text-muted-foreground" /></button>
                <span className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-lg">1</span>
                <span className="px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted rounded-lg cursor-pointer">2</span>
                <button className="p-1.5 rounded-lg hover:bg-muted transition-colors"><ChevronRight className="w-4 h-4 text-muted-foreground" /></button>
              </div>
            </div>
          </div>

          {/* Detail Panel */}
          <div className="panel">
            <div className="panel-header">
              <h3 className="font-semibold text-foreground">Consultation Detail</h3>
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
                    <p className="text-xs text-muted-foreground">{selected.patientId}</p>
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
                  {/* </div>
                  <div> */}
                    <p className="text-xs text-muted-foreground uppercase font-medium">AI Confidence</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${selected.aiConfidence}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-primary">{selected.aiConfidence}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium">Status</p>
                    <div className="mt-1"><StatusBadge status={selected.status} /></div>
                  </div>
                  <div className="pt-2 flex gap-2">
                    <button className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" /> View Full EMR
                    </button>
                    <button className="px-4 py-2.5 border border-input rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-2">
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
    </DashboardLayout>
  );
};

export default ConsultationHistory;
