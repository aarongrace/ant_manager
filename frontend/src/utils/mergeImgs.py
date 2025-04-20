
from typing import List
import numpy as np
from PIL import Image


    # combined_image = Image.new("RGBA", (new_width, new_height), (0, 0, 0, 0))
    # for c in range(cols):
    #     for r in range(rows):
    #         temp_obj = Image.fromarray(changed_array[r][c])
    #         x_offset = c * new_obj_width
    #         y_offset = r * new_obj_height
    #         combined_image.paste(temp_obj, (x_offset, y_offset))
    # combined_image = combined_image.convert("RGBA")
    # # combined_image.save("final_test.png")
    # # combined_image.save("final_test.png")

    # combined_image.save(output_path)

def combine_images(input_path, image_names: List[List[str]], output_path):
    for names in image_names:
        images = [Image.open(f"{input_path}{name}.png").convert("RGBA") for name in names]

        # Get the dimensions of the first image
        width, height = images[0].size

        # Create a new image with the same dimensions
        combined_image: Image = Image.new("RGBA", (width * 2, height), (0, 0, 0, 0))

        combined_image.paste(images[0], (0, 0))
        combined_image.paste(images[1], (width, 0))

        same_char_index = 0
        for i in range(names[0].__len__()):
            if names[0][i] == names[1][i]:
                same_char_index += 1
            else:
                break
        first_part_of_name = names[0][:same_char_index]
        print("first_part_of_name: ", first_part_of_name)


        # Save the combined image
        combined_image.save(f"{output_path}{first_part_of_name.lower()}.png")

if __name__ == "__main__":
    # Ask for input and output paths
    input_path = "frontend/src/utils/"  # Replace with your input path
    image_names = [["MaggotWalk", "MaggotSpit", ],["MantisMove", "MantisAttack"], ["BeetleMove", "BeetleAttack"]]

    # Generate output paths
    # output_path = "frontend/src/assets/imgs/fruits.png"  # Replace with your output path
    output_path = "frontend/src/utils/"

    combine_images(input_path, image_names, output_path)
    