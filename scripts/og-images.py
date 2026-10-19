"""Share pictures for link previews (WhatsApp, Facebook, X...): 1200x630 JPEGs
in public/og, one per event plus the home page. Each puts the event's card
illustration (the same picture as on the home page) on a light background,
so nothing is cropped off; the home picture is the logo on the site's navy. Run again after changing an illustration:

    python3 scripts/og-images.py
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CARDS = ROOT / "src/images/Events/Card Illustration"
BRAMMAM = ROOT / "src/Components/events/brammam/intro/images"
OUT = ROOT / "public/og"
W, H = 1200, 630
NAVY = ((4, 24, 47), (2, 16, 36))
PAPER = ((253, 251, 246), (243, 237, 224))

SOURCES = {
    "home": ROOT / "public/logo.png",
    "thaipongal": CARDS / "pongal.webp",
    "thamilaruvi": CARDS / "tamilaruvi.webp",
    "vani-villa": CARDS / "vanivila.webp",
    "aramiyam": CARDS / "aramiyamintro.png",
    "blood-donation": CARDS / "blooddonation.png",
    "brammam": CARDS / "brammam.png",
    "food-festival": CARDS / "foodfestival.png",
    "ideathon": CARDS / "ideathon.png",
    "jeevanathi": CARDS / "jeevanathi.png",
    "kovil": CARDS / "kovil.png",
    "movie-night": CARDS / "movienight.png",
    "ppl": CARDS / "ppl.png",
    "sotkanai": CARDS / "sotkanai.png",
    "brammam-eluthoviyam": BRAMMAM / "eluthoviyam.png",
    "brammam-olisuvadu": BRAMMAM / "oli_suvadu.png",
    "brammam-meerigai": BRAMMAM / "meerigai.png",
    "brammam-solalvalar": BRAMMAM / "solvalar.png",
}


def background(colors):
    top, bottom = colors
    bg = Image.new("RGB", (W, H))
    for y in range(H):
        t = y / (H - 1)
        bg.paste(tuple(round(a + (b - a) * t) for a, b in zip(top, bottom)), (0, y, W, y + 1))
    return bg


def make(name, src):
    art = Image.open(src).convert("RGBA")
    box_w, box_h = (420, 420) if name == "home" else (W - 120, H - 80)
    art.thumbnail((box_w, box_h), Image.LANCZOS)
    bg = background(NAVY if name == "home" else PAPER)
    bg.paste(art, ((W - art.width) // 2, (H - art.height) // 2), art)
    bg.save(OUT / f"{name}.jpg", "JPEG", quality=86, optimize=True, progressive=True)


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    for name, src in SOURCES.items():
        make(name, src)
        print(f"public/og/{name}.jpg")
