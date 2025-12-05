
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

          {/* Controls */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Upload size={18} /> Controls
            </h2>

            <label className="block w-full text-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors p-4 mb-4">
              <div className="flex flex-col items-center justify-center text-gray-500">
                <Upload size={32} className="mb-2" />
                <span className="text-sm">{image ? 'Change Image' : 'Upload Image'}</span>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>

            {image && (
              <button
                onClick={(e) => { e.preventDefault(); rotateImage(); }}
                className="w-full mb-4 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Settings size={14} className="rotate-45" /> Rotate 90°
              </button>
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

        {/* Right Content: Report View */}
        <div className="lg:col-span-2 space-y-8">

          {/* Main Paper/Plate View using standard width alignment */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex justify-between items-end mb-2 border-b pb-2">
              <div>
                <h2 className="text-lg font-bold">Job Visualization</h2>
                <p className="text-xs text-gray-500">Plate: 40.5" x 28" | Paper: {printWidthInch}" width</p>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-gray-600 uppercase tracking-tighter">Measurement: Reading</div>
              </div>
            </div>

            {/* Plate Rectangle */}
            <div className="w-full bg-gray-100 border border-gray-300 relative aspect-[1.45/1] flex items-end justify-center mb-6 overflow-hidden">
              {/* Center marker */}
              <div className="absolute top-0 bottom-0 left-1/2 w-px bg-red-400 opacity-50 z-10"></div>

              {image ? (
                <img
                  src={image}
                  alt="Print Job"
                  className="origin-bottom transition-transform duration-300 shadow-md bg-white z-0"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    width: `${(printWidthInch / 40.5) * 100}%`,
                    maxHeight: '90%'
                  }}
                />
              ) : (
                <div className="text-gray-400 font-medium">No Job Loaded</div>
              )}

              {/* Zone Grid Overlay */}
              <div className="absolute inset-0 flex pointer-events-none">
                {[...Array(numKeys)].map((_, i) => (
                  <div key={i} className="flex-1 border-r border-gray-300 last:border-r-0 opacity-20"></div>
                ))}
              </div>
            </div>

            {/* Stacking Charts */}
            {inkLevels && (
              <div className="space-y-4">
                <InkZoneChart color="c" data={inkLevels.c} />
                <InkZoneChart color="m" data={inkLevels.m} />
                <InkZoneChart color="y" data={inkLevels.y} />
                <InkZoneChart color="k" data={inkLevels.k} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
