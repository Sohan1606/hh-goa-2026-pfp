export async function convertHEICToJPEG(file: File): Promise<File> {
  try {
    // Dynamic import to avoid SSR issues
    const heic2any = (await import("heic2any")).default;

    const result = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.92,
    });

    const blob = Array.isArray(result) ? result[0] : result;
    const convertedFile = new File(
      [blob],
      file.name.replace(/\.(heic|heif)$/i, ".jpg"),
      { type: "image/jpeg" }
    );

    return convertedFile;
  } catch (error) {
    console.error("HEIC conversion failed:", error);
    throw new Error(
      "Could not convert HEIC image. Please convert to JPG or PNG first."
    );
  }
}