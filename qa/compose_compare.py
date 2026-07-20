from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
QA = ROOT / "qa"
REFERENCE = Image.open(ROOT / "design-reference" / "option-3.png").convert("RGB")


def fit(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    return ImageOps.fit(image.convert("RGB"), size, method=Image.Resampling.LANCZOS)


hero_crop_height = round(REFERENCE.width * 1013 / 1425)
reference_hero = REFERENCE.crop((0, 0, REFERENCE.width, hero_crop_height))
implementation_hero = Image.open(QA / "v2-desktop-hero.png")

hero_size = (1200, 853)
hero_compare = Image.new("RGB", (hero_size[0] * 2 + 24, hero_size[1]), "#050505")
hero_compare.paste(fit(reference_hero, hero_size), (0, 0))
hero_compare.paste(fit(implementation_hero, hero_size), (hero_size[0] + 24, 0))
hero_compare.save(QA / "compare-hero.png", quality=95)

section_specs = [
    ("v2-desktop-hero.png", 370),
    ("v2-desktop-about.png", 420),
    ("v2-desktop-outcomes.png", 250),
    ("v2-desktop-projects.png", 410),
    ("v2-desktop-advantages.png", 320),
    ("v2-desktop-contact.png", 397),
]

implementation_strip = Image.new("RGB", (725, REFERENCE.height), "#050505")
y = 0
for filename, height in section_specs:
    image = Image.open(QA / filename)
    crop = fit(image, (725, height))
    implementation_strip.paste(crop, (0, y))
    y += height

full_compare = Image.new("RGB", (REFERENCE.width * 2 + 24, REFERENCE.height), "#050505")
full_compare.paste(REFERENCE, (0, 0))
full_compare.paste(implementation_strip, (REFERENCE.width + 24, 0))
full_compare.save(QA / "compare-full.png", quality=95)
