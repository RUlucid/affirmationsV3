"use client"

import { useEffect, useRef } from 'react'
import WaveSurfer from 'wavesurfer.js'

interface AudioWaveformProps {
  audioUrl: string
  height?: number
  waveColor?: string
  progressColor?: string
  cursorColor?: string
  barWidth?: number
  barGap?: number
}

export function AudioWaveform({
  audioUrl,
  height = 48,
  waveColor = '#4f46e5',
  progressColor = '#818cf8',
  cursorColor = '#6366f1',
  barWidth = 2,
  barGap = 1,
}: AudioWaveformProps) {
  const waveformRef = useRef<HTMLDivElement>(null)
  const wavesurfer = useRef<WaveSurfer | null>(null)
  const cleanupTimeout = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!waveformRef.current) return

    const options = {
      container: waveformRef.current,
      height,
      waveColor,
      progressColor,
      cursorColor,
      barWidth,
      barGap,
      normalize: true,
      responsive: true,
      interact: true,
      hideScrollbar: true,
      minPxPerSec: 50,
      fillParent: true,
      mediaControls: true,
      backend: 'WebAudio'
    }

    // Create WaveSurfer instance
    const ws = WaveSurfer.create(options)

    // Handle errors during loading
    ws.on('error', (err) => {
      console.error('WaveSurfer error:', err)
    })

    // Load audio with error handling
    try {
      ws.load(audioUrl)
    } catch (error) {
      console.error('Error loading audio:', error)
    }

    wavesurfer.current = ws

    // Cleanup function
    return () => {
      if (cleanupTimeout.current) {
        clearTimeout(cleanupTimeout.current)
      }

      const cleanup = async () => {
        if (wavesurfer.current) {
          try {
            // Stop any ongoing operations
            wavesurfer.current.pause()
            wavesurfer.current.cancelAjax()
            
            // Wait for any pending operations to complete
            await new Promise(resolve => setTimeout(resolve, 100))
            
            // Remove event listeners
            wavesurfer.current.unAll()
            
            // Destroy the instance
            await new Promise(resolve => {
              cleanupTimeout.current = setTimeout(async () => {
                try {
                  if (wavesurfer.current) {
                    await wavesurfer.current.destroy()
                  }
                } catch (error) {
                  // Ignore destroy errors as the instance might already be cleaned up
                } finally {
                  wavesurfer.current = null
                  resolve(undefined)
                }
              }, 200)
            })
          } catch (error) {
            console.error('WaveSurfer cleanup error:', error)
          } finally {
            wavesurfer.current = null
          }
        }
      }

      cleanup()
    }
  }, [audioUrl, height, waveColor, progressColor, cursorColor, barWidth, barGap])

  return <div ref={waveformRef} className="w-full" />
}