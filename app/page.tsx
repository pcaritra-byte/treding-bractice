'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HeaderToolbar } from '@/components/HeaderToolbar';
import { Watchlist } from '@/components/Watchlist';
import { MultiChartGrid } from '@/components/MultiChartGrid';
import { PaperTrading } from '@/components/PaperTrading';
import { OrderBook } from '@/components/OrderBook';
import { SignalsFeed } from '@/components/SignalsFeed';
import { AlertsModal } from '@/components/AlertsModal';
import { BengaliGuideModal } from '@/components/BengaliGuideModal';
import { BarReplayBar } from '@/components/BarReplayBar';
import { DrawingToolsSidebar } from '@/components/DrawingToolsSidebar';
import {
  Candle,
  ClosedTrade,
  IndicatorSettings,
  LayoutMode,
  Position,
  PriceAlert,
  Signal,
  SymbolInfo,
  Timeframe,
} from '@/lib/types';
import { defaultDataProvider, INITIAL_SYMBOLS } from '@/lib/marketDataProvider';
import { generateSignals } from '@/lib/indicators';
import { Language, translations } from '@/lib/translations';

// Web Audio sound synthesizer for price alert chime
function playAlertChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15); // E6

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch {
    // Ignore audio errors if blocked by browser policy
  }
}

export default function DashboardPage() {
  // Localization: Default to Bengali ('bn') with toggle
  const [lang, setLang] = useState<Language>('bn');
  const t = translations[lang];

  // Market Data state
  const [symbols, setSymbols] = useState<SymbolInfo[]>(INITIAL_SYMBOLS);
  const [selectedSymbolId, setSelectedSymbolId] = useState<string>('BTCUSD');
  const [timeframe, setTimeframe] = useState<Timeframe>('1h');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [secondaryCandlesMap, setSecondaryCandlesMap] = useState<Record<string, Candle[]>>({});
  const [layout, setLayout] = useState<LayoutMode>('1');

  // Indicators toggle state
  const [indicators, setIndicators] = useState<IndicatorSettings>({
    showEma20: true,
    showEma50: true,
    showEma200: false,
    showBollingerBands: false,
    showVolumeProfile: true, // Visible Range Volume Profile (VRVP)
    showRsi: true,
    showMacd: false,
    showSignals: true,
  });

  // Paper Trading state
  const [balance, setBalance] = useState<number>(100000.0);
  const [positions, setPositions] = useState<Position[]>([]);
  const [closedTrades, setClosedTrades] = useState<ClosedTrade[]>([]);

  // Price Alerts state
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Bar Replay state
  const [isReplayActive, setIsReplayActive] = useState(false);
  const [replayIndex, setReplayIndex] = useState<number | null>(null);
  const [isReplayPlaying, setIsReplayPlaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState<number>(1000);

  // Modals & Panels
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<'paper' | 'book' | 'signals'>('paper');

  // Selected symbol info object
  const currentSymbol = useMemo(() => {
    return symbols.find(s => s.id === selectedSymbolId) || symbols[0];
  }, [symbols, selectedSymbolId]);

  // Load saved alerts, trades & language from localStorage on mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('chartpilot_lang') as Language;
      if (savedLang && (savedLang === 'en' || savedLang === 'hi' || savedLang === 'bn')) {
        setLang(savedLang);
      }

      const savedAlerts = localStorage.getItem('chartpilot_alerts');
      if (savedAlerts) setAlerts(JSON.parse(savedAlerts));

      const savedPositions = localStorage.getItem('chartpilot_positions');
      if (savedPositions) setPositions(JSON.parse(savedPositions));

      const savedTrades = localStorage.getItem('chartpilot_closed_trades');
      if (savedTrades) setClosedTrades(JSON.parse(savedTrades));

      const savedBalance = localStorage.getItem('chartpilot_balance');
      if (savedBalance) setBalance(parseFloat(savedBalance));
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem('chartpilot_alerts', JSON.stringify(alerts));
      localStorage.setItem('chartpilot_positions', JSON.stringify(positions));
      localStorage.setItem('chartpilot_closed_trades', JSON.stringify(closedTrades));
      localStorage.setItem('chartpilot_balance', balance.toString());
    } catch {
      // Ignore
    }
  }, [alerts, positions, closedTrades, balance]);

  // Fetch primary candles when selectedSymbolId or timeframe changes
  useEffect(() => {
    let isCancelled = false;

    async function loadCandles() {
      const data = await defaultDataProvider.getCandles(selectedSymbolId, timeframe, 180);
      if (!isCancelled) {
        setCandles(data);
        if (isReplayActive) {
          setReplayIndex(Math.floor(data.length * 0.7)); // Set replay to 70% of history
        } else {
          setReplayIndex(null);
        }
      }
    }

    loadCandles();

    return () => {
      isCancelled = true;
    };
  }, [selectedSymbolId, timeframe, isReplayActive]);

  // Pre-load secondary candles for multi-chart view (ETHUSD, NIFTY, RELIANCE)
  useEffect(() => {
    async function loadSecondary() {
      const eth = await defaultDataProvider.getCandles('ETHUSD', '15m', 120);
      const nifty = await defaultDataProvider.getCandles('NIFTY', '1h', 120);
      const rel = await defaultDataProvider.getCandles('RELIANCE', '1D', 120);
      setSecondaryCandlesMap({
        ETHUSD: eth,
        NIFTY: nifty,
        RELIANCE: rel,
      });
    }
    loadSecondary();
  }, []);

  // Subscribe to live simulated price ticks and check alerts / update positions
  useEffect(() => {
    const symbolIds = symbols.map(s => s.id);

    const unsubscribe = defaultDataProvider.subscribeQuotes(symbolIds, updatedQuote => {
      // Update symbols array with latest quote
      setSymbols(prev =>
        prev.map(s => (s.id === updatedQuote.id ? updatedQuote : s))
      );

      // Check if price triggers any active price alert
      setAlerts(prevAlerts => {
        let hasTriggered = false;
        const updated = prevAlerts.map(alert => {
          if (!alert.triggered && alert.symbol === updatedQuote.id) {
            const hit =
              (alert.condition === 'CROSS_UP' && updatedQuote.price >= alert.targetPrice) ||
              (alert.condition === 'CROSS_DOWN' && updatedQuote.price <= alert.targetPrice);

            if (hit) {
              hasTriggered = true;
              playAlertChime();
              setToastMessage(
                `${alert.symbol} ${alert.condition === 'CROSS_UP' ? 'crossed above' : 'crossed below'} ${alert.targetPrice}!`
              );
              return { ...alert, triggered: true, triggeredAt: Date.now() };
            }
          }
          return alert;
        });

        if (hasTriggered) {
          setTimeout(() => setToastMessage(null), 5000);
        }
        return updated;
      });

      // Update unrealized P&L on open positions
      setPositions(prevPositions =>
        prevPositions.map(pos => {
          if (pos.symbol === updatedQuote.id) {
            const diff =
              pos.side === 'LONG'
                ? updatedQuote.price - pos.entryPrice
                : pos.entryPrice - updatedQuote.price;
            const pnl = Number((diff * pos.quantity).toFixed(2));
            const pnlPct = Number(((diff / pos.entryPrice) * 100).toFixed(2));
            return {
              ...pos,
              currentPrice: updatedQuote.price,
              unrealizedPnl: pnl,
              unrealizedPnlPercent: pnlPct,
            };
          }
          return pos;
        })
      );
    });

    return () => unsubscribe();
  }, [symbols]);

  // Rule-based signals computation for current candles
  const currentSignals = useMemo(() => {
    return generateSignals(selectedSymbolId, candles);
  }, [selectedSymbolId, candles]);

  // Indicator Toggle Handler
  const handleToggleIndicator = (key: keyof IndicatorSettings) => {
    setIndicators(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Paper Trading Handlers
  const handlePlaceOrder = (orderData: {
    symbol: string;
    side: 'LONG' | 'SHORT';
    type: 'MARKET' | 'LIMIT';
    price: number;
    quantity: number;
    stopLoss?: number;
    takeProfit?: number;
  }) => {
    const cost = orderData.price * orderData.quantity;
    if (balance < cost) {
      alert(
        lang === 'bn'
          ? 'অপর্যাপ্ত ব্যালেন্স!'
          : lang === 'hi'
          ? 'अपर्याप्त नकद बैलेंस!'
          : 'Insufficient cash balance!'
      );
      return;
    }

    const newPosition: Position = {
      id: `pos-${Date.now()}`,
      symbol: orderData.symbol,
      side: orderData.side,
      entryPrice: orderData.price,
      quantity: orderData.quantity,
      currentPrice: orderData.price,
      unrealizedPnl: 0,
      unrealizedPnlPercent: 0,
      stopLoss: orderData.stopLoss,
      takeProfit: orderData.takeProfit,
      openedAt: Date.now(),
    };

    setBalance(prev => prev - cost);
    setPositions(prev => [newPosition, ...prev]);
    setToastMessage(`Executed ${orderData.side} ${orderData.quantity} ${orderData.symbol} @ $${orderData.price}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleClosePosition = (positionId: string) => {
    const pos = positions.find(p => p.id === positionId);
    if (!pos) return;

    const returnCash = pos.entryPrice * pos.quantity + pos.unrealizedPnl;
    const closedTrade: ClosedTrade = {
      id: `trade-${Date.now()}`,
      symbol: pos.symbol,
      side: pos.side,
      entryPrice: pos.entryPrice,
      exitPrice: pos.currentPrice,
      quantity: pos.quantity,
      pnl: pos.unrealizedPnl,
      pnlPercent: pos.unrealizedPnlPercent,
      closedAt: Date.now(),
    };

    setBalance(prev => prev + returnCash);
    setPositions(prev => prev.filter(p => p.id !== positionId));
    setClosedTrades(prev => [closedTrade, ...prev]);
    setToastMessage(`Closed position: ${pos.symbol} P&L: $${pos.unrealizedPnl.toFixed(2)}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleResetBalance = () => {
    const confirmMsg =
      lang === 'bn'
        ? 'ব্যালেন্স $100,000 এ রিসেট করতে চান?'
        : lang === 'hi'
        ? 'क्या आप बैलेंस को $100,000 पर रीसेट करना चाहते हैं?'
        : 'Reset paper balance to $100,000?';
    if (confirm(confirmMsg)) {
      setBalance(100000.0);
      setPositions([]);
      setClosedTrades([]);
    }
  };

  const handleSelectLang = (newLang: Language) => {
    setLang(newLang);
    try {
      localStorage.setItem('chartpilot_lang', newLang);
    } catch {
      // Ignore
    }
  };

  // Price Alert Handlers
  const handleAddAlert = (newAlert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>) => {
    const alertObj: PriceAlert = {
      ...newAlert,
      id: `alert-${Date.now()}`,
      createdAt: Date.now(),
      triggered: false,
    };
    setAlerts(prev => [alertObj, ...prev]);
    setIsAlertsModalOpen(false);
    setToastMessage(`Alert created: ${alertObj.symbol} @ $${alertObj.targetPrice}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // Bar Replay Handlers
  const handleToggleReplay = () => {
    if (!isReplayActive) {
      setIsReplayActive(true);
      setReplayIndex(Math.floor(candles.length * 0.7));
      setIsReplayPlaying(false);
    } else {
      setIsReplayActive(false);
      setReplayIndex(null);
      setIsReplayPlaying(false);
    }
  };

  const handleStepReplay = () => {
    if (replayIndex !== null && replayIndex < candles.length - 1) {
      setReplayIndex(prev => (prev !== null ? prev + 1 : null));
    }
  };

  const handleResetReplay = () => {
    setReplayIndex(15);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        overflow: 'hidden',
      }}
    >
      {/* Top Header & Navigation Toolbar */}
      <HeaderToolbar
        currentSymbol={currentSymbol}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        layout={layout}
        onLayoutChange={setLayout}
        indicators={indicators}
        onToggleIndicator={handleToggleIndicator}
        onOpenAlerts={() => setIsAlertsModalOpen(true)}
        alertsCount={alerts.filter(a => !a.triggered).length}
        isReplayActive={isReplayActive}
        onToggleReplay={handleToggleReplay}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        lang={lang}
        onSelectLang={handleSelectLang}
        activeRightTab={activeRightTab}
        onSelectRightTab={setActiveRightTab}
      />

      {/* Bar Replay Toolbar (Visible when Replay Mode is active) */}
      {isReplayActive && replayIndex !== null && (
        <BarReplayBar
          currentIndex={replayIndex}
          totalCandles={candles.length}
          isPlaying={isReplayPlaying}
          speed={replaySpeed}
          onTogglePlay={() => setIsReplayPlaying(!isReplayPlaying)}
          onStep={handleStepReplay}
          onReset={handleResetReplay}
          onSpeedChange={setReplaySpeed}
          onExit={handleToggleReplay}
          onScrub={idx => setReplayIndex(idx)}
          lang={lang}
        />
      )}

      {/* Main Trading Workstation Layout: Left Tools + Watchlist + Chart Canvas + Right Panels */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Leftmost Drawing Tools Toolbar */}
        <DrawingToolsSidebar />

        {/* Watchlist Sidebar (Left) */}
        <div style={{ width: '260px', height: '100%', flexShrink: 0 }}>
          <Watchlist
            symbols={symbols}
            selectedSymbolId={selectedSymbolId}
            onSelectSymbol={setSelectedSymbolId}
            lang={lang}
          />
        </div>

        {/* Main Center Chart Area (Supports 1, 2, 4 Multi-chart views + VRVP + Indicator subpanes) */}
        <div style={{ flex: 1, height: '100%', position: 'relative', overflow: 'hidden', display: 'flex' }}>
          <MultiChartGrid
            layout={layout}
            primarySymbolId={selectedSymbolId}
            primaryCandles={candles}
            timeframe={timeframe}
            indicators={indicators}
            signals={currentSignals}
            alerts={alerts}
            replayIndex={replayIndex}
            currency={currentSymbol.currency}
            secondaryCandlesMap={secondaryCandlesMap}
            onSelectPrimarySymbol={setSelectedSymbolId}
          />
        </div>

        {/* Right Sidebar: Paper Trading / Level 2 Orderbook / Signals Feed */}
        <div style={{ width: '330px', height: '100%', flexShrink: 0 }}>
          {activeRightTab === 'paper' && (
            <PaperTrading
              currentSymbol={currentSymbol}
              balance={balance}
              positions={positions}
              closedTrades={closedTrades}
              onPlaceOrder={handlePlaceOrder}
              onClosePosition={handleClosePosition}
              onResetBalance={handleResetBalance}
              lang={lang}
            />
          )}

          {activeRightTab === 'book' && (
            <OrderBook currentSymbol={currentSymbol} lang={lang} />
          )}

          {activeRightTab === 'signals' && (
            <SignalsFeed
              signals={currentSignals}
              currentSymbol={currentSymbol}
              onTradeSignal={sig => {
                handlePlaceOrder({
                  symbol: sig.symbol,
                  side: sig.type === 'BUY' ? 'LONG' : 'SHORT',
                  type: 'MARKET',
                  price: sig.price,
                  quantity: currentSymbol.category === 'crypto' ? 0.25 : 10,
                  stopLoss: sig.stopLoss,
                  takeProfit: sig.targetPrice,
                });
                setActiveRightTab('paper');
              }}
              lang={lang}
            />
          )}
        </div>
      </div>

      {/* Floating Alert Toast Notification */}
      {toastMessage && (
        <div
          className="animate-fade-in"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, #181d2f 0%, #0f172a 100%)',
            border: '1px solid var(--accent-cyan)',
            boxShadow: 'var(--shadow-glow-cyan)',
            padding: '12px 18px',
            borderRadius: '8px',
            color: '#f8fafc',
            fontSize: '13px',
            fontWeight: 600,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '18px' }}>🔔</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Price Alerts Modal */}
      <AlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        currentSymbol={currentSymbol}
        alerts={alerts}
        onAddAlert={handleAddAlert}
        onDeleteAlert={handleDeleteAlert}
        lang={lang}
      />

      {/* Bengali Documentation & Starter Guide Modal */}
      <BengaliGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        lang={lang}
      />
    </div>
  );
}
