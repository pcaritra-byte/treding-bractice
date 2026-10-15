import { NextRequest, NextResponse } from 'next/server';
import { defaultDataProvider, INITIAL_SYMBOLS } from '@/lib/marketDataProvider';
import { Timeframe } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'candles';
  const symbol = searchParams.get('symbol') || 'BTCUSD';
  const timeframe = (searchParams.get('timeframe') as Timeframe) || '1h';
  const count = parseInt(searchParams.get('count') || '180', 10);

  try {
    if (action === 'symbols') {
      return NextResponse.json({
        success: true,
        data: INITIAL_SYMBOLS,
        provider: defaultDataProvider.name,
      });
    }

    if (action === 'quote') {
      const quote = await defaultDataProvider.getQuote(symbol);
      return NextResponse.json({
        success: true,
        data: quote,
        timestamp: Math.floor(Date.now() / 1000),
      });
    }

    // Default: getCandles
    const candles = await defaultDataProvider.getCandles(symbol, timeframe, count);
    return NextResponse.json({
      success: true,
      symbol,
      timeframe,
      count: candles.length,
      data: candles,
      status: 'DEMO_SYNTHETIC',
      provider: defaultDataProvider.name,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch market data',
      },
      { status: 500 }
    );
  }
}
