/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_CRYPTOCOMPARE_API_KEY?: string;
  readonly VITE_COINGECKO_API_BASE?: string;
  readonly VITE_CRYPTOCOMPARE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}