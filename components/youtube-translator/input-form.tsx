import { Play, Loader2, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LanguageCombobox } from "./language-combobox";

interface InputFormProps {
  videoUrl: string;
  setVideoUrl: (url: string) => void;
  targetLanguage: string;
  setTargetLanguage: (lang: string) => void;
  openaiApiKey: string;
  setOpenaiApiKey: (key: string) => void;
  isProcessing: boolean;
  progress: number;
  currentStage?: string;
  onProcess: () => void;
  showApiKeyInput?: boolean;
  hasStoredApiKey?: boolean;
}

export function InputForm({
  videoUrl,
  setVideoUrl,
  targetLanguage,
  setTargetLanguage,
  openaiApiKey,
  setOpenaiApiKey,
  isProcessing,
  progress,
  currentStage = "",
  onProcess,
  showApiKeyInput = true,
  hasStoredApiKey = false
}: InputFormProps) {
  return (
    <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5 text-red-500" />
          Video Processing
        </CardTitle>
        <CardDescription>
          Enter a YouTube URL and select your target language to get started
        </CardDescription>
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
            disabled={isProcessing}
          />
        </div>

        <div className="flex gap-4 items-center w-full justify-between flex-wrap md:flex-nowrap">
          <div className="space-y-2 w-full">
            <Label htmlFor="target-language" className="text-sm font-medium">
              Target Language
            </Label>
            <LanguageCombobox 
              value={targetLanguage}
              onChange={setTargetLanguage}
            />
          </div>

          {showApiKeyInput && (
            <div className="space-y-2 w-full">
              <Label htmlFor="openai-api-key" className="text-sm font-medium flex items-center gap-2">
                  OpenAI API Key
                {hasStoredApiKey && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs">Already provided</span>
                  </div>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="openai-api-key"
                  placeholder={hasStoredApiKey ? "Using stored API key..." : "API Key required to process anonymously. sk-..."}
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                  type="password"
                  className="w-full h-12"
                  disabled={isProcessing}
                />
                {hasStoredApiKey && !openaiApiKey && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                )}
              </div>
              
            </div>
          )}
        </div>
        <div className={`flex items-center w-full justify-between flex-wrap ${videoUrl !== "" || targetLanguage !== "" || openaiApiKey !== "" ? "gap-4" : "gap-0"}`}>
          {/* clear button */}
          <div className="transition-all duration-300 ease-in-out transform origin-left"
               style={{
                 width: (videoUrl !== "" || targetLanguage !== "" || openaiApiKey !== "") ? 'auto' : '0',
                 opacity: (videoUrl !== "" || targetLanguage !== "" || openaiApiKey !== "") ? '1' : '0',
                 overflow: 'hidden'
               }}>
            <Button
              disabled={isProcessing}
              variant="default"
              className="h-11 cursor-pointer px-4 flex items-center justify-center gap-2 transition-colors duration-200 "
              onClick={() => {
                setVideoUrl("");
                setTargetLanguage("");
                setOpenaiApiKey("");
              }}
            >
              <Trash2 className="w-5 h-5" />
              Reset 
            </Button>
          </div>

          <Button
            onClick={onProcess}
            disabled={isProcessing || !videoUrl || !targetLanguage}
            className="flex-1 h-12 text-lg cursor-pointer font-medium bg-gradient-to-br from-blue-300 to-blue-600 hover:from-blue-400 hover:to-blue-700 transition-all duration-300 ease-in-out"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {currentStage} {progress}%
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Process Video
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
