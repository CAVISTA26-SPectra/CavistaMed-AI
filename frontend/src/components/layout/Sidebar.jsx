import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { X, Activity } from "lucide-react";
import { useEffect, useState } from "react";

const Sidebar = ({ items, collapsed = false, mobileOpen = false, onMobileClose }) => {
  const location = useLocation();
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(false);

  // Handle open/close with transition timing
  useEffect(() => {
    if (mobileOpen) {
      setVisible(true);
      // Trigger enter animation on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
    } else {
      setAnimating(false);
      // Wait for exit animation before hiding
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile overlay backdrop — smooth fade */}
      {visible && (
        <div
          className={cn(
            "fixed inset-0 z-40 lg:hidden transition-all duration-300 ease-in-out",
            animating
              ? "bg-black/40 backdrop-blur-[2px] opacity-100"
              : "bg-black/0 backdrop-blur-0 opacity-0"
          )}
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar — Desktop (static) */}
      <aside
        className={cn(
          // Base
          "bg-card border-r border-border flex-col py-4 z-50",
          // Desktop: always visible, sticky
          "hidden lg:flex lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)]",
          collapsed ? "lg:w-16" : "lg:w-60",
          // Smooth width transition on desktop
          "transition-[width] duration-300 ease-in-out"
        )}
      >
        <SidebarContent
          items={items}
          collapsed={collapsed}
          location={location}
          onMobileClose={onMobileClose}
        />
      </aside>

      {/* Sidebar — Mobile (slide-in overlay) */}
      {visible && (
        <aside
          className={cn(
            "fixed top-0 left-0 h-full w-72 bg-card z-50 flex flex-col py-0 lg:hidden",
            "shadow-2xl shadow-black/20",
            "transition-transform duration-300 ease-in-out",
            animating ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Mobile Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border bg-card">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Activity className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground leading-none">CavistaMed AI</p>
                <p className="text-[9px] text-muted-foreground leading-none mt-0.5">Clinical Co-Pilot</p>
              </div>
            </div>
            <button
              onClick={onMobileClose}
              className="p-2 rounded-lg hover:bg-muted active:bg-muted/70 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Mobile Nav */}
          <div className="flex-1 pt-2">
            <SidebarContent
              items={items}
              collapsed={false}
              location={location}
              onMobileClose={onMobileClose}
              isMobile
            />
          </div>
        </aside>
      )}
    </>
  );
};

/* Shared nav content used by both desktop and mobile */
const SidebarContent = ({ items, collapsed, location, onMobileClose, isMobile = false }) => (
  <>
    <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
      {items.map((item, index) => {
        const isActive = location.pathname === item.path;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onMobileClose}
            className={cn(
              "sidebar-link group relative",
              isActive ? "sidebar-link-active" : "sidebar-link-inactive"
            )}
            title={item.label}
            style={isMobile ? { transitionDelay: `${index * 30}ms` } : undefined}
          >
            {/* Active indicator bar */}
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
            )}
            <item.icon className={cn(
              "w-5 h-5 flex-shrink-0 transition-colors duration-200",
              isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
            )} />
            {!collapsed && (
              <span className={cn(
                "transition-colors duration-200",
                isActive ? "text-primary font-semibold" : ""
              )}>
                {item.label}
              </span>
            )}
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
  </>
);

export default Sidebar;
