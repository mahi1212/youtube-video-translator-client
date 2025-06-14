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
import { Loader2, CheckCircle } from "lucide-react";
import { encryptData } from "@/utils/encryption";
import { useUpdateApiKey } from "@/hooks/useUser";
import type { User } from "@/lib/api";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onApiKeyUpdate: (apiKey: string) => void;
}

export function ProfileModal({
  open,
  onOpenChange,
  user,
  onApiKeyUpdate,
}: ProfileModalProps) {
  const [apiKey, setApiKey] = useState(user.apiKey || "");
  
  const updateApiKeyMutation = useUpdateApiKey();

  const handleApiKeyUpdate = async () => {
    if (!apiKey.startsWith('sk-')) {
      toast.error('Please enter a valid OpenAI API key starting with "sk-"');
      return;
    }

    // Encrypt API key before sending
    const encryptedApiKey = encryptData(apiKey);
    
    updateApiKeyMutation.mutate(
      { apiKey: encryptedApiKey },
      {
        onSuccess: () => {
          onApiKeyUpdate(apiKey);
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[600px]">
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
            <span className="text-sm font-medium">Daily Usage</span>
            <Badge variant="outline">{user.daily_usage} / {user.usageLimit} conversions</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Usage</span>
            <Badge variant="outline">{user.total_usage} conversions</Badge>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={user.name} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user.email} disabled />
          </div>
          
          {user.is_api_key_available && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-800">
                You have already added an OpenAI API key. You can update it below if needed.
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="api-key">
              OpenAI API Key
              {user.is_api_key_available && (
                <Badge variant="outline" className="ml-2">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
            </Label>
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
                disabled={updateApiKeyMutation.isPending}
                size="sm"
              >
                {updateApiKeyMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  user.is_api_key_available ? "Update" : "Save"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {user.is_api_key_available 
                ? "Your API key allows unlimited usage. Update only if you want to change it."
                : "Add your own API key to bypass daily limits"
              }
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 