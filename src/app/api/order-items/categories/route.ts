import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, CategoryItems } from '../../../../lib/api-types';
import { ApiErrorCode } from '../../../../types/api';
import { getOrderItemsCategoriesUrl } from '../../../../lib/api-config';



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');

    // 驗證 storeId
    if (!storeId) {
      return NextResponse.json({
        message: '缺少 storeId 參數',
        code: ApiErrorCode.VALIDATION_ERROR,
        data: null,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const storeIdNum = parseInt(storeId);
    if (isNaN(storeIdNum)) {
      return NextResponse.json({
        message: 'storeId 必須是數字',
        code: ApiErrorCode.VALIDATION_ERROR,
        data: null,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // 呼叫後端 API 取得品項分類資料
    const apiUrl = getOrderItemsCategoriesUrl(storeIdNum);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // 設定超時時間
        signal: AbortSignal.timeout(10000), // 10秒超時
      });

      if (!response.ok) {
        throw new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
      }

      const apiResponse: ApiResponse<CategoryItems> = await response.json();
      
      // 檢查 API 回應是否成功
      if (apiResponse.code !== '0000') {
        throw new Error(`API 回應錯誤: ${apiResponse.message}`);
      }

      // 構建回應
      const finalResponse: ApiResponse<CategoryItems> = {
        message: `門市 ${storeId} 品項資料獲取成功`,
        code: '0000',
        data: apiResponse.data,
        timestamp: new Date().toISOString(),
        requestId: `req-${Date.now()}`
      };

      console.log(`API 回應 - 門市 ${storeId} 品項資料:`, {
        making: apiResponse.data?.making.length || 0,
        hold: apiResponse.data?.hold.length || 0,
        waiting: apiResponse.data?.waiting.length || 0
      });

      return NextResponse.json(finalResponse);
      
    } catch (apiError) {
      // API 呼叫錯誤處理
      console.error('後端 API 呼叫失敗:', apiError);
      
      if (apiError instanceof Error) {
        if (apiError.message.includes('API 請求失敗')) {
          return NextResponse.json({
            message: '後端服務暫時無法使用，請稍後再試',
            code: ApiErrorCode.NETWORK_ERROR,
            data: null,
            timestamp: new Date().toISOString()
          }, { status: 503 });
        } else if (apiError.message.includes('API 回應錯誤')) {
          return NextResponse.json({
            message: apiError.message,
            code: ApiErrorCode.INTERNAL_ERROR,
            data: null,
            timestamp: new Date().toISOString()
          }, { status: 500 });
        }
      }
      
      return NextResponse.json({
        message: '取得品項分類資料時發生錯誤',
        code: ApiErrorCode.INTERNAL_ERROR,
        data: null,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

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

