import { Cloud, Droplets, Eye, Thermometer, Wind } from "lucide-react";
import { useEffect, useState } from "react";
import type { WeatherData } from "../../backend.d";
import { useWeatherCache } from "../../hooks/useBackend";
import {
  type SimulatedWeather,
  getSimulatedMumbaiWeather,
} from "../../utils/weatherSimulator";

function getWeatherIcon(condition: string): string {
  if (condition.includes("Heavy Rain")) return "🌧️";
  if (condition.includes("Moderate Rain") || condition.includes("Light Rain"))
    return "🌦️";
  if (condition.includes("Cloudy")) return "☁️";
  if (condition.includes("Clear")) return "☀️";
  return "🌤️";
}

export default function WeatherCard() {
  const { data: backendWeather } = useWeatherCache();
  const [simWeather, setSimWeather] = useState<SimulatedWeather | null>(null);

  useEffect(() => {
    setSimWeather(getSimulatedMumbaiWeather());
  }, []);

  const weather:
    | (WeatherData & {
        feelsLike?: number;
        windSpeed?: number;
        visibility?: number;
      })
    | null =
    backendWeather ??
    (simWeather
      ? {
          temperature: simWeather.temperature,
          humidity: simWeather.humidity,
          rainfall: simWeather.rainfall,
          condition: simWeather.condition,
          timestamp: BigInt(Date.now()),
          feelsLike: simWeather.feelsLike,
          windSpeed: simWeather.windSpeed,
          visibility: simWeather.visibility,
        }
      : null);

  if (!weather) {
    return (
      <div
        className="card-surface p-5 flex items-center justify-center min-h-[140px]"
        data-ocid="weather.card"
      >
        <div className="h-8 w-8 rounded-full bg-white/10 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="card-surface p-5" data-ocid="weather.card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Mumbai Weather
          </h3>
          <p className="text-xs text-muted-foreground">Live conditions</p>
        </div>
        <span className="text-3xl">{getWeatherIcon(weather.condition)}</span>
      </div>

      <div className="mb-3">
        <div className="text-3xl font-bold text-foreground">
          {weather.temperature}°C
        </div>
        <div className="text-sm text-muted-foreground">{weather.condition}</div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Droplets className="h-3 w-3 text-blue-400" />
          <span>{weather.humidity}% humidity</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Cloud className="h-3 w-3 text-teal" />
          <span>{weather.rainfall}mm rain</span>
        </div>
        {(weather as any).windSpeed && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Wind className="h-3 w-3 text-purple-400" />
            <span>{(weather as any).windSpeed} km/h</span>
          </div>
        )}
        {(weather as any).feelsLike && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Thermometer className="h-3 w-3 text-orange-400" />
            <span>Feels {(weather as any).feelsLike}°C</span>
          </div>
        )}
      </div>

      {weather.rainfall > 20 && (
        <div
          className="mt-3 rounded-md px-2 py-1.5 text-xs flex items-center gap-1.5"
          style={{
            background: "oklch(0.57 0.22 27 / 10%)",
            border: "1px solid oklch(0.57 0.22 27 / 25%)",
          }}
        >
          <span>⚠️</span>
          <span className="text-red-300">
            Heavy rain may cause significant train delays
          </span>
        </div>
      )}
    </div>
  );
}
