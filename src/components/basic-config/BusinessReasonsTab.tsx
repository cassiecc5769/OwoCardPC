import React, { useState } from 'react';
import { BusinessReasonItem } from './types';

interface BusinessReasonsTabProps {
  reasons: BusinessReasonItem[];
  selectedReasonId: string;
  onSelectReason: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onOpenEditReason: (reason: BusinessReasonItem) => void;
  onOpenAuditLineage: (reason: BusinessReasonItem) => void;
  onOpenEditI18n: (reason: BusinessReasonItem) => void;
  onOpenTestEcho: (reason: BusinessReasonItem) => void;
}

export const BusinessReasonsTab: React.FC<BusinessReasonsTabProps> = ({
  reasons,
  selectedReasonId,
  onSelectReason,
  onToggleStatus,
  onOpenEditReason,
  onOpenAuditLineage,
  onOpenEditI18n,
  onOpenTestEcho,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const totalItems = reasons.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentItems = reasons.slice(startIndex, startIndex + pageSize);

  const selectedReason = reasons.find((r) => r.id === selectedReasonId) || reasons[0];

  const getDomainBadge = (domain: string) => {
    switch (domain) {
      case 'F':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200/80 whitespace-nowrap">交易失败</span>;
      case 'A':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/80 whitespace-nowrap">异常阻断</span>;
      case 'D':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200/80 whitespace-nowrap">售后争议</span>;
      case 'ADJ':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/80 whitespace-nowrap">财务调账</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/80 whitespace-nowrap">{domain}</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Left: Core Dictionary Table (7/12) */}
      <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 text-sm">业务原因字典明细列表</span>
            <span className="font-mono text-xs text-slate-400">
              (共检索出 {totalItems} 项 / 当前展示 {currentItems.length} 项核心范例)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">单页容量:</span>
            <span className="font-mono text-xs text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded">
              {pageSize} 条/页
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-3 w-8 text-center">选</th>
                <th className="py-2.5 px-3">原因代码 (CODE)</th>
                <th className="py-2.5 px-3">标准业务语义 / 中文定义</th>
                <th className="py-2.5 px-2.5">所属领域</th>
                <th className="py-2.5 px-3">建议处置决策动作</th>
                <th className="py-2.5 px-2">依赖系统</th>
                <th className="py-2.5 px-2 text-center">状态</th>
                <th className="py-2.5 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {currentItems.map((item) => {
                const isSelected = selectedReason?.id === item.id;
                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectReason(item.id)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/60 hover:bg-blue-50/80'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="radio"
                        name="dict_select"
                        checked={isSelected}
                        onChange={() => onSelectReason(item.id)}
                        className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3 font-mono font-bold whitespace-nowrap text-blue-600">
                      {item.code}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{item.nameZh}</div>
                      <div className="font-mono text-[10px] text-slate-400">{item.nameEn}</div>
                    </td>
                    <td className="py-3 px-2.5 whitespace-nowrap">
                      {getDomainBadge(item.domain)}
                    </td>
                    <td
                      className="py-3 px-3 text-slate-600 max-w-[140px] truncate"
                      title={item.actionTooltip || item.actionDecision}
                    >
                      {item.actionDecision}
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {item.dependencies.map((dep, idx) => (
                          <span
                            key={idx}
                            className="px-1 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600"
                          >
                            {dep}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={() => onToggleStatus(item.id)}
                          className="sr-only peer"
                        />
                        <div className="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1.5 font-medium">
                        <button
                          onClick={() => onOpenEditReason(item)}
                          className="text-blue-600 hover:underline cursor-pointer"
                          type="button"
                        >
                          编辑
                        </button>
                        <span className="text-slate-300">·</span>
                        <button
                          onClick={() => onOpenAuditLineage(item)}
                          className="text-slate-600 hover:text-blue-600 cursor-pointer"
                          type="button"
                        >
                          溯源
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            当前显示第 {totalItems > 0 ? startIndex + 1 : 0} 至{' '}
            {Math.min(startIndex + pageSize, totalItems)} 项，共 {totalItems} 项字典代码
          </span>
          <div className="flex items-center gap-1 font-mono">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              type="button"
            >
              上一页
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
                type="button"
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              type="button"
            >
              下一页
            </button>
          </div>
        </div>
      </div>

      {/* Right: Dictionary Inspector & Multi-Language Sandbox (5/12) */}
      <div className="lg:col-span-5 space-y-4">
        {selectedReason ? (
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                <span className="font-bold text-slate-900 text-sm">
                  字典详情与多语言沙盒 (Dictionary Inspector)
                </span>
              </div>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                ID: {selectedReason.id}
              </span>
            </div>

            {/* Target Meta */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">当前选定编码:</span>
                <span className="font-mono font-bold text-blue-700">{selectedReason.code}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">所属业务归因:</span>
                <span className="font-medium text-rose-600">
                  {selectedReason.domainLabel} / {selectedReason.nameZh}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">强约束保护级别:</span>
                <span className="font-mono text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  {selectedReason.constraintLevel}
                </span>
              </div>
            </div>

            {/* Multi-language Mapping Matrix */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  跨语言翻译映射 (i18n MATRIX)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">3 / 3 已就绪</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-800">简体中文 (zh-CN)</span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {selectedReason.i18n.zhCN.note}
                    </span>
                  </div>
                  <p className="text-slate-700 font-mono text-[11px] leading-relaxed">
                    {selectedReason.i18n.zhCN.text}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-800">英语 (en-US)</span>
                    <span className="text-emerald-600 font-mono text-[10px] font-medium">
                      {selectedReason.i18n.enUS.note}
                    </span>
                  </div>
                  <p className="text-slate-700 font-mono text-[11px] leading-relaxed">
                    {selectedReason.i18n.enUS.text}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-800">
                      西非洋泾浜英语 (Pidgin / Local)
                    </span>
                    <span className="text-emerald-600 font-mono text-[10px] font-medium">
                      {selectedReason.i18n.pidgin.note}
                    </span>
                  </div>
                  <p className="text-slate-700 font-mono text-[11px] leading-relaxed">
                    {selectedReason.i18n.pidgin.text}
                  </p>
                </div>
              </div>
            </div>

            {/* Cross-client Output Preview */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                跨端输出回显仿真 (CLIENT RENDERS)
              </span>
              <div className="space-y-2.5 text-xs">
                {/* Mobile App Notification Warning */}
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-[11px]">
                    <span className="material-symbols-outlined text-[15px]">smartphone</span>
                    <span>出卡用户端 UI 提示:</span>
                  </div>
                  <p className="text-amber-950 text-[11px] leading-normal">
                    {selectedReason.clientRenders.userAppTip}
                  </p>
                </div>

                {/* Merchant API Error JSON Block */}
                <div className="p-3 rounded-lg bg-slate-900 text-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                      <span className="material-symbols-outlined text-[15px]">api</span>
                      <span>商户端 API 报错报文:</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">
                      {selectedReason.clientRenders.merchantApiError.httpStatus}
                    </span>
                  </div>
                  <pre className="font-mono text-[11px] text-emerald-400 overflow-x-auto bg-slate-950/80 p-2 rounded border border-slate-800 leading-relaxed">
                    {selectedReason.clientRenders.merchantApiError.json}
                  </pre>
                </div>
              </div>
            </div>

            {/* Hit Metrics & Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-medium">
                  今日累计命中
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono text-rose-600">
                    {selectedReason.todayHits}
                  </span>
                  <span className="text-[10px] text-slate-400">次调用</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenEditI18n(selectedReason)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                  type="button"
                >
                  修改译文
                </button>
                <button
                  onClick={() => onOpenTestEcho(selectedReason)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
                  type="button"
                >
                  测试回显
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Quick Safety Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <span className="material-symbols-outlined text-[17px] text-blue-600">
              security_update_good
            </span>
            <span>基础配置变更防护审计规则</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            由于卡种面额、核销流水与财务账单直接绑定字典编码，修改名称仅对新账单生效，历史账单自动保留原文本快照存证。
          </p>
        </div>
      </div>
    </div>
  );
};
