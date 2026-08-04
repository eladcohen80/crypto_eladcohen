import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import './SelectedCoins.css';   
import CoinCard from './CoinCard';
export default function SelectedCoins() {
  const selectedCoins = useSelector((state: RootState) =>
    state.card.coins.filter((coin) => coin.isSelected)
  );

  return (
    <div className="selected-coins">
      <h2>Selected Coins</h2>
      {selectedCoins.length === 0 ? (
        <p>No coins selected.</p>
      ) : (
        <ul>
          {selectedCoins.map((coin) => (
            <li key={coin.id}>
              <CoinCard coin={coin} usdToEur={0.92} usdToIls={3.65} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
