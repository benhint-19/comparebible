#!/usr/bin/env python3
"""
Generate all store listing assets for Google Play and Apple App Store.

Google Play requires:
- App icon: 512x512 PNG
- Feature graphic: 1024x500 PNG
- TV Banner (optional): 1280x720

Apple App Store requires:
- App icon: 1024x1024 PNG (no transparency, no rounded corners)

Both:
- Various promotional images
"""

from PIL import Image, ImageDraw, ImageFont
import os

ASSETS_DIR = "/home/ben/projects/comparebible/assets/listing"
OUTPUT_DIR = "/home/ben/projects/comparebible/assets/listing/store"

# Brand colors
BG_LIGHT = (250, 248, 245)      # #FAF8F5
BG_DARK = (20, 20, 18)          # #141412
ACCENT = (122, 102, 82)         # #7A6652 (light theme accent)
ACCENT_LIGHT = (160, 139, 116)  # #A08B74 (dark theme accent)
TEXT_LIGHT = (44, 42, 38)       # #2C2A26
TEXT_DARK = (226, 224, 216)     # #E2E0D8
MUTED_DARK = (154, 154, 144)   # #9A9A90

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def draw_book_icon(draw, cx, cy, scale=1.0, color=ACCENT):
    """Draw the Selah book/pause-bar icon centered at (cx, cy)."""
    w = int(54 * scale)
    h = int(232 * scale)
    gap = int(56 * scale)
    r = int(6 * scale)

    # Left book
    lx = cx - gap // 2 - w
    ly = cy - h // 2
    draw.rounded_rectangle((lx, ly, lx + w, ly + h), radius=r, fill=color)

    # Spine highlight on left book
    spine_w = int(4 * scale)
    draw.rounded_rectangle(
        (lx + w - spine_w - int(4*scale), ly + int(4*scale),
         lx + w - int(4*scale), ly + h - int(4*scale)),
        radius=int(2*scale), fill=tuple(max(0, c - 20) for c in color)
    )

    # Page edges on left book
    page_y = ly + h - int(18*scale)
    draw.line(
        [(lx + int(8*scale), page_y), (lx + w - int(8*scale), page_y)],
        fill=(240, 236, 230), width=max(1, int(2*scale))
    )
    draw.line(
        [(lx + int(8*scale), page_y - int(4*scale)), (lx + w - int(8*scale), page_y - int(4*scale))],
        fill=(240, 236, 230, 128), width=max(1, int(1*scale))
    )

    # Cross on left book
    cross_cx = lx + w // 2
    cross_cy = ly + int(h * 0.4)
    cross_len = int(30 * scale)
    cross_w = max(1, int(2 * scale))
    cross_color = (240, 236, 230, 90)
    draw.line(
        [(cross_cx, cross_cy - cross_len//2), (cross_cx, cross_cy + cross_len//2)],
        fill=cross_color, width=cross_w
    )
    draw.line(
        [(cross_cx - cross_len//3, cross_cy - cross_len//6),
         (cross_cx + cross_len//3, cross_cy - cross_len//6)],
        fill=cross_color, width=cross_w
    )

    # Right book
    rx = cx + gap // 2
    draw.rounded_rectangle((rx, ly, rx + w, ly + h), radius=r, fill=color)

    # Spine on right book
    draw.rounded_rectangle(
        (rx + w - spine_w - int(4*scale), ly + int(4*scale),
         rx + w - int(4*scale), ly + h - int(4*scale)),
        radius=int(2*scale), fill=tuple(max(0, c - 20) for c in color)
    )

    # Page edges on right book
    draw.line(
        [(rx + int(8*scale), page_y), (rx + w - int(8*scale), page_y)],
        fill=(240, 236, 230), width=max(1, int(2*scale))
    )
    draw.line(
        [(rx + int(8*scale), page_y - int(4*scale)), (rx + w - int(8*scale), page_y - int(4*scale))],
        fill=(240, 236, 230, 128), width=max(1, int(1*scale))
    )

    # Cross on right book
    cross_cx = rx + w // 2
    draw.line(
        [(cross_cx, cross_cy - cross_len//2), (cross_cx, cross_cy + cross_len//2)],
        fill=cross_color, width=cross_w
    )
    draw.line(
        [(cross_cx - cross_len//3, cross_cy - cross_len//6),
         (cross_cx + cross_len//3, cross_cy - cross_len//6)],
        fill=cross_color, width=cross_w
    )


def generate_google_play_icon():
    """Google Play Store icon: 512x512 PNG, 32-bit, no alpha."""
    size = 512
    # Just use the existing icon
    src = Image.open(os.path.join(ASSETS_DIR, "icon-512.png")).convert("RGB")
    src = src.resize((size, size), Image.LANCZOS)
    out = os.path.join(OUTPUT_DIR, "google_play", "icon_512.png")
    src.save(out, "PNG")
    print(f"  {out}")


def generate_app_store_icon():
    """App Store icon: 1024x1024 PNG, no alpha, no rounded corners."""
    size = 1024
    src = Image.open(os.path.join(ASSETS_DIR, "icon-1024.png")).convert("RGB")
    src = src.resize((size, size), Image.LANCZOS)
    out = os.path.join(OUTPUT_DIR, "app_store", "icon_1024.png")
    src.save(out, "PNG")
    print(f"  {out}")


def generate_feature_graphic():
    """Google Play feature graphic: 1024x500 PNG."""
    w, h = 1024, 500
    img = Image.new("RGBA", (w, h), BG_DARK + (255,))
    draw = ImageDraw.Draw(img, "RGBA")

    # Subtle gradient at top
    for y in range(h):
        alpha = int(25 * (1 - y / h))
        draw.line([(0, y), (w, y)], fill=ACCENT_LIGHT + (alpha,))

    # Draw icon on left side
    draw_book_icon(draw, 260, 250, scale=0.8, color=ACCENT_LIGHT)

    # Text on right side
    try:
        font_title = ImageFont.truetype(FONT_BOLD, 64)
        font_sub = ImageFont.truetype(FONT_REGULAR, 28)
    except:
        font_title = ImageFont.load_default()
        font_sub = font_title

    text_x = 470
    draw.text((text_x, 150), "Selah", fill=TEXT_DARK, font=font_title)
    draw.text((text_x, 230), "Pause and reflect", fill=MUTED_DARK, font=font_sub)

    # Accent line
    draw.rounded_rectangle(
        (text_x, 280, text_x + 60, 284),
        radius=2, fill=ACCENT_LIGHT
    )

    # Tagline
    try:
        font_tag = ImageFont.truetype(FONT_REGULAR, 22)
    except:
        font_tag = font_sub
    draw.text((text_x, 300), "Compare translations. Explore AI perspectives.", fill=MUTED_DARK, font=font_tag)
    draw.text((text_x, 330), "Listen in audio mode. Take notes.", fill=MUTED_DARK, font=font_tag)

    final = Image.new("RGB", (w, h), BG_DARK)
    final.paste(img, (0, 0), img)
    out = os.path.join(OUTPUT_DIR, "google_play", "feature_graphic_1024x500.png")
    final.save(out, "PNG")
    print(f"  {out}")


def generate_tv_banner():
    """Google Play TV banner: 1280x720 PNG (optional but nice to have)."""
    w, h = 1280, 720
    img = Image.new("RGBA", (w, h), BG_DARK + (255,))
    draw = ImageDraw.Draw(img, "RGBA")

    for y in range(h):
        alpha = int(20 * (1 - y / h))
        draw.line([(0, y), (w, y)], fill=ACCENT_LIGHT + (alpha,))

    draw_book_icon(draw, 640, 300, scale=1.0, color=ACCENT_LIGHT)

    try:
        font_title = ImageFont.truetype(FONT_BOLD, 56)
        font_sub = ImageFont.truetype(FONT_REGULAR, 26)
    except:
        font_title = ImageFont.load_default()
        font_sub = font_title

    # Title below icon
    bbox = draw.textbbox((0, 0), "Selah", font=font_title)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) // 2, 470), "Selah", fill=TEXT_DARK, font=font_title)

    sub = "Pause and reflect"
    bbox = draw.textbbox((0, 0), sub, font=font_sub)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) // 2, 540), sub, fill=MUTED_DARK, font=font_sub)

    final = Image.new("RGB", (w, h), BG_DARK)
    final.paste(img, (0, 0), img)
    out = os.path.join(OUTPUT_DIR, "google_play", "tv_banner_1280x720.png")
    final.save(out, "PNG")
    print(f"  {out}")


def generate_promotional_images():
    """Various promotional/marketing images."""

    # Google Play promo graphic: 180x120 (legacy but some stores use it)
    w, h = 180, 120
    img = Image.new("RGB", (w, h), BG_LIGHT)
    draw = ImageDraw.Draw(img)
    # Simple centered icon
    draw_book_icon(draw, 90, 55, scale=0.2, color=ACCENT)
    try:
        font = ImageFont.truetype(FONT_BOLD, 14)
    except:
        font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), "Selah", font=font)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) // 2, 95), "Selah", fill=TEXT_LIGHT, font=font)
    out = os.path.join(OUTPUT_DIR, "google_play", "promo_180x120.png")
    img.save(out, "PNG")
    print(f"  {out}")

    # Web banner / social preview: 1200x630 (Open Graph size)
    w, h = 1200, 630
    img = Image.new("RGBA", (w, h), BG_DARK + (255,))
    draw = ImageDraw.Draw(img, "RGBA")

    for y in range(h):
        alpha = int(20 * (1 - y / h))
        draw.line([(0, y), (w, y)], fill=ACCENT_LIGHT + (alpha,))

    draw_book_icon(draw, 320, 315, scale=0.9, color=ACCENT_LIGHT)

    try:
        font_title = ImageFont.truetype(FONT_BOLD, 72)
        font_sub = ImageFont.truetype(FONT_REGULAR, 30)
        font_tag = ImageFont.truetype(FONT_REGULAR, 24)
    except:
        font_title = ImageFont.load_default()
        font_sub = font_title
        font_tag = font_title

    tx = 540
    draw.text((tx, 170), "Selah", fill=TEXT_DARK, font=font_title)
    draw.text((tx, 260), "Pause and reflect", fill=MUTED_DARK, font=font_sub)
    draw.rounded_rectangle((tx, 310, tx + 60, 314), radius=2, fill=ACCENT_LIGHT)
    draw.text((tx, 335), "Compare Bible translations side by side.", fill=MUTED_DARK, font=font_tag)
    draw.text((tx, 368), "Explore AI-powered scholarly perspectives.", fill=MUTED_DARK, font=font_tag)
    draw.text((tx, 401), "Listen in audio mode with voice commands.", fill=MUTED_DARK, font=font_tag)

    final = Image.new("RGB", (w, h), BG_DARK)
    final.paste(img, (0, 0), img)
    out = os.path.join(OUTPUT_DIR, "social_preview_1200x630.png")
    final.save(out, "PNG")
    print(f"  {out}")


def generate_adaptive_icons():
    """Android adaptive icon layers (foreground + background separately)."""
    # Foreground: 432x432 with icon centered in safe zone (66dp inset = 108px at xxxhdpi)
    fg_size = 432
    fg = Image.new("RGBA", (fg_size, fg_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(fg, "RGBA")
    draw_book_icon(draw, fg_size // 2, fg_size // 2, scale=0.55, color=ACCENT)
    out = os.path.join(OUTPUT_DIR, "adaptive_icon_foreground_432.png")
    fg.save(out, "PNG")
    print(f"  {out}")

    # Background: solid color
    bg = Image.new("RGB", (432, 432), BG_LIGHT)
    out = os.path.join(OUTPUT_DIR, "adaptive_icon_background_432.png")
    bg.save(out, "PNG")
    print(f"  {out}")


def generate_notification_icons():
    """Small notification icons for Android (white silhouette on transparent)."""
    for size in [24, 36, 48, 72, 96]:
        img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img, "RGBA")
        # Simple pause bars in white
        scale = size / 96
        bar_w = int(16 * scale)
        bar_h = int(56 * scale)
        gap = int(12 * scale)
        r = max(1, int(3 * scale))
        cx, cy = size // 2, size // 2

        lx = cx - gap // 2 - bar_w
        ly = cy - bar_h // 2
        draw.rounded_rectangle((lx, ly, lx + bar_w, ly + bar_h), radius=r, fill=(255, 255, 255, 255))

        rx = cx + gap // 2
        draw.rounded_rectangle((rx, ly, rx + bar_w, ly + bar_h), radius=r, fill=(255, 255, 255, 255))

        out = os.path.join(OUTPUT_DIR, "notification_icons", f"ic_notification_{size}.png")
        img.save(out, "PNG")
        print(f"  {out}")


def main():
    os.makedirs(os.path.join(OUTPUT_DIR, "google_play"), exist_ok=True)
    os.makedirs(os.path.join(OUTPUT_DIR, "app_store"), exist_ok=True)
    os.makedirs(os.path.join(OUTPUT_DIR, "notification_icons"), exist_ok=True)

    print("Google Play icon (512x512)...")
    generate_google_play_icon()

    print("\nApp Store icon (1024x1024)...")
    generate_app_store_icon()

    print("\nFeature graphic (1024x500)...")
    generate_feature_graphic()

    print("\nTV banner (1280x720)...")
    generate_tv_banner()

    print("\nPromotional images...")
    generate_promotional_images()

    print("\nAdaptive icon layers...")
    generate_adaptive_icons()

    print("\nNotification icons...")
    generate_notification_icons()

    print("\n=== All assets generated! ===")
    print(f"\nFiles are in: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
