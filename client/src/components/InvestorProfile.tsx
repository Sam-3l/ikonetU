import { MapPin, Building2, Edit2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface InvestorProfileProps {
  name: string;
  avatar?: string;
  firm: string;
  role: string;
  location: string;
  thesis: string;
  sectors: string[];
  stages: string[];
  supportTypes: string[];
  onEditProfile?: () => void;
  onEditPreferences?: () => void;
}

export default function InvestorProfile({
  name,
  avatar,
  firm,
  role,
  location,
  thesis,
  sectors,
  stages,
  supportTypes,
  onEditProfile,
  onEditPreferences,
}: InvestorProfileProps) {
  return (
    <Card className="overflow-visible" data-testid="investor-profile">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-24 w-24 border-4 border-primary/10">
              <AvatarImage src={avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                {name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-display text-2xl font-bold mb-1">{name}</h2>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Building2 className="h-4 w-4" />
                <span>{role} at {firm}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
              </div>
            </div>
          </div>
          <Button size="icon" variant="ghost" onClick={onEditProfile} data-testid="button-edit-investor-profile">
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-2">Investment Thesis</h3>
          <p className="text-muted-foreground line-clamp-3">{thesis}</p>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Sectors</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onEditPreferences}
                className="h-7 text-xs"
              >
                Edit
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {sectors.map((sector) => (
                <Badge key={sector} variant="secondary">
                  {sector}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Stages</h3>
            <div className="flex flex-wrap gap-2">
              {stages.map((stage) => (
                <Badge key={stage} variant="outline">
                  {stage}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Support Types</h3>
            <div className="flex flex-wrap gap-2">
              {supportTypes.map((type) => (
                <Badge key={type} variant="outline">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
