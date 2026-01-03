import React, { createContext, useContext, ReactNode } from 'react';
import { useGlobalPresence } from '@/hooks/useGlobalPresence';

interface UserStatus {
  isOnline: boolean;
  isTyping: boolean;
}

interface NewMessageData {
  match_id: string;
  message_id: string;
  sender_id: string;
}

interface MessageStatusUpdate {
  message_id: string;
  status: 'sent' | 'delivered' | 'read';
}

interface GlobalPresenceContextType {
  userStatuses: Record<string, UserStatus>;
  getUserStatus: (userId: string) => UserStatus;
  isUserTypingInMatch: (userId: string, matchId: string) => boolean;
  sendTypingStatus: (matchId: string, isTyping: boolean) => void;
  onNewMessage: (callback: (data: NewMessageData) => void) => () => void;
  onMessageStatusUpdate: (callback: (data: MessageStatusUpdate) => void) => () => void;
}

const GlobalPresenceContext = createContext<GlobalPresenceContextType | null>(null);

export function GlobalPresenceProvider({ children }: { children: ReactNode }) {
  const presenceData = useGlobalPresence();

  return (
    <GlobalPresenceContext.Provider value={presenceData}>
      {children}
    </GlobalPresenceContext.Provider>
  );
}

export function useGlobalPresenceContext() {
  const context = useContext(GlobalPresenceContext);
  if (!context) {
    throw new Error('useGlobalPresenceContext must be used within GlobalPresenceProvider');
  }
  return context;
}