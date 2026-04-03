import type { Incident } from "../backend.d";

export interface MockTrain {
  trainNumber: bigint;
  destination: string;
  eta: string;
  platform: bigint;
  delay: number;
  trainType: string;
}

export interface MockTPSI {
  line: string;
  score: number;
  trend: string;
  history: number[];
}

export const mockTPSIData: MockTPSI[] = [
  {
    line: "Western",
    score: 91,
    trend: "up",
    history: [86, 88, 87, 89, 91, 90, 92, 91],
  },
  {
    line: "Central",
    score: 84,
    trend: "down",
    history: [88, 87, 85, 86, 84, 83, 85, 84],
  },
  {
    line: "Harbour",
    score: 79,
    trend: "up",
    history: [75, 76, 77, 78, 79, 78, 80, 79],
  },
];

export const mockRouteRankings = [
  { route: "Churchgate → Dadar", line: "Western", tpsi: 94 },
  { route: "Churchgate → Andheri", line: "Western", tpsi: 92 },
  { route: "Churchgate → Borivali", line: "Western", tpsi: 90 },
  { route: "CSMT → Thane", line: "Central", tpsi: 87 },
  { route: "CSMT → Dadar", line: "Central", tpsi: 89 },
  { route: "CSMT → Ghatkopar", line: "Central", tpsi: 86 },
  { route: "CSMT → Panvel", line: "Harbour", tpsi: 80 },
  { route: "CSMT → Chembur", line: "Harbour", tpsi: 82 },
  { route: "Churchgate → Virar", line: "Western", tpsi: 88 },
  { route: "CSMT → Kalyan", line: "Central", tpsi: 83 },
  { route: "CSMT → Kurla", line: "Harbour", tpsi: 84 },
  { route: "Andheri → Borivali", line: "Western", tpsi: 91 },
  { route: "Dadar → Thane", line: "Central", tpsi: 85 },
  { route: "Vashi → CSMT", line: "Harbour", tpsi: 78 },
  { route: "Bandra → Virar", line: "Western", tpsi: 89 },
];

export const mockIncidents: Incident[] = [
  {
    stationName: "Dadar",
    incidentType: "Overcrowding",
    description:
      "Severe overcrowding on platform 1 during peak hours. Trains delayed by 8 minutes.",
    latitude: 19.0178,
    longitude: 72.8478,
    timestamp: BigInt(Date.now() - 25 * 60 * 1000),
    userId: {} as any,
  },
  {
    stationName: "Andheri",
    incidentType: "Signal Failure",
    description:
      "Signal failure between Andheri and Vile Parle causing 15-minute delays on Western line.",
    latitude: 19.1197,
    longitude: 72.8464,
    timestamp: BigInt(Date.now() - 55 * 60 * 1000),
    userId: {} as any,
  },
  {
    stationName: "Kurla",
    incidentType: "Track Issue",
    description:
      "Track maintenance work in progress. Trains running on single line through Kurla station.",
    latitude: 19.0726,
    longitude: 72.88,
    timestamp: BigInt(Date.now() - 2 * 60 * 60 * 1000),
    userId: {} as any,
  },
  {
    stationName: "Borivali",
    incidentType: "Flooding",
    description:
      "Minor waterlogging reported near Borivali station. Services running with minor delays.",
    latitude: 19.2307,
    longitude: 72.8567,
    timestamp: BigInt(Date.now() - 3.5 * 60 * 60 * 1000),
    userId: {} as any,
  },
  {
    stationName: "Thane",
    incidentType: "Accident",
    description:
      "Person trespassing on tracks near Thane. RPF deployed. 20-minute delay expected.",
    latitude: 19.1786,
    longitude: 72.9634,
    timestamp: BigInt(Date.now() - 5 * 60 * 60 * 1000),
    userId: {} as any,
  },
];
