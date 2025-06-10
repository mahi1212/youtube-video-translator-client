import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  openaiApiKey: string;
  setOpenaiApiKey: (key: string) => void;
  onSubmit: () => void;
}

export function AuthDialog({
  open,
  onOpenChange,
  openaiApiKey,
  setOpenaiApiKey,
  onSubmit,
}: AuthDialogProps) {

  const handleApiKeySubmit = () => {

    onSubmit();

    // if (openaiApiKey.startsWith("sk-") && openaiApiKey.length > 20) {
    //   onSubmit();
    // } else {
    //   toast.error("Please enter a valid OpenAI API key");
    // }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Authentication Required</DialogTitle>
          <DialogDescription>
            Please either provide your OpenAI API key or login to access the
            translation functionality.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">OpenAI API Key</Label>
            <Input
              id="api-key"
              placeholder="sk-..."
              value={openaiApiKey}
              onChange={(e) => setOpenaiApiKey(e.target.value)}
              type="password"
            />
            <p className="text-sm text-muted-foreground">
              Your API key will be used only for this session and won&apos;t be
              stored.
            </p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              toast.info("Login functionality coming soon!");
            }}
          >
            Login to Access
          </Button>
        </div>
        <DialogFooter>
          <Button
             onClick={handleApiKeySubmit} 
            //  disabled={!openaiApiKey}
          >
            Continue with API Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 