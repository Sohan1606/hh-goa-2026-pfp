export const SHARE_TEXT_PFP = `Just made my Hacker House Goa 2026 PFP 🚀\nReady to build.\n#FrameInGoa #HHGoa26`;

export function shareTextBuilder(name: string, stack: string): string {
  return `Just locked in my HH Goa 2026 Builder ID 🌴⚡\n\nBuilder: ${name || "—"}\nStack: ${stack || "—"}\n\nBuild weird things. Ship fast. Bring them to Goa.\n\n#FrameInGoa #HHGoa26`;
}

export function shareTextTeam(names: string[]): string {
  const list = names.filter((n) => n.trim()).map((n) => `- ${n}`).join("\n");
  return `Team locked in for HH Goa 2026 🌴⚡\n\nBuilders:\n${list || "- —"}\n\n#FrameInGoa #HHGoa26`;
}

export async function shareGeneric(options: {
  text: string;
  blob?: Blob;
  hostedUrl?: string;
  filename?: string;
  title?: string;
}): Promise<{ method: "webshare" | "intent"; success: boolean }> {
  const {
    text,
    blob,
    hostedUrl,
    filename = "hh-goa-2026.png",
    title = "HH Goa 2026",
  } = options;

  if (blob && typeof navigator !== "undefined" && navigator.share && navigator.canShare) {
    try {
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ title, text, files: [file] });
        return { method: "webshare", success: true };
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        return { method: "webshare", success: true };
      }
    }
  }

  openXIntentWithText(text, hostedUrl);
  return { method: "intent", success: true };
}

// Backward-compat wrapper used by the existing PFP result component
export async function shareToX(options: {
  blob?: Blob;
  hostedUrl?: string;
  filename?: string;
}): Promise<{ method: "webshare" | "intent"; success: boolean }> {
  return shareGeneric({
    text: SHARE_TEXT_PFP,
    blob: options.blob,
    hostedUrl: options.hostedUrl,
    filename: options.filename ?? "hh-goa-2026-pfp.png",
    title: "Hacker House Goa 2026 PFP",
  });
}

export function openXIntent(hostedUrl?: string): void {
  openXIntentWithText(SHARE_TEXT_PFP, hostedUrl);
}

export function openXIntentWithText(text: string, hostedUrl?: string): void {
  const full = text + (hostedUrl ? `\n${hostedUrl}` : "");
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(full)}`;
  window.open(url, "_blank", "noopener,noreferrer");
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