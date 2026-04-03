import { useMemo } from "react";
import IncidentsCard from "../components/cards/IncidentsCard";
import JourneyPlannerCard from "../components/cards/JourneyPlannerCard";
import LiveTrainsCard from "../components/cards/LiveTrainsCard";
import MLPredictionCard from "../components/cards/MLPredictionCard";
import SOSCard from "../components/cards/SOSCard";
import TPSICard from "../components/cards/TPSICard";
import WeatherCard from "../components/cards/WeatherCard";
import { useWeatherCache } from "../hooks/useBackend";
import { getSimulatedMumbaiWeather } from "../utils/weatherSimulator";

export default function Dashboard() {
  const { data: weatherCache } = useWeatherCache();
  const simWeather = useMemo(() => getSimulatedMumbaiWeather(), []);

  const weatherData = weatherCache ?? {
    rainfall: simWeather.rainfall,
    temperature: simWeather.temperature,
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 page-fade-in">
      {/* Row 1: ML Prediction + Journey Planner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MLPredictionCard weather={weatherData} />
        </div>
        <div className="lg:col-span-1">
          <JourneyPlannerCard weather={weatherData} />
        </div>
      </div>

      {/* Row 2: Live Trains + TPSI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <LiveTrainsCard />
        </div>
        <div className="lg:col-span-1">
          <TPSICard />
        </div>
      </div>

      {/* Row 3: Weather + Incidents + SOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <WeatherCard />
        <IncidentsCard />
        <SOSCard />
      </div>

      {/* Footer */}
      <footer className="pt-4 border-t border-white/5 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="text-teal hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
