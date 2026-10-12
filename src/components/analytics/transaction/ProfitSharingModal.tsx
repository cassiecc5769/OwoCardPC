import React, { useState } from 'react';

interface ProfitSharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyRules: (boostPercent: number) => void;
}

export const ProfitSharingModal: React.FC<ProfitSharingModalProps> = ({
  isOpen,
  onClose,
  onApplyRules,
}) => {
  const [boostPercent, setBoostPercent] = useState<number>(0.5);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  if (!isOpen) return null;

  // Dynamic simulation values
  const currentConversion = 64.2;
  const simulatedConversion = Math.min(64.2 + boostPercent * 34.6, 95.0);
  const incrementalGmv = Math.round(boostPercent * 107200);
  const merchantQueueDepth = Math.round(42 + boostPercent * 92);

  const handleApply = () => {
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setAppliedSuccess(true);
      onApplyRules(boostPercent);
      setTimeout(() => {
        setAppliedSuccess(false);
        onClose();
      }, 700);
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 w-full max-w-lg overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">小额散卡撮合让利测算与动态调优</h3>
              <p className="text-[11px] text-slate-500">针对 &lt;$25 美金散额提高承兑商抢单积极性</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          {/* Slider control */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/70">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-slate-800">调整撮合让利点差 (Spread Boost)</span>
              <span className="font-numeric-stat font-bold text-blue-600 text-sm">
                +{boostPercent.toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.5"
              step="0.1"
              value={boostPercent}
              onChange={(e) => setBoostPercent(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10.5px] text-slate-400 mt-1">
              <span>+0.1% (微调)</span>
              <span>+0.5% (算法推荐值)</span>
              <span>+1.5% (激进激励)</span>
            </div>
          </div>

          {/* Simulation Comparison Matrix */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] text-slate-400 block mb-1">当前基线转化率</span>
              <span className="text-xl font-bold text-slate-700 font-numeric-stat">
                {currentConversion}%
              </span>
              <span className="text-[10px] text-rose-500 block mt-0.5">35.8% 散卡流单流失</span>
            </div>

            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-center">
              <span className="text-[11px] text-emerald-800 block mb-1">测算调优后转化率</span>
              <span className="text-xl font-bold text-emerald-700 font-numeric-stat">
                {simulatedConversion.toFixed(1)}%
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                预计提振 +{(simulatedConversion - currentConversion).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Detailed Metric Projections */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">预估月度挽回成交 GMV:</span>
              <span className="font-bold text-blue-700 font-numeric-stat">
                +${incrementalGmv.toLocaleString()} USD
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">商户排队接单深度覆盖率:</span>
              <span className="font-bold text-emerald-700 font-numeric-stat">
                {merchantQueueDepth}% (原 42%)
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">平台单笔平均让利成本:</span>
              <span className="font-medium text-slate-700 font-numeric-stat">
                约 $0.09 / 笔
              </span>
            </div>
          </div>

          {appliedSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-2 text-xs animate-fadeIn">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
              <span>让利规则已成功发布至全网撮合引擎，立即生效！</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium cursor-pointer"
          >
            取消
          </button>
          <button
            disabled={isApplying}
            onClick={handleApply}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isApplying ? '正在同步规则...' : '确认应用并同步撮合规则'}
          </button>
        </div>
      </div>
    </div>
  );
};
