import React, { useState } from 'react';
import { CardSkuProfitabilityRow, CurrencyMode } from './types';
import { formatCurrencyValue } from './mockData';

interface RiskRestrictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  row: CardSkuProfitabilityRow | null;
  currency: CurrencyMode;
  onConfirmRestrict: (id: string, newCollateralPercent: number, quotaLimit: number) => void;
}

export const RiskRestrictionModal: React.FC<RiskRestrictionModalProps> = ({
  isOpen,
  onClose,
  row,
  currency,
  onConfirmRestrict,
}) => {
  const [collateralPercent, setCollateralPercent] = useState(20);
  const [quotaLimit, setQuotaLimit] = useState(50000);
  const [delayWindowHours, setDelayWindowHours] = useState(2);
  const [reason, setReason] = useState('慢卡预付盘口核销争议偏高，启动限额降权与保证金门槛提升');

  if (!isOpen || !row) return null;

  const handleConfirm = () => {
    onConfirmRestrict(row.id, collateralPercent, quotaLimit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/60">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
              <span className="material-symbols-outlined text-[20px]">shield</span>
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                慢卡盘口限额与风控降权 · {row.skuName}
              </h3>
              <span className="font-code-token text-[11px] text-rose-700 font-semibold">
                HIGH-RISK RESTRICTION & LOSS PREVENTION
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
          {/* Warning Summary */}
          <div className="p-3 bg-rose-50/80 rounded-xl border border-rose-200/80 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-600">当前累计坏账/争议损失:</span>
              <span className="font-numeric-stat font-bold text-rose-700">
                {formatCurrencyValue(row.badDebtDeduction, currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">净毛利率水平:</span>
              <span className="font-numeric-stat font-bold text-rose-700">
                {row.netMarginPercent.toFixed(2)}% (低于3%安全基准)
              </span>
            </div>
            <p className="text-[11px] text-rose-600 mt-1">
              该盘口因预付费慢卡审核延时，对整体大盘综合毛利造成拖累。建议收紧接单配额并强制提高商户在押保证金。
            </p>
          </div>

          {/* Collateral Requirement Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-slate-800">
                强制提升商户保证金质押阈值
              </label>
              <span className="font-numeric-stat font-bold text-rose-700">
                {collateralPercent}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="40"
              step="5"
              value={collateralPercent}
              onChange={(e) => setCollateralPercent(parseInt(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <span className="text-[11px] text-slate-400">
              未达到 {collateralPercent}% 质押池覆盖率的做卡商户将被暂停派发该卡单。
            </span>
          </div>

          {/* Quota Cap */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-slate-800">
                单日全网承揽配额上限 (Daily Cap)
              </label>
              <span className="font-numeric-stat font-bold text-slate-900">
                {formatCurrencyValue(quotaLimit, currency)}
              </span>
            </div>
            <input
              type="range"
              min="10000"
              max="150000"
              step="5000"
              value={quotaLimit}
              onChange={(e) => setQuotaLimit(parseInt(e.target.value))}
              className="w-full accent-slate-800 cursor-pointer"
            />
          </div>

          {/* Settlement Delay */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-800 block">
              承揽商户放款延迟审核时间 (Anti-Chargeback Window)
            </label>
            <select
              value={delayWindowHours}
              onChange={(e) => setDelayWindowHours(parseInt(e.target.value))}
              className="w-full p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-600"
            >
              <option value={1}>延迟 1 小时放款审核</option>
              <option value={2}>延迟 2 小时放款审核 (推荐)</option>
              <option value={6}>延迟 6 小时严格审核</option>
              <option value={24}>T+1 隔日清算排查</option>
            </select>
          </div>

          {/* Reason */}
          <div className="space-y-1 pt-1">
            <label className="font-semibold text-slate-800 block">风控降权记录说明</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-600"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            确认执行限额降权
          </button>
        </div>
      </div>
    </div>
  );
};
