import React from 'react';
import Button from '../ui/button';
import { Camera, RefreshCcw } from 'lucide-react';

interface CameraControlsProps {
  onCapture: () => void;
  onToggle: () => void;
  isProcessing: boolean;
}

const CameraControls: React.FC<CameraControlsProps> = ({
  onCapture,
  onToggle,
  isProcessing
}) => {
  return (
    <div className="absolute bottom-4 right-4 flex gap-2">
      <Button
        onClick={onToggle}
        variant="secondary"
        size="sm"
        disabled={isProcessing}
        aria-label="switch"
      >
        <RefreshCcw className="w-4 h-4" />
      </Button>
      <Button
        onClick={onCapture}
        variant="primary"
        size="sm"
        disabled={isProcessing}
        aria-label="capture"
      >
        <Camera className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default CameraControls;