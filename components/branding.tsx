"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BrandingHeaderProps {
  className?: string;
  compact?: boolean;
}

export function BrandingHeader({ className, compact }: BrandingHeaderProps) {
  return (
    <header className={cn("text-center space-y-3", className)}>
      {/* Logo mark */}
      <div className="flex justify-center">
        <div
          className={cn(
            "relative flex items-center justify-center",
            compact ? "w-10 h-10" : "w-14 h-14"
          )}
        >
          <HHMark size={compact ? 40 : 56} />
        </div>
      </div>

      {compact ? (
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-bold tracking-widest text-zinc-400 uppercase">
            Hacker House Goa
          </span>
          <span className="text-sm font-bold text-orange-500">2026</span>
        </div>
      ) : (
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-100">
            HACKER HOUSE
            <span className="text-orange-500"> GOA</span>
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-zinc-800" />
            <span className="text-sm font-semibold tracking-[0.3em] text-zinc-500 uppercase">
              2026
            </span>
            <div className="h-px w-12 bg-zinc-800" />
          </div>
        </div>
      )}
    </header>
  );
}

export function HHMark({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-label="Hacker House mark"
    >
      <rect width="48" height="48" rx="10" fill="#0a0a0a" />
      <rect x="4" y="4" width="40" height="2" rx="1" fill="#FF6B35" opacity="0.6" />
      <rect x="8" y="12" width="7" height="24" rx="1.5" fill="#ffffff" />
      <rect x="21" y="12" width="7" height="24" rx="1.5" fill="#ffffff" />
      <rect x="8" y="22" width="20" height="5" rx="1.5" fill="#ffffff" />
      <rect x="26" y="12" width="7" height="24" rx="1.5" fill="#FF6B35" />
      <rect x="33" y="12" width="7" height="24" rx="1.5" fill="#FF6B35" />
      <rect x="26" y="22" width="14" height="5" rx="1.5" fill="#FF6B35" />
      <rect x="4" y="42" width="40" height="2" rx="1" fill="#FF6B35" opacity="0.6" />
    </svg>
  );
}

export function StateMessage({
  state,
  error,
}: {
  state: string;
  error: string | null;
}) {
  const messages: Record<string, { text: string; className: string }> = {
    uploading: { text: "Loading your photo...", className: "text-zinc-400" },
    "heic-converting": {
      text: "Converting HEIC from iPhone... this takes a moment.",
      className: "text-orange-400",
    },
    generating: {
      text: "Generating your PFP...",
      className: "text-zinc-400",
    },
    error: {
      text: error || "Something went wrong.",
      className: "text-red-400",
    },
    unsupported: {
      text: error || "Unsupported file type.",
      className: "text-red-400",
    },
    oversized: {
      text: error || "File is too large.",
      className: "text-red-400",
    },
  };

  const message = messages[state];
  if (!message) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 py-2",
        message.className
      )}
      role="status"
      aria-live="polite"
    >
      {(state === "uploading" ||
        state === "heic-converting" ||
        state === "generating") && (
        <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      )}
      <span className="text-sm font-medium">{message.text}</span>
    </div>
  );
}