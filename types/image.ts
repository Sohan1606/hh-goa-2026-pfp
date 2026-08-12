export type ImageState =
  | "empty"
  | "uploading"
  | "loaded"
  | "editing"
  | "generating"
  | "generated"
  | "error"
  | "unsupported"
  | "oversized"
  | "heic-converting";

export interface ImagePosition {
  x: number;
  y: number;
  scale: number;
}

export interface GeneratedResult {
  blob: Blob;
  objectUrl: string;
  filename: string;
  hostedUrl?: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  state?: ImageState;
}