import React from 'react';
import { RuleLifecycleTab, TradingRuleItem, RuleTagColor } from './types';

interface TradingRulesTabGridProps {
  activeTab: RuleLifecycleTab;
  onTabChange: (tab: RuleLifecycleTab) => void;
  rules: TradingRuleItem[];
  scopeMode: 'all' | 'large_merchant' | 'retail' | 'api';
  onScopeModeChange: (mode: 'all' | 'large_merchant' | 'retail' | 'api') => void;
  onEditRule: (rule: TradingRuleItem) => void;
}

export const TradingRulesTabGrid: React.FC<TradingRulesTabGridProps> = ({
  activeTab,
  onTabChange,
  rules,
  scopeMode,
  onScopeModeChange,
  onEditRule,
}) => {
  // Count rules per tab
  const getTabCount = (tab: RuleLifecycleTab) => rules.filter((r) => r.tab === tab).length;

  const currentTabRules = rules.filter((r) => {
    if (r.tab !== activeTab) return false;
    if (scopeMode !== 'all' && r.scopeMode !== 'all' && r.scopeMode !== scopeMode) return false;
    return true;
  });

  const getTagBadgeClass = (color: RuleTagColor) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'blue':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'rose':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'amber':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'slate':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Tab Filter Control Bar - Standard Image Tab Bar Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-2 pt-2 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'order', label: '下单规则', badge: `${getTabCount('order')} 项生效`, icon: 'shopping_cart' },
            { id: 'dispatch', label: '接单规则', badge: `${getTabCount('dispatch')} 项`, icon: 'assignment_turned_in' },
            { id: 'operation', label: '作业规则', badge: `${getTabCount('operation')} 项`, icon: 'fact_check' },
            { id: 'timeout', label: '超时规则', badge: `${getTabCount('timeout')} 项`, icon: 'timer_off' },
            { id: 'dispute', label: '售后规则', badge: `${getTabCount('dispute')} 项`, icon: 'gavel' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id as RuleLifecycleTab)}
                className={`px-5 py-3 font-bold rounded-t-lg transition-colors shrink-0 flex items-center gap-2 relative cursor-pointer text-xs sm:text-sm ${
                  isActive
                    ? 'text-[#004ac6] bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#004ac6]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono transition-colors ${
                    isActive ? 'bg-blue-100 text-[#004ac6] font-semibold' : 'bg-slate-100 text-slate-600 font-medium'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Scope selector filter */}
        <div className="flex items-center gap-2 px-3 self-end sm:self-auto shrink-0">
          <span className="text-xs text-slate-500 font-medium">过滤策略模式:</span>
          <select
            value={scopeMode}
            onChange={(e) =>
              onScopeModeChange(e.target.value as 'all' | 'large_merchant' | 'retail' | 'api')
            }
            className="h-8 px-2.5 bg-slate-50 text-slate-800 text-xs rounded-lg border border-slate-200 focus:ring-1 focus:ring-blue-600 focus:outline-none cursor-pointer"
          >
            <option value="all">全部出卡类型 (实体/电子/直充)</option>
            <option value="large_merchant">大宗卡商通道</option>
            <option value="retail">C端散户通道</option>
            <option value="api">API 直连通道</option>
          </select>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {currentTabRules.map((rule) => (
          <div
            key={rule.id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div>
              {/* Header tags */}
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-600">{rule.id}</span>
                  <span
                    className={`text-[11px] font-medium border px-2 py-0.5 rounded-full ${getTagBadgeClass(
                      rule.tagColor
                    )}`}
                  >
                    {rule.tag}
                  </span>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-[20px]">
                  {rule.icon}
                </span>
              </div>

              {/* Title & description */}
              <h2 className="text-sm font-bold text-slate-900 mt-1">{rule.name}</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed min-h-[36px]">
                {rule.desc}
              </p>

              {/* Metrics parameters box */}
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    当前生效阈值
                  </div>
                  <div className="font-mono text-xl font-bold text-slate-900 mt-0.5">
                    {rule.thresholdValue}{' '}
                    <span className="text-xs font-normal text-slate-500 font-sans">
                      {rule.thresholdUnit}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    {rule.secondaryLabel}
                  </div>
                  <div
                    className={`font-mono text-sm font-bold mt-0.5 ${
                      rule.secondaryColor || 'text-slate-800'
                    }`}
                  >
                    {rule.secondaryValue}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom modifier & action */}
            <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-100">
              <span className="text-[11px] font-mono text-slate-400">
                最后修改: {rule.lastModified} by {rule.modifiedBy}
              </span>
              <button
                type="button"
                onClick={() => onEditRule(rule)}
                className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-700 cursor-pointer"
              >
                <span>调整阈值</span>
                <span className="material-symbols-outlined text-[15px]">tune</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
