import React, { useState } from 'react';
import { IndicatorSettings, LayoutMode, SymbolInfo, Timeframe } from '@/lib/types';
import { translations, Language, SUPPORTED_LANGUAGES } from '@/lib/translations';
import {
  TrendingUp,
  LayoutGrid,
  Square,
  Columns2,
  Rows2,
  Grid2x2,
  SlidersHorizontal,
  Bell,
  PlayCircle,
  BookOpen,
  Globe,
  Layers,
  ChevronDown,
  Sparkles,
  Zap,
  Check,
} from 'lucide-react';

interface HeaderToolbarProps {
  currentSymbol: SymbolInfo;
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  layout: LayoutMode;
  onLayoutChange: (layout: LayoutMode) => void;
  indicators: IndicatorSettings;
  onToggleIndicator: (key: keyof IndicatorSettings) => void;
  onOpenAlerts: () => void;
  alertsCount: number;
  isReplayActive: boolean;
  onToggleReplay: () => void;
  onOpenGuide: () => void;
  lang: Language;
  onSelectLang: (lang: Language) => void;
  activeRightTab: 'paper' | 'book' | 'signals';
  onSelectRightTab: (tab: 'paper' | 'book' | 'signals') => void;
}

export const HeaderToolbar: React.FC<HeaderToolbarProps> = ({
  currentSymbol,
  timeframe,
  onTimeframeChange,
  layout,
  onLayoutChange,
  indicators,
  onToggleIndicator,
  onOpenAlerts,
  alertsCount,
  isReplayActive,
  onToggleReplay,
  onOpenGuide,
  lang,
  onSelectLang,
  activeRightTab,
  onSelectRightTab,
}) => {
  const t = translations[lang];
  const [showIndicatorsMenu, setShowIndicatorsMenu] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const timeframes: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1D', '1W'];

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        userSelect: 'none',
      }}
    >
      {/* Left: Brand & Symbol Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow-cyan)',
            }}
          >
            <TrendingUp size={16} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '0.5px', color: '#f8fafc' }}>
                ChartPilot
              </span>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: '3px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: 'var(--accent-cyan)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                PRO
              </span>
            </div>
          </div>
        </div>

        <div style={{ width: '1px', height: '22px', background: 'var(--border-subtle)' }} />

        {/* Current Active Symbol & Live Price */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, fontSize: '13px' }}>{currentSymbol.name}</span>
              <span className="pulse-dot" />
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{currentSymbol.fullName}</div>
          </div>

          <div className="font-mono" style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#f8fafc' }}>
              {currentSymbol.currency === 'INR' ? '₹' : '$'}
              {currentSymbol.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: currentSymbol.change >= 0 ? 'var(--bull-green)' : 'var(--bear-red)',
              }}
            >
              {currentSymbol.change >= 0 ? '+' : ''}
              {currentSymbol.change.toFixed(2)} ({currentSymbol.changePercent >= 0 ? '+' : ''}
              {currentSymbol.changePercent.toFixed(2)}%)
            </div>
          </div>
        </div>

        <div style={{ width: '1px', height: '22px', background: 'var(--border-subtle)' }} />

        {/* Timeframes Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'var(--bg-tertiary)', padding: '2px', borderRadius: '5px' }}>
          {timeframes.map(tf => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              style={{
                background: timeframe === tf ? 'var(--accent-blue)' : 'transparent',
                color: timeframe === tf ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                padding: '3px 7px',
                borderRadius: '3px',
                fontSize: '11px',
                fontWeight: timeframe === tf ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Center & Right Toolbar: Indicators, Multi-Chart, Replay, Alerts, Language, Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Indicators Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowIndicatorsMenu(!showIndicatorsMenu)}
            className="btn"
            style={{ padding: '5px 10px', fontSize: '11px' }}
          >
            <SlidersHorizontal size={13} color="var(--accent-cyan)" />
            <span>{t.indicators}</span>
            <ChevronDown size={11} />
          </button>

          {showIndicatorsMenu && (
            <div
              className="glass-panel animate-fade-in"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '6px',
                zIndex: 50,
                width: '220px',
                padding: '8px',
                background: 'var(--bg-elevated)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                Technical Overlays
              </div>

              {[
                { key: 'showEma20', label: 'EMA 20 (Short Trend)', color: '#38bdf8' },
                { key: 'showEma50', label: 'EMA 50 (Medium Trend)', color: '#fbbf24' },
                { key: 'showEma200', label: 'EMA 200 (Long Trend)', color: '#a855f7' },
                { key: 'showBollingerBands', label: 'Bollinger Bands (20, 2)', color: '#60a5fa' },
                { key: 'showVolumeProfile', label: 'Volume Profile (POC/VAH)', color: '#f59e0b' },
                { key: 'showRsi', label: 'RSI Oscillator (14)', color: '#c084fc' },
                { key: 'showMacd', label: 'MACD (12, 26, 9)', color: '#38bdf8' },
                { key: 'showSignals', label: 'Buy/Sell Algo Signals', color: '#10b981' },
              ].map(item => (
                <label
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '5px 6px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <input
                    type="checkbox"
                    checked={indicators[item.key as keyof IndicatorSettings]}
                    onChange={() => onToggleIndicator(item.key as keyof IndicatorSettings)}
                    style={{ accentColor: item.color }}
                  />
                  <span style={{ color: item.color, fontWeight: 500 }}>{item.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Multi-Chart Layout Switcher Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowLayoutMenu(!showLayoutMenu)}
            className="btn"
            style={{ padding: '5px 10px', fontSize: '11px' }}
            title={t.layout}
          >
            {layout === '1' ? <Square size={13} /> : layout === '2-h' ? <Columns2 size={13} /> : layout === '2-v' ? <Rows2 size={13} /> : <Grid2x2 size={13} />}
            <span>{layout === '1' ? '1 Chart' : layout === '4' ? '4 Charts (Quad)' : '2 Split'}</span>
            <ChevronDown size={11} />
          </button>

          {showLayoutMenu && (
            <div
              className="glass-panel animate-fade-in"
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '6px',
                zIndex: 50,
                width: '160px',
                padding: '6px',
                background: 'var(--bg-elevated)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              {[
                { id: '1', label: '1 Chart (Single)', icon: <Square size={13} /> },
                { id: '2-h', label: '2 Charts (Side-by-side)', icon: <Columns2 size={13} /> },
                { id: '2-v', label: '2 Charts (Stacked)', icon: <Rows2 size={13} /> },
                { id: '4', label: '4 Charts (2x2 Quad)', icon: <Grid2x2 size={13} /> },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onLayoutChange(opt.id as LayoutMode);
                    setShowLayoutMenu(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '6px 8px',
                    background: layout === opt.id ? 'var(--accent-blue)' : 'transparent',
                    color: layout === opt.id ? '#ffffff' : 'var(--text-primary)',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bar Replay Mode Button */}
        <button
          onClick={onToggleReplay}
          className="btn"
          style={{
            background: isReplayActive ? 'rgba(56, 189, 248, 0.2)' : 'var(--bg-tertiary)',
            borderColor: isReplayActive ? 'var(--accent-cyan)' : 'var(--border-subtle)',
            color: isReplayActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            padding: '5px 10px',
            fontSize: '11px',
          }}
        >
          <PlayCircle size={13} />
          <span>{t.replay}</span>
        </button>

        {/* Price Alerts Button with badge */}
        <button
          onClick={onOpenAlerts}
          className="btn"
          style={{ padding: '5px 10px', fontSize: '11px', position: 'relative' }}
        >
          <Bell size={13} color="var(--poc-orange)" />
          <span>{t.alerts}</span>
          {alertsCount > 0 && (
            <span
              style={{
                background: 'var(--poc-orange)',
                color: '#000',
                fontSize: '9px',
                fontWeight: 800,
                padding: '1px 4px',
                borderRadius: '8px',
              }}
            >
              {alertsCount}
            </span>
          )}
        </button>

        {/* Bengali Documentation & Starter Guide Modal Button */}
        <button
          onClick={onOpenGuide}
          className="btn"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(56, 189, 248, 0.2) 100%)',
            borderColor: 'rgba(56, 189, 248, 0.3)',
            color: '#38bdf8',
            padding: '5px 10px',
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          <BookOpen size={13} />
          <span>{t.guide}</span>
        </button>

        {/* Language Settings Dropdown (English, हिन्दी, বাংলা) */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="btn"
            style={{ padding: '5px 9px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}
            title={t.languageSetting}
          >
            <Globe size={13} color="var(--accent-cyan)" />
            <span>
              {lang === 'en' ? '🇺🇸 English' : lang === 'hi' ? '🇮🇳 हिन्दी' : '🇧🇩 বাংলা'}
            </span>
            <ChevronDown size={11} />
          </button>

          {showLanguageMenu && (
            <div
              className="glass-panel animate-fade-in"
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '6px',
                zIndex: 60,
                width: '180px',
                padding: '6px',
                background: 'var(--bg-elevated)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', padding: '4px 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t.languageSetting}
              </div>

              {SUPPORTED_LANGUAGES.map(opt => {
                const isCurrent = lang === opt.code;
                return (
                  <button
                    key={opt.code}
                    onClick={() => {
                      onSelectLang(opt.code);
                      setShowLanguageMenu(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '7px 8px',
                      background: isCurrent ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                      color: isCurrent ? '#38bdf8' : 'var(--text-primary)',
                      border: 'none',
                      borderRadius: '5px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: isCurrent ? 700 : 500,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px' }}>{opt.flag}</span>
                      <span>{opt.nativeName}</span>
                    </div>
                    {isCurrent && <Check size={14} color="#38bdf8" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ width: '1px', height: '22px', background: 'var(--border-subtle)' }} />

        {/* Right Sidebar Tabs Switcher (Paper Trading / Order Book / Signals) */}
        <div style={{ display: 'flex', gap: '3px', background: 'var(--bg-tertiary)', padding: '2px', borderRadius: '5px' }}>
          {[
            { id: 'paper', label: t.paperTrading, icon: <Layers size={12} /> },
            { id: 'book', label: t.orderbook, icon: <SlidersHorizontal size={12} /> },
            { id: 'signals', label: t.signals, icon: <Zap size={12} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => onSelectRightTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: activeRightTab === tab.id ? 'var(--accent-blue)' : 'transparent',
                color: activeRightTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: activeRightTab === tab.id ? 600 : 500,
                cursor: 'pointer',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
