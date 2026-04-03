import { Cloud, Droplets, Wind, Thermometer, AlertCircle, CheckCircle2 } from "lucide-react";

interface WeatherData {
  temp: number;
  condition: string;
  rain: number;
  windSpeed: number;
  humidity: number;
  aqi: number;
  rawAqi: number;
  isMock?: boolean;
}

export function WeatherCard({ data }: { data: WeatherData | null }) {
  if (!data) return (
    <div className="p-6 bg-slate-800 rounded-2xl animate-pulse h-48 border border-slate-700" />
  );

  const isSafe = data.rawAqi < 150 && data.rain < 20 && data.temp < 45;

  return (
    <div className="p-5 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden relative">
      {data.isMock && (
        <div className="absolute top-0 left-0 right-0 bg-amber-500 text-slate-900 text-[8px] font-black uppercase tracking-widest py-1 text-center z-10">
          Demo Mode: Weather API Key Missing
        </div>
      )}
      <div className={`flex justify-between items-start mb-4 ${data.isMock ? "mt-4" : ""}`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Thermometer className="w-5 h-5 text-teal-400" />
            <span className="text-3xl font-black text-white">{Math.round(data.temp)}°C</span>
          </div>
          <p className="text-sm text-slate-400 font-medium">{data.condition}</p>
        </div>
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 flex flex-col items-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">AQI Index</span>
          <span className={`text-xl font-black ${data.rawAqi > 150 ? "text-rose-500" : "text-teal-400"}`}>
            {Math.round(data.rawAqi)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="flex flex-col items-center p-2 bg-slate-900/50 rounded-lg">
          <Droplets className="w-4 h-4 text-blue-400 mb-1" />
          <span className="text-xs font-bold text-white">{data.rain}mm</span>
          <span className="text-[8px] text-slate-500 uppercase">Rain</span>
        </div>
        <div className="flex flex-col items-center p-2 bg-slate-900/50 rounded-lg">
          <Wind className="w-4 h-4 text-slate-400 mb-1" />
          <span className="text-xs font-bold text-white">{data.windSpeed}km/h</span>
          <span className="text-[8px] text-slate-500 uppercase">Wind</span>
        </div>
        <div className="flex flex-col items-center p-2 bg-slate-900/50 rounded-lg">
          <Cloud className="w-4 h-4 text-slate-300 mb-1" />
          <span className="text-xs font-bold text-white">{data.humidity}%</span>
          <span className="text-[8px] text-slate-500 uppercase">Humid</span>
        </div>
      </div>

      <div className={`p-3 rounded-xl flex items-center gap-3 ${isSafe ? "bg-teal-500/10 border border-teal-500/20" : "bg-rose-500/10 border border-rose-500/20"}`}>
        {isSafe ? (
          <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
        )}
        <p className={`text-xs font-bold ${isSafe ? "text-teal-500" : "text-rose-500"}`}>
          {isSafe ? "Safe to Ride - Conditions are optimal" : "Hazardous Conditions - Claim Trigger Active"}
        </p>
      </div>
    </div>
  );
}
