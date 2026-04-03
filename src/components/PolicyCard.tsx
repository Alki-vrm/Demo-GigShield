import { Shield, Zap, Info } from "lucide-react";

interface PolicyProps {
  policy: {
    status: string;
    premiumPaid: number;
    maxPayout: number;
    coverageEnd: string;
    risks: string[];
  } | null;
  onActivate?: () => void;
  onViewDetails?: () => void;
}

export function PolicyCard({ policy, onActivate, onViewDetails }: PolicyProps) {
  if (!policy) return (
    <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700 flex flex-col items-center justify-center text-center">
      <Shield className="w-12 h-12 text-slate-700 mb-3" />
      <h3 className="text-white font-bold mb-1">No Active Policy</h3>
      <p className="text-xs text-slate-500 mb-4">Protect your earnings from extreme weather.</p>
      <button 
        onClick={onActivate}
        className="w-full py-3 bg-teal-500 text-slate-900 font-black rounded-xl hover:bg-teal-400 transition-all active:scale-95"
      >
        ACTIVATE WEEKLY SHIELD
      </button>
    </div>
  );

  return (
    <div className="p-5 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
        <Zap className="w-6 h-6 text-teal-500 opacity-20" />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-teal-500/20 rounded-lg">
          <Shield className="w-5 h-5 text-teal-500" />
        </div>
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-tight">Weekly Policy</h3>
          <p className="text-[10px] text-teal-500 font-bold uppercase tracking-widest">Active Status</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
          <p className="text-[8px] text-slate-500 font-bold uppercase mb-1">Premium Paid</p>
          <p className="text-lg font-black text-white">₹{policy.premiumPaid}</p>
        </div>
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
          <p className="text-[8px] text-slate-500 font-bold uppercase mb-1">Max Payout</p>
          <p className="text-lg font-black text-teal-500">₹{policy.maxPayout}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-[8px] text-slate-500 font-bold uppercase mb-2">Covered Risks</p>
        <div className="flex flex-wrap gap-2">
          {policy.risks.map((risk) => (
            <span key={risk} className="px-2 py-1 bg-slate-900 text-slate-300 text-[9px] font-bold rounded-md border border-slate-700">
              {risk}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
        <div className="flex items-center gap-1 text-[10px] text-slate-500">
          <Info className="w-3 h-3" />
          <span>Ends {new Date(policy.coverageEnd).toLocaleDateString()}</span>
        </div>
        <button 
          onClick={onViewDetails}
          className="text-[10px] font-black text-teal-500 uppercase tracking-widest hover:underline"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
