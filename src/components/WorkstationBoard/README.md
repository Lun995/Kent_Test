# 工作看板組件架構說明

## 概述
這個目錄包含了工作站看板的所有組件，按照 Next.js 的最佳實踐進行了重構，將原本混亂的內聯樣式和邏輯分離到對應的組件和樣式文件中。

## 組件結構

### 核心組件

#### 1. LeftSidebar (左側邊欄)
- **文件**: `LeftSidebar.tsx`
- **樣式**: `src/styles/leftSidebarStyles.ts`
- **功能**: 包含所有左側按鈕（倒數計時、部分銷單、歷史紀錄、備餐總數、工作站選擇、設定）
- **特色**: 響應式設計，支援手機、平板、桌面設備

#### 2. StatusBar (頂部狀態欄)
- **文件**: `StatusBar.tsx`
- **樣式**: `src/styles/statusBarStyles.ts`
- **功能**: 顯示待製作批次和逾時批次數量
- **特色**: 清晰的視覺層次和響應式設計

#### 3. WorkBoard (工作看板)
- **文件**: `WorkBoard.tsx`
- **樣式**: `src/styles/workBoardStyles.ts`
- **功能**: 三欄式工作看板（製作中、Hold、待製作）
- **特色**: 支援品項選擇、雙擊刪除、動畫效果

### Modal 組件

#### 4. PartialCancelModal (部分銷單 Modal)
- **文件**: `PartialCancelModal.tsx`
- **樣式**: `src/styles/partialCancelModalStyles.ts`
- **功能**: 處理部分銷單的數量調整
- **特色**: 支援加減按鈕、數量驗證

#### 5. SelectItemModal (選取品項提示 Modal)
- **文件**: `SelectItemModal.tsx`
- **樣式**: `src/styles/selectItemModalStyles.ts`
- **功能**: 提示用戶先選擇品項
- **特色**: 簡潔的提示介面

#### 6. BackupScreen (備餐總數畫面)
- **文件**: `BackupScreen.tsx`
- **樣式**: `src/styles/backupScreenStyles.ts`
- **功能**: 全螢幕顯示備餐總數
- **特色**: 黑色背景、大字體顯示

#### 7. Clock (時鐘組件)
- **文件**: `Clock.tsx`
- **樣式**: `src/styles/clockStyles.ts`
- **功能**: 顯示當前時間
- **特色**: 每秒更新、響應式字體大小

## 樣式架構

### 樣式文件位置
所有樣式都放在 `src/styles/` 目錄下，每個組件都有對應的樣式文件。

### 響應式設計
- **手機**: 寬度 < 768px 或寬高比 > 2.5
- **平板**: 寬度 >= 768px 且寬高比 <= 2.5 且寬度 <= 1400px
- **桌面**: 其他情況

### 樣式特點
- 使用 TypeScript 類型安全的樣式定義
- 支援動態樣式計算
- 統一的設計語言和色彩系統

## 自定義 Hooks

### useIsMobile
- **文件**: `src/hooks/useIsMobile.ts`
- **功能**: 提供響應式判斷邏輯
- **返回**: `{ isMobile, isTablet }`

### useAudioPlayer
- **文件**: `src/hooks/useAudioPlayer.ts`
- **功能**: 處理音效播放
- **返回**: `{ playSound, stopSound, isPlaying }`

## 使用方式

### 在主頁面中引入
```tsx
import { 
  LeftSidebar, 
  StatusBar, 
  WorkBoard, 
  PartialCancelModal, 
  SelectItemModal, 
  BackupScreen 
} from '../components/WorkstationBoard';
```

### 組件屬性
每個組件都有明確的 TypeScript 介面定義，確保使用時的正確性。

## 重構優勢

1. **可維護性**: 每個組件職責單一，易於理解和修改
2. **可重用性**: 組件可以在其他頁面中重複使用
3. **可測試性**: 每個組件都可以獨立測試
4. **樣式管理**: 樣式與邏輯分離，便於設計師和開發者協作
5. **類型安全**: 完整的 TypeScript 支援，減少運行時錯誤

## 後續開發建議

1. **新增功能**: 在對應的組件中添加新功能
2. **樣式調整**: 修改對應的樣式文件
3. **狀態管理**: 使用 Context 或 Redux 進行全局狀態管理
4. **測試**: 為每個組件編寫單元測試
5. **文檔**: 及時更新組件文檔和 API 說明
