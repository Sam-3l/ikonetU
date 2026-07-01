import { useState, useRef, useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import { Video, Upload, Camera, Loader2, X, Play, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/config/api";
import { fixWebmDuration } from '@fix-webm-duration/fix';

interface VideoUploadProps {
  maxDuration?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function UploadProgressOverlay({
  progress,
  stage,
}: {
  progress: number;
  stage: "trimming" | "uploading" | "finalizing" | null;
}) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, progress));
  const offset = circumference - (clamped / 100) * circumference;

  const stageLabel =
    stage === "trimming"
      ? "Trimming video"
      : stage === "uploading"
      ? "Uploading video"
      : stage === "finalizing"
      ? "Almost there"
      : "Preparing";

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm">
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* soft pulsing glow behind the ring */}
        <div className="absolute inset-0 rounded-full bg-primary/30 blur-xl animate-pulse" />

        <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
          <defs>
            <linearGradient id="upload-progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="url(#upload-progress-gradient)"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={stage === "finalizing" ? 0 : offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.2s ease-out" }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          {stage === "finalizing" ? (
            <Check className="w-9 h-9 text-white" />
          ) : (
            <span className="text-2xl font-bold text-white tabular-nums">
              {clamped}%
            </span>
          )}
        </div>
      </div>

      <p className="mt-4 text-sm font-medium text-white">{stageLabel}</p>
      <p className="mt-1 text-xs text-white/60">
        {stage === "uploading"
          ? "Please keep this tab open"
          : stage === "trimming"
          ? "Processing your clip on-device"
          : "Wrapping up..."}
      </p>
    </div>
  );
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<"trimming" | "uploading" | "finalizing" | null>(null);
  
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

  useEffect(() => {
    if (step === "recording") {
      document.body.classList.add("recording-fullscreen");
      if (window.innerHeight < window.outerHeight) {
        window.scrollTo(0, 1);
      }
    } else {
      document.body.classList.remove("recording-fullscreen");
    }

    return () => {
      document.body.classList.remove("recording-fullscreen");
    };
  }, [step]);

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
      const duration = video.duration;
      if (!isFinite(duration) || isNaN(duration)) {
        toast({
          title: "Invalid video",
          description: "Could not read video duration. Please try another file.",
          variant: "destructive"
        });
        URL.revokeObjectURL(url);
        return;
      }
      
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
      
      setTimeout(() => {
        if (cameraVideoRef.current && streamRef.current) {
          cameraVideoRef.current.srcObject = streamRef.current;
          cameraVideoRef.current.play().catch(err => {
            console.error("Error playing video:", err);
          });
        }
      }, 100);

    } catch (err: any) {
      console.error("Camera error:", err);
      
      let errorMessage = "Please allow camera access to record video";
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = "Camera access denied. Please enable camera permissions in your browser settings.";
      } else if (err.name === 'NotFoundError') {
        errorMessage = "No camera found on this device.";
      } else if (err.name === 'NotReadableError') {
        errorMessage = "Camera is being used by another application.";
      }
      
      toast({
        title: "Camera access failed",
        description: errorMessage,
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
          const duration = video.duration;
          if (!isFinite(duration) || isNaN(duration)) {
            toast({
              title: "Invalid recording",
              description: "Could not read video duration. Please try recording again.",
              variant: "destructive"
            });
            return;
          }
          
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
    setUploadProgress(0);
    setUploadStage(null);
  
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error("Please log in to upload videos");
      }

      let fileToUpload = videoFile;
      
      const needsTrimming = trimStart > 0.1 || Math.abs(trimEnd - videoDuration) > 0.1;
      
      if (needsTrimming) {
        setUploadStage("trimming");
        try {
          fileToUpload = await trimVideoClientSide(videoFile, trimStart, trimEnd, (pct) => {
            setUploadProgress(pct);
          });
        } catch (error) {
          console.error("Trimming error:", error);
          throw new Error("Failed to trim video. Please try again.");
        }
      }

      const formData = new FormData();
      formData.append("video_file", fileToUpload);
      formData.append("title", title || "My Pitch Video");
      formData.append("duration", trimmedDuration.toFixed(2));

      setUploadStage("uploading");
      setUploadProgress(0);

      try {
        await uploadWithProgress(`${API_BASE_URL}/api/videos/`, formData, token, (pct) => {
          setUploadProgress(pct);
        });
      } catch (err: any) {
        if (err.status === 401) {
          localStorage.removeItem('auth_token');
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(err.message || "Upload failed");
      }

      setUploadStage("finalizing");
  
      queryClient.invalidateQueries({ queryKey: ["/api/videos/history/"] });
      queryClient.invalidateQueries({ queryKey: ["/api/videos/my/"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
  
      toast({
        title: "Video submitted!",
        description: "Your pitch video is being processed."
      });
      
      cleanup();
      
      setTimeout(() => {
        onSuccess?.();
      }, 100);
      
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      
      setIsUploading(false);
      setUploadStage(null);
      setUploadProgress(0);
    }
  };

  const uploadWithProgress = (
    url: string,
    formData: FormData,
    token: string,
    onProgress: (pct: number) => void
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress(100);
          let data = null;
          try {
            data = JSON.parse(xhr.responseText);
          } catch {
            // non-JSON response is fine, treat as success anyway
          }
          resolve(data);
        } else {
          let errorMessage = "Upload failed";
          try {
            const error = JSON.parse(xhr.responseText);
            errorMessage = error.message || error.detail || JSON.stringify(error);
          } catch {
            errorMessage = xhr.responseText || `Server error: ${xhr.status}`;
          }
          reject({ status: xhr.status, message: errorMessage });
        }
      };

      xhr.onerror = () => reject({ status: 0, message: "Network error during upload" });
      xhr.onabort = () => reject({ status: 0, message: "Upload cancelled" });

      xhr.send(formData);
    });
  };

  const trimVideoClientSide = async (
    file: File,
    startTime: number,
    endTime: number,
    onProgress?: (pct: number) => void
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      const videoElement = document.createElement('video');
      const audioElement = document.createElement('video');
      
      videoElement.preload = 'auto';
      audioElement.preload = 'auto';
      
      const fileURL = URL.createObjectURL(file);
      videoElement.src = fileURL;
      audioElement.src = fileURL;
      
      videoElement.muted = true;
      audioElement.muted = false;

      let canvas: HTMLCanvasElement;
      let ctx: CanvasRenderingContext2D;
      let recorder: MediaRecorder;
      const chunks: Blob[] = [];
      const duration = endTime - startTime;
      let recordingStartTime = 0;

      videoElement.onloadedmetadata = async () => {
        try {
          canvas = document.createElement('canvas');
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;
          ctx = canvas.getContext('2d')!;

          if (!ctx) {
            throw new Error('Could not get canvas context');
          }

          const videoStream = canvas.captureStream(30);
          let combinedStream = new MediaStream(videoStream.getVideoTracks());

          try {
            // @ts-ignore
            if (audioElement.captureStream) {
              // @ts-ignore
              const audioStream = audioElement.captureStream();
              const audioTracks = audioStream.getAudioTracks();
              if (audioTracks.length > 0) {
                combinedStream.addTrack(audioTracks[0]);
              }
            }
          } catch (e) {
            console.warn('Audio not available');
          }

          let mimeType = 'video/webm;codecs=vp8,opus';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm;codecs=vp8';
          }
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm';
          }

          recorder = new MediaRecorder(combinedStream, {
            mimeType,
            videoBitsPerSecond: 2500000
          });

          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunks.push(e.data);
            }
          };

          recorder.onstop = async () => {
            try {
              const recordingDurationMs = Date.now() - recordingStartTime;
              
              await new Promise(resolve => setTimeout(resolve, 200));
              
              let blob = new Blob(chunks, { type: mimeType });
              
              // Fix duration metadata
              try {
                blob = await fixWebmDuration(blob, recordingDurationMs, { logger: false });
              } catch (err) {
                console.warn('Could not fix duration:', err);
              }
              
              const trimmedFile = new File(
                [blob],
                `trimmed-${Date.now()}.webm`,
                { type: mimeType }
              );
              
              URL.revokeObjectURL(fileURL);
              combinedStream.getTracks().forEach(track => track.stop());
              
              resolve(trimmedFile);
            } catch (error) {
              reject(error);
            }
          };

          recorder.onerror = () => {
            reject(new Error('Recording failed'));
          };

          videoElement.currentTime = startTime;
          audioElement.currentTime = startTime;

          await new Promise(res => {
            videoElement.onseeked = res;
          });

          recordingStartTime = Date.now();
          recorder.start(100);
          videoElement.play();
          audioElement.play();

          const captureFrame = () => {
            if (videoElement.currentTime >= endTime || videoElement.ended) {
              videoElement.pause();
              audioElement.pause();
              onProgress?.(100);
              setTimeout(() => recorder.stop(), 100);
              return;
            }
            const pct = Math.min(
              100,
              Math.round(((videoElement.currentTime - startTime) / duration) * 100)
            );
            onProgress?.(pct);
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            requestAnimationFrame(captureFrame);
          };

          captureFrame();

        } catch (error) {
          URL.revokeObjectURL(fileURL);
          reject(error);
        }
      };

      videoElement.onerror = () => {
        URL.revokeObjectURL(fileURL);
        reject(new Error('Failed to load video'));
      };
    });
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

  const recordingProgress = (recordingTime / maxDuration) * 100;
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (recordingProgress / 100) * circumference;

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
                    accept="video/mp4,video/quicktime,video/webm,video/*"
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

  if (step === "recording") {
    return (
      <div className="fixed inset-0 bg-black" style={{ zIndex: 9999 }}>
        <video
          ref={cameraVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
        
        {isRecording && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full flex items-center gap-2 font-mono" style={{ zIndex: 10000 }}>
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
          </div>
        )}

        <button
          onClick={() => {
            if (isRecording) {
              stopRecording();
            } else {
              cleanup();
              setStep("select");
            }
          }}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
          style={{ zIndex: 10000 }}
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center items-center" style={{ zIndex: 10000, paddingBottom: '6rem' }}>
          {!isRecording ? (
            <button
              onClick={beginRecording}
              className="relative group"
            >
              <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-red-500 group-hover:scale-95 transition-transform" />
              </div>
            </button>
          ) : (
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
                disabled={isUploading}
                className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors"
              >
                {!isPlaying && !isUploading && (
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="w-8 h-8 text-black ml-1" />
                  </div>
                )}
              </button>

              {isUploading && (
                <UploadProgressOverlay
                  progress={uploadProgress}
                  stage={uploadStage}
                />
              )}
            </div>

            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Trim Video</span>
                <span className="text-muted-foreground">
                  {trimStart.toFixed(1)}s - {trimEnd.toFixed(1)}s
                </span>
              </div>

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

              <div className="relative h-12 bg-background rounded overflow-hidden mt-4">
                <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                  Selected: {trimmedDuration.toFixed(1)}s
                </div>

                <div 
                  className="absolute top-0 bottom-0 bg-primary/30 border-x-2 border-primary"
                  style={{
                    left: videoDuration > 0 ? `${(trimStart / videoDuration) * 100}%` : '0%',
                    right: videoDuration > 0 ? `${100 - (trimEnd / videoDuration) * 100}%` : '0%'
                  }}
                />

                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white z-10"
                  style={{
                    left: videoDuration > 0 ? `${(currentTime / videoDuration) * 100}%` : '0%'
                  }}
                />
              </div>

              {!isValidDuration && (
                <p className="text-sm text-destructive">
                  ⚠️ Please trim video to {maxDuration} seconds or less
                </p>
              )}
            </div>

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
                {uploadStage === "trimming" && `Trimming... ${uploadProgress}%`}
                {uploadStage === "uploading" && `Uploading... ${uploadProgress}%`}
                {uploadStage === "finalizing" && "Finalizing..."}
                {!uploadStage && "Processing..."}
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
