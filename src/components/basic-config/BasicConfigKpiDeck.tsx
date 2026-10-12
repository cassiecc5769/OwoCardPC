import React from 'react';
import { BasicConfigTab } from './types';

interface BasicConfigKpiDeckProps {
  activeTab: BasicConfigTab;
  onSelectTab: (tab: BasicConfigTab) => void;
  reasonsCount: number;
  countriesCount: number;
  currenciesCount: number;
}

export const BasicConfigKpiDeck: React.FC<BasicConfigKpiDeckProps> = ({
  activeTab,
  onSelectTab,
  reasonsCount,
  countriesCount,
  currenciesCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
      {/* Card 1: Countries & Regions */}
      <div
        onClick={() => onSelectTab('countries')}
        className={`bg-white rounded-xl border p-4 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all cursor-pointer ${
          activeTab === 'countries' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[18px]">public</span>
            </div>
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              已纳管标准化国家/地区
            </span>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-100 text-emerald-700">
            100% 活跃
          </span>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-slate-900">{countriesCount}</span>
            <span className="text-xs text-slate-500">个国家与地区</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">ISO 3166-1 国际标准 · 覆盖 5 大洲收卡网络</p>
        </div>
        <div className="mt-3 pt-2 bg-slate-50/80 -mx-4 -mb-4 px-4 py-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>前置风控归属: 完整映射</span>
          <span className="text-emerald-600 font-semibold">OK ({countriesCount}/{countriesCount})</span>
        </div>
      </div>

      {/* Card 2: Currency Standards */}
      <div
        onClick={() => onSelectTab('currencies')}
        className={`bg-white rounded-xl border p-4 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all cursor-pointer ${
          activeTab === 'currencies' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[18px]">currency_exchange</span>
            </div>
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              法定与数字货币币种
            </span>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-blue-100 text-blue-700">
            双轨对齐
          </span>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-slate-900">{currenciesCount}</span>
            <span className="text-xs text-slate-500">种主流结算货币</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">ISO 4217 · 实时基准汇率毫秒级双轨对齐 (BOC/CMC)</p>
        </div>
        <div className="mt-3 pt-2 bg-slate-50/80 -mx-4 -mb-4 px-4 py-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>汇率波动触发阈值: 0.15%</span>
          <span className="text-blue-600 font-semibold">SYNCED</span>
        </div>
      </div>

      {/* Card 3: Business Reason Dictionary */}
      <div
        onClick={() => onSelectTab('reasons')}
        className={`bg-white rounded-xl border p-4 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all cursor-pointer ${
          activeTab === 'reasons' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <span className="material-symbols-outlined text-[18px]">rule</span>
            </div>
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              标准业务原因字典库
            </span>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-purple-100 text-purple-700">
            高频复用
          </span>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-slate-900">{reasonsCount}</span>
            <span className="text-xs text-slate-500">项故障与归因代码</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">涵盖 4 大核心领域 (交易失败/异常阻断/售后/调账)</p>
        </div>
        <div className="mt-3 pt-2 bg-slate-50/80 -mx-4 -mb-4 px-4 py-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>平均每日调用量: 48,290 次</span>
          <span className="text-purple-600 font-semibold">ACTIVE</span>
        </div>
      </div>

      {/* Card 4: Health & Zero Dirty References */}
      <div
        onClick={() => onSelectTab('runtime-params')}
        className={`bg-white rounded-xl border p-4 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all cursor-pointer ${
          activeTab === 'runtime-params' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
            </div>
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              字典引用健康度与安全红线
            </span>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-100 text-emerald-700">
            强一致性保护
          </span>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-emerald-600">0</span>
            <span className="text-xs text-slate-500">项脏数据引用</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">全系统业务强类型约束校验 · 严禁物理硬删除破坏对账</p>
        </div>
        <div className="mt-3 pt-2 bg-slate-50/80 -mx-4 -mb-4 px-4 py-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>外键引用完整性: 100%</span>
          <span className="text-emerald-600 font-semibold">SECURE</span>
        </div>
      </div>
    </div>
  );
};
