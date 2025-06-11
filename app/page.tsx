"use client"

import { useState, useRef } from "react"
import { Header } from "@/components/youtube-translator/header"
import { InputForm } from "@/components/youtube-translator/input-form"
import { Results } from "@/components/youtube-translator/results"
import { Features } from "@/components/youtube-translator/features"
import { toast } from "sonner"  
import { useAppContext } from "@/components/youtube-translator/global/app-layout"

// Message types from server
const MessageTypes = {
  PROCESSING_STARTED: "PROCESSING_STARTED",
  DOWNLOAD_PROGRESS: "DOWNLOAD_PROGRESS",
  TRANSCRIPTION_PROGRESS: "TRANSCRIPTION_PROGRESS",
  TRANSLATION_PROGRESS: "TRANSLATION_PROGRESS",
  PROCESSING_COMPLETE: "PROCESSING_COMPLETE",
  ERROR: "ERROR",
}

export default function Home() {
  const {
    user,
    openaiApiKey,
    setOpenaiApiKey,
    setShowLoginModal,
    setShowPremiumModal,
    fetchHistory,
  } = useAppContext()

  const [videoUrl, setVideoUrl] = useState("")
  const [targetLanguage, setTargetLanguage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcribedText, setTranscribedText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [progress, setProgress] = useState(0)

  const wsRef = useRef<WebSocket | null>(null)

  const handleProcess = async () => {
    if (!videoUrl || !targetLanguage) {
      toast.error("Please provide both YouTube URL and target language.")
      return
    }

    // Check if user is logged in and has API key
    if (!user) {
      toast.error("Please log in to continue.")
      setShowLoginModal(true)
      return
    }

    // If user is logged in but doesn't have API key and hasn't provided one
    if (!user.is_api_key_available && !openaiApiKey) {
      toast.error("Please provide your OpenAI API key.")
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
          // Refresh history after successful processing
          const token = localStorage.getItem("token")
          if (token) {
            fetchHistory(token)
          }
          break
        case MessageTypes.ERROR:
          toast.error(data.data.error)
          setIsProcessing(false)
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
    }
  }

  return (
    <div className="container px-4 py-8 max-w-6xl">
      <Header />
      <InputForm
        videoUrl={videoUrl}
        setVideoUrl={setVideoUrl}
        targetLanguage={targetLanguage}
        setTargetLanguage={setTargetLanguage}
        openaiApiKey={openaiApiKey}
        setOpenaiApiKey={setOpenaiApiKey}
        isProcessing={isProcessing}
        progress={progress}
        onProcess={handleProcess}
        showApiKeyInput={!user?.is_api_key_available}
      />

      <Results
        transcribedText={transcribedText}
        translatedText={translatedText}
        targetLanguage={targetLanguage}
      />

      <Features />
    </div>
  )
}   