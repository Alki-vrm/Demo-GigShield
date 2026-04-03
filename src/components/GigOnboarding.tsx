import { useState } from "react";
import { 
  Shield, 
  Phone, 
  IndianRupee, 
  Briefcase, 
  Mail, 
  TrendingUp, 
  ArrowRight, 
  ArrowLeft, 
  Loader2,
  CheckCircle2
} from "lucide-react";

interface GigOnboardingProps {
  onSubmit: (data: OnboardingData) => void;
  loading?: boolean;
}

export interface OnboardingData {
  phoneNumber: string;
  targetPremium: number;
  platform: string;
  companyEmail?: string;
  dailySalary: number;
}

const PLATFORMS = ["Zomato", "Swiggy", "Zepto", "Uber", "Rapido", "Other"];

export function GigOnboarding({ onSubmit, loading = false }: GigOnboardingProps) {
  const [step, setStep] = useState<2 | 3>(2);
  const [formData, setFormData] = useState<OnboardingData>({
    phoneNumber: "",
    targetPremium: 30,
    platform: "Zomato",
    companyEmail: "",
    dailySalary: 800
  });

  const handleNext = () => setStep(3);
  const handleBack = () => setStep(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 2) {
      handleNext();
    } else {
      onSubmit(formData);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6">
      <div className="w-full max-w-md">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? "bg-teal-400" : "bg-slate-800"}`} />
          <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 3 ? "bg-teal-400" : "bg-slate-800"}`} />
        </div>

        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center mb-4">
            <Shield className="w-10 h-10 text-teal-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tighter">
            {step === 2 ? "Welcome! Let's secure your account." : "Tell us about your work."}
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            {step === 2 ? "Basic details to get you started." : "This helps us tailor your coverage."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          {step === 2 ? (
            <>
              {/* Step 2: Personal Details */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="w-5 h-5 text-slate-500" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, "") })}
                    placeholder="Enter mobile number"
                    className="w-full bg-slate-800 border border-slate-700 text-white text-lg font-bold rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-teal-500 transition-colors placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2 ml-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Target Weekly Premium
                  </label>
                  <span className="text-teal-400 font-black text-lg">₹{formData.targetPremium}</span>
                </div>
                <div className="relative pt-2">
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="5"
                    value={formData.targetPremium}
                    onChange={(e) => setFormData({ ...formData, targetPremium: parseInt(e.target.value) })}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Min: ₹10</span>
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Max: ₹200</span>
                  </div>
                </div>
                <p className="mt-4 text-[10px] text-slate-500 font-medium leading-relaxed italic">
                  "How much are you willing to pay weekly? e.g., ₹30"
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-teal-400 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-teal-300 active:scale-95 transition-all shadow-lg shadow-teal-500/20"
              >
                NEXT STEP
                <ArrowRight className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              {/* Step 3: Job Details */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                  Company / Platform
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PLATFORMS.map(platform => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => setFormData({ ...formData, platform })}
                      className={`py-3 px-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border ${
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

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                  Company Email ID (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-slate-500" />
                  </div>
                  <input
                    type="email"
                    value={formData.companyEmail}
                    onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                    placeholder="name@company.com"
                    className="w-full bg-slate-800 border border-slate-700 text-white text-lg font-bold rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-teal-500 transition-colors placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                  Average Daily Earnings
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <IndianRupee className="w-5 h-5 text-slate-500" />
                  </div>
                  <input
                    type="number"
                    required
                    value={formData.dailySalary}
                    onChange={(e) => setFormData({ ...formData, dailySalary: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 800"
                    className="w-full bg-slate-800 border border-slate-700 text-white text-lg font-bold rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-teal-500 transition-colors placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-4 bg-slate-800 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-700 transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                  BACK
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-4 bg-teal-400 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-teal-300 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-teal-500/20"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      CALCULATE PREMIUM
                      <TrendingUp className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
