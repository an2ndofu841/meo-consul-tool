import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertTriangle, TrendingDown, MessageSquareWarning, Eye, Shield } from "lucide-react";

type AlertType = "rank_drop" | "review_negative" | "competitor_change" | "dangerous_edit" | "general";

interface AlertCardProps {
  type: AlertType;
  title: string;
  description: string;
  timestamp?: string;
  className?: string;
}

const alertStyles: Record<AlertType, { icon: React.ComponentType<{ className?: string }>; bg: string; iconColor: string }> = {
  rank_drop: {
    icon: TrendingDown,
    bg: "border-l-4 border-l-red-500 bg-red-50",
    iconColor: "text-red-500",
  },
  review_negative: {
    icon: MessageSquareWarning,
    bg: "border-l-4 border-l-orange-500 bg-orange-50",
    iconColor: "text-orange-500",
  },
  competitor_change: {
    icon: Eye,
    bg: "border-l-4 border-l-blue-500 bg-blue-50",
    iconColor: "text-blue-500",
  },
  dangerous_edit: {
    icon: Shield,
    bg: "border-l-4 border-l-purple-500 bg-purple-50",
    iconColor: "text-purple-500",
  },
  general: {
    icon: AlertTriangle,
    bg: "border-l-4 border-l-yellow-500 bg-yellow-50",
    iconColor: "text-yellow-500",
  },
};

export function AlertCard({ type, title, description, timestamp, className }: AlertCardProps) {
  const style = alertStyles[type] || alertStyles.general;
  const Icon = style.icon;

  return (
    <Card className={cn("shadow-none", style.bg, className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", style.iconColor)} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            <p className="text-sm text-gray-600 mt-0.5">{description}</p>
            {timestamp && (
              <p className="text-xs text-gray-400 mt-1">{timestamp}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
