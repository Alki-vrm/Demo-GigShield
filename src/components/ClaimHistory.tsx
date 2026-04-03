import { History, CheckCircle2, Clock } from "lucide-react";

interface Claim {
  id: string;
  event: string;
  payoutAmount: number;
  status: string;
  timestamp: string;
}

export function ClaimHistory({ claims }: { claims: Claim[] }) {
  return (
    <div className="p-5 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-amber-500/20 rounded-lg">
          <History className="w-5 h-5 text-amber-500" />
        </div>
        <h3 className="text-sm font-black text-white uppercase tracking-tight">Claim History</h3>
      </div>

      {claims.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-xs text-slate-500 font-medium">No claims recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {claims.map((claim) => (
            <div key={claim.id} className="p-3 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-lg">
                  {claim.status === "completed" ? (
                    <CheckCircle2 className="w-4 h-4 text-teal-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{claim.event}</p>
                  <p className="text-[10px] text-slate-500">{new Date(claim.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-teal-500">+₹{claim.payoutAmount}</p>
                <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">{claim.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
