import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { coinGeckoApiBase } from '../../lib/api';

const SELECTED_COINS_STORAGE_KEY = 'selectedCoinIds';
export const MAX_SELECTED_COINS = 5;

function getStoredSelectedCoinIds(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const storedValue = window.localStorage.getItem(SELECTED_COINS_STORAGE_KEY);

  if (!storedValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(storedValue) as unknown;
    return Array.isArray(parsedValue)
      ? parsedValue.filter((value): value is string => typeof value === 'string')
      : [];
  } catch {
    return [];
  }
}

export type Coin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number | null;
  price_change_percentage_30d_in_currency: number | null;
  price_change_percentage_60d_in_currency: number | null;
  price_change_percentage_200d_in_currency: number | null;
  isSelected: boolean;
};

type ToggleSelectedCoinPayload = {
  coinId: string;
  isSelected: boolean;
};

type CardState = {
  coins: Coin[];
  isLoading: boolean;
  error: string | null;
};

export const fetchCardData = createAsyncThunk<Coin[]>(
  'card/fetchCardData',
  async () => {
    let response: Response;

    try {
      response = await fetch(
        `${coinGeckoApiBase}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h,30d,60d,200d`,
      );
    } catch {
      throw new Error('Network error while loading coins');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const selectedCoinIds = new Set(getStoredSelectedCoinIds());
    const data = (await response.json()) as Omit<Coin, 'isSelected'>[];
    return data.map((coin) => ({
      ...coin,
      isSelected: selectedCoinIds.has(coin.id),
    }));
  },
);

export const moreinfo = createAsyncThunk<Coin, string>(
  'card/moreinfo',
  async (coinId: string) => {
    let response: Response;

    try {
      response = await fetch(`${coinGeckoApiBase}/coins/${coinId}`);
    } catch {
      throw new Error('Network error while loading coin details');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = (await response.json()) as Coin;
    return data;
  },
);



const initialState: CardState = {
  coins: [],
  isLoading: false,
  error: null,
};

const cardSlice = createSlice({
  name: 'card',
  initialState,
  reducers: {
    toggleSelectedCoin: (state, action: { payload: ToggleSelectedCoinPayload }) => {
      const coin = state.coins.find((item) => item.id === action.payload.coinId);
      if (coin) {
        if (action.payload.isSelected && !coin.isSelected) {
          const selectedCount = state.coins.filter((item) => item.isSelected).length;
          if (selectedCount >= MAX_SELECTED_COINS) {
            return;
          }
        }

        coin.isSelected = action.payload.isSelected;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.coins = action.payload.map((coin) => {
          const existingCoin = state.coins.find((item) => item.id === coin.id);
          return {
            ...coin,
            isSelected: existingCoin?.isSelected ?? coin.isSelected,
          };
        });
      })
      .addCase(fetchCardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to fetch coins';
      })
      .addCase(moreinfo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(moreinfo.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.coins.findIndex(coin => coin.id === action.payload.id);
        if (index !== -1) {
          state.coins[index] = {
            ...action.payload,
            isSelected: state.coins[index].isSelected,
          };
        }
      })
      .addCase(moreinfo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to fetch coin info';
      });
  },
});

export const { toggleSelectedCoin } = cardSlice.actions;
export default cardSlice.reducer;
