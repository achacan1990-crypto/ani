
export enum MotionType {
  DANCE = 'Dance',
  BODY = 'Body Movement',
  CINEMATIC = 'Cinematic Action'
}

export enum AspectRatio {
  PORTRAIT = '9:16',
  LANDSCAPE = '16:9',
  SQUARE = '1:1'
}

export interface GenerationState {
  isGenerating: boolean;
  progress: number;
  status: string;
  error: string | null;
  outputUrl: string | null;
}

export interface UploadedMedia {
  image: {
    base64: string;
    mimeType: string;
    preview: string;
  } | null;
  video: {
    base64: string;
    mimeType: string;
    preview: string;
  } | null;
}
