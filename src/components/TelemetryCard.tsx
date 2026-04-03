import { Navigation, Gauge, Route, Package } from "lucide-react";

interface TelemetryProps {
  speed: number;
  distance: number;
  deliveries: number;
  coords: { lat: number; lng: number };
}

export function TelemetryCard({ speed, distance, deliveries, coords }: TelemetryProps) {
  return (
    <div className="p-5 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Navigation className="w-5 h-5 text-blue-500" />
        </div>
        <h3 className="text-sm font-black text-white uppercase tracking-tight">Live Telemetry</h3>
      </div>

      <div className="aspect-video bg-slate-900 rounded-xl mb-4 border border-slate-700 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="w-full h-full" style={{ backgroundImage: "radial-gradient(#2DD4BF 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        </div>
        <div className="text-center z-10">
          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Current Coordinates</p>
          <p className="text-xs font-mono text-teal-500">{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</p>
        </div>
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-slate-800/80 rounded text-[8px] font-mono text-slate-400 border border-slate-700">
          GPS: SIGNAL_STABLE
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 flex flex-col items-center">
          <Gauge className="w-4 h-4 text-slate-500 mb-1" />
          <span className="text-sm font-black text-white">{speed}</span>
          <span className="text-[8px] text-slate-500 uppercase">km/h</span>
        </div>
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 flex flex-col items-center">
          <Route className="w-4 h-4 text-slate-500 mb-1" />
          <span className="text-sm font-black text-white">{distance}</span>
          <span className="text-[8px] text-slate-500 uppercase">km</span>
        </div>
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 flex flex-col items-center">
          <Package className="w-4 h-4 text-slate-500 mb-1" />
          <span className="text-sm font-black text-white">{deliveries}</span>
          <span className="text-[8px] text-slate-500 uppercase">Orders</span>
        </div>
      </div>
    </div>
  );
}
