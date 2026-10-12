import React from 'react';
import { MerchantFilterState } from './types';

interface MerchantFilterBarProps {
  filters: MerchantFilterState;
  onFilterChange: (newFilters: Partial<MerchantFilterState>) => void;
  onOpenDispatchConfig: () => void;
  onOpenExportReport: () => void;
  onOpenCustomDate: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  syncTime: string;
}

export const MerchantFilterBar: React.FC<MerchantFilterBarProps> = ({
  filters,
  onFilterChange,
  onOpenDispatchConfig,
  onOpenCustomDate,
  onRefresh,
  isRefreshing,
  syncTime,
}) => {
  return (
    <section className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4 flex flex-col gap-3.5">
      {/* 顶部功能头区与参数操作按键 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-6 bg-blue-600 rounded-xs shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                商户承揽产能与供需风控看板
              </h2>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold border border-blue-200/60">
                PRD v2.0
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                实时计算就绪
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono tracking-wider mt-0.5">
              CAPACITY ALLOCATION, DISPATCH BALANCE &amp; COUNTERPARTY RISK ENGINE
            </p>
          </div>
        </div>

        {/* 快捷操作按键 */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenDispatchConfig}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-all border border-slate-200 cursor-pointer shadow-2xs"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-blue-600">tune</span>
            <span>供需调度参数配置</span>
          </button>
        </div>
      </div>

      {/* 细分筛选维度带与引擎状态 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 时间周期快捷按钮 */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 text-xs">
            <button
              onClick={() => onFilterChange({ timeRange: 'today' })}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                filters.timeRange === 'today'
                  ? 'bg-white text-blue-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              今日实时
            </button>
            <button
              onClick={() => onFilterChange({ timeRange: 'yesterday' })}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                filters.timeRange === 'yesterday'
                  ? 'bg-white text-blue-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              昨日
            </button>
            <button
              onClick={() => onFilterChange({ timeRange: '7d' })}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                filters.timeRange === '7d'
                  ? 'bg-white text-blue-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              近7天
            </button>
            <button
              onClick={() => onFilterChange({ timeRange: 'month' })}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                filters.timeRange === 'month'
                  ? 'bg-white text-blue-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              本月
            </button>
            <button
              onClick={onOpenCustomDate}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                filters.timeRange === 'custom'
                  ? 'bg-white text-blue-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">calendar_today</span>
              <span>
                {filters.timeRange === 'custom' && filters.customStartDate
                  ? `${filters.customStartDate} ~ ${filters.customEndDate}`
                  : '自定义'}
              </span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200" />

          {/* 卡品牌 */}
          <div className="flex items-center bg-slate-50 px-2.5 py-1 rounded-lg gap-2 border border-slate-200/80">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">
              卡品牌:
            </span>
            <select
              value={filters.cardBrand}
              onChange={(e) => onFilterChange({ cardBrand: e.target.value })}
              className="bg-transparent text-xs text-slate-800 focus:outline-none cursor-pointer font-medium"
            >
              <option>全部卡种 (All Brands)</option>
              <option>Apple Gift Card</option>
              <option>Steam Wallet</option>
              <option>Vanilla Visa</option>
              <option>Razer Gold</option>
              <option>Amazon Balance</option>
            </select>
          </div>

          {/* 商户分层 */}
          <div className="flex items-center bg-slate-50 px-2.5 py-1 rounded-lg gap-2 border border-slate-200/80">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">
              分层:
            </span>
            <select
              value={filters.tier}
              onChange={(e) => onFilterChange({ tier: e.target.value })}
              className="bg-transparent text-xs text-slate-800 focus:outline-none cursor-pointer font-medium"
            >
              <option>全部层级 (All Tiers)</option>
              <option>Tier-S 核心自营</option>
              <option>Tier-A 优质大商</option>
              <option>Tier-B 标准合作</option>
              <option>SUSPEND 冻结监控</option>
            </select>
          </div>

          {/* 做卡模式 */}
          <div className="flex items-center bg-slate-50 px-2.5 py-1 rounded-lg gap-2 border border-slate-200/80">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">
              做卡模式:
            </span>
            <select
              value={filters.fulfillmentMode}
              onChange={(e) => onFilterChange({ fulfillmentMode: e.target.value })}
              className="bg-transparent text-xs text-slate-800 focus:outline-none cursor-pointer font-medium"
            >
              <option>全部模式</option>
              <option>API直连专线</option>
              <option>自动化智能撮合</option>
              <option>混合动态兜底</option>
              <option>人工驻场专席</option>
            </select>
          </div>

          {/* 国家/大区 */}
          <div className="flex items-center bg-slate-50 px-2.5 py-1 rounded-lg gap-2 border border-slate-200/80">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">
              大区:
            </span>
            <select
              value={filters.region}
              onChange={(e) => onFilterChange({ region: e.target.value })}
              className="bg-transparent text-xs text-slate-800 focus:outline-none cursor-pointer font-medium"
            >
              <option>全球全区 (Global)</option>
              <option>北美大区 (US/CA)</option>
              <option>欧洲大区 (UK/DE/FR)</option>
              <option>亚太大区 (JP/KR/SEA)</option>
              <option>拉美及新兴市场</option>
            </select>
          </div>
        </div>

        {/* 引擎状态与刷新按钮 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>引擎时序: {syncTime}</span>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all cursor-pointer ${
              isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="刷新数据"
            type="button"
          >
            <span
              className={`material-symbols-outlined text-[17px] ${
                isRefreshing ? 'animate-spin text-blue-600' : ''
              }`}
            >
              sync
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
