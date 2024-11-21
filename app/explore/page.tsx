import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Shield, Sparkles, LinkIcon } from 'lucide-react'
import Link from 'next/link'

const templates = [
  {
    title: "Confidence Boost",
    description: "Build self-confidence and overcome self-doubt",
    icon: <Sparkles className="h-5 w-5" />,
    category: "Confidence",
    script: "I am confident in my abilities. I trust myself to handle any challenge that comes my way. My self-assurance grows stronger every day.",
  },
  {
    title: "Self-Love Journey",
    description: "Nurture self-acceptance and inner peace",
    icon: <Heart className="h-5 w-5" />,
    category: "Self love",
    script: "I love and accept myself unconditionally. I am worthy of love and respect. I appreciate all aspects of who I am.",
  },
  {
    title: "PTSD Recovery",
    description: "Support healing and resilience",
    icon: <Shield className="h-5 w-5" />,
    category: "PTSD",
    script: "I am safe in the present moment. My past does not define me. I have the strength to heal and grow.",
  },
  {
    title: "Secure Attachment",
    description: "Foster healthy relationships and connections",
    icon: <LinkIcon className="h-5 w-5" />,
    category: "Avoidant attachment",
    script: "I am capable of forming deep, meaningful connections. My worth is not determined by others. I deserve love and can safely open up to others.",
  },
]

export default function ExplorePage() {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter">Explore Templates</h1>
          <p className="text-muted-foreground">
            Choose from our curated collection of affirmation templates designed for various needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((template, index) => (
            <Card key={index} className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    {template.icon}
                  </div>
                  <div>
                    <CardTitle>{template.title}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {template.script}
                </p>
                <Button asChild className="w-full">
                  <Link 
                    href={{
                      pathname: '/create',
                      query: { template: template.category }
                    }}
                  >
                    Use Template
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}