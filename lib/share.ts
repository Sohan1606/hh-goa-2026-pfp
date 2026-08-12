export const SHARE_TEXT = `Just made my Hacker House Goa 2026 PFP 🚀\nReady to build.\n#FrameGoa`;

export async function shareToX(options: {
  blob?: Blob;
  hostedUrl?: string;
  filename?: string;
}): Promise<{ method: "webshare" | "intent"; success: boolean }> {
  const { blob, hostedUrl, filename = "hh-goa-2026-pfp.png" } = options;

  // Try Web Share API with the actual PNG file (best on mobile)
  if (blob && typeof navigator !== "undefined" && navigator.share && navigator.canShare) {
    try {
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Hacker House Goa 2026 PFP",
          text: SHARE_TEXT,
          files: [file],
        });
        return { method: "webshare", success: true };
      }
    } catch (err) {
      const name = (err as Error).name;
      if (name === "AbortError") {
        // User cancelled the share sheet — treat as success (no error UI)
        return { method: "webshare", success: true };
      }
      // Fall through to intent fallback
    }
  }

  // Fallback: open X compose window (image cannot be attached via web intent)
  openXIntent(hostedUrl);
  return { method: "intent", success: true };
}

export function openXIntent(hostedUrl?: string): void {
  const text = SHARE_TEXT + (hostedUrl ? `\n${hostedUrl}` : "");
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(xUrl, "_blank", "noopener,noreferrer");
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}