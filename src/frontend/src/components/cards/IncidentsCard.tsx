import { AlertCircle, MessageSquare } from "lucide-react";
import type { Incident } from "../../backend.d";
import { mockIncidents } from "../../data/mockData";
import { useRecentIncidents } from "../../hooks/useBackend";
import { formatTimeAgo, getIncidentTypeIcon } from "../../utils/helpers";

export default function IncidentsCard() {
  const { data: backendIncidents, isLoading } = useRecentIncidents();
  const incidents: Incident[] =
    backendIncidents && backendIncidents.length > 0
      ? backendIncidents
      : mockIncidents;

  return (
    <div className="card-surface p-5" data-ocid="incidents.card">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/15 border border-yellow-500/25">
          <MessageSquare className="h-4 w-4 text-yellow-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Community Incidents
          </h3>
          <p className="text-xs text-muted-foreground">Recent reports</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2" data-ocid="incidents.loading_state">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {incidents.slice(0, 4).map((incident) => (
            <div
              key={incident.stationName + String(incident.timestamp)}
              className="flex items-start gap-2 rounded-lg px-2 py-2 hover:bg-white/5 transition-colors"
            >
              <span className="text-base flex-shrink-0 mt-0.5">
                {getIncidentTypeIcon(incident.incidentType)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-xs font-medium text-foreground">
                    {incident.stationName}
                  </span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full"
                    style={{
                      background: "oklch(0.82 0.18 87 / 15%)",
                      color: "oklch(0.82 0.18 87)",
                    }}
                  >
                    {incident.incidentType}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {incident.description}
                </p>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {formatTimeAgo(incident.timestamp)}
              </span>
            </div>
          ))}
        </div>
      )}

      {incidents.length === 0 && !isLoading && (
        <div className="text-center py-4" data-ocid="incidents.empty_state">
          <AlertCircle className="h-6 w-6 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-xs text-muted-foreground">
            No recent incidents reported
          </p>
        </div>
      )}
    </div>
  );
}
