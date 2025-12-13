import { useState } from "react";
import { Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LegalAcceptanceProps {
  onAccept: () => void;
  isAccepted?: boolean;
}

export default function LegalAcceptance({ onAccept, isAccepted = false }: LegalAcceptanceProps) {
  const [accepted, setAccepted] = useState(isAccepted);
  const [termsOpen, setTermsOpen] = useState(false);

  const handleAcceptChange = (checked: boolean) => {
    setAccepted(checked);
    if (checked) {
      onAccept();
    }
  };

  return (
    <div className="space-y-4" data-testid="legal-acceptance">
      <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/30">
        <Checkbox
          id="terms"
          checked={accepted}
          onCheckedChange={handleAcceptChange}
          className="mt-0.5"
          data-testid="checkbox-terms"
        />
        <div className="flex-1">
          <label htmlFor="terms" className="text-sm cursor-pointer">
            I have read and agree to the{" "}
            <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="text-primary font-medium inline-flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                  data-testid="button-view-terms"
                >
                  Platform NDA & Information-Use Terms
                  <ExternalLink className="h-3 w-3" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Platform NDA & Information-Use Terms</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[60vh] pr-4">
                  <div className="prose prose-sm dark:prose-invert">
                    <h3>Non-Disclosure Agreement</h3>
                    <p>
                      By accessing founder pitch videos and related materials on ikonetU,
                      you agree to maintain the confidentiality of all information disclosed.
                    </p>
                    
                    <h4>1. Confidential Information</h4>
                    <p>
                      "Confidential Information" includes, but is not limited to, business plans,
                      financial projections, product roadmaps, technical specifications, customer
                      data, and any other proprietary information shared through video pitches
                      or subsequent communications.
                    </p>
                    
                    <h4>2. Obligations</h4>
                    <p>You agree to:</p>
                    <ul>
                      <li>Keep all Confidential Information strictly confidential</li>
                      <li>Not disclose any information to third parties without written consent</li>
                      <li>Use the information solely for evaluating investment opportunities</li>
                      <li>Not reproduce, copy, or download video content</li>
                    </ul>
                    
                    <h4>3. Duration</h4>
                    <p>
                      These obligations shall remain in effect for a period of two (2) years
                      from the date of disclosure.
                    </p>
                    
                    <h4>4. Information Use</h4>
                    <p>
                      We collect and process your viewing data, engagement metrics, and
                      preferences to improve matching algorithms and platform experience.
                      Your personal information is handled in accordance with our Privacy Policy.
                    </p>
                    
                    <h4>5. Investor Conduct</h4>
                    <p>You agree to:</p>
                    <ul>
                      <li>Engage professionally with all founders</li>
                      <li>Provide timely responses to matched founders</li>
                      <li>Not solicit founders for purposes other than investment</li>
                      <li>Report any content that violates platform guidelines</li>
                    </ul>
                  </div>
                </ScrollArea>
                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={() => setTermsOpen(false)}>Close</Button>
                </div>
              </DialogContent>
            </Dialog>
          </label>
          <p className="text-xs text-muted-foreground mt-1">
            Required to view founder pitches and connect with startups
          </p>
        </div>
        {accepted && (
          <div className="h-6 w-6 rounded-full bg-status-online/20 flex items-center justify-center">
            <Check className="h-4 w-4 text-status-online" />
          </div>
        )}
      </div>
    </div>
  );
}
