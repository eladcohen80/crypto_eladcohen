import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MAX_SELECTED_COINS, toggleSelectedCoin, type Coin } from '../slices/cardSlice/cardSlice'
import type { RootState } from '../store/store'
import './CoinCard.css'

interface CoinCardProps {
  coin: Coin
  usdToEur: number
  usdToIls: number
  onSelectionLimitReached?: (coin: Coin) => void
}

export default function CoinCard({ coin, usdToEur, usdToIls, onSelectionLimitReached }: CoinCardProps) {
  const dispatch = useDispatch()
  const selectedCount = useSelector(
    (state: RootState) => state.card.coins.filter((item) => item.isSelected).length,
  )
  const [showDetails, setShowDetails] = useState(false)

  const usdPrice = coin.current_price
  const eurPrice = usdPrice * usdToEur
  const ilsPrice = usdPrice * usdToIls

  const formatCurrency = (value: number, currency: 'USD' | 'EUR' | 'ILS') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const handleSelect = (checked: boolean) => {
    if (checked && !coin.isSelected && selectedCount >= MAX_SELECTED_COINS) {
      onSelectionLimitReached?.(coin)
      return
    }

    dispatch(toggleSelectedCoin({ coinId: coin.id, isSelected: checked }))
  }

  const handleToggleDetails = () => {
    setShowDetails(!showDetails)
  }

  return (
    <div className={`coin-card ${coin.isSelected ? 'selected' : ''}`}>
      <div className="coin-header">
        <div className="coin-main">
          <img
            className="coin-icon"
            src={coin.image}
            alt={coin.name}
            width={36}
            height={36}
          />
          <div>
            <h2>{coin.symbol.toUpperCase()}</h2>
            <p className="coin-name">{coin.name}</p>
          </div>
        </div>
        <div className="coin-actions">
          <label
            className="switch"
            aria-label={`Select ${coin.name}`}
            title={!coin.isSelected && selectedCount >= MAX_SELECTED_COINS ? `You can select up to ${MAX_SELECTED_COINS} coins` : undefined}
          >
            <input
              type="checkbox"
              checked={coin.isSelected}
              onChange={(event) => handleSelect(event.target.checked)}
            />
            <span className="switch-slider" />
          </label>
        </div>
      </div>
      {showDetails && (
        <div className="coin-details">
          <p>USD: {formatCurrency(usdPrice, 'USD')}</p>
          <p>EUR: {formatCurrency(eurPrice, 'EUR')}</p>
          <p>ILS: {formatCurrency(ilsPrice, 'ILS')}</p>
        </div>
      )}
      <div className="coin-footer">
        <button className="more-info-btn" onClick={handleToggleDetails}>
          {showDetails ? 'Hide Info' : 'More Info'}
        </button>
      </div>
    </div>
  )
}

