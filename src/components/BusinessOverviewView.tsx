import React, { useState } from 'react';
import { NavPath } from '../types';
import { BusinessResultsTab } from './analytics/business-overview/BusinessResultsTab';
import { BusinessTrendsTab } from './analytics/business-overview/BusinessTrendsTab';
import { BusinessStructureTab } from './analytics/business-overview/BusinessStructureTab';
import { ExecutivePdfModal } from './analytics/business-overview/ExecutivePdfModal';
import { BusinessExportModal } from './analytics/business-overview/BusinessExportModal';
import { CustomDateRangeModal } from './analytics/business-overview/CustomDateRangeModal';
import { TimeRangeKey, MetricPillarData } from './analytics/business-overview/types';

interface BusinessOverviewViewProps {
  onNavigate?: (path: NavPath) => void;
}

export type BusinessOverviewTab = 'results' | 'trends' | 'structure';

const DEFAULT_PILLAR_DATA: Record<TimeRangeKey, MetricPillarData> = {
  today: {
    gmv: {
      total: 1428500,
      momPercent: '+12.6%',
      yoyPercent: '+18.4%',
      currency: 'USD',
      successOrders: 12560,
      successRate: '98.6%',
      marketAdvantage: '优于大盘 0.8%',
      aov: 113.73,
    },
    users: {
      totalActive: 4210,
      momPercent: '+8.2%',
      activityIndex: 94.2,
      newUsers: 342,
      newUsersPercent: '8.1%',
      repurchaseRate30d: '68.4%',
      highValueShare: '44.0%',
    },
    merchants: {
      onlineCount: 88,
      loadRatio: '74.2%',
      healthRate: '99.2%',
      avgFulfillmentSec: 38.4,
      speedupSec: 12,
      availableCapacity: 3260000,
      stabilizationIndex: '1.18x (充足)',
    },
    margin: {
      netProfit: 58420,
      netMarginRatio: '+0.28%',
      profitRate: '4.09%',
      spreadAmount: 85710,
      escrowSafetyRate: '100% 充盈',
      riskExposure: '< $500.00',
    },
  },
  yesterday: {
    gmv: {
      total: 1268400,
      momPercent: '+5.4%',
      yoyPercent: '+14.2%',
      currency: 'USD',
      successOrders: 11180,
      successRate: '98.2%',
      marketAdvantage: '优于大盘 0.4%',
      aov: 113.45,
    },
    users: {
      totalActive: 3890,
      momPercent: '+4.1%',
      activityIndex: 91.8,
      newUsers: 298,
      newUsersPercent: '7.6%',
      repurchaseRate30d: '66.8%',
      highValueShare: '42.5%',
    },
    merchants: {
      onlineCount: 85,
      loadRatio: '71.5%',
      healthRate: '98.9%',
      avgFulfillmentSec: 40.2,
      speedupSec: 8,
      availableCapacity: 3100000,
      stabilizationIndex: '1.14x (充足)',
    },
    margin: {
      netProfit: 51200,
      netMarginRatio: '+0.15%',
      profitRate: '4.03%',
      spreadAmount: 76400,
      escrowSafetyRate: '100% 充盈',
      riskExposure: '< $650.00',
    },
  },
  '7d': {
    gmv: {
      total: 9450000,
      momPercent: '+16.8%',
      yoyPercent: '+22.1%',
      currency: 'USD',
      successOrders: 83200,
      successRate: '98.5%',
      marketAdvantage: '优于大盘 1.1%',
      aov: 113.58,
    },
    users: {
      totalActive: 18900,
      momPercent: '+12.4%',
      activityIndex: 95.6,
      newUsers: 2150,
      newUsersPercent: '11.3%',
      repurchaseRate30d: '70.2%',
      highValueShare: '46.2%',
    },
    merchants: {
      onlineCount: 92,
      loadRatio: '76.8%',
      healthRate: '99.4%',
      avgFulfillmentSec: 37.1,
      speedupSec: 14,
      availableCapacity: 3500000,
      stabilizationIndex: '1.21x (充足)',
    },
    margin: {
      netProfit: 396900,
      netMarginRatio: '+0.35%',
      profitRate: '4.20%',
      spreadAmount: 582000,
      escrowSafetyRate: '100% 充盈',
      riskExposure: '< $1,200.00',
    },
  },
  month: {
    gmv: {
      total: 38600000,
      momPercent: '+19.2%',
      yoyPercent: '+26.5%',
      currency: 'USD',
      successOrders: 339000,
      successRate: '98.8%',
      marketAdvantage: '优于大盘 1.4%',
      aov: 113.86,
    },
    users: {
      totalActive: 54200,
      momPercent: '+15.6%',
      activityIndex: 96.8,
      newUsers: 8900,
      newUsersPercent: '16.4%',
      repurchaseRate30d: '72.5%',
      highValueShare: '48.5%',
    },
    merchants: {
      onlineCount: 96,
      loadRatio: '79.2%',
      healthRate: '99.5%',
      avgFulfillmentSec: 36.5,
      speedupSec: 15,
      availableCapacity: 3800000,
      stabilizationIndex: '1.25x (充足)',
    },
    margin: {
      netProfit: 1618000,
      netMarginRatio: '+0.42%',
      profitRate: '4.19%',
      spreadAmount: 2410000,
      escrowSafetyRate: '100% 充盈',
      riskExposure: '< $2,400.00',
    },
  },
  custom: {
    gmv: {
      total: 1428500,
      momPercent: '+12.6%',
      yoyPercent: '+18.4%',
      currency: 'USD',
      successOrders: 12560,
      successRate: '98.6%',
      marketAdvantage: '优于大盘 0.8%',
      aov: 113.73,
    },
    users: {
      totalActive: 4210,
      momPercent: '+8.2%',
      activityIndex: 94.2,
      newUsers: 342,
      newUsersPercent: '8.1%',
      repurchaseRate30d: '68.4%',
      highValueShare: '44.0%',
    },
    merchants: {
      onlineCount: 88,
      loadRatio: '74.2%',
      healthRate: '99.2%',
      avgFulfillmentSec: 38.4,
      speedupSec: 12,
      availableCapacity: 3260000,
      stabilizationIndex: '1.18x (充足)',
    },
    margin: {
      netProfit: 58420,
      netMarginRatio: '+0.28%',
      profitRate: '4.09%',
      spreadAmount: 85710,
      escrowSafetyRate: '100% 充盈',
      riskExposure: '< $500.00',
    },
  },
};

export const BusinessOverviewView: React.FC<BusinessOverviewViewProps> = ({ onNavigate }) => {
  // 3 大标准 Tab (.1: 经营结果 / 趋势 / 结构)
  const [activeTab, setActiveTab] = useState<BusinessOverviewTab>('results');

  // 时间周期切换 (今日 / 昨日 / 本周 / 本月 / 自定义)
  const [timeRange, setTimeRange] = useState<TimeRangeKey>('today');
  const [trendInitialMetric, setTrendInitialMetric] = useState<string>('gmv');

  // Modals state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCustomRangeOpen, setIsCustomRangeOpen] = useState(false);
  const [customRange, setCustomRange] = useState<{ start: string; end: string }>({
    start: '2026-10-01',
    end: '2026-10-06',
  });

  // Live clock & 数据截止时间 (.5 异常处理规范: 所有核心指标必须显示数据截止时间)
  const [cutoffTime, setCutoffTime] = useState('2026-10-06 21:00:00 (T+5m 实时数仓)');
  const [isDataSyncing, setIsDataSyncing] = useState(false);

  const handleRefresh = () => {
    setIsDataSyncing(true);
    setTimeout(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      setCutoffTime(`2026-10-06 ${timeStr} (T+5m 实时数仓)`);
      setIsDataSyncing(false);
    }, 400);
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'today':
        return '今日 (2026-10-06)';
      case 'yesterday':
        return '昨日 (2026-10-05)';
      case '7d':
        return '本周 / 近7天 (2026-10-01 ~ 10-06)';
      case 'month':
        return '本月 (2026-10)';
      case 'custom':
        return `自定义区间 (${customRange.start} ~ ${customRange.end})`;
      default:
        return '今日';
    }
  };

  const pillarData = DEFAULT_PILLAR_DATA[timeRange] || DEFAULT_PILLAR_DATA.today;

  const handleDrilldownToTrends = (metricId: string) => {
    setTrendInitialMetric(metricId);
    setActiveTab('trends');
  };

  return (
    <div className="flex flex-col w-full space-y-4 text-slate-800 antialiased pb-12">
      {/* 顶部 Header: 平台最高层经营驾驶舱 (.1) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0">
            <span className="material-symbols-outlined text-[22px]">dashboard</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-slate-900 text-sm">经营总览（平台最高层经营驾驶舱）</h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-[10px] font-bold border border-blue-200">
                经营驾驶舱
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              一屏回答“平台现在经营得怎么样”：<strong className="text-slate-700">规模 → 增长 → 转化 → 收益 → 供给 → 风险</strong> 六个核心维度。
            </p>
          </div>
        </div>

        {/* 异常处理与数据截止时间标牌 (.5) */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isDataSyncing ? 'bg-amber-500 animate-spin' : 'bg-emerald-500 animate-pulse'}`}></span>
            <span className="text-slate-500 font-sans">数据截止时间:</span>
            <strong className="text-slate-800">{cutoffTime}</strong>
            <span className="text-slate-400">· 口径 v2.4</span>
          </div>

          <button
            onClick={handleRefresh}
            title="刷新数仓"
            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">sync</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPdfModalOpen(true)}
            className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-blue-600">picture_as_pdf</span>
            <span>简报 PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[15px]">file_download</span>
            <span>导出报表</span>
          </button>
        </div>
      </div>

      {/* 3 大标准 Tab 导航栏 + 周期选择器 (.1) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs px-4 pt-1 flex flex-col md:flex-row md:items-center justify-between gap-3 overflow-x-auto">
        {/* Tab 切换 */}
        <div className="flex items-center gap-1 shrink-0 text-xs">
          {[
            {
              id: 'results',
              label: '经营结果',
              icon: 'summarize',
              desc: '回答：当前周期平台最终经营结果怎么样？'
            },
            {
              id: 'trends',
              label: '趋势',
              icon: 'trending_up',
              desc: '回答：指标是在持续变好还是持续变差？'
            },
            {
              id: 'structure',
              label: '结构',
              icon: 'pie_chart',
              desc: '回答：生意到底是由什么构成的？'
            }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as BusinessOverviewTab)}
                className={`px-5 py-3.5 font-bold rounded-t-lg transition-colors shrink-0 flex items-center gap-2 relative cursor-pointer text-xs ${
                  isActive
                    ? 'text-[#004ac6] bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#004ac6]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 顶部周期切换 (.2: 今日 / 昨日 / 本周 / 本月 / 自定义时间) */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/60 text-xs mb-1.5 shrink-0">
          {[
            { id: 'today', label: '今日' },
            { id: 'yesterday', label: '昨日' },
            { id: '7d', label: '本周' },
            { id: 'month', label: '本月' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTimeRange(t.id as TimeRangeKey)}
              className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                timeRange === t.id
                  ? 'bg-white text-blue-600 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}

          <button
            onClick={() => setIsCustomRangeOpen(true)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
              timeRange === 'custom'
                ? 'bg-white text-blue-600 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">date_range</span>
            <span>{timeRange === 'custom' ? `${customRange.start.slice(5)}~${customRange.end.slice(5)}` : '自定义'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Tab 1: 经营结果                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'results' && (
        <BusinessResultsTab
          timeRange={timeRange}
          onNavigate={onNavigate}
          onDrilldownToTrends={handleDrilldownToTrends}
        />
      )}

      {/* ========================================================================= */}
      {/* Tab 2: 趋势                                                        */}
      {/* ========================================================================= */}
      {activeTab === 'trends' && (
        <BusinessTrendsTab
          initialMetric={trendInitialMetric}
          onNavigate={onNavigate}
        />
      )}

      {/* ========================================================================= */}
      {/* Tab 3: 结构                                                        */}
      {/* ========================================================================= */}
      {activeTab === 'structure' && (
        <BusinessStructureTab
          onNavigate={onNavigate}
        />
      )}

      {/* Modals */}
      <ExecutivePdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        data={pillarData}
        timeRangeLabel={getTimeRangeLabel()}
      />

      <BusinessExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        timeRangeLabel={getTimeRangeLabel()}
      />

      <CustomDateRangeModal
        isOpen={isCustomRangeOpen}
        onClose={() => setIsCustomRangeOpen(false)}
        onApply={(start, end) => {
          setCustomRange({ start, end });
          setTimeRange('custom');
        }}
        initialStart={customRange.start}
        initialEnd={customRange.end}
      />
    </div>
  );
};
