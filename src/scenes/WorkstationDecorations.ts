import Phaser from 'phaser'

/**
 * Phase 2: Workstation decorations drawn with Phaser Graphics API
 * All in isometric style (diamond/slanted shapes)
 */

// Helper: draw an isometric rectangle (box top face)
function isoRect(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, color: number, alpha = 1) {
  const hw = w / 2, hh = h / 2
  g.fillStyle(color, alpha)
  g.beginPath()
  g.moveTo(x, y - hh)
  g.lineTo(x + hw, y)
  g.lineTo(x, y + hh)
  g.lineTo(x - hw, y)
  g.closePath()
  g.fillPath()
}

// Helper: draw an isometric box (top + left + right faces)
function isoBox(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, depth: number, topColor: number, leftColor: number, rightColor: number, alpha = 1) {
  const hw = w / 2, hh = h / 2
  // Top face
  g.fillStyle(topColor, alpha)
  g.beginPath()
  g.moveTo(x, y - hh - depth)
  g.lineTo(x + hw, y - depth)
  g.lineTo(x, y + hh - depth)
  g.lineTo(x - hw, y - depth)
  g.closePath()
  g.fillPath()
  // Left face
  g.fillStyle(leftColor, alpha)
  g.beginPath()
  g.moveTo(x - hw, y - depth)
  g.lineTo(x, y + hh - depth)
  g.lineTo(x, y + hh)
  g.lineTo(x - hw, y)
  g.closePath()
  g.fillPath()
  // Right face
  g.fillStyle(rightColor, alpha)
  g.beginPath()
  g.moveTo(x + hw, y - depth)
  g.lineTo(x, y + hh - depth)
  g.lineTo(x, y + hh)
  g.lineTo(x + hw, y)
  g.closePath()
  g.fillPath()
}

// Screen (flat isometric panel)
function isoScreen(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, screenH: number, frameColor: number, screenColor: number) {
  // Frame
  const hw = w / 2
  g.fillStyle(frameColor, 1)
  g.beginPath()
  g.moveTo(x, y - screenH)
  g.lineTo(x + hw, y - screenH + hw * 0.5)
  g.lineTo(x + hw, y + hw * 0.5)
  g.lineTo(x, y)
  g.closePath()
  g.fillPath()
  // Inner screen
  const m = 3
  g.fillStyle(screenColor, 0.9)
  g.beginPath()
  g.moveTo(x + m, y - screenH + m)
  g.lineTo(x + hw - m, y - screenH + (hw - m) * 0.5 + m)
  g.lineTo(x + hw - m, y + (hw - m) * 0.5 - m)
  g.lineTo(x + m, y - m)
  g.closePath()
  g.fillPath()
}

export function drawTravisDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  const g = scene.add.graphics()
  // 3 big screens behind Travis
  isoScreen(g, sx - 50, sy - 40, 28, 35, 0x333333, 0x1E3AFF)
  isoScreen(g, sx - 25, sy - 52, 28, 35, 0x333333, 0x2244CC)
  isoScreen(g, sx, sy - 64, 28, 35, 0x333333, 0x1E3AFF)
  // Command desk
  isoBox(g, sx + 5, sy + 20, 50, 25, 8, 0x2c2c5c, 0x1a1a4a, 0x222255)
  return g
}

export function drawResearcherDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  const g = scene.add.graphics()
  // Data dashboard - multiple small screens
  for (let i = 0; i < 4; i++) {
    isoScreen(g, sx - 40 + i * 15, sy - 35 - i * 7, 14, 18, 0x333333, 0x0E7490)
  }
  // Book stack
  isoBox(g, sx + 30, sy + 15, 18, 10, 4, 0x8B4513, 0x6B3410, 0x7B4413)
  isoBox(g, sx + 28, sy + 13, 20, 10, 3, 0x2E4057, 0x1E3047, 0x263A50)
  isoBox(g, sx + 31, sy + 11, 16, 9, 3, 0x4A6741, 0x3A5731, 0x446038)
  return g
}

export function drawInspectorDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  const g = scene.add.graphics()
  // Magnifying glass
  g.lineStyle(3, 0xCCCCCC, 1)
  g.strokeCircle(sx - 30, sy - 45, 10)
  g.lineStyle(3, 0x888888, 1)
  g.lineBetween(sx - 22, sy - 38, sx - 14, sy - 30)
  // Checklist board
  isoBox(g, sx + 25, sy - 20, 24, 30, 3, 0xF5F5DC, 0xD2C9A0, 0xE0D8B0)
  // Checklist lines
  g.lineStyle(1, 0x333333, 0.8)
  for (let i = 0; i < 4; i++) {
    const ly = sy - 32 + i * 7
    g.lineBetween(sx + 18, ly, sx + 32, ly + 3)
    // Checkmarks
    g.lineStyle(1, 0x10B981, 1)
    g.lineBetween(sx + 15, ly, sx + 16, ly + 2)
    g.lineBetween(sx + 16, ly + 2, sx + 18, ly - 2)
    g.lineStyle(1, 0x333333, 0.8)
  }
  return g
}

export function drawSecretaryDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  const g = scene.add.graphics()
  // Reception desk
  isoBox(g, sx, sy + 22, 55, 22, 10, 0x8B6914, 0x6B5010, 0x7B5E12)
  // Phone
  isoBox(g, sx - 15, sy + 8, 10, 6, 5, 0x222222, 0x111111, 0x1a1a1a)
  // Document pile
  isoBox(g, sx + 15, sy + 8, 16, 10, 2, 0xFFFFFF, 0xDDDDDD, 0xEEEEEE)
  isoBox(g, sx + 14, sy + 6, 16, 10, 2, 0xFFF8DC, 0xDDD8BC, 0xEEE8CC)
  isoBox(g, sx + 16, sy + 4, 16, 10, 2, 0xFFFFFF, 0xDDDDDD, 0xEEEEEE)
  return g
}

export function drawCoderDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  const g = scene.add.graphics()
  // Dual monitors
  isoScreen(g, sx - 25, sy - 40, 24, 28, 0x222222, 0x00FF41)
  isoScreen(g, sx - 5, sy - 50, 24, 28, 0x222222, 0x1a1aFF)
  // Desk
  isoBox(g, sx - 10, sy + 15, 50, 22, 5, 0x4a4a4a, 0x3a3a3a, 0x424242)
  // Keyboard
  isoRect(g, sx - 10, sy + 8, 22, 10, 0x333333)
  // Coffee cup
  g.fillStyle(0xFFFFFF, 0.9)
  g.fillCircle(sx + 18, sy + 6, 5)
  g.fillStyle(0x6F4E37, 0.9)
  g.fillCircle(sx + 18, sy + 6, 3.5)
  return g
}

export function drawWriterDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  const g = scene.add.graphics()
  // Writing desk
  isoBox(g, sx, sy + 18, 45, 22, 6, 0x8B6914, 0x6B5010, 0x7B5E12)
  // Notebook
  isoRect(g, sx - 5, sy + 8, 16, 12, 0xFFF8DC)
  g.lineStyle(1, 0x999999, 0.5)
  for (let i = 0; i < 3; i++) {
    g.lineBetween(sx - 9, sy + 4 + i * 3, sx - 1, sy + 7 + i * 3)
  }
  // Desk lamp
  g.lineStyle(3, 0xB8860B, 1)
  g.lineBetween(sx + 18, sy + 10, sx + 18, sy - 10)
  g.lineBetween(sx + 18, sy - 10, sx + 10, sy - 15)
  g.fillStyle(0xFFD700, 0.6)
  g.fillCircle(sx + 10, sy - 15, 5)
  return g
}

export function drawDesignerDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  const g = scene.add.graphics()
  // Easel legs
  g.lineStyle(2, 0x8B6914, 1)
  g.lineBetween(sx - 35, sy - 10, sx - 30, sy + 20)
  g.lineBetween(sx - 25, sy - 10, sx - 30, sy + 20)
  // Drawing board on easel
  isoBox(g, sx - 30, sy - 25, 22, 28, 2, 0xFFFFFF, 0xDDDDDD, 0xEEEEEE)
  // Color palette - circle with color dots
  g.fillStyle(0xD2B48C, 1)
  g.fillCircle(sx + 20, sy + 10, 10)
  const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF]
  colors.forEach((c, i) => {
    const angle = (i / colors.length) * Math.PI * 2
    g.fillStyle(c, 0.9)
    g.fillCircle(sx + 20 + Math.cos(angle) * 6, sy + 10 + Math.sin(angle) * 4, 2.5)
  })
  return g
}

export function drawAnalystDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  const g = scene.add.graphics()
  // Multi-screen trading desk
  isoScreen(g, sx - 35, sy - 38, 22, 26, 0x333333, 0x001a00)
  isoScreen(g, sx - 15, sy - 48, 22, 26, 0x333333, 0x001a00)
  isoScreen(g, sx + 5, sy - 58, 22, 26, 0x333333, 0x001a00)
  // K-line chart on middle screen
  g.lineStyle(1, 0x00FF00, 0.8)
  const chartX = sx - 10, chartY = sy - 50
  const prices = [0, -3, 2, 5, 3, 7, 4, 8, 6, 10]
  for (let i = 0; i < prices.length - 1; i++) {
    g.lineBetween(chartX + i * 2, chartY - prices[i], chartX + (i + 1) * 2, chartY - prices[i + 1])
  }
  // Red/green candlesticks
  for (let i = 0; i < 5; i++) {
    const cx = chartX + i * 4
    const isGreen = i % 2 === 0
    g.fillStyle(isGreen ? 0x00FF00 : 0xFF0000, 0.8)
    g.fillRect(cx, chartY - 8 - i * 2, 2, 6 + i)
  }
  // Desk
  isoBox(g, sx - 10, sy + 15, 55, 22, 6, 0x3a3a3a, 0x2a2a2a, 0x333333)
  return g
}

// Decorative plants for corners
export function drawPlant(scene: Phaser.Scene, sx: number, sy: number) {
  const g = scene.add.graphics()
  // Pot
  isoBox(g, sx, sy, 16, 12, 10, 0x8B4513, 0x6B3410, 0x7B4413)
  // Foliage
  g.fillStyle(0x228B22, 0.9)
  g.fillCircle(sx - 3, sy - 16, 9)
  g.fillCircle(sx + 5, sy - 14, 8)
  g.fillCircle(sx, sy - 22, 7)
  g.fillStyle(0x2E8B2E, 0.8)
  g.fillCircle(sx + 2, sy - 19, 6)
  return g
}

// Walls around the scene edges
export function drawWalls(scene: Phaser.Scene, isoToScreen: (x: number, y: number) => { x: number; y: number }, mapSize: number) {
  const g = scene.add.graphics()
  g.lineStyle(4, 0x1a1a2e, 0.9)

  // Top-left edge
  const tl = isoToScreen(0, 0)
  const tr = isoToScreen(mapSize, 0)
  const bl = isoToScreen(0, mapSize)
  // bottom-right corner (unused but available)
  void isoToScreen(mapSize, mapSize)

  // Draw thick wall lines
  g.fillStyle(0x1a1a2e, 0.7)

  // Top-left wall (north-west)
  g.lineStyle(6, 0x2c2c4e, 0.9)
  g.lineBetween(tl.x, tl.y, tr.x, tr.y)
  g.lineBetween(tl.x, tl.y, bl.x, bl.y)

  // Wall thickness (3D effect)
  g.fillStyle(0x15152a, 0.8)
  // North wall
  g.beginPath()
  g.moveTo(tl.x, tl.y)
  g.lineTo(tr.x, tr.y)
  g.lineTo(tr.x, tr.y - 12)
  g.lineTo(tl.x, tl.y - 12)
  g.closePath()
  g.fillPath()
  // West wall
  g.beginPath()
  g.moveTo(tl.x, tl.y)
  g.lineTo(bl.x, bl.y)
  g.lineTo(bl.x, bl.y - 12)
  g.lineTo(tl.x, tl.y - 12)
  g.closePath()
  g.fillPath()

  return g
}
