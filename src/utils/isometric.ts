/**
 * Isometric coordinate conversion utilities
 */

export interface IsoPoint {
  x: number
  y: number
}

export interface ScreenPoint {
  x: number
  y: number
}

const TILE_WIDTH = 64
const TILE_HEIGHT = 32
const OFFSET_X = 640
const OFFSET_Y = 100

/**
 * Convert isometric (grid) coordinates to screen coordinates
 */
export function isoToScreen(isoX: number, isoY: number): ScreenPoint {
  return {
    x: (isoX - isoY) * (TILE_WIDTH / 2) + OFFSET_X,
    y: (isoX + isoY) * (TILE_HEIGHT / 2) + OFFSET_Y
  }
}

/**
 * Convert screen coordinates to isometric (grid) coordinates
 */
export function screenToIso(screenX: number, screenY: number): IsoPoint {
  const x = screenX - OFFSET_X
  const y = screenY - OFFSET_Y
  
  const isoX = (x / (TILE_WIDTH / 2) + y / (TILE_HEIGHT / 2)) / 2
  const isoY = (y / (TILE_HEIGHT / 2) - x / (TILE_WIDTH / 2)) / 2
  
  return { x: isoX, y: isoY }
}

/**
 * Calculate distance between two isometric points
 */
export function isoDistance(p1: IsoPoint, p2: IsoPoint): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}
