
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
  // Standard Komori Lithrone 40" plate is approx 40.5 inches wide.
  // 40.5 inches = 1028.7 mm -> ~1029 mm.
  const PLATE_WIDTH_MM = 1029;
  const [printWidthInch, setPrintWidthInch] = useState<number>(40); // Default to full width
  const [showOverlay, setShowOverlay] = useState(true);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      setRotation(0); // Reset rotation on new file
      // Process with default full width
      processUploadedImage(url, numKeys, blackGen, 0, printWidthInch);
    }
  }, [numKeys, blackGen, printWidthInch]);

  const processUploadedImage = async (url: string, keys: number, bg: number, rot: number, widthInch: number) => {
    setIsProcessing(true);
    try {
      const results = await processImage(url, {
        numKeys: keys,
        blackGeneration: bg,
        rotation: rot,
        plateWidth: PLATE_WIDTH_MM,
        imageWidth: widthInch * 25.4 // Convert inches to mm
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
      processUploadedImage(image, numKeys, blackGen, rotation, printWidthInch);
    }
  };

  const rotateImage = () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    if (image) {
      processUploadedImage(image, numKeys, blackGen, newRotation, printWidthInch);
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
              <Upload size={18} /> Plate Simulation
            </h2>

            {/* Plate Visualizer */}
            <div className="bg-gray-800 rounded p-1 mb-4 relative shadow-inner">
              <div className="text-[10px] text-gray-400 text-center mb-1">Plate: 40.5" x 28" (Komori)</div>
              <label className="flex flex-col items-center justify-end w-full h-48 border-2 border-dashed border-gray-600 rounded bg-gray-700 cursor-pointer hover:bg-gray-600 transition-colors relative overflow-hidden">
                {image ? (
                  <div className="relative w-full h-full flex items-end justify-center overflow-hidden pb-1">
                    {/* The Image representing the paper/print */}
                    <img
                      src={image}
                      alt="Preview"
                      className="object-contain transition-transform duration-300 shadow-xl bg-white"
                      style={{
                        transform: `rotate(${rotation}deg)`,
                        width: `${(printWidthInch / 40) * 100}%`, // Relative width to plate
                        maxHeight: '90%'
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400 h-full">
                    <Upload size={32} className="mb-2" />
                    <p className="text-sm">Click to Mount Image</p>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>

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
                  Print Width (Inches)
                </label>
                <select
                  value={printWidthInch}
                  onChange={(e) => setPrintWidthInch(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value={40}>Full Plate (40")</option>
                  <option value={32}>Large Sheet (32")</option>
                  <option value={20}>Half Sheet (20")</option>
                  <option value={19}>19 inches</option>
                  <option value={11.7}>A3 Landscape (16.5")</option>
                  <option value={8.3}>A4 Landscape (11.7")</option>
                </select>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    value={printWidthInch}
                    onChange={(e) => setPrintWidthInch(Number(e.target.value))}
                    className="w-20 text-sm border border-gray-300 rounded px-2 py-1"
                  />
                  <span className="text-sm text-gray-500">Custom "</span>
                </div>
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
