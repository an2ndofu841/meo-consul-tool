import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS } from "@/lib/constants";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label = TASK_STATUS_LABELS[status] ?? status;
  const colorClass = TASK_STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700";

  return (
    <Badge
      variant="secondary"
      className={cn("font-medium", colorClass, className)}
    >
      {label}
    </Badge>
  );
}

// Rating badge for reviews
interface RatingBadgeProps {
  rating: number;
  className?: string;
}

export function RatingBadge({ rating, className }: RatingBadgeProps) {
  const colorClass =
    rating >= 4
      ? "bg-green-100 text-green-800"
      : rating >= 3
      ? "bg-yellow-100 text-yellow-800"
      : "bg-red-100 text-red-800";

  return (
    <Badge
      variant="secondary"
      className={cn("font-medium", colorClass, className)}
    >
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </Badge>
  );
}
