import { Youtube, FileText, Languages } from "lucide-react";
import { Card } from "@/components/ui/card";

export function Features() {
  return (
    <div className="mt-12 grid md:grid-cols-3 gap-6">
      <Card className="text-center p-6 border-0 bg-white/60 backdrop-blur">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Youtube className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="font-semibold mb-2">YouTube Integration</h3>
        <p className="text-sm text-muted-foreground">
          Direct integration with YouTube for seamless video processing
        </p>
      </Card>

      <Card className="text-center p-6 border-0 bg-white/60 backdrop-blur">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-6 h-6 text-blue-500" />
        </div>
        <h3 className="font-semibold mb-2">AI Transcription</h3>
        <p className="text-sm text-muted-foreground">
          Advanced AI technology for accurate speech-to-text conversion
        </p>
      </Card>

      <Card className="text-center p-6 border-0 bg-white/60 backdrop-blur">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Languages className="w-6 h-6 text-purple-500" />
        </div>
        <h3 className="font-semibold mb-2">Multi-Language</h3>
        <p className="text-sm text-muted-foreground">
          Support for 50+ languages with high-quality translations
        </p>
      </Card>
    </div>
  );
} 