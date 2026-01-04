import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Briefcase, User, Linkedin, Heart, FileText } from "lucide-react";

interface InvestorProfileViewProps {
  profileData: any;
  formData: any;
  setFormData: (data: any) => void;
  isEditing: boolean;
  stats: any;
  onSave: () => void;
  onCancel: () => void;
}

function InvestorProfileView({
  profileData,
  formData,
  setFormData,
  isEditing,
  stats,
  onSave,
  onCancel
}: InvestorProfileViewProps) {
  const sectors = ["Fintech", "Healthcare", "AI/ML", "SaaS", "E-commerce", "Climate Tech", "EdTech", "Web3", "Consumer", "Enterprise"];
  const stages = ["Pre-seed", "Seed", "Series A", "Series B", "Growth"];
  const supportOptions = ["Capital Only", "Advisory", "Hands-on", "Board Seat", "Strategic"];

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col items-center text-center">
              <Heart className="h-5 w-5 md:h-6 md:w-6 mb-2 text-primary" />
              <div className="text-xl md:text-2xl font-bold">{stats?.activeMatches || 0}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Total Matches</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col items-center text-center">
              <FileText className="h-5 w-5 md:h-6 md:w-6 mb-2 text-primary" />
              <div className="text-xl md:text-2xl font-bold">{stats?.interestedCount || 0}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Interested Founders</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Firm Name</Label>
                  <Input 
                    value={formData.firmName || ""} 
                    onChange={(e) => setFormData({ ...formData, firmName: e.target.value })} 
                    placeholder="Your firm or organization" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input 
                    value={formData.title || ""} 
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                    placeholder="Your role" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Investment Thesis ({(formData.thesis || "").length}/500) *</Label>
                <Textarea 
                  value={formData.thesis || ""} 
                  onChange={(e) => { 
                    if (e.target.value.length <= 500) 
                      setFormData({ ...formData, thesis: e.target.value }); 
                  }} 
                  placeholder="Describe your investment focus..." 
                  className="min-h-[120px]" 
                  maxLength={500} 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Investment Sectors *</Label>
                <div className="flex flex-wrap gap-2">
                  {sectors.map(s => (
                    <Badge 
                      key={s} 
                      variant={(formData.sectors || []).includes(s) ? "default" : "outline"} 
                      className="cursor-pointer" 
                      onClick={() => setFormData({ 
                        ...formData, 
                        sectors: toggleArrayItem(formData.sectors || [], s) 
                      })}
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Investment Stages *</Label>
                <div className="flex flex-wrap gap-2">
                  {stages.map(s => (
                    <Badge 
                      key={s} 
                      variant={(formData.stages || []).includes(s) ? "default" : "outline"} 
                      className="cursor-pointer" 
                      onClick={() => setFormData({ 
                        ...formData, 
                        stages: toggleArrayItem(formData.stages || [], s) 
                      })}
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Support Types *</Label>
                <div className="flex flex-wrap gap-2">
                  {supportOptions.map(s => (
                    <Badge 
                      key={s} 
                      variant={(formData.supportTypes || []).includes(s) ? "default" : "outline"} 
                      className="cursor-pointer" 
                      onClick={() => setFormData({ 
                        ...formData, 
                        supportTypes: toggleArrayItem(formData.supportTypes || [], s) 
                      })}
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Check Size</Label>
                  <Input 
                    value={formData.checkSize || ""} 
                    onChange={(e) => setFormData({ ...formData, checkSize: e.target.value })} 
                    placeholder="e.g. $100K - $500K" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn</Label>
                  <Input 
                    type="url" 
                    value={formData.linkedin || ""} 
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} 
                    placeholder="https://linkedin.com/in/yourprofile" 
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={onSave} className="flex-1">Save Changes</Button>
                <Button onClick={onCancel} variant="outline" className="flex-1">Cancel</Button>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>Firm</span>
                  </div>
                  <p className="font-medium">{profileData?.firmName || "Not set"}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Title</span>
                  </div>
                  <p className="font-medium">{profileData?.title || "Not set"}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Investment Thesis</div>
                <p className="text-sm">{profileData?.thesis || "No thesis provided"}</p>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Investment Sectors</div>
                <div className="flex flex-wrap gap-2">
                  {(profileData?.sectors || []).map((s: string) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                  {(!profileData?.sectors || profileData.sectors.length === 0) && (
                    <span className="text-sm text-muted-foreground">Not set</span>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Investment Stages</div>
                <div className="flex flex-wrap gap-2">
                  {(profileData?.stages || []).map((s: string) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                  {(!profileData?.stages || profileData.stages.length === 0) && (
                    <span className="text-sm text-muted-foreground">Not set</span>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Support Types</div>
                <div className="flex flex-wrap gap-2">
                  {(profileData?.supportTypes || []).map((s: string) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                  {(!profileData?.supportTypes || profileData.supportTypes.length === 0) && (
                    <span className="text-sm text-muted-foreground">Not set</span>
                  )}
                </div>
              </div>
              
              {profileData?.checkSize && (
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Check Size</div>
                  <p className="font-medium">{profileData.checkSize}</p>
                </div>
              )}
              
              {profileData?.linkedin && (
                <a 
                  href={profileData.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default InvestorProfileView;