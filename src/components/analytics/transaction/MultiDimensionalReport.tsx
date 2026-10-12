import React, { useState, useMemo } from 'react';
import {
  DimensionKey,
  MultiDimensionalRowItem,
  SKU_DIMENSION_ROWS,
  BRAND_DIMENSION_ROWS,
  MERCHANT_DIMENSION_ROWS,
  DATE_DIMENSION_ROWS,
  CHANNEL_DIMENSION_ROWS,
} from './multiDimensionalData';
import { MultiDimensionalTrendModal } from './MultiDimensionalTrendModal';
import { MultiDimensionalDrilldownModal } from './MultiDimensionalDrilldownModal';

interface MultiDimensionalReportProps {
  onShowToast: (msg: string) => void;
  onOpenExport?: () => void;
}

type SortKey =
  | 'submittedCount'
  | 'successCount'
  | 'failedCount'
  | 'successRate'
  | 'submittedFaceValue'
  | 'settledGmv'
  | 'aov'
  | 'discountRate'
  | 'avgDurationSec'
  | 'timeoutRate'
  | 'disputeRate';

export const MultiDimensionalReport: React.FC<MultiDimensionalReportProps> = ({
  onShowToast,
  onOpenExport,
}) => {
  // Dimension state
  const [activeDimension, setActiveDimension] = useState<DimensionKey>('sku');

  // Filter states
  const [selectedBrand, setSelectedBrand] = useState('全部品牌 (All)');
  const [selectedGeo, setSelectedGeo] = useState('全部地区 (Geo)');
  const [selectedMerchant, setSelectedMerchant] = useState('全部商户 (86家)');
  const [selectedStatus, setSelectedStatus] = useState('全部状态');
  const [dateRangeText, setDateRangeText] = useState('近7天 (08-20 ~ 08-27)');

  // Sorting state
  const [sortField, setSortField] = useState<SortKey>('settledGmv');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [trendItem, setTrendItem] = useState<MultiDimensionalRowItem | null>(null);
  const [drilldownItem, setDrilldownItem] = useState<MultiDimensionalRowItem | null>(null);

  // Raw rows by dimension
  const rawRows = useMemo(() => {
    switch (activeDimension) {
      case 'brand':
        return BRAND_DIMENSION_ROWS;
      case 'merchant':
        return MERCHANT_DIMENSION_ROWS;
      case 'date':
        return DATE_DIMENSION_ROWS;
      case 'channel':
        return CHANNEL_DIMENSION_ROWS;
      case 'sku':
      default:
        return SKU_DIMENSION_ROWS;
    }
  }, [activeDimension]);

  // Apply filters
  const filteredRows = useMemo(() => {
    return rawRows.filter((r) => {
      if (selectedBrand !== '全部品牌 (All)') {
        if (!r.brand.includes(selectedBrand.replace(' (All)', '')) && !r.name.includes(selectedBrand)) {
          return false;
        }
      }
      if (selectedGeo !== '全部地区 (Geo)') {
        const cleanGeo = selectedGeo.split(' ')[0];
        if (!r.geo.includes(cleanGeo)) return false;
      }
      if (selectedMerchant !== '全部商户 (86家)') {
        const mchId = selectedMerchant.split(' ')[0];
        if (r.code !== mchId && (!r.merchant || !r.merchant.includes(mchId))) {
          // If in merchant dimension, match code
          if (r.dimension === 'merchant' && r.code !== mchId) return false;
        }
      }
      if (selectedStatus === '风控冻结' && !r.isWarning) return false;
      if (selectedStatus === '面值不符' && r.disputeRate < 0.5) return false;
      return true;
    });
  }, [rawRows, selectedBrand, selectedGeo, selectedMerchant, selectedStatus]);

  // Sorted rows
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

  // Paginated rows
  const totalItems = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageRows = sortedRows.slice(startIndex, startIndex + pageSize);

  // Column sort toggler
  const handleSort = (field: SortKey) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Dimension switch handler
  const handleDimensionChange = (dim: DimensionKey) => {
    setActiveDimension(dim);
    setCurrentPage(1);
    const names: Record<DimensionKey, string> = {
      brand: '卡品牌',
      sku: '卡种规格 (SKU)',
      merchant: '商户主体',
      date: '交易日期',
      channel: '渠道',
    };
    onShowToast(`已切换至【${names[dim]}】多维聚合视图`);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSelectedBrand('全部品牌 (All)');
    setSelectedGeo('全部地区 (Geo)');
    setSelectedMerchant('全部商户 (86家)');
    setSelectedStatus('全部状态');
    setDateRangeText('近7天 (08-20 ~ 08-27)');
    setSortField('settledGmv');
    setSortOrder('desc');
    setCurrentPage(1);
    onShowToast('报表筛选条件已重置');
  };

  // Calculate totals for footer
  const footerTotals = useMemo(() => {
    const targetRows = pageRows.length > 0 ? pageRows : sortedRows;
    const submitted = targetRows.reduce((s, r) => s + r.submittedCount, 0);
    const success = targetRows.reduce((s, r) => s + r.successCount, 0);
    const failed = targetRows.reduce((s, r) => s + r.failedCount, 0);
    const faceValue = targetRows.reduce((s, r) => s + r.submittedFaceValue, 0);
    const gmv = targetRows.reduce((s, r) => s + r.settledGmv, 0);
    const avgRate = submitted > 0 ? (success / submitted) * 100 : 98.57;
    const aov = success > 0 ? gmv / success : 115.38;
    const avgDiscount =
      targetRows.reduce((s, r) => s + r.discountRate, 0) / (targetRows.length || 1);
    const avgSec =
      targetRows.reduce((s, r) => s + r.avgDurationSec, 0) / (targetRows.length || 1);
    const avgTimeout =
      targetRows.reduce((s, r) => s + r.timeoutRate, 0) / (targetRows.length || 1);
    const avgDispute =
      targetRows.reduce((s, r) => s + r.disputeRate, 0) / (targetRows.length || 1);

    return {
      submitted,
      success,
      failed,
      avgRate: avgRate.toFixed(2),
      faceValue,
      gmv,
      aov: aov.toFixed(2),
      avgDiscount: avgDiscount.toFixed(4),
      avgSec: avgSec.toFixed(1),
      avgTimeout: avgTimeout.toFixed(2),
      avgDispute: avgDispute.toFixed(2),
      count: targetRows.length,
    };
  }, [pageRows, sortedRows]);

  const dimensionTitle = useMemo(() => {
    switch (activeDimension) {
      case 'brand':
        return '品牌质量分析明细';
      case 'merchant':
        return '商户主体质量分析明细';
      case 'date':
        return '每日交易质量明细';
      case 'channel':
        return '渠道网关质量明细';
      case 'sku':
      default:
        return '卡种质量分析明细';
    }
  }, [activeDimension]);

  const dimensionColHeader = useMemo(() => {
    switch (activeDimension) {
      case 'brand':
        return '品牌名录 / 代号';
      case 'merchant':
        return '商户主体 / 编号';
      case 'date':
        return '交易日期 / 周期';
      case 'channel':
        return '流转通道 / 标识';
      case 'sku':
      default:
        return '卡种规格 / SKU';
    }
  }, [activeDimension]);

  return (
    <div className="flex flex-col w-full space-y-3">
      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {/* Card 1: 申报卡单总量 */}
        <div className="bg-surface-container-lowest px-3 py-2 rounded-lg shadow-sm border border-outline-variant/20 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-label-caps text-outline">申报卡单总量</span>
            <div className="font-numeric-stat text-[18px] leading-tight text-on-surface font-bold">
              12,560 <span className="text-[11px] font-normal text-outline">笔</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-numeric-table text-primary font-semibold">
              +14.2%
            </span>
            <div className="text-[11px] font-numeric-table text-outline">$1.46M 估值</div>
          </div>
        </div>

        {/* Card 2: 最终成交 GMV */}
        <div className="bg-surface-container-lowest px-3 py-2 rounded-lg shadow-sm border border-outline-variant/20 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-label-caps text-outline">最终成交 GMV</span>
            <div className="font-numeric-stat text-[18px] leading-tight text-primary font-bold">
              $1,428,500
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-numeric-table text-secondary font-semibold">
              98.6% 承兑
            </span>
            <div className="text-[11px] font-numeric-table text-outline">12,380 笔</div>
          </div>
        </div>

        {/* Card 3: 综合交易成功率 */}
        <div className="bg-surface-container-lowest px-3 py-2 rounded-lg shadow-sm border border-outline-variant/20 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-label-caps text-outline">综合交易成功率</span>
            <div className="font-numeric-stat text-[18px] leading-tight text-secondary font-bold">
              98.57%
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-numeric-table text-secondary font-semibold">
              超基线 +1.07%
            </span>
            <div className="text-[11px] font-numeric-table text-primary">直通 88.4%</div>
          </div>
        </div>

        {/* Card 4: 平均全链路时效 (SLA) */}
        <div className="bg-surface-container-lowest px-3 py-2 rounded-lg shadow-sm border border-outline-variant/20 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-label-caps text-outline">
              平均全链路时效 (SLA)
            </span>
            <div className="font-numeric-stat text-[18px] leading-tight text-on-surface font-bold">
              38.2<span className="text-[11px] font-normal text-outline">秒</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-numeric-table text-secondary font-semibold">
              达标 99.18%
            </span>
            <div className="text-[11px] font-numeric-table text-error">超时 0.82%</div>
          </div>
        </div>
      </div>

      {/* Filter and Dimension Switcher Toolbar */}
      <div className="bg-surface-container-lowest px-3.5 py-2 rounded-xl shadow-sm border border-outline-variant/20 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Dimension buttons */}
          <div className="inline-flex p-0.5 bg-surface-container-low rounded-lg border border-outline-variant/30">
            <button
              onClick={() => handleDimensionChange('brand')}
              className={`px-2.5 py-1 text-xs rounded transition-all cursor-pointer ${
                activeDimension === 'brand'
                  ? 'bg-primary text-on-primary font-medium shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              卡品牌
            </button>
            <button
              onClick={() => handleDimensionChange('sku')}
              className={`px-2.5 py-1 text-xs rounded transition-all cursor-pointer ${
                activeDimension === 'sku'
                  ? 'bg-primary text-on-primary font-medium shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              卡种规格 (SKU)
            </button>
            <button
              onClick={() => handleDimensionChange('merchant')}
              className={`px-2.5 py-1 text-xs rounded transition-all cursor-pointer ${
                activeDimension === 'merchant'
                  ? 'bg-primary text-on-primary font-medium shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              商户主体
            </button>
            <button
              onClick={() => handleDimensionChange('date')}
              className={`px-2.5 py-1 text-xs rounded transition-all cursor-pointer ${
                activeDimension === 'date'
                  ? 'bg-primary text-on-primary font-medium shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              交易日期
            </button>
            <button
              onClick={() => handleDimensionChange('channel')}
              className={`px-2.5 py-1 text-xs rounded transition-all cursor-pointer ${
                activeDimension === 'channel'
                  ? 'bg-primary text-on-primary font-medium shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              渠道
            </button>
          </div>

          <div className="h-4 w-[1px] bg-outline-variant/40 hidden md:block" />

          {/* Select Dropdowns */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Brand Filter */}
            <div className="relative">
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-7 pl-2 pr-6 bg-surface-container-low border border-outline-variant/30 rounded text-xs text-on-surface focus:outline-none appearance-none cursor-pointer"
              >
                <option>全部品牌 (All)</option>
                <option>Apple</option>
                <option>Steam</option>
                <option>Google Play</option>
                <option>Razer</option>
                <option>Vanilla Visa</option>
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-1 top-1.5 text-[14px] text-outline">
                expand_more
              </span>
            </div>

            {/* Geo Filter */}
            <div className="relative">
              <select
                value={selectedGeo}
                onChange={(e) => {
                  setSelectedGeo(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-7 pl-2 pr-6 bg-surface-container-low border border-outline-variant/30 rounded text-xs text-on-surface focus:outline-none appearance-none cursor-pointer"
              >
                <option>全部地区 (Geo)</option>
                <option>美国 (US)</option>
                <option>英国 (UK)</option>
                <option>德国 (DE)</option>
                <option>日本 (JP)</option>
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-1 top-1.5 text-[14px] text-outline">
                expand_more
              </span>
            </div>

            {/* Merchant Filter */}
            <div className="relative">
              <select
                value={selectedMerchant}
                onChange={(e) => {
                  setSelectedMerchant(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-7 pl-2 pr-6 bg-surface-container-low border border-outline-variant/30 rounded text-xs text-on-surface focus:outline-none appearance-none cursor-pointer"
              >
                <option>全部商户 (86家)</option>
                <option>MCH-88019 [北美快充]</option>
                <option>MCH-99420 [星辉互娱]</option>
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-1 top-1.5 text-[14px] text-outline">
                expand_more
              </span>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-7 pl-2 pr-6 bg-surface-container-low border border-outline-variant/30 rounded text-xs text-on-surface focus:outline-none appearance-none cursor-pointer"
              >
                <option>全部状态</option>
                <option>已核销打款</option>
                <option>风控冻结</option>
                <option>面值不符</option>
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-1 top-1.5 text-[14px] text-outline">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Date Selector & Action buttons */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-surface-container-low px-2 py-1 rounded text-xs font-numeric-table text-on-surface border border-outline-variant/30 gap-1">
            <span className="material-symbols-outlined text-[14px] text-outline">date_range</span>
            <span>{dateRangeText}</span>
          </div>
          <button
            onClick={() => onShowToast('已按当前多维条件执行检索！')}
            className="h-7 px-3 bg-primary hover:bg-primary/90 text-on-primary rounded text-xs font-medium flex items-center gap-1 shadow-sm transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">search</span>
            <span>查询</span>
          </button>
          <button
            onClick={handleResetFilters}
            className="h-7 px-2 bg-surface-container-low hover:bg-surface-container text-on-surface-variant rounded text-xs border border-outline-variant/30 cursor-pointer transition-colors"
            title="重置"
          >
            重置
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden flex flex-col flex-1">
        {/* Table Top Header Bar */}
        <div className="px-3.5 py-2 bg-surface-container-low/60 border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-headline-sm text-xs font-bold text-on-surface">
              {dimensionTitle}
            </span>
            <span className="text-[11px] font-numeric-table text-outline">
              共 {totalItems} 条 · 默认按成交额降序
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-numeric-table text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              ≥98% 优
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
              95~98% 稳
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-error" />
              &lt;95% 预警
            </span>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[1340px]">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-caps text-[11px] border-b border-outline-variant/20 select-none">
                <th className="py-2 px-3 sticky left-0 bg-surface-container-low z-20 w-[240px]">
                  {dimensionColHeader}
                </th>
                <th
                  onClick={() => handleSort('submittedCount')}
                  className="py-2 px-3 text-right cursor-pointer hover:text-on-surface transition-colors"
                >
                  <span className="inline-flex items-center justify-end gap-0.5">
                    申报量
                    {sortField === 'submittedCount' && (
                      <span className="material-symbols-outlined text-[12px]">
                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    )}
                  </span>
                </th>
                <th
                  onClick={() => handleSort('successCount')}
                  className="py-2 px-3 text-right cursor-pointer hover:text-on-surface transition-colors"
                >
                  <span className="inline-flex items-center justify-end gap-0.5">
                    成功量
                    {sortField === 'successCount' && (
                      <span className="material-symbols-outlined text-[12px]">
                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    )}
                  </span>
                </th>
                <th
                  onClick={() => handleSort('failedCount')}
                  className="py-2 px-3 text-right cursor-pointer hover:text-on-surface transition-colors"
                >
                  <span className="inline-flex items-center justify-end gap-0.5">
                    失败量
                    {sortField === 'failedCount' && (
                      <span className="material-symbols-outlined text-[12px]">
                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    )}
                  </span>
                </th>
                <th
                  onClick={() => handleSort('successRate')}
                  className="py-2 px-3 w-[120px] cursor-pointer hover:text-on-surface transition-colors"
                >
                  <span className="inline-flex items-center gap-0.5">
                    成功率
                    {sortField === 'successRate' && (
                      <span className="material-symbols-outlined text-[12px]">
                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    )}
                  </span>
                </th>
                <th
                  onClick={() => handleSort('submittedFaceValue')}
                  className="py-2 px-3 text-right cursor-pointer hover:text-on-surface transition-colors"
                >
                  <span className="inline-flex items-center justify-end gap-0.5">
                    申报面值 (USD)
                    {sortField === 'submittedFaceValue' && (
                      <span className="material-symbols-outlined text-[12px]">
                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    )}
                  </span>
                </th>
                <th
                  onClick={() => handleSort('settledGmv')}
                  className="py-2 px-3 text-right text-primary font-bold cursor-pointer hover:underline transition-colors"
                >
                  <span className="inline-flex items-center justify-end gap-0.5">
                    成交 GMV (USD)
                    {sortField === 'settledGmv' && (
                      <span className="material-symbols-outlined text-[12px]">
                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    )}
                  </span>
                </th>
                <th
                  onClick={() => handleSort('aov')}
                  className="py-2 px-3 text-right cursor-pointer hover:text-on-surface transition-colors"
                >
                  <span className="inline-flex items-center justify-end gap-0.5">
                    客单(AOV)
                    {sortField === 'aov' && (
                      <span className="material-symbols-outlined text-[12px]">
                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    )}
                  </span>
                </th>
                <th
                  onClick={() => handleSort('discountRate')}
                  className="py-2 px-3 text-right cursor-pointer hover:text-on-surface transition-colors"
                >
                  <span className="inline-flex items-center justify-end gap-0.5">
                    综合折率
                    {sortField === 'discountRate' && (
                      <span className="material-symbols-outlined text-[12px]">
                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    )}
                  </span>
                </th>
                <th
                  onClick={() => handleSort('avgDurationSec')}
                  className="py-2 px-3 text-right cursor-pointer hover:text-on-surface transition-colors"
                >
                  <span className="inline-flex items-center justify-end gap-0.5">
                    平均时效
                    {sortField === 'avgDurationSec' && (
                      <span className="material-symbols-outlined text-[12px]">
                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    )}
                  </span>
                </th>
                <th
                  onClick={() => handleSort('timeoutRate')}
                  className="py-2 px-3 text-right cursor-pointer hover:text-on-surface transition-colors"
                >
                  <span className="inline-flex items-center justify-end gap-0.5">
                    超时率
                    {sortField === 'timeoutRate' && (
                      <span className="material-symbols-outlined text-[12px]">
                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    )}
                  </span>
                </th>
                <th
                  onClick={() => handleSort('disputeRate')}
                  className="py-2 px-3 text-right cursor-pointer hover:text-on-surface transition-colors"
                >
                  <span className="inline-flex items-center justify-end gap-0.5">
                    争议率
                    {sortField === 'disputeRate' && (
                      <span className="material-symbols-outlined text-[12px]">
                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    )}
                  </span>
                </th>
                <th className="py-2 px-3 text-center sticky right-0 bg-surface-container-low z-20 w-[160px]">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low text-xs font-numeric-table text-on-surface">
              {pageRows.map((row) => {
                const isWarn = row.isWarning;
                const rateColor =
                  row.successRate >= 98
                    ? 'text-secondary'
                    : row.successRate >= 95
                    ? 'text-tertiary'
                    : 'text-error';
                const barBg =
                  row.successRate >= 98
                    ? 'bg-secondary'
                    : row.successRate >= 95
                    ? 'bg-tertiary'
                    : 'bg-error';

                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-surface-container-low/50 transition-colors group ${
                      isWarn ? 'bg-error-container/10' : ''
                    }`}
                  >
                    {/* Sticky Left Column */}
                    <td className="py-1.5 px-3 sticky left-0 bg-surface-container-lowest group-hover:bg-surface-container-low/50 z-10">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold ${row.iconBg} ${row.iconColor}`}
                        >
                          {row.iconText}
                        </span>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-body-sm font-semibold text-on-surface text-xs">
                              {row.name}
                            </span>
                            {isWarn && (
                              <span className="px-1 bg-error/10 text-error text-[9px] font-bold rounded">
                                {row.warningTag || '告警'}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-code-token text-outline">
                            {row.code}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Numerical Data Columns */}
                    <td className="py-1.5 px-3 text-right font-medium">
                      {row.submittedCount.toLocaleString()}
                    </td>
                    <td className="py-1.5 px-3 text-right text-secondary font-medium">
                      {row.successCount.toLocaleString()}
                    </td>
                    <td
                      className={`py-1.5 px-3 text-right ${
                        isWarn ? 'text-error font-bold' : 'text-on-surface-variant'
                      }`}
                    >
                      {row.failedCount}
                    </td>

                    {/* Success Rate with Progress Bar */}
                    <td className="py-1.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold text-xs ${rateColor}`}>
                          {row.successRate.toFixed(2)}%
                        </span>
                        <div className="w-10 h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div
                            className={`h-full ${barBg} rounded-full`}
                            style={{ width: `${Math.min(100, row.successRate)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-1.5 px-3 text-right text-on-surface-variant">
                      ${row.submittedFaceValue.toLocaleString()}
                    </td>
                    <td className="py-1.5 px-3 text-right font-bold text-on-surface">
                      ${row.settledGmv.toLocaleString()}
                    </td>
                    <td className="py-1.5 px-3 text-right text-on-surface-variant">
                      ${row.aov.toFixed(2)}
                    </td>
                    <td className="py-1.5 px-3 text-right font-code-token">
                      {row.discountRate.toFixed(4)}
                    </td>
                    <td
                      className={`py-1.5 px-3 text-right ${
                        row.avgDurationSec > 60
                          ? 'text-error font-bold'
                          : row.avgDurationSec <= 35
                          ? 'text-secondary'
                          : 'text-on-surface-variant'
                      }`}
                    >
                      {row.avgDurationSec}s
                    </td>
                    <td
                      className={`py-1.5 px-3 text-right ${
                        row.timeoutRate > 2.0 ? 'text-error font-bold' : 'text-on-surface-variant'
                      }`}
                    >
                      {row.timeoutRate.toFixed(2)}%
                    </td>
                    <td
                      className={`py-1.5 px-3 text-right ${
                        row.disputeRate > 1.0 ? 'text-error font-bold' : 'text-on-surface-variant'
                      }`}
                    >
                      {row.disputeRate.toFixed(2)}%
                    </td>

                    {/* Sticky Right Action Buttons */}
                    <td className="py-1.5 px-3 text-center sticky right-0 bg-surface-container-lowest group-hover:bg-surface-container-low/50 z-10">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setTrendItem(row)}
                          className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-primary text-xs cursor-pointer transition-colors"
                        >
                          趋势
                        </button>
                        {isWarn ? (
                          <button
                            onClick={() => setDrilldownItem(row)}
                            className="px-2 py-0.5 rounded bg-error text-on-error text-xs hover:bg-error/90 flex items-center gap-0.5 shadow-sm cursor-pointer transition-colors"
                          >
                            <span>排查</span>
                            <span className="material-symbols-outlined text-[11px]">warning</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setDrilldownItem(row)}
                            className="px-2 py-0.5 rounded bg-primary text-on-primary text-xs hover:bg-primary/90 flex items-center gap-0.5 shadow-sm cursor-pointer transition-colors"
                          >
                            <span>穿透</span>
                            <span className="material-symbols-outlined text-[11px]">
                              open_in_new
                            </span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Table Summary Footer */}
            <tfoot>
              <tr className="bg-surface-container-low/80 font-semibold text-xs text-on-surface border-t border-outline-variant/30">
                <td className="py-2 px-3 sticky left-0 bg-surface-container-low/80 z-10">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1 py-0.5 bg-primary text-on-primary rounded text-[9px] font-label-caps">
                      TOTAL
                    </span>
                    <span className="font-body-sm font-bold text-xs">
                      当前页汇总 ({footerTotals.count} 项)
                    </span>
                  </div>
                </td>
                <td className="py-2 px-3 text-right font-bold">
                  {footerTotals.submitted.toLocaleString()}
                </td>
                <td className="py-2 px-3 text-right text-secondary font-bold">
                  {footerTotals.success.toLocaleString()}
                </td>
                <td className="py-2 px-3 text-right text-error font-bold">
                  {footerTotals.failed.toLocaleString()}
                </td>
                <td className="py-2 px-3 font-bold text-secondary text-xs">
                  {footerTotals.avgRate}%
                </td>
                <td className="py-2 px-3 text-right font-bold">
                  ${footerTotals.faceValue.toLocaleString()}
                </td>
                <td className="py-2 px-3 text-right font-bold text-primary">
                  ${footerTotals.gmv.toLocaleString()}
                </td>
                <td className="py-2 px-3 text-right font-bold">
                  ${footerTotals.aov}
                </td>
                <td className="py-2 px-3 text-right font-code-token font-bold">
                  {footerTotals.avgDiscount}
                </td>
                <td className="py-2 px-3 text-right font-bold text-secondary">
                  {footerTotals.avgSec}s
                </td>
                <td className="py-2 px-3 text-right font-bold text-on-surface">
                  {footerTotals.avgTimeout}%
                </td>
                <td className="py-2 px-3 text-right font-bold text-on-surface">
                  {footerTotals.avgDispute}%
                </td>
                <td className="py-2 px-3 text-center sticky right-0 bg-surface-container-low/80 z-10 text-[11px] text-outline">
                  {footerTotals.count} 规格汇总
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination & Export Footer Bar */}
        <div className="px-3.5 py-2 bg-surface-container-lowest border-t border-outline-variant/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span>
              共 <strong className="font-numeric-table text-on-surface">{totalItems}</strong> 条 · 显示{' '}
              {startIndex + 1} - {Math.min(startIndex + pageSize, totalItems)}
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-6 px-1.5 bg-surface-container-low rounded text-xs text-on-surface border border-outline-variant/30 focus:outline-none cursor-pointer"
            >
              <option value={10}>10条/页</option>
              <option value={20}>20条/页</option>
              <option value={50}>50条/页</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {/* Pagination controls */}
            <div className="flex items-center gap-1 font-numeric-table text-xs">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-6 h-6 flex items-center justify-center rounded bg-surface-container-low text-on-surface-variant disabled:opacity-40 hover:bg-surface-container cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">chevron_left</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-6 h-6 flex items-center justify-center rounded transition-colors cursor-pointer ${
                    currentPage === p
                      ? 'bg-primary text-on-primary font-bold'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-6 h-6 flex items-center justify-center rounded bg-surface-container-low text-on-surface hover:bg-surface-container disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </button>
            </div>

            {/* Export view button */}
            <button
              onClick={() => {
                if (onOpenExport) {
                  onOpenExport();
                } else {
                  onShowToast('多维报表明细已生成并开始导出 CSV/Excel 数据包...');
                }
              }}
              className="h-6 px-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs rounded transition-colors flex items-center gap-1 border border-outline-variant/30 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[12px]">download</span>
              <span>导出视图</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trend Modal */}
      <MultiDimensionalTrendModal
        isOpen={!!trendItem}
        onClose={() => setTrendItem(null)}
        item={trendItem}
      />

      {/* Drilldown Modal */}
      <MultiDimensionalDrilldownModal
        isOpen={!!drilldownItem}
        onClose={() => setDrilldownItem(null)}
        item={drilldownItem}
        onShowToast={onShowToast}
      />
    </div>
  );
};
