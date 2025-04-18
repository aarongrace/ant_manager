import numpy as np
from PIL import Image

rows = 6
cols = 38

def stretch_objects(obj_array: np.ndarray, scale_factor: float) -> np.ndarray:
    """
    Stretch the objects in the array by a given scale factor.
    """
    stretched_array = np.empty((rows, cols, int(obj_array.shape[2] * scale_factor), int(obj_array.shape[3] * scale_factor), 4), dtype=np.uint8)
    for r in range(rows):
        for c in range(cols):
            obj = obj_array[r][c]
            # Resize each object
            img = Image.fromarray(obj)
            new_size = (int(obj.shape[1] * scale_factor), int(obj.shape[0] * scale_factor))
            # img = img.resize(new_size, Image.LANCZOS)
            r_img, g_img, b_img, a_img = img.split()
            r_resized = r_img.resize(new_size, Image.LANCZOS)
            g_resized = g_img.resize(new_size, Image.LANCZOS)
            b_resized = b_img.resize(new_size, Image.LANCZOS)
            a_resized = a_img.resize(new_size, Image.NEAREST)
            img = Image.merge("RGBA", (r_resized, g_resized, b_resized, a_resized))
            stretched_array[r][c] = np.array(img)
    return stretched_array

def get_darker_color(color, factor=0.7):
    """Create a darker version of the given color."""
    if len(color) == 4:  # RGBA
        r, g, b, a = color
        return (int(r * factor), int(g * factor), int(b * factor), a)
    else:  # RGB
        r, g, b = color
        return (int(r * factor), int(g * factor), int(b * factor))

def create_image_with_boundaries(obj_ndarray:np.ndarray, name="f.png"):
    """Create a single image with all objects and add a 1px white boundary between them."""
    # Calculate the size of the new image with boundaries

    print(obj_ndarray.shape)
    
    obj_width, obj_height, _  = obj_ndarray[0][0].shape
    new_width = cols * obj_width + (cols + 1)  # Add 1px boundary between columns
    new_height = rows * obj_height + (rows + 1)  # Add 1px boundary between rows
    boundary_color=(255, 255, 255, 255)
    # Create a new blank image with a white background
    combined_image = Image.new("RGBA", (new_width, new_height), boundary_color)

    # Paste each object into the new image with a 1px boundary
    for c in range(cols):
        for r in range(rows):
            temp_obj = Image.fromarray(obj_ndarray[r][c])
            x_offset = c * obj_width + (c + 1)  # Add 1px boundary
            y_offset = r * obj_height + (r + 1)  # Add 1px boundary
            combined_image.paste(temp_obj, (x_offset, y_offset))

    # Show the combined image
    combined_image.save(name)
    return combined_image

def find_objects(image):
    """Find all distinct objects in the sprite sheet."""
    width, height = image.size
    obj_width = width // cols
    obj_height = height // rows
    img_data = np.array(image)

    objects = []
    
    for r, c in [(r, c) for r in range(rows) for c in range(cols)]:
        temp_obj = img_data[r * obj_height:(r + 1) * obj_height , c * obj_width :(c + 1)* obj_width ]
        objects.append(temp_obj)
    
    
    obj_array = np.array(objects)
    obj_array = obj_array.reshape(rows, cols, obj_width, obj_height, 4)
    
    # Create and show the combined image with boundaries
    create_image_with_boundaries(obj_array, "init_test.png")
    return obj_array

def add_outlines_with_padding(image_path, output_path, padding=1, darkness_factor=0.7):
    """Add 1px outlines to all objects in the sprite sheet with padding."""
    # Load the image
    img = Image.open(image_path)
    img = img.convert("RGBA")
    width, height = img.size
    obj_width = width // cols
    obj_height = height // rows

    obj_array = find_objects(img)
    print("Object array shape:", obj_array.shape)
    combined_obj_image = create_image_with_boundaries(obj_array, "init_test.png")

    scale_factor = 2
    obj_array = stretch_objects(obj_array, scale_factor)
    width, height = (width * scale_factor, height * scale_factor)
    obj_width = int(obj_width * scale_factor)
    obj_height = int(obj_height * scale_factor)
    combined_stretched_image = create_image_with_boundaries(obj_array, "stretched_test.png")


    new_obj_width = obj_width + 2 * padding
    new_obj_height = obj_height + 2 * padding
    new_width = cols * new_obj_width
    new_height = rows * new_obj_height
    
    # Find all objects


    changed_array = np.empty((rows, cols, obj_width+padding*2, obj_height+padding*2,4), dtype=np.uint8)
   
    # For each object, find its border pixels and determine dominant color
    for r in range(rows):
        for c in range(cols):
            # Extract the current object
            object = obj_array[r, c]
            
            # Extract non-transparent pixels of the current object
            obj_pixels = [(x, y) for x in range(obj_width) for y in range(obj_height) 
                          if object[y, x, 3] > 0]  # Check alpha channel for transparency
            
            # Calculate average color of the object
            colors = [object[y, x] for x, y in obj_pixels]
            r_sum, g_sum, b_sum, a_sum = 0, 0, 0, 0
            count = 0
            
            for color in colors:
                if len(color) == 4 and color[3] > 0:  # Only consider non-transparent pixels
                    r_sum += int(color[0])  # Cast to int to prevent overflow
                    g_sum += int(color[1])
                    b_sum += int(color[2])
                    a_sum += int(color[3])
                    count += 1
            
            if count == 0:
                continue  # Skip empty objects
                
            avg_color = (r_sum // count, g_sum // count, b_sum // count, 255)
            outline_color = get_darker_color(avg_color, darkness_factor)
            
            # Create a padded object with the outline
            padded_object = np.zeros((new_obj_width,new_obj_height, 4), dtype=np.uint8)
            padded_object[padding:padding + obj_height, padding:padding + obj_width] = object
            
            # Find border pixels (pixels that have at least one transparent neighbor)
            border_pixels = set()
            directions = [(0, 1), (1, 0), (0, -1), (-1, 0), 
                          (1, 1), (1, -1), (-1, 1), (-1, -1)]
            
            for x, y in obj_pixels:
                for dx, dy in directions:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < obj_width and 0 <= ny < obj_height:
                        if object[ny, nx, 3] == 0:  # Transparent pixel
                            border_pixels.add((x + padding, y + padding))
            
            # Apply the outline
            for x, y in border_pixels:
                padded_object[y, x] = outline_color
            
            # Save the padded object back to the array
            changed_array[r, c] = padded_object

    combined_image_with_boundaries = create_image_with_boundaries(changed_array, "final_test_with_bounds.png")




    combined_image = Image.new("RGBA", (new_width, new_height), (0, 0, 0, 0))
    for c in range(cols):
        for r in range(rows):
            temp_obj = Image.fromarray(changed_array[r][c])
            x_offset = c * new_obj_width
            y_offset = r * new_obj_height
            combined_image.paste(temp_obj, (x_offset, y_offset))
    combined_image = combined_image.convert("RGBA")
    # combined_image.save("final_test.png")
    # combined_image.save("final_test.png")

    combined_image.save(output_path)

def create_hover_version(image_path, output_path, brightness_factor=1.2):
    """
    Create a hover version of the combined image by increasing brightness.
    """
    # Load the image
    img = Image.open(image_path).convert("RGBA")
    img_data = np.array(img)

    # Apply brightness adjustment
    hover_data = np.clip(img_data[:, :, :3] * brightness_factor, 0, 255).astype(np.uint8)
    hover_image = Image.fromarray(np.dstack((hover_data, img_data[:, :, 3])))

    # Save the hover version
    hover_image.save(output_path)
    print(f"Hover version saved as {output_path}")


if __name__ == "__main__":
    # Ask for input and output paths
    input_path = "frontend/src/assets/imgs/fruitsOriginal.png"  # Replace with your input path
    
    # Generate output paths
    output_path = "frontend/src/assets/imgs/fruits.png"  # Replace with your output path
    hover_output_path = "frontend/src/assets/imgs/fruits_hovered.png"  # Hover version output path
    
    # Generate the outlined image
    add_outlines_with_padding(input_path, output_path, padding=1, darkness_factor=0.3)
    
    # Generate the hover version
    create_hover_version(output_path, hover_output_path, brightness_factor=1.3)