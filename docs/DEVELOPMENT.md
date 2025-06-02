# 開發指南

## 技術栈

### 前端
- **框架**: Next.js 14 + TypeScript
- **樣式**: Tailwind CSS
- **狀態管理**: React Hooks
- **語音處理**: Web Audio API + MediaRecorder

### AI 整合
- **語音對話**: Google Gemini Live API
- **影片生成**: Veo2 API
- **文字處理**: Gemini Flash 2.5

### 後端服務
- **資料庫**: Firebase Firestore
- **身份驗證**: Firebase Auth
- **檔案儲存**: Firebase Storage

## 開發環境設置

### 1. 環境要求
- Node.js 18+
- npm 或 yarn
- Git

### 2. 安裝依賴
```bash
npm install
```

### 3. 環境變數設定
複製 `.env.example` 為 `.env.local` 並填入你的 API 金鑰：

```bash
cp .env.example .env.local
```

編輯 `.env.local` 檔案：
```env
# Google AI API
NEXT_PUBLIC_GOOGLE_AI_API_KEY=your_api_key_here

# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... 其他 Firebase 配置

# Veo2 API
NEXT_PUBLIC_VEO2_API_KEY=your_veo2_api_key
NEXT_PUBLIC_VEO2_PROJECT_ID=your_project_id
```

### 4. 啟動開發伺服器
```bash
npm run dev
```

開啟瀏覽器訪問 `http://localhost:3000`

## 專案結構

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css         # 全域樣式
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首頁
│   └── voice-chat/         # 語音對話頁面
├── components/             # React 組件
│   └── voice-chat/         # 語音對話組件
└── lib/                    # 核心邏輯
    ├── voice-ai-client.ts  # 語音AI客戶端
    └── types/              # TypeScript 類型定義
        └── voice.ts         # 語音相關類型
```

## 開發流程

### 階段式開發
此專案採用階段式開發方法，共六個階段：

1. **階段1**: 核心語音對話系統
2. **階段2**: Prompt Engineering 教學引擎
3. **階段3**: 模板系統架構
4. **階段4**: 三大模板實作
5. **階段5**: Veo2 影片生成整合
6. **階段6**: 社群分享與系統完善

### 程式碼規範

#### TypeScript
- 使用嚴格的 TypeScript 組態
- 所有公共 API 都需要類型定義
- 優先使用 interface 而非 type

#### React 組件
- 使用函式組件 + Hooks
- 組件名稱使用 PascalCase
- Props 使用 interface 定義

#### 檔案命名
- 組件檔案：PascalCase.tsx
- 工具函式：kebab-case.ts
- 類型定義：kebab-case.ts

### Git 工作流

1. **功能開發**
   ```bash
   git checkout -b feature/功能名稱
   ```

2. **提交訊息格式**
   ```
   🚀 feat: 新增功能描述
   🐛 fix: 修復問題描述
   📄 docs: 更新文檔
   ✨ style: 樣式調整
   ♾️ refactor: 程式碼重構
   ✅ test: 測試相關
   ```

3. **合併請求**
   - 在合併前先确保通過所有測試
   - 提供清晰的 PR 描述

## 測試指南

### 單元測試
```bash
npm run test
```

### 類型檢查
```bash
npm run type-check
```

### 程式碼品質檢查
```bash
npm run lint
```

## 部署指南

### Vercel 部署
1. 連接 GitHub 倉庫到 Vercel
2. 設定環境變數
3. 自動部署將在每次 push 到 main 分支時觸發

### 環境變數設定
在 Vercel 中設定以下環境變數：
- `NEXT_PUBLIC_GOOGLE_AI_API_KEY`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_VEO2_API_KEY`
- `NEXT_PUBLIC_VEO2_PROJECT_ID`

## 常見問題

### Q: 語音功能無法使用
A: 確保瀏覽器允許麥克風權限，且使用 HTTPS 連接。

### Q: API 連接失敗
A: 檢查 `.env.local` 中的 API 金鑰是否正確設定。

### Q: 構建錯誤
A: 執行 `npm run type-check` 檢查 TypeScript 錯誤。

## 資源連結

- [Next.js 文檔](https://nextjs.org/docs)
- [Tailwind CSS 文檔](https://tailwindcss.com/docs)
- [Google AI 文檔](https://developers.google.com/ai)
- [Firebase 文檔](https://firebase.google.com/docs)
