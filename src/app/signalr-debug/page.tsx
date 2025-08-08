'use client'

import React, { useState } from 'react'
import { Container, Title, Text, Button, Stack, Alert, Card, Group, Badge } from '@mantine/core'
import { IconWifi, IconWifiOff, IconTestPipe } from '@tabler/icons-react'
import { useSignalRMock } from '../../lib/signalr-mock'

export default function SignalRDebugPage() {
  const {
    connection,
    connect,
    disconnect,
    getConnectionStatus
  } = useSignalRMock()

  const [debugLog, setDebugLog] = useState<string[]>([])

  const addLog = (message: string) => {
    setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const handleConnect = async () => {
    addLog('🔄 開始連線...')
    try {
      await connect()
      addLog('✅ 連線成功')
    } catch (error) {
      addLog(`❌ 連線失敗: ${error}`)
    }
  }

  const handleDisconnect = () => {
    addLog('🔄 開始斷線...')
    try {
      disconnect()
      addLog('✅ 斷線成功')
    } catch (error) {
      addLog(`❌ 斷線失敗: ${error}`)
    }
  }

  const connectionStatus = getConnectionStatus()

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Title>SignalR 調試頁面</Title>
        <Text>用於診斷 SignalR 連線問題</Text>

        {/* 連線狀態 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3}>連線狀態</Title>
            
            <Group>
              <Badge 
                color={connection.isConnected ? "green" : "red"}
                leftSection={connection.isConnected ? <IconWifi size={12} /> : <IconWifiOff size={12} />}
              >
                {connection.isConnected ? '已連線' : '未連線'}
              </Badge>
              
              <Badge color="blue">
                狀態: {connectionStatus}
              </Badge>
              
              {connection.connectionId && (
                <Badge color="gray">
                  ID: {connection.connectionId}
                </Badge>
              )}
            </Group>

            <Text size="sm">
              連線狀態: {JSON.stringify(connection, null, 2)}
            </Text>
          </Stack>
        </Card>

        {/* 控制按鈕 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3}>控制按鈕</Title>
            
            <Group>
              <Button
                leftSection={<IconWifi size={16} />}
                onClick={handleConnect}
                disabled={connection.isConnected}
                color="green"
              >
                連線
              </Button>
              
              <Button
                leftSection={<IconWifiOff size={16} />}
                onClick={handleDisconnect}
                disabled={!connection.isConnected}
                color="red"
              >
                斷線
              </Button>
              
              <Button
                onClick={() => {
                  addLog('🔄 強制重新渲染...')
                  setDebugLog(prev => [...prev])
                }}
                variant="light"
                color="blue"
              >
                強制更新
              </Button>
            </Group>
          </Stack>
        </Card>

        {/* 調試日誌 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3}>調試日誌</Title>
            
            <div style={{ 
              maxHeight: '300px', 
              overflowY: 'auto', 
              backgroundColor: '#f5f5f5', 
              padding: '10px',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}>
              {debugLog.length === 0 ? (
                <Text size="sm" c="dimmed">尚無日誌</Text>
              ) : (
                debugLog.map((log, index) => (
                  <div key={index} style={{ marginBottom: '5px' }}>
                    {log}
                  </div>
                ))
              )}
            </div>
            
            <Button
              size="sm"
              onClick={() => setDebugLog([])}
              variant="light"
            >
              清除日誌
            </Button>
          </Stack>
        </Card>

        {/* 問題診斷 */}
        <Alert color="blue" title="問題診斷">
          <Text size="sm">
            如果連線按鈕沒有反應，可能的原因：
          </Text>
          <Text size="xs" mt="xs">
            • Zustand store 沒有正確更新<br/>
            • React 組件沒有重新渲染<br/>
            • 事件處理器沒有正確綁定<br/>
            • 瀏覽器控制台可能有錯誤
          </Text>
        </Alert>
      </Stack>
    </Container>
  )
} 