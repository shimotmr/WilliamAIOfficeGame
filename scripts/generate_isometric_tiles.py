#!/usr/bin/env python3
"""
生成等軸測辦公室場景素材
- 木地板、地毯、瓷磚
- 牆壁（磚紋、辦公室隔板）
- 門、窗等裝飾
"""
from PIL import Image, ImageDraw
import random
import os

# 等軸測標準尺寸
TILE_WIDTH = 64
TILE_HEIGHT = 32

def create_isometric_tile(width, height, fill_color, border_color=None):
    """建立等軸測菱形 tile 基底"""
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 等軸測菱形座標
    points = [
        (width // 2, 0),           # 上
        (width, height // 2),       # 右
        (width // 2, height),       # 下
        (0, height // 2)            # 左
    ]
    
    draw.polygon(points, fill=fill_color)
    
    if border_color:
        draw.polygon(points, outline=border_color)
    
    return img

def add_wood_texture(img, base_color):
    """加入木紋效果"""
    pixels = img.load()
    width, height = img.size
    
    for y in range(height):
        for x in range(width):
            if pixels[x, y][3] > 0:  # 非透明像素
                # 隨機噪點模擬木紋
                noise = random.randint(-15, 15)
                r = max(0, min(255, base_color[0] + noise))
                g = max(0, min(255, base_color[1] + noise))
                b = max(0, min(255, base_color[2] + noise))
                pixels[x, y] = (r, g, b, 255)
    
    return img

def add_carpet_border(img, border_width=2):
    """加入地毯邊框紋理"""
    draw = ImageDraw.Draw(img)
    width, height = img.size
    
    # 等軸測菱形邊框
    points = [
        (width // 2, 0),
        (width, height // 2),
        (width // 2, height),
        (0, height // 2)
    ]
    
    for i in range(border_width):
        draw.polygon(points, outline=(100, 80, 60, 255))
    
    return img

def add_tile_lines(img):
    """加入瓷磚接縫線"""
    draw = ImageDraw.Draw(img)
    width, height = img.size
    
    # 灰色接縫線
    line_color = (180, 180, 180, 255)
    
    # 畫出菱形邊線
    points = [
        (width // 2, 0),
        (width, height // 2),
        (width // 2, height),
        (0, height // 2),
        (width // 2, 0)
    ]
    
    draw.line(points, fill=line_color, width=1)
    
    return img

def create_wall_tile(wall_type='office'):
    """建立牆壁 tile"""
    # 牆壁高度是地板的 2 倍
    img = Image.new('RGBA', (TILE_WIDTH, TILE_HEIGHT * 2), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    if wall_type == 'office':
        # 辦公室隔板效果
        base_color = (220, 220, 230)
        
        # 畫牆面
        points = [
            (TILE_WIDTH // 2, 0),
            (TILE_WIDTH, TILE_HEIGHT),
            (TILE_WIDTH, TILE_HEIGHT * 2),
            (TILE_WIDTH // 2, TILE_HEIGHT * 1.5),
            (0, TILE_HEIGHT * 2),
            (0, TILE_HEIGHT)
        ]
        draw.polygon(points, fill=base_color, outline=(180, 180, 190))
        
        # 加入橫向線條模擬隔板
        for i in range(4):
            y = TILE_HEIGHT + i * 8
            draw.line([(0, y), (TILE_WIDTH, y)], fill=(200, 200, 210), width=1)
    
    elif wall_type == 'brick':
        # 磚牆效果
        base_color = (180, 140, 120)
        draw.rectangle([0, 0, TILE_WIDTH, TILE_HEIGHT * 2], fill=base_color)
        
        # 畫磚塊紋理
        brick_color = (160, 120, 100)
        for row in range(8):
            y = row * 8
            offset = 16 if row % 2 == 0 else 0
            for col in range(3):
                x = col * 24 + offset
                if x < TILE_WIDTH:
                    draw.rectangle([x, y, x + 20, y + 6], outline=brick_color)
    
    return img

def create_door_tile():
    """建立門 tile"""
    img = Image.new('RGBA', (TILE_WIDTH, TILE_HEIGHT * 2), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 門框
    door_color = (139, 90, 60)
    points = [
        (TILE_WIDTH // 2 - 10, TILE_HEIGHT // 2),
        (TILE_WIDTH // 2 + 10, TILE_HEIGHT // 2),
        (TILE_WIDTH // 2 + 10, TILE_HEIGHT * 1.5),
        (TILE_WIDTH // 2 - 10, TILE_HEIGHT * 1.5)
    ]
    draw.polygon(points, fill=door_color, outline=(100, 60, 40))
    
    # 門把
    handle_pos = (TILE_WIDTH // 2 + 5, TILE_HEIGHT)
    draw.ellipse([handle_pos[0]-2, handle_pos[1]-2, handle_pos[0]+2, handle_pos[1]+2], 
                 fill=(255, 215, 0))
    
    return img

def generate_tileset():
    """生成完整的 tileset spritesheet"""
    
    # 地板素材定義
    floor_tiles = [
        ('wood_light', (205, 170, 125)),
        ('wood_dark', (139, 90, 60)),
        ('carpet_red', (180, 60, 60)),
        ('carpet_blue', (60, 100, 180)),
        ('carpet_green', (80, 140, 80)),
        ('tile_white', (240, 240, 245)),
        ('tile_gray', (200, 200, 200)),
        ('concrete', (150, 150, 150)),
    ]
    
    # 建立各種地板 tiles
    tiles = []
    
    for name, color in floor_tiles:
        tile = create_isometric_tile(TILE_WIDTH, TILE_HEIGHT, color, (0, 0, 0))
        
        if 'wood' in name:
            tile = add_wood_texture(tile, color)
        elif 'carpet' in name:
            tile = add_carpet_border(tile)
        elif 'tile' in name:
            tile = add_tile_lines(tile)
        
        tiles.append((name, tile))
    
    # 加入牆壁和裝飾
    tiles.append(('wall_office', create_wall_tile('office')))
    tiles.append(('wall_brick', create_wall_tile('brick')))
    tiles.append(('door', create_door_tile()))
    
    # 拼成 spritesheet（4 列排列）
    tiles_per_row = 4
    rows = (len(tiles) + tiles_per_row - 1) // tiles_per_row
    
    # 計算最大高度（因為牆壁是 2 倍高）
    max_height = TILE_HEIGHT * 2
    
    spritesheet_width = TILE_WIDTH * tiles_per_row
    spritesheet_height = max_height * rows
    
    spritesheet = Image.new('RGBA', (spritesheet_width, spritesheet_height), (0, 0, 0, 0))
    
    for idx, (name, tile) in enumerate(tiles):
        row = idx // tiles_per_row
        col = idx % tiles_per_row
        x = col * TILE_WIDTH
        y = row * max_height
        
        spritesheet.paste(tile, (x, y), tile)
    
    return spritesheet, tiles

def main():
    output_dir = os.path.expanduser('~/clawd/WilliamAIOfficeGame/public/tilesets/kenney')
    os.makedirs(output_dir, exist_ok=True)
    
    print("生成等軸測素材...")
    spritesheet, tiles = generate_tileset()
    
    output_path = os.path.join(output_dir, 'kenney-tileset.png')
    spritesheet.save(output_path)
    print(f"✓ 已儲存 spritesheet: {output_path}")
    print(f"  尺寸: {spritesheet.size}")
    print(f"  包含 {len(tiles)} 個 tiles")
    
    # 輸出 tile 索引
    print("\nTile 索引:")
    for idx, (name, tile) in enumerate(tiles):
        row = idx // 4
        col = idx % 4
        print(f"  {idx:2d}. {name:15s} - 位置: ({col}, {row})")

if __name__ == '__main__':
    main()
