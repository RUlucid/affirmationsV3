"use client"

import { useState, useEffect } from 'react'
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Brain, Moon, Sparkles, Zap, Stars, PlayCircle, StopCircle } from 'lucide-react'
import { BinauralBeatsGenerator } from '@/lib/binaural-beats'
import { Button } from "@/components/ui/button"

const binauralBeats = [
  {
    id: 'delta',
    name: 'Delta Waves',
    frequency: '0.5-4 Hz',
    description: 'Deep, dreamless sleep, relaxation',
    icon: Moon
  },
  {
    id: 'theta',
    name: 'Theta Waves',
    frequency: '4-8 Hz',
    description: 'Deep relaxation, meditation, creativity',
    icon: Sparkles
  },
  {
    id: 'alpha',
    name: 'Alpha Waves',
    frequency: '8-13 Hz',
    description: 'Relaxed alertness, light meditation',
    icon: Brain
  },
  {
    id: 'beta',
    name: 'Beta Waves',
    frequency: '13-38 Hz',
    description: 'Focus and concentration',
    icon: Zap
  },
  {
    id: 'gamma',
    name: 'Gamma Waves',
    frequency: '38-100 Hz',
    description: 'High-level cognitive processing',
    icon: Stars
  }
]

interface BinauralBeatsSelectorProps {
  value: string | null
  onChange: (value: string) => void
}

export function BinauralBeatsSelector({ value, onChange }: BinauralBeatsSelectorProps) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [selectedBeat, setSelectedBeat] = useState<string>('')
  const [playingPreview, setPlayingPreview] = useState<string | null>(null)
  const [generator] = useState(() => new BinauralBeatsGenerator())

  useEffect(() => {
    return () => {
      generator.cleanup()
    }
  }, [generator])

  const handleBeatChange = (newValue: string) => {
    if (isEnabled) {
      if (selectedBeat === newValue) {
        setSelectedBeat('')
        onChange('')
      } else {
        setSelectedBeat(newValue)
        onChange(newValue)
      }
    }
  }

  const handleToggle = (checked: boolean) => {
    setIsEnabled(checked)
    if (!checked) {
      generator.stop()
      setSelectedBeat('')
      onChange('')
      setPlayingPreview(null)
    }
  }

  const handlePreview = (beatId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the card selection
    
    if (playingPreview === beatId) {
      generator.stop()
      setPlayingPreview(null)
    } else {
      if (playingPreview) {
        generator.stop()
      }
      generator.start(beatId as keyof typeof generator['BEAT_FREQUENCIES'])
      setPlayingPreview(beatId)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="background-music" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Add Binaural Beats
        </Label>
        <Switch
          id="background-music"
          checked={isEnabled}
          onCheckedChange={handleToggle}
        />
      </div>

      <div 
        className={`grid grid-rows-[0fr] transition-all duration-300 ease-in-out ${isEnabled ? 'grid-rows-[1fr]' : ''}`}
      >
        <div className="overflow-hidden">
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!isEnabled ? "opacity-50 pointer-events-none" : ""}`}>
            {binauralBeats.map((beat) => {
              const Icon = beat.icon
              const isSelected = selectedBeat === beat.id && isEnabled
              const isPlaying = playingPreview === beat.id
              
              return (
                <div key={beat.id} className="relative group">
                  {isSelected && (
                    <>
                      <div className="absolute -inset-0.5 bg-white rounded-lg opacity-20 group-hover:opacity-30 transition duration-300"></div>
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-300 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-300"></div>
                    </>
                  )}
                  <div className="relative">
                    <div
                      onClick={() => handleBeatChange(beat.id)}
                      className={`w-full flex flex-col h-full p-4 rounded-lg cursor-pointer bg-zinc-900 border ${
                        isSelected ? 'border-primary' : 'border-white/20'
                      } hover:bg-accent relative z-10`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className="font-semibold">{beat.name}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-12 w-12 p-0"
                          onClick={(e) => handlePreview(beat.id, e)}
                        >
                          {isPlaying ? (
                            <StopCircle className="h-8 w-8" />
                          ) : (
                            <PlayCircle className="h-8 w-8" />
                          )}
                        </Button>
                      </div>
                      <span className="text-sm text-muted-foreground mb-1">{beat.frequency}</span>
                      <p className="text-sm text-muted-foreground text-left">{beat.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}