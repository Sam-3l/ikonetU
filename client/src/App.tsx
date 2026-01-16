import { useState, useEffect } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { api } from "./lib/apiClient";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Camera, Globe, Linkedin, TrendingUp } from "lucide-react";
import { GlobalPresenceProvider } from "@/contexts/GlobalPresenceContext";
import { useGlobalPresenceContext } from "@/contexts/GlobalPresenceContext";
import { Check, X, Edit2, Briefcase, MapPin, User, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { NotificationWebSocket } from "@/lib/notificationWebSocket";

import React from "react";

import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import VideoFeed from "@/components/VideoFeed";
import MatchModal from "@/components/MatchModal";
import DashboardStats from "@/components/DashboardStats";
import Pipeline from "@/components/Pipeline";
import AuthForms from "@/components/AuthForms";
import VideoUpload from "@/components/VideoUpload";
import PreferenceChips from "@/components/PreferenceChips";
import LegalAcceptance from "@/components/LegalAcceptance";
import VideoHistory from "@/components/VideoHistory";
import ReportDialog from "@/components/ReportDialog";
import PublicProfile from "@/components/PublicProfile";
import Search from "@/components/Search";
import NotificationCenter from "@/components/NotificationCenter";
import EmailVerification from "@/components/EmailVerification";
import ForgotPassword from "@/components/ForgotPassword";
import ResetPassword from "@/components/ResetPassword";

import MessagesPage from './pages/MessagesPage';
import ProfilePage from '@/components/ProfilePage';
import FounderPage from "@/components/FounderPage"
import JudgePage from "@/components/JudgePage"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { 
  requestNotificationPermission, 
  registerServiceWorker, 
  showBrowserNotification,
  canShowNotifications 
} from "@/lib/pushNotifications";


interface Signal {
  id: string;
  type: "interested" | "maybe" | "pass";
  createdAt?: string;
  investor?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  } | null;
}

interface VideoWithFounder {
  id: string;
  founderId: string;
  url: string;
  thumbnailUrl: string;
  title: string;
  duration: number;
  status: string;
  viewCount: number;
  likeCount: number;
  isLiked: boolean;
  founder: {
    user: {
      id: string;
      name: string;
      avatarUrl: string | null;
    } | null;
    profile: {
      companyName: string;
      sector: string;
      stage: string;
      location: string;
      bio: string;
    } | null;
  };
}

interface MatchWithDetails {
  id: string;
  isActive: boolean;
  createdAt: string;
  otherUser: {
    id: string;
    name: string;
    avatarUrl: string | null;
    role: string;
  } | null;
  otherProfile: {
    companyName?: string;
    firmName?: string;
    sector?: string;
    stage?: string;
    title?: string;
    sectors?: string[];
    stages?: string[];
  } | null;
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    status: string;
    createdAt: string;
  } | null;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  status: string;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
}

function DiscoverPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showMatch, setShowMatch] = useState(false);
  const [matchedFounder, setMatchedFounder] = useState<{ name: string; company: string } | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ videoId: string; founderId: string; name: string } | null>(null);

  // Fetch video feed using new api client
  const { data: videos, isLoading } = useQuery<VideoWithFounder[]>({
    queryKey: ["/api/videos/feed/"],
    queryFn: () => api.get<VideoWithFounder[]>("/api/videos/feed/"),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  // Create signal mutation
  const signalMutation = useMutation({
    mutationFn: async (data: { founderId: string; videoId: string; type: "interested" | "maybe" | "pass" }) => {
      return api.post("/api/signals/", data);
    },
    onSuccess: (response: any, variables) => {
      if (response.matchCreated && variables.type === "interested") {
        const video = videos?.find(v => v.founderId === variables.founderId);
        if (video) {
          setMatchedFounder({
            name: video.founder?.user?.name || "Founder",
            company: video.founder?.profile?.companyName || "Company",
          });
          setShowMatch(true);
        }
      }
      queryClient.invalidateQueries({ queryKey: ["/api/matches/"] });
      queryClient.invalidateQueries({ queryKey: ["/api/videos/feed/"] });
    },
  });

  const handleLike = async (videoId: string, isDoubleTap: boolean = false) => {
    try {
      await api.post(`/api/videos/${videoId}/like/`, { doubleTap: isDoubleTap });
      queryClient.invalidateQueries({ queryKey: ["/api/videos/feed/"] });
    } catch (error) {
      console.error("Failed to toggle like:", error);
      throw error;
    }
  };

  const handleView = async (videoId: string) => {
    try {
      await api.post(`/api/videos/${videoId}/track-view/`);
    } catch (error) {
      console.error("Failed to track view:", error);
    }
  };

  // Transform videos for VideoFeed
  const founders = videos?.map(video => ({
    id: video.founderId,
    name: video.founder?.user?.name || "Unknown",
    avatar: video.founder?.user?.avatarUrl || undefined,
    company: video.founder?.profile?.companyName || "Unknown Company",
    sector: video.founder?.profile?.sector || "Tech",
    stage: video.founder?.profile?.stage || "Seed",
    location: video.founder?.profile?.location || "Unknown",
    videoUrl: video.url,
    videoPoster: video.thumbnailUrl || undefined,
    videoId: video.id,
    title: video.title,
    viewCount: video.viewCount || 0,
    likeCount: video.likeCount || 0,
    isLiked: video.isLiked || false,
  })) || [];

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] pb-16 md:pb-0">
      <VideoFeed
        founders={founders}
        onInterested={(founderId) => {
          const video = videos?.find(v => v.founderId === founderId);
          if (video) {
            signalMutation.mutate({ founderId, videoId: video.id, type: "interested" });
          }
        }}
        onMaybe={(founderId) => {
          const video = videos?.find(v => v.founderId === founderId);
          if (video) {
            signalMutation.mutate({ founderId, videoId: video.id, type: "maybe" });
          }
        }}
        onPass={(founderId) => {
          const video = videos?.find(v => v.founderId === founderId);
          if (video) {
            signalMutation.mutate({ founderId, videoId: video.id, type: "pass" });
          }
        }}
        onInfo={(founderId) => {
          setLocation(`/user/${founderId}`);
        }}
        onReport={(founderId, videoId) => {
          const founder = founders.find(f => f.id === founderId);
          setReportTarget({
            videoId,
            founderId,
            name: founder?.company || "this founder"
          });
          setShowReport(true);
        }}
        onLike={handleLike}
        onView={handleView}
      />
      <MatchModal
        isOpen={showMatch}
        onClose={() => setShowMatch(false)}
        onStartChat={() => {
          setShowMatch(false);
          window.location.href = "/matches";
        }}
        founder={matchedFounder || { name: "", company: "" }}
        investor={{ name: user?.name || "", firm: "Investor" }}
      />
      <ReportDialog
        isOpen={showReport}
        onClose={() => {
          setShowReport(false);
          setReportTarget(null);
        }}
        videoId={reportTarget?.videoId}
        targetName={reportTarget?.name}
      />
    </div>
  );
}

function SearchPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="h-[calc(100vh-4rem)] pb-16 md:pb-0">
      <Search onSelectProfile={(userId) => setLocation(`/user/${userId}`)} />
    </div>
  );
}

function MatchesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { onMatchStatusUpdate } = useGlobalPresenceContext();

  const { data: matches, isLoading } = useQuery<MatchWithDetails[]>({
    queryKey: ["/api/matches/"],
    queryFn: () => api.get<MatchWithDetails[]>("/api/matches/"),
  });

  const acceptMatchMutation = useMutation({
    mutationFn: async (matchId: string) => {
      return api.post(`/api/matches/${matchId}/accept/`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches/"] });
      toast({ title: "Match accepted! You can now message them." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const rejectMatchMutation = useMutation({
    mutationFn: async (matchId: string) => {
      return api.post(`/api/matches/${matchId}/reject/`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches/"] });
      toast({ title: "Match rejected" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    if (!onMatchStatusUpdate) return;

    const unsubscribe = onMatchStatusUpdate((data) => {
      // Refetch matches when any match status changes
      queryClient.invalidateQueries({ queryKey: ["/api/matches/"] });
    });

    return unsubscribe;
  }, [onMatchStatusUpdate]);

  const pendingMatches = matches?.filter(m => !m.isActive) || [];
  const activeMatches = matches?.filter(m => m.isActive) || [];

  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8 space-y-8">
      {/* Pending Matches - Need Action */}
      {pendingMatches.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-semibold mb-4">
            {user?.role === "investor" 
              ? "New Matches - Action Required" 
              : "Pending Matches"}
          </h2>
  
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingMatches.map((match) => (
              <Card key={match.id} className="overflow-visible h-full bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-amber-50/50 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-amber-950/20 border-amber-500/20 hover:shadow-lg hover:shadow-amber-500/20 transition-all">
                <CardContent className="p-4 flex flex-col h-full">
                  <div
                    className="flex items-center gap-3 mb-4 cursor-pointer"
                    onClick={() => setLocation(`/user/${match.otherUser?.id}`)}
                  >
                    {match.otherUser?.avatarUrl ? (
                      <img
                        src={match.otherUser.avatarUrl}
                        alt={match.otherUser.name}
                        className="h-12 w-12 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0">
                        {match.otherUser?.name?.charAt(0) || "?"}
                      </div>
                    )}
  
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {match.otherUser?.name || "Unknown"}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {match.otherUser?.role || "Founder"}
                      </p>
                    </div>
                  </div>
  
                  {user?.role === "investor" ? (
                    <>
                      <p className="text-sm text-muted-foreground mb-3">
                        Do you want to proceed with this match?
                      </p>
                      <div className="mt-auto flex gap-2">
                        <Button
                          className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white border-0 shadow-md shadow-emerald-500/30"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            acceptMatchMutation.mutate(match.id);
                          }}
                          disabled={acceptMatchMutation.isPending && acceptMatchMutation.variables === match.id}
                        >
                          Yes
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-rose-500/30 hover:bg-rose-500 hover:text-white hover:border-transparent transition-all"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            rejectMatchMutation.mutate(match.id);
                          }}
                          disabled={rejectMatchMutation.isPending && rejectMatchMutation.variables === match.id}
                        >
                          No
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="mt-auto">
                      <p className="text-sm text-muted-foreground text-center py-2">
                        Waiting for investor to accept match...
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
  
      {/* Active Matches */}
      <div>
        <h1 className="font-display text-2xl font-bold mb-6">
          Active Conversations
        </h1>
  
        {activeMatches.length === 0 ? (
          <Card className="overflow-visible bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-950 dark:to-slate-900/50 border-slate-500/20">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                {pendingMatches.length > 0
                  ? "Accept a match above to start messaging"
                  : "No matches yet. Keep swiping!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeMatches.map((match) => (
              <Card
                key={match.id}
                className="overflow-visible hover-elevate cursor-pointer h-full bg-gradient-to-br from-violet-50/30 via-purple-50/20 to-fuchsia-50/30 dark:from-violet-950/10 dark:via-purple-950/5 dark:to-fuchsia-950/10 border-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20 transition-all"
                onClick={() => setLocation(`/user/${match.otherUser?.id}`)}
              >
                <CardContent className="p-4 flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    {match.otherUser?.avatarUrl ? (
                      <img
                        src={match.otherUser.avatarUrl}
                        alt={match.otherUser.name}
                        className="h-12 w-12 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0">
                        {match.otherUser?.name?.charAt(0) || "?"}
                      </div>
                    )}
  
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {match.otherUser?.name || "Unknown"}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {match.otherUser?.role || "Founder"}
                      </p>
                    </div>
                  </div>
  
                  {/* Last message */}
                  <div className="mb-2">
                    {match.lastMessage ? (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {match.lastMessage.content}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No messages yet
                      </p>
                    )}
                  </div>
  
                  {/* Reserved unread space (keeps button aligned) */}
                  <div className="h-5 mb-2">
                    {match.unreadCount > 0 && (
                      <p className="text-sm text-primary font-medium">
                        {match.unreadCount} unread message
                        {match.unreadCount > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
  
                  {/* Spacer pushes button to bottom */}
                  <div className="flex-1" />
  
                  <Button
                    className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 text-white border-0 shadow-md shadow-purple-500/30"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation("/messages");
                    }}
                  >
                    Message
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );  
}

function DashboardPage() {
  const { data: stats, isLoading } = useQuery<Record<string, number>>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: signalsReceived } = useQuery<Signal[]>({
    queryKey: ["/api/signals/received"],
  });

  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  const dashboardStats = [
    { label: "Total Views", value: stats?.totalViews || 0, icon: "views" as const, trend: 0 },
    { label: "Interested", value: stats?.interestedCount || 0, icon: "interests" as const, trend: 0 },
    { label: "Active Matches", value: stats?.activeMatches || 0, icon: "matches" as const, trend: 0 },
    { label: "Videos", value: stats?.videoCount || 0, icon: "response" as const, trend: 0 },
  ];

  const pipelineData = {
    newInterests: (signalsReceived || [])
      .filter(s => s.type === "interested")
      .slice(0, 5)
      .map(s => ({ id: s.id, name: "Investor", sector: "", lastActivity: new Date(s.createdAt!).toLocaleDateString() })),
    inConversation: [],
    closed: [],
  };

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8 space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Track your pitch performance and investor pipeline</p>
      </div>
      <DashboardStats stats={dashboardStats} />
      <div>
        <h2 className="font-display text-xl font-semibold mb-4">Investor Pipeline</h2>
        <Pipeline {...pipelineData} />
      </div>
    </div>
  );
}

function ImageCropDialog({ 
  isOpen, 
  onClose, 
  imageUrl, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  imageUrl: string;
  onSave: (blob: Blob) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (isOpen && imageUrl && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = 300;
        canvas.height = 300;
        
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          const imgWidth = img.width * scale;
          const imgHeight = img.height * scale;
          const x = (canvas.width - imgWidth) / 2;
          const y = (canvas.height - imgHeight) / 2;
          
          ctx.drawImage(img, x, y, imgWidth, imgHeight);
        }
      };
      img.src = imageUrl;
    }
  }, [isOpen, imageUrl, scale]);

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        onSave(blob);
      }
    }, "image/jpeg", 0.95);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crop Profile Picture</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative border rounded-lg overflow-hidden bg-muted">
            <canvas ref={canvasRef} className="w-full" />
            <div 
              className="absolute inset-0 border-4 border-dashed border-primary/50 rounded-full pointer-events-none" 
              style={{ margin: '10px' }} 
            />
          </div>
          <div className="space-y-2">
            <Label>Zoom</Label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const { user, refetch } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  
  // Existing state for investors
  const [sectors, setSectors] = useState<string[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [support, setSupport] = useState<string[]>([]);
  
  // Existing state for founders
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  
  const [termsAccepted, setTermsAccepted] = useState(false);

  const role = user?.role || "founder";
  
  // Updated total steps:
  // Founders: 4 steps (profile, preferences, support types, video upload)
  // Investors: 3 steps (preferences, support types, terms)
  const totalSteps = role === "investor" ? 3 : 4;

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = role === "founder" ? "/api/profile/founder/profile" : "/api/profile/investor/profile";
      const res = await apiRequest("PUT", endpoint, data);
      return res.json();
    },
  });

  const saveLegalConsentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/legal/consent", { acceptedTerms: true, acceptedNda: true });
      return res.json();
    },
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/user/onboarding-complete");
      return res.json();
    },
    onSuccess: () => {
      refetch();
      onComplete();
    },
  });

  const handleNext = async () => {
    if (step < totalSteps) {
      // FOUNDER FLOW
      if (role === "founder") {
        if (step === 1) {
          // Step 1: Basic profile info
          await updateProfileMutation.mutateAsync({ 
            company_name: companyName,
            location, 
            bio 
          });
        } else if (step === 2) {
          // Step 2: Sectors and stages preferences
          await updateProfileMutation.mutateAsync({ 
            sectors,
            stages
          });
        } else if (step === 3) {
          // Step 3: Support types
          await updateProfileMutation.mutateAsync({ 
            support_types: support
          });
        }
        // Step 4 is video upload - handled by VideoUpload component
      }
      
      // INVESTOR FLOW
      else if (role === "investor") {
        if (step === 1) {
          // Step 1: Sectors and stages
          await updateProfileMutation.mutateAsync({ sectors, stages });
        } else if (step === 2) {
          // Step 2: Support types
          await updateProfileMutation.mutateAsync({ 
            support_types: support
          });
        }
        // Step 3 is terms for investors
      }
      
      setStep(step + 1);
    } else {
      // Final step
      if (role === "investor") {
        await saveLegalConsentMutation.mutateAsync();
      }
      await completeOnboardingMutation.mutateAsync();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg overflow-visible">
        <CardHeader>
          <div className="flex justify-center gap-2 mb-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-2 w-8 rounded-full ${i < step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
          <CardTitle className="text-center">
            {/* FOUNDER TITLES */}
            {role === "founder" && step === 1 && "Create Your Profile"}
            {role === "founder" && step === 2 && "Your Preferences"}
            {role === "founder" && step === 3 && "Support You're Seeking"}
            {role === "founder" && step === 4 && "Upload Your Pitch"}
            
            {/* INVESTOR TITLES */}
            {role === "investor" && step === 1 && "Investment Preferences"}
            {role === "investor" && step === 2 && "Support Preferences"}
            {role === "investor" && step === 3 && "Terms & Conditions"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* FOUNDER STEP 1: Basic Profile */}
          {step === 1 && role === "founder" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input placeholder="Your startup name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} data-testid="input-company-name" />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input placeholder="City, Country" value={location} onChange={(e) => setLocation(e.target.value)} data-testid="input-location" />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea placeholder="Tell investors about yourself and your vision..." className="min-h-[100px]" value={bio} onChange={(e) => setBio(e.target.value)} data-testid="input-bio" />
              </div>
            </div>
          )}

          {/* FOUNDER STEP 2: Sectors & Stages */}
          {step === 2 && role === "founder" && (
            <div className="space-y-6">
              <PreferenceChips
                label="Industry Sectors"
                options={["Fintech", "Healthcare", "AI/ML", "SaaS", "E-commerce", "Climate Tech", "EdTech", "Web3", "Consumer", "Enterprise"]}
                selectedOptions={sectors}
                onChange={setSectors}
              />
              <PreferenceChips
                label="Funding Stages"
                options={["Idea", "Pre-seed", "Seed", "Series A", "Series B", "Growth"]}
                selectedOptions={stages}
                onChange={setStages}
              />
            </div>
          )}

          {/* FOUNDER STEP 3: Support Types */}
          {step === 3 && role === "founder" && (
            <PreferenceChips
              label="Support You're Seeking"
              options={["Capital Only", "Advisory", "Hands-on", "Board Seat", "Strategic"]}
              selectedOptions={support}
              onChange={setSupport}
            />
          )}

          {/* FOUNDER STEP 4: Video Upload */}
          {step === 4 && role === "founder" && (
            <VideoUpload maxDuration={60} onSuccess={() => handleNext()} />
          )}

          {/* INVESTOR STEP 1: Sectors & Stages */}
          {step === 1 && role === "investor" && (
            <div className="space-y-6">
              <PreferenceChips
                label="Investment Sectors"
                options={["Fintech", "Healthcare", "AI/ML", "SaaS", "E-commerce", "Climate Tech", "EdTech", "Web3", "Consumer", "Enterprise"]}
                selectedOptions={sectors}
                onChange={setSectors}
              />
              <PreferenceChips
                label="Investment Stage"
                options={["Pre-seed", "Seed", "Series A", "Series B", "Growth"]}
                selectedOptions={stages}
                onChange={setStages}
              />
            </div>
          )}

          {/* INVESTOR STEP 2: Support Types */}
          {step === 2 && role === "investor" && (
            <PreferenceChips
              label="Support Type"
              options={["Capital Only", "Advisory", "Hands-on", "Board Seat", "Strategic"]}
              selectedOptions={support}
              onChange={setSupport}
            />
          )}

          {/* INVESTOR STEP 3: Terms */}
          {step === 3 && role === "investor" && (
            <LegalAcceptance onAccept={() => setTermsAccepted(true)} isAccepted={termsAccepted} />
          )}

          <div className="flex justify-between pt-4">
            {step > 1 ? (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            ) : (
              <div />
            )}
            <Button
              onClick={handleNext}
              disabled={(step === 3 && role === "investor" && !termsAccepted)}
            >
              {step === totalSteps ? "Get Started" : "Continue"} <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PublicProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const userId = window.location.pathname.split('/user/')[1];

  React.useEffect(() => {
    if (user && user.id === userId) {
      setLocation("/profile");
    }
  }, [user, userId, setLocation]);

  const { data: profileData, isLoading } = useQuery({
    queryKey: [`/api/user/${userId}/profile`],
    queryFn: () => api.get(`/api/user/${userId}/profile`),
    enabled: !!userId && user?.id !== userId,
  });

  const handleLike = async (videoId: string) => {
    try {
      await api.post(`/api/videos/${videoId}/like/`, { doubleTap: false });
      queryClient.invalidateQueries({ queryKey: [`/api/user/${userId}/profile`] });
    } catch (error) {
      console.error("Failed to toggle like:", error);
      throw error;
    }
  };

  const handleView = async (videoId: string) => {
    try {
      await api.post(`/api/videos/${videoId}/track-view/`);
    } catch (error) {
      console.error("Failed to track view:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Profile not found</p>
          <Button className="mt-4" onClick={() => setLocation("/")}>
            Back to Discover
          </Button>
        </div>
      </div>
    );
  }

  const isFounder = profileData.role === "founder";
  const founderProfile = profileData.founderProfile;
  const investorProfile = profileData.investorProfile;
  const currentVideo = profileData.currentVideo;
  
  return (
    <PublicProfile
      userId={userId}
      userType={profileData.role}
      name={profileData.name}
      avatar={profileData.avatarUrl}
      location={isFounder ? founderProfile?.location : investorProfile?.location || ""}
      bio={isFounder ? founderProfile?.bio : investorProfile?.thesis || ""}
      
      // Founder specific
      companyName={founderProfile?.companyName}
      sector={founderProfile?.sector}
      stage={founderProfile?.stage}
      fundingGoal={founderProfile?.fundingGoal}
      website={founderProfile?.website}
      linkedin={founderProfile?.linkedin}
      videoUrl={currentVideo?.url}
      videoThumbnail={currentVideo?.thumbnailUrl}
      videoTitle={currentVideo?.title}
      videoId={currentVideo?.id}
      viewCount={currentVideo?.viewCount}
      likeCount={currentVideo?.likeCount}
      isLiked={currentVideo?.isLiked}
      
      // Investor specific
      firmName={investorProfile?.firmName}
      title={investorProfile?.title}
      thesis={investorProfile?.thesis}
      sectors={investorProfile?.sectors}
      stages={investorProfile?.stages}
      supportTypes={investorProfile?.supportTypes}
      checkSize={investorProfile?.checkSize}
      investorLinkedin={investorProfile?.linkedin}
      
      onBack={() => window.history.back()}
      onLike={isFounder ? handleLike : undefined}
      onView={handleView}
    />
  );
}

function MainApp() {
  const { user, isLoading, isAuthenticated, login, register, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("discover");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [, setLocation] = useLocation();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationWsRef = useRef<NotificationWebSocket | null>(null);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  // Initialize push notifications on mount
  useEffect(() => {
    if (user && isAuthenticated) {
      // Request permission and register service worker
      const initPushNotifications = async () => {
        await registerServiceWorker();
        await requestNotificationPermission();
      };
      
      initPushNotifications();
    }
  }, [user, isAuthenticated]);

  // WebSocket notification handler with push notifications
  useEffect(() => {
    if (user && isAuthenticated) {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const notificationWs = new NotificationWebSocket();
      notificationWs.connect(token);
      notificationWsRef.current = notificationWs;

      const unsubscribe = notificationWs.onNotification((data) => {
        if (data.type === 'notification') {
          // Refetch counts
          queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count/"] });
          queryClient.invalidateQueries({ queryKey: ["/api/notifications/"] });

          // Show in-app toast
          toast({
            title: data.notification.title,
            description: data.notification.message,
            duration: 5000,
          });

          // Show browser push notification if:
          // 1. Page is not focused OR
          // 2. User has granted permission
          if (!document.hasFocus() || canShowNotifications()) {
            showBrowserNotification(
              data.notification.title,
              data.notification.message,
              data.notification.action_url
            );
          }
        }
      });

      return () => {
        unsubscribe();
        notificationWs.disconnect();
      };
    }
  }, [user, isAuthenticated, toast]);

  useEffect(() => {
    if (user && user.onboarding_complete) {
      const currentPath = window.location.pathname;
      if (currentPath === "/login" || currentPath === "/signup") {
        setLocation("/");
        setActiveTab("discover");
      }
    }
  }, [user, setLocation]);

  useEffect(() => {
    if (user && !user.onboarding_complete) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [user]);

  // Check if we should show notification prompt
  useEffect(() => {
    if (user && isAuthenticated) {
      const hasAskedBefore = localStorage.getItem('notification_permission_asked');
      const permission = typeof Notification !== 'undefined' ? Notification.permission : 'granted';
      
      if (!hasAskedBefore && permission === 'default') {
        setShowNotificationPrompt(true);
      }
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    // Sync activeTab with current location
    const path = window.location.pathname;
    
    if (path === "/" || path === "/discover") {
      setActiveTab("discover");
    } else if (path === "/messages") {
      setActiveTab("messages");
    } else if (path === "/matches") {
      setActiveTab("matches");
    } else if (path === "/profile") {
      setActiveTab("profile");
    } else if (path === "/dashboard") {
      setActiveTab("profile");
    } else if (path === "/videos") {
      setActiveTab("profile");
    } else if (path.startsWith("/user/")) {
      setActiveTab("");
    } else if (path === "/search") {
      setActiveTab("search");
    }    
    // For any other paths not in nav, don't change activeTab
  }, [window.location.pathname]);

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      setLocation("/");
    } catch (error: any) {
      // Handle email verification error
      if (error.message === 'EMAIL_NOT_VERIFIED' || 
          error.message?.toLowerCase().includes('verify') ||
          error.message?.toLowerCase().includes('verification')) {
        setVerificationEmail(email);
        setShowEmailVerification(true);
        toast({ 
          title: "Email not verified", 
          description: "Please verify your email before logging in. Check your inbox for the verification code.",
          variant: "destructive" 
        });
        return;
      }
      
      // Handle other errors with user-friendly messages
      let errorMessage = "Unable to log in. Please check your credentials.";
      
      if (error.message?.toLowerCase().includes('password')) {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.message?.toLowerCase().includes('email') || error.message?.toLowerCase().includes('user')) {
        errorMessage = "No account found with this email.";
      } else if (error.message?.toLowerCase().includes('network') || error.message?.toLowerCase().includes('connection')) {
        errorMessage = "Connection error. Please check your internet and try again.";
      } else if (error.message && error.message.length < 100) {
        // If the error message is short enough, show it
        errorMessage = error.message;
      }
      
      toast({ 
        title: "Login failed", 
        description: errorMessage, 
        variant: "destructive" 
      });
    }
  };

  const handleSignup = async (data: { email: string; password: string; name: string; role: "founder" | "investor" }) => {
    try {
      const result = await register(data);
      
      // Always show verification screen after successful registration
      setVerificationEmail(data.email);
      setShowEmailVerification(true);
      toast({ 
        title: "Account created!", 
        description: "Please check your email for the verification code" 
      });
    } catch (error: any) {
      // Handle user-friendly error messages
      let errorMessage = "Unable to create account. Please try again.";
      
      if (error.message?.toLowerCase().includes('email') && error.message?.toLowerCase().includes('already')) {
        errorMessage = "This email is already registered. Please log in instead.";
      } else if (error.message?.toLowerCase().includes('password')) {
        errorMessage = "Password must be at least 6 characters long.";
      } else if (error.message?.toLowerCase().includes('name')) {
        errorMessage = "Please provide a valid name.";
      } else if (error.message?.toLowerCase().includes('network') || error.message?.toLowerCase().includes('connection')) {
        errorMessage = "Connection error. Please check your internet and try again.";
      } else if (error.message && error.message.length < 100) {
        // If the error message is short enough, show it
        errorMessage = error.message;
      }
      
      toast({ 
        title: "Signup failed", 
        description: errorMessage, 
        variant: "destructive" 
      });
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // Use proper routing paths
    const routes: Record<string, string> = {
      discover: "/",
      messages: "/messages",
      matches: "/matches",
      profile: "/profile",
      search: "/search",
    };
    
    const route = routes[tab];
    if (route) {
      setLocation(route);
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    localStorage.setItem('notification_permission_asked', 'true');
    setShowNotificationPrompt(false);
    
    if (granted) {
      toast({ title: "🔔 Notifications enabled!" });
    } else {
      toast({ 
        title: "Notifications blocked", 
        description: "You can enable them in browser settings later",
      });
    }
  };

  const handleDismissPrompt = () => {
    localStorage.setItem('notification_permission_asked', 'true');
    setShowNotificationPrompt(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Show email verification screen
    if (showEmailVerification) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/30">
          <EmailVerification
            email={verificationEmail}
            onVerified={() => {
              setShowEmailVerification(false);
              setVerificationEmail("");
              toast({ title: "Email verified!", description: "You can now log in" });
            }}
            onCancel={() => {
              setShowEmailVerification(false);
              setVerificationEmail("");
            }}
          />
        </div>
      );
    }
  
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <Switch>
          <Route path="/forgot-password">
            <ForgotPassword onBack={() => setLocation("/")} />
          </Route>
          
          <Route path="/reset-password">
            {() => {
              const params = new URLSearchParams(window.location.search);
              const token = params.get("token");
              
              if (!token) {
                return (
                  <Card className="w-full max-w-md mx-auto">
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground">Invalid reset link</p>
                      <Button onClick={() => setLocation("/")} className="mt-4">
                        Back to Login
                      </Button>
                    </CardContent>
                  </Card>
                );
              }
              
              return (
                <ResetPassword
                  token={token}
                  onSuccess={() => {
                    toast({ title: "Password reset successful!" });
                    setLocation("/");
                  }}
                />
              );
            }}
          </Route>

          <Route path="/founder">
            <FounderPage />
          </Route>
          <Route path="/judge">
            <JudgePage />
          </Route>
          
          <Route>
            <AuthForms onLogin={handleLogin} onSignup={handleSignup} />
          </Route>
        </Switch>
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="min-h-screen relative">
      {/* Universal App Background with Texture & Animations */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-violet-50/30 to-purple-50/40 dark:from-slate-950 dark:via-violet-950/30 dark:to-purple-950/40">
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px'
        }} />
        
        {/* Animated gradient orbs with movement */}
        <div 
          className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-radial from-violet-400/10 to-transparent dark:from-violet-600/8 dark:to-transparent rounded-full blur-3xl animate-float" 
          style={{
            animation: 'float 20s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute top-1/4 right-0 w-[450px] h-[450px] bg-gradient-radial from-purple-400/8 to-transparent dark:from-purple-600/6 dark:to-transparent rounded-full blur-3xl animate-float-delayed" 
          style={{
            animation: 'float 25s ease-in-out infinite',
            animationDelay: '5s'
          }}
        />
        <div 
          className="absolute bottom-0 left-1/3 w-[480px] h-[480px] bg-gradient-radial from-fuchsia-400/9 to-transparent dark:from-fuchsia-600/7 dark:to-transparent rounded-full blur-3xl animate-float-slow" 
          style={{
            animation: 'float 30s ease-in-out infinite',
            animationDelay: '10s'
          }}
        />
        
        {/* Additional floating orbs for depth */}
        <div 
          className="absolute top-1/2 left-1/4 w-[350px] h-[350px] bg-gradient-radial from-indigo-400/6 to-transparent dark:from-indigo-600/5 dark:to-transparent rounded-full blur-3xl" 
          style={{
            animation: 'float-reverse 35s ease-in-out infinite',
            animationDelay: '15s'
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-gradient-radial from-pink-400/7 to-transparent dark:from-pink-600/5 dark:to-transparent rounded-full blur-3xl" 
          style={{
            animation: 'float-reverse 28s ease-in-out infinite',
            animationDelay: '8s'
          }}
        />
        
        {/* Grid pattern overlay with subtle animation */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] animate-grid-pulse" style={{
          backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
          animation: 'grid-pulse 8s ease-in-out infinite'
        }} />
      </div>
      
      {/* Add keyframes for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes float-reverse {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 25px) scale(0.95); }
          66% { transform: translate(25px, -25px) scale(1.05); }
        }
        
        @keyframes grid-pulse {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.05; }
        }
      `}</style>
      
      {/* App content with backdrop */}
      <div className="relative z-10 min-h-screen">
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        userAvatar={user?.avatar_url}
        userName={user?.name || "User"}
        onOpenSearch={() => setShowSearchModal(true)}
        onOpenNotifications={() => setShowNotifications(true)}
        onLogout={logout}
      />

      {/* Notification Permission Banner */}
      {showNotificationPrompt && (
        <div className="bg-primary text-primary-foreground py-3 px-4 md:px-8">
          <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Stay updated with notifications</p>
                <p className="text-xs opacity-90">Get notified about new matches and messages</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="secondary"
                onClick={handleEnableNotifications}
              >
                Enable
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={handleDismissPrompt}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-background">
          <Search
            onClose={() => setShowSearchModal(false)}
            onSelectProfile={(userId) => {
              setShowSearchModal(false);
              setLocation(`/user/${userId}`);
            }}
          />
        </div>
      )}

      {/* Notification Center Modal */}
      {showNotifications && (
        <NotificationCenter
          onClose={() => setShowNotifications(false)}
          onNavigate={(url) => {
            setShowNotifications(false);
            setLocation(url);
          }}
        />
      )}

      <main>
        <Switch>
          <Route path="/" component={DiscoverPage} />
          <Route path="/search" component={SearchPage} />
          <Route path="/messages" component={MessagesPage} />
          <Route path="/matches" component={MatchesPage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/user/:id" component={PublicProfilePage} />
          <Route path="/videos" component={() => (
            <div className="p-4 md:p-8 pb-20 md:pb-8">
              <h1 className="font-display text-2xl font-bold mb-6">My Videos</h1>
              <VideoHistory />
            </div>
          )} />
          <Route path="/:rest*">
            {() => {
              const [location] = useLocation();
              // If route doesn't match anything, redirect to discover
              if (location !== "/" && 
                  !location.startsWith("/messages") && 
                  !location.startsWith("/matches") && 
                  !location.startsWith("/profile") &&
                  !location.startsWith("/user/") && 
                  !location.startsWith("/search") &&
                  !location.startsWith("/videos") && 
                  !location.startsWith("/dashboard")) {
                return <Redirect to="/" />;
              }
              return <DiscoverPage />;
            }}
          </Route>
        </Switch>
      </main>
      <MobileNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <GlobalPresenceProvider>
              <Toaster />
              <MainApp />
            </GlobalPresenceProvider>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;