"use client";

import React from "react";
import { UserCircle2, IdCard, Users } from "lucide-react";
import { AppMode } from "@/types/builder";
import { cn } from "@/lib/utils";

interface ModeSelectorProps {
  mode: AppMode;
  onChange: (m: AppMode) => void;
}

const MODES: { key: AppMode; label: string; icon: React.ElementType }[] = [
  { key: "pfp", label: "PFP", icon: UserCircle2 },
  { key: "builder", label: "Builder ID", icon: IdCard },
  { key: "team", label: "Team", icon: Users },
];

export function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div
      role="tablist"
      aria-label="Choose output mode"
      className="w-full grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-zinc-900/60 border border-zinc-800"
    >
      {MODES.map((m) => {
        const active = mode === m.key;
        const Icon = m.icon;
        return (
          <button
            key={m.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(m.key)}
            className={cn(
              "flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl",
              "text-sm font-semibold transition-all duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
              active
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}