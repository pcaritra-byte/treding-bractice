'use client';

import React from 'react';
import { Signal, SymbolInfo } from '@/lib/types';
import { translations, Language } from '@/lib/translations';
import { Zap, ArrowUpRight, ArrowDownRight, Target, ShieldAlert, Sparkles } from 'lucide-react';

interface SignalsFeedProps {
  signals: Signal[];
  currentSymbol: SymbolInfo;
  onTradeSignal: (signal: Signal) => void;
  lang: Language;
}

export const SignalsFeed: React.FC<SignalsFeedProps> = ({
  signals,
  currentSymbol,
  onTradeSignal,
  lang,
}) => {
  const t = translations[lang];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border-subtle)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={16} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            {t.signals} — {currentSymbol.id}
          </h3>
        </div>
        <span
          style={{
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '4px',
            background: 'rgba(56, 189, 248, 0.1)',
            color: 'var(--accent-cyan)',
            fontWeight: 600,
          }}
        >
          {signals.length} {lang === 'bn' ? 'টি সিগন্যাল' : lang === 'hi' ? 'सिग्नल मिले' : 'detected'}
        </span>
      </div>

      {/* Signals List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        {signals.length === 0 ? (
          <div style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            {lang === 'bn'
              ? 'বর্তমানে কোনো টেকনিক্যাল সিগন্যাল ট্রিগার হয়নি। টাইমফ্রেম পরিবর্তন করে দেখতে পারেন।'
              : lang === 'hi'
              ? 'वर्तमान में कोई तकनीकी सिग्नल सक्रिय नहीं है। टाइमफ्रेम बदल कर देखें।'
              : 'No active technical signals for this timeframe.'}
          </div>
        ) : (
          signals.map(sig => {
            const isBuy = sig.type === 'BUY';
            const reason = lang === 'bn' ? sig.reasonBn : lang === 'hi' ? (sig.reasonHi || sig.reasonEn) : sig.reasonEn;
            const timeAgo = Math.max(1, Math.round((Date.now() / 1000 - sig.timestamp) / 60));

            return (
              <div
                key={sig.id}
                style={{
                  background: 'var(--bg-tertiary)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '10px',
                  border: '1px solid',
                  borderColor: isBuy ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {/* Signal Header: Type, Indicator, Time */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: isBuy ? 'var(--bull-green)' : 'var(--bear-red)',
                        color: '#ffffff',
                      }}
                    >
                      {isBuy ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {sig.type}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#f8fafc' }}>
                      {sig.indicator.replace('_', ' ')}
                    </span>
                  </div>

                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {timeAgo} {lang === 'bn' ? 'মিনিট আগে' : lang === 'hi' ? 'मिनट पहले' : 'min ago'}
                  </span>
                </div>

                {/* Explanation */}
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '10px' }}>
                  {reason}
                </p>

                {/* Levels & Confidence */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '4px',
                    padding: '8px',
                    borderRadius: '6px',
                    background: 'var(--bg-secondary)',
                    marginBottom: '10px',
                    fontSize: '10px',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Entry</span>
                    <strong className="font-mono" style={{ color: '#ffffff' }}>${sig.price}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--bear-red)', display: 'block' }}>Stop Loss</span>
                    <strong className="font-mono" style={{ color: 'var(--bear-red)' }}>${sig.stopLoss}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--bull-green)', display: 'block' }}>Target (TP)</span>
                    <strong className="font-mono" style={{ color: 'var(--bull-green)' }}>${sig.targetPrice}</strong>
                  </div>
                </div>

                {/* Confidence Bar & Trade Button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1, marginRight: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                      <span>Confidence</span>
                      <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{sig.confidence}%</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${sig.confidence}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #38bdf8 0%, #10b981 100%)',
                        }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => onTradeSignal(sig)}
                    className="btn btn-primary"
                    style={{ padding: '5px 10px', fontSize: '11px', borderRadius: '4px' }}
                  >
                    {lang === 'bn' ? 'ট্রেড করুন' : lang === 'hi' ? 'सिम्युलेट' : 'Simulate'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
