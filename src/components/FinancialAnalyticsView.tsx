import React, { useState, useMemo } from 'react';
import { NavPath } from '../types';
import {
  FinancialFilterState,
  ExecutivePnLStats,
  WaterfallStep,
  CardSkuProfitabilityRow,
  MarginEvolutionPoint,
} from './analytics/financial/types';
import {
  BASE_EXECUTIVE_PNL,
  BASE_WATERFALL_STEPS,
  MOCK_CARD_PROFITABILITY_ROWS,
  MOCK_MARGIN_EVOLUTION_TREND,
} from './analytics/financial/mockData';
import { FinancialFilterBar } from './analytics/financial/FinancialFilterBar';
import { ExecutivePnLDeck } from './analytics/financial/ExecutivePnLDeck';
import { UnitEconomicsWaterfall } from './analytics/financial/UnitEconomicsWaterfall';
import { CardProfitabilityTable } from './analytics/financial/CardProfitabilityTable';
import { MarginTrendSensitivity } from './analytics/financial/MarginTrendSensitivity';
import { ExportPnLModal } from './analytics/financial/ExportPnLModal';
import { RateControlModal } from './analytics/financial/RateControlModal';
import { RiskRestrictionModal } from './analytics/financial/RiskRestrictionModal';
import { MarginSimulationModal } from './analytics/financial/MarginSimulationModal';
import { CustomDateRangeModal } from './analytics/business-overview/CustomDateRangeModal';
import { FinancialMultiDimensionalReport } from './analytics/financial/FinancialMultiDimensionalReport';

interface FinancialAnalyticsViewProps {
  onNavigate?: (path: NavPath) => void;
}

export const FinancialAnalyticsView: React.FC<FinancialAnalyticsViewProps> = ({ onNavigate }) => {
  // 0. 视图模式切换：看板 (dashboard) 与 多维报表 (report)
  const [viewMode, setViewMode] = useState<'dashboard' | 'report'>('report');

  // 1. 全局筛选状态 (时间区间、卡种品类、国家地区、渠道、货币折算)
  const [filters, setFilters] = useState<FinancialFilterState>({
    timeRange: 'month',
    customStartDate: '2026-08-01',
    customEndDate: '2026-08-31',
    cardBrand: '全部卡种品类 (All Giftcards)',
    region: '全域国家/地区 (All Regions)',
    channel: '商户收单渠道 (All Ingress Channels)',
    currency: 'USD',
  });

  // 2. 核心业务与账目数据状态
  const [stats, setStats] = useState<ExecutivePnLStats>(BASE_EXECUTIVE_PNL);
  const [waterfallSteps, setWaterfallSteps] = useState<WaterfallStep[]>(BASE_WATERFALL_STEPS);
  const [cardRows, setCardRows] = useState<CardSkuProfitabilityRow[]>(MOCK_CARD_PROFITABILITY_ROWS);
  const [trendPoints] = useState<MarginEvolutionPoint[]>(MOCK_MARGIN_EVOLUTION_TREND);

  // 3. 模态窗控制状态
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [selectedRateRow, setSelectedRateRow] = useState<CardSkuProfitabilityRow | null>(null);
  const [selectedRiskRow, setSelectedRiskRow] = useState<CardSkuProfitabilityRow | null>(null);

  // 4. 交互提示反馈
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // 筛选器变化响应
  const handleFilterChange = (newFilters: Partial<FinancialFilterState>) => {
    const next = { ...filters, ...newFilters };
    setFilters(next);

    // 动态调整指标系数，给予真实直观的数据响应
    let multiplier = 1.0;
    if (next.timeRange === 'today') multiplier = 0.045;
    else if (next.timeRange === 'yesterday') multiplier = 0.042;
    else if (next.timeRange === '7d') multiplier = 0.28;
    else if (next.timeRange === 'month') multiplier = 1.0;

    if (next.cardBrand.includes('Apple')) multiplier *= 0.43;
    else if (next.cardBrand.includes('Steam')) multiplier *= 0.27;

    setStats({
      ...BASE_EXECUTIVE_PNL,
      gmv: Math.round(BASE_EXECUTIVE_PNL.gmv * multiplier),
      dailyAvgGmv: Math.round(BASE_EXECUTIVE_PNL.dailyAvgGmv * (multiplier < 0.1 ? 1.0 : multiplier)),
      spreadRevenue: Math.round(BASE_EXECUTIVE_PNL.spreadRevenue * multiplier),
      operatingCosts: Math.round(BASE_EXECUTIVE_PNL.operatingCosts * multiplier),
      netMargin: Math.round(BASE_EXECUTIVE_PNL.netMargin * multiplier),
    });

    if (newFilters.currency && newFilters.currency !== filters.currency) {
      showToast(`已切换结算基准货币至 ${newFilters.currency === 'USD' ? 'USD 美元' : 'NGN 尼日利亚奈拉'}`);
    }
  };

  // 刷新账目
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('已与财务中央存管总账完成日结平衡对齐，账目为最新全量状态');
    }, 600);
  };

  // 应用自定义日期区间
  const handleApplyCustomDate = (start: string, end: string) => {
    setFilters((prev) => ({
      ...prev,
      timeRange: 'custom',
      customStartDate: start,
      customEndDate: end,
    }));
    showToast(`已应用自定义财务核算周期: ${start} ~ ${end}`);
  };

  // 保存汇率/利差调整
  const handleSaveRate = (id: string, newOfficialRate: number, newMerchantRate: number) => {
    const newSpread = newOfficialRate - newMerchantRate;
    setCardRows((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const gross = (r.gmv * newSpread) / 100;
          const net = gross + r.costsTotal;
          const netMargin = (net / r.gmv) * 100;
          return {
            ...r,
            officialRatePercent: newOfficialRate,
            merchantRatePercent: newMerchantRate,
            spreadPercent: newSpread,
            grossRevenue: Math.round(gross),
            netProfit: Math.round(net),
            netMarginPercent: Number(netMargin.toFixed(2)),
          };
        }
        return r;
      })
    );
    showToast(`盘口利差已调控更新为 +${newSpread.toFixed(1)}%，实时注入撮合引擎`);
  };

  // 确认执行限额降权
  const handleConfirmRestrict = (id: string, newCollateral: number, quotaLimit: number) => {
    setCardRows((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            strategyTag: `已降权 · 门槛${newCollateral}%`,
            strategyTagStyle: 'bg-rose-100 text-rose-800 border border-rose-300 font-bold',
          };
        }
        return r;
      })
    );
    showToast(`已对该高危慢卡启动限额降权：单日限额 $${quotaLimit.toLocaleString()}，保证金门槛提升至 ${newCollateral}%`);
  };

  // 采纳边际利润仿真测算
  const handleApplySimulation = (summary: string) => {
    showToast(`已采纳仿真测算推演方案：${summary}`);
  };

  // 导出成功通知
  const handleExportSuccess = (filename: string) => {
    showToast(`管理层损益表已生成完毕，正在下载: ${filename}`);
  };

  // 动态筛选后的主力盘口列表
  const displayedRows = useMemo(() => {
    return cardRows.filter((r) => {
      // 品类筛选
      if (filters.cardBrand !== '全部卡种品类 (All Giftcards)') {
        if (!filters.cardBrand.includes(r.skuName.split(' ')[0])) return false;
      }
      // 地区筛选
      if (filters.region !== '全域国家/地区 (All Regions)') {
        const regKeyword = filters.region.split(' ')[0];
        if (!r.region.includes(regKeyword)) return false;
      }
      return true;
    });
  }, [cardRows, filters.cardBrand, filters.region]);

  const getTimeRangeLabel = () => {
    if (filters.timeRange === 'today') return '今日实时 (Today)';
    if (filters.timeRange === 'yesterday') return '昨日 (Yesterday)';
    if (filters.timeRange === '7d') return '近7天 (Last 7 Days)';
    if (filters.timeRange === 'month') return '本月 (2026-08)';
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
              财务分析 (Financial Analytics)
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono text-[11px] font-semibold border border-blue-200/60">
              v2.1 商业盈利透视
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-mono text-[11px] font-semibold border border-emerald-200/60">
              实时日结对齐
            </span>
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600">
              <span className="material-symbols-outlined text-[14px] text-blue-600">policy</span>
              <span>原则隔离：商业收益与经营成本透视 · 真实打款平账见</span>
              <button
                type="button"
                onClick={() => onNavigate?.('platform-settlement')}
                className="text-blue-600 font-medium hover:underline inline-flex items-center gap-0.5 cursor-pointer ml-0.5"
              >
                平台结算管理
                <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            聚合全域点差毛利、动态加价补贴成本与渠道手续费，提供管理层 GAAP 损益与单卡边际收益穿透
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* 看板与数据报表切换控制器 */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/80 h-9">
            <button
              onClick={() => {
                setViewMode('dashboard');
                showToast('已切换至财务损益分析看板');
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
                showToast('已切换至财务多维数据报表');
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
            onClick={() => setIsCustomDateOpen(true)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs border border-slate-200/80 transition-colors cursor-pointer shadow-2xs font-medium"
          >
            <span className="material-symbols-outlined text-[16px] text-blue-600">calendar_today</span>
            <span>{getTimeRangeLabel()}</span>
            <span className="material-symbols-outlined text-[14px] text-slate-400">expand_more</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs border border-slate-200/80 transition-colors cursor-pointer shadow-2xs font-medium disabled:opacity-60"
            title="刷新账目"
          >
            <span className={`material-symbols-outlined text-[16px] text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>刷新</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="导出损益表"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>导出损益表</span>
          </button>
        </div>
      </header>

      {/* 条件渲染：多维数据报表 (Report) vs 经营损益看板 (Dashboard) */}
      {viewMode === 'report' ? (
        <FinancialMultiDimensionalReport
          onSwitchView={setViewMode}
          onNavigate={onNavigate}
          onShowToast={showToast}
        />
      ) : (
        <>
          {/* SECTION 1: 顶部管理导航与微型筛选功能带 (Management Navigation & Filter Ribbon) */}
          <FinancialFilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onOpenExportPnL={() => setIsExportOpen(true)}
            onOpenCustomDate={() => setIsCustomDateOpen(true)}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            viewMode={viewMode}
            onSwitchView={setViewMode}
          />

          {/* BLOCK 1: 管理层综合损益卡片矩阵 (Executive P&L Summary Cards - 4 Cards) */}
          <ExecutivePnLDeck stats={stats} currency={filters.currency} />

          {/* BLOCK 2: 综合利润表现金流瀑布图与单元经济学模型 (Unit Economics Waterfall) */}
          <UnitEconomicsWaterfall steps={waterfallSteps} currency={filters.currency} />

          {/* BLOCK 3: 品类与国家多维毛利透视表 (Multidimensional Card Profitability Table) */}
          <CardProfitabilityTable
            rows={displayedRows}
            currency={filters.currency}
            onRateControl={(row) => setSelectedRateRow(row)}
            onRiskRestrict={(row) => setSelectedRiskRow(row)}
          />

          {/* BLOCK 4: 近6个月综合净毛利率演进趋势与成本弹性测算 (Margin Trend & Cost Sensitivity) */}
          <MarginTrendSensitivity
            trendPoints={trendPoints}
            currency={filters.currency}
            onOpenSimulation={() => setIsSimulationOpen(true)}
          />
        </>
      )}

      {/* 快捷导航与关联平台模块底栏 */}
      {onNavigate && (
        <div className="p-3.5 bg-white rounded-xl shadow-xs border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="material-symbols-outlined text-blue-600 text-[18px]">
              account_balance
            </span>
            <span>
              如需进行三方通道明细对账、未达账项排查或批量资金清退，请进入财务结算与对账专区。
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('financial-reconciliation')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">balance</span>
              <span>前往财务对账</span>
            </button>
            <button
              onClick={() => onNavigate('platform-settlement')}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer shadow-xs flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">payments</span>
              <span>前往结算管理</span>
            </button>
          </div>
        </div>
      )}

      {/* 底部合规声明与会计准则标识 */}
      <footer className="py-2 flex flex-wrap items-center justify-between font-code-token text-[11px] text-slate-400 border-t border-slate-100">
        <span>CARD-OPS-FINANCIAL-ENGINE // UNIT-ECONOMICS & MARGIN v2.0-PROD</span>
        <div className="flex items-center gap-4">
          <span>记账口径: 权责发生制 (ACCRUAL)</span>
          <span>汇率锁死源: FX-FIXING-REUTERS</span>
          <span>结算节点: TOKYO-FIN-DC-01</span>
        </div>
      </footer>

      {/* 交互模态弹窗体系 */}
      {/* 1. 导出管理层损益表 */}
      <ExportPnLModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        currency={filters.currency}
        timeRangeLabel={getTimeRangeLabel()}
        onExportSuccess={handleExportSuccess}
      />

      {/* 2. 卡种利差与汇率调控 */}
      <RateControlModal
        isOpen={Boolean(selectedRateRow)}
        onClose={() => setSelectedRateRow(null)}
        row={selectedRateRow}
        currency={filters.currency}
        onSaveRate={handleSaveRate}
      />

      {/* 3. 慢卡限额与风控降权 */}
      <RiskRestrictionModal
        isOpen={Boolean(selectedRiskRow)}
        onClose={() => setSelectedRiskRow(null)}
        row={selectedRiskRow}
        currency={filters.currency}
        onConfirmRestrict={handleConfirmRestrict}
      />

      {/* 4. 实时边际利润仿真测算沙盘 */}
      <MarginSimulationModal
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
        currency={filters.currency}
        onApplyPlan={handleApplySimulation}
      />

      {/* 5. 自定义时间区间弹窗 */}
      <CustomDateRangeModal
        isOpen={isCustomDateOpen}
        onClose={() => setIsCustomDateOpen(false)}
        onApply={handleApplyCustomDate}
        initialStart={filters.customStartDate}
        initialEnd={filters.customEndDate}
      />
    </div>
  );
};
