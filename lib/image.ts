export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to decode image. The file may be corrupted."));
    };
    img.src = url;
  });
}

export function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image from URL."));
    img.src = url;
  });
}

export function revokeObjectUrls(urls: string[]): void {
  urls.forEach((url) => {
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  });
}

export function getImageDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === "string") {
        resolve(e.target.result);
      } else {
        reject(new Error("Failed to read file."));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

/**
 * If an image is extremely large, downscale it to a maximum dimension.
 * This prevents memory issues and slow canvas operations on huge phone photos
 * (e.g. 12MP shots at 4032×3024 or larger).
 *
 * Returns a NEW HTMLImageElement backed by an off-screen canvas.
 * If image is already small enough, returns the original untouched.
 */
export async function downscaleImageIfHuge(
  img: HTMLImageElement,
  maxDimension = 2400
): Promise<HTMLImageElement> {
  const { naturalWidth: w, naturalHeight: h } = img;

  if (w <= maxDimension && h <= maxDimension) {
    return img;
  }

  const ratio = Math.min(maxDimension / w, maxDimension / h);
  const newW = Math.round(w * ratio);
  const newH = Math.round(h * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = newW;
  canvas.height = newH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return img;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, newW, newH);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to downscale image."));
          return;
        }
        const url = URL.createObjectURL(blob);
        const scaledImg = new Image();
        scaledImg.onload = () => resolve(scaledImg);
        scaledImg.onerror = () => reject(new Error("Failed to load downscaled image."));
        scaledImg.src = url;
      },
      "image/jpeg",
      0.92
    );
  });
}