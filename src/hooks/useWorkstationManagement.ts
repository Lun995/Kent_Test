import { useState, useEffect } from 'react';

// 工作站介面 - 符合 KDS API 規格
export interface Workstation {
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

export function useWorkstationManagement(initialStoreId: number = 1) {
  const [storeId, setStoreId] = useState(initialStoreId);
  const [workstations, setWorkstations] = useState<Workstation[]>([]);
  const [isLoadingWorkstations, setIsLoadingWorkstations] = useState(false);
  const [workstationError, setWorkstationError] = useState<string | null>(null);
  const [currentWorkstation, setCurrentWorkstation] = useState('');

  // 獲取工作站清單的函數
  const fetchWorkstations = async (targetStoreId: number) => {
    try {
      setIsLoadingWorkstations(true);
      setWorkstationError(null);
      
      console.log(`正在獲取門市 ${targetStoreId} 的工作站資料...`);
      
      const response = await fetch(`/api/main?storeId=${targetStoreId}`);
      const result = await response.json();
      
      if (result.code === '0000' && result.data) {
        setWorkstations(result.data);
        // 如果有工作站資料，設定第一個為預設選擇
        if (result.data.length > 0) {
          setCurrentWorkstation(result.data[0].name);
          console.log(`門市 ${targetStoreId} 工作站載入成功，預設選擇: ${result.data[0].name}`);
        } else {
          setCurrentWorkstation('');
          console.log(`門市 ${targetStoreId} 沒有工作站資料`);
        }
      } else {
        setWorkstationError(result.message || '獲取工作站清單失敗');
        console.error(`門市 ${targetStoreId} 工作站載入失敗:`, result.message);
      }
    } catch (error) {
      console.error(`獲取門市 ${targetStoreId} 工作站清單錯誤:`, error);
      setWorkstationError('網路錯誤，無法獲取工作站清單');
    } finally {
      setIsLoadingWorkstations(false);
    }
  };

  // 切換門市
  const changeStore = async (newStoreId: number) => {
    if (newStoreId === storeId) {
      console.log(`已經是門市 ${newStoreId}，無需切換`);
      return;
    }
    
    console.log(`切換門市: ${storeId} → ${newStoreId}`);
    setStoreId(newStoreId);
    // 清空當前工作站選擇
    setCurrentWorkstation('');
    // 重新載入工作站資料
    await fetchWorkstations(newStoreId);
  };

  // 切換工作站
  const changeWorkstation = (stationName: string) => {
    setCurrentWorkstation(stationName);
    console.log(`切換工作站: ${stationName}`);
  };

  // 重新載入當前門市的工作站資料
  const reloadWorkstations = async () => {
    console.log(`重新載入門市 ${storeId} 的工作站資料`);
    await fetchWorkstations(storeId);
  };

  // 重新載入指定門市的工作站資料
  const reloadWorkstationsByStoreId = async (targetStoreId: number) => {
    console.log(`重新載入門市 ${targetStoreId} 的工作站資料`);
    await fetchWorkstations(targetStoreId);
  };

  // 頁面載入時自動獲取工作站清單
  useEffect(() => {
    fetchWorkstations(initialStoreId);
  }, []); // 只在組件首次載入時執行

  // 當 storeId 改變時，自動重新載入工作站資料
  useEffect(() => {
    if (storeId !== initialStoreId) {
      fetchWorkstations(storeId);
    }
  }, [storeId]); // 當 storeId 改變時執行

  return {
    // 狀態
    storeId,
    workstations,
    isLoadingWorkstations,
    workstationError,
    currentWorkstation,
    
    // 方法
    changeStore,
    changeWorkstation,
    reloadWorkstations,
    reloadWorkstationsByStoreId,
    setCurrentWorkstation
  };
}
