'use client'

import React, { useState } from 'react'
import { 
  Container, 
  Title, 
  Text, 
  Button, 
  Stack, 
  Alert, 
  Card, 
  Group, 
  Badge, 
  TextInput, 
  Paper,
  Divider
} from '@mantine/core'
import { 
  IconWifi, 
  IconWifiOff, 
  IconSend, 
  IconServer, 
  IconInfoCircle,
  IconUser,
  IconLogout,
  IconMessage,
  IconBell
} from '@tabler/icons-react'
import { useGlobalContext } from '../../context/GlobalContext'
import SignalRService from '../../lib/SignalRService'

export default function SignalRTestNewPage() {
  const { userState, signalRState, signalRDispatch } = useGlobalContext()
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')
  const [notification, setNotification] = useState('')
  const [groupName, setGroupName] = useState('')
  const [connectionLog, setConnectionLog] = useState<string[]>([])

  // 添加日誌
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = `[${timestamp}] ${message}`
    setConnectionLog(prev => [...prev, logEntry].slice(-20))
  }

  // 處理登入
  const handleLogin = async () => {
    if (!username.trim()) {
      alert('請輸入用戶名')
      return
    }
    
    addLog(`用戶登入: ${username}`)
    addLog('正在建立 SignalR 連線...')
    
    try {
      const signalRService = new SignalRService(username, signalRDispatch)
      signalRService.createUserRoomConnection()
      
      const success = await signalRService.startConnection()
      if (success) {
        addLog('✅ SignalR 連線成功')
        signalRDispatch({ type: "SET_SIGNALR_SERVICE", payload: signalRService })
      } else {
        addLog('❌ SignalR 連線失敗')
        addLog('💡 請檢查瀏覽器控制台的詳細錯誤信息')
        addLog('💡 建議運行: node diagnose-signalr.js')
      }
    } catch (error: any) {
      addLog(`❌ 連線錯誤: ${error.message}`)
      addLog('💡 請查看瀏覽器控制台獲取詳細信息')
    }
  }

  // 處理登出
  const handleLogout = async () => {
    if (signalRState.signalRService) {
      addLog('用戶登出')
      await signalRState.signalRService.removeUserConnection()
      signalRDispatch({ type: "REMOVE_SIGNALR_CONNECTION", payload: null })
    }
  }

  // 發送消息
  const handleSendMessage = async () => {
    if (!signalRState.signalRService || !message.trim()) return

    try {
      await signalRState.signalRService.sendMessage({
        message: message,
        username: userState.username,
        timestamp: new Date().toISOString()
      })
      addLog(`發送消息: ${message}`)
      setMessage('')
    } catch (error) {
      addLog(`發送消息失敗: ${error}`)
    }
  }

  // 發送通知
  const handleSendNotification = async () => {
    if (!signalRState.signalRService || !notification.trim()) return

    try {
      await signalRState.signalRService.sendNotification({
        title: '測試通知',
        content: notification,
        timestamp: new Date().toISOString()
      })
      addLog(`發送通知: ${notification}`)
      setNotification('')
    } catch (error) {
      addLog(`發送通知失敗: ${error}`)
    }
  }

  // 加入群組
  const handleJoinGroup = async () => {
    if (!signalRState.signalRService || !groupName.trim()) return

    try {
      await signalRState.signalRService.joinGroup(groupName)
      addLog(`加入群組: ${groupName}`)
      setGroupName('')
    } catch (error) {
      addLog(`加入群組失敗: ${error}`)
    }
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
      <Stack gap="xl">
        <Title>SignalR 測試頁面 (新架構)</Title>
        <Text c="dimmed">基於參考文章的 SignalR 實作</Text>

        {/* 用戶登入區域 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group>
              <IconUser size={20} />
              <Title order={3}>用戶登入</Title>
            </Group>
            
            {!userState.isLoggedIn ? (
              <Group>
                <TextInput
                  placeholder="輸入用戶名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ flex: 1 }}
                />
                <Button
                  leftSection={<IconUser size={16} />}
                  onClick={handleLogin}
                  color="green"
                >
                  登入
                </Button>
              </Group>
            ) : (
              <Group>
                <Badge color="green" leftSection={<IconUser size={12} />}>
                  已登入: {userState.username}
                </Badge>
                <Button
                  leftSection={<IconLogout size={16} />}
                  onClick={handleLogout}
                  color="red"
                  variant="outline"
                >
                  登出
                </Button>
              </Group>
            )}
          </Stack>
        </Card>

        {/* SignalR 連線狀態 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group>
              <IconServer size={20} />
              <Title order={3}>SignalR 連線狀態</Title>
            </Group>
            
            {signalRState.signalRService ? (
              <Group>
                <Badge 
                  color={getStateColor(signalRState.signalRService.getConnectionState())}
                  leftSection={<IconWifi size={12} />}
                  size="lg"
                >
                  {signalRState.signalRService.getConnectionState()}
                </Badge>
                
                {signalRState.signalRService.getConnectionId() && (
                  <Badge color="blue">
                    ID: {signalRState.signalRService.getConnectionId()}
                  </Badge>
                )}
              </Group>
            ) : (
              <Alert color="gray" icon={<IconInfoCircle size={16} />}>
                尚未建立 SignalR 連線
              </Alert>
            )}
          </Stack>
        </Card>

        {/* 消息發送 */}
        {signalRState.signalRService && (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Group>
                <IconMessage size={20} />
                <Title order={3}>發送消息</Title>
              </Group>
              
              <Group>
                <TextInput
                  placeholder="輸入消息內容"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ flex: 1 }}
                />
                <Button
                  leftSection={<IconSend size={16} />}
                  onClick={handleSendMessage}
                  disabled={!signalRState.signalRService.isConnected()}
                  color="blue"
                >
                  發送消息
                </Button>
              </Group>
            </Stack>
          </Card>
        )}

        {/* 通知發送 */}
        {signalRState.signalRService && (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Group>
                <IconBell size={20} />
                <Title order={3}>發送通知</Title>
              </Group>
              
              <Group>
                <TextInput
                  placeholder="輸入通知內容"
                  value={notification}
                  onChange={(e) => setNotification(e.target.value)}
                  style={{ flex: 1 }}
                />
                <Button
                  leftSection={<IconBell size={16} />}
                  onClick={handleSendNotification}
                  disabled={!signalRState.signalRService.isConnected()}
                  color="orange"
                >
                  發送通知
                </Button>
              </Group>
            </Stack>
          </Card>
        )}

        {/* 群組管理 */}
        {signalRState.signalRService && (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Title order={3}>群組管理</Title>
              
              <Group>
                <TextInput
                  placeholder="輸入群組名稱"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  style={{ flex: 1 }}
                />
                <Button
                  onClick={handleJoinGroup}
                  disabled={!signalRState.signalRService.isConnected()}
                  color="purple"
                >
                  加入群組
                </Button>
              </Group>
            </Stack>
          </Card>
        )}

        {/* 連線日誌 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3}>連線日誌 ({connectionLog.length})</Title>
            
            <Paper 
              p="md" 
              withBorder 
              style={{ 
                maxHeight: '300px', 
                overflowY: 'auto',
                backgroundColor: '#f8f9fa'
              }}
            >
              {connectionLog.length === 0 ? (
                <Text size="sm" c="dimmed" ta="center">尚無日誌記錄</Text>
              ) : (
                connectionLog.map((log, index) => (
                  <Text key={index} size="xs" style={{ fontFamily: 'monospace' }}>
                    {log}
                  </Text>
                ))
              )}
            </Paper>
          </Stack>
        </Card>

        {/* 使用說明 */}
        <Alert color="blue" title="使用說明" icon={<IconInfoCircle size={16} />}>
          <Text size="sm">
            這個測試頁面基於參考文章的架構實作：
          </Text>
          <Text size="xs" mt="xs">
            • 使用 SignalRService 類管理連線<br/>
            • 通過 Context 管理全局狀態<br/>
            • 支持用戶登入/登出時自動連線/斷線<br/>
            • 提供消息發送、通知發送、群組管理功能<br/>
                         • 目標站台: http://localhost:5019/hubs/connectionuser
          </Text>
        </Alert>
      </Stack>
    </Container>
  )
} 