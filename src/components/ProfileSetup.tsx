import { useState } from "react";
import { Shield, MapPin, Briefcase, IndianRupee, Calendar, Loader2, ArrowRight } from "lucide-react";

interface ProfileSetupProps {
  onSubmit: (data: ProfileData) => void;
  loading?: boolean;
}

export interface ProfileData {
  name: string;
  city: string;
  platform: string;
  dailyEarnings: number;
  activeDays: number;
}

const CITIES = ["Mumbai", "Delhi", "Bengaluru"];
const PLATFORMS = ["Zomato", "Swiggy", "Zepto"];

export function ProfileSetup({ onSubmit, loading = false }: ProfileSetupProps) {
  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    city: "Mumbai",
    platform: "Zomato",
    dailyEarnings: 800,
    activeDays: 22
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    onSubmit(formData);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center mb-4">
            <Shield className="w-10 h-10 text-teal-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tighter">Gig Profile</h1>
          <p className="text-slate-400 text-sm font-medium">Quick setup to calculate your premium.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          {/* Name */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
                className="w-full bg-slate-800 border border-slate-700 text-white text-lg font-bold rounded-2xl py-4 px-4 focus:outline-none focus:border-teal-500 transition-colors placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
              City
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MapPin className="w-5 h-5 text-slate-500" />
              </div>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white text-lg font-bold rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-teal-500 transition-colors appearance-none"
              >
                {CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Platform Pills */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
              Primary Platform
            </label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(platform => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => setFormData({ ...formData, platform })}
                  className={`flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all border ${
                    formData.platform === platform 
                      ? "bg-teal-400 text-slate-950 border-teal-400 shadow-lg shadow-teal-500/20" 
                      : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600"
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Earnings & Active Days */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                Daily Earnings
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <IndianRupee className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  type="number"
                  required
                  value={formData.dailyEarnings}
                  onChange={(e) => setFormData({ ...formData, dailyEarnings: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-lg font-bold rounded-2xl py-4 pl-10 pr-4 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                Active Days
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Calendar className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  type="number"
                  required
                  min="1"
                  max="30"
                  value={formData.activeDays}
                  onChange={(e) => setFormData({ ...formData, activeDays: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-lg font-bold rounded-2xl py-4 pl-10 pr-4 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.name}
            className="w-full py-4 bg-teal-400 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-teal-300 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-teal-500/20"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                CALCULATE MY PREMIUM
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
