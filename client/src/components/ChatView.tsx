import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatWebSocket } from "@/lib/websocket";
import { api } from "@/lib/apiClient";

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
  messages: Message[];
  onSendMessage: (content: string) => void;
  onBack?: () => void;
  canSendMessages?: boolean;
  useWebSocket?: boolean;
}

const MAX_MESSAGE_LENGTH = 5000;

export default function ChatView({
  chatId,
  recipientName,
  recipientAvatar,
  currentUserId,
  messages: initialMessages,
  onSendMessage,
  onBack,
  canSendMessages = true,
  useWebSocket = false,
}: ChatViewProps) {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<ChatWebSocket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const readMarkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    // Delay scroll to ensure DOM is ready
    setTimeout(scrollToBottom, 100);
  }, [messages]);

  // Mark messages as delivered when opening chat, then mark as read while viewing
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
        // Use WebSocket to mark as read (broadcasts to sender)
        wsRef.current.sendMessage(JSON.stringify({
          type: 'mark_read'
        }));
      } else {
        // Fallback to REST API
        api.put(`/api/matches/${chatId}/messages/mark-read/`, {}).catch(error => {
          console.error('Failed to mark messages as read:', error);
        });
      }
    };

    // First mark as delivered (REST API ensures it happens)
    markAsDelivered();
    
    // Initial mark as read after a delay
    setTimeout(markAsRead, 500);
    
    // Then continuously mark as read
    readMarkIntervalRef.current = setInterval(markAsRead, 3000);

    return () => {
      if (readMarkIntervalRef.current) {
        clearInterval(readMarkIntervalRef.current);
      }
    };
  }, [chatId, useWebSocket]);

  useEffect(() => {
    if (!useWebSocket || !chatId) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const ws = new ChatWebSocket(chatId);
    wsRef.current = ws;

    const unsubMessage = ws.onMessage((data) => {
      if (data.type === 'chat_message') {
        const newMsg = {
          id: data.message.id,
          content: data.message.content,
          senderId: data.message.sender_id || data.message.senderId,
          timestamp: data.message.created_at || data.message.createdAt,
          status: data.message.status
        };
        
        setMessages(prev => [...prev, newMsg]);
        
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
      setIsConnected(true);
    });

    const unsubDisconnect = ws.onDisconnect(() => {
      setIsConnected(false);
    });

    ws.connect(token);

    return () => {
      unsubMessage();
      unsubConnect();
      unsubDisconnect();
      ws.disconnect();
    };
  }, [chatId, currentUserId, useWebSocket]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_MESSAGE_LENGTH) {
      setNewMessage(value);

      if (useWebSocket && wsRef.current?.isConnected()) {
        wsRef.current.sendTypingIndicator(true);

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          wsRef.current?.sendTypingIndicator(false);
        }, 2000);
      }
    }
  };

  const remainingChars = MAX_MESSAGE_LENGTH - newMessage.length;

  const handleSubmit = () => {
    if (!newMessage.trim()) return;

    const content = newMessage.trim();

    if (useWebSocket && wsRef.current?.isConnected()) {
      wsRef.current.sendTypingIndicator(false);
      wsRef.current.sendMessage(content);
    } else {
      onSendMessage(content);
    }

    setNewMessage("");
  };

  const handleStarterClick = (starter: string) => {
    if (!canSendMessages) return;

    if (useWebSocket && wsRef.current?.isConnected()) {
      wsRef.current.sendMessage(starter);
    } else {
      onSendMessage(starter);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
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

  return (
    <div className="flex flex-col h-full w-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-background">
        {onBack && (
          <Button size="icon" variant="ghost" onClick={onBack} className="md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <Avatar className="h-10 w-10">
          <AvatarImage src={recipientAvatar} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {recipientName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-medium">{recipientName}</h3>
          <div className="flex items-center gap-1.5">
            {isConnected && (
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
            )}
            <p className="text-xs text-muted-foreground">
              {isTyping ? "typing..." : isConnected ? "online" : "offline"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
        {messages.length === 0 ? (
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
              const showDate = 
                index === 0 || 
                new Date(messages[index - 1]?.timestamp).toDateString() !== new Date(message.timestamp).toDateString();

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        {new Date(message.timestamp).toLocaleDateString('en-US', { 
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
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="border-t border-border bg-background p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              value={newMessage}
              onChange={handleMessageChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={canSendMessages ? "Type a message..." : "Waiting for match acceptance..."}
              className="resize-none"
              maxLength={MAX_MESSAGE_LENGTH}
              disabled={!canSendMessages}
            />
            {canSendMessages && newMessage.length > 0 && (
              <div className="flex justify-end mt-1">
                <span 
                  className={`text-[10px] ${remainingChars <= 50 ? 'text-destructive' : 'text-muted-foreground'}`}
                >
                  {remainingChars} remaining
                </span>
              </div>
            )}
          </div>
          <Button
            onClick={handleSubmit}
            size="icon"
            disabled={!newMessage.trim() || !canSendMessages}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}