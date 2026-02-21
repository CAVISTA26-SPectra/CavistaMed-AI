import { useState, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  ClipboardList, Pill, FolderHeart, Brain, UserCog, Camera,
  Upload, X, AlertTriangle, CheckCircle, Info, Clock, ShieldCheck
} from "lucide-react";

const sidebarItems = [
  { label: "My Consultations", path: "/patient", icon: ClipboardList },
  { label: "Prescriptions", path: "/patient/prescriptions", icon: Pill },
  { label: "Health Records", path: "/patient/records", icon: FolderHeart },
  { label: "Medicine Info", path: "/patient/medicine-info", icon: Camera },
  { label: "AI Summary", path: "/patient/ai-summary", icon: Brain },
  { label: "Profile Settings", path: "/patient/settings", icon: UserCog },
];

const mockMedicineData = {
  default: {
    name: "Lisinopril",
    genericName: "Lisinopril",
    category: "ACE Inhibitor — Antihypertensive",
    dosageForm: "Tablet",
    strength: "20mg",
    manufacturer: "Zydus Pharmaceuticals",
    uses: [
      "Treats high blood pressure (hypertension)",
      "Helps prevent heart attacks and strokes",
      "Treats heart failure",
      "Protects kidneys in diabetic patients",
    ],
    sideEffects: [
      "Dry cough (most common)",
      "Dizziness or lightheadedness",
      "Headache",
      "Fatigue",
      "Nausea",
    ],
    warnings: [
      "Do not use if pregnant — can cause birth defects",
      "Avoid potassium supplements unless directed by doctor",
      "May cause low blood pressure — rise slowly from sitting",
      "Report swelling of face, lips, or throat immediately",
    ],
    storage: "Store at room temperature (20-25°C). Keep away from moisture and heat.",
    interactions: [
      "NSAIDs (ibuprofen) — may reduce effectiveness",
      "Potassium-sparing diuretics — risk of high potassium",
      "Lithium — increased lithium levels",
      "Aliskiren — avoid combination in diabetic patients",
    ],
  },
};

const MedicineInfo = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUploadedImage(ev.target?.result);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (!uploadedImage) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setResult(mockMedicineData.default);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleClear = () => {
    setUploadedImage(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Medicine Info" subtitle="Upload a photo of your medicine to get detailed information">
      <div className="space-y-6">
        <div className="panel">
          <div className="panel-header flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Upload Medicine Photo</h3>
            <Camera className="w-5 h-5 text-primary" />
          </div>
          <div className="panel-body">
            {!uploadedImage ? (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
                <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground">Click to upload or drag & drop</p>
                <p className="text-xs text-muted-foreground mt-1">Take a clear photo of the medicine packaging, label, or tablet</p>
                <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG up to 10MB</p>
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden bg-secondary flex items-center justify-center max-h-72">
                  <img src={uploadedImage} alt="Uploaded medicine" className="max-h-72 object-contain" />
                  <button onClick={handleClear} className="absolute top-3 right-3 w-8 h-8 bg-card/90 rounded-full flex items-center justify-center hover:bg-card transition-colors shadow-sm">
                    <X className="w-4 h-4 text-foreground" />
                  </button>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleAnalyze} disabled={isAnalyzing}
                    className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {isAnalyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4" /> Identify Medicine
                      </>
                    )}
                  </button>
                  <button onClick={handleClear} className="px-4 py-2.5 border border-input rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="panel">
              <div className="panel-body flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Pill className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground">{result.name}</h3>
                  <p className="text-sm text-muted-foreground">{result.genericName} · {result.strength} · {result.dosageForm}</p>
                  <p className="text-xs text-muted-foreground mt-1">{result.category}</p>
                  <p className="text-xs text-muted-foreground">Manufactured by {result.manufacturer}</p>
                </div>
                <span className="badge-status bg-[hsl(var(--badge-completed))]/10 text-[hsl(var(--badge-completed))]">
                  <CheckCircle className="w-3 h-3" /> Identified
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="panel">
                <div className="panel-header flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground">Uses & Indications</h3>
                </div>
                <div className="panel-body">
                  <ul className="space-y-2">
                    {result.uses.map((use, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle className="w-4 h-4 text-[hsl(var(--badge-completed))] flex-shrink-0 mt-0.5" />
                        {use}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-accent" />
                  <h3 className="font-semibold text-foreground">Possible Side Effects</h3>
                </div>
                <div className="panel-body">
                  <ul className="space-y-2">
                    {result.sideEffects.map((se, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-2" />
                        {se}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground">Warnings & Precautions</h3>
                </div>
                <div className="panel-body">
                  <ul className="space-y-2">
                    {result.warnings.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <AlertTriangle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header flex items-center gap-2">
                  <Pill className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground">Drug Interactions</h3>
                </div>
                <div className="panel-body">
                  <ul className="space-y-2">
                    {result.interactions.map((int, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                        {int}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-body flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Storage Instructions</p>
                  <p className="text-sm text-foreground">{result.storage}</p>
                </div>
              </div>
            </div>

            <div className="alert-banner">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold">Disclaimer</p>
                <p className="text-xs mt-0.5 opacity-80">This information is AI-generated for reference only. Always consult your doctor or pharmacist before making any changes to your medication.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MedicineInfo;
