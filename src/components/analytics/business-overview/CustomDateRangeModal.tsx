import React, { useState } from 'react';

interface CustomDateRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (start: string, end: string) => void;
  initialStart?: string;
  initialEnd?: string;
}

export const CustomDateRangeModal: React.FC<CustomDateRangeModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialStart = '2026-09-01',
  initialEnd = '2026-09-19',
}) => {
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);

  if (!isOpen) return null;

  const handleApplyPreset = (days: number) => {
    const today = new Date('2026-09-19');
    const past = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
    const startStr = past.toISOString().split('T')[0];
    const endStr = today.toISOString().split('T')[0];
    setStart(startStr);
    setEnd(endStr);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(start, end);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">date_range</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-slate-900">
                选择自定义统计时间区间
              </h3>
              <p className="font-code-token text-xs text-slate-500 mt-0.5">
                CUSTOM AUDIT & TIME WINDOW
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Quick presets */}
          <div>
            <span className="font-semibold text-slate-700 block mb-2">快捷时段选择</span>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset(1)}
                className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg text-slate-700 text-center transition-colors cursor-pointer"
              >
                昨日
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(7)}
                className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg text-slate-700 text-center transition-colors cursor-pointer"
              >
                近7天
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(30)}
                className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg text-slate-700 text-center transition-colors cursor-pointer"
              >
                近30天
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(90)}
                className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg text-slate-700 text-center transition-colors cursor-pointer"
              >
                近90天
              </button>
            </div>
          </div>

          {/* Date range inputs */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">开始日期</label>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">截止日期</label>
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-slate-500 text-[11.5px] leading-relaxed">
            自定义时段将重新计算分时吞吐、品类分布与商户承揽配额，基准时钟锚定在当前业务节点。
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-lg font-medium transition-colors cursor-pointer shadow-2xs"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer shadow-xs"
            >
              应用所选区间
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
