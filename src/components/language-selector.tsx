import React from 'react';
import { SUPPORTED_LANGUAGES, LanguageCode } from '../lib/config/google-cloud';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  selectedLanguage: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-blue-400" />
      <select
        value={selectedLanguage}
        onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
        className="bg-transparent text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md cursor-pointer"
        aria-label="Select language"
      >
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, { name }]) => (
          <option key={code} value={code} className="bg-gray-800 text-gray-100">
            {name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;