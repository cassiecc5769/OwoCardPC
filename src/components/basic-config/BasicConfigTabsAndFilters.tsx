import React from 'react';
import { BasicConfigTab, ReasonDomain } from './types';

interface BasicConfigTabsAndFiltersProps {
  activeTab: BasicConfigTab;
  onTabChange: (tab: BasicConfigTab) => void;
  reasonsCount: number;
  countriesCount: number;
  currenciesCount: number;
  // Reason filters
  reasonSearch: string;
  onReasonSearchChange: (val: string) => void;
  selectedDomain: ReasonDomain;
  onDomainChange: (domain: ReasonDomain) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onResetFilters: () => void;
  onTriggerSearch: () => void;
}

export const BasicConfigTabsAndFilters: React.FC<BasicConfigTabsAndFiltersProps> = ({
  activeTab,
  onTabChange,
  reasonsCount,
  countriesCount,
  currenciesCount,
  reasonSearch,
  onReasonSearchChange,
  selectedDomain,
  onDomainChange,
  statusFilter,
  onStatusFilterChange,
  onResetFilters,
  onTriggerSearch,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs mb-5 space-y-3 overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-200 px-4 pt-1 gap-2 overflow-x-auto">
        <div className="flex items-center gap-1 flex-wrap">
          {[
            {
              id: 'reasons',
              label: '标准业务原因代码库 (Business Reason Dictionary)',
              icon: 'menu_book',
              badge: `${reasonsCount}项`,
              badgeClass: 'bg-blue-100 text-blue-800'
            },
            {
              id: 'countries',
              label: '国家与地区标准 (Countries & Regions)',
              icon: 'flag',
              badge: `${countriesCount}国`,
              badgeClass: 'bg-purple-100 text-purple-800'
            },
            {
              id: 'currencies',
              label: '国际货币与精度 (Currency Standards)',
              icon: 'attach_money',
              badge: `${currenciesCount}币种`,
              badgeClass: 'bg-emerald-100 text-emerald-800'
            },
            {
              id: 'runtime-params',
              label: '平台运行与安全参数 (Runtime & Security)',
              icon: 'tune',
              badge: '4模块',
              badgeClass: 'bg-amber-100 text-amber-800'
            }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as BasicConfigTab)}
                className={`px-4 py-3 font-bold rounded-t-lg transition-colors shrink-0 flex items-center gap-2 relative cursor-pointer text-xs ${
                  isActive
                    ? 'text-[#004ac6] bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#004ac6]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive ? 'bg-blue-100 text-blue-800' : tab.badgeClass
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400 self-center pr-3">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>SCHEMA: DIC_V2_PROD</span>
        </div>
      </div>

      <div className="p-3.5 pt-0">

      {/* Filter Fields (adapted per tab) */}
      {activeTab === 'reasons' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center pt-0.5">
          <div className="md:col-span-4 relative">
            <input
              value={reasonSearch}
              onChange={(e) => onReasonSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onTriggerSearch()}
              className="w-full h-9 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="输入原因编码 (F-xxx) / 中文名称 / 关键字..."
              type="text"
            />
            <span className="material-symbols-outlined text-[16px] text-slate-400 absolute left-2.5 top-2.5">
              search
            </span>
            {reasonSearch && (
              <button
                onClick={() => onReasonSearchChange('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>

          <div className="md:col-span-4 flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/60">
            <button
              onClick={() => onDomainChange('ALL')}
              className={`flex-1 py-1 text-[11px] font-medium rounded text-center transition-colors cursor-pointer ${
                selectedDomain === 'ALL'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              type="button"
            >
              全部
            </button>
            <button
              onClick={() => onDomainChange('F')}
              className={`flex-1 py-1 text-[11px] font-medium rounded text-center transition-colors cursor-pointer ${
                selectedDomain === 'F'
                  ? 'bg-white text-rose-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              type="button"
            >
              交易失败[F]
            </button>
            <button
              onClick={() => onDomainChange('A')}
              className={`flex-1 py-1 text-[11px] font-medium rounded text-center transition-colors cursor-pointer ${
                selectedDomain === 'A'
                  ? 'bg-white text-amber-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              type="button"
            >
              异常阻断[A]
            </button>
            <button
              onClick={() => onDomainChange('D')}
              className={`flex-1 py-1 text-[11px] font-medium rounded text-center transition-colors cursor-pointer ${
                selectedDomain === 'D'
                  ? 'bg-white text-purple-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              type="button"
            >
              售后争议[D]
            </button>
            <button
              onClick={() => onDomainChange('ADJ')}
              className={`flex-1 py-1 text-[11px] font-medium rounded text-center transition-colors cursor-pointer ${
                selectedDomain === 'ADJ'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              type="button"
            >
              财务调账[ADJ]
            </button>
          </div>

          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="w-full h-9 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
            >
              <option value="all">状态: 全部状态</option>
              <option value="active">状态: 生效中 (Active)</option>
              <option value="disabled">状态: 已停用 (Disabled)</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-center gap-1.5 justify-end">
            <button
              onClick={onTriggerSearch}
              className="px-3 h-9 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">filter_list</span>
              <span>筛选查询</span>
            </button>
            <button
              onClick={onResetFilters}
              className="px-2.5 h-9 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
              type="button"
            >
              重置
            </button>
          </div>
        </div>
      )}

      {activeTab === 'countries' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center pt-0.5">
          <div className="md:col-span-5 relative">
            <input
              value={reasonSearch}
              onChange={(e) => onReasonSearchChange(e.target.value)}
              className="w-full h-9 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="搜索国家名称 / ISO代码 (US, NGA) / 电话区号 (+234)..."
              type="text"
            />
            <span className="material-symbols-outlined text-[16px] text-slate-400 absolute left-2.5 top-2.5">
              search
            </span>
          </div>

          <div className="md:col-span-4 flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="w-full h-9 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
            >
              <option value="all">大洲区域: 全部大洲</option>
              <option value="西非">区域: 西非 (West Africa)</option>
              <option value="北美洲">区域: 北美洲 (North America)</option>
              <option value="欧洲">区域: 欧洲 (Europe)</option>
              <option value="东非">区域: 东非 (East Africa)</option>
              <option value="东亚">区域: 东亚 (East Asia)</option>
              <option value="大洋洲">区域: 大洋洲 (Oceania)</option>
            </select>
          </div>

          <div className="md:col-span-3 flex items-center gap-1.5 justify-end">
            <button
              onClick={onResetFilters}
              className="px-2.5 h-9 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
              type="button"
            >
              重置筛选
            </button>
          </div>
        </div>
      )}

      {activeTab === 'currencies' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center pt-0.5">
          <div className="md:col-span-5 relative">
            <input
              value={reasonSearch}
              onChange={(e) => onReasonSearchChange(e.target.value)}
              className="w-full h-9 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="搜索国际货币代码 (USD, USDT, NGN) / 符号 / 牌价源..."
              type="text"
            />
            <span className="material-symbols-outlined text-[16px] text-slate-400 absolute left-2.5 top-2.5">
              search
            </span>
          </div>

          <div className="md:col-span-4 flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="w-full h-9 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
            >
              <option value="all">币种类型: 全部类型</option>
              <option value="FIAT">类型: 法定结算货币 (Fiat)</option>
              <option value="CRYPTO">类型: 链上稳定币 (Crypto / USDT)</option>
            </select>
          </div>

          <div className="md:col-span-3 flex items-center gap-1.5 justify-end">
            <button
              onClick={onResetFilters}
              className="px-2.5 h-9 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
              type="button"
            >
              重置筛选
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
