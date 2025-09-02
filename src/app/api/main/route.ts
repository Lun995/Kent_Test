import { NextRequest, NextResponse } from 'next/server';

// KDS 工作站介面 - 根據 API 規格定義
interface KdsWorkstation {
  uid: number;
  no: string;
  name: string;
  brandId: number;
  storeId: number;
  isOn: number;
  serialNo: number;
  memo: string;
  creatorId: number;
  createDate: string;
  modifyId: number;
  modifyDate: string;
  isDisabled: number;
  status: number;
  companyId: number;
  isDefault: number;
  isAutoTimeOn: number;
  isAutoOrderOn: number;
  isAutoProductTypeOn: number;
  isAutoProductOn: number;
  kdsDiningType: number;
  kdsStoreArea: number;
  kdsDisplayTypeId: number;
  isNoDisplay: number;
  isOvertimeNotify: number;
  isCookingNotify: number;
  isMealSound: number;
  isUrgingSound: number;
  overtimeNotifyMin: number;
  cookingNotifyMin: number;
  isAllProduct: number;
  progressiveTypeId: number;
  autoTimeOnMin: number;
  autoOrderOnQty: number;
  nextWorkstationId: number;
  isFirstStation: number;
  isGoOn: number;
  prevWorkstationId: number | null;
  dineOver: number;
  taskTime: number;
  displayType: number;
  cardType: number;
}

// API 回應介面 - 根據規格定義
interface KdsWorkstationResponse {
  message: string;
  code: string;
  data: KdsWorkstation[] | null;
}

// 模擬工作站資料庫
const mockWorkstationDatabase: Record<number, KdsWorkstation[]> = {
  1: [ // Store ID 1 - 台北店
    {
      uid: 1,
      no: "001",
      name: "醬區",
      brandId: 10,
      storeId: 1,
      isOn: 1,
      serialNo: 1,
      memo: "醬料製作區",
      creatorId: 500,
      createDate: "2025-01-11T09:00:00",
      modifyId: 501,
      modifyDate: "2025-01-11T09:30:00",
      isDisabled: 0,
      status: 1,
      companyId: 200,
      isDefault: 0,
      isAutoTimeOn: 0,
      isAutoOrderOn: 1,
      isAutoProductTypeOn: 0,
      isAutoProductOn: 1,
      kdsDiningType: 1,
      kdsStoreArea: 1,
      kdsDisplayTypeId: 1,
      isNoDisplay: 0,
      isOvertimeNotify: 1,
      isCookingNotify: 1,
      isMealSound: 1,
      isUrgingSound: 0,
      overtimeNotifyMin: 10,
      cookingNotifyMin: 5,
      isAllProduct: 1,
      progressiveTypeId: 2,
      autoTimeOnMin: 15,
      autoOrderOnQty: 3,
      nextWorkstationId: 2,
      isFirstStation: 1,
      isGoOn: 0,
      prevWorkstationId: null,
      dineOver: 0,
      taskTime: 30,
      displayType: 1,
      cardType: 1
    },
    {
      uid: 2,
      no: "002",
      name: "打包區",
      brandId: 10,
      storeId: 1,
      isOn: 1,
      serialNo: 2,
      memo: "外帶打包區",
      creatorId: 500,
      createDate: "2025-01-11T09:00:00",
      modifyId: 501,
      modifyDate: "2025-01-11T09:30:00",
      isDisabled: 0,
      status: 1,
      companyId: 200,
      isDefault: 0,
      isAutoTimeOn: 0,
      isAutoOrderOn: 1,
      isAutoProductTypeOn: 0,
      isAutoProductOn: 1,
      kdsDiningType: 1,
      kdsStoreArea: 1,
      kdsDisplayTypeId: 1,
      isNoDisplay: 0,
      isOvertimeNotify: 1,
      isCookingNotify: 1,
      isMealSound: 1,
      isUrgingSound: 0,
      overtimeNotifyMin: 10,
      cookingNotifyMin: 5,
      isAllProduct: 1,
      progressiveTypeId: 2,
      autoTimeOnMin: 15,
      autoOrderOnQty: 3,
      nextWorkstationId: 3,
      isFirstStation: 0,
      isGoOn: 1,
      prevWorkstationId: 1,
      dineOver: 0,
      taskTime: 30,
      displayType: 1,
      cardType: 1
    },
    {
      uid: 3,
      no: "003",
      name: "刨肉區",
      brandId: 10,
      storeId: 1,
      isOn: 1,
      serialNo: 3,
      memo: "肉類處理區",
      creatorId: 500,
      createDate: "2025-01-11T09:00:00",
      modifyId: 501,
      modifyDate: "2025-01-11T09:30:00",
      isDisabled: 0,
      status: 1,
      companyId: 200,
      isDefault: 1,
      isAutoTimeOn: 0,
      isAutoOrderOn: 1,
      isAutoProductTypeOn: 0,
      isAutoProductOn: 1,
      kdsDiningType: 1,
      kdsStoreArea: 1,
      kdsDisplayTypeId: 1,
      isNoDisplay: 0,
      isOvertimeNotify: 1,
      isCookingNotify: 1,
      isMealSound: 1,
      isUrgingSound: 0,
      overtimeNotifyMin: 10,
      cookingNotifyMin: 5,
      isAllProduct: 1,
      progressiveTypeId: 2,
      autoTimeOnMin: 15,
      autoOrderOnQty: 3,
      nextWorkstationId: 4,
      isFirstStation: 0,
      isGoOn: 1,
      prevWorkstationId: 2,
      dineOver: 0,
      taskTime: 30,
      displayType: 1,
      cardType: 1
    },
    {
      uid: 4,
      no: "004",
      name: "菜盤",
      brandId: 10,
      storeId: 1,
      isOn: 1,
      serialNo: 4,
      memo: "蔬菜處理區",
      creatorId: 500,
      createDate: "2025-01-11T09:00:00",
      modifyId: 501,
      modifyDate: "2025-01-11T09:30:00",
      isDisabled: 0,
      status: 1,
      companyId: 200,
      isDefault: 0,
      isAutoTimeOn: 0,
      isAutoOrderOn: 1,
      isAutoProductTypeOn: 0,
      isAutoProductOn: 1,
      kdsDiningType: 1,
      kdsStoreArea: 1,
      kdsDisplayTypeId: 1,
      isNoDisplay: 0,
      isOvertimeNotify: 1,
      isCookingNotify: 1,
      isMealSound: 1,
      isUrgingSound: 0,
      overtimeNotifyMin: 10,
      cookingNotifyMin: 5,
      isAllProduct: 1,
      progressiveTypeId: 2,
      autoTimeOnMin: 15,
      autoOrderOnQty: 3,
      nextWorkstationId: 5,
      isFirstStation: 0,
      isGoOn: 1,
      prevWorkstationId: 3,
      dineOver: 0,
      taskTime: 30,
      displayType: 1,
      cardType: 1
    },
    {
      uid: 5,
      no: "005",
      name: "大盤",
      brandId: 10,
      storeId: 1,
      isOn: 1,
      serialNo: 5,
      memo: "大份量製作區",
      creatorId: 500,
      createDate: "2025-01-11T09:00:00",
      modifyId: 501,
      modifyDate: "2025-01-11T09:30:00",
      isDisabled: 0,
      status: 1,
      companyId: 200,
      isDefault: 0,
      isAutoTimeOn: 0,
      isAutoOrderOn: 1,
      isAutoProductTypeOn: 0,
      isAutoProductOn: 1,
      kdsDiningType: 1,
      kdsStoreArea: 1,
      kdsDisplayTypeId: 1,
      isNoDisplay: 0,
      isOvertimeNotify: 1,
      isCookingNotify: 1,
      isMealSound: 1,
      isUrgingSound: 0,
      overtimeNotifyMin: 10,
      cookingNotifyMin: 5,
      isAllProduct: 1,
      progressiveTypeId: 2,
      autoTimeOnMin: 15,
      autoOrderOnQty: 3,
      nextWorkstationId: 0,
      isFirstStation: 0,
      isGoOn: 0,
      prevWorkstationId: 4,
      dineOver: 1,
      taskTime: 30,
      displayType: 1,
      cardType: 1
    }
  ],
  2: [ // Store ID 2 - 台中店
    {
      uid: 6,
      no: "001",
      name: "台中醬區",
      brandId: 10,
      storeId: 2,
      isOn: 1,
      serialNo: 1,
      memo: "台中店醬料製作區",
      creatorId: 500,
      createDate: "2025-01-11T09:00:00",
      modifyId: 501,
      modifyDate: "2025-01-11T09:30:00",
      isDisabled: 0,
      status: 1,
      companyId: 200,
      isDefault: 0,
      isAutoTimeOn: 0,
      isAutoOrderOn: 1,
      isAutoProductTypeOn: 0,
      isAutoProductOn: 1,
      kdsDiningType: 1,
      kdsStoreArea: 1,
      kdsDisplayTypeId: 1,
      isNoDisplay: 0,
      isOvertimeNotify: 1,
      isCookingNotify: 1,
      isMealSound: 1,
      isUrgingSound: 0,
      overtimeNotifyMin: 10,
      cookingNotifyMin: 5,
      isAllProduct: 1,
      progressiveTypeId: 2,
      autoTimeOnMin: 15,
      autoOrderOnQty: 3,
      nextWorkstationId: 7,
      isFirstStation: 1,
      isGoOn: 0,
      prevWorkstationId: null,
      dineOver: 0,
      taskTime: 30,
      displayType: 1,
      cardType: 1
    },
    {
      uid: 7,
      no: "002",
      name: "台中袍肉區",
      brandId: 10,
      storeId: 2,
      isOn: 1,
      serialNo: 2,
      memo: "台中店肉類處理區",
      creatorId: 500,
      createDate: "2025-01-11T09:00:00",
      modifyId: 501,
      modifyDate: "2025-01-11T09:30:00",
      isDisabled: 0,
      status: 1,
      companyId: 200,
      isDefault: 1,
      isAutoTimeOn: 0,
      isAutoOrderOn: 1,
      isAutoProductTypeOn: 0,
      isAutoProductOn: 1,
      kdsDiningType: 1,
      kdsStoreArea: 1,
      kdsDisplayTypeId: 1,
      isNoDisplay: 0,
      isOvertimeNotify: 1,
      isCookingNotify: 1,
      isMealSound: 1,
      isUrgingSound: 0,
      overtimeNotifyMin: 10,
      cookingNotifyMin: 5,
      isAllProduct: 1,
      progressiveTypeId: 2,
      autoTimeOnMin: 15,
      autoOrderOnQty: 3,
      nextWorkstationId: 8,
      isFirstStation: 0,
      isGoOn: 1,
      prevWorkstationId: 6,
      dineOver: 0,
      taskTime: 30,
      displayType: 1,
      cardType: 1
    },
    {
      uid: 8,
      no: "003",
      name: "台中打包區",
      brandId: 10,
      storeId: 2,
      isOn: 1,
      serialNo: 3,
      memo: "台中店外帶打包區",
      creatorId: 500,
      createDate: "2025-01-11T09:00:00",
      modifyId: 501,
      modifyDate: "2025-01-11T09:30:00",
      isDisabled: 0,
      status: 1,
      companyId: 200,
      isDefault: 0,
      isAutoTimeOn: 0,
      isAutoOrderOn: 1,
      isAutoProductTypeOn: 0,
      isAutoProductOn: 1,
      kdsDiningType: 1,
      kdsStoreArea: 1,
      kdsDisplayTypeId: 1,
      isNoDisplay: 0,
      isOvertimeNotify: 1,
      isCookingNotify: 1,
      isMealSound: 1,
      isUrgingSound: 0,
      overtimeNotifyMin: 10,
      cookingNotifyMin: 5,
      isAllProduct: 1,
      progressiveTypeId: 2,
      autoTimeOnMin: 15,
      autoOrderOnQty: 3,
      nextWorkstationId: 0,
      isFirstStation: 0,
      isGoOn: 0,
      prevWorkstationId: 7,
      dineOver: 1,
      taskTime: 30,
      displayType: 1,
      cardType: 1
    }
  ]
};

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

    // 模擬網路延遲（可選，用於測試載入狀態）
    const delay = searchParams.get('delay');
    if (delay) {
      const delayMs = parseInt(delay);
      if (!isNaN(delayMs) && delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    // 模擬隨機錯誤（可選，用於測試錯誤處理）
    const simulateError = searchParams.get('error');
    if (simulateError === 'true') {
      return NextResponse.json({
        message: '模擬的網路錯誤',
        code: '9999',
        data: null
      }, { status: 500 });
    }

    // 從模擬資料庫獲取工作站資料
    const storeWorkstations = mockWorkstationDatabase[storeIdNum];
    
    if (!storeWorkstations) {
      return NextResponse.json({
        message: `找不到 storeId ${storeIdNum} 的工作站資料`,
        code: '9999',
        data: null
      }, { status: 404 });
    }

    // 根據 storeId 過濾工作站，只回傳啟用狀態的工作站 (isOn == 1)
    const activeWorkstations = storeWorkstations.filter(ws => 
      ws.isOn === 1 && ws.isDisabled === 0
    );
    
    // 根據 serialNo 排序
    const sortedWorkstations = activeWorkstations.sort((a, b) => a.serialNo - b.serialNo);
    
    // 回傳成功回應
    return NextResponse.json({
      message: "",
      code: "0000",
      data: sortedWorkstations.length > 0 ? sortedWorkstations : null
    });
    
  } catch (error) {
    console.error('取得 KDS 工作站清單 API 錯誤:', error);
    
    // 回傳失敗回應
    return NextResponse.json({
      message: '取得工作站清單過程中發生錯誤',
      code: '9999',
      data: null
    }, { status: 500 });
  }
}
