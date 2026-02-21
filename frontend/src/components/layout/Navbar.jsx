import { Bell, LogOut, ChevronDown, Activity, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="h-14 sm:h-16 bg-card border-b border-border px-3 sm:px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile hamburger menu */}
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg hover:bg-muted transition-colors lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary flex items-center justify-center">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-foreground leading-none">CavistaMed AI</h1>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-none mt-0.5 hidden xs:block">AI Clinical Co-Pilot</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button className="relative p-1.5 sm:p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs sm:text-sm font-semibold text-primary">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-foreground leading-none">{user?.name}</p>
              <p className="text-[11px] text-muted-foreground capitalize">{user?.role}</p>
            </div>
            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground hidden sm:block" />
          </button>

          {showDropdown && (
            <>
              {/* Invisible click-away overlay */}
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-card rounded-xl border border-border shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-sm font-medium text-foreground sm:hidden">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">ID: {user?.id}</p>
                </div>
                <button
                  onClick={() => { logout(); setShowDropdown(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
