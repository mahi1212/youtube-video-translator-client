"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Youtube, FileText, Video, Edit } from "lucide-react"
import { TranslateTab } from "@/components/tabs/translate-tab"
import { BlogTab } from "@/components/tabs/blog-tab"
import { SocialTab } from "@/components/tabs/social-tab"
import { VideoTab } from "@/components/tabs/video-tab"

export default function ContentCreator() {
  const [activeTab, setActiveTab] = useState("translate")

  return (
    <div className="min-h-[calc(100vh-200px)] w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-10 px-4 pb-10">
      <Tabs defaultValue="translate" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-4 h-16 bg-white/100 backdrop-blur-xl border border-white/20 rounded-xl">
            <TabsTrigger
              value="translate"
              className="relative px-6 py-4 rounded-xl font-medium text-base transition-[transform,background-color,box-shadow] duration-300 ease-in-out -mt-1
                         data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-400 data-[state=active]:to-blue-600 
                         data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105
                         bg-white cursor-pointer 
                         data-[state=inactive]:hover:scale-[1.02] transform"
            >
              <Youtube className="w-5 h-5 mr-2" />
              Voice Agent 
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-8 bg-gray-300/50 md:block hidden" />
            </TabsTrigger>
            
            {/* <TabsTrigger
              value="blog"
              className="relative px-6 py-4 rounded-xl font-medium text-base transition-[transform,background-color,box-shadow] duration-300 ease-in-out -mt-1
                         data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-400 data-[state=active]:to-blue-600 
                         data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105
                         bg-white cursor-pointer 
                         data-[state=inactive]:hover:scale-[1.02] transform"
            >
              <Edit className="w-5 h-5 mr-2" />
              Blog Post
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-8 bg-gray-300/50 md:block hidden" />
            </TabsTrigger> */}
            
            <TabsTrigger
              value="social"
              className="relative px-6 py-4 rounded-xl font-medium text-base transition-[transform,background-color,box-shadow] duration-300 ease-in-out -mt-1
                         data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-400 data-[state=active]:to-blue-600 
                         data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105
                         bg-white cursor-pointer 
                         data-[state=inactive]:hover:scale-[1.02] transform"
            >
              <FileText className="w-5 h-5 mr-2" />
              Social Posts
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-8 bg-gray-300/50 md:block hidden" />
            </TabsTrigger>
            
            <TabsTrigger
              value="video"
              className="relative px-6 py-4 rounded-xl font-medium text-base transition-[transform,background-color,box-shadow] duration-300 ease-in-out -mt-1
                         data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-400 data-[state=active]:to-blue-600 
                         data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105
                         bg-white cursor-pointer 
                         data-[state=inactive]:hover:scale-[1.02] transform"
            >
              <Video className="w-5 h-5 mr-2" />
              Generate Video
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent 
              value="translate" 
              className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500"
            >
              <TranslateTab />
            </TabsContent>

            <TabsContent 
              value="blog" 
              className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500"
            >
              <BlogTab />
            </TabsContent>

            <TabsContent 
              value="social" 
              className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500"
            >
              <SocialTab />
            </TabsContent>

            <TabsContent 
              value="video" 
              className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500"
            >
              <VideoTab />
            </TabsContent>
          </div>
        </Tabs>
    </div>
  )
}   