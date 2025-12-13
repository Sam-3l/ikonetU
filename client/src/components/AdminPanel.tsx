import { useState } from "react";
import { Users, Video, AlertTriangle, Check, X, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "founder" | "investor" | "admin";
  joinDate: string;
  status: "active" | "pending" | "suspended";
}

interface VideoItem {
  id: string;
  title: string;
  founderName: string;
  companyName: string;
  status: "processing" | "active" | "rejected" | "archived";
  createdAt: string;
  thumbnailUrl?: string;
}

interface ModerationItem {
  id: string;
  videoId: string;
  reporterName: string;
  founderName: string;
  founderAvatar?: string;
  reason: string;
  reportedAt: string;
}

interface AdminPanelProps {
  totalUsers: number;
  totalVideos: number;
  pendingModeration: number;
  pendingVideos: number;
  users: User[];
  videos: VideoItem[];
  moderationQueue: ModerationItem[];
  onApprove?: (id: string) => void;
  onWarn?: (id: string) => void;
  onReject?: (id: string) => void;
  onSuspendUser?: (id: string) => void;
  onApproveVideo?: (id: string) => void;
  onRejectVideo?: (id: string) => void;
}

export default function AdminPanel({
  totalUsers,
  totalVideos,
  pendingModeration,
  pendingVideos,
  users,
  videos,
  moderationQueue,
  onApprove,
  onWarn,
  onReject,
  onSuspendUser,
  onApproveVideo,
  onRejectVideo,
}: AdminPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "videos" | "moderation">("videos");
  const [selectedModItem, setSelectedModItem] = useState<ModerationItem | null>(null);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="admin-panel">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="overflow-visible">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{totalUsers.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-visible">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
              <Video className="h-6 w-6 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{totalVideos.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Active Videos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-visible">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{pendingModeration}</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 border-b border-border flex-wrap">
        <button
          onClick={() => setActiveTab("videos")}
          className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors ${
            activeTab === "videos"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground"
          }`}
          data-testid="tab-videos"
        >
          Video Approval
          {pendingVideos > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 min-w-[20px] rounded-full">
              {pendingVideos}
            </Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors ${
            activeTab === "users"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground"
          }`}
          data-testid="tab-users"
        >
          User Management
        </button>
        <button
          onClick={() => setActiveTab("moderation")}
          className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors ${
            activeTab === "moderation"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground"
          }`}
          data-testid="tab-moderation"
        >
          Moderation Queue
          {pendingModeration > 0 && (
            <Badge variant="destructive" className="ml-2 h-5 min-w-[20px] rounded-full">
              {pendingModeration}
            </Badge>
          )}
        </button>
      </div>

      {activeTab === "videos" && (
        <Card className="overflow-visible">
          <CardHeader>
            <CardTitle className="text-base">All Videos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Video</TableHead>
                  <TableHead>Founder</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((video) => (
                  <TableRow key={video.id} data-testid={`video-row-${video.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-16 rounded bg-muted flex items-center justify-center">
                          <Video className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium text-sm truncate max-w-[150px]">{video.title || "Untitled"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{video.founderName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{video.companyName}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          video.status === "active"
                            ? "default"
                            : video.status === "processing"
                            ? "secondary"
                            : video.status === "rejected"
                            ? "destructive"
                            : "outline"
                        }
                        className="capitalize"
                      >
                        {video.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {video.createdAt}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {video.status === "processing" && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => onApproveVideo?.(video.id)}
                              data-testid={`button-approve-video-${video.id}`}
                            >
                              <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => onRejectVideo?.(video.id)}
                              data-testid={`button-reject-video-${video.id}`}
                            >
                              <X className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </>
                        )}
                        {video.status === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onRejectVideo?.(video.id)}
                            data-testid={`button-archive-video-${video.id}`}
                          >
                            Archive
                          </Button>
                        )}
                        {video.status === "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onApproveVideo?.(video.id)}
                            data-testid={`button-reactivate-video-${video.id}`}
                          >
                            Reactivate
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {videos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No videos found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === "users" && (
        <Card className="overflow-visible">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle className="text-base">All Users</CardTitle>
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
                data-testid="input-search-users"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="text-xs">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.joinDate}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === "active"
                            ? "default"
                            : user.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                        className="capitalize"
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onSuspendUser?.(user.id)}
                      >
                        Suspend
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === "moderation" && (
        <Card className="overflow-visible">
          <CardHeader>
            <CardTitle className="text-base">Reported Content</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Founder</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {moderationQueue.map((item) => (
                  <TableRow key={item.id} data-testid={`mod-row-${item.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={item.founderAvatar} />
                          <AvatarFallback className="text-xs">
                            {item.founderName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{item.founderName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{item.reporterName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {item.reason}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.reportedAt}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setSelectedModItem(item)}
                          data-testid={`button-view-${item.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-status-online"
                          onClick={() => onApprove?.(item.id)}
                          data-testid={`button-approve-${item.id}`}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => onReject?.(item.id)}
                          data-testid={`button-reject-${item.id}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedModItem} onOpenChange={() => setSelectedModItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Reported Content</DialogTitle>
          </DialogHeader>
          {selectedModItem && (
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <Video className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Reported by</p>
                <p className="text-muted-foreground">{selectedModItem.reporterName}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Reason</p>
                <p className="text-muted-foreground">{selectedModItem.reason}</p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedModItem(null)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                onWarn?.(selectedModItem!.id);
                setSelectedModItem(null);
              }}
            >
              Issue Warning
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onReject?.(selectedModItem!.id);
                setSelectedModItem(null);
              }}
            >
              Reject Video
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
