from pathlib import Path
import subprocess

from PIL import Image, ImageEnhance, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "source-jpg"
OUTPUT = ROOT / "column-ocr"
TESSERACT = Path(r"C:\Program Files\NAPS2\lib\_win64\tesseract.exe")
TESSDATA = ROOT / "tessdata"


def prepare_crop(image: Image.Image, left: bool) -> Image.Image:
    width, height = image.size
    gutter = width // 2
    x0 = 55 if left else gutter - 28
    x1 = gutter + 28 if left else width - 55
    crop = image.crop((x0, 130, x1, height - 95)).convert("L")
    crop = ImageOps.autocontrast(crop, cutoff=1)
    crop = ImageEnhance.Contrast(crop).enhance(1.25)
    crop = crop.filter(ImageFilter.SHARPEN)
    return crop


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for page_number in range(2, 29):
        source_path = SOURCE / f"page-{page_number:02d}.jpg"
        image = Image.open(source_path)
        for side, is_left in (("left", True), ("right", False)):
            crop_path = OUTPUT / f"page-{page_number:02d}-{side}.png"
            output_base = crop_path.with_suffix("")
            prepare_crop(image, is_left).save(crop_path, optimize=True)
            subprocess.run(
                [
                    str(TESSERACT),
                    str(crop_path),
                    str(output_base),
                    "--tessdata-dir",
                    str(TESSDATA),
                    "-l",
                    "eng",
                    "--psm",
                    "6",
                    "-c",
                    "preserve_interword_spaces=1",
                ],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )


if __name__ == "__main__":
    main()
