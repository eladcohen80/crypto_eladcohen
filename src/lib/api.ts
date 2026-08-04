function normalizeApiBaseUrl(value: string | undefined, fallback: string): string {
  const resolvedValue = value?.trim() || fallback;
  const normalizedValue = resolvedValue.replace(/\/$/, '');

  // Vite's /api proxy exists only in local dev. In production, a relative /api base
  // would hit the hosting app itself and return 404 unless a real backend route exists.
  if (!import.meta.env.DEV && normalizedValue.startsWith('/')) {
    return fallback;
  }

  return normalizedValue;
}

const defaultCoinGeckoApiBase = import.meta.env.DEV
  ? '/api/coingecko'
  : 'https://api.coingecko.com/api/v3';

const defaultCryptoCompareApiBase = import.meta.env.DEV
  ? '/api/cryptocompare'
  : 'https://min-api.cryptocompare.com';

export const coinGeckoApiBase = normalizeApiBaseUrl(
  import.meta.env.VITE_COINGECKO_API_BASE,
  defaultCoinGeckoApiBase,
);

export const cryptoCompareApiBase = normalizeApiBaseUrl(
  import.meta.env.VITE_CRYPTOCOMPARE_API_BASE,
  defaultCryptoCompareApiBase,
);