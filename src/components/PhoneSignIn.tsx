import { useState, useEffect, useRef } from "react";
import { 
  auth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  loginWithGoogle
} from "../firebase";
import { Shield, Phone, MessageSquare, Loader2, ArrowRight, LogIn } from "lucide-react";

interface PhoneSignInProps {
  onSuccess: (uid: string) => void;
}

export function PhoneSignIn({ onSuccess }: PhoneSignInProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    // Initialize recaptcha when component mounts
    if (!recaptchaVerifier.current) {
      try {
        recaptchaVerifier.current = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: () => {
            // reCAPTCHA solved
          },
          "expired-callback": () => {
            // Response expired. Ask user to solve reCAPTCHA again.
            if (recaptchaVerifier.current) {
              recaptchaVerifier.current.clear();
              recaptchaVerifier.current = null;
            }
          }
        });
      } catch (err) {
        console.error("Recaptcha initialization error:", err);
      }
    }

    return () => {
      if (recaptchaVerifier.current) {
        try {
          recaptchaVerifier.current.clear();
        } catch (e) {
          console.error("Error clearing recaptcha:", e);
        }
        recaptchaVerifier.current = null;
      }
    };
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Format number for India (+91) - assuming India based on context
      const formattedNumber = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber}`;
      
      if (!recaptchaVerifier.current) {
        throw new Error("Recaptcha not initialized");
      }

      const result = await signInWithPhoneNumber(auth, formattedNumber, recaptchaVerifier.current);
      setConfirmationResult(result);
      setStep("otp");
    } catch (err: any) {
      console.error("OTP Send Error:", err);
      if (err.code === "auth/operation-not-allowed") {
        setError("Phone authentication is not enabled in the Firebase Console. Please enable it or use Google Sign-In.");
      } else {
        setError(err.message || "Failed to send OTP. Please try again.");
      }
      
      // Reset recaptcha on error
      if (recaptchaVerifier.current) {
        try {
          recaptchaVerifier.current.clear();
        } catch (e) {
          // Ignore clear errors
        }
        recaptchaVerifier.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!confirmationResult) throw new Error("No confirmation result found");
      const result = await confirmationResult.confirm(otp);
      if (result.user) {
        onSuccess(result.user.uid);
      }
    } catch (err: any) {
      console.error("OTP Verify Error:", err);
      setError("Invalid OTP. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loginWithGoogle();
      if (result.user) {
        onSuccess(result.user.uid);
      }
    } catch (err: any) {
      console.error("Google Login Error:", err);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-20 h-20 bg-teal-500/20 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
            <Shield className="w-12 h-12 text-teal-400" />
          </div>
          <h1 className="text-4xl font-black text-white mb-3 tracking-tighter">GigShield</h1>
          <p className="text-slate-400 text-lg font-medium">Protect your income, instantly.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}

          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-bold text-sm">+91</span>
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="Enter 10 digits"
                    className="w-full bg-slate-800 border border-slate-700 text-white text-lg font-bold rounded-2xl py-4 pl-14 pr-4 focus:outline-none focus:border-teal-500 transition-colors placeholder:text-slate-600"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phoneNumber.length < 10}
                className="w-full py-4 bg-teal-400 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-teal-300 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-teal-500/20"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    GET OTP
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                  <span className="bg-slate-900 px-4 text-slate-500">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-4 bg-slate-800 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50 shadow-xl border border-slate-700"
              >
                <LogIn className="w-5 h-5" />
                SIGN IN WITH GOOGLE
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                  Enter 6-Digit OTP
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MessageSquare className="w-5 h-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="w-full bg-slate-800 border border-slate-700 text-white text-2xl font-black tracking-[0.5em] text-center rounded-2xl py-4 focus:outline-none focus:border-teal-500 transition-colors placeholder:text-slate-600"
                    disabled={loading}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-3 text-center">
                  Sent to +91 {phoneNumber} • <button type="button" onClick={() => setStep("phone")} className="text-teal-500 font-bold hover:underline">Change</button>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-4 bg-teal-400 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-teal-300 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-teal-500/20"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  "VERIFY & CONTINUE"
                )}
              </button>
            </form>
          )}
        </div>
        
        <div id="recaptcha-container"></div>
        
        <p className="text-center text-slate-600 text-[10px] mt-8 uppercase font-black tracking-widest">
          Secure • Encrypted • Parametric
        </p>
      </div>
    </div>
  );
}
