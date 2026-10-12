import React, { useState } from 'react';
import { FixedTier } from '../data/mockQuotes';

interface QuoteAddTierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newTier: FixedTier) => void;
}

export const QuoteAddTierModal: React.FC<QuoteAddTierModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  if (!isOpen) return null;

  const [faceVal, setFaceVal] = useState(300);
  const [tag, setTag] = useState('大额定制');
  const [userRate, setUserRate] = useState(6.9400);
  const [merchRate, setMerchRate] = useState(7.1000);
  const [limitAmount, setLimitAmount] = useState('$120,000');

  const marginAmount = ((faceVal * (merchRate - userRate)) / 10).toFixed(2);
  const marginPercent = (((userRate - (userRate * (userRate / merchRate))) / userRate) * 100);
  const calculatedMargin = (((merchRate - userRate) / merchRate) * 100).toFixed(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTier: FixedTier = {
      val: `$${faceVal}.00`,
      valNum: faceVal,
      tag,
      userRate,
      merchRate,
      marginAmount: parseFloat(marginAmount) || 2.5,
      marginPercent: parseFloat(calculatedMargin) || 2.2,
      limit: limitAmount,
      used: '$0 (0%)',
      pct: 0
    };
    onAdd(newTier);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">add_card</span>
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm">新增固定面值规格阶梯</span>
              <p className="text-xs text-slate-400 mt-0.5">Fixed Denomination Tier Config</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">面额档位 (USD)</label>
              <div className="flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/20">
                <span className="font-mono text-slate-400 mr-1">$</span>
                <input
                  type="number"
                  value={faceVal}
                  onChange={e => setFaceVal(parseInt(e.target.value) || 0)}
                  className="w-full font-mono text-sm font-bold text-slate-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">规格属性标签</label>
              <input
                type="text"
                value={tag}
                onChange={e => setTag(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">用户收卡折率</label>
              <input
                type="number"
                step="0.001"
                value={userRate}
                onChange={e => setUserRate(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-200 p-2 font-mono text-xs text-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">商户采购底价</label>
              <input
                type="number"
                step="0.001"
                value={merchRate}
                onChange={e => setMerchRate(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-200 p-2 font-mono text-xs text-slate-800 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">单日承接限额</label>
            <input
              type="text"
              value={limitAmount}
              onChange={e => setLimitAmount(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-2 font-mono text-xs text-slate-800 outline-none"
            />
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/60 text-[11px] text-emerald-800 flex items-center justify-between">
            <span>系统核算预期毛利率:</span>
            <strong className="font-mono text-sm text-emerald-700">+{calculatedMargin}% (通过)</strong>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-sm cursor-pointer"
            >
              确认添加档位
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
