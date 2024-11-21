"use client"

let audioContext: AudioContext | null = null

export function getAudioContext() {
  if (typeof window === 'undefined') return null
  
  if (!audioContext) {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    audioContext = new AudioContext()
  }
  
  return audioContext
}

export function cleanupAudioContext() {
  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
}