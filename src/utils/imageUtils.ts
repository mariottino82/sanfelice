/**
 * Image processing & upload utility
 * Resizes and adapts uploaded images using HTML5 Canvas before uploading
 * to ensure optimal aspect ratios, file size, and fast rendering.
 */

export async function resizeImage(
  file: File,
  maxWidth = 1400,
  maxHeight = 1400,
  quality = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Impossibile leggere il file immagine.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Impossibile caricare l\'immagine.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate scaling ratio
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context non disponibile'));
          return;
        }

        // Use high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Errore durante la compressione dell\'immagine.'));
            }
          },
          mimeType,
          quality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Resizes an image file and uploads it to the server.
 * Returns the uploaded relative path (e.g. `/uploads/images/img-123.jpg`).
 */
export async function resizeAndUploadImage(
  file: File,
  endpoint = '/api/upload-image',
  fieldName = 'image'
): Promise<string> {
  let blobToSend: Blob = file;
  let fileName = file.name;

  try {
    if (file.type && file.type.startsWith('image/')) {
      try {
        blobToSend = await resizeImage(file);
        fileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
      } catch (resizeErr) {
        console.warn('Image resizing skipped or failed, uploading original file:', resizeErr);
        blobToSend = file;
        fileName = file.name;
      }
    }
  } catch (err) {
    console.warn('Error in resize step, falling back to original file:', err);
    blobToSend = file;
  }

  const formData = new FormData();
  formData.append(fieldName, blobToSend, fileName);

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Errore del server durante il caricamento (${response.status})`);
  }

  const data = await response.json();
  const uploadedPath = data.path || data.url;
  if (!uploadedPath) {
    throw new Error('Nessun percorso restituito dal server');
  }
  return uploadedPath;
}
