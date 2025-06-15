import { FileText, Languages, Copy, Download, Volume2, LanguagesIcon, RotateCcw, Pencil } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { languages } from "./language-combobox";
import { useState, useEffect } from "react";
import { useEditText, useRetranslate, useRemakeAudio } from "@/hooks/useUser";

interface ResultsProps {
  historyId?: string;
  transcribedText: string;
  translatedText: string;
  targetLanguage: string;
  initialLanguage?: string;
  initialAudioData?: string;
  targetAudioData?: string;
  selectedVoice?: string;
}

export function Results({
  historyId,
  transcribedText: initialTranscribedText,
  translatedText: initialTranslatedText,
  targetLanguage,
  initialLanguage = "Auto-detected",
  initialAudioData,
  targetAudioData: initialTargetAudioData,
  selectedVoice: initialVoice,
}: ResultsProps) {
  const [transcribedText, setTranscribedText] = useState(initialTranscribedText || '');
  const [translatedText, setTranslatedText] = useState(initialTranslatedText || '');
  const [originalTranscribedText, setOriginalTranscribedText] = useState(initialTranscribedText || '');
  const [originalTranslatedText, setOriginalTranslatedText] = useState(initialTranslatedText || '');
  const [isEditingTranscription, setIsEditingTranscription] = useState(false);
  const [isEditingTranslation, setIsEditingTranslation] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [targetAudioData, setTargetAudioData] = useState(initialTargetAudioData);
  const [currentVoice, setCurrentVoice] = useState(initialVoice || 'nova');
  const [isNewAudio, setIsNewAudio] = useState(false);

  const editTextMutation = useEditText();
  const retranslateMutation = useRetranslate();
  const remakeAudioMutation = useRemakeAudio();

  // Update state when props change
  useEffect(() => {
    setTranscribedText(initialTranscribedText || '');
    setTranslatedText(initialTranslatedText || '');
    setOriginalTranscribedText(initialTranscribedText || '');
    setOriginalTranslatedText(initialTranslatedText || '');
    setTargetAudioData(initialTargetAudioData);
    setIsNewAudio(false);
    if (initialVoice) {
      setCurrentVoice(initialVoice);
    }
  }, [initialTranscribedText, initialTranslatedText, initialTargetAudioData, initialVoice]);

  const [hasTranscriptionChanged, setHasTranscriptionChanged] = useState(false);
  const [hasTranslationChanged, setHasTranslationChanged] = useState(false);

  useEffect(() => {
    setHasTranscriptionChanged(transcribedText !== originalTranscribedText);
    setHasTranslationChanged(translatedText !== originalTranslatedText);
  }, [transcribedText, translatedText, originalTranscribedText, originalTranslatedText]);

  const handleRetranslate = async () => {
    if (!historyId) {
      toast.error('Cannot retranslate: No history ID found');
      return;
    }

    if (isTranslating) {
      setIsTranslating(false);
      retranslateMutation.reset();
      return;
    }

    const toastId = toast.loading('Saving changes and retranslating...');
    setIsTranslating(true);
    
    try {
      // First save the edited text
      if (isEditingTranscription) {
        await editTextMutation.mutateAsync({ historyId, type: 'source', text: transcribedText });
      }

      // Then retranslate
      const result = await retranslateMutation.mutateAsync(historyId);
      if (result && result.resultText) {
        setTranslatedText(result.resultText);
        setOriginalTranslatedText(result.resultText);
        setIsEditingTranscription(false); // Exit edit mode
        // Don't enable translation editing automatically anymore
        toast.success('Text re-translated successfully', { id: toastId });
      } else {
        throw new Error('No translation received from server');
      }
    } catch (error) {
      console.error('Retranslation error:', error);
      toast.error(
        `Failed to re-translate: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { id: toastId }
      );
    } finally {
      setIsTranslating(false);
      setHasTranscriptionChanged(false);
    }
  };

  const handleRemakeAudio = async () => {
    if (!historyId) {
      toast.error('Cannot remake audio: No history ID found');
      return;
    }

    if (isGeneratingAudio) {
      setIsGeneratingAudio(false);
      remakeAudioMutation.reset();
      return;
    }

    const toastId = toast.loading('Saving changes and regenerating audio...');
    setIsGeneratingAudio(true);
    
    try {
      // First save the edited text
      if (isEditingTranslation) {
        await editTextMutation.mutateAsync({ historyId, type: 'translated', text: translatedText });
      }

      // Then remake audio
      const result = await remakeAudioMutation.mutateAsync({ 
        historyId, 
        voice: currentVoice 
      });
      
      if (result && result.targetAudioData) {
        setTargetAudioData(result.targetAudioData);
        setIsNewAudio(true);
        setCurrentVoice(currentVoice);
        setIsEditingTranslation(false); // Exit edit mode
        toast.success('Audio regenerated successfully', { id: toastId });
      } else {
        throw new Error('No audio data received from server');
      }
    } catch (error) {
      console.error('Audio regeneration error:', error);
      toast.error(
        `Failed to regenerate audio: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { id: toastId }
      );
    } finally {
      setIsGeneratingAudio(false);
      setHasTranslationChanged(false);
    }
  };

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
    const targetLang =
      languages
        .find((lang) => lang.value === targetLanguage)
        ?.label.split(" ")[0] || targetLanguage;
    const fileName =
      type === "Transcription"
        ? `transcription_${initialLanguage
            .toLowerCase()
            .replace(/\s+/g, "_")}.txt`
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
    const blob = new Blob([byteArray], { type: "audio/mpeg" });

    // Create download link
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);

    // Set the file name based on type
    const fileName =
      type === "original"
        ? `original_audio_${initialLanguage
            .toLowerCase()
            .replace(/\s+/g, "_")}.mp3`
        : `translated_audio_${targetLanguage
            .toLowerCase()
            .replace(/\s+/g, "_")}.mp3`;

    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);
    toast.success(
      `${
        type === "original" ? "Original" : "Translated"
      } audio downloaded successfully!`
    );
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
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-purple-500" />
                  Translated Audio
                </CardTitle>
                <Badge variant={isNewAudio ? "default" : "secondary"} className={isNewAudio ? "bg-green-100 text-green-700" : ""}>
                  {isNewAudio ? "New Version" : "Previous Version"}
                </Badge>
              </div>
              <CardDescription>
                Listen to the AI-generated audio in{" "}
                {languages.find((lang) => lang.value === targetLanguage)?.label.split(" ")[0]}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <audio
                  controls
                  className="w-full"
                  src={`data:audio/mpeg;base64,${targetAudioData}`}
                  key={targetAudioData}
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
              AI-generated transcription from the video audio
              {/* ({initialLanguage} detected) */}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                value={transcribedText}
                onChange={(e) => setTranscribedText(e.target.value)}
                className="min-h-[300px] resize-none border-0 bg-gray-50 focus-visible:ring-1"
                disabled={!isEditingTranscription || editTextMutation.isPending}
              />
              <div className="flex gap-2">
                {!isEditingTranscription ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingTranscription(true)}
                    className="flex-1"
                    disabled={isTranslating}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTranscribedText(originalTranscribedText);
                      setIsEditingTranscription(false);
                    }}
                    className="flex-1"
                    disabled={isTranslating}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Undo Changes
                  </Button>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isTranslating ? "destructive" : hasTranscriptionChanged ? "default" : "outline"}
                        size="sm"
                        onClick={handleRetranslate}
                        className="flex-1 relative"
                        disabled={(!hasTranscriptionChanged && !isTranslating) || !historyId || retranslateMutation.isPending || editTextMutation.isPending}
                      >
                        {isTranslating ? (
                          <>
                            <div className="absolute inset-0 bg-green-100 animate-pulse rounded-md"></div>
                            <span className="relative z-10 flex items-center">
                              <span className="w-4 h-4 mr-2 rounded-full bg-green-500 animate-ping"></span>
                              Translation in progress
                            </span>
                          </>
                        ) : (
                          <>
                            <LanguagesIcon className="w-4 h-4 mr-2" />
                            {hasTranscriptionChanged ? 'Save & Re-translate' : 'Re-translate'}
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    {!hasTranscriptionChanged && !isTranslating && (
                      <TooltipContent>
                        <p>Edit the content first to enable re-translation</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(transcribedText, "Transcription")}
                    className="flex-1"
                    disabled={isTranslating}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => downloadText(transcribedText, "Transcription")}
                    disabled={isTranslating}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
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
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-700"
              >
                {languages
                  .find((lang) => lang.value === targetLanguage)
                  ?.label.split(" ")[0] || "Target Language"}
              </Badge>
            </div>
            <CardDescription>
              AI-powered translation from {initialLanguage} to your selected
              language
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                value={translatedText}
                onChange={(e) => setTranslatedText(e.target.value)}
                className={`min-h-[300px] resize-none border-0 bg-gray-50 focus-visible:ring-1 ${targetLanguage.toLowerCase()}-text`}
                disabled={!isEditingTranslation || editTextMutation.isPending}
              />
              <div className="flex gap-2">
                {!isEditingTranslation && !hasTranslationChanged ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingTranslation(true)}
                    className="flex-1"
                    disabled={isGeneratingAudio}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : hasTranslationChanged && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTranslatedText(originalTranslatedText);
                      setIsEditingTranslation(false);
                    }}
                    className="flex-1"
                    disabled={isGeneratingAudio}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Undo Changes
                  </Button>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isGeneratingAudio ? "destructive" : hasTranslationChanged ? "default" : "outline"}
                        size="sm"
                        onClick={handleRemakeAudio}
                        className={`flex-1 relative ${hasTranslationChanged ? 'animate-pulse' : ''}`}
                        disabled={(!historyId || isGeneratingAudio || remakeAudioMutation.isPending || editTextMutation.isPending) || 
                                (isEditingTranslation && !hasTranslationChanged)} // Only disable if in edit mode with no changes
                      >
                        {isGeneratingAudio ? (
                          <>
                            <div className="absolute inset-0 bg-red-100 animate-pulse rounded-md"></div>
                            <span className="relative z-10 flex items-center">
                              <span className="w-4 h-4 mr-2 rounded-full bg-red-500 animate-ping"></span>
                              Stop Generation
                            </span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4 mr-2" />
                            {hasTranslationChanged ? 'Save & Remake Audio' : 'Remake Audio'}
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    {isEditingTranslation && !hasTranslationChanged && (
                      <TooltipContent>
                        <p>Edit the content first to enable audio regeneration</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(translatedText, "Translation")}
                    className="flex-1"
                    disabled={isGeneratingAudio}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => downloadText(translatedText, "Translation")}
                    disabled={isGeneratingAudio}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
