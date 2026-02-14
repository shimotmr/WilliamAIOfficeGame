import Phaser from 'phaser'

/**
 * Phase 5: Kenney furniture assets replacing Graphics API decorations.
 * Each function places image sprites around the agent's screen position.
 */

const SCALE = 0.55
const DEPTH_FURNITURE = 5

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

// ─── Travis: command center ──────────────────────────────
export function drawTravisDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  placeFurniture(scene, sx, sy, [
    { key: 'deskCorner_SE', offsetX: 0, offsetY: 20 },
    { key: 'computerScreen_SE', offsetX: -15, offsetY: -5, scale: 0.45 },
    { key: 'computerScreen_SE', offsetX: 10, offsetY: -8, scale: 0.45 },
    { key: 'chairDesk_SE', offsetX: 5, offsetY: 40 },
    { key: 'cabinetTelevision_SE', offsetX: -50, offsetY: -15 },
    { key: 'plantSmall1_SE', offsetX: 45, offsetY: 10, scale: 0.5 },
  ])
  // Return a dummy graphics to keep API compatible
  return scene.add.graphics()
}

// ─── Researcher: data wall ───────────────────────────────
export function drawResearcherDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  placeFurniture(scene, sx, sy, [
    { key: 'desk_SE', offsetX: 0, offsetY: 20 },
    { key: 'computerScreen_SE', offsetX: -5, offsetY: -5, scale: 0.45 },
    { key: 'computerKeyboard_SE', offsetX: 5, offsetY: 12, scale: 0.4 },
    { key: 'bookcaseClosedWide_SE', offsetX: -55, offsetY: -10 },
    { key: 'bookcaseOpen_SE', offsetX: -40, offsetY: -25 },
    { key: 'books_SE', offsetX: 30, offsetY: 5, scale: 0.45 },
    { key: 'chairDesk_SE', offsetX: 5, offsetY: 40 },
  ])
  return scene.add.graphics()
}

// ─── Inspector: QC room ─────────────────────────────────
export function drawInspectorDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  placeFurniture(scene, sx, sy, [
    { key: 'desk_SE', offsetX: 0, offsetY: 20 },
    { key: 'computerScreen_SE', offsetX: -5, offsetY: -5, scale: 0.45 },
    { key: 'chairDesk_SE', offsetX: 5, offsetY: 40 },
    { key: 'sideTableDrawers_SE', offsetX: 45, offsetY: 0 },
    { key: 'lampSquareFloor_SE', offsetX: -40, offsetY: -10 },
  ])
  return scene.add.graphics()
}

// ─── Secretary: reception ────────────────────────────────
export function drawSecretaryDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  placeFurniture(scene, sx, sy, [
    { key: 'deskCorner_SE', offsetX: 0, offsetY: 20 },
    { key: 'computerScreen_SE', offsetX: -10, offsetY: -5, scale: 0.45 },
    { key: 'computerKeyboard_SE', offsetX: 5, offsetY: 12, scale: 0.4 },
    { key: 'chairModernCushion_SE', offsetX: 5, offsetY: 40 },
    { key: 'sideTable_SE', offsetX: 45, offsetY: 15 },
    { key: 'plantSmall2_SE', offsetX: -45, offsetY: 5, scale: 0.5 },
  ])
  return scene.add.graphics()
}

// ─── Coder: lab ──────────────────────────────────────────
export function drawCoderDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  placeFurniture(scene, sx, sy, [
    { key: 'desk_SE', offsetX: 0, offsetY: 20 },
    { key: 'computerScreen_SE', offsetX: -18, offsetY: -8, scale: 0.45 },
    { key: 'computerScreen_SE', offsetX: 5, offsetY: -5, scale: 0.45 },
    { key: 'computerKeyboard_SE', offsetX: -5, offsetY: 10, scale: 0.4 },
    { key: 'computerMouse_SE', offsetX: 20, offsetY: 12, scale: 0.35 },
    { key: 'chairDesk_SE', offsetX: 5, offsetY: 40 },
    { key: 'books_SE', offsetX: 40, offsetY: 0, scale: 0.45 },
  ])
  return scene.add.graphics()
}

// ─── Writer: writing room ────────────────────────────────
export function drawWriterDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  placeFurniture(scene, sx, sy, [
    { key: 'desk_SE', offsetX: 0, offsetY: 20 },
    { key: 'lampRoundTable_SE', offsetX: -20, offsetY: -5, scale: 0.5 },
    { key: 'books_SE', offsetX: 25, offsetY: 8, scale: 0.45 },
    { key: 'bookcaseClosed_SE', offsetX: -50, offsetY: -15 },
    { key: 'chairRounded_SE', offsetX: 5, offsetY: 40 },
    { key: 'plantSmall3_SE', offsetX: 50, offsetY: 10, scale: 0.5 },
  ])
  return scene.add.graphics()
}

// ─── Designer: studio ────────────────────────────────────
export function drawDesignerDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  placeFurniture(scene, sx, sy, [
    { key: 'desk_SE', offsetX: 0, offsetY: 20 },
    { key: 'computerScreen_SE', offsetX: -5, offsetY: -5, scale: 0.45 },
    { key: 'chairDesk_SE', offsetX: 5, offsetY: 40 },
    { key: 'lampRoundFloor_SE', offsetX: -45, offsetY: -5 },
    { key: 'plantSmall1_SE', offsetX: 45, offsetY: 10, scale: 0.5 },
  ])
  return scene.add.graphics()
}

// ─── Analyst: trading room ───────────────────────────────
export function drawAnalystDecorations(scene: Phaser.Scene, sx: number, sy: number) {
  placeFurniture(scene, sx, sy, [
    { key: 'deskCorner_SE', offsetX: 0, offsetY: 20 },
    { key: 'computerScreen_SE', offsetX: -25, offsetY: -10, scale: 0.45 },
    { key: 'computerScreen_SE', offsetX: -5, offsetY: -8, scale: 0.45 },
    { key: 'computerScreen_SE', offsetX: 15, offsetY: -5, scale: 0.45 },
    { key: 'chairDesk_SE', offsetX: 5, offsetY: 40 },
    { key: 'sideTableDrawers_SE', offsetX: 50, offsetY: 5 },
  ])
  return scene.add.graphics()
}

// ─── Common area objects (now using Kenney assets) ───────

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
    { key: 'loungeSofaCorner_SE', offsetX: -40, offsetY: 10 },
    { key: 'tableCoffee_SE', offsetX: 10, offsetY: 20, scale: 0.5 },
  ])
  return scene.add.graphics()
}

export function drawKitchenArea(scene: Phaser.Scene, sx: number, sy: number) {
  placeFurniture(scene, sx, sy, [
    { key: 'kitchenCabinet_SE', offsetX: 0, offsetY: 0 },
    { key: 'kitchenCoffeeMachine_SE', offsetX: 30, offsetY: -5, scale: 0.5 },
    { key: 'tableCoffeeSquare_SE', offsetX: -30, offsetY: 15, scale: 0.5 },
  ])
  return scene.add.graphics()
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

// ─── Keep walls (still Graphics-based) ───────────────────
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

// ─── Partition walls (keep Graphics) ─────────────────────
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
