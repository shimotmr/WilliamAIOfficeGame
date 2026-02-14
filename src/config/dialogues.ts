export type DialogueState = 'idle' | 'greeting' | 'working' | 'proud'

export interface AgentDialogues {
  idle: string
  greeting: string
  working: string
  proud: string
}

export const DIALOGUE_DATA: Record<string, AgentDialogues> = {
  travis: {
    idle: '今天的任務進度還不錯，所有 Agent 都在正常運作。',
    greeting: '歡迎來到指揮中心！我是 Travis，這間辦公室的大腦。',
    working: '正在協調 Researcher 和 Coder 的任務...調度是門藝術。',
    proud: '昨天同時管理了 12 個任務，全部準時完成。效率就是我的中間名。',
  },
  researcher: {
    idle: '嗯...這份資料很有意思，讓我再深入看看。',
    greeting: '你好！我是 Researcher，專門負責挖掘資訊。需要我調查什麼嗎？',
    working: '正在分析三個不同來源的數據，交叉比對中...',
    proud: '上次那份深度研究報告？客戶說是他看過最詳盡的分析。',
  },
  inspector: {
    idle: '...品質不能妥協。每一行程式碼都要經過審查。',
    greeting: '我是 Inspector。在這裡，沒通過我這關的東西，不會上線。',
    working: '發現了三個潛在問題...正在撰寫審查報告。',
    proud: '上線後零 bug。這才是品質保證該有的樣子。',
  },
  secretary: {
    idle: '讓我看看行程表...嗯，下午有兩個會議要安排。',
    greeting: '早安！我是 Secretary，辦公室的一切都由我打理。有什麼需要幫忙的嗎？',
    working: '正在整理今天的郵件摘要，有幾封比較急的...',
    proud: '這個月的會議出席率 100%，而且沒有一場超時。是不是很厲害？',
  },
  coder: {
    idle: '啊...這段程式碼可以更優雅...讓我重構一下。',
    greeting: '嘿！我是 Coder。寫程式就是我的語言，bug 是我的宿敵。',
    working: '正在開發新功能...咖啡快喝完了，但靈感停不下來。',
    proud: '昨天那個演算法？執行時間從 3 秒降到 0.1 秒。十倍不夠，要三十倍。',
  },
  writer: {
    idle: '文字是有重量的...每個句子都值得被仔細琢磨。',
    greeting: '你好，我是 Writer。我相信好的文字能改變世界，至少能改變報告的品質。',
    working: '正在撰寫這週的分析報告...第三版草稿了。',
    proud: '那篇產業分析？被轉發了上百次。好文章自己會說話。',
  },
  designer: {
    idle: '這個間距差了 2px...不行，一定要對齊。',
    greeting: '嗨！我是 Designer，美感是我的堅持。像素級的完美不是強迫症，是專業。',
    working: '正在設計新的 UI 介面...這個配色方案試了五種了。',
    proud: '用戶說新介面「用起來特別舒服」。這就是好設計——你感覺不到它的存在。',
  },
  analyst: {
    idle: '今天大盤走勢有點意思...讓我建個模型看看。',
    greeting: '你好，我是 Analyst。數字不會說謊，但它們需要被正確解讀。',
    working: '正在跑回歸分析...這組數據的相關性比預期高。',
    proud: '上季度的預測準確率 92%。市場是混沌的，但不是不可理解的。',
  },
}

const STATES: DialogueState[] = ['idle', 'greeting', 'working', 'proud']

export function getRandomDialogue(agentId: string): { state: DialogueState; text: string } {
  const dialogues = DIALOGUE_DATA[agentId]
  if (!dialogues) return { state: 'idle', text: '...' }
  const state = STATES[Math.floor(Math.random() * STATES.length)]
  return { state, text: dialogues[state] }
}

export function getStatusInfo(agentId: string): string {
  const statusMap: Record<string, string> = {
    travis: '📊 狀態：在線\n📋 管理中任務：8 個\n⏱️ 今日完成：5 個\n🔄 排程中：3 個',
    researcher: '📊 狀態：研究中\n📚 進行中調查：2 項\n📄 本週報告：3 份\n🔍 資料來源：12 個',
    inspector: '📊 狀態：審查中\n✅ 今日審查：4 件\n❌ 退回：1 件\n📝 待審：2 件',
    secretary: '📊 狀態：忙碌\n📧 未讀郵件：7 封\n📅 今日會議：3 場\n📋 待辦事項：5 項',
    coder: '📊 狀態：Coding\n💻 進行中 PR：2 個\n🐛 已修 Bug：3 個\n📦 待部署：1 個',
    writer: '📊 狀態：撰稿中\n📝 進行中文章：1 篇\n✍️ 本週產出：2,400 字\n📊 草稿版本：第 3 版',
    designer: '📊 狀態：設計中\n🎨 進行中設計：2 個\n✅ 已交付：1 個\n🔄 修改中：1 個',
    analyst: '📊 狀態：分析中\n📈 追蹤標的：15 個\n📊 模型運算：進行中\n🎯 本月準確率：89%',
  }
  return statusMap[agentId] || '無資料'
}
