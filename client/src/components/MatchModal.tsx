import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat: () => void;
  founder: {
    name: string;
    avatar?: string;
    company: string;
  };
  investor: {
    name: string;
    avatar?: string;
    firm: string;
  };
}

export default function MatchModal({
  isOpen,
  onClose,
  onStartChat,
  founder,
  investor,
}: MatchModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-md border-0 bg-gradient-to-br from-primary/10 via-background to-primary/5"
        data-testid="match-modal"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>It's a Match!</DialogTitle>
        </DialogHeader>

        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground"
          data-testid="button-close-match"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center py-8 px-4">
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <Sparkles
                  key={i}
                  className="absolute text-primary animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    opacity: 0.6,
                  }}
                />
              ))}
            </div>
          )}

          <h2 className="font-display text-3xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            It's a Match!
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            You and {founder.name} have shown mutual interest
          </p>

          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex flex-col items-center">
              <Avatar className="h-20 w-20 border-4 border-primary/20">
                <AvatarImage src={investor.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {investor.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <p className="mt-2 font-medium text-sm">{investor.name}</p>
              <p className="text-xs text-muted-foreground">{investor.firm}</p>
            </div>

            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>

            <div className="flex flex-col items-center">
              <Avatar className="h-20 w-20 border-4 border-primary/20">
                <AvatarImage src={founder.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {founder.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <p className="mt-2 font-medium text-sm">{founder.name}</p>
              <p className="text-xs text-muted-foreground">{founder.company}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button
              className="w-full"
              size="lg"
              onClick={onStartChat}
              data-testid="button-start-chat"
            >
              Go To Match
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={onClose}
              data-testid="button-keep-browsing"
            >
              Keep Browsing
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
