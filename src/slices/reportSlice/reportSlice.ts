import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { coinGeckoApiBase, cryptoCompareApiBase } from '../../lib/api';
 
export type ReportData = Record<string, { USD?: number }>;

async function fetchFromCoinGecko(symbols: string): Promise<ReportData> {
    const response = await fetch(
        `${coinGeckoApiBase}/coins/markets?vs_currency=usd&symbols=${encodeURIComponent(symbols)}`,
    );

    if (!response.ok) {
        if (response.status === 429) {
            // Rate limited: keep last known values and try again on next poll.
            return {};
        }

        throw new Error(`Fallback HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as Array<{
        symbol?: string;
        current_price?: number;
    }>;

    const mapped: ReportData = {};
    data.forEach((coin) => {
        if (coin.symbol && typeof coin.current_price === 'number') {
            mapped[coin.symbol.toUpperCase()] = { USD: coin.current_price };
        }
    });

    return mapped;
}

type ReportState = {
    reportData: ReportData;
    isLoading: boolean;
    error: string | null;
    updatedAt: number | null;
};

export const fetchReportDataForSelectedCoins = createAsyncThunk(
    'report/fetchReportDataForSelectedCoins',
    async (selectedSymbols: string[]) => {
        if (selectedSymbols.length === 0) {
            return {} as ReportData;
        }

        const symbols = selectedSymbols.map((symbol) => symbol.toUpperCase()).join(',');
        const apiKey = import.meta.env.VITE_CRYPTOCOMPARE_API_KEY;
        const apiKeyQuery = apiKey ? `&api_key=${encodeURIComponent(apiKey)}` : '';
        const response = await fetch(
            `${cryptoCompareApiBase}/data/pricemulti?tsyms=usd&fsyms=${encodeURIComponent(symbols)}${apiKeyQuery}`,
        );

        if (!response.ok) {
            if (response.status === 401) {
                return fetchFromCoinGecko(symbols);
            }

            const errorBody = (await response.text()).trim();
            throw new Error(
                errorBody || `HTTP error! status: ${response.status}`,
            );
        }

        const data = (await response.json()) as ReportData & {
            Response?: string;
            Message?: string;
        };

        if ((data as { Response?: string }).Response === 'Error') {
            const message = (data as { Message?: string }).Message || 'Failed to fetch report data';
            if (message.toLowerCase().includes('api key required')) {
                return fetchFromCoinGecko(symbols);
            }

            throw new Error((data as { Message?: string }).Message || 'Failed to fetch report data');
        }

        return data;
    },
);

const initialState: ReportState = {
        reportData: {},
        isLoading: false,
        error: null,
        updatedAt: null,
};

const reportSlice = createSlice({
    name: 'report',
        initialState,
        reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchReportDataForSelectedCoins.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchReportDataForSelectedCoins.fulfilled, (state, action) => {
                state.isLoading = false;
                state.reportData = {
                    ...state.reportData,
                    ...action.payload,
                };
                state.updatedAt = Date.now();
            })
            .addCase(fetchReportDataForSelectedCoins.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch report data';
            });
    },
});

export default reportSlice.reducer;





