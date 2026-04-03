import { Clock, RefreshCw, Train } from "lucide-react";
import { useEffect, useState } from "react";
import type { MockTrain } from "../../data/mockData";
import { useAllTrains, useNetworkStatus } from "../../hooks/useBackend";
import { cn, getDelayLabel } from "../../utils/helpers";
import {
  generateTrains,
  getNetworkStatusSimulation,
} from "../../utils/trainSimulator";
import NetworkStatusBanner from "../NetworkStatusBanner";

export default function LiveTrainsCard() {
  const { data: backendTrains, isLoading: trainsLoading } = useAllTrains();
  const { data: networkStatus } = useNetworkStatus();
  const [simulatedTrains, setSimulatedTrains] = useState<MockTrain[]>([]);
  const [simStatus, setSimStatus] = useState({
    status: "Normal",
    reason: "All lines operating normally",
  });

  useEffect(() => {
    setSimulatedTrains(generateTrains());
    setSimStatus(getNetworkStatusSimulation());

    const interval = setInterval(() => {
      setSimulatedTrains(generateTrains());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const trains =
    backendTrains && backendTrains.length > 0 ? backendTrains : simulatedTrains;
  const status = networkStatus?.status ?? simStatus.status;
  const reason = networkStatus?.reason ?? simStatus.reason;

  const displayTrains = trains.slice(0, 5);

  return (
    <div className="card-surface p-5 h-full" data-ocid="live_trains.card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/15 border border-orange-500/25">
            <Train className="h-4 w-4 text-orange-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Live Train Tracking
            </h3>
            <p className="text-xs text-muted-foreground">Next departures</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <RefreshCw className="h-3 w-3" />
          <span>30s</span>
        </div>
      </div>

      <div className="mb-3">
        <NetworkStatusBanner status={status} reason={reason} />
      </div>

      {trainsLoading && simulatedTrains.length === 0 ? (
        <div className="space-y-2" data-ocid="live_trains.loading_state">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-1.5">
          {displayTrains.map((train, idx) => (
            <div
              key={String(train.trainNumber)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5 transition-colors"
              style={{ border: "1px solid oklch(1 0 0 / 5%)" }}
              data-ocid={`live_trains.item.${idx + 1}`}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/5 text-xs font-mono font-medium text-muted-foreground flex-shrink-0">
                {Number(train.platform)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground truncate">
                  {train.destination}
                </div>
                <div className="text-xs text-muted-foreground">
                  #{Number(train.trainNumber)} · {train.trainType}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 text-xs font-medium text-foreground">
                  <Clock className="h-3 w-3 text-teal" />
                  {train.eta}
                </div>
                {train.delay > 0 ? (
                  <span
                    className={cn(
                      "text-xs",
                      train.delay < 5 ? "text-warning" : "text-danger",
                    )}
                  >
                    +{getDelayLabel(train.delay)}
                  </span>
                ) : (
                  <span className="text-xs text-green-400">On time</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
