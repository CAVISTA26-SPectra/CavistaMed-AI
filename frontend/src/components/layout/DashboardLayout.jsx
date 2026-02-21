import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const DashboardLayout = ({ children, sidebarItems, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <div className="flex w-full">
        <Sidebar items={sidebarItems} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h2 className="page-title">{title}</h2>
            {subtitle && <p className="page-subtitle mt-1">{subtitle}</p>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
