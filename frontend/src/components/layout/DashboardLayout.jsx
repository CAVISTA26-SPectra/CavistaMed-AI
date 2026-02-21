import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const DashboardLayout = ({ children, sidebarItems, title, subtitle }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar onMenuToggle={() => setMobileMenuOpen(prev => !prev)} />
      <div className="flex w-full">
        <Sidebar
          items={sidebarItems}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto min-w-0">
          <div className="mb-4 sm:mb-6">
            <h2 className="page-title text-xl sm:text-2xl">{title}</h2>
            {subtitle && <p className="page-subtitle mt-0.5 sm:mt-1 text-xs sm:text-sm">{subtitle}</p>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
