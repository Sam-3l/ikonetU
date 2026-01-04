import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/apiClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useGlobalPresenceContext } from "@/contexts/GlobalPresenceContext";
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
  const [localMessages, setLocalMessages] = useState<Record<string, Message[]>>({});
  const { toast } = useToast();
  
  const { getUserStatus, isUserTypingInMatch, sendTypingStatus, onNewMessage, onMessageStatusUpdate, onMatchStatusUpdate } = useGlobalPresenceContext();

  const { data: matches, isLoading } = useQuery<MatchWithDetails[]>({
    queryKey: ["/api/matches/"],
    queryFn: () => api.get<MatchWithDetails[]>("/api/matches/"),
    refetchInterval: 30000, // Reduced from 10s to 30s since WebSocket handles real-time updates
  });

  const { data: messagesData, refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: [`/api/matches/${selectedMatchId}/messages/`],
    queryFn: () => api.get<Message[]>(`/api/matches/${selectedMatchId}/messages/`),
    enabled: !!selectedMatchId,
    refetchInterval: 2000,
  });

  // Update local messages when data changes
  useEffect(() => {
    if (selectedMatchId && messagesData) {
      setLocalMessages(prev => ({
        ...prev,
        [selectedMatchId]: messagesData
      }));
    }
  }, [selectedMatchId, messagesData]);

  // Listen for real-time new message notifications from global presence
  useEffect(() => {
    if (!onNewMessage) return;

    const unsubscribe = onNewMessage((data) => {
      // Only refetch if we're NOT in the chat that received the message
      // (because if we're in the chat, the ChatView WebSocket handles it)
      if (data.match_id !== selectedMatchId) {
        // Immediately refetch matches to update unread count
        queryClient.invalidateQueries({ queryKey: ["/api/matches/"] });
      }
    });

    return unsubscribe;
  }, [selectedMatchId, onNewMessage]);

  // Listen for message status updates from global presence
  useEffect(() => {
    if (!onMessageStatusUpdate) return;

    const unsubscribe = onMessageStatusUpdate((data) => {
      // Update local messages for all chats
      setLocalMessages(prev => {
        const updated = { ...prev };
        
        // Update message status in all cached chats
        Object.keys(updated).forEach(matchId => {
          updated[matchId] = updated[matchId].map(msg =>
            msg.id === data.message_id
              ? { ...msg, status: data.status }
              : msg
          );
        });
        
        return updated;
      });

      // Also invalidate the matches query to update last message status in chat list
      queryClient.invalidateQueries({ queryKey: ["/api/matches/"] });
    });

    return unsubscribe;
  }, [onMessageStatusUpdate]);

  useEffect(() => {
    if (!onMatchStatusUpdate) return;
  
    const unsubscribe = onMatchStatusUpdate((data) => {
      // Refetch matches when status changes (pending -> active)
      queryClient.invalidateQueries({ queryKey: ["/api/matches/"] });
    });
  
    return unsubscribe;
  }, [onMatchStatusUpdate]);

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
  
  // Get recipient's online status from global presence
  const recipientUserId = selectedMatch?.otherUser?.id || '';
  const recipientStatus = getUserStatus(recipientUserId);

  // Use local messages if available, otherwise use fetched data
  const currentMessages = selectedMatchId && localMessages[selectedMatchId] 
    ? localMessages[selectedMatchId] 
    : messagesData || [];

  const formattedMessages = currentMessages.map(m => ({
    id: m.id,
    content: m.content,
    senderId: m.senderId,
    timestamp: m.createdAt,
    status: m.status as 'sent' | 'delivered' | 'read',
  }));

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
            isRecipientOnlineGlobal={recipientStatus.isOnline}
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