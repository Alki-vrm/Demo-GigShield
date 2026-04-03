import { useState } from "react";
import { 
  auth, 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  signInWithEmailAndPassword,
  loginWithGoogle,
  sendPasswordResetEmail
} from "../firebase";
import { Shield, Mail, Lock, Loader2, ArrowRight, CheckCircle2, AlertCircle, LogIn } from "lucide-react";

interface EmailSignUpProps {
  onSuccess: () => void;
}

export function EmailSignUp({ onSuccess }: EmailSignUpProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [mode, setMode] = useState<"signup" | "signin" | "forgot">("signup");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      setVerificationSent(true);
    } catch (err: any) {
      console.error("Sign Up Error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please sign in instead.");
        setMode("signin");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (err.code === "auth/operation-not-allowed") {
        setError("Email/Password authentication is not enabled in the Firebase Console. Please enable it or use Google Sign-In.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a few minutes and try again.");
      } else {
        setError(err.message || "Failed to create account.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        setError("Please verify your email before continuing.");
        await sendEmailVerification(userCredential.user);
        setVerificationSent(true);
      } else {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Sign In Error:", err);
      if (err.code === "auth/operation-not-allowed") {
        setError("Email/Password authentication is not enabled in the Firebase Console. Please enable it or use Google Sign-In.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Access to this account has been temporarily disabled. Please try again later or reset your password.");
      } else {
        setError("Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setError("Password reset link sent! Please check your inbox.");
      setMode("signin");
    } catch (err: any) {
      console.error("Reset Error:", err);
      if (err.code === "auth/too-many-requests") {
        setError("Too many requests. Please wait a few minutes.");
      } else {
        setError("Failed to send reset email. Please check the email address.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      onSuccess();
    } catch (err: any) {
      console.error("Google Login Error:", err);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-20 h-20 bg-teal-500/20 rounded-3xl flex items-center justify-center mb-6 mx-auto">
            <CheckCircle2 className="w-12 h-12 text-teal-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-4">Verify your email</h2>
          <p className="text-slate-400 mb-8">
            We've sent a verification link to <span className="text-white font-bold">{email}</span>. 
            Please check your inbox and click the link to continue.
          </p>
          <button
            onClick={() => setVerificationSent(false)}
            className="w-full py-4 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-700 transition-all"
          >
            BACK TO SIGN IN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-20 h-20 bg-teal-500/20 rounded-3xl flex items-center justify-center mb-6">
            <Shield className="w-12 h-12 text-teal-400" />
          </div>
          <h1 className="text-4xl font-black text-white mb-3 tracking-tighter">
            {mode === "signup" ? "Create your GigShield Account" : mode === "signin" ? "Welcome Back" : "Reset Password"}
          </h1>
          <p className="text-slate-400 text-lg font-medium">
            {mode === "signup" ? "Secure your income in minutes." : mode === "signin" ? "Sign in to manage your shield." : "Enter your email to receive a reset link."}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
              {error.includes("already registered") && mode === "signup" && (
                <button 
                  onClick={() => { setMode("signin"); setError(null); }}
                  className="ml-8 text-teal-500 underline hover:text-teal-400 transition-colors"
                >
                  Switch to Sign In now →
                </button>
              )}
            </div>
          )}

          <form onSubmit={mode === "signup" ? handleSignUp : mode === "signin" ? handleSignIn : handleForgotPassword} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-800 border border-slate-700 text-white text-lg font-bold rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-teal-500 transition-colors placeholder:text-slate-600"
                  disabled={loading}
                />
              </div>
            </div>

            {mode !== "forgot" && (
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-800 border border-slate-700 text-white text-lg font-bold rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-teal-500 transition-colors placeholder:text-slate-600"
                    disabled={loading}
                  />
                </div>
                {mode === "signin" && (
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-[10px] font-black text-teal-500 uppercase tracking-widest hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-teal-400 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-teal-300 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-teal-500/20"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  {mode === "signup" ? "SIGN UP & VERIFY EMAIL" : mode === "signin" ? "SIGN IN" : "SEND RESET LINK"}
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

          <div className="mt-8 text-center">
            <button
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="text-slate-500 text-sm font-bold hover:text-teal-400 transition-colors"
            >
              {mode === "signup" 
                ? "Already have an account? Sign In" 
                : mode === "signin"
                ? "Don't have an account? Create one"
                : "Back to Sign In"}
            </button>
          </div>
        </div>
        
        <p className="text-center text-slate-600 text-[10px] mt-8 uppercase font-black tracking-widest">
          Secure • Encrypted • Parametric
        </p>
      </div>
    </div>
  );
}
