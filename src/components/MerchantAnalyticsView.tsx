import React, { useState } from 'react';
import { NavPath } from '../types';
import {
  MerchantFilterState,
  MerchantMacroKpi,
  DemandCapacityRow,
  HhiConcentrationData,
  MerchantPerformanceRow,
} from './analytics/merchant/types';
import {
  MOCK_MERCHANT_MACRO_KPI,
  MOCK_DEMAND_CAPACITY_ROWS,
  MOCK_HHI_CONCENTRATION,
  MOCK_MERCHANT_PERFORMANCE_LIST,
} from './analytics/merchant/mockData';
import { MerchantFilterBar } from './analytics/merchant/MerchantFilterBar';
import { MerchantKpiDeck } from './analytics/merchant/MerchantKpiDeck';
import { MerchantTrendDeck } from './analytics/merchant/MerchantTrendDeck';
import { DemandCapacityMatrix } from './analytics/merchant/DemandCapacityMatrix';
import { ConcentrationRiskRadar } from './analytics/merchant/ConcentrationRiskRadar';
import { DispatchConfigModal } from './analytics/merchant/DispatchConfigModal';
import { ExportMerchantReportModal } from './analytics/merchant/ExportMerchantReportModal';
import { MerchantProfileModal } from './analytics/merchant/MerchantProfileModal';
import { AdjustQuotaModal } from './analytics/merchant/AdjustQuotaModal';
import { DemandActionModal } from './analytics/merchant/DemandActionModal';
import { CustomDateRangeModal } from './analytics/business-overview/CustomDateRangeModal';
import { MerchantMultiDimensionalReport } from './analytics/merchant/MerchantMultiDimensionalReport';
import { MerchantDimensionalAnalyticsSection } from './analytics/merchant/MerchantDimensionalAnalyticsSection';
import { MerchantDrilldownOrdersModal } from './analytics/merchant/MerchantDrilldownOrdersModal';
import { MerchantMultiDimensionalRow, MerchantDimensionKey } from './analytics/merchant/merchantMultiDimensionalData';

interface MerchantAnalyticsViewProps {
  onNavigate?: (path: NavPath) => void;
}

export const MerchantAnalyticsView: React.FC<MerchantAnalyticsViewProps> = ({ onNavigate }) => {
  // 视图模式切换：'dashboard' (分析看板) 或 'report' (多维报表)
  const [viewMode, setViewMode] = useState<'dashboard' | 'report'>('dashboard');
  const [reportInitialDimension, setReportInitialDimension] = useState<MerchantDimensionKey>('merchant');

  // 1. 全局筛选状态 (卡品牌、商户分层、做卡模式、区域、时间区间)
  const [filters, setFilters] = useState<MerchantFilterState>({
    cardBrand: '全部卡种 (All Brands)',
    tier: '全部层级 (All Tiers)',
    fulfillmentMode: '全部模式',
    region: '全球全区 (Global)',
    search: '',
    timeRange: 'today',
    customStartDate: '2026-08-01',
    customEndDate: '2026-08-31',
  });

  // 2. 模拟数据状态
  const [macroKpi, setMacroKpi] = useState<MerchantMacroKpi>(MOCK_MERCHANT_MACRO_KPI);
  const [demandRows] = useState<DemandCapacityRow[]>(MOCK_DEMAND_CAPACITY_ROWS);
  const [hhiData, setHhiData] = useState<HhiConcentrationData>(MOCK_HHI_CONCENTRATION);
  const [merchants, setMerchants] = useState<MerchantPerformanceRow[]>(MOCK_MERCHANT_PERFORMANCE_LIST);

  // 3. 模态窗控制状态
  const [isDispatchConfigOpen, setIsDispatchConfigOpen] = useState(false);
  const [isExportReportOpen, setIsExportReportOpen] = useState(false);
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [selectedProfileMerchant, setSelectedProfileMerchant] = useState<MerchantPerformanceRow | null>(null);
  const [selectedAdjustMerchant, setSelectedAdjustMerchant] = useState<MerchantPerformanceRow | null>(null);
  const [selectedDemandRow, setSelectedDemandRow] = useState<DemandCapacityRow | null>(null);
  const [selectedDrilldownRow, setSelectedDrilldownRow] = useState<MerchantMultiDimensionalRow | null>(null);

  // 4. 刷新与操作提示反馈
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncTime, setSyncTime] = useState('实时更新 1s');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // 响应筛选改变
  const handleFilterChange = (newFilters: Partial<MerchantFilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);

    // 动态调整指标微量系数，给用户明确的操作反馈
    let multiplier = 1.0;
    if (updated.timeRange === 'yesterday') multiplier = 0.94;
    else if (updated.timeRange === '7d') multiplier = 6.4;
    else if (updated.timeRange === 'month') multiplier = 26.8;

    if (updated.tier.includes('Tier-S')) multiplier *= 0.72;
    else if (updated.cardBrand.includes('Apple')) multiplier *= 0.55;

    setMacroKpi({
      ...MOCK_MERCHANT_MACRO_KPI,
      todayFulfilledGmvUsd: Math.round(MOCK_MERCHANT_MACRO_KPI.todayFulfilledGmvUsd * (multiplier > 3 ? 1.0 : multiplier)),
      completedOrdersCount: Math.round(MOCK_MERCHANT_MACRO_KPI.completedOrdersCount * (multiplier > 3 ? 1.0 : multiplier)),
    });

    showToast('商户承揽与供需矩阵已根据最新筛选重新计算');
  };

  // 刷新计算
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      const now = new Date();
      setSyncTime(`${now.toTimeString().split(' ')[0]}`);
      showToast('已同步全网142家商户坐席在线心跳与最新质押金池');
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

  // 切换限流规则
  const handleToggleThrottle = () => {
    setHhiData((prev) => {
      const nextVal = !prev.autoThrottleOn;
      showToast(nextVal ? '防爆仓限流规则已启用 (AUTO-THROTTLE: ON)' : '防爆仓限流规则已暂停 (AUTO-THROTTLE: OFF)');
      return { ...prev, autoThrottleOn: nextVal };
    });
  };

  // 保存调度配置
  const handleSaveDispatchConfig = (config: {
    spreadBoostPercent: number;
    top1RedlinePercent: number;
    backupDivertPercent: number;
    priorityMode: string;
    autoThrottle: boolean;
  }) => {
    setHhiData((prev) => ({
      ...prev,
      top1Redline: config.top1RedlinePercent,
      backupDivertPercent: config.backupDivertPercent,
      autoThrottleOn: config.autoThrottle,
    }));
    showToast(`调度引擎参数已更新：缺口加成+${config.spreadBoostPercent}%，熔断线${config.top1RedlinePercent}%`);
  };

  // 保存调额
  const handleSaveQuota = (merchantId: string, newQuota: number) => {
    setMerchants((prev) =>
      prev.map((m) => (m.merchantId === merchantId ? { ...m, creditLimitDailyUsd: newQuota } : m))
    );
    showToast(`商户 ${merchantId} 承揽授信额度已调至 $${newQuota.toLocaleString()} USD`);
  };

  // 执行供需调度单项
  const handleExecuteDemandAction = (actionText: string, amount?: number) => {
    if (amount) {
      showToast(`已成功为该卡种紧急注入 $${amount.toLocaleString()} USD 备用承揽授信`);
    } else {
      showToast(`已成功对该卡种发起 [${actionText}] 调度指令，系统自动完成撮合倾斜`);
    }
  };

  // 打开商户档案画像弹窗
  const handleOpenMerchantProfile = (merchantId: string, merchantName: string) => {
    const found = merchants.find((m) => m.merchantId === merchantId || m.merchantName.includes(merchantName));
    if (found) {
      setSelectedProfileMerchant(found);
    } else {
      setSelectedProfileMerchant(merchants[0]);
    }
  };

  // 打开商户调额弹窗
  const handleOpenAdjustQuota = (merchantId: string, merchantName: string, currentLimit: number) => {
    const found = merchants.find((m) => m.merchantId === merchantId || m.merchantName.includes(merchantName));
    if (found) {
      setSelectedAdjustMerchant(found);
    } else {
      setSelectedAdjustMerchant({
        ...merchants[0],
        merchantId,
        merchantName,
        creditLimitDailyUsd: currentLimit || 150000,
      });
    }
  };

  // 时间显示文案
  const getTimeRangeLabel = () => {
    if (filters.timeRange === 'today') return '今日实时 (Today)';
    if (filters.timeRange === 'yesterday') return '昨日 (Yesterday)';
    if (filters.timeRange === '7d') return '近7天 (Last 7 Days)';
    if (filters.timeRange === 'month') return '本月 (Current Month)';
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

      {/* 顶部统一业务标头 (Global Unified Header with Dashboard / Report Toggle) */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white px-5 py-3.5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              商户分析 (Merchant Analytics)
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono text-[11px] font-semibold border border-blue-200/60">
              Merchant SLA &amp; Capacity Hub
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-mono text-[11px] font-semibold border border-emerald-200/60">
              Fulfill-Flow v2.8 实时就绪
            </span>
            {onNavigate && (
              <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600">
                <span className="material-symbols-outlined text-[14px] text-blue-600">storefront</span>
                <span>商户准入与签约费率阶梯见</span>
                <button
                  type="button"
                  onClick={() => onNavigate('merchant-management')}
                  className="text-blue-600 font-medium hover:underline inline-flex items-center gap-0.5 cursor-pointer ml-0.5"
                >
                  收卡商户管理档案
                  <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            监控全域入驻承兑商承揽容量水位、核销 SLA 时效表现、异常卡单申诉率与商户画像健康度
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* 看板与数据报表切换控制器 */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/80 h-9">
            <button
              onClick={() => {
                setViewMode('dashboard');
                showToast('已切换至商户分析看板');
              }}
              className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all text-xs cursor-pointer font-medium ${
                viewMode === 'dashboard'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">dashboard</span>
              <span>分析看板</span>
            </button>
            <button
              onClick={() => {
                setViewMode('report');
                showToast('已切换至商户多维报表');
              }}
              className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all text-xs cursor-pointer font-medium ${
                viewMode === 'report'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">table_chart</span>
              <span>多维报表</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsExportReportOpen(true)}
            className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="导出商户履约报表"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>导出报表</span>
          </button>
        </div>
      </header>

      {viewMode === 'report' ? (
        /* 多维报表模式 */
        <MerchantMultiDimensionalReport
          onShowToast={showToast}
          onOpenExport={() => setIsExportReportOpen(true)}
          onOpenProfile={(m) => setSelectedProfileMerchant(m)}
          initialDimension={reportInitialDimension}
        />
      ) : (
        /* 分析看板模式：结构化分层架构，杜绝重复统计与双重标头 */
        <>
          {/* 1. 顶部统一筛选工作条 (MerchantFilterBar) */}
          <MerchantFilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onOpenDispatchConfig={() => setIsDispatchConfigOpen(true)}
            onOpenExportReport={() => setIsExportReportOpen(true)}
            onOpenCustomDate={() => setIsCustomDateOpen(true)}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            syncTime={syncTime}
          />

          {/* 2. 顶层权威大盘指标 (5列高密度宏观指标，彻底统一) */}
          <MerchantKpiDeck data={macroKpi} />

          {/* 3. 近7日商户承揽与SLA履约时效时序走势 (图表化时序引擎 + 日切面解读联动) */}
          <MerchantTrendDeck
            onShowToast={showToast}
            onNavigateToReport={() => {
              setReportInitialDimension('date');
              setViewMode('report');
              showToast('已切换至日期维度多维报表');
            }}
          />

          {/* 4. 多维承揽效能与分布全景 (6大核心切片维度 + 3大可视化模式 + 深度透视) */}
          <MerchantDimensionalAnalyticsSection
            onOpenDrilldown={(row) => setSelectedDrilldownRow(row)}
            onSwitchToReport={(dim) => {
              setReportInitialDimension(dim);
              setViewMode('report');
              showToast(`已切换至【${dim}】多维报表明细视图`);
            }}
            onOpenDispatchConfig={() => setIsDispatchConfigOpen(true)}
            onShowToast={showToast}
            onOpenProfile={handleOpenMerchantProfile}
            onOpenAdjustQuota={handleOpenAdjustQuota}
          />

          {/* 5. 供需平衡分析矩阵 (Demand vs Capacity Matrix - 动态测算在途流水峰值与可用承揽额度) */}
          <DemandCapacityMatrix
            rows={demandRows}
            onExecuteAction={(row) => setSelectedDemandRow(row)}
          />

          {/* 6. 供给集中度风险雷达与防爆仓自动防御策略 (HHI & Anti-Fragile Mitigation) */}
          <ConcentrationRiskRadar
            data={hhiData}
            onToggleThrottle={handleToggleThrottle}
            onOpenDispatchConfig={() => setIsDispatchConfigOpen(true)}
          />
        </>
      )}

      {/* 7. 快捷导航协同底栏 */}
      {onNavigate && (
        <div className="p-3.5 bg-white rounded-xl shadow-xs border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="material-symbols-outlined text-blue-600 text-[18px]">
              storefront
            </span>
            <span>
              如需对具体做卡商户进行准入开户、签约费率阶梯制定或保证金增补，请前往商户档案管理端。
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
              onClick={() => onNavigate('merchant-management')}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer shadow-xs flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">store</span>
              <span>进入收卡商户管理端</span>
            </button>
          </div>
        </div>
      )}

      {/* 8. 底部系统声明条 */}
      <footer className="py-2 flex flex-wrap items-center justify-between font-mono text-[11px] text-slate-400 border-t border-slate-100">
        <span>CARD-OPS-CORE-ENGINE // CAPACITY-AND-RISK-MODULE v2.0-PROD</span>
        <div className="flex items-center gap-4">
          <span>安全仲裁链路: NORMAL</span>
          <span>风控配额轮巡周期: 30s</span>
          <span>数据节点: TOKYO-DC-02</span>
        </div>
      </footer>

      {/* 9. 模态框体系 */}
      {/* 供需调度与熔断规则配置 */}
      <DispatchConfigModal
        isOpen={isDispatchConfigOpen}
        onClose={() => setIsDispatchConfigOpen(false)}
        onSave={handleSaveDispatchConfig}
      />

      {/* 导出商户履约效能报表 */}
      <ExportMerchantReportModal
        isOpen={isExportReportOpen}
        onClose={() => setIsExportReportOpen(false)}
        timeRangeLabel={getTimeRangeLabel()}
      />

      {/* 自定义时间区间弹窗 */}
      <CustomDateRangeModal
        isOpen={isCustomDateOpen}
        onClose={() => setIsCustomDateOpen(false)}
        onApply={handleApplyCustomDate}
        initialStart={filters.customStartDate}
        initialEnd={filters.customEndDate}
      />

      {/* 商户履约全景档案画像 */}
      <MerchantProfileModal
        isOpen={Boolean(selectedProfileMerchant)}
        onClose={() => setSelectedProfileMerchant(null)}
        merchant={selectedProfileMerchant}
        onAdjustQuota={(m) => {
          setSelectedProfileMerchant(null);
          setSelectedAdjustMerchant(m);
        }}
      />

      {/* 商户调配额与风控授信设置 */}
      <AdjustQuotaModal
        isOpen={Boolean(selectedAdjustMerchant)}
        onClose={() => setSelectedAdjustMerchant(null)}
        merchant={selectedAdjustMerchant}
        onSave={handleSaveQuota}
      />

      {/* 供需单项调度 / 提额补水 / 席位扩容 */}
      <DemandActionModal
        isOpen={Boolean(selectedDemandRow)}
        onClose={() => setSelectedDemandRow(null)}
        row={selectedDemandRow}
        onConfirm={handleExecuteDemandAction}
      />

      {/* 商户承揽卡单流水穿透弹窗 */}
      <MerchantDrilldownOrdersModal
        isOpen={Boolean(selectedDrilldownRow)}
        onClose={() => setSelectedDrilldownRow(null)}
        row={selectedDrilldownRow}
        onShowToast={showToast}
      />
    </div>
  );
};
