# Mantine 統一架構遷移指南

## 🎯 目標

將整個項目統一使用 Mantine 架構，提升開發效率和維護性。

## 📋 已完成的工作

### ✅ 登入頁面
- 重寫為 Mantine 組件
- 移除 CSS Modules 檔案
- 保持原有設計風格

### ✅ 主題配置
- 建立統一的主題檔案 (`src/lib/mantine-theme.ts`)
- 配置自訂色彩系統
- 設定組件預設樣式

### ✅ 佈局更新
- 更新 `layout.tsx` 使用自訂主題
- 保持現有功能不變

## 🚀 下一步遷移計劃

### 階段 1：核心組件轉換（優先級：高）

#### 1.1 主頁面組件 (`src/app/page.tsx`)
```tsx
// 目前使用自訂樣式系統
import { mainPageStyles } from '../styles/mainPageStyles';

// 建議轉換為 Mantine 組件
import { Container, Grid, Paper, Title, Text } from '@mantine/core';
```

**轉換重點：**
- 使用 `Container` 替代自訂容器
- 使用 `Grid` 系統替代自訂佈局
- 使用 `Paper` 替代自訂卡片樣式

#### 1.2 工作台組件 (`src/components/WorkstationBoard/`)
```tsx
// 建議轉換順序：
1. StatusBar - 使用 Mantine 的 Group, Badge, Text
2. WorkBoard - 使用 Mantine 的 Grid, Card, Text
3. LeftSidebar - 使用 Mantine 的 Stack, Button, Text
4. Modal 組件 - 使用 Mantine 的 Modal, Form, Input
```

### 階段 2：樣式系統統一（優先級：中）

#### 2.1 移除自訂樣式檔案
```
src/styles/
├── mainPageStyles.ts      # 轉換為 Mantine 組件
├── workBoardStyles.ts     # 轉換為 Mantine 組件
├── leftSidebarStyles.ts   # 轉換為 Mantine 組件
└── ...                    # 其他樣式檔案
```

#### 2.2 建立 Mantine 組件變體
```tsx
// 在 mantine-theme.ts 中定義自訂組件樣式
components: {
  CustomCard: {
    defaultProps: {
      radius: 'lg',
      shadow: 'md',
      p: 'lg',
    },
    styles: {
      root: {
        backgroundColor: 'var(--mantine-color-blue-0)',
        border: '1px solid var(--mantine-color-blue-2)',
      },
    },
  },
}
```

### 階段 3：進階功能整合（優先級：低）

#### 3.1 通知系統
```tsx
// 使用 Mantine Notifications
import { notifications } from '@mantine/notifications';

notifications.show({
  title: '操作成功',
  message: '資料已更新',
  color: 'green',
});
```

#### 3.2 表單驗證
```tsx
// 使用 Mantine Form + Zod
import { useForm } from '@mantine/form';
import { z } from 'zod';

const form = useForm({
  initialValues: { username: '', password: '' },
  validate: zodResolver(schema),
});
```

## 🛠️ 遷移工具和技巧

### 1. 組件對應表

| 自訂組件 | Mantine 替代 | 說明 |
|---------|-------------|------|
| `<div style={styles.container}>` | `<Container>` | 響應式容器 |
| `<div style={styles.card}>` | `<Paper>` | 卡片容器 |
| `<button>` | `<Button>` | 按鈕組件 |
| `<input>` | `<TextInput>` | 文字輸入 |
| `<select>` | `<Select>` | 下拉選單 |
| `<table>` | `<Table>` | 表格組件 |

### 2. 樣式轉換指南

#### 自訂 CSS → Mantine Props
```tsx
// 舊方式
<div style={{ 
  padding: '1rem', 
  margin: '0.5rem',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
}}>

// 新方式
<Paper p="md" m="xs" radius="md" shadow="sm">
```

#### 響應式設計
```tsx
// 舊方式
const styles = mainPageStyles({ isMobile, isTablet });

// 新方式
<Container size={{ base: '100%', sm: 'md', lg: 'lg' }}>
```

### 3. 常見遷移模式

#### 模式 1：直接替換
```tsx
// 簡單的 div 可以直接替換
<div className="card"> → <Paper>
<div className="button"> → <Button>
```

#### 模式 2：組合使用
```tsx
// 複雜佈局使用 Mantine 佈局組件
<Grid>
  <Grid.Col span={{ base: 12, md: 6 }}>
    <Paper>內容</Paper>
  </Grid.Col>
</Grid>
```

#### 模式 3：自訂樣式
```tsx
// 特殊樣式使用 styles 屬性
<Button
  styles={{
    root: {
      background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
    },
  }}
>
```

## 📚 學習資源

### 1. 官方文檔
- [Mantine 官方文檔](https://mantine.dev/)
- [組件 API 參考](https://mantine.dev/core/button/)
- [主題系統](https://mantine.dev/theming/theme/)

### 2. 實用範例
- [佈局範例](https://mantine.dev/core/container/)
- [表單範例](https://mantine.dev/core/form/)
- [響應式設計](https://mantine.dev/core/container/#responsive)

### 3. 社群資源
- [GitHub 討論](https://github.com/mantinedev/mantine/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/mantine)

## ⚠️ 注意事項

### 1. 遷移原則
- **漸進式轉換**：一次轉換一個組件
- **保持功能**：確保轉換後功能不變
- **測試驗證**：每次轉換後都要測試

### 2. 常見問題
- **樣式衝突**：注意自訂樣式與 Mantine 樣式的優先級
- **組件 API**：熟悉 Mantine 組件的 props 和事件
- **主題覆蓋**：使用主題系統而非硬編碼樣式

### 3. 性能考量
- **按需導入**：只導入需要的組件
- **樣式優化**：避免過度自訂樣式
- **組件重用**：建立可重用的組件變體

## 🎉 遷移完成後的優勢

### 1. 開發效率
- **組件豐富**：內建大量常用組件
- **樣式系統**：統一的設計語言
- **響應式設計**：自動處理各種螢幕尺寸

### 2. 維護性
- **單一檔案**：邏輯和樣式集中管理
- **一致性**：所有組件使用相同的設計系統
- **主題系統**：容易切換和自訂主題

### 3. 使用者體驗
- **無障礙支援**：內建 accessibility 功能
- **動畫效果**：流暢的互動體驗
- **載入狀態**：清晰的視覺回饋

## 📞 需要幫助？

如果在遷移過程中遇到問題：

1. **檢查文檔**：先查看 Mantine 官方文檔
2. **搜尋範例**：在 GitHub 上搜尋類似用法
3. **社群求助**：在 Mantine 討論區提問
4. **團隊討論**：與團隊成員討論最佳實踐

---

**記住：遷移是一個漸進的過程，不要急於一次完成所有轉換。穩步推進，確保每個步驟都正確完成。**

