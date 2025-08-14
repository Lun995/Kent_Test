import { NextRequest, NextResponse } from 'next/server';
import { workstationService } from '@/lib/services/workstation-service';
import { ApiErrorCode } from '@/types/api';

/**
 * 工作站清單 API 端點
 * 符合 A01-GET-KDS工作站 API 規格
 * 使用工作站服務類別處理業務邏輯
 * 
 * @param request NextRequest 物件，包含請求參數和標頭
 * @returns Promise<NextResponse> API 回應
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. 解析和驗證請求參數
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    
    // 驗證 storeId 參數是否存在
    if (!storeId) {
      return NextResponse.json({
        message: '缺少必要參數: storeId',
        code: ApiErrorCode.VALIDATION_ERROR,
        data: null
      }, { status: 400 });
    }
    
    // 驗證 storeId 是否為有效的正整數
    const storeIdNum = parseInt(storeId);
    if (isNaN(storeIdNum) || storeIdNum <= 0) {
      return NextResponse.json({
        message: 'storeId 必須為有效的正整數',
        code: ApiErrorCode.VALIDATION_ERROR,
        data: null
      }, { status: 400 });
    }

    // 2. 使用工作站服務獲取資料
    const response = await workstationService.getWorkstationsByStore(storeIdNum);
    
    // 3. 回傳工作站資料
    return NextResponse.json(response);
    
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
