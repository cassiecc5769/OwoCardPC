import React, { useState } from 'react';

interface OperationCircuitBreakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, targetChannels: string[]) => void;
}

export const OperationCircuitBreakerModal: React.FC<OperationCircuitBreakerModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen) return null;

  const [reason, setReason] = useState('上游商户席位延迟飙升，自动剥离转入自营清算池保底');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    '极光数字科技 #M-04 (延迟 > 120s)',
    '速盈网络 #M-12 (授信透支)',
    '海外点卡聚合 #M-108 (心跳微弱)'
  ]);

  const toggleChannel = (ch: string) => {
    if (selectedChannels.includes(ch)) {
      setSelectedChannels(selectedChannels.filter(c => c !== ch));
    } else {
      setSelectedChannels([...selectedChannels, ch]);
    }
  };

  const handleConfirm = () => {
    onConfirm(reason, selectedChannels);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in text-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
            </div>
            <div>
              <span className="font-bold text-rose-950 text-sm">【高危】通道熔断降级控制</span>
              <p className="text-xs text-rose-700 mt-0.5">Circuit Breaker & Fallback Routing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-rose-200/60 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3 bg-rose-100/60 rounded-xl border border-rose-200 text-[11px] text-rose-900 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-rose-600">warning</span>
              平台资金安全熔断告警
            </div>
            <p>
              熔断启动后，将强制脱钩外部异常商户席位，暂停向其分发任何新卡单。所有受阻在途单将统一重新广播或直连自营保底专池！
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
              需要强制阻断隔离的商户席位:
            </label>
            <div className="space-y-1.5">
              {[
                '极光数字科技 #M-04 (延迟 > 120s)',
                '速盈网络 #M-12 (授信透支)',
                '海外点卡聚合 #M-108 (心跳微弱)'
              ].map(ch => (
                <label
                  key={ch}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100"
                >
                  <input
                    type="checkbox"
                    checked={selectedChannels.includes(ch)}
                    onChange={() => toggleChannel(ch)}
                    className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                  <span className="font-mono text-slate-800 font-medium">{ch}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              调度审计留痕理由:
            </label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-2 text-slate-800 outline-none focus:ring-2 focus:ring-rose-500/20"
            />
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
              type="button"
              onClick={handleConfirm}
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors shadow-sm cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              <span>确认执行熔断降级</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
