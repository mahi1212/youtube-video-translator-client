"use client";

import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <div className="flex items-center justify-between gap-3 mb-4 w-full p-2 
    bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex flex-col items-start justify-center">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600  bg-clip-text text-transparent">
          ContentCraze AI
        </h1>
        <p className="text-sm text-gray-500 flex items-center gap-2 ">
        <Sparkles className="w-4 h-4 text-black" />
          
          Transform YouTube videos into various content formats with AI-powered
          tools
        </p>
      </div>
      {/* right side */}
      
    </div>
  );
}
