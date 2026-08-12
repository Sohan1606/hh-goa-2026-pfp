"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface GenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function GenerateButton({
  onClick,
  disabled,
  loading,
}: GenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "w-full flex items-center justify-center gap-3",
        "px-8 py-4 rounded-xl",
        "text-base font-bold tracking-wide",
        "transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
        loading || disabled
          ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
          : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.01] active:scale-[0.99]"
      )}
      aria-label="Generate PFP"
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-zinc-500 border-t-zinc-200 rounded-full animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="w-5 h-5" />
          Generate PFP
        </>
      )}
    </button>
  );
}