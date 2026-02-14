import Phaser from 'phaser'

/**
 * Phase 6: Themed workstation decorations with unique visual atmosphere.
 * Each workstation has: ambient light, Kenney furniture, Graphics API effects, text, tweens.
 * Depth order: floor(0) → ambient light(1) → furniture(10-50) → characters(100) → UI(2000+)
 */

const SCALE = 0.55
const DEPTH_AMBIENT = 1
const DEPTH_FURNITURE = 10
const DEPTH_DECOR = 15
const DEPTH_TEXT = 20

interface FurnitureItem {
  key: string
  offsetX: number
  offsetY: number
  scale?: number
  depth?: number
}

function placeFurniture(scene: Phaser.Scene, sx: number, sy: number, items: FurnitureItem[]): Phaser.GameObjects.Image[] {
  return items.map(item => {
    const img = scene.add.image(sx + item.offsetX, sy + item.offsetY, item.key)
    img.setScale(item.scale ?? SCALE)
    img.setDepth(item.depth ?? DEPTH_FURNITURE)
    return img
  })
}

/** Draw an elliptical ambient light glow */
function drawAmbientLight(scene: Phaser.Scene, sx: number, sy: number, color: number, alpha = 0.05, rx = 150, ry = 100) {
  const g = scene.add.graphics().setDepth(DEPTH_AMBIENT)
  g.fillStyle(color, alpha)
  g.fillEllipse(sx, sy, rx * 2, ry * 2)
  return g
}

// ═══════════════════════════════════════════════════════════
// 1. TRAVIS - Command Center (cold blue)
// ═══════════════════════════════════════════════════════════
export function drawTravisDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  // Ambient light - cold blue
  drawAmbientLight(scene, sx, sy, 0x1E3AFF, 0.05, 160, 110)

  // Kenney furniture
  placeFurniture(scene, sx, sy, [
    { key: 'deskCorner_SE', offsetX: 0, offsetY: 20 },
    { key: 'computerScreen_SE', offsetX: -20, offsetY: -5, scale: 0.45 },
    { key: 'computerScreen_SE', offsetX: 15, offsetY: -8, scale: 0.45 },
    { key: 'chairDesk_SE', offsetX: 5, offsetY: 40 },
  ])

  // 3 large screen wall (blue glowing rectangles)
  const screenColors = [0x1a3a6a, 0x1a3a6a, 0x1a3a6a]
  const screenOffsets = [{ x: -55, y: -45 }, { x: -20, y: -55 }, { x: 15, y: -45 }]
  screenOffsets.forEach((off, i) => {
    const g = scene.add.graphics().setDepth(DEPTH_DECOR)
    g.fillStyle(screenColors[i], 0.8)
    g.fillRect(sx + off.x, sy + off.y, 30, 20)
    // glow border
    g.lineStyle(1, 0x4488FF, 0.8)
    g.strokeRect(sx + off.x, sy + off.y, 30, 20)
  })

  // Status text on middle screen
  const statusText = scene.add.text(sx - 18, sy - 52, 'SYSTEM STATUS:\nONLINE', {
    fontSize: '5px', fontFamily: 'monospace', color: '#44AAFF', align: 'center'
  }).setDepth(DEPTH_TEXT)
  scene.tweens.add({ targets: statusText, alpha: 0.4, duration: 2000, yoyo: true, repeat: -1 })

  // Holographic projection - semi-transparent blue circle with rotating dots
  const holoG = scene.add.graphics().setDepth(DEPTH_DECOR)
  holoG.fillStyle(0x2266FF, 0.12)
  holoG.fillCircle(sx, sy - 20, 18)
  holoG.lineStyle(1, 0x4488FF, 0.3)
  holoG.strokeCircle(sx, sy - 20, 18)

  // Rotating light dots around hologram
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 / 6) * i
    const dot = scene.add.circle(
      sx + Math.cos(angle) * 15, sy - 20 + Math.sin(angle) * 10,
      1.5, 0x44BBFF, 0.7
    ).setDepth(DEPTH_DECOR)
    scene.tweens.add({
      targets: dot,
      x: { value: `+=${Math.cos(angle + Math.PI) * 30}`, duration: 4000 },
      y: { value: `+=${Math.sin(angle + Math.PI) * 20}`, duration: 4000 },
      alpha: { from: 0.7, to: 0.1 },
      yoyo: true, repeat: -1, delay: i * 600
    })
  }

  return scene.add.graphics()
}

// ═══════════════════════════════════════════════════════════
// 2. SECRETARY - Reception (warm tones)
// ═══════════════════════════════════════════════════════════
export function drawSecretaryDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  // Ambient light - warm yellow
  drawAmbientLight(scene, sx, sy, 0xFFAA33, 0.04, 150, 100)

  // Kenney furniture
  placeFurniture(scene, sx, sy, [
    { key: 'deskCorner_SE', offsetX: 0, offsetY: 20 },
    { key: 'chairModernCushion_SE', offsetX: 5, offsetY: 40 },
    { key: 'sideTable_SE', offsetX: 45, offsetY: 15 },
    { key: 'kitchenCoffeeMachine_SE', offsetX: 50, offsetY: -5, scale: 0.45 },
    { key: 'plantSmall1_SE', offsetX: -50, offsetY: 5, scale: 0.5 },
    { key: 'books_SE', offsetX: 30, offsetY: 5, scale: 0.45 },
  ])

  // Digital calendar on wall
  const calG = scene.add.graphics().setDepth(DEPTH_DECOR)
  calG.fillStyle(0xFFFFFF, 0.85)
  calG.fillRect(sx - 55, sy - 50, 35, 28)
  calG.lineStyle(1, 0xCCCCCC, 1)
  calG.strokeRect(sx - 55, sy - 50, 35, 28)
  // Colorful schedule blocks
  const scheduleColors = [0xFF6B6B, 0x4ECDC4, 0xFFE66D, 0x95E1D3, 0xFF8B94, 0xA8E6CF]
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      calG.fillStyle(scheduleColors[(row * 4 + col) % scheduleColors.length], 0.8)
      calG.fillRect(sx - 53 + col * 8, sy - 47 + row * 8, 6, 5)
    }
  }

  // Mail inbox with green blinking indicator
  const mailG = scene.add.graphics().setDepth(DEPTH_DECOR)
  mailG.fillStyle(0x888888, 0.6)
  mailG.fillRect(sx + 35, sy - 30, 14, 10)
  const mailLight = scene.add.circle(sx + 48, sy - 28, 2, 0x00FF00, 0.8).setDepth(DEPTH_DECOR)
  scene.tweens.add({ targets: mailLight, alpha: 0.1, duration: 800, yoyo: true, repeat: -1 })

  // "NEW MAIL" text
  scene.add.text(sx + 33, sy - 18, '📬 NEW', {
    fontSize: '4px', fontFamily: 'monospace', color: '#00CC00'
  }).setDepth(DEPTH_TEXT)

  return scene.add.graphics()
}

// ═══════════════════════════════════════════════════════════
// 3. INSPECTOR - QC Room (red warning + B&W)
// ═══════════════════════════════════════════════════════════
export function drawInspectorDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  // Ambient light - red warning
  drawAmbientLight(scene, sx, sy, 0xFF2222, 0.04, 150, 100)

  // Kenney furniture
  placeFurniture(scene, sx, sy, [
    { key: 'desk_SE', offsetX: 0, offsetY: 20 },
    { key: 'computerScreen_SE', offsetX: -5, offsetY: -5, scale: 0.45 },
    { key: 'chairDesk_SE', offsetX: 5, offsetY: 40 },
    { key: 'lampSquareFloor_SE', offsetX: -45, offsetY: -10 },
  ])

  // Code scanning screen (dark bg + green scrolling text)
  const scanG = scene.add.graphics().setDepth(DEPTH_DECOR)
  scanG.fillStyle(0x0a0a0a, 0.9)
  scanG.fillRect(sx - 50, sy - 50, 40, 30)
  scanG.lineStyle(1, 0x00FF00, 0.5)
  scanG.strokeRect(sx - 50, sy - 50, 40, 30)

  const scanText = scene.add.text(sx - 48, sy - 46, '> scanning...\n> lint OK\n> tests: 42/42', {
    fontSize: '4px', fontFamily: 'monospace', color: '#00FF00'
  }).setDepth(DEPTH_TEXT)
  scene.tweens.add({ targets: scanText, y: sy - 52, duration: 3000, yoyo: true, repeat: -1 })

  // Warning alarm light (blinking red circle)
  const alarm = scene.add.circle(sx + 40, sy - 45, 5, 0xFF0000, 0.8).setDepth(DEPTH_DECOR)
  scene.tweens.add({ targets: alarm, alpha: 0.1, duration: 500, yoyo: true, repeat: -1 })

  // Wall checklist
  const checkG = scene.add.graphics().setDepth(DEPTH_DECOR)
  checkG.fillStyle(0xFFFFFF, 0.85)
  checkG.fillRect(sx + 25, sy - 45, 25, 30)
  scene.add.text(sx + 27, sy - 43, '✅ Lint\n✅ Tests\n✅ Types\n✅ Build', {
    fontSize: '4px', fontFamily: 'monospace', color: '#006600'
  }).setDepth(DEPTH_TEXT)

  // QA stamp
  const stampG = scene.add.graphics().setDepth(DEPTH_DECOR)
  stampG.lineStyle(2, 0xCC0000, 0.8)
  stampG.strokeCircle(sx + 38, sy + 5, 10)
  scene.add.text(sx + 30, sy + 1, 'QA\nPASS', {
    fontSize: '4px', fontFamily: 'monospace', fontStyle: 'bold', color: '#CC0000', align: 'center'
  }).setDepth(DEPTH_TEXT)

  return scene.add.graphics()
}

// ═══════════════════════════════════════════════════════════
// 4. DESIGNER - Creative Studio (colorful)
// ═══════════════════════════════════════════════════════════
export function drawDesignerDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  // Ambient light - rainbow shifting
  const ambientG = drawAmbientLight(scene, sx, sy, 0x8B5CF6, 0.04, 150, 100)
  scene.tweens.addCounter({
    from: 0, to: 360, duration: 10000, repeat: -1,
    onUpdate: (tween) => {
      const hue = tween.getValue() ?? 0
      const color = Phaser.Display.Color.HSLToColor(hue / 360, 0.7, 0.5)
      ambientG.clear()
      ambientG.fillStyle(color.color, 0.04)
      ambientG.fillEllipse(sx, sy, 300, 200)
    }
  })

  // Kenney furniture
  placeFurniture(scene, sx, sy, [
    { key: 'desk_SE', offsetX: 0, offsetY: 20 },
    { key: 'computerScreen_SE', offsetX: -5, offsetY: -5, scale: 0.45 },
    { key: 'chairDesk_SE', offsetX: 5, offsetY: 40 },
    { key: 'plantSmall2_SE', offsetX: 50, offsetY: 10, scale: 0.5 },
  ])

  // Floating color palette (rainbow squares with float animation)
  const rainbow = [0xFF0000, 0xFF8800, 0xFFFF00, 0x00FF00, 0x0088FF, 0x8800FF, 0xFF00FF]
  rainbow.forEach((c, i) => {
    const block = scene.add.graphics().setDepth(DEPTH_DECOR)
    block.fillStyle(c, 0.7)
    block.fillRect(sx - 55 + i * 8, sy - 48, 6, 6)
    scene.tweens.add({
      targets: block, y: { value: '-=3', duration: 1500 },
      yoyo: true, repeat: -1, delay: i * 200, ease: 'Sine.easeInOut'
    })
  })

  // Moodboard (frame with mini picture frames)
  const boardG = scene.add.graphics().setDepth(DEPTH_DECOR)
  boardG.lineStyle(1, 0x888888, 0.8)
  boardG.strokeRect(sx - 55, sy - 38, 45, 25)
  const miniColors = [0xFFCCCC, 0xCCFFCC, 0xCCCCFF, 0xFFFFCC, 0xFFCCFF, 0xCCFFFF]
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      boardG.fillStyle(miniColors[r * 3 + c], 0.6)
      boardG.fillRect(sx - 53 + c * 14, sy - 36 + r * 11, 10, 8)
      boardG.lineStyle(0.5, 0x666666, 0.5)
      boardG.strokeRect(sx - 53 + c * 14, sy - 36 + r * 11, 10, 8)
    }
  }

  // Track light (white bar with downward glow)
  const trackG = scene.add.graphics().setDepth(DEPTH_DECOR)
  trackG.fillStyle(0xFFFFFF, 0.6)
  trackG.fillRect(sx - 30, sy - 55, 60, 3)
  trackG.fillStyle(0xFFFFFF, 0.08)
  trackG.fillTriangle(sx - 25, sy - 52, sx + 25, sy - 52, sx, sy - 30)

  return scene.add.graphics()
}

// ═══════════════════════════════════════════════════════════
// 5. WRITER - Writing Room (literary, warm, cozy)
// ═══════════════════════════════════════════════════════════
export function drawWriterDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  // Ambient light - warm yellow
  drawAmbientLight(scene, sx, sy, 0xFFAA33, 0.05, 150, 100)

  // Kenney furniture
  placeFurniture(scene, sx, sy, [
    { key: 'desk_SE', offsetX: 0, offsetY: 20 },
    { key: 'chairRounded_SE', offsetX: 5, offsetY: 40 },
    { key: 'books_SE', offsetX: 30, offsetY: 5, scale: 0.45 },
    { key: 'lampRoundTable_SE', offsetX: -25, offsetY: -5, scale: 0.5 },
    { key: 'bookcaseOpen_SE', offsetX: -55, offsetY: -15 },
    { key: 'bookcaseClosed_SE', offsetX: -35, offsetY: -20 },
  ])

  // Lamp glow
  const glowG = scene.add.graphics().setDepth(DEPTH_DECOR - 1)
  glowG.fillStyle(0xFFDD44, 0.12)
  glowG.fillCircle(sx - 25, sy - 5, 20)

  // Vintage typewriter effect
  const typeG = scene.add.graphics().setDepth(DEPTH_DECOR)
  typeG.fillStyle(0x222222, 0.8)
  typeG.fillRect(sx - 10, sy + 5, 20, 12)
  typeG.fillStyle(0x444444, 0.8)
  typeG.fillRect(sx - 8, sy + 7, 16, 3)

  const clickText = scene.add.text(sx - 8, sy + 2, 'click click', {
    fontSize: '3px', fontFamily: 'monospace', color: '#888888'
  }).setDepth(DEPTH_TEXT).setAlpha(0)
  scene.tweens.add({
    targets: clickText, alpha: { from: 0, to: 0.8 },
    duration: 600, yoyo: true, repeat: -1, repeatDelay: 2000
  })

  // Scattered inspiration notebooks
  const noteG = scene.add.graphics().setDepth(DEPTH_DECOR)
  const notePositions = [{ x: 35, y: -20 }, { x: 40, y: -10 }, { x: 48, y: -16 }]
  notePositions.forEach(p => {
    noteG.fillStyle(0xFFFFF0, 0.8)
    noteG.fillRect(sx + p.x, sy + p.y, 8, 10)
    noteG.lineStyle(0.5, 0xCCCCCC, 0.5)
    noteG.strokeRect(sx + p.x, sy + p.y, 8, 10)
  })

  // Coffee cup with steam
  const cupG = scene.add.graphics().setDepth(DEPTH_DECOR)
  cupG.fillStyle(0x8B4513, 0.8)
  cupG.fillRect(sx + 15, sy + 10, 6, 7)
  cupG.fillStyle(0x5C3317, 0.9)
  cupG.fillEllipse(sx + 18, sy + 10, 6, 2)
  // Steam particles
  for (let i = 0; i < 3; i++) {
    const steam = scene.add.circle(sx + 17 + i * 2, sy + 7, 1, 0xFFFFFF, 0.3).setDepth(DEPTH_DECOR)
    scene.tweens.add({
      targets: steam,
      y: sy - 2, alpha: 0, duration: 2000,
      repeat: -1, delay: i * 700,
      onRepeat: () => { steam.setPosition(sx + 17 + i * 2, sy + 7); steam.setAlpha(0.3) }
    })
  }

  return scene.add.graphics()
}

// ═══════════════════════════════════════════════════════════
// 6. RESEARCHER - Data Analysis Lab (teal, academic)
// ═══════════════════════════════════════════════════════════
export function drawResearcherDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  // Ambient light - teal
  drawAmbientLight(scene, sx, sy, 0x0E7490, 0.05, 150, 100)

  // Kenney furniture
  placeFurniture(scene, sx, sy, [
    { key: 'desk_SE', offsetX: 0, offsetY: 20 },
    { key: 'computerScreen_SE', offsetX: -15, offsetY: -5, scale: 0.45 },
    { key: 'computerScreen_SE', offsetX: 10, offsetY: -8, scale: 0.45 },
    { key: 'chairDesk_SE', offsetX: 5, offsetY: 40 },
    { key: 'bookcaseClosedWide_SE', offsetX: -55, offsetY: -10 },
    { key: 'books_SE', offsetX: 35, offsetY: 5, scale: 0.45 },
  ])

  // Data visualization wall (bar chart + line chart)
  const dataG = scene.add.graphics().setDepth(DEPTH_DECOR)
  // Background
  dataG.fillStyle(0x0a2a2a, 0.85)
  dataG.fillRect(sx - 55, sy - 55, 50, 35)
  dataG.lineStyle(1, 0x0E7490, 0.6)
  dataG.strokeRect(sx - 55, sy - 55, 50, 35)
  // Bar chart
  const barData = [12, 20, 15, 25, 18, 22, 28]
  barData.forEach((h, i) => {
    dataG.fillStyle(i % 2 === 0 ? 0x0E7490 : 0x06B6D4, 0.8)
    dataG.fillRect(sx - 52 + i * 6, sy - 22 - h, 4, h)
  })
  // Line chart overlay
  dataG.lineStyle(1, 0x00FFAA, 0.6)
  dataG.beginPath()
  barData.forEach((h, i) => {
    const px = sx - 50 + i * 6
    const py = sy - 22 - h + 2
    if (i === 0) dataG.moveTo(px, py)
    else dataG.lineTo(px, py)
  })
  dataG.strokePath()

  // Lab notebook
  const noteG = scene.add.graphics().setDepth(DEPTH_DECOR)
  noteG.fillStyle(0xFFFFF0, 0.8)
  noteG.fillRect(sx + 25, sy - 40, 15, 18)
  noteG.lineStyle(0.5, 0xCCCCCC, 0.5)
  noteG.strokeRect(sx + 25, sy - 40, 15, 18)
  scene.add.text(sx + 27, sy - 38, 'DATA\nlog#42\np<0.05', {
    fontSize: '3px', fontFamily: 'monospace', color: '#0E7490'
  }).setDepth(DEPTH_TEXT)

  return scene.add.graphics()
}

// ═══════════════════════════════════════════════════════════
// 7. CODER - Engineering Lab (geek, neon, futuristic)
// ═══════════════════════════════════════════════════════════
export function drawCoderDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  // Ambient light - green neon
  drawAmbientLight(scene, sx, sy, 0x10B981, 0.05, 160, 110)

  // Kenney furniture
  placeFurniture(scene, sx, sy, [
    { key: 'desk_SE', offsetX: 0, offsetY: 20 },
    { key: 'computerScreen_SE', offsetX: -22, offsetY: -8, scale: 0.45 },
    { key: 'computerScreen_SE', offsetX: -2, offsetY: -10, scale: 0.45 },
    { key: 'computerScreen_SE', offsetX: 18, offsetY: -8, scale: 0.45 },
    { key: 'computerKeyboard_SE', offsetX: -2, offsetY: 10, scale: 0.4 },
    { key: 'chairDesk_SE', offsetX: 5, offsetY: 40 },
  ])

  // Server rack (dark gray + blinking LEDs)
  const rackG = scene.add.graphics().setDepth(DEPTH_DECOR)
  rackG.fillStyle(0x2a2a2a, 0.9)
  rackG.fillRect(sx + 40, sy - 40, 18, 50)
  rackG.lineStyle(1, 0x444444, 0.8)
  rackG.strokeRect(sx + 40, sy - 40, 18, 50)
  // LED indicators
  for (let i = 0; i < 6; i++) {
    const led = scene.add.circle(sx + 45, sy - 35 + i * 8, 1.5, i % 2 === 0 ? 0x00FF00 : 0xFF8800, 0.8)
      .setDepth(DEPTH_DECOR)
    scene.tweens.add({
      targets: led, alpha: { from: 0.8, to: 0.2 },
      duration: 400 + i * 200, yoyo: true, repeat: -1, delay: i * 150
    })
    const led2 = scene.add.circle(sx + 52, sy - 35 + i * 8, 1.5, i % 2 === 0 ? 0xFF8800 : 0x00FF00, 0.6)
      .setDepth(DEPTH_DECOR)
    scene.tweens.add({
      targets: led2, alpha: { from: 0.6, to: 0.1 },
      duration: 600 + i * 100, yoyo: true, repeat: -1, delay: i * 250
    })
  }

  // Cables from server to desk
  const cableG = scene.add.graphics().setDepth(DEPTH_DECOR - 1)
  cableG.lineStyle(1.5, 0x666666, 0.5)
  cableG.beginPath()
  cableG.moveTo(sx + 40, sy - 10)
  cableG.lineTo(sx + 30, sy + 5)
  cableG.lineTo(sx + 18, sy + 12)
  cableG.strokePath()
  cableG.beginPath()
  cableG.moveTo(sx + 40, sy - 20)
  cableG.lineTo(sx + 28, sy - 5)
  cableG.lineTo(sx + 15, sy + 5)
  cableG.strokePath()

  // RGB keyboard glow bar
  const kbGlow = scene.add.graphics().setDepth(DEPTH_DECOR)
  scene.tweens.addCounter({
    from: 0, to: 360, duration: 5000, repeat: -1,
    onUpdate: (tween) => {
      const kbHue = tween.getValue() ?? 0
      const c = Phaser.Display.Color.HSLToColor(kbHue / 360, 1, 0.5)
      kbGlow.clear()
      kbGlow.fillStyle(c.color, 0.4)
      kbGlow.fillRect(sx - 15, sy + 14, 26, 2)
    }
  })

  // Pizza box
  const pizzaG = scene.add.graphics().setDepth(DEPTH_DECOR)
  pizzaG.fillStyle(0x8B6914, 0.8)
  pizzaG.fillRect(sx - 50, sy + 10, 18, 12)
  pizzaG.lineStyle(0.5, 0x6B4914, 0.8)
  pizzaG.strokeRect(sx - 50, sy + 10, 18, 12)
  scene.add.text(sx - 47, sy + 13, 'PIZZA', {
    fontSize: '5px', fontFamily: 'monospace', fontStyle: 'bold', color: '#CC3333'
  }).setDepth(DEPTH_TEXT)

  return scene.add.graphics()
}

// ═══════════════════════════════════════════════════════════
// 8. ANALYST - Trading Room (Wall Street, red/green)
// ═══════════════════════════════════════════════════════════
export function drawAnalystDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  // Ambient light - gold
  drawAmbientLight(scene, sx, sy, 0xFFAA00, 0.04, 160, 110)

  // Kenney furniture
  placeFurniture(scene, sx, sy, [
    { key: 'deskCorner_SE', offsetX: 0, offsetY: 20 },
    { key: 'computerScreen_SE', offsetX: -25, offsetY: -10, scale: 0.45 },
    { key: 'computerScreen_SE', offsetX: -5, offsetY: -8, scale: 0.45 },
    { key: 'computerScreen_SE', offsetX: 15, offsetY: -5, scale: 0.45 },
    { key: 'chairDesk_SE', offsetX: 5, offsetY: 40 },
    { key: 'sideTableDrawers_SE', offsetX: 50, offsetY: 5 },
  ])

  // K-line chart wall (4 screens with candlestick patterns)
  const chartOffsets = [{ x: -60, y: -55 }, { x: -30, y: -58 }, { x: 0, y: -55 }, { x: 30, y: -52 }]
  chartOffsets.forEach((off) => {
    const cg = scene.add.graphics().setDepth(DEPTH_DECOR)
    cg.fillStyle(0x0a0a0a, 0.9)
    cg.fillRect(sx + off.x, sy + off.y, 25, 18)
    cg.lineStyle(0.5, 0x333333, 0.8)
    cg.strokeRect(sx + off.x, sy + off.y, 25, 18)
    // Candlestick bars
    for (let i = 0; i < 8; i++) {
      const isGreen = Math.random() > 0.45
      const h = 3 + Math.random() * 8
      const bx = sx + off.x + 2 + i * 3
      const by = sy + off.y + 15 - h
      cg.fillStyle(isGreen ? 0x00CC00 : 0xCC0000, 0.9)
      cg.fillRect(bx, by, 2, h)
      // Wick
      cg.lineStyle(0.5, isGreen ? 0x00CC00 : 0xCC0000, 0.6)
      cg.lineBetween(bx + 1, by - 1.5, bx + 1, by + h + 1.5)
    }
  })

  // Ticker display
  scene.add.text(sx - 10, sy - 35, '6215.TW', {
    fontSize: '7px', fontFamily: 'monospace', fontStyle: 'bold', color: '#FFD700'
  }).setDepth(DEPTH_TEXT)

  // Scrolling ticker tape
  const tickerText = scene.add.text(sx + 80, sy + 30, 'TSMC +2.3% | NVDA +1.8% | BTC $95,000 | AAPL -0.5% | 6215.TW +3.2%', {
    fontSize: '5px', fontFamily: 'monospace', color: '#00FF00'
  }).setDepth(DEPTH_TEXT)
  scene.tweens.add({
    targets: tickerText, x: sx - 200, duration: 15000, repeat: -1,
    onRepeat: () => { tickerText.x = sx + 80 }
  })

  return scene.add.graphics()
}

// ═══════════════════════════════════════════════════════════
// COMMON AREA OBJECTS
// ═══════════════════════════════════════════════════════════

export function drawConferenceTable(scene: Phaser.Scene, sx: number, sy: number) {
  placeFurniture(scene, sx, sy, [
    { key: 'tableRound_SE', offsetX: 0, offsetY: 0 },
    { key: 'chair_SE', offsetX: -35, offsetY: -10 },
    { key: 'chair_SE', offsetX: 35, offsetY: -10 },
    { key: 'chair_SE', offsetX: -35, offsetY: 20 },
    { key: 'chair_SE', offsetX: 35, offsetY: 20 },
  ])
  return scene.add.graphics()
}

export function drawLoungeArea(scene: Phaser.Scene, sx: number, sy: number) {
  placeFurniture(scene, sx, sy, [
    { key: 'loungeSofa_SE', offsetX: 0, offsetY: 0 },
    { key: 'tableCoffee_SE', offsetX: 10, offsetY: 20, scale: 0.5 },
  ])
  return scene.add.graphics()
}

export function drawKitchenArea(_scene: Phaser.Scene, _sx: number, _sy: number) {
  // Removed to declutter - coffee machine is at Secretary's station
  return _scene.add.graphics()
}

export function drawEntranceArea(scene: Phaser.Scene, sx: number, sy: number) {
  placeFurniture(scene, sx, sy, [
    { key: 'loungeChair_SE', offsetX: -20, offsetY: 0 },
    { key: 'loungeChair_SE', offsetX: 20, offsetY: 0 },
  ])
  return scene.add.graphics()
}

export function drawPottedPlantDecor(scene: Phaser.Scene, sx: number, sy: number) {
  const img = scene.add.image(sx, sy, 'pottedPlant_SE')
  img.setScale(SCALE)
  img.setDepth(DEPTH_FURNITURE)
  return scene.add.graphics()
}

// ─── Walls (Graphics-based) ─────────────────────────────
export function drawWalls(scene: Phaser.Scene, isoToScreen: (x: number, y: number) => { x: number; y: number }, mapSize: number) {
  const g = scene.add.graphics()
  const tl = isoToScreen(0, 0)
  const tr = isoToScreen(mapSize, 0)
  const bl = isoToScreen(0, mapSize)

  g.fillStyle(0x1a1a2e, 0.7)
  g.lineStyle(6, 0x2c2c4e, 0.9)
  g.lineBetween(tl.x, tl.y, tr.x, tr.y)
  g.lineBetween(tl.x, tl.y, bl.x, bl.y)

  g.fillStyle(0x15152a, 0.8)
  g.beginPath()
  g.moveTo(tl.x, tl.y)
  g.lineTo(tr.x, tr.y)
  g.lineTo(tr.x, tr.y - 12)
  g.lineTo(tl.x, tl.y - 12)
  g.closePath()
  g.fillPath()
  g.beginPath()
  g.moveTo(tl.x, tl.y)
  g.lineTo(bl.x, bl.y)
  g.lineTo(bl.x, bl.y - 12)
  g.lineTo(tl.x, tl.y - 12)
  g.closePath()
  g.fillPath()

  return g
}

// ─── Partition walls ─────────────────────────────────────
export function drawPartition(scene: Phaser.Scene, x1: number, y1: number, x2: number, y2: number) {
  const g = scene.add.graphics()
  const wallH = 10
  g.fillStyle(0x444444, 0.6)
  g.beginPath()
  g.moveTo(x1, y1)
  g.lineTo(x2, y2)
  g.lineTo(x2, y2 - wallH)
  g.lineTo(x1, y1 - wallH)
  g.closePath()
  g.fillPath()
  g.fillStyle(0x8B7355, 0.8)
  g.beginPath()
  g.moveTo(x1, y1 - wallH)
  g.lineTo(x2, y2 - wallH)
  g.lineTo(x2, y2 - wallH - 2)
  g.lineTo(x1, y1 - wallH - 2)
  g.closePath()
  g.fillPath()
  return g
}
