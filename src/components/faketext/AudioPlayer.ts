export class AudioPlayer {
  private audioElements: Map<number, HTMLAudioElement>;
  private isPlaying: boolean;

  constructor() {
    this.audioElements = new Map();
    this.isPlaying = false;
  }

  initialize(messages: { audioUrl?: string }[]) {
    // Clear existing audio elements
    this.audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.audioElements.clear();
    this.isPlaying = false;

    // Initialize new audio elements
    messages.forEach((message, index) => {
      if (message.audioUrl) {
        const audio = new Audio(message.audioUrl);
        this.audioElements.set(index, audio);
      }
    });
  }

  async playAudio(index: number): Promise<void> {
    const audio = this.audioElements.get(index);
    if (!audio) return;

    return new Promise((resolve, reject) => {
      const handleEnded = () => {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        resolve();
      };

      const handleError = (error: Event) => {
        console.error('Audio playback error:', error);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        reject(error);
      };

      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      audio.play().catch(handleError);
    });
  }

  cleanup() {
    this.audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.audioElements.clear();
    this.isPlaying = false;
  }

  setIsPlaying(value: boolean) {
    this.isPlaying = value;
  }

  getIsPlaying() {
    return this.isPlaying;
  }
}