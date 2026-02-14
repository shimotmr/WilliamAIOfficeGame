/**
 * Global event notification messages
 */

export const NOTIFICATIONS = [
  '📋 Secretary 安排了明天的會議',
  '🔍 Inspector 完成了代碼審查，發現 0 個問題！',
  '☕ Writer 去泡了第三杯咖啡',
  '📊 Analyst 發現了一個投資機會',
  '🎨 Designer 完成了新的 UI 設計稿',
  '💻 Coder 修復了一個關鍵 bug',
  '📝 Writer 發布了新的部落格文章',
  '🔬 Researcher 完成了市場調查報告',
  '📞 Secretary 接聽了 15 通電話',
  '🏆 Travis 表揚了團隊的辛勤工作',
  '📈 Analyst 更新了財務預測模型',
  '🎯 Inspector 通過了品質檢驗',
  '💡 Designer 提出了創新的設計概念',
  '⚙️ Coder 優化了系統效能 20%',
  '📚 Researcher 整理了知識庫文件',
  '✉️ Secretary 處理了今日所有郵件',
  '🎭 Writer 完成了使用者故事撰寫',
  '🔐 Inspector 進行了安全性檢查',
  '📱 Designer 完成了手機版 UI 適配',
  '🚀 Coder 部署了新版本到測試環境',
  '📉 Analyst 分析了本季度支出報告',
  '🌟 Travis 召開了全員激勵會議',
  '🎨 Designer 更新了設計系統規範',
  '🔧 Coder 重構了核心模組',
  '📖 Writer 編寫了產品使用手冊',
  '💼 Secretary 準備了董事會簡報',
  '🔎 Researcher 找到了競品分析資料',
  '✅ Inspector 確認所有測試案例通過',
  '🎪 全體人員參加了團隊建設活動',
  '☕ 茶水間的咖啡豆用完了'
]

/**
 * Get a random notification message
 */
export function getRandomNotification(): string {
  return Phaser.Math.RND.pick(NOTIFICATIONS)
}
