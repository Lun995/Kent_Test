# 按鈕組件架構說明

## 概述

為了提高代碼的可維護性和重用性，我們將左側邊欄的按鈕樣式分類為三種專門的組件：

## 組件分類

### 1. NormalButton（一般功能按鈕）
- **用途**：用於一般功能操作，如部分銷單、歷史紀錄、備餐總數等
- **樣式特點**：
  - 圓角邊框（borderRadius: 8）
  - 完整的邊框樣式（border: 2px solid #222）
  - 陰影效果（boxShadow）
  - 垂直排列的文字佈局
- **適用場景**：功能操作按鈕、確認按鈕等

### 2. SettingButton（設定相關按鈕）
- **用途**：用於設定和配置相關的按鈕，如工作站選擇、系統設定等
- **樣式特點**：
  - 無圓角（borderRadius: 0）
  - 特殊的邊框樣式（根據 variant 決定）
  - 水平或垂直文字佈局（根據 variant 決定）
- **變體**：
  - `workstation`：工作站選擇按鈕，垂直文字佈局
  - `setting`：系統設定按鈕，水平文字佈局

### 3. CountdownButton（倒數計時按鈕）
- **用途**：專門用於顯示倒數計時信息的按鈕
- **樣式特點**：
  - 圓角邊框
  - 三行文字顯示（項目進度、倒數時間、狀態）
  - 特殊的佈局和樣式

## 使用方式

### 導入組件
```typescript
import { NormalButton, SettingButton, CountdownButton } from '../components/WorkstationBoard';
```

### NormalButton 使用示例
```typescript
<NormalButton
  onClick={handlePartialCancel}
  color="blue"
>
  <div>部分</div>
  <div>銷單</div>
</NormalButton>
```

### SettingButton 使用示例
```typescript
// 工作站按鈕
<SettingButton
  onClick={handleWorkstationClick}
  color="gray"
  variant="workstation"
>
  <div>{currentWorkstation}</div>
</SettingButton>

// 設定按鈕
<SettingButton
  onClick={onSettings}
  color="dark"
  variant="setting"
>
  <div>⋯</div>
</SettingButton>
```

### CountdownButton 使用示例
```typescript
<CountdownButton
  onClick={handleCountdownReset}
  currentItem={currentItem}
  totalItems={totalItems}
  countdown={countdown}
/>
```

## 樣式文件結構

```
src/styles/
├── normalButtonStyles.ts      # NormalButton 樣式
├── settingButtonStyles.ts     # SettingButton 樣式
├── countdownButtonStyles.ts   # CountdownButton 樣式
└── leftSidebarStyles.ts       # 左側邊欄佈局樣式
```

## 優勢

1. **樣式一致性**：同類型的按鈕具有統一的樣式
2. **易於維護**：樣式集中管理，修改時只需更新對應的樣式文件
3. **重用性**：可以在其他頁面或組件中重用這些按鈕組件
4. **類型安全**：TypeScript 提供完整的類型檢查
5. **響應式設計**：自動適配不同設備尺寸

## 未來擴展

- 可以添加更多按鈕變體（如 `DangerButton`、`SuccessButton` 等）
- 可以添加更多自定義樣式選項
- 可以添加動畫效果和過渡狀態
- 可以添加無障礙功能支持
