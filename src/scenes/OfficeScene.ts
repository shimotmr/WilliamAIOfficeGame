import Phaser from 'phaser'
import { AGENTS, AgentConfig } from '../config/agents'
import {
  drawTravisDecorations, drawResearcherDecorations, drawInspectorDecorations,
  drawSecretaryDecorations, drawCoderDecorations, drawWriterDecorations,
  drawDesignerDecorations, drawAnalystDecorations, drawWalls,
  drawConferenceTable, drawPartition,
  drawLoungeArea, drawKitchenArea, drawEntranceArea, drawPottedPlantDecor
} from './WorkstationDecorations'
import { getRandomDialogue, getStatusInfo } from '../config/dialogues'

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

  // Floating particle objects
  private travisParticles: { x: number; y: number; vy: number; alpha: number; obj: Phaser.GameObjects.Arc }[] = []
  private analystDigits: { obj: Phaser.GameObjects.Text; vy: number; life: number }[] = []

  constructor() {
    super('OfficeScene')
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1410')
    this.createIsometricFloor()
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
    this.setupCamera()
    this.addTitle()
    this.createDialogueBox()
    this.setupDialogueInput()
    this.createTravisParticles()
    this.createAnalystDigits()
  }

  update(_time: number, delta: number) {
    this.updateTravisParticles(delta)
    this.updateAnalystDigits(delta)
  }

  // ─── Floor (warm wood tones) ───────────────────────────
  private createIsometricFloor() {
    const graphics = this.add.graphics()
    const offsetX = 640
    const offsetY = 100

    for (let y = 0; y < this.MAP_HEIGHT; y++) {
      for (let x = 0; x < this.MAP_WIDTH; x++) {
        const screenX = (x - y) * (this.TILE_WIDTH / 2) + offsetX
        const screenY = (x + y) * (this.TILE_HEIGHT / 2) + offsetY

        const isDark = (x + y) % 2 === 0
        graphics.fillStyle(isDark ? 0x8B6B4A : 0x9E7B5A, 1)

        graphics.beginPath()
        graphics.moveTo(screenX, screenY)
        graphics.lineTo(screenX + this.TILE_WIDTH / 2, screenY + this.TILE_HEIGHT / 2)
        graphics.lineTo(screenX, screenY + this.TILE_HEIGHT)
        graphics.lineTo(screenX - this.TILE_WIDTH / 2, screenY + this.TILE_HEIGHT / 2)
        graphics.closePath()
        graphics.fillPath()

        graphics.lineStyle(1, 0xA08060, 0.2)
        graphics.strokePath()
      }
    }
  }

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

    // Potted plants scattered along walkways
    const plantPositions = [
      { x: 6, y: 6 }, { x: 18, y: 4 }, { x: 4, y: 18 },
      { x: 20, y: 18 }, { x: 14, y: 14 }, { x: 10, y: 10 },
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

  // ─── Travis floating blue particles ────────────────────
  private createTravisParticles() {
    const travisAgent = AGENTS.find(a => a.id === 'travis')!
    const pos = this.isoToScreen(travisAgent.position.x, travisAgent.position.y)
    for (let i = 0; i < 12; i++) {
      const px = pos.x + Phaser.Math.Between(-60, 60)
      const py = pos.y + Phaser.Math.Between(-50, 30)
      const dot = this.add.circle(px, py, Phaser.Math.Between(1, 3), 0x4488FF, 0.5)
      this.travisParticles.push({
        x: px, y: py,
        vy: -0.1 - Math.random() * 0.15,
        alpha: 0.3 + Math.random() * 0.5,
        obj: dot
      })
    }
  }

  private updateTravisParticles(delta: number) {
    const travisAgent = AGENTS.find(a => a.id === 'travis')!
    const pos = this.isoToScreen(travisAgent.position.x, travisAgent.position.y)
    this.travisParticles.forEach(p => {
      p.y += p.vy * delta * 0.05
      p.alpha += Math.sin(Date.now() * 0.002 + p.x) * 0.01
      if (p.y < pos.y - 70) {
        p.y = pos.y + 30
        p.x = pos.x + Phaser.Math.Between(-60, 60)
      }
      p.obj.setPosition(p.x, p.y)
      p.obj.setAlpha(Phaser.Math.Clamp(p.alpha, 0.1, 0.7))
    })
  }

  // ─── Analyst floating green digits ─────────────────────
  private createAnalystDigits() {
    const analystAgent = AGENTS.find(a => a.id === 'analyst')!
    const pos = this.isoToScreen(analystAgent.position.x, analystAgent.position.y)
    for (let i = 0; i < 8; i++) {
      this.spawnAnalystDigit(pos)
    }
  }

  private spawnAnalystDigit(pos: { x: number; y: number }) {
    const digit = this.add.text(
      pos.x + Phaser.Math.Between(-35, 15),
      pos.y + Phaser.Math.Between(-60, -30),
      String(Phaser.Math.Between(0, 9)),
      { fontSize: '10px', color: '#00FF00', fontFamily: 'monospace' }
    ).setAlpha(0.6)
    this.analystDigits.push({ obj: digit, vy: -0.3 - Math.random() * 0.3, life: Math.random() * 3000 })
  }

  private updateAnalystDigits(delta: number) {
    const analystAgent = AGENTS.find(a => a.id === 'analyst')!
    const pos = this.isoToScreen(analystAgent.position.x, analystAgent.position.y)
    this.analystDigits.forEach(d => {
      d.life -= delta
      d.obj.y += d.vy * delta * 0.05
      d.obj.setAlpha(Phaser.Math.Clamp(d.life / 1500, 0, 0.7))
      if (d.life <= 0) {
        d.obj.setPosition(pos.x + Phaser.Math.Between(-35, 15), pos.y - 30)
        d.obj.setText(String(Phaser.Math.Between(0, 9)))
        d.obj.setAlpha(0.6)
        d.life = 2000 + Math.random() * 2000
      }
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
      const imageKey = `${agent.id}-male`
      const sprite = this.add.image(0, 0, imageKey)
      sprite.setDisplaySize(110, 110)
      sprite.setInteractive({ useHandCursor: true })

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

  // ─── Dialogue (Persona 5 Style) ─────────────────────────
  private createDialogueBox() {
    const w = this.cameras.main.width
    const boxH = 160

    const container = this.add.container(0, this.cameras.main.height)
      .setScrollFactor(0).setDepth(2000).setVisible(false)

    const bg = this.add.graphics()
    bg.fillStyle(0x000000, 0.85)
    bg.fillRect(20, 0, w - 40, boxH)
    bg.lineStyle(3, 0xDD0000, 1)
    bg.beginPath()
    bg.moveTo(15, boxH)
    bg.lineTo(25, 0)
    bg.lineTo(w - 15, 0)
    bg.lineTo(w - 25, boxH)
    bg.closePath()
    bg.strokePath()
    bg.lineStyle(1, 0xFF3333, 0.5)
    bg.beginPath()
    bg.moveTo(30, boxH - 5)
    bg.lineTo(38, 5)
    bg.lineTo(w - 30, 5)
    bg.lineTo(w - 38, boxH - 5)
    bg.closePath()
    bg.strokePath()

    const nameBg = this.add.graphics()
    this.dialogueNameBg = nameBg

    const nameText = this.add.text(80, -8, '', {
      fontSize: '16px',
      fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
      fontStyle: 'bold',
      color: '#ffffff',
      shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
    }).setOrigin(0.5)

    const bodyText = this.add.text(200, 25, '', {
      fontSize: '20px',
      fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
      fontStyle: 'bold',
      color: '#ffffff',
      wordWrap: { width: w - 280 },
      lineSpacing: 10,
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 3, fill: true }
    })

    const hint = this.add.text(w - 60, boxH - 30, '▼', {
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

    const color = parseInt(agent.color.replace('#', ''), 16)
    const pos = this.isoToScreen(agent.position.x, agent.position.y)
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
    const { text } = getRandomDialogue(agent.id)
    this.showDialogue(agent, text)
  }

  private showDialogue(agent: AgentConfig, text: string) {
    if (!this.dialogueBox || !this.dialogueNameText || !this.dialogueBodyText) return

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
    this.tweens.add({
      targets: this.dialogueBox,
      y: camH - boxH,
      duration: 200,
      ease: 'Back.easeOut'
    })

    this.showPortrait(agent)

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

  private showPortrait(agent: AgentConfig) {
    this.portraitImage?.destroy()
    const imageKey = `${agent.id}-male`
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
    const options = [
      { label: '了解更多', action: 'more' },
      { label: '查看工作狀態', action: 'status' },
      { label: '離開', action: 'leave' },
    ]

    options.forEach((opt, i) => {
      const btnW = 200
      const btnH = 40
      const startX = camW - 260
      const startY = camH - 180 - (options.length - i) * 50

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

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        isDragging = true
        dragStartX = pointer.x
        dragStartY = pointer.y
      }
    })

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (isDragging) {
        camera.scrollX -= (pointer.x - dragStartX)
        camera.scrollY -= (pointer.y - dragStartY)
        dragStartX = pointer.x
        dragStartY = pointer.y
      }
    })

    this.input.on('pointerup', () => {
      isDragging = false
    })

    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: any[], _deltaX: number, deltaY: number) => {
      const zoomDelta = deltaY > 0 ? -0.1 : 0.1
      const newZoom = Phaser.Math.Clamp(camera.zoom + zoomDelta, 0.5, 2)
      camera.setZoom(newZoom)
    })

    camera.centerOn(640, 400)
  }

  // ─── Title ─────────────────────────────────────────────
  private addTitle() {
    this.add.text(640, 30, 'William AI Office - Phase 5', {
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0)

    this.add.text(640, 60, '點擊 Agent 開始對話 | 右鍵拖曳平移 | 滾輪縮放 | ESC 關閉對話', {
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
}
