import React from 'react';
import { ExecutivePnLStats, CurrencyMode } from './types';
import { formatCurrencyValue } from './mockData';

interface ExecutivePnLDeckProps {
  stats: ExecutivePnLStats;
  currency: CurrencyMode;
}

export const ExecutivePnLDeck: React.FC<ExecutivePnLDeckProps> = ({ stats, currency }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Card 1: GMV */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-label-caps text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              卡单总交易流水 (GMV)
            </span>
            <span className="font-numeric-stat text-xl sm:text-2xl text-slate-900 font-bold mt-1 tracking-tight">
              {formatCurrencyValue(stats.gmv, currency)}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-code-token text-[11px] font-semibold flex items-center gap-0.5 border border-emerald-200/60">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            +{stats.gmvGrowthPercent}%
          </span>
        </div>
        <div className="mt-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">日均承揽流水</span>
          <span className="font-numeric-stat font-medium text-slate-800">
            {formatCurrencyValue(stats.dailyAvgGmv, currency)} /天
          </span>
        </div>
      </div>

      {/* Card 2: Spread Revenue */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-label-caps text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              交易总毛收入 (Spread Revenue)
            </span>
            <span className="font-numeric-stat text-xl sm:text-2xl text-blue-600 font-bold mt-1 tracking-tight">
              {formatCurrencyValue(stats.spreadRevenue, currency)}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-code-token text-[11px] font-semibold border border-blue-200/60">
            综合利差 {stats.spreadPercent.toFixed(2)}%
          </span>
        </div>
        <div className="mt-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">基准差价收益贡献</span>
          <span className="font-numeric-stat font-medium text-slate-800">
            {stats.spreadRevenueContributionPercent}% 占比
          </span>
        </div>
      </div>

      {/* Card 3: Direct Cost */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-label-caps text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              平台营业总成本 (Direct Cost)
            </span>
            <span className="font-numeric-stat text-xl sm:text-2xl text-rose-600 font-bold mt-1 tracking-tight">
              {formatCurrencyValue(stats.operatingCosts, currency)}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 font-code-token text-[11px] font-semibold border border-rose-200/60">
            占流水 {stats.operatingCostPercent.toFixed(2)}%
          </span>
        </div>
        <div className="mt-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 truncate pr-1">
            佣金 {formatCurrencyValue(stats.commissionCost, currency, false, true)} · 券 {formatCurrencyValue(stats.couponSubsidyCost, currency, false, true)} · 坏账 {formatCurrencyValue(stats.badDebtCost, currency, false, true)}
          </span>
          <span className="font-numeric-stat font-medium text-rose-600 shrink-0">
            3项冲减
          </span>
        </div>
      </div>

      {/* Card 4: Net Margin */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-emerald-200/90 hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden ring-1 ring-emerald-500/20 bg-gradient-to-br from-white via-white to-emerald-50/20">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-label-caps text-[11px] text-emerald-800 uppercase tracking-wider font-bold">
              平台净留存毛利 (Net Margin)
            </span>
            <span className="font-numeric-stat text-xl sm:text-2xl text-emerald-700 font-extrabold mt-1 tracking-tight">
              {formatCurrencyValue(stats.netMargin, currency)}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-code-token text-[11px] font-bold border border-emerald-300/60">
            净毛利率 {stats.netMarginPercent.toFixed(2)}%
          </span>
        </div>
        <div className="mt-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">目标达成率 (月度)</span>
          <span className="font-numeric-stat font-bold text-emerald-700">
            {stats.targetAchievementPercent}% 超预期
          </span>
        </div>
      </div>
    </div>
  );
};
