
import { GoogleGenAI } from "@google/genai";
import { MotionType, AspectRatio } from "../types";

export class GeminiService {
  private static getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  static async generateMotionVideo(
    imageBase64: string,
    imageMimeType: string,
    motionType: MotionType,
    aspectRatio: AspectRatio,
    onProgress: (status: string) => void
  ): Promise<string> {
    const ai = this.getAI();
    
    // Construct a descriptive prompt based on motion type
    const promptMap = {
      [MotionType.DANCE]: "Fluid and energetic dance choreography, maintaining character identity with rhythmic body movements.",
      [MotionType.BODY]: "Natural human gestures and body language, realistic movement flow.",
      [MotionType.CINEMATIC]: "Epic cinematic action sequence with dramatic lighting and dynamic character posing."
    };

    const prompt = `Highly detailed animation of the character in the image. ${promptMap[motionType]} High quality, 1080p, smooth frames, professional motion capture transfer quality.`;

    onProgress("Initializing AI pipeline...");
    
    try {
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: {
          imageBytes: imageBase64,
          mimeType: imageMimeType,
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio as any,
        }
      });

      onProgress("Processing motion dynamics...");

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        onProgress("Rendering frames and smoothing transitions...");
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("No video generated.");

      onProgress("Finalizing MP4 export...");
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      return URL.createObjectURL(blob);

    } catch (error: any) {
      console.error("Gemini Error:", error);
      if (error.message?.includes("Requested entity was not found")) {
        throw new Error("AUTH_REQUIRED");
      }
      throw error;
    }
  }
}
