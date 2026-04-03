import { Minus, Shield, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect } from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { mockTPSIData } from "../../data/mockData";
import { useTPSIScore, useUpdateTPSIScore } from "../../hooks/useBackend";
import { cn, getTPSIStatus } from "../../utils/helpers";

interface TPSILineCardProps {
  line: string;
  mockData: { score: number; trend: string; history: number[] };
}

function TPSILineItem({ line, mockData }: TPSILineCardProps) {
  const { data: backendTPSI } = useTPSIScore(line);
  const updateTPSI = useUpdateTPSIScore();

  // biome-ignore lint/correctness/useExhaustiveDependencies: seed once on mount
  useEffect(() => {
    if (!backendTPSI) {
      updateTPSI.mutate({
        line,
        score: BigInt(mockData.score),
        trend: mockData.trend,
      });
    }
  }, [backendTPSI]);

  const score = backendTPSI ? Number(backendTPSI.score) : mockData.score;
  const trend = backendTPSI?.trend ?? mockData.trend;
  const status = getTPSIStatus(score);

  const chartData = mockData.history.map((v, i) => ({ value: v, i }));

  const lineColor =
    line === "Western" ? "#60a5fa" : line === "Central" ? "#fb923c" : "#c084fc";

  return (
    <div
      className="flex items-center gap-3 py-2"
      data-ocid={`tpsi.${line.toLowerCase()}.row`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-foreground">{line}</span>
          <span className={cn("text-xs font-bold", status.color)}>
            {score}%
          </span>
          {trend === "up" ? (
            <TrendingUp className="h-3 w-3 text-green-400" />
          ) : trend === "down" ? (
            <TrendingDown className="h-3 w-3 text-red-400" />
          ) : (
            <Minus className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
        <div className="h-1.5 rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score}%`, backgroundColor: lineColor }}
          />
        </div>
      </div>
      <div className="h-8 w-16">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div
        className={cn(
          "text-xs px-2 py-0.5 rounded-full border",
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
      </div>
    </div>
  );
}

export default function TPSICard() {
  return (
    <div className="card-surface p-5 h-full" data-ocid="tpsi.card">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal/15 border border-teal/25">
          <Shield className="h-4 w-4 text-teal" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            TPSI Reliability
          </h3>
          <p className="text-xs text-muted-foreground">
            Train Performance Score Index
          </p>
        </div>
      </div>

      <div className="divide-y divide-white/5">
        {mockTPSIData.map((data) => (
          <TPSILineItem key={data.line} line={data.line} mockData={data} />
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-white/5">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs text-muted-foreground">Avg TPSI</div>
            <div className="text-sm font-bold text-teal">
              {Math.round(
                mockTPSIData.reduce((a, b) => a + b.score, 0) /
                  mockTPSIData.length,
              )}
              %
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Best Line</div>
            <div className="text-sm font-bold text-foreground">Western</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Routes</div>
            <div className="text-sm font-bold text-foreground">15+</div>
          </div>
        </div>
      </div>
    </div>
  );
}
