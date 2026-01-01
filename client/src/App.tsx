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
import { Badge } from "@/components/ui/badge";

import React from "react";

import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import VideoFeed from "@/components/VideoFeed";
import MatchModal from "@/components/MatchModal";
import ChatList from "@/components/ChatList";
import ChatView from "@/components/ChatView";
import DashboardStats from "@/components/DashboardStats";
import Pipeline from "@/components/Pipeline";
import AuthForms from "@/components/AuthForms";
import FounderProfile from "@/components/FounderProfile";
import InvestorProfile from "@/components/InvestorProfile";
import VideoUpload from "@/components/VideoUpload";
import PreferenceChips from "@/components/PreferenceChips";
import LegalAcceptance from "@/components/LegalAcceptance";
import AdminPanel from "@/components/AdminPanel";
import VideoHistory from "@/components/VideoHistory";
import ReportDialog from "@/components/ReportDialog";
import PublicProfile from "@/components/PublicProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Play, Eye, Heart, VolumeX, Volume2 } from "lucide-react";
import type { Video, FounderProfile as FounderProfileType, InvestorProfile as InvestorProfileType, Match, Message, Signal } from "@shared/schema";


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
          window.location.href = "/messages";
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

function MessagesPage() {
  const { user } = useAuth();
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: matches, isLoading } = useQuery<MatchWithDetails[]>({
    queryKey: ["/api/matches/"],
    queryFn: () => api.get<MatchWithDetails[]>("/api/matches/"),
    refetchInterval: 10000,
  });

  const { data: messagesData, refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: [`/api/matches/${selectedMatchId}/messages/`],
    queryFn: () => api.get<Message[]>(`/api/matches/${selectedMatchId}/messages/`),
    enabled: !!selectedMatchId,
    refetchInterval: 2000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ matchId, content }: { matchId: string; content: string }) => {
      return api.post<Message>(`/api/matches/${matchId}/messages/send/`, { content });
    },
    onSuccess: () => {
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ["/api/matches/"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (matchId: string) => {
      return api.put(`/api/matches/${matchId}/messages/mark-read/`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches/"] });
    },
  });

  const handleSelectChat = (matchId: string) => {
    setSelectedMatchId(matchId);
    markReadMutation.mutate(matchId);
  };

  // ONLY show ACTIVE matches in messages
  const activeMatches = matches?.filter(m => m.isActive) || [];

  const chats = activeMatches.map(match => ({
    id: match.id,
    name: match.otherUser?.name || "Unknown",
    avatar: match.otherUser?.avatarUrl || undefined,
    lastMessage: match.lastMessage?.content || "Start a conversation",
    timestamp: match.lastMessage 
      ? new Date(match.lastMessage.createdAt).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        })
      : "",
    unreadCount: match.unreadCount,
    isOnline: false,
  }));

  const selectedMatch = activeMatches.find(m => m.id === selectedMatchId);

  const formattedMessages = messagesData?.map(m => ({
    id: m.id,
    content: m.content,
    senderId: m.senderId,
    timestamp: m.createdAt,
    status: m.status as 'sent' | 'delivered' | 'read',
  })) || [];

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  // Show message if no active matches
  if (activeMatches.length === 0) {
    return (
      <div className="h-[calc(100vh-4rem)] pb-16 md:pb-0 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No active conversations yet</p>
          <Button onClick={() => window.location.href = "/matches"}>
            View Matches
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] pb-16 md:pb-0 flex w-full">
      {/* Chat List Sidebar */}
      <div className={`w-full md:w-80 xl:w-96 border-r border-border flex-shrink-0 ${selectedMatchId ? "hidden md:flex md:flex-col" : "flex flex-col"}`}>
        <div className="p-4 border-b border-border">
          <h2 className="font-display text-lg font-semibold">Messages</h2>
        </div>
        <ChatList 
          chats={chats} 
          selectedChatId={selectedMatchId || undefined} 
          onSelectChat={handleSelectChat} 
        />
      </div>
      
      {/* Chat View - Takes ALL remaining space */}
      <div className={`flex-1 min-w-0 ${!selectedMatchId ? "hidden md:flex" : "flex"}`}>
        {selectedMatchId && selectedMatch ? (
          <ChatView
            chatId={selectedMatchId}
            recipientName={selectedMatch.otherUser?.name || ""}
            recipientAvatar={selectedMatch.otherUser?.avatarUrl || undefined}
            currentUserId={user?.id || ""}
            messages={formattedMessages}
            onSendMessage={(content) => sendMessageMutation.mutate({ matchId: selectedMatchId, content })}
            onBack={() => setSelectedMatchId(null)}
            canSendMessages={selectedMatch.isActive}
            useWebSocket={true}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground bg-background">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MatchesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

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
            New Matches - Action Required
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingMatches.map((match) => (
              <Card key={match.id} className="overflow-visible">
                <CardContent className="p-4">
                  <div 
                    className="flex items-center gap-3 mb-4 cursor-pointer"
                    onClick={() => setLocation(`/user/${match.otherUser?.id}`)}
                  >
                    {match.otherUser?.avatarUrl ? (
                      <img 
                        src={match.otherUser.avatarUrl} 
                        alt={match.otherUser.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {match.otherUser?.name?.charAt(0) || "?"}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium">{match.otherUser?.name || "Unknown"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {match.otherProfile?.companyName || "Founder"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        acceptMatchMutation.mutate(match.id);
                      }}
                      disabled={acceptMatchMutation.isPending}
                    >
                      Accept
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        rejectMatchMutation.mutate(match.id);
                      }}
                      disabled={rejectMatchMutation.isPending}
                    >
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Active Matches */}
      <div>
        <h1 className="font-display text-2xl font-bold mb-6">Active Conversations</h1>
        {activeMatches.length === 0 ? (
          <Card className="overflow-visible">
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
                className="overflow-visible hover-elevate cursor-pointer"
                onClick={() => setLocation(`/user/${match.otherUser?.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {match.otherUser?.avatarUrl ? (
                      <img 
                        src={match.otherUser.avatarUrl} 
                        alt={match.otherUser.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {match.otherUser?.name?.charAt(0) || "?"}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium">{match.otherUser?.name || "Unknown"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {match.otherProfile?.companyName || "Founder"}
                      </p>
                    </div>
                  </div>
                  {match.lastMessage && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                      {match.lastMessage.content}
                    </p>
                  )}
                  {match.unreadCount > 0 && (
                    <div className="text-sm text-primary font-medium mb-2">
                      {match.unreadCount} unread message{match.unreadCount > 1 ? 's' : ''}
                    </div>
                  )}
                  <Button 
                    className="w-full mt-3" 
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

function ProfilePage() {
  const { user, profile, refetch } = useAuth();
  const { toast } = useToast();
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [, setLocation] = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { data: stats } = useQuery<Record<string, number>>({
    queryKey: ["/api/dashboard/stats"],
    enabled: user?.role === "founder",
  });

  // Fetch current video for founders
  const { data: currentVideoData } = useQuery({
    queryKey: ["/api/videos/my/"],
    queryFn: () => api.get("/api/videos/my/"),
    enabled: user?.role === "founder",
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = user?.role === "founder" ? "/api/founder/profile" : "/api/investor/profile";
      const res = await apiRequest("PUT", endpoint, data);
      return res.json();
    },
    onSuccess: () => {
      refetch();
      toast({ title: "Profile updated!" });
    },
  });

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (user?.role === "founder") {
    const founderProfile = profile as FounderProfile | null;
    return (
      <div className="p-4 md:p-8 pb-20 md:pb-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">Your Profile</h1>
          <Button variant="outline" onClick={() => setLocation("/videos")}>
            View All Videos
          </Button>
        </div>

        {!showVideoUpload && (
          <FounderProfile
            name={user?.name || ""}
            company={founderProfile?.company_name || ""}
            location={founderProfile?.location || ""}
            bio={founderProfile?.bio || ""}
            sector={founderProfile?.sector || ""}
            stage={founderProfile?.stage || ""}
            stats={{
              views: stats?.totalViews || 0,
              matches: stats?.activeMatches || 0,
              responseRate: 0,
            }}
            onEditProfile={(data) => updateProfileMutation.mutate(data)}
            onEditVideo={() => setShowVideoUpload(true)}
          />
        )}

        {/* Current Video Section */}
        {currentVideoData && (
          <Card>
            <CardContent className="p-0">
              <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={currentVideoData.url}
                  poster={currentVideoData.thumbnailUrl}
                  className="w-full h-full object-contain"
                  muted={isMuted}
                  loop
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                
                {/* Play/Pause Overlay */}
                {!isPlaying && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
                    onClick={togglePlay}
                  >
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                )}

                {/* Video Controls */}
                <div className="absolute top-3 right-3 z-10">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm text-white border-0"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                </div>

                {/* Click to play/pause - exclude the mute button area */}
                <div 
                  className="absolute inset-0 cursor-pointer"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 4rem) 0, calc(100% - 4rem) 4rem, 100% 4rem, 100% 100%, 0 100%)' }}
                  onClick={togglePlay}
                />
              </div>
              
              <div className="p-4 space-y-3">
                {currentVideoData.title && (
                  <h3 className="font-semibold text-lg">{currentVideoData.title}</h3>
                )}
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{formatCount(currentVideoData.viewCount || 0)} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    <span>{formatCount(currentVideoData.likeCount || 0)} likes</span>
                  </div>
                  {currentVideoData.status && (
                    <Badge 
                      variant={
                        currentVideoData.status === 'active' ? 'default' :
                        currentVideoData.status === 'processing' ? 'secondary' : 'destructive'
                      }
                    >
                      {currentVideoData.status}
                    </Badge>
                  )}
                </div>

                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setShowVideoUpload(true)}
                >
                  Update Pitch Video
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!currentVideoData && !showVideoUpload && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">You haven't uploaded a pitch video yet</p>
              <Button onClick={() => setShowVideoUpload(true)}>
                Upload Your First Pitch
              </Button>
            </CardContent>
          </Card>
        )}
        
        {showVideoUpload && (
          <Card className="max-w-xl overflow-visible">
            <CardHeader>
              <CardTitle className="text-lg">
                {currentVideoData ? "Update Your Pitch" : "Upload Your First Pitch"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VideoUpload 
                onSuccess={() => {
                  setShowVideoUpload(false);
                  queryClient.invalidateQueries({ queryKey: ["/api/videos/my/"] });
                }} 
                onCancel={() => setShowVideoUpload(false)} 
              />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const investorProfile = profile as InvestorProfileType | null;
  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8">
      <h1 className="font-display text-2xl font-bold mb-6">Your Profile</h1>
      <InvestorProfile
        name={user?.name || ""}
        firm={investorProfile?.firm_name || ""}
        role={investorProfile?.title || ""}
        location=""
        thesis={investorProfile?.thesis || ""}
        sectors={investorProfile?.sectors || []}
        stages={investorProfile?.stages || []}
        supportTypes={investorProfile?.supportTypes || []}
        onEditProfile={(data) => updateProfileMutation.mutate(data)}
      />
    </div>
  );
}

function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const { user, refetch } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [sectors, setSectors] = useState<string[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [support, setSupport] = useState<string[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");

  const role = user?.role || "founder";
  const totalSteps = role === "investor" ? 3 : 2;

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = role === "founder" ? "/api/founder/profile" : "/api/investor/profile";
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
      if (step === 1 && role === "founder") {
        await updateProfileMutation.mutateAsync({ 
          company_name: companyName,
          location, 
          bio 
        });
      } else if (step === 1 && role === "investor") {
        await updateProfileMutation.mutateAsync({ sectors, stages });
      } else if (step === 2 && role === "investor") {
        await updateProfileMutation.mutateAsync({ 
          support_types: support
        });
      }
      setStep(step + 1);
    } else {
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
            {step === 1 && role === "founder" && "Create Your Profile"}
            {step === 1 && role === "investor" && "Investment Preferences"}
            {step === 2 && role === "founder" && "Upload Your Pitch"}
            {step === 2 && role === "investor" && "Support Preferences"}
            {step === 3 && role === "investor" && "Terms & Conditions"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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

          {step === 1 && role === "investor" && (
            <PreferenceChips
              label="Investment Sectors"
              options={["Fintech", "Healthcare", "AI/ML", "SaaS", "E-commerce", "Climate Tech", "EdTech", "Web3"]}
              selectedOptions={sectors}
              onChange={setSectors}
            />
          )}

          {step === 2 && role === "founder" && (
            <VideoUpload maxDuration={60} onSuccess={() => handleNext()} />
          )}

          {step === 2 && role === "investor" && (
            <div className="space-y-6">
              <PreferenceChips
                label="Investment Stage"
                options={["Pre-seed", "Seed", "Series A", "Series B", "Growth"]}
                selectedOptions={stages}
                onChange={setStages}
              />
              <PreferenceChips
                label="Support Type"
                options={["Capital Only", "Advisory", "Hands-on", "Board Seat", "Strategic"]}
                selectedOptions={support}
                onChange={setSupport}
              />
            </div>
          )}

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

function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin";
  
  if (!isAdmin) {
    return null;
  }
  
  const { data: stats } = useQuery<Record<string, number>>({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAdmin,
  });

  const { data: users } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAdmin,
  });

  const { data: videos, refetch: refetchVideos } = useQuery<any[]>({
    queryKey: ["/api/admin/videos"],
    enabled: isAdmin,
  });

  const { data: reports, refetch: refetchReports } = useQuery<any[]>({
    queryKey: ["/api/admin/reports"],
    enabled: isAdmin,
  });

  const updateReportStatusMutation = useMutation({
    mutationFn: async ({ reportId, status }: { reportId: string; status: string }) => {
      const res = await apiRequest("PUT", `/api/admin/reports/${reportId}`, { status });
      return res.json();
    },
    onSuccess: () => {
      refetchReports();
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Report status updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateVideoStatusMutation = useMutation({
    mutationFn: async ({ videoId, status }: { videoId: string; status: string }) => {
      const res = await apiRequest("PUT", `/api/admin/videos/${videoId}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      refetchVideos();
      queryClient.invalidateQueries({ queryKey: ["/api/videos/feed"] });
      toast({ title: "Video status updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const formattedUsers = (users || []).map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as "founder" | "investor" | "admin",
    joinDate: new Date(u.createdAt).toLocaleDateString(),
    status: "active" as const,
  }));

  const formattedVideos = (videos || []).map(v => ({
    id: v.id,
    title: v.title || "Untitled",
    founderName: v.founder?.name || "Unknown",
    companyName: v.founder?.companyName || "",
    status: v.status as "processing" | "active" | "rejected" | "archived",
    createdAt: new Date(v.createdAt).toLocaleDateString(),
    thumbnailUrl: v.thumbnailUrl,
  }));

  const pendingVideos = formattedVideos.filter(v => v.status === "processing").length;

  const moderationQueue = (reports || [])
    .filter((r: any) => r.status === "pending")
    .map((r: any) => ({
      id: r.id,
      videoId: r.videoId || "",
      reporterName: r.reporter?.name || "Unknown",
      founderName: r.reportedUser?.name || "Unknown",
      reason: r.reason,
      reportedAt: new Date(r.createdAt).toLocaleDateString(),
    }));

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8">
      <h1 className="font-display text-2xl font-bold mb-6">Admin Panel</h1>
      <AdminPanel
        totalUsers={stats?.totalUsers || users?.length || 0}
        totalVideos={stats?.totalVideos || videos?.length || 0}
        pendingModeration={stats?.pendingReports || 0}
        pendingVideos={pendingVideos}
        users={formattedUsers}
        videos={formattedVideos}
        moderationQueue={moderationQueue}
        onApproveVideo={(videoId) => updateVideoStatusMutation.mutate({ videoId, status: "active" })}
        onRejectVideo={(videoId) => updateVideoStatusMutation.mutate({ videoId, status: "rejected" })}
        onApprove={(reportId) => updateReportStatusMutation.mutate({ reportId, status: "dismissed" })}
        onWarn={(reportId) => updateReportStatusMutation.mutate({ reportId, status: "reviewed" })}
        onReject={(reportId) => updateReportStatusMutation.mutate({ reportId, status: "resolved" })}
      />
    </div>
  );
}

function PublicProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Extract userId from URL path (e.g., /user/123)
  const userId = window.location.pathname.split('/user/')[1];

  // Redirect to personal profile if viewing own profile
  React.useEffect(() => {
    if (user && user.id === userId) {
      setLocation("/profile");
    }
  }, [user, userId, setLocation]);

  const { data: profileData, isLoading } = useQuery({
    queryKey: [`/api/user/${userId}/profile`],
    queryFn: () => api.get(`/api/user/${userId}/profile`),
    enabled: !!userId && user?.id !== userId, // Only fetch if not own profile
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
      companyName={founderProfile?.company_name}
      sector={founderProfile?.sector}
      stage={founderProfile?.stage}
      videoUrl={currentVideo?.url}
      videoThumbnail={currentVideo?.thumbnailUrl}
      videoTitle={currentVideo?.title}
      videoId={currentVideo?.id}
      viewCount={currentVideo?.viewCount}
      likeCount={currentVideo?.likeCount}
      isLiked={currentVideo?.isLiked}
      
      // Investor specific
      firmName={investorProfile?.firm_name}
      title={investorProfile?.title}
      thesis={investorProfile?.thesis}
      sectors={investorProfile?.sectors}
      stages={investorProfile?.stages}
      supportTypes={investorProfile?.support_types}
      
      onBack={() => window.history.back()}
      onLike={user?.role === "investor" && isFounder ? handleLike : undefined}
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

  useEffect(() => {
    if (user && user.onboarding_complete && user.role === "admin") {
      setLocation("/admin");
      setActiveTab("admin");
    }
  }, [user, setLocation]);

  useEffect(() => {
    if (user && !user.onboarding_complete) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [user]);

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
    } catch (error: any) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    }
  };

  const handleSignup = async (data: { email: string; password: string; name: string; role: "founder" | "investor" }) => {
    try {
      await register(data);
    } catch (error: any) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "discover") setLocation("/");
    else if (tab === "messages") setLocation("/messages");
    else if (tab === "matches") setLocation("/matches");
    else if (tab === "profile") setLocation("/profile");
    else if (tab === "search") setLocation("/search");
    else if (tab === "admin") setLocation("/admin");
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
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/30">
        <AuthForms onLogin={handleLogin} onSignup={handleSignup} />
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        notificationCount={0}
        userName={user?.name || "User"}
        isAdmin={user?.role === "admin"}
        onLogout={logout}
      />
      <main>
        <Switch>
          <Route path="/" component={DiscoverPage} />
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
          <Route path="/admin">
            {user?.role === "admin" ? <AdminPage /> : <Redirect to="/" />}
          </Route>
          <Route>
            <DiscoverPage />
          </Route>
        </Switch>
      </main>
      <MobileNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <Toaster />
            <MainApp />
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;