import { useState, useRef } from "react";
import { ArrowLeft, MapPin, Briefcase, TrendingUp, Heart, Eye, Play, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface PublicProfileProps {
  userId: string;
  userType: "founder" | "investor";
  name: string;
  avatar?: string;
  location: string;
  bio: string;
  
  // Founder specific
  companyName?: string;
  sector?: string;
  stage?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  videoTitle?: string;
  videoId?: string;
  viewCount?: number;
  likeCount?: number;
  isLiked?: boolean;
  
  // Investor specific
  firmName?: string;
  title?: string;
  thesis?: string;
  sectors?: string[];
  stages?: string[];
  supportTypes?: string[];
  
  onBack?: () => void;
  onLike?: (videoId: string) => Promise<void>;
  onView?: (videoId: string) => Promise<void>;
}

export default function PublicProfile({
  userId,
  userType,
  name,
  avatar,
  location,
  bio,
  companyName,
  sector,
  stage,
  videoUrl,
  videoThumbnail,
  videoTitle,
  videoId,
  viewCount = 0,
  likeCount = 0,
  isLiked = false,
  firmName,
  title,
  thesis,
  sectors = [],
  stages = [],
  supportTypes = [],
  onBack,
  onLike,
  onView,
}: PublicProfileProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const [localLikeCount, setLocalLikeCount] = useState(likeCount);
  const [hasViewed, setHasViewed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        // Track view on first play
        if (!hasViewed && videoId && onView) {
          setHasViewed(true);
          onView(videoId);
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLikeToggle = async () => {
    if (!videoId || !onLike) return;
    
    const wasLiked = localIsLiked;
    
    // Optimistic update
    setLocalIsLiked(!wasLiked);
    setLocalLikeCount(prev => wasLiked ? Math.max(prev - 1, 0) : prev + 1);
    
    try {
      await onLike(videoId);
    } catch (error) {
      // Rollback on error
      setLocalIsLiked(wasLiked);
      setLocalLikeCount(prev => wasLiked ? prev + 1 : Math.max(prev - 1, 0));
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-lg font-semibold">{name}</h1>
            <p className="text-sm text-muted-foreground">
              {userType === "founder" ? companyName : firmName}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 pb-20 md:pb-6 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage src={avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="font-display text-2xl font-bold">{name}</h2>
                  {userType === "founder" ? (
                    <p className="text-lg text-muted-foreground">{companyName}</p>
                  ) : (
                    <>
                      <p className="text-lg text-muted-foreground">{title}</p>
                      <p className="text-muted-foreground">{firmName}</p>
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{location}</span>
                </div>

                {userType === "founder" && (
                  <div className="flex flex-wrap gap-2">
                    {sector && (
                      <Badge variant="secondary" className="gap-1">
                        <Briefcase className="h-3 w-3" />
                        {sector}
                      </Badge>
                    )}
                    {stage && (
                      <Badge variant="secondary" className="gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {stage}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            {bio && (
              <>
                <Separator className="my-4" />
                <p className="text-muted-foreground leading-relaxed">{bio}</p>
              </>
            )}


          </CardContent>
        </Card>

        {/* Founder's Video Section */}
        {userType === "founder" && videoUrl && (
          <Card>
            <CardContent className="p-0">
              <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  poster={videoThumbnail}
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
                <div className="absolute top-3 right-3">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm text-white border-0"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                </div>

                {/* Click to play/pause */}
                <div 
                  className="absolute inset-0 cursor-pointer"
                  onClick={togglePlay}
                />
              </div>
              
              <div className="p-4 space-y-3">
                {videoTitle && (
                  <h3 className="font-semibold text-lg">{videoTitle}</h3>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span>{formatCount(viewCount)} views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      <span>{formatCount(localLikeCount)} likes</span>
                    </div>
                  </div>

                  {/* Like button for investors */}
                  {onLike && videoId && (
                    <Button
                      size="icon"
                      variant={localIsLiked ? "default" : "outline"}
                      className={localIsLiked ? "bg-red-500 hover:bg-red-600" : ""}
                      onClick={handleLikeToggle}
                    >
                      <Heart className={`h-5 w-5 ${localIsLiked ? 'fill-white' : ''}`} />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Investor's Investment Preferences */}
        {userType === "investor" && (
          <>
            {thesis && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-display text-lg font-semibold mb-3">Investment Thesis</h3>
                  <p className="text-muted-foreground leading-relaxed">{thesis}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-6 space-y-4">
                {sectors.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Investment Sectors</h4>
                    <div className="flex flex-wrap gap-2">
                      {sectors.map((sector, idx) => (
                        <Badge key={idx} variant="secondary">{sector}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {stages.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Investment Stages</h4>
                    <div className="flex flex-wrap gap-2">
                      {stages.map((stage, idx) => (
                        <Badge key={idx} variant="secondary">{stage}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {supportTypes.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Support Type</h4>
                    <div className="flex flex-wrap gap-2">
                      {supportTypes.map((type, idx) => (
                        <Badge key={idx} variant="outline">{type}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}