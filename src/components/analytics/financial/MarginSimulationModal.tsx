import React, { useState } from 'react';
import { CurrencyMode } from './types';
import { formatCurrencyValue } from './mockData';

interface MarginSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyMode;
  onApplyPlan?: (summary: string) => void;
}

export const MarginSimulationModal: React.FC<MarginSimulationModalProps> = ({
  isOpen,
  onClose,
  currency,
  onApplyPlan,
}) => {
  const baseGmv = 1428500;
  const baseNetMargin = 58420;
  const baseMarginPercent = 4.09;

  // Sliders
  const [commissionDelta, setCommissionDelta] = useState<number>(-0.2); // -0.20%
  const [couponDelta, setCouponDelta] = useState<number>(-0.05); // -0.05%
  const [spreadMarkup, setSpreadMarkup] = useState<number>(0.3); // +0.30%
  const [badDebtRecovery, setBadDebtRecovery] = useState<number>(15); // +15% recovery

  if (!isOpen) return null;

  // Calculations
  const commissionSaving = baseGmv * (-commissionDelta / 100);
  const couponSaving = baseGmv * (-couponDelta / 100);
  const spreadGain = baseGmv * (spreadMarkup / 100);
  const badDebtSaved = 1590 * (badDebtRecovery / 100);

  const totalDeltaUsd = commissionSaving + couponSaving + spreadGain + badDebtSaved;
  const simulatedNetMarginUsd = baseNetMargin + totalDeltaUsd;
  const simulatedMarginPercent = (simulatedNetMarginUsd / baseGmv) * 100;
  const bpsGain = Math.round((simulatedMarginPercent - baseMarginPercent) * 100);

  const handleReset = () => {
    setCommissionDelta(-0.2);
    setCouponDelta(-0.05);
    setSpreadMarkup(0.3);
    setBadDebtRecovery(15);
  };

  const handleApply = () => {
    if (onApplyPlan) {
      onApplyPlan(
        `分成调整 ${commissionDelta > 0 ? '+' : ''}${commissionDelta}%，利差 ${spreadMarkup > 0 ? '+' : ''}${spreadMarkup}%，预计月毛利扩充 ${formatCurrencyValue(totalDeltaUsd, currency)}`
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined text-[20px]">psychology</span>
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                实时边际利润仿真测算沙盘 (Unit Economics Simulator)
              </h3>
              <span className="font-code-token text-[11px] text-slate-500">
                UE-Sim v4.2 · 基于 {formatCurrencyValue(baseGmv, currency)} GMV 大盘测算
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
        <div className="p-6 space-y-5 text-xs text-slate-700">
          {/* Real-time Result Summary Card */}
          <div className="p-4 bg-gradient-to-br from-blue-50/60 to-emerald-50/60 rounded-xl border border-blue-200/60 grid grid-cols-3 gap-3 text-center">
            <div>
              <span className="text-slate-500 block text-[11px]">仿真净毛利率</span>
              <span className="font-numeric-stat text-xl font-bold text-emerald-700 mt-0.5 block">
                {simulatedMarginPercent.toFixed(2)}%
              </span>
              <span className="font-code-token text-[10px] text-emerald-600">
                基准: {baseMarginPercent}%
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">月度净毛利估值</span>
              <span className="font-numeric-stat text-xl font-bold text-slate-900 mt-0.5 block">
                {formatCurrencyValue(simulatedNetMarginUsd, currency)}
              </span>
              <span className="font-code-token text-[10px] text-slate-500">
                基数: {formatCurrencyValue(baseNetMargin, currency)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">净利润增益预期</span>
              <span
                className={`font-numeric-stat text-xl font-extrabold mt-0.5 block ${
                  totalDeltaUsd >= 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {totalDeltaUsd >= 0 ? '+' : ''}
                {formatCurrencyValue(totalDeltaUsd, currency)}
              </span>
              <span className="font-code-token text-[10px] text-emerald-700 font-semibold">
                +{bpsGain} bps 弹性变化
              </span>
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="space-y-4">
            {/* Slider 1: Commission */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800">
                  大商户裂变分成比例浮动 (Commission Rate Delta)
                </span>
                <span
                  className={`font-numeric-stat font-bold ${
                    commissionDelta <= 0 ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {commissionDelta > 0 ? `+${commissionDelta.toFixed(2)}%` : `${commissionDelta.toFixed(2)}%`}
                </span>
              </div>
              <input
                type="range"
                min="-0.5"
                max="0.5"
                step="0.05"
                value={commissionDelta}
                onChange={(e) => setCommissionDelta(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>下调 0.5% (强化留存)</span>
                <span>
                  月损益影响: {commissionSaving >= 0 ? '+' : ''}
                  {formatCurrencyValue(commissionSaving, currency)}
                </span>
                <span>上浮 0.5% (刺激拓新)</span>
              </div>
            </div>

            {/* Slider 2: Spread Markup */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800">
                  收单买卖双边利差空间加成 (Spread Margin Markup)
                </span>
                <span
                  className={`font-numeric-stat font-bold ${
                    spreadMarkup >= 0 ? 'text-blue-600' : 'text-rose-600'
                  }`}
                >
                  {spreadMarkup >= 0 ? `+${spreadMarkup.toFixed(2)}%` : `${spreadMarkup.toFixed(2)}%`}
                </span>
              </div>
              <input
                type="range"
                min="-0.5"
                max="1.5"
                step="0.1"
                value={spreadMarkup}
                onChange={(e) => setSpreadMarkup(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>压缩利差 -0.5%</span>
                <span>
                  月损益影响: {spreadGain >= 0 ? '+' : ''}
                  {formatCurrencyValue(spreadGain, currency)}
                </span>
                <span>扩大利差 +1.5%</span>
              </div>
            </div>

            {/* Slider 3: Marketing Coupon */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800">
                  加价补贴券让利浮动 (Coupon Subsidy Float)
                </span>
                <span
                  className={`font-numeric-stat font-bold ${
                    couponDelta <= 0 ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {couponDelta > 0 ? `+${couponDelta.toFixed(2)}%` : `${couponDelta.toFixed(2)}%`}
                </span>
              </div>
              <input
                type="range"
                min="-0.2"
                max="0.2"
                step="0.02"
                value={couponDelta}
                onChange={(e) => setCouponDelta(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>收紧补贴 -0.20%</span>
                <span>
                  月损益影响: {couponSaving >= 0 ? '+' : ''}
                  {formatCurrencyValue(couponSaving, currency)}
                </span>
                <span>加大补贴 +0.20%</span>
              </div>
            </div>

            {/* Slider 4: Bad Debt Recovery */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800">
                  慢卡争议质押扣划追偿率 (Bad Debt Loss Mitigation)
                </span>
                <span className="font-numeric-stat font-bold text-purple-700">
                  {badDebtRecovery}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={badDebtRecovery}
                onChange={(e) => setBadDebtRecovery(parseInt(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>常规损耗 (0%)</span>
                <span>
                  挽回坏账: +{formatCurrencyValue(badDebtSaved, currency)}
                </span>
                <span>强力质押追偿 (50%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium cursor-pointer"
          >
            重置默认推演值
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium cursor-pointer"
            >
              关闭
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>采纳并应用仿真测算方案</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
