
from typing import List
import numpy as np
from PIL import Image


def combine_images(input_path, image_name: str, output_path):
    image = Image.open(f"{input_path}{image_name}.png").convert("RGBA")

    width, height = image.size

    array = np.array(image)
    row_num = 4
    rows = np.split(array, row_num)

    swapped_rows = np.concatenate([rows[0], rows[2], rows[1], rows[3]], axis=0)

    new_image = Image.fromarray(swapped_rows)
    new_image = new_image.convert("RGBA")
    new_image.save(f"{output_path}{image_name}_swapped.png")




if __name__ == "__main__":
    # Ask for input and output paths
    input_path = "frontend/src/utils/"  # Replace with your input path
    image_name = "maggot"

    # Generate output paths
    # output_path = "frontend/src/assets/imgs/fruits.png"  # Replace with your output path
    output_path = "frontend/src/utils/"

    combine_images(input_path, image_name, output_path)
    