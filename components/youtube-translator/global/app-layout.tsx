"use client"

import React, { useState, useEffect, createContext, useContext } from "react"
import { Sidebar } from "@/components/youtube-translator/global/sidebar"
import { LoginModal } from "@/components/youtube-translator/auth/login-modal"
import { RegisterModal } from "@/components/youtube-translator/auth/register-modal"
import { ProfileModal } from "@/components/youtube-translator/profile-modal"
import { PremiumModal } from "@/components/youtube-translator/premium-modal"
import { UsageDetailsModal } from "@/components/history/usage-details-modal"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  subscription: string
  usageLimit: number
  daily_usage: number
  total_usage: number
  is_api_key_available: boolean
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
  isSidebarCollapsed: boolean
  setIsSidebarCollapsed: (collapsed: boolean) => void
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const savedCollapsedState = localStorage.getItem('sidebarCollapsed')
    if (savedCollapsedState !== null) {
      setIsSidebarCollapsed(JSON.parse(savedCollapsedState))
    }
  }, [])

  // Save collapsed state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed))
  }, [isSidebarCollapsed])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      fetchUserProfile(token)
      fetchHistory(token)
    }
  }, [])

  // Close mobile sidebar when clicking outside or on route change
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false)
      } else {
        // On mobile, always uncollapse sidebar for better UX
        setIsSidebarCollapsed(false)
      }
    }

    handleResize() // Call once on mount
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
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
    setIsMobileSidebarOpen(false) // Close mobile sidebar after login
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setUser(null)
    setOpenaiApiKey("")
    setUsageHistory([])
    setIsMobileSidebarOpen(false) // Close mobile sidebar on logout
    toast.success("Logged out successfully")
  }

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
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
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    fetchUserProfile,
    fetchHistory,
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex h-screen relative">
          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="sm"
            className="fixed top-4 left-4 z-50 lg:hidden bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg"
            onClick={toggleMobileSidebar}
          >
            {isMobileSidebarOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>

          {/* Mobile Sidebar Overlay */}
          {isMobileSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div className={`
            fixed lg:relative 
            inset-y-0 left-0 z-40
            transform transition-all duration-300 ease-in-out
            ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${isSidebarCollapsed ? 'lg:w-16' : 'lg:w-80'}
          `}>
            <Sidebar
              user={user}
              usageHistory={usageHistory}
              paymentHistory={[]}
              isCollapsed={isSidebarCollapsed}
              onCollapseToggle={toggleSidebarCollapse}
              onLoginClick={() => {
                setShowLoginModal(true)
                setIsMobileSidebarOpen(false)
              }}
              onProfileClick={() => {
                setShowProfileModal(true)
                setIsMobileSidebarOpen(false)
              }}
              onLogout={handleLogout}
              onHistoryItemClick={(item) => {
                setSelectedHistoryItem(item)
                setShowHistoryModal(true)
                setIsMobileSidebarOpen(false)
              }}
            />
          </div>

          {/* Main Content */}
          <div className={`
            flex-1 overflow-auto flex justify-center items-center transition-all duration-300 ease-in-out pt-[800px] lg:pt-0
          `}>
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