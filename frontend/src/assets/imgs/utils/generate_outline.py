import numpy as np
from PIL import Image
import os
from collections import deque

def get_darker_color(color, factor=0.7):
    """Create a darker version of the given color."""
    if len(color) == 4:  # RGBA
        r, g, b, a = color
        return (int(r * factor), int(g * factor), int(b * factor), a)
    else:  # RGB
        r, g, b = color
        return (int(r * factor), int(g * factor), int(b * factor))

def find_objects(image):
    """Find all distinct objects in the sprite sheet."""
    width, height = image.size
    img_data = np.array(image)
    
    # Create a mask for non-transparent pixels
    if image.mode == 'RGBA':
        mask = img_data[:, :, 3] > 0  # Alpha > 0
    else:
        # For RGB images, assume white (255,255,255) is the background
        mask = ~np.all(img_data == [255, 255, 255], axis=2)
    
    # Label connected components (objects)
    visited = np.zeros_like(mask, dtype=bool)
    objects = []
    
    # BFS to find connected components
    directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]
    
    for y in range(height):
        for x in range(width):
            if mask[y, x] and not visited[y, x]:
                # Found a new object
                obj_pixels = []
                queue = deque([(x, y)])
                visited[y, x] = True
                
                while queue:
                    cx, cy = queue.popleft()
                    obj_pixels.append((cx, cy))
                    
                    for dx, dy in directions:
                        nx, ny = cx + dx, cy + dy
                        if (0 <= nx < width and 0 <= ny < height and 
                            mask[ny, nx] and not visited[ny, nx]):
                            visited[ny, nx] = True
                            queue.append((nx, ny))
                
                objects.append(obj_pixels)
    
    return objects

def add_outlines_with_padding(image_path, output_path, padding=1, darkness_factor=0.7):
    """Add 1px outlines to all objects in the sprite sheet with padding."""
    # Load the image
    img = Image.open(image_path)
    img = img.convert("RGBA")
    width, height = img.size
    
    # Create a new image with padding
    new_width = width + 2 * padding
    new_height = height + 2 * padding
    padded_img = Image.new("RGBA", (new_width, new_height), (0, 0, 0, 0))
    
    # Paste the original image in the center of the padded image
    padded_img.paste(img, (padding, padding))
    
    # Create a copy for the output
    output_img = padded_img.copy()
    pixels = output_img.load()
    
    # Find all objects
    objects = find_objects(padded_img)
    print(f"Found {len(objects)} objects in the sprite sheet")
    
    # For each object, find its border pixels and determine dominant color
    for obj_index, obj_pixels in enumerate(objects):
        # Calculate average color of the object
        colors = [padded_img.getpixel((x, y)) for x, y in obj_pixels]
        r_sum, g_sum, b_sum, a_sum = 0, 0, 0, 0
        count = 0
        
        for color in colors:
            if len(color) == 4 and color[3] > 0:  # Only consider non-transparent pixels
                r_sum += color[0]
                g_sum += color[1]
                b_sum += color[2]
                a_sum += color[3]
                count += 1
        
        if count == 0:
            continue  # Skip empty objects
            
        avg_color = (r_sum // count, g_sum // count, b_sum // count, 255)
        outline_color = get_darker_color(avg_color, darkness_factor)
        
        # Find border pixels (pixels that have at least one transparent neighbor)
        border_pixels = set()
        directions = [(0, 1), (1, 0), (0, -1), (-1, 0), 
                      (1, 1), (1, -1), (-1, 1), (-1, -1)]
        
        for x, y in obj_pixels:
            for dx, dy in directions:
                nx, ny = x + dx, y + dy
                # Check if neighbor is outside the object or transparent
                if (nx, ny) not in obj_pixels and 0 <= nx < new_width and 0 <= ny < new_height:
                    if padded_img.getpixel((nx, ny))[3] == 0:  # Transparent pixel
                        border_pixels.add((nx, ny))
        
        # Apply the outline
        for x, y in border_pixels:
            pixels[x, y] = outline_color
    
    # Save the result
    output_img.save(output_path)
    print(f"Saved outlined sprite sheet to {output_path}")


if __name__ == "__main__":
    # Ask for input and output paths
    input_path = "fruits.png"  # Replace with your input path
    
    # Generate output path
    filename, ext = os.path.splitext(input_path)
    output_path = f"{filename}_outlined{ext}"
    
    # Darkness factor (0-1), lower = darker
    darkness_factor = 0.2
    
    add_outlines_with_padding(input_path, output_path, padding=1, darkness_factor=0.5)