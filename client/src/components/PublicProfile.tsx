import { useState, useRef } from "react";
import { ArrowLeft, MapPin, Briefcase, TrendingUp, Heart, Eye, Play, Volume2, VolumeX, Globe, Linkedin, DollarSign, Target, Users, Award, HandHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  fundingGoal?: string;
  website?: string;
  linkedin?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  videoTitle?: string;
  videoId?: string;
  viewCount?: number;
  likeCount?: number;
  isLiked?: boolean;
  
  // New founder fields (arrays)
  sectors?: string[];
  stages?: string[];
  supportTypes?: string[];
  
  // Investor specific
  firmName?: string;
  title?: string;
  thesis?: string;
  investorSectors?: string[];  // Renamed to avoid conflict
  investorStages?: string[];   // Renamed to avoid conflict
  investorSupportTypes?: string[];  // Renamed to avoid conflict
  checkSize?: string;
  investorLinkedin?: string;
  
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
  fundingGoal,
  website,
  linkedin,
  videoUrl,
  videoThumbnail,
  videoTitle,
  videoId,
  viewCount = 0,
  likeCount = 0,
  isLiked = false,
  sectors = [],
  stages = [],
  supportTypes = [],
  firmName,
  title,
  thesis,
  investorSectors = [],
  investorStages = [],
  investorSupportTypes = [],
  checkSize,
  investorLinkedin,
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
        if (!hasViewed && videoId && onView) {
          setHasViewed(true);
          onView(videoId);
        }
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
    if (!videoId || !onLike) return;
    
    const wasLiked = localIsLiked;
    setLocalIsLiked(!wasLiked);
    setLocalLikeCount(prev => wasLiked ? Math.max(prev - 1, 0) : prev + 1);
    
    try {
      await onLike(videoId);
    } catch (error) {
      setLocalIsLiked(wasLiked);
      setLocalLikeCount(prev => wasLiked ? prev + 1 : Math.max(prev - 1, 0));
    }
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
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
        {/* Profile Header Card */}
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <Avatar className="h-28 w-28 border-4 border-background shadow-xl ring-2 ring-primary/10">
                <AvatarImage src={avatar} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-3xl font-bold">
                  {name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="font-display text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    {name}
                  </h2>
                  {userType === "founder" ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <p className="text-lg font-medium text-muted-foreground">{companyName}</p>
                    </div>
                  ) : (
                    <div className="space-y-1 mt-1">
                      <p className="text-lg font-medium text-muted-foreground">{title}</p>
                      {firmName && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <p className="text-muted-foreground">{firmName}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  {location && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm font-medium">{location}</span>
                    </div>
                  )}
                  
                  {userType === "founder" && sector && (
                    <Badge variant="secondary" className="gap-1.5">
                      <Target className="h-3 w-3" />
                      {sector}
                    </Badge>
                  )}
                  
                  {userType === "founder" && stage && (
                    <Badge variant="secondary" className="gap-1.5">
                      <TrendingUp className="h-3 w-3" />
                      {stage}
                    </Badge>
                  )}
                </div>

                {/* Links for founders */}
                {userType === "founder" && (website || linkedin) && (
                  <div className="flex gap-2">
                    {website && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={website} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4 mr-2" />
                          Website
                        </a>
                      </Button>
                    )}
                    {linkedin && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={linkedin} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-4 w-4 mr-2" />
                          LinkedIn
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        {bio && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {userType === "founder" ? "About the Founder" : "About"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Founder Specific - Funding Goal */}
        {userType === "founder" && fundingGoal && (
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Funding Goal</p>
                  <p className="text-xl font-bold">{fundingGoal}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Founder Specific - Focus & Preferences */}
        {userType === "founder" && (sectors.length > 0 || stages.length > 0 || supportTypes.length > 0) && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Business Focus */}
            {(sectors.length > 0 || stages.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Business Focus</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sectors.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 text-sm text-muted-foreground flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Industry Sectors
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {sectors.map((sectorItem, idx) => (
                          <Badge key={idx} variant="secondary" className="text-sm">
                            {sectorItem}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {stages.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 text-sm text-muted-foreground flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Funding Stages
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {stages.map((stageItem, idx) => (
                          <Badge key={idx} variant="secondary" className="text-sm">
                            {stageItem}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Support Seeking */}
            {supportTypes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Support Seeking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3 text-sm text-muted-foreground flex items-center gap-2">
                      <HandHeart className="h-4 w-4" />
                      Types of Support
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {supportTypes.map((type, idx) => (
                        <Badge key={idx} variant="outline" className="text-sm">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Founder's Video Section */}
        {userType === "founder" && videoUrl && (
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-video bg-black">
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
                
                {!isPlaying && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
                    onClick={togglePlay}
                  >
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all">
                      <Play className="w-10 h-10 text-white ml-1" />
                    </div>
                  </div>
                )}

                <div className="absolute top-4 right-4 z-10">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-12 w-12 rounded-full bg-black/40 backdrop-blur-sm text-white border-0 hover:bg-black/60"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                </div>

                <div 
                  className="absolute inset-0 cursor-pointer"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 5rem) 0, calc(100% - 5rem) 5rem, 100% 5rem, 100% 100%, 0 100%)' }}
                  onClick={togglePlay}
                />
              </div>
              
              <div className="p-6 space-y-4 bg-gradient-to-b from-background to-muted/20">
                {videoTitle && (
                  <h3 className="font-display text-xl font-bold">{videoTitle}</h3>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Eye className="h-5 w-5" />
                      <span className="font-semibold">{formatCount(viewCount)}</span>
                      <span className="text-sm">views</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Heart className="h-5 w-5" />
                      <span className="font-semibold">{formatCount(localLikeCount)}</span>
                      <span className="text-sm">likes</span>
                    </div>
                  </div>

                  {onLike && videoId && (
                    <Button
                      size="lg"
                      variant={localIsLiked ? "default" : "outline"}
                      className={localIsLiked ? "bg-red-500 hover:bg-red-600" : ""}
                      onClick={handleLikeToggle}
                    >
                      <Heart className={`h-5 w-5 mr-2 ${localIsLiked ? 'fill-white' : ''}`} />
                      {localIsLiked ? "Liked" : "Like"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Investor's Investment Thesis */}
        {userType === "investor" && thesis && (
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Investment Thesis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed text-base">{thesis}</p>
            </CardContent>
          </Card>
        )}

        {/* Investor's Investment Criteria */}
        {userType === "investor" && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Investment Focus */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Investment Focus</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {investorSectors.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-sm text-muted-foreground flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Sectors
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {investorSectors.map((sectorItem, idx) => (
                        <Badge key={idx} variant="secondary" className="text-sm">
                          {sectorItem}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {investorStages.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-sm text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Stages
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {investorStages.map((stageItem, idx) => (
                        <Badge key={idx} variant="secondary" className="text-sm">
                          {stageItem}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {checkSize && (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-muted-foreground flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Check Size
                    </h4>
                    <p className="text-lg font-bold">{checkSize}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Support & Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Support & Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {investorSupportTypes.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-sm text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Support Types
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {investorSupportTypes.map((type, idx) => (
                        <Badge key={idx} variant="outline" className="text-sm">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {investorLinkedin && (
                  <div>
                    <h4 className="font-semibold mb-3 text-sm text-muted-foreground">Connect</h4>
                    <Button variant="outline" className="w-full" asChild>
                      <a href={investorLinkedin} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-4 w-4 mr-2" />
                        View LinkedIn Profile
                      </a>
                    </Button>
                  </div>
                )}

                {!investorSupportTypes.length && !investorLinkedin && (
                  <p className="text-sm text-muted-foreground italic">
                    Contact information not provided
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty state for investors without data */}
        {userType === "investor" && !thesis && investorSectors.length === 0 && investorStages.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg">Profile In Progress</h3>
                <p className="text-muted-foreground">
                  This investor is still setting up their profile. Check back soon for more details about their investment focus.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}