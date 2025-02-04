import { GOOGLE_CLOUD_CONFIG, SUPPORTED_LANGUAGES } from '../config/google-cloud';
import type { LanguageCode } from '../config/google-cloud';

export async function translateText(text: string, targetLang: LanguageCode): Promise<string> {
  try {
    const url = `${GOOGLE_CLOUD_CONFIG.translateEndpoint}?key=${GOOGLE_CLOUD_CONFIG.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        target: targetLang.split('-')[0], // Use language code without region
        source: 'en',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Translation failed: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    if (!data?.data?.translations?.[0]?.translatedText) {
      throw new Error('Invalid translation response format');
    }

    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    throw error; // Propagate error to handle it in the UI
  }
}

export async function synthesizeSpeech(text: string, lang: LanguageCode): Promise<string> {
  try {
    const url = `${GOOGLE_CLOUD_CONFIG.ttsEndpoint}?key=${GOOGLE_CLOUD_CONFIG.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: SUPPORTED_LANGUAGES[lang].code,
          name: `${SUPPORTED_LANGUAGES[lang].code}-Standard-A`,
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'LINEAR16',
          pitch: 0,
          speakingRate: 1,
          sampleRateHertz: 16000
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Speech synthesis failed: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    if (!data?.audioContent) {
      throw new Error('Invalid speech synthesis response format');
    }

    return data.audioContent;
  } catch (error) {
    console.error('Speech synthesis error:', error);
    throw error; // Propagate error to handle it in the UI
  }
}