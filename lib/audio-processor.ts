"use client"
import { createFFmpeg } from '@ffmpeg/ffmpeg'

export interface AudioProcessorOptions {
  corePath?: string
  logger?: boolean
}

export interface ReverbSettings {
  delay: number    // milliseconds (100-2000)
  decay: number    // 0-0.9
  mix: number      // 0-1
}

export class AudioProcessor {
  private ffmpeg: ReturnType<typeof createFFmpeg> | null = null
  private loaded = false
  private loading: Promise<void> | null = null
  private readonly options: AudioProcessorOptions

  constructor(options: AudioProcessorOptions = {}) {
    this.options = {
      corePath: '/ffmpeg/ffmpeg-core.js',
      logger: true,
      ...options
    }
  }

  private async load() {
    if (this.loaded) return
    if (this.loading) return this.loading

    this.loading = (async () => {
      try {
        this.ffmpeg = createFFmpeg({
          log: this.options.logger,
          logger: ({ message }) => {
            if (this.options.logger) {
              console.log('FFmpeg:', message)
            }
          },
          corePath: this.options.corePath
        })
        await this.ffmpeg.load()
        this.loaded = true
      } catch (error) {
        console.error('FFmpeg load error:', error)
        throw new Error('Failed to load audio processor')
      } finally {
        this.loading = null
      }
    })()
    return this.loading
  }

  public async processAudio(audioData: ArrayBuffer, settings: ReverbSettings): Promise<ArrayBuffer> {
    if (!audioData?.byteLength) {
      throw new Error('Invalid audio data')
    }

    try {
      await this.load()
      if (!this.ffmpeg) throw new Error('Audio processor not initialized')

      // Write input file
      this.ffmpeg.FS('writeFile', 'input.wav', new Uint8Array(audioData))

      // Build simplified hall reverb filter chain
      const filterChain = [
        // Initial dynamic control
        'compand=attacks=0.02:decays=0.15:points=-90/-90|-45/-45|-27/-27|0/-8:soft-knee=6',
        
        // Pre-filtering for clean reverb
        'lowpass=f=12000',  // Remove harsh highs
        'highpass=f=60',    // Remove rumble but keep warmth
        
        // Simple hall reverb with single reflection
        `aecho=1.0:${settings.mix}:${settings.delay}:${settings.decay}`,
        
        // Basic frequency shaping for natural sound
        'equalizer=f=250:t=q:w=1:g=-2',    // Reduce mud
        'equalizer=f=3500:t=q:w=1:g=1',    // Add presence
        'equalizer=f=8000:t=h:w=0.7:g=-2', // Smooth top end
        
        // Final volume balance
        'volume=3.8'  // Compensate for processing
      ].join(',')

      // Process audio
      await this.ffmpeg.run(
        '-i', 'input.wav',
        '-af', filterChain,
        '-acodec', 'pcm_s16le',
        '-ar', '44100',
        '-ac', '2',
        'output.wav'
      )

      // Read and verify output
      const outputData = this.ffmpeg.FS('readFile', 'output.wav')
      if (!outputData?.length) {
        throw new Error('Failed to generate audio output')
      }

      return outputData.buffer
    } catch (error) {
      console.error('Audio processing error:', error)
      throw error instanceof Error ? error : new Error('Failed to process audio')
    } finally {
      // Cleanup
      if (this.ffmpeg) {
        try {
          this.ffmpeg.FS('unlink', 'input.wav')
          this.ffmpeg.FS('unlink', 'output.wav')
        } catch (error) {
          console.error('Cleanup error:', error)
        }
      }
    }
  }

  public async terminate() {
    if (this.ffmpeg) {
      try {
        await this.ffmpeg.terminate()
      } catch (error) {
        console.error('FFmpeg termination error:', error)
      }
      this.ffmpeg = null
      this.loaded = false
      this.loading = null
    }
  }
}

// Export singleton instance
export const audioProcessor = new AudioProcessor()