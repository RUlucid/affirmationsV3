"use client"

import { useState } from 'react'
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from "@/components/ui/button"

export interface ReverbSettings {
  delay: number
  decay: number
  mix: number
}

interface ReverbControlsProps {
  settings: ReverbSettings
  onChange: (settings: ReverbSettings) => void
  disabled?: boolean
}

export function ReverbControls({ settings, onChange, disabled = false }: ReverbControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleChange = (key: keyof ReverbSettings, value: number[]) => {
    onChange({
      ...settings,
      [key]: value[0]
    })
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <span className="text-base">Advanced Settings</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <div className={`grid grid-rows-[0fr] transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : ''}`}>
        <div className="overflow-hidden">
          <CardContent className="space-y-6 pb-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Room Size</Label>
                <span className="text-sm text-muted-foreground">{settings.delay}ms</span>
              </div>
              <Slider
                value={[settings.delay]}
                onValueChange={(value) => handleChange('delay', value)}
                min={0}
                max={500}
                step={10}
                disabled={disabled}
              />
              <p className="text-xs text-muted-foreground">
                Adjusts the perceived size of the space (0 = normal, 500 = large hall)
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Sustain</Label>
                <span className="text-sm text-muted-foreground">{settings.decay.toFixed(2)}</span>
              </div>
              <Slider
                value={[settings.decay]}
                onValueChange={(value) => handleChange('decay', value)}
                min={0}
                max={0.9}
                step={0.1}
                disabled={disabled}
              />
              <p className="text-xs text-muted-foreground">
                Controls how long the reverb effect lasts (0 = normal, 0.9 = long decay)
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Blend</Label>
                <span className="text-sm text-muted-foreground">{settings.mix.toFixed(2)}</span>
              </div>
              <Slider
                value={[settings.mix]}
                onValueChange={(value) => handleChange('mix', value)}
                min={0}
                max={0.5}
                step={0.05}
                disabled={disabled}
              />
              <p className="text-xs text-muted-foreground">
                Balances between the original and enhanced sound (0 = normal, 0.5 = fully enhanced)
              </p>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  )
}