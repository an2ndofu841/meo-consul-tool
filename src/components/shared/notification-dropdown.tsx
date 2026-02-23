"use client";

import { useState } from "react";
import { Bell, TrendingDown, MessageSquareWarning, Eye, Shield, CheckCircle, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { mockNotifications } from "@/lib/mock-data";
import Link from "next/link";

const notificationIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  rank_drop: TrendingDown,
  review_negative: MessageSquareWarning,
  competitor_change: Eye,
  dangerous_edit: Shield,
  approval_required: CheckCircle,
  task_assigned: ClipboardList,
  asset_requested: ClipboardList,
};

const notificationColors: Record<string, string> = {
  rank_drop: "text-red-500",
  review_negative: "text-orange-500",
  competitor_change: "text-blue-500",
  dangerous_edit: "text-purple-500",
  approval_required: "text-yellow-600",
  task_assigned: "text-indigo-500",
  asset_requested: "text-green-500",
};

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="font-semibold text-sm">通知</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={markAllRead}
            >
              全て既読にする
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              通知はありません
            </div>
          ) : (
            <div>
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type] || Bell;
                const iconColor = notificationColors[notification.type] || "text-gray-500";

                return (
                  <Link
                    key={notification.id}
                    href={notification.link || "#"}
                    onClick={() => markRead(notification.id)}
                  >
                    <div
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b last:border-b-0",
                        !notification.isRead && "bg-blue-50/50"
                      )}
                    >
                      <div className={cn("mt-0.5 shrink-0", iconColor)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.createdAt}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
