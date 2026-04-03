export interface SimulatedWeather {
  temperature: number;
  humidity: number;
  rainfall: number;
  condition: string;
  feelsLike: number;
  windSpeed: number;
  visibility: number;
}

export function getSimulatedMumbaiWeather(): SimulatedWeather {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed
  const hour = now.getHours();

  // Monsoon months June–September (5–8)
  const isMonsoon = month >= 5 && month <= 8;
  const isPreMonsoon = month >= 3 && month <= 4;
  const isWinter = month >= 11 || month <= 1;

  let baseTemp: number;
  let humidity: number;
  let rainfall: number;
  let condition: string;

  if (isWinter) {
    baseTemp = 24 + Math.random() * 4;
    humidity = 65 + Math.random() * 10;
    rainfall = Math.random() < 0.05 ? Math.random() * 3 : 0;
    condition = "Clear";
  } else if (isMonsoon) {
    baseTemp = 27 + Math.random() * 3;
    humidity = 85 + Math.random() * 10;
    const rainChance = Math.random();
    if (rainChance < 0.4) {
      rainfall = 20 + Math.random() * 60;
      condition = rainfall > 40 ? "Heavy Rain" : "Moderate Rain";
    } else if (rainChance < 0.7) {
      rainfall = 3 + Math.random() * 15;
      condition = "Light Rain";
    } else {
      rainfall = 0;
      condition = "Partly Cloudy";
    }
  } else if (isPreMonsoon) {
    baseTemp = 30 + Math.random() * 5;
    humidity = 75 + Math.random() * 10;
    rainfall = Math.random() < 0.15 ? Math.random() * 10 : 0;
    condition = rainfall > 0 ? "Light Rain" : "Partly Cloudy";
  } else {
    // Post-monsoon Oct–Nov
    baseTemp = 28 + Math.random() * 5;
    humidity = 70 + Math.random() * 10;
    rainfall = Math.random() < 0.1 ? Math.random() * 8 : 0;
    condition = rainfall > 0 ? "Light Rain" : "Mostly Clear";
  }

  // Temperature varies by time of day
  const hourAdjust =
    hour >= 12 && hour <= 15 ? 2 : hour >= 0 && hour <= 5 ? -3 : 0;
  const temperature = Math.round((baseTemp + hourAdjust) * 10) / 10;
  const feelsLike =
    Math.round((temperature + (humidity - 70) * 0.05) * 10) / 10;

  return {
    temperature,
    humidity: Math.round(humidity),
    rainfall: Math.round(rainfall * 10) / 10,
    condition,
    feelsLike,
    windSpeed: Math.round((10 + Math.random() * 25) * 10) / 10,
    visibility: rainfall > 30 ? 3 : rainfall > 10 ? 7 : 10,
  };
}
