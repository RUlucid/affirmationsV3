"use client"

import { ffmpegProcessor } from './ffmpeg'

interface BackgroundTrack {
  type: string
}

class AudioProcessor {
  public async processAudio(
    audioData: ArrayBuffer,
    backgroundBeat?: BackgroundTrack
  ): Promise<ArrayBuffer> {
    try {
      return await ffmpegProcessor.processAudio(
        audioData,
        backgroundBeat?.type
      )
    } catch (error) {
      console.error('Audio processing error:', error)
      throw error instanceof Error ? error : new Error('Failed to process audio')
    }
  }
}

export const audioProcessor = new AudioProcessor()