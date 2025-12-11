export enum HealthStatus {
  HEALTHY = 'Sana',
  DISEASED = 'Enferma',
  UNKNOWN = 'Desconocido',
  NOT_A_PLANT = 'No es una planta'
}

export interface AnalysisResult {
  isPlant: boolean;
  status: HealthStatus;
  diseaseName: string | null;
  confidence: number;
  description: string;
  recommendations: string[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  imageUrl: string;
  result: AnalysisResult;
}