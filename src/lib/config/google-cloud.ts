// Google Cloud configuration
export const GOOGLE_CLOUD_CONFIG = {
  apiKey: 'AIzaSyCSRTGsK_lzqu5VhGeCnIyqqwNTfre1c8Q',
  ttsEndpoint: 'https://texttospeech.googleapis.com/v1beta1/text:synthesize',
  translateEndpoint: 'https://translation.googleapis.com/language/translate/v2',
};

export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', code: 'en-US' },
  kn: { name: 'ಕನ್ನಡ', code: 'kn-IN' },
  ta: { name: 'தமிழ்', code: 'ta-IN' },
  te: { name: 'తెలుగు', code: 'te-IN' },
  hi: { name: 'हिंदी', code: 'hi-IN' },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;