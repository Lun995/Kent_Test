# 按鈕組件重構總結

## 重構目標

根據用戶要求："調整切分方式，左側的部分請調整為一般按鈕樣式(部分銷單)命名為NormalButton與 SettingButton (工作站) 兩種樣式。未來若要套用較方便"

## 重構內容

### 1. 創建新的按鈕組件

#### NormalButton（一般功能按鈕）
- **文件位置**：`src/components/WorkstationBoard/NormalButton.tsx`
- **樣式文件**：`src/styles/normalButtonStyles.ts`
- **用途**：用於一般功能操作，如部分銷單、歷史紀錄、備餐總數等
- **特點**：圓角邊框、完整邊框樣式、陰影效果、垂直文字佈局

#### SettingButton（設定相關按鈕）
- **文件位置**：`src/components/WorkstationBoard/SettingButton.tsx`
- **樣式文件**：`src/styles/settingButtonStyles.ts`
- **用途**：用於設定和配置相關的按鈕
- **變體**：
  - `workstation`：工作站選擇按鈕
  - `setting`：系統設定按鈕

#### CountdownButton（倒數計時按鈕）
- **文件位置**：`src/components/WorkstationBoard/CountdownButton.tsx`
- **樣式文件**：`src/styles/countdownButtonStyles.ts`
- **用途**：專門用於顯示倒數計時信息
- **特點**：三行文字顯示、特殊佈局

### 2. 重構 LeftSidebar 組件

- **原狀態**：使用內聯樣式和重複的 Button 組件
- **新狀態**：使用專門的按鈕組件，代碼更清晰
- **優勢**：樣式統一、易於維護、可重用

### 3. 樣式文件重構

- **清理**：從 `leftSidebarStyles.ts` 中移除不再需要的按鈕樣式
- **分離**：按鈕樣式分別放在對應的樣式文件中
- **保留**：佈局和容器相關的樣式保留在 `leftSidebarStyles.ts` 中

## 文件結構變化

### 新增文件
```
src/components/WorkstationBoard/
├── NormalButton.tsx           # 一般功能按鈕組件
├── SettingButton.tsx          # 設定相關按鈕組件
├── CountdownButton.tsx        # 倒數計時按鈕組件
└── BUTTON_ARCHITECTURE.md     # 按鈕架構說明文檔

src/styles/
├── normalButtonStyles.ts      # NormalButton 樣式
├── settingButtonStyles.ts     # SettingButton 樣式
└── countdownButtonStyles.ts   # CountdownButton 樣式
```

### 修改文件
- `src/components/WorkstationBoard/LeftSidebar.tsx` - 使用新的按鈕組件
- `src/components/WorkstationBoard/index.ts` - 導出新的按鈕組件
- `src/styles/leftSidebarStyles.ts` - 清理不再需要的樣式

## 重構優勢

### 1. 樣式一致性
- 同類型的按鈕具有統一的樣式
- 避免樣式不一致的問題

### 2. 易於維護
- 樣式集中管理
- 修改時只需更新對應的樣式文件
- 減少重複代碼

### 3. 重用性
- 可以在其他頁面或組件中重用這些按鈕組件
- 提高開發效率

### 4. 類型安全
- TypeScript 提供完整的類型檢查
- 減少運行時錯誤

### 5. 響應式設計
- 自動適配不同設備尺寸
- 統一的響應式邏輯

## 使用方式

### 導入組件
```typescript
import { NormalButton, SettingButton, CountdownButton } from '../components/WorkstationBoard';
```

### 使用示例
```typescript
// 一般功能按鈕
<NormalButton onClick={handlePartialCancel} color="blue">
  <div>部分</div>
  <div>銷單</div>
</NormalButton>

// 工作站按鈕
<SettingButton onClick={handleWorkstationClick} color="gray" variant="workstation">
  <div>{currentWorkstation}</div>
</SettingButton>

// 倒數計時按鈕
<CountdownButton
  onClick={handleCountdownReset}
  currentItem={currentItem}
  totalItems={totalItems}
  countdown={countdown}
/>
```

## 未來擴展建議

1. **更多按鈕變體**：可以添加 `DangerButton`、`SuccessButton` 等
2. **自定義樣式選項**：添加更多樣式配置選項
3. **動畫效果**：添加按鈕點擊和懸停的動畫效果
4. **無障礙功能**：添加 ARIA 標籤和鍵盤導航支持
5. **主題系統**：支持深色/淺色主題切換

## 測試結果

- ✅ 項目構建成功
- ✅ 無 TypeScript 錯誤
- ✅ 無 ESLint 錯誤
- ✅ 組件正常導出
- ✅ 樣式文件正確分離

## 總結

本次重構成功將左側邊欄的按鈕樣式分類為三種專門的組件，實現了：
- 樣式的統一性和一致性
- 代碼的可維護性和重用性
- 清晰的組件架構
- 未來擴展的便利性

這樣的架構設計讓後續開發更加容易檢視和維護，符合用戶的需求。
