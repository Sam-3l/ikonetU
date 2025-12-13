import { MapPin, Building2, Eye, Users, MessageCircle, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FounderProfileProps {
  name: string;
  avatar?: string;
  company: string;
  location: string;
  bio: string;
  sector: string;
  stage: string;
  stats: {
    views: number;
    matches: number;
    responseRate: number;
  };
  onEditProfile?: () => void;
  onEditVideo?: () => void;
}

export default function FounderProfile({
  name,
  avatar,
  company,
  location,
  bio,
  sector,
  stage,
  stats,
  onEditProfile,
  onEditVideo,
}: FounderProfileProps) {
  return (
    <div className="space-y-6" data-testid="founder-profile">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1 overflow-visible">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <Avatar className="h-20 w-20 border-4 border-primary/10">
                <AvatarImage src={avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="font-display text-2xl font-bold mb-1">{name}</h2>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Building2 className="h-4 w-4" />
                  <span>{company}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{location}</span>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground mb-4 line-clamp-3">{bio}</p>

            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="secondary">{sector}</Badge>
              <Badge variant="outline">{stage}</Badge>
            </div>

            <div className="flex gap-3">
              <Button onClick={onEditProfile} className="flex-1" data-testid="button-edit-profile">
                Edit Profile
              </Button>
              <Button variant="outline" onClick={onEditVideo} data-testid="button-edit-video">
                Update Pitch
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:w-64 overflow-visible">
          <CardContent className="p-6">
            <h3 className="font-medium mb-4">Your Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">Views</span>
                </div>
                <span className="font-display font-semibold">{stats.views.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Matches</span>
                </div>
                <span className="font-display font-semibold">{stats.matches}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Response Rate</span>
                </div>
                <span className="font-display font-semibold">{stats.responseRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
