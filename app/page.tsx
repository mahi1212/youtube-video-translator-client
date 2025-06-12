"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Youtube, FileText, Video, Edit } from "lucide-react"
import { Header } from "@/components/youtube-translator/header"
import { TranslateTab } from "@/components/tabs/translate-tab"
import { BlogTab } from "@/components/tabs/blog-tab"
import { SocialTab } from "@/components/tabs/social-tab"
import { VideoTab } from "@/components/tabs/video-tab"

export default function ContentCreator() {
  const [activeTab, setActiveTab] = useState("translate")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 w-full">
      <div className="mx-auto px-4 py-8 w-full max-w-6xl" >
        <Header />  

        <Tabs defaultValue="translate" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-transparent">
            <TabsTrigger
              value="translate"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Youtube className="w-4 h-4 mr-2" />
              Translate
            </TabsTrigger>
            <TabsTrigger
              value="blog"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Edit className="w-4 h-4 mr-2" />
              Blog Post
            </TabsTrigger>
            <TabsTrigger
              value="social"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Social Posts
            </TabsTrigger>
            <TabsTrigger
              value="video"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Video className="w-4 h-4 mr-2" />
              Generate Video
            </TabsTrigger>
          </TabsList>

          <TabsContent value="translate">
            <TranslateTab />
          </TabsContent>

          <TabsContent value="blog">
            <BlogTab />
          </TabsContent>

          <TabsContent value="social">
            <SocialTab />
          </TabsContent>

          <TabsContent value="video">
            <VideoTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}   