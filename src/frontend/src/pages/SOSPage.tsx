import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  MapPin,
  Phone,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import SOSModal from "../components/SOSModal";
import {
  useDeleteSOS,
  useMySOSReports,
  useSubmitSOS,
} from "../hooks/useBackend";
import { formatTimestamp } from "../utils/helpers";

export default function SOSPage() {
  const [sosOpen, setSosOpen] = useState(false);
  const { data: sosReports, isLoading } = useMySOSReports();
  const deleteSOS = useDeleteSOS();

  const handleDelete = async (id: bigint) => {
    try {
      await deleteSOS.mutateAsync(id);
      toast.success("SOS report deleted");
    } catch {
      toast.error("Failed to delete report");
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 page-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">SOS Emergency</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Emergency help system for Mumbai train commuters
        </p>
      </div>

      {/* Main SOS Section */}
      <div
        className="rounded-2xl p-8 text-center shadow-sos"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.24 0.08 22) 0%, oklch(0.30 0.10 27) 100%)",
          border: "1px solid oklch(0.45 0.18 27 / 50%)",
        }}
        data-ocid="sos.page"
      >
        <div
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full animate-pulse-sos"
          style={{
            background: "oklch(0.57 0.22 27 / 20%)",
            border: "3px solid oklch(0.57 0.22 27 / 50%)",
          }}
        >
          <AlertTriangle className="h-12 w-12 text-red-300" />
        </div>

        <h3 className="text-4xl font-black text-red-200 tracking-widest mb-2">
          SOS
        </h3>
        <p className="text-red-300/70 mb-2">Emergency Help System</p>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
          Tap the button below to report an emergency. Your location and message
          will be sent to railway emergency services.
        </p>

        <Button
          size="lg"
          className="px-12 py-6 text-lg font-bold"
          onClick={() => setSosOpen(true)}
          data-ocid="sos.open_modal_button"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.45 0.18 27) 0%, oklch(0.55 0.22 27) 100%)",
            border: "2px solid oklch(0.6 0.22 27 / 60%)",
            color: "white",
            boxShadow: "0 8px 32px oklch(0.57 0.22 27 / 40%)",
          }}
        >
          <AlertTriangle className="h-5 w-5 mr-2" />
          Report Emergency / Need Help
        </Button>

        <div className="mt-8 flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2 text-red-300/60">
            <Phone className="h-4 w-4" />
            <span>
              Railway Helpline: <strong className="text-red-300">182</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-red-300/60">
            <Phone className="h-4 w-4" />
            <span>
              Police: <strong className="text-red-300">100</strong>
            </span>
          </div>
        </div>
      </div>

      {/* My SOS History */}
      <div className="card-surface p-6">
        <h3 className="font-semibold text-foreground mb-4">My SOS History</h3>

        {isLoading ? (
          <div className="space-y-3" data-ocid="sos.loading_state">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 rounded-lg bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : sosReports && sosReports.length > 0 ? (
          <div className="space-y-3">
            {sosReports.map((report, idx) => (
              <div
                key={String(report.timestamp)}
                className="flex items-start gap-4 rounded-xl p-4"
                style={{
                  background: report.resolved
                    ? "oklch(0.73 0.18 145 / 5%)"
                    : "oklch(0.57 0.22 27 / 8%)",
                  border: `1px solid ${
                    report.resolved
                      ? "oklch(0.73 0.18 145 / 20%)"
                      : "oklch(0.57 0.22 27 / 25%)"
                  }`,
                }}
                data-ocid={`sos.item.${idx + 1}`}
              >
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                    report.resolved ? "bg-green-500/20" : "bg-red-500/20"
                  }`}
                >
                  {report.resolved ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge
                      className={`text-xs border ${
                        report.resolved
                          ? "bg-green-500/10 text-green-300 border-green-500/20"
                          : "bg-red-500/10 text-red-300 border-red-500/20"
                      }`}
                    >
                      {report.resolved ? "Resolved" : "Open"}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(report.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{report.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    {report.latitude.toFixed(4)}°N,{" "}
                    {report.longitude.toFixed(4)}°E
                  </p>
                  {report.response && (
                    <div
                      className="mt-2 rounded-md px-3 py-2 text-xs text-green-300"
                      style={{ background: "oklch(0.73 0.18 145 / 8%)" }}
                    >
                      <span className="font-medium">Response: </span>
                      {report.response}
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={() => handleDelete(report.timestamp)}
                  data-ocid={`sos.delete_button.${idx + 1}`}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8" data-ocid="sos.empty_state">
            <CheckCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-sm text-muted-foreground">
              No emergency reports. Stay safe!
            </p>
          </div>
        )}
      </div>

      <SOSModal open={sosOpen} onClose={() => setSosOpen(false)} />
    </div>
  );
}
