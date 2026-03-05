#!/usr/bin/env python3
"""
Generate framed app store screenshots for Google Play and Apple App Store.

Google Play: 1242x2688 (or similar 9:19.5 ratio)
App Store (6.7" iPhone 15 Pro Max): 1290x2796
App Store (6.5" iPhone): 1284x2778

We'll generate:
- Google Play: 1242x2688  (phone frame + background + text)
- App Store:   1290x2796  (phone frame + background + text)
"""

from PIL import Image, ImageDraw, ImageFont
import os

SCREENSHOTS_DIR = "/home/ben/projects/comparebible/assets/listing/screenshots"
OUTPUT_DIR = "/home/ben/projects/comparebible/assets/listing/store"

# Brand colors
BG_COLOR = (20, 20, 18)        # Dark background matching app theme
ACCENT_COLOR = (160, 139, 116)  # #A08B74 - app accent
TEXT_COLOR = (226, 224, 216)     # #E2E0D8 - light text
SUBTEXT_COLOR = (154, 154, 144)  # #9A9A90 - muted text
PHONE_BEZEL = (40, 40, 36)      # Dark bezel color

# Font paths
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

# Screenshots to use with captions
SCREENSHOTS = [
    ("Screenshot_20260304-131214.png", "Read Scripture", "Clean, distraction-free reading"),
    ("Screenshot_20260304-140057.png", "Compare Translations", "See how different scholars\ninterpret the same verse"),
    ("Screenshot_20260304-140453.png", "Notes & Highlights", "Save your reflections\non any verse"),
    ("Screenshot_20260304-140119.png", "AI Perspectives", "Explore passages through\nmultiple scholarly lenses"),
    ("Screenshot_20260304-140402.png", "Choose Perspectives", "Pick from 11 scholarly\nviewpoints for AI analysis"),
    ("Screenshot_20260304-140310.png", "Audio Mode", "Listen to chapters read aloud\nwith voice commands"),
    ("Screenshot_20260304-140336.png", "Translation Quiz", "Find the perfect translations\nfor your reading style"),
    ("Screenshot_20260304-140351.png", "Translation Presets", "Curated groupings from\nliteral to paraphrase"),
]

# Store specs: (width, height, phone_screen_w, phone_screen_h, corner_radius, bezel_width)
STORES = {
    "google_play": {
        "canvas": (1242, 2688),
        "phone_w": 900,
        "phone_h": 1960,
        "corner": 56,
        "bezel": 14,
        "notch": "pill",  # Android style
    },
    "app_store_6_7": {
        "canvas": (1284, 2778),
        "phone_w": 920,
        "phone_h": 2000,
        "corner": 60,
        "bezel": 14,
        "notch": "island",  # Dynamic island - 6.7" (iPhone 15 Pro Max)
    },
    "app_store_6_5": {
        "canvas": (1242, 2688),
        "phone_w": 900,
        "phone_h": 1960,
        "corner": 56,
        "bezel": 14,
        "notch": "island",  # 6.5" (iPhone 11 Pro Max)
    },
}


def draw_rounded_rect(draw, xy, radius, fill=None, outline=None, width=1):
    """Draw a rounded rectangle."""
    x1, y1, x2, y2 = xy
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def draw_phone_frame(canvas, draw, screenshot_img, x, y, phone_w, phone_h, corner, bezel, notch_style):
    """Draw a phone mockup with the screenshot inside."""
    # Outer phone body (bezel)
    outer_x1 = x
    outer_y1 = y
    outer_x2 = x + phone_w
    outer_y2 = y + phone_h

    # Draw phone shadow
    shadow_offset = 8
    draw.rounded_rectangle(
        (outer_x1 + shadow_offset, outer_y1 + shadow_offset,
         outer_x2 + shadow_offset, outer_y2 + shadow_offset),
        radius=corner + 4,
        fill=(0, 0, 0, 80),
    )

    # Phone body
    draw.rounded_rectangle(
        (outer_x1, outer_y1, outer_x2, outer_y2),
        radius=corner + 4,
        fill=PHONE_BEZEL,
    )

    # Screen area (inside bezel)
    screen_x1 = outer_x1 + bezel
    screen_y1 = outer_y1 + bezel
    screen_x2 = outer_x2 - bezel
    screen_y2 = outer_y2 - bezel
    screen_w = screen_x2 - screen_x1
    screen_h = screen_y2 - screen_y1

    # Resize screenshot to fit screen
    resized = screenshot_img.resize((screen_w, screen_h), Image.LANCZOS)

    # Create rounded mask for screen
    mask = Image.new("L", (screen_w, screen_h), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle(
        (0, 0, screen_w - 1, screen_h - 1),
        radius=corner,
        fill=255,
    )

    # Paste screenshot with rounded corners
    canvas.paste(resized, (screen_x1, screen_y1), mask)

    # Draw notch/dynamic island
    if notch_style == "island":
        # Dynamic Island - centered pill at top
        island_w = 120
        island_h = 36
        island_x = x + (phone_w - island_w) // 2
        island_y = screen_y1 + 12
        draw.rounded_rectangle(
            (island_x, island_y, island_x + island_w, island_y + island_h),
            radius=island_h // 2,
            fill=(10, 10, 10),
        )
    elif notch_style == "pill":
        # Android - small centered pill/camera
        pill_w = 60
        pill_h = 8
        pill_x = x + (phone_w - pill_w) // 2
        pill_y = screen_y1 + 10
        draw.rounded_rectangle(
            (pill_x, pill_y, pill_x + pill_w, pill_y + pill_h),
            radius=pill_h // 2,
            fill=(10, 10, 10),
        )

    # Bottom bar indicator
    bar_w = 140
    bar_h = 5
    bar_x = x + (phone_w - bar_w) // 2
    bar_y = screen_y2 - 20
    draw.rounded_rectangle(
        (bar_x, bar_y, bar_x + bar_w, bar_y + bar_h),
        radius=bar_h // 2,
        fill=(200, 200, 200, 100),
    )


def generate_screenshot(screenshot_file, title, subtitle, store_name, store_config, index):
    """Generate a single framed screenshot."""
    cw, ch = store_config["canvas"]
    phone_w = store_config["phone_w"]
    phone_h = store_config["phone_h"]
    corner = store_config["corner"]
    bezel = store_config["bezel"]
    notch = store_config["notch"]

    # Create canvas with RGBA for shadow transparency
    canvas = Image.new("RGBA", (cw, ch), BG_COLOR + (255,))
    draw = ImageDraw.Draw(canvas, "RGBA")

    # Add subtle gradient overlay at top
    for y_pos in range(400):
        alpha = int(30 * (1 - y_pos / 400))
        draw.line([(0, y_pos), (cw, y_pos)], fill=ACCENT_COLOR + (alpha,))

    # Load fonts
    try:
        font_title = ImageFont.truetype(FONT_BOLD, 62)
        font_sub = ImageFont.truetype(FONT_REGULAR, 36)
    except Exception:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()

    # Text area at top
    text_y = 120
    # Title
    bbox = draw.textbbox((0, 0), title, font=font_title)
    tw = bbox[2] - bbox[0]
    draw.text(((cw - tw) // 2, text_y), title, fill=TEXT_COLOR, font=font_title)

    # Subtitle
    text_y += 90
    for line in subtitle.split("\n"):
        bbox = draw.textbbox((0, 0), line, font=font_sub)
        tw = bbox[2] - bbox[0]
        draw.text(((cw - tw) // 2, text_y), line, fill=SUBTEXT_COLOR, font=font_sub)
        text_y += 48

    # Position phone centered, below text
    phone_x = (cw - phone_w) // 2
    phone_y = text_y + 60

    # If phone goes off screen, that's fine - it creates a nice effect
    # Load and draw screenshot
    screenshot_path = os.path.join(SCREENSHOTS_DIR, screenshot_file)
    screenshot = Image.open(screenshot_path).convert("RGBA")

    draw_phone_frame(canvas, draw, screenshot, phone_x, phone_y,
                     phone_w, phone_h, corner, bezel, notch)

    # Add thin accent line under text
    line_y = text_y + 30
    line_w = 80
    draw.rounded_rectangle(
        ((cw - line_w) // 2, line_y, (cw + line_w) // 2, line_y + 4),
        radius=2,
        fill=ACCENT_COLOR,
    )

    # Convert to RGB for final output
    final = Image.new("RGB", (cw, ch), BG_COLOR)
    final.paste(canvas, (0, 0), canvas)

    # Save
    out_dir = os.path.join(OUTPUT_DIR, store_name)
    os.makedirs(out_dir, exist_ok=True)
    filename = f"{index + 1:02d}_{title.lower().replace(' ', '_')}.png"
    out_path = os.path.join(out_dir, filename)
    final.save(out_path, "PNG", optimize=True)
    print(f"  Saved: {out_path}")
    return out_path


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for store_name, store_config in STORES.items():
        print(f"\nGenerating {store_name} screenshots...")
        for i, (file, title, subtitle) in enumerate(SCREENSHOTS):
            generate_screenshot(file, title, subtitle, store_name, store_config, i)

    print("\nDone!")


if __name__ == "__main__":
    main()
