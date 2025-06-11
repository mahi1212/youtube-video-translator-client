"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import {
  UserCircle,
  History,
  LogOut,
  Settings,
  Crown,
  MessageSquare,
  Globe,
  Video,
  FileText,
  ChevronRight,
  Clock,
  CreditCard,
  Receipt,
} from "lucide-react"

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

interface PaymentHistoryItem {
  _id: string
  amount: number
  currency: string
  status: string
  paymentMethod: string
  subscriptionPlan: string
  transactionId: string
  createdAt: string
}

interface SidebarProps {
  user: User | null
  usageHistory: UsageHistoryItem[]
  paymentHistory?: PaymentHistoryItem[]
  isLoadingPayments?: boolean
  onLoginClick: () => void
  onProfileClick: () => void
  onLogout: () => void
  onHistoryItemClick: (item: UsageHistoryItem) => void
}

export function Sidebar({
  user,
  usageHistory,
  paymentHistory,
  isLoadingPayments,
  onLoginClick,
  onProfileClick,
  onLogout,
  onHistoryItemClick,
}: SidebarProps) {
  const getHistoryIcon = (type: string, sourceType: string) => {
    if (type === "transcription") {
      return sourceType === "youtube" ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />
    }
    return <Globe className="h-4 w-4" />
  }

  const getHistoryColor = (type: string) => {
    return type === "transcription" ? "bg-blue-500" : "bg-green-500"
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100"
      case "pending":
        return "text-yellow-600 bg-yellow-100"
      case "failed":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <div className="w-80 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col h-screen shadow-xl">
      {user ? (
        <>
          {/* User Profile Section */}
          <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex-shrink-0">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-12 w-12 ring-2 ring-white/20">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-white/20 text-white font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{user.name}</h3>
                <p className="text-blue-100 text-sm truncate">{user.email}</p>
              </div>
              {user.subscription === "premium" && <Crown className="h-5 w-5 text-yellow-300" />}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/20">
                {user.subscription === "premium" ? "Premium" : "Free"}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/20">
                {user.usageLimit} tokens
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                onClick={onLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 bg-white/20 hover:bg-white/30 text-white border-white/20"
                onClick={onProfileClick}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="activity" className="flex-1 flex flex-col min-h-0">
            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-200/50 flex-shrink-0">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="activity" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Activity
                </TabsTrigger>
                <TabsTrigger value="payments" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payments
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="activity" className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="space-y-2 px-3 py-2">
                  {usageHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium">No history yet</p>
                      <p className="text-sm text-gray-400">Your translations will appear here</p>
                    </div>
                  ) : (
                    usageHistory.map((item, index) => (
                      <div
                        key={item._id}
                        className="group relative p-4 rounded-xl hover:bg-gray-50/80 cursor-pointer transition-all duration-200 hover:shadow-sm border border-transparent hover:border-gray-200/50"
                        onClick={() => onHistoryItemClick(item)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${getHistoryColor(item.type)} text-white flex-shrink-0`}>
                            {getHistoryIcon(item.type, item.sourceType)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900 capitalize text-sm">{item.type}</span>
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Clock className="h-3 w-3" />
                                {format(new Date(item.createdAt), "HH:mm")}
                              </div>
                            </div>

                            <p className="text-xs text-gray-500 mb-2">
                              {item.sourceType === "youtube" ? "YouTube Video" : "Text Input"}
                              {item.targetLanguage && <span className="ml-1">→ {item.targetLanguage}</span>}
                            </p>

                            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                              {item.resultText.substring(0, 80)}
                              {item.resultText.length > 80 && "..."}
                            </p>
                          </div>

                          <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </div>

                        {/* Date separator */}
                        {index === 0 ||
                        format(new Date(item.createdAt), "yyyy-MM-dd") !==
                          format(new Date(usageHistory[index - 1].createdAt), "yyyy-MM-dd") ? (
                          <div className="absolute -top-6 left-4 right-4">
                            <div className="flex items-center gap-2">
                              <div className="h-px bg-gray-200 flex-1" />
                              <span className="text-xs text-gray-400 bg-white px-2">
                                {format(new Date(item.createdAt), "MMM d")}
                              </span>
                              <div className="h-px bg-gray-200 flex-1" />
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="payments" className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="space-y-2 px-3 py-2">
                  {isLoadingPayments ? (
                    // Skeleton loader for payments
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-4 rounded-xl border border-gray-200/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-20" />
                          </div>
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                    ))
                  ) : !paymentHistory ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Receipt className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium">Unable to load payments</p>
                      <p className="text-sm text-gray-400">Please try again later</p>
                    </div>
                  ) : paymentHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Receipt className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium">No payments yet</p>
                      <p className="text-sm text-gray-400">Your payment history will appear here</p>
                    </div>
                  ) : (
                    paymentHistory.map((payment) => (
                      <div
                        key={payment._id}
                        className="p-4 rounded-xl border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={getPaymentStatusColor(payment.status)}>
                              {payment.status}
                            </Badge>
                            <span className="font-medium">
                              {payment.amount} {payment.currency}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">    
                            {format(new Date(payment.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 capitalize">{payment.subscriptionPlan} Plan</span>
                          <span className="text-gray-500">{payment.paymentMethod}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="p-4 bg-blue-100 rounded-full mb-6">
            <UserCircle className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Welcome!</h3>
          <p className="text-gray-500 mb-6 text-sm leading-relaxed">
            Sign in to access your translation history and save your work
          </p>
          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={onLoginClick}
          >
            Sign In to Continue
          </Button>
        </div>
      )}
    </div>
  )
}