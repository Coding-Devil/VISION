import React, { useRef, useState } from 'react';
import VideoStream from './camera/video-stream';
import CameraControls from './camera/camera-controls';
import { processImage } from '../lib/image-processing';
import { AudioBeacon } from '../lib/audio-beacon';
import { CameraConfig } from '../lib/types';

interface CameraCaptureProps {
  onImageProcessed: (description: string) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onImageProcessed }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [config, setConfig] = useState<CameraConfig>({ facingMode: 'environment' });
  const audioBeacon = useRef(new AudioBeacon());

  const handleStreamReady = (newStream: MediaStream) => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(newStream);
    setError('');
    audioBeacon.current.playSuccess();
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    audioBeacon.current.playError();
  };

  const captureImage = async () => {
    if (!stream || !canvasRef.current || isProcessing) return;

    try {
      setIsProcessing(true);
      setError('');

      const canvas = canvasRef.current;
      const video = document.querySelector('video');
      if (!video) throw new Error('Video element not found');
      
      const captureWidth = 1280;
      const captureHeight = Math.round((video.videoHeight * captureWidth) / video.videoWidth);
      
      canvas.width = captureWidth;
      canvas.height = captureHeight;
      
      const context = canvas.getContext('2d', { 
        alpha: false,
        willReadFrequently: true
      });
      
      if (!context) throw new Error('Failed to get canvas context');

      context.drawImage(video, 0, 0, captureWidth, captureHeight);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      audioBeacon.current.playNotification();
      
      const description = await processImage(imageData);
      onImageProcessed(description);
    } catch (err) {
      handleError('Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleCamera = () => {
    setConfig(prev => ({
      facingMode: prev.facingMode === 'user' ? 'environment' : 'user'
    }));
  };

  return (
    <div className="relative rounded-lg overflow-hidden bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm">
      <VideoStream
        config={config}
        onStreamReady={handleStreamReady}
        onError={handleError}
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-500/90 text-white p-2 text-sm text-center">
          {error}
        </div>
      )}
      
      <CameraControls
        onCapture={captureImage}
        onToggle={toggleCamera}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default CameraCapture;