import { Play, Loader2, Languages, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface InputFormProps {
  videoUrl: string;
  setVideoUrl: (url: string) => void;
  targetLanguage: string;
  setTargetLanguage: (lang: string) => void;
  openaiApiKey: string;
  setOpenaiApiKey: (key: string) => void;
  isProcessing: boolean;
  progress: number;
  onProcess: () => void;
}

export const languages = [
  { value: "Bengali", label: "Bengali (বাংলা)" },
  { value: "Hindi", label: "Hindi (हिन्दी)" },
  { value: "Spanish", label: "Spanish (Español)" },
  { value: "French", label: "French (Français)" },
  { value: "German", label: "German (Deutsch)" },
  { value: "Chinese", label: "Chinese (中文)" },
  { value: "Arabic", label: "Arabic (العربية)" },
  { value: "Japanese", label: "Japanese (日本語)" },
];

export function InputForm({
  videoUrl,
  setVideoUrl,
  targetLanguage,
  setTargetLanguage,
  openaiApiKey,
  setOpenaiApiKey,
  isProcessing,
  progress,
  onProcess,
}: InputFormProps) {
  return (
    <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur">
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
          />
        </div>

        <div className="flex gap-4 items-center w-full justify-between flex-wrap md:flex-nowrap">
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

          <div className="space-y-2 w-full">
            <Label htmlFor="openai-api-key" className="text-sm font-medium">
              OpenAI API Key
            </Label>
            <Input
              id="openai-api-key"
              placeholder="sk-..."
              value={openaiApiKey}
              onChange={(e) => setOpenaiApiKey(e.target.value)}
              type="password"
              className="w-full"
            />
          </div>
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
              className="h-12 cursor-pointer px-4 flex items-center justify-center gap-2 transition-colors duration-200"
              onClick={() => {
                setVideoUrl("");
                setTargetLanguage("");
                setOpenaiApiKey("");
              }}
            >
              <Trash2 className="w-5 h-5" />
              Clear All
            </Button>
          </div>

          <Button
            onClick={onProcess}
            disabled={isProcessing || !videoUrl || !targetLanguage}
            className="flex-1 h-12 text-lg cursor-pointer font-medium bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 transition-all duration-300 ease-in-out"
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
        </div>
      </CardContent>
    </Card>
  );
}
