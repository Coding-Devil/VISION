import React, { useRef, useState, useEffect } from 'react';
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
  const [isSwitching, setIsSwitching] = useState(false);
  const [config, setConfig] = useState<CameraConfig>({ facingMode: 'environment' });
  const audioBeacon = useRef(new AudioBeacon());
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleStreamReady = (newStream: MediaStream) => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(newStream);
    setError('');
    setIsSwitching(false);
    audioBeacon.current.playSuccess();
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    audioBeacon.current.playError();
  };

  const captureImage = async () => {
    setIsProcessing(true);
    setError('');

    if (!stream || !canvasRef.current || !videoRef.current) {
      handleError('Camera not ready or element missing.');
      setIsProcessing(false);
      return;
    }

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
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
    if (isProcessing || isSwitching) return;

    setIsSwitching(true);
    setError('');
    setConfig(prev => ({
      facingMode: prev.facingMode === 'user' ? 'environment' : 'user'
    }));
  };

  return (
    <div className="relative rounded-lg overflow-hidden bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm">
      <VideoStream
        videoRef={videoRef}
        config={config}
        onStreamReady={handleStreamReady}
        onError={handleError}
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {isProcessing && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="text-white text-lg font-semibold animate-pulse">Processing...</div>
        </div>
      )}
      
      {isSwitching && !isProcessing && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="text-white text-lg font-semibold animate-pulse">Switching Camera...</div>
        </div>
      )}
      
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-500/90 text-white p-2 text-sm text-center">
          {error}
        </div>
      )}
      
      <CameraControls
        onCapture={captureImage}
        onToggle={toggleCamera}
        isProcessing={isProcessing || isSwitching}
      />
    </div>
  );
};

export default CameraCapture;