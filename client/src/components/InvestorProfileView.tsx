import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Briefcase, User, Linkedin, Heart, FileText, AlertCircle, X, Target, TrendingUp, HandHeart } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  // Updated sector options (more comprehensive)
  const sectors = ["Fintech", "Healthcare", "AI/ML", "SaaS", "E-commerce", "Climate Tech", "EdTech", "Web3", "Consumer", "Enterprise"];
  
  // Updated stage options (added "Idea" and "Pre-seed")
  const stages = ["Idea", "Pre-seed", "Seed", "Series A", "Series B", "Growth"];
  
  const supportOptions = ["Capital Only", "Advisory", "Hands-on", "Board Seat", "Strategic"];

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  // URL validation helper
  const validateURL = (url: string): boolean => {
    if (!url || url.trim() === '') return true; // Empty is valid (optional field)
    
    try {
      // Add https:// if no protocol specified
      const urlToTest = url.startsWith('http://') || url.startsWith('https://') 
        ? url 
        : `https://${url}`;
      
      new URL(urlToTest);
      return true;
    } catch {
      return false;
    }
  };

  // Normalize URL (add https:// if missing)
  const normalizeURL = (url: string): string => {
    if (!url || url.trim() === '') return '';
    
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  // Handle URL field changes with validation
  const handleURLChange = (value: string) => {
    setFormData({ ...formData, linkedin: value });
    
    // Clear error when user starts typing
    if (errors.linkedin) {
      const newErrors = { ...errors };
      delete newErrors.linkedin;
      setErrors(newErrors);
    }
  };

  // Validate before saving
  const handleSaveWithValidation = () => {
    const newErrors: Record<string, string> = {};

    // Validate linkedin
    if (formData.linkedin && !validateURL(formData.linkedin)) {
      newErrors.linkedin = 'Please enter a valid URL (e.g., https://linkedin.com/in/yourname or linkedin.com/in/yourname)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Normalize URL before saving
    const dataToSave = {
      ...formData,
      linkedin: formData.linkedin ? normalizeURL(formData.linkedin) : ''
    };

    setFormData(dataToSave);
    setErrors({});
    onSave();
  };

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
      <Card className="bg-gradient-to-br from-rose-50 via-pink-50/50 to-rose-50/30 dark:from-rose-950/30 dark:via-pink-950/20 dark:to-rose-950/10 border-rose-500/20">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col items-center text-center">
              <Heart className="h-5 w-5 md:h-6 md:w-6 mb-2 text-rose-600 dark:text-rose-400" />
              <div className="text-xl md:text-2xl font-bold bg-gradient-to-br from-rose-600 to-pink-600 bg-clip-text text-transparent">{stats?.activeMatches || 0}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Total Matches</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 via-cyan-50/50 to-blue-50/30 dark:from-blue-950/30 dark:via-cyan-950/20 dark:to-blue-950/10 border-blue-500/20">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col items-center text-center">
              <FileText className="h-5 w-5 md:h-6 md:w-6 mb-2 text-blue-600 dark:text-blue-400" />
              <div className="text-xl md:text-2xl font-bold bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent">{stats?.interestedCount || 0}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Interested Founders</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Information */}
      <Card className="bg-gradient-to-br from-violet-50/30 via-purple-50/20 to-fuchsia-50/30 dark:from-violet-950/10 dark:via-purple-950/5 dark:to-fuchsia-950/10 border-purple-500/10">
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
                <Label className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Investment Sectors (select all that apply) *
                </Label>
                <div className="flex flex-wrap gap-2 p-3 border border-purple-500/20 rounded-lg bg-gradient-to-br from-purple-50/50 to-fuchsia-50/30 dark:from-purple-950/20 dark:to-fuchsia-950/10">
                  {sectors.map(s => (
                    <Badge 
                      key={s} 
                      variant={(formData.sectors || []).includes(s) ? "default" : "outline"} 
                      className="cursor-pointer hover:bg-primary/80 transition-colors" 
                      onClick={() => setFormData({ 
                        ...formData, 
                        sectors: toggleArrayItem(formData.sectors || [], s) 
                      })}
                    >
                      {s}
                      {(formData.sectors || []).includes(s) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Selected: {(formData.sectors || []).length > 0 ? (formData.sectors || []).join(", ") : "None"}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Investment Stages (select all that apply) *
                </Label>
                <div className="flex flex-wrap gap-2 p-3 border border-purple-500/20 rounded-lg bg-gradient-to-br from-purple-50/50 to-fuchsia-50/30 dark:from-purple-950/20 dark:to-fuchsia-950/10">
                  {stages.map(s => (
                    <Badge 
                      key={s} 
                      variant={(formData.stages || []).includes(s) ? "default" : "outline"} 
                      className="cursor-pointer hover:bg-primary/80 transition-colors" 
                      onClick={() => setFormData({ 
                        ...formData, 
                        stages: toggleArrayItem(formData.stages || [], s) 
                      })}
                    >
                      {s}
                      {(formData.stages || []).includes(s) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Selected: {(formData.stages || []).length > 0 ? (formData.stages || []).join(", ") : "None"}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <HandHeart className="h-4 w-4" />
                  Support Types (select all that apply) *
                </Label>
                <div className="flex flex-wrap gap-2 p-3 border border-purple-500/20 rounded-lg bg-gradient-to-br from-purple-50/50 to-fuchsia-50/30 dark:from-purple-950/20 dark:to-fuchsia-950/10">
                  {supportOptions.map(s => (
                    <Badge 
                      key={s} 
                      variant={(formData.supportTypes || []).includes(s) ? "default" : "outline"} 
                      className="cursor-pointer hover:bg-primary/80 transition-colors" 
                      onClick={() => setFormData({ 
                        ...formData, 
                        supportTypes: toggleArrayItem(formData.supportTypes || [], s) 
                      })}
                    >
                      {s}
                      {(formData.supportTypes || []).includes(s) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Selected: {(formData.supportTypes || []).length > 0 ? (formData.supportTypes || []).join(", ") : "None"}
                </p>
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
                    value={formData.linkedin || ""} 
                    onChange={(e) => handleURLChange(e.target.value)} 
                    placeholder="linkedin.com/in/yourname or full URL" 
                    className={errors.linkedin ? 'border-red-500' : ''}
                  />
                  {errors.linkedin && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.linkedin}
                    </p>
                  )}
                </div>
              </div>

              {/* Error Summary */}
              {Object.keys(errors).length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please fix the errors above before saving.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveWithValidation} className="flex-1 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 text-white border-0 shadow-lg shadow-purple-500/30">Save Changes</Button>
                <Button onClick={() => { setErrors({}); onCancel(); }} variant="outline" className="flex-1">Cancel</Button>
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
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span>Investment Sectors</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(profileData?.sectors || []).map((s: string) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                  {(!profileData?.sectors || profileData.sectors.length === 0) && (
                    <span className="text-sm text-muted-foreground">Not set</span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>Investment Stages</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(profileData?.stages || []).map((s: string) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                  {(!profileData?.stages || profileData.stages.length === 0) && (
                    <span className="text-sm text-muted-foreground">Not set</span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <HandHeart className="h-4 w-4" />
                  <span>Support Types</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(profileData?.supportTypes || []).map((s: string) => (
                    <Badge key={s} variant="outline">{s}</Badge>
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