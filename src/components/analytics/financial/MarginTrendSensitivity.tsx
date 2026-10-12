import React, { useState } from 'react';
import { MarginEvolutionPoint, CurrencyMode } from './types';
import { formatCurrencyValue } from './mockData';

interface MarginTrendSensitivityProps {
  trendPoints: MarginEvolutionPoint[];
  currency: CurrencyMode;
  onOpenSimulation: () => void;
}

export const MarginTrendSensitivity: React.FC<MarginTrendSensitivityProps> = ({
  trendPoints,
  currency,
  onOpenSimulation,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<MarginEvolutionPoint | null>(null);

  // Coordinates mapping for 6 points across viewBox 0 0 600 160
  // min margin ~3.4%, max ~4.2%
  const xCoords = [30, 140, 250, 360, 470, 570];
  const yCoords = [130, 112, 95, 70, 45, 22];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
      {/* Left 2 Columns: SVG Chart */}
      <div className="lg:col-span-2 bg-white p-4 sm:p-5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2">
          <div className="flex flex-col">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <span>近 6 个月综合净毛利率演进趋势 (Net Margin Evolution)</span>
            </h3>
            <span className="text-xs text-slate-500 mt-0.5">
              从 3.52% (2026-03) 稳步提升至 4.09% (2026-08)，利差空间健康扩张
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-code-token text-[11px] font-bold border border-emerald-200/60 self-start sm:self-auto shrink-0">
            +57 bps 净改善
          </span>
        </div>

        {/* Interactive SVG Line Trend Visualization */}
        <div className="w-full h-52 py-2 relative flex items-end">
          <svg
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
            viewBox="0 0 600 160"
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Lines */}
            <line
              className="text-slate-100"
              stroke="currentColor"
              strokeDasharray="3,3"
              strokeWidth="1"
              x1="0"
              x2="600"
              y1="22"
              y2="22"
            />
            <line
              className="text-slate-100"
              stroke="currentColor"
              strokeDasharray="3,3"
              strokeWidth="1"
              x1="0"
              x2="600"
              y1="68"
              y2="68"
            />
            <line
              className="text-slate-100"
              stroke="currentColor"
              strokeDasharray="3,3"
              strokeWidth="1"
              x1="0"
              x2="600"
              y1="112"
              y2="112"
            />

            {/* Area Shading */}
            <path
              d="M 30,130 L 140,112 L 250,95 L 360,70 L 470,45 L 570,22 L 570,150 L 30,150 Z"
              fill="url(#areaGradient)"
            />

            {/* Trajectory Line */}
            <path
              d="M 30,130 L 140,112 L 250,95 L 360,70 L 470,45 L 570,22"
              fill="none"
              stroke="#2563eb"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            />

            {/* Data Point Anchors & Labels */}
            {trendPoints.map((pt, idx) => {
              const cx = xCoords[idx];
              const cy = yCoords[idx];
              const isLast = idx === trendPoints.length - 1;

              return (
                <g
                  key={pt.month}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isLast ? 6 : 4.5}
                    className={
                      isLast
                        ? 'fill-emerald-600 stroke-white stroke-[2] drop-shadow-xs transition-transform group-hover:scale-125'
                        : 'fill-white stroke-blue-600 stroke-[2] transition-transform group-hover:scale-125'
                    }
                  />

                  {/* Margin label */}
                  <text
                    x={cx}
                    y={cy - 10}
                    textAnchor="middle"
                    className={`font-numeric-stat text-[11px] ${
                      isLast
                        ? 'font-bold fill-emerald-700'
                        : 'fill-slate-600 font-medium'
                    }`}
                  >
                    {pt.netMarginPercent.toFixed(2)}%
                  </text>

                  {/* Month label */}
                  <text
                    x={cx}
                    y={158}
                    textAnchor="middle"
                    className={`font-code-token text-[10px] ${
                      isLast ? 'font-bold fill-emerald-700' : 'fill-slate-400'
                    }`}
                  >
                    {pt.month}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Floating Hover Card */}
          {hoveredPoint && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg text-xs font-code-token shadow-lg border border-slate-700 pointer-events-none z-10 flex items-center gap-3">
              <span>{hoveredPoint.month}</span>
              <span className="text-emerald-400 font-bold">
                净毛利: {hoveredPoint.netMarginPercent}%
              </span>
              <span className="text-slate-300">
                GMV: {formatCurrencyValue(hoveredPoint.gmv, currency, false, true)}
              </span>
              <span className="text-blue-300">
                净留存: {formatCurrencyValue(hoveredPoint.netProfit, currency, false, true)}
              </span>
            </div>
          )}
        </div>

        {/* Footer Insight */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-1.5">
          <span>
            驱动要素：Steam高毛利SKU渗透率增长 + 自动化即时验卡降低售后坏账损耗 38%
          </span>
          <span className="font-code-token text-emerald-700 font-semibold shrink-0">
            健康评级: AA (优质留存)
          </span>
        </div>
      </div>

      {/* Right 1 Column: Sensitivity & Strategic Tuning */}
      <div className="bg-white p-4 sm:p-5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">tune</span>
            </span>
            <div className="flex flex-col">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                成本弹性与运营调优
              </h3>
              <span className="text-xs text-slate-500">敏感度模拟测算 (Simulation)</span>
            </div>
          </div>

          {/* Sensitivity Card 1 */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-[11px] text-slate-800 font-semibold">
                分成调整敏感度
              </span>
              <span className="font-code-token text-xs text-emerald-700 font-bold">
                + {formatCurrencyValue(2850, currency)}/月
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              若将大商户裂变分成整体下调{' '}
              <strong className="text-slate-900 font-numeric-stat">0.20%</strong>
              ，在不影响供给弹性的前提下，预计月净毛利直接扩充 $2,850。
            </p>
          </div>

          {/* Sensitivity Card 2 */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-[11px] text-slate-800 font-semibold">
                慢卡预付风控预警
              </span>
              <span className="font-code-token text-xs text-rose-600 font-bold">
                - 85 bps 拖累
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Vanilla卡种由于核销延时产生 $1,590 争议扣款。建议对未认证商户强制提升保证金阈值至{' '}
              <strong className="text-slate-900 font-numeric-stat">20%</strong>。
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={onOpenSimulation}
            className="w-full py-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-blue-200/60 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">psychology</span>
            <span>运行实时边际利润仿真测算</span>
          </button>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between font-code-token text-[11px] text-slate-400">
          <span>模型版本: UE-Sim v4.2</span>
          <span>更新频率: 每小时自动重算</span>
        </div>
      </div>
    </div>
  );
};
