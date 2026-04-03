import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Activity, RefreshCw, Train } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import NetworkStatusBanner from "../components/NetworkStatusBanner";
import type { MockTrain } from "../data/mockData";
import { allStationNames } from "../data/stations";
import {
  useAllTrains,
  useNetworkStatus,
  useUpdateNetworkStatus,
} from "../hooks/useBackend";
import { useIsAdmin } from "../hooks/useBackend";
import {
  cn,
  getDelayLabel,
  getLineBadgeClass,
  getNetworkStatusClass,
} from "../utils/helpers";
import {
  generateTrains,
  getNetworkStatusSimulation,
} from "../utils/trainSimulator";

export default function LiveTrains() {
  const { data: isAdmin } = useIsAdmin();
  const { data: backendTrains, isLoading, refetch } = useAllTrains();
  const { data: networkStatus } = useNetworkStatus();
  const updateNetworkStatus = useUpdateNetworkStatus();
  const [simTrains, setSimTrains] = useState<MockTrain[]>([]);
  const [simStatus] = useState(getNetworkStatusSimulation());
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [_filterStation, setFilterStation] = useState<string>("all");

  useEffect(() => {
    setSimTrains(generateTrains());
    const interval = setInterval(() => {
      setSimTrains(generateTrains());
      setLastRefresh(new Date());
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  const trains =
    backendTrains && backendTrains.length > 0 ? backendTrains : simTrains;
  const status = networkStatus?.status ?? simStatus.status;
  const reason = networkStatus?.reason ?? simStatus.reason;

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await updateNetworkStatus.mutateAsync({
        status: newStatus,
        reason: `Status updated to ${newStatus} by admin`,
      });
      toast.success(`Network status updated to ${newStatus}`);
    } catch {
      toast.error("Failed to update network status");
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 page-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Live Train Tracking
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time Mumbai local train status
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-white/10 hover:bg-white/5"
          onClick={() => {
            refetch();
            setSimTrains(generateTrains());
            setLastRefresh(new Date());
          }}
          data-ocid="trains.refresh.button"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Network Status */}
      <div className="flex items-center gap-4 flex-wrap">
        <NetworkStatusBanner status={status} reason={reason} />
        <div className="text-xs text-muted-foreground">
          Last updated:{" "}
          {lastRefresh.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      {/* Admin Status Controls */}
      {isAdmin && (
        <div className="card-surface p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-teal" />
            <h3 className="text-sm font-medium text-foreground">
              Admin: Update Network Status
            </h3>
          </div>
          <div className="flex gap-2">
            {["Normal", "Moderate", "Severe"].map((s) => (
              <Button
                key={s}
                size="sm"
                variant="outline"
                className={cn("text-xs border", getNetworkStatusClass(s))}
                onClick={() => handleUpdateStatus(s)}
                data-ocid={`trains.status_${s.toLowerCase()}.button`}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select onValueChange={setFilterStation} defaultValue="all">
          <SelectTrigger
            className="w-56 bg-white/5 border-white/10"
            data-ocid="trains.station_filter.select"
          >
            <SelectValue placeholder="Filter by station" />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            <SelectItem value="all">All Stations</SelectItem>
            {allStationNames.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Trains Table */}
      <div className="card-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-muted-foreground">Train #</TableHead>
              <TableHead className="text-muted-foreground">
                Destination
              </TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Platform</TableHead>
              <TableHead className="text-muted-foreground">ETA</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && simTrains.length === 0
              ? [1, 2, 3, 4, 5].map((sk) => (
                  <TableRow key={`sk-row-${sk}`} className="border-white/5">
                    {[1, 2, 3, 4, 5, 6].map((scell) => (
                      <TableCell key={scell}>
                        <div className="h-4 rounded bg-white/10 animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : trains.map((train, idx) => (
                  <TableRow
                    key={String(train.trainNumber)}
                    className="border-white/5 hover:bg-white/5 transition-colors"
                    data-ocid={`trains.item.${idx + 1}`}
                  >
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {Number(train.trainNumber)}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {train.destination}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className="text-xs"
                        style={{
                          background:
                            train.trainType === "Fast"
                              ? "oklch(0.73 0.14 186 / 15%)"
                              : "oklch(1 0 0 / 8%)",
                          color:
                            train.trainType === "Fast"
                              ? "oklch(0.80 0.16 186)"
                              : "oklch(0.65 0.025 230)",
                          border: "none",
                        }}
                      >
                        {train.trainType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="text-muted-foreground">Pf </span>
                      <span className="font-medium text-foreground">
                        {Number(train.platform)}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {train.eta}
                    </TableCell>
                    <TableCell>
                      {train.delay > 0 ? (
                        <span
                          className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full",
                            train.delay < 5
                              ? "bg-yellow-500/15 text-yellow-300"
                              : "bg-red-500/15 text-red-300",
                          )}
                        >
                          +{getDelayLabel(train.delay)}
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/15 text-green-300">
                          On Time
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
