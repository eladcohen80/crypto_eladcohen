import { configureStore } from '@reduxjs/toolkit';
import cardReducer from '../slices/cardSlice/cardSlice';
import reportReducer from '../slices/reportSlice/reportSlice';
const SELECTED_COINS_STORAGE_KEY = 'selectedCoinIds';

export const store = configureStore({
  reducer: {
    card: cardReducer,
    report: reportReducer,
  },
});

if (typeof window !== 'undefined') {
  store.subscribe(() => {
    const { coins } = store.getState().card;

    // Avoid wiping persisted selections during the initial loading cycle
    // before the coin list has been hydrated from the API.
    if (coins.length === 0) {
      return;
    }

    const selectedCoinIds = coins
      .filter((coin) => coin.isSelected)
      .map((coin) => coin.id);

    window.localStorage.setItem(
      SELECTED_COINS_STORAGE_KEY,
      JSON.stringify(selectedCoinIds),
    );
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;