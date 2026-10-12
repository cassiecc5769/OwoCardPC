import React from 'react';
import { SnapshotVersion } from './types';

interface SnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  versions: SnapshotVersion[];
  onRollback: (version: SnapshotVersion) => void;
}

export const SnapshotModal: React.FC<SnapshotModalProps> = ({
  isOpen,
  onClose,
  versions,
  onRollback,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
              <span className="material-symbols-outlined text-[20px]">history</span>
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">规则回溯快照 (Snapshot Recovery)</h3>
              <p className="text-xs text-slate-500 mt-0.5">查看历史消息矩阵固化版本，支持全网毫秒级版本回滚</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3 text-xs max-h-[70vh] overflow-y-auto">
          {versions.map((v) => (
            <div
              key={v.version}
              className={`p-3.5 rounded-xl border transition-all ${
                v.isCurrent
                  ? 'bg-blue-50/40 border-blue-300 ring-2 ring-blue-500/15'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {v.version}
                  </span>
                  {v.isCurrent ? (
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-mono text-[10px] font-semibold">
                      当前全网运行中
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-mono text-[10px]">
                      历史归档
                    </span>
                  )}
                </div>
                <span className="font-mono text-[11px] text-slate-400">{v.timestamp}</span>
              </div>

              <div className="text-slate-600 leading-relaxed mb-2">{v.comment}</div>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/60">
                <div className="text-slate-400">
                  规则: <span className="font-mono font-semibold text-slate-700">{v.rulesCount} 项</span> · 模版:{' '}
                  <span className="font-mono font-semibold text-slate-700">{v.templatesCount} 套</span> · 操作人: {v.operator}
                </div>

                {!v.isCurrent && (
                  <button
                    type="button"
                    onClick={() => onRollback(v)}
                    className="px-2.5 py-1 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 text-slate-700 font-medium rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    回滚至此版本
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-lg cursor-pointer"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
