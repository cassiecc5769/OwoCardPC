import React from 'react';
import { DispatchLogItem } from './types';

interface LogDetailModalProps {
  log: DispatchLogItem | null;
  onClose: () => void;
  onResend: (log: DispatchLogItem) => void;
}

export const LogDetailModal: React.FC<LogDetailModalProps> = ({
  log,
  onClose,
  onResend,
}) => {
  if (!log) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                投递流水明细 · <span className="font-mono text-blue-600">{log.id}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">通道报文与区块链/数字签名存证记录</p>
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
        <div className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[11px]">关联事件 / 规则:</span>
              <span className="font-semibold text-slate-800 font-mono">{log.eventId}</span>
              <span className="text-slate-500 block">{log.eventName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">投递时间戳:</span>
              <span className="font-mono text-slate-800">{log.timestamp}</span>
              <span className="text-slate-500 block font-mono">耗时 {log.latency}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">接收主体:</span>
              <span className="font-semibold text-slate-800">{log.recipient}</span>
              <span className="text-slate-500 block">{log.recipientType}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">通信通道:</span>
              <span className="font-semibold text-slate-800">{log.channel}</span>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                ● 200 OK
              </span>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">下发真实脱敏报文</label>
            <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl border border-slate-800 leading-relaxed overflow-x-auto">
              {log.payloadSnippet}
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              存证防伪指纹 (SHA-256 Digest)
            </label>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px] text-slate-700 flex items-center justify-between">
              <span className="truncate">{log.sha256}</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1 shrink-0 ml-2">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                已上链存证
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              关闭
            </button>
            <button
              type="button"
              onClick={() => {
                onResend(log);
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">sync</span>
              <span>重新触发下发</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
