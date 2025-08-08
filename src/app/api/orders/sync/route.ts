import { NextRequest, NextResponse } from 'next/server';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  status: 'waiting' | 'making' | 'completed' | 'hold';
  timestamp: Date;
  selected?: boolean;
}

interface UndoAction {
  id: string;
  type: 'SELECT_ITEM' | 'DELETE' | 'UPDATE' | 'CREATE' | 'BATCH_DELETE' | 'STATUS_CHANGE';
  timestamp: Date;
  description: string;
  
  frontendChanges: {
    selectedItemIds?: string[];
    previousSelectedItemIds?: string[];
    deletedItems?: OrderItem[];
    updatedItems?: Partial<OrderItem>[];
    createdItems?: OrderItem[];
    statusChanges?: { itemId: string; from: string; to: string }[];
  };
  
  backendChanges: {
    tableName: string;
    operation: 'INSERT' | 'UPDATE' | 'DELETE' | 'BATCH_UPDATE';
    data: any;
    where?: any;
  };
  
  metadata: {
    userId?: string;
    sessionId?: string;
    deviceInfo?: string;
  };
}

interface SyncRequest {
  action: 'record' | 'undo' | 'redo' | 'delete' | 'update' | 'create' | 'select_item' | 'batch_delete' | 'status_change';
  data?: UndoAction;
  timestamp: string;
  items?: OrderItem[];
  description?: string;
  selectedItemId?: string;
  previousSelectedItemId?: string;
  userId?: string;
  sessionId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SyncRequest = await request.json();
    
    // 根據不同動作處理資料庫操作
    switch (body.action) {
      case 'record':
        // 記錄操作到資料庫
        await handleRecordAction(body.data!);
        break;
        
      case 'undo':
        // 處理撤銷操作
        await handleUndoAction(body.data!);
        break;
        
      case 'redo':
        // 處理重做操作
        await handleRedoAction(body.data!);
        break;
        
      case 'delete':
        // 處理刪除操作
        await handleDelete(body);
        break;
        
      case 'update':
        // 處理更新操作
        await handleUpdate(body);
        break;
        
      case 'create':
        // 處理創建操作
        await handleCreate(body);
        break;
        
      case 'select_item':
        // 處理品項選擇操作
        await handleSelectItem(body);
        break;
        
      case 'batch_delete':
        // 處理批量刪除操作
        await handleBatchDelete(body);
        break;
        
      case 'status_change':
        // 處理狀態變更操作
        await handleStatusChange(body);
        break;
        
      default:
        return NextResponse.json(
          { error: '不支援的操作類型' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '操作成功同步到資料庫',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('同步操作失敗:', error);
    return NextResponse.json(
      { error: '同步操作失敗' },
      { status: 500 }
    );
  }
}

// 記錄操作到資料庫
async function handleRecordAction(action: UndoAction) {
  console.log('記錄操作:', action);
  
  // 這裡可以將操作記錄到資料庫的 audit_log 表
  // 例如：
  // await db.auditLog.create({
  //   actionId: action.id,
  //   type: action.type,
  //   description: action.description,
  //   frontendChanges: JSON.stringify(action.frontendChanges),
  //   backendChanges: JSON.stringify(action.backendChanges),
  //   metadata: JSON.stringify(action.metadata),
  //   timestamp: action.timestamp,
  //   userId: action.metadata.userId,
  //   sessionId: action.metadata.sessionId,
  // });
  
  // 模擬資料庫操作
  await new Promise(resolve => setTimeout(resolve, 50));
}

// 處理撤銷操作
async function handleUndoAction(action: UndoAction) {
  console.log('處理撤銷操作:', action);
  
  try {
    // 根據操作類型執行相應的資料庫撤銷操作
    switch (action.type) {
      case 'DELETE':
        // 恢復被刪除的項目
        await restoreDeletedItems(action.frontendChanges.deletedItems || []);
        break;
        
      case 'UPDATE':
        // 恢復更新的項目
        await restoreUpdatedItems(action.frontendChanges.updatedItems || []);
        break;
        
      case 'CREATE':
        // 移除新創建的項目
        await removeCreatedItems(action.frontendChanges.createdItems || []);
        break;
        
      case 'BATCH_DELETE':
        // 恢復批量刪除的項目
        await restoreDeletedItems(action.frontendChanges.deletedItems || []);
        break;
        
      case 'STATUS_CHANGE':
        // 恢復狀態變更
        await restoreStatusChanges(action.frontendChanges.statusChanges || []);
        break;
        
      case 'SELECT_ITEM':
        // 選擇操作不需要資料庫撤銷
        break;
    }
    
    // 記錄撤銷操作到 audit_log
    // await db.auditLog.create({
    //   actionId: `undo_${action.id}`,
    //   type: 'UNDO',
    //   description: `撤銷操作: ${action.description}`,
    //   originalActionId: action.id,
    //   timestamp: new Date(),
    //   userId: action.metadata.userId,
    //   sessionId: action.metadata.sessionId,
    // });
    
  } catch (error) {
    console.error('撤銷操作失敗:', error);
    throw error;
  }
}

// 處理重做操作
async function handleRedoAction(action: UndoAction) {
  console.log('處理重做操作:', action);
  
  try {
    // 根據操作類型執行相應的資料庫重做操作
    switch (action.type) {
      case 'DELETE':
        // 重新刪除項目
        await deleteItems(action.frontendChanges.deletedItems || []);
        break;
        
      case 'UPDATE':
        // 重新更新項目
        await updateItems(action.frontendChanges.updatedItems || []);
        break;
        
      case 'CREATE':
        // 重新創建項目
        await createItems(action.frontendChanges.createdItems || []);
        break;
        
      case 'BATCH_DELETE':
        // 重新批量刪除項目
        await deleteItems(action.frontendChanges.deletedItems || []);
        break;
        
      case 'STATUS_CHANGE':
        // 重新變更狀態
        await changeStatuses(action.frontendChanges.statusChanges || []);
        break;
        
      case 'SELECT_ITEM':
        // 選擇操作不需要資料庫重做
        break;
    }
    
    // 記錄重做操作到 audit_log
    // await db.auditLog.create({
    //   actionId: `redo_${action.id}`,
    //   type: 'REDO',
    //   description: `重做操作: ${action.description}`,
    //   originalActionId: action.id,
    //   timestamp: new Date(),
    //   userId: action.metadata.userId,
    //   sessionId: action.metadata.sessionId,
    // });
    
  } catch (error) {
    console.error('重做操作失敗:', error);
    throw error;
  }
}

// 資料庫操作函數
async function restoreDeletedItems(items: OrderItem[]) {
  console.log('恢復被刪除的項目:', items);
  // 實際資料庫操作：
  // await db.orders.createMany({
  //   data: items.map(item => ({
  //     id: item.id,
  //     name: item.name,
  //     quantity: item.quantity,
  //     status: item.status,
  //     timestamp: item.timestamp,
  //   }))
  // });
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function restoreUpdatedItems(items: Partial<OrderItem>[]) {
  console.log('恢復更新的項目:', items);
  // 實際資料庫操作：
  // for (const item of items) {
  //   await db.orders.update({
  //     where: { id: item.id },
  //     data: item,
  //   });
  // }
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function removeCreatedItems(items: OrderItem[]) {
  console.log('移除新創建的項目:', items);
  // 實際資料庫操作：
  // await db.orders.deleteMany({
  //   where: {
  //     id: { in: items.map(item => item.id) }
  //   }
  // });
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function restoreStatusChanges(changes: { itemId: string; from: string; to: string }[]) {
  console.log('恢復狀態變更:', changes);
  // 實際資料庫操作：
  // for (const change of changes) {
  //   await db.orders.update({
  //     where: { id: change.itemId },
  //     data: { status: change.from },
  //   });
  // }
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function deleteItems(items: OrderItem[]) {
  console.log('刪除項目:', items);
  // 實際資料庫操作：
  // await db.orders.deleteMany({
  //   where: {
  //     id: { in: items.map(item => item.id) }
  //   }
  // });
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function updateItems(items: Partial<OrderItem>[]) {
  console.log('更新項目:', items);
  // 實際資料庫操作：
  // for (const item of items) {
  //   await db.orders.update({
  //     where: { id: item.id },
  //     data: item,
  //   });
  // }
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function createItems(items: OrderItem[]) {
  console.log('創建項目:', items);
  // 實際資料庫操作：
  // await db.orders.createMany({
  //   data: items.map(item => ({
  //     id: item.id,
  //     name: item.name,
  //     quantity: item.quantity,
  //     status: item.status,
  //     timestamp: item.timestamp,
  //   }))
  // });
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function changeStatuses(changes: { itemId: string; from: string; to: string }[]) {
  console.log('變更狀態:', changes);
  // 實際資料庫操作：
  // for (const change of changes) {
  //   await db.orders.update({
  //     where: { id: change.itemId },
  //     data: { status: change.to },
  //   });
  // }
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function handleDelete(data: SyncRequest) {
  console.log('處理刪除操作:', data);
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function handleUpdate(data: SyncRequest) {
  console.log('處理更新操作:', data);
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function handleCreate(data: SyncRequest) {
  console.log('處理創建操作:', data);
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function handleSelectItem(data: SyncRequest) {
  console.log('處理品項選擇操作:', data);
  console.log('選中的品項ID:', data.selectedItemId);
  console.log('上一個選中的品項ID:', data.previousSelectedItemId);
  await new Promise(resolve => setTimeout(resolve, 50));
}

async function handleBatchDelete(data: SyncRequest) {
  console.log('處理批量刪除操作:', data);
  await new Promise(resolve => setTimeout(resolve, 150));
}

async function handleStatusChange(data: SyncRequest) {
  console.log('處理狀態變更操作:', data);
  await new Promise(resolve => setTimeout(resolve, 100));
} 