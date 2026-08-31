/**
 * Automatic Client-Side Image Compressor & Resizer
 * 
 * Ensures uploaded images are optimized for fast mobile rendering
 * and fit comfortably below Cloud Firestore's 1MB document limit.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: 'image/jpeg' | 'image/webp' | 'image/png';
}

export async function compressImageFile(
  file: File | Blob,
  options: CompressOptions = {}
): Promise<{ dataUrl: string; sizeKb: number; width: number; height: number }> {
  const {
    maxWidth = 1280,
    maxHeight = 960,
    quality = 0.82,
    mimeType = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        return reject(new Error('Failed to read image file.'));
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio preservation
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not create canvas context.'));
        }

        // Draw with high-quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed Data URL
        const dataUrl = canvas.toDataURL(mimeType, quality);
        const approxSizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);

        resolve({
          dataUrl,
          sizeKb: approxSizeKb,
          width,
          height
        });
      };

      img.onerror = () => {
        reject(new Error('Invalid image file format.'));
      };

      img.src = src;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file from storage.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validates and compresses any Base64 data URL if it exceeds 300KB
 */
export async function ensureSafeBase64Image(dataUrl: string): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image')) {
    return dataUrl;
  }

  // If already under 250KB, keep as is
  if (dataUrl.length < 350000) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > 1200) {
        height = Math.round((height * 1200) / width);
        width = 1200;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const compressed = canvas.toDataURL('image/jpeg', 0.8);
      resolve(compressed);
    };

    img.onerror = () => {
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}
