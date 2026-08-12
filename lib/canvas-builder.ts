import { ImagePosition } from "@/types/image";
import { BuilderDetails, TeamMember } from "@/types/builder";
import { drawFallbackFrame } from "@/lib/canvas";

export const BUILDER_ID_WIDTH = 1080;
export const BUILDER_ID_HEIGHT = 1350;
export const TEAM_SIZE = 1200;

const FONT_STACK = 'Inter, "Helvetica Neue", Arial, system-ui, sans-serif';
const FONT_MONO = '"JetBrains Mono", "Courier New", monospace';

// ============================================================
// BUILDER ID CARD
// ============================================================

export async function renderBuilderIdCard(opts: {
  image: HTMLImageElement;
  position: ImagePosition;
  frameImage: HTMLImageElement | null;
  details: BuilderDetails;
}): Promise<Blob> {
  const { image, position, frameImage, details } = opts;
  const W = BUILDER_ID_WIDTH;
  const H = BUILDER_ID_HEIGHT;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Canvas context failed");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  drawBuilderBackground(ctx, W, H);
  drawBuilderHeader(ctx, W);

  const photoSize = 620;
  const photoX = W / 2 - photoSize / 2;
  const photoY = 220;
  drawFramedPortrait(ctx, {
    image,
    position,
    frameImage,
    x: photoX,
    y: photoY,
    size: photoSize,
  });

  drawBuilderDetails(ctx, {
    name: details.name || "UNNAMED BUILDER",
    builderClass: details.builderClass,
    stack: details.stack || "—",
    x: W / 2,
    y: photoY + photoSize + 60,
    maxWidth: W - 120,
  });

  drawBuilderFooter(ctx, W, H);

  return blobFromCanvas(canvas);
}

function drawBuilderBackground(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number
): void {
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, W, H);

  const g1 = ctx.createRadialGradient(W * 0.15, H * 0.1, 0, W * 0.15, H * 0.1, W * 0.6);
  g1.addColorStop(0, "rgba(255,107,53,0.10)");
  g1.addColorStop(1, "rgba(255,107,53,0)");
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, W, H);

  const g2 = ctx.createRadialGradient(W * 0.85, H * 0.9, 0, W * 0.85, H * 0.9, W * 0.5);
  g2.addColorStop(0, "rgba(255,209,102,0.06)");
  g2.addColorStop(1, "rgba(255,209,102,0)");
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(255,255,255,0.04)";
  const step = 40;
  for (let y = step; y < H; y += step) {
    for (let x = step; x < W; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 30, W - 60, H - 60);

  drawCornerTicks(ctx, 30, 30, W - 60, H - 60, "#FF6B35");
}

function drawCornerTicks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
): void {
  const t = 24;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  const corners = [
    [x, y, x + t, y, x, y + t],
    [x + w, y, x + w - t, y, x + w, y + t],
    [x, y + h, x + t, y + h, x, y + h - t],
    [x + w, y + h, x + w - t, y + h, x + w, y + h - t],
  ];
  corners.forEach(([cx, cy, hx, hy, vx, vy]) => {
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(vx, vy);
    ctx.stroke();
  });
}

function drawBuilderHeader(ctx: CanvasRenderingContext2D, W: number): void {
  const cx = W / 2;

  ctx.font = `600 22px ${FONT_STACK}`;
  ctx.fillStyle = "#FF8C42";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("//  HACKER HOUSE GOA  //  2026  //", cx, 80);

  ctx.font = `900 68px ${FONT_STACK}`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText("BUILDER  ID", cx, 118);

  ctx.fillStyle = "#FF6B35";
  ctx.fillRect(cx - 60, 200, 120, 4);
}

function drawFramedPortrait(
  ctx: CanvasRenderingContext2D,
  opts: {
    image: HTMLImageElement;
    position: ImagePosition;
    frameImage: HTMLImageElement | null;
    x: number;
    y: number;
    size: number;
  }
): void {
  const { image, position, frameImage, x, y, size } = opts;
  const cx = x + size / 2;
  const cy = y + size / 2;

  ctx.save();
  const ringWidth = size * 0.075;
  const clipR = size / 2 - ringWidth * 0.9;
  ctx.beginPath();
  ctx.arc(cx, cy, clipR, 0, Math.PI * 2);
  ctx.clip();

  const iw = image.naturalWidth;
  const ih = image.naturalHeight;
  const baseScale = Math.max(size / iw, size / ih);
  const finalScale = baseScale * position.scale;
  const drawW = iw * finalScale;
  const drawH = ih * finalScale;
  const offsetX = x + (size - drawW) / 2 + position.x * size;
  const offsetY = y + (size - drawH) / 2 + position.y * size;
  ctx.drawImage(image, offsetX, offsetY, drawW, drawH);
  ctx.restore();

  ctx.save();
  ctx.translate(x, y);
  if (frameImage) {
    ctx.drawImage(frameImage, 0, 0, size, size);
  } else {
    drawFallbackFrame(ctx, size);
  }
  ctx.restore();
}

function drawBuilderDetails(
  ctx: CanvasRenderingContext2D,
  opts: {
    name: string;
    builderClass: string;
    stack: string;
    x: number;
    y: number;
    maxWidth: number;
  }
): void {
  const { name, builderClass, stack, x, y, maxWidth } = opts;

  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  ctx.font = `900 56px ${FONT_STACK}`;
  ctx.fillStyle = "#ffffff";
  const nameUpper = name.toUpperCase();
  ctx.fillText(fitText(ctx, nameUpper, maxWidth), x, y);

  const classY = y + 80;
  drawClassBadge(ctx, builderClass, x, classY);

  const stackLabelY = classY + 88;
  ctx.font = `600 20px ${FONT_STACK}`;
  ctx.fillStyle = "#71717a";
  ctx.fillText("STACK", x, stackLabelY);

  ctx.font = `500 30px ${FONT_STACK}`;
  ctx.fillStyle = "#e4e4e7";
  ctx.fillText(fitText(ctx, stack, maxWidth), x, stackLabelY + 32);
}

function drawClassBadge(
  ctx: CanvasRenderingContext2D,
  cls: string,
  cx: number,
  cy: number
): void {
  ctx.font = `800 26px ${FONT_STACK}`;
  const paddingX = 26;
  const paddingY = 14;
  const metrics = ctx.measureText(cls);
  const w = metrics.width + paddingX * 2;
  const h = 26 + paddingY * 2;

  const x = cx - w / 2;
  const y = cy - h / 2 + 20;

  ctx.fillStyle = "rgba(255,107,53,0.12)";
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill();

  ctx.strokeStyle = "#FF6B35";
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 8);
  ctx.stroke();

  ctx.fillStyle = "#FF8C42";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(cls, cx, y + h / 2);
}

function drawBuilderFooter(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number
): void {
  const cx = W / 2;
  const bottomY = H - 90;

  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, bottomY - 30);
  ctx.lineTo(W - 80, bottomY - 30);
  ctx.stroke();

  ctx.font = `800 20px ${FONT_STACK}`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("HH GOA 2026", 80, bottomY);

  ctx.fillStyle = "#FF8C42";
  ctx.textAlign = "right";
  ctx.fillText("#FrameInGoa", W - 80, bottomY);

  const code = generateVisualId();
  ctx.font = `500 16px ${FONT_MONO}`;
  ctx.fillStyle = "#52525b";
  ctx.textAlign = "center";
  ctx.fillText(code, cx, bottomY + 30);
}

function generateVisualId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "HHG-";
  for (let i = 0; i < 4; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  out += "-";
  for (let i = 0; i < 4; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  out += " · 2026";
  return out;
}

// ============================================================
// TEAM MODE
// ============================================================

export async function renderTeamCard(opts: {
  members: TeamMember[];
  frameImage: HTMLImageElement | null;
}): Promise<Blob> {
  const { members, frameImage } = opts;
  const W = TEAM_SIZE;
  const H = TEAM_SIZE;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Canvas context failed");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  drawBuilderBackground(ctx, W, H);
  drawTeamHeader(ctx, W, members.length);

  const positions = teamLayoutPositions(members.length, W, H);

  members.forEach((m, i) => {
    const pos = positions[i];
    if (!pos || !m.image) return;
    drawTeamMember(ctx, m, pos, frameImage);
  });

  drawTeamFooter(ctx, W, H);

  return blobFromCanvas(canvas);
}

interface TeamPos {
  x: number;
  y: number;
  photoSize: number;
  labelWidth: number;
}

/**
 * Team layout positions.
 * Available vertical space: from y=230 (below header) to y=1050 (above footer)
 * = 820 px working area, centered around y=640
 */
function teamLayoutPositions(n: number, W: number, H: number): TeamPos[] {
  const cx = W / 2;
  const contentTop = 240;
  const contentBottom = H - 130;
  const contentCenterY = (contentTop + contentBottom) / 2;

  switch (n) {
    case 1: {
      const s = 480;
      return [
        {
          x: cx - s / 2,
          y: contentCenterY - s / 2 - 20,
          photoSize: s,
          labelWidth: 600,
        },
      ];
    }
    case 2: {
      const s = 360;
      const gap = 60;
      const y = contentCenterY - s / 2 - 20;
      return [
        { x: cx - s - gap / 2, y, photoSize: s, labelWidth: s + 20 },
        { x: cx + gap / 2, y, photoSize: s, labelWidth: s + 20 },
      ];
    }
    case 3: {
      const s = 280;
      const gap = 36;
      const labelSpace = 60;
      // Top row (2 photos) + bottom center (1 photo)
      // Total block: photo + label + gap + photo + label
      const rowHeight = s + labelSpace;
      const topY = contentCenterY - rowHeight;
      const bottomY = contentCenterY + gap / 2;
      return [
        { x: cx - s - gap / 2, y: topY, photoSize: s, labelWidth: s + 20 },
        { x: cx + gap / 2, y: topY, photoSize: s, labelWidth: s + 20 },
        { x: cx - s / 2, y: bottomY, photoSize: s, labelWidth: s + 20 },
      ];
    }
        case 4: {
      const s = 260;
      const gap = 40;
      const labelSpace = 60;
      // Two rows total, each row = photo + label. Center the whole block.
      const rowH = s + labelSpace;
      const totalH = rowH * 2 + gap;
      const topY = contentCenterY - totalH / 2;
      const bottomY = topY + rowH + gap;
      return [
        { x: cx - s - gap / 2, y: topY, photoSize: s, labelWidth: s + 20 },
        { x: cx + gap / 2, y: topY, photoSize: s, labelWidth: s + 20 },
        { x: cx - s - gap / 2, y: bottomY, photoSize: s, labelWidth: s + 20 },
        { x: cx + gap / 2, y: bottomY, photoSize: s, labelWidth: s + 20 },
      ];
    }
    case 5: {
      // Diamond layout: 1 top, 2 middle, 2 bottom
      const s = 200;
      const gap = 30;
      const labelSpace = 50;
      const rowHeight = s + labelSpace;
      const topY = contentCenterY - rowHeight - gap;
      const midY = contentCenterY - s / 2 + 10;
      const bottomY = contentCenterY + rowHeight - gap + 10;

      return [
        // Top center
        { x: cx - s / 2, y: topY, photoSize: s, labelWidth: s + 20 },
        // Middle left
        { x: cx - s - gap / 2, y: midY, photoSize: s, labelWidth: s + 20 },
        // Middle right
        { x: cx + gap / 2, y: midY, photoSize: s, labelWidth: s + 20 },
        // Bottom left
        { x: cx - s - gap / 2, y: bottomY, photoSize: s, labelWidth: s + 20 },
        // Bottom right
        { x: cx + gap / 2, y: bottomY, photoSize: s, labelWidth: s + 20 },
      ];
    }
    default:
      return [];
  }
}

function drawTeamMember(
  ctx: CanvasRenderingContext2D,
  m: TeamMember,
  pos: TeamPos,
  frameImage: HTMLImageElement | null
): void {
  if (!m.image) return;

  drawFramedPortrait(ctx, {
    image: m.image,
    position: { x: 0, y: 0, scale: 1 },
    frameImage,
    x: pos.x,
    y: pos.y,
    size: pos.photoSize,
  });

  const labelX = pos.x + pos.photoSize / 2;
  const labelY = pos.y + pos.photoSize + 14;

  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  // Name size scales down slightly for smaller photos
  const nameSize = pos.photoSize < 240 ? 18 : 22;
  ctx.font = `900 ${nameSize}px ${FONT_STACK}`;
  ctx.fillStyle = "#ffffff";
  const displayName = fitText(
    ctx,
    (m.name || "BUILDER").toUpperCase(),
    pos.labelWidth
  );
  ctx.fillText(displayName, labelX, labelY);

  const classSize = pos.photoSize < 240 ? 11 : 14;
  ctx.font = `800 ${classSize}px ${FONT_STACK}`;
  ctx.fillStyle = "#FF8C42";
  ctx.fillText(m.builderClass, labelX, labelY + nameSize + 6);
}

function drawTeamHeader(
  ctx: CanvasRenderingContext2D,
  W: number,
  count: number
): void {
  const cx = W / 2;

  ctx.font = `600 20px ${FONT_STACK}`;
  ctx.fillStyle = "#FF8C42";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("//  HACKER HOUSE GOA  //  2026  //", cx, 70);

  ctx.font = `900 56px ${FONT_STACK}`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText("THE  BUILDERS", cx, 102);

  ctx.font = `600 18px ${FONT_STACK}`;
  ctx.fillStyle = "#71717a";
  ctx.fillText(
    `${count} BUILDER${count > 1 ? "S" : ""}  •  ONE FRAME`,
    cx,
    172
  );

  ctx.fillStyle = "#FF6B35";
  ctx.fillRect(cx - 40, 205, 80, 3);
}

function drawTeamFooter(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number
): void {
  const bottomY = H - 70;

  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, bottomY - 30);
  ctx.lineTo(W - 80, bottomY - 30);
  ctx.stroke();

  ctx.font = `800 20px ${FONT_STACK}`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("HH GOA 2026", 80, bottomY);

  ctx.fillStyle = "#FF8C42";
  ctx.textAlign = "right";
  ctx.fillText("#FrameInGoa", W - 80, bottomY);
}

// ============================================================
// UTILITIES
// ============================================================

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 3 && ctx.measureText(t + "…").width > maxWidth) {
    t = t.slice(0, -1);
  }
  return t + "…";
}

function blobFromCanvas(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to encode canvas."));
      },
      "image/png",
      1.0
    );
  });
}