import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Minus,
  RefreshCw,
  Shield,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { mockRouteRankings, mockTPSIData } from "../data/mockData";
import { useTPSIScore, useUpdateTPSIScore } from "../hooks/useBackend";
import { useIsAdmin } from "../hooks/useBackend";
import { cn, getLineBadgeClass, getTPSIStatus } from "../utils/helpers";

// Simulated historical data
const historicalData = Array.from({ length: 14 }, (_, i) => ({
  day: `Day ${i + 1}`,
  Western: 88 + Math.floor(Math.random() * 8),
  Central: 82 + Math.floor(Math.random() * 8),
  Harbour: 76 + Math.floor(Math.random() * 8),
}));

interface TPSILineCardProps {
  line: string;
  mock: { score: number; trend: string; history: number[] };
  isAdmin: boolean;
}

function TPSILineCard({ line, mock, isAdmin }: TPSILineCardProps) {
  const { data: backendTPSI, refetch } = useTPSIScore(line);
  const updateTPSI = useUpdateTPSIScore();

  // biome-ignore lint/correctness/useExhaustiveDependencies: seed once
  useEffect(() => {
    if (!backendTPSI) {
      updateTPSI.mutate({ line, score: BigInt(mock.score), trend: mock.trend });
    }
  }, [backendTPSI]);

  const score = backendTPSI ? Number(backendTPSI.score) : mock.score;
  const trend = backendTPSI?.trend ?? mock.trend;
  const status = getTPSIStatus(score);

  const lineColor =
    line === "Western" ? "#60a5fa" : line === "Central" ? "#fb923c" : "#c084fc";

  const handleRefresh = async () => {
    const newScore = BigInt(mock.score + Math.floor(Math.random() * 4) - 2);
    const newTrend = Math.random() > 0.5 ? "up" : "down";
    try {
      await updateTPSI.mutateAsync({ line, score: newScore, trend: newTrend });
      refetch();
      toast.success(`${line} line TPSI updated`);
    } catch {
      toast.error("Failed to update TPSI");
    }
  };

  return (
    <div
      className="card-surface p-6"
      data-ocid={`tpsi.${line.toLowerCase()}.card`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center"
            style={{
              background: `${lineColor}20`,
              border: `1px solid ${lineColor}40`,
            }}
          >
            <Shield className="h-5 w-5" style={{ color: lineColor }} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{line} Line</h3>
            <p className="text-xs text-muted-foreground">
              Train Performance Score
            </p>
          </div>
        </div>
        {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
            onClick={handleRefresh}
            data-ocid={`tpsi.${line.toLowerCase()}.refresh.button`}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        )}
      </div>

      <div className="flex items-end gap-3 mb-4">
        <div className={cn("text-5xl font-black", status.color)}>{score}</div>
        <div className="pb-2">
          <div className="text-lg font-semibold text-muted-foreground">
            / 100
          </div>
          <div className="flex items-center gap-1">
            {trend === "up" ? (
              <TrendingUp className="h-4 w-4 text-green-400" />
            ) : trend === "down" ? (
              <TrendingDown className="h-4 w-4 text-red-400" />
            ) : (
              <Minus className="h-4 w-4 text-muted-foreground" />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                trend === "up"
                  ? "text-green-400"
                  : trend === "down"
                    ? "text-red-400"
                    : "text-muted-foreground",
              )}
            >
              {trend === "up"
                ? "Improving"
                : trend === "down"
                  ? "Declining"
                  : "Stable"}
            </span>
          </div>
        </div>
        <div className="ml-auto">
          <Badge
            className={cn(
              "text-sm px-3 py-1 border",
              score >= 90
                ? "bg-green-500/10 text-green-300 border-green-500/20"
                : score >= 80
                  ? "bg-teal/10 text-teal border-teal/20"
                  : score >= 70
                    ? "bg-yellow-500/10 text-yellow-300 border-yellow-500/20"
                    : "bg-red-500/10 text-red-300 border-red-500/20",
            )}
          >
            {status.label}
          </Badge>
        </div>
      </div>

      <Progress
        value={score}
        className="h-2 bg-white/10"
        style={{ "--progress-bg": lineColor } as React.CSSProperties}
      />
    </div>
  );
}

export default function TPSIScores() {
  const { data: isAdmin } = useIsAdmin();

  return (
    <div className="p-4 lg:p-6 space-y-6 page-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">TPSI Scores</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Train Performance Score Index — Reliability Rankings
        </p>
      </div>

      {/* Line Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockTPSIData.map((data) => (
          <TPSILineCard
            key={data.line}
            line={data.line}
            mock={data}
            isAdmin={isAdmin ?? false}
          />
        ))}
      </div>

      {/* Historical Chart */}
      <div className="card-surface p-6">
        <h3 className="font-semibold text-foreground mb-4">
          14-Day TPSI Trend
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={historicalData}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9AA8BA" }} />
              <YAxis
                domain={[70, 100]}
                tick={{ fontSize: 11, fill: "#9AA8BA" }}
              />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.19 0.03 245)",
                  border: "1px solid oklch(1 0 0 / 10%)",
                  borderRadius: "8px",
                  color: "#EAF0F8",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", color: "#9AA8BA" }} />
              <Line
                type="monotone"
                dataKey="Western"
                stroke="#60a5fa"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Central"
                stroke="#fb923c"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Harbour"
                stroke="#c084fc"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Route Rankings */}
      <div className="card-surface p-6">
        <h3 className="font-semibold text-foreground mb-4">
          Route Reliability Rankings
        </h3>
        <Table>
          <TableHeader>
            <TableRow className="border-white/5">
              <TableHead className="text-muted-foreground w-12">#</TableHead>
              <TableHead className="text-muted-foreground">Route</TableHead>
              <TableHead className="text-muted-foreground">Line</TableHead>
              <TableHead className="text-muted-foreground">
                TPSI Score
              </TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockRouteRankings.map((r, idx) => {
              const status = getTPSIStatus(r.tpsi);
              return (
                <TableRow
                  key={r.route}
                  className="border-white/5 hover:bg-white/5"
                  data-ocid={`tpsi.route.item.${idx + 1}`}
                >
                  <TableCell className="text-muted-foreground text-sm">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-medium text-foreground text-sm">
                    {r.route}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        getLineBadgeClass(r.line),
                      )}
                    >
                      {r.line}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={cn("font-bold text-sm", status.color)}>
                        {r.tpsi}%
                      </span>
                      <div className="flex-1 h-1 rounded-full bg-white/10 max-w-16">
                        <div
                          className="h-full rounded-full bg-teal"
                          style={{ width: `${r.tpsi}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "text-xs border",
                        status.color === "text-green-400"
                          ? "bg-green-500/10 border-green-500/20 text-green-300"
                          : status.color === "text-teal"
                            ? "bg-teal/10 border-teal/20 text-teal"
                            : "bg-yellow-500/10 border-yellow-500/20 text-yellow-300",
                      )}
                    >
                      {status.label}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
