import { cn } from "@/lib/utils";

const statusConfig = {
  recording: { label: "Recording", dotClass: "bg-status-recording", bgClass: "bg-status-recording/10 text-status-recording" },
  processing: { label: "Processing", dotClass: "bg-status-processing", bgClass: "bg-status-processing/10 text-status-processing" },
  completed: { label: "Completed", dotClass: "bg-status-completed", bgClass: "bg-status-completed/10 text-status-completed" },
  active: { label: "Active", dotClass: "bg-status-completed", bgClass: "bg-status-completed/10 text-status-completed" },
  inactive: { label: "Inactive", dotClass: "bg-muted-foreground", bgClass: "bg-muted text-muted-foreground" },
};

const StatusBadge = ({ status, className }) => {
  const config = statusConfig[status];
  return (
    <span className={cn("badge-status", config.bgClass, className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dotClass)} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
