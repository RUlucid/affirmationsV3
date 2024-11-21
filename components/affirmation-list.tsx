"use client"

import { Sparkle, X } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface Affirmation {
  id: string
  text: string
}

interface AffirmationListProps {
  affirmations: Affirmation[]
  onUpdate: (id: string, text: string) => void
  onDelete: (id: string) => void
  onAdd: () => void
}

export function AffirmationList({ affirmations, onUpdate, onDelete }: AffirmationListProps) {
  return (
    <div className="space-y-4">
      {affirmations.map((affirmation) => (
        <div key={affirmation.id} className="relative group">
          <div className="absolute -inset-0.5 bg-white rounded-lg opacity-20 group-hover:opacity-30 transition duration-300"></div>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-300 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-300"></div>
          <div className="relative rounded-lg bg-zinc-900 shadow-xl border border-white/20">
            <div className="relative flex items-center gap-2 pr-2">
              <div className="flex-none pl-3 py-2">
                <Sparkle className="h-4 w-4 text-blue-500" />
              </div>
              <textarea
                value={affirmation.text}
                onChange={(e) => onUpdate(affirmation.id, e.target.value)}
                className="flex-1 bg-transparent py-2 text-base text-gray-300 placeholder-gray-500 focus:outline-none min-h-0 h-[38px] resize-none overflow-hidden"
                placeholder="Enter your affirmation..."
                style={{ lineHeight: '1.5' }}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(affirmation.id)}
                className="flex-none opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-lg">
              <div 
                className="w-full h-full rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0) 50%)',
                }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}