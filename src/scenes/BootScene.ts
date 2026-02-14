import Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  preload() {
    // 建立載入畫面
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    const progressBar = this.add.graphics()
    const progressBox = this.add.graphics()
    progressBox.fillStyle(0x222222, 0.8)
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50)

    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px monospace',
        color: '#ffffff'
      }
    })
    loadingText.setOrigin(0.5, 0.5)

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: '0%',
      style: {
        font: '18px monospace',
        color: '#ffffff'
      }
    })
    percentText.setOrigin(0.5, 0.5)

    // 載入事件
    this.load.on('progress', (value: number) => {
      percentText.setText(Math.floor(value * 100) + '%')
      progressBar.clear()
      progressBar.fillStyle(0x1E3A8A, 1)
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30)
    })

    this.load.on('complete', () => {
      progressBar.destroy()
      progressBox.destroy()
      loadingText.destroy()
      percentText.destroy()
    })

    // 載入角色立繪
    const agentIds = ['travis', 'researcher', 'inspector', 'secretary', 'coder', 'writer', 'designer', 'analyst']
    for (const id of agentIds) {
      this.load.image(`${id}-male`, `agents/${id}-male.jpg`)
      this.load.image(`${id}-female`, `agents/${id}-female.jpg`)
    }
  }

  create() {
    // 載入完成，啟動主場景
    this.scene.start('OfficeScene')
  }
}
