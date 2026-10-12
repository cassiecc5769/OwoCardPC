import React, { useState } from 'react';
import { CardSkuProfitabilityRow, CurrencyMode } from './types';
import { formatCurrencyValue } from './mockData';

interface CardProfitabilityTableProps {
  rows: CardSkuProfitabilityRow[];
  currency: CurrencyMode;
  onRateControl: (row: CardSkuProfitabilityRow) => void;
  onRiskRestrict: (row: CardSkuProfitabilityRow) => void;
}

export const CardProfitabilityTable: React.FC<CardProfitabilityTableProps> = ({
  rows,
  currency,
  onRateControl,
  onRiskRestrict,
}) => {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden flex flex-col">
      {/* Table Header Bar */}
      <div className="px-4 py-3 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="material-symbols-outlined text-blue-600 text-[20px]">
            table_chart
          </span>
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            品类与国家多维毛利透视表 (P&L Breakdown by SKU & Geo)
          </h2>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-code-token text-[11px] font-semibold border border-slate-200">
            {rows.length} 个核心主力盘口
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>健康毛利 (&gt;4%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>稳态走量 (3%~4%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            <span>高危收紧 (&lt;3%)</span>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 font-label-caps text-[11px] uppercase tracking-wider h-10 border-b border-slate-200 select-none">
              <th className="py-2.5 px-4 font-semibold">卡种品类与发行国</th>
              <th className="py-2.5 px-4 font-semibold text-right">交易流水 (GMV)</th>
              <th className="py-2.5 px-4 font-semibold text-center">官方基准 vs 商户承揽价</th>
              <th className="py-2.5 px-4 font-semibold text-right">平台毛收入 ({currency})</th>
              <th className="py-2.5 px-4 font-semibold text-right">推广与补贴成本</th>
              <th className="py-2.5 px-4 font-semibold text-right">净利润额 (Net Profit)</th>
              <th className="py-2.5 px-4 font-semibold text-right">净毛利率 (%)</th>
              <th className="py-2.5 px-4 font-semibold text-center">商业战略定位</th>
              <th className="py-2.5 px-4 font-semibold text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => {
              const isExpanded = expandedRowId === row.id;

              return (
                <React.Fragment key={row.id}>
                  <tr className="hover:bg-slate-50/80 transition-colors group">
                    {/* Sku & Region */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          onClick={() => toggleExpand(row.id)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-transform ${
                            row.healthTier === 'high-risk'
                              ? 'bg-rose-50 text-rose-600 border border-rose-200/60'
                              : 'bg-slate-100 text-slate-700 border border-slate-200/60'
                          }`}
                          title="点击展开/收起成本归因穿透"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {row.iconName}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 leading-tight flex items-center gap-1">
                            {row.skuName}
                            <button
                              onClick={() => toggleExpand(row.id)}
                              className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                              title="穿透成本归因"
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {isExpanded ? 'expand_less' : 'info'}
                              </span>
                            </button>
                          </span>
                          <span className="font-code-token text-[11px] text-slate-500">
                            {row.skuCode} · {row.cardTypeDesc}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* GMV */}
                    <td className="py-3 px-4 text-right font-numeric-stat font-semibold text-slate-900 text-xs sm:text-[13px]">
                      {formatCurrencyValue(row.gmv, currency)}
                    </td>

                    {/* Official vs Merchant Rate */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-numeric-stat text-slate-500 text-xs">
                        {row.officialRatePercent.toFixed(1)}%
                      </span>
                      <span className="font-code-token text-slate-400 mx-1">vs</span>
                      <span
                        className={`font-numeric-stat font-semibold text-xs ${
                          row.healthTier === 'high-risk' ? 'text-rose-600' : 'text-blue-600'
                        }`}
                      >
                        {row.merchantRatePercent.toFixed(1)}%
                      </span>
                      <span
                        className={`font-code-token font-medium text-[11px] ml-1 ${
                          row.healthTier === 'high-risk' ? 'text-rose-600' : 'text-blue-600'
                        }`}
                      >
                        (+{row.spreadPercent.toFixed(1)}%)
                      </span>
                    </td>

                    {/* Gross Revenue */}
                    <td className="py-3 px-4 text-right font-numeric-stat font-semibold text-slate-900 text-xs sm:text-[13px]">
                      {formatCurrencyValue(row.grossRevenue, currency)}
                    </td>

                    {/* Cost Deductions */}
                    <td className="py-3 px-4 text-right font-numeric-stat font-medium text-rose-600 text-xs">
                      {formatCurrencyValue(row.costsTotal, currency)}
                    </td>

                    {/* Net Profit */}
                    <td className="py-3 px-4 text-right font-numeric-stat font-bold text-xs sm:text-[13px]">
                      <span
                        className={
                          row.healthTier === 'healthy'
                            ? 'text-emerald-700'
                            : row.healthTier === 'high-risk'
                            ? 'text-rose-600'
                            : 'text-slate-900'
                        }
                      >
                        {formatCurrencyValue(row.netProfit, currency)}
                      </span>
                    </td>

                    {/* Net Margin % */}
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-numeric-stat font-bold text-xs ${
                          row.healthTier === 'healthy'
                            ? 'text-emerald-700'
                            : row.healthTier === 'high-risk'
                            ? 'text-rose-600'
                            : 'text-blue-600'
                        }`}
                      >
                        {row.netMarginPercent.toFixed(2)}%
                      </span>
                    </td>

                    {/* Strategy Tag */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-md font-code-token text-[11px] font-semibold inline-block ${row.strategyTagStyle}`}
                      >
                        {row.strategyTag}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      {row.actionType === 'rate_control' ? (
                        <button
                          onClick={() => onRateControl(row)}
                          className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-code-token text-[11px] font-medium transition-colors cursor-pointer border border-blue-200/60"
                        >
                          调控汇率
                        </button>
                      ) : (
                        <button
                          onClick={() => onRiskRestrict(row)}
                          className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-code-token text-[11px] font-semibold transition-colors cursor-pointer border border-rose-200/60"
                        >
                          限额降权
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Accordion: Cost Breakdown Drilldown */}
                  {isExpanded && (
                    <tr className="bg-slate-50/50">
                      <td colSpan={9} className="px-6 py-3 border-y border-slate-100">
                        <div className="p-3 bg-white rounded-lg border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded bg-blue-50 text-blue-600">
                              <span className="material-symbols-outlined text-[16px]">pie_chart</span>
                            </span>
                            <span className="font-semibold text-slate-800">
                              {row.skuName} 财务科目三层归因穿透：
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-slate-600">
                            <div>
                              推广裂变佣金:{' '}
                              <span className="font-numeric-stat font-semibold text-rose-600">
                                {formatCurrencyValue(row.commissionDeduction, currency)}
                              </span>
                            </div>
                            <div>
                              营销加价券补贴:{' '}
                              <span className="font-numeric-stat font-semibold text-rose-600">
                                {formatCurrencyValue(row.couponDeduction, currency)}
                              </span>
                            </div>
                            <div>
                              售后争议与坏账:{' '}
                              <span className="font-numeric-stat font-semibold text-rose-600">
                                {formatCurrencyValue(row.badDebtDeduction, currency)}
                              </span>
                            </div>
                            <div>
                              单点成本侵蚀率:{' '}
                              <span className="font-numeric-stat font-bold text-slate-900">
                                {((Math.abs(row.costsTotal) / row.grossRevenue) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Pagination & Audit Footer */}
      <div className="p-3 sm:px-5 sm:py-3 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between font-code-token text-[11px] text-slate-500 gap-2">
        <span>统计周期: 2026-08-01 00:00:00 至 2026-08-31 23:59:59 (UTC+1)</span>
        <div className="flex items-center gap-3">
          <span>有效样本结算订单: 142,850 笔</span>
          <span>·</span>
          <span>加权毛利率: 4.0901%</span>
        </div>
      </div>
    </div>
  );
};
