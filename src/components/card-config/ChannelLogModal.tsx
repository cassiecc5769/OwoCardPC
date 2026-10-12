import React from 'react';
import { CardSkuMasterItem } from './types';

interface ChannelLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardSkuMasterItem | null;
  onAttemptReconnect: (cardId: string) => void;
}

export const ChannelLogModal: React.FC<ChannelLogModalProps> = ({
  isOpen,
  onClose,
  card,
  onAttemptReconnect,
}) => {
  if (!isOpen || !card) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <span className="material-symbols-outlined text-[20px]">terminal</span>
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                通道核销与熔断监控日志 · {card.brandName}
              </h3>
              <span className="font-code-token text-[11px] text-slate-500">
                {card.id} · GATEWAY METRICS & CIRCUIT BREAKER
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          {/* Status Box */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              card.status === 'maintenance'
                ? 'bg-amber-50/60 border-amber-200/80'
                : 'bg-emerald-50/60 border-emerald-200/80'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    card.status === 'maintenance' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                ></span>
                <span className="font-semibold text-slate-900">
                  {card.status === 'maintenance'
                    ? '当前通道处于熔断停收状态'
                    : '通道连通状态优良 (ACTIVE)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {card.status === 'maintenance'
                  ? '上游API平均响应耗时 >3,500ms，触发系统安全阈值'
                  : '平均响应耗时 180ms，无阻塞核验'}
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-slate-700">
              {card.status === 'maintenance' ? 'SLA 82.4%' : 'SLA 99.98%'}
            </span>
          </div>

          {/* Terminal Console */}
          <div className="space-y-1.5">
            <span className="font-semibold text-slate-800 block">实时通道调度报文日志 (Live Logs)</span>
            <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-1 max-h-48 overflow-y-auto leading-relaxed border border-slate-800">
              <div className="text-emerald-400">
                [2026-09-19 23:08:12] INFO: Gateway ping to {card.id} endpoint ok (210ms)
              </div>
              <div className="text-amber-400">
                [2026-09-19 23:09:44] WARN: Upstream verification delay detected (3,420ms)
              </div>
              <div className="text-rose-400">
                [2026-09-19 23:09:58] ERROR: Upstream 504 Gateway Timeout on redeem test
              </div>
              <div className="text-amber-300">
                [2026-09-19 23:10:00] ALERT: Circuit breaker tripped! Halting new incoming orders
              </div>
              <div className="text-slate-400">
                [2026-09-19 23:15:00] INFO: Background health check probe scheduled every 60s
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 font-medium cursor-pointer"
          >
            关闭
          </button>
          <button
            type="button"
            onClick={() => {
              onAttemptReconnect(card.id);
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>发起上游通道握手探针</span>
          </button>
        </div>
      </div>
    </div>
  );
};
