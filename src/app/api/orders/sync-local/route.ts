import { NextRequest, NextResponse } from 'next/server'
import { orderOperations, actionHistoryOperations } from '@/lib/database-local'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    switch (body.action) {
      case 'record':
        await actionHistoryOperations.recordAction(body.data)
        break
        
      case 'undo':
        const undoAction = body.data
        if (undoAction.backend_changes?.orderId) {
          await orderOperations.updateOrderStatus(
            undoAction.backend_changes.orderId,
            undoAction.backend_changes.previousStatus
          )
        }
        break
        
      case 'redo':
        const redoAction = body.data
        if (redoAction.backend_changes?.orderId) {
          await orderOperations.updateOrderStatus(
            redoAction.backend_changes.orderId,
            redoAction.backend_changes.newStatus
          )
        }
        break
        
      case 'status_change':
        await orderOperations.updateOrderStatus(
          body.orderId,
          body.newStatus
        )
        break
        
      case 'batch_delete':
        for (const orderId of body.orderIds) {
          await orderOperations.deleteOrder(orderId)
        }
        break
        
      case 'get_history':
        const history = await actionHistoryOperations.getActionHistory(body.limit || 50)
        return NextResponse.json({
          success: true,
          data: history,
          message: '取得操作歷史成功'
        })
        
      case 'get_undoable':
        const undoableActions = await actionHistoryOperations.getUndoableActions(body.limit || 10)
        return NextResponse.json({
          success: true,
          data: undoableActions,
          message: '取得可回復操作成功'
        })
        
      default:
        return NextResponse.json({ error: '不支援的操作類型' }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      message: '操作成功同步到本地 MySQL 資料庫',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('本地 MySQL 同步操作失敗:', error)
    return NextResponse.json({ error: '同步操作失敗' }, { status: 500 })
  }
} 