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

    // 載入小提示
    const tips = [
      '與 8 位 AI Agent 互動，了解他們的工作',
      '點擊 Agent 開始對話',
      '使用右鍵拖曳平移畫面',
      '使用滾輪縮放畫面',
      '手機上可用雙指縮放',
      '探索辦公室的休息區和會議室',
      'Persona 5 風格的對話系統'
    ]
    const randomTip = Phaser.Utils.Array.GetRandom(tips)
    const tipText = this.make.text({
      x: width / 2,
      y: height / 2 + 60,
      text: `💡 ${randomTip}`,
      style: {
        font: '14px monospace',
        color: '#cccccc',
        wordWrap: { width: width - 100 }
      }
    })
    tipText.setOrigin(0.5, 0.5)

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
      tipText.destroy()
    })

    // 載入角色立繪（WebP 格式優化）
    const agentIds = ['travis', 'researcher', 'inspector', 'secretary', 'coder', 'writer', 'designer', 'analyst']
    for (const id of agentIds) {
      // 優先使用 WebP，fallback 到 JPG
      this.load.image(`${id}-male`, `agents/${id}-male.webp`)
      this.load.image(`${id}-female`, `agents/${id}-female.webp`)
      this.load.image(`${id}-hq`, `agents/${id}.webp`)
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
    this.load.audio('click', 'audio/click.wav')
    this.load.audio('dialogue-open', 'audio/dialogue-open.wav')
    this.load.audio('typewriter', 'audio/typewriter.wav')
  }

  create() {
    console.log('[BootScene] create() - all assets loaded, starting OfficeScene')
    this.scene.start('OfficeScene')
  }
}
