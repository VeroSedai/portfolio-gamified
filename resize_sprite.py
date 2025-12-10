from PIL import Image

input_path = "public/sprites/player_morpheus.png"
output_path = "public/sprites/player_morpheus.png"

try:
    with Image.open(input_path) as img:
        # Resize using Lanczos for high quality downsampling
        resized_img = img.resize((64, 64), Image.Resampling.LANCZOS)
        resized_img.save(output_path)
        print(f"Successfully resized {input_path} to 64x64 using Lanczos.")
except Exception as e:
    print(f"Error: {e}")
