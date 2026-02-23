"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: number; // percentage change
  changeLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function KpiCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  className,
}: KpiCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === undefined || change === 0;

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {change !== undefined && (
          <div className="mt-2 flex items-center gap-1">
            {isPositive && (
              <TrendingUp className="h-4 w-4 text-green-600" />
            )}
            {isNegative && (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            {isNeutral && (
              <Minus className="h-4 w-4 text-gray-400" />
            )}
            <span
              className={cn(
                "text-sm font-medium",
                isPositive && "text-green-600",
                isNegative && "text-red-600",
                isNeutral && "text-gray-500"
              )}
            >
              {isPositive && "+"}
              {change}%
            </span>
            {changeLabel && (
              <span className="text-xs text-muted-foreground ml-1">
                {changeLabel}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
