'use client'

import React, { useEffect } from 'react'
import { Container, Title, Text, Stack, Alert, Card, Group, Button } from '@mantine/core'
import { IconInfoCircle, IconWifi, IconWifiOff, IconDatabase } from '@tabler/icons-react'
import { SupabaseOfflineUI } from '../../components/SupabaseOfflineUI'
import { useSupabaseOffline } from '../../hooks/useSupabaseOffline'

export default function SupabaseOfflineDemo() {
  const {
    isOnline,
    isSyncing,
    orders,
    selectedOrderIds,
    localHistory,
    currentIndex,
    pendingActions,
    syncedActions,
    addOrder,
    completeOrder,
    startPreparingOrder,
    markOrderReady,
    cancelOrder,
    getSyncStatus
  } = useSupabaseOffline({
    autoSync: true,
    syncInterval: 30000,
    maxRetries: 3,
    enableConflictDetection: true
  })

  const syncStatus = getSyncStatus()

  // 載入範例資料
  useEffect(() => {
    if (orders.length === 0) {
      // 添加範例訂單
      const sampleOrders = [
        {
          id: '1',
          order_number: 'ORD-001',
          customer_name: '張先生',
          table_number: 1,
          status: 'PENDING' as const,
          total_amount: 150.00,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          completed_at: null,
          notes: null
        },
        {
          id: '2',
          order_number: 'ORD-002',
          customer_name: '李小姐',
          table_number: 2,
          status: 'PREPARING' as const,
          total_amount: 200.00,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          completed_at: null,
          notes: null
        },
        {
          id: '3',
          order_number: 'ORD-003',
          customer_name: '王先生',
          table_number: 3,
          status: 'READY' as const,
          total_amount: 180.00,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          completed_at: null,
          notes: null
        }
      ]

      sampleOrders.forEach(order => {
        addOrder(order)
      })
    }
  }, [orders.length, addOrder])

  const handleAddSampleOrder = () => {
    const newOrder = {
      id: `order-${Date.now()}`,
      order_number: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      customer_name: `客戶 ${orders.length + 1}`,
      table_number: orders.length + 1,
      status: 'PENDING' as const,
      total_amount: Math.floor(Math.random() * 200) + 50,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null,
      notes: null
    }
    addOrder(newOrder)
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* 標題 */}
        <div>
          <Title order={1}>Supabase 離線支援演示</Title>
          <Text c="dimmed" mt="xs">
            展示 KDS 系統的離線支援功能，包括撤銷/重做、自動同步、衝突解決等
          </Text>
        </div>

        {/* 狀態概覽 */}
        <Card withBorder>
          <Title order={3} mb="md">系統狀態</Title>
          <Group gap="lg">
            <div>
              <Text size="sm" fw={500}>網路狀態</Text>
              <Group gap="xs" mt="xs">
                {isOnline ? (
                  <IconWifi size={16} color="green" />
                ) : (
                  <IconWifiOff size={16} color="red" />
                )}
                <Text size="sm">{isOnline ? '線上' : '離線'}</Text>
              </Group>
            </div>

            <div>
              <Text size="sm" fw={500}>同步狀態</Text>
              <Text size="sm" c={syncStatus.status === 'synced' ? 'green' : 'orange'}>
                {syncStatus.message}
              </Text>
            </div>

            <div>
              <Text size="sm" fw={500}>訂單數量</Text>
              <Text size="sm">{orders.length} 個</Text>
            </div>

            <div>
              <Text size="sm" fw={500}>操作歷史</Text>
              <Text size="sm">{localHistory.length} 個操作</Text>
            </div>

            <div>
              <Text size="sm" fw={500}>待同步</Text>
              <Text size="sm" c="orange">{pendingActions.length} 個</Text>
            </div>
          </Group>
        </Card>

        {/* 功能說明 */}
        <Alert
          icon={<IconInfoCircle size={16} />}
          title="功能說明"
          color="blue"
        >
          <Stack gap="xs">
            <Text size="sm">
              • <strong>離線支援</strong>：網路斷線時仍可正常操作，資料會暫存在本地
            </Text>
            <Text size="sm">
              • <strong>自動同步</strong>：網路恢復後自動將本地操作同步到伺服器
            </Text>
            <Text size="sm">
              • <strong>撤銷/重做</strong>：支援多步驟的撤銷和重做操作
            </Text>
            <Text size="sm">
              • <strong>衝突解決</strong>：自動檢測和解決本地與伺服器資料衝突
            </Text>
            <Text size="sm">
              • <strong>重試機制</strong>：同步失敗時自動重試，使用指數退避策略
            </Text>
          </Stack>
        </Alert>

        {/* 控制面板 */}
        <Card withBorder>
          <Title order={3} mb="md">控制面板</Title>
          <SupabaseOfflineUI
            isMobile={false}
            showNetworkStatus={true}
            showSyncControls={true}
            showPendingActions={true}
            showHistory={true}
          />
        </Card>

        {/* 快速操作 */}
        <Card withBorder>
          <Title order={3} mb="md">快速操作</Title>
          <Group gap="md">
            <Button
              variant="light"
              onClick={handleAddSampleOrder}
              disabled={isSyncing}
            >
              添加範例訂單
            </Button>

            <Button
              variant="light"
              color="green"
              onClick={() => {
                const readyOrder = orders.find(o => o.status === 'READY')
                if (readyOrder) {
                  completeOrder(readyOrder.id)
                }
              }}
              disabled={!orders.some(o => o.status === 'READY') || isSyncing}
            >
              完成一個準備好的訂單
            </Button>

            <Button
              variant="light"
              color="yellow"
              onClick={() => {
                const pendingOrder = orders.find(o => o.status === 'PENDING')
                if (pendingOrder) {
                  startPreparingOrder(pendingOrder.id)
                }
              }}
              disabled={!orders.some(o => o.status === 'PENDING') || isSyncing}
            >
              開始準備一個待處理訂單
            </Button>

            <Button
              variant="light"
              color="orange"
              onClick={() => {
                const preparingOrder = orders.find(o => o.status === 'PREPARING')
                if (preparingOrder) {
                  markOrderReady(preparingOrder.id)
                }
              }}
              disabled={!orders.some(o => o.status === 'PREPARING') || isSyncing}
            >
              標記一個訂單為準備完成
            </Button>

            <Button
              variant="light"
              color="red"
              onClick={() => {
                const cancellableOrder = orders.find(o => 
                  o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
                )
                if (cancellableOrder) {
                  cancelOrder(cancellableOrder.id)
                }
              }}
              disabled={!orders.some(o => 
                o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
              ) || isSyncing}
            >
              取消一個訂單
            </Button>
          </Group>
        </Card>

        {/* 訂單列表 */}
        <Card withBorder>
          <Title order={3} mb="md">訂單列表</Title>
          <Stack gap="md">
            {orders.map((order) => (
              <Card key={order.id} withBorder>
                <Group justify="space-between">
                  <div>
                    <Text fw={500}>{order.order_number}</Text>
                    <Text size="sm" c="dimmed">
                      {order.customer_name} - 桌號 {order.table_number}
                    </Text>
                    <Text size="sm" c="dimmed">
                      總計: ${order.total_amount}
                    </Text>
                  </div>
                  
                  <Group gap="xs">
                    <Text size="sm" fw={500} c={
                      order.status === 'PENDING' ? 'blue' :
                      order.status === 'PREPARING' ? 'yellow' :
                      order.status === 'READY' ? 'green' :
                      order.status === 'COMPLETED' ? 'gray' : 'red'
                    }>
                      {order.status}
                    </Text>
                  </Group>
                </Group>
              </Card>
            ))}
          </Stack>
        </Card>

        {/* 操作歷史 */}
        <Card withBorder>
          <Title order={3} mb="md">操作歷史</Title>
          <Stack gap="xs">
            {localHistory.slice(-5).map((action, index) => (
              <Card key={action.id} withBorder size="sm">
                <Group justify="space-between">
                  <div>
                    <Text size="sm" fw={500}>
                      {action.action_description}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {new Date(action.created_at).toLocaleString('zh-TW')}
                    </Text>
                  </div>
                  <Text size="xs" c="dimmed">
                    {action.action_type}
                  </Text>
                </Group>
              </Card>
            ))}
            {localHistory.length === 0 && (
              <Text size="sm" c="dimmed" ta="center">
                尚無操作歷史
              </Text>
            )}
          </Stack>
        </Card>

        {/* 測試說明 */}
        <Alert
          icon={<IconDatabase size={16} />}
          title="測試建議"
          color="green"
        >
          <Stack gap="xs">
            <Text size="sm">
              1. <strong>離線測試</strong>：斷開網路連線，然後進行一些操作
            </Text>
            <Text size="sm">
              2. <strong>撤銷測試</strong>：完成一些操作後，點擊撤銷按鈕
            </Text>
            <Text size="sm">
              3. <strong>同步測試</strong>：恢復網路連線，觀察自動同步
            </Text>
            <Text size="sm">
              4. <strong>衝突測試</strong>：在多個設備上同時操作同一訂單
            </Text>
            <Text size="sm">
              5. <strong>重試測試</strong>：在同步過程中斷開網路，觀察重試機制
            </Text>
          </Stack>
        </Alert>
      </Stack>
    </Container>
  )
} 