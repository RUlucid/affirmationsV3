"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { VoiceSelector } from '@/components/voice-selector'
import { AffirmationList } from '@/components/affirmation-list'
import { BinauralBeatsSelector } from '@/components/binaural-beats-selector'
import { generateSpeech } from '@/lib/elevenlabs'
import { ReverbControls, type ReverbSettings } from '@/components/reverb-controls'
import { ffmpegProcessor } from '@/lib/ffmpeg'
import { AudioMixer } from '@/components/audio-mixer'

// Default settings for clear hall reverb
const defaultReverbSettings: ReverbSettings = {
  delay: 100,     // 100ms for intimate clarity
  decay: 0.4,     // Moderate decay
  mix: 0.25       // 25% wet for natural blend
}

const affirmationTypes = [
  {
    id: 'confidence',
    name: 'Confidence',
    script: "I am confident in my abilities. I trust myself to handle any challenge that comes my way. My self-assurance grows stronger every day."
  },
  {
    id: 'self-love',
    name: 'Self Love',
    script: "I love and accept myself unconditionally. I am worthy of love and respect. I appreciate all aspects of who I am."
  },
  {
    id: 'ptsd',
    name: 'PTSD',
    script: "I am safe in the present moment. My past does not define me. I have the strength to heal and grow."
  },
  {
    id: 'avoidant',
    name: 'Avoidant Attachment',
    script: "I am capable of forming deep, meaningful connections. My worth is not determined by others. I deserve love and can safely open up to others."
  }
]

const affirmationLengths = [
  { id: '30sec', name: '30 seconds', default: false },
  { id: '1min', name: '1 minute' },
  { id: '10min', name: '10 minutes', default: true }
]

export default function CreateAffirmation() {
  const [selectedVoice, setSelectedVoice] = useState('9tTAUoagEtsVqJ60J8lL')
  const [selectedLength, setSelectedLength] = useState(() => {
    const defaultLength = affirmationLengths.find(length => length.default)
    return defaultLength ? defaultLength.id : affirmationLengths[0].id
  })
  const [selectedBeat, setSelectedBeat] = useState<string | null>(null)
  const [affirmations, setAffirmations] = useState<{ id: string; text: string }[]>([])
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [reverbSettings, setReverbSettings] = useState<ReverbSettings>(defaultReverbSettings)
  const [volumes, setVolumes] = useState({ voice: 1, binaural: 0.5 })
  const [processedVoice, setProcessedVoice] = useState<ArrayBuffer | null>(null)

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId)
    const type = affirmationTypes.find(t => t.id === typeId)
    if (type) {
      const sentences = type.script
        .split('.')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map(text => ({ id: uuidv4(), text: text + '.' }))
      setAffirmations(sentences)
    }
  }

  const handleUpdateAffirmation = (id: string, text: string) => {
    setAffirmations(prev => prev.map(a => 
      a.id === id ? { ...a, text } : a
    ))
  }

  const handleDeleteAffirmation = (id: string) => {
    setAffirmations(prev => prev.filter(a => a.id !== id))
  }

  const handleAddAffirmation = () => {
    setAffirmations(prev => [...prev, { id: uuidv4(), text: '' }])
  }

  const handleCreateAffirmation = async () => {
    if (!selectedVoice) {
      toast.error("Please select a voice")
      return
    }

    if (affirmations.length === 0) {
      toast.error("Please add at least one affirmation")
      return
    }

    if (!affirmations.every(a => a.text.trim())) {
      toast.error("Please fill in all affirmation texts")
      return
    }

    setIsGenerating(true)
    let downloadUrl: string | null = null

    try {
      // Generate script with pauses between affirmations
      const script = affirmations
        .map(a => a.text.trim())
        .join(' <break time="3.0s" /> ')

      const audioData = await generateSpeech(script, selectedVoice)
      
      if (!audioData?.byteLength) {
        throw new Error('No audio data received from speech generation')
      }

      // Process audio with reverb and binaural beats
      const processedAudio = await ffmpegProcessor.processAudio(
        audioData, 
        reverbSettings,
        selectedBeat,
        volumes
      )
      
      if (!processedAudio?.byteLength) {
        throw new Error('Failed to process audio')
      }

      // Store processed voice for preview
      setProcessedVoice(processedAudio)

      // Create download
      const blob = new Blob([processedAudio], { type: 'audio/wav' })
      downloadUrl = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = 'affirmation.wav'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      toast.success("Affirmation created successfully!")
    } catch (error) {
      console.error('Failed to create affirmation:', error)
      toast.error(error instanceof Error ? error.message : "Failed to create affirmation")
    } finally {
      setIsGenerating(false)
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl)
      }
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Create New Affirmation</h1>

        <Card>
          <CardHeader>
            <CardTitle>Voice Selection</CardTitle>
            <CardDescription>Choose a pre-created voice or add your own custom voice for your affirmation.</CardDescription>
          </CardHeader>
          <CardContent>
            <VoiceSelector value={selectedVoice} onChange={setSelectedVoice} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Affirmation Type</CardTitle>
            <CardDescription>Choose the type of affirmation you want to create.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedType || ''} onValueChange={handleTypeSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select affirmation type" />
              </SelectTrigger>
              <SelectContent>
                {affirmationTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {affirmations.length > 0 && (
              <div className="space-y-4">
                <CardTitle>Affirmation Script</CardTitle>
                <AffirmationList
                  affirmations={affirmations}
                  onUpdate={handleUpdateAffirmation}
                  onDelete={handleDeleteAffirmation}
                  onAdd={handleAddAffirmation}
                />
                <Button onClick={handleAddAffirmation} variant="outline" className="w-full">
                  + Add Another Affirmation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Affirmation Settings</CardTitle>
            <CardDescription>Customize the duration and voice effects for your affirmation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Duration</Label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-white rounded-lg opacity-20 group-hover:opacity-30 transition duration-300"></div>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-300 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-300"></div>
                <div className="relative">
                  <Select value={selectedLength} onValueChange={setSelectedLength}>
                    <SelectTrigger className="w-full bg-zinc-900 border-white/20">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {affirmationLengths.map((length) => (
                        <SelectItem key={length.id} value={length.id}>
                          {length.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Choose how long your affirmation session should last
              </p>
            </div>

            <ReverbControls
              settings={reverbSettings}
              onChange={setReverbSettings}
              disabled={isGenerating}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Binaural Beats</CardTitle>
            <CardDescription>Add binaural beats to enhance your affirmation experience.</CardDescription>
          </CardHeader>
          <CardContent>
            <BinauralBeatsSelector
              value={selectedBeat}
              onChange={setSelectedBeat}
            />
          </CardContent>
        </Card>

        <AudioMixer
          onVolumeChange={setVolumes}
          disabled={isGenerating}
          isProcessing={isGenerating}
          selectedBeat={selectedBeat}
          voiceAudioData={processedVoice}
        />

        <div className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard">Cancel</Link>
          </Button>
          <Button 
            onClick={handleCreateAffirmation} 
            disabled={isGenerating}
          >
            {isGenerating ? "Creating..." : "Create Affirmation"}
          </Button>
        </div>
      </div>
    </div>
  )
}