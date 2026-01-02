import { useEffect, useRef, useState } from 'react';

interface UserStatus {
  isOnline: boolean;
  isTyping: boolean;
}

interface TypingStatus {
  [matchId: string]: {
    [userId: string]: boolean;
  };
}

export function useGlobalPresence() {
  const [userStatuses, setUserStatuses] = useState<Record<string, UserStatus>>({});
  const [typingStatuses, setTypingStatuses] = useState<TypingStatus>({});
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const connect = () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${import.meta.env.VITE_API_BASE_URL 
            ? new URL(import.meta.env.VITE_API_BASE_URL).host 
            : window.location.host}/ws/presence/`;


      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        // Start heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
        
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'initial_statuses') {
          // Set initial online statuses
          const statuses: Record<string, UserStatus> = {};
          Object.entries(data.statuses).forEach(([userId, isOnline]) => {
            statuses[userId] = {
              isOnline: isOnline as boolean,
              isTyping: false,
            };
          });
          setUserStatuses(statuses);
        } else if (data.type === 'user_status') {
          // Update user online/offline status
          setUserStatuses(prev => ({
            ...prev,
            [data.user_id]: {
              isOnline: data.is_online,
              isTyping: data.is_typing || false,
            }
          }));
        } else if (data.type === 'typing_status') {
          // Update typing status for specific match
          setTypingStatuses(prev => ({
            ...prev,
            [data.match_id]: {
              ...prev[data.match_id],
              [data.user_id]: data.is_typing
            }
          }));
        }
      };

      ws.onerror = () => {
        // Connection error
      };

      ws.onclose = () => {
        // Clear heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }

        // Attempt reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };
    };

    connect();

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const sendTypingStatus = (matchId: string, isTyping: boolean) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        match_id: matchId,
        is_typing: isTyping
      }));
    }
  };

  const getUserStatus = (userId: string): UserStatus => {
    return userStatuses[userId] || { isOnline: false, isTyping: false };
  };

  const isUserTypingInMatch = (userId: string, matchId: string): boolean => {
    return typingStatuses[matchId]?.[userId] || false;
  };

  return {
    userStatuses,
    getUserStatus,
    isUserTypingInMatch,
    sendTypingStatus,
  };
}