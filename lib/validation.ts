import { ValidationResult } from "@/types/image";

export const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export const ACCEPTED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
];

export const MAX_FILE_SIZE_MB = 25;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function validateFile(file: File | null | undefined): ValidationResult {
  if (!file) {
    return { valid: false, error: "No file selected.", state: "error" };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: "This file appears to be empty.",
      state: "error",
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is ${mb}MB. Maximum allowed is ${MAX_FILE_SIZE_MB}MB.`,
      state: "oversized",
    };
  }

  const extension = "." + (file.name.split(".").pop()?.toLowerCase() || "");
  const mimeType = (file.type || "").toLowerCase();

  const isHEIC =
    mimeType === "image/heic" ||
    mimeType === "image/heif" ||
    extension === ".heic" ||
    extension === ".heif";

  const isAcceptedMime = ACCEPTED_TYPES.includes(mimeType);
  const isAcceptedExt = ACCEPTED_EXTENSIONS.includes(extension);

  if (isHEIC) {
    return { valid: true };
  }

  if (!isAcceptedMime && !isAcceptedExt) {
    return {
      valid: false,
      error: "Unsupported format. Please upload JPG, PNG, WEBP, or HEIC.",
      state: "unsupported",
    };
  }

  return { valid: true };
}

export function isHEICFile(file: File): boolean {
  const ext = "." + (file.name.split(".").pop()?.toLowerCase() || "");
  const mime = (file.type || "").toLowerCase();
  return (
    mime === "image/heic" ||
    mime === "image/heif" ||
    ext === ".heic" ||
    ext === ".heif"
  );
}