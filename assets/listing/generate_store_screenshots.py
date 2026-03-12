#!/usr/bin/env python3
"""
Generate framed app store screenshots for Google Play and Apple App Store.

Each screenshot is wrapped in a realistic phone/tablet mockup with:
- Feature callout annotations (arrows, highlight boxes, labels)
- Title and subtitle text above the device
- Subtle gradient backgrounds matching the app brand

Google Play: 1242x2688 (or similar 9:19.5 ratio)
App Store (6.7" iPhone 15 Pro Max): 1290x2796
App Store (6.5" iPhone): 1284x2778
App Store (13" iPad): 2048x2732
"""

from PIL import Image, ImageDraw, ImageFont
import os
import math

SCREENSHOTS_DIR = "/home/ben/projects/comparebible/assets/listing/screenshots"
OUTPUT_DIR = "/home/ben/projects/comparebible/assets/listing/store"

# Brand colors
BG_COLOR = (20, 20, 18)        # Dark background matching app theme
ACCENT_COLOR = (160, 139, 116)  # #A08B74 - app accent
TEXT_COLOR = (226, 224, 216)     # #E2E0D8 - light text
SUBTEXT_COLOR = (154, 154, 144)  # #9A9A90 - muted text
PHONE_BEZEL = (40, 40, 36)      # Dark bezel color
CALLOUT_BG = (160, 139, 116, 200)    # Accent with transparency
CALLOUT_TEXT = (255, 255, 255)         # White text for callouts
HIGHLIGHT_BORDER = (160, 139, 116, 180)  # Accent border for highlights

# Font paths
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

# Screenshots with captions and feature callout annotations
# Each callout is (relative_x%, relative_y%, label, arrow_direction)
# arrow_direction: "left", "right", "up", "down" — which side the callout points FROM
SCREENSHOTS = [
    {
        "file": "Screenshot_20260304-131214.png",
        "title": "Read Scripture",
        "subtitle": "Clean, distraction-free\nBible reading",
        "callouts": [
            (0.15, 0.03, "Book Picker", "down"),
            (0.70, 0.03, "Search, Audio,\nNotes, Settings", "down"),
            (0.50, 0.07, "OT / NT Toggle", "down"),
        ],
    },
    {
        "file": "Screenshot_20260304-140057.png",
        "title": "Compare Translations",
        "subtitle": "Tap any verse to see\nparallel translations",
        "callouts": [
            (0.50, 0.40, "NIV, ESV, KJV\nside by side", "left"),
            (0.50, 0.73, "AI Analysis button", "left"),
            (0.50, 0.78, "Add personal note", "left"),
        ],
    },
    {
        "file": "Screenshot_20260304-140453.png",
        "title": "Notes & Highlights",
        "subtitle": "Save your reflections\non any verse",
        "callouts": [
            (0.12, 0.08, "Note indicator dot", "down"),
            (0.50, 0.57, "Your saved note\nwith edit & delete", "left"),
            (0.50, 0.52, "AI Analysis\navailable here too", "right"),
        ],
    },
    {
        "file": "Screenshot_20260304-140119.png",
        "title": "AI Perspectives",
        "subtitle": "14 scholarly viewpoints\non any passage",
        "callouts": [
            (0.30, 0.15, "Tap a perspective\nto generate analysis", "down"),
            (0.50, 0.55, "Combined Analysis\nfrom all 6 at once", "up"),
        ],
    },
    {
        "file": "Screenshot_20260304-140402.png",
        "title": "Choose Perspectives",
        "subtitle": "Pick up to 6 AI scholars\nfor your study",
        "callouts": [
            (0.50, 0.10, "14 perspectives:\ntheologians, historians,\nphilosophers & more", "down"),
            (0.50, 0.92, "6 / 6 selected", "up"),
        ],
    },
    {
        "file": "Screenshot_20260304-140310.png",
        "title": "Audio Mode",
        "subtitle": "Listen hands-free with\nvoice commands",
        "callouts": [
            (0.50, 0.66, "Voice command\nquick reference", "down"),
            (0.50, 0.93, "Start Listening\nto begin", "up"),
        ],
    },
    {
        "file": "Screenshot_20260304-140336.png",
        "title": "Translation Quiz",
        "subtitle": "Find the perfect translations\nfor your reading style",
        "callouts": [
            (0.50, 0.47, "Quick quiz matches\nyour preferences", "down"),
            (0.50, 0.35, "Progress tracker", "down"),
        ],
    },
    {
        "file": "Screenshot_20260304-140351.png",
        "title": "Translation Presets",
        "subtitle": "Curated groupings from\nliteral to paraphrase",
        "callouts": [
            (0.50, 0.20, "One-tap preset\nsets your parallels", "down"),
            (0.50, 0.45, "Each translation\nexplained", "left"),
        ],
    },
]

# Store specs
STORES = {
    "google_play": {
        "canvas": (1242, 2688),
        "phone_w": 900,
        "phone_h": 1960,
        "corner": 56,
        "bezel": 14,
        "notch": "pill",
    },
    "app_store_6_7": {
        "canvas": (1284, 2778),
        "phone_w": 920,
        "phone_h": 2000,
        "corner": 60,
        "bezel": 14,
        "notch": "island",
    },
    "app_store_6_5": {
        "canvas": (1242, 2688),
        "phone_w": 900,
        "phone_h": 1960,
        "corner": 56,
        "bezel": 14,
        "notch": "island",
    },
    "app_store_ipad_13": {
        "canvas": (2048, 2732),
        "phone_w": 1500,
        "phone_h": 2100,
        "corner": 40,
        "bezel": 16,
        "notch": "none",
    },
}


def draw_phone_frame(canvas, draw, screenshot_img, x, y, phone_w, phone_h, corner, bezel, notch_style):
    """Draw a realistic phone mockup with the screenshot inside."""
    outer_x1, outer_y1 = x, y
    outer_x2, outer_y2 = x + phone_w, y + phone_h

    # Multi-layer shadow for depth
    for i in range(3):
        offset = 6 + i * 4
        alpha = 60 - i * 15
        draw.rounded_rectangle(
            (outer_x1 + offset, outer_y1 + offset,
             outer_x2 + offset, outer_y2 + offset),
            radius=corner + 6,
            fill=(0, 0, 0, max(alpha, 10)),
        )

    # Phone body - slight gradient effect via two layers
    draw.rounded_rectangle(
        (outer_x1 - 1, outer_y1 - 1, outer_x2 + 1, outer_y2 + 1),
        radius=corner + 5,
        fill=(60, 58, 54),  # Subtle edge highlight
    )
    draw.rounded_rectangle(
        (outer_x1, outer_y1, outer_x2, outer_y2),
        radius=corner + 4,
        fill=PHONE_BEZEL,
    )

    # Screen area
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

    canvas.paste(resized, (screen_x1, screen_y1), mask)

    # Side buttons (volume, power)
    if notch_style != "none":  # Not iPad
        # Power button (right side)
        btn_x = outer_x2 + 1
        btn_y = outer_y1 + phone_h // 4
        draw.rounded_rectangle(
            (btn_x, btn_y, btn_x + 4, btn_y + 80),
            radius=2,
            fill=(55, 53, 49),
        )
        # Volume buttons (left side)
        for offset in [0, 60]:
            btn_x = outer_x1 - 5
            btn_y = outer_y1 + phone_h // 5 + offset
            draw.rounded_rectangle(
                (btn_x, btn_y, btn_x + 4, btn_y + 45),
                radius=2,
                fill=(55, 53, 49),
            )

    # Notch / Dynamic Island
    if notch_style == "island":
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

    return screen_x1, screen_y1, screen_w, screen_h


def draw_callout(draw, text, cx, cy, arrow_dir, font, canvas_w, canvas_h):
    """Draw a callout label with rounded background and pointer arrow."""
    padding_x = 16
    padding_y = 10
    arrow_len = 20

    # Measure text
    lines = text.split("\n")
    line_heights = []
    max_w = 0
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        lw = bbox[2] - bbox[0]
        lh = bbox[3] - bbox[1]
        line_heights.append(lh)
        max_w = max(max_w, lw)

    line_spacing = 4
    total_h = sum(line_heights) + line_spacing * (len(lines) - 1)
    box_w = max_w + padding_x * 2
    box_h = total_h + padding_y * 2

    # Position box based on arrow direction
    if arrow_dir == "down":
        box_x = cx - box_w // 2
        box_y = cy - box_h - arrow_len
    elif arrow_dir == "up":
        box_x = cx - box_w // 2
        box_y = cy + arrow_len
    elif arrow_dir == "left":
        box_x = cx + arrow_len
        box_y = cy - box_h // 2
    elif arrow_dir == "right":
        box_x = cx - box_w - arrow_len
        box_y = cy - box_h // 2
    else:
        box_x = cx - box_w // 2
        box_y = cy - box_h - arrow_len

    # Clamp to canvas
    box_x = max(10, min(box_x, canvas_w - box_w - 10))
    box_y = max(10, min(box_y, canvas_h - box_h - 10))

    # Draw callout background
    draw.rounded_rectangle(
        (box_x, box_y, box_x + box_w, box_y + box_h),
        radius=12,
        fill=CALLOUT_BG,
    )

    # Draw arrow triangle
    mid_x = box_x + box_w // 2
    mid_y = box_y + box_h // 2
    arrow_size = 10

    if arrow_dir == "down":
        tip_x, tip_y = mid_x, box_y + box_h + arrow_len - 4
        draw.polygon([
            (mid_x - arrow_size, box_y + box_h - 1),
            (mid_x + arrow_size, box_y + box_h - 1),
            (tip_x, tip_y),
        ], fill=CALLOUT_BG)
    elif arrow_dir == "up":
        tip_x, tip_y = mid_x, box_y - arrow_len + 4
        draw.polygon([
            (mid_x - arrow_size, box_y + 1),
            (mid_x + arrow_size, box_y + 1),
            (tip_x, tip_y),
        ], fill=CALLOUT_BG)
    elif arrow_dir == "left":
        tip_x, tip_y = box_x - arrow_len + 4, mid_y
        draw.polygon([
            (box_x + 1, mid_y - arrow_size),
            (box_x + 1, mid_y + arrow_size),
            (tip_x, tip_y),
        ], fill=CALLOUT_BG)
    elif arrow_dir == "right":
        tip_x, tip_y = box_x + box_w + arrow_len - 4, mid_y
        draw.polygon([
            (box_x + box_w - 1, mid_y - arrow_size),
            (box_x + box_w - 1, mid_y + arrow_size),
            (tip_x, tip_y),
        ], fill=CALLOUT_BG)

    # Draw text
    text_y = box_y + padding_y
    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font)
        lw = bbox[2] - bbox[0]
        text_x = box_x + (box_w - lw) // 2
        draw.text((text_x, text_y), line, fill=CALLOUT_TEXT, font=font)
        text_y += line_heights[i] + line_spacing


def generate_screenshot(screenshot_info, store_name, store_config, index):
    """Generate a single framed screenshot with callout annotations."""
    file = screenshot_info["file"]
    title = screenshot_info["title"]
    subtitle = screenshot_info["subtitle"]
    callouts = screenshot_info.get("callouts", [])

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
    for y_pos in range(500):
        alpha = int(35 * (1 - y_pos / 500))
        draw.line([(0, y_pos), (cw, y_pos)], fill=ACCENT_COLOR + (alpha,))

    # Add subtle gradient at bottom too
    for y_pos in range(300):
        alpha = int(20 * (1 - y_pos / 300))
        draw.line([(0, ch - y_pos), (cw, ch - y_pos)], fill=ACCENT_COLOR + (alpha,))

    # Load fonts
    try:
        font_title = ImageFont.truetype(FONT_BOLD, 64)
        font_sub = ImageFont.truetype(FONT_REGULAR, 36)
        font_callout = ImageFont.truetype(FONT_BOLD, 24)
    except Exception:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_callout = ImageFont.load_default()

    # Title text at top
    text_y = 100
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

    # Accent line under text
    line_y = text_y + 20
    line_w = 80
    draw.rounded_rectangle(
        ((cw - line_w) // 2, line_y, (cw + line_w) // 2, line_y + 4),
        radius=2,
        fill=ACCENT_COLOR,
    )

    # Position phone centered, below text
    phone_x = (cw - phone_w) // 2
    phone_y = line_y + 40

    # Load screenshot
    screenshot_path = os.path.join(SCREENSHOTS_DIR, file)
    screenshot = Image.open(screenshot_path).convert("RGBA")

    # Draw phone frame and get screen coordinates
    screen_x, screen_y, screen_w, screen_h = draw_phone_frame(
        canvas, draw, screenshot, phone_x, phone_y,
        phone_w, phone_h, corner, bezel, notch
    )

    # Draw callout annotations
    for (rel_x, rel_y, label, arrow_dir) in callouts:
        # Convert relative coordinates to absolute (relative to screen area)
        abs_x = screen_x + int(rel_x * screen_w)
        abs_y = screen_y + int(rel_y * screen_h)
        draw_callout(draw, label, abs_x, abs_y, arrow_dir, font_callout, cw, ch)

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
        for i, screenshot_info in enumerate(SCREENSHOTS):
            generate_screenshot(screenshot_info, store_name, store_config, i)

    print("\nDone!")


if __name__ == "__main__":
    main()
