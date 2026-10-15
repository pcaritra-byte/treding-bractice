import { Candle, VolumeProfileBar, Signal } from './types';

// Simple Moving Average
export function calculateSMA(data: Candle[], period: number): { time: number; value: number }[] {
  const result: { time: number; value: number }[] = [];
  if (data.length < period) return result;

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    result.push({
      time: data[i].time,
      value: Number((sum / period).toFixed(2)),
    });
  }
  return result;
}

// Exponential Moving Average
export function calculateEMA(data: Candle[], period: number): { time: number; value: number }[] {
  const result: { time: number; value: number }[] = [];
  if (data.length < period) return result;

  const k = 2 / (period + 1);

  // Initial SMA as first EMA value
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
  }
  let currentEma = sum / period;
  result.push({
    time: data[period - 1].time,
    value: Number(currentEma.toFixed(2)),
  });

  for (let i = period; i < data.length; i++) {
    currentEma = data[i].close * k + currentEma * (1 - k);
    result.push({
      time: data[i].time,
      value: Number(currentEma.toFixed(2)),
    });
  }
  return result;
}

// Bollinger Bands (period: 20, multiplier: 2)
export function calculateBollingerBands(
  data: Candle[],
  period: number = 20,
  stdDevMultiplier: number = 2
): {
  upper: { time: number; value: number }[];
  middle: { time: number; value: number }[];
  lower: { time: number; value: number }[];
} {
  const upper: { time: number; value: number }[] = [];
  const middle: { time: number; value: number }[] = [];
  const lower: { time: number; value: number }[] = [];

  if (data.length < period) return { upper, middle, lower };

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    const mean = sum / period;

    let varianceSum = 0;
    for (let j = 0; j < period; j++) {
      varianceSum += Math.pow(data[i - j].close - mean, 2);
    }
    const stdDev = Math.sqrt(varianceSum / period);

    const t = data[i].time;
    middle.push({ time: t, value: Number(mean.toFixed(2)) });
    upper.push({ time: t, value: Number((mean + stdDevMultiplier * stdDev).toFixed(2)) });
    lower.push({ time: t, value: Number((mean - stdDevMultiplier * stdDev).toFixed(2)) });
  }

  return { upper, middle, lower };
}

// Relative Strength Index (RSI 14)
export function calculateRSI(data: Candle[], period: number = 14): { time: number; value: number }[] {
  const result: { time: number; value: number }[] = [];
  if (data.length <= period) return result;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = data[i].close - data[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let rsi = 100 - 100 / (1 + rs);
  result.push({ time: data[period].time, value: Number(rsi.toFixed(2)) });

  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close;
    const currentGain = diff > 0 ? diff : 0;
    const currentLoss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi = 100 - 100 / (1 + rs);
    result.push({ time: data[i].time, value: Number(rsi.toFixed(2)) });
  }

  return result;
}

// MACD (12, 26, 9)
export function calculateMACD(
  data: Candle[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): {
  macdLine: { time: number; value: number }[];
  signalLine: { time: number; value: number }[];
  histogram: { time: number; value: number; color: string }[];
} {
  const fastEma = calculateEMA(data, fastPeriod);
  const slowEma = calculateEMA(data, slowPeriod);

  const macdMap = new Map<number, number>();
  const macdSeries: { time: number; value: number }[] = [];

  const fastMap = new Map(fastEma.map(e => [e.time, e.value]));

  for (const slow of slowEma) {
    const fastVal = fastMap.get(slow.time);
    if (fastVal !== undefined) {
      const diff = fastVal - slow.value;
      macdMap.set(slow.time, diff);
      macdSeries.push({ time: slow.time, value: Number(diff.toFixed(2)) });
    }
  }

  // Calculate signal line as EMA of macdSeries
  const signalLine: { time: number; value: number }[] = [];
  const histogram: { time: number; value: number; color: string }[] = [];

  if (macdSeries.length < signalPeriod) {
    return { macdLine: macdSeries, signalLine, histogram };
  }

  const k = 2 / (signalPeriod + 1);
  let sum = 0;
  for (let i = 0; i < signalPeriod; i++) {
    sum += macdSeries[i].value;
  }
  let currentSignal = sum / signalPeriod;
  signalLine.push({ time: macdSeries[signalPeriod - 1].time, value: Number(currentSignal.toFixed(2)) });

  for (let i = signalPeriod; i < macdSeries.length; i++) {
    currentSignal = macdSeries[i].value * k + currentSignal * (1 - k);
    const time = macdSeries[i].time;
    const signalVal = Number(currentSignal.toFixed(2));
    signalLine.push({ time, value: signalVal });

    const histVal = Number((macdSeries[i].value - signalVal).toFixed(2));
    histogram.push({
      time,
      value: histVal,
      color: histVal >= 0 ? '#10b981' : '#ef4444',
    });
  }

  return {
    macdLine: macdSeries,
    signalLine,
    histogram,
  };
}

// Visible Range Volume Profile (VRVP) Calculation
export function calculateVolumeProfile(
  candles: Candle[],
  bucketsCount: number = 28
): {
  bars: VolumeProfileBar[];
  pocPrice: number;
  vahPrice: number;
  valPrice: number;
} {
  if (candles.length === 0) {
    return { bars: [], pocPrice: 0, vahPrice: 0, valPrice: 0 };
  }

  let minPrice = Infinity;
  let maxPrice = -Infinity;

  for (const c of candles) {
    if (c.low < minPrice) minPrice = c.low;
    if (c.high > maxPrice) maxPrice = c.high;
  }

  if (minPrice === maxPrice) {
    minPrice *= 0.99;
    maxPrice *= 1.01;
  }

  const step = (maxPrice - minPrice) / bucketsCount;
  const buckets: { price: number; buyVol: number; sellVol: number; totalVol: number }[] = [];

  for (let i = 0; i < bucketsCount; i++) {
    buckets.push({
      price: Number((minPrice + (i + 0.5) * step).toFixed(2)),
      buyVol: 0,
      sellVol: 0,
      totalVol: 0,
    });
  }

  let totalVolumeAll = 0;

  for (const c of candles) {
    const isBull = c.close >= c.open;
    const buyFrac = isBull ? 0.65 : 0.35;
    const sellFrac = 1 - buyFrac;

    const bVol = (c.buyVolume ?? c.volume * buyFrac);
    const sVol = (c.sellVolume ?? c.volume * sellFrac);
    totalVolumeAll += c.volume;

    // Distribute candle across its price range
    const lowIdx = Math.max(0, Math.min(bucketsCount - 1, Math.floor((c.low - minPrice) / step)));
    const highIdx = Math.max(0, Math.min(bucketsCount - 1, Math.floor((c.high - minPrice) / step)));
    const span = Math.max(1, highIdx - lowIdx + 1);

    for (let idx = lowIdx; idx <= highIdx; idx++) {
      buckets[idx].buyVol += bVol / span;
      buckets[idx].sellVol += sVol / span;
      buckets[idx].totalVol += (bVol + sVol) / span;
    }
  }

  // Find POC (Point of Control)
  let maxVolIdx = 0;
  for (let i = 1; i < buckets.length; i++) {
    if (buckets[i].totalVol > buckets[maxVolIdx].totalVol) {
      maxVolIdx = i;
    }
  }
  const pocPrice = buckets[maxVolIdx].price;

  // Value Area: 70% of total volume around POC
  const targetVaVolume = totalVolumeAll * 0.70;
  let vaVolumeAccum = buckets[maxVolIdx].totalVol;
  let upIdx = maxVolIdx;
  let downIdx = maxVolIdx;

  while (vaVolumeAccum < targetVaVolume && (upIdx < bucketsCount - 1 || downIdx > 0)) {
    const nextUpVol = upIdx + 1 < bucketsCount ? buckets[upIdx + 1].totalVol : -1;
    const nextDownVol = downIdx - 1 >= 0 ? buckets[downIdx - 1].totalVol : -1;

    if (nextUpVol >= nextDownVol && upIdx + 1 < bucketsCount) {
      upIdx++;
      vaVolumeAccum += buckets[upIdx].totalVol;
    } else if (downIdx - 1 >= 0) {
      downIdx--;
      vaVolumeAccum += buckets[downIdx].totalVol;
    } else if (upIdx + 1 < bucketsCount) {
      upIdx++;
      vaVolumeAccum += buckets[upIdx].totalVol;
    } else {
      break;
    }
  }

  const vahPrice = buckets[upIdx].price;
  const valPrice = buckets[downIdx].price;

  const bars: VolumeProfileBar[] = buckets.map((b, idx) => ({
    price: b.price,
    buyVolume: Math.round(b.buyVol),
    sellVolume: Math.round(b.sellVol),
    totalVolume: Math.round(b.totalVol),
    isPoc: idx === maxVolIdx,
    isVah: idx === upIdx,
    isVal: idx === downIdx,
  }));

  return { bars, pocPrice, vahPrice, valPrice };
}

// Generate Rule-Based Technical Signals
export function generateSignals(symbol: string, candles: Candle[]): Signal[] {
  const signals: Signal[] = [];
  if (candles.length < 50) return signals;

  const ema20 = calculateEMA(candles, 20);
  const ema50 = calculateEMA(candles, 50);
  const rsi = calculateRSI(candles, 14);

  const ema20Map = new Map(ema20.map(e => [e.time, e.value]));
  const ema50Map = new Map(ema50.map(e => [e.time, e.value]));
  const rsiMap = new Map(rsi.map(r => [r.time, r.value]));

  for (let i = 25; i < candles.length; i++) {
    const curr = candles[i];
    const prev = candles[i - 1];

    const e20Curr = ema20Map.get(curr.time);
    const e50Curr = ema50Map.get(curr.time);
    const e20Prev = ema20Map.get(prev.time);
    const e50Prev = ema50Map.get(prev.time);

    const rCurr = rsiMap.get(curr.time);
    const rPrev = rsiMap.get(prev.time);

    // 1. Golden Cross (EMA 20 crossing above EMA 50)
    if (e20Curr && e50Curr && e20Prev && e50Prev) {
      if (e20Prev <= e50Prev && e20Curr > e50Curr) {
        signals.push({
          id: `sig-ema-buy-${curr.time}`,
          symbol,
          type: 'BUY',
          indicator: 'EMA_CROSS',
          price: curr.close,
          timestamp: curr.time,
          stopLoss: Number((curr.close * 0.985).toFixed(2)),
          targetPrice: Number((curr.close * 1.035).toFixed(2)),
          confidence: 84,
          reasonEn: 'Bullish Golden Cross: EMA 20 crossed above EMA 50 with rising momentum',
          reasonBn: 'বুলিশ গোল্ডেন ক্রস: EMA 20 লাইনটি EMA 50-এর উপরে উঠেছে, ঊর্ধ্বমুখী গতি',
          reasonHi: 'बुलिश गोल्डन क्रॉस: EMA 20 रेखा EMA 50 के ऊपर निकली, तेजी का मजबूत संकेत',
        });
      } else if (e20Prev >= e50Prev && e20Curr < e50Curr) {
        signals.push({
          id: `sig-ema-sell-${curr.time}`,
          symbol,
          type: 'SELL',
          indicator: 'EMA_CROSS',
          price: curr.close,
          timestamp: curr.time,
          stopLoss: Number((curr.close * 1.015).toFixed(2)),
          targetPrice: Number((curr.close * 0.965).toFixed(2)),
          confidence: 81,
          reasonEn: 'Bearish Death Cross: EMA 20 crossed below EMA 50',
          reasonBn: 'বেয়ারিশ ডেথ ক্রস: EMA 20 লাইনটি EMA 50-এর নিচে নেমে গেছে, নিম্নমুখী প্রবণতা',
          reasonHi: 'बेयरिश डेथ क्रॉस: EMA 20 रेखा EMA 50 के नीचे गिरी, मंदी का संकेत',
        });
      }
    }

    // 2. RSI Oversold Bounce / Overbought Reversal
    if (rCurr !== undefined && rPrev !== undefined) {
      if (rPrev < 30 && rCurr >= 30) {
        signals.push({
          id: `sig-rsi-buy-${curr.time}`,
          symbol,
          type: 'BUY',
          indicator: 'RSI_REVERSAL',
          price: curr.close,
          timestamp: curr.time,
          stopLoss: Number((curr.close * 0.988).toFixed(2)),
          targetPrice: Number((curr.close * 1.028).toFixed(2)),
          confidence: 78,
          reasonEn: 'RSI Oversold Recovery: Bouncing out of extreme oversold territory (< 30)',
          reasonBn: 'RSI ওভারসোল্ড রিকভারি: চরম বিক্রি হওয়া অবস্থা থেকে রিবাউন্ড করছে',
          reasonHi: 'RSI ओवरसोल्ड रिकवरी: अत्यधिक बिकवाली क्षेत्र (< 30) से मजबूत उछाल',
        });
      } else if (rPrev > 70 && rCurr <= 70) {
        signals.push({
          id: `sig-rsi-sell-${curr.time}`,
          symbol,
          type: 'SELL',
          indicator: 'RSI_REVERSAL',
          price: curr.close,
          timestamp: curr.time,
          stopLoss: Number((curr.close * 1.012).toFixed(2)),
          targetPrice: Number((curr.close * 0.975).toFixed(2)),
          confidence: 76,
          reasonEn: 'RSI Overbought Rejection: Cooling off from overbought zone (> 70)',
          reasonBn: 'RSI ওভারবট রিজেকশন: অতিরিক্ত কেনা স্তর (> ৭০) থেকে রেজিস্ট্যান্স পেয়ে নিচে নামছে',
          reasonHi: 'RSI ओवरबॉट रिजेक्शन: अत्यधिक खरीद क्षेत्र (> 70) से प्रतिरोध लेकर गिरावट',
        });
      }
    }
  }

  // Return the latest 15 signals sorted newest first
  return signals.sort((a, b) => b.timestamp - a.timestamp).slice(0, 15);
}
