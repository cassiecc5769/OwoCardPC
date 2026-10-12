import React, { useState } from 'react';
import { LifecycleFunnelStep } from './types';

interface LifecycleFunnelSectionProps {
  steps: LifecycleFunnelStep[];
  onSelectStep?: (step: LifecycleFunnelStep) => void;
}

export const LifecycleFunnelSection: React.FC<LifecycleFunnelSectionProps> = ({
  steps,
  onSelectStep,
}) => {
  const [selectedStep, setSelectedStep] = useState<LifecycleFunnelStep | null>(null);

  const handleStepClick = (step: LifecycleFunnelStep) => {
    setSelectedStep(step);
    if (onSelectStep) onSelectStep(step);
  };

  return (
    <section className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4 flex flex-col gap-3.5">
      {/* 漏斗模块标题栏 */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-blue-600 rounded-xs" />
          <h3 className="font-headline-md text-sm font-bold text-slate-900 tracking-tight">
            用户全生命周期转化漏斗 (User Lifecycle Funnel)
          </h3>
          <span className="font-code-token text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
            实时交易节点链路
          </span>
        </div>

        <div className="flex items-center gap-3.5 text-slate-500 font-body-sm text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>转化率基准</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>首单破冰</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span>流失缓冲</span>
          </span>
        </div>
      </div>

      {/* 漏斗可视化流程 7 步卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-2.5 items-stretch">
        {steps.map((step) => {
          const isHighlightFinal = step.stepIndex === 7;
          const isIceBreak = step.stepIndex === 5;

          return (
            <div
              key={step.stepIndex}
              onClick={() => handleStepClick(step)}
              className={`rounded-xl p-3 flex flex-col justify-between relative overflow-hidden transition-all duration-200 cursor-pointer border ${
                selectedStep?.stepIndex === step.stepIndex
                  ? 'ring-2 ring-blue-600 shadow-md border-blue-600'
                  : isHighlightFinal
                  ? 'bg-blue-50/70 border-blue-200 hover:border-blue-300 hover:bg-blue-50'
                  : isIceBreak
                  ? 'bg-emerald-50/40 border-emerald-200/80 hover:border-emerald-300 hover:bg-emerald-50/60'
                  : 'bg-slate-50/80 border-slate-200/70 hover:bg-slate-100/70 hover:border-slate-300'
              }`}
            >
              {/* 卡片头部 */}
              <div className="flex items-center justify-between">
                <span
                  className={`font-label-caps text-[10.5px] font-semibold uppercase ${
                    isIceBreak
                      ? 'text-emerald-700'
                      : isHighlightFinal
                      ? 'text-blue-700'
                      : 'text-slate-500'
                  }`}
                >
                  {step.stepCode}
                </span>
                {step.icon ? (
                  <span
                    className={`material-symbols-outlined text-[16px] ${
                      isIceBreak
                        ? 'text-emerald-600'
                        : isHighlightFinal
                        ? 'text-blue-600'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.icon}
                  </span>
                ) : (
                  <span
                    className={`font-code-token text-[11px] font-bold ${
                      isIceBreak ? 'text-emerald-700' : 'text-blue-600'
                    }`}
                  >
                    {step.ratePercent.toFixed(1)}%
                  </span>
                )}
              </div>

              {/* 卡片核心数值 */}
              <div className="my-2.5">
                <span
                  className={`block font-headline-sm text-xs font-semibold ${
                    isIceBreak
                      ? 'text-emerald-800'
                      : isHighlightFinal
                      ? 'text-blue-800'
                      : 'text-slate-700'
                  }`}
                >
                  {step.stepName}
                </span>
                <span
                  className={`font-numeric-stat text-xl font-bold tracking-tight ${
                    isHighlightFinal
                      ? 'text-blue-700'
                      : isIceBreak
                      ? 'text-emerald-700'
                      : 'text-slate-900'
                  }`}
                >
                  {step.count.toLocaleString()}
                </span>
              </div>

              {/* 进度条与底部说明 */}
              <div className="pt-1">
                {step.stepIndex === 1 ? (
                  <span className="font-code-token text-[10.5px] text-slate-500 block truncate">
                    {step.subText}
                  </span>
                ) : step.stepIndex === 7 ? (
                  <span className="font-code-token text-[10.5px] text-blue-700 font-semibold block truncate">
                    {step.subText}
                  </span>
                ) : (
                  <div className="space-y-1">
                    <div className="w-full bg-slate-200/80 rounded-full h-1 overflow-hidden">
                      <div
                        className={`h-1 rounded-full ${
                          isIceBreak ? 'bg-emerald-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.min(step.ratePercent, 100)}%` }}
                      />
                    </div>
                    <span className="font-code-token text-[10px] text-slate-400 block text-right">
                      环比 {step.ratePercent.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 展开的单步骤洞察提示 (可点击任意卡片查看归因和调优建议) */}
      {selectedStep && (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <span className="material-symbols-outlined text-[18px]">info</span>
            </span>
            <div>
              <span className="font-bold text-slate-900">
                {selectedStep.stepCode} · {selectedStep.stepName} 节点洞察：
              </span>
              <span className="text-slate-600 ml-1.5">
                {selectedStep.benchmarkDescription || '实时数据监控中'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {selectedStep.dropOffReason && (
              <span className="text-[11px] text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                流失诱因: {selectedStep.dropOffReason}
              </span>
            )}
            <button
              onClick={() => setSelectedStep(null)}
              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
