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
  const [position, setPosition] = useState<ImagePosition>(DEFAULT_POSITION);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [frameImage, setFrameImage] = useState<HTMLImageElement | null>(null);

  const objectUrlsRef = useRef<Set<string>>(new Set());
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

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
        // Already revoked
      }
    });
    objectUrlsRef.current.clear();
  }, []);

  useEffect(() => {
    return () => revokeAllUrls();
  }, [revokeAllUrls]);

  const safeSet = useCallback(<T,>(setter: (v: T) => void, value: T) => {
    if (mountedRef.current) setter(value);
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      revokeAllUrls();
      safeSet(setError, null);
      safeSet(setResult, null);
      safeSet(setPosition, DEFAULT_POSITION);
      safeSet(setSourceImage, null);
      safeSet(setState, "uploading" as ImageState);

      const validation = validateFile(file);
      if (!validation.valid) {
        safeSet(setError, validation.error || "Invalid file.");
        safeSet(setState, (validation.state || "error") as ImageState);
        return;
      }

      try {
        let processedFile = file;

        if (isHEICFile(file)) {
          safeSet(setState, "heic-converting" as ImageState);
          try {
            processedFile = await convertHEICToJPEG(file);
          } catch (heicErr) {
            safeSet(
              setError,
              (heicErr as Error).message ||
                "Could not convert HEIC. Please convert to JPG on your device first."
            );
            safeSet(setState, "error" as ImageState);
            return;
          }
        }

        safeSet(setState, "uploading" as ImageState);

        let img: HTMLImageElement;
        try {
          img = await loadImageFromFile(processedFile);
          trackUrl(img.src);
        } catch (decodeErr) {
          safeSet(
            setError,
            (decodeErr as Error).message ||
              "Could not read this image. Try a different file."
          );
          safeSet(setState, "error" as ImageState);
          return;
        }

        try {
          const optimized = await downscaleImageIfHuge(img, 2400);
          if (optimized !== img) {
            trackUrl(optimized.src);
          }
          safeSet(setSourceImage, optimized);
        } catch {
          safeSet(setSourceImage, img);
        }

        safeSet(setState, "loaded" as ImageState);
      } catch (err) {
        safeSet(setError, (err as Error).message || "Failed to process image.");
        safeSet(setState, "error" as ImageState);
      }
    },
    [revokeAllUrls, trackUrl, safeSet]
  );

  const generateImage = useCallback(async () => {
    if (!sourceImage) return;

    safeSet(setState, "generating" as ImageState);
    safeSet(setError, null);

    try {
      const blob = await renderFramedImage({
        image: sourceImage,
        position,
        frameImage,
        outputSize: 1080,
      });

      const objectUrl = URL.createObjectURL(blob);
      trackUrl(objectUrl);

      safeSet(setResult, {
        blob,
        objectUrl,
        filename: "hh-goa-2026-pfp.png",
      });
      safeSet(setState, "generated" as ImageState);
    } catch (err) {
      safeSet(setError, (err as Error).message || "Failed to generate image.");
      safeSet(setState, "error" as ImageState);
    }
  }, [sourceImage, position, frameImage, trackUrl, safeSet]);

  const resetAll = useCallback(() => {
    revokeAllUrls();
    safeSet(setState, "empty" as ImageState);
    safeSet(setError, null);
    safeSet(setSourceImage, null);
    safeSet(setPosition, DEFAULT_POSITION);
    safeSet(setResult, null);
  }, [revokeAllUrls, safeSet]);

  const setFrameImageCallback = useCallback((img: HTMLImageElement | null) => {
    setFrameImage(img);
  }, []);

  return {
    state,
    error,
    sourceImage,
    position,
    setPosition,
    result,
    frameImage,
    setFrameImage: setFrameImageCallback,
    processFile,
    generateImage,
    resetAll,
  };
}