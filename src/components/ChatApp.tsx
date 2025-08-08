import React, { useState, useEffect, useRef } from 'react';
import signalRService, { ChatMessage, NotificationMessage } from '../service/signalRService';
import './ChatApp.css';

interface OnlineUser {
  name: string;
  isOnline: boolean;
}

const ChatApp: React.FC = () => {
  // 狀態管理
  const [isConnected, setIsConnected] = useState(false);
  const [userName, setUserName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [privateMessage, setPrivateMessage] = useState('');
  const [targetUser, setTargetUser] = useState('');
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);

  // 引用
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // 自動滾動到最新訊息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化SignalR連接
  useEffect(() => {
    const initializeConnection = async () => {
      const success = await signalRService.startConnection();
      setIsConnected(success);
      
      if (success) {
        setConnectionId(signalRService.getConnectionId());
        
        // 註冊事件監聽器
        signalRService.onMessage(handleNewMessage);
        signalRService.onNotification(handleNewNotification);
        signalRService.onUserJoined(handleUserJoined);
        signalRService.onUserLeft(handleUserLeft);
        signalRService.onOnlineUsers(handleOnlineUsers);
        signalRService.onPrivateMessage(handlePrivateMessage);
      }
    };

    initializeConnection();

    // 清理函數
    return () => {
      signalRService.stopConnection();
    };
  }, []);

  // 事件處理函數
  const handleNewMessage = (chatMessage: ChatMessage) => {
    setMessages(prev => [...prev, chatMessage]);
  };

  const handleNewNotification = (notification: NotificationMessage) => {
    setNotifications(prev => [...prev, notification]);
  };

  const handleUserJoined = (userName: string) => {
    setMessages(prev => [...prev, {
      userName: 'System',
      message: `${userName} 加入了聊天室`,
      timestamp: new Date()
    }]);
  };

  const handleUserLeft = (userName: string) => {
    setMessages(prev => [...prev, {
      userName: 'System',
      message: `${userName} 離開了聊天室`,
      timestamp: new Date()
    }]);
  };

  const handleOnlineUsers = (users: string[]) => {
    setOnlineUsers(users);
  };

  const handlePrivateMessage = (fromUser: string, message: string) => {
    setMessages(prev => [...prev, {
      userName: `${fromUser} (私人訊息)`,
      message,
      timestamp: new Date()
    }]);
  };

  // 加入聊天室
  const handleJoinChat = async () => {
    if (!userName.trim()) {
      alert('請輸入用戶名');
      return;
    }

    try {
      await signalRService.joinChat(userName);
      setMessages(prev => [...prev, {
        userName: 'System',
        message: `歡迎 ${userName} 加入聊天室！`,
        timestamp: new Date()
      }]);
      messageInputRef.current?.focus();
    } catch (error) {
      console.error('加入聊天室失敗:', error);
      alert('加入聊天室失敗');
    }
  };

  // 發送訊息
  const handleSendMessage = async () => {
    if (!message.trim() || !userName.trim()) {
      alert('請輸入訊息和用戶名');
      return;
    }

    try {
      await signalRService.sendMessage(userName, message);
      setMessage('');
      messageInputRef.current?.focus();
    } catch (error) {
      console.error('發送訊息失敗:', error);
      alert('發送訊息失敗');
    }
  };

  // 發送私人訊息
  const handleSendPrivateMessage = async () => {
    if (!privateMessage.trim() || !targetUser.trim() || !userName.trim()) {
      alert('請輸入目標用戶、訊息和用戶名');
      return;
    }

    try {
      await signalRService.sendPrivateMessage(targetUser, privateMessage);
      setPrivateMessage('');
    } catch (error) {
      console.error('發送私人訊息失敗:', error);
      alert('發送私人訊息失敗');
    }
  };

  // 發送通知
  const handleSendNotification = async () => {
    if (!message.trim()) {
      alert('請輸入通知訊息');
      return;
    }

    try {
      await signalRService.sendNotification(message);
      setMessage('');
    } catch (error) {
      console.error('發送通知失敗:', error);
      alert('發送通知失敗');
    }
  };

  // 廣播訊息
  const handleBroadcastMessage = async () => {
    if (!message.trim()) {
      alert('請輸入廣播訊息');
      return;
    }

    try {
      await signalRService.broadcastMessage(message);
      setMessage('');
    } catch (error) {
      console.error('廣播訊息失敗:', error);
      alert('廣播訊息失敗');
    }
  };

  // 取得線上用戶
  const handleGetOnlineUsers = async () => {
    try {
      await signalRService.getOnlineUsers();
    } catch (error) {
      console.error('取得線上用戶失敗:', error);
      alert('取得線上用戶失敗');
    }
  };

  // 測試連接
  const handleTestConnection = async () => {
    try {
      await signalRService.testConnection();
    } catch (error) {
      console.error('測試連接失敗:', error);
      alert('測試連接失敗');
    }
  };

  // API測試函數
  const testApiStatus = async () => {
    try {
      const status = await signalRService.getStatus();
      setApiStatus(status);
    } catch (error) {
      console.error('API狀態測試失敗:', error);
      setApiStatus({ error: 'API測試失敗' });
    }
  };

  const testBroadcastViaAPI = async () => {
    if (!message.trim()) {
      alert('請輸入廣播訊息');
      return;
    }

    try {
      const result = await signalRService.broadcastMessageViaAPI(message);
      alert(`API廣播成功: ${result.message}`);
      setMessage('');
    } catch (error) {
      console.error('API廣播失敗:', error);
      alert('API廣播失敗');
    }
  };

  const testNotificationViaAPI = async () => {
    if (!message.trim()) {
      alert('請輸入通知訊息');
      return;
    }

    try {
      const result = await signalRService.sendNotificationViaAPI(message);
      alert(`API通知成功: ${result.message}`);
      setMessage('');
    } catch (error) {
      console.error('API通知失敗:', error);
      alert('API通知失敗');
    }
  };

  // 離開聊天室
  const handleLeaveChat = async () => {
    try {
      await signalRService.leaveChat(userName);
      setUserName('');
      setMessages([]);
      setOnlineUsers([]);
    } catch (error) {
      console.error('離開聊天室失敗:', error);
      alert('離開聊天室失敗');
    }
  };

  // 鍵盤事件處理
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="chat-app">
      <div className="chat-header">
        <h1>SignalR 聊天室測試</h1>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '已連接' : '未連接'}
          </span>
          {connectionId && <span className="connection-id">ID: {connectionId}</span>}
        </div>
      </div>

      <div className="chat-container">
        {/* 左側面板 - 連接和用戶管理 */}
        <div className="left-panel">
          <div className="connection-section">
            <h3>連接管理</h3>
            <button onClick={handleTestConnection} className="btn btn-secondary">
              測試連接
            </button>
            <button onClick={handleGetOnlineUsers} className="btn btn-secondary">
              取得線上用戶
            </button>
          </div>

          <div className="user-section">
            <h3>用戶管理</h3>
            <div className="input-group">
              <input
                type="text"
                placeholder="輸入用戶名"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="input"
              />
              <button onClick={handleJoinChat} className="btn btn-primary">
                加入聊天室
              </button>
            </div>
            {userName && (
              <button onClick={handleLeaveChat} className="btn btn-danger">
                離開聊天室
              </button>
            )}
          </div>

          <div className="api-section">
            <h3>API 測試</h3>
            <button onClick={testApiStatus} className="btn btn-secondary">
              測試 API 狀態
            </button>
            <button onClick={testBroadcastViaAPI} className="btn btn-secondary">
              透過 API 廣播
            </button>
            <button onClick={testNotificationViaAPI} className="btn btn-secondary">
              透過 API 發送通知
            </button>
            {apiStatus && (
              <div className="api-status">
                <h4>API 狀態:</h4>
                <pre>{JSON.stringify(apiStatus, null, 2)}</pre>
              </div>
            )}
          </div>

          <div className="online-users-section">
            <h3>線上用戶 ({onlineUsers.length})</h3>
            <div className="users-list">
              {onlineUsers.map((user, index) => (
                <div key={index} className="user-item">
                  {user}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 中間面板 - 聊天區域 */}
        <div className="center-panel">
          <div className="messages-container">
            <div className="messages">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.userName === userName ? 'own' : 'other'}`}>
                  <div className="message-header">
                    <span className="user-name">{msg.userName}</span>
                    <span className="timestamp">
                      {msg.timestamp?.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="message-content">{msg.message}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="message-input-section">
            <div className="input-group">
              <input
                ref={messageInputRef}
                type="text"
                placeholder="輸入訊息..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="input"
              />
              <button onClick={handleSendMessage} className="btn btn-primary">
                發送
              </button>
            </div>
            <div className="message-actions">
              <button onClick={handleSendNotification} className="btn btn-warning">
                發送通知
              </button>
              <button onClick={handleBroadcastMessage} className="btn btn-info">
                廣播訊息
              </button>
            </div>
          </div>
        </div>

        {/* 右側面板 - 私人訊息 */}
        <div className="right-panel">
          <div className="private-message-section">
            <h3>私人訊息</h3>
            <div className="input-group">
              <input
                type="text"
                placeholder="目標用戶"
                value={targetUser}
                onChange={(e) => setTargetUser(e.target.value)}
                className="input"
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                placeholder="私人訊息"
                value={privateMessage}
                onChange={(e) => setPrivateMessage(e.target.value)}
                className="input"
              />
              <button onClick={handleSendPrivateMessage} className="btn btn-primary">
                發送
              </button>
            </div>
          </div>

          <div className="notifications-section">
            <h3>通知 ({notifications.length})</h3>
            <div className="notifications-list">
              {notifications.map((notification, index) => (
                <div key={index} className="notification-item">
                  <div className="notification-content">{notification.message}</div>
                  <div className="notification-time">
                    {notification.timestamp?.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
