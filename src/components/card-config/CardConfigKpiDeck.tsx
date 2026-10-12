import React from 'react';
import { CardConfigKpiData } from './types';

interface CardConfigKpiDeckProps {
  kpi: CardConfigKpiData;
}

export const CardConfigKpiDeck: React.FC<CardConfigKpiDeckProps> = ({ kpi }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: 全网在收卡种品牌 */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            全网在收卡种品牌
          </span>
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/50">
            {kpi.activeBrandsCount} 正常在收
          </span>
        </div>
        <div className="my-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 font-mono">
            {kpi.totalBrandsCount}
          </span>
          <span className="text-xs text-slate-500">核心卡种</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>覆盖 18 个国家/地区</span>
          <span className="font-mono text-emerald-600 font-semibold">100% SLA</span>
        </div>
      </div>

      {/* Card 2: 在售面值阶梯模型 */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            在售面值阶梯模型
          </span>
          <span className="material-symbols-outlined text-blue-600 text-[18px]">tune</span>
        </div>
        <div className="my-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 font-mono">
            {kpi.ladderDimensionCount.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500">个维度阶梯</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>固定面值 85% · 范围浮动 15%</span>
          <span className="font-mono text-blue-600 font-medium">阶梯动态</span>
        </div>
      </div>

      {/* Card 3: OCR 识别通道覆盖 */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            OCR 识别通道覆盖
          </span>
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/50">
            {kpi.ocrConfidenceRate}% 置信
          </span>
        </div>
        <div className="my-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 font-mono">
            {kpi.ocrAvgLatencyMs}
          </span>
          <span className="text-xs text-slate-500">ms 平均耗时</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>自研面卡神经网络流水线</span>
          <span className="font-mono text-emerald-600 font-semibold">ACTIVE</span>
        </div>
      </div>

      {/* Card 4: 实时余额反查通道 */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            实时余额反查通道
          </span>
          <span className="material-symbols-outlined text-emerald-600 text-[18px]">
            verified_user
          </span>
        </div>
        <div className="my-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 font-mono">
            {kpi.balanceCheckSupportedCount}{' '}
            <span className="text-sm font-normal text-slate-400">
              / {kpi.totalBrandsCount}
            </span>
          </span>
          <span className="text-xs text-slate-500">品牌支持</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>防黑防充值拦截率</span>
          <span className="font-mono text-emerald-600 font-semibold">
            {kpi.interceptRate}% 拦截
          </span>
        </div>
      </div>
    </div>
  );
};
