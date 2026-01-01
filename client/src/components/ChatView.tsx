import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, MessageCircle, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatWebSocket } from "@/lib/websocket";

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
  const wsRef = useRef<ChatWebSocket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (!useWebSocket || !chatId) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const ws = new ChatWebSocket(chatId);
    wsRef.current = ws;

    const unsubMessage = ws.onMessage((data) => {
      if (data.type === 'chat_message') {
        setMessages(prev => [...prev, {
          id: data.message.id,
          content: data.message.content,
          senderId: data.message.sender_id || data.message.senderId,
          timestamp: new Date(data.message.created_at || data.message.createdAt).toLocaleTimeString(),
          status: data.message.status
        }]);
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

  const getStatusIndicator = (message: Message) => {
    if (message.senderId !== currentUserId) return null;

    switch (message.status) {
      case 'sent':
        return <span className="text-xs text-muted-foreground ml-1">✓</span>;
      case 'delivered':
        return <span className="text-xs text-muted-foreground ml-1">✓✓</span>;
      case 'read':
        return <span className="text-xs text-primary ml-1">✓✓</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center gap-3 p-4 border-b border-border">
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
          <div className="flex items-center gap-1">
            {useWebSocket && (
              <>
                {isConnected ? (
                  <Wifi className="h-3 w-3 text-green-500" />
                ) : (
                  <WifiOff className="h-3 w-3 text-muted-foreground" />
                )}
              </>
            )}
            <p className="text-xs text-muted-foreground">
              {isTyping ? "typing..." : "Online"}
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
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
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isOwn = message.senderId === currentUserId;
              const showTimestamp =
                index === 0 ||
                index % 5 === 0 ||
                messages[index - 1]?.senderId !== message.senderId;

              return (
                <div key={message.id}>
                  {showTimestamp && (
                    <p className="text-xs text-muted-foreground text-center mb-2">
                      {message.timestamp}
                    </p>
                  )}
                  <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        isOwn
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      {getStatusIndicator(message)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
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
            className="flex-1"
            maxLength={MAX_MESSAGE_LENGTH}
            disabled={!canSendMessages}
          />
          <Button
            onClick={handleSubmit}
            size="icon"
            disabled={!newMessage.trim() || !canSendMessages}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        {canSendMessages && (
          <div className="flex justify-end mt-1">
            <span 
              className={`text-xs ${remainingChars <= 50 ? 'text-destructive' : 'text-muted-foreground'}`}
            >
              {remainingChars} characters remaining
            </span>
          </div>
        )}
      </div>
    </div>
  );
}