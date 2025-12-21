import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Video as VideoIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Play,
  AlertCircle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReportDialog from "@/components/ReportDialog";

interface AdminStats {
  totalUsers: number;
  totalFounders: number;
  totalInvestors: number;
  totalVideos: number;
  activeVideos: number;
  pendingVideos: number;
  pendingReports: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "founder" | "investor" | "admin";
  created_at: string;
  onboarding_complete: boolean;
}

interface AdminVideo {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string;
  duration: number;
  status: "processing" | "active" | "rejected" | "archived";
  is_current: boolean;
  view_count: number;
  created_at: string;
  founder: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminPanel() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [videoFilter, setVideoFilter] = useState<string>("all");
  const [reportFilter, setReportFilter] = useState<string>("all");
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<AdminVideo | null>(null);

  // Fetch stats
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats/"],
  });

  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users/"],
    enabled: activeTab === "users",
  });

  // Fetch videos
  const { data: videos, isLoading: videosLoading } = useQuery<AdminVideo[]>({
    queryKey: ["/api/admin/videos/", videoFilter],
    queryFn: async () => {
      const url = videoFilter === "all" 
        ? "/api/admin/videos/"
        : `/api/admin/videos/?status=${videoFilter}`;
      const res = await apiRequest("GET", url);
      return res.json();
    },
    enabled: activeTab === "videos",
  });

  // Fetch reports
  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/admin/reports/", reportFilter],
    queryFn: async () => {
      const url = reportFilter === "all"
        ? "/api/admin/reports/"
        : `/api/admin/reports/?status=${reportFilter}`;
      const res = await apiRequest("GET", url);
      return res.json();
    },
    enabled: activeTab === "reports",
  });

  // Approve video
  const approveMutation = useMutation({
    mutationFn: async (videoId: string) => {
      const res = await apiRequest("PUT", `/api/admin/videos/${videoId}/approve/`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos/"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats/"] });
      toast({ title: "Video approved!" });
    },
  });

  // Reject video
  const rejectMutation = useMutation({
    mutationFn: async (videoId: string) => {
      const res = await apiRequest("PUT", `/api/admin/videos/${videoId}/reject/`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos/"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats/"] });
      toast({ title: "Video rejected" });
    },
  });

  // Delete user
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${userId}/delete/`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats/"] });
      toast({ title: "User deactivated" });
      setUserToDelete(null);
    },
  });

  // Update report (resolve/dismiss)
  const updateReportMutation = useMutation({
    mutationFn: async ({ reportId, status }: { reportId: string; status: string }) => {
      const res = await apiRequest("PUT", `/api/admin/reports/${reportId}/`, {
        status,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports/"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats/"] });
      toast({ title: "Report updated" });
    },
  });

  // Delete report
  const deleteReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const res = await apiRequest("DELETE", `/api/admin/reports/${reportId}/delete/`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports/"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats/"] });
      toast({ title: "Report deleted" });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Active</Badge>;
      case "processing":
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getReportStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "reviewed":
        return <Badge className="bg-blue-500">Reviewed</Badge>;
      case "resolved":
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Resolved</Badge>;
      case "dismissed":
        return <Badge variant="secondary">Dismissed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "founder":
        return <Badge variant="default">Founder</Badge>;
      case "investor":
        return <Badge variant="secondary">Investor</Badge>;
      case "admin":
        return <Badge className="bg-purple-500">Admin</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">Manage users, videos, and platform activity</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="videos">
            Videos
            {stats && stats.pendingVideos > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-500 text-white rounded-full">
                {stats.pendingVideos}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="reports">
            Reports
            {stats && stats.pendingReports > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {stats.pendingReports}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats?.totalFounders} founders • {stats?.totalInvestors} investors
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Videos</p>
                    <p className="text-3xl font-bold">{stats?.totalVideos || 0}</p>
                  </div>
                  <VideoIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats?.activeVideos} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Review</p>
                    <p className="text-3xl font-bold text-yellow-500">{stats?.pendingVideos || 0}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Videos awaiting approval
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Reports</p>
                    <p className="text-3xl font-bold">{stats?.pendingReports || 0}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Pending moderation
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Video Moderation</h2>
            <Select value={videoFilter} onValueChange={setVideoFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Videos</SelectItem>
                <SelectItem value="processing">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {videosLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !videos || videos.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                No videos found
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {videos.map((video) => (
                <Card key={video.id}>
                  <CardContent className="p-0">
                    {/* Video Player */}
                    <div className="relative bg-black aspect-video">
                      <video
                        src={video.url}
                        poster={video.thumbnail_url || undefined}
                        controls
                        controlsList="nodownload"
                        className="w-full h-full"
                        preload="metadata"
                      />
                    </div>

                    {/* Video Info */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{video.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            by {video.founder.name} • {video.duration}s
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(video.created_at).toLocaleString()}
                          </p>
                        </div>
                        {getStatusBadge(video.status)}
                      </div>

                      {/* Actions */}
                      {video.status === "processing" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-green-500 hover:bg-green-600"
                            onClick={() => approveMutation.mutate(video.id)}
                            disabled={approveMutation.isPending}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                            onClick={() => rejectMutation.mutate(video.id)}
                            disabled={rejectMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <h2 className="text-xl font-semibold">User Management</h2>

          {usersLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="p-4 font-medium">Name</th>
                        <th className="p-4 font-medium">Email</th>
                        <th className="p-4 font-medium">Role</th>
                        <th className="p-4 font-medium">Joined</th>
                        <th className="p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users?.map((user) => (
                        <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="p-4 font-medium">{user.name}</td>
                          <td className="p-4 text-sm text-muted-foreground">{user.email}</td>
                          <td className="p-4">{getRoleBadge(user.role)}</td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            {user.role !== "admin" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setUserToDelete(user.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Report Management</h2>
            <Select value={reportFilter} onValueChange={setReportFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {reportsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !reports || reports.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                No reports found
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reports.map((report: any) => (
                <Card key={report.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getReportStatusBadge(report.status)}
                            <Badge variant="outline">{report.reason}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Reported by: <span className="font-medium">{report.reporter?.name}</span> ({report.reporter?.email})
                          </p>
                          {report.reported_user && (
                            <p className="text-sm text-muted-foreground">
                              Reported user: <span className="font-medium">{report.reported_user?.name}</span> ({report.reported_user?.email})
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(report.created_at).toLocaleString()}
                          </p>
                        </div>
                        {report.status === "pending" && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateReportMutation.mutate({ 
                                reportId: report.id, 
                                status: "reviewed" 
                              })}
                              disabled={updateReportMutation.isPending}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Mark Reviewed
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() => updateReportMutation.mutate({ 
                                reportId: report.id, 
                                status: "resolved" 
                              })}
                              disabled={updateReportMutation.isPending}
                            >
                              Resolve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => updateReportMutation.mutate({ 
                                reportId: report.id, 
                                status: "dismissed" 
                              })}
                              disabled={updateReportMutation.isPending}
                            >
                              Dismiss
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => deleteReportMutation.mutate(report.id)}
                              disabled={deleteReportMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {report.description && (
                        <div className="bg-muted/50 p-3 rounded-md">
                          <p className="text-sm font-medium mb-1">Description:</p>
                          <p className="text-sm">{report.description}</p>
                        </div>
                      )}

                      {/* Video Info */}
                      {report.video && (
                        <div className="border-t pt-4">
                          <p className="text-sm font-medium mb-2">Reported Video:</p>
                          <div className="flex items-center gap-3">
                            {report.video.thumbnail_url && (
                              <img 
                                src={report.video.thumbnail_url} 
                                alt={report.video.title}
                                className="w-24 h-16 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="text-sm font-medium">{report.video.title}</p>
                              <a 
                                href={report.video.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                              >
                                View Video
                              </a>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Resolution Info */}
                      {report.resolved_by_name && report.resolved_at && (
                        <div className="border-t pt-4">
                          <p className="text-xs text-muted-foreground">
                            Resolved by <span className="font-medium">{report.resolved_by_name}</span> on {new Date(report.resolved_at).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete User Confirmation */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate User?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the user's account. They will no longer be able to log in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && deleteUserMutation.mutate(userToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}