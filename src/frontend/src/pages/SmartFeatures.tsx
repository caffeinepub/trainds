import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Bell,
  Brain,
  CheckCircle,
  Clock,
  Loader2,
  Trash2,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  allStationNames,
  getDistanceBetweenStations,
  getLineForStation,
} from "../data/stations";
import {
  useDeleteCommuteAlert,
  useSaveCommuteAlert,
  useWeatherCache,
} from "../hooks/useBackend";
import {
  calculateTravelBuffer,
  cn,
  getBestDepartureTime,
} from "../utils/helpers";
import { isPeakHour, predictDelay } from "../utils/mlPredictor";
import { getSimulatedMumbaiWeather } from "../utils/weatherSimulator";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface SavedAlert {
  id: string;
  source: string;
  destination: string;
  departureTime: string;
  days: string[];
}

export default function SmartFeatures() {
  const { data: weatherCache } = useWeatherCache();
  const simWeather = getSimulatedMumbaiWeather();

  // Commute Alerts
  const [alertSource, setAlertSource] = useState("Churchgate");
  const [alertDest, setAlertDest] = useState("Borivali");
  const [alertTime, setAlertTime] = useState("08:00");
  const [alertDays, setAlertDays] = useState<bigint[]>([
    BigInt(1),
    BigInt(2),
    BigInt(3),
    BigInt(4),
    BigInt(5),
  ]);
  const [localAlerts, setLocalAlerts] = useState<SavedAlert[]>([
    {
      id: "1",
      source: "Dadar",
      destination: "Andheri",
      departureTime: "09:00",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    },
    {
      id: "2",
      source: "Thane",
      destination: "CSMT",
      departureTime: "07:30",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    },
  ]);
  const saveAlert = useSaveCommuteAlert();
  const _deleteAlert = useDeleteCommuteAlert();

  // Should I Leave Now
  const [leaveSource, setLeaveSource] = useState("Bandra");
  const [leaveDest, setLeaveDest] = useState("Churchgate");
  const [leaveResult, setLeaveResult] = useState<{
    yes: boolean;
    reason: string;
    delay: number;
  } | null>(null);
  const [leaveLoading, setLeaveLoading] = useState(false);

  // Best Time
  const [bestSource, setBestSource] = useState("Andheri");
  const [bestDest, setBestDest] = useState("CSMT");
  const [bestTimeResult, setBestTimeResult] = useState<string | null>(null);

  const handleSaveAlert = async () => {
    try {
      await saveAlert.mutateAsync({
        source: alertSource,
        destination: alertDest,
        departureTime: alertTime,
        daysOfWeek: alertDays,
      });
      setLocalAlerts((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          source: alertSource,
          destination: alertDest,
          departureTime: alertTime,
          days: alertDays.map((d) => DAYS[Number(d)]),
        },
      ]);
      toast.success("Commute alert saved!");
    } catch {
      toast.error("Failed to save alert");
    }
  };

  const handleDeleteAlert = (id: string) => {
    setLocalAlerts((prev) => prev.filter((a) => a.id !== id));
    toast.success("Alert removed");
  };

  const toggleDay = (dayIdx: bigint) => {
    setAlertDays((prev) =>
      prev.includes(dayIdx)
        ? prev.filter((d) => d !== dayIdx)
        : [...prev, dayIdx],
    );
  };

  const handleLeaveNow = async () => {
    setLeaveLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const now = new Date();
    const hour = now.getHours();
    const dow = now.getDay();
    const line = getLineForStation(leaveSource);
    const distance = getDistanceBetweenStations(leaveSource, leaveDest);
    const rainfall = weatherCache?.rainfall ?? simWeather.rainfall;
    const temperature = weatherCache?.temperature ?? simWeather.temperature;

    const prediction = predictDelay({
      rainfall,
      temperature,
      peakHour: isPeakHour(hour, dow),
      trainType: "fast",
      line,
      distance,
      timeOfDay: hour,
      dayOfWeek: dow,
    });

    const shouldGo =
      prediction.predictedDelayMinutes < 5 && !isPeakHour(hour, dow);
    setLeaveResult({
      yes: shouldGo,
      delay: prediction.predictedDelayMinutes,
      reason: shouldGo
        ? `Conditions are favorable. Expected delay is only ${prediction.predictedDelayMinutes.toFixed(1)} minutes.`
        : `High delays expected (${prediction.predictedDelayMinutes.toFixed(1)}m). ${prediction.explanation}`,
    });
    setLeaveLoading(false);
  };

  const handleBestTime = () => {
    const hour = new Date().getHours();
    const best = getBestDepartureTime(hour);
    const line = getLineForStation(bestSource);
    setBestTimeResult(
      `Best departure time for ${bestSource} → ${bestDest} (${line} line): ${best}. Avoid 7-10 AM and 5-9 PM peak hours.`,
    );
  };

  // Delay explanation
  const rainfall = weatherCache?.rainfall ?? simWeather.rainfall;
  const temperature = weatherCache?.temperature ?? simWeather.temperature;
  const now = new Date();
  const hour = now.getHours();
  const dow = now.getDay();
  const isPeak = isPeakHour(hour, dow);

  const delayExplanation = `Current conditions: ${temperature}°C, ${rainfall}mm rainfall. ${isPeak ? "Peak hour congestion is active" : "Off-peak — lower congestion"}. ${
    rainfall > 30
      ? "Heavy rain is the primary delay cause today — trains may run 8-15 minutes late."
      : rainfall > 10
        ? "Moderate rain adding 3-6 minutes to average delays."
        : "Weather conditions are favorable with minimal weather-induced delays."
  } ${isPeak ? "Rush hour adds ~3.5 minutes base delay." : ""}`;

  return (
    <div className="p-4 lg:p-6 space-y-6 page-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Smart Features</h2>
        <p className="text-sm text-muted-foreground mt-1">
          AI-powered commuter intelligence tools
        </p>
      </div>

      <Tabs defaultValue="alerts" data-ocid="smart.tab">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger
            value="alerts"
            className="data-[state=active]:bg-teal/20 data-[state=active]:text-teal"
          >
            <Bell className="h-4 w-4 mr-2" />
            Commute Alerts
          </TabsTrigger>
          <TabsTrigger
            value="leave"
            className="data-[state=active]:bg-teal/20 data-[state=active]:text-teal"
          >
            <Clock className="h-4 w-4 mr-2" />
            Leave Now?
          </TabsTrigger>
          <TabsTrigger
            value="besttime"
            className="data-[state=active]:bg-teal/20 data-[state=active]:text-teal"
          >
            <Zap className="h-4 w-4 mr-2" />
            Best Time
          </TabsTrigger>
          <TabsTrigger
            value="explain"
            className="data-[state=active]:bg-teal/20 data-[state=active]:text-teal"
          >
            <Brain className="h-4 w-4 mr-2" />
            Delay Cause
          </TabsTrigger>
        </TabsList>

        {/* Commute Alerts */}
        <TabsContent value="alerts" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-surface p-6 space-y-4">
              <h3 className="font-semibold text-foreground">
                Save Daily Commute Alert
              </h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-muted-foreground mb-1.5 block">
                    From
                  </Label>
                  <Select value={alertSource} onValueChange={setAlertSource}>
                    <SelectTrigger
                      className="bg-white/5 border-white/10"
                      data-ocid="smart.alert_source.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-48">
                      {allStationNames.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground mb-1.5 block">
                    To
                  </Label>
                  <Select value={alertDest} onValueChange={setAlertDest}>
                    <SelectTrigger
                      className="bg-white/5 border-white/10"
                      data-ocid="smart.alert_dest.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-48">
                      {allStationNames.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground mb-1.5 block">
                    Departure Time
                  </Label>
                  <Input
                    type="time"
                    value={alertTime}
                    onChange={(e) => setAlertTime(e.target.value)}
                    className="bg-white/5 border-white/10 text-foreground"
                    data-ocid="smart.alert_time.input"
                  />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground mb-1.5 block">
                    Days
                  </Label>
                  <div className="flex gap-2 flex-wrap">
                    {DAYS.map((day, i) => (
                      <div key={day} className="flex items-center gap-1">
                        <Checkbox
                          id={`day-${i}`}
                          checked={alertDays.includes(BigInt(i))}
                          onCheckedChange={() => toggleDay(BigInt(i))}
                          className="border-white/20"
                          data-ocid={`smart.day_${day.toLowerCase()}.checkbox`}
                        />
                        <Label
                          htmlFor={`day-${i}`}
                          className="text-xs cursor-pointer"
                        >
                          {day}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={handleSaveAlert}
                  disabled={saveAlert.isPending}
                  data-ocid="smart.save_alert.button"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.65 0.14 186) 0%, oklch(0.75 0.16 186) 100%)",
                    color: "oklch(0.12 0.025 248)",
                  }}
                >
                  {saveAlert.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4 mr-2" />
                      Save Alert
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Saved Alerts */}
            <div className="card-surface p-6">
              <h3 className="font-semibold text-foreground mb-4">
                My Commute Alerts
              </h3>
              {localAlerts.length === 0 ? (
                <div
                  className="text-center py-8"
                  data-ocid="smart.alerts.empty_state"
                >
                  <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-30" />
                  <p className="text-sm text-muted-foreground">
                    No alerts saved yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {localAlerts.map((alert, idx) => (
                    <div
                      key={alert.id}
                      className="flex items-center gap-3 rounded-xl p-3"
                      style={{
                        background: "oklch(1 0 0 / 4%)",
                        border: "1px solid oklch(1 0 0 / 8%)",
                      }}
                      data-ocid={`smart.alert.item.${idx + 1}`}
                    >
                      <Bell className="h-4 w-4 text-teal flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">
                          {alert.source} → {alert.destination}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {alert.departureTime} · {alert.days.join(", ")}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-red-400"
                        onClick={() => handleDeleteAlert(alert.id)}
                        data-ocid={`smart.alert.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Should I Leave Now */}
        <TabsContent value="leave" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-surface p-6 space-y-4">
              <h3 className="font-semibold text-foreground">
                “Should I Leave Now?”
              </h3>
              <p className="text-sm text-muted-foreground">
                Get a real-time recommendation based on current conditions
              </p>
              <div className="space-y-3">
                <Select value={leaveSource} onValueChange={setLeaveSource}>
                  <SelectTrigger
                    className="bg-white/5 border-white/10"
                    data-ocid="smart.leave_source.select"
                  >
                    <SelectValue placeholder="From station" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {allStationNames.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={leaveDest} onValueChange={setLeaveDest}>
                  <SelectTrigger
                    className="bg-white/5 border-white/10"
                    data-ocid="smart.leave_dest.select"
                  >
                    <SelectValue placeholder="To station" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {allStationNames.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  className="w-full"
                  onClick={handleLeaveNow}
                  disabled={leaveLoading}
                  data-ocid="smart.leave_now.button"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.65 0.14 186) 0%, oklch(0.75 0.16 186) 100%)",
                    color: "oklch(0.12 0.025 248)",
                  }}
                >
                  {leaveLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      Check Now
                    </>
                  )}
                </Button>
              </div>
            </div>

            {leaveResult && (
              <div className="card-surface p-6 flex flex-col items-center justify-center text-center">
                <div
                  className={cn(
                    "h-16 w-16 rounded-full flex items-center justify-center mb-4",
                    leaveResult.yes ? "bg-green-500/20" : "bg-yellow-500/20",
                  )}
                >
                  {leaveResult.yes ? (
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-yellow-400" />
                  )}
                </div>
                <h3
                  className={cn(
                    "text-2xl font-bold mb-2",
                    leaveResult.yes ? "text-green-400" : "text-yellow-400",
                  )}
                >
                  {leaveResult.yes ? "Yes, Leave Now!" : "Wait a Bit"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {leaveResult.reason}
                </p>
                <div
                  className="rounded-xl px-4 py-2 text-sm"
                  style={{
                    background: "oklch(1 0 0 / 4%)",
                    border: "1px solid oklch(1 0 0 / 8%)",
                  }}
                >
                  Expected delay:{" "}
                  <span
                    className={cn(
                      "font-bold",
                      leaveResult.delay < 5
                        ? "text-green-400"
                        : "text-yellow-400",
                    )}
                  >
                    {leaveResult.delay.toFixed(1)}m
                  </span>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Best Time to Travel */}
        <TabsContent value="besttime" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-surface p-6 space-y-4">
              <h3 className="font-semibold text-foreground">
                Best Time to Travel
              </h3>
              <p className="text-sm text-muted-foreground">
                Find the optimal departure window for your route
              </p>
              <Select value={bestSource} onValueChange={setBestSource}>
                <SelectTrigger
                  className="bg-white/5 border-white/10"
                  data-ocid="smart.best_source.select"
                >
                  <SelectValue placeholder="From station" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {allStationNames.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={bestDest} onValueChange={setBestDest}>
                <SelectTrigger
                  className="bg-white/5 border-white/10"
                  data-ocid="smart.best_dest.select"
                >
                  <SelectValue placeholder="To station" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {allStationNames.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="w-full"
                onClick={handleBestTime}
                data-ocid="smart.best_time.button"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.14 186) 0%, oklch(0.75 0.16 186) 100%)",
                  color: "oklch(0.12 0.025 248)",
                }}
              >
                <Zap className="h-4 w-4 mr-2" />
                Find Best Time
              </Button>
            </div>

            {bestTimeResult ? (
              <div className="card-surface p-6">
                <h3 className="font-semibold text-foreground mb-4">
                  Recommendation
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {bestTimeResult}
                </p>

                <div className="mt-4 space-y-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    Hourly Delay Estimate
                  </div>
                  {[
                    "6AM",
                    "8AM",
                    "10AM",
                    "12PM",
                    "3PM",
                    "6PM",
                    "8PM",
                    "10PM",
                  ].map((time, i) => {
                    const peakHours = [1, 4, 5];
                    const isPeak = peakHours.includes(i);
                    const delay = isPeak
                      ? 4 + Math.random() * 6
                      : 1 + Math.random() * 2;
                    const barWidth = (delay / 12) * 100;
                    return (
                      <div key={time} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-10">
                          {time}
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-white/10">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              isPeak ? "bg-red-400" : "bg-green-400",
                            )}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span
                          className={cn(
                            "text-xs w-12",
                            isPeak ? "text-red-300" : "text-green-300",
                          )}
                        >
                          ~{delay.toFixed(1)}m
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="card-surface p-6 flex flex-col items-center justify-center text-center">
                <Zap className="h-10 w-10 text-muted-foreground mb-3 opacity-30" />
                <p className="text-sm text-muted-foreground">
                  Select a route to see the best departure times
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Delay Cause Explanation */}
        <TabsContent value="explain" className="mt-6">
          <div className="card-surface p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-teal" />
              <h3 className="font-semibold text-foreground">
                AI Delay Cause Explanation
              </h3>
            </div>
            <div
              className="rounded-xl p-4 text-sm leading-relaxed text-foreground"
              style={{
                background: "oklch(0.73 0.14 186 / 6%)",
                border: "1px solid oklch(0.73 0.14 186 / 15%)",
              }}
            >
              {delayExplanation}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div
                className="rounded-xl p-3"
                style={{
                  background: "oklch(1 0 0 / 4%)",
                  border: "1px solid oklch(1 0 0 / 8%)",
                }}
              >
                <div className="text-xs text-muted-foreground mb-1">
                  Current Weather
                </div>
                <div className="text-sm font-medium text-foreground">
                  {temperature}°C · {rainfall}mm
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
                  Traffic Status
                </div>
                <div
                  className={cn(
                    "text-sm font-medium",
                    isPeak ? "text-warning" : "text-green-400",
                  )}
                >
                  {isPeak ? "Peak Hours" : "Off-Peak"}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
