import { useState, useRef, useEffect } from "react";
import { Video, Upload, Camera, Loader2, X, Play, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [uploadMethod, setUploadMethod] = useState<"camera" | "file">("file");
  const [step, setStep] = useState<"select" | "recording" | "trim">("select");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoURL, setVideoURL] = useState<string>("");
  const [title, setTitle] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(60);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoStopTriggeredRef = useRef(false);

  const cleanup = () => {
    if (videoURL) URL.revokeObjectURL(videoURL);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return cleanup;
  }, []);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid file",
        description: "Please select a video file",
        variant: "destructive"
      });
      return;
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > 100) {
      toast({
        title: "File too large",
        description: "Maximum file size is 100MB",
        variant: "destructive"
      });
      return;
    }

    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    
    video.onloadedmetadata = () => {
      const duration = Math.floor(video.duration);
      setVideoDuration(duration);
      setTrimStart(0);
      setTrimEnd(Math.min(duration, maxDuration));
      setVideoFile(file);
      setVideoURL(url);
      setStep("trim");
    };
    
    video.src = url;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true 
      });
      
      streamRef.current = stream;
      setStep("recording");
      setRecordingTime(0);
      autoStopTriggeredRef.current = false;
      
      // Wait a bit for the component to render
      setTimeout(() => {
        if (cameraVideoRef.current && streamRef.current) {
          cameraVideoRef.current.srcObject = streamRef.current;
          cameraVideoRef.current.play().catch(err => {
            console.error("Error playing video:", err);
          });
        }
      }, 100);

    } catch (err) {
      console.error("Camera error:", err);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to record video",
        variant: "destructive"
      });
    }
  };

  const beginRecording = () => {
    if (!streamRef.current) return;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const file = new File([blob], `pitch-${Date.now()}.webm`, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        const video = document.createElement("video");
        video.preload = "metadata";
        
        video.onloadedmetadata = () => {
          const duration = Math.floor(video.duration);
          setVideoFile(file);
          setVideoURL(url);
          setVideoDuration(duration);
          setTrimStart(0);
          setTrimEnd(duration);
          setStep("trim");
        };
        
        video.src = url;
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration && !autoStopTriggeredRef.current) {
            autoStopTriggeredRef.current = true;
            stopRecording();
            return maxDuration;
          }
          return newTime;
        });
      }, 1000);
    } catch (err) {
      console.error("Recording error:", err);
      toast({
        title: "Recording failed",
        description: "Failed to start recording. Please try again.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoPreviewRef.current) {
      const time = videoPreviewRef.current.currentTime;
      setCurrentTime(time);
      
      if (time < trimStart) {
        videoPreviewRef.current.currentTime = trimStart;
      } else if (time > trimEnd) {
        videoPreviewRef.current.currentTime = trimStart;
        videoPreviewRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const togglePlayback = () => {
    if (videoPreviewRef.current) {
      if (isPlaying) {
        videoPreviewRef.current.pause();
      } else {
        if (currentTime >= trimEnd) {
          videoPreviewRef.current.currentTime = trimStart;
        }
        videoPreviewRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSubmit = async () => {
    if (!videoFile) return;

    const trimmedDuration = trimEnd - trimStart;
    if (trimmedDuration > maxDuration) {
      toast({
        title: "Video too long",
        description: `Please trim video to ${maxDuration} seconds or less`,
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("video_file", videoFile);
    formData.append("title", title || "My Pitch Video");
    formData.append("trim_start", trimStart.toString());
    formData.append("trim_end", trimEnd.toString());
    formData.append("duration", trimmedDuration.toString());

    try {
      const res = await fetch("/api/videos/", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Upload failed");
      }

      toast({
        title: "Video submitted!",
        description: "Your pitch video is being processed."
      });
      cleanup();
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    cleanup();
    setVideoFile(null);
    setVideoURL("");
    setTitle("");
    setStep("select");
    setRecordingTime(0);
    setVideoDuration(0);
    setTrimStart(0);
    setTrimEnd(60);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  // Recording Progress Circle
  const recordingProgress = (recordingTime / maxDuration) * 100;
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (recordingProgress / 100) * circumference;

  // SELECT/UPLOAD STEP
  if (step === "select") {
    return (
      <div className="space-y-6">
        <Card className="overflow-visible">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Upload Your Pitch</h3>
                <p className="text-sm text-muted-foreground">Maximum {maxDuration} seconds</p>
              </div>
            </div>

            <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as "camera" | "file")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="camera">
                  <Camera className="h-4 w-4 mr-2" />
                  Record Video
                </TabsTrigger>
                <TabsTrigger value="file">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </TabsTrigger>
              </TabsList>

              <TabsContent value="camera" className="space-y-4">
                <div className="flex flex-col items-center justify-center py-8 space-y-6">
                  <div className="text-center space-y-2">
                    <Camera className="w-16 h-16 mx-auto text-muted-foreground" />
                    <p className="font-medium">Use your camera</p>
                    <p className="text-sm text-muted-foreground">Record your pitch directly</p>
                  </div>
                  <Button onClick={startRecording} size="lg" className="w-full max-w-xs">
                    <Camera className="h-5 w-5 mr-2" />
                    Start Recording
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="file" className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                  }`}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files[0];
                    if (file) handleFileChange(file);
                  }}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                >
                  <Upload className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="font-medium text-lg mb-1">Drag and drop your video here</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    MP4, MOV, WebM • Maximum {maxDuration} seconds
                  </p>
                  <Button variant="outline" size="lg" onClick={() => fileInputRef.current?.click()}>
                    Browse Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileChange(file);
                    }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  // RECORDING STEP
  if (step === "recording") {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        {/* Camera Preview - Full Screen Behind Everything */}
        <video
          ref={cameraVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
        
        {/* Recording Timer - Only show when actually recording */}
        {isRecording && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full flex items-center gap-2 font-mono z-10">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={() => {
            if (isRecording) {
              stopRecording();
            } else {
              cleanup();
              setStep("select");
            }
          }}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors z-10"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Record Button - Bottom Center */}
        <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center items-center z-10">
          {!isRecording ? (
            // Preview mode - tap to start recording
            <button
              onClick={beginRecording}
              className="relative group"
            >
              <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-red-500 group-hover:scale-95 transition-transform" />
              </div>
            </button>
          ) : (
            // Recording mode - tap to stop
            <button
              onClick={stopRecording}
              className="relative group"
            >
              <svg className="w-20 h-20 -rotate-90 absolute inset-0">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="#ffffff"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-linear"
                  strokeLinecap="round"
                />
              </svg>
              <div className="relative w-20 h-20 rounded-full flex items-center justify-center">
                <div className="w-7 h-7 bg-red-500 rounded group-hover:scale-90 transition-transform" />
              </div>
            </button>
          )}
        </div>
      </div>
    );
  }

  // TRIM/PREVIEW STEP
  if (step === "trim") {
    const trimmedDuration = trimEnd - trimStart;
    const isValidDuration = trimmedDuration <= maxDuration;

    return (
      <div className="space-y-6">
        <Card className="overflow-visible">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Preview & Trim</h3>
                  <p className="text-sm text-muted-foreground">
                    Duration: {trimmedDuration.toFixed(1)}s {!isValidDuration && `(Max ${maxDuration}s)`}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={resetUpload}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Video Preview */}
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoPreviewRef}
                src={videoURL}
                className="w-full h-full object-contain"
                onTimeUpdate={handleVideoTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              <button
                onClick={togglePlayback}
                className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors"
              >
                {!isPlaying && (
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="w-8 h-8 text-black ml-1" />
                  </div>
                )}
              </button>
            </div>

            {/* Trim Controls */}
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Trim Video</span>
                <span className="text-muted-foreground">
                  {trimStart.toFixed(1)}s - {trimEnd.toFixed(1)}s
                </span>
              </div>

              {/* Simple Range Sliders for Trim */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">Start Time</Label>
                  <input
                    type="range"
                    min={0}
                    max={videoDuration}
                    step={0.1}
                    value={trimStart}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setTrimStart(Math.min(val, trimEnd - 0.5));
                      if (videoPreviewRef.current) {
                        videoPreviewRef.current.currentTime = val;
                      }
                    }}
                    className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">End Time</Label>
                  <input
                    type="range"
                    min={0}
                    max={videoDuration}
                    step={0.1}
                    value={trimEnd}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setTrimEnd(Math.max(val, trimStart + 0.5));
                      if (videoPreviewRef.current) {
                        videoPreviewRef.current.currentTime = val;
                      }
                    }}
                    className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
                  />
                </div>
              </div>

              {/* Visual Timeline */}
              <div className="relative h-12 bg-background rounded overflow-hidden mt-4">
                <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                  Selected: {trimmedDuration.toFixed(1)}s
                </div>

                <div 
                  className="absolute top-0 bottom-0 bg-primary/30 border-x-2 border-primary"
                  style={{
                    left: `${(trimStart / videoDuration) * 100}%`,
                    right: `${100 - (trimEnd / videoDuration) * 100}%`
                  }}
                />

                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white z-10"
                  style={{
                    left: `${(currentTime / videoDuration) * 100}%`
                  }}
                />
              </div>

              {!isValidDuration && (
                <p className="text-sm text-destructive">
                  ⚠️ Please trim video to {maxDuration} seconds or less
                </p>
              )}
            </div>

            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="title">Title or Caption (Optional)</Label>
              <Input
                id="title"
                placeholder="e.g., My 60-second startup pitch"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground text-right">
                {title.length}/100 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isUploading || !isValidDuration}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Submit Video
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}