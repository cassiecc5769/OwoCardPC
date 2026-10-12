import React, { useState } from 'react';
import { EventRuleItem } from './types';

interface EventRulesTablePaneProps {
  rules: EventRuleItem[];
  selectedRuleId: string | null;
  onSelectRule: (rule: EventRuleItem) => void;
  onConfigureRule: (rule: EventRuleItem) => void;
  onSelectTemplate: (templateId: string) => void;
}

export const EventRulesTablePane: React.FC<EventRulesTablePaneProps> = ({
  rules,
  selectedRuleId,
  onSelectRule,
  onConfigureRule,
  onSelectTemplate,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;
  const totalPages = Math.ceil(rules.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentRules = rules.slice(startIndex, startIndex + pageSize);

  return (
    <div className="xl:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs text-slate-800">事件触发规则矩阵集</span>
          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-semibold">
            Active Rules: {rules.length}
          </span>
        </div>
        <span className="text-slate-400 text-xs font-mono hidden sm:inline">
          Kafka Topic: events.cardops.matrix.*
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-2.5 px-3.5">事件代码 / 业务触发源</th>
              <th className="py-2.5 px-3">目标接收角色</th>
              <th className="py-2.5 px-3">多通道生效矩阵</th>
              <th className="py-2.5 px-3">频控 & 调度策略</th>
              <th className="py-2.5 px-3">关联模板</th>
              <th className="py-2.5 px-3 pr-4 text-right">状态 / 操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {currentRules.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="material-symbols-outlined text-[24px]">inbox</span>
                    <span>暂无符合条件的事件规则</span>
                  </div>
                </td>
              </tr>
            ) : (
              currentRules.map((rule) => {
                const isSelected = selectedRuleId === rule.id;
                return (
                  <tr
                    key={rule.id}
                    onClick={() => onSelectRule(rule)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/50 hover:bg-blue-50/70'
                        : rule.status === 'fused'
                        ? 'bg-rose-50/20 hover:bg-rose-50/30'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Event Code / Source */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded ${rule.iconBg} ${rule.iconColor} flex items-center justify-center border border-slate-200/60 shrink-0`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {rule.icon}
                          </span>
                        </div>
                        <div>
                          <div className="font-mono font-bold text-blue-600 text-xs">
                            {rule.id}
                          </div>
                          <div className="font-medium text-slate-900 text-xs">
                            {rule.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            源: {rule.source}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Target Receiver Roles */}
                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                          <span
                            className={`material-symbols-outlined text-[13px] ${rule.targetRole.iconColor}`}
                          >
                            {rule.targetRole.icon}
                          </span>
                          {rule.targetRole.primary}
                        </span>
                        {rule.targetRole.secondary && (
                          <div className="text-[11px] text-slate-400 font-mono">
                            {rule.targetRole.secondary}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Multi-Channel Matrix */}
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1 max-w-[170px]">
                        {rule.channels.customLabels?.map((label, idx) => {
                          const isPrimary = idx === 0;
                          return (
                            <span
                              key={idx}
                              className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
                                isPrimary
                                  ? 'bg-blue-50 text-blue-700 border border-blue-100 font-medium'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* Throttle & Scheduling */}
                    <td className="py-3 px-3">
                      <div className="font-mono text-[11px] text-slate-500">
                        <div
                          className={
                            rule.throttlePolicy.isHighRisk
                              ? 'text-rose-600 font-semibold'
                              : 'text-slate-700'
                          }
                        >
                          {rule.throttlePolicy.timing}
                        </div>
                        <div
                          className={
                            rule.throttlePolicy.isHighRisk
                              ? 'text-rose-500 font-normal'
                              : 'text-emerald-600 font-semibold'
                          }
                        >
                          {rule.throttlePolicy.rateLimit}
                        </div>
                      </div>
                    </td>

                    {/* Linked Template */}
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTemplate(rule.templateId);
                        }}
                        className="font-mono text-[11px] text-blue-600 hover:underline cursor-pointer text-left truncate block max-w-[130px]"
                        title={rule.templateName}
                      >
                        {rule.templateId}
                      </button>
                    </td>

                    {/* Status & Action */}
                    <td className="py-3 px-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold border ${
                            rule.status === 'running'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : rule.status === 'throttled'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          ● {rule.statusText}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onConfigureRule(rule);
                          }}
                          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                          title="配置规则矩阵与通道"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            tune
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Row */}
      <div className="p-3 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 mt-auto">
        <div>
          显示 {rules.length > 0 ? startIndex + 1 : 0} -{' '}
          {Math.min(startIndex + pageSize, rules.length)} 条，共计 {rules.length} 项全域规则配置
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-mono text-[11px] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            上一页
          </button>
          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            const isActive = currentPage === pageNum;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`px-2.5 py-1 rounded font-mono text-[11px] cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-mono text-[11px] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
};
