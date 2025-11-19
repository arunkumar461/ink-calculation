
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

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      processUploadedImage(url, numKeys, blackGen);
    }
  }, [numKeys, blackGen]);

  const processUploadedImage = async (url: string, keys: number, bg: number) => {
    setIsProcessing(true);
    try {
      const results = await processImage(url, { numKeys: keys, blackGeneration: bg });
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
      processUploadedImage(image, numKeys, blackGen);
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

            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors relative overflow-hidden">
              {image ? (
                <img src={image} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-2" />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
                  <Upload size={32} className="mb-2" />
                  <p className="text-sm">Click or drag file to upload</p>
                  <p className="text-xs mt-1">JPG, PNG supported</p>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
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
