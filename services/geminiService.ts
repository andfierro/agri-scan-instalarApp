import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, HealthStatus } from "../types";

export const analyzePlantImage = async (base64Image: string): Promise<AnalysisResult> => {
  try {
    // Initialize AI inside the function to prevent app crash on load if key is missing
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key no configurada. Verifique su archivo .env o la configuración del servidor.");
    }
    const ai = new GoogleGenAI({ apiKey });

    // Remove header from base64 string if present (data:image/jpeg;base64,...)
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const modelId = "gemini-2.5-flash"; // Efficient and good for vision tasks

    const prompt = `
      Actúa como un experto agrónomo y fitopatólogo para una tesis de investigación.
      Analiza la imagen proporcionada.
      1. Determina si la imagen contiene una hoja de una planta.
      2. Si es una planta, clasifícala como "Sana" o "Enferma".
      3. Identifica el nombre de la enfermedad si aplica (o la especie de planta si está sana).
      4. Estima un porcentaje de confianza (0-100).
      5. Proporciona una breve descripción técnica del hallazgo.
      6. Lista 3 recomendaciones o tratamientos (si es enferma) o cuidados preventivos (si es sana).
      
      Responde estrictamente en formato JSON.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isPlant: { type: Type.BOOLEAN },
            status: { type: Type.STRING, enum: [HealthStatus.HEALTHY, HealthStatus.DISEASED, HealthStatus.NOT_A_PLANT] },
            diseaseName: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            description: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["isPlant", "status", "diseaseName", "confidence", "description", "recommendations"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text) as AnalysisResult;
    return result;

  } catch (error: any) {
    console.error("Error analyzing image:", error);
    
    let errorMessage = error.message || "Error al procesar la imagen.";
    let recommendations = ["Verifique su conexión a internet.", "Intente con una imagen más clara."];
    let diseaseName = "Error de Análisis";

    // Handle specific API Key errors
    if (errorMessage.includes("API key") || errorMessage.includes("PERMISSION_DENIED") || errorMessage.includes("leaked")) {
        errorMessage = "Error de Seguridad: La API Key ha sido revocada o está inactiva.";
        diseaseName = "Acceso Denegado";
        recommendations = [
            "La API Key actual ha sido reportada como filtrada (leaked).",
            "Genere una nueva clave en Google AI Studio.",
            "Actualice la configuración de la aplicación con la nueva clave."
        ];
    }

    return {
      isPlant: false,
      status: HealthStatus.UNKNOWN,
      diseaseName: diseaseName,
      confidence: 0,
      description: errorMessage,
      recommendations: recommendations
    };
  }
};