import React, { useState } from 'react';
import { NavPath, CardCategoryTradeStat } from '../types';
import { MOCK_CARD_CATEGORY_STATS } from '../data/mockData';
import {
  GlobalFilterState,
  TimeRangeKey,
  FunnelStepData,
  AnomalyItem,
  MacroKpiData,
} from './analytics/transaction/types';
import {
  MOCK_MACRO_KPI,
  MOCK_FUNNEL_STEPS,
  MOCK_QUADRANT_BRANDS,
  MOCK_ANOMALIES,
} from './analytics/transaction/mockData';
import { TransactionKpiDeck } from './analytics/transaction/TransactionKpiDeck';
import { MultiHopFunnelSection } from './analytics/transaction/MultiHopFunnelSection';
import { CrossStructureSection } from './analytics/transaction/CrossStructureSection';
import { AnomalyRootCauseSection } from './analytics/transaction/AnomalyRootCauseSection';
import { FunnelConfigModal, FunnelConfig } from './analytics/transaction/FunnelConfigModal';
import { TransactionExportModal } from './analytics/transaction/TransactionExportModal';
import { CardOrderDrilldownModal } from './analytics/transaction/CardOrderDrilldownModal';
import { ProfitSharingModal } from './analytics/transaction/ProfitSharingModal';
import { AnomalyDisposalModal } from './analytics/transaction/AnomalyDisposalModal';
import { CustomDateRangeModal } from './analytics/business-overview/CustomDateRangeModal';
import { MultiDimensionalReport } from './analytics/transaction/MultiDimensionalReport';

interface TransactionAnalyticsViewProps {
  onNavigate?: (path: NavPath) => void;
}

export const TransactionAnalyticsView: React.FC<TransactionAnalyticsViewProps> = ({ onNavigate }) => {
  // View mode toggle: 'dashboard' (原有质量漏斗大盘) or 'report' (多维报表)
  const [viewMode, setViewMode] = useState<'dashboard' | 'report'>('report');

  // Global Filters state
  const [filters, setFilters] = useState<GlobalFilterState>({
    timeRange: 'today',
    customStartDate: '2026-08-01',
    customEndDate: '2026-08-27',
    brand: '全部品牌',
    region: '全部币种 / 地区',
    mediaType: '全部介质形态',
    denomination: '全档位面值',
    merchant: '全平台入驻承兑商 (68家)',
    channelMode: '全部通道',
  });

  // Dynamic Data States
  const [macroKpi, setMacroKpi] = useState<MacroKpiData>(MOCK_MACRO_KPI);
  const [funnelSteps, setFunnelSteps] = useState<FunnelStepData[]>(MOCK_FUNNEL_STEPS);
  const [quadrantBrands, setQuadrantBrands] = useState(MOCK_QUADRANT_BRANDS);
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>(MOCK_ANOMALIES);
  const [categories] = useState<CardCategoryTradeStat[]>(MOCK_CARD_CATEGORY_STATS);
  const [selectedCategory, setSelectedCategory] = useState<CardCategoryTradeStat | null>(null);
  const [categorySearch, setCategorySearch] = useState('');
  const [isCategorySectionOpen, setIsCategorySectionOpen] = useState(false);

  // Modals state
  const [isFunnelConfigOpen, setIsFunnelConfigOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDrilldownOpen, setIsDrilldownOpen] = useState(false);
  const [selectedAnomalyForDrilldown, setSelectedAnomalyForDrilldown] = useState<AnomalyItem | null>(null);
  const [isProfitModalOpen, setIsProfitModalOpen] = useState(false);
  const [isDisposalModalOpen, setIsDisposalModalOpen] = useState(false);
  const [selectedAnomalyForDisposal, setSelectedAnomalyForDisposal] = useState<AnomalyItem | null>(null);
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);

  // Live Refresh Timestamp
  const [syncTime, setSyncTime] = useState('15:48:32');
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      const now = new Date();
      setSyncTime(now.toTimeString().split(' ')[0]);
      setRefreshing(false);
      showToast('交易质量与流转看板实时数据已刷新同步！');
    }, 400);
  };

  const getTimeRangeLabel = () => {
    switch (filters.timeRange) {
      case 'today':
        return '今日实时 (2026-08-27)';
      case 'yesterday':
        return '昨日 (2026-08-26)';
      case '7d':
        return '近7天 (2026-08-21 ~ 08-27)';
      case 'month':
        return '本月 (2026-08)';
      case 'custom':
        return `${filters.customStartDate} ~ ${filters.customEndDate}`;
      default:
        return '今日实时';
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setFilters({
      timeRange: 'today',
      customStartDate: '2026-08-01',
      customEndDate: '2026-08-27',
      brand: '全部品牌',
      region: '全部币种 / 地区',
      mediaType: '全部介质形态',
      denomination: '全档位面值',
      merchant: '全平台入驻承兑商 (68家)',
      channelMode: '全部通道',
    });
    showToast('筛选条件已重置为默认基准视图');
  };

  // Filter change helper
  const handleTimeRangeChange = (range: TimeRangeKey) => {
    if (range === 'custom') {
      setIsCustomDateOpen(true);
    } else {
      setFilters((prev) => ({ ...prev, timeRange: range }));
    }
  };

  // Funnel Config Save
  const handleSaveFunnelConfig = (config: FunnelConfig) => {
    showToast('漏斗各节点流失预警线与 SLA 耗时基线已成功保存至风控引擎');
  };

  // Profit Boost Apply
  const handleApplyProfitBoost = (boostPercent: number) => {
    // Dynamically update macro conversion and successful orders
    setMacroKpi((prev) => ({
      ...prev,
      conversionRate: +(prev.conversionRate + boostPercent * 1.8).toFixed(1),
      successfulOrders: Math.round(prev.successfulOrders * (1 + boostPercent * 0.02)),
      settledGmv: Math.round(prev.settledGmv * (1 + boostPercent * 0.025)),
    }));
    showToast(`散额撮合让利 +${boostPercent.toFixed(1)}% 规则已下发，预估挽回 380 笔/日流单！`);
  };

  // Anomaly Disposal
  const handleConfirmDisposal = (type: string, comment: string) => {
    if (selectedAnomalyForDisposal) {
      setAnomalies((prev) =>
        prev.map((a) =>
          a.id === selectedAnomalyForDisposal.id
            ? {
                ...a,
                status: '已闭环追偿',
                statusColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
              }
            : a
        )
      );
      showToast(`卡单 ${selectedAnomalyForDisposal.typicalTxId} 处置已归档完毕`);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.category.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full space-y-5 text-slate-800 antialiased pb-10">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900/90 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs animate-fadeIn backdrop-blur-xs border border-slate-700">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 顶部统一业务标头 (Top Header with Dashboard / Multi-Dimensional Switch) */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white px-5 py-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              交易分析与转化质量大盘
            </h1>
            <span className="text-xs text-slate-500">
              · 全站转化漏斗与各卡种履约 SLA
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            监控全站订单转化漏斗、各卡种撮合时效 SLA、卡单异常追偿处置与多维交易指标下钻。
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/80 h-9">
            <button
              onClick={() => {
                setViewMode('dashboard');
                showToast('已切换至交易质量与转化漏斗看板');
              }}
              className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all text-xs cursor-pointer font-medium ${
                viewMode === 'dashboard'
                  ? 'bg-white text-blue-600 shadow-2xs font-semibold'
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
                showToast('已切换至多维报表分析明细视图');
              }}
              className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all text-xs cursor-pointer font-medium ${
                viewMode === 'report'
                  ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">table_chart</span>
              <span>多维报表</span>
            </button>
          </div>
          {viewMode === 'dashboard' && (
            <button
              type="button"
              onClick={() => setIsFunnelConfigOpen(true)}
              className="h-9 px-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 rounded-lg transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px] text-slate-500">tune</span>
              <span>漏斗配置</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="导出报表"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>导出报表</span>
          </button>
        </div>
      </header>

      {viewMode === 'report' ? (
        <MultiDimensionalReport
          onShowToast={showToast}
          onOpenExport={() => setIsExportModalOpen(true)}
        />
      ) : (
        <>
      {/* 顶部多维全局统一筛选器 (Global Unified Filters) */}
      <section className="w-full bg-white rounded-xl shadow-xs border border-slate-200/80 p-4 space-y-3.5">
        {/* Row 1: Time Range Selection & Global Info */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-label-caps text-xs text-slate-500 font-semibold uppercase">
              分析周期:
            </span>
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/60 text-xs">
              <button
                onClick={() => handleTimeRangeChange('today')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  filters.timeRange === 'today'
                    ? 'bg-white text-blue-600 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                今日实时
              </button>
              <button
                onClick={() => handleTimeRangeChange('yesterday')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  filters.timeRange === 'yesterday'
                    ? 'bg-white text-blue-600 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                昨日
              </button>
              <button
                onClick={() => handleTimeRangeChange('7d')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  filters.timeRange === '7d'
                    ? 'bg-white text-blue-600 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                近7天
              </button>
              <button
                onClick={() => handleTimeRangeChange('month')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  filters.timeRange === 'month'
                    ? 'bg-white text-blue-600 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                本月
              </button>
              <button
                onClick={() => setIsCustomDateOpen(true)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  filters.timeRange === 'custom'
                    ? 'bg-white text-blue-600 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">calendar_month</span>
                <span>
                  {filters.timeRange === 'custom'
                    ? `${filters.customStartDate} ~ ${filters.customEndDate}`
                    : '自定义日历'}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 font-code-token text-[11px]">
              统计窗口: UTC+08:00
            </span>
            <span className="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 font-code-token text-[11px]">
              撮合池样本量: 10,000 基准样本
            </span>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1 text-slate-600 hover:text-blue-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="刷新最新数据"
            >
              <span className={`material-symbols-outlined text-[16px] ${refreshing ? 'animate-spin' : ''}`}>
                refresh
              </span>
              <span className="font-code-token text-[11px]">{syncTime}</span>
            </button>
          </div>
        </div>

        {/* Row 2: 6 Dropdown Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5">
          {/* 1. 卡种品牌 */}
          <div className="flex flex-col bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1.5">
            <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">sell</span>
              卡种品牌
            </span>
            <select
              value={filters.brand}
              onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
              className="bg-transparent text-xs text-slate-800 font-medium focus:outline-none cursor-pointer mt-0.5"
            >
              <option>全部品牌</option>
              <option>Apple Store / iTunes</option>
              <option>Steam Wallet Card</option>
              <option>Google Play Card</option>
              <option>Razer Gold Gift Card</option>
              <option>Vanilla Visa Prepaid</option>
            </select>
          </div>

          {/* 2. 发行国家 / 地区 */}
          <div className="flex flex-col bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1.5">
            <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">public</span>
              发行国家 / 地区
            </span>
            <select
              value={filters.region}
              onChange={(e) => setFilters({ ...filters, region: e.target.value })}
              className="bg-transparent text-xs text-slate-800 font-medium focus:outline-none cursor-pointer mt-0.5"
            >
              <option>全部币种 / 地区</option>
              <option>美国 (USD · $)</option>
              <option>欧洲区 (EUR · €)</option>
              <option>英国 (GBP · £)</option>
              <option>日本 (JPY · ¥)</option>
              <option>澳大利亚 (AUD · A$)</option>
            </select>
          </div>

          {/* 3. 介质类型 */}
          <div className="flex flex-col bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1.5">
            <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">style</span>
              介质类型
            </span>
            <select
              value={filters.mediaType}
              onChange={(e) => setFilters({ ...filters, mediaType: e.target.value })}
              className="bg-transparent text-xs text-slate-800 font-medium focus:outline-none cursor-pointer mt-0.5"
            >
              <option>全部介质形态</option>
              <option>实体小票 (Receipt / POSA)</option>
              <option>刮开涂层 (Physical Scratched)</option>
              <option>纯电子码 (Digital eCode)</option>
            </select>
          </div>

          {/* 4. 面值区间 */}
          <div className="flex flex-col bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1.5">
            <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">payments</span>
              面值区间
            </span>
            <select
              value={filters.denomination}
              onChange={(e) => setFilters({ ...filters, denomination: e.target.value })}
              className="bg-transparent text-xs text-slate-800 font-medium focus:outline-none cursor-pointer mt-0.5"
            >
              <option>全档位面值</option>
              <option>固定大额 ($100 / $200 / $500)</option>
              <option>中等常规面值 ($50)</option>
              <option>散额浮动小面额 ($10 ~ $25)</option>
              <option>自定义不规则散额</option>
            </select>
          </div>

          {/* 5. 接卡承揽商户 */}
          <div className="flex flex-col bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1.5">
            <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">storefront</span>
              接卡承揽商户
            </span>
            <select
              value={filters.merchant}
              onChange={(e) => setFilters({ ...filters, merchant: e.target.value })}
              className="bg-transparent text-xs text-slate-800 font-medium focus:outline-none cursor-pointer mt-0.5"
            >
              <option>全平台入驻承兑商 (68家)</option>
              <option>M-101 (Apex Global Redemption)</option>
              <option>M-204 (CyberCard Alpha API)</option>
              <option>M-089 (Nordic FinSettle Corp)</option>
              <option>自营清算总池 (CardOps Vault)</option>
            </select>
          </div>

          {/* 6. 流转通道模式 */}
          <div className="flex flex-col bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1.5">
            <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">alt_route</span>
              流转通道模式
            </span>
            <select
              value={filters.channelMode}
              onChange={(e) => setFilters({ ...filters, channelMode: e.target.value })}
              className="bg-transparent text-xs text-slate-800 font-medium focus:outline-none cursor-pointer mt-0.5"
            >
              <option>全部通道</option>
              <option>闪兑快卡通道 (SLA &lt; 60s)</option>
              <option>人工核验慢卡通道 (大额复核)</option>
              <option>风险阻断沙盒测试通道</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Reset & Navigation Badges */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">当前激活视图:</span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium text-[11px]">
              {filters.brand}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
              {filters.region}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
              {filters.denomination}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetFilters}
              className="text-slate-500 hover:text-slate-800 text-xs font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
            >
              重置筛选
            </button>
            {onNavigate && (
              <button
                onClick={() => onNavigate('business-overview')}
                className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-0.5 cursor-pointer"
              >
                <span>进入经营总览</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Module 1: 交易宏观质量看板 (Macro Quality KPI Deck) */}
      <TransactionKpiDeck data={macroKpi} />

      {/* Module 2: 全链路流转转化漏斗模型 (Multi-Hop Funnel Architecture) */}
      <MultiHopFunnelSection
        steps={funnelSteps}
        onOpenConfig={() => setIsFunnelConfigOpen(true)}
      />

      {/* Module 3: 卡种·国家·面值多维交叉结构分析 (Cross-Structure Analytics 7:5 Grid) */}
      <CrossStructureSection
        brandItems={quadrantBrands}
        onOpenProfitModal={() => setIsProfitModalOpen(true)}
        onSelectBrand={(bName) => {
          setFilters((prev) => ({ ...prev, brand: bName }));
          showToast(`已切换至 ${bName} 独立分析视图`);
        }}
      />

      {/* Module 4: 交易故障与异常多维根因归集表 (Root-Cause Anomaly Aggregation & Drill-Down) */}
      <AnomalyRootCauseSection
        anomalies={anomalies}
        onDrilldownCard={(anomaly) => {
          setSelectedAnomalyForDrilldown(anomaly);
          setIsDrilldownOpen(true);
        }}
        onDisposal={(anomaly) => {
          setSelectedAnomalyForDisposal(anomaly);
          setIsDisposalModalOpen(true);
        }}
      />

      {/* Collapsible Section: 核心礼品卡种交易数据画像 (Deep-dive category stats) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div
          onClick={() => setIsCategorySectionOpen(!isCategorySectionOpen)}
          className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">category</span>
            <span className="text-sm font-bold text-slate-900">核心礼品卡种交易数据画像全量明细</span>
            <span className="text-[11px] text-slate-500 font-code-token">
              ({filteredCategories.length} 个重点协议品类)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              {isCategorySectionOpen ? '收起明细' : '展开全量品类画像'}
            </span>
            <span className="material-symbols-outlined text-slate-400 text-[18px]">
              {isCategorySectionOpen ? 'expand_less' : 'expand_more'}
            </span>
          </div>
        </div>

        {isCategorySectionOpen && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="relative w-72">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  search
                </span>
                <input
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="搜索卡种品类 / 协议类型..."
                  className="w-full h-8 pl-8 pr-3 bg-slate-50 rounded-lg text-xs text-slate-800 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <span className="text-xs text-slate-500 font-code-token">
                实时自动匹配做卡商户与调价曲线
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="h-9 bg-slate-50 text-slate-500 font-label-caps text-[11px] uppercase tracking-wider border-b border-slate-200">
                    <th className="px-4 font-semibold">卡种品类名称</th>
                    <th className="px-4 font-semibold text-right">今日GMV (CNY)</th>
                    <th className="px-4 font-semibold text-right">交易占比</th>
                    <th className="px-4 font-semibold text-right">出单总量</th>
                    <th className="px-4 font-semibold text-right">平均结算折率</th>
                    <th className="px-4 font-semibold text-right">平均核销时效</th>
                    <th className="px-4 font-semibold text-right">售后争议单</th>
                    <th className="px-4 font-semibold">热度趋势</th>
                    <th className="px-4 font-semibold text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCategories.map((item, idx) => (
                    <tr key={idx} className="h-12 hover:bg-slate-50/80 transition-colors">
                      <td className="px-4">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded-md bg-blue-50 text-blue-600">
                            <span className="material-symbols-outlined text-[16px]">
                              {item.categoryIcon}
                            </span>
                          </span>
                          <span className="font-semibold text-slate-900">{item.category}</span>
                        </div>
                      </td>
                      <td className="px-4 text-right font-numeric-stat font-bold text-slate-900 text-[13px]">
                        ¥{item.gmvAmount.toLocaleString()}
                      </td>
                      <td className="px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="font-code-token font-semibold text-blue-600">
                            {item.gmvShare}%
                          </span>
                          <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              style={{ width: `${item.gmvShare}%` }}
                              className="h-full bg-blue-600 rounded-full"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 text-right font-numeric-stat text-slate-700">
                        {item.orderCount.toLocaleString()}
                      </td>
                      <td className="px-4 text-right font-code-token font-semibold text-emerald-700">
                        {item.avgDiscountRate}
                      </td>
                      <td className="px-4 text-right font-numeric-stat font-medium">
                        {item.avgVerifySec}秒
                      </td>
                      <td className="px-4 text-right font-numeric-stat">
                        {item.disputeCount > 0 ? (
                          <span className="text-amber-600 font-semibold">{item.disputeCount} 笔</span>
                        ) : (
                          <span className="text-emerald-700">0</span>
                        )}
                      </td>
                      <td className="px-4">
                        {item.trend === 'up' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 flex items-center gap-0.5 w-fit">
                            <span className="material-symbols-outlined text-[12px]">trending_up</span> 上升
                          </span>
                        ) : item.trend === 'down' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 flex items-center gap-0.5 w-fit">
                            <span className="material-symbols-outlined text-[12px]">trending_down</span> 下行
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 flex items-center gap-0.5 w-fit">
                            平稳
                          </span>
                        )}
                      </td>
                      <td className="px-4 text-center">
                        <button
                          onClick={() => setSelectedCategory(item)}
                          className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-blue-600 font-medium rounded transition-colors cursor-pointer"
                        >
                          品类详情
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      </>
      )}

      {/* MODALS */}
      {/* 1. Funnel Config Modal */}
      <FunnelConfigModal
        isOpen={isFunnelConfigOpen}
        onClose={() => setIsFunnelConfigOpen(false)}
        onSave={handleSaveFunnelConfig}
      />

      {/* 2. Transaction Export Modal */}
      <TransactionExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        timeRangeLabel={getTimeRangeLabel()}
      />

      {/* 3. Card Order Drilldown Modal */}
      <CardOrderDrilldownModal
        anomaly={selectedAnomalyForDrilldown}
        onClose={() => {
          setIsDrilldownOpen(false);
          setSelectedAnomalyForDrilldown(null);
        }}
        onNavigateToOrder={(txId) => {
          if (onNavigate) onNavigate('order-management');
        }}
      />

      {/* 4. Profit Sharing Modal */}
      <ProfitSharingModal
        isOpen={isProfitModalOpen}
        onClose={() => setIsProfitModalOpen(false)}
        onApplyRules={handleApplyProfitBoost}
      />

      {/* 5. Anomaly Disposal Modal */}
      <AnomalyDisposalModal
        anomaly={selectedAnomalyForDisposal}
        onClose={() => {
          setIsDisposalModalOpen(false);
          setSelectedAnomalyForDisposal(null);
        }}
        onConfirm={handleConfirmDisposal}
      />

      {/* 6. Custom Date Range Modal */}
      <CustomDateRangeModal
        isOpen={isCustomDateOpen}
        onClose={() => setIsCustomDateOpen(false)}
        onApply={(start, end) => {
          setFilters((prev) => ({
            ...prev,
            timeRange: 'custom',
            customStartDate: start,
            customEndDate: end,
          }));
          showToast(`已应用自定义日期: ${start} ~ ${end}`);
        }}
        initialStart={filters.customStartDate}
        initialEnd={filters.customEndDate}
      />

      {/* 7. Category Detail Quick Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden animate-fadeIn">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <span className="material-symbols-outlined text-[20px]">
                    {selectedCategory.categoryIcon}
                  </span>
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  品类交易详情 · {selectedCategory.category}
                </span>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                <div>
                  <span className="text-slate-400 block">今日成交GMV</span>
                  <span className="text-base font-bold text-slate-900 font-numeric-stat">
                    ¥{selectedCategory.gmvAmount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">大盘份额占比</span>
                  <span className="text-base font-bold text-blue-600 font-code-token">
                    {selectedCategory.gmvShare}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">撮合订单总量</span>
                  <span className="font-semibold text-slate-900 font-numeric-stat">
                    {selectedCategory.orderCount} 笔
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">平均出卡折率</span>
                  <span className="font-semibold text-emerald-700 font-code-token">
                    {selectedCategory.avgDiscountRate}
                  </span>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3 text-[11.5px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">平均核销时效:</span>
                  <span className="font-bold text-emerald-700">
                    {selectedCategory.avgVerifySec} 秒 (SLA健康)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">累计涉诉争议单数:</span>
                  <span className="font-code-token text-slate-800">
                    {selectedCategory.disputeCount} 单
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">支持币种规格:</span>
                  <span className="font-code-token text-slate-800">
                    USD / EUR / GBP / NGN / CAD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">主要接单商户:</span>
                  <span className="text-slate-800">
                    星辰数字、万商合众、汇通数字等 18 家
                  </span>
                </div>
              </div>
            </div>
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium cursor-pointer shadow-xs"
              >
                确认关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
