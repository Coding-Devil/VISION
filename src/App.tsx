import React, { useState, useEffect, useRef } from 'react';
import CameraCapture from './components/camera-capture';
import LanguageSelector from './components/language-selector';
import { GoogleTextToSpeech } from './lib/google-tts';
import { GestureDetector } from './lib/gesture-detector';
import { ImageProcessingResult } from './lib/types';
import { LanguageCode } from './lib/config/google-cloud';
import { Camera } from 'lucide-react';

const App: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('en');
  const [results, setResults] = useState<ImageProcessingResult[]>([]);
  const ttsRef = useRef(new GoogleTextToSpeech());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      new GestureDetector(containerRef.current, () => {
        const captureButton = document.querySelector('button[aria-label="capture"]');
        if (captureButton instanceof HTMLButtonElement) {
          captureButton.click();
        }
      });
    }

    ttsRef.current.speakInLanguage(
      "Welcome to Visionary. Double-tap anywhere to capture an image.",
      selectedLanguage
    );

    return () => {
      ttsRef.current.stop();
    };
  }, []);

  const handleImageProcessed = async (description: string) => {
    setResults(prev => [{
      description,
      timestamp: Date.now()
    }, ...prev.slice(0, 0)]); // Only keep the latest result

    await ttsRef.current.speakInLanguage(description, selectedLanguage);
  };

  const handleLanguageChange = (language: LanguageCode) => {
    setSelectedLanguage(language);
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100"
      role="application"
      aria-label="Visionary - Image Recognition App"
    >
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="p-4 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
          <div className="flex justify-between items-center max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <Camera className="w-6 h-6 text-blue-400" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Visionary
              </h1>
            </div>
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={handleLanguageChange}
            />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-4 gap-4">
          {/* Camera Section */}
          <section className="flex-1">
            <CameraCapture onImageProcessed={handleImageProcessed} />
          </section>

          {/* Latest Result Section */}
          {results.length > 0 && (
            <section className="bg-gray-800/50 rounded-lg border border-gray-700/50 backdrop-blur-sm p-4">
              <div className="text-lg text-gray-100">
                {results[0].description}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                {new Date(results[0].timestamp).toLocaleTimeString()}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;