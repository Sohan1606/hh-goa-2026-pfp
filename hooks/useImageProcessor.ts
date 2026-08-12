"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ImageState, ImagePosition, GeneratedResult } from "@/types/image";
import { validateFile, isHEICFile } from "@/lib/validation";
import { convertHEICToJPEG } from "@/lib/heic";
import { loadImageFromFile, downscaleImageIfHuge } from "@/lib/image";
import { renderFramedImage } from "@/lib/canvas";

const DEFAULT_POSITION: ImagePosition = { x: 0, y: 0, scale: 1 };

export function useImageProcessor() {
  const [state, setState] = useState<ImageState>("empty");
  const [error, setError] = useState<string | null>(null);
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [position, setPosition] = useState<ImagePosition>(DEFAULT_POSITION);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [frameImage, setFrameImage] = useState<HTMLImageElement | null>(null);

  const objectUrlsRef = useRef<Set<string>>(new Set());

  const trackUrl = useCallback((url: string) => {
    if (url && url.startsWith("blob:")) {
      objectUrlsRef.current.add(url);
    }
  }, []);

  const revokeAllUrls = useCallback(() => {
    objectUrlsRef.current.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
    });
    objectUrlsRef.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => revokeAllUrls();
  }, [revokeAllUrls]);

  const processFile = useCallback(
    async (file: File) => {
      // Clean previous state
      revokeAllUrls();
      setError(null);
      setResult(null);
      setPosition(DEFAULT_POSITION);
      setSourceImage(null);
      setSourceFile(null);
      setState("uploading");

      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error || "Invalid file.");
        setState(validation.state || "error");
        return;
      }

      try {
        let processedFile = file;

        if (isHEICFile(file)) {
          setState("heic-converting");
          try {
            processedFile = await convertHEICToJPEG(file);
          } catch (heicErr) {
            setError(
              (heicErr as Error).message ||
                "Could not convert HEIC. Please convert to JPG on your device first."
            );
            setState("error");
            return;
          }
        }

        setState("uploading");

        let img: HTMLImageElement;
        try {
          img = await loadImageFromFile(processedFile);
          trackUrl(img.src);
        } catch (decodeErr) {
          setError(
            (decodeErr as Error).message ||
              "Could not read this image. Try a different file."
          );
          setState("error");
          return;
        }

        // Downscale monstrous phone photos to keep canvas ops fast
        try {
          const optimized = await downscaleImageIfHuge(img, 2400);
          if (optimized !== img) {
            trackUrl(optimized.src);
          }
          setSourceImage(optimized);
        } catch {
          // If downscale fails, just use the original
          setSourceImage(img);
        }

        setSourceFile(processedFile);
        setState("loaded");
      } catch (err) {
        setError((err as Error).message || "Failed to process image.");
        setState("error");
      }
    },
    [revokeAllUrls, trackUrl]
  );

  const generateImage = useCallback(async () => {
    if (!sourceImage) return;

    setState("generating");
    setError(null);

    try {
      const blob = await renderFramedImage({
        image: sourceImage,
        position,
        frameImage,
        outputSize: 1080,
      });

      const objectUrl = URL.createObjectURL(blob);
      trackUrl(objectUrl);

      setResult({
        blob,
        objectUrl,
        filename: "hh-goa-2026-pfp.png",
      });
      setState("generated");
    } catch (err) {
      setError((err as Error).message || "Failed to generate image.");
      setState("error");
    }
  }, [sourceImage, position, frameImage, trackUrl]);

  const resetToEditor = useCallback(() => {
    setState("loaded");
    setResult(null);
  }, []);

  const resetAll = useCallback(() => {
    revokeAllUrls();
    setState("empty");
    setError(null);
    setSourceImage(null);
    setSourceFile(null);
    setPosition(DEFAULT_POSITION);
    setResult(null);
  }, [revokeAllUrls]);

  const setFrameImageCallback = useCallback((img: HTMLImageElement | null) => {
    setFrameImage(img);
  }, []);

  return {
    state,
    error,
    sourceImage,
    sourceFile,
    position,
    setPosition,
    result,
    frameImage,
    setFrameImage: setFrameImageCallback,
    processFile,
    generateImage,
    resetToEditor,
    resetAll,
  };
}