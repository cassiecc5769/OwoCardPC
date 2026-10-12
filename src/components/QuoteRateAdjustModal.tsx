import React, { useState } from 'react';
import { QuoteMatrixRow } from '../data/mockQuotes';

interface QuoteRateAdjustModalProps {
  row: QuoteMatrixRow | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedRow: QuoteMatrixRow) => void;
}

export const QuoteRateAdjustModal: React.FC<QuoteRateAdjustModalProps> = ({
  row,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen || !row) return null;

  const [userRate, setUserRate] = useState<number>(row.userRate);
  const [merchRate, setMerchRate] = useState<number>(row.merchRate);
  const [adjustReason, setAdjustReason] = useState<string>('根据中行汇率波动及同行竞对爬虫行情微调折率');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const bocMid = 7.2341;
  // Calculate margin: (userRate - merchRate) / userRate * 100
  const marginPct = userRate > 0 ? ((userRate - merchRate) / userRate) * 100 : 0;
  const isAntiInverted = marginPct < 1.0;
  const isWarning = marginPct >= 1.0 && marginPct < 1.5;

  // Single card RMB calculation (assuming face value = $100 for reference)
  const faceValue = 100;
  const userRmb = (faceValue * (userRate / 10) * (bocMid / 7.2341) * (7.2341 / 10)).toFixed(2);
  const merchRmb = (faceValue * (merchRate / 10) * (bocMid / 7.2341) * (7.2341 / 10)).toFixed(2);
  const profitRmb = (parseFloat(userRmb) - parseFloat(merchRmb)).toFixed(2);

  const handleSave = () => {
    if (isAntiInverted) {
      setErrorMsg('【严禁提交】：预期净毛利低于1.00%硬底线，系统强制阻断调价！');
      return;
    }
    setErrorMsg(null);
    const updated: QuoteMatrixRow = {
      ...row,
      userRate,
      merchRate,
      margin: `${marginPct >= 0 ? '+' : ''}${marginPct.toFixed(2)}%`,
      marginPercent: marginPct,
      marginWarning: isWarning,
      status: isWarning ? '利差低' : '采集中',
      userRmb: `¥${(userRate * 72.341).toFixed(2)} / $100`,
      marginRmb: `+¥${profitRmb}/张 兑现`
    };
    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">单档位折率微调工单</span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-semibold">{row.country}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{row.name} · {row.tier} ({row.cur})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2 animate-fadeIn font-medium">
              <span className="material-symbols-outlined text-rose-600 text-[18px]">gpp_bad</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Benchmarks Bar */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">中行基准汇率</span>
              <div className="font-mono text-slate-900 font-bold text-sm mt-0.5">USD/CNY 7.2341</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">同行公允参考</span>
              <div className="font-mono text-emerald-700 font-bold text-sm mt-0.5">6.9100 折 (中位)</div>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                用户收卡折率 (C端买入)
              </label>
              <div className="flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                <input
                  type="number"
                  step="0.001"
                  value={userRate}
                  onChange={e => setUserRate(parseFloat(e.target.value) || 0)}
                  className="w-full font-mono text-sm font-bold text-slate-900 outline-none"
                />
                <span className="font-mono text-xs text-slate-400 ml-1">折</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <button
                  type="button"
                  onClick={() => setUserRate(r => parseFloat((r + 0.0050).toFixed(4)))}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] font-semibold cursor-pointer"
                >
                  +0.0050
                </button>
                <button
                  type="button"
                  onClick={() => setUserRate(r => parseFloat((r - 0.0050).toFixed(4)))}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] font-semibold cursor-pointer"
                >
                  -0.0050
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                商户承揽折率 (B端卖出)
              </label>
              <div className="flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                <input
                  type="number"
                  step="0.001"
                  value={merchRate}
                  onChange={e => setMerchRate(parseFloat(e.target.value) || 0)}
                  className="w-full font-mono text-sm font-bold text-slate-900 outline-none"
                />
                <span className="font-mono text-xs text-slate-400 ml-1">折</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <button
                  type="button"
                  onClick={() => setMerchRate(r => parseFloat((r + 0.0050).toFixed(4)))}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] font-semibold cursor-pointer"
                >
                  +0.0050
                </button>
                <button
                  type="button"
                  onClick={() => setMerchRate(r => parseFloat((r - 0.0050).toFixed(4)))}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] font-semibold cursor-pointer"
                >
                  -0.0050
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Math Inspector */}
          <div className={`p-3.5 rounded-xl border ${
            isAntiInverted 
              ? 'bg-red-50/70 border-red-200' 
              : isWarning 
              ? 'bg-amber-50/70 border-amber-200' 
              : 'bg-emerald-50/70 border-emerald-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">平台预期毛利核算 (Instant Verification)</span>
              <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                isAntiInverted 
                  ? 'bg-red-200 text-red-900' 
                  : isWarning 
                  ? 'bg-amber-200 text-amber-900' 
                  : 'bg-emerald-200 text-emerald-900'
              }`}>
                {isAntiInverted ? '硬阻断: 价格倒挂' : isWarning ? '边际预警' : '利差合规'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2.5 pt-2 border-t border-slate-200/50">
              <div>
                <span className="text-slate-500">点差净毛利率:</span>
                <div className={`font-mono text-base font-bold ${
                  isAntiInverted ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-emerald-700'
                }`}>
                  {marginPct >= 0 ? '+' : ''}{marginPct.toFixed(2)}%
                  <span className="text-xs font-normal text-slate-500 ml-1">
                    (差额 {(userRate - merchRate).toFixed(4)}折)
                  </span>
                </div>
              </div>
              <div>
                <span className="text-slate-500">参考单卡净收益:</span>
                <div className="font-mono text-base font-bold text-slate-900">
                  ¥{profitRmb} / $100
                </div>
              </div>
            </div>

            {isAntiInverted && (
              <p className="text-[11px] text-red-600 mt-2 font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">error</span>
                平台毛利硬底线要求 ≥ 1.00%，当前折率存在严重倒挂或侵蚀风险。
              </p>
            )}
            {isWarning && (
              <p className="text-[11px] text-amber-700 mt-2 font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                当前毛利率低于 1.50% 边际预警线，若执行可能压缩缓冲垫。
              </p>
            )}
          </div>

          {/* Reason input */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              调价操作说明 / 依据
            </label>
            <textarea
              rows={2}
              value={adjustReason}
              onChange={e => setAdjustReason(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="请输入调价原因（如黑五促销、汇率平移、商户底线调整等）..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">操作席位: #OP-8821</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isAntiInverted}
              className={`px-4 py-1.5 rounded-lg text-white font-semibold transition-colors shadow-sm flex items-center gap-1 ${
                isAntiInverted
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>确认调价并更新</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
