import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Mic, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen text-center">
        <div className="space-y-6 max-w-3xl">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Transform Your Life with
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text"> Daily Affirmations</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Create personalized affirmation audio with custom voices, binaural beats, and soothing soundscapes.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg">
              <Link href="/create">
                <Mic className="mr-2 h-5 w-5" />
                Create Affirmation
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg">
              <Link href="/explore">
                <Sparkles className="mr-2 h-5 w-5" />
                Explore Templates
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 bg-card rounded-lg shadow-lg">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Custom Voice Cloning</h3>
              <p className="text-muted-foreground">Create affirmations in your own voice or choose from premium voice options.</p>
            </div>
            <div className="p-6 bg-card rounded-lg shadow-lg">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Scripts</h3>
              <p className="text-muted-foreground">Generate personalized affirmation scripts tailored to your goals.</p>
            </div>
            <div className="p-6 bg-card rounded-lg shadow-lg">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/>
                  <path d="M9.5 9C9.5 8.17157 8.82843 7.5 8 7.5C7.17157 7.5 6.5 8.17157 6.5 9C6.5 9.82843 7.17157 10.5 8 10.5C8.82843 10.5 9.5 9.82843 9.5 9Z"/>
                  <path d="M17.5 9C17.5 8.17157 16.8284 7.5 16 7.5C15.1716 7.5 14.5 8.17157 14.5 9C14.5 9.82843 15.1716 10.5 16 10.5C16.8284 10.5 17.5 9.82843 17.5 9Z"/>
                  <path d="M12 18C14.7614 18 17 15.7614 17 13H7C7 15.7614 9.23858 18 12 18Z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Binaural Beats</h3>
              <p className="text-muted-foreground">Enhance your affirmations with scientifically-designed audio frequencies.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}