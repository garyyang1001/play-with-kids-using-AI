# 🚨 404 錯誤快速修復指南

## 問題：Failed to load resource: the server responded with a status of 404 (Not Found)

### 原因分析
- 環境變數沒有正確更新（模型還是顯示舊版本）
- Live API 模型名稱錯誤或不可用
- API Key 沒有 Live API 權限

## ⚡ 立即修復步驟

### 1. 檢查當前環境變數
```bash
# 查看 .env.local 文件
cat .env.local

# 如果文件不存在，複製範本
cp .env.example .env.local
```

### 2. 更新 .env.local 內容
```bash
# 編輯文件
nano .env.local
```

**按順序嘗試以下模型配置：**

#### 選項 1（推薦）：
```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_GEMINI_MODEL=gemini-2.0-flash-live-001
NEXT_PUBLIC_GEMINI_VOICE=Aoede
NEXT_PUBLIC_GEMINI_LANGUAGE=zh-TW
```

#### 選項 2（如果選項1失敗）：
```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_GEMINI_MODEL=gemini-2.0-flash-live-preview-04-09
NEXT_PUBLIC_GEMINI_VOICE=Aoede
NEXT_PUBLIC_GEMINI_LANGUAGE=zh-TW
```

#### 選項 3（完整路徑）：
```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_GEMINI_MODEL=models/gemini-2.0-flash-live-001
NEXT_PUBLIC_GEMINI_VOICE=Aoede
NEXT_PUBLIC_GEMINI_LANGUAGE=zh-TW
```

### 3. 重啟服務
```bash
# 停止當前服務 (Ctrl+C)
# 重新啟動
npm run dev
```

### 4. 測試連接
訪問：`http://localhost:3000/voice-test-debug`

## 🔍 逐步測試流程

### Step 1: 環境檢查
```bash
# 檢查環境變數是否正確載入
curl http://localhost:3000/env-check
```

### Step 2: Live API 測試
1. 訪問 `/voice-test-debug`
2. 點擊「測試連接」
3. 查看日誌輸出

### Step 3: 如果還是 404 錯誤
嘗試下一個模型選項，重複步驟 2-4

## 🛠️ 進階除錯

### 檢查 API Key 權限
1. 登入 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 確認 API Key 狀態為「Active」
3. 檢查是否有 Live API 存取權限

### 瀏覽器除錯
1. 開啟開發者工具 (F12)
2. 查看 Console 和 Network 頁籤
3. 記錄錯誤訊息

### 網路檢查
```bash
# 測試網路連接
ping googleapis.com
```

## 📝 常見解決方案

### 方案 1: 重新獲取 API Key
1. 刪除舊的 API Key
2. 創建新的 API Key
3. 更新 .env.local

### 方案 2: 清除瀏覽器快取
1. 清除瀏覽器快取和 Cookies
2. 重新載入頁面

### 方案 3: 使用備用模型
如果所有 Live API 模型都失敗，暫時使用：
```bash
NEXT_PUBLIC_GEMINI_MODEL=gemini-2.0-flash-exp
```
（注意：此模型不支援語音功能，僅用於測試）

## 🆘 仍然無法解決？

### 收集錯誤資訊
1. 瀏覽器控制台完整錯誤訊息
2. `/voice-test-debug` 頁面的日誌輸出
3. 使用的模型名稱和 API Key（前幾位）

### 聯繫支援
在 GitHub Issues 中提供：
- 錯誤截圖
- 環境變數配置（隱藏 API Key）
- 瀏覽器和版本資訊

## ✅ 成功指標

當修復成功時，你應該看到：
- Debug 頁面顯示「✅ Live API 連接成功！」
- 模型顯示為正確的 Live API 版本
- 麥克風測試通過
- 無 404 或其他連接錯誤

---

**記住：每次修改 .env.local 後都要重啟開發伺服器！**
