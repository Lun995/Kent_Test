'use client'

import React, { useState, useEffect } from 'react'
import { Container, Title, Text, Button, Stack, Alert, Card, Group, Badge, TextInput, Select } from '@mantine/core'
import { IconWifi, IconWifiOff, IconTestPipe, IconSend, IconServer, IconInfoCircle, IconSettings } from '@tabler/icons-react'
import signalRRealClient, { SignalREvent } from '../../lib/signalr-real-client'

export default function SignalRRealTestPage() {
  const [connectionState, setConnectionState] = useState('Disconnected')
  const [connectionInfo, setConnectionInfo] = useState(signalRRealClient.getConnectionInfo())
  const [events, setEvents] = useState<SignalREvent[]>([])
  const [lastEvent, setLastEvent] = useState<SignalREvent | null>(null)
  const [hubUrl, setHubUrl] = useState('https://localhost:7001/signalrhub')
  const [eventType, setEventType] = useState('order_update')
  const [eventData, setEventData] = useState('{"orderId": "test-001", "status": "pending"}')
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // 更新連線狀態
  const updateConnectionState = () => {
    setConnectionState(signalRRealClient.getConnectionState())
    setConnectionInfo(signalRRealClient.getConnectionInfo())
  }

  // 連線到 SignalR Hub
  const handleConnect = async () => {
    setIsConnecting(true)
    setConnectionError(null)
    
    try {
      // 設置新的 Hub URL
      signalRRealClient.setHubUrl(hubUrl)
      
      await signalRRealClient.connect()
      updateConnectionState()
      addEvent({
        type: 'status_change',
        data: { message: '連線成功' },
        timestamp: new Date()
      })
    } catch (error) {
      console.error('連線失敗:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      setConnectionError(errorMessage)
      addEvent({
        type: 'status_change',
        data: { message: `連線失敗: ${errorMessage}` },
        timestamp: new Date()
      })
    } finally {
      setIsConnecting(false)
    }
  }

  // 斷線
  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      await signalRRealClient.disconnect()
      updateConnectionState()
      addEvent({
        type: 'status_change',
        data: { message: '斷線成功' },
        timestamp: new Date()
      })
    } catch (error) {
      console.error('斷線失敗:', error)
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
      await signalRRealClient.sendEvent(eventType, data)
      addEvent({
        type: eventType as SignalREvent['type'],
        data,
        timestamp: new Date()
      })
    } catch (error) {
      console.error('發送事件失敗:', error)
      addEvent({
        type: 'status_change',
        data: { message: `發送事件失敗: ${error}` },
        timestamp: new Date()
      })
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

    // 訂閱各種事件
    signalRRealClient.subscribe('order_update', handleOrderUpdate)
    signalRRealClient.subscribe('status_change', handleStatusChange)
    signalRRealClient.subscribe('new_order', handleNewOrder)
    signalRRealClient.subscribe('order_complete', handleOrderComplete)

    // 定期更新連線狀態
    const interval = setInterval(updateConnectionState, 1000)

    return () => {
      signalRRealClient.unsubscribe('order_update')
      signalRRealClient.unsubscribe('status_change')
      signalRRealClient.unsubscribe('new_order')
      signalRRealClient.unsubscribe('order_complete')
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
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Title>真正的 SignalR 測試頁面</Title>
        <Text>連線到實際的 SignalR Hub，測試真正的即時通訊</Text>

        {/* 連線配置 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3}>連線配置</Title>
            
            <TextInput
              label="SignalR Hub URL"
              value={hubUrl}
              onChange={(e) => setHubUrl(e.target.value)}
              placeholder="https://localhost:7001/signalrhub"
              description="您的 SignalR Hub 的完整 URL"
              leftSection={<IconSettings size={16} />}
            />

            <Group>
              <Button
                leftSection={<IconWifi size={16} />}
                onClick={handleConnect}
                disabled={connectionState === 'Connected' || isConnecting}
                loading={isConnecting}
                color="green"
              >
                {isConnecting ? '連線中...' : '連線'}
              </Button>
              
              <Button
                leftSection={<IconWifiOff size={16} />}
                onClick={handleDisconnect}
                disabled={connectionState !== 'Connected' || isDisconnecting}
                loading={isDisconnecting}
                color="red"
              >
                {isDisconnecting ? '斷線中...' : '斷線'}
              </Button>
            </Group>

            {connectionError && (
              <Alert color="red" title="連線錯誤">
                <Text size="sm">{connectionError}</Text>
              </Alert>
            )}
          </Stack>
        </Card>

        {/* 連線狀態 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3}>連線狀態</Title>
            
            <Group>
              <Badge 
                color={getStateColor(connectionState)}
                leftSection={connectionState === 'Connected' ? <IconWifi size={12} /> : <IconWifiOff size={12} />}
                size="lg"
              >
                {connectionState}
              </Badge>
              
              {connectionInfo.connectionId && (
                <Badge color="blue">
                  ID: {connectionInfo.connectionId}
                </Badge>
              )}
              
              <Badge color="gray">
                重連次數: {connectionInfo.reconnectAttempts}
              </Badge>
            </Group>

            <Alert icon={<IconInfoCircle size={16} />} color="blue">
              <Text size="sm">
                連線狀態: {JSON.stringify(connectionInfo, null, 2)}
              </Text>
            </Alert>
          </Stack>
        </Card>

        {/* 發送事件 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3}>發送事件</Title>
            
            <Group>
              <Select
                label="事件類型"
                value={eventType}
                onChange={(value) => setEventType(value || 'order_update')}
                data={[
                  { value: 'order_update', label: '訂單更新' },
                  { value: 'status_change', label: '狀態變更' },
                  { value: 'new_order', label: '新訂單' },
                  { value: 'order_complete', label: '訂單完成' }
                ]}
                style={{ flex: 1 }}
              />
              
              <Button
                leftSection={<IconSend size={16} />}
                onClick={handleSendEvent}
                disabled={connectionState !== 'Connected'}
                color="blue"
              >
                發送事件
              </Button>
            </Group>

            <TextInput
              label="事件數據 (JSON)"
              value={eventData}
              onChange={(e) => setEventData(e.target.value)}
              placeholder='{"orderId": "test-001", "status": "pending"}'
            />
          </Stack>
        </Card>

        {/* 最後收到的事件 */}
        {lastEvent && (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Title order={3}>最後收到的事件</Title>
              
              <Alert color="green">
                <Text size="sm" fw={500}>事件類型: {lastEvent.type}</Text>
                <Text size="xs" c="dimmed" mt="xs" style={{ fontFamily: 'monospace' }}>
                  {JSON.stringify(lastEvent, null, 2)}
                </Text>
              </Alert>
            </Stack>
          </Card>
        )}

        {/* 事件記錄 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3}>事件記錄 ({events.length})</Title>
            
            <div style={{ 
              maxHeight: '400px', 
              overflowY: 'auto', 
              backgroundColor: '#f5f5f5', 
              padding: '10px',
              borderRadius: '8px'
            }}>
              {events.length === 0 ? (
                <Text size="sm" c="dimmed" ta="center">尚無事件記錄</Text>
              ) : (
                events.map((event, index) => (
                  <div key={index} style={{ 
                    marginBottom: '10px', 
                    padding: '8px', 
                    backgroundColor: 'white', 
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Badge color="blue" size="sm">
                        {event.type}
                      </Badge>
                      <Text size="xs" c="dimmed">
                        {event.timestamp.toLocaleTimeString()}
                      </Text>
                    </div>
                    <Text size="xs" style={{ fontFamily: 'monospace', marginTop: '4px' }}>
                      {JSON.stringify(event.data, null, 2)}
                    </Text>
                  </div>
                ))
              )}
            </div>
          </Stack>
        </Card>

        {/* 說明 */}
        <Alert color="blue" title="使用說明">
          <Text size="sm">
            這個頁面連線到真正的 SignalR Hub：
          </Text>
          <Text size="xs" mt="xs">
            • 需要運行 SignalR Hub 服務器<br/>
            • 支持自動重連和事件訂閱<br/>
            • 可以發送和接收即時事件<br/>
            • 顯示詳細的連線狀態和事件記錄<br/>
            • 可以連線到您的實際 SignalR 後端
          </Text>
        </Alert>

        {/* 常見問題 */}
        <Alert color="yellow" title="常見問題">
          <Text size="sm">
            如果連線失敗，請檢查：
          </Text>
          <Text size="xs" mt="xs">
            • SignalR Hub 是否正在運行<br/>
            • Hub URL 是否正確<br/>
            • 是否有 CORS 配置問題<br/>
            • 網路連線是否正常<br/>
            • Hub 方法名稱是否與後端一致
          </Text>
        </Alert>
      </Stack>
    </Container>
  )
} 