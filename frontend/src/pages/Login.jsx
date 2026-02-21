import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Activity, Shield, Stethoscope, User } from "lucide-react";

const roles = [
  { role: "admin", label: "Administrator", icon: Shield, description: "System management & analytics" },
  { role: "doctor", label: "Doctor", icon: Stethoscope, description: "Clinical workspace & consultations" },
  { role: "patient", label: "Patient", icon: User, description: "Health portal & records" },
];

const Login = () => {
  const [selectedRole, setSelectedRole] = useState("doctor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    login(selectedRole);
    const paths = { admin: "/admin", doctor: "/doctor", patient: "/patient" };
    navigate(paths[selectedRole]);
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h1 className="text-lg sm:text-xl font-bold text-foreground">CavistaMed AI</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground">AI Clinical Co-Pilot</p>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2 className="text-lg font-semibold text-foreground">Sign In</h2>
            <p className="text-sm text-muted-foreground mt-1">Select your role and enter credentials</p>
          </div>

          <form onSubmit={handleLogin} className="panel-body space-y-5">
            {/* Role Selection */}
            <div className="grid grid-cols-3 gap-2">
              {roles.map(({ role, label, icon: Icon, description }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${selectedRole === role
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/30"
                    }`}
                >
                  <Icon className={`w-5 h-5 mx-auto mb-1 ${selectedRole === role ? "text-primary" : "text-muted-foreground"}`} />
                  <p className={`text-xs font-medium ${selectedRole === role ? "text-primary" : "text-foreground"}`}>{label}</p>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@hospital.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Sign In as {roles.find(r => r.role === selectedRole)?.label}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              Protected by enterprise-grade encryption
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
