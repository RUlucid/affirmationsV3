"use client"

import { useState } from 'react'
import { Play, Square, Loader2, X, Mic } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useAudioPreview } from '@/hooks/use-audio-preview'
import { VoiceRecorderDialog } from '@/components/voice-recorder-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Voice {
  id: string
  name: string
}

const voices: Voice[] = [
  {
    id: '9tTAUoagEtsVqJ60J8lL',
    name: 'Calm Female Voice'
  },
  { id: 'voice2', name: 'Energetic Male Voice' },
  { id: 'voice3', name: 'Soothing Nature Voice' },
  { id: 'voice4', name: 'Motivational Coach Voice' },
  { id: 'voice5', name: 'Gentle Whisper Voice' }
]

interface VoiceSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function VoiceSelector({ value, onChange }: VoiceSelectorProps) {
  const { playingVoice, isLoading, playPreview } = useAudioPreview()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [customVoiceAdded, setCustomVoiceAdded] = useState<{ id: string; url: string } | null>(null)

  const handleRecordingComplete = (voiceId: string, audioUrl: string) => {
    setCustomVoiceAdded({ id: voiceId, url: audioUrl })
    onChange(voiceId) // Update selected voice to the cloned voice
    toast.success('Custom voice added successfully')
  }

  const handleDeleteCustomVoice = () => {
    if (customVoiceAdded?.url) {
      URL.revokeObjectURL(customVoiceAdded.url)
    }
    setCustomVoiceAdded(null)
    onChange(voices[0].id)
    toast.success('Custom voice removed')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Pre-created voices</Label>
        <div className="flex gap-2">
          <div className="relative group flex-1">
            <div className="absolute -inset-0.5 bg-white rounded-lg opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-300 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-300"></div>
            <div className="relative">
              <Select 
                value={value} 
                onValueChange={onChange}
                disabled={!!customVoiceAdded}
              >
                <SelectTrigger className="w-full bg-zinc-900 border-white/20">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => playPreview(value)}
            disabled={isLoading}
            className="flex-none"
          >
            {isLoading && playingVoice === value ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : playingVoice === value ? (
              <Square className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            or
          </span>
        </div>
      </div>

      {customVoiceAdded ? (
        <div className="p-4 bg-primary/5 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Custom Voice</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteCustomVoice}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <audio src={customVoiceAdded.url} controls className="w-full" />
        </div>
      ) : (
        <>
          <Button 
            className={cn("w-full", dialogOpen && "opacity-50 pointer-events-none")} 
            onClick={() => setDialogOpen(true)}
          >
            <Mic className="mr-2 h-4 w-4" />
            Record Custom Voice
          </Button>
          
          <VoiceRecorderDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onRecordingComplete={handleRecordingComplete}
          />
        </>
      )}
    </div>
  )
}