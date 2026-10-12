import React, { useState } from 'react';

type MetricType = 'gmv' | 'buyers' | 'margin';

export const DualAxisTrendSection: React.FC = () => {
  const [activeMetric, setActiveMetric] = useState<MetricType>('gmv');
  const [showCompare, setShowCompare] = useState<boolean>(true);
  const [hoveredPoint, setHoveredPoint] = useState<{
    index: number;
    time: string;
    gmv: number;
    prevGmv: number;
    buyers: number;
    margin: number;
    rate: string;
    x: number;
    y: number;
  } | null>(null);

  // Time points: 00:00, 03:00, 06:00, 09:00, 12:00, 15:00 (now), 18:00, 21:00, 23:59
  const points = [
    { hour: '00:00', x: 0, yGmv: 160, yPrev: 165, yBuy: 175, gmv: 34200, prevGmv: 28900, buyers: 182, margin: 1390, rate: '98.2%' },
    { hour: '03:00', x: 125, yGmv: 152, yPrev: 160, yBuy: 170, gmv: 48500, prevGmv: 36000, buyers: 210, margin: 1980, rate: '98.5%' },
    { hour: '06:00', x: 250, yGmv: 128, yPrev: 140, yBuy: 155, gmv: 88400, prevGmv: 74200, buyers: 380, margin: 3620, rate: '98.8%' },
    { hour: '09:00', x: 375, yGmv: 102, yPrev: 122, yBuy: 135, gmv: 142000, prevGmv: 119000, buyers: 560, margin: 5820, rate: '99.1%' },
    { hour: '12:00', x: 500, yGmv: 78, yPrev: 105, yBuy: 112, gmv: 198000, prevGmv: 156000, buyers: 720, margin: 8110, rate: '99.4%' },
    { hour: '15:00', x: 620, yGmv: 35, yPrev: 78, yBuy: 68, gmv: 284500, prevGmv: 192000, buyers: 1140, margin: 11650, rate: '99.6%', isPeak: true },
    { hour: '18:00', x: 750, yGmv: 55, yPrev: 95, yBuy: 85, gmv: 236000, prevGmv: 178000, buyers: 960, margin: 9670, rate: '99.4%' },
    { hour: '21:00', x: 880, yGmv: 95, yPrev: 120, yBuy: 130, gmv: 164000, prevGmv: 132000, buyers: 640, margin: 6720, rate: '99.0%' },
    { hour: '23:59', x: 1000, yGmv: 75, yPrev: 105, yBuy: 110, gmv: 192000, prevGmv: 145000, buyers: 780, margin: 7860, rate: '99.2%' },
  ];

  return (
    <section className="bg-white p-5 rounded-xl shadow-xs border border-slate-200/80">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-headline-md text-base font-bold text-slate-900">
              经营核心走势双轴透视
            </h3>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-code-token text-[11px] font-semibold border border-blue-100">
              24h 实时时序粒度
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            跨维度比对交易流水走势 (GMV)、出卡用户波峰与毛利生成速率，辅助资金调拨与峰值承揽调度
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Metric Toggles */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/60 text-xs">
            <button
              onClick={() => setActiveMetric('gmv')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMetric === 'gmv'
                  ? 'bg-white text-blue-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>GMV 流水</span>
            </button>
            <button
              onClick={() => setActiveMetric('buyers')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMetric === 'buyers'
                  ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>活跃买家</span>
            </button>
            <button
              onClick={() => setActiveMetric('margin')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMetric === 'margin'
                  ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>毛利曲线</span>
            </button>
          </div>

          {/* Comparison Mode Switch */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-lg text-xs text-slate-700">
            <input
              id="comparePrev"
              type="checkbox"
              checked={showCompare}
              onChange={(e) => setShowCompare(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="comparePrev" className="cursor-pointer select-none text-slate-600 hover:text-slate-900">
              环比前一周期叠图对照
            </label>
          </div>
        </div>
      </div>

      {/* Trend Visualization Canvas with Precision Annotations */}
      <div className="relative w-full h-72 bg-slate-50/60 rounded-xl p-4 flex flex-col justify-between overflow-hidden border border-slate-200/60">
        {/* Peak Zone Highlighting Badge */}
        <div className="absolute left-[52%] top-3 z-10 bg-white/95 backdrop-blur-xs shadow-sm rounded-lg px-2.5 py-1.5 flex items-center gap-2 border border-blue-200/80">
          <span className="material-symbols-outlined text-blue-600 text-[18px]">bolt</span>
          <div className="flex flex-col">
            <span className="font-label-caps text-[10px] text-blue-700 uppercase font-bold tracking-wider leading-tight">
              峰值活跃时段 (Peak Range)
            </span>
            <span className="text-xs text-slate-900 font-semibold">
              14:00 ~ 19:00 WAT · 转化率 99.4%
            </span>
          </div>
        </div>

        {/* Floating Tooltip when hovering points */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900 text-white rounded-lg px-3 py-2 text-xs shadow-xl border border-slate-700 transition-all -translate-x-1/2 -translate-y-full mb-2"
            style={{ left: `${(hoveredPoint.x / 1000) * 100}%`, top: `${hoveredPoint.y}px` }}
          >
            <div className="flex items-center justify-between gap-3 font-semibold pb-1 border-b border-slate-700">
              <span>{hoveredPoint.time} 时序切片</span>
              <span className="font-code-token text-emerald-400">核销率 {hoveredPoint.rate}</span>
            </div>
            <div className="mt-1.5 space-y-0.5 font-numeric-table text-[11px]">
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">GMV 流水:</span>
                <span className="font-bold text-white">${hoveredPoint.gmv.toLocaleString()}</span>
              </div>
              {showCompare && (
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400">前周期 GMV:</span>
                  <span className="text-slate-300">${hoveredPoint.prevGmv.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">活跃买家:</span>
                <span className="text-emerald-400 font-semibold">{hoveredPoint.buyers} 人</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">净留存毛利:</span>
                <span className="text-indigo-400 font-semibold">${hoveredPoint.margin.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Inline SVG Multi-Axis Line Chart */}
        <svg
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
          viewBox="0 0 1000 220"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="gmvAreaGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#004ac6" stopOpacity="0.22"></stop>
              <stop offset="100%" stopColor="#004ac6" stopOpacity="0.00"></stop>
            </linearGradient>
            <linearGradient id="secondaryGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#006c49" stopOpacity="0.16"></stop>
              <stop offset="100%" stopColor="#006c49" stopOpacity="0.00"></stop>
            </linearGradient>
            <linearGradient id="marginGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#3e3fcc" stopOpacity="0.20"></stop>
              <stop offset="100%" stopColor="#3e3fcc" stopOpacity="0.00"></stop>
            </linearGradient>
          </defs>

          {/* Grid Background Lines */}
          <line stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="1000" y1="40" y2="40"></line>
          <line stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="1000" y1="90" y2="90"></line>
          <line stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="1000" y1="140" y2="140"></line>
          <line stroke="#cbd5e1" strokeWidth="1.2" x1="0" x2="1000" y1="190" y2="190"></line>

          {/* Peak Shaded Band */}
          <rect fill="#2563eb" fillOpacity="0.06" height="170" rx="6" width="220" x="520" y="20"></rect>

          {/* Compared Curve (Previous Period Dotted) */}
          {showCompare && (
            <path
              d="M 0,165 Q 120,160 250,140 T 500,110 T 620,80 T 750,95 T 880,120 T 1000,105"
              fill="none"
              stroke="#94a3b8"
              strokeDasharray="4 4"
              strokeOpacity="0.8"
              strokeWidth="2"
            ></path>
          )}

          {/* GMV Main Fill Area (shown when gmv or margin is active) */}
          {activeMetric === 'gmv' && (
            <>
              <path
                d="M 0,160 Q 120,150 250,125 T 500,85 T 620,35 T 750,55 T 880,95 T 1000,75 L 1000,190 L 0,190 Z"
                fill="url(#gmvAreaGrad)"
              ></path>
              <path
                d="M 0,160 Q 120,150 250,125 T 500,85 T 620,35 T 750,55 T 880,95 T 1000,75"
                fill="none"
                stroke="#004ac6"
                strokeWidth="2.8"
              ></path>
            </>
          )}

          {/* Active Buyer Trend (Secondary Green) */}
          {activeMetric === 'buyers' && (
            <>
              <path
                d="M 0,175 Q 130,170 260,155 T 510,120 T 630,70 T 760,85 T 890,130 T 1000,110 L 1000,190 L 0,190 Z"
                fill="url(#secondaryGrad)"
              ></path>
              <path
                d="M 0,175 Q 130,170 260,155 T 510,120 T 630,70 T 760,85 T 890,130 T 1000,110"
                fill="none"
                stroke="#006c49"
                strokeWidth="2.8"
              ></path>
            </>
          )}

          {/* Margin Curve (Tertiary Purple) */}
          {activeMetric === 'margin' && (
            <>
              <path
                d="M 0,180 Q 130,175 260,160 T 510,130 T 630,85 T 760,105 T 890,145 T 1000,125 L 1000,190 L 0,190 Z"
                fill="url(#marginGrad)"
              ></path>
              <path
                d="M 0,180 Q 130,175 260,160 T 510,130 T 630,85 T 760,105 T 890,145 T 1000,125"
                fill="none"
                stroke="#3e3fcc"
                strokeWidth="2.8"
              ></path>
            </>
          )}

          {/* Anchor Point Callout on Peak (620, 35) */}
          <circle className="animate-ping origin-center" cx="620" cy="35" fill="#004ac6" opacity="0.6" r="6"></circle>
          <circle cx="620" cy="35" fill="#ffffff" r="4.5" stroke="#004ac6" strokeWidth="2.5"></circle>
          <circle cx="630" cy="70" fill="#ffffff" r="4" stroke="#006c49" strokeWidth="2.2"></circle>

          {/* Interactive Hover Detection Nodes */}
          {points.map((pt, idx) => (
            <g key={idx} className="cursor-pointer">
              <rect
                x={pt.x - 20}
                y={0}
                width={40}
                height={220}
                fill="transparent"
                onMouseEnter={() =>
                  setHoveredPoint({
                    index: idx,
                    time: pt.hour,
                    gmv: pt.gmv,
                    prevGmv: pt.prevGmv,
                    buyers: pt.buyers,
                    margin: pt.margin,
                    rate: pt.rate,
                    x: pt.x,
                    y: activeMetric === 'gmv' ? pt.yGmv : activeMetric === 'buyers' ? pt.yBuy : pt.yGmv + 20,
                  })
                }
              />
              {hoveredPoint?.index === idx && (
                <>
                  <line
                    x1={pt.x}
                    x2={pt.x}
                    y1={20}
                    y2={190}
                    stroke="#2563eb"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                  <circle
                    cx={pt.x}
                    cy={activeMetric === 'gmv' ? pt.yGmv : activeMetric === 'buyers' ? pt.yBuy : pt.yGmv + 20}
                    r="5"
                    fill="#2563eb"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </>
              )}
            </g>
          ))}
        </svg>

        {/* Timeline X-Axis Labels */}
        <div className="flex items-center justify-between text-slate-500 font-code-token text-[11px] pt-2 border-t border-slate-200/80">
          <span>00:00</span>
          <span>03:00</span>
          <span>06:00</span>
          <span>09:00</span>
          <span>12:00</span>
          <span className="text-blue-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            15:00 (实时当前)
          </span>
          <span>18:00</span>
          <span>21:00</span>
          <span>23:59</span>
        </div>
      </div>

      {/* Quick Indicator Sub-Bar below chart */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 mt-4">
        <div className="flex flex-col">
          <span className="font-label-caps text-[11px] text-slate-400 font-semibold uppercase">
            分时最高吞吐峰值
          </span>
          <span className="font-numeric-table font-bold text-slate-900 text-sm mt-0.5">
            $142,650.00 / 小时
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-label-caps text-[11px] text-slate-400 font-semibold uppercase">
            撮合引擎时钟延迟
          </span>
          <span className="font-numeric-table font-bold text-emerald-600 text-sm mt-0.5 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            24.2 ms (极速)
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-label-caps text-[11px] text-slate-400 font-semibold uppercase">
            环比增长斜率
          </span>
          <span className="font-numeric-table font-bold text-blue-600 text-sm mt-0.5">
            +1.42x 稳态上行
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-label-caps text-[11px] text-slate-400 font-semibold uppercase">
            事件标记
          </span>
          <span className="text-xs font-semibold text-slate-800 mt-0.5 truncate" title="美区 Steam 大促促销拉动">
            美区 Steam 大促促销拉动
          </span>
        </div>
      </div>
    </section>
  );
};
