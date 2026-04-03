export interface Station {
  name: string;
  line: "Western" | "Central" | "Harbour";
}

export const westernStations: string[] = [
  "Churchgate",
  "Marine Lines",
  "Charni Road",
  "Grant Road",
  "Mumbai Central",
  "Mahalaxmi",
  "Lower Parel",
  "Elphinstone Road",
  "Dadar",
  "Matunga Road",
  "Mahim",
  "Bandra",
  "Khar Road",
  "Santacruz",
  "Vile Parle",
  "Andheri",
  "Jogeshwari",
  "Goregaon",
  "Malad",
  "Kandivali",
  "Borivali",
  "Dahisar",
  "Mira Road",
  "Bhayandar",
  "Naigaon",
  "Vasai Road",
  "Nala Sopara",
  "Virar",
];

export const centralStations: string[] = [
  "CSMT",
  "Masjid",
  "Sandhurst Road",
  "Byculla",
  "Chinchpokli",
  "Currey Road",
  "Parel",
  "Dadar",
  "Matunga",
  "Sion",
  "Kurla",
  "Vidyavihar",
  "Ghatkopar",
  "Vikhroli",
  "Kanjurmarg",
  "Bhandup",
  "Nahur",
  "Mulund",
  "Thane",
  "Kalwa",
  "Mumbra",
  "Diva",
  "Dombivali",
  "Thakurli",
  "Kalyan",
  "Shahad",
  "Ambivali",
  "Titwala",
  "Khadavli",
  "Vasind",
  "Asangaon",
  "Atgaon",
  "Khardi",
  "Umbermali",
  "Kasara",
];

export const harbourStations: string[] = [
  "CSMT",
  "Sandhurst Road",
  "Dockyard Road",
  "Reay Road",
  "Cotton Green",
  "Sewri",
  "Wadala Road",
  "GTB Nagar",
  "Chunabhatti",
  "Kurla",
  "Tilak Nagar",
  "Chembur",
  "Govandi",
  "Mankhurd",
  "Vashi",
  "Sanpada",
  "Juinagar",
  "Nerul",
  "Seawood Darave",
  "Belapur",
  "Kharghar",
  "Mansarovar",
  "Khandeshwar",
  "Panvel",
];

export const allStations: Station[] = [
  ...westernStations.map((name) => ({ name, line: "Western" as const })),
  ...centralStations.map((name) => ({ name, line: "Central" as const })),
  ...harbourStations.map((name) => ({ name, line: "Harbour" as const })),
];

export const allStationNames: string[] = [
  ...new Set([...westernStations, ...centralStations, ...harbourStations]),
];

export function getLineForStation(
  stationName: string,
): "Western" | "Central" | "Harbour" {
  if (westernStations.includes(stationName)) return "Western";
  if (centralStations.includes(stationName)) return "Central";
  return "Harbour";
}

export function getDistanceBetweenStations(
  source: string,
  destination: string,
): number {
  const srcIdx = allStations.findIndex((s) => s.name === source);
  const dstIdx = allStations.findIndex((s) => s.name === destination);
  if (srcIdx === -1 || dstIdx === -1) return 20;
  const diff = Math.abs(srcIdx - dstIdx);
  return Math.max(5, diff * 2.5);
}
