import Phaser from 'phaser'
import { AGENTS, AgentConfig } from '../config/agents'

export class OfficeScene extends Phaser.Scene {
  private agents: Map<string, Phaser.GameObjects.Container> = new Map()
  private readonly TILE_WIDTH = 64
  private readonly TILE_HEIGHT = 32
  private readonly MAP_WIDTH = 20
  private readonly MAP_HEIGHT = 18

  constructor() {
    super('OfficeScene')
  }

  create() {
    // 設定背景顏色
    this.cameras.main.setBackgroundColor('#2c2c2c')

    // 建立等軸測地板
    this.createIsometricFloor()

    // 放置工作站標記
    this.createWorkstations()

    // 放置 Agent
    this.createAgents()

    // 設定相機控制
    this.setupCamera()

    // 添加標題
    this.addTitle()
  }

  private createIsometricFloor() {
    const graphics = this.add.graphics()
    const offsetX = 640
    const offsetY = 100

    for (let y = 0; y < this.MAP_HEIGHT; y++) {
      for (let x = 0; x < this.MAP_WIDTH; x++) {
        const screenX = (x - y) * (this.TILE_WIDTH / 2) + offsetX
        const screenY = (x + y) * (this.TILE_HEIGHT / 2) + offsetY

        // 棋盤格紋理
        const isDark = (x + y) % 2 === 0
        graphics.fillStyle(isDark ? 0x3a3a3a : 0x4a4a4a, 1)

        // 繪製菱形地磚
        graphics.beginPath()
        graphics.moveTo(screenX, screenY)
        graphics.lineTo(screenX + this.TILE_WIDTH / 2, screenY + this.TILE_HEIGHT / 2)
        graphics.lineTo(screenX, screenY + this.TILE_HEIGHT)
        graphics.lineTo(screenX - this.TILE_WIDTH / 2, screenY + this.TILE_HEIGHT / 2)
        graphics.closePath()
        graphics.fillPath()

        // 地磚邊框
        graphics.lineStyle(1, 0x555555, 0.3)
        graphics.strokePath()
      }
    }
  }

  private createWorkstations() {
    AGENTS.forEach((agent) => {
      const screenPos = this.isoToScreen(agent.position.x, agent.position.y)
      
      // 工作站底座（深色方塊）
      this.add.rectangle(
        screenPos.x,
        screenPos.y,
        this.TILE_WIDTH * 0.8,
        this.TILE_HEIGHT * 0.8,
        0x2c2c2c,
        0.5
      )

      // 工作站名稱標籤
      this.add.text(
        screenPos.x,
        screenPos.y + 40,
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

  private createAgents() {
    AGENTS.forEach((agent) => {
      const screenPos = this.isoToScreen(agent.position.x, agent.position.y)
      
      // 建立 Agent 容器
      const container = this.add.container(screenPos.x, screenPos.y - 20)

      // 角色 placeholder（圓形 + 顏色）
      const circle = this.add.circle(0, 0, 20, parseInt(agent.color.replace('#', '0x')))
      circle.setStrokeStyle(3, 0xffffff)

      // 角色名稱
      const nameText = this.add.text(0, -35, agent.name, {
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5)

      // 角色職位
      const roleText = this.add.text(0, 30, agent.role, {
        fontSize: '10px',
        color: '#cccccc'
      }).setOrigin(0.5)

      container.add([circle, nameText, roleText])

      // 設定互動
      circle.setInteractive({ useHandCursor: true })
      circle.on('pointerdown', () => this.onAgentClick(agent))
      circle.on('pointerover', () => {
        circle.setScale(1.1)
        circle.setStrokeStyle(4, 0xffff00)
      })
      circle.on('pointerout', () => {
        circle.setScale(1)
        circle.setStrokeStyle(3, 0xffffff)
      })

      this.agents.set(agent.id, container)
    })
  }

  private onAgentClick(agent: AgentConfig) {
    console.log(`點擊了 ${agent.name} (${agent.role})`)
    console.log(`工作站: ${agent.workstation}`)
    console.log(`顏色: ${agent.color}`)
    
    // TODO: Phase 3 將會在這裡觸發對話系統
  }

  private setupCamera() {
    const camera = this.cameras.main

    // 設定相機邊界
    camera.setBounds(0, 0, 1600, 1000)

    // 滑鼠拖曳平移
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

    // 滑鼠滾輪縮放
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: any[], _deltaX: number, deltaY: number) => {
      const zoomDelta = deltaY > 0 ? -0.1 : 0.1
      const newZoom = Phaser.Math.Clamp(camera.zoom + zoomDelta, 0.5, 2)
      camera.setZoom(newZoom)
    })

    // 初始位置：置中於辦公室
    camera.centerOn(640, 400)
  }

  private addTitle() {
    this.add.text(640, 30, 'William AI Office - Phase 0 PoC', {
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0)

    this.add.text(640, 60, '點擊 Agent 檢視資訊 | 右鍵拖曳平移 | 滾輪縮放', {
      fontSize: '14px',
      color: '#cccccc'
    }).setOrigin(0.5).setScrollFactor(0)
  }

  // 等軸測座標轉換
  private isoToScreen(isoX: number, isoY: number): { x: number; y: number } {
    const offsetX = 640
    const offsetY = 100
    return {
      x: (isoX - isoY) * (this.TILE_WIDTH / 2) + offsetX,
      y: (isoX + isoY) * (this.TILE_HEIGHT / 2) + offsetY
    }
  }
}
