import React from 'react';

interface MessageConfigKpiDeckProps {
  totalEventsCount?: number;
  successRate?: string;
  totalTemplatesCount?: number;
  channelLoadPercent?: number;
}

export const MessageConfigKpiDeck: React.FC<MessageConfigKpiDeckProps> = ({
  totalEventsCount = 36,
  successRate = '99.92',
  totalTemplatesCount = 58,
  channelLoadPercent = 34.2,
}) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Metric 1: 全域接入事件源 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            全域接入事件源
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-mono font-medium border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 100% 监听
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-slate-900">{totalEventsCount}</span>
          <span className="text-xs text-slate-500">触发源 / 4大业务领域</span>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>交易 · 售后 · 财务 · 会员</span>
          <span className="font-mono text-emerald-600 font-semibold">0 异常阻断</span>
        </div>
      </div>

      {/* Metric 2: 多通道投递成功率 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            多通道投递成功率
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-mono font-medium border border-emerald-200">
            0 掉线
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-slate-900">
            {successRate}
            <span className="text-sm font-sans font-semibold text-slate-700">%</span>
          </span>
          <span className="text-xs font-mono text-emerald-600 font-semibold">24h: 128,450 笔</span>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>平均投递耗时</span>
          <span className="font-mono text-slate-900 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
            42 ms
          </span>
        </div>
      </div>

      {/* Metric 3: 动态变量模版 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            动态变量模版
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[11px] font-mono font-medium border border-purple-200">
            多语言 i18n
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-slate-900">{totalTemplatesCount}</span>
          <span className="text-xs text-slate-500">套活跃模版</span>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>涵盖全域动态变量池</span>
          <span className="font-mono text-purple-700 font-semibold">18 个变量</span>
        </div>
      </div>

      {/* Metric 4: 熔断与频控保护 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            熔断与频控保护
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-mono font-medium border border-blue-200">
            防刷频控保护中
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-slate-900">
            {channelLoadPercent}
            <span className="text-sm font-sans font-semibold text-slate-700">%</span>
          </span>
          <span className="text-xs text-slate-500">全网通道负荷</span>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${channelLoadPercent}%` }}
            ></div>
          </div>
          <span className="font-mono text-emerald-600 font-semibold">0 项熔断告警</span>
        </div>
      </div>
    </section>
  );
};
