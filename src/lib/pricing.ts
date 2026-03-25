// lib/pricing.ts

export type RingConfig = {
  shankId: string;
  headId: string;
  shape: string;
  carat: string;
  metalId: string;
};

let pricingCache: any = null;

/**
 * Load pricing JSON from /public
 * MUST be accessible via browser directly
 * http://localhost:3000/pricing/pricing.json
 */
export async function loadPricing() {
  if (pricingCache) return pricingCache;

  const res = await fetch("/pricing/pricing.json");

  if (!res.ok) {
    throw new Error("❌ pricing.json not found or failed to load");
  }

  pricingCache = await res.json();
  return pricingCache;
}

/**
 * Core price calculation
 * All nulls are safely handled
 */
export function calculatePrice(
  pricing: any,
  config: RingConfig,
  goldRate24k: number
) {
  if (!pricing) return 0;

  const shank = pricing.shanks?.[config.shankId];
  const head = pricing.heads?.[config.headId];
  const caratRule = pricing.carats?.[config.carat];
  const metal = pricing.metals?.[config.metalId];

  // Diamond price is optional for now
  const diamondPrice =
    pricing.diamonds?.[config.shape]?.[config.carat] ?? 0;

  // Hard guard — prevents NaN
  if (!shank || !head || !caratRule || !metal) {
    console.warn("⚠ Missing pricing config", {
      shank,
      head,
      caratRule,
      metal,
    });
    return 0;
  }

  // Safe defaults for NULL values
  const shankBaseWeight = shank.baseWeight ?? 0;
  const headBaseWeight = head.baseWeight ?? 0;
  const shankMultiplier = caratRule.shankMultiplier ?? 0;
  const headMultiplier = caratRule.headMultiplier ?? 0;
  const metalPurity = metal.purity ?? 0;

  // Weight calculations
  const shankWeight = shankBaseWeight * shankMultiplier;
  const headWeight = headBaseWeight * headMultiplier;

  // Metal price
  const metalPrice =
    (shankWeight + headWeight) *
    goldRate24k *
    metalPurity;

  // Final price
  const total =
    metalPrice +
    diamondPrice;

  return Math.round(total);
}
