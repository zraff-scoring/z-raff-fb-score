/**
 * Compresses an uploaded image file and returns a Base64 data URL.
 * Resizes the image to keep it lightweight (under 20KB typically) so it can
 * be saved directly into Firestore or local state without hitting size limits.
 */
export function compressAndEncodeImage(file: File, maxDimension = 180): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check if it is an image
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions preserving aspect ratio
          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }

          // Clear canvas and draw resized image
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Export as WebP or JPEG with quality 0.75 for super compact size
          const outputType = file.type === 'image/gif' ? 'image/gif' : 'image/webp';
          const compressedBase64 = canvas.toDataURL(outputType, 0.75);
          resolve(compressedBase64);
        } catch (err) {
          // Fallback to original base64 if canvas operation fails
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => {
        resolve(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
