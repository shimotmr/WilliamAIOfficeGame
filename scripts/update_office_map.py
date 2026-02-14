#!/usr/bin/env python3
"""
更新 office.json 使用新的 Kenney tileset
並建立更美觀的辦公室佈局
"""
import json
import os

def create_enhanced_floor_data():
    """建立美化的地板資料（26x26）"""
    # Tile 索引（基於生成的 tileset）:
    # 1=wood_light, 2=wood_dark, 3=carpet_red, 4=carpet_blue, 
    # 5=carpet_green, 6=tile_white, 7=tile_gray, 8=concrete
    
    floor = [[1 for _ in range(26)] for _ in range(26)]  # 預設淺木地板
    
    # 外圍走廊用灰色瓷磚
    for y in range(26):
        for x in range(26):
            if y < 3 or y > 22 or x < 3 or x > 22:
                floor[y][x] = 7  # tile_gray
    
    # 主要辦公區域用淺木地板（預設已設定）
    
    # Travis 區域 (row 7-10, col 5-8) - 深木地板 + 紅地毯重點
    for y in range(7, 11):
        for x in range(5, 9):
            floor[y][x] = 2  # wood_dark
    floor[8][6] = 3  # carpet_red 中心
    floor[8][7] = 3
    floor[9][6] = 3
    floor[9][7] = 3
    
    # Researcher 區域 (row 7-10, col 11-14) - 淺木地板 + 藍地毯
    for y in range(8, 10):
        for x in range(11, 15):
            floor[y][x] = 4  # carpet_blue
    
    # Inspector 區域 (row 7-10, col 17-20) - 白瓷磚專業感
    for y in range(7, 11):
        for x in range(17, 21):
            floor[y][x] = 6  # tile_white
    
    # Secretary 區域 (row 12-15, col 5-8) - 綠地毯舒適感
    for y in range(12, 16):
        for x in range(5, 9):
            floor[y][x] = 5  # carpet_green
    
    # Coder 區域 (row 12-15, col 11-14) - 混凝土工業風
    for y in range(12, 16):
        for x in range(11, 15):
            floor[y][x] = 8  # concrete
    
    # Writer 區域 (row 12-15, col 17-20) - 深木地板
    for y in range(12, 16):
        for x in range(17, 21):
            floor[y][x] = 2  # wood_dark
    
    # Designer + Analyst 區域 (row 17-20, col 5-8 和 11-14) - 淺木 + 灰瓷磚混搭
    for y in range(17, 21):
        for x in range(5, 9):
            floor[y][x] = 1  # wood_light
        for x in range(11, 15):
            floor[y][x] = 7  # tile_gray
    
    # 走道（水平 row 11, 16）用淺瓷磚
    for x in range(3, 23):
        floor[11][x] = 6  # tile_white
        floor[16][x] = 6
    
    # 走道（垂直 col 9, 15）
    for y in range(3, 23):
        floor[y][9] = 6  # tile_white
        floor[y][15] = 6
    
    # 轉換成一維陣列
    return [tile for row in floor for tile in row]

def create_wall_data():
    """建立牆壁資料"""
    # 9=wall_office (在 tileset 中的索引 +1)
    walls = [[0 for _ in range(26)] for _ in range(26)]
    
    # 外牆
    for x in range(26):
        walls[0][x] = 9  # 上牆
        walls[25][x] = 9  # 下牆
    for y in range(26):
        walls[y][0] = 9  # 左牆
        walls[y][25] = 9  # 右牆
    
    # 內部區域分隔牆（低矮隔板）
    # 水平分隔
    for x in range(4, 10):
        walls[6][x] = 9
        walls[16][x] = 9
    for x in range(16, 22):
        walls[6][x] = 9
    
    # 垂直分隔
    for y in range(7, 11):
        walls[y][10] = 9
        walls[y][16] = 9
    
    # 轉換成一維陣列
    return [tile for row in walls for tile in row]

def update_map():
    """更新地圖檔案"""
    map_path = os.path.expanduser('~/clawd/WilliamAIOfficeGame/public/maps/office.json')
    
    with open(map_path, 'r') as f:
        map_data = json.load(f)
    
    # 更新 tileset 參照
    map_data['tilesets'][0] = {
        "columns": 4,
        "firstgid": 1,
        "image": "../tilesets/kenney/kenney-tileset.png",
        "imageheight": 192,  # 3 rows * 64px (max tile height)
        "imagewidth": 256,   # 4 columns * 64px
        "margin": 0,
        "name": "kenney-tiles",
        "spacing": 0,
        "tilecount": 11,
        "tileheight": 64,  # 最大高度（牆壁）
        "tilewidth": 64
    }
    
    # 更新地板層
    map_data['layers'][0]['data'] = create_enhanced_floor_data()
    
    # 更新牆壁層
    map_data['layers'][1]['data'] = create_wall_data()
    
    # 儲存
    with open(map_path, 'w') as f:
        json.dump(map_data, f, indent=2)
    
    print(f"✓ 已更新地圖: {map_path}")
    print("  - 更新 tileset 為 kenney-tileset.png")
    print("  - 美化地板（8 種材質混搭）")
    print("  - 加入辦公室隔板牆壁")

if __name__ == '__main__':
    update_map()
