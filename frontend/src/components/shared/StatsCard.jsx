import { cn } from "@/lib/utils";

const StatsCard = ({ label, value, icon: Icon, trend, trendUp, className }) => {
  return (
    <div className={cn("stat-card", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
          {trend && (
            <p className={cn(
              "text-xs font-medium mt-2",
              trendUp ? "text-status-completed" : "text-muted-foreground"
            )}>
              {trend}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
