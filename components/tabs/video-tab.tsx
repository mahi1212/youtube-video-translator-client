"use client"

import { useState } from "react"
import { InputForm } from "@/components/youtube-translator/input-form"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Video, Clock, Palette, Target, Square } from "lucide-react"
import { toast } from "sonner"
import { useAppContext } from "@/components/youtube-translator/global/app-layout"

export function VideoTab() {
  const {
    user,
    openaiApiKey,
    setOpenaiApiKey,
    setShowLoginModal,
  } = useAppContext()

  const [videoUrl, setVideoUrl] = useState("")
  const [targetLanguage, setTargetLanguage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStage, setCurrentStage] = useState("")
  
  // Video specific options
  const [prompt, setPrompt] = useState("")
  const [videoDuration, setVideoDuration] = useState("")
  const [aspectRatio, setAspectRatio] = useState("")
  const [videoStyle, setVideoStyle] = useState("")
  const [videoTargetPlatform, setVideoTargetPlatform] = useState("")
  
  // Results
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState("")

  const handleProcess = async () => {
    if (!videoUrl) {
      toast.error("Please provide a YouTube URL.")
      return
    }

    if (!videoDuration || !aspectRatio || !videoStyle) {
      toast.error("Please configure all video generation options.")
      return
    }

    if (!user) {
      toast.error("Please log in to continue.")
      setShowLoginModal(true)
      return
    }

    if (!user.is_api_key_available && !openaiApiKey) {
      toast.error("Please provide your OpenAI API key.")
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setGeneratedVideoUrl("")

    try {
      await simulateVideoGeneration()
      toast.success("Video generated successfully!")
    } catch {
      toast.error("An error occurred during processing. Please try again.")
    } finally {
      setIsProcessing(false)
      setProgress(100)
    }
  }

  const simulateVideoGeneration = async () => {
    setCurrentStage("Processing video content")
    await simulateProgress(0, 25)

    setCurrentStage("Extracting key moments")
    await simulateProgress(25, 50)

    setCurrentStage("Generating video script")
    await simulateProgress(50, 75)

    setCurrentStage("Creating video")
    await simulateProgress(75, 100)

    // Use a placeholder video for demo
    setGeneratedVideoUrl("/placeholder-video.mp4")
  }

  const simulateProgress = async (start: number, end: number) => {
    const duration = 1000
    const steps = 10
    const increment = (end - start) / steps

    for (let i = 0; i <= steps; i++) {
      setProgress(Math.min(start + increment * i, end))
      await new Promise((resolve) => setTimeout(resolve, duration / steps))
    }
  }

  const getAspectRatioDisplay = (ratio: string) => {
    switch (ratio) {
      case "16:9":
        return "Landscape (16:9)"
      case "9:16":
        return "Portrait (9:16)"
      case "1:1":
        return "Square (1:1)"
      default:
        return ratio
    }
  }

  const getDurationDisplay = (duration: string) => {
    switch (duration) {
      case "short":
        return "15-30 seconds"
      case "medium":
        return "30-60 seconds"
      case "long":
        return "1-2 minutes"
      default:
        return duration
    }
  }

  return (
    <div className="space-y-6">
      {/* Basic Input Form */}
      <InputForm
        videoUrl={videoUrl}
        setVideoUrl={setVideoUrl}
        targetLanguage={targetLanguage}
        setTargetLanguage={setTargetLanguage}
        openaiApiKey={openaiApiKey}
        setOpenaiApiKey={setOpenaiApiKey}
        isProcessing={isProcessing}
        progress={progress}
        currentStage={currentStage}
        onProcess={handleProcess}
        showApiKeyInput={true}
        hasStoredApiKey={user?.is_api_key_available || false}
      />

      {/* Video Generation Options */}
      <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Video Generation Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="video-prompt">Video Instructions (Optional)</Label>
            <Textarea
              id="video-prompt"
              placeholder="E.g., 'Create a motivational video' or 'Focus on key highlights with smooth transitions'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Duration Selection */}
            <div className="space-y-3">
              <Label className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Video Duration</span>
              </Label>
              <div className="space-y-2">
                {["short", "medium", "long"].map((duration) => (
                  <div
                    key={duration}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      videoDuration === duration
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setVideoDuration(duration)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize">{duration}</span>
                      <span className="text-sm text-gray-500">{getDurationDisplay(duration)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selection */}
            <div className="space-y-3">
              <Label className="flex items-center space-x-2">
                <Square className="w-4 h-4" />
                <span>Aspect Ratio</span>
              </Label>
              <div className="space-y-2">
                {["16:9", "9:16", "1:1"].map((ratio) => (
                  <div
                    key={ratio}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      aspectRatio === ratio
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setAspectRatio(ratio)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{ratio}</span>
                      <span className="text-sm text-gray-500">{getAspectRatioDisplay(ratio)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Video Style */}
            <div className="space-y-2">
              <Label htmlFor="video-style" className="flex items-center space-x-2">
                <Palette className="w-4 h-4" />
                <span>Video Style</span>
              </Label>
              <Select value={videoStyle} onValueChange={setVideoStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dynamic">Dynamic Cuts</SelectItem>
                  <SelectItem value="smooth">Smooth Transitions</SelectItem>
                  <SelectItem value="minimal">Minimal/Clean</SelectItem>
                  <SelectItem value="cinematic">Cinematic</SelectItem>
                  <SelectItem value="energetic">High Energy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target Platform */}
            <div className="space-y-2">
              <Label htmlFor="video-platform" className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Target Platform (Optional)</span>
              </Label>
              <Select value={videoTargetPlatform} onValueChange={setVideoTargetPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="twitter">Twitter/X</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Configuration Summary */}
          {(videoDuration || aspectRatio || videoStyle) && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Configuration Summary:</h4>
              <div className="flex flex-wrap gap-2">
                {videoDuration && (
                  <Badge variant="secondary">
                    <Clock className="w-3 h-3 mr-1" />
                    {getDurationDisplay(videoDuration)}
                  </Badge>
                )}
                {aspectRatio && (
                  <Badge variant="secondary">
                    <Square className="w-3 h-3 mr-1" />
                    {aspectRatio}
                  </Badge>
                )}
                {videoStyle && (
                  <Badge variant="secondary">
                    <Palette className="w-3 h-3 mr-1" />
                    {videoStyle}
                  </Badge>
                )}
                {videoTargetPlatform && (
                  <Badge variant="secondary">
                    <Target className="w-3 h-3 mr-1" />
                    {videoTargetPlatform}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {generatedVideoUrl && (
        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Generated Video</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-8 rounded-lg text-center">
              <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Video Generation Completed!</h3>
              <p className="text-gray-600 mb-4">Your video has been successfully generated.</p>
              <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
                <span>Duration: {getDurationDisplay(videoDuration)}</span>
                <span>•</span>
                <span>Aspect: {aspectRatio}</span>
                <span>•</span>
                <span>Style: {videoStyle}</span>
                {videoTargetPlatform && (
                  <>
                    <span>•</span>
                    <span>Platform: {videoTargetPlatform}</span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 