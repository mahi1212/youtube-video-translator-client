"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
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
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  subscription: string;
  usageLimit: number;
  daily_usage: number;
  total_usage: number;
  is_api_key_available: boolean;
  apiKey?: string;
}

interface UsageHistoryItem {
  _id: string;
  type: string;
  sourceType: string;
  sourceUrl?: string;
  sourceText: string;
  resultText: string;
  targetLanguage?: string;
  tokensUsed: number;
  createdAt: string;
}

interface PaymentHistoryItem {
  _id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  subscriptionPlan: string;
  transactionId: string;
  createdAt: string;
}

interface SidebarProps {
  user: User | null;
  usageHistory: UsageHistoryItem[];
  paymentHistory?: PaymentHistoryItem[];
  isLoadingPayments?: boolean;
  isCollapsed: boolean;
  onCollapseToggle: () => void;
  onLoginClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
  onHistoryItemClick: (item: UsageHistoryItem) => void;
}

export function Sidebar({
  user,
  usageHistory,
  paymentHistory,
  isLoadingPayments,
  isCollapsed,
  onCollapseToggle,
  onLoginClick,
  onProfileClick,
  onLogout,
  onHistoryItemClick,
}: SidebarProps) {
  const getHistoryIcon = (type: string, sourceType: string) => {
    if (type === "transcription") {
      return sourceType === "youtube" ? (
        <Video className="h-4 w-4" />
      ) : (
        <FileText className="h-4 w-4" />
      );
    }
    return <Globe className="h-4 w-4" />;
  };

  const getHistoryColor = (type: string) => {
    return type === "transcription" ? "bg-blue-500" : "bg-green-500";
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div
      className={`
      ${isCollapsed ? "w-16" : "w-80 sm:w-80 md:w-80 lg:w-80"} 
      bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col h-screen shadow-xl
      transition-all duration-300 ease-in-out
    `}
    >
      {user ? (
        <>
          {/* User Profile Section */}
          <div className="p-4 sm:p-6 bg-blue-600 text-white flex-shrink-0 relative">
            {/* Desktop Collapse Button */}

            {!isCollapsed ? (
              <>
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-white/20">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-white/20 text-white font-semibold text-sm sm:text-base">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg truncate">
                      {user.name}
                    </h3>
                    <p className="text-blue-100 text-xs sm:text-sm truncate">
                      {user.email}
                    </p>
                  </div>
                  {user.subscription === "premium" && (
                    <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300" />
                  )}
                </div>

                <div className="flex items-center sm:gap-2 mb-3 sm:mb-4">
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white border-white/20 text-xs"
                  >
                    {user.daily_usage} / {user.usageLimit} credits used
                  </Badge>

                  {user.is_api_key_available && (
                    <Badge
                      variant="secondary"
                      className="bg-white/20 text-white border-white/20 text-xs"
                    >
                      API Provided
                    </Badge>
                  )}
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white border-white/20 text-xs"
                  >
                    {user.subscription === "premium" ? "Premium" : "Free"}
                  </Badge>
                </div>

                <div className="flex justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/20 text-xs sm:text-sm flex-1"
                    onClick={onProfileClick}
                  >
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden lg:flex bg-white/20 hover:bg-white/30 text-white border-white/20 p-1 h-8 w-8"
                    onClick={onCollapseToggle}
                  >
                    {isCollapsed ? (
                      <ChevronRightIcon className="h-4 w-4" />
                    ) : (
                      <ChevronLeft className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </>
            ) : (
              /* Collapsed User Section */
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="h-10 w-10 ring-2 ring-white/20">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-white/20 text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {user.subscription === "premium" && (
                  <Crown className="h-4 w-4 text-yellow-300" />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white p-1 h-8 w-8"
                  onClick={onProfileClick}
                  title="Settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {!isCollapsed ? (
            /* Full Tabs Section */
            <div className="flex-1 flex flex-col min-h-0">
              <Tabs
                defaultValue="activity"
                className="flex-1 flex flex-col min-h-0"
              >
                <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50/50 border-b border-gray-200/50 flex-shrink-0">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="activity"
                      className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                    >
                      <History className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Activity</span>
                      <span className="sm:hidden">Act</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="payments"
                      className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                    >
                      <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Payments</span>
                      <span className="sm:hidden">Pay</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Activity Tab Content */}
                <TabsContent value="activity" className="flex-1 min-h-0">
                  <ScrollArea className="h-full">
                    <div className="space-y-2 px-2 sm:px-3 py-2 pb-20">
                      {usageHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                          <MessageSquare className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mb-3 sm:mb-4" />
                          <p className="text-gray-500 font-medium text-sm sm:text-base">
                            No history yet
                          </p>
                          <p className="text-xs sm:text-sm text-gray-400">
                            Your translations will appear here
                          </p>
                        </div>
                      ) : (
                        usageHistory.map((item, index) => (
                          <div
                            key={item._id}
                            className="group relative p-3 sm:p-4 rounded-xl hover:bg-gray-50/80 cursor-pointer transition-all duration-200 hover:shadow-sm border border-transparent hover:border-gray-200/50"
                            onClick={() => onHistoryItemClick(item)}
                          >
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div
                                className={`p-1.5 sm:p-2 rounded-lg ${getHistoryColor(
                                  item.type
                                )} text-white flex-shrink-0`}
                              >
                                {getHistoryIcon(item.type, item.sourceType)}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-gray-900 capitalize text-xs sm:text-sm">
                                    {item.type}
                                  </span>
                                  <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                    {format(new Date(item.createdAt), "HH:mm")}
                                  </div>
                                </div>

                                <p className="text-xs text-gray-500 mb-1 sm:mb-2">
                                  {item.sourceType === "youtube"
                                    ? "YouTube Video"
                                    : "Text Input"}
                                  {item.targetLanguage && (
                                    <span className="ml-1">
                                      → {item.targetLanguage}
                                    </span>
                                  )}
                                </p>

                                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                  {item.resultText.substring(0, 60)}
                                  {item.resultText.length > 60 && "..."}
                                </p>
                              </div>

                              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>

                            {/* Date separator */}
                            {index === 0 ||
                            format(new Date(item.createdAt), "yyyy-MM-dd") !==
                              format(
                                new Date(usageHistory[index - 1].createdAt),
                                "yyyy-MM-dd"
                              ) ? (
                              <div className="absolute -top-5 sm:-top-6 left-3 sm:left-4 right-3 sm:right-4">
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

                {/* Payments Tab Content */}
                <TabsContent value="payments" className="flex-1 min-h-0">
                  <ScrollArea className="h-full">
                    <div className="space-y-2 px-2 sm:px-3 py-2 pb-20">
                      {isLoadingPayments ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <div
                            key={i}
                            className="p-3 sm:p-4 rounded-xl border border-gray-200/50"
                          >
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
                        <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                          <Receipt className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mb-3 sm:mb-4" />
                          <p className="text-gray-500 font-medium text-sm sm:text-base">
                            Unable to load payments
                          </p>
                          <p className="text-xs sm:text-sm text-gray-400">
                            Please try again later
                          </p>
                        </div>
                      ) : paymentHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                          <Receipt className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mb-3 sm:mb-4" />
                          <p className="text-gray-500 font-medium text-sm sm:text-base">
                            No payments yet
                          </p>
                          <p className="text-xs sm:text-sm text-gray-400">
                            Your payment history will appear here
                          </p>
                        </div>
                      ) : (
                        paymentHistory.map((payment) => (
                          <div
                            key={payment._id}
                            className="p-3 sm:p-4 rounded-xl border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className={getPaymentStatusColor(
                                    payment.status
                                  )}
                                >
                                  {payment.status}
                                </Badge>
                                <span className="font-medium text-sm">
                                  {payment.amount} {payment.currency}
                                </span>
                              </div>
                              <span className="text-xs sm:text-sm text-gray-500">
                                {format(
                                  new Date(payment.createdAt),
                                  "MMM d, yyyy"
                                )}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs sm:text-sm">
                              <span className="text-gray-600 capitalize">
                                {payment.subscriptionPlan} Plan
                              </span>
                              <span className="text-gray-500">
                                {payment.paymentMethod}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            /* Collapsed Sidebar - Icon Navigation */
            <div className="flex-1 flex flex-col pt-4 pb-16">
              <div className="flex flex-col items-center space-y-4">
              <Button
            variant="ghost"
            size="sm"
            className="hidden lg:flex  hover:bg-gray-100 p-1 h-8 w-8"
            onClick={onCollapseToggle}
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 h-10 w-10 hover:bg-gray-100"
                  onClick={() => {
                    onCollapseToggle();
                  }}
                  title="Recent Activity"
                >
                  <History className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 h-10 w-10 hover:bg-gray-100"
                  onClick={() => {
                    onCollapseToggle();
                  }}
                  title="Payment History"
                >
                  <CreditCard className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Fixed Logout Button at Bottom */}
          <div className="flex-shrink-0 p-3 sm:p-4 border-t border-gray-200/50 bg-white/90 backdrop-blur-sm">
            {!isCollapsed ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                onClick={onLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            ) : (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="p-2 h-10 w-10 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                  onClick={onLogout}
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Not logged in state */
        <div className="flex flex-col items-center justify-center h-full p-4 sm:p-6 text-center relative">
          {/* Desktop Collapse Button for logged out state */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:flex absolute top-2 right-2 hover:bg-gray-100 p-1 h-8 w-8"
            onClick={onCollapseToggle}
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>

          {!isCollapsed ? (
            <>
              <div className="p-3 sm:p-4 bg-blue-100 rounded-full mb-4 sm:mb-6">
                <UserCircle className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                Welcome!
              </h3>
              <p className="text-gray-500 mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed">
                Sign in to access your translation history and save your work
              </p>
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm sm:text-base"
                onClick={onLoginClick}
              >
                Sign In to Continue
              </Button>
            </>
          ) : (
            /* Collapsed logged out state */
            <div className="flex flex-col items-center">
              <div className="p-2 bg-blue-100 rounded-full mb-4">
                <UserCircle className="h-6 w-6 text-blue-600" />
              </div>
              <Button
                size="sm"
                className="w-10 h-10 p-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={onLoginClick}
                title="Sign In"
              >
                <UserCircle className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
