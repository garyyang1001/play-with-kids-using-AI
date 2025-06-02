# 🎯 AI 親子創作坊

親子 AI 影片創作 + Prompt Engineering 教學平台

## 🚀 專案概述

讓家長與孩子透過語音對話互動，學習 AI 溝通技巧，共同創作 AI 卡通影片。

### 核心價值
- 降低 AI 使用門檻，讓家長不排斥 AI
- 親子共學 Prompt Engineering 概念
- 5分鐘完整 AI 創作體驗
- 高品質影片生成與社群分享

## 🛠️ 技術架構

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **語音對話**: @google/genai + WebSocket (Live API)
- **AI 模型**: gemini-2.5-flash-preview-native-audio-dialog + veo-2.0-generate-001
- **語音**: Leda（台灣中文腔調）
- **後端**: Firebase Firestore + Auth
- **部署**: Vercel

## 📋 開發階段

### 🔧 階段 1：核心語音對話系統 (進行中)
- [ ] 升級專案依賴
- [ ] 實作 VoiceAIClient 類別
- [ ] 配置 Live API WebSocket 連接
- [ ] 實作語音輸入輸出處理
- [ ] 建立基礎對話會話管理
- [ ] 加入自動重連機制
- [ ] 語音品質測試與優化

### 🧠 階段 2：Prompt Engineering 教學引擎
### 🏗️ 階段 3：模板系統架構
### 🎨 階段 4：三大模板實作
### 🎬 階段 5：Veo2 影片生成整合
### 📱 階段 6：社群分享與系統完善

## 🏃‍♂️ 快速開始

```bash
# 安裝依賴
npm install

# 複製環境變數檔案
cp .env.example .env.local
# 編輯 .env.local 填入你的 API 金鑰

# 啟動開發伺服器
npm run dev
```

## 📝 開發進度

詳細進度追蹤請查看 [todo.md](./todo.md)

## 🎯 成功指標

### 技術指標
- 語音辨識準確率：≥ 90%
- 影片生成成功率：≥ 95%
- Prompt 品質提升：平均提升 3-5 倍
- 系統響應時間：≤ 2 秒

### 用戶體驗指標
- 完整體驗完成率：≥ 80%
- 用戶滿意度：≥ 4.5/5
- 重複使用率：≥ 60%
- 社群分享率：≥ 30%

## 📄 授權

本專案採用 MIT 授權條款。
