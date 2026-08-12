"use client";

import React, { useRef, useCallback } from "react";
import { Upload, ImageIcon, Camera } from "lucide-react";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export function UploadZone({ onFileSelected, disabled }: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isDragging, handlers } = useDragAndDrop({
    onDrop: onFileSelected,
  });

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelected(file);
        // Reset input so the same file can be re-selected
        e.target.value = "";
      }
    },
    [onFileSelected]
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  return (
    <div
      {...handlers}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Upload photo — click or drag and drop"
      aria-disabled={disabled}
      className={cn(
        "relative group cursor-pointer select-none",
        "w-full rounded-2xl border-2 border-dashed",
        "transition-all duration-300 ease-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
        isDragging
          ? "border-orange-500 bg-orange-500/10 scale-[1.01]"
          : "border-zinc-700 hover:border-orange-500/60 hover:bg-zinc-900/60",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
        onChange={handleInputChange}
        className="sr-only"
        aria-hidden="true"
        disabled={disabled}
        capture="environment"
      />

      <div className="flex flex-col items-center justify-center gap-6 px-8 py-16 md:py-20">
        {/* Icon cluster */}
        <div className="relative">
          <div
            className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center",
              "bg-zinc-900 border border-zinc-800",
              "transition-all duration-300",
              "group-hover:border-orange-500/40 group-hover:bg-zinc-900",
              isDragging && "border-orange-500/60 bg-orange-500/10"
            )}
          >
            <Upload
              className={cn(
                "w-8 h-8 transition-colors duration-300",
                isDragging ? "text-orange-400" : "text-zinc-400 group-hover:text-orange-400"
              )}
              strokeWidth={1.5}
            />
          </div>
          {/* Floating icon decorations */}
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <ImageIcon className="w-3 h-3 text-zinc-500" />
          </div>
          <div className="absolute -bottom-2 -left-2 w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <Camera className="w-3 h-3 text-zinc-500" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-zinc-100">
            {isDragging ? "Drop your photo here" : "Upload your photo"}
          </p>
          <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">
            Drag & drop or tap to browse.
            <br />
            JPG, PNG, WEBP, HEIC supported
          </p>
        </div>

        {/* Format badges */}
        <div className="flex flex-wrap gap-2 justify-center">
          {["JPG", "PNG", "WEBP", "HEIC"].map((fmt) => (
            <span
              key={fmt}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-zinc-900 border border-zinc-800 text-zinc-500"
            >
              {fmt}
            </span>
          ))}
        </div>
      </div>

      {/* Drag overlay indicator */}
      {isDragging && (
        <div className="absolute inset-0 rounded-2xl border-2 border-orange-500 animate-pulse pointer-events-none" />
      )}
    </div>
  );
}