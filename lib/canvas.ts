import { ImagePosition } from "@/types/image";

export const OUTPUT_SIZE = 1080;

export interface CanvasRenderOptions {
  image: HTMLImageElement;
  position: ImagePosition;
  frameImage: HTMLImageElement | null;
  outputSize?: number;
}

/**
 * Renders the user photo with the HH Goa frame onto a canvas.
 * Returns a PNG blob.
 */
export async function renderFramedImage(
  options: CanvasRenderOptions
): Promise<Blob> {
  const { image, position, frameImage, outputSize = OUTPUT_SIZE } = options;

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) throw new Error("Could not get canvas context.");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.clearRect(0, 0, outputSize, outputSize);
  drawUserPhoto(ctx, image, position, outputSize);

  if (frameImage) {
    ctx.drawImage(frameImage, 0, 0, outputSize, outputSize);
  } else {
    drawFallbackFrame(ctx, outputSize);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to generate image blob."));
      },
      "image/png",
      1.0
    );
  });
}

/**
 * Cover-fit: smaller image dimension always maps to the canvas dimension,
 * guaranteeing full coverage. User scale/position applied on top.
 * Position x/y are in normalized units (fraction of output size).
 */
function drawUserPhoto(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  position: ImagePosition,
  outputSize: number
): void {
  const { x, y, scale } = position;
  const iw = image.naturalWidth;
  const ih = image.naturalHeight;

  if (!iw || !ih) return;

  const baseScale = Math.max(outputSize / iw, outputSize / ih);
  const finalScale = baseScale * scale;

  const drawW = iw * finalScale;
  const drawH = ih * finalScale;

  const offsetX = (outputSize - drawW) / 2 + x * outputSize;
  const offsetY = (outputSize - drawH) / 2 + y * outputSize;

  ctx.save();
  const ringWidth = outputSize * 0.075;
  const clipRadius = outputSize / 2 - ringWidth * 0.9;
  ctx.beginPath();
  ctx.arc(outputSize / 2, outputSize / 2, clipRadius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(image, offsetX, offsetY, drawW, drawH);
  ctx.restore();
}

/**
 * Programmatic HH Goa 2026 branded frame.
 * Renders when no PNG frame is provided.
 */
export function drawFallbackFrame(
  ctx: CanvasRenderingContext2D,
  size: number
): void {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;
  const ringWidth = size * 0.075;

  // Outer dark ring
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.arc(cx, cy, r - ringWidth, 0, Math.PI * 2, true);
  ctx.fillStyle = "#0a0a0a";
  ctx.fill();
  ctx.restore();

  // Outer orange gradient accent
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, "#FF6B35");
  gradient.addColorStop(0.5, "#FFD166");
  gradient.addColorStop(1, "#FF6B35");

  const accentInner = r - ringWidth * 0.12;
  const accentOuter = r - ringWidth * 0.02;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, accentOuter, 0, Math.PI * 2);
  ctx.arc(cx, cy, accentInner, 0, Math.PI * 2, true);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.restore();

  // Inner orange accent
  const innerAccentOuter = r - ringWidth * 0.88;
  const innerAccentInner = r - ringWidth * 0.98;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, innerAccentOuter, 0, Math.PI * 2);
  ctx.arc(cx, cy, innerAccentInner, 0, Math.PI * 2, true);
  ctx.fillStyle = "#FF6B35";
  ctx.fill();
  ctx.restore();

  const textRadius = r - ringWidth * 0.5;

  drawCurvedText(ctx, {
    text: "HACKER  HOUSE  GOA  2026",
    cx,
    cy,
    radius: textRadius,
    fontSize: size * 0.042,
    color: "#ffffff",
    fontWeight: "800",
    startAngle: -Math.PI / 2,
    arcSpan: Math.PI * 1.05,
    direction: "top",
  });

  drawCurvedText(ctx, {
    text: "★  BUILD  IN  PARADISE  ★  #FRAMEGOA  ★",
    cx,
    cy,
    radius: textRadius,
    fontSize: size * 0.030,
    color: "#FF8C42",
    fontWeight: "700",
    startAngle: Math.PI / 2,
    arcSpan: Math.PI * 1.0,
    direction: "bottom",
  });

  // Corner dot markers
  const dotAngles = [
    -Math.PI / 2 - Math.PI * 0.52,
    -Math.PI / 2 + Math.PI * 0.52,
    Math.PI / 2 - Math.PI * 0.48,
    Math.PI / 2 + Math.PI * 0.48,
  ];
  const dotRadius = size * 0.008;
  dotAngles.forEach((angle) => {
    const dx = cx + textRadius * Math.cos(angle);
    const dy = cy + textRadius * Math.sin(angle);
    ctx.save();
    ctx.beginPath();
    ctx.arc(dx, dy, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#FF6B35";
    ctx.fill();
    ctx.restore();
  });
}

interface CurvedTextOptions {
  text: string;
  cx: number;
  cy: number;
  radius: number;
  fontSize: number;
  color: string;
  fontWeight: string;
  startAngle: number;
  arcSpan: number;
  direction: "top" | "bottom";
}

function drawCurvedText(
  ctx: CanvasRenderingContext2D,
  opts: CurvedTextOptions
): void {
  const {
    text,
    cx,
    cy,
    radius,
    fontSize,
    color,
    fontWeight,
    startAngle,
    arcSpan,
    direction,
  } = opts;

  ctx.save();
  ctx.font = `${fontWeight} ${fontSize}px "Helvetica Neue", Arial, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const chars = text.split("");
  const angleStep = arcSpan / Math.max(chars.length - 1, 1);

  if (direction === "top") {
    chars.forEach((char, i) => {
      const angleOffset = -arcSpan / 2 + i * angleStep;
      const angle = startAngle + angleOffset;
      const px = cx + radius * Math.cos(angle);
      const py = cy + radius * Math.sin(angle);
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle + Math.PI / 2);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    });
  } else {
    chars.forEach((char, i) => {
      const reversedIndex = chars.length - 1 - i;
      const angleOffset = -arcSpan / 2 + reversedIndex * angleStep;
      const angle = startAngle + angleOffset;
      const px = cx + radius * Math.cos(angle);
      const py = cy + radius * Math.sin(angle);
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle - Math.PI / 2);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    });
  }

  ctx.restore();
}

/**
 * Live preview renderer.
 */
export function renderPreviewToCanvas(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  position: ImagePosition,
  frameImage: HTMLImageElement | null
): void {
  const size = canvas.width;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, size, size);
  drawUserPhoto(ctx, image, position, size);

  if (frameImage) {
    ctx.drawImage(frameImage, 0, 0, size, size);
  } else {
    drawFallbackFrame(ctx, size);
  }
}