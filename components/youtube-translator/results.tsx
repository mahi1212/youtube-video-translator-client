import { FileText, Languages, Copy, Download, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { languages } from "./language-combobox";

interface ResultsProps {
  transcribedText: string;
  translatedText: string;
  targetLanguage: string;
  initialLanguage?: string;
  initialAudioData?: string;
  targetAudioData?: string;
}

export function Results({
  transcribedText,
  translatedText,
  targetLanguage,
  initialLanguage = "Auto-detected",
  initialAudioData,
  targetAudioData,
}: ResultsProps) {
  if (!transcribedText && !translatedText) return null;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard.`);
  };

  const downloadText = (text: string, type: string) => {
    // Create a blob with the text content
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    
    // Create a temporary link element
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    
    // Set the file name
    const targetLang = languages.find((lang) => lang.value === targetLanguage)?.label.split(" ")[0] || targetLanguage;
    const fileName = type === "Transcription" 
      ? `transcription_${initialLanguage.toLowerCase().replace(/\s+/g, '_')}.txt`
      : `translation_${targetLang.toLowerCase()}.txt`;
    
    link.download = fileName;
    
    // Append link to body, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(link.href);
    
    toast.success(`${type} downloaded successfully!`);
  };

  const downloadAudio = (audioData: string, type: string) => {
    if (!audioData) return;
    
    // Convert base64 to blob
    const byteCharacters = atob(audioData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'audio/mpeg' });
    
    // Create download link
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    
    // Set the file name based on type
    const fileName = type === "original" 
      ? `original_audio_${initialLanguage.toLowerCase().replace(/\s+/g, '_')}.mp3`
      : `translated_audio_${targetLanguage.toLowerCase().replace(/\s+/g, '_')}.mp3`;
    
    link.download = fileName;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(link.href);
    toast.success(`${type === "original" ? "Original" : "Translated"} audio downloaded successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Audio Players Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Original Audio */}
        {initialAudioData && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-blue-500" />
                Original Audio
              </CardTitle>
              <CardDescription>
                Listen to the original audio extracted from the video
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <audio 
                  controls 
                  className="w-full"
                  src={`data:audio/mpeg;base64,${initialAudioData}`}
                >
                  Your browser does not support the audio element.
                </audio>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => downloadAudio(initialAudioData, "original")}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Original Audio
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Translated Audio */}
        {targetAudioData && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-purple-500" />
                Translated Audio
              </CardTitle>
              <CardDescription>
                Listen to the AI-generated audio in {languages.find((lang) => lang.value === targetLanguage)?.label.split(" ")[0]}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <audio 
                  controls 
                  className="w-full"
                  src={`data:audio/mpeg;base64,${targetAudioData}`}
                >
                  Your browser does not support the audio element.
                </audio>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => downloadAudio(targetAudioData, "translated")}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Translated Audio
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Text Results */}
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
                {initialLanguage}
              </Badge>
            </div>
            <CardDescription>
              AI-generated transcription from the video audio ({initialLanguage} detected)
            </CardDescription>
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => downloadText(transcribedText, "Transcription")}
                >
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
                {languages.find((lang) => lang.value === targetLanguage)?.label.split(
                  " "
                )[0] || "Target Language"}
              </Badge>
            </div>
            <CardDescription>
              AI-powered translation from {initialLanguage} to your selected language
            </CardDescription>
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => downloadText(translatedText, "Translation")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 