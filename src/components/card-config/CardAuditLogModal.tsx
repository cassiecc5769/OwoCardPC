import React from 'react';
import { AuditLogRecord } from './types';

interface CardAuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLogRecord[];
}

export const CardAuditLogModal: React.FC<CardAuditLogModalProps> = ({
  isOpen,
  onClose,
  logs,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto border border-slate-200 flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined text-[20px]">security</span>
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                卡种配置热加载与安全审计链 (Audit Trail)
              </h3>
              <span className="font-code-token text-[11px] text-slate-500">
                DISTRIBUTED CONSENSUS · ENGINE RUNTIME HASH LOG
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

        {/* Content list */}
        <div className="p-6 space-y-3.5 text-xs text-slate-700">
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium text-slate-800">当前活跃全局配置指纹:</span>
              <span className="font-mono font-bold text-blue-700">HASH: 8F2A-09BD-C941</span>
            </div>
            <span className="text-[11px] text-slate-500">多机房热重载广播已对齐</span>
          </div>

          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{log.action}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[11px]">
                      {log.targetSku}
                    </span>
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">{log.timestamp}</span>
                </div>

                <p className="text-slate-600 text-xs leading-relaxed">{log.details}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">操作人: {log.operator}</span>
                  <span className="font-mono text-slate-500">{log.hash}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs cursor-pointer"
          >
            关闭审计记录
          </button>
        </div>
      </div>
    </div>
  );
};
