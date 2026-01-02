import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/apiClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useGlobalPresence } from "@/hooks/useGlobalPresence";
import ChatList from "@/components/ChatList";
import ChatView from "@/components/ChatView";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface MatchWithDetails {
  id: string;
  isActive: boolean;
  createdAt: string;
  otherUser: {
    id: string;
    name: string;
    avatarUrl: string | null;
    role: string;
  } | null;
  otherProfile: {
    companyName?: string;
    firmName?: string;
    sector?: string;
    stage?: string;
    title?: string;
    sectors?: string[];
    stages?: string[];
  } | null;
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    status: string;
    createdAt: string;
  } | null;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  status: string;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
}

function MessagesPage() {
  const { user } = useAuth();
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { getUserStatus, isUserTypingInMatch, sendTypingStatus } = useGlobalPresence();

  const { data: matches, isLoading } = useQuery<MatchWithDetails[]>({
    queryKey: ["/api/matches/"],
    queryFn: () => api.get<MatchWithDetails[]>("/api/matches/"),
    refetchInterval: 10000,
  });

  const { data: messagesData, refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: [`/api/matches/${selectedMatchId}/messages/`],
    queryFn: () => api.get<Message[]>(`/api/matches/${selectedMatchId}/messages/`),
    enabled: !!selectedMatchId,
    refetchInterval: 2000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ matchId, content }: { matchId: string; content: string }) => {
      return api.post<Message>(`/api/matches/${matchId}/messages/send/`, { content });
    },
    onSuccess: () => {
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ["/api/matches/"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (matchId: string) => {
      return api.put(`/api/matches/${matchId}/messages/mark-read/`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches/"] });
    },
  });

  const handleSelectChat = (matchId: string) => {
    setSelectedMatchId(matchId);
    markReadMutation.mutate(matchId);
  };

  const activeMatches = matches?.filter(m => m.isActive) || [];

  const chats = activeMatches.map(match => {
    const otherUserId = match.otherUser?.id || '';
    const userStatus = getUserStatus(otherUserId);
    const isTyping = isUserTypingInMatch(otherUserId, match.id);

    return {
      id: match.id,
      name: match.otherUser?.name || "Unknown",
      avatar: match.otherUser?.avatarUrl || undefined,
      lastMessage: match.lastMessage?.content || "Start a conversation",
      lastMessageSenderId: match.lastMessage?.senderId,
      lastMessageStatus: match.lastMessage?.status as 'sent' | 'delivered' | 'read' | undefined,
      timestamp: match.lastMessage 
        ? new Date(match.lastMessage.createdAt).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })
        : "",
      unreadCount: match.unreadCount,
      isOnline: userStatus.isOnline,
      isTyping: isTyping,
      otherUserId: otherUserId,
    };
  });

  const selectedMatch = activeMatches.find(m => m.id === selectedMatchId);

  const formattedMessages = messagesData?.map(m => ({
    id: m.id,
    content: m.content,
    senderId: m.senderId,
    timestamp: m.createdAt,
    status: m.status as 'sent' | 'delivered' | 'read',
  })) || [];

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  if (activeMatches.length === 0) {
    return (
      <div className="h-[calc(100vh-4rem)] pb-16 md:pb-0 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No active conversations yet</p>
          <Button onClick={() => window.location.href = "/matches"}>
            View Matches
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] pb-16 md:pb-0 flex w-full">
      {/* Chat List Sidebar */}
      <div className={`w-full md:w-80 xl:w-96 border-r border-border flex-shrink-0 ${selectedMatchId ? "hidden md:flex md:flex-col" : "flex flex-col"}`}>
        <div className="p-4 border-b border-border">
          <h2 className="font-display text-lg font-semibold">Messages</h2>
        </div>
        <ChatList 
          chats={chats} 
          selectedChatId={selectedMatchId || undefined} 
          onSelectChat={handleSelectChat}
          currentUserId={user?.id}
        />
      </div>
      
      {/* Chat View */}
      <div className="flex-1 min-w-0 flex flex-col">
        {selectedMatchId && selectedMatch ? (
          <ChatView
            key={selectedMatchId}
            chatId={selectedMatchId}
            recipientName={selectedMatch.otherUser?.name || ""}
            recipientAvatar={selectedMatch.otherUser?.avatarUrl || undefined}
            recipientId={selectedMatch.otherUser?.id}
            currentUserId={user?.id || ""}
            messages={formattedMessages}
            onSendMessage={(content) => sendMessageMutation.mutate({ matchId: selectedMatchId, content })}
            onBack={() => setSelectedMatchId(null)}
            canSendMessages={selectedMatch.isActive}
            useWebSocket={true}
            onTypingChange={(isTyping) => sendTypingStatus(selectedMatchId, isTyping)}
          />
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground bg-background">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MessagesPage;