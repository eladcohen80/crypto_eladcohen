import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCardData } from '../slices/cardSlice/cardSlice';
import { fetchReportDataForSelectedCoins } from '../slices/reportSlice/reportSlice';
import type { AppDispatch, RootState } from '../store/store';
import './RT_Reporting.css';

type SeriesMap = Record<string, number[]>;

const CHART_COLORS = ['#06b6d4', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6'];
const MAX_POINTS = 20;
const POLL_INTERVAL_SECONDS = 10;

const CHART = {
  left: 86,
  right: 860,
  top: 60,
  bottom: 330,
};

const Y_TICKS = 5;
const X_TICK_OFFSETS = [0, 0.25, 0.5, 0.75, 1];

export default function RTReporting() {
  const dispatch = useDispatch<AppDispatch>();
  const { coins, isLoading: isCardLoading } = useSelector((state: RootState) => state.card);
  const { reportData, isLoading, error, updatedAt } = useSelector((state: RootState) => state.report);
  const [series, setSeries] = useState<SeriesMap>({});

  useEffect(() => {
    if (coins.length === 0) {
      dispatch(fetchCardData());
    }
  }, [coins.length, dispatch]);

  const selectedSymbols = useMemo(
    () => coins.filter((coin) => coin.isSelected).map((coin) => coin.symbol.toUpperCase()),
    [coins],
  );

  useEffect(() => {
    if (selectedSymbols.length === 0) {
      setSeries({});
      return;
    }

    const fetchNow = () => {
      dispatch(fetchReportDataForSelectedCoins(selectedSymbols));
    };

    fetchNow();
    const intervalId = window.setInterval(fetchNow, POLL_INTERVAL_SECONDS * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [dispatch, selectedSymbols]);

  useEffect(() => {
    if (selectedSymbols.length === 0) {
      return;
    }

    setSeries((previous) => {
      const next: SeriesMap = {};

      selectedSymbols.forEach((symbol) => {
        const currentPrice = reportData[symbol]?.USD;
        const prevSeries = previous[symbol] ?? [];

        if (typeof currentPrice !== 'number') {
          next[symbol] = prevSeries;
          return;
        }

        next[symbol] = [...prevSeries, currentPrice].slice(-MAX_POINTS);
      });

      return next;
    });
  }, [reportData, selectedSymbols]);

  const allValues = Object.values(series).flat();
  const minValue = allValues.length > 0 ? Math.min(...allValues) : 0;
  const maxValue = allValues.length > 0 ? Math.max(...allValues) : 1;

  const displayMax = maxValue;
  const displayMin = minValue;
  const valueRange = displayMax - displayMin || 1;

  const yTicks = Array.from({ length: Y_TICKS }, (_, index) => {
    const ratio = index / (Y_TICKS - 1);
    const value = displayMax - ratio * valueRange;
    const y = CHART.top + ratio * (CHART.bottom - CHART.top);
    return { value, y };
  });

  const xTicks = X_TICK_OFFSETS.map((offset) => {
    const x = CHART.left + offset * (CHART.right - CHART.left);
    const secondsAgo = Math.round((1 - offset) * (MAX_POINTS - 1) * POLL_INTERVAL_SECONDS);
    const label = secondsAgo === 0 ? 'Now' : `-${secondsAgo}s`;
    return { x, label };
  });

  function getDisplayPrice(symbol: string) {
    const currentPrice = reportData[symbol]?.USD;
    if (typeof currentPrice === 'number') {
      return currentPrice;
    }

    const symbolSeries = series[symbol] ?? [];
    return symbolSeries.length > 0 ? symbolSeries[symbolSeries.length - 1] : undefined;
  }

  const buildPath = (values: number[]) => {
    if (values.length === 0) {
      return '';
    }

    return values
      .map((value, index) => {
        const x = CHART.left + (index / Math.max(MAX_POINTS - 1, 1)) * (CHART.right - CHART.left);
        const clampedValue = Math.min(displayMax, Math.max(displayMin, value));
        const y = CHART.bottom - ((clampedValue - displayMin) / valueRange) * (CHART.bottom - CHART.top);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  return (
    <div className="rt-reporting-page">
      <h1>Real-Time Reporting</h1>
      {isCardLoading && <p className="rt-empty">Loading selected coins...</p>}
      {!isCardLoading && selectedSymbols.length === 0 && (
        <p className="rt-empty">Select up to 5 coins on Home to start live reporting.</p>
      )}

      {selectedSymbols.length > 0 && (
        <>
          <div className="rt-meta">
            <p>{isLoading ? 'Updating prices...' : 'Live prices every 10 seconds'}</p>
            {updatedAt && <p>Last update: {new Date(updatedAt).toLocaleTimeString()}</p>}
          </div>

          {error && <p className="rt-error">Error: {error}</p>}

          <div className="rt-chart-wrap" role="img" aria-label="Real-time selected coin prices chart">
            <svg viewBox="0 0 920 430" className="rt-chart">
              {yTicks.map((tick) => (
                <g key={`y-${tick.y}`}>
                  <line x1={CHART.left} y1={tick.y} x2={CHART.right} y2={tick.y} className="rt-grid" />
                  <text x={CHART.left - 12} y={tick.y + 4} textAnchor="end" className="rt-tick-label">
                    ${tick.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </text>
                </g>
              ))}

              {xTicks.map((tick) => (
                <g key={`x-${tick.x}`}>
                  <line x1={tick.x} y1={CHART.bottom} x2={tick.x} y2={CHART.bottom + 6} className="rt-axis" />
                  <text x={tick.x} y={CHART.bottom + 20} textAnchor="middle" className="rt-tick-label">
                    {tick.label}
                  </text>
                </g>
              ))}

              <line x1={CHART.left} y1={CHART.bottom} x2={CHART.right} y2={CHART.bottom} className="rt-axis" />
              <line x1={CHART.left} y1={CHART.top} x2={CHART.left} y2={CHART.bottom} className="rt-axis" />
              <text x="473" y="418" textAnchor="middle" className="rt-axis-label">
                Time (last updates)
              </text>
              <text
                x="24"
                y="195"
                textAnchor="middle"
                className="rt-axis-label"
                transform="rotate(-90 24 195)"
              >
                Price (USD)
              </text>

              {selectedSymbols.map((symbol, index) => {
                const values = series[symbol] ?? [];
                return (
                  <path
                    key={symbol}
                    d={buildPath(values)}
                    fill="none"
                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })}
            </svg>
          </div>

          <ul className="rt-legend">
            {selectedSymbols.map((symbol, index) => (
              <li key={symbol}>
                <span
                  className="rt-legend-dot"
                  style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                />
                <strong>{symbol}</strong>
                <span>
                  {getDisplayPrice(symbol) !== undefined
                    ? `$${getDisplayPrice(symbol)?.toLocaleString()}`
                    : 'No data yet'}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}