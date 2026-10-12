import React, { useState, useMemo } from 'react';

export interface DailyTrendItem {
  date: string; // e.g. '09-12'
  fullDate: string; // e.g. '2026-09-12'
  dayLabel: string; // e.g. '周六'
  registeredUsers: number;
  firstOrderUsers: number;
  firstConvRate: number; // %
  transUsers: number;
  successOrders: number;
  gmvYuan: number;
  gmvTenThousand: number;
  atvYuan: number;
  successRate: number; // %
}

export type TrendViewMode = 'gmv-orders' | 'acquisition-conversion' | 'rate-atv';
export type ChartStyleMode = 'composite' | 'area' | 'bar';

export interface UserSevenDayTrendChartProps {
  data: DailyTrendItem[];
  trendView: TrendViewMode;
  onTrendViewChange: (view: TrendViewMode) => void;
  selectedDateIndex: number;
  onSelectDateIndex: (index: number) => void;
  onShowToast: (msg: string) => void;
}

export const UserSevenDayTrendChart: React.FC<UserSevenDayTrendChartProps> = ({
  data,
  trendView,
  onTrendViewChange,
  selectedDateIndex,
  onSelectDateIndex,
  onShowToast,
}) => {
  // 图表呈现形态：composite(柱线复合) | area(双轴平滑面积) | bar(对比柱状)
  const [chartStyle, setChartStyle] = useState<ChartStyleMode>('composite');
  // 是否展示7日均值参考基准线
  const [showBenchmark, setShowBenchmark] = useState<boolean>(true);
  // 鼠标悬停索引
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 配置当前视角下的主指标与副指标元数据
  const metricMeta = useMemo(() => {
    switch (trendView) {
      case 'gmv-orders':
        return {
          title: '交易GMV与订单量时序走势',
          desc: '出卡成交体量与订单密度的时序关联分析',
          primary: {
            name: '交易GMV',
            unit: '万元',
            color: '#2563eb', // blue-600
            gradStart: '#3b82f6',
            gradEnd: '#1d4ed8',
            getValue: (d: DailyTrendItem) => d.gmvTenThousand,
            format: (v: number) => `¥${v.toFixed(2)}万`,
            min: 65,
            max: 125,
            step: 15,
          },
          secondary: {
            name: '出卡订单量',
            unit: '笔',
            color: '#10b981', // emerald-500
            gradStart: '#34d399',
            gradEnd: '#059669',
            getValue: (d: DailyTrendItem) => d.successOrders,
            format: (v: number) => `${v.toLocaleString()} 笔`,
            min: 1300,
            max: 2350,
            step: 250,
          },
        };
      case 'acquisition-conversion':
        return {
          title: '拉新注册与首单破冰转化走势',
          desc: '获客漏斗第一阶梯：注册到首笔出卡兑付转化效率',
          primary: {
            name: '新增注册用户',
            unit: '人',
            color: '#6366f1', // indigo-500
            gradStart: '#818cf8',
            gradEnd: '#4f46e5',
            getValue: (d: DailyTrendItem) => d.registeredUsers,
            format: (v: number) => `${v.toLocaleString()} 人`,
            min: 300,
            max: 650,
            step: 70,
          },
          secondary: {
            name: '首单破冰率',
            unit: '%',
            color: '#f59e0b', // amber-500
            gradStart: '#fbbf24',
            gradEnd: '#d97706',
            getValue: (d: DailyTrendItem) => d.firstConvRate,
            format: (v: number) => `${v.toFixed(1)}%`,
            min: 48,
            max: 60,
            step: 3,
          },
        };
      case 'rate-atv':
        return {
          title: '交易兑付成功率与客单价波动',
          desc: '交易承揽质效与高额卡（$100/$200）单笔出卡价值监控',
          primary: {
            name: '交易兑付成功率',
            unit: '%',
            color: '#0284c7', // sky-600
            gradStart: '#38bdf8',
            gradEnd: '#0369a1',
            getValue: (d: DailyTrendItem) => d.successRate,
            format: (v: number) => `${v.toFixed(2)}%`,
            min: 76,
            max: 82,
            step: 1.5,
          },
          secondary: {
            name: '笔均客单价 (ATV)',
            unit: '元',
            color: '#8b5cf6', // purple-500
            gradStart: '#a78bfa',
            gradEnd: '#7c3aed',
            getValue: (d: DailyTrendItem) => d.atvYuan,
            format: (v: number) => `¥${v.toFixed(1)}`,
            min: 480,
            max: 540,
            step: 15,
          },
        };
    }
  }, [trendView]);

  // 计算7日汇总指标
  const summaryMetrics = useMemo(() => {
    const totalGmv = data.reduce((acc, cur) => acc + cur.gmvYuan, 0);
    const totalOrders = data.reduce((acc, cur) => acc + cur.successOrders, 0);
    const totalReg = data.reduce((acc, cur) => acc + cur.registeredUsers, 0);
    const avgAtv = totalOrders > 0 ? totalGmv / totalOrders : 0;
    const avgSuccessRate = (data.reduce((acc, cur) => acc + cur.successRate, 0) / data.length).toFixed(2);
    const avgConvRate = (data.reduce((acc, cur) => acc + cur.firstConvRate, 0) / data.length).toFixed(1);

    return {
      totalGmvYuan: totalGmv,
      totalGmvWan: (totalGmv / 10000).toFixed(2),
      totalOrders,
      totalReg,
      avgAtv: avgAtv.toFixed(1),
      avgSuccessRate,
      avgConvRate,
    };
  }, [data]);

  // 坐标系常数 (SVG viewBox 920 x 280)
  const SVG_WIDTH = 920;
  const SVG_HEIGHT = 280;
  const PADDING = { top: 32, right: 65, bottom: 45, left: 65 };
  const PLOT_WIDTH = SVG_WIDTH - PADDING.left - PADDING.right;
  const PLOT_HEIGHT = SVG_HEIGHT - PADDING.top - PADDING.bottom;

  // 映射 X 轴点坐标
  const xPoints = useMemo(() => {
    return data.map((_, idx) => PADDING.left + (idx / (data.length - 1)) * PLOT_WIDTH);
  }, [data.length, PLOT_WIDTH, PADDING.left]);

  // 映射 Y1 (左轴) 坐标
  const y1Scale = (val: number) => {
    const { min, max } = metricMeta.primary;
    const clamped = Math.max(min, Math.min(max, val));
    const ratio = (clamped - min) / (max - min);
    return PADDING.top + PLOT_HEIGHT - ratio * PLOT_HEIGHT;
  };

  // 映射 Y2 (右轴) 坐标
  const y2Scale = (val: number) => {
    const { min, max } = metricMeta.secondary;
    const clamped = Math.max(min, Math.min(max, val));
    const ratio = (clamped - min) / (max - min);
    return PADDING.top + PLOT_HEIGHT - ratio * PLOT_HEIGHT;
  };

  // 生成主指标的点坐标与曲线
  const primaryPoints = useMemo(() => {
    return data.map((d, i) => ({
      x: xPoints[i],
      y: y1Scale(metricMeta.primary.getValue(d)),
      value: metricMeta.primary.getValue(d),
      raw: d,
    }));
  }, [data, xPoints, metricMeta]);

  // 生成副指标的点坐标与曲线
  const secondaryPoints = useMemo(() => {
    return data.map((d, i) => ({
      x: xPoints[i],
      y: y2Scale(metricMeta.secondary.getValue(d)),
      value: metricMeta.secondary.getValue(d),
      raw: d,
    }));
  }, [data, xPoints, metricMeta]);

  // 7日均值线计算
  const primaryAvgValue = useMemo(() => {
    const sum = data.reduce((acc, cur) => acc + metricMeta.primary.getValue(cur), 0);
    return sum / data.length;
  }, [data, metricMeta]);

  const primaryAvgY = y1Scale(primaryAvgValue);

  // 平滑曲线生成算法 (Catmull-Rom to Cubic Bézier)
  const getSplinePath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let path = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(i + 2, pts.length - 1)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return path;
  };

  const primarySplinePath = useMemo(() => getSplinePath(primaryPoints), [primaryPoints]);
  const secondarySplinePath = useMemo(() => getSplinePath(secondaryPoints), [secondaryPoints]);

  // 闭合面积图路径
  const primaryAreaPath = useMemo(() => {
    if (primaryPoints.length === 0) return '';
    const lastX = primaryPoints[primaryPoints.length - 1].x;
    const firstX = primaryPoints[0].x;
    const bottomY = PADDING.top + PLOT_HEIGHT;
    return `${primarySplinePath} L ${lastX.toFixed(1)} ${bottomY} L ${firstX.toFixed(1)} ${bottomY} Z`;
  }, [primarySplinePath, primaryPoints, PADDING.top, PLOT_HEIGHT]);

  const secondaryAreaPath = useMemo(() => {
    if (secondaryPoints.length === 0) return '';
    const lastX = secondaryPoints[secondaryPoints.length - 1].x;
    const firstX = secondaryPoints[0].x;
    const bottomY = PADDING.top + PLOT_HEIGHT;
    return `${secondarySplinePath} L ${lastX.toFixed(1)} ${bottomY} L ${firstX.toFixed(1)} ${bottomY} Z`;
  }, [secondarySplinePath, secondaryPoints, PADDING.top, PLOT_HEIGHT]);

  // 左轴刻度生成
  const y1Ticks = useMemo(() => {
    const { min, max, step } = metricMeta.primary;
    const ticks: number[] = [];
    for (let v = min; v <= max + 0.0001; v += step) {
      ticks.push(Number(v.toFixed(2)));
    }
    return ticks;
  }, [metricMeta.primary]);

  // 右轴刻度生成
  const y2Ticks = useMemo(() => {
    const { min, max, step } = metricMeta.secondary;
    const ticks: number[] = [];
    for (let v = min; v <= max + 0.0001; v += step) {
      ticks.push(Number(v.toFixed(2)));
    }
    return ticks;
  }, [metricMeta.secondary]);

  // 活跃指示点（优先 hover，其次当前点击 selected）
  const activeIndex = hoveredIndex !== null ? hoveredIndex : selectedDateIndex;
  const activeItem = data[activeIndex] || data[6];

  // 日环比计算
  const dodChange = useMemo(() => {
    if (activeIndex === 0) return null;
    const prev = data[activeIndex - 1];
    const curr = data[activeIndex];
    const p1Curr = metricMeta.primary.getValue(curr);
    const p1Prev = metricMeta.primary.getValue(prev);
    const p1Rate = ((p1Curr - p1Prev) / p1Prev) * 100;

    const p2Curr = metricMeta.secondary.getValue(curr);
    const p2Prev = metricMeta.secondary.getValue(prev);
    const p2Rate = ((p2Curr - p2Prev) / p2Prev) * 100;

    return {
      p1Rate: p1Rate.toFixed(2),
      p1Positive: p1Rate >= 0,
      p2Rate: p2Rate.toFixed(2),
      p2Positive: p2Rate >= 0,
    };
  }, [activeIndex, data, metricMeta]);

  return (
    <div className="bg-slate-50/70 p-4.5 rounded-xl border border-slate-200/90 flex flex-col gap-3.5 transition-all shadow-2xs">
      {/* 1. 图表顶栏控制器：标题、视角、图表形态、7日总览快捷透视 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-slate-200/60">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-blue-600">monitoring</span>
                <span>近7日指标时序走势图 (2026-09-12 ~ 09-18)</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                双轴交互可视化
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {metricMeta.desc} · 交互悬停查看瞬时快照，点击数据点穿透聚焦当日切面
            </p>
          </div>
        </div>

        {/* 右侧控制栏：分析视角 + 图表类型切换 */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* 分析视角切换 */}
          <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs text-xs">
            <button
              type="button"
              onClick={() => onTrendViewChange('gmv-orders')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                trendView === 'gmv-orders'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              交易GMV与订单量
            </button>
            <button
              type="button"
              onClick={() => onTrendViewChange('acquisition-conversion')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                trendView === 'acquisition-conversion'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              拉新注册与首单破冰
            </button>
            <button
              type="button"
              onClick={() => onTrendViewChange('rate-atv')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                trendView === 'rate-atv'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              成功率与客单价
            </button>
          </div>

          {/* 图表形态切换 */}
          <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs text-xs">
            <button
              type="button"
              title="柱线复合图 (推荐)"
              onClick={() => setChartStyle('composite')}
              className={`p-1 rounded-md transition-all cursor-pointer ${
                chartStyle === 'composite'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] block">stacked_bar_chart</span>
            </button>
            <button
              type="button"
              title="双平滑面积折线图"
              onClick={() => setChartStyle('area')}
              className={`p-1 rounded-md transition-all cursor-pointer ${
                chartStyle === 'area'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] block">area_chart</span>
            </button>
            <button
              type="button"
              title="分组柱状图"
              onClick={() => setChartStyle('bar')}
              className={`p-1 rounded-md transition-all cursor-pointer ${
                chartStyle === 'bar'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] block">bar_chart</span>
            </button>
          </div>

          {/* 基准均值线开关 */}
          <button
            type="button"
            onClick={() => setShowBenchmark(!showBenchmark)}
            className={`px-2 py-1 rounded-lg border text-xs font-medium cursor-pointer transition-colors flex items-center gap-1 ${
              showBenchmark
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
            title="显示或隐藏7日均值基准线"
          >
            <span className="material-symbols-outlined text-[14px]">show_chart</span>
            <span>7日均线</span>
          </button>
        </div>
      </div>

      {/* 2. 7日大盘速览胶囊栏 (汇总核心数值) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-white/90 p-2.5 rounded-xl border border-slate-200/70 text-xs">
        <div className="flex items-center justify-between px-2 py-1 border-r border-slate-100 last:border-0">
          <span className="text-slate-500 text-[11px]">7日累计出卡GMV:</span>
          <span className="font-mono font-bold text-blue-700">¥{summaryMetrics.totalGmvWan}万</span>
        </div>
        <div className="flex items-center justify-between px-2 py-1 border-r border-slate-100 last:border-0">
          <span className="text-slate-500 text-[11px]">7日累计订单总量:</span>
          <span className="font-mono font-bold text-emerald-600">{summaryMetrics.totalOrders.toLocaleString()} 笔</span>
        </div>
        <div className="flex items-center justify-between px-2 py-1 border-r border-slate-100 last:border-0">
          <span className="text-slate-500 text-[11px]">7日平均客单 (ATV):</span>
          <span className="font-mono font-bold text-slate-800">¥{summaryMetrics.avgAtv}</span>
        </div>
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-slate-500 text-[11px]">7日均交易成功率:</span>
          <span className="font-mono font-bold text-sky-700">{summaryMetrics.avgSuccessRate}%</span>
        </div>
      </div>

      {/* 3. 核心双轴时序图表展示区 */}
      <div className="relative bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden select-none p-3">
        {/* 图例项说明 (Legend) */}
        <div className="flex items-center justify-between text-xs px-2 mb-1 flex-wrap gap-2">
          <div className="flex items-center gap-4">
            {/* 左轴主指标图例 */}
            <div className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-xs inline-block"
                style={{ backgroundColor: metricMeta.primary.color }}
              />
              <span className="text-slate-700 font-semibold">{metricMeta.primary.name}</span>
              <span className="text-[11px] text-slate-400 font-mono">(左轴 · {metricMeta.primary.unit})</span>
            </div>

            {/* 右轴副指标图例 */}
            <div className="flex items-center gap-1.5">
              <span
                className="w-3.5 h-1.5 rounded-full inline-block"
                style={{ backgroundColor: metricMeta.secondary.color }}
              />
              <span className="text-slate-700 font-semibold">{metricMeta.secondary.name}</span>
              <span className="text-[11px] text-slate-400 font-mono">(右轴 · {metricMeta.secondary.unit})</span>
            </div>

            {/* 7日均线图例 */}
            {showBenchmark && (
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 border-t-2 border-dashed border-slate-400 inline-block" />
                <span className="text-[11px] text-slate-500 font-mono">
                  7日均值 ({metricMeta.primary.format(primaryAvgValue)})
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>数据周期: 近7天自然日</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-blue-600 font-mono">
              当前定位: {activeItem.date} ({activeItem.dayLabel})
            </span>
          </div>
        </div>

        {/* SVG 容器 */}
        <div className="relative w-full h-[280px]">
          <svg
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              {/* 主指标渐变填充 */}
              <linearGradient id="primaryAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={metricMeta.primary.color} stopOpacity="0.28" />
                <stop offset="90%" stopColor={metricMeta.primary.color} stopOpacity="0.02" />
                <stop offset="100%" stopColor={metricMeta.primary.color} stopOpacity="0" />
              </linearGradient>

              {/* 副指标渐变填充 */}
              <linearGradient id="secondaryAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={metricMeta.secondary.color} stopOpacity="0.24" />
                <stop offset="95%" stopColor={metricMeta.secondary.color} stopOpacity="0.02" />
                <stop offset="100%" stopColor={metricMeta.secondary.color} stopOpacity="0" />
              </linearGradient>

              {/* 柱状渐变 */}
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={metricMeta.primary.gradStart} stopOpacity="0.95" />
                <stop offset="100%" stopColor={metricMeta.primary.gradEnd} stopOpacity="0.75" />
              </linearGradient>

              {/* 次柱渐变 */}
              <linearGradient id="barSecondaryGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={metricMeta.secondary.gradStart} stopOpacity="0.9" />
                <stop offset="100%" stopColor={metricMeta.secondary.gradEnd} stopOpacity="0.7" />
              </linearGradient>

              {/* 选中的高亮阴影滤镜 */}
              <filter id="glowShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1d4ed8" floodOpacity="0.35" />
              </filter>
            </defs>

            {/* 背景横向参考网格线与左/右轴刻度文字 */}
            {y1Ticks.map((tickVal, idx) => {
              const y = y1Scale(tickVal);
              const y2TickVal = y2Ticks[idx] !== undefined ? y2Ticks[idx] : null;

              return (
                <g key={`grid-${tickVal}`}>
                  {/* 横向网格虚线 */}
                  <line
                    x1={PADDING.left}
                    y1={y}
                    x2={SVG_WIDTH - PADDING.right}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />

                  {/* 左轴文字 (主指标) */}
                  <text
                    x={PADDING.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[11px] font-mono fill-slate-500 font-medium"
                  >
                    {tickVal}
                  </text>

                  {/* 右轴文字 (副指标) */}
                  {y2TickVal !== null && (
                    <text
                      x={SVG_WIDTH - PADDING.right + 8}
                      y={y + 4}
                      textAnchor="start"
                      className="text-[11px] font-mono fill-slate-500 font-medium"
                    >
                      {y2TickVal}
                    </text>
                  )}
                </g>
              );
            })}

            {/* 7日均值参考基准线 (如果启用) */}
            {showBenchmark && (
              <g>
                <line
                  x1={PADDING.left}
                  y1={primaryAvgY}
                  x2={SVG_WIDTH - PADDING.right}
                  y2={primaryAvgY}
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  strokeOpacity="0.8"
                />
                <rect
                  x={SVG_WIDTH - PADDING.right - 92}
                  y={primaryAvgY - 11}
                  width="88"
                  height="18"
                  rx="4"
                  fill="#f1f5f9"
                  stroke="#cbd5e1"
                  strokeWidth="0.8"
                />
                <text
                  x={SVG_WIDTH - PADDING.right - 48}
                  y={primaryAvgY + 2}
                  textAnchor="middle"
                  className="text-[10px] font-mono fill-slate-600 font-semibold"
                >
                  均值: {metricMeta.primary.format(primaryAvgValue)}
                </text>
              </g>
            )}

            {/* 选中/悬停日期的高亮背景坚柱 */}
            <rect
              x={xPoints[activeIndex] - (PLOT_WIDTH / 6) / 2 + 6}
              y={PADDING.top}
              width={(PLOT_WIDTH / 6) - 12}
              height={PLOT_HEIGHT}
              rx="6"
              fill="#3b82f6"
              fillOpacity="0.07"
              stroke="#3b82f6"
              strokeOpacity="0.3"
              strokeDasharray="3 3"
            />

            {/* === 形态 A: composite 柱线复合模式 (主指标为柱，副指标为折线) === */}
            {chartStyle === 'composite' && (
              <>
                {/* 1. 主指标柱状图 */}
                {primaryPoints.map((pt, i) => {
                  const isSelected = i === selectedDateIndex;
                  const isHovered = i === hoveredIndex;
                  const barWidth = 34;
                  const barHeight = PADDING.top + PLOT_HEIGHT - pt.y;
                  const barX = pt.x - barWidth / 2;

                  return (
                    <g key={`bar-${i}`}>
                      <rect
                        x={barX}
                        y={pt.y}
                        width={barWidth}
                        height={Math.max(4, barHeight)}
                        rx="4"
                        fill="url(#barGrad)"
                        className="transition-all duration-200 cursor-pointer"
                        opacity={isSelected || isHovered ? 1 : 0.85}
                        filter={isSelected ? 'url(#glowShadow)' : undefined}
                      />
                      {/* 柱顶数值标注 */}
                      <text
                        x={pt.x}
                        y={pt.y - 6}
                        textAnchor="middle"
                        className={`text-[10px] font-mono font-bold ${
                          isSelected ? 'fill-blue-700 font-extrabold' : 'fill-slate-700'
                        }`}
                      >
                        {metricMeta.primary.format(pt.value)}
                      </text>
                    </g>
                  );
                })}

                {/* 2. 副指标平滑折线与区域 */}
                <path
                  d={secondaryAreaPath}
                  fill="url(#secondaryAreaGrad)"
                  className="transition-all duration-300"
                />
                <path
                  d={secondarySplinePath}
                  fill="none"
                  stroke={metricMeta.secondary.color}
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-300"
                />

                {/* 副指标数据节点光圈 */}
                {secondaryPoints.map((pt, i) => {
                  const isSelected = i === selectedDateIndex;
                  const isHovered = i === hoveredIndex;
                  return (
                    <g key={`pt-sec-${i}`}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isSelected || isHovered ? 6 : 4}
                        fill="#ffffff"
                        stroke={metricMeta.secondary.color}
                        strokeWidth={isSelected || isHovered ? 3 : 2}
                        className="transition-all duration-200 cursor-pointer"
                      />
                    </g>
                  );
                })}
              </>
            )}

            {/* === 形态 B: area 双轴平滑折线面积图 === */}
            {chartStyle === 'area' && (
              <>
                {/* 主指标面积与折线 */}
                <path d={primaryAreaPath} fill="url(#primaryAreaGrad)" />
                <path
                  d={primarySplinePath}
                  fill="none"
                  stroke={metricMeta.primary.color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* 副指标面积与折线 */}
                <path d={secondaryAreaPath} fill="url(#secondaryAreaGrad)" />
                <path
                  d={secondarySplinePath}
                  fill="none"
                  stroke={metricMeta.secondary.color}
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* 节点绘制 */}
                {primaryPoints.map((pt, i) => (
                  <circle
                    key={`area-p-${i}`}
                    cx={pt.x}
                    cy={pt.y}
                    r={i === selectedDateIndex ? 6 : 4}
                    fill="#ffffff"
                    stroke={metricMeta.primary.color}
                    strokeWidth={i === selectedDateIndex ? 3 : 2}
                  />
                ))}

                {secondaryPoints.map((pt, i) => (
                  <circle
                    key={`area-s-${i}`}
                    cx={pt.x}
                    cy={pt.y}
                    r={i === selectedDateIndex ? 5 : 3.5}
                    fill="#ffffff"
                    stroke={metricMeta.secondary.color}
                    strokeWidth="2"
                  />
                ))}
              </>
            )}

            {/* === 形态 C: bar 双指标对比柱状图 === */}
            {chartStyle === 'bar' && (
              <>
                {primaryPoints.map((pt, i) => {
                  const secPt = secondaryPoints[i];
                  const barW = 16;
                  const pHeight = PADDING.top + PLOT_HEIGHT - pt.y;
                  const sHeight = PADDING.top + PLOT_HEIGHT - secPt.y;

                  return (
                    <g key={`grouped-bar-${i}`}>
                      {/* 主指标柱 */}
                      <rect
                        x={pt.x - barW - 2}
                        y={pt.y}
                        width={barW}
                        height={Math.max(4, pHeight)}
                        rx="3"
                        fill="url(#barGrad)"
                      />
                      {/* 副指标柱 */}
                      <rect
                        x={pt.x + 2}
                        y={secPt.y}
                        width={barW}
                        height={Math.max(4, sHeight)}
                        rx="3"
                        fill="url(#barSecondaryGrad)"
                      />
                    </g>
                  );
                })}
              </>
            )}

            {/* 活跃点/选中点垂直准星指示线 */}
            <line
              x1={xPoints[activeIndex]}
              y1={PADDING.top}
              x2={xPoints[activeIndex]}
              y2={PADDING.top + PLOT_HEIGHT}
              stroke="#2563eb"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              opacity="0.85"
            />

            {/* 选中高亮点脉冲环动画 */}
            <circle
              cx={primaryPoints[selectedDateIndex].x}
              cy={primaryPoints[selectedDateIndex].y}
              r="9"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
              className="animate-ping"
              opacity="0.75"
            />
            <circle
              cx={primaryPoints[selectedDateIndex].x}
              cy={primaryPoints[selectedDateIndex].y}
              r="6.5"
              fill="#2563eb"
              stroke="#ffffff"
              strokeWidth="2.5"
            />

            {/* X 轴日期刻度文字 */}
            {data.map((d, i) => {
              const isSelected = i === selectedDateIndex;
              const isHovered = i === hoveredIndex;
              const x = xPoints[i];
              const y = PADDING.top + PLOT_HEIGHT + 18;

              return (
                <g key={`x-axis-${d.date}`} className="cursor-pointer" onClick={() => onSelectDateIndex(i)}>
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    className={`text-[11px] font-mono transition-colors font-bold ${
                      isSelected ? 'fill-blue-700' : isHovered ? 'fill-slate-900' : 'fill-slate-600'
                    }`}
                  >
                    {d.date}
                  </text>
                  <text
                    x={x}
                    y={y + 13}
                    textAnchor="middle"
                    className={`text-[10px] ${
                      isSelected ? 'fill-blue-600 font-semibold' : 'fill-slate-400'
                    }`}
                  >
                    {d.dayLabel}
                  </text>
                </g>
              );
            })}

            {/* 透明交互感应立柱 (全高，方便鼠标移动捕捉悬浮) */}
            {data.map((d, i) => {
              const colW = PLOT_WIDTH / 6;
              const colX = xPoints[i] - colW / 2;
              return (
                <rect
                  key={`hit-${d.date}`}
                  x={colX}
                  y={0}
                  width={colW}
                  height={SVG_HEIGHT}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => {
                    onSelectDateIndex(i);
                    onShowToast(`已锁定聚焦至【${d.date} ${d.dayLabel}】数据节点`);
                  }}
                />
              );
            })}
          </svg>

          {/* 4. 浮动交互式 Tooltip 气泡卡片 */}
          <div
            className="absolute top-2 pointer-events-none transition-all duration-150 z-20"
            style={{
              left: `${Math.min(
                Math.max(10, ((xPoints[activeIndex] / SVG_WIDTH) * 100)),
                76
              )}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="bg-slate-900/95 backdrop-blur-md text-white p-2.5 rounded-xl shadow-xl border border-slate-700 text-xs min-w-[210px] flex flex-col gap-1.5 animate-fadeIn">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white font-mono">{activeItem.fullDate}</span>
                  <span className="text-[11px] text-slate-400">({activeItem.dayLabel})</span>
                </div>
                {activeIndex === selectedDateIndex ? (
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-blue-500/30 text-blue-300 border border-blue-400/40 font-mono">
                    当前聚焦
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-mono">点击锁定</span>
                )}
              </div>

              {/* 主指标数值与环比 */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-xs"
                    style={{ backgroundColor: metricMeta.primary.color }}
                  />
                  {metricMeta.primary.name}:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-white">
                    {metricMeta.primary.format(metricMeta.primary.getValue(activeItem))}
                  </span>
                  {dodChange && (
                    <span
                      className={`text-[10px] font-mono flex items-center ${
                        dodChange.p1Positive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {dodChange.p1Positive ? '↑' : '↓'}
                      {dodChange.p1Rate}%
                    </span>
                  )}
                </div>
              </div>

              {/* 副指标数值与环比 */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: metricMeta.secondary.color }}
                  />
                  {metricMeta.secondary.name}:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-amber-300">
                    {metricMeta.secondary.format(metricMeta.secondary.getValue(activeItem))}
                  </span>
                  {dodChange && (
                    <span
                      className={`text-[10px] font-mono flex items-center ${
                        dodChange.p2Positive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {dodChange.p2Positive ? '↑' : '↓'}
                      {dodChange.p2Rate}%
                    </span>
                  )}
                </div>
              </div>

              {/* 交易出卡人数与兑付率 */}
              <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>出卡交易用户: {activeItem.transUsers} 人</span>
                <span>兑付率: {activeItem.successRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. 底部 7 日切片日期快捷导航点选排 (与上方图表联动双通) */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pt-1">
        {data.map((item, idx) => {
          const isSelected = idx === selectedDateIndex;
          const isHovered = idx === hoveredIndex;
          const primaryVal = metricMeta.primary.getValue(item);

          return (
            <button
              key={item.date}
              type="button"
              onClick={() => {
                onSelectDateIndex(idx);
                onShowToast(`已聚焦定位至【${item.date} ${item.dayLabel}】数据节点`);
              }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex-1 min-w-[95px] p-2 rounded-xl transition-all cursor-pointer border text-left flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                  : isHovered
                  ? 'bg-slate-100 border-slate-300'
                  : 'bg-white hover:bg-slate-50 border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-mono font-bold ${
                    isSelected ? 'text-blue-700' : 'text-slate-800'
                  }`}
                >
                  {item.date}
                </span>
                <span className="text-[10px] text-slate-400">{item.dayLabel}</span>
              </div>
              <div className="mt-1">
                <span className="text-xs font-mono font-bold text-slate-900 block truncate">
                  {metricMeta.primary.format(primaryVal)}
                </span>
                <span className="text-[10px] font-mono text-slate-500 block truncate">
                  {metricMeta.secondary.format(metricMeta.secondary.getValue(item))}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
