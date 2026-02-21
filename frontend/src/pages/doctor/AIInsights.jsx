import DashboardLayout from "@/components/layout/DashboardLayout";
import StatsCard from "@/components/shared/StatsCard";
import {
  LayoutDashboard, FilePlus, Users, ClipboardList, Brain, Settings,
  TrendingUp, AlertTriangle, CheckCircle, BarChart3, Target, Zap, ShieldCheck
} from "lucide-react";

const sidebarItems = [
  { label: "Dashboard Overview", path: "/doctor", icon: LayoutDashboard },
  { label: "New Consultation", path: "/doctor/consultation", icon: FilePlus },
  { label: "My Patients", path: "/doctor/patients", icon: Users },
  { label: "Consultation History", path: "/doctor/history", icon: ClipboardList },
  { label: "AI Insights", path: "/doctor/insights", icon: Brain },
  { label: "Settings", path: "/doctor/settings", icon: Settings },
];

const recentInsights = [
  { type: "alert", title: "Recurring Hypertension Pattern", desc: "3 patients this week presented with uncontrolled hypertension. Consider reviewing medication adherence protocols.", time: "2 hrs ago" },
  { type: "trend", title: "Respiratory Cases Increasing", desc: "18% increase in respiratory infections this month vs last month. Seasonal pattern detected.", time: "5 hrs ago" },
  { type: "success", title: "Diabetes Management Improving", desc: "Average HbA1c levels for your diabetic patients decreased by 0.4% over 3 months.", time: "1 day ago" },
  { type: "alert", title: "Potential Drug Interaction Flagged", desc: "Patient PAT-1045 is on Warfarin + Aspirin. Review bleeding risk assessment.", time: "1 day ago" },
  { type: "trend", title: "AI Diagnostic Accuracy Up", desc: "Your AI-assisted diagnoses matched final diagnoses 94% of the time this month.", time: "2 days ago" },
];

const topDiagnoses = [
  { name: "Essential Hypertension", icd: "I10", count: 42, pct: 28 },
  { name: "Type 2 Diabetes Mellitus", icd: "E11.9", count: 36, pct: 24 },
  { name: "Acute Bronchitis", icd: "J20.9", count: 24, pct: 16 },
  { name: "Major Depressive Disorder", icd: "F32.9", count: 18, pct: 12 },
  { name: "Tension-Type Headache", icd: "G44.2", count: 15, pct: 10 },
  { name: "Low Back Pain", icd: "M54.5", count: 12, pct: 8 },
];

const confidenceTrend = [
  { week: "Week 1", avg: 82 },
  { week: "Week 2", avg: 85 },
  { week: "Week 3", avg: 88 },
  { week: "Week 4", avg: 91 },
];

const AIInsights = () => {
  return (
    <DashboardLayout sidebarItems={sidebarItems} title="AI Insights" subtitle="AI-powered clinical analytics and recommendations">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard label="AI Accuracy Rate" value="94%" icon={Target} trend="+2% this month" trendUp />
          <StatsCard label="Insights Generated" value={127} icon={Brain} trend="This month" />
          <StatsCard label="Critical Alerts" value={3} icon={AlertTriangle} trend="Needs review" />
          <StatsCard label="Patients Analyzed" value={186} icon={Zap} trend="+24 this week" trendUp />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="panel">
            <div className="panel-header flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Recent AI Insights</h3>
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div className="panel-body space-y-3 max-h-[480px] overflow-y-auto">
              {recentInsights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    insight.type === "alert" ? "bg-primary/10" : insight.type === "trend" ? "bg-accent/10" : "bg-[hsl(var(--badge-completed))]/10"
                  }`}>
                    {insight.type === "alert" ? <AlertTriangle className="w-4 h-4 text-primary" /> :
                     insight.type === "trend" ? <TrendingUp className="w-4 h-4 text-accent" /> :
                     <CheckCircle className="w-4 h-4 text-[hsl(var(--badge-completed))]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{insight.title}</p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{insight.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{insight.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Your Top Diagnoses</h3>
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div className="panel-body space-y-3">
              {topDiagnoses.map((d, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">{d.name}</span>
                      <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-mono rounded">{d.icd}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{d.count} ({d.pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="panel">
            <div className="panel-header flex items-center justify-between">
              {/* <h3 className="font-semibold text-foreground">AI Confidence Trend (4 Weeks)</h3> */}
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="panel-body">
              <div className="flex items-end gap-4 h-48">
                {confidenceTrend.map((w, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-sm font-semibold text-primary">{w.avg}%</span>
                    <div className="w-full bg-muted rounded-t-lg relative" style={{ height: `${w.avg * 1.5}px` }}>
                      <div className="absolute inset-0 bg-primary/20 rounded-t-lg" />
                      <div className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-lg" style={{ height: `${w.avg * 1.2}px` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{w.week}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header flex items-center justify-between">
              <h3 className="font-semibold text-foreground">AI Recommendations</h3>
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div className="panel-body space-y-3">
              {[
                { title: "Review Polypharmacy Cases", desc: "5 patients are on 5+ medications. Consider medication reconciliation.", priority: "High" },
                { title: "Schedule Follow-ups", desc: "8 patients with hypertension haven't had a follow-up in 30+ days.", priority: "Medium" },
                { title: "Update Treatment Plans", desc: "3 patients have outdated treatment plans (>90 days old).", priority: "Medium" },
                { title: "Lab Results Pending", desc: "12 patients have pending lab results that may affect diagnoses.", priority: "Low" },
              ].map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-secondary">
                  <div className={`px-2 py-0.5 rounded text-[10px] font-semibold flex-shrink-0 mt-0.5 ${
                    rec.priority === "High" ? "bg-primary/10 text-primary" :
                    rec.priority === "Medium" ? "bg-accent/10 text-accent" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {rec.priority}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{rec.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{rec.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIInsights;
