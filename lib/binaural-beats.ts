"use client"

export class BinauralBeatsGenerator {
  private audioContext: AudioContext | null = null;
  private oscillatorLeft: OscillatorNode | null = null;
  private oscillatorRight: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;

  // Using a lower carrier frequency for better audibility
  private readonly CARRIER_FREQUENCY = 200; // Base frequency in Hz

  public readonly BEAT_FREQUENCIES = {
    delta: 2,    // 2 Hz for deep sleep
    theta: 6,    // 6 Hz for deep relaxation
    alpha: 10,   // 10 Hz for relaxed focus
    beta: 20,    // 20 Hz for concentration
    gamma: 40    // 40 Hz for high-level processing
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  public async start(type: keyof typeof this.BEAT_FREQUENCIES) {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (this.isPlaying) {
      this.stop();
    }

    await this.audioContext.resume(); // Ensure audio context is running
    const beatFrequency = this.BEAT_FREQUENCIES[type];
    
    // Create stereo panner and gain nodes
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 0.2; // Initial volume
    
    const mergerNode = this.audioContext.createChannelMerger(2);

    // Create oscillators with sine wave type for clearer tones
    this.oscillatorLeft = this.audioContext.createOscillator();
    this.oscillatorRight = this.audioContext.createOscillator();
    
    this.oscillatorLeft.type = 'sine';
    this.oscillatorRight.type = 'sine';
    
    // Set frequencies for each ear
    this.oscillatorLeft.frequency.value = this.CARRIER_FREQUENCY;
    this.oscillatorRight.frequency.value = this.CARRIER_FREQUENCY + beatFrequency;

    // Create separate gain nodes for left and right channels
    const gainLeft = this.audioContext.createGain();
    const gainRight = this.audioContext.createGain();
    
    gainLeft.gain.value = 0.5;
    gainRight.gain.value = 0.5;

    // Connect left oscillator
    this.oscillatorLeft.connect(gainLeft);
    gainLeft.connect(mergerNode, 0, 0);

    // Connect right oscillator
    this.oscillatorRight.connect(gainRight);
    gainRight.connect(mergerNode, 0, 1);

    // Connect merger to main gain and then to destination
    mergerNode.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Start oscillators
    this.oscillatorLeft.start();
    this.oscillatorRight.start();
    this.gainNode = gainNode;
    this.isPlaying = true;
  }

  public setVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = volume * 0.5; // Scale down the volume a bit for comfort
    }
  }

  public stop() {
    if (!this.audioContext || !this.isPlaying) return;

    // Immediate stop for preview functionality
    if (this.oscillatorLeft) {
      this.oscillatorLeft.stop();
      this.oscillatorLeft.disconnect();
      this.oscillatorLeft = null;
    }
    if (this.oscillatorRight) {
      this.oscillatorRight.stop();
      this.oscillatorRight.disconnect();
      this.oscillatorRight = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    this.isPlaying = false;
  }

  public isActive(): boolean {
    return this.isPlaying;
  }

  public cleanup() {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}