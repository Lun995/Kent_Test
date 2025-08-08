'use client'

import React from 'react'
import { Container, Title, Text, Stack, Card, Group, Button, Badge, Alert } from '@mantine/core'
import { IconWifi, IconTestPipe, IconServer, IconBrandReact } from '@tabler/icons-react'
import Link from 'next/link'

export default function SignalRNavPage() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Title>SignalR 測試導航</Title>
        <Text>選擇不同的 SignalR 測試頁面</Text>

        {/* 真正的 SignalR 測試 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3}>真正的 SignalR 測試</Title>
              <Badge color="green" leftSection={<IconWifi size={12} />}>
                推薦
              </Badge>
            </Group>
            
            <Text size="sm" c="dimmed">
              連線到實際的 SignalR Hub，測試真正的即時通訊功能
            </Text>

            <Group>
              <Link href="/signalr-real-test" style={{ textDecoration: 'none' }}>
                <Button
                  leftSection={<IconServer size={16} />}
                  color="green"
                  variant="filled"
                >
                  真正的 SignalR 測試
                </Button>
              </Link>
            </Group>

            <Alert color="green" title="功能特點">
              <Text size="xs">
                ✅ 連線到實際的 SignalR Hub<br/>
                ✅ 支持自動重連<br/>
                ✅ 可以發送和接收即時事件<br/>
                ✅ 顯示詳細的連線狀態<br/>
                ✅ 錯誤處理和診斷
              </Text>
            </Alert>
          </Stack>
        </Card>

        {/* Socket.IO 模擬測試 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3}>Socket.IO 模擬測試</Title>
              <Badge color="blue" leftSection={<IconTestPipe size={12} />}>
                模擬
              </Badge>
            </Group>
            
            <Text size="sm" c="dimmed">
              使用 Socket.IO 模擬 SignalR 功能，適合開發和原型設計
            </Text>

            <Group>
              <Link href="/socketio-test" style={{ textDecoration: 'none' }}>
                <Button
                  leftSection={<IconTestPipe size={16} />}
                  color="blue"
                  variant="light"
                >
                  Socket.IO 模擬測試
                </Button>
              </Link>
            </Group>

            <Alert color="blue" title="功能特點">
              <Text size="xs">
                ✅ 完全在 React 專案內完成<br/>
                ✅ 不需要額外的後端專案<br/>
                ✅ 可以快速測試前端邏輯<br/>
                ✅ 適合開發和原型設計<br/>
                ✅ 完全免費
              </Text>
            </Alert>
          </Stack>
        </Card>

        {/* 其他測試頁面 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3}>其他測試頁面</Title>
            
            <Group>
              <Link href="/signalr-test" style={{ textDecoration: 'none' }}>
                <Button
                  leftSection={<IconBrandReact size={16} />}
                  variant="outline"
                  color="gray"
                >
                  SignalR 模擬測試
                </Button>
              </Link>

              <Link href="/signalr-debug" style={{ textDecoration: 'none' }}>
                <Button
                  leftSection={<IconTestPipe size={16} />}
                  variant="outline"
                  color="gray"
                >
                  SignalR 調試頁面
                </Button>
              </Link>

              <Link href="/test-simple" style={{ textDecoration: 'none' }}>
                <Button
                  leftSection={<IconTestPipe size={16} />}
                  variant="outline"
                  color="gray"
                >
                  簡單測試頁面
                </Button>
              </Link>
            </Group>
          </Stack>
        </Card>

        {/* 使用說明 */}
        <Alert color="blue" title="使用建議">
          <Text size="sm">
            根據您的需求選擇測試頁面：
          </Text>
          <Text size="xs" mt="xs">
            • <strong>真正的 SignalR 測試</strong>：如果您有 SignalR 後端，推薦使用<br/>
            • <strong>Socket.IO 模擬測試</strong>：如果沒有後端，或想快速測試前端<br/>
            • <strong>其他測試頁面</strong>：用於調試和開發
          </Text>
        </Alert>

        {/* 技術說明 */}
        <Alert color="yellow" title="技術說明">
          <Text size="sm">
            SignalR 與 Socket.IO 的差異：
          </Text>
          <Text size="xs" mt="xs">
            • <strong>SignalR</strong>：微軟技術，主要用於 .NET 後端<br/>
            • <strong>Socket.IO</strong>：開源技術，跨平台支持<br/>
            • 兩者都支持即時通訊，但實現方式不同<br/>
            • 選擇哪個取決於您的後端技術棧
          </Text>
        </Alert>
      </Stack>
    </Container>
  )
} 