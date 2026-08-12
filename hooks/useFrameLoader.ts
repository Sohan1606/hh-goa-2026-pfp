"use client";

import { useState, useEffect } from "react";
import { loadImageFromUrl } from "@/lib/image";

export function useFrameLoader() {
  const [frameImage, setFrameImage] = useState<HTMLImageElement | null>(null);
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [frameError, setFrameError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const tryLoadFrame = async () => {
      const framePaths = [
        "/branding/frame-overlay.png",
        "/branding/frame-overlay.svg",
      ];

      for (const path of framePaths) {
        try {
          // HEAD check first to avoid noisy 404s in console
          const head = await fetch(path, { method: "HEAD" });
          if (!head.ok) continue;

          const img = await loadImageFromUrl(path);
          if (!cancelled) {
            setFrameImage(img);
            setFrameLoaded(true);
            return;
          }
        } catch {
          // try next
        }
      }

      if (!cancelled) {
        setFrameImage(null);
        setFrameLoaded(true);
        setFrameError(true);
      }
    };

    tryLoadFrame();
    return () => {
      cancelled = true;
    };
  }, []);

  return { frameImage, frameLoaded, frameError };
}