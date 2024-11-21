"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mic, Square, Play, Loader2, RotateCcw } from 'lucide-react'
import { useVoiceRecorder } from '@/hooks/use-voice-recorder'
import { addVoice } from '@/lib/elevenlabs-voice'
import { toast } from 'sonner'

interface VoiceRecorderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRecordingComplete?: (voiceId: string) => void
}

export function VoiceRecorderDialog({ 
  open, 
  onOpenChange,
  onRecordingComplete 
}: VoiceRecorderDialogProps) {
  const {
    isRecording,
    countdown,
    timeLeft,
    audioUrl,
    startRecording,
    stopRecording,
    resetRecording,
    audioBlob
  } = useVoiceRecorder()
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAudio(new Audio())
    }
    return () => {
      if (audio) {
        audio.pause()
        audio.src = ''
      }
    }
  }, [])

  const handlePlayPause = () => {
    if (!audio || !audioUrl) return

    if (isPlaying) {
      audio.pause()
      audio.currentTime = 0
      setIsPlaying(false)
    } else {
      audio.src = audioUrl
      audio.play()
      setIsPlaying(true)
      audio.onended = () => setIsPlaying(false)
    }
  }

  const handleClose = () => {
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    setIsPlaying(false)
    resetRecording()
    onOpenChange(false)
  }

  const handleSave = async () => {
    if (!audioBlob) {
      toast.error('No recording available')
      return
    }

    setIsProcessing(true)
    try {
      const result = await addVoice(audioBlob)
      if (onRecordingComplete) {
        onRecordingComplete(result.voice_id)
      }
      toast.success('Voice cloned successfully!')
      handleClose()
    } catch (error) {
      console.error('Failed to clone voice:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to clone voice')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Your Voice</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {countdown && (
            <div className="flex items-center justify-center">
              <span className="text-6xl font-bold text-primary animate-pulse">
                {countdown}
              </span>
            </div>
          )}

          {audioUrl ? (
            <div className="space-y-4">
              <audio src={audioUrl} controls className="w-full" />
              
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? (
                    <Square className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={resetRecording}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={countdown !== null}
                variant={isRecording ? "destructive" : "default"}
                className="w-full"
              >
                {isRecording ? (
                  <>
                    <Square className="mr-2 h-4 w-4" />
                    Stop Recording ({timeLeft}s)
                  </>
                ) : countdown ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting in {countdown}...
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" />
                    Record Audio (30s max)
                  </>
                )}
              </Button>
              {isRecording && (
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000 ease-linear"
                    style={{ width: `${((30 - (timeLeft || 0)) / 30) * 100}%` }}
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!audioUrl || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Clone Voice'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}