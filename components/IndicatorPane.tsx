'use client';

import React, { useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  IChartApi,
  Time,
} from 'lightweight-charts';
import { Candle } from '@/lib/types';
import { calculateRSI, calculateMACD } from '@/lib/indicators';

interface IndicatorPaneProps {
  candles: Candle[];
  type: 'rsi' | 'macd';
  height?: number;
}

export const IndicatorPane: React.FC<IndicatorPaneProps> = ({
  candles,
  type,
  height = 130,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const container = containerRef.current;
    const chart = createChart(container, {
      width: container.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: '#090a10' },
        textColor: '#64748b',
        fontSize: 10,
        fontFamily: "'Outfit', sans-serif",
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.02)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.04)' },
      },
      timeScale: {
        visible: false, // Synced visually with main chart
        borderColor: 'transparent',
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.06)',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
    });

    chartRef.current = chart;

    if (type === 'rsi') {
      const rsiSeries = chart.addLineSeries({
        color: '#a855f7',
        lineWidth: 2,
        priceFormat: {
          type: 'price',
          precision: 1,
          minMove: 0.1,
        },
      });

      // 70 overbought level
      const overboughtLine = chart.addLineSeries({
        color: 'rgba(244, 63, 94, 0.4)',
        lineWidth: 1,
        lineStyle: 2,
        priceLineVisible: false,
      });

      // 30 oversold level
      const oversoldLine = chart.addLineSeries({
        color: 'rgba(16, 185, 129, 0.4)',
        lineWidth: 1,
        lineStyle: 2,
        priceLineVisible: false,
      });

      const rsiData = calculateRSI(candles, 14);
      if (rsiData.length > 0) {
        rsiSeries.setData(rsiData.map(d => ({ time: d.time as Time, value: d.value })));
        overboughtLine.setData(rsiData.map(d => ({ time: d.time as Time, value: 70 })));
        oversoldLine.setData(rsiData.map(d => ({ time: d.time as Time, value: 30 })));
      }
    } else if (type === 'macd') {
      const macdData = calculateMACD(candles, 12, 26, 9);

      const histSeries = chart.addHistogramSeries({
        priceFormat: {
          type: 'price',
          precision: 2,
          minMove: 0.01,
        },
      });

      const macdLineSeries = chart.addLineSeries({
        color: '#38bdf8',
        lineWidth: 2,
      });

      const signalLineSeries = chart.addLineSeries({
        color: '#fbbf24',
        lineWidth: 2,
      });

      if (macdData.histogram.length > 0) {
        histSeries.setData(
          macdData.histogram.map(h => ({
            time: h.time as Time,
            value: h.value,
            color: h.color,
          }))
        );
        macdLineSeries.setData(
          macdData.macdLine.map(m => ({
            time: m.time as Time,
            value: m.value,
          }))
        );
        signalLineSeries.setData(
          macdData.signalLine.map(s => ({
            time: s.time as Time,
            value: s.value,
          }))
        );
      }
    }

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartRef.current && container) {
        chartRef.current.applyOptions({
          width: container.clientWidth,
          height,
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
  }, [candles, type, height]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: `${height}px`,
        borderTop: '1px solid var(--border-subtle)',
        background: '#090a10',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '4px',
          left: '12px',
          zIndex: 10,
          fontSize: '11px',
          fontWeight: 600,
          color: type === 'rsi' ? '#a855f7' : '#38bdf8',
          letterSpacing: '0.5px',
          pointerEvents: 'none',
        }}
      >
        {type === 'rsi' ? 'RSI (14) — [30 / 70]' : 'MACD (12, 26, 9) — Fast/Signal/Delta'}
      </div>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
