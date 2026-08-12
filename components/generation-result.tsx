"use client";

import React, { useState, useCallback } from "react";
import { Download, RefreshCw, Check, ExternalLink } from "lucide-react";
import { GeneratedResult } from "@/types/image";
import { downloadBlob, shareToX, openXIntent } from "@/lib/share";
import { cn } from "@/lib/utils";

interface GenerationResultProps {
  result: GeneratedResult;
  onCreateAnother: () => void;
}

export function GenerationResult({
  result,
  onCreateAnother,
}: GenerationResultProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      downloadBlob(result.blob, result.filename);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } finally {
      setDownloading(false);
    }
  }, [result]);

  const handleShare = useCallback(async () => {
    setSharing(true);
    setShareNote(null);

    try {
      const shareResult = await shareToX({
        blob: result.blob,
        hostedUrl: result.hostedUrl,
        filename: result.filename,
      });

      if (shareResult.method === "intent") {
        setShareNote(
          "Opening X — your image has been downloaded separately. Attach it to the tweet!"
        );
        downloadBlob(result.blob, result.filename);
      }
    } catch {
      setShareNote(
        "Could not open share sheet. Please download the image and share manually."
      );
    } finally {
      setSharing(false);
    }
  }, [result]);

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Result image — constrained container */}
      <div className="flex justify-center w-full">
        <div
          className="relative"
          style={{ width: "min(320px, 80vw)", height: "min(320px, 80vw)" }}
        >
          {/* Glow behind */}
          <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-3xl scale-110 -z-10" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result.objectUrl}
            alt="Your HH Goa 2026 PFP"
            className="w-full h-full rounded-full object-cover shadow-2xl shadow-black/60 relative z-10"
            style={{ display: "block" }}
          />
        </div>
      </div>

      {/* Success badge */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2">
          <Check className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-400 font-medium">
            Your PFP is ready!
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={cn(
            "w-full flex items-center justify-center gap-2.5",
            "px-6 py-4 rounded-xl",
            "font-semibold text-base",
            "transition-all duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
            downloaded
              ? "bg-green-600 text-white"
              : "bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-500/25"
          )}
          aria-label="Download PFP as PNG"
        >
          {downloaded ? (
            <>
              <Check className="w-5 h-5" />
              Downloaded!
            </>
          ) : downloading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Download PFP
            </>
          )}
        </button>

        <button
          onClick={handleShare}
          disabled={sharing}
          className={cn(
            "w-full flex items-center justify-center gap-2.5",
            "px-6 py-4 rounded-xl",
            "font-semibold text-base",
            "border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-600",
            "text-zinc-100",
            "transition-all duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          )}
          aria-label="Share to X (formerly Twitter)"
        >
          {sharing ? (
            <>
              <div className="w-4 h-4 border-2 border-zinc-500 border-t-zinc-200 rounded-full animate-spin" />
              Opening share...
            </>
          ) : (
            <>
              <XIcon className="w-4 h-4" />
              Share to X
            </>
          )}
        </button>

        {shareNote && (
          <p className="text-xs text-zinc-500 text-center leading-relaxed px-2 animate-in fade-in duration-300">
            {shareNote}
          </p>
        )}

        <button
          onClick={() => openXIntent(result.hostedUrl)}
          className={cn(
            "w-full flex items-center justify-center gap-2",
            "px-4 py-2.5 rounded-xl text-sm",
            "text-zinc-500 hover:text-zinc-300",
            "transition-colors duration-150",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          )}
          aria-label="Open X compose window directly"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open X compose window
        </button>

        <button
          onClick={onCreateAnother}
          className={cn(
            "w-full flex items-center justify-center gap-2",
            "px-6 py-3 rounded-xl",
            "text-sm font-medium",
            "text-zinc-500 hover:text-zinc-300",
            "transition-colors duration-150",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          )}
          aria-label="Start over with a new photo"
        >
          <RefreshCw className="w-4 h-4" />
          Create Another
        </button>
      </div>
    </div>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.258 5.632 5.906-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}