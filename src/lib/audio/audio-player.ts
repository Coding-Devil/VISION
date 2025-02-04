export class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;

  private async getAudioContext(): Promise<AudioContext> {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      this.audioContext = new AudioContext();
    }
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    return this.audioContext;
  }

  async playAudio(base64Audio: string): Promise<void> {
    try {
      const audioContext = await this.getAudioContext();
      
      // Convert base64 to array buffer
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Decode audio data
      const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);

      // Stop any currently playing audio
      this.stop();

      // Create and start new source
      this.currentSource = audioContext.createBufferSource();
      this.currentSource.buffer = audioBuffer;
      this.currentSource.connect(audioContext.destination);
      this.currentSource.start(0);

      return new Promise((resolve) => {
        if (this.currentSource) {
          this.currentSource.onended = () => resolve();
        } else {
          resolve();
        }
      });
    } catch (error) {
      console.error('Audio playback error:', error);
      throw error;
    }
  }

  stop(): void {
    try {
      if (this.currentSource) {
        this.currentSource.stop();
        this.currentSource.disconnect();
        this.currentSource = null;
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }
}