"use client";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/youtube-translator/header";
import { InputForm } from "@/components/youtube-translator/input-form";
import { Results } from "@/components/youtube-translator/results";
import { Features } from "@/components/youtube-translator/features";
import { LoginModal } from "@/components/youtube-translator/auth/login-modal";
import { RegisterModal } from "@/components/youtube-translator/auth/register-modal";
import { ProfileButton } from "@/components/youtube-translator/profile-button";
import { ProfileModal } from "@/components/youtube-translator/profile-modal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PremiumModal } from "@/components/youtube-translator/premium-modal";
import { useRouter } from "next/navigation";

// Message types from server
const MessageTypes = {
  PROCESSING_STARTED: "PROCESSING_STARTED",
  DOWNLOAD_PROGRESS: "DOWNLOAD_PROGRESS",
  TRANSCRIPTION_PROGRESS: "TRANSCRIPTION_PROGRESS",
  TRANSLATION_PROGRESS: "TRANSLATION_PROGRESS",
  PROCESSING_COMPLETE: "PROCESSING_COMPLETE",
  ERROR: "ERROR",
};

interface User {
  id: string;
  name: string;
  email: string;
  subscription: string;
  usageLimit: number;
  apiKey?: string;
}

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [progress, setProgress] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for existing token and fetch user data
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserProfile(token);
    }
  }, []);

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const userData = await response.json();
      setUser(userData);
      if (userData.apiKey) {
        setOpenaiApiKey(userData.apiKey);
      }
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const handleAuthSuccess = (data: { token: string; user: User }) => {
    localStorage.setItem("token", data.token);
    setUser(data.user);
    if (data.user.apiKey) {
      setOpenaiApiKey(data.user.apiKey);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setOpenaiApiKey("");
    toast.success("Logged out successfully");
  };

  const handleProcess = async () => {
    if (!videoUrl || !targetLanguage) {
      toast.error("Please provide both YouTube URL and target language.");
      return;
    }

    if (!user) {
      setShowLoginModal(true);
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
          JSON.stringify({
            videoUrl,
            targetLang: targetLanguage,
            token: localStorage.getItem("token"),
          })
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
          if (data.data.requiresUpgrade) {
            setShowPremiumModal(true);
          } else if (data.data.requiresAuth) {
            setShowLoginModal(true);
          }
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
        {user ? (
          <div className="absolute right-10 bottom-10 flex gap-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => router.push("/history")}
            >
              History
            </Button>
            <ProfileButton
              user={user}
              onLogout={handleLogout}
              onViewProfile={() => setShowProfileModal(true)}
            />
          </div>
        ) : (
          <Button
            variant="outline"
            className="cursor-pointer absolute right-10 bottom-10"
            onClick={() => setShowLoginModal(true)}
          >
            Login
          </Button>
        )}
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

        <LoginModal
          open={showLoginModal}
          onOpenChange={setShowLoginModal}
          onSuccess={handleAuthSuccess}
          onRegisterClick={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
        />

        <RegisterModal
          open={showRegisterModal}
          onOpenChange={setShowRegisterModal}
          onSuccess={handleAuthSuccess}
          onLoginClick={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />

        {user && (
          <>
            <ProfileModal
              open={showProfileModal}
              onOpenChange={setShowProfileModal}
              user={user}
              onApiKeyUpdate={(apiKey) => {
                setUser({ ...user, apiKey });
                setOpenaiApiKey(apiKey);
              }}
            />

            <PremiumModal
              open={showPremiumModal}
              onOpenChange={setShowPremiumModal}
              onAddApiKey={() => {
                setShowPremiumModal(false);
                setShowProfileModal(true);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
