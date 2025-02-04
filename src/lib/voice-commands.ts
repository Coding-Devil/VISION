import { EventEmitter } from './events/event-emitter';

export class VoiceCommandManager {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private commands: Map<string, () => void> = new Map();
  private retryCount = 0;
  private maxRetries = 3;
  private retryDelay = 1000;
  public events = new EventEmitter();

  constructor() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      this.initializeRecognition();
    }
  }

  private initializeRecognition() {
    try {
      this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      this.setupRecognition();
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
      this.events.emit('error', 'Speech recognition not available');
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      this.processCommand(command);
      this.retryCount = 0; // Reset retry count on successful recognition
    };

    this.recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
      this.handleError(event.error);
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        this.restartRecognition();
      }
    };
  }

  private handleError(error: string) {
    if (error === 'network' && this.retryCount < this.maxRetries) {
      this.retryCount++;
      setTimeout(() => this.restartRecognition(), this.retryDelay * this.retryCount);
      this.events.emit('retry', { attempt: this.retryCount, maxRetries: this.maxRetries });
    } else {
      this.events.emit('error', `Recognition failed: ${error}`);
      this.stop();
    }
  }

  private restartRecognition() {
    if (!this.recognition || !this.isListening) return;
    
    try {
      this.recognition.stop();
      setTimeout(() => {
        if (this.isListening) {
          this.recognition?.start();
          this.events.emit('restart');
        }
      }, 100);
    } catch (error) {
      console.error('Error restarting recognition:', error);
      this.initializeRecognition(); // Re-initialize if restart fails
    }
  }

  addCommand(phrase: string, action: () => void) {
    this.commands.set(phrase.toLowerCase(), action);
  }

  private processCommand(command: string) {
    for (const [phrase, action] of this.commands.entries()) {
      if (command.includes(phrase)) {
        action();
        this.events.emit('command', { phrase, command });
        break;
      }
    }
  }

  start() {
    if (!this.recognition || this.isListening) return;
    try {
      this.recognition.start();
      this.isListening = true;
      this.events.emit('start');
    } catch (error) {
      console.error('Error starting recognition:', error);
      this.events.emit('error', 'Failed to start recognition');
    }
  }

  stop() {
    if (!this.recognition || !this.isListening) return;
    try {
      this.recognition.stop();
      this.isListening = false;
      this.retryCount = 0;
      this.events.emit('stop');
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
  }

  isSupported(): boolean {
    return !!this.recognition;
  }
}