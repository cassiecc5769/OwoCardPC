import React from 'react';
import { HhiConcentrationData } from './types';

interface ConcentrationRiskRadarProps {
  data: HhiConcentrationData;
  onToggleThrottle?: () => void;
  onOpenDispatchConfig?: () => void;
}

export const ConcentrationRiskRadar: React.FC<ConcentrationRiskRadarProps> = ({
  data,
  onToggleThrottle,
  onOpenDispatchConfig,
}) => {
  return (
    <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
      {/* 集中度指标视窗 (2列) */}
      <div className="xl:col-span-2 bg-white rounded-xl shadow-xs p-4 border border-slate-200/80 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-blue-50 text-blue-600">
                <span className="material-symbols-outlined text-[20px]">radar</span>
              </span>
              <div>
                <h3 className="font-headline-sm text-sm font-bold text-slate-900 tracking-tight">
                  供给集中度风险雷达 (Capacity Concentration &amp; HHI Index)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  监控外部做卡商户对核心收卡通道的单点故障依赖度，防范停机跳票与恶意压单
                </p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-mono text-[11px] font-semibold">
              赫芬达尔指数 HHI: {data.hhiIndex} ({data.hhiRiskLevel})
            </span>
          </div>

          {/* 集中度阶梯可视化 3 卡片 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
            {/* TOP 1 */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[11px] text-slate-500 font-semibold">
                  TOP 1 ({data.top1Name})
                </span>
                <span className="font-mono text-[11px] text-rose-600 font-semibold">
                  接近熔断阈值
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-numeric-stat text-xl font-bold text-rose-600">
                  {data.top1Percent}%
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  / {data.top1Redline.toFixed(1)}% 熔断红线
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-rose-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${data.top1BarWidth}%` }}
                />
              </div>
            </div>

            {/* TOP 5 */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[11px] text-slate-500 font-semibold">
                  TOP 5 头部商户合计
                </span>
                <span className="font-mono text-[11px] text-blue-600 font-semibold">
                  承揽大盘
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-numeric-stat text-xl font-bold text-slate-900">
                  {data.top5Percent}%
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  / ${data.top5GmvUsd.toLocaleString()} USD
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${data.top5Percent}%` }}
                />
              </div>
            </div>

            {/* TOP 10 */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[11px] text-slate-500 font-semibold">
                  TOP 10 核心商户垄断度
                </span>
                <span className="font-mono text-[11px] text-slate-400 font-semibold">
                  长尾覆盖
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-numeric-stat text-xl font-bold text-slate-900">
                  {data.top10Percent}%
                </span>
                <span className="font-mono text-[11px] text-amber-600 font-medium">
                  极高依存度
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${data.top10Percent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 警报提示卡 */}
        <div className="flex items-start sm:items-center gap-2.5 p-3 rounded-lg bg-blue-50/70 border border-blue-200/70 text-xs">
          <span className="material-symbols-outlined text-blue-600 text-[20px] shrink-0 mt-0.5 sm:mt-0">
            smart_toy
          </span>
          <p className="text-slate-700 leading-relaxed">
            <strong className="text-slate-900">自动防御调度预案生效中：</strong>
            单一外部商户（MID: {data.activeMitigationMID}）日承揽比重已达 {data.activeMitigationShare}%。系统已触发分流预警，自动向备用商户池发放 {data.backupDivertPercent}% 试水流量，防止单商宕机引起全网卡单积压。
          </p>
        </div>
      </div>

      {/* 防爆仓与反单点故障自动熔断防御中枢 (1列) */}
      <div className="bg-white rounded-xl shadow-xs p-4 border border-slate-200/80 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-rose-50 text-rose-600">
                <span className="material-symbols-outlined text-[18px]">security</span>
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  防爆仓熔断防御中枢
                </h3>
                <p className="text-[11px] text-slate-500">
                  Anti-Fragile Mitigation Engine
                </p>
              </div>
            </div>

            {/* 开关 */}
            {onToggleThrottle && (
              <button
                type="button"
                onClick={onToggleThrottle}
                className={`px-2 py-0.8 rounded text-[11px] font-mono font-bold cursor-pointer transition-all border ${
                  data.autoThrottleOn
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-slate-100 text-slate-500 border-slate-300'
                }`}
                title="切换自动限流状态"
              >
                {data.autoThrottleOn ? 'AUTO-THROTTLE: ON' : 'AUTO-THROTTLE: OFF'}
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2.5 my-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-slate-600 font-medium">TOP 1 单商硬性熔断红线</span>
              </div>
              <span className="font-mono font-bold text-rose-600">{data.top1Redline}%</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-slate-600 font-medium">备用商户池试水溢流比例</span>
              </div>
              <span className="font-mono font-bold text-blue-700">{data.backupDivertPercent}%</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-600 font-medium">防单点宕机跳票保护</span>
              </div>
              <span className="text-emerald-700 font-semibold font-mono">NORMAL 平稳</span>
            </div>
          </div>
        </div>

        {/* 底部配置按钮 */}
        {onOpenDispatchConfig && (
          <button
            type="button"
            onClick={onOpenDispatchConfig}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs mt-2"
          >
            <span className="material-symbols-outlined text-[16px] text-blue-600">tune</span>
            <span>配置调度与熔断参数</span>
          </button>
        )}
      </div>
    </section>
  );
};
