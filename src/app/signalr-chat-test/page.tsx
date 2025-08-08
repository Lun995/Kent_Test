'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Container, Title, Text, Button, Stack, Alert, Card, Group, Badge, TextInput, Code, Divider } from '@mantine/core'
import { IconWifi, IconWifiOff, IconSend, IconServer, IconInfoCircle, IconMessage, IconUser } from '@tabler/icons-react'
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr'

export default function SignalRChatTestPage() {
  const [connection, setConnection] = useState<HubConnection | null>(null)
  const [connectionState, setConnectionState] = useState('Disconnected')
  const [messages, setMessages] = useState<Array<{ user: string; message: string; timestamp: Date }>>([])
  const [userInput, setUserInput] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [hubUrl, setHubUrl] = useState('http://localhost:5019/hubs/connectionuser')
  const [connectionLogs, setConnectionLogs] = useState<string[]>([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 添加連線日誌
  const addConnectionLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setConnectionLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)])
  }

  // 滾動到最新訊息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 建立 SignalR 連線
  const createConnection = () => {
    const newConnection = new HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(LogLevel.Information)
      .build()

    // 設置事件處理器
    newConnection.onreconnecting((error) => {
      console.log('🔄 SignalR 重新連線中...', error)
      setConnectionState('Reconnecting')
      addConnectionLog('🔄 重新連線中...')
    })

    newConnection.onreconnected((connectionId) => {
      console.log('✅ SignalR 重新連線成功！ConnectionId:', connectionId)
      setConnectionState('Connected')
      addConnectionLog(`✅ 重新連線成功！ID: ${connectionId}`)
    })

    newConnection.onclose((error) => {
      console.log('❌ SignalR 連線關閉', error)
      setConnectionState('Disconnected')
      addConnectionLog('❌ 連線關閉')
    })

    // 監聽 ReceiveMessage 事件 (參考文章範例)
    newConnection.on('ReceiveMessage', (user: string, message: string) => {
      console.log('📡 收到訊息:', user, message)
      const newMessage = {
        user,
        message,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, newMessage])
      addConnectionLog(`📡 收到訊息: ${user}: ${message}`)
    })

    // 監聽其他可能的事件
    newConnection.on('OrderUpdate', (data: any) => {
      console.log('📡 收到訂單更新:', data)
      addConnectionLog(`📡 收到訂單更新: ${JSON.stringify(data)}`)
    })

    newConnection.on('StatusChange', (data: any) => {
      console.log('📡 收到狀態變更:', data)
      addConnectionLog(`📡 收到狀態變更: ${JSON.stringify(data)}`)
    })

    newConnection.on('ConnectionUser', (data: any) => {
      console.log('📡 收到連接用戶事件:', data)
      addConnectionLog(`📡 收到連接用戶事件: ${JSON.stringify(data)}`)
    })

    setConnection(newConnection)
    return newConnection
  }

  // 連線到 SignalR Hub
  const handleConnect = async () => {
    setIsConnecting(true)
    addConnectionLog('🔄 正在連線...')
    
    try {
      const newConnection = createConnection()
      await newConnection.start()
      setConnectionState('Connected')
      addConnectionLog('✅ 連線成功！')
      
      // 發送連接通知
      await newConnection.invoke('SendMessage', 'System', `用戶已連接 - ${new Date().toLocaleTimeString()}`)
    } catch (error) {
      console.error('連線失敗:', error)
      addConnectionLog(`❌ 連線失敗: ${error}`)
      setConnectionState('Disconnected')
    } finally {
      setIsConnecting(false)
    }
  }

  // 斷線
  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    addConnectionLog('🔄 正在斷線...')
    
    try {
      if (connection) {
        await connection.stop()
        setConnection(null)
        setConnectionState('Disconnected')
        addConnectionLog('✅ 斷線成功')
      }
    } catch (error) {
      console.error('斷線失敗:', error)
      addConnectionLog(`❌ 斷線失敗: ${error}`)
    } finally {
      setIsDisconnecting(false)
    }
  }

  // 發送訊息 (參考文章範例)
  const handleSendMessage = async () => {
    if (!connection || connection.state !== 'Connected') {
      addConnectionLog('❌ 未連線，無法發送訊息')
      return
    }

    if (!userInput.trim() || !messageInput.trim()) {
      addConnectionLog('❌ 請輸入用戶名稱和訊息')
      return
    }

    try {
      // 參考文章範例的 SendMessage 方法
      await connection.invoke('SendMessage', userInput, messageInput)
      addConnectionLog(`📤 發送訊息: ${userInput}: ${messageInput}`)
      
      // 清空訊息輸入框
      setMessageInput('')
    } catch (error) {
      console.error('發送訊息失敗:', error)
      addConnectionLog(`❌ 發送訊息失敗: ${error}`)
    }
  }

  // 發送測試事件
  const handleSendTestEvent = async (eventType: string, data: any) => {
    if (!connection || connection.state !== 'Connected') {
      addConnectionLog('❌ 未連線，無法發送事件')
      return
    }

    try {
      await connection.invoke(eventType, data)
      addConnectionLog(`📤 發送事件: ${eventType}`)
    } catch (error) {
      console.error('發送事件失敗:', error)
      addConnectionLog(`❌ 發送事件失敗: ${error}`)
    }
  }

  // 清空訊息
  const handleClearMessages = () => {
    setMessages([])
    addConnectionLog('🗑️ 清空訊息記錄')
  }

  const getStateColor = (state: string) => {
    switch (state) {
      case 'Connected': return 'green'
      case 'Connecting': return 'yellow'
      case 'Reconnecting': return 'orange'
      case 'Disconnected': return 'red'
      default: return 'gray'
    }
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* 標題 */}
        <Title order={1} ta="center">
          SignalR 聊天測試 - 參考 iT邦幫忙文章
        </Title>
        
        <Text c="dimmed" ta="center">
          基於 https://ithelp.ithome.com.tw/articles/10348848 的 SignalR 聊天範例
        </Text>

        {/* 連線設定 */}
        <Card withBorder p="md">
          <Title order={3} mb="md">
            <IconServer size={20} style={{ marginRight: 8 }} />
            連線設定
          </Title>
          
          <Stack gap="md">
            <TextInput
              label="Hub URL"
              value={hubUrl}
              onChange={(e) => setHubUrl(e.target.value)}
              placeholder="http://localhost:5019/hubs/connectionuser"
              description="SignalR Hub 的完整 URL"
            />
            
            <Group>
              <Button
                leftSection={<IconWifi size={16} />}
                onClick={handleConnect}
                loading={isConnecting}
                disabled={isDisconnecting}
                color="green"
              >
                連線
              </Button>
              
              <Button
                leftSection={<IconWifiOff size={16} />}
                onClick={handleDisconnect}
                loading={isDisconnecting}
                disabled={isConnecting}
                color="red"
              >
                斷線
              </Button>
            </Group>
          </Stack>
        </Card>

        {/* 連線狀態 */}
        <Card withBorder p="md">
          <Title order={3} mb="md">
            <IconInfoCircle size={20} style={{ marginRight: 8 }} />
            連線狀態
          </Title>
          
          <Stack gap="sm">
            <Group>
              <Badge color={getStateColor(connectionState)} size="lg">
                {connectionState}
              </Badge>
              {connection?.connectionId && (
                <Badge color="blue" size="sm">
                  ID: {connection.connectionId.slice(0, 8)}...
                </Badge>
              )}
            </Group>
          </Stack>
        </Card>

        {/* 聊天介面 (參考文章範例) */}
        <Card withBorder p="md">
          <Title order={3} mb="md">
            <IconMessage size={20} style={{ marginRight: 8 }} />
            聊天介面
          </Title>
          
          <Stack gap="md">
            <Group grow>
              <TextInput
                label="用戶名稱"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="輸入您的用戶名稱"
                leftSection={<IconUser size={16} />}
              />
              
              <TextInput
                label="訊息"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="輸入訊息"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage()
                  }
                }}
                leftSection={<IconMessage size={16} />}
              />
            </Group>
            
            <Group>
              <Button
                leftSection={<IconSend size={16} />}
                onClick={handleSendMessage}
                disabled={!connection || connection.state !== 'Connected'}
              >
                發送訊息
              </Button>
              
              <Button
                onClick={handleClearMessages}
                variant="outline"
                color="gray"
              >
                清空訊息
              </Button>
            </Group>
          </Stack>
        </Card>

        {/* 訊息列表 (參考文章範例) */}
        <Card withBorder p="md">
          <Title order={3} mb="md">
            📨 訊息列表 ({messages.length})
          </Title>
          
          <div style={{ 
            maxHeight: '400px', 
            overflowY: 'auto', 
            backgroundColor: '#f8f9fa', 
            padding: '12px', 
            borderRadius: '4px',
            border: '1px solid #dee2e6'
          }}>
            {messages.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl">
                尚無訊息記錄
              </Text>
            ) : (
              <Stack gap="sm">
                {messages.map((msg, index) => (
                  <div key={index} style={{
                    padding: '8px 12px',
                    backgroundColor: msg.user === 'System' ? '#e3f2fd' : '#fff',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    marginBottom: '8px'
                  }}>
                    <Group justify="space-between" mb="xs">
                      <Badge 
                        color={msg.user === 'System' ? 'blue' : 'green'} 
                        size="sm"
                        leftSection={<IconUser size={12} />}
                      >
                        {msg.user}
                      </Badge>
                      <Text size="xs" c="dimmed">
                        {msg.timestamp.toLocaleTimeString()}
                      </Text>
                    </Group>
                    <Text size="sm">
                      {msg.message}
                    </Text>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </Stack>
            )}
          </div>
        </Card>

        {/* 測試事件 */}
        <Card withBorder p="md">
          <Title order={3} mb="md">
            🧪 測試事件
          </Title>
          
          <Stack gap="md">
            <Group>
              <Button
                onClick={() => handleSendTestEvent('OrderUpdate', { orderId: 'test-001', status: 'pending' })}
                disabled={!connection || connection.state !== 'Connected'}
                variant="outline"
                size="sm"
              >
                測試 OrderUpdate
              </Button>
              
              <Button
                onClick={() => handleSendTestEvent('StatusChange', { status: 'active', timestamp: new Date().toISOString() })}
                disabled={!connection || connection.state !== 'Connected'}
                variant="outline"
                size="sm"
              >
                測試 StatusChange
              </Button>
              
              <Button
                onClick={() => handleSendTestEvent('ConnectionUser', { userId: 'test-user', action: 'connect' })}
                disabled={!connection || connection.state !== 'Connected'}
                variant="outline"
                size="sm"
              >
                測試 ConnectionUser
              </Button>
            </Group>
          </Stack>
        </Card>

        {/* 連線日誌 */}
        <Card withBorder p="md">
          <Title order={3} mb="md">
            <IconInfoCircle size={20} style={{ marginRight: 8 }} />
            連線日誌
          </Title>
          
          <div style={{ 
            maxHeight: '200px', 
            overflowY: 'auto', 
            backgroundColor: '#f8f9fa', 
            padding: '8px', 
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}>
            {connectionLogs.length === 0 ? (
              <Text c="dimmed">尚無日誌記錄</Text>
            ) : (
              connectionLogs.map((log, index) => (
                <div key={index} style={{ marginBottom: '2px' }}>
                  {log}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* 使用說明 */}
        <Card withBorder p="md">
          <Title order={3} mb="md">
            📖 使用說明
          </Title>
          
          <Stack gap="sm">
            <Text size="sm">
              <strong>參考文章：</strong> 
              <a href="https://ithelp.ithome.com.tw/articles/10348848" target="_blank" rel="noopener noreferrer">
                ASP.NET Core的終極奧義：從零到無敵系列 - Day_16 使用SignalR實現即時通訊
              </a>
            </Text>
            
            <Text size="sm">
              <strong>測試步驟：</strong>
            </Text>
            
            <Code block>
{`1. 確保您的 SignalR 伺服器在 ${hubUrl} 運行
2. 點擊「連線」按鈕建立連線
3. 輸入用戶名稱和訊息，點擊「發送訊息」
4. 觀察訊息是否即時顯示
5. 可以開啟多個瀏覽器視窗測試即時通訊`}
            </Code>
            
            <Text size="sm">
              <strong>預期的 Hub 方法：</strong>
            </Text>
            
            <Code block>
{`// 伺服器端 Hub 方法 (參考文章範例)
public class ChatHub : Hub
{
    public async Task SendMessage(string user, string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }
}`}
            </Code>
          </Stack>
        </Card>
      </Stack>
    </Container>
  )
} 