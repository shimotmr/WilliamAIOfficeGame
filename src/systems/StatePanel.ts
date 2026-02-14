import Phaser from 'phaser'
import { AgentStateManager, MOOD_EMOJI, ACTIVITY_NAMES, AgentState } from './AgentStateManager'
import { AGENTS } from '../config/agents'

export class StatePanel {
  private scene: Phaser.Scene
  private stateManager: AgentStateManager
  private container: Phaser.GameObjects.Container
  private background: Phaser.GameObjects.Graphics
  private titleText: Phaser.GameObjects.Text
  private agentTexts: Map<string, Phaser.GameObjects.Text> = new Map()
  private energyBars: Map<string, Phaser.GameObjects.Graphics> = new Map()
  private isCollapsed = false
  private toggleButton: Phaser.GameObjects.Container
  private contentContainer: Phaser.GameObjects.Container

  private readonly PANEL_WIDTH = 280
  private readonly PANEL_COLLAPSED_WIDTH = 40
  private readonly LINE_HEIGHT = 28
  private readonly PADDING = 12

  constructor(scene: Phaser.Scene, stateManager: AgentStateManager) {
    this.scene = scene
    this.stateManager = stateManager

    // Main container
    this.container = scene.add.container(10, 10)
    this.container.setDepth(1000)
    this.container.setScrollFactor(0)

    // Background
    this.background = scene.add.graphics()
    this.container.add(this.background)

    // Title
    this.titleText = scene.add.text(this.PADDING, this.PADDING, '📊 Team Status', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    })
    this.container.add(this.titleText)

    // Content container (for collapse)
    this.contentContainer = scene.add.container(0, 0)
    this.container.add(this.contentContainer)

    // Create agent status lines
    AGENTS.forEach((agent, index) => {
      const y = this.PADDING + 30 + index * this.LINE_HEIGHT

      // Agent status text
      const text = scene.add.text(this.PADDING, y, '', {
        fontSize: '13px',
        fontFamily: '"Courier New", monospace',
        color: '#ffffff'
      })
      this.contentContainer.add(text)
      this.agentTexts.set(agent.id, text)

      // Energy bar
      const energyBar = scene.add.graphics()
      this.contentContainer.add(energyBar)
      this.energyBars.set(agent.id, energyBar)
    })

    // Toggle button
    this.toggleButton = this.createToggleButton()
    this.container.add(this.toggleButton)

    // Initial draw
    this.updatePanel()
    this.redrawBackground()

    // Update every 1 second
    scene.time.addEvent({
      delay: 1000,
      callback: () => this.updatePanel(),
      loop: true
    })

    // Make panel interactive
    this.setupInteractivity()
  }

  private createToggleButton(): Phaser.GameObjects.Container {
    const btnContainer = this.scene.add.container(0, 0)

    const btnBg = this.scene.add.graphics()
    btnBg.fillStyle(0x000000, 0.6)
    btnBg.fillRoundedRect(0, 0, 30, 30, 5)
    btnBg.lineStyle(1, 0xffffff, 0.5)
    btnBg.strokeRoundedRect(0, 0, 30, 30, 5)
    btnContainer.add(btnBg)

    const btnText = this.scene.add.text(15, 15, '◀', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5)
    btnContainer.add(btnText)

    btnContainer.setPosition(this.PANEL_WIDTH - 35, 8)
    btnContainer.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, 30, 30),
      Phaser.Geom.Rectangle.Contains
    )

    btnContainer.on('pointerdown', () => {
      this.isCollapsed = !this.isCollapsed
      btnText.setText(this.isCollapsed ? '▶' : '◀')
      this.contentContainer.setVisible(!this.isCollapsed)
      this.titleText.setVisible(!this.isCollapsed)
      this.redrawBackground()
      
      if (this.isCollapsed) {
        btnContainer.setPosition(5, 8)
      } else {
        btnContainer.setPosition(this.PANEL_WIDTH - 35, 8)
      }
    })

    btnContainer.on('pointerover', () => {
      btnBg.clear()
      btnBg.fillStyle(0x333333, 0.8)
      btnBg.fillRoundedRect(0, 0, 30, 30, 5)
      btnBg.lineStyle(1, 0xffffff, 0.8)
      btnBg.strokeRoundedRect(0, 0, 30, 30, 5)
    })

    btnContainer.on('pointerout', () => {
      btnBg.clear()
      btnBg.fillStyle(0x000000, 0.6)
      btnBg.fillRoundedRect(0, 0, 30, 30, 5)
      btnBg.lineStyle(1, 0xffffff, 0.5)
      btnBg.strokeRoundedRect(0, 0, 30, 30, 5)
    })

    return btnContainer
  }

  private setupInteractivity() {
    // Make background interactive for dragging
    const panelHeight = this.PADDING * 2 + 30 + AGENTS.length * this.LINE_HEIGHT
    this.background.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, this.PANEL_WIDTH, panelHeight),
      Phaser.Geom.Rectangle.Contains
    )

    // Enable dragging
    this.scene.input.setDraggable(this.background)
    
    this.scene.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number, dragY: number) => {
      if (gameObject === this.background) {
        this.container.setPosition(dragX, dragY)
      }
    })
  }

  private redrawBackground() {
    this.background.clear()
    
    const width = this.isCollapsed ? this.PANEL_COLLAPSED_WIDTH : this.PANEL_WIDTH
    const height = this.isCollapsed ? 46 : this.PADDING * 2 + 30 + AGENTS.length * this.LINE_HEIGHT

    // Background with gradient
    this.background.fillStyle(0x000000, 0.85)
    this.background.fillRoundedRect(0, 0, width, height, 8)
    
    // Border
    this.background.lineStyle(2, 0x3b82f6, 0.6)
    this.background.strokeRoundedRect(0, 0, width, height, 8)
    
    // Top accent
    this.background.fillStyle(0x3b82f6, 0.3)
    this.background.fillRoundedRect(0, 0, width, 30, 8)
  }

  private updatePanel() {
    const states = this.stateManager.getAllStates()
    
    AGENTS.forEach((agent, index) => {
      const state = states.get(agent.id)
      if (!state) return

      const text = this.agentTexts.get(agent.id)
      const energyBar = this.energyBars.get(agent.id)
      if (!text || !energyBar) return

      // Format: "Travis  😊 Working  ████░░ 70%"
      const emoji = MOOD_EMOJI[state.mood]
      const activityName = ACTIVITY_NAMES[state.activity]
      const energyPercent = Math.round(state.energy)
      
      // Pad agent name to 9 chars
      const paddedName = agent.name.padEnd(9, ' ')
      const paddedActivity = activityName.padEnd(8, ' ')
      
      text.setText(`${paddedName} ${emoji} ${paddedActivity}`)

      // Draw energy bar
      const y = this.PADDING + 30 + index * this.LINE_HEIGHT + 16
      const barX = this.PADDING + 180
      const barWidth = 60
      const barHeight = 8

      energyBar.clear()
      
      // Background
      energyBar.fillStyle(0x333333, 0.8)
      energyBar.fillRect(barX, y, barWidth, barHeight)
      
      // Energy fill (color based on level)
      let fillColor = 0x10B981 // Green
      if (energyPercent < 30) fillColor = 0xEF4444 // Red
      else if (energyPercent < 60) fillColor = 0xFBBF24 // Yellow
      
      energyBar.fillStyle(fillColor, 1)
      energyBar.fillRect(barX, y, (barWidth * energyPercent) / 100, barHeight)
      
      // Border
      energyBar.lineStyle(1, 0xffffff, 0.3)
      energyBar.strokeRect(barX, y, barWidth, barHeight)
      
      // Percentage text
      const percentText = `${energyPercent}%`
      // Remove old percent text if exists
      const oldPercent = text.getData('percentText')
      if (oldPercent) {
        oldPercent.destroy()
      }
      const percent = this.scene.add.text(barX + barWidth + 5, y - 4, percentText, {
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#ffffff'
      })
      this.contentContainer.add(percent)
      text.setData('percentText', percent)
    })
  }

  destroy() {
    this.container.destroy()
  }
}
