"use client";

import React from "react";
import { Upload, User, Sparkles, Download, Share2 } from "lucide-react";

const STEPS = [
  { icon: Upload, text: "Upload your photo" },
  { icon: User, text: "Add your name + stack" },
  { icon: Sparkles, text: "Generate your ID" },
  { icon: Download, text: "Download PNG" },
  { icon: Share2, text: "Post with #FrameInGoa" },
];

export function HowToSection() {
  return (
    <div className="w-full mt-8 pt-6 border-t border-zinc-900">
      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest text-center mb-4">
        How to get your #FrameInGoa
      </p>
      <ol className="flex flex-wrap justify-center gap-x-3 gap-y-2 text-xs text-zinc-500">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <li key={i} className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-orange-400">
                {i + 1}
              </span>
              <Icon className="w-3 h-3" />
              <span>{s.text}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}