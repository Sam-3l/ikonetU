import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  videoId?: string;
  userId?: string;
  targetName?: string;
}

export default function ReportDialog({
  isOpen,
  onClose,
  videoId,
  userId,
  targetName,
}: ReportDialogProps) {
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  const reportMutation = useMutation({
    mutationFn: async () => {
      const data: any = { reason, details };
      if (videoId) data.video = videoId;
      if (userId) data.reported_user = userId;

      const res = await apiRequest("POST", "/api/reports/", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Report submitted", 
        description: "Thank you for helping keep our community safe." 
      });
      handleClose();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to submit report", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const handleClose = () => {
    setReason("");
    setDetails("");
    onClose();
  };

  const handleSubmit = () => {
    if (!reason) {
      toast({ 
        title: "Please select a reason", 
        variant: "destructive" 
      });
      return;
    }
    reportMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Report {videoId ? "Video" : "User"}
          </DialogTitle>
          <DialogDescription>
            {targetName && `Report ${targetName}. `}
            Please provide details about why you're reporting this content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                <SelectItem value="spam">Spam or Misleading</SelectItem>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="copyright">Copyright Violation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Additional Details (Optional)</Label>
            <Textarea
              placeholder="Provide more context about this report..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {details.length}/500
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={reportMutation.isPending}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleSubmit}
            disabled={reportMutation.isPending || !reason}
          >
            {reportMutation.isPending ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}