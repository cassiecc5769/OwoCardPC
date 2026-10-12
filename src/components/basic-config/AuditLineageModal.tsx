import React, { useState } from 'react';
import { BasicAuditLogEntry } from './types';

interface AuditLineageModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: BasicAuditLogEntry[];
  filterTargetCode?: string | null;
}

export const AuditLineageModal: React.FC<AuditLineageModalProps> = ({
  isOpen,
  onClose,
  logs,
  filterTargetCode,
}) => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  if (!isOpen) return null;

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredLogs = logs.filter((log) => {
    if (filterTargetCode && !log.targetCode.includes(filterTargetCode)) {
      return false;
    }
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      return (
        log.targetCode.toLowerCase().includes(q) ||
        log.targetName.toLowerCase().includes(q) ||
        log.operator.toLowerCase().includes(q) ||
        log.sha256.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[22px]">history</span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                字典审计变更历史与全链路溯源 (Audit Lineage Engine)
              </h3>
              <p className="text-[11px] text-slate-500">
                记录每一次字典代码与全局配置修订时间戳、操作人、变更差异快照及 SHA-256 存证指纹
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <input
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="快速检索变更编码 / 操作人 / 存证哈希..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500"
            />
            <span className="material-symbols-outlined text-[15px] text-slate-400 absolute left-2.5 top-2">
              search
            </span>
          </div>
          {filterTargetCode && (
            <div className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded font-mono font-semibold border border-blue-200">
              <span>过滤编码: {filterTargetCode}</span>
            </div>
          )}
          <span className="text-xs text-slate-400 font-mono">共记录 {filteredLogs.length} 条审计存证</span>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3 text-xs">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors space-y-2"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-700 text-xs px-2 py-0.5 rounded bg-blue-100/70">
                    [{log.targetCode}] {log.targetName}
                  </span>
                  <span className="text-slate-500 text-[11px] font-mono">{log.timestamp}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-slate-500">操作人:</span>
                  <span className="font-semibold text-slate-800">{log.operator}</span>
                  <span className="text-slate-400 font-mono">({log.role})</span>
                </div>
              </div>

              {/* Diff view */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 space-y-1 font-mono text-[11px]">
                <div className="text-rose-600 truncate">
                  <span className="font-bold select-none">- 变动前: </span>
                  {log.beforeVal}
                </div>
                <div className="text-emerald-700 truncate">
                  <span className="font-bold select-none">+ 变动后: </span>
                  {log.afterVal}
                </div>
              </div>

              {/* Footers: SHA256 & impacted orders */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-mono">
                <div className="flex items-center gap-1">
                  <span>存证指纹:</span>
                  <span className="font-bold text-slate-700 bg-slate-200/70 px-1.5 py-0.5 rounded text-[10px]">
                    {log.sha256}
                  </span>
                  <button
                    onClick={() => handleCopy(log.sha256)}
                    className="text-blue-600 hover:underline text-[10px] ml-1 cursor-pointer"
                  >
                    {copiedHash === log.sha256 ? '已复制' : '复制'}
                  </button>
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <span>影响历史/在途订单:</span>
                  <span className="font-bold text-slate-900">{log.impactedOrders.toLocaleString()} 笔</span>
                </div>
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <span className="material-symbols-outlined text-[36px] block mb-1 text-slate-300">
                search_off
              </span>
              <span>暂无匹配的审计存证记录</span>
            </div>
          )}
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono text-[11px]">
            SLA 审计链基于不可篡改日志归档，存证有效期: 10年
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white font-medium cursor-pointer"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
