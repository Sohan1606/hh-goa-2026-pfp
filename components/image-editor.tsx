"use client";

import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
} from "react";
import { ZoomIn, ZoomOut, RotateCcw, Move } from "lucide-react";
import { ImagePosition } from "@/types/image";
import { renderPreviewToCanvas } from "@/lib/canvas";
import { cn } from "@/lib/utils";

interface ImageEditorProps {
  image: HTMLImageElement;
  position: ImagePosition;
  onPositionChange: (pos: ImagePosition) => void;
  frameImage: HTMLImageElement | null;
}

const MIN_SCALE = 1.0;
const MAX_SCALE = 3.0;
const SCALE_STEP = 0.1;
const PAN_LIMIT = 0.35; // max fraction of canvas the image can be shifted

export function ImageEditor({
  image,
  position,
  onPositionChange,
  frameImage,
}: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Drag state
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    startPosX: number;
    startPosY: number;
  }>({ active: false, startX: 0, startY: 0, startPosX: 0, startPosY: 0 });

  // Pinch state
  const pinchRef = useRef<{
    active: boolean;
    startDistance: number;
    startScale: number;
  }>({ active: false, startDistance: 0, startScale: 1 });

  const [isDragging, setIsDragging] = useState(false);
  const [canvasSize, setCanvasSize] = useState(360);

  useEffect(() => {
    const updateSize = () => {
      const container = containerRef.current;
      if (container) {
        const width = Math.min(container.clientWidth, 480);
        setCanvasSize(width);
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    renderPreviewToCanvas(canvas, image, position, frameImage);
  }, [image, position, frameImage, canvasSize]);

  const clampPos = (val: number) =>
    Math.max(-PAN_LIMIT, Math.min(PAN_LIMIT, val));
  const clampScale = (val: number) =>
    Math.max(MIN_SCALE, Math.min(MAX_SCALE, val));

  const distance = (t1: React.Touch, t2: React.Touch) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.hypot(dx, dy);
  };

  // ---- Mouse handlers ----
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        startPosX: position.x,
        startPosY: position.y,
      };
      setIsDragging(true);
    },
    [position.x, position.y]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragRef.current.active) return;
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dx = (e.clientX - dragRef.current.startX) / rect.width;
      const dy = (e.clientY - dragRef.current.startY) / rect.height;
      onPositionChange({
        ...position,
        x: clampPos(dragRef.current.startPosX + dx),
        y: clampPos(dragRef.current.startPosY + dy),
      });
    },
    [position, onPositionChange]
  );

  const onMouseUp = useCallback(() => {
    dragRef.current.active = false;
    setIsDragging(false);
  }, []);

  // ---- Touch handlers ----
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        // Start pinch
        pinchRef.current = {
          active: true,
          startDistance: distance(e.touches[0], e.touches[1]),
          startScale: position.scale,
        };
        dragRef.current.active = false;
      } else if (e.touches.length === 1) {
        const t = e.touches[0];
        dragRef.current = {
          active: true,
          startX: t.clientX,
          startY: t.clientY,
          startPosX: position.x,
          startPosY: position.y,
        };
        setIsDragging(true);
      }
    },
    [position.x, position.y, position.scale]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (pinchRef.current.active && e.touches.length === 2) {
        const newDist = distance(e.touches[0], e.touches[1]);
        const ratio = newDist / pinchRef.current.startDistance;
        onPositionChange({
          ...position,
          scale: clampScale(pinchRef.current.startScale * ratio),
        });
        return;
      }

      if (dragRef.current.active && e.touches.length === 1) {
        const t = e.touches[0];
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const dx = (t.clientX - dragRef.current.startX) / rect.width;
        const dy = (t.clientY - dragRef.current.startY) / rect.height;
        onPositionChange({
          ...position,
          x: clampPos(dragRef.current.startPosX + dx),
          y: clampPos(dragRef.current.startPosY + dy),
        });
      }
    },
    [position, onPositionChange]
  );

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      dragRef.current.active = false;
      pinchRef.current.active = false;
      setIsDragging(false);
    } else if (e.touches.length === 1) {
      // Ended pinch, may still be dragging with one finger
      pinchRef.current.active = false;
      const t = e.touches[0];
      dragRef.current = {
        active: true,
        startX: t.clientX,
        startY: t.clientY,
        startPosX: 0,
        startPosY: 0,
      };
      // Note: we snapshot current pos as start to avoid jump
      dragRef.current.startPosX = 0;
      dragRef.current.startPosY = 0;
    }
  }, []);

  // ---- Zoom controls ----
  const zoom = useCallback(
    (dir: "in" | "out") => {
      const newScale =
        dir === "in"
          ? clampScale(position.scale + SCALE_STEP)
          : clampScale(position.scale - SCALE_STEP);
      onPositionChange({ ...position, scale: newScale });
    },
    [position, onPositionChange]
  );

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      zoom(e.deltaY < 0 ? "in" : "out");
    },
    [zoom]
  );

  const reset = useCallback(() => {
    onPositionChange({ x: 0, y: 0, scale: 1 });
  }, [onPositionChange]);

  const scalePercent = Math.round(position.scale * 100);

  return (
    <div ref={containerRef} className="w-full space-y-4">
      <div className="relative flex justify-center">
        <div className="relative inline-block">
          <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            className={cn(
              "rounded-full select-none touch-none",
              "cursor-grab active:cursor-grabbing",
              isDragging && "cursor-grabbing",
              "shadow-2xl shadow-black/50"
            )}
            style={{ width: canvasSize, height: canvasSize }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onTouchCancel={onTouchEnd}
            onWheel={onWheel}
            aria-label="Photo editor — drag to reposition, pinch or scroll to zoom"
            role="img"
          />

          {!isDragging && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5 pointer-events-none">
              <Move className="w-3 h-3 text-zinc-400" />
              <span className="text-xs text-zinc-400">Drag • pinch to zoom</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => zoom("out")}
            disabled={position.scale <= MIN_SCALE}
            className={cn(
              "w-10 h-10 rounded-lg border border-zinc-800 bg-zinc-900",
              "flex items-center justify-center",
              "text-zinc-400 hover:text-zinc-100 hover:border-zinc-700",
              "transition-all duration-150 active:scale-95",
              "disabled:opacity-30 disabled:cursor-not-allowed",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            )}
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <div className="min-w-[4rem] text-center">
            <span className="text-sm font-mono text-zinc-400">
              {scalePercent}%
            </span>
          </div>

          <button
            onClick={() => zoom("in")}
            disabled={position.scale >= MAX_SCALE}
            className={cn(
              "w-10 h-10 rounded-lg border border-zinc-800 bg-zinc-900",
              "flex items-center justify-center",
              "text-zinc-400 hover:text-zinc-100 hover:border-zinc-700",
              "transition-all duration-150 active:scale-95",
              "disabled:opacity-30 disabled:cursor-not-allowed",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            )}
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={reset}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-lg",
            "border border-zinc-800 bg-zinc-900",
            "text-sm text-zinc-500 hover:text-zinc-300 hover:border-zinc-700",
            "transition-all duration-150 active:scale-95",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          )}
          aria-label="Reset position and zoom"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      <div>
        <input
          type="range"
          min={MIN_SCALE * 100}
          max={MAX_SCALE * 100}
          step={SCALE_STEP * 100}
          value={scalePercent}
          onChange={(e) =>
            onPositionChange({
              ...position,
              scale: clampScale(Number(e.target.value) / 100),
            })
          }
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer
            bg-zinc-800 accent-orange-500
            focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          aria-label={`Zoom level: ${scalePercent} percent`}
        />
      </div>
    </div>
  );
}