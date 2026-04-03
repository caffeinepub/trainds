import { Activity, AlertTriangle, CheckCircle } from "lucide-react";
import { cn, getNetworkStatusClass } from "../utils/helpers";

interface NetworkStatusBannerProps {
  status: string;
  reason: string;
}

export default function NetworkStatusBanner({
  status,
  reason,
}: NetworkStatusBannerProps) {
  if (status === "Normal") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg px-4 py-2 text-sm border",
          getNetworkStatusClass(status),
        )}
        data-ocid="network_status.panel"
      >
        <CheckCircle className="h-4 w-4 flex-shrink-0" />
        <span className="font-medium">Network Normal</span>
        <span className="text-xs opacity-75">— {reason}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg px-4 py-2 text-sm border",
        getNetworkStatusClass(status),
      )}
      data-ocid="network_status.panel"
    >
      {status === "Severe" ? (
        <AlertTriangle className="h-4 w-4 flex-shrink-0 animate-pulse" />
      ) : (
        <Activity className="h-4 w-4 flex-shrink-0" />
      )}
      <span className="font-medium">{status} Disruption</span>
      <span className="text-xs opacity-75">— {reason}</span>
    </div>
  );
}
