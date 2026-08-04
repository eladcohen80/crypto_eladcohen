import type { Coin } from '../slices/cardSlice/cardSlice'
import './SelectionLimitDialog.css'

type SelectionLimitDialogProps = {
  isOpen: boolean
  pendingCoin: Coin | null
  selectedCoins: Coin[]
  onClose: () => void
  onReplace: (coinToRemoveId: string, coinToAddId: string) => void
}

export default function SelectionLimitDialog({
  isOpen,
  pendingCoin,
  selectedCoins,
  onClose,
  onReplace,
}: SelectionLimitDialogProps) {
  if (!isOpen || !pendingCoin) {
    return null
  }

  return (
    <div className="selection-dialog-backdrop" role="presentation" onClick={onClose}>
      <div
        className="selection-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="selection-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="selection-dialog-header">
          <h2 id="selection-dialog-title">Replace a selected coin</h2>
          <button className="selection-dialog-close" onClick={onClose} aria-label="Close dialog">
            Close
          </button>
        </div>
        <p className="selection-dialog-copy">
          You can select up to 5 coins. Choose one of the selected coins to remove and replace with {pendingCoin.name}.
        </p>
        <ul className="selection-dialog-list">
          {selectedCoins.map((coin) => (
            <li key={coin.id} className="selection-dialog-item">
              <div className="selection-dialog-coin">
                <span>{coin.symbol.toUpperCase()}</span>
                <strong>{coin.name}</strong>
              </div>
              <button
                type="button"
                className="selection-dialog-remove"
                onClick={() => onReplace(coin.id, pendingCoin.id)}
                aria-label={`Remove ${coin.name}`}
                title={`Remove ${coin.name}`}
              >
                X
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
