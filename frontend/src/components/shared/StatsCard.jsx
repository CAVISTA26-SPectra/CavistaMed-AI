import { cn } from "@/lib/utils";

const StatsCard = ({ label, value, icon: Icon, trend, trendUp, className }) => {
  return (
    <div className={cn("stat-card p-4 sm:p-6", className)}>
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">{label}</p>
          <p className="text-xl sm:text-3xl font-bold text-foreground mt-1 sm:mt-2 truncate">{value}</p>
          {trend && (
            <p className={cn(
              "text-[10px] sm:text-xs font-medium mt-1 sm:mt-2 truncate",
              trendUp ? "text-status-completed" : "text-muted-foreground"
            )}>
              {trend}
            </p>
          )}
        </div>
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 ml-2">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
