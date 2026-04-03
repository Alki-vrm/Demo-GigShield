import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";
import { calculateWeeklyPremium, calculateSettlementPayout, MAX_PAYOUT_CAP } from "./src/lib/pricingEngine";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Thresholds
const AQI_THRESHOLD = 300;
const RAIN_THRESHOLD = 65; // mm in 4 hours (simulated)
const HEAT_THRESHOLD = 45; // Celsius

// Mock Razorpay Payout
async function initiateRazorpayPayout(userId: string, amount: number) {
  console.log(`[Razorpay] Initiating payout of ₹${amount} to user ${userId}`);
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  return {
    id: `payout_${Math.random().toString(36).substr(2, 9)}`,
    status: "processed",
    amount: amount,
    currency: "INR",
    recipient: userId,
    timestamp: new Date().toISOString()
  };
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Get current weather and AQI
app.get("/api/weather", async (req, res) => {
  const { lat, lon } = req.query;
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Latitude and longitude are required" });
  }

  // Check if API key is missing or is the placeholder from .env.example
  const isApiKeyMissing = !apiKey || apiKey === "MY_OPENWEATHER_API_KEY" || apiKey.trim() === "";

  if (isApiKeyMissing) {
    return res.json({
      temp: 28,
      condition: "Partly Cloudy",
      description: "scattered clouds",
      humidity: 65,
      windSpeed: 12,
      rain: 0,
      aqi: 2,
      rawAqi: 25,
      isMock: true
    });
  }

  try {
    // Current Weather
    const weatherRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: {
        lat,
        lon,
        appid: apiKey,
        units: "metric"
      }
    });

    // Air Pollution (AQI)
    const pollutionRes = await axios.get(`https://api.openweathermap.org/data/2.5/air_pollution`, {
      params: {
        lat,
        lon,
        appid: apiKey
      }
    });

    const weatherData = weatherRes.data;
    const pollutionData = pollutionRes.data;

    res.json({
      temp: weatherData.main.temp,
      condition: weatherData.weather[0].main,
      description: weatherData.weather[0].description,
      humidity: weatherData.main.humidity,
      windSpeed: weatherData.wind.speed,
      rain: weatherData.rain ? weatherData.rain["1h"] || 0 : 0,
      aqi: pollutionData.list[0].main.aqi,
      rawAqi: pollutionData.list[0].components.pm2_5,
      isMock: false
    });
  } catch (error) {
    console.error("Weather API error:", error);
    // Fallback mock data if API key is missing or invalid
    res.json({
      temp: 28,
      condition: "Partly Cloudy",
      description: "scattered clouds",
      humidity: 65,
      windSpeed: 12,
      rain: 0,
      aqi: 2,
      rawAqi: 25,
      isMock: true
    });
  }
});

// Pricing Quote Endpoint
app.post("/api/quote", (req, res) => {
  const { city, activeDays, dailyIncome } = req.body;

  // In a real app, you'd fetch this from a DB. We mock the probability for the demo.
  // Example: Delhi has a 4% chance of severe AQI this week.
  const historicalProbability = 0.04;
  const cityRiskWeight = city === "Delhi" ? 1.2 : 1.0;

  // Run the algorithm
  const premium = calculateWeeklyPremium(
    historicalProbability,
    dailyIncome || 800,
    cityRiskWeight,
    activeDays || 15
  );

  res.json({
    success: true,
    premium: premium,
    coverageAmount: MAX_PAYOUT_CAP,
    message: "Premium calculated successfully based on Micro-Grid Pricing Engine"
  });
});

// Check trigger and initiate payout
app.post("/api/check-trigger", async (req, res) => {
  const { userId, lat, lon, policyId } = req.body;
  const apiKey = process.env.OPENWEATHER_API_KEY;

  try {
    // Check if API key is missing or is the placeholder
    const isApiKeyMissing = !apiKey || apiKey === "MY_OPENWEATHER_API_KEY" || apiKey.trim() === "";

    let temp, rain, pm25;

    if (isApiKeyMissing) {
      // Use mock trigger data
      temp = 28;
      rain = 70; // Force a trigger breach for demo purposes
      pm25 = 200;
    } else {
      // Fetch live data
      const weatherRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: { lat, lon, appid: apiKey, units: "metric" }
      });
      const pollutionRes = await axios.get(`https://api.openweathermap.org/data/2.5/air_pollution`, {
        params: { lat, lon, appid: apiKey }
      });

      temp = weatherRes.data.main.temp;
      rain = weatherRes.data.rain ? weatherRes.data.rain["1h"] || 0 : 0;
      pm25 = pollutionRes.data.list[0].components.pm2_5;
    }

    let triggerBreached = false;
    let reason = "";

    if (pm25 > 150) { // Using PM2.5 > 150 as a trigger for "Severe Pollution"
      triggerBreached = true;
      reason = "Severe Air Pollution (PM2.5 > 150)";
    } else if (rain > 20) { // Using 20mm/h as a trigger for "Heavy Rain"
      triggerBreached = true;
      reason = "Heavy Rainfall (> 20mm/h)";
    } else if (temp > HEAT_THRESHOLD) {
      triggerBreached = true;
      reason = `Extreme Heatwave (> ${HEAT_THRESHOLD}°C)`;
    }

    if (triggerBreached) {
      const payoutAmount = calculateSettlementPayout(400, 1); // ₹400 per day payout, 1 day trigger
      const payout = await initiateRazorpayPayout(userId, payoutAmount);
      return res.json({
        triggered: true,
        reason,
        payout
      });
    }

    res.json({ triggered: false, message: "Conditions are safe. No trigger breached." });
  } catch (error) {
    console.error("Trigger check error:", error);
    res.status(500).json({ error: "Failed to check trigger" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GigShield Server running on http://localhost:${PORT}`);
  });
}

startServer();
