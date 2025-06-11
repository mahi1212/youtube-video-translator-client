"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { UsageDetailsModal } from "@/components/history/usage-details-modal";

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

export default function HistoryPage() {
  const router = useRouter();
  const [usageHistory, setUsageHistory] = useState<UsageHistoryItem[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState("usage");
  const [selectedItem, setSelectedItem] = useState<UsageHistoryItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    const fetchHistory = async () => {
      try {
        const [usageResponse, paymentResponse] = await Promise.all([
          fetch("http://localhost:5000/api/history", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("http://localhost:5000/api/payments", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!usageResponse.ok || !paymentResponse.ok) {
          throw new Error("Failed to fetch history");
        }

        const usageData = await usageResponse.json();
        const paymentData = await paymentResponse.json();

        setUsageHistory(usageData);
        setPaymentHistory(paymentData);
      } catch {
        toast.error("Error fetching history");
      }
    };

    fetchHistory();
  }, [router]);

  const handleItemClick = (item: UsageHistoryItem) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push("/")}
      >
        ← Back to Home
      </Button>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="usage">Usage History</TabsTrigger>
              <TabsTrigger value="payments">Payment History</TabsTrigger>
            </TabsList>

            <TabsContent value="usage">
              <Table>
                <TableCaption>Your recent usage history</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Target Language</TableHead>
                    <TableHead>Tokens Used</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usageHistory.map((item) => (
                    <TableRow key={item._id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        {item.sourceUrl ? (
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.sourceType}
                          </a>
                        ) : (
                          item.sourceType
                        )}
                      </TableCell>
                      <TableCell className="capitalize">{item.type}</TableCell>
                      <TableCell>
                        {format(new Date(item.createdAt), "PPp")}
                      </TableCell>
                      
                      <TableCell>{item.targetLanguage || "-"}</TableCell>
                      <TableCell>{item.tokensUsed}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleItemClick(item)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="payments">
              <Table>
                <TableCaption>Your payment history</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Payment Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        {format(new Date(item.createdAt), "PPp")}
                      </TableCell>
                      <TableCell>
                        {item.amount} {item.currency}
                      </TableCell>
                      <TableCell className="capitalize">{item.status}</TableCell>
                      <TableCell className="capitalize">
                        {item.subscriptionPlan}
                      </TableCell>
                      <TableCell>{item.paymentMethod}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <UsageDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        item={selectedItem}
      />
    </div>
  );
} 