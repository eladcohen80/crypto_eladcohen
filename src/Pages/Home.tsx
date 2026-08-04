import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCardData, toggleSelectedCoin, type Coin } from '../slices/cardSlice/cardSlice';
import type { AppDispatch, RootState } from '../store/store';
import CoinCard from '../Components/CoinCard';
import SelectionLimitDialog from '../Components/SelectionLimitDialog';
import './Home.css';

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { coins, isLoading, error } = useSelector((state: RootState) => state.card);
  const [usdToEur, setUsdToEur] = useState(0.92);
  const [usdToIls, setUsdToIls] = useState(3.65);
  const [searchText, setSearchText] = useState('');
  const [pendingCoin, setPendingCoin] = useState<Coin | null>(null);

  useEffect(() => {
    if (coins.length === 0) {
      dispatch(fetchCardData());
    }
  }, [coins.length, dispatch]);

  useEffect(() => {
    const fetchFxRates = async () => {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          rates?: { EUR?: number; ILS?: number };
        };

        if (data.rates?.EUR) {
          setUsdToEur(data.rates.EUR);
        }
        if (data.rates?.ILS) {
          setUsdToIls(data.rates.ILS);
        }
      } catch {
        // Keep fallback rates when FX API is unavailable.
      }
    };

    fetchFxRates();
  }, []);

  if (isLoading) {
    return <p className="home-status">Loading coins...</p>;
  }

  if (error) {
    return <p className="home-status">Error: {error}</p>;
  }

  const filteredCoins = coins.filter((coin) =>
    coin.name.toLowerCase().includes(searchText.toLowerCase()) || coin.symbol.toLowerCase().includes(searchText.toLowerCase())
  );

  const selectedCoins = coins.filter((coin) => coin.isSelected);

  const handleSelectionLimitReached = (coin: Coin) => {
    setPendingCoin(coin);
  };

  const handleCloseDialog = () => {
    setPendingCoin(null);
  };

  const handleReplaceSelectedCoin = (coinToRemoveId: string, coinToAddId: string) => {
    dispatch(toggleSelectedCoin({ coinId: coinToRemoveId, isSelected: false }));
    dispatch(toggleSelectedCoin({ coinId: coinToAddId, isSelected: true }));
    setPendingCoin(null);
  };

  return (
    <div className="home-page">
      <header className="home-hero">
        <h1>Top 100 Crypto Coins</h1>
      </header>
      <div className="search-bar-wrap">
        <input
          id="coin-search"
          className="search-input"
          type="text"
          placeholder="Search by coin name or symbol"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      <ul className="coin-grid">
        {filteredCoins.map((coin) => (
          <li key={coin.id}>
            <CoinCard
              coin={coin}
              usdToEur={usdToEur}
              usdToIls={usdToIls}
              onSelectionLimitReached={handleSelectionLimitReached}
            />
          </li>
        ))}
      </ul>
      <SelectionLimitDialog
        isOpen={pendingCoin !== null}
        pendingCoin={pendingCoin}
        selectedCoins={selectedCoins}
        onClose={handleCloseDialog}
        onReplace={handleReplaceSelectedCoin}
      />
    </div>
  );
}



