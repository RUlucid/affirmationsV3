"use client"

export interface AddVoiceResponse {
  voice_id: string
  name: string
}

export async function addVoice(
  audioBlob: Blob,
  name: string = "My Custom Voice",
  description: string = "Custom voice created for affirmations",
  labels: Record<string, string> = { type: "custom" }
): Promise<AddVoiceResponse> {
  const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY

  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured')
  }

  const formData = new FormData()
  formData.append('name', name)
  formData.append('files', audioBlob)
  formData.append('description', description)
  formData.append('labels', JSON.stringify(labels))
  formData.append('remove_background_noise', 'true')

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: formData
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`ElevenLabs API error: ${error}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Voice cloning error:', error)
    throw error instanceof Error ? error : new Error('Failed to clone voice')
  }
}

export async function generateClonedSpeech(
  voiceId: string,
  text: string
): Promise<ArrayBuffer> {
  const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY

  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured')
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75 // Increased for better voice matching
          }
        })
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`ElevenLabs API error: ${error}`)
    }

    return await response.arrayBuffer()
  } catch (error) {
    console.error('Speech generation error:', error)
    throw error instanceof Error ? error : new Error('Failed to generate speech')
  }
}