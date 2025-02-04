import { translateText, synthesizeSpeech } from './api/google-cloud';
import { AudioPlayer } from './audio/audio-player';
import type { LanguageCode } from './config/google-cloud';

export class GoogleTextToSpeech {
  private audioPlayer: AudioPlayer;
  private isSpeaking: boolean = false;
  private cache: Map<string, string> = new Map(); // Add cache for audio content

  constructor() {
    this.audioPlayer = new AudioPlayer();
  }

  async speakInLanguage(text: string, lang: LanguageCode): Promise<void> {
    if (this.isSpeaking) {
      this.stop();
    }

    try {
      this.isSpeaking = true;
      
      // Generate cache key
      const cacheKey = `${text}_${lang}`;
      
      // Check cache first
      let audioContent = this.cache.get(cacheKey);
      
      if (!audioContent) {
        let translatedText = text;

        if (lang !== 'en') {
          translatedText = await translateText(text, lang);
        }

        audioContent = await synthesizeSpeech(translatedText, lang);
        
        // Cache the result
        this.cache.set(cacheKey, audioContent);
        
        // Limit cache size
        if (this.cache.size > 50) {
          const firstKey = this.cache.keys().next().value;
          this.cache.delete(firstKey);
        }
      }

      await this.audioPlayer.playAudio(audioContent);
    } catch (error) {
      console.error('Error in text-to-speech process:', error);
      // Optionally, you could emit an event or callback here to notify the UI
    } finally {
      this.isSpeaking = false;
    }
  }

  stop(): void {
    this.isSpeaking = false;
    this.audioPlayer.stop();
  }

  isActive(): boolean {
    return this.isSpeaking;
  }
}