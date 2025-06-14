"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { Sidebar } from "@/components/youtube-translator/global/sidebar";
import { LoginModal } from "@/components/youtube-translator/auth/login-modal";
import { RegisterModal } from "@/components/youtube-translator/auth/register-modal";
import { ProfileModal } from "@/components/youtube-translator/profile-modal";
import { PremiumModal } from "@/components/youtube-translator/premium-modal";
import { UsageDetailsModal } from "@/components/youtube-translator/usage-details-modal";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { toast } from "sonner";
import { useUserProfile, useUserHistory, userKeys } from "@/hooks/useUser";
import { useQueryClient } from "@tanstack/react-query";
import type { User, UsageHistoryItem } from "@/lib/api";
import { Header } from "../header";

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  usageHistory: UsageHistoryItem[];
  setUsageHistory: (history: UsageHistoryItem[]) => void;
  openaiApiKey: string;
  setOpenaiApiKey: (key: string) => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  showRegisterModal: boolean;
  setShowRegisterModal: (show: boolean) => void;
  showProfileModal: boolean;
  setShowProfileModal: (show: boolean) => void;
  showPremiumModal: boolean;
  setShowPremiumModal: (show: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] =
    useState<UsageHistoryItem | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const queryClient = useQueryClient();

  // React Query hooks
  const { data: user, isLoading: isLoadingUser } = useUserProfile();
  const { data: usageHistory = [] } = useUserHistory();

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const savedCollapsedState = localStorage.getItem("sidebarCollapsed");
    if (savedCollapsedState !== null) {
      setIsSidebarCollapsed(JSON.parse(savedCollapsedState));
    }
  }, []);

  // Save collapsed state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "sidebarCollapsed",
      JSON.stringify(isSidebarCollapsed)
    );
  }, [isSidebarCollapsed]);

  // Set API key when user data changes
  useEffect(() => {
    if (user?.apiKey) {
      setOpenaiApiKey(user.apiKey);
    }
  }, [user]);

  // Close mobile sidebar when clicking outside or on route change
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      } else {
        // On mobile, always uncollapse sidebar for better UX
        setIsSidebarCollapsed(false);
      }
    };

    handleResize(); // Call once on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleAuthSuccess = (data: { token: string; user: User }) => {
    localStorage.setItem("token", data.token);
    if (data.user.apiKey) {
      setOpenaiApiKey(data.user.apiKey);
    }
    // Invalidate and refetch user data
    queryClient.invalidateQueries({ queryKey: userKeys.all });
    setIsMobileSidebarOpen(false); // Close mobile sidebar after login
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setOpenaiApiKey("");
    // Clear all user-related queries
    queryClient.removeQueries({ queryKey: userKeys.all });
    setIsMobileSidebarOpen(false); // Close mobile sidebar on logout
    toast.success("Logged out successfully");
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const contextValue: AppContextType = {
    user: user ?? null,
    setUser: () => {}, // Not needed with React Query
    usageHistory,
    setUsageHistory: () => {}, // Not needed with React Query
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
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
        <div className="flex h-full relative">
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
          <div
            className={`
            fixed lg:relative 
            inset-y-0 left-0 z-40 h-full
            transform transition-all duration-300 ease-in-out
            ${
              isMobileSidebarOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            }
            ${isSidebarCollapsed ? "lg:w-16" : "lg:w-80"}
          `}
          >
            <Sidebar
              user={user ?? null}
              usageHistory={usageHistory}
              paymentHistory={[]}
              isCollapsed={isSidebarCollapsed}
              isLoadingUser={isLoadingUser}
              onCollapseToggle={toggleSidebarCollapse}
              onLoginClick={() => {
                setShowLoginModal(true);
                setIsMobileSidebarOpen(false);
              }}
              onProfileClick={() => {
                setShowProfileModal(true);
                setIsMobileSidebarOpen(false);
              }}
              onLogout={handleLogout}
              onHistoryItemClick={(item) => {
                setSelectedHistoryItem(item);
                setShowHistoryModal(true);
                setIsMobileSidebarOpen(false);
              }}
            />
          </div>

          {/* Main Content */}
          <div
            className={`
            flex-1 h-full overflow-auto transition-all duration-300 ease-in-out
            ${isSidebarCollapsed ? "lg:ml-0" : "lg:ml-0"}
          `}
          >
            <div className="flex justify-center items-center flex-col w-full">
              <Header />
              
              <main className="w-full -mt-8">
                {children}
              </main>
            </div>
          </div>
        </div>

        {/* Modals */}
        <LoginModal
          open={showLoginModal}
          onOpenChange={setShowLoginModal}
          onSuccess={handleAuthSuccess}
          onRegisterClick={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
        />

        <RegisterModal
          open={showRegisterModal}
          onOpenChange={setShowRegisterModal}
          onSuccess={handleAuthSuccess}
          onLoginClick={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />

        {user && (
          <>
            <ProfileModal
              open={showProfileModal}
              onOpenChange={setShowProfileModal}
              user={user}
              onApiKeyUpdate={(apiKey) => {
                setOpenaiApiKey(apiKey);
              }}
            />

            <PremiumModal
              open={showPremiumModal}
              onOpenChange={setShowPremiumModal}
              onAddApiKey={() => {
                setShowPremiumModal(false);
                setShowProfileModal(true);
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
  );
}
