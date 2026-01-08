import { useState, useRef, useEffect as React_useEffect } from "react";
import * as React from "react";
import { Heart, Bookmark, X, Info, Volume2, VolumeX, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import BrandLoader from "@/components/BrandLoader";
import { Flag } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
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
  title?: string;
  viewCount?: number;
  likeCount?: number;
  isLiked?: boolean;
}

interface VideoFeedProps {
  founders: Founder[];
  onInterested?: (founderId: string) => void;
  onMaybe?: (founderId: string) => void;
  onPass?: (founderId: string) => void;
  onInfo?: (founderId: string) => void;
  onReport?: (founderId: string, videoId: string) => void;
  onLike?: (videoId: string, isDoubleTap?: boolean) => Promise<void>;
  onView?: (videoId: string) => Promise<void>;
}

export default function VideoFeed({
  founders,
  onInterested,
  onMaybe,
  onPass,
  onInfo,
  onReport,
  onLike,
  onView,
}: VideoFeedProps) {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [playingStates, setPlayingStates] = useState<Record<number, boolean>>({});
  const [showPassConfirm, setShowPassConfirm] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [viewedVideos, setViewedVideos] = useState<Set<string>>(new Set());
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
  const [showLoader, setShowLoader] = useState<Record<number, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
  const touchStartY = useRef(0);
  const lastTap = useRef(0);
  const isDoubleTapping = useRef(false);
  const loadingTimers = useRef<Record<number, NodeJS.Timeout>>({});
  const isTransitioning = useRef(false);
  const pendingLikeActions = useRef<Set<string>>(new Set());

  const lastSyncedData = useRef<string>('');

  // Get background color based on theme
  const getBackgroundColor = () => {
    return theme === 'dark' ? 'black' : 'white';
  };

  // Sync with server data but preserve optimistic updates
  React.useEffect(() => {
    const currentDataKey = founders.map(f => 
      `${f.videoId}-${f.isLiked}-${f.likeCount}-${f.viewCount}`
    ).join('|');
    
    if (currentDataKey === lastSyncedData.current) return;
    
    const newLikes: Record<string, boolean> = {};
    const newLikeCounts: Record<string, number> = {};
    const newViewCounts: Record<string, number> = {};
    
    founders.forEach(founder => {
      // Only update from server if there's no pending action for this video
      if (!pendingLikeActions.current.has(founder.videoId)) {
        newLikes[founder.videoId] = founder.isLiked || false;
        newLikeCounts[founder.videoId] = founder.likeCount || 0;
      } else {
        // Keep optimistic state for pending actions
        newLikes[founder.videoId] = likedVideos[founder.videoId] ?? (founder.isLiked || false);
        newLikeCounts[founder.videoId] = likeCounts[founder.videoId] ?? (founder.likeCount || 0);
      }
      newViewCounts[founder.videoId] = founder.viewCount || 0;
    });
    
    setLikedVideos(newLikes);
    setLikeCounts(newLikeCounts);
    setViewCounts(newViewCounts);
    lastSyncedData.current = currentDataKey;
  }, [founders]);

  // Auto-play current video and pause others
  React.useEffect(() => {
    const currentVideo = videoRefs.current[currentIndex];
    
    if (currentVideo && founders[currentIndex]?.videoUrl) {
      currentVideo.load();
      const playPromise = currentVideo.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setPlayingStates(prev => ({ ...prev, [currentIndex]: true }));
            handleView(founders[currentIndex].videoId);
          })
          .catch((error) => {
            console.error("Auto-play failed:", error);
            setPlayingStates(prev => ({ ...prev, [currentIndex]: false }));
          });
      }
    }

    Object.entries(videoRefs.current).forEach(([idx, video]) => {
      if (video && parseInt(idx) !== currentIndex) {
        video.pause();
        setPlayingStates(prev => ({ ...prev, [parseInt(idx)]: false }));
      }
    });
  }, [currentIndex, founders]);

  const handleView = async (videoId: string) => {
    if (!viewedVideos.has(videoId)) {
      setViewedVideos(prev => new Set(prev).add(videoId));
      setViewCounts(prev => ({
        ...prev,
        [videoId]: (prev[videoId] || 0) + 1
      }));
      
      if (onView) {
        try {
          await onView(videoId);
        } catch (error) {
          console.error("Failed to track view:", error);
        }
      }
    }
  };

  const handleLikeToggle = async (videoId: string, forceAction?: 'like') => {
    // Prevent duplicate actions
    if (pendingLikeActions.current.has(videoId)) {
      return;
    }
    
    const isCurrentlyLiked = likedVideos[videoId];
    
    if (forceAction === 'like' && isCurrentlyLiked) {
      setShowLikeAnimation(true);
      setTimeout(() => setShowLikeAnimation(false), 1000);
      return;
    }
    
    const newLikedState = forceAction === 'like' ? true : !isCurrentlyLiked;
    
    // Mark as pending
    pendingLikeActions.current.add(videoId);
    
    // Optimistic update - immediate UI change
    setLikedVideos(prev => ({
      ...prev,
      [videoId]: newLikedState
    }));
    
    setLikeCounts(prev => ({
      ...prev,
      [videoId]: newLikedState 
        ? (prev[videoId] || 0) + 1 
        : Math.max((prev[videoId] || 0) - 1, 0)
    }));
    
    if (newLikedState) {
      setShowLikeAnimation(true);
      setTimeout(() => setShowLikeAnimation(false), 1000);
      
      const currentFounder = founders.find(f => f.videoId === videoId);
      if (currentFounder) {
        onInterested?.(currentFounder.id);
      }
    }
    
    if (onLike) {
      try {
        await onLike(videoId, forceAction === 'like');
        // Remove from pending after successful completion
        setTimeout(() => {
          pendingLikeActions.current.delete(videoId);
        }, 500);
      } catch (error) {
        console.error("Failed to toggle like:", error);
        // Rollback on error
        setLikedVideos(prev => ({
          ...prev,
          [videoId]: isCurrentlyLiked
        }));
        setLikeCounts(prev => ({
          ...prev,
          [videoId]: isCurrentlyLiked 
            ? (prev[videoId] || 0) + 1 
            : Math.max((prev[videoId] || 0) - 1, 0)
        }));
        pendingLikeActions.current.delete(videoId);
      }
    }
  };

  // STRONG SCROLL CONTROL - Prevents overscrolling
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (isTransitioning.current) return;
      
      isTransitioning.current = true;
      
      if (e.deltaY > 0 && currentIndex < founders.length - 1) {
        scrollToVideo(currentIndex + 1);
      } else if (e.deltaY < 0 && currentIndex > 0) {
        scrollToVideo(currentIndex - 1);
      } else {
        isTransitioning.current = false;
      }
      
      setTimeout(() => {
        isTransitioning.current = false;
      }, 800);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [currentIndex, founders.length]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning.current) return;
      
      if (e.key === 'ArrowDown' && currentIndex < founders.length - 1) {
        e.preventDefault();
        isTransitioning.current = true;
        scrollToVideo(currentIndex + 1);
        setTimeout(() => { isTransitioning.current = false; }, 800);
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        e.preventDefault();
        isTransitioning.current = true;
        scrollToVideo(currentIndex - 1);
        setTimeout(() => { isTransitioning.current = false; }, 800);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, founders.length]);

  // Touch navigation - FIRM CONTROL
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchStartTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartTime = Date.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent pull-to-refresh when scrolling up from first video
      if (currentIndex === 0) {
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - touchStartY.current;
        
        // If trying to scroll up (pull down) when at first video, prevent it
        if (deltaY > 0) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isTransitioning.current) return;
      
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartY.current - touchEndY;
      const touchDuration = Date.now() - touchStartTime;
      
      // Only process if it's a deliberate swipe (not just a tap)
      if (Math.abs(deltaY) > 50 && touchDuration < 500) {
        isTransitioning.current = true;
        
        if (deltaY > 0 && currentIndex < founders.length - 1) {
          scrollToVideo(currentIndex + 1);
        } else if (deltaY < 0 && currentIndex > 0) {
          scrollToVideo(currentIndex - 1);
        } else {
          isTransitioning.current = false;
        }
        
        setTimeout(() => {
          isTransitioning.current = false;
        }, 800);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentIndex, founders.length]);

  const scrollToVideo = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    
    const containerHeight = container.clientHeight;
    const targetScroll = index * containerHeight;
    
    // Force immediate scroll to exact position
    container.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
    
    setCurrentIndex(index);
  };

  const advanceToNext = () => {
    if (currentIndex < founders.length - 1) {
      scrollToVideo(currentIndex + 1);
    }
  };

  const handleAction = (action: "interested" | "maybe" | "pass") => {
    const founderId = founders[currentIndex].id;
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
    onPass?.(founders[currentIndex].id);
    setShowPassConfirm(false);
    advanceToNext();
  };

  const togglePlay = (e?: React.MouseEvent, index?: number) => {
    e?.stopPropagation();
    const targetIndex = index ?? currentIndex;
    const video = videoRefs.current[targetIndex];
    
    if (video) {
      const isCurrentlyPlaying = playingStates[targetIndex];
      
      if (isCurrentlyPlaying) {
        video.pause();
        setPlayingStates(prev => ({ ...prev, [targetIndex]: false }));
      } else {
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setPlayingStates(prev => ({ ...prev, [targetIndex]: true }));
            })
            .catch((err) => {
              console.error("Video play error:", err);
              setPlayingStates(prev => ({ ...prev, [targetIndex]: false }));
            });
        }
      }
    }
  };

  const handleDoubleTap = (e: React.MouseEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      e.stopPropagation();
      e.preventDefault();
      isDoubleTapping.current = true;
      handleLikeToggle(founders[currentIndex].videoId, 'like');
      
      setTimeout(() => {
        isDoubleTapping.current = false;
      }, 400);
      
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  };

  const handleVideoClick = (e: React.MouseEvent, index: number) => {
    // Don't do anything if we're transitioning between videos
    if (isTransitioning.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    if (isDoubleTapping.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    handleDoubleTap(e);
    
    setTimeout(() => {
      if (!isDoubleTapping.current && Date.now() - lastTap.current > 300) {
        togglePlay(e, index);
      }
    }, 320);
  };

  const toggleMute = () => {
    Object.values(videoRefs.current).forEach(video => {
      if (video) {
        video.muted = !isMuted;
      }
    });
    setIsMuted(!isMuted);
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (founders.length === 0) {
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
    <div 
      ref={containerRef}
      className="h-full w-full overflow-hidden snap-y snap-mandatory scrollbar-hide"
      style={{ 
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'none'
      }}
      data-testid="video-feed"
    >
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {founders.map((founder, index) => (
        <div 
          key={founder.id}
          className="relative h-full w-full snap-start snap-always flex items-center justify-center"
          style={{ backgroundColor: getBackgroundColor() }}
        >
          <div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none"
            style={{ zIndex: 1 }}
          />

          <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: getBackgroundColor() }}>
            {founder.videoUrl ? (
              <>
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  src={founder.videoUrl}
                  poster={founder.videoPoster}
                  className="w-full h-full"
                  style={{
                    objectFit: 'contain'
                  }}
                  muted={isMuted}
                  loop
                  playsInline
                  preload="metadata"
                  data-testid="video-player"
                  onLoadStart={() => {
                    setLoadingStates(prev => ({ ...prev, [index]: true }));
                    
                    // Only show loader after 800ms delay
                    loadingTimers.current[index] = setTimeout(() => {
                      if (loadingStates[index]) {
                        setShowLoader(prev => ({ ...prev, [index]: true }));
                      }
                    }, 800);
                  }}
                  onLoadedData={() => {
                    if (loadingTimers.current[index]) {
                      clearTimeout(loadingTimers.current[index]);
                    }
                    setLoadingStates(prev => ({ ...prev, [index]: false }));
                    setShowLoader(prev => ({ ...prev, [index]: false }));
                  }}
                  onCanPlay={() => {
                    if (loadingTimers.current[index]) {
                      clearTimeout(loadingTimers.current[index]);
                    }
                    setLoadingStates(prev => ({ ...prev, [index]: false }));
                    setShowLoader(prev => ({ ...prev, [index]: false }));
                  }}
                  onError={(e) => {
                    console.error("Video load error:", e);
                    if (loadingTimers.current[index]) {
                      clearTimeout(loadingTimers.current[index]);
                    }
                    setLoadingStates(prev => ({ ...prev, [index]: false }));
                    setShowLoader(prev => ({ ...prev, [index]: false }));
                  }}
                  onPlay={() => setPlayingStates(prev => ({ ...prev, [index]: true }))}
                  onPause={() => setPlayingStates(prev => ({ ...prev, [index]: false }))}
                />

                {/* Loading overlay - only show after delay */}
                {showLoader[index] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[5]">
                    <BrandLoader text="Loading video..." size="lg" />
                  </div>
                )}

                <div 
                  className="absolute inset-0 cursor-pointer z-[2]"
                  onClick={(e) => handleVideoClick(e, index)}
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
            {!playingStates[index] && founder.videoUrl && !showLoader[index] && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none z-[3]">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-10 h-10 text-white ml-1" />
                </div>
              </div>
            )}
            
            {showLikeAnimation && index === currentIndex && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[4] animate-ping">
                <Heart className="w-24 h-24 text-red-500 fill-red-500" />
              </div>
            )}
          </div>

          {index === currentIndex && (
            <>
              {/* Founder info - bottom left with consistent safe area padding */}
              <div className="absolute bottom-0 left-4 right-20 z-10 pb-[5.5rem] md:pb-4" data-testid="founder-info-overlay">
                <div className="flex items-start gap-3 mb-2">
                  <Avatar className="h-10 w-10 border-2 border-white/50">
                    <AvatarImage src={founder.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {founder.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-display text-base font-semibold text-white">
                      {founder.name}
                    </h3>
                    <p className="text-white/80 text-sm">{founder.company}</p>
                  </div>
                </div>
                
                {founder.title && (
                  <div className="mb-2">
                    <p className="text-white text-sm line-clamp-2">{founder.title}</p>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs px-2 py-0.5">
                    {founder.sector}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs px-2 py-0.5">
                    {founder.stage}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs px-2 py-0.5">
                    {founder.location}
                  </Badge>
                </div>
              </div>

              {/* Action buttons - bottom right with consistent safe area padding */}
              <div className="absolute right-3 bottom-0 z-10 flex flex-col gap-4 pb-[5.5rem] md:pb-4" data-testid="action-buttons">
                <div className="flex flex-col items-center">
                  <Button
                    size="icon"
                    variant="ghost"
                    className={`h-12 w-12 rounded-full backdrop-blur-sm border-0 transition-colors duration-200 ${
                      likedVideos[founder.videoId]
                        ? 'bg-red-500/90 text-white hover:bg-red-600'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLikeToggle(founder.videoId);
                    }}
                    data-testid="button-interested"
                  >
                    <Heart 
                      className={`h-6 w-6 transition-all duration-200 ${likedVideos[founder.videoId] ? 'fill-white' : ''}`} 
                    />
                  </Button>
                  <span className="text-white text-xs mt-0.5 font-medium">
                    {formatCount(likeCounts[founder.videoId] || 0)}
                  </span>
                </div>
                
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm text-white border-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction("maybe");
                  }}
                  data-testid="button-maybe"
                >
                  <Bookmark className="h-6 w-6" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm text-white border-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction("pass");
                  }}
                  data-testid="button-pass"
                >
                  <X className="h-6 w-6" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm text-white border-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onInfo?.(founder.id);
                  }}
                  data-testid="button-info"
                >
                  <Info className="h-6 w-6" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm text-white/70 border-0 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReport?.(founder.id, founder.videoId);
                  }}
                  data-testid="button-report"
                >
                  <Flag className="h-5 w-5" />
                </Button>
              </div>

              {/* Mute button - top right */}
              <div className="absolute top-4 right-3 z-10">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm text-white border-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  data-testid="button-mute"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
              </div>
            </>
          )}
        </div>
      ))}

      <AlertDialog open={showPassConfirm} onOpenChange={setShowPassConfirm}>
        <AlertDialogContent data-testid="pass-confirm-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Pass on this founder?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. You will no longer see {founders[currentIndex]?.company || "this founder"} in your feed.
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