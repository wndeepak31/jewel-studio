import { useEffect, useState } from "react";
import { loadPricing, calculatePrice, RingConfig } from "../lib/pricing";

const GOLD_RATE_24K = 6200; // Can later be moved to env or API

export function useRingPrice(config: RingConfig) {
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    async function calculate() {
      try {
        setLoading(true);

        const pricing = await loadPricing();
        const calculatedPrice = calculatePrice(
          pricing,
          config,
          GOLD_RATE_24K
        );

        if (!cancelled) {
          setPrice(calculatedPrice);
        }
      } catch (error) {
        console.error("Ring price calculation failed:", error);

        if (!cancelled) {
          setPrice(0);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    calculate();

    return () => {
      cancelled = true;
    };
  }, [
    config.shankId,
    config.headId,
    config.shape,
    config.carat,
    config.metalId,
  ]);

  return { price, loading };
}
