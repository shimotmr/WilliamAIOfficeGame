import Phaser from 'phaser'
import { AGENTS, AgentConfig } from '../config/agents'
import { getRandomDialogue, getStatusInfo } from '../config/dialogues'

export class OfficeScene extends Phaser.Scene {
  private agents: Map<string, Phaser.GameObjects.Container> = new Map()
  private agentNameplates: Map<string, Phaser.GameObjects.Container> = new Map()
  private readonly TILE_WIDTH = 64
  private readonly TILE_HEIGHT = 32
  private readonly MAP_WIDTH = 16
  private readonly MAP_HEIGHT = 16

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
  private agentClickCount: Map<string, number> = new Map()

  // Audio system
  private bgmMusic?: Phaser.Sound.BaseSound
  private clickSound?: Phaser.Sound.BaseSound
  private dialogueOpenSound?: Phaser.Sound.BaseSound
  private typewriterSound?: Phaser.Sound.BaseSound
  private isMuted = false
  private bgmStarted = false

  constructor() {
    super('OfficeScene')
  }

  create() {
    console.log('[OfficeScene] create() start')
    try {
      // Set clean background color
      this.cameras.main.setBackgroundColor('#f0ebe3')
      
      // Create scene
      this.createFloor()
      this.createWalls()
      this.createSceneDecorations()
      this.createAgents()
      this.createAgentNameplates()
      
      // UI & Systems
      this.setupCamera()
      this.addTitle()
      this.createDialogueBox()
      this.setupDialogueInput()
      this.setupEntranceAnimation()
      this.setupAudio()
      this.createMuteButton()
      
      console.log('[OfficeScene] create() done')
    } catch (e) {
      console.error('[OfficeScene] create() CRASHED:', e)
    }
  }

  // ─── Clean Floor (Light wood texture) ──────────────────
  private createFloor() {
    const graphics = this.add.graphics()
    const floorColor = 0xE5D5B8 // Light wood color
    
    for (let y = 0; y < this.MAP_HEIGHT; y++) {
      for (let x = 0; x < this.MAP_WIDTH; x++) {
        const pos = this.isoToScreen(x, y)
        
        // Draw isometric tile
        graphics.fillStyle(floorColor, 1)
        graphics.lineStyle(1, 0xD4C4A8, 0.3)
        
        graphics.beginPath()
        graphics.moveTo(pos.x, pos.y - this.TILE_HEIGHT / 2)
        graphics.lineTo(pos.x + this.TILE_WIDTH / 2, pos.y)
        graphics.lineTo(pos.x, pos.y + this.TILE_HEIGHT / 2)
        graphics.lineTo(pos.x - this.TILE_WIDTH / 2, pos.y)
        graphics.closePath()
        graphics.fillPath()
        graphics.strokePath()
      }
    }
    
    graphics.setDepth(-10)
  }

  // ─── Simple Walls (Light gray, outer boundary only) ────
  private createWalls() {
    const graphics = this.add.graphics()
    graphics.lineStyle(3, 0xCCCCCC, 1)
    graphics.fillStyle(0xE8E8E8, 0.8)
    
    // Draw outer walls
    const corners = [
      this.isoToScreen(0, 0),
      this.isoToScreen(this.MAP_WIDTH - 1, 0),
      this.isoToScreen(this.MAP_WIDTH - 1, this.MAP_HEIGHT - 1),
      this.isoToScreen(0, this.MAP_HEIGHT - 1)
    ]
    
    // Wall height
    const wallHeight = 100
    
    // Left wall
    graphics.beginPath()
    graphics.moveTo(corners[0].x, corners[0].y)
    graphics.lineTo(corners[0].x, corners[0].y - wallHeight)
    graphics.lineTo(corners[3].x, corners[3].y - wallHeight)
    graphics.lineTo(corners[3].x, corners[3].y)
    graphics.closePath()
    graphics.fillPath()
    graphics.strokePath()
    
    // Right wall
    graphics.beginPath()
    graphics.moveTo(corners[1].x, corners[1].y)
    graphics.lineTo(corners[1].x, corners[1].y - wallHeight)
    graphics.lineTo(corners[2].x, corners[2].y - wallHeight)
    graphics.lineTo(corners[2].x, corners[2].y)
    graphics.closePath()
    graphics.fillPath()
    graphics.strokePath()
    
    graphics.setDepth(5)
  }

  // ─── Scene Decorations ─────────────────────────────────
  private createSceneDecorations() {
    // Conference table in the middle
    this.createConferenceTable(8, 8)
    
    // Entrance door
    this.createEntranceDoor(7, 1)
    
    // Plants in corners
    this.createPlant(1, 1)
    this.createPlant(14, 1)
    this.createPlant(1, 14)
    this.createPlant(14, 14)
    
    // Workstation decorations for each agent
    AGENTS.forEach(agent => {
      this.createWorkstation(agent)
    })
  }

  private createConferenceTable(isoX: number, isoY: number) {
    const pos = this.isoToScreen(isoX, isoY)
    const graphics = this.add.graphics()
    
    // Large oval table
    graphics.fillStyle(0x8B4513, 1)
    graphics.fillEllipse(pos.x, pos.y, 120, 60)
    graphics.lineStyle(2, 0x654321, 1)
    graphics.strokeEllipse(pos.x, pos.y, 120, 60)
    
    graphics.setDepth(0)
  }

  private createEntranceDoor(isoX: number, isoY: number) {
    const pos = this.isoToScreen(isoX, isoY)
    const graphics = this.add.graphics()
    
    // Door frame
    graphics.fillStyle(0x654321, 1)
    graphics.fillRect(pos.x - 20, pos.y - 40, 40, 60)
    graphics.lineStyle(2, 0x4A3319, 1)
    graphics.strokeRect(pos.x - 20, pos.y - 40, 40, 60)
    
    // Door handle
    graphics.fillStyle(0xFFD700, 1)
    graphics.fillCircle(pos.x + 10, pos.y - 10, 3)
    
    graphics.setDepth(1)
  }

  private createPlant(isoX: number, isoY: number) {
    const pos = this.isoToScreen(isoX, isoY)
    const graphics = this.add.graphics()
    
    // Pot (brown square)
    graphics.fillStyle(0x8B4513, 1)
    graphics.fillRect(pos.x - 10, pos.y - 5, 20, 15)
    graphics.lineStyle(1, 0x654321, 1)
    graphics.strokeRect(pos.x - 10, pos.y - 5, 20, 15)
    
    // Plant (green circles)
    graphics.fillStyle(0x228B22, 0.8)
    graphics.fillCircle(pos.x - 5, pos.y - 15, 8)
    graphics.fillCircle(pos.x + 5, pos.y - 15, 8)
    graphics.fillCircle(pos.x, pos.y - 20, 8)
    
    graphics.setDepth(1)
  }

  private createWorkstation(agent: AgentConfig) {
    const pos = this.isoToScreen(agent.position.x, agent.position.y)
    const graphics = this.add.graphics()
    
    // Theme color carpet (very light)
    const carpetColor = parseInt(agent.color.replace('#', ''), 16)
    graphics.fillStyle(carpetColor, 0.15)
    graphics.fillEllipse(pos.x, pos.y + 30, 140, 80)
    
    // Desk (light wood isometric)
    graphics.fillStyle(0xD2B48C, 1)
    graphics.lineStyle(2, 0xC19A6B, 1)
    
    // Isometric desk
    const deskW = 50
    const deskH = 30
    graphics.beginPath()
    graphics.moveTo(pos.x, pos.y + 20)
    graphics.lineTo(pos.x + deskW / 2, pos.y + 20 + deskH / 2)
    graphics.lineTo(pos.x, pos.y + 20 + deskH)
    graphics.lineTo(pos.x - deskW / 2, pos.y + 20 + deskH / 2)
    graphics.closePath()
    graphics.fillPath()
    graphics.strokePath()
    
    // Chair (small, dark)
    graphics.fillStyle(0x333333, 1)
    graphics.fillCircle(pos.x, pos.y + 45, 8)
    
    // Workstation label
    this.add.text(pos.x, pos.y + 60, agent.workstation, {
      fontSize: '10px',
      color: '#666666',
      fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif'
    }).setOrigin(0.5).setDepth(2)
    
    graphics.setDepth(-1)
  }

  // ─── Agent Creation (with nameplates) ──────────────────
  private createAgents() {
    AGENTS.forEach((agent, index) => {
      const screenPos = this.isoToScreen(agent.position.x, agent.position.y)
      const container = this.add.container(screenPos.x, screenPos.y - 20)

      // Shadow (ellipse under feet)
      const shadow = this.add.graphics()
      shadow.fillStyle(0x000000, 0.2)
      shadow.fillEllipse(0, 50, 40, 12)
      container.add(shadow)

      // Character image (110px)
      const imageKey = `${agent.id}-hq`
      const sprite = this.add.image(0, 0, imageKey)
      sprite.setDisplaySize(110, 110)
      
      // Larger hitArea: 200x200
      sprite.setInteractive({
        useHandCursor: true,
        hitArea: new Phaser.Geom.Rectangle(-100, -100, 200, 200),
        hitAreaCallback: Phaser.Geom.Rectangle.Contains
      })

      sprite.on('pointerover', () => {
        sprite.setTint(0xffffaa)
        this.tweens.add({
          targets: sprite,
          scaleX: 1.15,
          scaleY: 1.15,
          duration: 150,
          ease: 'Back.easeOut'
        })
      })
      
      sprite.on('pointerout', () => {
        sprite.clearTint()
        this.tweens.add({
          targets: sprite,
          scaleX: 1,
          scaleY: 1,
          duration: 150,
          ease: 'Sine.easeOut'
        })
      })
      
      sprite.on('pointerdown', () => {
        // Click bounce animation
        this.tweens.add({
          targets: container,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 100,
          yoyo: true,
          ease: 'Sine.easeInOut'
        })
        this.onAgentClick(agent)
      })

      container.add(sprite)
      this.agents.set(agent.id, container)

      // Idle floating animation (offset per agent)
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

  // ─── Agent Nameplates (HUD) ────────────────────────────
  private createAgentNameplates() {
    const isMobile = this.cameras.main.width < 768
    
    AGENTS.forEach(agent => {
      const screenPos = this.isoToScreen(agent.position.x, agent.position.y)
      const container = this.add.container(screenPos.x, screenPos.y - 90)

      const nameWidth = isMobile ? 140 : 180
      const nameHeight = isMobile ? 40 : 50
      const nameFontSize = isMobile ? '13px' : '16px'
      const roleFontSize = isMobile ? '10px' : '12px'
      
      // Semi-transparent black rounded rectangle
      const bgGraphics = this.add.graphics()
      bgGraphics.fillStyle(0x000000, 0.7)
      bgGraphics.fillRoundedRect(-nameWidth / 2, 0, nameWidth, nameHeight, 8)
      bgGraphics.lineStyle(2, parseInt(agent.color.replace('#', ''), 16), 0.8)
      bgGraphics.strokeRoundedRect(-nameWidth / 2, 0, nameWidth, nameHeight, 8)

      // Agent name (large text)
      const nameText = this.add.text(0, isMobile ? 8 : 12, agent.name, {
        fontSize: nameFontSize,
        fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
        fontStyle: 'bold',
        color: '#ffffff',
        shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 3, fill: true }
      }).setOrigin(0.5, 0)

      // Role text (small text)
      const roleText = this.add.text(0, isMobile ? 23 : 30, agent.role, {
        fontSize: roleFontSize,
        fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
        color: '#cccccc'
      }).setOrigin(0.5, 0)

      container.add([bgGraphics, nameText, roleText])
      container.setDepth(100)
      
      // Make nameplate clickable
      container.setSize(nameWidth, nameHeight)
      container.setInteractive({
        useHandCursor: true,
        hitArea: new Phaser.Geom.Rectangle(-nameWidth / 2, 0, nameWidth, nameHeight),
        hitAreaCallback: Phaser.Geom.Rectangle.Contains
      })
      
      container.on('pointerdown', () => {
        this.tweens.add({
          targets: container,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 100,
          yoyo: true,
          ease: 'Sine.easeInOut'
        })
        this.onAgentClick(agent)
      })
      
      container.on('pointerover', () => {
        bgGraphics.clear()
        bgGraphics.fillStyle(0x000000, 0.85)
        bgGraphics.fillRoundedRect(-nameWidth / 2, 0, nameWidth, nameHeight, 8)
        bgGraphics.lineStyle(3, parseInt(agent.color.replace('#', ''), 16), 1)
        bgGraphics.strokeRoundedRect(-nameWidth / 2, 0, nameWidth, nameHeight, 8)
      })
      
      container.on('pointerout', () => {
        bgGraphics.clear()
        bgGraphics.fillStyle(0x000000, 0.7)
        bgGraphics.fillRoundedRect(-nameWidth / 2, 0, nameWidth, nameHeight, 8)
        bgGraphics.lineStyle(2, parseInt(agent.color.replace('#', ''), 16), 0.8)
        bgGraphics.strokeRoundedRect(-nameWidth / 2, 0, nameWidth, nameHeight, 8)
      })

      this.agentNameplates.set(agent.id, container)
    })
  }

  // ─── Dialogue (Persona 5 Style) ─────────────────────────
  private createDialogueBox() {
    const w = this.cameras.main.width
    const boxH = 160

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

    this.playSound(this.clickSound)
    if (!this.bgmStarted && this.bgmMusic) {
      this.bgmMusic.play({ loop: true, volume: 0.3 })
      this.bgmStarted = true
    }

    const color = parseInt(agent.color.replace('#', ''), 16)
    const agentContainer = this.agents.get(agent.id)
    if (agentContainer) {
      // Ripple effect
      const flash = this.add.graphics()
      flash.setPosition(agentContainer.x, agentContainer.y)
      flash.fillStyle(color, 0.3)
      flash.fillCircle(0, 0, 70)
      this.tweens.add({ 
        targets: flash, 
        alpha: 0,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 500, 
        onComplete: () => flash.destroy() 
      })

      this.cameras.main.pan(agentContainer.x, agentContainer.y, 600, 'Sine.easeInOut')
    }

    this.currentAgent = agent
    
    const currentCount = this.agentClickCount.get(agent.id) || 0
    this.agentClickCount.set(agent.id, currentCount + 1)
    
    const { text } = getRandomDialogue(agent.id, undefined, currentCount + 1)
    this.showDialogue(agent, text)
  }

  private showDialogue(agent: AgentConfig, text: string) {
    if (!this.dialogueBox || !this.dialogueNameText || !this.dialogueBodyText) return

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
      const btnH = isMobile ? 50 : 40
      const btnSpacing = isMobile ? 60 : 50
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

  // ─── Camera (with mobile touch support) ───────────────
  private setupCamera() {
    const camera = this.cameras.main
    camera.setBounds(-200, 0, 1600, 1200)

    let isDragging = false
    let dragStartX = 0
    let dragStartY = 0

    let initialPinchDistance = 0
    let initialZoom = 1

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        isDragging = true
        dragStartX = pointer.x
        dragStartY = pointer.y
      }
    })

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (isDragging && pointer.rightButtonDown()) {
        camera.scrollX -= (pointer.x - dragStartX)
        camera.scrollY -= (pointer.y - dragStartY)
        dragStartX = pointer.x
        dragStartY = pointer.y
        return
      }

      // Pinch zoom (two fingers)
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

      // Single finger drag (threshold > 15px)
      if (pointer.isDown && !pointer.rightButtonDown()) {
        const dx = pointer.x - pointer.downX
        const dy = pointer.y - pointer.downY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > 15) {
          camera.scrollX -= (pointer.x - pointer.prevPosition.x)
          camera.scrollY -= (pointer.y - pointer.prevPosition.y)
          isDragging = true
        }
      }
    })

    this.input.on('pointerup', () => {
      isDragging = false
      initialPinchDistance = 0
    })

    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: any[], _deltaX: number, deltaY: number) => {
      const zoomDelta = deltaY > 0 ? -0.1 : 0.1
      camera.setZoom(Phaser.Math.Clamp(camera.zoom + zoomDelta, 0.5, 2))
    })

    camera.centerOn(512, 350)
  }

  // ─── Title ─────────────────────────────────────────────
  private addTitle() {
    const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent) || 'ontouchstart' in window
    
    this.add.text(640, 30, 'William AI Office', {
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#333333',
      stroke: '#ffffff',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0)

    const hintText = isMobile 
      ? '點擊 Agent 或名牌對話 | 拖曳平移 | 雙指縮放'
      : '點擊 Agent 或名牌開始對話 | 右鍵拖曳平移 | 滾輪縮放 | ESC 關閉對話'
    
    this.add.text(640, 60, hintText, {
      fontSize: '14px',
      color: '#666666'
    }).setOrigin(0.5).setScrollFactor(0)
  }

  // ─── Utility ───────────────────────────────────────────
  private isoToScreen(isoX: number, isoY: number): { x: number; y: number } {
    const offsetX = 512
    const offsetY = 100
    return {
      x: (isoX - isoY) * (this.TILE_WIDTH / 2) + offsetX,
      y: (isoX + isoY) * (this.TILE_HEIGHT / 2) + offsetY
    }
  }

  // ─── Entrance Animation ────────────────────────────────
  private setupEntranceAnimation() {
    const camera = this.cameras.main
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
    const btnSize = isMobile ? 56 : 50
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
    this.sound.mute = this.isMuted
  }
}
