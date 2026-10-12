import React, { useState, useMemo, useEffect } from 'react';
import {
  UserDimensionKey,
  UserMultiDimensionalRow,
  CHANNEL_ROWS_DATA,
  TEAM_ROWS_DATA,
  TIER_ROWS_DATA,
  REGION_ROWS_DATA,
  SEGMENT_ROWS_DATA,
  BRAND_ROWS_DATA,
  DATE_ROWS_DATA,
} from './userMultiDimensionalData';
import { UserCohortModal } from './UserCohortModal';
import { UserCustomerGroupDrilldownModal } from './UserCustomerGroupDrilldownModal';

interface UserMultiDimensionalReportProps {
  onShowToast: (msg: string) => void;
  onOpenExport: () => void;
  initialDimension?: UserDimensionKey;
}

type SortField =
  | 'newUsers'
  | 'firstOrderUsers'
  | 'firstConversionRate'
  | 'monthlyActiveUsers'
  | 'repeatUsers'
  | 'repeatRate30d'
  | 'orderCount'
  | 'gmvUsd'
  | 'arpuUsd'
  | 'cacUsd'
  | 'grossProfit90d';

export const UserMultiDimensionalReport: React.FC<UserMultiDimensionalReportProps> = ({
  onShowToast,
  onOpenExport,
  initialDimension = 'channel',
}) => {
  // 1. 当前选中的统计维度 (支持外部联动默认值)
  const [activeDimension, setActiveDimension] = useState<UserDimensionKey>(initialDimension);

  useEffect(() => {
    if (initialDimension) {
      setActiveDimension(initialDimension);
    }
  }, [initialDimension]);

  // 2. 搜索与排序状态
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('gmvUsd');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 3. 分页状态
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // 4. 弹窗状态
  const [selectedCohortRow, setSelectedCohortRow] = useState<UserMultiDimensionalRow | null>(null);
  const [selectedDrilldownRow, setSelectedDrilldownRow] = useState<UserMultiDimensionalRow | null>(null);

  // 获取对应维度的数据
  const rawRows = useMemo(() => {
    switch (activeDimension) {
      case 'team':
        return TEAM_ROWS_DATA;
      case 'tier':
        return TIER_ROWS_DATA;
      case 'region':
        return REGION_ROWS_DATA;
      case 'segment':
        return SEGMENT_ROWS_DATA;
      case 'brand':
        return BRAND_ROWS_DATA;
      case 'date':
        return DATE_ROWS_DATA;
      case 'channel':
      default:
        return CHANNEL_ROWS_DATA;
    }
  }, [activeDimension]);

  // 维度切换
  const handleDimensionChange = (dim: UserDimensionKey) => {
    setActiveDimension(dim);
    setCurrentPage(1);
    const dimNames: Record<UserDimensionKey, string> = {
      channel: '获客渠道',
      team: '推广团队',
      tier: '会员等级',
      region: '国家地区',
      segment: '新老客群',
      brand: '卡种偏好',
      date: '日期走势',
    };
    onShowToast(`已切换至【按${dimNames[dim]}】用户多维分析报表`);
  };

  // 排序切换
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // 筛选过滤
  const filteredRows = useMemo(() => {
    return rawRows.filter((r) => {
      if (searchKeyword.trim()) {
        const kw = searchKeyword.trim().toLowerCase();
        const matchName = r.name.toLowerCase().includes(kw);
        const matchCode = r.code.toLowerCase().includes(kw);
        if (!matchName && !matchCode) return false;
      }
      return true;
    });
  }, [rawRows, searchKeyword]);

  // 排序处理
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

  // 计算汇总合计数据
  const totals = useMemo(() => {
    const target = pageRows.length > 0 ? pageRows : sortedRows;
    const newUsers = target.reduce((s, r) => s + r.newUsers, 0);
    const firstOrder = target.reduce((s, r) => s + r.firstOrderUsers, 0);
    const mau = target.reduce((s, r) => s + r.monthlyActiveUsers, 0);
    const repeat = target.reduce((s, r) => s + r.repeatUsers, 0);
    const orders = target.reduce((s, r) => s + r.orderCount, 0);
    const gmv = target.reduce((s, r) => s + r.gmvUsd, 0);
    const profit = target.reduce((s, r) => s + r.grossProfit90d, 0);

    const avgConversion = newUsers > 0 ? ((firstOrder / newUsers) * 100).toFixed(1) : '49.8';
    const avgRepeatRate = mau > 0 ? ((repeat / mau) * 100).toFixed(1) : '68.4';
    const avgArpu = target.length > 0 ? (target.reduce((s, r) => s + r.arpuUsd, 0) / target.length).toFixed(2) : '356.19';
    const avgCac = target.length > 0 ? (target.reduce((s, r) => s + r.cacUsd, 0) / target.length).toFixed(2) : '13.80';

    return {
      count: target.length,
      newUsers,
      firstOrder,
      avgConversion,
      mau,
      repeat,
      avgRepeatRate,
      orders,
      gmv,
      avgArpu,
      avgCac,
      profit,
    };
  }, [pageRows, sortedRows]);

  return (
    <div className="flex flex-col w-full gap-space-lg antialiased">
      {/* 2. Global Filter & Dimension Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-lowest px-4 py-2.5 rounded-xl shadow-sm border border-outline-variant/20">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-on-surface-variant uppercase mr-1">
            统计维度:
          </span>

          <button
            onClick={() => handleDimensionChange('channel')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeDimension === 'channel'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">campaign</span>
            <span>按获客渠道 (Channel)</span>
          </button>

          <button
            onClick={() => handleDimensionChange('team')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeDimension === 'team'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">hub</span>
            <span>推广团队</span>
          </button>

          <button
            onClick={() => handleDimensionChange('tier')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeDimension === 'tier'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">workspace_premium</span>
            <span>会员等级</span>
          </button>

          <button
            onClick={() => handleDimensionChange('region')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeDimension === 'region'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">public</span>
            <span>国家地区</span>
          </button>

          <button
            onClick={() => handleDimensionChange('segment')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeDimension === 'segment'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">groups</span>
            <span>新老客群</span>
          </button>

          <button
            onClick={() => handleDimensionChange('brand')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeDimension === 'brand'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">credit_card</span>
            <span>卡种偏好</span>
          </button>

          <button
            onClick={() => handleDimensionChange('date')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeDimension === 'date'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">calendar_month</span>
            <span>日期走势</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="过滤渠道/标签..."
              className="h-8 pl-8 pr-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44"
            />
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-[15px] text-slate-400 pointer-events-none">
              search
            </span>
          </div>
          <button
            type="button"
            onClick={() => onShowToast('已按最新筛选关键词完成重算')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
          >
            <span className="material-symbols-outlined text-[15px] text-slate-500">tune</span>
            <span>筛选</span>
          </button>
        </div>
      </div>

      {/* 3. Core Summary Metrics Bar (PRD 9.5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: 累计出卡交易用户 */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-white shadow-xs border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
              累计出卡交易用户
            </span>
            <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              +14.2%
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div className="font-mono text-2xl text-slate-900 font-bold">
              68,430 <span className="text-xs font-normal text-slate-500">人</span>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              新增注册 <span className="font-bold text-blue-600">8,420</span>
            </div>
          </div>
        </div>

        {/* Card 2: 首单破冰转化率 */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-white shadow-xs border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
              首单破冰转化率
            </span>
            <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              +3.8%
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div className="font-mono text-2xl text-slate-900 font-bold">49.8%</div>
            <div className="text-xs text-slate-500 font-mono">
              首单出卡 <span className="font-bold text-slate-800">4,195 人</span>
            </div>
          </div>
        </div>

        {/* Card 3: 30日真实交易复购率 */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-white shadow-xs border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
              30日真实交易复购率
            </span>
            <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              极优
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div className="font-mono text-2xl text-emerald-700 font-bold">68.4%</div>
            <div className="text-xs text-slate-500 font-mono">
              老客占比 <span className="font-bold text-slate-800">54.2%</span>
            </div>
          </div>
        </div>

        {/* Card 4: 综合出卡 GMV */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-white shadow-xs border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
              综合出卡 GMV
            </span>
            <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              日均 $47.6k
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div className="font-mono text-2xl text-slate-900 font-bold">$1,428,500</div>
            <div className="text-xs text-slate-500 font-mono">
              ARPU <span className="font-bold text-slate-800">$338.50</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. High-Density Multidimensional User Data Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Table Header Controls */}
        <div className="px-space-base py-2 flex items-center justify-between border-b border-surface-container-high/40 bg-surface-container-lowest">
          <div className="flex items-center gap-2">
            <span className="font-headline-sm text-[15px] font-bold text-on-surface">
              渠道质量与留存穿透明细
            </span>
            <span className="text-[11px] font-body-sm text-outline">
              共 18 个渠道 · 实时全量穿透
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-body-sm text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              高留存
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-tertiary" />
              中等
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-error" />
              需关注
            </span>
          </div>
        </div>

        {/* The Dense Grid Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm border-collapse min-w-[1300px]">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-caps text-label-caps uppercase select-none whitespace-nowrap">
                {/* 统计维度 */}
                <th className="py-2.5 px-3 font-semibold sticky left-0 bg-surface-container-low z-10 shadow-[1px_0_0_rgba(0,0,0,0.05)]">
                  <div
                    onClick={() => handleSort('gmvUsd')}
                    className="flex items-center gap-1 cursor-pointer hover:text-on-surface"
                  >
                    <span>
                      {activeDimension === 'channel'
                        ? '统计维度 (获客渠道 / 来源明细)'
                        : activeDimension === 'team'
                        ? '统计维度 (推广团队 / 编组)'
                        : activeDimension === 'tier'
                        ? '统计维度 (会员等级 / 资产层级)'
                        : activeDimension === 'region'
                        ? '统计维度 (国家地区 / 市场)'
                        : '统计维度 (客群分层 / 生命周期)'}
                    </span>
                    <span className="material-symbols-outlined text-[13px]">swap_vert</span>
                  </div>
                </th>

                {/* 新增注册 (人) */}
                <th className="py-2.5 px-3 text-right font-semibold">
                  <div
                    onClick={() => handleSort('newUsers')}
                    className="flex items-center justify-end gap-1 cursor-pointer hover:text-on-surface"
                  >
                    <span>新增注册 (人)</span>
                    <span className="material-symbols-outlined text-[13px]">swap_vert</span>
                  </div>
                </th>

                {/* 首次出卡 (人) */}
                <th className="py-2.5 px-3 text-right font-semibold">
                  <div
                    onClick={() => handleSort('firstOrderUsers')}
                    className="flex items-center justify-end gap-1 cursor-pointer hover:text-on-surface"
                  >
                    <span>首次出卡 (人)</span>
                    <span className="material-symbols-outlined text-[13px]">swap_vert</span>
                  </div>
                </th>

                {/* 首单转化率 */}
                <th className="py-2.5 px-3 font-semibold w-36">
                  <div
                    onClick={() => handleSort('firstConversionRate')}
                    className="flex items-center gap-1 cursor-pointer hover:text-on-surface"
                  >
                    <span>首单转化率</span>
                    <span className="material-symbols-outlined text-[13px]">swap_vert</span>
                  </div>
                </th>

                {/* 月活跃用户 */}
                <th className="py-2.5 px-3 text-right font-semibold">
                  <div
                    onClick={() => handleSort('monthlyActiveUsers')}
                    className="flex items-center justify-end gap-1 cursor-pointer hover:text-on-surface"
                  >
                    <span>月活跃用户</span>
                    <span className="material-symbols-outlined text-[13px]">swap_vert</span>
                  </div>
                </th>

                {/* 复购用户数 (≥2单) */}
                <th className="py-2.5 px-3 text-right font-semibold">
                  <div
                    onClick={() => handleSort('repeatUsers')}
                    className="flex items-center justify-end gap-1 cursor-pointer hover:text-on-surface"
                  >
                    <span>复购用户数 (≥2单)</span>
                    <span className="material-symbols-outlined text-[13px]">swap_vert</span>
                  </div>
                </th>

                {/* 30日真实复购率 */}
                <th className="py-2.5 px-3 font-semibold w-36">
                  <div
                    onClick={() => handleSort('repeatRate30d')}
                    className="flex items-center gap-1 cursor-pointer hover:text-on-surface"
                  >
                    <span>30日真实复购率</span>
                    <span className="material-symbols-outlined text-[13px]">swap_vert</span>
                  </div>
                </th>

                {/* 卡单总量 (笔) */}
                <th className="py-2.5 px-3 text-right font-semibold">
                  <div
                    onClick={() => handleSort('orderCount')}
                    className="flex items-center justify-end gap-1 cursor-pointer hover:text-on-surface"
                  >
                    <span>卡单总量 (笔)</span>
                    <span className="material-symbols-outlined text-[13px]">swap_vert</span>
                  </div>
                </th>

                {/* 贡献成交 GMV */}
                <th className="py-2.5 px-3 text-right font-semibold">
                  <div
                    onClick={() => handleSort('gmvUsd')}
                    className="flex items-center justify-end gap-1 cursor-pointer hover:text-on-surface"
                  >
                    <span>贡献成交 GMV</span>
                    <span className="material-symbols-outlined text-[13px]">swap_vert</span>
                  </div>
                </th>

                {/* ARPU (USD) */}
                <th className="py-2.5 px-3 text-right font-semibold">
                  <div
                    onClick={() => handleSort('arpuUsd')}
                    className="flex items-center justify-end gap-1 cursor-pointer hover:text-on-surface"
                  >
                    <span>ARPU (USD)</span>
                    <span className="material-symbols-outlined text-[13px]">swap_vert</span>
                  </div>
                </th>

                {/* CAC (USD) */}
                <th className="py-2.5 px-3 text-right font-semibold">
                  <div
                    onClick={() => handleSort('cacUsd')}
                    className="flex items-center justify-end gap-1 cursor-pointer hover:text-on-surface"
                  >
                    <span>CAC (USD)</span>
                    <span className="material-symbols-outlined text-[13px]">swap_vert</span>
                  </div>
                </th>

                {/* 90日毛利 */}
                <th className="py-2.5 px-3 text-right font-semibold">
                  <div
                    onClick={() => handleSort('grossProfit90d')}
                    className="flex items-center justify-end gap-1 cursor-pointer hover:text-on-surface"
                  >
                    <span>90日毛利</span>
                    <span className="material-symbols-outlined text-[13px]">swap_vert</span>
                  </div>
                </th>

                {/* 操作 (下钻与洞察) */}
                <th className="py-2.5 px-3 text-center font-semibold">操作 (下钻与洞察)</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-surface-container/60 font-body-sm text-xs">
              {pageRows.map((row) => (
                <tr key={row.id} className="hover:bg-surface-container-low transition-colors group">
                  {/* 统计维度 */}
                  <td className="py-2.5 px-3 sticky left-0 bg-surface-container-lowest group-hover:bg-surface-container-low transition-colors shadow-[1px_0_0_rgba(0,0,0,0.05)] whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded flex items-center justify-center ${row.iconBg} ${row.iconColor}`}
                      >
                        <span className="material-symbols-outlined text-[15px]">{row.icon}</span>
                      </span>
                      <div className="flex flex-col">
                        <span className="font-medium text-on-surface">{row.name}</span>
                        <span className="font-code-token text-[10px] text-outline">{row.code}</span>
                      </div>
                    </div>
                  </td>

                  {/* 新增注册 */}
                  <td className="py-2.5 px-3 text-right font-numeric-table">
                    {row.newUsers.toLocaleString()}
                  </td>

                  {/* 首次出卡 */}
                  <td className="py-2.5 px-3 text-right font-numeric-table font-medium text-primary">
                    {row.firstOrderUsers.toLocaleString()}
                  </td>

                  {/* 首单转化率 */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-surface-container overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(100, row.firstConversionRate)}%` }}
                        />
                      </div>
                      <span className="font-numeric-table text-xs font-semibold text-on-surface">
                        {row.firstConversionRate.toFixed(1)}%
                      </span>
                    </div>
                  </td>

                  {/* 月活跃用户 */}
                  <td className="py-2.5 px-3 text-right font-numeric-table">
                    {row.monthlyActiveUsers.toLocaleString()}
                  </td>

                  {/* 复购用户数 */}
                  <td className="py-2.5 px-3 text-right font-numeric-table font-medium text-secondary">
                    {row.repeatUsers.toLocaleString()}
                  </td>

                  {/* 30日真实复购率 */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          row.retentionEvaluation === '极优' || row.retentionEvaluation === '顶级'
                            ? 'bg-secondary'
                            : row.retentionEvaluation === '一般' || row.retentionEvaluation === '稳定'
                            ? 'bg-tertiary'
                            : 'bg-error'
                        }`}
                      />
                      <span className={`font-numeric-table font-semibold ${row.retentionColorClass}`}>
                        {row.repeatRate30d.toFixed(1)}%
                      </span>
                      <span className="text-[10px] font-code-token text-outline">
                        ({row.retentionEvaluation})
                      </span>
                    </div>
                  </td>

                  {/* 卡单总量 */}
                  <td className="py-2.5 px-3 text-right font-numeric-table">
                    {row.orderCount.toLocaleString()}
                  </td>

                  {/* 贡献成交 GMV */}
                  <td className="py-2.5 px-3 text-right font-numeric-table font-bold text-on-surface">
                    ${row.gmvUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  {/* ARPU (USD) */}
                  <td className="py-2.5 px-3 text-right font-numeric-table">
                    ${row.arpuUsd.toFixed(2)}
                  </td>

                  {/* CAC (USD) */}
                  <td className="py-2.5 px-3 text-right font-numeric-table text-outline">
                    ${row.cacUsd.toFixed(2)}
                  </td>

                  {/* 90日毛利 */}
                  <td className="py-2.5 px-3 text-right font-numeric-table font-semibold text-secondary">
                    +${row.grossProfit90d.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  {/* 操作 (下钻与洞察) */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setSelectedCohortRow(row)}
                        className="px-2 py-0.5 rounded text-xs text-primary bg-primary/10 hover:bg-primary/20 transition-colors font-medium cursor-pointer"
                      >
                        Cohort
                      </button>
                      <button
                        onClick={() => setSelectedDrilldownRow(row)}
                        className="px-2 py-0.5 rounded text-xs text-on-surface bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer"
                      >
                        穿透客群
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Bottom Summary Row */}
            <tfoot>
              <tr className="bg-surface-container-high font-numeric-table font-semibold text-on-surface text-xs">
                <td className="py-3 px-3 sticky left-0 bg-surface-container-high z-10 shadow-[1px_0_0_rgba(0,0,0,0.05)]">
                  合计 / 当前筛选汇总 (Top {totals.count}渠道)
                </td>
                <td className="py-3 px-3 text-right font-numeric-table">
                  {totals.newUsers.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right font-numeric-table text-primary">
                  {totals.firstOrder.toLocaleString()}
                </td>
                <td className="py-3 px-3">
                  <span className="font-numeric-table text-on-surface">
                    {totals.avgConversion}% (均值)
                  </span>
                </td>
                <td className="py-3 px-3 text-right font-numeric-table">
                  {totals.mau.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right font-numeric-table text-secondary">
                  {totals.repeat.toLocaleString()}
                </td>
                <td className="py-3 px-3">
                  <span className="font-numeric-table text-secondary">
                    {totals.avgRepeatRate}% (均值)
                  </span>
                </td>
                <td className="py-3 px-3 text-right font-numeric-table">
                  {totals.orders.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right font-numeric-table font-bold text-primary">
                  ${totals.gmv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right font-numeric-table">
                  ${totals.avgArpu}
                </td>
                <td className="py-3 px-3 text-right font-numeric-table text-outline">
                  ${totals.avgCac}
                </td>
                <td className="py-3 px-3 text-right font-numeric-table text-secondary">
                  +${totals.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-center font-label-caps text-outline">全量审计就绪</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 5. Pagination & Direct Action Bar */}
        <div className="px-space-lg py-space-sm flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-low border-t border-surface-container-high/40">
          <div className="flex items-center gap-3 text-body-sm font-body-sm text-on-surface-variant text-xs">
            <span>
              共 <strong className="text-on-surface font-numeric-table font-semibold">18</strong> 个流量归因渠道 · 显示第{' '}
              {startIndex + 1} 至 {Math.min(startIndex + pageSize, totalRecords)} 条
            </span>
            <div className="flex items-center gap-1.5 pl-2 border-l border-surface-container-high">
              <span>每页:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-7 px-2 rounded bg-surface-container text-on-surface font-numeric-table text-xs focus:outline-none cursor-pointer"
              >
                <option value={20}>20条/页</option>
                <option value={50}>50条/页</option>
                <option value={100}>100条/页</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-space-md">
            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded bg-surface-container text-on-surface-variant hover:bg-surface-container-high disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 flex items-center justify-center rounded font-numeric-table text-xs font-semibold cursor-pointer transition-colors ${
                    currentPage === p
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded bg-surface-container text-on-surface-variant hover:bg-surface-container-high disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>

            {/* Export Action */}
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container text-on-primary font-body-sm text-xs font-medium hover:bg-primary transition-colors shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>导出本周期报表 (Excel)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cohort 留存分析弹窗 */}
      <UserCohortModal
        isOpen={!!selectedCohortRow}
        onClose={() => setSelectedCohortRow(null)}
        row={selectedCohortRow}
        onShowToast={onShowToast}
      />

      {/* 穿透客群画像与交易流水弹窗 */}
      <UserCustomerGroupDrilldownModal
        isOpen={!!selectedDrilldownRow}
        onClose={() => setSelectedDrilldownRow(null)}
        row={selectedDrilldownRow}
        onShowToast={onShowToast}
      />
    </div>
  );
};
