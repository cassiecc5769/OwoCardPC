import React, { useState } from 'react';
import { CardSkuMasterItem } from './types';

interface BatchStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardSkuMasterItem[];
  selectedIds: string[];
  onConfirmBatch: (targetStatus: 'active' | 'maintenance', reason: string) => void;
}

export const BatchStatusModal: React.FC<BatchStatusModalProps> = ({
  isOpen,
  onClose,
  cards,
  selectedIds,
  onConfirmBatch,
}) => {
  const [targetStatus, setTargetStatus] = useState<'active' | 'maintenance'>('maintenance');
  const [reason, setReason] = useState('上游核销通道服务波动，实施批量熔断保护');

  if (!isOpen) return null;

  const targetCards =
    selectedIds.length > 0 ? cards.filter((c) => selectedIds.includes(c.id)) : cards;

  const handleConfirm = () => {
    onConfirmBatch(targetStatus, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined text-[20px]">toggle_on</span>
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">批量启用 / 停收卡种主数据</h3>
              <span className="font-code-token text-[11px] text-slate-500">
                BATCH STATUS MUTATION & HOT RELOAD
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
          {/* Target Action */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-800 block">执行批量状态操作</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetStatus('active')}
                className={`py-2 px-3 rounded-lg border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  targetStatus === 'active'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>恢复正常在收 (Active)</span>
              </button>
              <button
                type="button"
                onClick={() => setTargetStatus('maintenance')}
                className={`py-2 px-3 rounded-lg border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  targetStatus === 'maintenance'
                    ? 'border-rose-600 bg-rose-50 text-rose-700 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">block</span>
                <span>维护停收熔断 (Pause)</span>
              </button>
            </div>
          </div>

          {/* Affected Count */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">受影响卡种范围:</span>
              <span className="font-semibold font-mono text-slate-900">
                {selectedIds.length > 0
                  ? `已选中的 ${selectedIds.length} 个卡种`
                  : `全网全量 ${cards.length} 个卡种`}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1 max-h-24 overflow-y-auto">
              {targetCards.slice(0, 8).map((c) => (
                <span
                  key={c.id}
                  className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-600"
                >
                  {c.id}
                </span>
              ))}
              {targetCards.length > 8 && (
                <span className="text-[10px] text-slate-400 self-center">
                  + 更多 {targetCards.length - 8} 个
                </span>
              )}
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-800 block">
              操作原因与审计批注 <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 font-medium cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-1.5 rounded-lg text-white font-semibold shadow-xs cursor-pointer flex items-center gap-1.5 ${
              targetStatus === 'active'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            <span>确认并下发热重载</span>
          </button>
        </div>
      </div>
    </div>
  );
};
