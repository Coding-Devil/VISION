import React, { useRef, useEffect } from 'react';
import { CameraConfig } from '../../lib/types';

interface VideoStreamProps {
  config: CameraConfig;
  onStreamReady: (stream: MediaStream) => void;
  onError: (error: string) => void;
}

const VideoStream: React.FC<VideoStreamProps> = ({ config, onStreamReady, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: config.facingMode }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        onStreamReady(stream);
      } catch (err) {
        onError('Failed to access camera');
      }
    };

    startCamera();
  }, [config.facingMode]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="w-full aspect-video object-cover"
    />
  );
};

export default VideoStream;