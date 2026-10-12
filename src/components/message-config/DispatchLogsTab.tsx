import React, { useState } from 'react';
import { DispatchLogItem } from './types';

interface DispatchLogsTabProps {
  logs: DispatchLogItem[];
  onResend: (log: DispatchLogItem) => void;
  onViewPayload: (log: DispatchLogItem) => void;
}

export const DispatchLogsTab: React.FC<DispatchLogsTabProps> = ({
  logs,
  onResend,
  onViewPayload,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'retry' | 'failed'>('all');
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter((log) => {
    if (filterStatus !== 'all' && log.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        log.id.toLowerCase().includes(q) ||
        log.eventId.toLowerCase().includes(q) ||
        log.eventName.toLowerCase().includes(q) ||
        log.recipient.toLowerCase().includes(q) ||
        log.sha256.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索流水号 / 事件 / 接收人 / 哈希..."
              className="h-8 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs w-64 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="material-symbols-outlined absolute left-2 top-2 text-[15px] text-slate-400">
              search
            </span>
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-white text-blue-600 font-semibold shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              全部
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('success')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium cursor-pointer ${
                filterStatus === 'success'
                  ? 'bg-white text-emerald-600 font-semibold shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              成功 (100%)
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('retry')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium cursor-pointer ${
                filterStatus === 'retry'
                  ? 'bg-white text-amber-600 font-semibold shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              重试
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>实时投递流水 · 自动留痕存证</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <th className="py-2.5 px-3">流水号 / 时间戳</th>
              <th className="py-2.5 px-3">触发事件 / 模板</th>
              <th className="py-2.5 px-3">接收目标 / 身份</th>
              <th className="py-2.5 px-3">通信通道 / 耗时</th>
              <th className="py-2.5 px-3">投递状态</th>
              <th className="py-2.5 px-3">存证防伪签名 (SHA-256)</th>
              <th className="py-2.5 px-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-3">
                  <div className="font-mono font-bold text-blue-600">{log.id}</div>
                  <div className="font-mono text-[11px] text-slate-400">{log.timestamp}</div>
                </td>
                <td className="py-3 px-3">
                  <div className="font-semibold text-slate-900">{log.eventName}</div>
                  <div className="font-mono text-[11px] text-slate-400">{log.eventId}</div>
                </td>
                <td className="py-3 px-3">
                  <div className="font-medium text-slate-800">{log.recipient}</div>
                  <div className="text-[11px] text-slate-400">{log.recipientType}</div>
                </td>
                <td className="py-3 px-3">
                  <div className="font-medium text-slate-700">{log.channel}</div>
                  <div className="font-mono text-[11px] text-slate-500">{log.latency}</div>
                </td>
                <td className="py-3 px-3">
                  {log.status === 'success' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ● 投递成功
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      ● 重试成功 (1次)
                    </span>
                  )}
                </td>
                <td className="py-3 px-3">
                  <div className="font-mono text-[11px] text-slate-600 truncate max-w-[140px]" title={log.sha256}>
                    {log.sha256}
                  </div>
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onViewPayload(log)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs cursor-pointer font-medium"
                    >
                      报文
                    </button>
                    <button
                      type="button"
                      onClick={() => onResend(log)}
                      className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs cursor-pointer font-medium"
                    >
                      重发
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
