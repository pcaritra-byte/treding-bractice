'use client';

import React from 'react';
import { TradingChart } from './TradingChart';
import { IndicatorPane } from './IndicatorPane';
import { Candle, IndicatorSettings, LayoutMode, PriceAlert, Signal, Timeframe } from '@/lib/types';

interface MultiChartGridProps {
  layout: LayoutMode;
  primarySymbolId: string;
  primaryCandles: Candle[];
  timeframe: Timeframe;
  indicators: IndicatorSettings;
  signals: Signal[];
  alerts: PriceAlert[];
  replayIndex: number | null;
  currency: 'USD' | 'INR';
  secondaryCandlesMap: Record<string, Candle[]>;
  onSelectPrimarySymbol?: (symbolId: string) => void;
}

export const MultiChartGrid: React.FC<MultiChartGridProps> = ({
  layout,
  primarySymbolId,
  primaryCandles,
  timeframe,
  indicators,
  signals,
  alerts,
  replayIndex,
  currency,
  secondaryCandlesMap,
}) => {
  // Configured slots for multi-chart layout
  const slots = [
    { symbolId: primarySymbolId, tf: timeframe, candles: primaryCandles },
    {
      symbolId: primarySymbolId === 'BTCUSD' ? 'ETHUSD' : 'BTCUSD',
      tf: '15m' as Timeframe,
      candles: secondaryCandlesMap['ETHUSD'] || primaryCandles,
    },
    {
      symbolId: 'NIFTY',
      tf: '1h' as Timeframe,
      candles: secondaryCandlesMap['NIFTY'] || primaryCandles,
    },
    {
      symbolId: 'RELIANCE',
      tf: '1D' as Timeframe,
      candles: secondaryCandlesMap['RELIANCE'] || primaryCandles,
    },
  ];

  if (layout === '1') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <TradingChart
            symbolId={primarySymbolId}
            candles={primaryCandles}
            timeframe={timeframe}
            indicators={indicators}
            signals={signals}
            alerts={alerts}
            replayIndex={replayIndex}
            currency={currency}
          />
        </div>
        {indicators.showRsi && (
          <IndicatorPane candles={primaryCandles} type="rsi" height={120} />
        )}
        {indicators.showMacd && (
          <IndicatorPane candles={primaryCandles} type="macd" height={130} />
        )}
      </div>
    );
  }

  if (layout === '2-h') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', width: '100%', height: '100%', background: '#07080d' }}>
        <div style={{ position: 'relative', background: '#0b0c13', overflow: 'hidden' }}>
          <TradingChart
            symbolId={slots[0].symbolId}
            candles={slots[0].candles}
            timeframe={slots[0].tf}
            indicators={indicators}
            signals={signals}
            alerts={alerts}
            replayIndex={replayIndex}
            currency={currency}
            isCompact
          />
        </div>
        <div style={{ position: 'relative', background: '#0b0c13', overflow: 'hidden' }}>
          <TradingChart
            symbolId={slots[1].symbolId}
            candles={slots[1].candles}
            timeframe={slots[1].tf}
            indicators={indicators}
            signals={[]}
            alerts={alerts}
            currency="USD"
            isCompact
          />
        </div>
      </div>
    );
  }

  if (layout === '2-v') {
    return (
      <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '4px', width: '100%', height: '100%', background: '#07080d' }}>
        <div style={{ position: 'relative', background: '#0b0c13', overflow: 'hidden' }}>
          <TradingChart
            symbolId={slots[0].symbolId}
            candles={slots[0].candles}
            timeframe={slots[0].tf}
            indicators={indicators}
            signals={signals}
            alerts={alerts}
            replayIndex={replayIndex}
            currency={currency}
            isCompact
          />
        </div>
        <div style={{ position: 'relative', background: '#0b0c13', overflow: 'hidden' }}>
          <TradingChart
            symbolId={slots[1].symbolId}
            candles={slots[1].candles}
            timeframe={slots[1].tf}
            indicators={indicators}
            signals={[]}
            alerts={alerts}
            currency="USD"
            isCompact
          />
        </div>
      </div>
    );
  }

  // 4 Charts (2x2 Quad Grid)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '4px', width: '100%', height: '100%', background: '#07080d' }}>
      {slots.map((slot, idx) => (
        <div key={idx} style={{ position: 'relative', background: '#0b0c13', overflow: 'hidden' }}>
          <TradingChart
            symbolId={slot.symbolId}
            candles={slot.candles}
            timeframe={slot.tf}
            indicators={indicators}
            signals={idx === 0 ? signals : []}
            alerts={alerts}
            replayIndex={idx === 0 ? replayIndex : null}
            currency={slot.symbolId.includes('NIFTY') || slot.symbolId.includes('RELIANCE') ? 'INR' : 'USD'}
            isCompact
          />
        </div>
      ))}
    </div>
  );
};
