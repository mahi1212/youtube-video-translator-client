"use client";

import { useState } from "react";
import { InputForm } from "@/components/youtube-translator/input-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAppContext } from "@/components/youtube-translator/global/app-layout";

export function BlogTab() {
  const { user, openaiApiKey, setOpenaiApiKey, setShowLoginModal } =
    useAppContext();

  const [videoUrl, setVideoUrl] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState("");

  // Blog specific options
  const [prompt, setPrompt] = useState("");
  const [blogStyle, setBlogStyle] = useState("");
  const [blogLength, setBlogLength] = useState("");
  const [includeImages, setIncludeImages] = useState(false);
  const [imageCount, setImageCount] = useState(1);

  // Results
  const [blogContent, setBlogContent] = useState("");

  const handleProcess = async () => {
    if (!videoUrl) {
      toast.error("Please provide a YouTube URL.");
      return;
    }

    if (!user) {
      toast.error("Please log in to continue.");
      setShowLoginModal(true);
      return;
    }

    if (!user.is_api_key_available && !openaiApiKey) {
      toast.error("Please provide your OpenAI API key.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setBlogContent("");

    try {
      await simulateBlogGeneration();
      toast.success("Blog post generated successfully!");
    } catch {
      toast.error("An error occurred during processing. Please try again.");
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  const simulateBlogGeneration = async () => {
    setCurrentStage("Downloading video");
    await simulateProgress(0, 20);

    setCurrentStage("Transcribing audio");
    await simulateProgress(20, 40);

    setCurrentStage("Analyzing content");
    await simulateProgress(40, 60);

    if (includeImages) {
      setCurrentStage(
        `Generating ${imageCount} image${imageCount > 1 ? "s" : ""}`
      );
      await simulateProgress(60, 80);
    }

    setCurrentStage("Generating blog post");
    await simulateProgress(includeImages ? 80 : 60, 100);

    setBlogContent(`
      <h1>Breaking Language Barriers: My Unexpected English Lesson on a Train to London</h1>
      
      <p><em>Sometimes the best learning experiences happen when we least expect them. Here's how a simple train journey became a powerful reminder of the importance of stepping out of our comfort zones.</em></p>
      
      ${
        includeImages
          ? '<img src="/placeholder.svg?height=400&width=600" alt="Train journey to London" class="w-full rounded-lg my-6" />'
          : ""
      }
      
      <h2>The Journey Begins</h2>
      
      <p>It was a beautiful summer day when I boarded the train to London. The sun was streaming through the windows, and I was looking forward to what the day would bring. Little did I know that this journey would become one of my most memorable language learning experiences.</p>
      
      <p>As I settled into my seat, I noticed two women sitting opposite me. They were engaged in animated conversation, speaking in fluent English. As someone who was still learning the language, I found myself both intimidated and curious about their discussion.</p>
      
      <h2>Taking the Leap</h2>
      
      <p>Despite my limited vocabulary and beginner-level skills, I made a decision that would change the course of my journey. I decided to <strong>step out of my comfort zone</strong> and attempt to join their conversation.</p>
      
      ${
        includeImages && imageCount > 1
          ? '<img src="/placeholder.svg?height=300&width=500" alt="People talking on train" class="w-full rounded-lg my-6" />'
          : ""
      }
      
      <blockquote>
        <p>"The biggest barrier to learning a new language isn't grammar or vocabulary—it's the fear of making mistakes."</p>
      </blockquote>
      
      <p>Using my basic English, I started to speak with the women. To my surprise and delight, they were incredibly patient and understanding. They could see what I was trying to communicate, even when my words weren't perfect.</p>
      
      <h2>The Power of Human Connection</h2>
      
      <p>What happened next was truly remarkable. These two strangers became instant mentors and friends. When I expressed my desire to improve my English, they shared their own stories and experiences. It turned out they were returning home from a conference in England.</p>
      
      <p>The conversation lasted about ten minutes, but its impact was immeasurable. Before we parted ways at my station, they did something that touched my heart—they gave me their contact information and invited me to visit them in England.</p>
      
      <h2>Key Takeaways for Language Learners</h2>
      
      <ul>
        <li><strong>Don't let perfectionism hold you back</strong> - You don't need to be fluent to start conversations</li>
        <li><strong>Most people are more understanding than you think</strong> - Native speakers often appreciate the effort you're making</li>
        <li><strong>Real-world practice is invaluable</strong> - No textbook can replace genuine human interaction</li>
        <li><strong>Every conversation is progress</strong> - Even brief exchanges can boost your confidence significantly</li>
      </ul>
      
      <h2>The Lasting Impact</h2>
      
      <p>That encounter on the train to London changed my approach to language learning forever. Since that day, I've made it a point to practice English every single day. The confidence I gained from that one conversation has opened doors I never thought possible.</p>
      
      <p>The lesson here isn't just about language learning—it's about the power of human kindness and the importance of taking chances. Sometimes, the most meaningful connections happen when we're brave enough to be vulnerable and authentic.</p>
      
      ${
        includeImages && imageCount > 2
          ? '<img src="/placeholder.svg?height=350&width=550" alt="Language learning success" class="w-full rounded-lg my-6" />'
          : ""
      }
      
      <h2>Your Turn</h2>
      
      <p>Have you ever had a similar experience while learning a new language? I'd love to hear your stories in the comments below. Remember, every expert was once a beginner, and every conversation is a step forward on your language learning journey.</p>
      
      <p><em>What language learning challenge will you take on today?</em></p>
    `);
  };

  const simulateProgress = async (start: number, end: number) => {
    const duration = 1000;
    const steps = 10;
    const increment = (end - start) / steps;

    for (let i = 0; i <= steps; i++) {
      setProgress(Math.min(start + increment * i, end));
      await new Promise((resolve) => setTimeout(resolve, duration / steps));
    }
  };

  return (
    <div>
      <div className="space-y-6 grid grid-cols-12 gap-4">
        {/* Basic Input Form */}
        <div className="col-span-12 md:col-span-6">
          <InputForm
            videoUrl={videoUrl}
            setVideoUrl={setVideoUrl}
            targetLanguage={targetLanguage}
            setTargetLanguage={setTargetLanguage}
            openaiApiKey={openaiApiKey}
            setOpenaiApiKey={setOpenaiApiKey}
            isProcessing={isProcessing}
            progress={progress}
            currentStage={currentStage}
            onProcess={handleProcess}
            showApiKeyInput={true}
            hasStoredApiKey={user?.is_api_key_available || false}
          />
        </div>
        {/* Blog Generation Options */}
        <div className="col-span-12 md:col-span-6">
          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Blog Post Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="blog-prompt">
                  Blog Instructions (Optional)
                </Label>
                <Textarea
                  id="blog-prompt"
                  placeholder="E.g., 'Write a personal story format' or 'Focus on actionable tips and insights'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="h-36"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 w-full ">
                  <Label htmlFor="blog-style">Writing Style</Label>
                  <Select value={blogStyle} onValueChange={setBlogStyle}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal Story</SelectItem>
                      <SelectItem value="tutorial">How-to Tutorial</SelectItem>
                      <SelectItem value="listicle">List Article</SelectItem>
                      <SelectItem value="opinion">Opinion Piece</SelectItem>
                      <SelectItem value="news">News Article</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blog-length">Article Length</Label>
                  <Select value={blogLength} onValueChange={setBlogLength}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">
                        Short (500-800 words)
                      </SelectItem>
                      <SelectItem value="medium">
                        Medium (800-1500 words)
                      </SelectItem>
                      <SelectItem value="long">Long (1500+ words)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-images"
                    checked={includeImages}
                    onCheckedChange={setIncludeImages}
                  />
                  <Label htmlFor="include-images">
                    Include generated images
                  </Label>
                </div>

                {includeImages && (
                  <div className="space-y-2">
                    <Label htmlFor="image-count">Number of images</Label>
                    <Select
                      value={imageCount.toString()}
                      onValueChange={(value) => setImageCount(parseInt(value))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 image</SelectItem>
                        <SelectItem value="2">2 images</SelectItem>
                        <SelectItem value="3">3 images</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Results */}
      {blogContent && (
        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Generated Blog Post</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: blogContent }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
