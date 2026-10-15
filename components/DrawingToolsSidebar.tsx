'use client';

import React, { useState } from 'react';
import {
  Crosshair,
  TrendingUp,
  Minus,
  Percent,
  Type,
  Maximize2,
  Trash2,
  Lock,
  Eye,
  Sliders,
} from 'lucide-react';

export const DrawingToolsSidebar: React.FC = () => {
  const [activeTool, setActiveTool] = useState<string>('crosshair');

  const tools = [
    { id: 'crosshair', icon: <Crosshair size={15} />, label: 'Crosshair' },
    { id: 'trendline', icon: <TrendingUp size={15} />, label: 'Trend Line' },
    { id: 'horizontal', icon: <Minus size={15} />, label: 'Horizontal Line (S/R)' },
    { id: 'fibonacci', icon: <Percent size={15} />, label: 'Fib Retracement' },
    { id: 'text', icon: <Type size={15} />, label: 'Text Note' },
    { id: 'ruler', icon: <Maximize2 size={15} />, label: 'Measure Tool' },
  ];

  return (
    <div
      style={{
        width: '42px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px 0',
        gap: '8px',
        zIndex: 15,
      }}
    >
      {tools.map(tool => (
        <button
          key={tool.id}
          onClick={() => setActiveTool(tool.id)}
          title={tool.label}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: activeTool === tool.id ? 'var(--accent-blue)' : 'transparent',
            color: activeTool === tool.id ? '#ffffff' : 'var(--text-muted)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            if (activeTool !== tool.id) e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            if (activeTool !== tool.id) e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          {tool.icon}
        </button>
      ))}

      <div style={{ flex: 1 }} />

      <button
        title="Clear all drawings"
        onClick={() => setActiveTool('crosshair')}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          background: 'transparent',
          color: 'var(--text-dim)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};
