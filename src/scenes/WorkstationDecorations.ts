import Phaser from 'phaser'

/**
 * Phase 4: Enhanced workstation decorations + common area objects
 * All drawn with Phaser Graphics API in isometric style
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
  const hw = w / 2
  g.fillStyle(frameColor, 1)
  g.beginPath()
  g.moveTo(x, y - screenH)
  g.lineTo(x + hw, y - screenH + hw * 0.5)
  g.lineTo(x + hw, y + hw * 0.5)
  g.lineTo(x, y)
  g.closePath()
  g.fillPath()
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

// ─── Travis: 5-screen wall, command podium, world map ────
export function drawTravisDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  const g = scene.add.graphics()
  // 5 screens in arc
  for (let i = 0; i < 5; i++) {
    isoScreen(g, sx - 60 + i * 18, sy - 40 - Math.abs(i - 2) * 8, 20, 30, 0x333333, 0x1E3AFF)
  }
  // Standing command podium
  isoBox(g, sx + 5, sy + 15, 30, 16, 18, 0x2c2c5c, 0x1a1a4a, 0x222255)
  // Podium top surface detail
  isoRect(g, sx + 5, sy + 15 - 18, 24, 12, 0x3a3a6a)
  // World map board (behind, left side)
  isoBox(g, sx - 55, sy + 5, 10, 30, 2, 0x4488AA, 0x336688, 0x3a7799)
  // Map dots
  g.fillStyle(0xFFFF00, 0.8)
  g.fillCircle(sx - 54, sy - 5, 1.5)
  g.fillCircle(sx - 52, sy - 10, 1.5)
  g.fillCircle(sx - 50, sy, 1.5)
  g.fillStyle(0xFF4444, 0.8)
  g.fillCircle(sx - 53, sy - 2, 1.5)
  g.fillCircle(sx - 51, sy + 3, 1.5)
  return g
}

// ─── Researcher: multi-layer bookshelf, folders, microscope ──
export function drawResearcherDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  const g = scene.add.graphics()
  // Data screens
  for (let i = 0; i < 4; i++) {
    isoScreen(g, sx - 40 + i * 15, sy - 35 - i * 7, 14, 18, 0x333333, 0x0E7490)
  }
  // Multi-layer bookshelf
  const shelfX = sx + 35, shelfY = sy - 10
  for (let layer = 0; layer < 3; layer++) {
    const ly = shelfY - layer * 14
    // Shelf board
    isoBox(g, shelfX, ly, 28, 14, 2, 0x8B6914, 0x6B5010, 0x7B5E12)
    // Books on shelf
    const bookColors = [0x8B4513, 0x2E4057, 0x4A6741, 0x6B2737, 0x2A4858]
    for (let b = 0; b < 4; b++) {
      g.fillStyle(bookColors[b % bookColors.length], 0.9)
      g.fillRect(shelfX - 10 + b * 6, ly - 14, 4, 12)
    }
  }
  // Folder stack
  const stackColors = [0xFFD700, 0xFF6347, 0x4169E1, 0x32CD32]
  for (let i = 0; i < 4; i++) {
    isoBox(g, sx + 10, sy + 18 - i * 3, 18, 12, 2, stackColors[i], stackColors[i] - 0x222222, stackColors[i] - 0x111111)
  }
  // Microscope
  g.fillStyle(0x888888, 1)
  g.fillRect(sx - 35, sy + 5, 3, -20)
  g.fillStyle(0xAAAAAA, 1)
  g.fillCircle(sx - 33, sy - 16, 4)
  isoBox(g, sx - 34, sy + 10, 12, 8, 3, 0x666666, 0x555555, 0x5a5a5a)
  return g
}

// ─── Inspector: QC board with lights, magnifier, test rack ──
export function drawInspectorDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  const g = scene.add.graphics()
  // QC board (larger)
  isoBox(g, sx + 30, sy - 25, 28, 36, 3, 0xF5F5DC, 0xD2C9A0, 0xE0D8B0)
  // Traffic light indicators
  const lights = [0x22CC22, 0xFFCC00, 0xFF3333]
  lights.forEach((c, i) => {
    g.fillStyle(c, 0.9)
    g.fillCircle(sx + 30, sy - 38 + i * 8, 3.5)
    g.lineStyle(1, 0x333333, 0.5)
    g.strokeCircle(sx + 30, sy - 38 + i * 8, 3.5)
  })
  // Checklist lines
  g.lineStyle(1, 0x333333, 0.8)
  for (let i = 0; i < 5; i++) {
    const ly = sy - 36 + i * 7
    g.lineBetween(sx + 22, ly, sx + 38, ly + 3)
    g.lineStyle(1.5, 0x10B981, 1)
    g.lineBetween(sx + 19, ly, sx + 20, ly + 2)
    g.lineBetween(sx + 20, ly + 2, sx + 22, ly - 2)
    g.lineStyle(1, 0x333333, 0.8)
  }
  // Magnifying glass (bigger)
  g.lineStyle(3, 0xCCCCCC, 1)
  g.strokeCircle(sx - 35, sy - 40, 12)
  g.fillStyle(0xCCEEFF, 0.2)
  g.fillCircle(sx - 35, sy - 40, 12)
  g.lineStyle(4, 0x888888, 1)
  g.lineBetween(sx - 26, sy - 32, sx - 16, sy - 22)
  // Test equipment rack
  isoBox(g, sx - 20, sy + 10, 24, 14, 20, 0x555555, 0x444444, 0x4a4a4a)
  // Rack shelves
  for (let i = 0; i < 3; i++) {
    isoRect(g, sx - 20, sy + 10 - 6 - i * 6, 20, 10, 0x666666, 0.7)
  }
  return g
}

// ─── Secretary: L-desk, phone, calendar, filing cabinet ──
export function drawSecretaryDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  const g = scene.add.graphics()
  // L-shaped reception desk
  isoBox(g, sx - 10, sy + 22, 50, 22, 10, 0x8B6914, 0x6B5010, 0x7B5E12)
  isoBox(g, sx + 25, sy + 10, 22, 35, 10, 0x8B6914, 0x6B5010, 0x7B5E12)
  // Phone
  isoBox(g, sx - 18, sy + 8, 10, 6, 5, 0x222222, 0x111111, 0x1a1a1a)
  // Handset
  g.lineStyle(2, 0x333333, 1)
  g.beginPath()
  g.moveTo(sx - 22, sy + 2)
  g.lineTo(sx - 20, sy - 2)
  g.lineTo(sx - 15, sy)
  g.strokePath()
  // Calendar board
  isoBox(g, sx - 40, sy - 15, 8, 24, 2, 0xFFFFFF, 0xDDDDDD, 0xEEEEEE)
  // Calendar grid lines
  g.lineStyle(1, 0xCCCCCC, 0.5)
  for (let i = 0; i < 4; i++) {
    g.lineBetween(sx - 43, sy - 22 + i * 5, sx - 37, sy - 22 + i * 5)
  }
  // Red header
  g.fillStyle(0xCC3333, 0.8)
  g.fillRect(sx - 43, sy - 28, 7, 4)
  // Filing cabinet
  isoBox(g, sx + 35, sy - 10, 16, 12, 22, 0x777777, 0x666666, 0x6e6e6e)
  // Drawer handles
  for (let i = 0; i < 3; i++) {
    g.fillStyle(0xAAAAAA, 1)
    g.fillRect(sx + 33, sy - 10 - 18 + i * 7, 5, 1.5)
  }
  // Document stacks
  isoBox(g, sx + 5, sy + 8, 16, 10, 2, 0xFFFFFF, 0xDDDDDD, 0xEEEEEE)
  isoBox(g, sx + 4, sy + 6, 16, 10, 2, 0xFFF8DC, 0xDDD8BC, 0xEEE8CC)
  isoBox(g, sx + 6, sy + 4, 16, 10, 2, 0xFFFFFF, 0xDDDDDD, 0xEEEEEE)
  return g
}

// ─── Coder: 3 monitors, RGB keyboard, snack rack, energy drink ──
export function drawCoderDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  const g = scene.add.graphics()
  // 3 monitors
  isoScreen(g, sx - 35, sy - 38, 22, 28, 0x222222, 0x00FF41)
  isoScreen(g, sx - 15, sy - 48, 26, 32, 0x222222, 0x1a1aFF)
  isoScreen(g, sx + 8, sy - 42, 22, 28, 0x222222, 0x00FF41)
  // Code lines on center screen
  g.lineStyle(1, 0x00FF41, 0.4)
  for (let i = 0; i < 5; i++) {
    const lw = 5 + Math.random() * 10
    g.lineBetween(sx - 12, sy - 52 + i * 4, sx - 12 + lw, sy - 52 + i * 4 + lw * 0.25)
  }
  // Desk
  isoBox(g, sx - 10, sy + 15, 55, 24, 5, 0x4a4a4a, 0x3a3a3a, 0x424242)
  // RGB mechanical keyboard
  isoRect(g, sx - 10, sy + 8, 26, 12, 0x222222)
  // RGB strip
  const rgbColors = [0xFF0000, 0xFF8800, 0xFFFF00, 0x00FF00, 0x0088FF, 0x8800FF]
  rgbColors.forEach((c, i) => {
    g.fillStyle(c, 0.7)
    g.fillRect(sx - 20 + i * 4, sy + 5, 3, 1)
  })
  // Snack rack
  isoBox(g, sx + 30, sy + 5, 14, 10, 16, 0x8B6914, 0x6B5010, 0x7B5E12)
  // Snack items
  isoBox(g, sx + 30, sy + 5 - 16, 10, 6, 3, 0xFF6633, 0xDD5522, 0xEE5F2A)
  isoBox(g, sx + 28, sy + 5 - 12, 8, 5, 4, 0x33AA33, 0x228822, 0x2A992A)
  // Energy drink can
  g.fillStyle(0x00CCFF, 0.9)
  g.fillRect(sx + 18, sy + 2, 4, -10)
  g.fillStyle(0x222222, 1)
  g.fillRect(sx + 18, sy - 8, 4, -2)
  // Coffee cup
  g.fillStyle(0xFFFFFF, 0.9)
  g.fillCircle(sx - 25, sy + 8, 5)
  g.fillStyle(0x6F4E37, 0.9)
  g.fillCircle(sx - 25, sy + 8, 3.5)
  return g
}

// ─── Writer: typewriter, manuscript stack, lamp (glow), book wall ──
export function drawWriterDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  const g = scene.add.graphics()
  // Writing desk
  isoBox(g, sx, sy + 18, 50, 24, 6, 0x8B6914, 0x6B5010, 0x7B5E12)
  // Retro typewriter
  isoBox(g, sx - 8, sy + 5, 24, 14, 8, 0x444444, 0x333333, 0x3a3a3a)
  // Typewriter paper
  g.fillStyle(0xFFF8DC, 0.9)
  g.fillRect(sx - 10, sy - 8, 8, -12)
  // Key rows
  g.fillStyle(0x666666, 0.8)
  for (let i = 0; i < 6; i++) {
    g.fillCircle(sx - 14 + i * 3, sy + 2, 1.2)
  }
  // Manuscript stack
  for (let i = 0; i < 5; i++) {
    isoBox(g, sx + 20, sy + 12 - i * 2, 14, 10, 1.5, 0xFFFBE6, 0xDDD8BC, 0xEEE8CC)
  }
  // Desk lamp with glow effect
  g.lineStyle(3, 0xB8860B, 1)
  g.lineBetween(sx - 22, sy + 12, sx - 22, sy - 12)
  g.lineBetween(sx - 22, sy - 12, sx - 30, sy - 18)
  // Lamp shade
  g.fillStyle(0x2E5733, 0.9)
  g.beginPath()
  g.moveTo(sx - 34, sy - 16)
  g.lineTo(sx - 26, sy - 16)
  g.lineTo(sx - 28, sy - 20)
  g.lineTo(sx - 32, sy - 20)
  g.closePath()
  g.fillPath()
  // Glow circle
  g.fillStyle(0xFFD700, 0.15)
  g.fillCircle(sx - 30, sy - 10, 20)
  g.fillStyle(0xFFD700, 0.08)
  g.fillCircle(sx - 30, sy - 10, 35)
  // Book wall (right side)
  const bwX = sx + 38, bwY = sy - 15
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const bookColors = [0x8B4513, 0x2E4057, 0x6B2737, 0x4A6741, 0x3A2A58]
      g.fillStyle(bookColors[(row + col) % bookColors.length], 0.9)
      g.fillRect(bwX + col * 5, bwY - row * 12, 4, 10)
    }
  }
  return g
}

// ─── Designer: drawing tablet+stylus, color fan, gallery wall ──
export function drawDesignerDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  const g = scene.add.graphics()
  // Large drawing tablet
  isoBox(g, sx - 15, sy + 10, 40, 28, 3, 0xEEEEEE, 0xCCCCCC, 0xDDDDDD)
  // Tablet screen
  isoRect(g, sx - 15, sy + 10 - 3, 34, 22, 0x333333, 0.9)
  // Stylus
  g.lineStyle(2, 0xAAAAAA, 1)
  g.lineBetween(sx + 5, sy + 2, sx + 15, sy - 8)
  g.fillStyle(0x8B5CF6, 0.9)
  g.fillCircle(sx + 15, sy - 8, 2)
  // Color fan (fanned out cards)
  const fanColors = [0xFF0000, 0xFF8800, 0xFFFF00, 0x00CC00, 0x0066FF, 0x8800FF, 0xFF00AA]
  fanColors.forEach((c, i) => {
    const angle = -0.6 + i * 0.2
    const fx = sx + 30 + Math.cos(angle) * 12
    const fy = sy + 15 + Math.sin(angle) * 8
    g.fillStyle(c, 0.85)
    g.fillRect(fx, fy, 4, -14)
  })
  // Gallery wall (small framed artworks)
  const gwX = sx - 45, gwY = sy - 25
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const frameX = gwX + col * 14
      const frameY = gwY - row * 16
      // Frame
      g.lineStyle(1.5, 0xB8860B, 1)
      g.strokeRect(frameX, frameY, 10, 12)
      // Art content (random colored rectangles)
      const artColors = [0xFF6B6B, 0x4ECDC4, 0xFFE66D, 0x95E1D3, 0xF38181, 0xAA96DA]
      g.fillStyle(artColors[(row * 3 + col) % artColors.length], 0.7)
      g.fillRect(frameX + 1.5, frameY + 1.5, 7, 9)
    }
  }
  // Color palette circle
  g.fillStyle(0xD2B48C, 1)
  g.fillCircle(sx + 30, sy - 5, 8)
  const palColors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF]
  palColors.forEach((c, i) => {
    const angle = (i / palColors.length) * Math.PI * 2
    g.fillStyle(c, 0.9)
    g.fillCircle(sx + 30 + Math.cos(angle) * 5, sy - 5 + Math.sin(angle) * 3, 2)
  })
  return g
}

// ─── Analyst: 6-screen wall, K-line chart, calculator, reports ──
export function drawAnalystDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  const g = scene.add.graphics()
  // 6-screen trading wall (2 rows x 3)
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      isoScreen(g, sx - 40 + col * 20, sy - 35 - col * 10 - row * 22, 18, 20, 0x333333, 0x001a00)
    }
  }
  // K-line chart on center screen
  g.lineStyle(1, 0x00FF00, 0.8)
  const chartX = sx - 18, chartY = sy - 48
  const prices = [0, -3, 2, 5, 3, 7, 4, 8, 6, 10, 8, 12]
  for (let i = 0; i < prices.length - 1; i++) {
    g.lineBetween(chartX + i * 2, chartY - prices[i], chartX + (i + 1) * 2, chartY - prices[i + 1])
  }
  // Red/green candlesticks
  for (let i = 0; i < 7; i++) {
    const cx = chartX + i * 3
    const isGreen = i % 2 === 0
    g.fillStyle(isGreen ? 0x00FF00 : 0xFF0000, 0.8)
    g.fillRect(cx, chartY - 8 - i * 1.5, 2, 5 + (i % 3) * 2)
  }
  // Desk
  isoBox(g, sx - 10, sy + 15, 60, 24, 6, 0x3a3a3a, 0x2a2a2a, 0x333333)
  // Calculator
  isoBox(g, sx + 20, sy + 6, 10, 8, 2, 0x222222, 0x181818, 0x1e1e1e)
  // Calculator buttons
  g.fillStyle(0x666666, 0.8)
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      g.fillCircle(sx + 18 + c * 2.5, sy + 3 + r * 2, 0.8)
    }
  }
  // Calculator screen
  g.fillStyle(0x88CC88, 0.9)
  g.fillRect(sx + 17, sy - 1, 7, 2)
  // Report stacks
  for (let i = 0; i < 4; i++) {
    isoBox(g, sx - 28, sy + 12 - i * 2.5, 16, 10, 1.5, 0xFFFFFF, 0xDDDDDD, 0xEEEEEE)
  }
  // Report with chart
  g.lineStyle(1, 0x0066CC, 0.6)
  g.lineBetween(sx - 32, sy + 5, sx - 28, sy + 2)
  g.lineBetween(sx - 28, sy + 2, sx - 25, sy + 4)
  g.lineBetween(sx - 25, sy + 4, sx - 22, sy)
  return g
}

// ─── Common area objects ─────────────────────────────────

// Copier machine
export function drawCopier(scene: Phaser.Scene, sx: number, sy: number) {
  const g = scene.add.graphics()
  isoBox(g, sx, sy, 30, 20, 22, 0x999999, 0x777777, 0x888888)
  // Paper tray on top
  isoBox(g, sx - 2, sy - 22, 20, 10, 2, 0xDDDDDD, 0xBBBBBB, 0xCCCCCC)
  // Output tray
  g.fillStyle(0xAAAAAA, 0.8)
  g.beginPath()
  g.moveTo(sx + 10, sy - 14)
  g.lineTo(sx + 20, sy - 10)
  g.lineTo(sx + 20, sy - 8)
  g.lineTo(sx + 10, sy - 12)
  g.closePath()
  g.fillPath()
  // Paper in tray
  g.fillStyle(0xFFFFFF, 0.9)
  g.fillRect(sx + 12, sy - 12, 6, 1)
  // Control panel
  g.fillStyle(0x333333, 1)
  g.fillRect(sx - 8, sy - 22, 5, 3)
  g.fillStyle(0x00CC00, 0.8)
  g.fillCircle(sx - 5, sy - 21, 1)
  return g
}

// Water cooler
export function drawWaterCooler(scene: Phaser.Scene, sx: number, sy: number) {
  const g = scene.add.graphics()
  // Base
  isoBox(g, sx, sy, 14, 10, 24, 0xEEEEEE, 0xCCCCCC, 0xDDDDDD)
  // Water jug on top
  g.fillStyle(0x4488CC, 0.5)
  g.fillCircle(sx, sy - 28, 7)
  g.fillStyle(0x4488CC, 0.4)
  g.fillRect(sx - 4, sy - 28, 8, -8)
  g.fillCircle(sx, sy - 36, 4)
  // Tap
  g.fillStyle(0xCCCCCC, 1)
  g.fillRect(sx + 5, sy - 16, 3, 3)
  // Cup
  g.fillStyle(0xFFFFFF, 0.9)
  g.fillRect(sx + 8, sy - 10, 3, -5)
  return g
}

// Whiteboard with scribbles
export function drawWhiteboard(scene: Phaser.Scene, sx: number, sy: number) {
  const g = scene.add.graphics()
  // Stand legs
  g.lineStyle(2, 0x888888, 1)
  g.lineBetween(sx - 12, sy + 15, sx - 8, sy - 10)
  g.lineBetween(sx + 12, sy + 15, sx + 8, sy - 10)
  // Board
  isoBox(g, sx, sy - 15, 30, 24, 2, 0xFFFFFF, 0xEEEEEE, 0xF5F5F5)
  // Scribbles
  g.lineStyle(2, 0xFF3333, 0.6)
  g.lineBetween(sx - 10, sy - 22, sx + 5, sy - 18)
  g.lineStyle(2, 0x3333FF, 0.6)
  g.lineBetween(sx - 8, sy - 16, sx + 8, sy - 14)
  g.lineStyle(2, 0x33AA33, 0.6)
  g.lineBetween(sx - 6, sy - 10, sx + 3, sy - 8)
  // Marker tray
  g.fillStyle(0xAAAAAA, 1)
  g.fillRect(sx - 8, sy - 4, 16, 2)
  // Markers
  g.fillStyle(0xFF0000, 1); g.fillRect(sx - 5, sy - 5, 2, 3)
  g.fillStyle(0x0000FF, 1); g.fillRect(sx - 1, sy - 5, 2, 3)
  g.fillStyle(0x00AA00, 1); g.fillRect(sx + 3, sy - 5, 2, 3)
  return g
}

// Conference table with chairs
export function drawConferenceTable(scene: Phaser.Scene, sx: number, sy: number) {
  const g = scene.add.graphics()
  // Oval table (drawn as elongated iso diamond)
  g.fillStyle(0x6B4226, 0.9)
  g.beginPath()
  // Ellipse approximation
  for (let a = 0; a < Math.PI * 2; a += 0.1) {
    const ex = sx + Math.cos(a) * 40
    const ey = sy + Math.sin(a) * 18
    if (a === 0) g.moveTo(ex, ey)
    else g.lineTo(ex, ey)
  }
  g.closePath()
  g.fillPath()
  // Table top highlight
  g.fillStyle(0x7B5236, 0.5)
  g.beginPath()
  for (let a = 0; a < Math.PI * 2; a += 0.1) {
    const ex = sx + Math.cos(a) * 35
    const ey = sy + Math.sin(a) * 14 - 1
    if (a === 0) g.moveTo(ex, ey)
    else g.lineTo(ex, ey)
  }
  g.closePath()
  g.fillPath()
  // 6 chairs around table
  const chairPositions = [
    { x: -35, y: -12 }, { x: 0, y: -22 }, { x: 35, y: -12 },
    { x: -35, y: 12 }, { x: 0, y: 22 }, { x: 35, y: 12 }
  ]
  chairPositions.forEach(cp => {
    // Chair seat
    isoBox(g, sx + cp.x, sy + cp.y, 10, 8, 4, 0x444444, 0x333333, 0x3a3a3a)
    // Chair back
    if (cp.y < 0) {
      g.fillStyle(0x555555, 0.9)
      g.fillRect(sx + cp.x - 4, sy + cp.y - 10, 8, 6)
    }
  })
  return g
}

// Tea/break area
export function drawTeaArea(scene: Phaser.Scene, sx: number, sy: number) {
  const g = scene.add.graphics()
  // Counter table
  isoBox(g, sx, sy, 30, 16, 10, 0x8B6914, 0x6B5010, 0x7B5E12)
  // Coffee machine
  isoBox(g, sx - 5, sy - 10, 12, 8, 14, 0x4A3728, 0x3A2718, 0x422F20)
  // Coffee machine top
  g.fillStyle(0x333333, 1)
  g.fillRect(sx - 9, sy - 24, 8, 2)
  // Cup on counter
  g.fillStyle(0xFFFFFF, 0.9)
  g.fillCircle(sx + 8, sy - 4, 4)
  g.fillStyle(0x6F4E37, 0.9)
  g.fillCircle(sx + 8, sy - 4, 2.5)
  // Second cup
  g.fillStyle(0xCCEEFF, 0.9)
  g.fillCircle(sx + 14, sy - 6, 3.5)
  g.fillStyle(0x88CC88, 0.7)
  g.fillCircle(sx + 14, sy - 6, 2)
  return g
}

// ─── Partition walls between workstations ────────────────
export function drawPartition(scene: Phaser.Scene, x1: number, y1: number, x2: number, y2: number) {
  const g = scene.add.graphics()
  const wallH = 10  // ~1/3 tile height
  // Main wall body
  g.fillStyle(0x444444, 0.6)
  g.beginPath()
  g.moveTo(x1, y1)
  g.lineTo(x2, y2)
  g.lineTo(x2, y2 - wallH)
  g.lineTo(x1, y1 - wallH)
  g.closePath()
  g.fillPath()
  // Wood trim on top
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

// ─── Small floor details ─────────────────────────────────

export function drawTrashCan(scene: Phaser.Scene, sx: number, sy: number) {
  const g = scene.add.graphics()
  g.fillStyle(0x555555, 0.8)
  g.fillRect(sx - 4, sy, 8, -12)
  g.fillStyle(0x666666, 1)
  g.fillRect(sx - 5, sy - 12, 10, 2)
  return g
}

export function drawSmallPlant(scene: Phaser.Scene, sx: number, sy: number) {
  const g = scene.add.graphics()
  // Small pot
  isoBox(g, sx, sy, 8, 6, 6, 0xCC7744, 0xAA5533, 0xBB6640)
  // Small leaves
  g.fillStyle(0x44AA44, 0.9)
  g.fillCircle(sx - 2, sy - 10, 5)
  g.fillCircle(sx + 2, sy - 8, 4)
  return g
}

// ─── Decorative plants for corners ───────────────────────
export function drawPlant(scene: Phaser.Scene, sx: number, sy: number) {
  const g = scene.add.graphics()
  isoBox(g, sx, sy, 16, 12, 10, 0x8B4513, 0x6B3410, 0x7B4413)
  g.fillStyle(0x228B22, 0.9)
  g.fillCircle(sx - 3, sy - 16, 9)
  g.fillCircle(sx + 5, sy - 14, 8)
  g.fillCircle(sx, sy - 22, 7)
  g.fillStyle(0x2E8B2E, 0.8)
  g.fillCircle(sx + 2, sy - 19, 6)
  return g
}

// ─── Walls around the scene edges ────────────────────────
export function drawWalls(scene: Phaser.Scene, isoToScreen: (x: number, y: number) => { x: number; y: number }, mapSize: number) {
  const g = scene.add.graphics()
  g.lineStyle(4, 0x1a1a2e, 0.9)

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
