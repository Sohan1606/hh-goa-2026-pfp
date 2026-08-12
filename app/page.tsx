"use client";

import React, { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { useImageProcessor } from "@/hooks/useImageProcessor";
import { useFrameLoader } from "@/hooks/useFrameLoader";
import { UploadZone } from "@/components/upload-zone";
import { ImageEditor } from "@/components/image-editor";
import { GenerationResult } from "@/components/generation-result";
import { GenerateButton } from "@/components/action-buttons";
import { BrandingHeader, StateMessage } from "@/components/branding";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const {
    state,
    error,
    sourceImage,
    position,
    setPosition,
    result,
    setFrameImage,
    processFile,
    generateImage,
    resetAll,
  } = useImageProcessor();

  const { frameImage, frameLoaded } = useFrameLoader();

  useEffect(() => {
    if (frameLoaded) {
      setFrameImage(frameImage);
    }
  }, [frameImage, frameLoaded, setFrameImage]);

  const isLoading: boolean =
    state === "uploading" ||
    state === "heic-converting" ||
    state === "generating";

  const showEditor: boolean =
    (state === "loaded" || state === "editing") && !!sourceImage;

  const showResult: boolean = state === "generated" && !!result;

  const showEmpty: boolean = state === "empty";

  const showError: boolean =
    state === "error" || state === "unsupported" || state === "oversized";

  return (
    <div className="min-h-svh bg-zinc-950 flex flex-col">
      {/* Background texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, rgba(255,107,53,0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,107,53,0.03) 0%, transparent 50%)`,
        }}
        aria-hidden="true"
      />

      {/* Grid dots pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      />

      <main className="relative flex-1 flex flex-col items-center justify-start px-4 py-8 md:py-12 max-w-lg mx-auto w-full">
        <BrandingHeader
          compact={showEditor || showResult}
          className={cn(
            "w-full mb-8",
            (showEditor || showResult) && "mb-6"
          )}
        />

        {showEmpty && (
          <div className="text-center mb-8 space-y-3 animate-in fade-in duration-500">
            <p className="text-xl md:text-2xl font-bold text-zinc-200 leading-snug">
              Build your{" "}
              <span className="text-orange-500">HH Goa</span> identity.
            </p>
            <p className="text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
              Upload a photo and get your branded Hacker House Goa 2026 profile
              picture — ready to post on X.
            </p>

            <div className="flex flex-wrap gap-2 justify-center pt-2">
              {[
                "Instant generation",
                "No signup",
                "Mobile-friendly",
                "Shareable PFP",
              ].map((feat) => (
                <span
                  key={feat}
                  className="px-3 py-1 text-xs rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500"
                >
                  {feat}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="w-full space-y-4">
          {(showEmpty || showError) && (
            <div className="animate-in fade-in duration-300">
              <UploadZone
                onFileSelected={processFile}
                disabled={isLoading}
              />

              {showError && (
                <div className="mt-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 space-y-3">
                  <StateMessage state={state} error={error} />
                  <button
                    onClick={resetAll}
                    className={cn(
                      "w-full flex items-center justify-center gap-2",
                      "px-4 py-2.5 rounded-lg",
                      "bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700",
                      "text-sm text-zinc-300 font-medium",
                      "transition-all duration-150",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                    )}
                    aria-label="Try again with a different photo"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center gap-4 py-12 animate-in fade-in duration-300">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-orange-500 animate-spin" />
                <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-orange-400 animate-spin [animation-direction:reverse] [animation-duration:1.2s]" />
              </div>
              <StateMessage state={state} error={error} />
            </div>
          )}

          {showEditor && sourceImage && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-400">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                  Position your photo
                </h2>
                <button
                  onClick={resetAll}
                  className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
                  aria-label="Start over"
                >
                  Start over
                </button>
              </div>

              <ImageEditor
                image={sourceImage}
                position={position}
                onPositionChange={setPosition}
                frameImage={frameImage}
              />

              <GenerateButton
                onClick={generateImage}
                loading={state === "generating"}
              />

              <p className="text-xs text-zinc-600 text-center">
                Drag to reposition • Pinch or scroll to zoom • 1080×1080 PNG output
              </p>
            </div>
          )}

          {showResult && result && (
            <GenerationResult
              result={result}
              onCreateAnother={resetAll}
            />
          )}
        </div>

        <footer className="mt-12 pb-6 text-center">
          <p className="text-xs text-zinc-700">
            Hacker House Goa 2026 •{" "}
            <span className="text-orange-900">#FrameGoa</span>
          </p>
        </footer>
      </main>
    </div>
  );
}