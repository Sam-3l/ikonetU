import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatWebSocket } from "@/lib/websocket";
import { api } from "@/lib/apiClient";
import { useLocation } from "wouter";
import { useGlobalPresenceContext } from "@/contexts/GlobalPresenceContext";

const CONVERSATION_STARTERS = [
  "What stage is your company at?",
  "Tell me about your team",
  "What's your go-to-market strategy?",
];

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface ChatViewProps {
  chatId: string;
  recipientName: string;
  recipientAvatar?: string;
  currentUserId: string;
  recipientId?: string;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onBack?: () => void;
  canSendMessages?: boolean;
  useWebSocket?: boolean;
  onTypingChange?: (isTyping: boolean) => void;
  isRecipientOnlineGlobal?: boolean;
}

const MAX_MESSAGE_LENGTH = 5000;

export default function ChatView({
  chatId,
  recipientName,
  recipientAvatar,
  currentUserId,
  recipientId,
  messages: initialMessages,
  onSendMessage,
  onBack,
  canSendMessages = true,
  useWebSocket = false,
  onTypingChange,
  isRecipientOnlineGlobal = false,
}: ChatViewProps) {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [isFetchingMessages, setIsFetchingMessages] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [hasResolvedMessages, setHasResolvedMessages] = useState(false);
  const [, setLocation] = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wsRef = useRef<ChatWebSocket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const readMarkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get global presence from context (not directly from hook to avoid duplicate connections)
  const { onMessageStatusUpdate } = useGlobalPresenceContext();

  useEffect(() => {
    setHasResolvedMessages(false);
    setIsFetchingMessages(true);
    setShowSkeleton(false);
  }, [chatId]);  

  useEffect(() => {
    if (initialMessages.length === 0) {
      setMessages([]);
      return;
    }
    
    // Only update if we don't have messages yet, or merge statuses intelligently
    setMessages(prev => {
      if (prev.length === 0) {
        return initialMessages;
      }
      
      // Merge: keep the most up-to-date status for each message
      const merged = initialMessages.map(newMsg => {
        const existing = prev.find(m => m.id === newMsg.id);
        if (existing) {
          // Keep the more advanced status (sent < delivered < read)
          const statusPriority = { sent: 1, delivered: 2, read: 3 };
          const existingPriority = statusPriority[existing.status || 'sent'] || 1;
          const newPriority = statusPriority[newMsg.status || 'sent'] || 1;
          
          return {
            ...newMsg,
            status: existingPriority >= newPriority ? existing.status : newMsg.status
          };
        }
        return newMsg;
      });
      
      return merged;
    });
  }, [initialMessages, chatId]);
  
  useEffect(() => {
    if (initialMessages.length > 0) {
      setHasResolvedMessages(true);
      setIsFetchingMessages(false);
    }
  }, [initialMessages]);  
  
  useEffect(() => {
    if (!isFetchingMessages) return;
  
    const t = setTimeout(() => setShowSkeleton(true), 200);
    return () => clearTimeout(t);
  }, [isFetchingMessages]);

  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }, 100);
  }, [messages]);

  useEffect(() => {
    if (!chatId || useWebSocket) return;
  
    let resolved = false;
  
    const poll = async () => {
      try {
        const data = await api.get<Message[]>(
          `/api/matches/${chatId}/messages/`
        );
  
        setMessages(data);
  
        if (!resolved) {
          setHasResolvedMessages(true);
          setIsFetchingMessages(false);
          resolved = true;
        }        
      } catch (e) {
        console.error(e);
      }
    };
  
    poll(); // 🔥 immediate first fetch
    const interval = setInterval(poll, 2000);
  
    return () => clearInterval(interval);
  }, [chatId, useWebSocket]);      

  useEffect(() => {
    if (!chatId) return;

    const markAsDelivered = async () => {
      try {
        await api.post(`/api/matches/${chatId}/messages/mark-delivered/`, {});
      } catch (error) {
        console.error('Failed to mark messages as delivered:', error);
      }
    };

    const markAsRead = () => {
      if (useWebSocket && wsRef.current?.isConnected()) {
        wsRef.current.send(JSON.stringify({
          type: 'mark_read'
        }));
      } else {
        api.put(`/api/matches/${chatId}/messages/mark-read/`, {}).catch(error => {
          console.error('Failed to mark messages as read:', error);
        });
      }
    };

    markAsDelivered();
    setTimeout(markAsRead, 500);
    readMarkIntervalRef.current = setInterval(markAsRead, 3000);

    return () => {
      if (readMarkIntervalRef.current) {
        clearInterval(readMarkIntervalRef.current);
      }
    };
  }, [chatId, useWebSocket]);

  // Listen for message status updates from global presence
  useEffect(() => {
    if (!onMessageStatusUpdate) return;

    const unsubscribe = onMessageStatusUpdate((data) => {
      setMessages(prev => prev.map(msg =>
        msg.id === data.message_id
          ? { ...msg, status: data.status }
          : msg
      ));
    });

    return unsubscribe;
  }, [onMessageStatusUpdate]);

  useEffect(() => {
    if (!useWebSocket || !chatId) return;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const ws = new ChatWebSocket(chatId);
    wsRef.current = ws;

    const unsubMessage = ws.onMessage((data) => {
      if (data.type === 'chat_message') {
        const newMsg: Message = {
          id: data.message.id,
          content: data.message.content,
          senderId: data.message.sender_id || data.message.senderId,
          timestamp: data.message.created_at || data.message.createdAt,
          status: data.message.status
        };
        
        setMessages(prev => {
          const existingIndex = prev.findIndex(m => m.id === newMsg.id);
          
          if (existingIndex !== -1) {
            return prev.map((m, idx) => 
              idx === existingIndex 
                ? { ...m, status: newMsg.status, content: newMsg.content }
                : m
            );
          } else {
            return [...prev, newMsg];
          }
        });
        
        if (newMsg.senderId !== currentUserId) {
          setTimeout(async () => {
            try {
              await api.put(`/api/matches/${chatId}/messages/mark-read/`, {});
            } catch (error) {
              console.error('Failed to mark new message as read:', error);
            }
          }, 500);
        }
      } else if (data.type === 'message_status_update') {
        setMessages(prev => prev.map(msg => 
          msg.id === data.message_id 
            ? { ...msg, status: data.status }
            : msg
        ));
      } else if (data.type === 'typing_indicator') {
        if (data.user_id !== currentUserId) {
          setIsTyping(data.is_typing);
        }
      }
    });

    const unsubConnect = ws.onConnect(() => {
      setHasResolvedMessages(true);
      setIsFetchingMessages(false);
    });        

    const unsubDisconnect = ws.onDisconnect(() => {
      // Don't update online status here - global presence handles it
      // ChatWebSocket disconnect does NOT mean user is offline - they might still be on the app
    });

    ws.connect(token);

    return () => {
      unsubMessage();
      unsubConnect();
      unsubDisconnect();
      ws.disconnect();
    };
  }, [chatId, currentUserId, recipientId, useWebSocket]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_MESSAGE_LENGTH) {
      setNewMessage(value);

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
      }

      const isCurrentlyTyping = value.length > 0;

      // Notify global presence of typing status
      if (onTypingChange) {
        onTypingChange(isCurrentlyTyping);
      }

      // Also send to WebSocket for in-chat typing indicator
      if (useWebSocket && wsRef.current?.isConnected()) {
        wsRef.current.sendTypingIndicator(isCurrentlyTyping);
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing after 2 seconds of inactivity
      if (isCurrentlyTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          if (onTypingChange) {
            onTypingChange(false);
          }
          if (wsRef.current?.isConnected()) {
            wsRef.current.sendTypingIndicator(false);
          }
        }, 2000);
      }
    }
  };

  const handleSubmit = () => {
    if (!newMessage.trim()) return;

    const content = newMessage.trim();

    // Stop typing indicator immediately
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (onTypingChange) {
      onTypingChange(false);
    }
    if (useWebSocket && wsRef.current?.isConnected()) {
      wsRef.current.sendTypingIndicator(false);
    }

    if (useWebSocket && wsRef.current?.isConnected()) {
      wsRef.current.sendMessage(content);
    } else {
      onSendMessage(content);
    }

    setNewMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleStarterClick = (starter: string) => {
    if (!canSendMessages) return;

    if (useWebSocket && wsRef.current?.isConnected()) {
      wsRef.current.sendMessage(starter);
    } else {
      onSendMessage(starter);
    }
  };

  const handleProfileClick = () => {
    if (recipientId) {
      setLocation(`/user/${recipientId}`);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getStatusIcon = (status?: string) => {
    if (!status) return null;
    
    switch (status) {
      case 'sent':
        return (
          <svg className="w-4 h-4 inline-block ml-1" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
          </svg>
        );
      case 'delivered':
        return (
          <svg className="w-4 h-4 inline-block ml-1" viewBox="0 0 16 16" fill="currentColor">
            <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0z"/>
            <path d="M5.354 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708l3-3a.5.5 0 0 1 .708 0z"/>
          </svg>
        );
      case 'read':
        return (
          <svg className="w-4 h-4 inline-block ml-1 text-blue-500" viewBox="0 0 16 16" fill="currentColor">
            <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0z"/>
            <path d="M5.354 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708l3-3a.5.5 0 0 1 .708 0z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const TypingIndicator = () => (
    <div className="flex items-start mb-3">
      <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.4s' }}></span>
          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1.4s' }}></span>
          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1.4s' }}></span>
        </div>
      </div>
    </div>
  );

  const MessagesSkeleton = () => {
    const rows = [
      { own: false, width: "65%" },
      { own: true, width: "55%" },
      { own: false, width: "40%" },
      { own: true, width: "70%" },
      { own: false, width: "50%" },
    ];
  
    return (
      <div className="space-y-4">
        {/* Date separator skeleton */}
        <div className="flex justify-center">
          <div className="h-4 w-24 rounded-full bg-muted animate-pulse" />
        </div>
  
        {rows.map((row, i) => (
          <div
            key={i}
            className={`flex items-end gap-2 ${
              row.own ? "justify-end" : "justify-start"
            }`}
          >
            {!row.own && (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            )}
  
            <div
              className={`relative overflow-hidden rounded-2xl px-3 py-2 ${
                row.own
                  ? "bg-primary/20 rounded-br-sm"
                  : "bg-muted rounded-bl-sm"
              }`}
              style={{ width: row.width }}
            >
              {/* Shimmer */}
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  
              {/* Fake text lines */}
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-black/10 dark:bg-white/10" />
                <div className="h-3 w-3/4 rounded bg-black/10 dark:bg-white/10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };    

  return (
    <div className="flex flex-col h-full w-full bg-background">
      <div className="flex items-center gap-3 p-4 border-b border-border bg-background">
        {onBack && (
          <Button size="icon" variant="ghost" onClick={onBack} className="md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <button 
          onClick={handleProfileClick}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={recipientAvatar} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {recipientName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left">
            <h3 className="font-medium">{recipientName}</h3>
            <div className="flex items-center gap-1.5">
              {isRecipientOnlineGlobal && (
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
              )}
              <p className="text-xs text-muted-foreground">
                {isTyping ? "typing..." : isRecipientOnlineGlobal ? "online" : "offline"}
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
        {!hasResolvedMessages && showSkeleton ? (
          <MessagesSkeleton />
        ) : !hasResolvedMessages ? null : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-muted-foreground" />
            </div>
            {canSendMessages ? (
              <>
                <h4 className="font-medium mb-2">Start the conversation</h4>
                <p className="text-sm text-muted-foreground mb-6">
                  Break the ice with one of these questions:
                </p>
                <div className="space-y-2 w-full max-w-xs">
                  {CONVERSATION_STARTERS.map((starter, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full text-left justify-start text-sm"
                      onClick={() => handleStarterClick(starter)}
                    >
                      {starter}
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h4 className="font-medium mb-2">Waiting for match acceptance</h4>
                <p className="text-sm text-muted-foreground">
                  You can start chatting once both parties accept the match.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => {
              const isOwn = message.senderId === currentUserId;
              const messageDate = new Date(message.timestamp);
              const showDate = 
                index === 0 || 
                new Date(messages[index - 1]?.timestamp).toDateString() !== messageDate.toDateString();

              return (
                <div key={message.id}>
                  {showDate && !isNaN(messageDate.getTime()) && (
                    <div className="flex justify-center my-4">
                      <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        {messageDate.toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl px-3 py-2 ${
                        isOwn
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className={`text-[10px] ${isOwn ? 'opacity-80' : 'opacity-60'}`}>
                          {formatTime(message.timestamp)}
                        </span>
                        {isOwn && (
                          <span className="opacity-80">
                            {getStatusIcon(message.status)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-border bg-background p-4">
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={newMessage}
            onChange={handleMessageChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={canSendMessages ? "Type a message..." : "Waiting for match acceptance..."}
            className="min-h-[44px] max-h-[120px] resize-none"
            rows={1}
            maxLength={MAX_MESSAGE_LENGTH}
            disabled={!canSendMessages}
          />
          <Button
            onClick={handleSubmit}
            size="icon"
            disabled={!newMessage.trim() || !canSendMessages}
            className="shrink-0 h-[44px] w-[44px]"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}