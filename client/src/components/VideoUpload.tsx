import { useState } from "react";
import { Video, Link, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VideoUploadProps {
  maxDuration?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function VideoUpload({
  maxDuration = 60,
  onSuccess,
  onCancel,
}: VideoUploadProps) {
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [title, setTitle] = useState("");
  const { toast } = useToast();

  const createVideoMutation = useMutation({
    mutationFn: async (data: { url: string; thumbnailUrl?: string; title?: string; duration?: number }) => {
      const res = await apiRequest("POST", "/api/videos", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Video submitted!", description: "Your pitch video has been submitted for review." });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!videoUrl.trim()) {
      toast({ title: "Video URL required", description: "Please enter a valid video URL", variant: "destructive" });
      return;
    }

    createVideoMutation.mutate({
      url: videoUrl.trim(),
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      title: title.trim() || "My Pitch Video",
      duration: maxDuration,
    });
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6" data-testid="video-upload">
      <Card className="overflow-visible">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Video className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Upload Your Pitch Video</h3>
              <p className="text-sm text-muted-foreground">Maximum {maxDuration} seconds</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Video Title</Label>
            <Input
              id="title"
              placeholder="e.g., TechStartup - 60 Second Pitch"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="input-video-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL *</Label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="videoUrl"
                className="pl-10"
                placeholder="https://youtube.com/watch?v=... or direct video link"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                data-testid="input-video-url"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Paste a link to your video from YouTube, Vimeo, or any direct video URL (MP4, WebM)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnailUrl">Thumbnail URL (optional)</Label>
            <Input
              id="thumbnailUrl"
              placeholder="https://example.com/thumbnail.jpg"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              data-testid="input-thumbnail-url"
            />
          </div>

          {videoUrl && isValidUrl(videoUrl) && (
            <div className="p-3 rounded-lg bg-muted flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-status-online/20 flex items-center justify-center">
                <Check className="h-4 w-4 text-status-online" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Video URL ready</p>
                <p className="text-xs text-muted-foreground truncate">{videoUrl}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="flex-1" data-testid="button-cancel-upload">
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={!videoUrl.trim() || !isValidUrl(videoUrl) || createVideoMutation.isPending}
          className="flex-1"
          data-testid="button-submit-video"
        >
          {createVideoMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Video"
          )}
        </Button>
      </div>
    </div>
  );
}
