import React, { useState } from 'react';
import { DispatchTaskItem } from '../data/mockOperations';

interface OperationOcrModalProps {
  task: DispatchTaskItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (correctedToken: string, taskId: string) => void;
}

export const OperationOcrModal: React.FC<OperationOcrModalProps> = ({
  task,
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !task) return null;

  const [inputVal, setInputVal] = useState('STM-UK-4891-9921-X');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    onConfirm(inputVal.trim(), task.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in text-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">spellcheck</span>
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm">【OCR 人工核正纠错台】</span>
              <p className="text-xs text-slate-400 mt-0.5">
                单号: <span className="font-mono font-semibold text-slate-700">{task.orderNo}</span> · {task.brandName}
              </p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-[11px] text-amber-800 space-y-1">
            <div className="font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">warning</span>
              识别置信度告警 (78.4%)
            </div>
            <p>系统自动识别到 14 位字符（标准应为 15 位），第 14 位字符脱失。请结合下方字符片段与存证核验后完成手工补全。</p>
          </div>

          {/* OCR Character Segment Visualizer */}
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>OCR 字符流置信度切片分段</span>
              <span className="font-mono text-amber-400 font-semibold">14 / 15 字符已提取</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center py-2 flex-wrap">
              <span className="px-2.5 py-1.5 rounded-lg bg-slate-800 font-mono font-bold text-sm text-emerald-400 border border-slate-700">STM</span>
              <span className="text-slate-600 font-mono">-</span>
              <span className="px-2.5 py-1.5 rounded-lg bg-slate-800 font-mono font-bold text-sm text-emerald-400 border border-slate-700">UK</span>
              <span className="text-slate-600 font-mono">-</span>
              <span className="px-2.5 py-1.5 rounded-lg bg-slate-800 font-mono font-bold text-sm text-emerald-400 border border-slate-700">4891</span>
              <span className="text-slate-600 font-mono">-</span>
              <span className="px-2.5 py-1.5 rounded-lg bg-slate-800 font-mono font-bold text-sm text-emerald-400 border border-slate-700">992</span>
              <span className="px-2.5 py-1.5 rounded-lg bg-rose-950 font-mono font-bold text-sm text-rose-300 border border-rose-500/80 animate-pulse">?</span>
              <span className="text-slate-600 font-mono">-</span>
              <span className="px-2.5 py-1.5 rounded-lg bg-slate-800 font-mono font-bold text-sm text-emerald-400 border border-slate-700">X</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              <span>涂层算法检测: 无拼接篡改</span>
              <span>发卡地区: 英国 (UK)</span>
            </div>
          </div>

          {/* Input field */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              核正后的规范 15 位卡密字符
            </label>
            <div className="flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
              <span className="material-symbols-outlined text-[18px] text-slate-400 mr-2">key</span>
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value.toUpperCase())}
                className="w-full font-mono text-sm font-bold text-slate-900 outline-none uppercase tracking-wider"
                placeholder="例如: STM-UK-4891-9921-X"
                autoFocus
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              当前输入长度: <strong className="font-mono text-slate-700">{inputVal.replace(/[^A-Za-z0-9]/g, '').length}</strong> / 15 位
            </span>
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
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-sm cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">done</span>
              <span>确认核正并重新发起API校验</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
