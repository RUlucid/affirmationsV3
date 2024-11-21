"use client"

import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'

interface ReverbSettings {
  delay: number
  decay: number
  mix: number
}

interface VolumeSettings {
  voice: number
  binaural: number
}

class FFmpegProcessor {
  private ffmpeg: ReturnType<typeof createFFmpeg> | null = null
  private loaded = false
  private loading: Promise<void> | null = null

  public async load() {
    if (this.loaded) return
    if (this.loading) return this.loading

    this.loading = (async () => {
      try {
        this.ffmpeg = createFFmpeg({
          log: true,
          logger: ({ message }) => {
            console.log('FFmpeg:', message)
          },
          corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
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

  public async processAudio(
    audioData: ArrayBuffer,
    settings: ReverbSettings,
    selectedBeat: string | null = null,
    volumes: VolumeSettings = { voice: 1, binaural: 0.5 }
  ): Promise<ArrayBuffer> {
    if (!audioData?.byteLength) {
      throw new Error('Invalid audio data')
    }

    try {
      await this.load()
      if (!this.ffmpeg) throw new Error('Audio processor not initialized')

      // Write input file
      this.ffmpeg.FS('writeFile', 'input.wav', new Uint8Array(audioData))

      // Generate binaural beats if selected
      if (selectedBeat) {
        const beatFreq = this.getBeatFrequency(selectedBeat)
        if (beatFreq) {
          // Generate 30 seconds of binaural beats
          await this.ffmpeg.run(
            '-f', 'lavfi',
            '-i', `sine=frequency=${200}:duration=30`,
            '-f', 'lavfi',
            '-i', `sine=frequency=${200 + beatFreq}:duration=30`,
            '-filter_complex', '[0:a][1:a]amerge=inputs=2[beats]',
            '-map', '[beats]',
            'beats.wav'
          )
        }
      }

      // Build filter chain for voice processing
      const voiceFilters = [
        // Add 6000ms (6 second) delay to the voice track
        'adelay=6000|6000',
        
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
        
        // Apply voice volume
        `volume=${volumes.voice}`
      ].join(',')

      let filterComplex = `[0:a]${voiceFilters}[voice]`

      // If binaural beats are selected, mix them in
      if (selectedBeat) {
        filterComplex += `;[1:a]volume=${volumes.binaural}[beats];[voice][beats]amix=inputs=2:duration=longest[out]`
        await this.ffmpeg.run(
          '-i', 'input.wav',
          '-i', 'beats.wav',
          '-filter_complex', filterComplex,
          '-map', '[out]',
          '-acodec', 'pcm_s16le',
          '-ar', '44100',
          '-ac', '2',
          'output.wav'
        )
      } else {
        filterComplex += ';[voice]acopy[out]'
        await this.ffmpeg.run(
          '-i', 'input.wav',
          '-filter_complex', filterComplex,
          '-map', '[out]',
          '-acodec', 'pcm_s16le',
          '-ar', '44100',
          '-ac', '2',
          'output.wav'
        )
      }

      // Read output
      const outputData = this.ffmpeg.FS('readFile', 'output.wav')
      if (!outputData?.length) {
        throw new Error('Failed to generate audio output')
      }

      // Cleanup
      try {
        this.ffmpeg.FS('unlink', 'input.wav')
        this.ffmpeg.FS('unlink', 'output.wav')
        if (selectedBeat) {
          this.ffmpeg.FS('unlink', 'beats.wav')
        }
      } catch (error) {
        console.error('Cleanup error:', error)
      }

      return outputData.buffer
    } catch (error) {
      console.error('Audio processing error:', error)
      throw error instanceof Error ? error : new Error('Failed to process audio')
    }
  }

  private getBeatFrequency(beatType: string): number | null {
    const frequencies: Record<string, number> = {
      delta: 2,    // 2 Hz for deep sleep
      theta: 6,    // 6 Hz for deep relaxation
      alpha: 10,   // 10 Hz for relaxed focus
      beta: 20,    // 20 Hz for concentration
      gamma: 40    // 40 Hz for high-level processing
    }
    return frequencies[beatType] || null
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

export const ffmpegProcessor = new FFmpegProcessor()