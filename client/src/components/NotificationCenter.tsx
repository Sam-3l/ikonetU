import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, CheckCheck, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  related_user: {
    id: string;
    name: string;
    avatar_url: string | null;
  } | null;
  action_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

interface NotificationCenterProps {
  onClose: () => void;
  onNavigate: (url: string) => void;
}

// Helper function to format time safely
function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Just now';
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  } catch (error) {
    return 'Just now';
  }
}

export default function NotificationCenter({ onClose, onNavigate }: NotificationCenterProps) {
  const { toast } = useToast();
  
  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications/"],
    queryFn: () => api.get("/api/notifications/"),
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) => 
      api.put(`/api/notifications/${notificationId}/read/`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count/"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.put("/api/notifications/mark-all-read/", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count/"] });
      toast({ title: "All notifications marked as read" });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => 
      api.delete(`/api/notifications/${notificationId}/delete/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count/"] });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: () => api.delete("/api/notifications/clear-all/"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count/"] });
      toast({ title: "All notifications cleared" });
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markReadMutation.mutate(notification.id);
    }
    
    if (notification.action_url) {
      onNavigate(notification.action_url);
      onClose();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match':
        return '🎉';
      case 'message':
        return '💬';
      case 'video_approved':
        return '✅';
      case 'video_rejected':
        return '❌';
      default:
        return '📢';
    }
  };

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="border-b p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5" />
            <h2 className="font-semibold text-lg">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="default" className="h-6 px-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          )}
          {notifications && notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearAllMutation.mutate()}
              disabled={clearAllMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="p-4 space-y-2">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer hover-elevate transition-all group ${
                  !notification.is_read ? 'bg-primary/5 border-primary/20' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {notification.related_user ? (
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={notification.related_user.avatar_url || undefined} />
                        <AvatarFallback>
                          {notification.related_user.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        {!notification.is_read && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatTimeAgo(notification.created_at)}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0 opacity-0 md:group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotificationMutation.mutate(notification.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-2">No notifications</p>
            <p className="text-sm text-muted-foreground">
              You're all caught up!
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}