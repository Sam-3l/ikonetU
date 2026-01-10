import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatPreview {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageSenderId?: string;
  lastMessageStatus?: 'sent' | 'delivered' | 'read';
  timestamp: string;
  unreadCount?: number;
  isOnline?: boolean;
  isTyping?: boolean;
  otherUserId?: string;
}

interface ChatListProps {
  chats: ChatPreview[];
  selectedChatId?: string;
  onSelectChat: (chatId: string) => void;
  currentUserId?: string;
}

export default function ChatList({ chats, selectedChatId, onSelectChat, currentUserId }: ChatListProps) {
  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
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

  const getStatusIcon = (status?: string) => {
    if (!status) return null;
    
    switch (status) {
      case 'sent':
        return (
          <svg className="w-3 h-3 shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
          </svg>
        );
      case 'delivered':
        return (
          <svg className="w-3 h-3 shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0z"/>
            <path d="M5.354 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708l3-3a.5.5 0 0 1 .708 0z"/>
          </svg>
        );
      case 'read':
        return (
          <svg className="w-3 h-3 shrink-0 text-blue-500" viewBox="0 0 16 16" fill="currentColor">
            <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0z"/>
            <path d="M5.354 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708l3-3a.5.5 0 0 1 .708 0z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const TypingIndicator = () => (
    <div className="flex items-center gap-1">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }}></span>
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '1s' }}></span>
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '1s' }}></span>
      </div>
      <span className="text-xs text-primary ml-1">typing</span>
    </div>
  );

  const getMessagePreview = (chat: ChatPreview) => {
    // Show typing indicator if user is typing
    if (chat.isTyping) {
      return <TypingIndicator />;
    }

    const isOwnMessage = chat.lastMessageSenderId === currentUserId;
    const hasUnread = chat.unreadCount && chat.unreadCount > 0;
    
    if (!chat.lastMessage) return '';
    
    const messageText = chat.lastMessage.length > 35 
      ? `${chat.lastMessage.substring(0, 35)}...` 
      : chat.lastMessage;
    
    if (isOwnMessage) {
      return (
        <span className="flex items-center gap-1">
          {getStatusIcon(chat.lastMessageStatus)}
          <span className="truncate">{messageText}</span>
        </span>
      );
    }
    
    return (
      <span className={`truncate ${hasUnread ? 'font-semibold' : ''}`}>
        {messageText}
      </span>
    );
  };

  return (
    <ScrollArea className="h-full">
      <div className="bg-gradient-to-b from-violet-50/20 via-transparent to-fuchsia-50/20 dark:from-violet-950/10 dark:via-transparent dark:to-fuchsia-950/10">
      <div className="divide-y divide-border">
      <div className="divide-y divide-border">
        {chats.map((chat) => {
          const hasUnread = chat.unreadCount && chat.unreadCount > 0;
          
          return (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`w-full flex items-center gap-3 p-4 text-left transition-all ${
                selectedChatId === chat.id 
                  ? "bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border-l-4 border-purple-500 shadow-lg shadow-purple-500/10" 
                  : "hover:bg-gradient-to-r hover:from-violet-50 hover:to-fuchsia-50 dark:hover:from-violet-950/30 dark:hover:to-fuchsia-950/30"
              }`}
            >
              <div className="relative shrink-0">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={chat.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {chat.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {chat.isOnline && (
                  <span 
                    className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"
                    title="Online"
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`font-medium truncate ${hasUnread ? 'font-semibold' : ''}`}>
                    {chat.name}
                  </span>
                  {chat.timestamp && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                      {chat.timestamp}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground flex-1 min-w-0">
                    {getMessagePreview(chat)}
                  </div>
                  {(chat.unreadCount ?? 0) > 0 && !chat.isTyping && (
                    <Badge className="h-5 min-w-[20px] shrink-0 rounded-full px-1.5 text-xs font-semibold">
                      {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      </div>
      </div>
    </ScrollArea>
  );
}