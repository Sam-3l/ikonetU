import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatPreview {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isOnline?: boolean;
}

interface ChatListProps {
  chats: ChatPreview[];
  selectedChatId?: string;
  onSelectChat: (chatId: string) => void;
}

export default function ChatList({ chats, selectedChatId, onSelectChat }: ChatListProps) {
  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center" data-testid="chat-list-empty">
        <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="font-display text-lg font-semibold mb-1">No conversations yet</h3>
        <p className="text-muted-foreground text-sm">Match with founders to start chatting</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full" data-testid="chat-list">
      <div className="divide-y divide-border">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`w-full flex items-center gap-3 p-4 text-left transition-colors hover-elevate ${
              selectedChatId === chat.id ? "bg-accent" : ""
            }`}
            data-testid={`chat-item-${chat.id}`}
          >
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={chat.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {chat.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {chat.isOnline && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-status-online border-2 border-background" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-medium truncate">{chat.name}</span>
                {chat.timestamp && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {chat.timestamp}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground truncate flex-1">
                  {chat.lastMessage}
                </p>
                {(chat.unreadCount ?? 0) > 0 && (
                  <Badge className="h-5 min-w-[20px] shrink-0 rounded-full px-1.5 text-xs font-semibold">
                    {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}