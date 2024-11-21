"use client"

import { useState, useEffect, useRef } from 'react'
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Volume2 } from 'lucide-react'
import { BinauralBeatsGenerator } from '@/lib/binaural-beats'

interface AudioMixerProps {
  onVolumeChange: (volumes: { voice: number; binaural: number }) => void
  disabled?: boolean
  isProcessing?: boolean
  selectedBeat: string | null
  voiceAudioData?: ArrayBuffer | null
}

export function AudioMixer({ 
  onVolumeChange, 
  disabled = false, 
  selectedBeat
}: AudioMixerProps) {
  const [voiceVolume, setVoiceVolume] = useState(100)
  const [binauralVolume, setBinauralVolume] = useState(50)
  const [generator] = useState(() => new BinauralBeatsGenerator())

  useEffect(() => {
    return () => {
      generator.cleanup()
    }
  }, [generator])

  const handleVoiceVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVoiceVolume(newVolume)
    onVolumeChange({ voice: newVolume / 100, binaural: binauralVolume / 100 })
  }

  const handleBinauralVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setBinauralVolume(newVolume)
    onVolumeChange({ voice: voiceVolume / 100, binaural: newVolume / 100 })
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <span className="text-base">Audio Mixing</span>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Voice Volume
            </Label>
            <span className="text-sm text-muted-foreground">{voiceVolume}%</span>
          </div>
          <Slider
            value={[voiceVolume]}
            onValueChange={handleVoiceVolumeChange}
            min={0}
            max={100}
            step={1}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Binaural Beats Volume
            </Label>
            <span className="text-sm text-muted-foreground">{binauralVolume}%</span>
          </div>
          <Slider
            value={[binauralVolume]}
            onValueChange={handleBinauralVolumeChange}
            min={0}
            max={100}
            step={1}
            disabled={!selectedBeat || disabled}
          />
        </div>
      </CardContent>
    </Card>
  )
}