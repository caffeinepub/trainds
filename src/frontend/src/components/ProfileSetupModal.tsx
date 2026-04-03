import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Train } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveUserProfile } from "../hooks/useBackend";

interface ProfileSetupModalProps {
  open: boolean;
}

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const saveProfile = useSaveUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Please enter your name");
      return;
    }
    try {
      await saveProfile.mutateAsync({
        username: username.trim(),
        email: email.trim(),
      });
      toast.success("Profile created! Welcome to Trainds.");
    } catch {
      toast.error("Failed to create profile. Please try again.");
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-md"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.19 0.03 245) 0%, oklch(0.16 0.025 248) 100%)",
          border: "1px solid oklch(1 0 0 / 10%)",
        }}
        data-ocid="profile_setup.dialog"
      >
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal/20 border border-teal/30">
              <Train className="h-7 w-7 text-teal" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-foreground">
            Welcome to Trainds
          </DialogTitle>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Set up your profile to get personalized commute alerts and
            recommendations
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-foreground">
              Your Name
            </Label>
            <Input
              id="username"
              placeholder="e.g., Priya Sharma"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground"
              data-ocid="profile_setup.username.input"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email (optional)
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground"
              data-ocid="profile_setup.email.input"
            />
          </div>
          <Button
            type="submit"
            className="w-full font-semibold mt-6"
            disabled={saveProfile.isPending}
            data-ocid="profile_setup.submit_button"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.14 186) 0%, oklch(0.75 0.16 186) 100%)",
              color: "oklch(0.12 0.025 248)",
            }}
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              "Get Started"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
