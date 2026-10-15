'use client';

import React, { useMemo } from 'react';
import { SymbolInfo } from '@/lib/types';
import { Language, translations } from '@/lib/translations';

interface OrderBookProps {
  currentSymbol: SymbolInfo;
  lang: Language;
}

export const OrderBook: React.FC<OrderBookProps> = ({ currentSymbol, lang }) => {
  const t = translations[lang];
  const currentPrice = currentSymbol.price;
  const step = currentPrice * 0.0004;

  const { asks, bids, spread } = useMemo(() => {
    const askRows = [];
    const bidRows = [];
    let cumAskVol = 0;
    let cumBidVol = 0;

    for (let i = 5; i >= 1; i--) {
      const price = Number((currentPrice + i * step).toFixed(currentSymbol.decimals));
      const size = Number((Math.random() * 2.5 + 0.5).toFixed(3));
      cumAskVol += size;
      askRows.push({ price, size, total: Number(cumAskVol.toFixed(3)) });
    }

    for (let i = 1; i <= 5; i++) {
      const price = Number((currentPrice - i * step).toFixed(currentSymbol.decimals));
      const size = Number((Math.random() * 2.5 + 0.5).toFixed(3));
      cumBidVol += size;
      bidRows.push({ price, size, total: Number(cumBidVol.toFixed(3)) });
    }

    const spreadVal = Number((askRows[askRows.length - 1].price - bidRows[0].price).toFixed(currentSymbol.decimals));
    return { asks: askRows, bids: bidRows, spread: spreadVal };
  }, [currentPrice, currentSymbol.decimals, step]);

  const maxTotal = Math.max(
    ...asks.map(a => a.total),
    ...bids.map(b => b.total),
    1
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border-subtle)',
        fontSize: '11px',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 12px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', fontSize: '12px' }}>
          {t.orderbook}
        </span>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          Spread: {spread}
        </span>
      </div>

      {/* Column Headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr 1fr',
          padding: '6px 12px',
          color: 'var(--text-muted)',
          fontSize: '10px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <span>Price ({currentSymbol.currency})</span>
        <span style={{ textAlign: 'right' }}>Size</span>
        <span style={{ textAlign: 'right' }}>Total</span>
      </div>

      {/* Asks (Sell Orders - Red) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        {asks.map((ask, idx) => {
          const depthPct = (ask.total / maxTotal) * 100;
          return (
            <div
              key={idx}
              style={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr 1fr',
                padding: '3px 12px',
                fontSize: '11px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  right: 0,
                  width: `${depthPct}%`,
                  background: 'rgba(244, 63, 94, 0.12)',
                  pointerEvents: 'none',
                }}
              />
              <span className="font-mono" style={{ color: 'var(--bear-red)', fontWeight: 600 }}>
                {ask.price}
              </span>
              <span className="font-mono" style={{ textAlign: 'right', color: '#f8fafc' }}>
                {ask.size}
              </span>
              <span className="font-mono" style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                {ask.total}
              </span>
            </div>
          );
        })}
      </div>

      {/* Current Spread / Mid Price Bar */}
      <div
        style={{
          padding: '6px 12px',
          background: 'var(--bg-tertiary)',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            className="font-mono"
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: currentSymbol.change >= 0 ? 'var(--bull-green)' : 'var(--bear-red)',
            }}
          >
            {currentSymbol.currency === 'INR' ? '₹' : '$'}
            {currentSymbol.price}
          </span>
          <span className="pulse-dot" />
        </div>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          Last Traded
        </span>
      </div>

      {/* Bids (Buy Orders - Green) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {bids.map((bid, idx) => {
          const depthPct = (bid.total / maxTotal) * 100;
          return (
            <div
              key={idx}
              style={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr 1fr',
                padding: '3px 12px',
                fontSize: '11px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  right: 0,
                  width: `${depthPct}%`,
                  background: 'rgba(16, 185, 129, 0.12)',
                  pointerEvents: 'none',
                }}
              />
              <span className="font-mono" style={{ color: 'var(--bull-green)', fontWeight: 600 }}>
                {bid.price}
              </span>
              <span className="font-mono" style={{ textAlign: 'right', color: '#f8fafc' }}>
                {bid.size}
              </span>
              <span className="font-mono" style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                {bid.total}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
