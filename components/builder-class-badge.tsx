"use client";

import React from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { BuilderClass } from "@/types/builder";
import { cn } from "@/lib/utils";

interface Props {
  builderClass: BuilderClass;
  onRegenerate?: () => void;
  compact?: boolean;
}

export function BuilderClassBadge({ builderClass, onRegenerate, compact }: Props) {
  return (
    <div className={cn("flex items-center gap-2", compact && "text-xs")}>
      <div
        className={cn(
          "flex items-center gap-1.5",
          "px-3 py-1.5 rounded-full",
          "bg-orange-500/10 border border-orange-500/30",
          "text-orange-400 font-bold tracking-wider",
          compact ? "text-xs" : "text-sm"
        )}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>{builderClass}</span>
      </div>
      {onRegenerate && (
        <button
          onClick={onRegenerate}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            "border border-zinc-800 bg-zinc-900 text-zinc-500",
            "hover:text-zinc-100 hover:border-zinc-700",
            "transition-all duration-150 active:scale-95",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          )}
          aria-label="Regenerate builder class"
          title="Regenerate class"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}