import React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { AppLayout } from "@/components/youtube-translator/global/app-layout"
import { QueryProvider } from "@/providers/query-provider"
import { AuthProvider } from "@/providers/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "YouTube Translator - AI-Powered Video Transcription & Translation",
  description: "Transform any YouTube video into text and translate it to your preferred language with AI-powered accuracy",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <AppLayout>
              {children}
            </AppLayout>
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}