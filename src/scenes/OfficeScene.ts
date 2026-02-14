import Phaser from 'phaser'
import { AGENTS, AgentConfig } from '../config/agents'
import {
  drawTravisDecorations, drawResearcherDecorations, drawInspectorDecorations,
  drawSecretaryDecorations, drawCoderDecorations, drawWriterDecorations,
  drawDesignerDecorations, drawAnalystDecorations, drawPlant, drawWalls
} from './WorkstationDecorations'

const DIALOGUES: Record<string, string> = {
  travis: '歡迎來到指揮中心。我是 Travis，負責協調所有 Agent 的工作。有什麼需要我安排的嗎？',
  researcher: '嗯...讓我查一下。我是 Researcher，專門負責資料蒐集和深度研究。需要調查什麼？',
  inspector: '品質就是生命。我是 Inspector，所有上線的東西都要經過我的審查。',
  secretary: '早安！我是 Secretary，負責郵件管理和行程安排。今天有什麼重要的事嗎？',
  coder: '啊，你來了。我是 Coder，正在寫程式...等一下，這個 bug 快修好了。',
  writer: '文字是有力量的。我是 Writer，負責撰寫報告和內容創作。',
  designer: '美感很重要呢。我是 Designer，負責 UI/UX 設計和視覺審查。',
  analyst: '數字不會騙人。我是 Analyst，專門做財務分析和市場研究。',
}

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

export class OfficeScene extends Phaser.Scene {
  private agents: Map<string, Phaser.GameObjects.Container> = new Map()
  private basePlates: Map<string, Phaser.GameObjects.Graphics> = new Map()
  private readonly TILE_WIDTH = 64
  private readonly TILE_HEIGHT = 32
  private readonly MAP_WIDTH = 26
  private readonly MAP_HEIGHT = 26

  // Dialogue system
  private dialogueBox?: Phaser.GameObjects.Container
  private dialogueNameText?: Phaser.GameObjects.Text
  private dialogueBodyText?: Phaser.GameObjects.Text
  private dialogueActive = false
  private typewriterTimer?: Phaser.Time.TimerEvent
  private fullDialogueText = ''
  private currentCharIndex = 0

  // Floating particle objects
  private travisParticles: { x: number; y: number; vy: number; alpha: number; obj: Phaser.GameObjects.Arc }[] = []
  private analystDigits: { obj: Phaser.GameObjects.Text; vy: number; life: number }[] = []

  constructor() {
    super('OfficeScene')
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1410')
    this.createIsometricFloor()
    this.createWalls()
    this.createPlants()
    this.createBasePlates()
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

  // ─── Walls ─────────────────────────────────────────────
  private createWalls() {
    drawWalls(this, this.isoToScreen.bind(this), this.MAP_WIDTH)
  }

  // ─── Corner plants ─────────────────────────────────────
  private createPlants() {
    const corners = [
      { x: 1, y: 1 },
      { x: 24, y: 1 },
      { x: 1, y: 24 },
      { x: 24, y: 24 },
      { x: 12, y: 0 },
      { x: 0, y: 12 },
    ]
    corners.forEach(c => {
      const pos = this.isoToScreen(c.x, c.y)
      drawPlant(this, pos.x, pos.y)
    })
  }

  // ─── Base plates (semi-transparent, agent theme color) ─
  private createBasePlates() {
    AGENTS.forEach((agent) => {
      const pos = this.isoToScreen(agent.position.x, agent.position.y)
      const g = this.add.graphics()
      const color = parseInt(agent.color.replace('#', ''), 16)
      // 3×3 tile diamond
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
      // Thin border
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

  // ─── Workstation labels (moved from old createWorkstations) ─
  private createWorkstationLabels() {
    AGENTS.forEach((agent) => {
      const screenPos = this.isoToScreen(agent.position.x, agent.position.y)
      this.add.text(
        screenPos.x,
        screenPos.y + 60,
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

  // ─── Agents ────────────────────────────────────────────
  private createAgents() {
    AGENTS.forEach((agent) => {
      const screenPos = this.isoToScreen(agent.position.x, agent.position.y)
      const container = this.add.container(screenPos.x, screenPos.y - 20)

      const imageKey = `${agent.id}-male`
      const sprite = this.add.image(0, 0, imageKey)
      sprite.setDisplaySize(80, 80)
      sprite.setInteractive({ useHandCursor: true })

      sprite.on('pointerover', () => {
        sprite.setTint(0xffffaa)
        sprite.setScale(sprite.scaleX * 1.1, sprite.scaleY * 1.1)
      })
      sprite.on('pointerout', () => {
        sprite.clearTint()
        sprite.setDisplaySize(80, 80)
      })
      sprite.on('pointerdown', () => this.onAgentClick(agent))

      const nameText = this.add.text(0, -50, agent.name, {
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5)

      const roleText = this.add.text(0, 48, agent.role, {
        fontSize: '10px',
        color: '#cccccc'
      }).setOrigin(0.5)

      container.add([sprite, nameText, roleText])
      this.agents.set(agent.id, container)
    })
  }

  // ─── Dialogue ──────────────────────────────────────────
  private createDialogueBox() {
    const w = this.cameras.main.width
    const h = this.cameras.main.height
    const boxH = 180
    const boxY = h - boxH

    const container = this.add.container(0, boxY).setScrollFactor(0).setDepth(1000).setVisible(false)

    const bg = this.add.rectangle(w / 2, boxH / 2, w - 40, boxH - 20, 0x000000, 0.8)
    bg.setStrokeStyle(2, 0x4488ff)

    const nameBg = this.add.rectangle(100, 8, 160, 30, 0x1E3A8A, 0.9)
    const nameText = this.add.text(100, 8, '', {
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5)

    const bodyText = this.add.text(40, 35, '', {
      fontSize: '16px',
      color: '#ffffff',
      wordWrap: { width: w - 120 },
      lineSpacing: 8
    })

    const hint = this.add.text(w - 60, boxH - 30, '▼', {
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0.5)
    this.tweens.add({ targets: hint, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 })

    container.add([bg, nameBg, nameText, bodyText, hint])
    this.dialogueBox = container
    this.dialogueNameText = nameText
    this.dialogueBodyText = bodyText
  }

  private setupDialogueInput() {
    this.input.on('pointerdown', (_pointer: Phaser.Input.Pointer) => {
      if (!this.dialogueActive) return
      this.advanceDialogue()
    })

    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.dialogueActive) this.advanceDialogue()
    })

    this.input.keyboard?.on('keydown-ESC', () => {
      if (this.dialogueActive) this.closeDialogue()
    })
  }

  private onAgentClick(agent: AgentConfig) {
    const text = DIALOGUES[agent.id]
    if (!text) return

    // Flash base plate highlight
    const plate = this.basePlates.get(agent.id)
    if (plate) {
      const color = parseInt(agent.color.replace('#', ''), 16)
      const pos = this.isoToScreen(agent.position.x, agent.position.y)
      const w = this.TILE_WIDTH * 3
      const h = this.TILE_HEIGHT * 3

      // Create flash overlay
      const flash = this.add.graphics()
      flash.fillStyle(color, 0.4)
      flash.beginPath()
      flash.moveTo(pos.x, pos.y - h / 2)
      flash.lineTo(pos.x + w / 2, pos.y)
      flash.lineTo(pos.x, pos.y + h / 2)
      flash.lineTo(pos.x - w / 2, pos.y)
      flash.closePath()
      flash.fillPath()

      this.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 500,
        onComplete: () => flash.destroy()
      })
    }

    // Camera pan to agent
    const screenPos = this.isoToScreen(agent.position.x, agent.position.y)
    this.cameras.main.pan(screenPos.x, screenPos.y, 600, 'Sine.easeInOut')

    this.showDialogue(agent.name, text)
  }

  private showDialogue(name: string, text: string) {
    if (!this.dialogueBox || !this.dialogueNameText || !this.dialogueBodyText) return

    this.dialogueActive = true
    this.dialogueBox.setVisible(true)
    this.dialogueNameText.setText(name)
    this.dialogueBodyText.setText('')
    this.fullDialogueText = text
    this.currentCharIndex = 0

    this.typewriterTimer?.destroy()
    this.typewriterTimer = this.time.addEvent({
      delay: 40,
      callback: () => {
        if (this.currentCharIndex < this.fullDialogueText.length) {
          this.currentCharIndex++
          this.dialogueBodyText?.setText(this.fullDialogueText.substring(0, this.currentCharIndex))
        } else {
          this.typewriterTimer?.destroy()
        }
      },
      loop: true
    })
  }

  private advanceDialogue() {
    if (this.currentCharIndex < this.fullDialogueText.length) {
      this.typewriterTimer?.destroy()
      this.currentCharIndex = this.fullDialogueText.length
      this.dialogueBodyText?.setText(this.fullDialogueText)
    } else {
      this.closeDialogue()
    }
  }

  private closeDialogue() {
    this.typewriterTimer?.destroy()
    this.dialogueActive = false
    this.dialogueBox?.setVisible(false)
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
    this.add.text(640, 30, 'William AI Office - Phase 2', {
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
