import json
from PIL import Image
import numpy as np

img_path = "frontend/src/utils/tiles.png"
image = Image.open(img_path)
width, height = image.size

tile_size = 16
tiles = []

for row in range(height // tile_size):
    tile_row = []
    for col in range(width // tile_size):
        tile = []
        for y in range(tile_size):
            pixel_row = []
            for x in range(tile_size):
                pixel = image.getpixel((col * tile_size + x, row * tile_size + y))
                r, g, b, _ = pixel
                pixel_row.append((r, g, b))
            tile.append(pixel_row)
        tile_row.append(tile)
    tiles.append(tile_row)
print(tiles)

output_path = "frontend/src/utils/tileData.ts"
with open(output_path, "w") as f:
    f.write("export const tileData = ")
    json.dump(tiles, f)
    f.write(";")

