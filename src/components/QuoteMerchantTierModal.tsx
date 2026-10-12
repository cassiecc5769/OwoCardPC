import React, { useState } from 'react';

interface QuoteMerchantTierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tierData: any) => void;
}

export const QuoteMerchantTierModal: React.FC<QuoteMerchantTierModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const [tierName, setTierName] = useState('Tier-1 自营/核心核销商');
  const [baseRate, setBaseRate] = useState(7.1500);
  const [marginMargin, setMarginMargin] = useState('0.80% - 1.20%');
  const [minVolume, setMinVolume] = useState('$100,000');
  const [deposit, setDeposit] = useState('$500,000');
  const [slaSecs, setSlaSecs] = useState('90秒');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ tierName, baseRate, marginMargin, minVolume, deposit, slaSecs });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">storefront</span>
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm">配置大宗商户准入协议与底价</span>
              <p className="text-xs text-slate-400 mt-0.5">Wholesale SLA & Credit Agreement</p>
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
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">准入层级名称</label>
            <select
              value={tierName}
              onChange={e => setTierName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-2 text-xs bg-white text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Tier-1 自营/核心核销商">Tier-1 自营/核心核销商 (最高优先)</option>
              <option value="Tier-2 战略KA大宗商户">Tier-2 战略KA大宗商户 (常规大宗)</option>
              <option value="Tier-3 认证流通渠道商">Tier-3 认证流通渠道商 (基础准入)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">执行协议底价</label>
              <div className="flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/20">
                <input
                  type="number"
                  step="0.001"
                  value={baseRate}
                  onChange={e => setBaseRate(parseFloat(e.target.value) || 0)}
                  className="w-full font-mono text-sm font-bold text-slate-900 outline-none"
                />
                <span className="font-mono text-xs text-slate-400 ml-1">折</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">核销时效SLA承诺</label>
              <input
                type="text"
                value={slaSecs}
                onChange={e => setSlaSecs(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 font-mono text-xs text-slate-800 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">日均保底承接额</label>
              <input
                type="text"
                value={minVolume}
                onChange={e => setMinVolume(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 font-mono text-xs text-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">质押授信金额要求</label>
              <input
                type="text"
                value={deposit}
                onChange={e => setDeposit(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 font-mono text-xs text-slate-800 outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200/60 text-[11px] text-blue-800 space-y-1">
            <div className="font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">info</span>
              协议合规提醒
            </div>
            <p>保存后新商户协议将在下一个整点 (T+1h) 结算批次中正式生效，并自动推送到商户专属接入端。</p>
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
              保存商户协议
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
