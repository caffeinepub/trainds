import type { MockTrain } from "../data/mockData";
import {
  centralStations,
  harbourStations,
  westernStations,
} from "../data/stations";

const now = new Date();
const hour = now.getHours();
const isPeak = (hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 21);

export function generateTrains(_stationFilter?: string): MockTrain[] {
  const trains: MockTrain[] = [];
  const interval = isPeak ? 5 : 12;

  const wDestinations = westernStations.slice(
    Math.floor(westernStations.length / 2),
  );
  for (let i = 0; i < 3; i++) {
    const etaMinutes = interval * i + Math.floor(Math.random() * 3);
    const delay = Math.random() < 0.4 ? Math.floor(Math.random() * 8) : 0;
    trains.push({
      trainNumber: BigInt(97001 + i * 2),
      destination:
        wDestinations[Math.floor(Math.random() * wDestinations.length)],
      eta: formatETA(etaMinutes),
      platform: BigInt(Math.floor(Math.random() * 4) + 1),
      delay,
      trainType: i % 2 === 0 ? "Fast" : "Slow",
    });
  }

  const cDestinations = centralStations.slice(
    Math.floor(centralStations.length / 2),
  );
  for (let i = 0; i < 2; i++) {
    const etaMinutes = interval * i + 2 + Math.floor(Math.random() * 3);
    const delay = Math.random() < 0.35 ? Math.floor(Math.random() * 10) : 0;
    trains.push({
      trainNumber: BigInt(11001 + i * 2),
      destination:
        cDestinations[Math.floor(Math.random() * cDestinations.length)],
      eta: formatETA(etaMinutes),
      platform: BigInt(Math.floor(Math.random() * 3) + 5),
      delay,
      trainType: i % 2 === 0 ? "Fast" : "Slow",
    });
  }

  const hDestinations = harbourStations.slice(
    Math.floor(harbourStations.length / 2),
  );
  for (let i = 0; i < 2; i++) {
    const etaMinutes = interval * i + 4 + Math.floor(Math.random() * 3);
    const delay = Math.random() < 0.45 ? Math.floor(Math.random() * 7) : 0;
    trains.push({
      trainNumber: BigInt(75001 + i * 2),
      destination:
        hDestinations[Math.floor(Math.random() * hDestinations.length)],
      eta: formatETA(etaMinutes),
      platform: BigInt(Math.floor(Math.random() * 2) + 8),
      delay,
      trainType: "Slow",
    });
  }

  return trains.sort((a, b) => a.eta.localeCompare(b.eta));
}

function formatETA(minutesFromNow: number): string {
  const eta = new Date();
  eta.setMinutes(eta.getMinutes() + minutesFromNow);
  const h = eta.getHours().toString().padStart(2, "0");
  const m = eta.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function getNetworkStatusSimulation(): {
  status: string;
  reason: string;
} {
  const random = Math.random();
  if (random < 0.65)
    return { status: "Normal", reason: "All lines operating normally" };
  if (random < 0.85)
    return {
      status: "Moderate",
      reason: "Minor delays on Western line due to congestion",
    };
  return {
    status: "Severe",
    reason: "Signal failure at Dadar affecting Central line",
  };
}
