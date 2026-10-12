import React, { useState } from 'react';
import { DemandCapacityRow } from './types';

interface DemandActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  row: DemandCapacityRow | null;
  onConfirm: (actionName: string, amount?: number) => void;
}

export const DemandActionModal: React.FC<DemandActionModalProps> = ({
  isOpen,
  onClose,
  row,
  onConfirm,
}) => {
  const [injectAmount, setInjectAmount] = useState(50000);
  const [spreadAdjust, setSpreadAdjust] = useState(0.8);

  if (!isOpen || !row) return null;

  const isShortage = row.status === '缺口';

  const handleConfirm = () => {
    onConfirm(row.actionText, injectAmount);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 w-full max-w-md overflow-hidden animate-fadeIn">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className={`p-1.5 rounded-lg ${isShortage ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
              <span className="material-symbols-outlined text-[20px]">
                {isShortage ? 'emergency' : 'tune'}
              </span>
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                供需调度执行 · {row.cardBrand} ({row.currencyOrRegion})
              </h3>
              <span className="text-[11px] text-slate-500 font-code-token">
                ACTION: {row.actionText.toUpperCase()}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-700">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">在途卡单需求:</span>
              <span className="font-numeric-stat font-bold text-slate-900">
                ${row.demandGmvUsd.toLocaleString()} USD
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">当前可用承揽额度:</span>
              <span className="font-numeric-stat font-semibold text-blue-600">
                ${row.capacityGmvUsd.toLocaleString()} USD
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">供求缓冲对比:</span>
              <span className={`font-numeric-stat font-bold ${isShortage ? 'text-rose-600' : 'text-emerald-700'}`}>
                {row.ratioPercent}% ({row.statusBadgeText})
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200/60 text-slate-700 text-xs leading-relaxed">
            <span className="font-semibold text-slate-900 block mb-1">系统建议调度动作：</span>
            {row.strategyAdvice}
          </div>

          {isShortage && (
            <div className="space-y-3 border-t border-slate-100 pt-3">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-900">紧急注入备用授信额度:</span>
                  <span className="font-numeric-stat font-bold text-rose-600">
                    +${injectAmount.toLocaleString()} USD
                  </span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="150000"
                  step="5000"
                  value={injectAmount}
                  onChange={(e) => setInjectAmount(parseInt(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-900">上浮商户加成折率:</span>
                  <span className="font-numeric-stat font-bold text-blue-700">
                    +{spreadAdjust}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.0"
                  step="0.1"
                  value={spreadAdjust}
                  onChange={(e) => setSpreadAdjust(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-1.5 rounded-lg text-white text-xs font-semibold cursor-pointer shadow-xs ${
              isShortage
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            确认执行调度
          </button>
        </div>
      </div>
    </div>
  );
};
