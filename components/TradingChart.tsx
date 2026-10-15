'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  createChart,
  ColorType,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  SeriesMarker,
  Time,
} from 'lightweight-charts';
import { Candle, IndicatorSettings, PriceAlert, Signal, Timeframe } from '@/lib/types';
import {
  calculateEMA,
  calculateBollingerBands,
  calculateVolumeProfile,
} from '@/lib/indicators';

interface TradingChartProps {
  symbolId: string;
  candles: Candle[];
  timeframe: Timeframe;
  indicators: IndicatorSettings;
  signals?: Signal[];
  alerts?: PriceAlert[];
  replayIndex?: number | null; // For Bar Replay mode
  currency?: 'USD' | 'INR';
  isCompact?: boolean;
}

export const TradingChart: React.FC<TradingChartProps> = ({
  symbolId,
  candles,
  timeframe,
  indicators,
  signals = [],
  alerts = [],
  replayIndex = null,
  currency = 'USD',
  isCompact = false,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const ema20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema200SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbUpperSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbLowerSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  // Active hover candle info for legend
  const [legendInfo, setLegendInfo] = useState<{
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    time: string;
    change: number;
    changePercent: number;
  } | null>(null);

  // Candles slice (respecting Bar Replay if active)
  const displayCandles = useMemo(() => {
    if (replayIndex !== null && replayIndex >= 0 && replayIndex < candles.length) {
      return candles.slice(0, replayIndex + 1);
    }
    return candles;
  }, [candles, replayIndex]);

  // Volume Profile calculation
  const volumeProfileData = useMemo(() => {
    if (!indicators.showVolumeProfile || displayCandles.length === 0) return null;
    return calculateVolumeProfile(displayCandles.slice(-80), 24);
  }, [displayCandles, indicators.showVolumeProfile]);

  // Set default legend to last candle
  useEffect(() => {
    if (displayCandles.length > 0) {
      const last = displayCandles[displayCandles.length - 1];
      const change = last.close - last.open;
      const changePercent = (change / last.open) * 100;
      const dateStr = new Date(last.time * 1000).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      setLegendInfo({
        open: last.open,
        high: last.high,
        low: last.low,
        close: last.close,
        volume: last.volume,
        time: dateStr,
        change,
        changePercent,
      });
    }
  }, [displayCandles]);

  // Initialize and recreate chart when symbol or container mounts
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clean up previous chart instance
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const container = chartContainerRef.current;
    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight || 450,
      layout: {
        background: { type: ColorType.Solid, color: '#0b0c13' },
        textColor: '#94a3b8',
        fontSize: isCompact ? 10 : 12,
        fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.04)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: 'rgba(56, 189, 248, 0.5)',
          width: 1,
          style: 3,
          labelBackgroundColor: '#0284c7',
        },
        horzLine: {
          color: 'rgba(56, 189, 248, 0.5)',
          width: 1,
          style: 3,
          labelBackgroundColor: '#0284c7',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        scaleMargins: {
          top: 0.1,
          bottom: 0.22,
        },
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Candlestick series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
    });
    candleSeriesRef.current = candleSeries;

    // Volume Series overlay at bottom
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // Overlay over main pane
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });
    volumeSeriesRef.current = volumeSeries;

    // EMA series
    const ema20 = chart.addLineSeries({
      color: '#38bdf8', // Cyan
      lineWidth: 2,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });
    ema20SeriesRef.current = ema20;

    const ema50 = chart.addLineSeries({
      color: '#fbbf24', // Amber
      lineWidth: 2,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });
    ema50SeriesRef.current = ema50;

    const ema200 = chart.addLineSeries({
      color: '#a855f7', // Purple
      lineWidth: 2,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });
    ema200SeriesRef.current = ema200;

    // Bollinger Bands
    const bbUpper = chart.addLineSeries({
      color: 'rgba(59, 130, 246, 0.6)',
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
    });
    bbUpperSeriesRef.current = bbUpper;

    const bbLower = chart.addLineSeries({
      color: 'rgba(59, 130, 246, 0.6)',
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
    });
    bbLowerSeriesRef.current = bbLower;

    // Subscribe to crosshair move for dynamic legend
    chart.subscribeCrosshairMove(param => {
      if (
        !param.point ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > container.clientWidth ||
        param.point.y < 0 ||
        param.point.y > container.clientHeight
      ) {
        return;
      }

      const candleData = param.seriesData.get(candleSeries) as any;
      if (candleData) {
        const change = candleData.close - candleData.open;
        const changePercent = (change / candleData.open) * 100;
        const timeVal = typeof param.time === 'number' ? param.time : Number(param.time);
        const dateStr = new Date(timeVal * 1000).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        setLegendInfo({
          open: candleData.open,
          high: candleData.high,
          low: candleData.low,
          close: candleData.close,
          volume: candleData.volume || 0,
          time: dateStr,
          change,
          changePercent,
        });
      }
    });

    // Resize observer
    const handleResize = () => {
      if (chartRef.current && container) {
        chartRef.current.applyOptions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [symbolId, isCompact]);

  // Update Data and Series when candles or settings change
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || displayCandles.length === 0) return;

    // Format for Lightweight Charts
    const formattedCandles = displayCandles.map(c => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    const formattedVolume = displayCandles.map(c => ({
      time: c.time as Time,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(16, 185, 129, 0.45)' : 'rgba(244, 63, 94, 0.45)',
    }));

    candleSeriesRef.current.setData(formattedCandles);
    volumeSeriesRef.current.setData(formattedVolume);

    // Update EMA indicators
    if (ema20SeriesRef.current) {
      if (indicators.showEma20) {
        const data = calculateEMA(displayCandles, 20).map(d => ({
          time: d.time as Time,
          value: d.value,
        }));
        ema20SeriesRef.current.setData(data);
        ema20SeriesRef.current.applyOptions({ visible: true });
      } else {
        ema20SeriesRef.current.applyOptions({ visible: false });
      }
    }

    if (ema50SeriesRef.current) {
      if (indicators.showEma50) {
        const data = calculateEMA(displayCandles, 50).map(d => ({
          time: d.time as Time,
          value: d.value,
        }));
        ema50SeriesRef.current.setData(data);
        ema50SeriesRef.current.applyOptions({ visible: true });
      } else {
        ema50SeriesRef.current.applyOptions({ visible: false });
      }
    }

    if (ema200SeriesRef.current) {
      if (indicators.showEma200) {
        const data = calculateEMA(displayCandles, 200).map(d => ({
          time: d.time as Time,
          value: d.value,
        }));
        ema200SeriesRef.current.setData(data);
        ema200SeriesRef.current.applyOptions({ visible: true });
      } else {
        ema200SeriesRef.current.applyOptions({ visible: false });
      }
    }

    // Update Bollinger Bands
    if (bbUpperSeriesRef.current && bbLowerSeriesRef.current) {
      if (indicators.showBollingerBands) {
        const bb = calculateBollingerBands(displayCandles, 20, 2);
        bbUpperSeriesRef.current.setData(bb.upper.map(u => ({ time: u.time as Time, value: u.value })));
        bbLowerSeriesRef.current.setData(bb.lower.map(l => ({ time: l.time as Time, value: l.value })));
        bbUpperSeriesRef.current.applyOptions({ visible: true });
        bbLowerSeriesRef.current.applyOptions({ visible: true });
      } else {
        bbUpperSeriesRef.current.applyOptions({ visible: false });
        bbLowerSeriesRef.current.applyOptions({ visible: false });
      }
    }

    // Signals Markers on Candle Series
    if (indicators.showSignals && signals.length > 0) {
      const markers: SeriesMarker<Time>[] = [];
      const candleTimes = new Set(displayCandles.map(c => c.time));

      for (const sig of signals) {
        if (candleTimes.has(sig.timestamp)) {
          markers.push({
            time: sig.timestamp as Time,
            position: sig.type === 'BUY' ? 'belowBar' : 'aboveBar',
            color: sig.type === 'BUY' ? '#10b981' : '#f43f5e',
            shape: sig.type === 'BUY' ? 'arrowUp' : 'arrowDown',
            text: `${sig.type} @ ${sig.price}`,
            size: 1.5,
          });
        }
      }
      candleSeriesRef.current.setMarkers(markers.sort((a, b) => Number(a.time) - Number(b.time)));
    } else {
      candleSeriesRef.current.setMarkers([]);
    }

    // Auto-fit content once on initial load
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [displayCandles, indicators, signals]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: isCompact ? '260px' : '440px' }}>
      {/* Dynamic Header Legend */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '14px',
          zIndex: 10,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(11, 12, 19, 0.75)',
          backdropFilter: 'blur(8px)',
          padding: '6px 12px',
          borderRadius: '6px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          pointerEvents: 'none',
          fontSize: isCompact ? '11px' : '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontWeight: 700, color: '#f8fafc', letterSpacing: '0.5px' }}>{symbolId}</span>
          <span
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 600,
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
            }}
          >
            {timeframe}
          </span>
        </div>

        {legendInfo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }} className="font-mono">
            <span>
              O: <strong style={{ color: '#f8fafc' }}>{legendInfo.open}</strong>
            </span>
            <span>
              H: <strong style={{ color: '#10b981' }}>{legendInfo.high}</strong>
            </span>
            <span>
              L: <strong style={{ color: '#f43f5e' }}>{legendInfo.low}</strong>
            </span>
            <span>
              C: <strong style={{ color: legendInfo.change >= 0 ? '#10b981' : '#f43f5e' }}>{legendInfo.close}</strong>
            </span>
            <span style={{ color: legendInfo.change >= 0 ? '#10b981' : '#f43f5e', fontWeight: 600 }}>
              {legendInfo.change >= 0 ? '+' : ''}
              {legendInfo.change.toFixed(2)} ({legendInfo.changePercent >= 0 ? '+' : ''}
              {legendInfo.changePercent.toFixed(2)}%)
            </span>
          </div>
        )}

        {/* Indicators Active Labels */}
        <div style={{ display: 'flex', gap: '6px', fontSize: '10px' }}>
          {indicators.showEma20 && <span style={{ color: '#38bdf8' }}>EMA 20</span>}
          {indicators.showEma50 && <span style={{ color: '#fbbf24' }}>EMA 50</span>}
          {indicators.showEma200 && <span style={{ color: '#a855f7' }}>EMA 200</span>}
          {indicators.showBollingerBands && <span style={{ color: '#60a5fa' }}>BB(20,2)</span>}
          {indicators.showVolumeProfile && <span style={{ color: '#f59e0b' }}>VRVP</span>}
        </div>
      </div>

      {/* Main Chart Canvas Container */}
      <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Visible Range Volume Profile (VRVP) Overlay Sidebar on the Right */}
      {indicators.showVolumeProfile && volumeProfileData && volumeProfileData.bars.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '40px',
            bottom: '40px',
            right: '65px',
            width: isCompact ? '90px' : '150px',
            pointerEvents: 'none',
            zIndex: 5,
            display: 'flex',
            flexDirection: 'column-reverse',
            justifyContent: 'space-between',
          }}
        >
          {(() => {
            const maxVol = Math.max(...volumeProfileData.bars.map(b => b.totalVolume), 1);
            return volumeProfileData.bars.map((bar, idx) => {
              const widthPct = (bar.totalVolume / maxVol) * 100;
              const buyPct = (bar.buyVolume / (bar.totalVolume || 1)) * 100;

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    height: `${100 / volumeProfileData.bars.length}%`,
                    position: 'relative',
                  }}
                >
                  {/* POC Line Tag */}
                  {bar.isPoc && (
                    <div
                      style={{
                        position: 'absolute',
                        right: '100%',
                        marginRight: '6px',
                        background: '#f59e0b',
                        color: '#000',
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '1px 4px',
                        borderRadius: '2px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      POC {bar.price}
                    </div>
                  )}

                  {/* VAH Tag */}
                  {bar.isVah && (
                    <div
                      style={{
                        position: 'absolute',
                        right: '100%',
                        marginRight: '6px',
                        background: '#38bdf8',
                        color: '#000',
                        fontSize: '8px',
                        fontWeight: 700,
                        padding: '1px 3px',
                        borderRadius: '2px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      VAH
                    </div>
                  )}

                  {/* VAL Tag */}
                  {bar.isVal && (
                    <div
                      style={{
                        position: 'absolute',
                        right: '100%',
                        marginRight: '6px',
                        background: '#a855f7',
                        color: '#fff',
                        fontSize: '8px',
                        fontWeight: 700,
                        padding: '1px 3px',
                        borderRadius: '2px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      VAL
                    </div>
                  )}

                  {/* Split Buy/Sell Volume Bar */}
                  <div
                    style={{
                      width: `${widthPct}%`,
                      height: '75%',
                      display: 'flex',
                      borderRadius: '2px',
                      overflow: 'hidden',
                      opacity: bar.isPoc ? 0.95 : 0.65,
                      boxShadow: bar.isPoc ? '0 0 8px rgba(245, 158, 11, 0.6)' : 'none',
                    }}
                  >
                    <div style={{ width: `${buyPct}%`, background: '#0284c7' }} />
                    <div style={{ width: `${100 - buyPct}%`, background: '#f59e0b' }} />
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* Price Alert Levels Overlay Lines */}
      {alerts
        .filter(a => a.symbol === symbolId && !a.triggered)
        .map(alert => (
          <div
            key={alert.id}
            style={{
              position: 'absolute',
              right: '65px',
              left: '14px',
              height: '1px',
              borderTop: '1px dashed #f59e0b',
              pointerEvents: 'none',
              zIndex: 4,
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                background: '#f59e0b',
                color: '#000',
                fontSize: '9px',
                fontWeight: 700,
                padding: '1px 5px',
                borderRadius: '2px',
                transform: 'translateY(-50%)',
              }}
            >
              🔔 Alert {currency === 'INR' ? '₹' : '$'}
              {alert.targetPrice}
            </span>
          </div>
        ))}
    </div>
  );
};
