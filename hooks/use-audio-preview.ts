"use client"

import { useState, useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { generateSpeech } from '@/lib/elevenlabs'

const PREVIEW_TEXT = "Hello, this is a preview of my voice."

export function useAudioPreview() {
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioCache = useRef<Map<string, ArrayBuffer>>(new Map())

  const stopCurrentAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setPlayingVoice(null)
    }
  }, [])

  useEffect(() => {
    return () => {
      stopCurrentAudio()
      // Cleanup cached audio URLs
      if (audioRef.current?.src) {
        URL.revokeObjectURL(audioRef.current.src)
      }
    }
  }, [stopCurrentAudio])

  const playPreview = useCallback(async (voiceId: string) => {
    if (!voiceId) {
      toast.error("Please select a voice first")
      return
    }

    if (playingVoice === voiceId) {
      stopCurrentAudio()
      return
    }

    try {
      stopCurrentAudio()
      setIsLoading(true)

      let audioData: ArrayBuffer

      // Check cache first
      if (audioCache.current.has(voiceId)) {
        audioData = audioCache.current.get(voiceId)!
      } else {
        // Generate new preview if not cached
        audioData = await generateSpeech(PREVIEW_TEXT, voiceId)
        audioCache.current.set(voiceId, audioData)
      }

      const blob = new Blob([audioData], { type: 'audio/mpeg' })
      const url = URL.createObjectURL(blob)

      if (audioRef.current?.src) {
        URL.revokeObjectURL(audioRef.current.src)
      }

      const audio = new Audio(url)
      
      audio.oncanplaythrough = () => {
        setIsLoading(false)
        audio.play().catch(error => {
          console.error('Playback error:', error)
          toast.error("Failed to play voice preview")
          stopCurrentAudio()
        })
      }

      audio.onended = () => {
        setPlayingVoice(null)
      }

      audio.onerror = () => {
        console.error('Audio error:', audio.error)
        toast.error("Failed to load voice preview")
        stopCurrentAudio()
        setIsLoading(false)
        if (audio.src) {
          URL.revokeObjectURL(audio.src)
        }
      }

      audioRef.current = audio
      setPlayingVoice(voiceId)

    } catch (error) {
      console.error('Preview error:', error)
      toast.error("Failed to generate voice preview")
      stopCurrentAudio()
      setIsLoading(false)
    }
  }, [playingVoice, stopCurrentAudio])

  return {
    playingVoice,
    isLoading,
    playPreview,
    stopCurrentAudio
  }
}