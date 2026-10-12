import React, { useState, useMemo } from 'react';

export interface MerchantDailyTrendItem {
  date: string; // e.g. '08-21'
  fullDate: string; // e.g. '2026-08-21'
  dayLabel: string; // e.g. '周五'
  gmvUsd: number; // e.g. 1180000
  ordersAccepted: number; // e.g. 10100
  ordersSuccess: number; // e.g. 9928
  successRate: number; // % e.g. 98.30
  avgResponseSec: number; // e.g. 16.2
  avgFulfillmentSec: number; // e.g. 42.5
  rejectRate: number; // % e.g. 0.88
  disputeRate: number; // % e.g. 0.19
  activeMerchantsCount: number; // e.g. 82
}

export type MerchantTrendViewMode = 'gmv-orders' | 'sla-quality' | 'risk-friction';
export type ChartStyleMode = 'composite' | 'area' | 'bar';

export interface MerchantSevenDayTrendChartProps {
  data: MerchantDailyTrendItem[];
  trendView: MerchantTrendViewMode;
  onTrendViewChange: (view: MerchantTrendViewMode) => void;
  selectedDateIndex: number;
  onSelectDateIndex: (index: number) => void;
  onShowToast: (msg: string) => void;
}

export const MerchantSevenDayTrendChart: React.FC<MerchantSevenDayTrendChartProps> = ({
  data,
  trendView,
  onTrendViewChange,
  selectedDateIndex,
  onSelectDateIndex,
  onShowToast,
}) => {
  const [chartStyle, setChartStyle] = useState<ChartStyleMode>('composite');
  const [showBenchmark, setShowBenchmark] = useState<boolean>(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 配置当前视角下的主指标与副指标元数据
  const metricMeta = useMemo(() => {
    switch (trendView) {
      case 'gmv-orders':
        return {
          title: '商户承揽总额 (GMV) 与完单量时序走势',
          desc: '全网商户接单承兑体量与订单流转密度的时序关联分析',
          primary: {
            name: '承揽总额 (GMV)',
            unit: 'USD',
            color: '#2563eb', // blue-600
            gradStart: '#3b82f6',
            gradEnd: '#1d4ed8',
            getValue: (d: MerchantDailyTrendItem) => d.gmvUsd,
            format: (v: number) => `$${v.toLocaleString()} USD`,
            min: 1100000,
            max: 1500000,
            step: 100000,
          },
          secondary: {
            name: '完单数量',
            unit: '笔',
            color: '#10b981', // emerald-500
            gradStart: '#34d399',
            gradEnd: '#059669',
            getValue: (d: MerchantDailyTrendItem) => d.ordersSuccess,
            format: (v: number) => `${v.toLocaleString()} 笔`,
            min: 9500,
            max: 13000,
            step: 700,
          },
        };
      case 'sla-quality':
        return {
          title: '做卡成功率与平均响应时效时序走势',
          desc: '商户核销准时履约质量与接单响应延迟的动态平衡监控',
          primary: {
            name: '做卡成功率',
            unit: '%',
            color: '#0284c7', // sky-600
            gradStart: '#38bdf8',
            gradEnd: '#0369a1',
            getValue: (d: MerchantDailyTrendItem) => d.successRate,
            format: (v: number) => `${v.toFixed(2)}%`,
            min: 97.5,
            max: 99.2,
            step: 0.4,
          },
          secondary: {
            name: '平均响应时效',
            unit: '秒',
            color: '#f59e0b', // amber-500
            gradStart: '#fbbf24',
            gradEnd: '#d97706',
            getValue: (d: MerchantDailyTrendItem) => d.avgResponseSec,
            format: (v: number) => `${v.toFixed(1)}s`,
            min: 12.0,
            max: 18.0,
            step: 1.5,
          },
        };
      case 'risk-friction':
        return {
          title: '主动拒单率与争议纠纷率风控走势',
          desc: '商户端承揽摩擦力与异常卡单逆向申诉时序监控',
          primary: {
            name: '主动拒单率',
            unit: '%',
            color: '#e11d48', // rose-600
            gradStart: '#f43f5e',
            gradEnd: '#be123c',
            getValue: (d: MerchantDailyTrendItem) => d.rejectRate,
            format: (v: number) => `${v.toFixed(2)}%`,
            min: 0.5,
            max: 1.1,
            step: 0.15,
          },
          secondary: {
            name: '争议纠纷率',
            unit: '%',
            color: '#8b5cf6', // purple-500
            gradStart: '#a78bfa',
            gradEnd: '#7c3aed',
            getValue: (d: MerchantDailyTrendItem) => d.disputeRate,
            format: (v: number) => `${v.toFixed(2)}%`,
            min: 0.1,
            max: 0.25,
            step: 0.05,
          },
        };
    }
  }, [trendView]);

  // 坐标系常数 (SVG viewBox 920 x 280)
  const SVG_WIDTH = 920;
  const SVG_HEIGHT = 280;
  const PADDING_TOP = 25;
  const PADDING_BOTTOM = 45;
  const PADDING_LEFT = 70;
  const PADDING_RIGHT = 70;

  const PLOT_WIDTH = SVG_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const PLOT_HEIGHT = SVG_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  const n = data.length;
  const xStep = PLOT_WIDTH / (n - 1 || 1);

  // Y 坐标映射函数
  const getYPrimary = (val: number) => {
    const { min, max } = metricMeta.primary;
    const ratio = (val - min) / (max - min || 1);
    const clamped = Math.max(0, Math.min(1, ratio));
    return PADDING_TOP + PLOT_HEIGHT * (1 - clamped);
  };

  const getYSecondary = (val: number) => {
    const { min, max } = metricMeta.secondary;
    const ratio = (val - min) / (max - min || 1);
    const clamped = Math.max(0, Math.min(1, ratio));
    return PADDING_TOP + PLOT_HEIGHT * (1 - clamped);
  };

  // 生成折线与区域路径
  const primaryPoints = useMemo(() => {
    return data.map((d, i) => ({
      x: PADDING_LEFT + i * xStep,
      y: getYPrimary(metricMeta.primary.getValue(d)),
      val: metricMeta.primary.getValue(d),
      raw: d,
    }));
  }, [data, xStep, metricMeta.primary]);

  const secondaryPoints = useMemo(() => {
    return data.map((d, i) => ({
      x: PADDING_LEFT + i * xStep,
      y: getYSecondary(metricMeta.secondary.getValue(d)),
      val: metricMeta.secondary.getValue(d),
      raw: d,
    }));
  }, [data, xStep, metricMeta.secondary]);

  // 生成平滑贝塞尔曲线或折线
  const makeSmoothLinePath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return path;
  };

  const primaryLinePath = useMemo(() => makeSmoothLinePath(primaryPoints), [primaryPoints]);
  const secondaryLinePath = useMemo(() => makeSmoothLinePath(secondaryPoints), [secondaryPoints]);

  const primaryAreaPath = useMemo(() => {
    if (primaryPoints.length === 0) return '';
    const line = makeSmoothLinePath(primaryPoints);
    const lastX = primaryPoints[primaryPoints.length - 1].x;
    const firstX = primaryPoints[0].x;
    const bottomY = PADDING_TOP + PLOT_HEIGHT;
    return `${line} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [primaryPoints]);

  // 基准均值计算
  const avgPrimaryVal = useMemo(() => {
    return data.reduce((acc, cur) => acc + metricMeta.primary.getValue(cur), 0) / (data.length || 1);
  }, [data, metricMeta.primary]);
  const avgPrimaryY = getYPrimary(avgPrimaryVal);

  const activeFocusIndex = hoveredIndex !== null ? hoveredIndex : selectedDateIndex;
  const activeFocusItem = data[activeFocusIndex] || data[data.length - 1];

  return (
    <div className="flex flex-col gap-3.5">
      {/* 1. 图表顶层多重视角切换与样式控制器 */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-700 font-label-caps uppercase tracking-wider">
            分析视角:
          </span>
          <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs text-xs">
            <button
              type="button"
              onClick={() => {
                onTrendViewChange('gmv-orders');
                onShowToast('已切换至【承揽GMV与完单量时序走势】');
              }}
              className={`px-3 py-1 rounded-md transition-all font-medium cursor-pointer flex items-center gap-1.5 ${
                trendView === 'gmv-orders'
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>承揽GMV / 完单单量</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onTrendViewChange('sla-quality');
                onShowToast('已切换至【做卡成功率与响应时效时序走势】');
              }}
              className={`px-3 py-1 rounded-md transition-all font-medium cursor-pointer flex items-center gap-1.5 ${
                trendView === 'sla-quality'
                  ? 'bg-sky-50 text-sky-700 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-sky-600" />
              <span>履约成功率 / 响应时效</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onTrendViewChange('risk-friction');
                onShowToast('已切换至【主动拒单率与争议纠纷率风控走势】');
              }}
              className={`px-3 py-1 rounded-md transition-all font-medium cursor-pointer flex items-center gap-1.5 ${
                trendView === 'risk-friction'
                  ? 'bg-rose-50 text-rose-700 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              <span>拒单率 / 争议率</span>
            </button>
          </div>
        </div>

        {/* 右侧交互控件：图表形态、参考线开关 */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setChartStyle('composite')}
              className={`px-2 py-1 rounded-md transition-all font-medium cursor-pointer ${
                chartStyle === 'composite' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-500'
              }`}
              title="双轴柱线复合图"
            >
              柱线复合
            </button>
            <button
              type="button"
              onClick={() => setChartStyle('area')}
              className={`px-2 py-1 rounded-md transition-all font-medium cursor-pointer ${
                chartStyle === 'area' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-500'
              }`}
              title="平滑面积走势图"
            >
              平滑面积
            </button>
            <button
              type="button"
              onClick={() => setChartStyle('bar')}
              className={`px-2 py-1 rounded-md transition-all font-medium cursor-pointer ${
                chartStyle === 'bar' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-500'
              }`}
              title="对比柱状图"
            >
              对比柱图
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowBenchmark(!showBenchmark)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
              showBenchmark
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">
              {showBenchmark ? 'check_box' : 'check_box_outline_blank'}
            </span>
            <span>7日均值基准</span>
          </button>
        </div>
      </div>

      {/* 2. 图例栏与指标当前对准值 */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-xs"
              style={{ backgroundColor: metricMeta.primary.color }}
            />
            <span className="text-slate-700 font-semibold">{metricMeta.primary.name}</span>
            <span className="text-slate-400 font-mono text-[11px]">({metricMeta.primary.unit})</span>
            <span className="font-numeric-stat font-bold text-slate-900 ml-1">
              {metricMeta.primary.format(metricMeta.primary.getValue(activeFocusItem))}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-xs"
              style={{ backgroundColor: metricMeta.secondary.color }}
            />
            <span className="text-slate-700 font-semibold">{metricMeta.secondary.name}</span>
            <span className="text-slate-400 font-mono text-[11px]">({metricMeta.secondary.unit})</span>
            <span className="font-numeric-stat font-bold text-slate-900 ml-1">
              {metricMeta.secondary.format(metricMeta.secondary.getValue(activeFocusItem))}
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          <span>聚焦周期: {activeFocusItem.fullDate} ({activeFocusItem.dayLabel})</span>
          <span className="text-slate-400">· 点击下方任意日期可固定聚焦</span>
        </div>
      </div>

      {/* 3. 矢量图表画布 (SVG 响应式渲染) */}
      <div className="relative w-full bg-white rounded-xl border border-slate-200/90 p-2 shadow-2xs select-none overflow-hidden">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-auto max-h-[300px] overflow-visible"
        >
          <defs>
            {/* 主指标渐变 */}
            <linearGradient id="merchantPrimaryGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={metricMeta.primary.gradStart} stopOpacity="0.35" />
              <stop offset="100%" stopColor={metricMeta.primary.gradEnd} stopOpacity="0.02" />
            </linearGradient>

            {/* 副指标渐变 */}
            <linearGradient id="merchantSecondaryGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={metricMeta.secondary.gradStart} stopOpacity="0.30" />
              <stop offset="100%" stopColor={metricMeta.secondary.gradEnd} stopOpacity="0.02" />
            </linearGradient>

            {/* 柱状图主副渐变 */}
            <linearGradient id="merchantBarGradPrimary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={metricMeta.primary.gradStart} />
              <stop offset="100%" stopColor={metricMeta.primary.gradEnd} />
            </linearGradient>
            <linearGradient id="merchantBarGradSecondary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={metricMeta.secondary.gradStart} />
              <stop offset="100%" stopColor={metricMeta.secondary.gradEnd} />
            </linearGradient>
          </defs>

          {/* 背景水平网格线与 Y 轴刻度标签 */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = PADDING_TOP + PLOT_HEIGHT * ratio;
            const primaryVal = metricMeta.primary.max - ratio * (metricMeta.primary.max - metricMeta.primary.min);
            const secondaryVal = metricMeta.secondary.max - ratio * (metricMeta.secondary.max - metricMeta.secondary.min);

            return (
              <g key={idx}>
                {/* 横向网格线 */}
                <line
                  x1={PADDING_LEFT}
                  y1={y}
                  x2={SVG_WIDTH - PADDING_RIGHT}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray={idx === 4 ? '' : '3 3'}
                />

                {/* 左 Y 轴刻度 (主指标) */}
                <text
                  x={PADDING_LEFT - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize="10.5"
                  fill="#64748b"
                  fontFamily="monospace"
                  fontWeight="500"
                >
                  {metricMeta.primary.format(primaryVal)}
                </text>

                {/* 右 Y 轴刻度 (副指标) */}
                <text
                  x={SVG_WIDTH - PADDING_RIGHT + 10}
                  y={y + 3.5}
                  textAnchor="start"
                  fontSize="10.5"
                  fill="#64748b"
                  fontFamily="monospace"
                  fontWeight="500"
                >
                  {metricMeta.secondary.format(secondaryVal)}
                </text>
              </g>
            );
          })}

          {/* 7日基准线 (如果开启) */}
          {showBenchmark && (
            <g>
              <line
                x1={PADDING_LEFT}
                y1={avgPrimaryY}
                x2={SVG_WIDTH - PADDING_RIGHT}
                y2={avgPrimaryY}
                stroke={metricMeta.primary.color}
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.6"
              />
              <text
                x={SVG_WIDTH - PADDING_RIGHT - 8}
                y={avgPrimaryY - 4}
                textAnchor="end"
                fontSize="9.5"
                fill={metricMeta.primary.color}
                fontFamily="monospace"
                fontWeight="bold"
              >
                7日均线 {metricMeta.primary.format(avgPrimaryVal)}
              </text>
            </g>
          )}

          {/* 模式 A: 柱线复合图 (主指标柱状 + 副指标折线面积) */}
          {chartStyle === 'composite' && (
            <>
              {/* 主指标柱状 */}
              {primaryPoints.map((pt, i) => {
                const barWidth = 34;
                const barHeight = PADDING_TOP + PLOT_HEIGHT - pt.y;
                const isSelected = selectedDateIndex === i;
                const isHovered = hoveredIndex === i;

                return (
                  <rect
                    key={`bar-${i}`}
                    x={pt.x - barWidth / 2}
                    y={pt.y}
                    width={barWidth}
                    height={barHeight}
                    rx="4"
                    fill="url(#merchantBarGradPrimary)"
                    opacity={isSelected || isHovered ? 1 : 0.82}
                    className="transition-all duration-200 cursor-pointer"
                    onClick={() => onSelectDateIndex(i)}
                  />
                );
              })}

              {/* 副指标平滑面积与折线 */}
              <path
                d={secondaryLinePath}
                fill="none"
                stroke={metricMeta.secondary.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {secondaryPoints.map((pt, i) => (
                <circle
                  key={`sec-dot-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={selectedDateIndex === i || hoveredIndex === i ? 6 : 4}
                  fill="#ffffff"
                  stroke={metricMeta.secondary.color}
                  strokeWidth="2.5"
                  className="transition-all duration-200 cursor-pointer"
                  onClick={() => onSelectDateIndex(i)}
                />
              ))}
            </>
          )}

          {/* 模式 B: 平滑双轴面积图 */}
          {chartStyle === 'area' && (
            <>
              {/* 主指标面积 */}
              <path d={primaryAreaPath} fill="url(#merchantPrimaryGrad)" />
              <path
                d={primaryLinePath}
                fill="none"
                stroke={metricMeta.primary.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 副指标折线 */}
              <path
                d={secondaryLinePath}
                fill="none"
                stroke={metricMeta.secondary.color}
                strokeWidth="2.5"
                strokeDasharray="5 3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 关键节点 */}
              {primaryPoints.map((pt, i) => (
                <g key={`area-dots-${i}`}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={selectedDateIndex === i || hoveredIndex === i ? 6 : 4}
                    fill="#ffffff"
                    stroke={metricMeta.primary.color}
                    strokeWidth="2.5"
                    className="cursor-pointer"
                    onClick={() => onSelectDateIndex(i)}
                  />
                  <circle
                    cx={secondaryPoints[i].x}
                    cy={secondaryPoints[i].y}
                    r={selectedDateIndex === i || hoveredIndex === i ? 5 : 3.5}
                    fill="#ffffff"
                    stroke={metricMeta.secondary.color}
                    strokeWidth="2"
                    className="cursor-pointer"
                    onClick={() => onSelectDateIndex(i)}
                  />
                </g>
              ))}
            </>
          )}

          {/* 模式 C: 对比双柱图 */}
          {chartStyle === 'bar' && (
            <>
              {primaryPoints.map((pt, i) => {
                const barW = 20;
                const gap = 3;
                const bar1Height = PADDING_TOP + PLOT_HEIGHT - pt.y;
                const bar2Height = PADDING_TOP + PLOT_HEIGHT - secondaryPoints[i].y;

                return (
                  <g key={`dual-bar-${i}`} onClick={() => onSelectDateIndex(i)} className="cursor-pointer">
                    {/* 主指标柱 */}
                    <rect
                      x={pt.x - barW - gap / 2}
                      y={pt.y}
                      width={barW}
                      height={bar1Height}
                      rx="3"
                      fill="url(#merchantBarGradPrimary)"
                    />
                    {/* 副指标柱 */}
                    <rect
                      x={pt.x + gap / 2}
                      y={secondaryPoints[i].y}
                      width={barW}
                      height={bar2Height}
                      rx="3"
                      fill="url(#merchantBarGradSecondary)"
                    />
                  </g>
                );
              })}
            </>
          )}

          {/* X 轴刻度与交互触发热区 */}
          {data.map((d, i) => {
            const x = PADDING_LEFT + i * xStep;
            const isSelected = selectedDateIndex === i;
            const isHovered = hoveredIndex === i;

            return (
              <g
                key={`x-axis-${i}`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSelectDateIndex(i)}
                className="cursor-pointer"
              >
                {/* 聚焦垂直指示线与光柱 */}
                {(isSelected || isHovered) && (
                  <>
                    <rect
                      x={x - xStep / 2 + 5}
                      y={PADDING_TOP}
                      width={xStep - 10}
                      height={PLOT_HEIGHT}
                      fill="#3b82f6"
                      opacity="0.06"
                      rx="4"
                    />
                    <line
                      x1={x}
                      y1={PADDING_TOP}
                      x2={x}
                      y2={PADDING_TOP + PLOT_HEIGHT}
                      stroke="#3b82f6"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  </>
                )}

                {/* X 轴日期文本 */}
                <text
                  x={x}
                  y={SVG_HEIGHT - 22}
                  textAnchor="middle"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight={isSelected || isHovered ? 'bold' : 'normal'}
                  fill={isSelected ? '#1d4ed8' : isHovered ? '#0f172a' : '#64748b'}
                >
                  {d.date}
                </text>
                <text
                  x={x}
                  y={SVG_HEIGHT - 8}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  fill={isSelected ? '#2563eb' : '#94a3b8'}
                >
                  {d.dayLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
