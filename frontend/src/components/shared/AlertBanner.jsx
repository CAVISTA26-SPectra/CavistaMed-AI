import { AlertTriangle } from "lucide-react";

const AlertBanner = ({ message, type = "warning" }) => {
  return (
    <div className="alert-banner">
      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

export default AlertBanner;
