"use client"

import { useState, useRef } from "react"
import { InputForm } from "@/components/youtube-translator/input-form"
import { Results } from "@/components/youtube-translator/results"
import { toast } from "sonner"
import { useAppContext } from "@/components/youtube-translator/global/app-layout"
import { useQueryClient } from "@tanstack/react-query"
import { userKeys } from "@/hooks/useUser"

// Message types from server
const MessageTypes = {
  PROCESSING_STARTED: "PROCESSING_STARTED",
  DOWNLOAD_PROGRESS: "DOWNLOAD_PROGRESS",
  TRANSCRIPTION_PROGRESS: "TRANSCRIPTION_PROGRESS",
  TRANSLATION_PROGRESS: "TRANSLATION_PROGRESS",
  PROCESSING_COMPLETE: "PROCESSING_COMPLETE",
  ERROR: "ERROR",
}

export function TranslateTab() {
  const {
    user,
    openaiApiKey,
    setOpenaiApiKey,
    setShowLoginModal,
    setShowPremiumModal,
  } = useAppContext()

  const queryClient = useQueryClient()

  const [videoUrl, setVideoUrl] = useState("")
  const [targetLanguage, setTargetLanguage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcribedText, setTranscribedText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [initialLanguage, setInitialLanguage] = useState("")
  const [progress, setProgress] = useState(0)
  const [currentStage, setCurrentStage] = useState("")

  const wsRef = useRef<WebSocket | null>(null)

  const calculateOverallProgress = (stage: string, stageProgress: number) => {
    const stageWeights = {
      download: { base: 0, weight: 20 },
      transcription: { base: 20, weight: 30 },
      translation: { base: 50, weight: 50 }
    }
    
    const stageInfo = stageWeights[stage as keyof typeof stageWeights]
    if (!stageInfo) return 0
    
    return Math.round(stageInfo.base + (stageProgress * stageInfo.weight) / 100)
  }

  const handleProcess = async () => {
    if (!videoUrl || !targetLanguage) {
      toast.error("Please provide both YouTube URL and target language.")
      return
    }

    // Check if user is logged in
    if (!user) {
      toast.error("Please log in to continue.")
      setShowLoginModal(true)
      return
    }

    // If user doesn't have stored API key and hasn't provided one in the form
    if (!user.is_api_key_available && !openaiApiKey) {
      toast.error("Please provide your OpenAI API key.")
      return
    }

    setIsProcessing(true)
    setTranscribedText("")
    setTranslatedText("")
    setInitialLanguage("")
    setProgress(0)
    setCurrentStage("Initializing...")

    // Close existing WebSocket connection if any
    if (wsRef.current) {
      wsRef.current.close()
    }

    // Create new WebSocket connection
    wsRef.current = new WebSocket("ws://localhost:5000")

    wsRef.current.onopen = () => {
      if (wsRef.current) {
        wsRef.current.send(
          JSON.stringify({
            videoUrl,
            targetLang: targetLanguage,
            token: localStorage.getItem("token"),
            openaiApiKey: openaiApiKey || null
          }),
        )
      }
    }

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)

      switch (data.type) {
        case MessageTypes.PROCESSING_STARTED:
          setCurrentStage("Starting...")
          setProgress(0)
          break
        case MessageTypes.DOWNLOAD_PROGRESS:
          setCurrentStage("Downloading")
          const downloadProgress = data.data.progress || 0
          setProgress(calculateOverallProgress("download", downloadProgress))
          break
        case MessageTypes.TRANSCRIPTION_PROGRESS:
          setCurrentStage("Transcribing")
          const transcriptionProgress = data.data.progress || 0
          setProgress(calculateOverallProgress("transcription", transcriptionProgress))
          if (data.data.transcription) {
            setTranscribedText(data.data.transcription)
          }
          break
        case MessageTypes.TRANSLATION_PROGRESS:
          setCurrentStage("Translating")
          const translationProgress = data.data.progress || 0
          setProgress(calculateOverallProgress("translation", translationProgress))
          if (data.data.currentTranslation) {
            setTranslatedText(data.data.currentTranslation)
          }
          break
        case MessageTypes.PROCESSING_COMPLETE:
          setTranscribedText(data.data.transcription)
          setTranslatedText(data.data.translation)
          setInitialLanguage(data.data.initialLanguage || "Auto-detected")
          setIsProcessing(false)
          setProgress(100)
          setCurrentStage("Complete")
          toast.success("Processing complete!")
          // Invalidate user profile and history queries to update usage counts
          queryClient.invalidateQueries({ queryKey: userKeys.profile() })
          queryClient.invalidateQueries({ queryKey: userKeys.history() })
          break
        case MessageTypes.ERROR:
          toast.error(data.data.error)
          setIsProcessing(false)
          setProgress(0)
          setCurrentStage("")
          if (data.data.requiresUpgrade) {
            setShowPremiumModal(true)
          } else if (data.data.requiresAuth) {
            setShowLoginModal(true)
          }
          break
        default:
          break
      }
    }

    wsRef.current.onerror = () => {
      toast.error("WebSocket connection error")
      setIsProcessing(false)
      setProgress(0)
      setCurrentStage("")
    }
  }

  return (
    <div>
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

      {(transcribedText || translatedText) && (
        <Results
          transcribedText={transcribedText}
          translatedText={translatedText}
          targetLanguage={targetLanguage}
          initialLanguage={initialLanguage}
        />
      )}
    </div>
  )
} 