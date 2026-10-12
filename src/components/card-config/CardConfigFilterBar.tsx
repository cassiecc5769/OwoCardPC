import React from 'react';
import { CardConfigFilterState } from './types';

interface CardConfigFilterBarProps {
  filters: CardConfigFilterState;
  onFilterChange: (newFilters: Partial<CardConfigFilterState>) => void;
  onReset: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const CardConfigFilterBar: React.FC<CardConfigFilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3.5">
      {/* Filter Tabs & Sync Period */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-slate-100">
        <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs">
          <button
            type="button"
            onClick={() => onFilterChange({ tab: 'all' })}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              filters.tab === 'all'
                ? 'bg-white text-blue-600 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            全部 (42)
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ tab: 'active' })}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              filters.tab === 'active'
                ? 'bg-white text-blue-600 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            正常在收 (40)
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ tab: 'maintenance' })}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              filters.tab === 'maintenance'
                ? 'bg-white text-blue-600 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            维护停收 (2)
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ tab: 'high_risk' })}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              filters.tab === 'high_risk'
                ? 'bg-white text-blue-600 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            高风险/人工审 (6)
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <button
            type="button"
            onClick={onRefresh}
            title="刷新主数据缓存"
            className="hover:text-blue-600 cursor-pointer flex items-center gap-1"
          >
            <span
              className={`material-symbols-outlined text-[16px] text-slate-400 ${
                isRefreshing ? 'animate-spin text-blue-600' : ''
              }`}
            >
              sync
            </span>
            <span>
              主数据同步周期：<span className="font-medium text-slate-700">30秒轮询生效</span>
            </span>
          </button>
        </div>
      </div>

      {/* Search & Select Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Search input (col-span-2) */}
        <div className="lg:col-span-2 relative">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="搜索卡品牌 / SKU 编码 / 规则..."
            className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
          />
          <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-[17px] text-slate-400">
            search
          </span>
        </div>

        {/* Region */}
        <div>
          <select
            value={filters.region}
            onChange={(e) => onFilterChange({ region: e.target.value })}
            className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white cursor-pointer"
          >
            <option value="">发行国家/地区 (全部)</option>
            <option value="US">🇺🇸 美国 (US)</option>
            <option value="UK">🇬🇧 英国 (UK)</option>
            <option value="DE">🇩🇪 德国 (DE)</option>
            <option value="JP">🇯🇵 日本 (JP)</option>
            <option value="NG">🇳🇬 尼日利亚 (NG)</option>
            <option value="GLB">🌍 全球通用 (GLB)</option>
          </select>
        </div>

        {/* Currency */}
        <div>
          <select
            value={filters.currency}
            onChange={(e) => onFilterChange({ currency: e.target.value })}
            className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white cursor-pointer"
          >
            <option value="">结算币种 (全部)</option>
            <option value="USD">USD ($) 美元</option>
            <option value="GBP">GBP (£) 英镑</option>
            <option value="EUR">EUR (€) 欧元</option>
            <option value="NGN">NGN (₦) 奈拉</option>
            <option value="JPY">JPY (¥) 日元</option>
          </select>
        </div>

        {/* Model */}
        <div>
          <select
            value={filters.model}
            onChange={(e) => onFilterChange({ model: e.target.value })}
            className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white cursor-pointer"
          >
            <option value="">面值模型 (全部)</option>
            <option value="FIXED">固定面值阶梯</option>
            <option value="RANGE">范围浮动面值</option>
            <option value="BOTH">固定/范围混合</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={onReset}
            className="h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
          >
            重置
          </button>
          <button
            type="button"
            className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">filter_alt</span>
            <span>筛选</span>
          </button>
        </div>
      </div>
    </div>
  );
};
