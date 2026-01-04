import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, MapPin, User, Globe, Linkedin, Eye, Heart, TrendingUp, Play, VolumeX, Volume2 } from "lucide-react";

interface FounderProfileViewProps {
  profileData: any;
  formData: any;
  setFormData: (data: any) => void;
  isEditing: boolean;
  stats: any;
  currentVideoData: any;
  videoRef: React.RefObject<HTMLVideoElement>;
  isPlaying: boolean;
  isMuted: boolean;
  localIsLiked: boolean;
  localLikeCount: number;
  onSave: () => void;
  onCancel: () => void;
  onTogglePlay: () => void;
  onToggleMute: (e?: React.MouseEvent) => void;
  onLikeToggle: () => void;
  onUpdateVideo: () => void;
  formatCount: (count: number) => string;
}

function FounderProfileView({
  profileData,
  formData,
  setFormData,
  isEditing,
  stats,
  currentVideoData,
  videoRef,
  isPlaying,
  isMuted,
  localIsLiked,
  localLikeCount,
  onSave,
  onCancel,
  onTogglePlay,
  onToggleMute,
  onLikeToggle,
  onUpdateVideo,
  formatCount
}: FounderProfileViewProps) {
  const sectors = ["Fintech", "Healthcare", "AI/ML", "SaaS", "E-commerce", "Climate Tech", "EdTech", "Web3", "Consumer", "Enterprise"];
  const stages = ["Idea", "MVP", "Early Revenue", "Growth", "Scale"];
  
  const responseRate = stats?.interestedCount > 0 
    ? Math.round((stats.activeMatches / stats.interestedCount) * 100) 
    : 0;

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col items-center text-center">
              <Eye className="h-5 w-5 md:h-6 md:w-6 mb-2 text-primary" />
              <div className="text-xl md:text-2xl font-bold">{formatCount(stats?.totalViews || 0)}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Views</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col items-center text-center">
              <Heart className="h-5 w-5 md:h-6 md:w-6 mb-2 text-primary" />
              <div className="text-xl md:text-2xl font-bold">{stats?.activeMatches || 0}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Matches</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col items-center text-center">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6 mb-2 text-primary" />
              <div className="text-xl md:text-2xl font-bold">{responseRate}%</div>
              <div className="text-xs md:text-sm text-muted-foreground">Response</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name *</Label>
                  <Input 
                    value={formData.companyName || ""} 
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} 
                    placeholder="Your startup name" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Input 
                    value={formData.location || ""} 
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
                    placeholder="City, Country" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Industry Sector *</Label>
                  <Select 
                    value={formData.sector || ""} 
                    onValueChange={(value) => setFormData({ ...formData, sector: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Startup Stage *</Label>
                  <Select 
                    value={formData.stage || ""} 
                    onValueChange={(value) => setFormData({ ...formData, stage: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Biography ({(formData.bio || "").length}/500) *</Label>
                <Textarea 
                  value={formData.bio || ""} 
                  onChange={(e) => { 
                    if (e.target.value.length <= 500) 
                      setFormData({ ...formData, bio: e.target.value }); 
                  }} 
                  placeholder="Tell investors about yourself and your vision..." 
                  className="min-h-[120px]" 
                  maxLength={500} 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Funding Goal</Label>
                  <Input 
                    value={formData.fundingGoal || ""} 
                    onChange={(e) => setFormData({ ...formData, fundingGoal: e.target.value })} 
                    placeholder="e.g. $500K - $1M" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input 
                    type="url" 
                    value={formData.website || ""} 
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })} 
                    placeholder="https://yourcompany.com" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>LinkedIn Profile</Label>
                <Input 
                  type="url" 
                  value={formData.linkedin || ""} 
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} 
                  placeholder="https://linkedin.com/in/yourprofile" 
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={onSave} className="flex-1">Save Changes</Button>
                <Button onClick={onCancel} variant="outline" className="flex-1">Cancel</Button>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>Company</span>
                  </div>
                  <p className="font-medium">{profileData?.companyName || "Not set"}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Location</span>
                  </div>
                  <p className="font-medium">{profileData?.location || "Not set"}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Sector</div>
                  <Badge variant="secondary">{profileData?.sector || "Not set"}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Stage</div>
                  <Badge variant="secondary">{profileData?.stage || "Not set"}</Badge>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Bio</span>
                </div>
                <p className="text-sm">{profileData?.bio || "No bio provided"}</p>
              </div>
              
              {profileData?.fundingGoal && (
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Funding Goal</div>
                  <p className="font-medium">{profileData.fundingGoal}</p>
                </div>
              )}
              
              <div className="flex gap-4">
                {profileData?.website && (
                  <a 
                    href={profileData.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
                {profileData?.linkedin && (
                  <a 
                    href={profileData.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

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
                onPlay={() => {}}
                onPause={() => {}}
              />
              
              {!isPlaying && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer" 
                  onClick={onTogglePlay}
                >
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
              )}
              
              <div className="absolute top-3 right-3 z-10">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm text-white border-0" 
                  onClick={onToggleMute}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
              </div>
              
              <div 
                className="absolute inset-0 cursor-pointer" 
                style={{ clipPath: 'polygon(0 0, calc(100% - 4rem) 0, calc(100% - 4rem) 4rem, 100% 4rem, 100% 100%, 0 100%)' }} 
                onClick={onTogglePlay} 
              />
            </div>
            
            <div className="p-4 space-y-3">
              {currentVideoData.title && (
                <h3 className="font-semibold text-lg">{currentVideoData.title}</h3>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{formatCount(currentVideoData.viewCount || 0)} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    <span>{formatCount(localLikeCount)} likes</span>
                  </div>
                  {currentVideoData.status && (
                    <Badge 
                      variant={
                        currentVideoData.status === 'active' ? 'default' : 
                        currentVideoData.status === 'processing' ? 'secondary' : 
                        'destructive'
                      }
                    >
                      {currentVideoData.status}
                    </Badge>
                  )}
                </div>
                
                <Button 
                  size="icon" 
                  variant={localIsLiked ? "default" : "outline"} 
                  className={localIsLiked ? "bg-red-500 hover:bg-red-600" : ""} 
                  onClick={onLikeToggle}
                >
                  <Heart className={`h-5 w-5 ${localIsLiked ? 'fill-white' : ''}`} />
                </Button>
              </div>
              
              <Button variant="outline" className="w-full" onClick={onUpdateVideo}>
                Update Pitch Video
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

export default FounderProfileView;