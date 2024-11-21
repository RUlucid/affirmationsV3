"use client"

import { useState, useRef, useCallback, useEffect } from 'react'
import { toast } from 'sonner'

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const countdownTimerRef = useRef<NodeJS.Timeout>()
  const recordingTimerRef = useRef<NodeJS.Timeout>()

  const startCountdown = useCallback(() => {
    setCountdown(3)
    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownTimerRef.current)
          return null
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      chunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        setIsRecording(false)
        setTimeLeft(null)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      startCountdown()
      
      // Start recording after countdown
      setTimeout(() => {
        mediaRecorderRef.current?.start()
        setIsRecording(true)
        setTimeLeft(30)
        
        // Start countdown timer
        recordingTimerRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(recordingTimerRef.current)
              if (mediaRecorderRef.current?.state === 'recording') {
                stopRecording()
              }
              return null
            }
            return prev - 1
          })
        }, 1000)
      }, 3000)

    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast.error('Could not access microphone')
    }
  }, [startCountdown])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
      clearInterval(recordingTimerRef.current)
    }
  }, [])

  const resetRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioUrl(null)
    setAudioBlob(null)
    setIsRecording(false)
    setCountdown(null)
    setTimeLeft(null)
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
    }
  }, [audioUrl])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current)
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }, [audioUrl])

  return {
    isRecording,
    countdown,
    timeLeft,
    audioUrl,
    audioBlob,
    startRecording,
    stopRecording,
    resetRecording
  }
}