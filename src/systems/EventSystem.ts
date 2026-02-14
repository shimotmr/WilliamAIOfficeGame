import Phaser from 'phaser'
import { AGENTS } from '../config/agents'
import { AgentMovement } from './AgentMovement'
import { isoToScreen } from '../utils/isometric'

export interface EventSystemConfig {
  scene: Phaser.Scene
  agentMovements: Map<string, AgentMovement>
  agentContainers: Map<string, Phaser.GameObjects.Container>
  onNotification: (message: string) => void
  onSpeechBubble: (agentId: string, text: string, duration?: number) => void
}

type EventType = 'collaboration' | 'break' | 'meeting' | 'help'

interface OfficeEvent {
  type: EventType
  participants: string[]
  location?: { x: number; y: number }
  notification: string
  bubbleText?: string
}

export class EventSystem {
  private scene: Phaser.Scene
  private agentMovements: Map<string, AgentMovement>
  private onNotification: (message: string) => void
  private onSpeechBubble: (agentId: string, text: string, duration?: number) => void
  private eventTimer?: Phaser.Time.TimerEvent
  private isEventActive = false

  // Common locations
  private readonly LOCATIONS = {
    kitchen: { x: 18, y: 14 },
    conference: { x: 12, y: 12 },
    lounge: { x: 6, y: 14 },
  }

  constructor(config: EventSystemConfig) {
    this.scene = config.scene
    this.agentMovements = config.agentMovements
    this.onNotification = config.onNotification
    this.onSpeechBubble = config.onSpeechBubble
  }

  /**
   * Start the random event system
   */
  start(): void {
    this.scheduleNextEvent()
  }

  /**
   * Stop the event system
   */
  stop(): void {
    if (this.eventTimer) {
      this.eventTimer.destroy()
      this.eventTimer = undefined
    }
  }

  /**
   * Schedule next random event (60-120 seconds)
   */
  private scheduleNextEvent(): void {
    const delay = Phaser.Math.Between(60000, 120000) // 60-120s
    
    this.eventTimer = this.scene.time.delayedCall(delay, () => {
      this.triggerRandomEvent()
      this.scheduleNextEvent()
    })
  }

  /**
   * Trigger a random event
   */
  private async triggerRandomEvent(): Promise<void> {
    if (this.isEventActive) return
    
    const eventType = Phaser.Math.RND.pick(['collaboration', 'break', 'meeting', 'help'] as EventType[])
    const event = this.generateEvent(eventType)
    
    if (event) {
      this.isEventActive = true
      await this.executeEvent(event)
      this.isEventActive = false
    }
  }

  /**
   * Generate event data based on type
   */
  private generateEvent(type: EventType): OfficeEvent | null {
    switch (type) {
      case 'collaboration':
        return this.generateCollaborationEvent()
      case 'break':
        return this.generateBreakEvent()
      case 'meeting':
        return this.generateMeetingEvent()
      case 'help':
        return this.generateHelpEvent()
      default:
        return null
    }
  }

  /**
   * Collaboration event: One agent visits another
   */
  private generateCollaborationEvent(): OfficeEvent {
    const pairs = [
      { from: 'coder', to: 'inspector', notification: '🔍 Inspector 完成了代碼審查，發現 0 個問題！' },
      { from: 'designer', to: 'coder', notification: '🎨 Designer 與 Coder 討論新 UI 設計' },
      { from: 'writer', to: 'researcher', notification: '📊 Writer 向 Researcher 索取數據報告' },
      { from: 'analyst', to: 'secretary', notification: '💼 Analyst 與 Secretary 討論財務報表' },
    ]
    
    const pair = Phaser.Math.RND.pick(pairs)
    const toAgent = AGENTS.find(a => a.id === pair.to)!
    
    return {
      type: 'collaboration',
      participants: [pair.from, pair.to],
      location: toAgent.position,
      notification: pair.notification,
      bubbleText: '...'
    }
  }

  /**
   * Break event: Agent goes to kitchen
   */
  private generateBreakEvent(): OfficeEvent {
    const agents = ['coder', 'writer', 'analyst', 'designer']
    const agentId = Phaser.Math.RND.pick(agents)
    const agent = AGENTS.find(a => a.id === agentId)!
    
    const coffeeCount = Phaser.Math.Between(1, 5)
    
    return {
      type: 'break',
      participants: [agentId],
      location: this.LOCATIONS.kitchen,
      notification: `☕ ${agent.name} 去泡了第${coffeeCount}杯咖啡`,
      bubbleText: '☕'
    }
  }

  /**
   * Meeting event: Multiple agents go to conference room
   */
  private generateMeetingEvent(): OfficeEvent {
    const allAgents = ['travis', 'coder', 'designer', 'writer', 'inspector', 'researcher', 'analyst', 'secretary']
    const numParticipants = Phaser.Math.Between(2, 4)
    const participants = Phaser.Math.RND.shuffle(allAgents).slice(0, numParticipants)
    
    const topics = [
      '專案進度會議',
      '腦力激盪時間',
      '週會',
      '需求討論',
      'Sprint Planning',
      '產品評審'
    ]
    
    return {
      type: 'meeting',
      participants,
      location: this.LOCATIONS.conference,
      notification: `📋 ${participants.map(id => AGENTS.find(a => a.id === id)?.name).join('、')} 正在進行${Phaser.Math.RND.pick(topics)}`,
      bubbleText: 'Meeting...'
    }
  }

  /**
   * Help event: Agent asks Travis for help
   */
  private generateHelpEvent(): OfficeEvent {
    const agents = ['coder', 'writer', 'analyst', 'designer', 'researcher']
    const agentId = Phaser.Math.RND.pick(agents)
    const agent = AGENTS.find(a => a.id === agentId)!
    
    return {
      type: 'help',
      participants: [agentId, 'travis'],
      location: agent.position,
      notification: `❓ ${agent.name} 請 Travis 協助解決問題`,
      bubbleText: '？'
    }
  }

  /**
   * Execute the event
   */
  private async executeEvent(event: OfficeEvent): Promise<void> {
    // Show notification
    this.onNotification(event.notification)
    
    // Move participants
    const movements: Promise<void>[] = []
    
    for (const agentId of event.participants) {
      const movement = this.agentMovements.get(agentId)
      if (!movement || movement.getIsMoving()) continue
      
      // Skip the destination agent for collaboration/help events
      if ((event.type === 'collaboration' || event.type === 'help') && 
          agentId === event.participants[event.participants.length - 1]) {
        continue
      }
      
      if (event.location) {
        movements.push(movement.moveTo(event.location, 2000))
      }
    }
    
    // Wait for all movements to complete
    await Promise.all(movements)
    
    // Show speech bubbles
    if (event.bubbleText) {
      for (const agentId of event.participants) {
        this.onSpeechBubble(agentId, event.bubbleText, 3000)
      }
    }
    
    // Add icon for break events
    if (event.type === 'break' && event.location) {
      this.showBreakIcon(event.location.x, event.location.y)
    }
    
    // Wait a bit before returning
    await new Promise(resolve => this.scene.time.delayedCall(4000, resolve))
    
    // Return agents to workstations
    const returns: Promise<void>[] = []
    for (const agentId of event.participants) {
      const agent = AGENTS.find(a => a.id === agentId)
      const movement = this.agentMovements.get(agentId)
      if (agent && movement && !movement.getIsMoving()) {
        const originalPos = agent.position
        returns.push(movement.moveTo(originalPos, 2000))
      }
    }
    
    await Promise.all(returns)
  }

  /**
   * Show coffee icon for break events
   */
  private showBreakIcon(isoX: number, isoY: number): void {
    const screenPos = isoToScreen(isoX, isoY)
    
    const icon = this.scene.add.text(screenPos.x, screenPos.y - 80, '☕', {
      fontSize: '48px',
    }).setOrigin(0.5)
    
    this.scene.tweens.add({
      targets: icon,
      y: screenPos.y - 120,
      alpha: { from: 1, to: 0 },
      duration: 3000,
      ease: 'Sine.easeOut',
      onComplete: () => {
        icon.destroy()
      }
    })
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop()
  }
}
