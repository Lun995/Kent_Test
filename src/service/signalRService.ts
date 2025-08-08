import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

export interface ChatMessage {
  userName: string;
  message: string;
  timestamp?: Date;
}

export interface NotificationMessage {
  message: string;
  timestamp?: Date;
}

export interface BroadcastMessageRequest {
  message: string;
}

export interface NotificationRequest {
  message: string;
}

class SignalRService {
  private connection: HubConnection | null = null;
  private baseUrl = 'https://localhost:7107'; // 使用HTTPS端口
  private hubUrl = `${this.baseUrl}/hubs/chathub`;
  private apiUrl = `${this.baseUrl}/api/chat`;

  // 事件回調
  private messageCallbacks: ((message: ChatMessage) => void)[] = [];
  private notificationCallbacks: ((notification: NotificationMessage) => void)[] = [];
  private userJoinedCallbacks: ((userName: string) => void)[] = [];
  private userLeftCallbacks: ((userName: string) => void)[] = [];
  private onlineUsersCallbacks: ((users: string[]) => void)[] = [];
  private privateMessageCallbacks: ((fromUser: string, message: string) => void)[] = [];

  // 連接狀態
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // 初始化連接
  async startConnection(): Promise<boolean> {
    try {
      this.connection = new HubConnectionBuilder()
        .withUrl(this.hubUrl, {
          skipNegotiation: true,
          transport: 1 // WebSockets
        })
        .withAutomaticReconnect([0, 2000, 10000, 30000]) // 自動重連
        .configureLogging(LogLevel.Information)
        .build();

      this.setupEventHandlers();
      
      await this.connection.start();
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('SignalR連接成功');
      return true;
    } catch (error) {
      console.error('SignalR連接失敗:', error);
      return false;
    }
  }

  // 設置事件處理器
  private setupEventHandlers() {
    if (!this.connection) return;

    // 接收訊息
    this.connection.on('ReceiveMessage', (userName: string, message: string) => {
      const chatMessage: ChatMessage = {
        userName,
        message,
        timestamp: new Date()
      };
      this.messageCallbacks.forEach(callback => callback(chatMessage));
    });

    // 接收通知
    this.connection.on('ReceiveNotification', (message: string) => {
      const notification: NotificationMessage = {
        message,
        timestamp: new Date()
      };
      this.notificationCallbacks.forEach(callback => callback(notification));
    });

    // 用戶加入
    this.connection.on('UserJoined', (userName: string) => {
      this.userJoinedCallbacks.forEach(callback => callback(userName));
    });

    // 用戶離開
    this.connection.on('UserLeft', (userName: string) => {
      this.userLeftCallbacks.forEach(callback => callback(userName));
    });

    // 線上用戶列表
    this.connection.on('ReceiveOnlineUsers', (users: string[]) => {
      this.onlineUsersCallbacks.forEach(callback => callback(users));
    });

    // 私人訊息
    this.connection.on('ReceivePrivateMessage', (fromUser: string, message: string) => {
      this.privateMessageCallbacks.forEach(callback => callback(fromUser, message));
    });

    // 連接狀態變化
    this.connection.onclose((error) => {
      this.isConnected = false;
      console.log('SignalR連接已關閉:', error);
    });

    this.connection.onreconnecting((error) => {
      this.isConnected = false;
      console.log('SignalR重新連接中:', error);
    });

    this.connection.onreconnected((connectionId) => {
      this.isConnected = true;
      console.log('SignalR重新連接成功:', connectionId);
    });
  }

  // 停止連接
  async stopConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.isConnected = false;
      console.log('SignalR連接已停止');
    }
  }

  // 加入聊天室
  async joinChat(userName: string): Promise<void> {
    if (this.connection && this.isConnected) {
      await this.connection.invoke('JoinChat', userName);
    }
  }

  // 離開聊天室
  async leaveChat(userName: string): Promise<void> {
    if (this.connection && this.isConnected) {
      await this.connection.invoke('LeaveChat', userName);
    }
  }

  // 發送訊息
  async sendMessage(userName: string, message: string): Promise<void> {
    if (this.connection && this.isConnected) {
      await this.connection.invoke('SendMessage', userName, message);
    }
  }

  // 發送私人訊息
  async sendPrivateMessage(targetUserName: string, message: string): Promise<void> {
    if (this.connection && this.isConnected) {
      await this.connection.invoke('SendPrivateMessage', targetUserName, message);
    }
  }

  // 發送通知
  async sendNotification(message: string): Promise<void> {
    if (this.connection && this.isConnected) {
      await this.connection.invoke('SendNotification', message);
    }
  }

  // 廣播訊息
  async broadcastMessage(message: string): Promise<void> {
    if (this.connection && this.isConnected) {
      await this.connection.invoke('BroadcastMessage', message);
    }
  }

  // 取得線上用戶
  async getOnlineUsers(): Promise<void> {
    if (this.connection && this.isConnected) {
      await this.connection.invoke('GetOnlineUsers');
    }
  }

  // 測試連接
  async testConnection(): Promise<void> {
    if (this.connection && this.isConnected) {
      await this.connection.invoke('TestConnection');
    }
  }

  // API調用 - 廣播訊息
  async broadcastMessageViaAPI(message: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message } as BroadcastMessageRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API調用失敗:', error);
      throw error;
    }
  }

  // API調用 - 發送通知
  async sendNotificationViaAPI(message: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message } as NotificationRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API調用失敗:', error);
      throw error;
    }
  }

  // API調用 - 取得狀態
  async getStatus(): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/status`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API調用失敗:', error);
      throw error;
    }
  }

  // 事件監聽器註冊
  onMessage(callback: (message: ChatMessage) => void) {
    this.messageCallbacks.push(callback);
  }

  onNotification(callback: (notification: NotificationMessage) => void) {
    this.notificationCallbacks.push(callback);
  }

  onUserJoined(callback: (userName: string) => void) {
    this.userJoinedCallbacks.push(callback);
  }

  onUserLeft(callback: (userName: string) => void) {
    this.userLeftCallbacks.push(callback);
  }

  onOnlineUsers(callback: (users: string[]) => void) {
    this.onlineUsersCallbacks.push(callback);
  }

  onPrivateMessage(callback: (fromUser: string, message: string) => void) {
    this.privateMessageCallbacks.push(callback);
  }

  // 移除事件監聽器
  removeMessageListener(callback: (message: ChatMessage) => void) {
    this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
  }

  removeNotificationListener(callback: (notification: NotificationMessage) => void) {
    this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
  }

  // 取得連接狀態
  getConnectionState(): boolean {
    return this.isConnected;
  }

  // 取得連接ID
  getConnectionId(): string | null {
    return this.connection?.connectionId || null;
  }
}

// 創建單例實例
export const signalRService = new SignalRService();
export default signalRService;
