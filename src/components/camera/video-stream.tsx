import React, { useRef, useEffect } from 'react';
import { CameraConfig } from '../../lib/types';

interface VideoStreamProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  config: CameraConfig;
  onStreamReady: (stream: MediaStream) => void;
  onError: (error: string) => void;
}

const VideoStream: React.FC<VideoStreamProps> = ({ videoRef, config, onStreamReady, onError }) => {
  const currentStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      if (currentStreamRef.current) {
        currentStreamRef.current.getTracks().forEach(track => track.stop());
        currentStreamRef.current = null;
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
      }

      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: config.facingMode }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
        currentStreamRef.current = newStream;
        onStreamReady(newStream);
      } catch (err) {
        console.error('getUserMedia error:', err);
        if (err instanceof DOMException) {
             if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                 onError('Camera permission denied.');
             } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                 onError(`Camera with facing mode '${config.facingMode}' not found.`);
             } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                 onError('Camera is already in use or hardware error.');
             } else {
                 onError(`Failed to access camera: ${err.message}`);
             }
         } else {
             onError('Failed to access camera: An unknown error occurred.');
         }
      }
    };

    startCamera();

    return () => {
      if (currentStreamRef.current) {
        currentStreamRef.current.getTracks().forEach(track => track.stop());
        currentStreamRef.current = null;
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
      }
    };
  }, [config, videoRef, onStreamReady, onError]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="w-full aspect-video object-cover"
    />
  );
};

export default VideoStream;