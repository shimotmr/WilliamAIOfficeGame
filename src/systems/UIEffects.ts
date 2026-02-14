import Phaser from 'phaser'
import { isoToScreen } from '../utils/isometric'

/**
 * Speech Bubble System
 */
export class SpeechBubbleSystem {
  private scene: Phaser.Scene
  private bubbles: Map<string, Phaser.GameObjects.Container> = new Map()

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  /**
   * Show a speech bubble above an agent
   */
  show(agentId: string, text: string, isoX: number, isoY: number, duration = 2500): void {
    // Remove existing bubble for this agent
    this.hide(agentId)

    const screenPos = isoToScreen(isoX, isoY)
    const container = this.scene.add.container(screenPos.x, screenPos.y - 100)

    // Bubble background
    const bubble = this.scene.add.graphics()
    const padding = 12
    const textObj = this.scene.add.text(0, 0, text, {
      fontSize: '16px',
      color: '#000000',
      align: 'center'
    }).setOrigin(0.5)

    const textWidth = textObj.width
    const textHeight = textObj.height
    const bubbleWidth = textWidth + padding * 2
    const bubbleHeight = textHeight + padding * 2

    // White rounded bubble
    bubble.fillStyle(0xffffff, 0.95)
    bubble.fillRoundedRect(-bubbleWidth / 2, -bubbleHeight / 2, bubbleWidth, bubbleHeight, 8)
    bubble.lineStyle(2, 0x000000, 0.3)
    bubble.strokeRoundedRect(-bubbleWidth / 2, -bubbleHeight / 2, bubbleWidth, bubbleHeight, 8)

    // Small tail
    bubble.fillStyle(0xffffff, 0.95)
    bubble.fillTriangle(
      -8, bubbleHeight / 2,
      8, bubbleHeight / 2,
      0, bubbleHeight / 2 + 10
    )

    container.add([bubble, textObj])
    this.bubbles.set(agentId, container)

    // Bounce in animation
    container.setScale(0)
    this.scene.tweens.add({
      targets: container,
      scale: { from: 0, to: 1.05 },
      duration: 200,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: container,
          scale: 1,
          duration: 100
        })
      }
    })

    // Auto hide after duration
    this.scene.time.delayedCall(duration, () => {
      this.hide(agentId)
    })
  }

  /**
   * Hide bubble for specific agent
   */
  hide(agentId: string): void {
    const bubble = this.bubbles.get(agentId)
    if (bubble) {
      this.scene.tweens.add({
        targets: bubble,
        alpha: 0,
        scale: 0.8,
        duration: 200,
        onComplete: () => {
          bubble.destroy()
        }
      })
      this.bubbles.delete(agentId)
    }
  }

  /**
   * Clean up all bubbles
   */
  destroy(): void {
    this.bubbles.forEach(bubble => bubble.destroy())
    this.bubbles.clear()
  }
}

/**
 * Global Event Notification System
 */
export class NotificationSystem {
  private scene: Phaser.Scene
  private container?: Phaser.GameObjects.Container
  private textObj?: Phaser.GameObjects.Text
  private queue: string[] = []
  private isShowing = false

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.createNotificationBar()
  }

  /**
   * Create the notification bar UI
   */
  private createNotificationBar(): void {
    const camera = this.scene.cameras.main
    this.container = this.scene.add.container(camera.width / 2, camera.height - 40)
    this.container.setScrollFactor(0)
    this.container.setDepth(1000)
    this.container.setAlpha(0)

    // Background
    const bg = this.scene.add.graphics()
    bg.fillStyle(0x1E3A8A, 0.9)
    bg.fillRoundedRect(-300, -20, 600, 40, 8)
    bg.lineStyle(2, 0xffffff, 0.2)
    bg.strokeRoundedRect(-300, -20, 600, 40, 8)

    // Text
    this.textObj = this.scene.add.text(0, 0, '', {
      fontSize: '16px',
      color: '#ffffff',
      align: 'center',
      fontFamily: 'Arial'
    }).setOrigin(0.5)

    this.container.add([bg, this.textObj])
  }

  /**
   * Show a notification message
   */
  show(message: string): void {
    this.queue.push(message)
    if (!this.isShowing) {
      this.showNext()
    }
  }

  /**
   * Show next notification in queue
   */
  private showNext(): void {
    if (this.queue.length === 0) {
      this.isShowing = false
      return
    }

    this.isShowing = true
    const message = this.queue.shift()!
    
    if (this.textObj && this.container) {
      this.textObj.setText(message)

      // Slide in from bottom
      this.container.setY(this.scene.cameras.main.height + 40)
      this.container.setAlpha(1)

      this.scene.tweens.add({
        targets: this.container,
        y: this.scene.cameras.main.height - 40,
        duration: 400,
        ease: 'Back.easeOut',
        onComplete: () => {
          // Stay for 3 seconds
          this.scene.time.delayedCall(3000, () => {
            this.hideAndShowNext()
          })
        }
      })
    }
  }

  /**
   * Hide current notification and show next
   */
  private hideAndShowNext(): void {
    if (this.container) {
      this.scene.tweens.add({
        targets: this.container,
        y: this.scene.cameras.main.height + 40,
        alpha: 0,
        duration: 300,
        ease: 'Sine.easeIn',
        onComplete: () => {
          this.showNext()
        }
      })
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.container) {
      this.container.destroy()
    }
    this.queue = []
  }
}

/**
 * Click Ripple Effect
 */
export function createRippleEffect(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color = 0x1E3A8A
): void {
  const circle = scene.add.circle(x, y, 5, color, 0.6)
  
  scene.tweens.add({
    targets: circle,
    radius: 40,
    alpha: 0,
    duration: 500,
    ease: 'Sine.easeOut',
    onComplete: () => {
      circle.destroy()
    }
  })
}

/**
 * Add bounce animation to a game object
 */
export function bounceAnimation(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject
): void {
  scene.tweens.add({
    targets: target,
    scaleX: { from: 1, to: 1.05 },
    scaleY: { from: 1, to: 1.05 },
    duration: 150,
    ease: 'Back.easeOut',
    yoyo: true
  })
}
