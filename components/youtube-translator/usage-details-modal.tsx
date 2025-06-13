"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Copy, Download, Check } from "lucide-react";
import { toast } from "sonner";
import { useHistoryAudio } from "@/hooks/useUser";

interface UsageDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    _id: string;
    type: string;
    sourceText: string;
    resultText: string;
    targetLanguage?: string;
    sourceType: string;
    createdAt: string;
  } | null;
}

export function UsageDetailsModal({
  open,
  onOpenChange,
  item,
}: UsageDetailsModalProps) {
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedResult, setCopiedResult] = useState(false);

  // Fetch audio data when modal is open and item is available
  const { data: audioData, isLoading: isLoadingAudio } = useHistoryAudio(
    open && item ? item._id : null
  );

  if (!item) return null;

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
      ? `original_audio_${item.targetLanguage?.toLowerCase().replace(/\s+/g, '_')}.mp3`
      : `translated_audio_${item.targetLanguage?.toLowerCase().replace(/\s+/g, '_')}.mp3`;
    
    link.download = fileName;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(link.href);
    toast.success(`${type === "original" ? "Original" : "Translated"} audio downloaded successfully!`);
  };

  const handleCopy = async (text: string, isOriginal: boolean) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isOriginal) {
        setCopiedOriginal(true);
        setTimeout(() => setCopiedOriginal(false), 2000);
      } else {
        setCopiedResult(true);
        setTimeout(() => setCopiedResult(false), 2000);
      }
      toast.success("Copied to clipboard!");
    } catch{
      toast.error("Failed to copy text");
    }
  };

  const handleDownload = (text: string, type: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Download started!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full h-[80vh] p-0 overflow-auto">
        <div className="flex flex-col">
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
            <DialogTitle className="text-md capitalize">
              {item.type} Details - {new Date(item.createdAt).toLocaleString()}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <div className="h-fit p-2 space-y-4">
              <Tabs defaultValue="result" className="w-full cursor-pointer">
                <TabsList className="grid w-full grid-cols-2 ">
                  <TabsTrigger value="original">
                    {item.type === "transcription"
                      ? "Original Audio Content"
                      : "Original Text"}
                  </TabsTrigger>
                  <TabsTrigger value="result">
                    {item.type === "transcription"
                      ? "Transcription"
                      : `Translation (${item.targetLanguage})`}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="original">
                  <Card className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">
                        {item.type === "transcription"
                          ? "Original Audio Content"
                          : "Original Text"}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(item.sourceText, true)}
                          title="Copy to clipboard"
                        >
                          {copiedOriginal ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDownload(item.sourceText, "original")
                          }
                          title="Download as text file"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* original audio section */}
                      {isLoadingAudio ? (
                        <div className="space-y-4 mb-4">
                          <div className="w-full h-12 bg-gray-100 animate-pulse rounded-md" />
                          <div className="w-full h-8 bg-gray-100 animate-pulse rounded-md" />
                        </div>
                      ) : audioData?.initialAudioData ? (
                        <div className="space-y-4 mb-4">
                          <audio
                            controls
                            className="w-full"
                            src={`data:audio/mpeg;base64,${audioData.initialAudioData}`}
                          >
                            Your browser does not support the audio element.
                          </audio>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadAudio(audioData.initialAudioData || "", "original")}
                            className="w-full"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Original Audio
                          </Button>
                        </div>
                      ) : null}

                      <ScrollArea className="h-[55vh] w-full rounded-md border p-4">
                        <div className="whitespace-pre-wrap text-sm">
                          {item.sourceText}
                        </div>
                      </ScrollArea>
                      
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="result">
                  <Card className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">
                        {item.type === "transcription"
                          ? "Transcription"
                          : `Translation (${item.targetLanguage})`}
                      </CardTitle>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(item.resultText, false)}
                          title="Copy to clipboard"
                        >
                          {copiedResult ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDownload(item.resultText, item.type)
                          }
                          title="Download as text file"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                       {/* translated audio section */}
                       {isLoadingAudio ? (
                        <div className="space-y-4 mb-4">
                          <div className="w-full h-12 bg-gray-100 animate-pulse rounded-md" />
                          <div className="w-full h-8 bg-gray-100 animate-pulse rounded-md" />
                        </div>
                      ) : audioData?.targetAudioData ? (
                        <div className="space-y-4 mb-4">
                          <audio
                            controls
                            className="w-full"
                            src={`data:audio/mpeg;base64,${audioData.targetAudioData}`}
                          >
                            Your browser does not support the audio element.
                          </audio>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadAudio(audioData.targetAudioData || "", "translated")}
                            className="w-full"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Translated Audio
                          </Button>
                        </div>
                      ) : null}

                      <ScrollArea className="h-[55vh] w-full rounded-md border p-4">
                        <div className="whitespace-pre-wrap text-sm">
                          {item.resultText}
                        </div>
                      </ScrollArea>
                     
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
