export class AudioPlayer {
  private audioElements: Map<number, HTMLAudioElement>;
  private isPlaying: boolean;
  private totalDuration: number;

  constructor() {
    this.audioElements = new Map();
    this.isPlaying = false;
    this.totalDuration = 0;
  }

  initialize(messages: { audioUrl?: string }[], targetDuration: number = 30) {
    console.log('Initializing audio player with messages:', messages);
    // Clear existing audio elements
    this.audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.audioElements.clear();
    this.isPlaying = false;
    this.totalDuration = targetDuration;

    // Initialize new audio elements
    messages.forEach((message, index) => {
      if (message.audioUrl) {
        console.log(`Creating audio element for message ${index}`);
        const audio = new Audio(message.audioUrl);
        audio.preload = 'auto';
        this.audioElements.set(index, audio);
      }
    });
  }

  async playAudio(index: number): Promise<void> {
    const audio = this.audioElements.get(index);
    if (!audio) {
      console.log(`No audio element found for index ${index}`);
      // Add a small pause even when there's no audio
      await new Promise(resolve => setTimeout(resolve, 1000));
      return;
    }

    console.log(`Starting playback for audio ${index}`);
    return new Promise((resolve, reject) => {
      const handleEnded = () => {
        console.log(`Audio ${index} playback completed`);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        
        // Add a small pause between messages
        setTimeout(resolve, 500);
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
      
      // Calculate playback rate to match target duration
      if (this.totalDuration > 0 && this.audioElements.size > 0) {
        const avgMessageDuration = this.totalDuration / this.audioElements.size;
        audio.playbackRate = audio.duration > avgMessageDuration ? audio.duration / avgMessageDuration : 1;
      }

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