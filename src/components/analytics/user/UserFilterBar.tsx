import React from 'react';
import { UserAnalyticsFilterState, UserTimeRangeKey } from './types';

interface UserFilterBarProps {
  filters: UserAnalyticsFilterState;
  onFilterChange: (newFilters: Partial<UserAnalyticsFilterState>) => void;
  onOpenCustomDate: () => void;
  onOpenExportCohort: () => void;
  onOpenExportVip: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  syncTime: string;
}

export const UserFilterBar: React.FC<UserFilterBarProps> = ({
  filters,
  onFilterChange,
  onOpenCustomDate,
  onOpenExportCohort,
  onOpenExportVip,
  onRefresh,
  isRefreshing,
  syncTime,
}) => {
  const handleTimeRangeClick = (range: UserTimeRangeKey) => {
    if (range === 'custom') {
      onOpenCustomDate();
    } else {
      onFilterChange({ timeRange: range });
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4 flex flex-col gap-3.5">
      {/* 顶部功能头区与参数操作按键 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-6 bg-blue-600 rounded-xs shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                用户全生命周期与客群决策看板
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
              LIFECYCLE CONVERSION, COHORT RETENTION &amp; MULTI-DIMENSIONAL USER VALUE
            </p>
          </div>
        </div>

        {/* 快捷导出操作组 */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onOpenExportCohort}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-all border border-slate-200 cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px] text-blue-600">download</span>
            <span>导出 Cohort 留存表</span>
          </button>
          <button
            type="button"
            onClick={onOpenExportVip}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">stacked_line_chart</span>
            <span>导出高价值大客报表</span>
          </button>
        </div>
      </div>

      {/* 细分筛选维度带与引擎状态 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 时间尺度切换按键 */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 text-xs">
            <button
              type="button"
              onClick={() => handleTimeRangeClick('today')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                filters.timeRange === 'today'
                  ? 'bg-white text-blue-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              今日实时
            </button>
            <button
              type="button"
              onClick={() => handleTimeRangeClick('7d')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                filters.timeRange === '7d'
                  ? 'bg-white text-blue-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              近7天
            </button>
            <button
              type="button"
              onClick={() => handleTimeRangeClick('month')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                filters.timeRange === 'month'
                  ? 'bg-white text-blue-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              本月 (2026-08)
            </button>
            <button
              type="button"
              onClick={() => handleTimeRangeClick('30d')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                filters.timeRange === '30d'
                  ? 'bg-white text-blue-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              近30天
            </button>
            <button
              type="button"
              onClick={() => handleTimeRangeClick('90d')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                filters.timeRange === '90d'
                  ? 'bg-white text-blue-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              近90天
            </button>
            <button
              type="button"
              onClick={() => handleTimeRangeClick('custom')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                filters.timeRange === 'custom'
                  ? 'bg-white text-blue-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">event</span>
              <span>
                {filters.timeRange === 'custom'
                  ? `${filters.customStartDate} ~ ${filters.customEndDate}`
                  : '自定义'}
              </span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200" />

          {/* 获客渠道下拉 */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">
              获客渠道:
            </span>
            <select
              value={filters.acquisitionChannel}
              onChange={(e) => onFilterChange({ acquisitionChannel: e.target.value })}
              className="bg-transparent text-xs text-slate-800 focus:outline-none cursor-pointer font-medium"
            >
              <option>全部渠道 (All Sources)</option>
              <option>社媒投放 (TikTok/FB)</option>
              <option>推广人带人 (Referral)</option>
              <option>地推档口 (Offline OTC)</option>
              <option>WhatsApp 私域</option>
              <option>Telegram 做市商群</option>
            </select>
          </div>

          {/* 用户等级下拉 */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">
              用户等级:
            </span>
            <select
              value={filters.userTier}
              onChange={(e) => onFilterChange({ userTier: e.target.value })}
              className="bg-transparent text-xs text-slate-800 focus:outline-none cursor-pointer font-medium"
            >
              <option>全部等级 (LV1 - LV5)</option>
              <option>LV1 探索玩家</option>
              <option>LV2 诚信出卡户</option>
              <option>LV3 黄金做市商</option>
              <option>LV4 钻石机构</option>
              <option>LV5 殿堂核心大客</option>
            </select>
          </div>

          {/* 首单破冰状态下拉 */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">
              首单破冰:
            </span>
            <select
              value={filters.activationStatus}
              onChange={(e) => onFilterChange({ activationStatus: e.target.value })}
              className="bg-transparent text-xs text-slate-800 focus:outline-none cursor-pointer font-medium"
            >
              <option>全部状态</option>
              <option>已破冰 (已核销首单)</option>
              <option>未破冰 (注册未核销)</option>
              <option>核销失败流失</option>
            </select>
          </div>

          {/* 风控层级下拉 */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">
              风控层级:
            </span>
            <select
              value={filters.riskLevel}
              onChange={(e) => onFilterChange({ riskLevel: e.target.value })}
              className="bg-transparent text-xs text-slate-800 focus:outline-none cursor-pointer font-medium"
            >
              <option>白名单/标准无风险</option>
              <option>中风险审视中 (Hold)</option>
              <option>黑名单/灰产冻结 (Blocked)</option>
            </select>
          </div>
        </div>

        {/* 状态快照与刷新时间戳 */}
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-600" />
            <span>口径对齐: T+1 结算完成用户 | 币种: USD (7.10)</span>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1 text-slate-600 hover:text-blue-600 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/60 bg-slate-50"
            title="刷新数据"
          >
            <span className={`material-symbols-outlined text-[15px] ${isRefreshing ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>{syncTime}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
