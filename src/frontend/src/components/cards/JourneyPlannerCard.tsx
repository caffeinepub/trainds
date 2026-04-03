import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Clock, Map as MapIcon, Shield } from "lucide-react";
import { useState } from "react";
import { mockTPSIData } from "../../data/mockData";
import {
  allStationNames,
  getDistanceBetweenStations,
  getLineForStation,
} from "../../data/stations";
import { getLineBadgeClass, getTPSIStatus } from "../../utils/helpers";
import { cn } from "../../utils/helpers";
import { isPeakHour, predictDelay } from "../../utils/mlPredictor";

interface JourneyPlannerCardProps {
  weather?: { rainfall: number; temperature: number } | null;
}

export default function JourneyPlannerCard({
  weather,
}: JourneyPlannerCardProps) {
  const [source, setSource] = useState("CSMT");
  const [destination, setDestination] = useState("Thane");
  const [result, setResult] = useState<{
    delay: number;
    line: string;
    tpsi: number;
    arrivalTime: string;
    recommendation: string;
  } | null>(null);

  const handlePlan = () => {
    const now = new Date();
    const line = getLineForStation(source);
    const distance = getDistanceBetweenStations(source, destination);
    const hour = now.getHours();
    const dow = now.getDay();

    const prediction = predictDelay({
      rainfall: weather?.rainfall ?? 0,
      temperature: weather?.temperature ?? 30,
      peakHour: isPeakHour(hour, dow),
      trainType: "fast",
      line,
      distance,
      timeOfDay: hour,
      dayOfWeek: dow,
    });

    const tpsiData = mockTPSIData.find((t) => t.line === line);
    const arrival = new Date(now);
    arrival.setMinutes(
      arrival.getMinutes() +
        Math.ceil(distance / 2) +
        prediction.predictedDelayMinutes,
    );
    const arrivalStr = arrival.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const recommendation =
      prediction.predictedDelayMinutes > 5
        ? "Leave 10 mins earlier"
        : "On-time departure likely";

    setResult({
      delay: prediction.predictedDelayMinutes,
      line,
      tpsi: tpsiData?.score ?? 82,
      arrivalTime: arrivalStr,
      recommendation,
    });
  };

  const tpsiStatus = result ? getTPSIStatus(result.tpsi) : null;

  return (
    <div className="card-surface p-5 h-full" data-ocid="journey_planner.card">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 border border-blue-500/25">
          <MapIcon className="h-4 w-4 text-blue-400" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">
          Journey Planner
        </h3>
      </div>

      <div className="space-y-2 mb-3">
        <Select value={source} onValueChange={setSource}>
          <SelectTrigger
            className="h-8 text-xs bg-white/5 border-white/10"
            data-ocid="journey_planner.source.select"
          >
            <SelectValue placeholder="From station" />
          </SelectTrigger>
          <SelectContent className="max-h-48">
            {allStationNames.slice(0, 30).map((s) => (
              <SelectItem key={s} value={s} className="text-xs">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-white/10" />
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <Select value={destination} onValueChange={setDestination}>
          <SelectTrigger
            className="h-8 text-xs bg-white/5 border-white/10"
            data-ocid="journey_planner.dest.select"
          >
            <SelectValue placeholder="To station" />
          </SelectTrigger>
          <SelectContent className="max-h-48">
            {allStationNames.slice(0, 30).map((s) => (
              <SelectItem key={s} value={s} className="text-xs">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        size="sm"
        className="w-full h-8 text-xs font-medium mb-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30"
        onClick={handlePlan}
        data-ocid="journey_planner.plan_button"
      >
        <MapIcon className="h-3 w-3 mr-1" />
        Plan Journey
      </Button>

      {result && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div
              className="rounded-md p-2"
              style={{ background: "oklch(1 0 0 / 4%)" }}
            >
              <div className="text-xs text-muted-foreground">
                Expected Delay
              </div>
              <div
                className={cn(
                  "text-sm font-bold",
                  result.delay < 3
                    ? "text-green-400"
                    : result.delay < 8
                      ? "text-warning"
                      : "text-danger",
                )}
              >
                {result.delay}m
              </div>
            </div>
            <div
              className="rounded-md p-2"
              style={{ background: "oklch(1 0 0 / 4%)" }}
            >
              <div className="text-xs text-muted-foreground">Arrival</div>
              <div className="text-sm font-bold text-foreground flex items-center gap-1">
                <Clock className="h-3 w-3 text-teal" />
                {result.arrivalTime}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                getLineBadgeClass(result.line),
              )}
            >
              {result.line}
            </span>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">TPSI</span>
              <span className={cn("text-xs font-bold", tpsiStatus?.color)}>
                {result.tpsi}%
              </span>
            </div>
          </div>

          <div
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs"
            style={{
              background: "oklch(0.73 0.14 186 / 10%)",
              border: "1px solid oklch(0.73 0.14 186 / 20%)",
            }}
          >
            <span className="text-teal">⭐</span>
            <span className="text-teal-bright">{result.recommendation}</span>
          </div>
        </div>
      )}
    </div>
  );
}
