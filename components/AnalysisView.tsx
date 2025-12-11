import React from 'react';
import { AnalysisResult, HealthStatus } from '../types';
import { CheckCircle, AlertTriangle, AlertOctagon, Activity, Thermometer, Info } from 'lucide-react';

interface AnalysisViewProps {
  result: AnalysisResult;
  imageSrc: string;
  onReset: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ result, imageSrc, onReset }) => {
  const isHealthy = result.status === HealthStatus.HEALTHY;
  const isDiseased = result.status === HealthStatus.DISEASED;
  const isError = !result.isPlant;

  let statusColor = "text-gray-600 bg-gray-100 border-gray-200";
  let statusIcon = <Info className="w-6 h-6" />;
  
  if (isHealthy) {
    statusColor = "text-green-700 bg-green-50 border-green-200";
    statusIcon = <CheckCircle className="w-8 h-8 text-green-600" />;
  } else if (isDiseased) {
    statusColor = "text-red-700 bg-red-50 border-red-200";
    statusIcon = <AlertTriangle className="w-8 h-8 text-red-600" />;
  } else if (isError) {
    statusColor = "text-orange-700 bg-orange-50 border-orange-200";
    statusIcon = <AlertOctagon className="w-8 h-8 text-orange-600" />;
  }

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto bg-white shadow-xl overflow-hidden md:rounded-2xl animate-fade-in">
      {/* Image Header */}
      <div className="relative h-64 bg-gray-900">
        <img 
          src={imageSrc} 
          alt="Analysis Target" 
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
          <div className="text-white">
            <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Resultado del Análisis</p>
            <h2 className="text-3xl font-bold mt-1">{result.diseaseName || "Objeto detectado"}</h2>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Status Card */}
        <div className={`p-4 rounded-xl border ${statusColor} flex items-center gap-4 shadow-sm`}>
          <div className="p-2 bg-white rounded-full shadow-sm">
            {statusIcon}
          </div>
          <div>
            <p className="text-sm font-semibold opacity-75 uppercase">Diagnóstico</p>
            <p className="text-xl font-bold">{result.status}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs font-semibold opacity-75">Confianza</p>
            <p className="text-lg font-bold">{result.confidence}%</p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-800">
            <Activity className="w-5 h-5 text-agri-600" />
            <h3 className="font-bold text-lg">Análisis Técnico</h3>
          </div>
          <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg text-sm border border-gray-100">
            {result.description}
          </p>
        </div>

        {/* Recommendations */}
        {result.recommendations && result.recommendations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-800">
              <Thermometer className="w-5 h-5 text-agri-600" />
              <h3 className="font-bold text-lg">Recomendaciones</h3>
            </div>
            <ul className="space-y-2">
              {result.recommendations.map((rec, index) => (
                <li key={index} className="flex gap-3 text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                  <span className="flex-shrink-0 w-6 h-6 bg-agri-100 text-agri-800 rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <button 
          onClick={onReset}
          className="w-full bg-agri-600 hover:bg-agri-800 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v3.259a1 1 0 11-2 0V13.025A6.978 6.978 0 017.398 12.333a1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Nuevo Análisis
        </button>
      </div>
    </div>
  );
};