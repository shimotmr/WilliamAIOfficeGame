import Phaser from 'phaser'

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene')
  }

  create() {
    const { width, height } = this.cameras.main

    // 黑色背景漸入
    this.cameras.main.setBackgroundColor('#000000')
    this.cameras.main.fadeIn(1000, 0, 0, 0)

    // Persona 5 風格標題：紅色大字，傾斜，陰影
    const title = this.add.text(width / 2, height / 2 - 80, 'William AI Office', {
      fontSize: '72px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold italic',
      color: '#DD0000',
      stroke: '#000000',
      strokeThickness: 8,
      shadow: {
        offsetX: 6,
        offsetY: 6,
        color: '#660000',
        blur: 12,
        fill: true
      }
    })
    title.setOrigin(0.5)
    title.setAngle(-5)

    // 副標：白色小字
    const subtitle = this.add.text(width / 2, height / 2 + 20, '8 Agents. 1 Mission.', {
      fontSize: '28px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'italic',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 6,
        fill: true
      }
    })
    subtitle.setOrigin(0.5)

    // "Click to Start" 閃爍提示
    const startText = this.add.text(width / 2, height / 2 + 100, 'Click to Start', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        fill: true
      }
    })
    startText.setOrigin(0.5)

    // 閃爍動畫
    this.tweens.add({
      targets: startText,
      alpha: { from: 1, to: 0.2 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // 點擊任意處開始（直接轉場，fade 由 OfficeScene 處理）
    const startGame = () => {
      this.scene.start('BootScene')
    }
    this.input.once('pointerdown', startGame)
    this.input.keyboard?.once('keydown-SPACE', startGame)
    this.input.keyboard?.once('keydown-ENTER', startGame)
  }
}
