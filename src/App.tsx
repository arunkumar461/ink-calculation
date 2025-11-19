
import React, { useState, useCallback } from 'react';
import { Upload, Settings, Printer, AlertCircle } from 'lucide-react';
import { processImage, InkLevels } from './utils/imageProcessing';
import { InkZoneChart } from './components/InkZoneChart';

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [inkLevels, setInkLevels] = useState<InkLevels | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [numKeys, setNumKeys] = useState(34);
  const [blackGen, setBlackGen] = useState(0.7);
  const [rotation, setRotation] = useState(0);
  const [plateWidth, setPlateWidth] = useState(1030); // mm
  const [imageWidth, setImageWidth] = useState(600); // mm
  const [showOverlay, setShowOverlay] = useState(true);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      setRotation(0); // Reset rotation on new file
      // Reset image width to something reasonable or keep previous? 
      // Let's keep previous for now, or maybe default to half plate?
      processUploadedImage(url, numKeys, blackGen, 0, plateWidth, imageWidth);
    }
  }, [numKeys, blackGen, plateWidth, imageWidth]);

  const processUploadedImage = async (url: string, keys: number, bg: number, rot: number, pWidth: number, iWidth: number) => {
    setIsProcessing(true);
    try {
      const results = await processImage(url, {
        numKeys: keys,
        blackGeneration: bg,
        rotation: rot,
        plateWidth: pWidth,
        imageWidth: iWidth
      });
      setInkLevels(results);
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Failed to process image");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReProcess = () => {
    if (image) {
      processUploadedImage(image, numKeys, blackGen, rotation, plateWidth, imageWidth);
    }
  };

  const rotateImage = () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    if (image) {
      processUploadedImage(image, numKeys, blackGen, newRotation, plateWidth, imageWidth);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Printer size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">InkKey Calculator</h1>
            <p className="text-sm text-gray-500">Offset Press Ink Zone Estimation</p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Web Edition
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Sidebar: Controls & Preview */}
        <div className="lg:col-span-1 space-y-6">

          {/* Upload Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Upload size={18} /> Input Source
            </h2>

            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors relative overflow-hidden bg-gray-100">
              {image ? (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  <img
                    src={image}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain transition-transform duration-300"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  />
                  {/* Grid Overlay */}
                  {showOverlay && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        transform: `rotate(${rotation}deg)`,
                        // We need the grid to match the image aspect ratio and size. 
                        // This is tricky with CSS only. For now, let's just show a generic grid 
                        // or we can rely on the fact that the user needs to see the ZONES.
                        // A simple CSS grid might not align perfectly with the image content if object-contain leaves gaps.
                        // Better approach: Render the grid INSIDE the image container if possible, 
                        // but for now let's just show a warning or simple lines if it fills the area.
                      }}
                    >
                      {/* 
                          To do this perfectly, we'd need to know the rendered dimensions of the image.
                          For this MVP, let's just rely on the rotation feature and add the overlay 
                          toggle as a concept, but maybe implement it simply as "Vertical Lines" 
                          that might not perfectly align with the scaled image in CSS.
                          
                          Actually, let's skip the complex CSS overlay for this step and focus on Rotation 
                          which is the critical part for "Alignment".
                       */}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
                  <Upload size={32} className="mb-2" />
                  <p className="text-sm">Click or drag file to upload</p>
                  <p className="text-xs mt-1">JPG, PNG supported</p>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>

            {image && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={(e) => { e.preventDefault(); rotateImage(); }}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <Settings size={14} className="rotate-45" /> Rotate 90°
                </button>
              </div>
            )}
          </div>

          {/* Settings Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Settings size={18} /> Press Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Ink Keys
                </label>
                <input
                  type="number"
                  value={numKeys}
                  onChange={(e) => setNumKeys(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plate Width (mm)
                </label>
                <input
                  type="number"
                  value={plateWidth}
                  onChange={(e) => setPlateWidth(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image Width (mm)
                </label>
                <input
                  type="number"
                  value={imageWidth}
                  onChange={(e) => setImageWidth(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">The physical width of the printed area.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Black Generation (GCR)
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={blackGen}
                  onChange={(e) => setBlackGen(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Low (Rich Black)</span>
                  <span>High (Save Ink)</span>
                </div>
              </div>

              <button
                onClick={handleReProcess}
                disabled={!image || isProcessing}
                className="w-full bg-gray-900 text-white py-2 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Calculating...' : 'Recalculate'}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>
                <strong>Note on Accuracy:</strong> This tool estimates CMYK values from your RGB image. For 100% match with your plates, use the "Black Generation" slider to match your RIP settings.
              </p>
            </div>
          </div>

        </div>

        {/* Right Content: Charts */}
        <div className="lg:col-span-2 space-y-6">
          {inkLevels ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold mb-6 text-lg">Ink Coverage Analysis</h2>

              <InkZoneChart color="c" data={inkLevels.c} />
              <InkZoneChart color="m" data={inkLevels.m} />
              <InkZoneChart color="y" data={inkLevels.y} />
              <InkZoneChart color="k" data={inkLevels.k} />

              <div className="mt-8 grid grid-cols-4 gap-4 text-center border-t pt-6">
                <div>
                  <div className="text-2xl font-bold text-cyan-600">
                    {Math.round(inkLevels.c.reduce((a, b) => a + b, 0) / numKeys)}%
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Cyan Avg</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-magenta-600">
                    {Math.round(inkLevels.m.reduce((a, b) => a + b, 0) / numKeys)}%
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Magenta Avg</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {Math.round(inkLevels.y.reduce((a, b) => a + b, 0) / numKeys)}%
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Yellow Avg</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {Math.round(inkLevels.k.reduce((a, b) => a + b, 0) / numKeys)}%
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Black Avg</div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Printer className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Calculate</h3>
              <p className="text-gray-500 max-w-md">
                Upload a print layout image to analyze ink coverage and generate key zone presets.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
