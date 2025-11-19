
export interface InkLevels {
  c: number[];
  m: number[];
  y: number[];
  k: number[];
}

export interface ProcessImageOptions {
  numKeys: number;
  blackGeneration: number; // 0 to 1
  rotation: number; // 0, 90, 180, 270
  plateWidth: number; // e.g. 1030 mm
  imageWidth: number; // e.g. 600 mm
}

/**
 * Converts RGB to CMYK using a standard formula with GCR adjustment.
 * Returns values 0-100.
 */
function rgbToCmyk(r: number, g: number, b: number, blackGeneration: number = 0.7): { c: number, m: number, y: number, k: number } {
  let c = 1 - (r / 255);
  let m = 1 - (g / 255);
  let y = 1 - (b / 255);
  let k = Math.min(c, m, y) * blackGeneration;

  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  c = (c - k) / (1 - k);
  m = (m - k) / (1 - k);
  y = (y - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100)
  };
}

export const processImage = (
  imageSrc: string,
  options: ProcessImageOptions
): Promise<InkLevels> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // We process the image at a reasonable resolution to balance speed and accuracy
      // The height doesn't need to be full res, but width should be enough to split into keys
      const processWidth = 2000;
      const scale = processWidth / img.width;
      const processHeight = Math.round(img.height * scale);

      // Handle Rotation
      let finalWidth = processWidth;
      let finalHeight = processHeight;

      if (options.rotation === 90 || options.rotation === 270) {
        canvas.width = processHeight;
        canvas.height = processWidth;
        finalWidth = processHeight;
        finalHeight = processWidth;
      } else {
        canvas.width = processWidth;
        canvas.height = processHeight;
      }

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((options.rotation * Math.PI) / 180);
      ctx.drawImage(img, -processWidth / 2, -processHeight / 2, processWidth, processHeight);
      ctx.restore();

      // --- PLATE MOUNTING LOGIC ---
      // 1. Determine the pixel-to-physical ratio based on the image's intended physical width
      // finalWidth is the pixel width of the rotated image
      const pixelsPerUnit = finalWidth / options.imageWidth;

      // 2. Calculate Plate dimensions in pixels
      const plateWidthPx = Math.round(options.plateWidth * pixelsPerUnit);
      // Plate height isn't strictly defined by inputs, but we need enough to hold the image.
      // Let's make the plate canvas the same height as the image (plus padding if we wanted, but vertical position doesn't affect ink keys much unless we did vertical segmentation).
      // Actually, for "Center Bottom", we just need to place it horizontally correct.
      // Vertical placement doesn't change the *vertical column* sum. 
      // So we can just create a canvas of `plateWidthPx` width and `finalHeight` height.
      // And draw the image at the correct X offset.

      const plateCanvas = document.createElement('canvas');
      plateCanvas.width = plateWidthPx;
      plateCanvas.height = finalHeight;
      const plateCtx = plateCanvas.getContext('2d');

      if (!plateCtx) {
        reject(new Error("Could not get plate canvas context"));
        return;
      }

      // Fill with white (0 ink)
      plateCtx.fillStyle = '#FFFFFF';
      plateCtx.fillRect(0, 0, plateWidthPx, finalHeight);

      // Calculate X offset to center the image
      const xOffset = (plateWidthPx - finalWidth) / 2;

      // Draw the rotated image onto the plate canvas
      // We need to draw the *rotated* version we just calculated.
      // Since we already have `imageData` of the rotated image, let's put that on a temp canvas first or just use putImageData
      // But putImageData ignores globalCompositeOperation if we needed it. 
      // Simpler: We already have the rotated image drawn on `canvas`.

      plateCtx.drawImage(canvas, xOffset, 0);

      // Now we analyze the PLATE canvas
      const finalData = plateCtx.getImageData(0, 0, plateWidthPx, finalHeight).data;

      const zoneWidth = plateWidthPx / options.numKeys;

      // Initialize accumulators
      const cLevels = new Float32Array(options.numKeys);
      const mLevels = new Float32Array(options.numKeys);
      const yLevels = new Float32Array(options.numKeys);
      const kLevels = new Float32Array(options.numKeys);
      const pixelCounts = new Float32Array(options.numKeys);

      // Iterate through all pixels of the PLATE
      for (let y = 0; y < finalHeight; y++) {
        for (let x = 0; x < plateWidthPx; x++) {
          const i = (y * plateWidthPx + x) * 4;
          const r = finalData[i];
          const g = finalData[i + 1];
          const b = finalData[i + 2];
          // Treat transparent as white
          const a = finalData[i + 3];

          if (a < 10) {
            // Transparent = No Ink. 
            // rgbToCmyk(255,255,255) -> 0,0,0,0
            // So let's just process it as white.
          }

          const cmyk = rgbToCmyk(r, g, b, options.blackGeneration);

          const zoneIndex = Math.min(Math.floor(x / zoneWidth), options.numKeys - 1);

          cLevels[zoneIndex] += cmyk.c;
          mLevels[zoneIndex] += cmyk.m;
          yLevels[zoneIndex] += cmyk.y;
          kLevels[zoneIndex] += cmyk.k;
          pixelCounts[zoneIndex]++;
        }
      }

      // Average out the values
      const result: InkLevels = {
        c: [], m: [], y: [], k: []
      };

      for (let i = 0; i < options.numKeys; i++) {
        const count = pixelCounts[i] || 1;
        result.c.push(Math.round(cLevels[i] / count));
        result.m.push(Math.round(mLevels[i] / count));
        result.y.push(Math.round(yLevels[i] / count));
        result.k.push(Math.round(kLevels[i] / count));
      }

      resolve(result);
    };
    img.onerror = (err) => reject(err);
    img.src = imageSrc;
  });
};
