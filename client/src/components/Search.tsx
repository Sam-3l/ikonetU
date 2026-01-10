import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search as SearchIcon, X, TrendingUp, User, Video, Clock, Trash2, Eye, Heart, Play } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import VideoFeed from "@/components/VideoFeed";
import { useToast } from "@/hooks/use-toast";

interface SearchResult {
  videos: any[];
  profiles: any[];
  query: string;
}

interface SearchProps {
  onClose?: () => void;
  onSelectProfile?: (userId: string) => void;
}

export default function Search({ onClose, onSelectProfile }: SearchProps) {
  const { toast } = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "videos" | "profiles">("all");
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('search_history');
    return saved ? JSON.parse(saved) : [];
  });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Fetch trending suggestions for empty state
  const { data: trendingData } = useQuery<{ suggestions: string[] }>({
    queryKey: ["/api/videos/search/suggestions/"],
    queryFn: () => api.get("/api/videos/search/suggestions/"),
  });

  // Fetch autocomplete suggestions as user types (FIXED ENDPOINT)
  const { data: autocompleteData } = useQuery<{ suggestions: string[] }>({
    queryKey: ["/api/videos/search/autocomplete/", searchInput],
    queryFn: () => api.get(`/api/videos/search/autocomplete/?q=${encodeURIComponent(searchInput)}`),
    enabled: searchInput.length >= 1 && !submittedQuery,
  });

  // Fetch actual search results after submission
  const { data: results, isLoading } = useQuery<SearchResult>({
    queryKey: ["/api/videos/search/", submittedQuery],
    queryFn: () => api.get(`/api/videos/search/?q=${encodeURIComponent(submittedQuery)}`),
    enabled: submittedQuery.length >= 2,
  });

  const signalMutation = useMutation({
    mutationFn: async (data: { founderId: string; videoId: string; type: "interested" | "maybe" | "pass" }) => {
      return api.post("/api/signals/", data);
    },
    onSuccess: (response: any) => {
      if (response.matchCreated) {
        toast({ title: "It's a match! 🎉", description: "Check your matches to connect." });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/matches/"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleLike = async (videoId: string, isDoubleTap: boolean = false) => {
    try {
      await api.post(`/api/videos/${videoId}/like/`, { doubleTap: isDoubleTap });
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleView = async (videoId: string) => {
    try {
      await api.post(`/api/videos/${videoId}/track-view/`);
    } catch (error) {
      console.error("Failed to track view:", error);
    }
  };

  const handleSearch = () => {
    if (searchInput.trim().length >= 2) {
      setSubmittedQuery(searchInput.trim());
      
      // Save to history
      const newHistory = [searchInput.trim(), ...searchHistory.filter(h => h !== searchInput.trim())].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('search_history', JSON.stringify(newHistory));
    }
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSubmittedQuery("");
    inputRef.current?.focus();
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchInput(suggestion);
    setSubmittedQuery(suggestion);
    
    const newHistory = [suggestion, ...searchHistory.filter(h => h !== suggestion)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));
  };

  const handleRemoveFromHistory = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = searchHistory.filter(h => h !== term);
    setSearchHistory(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('search_history');
  };

  const handleVideoClick = (index: number) => {
    setSelectedVideoIndex(index);
    setShowVideoPlayer(true);
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const feedVideos = results?.videos?.map(video => ({
    id: video.founderId,
    name: video.founder?.user?.name || "Unknown",
    avatar: video.founder?.user?.avatarUrl || undefined,
    company: video.founder?.profile?.companyName || "Unknown Company",
    sector: video.founder?.profile?.sector || "Tech",
    stage: video.founder?.profile?.stage || "Seed",
    location: video.founder?.profile?.location || "Unknown",
    videoUrl: video.url,
    videoPoster: video.thumbnailUrl || undefined,
    videoId: video.id,
    title: video.title,
    viewCount: video.viewCount || 0,
    likeCount: video.likeCount || 0,
    isLiked: video.isLiked || false,
  })) || [];

  if (showVideoPlayer && feedVideos.length > 0) {
    const reorderedVideos = [
      ...feedVideos.slice(selectedVideoIndex),
      ...feedVideos.slice(0, selectedVideoIndex)
    ];

    return (
      <div className="fixed inset-0 z-50">
        {/* Background for video player */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-violet-50/30 to-purple-50/40 dark:from-slate-950 dark:via-violet-950/30 dark:to-purple-950/40">
          <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px'
          }} />
        </div>
        
        <div className="absolute top-4 left-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowVideoPlayer(false)}
            className="rounded-full bg-white/40 dark:bg-slate-950/40 backdrop-blur-md hover:bg-white/60 dark:hover:bg-slate-900/60 shadow-lg"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="relative z-10">
        <VideoFeed
          founders={reorderedVideos}
          onInterested={(founderId) => {
            const video = results?.videos?.find(v => v.founderId === founderId);
            if (video) signalMutation.mutate({ founderId, videoId: video.id, type: "interested" });
          }}
          onMaybe={(founderId) => {
            const video = results?.videos?.find(v => v.founderId === founderId);
            if (video) signalMutation.mutate({ founderId, videoId: video.id, type: "maybe" });
          }}
          onPass={(founderId) => {
            const video = results?.videos?.find(v => v.founderId === founderId);
            if (video) signalMutation.mutate({ founderId, videoId: video.id, type: "pass" });
          }}
          onInfo={(founderId) => {
            setShowVideoPlayer(false);
            onSelectProfile?.(founderId);
          }}
          onLike={handleLike}
          onView={handleView}
        />
        </div>
      </div>
    );
  }

  // Show suggestions in main area when typing (TikTok/YouTube style)
  const showSuggestions = searchInput.length >= 1 && !submittedQuery;
  const suggestions = autocompleteData?.suggestions || [];

  return (
    <div className="h-full flex flex-col relative">
      {/* Modal Background Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-violet-50/30 to-purple-50/40 dark:from-slate-950 dark:via-violet-950/30 dark:to-purple-950/40">
        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px'
        }} />
        
        {/* Gradient orbs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-radial from-violet-400/10 to-transparent dark:from-violet-600/8 dark:to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-gradient-radial from-purple-400/8 to-transparent dark:from-purple-600/6 dark:to-transparent rounded-full blur-3xl" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
      {/* Search Header with Blur */}
      <div className="sticky top-0 z-10 bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl border-b p-4">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <div className="flex-1 min-w-0">
            <div className="relative w-full">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <SearchIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search videos, founders, investors..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  if (e.target.value.length < 2) {
                    setSubmittedQuery("");
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                className="w-full bg-muted/50"
              />
              {searchInput && (
                <div className="absolute right-1 top-1/2 -translate-y-1/2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleClearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          )}
        </div>

        {submittedQuery && (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="max-w-2xl mx-auto mt-4">
            <TabsList className="w-full bg-muted/50">
              <TabsTrigger value="all" className="flex-1">
                All ({(results?.videos?.length || 0) + (results?.profiles?.length || 0)})
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex-1">
                <Video className="h-4 w-4 mr-2" />
                Videos ({results?.videos?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="profiles" className="flex-1">
                <User className="h-4 w-4 mr-2" />
                People ({results?.profiles?.length || 0})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* SUGGESTIONS IN MAIN AREA (TikTok/YouTube style) */}
        {showSuggestions && (
          <div className="p-4 space-y-2 max-w-2xl mx-auto">
            <div className="text-sm font-medium text-muted-foreground mb-3">
              Suggestions
            </div>
            {suggestions.length > 0 ? (
              suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  <SearchIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <span className="flex-1">{suggestion}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground p-3 text-center">
                Start typing to see suggestions
              </p>
            )}
          </div>
        )}

        {/* Empty State - Search History + Trending */}
        {!submittedQuery && !showSuggestions && !isLoading && (
          <div className="p-4 space-y-6 max-w-2xl mx-auto">
            {/* Search History */}
            {searchHistory.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Clock className="h-4 w-4" />
                    <span>Recent Searches</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleClearHistory}>
                    Clear All
                  </Button>
                </div>
                <div className="space-y-1">
                  {searchHistory.map((term, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer group transition-colors"
                      onClick={() => handleSelectSuggestion(term)}
                    >
                      <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <span className="flex-1">{term}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleRemoveFromHistory(term, e)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium mb-3">
                <TrendingUp className="h-4 w-4" />
                <span>Trending Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingData?.suggestions?.map((suggestion) => (
                  <Badge
                    key={suggestion}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all px-3 py-2"
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="p-4 space-y-4 max-w-2xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        )}

        {/* Results */}
        {submittedQuery && !isLoading && results && (
          <Tabs value={activeTab} className="w-full">
            <TabsContent value="all" className="p-4 space-y-6 m-0 max-w-4xl mx-auto">
              {/* Videos */}
              {results.videos.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Videos</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {results.videos.map((video, index) => (
                      <Card
                        key={video.id}
                        className="cursor-pointer hover-elevate overflow-hidden border border-slate-200/50 dark:border-slate-800/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => handleVideoClick(index)}
                      >
                        <div className="relative aspect-[9/16] bg-muted group">
                          {index === 0 ? (
                            <video
                              src={video.url}
                              poster={video.thumbnailUrl}
                              className="w-full h-full object-cover"
                              autoPlay
                              muted
                              loop
                              playsInline
                            />
                          ) : video.thumbnailUrl ? (
                            <img 
                              src={video.thumbnailUrl} 
                              alt={video.title} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <Video className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          
                          {index !== 0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
                                <Play className="w-6 h-6 text-foreground ml-1" />
                              </div>
                            </div>
                          )}
                          
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <p className="text-white text-xs font-medium line-clamp-2">
                              {video.title || video.founder?.profile?.companyName}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-white/80 text-xs">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {formatCount(video.viewCount || 0)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {formatCount(video.likeCount || 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Profiles */}
              {results.profiles.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">People</h3>
                  <div className="space-y-2">
                    {results.profiles.map((profile) => (
                      <Card
                        key={profile.id}
                        className="cursor-pointer hover-elevate hover:border-primary/50 transition-all bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-800/50"
                        onClick={() => onSelectProfile?.(profile.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={profile.avatar_url} />
                              <AvatarFallback>{profile.name?.charAt(0) || "?"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{profile.name}</p>
                              <p className="text-sm text-muted-foreground truncate">
                                {profile.company_name || profile.firm_name || profile.role}
                              </p>
                            </div>
                            <Badge variant="secondary">{profile.role}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {results.videos.length === 0 && results.profiles.length === 0 && (
                <div className="text-center py-12">
                  <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-4">
                    We couldn't find anything for "{submittedQuery}"
                  </p>
                  <Button variant="outline" onClick={handleClearSearch}>
                    Clear Search
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="videos" className="p-4 m-0 max-w-4xl mx-auto">
              {results.videos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {results.videos.map((video, index) => (
                    <Card
                      key={video.id}
                      className="cursor-pointer hover-elevate overflow-hidden border border-slate-200/50 dark:border-slate-800/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm"
                      onClick={() => handleVideoClick(index)}
                    >
                      <div className="relative aspect-[9/16] bg-muted group">
                        {video.thumbnailUrl ? (
                          <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
                            <Play className="w-6 h-6 text-foreground ml-1" />
                          </div>
                        </div>
                        
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                          <p className="text-white text-xs font-medium line-clamp-2">
                            {video.title || video.founder?.profile?.companyName}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-white/80 text-xs">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {formatCount(video.viewCount || 0)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {formatCount(video.likeCount || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No videos found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="profiles" className="p-4 m-0 max-w-2xl mx-auto">
              {results.profiles.length > 0 ? (
                <div className="space-y-2">
                  {results.profiles.map((profile) => (
                    <Card
                      key={profile.id}
                      className="cursor-pointer hover-elevate hover:border-primary/50 transition-all bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-800/50"
                      onClick={() => onSelectProfile?.(profile.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={profile.avatar_url} />
                            <AvatarFallback>{profile.name?.charAt(0) || "?"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{profile.name}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {profile.company_name || profile.firm_name || profile.role}
                            </p>
                          </div>
                          <Badge variant="secondary">{profile.role}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No people found</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
      </div>
    </div>
  );
}