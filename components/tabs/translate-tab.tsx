"use client";

import { useState, useRef } from "react";
import { InputForm } from "@/components/youtube-translator/input-form";
import { Results } from "@/components/youtube-translator/results";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Volume2, Mic, Sparkles, Clock } from "lucide-react";
import { toast } from "sonner";
import { useAppContext } from "@/components/youtube-translator/global/app-layout";
import { useQueryClient } from "@tanstack/react-query";
import { userKeys } from "@/hooks/useUser";

// Message types from server
const MessageTypes = {
  PROCESSING_STARTED: "PROCESSING_STARTED",
  DOWNLOAD_PROGRESS: "DOWNLOAD_PROGRESS",
  TRANSCRIPTION_PROGRESS: "TRANSCRIPTION_PROGRESS",
  TRANSLATION_PROGRESS: "TRANSLATION_PROGRESS",
  PROCESSING_COMPLETE: "PROCESSING_COMPLETE",
  ERROR: "ERROR",
};

export function TranslateTab() {
  const {
    user,
    openaiApiKey,
    setOpenaiApiKey,
    setShowLoginModal,
    setShowPremiumModal,
  } = useAppContext();

  const queryClient = useQueryClient();

  const [videoUrl, setVideoUrl] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [initialLanguage, setInitialLanguage] = useState("");
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState("");
  const [audioData, setAudioData] = useState("");
  const [targetAudioData, setTargetAudioData] = useState("");

  // Audio generation options (upcoming features)
  const [generateTargetAudio, setGenerateTargetAudio] = useState(false);
  const [keepOriginalAudio, setKeepOriginalAudio] = useState(true);
  const [enableVoiceClone, setEnableVoiceClone] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("alloy");

  const wsRef = useRef<WebSocket | null>(null);

  const calculateOverallProgress = (stage: string, stageProgress: number) => {
    const stageWeights = {
      download: { base: 0, weight: 20 },
      transcription: { base: 20, weight: 30 },
      translation: { base: 50, weight: 50 },
    };

    const stageInfo = stageWeights[stage as keyof typeof stageWeights];
    if (!stageInfo) return 0;

    return Math.round(
      stageInfo.base + (stageProgress * stageInfo.weight) / 100
    );
  };

  const handleReset = () => {
    // Close WebSocket connection if active
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Reset all state
    setVideoUrl("");
    setTargetLanguage("");
    setIsProcessing(false);
    setTranscribedText("");
    setTranslatedText("");
    setInitialLanguage("");
    setProgress(0);
    setCurrentStage("");
    setAudioData("");
    setTargetAudioData("");

    // Reset audio options
    setGenerateTargetAudio(false);
    setKeepOriginalAudio(true);
    setEnableVoiceClone(false);
    setSelectedVoice("");

    toast.success("Results cleared! Ready for new conversion.");
  };

  const handleUpcomingFeature = (featureName: string) => {
    toast.info(`${featureName} is coming soon! Stay tuned for updates.`);
  };

  const handleProcess = async () => {
    if (!videoUrl || !targetLanguage) {
      toast.error("Please provide both YouTube URL and target language.");
      return;
    }

    // Check if user is logged in
    if (!user) {
      toast.error("Please log in to continue.");
      setShowLoginModal(true);
      return;
    }

    // If user doesn't have stored API key and hasn't provided one in the form
    if (!user.is_api_key_available && !openaiApiKey) {
      toast.error("Please provide your OpenAI API key.");
      return;
    }

    setIsProcessing(true);
    setTranscribedText("");
    setTranslatedText("");
    setInitialLanguage("");
    setProgress(0);
    setCurrentStage("Initializing...");

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
            openaiApiKey: openaiApiKey || null,
            shouldKeepOriginalAudio: keepOriginalAudio,
            shouldGenerateTargetAudio: generateTargetAudio,
            selectedVoice,
          })
        );
      }
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case MessageTypes.PROCESSING_STARTED:
          setCurrentStage("Starting...");
          setProgress(0);
          break;
        case MessageTypes.DOWNLOAD_PROGRESS:
          setCurrentStage("Downloading");
          const downloadProgress = data.data.progress || 0;
          setProgress(calculateOverallProgress("download", downloadProgress));
          break;
        case MessageTypes.TRANSCRIPTION_PROGRESS:
          setCurrentStage("Transcribing");
          const transcriptionProgress = data.data.progress || 0;
          setProgress(
            calculateOverallProgress("transcription", transcriptionProgress)
          );
          if (data.data.transcription) {
            setTranscribedText(data.data.transcription);
          }
          break;
        case MessageTypes.TRANSLATION_PROGRESS:
          setCurrentStage("Translating");
          const translationProgress = data.data.progress || 0;
          setProgress(
            calculateOverallProgress("translation", translationProgress)
          );
          if (data.data.currentTranslation) {
            setTranslatedText(data.data.currentTranslation);
          }
          break;
        case MessageTypes.PROCESSING_COMPLETE:
          setTranscribedText(data.data.transcription);
          setTranslatedText(data.data.translation);
          setInitialLanguage(data.data.initialLanguage || "Auto-detected");
          setAudioData(data.data.initialAudioData || "");
          setTargetAudioData(data.data.targetAudioData || "");
          setIsProcessing(false);
          setProgress(100);
          setCurrentStage("Complete");
          toast.success("Processing complete!");
          // Invalidate user profile and history queries to update usage counts
          queryClient.invalidateQueries({ queryKey: userKeys.profile() });
          queryClient.invalidateQueries({ queryKey: userKeys.history() });
          break;
        case MessageTypes.ERROR:
          toast.error(data.data.error);
          setIsProcessing(false);
          setProgress(0);
          setCurrentStage("");
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
      setProgress(0);
      setCurrentStage("");
    };
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6 h-full">
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
        </div>
        <div className="col-span-6 h-full">
          {/* Audio Generation Options */}
          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-purple-500" />
                Audio Generation Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 h-full flex flex-col justify-around">
              {/* Generate Target Language Audio */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label
                      htmlFor="generate-audio"
                      className="text-base font-medium"
                    >
                      Generate Audio in Target Language
                    </Label>
                    <p className="text-sm text-gray-600">
                      Create AI-generated speech for the translated text
                    </p>
                  </div>
                  <Switch
                    id="generate-audio"
                    checked={generateTargetAudio}
                    onCheckedChange={setGenerateTargetAudio}
                  />
                </div>

                {generateTargetAudio && (
                  <div className="flex items-center justify-between gap-2 p-4 bg-gray-50 rounded-none border-l-4 border-purple-400 ">
                    <p className="text-sm font-medium text-gray-700">
                      Choose a voice style
                    </p>
                    <div>
                      <Select
                        value={selectedVoice}
                        onValueChange={setSelectedVoice}
                      >
                        <SelectTrigger className="mt-2 bg-white">
                          <SelectValue placeholder="Choose a voice style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alloy">
                            Alloy
                          </SelectItem>
                          <SelectItem value="ash">
                            Ash
                          </SelectItem>
                          <SelectItem value="ballad">
                            Ballad
                          </SelectItem>
                          <SelectItem value="coral">
                            Coral
                          </SelectItem>
                          <SelectItem value="echo">
                            Echo
                          </SelectItem>
                          <SelectItem value="fable">
                            Fable
                          </SelectItem>
                          <SelectItem value="nova">
                            Nova
                          </SelectItem>
                          <SelectItem value="onyx">
                            Onyx
                          </SelectItem>
                          <SelectItem value="sage">
                            Sage
                          </SelectItem>
                          <SelectItem value="shimmer">
                            Shimmer
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* Keep Original Audio */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label
                    htmlFor="keep-original"
                    className="text-base font-medium"
                  >
                    Preserve Original Audio Track
                  </Label>
                  <p className="text-sm text-gray-600">
                    Keep the original audio alongside the translated version
                  </p>
                </div>
                <Switch
                  id="keep-original"
                  checked={keepOriginalAudio}
                  onCheckedChange={setKeepOriginalAudio}
                />
              </div>

              {/* Voice Cloning - Upcoming Feature */}
              <div className="space-y-4 relative">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-500 to-blue-500 text-white px-2 py-1 text-xs font-medium rounded-bl-lg rounded-tr-lg">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Coming Soon
                </div>
                <div className="flex items-center justify-between opacity-60">
                  <div className="space-y-1">
                    <Label
                      htmlFor="voice-clone"
                      className="text-base font-medium flex items-center gap-2"
                    >
                      <Mic className="w-4 h-4" />
                      Voice Cloning
                      <Badge variant="outline" className="text-xs">
                        Premium
                      </Badge>
                    </Label>
                    <p className="text-sm text-gray-600">
                      Clone the original speaker&apos;s voice for the translated
                      audio
                    </p>
                  </div>
                  <Switch
                    id="voice-clone"
                    checked={enableVoiceClone}
                    onCheckedChange={(checked) => {
                      setEnableVoiceClone(checked);
                      if (checked) handleUpcomingFeature("Voice Cloning");
                    }}
                    disabled
                  />
                </div>

                {enableVoiceClone && (
                  <div className="ml-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 opacity-60">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium text-purple-700">
                        Advanced Voice Cloning
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      Our AI will analyze the original speaker&apos;s voice
                      characteristics and apply them to the translated audio.
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Voice Tone Matching</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Accent Preservation</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Emotion Transfer</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Speaking Pace</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Voice Cloning Preview */}
              {enableVoiceClone && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-700">
                      Voice Cloning Coming Soon
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Advanced voice cloning technology is currently in
                    development. Join our waitlist to be notified when it&apos;s
                    available!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {(transcribedText || translatedText) && (
        <div className="space-y-4">
          {/* Results Header with Reset Button */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Translation Results
              </h2>
              <p className="text-gray-600">
                Your video has been successfully processed
              </p>
            </div>
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Output
            </Button>
          </div>

          {/* Results Component */}
          <Results
            transcribedText={transcribedText}
            translatedText={translatedText}
            targetLanguage={targetLanguage}
            initialLanguage={initialLanguage}
            initialAudioData={audioData}
            targetAudioData={targetAudioData}
          />
        </div>
      )}
    </div>
  );
}
