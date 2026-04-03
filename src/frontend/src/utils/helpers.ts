import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(timestamp: bigint): string {
  const diff = Date.now() - Number(timestamp);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}

export function formatTimestamp(timestamp: bigint): string {
  return new Date(Number(timestamp)).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getDelayColor(delay: number): string {
  if (delay <= 0) return "text-green-400";
  if (delay < 3) return "severity-green";
  if (delay < 8) return "severity-yellow";
  return "severity-red";
}

export function getDelayLabel(delay: number): string {
  if (delay <= 0) return "On Time";
  if (delay < 3) return `${delay}m late`;
  return `${delay}m delay`;
}

export function getTPSIStatus(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "Excellent", color: "text-green-400" };
  if (score >= 80) return { label: "Good", color: "text-teal" };
  if (score >= 70) return { label: "Fair", color: "text-warning" };
  return { label: "Caution", color: "text-danger" };
}

export function getLineColor(line: string): string {
  switch (line) {
    case "Western":
      return "text-blue-400";
    case "Central":
      return "text-orange-400";
    case "Harbour":
      return "text-purple-400";
    default:
      return "text-foreground";
  }
}

export function getLineBadgeClass(line: string): string {
  switch (line) {
    case "Western":
      return "bg-blue-500/20 text-blue-300 border border-blue-500/30";
    case "Central":
      return "bg-orange-500/20 text-orange-300 border border-orange-500/30";
    case "Harbour":
      return "bg-purple-500/20 text-purple-300 border border-purple-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function getNetworkStatusClass(status: string): string {
  switch (status) {
    case "Normal":
      return "bg-green-500/20 text-green-300 border-green-500/30";
    case "Moderate":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    case "Severe":
      return "bg-red-500/20 text-red-300 border-red-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function getIncidentTypeIcon(type: string): string {
  switch (type) {
    case "Signal Failure":
      return "📡";
    case "Track Issue":
      return "🔧";
    case "Overcrowding":
      return "👥";
    case "Flooding":
      return "🌊";
    case "Accident":
      return "⚠️";
    default:
      return "📋";
  }
}

export function getBestDepartureTime(currentHour: number): string {
  // Avoid peak hours 7-10 and 17-21
  if (currentHour < 7) return "07:00"; // Just before morning peak
  if (currentHour >= 7 && currentHour < 10) return "After 10:30";
  if (currentHour >= 10 && currentHour < 17)
    return `${currentHour + 1}:00 (Off-peak)`;
  if (currentHour >= 17 && currentHour < 21) return "After 21:00";
  return `${currentHour}:30`;
}

export function calculateTravelBuffer(
  delayMinutes: number,
  distance: number,
): number {
  const baseBuffer = 5;
  const delayBuffer = Math.ceil(delayMinutes * 1.5);
  const distanceBuffer = Math.ceil(distance / 20) * 5;
  return baseBuffer + delayBuffer + distanceBuffer;
}
