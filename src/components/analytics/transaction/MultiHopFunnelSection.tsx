import React, { useState } from 'react';
import { FunnelStepData } from './types';

interface MultiHopFunnelSectionProps {
  steps: FunnelStepData[];
  onOpenConfig: () => void;
}

export const MultiHopFunnelSection: React.FC<MultiHopFunnelSectionProps> = ({ steps, onOpenConfig }) => {
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 transition-all">
      {/* Funnel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined text-[18px]">filter_alt</span>
            </span>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              交易流转全息转化漏斗 (Multi-Hop Funnel Architecture)
            </h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 font-code-token">
              端到端转化率: 71.03%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-8">
            从申报创建至资金最终结算的全生命周期阶段损耗溯源拓扑与流失诱因
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-3 text-xs text-slate-500 mr-2 hidden md:flex">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block" />
              <span>流转留存</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
              <span>阶段折损流失</span>
            </div>
          </div>

          <button
            onClick={onOpenConfig}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="设定各转化节点流失预警阈值"
          >
            <span className="material-symbols-outlined text-[15px] text-slate-500">tune</span>
            <span>漏斗阈值参数</span>
          </button>
        </div>
      </div>

      {/* 5-Step Visual Funnel Stack */}
      <div className="py-4 space-y-3.5">
        {steps.map((step, idx) => {
          const isFinal = step.isFinal;
          const isSelected = selectedStepIndex === idx;

          return (
            <div
              key={step.stepNumber}
              onClick={() => setSelectedStepIndex(isSelected ? null : idx)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/40 border-blue-300 ring-1 ring-blue-300'
                  : 'bg-slate-50/50 border-slate-200/70 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {/* Row Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                {/* Step Identity (Cols 1-3) */}
                <div className="lg:col-span-3 flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs font-code-token shrink-0 ${
                      isFinal ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                    }`}
                  >
                    {step.stepNumber}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      {step.stepName}
                    </span>
                    <span className="text-[11px] text-slate-500 font-numeric-stat">
                      {step.count.toLocaleString()} 单 ·{' '}
                      <span className={isFinal ? 'text-emerald-700 font-bold' : 'text-blue-600 font-semibold'}>
                        {step.retentionPercent.toFixed(1)}% 保留
                      </span>
                    </span>
                  </div>
                </div>

                {/* Progressive Progress Bar (Cols 4-7) */}
                <div className="lg:col-span-4 flex flex-col justify-center gap-1">
                  <div className="flex justify-between items-center text-[10.5px] font-medium text-slate-500">
                    <span>留存基准</span>
                    <span className="font-numeric-stat font-semibold text-slate-700">
                      {step.retentionPercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isFinal ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${step.retentionPercent}%` }}
                    />
                  </div>
                </div>

                {/* Drop-off Callout / Final Milestone (Cols 8-12) */}
                <div className="lg:col-span-5">
                  {!isFinal ? (
                    <div className="bg-rose-50/70 border border-rose-100 rounded-lg px-3 py-1.5 flex items-start gap-2">
                      <span className="material-symbols-outlined text-rose-500 text-[16px] shrink-0 mt-0.5">
                        arrow_downward
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="font-bold text-rose-700 font-numeric-stat">
                            流失折损: {step.lossCount.toLocaleString()} 单 ({step.lossPercent.toFixed(1)}%)
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-rose-600 text-[10px]">阶段流失</span>
                        </div>
                        <p className="text-[10.5px] text-rose-900/80 truncate mt-0.5" title={step.lossReasons.join('；')}>
                          {step.lossReasons.join(' · ')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-50/70 border border-emerald-100 rounded-lg px-3 py-1.5 flex items-start gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-[16px] shrink-0 mt-0.5">
                        task_alt
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="font-bold text-emerald-800 font-numeric-stat">
                            结算放款效率: 即时划账 100%
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-emerald-700 text-[10px]">闭环达成</span>
                        </div>
                        <p className="text-[10.5px] text-emerald-900/80 truncate mt-0.5">
                          {step.finalSettlementNote || '资金账户已划付，商户积点同步扣除无坏账'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Collapsible Inspection Drawer if clicked */}
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-slate-200/80 text-xs text-slate-600 grid grid-cols-1 md:grid-cols-3 gap-3 animate-fadeIn">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10.5px]">当前环节样本量</span>
                    <span className="font-bold font-numeric-stat text-slate-800 text-sm">
                      {step.count.toLocaleString()} 笔卡单
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10.5px]">环节退出/阻断率</span>
                    <span className="font-bold font-numeric-stat text-rose-600 text-sm">
                      {step.lossPercent > 0 ? `${step.lossPercent.toFixed(1)}%` : '0% (最终终态)'}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10.5px]">优化应对建议</span>
                    <span className="text-slate-700 font-medium text-xs">
                      {idx === 0 && '推进移动端 OCR 边缘锐化与反光过滤算法 SDK'}
                      {idx === 1 && '启动 15 秒动态点差微补偿与未锁定智能留存引导'}
                      {idx === 2 && '对高频流动承兑商预设自动补点信贷授信通道'}
                      {idx === 3 && '商户做卡 API 实行 3 秒超时快速降级轮询机制'}
                      {idx === 4 && '100% 清算划账健康，持续保持网关实时轮询'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Latency Velocity Rail (底部时效流速指标) */}
      <div className="mt-2 pt-3.5 border-t border-slate-100 bg-slate-50/70 -mx-5 -mb-5 px-5 py-3 rounded-b-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
          <span className="material-symbols-outlined text-[16px] text-blue-600">speed</span>
          <span>全链路时效流速指标 Latency Benchmarking</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11.5px]">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">平均系统报价耗时:</span>
            <span className="font-code-token font-bold text-slate-900">0.8s</span>
            <span className="text-emerald-700 font-medium">(极速)</span>
          </div>
          <span className="text-slate-300 hidden md:inline">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">商户接单承揽响应:</span>
            <span className="font-code-token font-bold text-slate-900">2.5s</span>
            <span className="text-emerald-700 font-medium">(优于基线 40%)</span>
          </div>
          <span className="text-slate-300 hidden md:inline">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">官方核销兑现平均用时:</span>
            <span className="font-code-token font-bold text-slate-900">32.4s</span>
            <span className="text-blue-600 font-medium">(中位线指标)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
