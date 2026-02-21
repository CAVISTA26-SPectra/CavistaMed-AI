import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const Sidebar = ({ items, collapsed = false }) => {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "h-[calc(100vh-4rem)] bg-card border-r border-border flex flex-col py-4 sticky top-16 transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <nav className="flex-1 px-3 space-y-1">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
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
  );
};

export default Sidebar;
