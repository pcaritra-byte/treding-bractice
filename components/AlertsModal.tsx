'use client';

import React, { useState } from 'react';
import { PriceAlert, SymbolInfo } from '@/lib/types';
import { translations, Language } from '@/lib/translations';
import { Bell, Trash2, CheckCircle2, X } from 'lucide-react';

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSymbol: SymbolInfo;
  alerts: PriceAlert[];
  onAddAlert: (newAlert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>) => void;
  onDeleteAlert: (id: string) => void;
  lang: Language;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({
  isOpen,
  onClose,
  currentSymbol,
  alerts,
  onAddAlert,
  onDeleteAlert,
  lang,
}) => {
  const t = translations[lang];

  const [targetPrice, setTargetPrice] = useState<number>(
    Number((currentSymbol.price * 1.02).toFixed(2))
  );
  const [condition, setCondition] = useState<'CROSS_UP' | 'CROSS_DOWN'>('CROSS_UP');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPrice) return;

    onAddAlert({
      symbol: currentSymbol.id,
      targetPrice,
      condition,
      notes: notes || undefined,
    });
    setNotes('');
  };

  const activeAlerts = alerts.filter(a => !a.triggered);
  const triggeredAlerts = alerts.filter(a => a.triggered);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel animate-fade-in"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
              {t.alerts} — {currentSymbol.id}
            </h3>
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
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '16px 18px', overflowY: 'auto' }}>
          {/* Add Alert Form */}
          <form
            onSubmit={handleSubmit}
            style={{
              background: 'var(--bg-tertiary)',
              padding: '14px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc', marginBottom: '10px' }}>
              {t.addAlert}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  {t.alertTarget} ({currentSymbol.currency === 'INR' ? '₹' : '$'})
                </label>
                <input
                  type="number"
                  step="any"
                  value={targetPrice}
                  onChange={e => setTargetPrice(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '5px',
                    padding: '7px 10px',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontFamily: 'var(--font-mono)',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  {lang === 'bn' ? 'শর্ত' : lang === 'hi' ? 'शर्त' : 'Condition'}
                </label>
                <select
                  value={condition}
                  onChange={e => setCondition(e.target.value as any)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '5px',
                    padding: '7px 10px',
                    color: '#ffffff',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="CROSS_UP">{t.crossAbove}</option>
                  <option value="CROSS_DOWN">{t.crossBelow}</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <input
                type="text"
                placeholder={lang === 'bn' ? 'নোট (যেমন: ব্রেকআউট টার্গেট)...' : lang === 'hi' ? 'नोट (उदा. ब्रेकआउट टारगेट)...' : 'Note (e.g. Resistance breakout)...'}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '5px',
                  padding: '6px 10px',
                  color: '#ffffff',
                  fontSize: '11px',
                }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '8px' }}>
              {t.addAlert}
            </button>
          </form>

          {/* Active Alerts */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              {t.activeAlerts} ({activeAlerts.length})
            </h4>

            {activeAlerts.length === 0 ? (
              <div style={{ padding: '14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                {t.noAlerts}
              </div>
            ) : (
              activeAlerts.map(alert => (
                <div
                  key={alert.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '6px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '12px' }}>{alert.symbol}</span>
                      <span style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>
                        {alert.condition === 'CROSS_UP' ? '▲ ' + t.crossAbove : '▼ ' + t.crossBelow}
                      </span>
                      <span className="font-mono" style={{ fontWeight: 700, color: '#f8fafc', fontSize: '12px' }}>
                        ${alert.targetPrice}
                      </span>
                    </div>
                    {alert.notes && (
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {alert.notes}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteAlert(alert.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--bear-red)',
                      padding: '4px',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Triggered Alerts History */}
          {triggeredAlerts.length > 0 && (
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                {lang === 'bn' ? 'ট্রিগার হওয়া হিস্ট্রি' : 'Triggered Alerts History'}
              </h4>
              {triggeredAlerts.map(alert => (
                <div
                  key={alert.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    borderRadius: '6px',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    marginBottom: '6px',
                    fontSize: '11px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={13} color="var(--bull-green)" />
                    <span>
                      {alert.symbol} reached ${alert.targetPrice}
                    </span>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                    {alert.triggeredAt ? new Date(alert.triggeredAt).toLocaleTimeString() : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
