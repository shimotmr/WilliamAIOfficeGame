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
      this.load.image(`${id}-hq`, `agents/${id}.jpg`)
    }

    // 載入所有 Kenney furniture 素材
    const furnitureList = [
      'desk_SE', 'deskCorner_SE', 'chairDesk_SE', 'chair_SE',
      'chairModernCushion_SE', 'chairRounded_SE', 'computerScreen_SE',
      'computerKeyboard_SE', 'computerMouse_SE', 'bookcaseOpen_SE',
      'bookcaseClosedWide_SE', 'bookcaseClosed_SE', 'books_SE',
      'lampRoundTable_SE', 'lampSquareFloor_SE', 'lampRoundFloor_SE',
      'plantSmall1_SE', 'plantSmall2_SE', 'plantSmall3_SE', 'pottedPlant_SE',
      'tableCoffee_SE', 'tableCoffeeSquare_SE', 'tableRound_SE', 'table_SE',
      'loungeChair_SE', 'loungeSofa_SE', 'loungeSofaCorner_SE',
      'kitchenCoffeeMachine_SE', 'kitchenCabinet_SE',
      'cabinetTelevision_SE', 'cabinetTelevisionDoors_SE',
      'sideTable_SE', 'sideTableDrawers_SE'
    ]
    furnitureList.forEach(name => {
      this.load.image(name, `furniture/${name}.png`)
    })

    // 載入音效
    this.load.audio('bgm', 'audio/bgm.mp3')
    this.load.audio('click', 'audio/click.mp3')
    this.load.audio('dialogue-open', 'audio/dialogue-open.mp3')
    this.load.audio('typewriter', 'audio/typewriter.mp3')
  }

  create() {
    // 載入完成，黑屏 fade-out 後轉場到 OfficeScene
    this.cameras.main.fadeOut(1000, 0, 0, 0)
    this.time.delayedCall(1000, () => {
      this.scene.start('OfficeScene')
    })
  }
}
