'use client';

import React, { useState } from 'react';
import { Position, ClosedTrade, SymbolInfo } from '@/lib/types';
import { translations, Language } from '@/lib/translations';
import { ArrowUpRight, ArrowDownRight, DollarSign, Percent, ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-react';

interface PaperTradingProps {
  currentSymbol: SymbolInfo;
  balance: number;
  positions: Position[];
  closedTrades: ClosedTrade[];
  onPlaceOrder: (order: {
    symbol: string;
    side: 'LONG' | 'SHORT';
    type: 'MARKET' | 'LIMIT';
    price: number;
    quantity: number;
    stopLoss?: number;
    takeProfit?: number;
  }) => void;
  onClosePosition: (positionId: string) => void;
  onResetBalance: () => void;
  lang: Language;
}

export const PaperTrading: React.FC<PaperTradingProps> = ({
  currentSymbol,
  balance,
  positions,
  closedTrades,
  onPlaceOrder,
  onClosePosition,
  onResetBalance,
  lang,
}) => {
  const t = translations[lang];

  const [side, setSide] = useState<'LONG' | 'SHORT'>('LONG');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [quantity, setQuantity] = useState<number>(1);
  const [limitPrice, setLimitPrice] = useState<number>(currentSymbol.price);
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'positions' | 'history'>('positions');

  // Compute Unrealized P&L
  const totalUnrealizedPnl = positions.reduce((acc, p) => acc + p.unrealizedPnl, 0);
  const totalEquity = balance + totalUnrealizedPnl;
  const totalRealizedPnl = closedTrades.reduce((acc, trade) => acc + trade.pnl, 0);
  const winningTrades = closedTrades.filter(tr => tr.pnl > 0).length;
  const winRate = closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0;

  const currentPrice = currentSymbol.price;
  const execPrice = orderType === 'MARKET' ? currentPrice : limitPrice || currentPrice;
  const orderTotal = execPrice * quantity;
  const estimatedFee = orderTotal * 0.0005; // 0.05% demo fee

  const handleQuickPercent = (pct: number) => {
    if (execPrice <= 0) return;
    const alloc = (balance * pct) / 100;
    const qty = Math.max(0.001, Number((alloc / execPrice).toFixed(3)));
    setQuantity(qty);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    onPlaceOrder({
      symbol: currentSymbol.id,
      side,
      type: orderType,
      price: execPrice,
      quantity,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border-subtle)',
      }}
    >
      {/* Portfolio Quick Stats Bar */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-tertiary)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
        }}
      >
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t.balance}</div>
          <div className="font-mono" style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t.equity}</div>
          <div className="font-mono" style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8' }}>
            ${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t.unrealizedPnl}</div>
          <div
            className="font-mono"
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: totalUnrealizedPnl >= 0 ? 'var(--bull-green)' : 'var(--bear-red)',
            }}
          >
            {totalUnrealizedPnl >= 0 ? '+' : ''}${totalUnrealizedPnl.toFixed(2)}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t.winRate}</div>
            <div className="font-mono" style={{ fontSize: '13px', fontWeight: 700, color: '#fbbf24' }}>
              {winRate.toFixed(1)}% ({closedTrades.length})
            </div>
          </div>
          <button
            onClick={onResetBalance}
            title={lang === 'bn' ? 'ব্যালেন্স রিসেট করুন' : 'Reset Paper Balance'}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-dim)',
              padding: '4px',
            }}
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Order Entry Form */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
        <form onSubmit={handleSubmitOrder}>
          {/* Side Toggle: Buy / Long vs Sell / Short */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
            <button
              type="button"
              onClick={() => setSide('LONG')}
              style={{
                background: side === 'LONG' ? 'var(--bull-green)' : 'var(--bg-tertiary)',
                color: side === 'LONG' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                padding: '7px 0',
                borderRadius: '5px',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {t.buy}
            </button>
            <button
              type="button"
              onClick={() => setSide('SHORT')}
              style={{
                background: side === 'SHORT' ? 'var(--bear-red)' : 'var(--bg-tertiary)',
                color: side === 'SHORT' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                padding: '7px 0',
                borderRadius: '5px',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {t.sell}
            </button>
          </div>

          {/* Order Type Toggle: Market vs Limit */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            <button
              type="button"
              onClick={() => setOrderType('MARKET')}
              style={{
                flex: 1,
                background: orderType === 'MARKET' ? 'var(--bg-elevated)' : 'transparent',
                border: '1px solid',
                borderColor: orderType === 'MARKET' ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                color: orderType === 'MARKET' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                padding: '4px 0',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t.market}
            </button>
            <button
              type="button"
              onClick={() => setOrderType('LIMIT')}
              style={{
                flex: 1,
                background: orderType === 'LIMIT' ? 'var(--bg-elevated)' : 'transparent',
                border: '1px solid',
                borderColor: orderType === 'LIMIT' ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                color: orderType === 'LIMIT' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                padding: '4px 0',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t.limit}
            </button>
          </div>

          {/* Limit Price Input (if Limit order selected) */}
          {orderType === 'LIMIT' && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                {t.limitPrice}
              </div>
              <input
                type="number"
                step="any"
                value={limitPrice}
                onChange={e => setLimitPrice(parseFloat(e.target.value) || 0)}
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '5px',
                  padding: '6px 8px',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>
          )}

          {/* Quantity Input */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <span>{t.quantity}</span>
              <span className="font-mono" style={{ color: 'var(--text-muted)' }}>
                {currentSymbol.id}
              </span>
            </div>
            <input
              type="number"
              step="any"
              min="0.0001"
              value={quantity}
              onChange={e => setQuantity(parseFloat(e.target.value) || 0)}
              style={{
                width: '100%',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '5px',
                padding: '6px 8px',
                color: '#ffffff',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
              }}
            />
          </div>

          {/* Quick % Size Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '10px' }}>
            {[10, 25, 50, 100].map(pct => (
              <button
                key={pct}
                type="button"
                onClick={() => handleQuickPercent(pct)}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '3px 0',
                  color: 'var(--text-muted)',
                  fontSize: '10px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Stop Loss & Take Profit (Optional) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                {t.stopLoss}
              </div>
              <input
                type="number"
                step="any"
                placeholder="Optional"
                value={stopLoss}
                onChange={e => setStopLoss(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '4px 6px',
                  color: '#f8fafc',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                {t.takeProfit}
              </div>
              <input
                type="number"
                step="any"
                placeholder="Optional"
                value={takeProfit}
                onChange={e => setTakeProfit(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '4px 6px',
                  color: '#f8fafc',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>
          </div>

          {/* Order Summary & Submit Button */}
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Est. Total:</span>
            <span className="font-mono" style={{ color: '#ffffff', fontWeight: 600 }}>
              ${orderTotal.toFixed(2)} (Fee: ${estimatedFee.toFixed(2)})
            </span>
          </div>

          <button
            type="submit"
            className={side === 'LONG' ? 'btn-bull' : 'btn-bear'}
            style={{
              width: '100%',
              padding: '9px 0',
              borderRadius: '6px',
              fontSize: '13px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {side === 'LONG' ? `BUY ${currentSymbol.id}` : `SELL ${currentSymbol.id}`}
          </button>
        </form>
      </div>

      {/* Tabs: Open Positions vs Trade History */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => setActiveTab('positions')}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'positions' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
            color: activeTab === 'positions' ? '#ffffff' : 'var(--text-muted)',
            padding: '8px 0',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {t.openPositions} ({positions.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'history' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
            color: activeTab === 'history' ? '#ffffff' : 'var(--text-muted)',
            padding: '8px 0',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {t.tradeHistory} ({closedTrades.length})
        </button>
      </div>

      {/* Positions / History List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {activeTab === 'positions' ? (
          positions.length === 0 ? (
            <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              {t.noPositions}
            </div>
          ) : (
            positions.map(pos => {
              const isProfit = pos.unrealizedPnl >= 0;
              return (
                <div
                  key={pos.id}
                  style={{
                    background: 'var(--bg-tertiary)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    marginBottom: '8px',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '12px' }}>{pos.symbol}</span>
                      <span
                        style={{
                          fontSize: '9px',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: '3px',
                          background: pos.side === 'LONG' ? 'var(--bull-green-dark)' : 'var(--bear-red-dark)',
                          color: pos.side === 'LONG' ? 'var(--bull-green)' : 'var(--bear-red)',
                        }}
                      >
                        {pos.side} {pos.quantity}
                      </span>
                    </div>
                    <button
                      onClick={() => onClosePosition(pos.id)}
                      style={{
                        background: 'rgba(244, 63, 94, 0.15)',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        color: 'var(--bear-red)',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '10px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {t.closePosition}
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', fontSize: '10px', color: 'var(--text-muted)' }}>
                    <div>
                      {t.entryPrice}: <span className="font-mono" style={{ color: '#ffffff' }}>${pos.entryPrice}</span>
                    </div>
                    <div>
                      {t.markPrice}: <span className="font-mono" style={{ color: '#ffffff' }}>${pos.currentPrice}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span
                        className="font-mono"
                        style={{
                          color: isProfit ? 'var(--bull-green)' : 'var(--bear-red)',
                          fontWeight: 700,
                        }}
                      >
                        {isProfit ? '+' : ''}${pos.unrealizedPnl.toFixed(2)} ({isProfit ? '+' : ''}
                        {pos.unrealizedPnlPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )
        ) : closedTrades.length === 0 ? (
          <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            {t.noTrades}
          </div>
        ) : (
          closedTrades.map(tr => {
            const isProfit = tr.pnl >= 0;
            return (
              <div
                key={tr.id}
                style={{
                  background: 'var(--bg-tertiary)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  marginBottom: '8px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '12px' }}>{tr.symbol}</span>
                    <span
                      style={{
                        fontSize: '9px',
                        padding: '1px 4px',
                        borderRadius: '3px',
                        background: tr.side === 'LONG' ? 'var(--bull-green-dark)' : 'var(--bear-red-dark)',
                        color: tr.side === 'LONG' ? 'var(--bull-green)' : 'var(--bear-red)',
                      }}
                    >
                      {tr.side}
                    </span>
                  </div>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: isProfit ? 'var(--bull-green)' : 'var(--bear-red)',
                    }}
                  >
                    {isProfit ? '+' : ''}${tr.pnl.toFixed(2)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                  <span>
                    In: ${tr.entryPrice} → Out: ${tr.exitPrice}
                  </span>
                  <span>{new Date(tr.closedAt).toLocaleTimeString()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
