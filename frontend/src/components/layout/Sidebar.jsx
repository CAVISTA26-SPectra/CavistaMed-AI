import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const Sidebar = ({ items, collapsed = false, mobileOpen = false, onMobileClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          // Base styles
          "bg-card border-r border-border flex flex-col py-4 transition-all duration-300 z-50",
          // Desktop: static sidebar
          "hidden lg:flex lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)]",
          collapsed ? "lg:w-16" : "lg:w-60",
          // Mobile: fixed overlay sidebar
          mobileOpen && "!flex fixed top-0 left-0 h-full w-72 shadow-2xl"
        )}
      >
        {/* Mobile close button */}
        {mobileOpen && (
          <div className="flex items-center justify-between px-4 pb-3 border-b border-border mb-2 lg:hidden">
            <span className="text-sm font-semibold text-foreground">Menu</span>
            <button
              onClick={onMobileClose}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        )}

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={cn(
                  "sidebar-link",
                  isActive ? "sidebar-link-active" : "sidebar-link-inactive"
                )}
                title={item.label}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className={cn("px-4 py-3 border-t border-border", collapsed && "px-2")}>
          {!collapsed && (
            <p className="text-[11px] text-muted-foreground">
              MedAssist AI v2.1.0
            </p>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
