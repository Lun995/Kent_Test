import { useEffect, useCallback } from 'react';
import { useSignalRMock } from '../lib/signalr-mock';

interface KDSOrderItem {
  name: string;
  count: number;
  table: string;
}

interface CategoryItems {
  making: KDSOrderItem[];
  hold: KDSOrderItem[];
  waiting: KDSOrderItem[];
}

interface UseKDSSignalROptions {
  onOrderUpdate?: (orderData: any) => void;
  onStatusChange?: (statusData: any) => void;
  onNewOrder?: (newOrderData: any) => void;
  onOrderComplete?: (completedOrderData: any) => void;
  onUndoAction?: (undoData: any) => void;
  onRedoAction?: (redoData: any) => void;
  autoConnect?: boolean;
  enableSimulation?: boolean;
}

export const useKDSSignalR = (options: UseKDSSignalROptions = {}) => {
  const {
    onOrderUpdate,
    onStatusChange,
    onNewOrder,
    onOrderComplete,
    onUndoAction,
    onRedoAction,
    autoConnect = true,
    enableSimulation = false
  } = options;

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
    sendEvent,
    getConnectionStatus
  } = useSignalRMock();

  // 自動連線
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
  }, [autoConnect, connect]);

  // 事件處理器
  const handleOrderUpdate = useCallback((event: any) => {
    console.log('KDS 收到訂單更新事件:', event);
    if (onOrderUpdate) {
      onOrderUpdate(event.data);
    }
  }, [onOrderUpdate]);

  const handleStatusChange = useCallback((event: any) => {
    console.log('KDS 收到狀態變更事件:', event);
    if (onStatusChange) {
      onStatusChange(event.data);
    }
  }, [onStatusChange]);

  const handleNewOrder = useCallback((event: any) => {
    console.log('KDS 收到新訂單事件:', event);
    if (onNewOrder) {
      onNewOrder(event.data);
    }
  }, [onNewOrder]);

  const handleOrderComplete = useCallback((event: any) => {
    console.log('KDS 收到訂單完成事件:', event);
    if (onOrderComplete) {
      onOrderComplete(event.data);
    }
  }, [onOrderComplete]);

  const handleUndoAction = useCallback((event: any) => {
    console.log('KDS 收到回復操作事件:', event);
    if (onUndoAction) {
      onUndoAction(event.data);
    }
  }, [onUndoAction]);

  const handleRedoAction = useCallback((event: any) => {
    console.log('KDS 收到重做操作事件:', event);
    if (onRedoAction) {
      onRedoAction(event.data);
    }
  }, [onRedoAction]);

  // 訂閱事件
  useEffect(() => {
    subscribe('order_update', handleOrderUpdate);
    subscribe('status_change', handleStatusChange);
    subscribe('new_order', handleNewOrder);
    subscribe('order_complete', handleOrderComplete);
    subscribe('undo_action', handleUndoAction);
    subscribe('redo_action', handleRedoAction);

    return () => {
      unsubscribe('order_update');
      unsubscribe('status_change');
      unsubscribe('new_order');
      unsubscribe('order_complete');
      unsubscribe('undo_action');
      unsubscribe('redo_action');
    };
  }, [
    subscribe, 
    unsubscribe, 
    handleOrderUpdate, 
    handleStatusChange, 
    handleNewOrder, 
    handleOrderComplete,
    handleUndoAction,
    handleRedoAction
  ]);

  // 發送 KDS 事件
  const sendOrderUpdate = useCallback((orderData: any) => {
    sendEvent({
      type: 'order_update',
      data: orderData
    });
  }, [sendEvent]);

  const sendStatusChange = useCallback((statusData: any) => {
    sendEvent({
      type: 'status_change',
      data: statusData
    });
  }, [sendEvent]);

  const sendNewOrder = useCallback((orderData: any) => {
    sendEvent({
      type: 'new_order',
      data: orderData
    });
  }, [sendEvent]);

  const sendOrderComplete = useCallback((orderData: any) => {
    sendEvent({
      type: 'order_complete',
      data: orderData
    });
  }, [sendEvent]);

  const sendUndoAction = useCallback((undoData: any) => {
    sendEvent({
      type: 'undo_action',
      data: undoData
    });
  }, [sendEvent]);

  const sendRedoAction = useCallback((redoData: any) => {
    sendEvent({
      type: 'redo_action',
      data: redoData
    });
  }, [sendEvent]);

  // 模擬 KDS 事件
  const simulateKDSActivity = useCallback(() => {
    if (!enableSimulation) return;

    // 模擬新訂單
    sendNewOrder({
      orderId: `ORDER_${Date.now()}`,
      items: [
        { name: '漢堡', count: 2, table: 'A1' },
        { name: '薯條', count: 1, table: 'A1' }
      ],
      status: 'PENDING',
      timestamp: new Date()
    });

    // 模擬狀態變更
    setTimeout(() => {
      sendStatusChange({
        orderId: `ORDER_${Date.now()}`,
        previousStatus: 'PENDING',
        newStatus: 'PREPARING',
        timestamp: new Date()
      });
    }, 2000);

    // 模擬訂單完成
    setTimeout(() => {
      sendOrderComplete({
        orderId: `ORDER_${Date.now()}`,
        status: 'COMPLETED',
        timestamp: new Date()
      });
    }, 5000);
  }, [enableSimulation, sendNewOrder, sendStatusChange, sendOrderComplete]);

  return {
    // 狀態
    connection,
    events,
    isSimulating,
    getConnectionStatus,
    
    // 連線控制
    connect,
    disconnect,
    
    // 模擬控制
    startSimulation,
    stopSimulation,
    
    // 事件發送
    sendOrderUpdate,
    sendStatusChange,
    sendNewOrder,
    sendOrderComplete,
    sendUndoAction,
    sendRedoAction,
    
    // 模擬功能
    simulateKDSActivity
  };
}; 