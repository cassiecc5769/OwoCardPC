import React from 'react';
import { FinancialFilterState, CurrencyMode, USD_TO_NGN_RATE } from './types';

interface FinancialFilterBarProps {
  filters: FinancialFilterState;
  onFilterChange: (newFilters: Partial<FinancialFilterState>) => void;
  onOpenExportPnL: () => void;
  onOpenCustomDate: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  viewMode?: 'dashboard' | 'report';
  onSwitchView?: (mode: 'dashboard' | 'report') => void;
}

export const FinancialFilterBar: React.FC<FinancialFilterBarProps> = ({
  filters,
  onFilterChange,
  onOpenExportPnL,
  onOpenCustomDate,
  onRefresh,
  isRefreshing = false,
  viewMode = 'dashboard',
  onSwitchView,
}) => {
  const setCurrency = (c: CurrencyMode) => {
    onFilterChange({ currency: c });
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4 sm:p-5 flex flex-col gap-3.5">
      {/* Top Row: Dashboard Secondary Banner & Currency Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              财务经营损益与边际贡献大盘
            </h2>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-code-token text-[11px] font-semibold border border-blue-200/60">
              PRD v2.1 COMPLIANT
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              中央存管总账实时对齐
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            商业盈利模式透视 · 单卡单元经济学(Unit Economics) · 动态利差成本归因分析
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Currency Switcher */}
          <div className="flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200/80 shadow-xs">
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                filters.currency === 'USD'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="font-code-token">$</span> USD 基准折算
            </button>
            <button
              onClick={() => setCurrency('NGN')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                filters.currency === 'NGN'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="font-code-token">₦</span> NGN 奈拉折算
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={onOpenExportPnL}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">file_download</span>
            <span>导出损益表</span>
          </button>
        </div>
      </div>

      {/* Second Row: Micro Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Range Selector */}
          <div className="flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200/80">
            <button
              onClick={() => onFilterChange({ timeRange: 'today' })}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                filters.timeRange === 'today'
                  ? 'bg-white text-blue-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              今日实时
            </button>
            <button
              onClick={() => onFilterChange({ timeRange: 'yesterday' })}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                filters.timeRange === 'yesterday'
                  ? 'bg-white text-blue-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              昨日
            </button>
            <button
              onClick={() => onFilterChange({ timeRange: '7d' })}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                filters.timeRange === '7d'
                  ? 'bg-white text-blue-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              近7天
            </button>
            <button
              onClick={() => onFilterChange({ timeRange: 'month' })}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                filters.timeRange === 'month'
                  ? 'bg-white text-blue-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              本月 (2026-08)
            </button>
            <button
              onClick={onOpenCustomDate}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                filters.timeRange === 'custom'
                  ? 'bg-white text-blue-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">date_range</span>
              {filters.timeRange === 'custom' ? `${filters.customStartDate} ~ ${filters.customEndDate}` : '自定义区间'}
            </button>
          </div>

          <span className="h-4 w-[1px] bg-slate-200 hidden sm:block"></span>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category */}
            <div className="relative">
              <select
                value={filters.cardBrand}
                onChange={(e) => onFilterChange({ cardBrand: e.target.value })}
                className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs pl-2.5 pr-7 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
              >
                <option>全部卡种品类 (All Giftcards)</option>
                <option>Apple App Store / iTunes</option>
                <option>Steam Wallet (USD/EUR)</option>
                <option>Google Play Console</option>
                <option>Razer Gold Global</option>
                <option>Vanilla Visa / Mastercard</option>
              </select>
              <span className="material-symbols-outlined absolute right-1.5 top-2 text-[16px] pointer-events-none text-slate-400">
                expand_more
              </span>
            </div>

            {/* Region */}
            <div className="relative">
              <select
                value={filters.region}
                onChange={(e) => onFilterChange({ region: e.target.value })}
                className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs pl-2.5 pr-7 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
              >
                <option>全域国家/地区 (All Regions)</option>
                <option>United States (US)</option>
                <option>Nigeria (NG)</option>
                <option>European Union (DE/FR)</option>
                <option>Global Unrestricted</option>
              </select>
              <span className="material-symbols-outlined absolute right-1.5 top-2 text-[16px] pointer-events-none text-slate-400">
                expand_more
              </span>
            </div>

            {/* Channel */}
            <div className="relative">
              <select
                value={filters.channel}
                onChange={(e) => onFilterChange({ channel: e.target.value })}
                className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs pl-2.5 pr-7 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
              >
                <option>商户收单渠道 (All Ingress Channels)</option>
                <option>直营 API 开发者渠道</option>
                <option>大客户批量兑换 (Tier 1 OTC)</option>
                <option>长尾散户撮合网络</option>
              </select>
              <span className="material-symbols-outlined absolute right-1.5 top-2 text-[16px] pointer-events-none text-slate-400">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Right Info Pill */}
        <div className="flex items-center gap-2 font-code-token text-[11px] text-slate-500">
          <span>
            汇率锁定:{' '}
            <strong className="text-slate-900 font-semibold font-numeric-stat">
              1 USD = {USD_TO_NGN_RATE.toLocaleString('en-US', { minimumFractionDigits: 2 })} NGN
            </strong>
          </span>
          <span>·</span>
          <span>核算口径: 权责发生制 (Accrual)</span>
        </div>
      </div>
    </div>
  );
};
