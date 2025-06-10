import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Plus } from "lucide-react";

interface PremiumModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddApiKey: () => void;
}

export function PremiumModal({
  open,
  onOpenChange,
  onAddApiKey,
}: PremiumModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upgrade to Premium</DialogTitle>
          <DialogDescription>
            Choose a plan that works best for you
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="rounded-lg border p-4 space-y-4">
            <h3 className="font-semibold text-lg">Use Your Own API Key</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                <span>Unlimited conversions</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                <span>Pay only for what you use</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                <span>Full control over API usage</span>
              </li>
            </ul>
            <Button
              onClick={onAddApiKey}
              className="w-full mt-4"
            >
              Add API Key
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="rounded-lg border p-4 space-y-4 bg-gradient-to-br from-purple-50 to-blue-50">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Premium Plan</h3>
              <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                Coming Soon
              </span>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                <span>Unlimited conversions</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                <span>No API key required</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                <span>Priority support</span>
              </li>
            </ul>
            <Button
              disabled
              variant="secondary"
              className="w-full mt-4"
            >
              Coming Soon
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 