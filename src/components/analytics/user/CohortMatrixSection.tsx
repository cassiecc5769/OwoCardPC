import React from 'react';
import { CohortMatrixRow } from './types';

interface CohortMatrixSectionProps {
  cohorts: CohortMatrixRow[];
  onSelectCohort: (cohort: CohortMatrixRow) => void;
}

export const CohortMatrixSection: React.FC<CohortMatrixSectionProps> = ({
  cohorts,
  onSelectCohort,
}) => {
  // Heatmap background helper matching the design prototype
  const getHeatmapClass = (valStr: string) => {
    if (valStr === '-' || !valStr) return 'text-slate-400 font-code-token';
    if (valStr.includes('跟踪') || valStr.includes('中')) {
      return 'text-blue-700 bg-blue-50/70 font-code-token text-[11px] font-medium';
    }

    const num = parseFloat(valStr.replace('%', ''));
    if (isNaN(num)) return 'text-slate-400 font-code-token';

    if (num >= 45) {
      return 'bg-blue-600 text-white font-semibold shadow-2xs';
    } else if (num >= 35) {
      return 'bg-blue-400 text-white font-semibold';
    } else if (num >= 20) {
      return 'bg-blue-200 text-slate-900 font-semibold';
    } else {
      return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4 flex flex-col gap-3.5">
      {/* 模块头部与图例说明 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-blue-600 rounded-xs" />
          <div className="flex items-center gap-2">
            <h3 className="font-headline-md text-sm font-bold text-slate-900 tracking-tight">
              真实交易留存与同期群矩阵 (Transaction Cohort Matrix)
            </h3>
            <span className="font-code-token text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
              以自然月首单激活分组 · 热力梯队
            </span>
          </div>
        </div>

        {/* 留存热力图例 */}
        <div className="flex items-center gap-2 font-code-token text-[11px] text-slate-500">
          <span>留存热力:</span>
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            &lt;20%
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-200 text-slate-900">
            20%-35%
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-400 text-white">
            35%-45%
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-semibold">
            &gt;45% 极优
          </span>
        </div>
      </div>

      {/* 矩阵数据表格 */}
      <div className="w-full overflow-x-auto rounded-lg border border-slate-200/80 bg-slate-50/40">
        <table className="w-full text-left font-numeric-table text-xs border-collapse">
          <thead>
            <tr className="h-9 bg-slate-100/90 text-slate-600 font-label-caps text-[11px] uppercase tracking-wider border-b border-slate-200">
              <th className="px-4 py-2 w-32 font-semibold">首单月份 (Cohort)</th>
              <th className="px-4 py-2 w-32 text-right font-semibold">首月有效用户</th>
              <th className="px-4 py-2 text-center w-28 font-semibold">+1 个月</th>
              <th className="px-4 py-2 text-center w-28 font-semibold">+2 个月</th>
              <th className="px-4 py-2 text-center w-28 font-semibold">+3 个月</th>
              <th className="px-4 py-2 text-center w-28 font-semibold">+4 个月</th>
              <th className="px-4 py-2 text-center w-28 font-semibold">+5 个月</th>
              <th className="px-4 py-2 text-right w-36 font-semibold">累计单客 LTV</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {cohorts.map((row) => {
              const isCurrent = row.isCurrentMonth;
              return (
                <tr
                  key={row.cohortMonth}
                  onClick={() => onSelectCohort(row)}
                  className={`h-10 transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-50/50 hover:bg-blue-50/80'
                      : 'hover:bg-slate-50/80'
                  }`}
                  title="点击查看该 Cohort 批次客群流转画像明细"
                >
                  {/* 首单月份 */}
                  <td className="px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <span className={isCurrent ? 'text-blue-700 font-bold' : ''}>
                        {row.cohortMonth}
                      </span>
                      {isCurrent && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 首月有效用户 */}
                  <td
                    className={`px-4 text-right font-numeric-stat ${
                      isCurrent ? 'text-blue-700 font-bold' : 'text-slate-800'
                    }`}
                  >
                    {row.initialUsers.toLocaleString()} 人
                  </td>

                  {/* +1 个月 */}
                  <td className="px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md min-w-[58px] ${getHeatmapClass(
                        row.m1
                      )}`}
                    >
                      {row.m1}
                    </span>
                  </td>

                  {/* +2 个月 */}
                  <td className="px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md min-w-[58px] ${getHeatmapClass(
                        row.m2
                      )}`}
                    >
                      {row.m2}
                    </span>
                  </td>

                  {/* +3 个月 */}
                  <td className="px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md min-w-[58px] ${getHeatmapClass(
                        row.m3
                      )}`}
                    >
                      {row.m3}
                    </span>
                  </td>

                  {/* +4 个月 */}
                  <td className="px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md min-w-[58px] ${getHeatmapClass(
                        row.m4
                      )}`}
                    >
                      {row.m4}
                    </span>
                  </td>

                  {/* +5 个月 */}
                  <td className="px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md min-w-[58px] ${getHeatmapClass(
                        row.m5
                      )}`}
                    >
                      {row.m5}
                    </span>
                  </td>

                  {/* 累计单客 LTV */}
                  <td
                    className={`px-4 text-right font-numeric-stat font-semibold ${
                      isCurrent ? 'text-blue-700' : 'text-slate-900'
                    }`}
                  >
                    ${row.cumulativeLtvUsd.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 底部业务口径与更新时间 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-500 font-body-sm text-xs pt-0.5">
        <span>
          * 注：+N个月留存口径为该月内完成至少 1 笔 ≥$50 USD 真实有效核销的独立出卡用户。
        </span>
        <span className="font-code-token text-[11px]">
          模型更新时间: 2026-08-31 23:59:59 UTC
        </span>
      </div>
    </section>
  );
};
