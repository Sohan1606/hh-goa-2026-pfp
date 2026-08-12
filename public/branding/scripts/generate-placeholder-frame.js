// Run with: node scripts/generate-placeholder-frame.js
// Requires: npm install canvas (optional, for pre-generating)
// This script documents what the frame PNG should look like.
// The app generates the frame programmatically at runtime — this is just for reference.

console.log(`
HH Goa 2026 Frame Asset Requirements
=====================================

File: public/branding/frame-overlay.png
Dimensions: 1080 x 1080 px
Format: PNG with alpha transparency

The frame should:
- Have a circular outer ring design
- Center area should be TRANSPARENT (for user photo)
- The ring should contain "HACKER HOUSE GOA" text arc at the top
- "2026 • BUILD IN PARADISE" text arc at the bottom  
- Orange (#FF6B35) gradient accent stripe
- Dark (#0a0a0a) background ring
- Small HH mark at bottom

The programmatic fallback in lib/canvas.ts renders this design
automatically when no PNG is present.

To create the PNG:
1. Use Figma / Illustrator / Photoshop
2. Design a 1080x1080 artboard
3. Circular frame ring with transparent center
4. Export as PNG-24 with transparency
5. Place at public/branding/frame-overlay.png
`);