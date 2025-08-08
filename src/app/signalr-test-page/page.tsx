"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Button, Paper, Group, Stack, Text, Box, Divider, TextInput, Badge, Alert, Tabs, Textarea } from '@mantine/core';
import { IconWifi, IconWifiOff, IconMessage, IconSend, IconUsers, IconBell, IconApi, IconBroadcast } from '@tabler/icons-react';

interface SignalRMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
  type: 'chat' | 'system' | 'notification' | 'private' | 'broadcast';
}

interface SignalRConnection {
  isConnected: boolean;
  connectionId: string | null;
  error: string | null;
}

interface OnlineUser {
  name: string;
  connectionId: string;
}

export default function SignalRTestPage() {
  const [connection, setConnection] = useState<SignalRConnection>({
    isConnected: false,
    connectionId: null,
    error: null
  });
  
  const [messages, setMessages] = useState<SignalRMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('測試用戶');
  const [privateMessage, setPrivateMessage] = useState('');
  const [targetUser, setTargetUser] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [apiStatus, setApiStatus] = useState<string>('');
  
  const connectionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 後端配置
  const BACKEND_CONFIG = {
    httpUrl: 'http://localhost:5019',
    httpsUrl: 'https://localhost:7107',
    chatHub: '/hubs/chathub',
    connectionUserHub: '/hubs/connectionuser',
    apiBase: '/api/chat'
  };

  // 自動滾動到最新訊息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 建立 SignalR 連線
  const connectToHub = async () => {
    if (connection.isConnected) return;
    
    setIsConnecting(true);
    setConnection(prev => ({ ...prev, error: null }));

    try {
      // 動態載入 SignalR 客戶端
      const { HubConnectionBuilder, LogLevel } = await import('@microsoft/signalr');
      
      const hubUrl = `${BACKEND_CONFIG.httpsUrl}${BACKEND_CONFIG.chatHub}`;
      console.log('連接到 Hub:', hubUrl);
      
      const newConnection = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          skipNegotiation: true,
          transport: 1 // WebSocket
        })
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      // 設定事件處理器
      newConnection.on("ReceiveMessage", (user: string, message: string) => {
        const newMsg: SignalRMessage = {
          id: Date.now().toString(),
          user,
          message,
          timestamp: new Date(),
          type: 'chat'
        };
        setMessages(prev => [...prev, newMsg]);
      });

      newConnection.on("UserJoined", (user: string) => {
        const newMsg: SignalRMessage = {
          id: Date.now().toString(),
          user: 'System',
          message: `${user} 加入了聊天室`,
          timestamp: new Date(),
          type: 'system'
        };
        setMessages(prev => [...prev, newMsg]);
      });

      newConnection.on("UserLeft", (user: string) => {
        const newMsg: SignalRMessage = {
          id: Date.now().toString(),
          user: 'System',
          message: `${user} 離開了聊天室`,
          timestamp: new Date(),
          type: 'system'
        };
        setMessages(prev => [...prev, newMsg]);
      });

      newConnection.on("ReceiveNotification", (message: string) => {
        setNotificationCount(prev => prev + 1);
        const newMsg: SignalRMessage = {
          id: Date.now().toString(),
          user: 'Notification',
          message,
          timestamp: new Date(),
          type: 'notification'
        };
        setMessages(prev => [...prev, newMsg]);
      });

      newConnection.on("ReceivePrivateMessage", (sender: string, message: string) => {
        const newMsg: SignalRMessage = {
          id: Date.now().toString(),
          user: sender,
          message: `[私人訊息] ${message}`,
          timestamp: new Date(),
          type: 'private'
        };
        setMessages(prev => [...prev, newMsg]);
      });

      newConnection.on("ReceiveBroadcast", (message: string) => {
        const newMsg: SignalRMessage = {
          id: Date.now().toString(),
          user: 'Broadcast',
          message,
          timestamp: new Date(),
          type: 'broadcast'
        };
        setMessages(prev => [...prev, newMsg]);
      });

      newConnection.on("ReceiveOnlineUsers", (users: OnlineUser[]) => {
        setOnlineUsers(users);
      });

      // 連線事件處理
      newConnection.onclose((error) => {
        console.log('SignalR 連線已關閉:', error);
        setConnection({
          isConnected: false,
          connectionId: null,
          error: error?.message || '連線已關閉'
        });
      });

      // 開始連線
      await newConnection.start();
      
      connectionRef.current = newConnection;
      setConnection({
        isConnected: true,
        connectionId: newConnection.connectionId || null,
        error: null
      });

      console.log('SignalR 連線成功');
      
    } catch (error) {
      console.error('SignalR 連線失敗:', error);
      setConnection({
        isConnected: false,
        connectionId: null,
        error: error instanceof Error ? error.message : '連線失敗'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // 斷開連線
  const disconnectFromHub = async () => {
    if (connectionRef.current) {
      await connectionRef.current.stop();
      connectionRef.current = null;
      setConnection({
        isConnected: false,
        connectionId: null,
        error: null
      });
      console.log('SignalR 連線已斷開');
    }
  };

  // 測試連線
  const testConnection = async () => {
    if (!connection.isConnected) return;

    try {
      await connectionRef.current.invoke("TestConnection");
      console.log('連線測試成功');
    } catch (error) {
      console.error('連線測試失敗:', error);
    }
  };

  // 加入聊天室
  const joinChat = async () => {
    if (!connection.isConnected) return;

    try {
      await connectionRef.current.invoke("JoinChat", userName);
      console.log('已加入聊天室');
    } catch (error) {
      console.error('加入聊天室失敗:', error);
    }
  };

  // 離開聊天室
  const leaveChat = async () => {
    if (!connection.isConnected) return;

    try {
      await connectionRef.current.invoke("LeaveChat", userName);
      console.log('已離開聊天室');
    } catch (error) {
      console.error('離開聊天室失敗:', error);
    }
  };

  // 發送訊息
  const sendMessage = async () => {
    if (!connection.isConnected || !newMessage.trim()) return;

    try {
      await connectionRef.current.invoke("SendMessage", userName, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('發送訊息失敗:', error);
    }
  };

  // 發送私人訊息
  const sendPrivateMessage = async () => {
    if (!connection.isConnected || !privateMessage.trim() || !targetUser.trim()) return;

    try {
      await connectionRef.current.invoke("SendPrivateMessage", targetUser, privateMessage);
      setPrivateMessage('');
    } catch (error) {
      console.error('發送私人訊息失敗:', error);
    }
  };

  // 發送通知
  const sendNotification = async () => {
    if (!connection.isConnected) return;

    try {
      await connectionRef.current.invoke("SendNotification", `來自 ${userName} 的通知: ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error('發送通知失敗:', error);
    }
  };

  // 廣播訊息
  const broadcastMessage = async () => {
    if (!connection.isConnected) return;

    try {
      await connectionRef.current.invoke("BroadcastMessage", `廣播訊息: ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error('廣播失敗:', error);
    }
  };

  // 取得線上用戶
  const getOnlineUsers = async () => {
    if (!connection.isConnected) return;

    try {
      await connectionRef.current.invoke("GetOnlineUsers");
    } catch (error) {
      console.error('取得線上用戶失敗:', error);
    }
  };

  // API 測試函數
  const testApiStatus = async () => {
    try {
      const response = await fetch(`${BACKEND_CONFIG.httpsUrl}${BACKEND_CONFIG.apiBase}/status`);
      const data = await response.json();
      setApiStatus(`API 狀態: ${JSON.stringify(data)}`);
    } catch (error) {
      setApiStatus(`API 錯誤: ${error}`);
    }
  };

  const testApiBroadcast = async () => {
    try {
      const response = await fetch(`${BACKEND_CONFIG.httpsUrl}${BACKEND_CONFIG.apiBase}/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `API 廣播: ${new Date().toLocaleTimeString()}`,
          sender: userName
        })
      });
      const data = await response.json();
      setApiStatus(`API 廣播成功: ${JSON.stringify(data)}`);
    } catch (error) {
      setApiStatus(`API 廣播錯誤: ${error}`);
    }
  };

  const testApiNotification = async () => {
    try {
      const response = await fetch(`${BACKEND_CONFIG.httpsUrl}${BACKEND_CONFIG.apiBase}/notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `API 通知: ${new Date().toLocaleTimeString()}`,
          sender: userName
        })
      });
      const data = await response.json();
      setApiStatus(`API 通知成功: ${JSON.stringify(data)}`);
    } catch (error) {
      setApiStatus(`API 通知錯誤: ${error}`);
    }
  };

  // 清除訊息
  const clearMessages = () => {
    setMessages([]);
    setNotificationCount(0);
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '1400px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <Paper shadow="md" p="xl" radius="md">
        <Stack gap="lg">
          {/* 標題 */}
          <Box>
            <Text size="xl" fw={700} mb="xs">SignalR 測試頁面</Text>
            <Text size="sm" c="dimmed">測試與後端 SignalR Hub 和 API Controller 的連線</Text>
          </Box>

          <Divider />

          {/* 連線設定 */}
          <Paper p="md" withBorder>
            <Stack gap="md">
              <Text fw={600}>連線設定</Text>
              
              <Group gap="md" align="end">
                <TextInput
                  label="用戶名稱"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="測試用戶"
                  style={{ width: '200px' }}
                />
                <TextInput
                  label="Hub URL"
                  value={`${BACKEND_CONFIG.httpsUrl}${BACKEND_CONFIG.chatHub}`}
                  disabled
                  style={{ flex: 1 }}
                />
              </Group>

              <Group gap="md">
                <Button
                  leftSection={connection.isConnected ? <IconWifi size={16} /> : <IconWifiOff size={16} />}
                  color={connection.isConnected ? 'green' : 'blue'}
                  loading={isConnecting}
                  onClick={connection.isConnected ? disconnectFromHub : connectToHub}
                  disabled={isConnecting}
                >
                  {connection.isConnected ? '斷開連線' : '連線到 Hub'}
                </Button>

                {connection.isConnected && (
                  <Badge color="green" variant="light">
                    已連線: {connection.connectionId?.substring(0, 8)}...
                  </Badge>
                )}

                {connection.error && (
                  <Alert color="red" title="連線錯誤">
                    {connection.error}
                  </Alert>
                )}
              </Group>
            </Stack>
          </Paper>

          {/* 主要功能區域 */}
          {connection.isConnected && (
            <Tabs defaultValue="chat">
              <Tabs.List>
                <Tabs.Tab value="chat" leftSection={<IconMessage size={16} />}>
                  聊天室
                </Tabs.Tab>
                <Tabs.Tab value="api" leftSection={<IconApi size={16} />}>
                  API 測試
                </Tabs.Tab>
                <Tabs.Tab value="users" leftSection={<IconUsers size={16} />}>
                  線上用戶
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="chat" pt="md">
                <Paper p="md" withBorder>
                  <Stack gap="md">
                    <Group justify="space-between">
                      <Text fw={600}>聊天室功能</Text>
                      <Group gap="sm">
                        <Button
                          size="sm"
                          variant="outline"
                          leftSection={<IconUsers size={16} />}
                          onClick={joinChat}
                        >
                          加入聊天室
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={leaveChat}
                        >
                          離開聊天室
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          leftSection={<IconBroadcast size={16} />}
                          onClick={broadcastMessage}
                        >
                          廣播訊息
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          leftSection={<IconBell size={16} />}
                          onClick={sendNotification}
                        >
                          發送通知 ({notificationCount})
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          color="red"
                          onClick={clearMessages}
                        >
                          清除訊息
                        </Button>
                      </Group>
                    </Group>

                    {/* 訊息輸入 */}
                    <Group gap="md" align="end">
                      <TextInput
                        placeholder="輸入訊息..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        style={{ flex: 1 }}
                      />
                      <Button
                        leftSection={<IconSend size={16} />}
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                      >
                        發送
                      </Button>
                    </Group>

                    {/* 私人訊息 */}
                    <Group gap="md" align="end">
                      <TextInput
                        placeholder="目標用戶"
                        value={targetUser}
                        onChange={(e) => setTargetUser(e.target.value)}
                        style={{ width: '150px' }}
                      />
                      <TextInput
                        placeholder="私人訊息..."
                        value={privateMessage}
                        onChange={(e) => setPrivateMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendPrivateMessage()}
                        style={{ flex: 1 }}
                      />
                      <Button
                        onClick={sendPrivateMessage}
                        disabled={!privateMessage.trim() || !targetUser.trim()}
                      >
                        發送私人訊息
                      </Button>
                    </Group>
                  </Stack>
                </Paper>
              </Tabs.Panel>

              <Tabs.Panel value="api" pt="md">
                <Paper p="md" withBorder>
                  <Stack gap="md">
                    <Text fw={600}>API Controller 測試</Text>
                    
                    <Group gap="md">
                      <Button
                        leftSection={<IconApi size={16} />}
                        onClick={testApiStatus}
                      >
                        測試 API 狀態
                      </Button>
                      <Button
                        leftSection={<IconBroadcast size={16} />}
                        onClick={testApiBroadcast}
                      >
                        透過 API 廣播
                      </Button>
                      <Button
                        leftSection={<IconBell size={16} />}
                        onClick={testApiNotification}
                      >
                        透過 API 發送通知
                      </Button>
                    </Group>

                    {apiStatus && (
                      <Alert color="blue" title="API 回應">
                        {apiStatus}
                      </Alert>
                    )}
                  </Stack>
                </Paper>
              </Tabs.Panel>

              <Tabs.Panel value="users" pt="md">
                <Paper p="md" withBorder>
                  <Stack gap="md">
                    <Group justify="space-between">
                      <Text fw={600}>線上用戶</Text>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={getOnlineUsers}
                      >
                        重新整理
                      </Button>
                    </Group>

                    {onlineUsers.length === 0 ? (
                      <Text c="dimmed" ta="center" py="xl">
                        尚無線上用戶
                      </Text>
                    ) : (
                      <Group gap="sm">
                        {onlineUsers.map((user, index) => (
                          <Badge key={index} color="blue" variant="light">
                            {user.name}
                          </Badge>
                        ))}
                      </Group>
                    )}
                  </Stack>
                </Paper>
              </Tabs.Panel>
            </Tabs>
          )}

          {/* 訊息列表 */}
          {connection.isConnected && (
            <Paper p="md" withBorder>
              <Text fw={600} mb="md">訊息記錄</Text>
              
              <Box
                style={{
                  height: '400px',
                  overflowY: 'auto',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '10px',
                  backgroundColor: '#f8f9fa'
                }}
              >
                {messages.length === 0 ? (
                  <Text c="dimmed" ta="center" py="xl">
                    尚無訊息，開始聊天吧！
                  </Text>
                ) : (
                  <Stack gap="xs">
                    {messages.map((msg) => (
                      <Box
                        key={msg.id}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: msg.type === 'system' ? '#fff3cd' : 
                                         msg.type === 'notification' ? '#d1ecf1' : 
                                         msg.type === 'private' ? '#f8d7da' :
                                         msg.type === 'broadcast' ? '#d4edda' : '#fff',
                          border: '1px solid #dee2e6',
                          borderRadius: '4px',
                          borderLeft: msg.type === 'system' ? '4px solid #ffc107' :
                                     msg.type === 'notification' ? '4px solid #17a2b8' :
                                     msg.type === 'private' ? '4px solid #dc3545' :
                                     msg.type === 'broadcast' ? '4px solid #28a745' : '4px solid #007bff'
                        }}
                      >
                        <Group justify="space-between" mb="xs">
                          <Text size="sm" fw={600} c={msg.type === 'system' ? '#856404' : 
                                                      msg.type === 'notification' ? '#0c5460' :
                                                      msg.type === 'private' ? '#721c24' :
                                                      msg.type === 'broadcast' ? '#155724' : '#495057'}>
                            {msg.user}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {msg.timestamp.toLocaleTimeString()}
                          </Text>
                        </Group>
                        <Text size="sm">{msg.message}</Text>
                      </Box>
                    ))}
                    <div ref={messagesEndRef} />
                  </Stack>
                )}
              </Box>
            </Paper>
          )}

          {/* 連線狀態資訊 */}
          {connection.isConnected && (
            <Paper p="md" withBorder>
              <Text fw={600} mb="md">連線狀態</Text>
              <Group gap="lg">
                <Box>
                  <Text size="sm" fw={600}>連線 ID:</Text>
                  <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                    {connection.connectionId}
                  </Text>
                </Box>
                <Box>
                  <Text size="sm" fw={600}>訊息數量:</Text>
                  <Text size="xs" c="dimmed">{messages.length}</Text>
                </Box>
                <Box>
                  <Text size="sm" fw={600}>通知數量:</Text>
                  <Text size="xs" c="dimmed">{notificationCount}</Text>
                </Box>
                <Box>
                  <Text size="sm" fw={600}>線上用戶:</Text>
                  <Text size="xs" c="dimmed">{onlineUsers.length}</Text>
                </Box>
              </Group>
            </Paper>
          )}
        </Stack>
      </Paper>
    </div>
  );
} 