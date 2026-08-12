# HH Goa 2026 Branding Assets

Place official assets here.

## Expected files:

### frame-overlay.png (REQUIRED for branded frame)
- Size: 1080x1080 px minimum, PNG with transparency
- This is the circular frame that wraps around the user's photo
- The center should be transparent/cutout so the user's photo shows through
- Replace the programmatic fallback frame with this file

### hh-goa-2026-logo.svg (OPTIONAL)
- Official HH Goa 2026 logo for UI use

### hh-goa-2026-mark.svg (OPTIONAL)
- Compact logo mark for small sizes

## Current state:
The application ships with a fully programmatic frame (canvas-drawn)
that renders the HH Goa 2026 branding without needing this PNG.

When frame-overlay.png is present, it will be used automatically.
When it's absent, the programmatic frame is used as fallback.

## How to replace:
1. Export your official frame as frame-overlay.png
2. Place it here: public/branding/frame-overlay.png
3. No code changes required