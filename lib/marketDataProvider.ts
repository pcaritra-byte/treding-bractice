import { Candle, SymbolInfo, Timeframe } from './types';

export interface MarketDataProvider {
  id: string;
  name: string;
  getCandles(symbol: string, timeframe: Timeframe, count?: number): Promise<Candle[]>;
  getQuote(symbol: string): Promise<SymbolInfo | null>;
  subscribeQuotes(symbols: string[], onUpdate: (quote: SymbolInfo) => void): () => void;
}

export const INITIAL_SYMBOLS: SymbolInfo[] = [
  {
    id: 'BTCUSD',
    name: 'BTC/USD',
    fullName: 'Bitcoin / US Dollar',
    category: 'crypto',
    price: 67420.5,
    change: 1420.3,
    changePercent: 2.15,
    high24h: 68150.0,
    low24h: 65900.0,
    volume24h: '$28.4B',
    currency: 'USD',
    decimals: 2,
  },
  {
    id: 'ETHUSD',
    name: 'ETH/USD',
    fullName: 'Ethereum / US Dollar',
    category: 'crypto',
    price: 3540.2,
    change: -42.8,
    changePercent: -1.19,
    high24h: 3615.0,
    low24h: 3480.0,
    volume24h: '$14.2B',
    currency: 'USD',
    decimals: 2,
  },
  {
    id: 'NIFTY',
    name: 'NIFTY 50',
    fullName: 'NIFTY 50 Index (NSE)',
    category: 'indian_equity',
    price: 24850.3,
    change: 178.6,
    changePercent: 0.72,
    high24h: 24920.0,
    low24h: 24680.0,
    volume24h: '₹18,450 Cr',
    currency: 'INR',
    decimals: 2,
  },
  {
    id: 'RELIANCE',
    name: 'RELIANCE',
    fullName: 'Reliance Industries Ltd.',
    category: 'indian_equity',
    price: 2940.75,
    change: 32.4,
    changePercent: 1.11,
    high24h: 2965.0,
    low24h: 2905.0,
    volume24h: '₹2,340 Cr',
    currency: 'INR',
    decimals: 2,
  },
  {
    id: 'BANKNIFTY',
    name: 'BANK NIFTY',
    fullName: 'Nifty Bank Index (NSE)',
    category: 'indian_equity',
    price: 51210.6,
    change: -115.4,
    changePercent: -0.22,
    high24h: 51580.0,
    low24h: 51040.0,
    volume24h: '₹12,120 Cr',
    currency: 'INR',
    decimals: 2,
  },
  {
    id: 'SOLUSD',
    name: 'SOL/USD',
    fullName: 'Solana / US Dollar',
    category: 'crypto',
    price: 154.8,
    change: 6.9,
    changePercent: 4.66,
    high24h: 158.2,
    low24h: 147.5,
    volume24h: '$3.8B',
    currency: 'USD',
    decimals: 2,
  },
  {
    id: 'AAPL',
    name: 'AAPL',
    fullName: 'Apple Inc.',
    category: 'us_stock',
    price: 228.4,
    change: 1.85,
    changePercent: 0.82,
    high24h: 230.1,
    low24h: 226.5,
    volume24h: '$4.1B',
    currency: 'USD',
    decimals: 2,
  },
  {
    id: 'TSLA',
    name: 'TSLA',
    fullName: 'Tesla Inc.',
    category: 'us_stock',
    price: 218.9,
    change: -3.7,
    changePercent: -1.66,
    high24h: 224.0,
    low24h: 216.2,
    volume24h: '$6.2B',
    currency: 'USD',
    decimals: 2,
  },
];

// Timeframe multiplier in seconds
export function timeframeToSeconds(tf: Timeframe): number {
  switch (tf) {
    case '1m':
      return 60;
    case '5m':
      return 300;
    case '15m':
      return 900;
    case '1h':
      return 3600;
    case '4h':
      return 14400;
    case '1D':
      return 86400;
    case '1W':
      return 604800;
    default:
      return 3600;
  }
}

// Generate high quality synthetic candles with realistic Brownian motion & volatility clusters
export function generateSyntheticCandles(
  symbolId: string,
  basePrice: number,
  timeframe: Timeframe,
  count: number = 180
): Candle[] {
  const stepSeconds = timeframeToSeconds(timeframe);
  const now = Math.floor(Date.now() / 1000);
  const startTime = now - count * stepSeconds;

  const candles: Candle[] = [];
  let currentPrice = basePrice * 0.94; // Start slightly lower so trend has context

  // Volatility scaling by timeframe
  const volatility =
    timeframe === '1m'
      ? 0.0015
      : timeframe === '5m'
      ? 0.003
      : timeframe === '15m'
      ? 0.005
      : timeframe === '1h'
      ? 0.009
      : timeframe === '4h'
      ? 0.018
      : 0.028;

  for (let i = 0; i < count; i++) {
    const candleTime = startTime + i * stepSeconds;

    // Mean reverting random walk with wave drift
    const wave = Math.sin(i / 14) * 0.003 + Math.cos(i / 28) * 0.002;
    const randomShock = (Math.random() - 0.49) * volatility * currentPrice;
    const delta = randomShock + wave * currentPrice;

    const open = currentPrice;
    let close = open + delta;

    // High and Low with realistic wick extensions
    const maxBody = Math.max(open, close);
    const minBody = Math.min(open, close);

    const upperWick = Math.random() * volatility * currentPrice * 1.2;
    const lowerWick = Math.random() * volatility * currentPrice * 1.2;

    const high = maxBody + upperWick;
    const low = Math.max(0.1, minBody - lowerWick);

    // Realistic volume calculation with spikes on larger candles
    const candleSize = Math.abs(close - open);
    const relativeSize = candleSize / (currentPrice * volatility + 0.0001);
    const baseVol = symbolId.includes('BTC') ? 120 : symbolId.includes('NIFTY') ? 4500 : 850;
    const volume = Math.round(baseVol * (0.6 + Math.random() * 0.8 + relativeSize * 1.5));

    const isBullish = close >= open;
    const buyVol = Math.round(volume * (isBullish ? 0.65 : 0.35));
    const sellVol = volume - buyVol;

    candles.push({
      time: candleTime,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
      buyVolume: buyVol,
      sellVolume: sellVol,
    });

    currentPrice = close;
  }

  // Adjust last candle close to match current base price closely
  const diff = basePrice - currentPrice;
  if (Math.abs(diff) > 0.001) {
    const adjustFactor = basePrice / currentPrice;
    for (let j = 0; j < candles.length; j++) {
      const blend = j / (candles.length - 1);
      const factor = 1 + (adjustFactor - 1) * blend;
      candles[j].open = Number((candles[j].open * factor).toFixed(2));
      candles[j].high = Number((candles[j].high * factor).toFixed(2));
      candles[j].low = Number((candles[j].low * factor).toFixed(2));
      candles[j].close = Number((candles[j].close * factor).toFixed(2));
    }
  }

  return candles;
}

// 1. Crypto Provider Adapter
export class CryptoProviderAdapter implements MarketDataProvider {
  id = 'crypto_adapter';
  name = 'Crypto Public / Synthetic Feed';

  async getCandles(symbol: string, timeframe: Timeframe, count: number = 200): Promise<Candle[]> {
    const sym = INITIAL_SYMBOLS.find(s => s.id === symbol) || INITIAL_SYMBOLS[0];
    return generateSyntheticCandles(symbol, sym.price, timeframe, count);
  }

  async getQuote(symbol: string): Promise<SymbolInfo | null> {
    const sym = INITIAL_SYMBOLS.find(s => s.id === symbol);
    return sym || null;
  }

  subscribeQuotes(symbols: string[], onUpdate: (quote: SymbolInfo) => void): () => void {
    const interval = setInterval(() => {
      for (const symId of symbols) {
        const found = INITIAL_SYMBOLS.find(s => s.id === symId && s.category === 'crypto');
        if (found) {
          const delta = (Math.random() - 0.495) * 0.002 * found.price;
          const newPrice = Number((found.price + delta).toFixed(found.decimals));
          const updated: SymbolInfo = {
            ...found,
            price: newPrice,
            change: Number((newPrice - (found.price - found.change)).toFixed(found.decimals)),
            changePercent: Number((((newPrice - (found.price - found.change)) / (found.price - found.change)) * 100).toFixed(2)),
          };
          onUpdate(updated);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }
}

// 2. Indian Equities Provider Adapter
export class IndianEquitiesAdapter implements MarketDataProvider {
  id = 'indian_equities_adapter';
  name = 'NSE/BSE Indian Equities Provider';

  async getCandles(symbol: string, timeframe: Timeframe, count: number = 200): Promise<Candle[]> {
    const sym = INITIAL_SYMBOLS.find(s => s.id === symbol) || INITIAL_SYMBOLS[2];
    return generateSyntheticCandles(symbol, sym.price, timeframe, count);
  }

  async getQuote(symbol: string): Promise<SymbolInfo | null> {
    const sym = INITIAL_SYMBOLS.find(s => s.id === symbol);
    return sym || null;
  }

  subscribeQuotes(symbols: string[], onUpdate: (quote: SymbolInfo) => void): () => void {
    const interval = setInterval(() => {
      for (const symId of symbols) {
        const found = INITIAL_SYMBOLS.find(s => s.id === symId && s.category === 'indian_equity');
        if (found) {
          const delta = (Math.random() - 0.495) * 0.0015 * found.price;
          const newPrice = Number((found.price + delta).toFixed(found.decimals));
          const updated: SymbolInfo = {
            ...found,
            price: newPrice,
            change: Number((newPrice - (found.price - found.change)).toFixed(found.decimals)),
            changePercent: Number((((newPrice - (found.price - found.change)) / (found.price - found.change)) * 100).toFixed(2)),
          };
          onUpdate(updated);
        }
      }
    }, 2500);

    return () => clearInterval(interval);
  }
}

// 3. Composite Provider Router
export class CompositeMarketDataProvider implements MarketDataProvider {
  id = 'composite_provider';
  name = 'ChartPilot Multi-Asset Composite Engine';

  private cryptoAdapter = new CryptoProviderAdapter();
  private indianAdapter = new IndianEquitiesAdapter();

  private getAdapterForSymbol(symbol: string): MarketDataProvider {
    const sym = INITIAL_SYMBOLS.find(s => s.id === symbol);
    if (sym?.category === 'indian_equity') {
      return this.indianAdapter;
    }
    return this.cryptoAdapter;
  }

  async getCandles(symbol: string, timeframe: Timeframe, count?: number): Promise<Candle[]> {
    const adapter = this.getAdapterForSymbol(symbol);
    return adapter.getCandles(symbol, timeframe, count);
  }

  async getQuote(symbol: string): Promise<SymbolInfo | null> {
    const adapter = this.getAdapterForSymbol(symbol);
    return adapter.getQuote(symbol);
  }

  subscribeQuotes(symbols: string[], onUpdate: (quote: SymbolInfo) => void): () => void {
    const unsubCrypto = this.cryptoAdapter.subscribeQuotes(symbols, onUpdate);
    const unsubIndian = this.indianAdapter.subscribeQuotes(symbols, onUpdate);

    return () => {
      unsubCrypto();
      unsubIndian();
    };
  }
}

export const defaultDataProvider = new CompositeMarketDataProvider();
