"use client"

import { useState } from "react"
import { InputForm } from "@/components/youtube-translator/input-form"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Instagram, Facebook, Twitter } from "lucide-react"
import { toast } from "sonner"
import { useAppContext } from "@/components/youtube-translator/global/app-layout"
import TweetCard from "@/components/mvpblocks/twittercard"

export function SocialTab() {
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
  
  // Social specific options
  const [prompt, setPrompt] = useState("")
  const [socialPlatform, setSocialPlatform] = useState("")
  const [includeImages, setIncludeImages] = useState(false)
  const [imageCount, setImageCount] = useState(1)
  
  // Results
  const [socialPostContent, setSocialPostContent] = useState("")

  const handleProcess = async () => {
    if (!videoUrl) {
      toast.error("Please provide a YouTube URL.")
      return
    }

    if (!socialPlatform) {
      toast.error("Please select a social media platform.")
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
    setSocialPostContent("")

    try {
      await simulateSocialPostGeneration()
      toast.success("Social media post generated successfully!")
    } catch {
      toast.error("An error occurred during processing. Please try again.")
    } finally {
      setIsProcessing(false)
      setProgress(100)
    }
  }

  const simulateSocialPostGeneration = async () => {
    setCurrentStage("Analyzing video content")
    await simulateProgress(0, 30)

    if (includeImages) {
      setCurrentStage(`Generating ${imageCount} image${imageCount > 1 ? 's' : ''}`)
      await simulateProgress(30, 60)
    }

    setCurrentStage("Crafting social post")
    await simulateProgress(includeImages ? 60 : 30, 90)

    setCurrentStage("Optimizing for platform")
    await simulateProgress(90, 100)

    const platformText =
      socialPlatform === "instagram"
        ? "✈️ #TravelDiaries: My Journey to London 🇬🇧\n\nToday I stepped out of my comfort zone and practiced my English with two lovely ladies on the train! Despite being a beginner, I managed to have a meaningful conversation - they even invited me to visit them in England! 🙌\n\nIt's amazing how language connects us, even when the words don't come easily. Every conversation is progress! 💪\n\n#LanguageLearning #EnglishPractice #LondonAdventures #TravelStories #PersonalGrowth"
        : socialPlatform === "facebook"
          ? "Today on my train journey to London, something amazing happened! I met two kind English women and despite my limited vocabulary, I gathered the courage to practice my English with them. They were so patient and understanding, and we ended up having a lovely 10-minute conversation!\n\nThey even shared their contact details and invited me to visit them in England someday. It's incredible how a simple conversation can boost your confidence. Since that meeting, I've been practicing English every day!\n\nHave you ever had a meaningful encounter with strangers while traveling? Share your stories below! 👇"
          : "Just had the most encouraging language exchange on my train ride to London! Two English women took time to chat with me despite my beginner level. Proof that kindness transcends language barriers! #LanguageLearning"

    setSocialPostContent(platformText)
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

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <Instagram className="w-4 h-4" />
      case "facebook":
        return <Facebook className="w-4 h-4" />
      case "twitter":
        return <Twitter className="w-4 h-4" />
      default:
        return null
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "instagram":
        return "bg-gradient-to-r from-purple-500 to-pink-500"
      case "facebook":
        return "bg-blue-600"
      case "twitter":
        return "bg-sky-500"
      default:
        return "bg-gray-500"
    }
  }

  const getCharacterLimit = (platform: string) => {
    switch (platform) {
      case "twitter":
        return 280
      case "instagram":
        return 2200
      case "facebook":
        return 63206
      default:
        return 0
    }
  }

  // Convert social post content to array format for TweetCard
  const formatContentForTweetCard = (content: string) => {
    return content.split('\n').filter(line => line.trim() !== '')
  }

  const renderSocialPreview = () => {
    if (!socialPostContent) return null

    if (socialPlatform === "twitter") {
      return (
        <div className="flex justify-center">
          <TweetCard
            authorName={user?.name || "Content Creator"}
            authorHandle="content_creator"
            authorImage="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
            content={formatContentForTweetCard(socialPostContent)}
            isVerified={false}
            timestamp="2m"
          />
        </div>
      )
    }

    // For Instagram and Facebook, show the regular card format
    return (
      <div className="bg-gray-50 p-4 rounded-lg border">
        <pre className="whitespace-pre-wrap font-sans text-sm">{socialPostContent}</pre>
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Character count: {socialPostContent.length}</span>
            <span>
              Limit: {getCharacterLimit(socialPlatform) > 0 ? getCharacterLimit(socialPlatform) : "No limit"}
            </span>
          </div>
          {getCharacterLimit(socialPlatform) > 0 && socialPostContent.length > getCharacterLimit(socialPlatform) && (
            <p className="text-xs text-red-500 mt-1">
              ⚠️ Post exceeds platform character limit
            </p>
          )}
        </div>
      </div>
    )
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

      {/* Social Media Options */}
      <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Social Media Post Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="social-prompt">Custom Instructions (Optional)</Label>
            <Textarea
              id="social-prompt"
              placeholder="E.g., 'Use a casual tone' or 'Focus on key insights'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Target Platform</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {["instagram", "facebook", "twitter"].map((platform) => (
                <div
                  key={platform}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    socialPlatform === platform
                      ? "border-blue-400 bg-blue-600/2"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSocialPlatform(platform)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full text-white ${getPlatformColor(platform)}`}>
                      {getPlatformIcon(platform)}
                    </div>
                    <div>
                      <h3 className="font-medium capitalize">{platform}</h3>
                      <p className="text-sm text-gray-500">
                        {getCharacterLimit(platform) > 0 && `${getCharacterLimit(platform)} chars max`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="include-images-social"
                checked={includeImages}
                onCheckedChange={setIncludeImages}
              />
              <Label htmlFor="include-images-social">Include generated images</Label>
            </div>

            {includeImages && (
              <div className="space-y-2">
                <Label htmlFor="image-count-social">Number of images</Label>
                <Select value={imageCount.toString()} onValueChange={(value) => setImageCount(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 image</SelectItem>
                    <SelectItem value="2">2 images</SelectItem>
                    <SelectItem value="3">3 images</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {socialPostContent && (
        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Social Media Post</CardTitle>
              {socialPlatform && (
                <Badge className={`text-white ${getPlatformColor(socialPlatform)}`}>
                  <span className="flex items-center space-x-1">
                    {getPlatformIcon(socialPlatform)}
                    <span className="capitalize">{socialPlatform}</span>
                  </span>
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {renderSocialPreview()}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 