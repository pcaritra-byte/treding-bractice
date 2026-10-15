export type AssetCategory = 'crypto' | 'indian_equity' | 'us_stock';

export interface SymbolInfo {
  id: string;
  name: string;
  fullName: string;
  category: AssetCategory;
  price: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  currency: 'USD' | 'INR';
  decimals: number;
}

export interface Candle {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  buyVolume?: number;
  sellVolume?: number;
}

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1D' | '1W';

export interface IndicatorSettings {
  showEma20: boolean;
  showEma50: boolean;
  showEma200: boolean;
  showBollingerBands: boolean;
  showVolumeProfile: boolean;
  showRsi: boolean;
  showMacd: boolean;
  showSignals: boolean;
}

export type LayoutMode = '1' | '2-h' | '2-v' | '4';

export interface Signal {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  indicator: 'EMA_CROSS' | 'RSI_REVERSAL' | 'BREAKOUT' | 'SUPERTREND';
  price: number;
  timestamp: number;
  stopLoss: number;
  targetPrice: number;
  confidence: number; // 0 - 100%
  reasonEn: string;
  reasonBn: string;
  reasonHi?: string;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'CROSS_UP' | 'CROSS_DOWN';
  createdAt: number;
  triggered: boolean;
  triggeredAt?: number;
  notes?: string;
}

export interface Position {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  quantity: number;
  currentPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  stopLoss?: number;
  takeProfit?: number;
  openedAt: number;
}

export interface Order {
  id: string;
  symbol: string;
  type: 'MARKET' | 'LIMIT';
  side: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  status: 'PENDING' | 'FILLED' | 'CANCELLED';
  stopLoss?: number;
  takeProfit?: number;
  createdAt: number;
}

export interface ClosedTrade {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  closedAt: number;
}

export interface VolumeProfileBar {
  price: number;
  buyVolume: number;
  sellVolume: number;
  totalVolume: number;
  isPoc: boolean;
  isVah: boolean;
  isVal: boolean;
}

export interface ChartPaneConfig {
  id: string;
  symbolId: string;
  timeframe: Timeframe;
}
