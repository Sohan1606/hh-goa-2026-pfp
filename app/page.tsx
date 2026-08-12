"use client";

import React, { useEffect, useState, useCallback } from "react";
import { RefreshCw, Sparkles, Check } from "lucide-react";
import { useImageProcessor } from "@/hooks/useImageProcessor";
import { useFrameLoader } from "@/hooks/useFrameLoader";
import { useTeamProcessor } from "@/hooks/useTeamProcessor";
import { UploadZone } from "@/components/upload-zone";
import { ImageEditor } from "@/components/image-editor";
import { GenerationResult } from "@/components/generation-result";
import { GenerateButton } from "@/components/action-buttons";
import { BrandingHeader, StateMessage } from "@/components/branding";
import { ModeSelector } from "@/components/mode-selector";
import { BuilderDetailsForm } from "@/components/builder-details-form";
import { BuilderIdPreview } from "@/components/builder-id-preview";
import { TeamBuilderForm } from "@/components/team-builder-form";
import { HowToSection } from "@/components/how-to-section";
import { detectBuilderClass, alternativeBuilderClass } from "@/lib/builder-class";
import { renderBuilderIdCard, renderTeamCard } from "@/lib/canvas-builder";
import {
  downloadBlob,
  shareGeneric,
  shareTextTeam,
  openXIntentWithText,
} from "@/lib/share";
import { AppMode, BuilderClass } from "@/types/builder";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [mode, setMode] = useState<AppMode>("pfp");
  const { frameImage, frameLoaded } = useFrameLoader();

  return (
    <div className="min-h-svh bg-zinc-950 flex flex-col">
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, rgba(255,107,53,0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,107,53,0.03) 0%, transparent 50%)`,
        }}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      />

      <main className="relative flex-1 flex flex-col items-center justify-start px-4 py-8 md:py-12 max-w-lg mx-auto w-full">
        <BrandingHeader className="w-full mb-6" />

        <div className="text-center mb-6 space-y-2">
          <p className="text-lg md:text-xl font-bold text-zinc-200 leading-snug">
            Build your <span className="text-orange-500">HH Goa</span> identity.
          </p>
          <p className="text-xs md:text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
            Create your PFP, Builder ID, or Team frame in seconds.
          </p>
        </div>

        <div className="w-full mb-6">
          <ModeSelector mode={mode} onChange={setMode} />
        </div>

        {mode === "pfp" && (
          <PfpFlow frameImage={frameImage} frameLoaded={frameLoaded} />
        )}
        {mode === "builder" && (
          <BuilderFlow frameImage={frameImage} frameLoaded={frameLoaded} />
        )}
        {mode === "team" && (
          <TeamFlow frameImage={frameImage} frameLoaded={frameLoaded} />
        )}

        <HowToSection />

        <footer className="mt-10 pb-6 text-center">
          <p className="text-xs text-zinc-700">
            Hacker House Goa 2026 •{" "}
            <span className="text-orange-900">#FrameInGoa</span>
          </p>
        </footer>
      </main>
    </div>
  );
}

/* ============================================================
 * PFP FLOW
 * ============================================================ */
function PfpFlow({
  frameImage,
  frameLoaded,
}: {
  frameImage: HTMLImageElement | null;
  frameLoaded: boolean;
}) {
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

  useEffect(() => {
    if (frameLoaded) setFrameImage(frameImage);
  }, [frameImage, frameLoaded, setFrameImage]);

  const isLoading =
    state === "uploading" ||
    state === "heic-converting" ||
    state === "generating";
  const showEditor =
    (state === "loaded" || state === "editing") && !!sourceImage;
  const showResult = state === "generated" && !!result;
  const showEmpty = state === "empty";
  const showError =
    state === "error" || state === "unsupported" || state === "oversized";

  return (
    <div className="w-full space-y-4">
      {(showEmpty || showError) && (
        <div>
          <UploadZone onFileSelected={processFile} disabled={isLoading} />
          {showError && (
            <div className="mt-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 space-y-3">
              <StateMessage state={state} error={error} />
              <button
                onClick={resetAll}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-sm text-zinc-300 font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Try Again
              </button>
            </div>
          )}
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-orange-500 animate-spin" />
          </div>
          <StateMessage state={state} error={error} />
        </div>
      )}

      {showEditor && sourceImage && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              Position your photo
            </h2>
            <button
              onClick={resetAll}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
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
          <GenerateButton onClick={generateImage} loading={false} />
        </div>
      )}

      {showResult && result && (
        <GenerationResult result={result} onCreateAnother={resetAll} />
      )}
    </div>
  );
}

/* ============================================================
 * BUILDER ID FLOW
 * ============================================================ */
function BuilderFlow({
  frameImage,
  frameLoaded,
}: {
  frameImage: HTMLImageElement | null;
  frameLoaded: boolean;
}) {
  const {
    state,
    error,
    sourceImage,
    position,
    setPosition,
    setFrameImage,
    processFile,
    resetAll,
  } = useImageProcessor();

  const [name, setName] = useState("");
  const [stack, setStack] = useState("");
  const [builderClass, setBuilderClass] =
    useState<BuilderClass>("SYSTEM BUILDER");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);

  useEffect(() => {
    if (frameLoaded) setFrameImage(frameImage);
  }, [frameImage, frameLoaded, setFrameImage]);

  useEffect(() => {
    setBuilderClass(detectBuilderClass(stack));
  }, [stack]);

  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  const isUploading =
    state === "uploading" || state === "heic-converting";
  const showEditor =
    (state === "loaded" || state === "editing") && !!sourceImage && !result;
  const showEmpty = state === "empty";
  const showError =
    state === "error" || state === "unsupported" || state === "oversized";

  const handleGenerate = useCallback(async () => {
    if (!sourceImage) return;
    setGenerating(true);
    setGenError(null);
    try {
      const blob = await renderBuilderIdCard({
        image: sourceImage,
        position,
        frameImage,
        details: {
          name: name.trim() || "UNNAMED BUILDER",
          stack: stack.trim() || "—",
          builderClass,
        },
      });
      const url = URL.createObjectURL(blob);
      setResult({ blob, url });
    } catch (e) {
      setGenError((e as Error).message || "Failed to generate Builder ID.");
    } finally {
      setGenerating(false);
    }
  }, [sourceImage, position, frameImage, name, stack, builderClass]);

  const handleReset = useCallback(() => {
    if (result?.url) URL.revokeObjectURL(result.url);
    setResult(null);
    setName("");
    setStack("");
    setBuilderClass("SYSTEM BUILDER");
    resetAll();
  }, [result, resetAll]);

  if (result) {
    return (
      <BuilderIdPreview
        blob={result.blob}
        objectUrl={result.url}
        name={name}
        stack={stack}
        onCreateAnother={handleReset}
      />
    );
  }

  return (
    <div className="w-full space-y-4">
      {(showEmpty || showError) && (
        <div>
          <UploadZone onFileSelected={processFile} disabled={isUploading} />
          {showError && (
            <div className="mt-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 space-y-3">
              <StateMessage state={state} error={error} />
              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-sm text-zinc-300 font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Try Again
              </button>
            </div>
          )}
        </div>
      )}

      {isUploading && (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-orange-500 animate-spin" />
          </div>
          <StateMessage state={state} error={error} />
        </div>
      )}

      {showEditor && sourceImage && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              Position your photo
            </h2>
            <button
              onClick={handleReset}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
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

          <div className="pt-2 border-t border-zinc-900">
            <BuilderDetailsForm
              name={name}
              stack={stack}
              builderClass={builderClass}
              onNameChange={setName}
              onStackChange={setStack}
              onRegenerateClass={() =>
                setBuilderClass((c) => alternativeBuilderClass(stack, c))
              }
            />
          </div>

          {genError && (
            <p className="text-sm text-red-400 text-center">{genError}</p>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className={cn(
              "w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl",
              "text-base font-bold tracking-wide transition-all duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
              generating
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.01] active:scale-[0.99]"
            )}
          >
            {generating ? (
              <>
                <div className="w-5 h-5 border-2 border-zinc-500 border-t-zinc-200 rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Builder ID
              </>
            )}
          </button>

          <p className="text-xs text-zinc-600 text-center">
            1080 × 1350 PNG • Ready for X, Instagram, and posters
          </p>
        </div>
      )}
    </div>
  );
}

/* ============================================================
 * TEAM FLOW
 * ============================================================ */
function TeamFlow({
  frameImage,
  frameLoaded,
}: {
  frameImage: HTMLImageElement | null;
  frameLoaded: boolean;
}) {
  const {
    members,
    busyMemberId,
    error,
    addMember,
    removeMember,
    updateMember,
    setMemberClass,
    processMemberFile,
    resetAll,
    canGenerate,
    MAX_MEMBERS,
  } = useTeamProcessor();

  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);

  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setGenError(null);
    try {
      const blob = await renderTeamCard({
        members,
        frameImage: frameLoaded ? frameImage : null,
      });
      const url = URL.createObjectURL(blob);
      setResult({ blob, url });
    } catch (e) {
      setGenError((e as Error).message || "Failed to generate team frame.");
    } finally {
      setGenerating(false);
    }
  }, [members, frameImage, frameLoaded]);

  const handleReset = useCallback(() => {
    if (result?.url) URL.revokeObjectURL(result.url);
    setResult(null);
    resetAll();
  }, [result, resetAll]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    downloadBlob(result.blob, "hh-goa-2026-team.png");
  }, [result]);

  const handleShare = useCallback(async () => {
    if (!result) return;
    const text = shareTextTeam(members.map((m) => m.name));
    const res = await shareGeneric({
      text,
      blob: result.blob,
      filename: "hh-goa-2026-team.png",
      title: "HH Goa 2026 Team",
    });
    if (res.method === "intent") {
      downloadBlob(result.blob, "hh-goa-2026-team.png");
    }
  }, [result, members]);

  if (result) {
    return (
      <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-center w-full">
          <div className="relative" style={{ width: "min(340px, 84vw)" }}>
            <div className="absolute inset-0 rounded-2xl bg-orange-500/15 blur-3xl scale-105 -z-10" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.url}
              alt="Your HH Goa 2026 Team frame"
              className="w-full h-auto rounded-2xl shadow-2xl shadow-black/60 relative z-10 border border-zinc-800"
              style={{ display: "block" }}
            />
          </div>
        </div>

        <div className="flex justify-center">
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2">
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400 font-medium">
              Your team frame is ready!
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl font-semibold text-base bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-500/25 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            Download Team PNG
          </button>
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl font-semibold text-base border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            Share to X
          </button>
          <button
            onClick={() =>
              openXIntentWithText(shareTextTeam(members.map((m) => m.name)))
            }
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            Open X compose window
          </button>
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <RefreshCw className="w-4 h-4" />
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          Bring your team
        </h2>
        <span className="text-xs text-zinc-600">
          {members.length}/{MAX_MEMBERS} builders
        </span>
      </div>

      <TeamBuilderForm
        members={members}
        busyMemberId={busyMemberId}
        onFileSelected={processMemberFile}
        onUpdate={updateMember}
        onSetClass={setMemberClass}
        onAdd={addMember}
        onRemove={removeMember}
        maxMembers={MAX_MEMBERS}
      />

      {error && <p className="text-sm text-red-400 text-center">{error}</p>}
      {genError && (
        <p className="text-sm text-red-400 text-center">{genError}</p>
      )}

      <button
        onClick={handleGenerate}
        disabled={!canGenerate || generating}
        className={cn(
          "w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl",
          "text-base font-bold tracking-wide transition-all duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
          !canGenerate || generating
            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white shadow-lg shadow-orange-500/30 hover:scale-[1.01] active:scale-[0.99]"
        )}
      >
        {generating ? (
          <>
            <div className="w-5 h-5 border-2 border-zinc-500 border-t-zinc-200 rounded-full animate-spin" />
            Generating team frame...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate Team Frame
          </>
        )}
      </button>

      {!canGenerate && (
        <p className="text-xs text-zinc-600 text-center">
          Add a photo and name for each builder to continue
        </p>
      )}
    </div>
  );
}