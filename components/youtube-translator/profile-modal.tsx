import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { encryptData } from "@/utils/encryption";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    name: string;
    email: string;
    subscription: string;
    usageLimit: number;
    apiKey?: string;
  };
  onApiKeyUpdate: (apiKey: string) => void;
}

export function ProfileModal({
  open,
  onOpenChange,
  user,
  onApiKeyUpdate,
}: ProfileModalProps) {
  const [apiKey, setApiKey] = useState(user.apiKey || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleApiKeyUpdate = async () => {
    if (!apiKey.startsWith('sk-')) {
      toast.error('Please enter a valid OpenAI API key starting with "sk-"');
      return;
    }

    setIsUpdating(true);
    try {
      // Encrypt API key before sending
      const encryptedApiKey = encryptData(apiKey);
      
      const response = await fetch("http://localhost:5000/api/update-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ apiKey: encryptedApiKey }),
      });

      if (!response.ok) {
        throw new Error("Failed to update API key");
      }

      onApiKeyUpdate(apiKey);
      toast.success("API key updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update API key');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
          <DialogDescription>
            View and manage your account settings
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Subscription</span>
            <Badge
              variant={user.subscription === "premium" ? "default" : "secondary"}
            >
              {user.subscription.charAt(0).toUpperCase() +
                user.subscription.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Daily Usage Limit</span>
            <Badge variant="outline">{user.usageLimit} conversions</Badge>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={user.name} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user.email} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="api-key">OpenAI API Key</Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
              />
              <Button
                onClick={handleApiKeyUpdate}
                disabled={isUpdating}
                size="sm"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Add your own API key to bypass daily limits
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 