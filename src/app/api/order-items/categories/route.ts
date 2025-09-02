import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, CategoryItems } from '../../../../lib/api-types';

// 模擬品項資料庫
const mockOrderItemDatabase: Record<number, CategoryItems> = {
  1: { // 台北門市
    making: [
      {
        id: 'C1-001',
        name: '雪花牛',
        count: 3,
        table: '內用C1',
        note: '油花少一點',
        status: 'making' as const,
        priority: 1,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        estimatedTime: 15,
        actualTime: 8,
        workstationId: 1,
        userId: 'chef-001'
      },
      {
        id: 'C1-002',
        name: '雪花牛',
        count: 1,
        table: '內用C1',
        note: '雪花多一點雪花多一點雪花多一點很重要所以獎三遍',
        status: 'making' as const,
        priority: 1,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:25:00Z',
        estimatedTime: 15,
        actualTime: 5,
        workstationId: 1,
        userId: 'chef-001'
      }
    ],
    hold: [
      {
        id: 'C2-001',
        name: '豬魚雙饗',
        count: 2,
        table: 'C2',
        note: '上選豬+魚片',
        status: 'hold' as const,
        priority: 2,
        createdAt: '2024-01-15T09:45:00Z',
        updatedAt: '2024-01-15T10:15:00Z',
        estimatedTime: 20,
        actualTime: 15,
        workstationId: 2,
        userId: 'chef-002'
      }
    ],
    waiting: [
      {
        id: 'C1-003',
        name: '上選豬肉',
        count: 10,
        table: '內用C1',
        status: 'waiting' as const,
        priority: 1,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        estimatedTime: 12,
        workstationId: 1
      },
      {
        id: 'C2-002',
        name: '絕代雙牛',
        count: 1,
        table: 'C2',
        note: '雪花牛+嫩煎牛',
        status: 'waiting' as const,
        priority: 2,
        createdAt: '2024-01-15T09:45:00Z',
        updatedAt: '2024-01-15T09:45:00Z',
        estimatedTime: 18,
        workstationId: 2
      },
      {
        id: 'C3-001',
        name: '上選豬肉',
        count: 5,
        table: 'C3',
        status: 'waiting' as const,
        priority: 3,
        createdAt: '2024-01-15T09:30:00Z',
        updatedAt: '2024-01-15T09:30:00Z',
        estimatedTime: 12,
        workstationId: 1
      },
      {
        id: 'C4-001',
        name: '絕代雙牛',
        count: 3,
        table: 'C4',
        status: 'waiting' as const,
        priority: 4,
        createdAt: '2024-01-15T09:15:00Z',
        updatedAt: '2024-01-15T09:15:00Z',
        estimatedTime: 18,
        workstationId: 2
      }
    ]
  },
  2: { // 台中門市
    making: [
      {
        id: 'T1-001',
        name: '台中特選牛',
        count: 2,
        table: '台中T1',
        note: '七分熟',
        status: 'making' as const,
        priority: 1,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:20:00Z',
        estimatedTime: 18,
        actualTime: 10,
        workstationId: 3,
        userId: 'chef-003'
      }
    ],
    hold: [
      {
        id: 'T2-001',
        name: '台中豬肉飯',
        count: 1,
        table: '台中T2',
        note: '不要蔥',
        status: 'hold' as const,
        priority: 2,
        createdAt: '2024-01-15T09:50:00Z',
        updatedAt: '2024-01-15T09:50:00Z',
        estimatedTime: 15,
        actualTime: 12,
        workstationId: 4,
        userId: 'chef-004'
      }
    ],
    waiting: [
      {
        id: 'T1-002',
        name: '台中特選豬',
        count: 3,
        table: '台中T1',
        status: 'waiting' as const,
        priority: 1,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        estimatedTime: 14,
        workstationId: 3
      },
      {
        id: 'T3-001',
        name: '台中魚片',
        count: 2,
        table: '台中T3',
        status: 'waiting' as const,
        priority: 3,
        createdAt: '2024-01-15T09:40:00Z',
        updatedAt: '2024-01-15T09:40:00Z',
        estimatedTime: 16,
        workstationId: 4
      }
    ]
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const delay = searchParams.get('delay');
    const error = searchParams.get('error');

    // 模擬網路延遲
    if (delay) {
      const delayMs = parseInt(delay);
      if (!isNaN(delayMs) && delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    // 模擬錯誤
    if (error === 'true') {
      return NextResponse.json({
        message: '模擬 API 錯誤',
        code: '9999',
        data: null,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // 驗證 storeId
    if (!storeId) {
      return NextResponse.json({
        message: '缺少 storeId 參數',
        code: '9999',
        data: null,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const storeIdNum = parseInt(storeId);
    if (isNaN(storeIdNum)) {
      return NextResponse.json({
        message: 'storeId 必須是數字',
        code: '9999',
        data: null,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // 獲取門市品項資料
    const storeData = mockOrderItemDatabase[storeIdNum];
    
    if (!storeData) {
      return NextResponse.json({
        message: `門市 ${storeId} 不存在`,
        code: '9999',
        data: null,
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    // 構建回應
    const response: ApiResponse<CategoryItems> = {
      message: `門市 ${storeId} 品項資料獲取成功`,
      code: '0000',
      data: storeData,
      timestamp: new Date().toISOString(),
      requestId: `req-${Date.now()}`
    };

    console.log(`API 回應 - 門市 ${storeId} 品項資料:`, {
      making: storeData.making.length,
      hold: storeData.hold.length,
      waiting: storeData.waiting.length
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('品項分類 API 錯誤:', error);
    
    return NextResponse.json({
      message: '伺服器內部錯誤',
      code: '9999',
      data: null,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

