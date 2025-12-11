import React, { useState } from 'react';
import { CameraCapture } from './components/CameraCapture';
import { AnalysisView } from './components/AnalysisView';
import { analyzePlantImage } from './services/geminiService';
import { AnalysisResult } from './types';
import { Loader2 } from 'lucide-react';

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleImageSelected = async (base64Image: string) => {
    setImage(base64Image);
    setLoading(true);
    
    // Simulate network delay for better UX if response is too fast
    // and to show the loading state properly
    const minTime = new Promise(resolve => setTimeout(resolve, 1500));
    const analysisPromise = analyzePlantImage(base64Image);

    const [analysisResult] = await Promise.all([analysisPromise, minTime]);
    
    setResult(analysisResult);
    setLoading(false);
  };

  const handleReset = () => {
    setImage(null);
    setResult(null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center font-sans text-gray-900">
      
      {/* View Logic */}
      {!image && !loading && !result && (
        <CameraCapture onImageSelected={handleImageSelected} />
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center p-8 text-center animate-pulse">
          <div className="relative">
            <div className="absolute inset-0 bg-agri-500 rounded-full opacity-20 animate-ping"></div>
            <div className="relative bg-white p-4 rounded-full shadow-xl">
              <Loader2 className="w-12 h-12 text-agri-600 animate-spin" />
            </div>
          </div>
          <h2 className="mt-8 text-xl font-bold text-gray-800">Analizando Muestra...</h2>
          <p className="text-gray-500 mt-2">Nuestros algoritmos de visión artificial están procesando la hoja.</p>
          <div className="mt-6 w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-agri-500 animate-[loading_1.5s_ease-in-out_infinite] w-1/2"></div>
          </div>
        </div>
      )}

      {result && image && !loading && (
        <AnalysisView 
          result={result} 
          imageSrc={image} 
          onReset={handleReset} 
        />
      )}

      {/* Styles for loading animation */}
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default App;