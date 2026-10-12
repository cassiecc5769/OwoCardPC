import React, { useState, useMemo, useEffect } from 'react';
import {
  MerchantDimensionKey,
  MerchantMultiDimensionalRow,
  MERCHANT_ROWS_DATA,
  TIER_ROWS_DATA,
  BRAND_ROWS_DATA,
  SKU_ROWS_DATA,
  REGION_ROWS_DATA,
  CHANNEL_ROWS_DATA,
  DATE_ROWS_DATA,
} from './merchantMultiDimensionalData';
import { MerchantDrilldownOrdersModal } from './MerchantDrilldownOrdersModal';
import { MerchantColumnConfigModal, ColumnOption } from './MerchantColumnConfigModal';
import { MerchantPerformanceRow } from './types';

interface MerchantMultiDimensionalReportProps {
  onShowToast: (msg: string) => void;
  onOpenExport: () => void;
  onOpenProfile?: (merchant: MerchantPerformanceRow) => void;
  initialDimension?: MerchantDimensionKey;
}

type SortField =
  | 'ordersAccepted'
  | 'ordersSuccess'
  | 'ordersFailed'
  | 'successRate'
  | 'gmvUsd'
  | 'gmvSharePercent'
  | 'avgResponseSec'
  | 'avgFulfillmentSec'
  | 'rejectRatePercent'
  | 'timeoutRatePercent'
  | 'disputeRatePercent';

export const MerchantMultiDimensionalReport: React.FC<MerchantMultiDimensionalReportProps> = ({
  onShowToast,
  onOpenExport,
  onOpenProfile,
  initialDimension,
}) => {
  // 1. 维度选择
  const [activeDimension, setActiveDimension] = useState<MerchantDimensionKey>(initialDimension || 'merchant');

  useEffect(() => {
    if (initialDimension) {
      setActiveDimension(initialDimension);
    }
  }, [initialDimension]);

  // 2. 筛选器状态
  const [selectedTier, setSelectedTier] = useState<string>('全部等级');
  const [selectedStatus, setSelectedStatus] = useState<string>('正在接单');
  const [selectedHealth, setSelectedHealth] = useState<string>('全部履约状态');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // 3. 排序状态
  const [sortField, setSortField] = useState<SortField>('gmvUsd');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 4. 分页状态
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // 5. 弹窗控制
  const [drilldownRow, setDrilldownRow] = useState<MerchantMultiDimensionalRow | null>(null);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState<boolean>(false);

  // 6. 列配置
  const [columns, setColumns] = useState<ColumnOption[]>([
    { key: 'identity', label: '统计主体 (商户/MID)', visible: true, required: true },
    { key: 'coreCards', label: '承揽核心卡种', visible: true },
    { key: 'ordersAccepted', label: '承揽接单', visible: true },
    { key: 'ordersSuccess', label: '做卡成功', visible: true },
    { key: 'ordersFailed', label: '做卡失败', visible: true },
    { key: 'successRate', label: '做卡成功率', visible: true },
    { key: 'gmvUsd', label: '承揽总 GMV (USD)', visible: true },
    { key: 'gmvSharePercent', label: 'GMV 占比', visible: true },
    { key: 'avgResponseSec', label: '平均响应', visible: true },
    { key: 'avgFulfillmentSec', label: '平均时效', visible: true },
    { key: 'rejectRatePercent', label: '主动拒单率', visible: true },
    { key: 'timeoutRatePercent', label: '超时流单', visible: true },
    { key: 'disputeRatePercent', label: '争议纠纷率', visible: true },
    { key: 'actions', label: '穿透与调度', visible: true, required: true },
  ]);

  const isColVisible = (key: string) => columns.find((c) => c.key === key)?.visible ?? true;

  // 切换列显隐
  const handleToggleColumn = (key: string) => {
    setColumns((prev) =>
      prev.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col))
    );
  };

  const handleResetColumns = () => {
    setColumns((prev) => prev.map((col) => ({ ...col, visible: true })));
    onShowToast('已重置多维报表所有指标列至初始状态');
  };

  // 对应维度的数据集
  const rawRows = useMemo(() => {
    switch (activeDimension) {
      case 'tier':
        return TIER_ROWS_DATA;
      case 'brand':
        return BRAND_ROWS_DATA;
      case 'sku':
        return SKU_ROWS_DATA;
      case 'region':
        return REGION_ROWS_DATA;
      case 'channel':
        return CHANNEL_ROWS_DATA;
      case 'date':
        return DATE_ROWS_DATA;
      case 'merchant':
      default:
        return MERCHANT_ROWS_DATA;
    }
  }, [activeDimension]);

  // 维度切换处理
  const handleDimensionChange = (dim: MerchantDimensionKey) => {
    setActiveDimension(dim);
    setCurrentPage(1);
    const dimNames: Record<MerchantDimensionKey, string> = {
      merchant: '商户主体',
      tier: '等级',
      brand: '卡品牌',
      sku: 'SKU规格',
      region: '区域',
      channel: '通道模式',
      date: '日期',
    };
    onShowToast(`已切换至【按${dimNames[dim]}】多维报表视图`);
  };

  // 筛选过滤
  const filteredRows = useMemo(() => {
    return rawRows.filter((r) => {
      // 搜索关键词
      if (searchKeyword.trim()) {
        const kw = searchKeyword.trim().toLowerCase();
        const matchName = r.name.toLowerCase().includes(kw);
        const matchCode = r.code.toLowerCase().includes(kw);
        const matchCards = r.coreCards.some((c) => c.toLowerCase().includes(kw));
        if (!matchName && !matchCode && !matchCards) return false;
      }

      // 等级过滤
      if (selectedTier !== '全部等级') {
        const cleanTier = selectedTier.split(' ')[0];
        if (!r.tier.includes(cleanTier)) return false;
      }

      // 接单状态过滤
      if (selectedStatus === '正在接单' && r.status === 'STANDBY') return false;
      if (selectedStatus === '暂停接单' && r.status !== 'STANDBY') return false;

      // 履约状态过滤
      if (selectedHealth === '健康稳健 (>98%)' && r.successRate < 98) return false;
      if (selectedHealth === '时效预警' && !r.isWarning && r.avgFulfillmentSec <= 60) return false;

      return true;
    });
  }, [rawRows, searchKeyword, selectedTier, selectedStatus, selectedHealth]);

  // 排序
  const sortedRows = useMemo(() => {
    const list = [...filteredRows];
    list.sort((a, b) => {
      const valA = a[sortField] ?? 0;
      const valB = b[sortField] ?? 0;
      if (sortOrder === 'asc') return valA - valB;
      return valB - valA;
    });
    return list;
  }, [filteredRows, sortField, sortOrder]);

  // 分页数据
  const totalRecords = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageRows = sortedRows.slice(startIndex, startIndex + pageSize);

  // 切换排序
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // 重置筛选
  const handleResetFilters = () => {
    setSelectedTier('全部等级');
    setSelectedStatus('全部状态');
    setSelectedHealth('全部履约状态');
    setSearchKeyword('');
    setSortField('gmvUsd');
    setSortOrder('desc');
    setCurrentPage(1);
    onShowToast('报表筛选条件已全部重置');
  };

  // 计算当前页/汇总数据
  const totals = useMemo(() => {
    const target = pageRows.length > 0 ? pageRows : sortedRows;
    const accepted = target.reduce((s, r) => s + r.ordersAccepted, 0);
    const success = target.reduce((s, r) => s + r.ordersSuccess, 0);
    const failed = target.reduce((s, r) => s + r.ordersFailed, 0);
    const gmv = target.reduce((s, r) => s + r.gmvUsd, 0);
    const overallSuccessRate = accepted > 0 ? ((success / accepted) * 100).toFixed(2) : '98.63';
    const avgResp =
      target.length > 0
        ? (target.reduce((s, r) => s + r.avgResponseSec, 0) / target.length).toFixed(1)
        : '14.2';
    const avgFulfill =
      target.length > 0
        ? (target.reduce((s, r) => s + r.avgFulfillmentSec, 0) / target.length).toFixed(1)
        : '38.4';
    const avgReject =
      target.length > 0
        ? (target.reduce((s, r) => s + r.rejectRatePercent, 0) / target.length).toFixed(2)
        : '0.74';
    const avgTimeout =
      target.length > 0
        ? (target.reduce((s, r) => s + r.timeoutRatePercent, 0) / target.length).toFixed(2)
        : '0.31';
    const avgDispute =
      target.length > 0
        ? (target.reduce((s, r) => s + r.disputeRatePercent, 0) / target.length).toFixed(2)
        : '0.14';

    return {
      count: target.length,
      accepted,
      success,
      failed,
      gmv,
      overallSuccessRate,
      avgResp,
      avgFulfill,
      avgReject,
      avgTimeout,
      avgDispute,
    };
  }, [pageRows, sortedRows]);

  // 处理调度指令按钮点击
  const handleExecuteAction = (row: MerchantMultiDimensionalRow) => {
    if (row.actionType === 'downgrade') {
      onShowToast(`已对 [${row.name}] 触发防爆仓【降级控流】策略，接单权重降级 40%`);
    } else if (row.actionType === 'dispatch') {
      onShowToast(`已为 [${row.name}] 提升调度优先级，承接全网兜底急单`);
    } else {
      onShowToast(`已执行 [${row.name}] 的【供需平衡】调配，质押金池与额度已刷新联动`);
    }
  };

  // 穿透至商户档案弹窗
  const handleOpenMerchantProfile = (row: MerchantMultiDimensionalRow) => {
    if (onOpenProfile) {
      const mockMerchant: MerchantPerformanceRow = {
        merchantId: row.code.replace('MID: ', ''),
        merchantName: row.name,
        channelDesc: row.coreCards.join(' / '),
        tier: row.tier.includes('Tier-S') ? 'Tier-S' : row.tier.includes('Tier-A') ? 'Tier-A' : 'Tier-B',
        majorCards: row.coreCards.join(', '),
        fulfilledOrderCount: row.ordersSuccess,
        verifiedGmvUsd: row.gmvUsd,
        successRate: row.successRate,
        avgResponseSeconds: row.avgResponseSec,
        totalDurationText: `${row.avgFulfillmentSec.toFixed(1)}s`,
        activeRejectRate: row.rejectRatePercent,
        performanceScore: Math.round(row.successRate * 0.95),
        isHighLatency: row.avgFulfillmentSec > 60,
        isHighReject: row.rejectRatePercent > 2.0,
        collateralUsd: Math.round(row.creditLimitUsd * 0.4),
        creditLimitDailyUsd: row.creditLimitUsd,
        usedCreditUsd: Math.round(row.gmvUsd * 0.8),
        settlementCurrency: 'USD',
        contactPerson: '承揽责任工程师',
        telegramAccount: '@merchant_ops_direct',
        disputeCaseCount: Math.round(row.ordersAccepted * (row.disputeRatePercent / 100)),
      };
      onOpenProfile(mockMerchant);
    } else {
      onShowToast(`正在调取商户档案画像: ${row.name} (${row.code})`);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-space-md antialiased pb-20">
      {/* ================= CORE SUMMARY METRICS (PRD 9.5) ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/30 shadow-sm">
        {/* Card 1: 在线接单商户 */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-surface-container-low/40 border border-outline-variant/20">
          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[18px]">store</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-caps text-[11px] text-outline truncate">在线接单商户</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-numeric-stat text-[18px] font-bold text-on-surface">88</span>
              <span className="text-[11px] font-body-sm text-secondary font-medium">
                74家活跃 (318席)
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: 今日承揽卡单量 */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-surface-container-low/40 border border-outline-variant/20">
          <div className="w-8 h-8 rounded bg-tertiary/10 flex items-center justify-center text-tertiary shrink-0">
            <span className="material-symbols-outlined text-[18px]">credit_card</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-caps text-[11px] text-outline truncate">今日承揽卡单量</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-numeric-stat text-[18px] font-bold text-on-surface">12,380</span>
              <span className="text-[11px] font-body-sm text-secondary font-medium">
                +8.4% · 12,210成
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: 综合履约成功率 */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-surface-container-low/40 border border-outline-variant/20">
          <div className="w-8 h-8 rounded bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
            <span className="material-symbols-outlined text-[18px]">verified</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-caps text-[11px] text-outline truncate">综合履约成功率</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-numeric-stat text-[18px] font-bold text-secondary">98.63%</span>
              <span className="text-[11px] font-numeric-table text-outline">做卡38.4s</span>
            </div>
          </div>
        </div>

        {/* Card 4: 承揽总 GMV */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-surface-container-low/40 border border-outline-variant/20">
          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[18px]">monetization_on</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-caps text-[11px] text-outline truncate">
              承揽总 GMV (USD)
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-numeric-stat text-[18px] font-bold text-primary">
                $1,428,500
              </span>
              <span className="text-[11px] font-label-caps text-outline">TOP1占32.4%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= GLOBAL FILTER & DIMENSION SELECTOR BAR (PRD 3.2, 7.6) ================= */}
      <div className="bg-surface-container-lowest rounded-xl px-space-base py-2 shadow-sm border border-outline-variant/30 flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex flex-wrap items-center gap-space-sm">
          {/* Dimension Selector Buttons */}
          <div className="inline-flex rounded-md bg-surface-container-low p-0.5 border border-outline-variant/25 shrink-0">
            <button
              onClick={() => handleDimensionChange('merchant')}
              className={`px-2.5 py-1 rounded text-xs font-body-sm transition-all cursor-pointer ${
                activeDimension === 'merchant'
                  ? 'font-semibold bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              按商户主体
            </button>
            <button
              onClick={() => handleDimensionChange('tier')}
              className={`px-2.5 py-1 rounded text-xs font-body-sm transition-all cursor-pointer ${
                activeDimension === 'tier'
                  ? 'font-semibold bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              按等级
            </button>
            <button
              onClick={() => handleDimensionChange('brand')}
              className={`px-2.5 py-1 rounded text-xs font-body-sm transition-all cursor-pointer ${
                activeDimension === 'brand'
                  ? 'font-semibold bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              按卡品牌
            </button>
            <button
              onClick={() => handleDimensionChange('sku')}
              className={`px-2.5 py-1 rounded text-xs font-body-sm transition-all cursor-pointer ${
                activeDimension === 'sku'
                  ? 'font-semibold bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              按SKU
            </button>
            <button
              onClick={() => handleDimensionChange('region')}
              className={`px-2.5 py-1 rounded text-xs font-body-sm transition-all cursor-pointer ${
                activeDimension === 'region'
                  ? 'font-semibold bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              按区域
            </button>
            <button
              onClick={() => handleDimensionChange('channel')}
              className={`px-2.5 py-1 rounded text-xs font-body-sm transition-all cursor-pointer ${
                activeDimension === 'channel'
                  ? 'font-semibold bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              按通道模式
            </button>
            <button
              onClick={() => handleDimensionChange('date')}
              className={`px-2.5 py-1 rounded text-xs font-body-sm transition-all cursor-pointer ${
                activeDimension === 'date'
                  ? 'font-semibold bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              按日期
            </button>
          </div>

          <div className="h-4 w-px bg-outline-variant/30 hidden md:block" />

          {/* Dropdown Filters */}
          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={selectedTier}
              onChange={(e) => {
                setSelectedTier(e.target.value);
                setCurrentPage(1);
              }}
              className="h-7 pl-2 pr-6 text-xs font-body-sm bg-surface rounded border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary cursor-pointer"
            >
              <option>全部等级</option>
              <option>Tier-S 战略自营</option>
              <option>Tier-A 优质核心</option>
              <option>Tier-B 标准合作</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="h-7 pl-2 pr-6 text-xs font-body-sm bg-surface rounded border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary cursor-pointer"
            >
              <option>正在接单</option>
              <option>暂停接单</option>
              <option>全部状态</option>
            </select>

            <select
              value={selectedHealth}
              onChange={(e) => {
                setSelectedHealth(e.target.value);
                setCurrentPage(1);
              }}
              className="h-7 pl-2 pr-6 text-xs font-body-sm bg-surface rounded border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary cursor-pointer"
            >
              <option>全部履约状态</option>
              <option>健康稳健 (&gt;98%)</option>
              <option>时效预警</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <span className="material-symbols-outlined text-[15px] text-outline absolute left-2 top-1.5 pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="搜索商户 / MID..."
              className="h-7 pl-7 pr-2.5 w-44 text-xs font-body-sm bg-surface rounded border border-outline-variant/40 text-on-surface placeholder-outline focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onShowToast('已按所选维度及筛选条件完成即时计算！')}
            className="h-7 px-2.5 rounded bg-primary text-on-primary font-body-sm text-xs font-medium hover:bg-primary/90 flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">filter_alt</span>
            <span>筛选</span>
          </button>
          <button
            onClick={handleResetFilters}
            className="h-7 px-2 rounded bg-surface border border-outline-variant/40 font-body-sm text-xs text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
          >
            重置
          </button>
          <div className="h-4 w-px bg-outline-variant/30 mx-0.5" />
          <button
            onClick={() => setIsColumnModalOpen(true)}
            className="h-7 px-2 rounded bg-surface border border-outline-variant/40 font-body-sm text-xs text-on-surface-variant hover:bg-surface-container flex items-center gap-1 transition-colors cursor-pointer"
            title="自定义显示指标列"
          >
            <span className="material-symbols-outlined text-[14px]">view_column</span>
            <span>指标</span>
          </button>
          <button
            onClick={onOpenExport}
            className="h-7 px-2.5 rounded bg-surface border border-outline-variant/40 font-body-sm text-xs text-on-surface-variant hover:bg-surface-container flex items-center gap-1 transition-colors cursor-pointer"
            title="导出当前报表"
          >
            <span className="material-symbols-outlined text-[14px]">download</span>
            <span>导出</span>
          </button>
        </div>
      </div>

      {/* ================= MULTIDIMENSIONAL HIGH-DENSITY MERCHANT REPORT TABLE (PRD 7.6) ================= */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden flex flex-col">
        {/* Table Toolbar Stats */}
        <div className="px-space-base py-2.5 bg-surface-container-low/60 border-b border-outline-variant/20 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-body-sm">
            <span className="font-semibold text-on-surface">承揽主体明细清单</span>
            <span className="text-outline">·</span>
            <span className="text-on-surface-variant">
              当前展示: <strong className="font-numeric-table text-on-surface">{pageRows.length}</strong>{' '}
              家核心承揽商 (共筛选出 {totalRecords} 实体)
            </span>
            <span className="text-outline">·</span>
            <span className="font-code-token text-[11px] text-outline">
              数据口径: 净成功核销与做卡全链路SLA
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-body-sm text-outline">排序标准:</span>
            <span className="text-xs font-numeric-table font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
              {sortField === 'gmvUsd'
                ? '承揽 GMV'
                : sortField === 'ordersAccepted'
                ? '承揽接单'
                : sortField === 'successRate'
                ? '做卡成功率'
                : sortField === 'avgFulfillmentSec'
                ? '平均时效'
                : sortField}{' '}
              ({sortOrder === 'desc' ? '降序 ↓' : '升序 ↑'})
            </span>
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[1380px]">
            <thead>
              <tr className="h-9 bg-surface-container-low/90 text-outline border-b border-outline-variant/30 select-none text-xs">
                {/* 统计主体 */}
                {isColVisible('identity') && (
                  <th className="px-space-sm pl-space-base text-left font-label-caps uppercase sticky left-0 bg-surface-container-low/95 z-10 w-64 shadow-[1px_0_0_rgba(195,198,215,0.3)]">
                    <div
                      onClick={() => handleSort('gmvUsd')}
                      className="flex items-center gap-1 cursor-pointer hover:text-on-surface"
                    >
                      <span>
                        {activeDimension === 'brand'
                          ? '卡品牌 / 代号'
                          : activeDimension === 'tier'
                          ? '等级类别 / 商户数'
                          : activeDimension === 'sku'
                          ? '卡种规格 / SKU'
                          : activeDimension === 'region'
                          ? '所属大区 / 币种'
                          : activeDimension === 'date'
                          ? '交易日期'
                          : '统计主体 (商户/MID)'}
                      </span>
                      <span className="material-symbols-outlined text-[13px]">unfold_more</span>
                    </div>
                  </th>
                )}

                {/* 承揽核心卡种 */}
                {isColVisible('coreCards') && (
                  <th className="px-space-sm text-left font-label-caps uppercase">
                    承揽核心卡种
                  </th>
                )}

                {/* 承揽接单 */}
                {isColVisible('ordersAccepted') && (
                  <th className="px-space-sm text-right font-label-caps uppercase">
                    <div
                      onClick={() => handleSort('ordersAccepted')}
                      className="inline-flex items-center gap-0.5 cursor-pointer hover:text-on-surface"
                    >
                      <span>承揽接单</span>
                      <span
                        className={`material-symbols-outlined text-[13px] ${
                          sortField === 'ordersAccepted' ? 'text-primary' : 'text-outline'
                        }`}
                      >
                        {sortField === 'ordersAccepted' && sortOrder === 'asc'
                          ? 'arrow_upward'
                          : 'arrow_downward'}
                      </span>
                    </div>
                  </th>
                )}

                {/* 做卡成功 */}
                {isColVisible('ordersSuccess') && (
                  <th className="px-space-sm text-right font-label-caps uppercase">
                    做卡成功
                  </th>
                )}

                {/* 做卡失败 */}
                {isColVisible('ordersFailed') && (
                  <th className="px-space-sm text-right font-label-caps uppercase">
                    做卡失败
                  </th>
                )}

                {/* 做卡成功率 */}
                {isColVisible('successRate') && (
                  <th className="px-space-sm text-center font-label-caps uppercase">
                    <div
                      onClick={() => handleSort('successRate')}
                      className="inline-flex items-center gap-0.5 cursor-pointer hover:text-on-surface"
                    >
                      <span>做卡成功率</span>
                      <span
                        className={`material-symbols-outlined text-[13px] ${
                          sortField === 'successRate' ? 'text-primary' : 'text-outline'
                        }`}
                      >
                        {sortField === 'successRate' && sortOrder === 'asc'
                          ? 'arrow_upward'
                          : 'arrow_downward'}
                      </span>
                    </div>
                  </th>
                )}

                {/* 承揽总 GMV (USD) */}
                {isColVisible('gmvUsd') && (
                  <th className="px-space-sm text-right font-label-caps uppercase">
                    <div
                      onClick={() => handleSort('gmvUsd')}
                      className="inline-flex items-center gap-0.5 cursor-pointer hover:text-on-surface"
                    >
                      <span>承揽总 GMV (USD)</span>
                      <span
                        className={`material-symbols-outlined text-[13px] ${
                          sortField === 'gmvUsd' ? 'text-primary' : 'text-outline'
                        }`}
                      >
                        {sortField === 'gmvUsd' && sortOrder === 'asc'
                          ? 'arrow_upward'
                          : 'arrow_downward'}
                      </span>
                    </div>
                  </th>
                )}

                {/* GMV 占比 */}
                {isColVisible('gmvSharePercent') && (
                  <th className="px-space-sm text-right font-label-caps uppercase">
                    GMV 占比
                  </th>
                )}

                {/* 平均响应 */}
                {isColVisible('avgResponseSec') && (
                  <th className="px-space-sm text-right font-label-caps uppercase">
                    平均响应
                  </th>
                )}

                {/* 平均时效 */}
                {isColVisible('avgFulfillmentSec') && (
                  <th className="px-space-sm text-right font-label-caps uppercase">
                    <div
                      onClick={() => handleSort('avgFulfillmentSec')}
                      className="inline-flex items-center gap-0.5 cursor-pointer hover:text-on-surface"
                    >
                      <span>平均时效</span>
                      <span
                        className={`material-symbols-outlined text-[13px] ${
                          sortField === 'avgFulfillmentSec' ? 'text-primary' : 'text-outline'
                        }`}
                      >
                        {sortField === 'avgFulfillmentSec' && sortOrder === 'asc'
                          ? 'arrow_upward'
                          : 'arrow_downward'}
                      </span>
                    </div>
                  </th>
                )}

                {/* 主动拒单率 */}
                {isColVisible('rejectRatePercent') && (
                  <th className="px-space-sm text-right font-label-caps uppercase">
                    主动拒单率
                  </th>
                )}

                {/* 超时流单 */}
                {isColVisible('timeoutRatePercent') && (
                  <th className="px-space-sm text-right font-label-caps uppercase">
                    超时流单
                  </th>
                )}

                {/* 争议纠纷率 */}
                {isColVisible('disputeRatePercent') && (
                  <th className="px-space-sm text-right font-label-caps uppercase">
                    争议纠纷率
                  </th>
                )}

                {/* 穿透与调度 */}
                {isColVisible('actions') && (
                  <th className="px-space-sm pr-space-base text-center font-label-caps uppercase sticky right-0 bg-surface-container-low/95 z-10 shadow-[-1px_0_0_rgba(195,198,215,0.3)]">
                    穿透与调度
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-outline-variant/15 text-xs font-body-sm">
              {pageRows.map((row) => {
                const isWarn = row.isWarning;
                return (
                  <tr
                    key={row.id}
                    className={`h-10 hover:bg-surface-container-low/50 transition-colors group ${
                      isWarn ? 'bg-error-container/5' : ''
                    }`}
                  >
                    {/* 统计主体 */}
                    {isColVisible('identity') && (
                      <td className="px-space-sm pl-space-base sticky left-0 bg-surface-container-lowest group-hover:bg-surface-container-low/50 transition-colors shadow-[1px_0_0_rgba(195,198,215,0.2)]">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              row.status === 'WARNING'
                                ? 'bg-error animate-pulse'
                                : row.actionType === 'dispatch'
                                ? 'bg-secondary-container'
                                : 'bg-secondary'
                            }`}
                            title={
                              row.status === 'WARNING'
                                ? '时效预警 · 负载偏高'
                                : '正在接单 · 充裕'
                            }
                          />
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-headline-sm text-xs font-bold text-on-surface truncate">
                                {row.name}
                              </span>
                              <span
                                className={`px-1 py-0.2 rounded text-[10px] font-label-caps font-semibold border ${
                                  row.tier.includes('Tier-S')
                                    ? 'bg-primary/10 text-primary border-primary/20'
                                    : row.tier.includes('Tier-A')
                                    ? 'bg-secondary-container/50 text-on-secondary-container border-secondary/20'
                                    : row.tier.includes('自营')
                                    ? 'bg-tertiary-fixed text-on-tertiary-fixed border-tertiary/20'
                                    : 'bg-surface-container-high text-outline border-outline-variant/30'
                                }`}
                              >
                                {row.tier}
                              </span>
                            </div>
                            <span
                              className={`font-code-token text-[11px] ${
                                isWarn ? 'text-error font-medium' : 'text-outline'
                              }`}
                            >
                              {row.code} · 额度 ${(row.creditLimitUsd / 1000).toFixed(0)}k
                            </span>
                          </div>
                        </div>
                      </td>
                    )}

                    {/* 承揽核心卡种 */}
                    {isColVisible('coreCards') && (
                      <td className="px-space-sm">
                        <div className="flex items-center gap-1 flex-wrap">
                          {row.coreCards.map((card, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-surface-container text-[11px] font-medium text-on-surface whitespace-nowrap"
                            >
                              {card}
                            </span>
                          ))}
                        </div>
                      </td>
                    )}

                    {/* 承揽接单 */}
                    {isColVisible('ordersAccepted') && (
                      <td className="px-space-sm text-right font-numeric-table font-semibold text-on-surface">
                        {row.ordersAccepted.toLocaleString()}
                      </td>
                    )}

                    {/* 做卡成功 */}
                    {isColVisible('ordersSuccess') && (
                      <td className="px-space-sm text-right font-numeric-table text-secondary font-medium">
                        {row.ordersSuccess.toLocaleString()}
                      </td>
                    )}

                    {/* 做卡失败 */}
                    {isColVisible('ordersFailed') && (
                      <td
                        className={`px-space-sm text-right font-numeric-table ${
                          isWarn ? 'text-error font-semibold' : 'text-outline'
                        }`}
                      >
                        {row.ordersFailed}
                      </td>
                    )}

                    {/* 做卡成功率 */}
                    {isColVisible('successRate') && (
                      <td className="px-space-sm text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-numeric-table font-semibold ${
                            row.successRate >= 99
                              ? 'bg-secondary/15 text-secondary'
                              : row.successRate >= 98
                              ? 'bg-secondary/15 text-secondary'
                              : 'bg-error-container text-on-error-container border border-error/20 font-bold'
                          }`}
                        >
                          {row.successRate.toFixed(2)}%
                        </span>
                      </td>
                    )}

                    {/* 承揽总 GMV (USD) */}
                    {isColVisible('gmvUsd') && (
                      <td className="px-space-sm text-right font-numeric-table font-bold text-on-surface">
                        ${row.gmvUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    )}

                    {/* GMV 占比 */}
                    {isColVisible('gmvSharePercent') && (
                      <td className="px-space-sm text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="w-12 h-1.5 rounded-full bg-surface-container overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${Math.min(100, row.gmvSharePercent)}%` }}
                            />
                          </div>
                          <span className="font-numeric-table text-[11px] font-medium text-on-surface w-10 text-right">
                            {row.gmvSharePercent.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    )}

                    {/* 平均响应 */}
                    {isColVisible('avgResponseSec') && (
                      <td
                        className={`px-space-sm text-right font-numeric-table ${
                          row.avgResponseSec > 25 ? 'text-error font-medium' : 'text-on-surface'
                        }`}
                      >
                        {row.avgResponseSec.toFixed(1)}s
                      </td>
                    )}

                    {/* 平均时效 */}
                    {isColVisible('avgFulfillmentSec') && (
                      <td
                        className={`px-space-sm text-right font-numeric-table ${
                          row.avgFulfillmentSec > 60
                            ? 'text-error font-bold'
                            : row.avgFulfillmentSec <= 30
                            ? 'text-secondary font-semibold'
                            : 'text-on-surface'
                        }`}
                      >
                        {row.avgFulfillmentSec.toFixed(1)}s
                      </td>
                    )}

                    {/* 主动拒单率 */}
                    {isColVisible('rejectRatePercent') && (
                      <td
                        className={`px-space-sm text-right font-numeric-table ${
                          row.rejectRatePercent > 2.0 ? 'text-error font-semibold' : 'text-outline'
                        }`}
                      >
                        {row.rejectRatePercent.toFixed(2)}%
                      </td>
                    )}

                    {/* 超时流单 */}
                    {isColVisible('timeoutRatePercent') && (
                      <td
                        className={`px-space-sm text-right font-numeric-table ${
                          row.timeoutRatePercent > 1.0 ? 'text-error font-semibold' : 'text-outline'
                        }`}
                      >
                        {row.timeoutRatePercent.toFixed(2)}%
                      </td>
                    )}

                    {/* 争议纠纷率 */}
                    {isColVisible('disputeRatePercent') && (
                      <td
                        className={`px-space-sm text-right font-numeric-table ${
                          row.disputeRatePercent > 0.5 ? 'text-error font-medium' : 'text-outline'
                        }`}
                      >
                        {row.disputeRatePercent.toFixed(2)}%
                      </td>
                    )}

                    {/* 穿透与调度 (sticky right-0) */}
                    {isColVisible('actions') && (
                      <td className="px-space-sm pr-space-base text-center sticky right-0 bg-surface-container-lowest group-hover:bg-surface-container-low/50 transition-colors shadow-[-1px_0_0_rgba(195,198,215,0.2)]">
                        <div className="flex items-center justify-center gap-1">
                          {/* 调度动作按钮 */}
                          <button
                            onClick={() => handleExecuteAction(row)}
                            className={`px-2 py-0.5 rounded text-[11px] font-body-sm transition-colors cursor-pointer ${
                              row.actionType === 'downgrade'
                                ? 'bg-error-container text-on-error-container hover:bg-error hover:text-on-error font-medium'
                                : row.actionType === 'dispatch'
                                ? 'bg-surface border border-outline-variant/30 text-primary hover:bg-primary hover:text-on-primary font-medium'
                                : 'bg-surface border border-outline-variant/30 text-primary hover:bg-primary hover:text-on-primary'
                            }`}
                          >
                            {row.actionLabel}
                          </button>

                          {/* 穿透商户管理 (MID) */}
                          <button
                            onClick={() => handleOpenMerchantProfile(row)}
                            className="p-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                            title={`穿透商户管理档案 (${row.code})`}
                          >
                            <span className="material-symbols-outlined text-[15px]">badge</span>
                          </button>

                          {/* 查看原始卡单明细流水 */}
                          <button
                            onClick={() => setDrilldownRow(row)}
                            className="p-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                            title="查看原始卡单明细流水"
                          >
                            <span className="material-symbols-outlined text-[15px]">receipt</span>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>

            {/* TOTAL SUMMARY FOOTER ROW */}
            <tfoot className="bg-surface-container-low font-semibold text-on-surface border-t-2 border-outline-variant/40">
              <tr className="h-10 text-xs">
                {isColVisible('identity') && (
                  <td className="px-space-sm pl-space-base sticky left-0 bg-surface-container-low z-10 shadow-[1px_0_0_rgba(195,198,215,0.3)]">
                    <div className="flex items-center gap-2">
                      <span className="font-headline-sm text-xs font-bold">
                        当前页汇总 / 全网核销
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-code-token bg-primary/10 text-primary">
                        {totals.count}家核心
                      </span>
                    </div>
                  </td>
                )}

                {isColVisible('coreCards') && (
                  <td className="px-space-sm text-xs font-body-sm text-outline">
                    覆盖全部 18 卡种
                  </td>
                )}

                {isColVisible('ordersAccepted') && (
                  <td className="px-space-sm text-right font-numeric-table font-bold">
                    {totals.accepted.toLocaleString()} 笔
                  </td>
                )}

                {isColVisible('ordersSuccess') && (
                  <td className="px-space-sm text-right font-numeric-table font-bold text-secondary">
                    {totals.success.toLocaleString()} 笔
                  </td>
                )}

                {isColVisible('ordersFailed') && (
                  <td className="px-space-sm text-right font-numeric-table font-bold text-error">
                    {totals.failed} 笔
                  </td>
                )}

                {isColVisible('successRate') && (
                  <td className="px-space-sm text-center">
                    <span className="px-2 py-0.5 rounded-full text-xs font-numeric-table font-bold bg-secondary text-on-secondary">
                      {totals.overallSuccessRate}%
                    </span>
                  </td>
                )}

                {isColVisible('gmvUsd') && (
                  <td className="px-space-sm text-right font-numeric-table font-bold text-primary text-body-md">
                    ${totals.gmv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                )}

                {isColVisible('gmvSharePercent') && (
                  <td className="px-space-sm text-right font-numeric-table font-bold">
                    100.0%
                  </td>
                )}

                {isColVisible('avgResponseSec') && (
                  <td className="px-space-sm text-right font-numeric-table">
                    {totals.avgResp}s 均值
                  </td>
                )}

                {isColVisible('avgFulfillmentSec') && (
                  <td className="px-space-sm text-right font-numeric-table font-bold text-secondary">
                    {totals.avgFulfill}s 均值
                  </td>
                )}

                {isColVisible('rejectRatePercent') && (
                  <td className="px-space-sm text-right font-numeric-table text-on-surface-variant">
                    {totals.avgReject}%
                  </td>
                )}

                {isColVisible('timeoutRatePercent') && (
                  <td className="px-space-sm text-right font-numeric-table text-on-surface-variant">
                    {totals.avgTimeout}%
                  </td>
                )}

                {isColVisible('disputeRatePercent') && (
                  <td className="px-space-sm text-right font-numeric-table text-on-surface-variant">
                    {totals.avgDispute}%
                  </td>
                )}

                {isColVisible('actions') && (
                  <td className="px-space-sm pr-space-base text-center sticky right-0 bg-surface-container-low z-10 shadow-[-1px_0_0_rgba(195,198,215,0.3)]">
                    <button
                      onClick={() => onShowToast('已调起做卡调度引擎，正在平衡 74 家在线商户接单权重与质押限额')}
                      className="px-2 py-1 rounded bg-primary text-on-primary text-[11px] font-body-sm font-medium hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
                    >
                      全局均衡调度
                    </button>
                  </td>
                )}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Table Pagination & Page Size Control */}
        <div className="px-space-base py-space-sm bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-space-sm border-t border-outline-variant/20">
          <div className="flex items-center gap-2 text-xs font-body-sm text-on-surface-variant">
            <span>
              显示第 {startIndex + 1} 至 {Math.min(startIndex + pageSize, totalRecords)} 条，共{' '}
              {totalRecords} 条商户记录
            </span>
            <span className="text-outline-variant">|</span>
            <div className="flex items-center gap-1">
              <span>每页行数:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-6 px-1.5 text-xs font-numeric-table bg-surface rounded border border-outline-variant/40 text-on-surface cursor-pointer"
              >
                <option value={10}>10 条/页</option>
                <option value={20}>20 条/页</option>
                <option value={50}>50 条/页</option>
                <option value={100}>100 条/页</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 flex items-center justify-center rounded border border-outline-variant/30 text-outline hover:text-on-surface disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-7 h-7 flex items-center justify-center rounded font-numeric-table text-xs cursor-pointer transition-colors ${
                  currentPage === p
                    ? 'bg-primary text-on-primary font-bold shadow-xs'
                    : 'border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-7 h-7 flex items-center justify-center rounded border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= BATCH ACTION DOCK (STICKY INTERACTION HELPER) ================= */}
      <div
        className="fixed bottom-4 left-64 right-6 bg-inverse-surface text-inverse-on-surface rounded-xl p-space-sm shadow-xl flex items-center justify-between z-30 transition-all transform translate-y-0 border border-outline-variant/20"
        id="batchActionDock"
      >
        <div className="flex items-center gap-space-base pl-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary-container animate-ping" />
            <span className="text-xs font-body-sm font-semibold">快速承揽容量管控:</span>
            <span className="text-xs font-code-token text-inverse-primary">
              74 家承揽商运行中 · 1 家时效异常需干预
            </span>
          </div>
          <span className="hidden md:inline-block text-outline-variant text-xs">|</span>
          <div className="hidden md:flex items-center gap-3 text-xs font-body-sm text-inverse-on-surface/80">
            <span>
              全网做卡中队列:{' '}
              <strong className="font-numeric-table text-secondary-fixed">48 笔</strong>
            </span>
            <span>
              平均排队等待:{' '}
              <strong className="font-numeric-table text-inverse-primary">4.2 秒</strong>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onShowToast('【做卡调度引擎】已触发 74 家在线商户权重重算，预计 3 秒内按保证金充裕度与历史SLA履约时效完成动态调配。')
            }
            className="h-7 px-3 rounded bg-primary text-on-primary text-xs font-body-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">tune</span>
            <span>动态配额重算</span>
          </button>
          <button
            onClick={() => onShowToast('实时做卡排队流水已刷新同步，目前无堆积与阻塞')}
            className="h-7 px-2.5 rounded bg-surface-container-highest/20 text-inverse-on-surface text-xs font-body-sm hover:bg-surface-container-highest/30 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">refresh</span>
            <span>刷新流水</span>
          </button>
        </div>
      </div>

      {/* 穿透卡单流水弹窗 */}
      <MerchantDrilldownOrdersModal
        isOpen={!!drilldownRow}
        onClose={() => setDrilldownRow(null)}
        row={drilldownRow}
        onShowToast={onShowToast}
      />

      {/* 指标列配置弹窗 */}
      <MerchantColumnConfigModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        columns={columns}
        onToggleColumn={handleToggleColumn}
        onResetColumns={handleResetColumns}
      />
    </div>
  );
};
