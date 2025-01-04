export class AudioPlayer {
  private audioElements: Map<number, HTMLAudioElement>;
  private isPlaying: boolean;

  constructor() {
    this.audioElements = new Map();
    this.isPlaying = false;
  }

  initialize(messages: { audioUrl?: string }[]) {
    console.log('Initializing audio player with messages:', messages);
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
        console.log(`Creating audio element for message ${index}`);
        const audio = new Audio(message.audioUrl);
        audio.preload = 'auto'; // Preload audio
        this.audioElements.set(index, audio);
      }
    });
  }

  async playAudio(index: number): Promise<void> {
    const audio = this.audioElements.get(index);
    if (!audio) {
      console.log(`No audio element found for index ${index}`);
      return;
    }

    console.log(`Starting playback for audio ${index}`);
    return new Promise((resolve, reject) => {
      const handleEnded = () => {
        console.log(`Audio ${index} playback completed`);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        resolve();
      };

      const handleError = (error: Event) => {
        console.error(`Audio ${index} playback error:`, error);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        reject(error);
      };

      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      // Reset audio to beginning
      audio.currentTime = 0;
      
      // Attempt to play
      audio.play().catch(error => {
        console.error(`Failed to start audio ${index}:`, error);
        handleError(error);
      });
    });
  }

  cleanup() {
    console.log('Cleaning up audio player');
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