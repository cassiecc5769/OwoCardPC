import React, { useState } from 'react';
import { NavPath } from '../types';
import {
  UserAnalyticsFilterState,
  UserMacroKpiData,
  CohortMatrixRow,
  MemberTierValueItem,
  ChannelLtvItem,
} from './analytics/user/types';
import {
  MOCK_USER_MACRO_KPI,
  MOCK_LIFECYCLE_FUNNEL_STEPS,
  MOCK_COHORT_MATRIX,
  MOCK_MEMBER_TIERS,
  MOCK_CHANNEL_LTV,
} from './analytics/user/mockData';
import { UserFilterBar } from './analytics/user/UserFilterBar';
import { UserKpiDeck } from './analytics/user/UserKpiDeck';
import { LifecycleFunnelSection } from './analytics/user/LifecycleFunnelSection';
import { CohortMatrixSection } from './analytics/user/CohortMatrixSection';
import { ExportCohortModal } from './analytics/user/ExportCohortModal';
import { ExportVipReportModal } from './analytics/user/ExportVipReportModal';
import { VipProtectionModal } from './analytics/user/VipProtectionModal';
import { ChannelDrilldownModal } from './analytics/user/ChannelDrilldownModal';
import { CohortDetailModal } from './analytics/user/CohortDetailModal';
import { CustomDateRangeModal } from './analytics/business-overview/CustomDateRangeModal';
import { UserMultiDimensionalReport } from './analytics/user/UserMultiDimensionalReport';
import { UserLifecycleOperationsDeck } from './analytics/user/UserLifecycleOperationsDeck';
import { UserDimensionalAnalyticsSection } from './analytics/user/UserDimensionalAnalyticsSection';
import { UserCustomerGroupDrilldownModal } from './analytics/user/UserCustomerGroupDrilldownModal';
import { UserMultiDimensionalRow, UserDimensionKey } from './analytics/user/userMultiDimensionalData';

interface UserAnalyticsViewProps {
  onNavigate?: (path: NavPath) => void;
}

export const UserAnalyticsView: React.FC<UserAnalyticsViewProps> = ({ onNavigate }) => {
  // 0. 视图模式 (看板模式 vs 多维报表模式)
  const [viewMode, setViewMode] = useState<'dashboard' | 'report'>('dashboard');
  const [reportInitialDimension, setReportInitialDimension] = useState<UserDimensionKey>('channel');

  // 1. 全局筛选状态 (时间尺度、渠道、等级、破冰状态、风控层级)
  const [filters, setFilters] = useState<UserAnalyticsFilterState>({
    timeRange: 'month',
    customStartDate: '2026-08-01',
    customEndDate: '2026-08-31',
    acquisitionChannel: '全部渠道 (All Sources)',
    userTier: '全部等级 (LV1 - LV5)',
    activationStatus: '全部状态',
    riskLevel: '白名单/标准无风险',
  });

  // 2. 模拟数据状态
  const [macroKpi, setMacroKpi] = useState<UserMacroKpiData>(MOCK_USER_MACRO_KPI);
  const [cohorts] = useState<CohortMatrixRow[]>(MOCK_COHORT_MATRIX);
  const [tiers] = useState<MemberTierValueItem[]>(MOCK_MEMBER_TIERS);
  const [channels] = useState<ChannelLtvItem[]>(MOCK_CHANNEL_LTV);

  // 3. 模态框与下钻状态
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [isExportCohortOpen, setIsExportCohortOpen] = useState(false);
  const [isExportVipOpen, setIsExportVipOpen] = useState(false);
  const [isVipProtectionOpen, setIsVipProtectionOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<ChannelLtvItem | null>(null);
  const [isChannelDrilldownOpen, setIsChannelDrilldownOpen] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<CohortMatrixRow | null>(null);
  const [selectedTier, setSelectedTier] = useState<MemberTierValueItem | null>(null);
  const [selectedDrilldownRow, setSelectedDrilldownRow] = useState<UserMultiDimensionalRow | null>(null);

  // 4. 刷新与操作提示反馈
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncTime, setSyncTime] = useState('2026-08-31 23:59:59');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // 切换筛选响应
  const handleFilterChange = (newFilters: Partial<UserAnalyticsFilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);

    // 动态调整指标微量系数，给用户明确的操作反馈
    let multiplier = 1.0;
    if (updated.timeRange === 'today') multiplier = 0.08;
    else if (updated.timeRange === '7d') multiplier = 0.28;
    else if (updated.timeRange === '90d') multiplier = 2.75;
    else if (updated.timeRange === '30d') multiplier = 1.02;

    if (updated.acquisitionChannel.includes('Telegram')) multiplier *= 0.6;
    else if (updated.acquisitionChannel.includes('TikTok')) multiplier *= 1.4;

    setMacroKpi({
      ...MOCK_USER_MACRO_KPI,
      totalUsers: Math.round(MOCK_USER_MACRO_KPI.totalUsers * (multiplier > 1.5 ? 1.0 : multiplier)),
      monthlyNewUsers: Math.max(120, Math.round(MOCK_USER_MACRO_KPI.monthlyNewUsers * (multiplier > 1.5 ? 1.0 : multiplier))),
      highValueVipCount: Math.max(80, Math.round(MOCK_USER_MACRO_KPI.highValueVipCount * (multiplier > 1.5 ? 1.0 : multiplier))),
    });

    showToast('筛选维度已刷新，实时生命周期与 Cohort 模型已重算！');
  };

  // 刷新计算
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      const now = new Date();
      const timeStr = `2026-08-31 ${now.toTimeString().split(' ')[0]}`;
      setSyncTime(timeStr);
      showToast('计算引擎已完成同步，全站 T+1 交易 Cohort 数据一致');
    }, 600);
  };

  // 自定义区间应用
  const handleApplyCustomDate = (start: string, end: string) => {
    setFilters((prev) => ({
      ...prev,
      timeRange: 'custom',
      customStartDate: start,
      customEndDate: end,
    }));
    showToast(`已应用自定义统计周期: ${start} ~ ${end}`);
  };

  // 获取当前筛选周期的显示标签
  const getTimeRangeLabel = () => {
    if (filters.timeRange === 'today') return '今日实时 (Today)';
    if (filters.timeRange === '7d') return '近7天 (Last 7 Days)';
    if (filters.timeRange === 'month') return '本月 (2026-08)';
    if (filters.timeRange === '30d') return '近30天 (Last 30 Days)';
    if (filters.timeRange === '90d') return '近90天 (Last 90 Days)';
    return `自定义区间 (${filters.customStartDate} ~ ${filters.customEndDate})`;
  };

  return (
    <div className="flex flex-col w-full space-y-4 text-slate-800 antialiased pb-10">
      {/* Toast 提示条 */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs border border-slate-700 animate-fadeIn">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 顶部统一业务标头 (Global Unified Header with Dashboard / Multi-Dimensional Switch) */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white px-5 py-3.5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              用户分析 (User Analytics)
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono text-[11px] font-semibold border border-blue-200/60">
              v2.0 全生命周期
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-mono text-[11px] font-semibold border border-emerald-200/60">
              Cohort 矩阵就绪
            </span>
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600">
              <span className="material-symbols-outlined text-[14px] text-blue-600">groups</span>
              <span>用户资产沉淀与分层运营 · 会员管理见</span>
              <button
                type="button"
                onClick={() => onNavigate?.('user-management')}
                className="text-blue-600 font-medium hover:underline inline-flex items-center gap-0.5 cursor-pointer ml-0.5"
              >
                出卡客户管理名册
                <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            实时追踪全生命周期获客漏斗、次月及长周期同期群留存衰减、高价值 VIP 资产分布与渠道 LTV
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* 模式切换控制器：看板 vs 多维报表 */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/80 h-9">
            <button
              type="button"
              onClick={() => {
                setViewMode('dashboard');
                showToast('已切换至用户分析看板模式');
              }}
              className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all text-xs cursor-pointer font-medium ${
                viewMode === 'dashboard'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">dashboard</span>
              <span>分析看板</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('report');
                showToast('已切换至用户多维报表模式');
              }}
              className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all text-xs cursor-pointer font-medium ${
                viewMode === 'report'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">table_chart</span>
              <span>多维报表</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsExportCohortOpen(true)}
            className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="导出 Cohort 留存模型表"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>导出报表</span>
          </button>
        </div>
      </header>

      {viewMode === 'report' ? (
        /* 多维报表模式 (完全按附件代码实现) */
        <UserMultiDimensionalReport
          onShowToast={showToast}
          onOpenExport={() => setIsExportCohortOpen(true)}
          initialDimension={reportInitialDimension}
        />
      ) : (
        /* 看板模式：结构化分层架构，杜绝重复统计卡片 */
        <>
          {/* 1. 顶部控制栏与全局多维筛选 (UserFilterBar) */}
          <UserFilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onOpenCustomDate={() => setIsCustomDateOpen(true)}
            onOpenExportCohort={() => setIsExportCohortOpen(true)}
            onOpenExportVip={() => setIsExportVipOpen(true)}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            syncTime={syncTime}
          />

          {/* 2. 顶层核心经营指标大盘 (5列高密度宏观指标，权威统一) */}
          <UserKpiDeck data={macroKpi} />

          {/* 3. 近7日指标时序走势与经营质效诊断 (图表化时序引擎 + 日切面解读联动) */}
          <UserLifecycleOperationsDeck
            onShowToast={showToast}
            onNavigateToReport={() => {
              setReportInitialDimension('date');
              setViewMode('report');
              showToast('已切换至日期时序多维报表');
            }}
          />

          {/* 4. 多维用户客群经营与深度画像透视 (7大分析维度：渠道/战队/等级/地域/分群/卡种/日期) */}
          <UserDimensionalAnalyticsSection
            onOpenDrilldown={(row) => setSelectedDrilldownRow(row)}
            onSwitchToReport={(dim) => {
              setReportInitialDimension(dim);
              setViewMode('report');
              showToast(`已携带【${dim}】维度跳转至多维报表`);
            }}
            onOpenProtectionPolicy={() => setIsVipProtectionOpen(true)}
            onOpenTierRules={(tierRow) => {
              const match = tiers.find((t) => t.tierId === tierRow?.id || t.tierName.includes(tierRow?.name || '')) || tiers[0];
              setSelectedTier(match);
            }}
            onOpenChannelLtv={(channelRow) => {
              const match = channels.find((c) => c.channelId === channelRow?.id || c.channelName.includes(channelRow?.name || '')) || channels[0];
              setSelectedChannel(match);
              setIsChannelDrilldownOpen(true);
            }}
            onShowToast={showToast}
          />

          {/* 5. 真实交易出卡同期群留存矩阵 (Transaction Cohort Matrix) */}
          <CohortMatrixSection
            cohorts={cohorts}
            onSelectCohort={(c) => setSelectedCohort(c)}
          />

          {/* 6. 用户全生命周期转化漏斗 (7阶段横向转化链路诊断) */}
          <LifecycleFunnelSection
            steps={MOCK_LIFECYCLE_FUNNEL_STEPS}
            onSelectStep={(step) => {
              showToast(`已定位转化链路节点：${step.stepCode} · ${step.stepName}`);
            }}
          />
        </>
      )}

      {/* 6. 快捷导航悬浮底栏 */}
      {onNavigate && (
        <div className="p-3.5 bg-white rounded-xl shadow-xs border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="material-symbols-outlined text-blue-600 text-[18px]">
              supervised_user_circle
            </span>
            <span>
              如需对具体用户个体进行封禁限制、信用等级评定或调额操作，请直接前往客户管理名册。
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('workbench')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
            >
              返回作业工作台
            </button>
            <button
              onClick={() => onNavigate('user-management')}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer shadow-xs flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">badge</span>
              <span>进入出卡客户管理名册</span>
            </button>
          </div>
        </div>
      )}

      {/* 7. 模态弹窗系统 */}
      {/* 自定义时间区间弹窗 */}
      <CustomDateRangeModal
        isOpen={isCustomDateOpen}
        onClose={() => setIsCustomDateOpen(false)}
        onApply={handleApplyCustomDate}
        initialStart={filters.customStartDate}
        initialEnd={filters.customEndDate}
      />

      {/* 导出 Cohort 留存模型表弹窗 */}
      <ExportCohortModal
        isOpen={isExportCohortOpen}
        onClose={() => setIsExportCohortOpen(false)}
        timeRangeLabel={getTimeRangeLabel()}
      />

      {/* 导出高价值大客流转报表弹窗 */}
      <ExportVipReportModal
        isOpen={isExportVipOpen}
        onClose={() => setIsExportVipOpen(false)}
      />

      {/* 配置分级保护策略弹窗 */}
      <VipProtectionModal
        isOpen={isVipProtectionOpen}
        onClose={() => setIsVipProtectionOpen(false)}
        onSavePolicy={() => {
          showToast('大客分级保护策略已成功保存并同步至撮合风控队列');
        }}
      />

      {/* 渠道深度留存下钻弹窗 */}
      <ChannelDrilldownModal
        isOpen={isChannelDrilldownOpen}
        onClose={() => setIsChannelDrilldownOpen(false)}
        channels={channels}
        initialChannelId={selectedChannel?.channelId}
      />

      {/* 单月 Cohort 批次画像明细弹窗 */}
      <CohortDetailModal
        isOpen={Boolean(selectedCohort)}
        onClose={() => setSelectedCohort(null)}
        cohort={selectedCohort}
      />

      {/* 重点客群交易穿透画像弹窗 (多维下钻透视) */}
      <UserCustomerGroupDrilldownModal
        isOpen={Boolean(selectedDrilldownRow)}
        onClose={() => setSelectedDrilldownRow(null)}
        row={selectedDrilldownRow}
        onShowToast={showToast}
      />

      {/* 会员等级准入与权益明细弹窗 (点击 LV1-LV5 柱条时展示) */}
      {selectedTier && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 w-full max-w-md overflow-hidden animate-fadeIn">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3.5 h-3.5 rounded-sm shrink-0"
                  style={{ backgroundColor: selectedTier.color }}
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {selectedTier.tierName} 画像准入规则
                  </h3>
                  <span className="text-[11px] text-slate-500 font-code-token">
                    {selectedTier.tierLevel} TIER PRIVILEGES
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTier(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">当前在册用户规模:</span>
                  <span className="font-bold text-slate-900 font-numeric-stat">
                    {selectedTier.userCount.toLocaleString()} 人 (占全站 {selectedTier.userSharePercent}%)
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">全站出卡 GMV 贡献:</span>
                  <span className="font-bold text-blue-700 font-numeric-stat">
                    {selectedTier.gmvSharePercent}% 全网交易量
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-semibold text-slate-900 block">自动晋升与评级门槛</span>
                <p className="text-slate-600 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {selectedTier.criteria}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="font-semibold text-slate-900 block">专属权益与防流失机制</span>
                <p className="text-slate-600 text-xs bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 text-blue-900">
                  {selectedTier.protectionPolicy}
                </p>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setSelectedTier(null)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium cursor-pointer shadow-xs"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
