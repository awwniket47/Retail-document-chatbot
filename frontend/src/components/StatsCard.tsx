import { LucideIcon } from "lucide-react";

const StatsCard = ({
  label,
  value,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
}) => (
  <div className="glass-card p-5">
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-4.5 h-4.5 text-primary" />
      </div>
    </div>
    <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
    {trend && <p className="text-xs text-success mt-1">{trend}</p>}
  </div>
);

export default StatsCard;
