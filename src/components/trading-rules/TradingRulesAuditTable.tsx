import React, { useState } from 'react';
import { AuditLogRow } from './types';

interface TradingRulesAuditTableProps {
  logs: AuditLogRow[];
  onVerifyAudit: (log: AuditLogRow) => void;
  onViewTicket: (ticket: string) => void;
}

export const TradingRulesAuditTable: React.FC<TradingRulesAuditTableProps> = ({
  logs,
  onVerifyAudit,
  onViewTicket,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterMode, setFilterMode] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    if (filterMode !== 'all' && log.mode !== filterMode) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      log.id.toLowerCase().includes(q) ||
      log.ticket.toLowerCase().includes(q) ||
      log.operator.name.toLowerCase().includes(q) ||
      log.reason.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col space-y-4">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">
              receipt_long
            </span>
            <h2 className="text-base font-bold text-slate-900">
              规则版本演进与全网操作审计日志
            </h2>
            <span className="font-mono text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-medium">
              双向审批签章
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            记录所有业务参数的历史变更全链路。每一条调整均绑定关联审批工单、前置数值与责任人数字指纹，支持毫秒级回溯。
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="检索工单 / 责任人 / 规则..."
              className="h-8 pl-8 pr-3 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:ring-1 focus:ring-blue-600 focus:outline-none text-slate-800 w-48 sm:w-60"
            />
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-slate-400">
              search
            </span>
          </div>

          <div className="relative">
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="h-8 px-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none cursor-pointer"
            >
              <option value="all">全部生效模式</option>
              <option value="立即生效">立即生效</option>
              <option value="定时生效">定时生效</option>
              <option value="审批生效">审批生效</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Data Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-3.5">规则编码</th>
              <th className="py-3 px-3.5">变更前设定</th>
              <th className="py-3 px-3.5">变更后参数 (生效)</th>
              <th className="py-3 px-3.5">生效模式</th>
              <th className="py-3 px-3.5">生效时间戳</th>
              <th className="py-3 px-3.5">经办责任人</th>
              <th className="py-3 px-3.5">关联审批工单</th>
              <th className="py-3 px-3.5">变更原因与业务依据</th>
              <th className="py-3 px-3.5 text-right">历史快照</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredLogs.map((log, index) => (
              <tr key={index} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-3.5 font-mono font-bold text-blue-600">
                  {log.id}
                </td>
                <td className="py-3 px-3.5 font-mono text-slate-400 line-through">
                  {log.prevValue}
                </td>
                <td className="py-3 px-3.5 font-mono font-bold text-slate-900 bg-slate-50/80 px-2 rounded">
                  {log.nextValue}
                </td>
                <td className="py-3 px-3.5">
                  <span
                    className={`font-mono text-[10px] border font-semibold px-2 py-0.5 rounded-full ${
                      log.mode === '立即生效'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {log.mode}
                  </span>
                </td>
                <td className="py-3 px-3.5 font-mono text-slate-500">{log.timestamp}</td>
                <td className="py-3 px-3.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-5 h-5 rounded-full text-white font-mono text-[10px] flex items-center justify-center font-bold ${
                        log.operator.bg || 'bg-blue-600'
                      }`}
                    >
                      {log.operator.initials}
                    </span>
                    <span className="font-medium text-slate-700">
                      {log.operator.name} · {log.operator.title}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3.5 font-mono">
                  <button
                    type="button"
                    onClick={() => onViewTicket(log.ticket)}
                    className="text-blue-600 hover:underline cursor-pointer font-semibold"
                  >
                    {log.ticket}
                  </button>
                </td>
                <td
                  className="py-3 px-3.5 max-w-xs truncate text-slate-600"
                  title={log.reason}
                >
                  {log.reason}
                </td>
                <td className="py-3 px-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => onVerifyAudit(log)}
                    className="text-blue-600 hover:underline font-mono text-xs font-semibold cursor-pointer"
                  >
                    回溯核验
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Pagination & Verification Link */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-500 text-xs">
        <div className="flex items-center gap-2">
          <span>共 186 条全网审计记录</span>
          <span className="text-slate-300">/</span>
          <span className="font-mono text-[11px] text-slate-600">
            SHA-256 签名链校验通过: 0x9e1c4b82...
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
          >
            上一页
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            className={`px-3 py-1 rounded font-mono text-xs font-semibold shadow-xs cursor-pointer ${
              currentPage === 1
                ? 'bg-blue-600 text-white'
                : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            1
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(2)}
            className={`px-2.5 py-1 rounded font-mono text-xs cursor-pointer ${
              currentPage === 2
                ? 'bg-blue-600 text-white font-semibold'
                : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            2
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(3)}
            className={`px-2.5 py-1 rounded font-mono text-xs cursor-pointer ${
              currentPage === 3
                ? 'bg-blue-600 text-white font-semibold'
                : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            3
          </button>
          <span className="px-1 text-slate-400">...</span>
          <button
            type="button"
            onClick={() => setCurrentPage(19)}
            className={`px-2.5 py-1 rounded font-mono text-xs cursor-pointer ${
              currentPage === 19
                ? 'bg-blue-600 text-white font-semibold'
                : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            19
          </button>
          <button
            type="button"
            disabled={currentPage === 19}
            onClick={() => setCurrentPage((p) => Math.min(19, p + 1))}
            className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
};
