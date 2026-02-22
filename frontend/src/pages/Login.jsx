import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Activity, Stethoscope, User } from "lucide-react";

const roles = [
  { role: "doctor", label: "Doctor", icon: Stethoscope, description: "Clinical workspace & consultations" },
  { role: "patient", label: "Patient", icon: User, description: "Health portal & records" },
];

const Login = () => {
  const [mode, setMode] = useState("login");
  const [selectedRole, setSelectedRole] = useState("doctor");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      let authedUser;
      if (mode === "signup") {
        authedUser = await signup({
          name,
          email,
          password,
          role: selectedRole,
        });
      } else {
        authedUser = await login({ email, password });
      }

      const role = authedUser?.role;
      const paths = { doctor: "/doctor", patient: "/patient" };
      navigate(paths[role] || "/", { replace: true });
    } catch (authError) {
      setError(authError?.message || "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
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
            <h2 className="text-lg font-semibold text-foreground">{mode === "login" ? "Sign In" : "Create Account"}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "login" ? "Enter your credentials" : "Set up your account to continue"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="panel-body space-y-5">
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted/60">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`py-2 rounded-lg text-sm font-medium transition-colors ${mode === "login" ? "bg-background text-foreground" : "text-muted-foreground"}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`py-2 rounded-lg text-sm font-medium transition-colors ${mode === "signup" ? "bg-background text-foreground" : "text-muted-foreground"}`}
              >
                Sign Up
              </button>
            </div>

            <div className="space-y-3">
              {mode === "signup" && (
                <>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Dr. Alex Morgan"
                      className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {roles.map(({ role, label, icon: Icon }) => (
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
                </>
              )}

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

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              {isSubmitting
                ? "Please wait..."
                : mode === "login"
                  ? "Sign In"
                  : `Create ${roles.find(r => r.role === selectedRole)?.label} Account`}
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
