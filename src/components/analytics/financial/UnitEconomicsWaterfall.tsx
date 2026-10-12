import React from 'react';
import { WaterfallStep, CurrencyMode } from './types';
import { formatCurrencyValue } from './mockData';

interface UnitEconomicsWaterfallProps {
  steps: WaterfallStep[];
  currency: CurrencyMode;
}

export const UnitEconomicsWaterfall: React.FC<UnitEconomicsWaterfallProps> = ({ steps, currency }) => {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col gap-3.5">
      {/* Header & Derivation Formula */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">
              waterfall_chart
            </span>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              综合利润表现金流瀑布图与单元经济学模型 (Unit Economics Waterfall)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            解构收卡业务单点承揽模型的价值损耗：每一美元 GMV 入账后的逐层留存演进
          </p>
        </div>

        {/* Formula Callout */}
        <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 font-code-token text-[11px] text-slate-600 self-start md:self-auto leading-relaxed">
          <span className="font-semibold text-blue-600">核心会计推导式：</span>
          平台净毛利 = 交易价差利差 + 技术服务费 - 推广分成成本 - 营销加价券补贴 - 售后赔付坏账
        </div>
      </div>

      {/* 6 Step Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
        {steps.map((step) => {
          const isNet = step.type === 'net';
          const isRevenue = step.type === 'revenue';
          const isCost = step.type === 'cost';
          const isBase = step.type === 'base';

          let headerColor = 'text-slate-500';
          let valColor = 'text-slate-900';
          let cardBg = 'bg-slate-50/80 border-slate-200/70';

          if (isNet) {
            headerColor = 'text-emerald-800';
            valColor = 'text-emerald-700';
            cardBg = 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-400/20';
          } else if (isRevenue) {
            headerColor = 'text-blue-700';
            valColor = 'text-blue-600';
            cardBg = 'bg-blue-50/30 border-blue-200/60';
          } else if (isCost) {
            headerColor = 'text-rose-700';
            valColor = 'text-rose-600';
            cardBg = 'bg-slate-50/80 border-slate-200/70';
          }

          return (
            <div
              key={step.stepNumber}
              className={`rounded-xl p-3 flex flex-col justify-between border ${cardBg} transition-all hover:shadow-xs`}
            >
              <div className="flex flex-col">
                <span className={`font-label-caps text-[11px] uppercase tracking-wider font-semibold ${headerColor}`}>
                  {step.stepNumber}. {step.stepName}
                </span>
                <span className={`font-numeric-stat text-base sm:text-lg font-bold mt-1 tracking-tight ${valColor}`}>
                  {currency === 'NGN' && isBase
                    ? '₦1.00 GMV'
                    : currency === 'NGN'
                    ? (step.unitAmount >= 0 ? `+₦${(step.unitAmount * 1595.40).toFixed(1)}` : `-₦${(Math.abs(step.unitAmount) * 1595.40).toFixed(1)}`)
                    : step.displayUnit}
                </span>
                <span className="font-code-token text-[11px] text-slate-500 mt-0.5">
                  {step.label}
                </span>
              </div>

              {/* Graphical Progress Bar */}
              <div className="my-2.5">
                {isBase && (
                  <div className="h-2 w-full bg-blue-600 rounded-full"></div>
                )}
                {isRevenue && (
                  <div className="h-2 w-full bg-blue-500 rounded-full"></div>
                )}
                {isCost && (
                  <div className="h-2 w-full bg-rose-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${step.progressPercent}%` }}
                    ></div>
                  </div>
                )}
                {isNet && (
                  <div className="h-2 w-full bg-emerald-600 rounded-full"></div>
                )}
              </div>

              {/* Footer text */}
              <div className="flex items-center justify-between font-code-token text-[11px]">
                <span className={isNet ? 'text-emerald-800 font-bold' : isRevenue ? 'text-blue-700 font-medium' : isCost ? 'text-rose-600 font-medium' : 'text-slate-500'}>
                  {isBase
                    ? step.subLabel
                    : `${step.subLabel.split(' ')[0]} ${formatCurrencyValue(step.totalAmount, currency)}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
