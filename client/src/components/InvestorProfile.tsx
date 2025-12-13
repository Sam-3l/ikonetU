import { useState } from "react";
import { MapPin, Building2, Edit2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  onEditProfile?: (data: { firm_name: string; title: string; thesis: string; sectors: string[]; stages: string[]; support_types: string[] }) => void;
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
}: InvestorProfileProps) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firm_name: firm,
    title: role,
    thesis,
    sectors,
    stages,
    support_types: supportTypes,
  });

  const handleSave = () => {
    onEditProfile?.(formData);
    setEditMode(false);
  };

  if (editMode) {
    return (
      <Card className="overflow-visible">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-display text-xl font-semibold mb-4">Edit Profile</h3>
          
          <div className="space-y-2">
            <Label>Firm Name</Label>
            <Input 
              value={formData.firm_name} 
              onChange={(e) => setFormData({...formData, firm_name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Investment Thesis</Label>
            <Textarea 
              value={formData.thesis} 
              onChange={(e) => setFormData({...formData, thesis: e.target.value})}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1">Save Changes</Button>
            <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

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
          <Button size="icon" variant="ghost" onClick={() => setEditMode(true)} data-testid="button-edit-investor-profile">
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-2">Investment Thesis</h3>
          <p className="text-muted-foreground line-clamp-3">{thesis}</p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Sectors</h3>
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