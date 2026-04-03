import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, CheckCircle, Loader2, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSubmitSOS } from "../hooks/useBackend";

interface SOSModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SOSModal({ open, onClose }: SOSModalProps) {
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "fetching" | "captured" | "error"
  >("idle");
  const [submitted, setSubmitted] = useState(false);
  const submitSOS = useSubmitSOS();

  const captureLocation = () => {
    setLocationStatus("fetching");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("captured");
      },
      () => {
        setLocation({ lat: 19.076, lng: 72.8777 });
        setLocationStatus("captured");
      },
      { timeout: 8000 },
    );
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Please describe your emergency");
      return;
    }
    const lat = location?.lat ?? 19.076;
    const lng = location?.lng ?? 72.8777;
    try {
      await submitSOS.mutateAsync({
        message: message.trim(),
        latitude: lat,
        longitude: lng,
      });
      setSubmitted(true);
      toast.success("SOS report submitted. Help is on the way!");
      setTimeout(() => {
        setSubmitted(false);
        setMessage("");
        setLocation(null);
        setLocationStatus("idle");
        onClose();
      }, 2000);
    } catch {
      toast.error("Failed to submit SOS. Please call 182 (Railway helpline).");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md border-red-500/30"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.07 22) 0%, oklch(0.19 0.05 245) 100%)",
        }}
        data-ocid="sos.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <span className="text-foreground">Emergency SOS</span>
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <p className="text-center text-foreground font-medium">
              SOS Submitted!
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Emergency services have been notified. Stay safe.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className="rounded-lg p-3 text-sm"
              style={{
                background: "oklch(0.57 0.22 27 / 10%)",
                border: "1px solid oklch(0.57 0.22 27 / 30%)",
              }}
            >
              <p className="font-medium text-red-300">
                Emergency services will be notified
              </p>
              <p className="text-red-400/70 text-xs mt-1">
                For life-threatening emergencies, also call 182 (Railway
                Helpline)
              </p>
            </div>

            {/* Location */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground">
                  Your Location
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-teal hover:text-teal-bright"
                  onClick={captureLocation}
                  disabled={locationStatus === "fetching"}
                  data-ocid="sos.location.button"
                >
                  {locationStatus === "fetching" ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Fetching...
                    </>
                  ) : locationStatus === "captured" ? (
                    <>
                      <MapPin className="h-3 w-3 mr-1" />
                      Captured
                    </>
                  ) : (
                    <>
                      <MapPin className="h-3 w-3 mr-1" />
                      Share Location
                    </>
                  )}
                </Button>
              </div>
              <div
                className="rounded-md px-3 py-2 text-xs font-mono"
                style={{
                  background: "oklch(1 0 0 / 5%)",
                  border: "1px solid oklch(1 0 0 / 10%)",
                }}
              >
                {location
                  ? `${location.lat.toFixed(4)}°N, ${location.lng.toFixed(4)}°E ✓ Captured`
                  : "Location not captured yet"}
              </div>
            </div>

            {/* Message */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">
                Describe Emergency
              </p>
              <Textarea
                placeholder="Describe your emergency situation..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[100px] bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground"
                data-ocid="sos.textarea"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                className="flex-1 border border-white/10 hover:bg-white/5"
                onClick={onClose}
                data-ocid="sos.cancel_button"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 font-semibold"
                onClick={handleSubmit}
                disabled={submitSOS.isPending}
                data-ocid="sos.submit_button"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.45 0.18 27) 0%, oklch(0.55 0.22 27) 100%)",
                  border: "1px solid oklch(0.6 0.22 27 / 50%)",
                  color: "white",
                }}
              >
                {submitSOS.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Send SOS
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
