import numpy as np

# Create a 2x2 image with RGBA channels
# m = np.array([
#     [[255, 105, 180, 255], [75, 10, 134, 200]],     # Hot Pink (opaque), Indigo (semi-transparent)
#     [[55, 123, 222, 128], [231, 165, 123, 255]]       # Cyan (semi-transparent), Orange (opaque)
# ], dtype=np.uint8)

# print(m)
# print(m[0:2,0]>=180)
# print(m[:,:,3]>0)


# rows=5
# cols=3
# for r, c in [(r, c) for r in range(rows) for c in range(cols)]:
#     print(r, c)



m = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
print(m)

print([n for r in m for n in r])