import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  Map as MapIcon,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { mockTPSIData } from "../data/mockData";
import {
  allStationNames,
  getDistanceBetweenStations,
  getLineForStation,
} from "../data/stations";
import {
  useJourneyHistory,
  useSaveJourney,
  useWeatherCache,
} from "../hooks/useBackend";
import {
  calculateTravelBuffer,
  cn,
  formatTimestamp,
  getBestDepartureTime,
  getLineBadgeClass,
  getTPSIStatus,
} from "../utils/helpers";
import { isPeakHour, predictDelay } from "../utils/mlPredictor";
import { getSimulatedMumbaiWeather } from "../utils/weatherSimulator";

interface JourneyResult {
  source: string;
  destination: string;
  line: string;
  delay: number;
  confidence: number;
  explanation: string;
  tpsi: number;
  arrivalTime: string;
  scheduledTime: string;
  shouldLeaveNow: boolean;
  leaveNowReason: string;
  buffer: number;
  bestTime: string;
  recommendation: string;
}

export default function JourneyPlanner() {
  const [source, setSource] = useState("Churchgate");
  const [destination, setDestination] = useState("Borivali");
  const [trainPref, setTrainPref] = useState<"fast" | "slow" | "any">("fast");
  const [result, setResult] = useState<JourneyResult | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: weatherCache } = useWeatherCache();
  const { data: journeyHistory, isLoading: historyLoading } =
    useJourneyHistory();
  const saveJourney = useSaveJourney();
  const simWeather = getSimulatedMumbaiWeather();

  const handlePlan = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const now = new Date();
    const hour = now.getHours();
    const dow = now.getDay();
    const line = getLineForStation(source);
    const distance = getDistanceBetweenStations(source, destination);
    const effectiveType = trainPref === "any" ? "fast" : trainPref;

    const rainfall = weatherCache?.rainfall ?? simWeather.rainfall;
    const temperature = weatherCache?.temperature ?? simWeather.temperature;

    const prediction = predictDelay({
      rainfall,
      temperature,
      peakHour: isPeakHour(hour, dow),
      trainType: effectiveType,
      line,
      distance,
      timeOfDay: hour,
      dayOfWeek: dow,
    });

    const tpsiData = mockTPSIData.find((t) => t.line === line);
    const travelMins = Math.ceil(distance / 2);
    const arrival = new Date();
    arrival.setMinutes(
      arrival.getMinutes() + travelMins + prediction.predictedDelayMinutes,
    );
    const scheduled = new Date();
    scheduled.setMinutes(scheduled.getMinutes() + travelMins);

    const format = (d: Date) =>
      d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

    const shouldLeave =
      prediction.predictedDelayMinutes < 5 && !isPeakHour(hour, dow);
    const buffer = calculateTravelBuffer(
      prediction.predictedDelayMinutes,
      distance,
    );
    const bestTime = getBestDepartureTime(hour);

    const reco =
      effectiveType === "fast"
        ? "Take Fast Train for quicker journey"
        : "Slow train recommended for this route";

    const r: JourneyResult = {
      source,
      destination,
      line,
      delay: prediction.predictedDelayMinutes,
      confidence: prediction.confidence,
      explanation: prediction.explanation,
      tpsi: tpsiData?.score ?? 82,
      arrivalTime: format(arrival),
      scheduledTime: format(scheduled),
      shouldLeaveNow: shouldLeave,
      leaveNowReason: shouldLeave
        ? "Low delays expected. Good time to travel."
        : "High congestion or delays detected. Consider waiting.",
      buffer,
      bestTime,
      recommendation: reco,
    };

    setResult(r);
    setLoading(false);

    // Save to backend
    try {
      await saveJourney.mutateAsync({
        source,
        destination,
        trainType: effectiveType,
        scheduledDeparture: format(new Date()),
        predictedDelay: prediction.predictedDelayMinutes,
        actualDelay: 0,
      });
    } catch {
      // Silently fail for history saving
    }
  };

  const tpsiStatus = result ? getTPSIStatus(result.tpsi) : null;

  return (
    <div className="p-4 lg:p-6 space-y-6 page-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Journey Planner</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Plan your Mumbai local train journey with ML-powered predictions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card-surface p-6 space-y-4">
          <h3 className="font-semibold text-foreground">Plan Your Journey</h3>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1.5">
                From Station
              </p>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger
                  className="bg-white/5 border-white/10"
                  data-ocid="journey.source.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {allStationNames.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-white/10" />
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1.5">To Station</p>
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger
                  className="bg-white/5 border-white/10"
                  data-ocid="journey.dest.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {allStationNames.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1.5">
                Train Preference
              </p>
              <Select
                value={trainPref}
                onValueChange={(v) =>
                  setTrainPref(v as "fast" | "slow" | "any")
                }
              >
                <SelectTrigger
                  className="bg-white/5 border-white/10"
                  data-ocid="journey.trainpref.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">Fast Train</SelectItem>
                  <SelectItem value="slow">Slow Train</SelectItem>
                  <SelectItem value="any">Any Available</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full font-semibold"
              onClick={handlePlan}
              disabled={loading}
              data-ocid="journey.plan_button"
              style={{
                background: loading
                  ? undefined
                  : "linear-gradient(135deg, oklch(0.65 0.14 186) 0%, oklch(0.75 0.16 186) 100%)",
                color: "oklch(0.12 0.025 248)",
              }}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <MapIcon className="h-4 w-4 mr-2" />
                  Plan Journey
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Result */}
        {result ? (
          <div className="card-surface p-6 space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">Journey Result</h3>
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  getLineBadgeClass(result.line),
                )}
              >
                {result.line} Line
              </span>
            </div>

            {/* Route */}
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-foreground">
                {result.source}
              </span>
              <ArrowRight className="h-4 w-4 text-teal" />
              <span className="font-medium text-foreground">
                {result.destination}
              </span>
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div
                className="rounded-xl p-3"
                style={{
                  background: "oklch(1 0 0 / 4%)",
                  border: "1px solid oklch(1 0 0 / 8%)",
                }}
              >
                <div className="text-xs text-muted-foreground mb-1">
                  Predicted Delay
                </div>
                <div
                  className={cn(
                    "text-xl font-bold",
                    result.delay < 3
                      ? "text-green-400"
                      : result.delay < 8
                        ? "text-warning"
                        : "text-danger",
                  )}
                >
                  {result.delay}m
                </div>
                <div className="text-xs text-muted-foreground">
                  {Math.round(result.confidence * 100)}% confidence
                </div>
              </div>
              <div
                className="rounded-xl p-3"
                style={{
                  background: "oklch(1 0 0 / 4%)",
                  border: "1px solid oklch(1 0 0 / 8%)",
                }}
              >
                <div className="text-xs text-muted-foreground mb-1">
                  Est. Arrival
                </div>
                <div className="text-xl font-bold text-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4 text-teal" />
                  {result.arrivalTime}
                </div>
                <div className="text-xs text-muted-foreground">
                  Scheduled: {result.scheduledTime}
                </div>
              </div>
              <div
                className="rounded-xl p-3"
                style={{
                  background: "oklch(1 0 0 / 4%)",
                  border: "1px solid oklch(1 0 0 / 8%)",
                }}
              >
                <div className="text-xs text-muted-foreground mb-1">
                  TPSI Score
                </div>
                <div className={cn("text-xl font-bold", tpsiStatus?.color)}>
                  {result.tpsi}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {tpsiStatus?.label}
                </div>
              </div>
              <div
                className="rounded-xl p-3"
                style={{
                  background: "oklch(1 0 0 / 4%)",
                  border: "1px solid oklch(1 0 0 / 8%)",
                }}
              >
                <div className="text-xs text-muted-foreground mb-1">
                  Travel Buffer
                </div>
                <div className="text-xl font-bold text-foreground">
                  {result.buffer}m
                </div>
                <div className="text-xs text-muted-foreground">recommended</div>
              </div>
            </div>

            {/* Should I leave now */}
            <div
              className={cn(
                "flex items-center gap-3 rounded-xl p-3",
                result.shouldLeaveNow
                  ? "bg-green-500/10 border border-green-500/20"
                  : "bg-yellow-500/10 border border-yellow-500/20",
              )}
            >
              {result.shouldLeaveNow ? (
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
              )}
              <div>
                <div
                  className={cn(
                    "text-sm font-medium",
                    result.shouldLeaveNow
                      ? "text-green-300"
                      : "text-yellow-300",
                  )}
                >
                  {result.shouldLeaveNow ? "Yes, leave now!" : "Wait a bit"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {result.leaveNowReason}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <Zap className="h-3.5 w-3.5 text-teal" />
                <span className="text-teal-bright">
                  {result.recommendation}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Clock className="h-3.5 w-3.5 text-teal" />
                <span className="text-muted-foreground">
                  Best time today: {result.bestTime}
                </span>
              </div>
            </div>

            {/* Explanation */}
            <div
              className="rounded-lg p-3 text-xs text-muted-foreground leading-relaxed"
              style={{
                background: "oklch(0.73 0.14 186 / 6%)",
                border: "1px solid oklch(0.73 0.14 186 / 15%)",
              }}
            >
              <span className="text-teal font-medium block mb-1">
                AI Delay Analysis:
              </span>
              {result.explanation}
            </div>
          </div>
        ) : (
          <div className="card-surface p-6 flex flex-col items-center justify-center text-center">
            <MapIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-30" />
            <h3 className="font-medium text-foreground mb-2">
              Plan your journey
            </h3>
            <p className="text-sm text-muted-foreground">
              Select source & destination and click "Plan Journey" for
              AI-powered delay predictions
            </p>
          </div>
        )}
      </div>

      {/* Journey History */}
      <div className="card-surface p-6">
        <h3 className="font-semibold text-foreground mb-4">Journey History</h3>
        {historyLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : journeyHistory && journeyHistory.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-white/5">
                <TableHead className="text-muted-foreground">Route</TableHead>
                <TableHead className="text-muted-foreground">
                  Train Type
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Predicted Delay
                </TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {journeyHistory.slice(0, 10).map((j, idx) => (
                <TableRow
                  key={j.source + j.destination + String(j.timestamp)}
                  className="border-white/5 hover:bg-white/5"
                  data-ocid={`journey.item.${idx + 1}`}
                >
                  <TableCell className="text-sm">
                    {j.source} → {j.destination}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-xs border-white/10"
                    >
                      {j.trainType}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-sm font-medium",
                      j.predictedDelay < 3
                        ? "text-green-400"
                        : j.predictedDelay < 8
                          ? "text-warning"
                          : "text-danger",
                    )}
                  >
                    {j.predictedDelay}m
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatTimestamp(j.timestamp)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div
            className="text-center py-6"
            data-ocid="journey.history.empty_state"
          >
            <p className="text-sm text-muted-foreground">
              No journey history yet. Plan your first journey above!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
