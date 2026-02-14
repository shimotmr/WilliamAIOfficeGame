import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { OfficeScene } from './scenes/OfficeScene'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#1a1a1a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, OfficeScene],
  physics: {}
}

new Phaser.Game(config)
