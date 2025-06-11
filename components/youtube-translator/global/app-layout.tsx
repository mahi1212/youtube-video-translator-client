"use client"

import React, { useState, useEffect, createContext, useContext } from "react"
import { Sidebar } from "@/components/youtube-translator/global/sidebar"
import { LoginModal } from "@/components/youtube-translator/auth/login-modal"
import { RegisterModal } from "@/components/youtube-translator/auth/register-modal"
import { ProfileModal } from "@/components/youtube-translator/profile-modal"
import { PremiumModal } from "@/components/youtube-translator/premium-modal"
import { UsageDetailsModal } from "@/components/history/usage-details-modal"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  subscription: string
  usageLimit: number
  apiKey?: string
}

interface UsageHistoryItem {
  _id: string
  type: string
  sourceType: string
  sourceUrl?: string
  sourceText: string
  resultText: string
  targetLanguage?: string
  tokensUsed: number
  createdAt: string
}

interface AppContextType {
  user: User | null
  setUser: (user: User | null) => void
  usageHistory: UsageHistoryItem[]
  setUsageHistory: (history: UsageHistoryItem[]) => void
  openaiApiKey: string
  setOpenaiApiKey: (key: string) => void
  showLoginModal: boolean
  setShowLoginModal: (show: boolean) => void
  showRegisterModal: boolean
  setShowRegisterModal: (show: boolean) => void
  showProfileModal: boolean
  setShowProfileModal: (show: boolean) => void
  showPremiumModal: boolean
  setShowPremiumModal: (show: boolean) => void
  fetchUserProfile: (token: string) => Promise<void>
  fetchHistory: (token: string) => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [usageHistory, setUsageHistory] = useState<UsageHistoryItem[]>([])
  const [openaiApiKey, setOpenaiApiKey] = useState("")
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<UsageHistoryItem | null>(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      fetchUserProfile(token)
      fetchHistory(token)
    }
  }, [])

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch profile")
      }

      const userData = await response.json()
      setUser(userData)
      if (userData.apiKey) {
        setOpenaiApiKey(userData.apiKey)
      }
    } catch {
      localStorage.removeItem("token")
      setUser(null)
    }
  }

  const fetchHistory = async (token: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch history")
      }

      const data = await response.json()
      setUsageHistory(data)
    } catch {
      toast.error("Error fetching history")
    }
  }

  const handleAuthSuccess = (data: { token: string; user: User }) => {
    localStorage.setItem("token", data.token)
    setUser(data.user)
    if (data.user.apiKey) {
      setOpenaiApiKey(data.user.apiKey)
    }
    fetchHistory(data.token)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setUser(null)
    setOpenaiApiKey("")
    setUsageHistory([])
    toast.success("Logged out successfully")
  }

  const contextValue: AppContextType = {
    user,
    setUser,
    usageHistory,
    setUsageHistory,
    openaiApiKey,
    setOpenaiApiKey,
    showLoginModal,
    setShowLoginModal,
    showRegisterModal,
    setShowRegisterModal,
    showProfileModal,
    setShowProfileModal,
    showPremiumModal,
    setShowPremiumModal,
    fetchUserProfile,
    fetchHistory,
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex h-screen">
          <Sidebar
            user={user}
            usageHistory={usageHistory}
            paymentHistory={[]}
            onLoginClick={() => setShowLoginModal(true)}
            onProfileClick={() => setShowProfileModal(true)}
            onLogout={handleLogout}
            onHistoryItemClick={(item) => {
              setSelectedHistoryItem(item)
              setShowHistoryModal(true)
            }}
          />

          {/* Main Content */}
          <div className="flex-1 overflow-auto flex justify-center items-start">
            {children}
          </div>
        </div>

        {/* Modals */}
        <LoginModal
          open={showLoginModal}
          onOpenChange={setShowLoginModal}
          onSuccess={handleAuthSuccess}
          onRegisterClick={() => {
            setShowLoginModal(false)
            setShowRegisterModal(true)
          }}
        />

        <RegisterModal
          open={showRegisterModal}
          onOpenChange={setShowRegisterModal}
          onSuccess={handleAuthSuccess}
          onLoginClick={() => {
            setShowRegisterModal(false)
            setShowLoginModal(true)
          }}
        />

        {user && (
          <>
            <ProfileModal
              open={showProfileModal}
              onOpenChange={setShowProfileModal}
              user={user}
              onApiKeyUpdate={(apiKey) => {
                setUser({ ...user, apiKey })
                setOpenaiApiKey(apiKey)
              }}
            />

            <PremiumModal
              open={showPremiumModal}
              onOpenChange={setShowPremiumModal}
              onAddApiKey={() => {
                setShowPremiumModal(false)
                setShowProfileModal(true)
              }}
            />

            <UsageDetailsModal 
              open={showHistoryModal} 
              onOpenChange={setShowHistoryModal} 
              item={selectedHistoryItem} 
            />
          </>
        )}
      </div>
    </AppContext.Provider>
  )
}