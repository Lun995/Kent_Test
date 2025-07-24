# 專案目錄結構規劃

```
public/                # 靜態資源 (圖片、favicon 等)
src/                   # 主要程式碼都放這
  ├── app/             # Next.js app router 頁面入口（代替 pages/）
  │   ├── layout.tsx   # 全站 layout（可含 header/footer）
  │   ├── page.tsx     # 首頁（路由 /）
  │   └── about/       # /about 頁面（待建立）
  │       └── page.tsx
  ├── components/      # 共用 UI 元件（如 Button, Header, Card）(已存在)
  ├── features/        # 功能模組資料夾（如 blog、user、product）（待建立）
  ├── hooks/           # 自訂 hooks（如 useDebounce、useUser）（待建立）
  ├── styles/          # CSS/SCSS/styled-components 全域樣式（已存在）
  ├── utils/           # 工具函式（例如 formatter、validator）（待建立）
  └── types/           # TypeScript 型別定義（待建立）
.env.local             # 本地環境變數
next.config.js         # Next.js 設定檔
tsconfig.json          # TypeScript 設定
package.json
```

## 已存在資料夾
- public/
- src/app/
- src/components/
- styles/

## 待建立資料夾
- src/app/about/
- src/features/
- src/hooks/
- src/utils/
- src/types/
