import React from 'react';
import { KpiMetrics } from './types';

interface TradingRulesKpiDeckProps {
  kpi: KpiMetrics;
}

export const TradingRulesKpiDeck: React.FC<TradingRulesKpiDeckProps> = ({ kpi }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Stat 1: 生效中基线规则 */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
            生效中基线规则
          </span>
          <span className="text-[11px] font-mono bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
            100% 运行
          </span>
        </div>
        <div className="my-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-slate-900">
            {kpi.activeRulesCount}
          </span>
          <span className="text-xs text-slate-500 font-medium">项生效</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>涵盖 5 大交易生命周期</span>
          <span className="font-mono text-emerald-600 font-semibold">0 待审未就绪</span>
        </div>
      </div>

      {/* Stat 2: 接单响应 SLA 上限 */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
            接单响应 SLA 上限
          </span>
          <span className="text-[11px] font-mono bg-blue-50 border border-blue-200 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
            极速撮合
          </span>
        </div>
        <div className="my-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-slate-900">
            {kpi.matchSlaSeconds}
          </span>
          <span className="text-xs text-slate-500 font-medium">秒 / 超时判流单</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>全网平均响应</span>
          <span className="font-mono text-blue-600 font-bold">{kpi.avgResponseSeconds}s</span>
        </div>
      </div>

      {/* Stat 3: 商户作业熔断阈值 */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
            商户作业熔断阈值
          </span>
          <span className="text-[11px] font-mono bg-rose-50 border border-rose-200 text-rose-700 font-semibold px-2 py-0.5 rounded-full">
            强管控策略
          </span>
        </div>
        <div className="my-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-slate-900">
            {kpi.circuitBreakerMinutes}
          </span>
          <span className="text-xs text-slate-500 font-medium">分钟 / 剥离入自营池</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>昨日自动熔断执行</span>
          <span className="font-mono text-rose-600 font-semibold">
            {kpi.fuseTriggersYesterday} 次触发
          </span>
        </div>
      </div>

      {/* Stat 4: 规则版本双写追踪 */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
            规则版本双写追踪
          </span>
          <span className="text-[11px] font-mono bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
            不可篡改
          </span>
        </div>
        <div className="my-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-slate-900">
            {kpi.versionSnapshotsCount}
          </span>
          <span className="text-xs text-slate-500 font-medium">次版本快照</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>历史卡单毫秒还原</span>
          <span className="font-mono text-slate-700 font-semibold">支持全量回溯</span>
        </div>
      </div>
    </div>
  );
};
