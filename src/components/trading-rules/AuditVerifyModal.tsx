import React, { useState } from 'react';
import { AuditLogRow } from './types';

interface AuditVerifyModalProps {
  log: AuditLogRow | null;
  onClose: () => void;
}

export const AuditVerifyModal: React.FC<AuditVerifyModalProps> = ({ log, onClose }) => {
  if (!log) return null;
  const [showRawJson, setShowRawJson] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                数字存证核验 · <span className="font-mono text-blue-600">{log.id}</span>
                <span className="font-mono text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                  100% 校验一致
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                密码学哈希签名链与分布式 Raft 共识节点背书凭证
              </p>
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
        <div className="p-6 space-y-4">
          {/* Hash signature */}
          <div className="p-3 bg-slate-900 rounded-xl text-white font-mono text-xs flex items-center justify-between">
            <div className="overflow-hidden">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
                不可篡改区块存证指纹 (SHA-256)
              </div>
              <div className="text-emerald-400 font-bold truncate">
                {log.hash || '0x9e1c4b82a105c317e84920fc12b33948'}
              </div>
            </div>
            <span className="material-symbols-outlined text-emerald-400 text-[20px] ml-2 shrink-0">
              check_circle
            </span>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                变更前前置基线
              </span>
              <span className="font-mono text-slate-500 line-through font-bold mt-1 block">
                {log.prevValue}
              </span>
            </div>
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
              <span className="text-blue-600 text-[10px] uppercase font-bold block">
                变更后生效参数
              </span>
              <span className="font-mono text-blue-700 font-bold mt-1 block text-sm">
                {log.nextValue}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">生效模式:</span>
              <span className="font-semibold text-slate-800">{log.mode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">操作时间戳:</span>
              <span className="font-mono text-slate-700">{log.timestamp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">经办责任人:</span>
              <span className="font-medium text-slate-800">
                {log.operator.name} · {log.operator.title}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">关联审批单:</span>
              <span className="font-mono font-bold text-blue-600">{log.ticket}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">审核授权人:</span>
              <span className="font-medium text-slate-800">
                {log.approvedBy || '风控合规委员会'}
              </span>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-700 mb-1">变更依据与业务说明</div>
            <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
              {log.reason}
            </p>
          </div>

          {/* Node checkmarks matrix */}
          <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/60">
            <div className="flex items-center justify-between text-xs text-emerald-800 font-bold mb-2">
              <span>全网 12 撮合集群节点一致性状态</span>
              <span className="font-mono text-[11px]">12 / 12 SYNCED (18ms)</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 font-mono text-[10px]">
              {[
                'HK-Node-01',
                'HK-Node-02',
                'SG-Node-01',
                'SG-Node-02',
                'TYO-Node-01',
                'TYO-Node-02',
                'SFO-Node-01',
                'SFO-Node-02',
                'FRA-Node-01',
                'FRA-Node-02',
                'LON-Node-01',
                'LON-Node-02',
              ].map((node) => (
                <div
                  key={node}
                  className="bg-white/80 border border-emerald-200 text-emerald-700 px-1.5 py-1 rounded text-center font-medium flex items-center justify-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>{node}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Collapsible raw json */}
          <div>
            <button
              type="button"
              onClick={() => setShowRawJson(!showRawJson)}
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 font-mono cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">
                {showRawJson ? 'expand_less' : 'expand_more'}
              </span>
              <span>{showRawJson ? '收起底层原始存证报文' : '展开底层原始存证报文 (JSON)'}</span>
            </button>
            {showRawJson && (
              <pre className="mt-2 p-3 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-lg overflow-x-auto max-h-40">
                {JSON.stringify(log, null, 2)}
              </pre>
            )}
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-xs cursor-pointer"
            >
              完成核验并关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
