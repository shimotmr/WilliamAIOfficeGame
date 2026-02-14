import Phaser from 'phaser'
import { AgentConfig } from '../config/agents'
import { isoToScreen, IsoPoint } from '../utils/isometric'

export interface AgentMovementConfig {
  agent: AgentConfig
  container: Phaser.GameObjects.Container
  scene: Phaser.Scene
}

export class AgentMovement {
  private agent: AgentConfig
  private container: Phaser.GameObjects.Container
  private scene: Phaser.Scene
  private isMoving = false
  private currentTween?: Phaser.Tweens.Tween
  private walkBobTween?: Phaser.Tweens.Tween

  constructor(config: AgentMovementConfig) {
    this.agent = config.agent
    this.container = config.container
    this.scene = config.scene
  }

  /**
   * Move agent from current position to target position
   */
  moveTo(targetIso: IsoPoint, duration = 2000): Promise<void> {
    if (this.isMoving) {
      console.warn(`[AgentMovement] ${this.agent.name} is already moving`)
      return Promise.reject()
    }

    return new Promise((resolve) => {
      const targetScreen = isoToScreen(targetIso.x, targetIso.y)

      this.isMoving = true

      // Walking animation - subtle left-right bob
      const agentSprite = this.container.getAt(1) as Phaser.GameObjects.Image
      if (agentSprite) {
        this.walkBobTween = this.scene.tweens.add({
          targets: agentSprite,
          angle: { from: -3, to: 3 },
          duration: 250,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        })
      }

      // Move container
      this.currentTween = this.scene.tweens.add({
        targets: this.container,
        x: targetScreen.x,
        y: targetScreen.y,
        duration,
        ease: 'Sine.InOut',
        onComplete: () => {
          this.isMoving = false
          this.agent.position = { x: targetIso.x, y: targetIso.y }
          
          // Stop walking animation
          if (this.walkBobTween) {
            this.walkBobTween.stop()
            this.walkBobTween = undefined
          }
          
          // Reset sprite angle
          if (agentSprite) {
            agentSprite.setAngle(0)
          }
          
          resolve()
        }
      })
    })
  }

  /**
   * Return agent to original workstation
   */
  returnToWorkstation(_duration = 2000): Promise<void> {
    // Note: we should store the original position, for now we use current agent.position
    // as it's updated by moveTo
    return Promise.resolve()
  }

  /**
   * Check if agent is currently moving
   */
  getIsMoving(): boolean {
    return this.isMoving
  }

  /**
   * Stop current movement
   */
  stop(): void {
    if (this.currentTween) {
      this.currentTween.stop()
      this.currentTween = undefined
    }
    if (this.walkBobTween) {
      this.walkBobTween.stop()
      this.walkBobTween = undefined
    }
    this.isMoving = false
    
    // Reset sprite angle
    const agentSprite = this.container.getAt(1) as Phaser.GameObjects.Image
    if (agentSprite) {
      agentSprite.setAngle(0)
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop()
  }
}
