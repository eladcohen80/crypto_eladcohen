function normalizeApiBaseUrl(value: string | undefined, fallback: string): string {
  const resolvedValue = value?.trim() || fallback;
  return resolvedValue.replace(/\/$/, '');
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