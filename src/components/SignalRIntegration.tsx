import React, { useEffect, useState } from 'react';
import { Badge, Group, Text, Card, Stack, Button, Alert, Divider, ScrollArea } from '@mantine/core';
import { IconWifi, IconWifiOff, IconPlayerPlay, IconPlayerStop, IconRefresh, IconTestPipe, IconNetwork, IconCheck, IconX, IconClock, IconDatabase } from '@tabler/icons-react';
import { useSignalRMock } from '../lib/signalr-mock';

interface SignalRIntegrationProps {
  isCompact?: boolean;
  showControls?: boolean;
  autoConnect?: boolean;
}

export const SignalRIntegration: React.FC<SignalRIntegrationProps> = ({ 
  isCompact = false, 
  showControls = true, 
  autoConnect = true 
}) => {
  const {
    connection,
    events,
    isSimulating,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    sendEvent,
    startSimulation,
    stopSimulation,
    clearEvents,
    getConnectionStatus
  } = useSignalRMock();

  const [lastEvent, setLastEvent] = useState<any>(null);
  const [eventCount, setEventCount] = useState(0);

  // 自動連線
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
  }, [autoConnect, connect]);

  // 訂閱事件處理
  useEffect(() => {
    const handleOrderUpdate = (event: any) => {
      setLastEvent(event);
      setEventCount(prev => prev + 1);
      console.log('收到訂單更新事件:', event);
    };

    const handleStatusChange = (event: any) => {
      setLastEvent(event);
      setEventCount(prev => prev + 1);
      console.log('收到狀態變更事件:', event);
    };

    const handleNewOrder = (event: any) => {
      setLastEvent(event);
      setEventCount(prev => prev + 1);
      console.log('收到新訂單事件:', event);
    };

    // 訂閱事件
    subscribe('order_update', handleOrderUpdate);
    subscribe('status_change', handleStatusChange);
    subscribe('new_order', handleNewOrder);

    return () => {
      unsubscribe('order_update');
      unsubscribe('status_change');
      unsubscribe('new_order');
    };
  }, [subscribe, unsubscribe]);

  const connectionStatus = getConnectionStatus();
  const statusColor = connection.isConnected ? 'green' : 'red';
  const statusIcon = connection.isConnected ? <IconWifi size={16} /> : <IconWifiOff size={16} />;

  const getStatusText = () => {
    if (connection.isConnected) {
      return isSimulating ? '連線中 (模擬中)' : '已連線';
    }
    return '未連線';
  };

  const formatTimestamp = (timestamp: Date | null) => {
    if (!timestamp) return '無';
    return timestamp.toLocaleTimeString('zh-TW', { hour12: false });
  };

  if (isCompact) {
    return (
      <Card shadow="sm" padding="xs" radius="md" withBorder>
        <Group gap="xs" justify="space-between">
          <Group gap="xs">
            {statusIcon}
            <Text size="xs" fw={500}>
              SignalR: {getStatusText()}
            </Text>
          </Group>
          {showControls && (
            <Group gap="xs">
              {!connection.isConnected ? (
                <Button size="xs" onClick={connect} leftSection={<IconPlayerPlay size={12} />}>
                  連線
                </Button>
              ) : (
                <Button size="xs" onClick={disconnect} leftSection={<IconPlayerStop size={12} />}>
                  斷線
                </Button>
              )}
              {connection.isConnected && (
                <Button 
                  size="xs" 
                  onClick={isSimulating ? stopSimulation : startSimulation}
                  leftSection={isSimulating ? <IconPlayerStop size={12} /> : <IconPlayerPlay size={12} />}
                >
                  {isSimulating ? '停止' : '模擬'}
                </Button>
              )}
            </Group>
          )}
        </Group>
      </Card>
    );
  }

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Stack gap="md">
        {/* 標題和狀態 */}
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <IconTestPipe size={20} />
            <Text fw={600}>SignalR 即時通訊</Text>
          </Group>
          <Badge color={statusColor} leftSection={statusIcon}>
            {getStatusText()}
          </Badge>
        </Group>

        {/* 連線狀態 */}
        <Alert 
          color={connection.isConnected ? 'green' : 'red'} 
          title="連線狀態"
          icon={connection.isConnected ? <IconCheck size={16} /> : <IconX size={16} />}
        >
          <Text size="sm">
            連線 ID: {connection.connectionId || '無'}
          </Text>
          <Text size="sm">
            最後連線: {formatTimestamp(connection.lastConnected)}
          </Text>
          <Text size="sm">
            重連次數: {connection.reconnectAttempts}
          </Text>
        </Alert>

        {/* 控制按鈕 */}
        {showControls && (
          <Group gap="xs">
            {!connection.isConnected ? (
              <Button onClick={connect} leftSection={<IconPlayerPlay size={16} />}>
                建立連線
              </Button>
            ) : (
              <Button onClick={disconnect} leftSection={<IconPlayerStop size={16} />}>
                斷開連線
              </Button>
            )}
            
            {connection.isConnected && (
              <>
                <Button 
                  onClick={isSimulating ? stopSimulation : startSimulation}
                  leftSection={isSimulating ? <IconPlayerStop size={16} /> : <IconPlayerPlay size={16} />}
                >
                  {isSimulating ? '停止模擬' : '開始模擬'}
                </Button>
                <Button onClick={clearEvents} leftSection={<IconRefresh size={16} />}>
                  清除事件
                </Button>
              </>
            )}
          </Group>
        )}

        {/* 事件統計 */}
        <Group gap="md">
          <Badge color="blue" leftSection={<IconClock size={12} />}>
            事件總數: {events.length}
          </Badge>
          <Badge color="green" leftSection={<IconDatabase size={12} />}>
            今日事件: {eventCount}
          </Badge>
        </Group>

        {/* 最新事件 */}
        {lastEvent && (
          <Alert color="blue" title="最新事件">
            <Text size="sm">
              類型: {lastEvent.type}
            </Text>
            <Text size="sm">
              時間: {formatTimestamp(lastEvent.timestamp)}
            </Text>
            <Text size="sm">
              資料: {JSON.stringify(lastEvent.data, null, 2)}
            </Text>
          </Alert>
        )}

        {/* 事件日誌 */}
        {events.length > 0 && (
          <>
            <Divider />
            <Text fw={600} size="sm">最近事件</Text>
            <ScrollArea h={200}>
              <Stack gap="xs">
                {events.slice(-10).reverse().map((event, index) => (
                  <Card key={index} padding="xs" withBorder>
                    <Group gap="xs" align="center">
                      <Badge size="xs" color="blue">
                        {event.type}
                      </Badge>
                      <Text size="xs" c="dimmed">
                        {formatTimestamp(event.timestamp)}
                      </Text>
                    </Group>
                    <Text size="xs" mt={4}>
                      {JSON.stringify(event.data)}
                    </Text>
                  </Card>
                ))}
              </Stack>
            </ScrollArea>
          </>
        )}
      </Stack>
    </Card>
  );
}; 