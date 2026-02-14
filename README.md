# William AI Office Game

AI Agent 展示頁面遊戲 - 日式 Galgame + RPG 等軸測風格

## Phase 0 - 等軸測場景 PoC ✅

### 已完成功能
- ✅ Vite + TypeScript + Phaser 3 專案架構
- ✅ 等軸測辦公室地板渲染（20x18 菱形地磚）
- ✅ 8 個 Agent 工作站配置
- ✅ 角色 placeholder 顯示（彩色圓形 + 名稱）
- ✅ 點擊互動（console.log 輸出）
- ✅ 相機控制（右鍵拖曳平移、滾輪縮放）

### 技術棧
- **核心框架**: Vite + TypeScript
- **遊戲引擎**: Phaser 3.80
- **部署**: Vercel

### 本地開發

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建構生產版本
npm run build

# 預覽建構結果
npm run preview
```

### 8 位 Agent 角色配置

| Agent | 工作站 | 顏色 | 職位 |
|-------|--------|------|------|
| Travis | 指揮中心 | 藍 (#1E3A8A) | System Coordinator |
| Researcher | 數據牆 | 藍綠 (#0E7490) | Data Analyst |
| Inspector | 品管室 | 黑 (#000000) | Quality Assurance |
| Secretary | 接待區 | 棕 (#92400E) | Office Manager |
| Coder | 實驗室 | 綠 (#10B981) | Software Engineer |
| Writer | 寫作間 | 深棕 (#78350F) | Content Creator |
| Designer | 工作室 | 紫 (#8B5CF6) | UI/UX Designer |
| Analyst | 交易室 | 金 (#B45309) | Financial Analyst |

### 操作說明
- **左鍵點擊 Agent**：查看角色資訊（目前輸出到 console）
- **右鍵拖曳**：平移視角
- **滑鼠滾輪**：縮放畫面

### 下一步計劃（Phase 1）
- [ ] 角色 Sprite 美術資源
- [ ] Live2D 角色動畫
- [ ] 場景裝飾物件
- [ ] 工作站詳細場景設計

---

## 線上展示

🌐 **正式網址**: https://william-ai-office-game.vercel.app  
📂 **GitHub Repo**: https://github.com/shimotmr/WilliamAIOfficeGame

---

**專案文件**: 參考 `~/clawd/memory/projects/agent-showcase-game-design.md`  
**版本**: Phase 0  
**日期**: 2026-02-14  
**狀態**: ✅ 已上線

