/**
 * Automatic Client-Side Image Compressor
 * Resizes and compresses uploaded images into optimized WebP format,
 * targeting ~200KB - 500KB while preserving pristine visual fidelity.
 * 100% automated — seamless for all product and banner image uploads.
 */
export async function compressImage(
  file: File,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    targetMinKb?: number;
    targetMaxKb?: number;
  },
): Promise<File> {
  // If file is SVG or gif (animated), do not compress
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  const maxWidth = options?.maxWidth ?? 1800;
  const maxHeight = options?.maxHeight ?? 1800;
  const targetMinKb = options?.targetMinKb ?? 200;
  const targetMaxKb = options?.targetMaxKb ?? 500;

  return new Promise((resolve) => {
    // If not in browser environment, return original
    if (typeof window === "undefined" || typeof document === "undefined") {
      resolve(file);
      return;
    }

    const img = document.createElement("img");
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Downscale if dimensions exceed limits
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Iterative quality check to achieve ~200kb - 500kb
      async function getBlobWithQuality(quality: number): Promise<Blob | null> {
        return new Promise((res) => {
          canvas.toBlob(
            (b) => res(b),
            "image/webp",
            quality,
          );
        });
      }

      try {
        let quality = 0.85;
        let blob = await getBlobWithQuality(quality);

        if (!blob) {
          resolve(file);
          return;
        }

        const sizeKb = blob.size / 1024;

        if (sizeKb > targetMaxKb) {
          // Downward calibrate quality
          blob = (await getBlobWithQuality(0.75)) ?? blob;
          if (blob.size / 1024 > targetMaxKb) {
            blob = (await getBlobWithQuality(0.68)) ?? blob;
          }
        } else if (sizeKb < targetMinKb && file.size / 1024 > targetMinKb) {
          // Can afford higher quality
          const higherBlob = await getBlobWithQuality(0.92);
          if (higherBlob && higherBlob.size / 1024 <= targetMaxKb) {
            blob = higherBlob;
          }
        }

        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const compressedFile = new File([blob], `${baseName}.webp`, {
          type: "image/webp",
          lastModified: Date.now(),
        });

        resolve(compressedFile);
      } catch (err) {
        console.warn("Image compression failed, using original:", err);
        resolve(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}
