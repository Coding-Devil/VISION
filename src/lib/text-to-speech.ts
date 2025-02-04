export class TextToSpeech {
  private speechSynthesis: SpeechSynthesis;
  private speechUtterance: SpeechSynthesisUtterance;

  constructor() {
    this.speechSynthesis = window.speechSynthesis;
    this.speechUtterance = new SpeechSynthesisUtterance();
    
    // Configure speech settings
    this.speechUtterance.rate = 1.0;
    this.speechUtterance.pitch = 1.0;
    this.speechUtterance.volume = 1.0;
    
    // Use a natural-sounding voice if available
    const voices = this.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => voice.lang.startsWith('en-'));
    if (englishVoice) {
      this.speechUtterance.voice = englishVoice;
    }
  }

  speak(text: string): void {
    // Cancel any ongoing speech
    this.speechSynthesis.cancel();

    this.speechUtterance.text = text;
    this.speechSynthesis.speak(this.speechUtterance);
  }

  stop(): void {
    this.speechSynthesis.cancel();
  }
}