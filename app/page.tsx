'use client'

import { useState, useEffect, useRef } from "react" 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Youtube, Languages, FileText, Download, Copy, Play, Loader2 } from "lucide-react"
import { toast } from "sonner"

// Message types from server
const MessageTypes = {
  PROCESSING_STARTED: 'PROCESSING_STARTED',
  DOWNLOAD_PROGRESS: 'DOWNLOAD_PROGRESS',
  TRANSCRIPTION_PROGRESS: 'TRANSCRIPTION_PROGRESS',
  TRANSLATION_PROGRESS: 'TRANSLATION_PROGRESS',
  PROCESSING_COMPLETE: 'PROCESSING_COMPLETE',
  ERROR: 'ERROR'
};

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("")
  const [targetLanguage, setTargetLanguage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcribedText, setTranscribedText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [progress, setProgress] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const handleProcess = async () => {
    if (!videoUrl || !targetLanguage) {
      toast.error("Please provide both YouTube URL and target language.")
      return
    }

    setIsProcessing(true)
    setTranscribedText("")
    setTranslatedText("")
    setProgress(0)

    // Close existing WebSocket connection if any
    if (wsRef.current) {
      wsRef.current.close()
    }

    // Create new WebSocket connection
    wsRef.current = new WebSocket('ws://localhost:4000')
    
    wsRef.current.onopen = () => {
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify({ videoUrl, targetLang: targetLanguage }))
      }
    }

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      switch (data.type) {
        case MessageTypes.PROCESSING_STARTED:
          toast.info(data.data.message)
          break
        case MessageTypes.DOWNLOAD_PROGRESS:
          toast.info(data.data.message)
          break
        case MessageTypes.TRANSCRIPTION_PROGRESS:
          if (data.data.transcription) {    
            setTranscribedText(data.data.transcription)
          }
          break
        case MessageTypes.TRANSLATION_PROGRESS:
          setProgress(data.data.progress || 0)
          if (data.data.currentTranslation) {
            setTranslatedText(data.data.currentTranslation)
          }
          break
        case MessageTypes.PROCESSING_COMPLETE:
          setTranscribedText(data.data.transcription)
          setTranslatedText(data.data.translation)
          setIsProcessing(false)
          setProgress(100)
          toast.success("Processing complete!")
          break
        case MessageTypes.ERROR:
          toast.error(data.data.error)
          setIsProcessing(false)
          break
        default:
          break
      }
    }

    wsRef.current.onerror = () => {
      toast.error("WebSocket connection error")
      setIsProcessing(false)
    }
  } 

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${type} copied to clipboard.`)
  }

  const languages = [
    { value: "Bengali", label: "Bengali (বাংলা)" },
    { value: "Hindi", label: "Hindi (हिन्दी)" },
    { value: "Spanish", label: "Spanish (Español)" },
    { value: "French", label: "French (Français)" },
    { value: "German", label: "German (Deutsch)" },
    { value: "Chinese", label: "Chinese (中文)" },
    { value: "Arabic", label: "Arabic (العربية)" },
    { value: "Japanese", label: "Japanese (日本語)" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-red-500 rounded-full">
              <Youtube className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
              YouTube Translator
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform any YouTube video into text and translate it to your preferred language with AI-powered accuracy
          </p>
        </div>

        {/* Main Input Card */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-red-500" />
              Video Processing
            </CardTitle>
            <CardDescription>Enter a YouTube URL and select your target language to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="video-url" className="text-sm font-medium">
                YouTube Video URL
              </Label>
              <Input
                id="video-url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-language" className="text-sm font-medium">
                Target Language
              </Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select a language to translate to" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      <div className="flex items-center gap-2">
                        <Languages className="w-4 h-4" />
                        {lang.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleProcess}
              disabled={isProcessing || !videoUrl || !targetLanguage}
              className="w-full h-12 text-lg font-medium bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing Video... {progress}%
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Process Video
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {(transcribedText || translatedText) && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Transcribed Text */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    Original Transcription
                  </CardTitle>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    English
                  </Badge>
                </div>
                <CardDescription>AI-generated transcription from the video audio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    value={transcribedText}
                    readOnly
                    className="min-h-[300px] resize-none border-0 bg-gray-50 focus-visible:ring-1"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(transcribedText, "Transcription")}
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Text
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Translated Text */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Languages className="w-5 h-5 text-purple-500" />
                    Translation
                  </CardTitle>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    {languages.find((lang) => lang.value === targetLanguage)?.label.split(" ")[0] || "Target Language"}
                  </Badge>
                </div>
                <CardDescription>AI-powered translation in your selected language</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    value={translatedText}
                    readOnly
                    className={`min-h-[300px] resize-none border-0 bg-gray-50 focus-visible:ring-1 ${targetLanguage.toLowerCase()}-text`}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(translatedText, "Translation")}
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Text
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="text-center p-6 border-0 bg-white/60 backdrop-blur">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Youtube className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-semibold mb-2">YouTube Integration</h3>
            <p className="text-sm text-muted-foreground">
              Direct integration with YouTube for seamless video processing
            </p>
          </Card>

          <Card className="text-center p-6 border-0 bg-white/60 backdrop-blur">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="font-semibold mb-2">AI Transcription</h3>
            <p className="text-sm text-muted-foreground">
              Advanced AI technology for accurate speech-to-text conversion
            </p>
          </Card>

          <Card className="text-center p-6 border-0 bg-white/60 backdrop-blur">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Languages className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="font-semibold mb-2">Multi-Language</h3>
            <p className="text-sm text-muted-foreground">Support for 50+ languages with high-quality translations</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
