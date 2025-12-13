import { Eye, Heart, Users, MessageCircle, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Stat {
  label: string;
  value: number;
  icon: "views" | "interests" | "matches" | "response";
  trend?: number;
}

interface DashboardStatsProps {
  stats: Stat[];
}

const iconMap = {
  views: Eye,
  interests: Heart,
  matches: Users,
  response: MessageCircle,
};

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
      data-testid="dashboard-stats"
    >
      {stats.map((stat) => {
        const Icon = iconMap[stat.icon];
        const isPositive = stat.trend && stat.trend > 0;
        const isNegative = stat.trend && stat.trend < 0;

        return (
          <Card key={stat.label} className="overflow-visible">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                {stat.trend !== undefined && (
                  <div
                    className={`flex items-center gap-1 text-xs font-medium ${
                      isPositive
                        ? "text-status-online"
                        : isNegative
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : isNegative ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : null}
                    <span>{Math.abs(stat.trend)}%</span>
                  </div>
                )}
              </div>
              <p className="font-display text-2xl font-bold mb-1">
                {stat.value.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
