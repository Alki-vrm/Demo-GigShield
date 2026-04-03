/**
 * GigShield - Core Actuarial & Pricing Engine
 * Based on Phase 1 Hackathon Parametric Models
 */

export const TARGET_BCR = 0.65;       // Burning Cost Rate: 65% goes to payouts (Target: 0.55-0.70)
export const MIN_WEEKLY_PREMIUM = 20; // Slide C: Target range minimum
export const MAX_WEEKLY_PREMIUM = 50; // Slide C: Target range maximum
export const MAX_PAYOUT_CAP = 2400;   // UI Prototype: Max payout limit

/**
 * 1. PREMIUM CALCULATION (Underwriting)
 * Calculates the weekly auto-deducted premium for a gig worker.
 * @param triggerProbability - Historical chance of event (e.g., 0.05 for 5%)
 * @param avgDailyIncomeLost - Worker's daily earnings at risk (e.g., 800)
 * @param cityMultiplier - Ward-level risk modifier (e.g., Delhi = 1.2, Mumbai = 1.0)
 * @param activeDays - Days worker was active in last 30 days
 * @returns The calculated weekly premium in INR
 */
export function calculateWeeklyPremium(
  triggerProbability: number,
  avgDailyIncomeLost: number,
  cityMultiplier: number,
  activeDays: number
): number {
  const daysExposed = 7; // Weekly policy

  // Base expected loss
  const basePremium = triggerProbability * avgDailyIncomeLost * daysExposed;

  // Slide A: Underwriting Tier Adjustments
  let tierMultiplier = 1.0;
  if (activeDays >= 20) {
    tierMultiplier = 0.9; // 10% discount for highly active full-time gig workers
  } else if (activeDays < 5) {
    tierMultiplier = 1.2; // 20% penalty/higher tier for casual workers
  }

  // Apply risk adjusters
  const adjustedLoss = basePremium * cityMultiplier * tierMultiplier;

  // Slide D: Apply Actuarial Margin (Target BCR)
  let finalPremium = adjustedLoss / TARGET_BCR;

  // Slide C: Enforce Target Range Limits
  if (finalPremium < MIN_WEEKLY_PREMIUM) finalPremium = MIN_WEEKLY_PREMIUM;
  if (finalPremium > MAX_WEEKLY_PREMIUM) finalPremium = MAX_WEEKLY_PREMIUM;

  return Math.round(finalPremium);
}

/**
 * 2. PAYOUT CALCULATION (Settlement)
 * Calculates the instant transfer amount when a trigger is confirmed.
 * @param fixedDailyAmount - Pre-agreed daily payout amount (e.g., 800)
 * @param triggerDays - Number of days the weather/AQI threshold was breached
 * @returns Total payout amount in INR
 */
export function calculateSettlementPayout(fixedDailyAmount: number, triggerDays: number): number {
  // Settlement Slide: Fixed amount per day * number of trigger days
  let totalPayout = fixedDailyAmount * triggerDays;

  // Enforce platform limits to prevent bankruptcy in stress scenarios (Slide D)
  if (totalPayout > MAX_PAYOUT_CAP) {
    totalPayout = MAX_PAYOUT_CAP;
  }

  return totalPayout;
}
