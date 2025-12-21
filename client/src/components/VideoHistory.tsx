import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Trash2, CheckCircle2, Clock, XCircle, Maximize2, Minimize2, Volume2, VolumeX } from "lucide-react";
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

interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string;
  duration: number;
  status: "processing" | "active" | "rejected" | "archived" | "deleted";
  is_current: boolean;
  view_count: number;
  created_at: string;
}

export default function VideoHistory() {
  const { toast } = useToast();
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);

  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos/history/"],
  });

  const setCurrentMutation = useMutation({
    mutationFn: async (videoId: string) => {
      const res = await apiRequest("POST", `/api/videos/${videoId}/set-current/`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos/history/"] });
      queryClient.invalidateQueries({ queryKey: ["/api/videos/my/"] });
      toast({ title: "Video set as current!", description: "It will be reviewed again." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (videoId: string) => {
      const res = await apiRequest("DELETE", `/api/videos/${videoId}/delete/`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos/history/"] });
      toast({ title: "Video deleted" });
      setVideoToDelete(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setVideoToDelete(null);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentVideo = videos?.find(v => v.is_current);
  const historyVideos = videos?.filter(v => !v.is_current);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" /> Active</Badge>;
      case "processing":
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" /> Processing</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      case "archived":
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const VideoCard = ({ video, isCurrent = false }: { video: Video; isCurrent?: boolean }) => {
    const isExpanded = expandedVideo === video.id;
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showControls, setShowControls] = useState(true);
    const [isHovering, setIsHovering] = useState(false);
    const hideControlsTimeout = useRef<NodeJS.Timeout>();

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const handleTimeUpdate = () => setCurrentTime(video.currentTime);
      const handleLoadedMetadata = () => setDuration(video.duration);
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => setIsPlaying(false);

      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);
      video.addEventListener("ended", handleEnded);

      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
        video.removeEventListener("ended", handleEnded);
      };
    }, []);

    const togglePlay = () => {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
      }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      if (videoRef.current) {
        videoRef.current.currentTime = percent * duration;
      }
    };

    const toggleMute = () => {
      if (videoRef.current) {
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
      }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      if (videoRef.current) {
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
      }
    };

    const handlePlaybackRateChange = (rate: number) => {
      if (videoRef.current) {
        videoRef.current.playbackRate = rate;
        setPlaybackRate(rate);
      }
    };

    const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
        videoRef.current?.parentElement?.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    };

    const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const handleMouseMove = () => {
      setShowControls(true);
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
      hideControlsTimeout.current = setTimeout(() => {
        if (isPlaying && !isHovering) {
          setShowControls(false);
        }
      }, 3000);
    };

    return (
      <Card className={`overflow-hidden ${isExpanded ? 'col-span-full' : ''}`}>
        <CardContent className="p-0">
          {/* Custom Video Player */}
          <div 
            className={`relative bg-black ${isExpanded ? 'aspect-video' : 'aspect-video'} group cursor-pointer`}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <video
              ref={videoRef}
              src={video.url}
              poster={video.thumbnail_url || undefined}
              className="w-full h-full"
              preload="metadata"
              onClick={togglePlay}
            />

            {/* Center Play/Pause Button */}
            <div 
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${
                showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <button 
                className="pointer-events-auto w-20 h-20 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center transition-all hover:scale-110 backdrop-blur-sm"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="h-10 w-10 text-white" fill="white" />
                ) : (
                  <Play className="h-10 w-10 text-white ml-1" fill="white" />
                )}
              </button>
            </div>

            {/* Custom Controls Bar */}
            <div 
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Progress Bar */}
              <div 
                className="w-full h-1.5 bg-white/20 cursor-pointer group/progress hover:h-2 transition-all"
                onClick={handleProgressClick}
              >
                <div 
                  className="h-full bg-blue-500 relative"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between px-4 py-3 text-white">
                <div className="flex items-center gap-4">
                  {/* Play/Pause */}
                  <button 
                    onClick={togglePlay}
                    className="hover:scale-110 transition-transform"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" fill="white" />
                    ) : (
                      <Play className="h-5 w-5" fill="white" />
                    )}
                  </button>

                  {/* Volume */}
                  <div className="flex items-center gap-2 group/volume">
                    <button 
                      onClick={toggleMute}
                      className="hover:scale-110 transition-transform"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="h-5 w-5" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-0 group-hover/volume:w-20 transition-all opacity-0 group-hover/volume:opacity-100"
                    />
                  </div>

                  {/* Time */}
                  <span className="text-sm font-medium">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Playback Speed */}
                  <div className="relative group/speed">
                    <button className="text-sm font-medium hover:bg-white/10 px-2 py-1 rounded transition-colors">
                      {playbackRate}x
                    </button>
                    <div className="absolute bottom-full right-0 mb-2 bg-black/95 rounded-lg p-2 opacity-0 group-hover/speed:opacity-100 pointer-events-none group-hover/speed:pointer-events-auto transition-opacity">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => handlePlaybackRateChange(rate)}
                          className={`block w-full text-left px-3 py-1.5 text-sm hover:bg-white/10 rounded transition-colors whitespace-nowrap ${
                            playbackRate === rate ? 'text-blue-400' : ''
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fullscreen */}
                  <button 
                    onClick={toggleFullscreen}
                    className="hover:scale-110 transition-transform"
                  >
                    <Maximize2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Expand/Collapse Toggle */}
            <button
              onClick={() => setExpandedVideo(isExpanded ? null : video.id)}
              className={`absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>

          {/* Video Info */}
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base mb-1 truncate">{video.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {video.view_count} views • {video.duration}s • {new Date(video.created_at).toLocaleDateString()}
                </p>
              </div>
              {getStatusBadge(video.status)}
            </div>

            {/* Status Messages */}
            {video.status === "rejected" && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  This video was rejected. Upload a new one or select from history.
                </p>
              </div>
            )}

            {video.status === "processing" && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-500">
                  Under review. Usually takes 24-48 hours.
                </p>
              </div>
            )}

            {/* Actions for History Videos */}
            {!isCurrent && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCurrentMutation.mutate(video.id)}
                  disabled={setCurrentMutation.isPending}
                >
                  Set as Current
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setVideoToDelete(video.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* Current Video */}
      {currentVideo && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Current Pitch Video</h2>
          <div className={`${expandedVideo === currentVideo.id ? 'max-w-full' : 'max-w-4xl'}`}>
            <VideoCard video={currentVideo} isCurrent />
          </div>
        </div>
      )}

      {/* Video History */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Video History ({historyVideos?.length || 0})</h2>
        {!historyVideos || historyVideos.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Play className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No archived videos yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {historyVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!videoToDelete} onOpenChange={() => setVideoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video?</AlertDialogTitle>
            <AlertDialogDescription>
              This video will be permanently removed from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => videoToDelete && deleteMutation.mutate(videoToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}