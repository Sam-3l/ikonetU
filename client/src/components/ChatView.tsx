import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

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
}

const MAX_MESSAGE_LENGTH = 500;

export default function ChatView({
  recipientName,
  recipientAvatar,
  currentUserId,
  messages,
  onSendMessage,
  onBack,
  canSendMessages = true,
}: ChatViewProps) {
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_MESSAGE_LENGTH) {
      setNewMessage(value);
    }
  };
  
  const remainingChars = MAX_MESSAGE_LENGTH - newMessage.length;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  const handleStarterClick = (starter: string) => {
    if (!canSendMessages) return;
    onSendMessage(starter);
  };

  return (
    <div className="flex flex-col h-full bg-background" data-testid="chat-view">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        {onBack && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onBack}
            className="md:hidden"
            data-testid="button-chat-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <Avatar className="h-10 w-10">
          <AvatarImage src={recipientAvatar} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {recipientName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{recipientName}</h3>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8" data-testid="chat-empty-state">
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
                      data-testid={`button-starter-${index}`}
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
                  <div
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    data-testid={`message-${message.id}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        isOwn
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-border"
        data-testid="chat-input-form"
      >
        <div className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={handleMessageChange}
            placeholder={canSendMessages ? "Type a message..." : "Waiting for match acceptance..."}
            className="flex-1"
            maxLength={MAX_MESSAGE_LENGTH}
            disabled={!canSendMessages}
            data-testid="input-message"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newMessage.trim() || !canSendMessages}
            data-testid="button-send"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        {canSendMessages && (
          <div className="flex justify-end mt-1">
            <span 
              className={`text-xs ${remainingChars <= 50 ? 'text-destructive' : 'text-muted-foreground'}`}
              data-testid="text-char-count"
            >
              {remainingChars} characters remaining
            </span>
          </div>
        )}
      </form>
    </div>
  );
}
