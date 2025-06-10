"use client";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/youtube-translator/header";
import { InputForm } from "@/components/youtube-translator/input-form";
import { Results } from "@/components/youtube-translator/results";
import { Features } from "@/components/youtube-translator/features";
import { AuthDialog } from "@/components/youtube-translator/auth-dialog";
import { toast } from "sonner";

// Message types from server
const MessageTypes = {
  PROCESSING_STARTED: "PROCESSING_STARTED",
  DOWNLOAD_PROGRESS: "DOWNLOAD_PROGRESS",
  TRANSCRIPTION_PROGRESS: "TRANSCRIPTION_PROGRESS",
  TRANSLATION_PROGRESS: "TRANSLATION_PROGRESS",
  PROCESSING_COMPLETE: "PROCESSING_COMPLETE",
  ERROR: "ERROR",
};

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [progress, setProgress] = useState(0);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleProcess = async () => {
    if (!videoUrl || !targetLanguage) {
      toast.error("Please provide both YouTube URL and target language.");
      return;
    }

    if (!openaiApiKey && !isLoggedIn) {
      setShowAuthDialog(true);
      return;
    }

    setIsProcessing(true);
    setTranscribedText("");
    setTranslatedText("");
    setProgress(0);

    // Close existing WebSocket connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Create new WebSocket connection
    wsRef.current = new WebSocket("ws://localhost:5000");

    wsRef.current.onopen = () => {
      if (wsRef.current) {
        wsRef.current.send(
          JSON.stringify({ videoUrl, targetLang: targetLanguage })
        );
      }
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case MessageTypes.PROCESSING_STARTED:
          toast.info(data.data.message);
          break;
        case MessageTypes.DOWNLOAD_PROGRESS:
          toast.info(data.data.message);
          break;
        case MessageTypes.TRANSCRIPTION_PROGRESS:
          if (data.data.transcription) {
            setTranscribedText(data.data.transcription);
          }
          break;
        case MessageTypes.TRANSLATION_PROGRESS:
          setProgress(data.data.progress || 0);
          if (data.data.currentTranslation) {
            setTranslatedText(data.data.currentTranslation);
          }
          break;
        case MessageTypes.PROCESSING_COMPLETE:
          setTranscribedText(data.data.transcription);
          setTranslatedText(data.data.translation);
          setIsProcessing(false);
          setProgress(100);
          toast.success("Processing complete!");
          break;
        case MessageTypes.ERROR:
          toast.error(data.data.error);
          setIsProcessing(false);
          break;
        default:
          break;
      }
    };

    wsRef.current.onerror = () => {
      toast.error("WebSocket connection error");
      setIsProcessing(false);
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
        />

        <Results
          transcribedText={transcribedText}
          translatedText={translatedText}
          targetLanguage={targetLanguage}
        />

        <Features />

        <AuthDialog
          open={showAuthDialog}
          onOpenChange={setShowAuthDialog}
          openaiApiKey={openaiApiKey}
          setOpenaiApiKey={setOpenaiApiKey}
          onSubmit={() => {
            setShowAuthDialog(false);
            handleProcess();
          }}
        />
      </div>
    </div>
  );
}
