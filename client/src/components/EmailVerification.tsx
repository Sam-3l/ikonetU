import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/apiClient";

interface EmailVerificationProps {
  email: string;
  onVerified: () => void;
  onCancel?: () => void;
}

export default function EmailVerification({ email, onVerified, onCancel }: EmailVerificationProps) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/auth/verify-email", {
        email,
        otp_code: otp,
      });

      setSuccess(true);
      setTimeout(() => {
        onVerified();
      }, 1500);
    } catch (err: any) {
      const errorData = err.response?.data;
      setError(errorData?.error || "Verification failed");
      
      if (errorData?.remaining_attempts !== undefined) {
        setRemainingAttempts(errorData.remaining_attempts);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setOtp("");

    try {
      await api.post("/api/auth/send-verification-email", { email });
      setCountdown(60); // 60 second cooldown
      setRemainingAttempts(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg">Email Verified!</h3>
            <p className="text-muted-foreground">Redirecting you to login...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-center">Verify Your Email</CardTitle>
        <CardDescription className="text-center">
          We sent a 6-digit code to<br />
          <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Verification Code</Label>
          <Input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setOtp(value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && otp.length === 6) {
                handleVerify();
              }
            }}
            className="text-center text-2xl tracking-widest font-mono"
            autoFocus
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {error}
              {remainingAttempts !== null && (
                <span className="block mt-1">
                  {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleVerify}
          disabled={loading || otp.length !== 6}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Email"
          )}
        </Button>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Didn't receive the code?
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResend}
            disabled={resending || countdown > 0}
          >
            {resending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : countdown > 0 ? (
              `Resend in ${countdown}s`
            ) : (
              "Resend Code"
            )}
          </Button>
        </div>

        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full"
          >
            Cancel
          </Button>
        )}

        <p className="text-xs text-center text-muted-foreground">
          Code expires in 15 minutes
        </p>
      </CardContent>
    </Card>
  );
}