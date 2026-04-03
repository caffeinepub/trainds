import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Brain, Info, TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  allStationNames,
  getDistanceBetweenStations,
  getLineForStation,
} from "../../data/stations";
import { cn } from "../../utils/helpers";
import {
  type MLPredictionInput,
  MODEL_STATS,
  isPeakHour,
  predictDelay,
} from "../../utils/mlPredictor";

interface MLPredictionCardProps {
  weather?: { rainfall: number; temperature: number } | null;
}

export default function MLPredictionCard({ weather }: MLPredictionCardProps) {
  const now = new Date();
  const [source, setSource] = useState("Churchgate");
  const [destination, setDestination] = useState("Andheri");
  const [trainType, setTrainType] = useState<"fast" | "slow">("fast");
  const [result, setResult] = useState<ReturnType<typeof predictDelay> | null>(
    null,
  );

  const handlePredict = () => {
    const line = getLineForStation(source);
    const distance = getDistanceBetweenStations(source, destination);
    const hour = now.getHours();
    const dow = now.getDay();

    const input: MLPredictionInput = {
      rainfall: weather?.rainfall ?? 0,
      temperature: weather?.temperature ?? 30,
      peakHour: isPeakHour(hour, dow),
      trainType,
      line,
      distance,
      timeOfDay: hour,
      dayOfWeek: dow,
    };

    setResult(predictDelay(input));
  };

  const getSeverityBg = (severity?: string) => {
    if (severity === "low")
      return "bg-green-500/20 text-green-300 border-green-500/30";
    if (severity === "moderate")
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    return "bg-red-500/20 text-red-300 border-red-500/30";
  };

  const getSeverityBarWidth = (delay?: number) => {
    if (!delay) return "0%";
    return `${Math.min(100, (delay / 15) * 100)}%`;
  };

  const getSeverityBarColor = (severity?: string) => {
    if (severity === "low") return "bg-green-400";
    if (severity === "moderate") return "bg-yellow-400";
    return "bg-red-400";
  };

  return (
    <div className="card-surface p-5 h-full" data-ocid="ml_prediction.card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal/15 border border-teal/25">
            <Brain className="h-4 w-4 text-teal" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              ML Delay Prediction
            </h3>
            <p className="text-xs text-muted-foreground">
              Random Forest Engine
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs border-teal/30 text-teal">
            R² {MODEL_STATS.r2}
          </Badge>
          <Badge
            variant="outline"
            className="text-xs border-white/10 text-muted-foreground"
          >
            MAE {MODEL_STATS.mae}m
          </Badge>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">From</p>
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger
              className="h-8 text-xs bg-white/5 border-white/10"
              data-ocid="ml_prediction.source.select"
            >
              <SelectValue />
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
        <div>
          <p className="text-xs text-muted-foreground mb-1">To</p>
          <Select value={destination} onValueChange={setDestination}>
            <SelectTrigger
              className="h-8 text-xs bg-white/5 border-white/10"
              data-ocid="ml_prediction.dest.select"
            >
              <SelectValue />
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
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Select
          value={trainType}
          onValueChange={(v) => setTrainType(v as "fast" | "slow")}
        >
          <SelectTrigger
            className="flex-1 h-8 text-xs bg-white/5 border-white/10"
            data-ocid="ml_prediction.traintype.select"
          >
            <SelectValue placeholder="Train type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fast" className="text-xs">
              Fast Train
            </SelectItem>
            <SelectItem value="slow" className="text-xs">
              Slow Train
            </SelectItem>
          </SelectContent>
        </Select>
        <Button
          size="sm"
          className="flex-1 h-8 text-xs font-medium bg-teal/20 hover:bg-teal/30 text-teal border border-teal/30 hover:border-teal/50"
          onClick={handlePredict}
          data-ocid="ml_prediction.predict_button"
        >
          <TrendingUp className="h-3 w-3 mr-1" />
          Predict
        </Button>
      </div>

      {/* Result */}
      {result ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex-1 flex items-center justify-between rounded-lg px-3 py-2 border",
                getSeverityBg(result.severity),
              )}
            >
              <span className="text-xs font-medium">Predicted Delay</span>
              <span className="text-lg font-bold">
                {result.predictedDelayMinutes}m
              </span>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Confidence</div>
              <div className="text-sm font-semibold text-teal">
                {Math.round(result.confidence * 100)}%
              </div>
            </div>
          </div>

          {/* Severity bar */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Delay Severity</span>
              <span className="capitalize">{result.severity}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  getSeverityBarColor(result.severity),
                )}
                style={{
                  width: getSeverityBarWidth(result.predictedDelayMinutes),
                }}
              />
            </div>
          </div>

          {/* Explanation */}
          <div
            className="flex gap-2 rounded-md p-2"
            style={{ background: "oklch(1 0 0 / 4%)" }}
          >
            <Info className="h-3 w-3 text-teal flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {result.explanation}
            </p>
          </div>
        </div>
      ) : (
        <div
          className="rounded-lg p-4 text-center"
          style={{
            background: "oklch(1 0 0 / 3%)",
            border: "1px dashed oklch(1 0 0 / 10%)",
          }}
        >
          <Brain className="h-6 w-6 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-xs text-muted-foreground">
            Select stations and click Predict to get delay forecast
          </p>
          <p className="text-xs text-muted-foreground/50 mt-1">
            Trained on {MODEL_STATS.trainingSamples.toLocaleString()} samples
          </p>
        </div>
      )}
    </div>
  );
}
