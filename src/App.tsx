/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, onSnapshot, setDoc, collection, query, orderBy, limit } from "firebase/firestore";
import axios from "axios";
import { auth, db, logout, OperationType, handleFirestoreError } from "./firebase";
import { Header } from "./components/Header";
import { WeatherCard } from "./components/WeatherCard";
import { PolicyCard } from "./components/PolicyCard";
import { TelemetryCard } from "./components/TelemetryCard";
import { ClaimHistory } from "./components/ClaimHistory";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { EmailSignUp } from "./components/EmailSignUp";
import { GigOnboarding, OnboardingData } from "./components/GigOnboarding";
import { Shield, Loader2, RefreshCw, History as HistoryIcon } from "lucide-react";
import { getDoc } from "firebase/firestore";

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<any>(null);
  const [policy, setPolicy] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [location, setLocation] = useState({ lat: 19.1136, lng: 72.8697 }); // Default: Andheri East, Mumbai
  const [address, setAddress] = useState("Andheri East, Mumbai");
  const [telemetry, setTelemetry] = useState({ speed: 0, distance: 0, deliveries: 0 });
  const [checkingTrigger, setCheckingTrigger] = useState(false);
  const [activeView, setActiveView] = useState<"shield" | "sync" | "history">("shield");
  const [showPolicyDetails, setShowPolicyDetails] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activationStep, setActivationStep] = useState<1 | 2>(1);
  const [isActivating, setIsActivating] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [quote, setQuote] = useState<{ premium: number; coverageAmount: number } | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [profileData, setProfileData] = useState<OnboardingData | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u && u.emailVerified) {
        setUser(u);
        // Check if user profile exists in Firestore
        const userRef = doc(db, "users", u.uid);
        try {
          const userDoc = await getDoc(userRef);
          const exists = userDoc.exists();
          setHasProfile(exists);
          if (exists) {
            setProfileData(userDoc.data() as OnboardingData);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${u.uid}`);
          setHasProfile(false);
        }
      } else {
        setUser(null);
        setHasProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Geolocation
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    }
  }, []);

  // Firestore Listeners (Policies & Claims)
  useEffect(() => {
    if (!user) return;

    // Policy Listener
    const policyQuery = query(collection(db, "users", user.uid, "policies"), limit(1));
    const unsubscribePolicy = onSnapshot(policyQuery, (snapshot) => {
      if (!snapshot.empty) {
        setPolicy(snapshot.docs[0].data());
      } else {
        setPolicy(null);
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/policies`));

    // Claims Listener
    const claimsQuery = query(collection(db, "users", user.uid, "claims"), orderBy("timestamp", "desc"), limit(5));
    const unsubscribeClaims = onSnapshot(claimsQuery, (snapshot) => {
      setClaims(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/claims`));

    return () => {
      unsubscribePolicy();
      unsubscribeClaims();
    };
  }, [user]);

  // Weather Polling
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await axios.get("/api/weather", {
          params: { lat: location.lat, lon: location.lng }
        });
        setWeather(res.data);
      } catch (error) {
        console.error("Failed to fetch weather", error);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 60000); // Every minute
    return () => clearInterval(interval);
  }, [location]);

  // Simulated Telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        speed: Math.floor(Math.random() * 40) + 10,
        distance: Number((prev.distance + 0.1).toFixed(1)),
        deliveries: prev.deliveries + (Math.random() > 0.98 ? 1 : 0)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckTrigger = async () => {
    if (!user || !policy) return;
    setCheckingTrigger(true);
    try {
      const res = await axios.post("/api/check-trigger", {
        userId: user.uid,
        lat: location.lat,
        lon: location.lng,
        policyId: "weekly_shield"
      });

      if (res.data.triggered) {
        // Log claim in Firestore
        const path = `users/${user.uid}/claims`;
        try {
          const claimRef = doc(collection(db, "users", user.uid, "claims"));
          await setDoc(claimRef, {
            userId: user.uid,
            policyId: "weekly_shield",
            event: res.data.reason,
            payoutAmount: res.data.payout.amount,
            status: "completed",
            timestamp: new Date().toISOString(),
            razorpayTransferId: res.data.payout.id
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, path);
        }
      }
    } catch (error) {
      console.error("Trigger check failed", error);
    } finally {
      setCheckingTrigger(false);
    }
  };

  const handleActivatePolicy = async () => {
    if (!user) return;
    setIsActivating(true);
    const mockPolicy = {
      userId: user.uid,
      status: "active",
      premiumPaid: quote?.premium || 50,
      maxPayout: quote?.coverageAmount || 2400,
      coverageStart: new Date().toISOString(),
      coverageEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      risks: ["Heavy Rain", "Heatwave", "Severe AQI"]
    };
    try {
      await setDoc(doc(db, "users", user.uid, "policies", "weekly_shield"), mockPolicy);
      setShowActivationModal(false);
      setActivationStep(1);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/policies/weekly_shield`);
    } finally {
      setIsActivating(false);
    }
  };

  const handleLogin = async () => {
    // loginWithGoogle is removed in favor of PhoneSignIn component
  };

  const handleProfileSubmit = async (data: OnboardingData) => {
    if (!user) return;
    setIsSavingProfile(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        ...data,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });
      setProfileData(data);
      setHasProfile(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const fetchQuote = async () => {
    try {
      const res = await axios.post("/api/quote", {
        city: address.includes("Delhi") ? "Delhi" : "Mumbai",
        activeDays: telemetry.deliveries > 0 ? 22 : 15, // Mocking active days based on deliveries for demo
        dailyIncome: 800
      });
      setQuote(res.data);
    } catch (error) {
      console.error("Quote fetch error:", error);
    }
  };

  useEffect(() => {
    if (showActivationModal) {
      fetchQuote();
    }
  }, [showActivationModal]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <EmailSignUp onSuccess={() => {}} />;
  }

  if (hasProfile === false) {
    return <GigOnboarding onSubmit={handleProfileSubmit} loading={isSavingProfile} />;
  }

  const status = weather?.rawAqi > 150 || weather?.rain > 20 ? "DANGER" : "SAFE";

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-950 pb-24">
        <Header 
          user={{
            displayName: profileData?.platform || user.email || "Gig Worker",
            photoURL: null
          }} 
          location={address} 
          status={status} 
        />

        <main className="p-4 space-y-4 max-w-md mx-auto">
          {activeView === "shield" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Action Button */}
              <button
                onClick={handleCheckTrigger}
                disabled={checkingTrigger}
                className="w-full py-4 bg-teal-500 text-slate-900 font-black rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-teal-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {checkingTrigger ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <RefreshCw className="w-5 h-5" />
                )}
                {checkingTrigger ? "CHECKING CONDITIONS..." : "VERIFY TRIGGER STATUS"}
              </button>

              <WeatherCard data={weather} />
              <PolicyCard 
                policy={policy} 
                onActivate={() => setShowActivationModal(true)}
                onViewDetails={() => setShowPolicyDetails(true)}
              />
            </div>
          )}

          {activeView === "sync" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-black text-white tracking-tight px-2">Live Telemetry</h2>
              <TelemetryCard
                speed={telemetry.speed}
                distance={telemetry.distance}
                deliveries={telemetry.deliveries}
                coords={location}
              />
              <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Device Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">GPS Signal</span>
                    <span className="text-teal-500 font-bold">EXCELLENT</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">OBD-II Link</span>
                    <span className="text-teal-500 font-bold">CONNECTED</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Last Sync</span>
                    <span className="text-slate-500">Just now</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === "history" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-black text-white tracking-tight px-2">Claims History</h2>
              <ClaimHistory claims={claims} />
            </div>
          )}

          <button
            onClick={logout}
            className="w-full py-3 mt-8 text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-rose-500 transition-colors"
          >
            Sign Out Session
          </button>
        </main>

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800 flex justify-around items-center z-50">
          <button
            onClick={() => setActiveView("shield")}
            className={`flex flex-col items-center gap-1 transition-colors ${activeView === "shield" ? "text-teal-500" : "text-slate-500"}`}
          >
            <Shield className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase">Shield</span>
          </button>
          <button
            onClick={() => setActiveView("sync")}
            className={`flex flex-col items-center gap-1 transition-colors ${activeView === "sync" ? "text-teal-500" : "text-slate-500"}`}
          >
            <RefreshCw className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase">Sync</span>
          </button>
          <button
            onClick={() => setActiveView("history")}
            className={`flex flex-col items-center gap-1 transition-colors ${activeView === "history" ? "text-teal-500" : "text-slate-500"}`}
          >
            <History className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase">History</span>
          </button>
        </nav>

        {/* Policy Details Modal */}
        {showPolicyDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Policy Details</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Weekly Shield v1.0</p>
                </div>
                <button 
                  onClick={() => setShowPolicyDetails(false)}
                  className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <Shield className="w-5 h-5 rotate-180" />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400 text-xs">Policy ID</span>
                  <span className="text-white text-xs font-mono">GS-W-88291</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400 text-xs">Coverage Type</span>
                  <span className="text-white text-xs">Parametric Weather</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400 text-xs">Trigger Thresholds</span>
                  <div className="text-right">
                    <p className="text-white text-[10px]">Rain &gt; 20mm/h</p>
                    <p className="text-white text-[10px]">PM2.5 &gt; 150</p>
                    <p className="text-white text-[10px]">Temp &gt; 45°C</p>
                  </div>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400 text-xs">Payout Method</span>
                  <span className="text-teal-500 text-xs font-bold">Instant Razorpay</span>
                </div>
              </div>

              <button
                onClick={() => setShowPolicyDetails(false)}
                className="w-full py-4 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-700 transition-all active:scale-95"
              >
                CLOSE DETAILS
              </button>
            </div>
          </div>
        )}

        {/* Policy Activation Modal */}
        {showActivationModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-300">
              {activationStep === 1 ? (
                <div className="animate-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center mb-4">
                      <Shield className="w-8 h-8 text-teal-500" />
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight">Step 1: Review Coverage</h3>
                    <p className="text-sm text-slate-400 mt-2">Verify your parametric triggers and payout limits.</p>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Automatic Triggers</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-white">Heavy Rain</span>
                          <span className="text-[10px] text-teal-500 font-bold">&gt; 20mm/h</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-white">Heatwave</span>
                          <span className="text-[10px] text-teal-500 font-bold">&gt; 45°C</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-white">Severe AQI</span>
                          <span className="text-[10px] text-teal-500 font-bold">&gt; 150 PM2.5</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Premium</p>
                        <p className="text-xl font-black text-white">₹{quote?.premium || "..."}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Max Payout</p>
                        <p className="text-xl font-black text-teal-500">₹{quote?.coverageAmount || "..."}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowActivationModal(false)}
                      className="flex-1 py-4 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-700 transition-all active:scale-95"
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={() => setActivationStep(2)}
                      className="flex-[2] py-4 bg-teal-500 text-slate-900 font-black rounded-2xl hover:bg-teal-400 transition-all active:scale-95 shadow-lg shadow-teal-500/20"
                    >
                      NEXT: PAYMENT
                    </button>
                  </div>
                </div>
              ) : (
                <div className="animate-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center mb-4">
                      <Shield className="w-8 h-8 text-teal-500" />
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight">Step 2: Payment</h3>
                    <p className="text-sm text-slate-400 mt-2">Select your preferred payment method for the ₹50 premium.</p>
                  </div>

                  <div className="space-y-3 mb-8">
                    <button className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-teal-500 flex items-center gap-4 text-left">
                      <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                        <span className="text-teal-500 font-black text-xs">UPI</span>
                      </div>
                      <div>
                        <p className="text-xs font-black text-white">Google Pay / PhonePe</p>
                        <p className="text-[10px] text-slate-500">Instant verification</p>
                      </div>
                    </button>
                    <button className="w-full p-4 bg-slate-800 rounded-2xl border border-slate-700 flex items-center gap-4 text-left opacity-50 cursor-not-allowed">
                      <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                        <span className="text-slate-500 font-black text-xs">CARD</span>
                      </div>
                      <div>
                        <p className="text-xs font-black text-white">Credit / Debit Card</p>
                        <p className="text-[10px] text-slate-500">Coming soon</p>
                      </div>
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setActivationStep(1)}
                      disabled={isActivating}
                      className="flex-1 py-4 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-50"
                    >
                      BACK
                    </button>
                    <button
                      onClick={handleActivatePolicy}
                      disabled={isActivating}
                      className="flex-[2] py-4 bg-teal-500 text-slate-900 font-black rounded-2xl hover:bg-teal-400 transition-all active:scale-95 shadow-lg shadow-teal-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isActivating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          PROCESSING...
                        </>
                      ) : (
                        `CONFIRM & PAY ₹${quote?.premium || "50"}`
                      )}
                    </button>
                  </div>
                </div>
              )}
              <p className="text-[10px] text-slate-500 text-center mt-4 uppercase font-black tracking-widest">Secure Checkout</p>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

function History({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

