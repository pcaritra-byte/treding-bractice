'use client';

import React, { useState } from 'react';
import { translations, Language } from '@/lib/translations';
import { BookOpen, X, CheckCircle, AlertTriangle, Cpu, Sparkles, ExternalLink } from 'lucide-react';

interface BengaliGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const BengaliGuideModal: React.FC<BengaliGuideModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'features' | 'architecture' | 'tradingview'>('quickstart');

  // Interactive Quiz state for TradingView Plan recommendation
  const [selectedAsset, setSelectedAsset] = useState<string>('crypto');
  const [selectedStyle, setSelectedStyle] = useState<string>('manual');
  const [selectedIndicators, setSelectedIndicators] = useState<string>('3-5');

  if (!isOpen) return null;

  const getRecommendation = () => {
    if (selectedStyle === 'bots' && selectedIndicators === '5+') {
      return {
        plan: 'Plus or Premium',
        reason: 'You need 100+ webhook alerts, second-based intervals, and 10-25 stacked indicators.',
        badge: 'PLUS ($29.95/mo) / PREMIUM ($59.95/mo)',
      };
    }
    if (selectedStyle === 'bots' || selectedIndicators === '3-5') {
      return {
        plan: 'Essential',
        reason: 'Essential ($12.95/mo) gives you 20 webhooks, no ads, 5 indicators per chart, and 2-chart multi-view.',
        badge: 'ESSENTIAL ($12.95/mo)',
      };
    }
    return {
      plan: 'Essential',
      reason: 'Perfect for retail traders needing ad-free charting, clean layouts, and multi-timeframe analysis.',
      badge: 'ESSENTIAL ($12.95/mo)',
    };
  };

  const rec = getRecommendation();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel animate-fade-in"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-tertiary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={20} color="var(--accent-cyan)" />
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>
                {lang === 'bn'
                  ? 'ChartPilot — ট্রেডিং ড্যাশবোর্ড স্টার্টার নির্দেশিকা'
                  : lang === 'hi'
                  ? 'ChartPilot — ट्रेडिंग डैशबोर्ड स्टार्टर गाइड'
                  : 'ChartPilot — Trading Dashboard Starter Guide'}
              </h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Next.js 15 + TypeScript Trading Starter (Multi-Language: English, हिन्दी, বাংলা)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', overflowX: 'auto' }}>
          {[
            {
              id: 'quickstart',
              label: lang === 'bn' ? '🚀 শুরু করার ধাপ' : lang === 'hi' ? '🚀 शुरू करने के चरण' : '🚀 Getting Started',
            },
            {
              id: 'features',
              label: lang === 'bn' ? '📊 ফিচার ও সীমাবদ্ধতা' : lang === 'hi' ? '📊 फीचर्स व सीमाएं' : '📊 Features & Limits',
            },
            {
              id: 'architecture',
              label: lang === 'bn' ? '⚙️ আর্কিটেকচার' : lang === 'hi' ? '⚙️ आर्किटेक्चर' : '⚙️ Architecture',
            },
            {
              id: 'tradingview',
              label: lang === 'bn' ? '💎 TradingView তুলনা' : lang === 'hi' ? '💎 TradingView तुलना' : '💎 TradingView Tiers',
            },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                color: activeTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
                padding: '10px 18px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Content Scroll Area */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, fontSize: '13px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          {activeTab === 'quickstart' && (
            <div>
              <h3 style={{ fontSize: '15px', color: '#f8fafc', marginBottom: '10px' }}>
                আগে যা লাগবে (Prerequisites)
              </h3>
              <ul style={{ paddingLeft: '20px', marginBottom: '16px', color: '#cbd5e1' }}>
                <li>Node.js 20.9+ (Next.js 15-এর জন্য প্রস্তাবিত)</li>
                <li>npm অথবা pnpm / yarn</li>
                <li>VS Code বা যেকোনো কোড এডিটর</li>
              </ul>

              <h3 style={{ fontSize: '15px', color: '#f8fafc', marginBottom: '10px' }}>
                চালানোর ধাপ (How to Run Locally)
              </h3>
              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--accent-cyan)',
                  marginBottom: '16px',
                }}
              >
                <div># 1. প্রোজেক্ট ফোল্ডারে টার্মিনাল খুলুন</div>
                <div># 2. ডিপেনডেন্সি ইনস্টল করুন</div>
                <div style={{ color: '#ffffff', fontWeight: 600, margin: '4px 0' }}>npm install</div>
                <div># 3. লোকাল ডেভেলপমেন্ট সার্ভার চালু করুন</div>
                <div style={{ color: '#ffffff', fontWeight: 600, margin: '4px 0' }}>npm run dev</div>
                <div># 4. ব্রাউজারে খুলুন:</div>
                <div style={{ color: '#10b981' }}>http://localhost:3000</div>
              </div>

              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  padding: '12px',
                  borderRadius: '6px',
                  color: '#fbbf24',
                  fontSize: '12px',
                }}
              >
                <strong>⚠️ সতর্কতা (Disclaimer):</strong> এটি একটি শিক্ষামূলক ড্যাশবোর্ড স্টার্টার।
                সিগন্যাল ও পেপার ট্রেডিং শুধুমাত্র প্রদর্শনের উদ্দেশ্যে তৈরি। আর্থিক সিদ্ধান্ত বা লাইভ ট্রেডিংয়ের পূর্বে
                রিস্ক কন্ট্রোল ও লিগ্যাল কমপ্লায়েন্স যাচাই করুন।
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div>
              <h3 style={{ fontSize: '15px', color: '#f8fafc', marginBottom: '10px' }}>
                বর্তমান ড্যাশবোর্ডে যেসব ফিচার যুক্ত করা হয়েছে
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--bull-green)', marginBottom: '4px' }}>✓ রেসপনসিভ ডার্ক থিম</div>
                  <p style={{ fontSize: '12px' }}>ট্রেডিংভিউ অনুপ্রাণিত অত্যাধুনিক ডার্ক UI, গ্লাস প্যানেল ও স্পার্কলাইনস।</p>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--bull-green)', marginBottom: '4px' }}>✓ লাইটওয়েট চার্টস (Lightweight Charts)</div>
                  <p style={{ fontSize: '12px' }}>ক্যান্ডেলস্টিক, ভলিউম বার, EMA 20/50/200, বলিঙ্গার ব্যান্ডস ও ক্রসহেয়ার।</p>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--bull-green)', marginBottom: '4px' }}>✓ ভলিউম প্রোফাইল (VRVP)</div>
                  <p style={{ fontSize: '12px' }}>পয়েন্ট অফ কন্ট্রোল (POC), ভ্যালু এরিয়া হাই (VAH) এবং লো (VAL) হিসেব ও প্রদর্শন।</p>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--bull-green)', marginBottom: '4px' }}>✓ মাল্টি-চার্ট গ্রিড (1, 2, 4 চার্ট)</div>
                  <p style={{ fontSize: '12px' }}>একসাথে ২ বা ৪টি সিম্বল/টাইমফ্রেম দেখার সুবিধা (TradingView Plus ফিচারের অনুরূপ)।</p>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--bull-green)', marginBottom: '4px' }}>✓ বার রিপ্লে মোড (Bar Replay)</div>
                  <p style={{ fontSize: '12px' }}>পুরনো ক্যান্ডেল ধাপে ধাপে প্লে করে স্ট্র্যাটেজি ব্যাকটেস্ট ও প্র্যাকটিস।</p>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--bull-green)', marginBottom: '4px' }}>✓ পেপার ট্রেডিং সিমুলেটর</div>
                  <p style={{ fontSize: '12px' }}>$100,000 ব্যালেন্স, মার্কেট/লিমিট অর্ডার, স্টপ লস, লাইভ লাভ/ক্ষতি ও উইন রেট।</p>
                </div>
              </div>

              <h3 style={{ fontSize: '15px', color: '#f8fafc', marginBottom: '8px' }}>
                গুরুত্বপূর্ণ সীমাবদ্ধতা (Current Limitations)
              </h3>
              <ul style={{ paddingLeft: '20px', color: '#cbd5e1' }}>
                <li>সব কোট ও ক্যান্ডেল সিন্থেটিক/ডেমো মডেলের ওপর ভিত্তি করে তৈরি, রিয়েল ব্রোকার লাইভ অর্ডার নয়।</li>
                <li>অ্যালার্ট লোকাল স্টেট ও লোকাল স্টোরেজে থাকে; ব্যাকগ্রাউন্ড এসএমএস বা পুশ নোটিফিকেশন যুক্ত হয়নি।</li>
                <li>লাইভ ব্রোকার ইন্টিগ্রেশন (যেমন Zerodha Kite, Upstox, Dhan, Binance) যুক্ত হয়নি।</li>
              </ul>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div>
              <h3 style={{ fontSize: '15px', color: '#f8fafc', marginBottom: '10px' }}>
                প্রস্তাবিত প্রোভাইডার আর্কিটেকচার (MarketDataProvider)
              </h3>
              <p style={{ marginBottom: '12px' }}>
                ChartPilot একটি মডুলার সার্ভার-সাইড ইন্টারফেস ব্যবহার করে যাতে সহজে যেকোনা ডেটা প্রোভাইডার যুক্ত করা যায়:
              </p>

              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '14px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: '#93c5fd',
                  marginBottom: '16px',
                }}
              >
                <div style={{ color: '#fbbf24' }}>interface MarketDataProvider {'{'}</div>
                <div>&nbsp;&nbsp;id: string;</div>
                <div>&nbsp;&nbsp;name: string;</div>
                <div>&nbsp;&nbsp;getCandles(symbol, timeframe, count): Promise&lt;Candle[]&gt;;</div>
                <div>&nbsp;&nbsp;getQuote(symbol): Promise&lt;SymbolInfo | null&gt;;</div>
                <div>&nbsp;&nbsp;subscribeQuotes(symbols, onUpdate): () =&gt; void;</div>
                <div style={{ color: '#fbbf24' }}>{'}'}</div>
              </div>

              <h4 style={{ color: '#ffffff', marginBottom: '8px' }}>তৈরি করা অ্যাডাপ্টারসমূহ:</h4>
              <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                <li><strong>CryptoProviderAdapter:</strong> BTC, ETH, SOL এর জন্য রিয়েলটাইম টাইমফ্রেম জেনারেটর ও API।</li>
                <li><strong>IndianEquitiesAdapter:</strong> NIFTY 50, RELIANCE, BANKNIFTY এর ভারতীয় বাজার মডেল।</li>
                <li><strong>Server-Side Route:</strong> <code>/api/market-data?symbol=BTCUSD&amp;timeframe=1h</code> API রাউট।</li>
              </ul>
            </div>
          )}

          {activeTab === 'tradingview' && (
            <div>
              <h3 style={{ fontSize: '15px', color: '#f8fafc', marginBottom: '10px' }}>
                TradingView পেইড প্ল্যানসমূহের বিস্তারিত তুলনা
              </h3>

              <div style={{ overflowX: 'auto', marginBottom: '18px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-tertiary)', color: '#f8fafc', borderBottom: '1px solid var(--border-medium)' }}>
                      <th style={{ padding: '8px 10px' }}>ফিচার</th>
                      <th style={{ padding: '8px 10px', color: '#38bdf8' }}>Essential ($12.95/mo)</th>
                      <th style={{ padding: '8px 10px', color: '#a855f7' }}>Plus ($29.95/mo)</th>
                      <th style={{ padding: '8px 10px', color: '#f59e0b' }}>Premium ($59.95/mo)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 600 }}>Charts per Tab</td>
                      <td style={{ padding: '8px 10px' }}>২টি চার্ট</td>
                      <td style={{ padding: '8px 10px' }}>৪টি চার্ট</td>
                      <td style={{ padding: '8px 10px' }}>৮টি চার্ট</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 600 }}>Indicators per Chart</td>
                      <td style={{ padding: '8px 10px' }}>৫টি ইনডিকেটর</td>
                      <td style={{ padding: '8px 10px' }}>১০টি ইনডিকেটর</td>
                      <td style={{ padding: '8px 10px' }}>২৫টি ইনডিকেটর</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 600 }}>Price / Technical Alerts</td>
                      <td style={{ padding: '8px 10px' }}>২০টি অ্যালার্ট</td>
                      <td style={{ padding: '8px 10px' }}>১০০টি অ্যালার্ট</td>
                      <td style={{ padding: '8px 10px' }}>৪০০টি অ্যালার্ট</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 600 }}>Historical Bars</td>
                      <td style={{ padding: '8px 10px' }}>১০,০০০ বার্স</td>
                      <td style={{ padding: '8px 10px' }}>১০,০০০ বার্স</td>
                      <td style={{ padding: '8px 10px' }}>২০,০০০ বার্স</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 10px', fontWeight: 600 }}>Webhook Automation</td>
                      <td style={{ padding: '8px 10px' }}>সক্রিয় (Basic)</td>
                      <td style={{ padding: '8px 10px' }}>সক্রিয় (Advanced)</td>
                      <td style={{ padding: '8px 10px' }}>সর্বোচ্চ স্পিড ও ডেটা</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Interactive Plan Advisor */}
              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-medium)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  <Sparkles size={16} color="var(--accent-cyan)" />
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                    আপনার জন্য কোন প্ল্যানটি সঠিক? (Interactive Tier Advisor)
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      ট্রেডিং অ্যাসেট:
                    </label>
                    <select
                      value={selectedAsset}
                      onChange={e => setSelectedAsset(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        color: '#ffffff',
                        padding: '6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                      }}
                    >
                      <option value="crypto">Crypto (BTC, ETH)</option>
                      <option value="indian">Indian Equities / F&O</option>
                      <option value="forex">Forex / Commodities</option>
                      <option value="us">US Stocks / Options</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      ট্রেডিং পদ্ধতি:
                    </label>
                    <select
                      value={selectedStyle}
                      onChange={e => setSelectedStyle(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        color: '#ffffff',
                        padding: '6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                      }}
                    >
                      <option value="manual">Manual Discretionary</option>
                      <option value="bots">Automated Bots / Webhooks</option>
                      <option value="swing">Multi-Monitor Swing</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      ইনডিকেটরের সংখ্যা:
                    </label>
                    <select
                      value={selectedIndicators}
                      onChange={e => setSelectedIndicators(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        color: '#ffffff',
                        padding: '6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                      }}
                    >
                      <option value="1-2">১-২টি ইনডিকেটর</option>
                      <option value="3-5">৩-৫টি ইনডিকেটর</option>
                      <option value="5+">৫টির বেশি ইনডিকেটর</option>
                    </select>
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    padding: '12px',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>সুপারিশকৃত প্ল্যান:</span>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '12px',
                        color: '#38bdf8',
                        background: 'rgba(56, 189, 248, 0.2)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {rec.badge}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#e2e8f0', margin: 0 }}>{rec.reason}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
