'use client';

import React, { useState, useMemo } from 'react';
import { SymbolInfo, AssetCategory } from '@/lib/types';
import { Search, Star, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { Language, translations } from '@/lib/translations';

interface WatchlistProps {
  symbols: SymbolInfo[];
  selectedSymbolId: string;
  onSelectSymbol: (symbolId: string) => void;
  lang: Language;
}

export const Watchlist: React.FC<WatchlistProps> = ({
  symbols,
  selectedSymbolId,
  onSelectSymbol,
  lang,
}) => {
  const t = translations[lang];
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<AssetCategory | 'all'>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['BTCUSD', 'NIFTY']));

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredSymbols = useMemo(() => {
    return symbols.filter(s => {
      const matchesSearch =
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.fullName.toLowerCase().includes(search.toLowerCase());
      const matchesCat = activeCategory === 'all' || s.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [symbols, search, activeCategory]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      {/* Header & Search */}
      <div style={{ padding: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              {t.watchlist}
            </h3>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {filteredSymbols.length} {lang === 'bn' ? 'টি আইটেম' : lang === 'hi' ? 'आइटम' : 'pairs'}
          </span>
        </div>

        {/* Search Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-tertiary)',
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border-medium)',
          }}
        >
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '12px',
              width: '100%',
            }}
          />
        </div>

        {/* Filter Category Chips */}
        <div style={{ display: 'flex', gap: '4px', marginTop: '10px', overflowX: 'auto', paddingBottom: '2px' }}>
          {[
            { id: 'all', labelEn: 'All', labelBn: 'সব', labelHi: 'सभी' },
            { id: 'crypto', labelEn: 'Crypto', labelBn: 'ক্রিপ্টো', labelHi: 'क्रिप्टो' },
            { id: 'indian_equity', labelEn: 'India NSE', labelBn: 'ভারত NSE', labelHi: 'भारत NSE' },
            { id: 'us_stock', labelEn: 'US Stocks', labelBn: 'ইউএস', labelHi: 'अमेरिकी' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              style={{
                background: activeCategory === tab.id ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                color: activeCategory === tab.id ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {lang === 'bn' ? tab.labelBn : lang === 'hi' ? tab.labelHi : tab.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Symbol List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filteredSymbols.map(sym => {
          const isSelected = sym.id === selectedSymbolId;
          const isFav = favorites.has(sym.id);
          const isBull = sym.change >= 0;

          return (
            <div
              key={sym.id}
              onClick={() => onSelectSymbol(sym.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderBottom: '1px solid var(--border-subtle)',
                background: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                borderLeft: isSelected ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.03)';
              }}
              onMouseLeave={e => {
                if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              {/* Left Column: Symbol & Category */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={e => toggleFavorite(e, sym.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: isFav ? '#f59e0b' : 'var(--text-dim)',
                    padding: 0,
                    display: 'flex',
                  }}
                >
                  <Star size={13} fill={isFav ? '#f59e0b' : 'none'} />
                </button>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                      {sym.name}
                    </span>
                    <span
                      style={{
                        fontSize: '9px',
                        padding: '1px 4px',
                        borderRadius: '3px',
                        background:
                          sym.category === 'crypto'
                            ? 'rgba(168, 85, 247, 0.15)'
                            : sym.category === 'indian_equity'
                            ? 'rgba(245, 158, 11, 0.15)'
                            : 'rgba(59, 130, 246, 0.15)',
                        color:
                          sym.category === 'crypto'
                            ? '#c084fc'
                            : sym.category === 'indian_equity'
                            ? '#fbbf24'
                            : '#60a5fa',
                      }}
                    >
                      {sym.category === 'crypto' ? 'CRYPTO' : sym.category === 'indian_equity' ? 'NSE' : 'US'}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {sym.fullName}
                  </div>
                </div>
              </div>

              {/* Right Column: Price & 24h Change */}
              <div style={{ textAlign: 'right' }}>
                <div
                  className="font-mono"
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                >
                  {sym.currency === 'INR' ? '₹' : '$'}
                  {sym.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '1px 5px',
                    borderRadius: '3px',
                    marginTop: '3px',
                    background: isBull ? 'var(--bull-green-dark)' : 'var(--bear-red-dark)',
                    color: isBull ? 'var(--bull-green)' : 'var(--bear-red)',
                  }}
                >
                  {isBull ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  <span>
                    {isBull ? '+' : ''}
                    {sym.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
