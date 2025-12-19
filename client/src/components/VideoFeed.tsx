import { useState, useRef, useEffect as React_useEffect } from "react";
import * as React from "react";
import { Heart, Bookmark, X, Info, Volume2, VolumeX, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Flag } from "lucide-react";
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

interface Founder {
  id: string;
  name: string;
  avatar?: string;
  company: string;
  sector: string;
  stage: string;
  location: string;
  videoUrl: string;
  videoPoster?: string;
  videoId: string;
}

interface VideoFeedProps {
  founders: Founder[];
  onInterested?: (founderId: string) => void;
  onMaybe?: (founderId: string) => void;
  onPass?: (founderId: string) => void;
  onInfo?: (founderId: string) => void;
  onReport?: (founderId: string, videoId: string) => void;
}

export default function VideoFeed({
  founders,
  onInterested,
  onMaybe,
  onPass,
  onInfo,
  onReport,
}: VideoFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPassConfirm, setShowPassConfirm] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentFounder = founders[currentIndex];

  // Auto-play when video changes
  React.useEffect(() => {
    if (videoRef.current && currentFounder?.videoUrl) {
      videoRef.current.load();
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error("Auto-play failed:", error);
            setIsPlaying(false);
          });
      }
    }
  }, [currentIndex, currentFounder?.videoUrl]);

  const advanceToNext = () => {
    if (currentIndex < founders.length - 1) {
      // Pause current video before advancing
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setCurrentIndex((prev) => prev + 1);
      setIsPlaying(false);
    }
  };

  const handleAction = (action: "interested" | "maybe" | "pass") => {
    const founderId = currentFounder.id;
    if (action === "interested") {
      onInterested?.(founderId);
      advanceToNext();
    } else if (action === "maybe") {
      onMaybe?.(founderId);
      advanceToNext();
    } else {
      setShowPassConfirm(true);
    }
  };

  const handleConfirmPass = () => {
    onPass?.(currentFounder.id);
    setShowPassConfirm(false);
    advanceToNext();
  };

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent event bubbling
    
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = videoRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch((err) => {
              console.error("Video play error:", err);
              setIsPlaying(false);
            });
        }
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (!currentFounder) {
    return (
      <div className="flex h-full items-center justify-center bg-background" data-testid="feed-empty">
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Heart className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2">No more pitches</h3>
          <p className="text-muted-foreground">Check back later for new founders</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-black overflow-hidden" data-testid="video-feed">
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80"
        style={{ zIndex: 1 }}
      />

      <div
        className="absolute inset-0 flex items-center justify-center"
      >
        {currentFounder.videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={currentFounder.videoUrl}
              poster={currentFounder.videoPoster}
              className="w-full h-full object-cover"
              muted={isMuted}
              loop
              playsInline
              preload="auto"
              data-testid="video-player"
              onError={(e) => {
                console.error("Video load error:", e);
                console.log("Failed URL:", currentFounder.videoUrl);
              }}
              onLoadedData={() => {
                console.log("Video loaded successfully:", currentFounder.videoUrl);
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            {/* Clickable overlay for play/pause */}
            <div 
              className="absolute inset-0 cursor-pointer z-[2]"
              onClick={togglePlay}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <div className="text-white/60 text-center p-4">
              <Play className="w-16 h-16 mx-auto mb-2 opacity-50" />
              <p>No video available</p>
            </div>
          </div>
        )}
        {!isPlaying && currentFounder.videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none z-[3]">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-10 h-10 text-white ml-1" />
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-24 left-4 right-20 z-10" data-testid="founder-info-overlay">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-12 w-12 border-2 border-white/50">
            <AvatarImage src={currentFounder.avatar} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {currentFounder.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-display text-lg font-semibold text-white">
              {currentFounder.name}
            </h3>
            <p className="text-white/80 text-sm">{currentFounder.company}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm">
            {currentFounder.sector}
          </Badge>
          <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm">
            {currentFounder.stage}
          </Badge>
          <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm">
            {currentFounder.location}
          </Badge>
        </div>
      </div>

      <div className="absolute right-4 bottom-32 z-10 flex flex-col gap-4" data-testid="action-buttons">
        <Button
          size="icon"
          variant="ghost"
          className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm text-white border-0"
          onClick={() => handleAction("interested")}
          data-testid="button-interested"
        >
          <Heart className="h-7 w-7" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm text-white border-0"
          onClick={() => handleAction("maybe")}
          data-testid="button-maybe"
        >
          <Bookmark className="h-7 w-7" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm text-white border-0"
          onClick={() => handleAction("pass")}
          data-testid="button-pass"
        >
          <X className="h-7 w-7" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm text-white border-0"
          onClick={() => onInfo?.(currentFounder.id)}
          data-testid="button-info"
        >
          <Info className="h-7 w-7" />
        </Button>
        <div className="h-2" />
        <Button
          size="icon"
          variant="ghost"
          className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm text-white/70 border-0 hover:text-white"
          onClick={() => onReport?.(currentFounder.id, currentFounder.videoId)}
          data-testid="button-report"
        >
          <Flag className="h-7 w-7" />
        </Button>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <Button
          size="icon"
          variant="ghost"
          className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm text-white border-0"
          onClick={toggleMute}
          data-testid="button-mute"
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
      </div>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-1">
        {founders.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 rounded-full transition-all ${
              idx === currentIndex
                ? "w-6 bg-white"
                : idx < currentIndex
                ? "w-4 bg-white/50"
                : "w-4 bg-white/30"
            }`}
          />
        ))}
      </div>

      <AlertDialog open={showPassConfirm} onOpenChange={setShowPassConfirm}>
        <AlertDialogContent data-testid="pass-confirm-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Pass on this founder?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. You will no longer see {currentFounder?.company || "this founder"} in your feed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-pass">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPass} data-testid="button-confirm-pass">
              Pass
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}