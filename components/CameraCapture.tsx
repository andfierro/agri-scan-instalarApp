import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, Leaf, X, Download, Share2, Info } from 'lucide-react';

interface CameraCaptureProps {
  onImageSelected: (base64: string) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onImageSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  // Check for Install Prompt and iOS
  useEffect(() => {
    // Android/Chrome Install Prompt
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Check if iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Manage Camera Stream Lifecycle
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const startStream = async () => {
      if (isCameraOpen) {
        setCameraError(null);
        try {
          try {
            currentStream = await navigator.mediaDevices.getUserMedia({ 
              video: { facingMode: 'environment' } 
            });
          } catch (err) {
            console.warn("Environment camera failed, trying fallback...", err);
            currentStream = await navigator.mediaDevices.getUserMedia({ video: true });
          }
          
          if (videoRef.current) {
            videoRef.current.srcObject = currentStream;
            try {
              await videoRef.current.play();
            } catch (e) {
              console.error("Error playing video:", e);
            }
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          setCameraError("No se pudo acceder a la cámara. Intente usar la opción de subir archivo.");
          setIsCameraOpen(false);
        }
      }
    };

    startStream();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOpen]);

  const openCamera = () => setIsCameraOpen(true);
  const stopCamera = () => setIsCameraOpen(false);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64String = canvas.toDataURL('image/jpeg', 0.85);
        stopCamera();
        onImageSelected(base64String);
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelected(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AgriScan',
          text: 'Instala AgriScan para detectar enfermedades en plantas.',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  if (isCameraOpen) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
          <video 
            ref={videoRef}
            autoPlay 
            playsInline
            muted 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-agri-500/50 relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-agri-500 -mt-1 -ml-1"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-agri-500 -mt-1 -mr-1"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-agri-500 -mb-1 -ml-1"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-agri-500 -mb-1 -mr-1"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <p className="text-agri-500/80 text-xs font-mono bg-black/50 px-2 rounded">AI SCANNING</p>
              </div>
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
        <div className="h-32 bg-gray-900 flex items-center justify-around px-8 pb-8 pt-4">
           <button onClick={stopCamera} className="p-4 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors">
            <X className="w-6 h-6" />
          </button>
          <button onClick={capturePhoto} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-transparent hover:bg-white/10 transition-all active:scale-95">
            <div className="w-16 h-16 rounded-full bg-white"></div>
          </button>
          <div className="w-14"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8 animate-fade-in max-w-md mx-auto w-full">
        
        <div className="space-y-4">
          <div className="w-24 h-24 bg-gradient-to-br from-agri-100 to-agri-200 text-agri-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-white">
            <Leaf className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">AgriScan</h1>
          <p className="text-gray-500 max-w-xs mx-auto">
            Sistema de detección de enfermedades foliares basado en Visión Artificial e IoT.
          </p>
        </div>

        <div className="w-full space-y-4 pt-4">
          {cameraError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
              {cameraError}
            </div>
          )}

          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <button 
            onClick={openCamera}
            className="w-full bg-agri-600 hover:bg-agri-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-agri-600/30 hover:shadow-agri-600/50 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <Camera className="w-6 h-6" />
            <span>Iniciar Escaneo</span>
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-2xl border border-gray-200 shadow-sm transition-all active:scale-95 flex items-center justify-center gap-3"
          >
              <Upload className="w-6 h-6 text-gray-400" />
              <span>Subir desde Galería</span>
          </button>
        </div>

        {/* Install / Share Section */}
        <div className="w-full pt-4 border-t border-gray-100 space-y-3">
          
          {installPrompt && (
            <button 
              onClick={handleInstallClick}
              className="w-full bg-gray-900 text-white font-medium py-3 px-6 rounded-xl shadow-md active:scale-95 flex items-center justify-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Instalar App en el Celular
            </button>
          )}

          {isIOS && (
            <div className="bg-blue-50 p-4 rounded-xl text-left flex gap-3 text-blue-800 border border-blue-100">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">Para instalar en iPhone:</p>
                <p>Toca el botón <strong>Compartir</strong> <span className="inline-block px-1 bg-gray-200 rounded text-gray-600 text-xs">⎋</span> abajo y selecciona <strong>"Agregar al inicio"</strong>.</p>
              </div>
            </div>
          )}

          <button 
            onClick={handleShare}
            className="w-full text-agri-700 font-medium py-2 px-6 rounded-xl hover:bg-agri-50 active:scale-95 flex items-center justify-center gap-2 text-sm"
          >
            <Share2 className="w-4 h-4" />
            Compartir enlace de descarga
          </button>
        </div>
      </div>
      
      <div className="text-center py-4 text-xs text-gray-400">
        Proyecto de Tesis - v1.1.0
      </div>
    </div>
  );
};