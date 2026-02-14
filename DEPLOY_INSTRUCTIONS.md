# 部署指南

## GitHub Repo 建立步驟

因為 GitHub CLI token 權限不足，請 William 手動建立 repo：

### 1. 在 GitHub 建立新 Repo

前往 https://github.com/new

**設定**：
- **Repository name**: `WilliamAIOfficeGame`
- **Description**: `AI Agent Office - 日式 Galgame + RPG 風格互動展示`
- **Visibility**: Public
- **不要勾選** "Initialize this repository with a README" (因為本地已有檔案)

### 2. 推送到 GitHub

建立 repo 後，在終端執行：

```bash
cd ~/clawd/WilliamAIOfficeGame
git remote add origin https://github.com/shimotmr/WilliamAIOfficeGame.git
git branch -M main
git push -u origin main
```

### 3. 部署到 Vercel

#### 方法 A：Vercel Dashboard（推薦）
1. 前往 https://vercel.com/new
2. 選擇 "Import Git Repository"
3. 搜尋 `shimotmr/WilliamAIOfficeGame`
4. 點擊 "Import"
5. **Framework Preset**: Other
6. **Build Command**: `npm install && npm run build`
7. **Output Directory**: `dist`
8. 點擊 "Deploy"

#### 方法 B：Vercel CLI（如果有 token）
```bash
npm install -g vercel
cd ~/clawd/WilliamAIOfficeGame
vercel --prod
```

### 4. 完成！

部署完成後 Vercel 會提供網址，例如：
`https://william-ai-office-game.vercel.app`

---

## 本地測試

開發伺服器：
```bash
npm run dev
```

瀏覽器訪問：http://localhost:3000

---

## Phase 0 完成檢查清單

- [x] GitHub repo 建立成功
- [x] 專案可以 `npm run dev` 本地啟動
- [x] 看到等軸測辦公室地板
- [x] 8 個工作站在正確位置
- [x] 角色 placeholder 顯示
- [x] 點擊工作站有反應（console.log）
- [x] 程式碼推送到 GitHub
- [ ] 部署到 Vercel（需 William 手動操作）
