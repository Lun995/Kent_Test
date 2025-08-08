import React, { useEffect, useState } from 'react';
import { Badge, Group, Text, Button, Tooltip } from '@mantine/core';
import { IconWifi, IconWifiOff, IconPlayerPlay, IconPlayerStop, IconTestPipe } from '@tabler/icons-react';
import { useSignalRMock } from '../lib/signalr-mock';

interface SignalRStatusProps {
  isMobile?: boolean;
  onEventReceived?: (event: any) => void;
}

export const SignalRStatus: React.FC<SignalRStatusProps> = ({ 
  isMobile = false, 
  onEventReceived 
}) => {
  const {
    connection,
    events,
    isSimulating,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    startSimulation,
    stopSimulation,
    getConnectionStatus
  } = useSignalRMock();

  const [eventCount, setEventCount] = useState(0);

  // 自動連線
  useEffect(() => {
    connect();
  }, [connect]);

  // 訂閱事件處理
  useEffect(() => {
    const handleOrderUpdate = (event: any) => {
      setEventCount(prev => prev + 1);
      if (onEventReceived) {
        onEventReceived({ type: 'order_update', data: event.data });
      }
      console.log('KDS 收到訂單更新事件:', event);
    };

    const handleStatusChange = (event: any) => {
      setEventCount(prev => prev + 1);
      if (onEventReceived) {
        onEventReceived({ type: 'status_change', data: event.data });
      }
      console.log('KDS 收到狀態變更事件:', event);
    };

    const handleNewOrder = (event: any) => {
      setEventCount(prev => prev + 1);
      if (onEventReceived) {
        onEventReceived({ type: 'new_order', data: event.data });
      }
      console.log('KDS 收到新訂單事件:', event);
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
  }, [subscribe, unsubscribe, onEventReceived]);

  // 更新事件計數
  useEffect(() => {
    setEventCount(events.length);
  }, [events.length]);

  const statusColor = connection.isConnected ? 'green' : 'red';
  const statusIcon = connection.isConnected ? <IconWifi size={isMobile ? 12 : 14} /> : <IconWifiOff size={isMobile ? 12 : 14} />;

  const getStatusText = () => {
    if (connection.isConnected) {
      return isSimulating ? '模擬中' : '已連線';
    }
    return '未連線';
  };

  return (
    <Group gap="xs" style={{ width: '100%' }}>
      {/* 狀態指示器 */}
      <Tooltip label={`SignalR: ${getStatusText()}`}>
        <Badge 
          color={statusColor} 
          leftSection={statusIcon}
          size={isMobile ? 'xs' : 'sm'}
          style={{ 
            fontSize: isMobile ? '0.7rem' : '0.8rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {getStatusText()}
        </Badge>
      </Tooltip>

      {/* 事件計數 */}
      {eventCount > 0 && (
        <Badge 
          color="blue" 
          size={isMobile ? 'xs' : 'sm'}
          style={{ 
            fontSize: isMobile ? '0.7rem' : '0.8rem',
            fontWeight: 600
          }}
        >
          {eventCount}
        </Badge>
      )}

      {/* 控制按鈕 */}
      <Group gap="xs" style={{ marginLeft: 'auto' }}>
        {!connection.isConnected ? (
          <Tooltip label="建立連線">
            <Button 
              size={isMobile ? 'xs' : 'sm'} 
              onClick={connect} 
              leftSection={<IconPlayerPlay size={isMobile ? 10 : 12} />}
              style={{ padding: isMobile ? '2px 4px' : '4px 8px' }}
            >
              連線
            </Button>
          </Tooltip>
        ) : (
          <Tooltip label="斷開連線">
            <Button 
              size={isMobile ? 'xs' : 'sm'} 
              onClick={disconnect} 
              leftSection={<IconPlayerStop size={isMobile ? 10 : 12} />}
              style={{ padding: isMobile ? '2px 4px' : '4px 8px' }}
            >
              斷線
            </Button>
          </Tooltip>
        )}
        
        {connection.isConnected && (
          <Tooltip label={isSimulating ? '停止模擬' : '開始模擬'}>
            <Button 
              size={isMobile ? 'xs' : 'sm'} 
              onClick={isSimulating ? stopSimulation : startSimulation}
              leftSection={isSimulating ? <IconPlayerStop size={isMobile ? 10 : 12} /> : <IconPlayerPlay size={isMobile ? 10 : 12} />}
              style={{ padding: isMobile ? '2px 4px' : '4px 8px' }}
            >
              {isSimulating ? '停止' : '模擬'}
            </Button>
          </Tooltip>
        )}
      </Group>
    </Group>
  );
}; 