export type AgentMood = 'happy' | 'focused' | 'tired' | 'stressed' | 'excited'
export type AgentActivity = 'idle' | 'working' | 'meeting' | 'break' | 'helping'

export interface AgentState {
  id: string
  mood: AgentMood
  activity: AgentActivity
  energy: number       // 0-100
  taskCount: number    // 當前任務數
  lastActive: number   // timestamp
}

// Mood emoji mapping
export const MOOD_EMOJI: Record<AgentMood, string> = {
  happy: '😊',
  focused: '🤔',
  tired: '😫',
  stressed: '😤',
  excited: '🤩'
}

// Mood particle colors
export const MOOD_COLORS: Record<AgentMood, number[]> = {
  happy: [0xFFD700, 0xFFA500],  // Gold/Orange
  focused: [0x3B82F6, 0x1E40AF], // Blue
  tired: [0x9CA3AF, 0x6B7280],   // Gray
  stressed: [0xEF4444, 0xDC2626], // Red
  excited: [0xFF00FF, 0x00FFFF, 0xFFFF00, 0xFF0000, 0x00FF00] // Rainbow
}

// Activity display names
export const ACTIVITY_NAMES: Record<AgentActivity, string> = {
  idle: 'Idle',
  working: 'Working',
  meeting: 'Meeting',
  break: 'Break',
  helping: 'Helping'
}

export class AgentStateManager {
  private states: Map<string, AgentState> = new Map()
  private updateTimer?: NodeJS.Timeout

  constructor(agentIds: string[]) {
    // Initialize states for all agents
    agentIds.forEach(id => {
      this.states.set(id, {
        id,
        mood: this.randomMood(),
        activity: this.randomActivity(),
        energy: Math.floor(Math.random() * 40 + 60), // 60-100
        taskCount: Math.floor(Math.random() * 5),
        lastActive: Date.now()
      })
    })

    // Start automatic state updates every 30 seconds
    this.startAutoUpdate()
  }

  private randomMood(): AgentMood {
    const moods: AgentMood[] = ['happy', 'focused', 'tired', 'stressed', 'excited']
    return moods[Math.floor(Math.random() * moods.length)]
  }

  private randomActivity(): AgentActivity {
    const activities: AgentActivity[] = ['idle', 'working', 'meeting', 'break', 'helping']
    const weights = [0.2, 0.5, 0.1, 0.1, 0.1] // Working is most common
    const rand = Math.random()
    let sum = 0
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i]
      if (rand < sum) return activities[i]
    }
    return 'working'
  }

  private startAutoUpdate() {
    // Update states every 30 seconds
    this.updateTimer = setInterval(() => {
      this.states.forEach((state, id) => {
        // Random chance to change state (30%)
        if (Math.random() < 0.3) {
          this.updateState(id)
        }
      })
    }, 30000)
  }

  private updateState(agentId: string) {
    const state = this.states.get(agentId)
    if (!state) return

    // Update activity
    const oldActivity: string = state.activity
    state.activity = this.randomActivity()

    // Update mood based on activity and energy
    if (state.activity === 'break') {
      state.mood = 'happy'
      state.energy = Math.min(100, state.energy + 10)
    } else if (state.activity === 'working') {
      if (state.energy > 70) {
        state.mood = Math.random() > 0.5 ? 'focused' : 'happy'
      } else if (state.energy > 30) {
        state.mood = 'focused'
      } else {
        state.mood = Math.random() > 0.5 ? 'tired' : 'stressed'
      }
      state.energy = Math.max(0, state.energy - 5)
    } else if (state.activity === 'meeting') {
      state.mood = state.energy > 50 ? 'focused' : 'tired'
      state.energy = Math.max(0, state.energy - 3)
    } else if (state.activity === 'helping') {
      state.mood = 'excited'
      state.energy = Math.max(0, state.energy - 8)
    } else {
      // idle
      state.mood = state.energy > 60 ? 'happy' : 'tired'
      state.energy = Math.min(100, state.energy + 5)
    }

    // Update task count
    if (state.activity === 'working') {
      state.taskCount = Math.max(0, state.taskCount + (Math.random() > 0.5 ? 1 : -1))
    }
    if (oldActivity === 'working' && state.activity !== 'working') {
      state.taskCount = Math.max(0, state.taskCount - 1)
    }

    state.lastActive = Date.now()
  }

  getState(agentId: string): AgentState | undefined {
    return this.states.get(agentId)
  }

  getAllStates(): Map<string, AgentState> {
    return new Map(this.states)
  }

  // Manual state updates (for special events)
  setMood(agentId: string, mood: AgentMood) {
    const state = this.states.get(agentId)
    if (state) {
      state.mood = mood
      state.lastActive = Date.now()
    }
  }

  setActivity(agentId: string, activity: AgentActivity) {
    const state = this.states.get(agentId)
    if (state) {
      state.activity = activity
      state.lastActive = Date.now()
    }
  }

  adjustEnergy(agentId: string, delta: number) {
    const state = this.states.get(agentId)
    if (state) {
      state.energy = Math.max(0, Math.min(100, state.energy + delta))
    }
  }

  destroy() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
    }
  }
}
