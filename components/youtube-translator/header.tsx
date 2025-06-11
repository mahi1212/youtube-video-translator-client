import { Youtube } from "lucide-react";

export function Header() {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="p-3 bg-red-500 rounded-full">
          <Youtube className="w-6 md:w-8 h-6 md:h-8 text-white" />
        </div>
        <h1 className="text-xl md:text-4xl font-bold text-black ">
          Youtube Transcriber & Translator 
        </h1>
      </div>
      <h2 className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Transform any YouTube video to get original transcription and translation in your preferred
        language, with almost 100% accuracy using AI.
      </h2>
    </div>
  );
} 