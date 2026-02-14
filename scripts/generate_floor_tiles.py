#!/usr/bin/env python3
"""Generate basic isometric floor tiles for Tiled map"""

from PIL import Image, ImageDraw

def create_isometric_tile(width, height, color, outline_color=None):
    """Create a single isometric tile"""
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Isometric diamond shape
    points = [
        (width // 2, 0),           # top
        (width, height // 2),      # right
        (width // 2, height),      # bottom
        (0, height // 2)           # left
    ]
    
    # Fill
    draw.polygon(points, fill=color)
    
    # Outline
    if outline_color:
        draw.polygon(points, outline=outline_color)
    
    return img

def create_tileset():
    """Create a tileset with floor tiles"""
    tile_width = 64
    tile_height = 32
    
    # Basic floor colors (office-themed)
    tiles = [
        ('floor_light', (240, 240, 245, 255), (200, 200, 210, 255)),  # Light gray
        ('floor_dark', (200, 200, 210, 255), (160, 160, 170, 255)),   # Dark gray
        ('floor_wood', (205, 170, 125, 255), (165, 130, 85, 255)),    # Wood
        ('floor_carpet', (180, 190, 200, 255), (140, 150, 160, 255)), # Carpet
    ]
    
    # Create individual tiles
    for name, color, outline in tiles:
        tile = create_isometric_tile(tile_width, tile_height, color, outline)
        tile.save(f'../public/tilesets/{name}.png')
        print(f'Created {name}.png')
    
    # Create a tileset spritesheet (4 tiles in a row)
    tileset = Image.new('RGBA', (tile_width * 4, tile_height), (0, 0, 0, 0))
    for i, (name, color, outline) in enumerate(tiles):
        tile = create_isometric_tile(tile_width, tile_height, color, outline)
        tileset.paste(tile, (i * tile_width, 0), tile)
    
    tileset.save('../public/tilesets/office-tileset.png')
    print('Created office-tileset.png (spritesheet)')

if __name__ == '__main__':
    create_tileset()
