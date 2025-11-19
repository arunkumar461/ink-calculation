
export interface InkLevels {
  c: number[];
  m: number[];
  y: number[];
  k: number[];
}

export interface ProcessImageOptions {
  numKeys: number;
  blackGeneration: number; // 0 to 1, controls GCR
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

      canvas.width = processWidth;
      canvas.height = processHeight;

      // Draw image to canvas
      ctx.drawImage(img, 0, 0, processWidth, processHeight);

      const imageData = ctx.getImageData(0, 0, processWidth, processHeight);
      const data = imageData.data;

      const zoneWidth = processWidth / options.numKeys;

      // Initialize accumulators
      const cLevels = new Float32Array(options.numKeys);
      const mLevels = new Float32Array(options.numKeys);
      const yLevels = new Float32Array(options.numKeys);
      const kLevels = new Float32Array(options.numKeys);
      const pixelCounts = new Float32Array(options.numKeys);

      // Iterate through all pixels
      for (let y = 0; y < processHeight; y++) {
        for (let x = 0; x < processWidth; x++) {
          const i = (y * processWidth + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // alpha = data[i+3] - ignored for now, assuming white background if transparent?
          // Actually, if transparent, we should probably treat as white (0 ink).
          const a = data[i + 3];

          if (a < 10) continue; // Skip transparent pixels

          // Blend with white background if semi-transparent
          // Simple approximation: just use the RGB values as is if opaque

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
