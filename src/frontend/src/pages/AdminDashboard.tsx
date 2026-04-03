import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Loader2,
  MessageSquare,
  Shield,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
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
import {
  useAnalyticsSummary,
  useDeleteIncident,
  useRecentIncidents,
  useResolveSOS,
  useUpdateNetworkStatus,
  useUpdateTPSIScore,
} from "../hooks/useBackend";
import { useMySOSReports } from "../hooks/useBackend";
import { cn, formatTimestamp, getNetworkStatusClass } from "../utils/helpers";

const delayTrendData = Array.from({ length: 30 }, (_, i) => ({
  day: `D${i + 1}`,
  delay: 3 + Math.sin(i / 3) * 2 + Math.random() * 2,
  peak: 6 + Math.sin(i / 3) * 3 + Math.random() * 2,
}));

const peakOffPeakData = [
  { hour: "6AM", peak: 2.1, offPeak: 1.2 },
  { hour: "8AM", peak: 6.8, offPeak: 2.1 },
  { hour: "10AM", peak: 4.2, offPeak: 1.8 },
  { hour: "12PM", peak: 2.5, offPeak: 1.5 },
  { hour: "3PM", peak: 3.1, offPeak: 2.0 },
  { hour: "6PM", peak: 7.4, offPeak: 2.3 },
  { hour: "8PM", peak: 5.6, offPeak: 2.1 },
  { hour: "10PM", peak: 2.8, offPeak: 1.4 },
];

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-bold text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: analytics, isLoading: analyticsLoading } =
    useAnalyticsSummary();
  const { data: incidents } = useRecentIncidents();
  const { data: sosReports } = useMySOSReports();
  const deleteIncident = useDeleteIncident();
  const resolveSOS = useResolveSOS();
  const updateNetworkStatus = useUpdateNetworkStatus();
  const updateTPSI = useUpdateTPSIScore();

  const [resolveResponses, setResolveResponses] = useState<
    Record<string, string>
  >({});

  const handleResolveSOS = async (timestamp: bigint, idx: number) => {
    const response = resolveResponses[String(idx)] || "Issue resolved by admin";
    try {
      await resolveSOS.mutateAsync({ reportId: timestamp, response });
      toast.success("SOS report resolved");
    } catch {
      toast.error("Failed to resolve SOS");
    }
  };

  const handleDeleteIncident = async (timestamp: bigint) => {
    try {
      await deleteIncident.mutateAsync(timestamp);
      toast.success("Incident deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      await updateNetworkStatus.mutateAsync({
        status,
        reason: `Status set to ${status} by admin`,
      });
      toast.success(`Network status: ${status}`);
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleTPSIUpdate = async (line: string, score: number) => {
    try {
      await updateTPSI.mutateAsync({
        line,
        score: BigInt(score),
        trend: "stable",
      });
      toast.success(`${line} TPSI updated to ${score}`);
    } catch {
      toast.error("Failed to update TPSI");
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 page-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/15 border border-teal/25">
          <Shield className="h-5 w-5 text-teal" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Admin Dashboard
          </h2>
          <p className="text-sm text-muted-foreground">
            System analytics and management
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" data-ocid="admin.tab">
        <TabsList className="bg-white/5 border border-white/10 flex-wrap h-auto">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-teal/20 data-[state=active]:text-teal"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="sos"
            className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-300"
          >
            SOS Panel
          </TabsTrigger>
          <TabsTrigger
            value="incidents"
            className="data-[state=active]:bg-teal/20 data-[state=active]:text-teal"
          >
            Incidents
          </TabsTrigger>
          <TabsTrigger
            value="network"
            className="data-[state=active]:bg-teal/20 data-[state=active]:text-teal"
          >
            Network Control
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {analyticsLoading ? (
            <div
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
              data-ocid="admin.overview.loading_state"
            >
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card-surface h-24 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Users}
                label="Total Users"
                value={Number(analytics?.totalUsers ?? 0)}
                color="bg-blue-500/15 text-blue-400"
              />
              <StatCard
                icon={AlertTriangle}
                label="Open SOS"
                value={Number(analytics?.openSOSReports ?? 0)}
                color="bg-red-500/15 text-red-400"
              />
              <StatCard
                icon={MessageSquare}
                label="Total Incidents"
                value={Number(analytics?.totalIncidents ?? 0)}
                color="bg-yellow-500/15 text-yellow-400"
              />
              <StatCard
                icon={Star}
                label="Avg Rating"
                value={(analytics?.averageRating ?? 4.2).toFixed(1)}
                color="bg-teal/15 text-teal"
              />
            </div>
          )}

          {/* Delay Trends */}
          <div className="card-surface p-6">
            <h3 className="font-semibold text-foreground mb-4">
              30-Day Delay Trends
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={delayTrendData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10, fill: "#9AA8BA" }}
                    interval={4}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "#9AA8BA" }} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.19 0.03 245)",
                      border: "1px solid oklch(1 0 0 / 10%)",
                      borderRadius: "8px",
                      color: "#EAF0F8",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", color: "#9AA8BA" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="delay"
                    name="Avg Delay (min)"
                    stroke="#20c997"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="peak"
                    name="Peak Delay (min)"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Peak vs Off-Peak */}
          <div className="card-surface p-6">
            <h3 className="font-semibold text-foreground mb-4">
              Peak vs Off-Peak Delays
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakOffPeakData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 11, fill: "#9AA8BA" }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#9AA8BA" }} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.19 0.03 245)",
                      border: "1px solid oklch(1 0 0 / 10%)",
                      borderRadius: "8px",
                      color: "#EAF0F8",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", color: "#9AA8BA" }}
                  />
                  <Bar
                    dataKey="peak"
                    name="Peak Hours"
                    fill="#ef4444"
                    opacity={0.8}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="offPeak"
                    name="Off-Peak"
                    fill="#20c997"
                    opacity={0.8}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        {/* SOS Panel */}
        <TabsContent value="sos" className="mt-6">
          <div className="card-surface p-6">
            <h3 className="font-semibold text-foreground mb-4">SOS Reports</h3>
            {!sosReports || sosReports.length === 0 ? (
              <div
                className="text-center py-8"
                data-ocid="admin.sos.empty_state"
              >
                <CheckCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-30" />
                <p className="text-sm text-muted-foreground">
                  No SOS reports. All clear!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sosReports.map((report, idx) => (
                  <div
                    key={String(report.timestamp)}
                    className="rounded-xl p-4"
                    style={{
                      background: report.resolved
                        ? "oklch(0.73 0.18 145 / 5%)"
                        : "oklch(0.57 0.22 27 / 8%)",
                      border: `1px solid ${report.resolved ? "oklch(0.73 0.18 145 / 20%)" : "oklch(0.57 0.22 27 / 25%)"}`,
                    }}
                    data-ocid={`admin.sos.item.${idx + 1}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${report.resolved ? "bg-green-500/20" : "bg-red-500/20"}`}
                      >
                        {report.resolved ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge
                            className={`text-xs border ${report.resolved ? "bg-green-500/10 text-green-300 border-green-500/20" : "bg-red-500/10 text-red-300 border-red-500/20"}`}
                          >
                            {report.resolved ? "Resolved" : "Open"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(report.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground mb-1">
                          {report.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Location: {report.latitude.toFixed(4)}°N,{" "}
                          {report.longitude.toFixed(4)}°E
                        </p>

                        {!report.resolved && (
                          <div className="mt-3 flex gap-2">
                            <Input
                              placeholder="Admin response..."
                              value={resolveResponses[String(idx)] || ""}
                              onChange={(e) =>
                                setResolveResponses((prev) => ({
                                  ...prev,
                                  [String(idx)]: e.target.value,
                                }))
                              }
                              className="flex-1 h-8 text-xs bg-white/5 border-white/10 text-foreground"
                              data-ocid={`admin.sos.response.input.${idx + 1}`}
                            />
                            <Button
                              size="sm"
                              className="h-8 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30"
                              onClick={() =>
                                handleResolveSOS(report.timestamp, idx)
                              }
                              data-ocid={`admin.sos.resolve_button.${idx + 1}`}
                            >
                              {resolveSOS.isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Incidents */}
        <TabsContent value="incidents" className="mt-6">
          <div className="card-surface p-6">
            <h3 className="font-semibold text-foreground mb-4">
              All Incidents
            </h3>
            {!incidents || incidents.length === 0 ? (
              <div
                className="text-center py-8"
                data-ocid="admin.incidents.empty_state"
              >
                <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-30" />
                <p className="text-sm text-muted-foreground">
                  No incidents reported
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5">
                    <TableHead className="text-muted-foreground">
                      Station
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Type
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Description
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Time
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.map((inc, idx) => (
                    <TableRow
                      key={inc.stationName + String(inc.timestamp)}
                      className="border-white/5 hover:bg-white/5"
                      data-ocid={`admin.incidents.item.${idx + 1}`}
                    >
                      <TableCell className="font-medium text-foreground text-sm">
                        {inc.stationName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-xs border-white/10"
                        >
                          {inc.incidentType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                        {inc.description}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatTimestamp(inc.timestamp)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => handleDeleteIncident(inc.timestamp)}
                          data-ocid={`admin.incidents.delete_button.${idx + 1}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* Network Control */}
        <TabsContent value="network" className="mt-6 space-y-6">
          <div className="card-surface p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-teal" />
              <h3 className="font-semibold text-foreground">
                Network Status Control
              </h3>
            </div>
            <div className="flex gap-3 flex-wrap">
              {["Normal", "Moderate", "Severe"].map((s) => (
                <Button
                  key={s}
                  size="sm"
                  className={cn("border", getNetworkStatusClass(s))}
                  onClick={() => handleUpdateStatus(s)}
                  data-ocid={`admin.network_${s.toLowerCase()}.button`}
                >
                  Set {s}
                </Button>
              ))}
            </div>
          </div>

          <div className="card-surface p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-teal" />
              <h3 className="font-semibold text-foreground">
                TPSI Score Control
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["Western", "Central", "Harbour"].map((line) => (
                <div key={line} className="space-y-2">
                  <div className="text-sm font-medium text-foreground">
                    {line} Line
                  </div>
                  <div className="flex gap-2">
                    {[80, 85, 90, 95].map((score) => (
                      <Button
                        key={score}
                        size="sm"
                        variant="outline"
                        className="text-xs border-white/10 hover:bg-white/5"
                        onClick={() => handleTPSIUpdate(line, score)}
                        data-ocid={`admin.tpsi_${line.toLowerCase()}_${score}.button`}
                      >
                        {score}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
