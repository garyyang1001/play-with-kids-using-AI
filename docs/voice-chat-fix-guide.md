# 🎤 語音對話功能修復指南

## 🔍 問題分析

原始的 `VoiceAIClient` 是空殼實作，沒有真正連接到 Google Live API。現在已經重寫為完整的 Live API 實作。

## 🛠️ 立即修復步驟

### 1. 更新依賴
```bash
npm install
# 或
yarn install
```

### 2. 設定環境變數
```bash
# 複製環境變數範本
cp .env.example .env.local

# 編輯 .env.local，添加你的 Gemini API Key
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
```

### 3. 獲取 API Key
1. 訪問 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 登入你的 Google 帳號
3. 創建新的 API Key
4. 複製並貼到 `.env.local` 檔案中

### 4. 重啟開發伺服器
```bash
npm run dev
```

## 🔧 主要修復內容

### ✅ 修復的問題：
- **真實 Live API 連接** - 使用 WebSocket 即時通訊
- **正確模型版本** - `models/gemini-2.0-flash-exp`
- **音訊串流處理** - 支援即時語音輸入輸出
- **中文語音支援** - 使用 Aoede 語音
- **斷線重連機制** - 自動處理網路問題
- **錯誤處理** - 完整的錯誤回饋機制

### 🎯 現在支援的功能：
- ✅ 即時語音對話
- ✅ 語音辨識和合成
- ✅ 中文語音互動
- ✅ 麥克風權限管理
- ✅ 連接狀態指示
- ✅ 自動重連

## 🧪 測試語音功能

### 測試步驟：
1. 開啟瀏覽器訪問：`http://localhost:3000/voice-chat?template=daily-life`
2. 確認麥克風權限已授權
3. 點擊麥克風按鈕開始對話
4. 說話測試語音辨識
5. 聆聽 AI 回應

### 檢查清單：
- [ ] API Key 已正確設定
- [ ] 麥克風權限已授權
- [ ] 網路連接穩定
- [ ] 瀏覽器支援 WebRTC
- [ ] 無控制台錯誤訊息

## 🚨 故障排除

### 問題：無法連接到語音服務
**解決方案：**
1. 檢查 API Key 是否正確
2. 確認網路連接
3. 重啟瀏覽器

### 問題：麥克風無法使用
**解決方案：**
1. 檢查瀏覽器權限設定
2. 確認麥克風硬體正常
3. 試試其他瀏覽器

### 問題：無音訊回應
**解決方案：**
1. 檢查揚聲器/耳機
2. 確認音量設定
3. 查看控制台錯誤

### 問題：連接經常斷線
**解決方案：**
1. 檢查網路穩定性
2. 更新瀏覽器版本
3. 關閉其他高耗能應用

## 📱 支援的瀏覽器

### ✅ 完全支援：
- Chrome 88+
- Edge 88+
- Safari 14+
- Firefox 84+

### ⚠️ 部分支援：
- 行動瀏覽器（功能受限）

## 🔗 相關頁面測試

現在這些頁面應該都能正常運作：

1. **基礎語音對話：**
   ```
   http://localhost:3000/voice-chat?template=daily-life
   ```

2. **夢想冒險模板：**
   ```
   http://localhost:3000/template-experience?template=夢想冒險
   ```

3. **動物朋友模板：**
   ```
   http://localhost:3000/template-experience?template=動物朋友
   ```

## 🎯 下一步計畫

語音功能修復後，建議繼續：

1. **測試各個模板** - 確保所有對話流程正常
2. **優化語音品質** - 調整音訊參數
3. **加強錯誤處理** - 完善用戶體驗
4. **實作影片生成** - 連接 Veo2 API

## 💡 開發技巧

### 除錯指令：
```bash
# 檢查環境變數
echo $NEXT_PUBLIC_GEMINI_API_KEY

# 查看即時日誌
npm run dev -- --verbose

# 類型檢查
npm run type-check
```

### 瀏覽器除錯：
1. 開啟開發者工具 (F12)
2. 查看 Console 頁籤的錯誤訊息
3. 檢查 Network 頁籤的 WebSocket 連接
4. 監控 Application 頁籤的權限狀態

## 📞 需要協助？

如果仍有問題，請提供：
1. 瀏覽器控制台的錯誤訊息
2. 使用的瀏覽器和版本
3. 網路環境（WiFi/4G等）
4. 具體的重現步驟

現在語音對話功能應該完全可用了！🎉