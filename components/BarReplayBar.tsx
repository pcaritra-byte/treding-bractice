'use client';

import React, { useEffect } from 'react';
import { Play, Pause, SkipForward, X, RotateCcw, FastForward } from 'lucide-react';
import { translations, Language } from '@/lib/translations';

interface BarReplayBarProps {
  currentIndex: number;
  totalCandles: number;
  isPlaying: boolean;
  speed: number; // in milliseconds per candle
  onTogglePlay: () => void;
  onStep: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onExit: () => void;
  onScrub: (index: number) => void;
  lang: Language;
}

export const BarReplayBar: React.FC<BarReplayBarProps> = ({
  currentIndex,
  totalCandles,
  isPlaying,
  speed,
  onTogglePlay,
  onStep,
  onReset,
  onSpeedChange,
  onExit,
  onScrub,
  lang,
}) => {
  const t = translations[lang];

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      if (currentIndex < totalCandles - 1) {
        onStep();
      } else {
        onTogglePlay(); // Stop when reached end
      }
    }, speed);

    return () => clearInterval(timer);
  }, [isPlaying, currentIndex, totalCandles, speed, onStep, onTogglePlay]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 14px',
        background: 'linear-gradient(90deg, #181d2f 0%, #111422 100%)',
        borderBottom: '1px solid rgba(56, 189, 248, 0.3)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.4)',
        zIndex: 20,
      }}
    >
      {/* Left: Replay Title Badge & Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#38bdf8',
          }}
        >
          <FastForward size={13} />
          <span>{t.replay}</span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Bar {currentIndex + 1} / {totalCandles}
        </span>
      </div>

      {/* Center: Controls (Play, Step, Speed, Scrubber) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '600px', margin: '0 20px' }}>
        <button
          onClick={onTogglePlay}
          className="btn"
          style={{
            background: isPlaying ? 'var(--bear-red)' : 'var(--bull-green)',
            color: '#ffffff',
            border: 'none',
            padding: '5px 12px',
            fontWeight: 600,
            fontSize: '12px',
          }}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          <span>{isPlaying ? t.replayPause : t.replayPlay}</span>
        </button>

        <button
          onClick={onStep}
          className="btn"
          style={{ padding: '5px 10px', fontSize: '11px' }}
          title={t.replayStep}
        >
          <SkipForward size={14} />
          <span>{t.replayStep}</span>
        </button>

        <button
          onClick={onReset}
          className="btn"
          style={{ padding: '5px 8px' }}
          title="Reset to beginning"
        >
          <RotateCcw size={13} />
        </button>

        {/* Speed selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[
            { label: '0.5s', ms: 500 },
            { label: '1s', ms: 1000 },
            { label: '2s', ms: 2000 },
          ].map(s => (
            <button
              key={s.ms}
              onClick={() => onSpeedChange(s.ms)}
              style={{
                background: speed === s.ms ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                color: speed === s.ms ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                padding: '3px 6px',
                borderRadius: '3px',
                fontSize: '10px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Timeline Slider */}
        <input
          type="range"
          min="10"
          max={Math.max(10, totalCandles - 1)}
          value={currentIndex}
          onChange={e => onScrub(parseInt(e.target.value, 10))}
          style={{
            flex: 1,
            accentColor: 'var(--accent-cyan)',
            cursor: 'pointer',
          }}
        />
      </div>

      {/* Right: Exit Replay */}
      <button
        onClick={onExit}
        className="btn"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          padding: '4px 10px',
          fontSize: '11px',
          color: 'var(--text-secondary)',
        }}
      >
        <X size={13} />
        <span>{t.replayExit}</span>
      </button>
    </div>
  );
};
