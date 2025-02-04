// Add types for API response
export interface BlipApiResponse {
  generated_text: string;
}

export interface CameraConfig {
  facingMode: 'user' | 'environment';
}

export interface ImageProcessingResult {
  description: string;
  timestamp: number;
}

export interface VoiceCommand {
  command: string;
  action: () => void;
}