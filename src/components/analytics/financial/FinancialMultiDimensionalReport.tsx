import React, { useState, useMemo } from 'react';
import { NavPath } from '../../../types';
import {
  FinancialDimensionKey,
  FinancialMultiDimensionalRow,
  CARD_BRAND_ROWS_DATA,
  REGION_FINANCIAL_ROWS,
  MERCHANT_FINANCIAL_ROWS,
  CHANNEL_FINANCIAL_ROWS,
} from './financialMultiDimensionalData';
import {
  FinancialColumnConfigModal,
  FinancialColumnConfig,
  DEFAULT_FINANCIAL_COLUMN_CONFIG,
} from './FinancialColumnConfigModal';
import {
  FinancialDrilldownModal,
  DrilldownType,
} from './FinancialDrilldownModal';

interface FinancialMultiDimensionalReportProps {
  onSwitchView: (view: 'dashboard' | 'report') => void;
  onNavigate?: (path: NavPath) => void;
  onShowToast: (msg: string) => void;
}

export const FinancialMultiDimensionalReport: React.FC<FinancialMultiDimensionalReportProps> = ({
  onSwitchView,
  onNavigate,
  onShowToast,
}) => {
  // 1. 维度切换 (GROUP BY)
  const [activeDimension, setActiveDimension] = useState<FinancialDimensionKey>('cardBrand');

  // 2. 时间跨度筛选
  const [timeRange, setTimeRange] = useState<'today' | 'yesterday' | '7d' | '30d' | 'month'>('30d');

  // 3. 下拉筛选项
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('ALL');
  const [currencyCode, setCurrencyCode] = useState<'USD' | 'EUR' | 'CNY'>('USD');
  const [costAccountingMethod, setCostAccountingMethod] = useState<string>('FULL');

  // 4. 自定义列配置
  const [columnConfig, setColumnConfig] = useState<FinancialColumnConfig>(DEFAULT_FINANCIAL_COLUMN_CONFIG);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

  // 5. 穿透弹窗状态
  const [drilldownType, setDrilldownType] = useState<DrilldownType>('trend');
  const [drilldownRow, setDrilldownRow] = useState<FinancialMultiDimensionalRow | null>(null);
  const [isDrilldownOpen, setIsDrilldownOpen] = useState(false);

  // 6. 表格排序
  const [sortField, setSortField] = useState<keyof FinancialMultiDimensionalRow>('netProfit');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // 7. 分页
  const [pageSize, setPageSize] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 获取当前维度的数据集
  const rawRows = useMemo(() => {
    switch (activeDimension) {
      case 'cardBrand':
        return CARD_BRAND_ROWS_DATA;
      case 'region':
        return REGION_FINANCIAL_ROWS;
      case 'merchant':
        return MERCHANT_FINANCIAL_ROWS;
      case 'channel':
        return CHANNEL_FINANCIAL_ROWS;
      default:
        return CARD_BRAND_ROWS_DATA;
    }
  }, [activeDimension]);

  // 货币与时间范围动态微调因子
  const currencyRate = currencyCode === 'EUR' ? 0.92 : currencyCode === 'CNY' ? 7.18 : 1.0;
  const currencySymbol = currencyCode === 'EUR' ? '€' : currencyCode === 'CNY' ? '¥' : '$';

  // 筛选与排序后的行数据
  const processedRows = useMemo(() => {
    let list = [...rawRows];

    // 品牌快速筛选 (仅在卡品牌维度生效)
    if (activeDimension === 'cardBrand' && selectedBrandFilter !== 'ALL') {
      list = list.filter((r) => r.name.toLowerCase().includes(selectedBrandFilter.toLowerCase()));
    }

    // 排序
    list.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });

    return list;
  }, [rawRows, activeDimension, selectedBrandFilter, sortField, sortDirection]);

  // 处理排序点击
  const handleSort = (field: keyof FinancialMultiDimensionalRow) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // 合计行数据动态汇总
  const summaryTotals = useMemo(() => {
    const totalGmv = processedRows.reduce((acc, r) => acc + r.gmv, 0);
    const totalSpread = processedRows.reduce((acc, r) => acc + r.spreadAmount, 0);
    const totalCommission = processedRows.reduce((acc, r) => acc + r.commissionAmount, 0);
    const totalSubsidy = processedRows.reduce((acc, r) => acc + r.subsidyAmount, 0);
    const totalBadDebt = processedRows.reduce((acc, r) => acc + r.badDebtAmount, 0);
    const totalGateway = processedRows.reduce((acc, r) => acc + r.gatewayFee, 0);
    const totalNetProfit = processedRows.reduce((acc, r) => acc + r.netProfit, 0);

    const avgSpreadRate = totalGmv > 0 ? (totalSpread / totalGmv) * 100 : 0;
    const avgNetMargin = totalGmv > 0 ? (totalNetProfit / totalGmv) * 100 : 0;

    return {
      gmv: totalGmv,
      spreadAmount: totalSpread,
      spreadRate: avgSpreadRate,
      commission: totalCommission,
      subsidy: totalSubsidy,
      badDebt: totalBadDebt,
      gatewayFee: totalGateway,
      netProfit: totalNetProfit,
      netMarginRate: avgNetMargin,
    };
  }, [processedRows]);

  // 打开穿透弹窗
  const openDrilldown = (type: DrilldownType, row: FinancialMultiDimensionalRow) => {
    setDrilldownType(type);
    setDrilldownRow(row);
    setIsDrilldownOpen(true);
  };

  // 导出 CSV 报表
  const handleExportTable = () => {
    const headers = [
      '统计维度',
      '成交GMV(USD)',
      '直接利差',
      '利差率(%)',
      '推广佣金',
      '营销补贴',
      '坏账损耗',
      '网关费',
      '经营毛利',
      '毛利率(%)',
      '毛利贡献占比(%)',
      '经营评价',
    ];
    const csvRows = [
      headers.join(','),
      ...processedRows.map((r) =>
        [
          `"${r.name}"`,
          r.gmv.toFixed(2),
          r.spreadAmount.toFixed(2),
          `${r.spreadRatePercent.toFixed(2)}%`,
          r.commissionAmount.toFixed(2),
          r.subsidyAmount.toFixed(2),
          r.badDebtAmount.toFixed(2),
          r.gatewayFee.toFixed(2),
          r.netProfit.toFixed(2),
          `${r.netMarginPercent.toFixed(2)}%`,
          `${r.profitContributionPercent.toFixed(2)}%`,
          `"${r.evaluationTag}"`,
        ].join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `财务多维报表_单体经济学_${activeDimension}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast(`已成功导出多维报表 (${processedRows.length} 行数据)`);
  };

  return (
    <div className="flex flex-col w-full text-on-surface antialiased animate-fadeIn">
      {/* 2. Global Filter & Dimension Selector Bar (PRD 3.2, 3.4, 8.6, 9.1) */}
      <div className="flex flex-col gap-2 p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 shadow-sm mb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* 时间跨度 */}
          <div className="flex items-center gap-1 overflow-x-auto">
            <span className="text-[11px] font-label-caps text-outline uppercase mr-1 shrink-0">时间跨度</span>
            <button
              onClick={() => setTimeRange('today')}
              className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                timeRange === 'today' ? 'bg-primary-container text-on-primary font-medium shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              今日实时
            </button>
            <button
              onClick={() => setTimeRange('yesterday')}
              className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                timeRange === 'yesterday' ? 'bg-primary-container text-on-primary font-medium shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              昨日
            </button>
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                timeRange === '7d' ? 'bg-primary-container text-on-primary font-medium shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              近7天
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                timeRange === '30d' ? 'bg-primary-container text-on-primary font-medium shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              近30天
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                timeRange === 'month' ? 'bg-primary-container text-on-primary font-medium shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              本月
            </button>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-low text-xs text-on-surface shrink-0 ml-1">
              <span className="material-symbols-outlined text-[13px] text-outline">date_range</span>
              <span className="font-numeric-table text-[11px]">2026-08-01 ~ 2026-08-31</span>
            </div>
          </div>

          {/* 维度 (GROUP BY) */}
          <div className="flex items-center gap-1 overflow-x-auto">
            <span className="text-[11px] font-label-caps text-outline uppercase mr-1 shrink-0">维度 (GROUP BY)</span>
            <button
              onClick={() => setActiveDimension('cardBrand')}
              className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                activeDimension === 'cardBrand'
                  ? 'bg-surface-container-high text-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {activeDimension === 'cardBrand' && <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>}
              <span>按卡品牌与卡种</span>
            </button>
            <button
              onClick={() => setActiveDimension('region')}
              className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                activeDimension === 'region'
                  ? 'bg-surface-container-high text-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {activeDimension === 'region' && <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>}
              <span>按国家地区</span>
            </button>
            <button
              onClick={() => setActiveDimension('merchant')}
              className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                activeDimension === 'merchant'
                  ? 'bg-surface-container-high text-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {activeDimension === 'merchant' && <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>}
              <span>按商户承揽端</span>
            </button>
            <button
              onClick={() => setActiveDimension('channel')}
              className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                activeDimension === 'channel'
                  ? 'bg-surface-container-high text-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {activeDimension === 'channel' && <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>}
              <span>按流量获客渠道</span>
            </button>
          </div>
        </div>

        {/* 二级筛选器与动作按钮 */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-outline-variant/20">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-surface-container-low text-xs">
              <span className="text-[11px] text-outline font-body-sm">卡品牌:</span>
              <select
                value={selectedBrandFilter}
                onChange={(e) => setSelectedBrandFilter(e.target.value)}
                className="bg-transparent text-xs font-medium text-on-surface focus:outline-none cursor-pointer"
              >
                <option value="ALL">全部卡品牌 (8/8)</option>
                <option value="Apple">Apple Gift Card</option>
                <option value="Steam">Steam Wallet</option>
                <option value="Google">Google Play</option>
                <option value="Razer">Razer Gold</option>
                <option value="Vanilla">Vanilla Visa</option>
                <option value="Nike">Nike</option>
                <option value="Amazon">Amazon</option>
              </select>
            </div>

            <div className="flex items-center gap-1 px-2 py-1 rounded bg-surface-container-low text-xs">
              <span className="text-[11px] text-outline font-body-sm">货币口径:</span>
              <select
                value={currencyCode}
                onChange={(e) => {
                  const val = e.target.value as 'USD' | 'EUR' | 'CNY';
                  setCurrencyCode(val);
                  onShowToast(`已切换报表计价口径为 ${val}`);
                }}
                className="bg-transparent text-xs font-medium text-on-surface focus:outline-none cursor-pointer font-code-token"
              >
                <option value="USD">USD (基准统一汇率)</option>
                <option value="EUR">EUR (欧元基准)</option>
                <option value="CNY">CNY (离岸结算模拟)</option>
              </select>
            </div>

            <div className="flex items-center gap-1 px-2 py-1 rounded bg-surface-container-low text-xs">
              <span className="text-[11px] text-outline font-body-sm">成本核算:</span>
              <select
                value={costAccountingMethod}
                onChange={(e) => {
                  setCostAccountingMethod(e.target.value);
                  onShowToast('已重新校准直接成本核算口径');
                }}
                className="bg-transparent text-xs font-medium text-on-surface focus:outline-none cursor-pointer"
              >
                <option value="FULL">完整已归属直接成本 (含暂估)</option>
                <option value="CONFIRMED">仅确认实际冲扣成本</option>
                <option value="EX_RESERVE">排除准备金口径</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onShowToast(`已完成查询，当前维度共有 ${processedRows.length} 条有效聚合条目`)}
              className="h-7 px-3 rounded bg-primary text-on-primary font-body-sm text-xs font-medium hover:bg-primary/90 transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">filter_alt</span>
              <span>查询</span>
            </button>
            <button
              onClick={() => {
                setSelectedBrandFilter('ALL');
                setCurrencyCode('USD');
                setCostAccountingMethod('FULL');
                setActiveDimension('cardBrand');
                setTimeRange('30d');
                onShowToast('已重置多维报表所有筛选条件');
              }}
              className="h-7 px-2.5 rounded bg-surface-container text-on-surface-variant font-body-sm text-xs hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              重置
            </button>
            <button
              onClick={() => setIsColumnModalOpen(true)}
              className="h-7 px-2.5 rounded bg-surface-container text-on-surface-variant font-body-sm text-xs hover:bg-surface-container-high transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">view_column</span>
              <span>自定义列 (13)</span>
            </button>
            <button
              onClick={handleExportTable}
              className="h-7 px-2.5 rounded bg-surface-container text-on-surface-variant font-body-sm text-xs hover:bg-surface-container-high transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">download</span>
              <span>导出</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Core Summary Metrics Bar (PRD 8.3, 8.4, 9.5 经营毛利口径汇总) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 mb-3">
        {/* Metric Card 1: 成交总 GMV */}
        <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-label-caps text-outline uppercase">成交总 GMV</span>
            <span className="material-symbols-outlined text-[16px] text-outline-variant">payments</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-numeric-stat text-lg font-bold text-on-surface">
              {currencySymbol}{(summaryTotals.gmv * currencyRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-secondary font-medium font-numeric-table">
              笔均 {currencySymbol}{(115.38 * currencyRate).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1 mt-1 border-t border-outline-variant/20">
            <span className="text-[11px]">
              总笔数: <span className="font-numeric-table font-medium text-on-surface">12,380 笔</span>
            </span>
            <span className="font-code-token text-[10px] text-outline">基准统一折算</span>
          </div>
        </div>

        {/* Metric Card 2: 交易价差毛收入 */}
        <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-label-caps text-outline uppercase">交易价差毛收入</span>
            <span className="material-symbols-outlined text-[16px] text-outline-variant">stacked_bar_chart</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-numeric-stat text-lg font-bold text-primary">
              {currencySymbol}{(summaryTotals.spreadAmount * currencyRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="font-numeric-table text-xs font-semibold px-1.5 py-0.2 rounded bg-surface-container text-primary">
              {summaryTotals.spreadRate.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1 mt-1 border-t border-outline-variant/20">
            <span className="text-[11px]">综合利差率 (Take Rate)</span>
            <span className="text-[11px] text-secondary font-medium">利差表现健康</span>
          </div>
        </div>

        {/* Metric Card 3: 直接归属经营成本 */}
        <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-label-caps text-outline uppercase">直接归属经营成本</span>
            <span className="material-symbols-outlined text-[16px] text-outline-variant">trending_down</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-numeric-stat text-lg font-bold text-error">
              -{currencySymbol}{(27290.0 * currencyRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="font-numeric-table text-xs text-outline font-medium">占比 31.8%</span>
          </div>
          <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1 mt-1 border-t border-outline-variant/20 font-numeric-table">
            <span className="text-[11px] text-outline">佣金 -$21.4k · 补贴 -$4.3k</span>
            <span className="text-[11px] text-error">坏账 -$1,590</span>
          </div>
        </div>

        {/* Metric Card 4: 平台经营净毛利 */}
        <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-label-caps text-outline uppercase">平台经营净毛利</span>
            <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-numeric-stat text-lg font-bold text-secondary">
              {currencySymbol}{(summaryTotals.netProfit * currencyRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="font-numeric-table text-xs font-bold text-secondary flex items-center">
              <span className="material-symbols-outlined text-[13px]">arrow_upward</span>
              {summaryTotals.netMarginRate.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1 mt-1 border-t border-outline-variant/20">
            <span className="text-[11px] font-numeric-table text-secondary">环比 +0.35%</span>
            <span className="text-[11px] text-outline">净利润贡献充足</span>
          </div>
        </div>
      </div>

      {/* 4. Formula Guidance Banner & Penetration Roadmap */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 px-3 py-1.5 rounded-md bg-surface-container mb-2 text-on-surface-variant text-xs">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[15px] text-primary">functions</span>
          <span className="text-outline font-medium text-[11px]">核算公式:</span>
          <span className="font-code-token text-[11px] font-semibold text-on-surface">
            经营毛利 = 交易直接利差 - 推广佣金 - 营销补贴 - 坏账损耗 - 网关费
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-body-sm">
          <button
            onClick={() => onNavigate?.('05-business-overview' as NavPath)}
            className="px-1 py-0.2 rounded bg-surface-container-high text-outline hover:text-primary transition-colors cursor-pointer"
          >
            L1 经营总览
          </button>
          <span className="text-outline-variant">➔</span>
          <button
            onClick={() => onSwitchView('dashboard')}
            className="px-1 py-0.2 rounded bg-surface-container-high text-outline hover:text-primary transition-colors cursor-pointer"
          >
            L2 财务看板
          </button>
          <span className="text-outline-variant">➔</span>
          <span className="px-1.5 py-0.5 rounded bg-primary text-on-primary font-medium shadow-sm">
            L3 单元经济学 (当前)
          </span>
          <span className="text-outline-variant">➔</span>
          <button
            onClick={() => {
              if (processedRows.length > 0) openDrilldown('l4', processedRows[0]);
            }}
            className="px-1 py-0.2 rounded bg-surface-container-high text-outline hover:text-primary transition-colors cursor-pointer"
          >
            L4 订单明细
          </button>
        </div>
      </div>

      {/* 5. High-Density Multidimensional Financial Data Table (PRD 8.5, 8.6 Unit Economics) */}
      <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col border border-outline-variant/30">
        {/* Table Auxiliary Controls */}
        <div className="px-space-base py-space-sm flex items-center justify-between bg-surface-container-low/60 border-b border-outline-variant/20">
          <div className="flex items-center gap-space-sm">
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              {activeDimension === 'cardBrand'
                ? '卡种品类单元经济学全览'
                : activeDimension === 'region'
                ? '国家与地区单元经济学全览'
                : activeDimension === 'merchant'
                ? '商户承揽端单元经济学全览'
                : '流量获客渠道单元经济学全览'}
            </span>
            <span className="text-xs text-outline font-body-sm">
              (展示 {processedRows.length} 个核心统计节点 · 数据按毛利贡献排序)
            </span>
          </div>
          <div className="flex items-center gap-space-xs text-xs text-outline">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>健康 (&gt;3.5%)
            </span>
            <span className="flex items-center gap-1 ml-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>防御/承揽 (2.5%~3.5%)
            </span>
            <span className="flex items-center gap-1 ml-2">
              <span className="w-2 h-2 rounded-full bg-error"></span>警示/紧缩 (&lt;2.5%)
            </span>
          </div>
        </div>

        {/* Scrollable Table Grid */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-surface-container text-outline font-label-caps text-label-caps uppercase tracking-wider h-10 select-none">
                <th className="px-space-base py-2 text-left font-semibold sticky left-0 bg-surface-container z-10 shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
                  统计维度 ({activeDimension === 'cardBrand' ? '卡种品牌与规格 / 品类' : activeDimension === 'region' ? '区域代号 / 特性' : activeDimension === 'merchant' ? '商户标识 / 渠道' : '获客矩阵'})
                </th>

                {columnConfig.gmv && (
                  <th
                    onClick={() => handleSort('gmv')}
                    className="px-3 py-2 text-right font-semibold cursor-pointer hover:text-on-surface transition-colors"
                  >
                    成交 GMV ({currencyCode}) <span className="font-numeric-table">{sortField === 'gmv' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}</span>
                  </th>
                )}

                {columnConfig.spreadAmount && (
                  <th
                    onClick={() => handleSort('spreadAmount')}
                    className="px-3 py-2 text-right font-semibold cursor-pointer hover:text-on-surface transition-colors"
                  >
                    交易直接利差 <span className="font-numeric-table">{sortField === 'spreadAmount' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}</span>
                  </th>
                )}

                {columnConfig.spreadRate && (
                  <th
                    onClick={() => handleSort('spreadRatePercent')}
                    className="px-3 py-2 text-right font-semibold cursor-pointer hover:text-on-surface transition-colors"
                  >
                    利差率 <span className="font-numeric-table">{sortField === 'spreadRatePercent' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}</span>
                  </th>
                )}

                {columnConfig.commission && (
                  <th className="px-3 py-2 text-right font-semibold text-error/90">推广佣金</th>
                )}

                {columnConfig.subsidy && (
                  <th className="px-3 py-2 text-right font-semibold text-error/90">营销活动补贴</th>
                )}

                {columnConfig.badDebt && (
                  <th className="px-3 py-2 text-right font-semibold text-error/90">售后与坏账损耗</th>
                )}

                {columnConfig.gatewayFee && (
                  <th className="px-3 py-2 text-right font-semibold text-error/90">直接网关费</th>
                )}

                {columnConfig.netProfit && (
                  <th
                    onClick={() => handleSort('netProfit')}
                    className="px-3 py-2 text-right font-semibold text-secondary cursor-pointer hover:text-on-surface transition-colors"
                  >
                    平台经营毛利 ({currencyCode}) <span className="font-numeric-table">{sortField === 'netProfit' ? (sortDirection === 'asc' ? '↑' : '↓') : '↓'}</span>
                  </th>
                )}

                {columnConfig.netMarginRate && (
                  <th
                    onClick={() => handleSort('netMarginPercent')}
                    className="px-3 py-2 text-right font-semibold cursor-pointer hover:text-on-surface transition-colors"
                  >
                    经营毛利率 (%) <span className="font-numeric-table">{sortField === 'netMarginPercent' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}</span>
                  </th>
                )}

                {columnConfig.profitShare && (
                  <th
                    onClick={() => handleSort('profitContributionPercent')}
                    className="px-3 py-2 text-right font-semibold cursor-pointer hover:text-on-surface transition-colors"
                  >
                    毛利贡献占比 <span className="font-numeric-table">{sortField === 'profitContributionPercent' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}</span>
                  </th>
                )}

                {columnConfig.evaluationTag && (
                  <th className="px-3 py-2 text-center font-semibold">经营评价标签</th>
                )}

                <th className="px-space-base py-2 text-right font-semibold sticky right-0 bg-surface-container z-10 shadow-[-1px_0_4px_rgba(0,0,0,0.02)]">
                  操作透视
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-surface-container/60 font-body-sm text-body-sm text-on-surface">
              {processedRows.map((row) => (
                <tr key={row.id} className="hover:bg-surface-container-low transition-colors group">
                  {/* 冻结列: 维度信息 */}
                  <td className="px-space-base py-2.5 font-medium sticky left-0 bg-surface-container-lowest group-hover:bg-surface-container-low z-10">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 font-bold text-xs ${row.iconBg} ${row.iconColor}`}>
                        {row.iconText}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface">{row.name}</span>
                        <span className="text-[11px] text-outline font-code-token">{row.subDesc}</span>
                      </div>
                    </div>
                  </td>

                  {columnConfig.gmv && (
                    <td className="px-3 py-2.5 text-right font-numeric-table font-semibold text-on-surface">
                      {currencySymbol}{(row.gmv * currencyRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  )}

                  {columnConfig.spreadAmount && (
                    <td className="px-3 py-2.5 text-right font-numeric-table text-primary font-medium">
                      +{currencySymbol}{(row.spreadAmount * currencyRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  )}

                  {columnConfig.spreadRate && (
                    <td className="px-3 py-2.5 text-right font-numeric-table text-outline">
                      {row.spreadRatePercent.toFixed(2)}%
                    </td>
                  )}

                  {columnConfig.commission && (
                    <td className="px-3 py-2.5 text-right font-numeric-table text-error">
                      -{currencySymbol}{(Math.abs(row.commissionAmount) * currencyRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  )}

                  {columnConfig.subsidy && (
                    <td className="px-3 py-2.5 text-right font-numeric-table text-error">
                      -{currencySymbol}{(Math.abs(row.subsidyAmount) * currencyRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  )}

                  {columnConfig.badDebt && (
                    <td className="px-3 py-2.5 text-right font-numeric-table text-error">
                      -{currencySymbol}{(Math.abs(row.badDebtAmount) * currencyRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  )}

                  {columnConfig.gatewayFee && (
                    <td className="px-3 py-2.5 text-right font-numeric-table text-outline-variant">
                      -{currencySymbol}{(Math.abs(row.gatewayFee) * currencyRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  )}

                  {columnConfig.netProfit && (
                    <td className="px-3 py-2.5 text-right font-numeric-table font-bold text-secondary">
                      +{currencySymbol}{(row.netProfit * currencyRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  )}

                  {columnConfig.netMarginRate && (
                    <td
                      className={`px-3 py-2.5 text-right font-numeric-table font-semibold ${
                        row.netMarginPercent >= 3.5
                          ? 'text-secondary'
                          : row.netMarginPercent >= 2.5
                          ? 'text-primary'
                          : 'text-error'
                      }`}
                    >
                      {row.netMarginPercent.toFixed(2)}%
                    </td>
                  )}

                  {columnConfig.profitShare && (
                    <td className="px-3 py-2.5 text-right font-numeric-table font-medium text-on-surface">
                      {row.profitContributionPercent.toFixed(2)}%
                    </td>
                  )}

                  {columnConfig.evaluationTag && (
                    <td className="px-3 py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${row.evaluationColorClass}`}>
                        {row.evaluationTag}
                      </span>
                    </td>
                  )}

                  {/* 冻结右列: 操作透视 */}
                  <td className="px-space-base py-2.5 text-right sticky right-0 bg-surface-container-lowest group-hover:bg-surface-container-low z-10">
                    <div className="flex items-center justify-end gap-1.5 text-xs text-primary font-medium">
                      <button
                        onClick={() => openDrilldown('trend', row)}
                        className="hover:underline cursor-pointer"
                      >
                        趋势
                      </button>
                      <span className="text-outline-variant">|</span>
                      <button
                        onClick={() => openDrilldown('details', row)}
                        className="hover:underline cursor-pointer"
                      >
                        品类明细
                      </button>
                      <span className="text-outline-variant">|</span>
                      {row.isRiskHigh ? (
                        <button
                          onClick={() => openDrilldown('risk', row)}
                          className="hover:underline text-error cursor-pointer"
                        >
                          风控透视
                        </button>
                      ) : (
                        <button
                          onClick={() => openDrilldown('l4', row)}
                          className="hover:underline cursor-pointer"
                        >
                          穿透L4
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Bottom Summary Row (合计 / 全网经营毛利汇总) */}
            <tfoot>
              <tr className="bg-surface-container font-semibold text-on-surface h-12 border-t-2 border-outline-variant/40">
                <td className="px-space-base py-2 sticky left-0 bg-surface-container z-10 shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">functions</span>
                    <span>合计 / 全网经营毛利汇总 ({processedRows.length}大品类)</span>
                  </div>
                </td>

                {columnConfig.gmv && (
                  <td className="px-3 py-2 text-right font-numeric-table font-bold text-on-surface">
                    {currencySymbol}{(summaryTotals.gmv * currencyRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                )}

                {columnConfig.spreadAmount && (
                  <td className="px-3 py-2 text-right font-numeric-table font-bold text-primary">
                    +{currencySymbol}{(summaryTotals.spreadAmount * currencyRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                )}

                {columnConfig.spreadRate && (
                  <td className="px-3 py-2 text-right font-numeric-table text-on-surface">
                    {summaryTotals.spreadRate.toFixed(2)}%
                  </td>
                )}

                {columnConfig.commission && (
                  <td className="px-3 py-2 text-right font-numeric-table font-bold text-error">
                    -{currencySymbol}{(Math.abs(summaryTotals.commission) * currencyRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                )}

                {columnConfig.subsidy && (
                  <td className="px-3 py-2 text-right font-numeric-table font-bold text-error">
                    -{currencySymbol}{(Math.abs(summaryTotals.subsidy) * currencyRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                )}

                {columnConfig.badDebt && (
                  <td className="px-3 py-2 text-right font-numeric-table font-bold text-error">
                    -{currencySymbol}{(Math.abs(summaryTotals.badDebt) * currencyRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                )}

                {columnConfig.gatewayFee && (
                  <td className="px-3 py-2 text-right font-numeric-table font-bold text-outline">
                    -{currencySymbol}{(Math.abs(summaryTotals.gatewayFee) * currencyRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                )}

                {columnConfig.netProfit && (
                  <td className="px-3 py-2 text-right font-numeric-table font-bold text-secondary text-sm">
                    +{currencySymbol}{(summaryTotals.netProfit * currencyRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                )}

                {columnConfig.netMarginRate && (
                  <td className="px-3 py-2 text-right font-numeric-table font-bold text-secondary">
                    {summaryTotals.netMarginRate.toFixed(2)}%
                  </td>
                )}

                {columnConfig.profitShare && (
                  <td className="px-3 py-2 text-right font-numeric-table font-bold text-on-surface">
                    100.00%
                  </td>
                )}

                {columnConfig.evaluationTag && (
                  <td className="px-3 py-2 text-center text-xs font-normal text-outline font-numeric-table">
                    综合良品率 98.6%
                  </td>
                )}

                <td className="px-space-base py-2 text-right sticky right-0 bg-surface-container z-10 shadow-[-1px_0_4px_rgba(0,0,0,0.02)]">
                  <button
                    onClick={handleExportTable}
                    className="px-2 py-1 rounded bg-primary text-on-primary text-xs font-body-sm font-medium hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
                  >
                    导出此视图
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination & High-Velocity Operational Controls */}
        <div className="px-space-base py-space-sm bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm border-t border-outline-variant/20">
          <div className="flex items-center gap-space-sm text-xs font-body-sm text-on-surface-variant">
            <span>共 {processedRows.length} 个有效统计品类 · 覆盖全网 12,380 笔流水</span>
            <span className="text-outline-variant">|</span>
            <span className="flex items-center gap-1 font-numeric-table">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              审计周期: 2026-08-01 至 2026-08-31
            </span>
          </div>

          <div className="flex items-center gap-space-sm">
            <div className="flex items-center gap-1 text-xs text-outline">
              <span>每页显示:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-surface-container-lowest px-2 py-1 rounded text-xs text-on-surface focus:outline-none cursor-pointer border border-outline-variant/30"
              >
                <option value={20}>20 条/页</option>
                <option value={50}>50 条/页</option>
                <option value={100}>100 条/页</option>
              </select>
            </div>

            <div className="flex items-center gap-1 font-numeric-table text-xs">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 flex items-center justify-center rounded bg-surface-container-lowest text-outline hover:text-on-surface transition-colors disabled:opacity-40 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <span className="px-2 font-medium text-on-surface">
                {currentPage} / 1
              </span>
              <button
                disabled={currentPage >= 1}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="w-7 h-7 flex items-center justify-center rounded bg-surface-container-lowest text-outline hover:text-on-surface transition-colors disabled:opacity-40 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 模态窗配置与穿透透视 */}
      <FinancialColumnConfigModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        columns={columnConfig}
        onSave={(newCols) => setColumnConfig(newCols)}
        onShowToast={onShowToast}
      />

      <FinancialDrilldownModal
        isOpen={isDrilldownOpen}
        type={drilldownType}
        row={drilldownRow}
        onClose={() => setIsDrilldownOpen(false)}
        onShowToast={onShowToast}
      />
    </div>
  );
};
