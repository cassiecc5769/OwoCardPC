import React, { useState } from 'react';
import { AdjustmentTicket } from '../../types/financeAccount';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AdjustmentTicket[];
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  isOpen,
  onClose,
  logs
}) => {
  const [search, setSearch] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredLogs = logs.filter(log => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      log.ticketNo.toLowerCase().includes(q) ||
      log.targetMid.toLowerCase().includes(q) ||
      log.targetName.toLowerCase().includes(q) ||
      log.docRef.toLowerCase().includes(q) ||
      log.reason.toLowerCase().includes(q)
    );
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">verified_user</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  PRD 3.4 账户调整单审计流水账簿
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
                  DISTRIBUTED LEDGER
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                双人复核数字证书签发 · 单向分布式哈希链存储 · 严禁直接更新数据库
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索工单号 / MID / 凭证号..."
                className="w-full h-8 pl-8 pr-3 bg-white text-slate-800 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Audit principle reminder */}
        <div className="px-6 py-2.5 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[16px]">lock</span>
            <span className="font-semibold">刚性恒等式强校验:</span>
            <span className="font-mono text-[11px] text-blue-800">所有平账流水均包含调账前与调账后双重快照，平账失败自动全局回滚。</span>
          </div>
          <span className="font-mono text-[11px] text-slate-500 font-semibold">共 {filteredLogs.length} 条调账记录</span>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto flex-1 p-6">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="h-9 bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[11px]">
                <th className="px-3 py-2 font-mono">审批工单号</th>
                <th className="px-3 py-2">目标商户</th>
                <th className="px-3 py-2">调整类型</th>
                <th className="px-3 py-2 text-right font-mono">变动积点 (PTS)</th>
                <th className="px-3 py-2 text-right font-mono">调账前后可用余额</th>
                <th className="px-3 py-2">关联凭证 / 申请理由</th>
                <th className="px-3 py-2">双人经办与审批人</th>
                <th className="px-3 py-2 font-mono">签核时序与哈希指纹</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(log => (
                <tr key={log.id} className="h-14 hover:bg-slate-50/80 transition-colors">
                  <td className="px-3 py-2">
                    <span className="font-mono font-bold text-blue-600">{log.ticketNo}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-semibold text-slate-900">{log.targetName}</div>
                    <div className="font-mono text-[10px] text-slate-400">{log.targetMid}</div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      log.type === 'INCREASE'
                        ? 'bg-emerald-50 text-emerald-800'
                        : log.type === 'DECREASE'
                        ? 'bg-rose-50 text-rose-800'
                        : 'bg-amber-50 text-amber-800'
                    }`}>
                      {log.typeLabel}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-bold text-[13px]">
                    {log.type === 'INCREASE' && <span className="text-emerald-700">+{log.deltaAmount.toLocaleString()}</span>}
                    {log.type === 'DECREASE' && <span className="text-rose-700">-{log.deltaAmount.toLocaleString()}</span>}
                    {(log.type === 'FREEZE' || log.type === 'UNFREEZE') && (
                      <span className="text-blue-700">{log.deltaAmount.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-[11px]">
                    <div className="text-slate-400">{log.preAvailable.toLocaleString()}</div>
                    <div className="font-bold text-slate-900 font-semibold">{log.postAvailable.toLocaleString()}</div>
                  </td>
                  <td className="px-3 py-2 max-w-xs">
                    <div className="font-mono text-[10px] font-semibold text-slate-700">{log.docRef}</div>
                    <div className="text-slate-500 text-[11px] truncate" title={log.reason}>{log.reason}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-slate-800 font-medium">{log.applicant}</div>
                    <div className="text-emerald-700 text-[10px] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">check_circle</span>
                      <span>复核: {log.approver}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 font-mono text-[10px]">
                    <div className="text-slate-500">{log.timestamp}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-slate-400 truncate max-w-[110px]" title={log.ledgerHash}>
                        {log.ledgerHash.slice(0, 14)}...
                      </span>
                      <button
                        onClick={() => handleCopy(log.ledgerHash)}
                        className="hover:text-blue-600 text-slate-400 p-0.5 cursor-pointer transition-colors"
                        title="复制完整 Ledger Hash"
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {copiedHash === log.ledgerHash ? 'check' : 'content_copy'}
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            HASH-CHAIN INTEGRITY: SECURED BY SHA-256 HSM SIGNATURE
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            关闭审计账簿
          </button>
        </div>
      </div>
    </div>
  );
};
