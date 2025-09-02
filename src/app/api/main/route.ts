import { NextRequest, NextResponse } from 'next/server';
import { KdsWorkstation, KdsWorkstationResponse, ApiErrorCode } from '@/types/api';
import { getWorkstationListUrl } from '@/lib/api-config';

// 工作站清單 API 端點 - 符合 A01-GET-KDS工作站 規格
export async function GET(request: NextRequest): Promise<NextResponse<KdsWorkstationResponse>> {
  try {
    // 從 URL 參數中取得 storeId
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    
    // 驗證 storeId 參數
    if (!storeId) {
      return NextResponse.json({
        message: '缺少必要參數: storeId',
        code: '9999',
        data: null
      }, { status: 400 });
    }
    
    // 驗證 storeId 是否為有效的整數
    const storeIdNum = parseInt(storeId);
    if (isNaN(storeIdNum) || storeIdNum <= 0) {
      return NextResponse.json({
        message: 'storeId 必須為有效的正整數',
        code: '9999',
        data: null
      }, { status: 400 });
    }
    
    // 呼叫後端 API 取得工作站清單
    const apiUrl = getWorkstationListUrl(storeIdNum);
    
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

      const apiResponse: KdsWorkstationResponse = await response.json();
      
      // 檢查 API 回應是否成功
      if (apiResponse.code !== '0000') {
        throw new Error(`API 回應錯誤: ${apiResponse.message}`);
      }

      // 根據 storeId 過濾工作站，只回傳啟用狀態的工作站 (isOn == 1)
      const activeWorkstations = (apiResponse.data || []).filter(ws => 
        ws.storeId === storeIdNum && ws.isOn === 1 && ws.isDisabled === 0
      );
      
      // 根據 serialNo 排序
      const sortedWorkstations = activeWorkstations.sort((a, b) => a.serialNo - b.serialNo);
    
      // 回傳成功回應
      return NextResponse.json({
        message: "",
        code: "0000",
        data: sortedWorkstations.length > 0 ? sortedWorkstations : null
      });
      
    } catch (apiError) {
      // API 呼叫錯誤處理
      console.error('後端 API 呼叫失敗:', apiError);
      
      if (apiError instanceof Error) {
        if (apiError.message.includes('API 請求失敗')) {
          return NextResponse.json({
            message: '後端服務暫時無法使用，請稍後再試',
            code: ApiErrorCode.NETWORK_ERROR,
            data: null
          }, { status: 503 });
        } else if (apiError.message.includes('API 回應錯誤')) {
          return NextResponse.json({
            message: apiError.message,
            code: ApiErrorCode.INTERNAL_ERROR,
            data: null
          }, { status: 500 });
        }
      }
      
      return NextResponse.json({
        message: '取得工作站清單時發生錯誤',
        code: ApiErrorCode.INTERNAL_ERROR,
        data: null
      }, { status: 500 });
    }
    
  } catch (error) {
    // 4. 錯誤處理和日誌記錄
    console.error('取得 KDS 工作站清單 API 錯誤:', error);
    
    // 根據錯誤類型回傳適當的錯誤訊息
    let errorMessage = '取得工作站清單過程中發生錯誤';
    let statusCode = 500;
    let errorCode = ApiErrorCode.INTERNAL_ERROR;
    
    if (error instanceof Error) {
      if (error.message.includes('API 請求失敗')) {
        errorMessage = '後端服務暫時無法使用，請稍後再試';
        statusCode = 503;
        errorCode = ApiErrorCode.NETWORK_ERROR;
      } else if (error.message.includes('超時')) {
        errorMessage = '請求超時，請稍後再試';
        statusCode = 408;
        errorCode = ApiErrorCode.TIMEOUT_ERROR;
      } else if (error.message.includes('驗證')) {
        errorMessage = error.message;
        statusCode = 400;
        errorCode = ApiErrorCode.VALIDATION_ERROR;
      }
    }
    
    // 回傳失敗回應
    return NextResponse.json({
      message: errorMessage,
      code: errorCode,
      data: null
    }, { status: statusCode });
  }
}
