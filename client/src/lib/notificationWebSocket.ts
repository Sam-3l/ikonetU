type NotificationHandler = (data: any) => void;
type ConnectionHandler = () => void;

export class NotificationWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private notificationHandlers: Set<NotificationHandler> = new Set();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private disconnectionHandlers: Set<ConnectionHandler> = new Set();

  connect(token: string) {
    if (this.ws) {
      this.ws.close();
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname === 'localhost'
      ? 'localhost:3000'
      : new URL(import.meta.env.VITE_API_BASE_URL).host;
    const wsUrl = `${wsProtocol}//${host}/ws/notifications/?token=${token}`;
    
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.connectionHandlers.forEach(handler => handler());
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.notificationHandlers.forEach(handler => handler(data));
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('Notification WebSocket error:', error);
    };

    this.ws.onclose = () => {
      this.disconnectionHandlers.forEach(handler => handler());
      this.attemptReconnect(token);
    };
  }

  private attemptReconnect(token: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      this.reconnectTimeout = setTimeout(() => {
        this.connect(token);
      }, delay);
    }
  }

  onNotification(handler: NotificationHandler) {
    this.notificationHandlers.add(handler);
    return () => this.notificationHandlers.delete(handler);
  }

  onConnect(handler: ConnectionHandler) {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }

  onDisconnect(handler: ConnectionHandler) {
    this.disconnectionHandlers.add(handler);
    return () => this.disconnectionHandlers.delete(handler);
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.notificationHandlers.clear();
    this.connectionHandlers.clear();
    this.disconnectionHandlers.clear();
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}