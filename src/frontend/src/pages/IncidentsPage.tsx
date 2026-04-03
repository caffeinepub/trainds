import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2, MapPin, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Incident } from "../backend.d";
import { mockIncidents } from "../data/mockData";
import { allStationNames } from "../data/stations";
import {
  useDeleteIncident,
  useRecentIncidents,
  useSubmitIncident,
} from "../hooks/useBackend";
import { useIsAdmin } from "../hooks/useBackend";
import { cn, formatTimeAgo, getIncidentTypeIcon } from "../utils/helpers";

const INCIDENT_TYPES = [
  "Signal Failure",
  "Track Issue",
  "Overcrowding",
  "Flooding",
  "Accident",
  "Other",
];

export default function IncidentsPage() {
  const [station, setStation] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [shareLocation, setShareLocation] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterStation, setFilterStation] = useState("all");

  const { data: backendIncidents, isLoading } = useRecentIncidents();
  const { data: isAdmin } = useIsAdmin();
  const submitIncident = useSubmitIncident();
  const deleteIncident = useDeleteIncident();

  const incidents: Incident[] =
    backendIncidents && backendIncidents.length > 0
      ? backendIncidents
      : mockIncidents;

  const filteredIncidents = incidents.filter((inc) => {
    if (filterType !== "all" && inc.incidentType !== filterType) return false;
    if (filterStation !== "all" && inc.stationName !== filterStation)
      return false;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!station || !type || !description.trim()) {
      toast.error("Please fill all required fields");
      return;
    }
    let lat = 19.076;
    let lng = 72.8777;
    if (shareLocation && navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }),
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch {}
    }
    try {
      await submitIncident.mutateAsync({
        stationName: station,
        incidentType: type,
        description,
        latitude: lat,
        longitude: lng,
      });
      toast.success("Incident reported. Thank you!");
      setStation("");
      setType("");
      setDescription("");
      setShareLocation(false);
    } catch {
      toast.error("Failed to submit incident");
    }
  };

  const handleDelete = async (inc: Incident) => {
    try {
      await deleteIncident.mutateAsync(inc.timestamp);
      toast.success("Incident deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 page-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Community Incidents
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Report and view crowd-sourced train disruptions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Form */}
        <div className="card-surface p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-yellow-400" />
            <h3 className="font-semibold text-foreground">Report Incident</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label className="text-sm text-muted-foreground mb-1.5 block">
                Station *
              </Label>
              <Select value={station} onValueChange={setStation}>
                <SelectTrigger
                  className="bg-white/5 border-white/10"
                  data-ocid="incidents.station.select"
                >
                  <SelectValue placeholder="Select station" />
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
              <Label className="text-sm text-muted-foreground mb-1.5 block">
                Incident Type *
              </Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger
                  className="bg-white/5 border-white/10"
                  data-ocid="incidents.type.select"
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {INCIDENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {getIncidentTypeIcon(t)} {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1.5 block">
                Description *
              </Label>
              <Textarea
                placeholder="Describe the incident..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px] bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground"
                data-ocid="incidents.description.textarea"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="shareLocation"
                checked={shareLocation}
                onCheckedChange={setShareLocation}
                data-ocid="incidents.location.switch"
              />
              <Label
                htmlFor="shareLocation"
                className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"
              >
                <MapPin className="h-3 w-3" /> Share Location
              </Label>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={submitIncident.isPending}
              data-ocid="incidents.submit_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.14 186) 0%, oklch(0.75 0.16 186) 100%)",
                color: "oklch(0.12 0.025 248)",
              }}
            >
              {submitIncident.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </Button>
          </form>
        </div>

        {/* Incidents Feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger
                className="w-44 h-8 text-xs bg-white/5 border-white/10"
                data-ocid="incidents.filter_type.select"
              >
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {INCIDENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="text-xs">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStation} onValueChange={setFilterStation}>
              <SelectTrigger
                className="w-44 h-8 text-xs bg-white/5 border-white/10"
                data-ocid="incidents.filter_station.select"
              >
                <SelectValue placeholder="Filter by station" />
              </SelectTrigger>
              <SelectContent className="max-h-48">
                <SelectItem value="all">All Stations</SelectItem>
                {allStationNames.map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-3" data-ocid="incidents.loading_state">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card-surface h-24 animate-pulse" />
              ))}
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div
              className="card-surface p-8 text-center"
              data-ocid="incidents.empty_state"
            >
              <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-sm text-muted-foreground">
                No incidents found for the selected filters
              </p>
            </div>
          ) : (
            filteredIncidents.map((incident, idx) => (
              <div
                key={incident.stationName + String(incident.timestamp)}
                className="card-surface p-4"
                data-ocid={`incidents.item.${idx + 1}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">
                    {getIncidentTypeIcon(incident.incidentType)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-foreground text-sm">
                        {incident.stationName}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: "oklch(0.82 0.18 87 / 15%)",
                          color: "oklch(0.82 0.18 87)",
                        }}
                      >
                        {incident.incidentType}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {formatTimeAgo(incident.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {incident.description}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {incident.latitude.toFixed(3)},{" "}
                        {incident.longitude.toFixed(3)}
                      </span>
                    </div>
                  </div>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => handleDelete(incident)}
                      data-ocid={`incidents.delete_button.${idx + 1}`}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
