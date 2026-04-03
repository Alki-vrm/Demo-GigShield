import { MapPin, User, ShieldCheck } from "lucide-react";

interface HeaderProps {
  user: {
    displayName: string | null;
    photoURL: string | null;
  };
  location: string;
  status: "SAFE" | "WARNING" | "DANGER";
}

export function Header({ user, location, status }: HeaderProps) {
  const statusColors = {
    SAFE: "bg-teal-500 text-slate-900",
    WARNING: "bg-amber-500 text-slate-900",
    DANGER: "bg-rose-500 text-white",
  };

  return (
    <header className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="relative">
          {user.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border-2 border-slate-700" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700">
              <User className="w-6 h-6 text-slate-400" />
            </div>
          )}
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${statusColors[status].split(" ")[0]}`} />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white">{user.displayName || "Gig Worker"}</h1>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="w-3 h-3" />
            <span>{location}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${statusColors[status]}`}>
          {status}
        </div>
        <div className="flex items-center gap-1 mt-1">
          <ShieldCheck className="w-4 h-4 text-teal-500" />
          <span className="text-[10px] font-bold text-teal-500 tracking-tighter">GIGSHIELD ACTIVE</span>
        </div>
      </div>
    </header>
  );
}
