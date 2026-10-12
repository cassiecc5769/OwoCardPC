import React, { useState } from 'react';
import { CardSkuProfitabilityRow, CurrencyMode } from './types';
import { formatCurrencyValue } from './mockData';

interface RateControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  row: CardSkuProfitabilityRow | null;
  currency: CurrencyMode;
  onSaveRate: (id: string, newOfficialRate: number, newMerchantRate: number) => void;
}

export const RateControlModal: React.FC<RateControlModalProps> = ({
  isOpen,
  onClose,
  row,
  currency,
  onSaveRate,
}) => {
  const [officialRate, setOfficialRate] = useState<number>(row?.officialRatePercent || 88.5);
  const [merchantRate, setMerchantRate] = useState<number>(row?.merchantRatePercent || 82.5);
  const [reason, setReason] = useState('根据海外出海下游结算走势优化利差空间');

  // Sync state when row changes
  React.useEffect(() => {
    if (row) {
      setOfficialRate(row.officialRatePercent);
      setMerchantRate(row.merchantRatePercent);
    }
  }, [row]);

  if (!isOpen || !row) return null;

  const currentSpread = officialRate - merchantRate;
  const spreadDelta = currentSpread - row.spreadPercent;
  const monthlyProfitImpact = (row.gmv * spreadDelta) / 100;

  const handleSave = () => {
    onSaveRate(row.id, officialRate, merchantRate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined text-[20px]">currency_exchange</span>
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                卡种汇率与利差调控 · {row.skuName}
              </h3>
              <span className="font-code-token text-[11px] text-slate-500">
                {row.skuCode} · {row.category}
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

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          {/* Status Box */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">当前在跑交易流水 (GMV):</span>
              <span className="font-numeric-stat font-bold text-slate-900">
                {formatCurrencyValue(row.gmv, currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">原定买卖盘口利差:</span>
              <span className="font-numeric-stat font-semibold text-blue-600">
                +{row.spreadPercent.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Rate Sliders */}
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-slate-800">
                  官方基准卖出折率 (Official Rate)
                </label>
                <span className="font-numeric-stat font-bold text-slate-900">
                  {officialRate.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="70"
                max="98"
                step="0.5"
                value={officialRate}
                onChange={(e) => setOfficialRate(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-slate-800">
                  商户承揽买入承接价 (Merchant Rate)
                </label>
                <span className="font-numeric-stat font-bold text-blue-600">
                  {merchantRate.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="65"
                max="95"
                step="0.5"
                value={merchantRate}
                onChange={(e) => setMerchantRate(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Simulation Output Card */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60 flex items-center justify-between">
            <div>
              <span className="text-slate-600 block">调控后综合利差:</span>
              <span className="font-numeric-stat text-base font-bold text-blue-700">
                +{currentSpread.toFixed(1)}%
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-600 block">月毛利变动估算:</span>
              <span
                className={`font-numeric-stat font-bold ${
                  monthlyProfitImpact >= 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {monthlyProfitImpact >= 0 ? '+' : ''}
                {formatCurrencyValue(monthlyProfitImpact, currency)}
              </span>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-1 pt-1">
            <label className="font-semibold text-slate-800 block">调控原因与风控审批备注</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
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
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            核准并调控汇率
          </button>
        </div>
      </div>
    </div>
  );
};
