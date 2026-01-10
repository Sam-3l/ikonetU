import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/apiClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Camera, Edit2, Check, X } from "lucide-react";
import ImageCropDialog from "@/components/ImageCropDialog";
import FounderProfileView from "@/components/FounderProfileView";
import InvestorProfileView from "@/components/InvestorProfileView";
import VideoUpload from "@/components/VideoUpload";

function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  // State
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [localIsLiked, setLocalIsLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showImageCrop, setShowImageCrop] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState("");
  const [formData, setFormData] = useState<any>({});
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const isFounder = user?.role === "founder";

  // Fetch stats
  const { data: stats } = useQuery<Record<string, number>>({
    queryKey: ["/api/profile/stats"],
    queryFn: () => api.get("/api/profile/stats"),
  });

  // Fetch profile
  const { data: profileData, refetch: refetchProfile } = useQuery({
    queryKey: isFounder ? ["/api/profile/founder/profile"] : ["/api/profile/investor/profile"],
    queryFn: () => isFounder 
      ? api.get("/api/profile/founder/profile") 
      : api.get("/api/profile/investor/profile"),
  });

  // Fetch current video for founders
  const { data: currentVideoData, refetch: refetchVideo } = useQuery({
    queryKey: ["/api/videos/my/"],
    queryFn: () => api.get("/api/videos/my/"),
    enabled: isFounder,
    refetchOnWindowFocus: true,
  });

  // Sync profile data to form
  useEffect(() => {
    if (profileData) {
      setFormData(profileData);
    }
  }, [profileData]);

  // Sync video like state
  useEffect(() => {
    if (currentVideoData) {
      setLocalIsLiked(currentVideoData.isLiked === true);
      setLocalLikeCount(currentVideoData.likeCount || 0);
    }
  }, [currentVideoData?.isLiked, currentVideoData?.likeCount, currentVideoData?.id]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = isFounder 
        ? "/api/profile/founder/profile" 
        : "/api/profile/investor/profile";
      return api.put(endpoint, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: isFounder 
          ? ["/api/profile/founder/profile"] 
          : ["/api/profile/investor/profile"] 
      });
      refetchProfile();
      setIsEditing(false);
      toast({ title: "Profile updated!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/profile/avatar/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: formData
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload avatar");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate auth query to refetch user data with new avatar
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Profile picture updated!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Handlers
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setTempImageUrl(url);
      setShowImageCrop(true);
    }
  };

  const handleImageSave = async (croppedBlob: Blob) => {
    const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
    uploadAvatarMutation.mutate(file);
    setShowImageCrop(false);
  };

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(profileData);
  };

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

  const handleLikeToggle = async () => {
    if (!currentVideoData?.id) return;
    
    const wasLiked = localIsLiked;
    const wasCount = localLikeCount;
    
    setLocalIsLiked(!wasLiked);
    setLocalLikeCount(prev => wasLiked ? Math.max(prev - 1, 0) : prev + 1);

    try {
      await api.post(`/api/videos/${currentVideoData.id}/like/`, { doubleTap: false });
      refetchVideo();
    } catch (error) {
      setLocalIsLiked(wasLiked);
      setLocalLikeCount(wasCount);
      console.error("Failed to toggle like:", error);
    }
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const calculateCompleteness = (): number => {
    if (isFounder) {
      const fields = [
        profileData?.companyName,
        profileData?.location,
        profileData?.bio,
        profileData?.sector,
        profileData?.stage,
        profileData?.fundingGoal,
        profileData?.website,
        profileData?.linkedin
      ];
      const filledFields = fields.filter(f => f && f.toString().trim() !== "").length;
      return Math.round((filledFields / fields.length) * 100);
    } else {
      const fields = [
        profileData?.firmName,
        profileData?.title,
        profileData?.thesis,
        profileData?.sectors?.length > 0,
        profileData?.stages?.length > 0,
        profileData?.checkSize,
        profileData?.supportTypes?.length > 0,
        profileData?.linkedin
      ];
      const filledFields = fields.filter(f => f).length;
      return Math.round((filledFields / fields.length) * 100);
    }
  };

  const completeness = calculateCompleteness();

  // If showing video upload, render only that
  if (showVideoUpload) {
    return (
      <div className="p-4 md:p-8 pb-20 md:pb-8">
        <div className="max-w-2xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => setShowVideoUpload(false)} 
            className="mb-4"
          >
            ← Back to Profile
          </Button>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {currentVideoData ? "Update Your Pitch" : "Upload Your Pitch Video"}
              </h2>
              <VideoUpload 
                onSuccess={() => {
                  setShowVideoUpload(false);
                  queryClient.invalidateQueries({ queryKey: ["/api/videos/my/"] });
                }} 
                onCancel={() => setShowVideoUpload(false)} 
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8 space-y-6">
      
      {/* Content wrapper */}
      <div className="relative z-10 p-4 md:p-8 pb-20 md:pb-8 space-y-6">

      {/* Profile Completeness */}
      <Card className="bg-gradient-to-br from-violet-50/50 via-purple-50/30 to-fuchsia-50/50 dark:from-violet-950/20 dark:via-purple-950/10 dark:to-fuchsia-950/20 border-purple-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Profile Completeness</span>
            <span className="text-sm font-bold">{completeness}%</span>
          </div>
          <Progress value={completeness} className="h-2" />
          {completeness < 100 && (
            <p className="text-xs text-muted-foreground mt-2">
              {isFounder 
                ? "Complete your profile to increase visibility to investors" 
                : "Complete your profile to help founders understand your investment focus"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Profile Header */}
      <Card className="bg-gradient-to-br from-background via-purple-50/20 to-background dark:via-purple-950/10 border-purple-500/10 shadow-lg shadow-purple-500/5">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative mx-auto sm:mx-0">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-muted">
                {user?.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.name} 
                    className="h-full w-full object-cover" 
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-3xl font-bold">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                <Camera className="h-4 w-4" />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageSelect} 
                />
              </label>
            </div>

            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{user?.name}</h2>
                  <p className="text-muted-foreground">
                    {isFounder 
                      ? (profileData?.companyName || "Company Name")
                      : `${profileData?.title || "Title"} ${profileData?.firmName ? `at ${profileData.firmName}` : ""}`
                    }
                  </p>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline" className="border-purple-500/30 hover:bg-gradient-to-r hover:from-violet-500 hover:to-fuchsia-500 hover:text-white hover:border-transparent transition-all">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Views */}
      {isFounder ? (
        <FounderProfileView
          profileData={profileData}
          formData={formData}
          setFormData={setFormData}
          isEditing={isEditing}
          stats={stats}
          currentVideoData={currentVideoData}
          videoRef={videoRef}
          isPlaying={isPlaying}
          isMuted={isMuted}
          localIsLiked={localIsLiked}
          localLikeCount={localLikeCount}
          onSave={handleSave}
          onCancel={handleCancel}
          onTogglePlay={togglePlay}
          onToggleMute={toggleMute}
          onLikeToggle={handleLikeToggle}
          onUpdateVideo={() => setShowVideoUpload(true)}
          formatCount={formatCount}
        />
      ) : (
        <InvestorProfileView
          profileData={profileData}
          formData={formData}
          setFormData={setFormData}
          isEditing={isEditing}
          stats={stats}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* No video CTA for founders */}
      {isFounder && !currentVideoData && !showVideoUpload && (
        <Card className="bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border-purple-500/20">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              You haven't uploaded a pitch video yet
            </p>
            <Button onClick={() => setShowVideoUpload(true)}>
              Upload Your First Pitch
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Image Crop Dialog */}
      <ImageCropDialog
        isOpen={showImageCrop}
        onClose={() => setShowImageCrop(false)}
        imageUrl={tempImageUrl}
        onSave={handleImageSave}
      />
      </div>
    </div>
  );
}

export default ProfilePage;