/**
 * Client-Side Image & Avatar Compressor
 * 
 * Uses HTML5 Canvas to:
 * 1. Center-crop rectangular camera photos to a 1:1 square avatar.
 * 2. Downscale dimensions to optimal avatar resolution (e.g., 400x400 px).
 * 3. Compress output to modern, lightweight WebP (reducing 4MB+ JPEGs to ~30-50KB).
 * 4. Runs 100% locally in the browser with zero third-party dependencies.
 */

export interface CompressionOptions {
  /** Maximum output width in pixels (default: 400) */
  maxWidth?: number;
  /** Maximum output height in pixels (default: 400) */
  maxHeight?: number;
  /** WebP compression quality from 0.1 to 1.0 (default: 0.85) */
  quality?: number;
  /** Whether to center-crop to a 1:1 square aspect ratio (default: true for avatars) */
  cropSquare?: boolean;
}

export async function compressAvatarImage(
  file: File,
  options: CompressionOptions = {}
): Promise<{
  blob: Blob;
  file: File;
  previewUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  compressionRatio: string;
}> {
  const {
    maxWidth = 400,
    maxHeight = 400,
    quality = 0.85,
    cropSquare = true,
  } = options;

  return new Promise((resolve, reject) => {
    // 1. Read file as an Image element
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Failed to read image file."));

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => reject(new Error("Failed to decode image data."));

      img.onload = () => {
        try {
          const originalWidth = img.naturalWidth || img.width;
          const originalHeight = img.naturalHeight || img.height;

          let sourceX = 0;
          let sourceY = 0;
          let sourceWidth = originalWidth;
          let sourceHeight = originalHeight;

          let targetWidth = maxWidth;
          let targetHeight = maxHeight;

          if (cropSquare) {
            // Calculate center-crop coordinates for 1:1 aspect ratio
            const minDimension = Math.min(originalWidth, originalHeight);
            sourceWidth = minDimension;
            sourceHeight = minDimension;
            sourceX = (originalWidth - minDimension) / 2;
            sourceY = (originalHeight - minDimension) / 2;

            targetWidth = Math.min(minDimension, maxWidth);
            targetHeight = Math.min(minDimension, maxHeight);
          } else {
            // Preserve aspect ratio
            const scale = Math.min(maxWidth / originalWidth, maxHeight / originalHeight, 1);
            targetWidth = Math.round(originalWidth * scale);
            targetHeight = Math.round(originalHeight * scale);
          }

          // 2. Render onto off-screen canvas
          const canvas = document.createElement("canvas");
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          const ctx = canvas.getContext("2d", { alpha: true });
          if (!ctx) {
            return reject(new Error("Could not access 2D canvas context."));
          }

          // High quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          ctx.drawImage(
            img,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            targetWidth,
            targetHeight
          );

          // 3. Export as WebP Blob (fallback to JPEG if browser doesn't support WebP canvas export)
          const exportMime = canvas.toDataURL("image/webp").startsWith("data:image/webp")
            ? "image/webp"
            : "image/jpeg";

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return reject(new Error("Canvas compression failed to generate blob."));
              }

              const compressedFile = new File(
                [blob],
                `${file.name.replace(/\.[^/.]+$/, "")}.webp`,
                { type: exportMime }
              );

              const previewUrl = URL.createObjectURL(blob);
              const originalSizeBytes = file.size;
              const compressedSizeBytes = blob.size;
              const savedPct = (
                ((originalSizeBytes - compressedSizeBytes) / originalSizeBytes) *
                100
              ).toFixed(1);

              resolve({
                blob,
                file: compressedFile,
                previewUrl,
                originalSizeBytes,
                compressedSizeBytes,
                compressionRatio: `${savedPct}% smaller`,
              });
            },
            exportMime,
            quality
          );
        } catch (err) {
          reject(err);
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
