import Phaser from 'phaser'
import { AGENTS, AgentConfig } from '../config/agents'
import {
  drawTravisDecorations, drawResearcherDecorations, drawInspectorDecorations,
  drawSecretaryDecorations, drawCoderDecorations, drawWriterDecorations,
  drawDesignerDecorations, drawAnalystDecorations, drawWalls,
  drawConferenceTable, drawPartition,
  drawLoungeArea, drawKitchenArea, drawEntranceArea, drawPottedPlantDecor
  // createRippleEffect, bounceAnimation - unused Phase 4 functions
} from './WorkstationDecorations'
import { getRandomDialogue, getStatusInfo, getStateBasedDialogue } from '../config/dialogues'
import { AgentStateManager, MOOD_COLORS } from '../systems/AgentStateManager'
import { StatePanel } from '../systems/StatePanel'
import { AgentMovement } from '../systems/AgentMovement'
import { EventSystem } from '../systems/EventSystem'
import { SpeechBubbleSystem, NotificationSystem, createRippleEffect } from '../systems/UIEffects'
import { getRandomNotification } from '../data/notifications'

const DECORATION_MAP: Record<string, (scene: Phaser.Scene, x: number, y: number) => Phaser.GameObjects.Graphics> = {
  travis: drawTravisDecorations,
  researcher: drawResearcherDecorations,
  inspector: drawInspectorDecorations,
  secretary: drawSecretaryDecorations,
  coder: drawCoderDecorations,
  writer: drawWriterDecorations,
  designer: drawDesignerDecorations,
  analyst: drawAnalystDecorations,
}

// Agent theme colors for carpets (very light alpha)
const AGENT_CARPET_COLORS: Record<string, number> = {
  travis: 0x1E3A8A,
  researcher: 0x0E7490,
  inspector: 0x444444,
  secretary: 0x92400E,
  coder: 0x10B981,
  writer: 0x78350F,
  designer: 0x8B5CF6,
  analyst: 0xB45309,
}

export class OfficeScene extends Phaser.Scene {
  private agents: Map<string, Phaser.GameObjects.Container> = new Map()
  private basePlates: Map<string, Phaser.GameObjects.Graphics> = new Map()
  private agentNameplates: Map<string, Phaser.GameObjects.Container> = new Map()
  private readonly TILE_WIDTH = 64
  private readonly TILE_HEIGHT = 32
  private readonly MAP_WIDTH = 26
  private readonly MAP_HEIGHT = 26

  // Dialogue system (Persona 5 style)
  private dialogueBox?: Phaser.GameObjects.Container
  private dialogueNameText?: Phaser.GameObjects.Text
  private dialogueBodyText?: Phaser.GameObjects.Text
  private dialogueActive = false
  private typewriterTimer?: Phaser.Time.TimerEvent
  private fullDialogueText = ''
  private currentCharIndex = 0
  private dialoguePhase: 'typing' | 'options' | 'status' = 'typing'
  private currentAgent?: AgentConfig
  private optionButtons: Phaser.GameObjects.Container[] = []
  private portraitImage?: Phaser.GameObjects.Image
  private dialogueNameBg?: Phaser.GameObjects.Graphics
  private continueHint?: Phaser.GameObjects.Text
  
  // Click counter for secret dialogues
  // @ts-ignore - Used in onAgentClick but TS doesn't detect Map usage
  private agentClickCount: Map<string, number> = new Map()

  // Audio system
  private bgmMusic?: Phaser.Sound.BaseSound
  private clickSound?: Phaser.Sound.BaseSound
  private dialogueOpenSound?: Phaser.Sound.BaseSound
  private typewriterSound?: Phaser.Sound.BaseSound
  private isMuted = false
  private bgmStarted = false

  // (Particles moved to WorkstationDecorations)

  // State system (Phase 5)
  private stateManager!: AgentStateManager
  private statePanel?: StatePanel
  private agentEnergyBars: Map<string, Phaser.GameObjects.Graphics> = new Map()
  private agentActivityIcons: Map<string, Phaser.GameObjects.Text> = new Map()

  // Movement & Event system (Phase 6)
  private agentMovements: Map<string, AgentMovement> = new Map()
  private eventSystem?: EventSystem
  private speechBubbleSystem?: SpeechBubbleSystem
  private notificationSystem?: NotificationSystem
  private randomNotificationTimer?: Phaser.Time.TimerEvent

  constructor() {
    super('OfficeScene')
  }

  create() {
    console.log('[OfficeScene] create() start')
    try {
      // Initialize state system
      const agentIds = AGENTS.map(a => a.id)
      this.stateManager = new AgentStateManager(agentIds)
      
      this.cameras.main.setBackgroundColor('#1a1410')
      this.createTilemapFloor()  // NEW: Use Tiled map for floor
      this.createCarpets()
      this.createWalls()
      this.createPartitions()
      this.createPlants()
      this.createFloorDetails()
      this.createCeilingLights()
      this.createBasePlates()
      this.createCommonAreaObjects()
      this.createDecorations()
      this.createWorkstationLabels()
      this.createAgents()
      this.createAgentEnergyBars()
      this.createAgentNameplates()
      this.setupCamera()
      this.addTitle()
      this.createDialogueBox()
      this.setupDialogueInput()
      this.setupEntranceAnimation()
      this.setupAudio()
      this.createMuteButton()
      
      // Create state panel
      this.statePanel = new StatePanel(this, this.stateManager)
      
      // Update agent visuals based on state every 1 second
      this.time.addEvent({
        delay: 1000,
        callback: () => this.updateAgentVisuals(),
        loop: true
      })
      
      // Initialize Phase 6 systems (Movement & Events)
      this.initializePhase6Systems()
      
      this.setupPerformanceOptimization()
      console.log('[OfficeScene] create() done')
    } catch (e) {
      console.error('[OfficeScene] create() CRASHED:', e)
    }
  }

  // ─── Phase 6: Movement & Event Systems ────────────────
  private initializePhase6Systems() {
    // Create movement controllers for each agent
    AGENTS.forEach(agent => {
      const container = this.agents.get(agent.id)
      if (container) {
        const movement = new AgentMovement({
          agent,
          container,
          scene: this
        })
        this.agentMovements.set(agent.id, movement)
      }
    })

    // Initialize UI effect systems
    this.speechBubbleSystem = new SpeechBubbleSystem(this)
    this.notificationSystem = new NotificationSystem(this)

    // Initialize event system
    this.eventSystem = new EventSystem({
      scene: this,
      agentMovements: this.agentMovements,
      agentContainers: this.agents,
      onNotification: (msg) => this.notificationSystem?.show(msg),
      onSpeechBubble: (agentId, text, duration) => this.showSpeechBubble(agentId, text, duration)
    })

    // Start event system after 10 seconds
    this.time.delayedCall(10000, () => {
      this.eventSystem?.start()
    })

    // Random notification messages (every 20-40 seconds)
    this.randomNotificationTimer = this.time.addEvent({
      delay: Phaser.Math.Between(20000, 40000),
      callback: () => {
        this.notificationSystem?.show(getRandomNotification())
        // Reschedule with random delay
        if (this.randomNotificationTimer) {
          this.randomNotificationTimer.reset({
            delay: Phaser.Math.Between(20000, 40000),
            callback: () => {
              this.notificationSystem?.show(getRandomNotification())
            }
          })
        }
      },
      loop: true
    })
  }

  /**
   * Show speech bubble above an agent
   */
  private showSpeechBubble(agentId: string, text: string, duration = 2500): void {
    const agent = AGENTS.find(a => a.id === agentId)
    if (!agent || !this.speechBubbleSystem) return
    
    this.speechBubbleSystem.show(
      agentId,
      text,
      agent.position.x,
      agent.position.y,
      duration
    )
  }

  // ─── Performance Optimization ──────────────────────────
  private setupPerformanceOptimization() {
    // 離開畫面時暫停所有動畫和音效
    this.game.events.on('blur', () => {
      this.tweens.pauseAll()
      this.sound.pauseAll()
      console.log('[OfficeScene] Game paused (blur)')
    })

    // 回到畫面時恢復
    this.game.events.on('focus', () => {
      this.tweens.resumeAll()
      this.sound.resumeAll()
      console.log('[OfficeScene] Game resumed (focus)')
    })
  }

  update(_time: number, _delta: number) {
    // Animations handled by tweens in WorkstationDecorations
  }

  // ─── Floor (Tiled Map) ─────────────────────────────────
  private createTilemapFloor() {
    // Load the Tiled map
    const map = this.make.tilemap({ key: 'office' })
    const tileset = map.addTilesetImage('office-tiles', 'office-tiles')
    
    if (!tileset) {
      console.error('[OfficeScene] Failed to load tileset')
      return
    }
    
    // Validate map dimensions
    if (map.width !== this.MAP_WIDTH || map.height !== this.MAP_HEIGHT) {
      console.warn(`[OfficeScene] Map size mismatch: expected ${this.MAP_WIDTH}x${this.MAP_HEIGHT}, got ${map.width}x${map.height}`)
    }
    
    // Create floor layer
    const floorLayer = map.createLayer('floor', tileset)
    if (floorLayer) {
      floorLayer.setDepth(-10)  // Behind everything
      console.log('[OfficeScene] Floor layer created from Tiled map')
    }
    
    // Create walls layer (if exists)
    const wallsLayer = map.createLayer('walls', tileset)
    if (wallsLayer) {
      wallsLayer.setDepth(5)  // Above floor, below agents
      console.log('[OfficeScene] Walls layer created from Tiled map')
    }
  }

  // Old createIsometricFloor() method removed - now using Tiled map

  // ─── Carpets (agent theme color, very light) ───────────
  private createCarpets() {
    AGENTS.forEach((agent) => {
      const pos = this.isoToScreen(agent.position.x, agent.position.y)
      const g = this.add.graphics()
      const color = AGENT_CARPET_COLORS[agent.id] || 0x888888
      // 4x4 tile carpet area
      const w = this.TILE_WIDTH * 4
      const h = this.TILE_HEIGHT * 4
      g.fillStyle(color, 0.08)
      g.beginPath()
      g.moveTo(pos.x, pos.y - h / 2)
      g.lineTo(pos.x + w / 2, pos.y)
      g.lineTo(pos.x, pos.y + h / 2)
      g.lineTo(pos.x - w / 2, pos.y)
      g.closePath()
      g.fillPath()
    })
  }

  // ─── Partition walls between workstations ──────────────
  private createPartitions() {
    // Draw partitions between nearby agents
    const partitionPairs: [string, string][] = [
      ['travis', 'inspector'],
      ['travis', 'researcher'],
      ['researcher', 'secretary'],
      ['inspector', 'coder'],
      ['coder', 'designer'],
      ['secretary', 'writer'],
      ['writer', 'analyst'],
      ['designer', 'analyst'],
    ]

    partitionPairs.forEach(([a1id, a2id]) => {
      const a1 = AGENTS.find(a => a.id === a1id)!
      const a2 = AGENTS.find(a => a.id === a2id)!
      const p1 = this.isoToScreen(a1.position.x, a1.position.y)
      const p2 = this.isoToScreen(a2.position.x, a2.position.y)
      // Midpoint partition
      const mx = (p1.x + p2.x) / 2
      const my = (p1.y + p2.y) / 2
      // Perpendicular short wall
      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      const len = Math.sqrt(dx * dx + dy * dy)
      const nx = -dy / len * 30
      const ny = dx / len * 30
      drawPartition(this, mx - nx, my - ny, mx + nx, my + ny)
    })
  }

  // ─── Common area objects ───────────────────────────────
  private createCommonAreaObjects() {
    // Conference table (center area, grid 12,12)
    const ctPos = this.isoToScreen(12, 12)
    drawConferenceTable(this, ctPos.x, ctPos.y)

    // Lounge / rest area (grid 6,14)
    const loungePos = this.isoToScreen(6, 14)
    drawLoungeArea(this, loungePos.x, loungePos.y)

    // Kitchen / tea area (grid 9,20)
    const kitchenPos = this.isoToScreen(9, 20)
    drawKitchenArea(this, kitchenPos.x, kitchenPos.y)

    // Entrance area (grid 1,12)
    const entrancePos = this.isoToScreen(1, 12)
    drawEntranceArea(this, entrancePos.x, entrancePos.y)

    // 4 potted plants scattered
    const plantPositions = [
      { x: 6, y: 6 }, { x: 18, y: 4 }, { x: 4, y: 18 }, { x: 20, y: 18 },
    ]
    plantPositions.forEach(p => {
      const pos = this.isoToScreen(p.x, p.y)
      drawPottedPlantDecor(this, pos.x, pos.y)
    })
  }

  // ─── Floor details (now handled by common area potted plants) ──
  private createFloorDetails() {
    // Moved to createCommonAreaObjects with Kenney assets
  }

  // ─── Ceiling lights (elliptical glow above workstations) ─
  private createCeilingLights() {
    AGENTS.forEach((agent) => {
      const pos = this.isoToScreen(agent.position.x, agent.position.y)
      const g = this.add.graphics()
      g.fillStyle(0xFFFFFF, 0.05)
      // Ellipse glow
      g.beginPath()
      for (let a = 0; a < Math.PI * 2; a += 0.1) {
        const ex = pos.x + Math.cos(a) * 60
        const ey = pos.y - 20 + Math.sin(a) * 25
        if (a === 0) g.moveTo(ex, ey)
        else g.lineTo(ex, ey)
      }
      g.closePath()
      g.fillPath()
    })
  }

  // ─── Walls ─────────────────────────────────────────────
  private createWalls() {
    drawWalls(this, this.isoToScreen.bind(this), this.MAP_WIDTH)
  }

  // ─── Corner plants (using Kenney pottedPlant) ──────────
  private createPlants() {
    const corners = [
      { x: 1, y: 1 }, { x: 24, y: 1 }, { x: 1, y: 24 },
      { x: 24, y: 24 }, { x: 12, y: 0 }, { x: 0, y: 12 },
    ]
    corners.forEach(c => {
      const pos = this.isoToScreen(c.x, c.y)
      drawPottedPlantDecor(this, pos.x, pos.y)
    })
  }

  // ─── Base plates (semi-transparent, agent theme color) ─
  private createBasePlates() {
    AGENTS.forEach((agent) => {
      const pos = this.isoToScreen(agent.position.x, agent.position.y)
      const g = this.add.graphics()
      const color = parseInt(agent.color.replace('#', ''), 16)
      const w = this.TILE_WIDTH * 3
      const h = this.TILE_HEIGHT * 3
      g.fillStyle(color, 0.15)
      g.beginPath()
      g.moveTo(pos.x, pos.y - h / 2)
      g.lineTo(pos.x + w / 2, pos.y)
      g.lineTo(pos.x, pos.y + h / 2)
      g.lineTo(pos.x - w / 2, pos.y)
      g.closePath()
      g.fillPath()
      g.lineStyle(1, color, 0.3)
      g.strokePath()
      this.basePlates.set(agent.id, g)
    })
  }

  // ─── Workstation decorations ───────────────────────────
  private createDecorations() {
    AGENTS.forEach((agent) => {
      const pos = this.isoToScreen(agent.position.x, agent.position.y)
      const drawFn = DECORATION_MAP[agent.id]
      if (drawFn) drawFn(this, pos.x, pos.y)
    })
  }

  // ─── Workstation labels ────────────────────────────────
  private createWorkstationLabels() {
    AGENTS.forEach((agent) => {
      const screenPos = this.isoToScreen(agent.position.x, agent.position.y)
      this.add.text(
        screenPos.x,
        screenPos.y + 70,
        agent.workstation,
        {
          fontSize: '12px',
          color: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 6, y: 3 }
        }
      ).setOrigin(0.5)
    })
  }

  // ─── Agents (with idle animation, shadow, glow) ────────
  private createAgents() {
    AGENTS.forEach((agent, index) => {
      const screenPos = this.isoToScreen(agent.position.x, agent.position.y)
      const container = this.add.container(screenPos.x, screenPos.y - 20)
      const color = parseInt(agent.color.replace('#', ''), 16)

      // Glow (behind character, breathing effect)
      const glow = this.add.graphics()
      glow.fillStyle(color, 0.1)
      glow.fillCircle(0, 10, 65)
      container.add(glow)
      // Breathing tween on glow
      this.tweens.add({
        targets: glow,
        alpha: { from: 0.5, to: 1.5 },
        duration: 3000,
        yoyo: true,
        repeat: -1,
        delay: index * 400,
      })

      // Shadow (ellipse under feet)
      const shadow = this.add.graphics()
      shadow.fillStyle(0x000000, 0.3)
      shadow.fillEllipse(0, 50, 50, 16)
      container.add(shadow)

      // Character image (larger: 110px)
      const imageKey = `${agent.id}-hq`
      const sprite = this.add.image(0, 0, imageKey)
      sprite.setDisplaySize(110, 110)
      sprite.setInteractive({
        useHandCursor: true,
        hitArea: new Phaser.Geom.Rectangle(-70, -70, 140, 140),
        hitAreaCallback: Phaser.Geom.Rectangle.Contains
      })

      sprite.on('pointerover', () => {
        sprite.setTint(0xffffaa)
        sprite.setScale(sprite.scaleX * 1.1, sprite.scaleY * 1.1)
      })
      sprite.on('pointerout', () => {
        sprite.clearTint()
        sprite.setDisplaySize(110, 110)
      })
      sprite.on('pointerdown', () => this.onAgentClick(agent))

      const nameText = this.add.text(0, -65, agent.name, {
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5)

      const roleText = this.add.text(0, 58, agent.role, {
        fontSize: '10px',
        color: '#cccccc'
      }).setOrigin(0.5)

      container.add([sprite, nameText, roleText])
      this.agents.set(agent.id, container)

      // Idle floating animation (offset per agent to avoid sync)
      this.tweens.add({
        targets: container,
        y: screenPos.y - 23,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: index * 250,
      })

      // Shadow scale sync with float
      this.tweens.add({
        targets: shadow,
        scaleX: { from: 1, to: 0.9 },
        scaleY: { from: 1, to: 0.85 },
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: index * 250,
      })
    })
  }

  // ─── Energy Bars (Phase 5) ──────────
  private createAgentEnergyBars() {
    AGENTS.forEach(agent => {
      const screenPos = this.isoToScreen(agent.position.x, agent.position.y)
      const energyBar = this.add.graphics()
      energyBar.setPosition(screenPos.x, screenPos.y + 70) // Below agent
      energyBar.setDepth(100)
      this.agentEnergyBars.set(agent.id, energyBar)

      // Activity icon
      const activityIcon = this.add.text(screenPos.x, screenPos.y + 30, '', {
        fontSize: '20px',
        fontFamily: 'Arial, sans-serif'
      }).setOrigin(0.5).setDepth(100)
      this.agentActivityIcons.set(agent.id, activityIcon)
    })
  }

  // ─── Update Agent Visuals based on State (Phase 5) ──────────
  private updateAgentVisuals() {
    AGENTS.forEach(agent => {
      const state = this.stateManager.getState(agent.id)
      if (!state) return

      const energyBar = this.agentEnergyBars.get(agent.id)
      const activityIcon = this.agentActivityIcons.get(agent.id)
      const agentContainer = this.agents.get(agent.id)
      if (!energyBar || !agentContainer) return

      // Draw energy bar
      const barWidth = 60
      const barHeight = 6
      energyBar.clear()

      // Background
      energyBar.fillStyle(0x000000, 0.5)
      energyBar.fillRect(-barWidth / 2, 0, barWidth, barHeight)

      // Energy fill (color based on level)
      let fillColor = 0x10B981 // Green
      if (state.energy < 30) fillColor = 0xEF4444 // Red
      else if (state.energy < 60) fillColor = 0xFBBF24 // Yellow

      energyBar.fillStyle(fillColor, 0.9)
      energyBar.fillRect(-barWidth / 2, 0, (barWidth * state.energy) / 100, barHeight)

      // Border
      energyBar.lineStyle(1, 0xffffff, 0.5)
      energyBar.strokeRect(-barWidth / 2, 0, barWidth, barHeight)

      // Activity icon
      if (activityIcon) {
        const iconMap: Record<string, string> = {
          idle: '',
          working: '💻',
          meeting: '👥',
          break: '☕',
          helping: '🤝'
        }
        activityIcon.setText(iconMap[state.activity] || '')
      }

      // Adjust floating animation speed based on activity
      const floatTween = this.tweens.getTweensOf(agentContainer)[0]
      if (floatTween) {
        if (state.activity === 'working') {
          floatTween.timeScale = 1.5 // Faster float
        } else if (state.activity === 'break') {
          floatTween.timeScale = 0.3 // Almost still
        } else {
          floatTween.timeScale = 1 // Normal
        }
      }

      // Glow color based on mood (update the glow inside container)
      const glowGraphics = agentContainer.getAll()[0] as Phaser.GameObjects.Graphics
      if (glowGraphics) {
        const moodColors = MOOD_COLORS[state.mood]
        const color = moodColors[Math.floor(Math.random() * moodColors.length)]
        glowGraphics.clear()
        glowGraphics.fillStyle(color, 0.15)
        glowGraphics.fillCircle(0, 10, 65)
      }
    })
  }

  // ─── Agent Nameplates (floating above agents) ──────────
  private createAgentNameplates() {
    const isMobile = this.cameras.main.width < 768
    
    AGENTS.forEach((agent, index) => {
      const screenPos = this.isoToScreen(agent.position.x, agent.position.y)
      const container = this.add.container(screenPos.x, screenPos.y - 110)

      // 手機上縮小名牌
      const nameWidth = isMobile ? 140 : 180
      const nameHeight = isMobile ? 40 : 50
      const nameFontSize = isMobile ? '13px' : '16px'
      const roleFontSize = isMobile ? '10px' : '12px'
      
      // 半透明黑底圓角矩形
      const bgGraphics = this.add.graphics()
      bgGraphics.fillStyle(0x000000, 0.7)
      bgGraphics.fillRoundedRect(-nameWidth / 2, 0, nameWidth, nameHeight, 8)
      bgGraphics.lineStyle(2, parseInt(agent.color.replace('#', ''), 16), 0.8)
      bgGraphics.strokeRoundedRect(-nameWidth / 2, 0, nameWidth, nameHeight, 8)

      // 角色名字（大字）
      const nameText = this.add.text(0, isMobile ? 8 : 12, agent.name, {
        fontSize: nameFontSize,
        fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
        fontStyle: 'bold',
        color: '#ffffff',
        shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 3, fill: true }
      })
      nameText.setOrigin(0.5, 0)

      // 職稱（小字）
      const roleText = this.add.text(0, isMobile ? 22 : 30, agent.role, {
        fontSize: roleFontSize,
        fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
        color: '#cccccc',
        shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 2, fill: true }
      })
      roleText.setOrigin(0.5, 0)

      container.add([bgGraphics, nameText, roleText])
      container.setAlpha(0.85)
      this.agentNameplates.set(agent.id, container)

      // 隨角色 idle 動畫一起浮動（與角色同步）
      this.tweens.add({
        targets: container,
        y: screenPos.y - 113,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: index * 250,
      })

      // 滑鼠靠近時名牌更亮
      const agentContainer = this.agents.get(agent.id)
      if (agentContainer) {
        const sprite = agentContainer.list.find(obj => obj.type === 'Image') as Phaser.GameObjects.Image
        if (sprite) {
          sprite.on('pointerover', () => {
            container.setAlpha(1)
            this.tweens.add({
              targets: container,
              scaleX: 1.05,
              scaleY: 1.05,
              duration: 150,
              ease: 'Back.easeOut'
            })
          })
          sprite.on('pointerout', () => {
            container.setAlpha(0.85)
            this.tweens.add({
              targets: container,
              scaleX: 1,
              scaleY: 1,
              duration: 150,
              ease: 'Back.easeIn'
            })
          })
        }
      }
    })
  }

  // ─── Dialogue (Persona 5 Style) ─────────────────────────
  private createDialogueBox() {
    const w = this.cameras.main.width
    const boxH = 160

    // 響應式判斷：手機 (w < 768) 或桌面
    const isMobile = w < 768
    const dialogueWidth = Math.min(w - 40, 800)
    const fontSize = isMobile ? '16px' : '22px'
    const nameFontSize = isMobile ? '14px' : '16px'
    const leftPadding = isMobile ? 140 : 200

    const container = this.add.container(0, this.cameras.main.height)
      .setScrollFactor(0).setDepth(2000).setVisible(false)

    const bg = this.add.graphics()
    bg.fillStyle(0x000000, 0.85)
    bg.fillRect(20, 0, dialogueWidth, boxH)
    bg.lineStyle(3, 0xDD0000, 1)
    bg.beginPath()
    bg.moveTo(15, boxH)
    bg.lineTo(25, 0)
    bg.lineTo(dialogueWidth + 15, 0)
    bg.lineTo(dialogueWidth + 5, boxH)
    bg.closePath()
    bg.strokePath()
    bg.lineStyle(1, 0xFF3333, 0.5)
    bg.beginPath()
    bg.moveTo(30, boxH - 5)
    bg.lineTo(38, 5)
    bg.lineTo(dialogueWidth, 5)
    bg.lineTo(dialogueWidth - 8, boxH - 5)
    bg.closePath()
    bg.strokePath()

    const nameBg = this.add.graphics()
    this.dialogueNameBg = nameBg

    const nameText = this.add.text(80, -8, '', {
      fontSize: nameFontSize,
      fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
      fontStyle: 'bold',
      color: '#ffffff',
      shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
    }).setOrigin(0.5)

    const bodyText = this.add.text(leftPadding, 25, '', {
      fontSize: fontSize,
      fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
      fontStyle: 'bold',
      color: '#ffffff',
      wordWrap: { width: dialogueWidth - leftPadding - 40 },
      lineSpacing: 10,
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 3, fill: true }
    })

    const hint = this.add.text(dialogueWidth - 40, boxH - 30, '▼', {
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#FF3333'
    }).setOrigin(0.5)
    this.tweens.add({ targets: hint, alpha: 0.2, duration: 500, yoyo: true, repeat: -1 })
    this.continueHint = hint

    container.add([bg, nameBg, nameText, bodyText, hint])
    this.dialogueBox = container
    this.dialogueNameText = nameText
    this.dialogueBodyText = bodyText
  }

  private setupDialogueInput() {
    this.input.on('pointerdown', (_pointer: Phaser.Input.Pointer) => {
      if (!this.dialogueActive) return
      if (this.dialoguePhase === 'typing') {
        this.advanceDialogue()
      }
    })

    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.dialogueActive && this.dialoguePhase === 'typing') this.advanceDialogue()
    })

    this.input.keyboard?.on('keydown-ESC', () => {
      if (this.dialogueActive) this.closeDialogue()
    })
  }

  private onAgentClick(agent: AgentConfig) {
    if (this.dialogueActive) return

    // Play click sound and start BGM on first interaction
    this.playSound(this.clickSound)
    if (!this.bgmStarted && this.bgmMusic) {
      this.bgmMusic.play({ loop: true, volume: 0.3 })
      this.bgmStarted = true
    }

    const color = parseInt(agent.color.replace('#', ''), 16)
    const pos = this.isoToScreen(agent.position.x, agent.position.y)
    
    // Add ripple effect (Phase 6)
    createRippleEffect(this, pos.x, pos.y, color)
    const w = this.TILE_WIDTH * 3
    const h = this.TILE_HEIGHT * 3
    const flash = this.add.graphics()
    flash.fillStyle(color, 0.4)
    flash.beginPath()
    flash.moveTo(pos.x, pos.y - h / 2)
    flash.lineTo(pos.x + w / 2, pos.y)
    flash.lineTo(pos.x, pos.y + h / 2)
    flash.lineTo(pos.x - w / 2, pos.y)
    flash.closePath()
    flash.fillPath()
    this.tweens.add({ targets: flash, alpha: 0, duration: 500, onComplete: () => flash.destroy() })

    const screenPos = this.isoToScreen(agent.position.x, agent.position.y)
    this.cameras.main.pan(screenPos.x, screenPos.y, 600, 'Sine.easeInOut')

    this.currentAgent = agent
    
    // 點擊計數器
    const currentCount = this.agentClickCount.get(agent.id) || 0
    this.agentClickCount.set(agent.id, currentCount + 1)
    
    // State-driven dialogue (Phase 5)
    const state = this.stateManager.getState(agent.id)
    let text: string
    if (state) {
      const stateContext = {
        mood: state.mood,
        activity: state.activity,
        energy: state.energy
      }
      const result = getStateBasedDialogue(agent.id, stateContext, currentCount + 1)
      text = result.text
    } else {
      // Fallback to random dialogue
      const result = getRandomDialogue(agent.id, undefined, currentCount + 1)
      text = result.text
    }
    
    this.showDialogue(agent, text)
  }

  private showDialogue(agent: AgentConfig, text: string) {
    if (!this.dialogueBox || !this.dialogueNameText || !this.dialogueBodyText) return

    // Play dialogue open sound
    this.playSound(this.dialogueOpenSound)

    const camH = this.cameras.main.height
    const boxH = 160

    this.dialogueActive = true
    this.dialoguePhase = 'typing'
    this.dialogueBox.setVisible(true)
    this.continueHint?.setVisible(true)

    const color = parseInt(agent.color.replace('#', ''), 16)
    this.dialogueNameBg?.clear()
    this.dialogueNameBg?.fillStyle(color, 0.9)
    this.dialogueNameBg?.beginPath()
    this.dialogueNameBg?.moveTo(35, -20)
    this.dialogueNameBg?.lineTo(155, -20)
    this.dialogueNameBg?.lineTo(148, 5)
    this.dialogueNameBg?.lineTo(42, 5)
    this.dialogueNameBg?.closePath()
    this.dialogueNameBg?.fillPath()

    this.dialogueNameText.setText(agent.name)
    this.dialogueBodyText.setText('')
    this.fullDialogueText = text
    this.currentCharIndex = 0

    this.dialogueBox.setY(camH + 20)
    this.dialogueBox.setScale(0)
    this.tweens.add({
      targets: this.dialogueBox,
      y: camH - boxH,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 200,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Settle to normal scale
        this.tweens.add({
          targets: this.dialogueBox,
          scaleX: 1,
          scaleY: 1,
          duration: 100,
          ease: 'Sine.easeOut'
        })
      }
    })

    this.showPortrait(agent)

    this.typewriterTimer?.destroy()
    this.typewriterTimer = this.time.addEvent({
      delay: 35,
      callback: () => {
        if (this.currentCharIndex < this.fullDialogueText.length) {
          this.currentCharIndex++
          this.dialogueBodyText?.setText(this.fullDialogueText.substring(0, this.currentCharIndex))
          // Play typewriter sound for non-whitespace characters
          const char = this.fullDialogueText[this.currentCharIndex - 1]
          if (char && char.trim() !== '') {
            this.playSound(this.typewriterSound, 0.1)
          }
        } else {
          this.typewriterTimer?.destroy()
          this.onTypewriterComplete()
        }
      },
      loop: true
    })
  }

  private showPortrait(agent: AgentConfig) {
    this.portraitImage?.destroy()
    const imageKey = `${agent.id}-hq`
    const camH = this.cameras.main.height
    const portrait = this.add.image(-80, camH - 100, imageKey)
      .setDisplaySize(180, 180)
      .setScrollFactor(0)
      .setDepth(2001)
      .setAlpha(0.95)

    this.tweens.add({
      targets: portrait,
      x: 110,
      duration: 300,
      ease: 'Back.easeOut'
    })
    this.portraitImage = portrait
  }

  private onTypewriterComplete() {
    this.dialoguePhase = 'options'
    this.continueHint?.setVisible(false)
    this.showOptions()
  }

  private showOptions() {
    if (!this.currentAgent) return
    this.clearOptions()

    const camW = this.cameras.main.width
    const camH = this.cameras.main.height
    const isMobile = camW < 768
    
    const options = [
      { label: '了解更多', action: 'more' },
      { label: '查看工作狀態', action: 'status' },
      { label: '團隊合作', action: 'teamwork' },
      { label: '離開', action: 'leave' },
    ]

    options.forEach((opt, i) => {
      const btnW = isMobile ? 180 : 200
      const btnH = isMobile ? 50 : 40  // 手機觸控區加大到至少 44px
      const btnSpacing = isMobile ? 60 : 50  // 手機按鈕間距加大
      const startX = camW - (isMobile ? 220 : 260)
      const startY = camH - 180 - (options.length - i) * btnSpacing

      const container = this.add.container(startX + 300, startY)
        .setScrollFactor(0).setDepth(2002)

      const bg = this.add.graphics()
      bg.fillStyle(0xCC0000, 0.9)
      bg.beginPath()
      bg.moveTo(8, 0); bg.lineTo(btnW, 0); bg.lineTo(btnW - 8, btnH); bg.lineTo(0, btnH)
      bg.closePath()
      bg.fillPath()
      bg.lineStyle(2, 0xFF4444, 1)
      bg.beginPath()
      bg.moveTo(8, 0); bg.lineTo(btnW, 0); bg.lineTo(btnW - 8, btnH); bg.lineTo(0, btnH)
      bg.closePath()
      bg.strokePath()

      const label = this.add.text(btnW / 2, btnH / 2, opt.label, {
        fontSize: '16px',
        fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
        fontStyle: 'bold',
        color: '#ffffff',
        shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 2, fill: true }
      }).setOrigin(0.5)

      container.add([bg, label])
      container.setSize(btnW, btnH)
      container.setInteractive({ useHandCursor: true })

      container.on('pointerover', () => {
        container.setScale(1.08)
        bg.clear()
        bg.fillStyle(0xFF2222, 1)
        bg.beginPath(); bg.moveTo(8, 0); bg.lineTo(btnW, 0); bg.lineTo(btnW - 8, btnH); bg.lineTo(0, btnH); bg.closePath()
        bg.fillPath()
        bg.lineStyle(2, 0xFFAAAA, 1)
        bg.beginPath(); bg.moveTo(8, 0); bg.lineTo(btnW, 0); bg.lineTo(btnW - 8, btnH); bg.lineTo(0, btnH); bg.closePath()
        bg.strokePath()
      })
      container.on('pointerout', () => {
        container.setScale(1)
        bg.clear()
        bg.fillStyle(0xCC0000, 0.9)
        bg.beginPath(); bg.moveTo(8, 0); bg.lineTo(btnW, 0); bg.lineTo(btnW - 8, btnH); bg.lineTo(0, btnH); bg.closePath()
        bg.fillPath()
        bg.lineStyle(2, 0xFF4444, 1)
        bg.beginPath(); bg.moveTo(8, 0); bg.lineTo(btnW, 0); bg.lineTo(btnW - 8, btnH); bg.lineTo(0, btnH); bg.closePath()
        bg.strokePath()
      })
      container.on('pointerdown', () => this.onOptionSelect(opt.action))

      this.tweens.add({
        targets: container,
        x: startX,
        duration: 200,
        delay: i * 80,
        ease: 'Back.easeOut'
      })

      this.optionButtons.push(container)
    })
  }

  private clearOptions() {
    this.optionButtons.forEach(btn => btn.destroy())
    this.optionButtons = []
  }

  private onOptionSelect(action: string) {
    if (!this.currentAgent) return
    this.clearOptions()

    if (action === 'leave') {
      this.closeDialogue()
    } else if (action === 'more') {
      const { text } = getRandomDialogue(this.currentAgent.id)
      this.dialoguePhase = 'typing'
      this.continueHint?.setVisible(true)
      this.dialogueBodyText?.setText('')
      this.fullDialogueText = text
      this.currentCharIndex = 0
      this.typewriterTimer?.destroy()
      this.typewriterTimer = this.time.addEvent({
        delay: 35,
        callback: () => {
          if (this.currentCharIndex < this.fullDialogueText.length) {
            this.currentCharIndex++
            this.dialogueBodyText?.setText(this.fullDialogueText.substring(0, this.currentCharIndex))
          } else {
            this.typewriterTimer?.destroy()
            this.onTypewriterComplete()
          }
        },
        loop: true
      })
    } else if (action === 'status') {
      this.dialoguePhase = 'status'
      this.continueHint?.setVisible(true)
      const status = getStatusInfo(this.currentAgent.id)
      this.dialogueBodyText?.setText('')
      this.fullDialogueText = status
      this.currentCharIndex = 0
      this.typewriterTimer?.destroy()
      this.typewriterTimer = this.time.addEvent({
        delay: 20,
        callback: () => {
          if (this.currentCharIndex < this.fullDialogueText.length) {
            this.currentCharIndex++
            this.dialogueBodyText?.setText(this.fullDialogueText.substring(0, this.currentCharIndex))
          } else {
            this.typewriterTimer?.destroy()
            this.dialoguePhase = 'options'
            this.continueHint?.setVisible(false)
            this.showOptions()
          }
        },
        loop: true
      })
    } else if (action === 'teamwork') {
      const { text } = getRandomDialogue(this.currentAgent.id, 'teamwork')
      this.dialoguePhase = 'typing'
      this.continueHint?.setVisible(true)
      this.dialogueBodyText?.setText('')
      this.fullDialogueText = text
      this.currentCharIndex = 0
      this.typewriterTimer?.destroy()
      this.typewriterTimer = this.time.addEvent({
        delay: 35,
        callback: () => {
          if (this.currentCharIndex < this.fullDialogueText.length) {
            this.currentCharIndex++
            this.dialogueBodyText?.setText(this.fullDialogueText.substring(0, this.currentCharIndex))
          } else {
            this.typewriterTimer?.destroy()
            this.onTypewriterComplete()
          }
        },
        loop: true
      })
    }
  }

  private advanceDialogue() {
    if (this.currentCharIndex < this.fullDialogueText.length) {
      this.typewriterTimer?.destroy()
      this.currentCharIndex = this.fullDialogueText.length
      this.dialogueBodyText?.setText(this.fullDialogueText)
      this.onTypewriterComplete()
    }
  }

  private closeDialogue() {
    this.typewriterTimer?.destroy()
    this.clearOptions()

    const camH = this.cameras.main.height
    if (this.dialogueBox) {
      this.tweens.add({
        targets: this.dialogueBox,
        y: camH + 20,
        duration: 200,
        ease: 'Cubic.easeIn',
        onComplete: () => {
          this.dialogueBox?.setVisible(false)
          this.dialogueActive = false
          this.dialoguePhase = 'typing'
        }
      })
    }
    if (this.portraitImage) {
      this.tweens.add({
        targets: this.portraitImage,
        x: -100,
        duration: 250,
        ease: 'Cubic.easeIn',
        onComplete: () => { this.portraitImage?.destroy(); this.portraitImage = undefined }
      })
    }
    this.currentAgent = undefined
  }

  // ─── Camera ────────────────────────────────────────────
  private setupCamera() {
    const camera = this.cameras.main
    camera.setBounds(-200, 0, 2400, 1600)

    let isDragging = false
    let dragStartX = 0
    let dragStartY = 0

    // Pinch-to-zoom
    let initialPinchDistance = 0
    let initialZoom = 1

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // 右鍵拖曳（桌面）
      if (pointer.rightButtonDown()) {
        isDragging = true
        dragStartX = pointer.x
        dragStartY = pointer.y
      }
    })

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      // 右鍵拖曳（桌面）
      if (isDragging && pointer.rightButtonDown()) {
        camera.scrollX -= (pointer.x - dragStartX)
        camera.scrollY -= (pointer.y - dragStartY)
        dragStartX = pointer.x
        dragStartY = pointer.y
        return
      }

      // 雙指縮放（手機 pinch-to-zoom）
      if (this.input.pointer1.isDown && this.input.pointer2.isDown) {
        const p1 = this.input.pointer1
        const p2 = this.input.pointer2
        const dx = p1.x - p2.x
        const dy = p1.y - p2.y
        const currentDistance = Math.sqrt(dx * dx + dy * dy)

        if (initialPinchDistance === 0) {
          initialPinchDistance = currentDistance
          initialZoom = camera.zoom
        } else {
          const scale = currentDistance / initialPinchDistance
          camera.setZoom(Phaser.Math.Clamp(initialZoom * scale, 0.5, 2))
        }
        return
      }

      // 單指拖曳平移（手機） — 只在移動超過 15px 後才啟動
      if (pointer.isDown && !pointer.rightButtonDown()) {
        const dx = pointer.x - pointer.downX
        const dy = pointer.y - pointer.downY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > 15) {
          // 一旦開始拖曳，持續平移
          camera.scrollX -= (pointer.x - pointer.prevPosition.x)
          camera.scrollY -= (pointer.y - pointer.prevPosition.y)
          // 標記為拖曳，讓 pointerup 時不觸發 agent 點擊
          isDragging = true
        }
      }
    })

    this.input.on('pointerup', () => {
      isDragging = false
      initialPinchDistance = 0
    })

    // 滾輪縮放（桌面）
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: any[], _deltaX: number, deltaY: number) => {
      const zoomDelta = deltaY > 0 ? -0.1 : 0.1
      camera.setZoom(Phaser.Math.Clamp(camera.zoom + zoomDelta, 0.5, 2))
    })

    camera.centerOn(640, 400)
  }

  // ─── Title ─────────────────────────────────────────────
  private addTitle() {
    const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent) || 'ontouchstart' in window
    
    this.add.text(640, 30, 'William AI Office - Phase 5', {
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0)

    const hintText = isMobile 
      ? '點擊 Agent 對話 | 拖曳平移 | 雙指縮放'
      : '點擊 Agent 開始對話 | 右鍵拖曳平移 | 滾輪縮放 | ESC 關閉對話'
    
    this.add.text(640, 60, hintText, {
      fontSize: '14px',
      color: '#cccccc'
    }).setOrigin(0.5).setScrollFactor(0)
  }

  // ─── Utility ───────────────────────────────────────────
  private isoToScreen(isoX: number, isoY: number): { x: number; y: number } {
    const offsetX = 640
    const offsetY = 100
    return {
      x: (isoX - isoY) * (this.TILE_WIDTH / 2) + offsetX,
      y: (isoX + isoY) * (this.TILE_HEIGHT / 2) + offsetY
    }
  }

  // ─── Entrance Animation (zoom-in only, no fade) ────────────
  private setupEntranceAnimation() {
    const camera = this.cameras.main

    // 從全景 (zoom 0.6) 慢慢 zoom in 到 1.0
    camera.setZoom(0.6)
    this.tweens.add({
      targets: camera,
      zoom: 1.0,
      duration: 2000,
      ease: 'Cubic.easeInOut'
    })
  }

  // ─── Audio System ──────────────────────────────────────
  private setupAudio() {
    this.bgmMusic = this.sound.add('bgm')
    this.clickSound = this.sound.add('click')
    this.dialogueOpenSound = this.sound.add('dialogue-open')
    this.typewriterSound = this.sound.add('typewriter')
  }

  private playSound(sound?: Phaser.Sound.BaseSound, volume = 1.0) {
    if (!sound || this.isMuted) return
    if ('play' in sound) {
      sound.play({ volume })
    }
  }

  private createMuteButton() {
    const isMobile = this.cameras.main.width < 768
    const btnSize = isMobile ? 56 : 50  // 手機上加大到 56px（超過 44px 觸控最低標準）
    const iconSize = isMobile ? '30px' : '28px'
    const posX = isMobile ? this.cameras.main.width - 66 : 1230
    
    const container = this.add.container(posX, 30)
    
    const bg = this.add.graphics()
    bg.fillStyle(0x000000, 0.7)
    bg.fillRoundedRect(0, 0, btnSize, btnSize, 8)
    bg.lineStyle(2, 0xffffff, 0.5)
    bg.strokeRoundedRect(0, 0, btnSize, btnSize, 8)

    const icon = this.add.text(btnSize / 2, btnSize / 2, '🔊', {
      fontSize: iconSize
    }).setOrigin(0.5)

    container.add([bg, icon])
    container.setInteractive(new Phaser.Geom.Rectangle(0, 0, btnSize, btnSize), Phaser.Geom.Rectangle.Contains)
    container.setScrollFactor(0)

    container.on('pointerdown', () => {
      this.toggleMute()
      icon.setText(this.isMuted ? '🔇' : '🔊')
      
      // Visual feedback
      this.tweens.add({
        targets: container,
        scale: 0.9,
        duration: 100,
        yoyo: true
      })
    })

    container.on('pointerover', () => {
      bg.clear()
      bg.fillStyle(0x1E3A8A, 0.8)
      bg.fillRoundedRect(0, 0, 50, 50, 8)
      bg.lineStyle(2, 0xffffff, 0.8)
      bg.strokeRoundedRect(0, 0, 50, 50, 8)
    })

    container.on('pointerout', () => {
      bg.clear()
      bg.fillStyle(0x000000, 0.7)
      bg.fillRoundedRect(0, 0, 50, 50, 8)
      bg.lineStyle(2, 0xffffff, 0.5)
      bg.strokeRoundedRect(0, 0, 50, 50, 8)
    })
  }

  private toggleMute() {
    this.isMuted = !this.isMuted
    
    if (this.isMuted) {
      this.sound.mute = true
    } else {
      this.sound.mute = false
    }
  }

  // ─── Cleanup (Phase 5) ─────────────────────────────────
  shutdown() {
    if (this.stateManager) {
      this.stateManager.destroy()
    }
    if (this.statePanel) {
      this.statePanel.destroy()
    }
  }
}
