import React from 'react';
import { DemandCapacityRow } from './types';

interface DemandCapacityMatrixProps {
  rows: DemandCapacityRow[];
  onExecuteAction: (row: DemandCapacityRow) => void;
}

export const DemandCapacityMatrix: React.FC<DemandCapacityMatrixProps> = ({
  rows,
  onExecuteAction,
}) => {
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [search, setSearch] = React.useState<string>('');

  const filteredRows = rows.filter((r) => {
    if (statusFilter === 'SHORTAGE' && r.status !== '缺口') return false;
    if (statusFilter === 'TIGHT' && r.status !== '紧平衡') return false;
    if (statusFilter === 'SUFFICIENT' && r.status !== '充足' && r.status !== '过剩') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return r.cardBrand.toLowerCase().includes(q) || r.currencyOrRegion.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <section className="bg-white rounded-xl shadow-xs p-4 flex flex-col gap-3.5 border border-slate-200/80">
      {/* 模块标题与图例 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-blue-50 text-blue-600">
            <span className="material-symbols-outlined text-[20px]">balance</span>
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline-sm text-sm font-bold text-slate-900 tracking-tight">
                供需平衡分析矩阵 (Demand vs Capacity Matrix)
              </h2>
              <span className="font-code-token text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60">
                动态测算
              </span>
            </div>
            <p className="font-body-sm text-xs text-slate-500 mt-0.5">
              动态测算在途流水峰值与已分配授信额度，直接驱动调价与商户入水调度
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 快速筛选胶囊 */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium border border-slate-200/70">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-2 py-0.8 rounded-md transition-all cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white text-blue-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              全部 ({rows.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('SHORTAGE')}
              className={`px-2 py-0.8 rounded-md transition-all cursor-pointer ${
                statusFilter === 'SHORTAGE'
                  ? 'bg-rose-50 text-rose-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-rose-600'
              }`}
            >
              缺口预警 ({rows.filter((r) => r.status === '缺口').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('TIGHT')}
              className={`px-2 py-0.8 rounded-md transition-all cursor-pointer ${
                statusFilter === 'TIGHT'
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              紧平衡 ({rows.filter((r) => r.status === '紧平衡').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('SUFFICIENT')}
              className={`px-2 py-0.8 rounded-md transition-all cursor-pointer ${
                statusFilter === 'SUFFICIENT'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              充足与过剩 ({rows.filter((r) => r.status === '充足' || r.status === '过剩').length})
            </button>
          </div>

          <div className="flex items-center gap-3 font-code-token text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-blue-600" />
              <span>在途卡单需求</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-slate-200" />
              <span>商户可用承揽额度</span>
            </div>
          </div>
        </div>
      </div>

      {/* 供需排布数据表 */}
      <div className="w-full overflow-x-auto rounded-lg border border-slate-200/80 bg-slate-50/30">
        <table className="w-full text-left font-body-sm text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-slate-600 font-label-caps text-[11px] uppercase tracking-wider border-b border-slate-200">
              <th className="py-2.5 px-3.5 font-semibold">卡种及币种</th>
              <th className="py-2.5 px-3.5 text-right font-semibold">在途卡单需求 (GMV)</th>
              <th className="py-2.5 px-3.5 text-right font-semibold">商户可用额度 (Capacity)</th>
              <th className="py-2.5 px-4 w-60 font-semibold">供求缓冲对比 (Ratio)</th>
              <th className="py-2.5 px-3.5 text-center font-semibold">当前供需状态</th>
              <th className="py-2.5 px-3.5 font-semibold">建议调度动作与风控策略</th>
              <th className="py-2.5 px-3.5 text-right font-semibold">执行</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white font-numeric-table">
            {filteredRows.map((row) => {
              const isShortage = row.status === '缺口';
              return (
                <tr
                  key={row.id}
                  className={`transition-colors ${
                    isShortage
                      ? 'bg-rose-50/50 hover:bg-rose-50/80'
                      : 'hover:bg-slate-50/70'
                  }`}
                >
                  {/* 卡种及币种 */}
                  <td className="py-3 px-3.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isShortage
                            ? 'bg-rose-600'
                            : row.status === '紧平衡'
                            ? 'bg-blue-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                      <span
                        className={`font-semibold ${
                          isShortage ? 'text-rose-900 font-bold' : 'text-slate-900'
                        }`}
                      >
                        {row.cardBrand}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-code-token text-[10.5px] border border-slate-200">
                        {row.currencyOrRegion}
                      </span>
                    </div>
                  </td>

                  {/* 在途卡单需求 */}
                  <td
                    className={`py-3 px-3.5 text-right font-numeric-stat font-semibold ${
                      isShortage ? 'text-rose-600' : 'text-slate-900'
                    }`}
                  >
                    ${row.demandGmvUsd.toLocaleString()}
                  </td>

                  {/* 商户可用额度 */}
                  <td className="py-3 px-3.5 text-right font-numeric-stat text-slate-600">
                    ${row.capacityGmvUsd.toLocaleString()}
                  </td>

                  {/* 供求缓冲对比 */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isShortage
                              ? 'bg-rose-600'
                              : row.status === '紧平衡'
                              ? 'bg-blue-600'
                              : 'bg-emerald-600'
                          }`}
                          style={{ width: `${Math.min(row.barWidthPercent, 100)}%` }}
                        />
                      </div>
                      <span
                        className={`font-numeric-stat text-xs w-10 text-right ${
                          isShortage ? 'text-rose-600 font-bold' : 'text-slate-600'
                        }`}
                      >
                        {row.ratioPercent}%
                      </span>
                    </div>
                  </td>

                  {/* 当前供需状态 */}
                  <td className="py-3 px-3.5 text-center">
                    {row.status === '充足' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-code-token text-[11px] font-semibold border border-emerald-200">
                        {row.statusBadgeText}
                      </span>
                    )}
                    {row.status === '缺口' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-code-token text-[11px] font-bold border border-rose-200 animate-pulse">
                        <span className="material-symbols-outlined text-[13px]">warning</span>
                        <span>{row.statusBadgeText}</span>
                      </span>
                    )}
                    {row.status === '紧平衡' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-code-token text-[11px] font-semibold border border-blue-200">
                        {row.statusBadgeText}
                      </span>
                    )}
                    {row.status === '过剩' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-code-token text-[11px] font-medium border border-slate-200">
                        {row.statusBadgeText}
                      </span>
                    )}
                  </td>

                  {/* 建议调度动作与风控策略 */}
                  <td
                    className={`py-3 px-3.5 font-body-sm text-xs ${
                      isShortage ? 'text-slate-900 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    {row.strategyAdvice}
                  </td>

                  {/* 执行操作 */}
                  <td className="py-3 px-3.5 text-right">
                    <button
                      onClick={() => onExecuteAction(row)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                        row.actionType === 'danger'
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {row.actionText}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
