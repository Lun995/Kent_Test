'use client'

import React, { useState, useEffect } from 'react'
import { Container, Title, Text, Button, Stack, Alert, Card, Group, Badge, TextInput, Select, Code, Divider } from '@mantine/core'
import { IconWifi, IconWifiOff, IconTestPipe, IconSend, IconServer, IconInfoCircle, IconRefresh, IconMessage } from '@tabler/icons-react'
import signalRTestClient, { SignalREvent } from '../../lib/signalr-test-client'

export default function SignalRTestConnectionUserPage() {
  const [connectionState, setConnectionState] = useState('Disconnected')
  const [connectionInfo, setConnectionInfo] = useState(signalRTestClient.getConnectionInfo())
  const [events, setEvents] = useState<SignalREvent[]>([])
  const [lastEvent, setLastEvent] = useState<SignalREvent | null>(null)
  const [hubUrl, setHubUrl] = useState('http://localhost:5019/hubs/connectionuser')
  const [eventType, setEventType] = useState('SendMessage')
  const [eventData, setEventData] = useState('{"message": "Hello from KDS!", "userId": "test-user"}')
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [testMessage, setTestMessage] = useState('測試訊息')
  const [connectionLogs, setConnectionLogs] = useState<string[]>([])

  // 更新連線狀態
  const updateConnectionState = () => {
    setConnectionState(signalRTestClient.getConnectionState())
    setConnectionInfo(signalRTestClient.getConnectionInfo())
  }

  // 添加連線日誌
  const addConnectionLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setConnectionLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)])
  }

  // 連線到 SignalR Hub
  const handleConnect = async () => {
    setIsConnecting(true)
    addConnectionLog('🔄 正在連線...')
    
    try {
      signalRTestClient.setHubUrl(hubUrl)
      await signalRTestClient.connect()
      updateConnectionState()
      addConnectionLog('✅ 連線成功！')
      addEvent({
        type: 'status_change',
        data: { message: '連線成功', hubUrl },
        timestamp: new Date()
      })
    } catch (error) {
      console.error('連線失敗:', error)
      addConnectionLog(`❌ 連線失敗: ${error}`)
      addEvent({
        type: 'status_change',
        data: { message: `連線失敗: ${error}`, hubUrl },
        timestamp: new Date()
      })
    } finally {
      setIsConnecting(false)
    }
  }

  // 斷線
  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    addConnectionLog('🔄 正在斷線...')
    
    try {
      await signalRTestClient.disconnect()
      updateConnectionState()
      addConnectionLog('✅ 斷線成功')
      addEvent({
        type: 'status_change',
        data: { message: '斷線成功' },
        timestamp: new Date()
      })
    } catch (error) {
      console.error('斷線失敗:', error)
      addConnectionLog(`❌ 斷線失敗: ${error}`)
      addEvent({
        type: 'status_change',
        data: { message: `斷線失敗: ${error}` },
        timestamp: new Date()
      })
    } finally {
      setIsDisconnecting(false)
    }
  }

  // 發送事件
  const handleSendEvent = async () => {
    try {
      const data = JSON.parse(eventData)
      await signalRTestClient.sendEvent(eventType, data)
      addConnectionLog(`📤 發送事件: ${eventType}`)
      addEvent({
        type: eventType as SignalREvent['type'],
        data,
        timestamp: new Date()
      })
    } catch (error) {
      console.error('發送事件失敗:', error)
      addConnectionLog(`❌ 發送事件失敗: ${error}`)
      addEvent({
        type: 'status_change',
        data: { message: `發送事件失敗: ${error}` },
        timestamp: new Date()
      })
    }
  }

  // 發送測試訊息
  const handleSendTestMessage = async () => {
    try {
      await signalRTestClient.sendTestMessage(testMessage)
      addConnectionLog(`📤 發送測試訊息: ${testMessage}`)
      addEvent({
        type: 'status_change',
        data: { message: `測試訊息已發送: ${testMessage}` },
        timestamp: new Date()
      })
    } catch (error) {
      console.error('發送測試訊息失敗:', error)
      addConnectionLog(`❌ 發送測試訊息失敗: ${error}`)
      addEvent({
        type: 'status_change',
        data: { message: `發送測試訊息失敗: ${error}` },
        timestamp: new Date()
      })
    }
  }

  // 測試連線
  const handleTestConnection = async () => {
    addConnectionLog('🧪 開始連線測試...')
    const isConnected = await signalRTestClient.testConnection()
    if (isConnected) {
      addConnectionLog('✅ 連線測試成功')
    } else {
      addConnectionLog('❌ 連線測試失敗')
    }
  }

  // 添加事件到列表
  const addEvent = (event: SignalREvent) => {
    setEvents(prev => [event, ...prev].slice(0, 50)) // 保留最近50個事件
    setLastEvent(event)
  }

  // 訂閱 SignalR 事件
  useEffect(() => {
    const handleOrderUpdate = (event: SignalREvent) => {
      console.log('📡 收到訂單更新事件:', event)
      addEvent(event)
    }

    const handleStatusChange = (event: SignalREvent) => {
      console.log('📡 收到狀態變更事件:', event)
      addEvent(event)
    }

    const handleNewOrder = (event: SignalREvent) => {
      console.log('📡 收到新訂單事件:', event)
      addEvent(event)
    }

    const handleOrderComplete = (event: SignalREvent) => {
      console.log('📡 收到訂單完成事件:', event)
      addEvent(event)
    }

    const handleUndoAction = (event: SignalREvent) => {
      console.log('📡 收到撤銷操作事件:', event)
      addEvent(event)
    }

    const handleRedoAction = (event: SignalREvent) => {
      console.log('📡 收到重做操作事件:', event)
      addEvent(event)
    }

    const handleConnectionUser = (event: SignalREvent) => {
      console.log('📡 收到連接用戶事件:', event)
      addEvent(event)
    }

    // 訂閱所有事件類型
    signalRTestClient.subscribe('order_update', handleOrderUpdate)
    signalRTestClient.subscribe('status_change', handleStatusChange)
    signalRTestClient.subscribe('new_order', handleNewOrder)
    signalRTestClient.subscribe('order_complete', handleOrderComplete)
    signalRTestClient.subscribe('undo_action', handleUndoAction)
    signalRTestClient.subscribe('redo_action', handleRedoAction)
    signalRTestClient.subscribe('connection_user', handleConnectionUser)

    // 定期更新連線狀態
    const interval = setInterval(updateConnectionState, 1000)

    return () => {
      signalRTestClient.unsubscribe('order_update')
      signalRTestClient.unsubscribe('status_change')
      signalRTestClient.unsubscribe('new_order')
      signalRTestClient.unsubscribe('order_complete')
      signalRTestClient.unsubscribe('undo_action')
      signalRTestClient.unsubscribe('redo_action')
      signalRTestClient.unsubscribe('connection_user')
      clearInterval(interval)
    }
  }, [])

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
          SignalR 連線測試 - ConnectionUser Hub
        </Title>
        
        <Text c="dimmed" ta="center">
          測試連線到 http://localhost:5019/hubs/connectionuser
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
              
              <Button
                leftSection={<IconTestPipe size={16} />}
                onClick={handleTestConnection}
                variant="outline"
              >
                測試連線
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
              {connectionInfo.isConnected && (
                <Badge color="blue" size="sm">
                  ID: {connectionInfo.connectionId?.slice(0, 8)}...
                </Badge>
              )}
            </Group>
            
            {connectionInfo.isConnected && (
              <Text size="sm" c="dimmed">
                最後連線時間: {connectionInfo.lastConnected?.toLocaleString()}
              </Text>
            )}
            
            {signalRTestClient.isReconnectingState() && (
              <Alert color="yellow" icon={<IconRefresh size={16} />}>
                正在重新連線... (嘗試 {connectionInfo.reconnectAttempts}/{connectionInfo.maxReconnectAttempts})
              </Alert>
            )}
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

        {/* 發送事件 */}
        <Card withBorder p="md">
          <Title order={3} mb="md">
            <IconSend size={20} style={{ marginRight: 8 }} />
            發送事件
          </Title>
          
          <Stack gap="md">
            <Group grow>
              <Select
                label="事件類型"
                value={eventType}
                onChange={(value) => setEventType(value || 'SendMessage')}
                data={[
                  { value: 'SendMessage', label: 'SendMessage' },
                  { value: 'OrderUpdate', label: 'OrderUpdate' },
                  { value: 'StatusChange', label: 'StatusChange' },
                  { value: 'NewOrder', label: 'NewOrder' },
                  { value: 'OrderComplete', label: 'OrderComplete' },
                  { value: 'UndoAction', label: 'UndoAction' },
                  { value: 'RedoAction', label: 'RedoAction' },
                  { value: 'ConnectionUser', label: 'ConnectionUser' }
                ]}
              />
              
              <TextInput
                label="測試訊息"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="輸入測試訊息"
              />
            </Group>
            
            <TextInput
              label="事件資料 (JSON)"
              value={eventData}
              onChange={(e) => setEventData(e.target.value)}
              placeholder='{"message": "Hello!", "userId": "test"}'
            />
            
            <Group>
              <Button
                leftSection={<IconSend size={16} />}
                onClick={handleSendEvent}
                disabled={!connectionInfo.isConnected}
              >
                發送事件
              </Button>
              
              <Button
                leftSection={<IconMessage size={16} />}
                onClick={handleSendTestMessage}
                disabled={!connectionInfo.isConnected}
                variant="outline"
              >
                發送測試訊息
              </Button>
            </Group>
          </Stack>
        </Card>

        {/* 事件記錄 */}
        <Card withBorder p="md">
          <Title order={3} mb="md">
            📡 事件記錄 ({events.length})
          </Title>
          
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {events.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl">
                尚無事件記錄
              </Text>
            ) : (
              <Stack gap="sm">
                {events.map((event, index) => (
                  <Card key={index} withBorder p="sm">
                    <Group justify="space-between" mb="xs">
                      <Badge color="blue" size="sm">
                        {event.type}
                      </Badge>
                      <Text size="xs" c="dimmed">
                        {event.timestamp.toLocaleTimeString()}
                      </Text>
                    </Group>
                    <Code block>
                      {JSON.stringify(event.data, null, 2)}
                    </Code>
                  </Card>
                ))}
              </Stack>
            )}
          </div>
        </Card>

        {/* 最後事件 */}
        {lastEvent && (
          <Card withBorder p="md">
            <Title order={3} mb="md">
              📡 最後事件
            </Title>
            <Code block>
              {JSON.stringify(lastEvent, null, 2)}
            </Code>
          </Card>
        )}
      </Stack>
    </Container>
  )
} 