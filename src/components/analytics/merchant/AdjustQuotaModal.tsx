import React, { useState } from 'react';
import { MerchantPerformanceRow } from './types';

interface AdjustQuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchant: MerchantPerformanceRow | null;
  onSave: (merchantId: string, newQuota: number, newCollateralRatio: number) => void;
}

export const AdjustQuotaModal: React.FC<AdjustQuotaModalProps> = ({
  isOpen,
  onClose,
  merchant,
  onSave,
}) => {
  const [quota, setQuota] = useState<number>(merchant?.creditLimitDailyUsd || 100000);
  const [collateralRatio, setCollateralRatio] = useState<number>(100);
  const [reason, setReason] = useState('业务高峰期常规流动性提额');

  if (!isOpen || !merchant) return null;

  const handleSave = () => {
    onSave(merchant.merchantId, quota, collateralRatio);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 w-full max-w-md overflow-hidden animate-fadeIn">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                商户承揽配额与风控授信设置
              </h3>
              <span className="text-[11px] text-slate-500 font-code-token">
                {merchant.merchantId} · {merchant.merchantName}
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
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">当前在押保证金:</span>
              <span className="font-numeric-stat font-bold text-blue-600">
                ${(merchant.collateralUsd || 0).toLocaleString()} USD
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">已消耗承揽额度:</span>
              <span className="font-numeric-stat font-semibold text-slate-900">
                ${(merchant.usedCreditUsd || 0).toLocaleString()} USD
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-slate-900">
                设定单日承揽授信额度上限 (Daily Credit Limit)
              </label>
              <span className="font-numeric-stat font-bold text-blue-700">
                ${quota.toLocaleString()} USD
              </span>
            </div>
            <input
              type="range"
              min="10000"
              max="500000"
              step="5000"
              value={quota}
              onChange={(e) => setQuota(parseInt(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-slate-900">
                保证金质押覆盖率要求 (Collateral Coverage Ratio)
              </label>
              <span className="font-numeric-stat font-bold text-emerald-700">
                {collateralRatio}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="200"
              step="10"
              value={collateralRatio}
              onChange={(e) => setCollateralRatio(parseInt(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              按 {collateralRatio}% 计算，该商户最少需质押 ${(quota * (collateralRatio / 100)).toLocaleString()} 保证金。
            </p>
          </div>

          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <label className="font-semibold text-slate-900 block">调额审批理由及流转说明</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
          >
            核准并调整授信
          </button>
        </div>
      </div>
    </div>
  );
};
