"use client";

import React from "react";
import { User, Code } from "lucide-react";
import { BuilderClass } from "@/types/builder";
import { BuilderClassBadge } from "./builder-class-badge";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  stack: string;
  builderClass: BuilderClass;
  onNameChange: (v: string) => void;
  onStackChange: (v: string) => void;
  onRegenerateClass: () => void;
}

export function BuilderDetailsForm({
  name,
  stack,
  builderClass,
  onNameChange,
  onStackChange,
  onRegenerateClass,
}: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="builder-name"
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2"
        >
          <User className="w-3 h-3" />
          Builder Name
        </label>
        <input
          id="builder-name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value.slice(0, 40))}
          placeholder="e.g. Sohan Khachane"
          maxLength={40}
          className={cn(
            "w-full px-4 py-3 rounded-xl",
            "bg-zinc-900 border border-zinc-800",
            "text-zinc-100 placeholder:text-zinc-600",
            "focus:outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20",
            "transition-all duration-150"
          )}
        />
      </div>

      <div>
        <label
          htmlFor="builder-stack"
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2"
        >
          <Code className="w-3 h-3" />
          Stack / Skills
        </label>
        <input
          id="builder-stack"
          type="text"
          value={stack}
          onChange={(e) => onStackChange(e.target.value.slice(0, 80))}
          placeholder="e.g. Cloud • DevOps • AI"
          maxLength={80}
          className={cn(
            "w-full px-4 py-3 rounded-xl",
            "bg-zinc-900 border border-zinc-800",
            "text-zinc-100 placeholder:text-zinc-600",
            "focus:outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20",
            "transition-all duration-150"
          )}
        />
      </div>

      <div className="pt-2">
        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
          Builder Class
        </div>
        <BuilderClassBadge
          builderClass={builderClass}
          onRegenerate={onRegenerateClass}
        />
      </div>
    </div>
  );
}