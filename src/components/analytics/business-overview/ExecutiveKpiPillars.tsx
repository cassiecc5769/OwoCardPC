import React from 'react';
import { MetricPillarData } from './types';

interface ExecutiveKpiPillarsProps {
  data: MetricPillarData;
  currencyPrefix?: string;
}

export const ExecutiveKpiPillars: React.FC<ExecutiveKpiPillarsProps> = ({
  data,
  currencyPrefix = '$'
}) => {
  const formatNumber = (num: number) => num.toLocaleString('en-US');

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Pillar 1: GMV Liquidity */}
      <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-sm transition-shadow">
        <div>
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">account_balance</span>
              <span className="font-label-caps text-[11px] text-slate-500 uppercase font-semibold">
                交易盘子 · GMV Liquidity
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-code-token text-[11px] font-semibold border border-emerald-200/60">
              {data.gmv.momPercent} 环比
            </span>
          </div>

          <div className="mt-1">
            <div className="font-numeric-stat text-[30px] sm:text-[32px] font-bold text-slate-900 tracking-tight leading-none">
              {currencyPrefix}{formatNumber(data.gmv.total)}
              <span className="text-[18px] font-normal text-slate-400">.00</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
              <span>
                基准周期同比 <span className="font-numeric-table font-semibold text-emerald-600">{data.gmv.yoyPercent}</span>
              </span>
              <span>·</span>
              <span className="text-slate-400">{data.gmv.currency} 综合口径</span>
            </div>
          </div>
        </div>

        <div className="mt-5 bg-slate-50 rounded-lg p-2.5 flex flex-col gap-1.5 border border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">成功卡单量</span>
            <span className="font-numeric-table font-semibold text-slate-900">
              {formatNumber(data.gmv.successOrders)} <span className="font-normal text-slate-400">笔</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">综合核销成功率</span>
            <div className="flex items-center gap-1">
              <span className="font-numeric-table font-semibold text-emerald-600">{data.gmv.successRate}</span>
              <span className="text-emerald-700 bg-emerald-100/70 rounded px-1 text-[10px] font-medium">
                {data.gmv.marketAdvantage}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">笔均客单价 (AOV)</span>
            <span className="font-numeric-table font-semibold text-slate-900">
              {currencyPrefix}{data.gmv.aov.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Pillar 2: Active User Engagement */}
      <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-sm transition-shadow">
        <div>
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-indigo-600 text-[18px]">group_work</span>
              <span className="font-label-caps text-[11px] text-slate-500 uppercase font-semibold">
                用户活跃 · User Cohort
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-code-token text-[11px] font-semibold border border-emerald-200/60">
              {data.users.momPercent} 环比
            </span>
          </div>

          <div className="mt-1">
            <div className="font-numeric-stat text-[30px] sm:text-[32px] font-bold text-slate-900 tracking-tight leading-none">
              {formatNumber(data.users.totalActive)}{' '}
              <span className="text-[18px] font-normal text-slate-400">人</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
              <span>今日独立交易买家</span>
              <span>·</span>
              <span className="text-slate-400">活跃度指数 {data.users.activityIndex}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 bg-slate-50 rounded-lg p-2.5 flex flex-col gap-1.5 border border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">首单破冰新客</span>
            <span className="font-numeric-table font-semibold text-slate-900">
              {data.users.newUsers} <span className="font-normal text-slate-400">人 ({data.users.newUsersPercent})</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">老客 30天复购率</span>
            <div className="flex items-center gap-1">
              <span className="font-numeric-table font-semibold text-blue-600">{data.users.repurchaseRate30d}</span>
              <span className="material-symbols-outlined text-[14px] text-emerald-600">trending_up</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">高价值大客成交占比</span>
            <span className="font-numeric-table font-semibold text-slate-900">{data.users.highValueShare}</span>
          </div>
        </div>
      </div>

      {/* Pillar 3: Merchant Supply & Routing */}
      <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-sm transition-shadow">
        <div>
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">dns</span>
              <span className="font-label-caps text-[11px] text-slate-500 uppercase font-semibold">
                商户供给 · Fulfillment Hub
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-code-token text-[11px] font-semibold border border-slate-200">
              负载 {data.merchants.loadRatio}
            </span>
          </div>

          <div className="mt-1">
            <div className="font-numeric-stat text-[30px] sm:text-[32px] font-bold text-slate-900 tracking-tight leading-none">
              {data.merchants.onlineCount}{' '}
              <span className="text-[18px] font-normal text-slate-400">家在线</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
              <span>全网承揽节点正常</span>
              <span>·</span>
              <span className="text-emerald-600 font-semibold">健康度 {data.merchants.healthRate}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 bg-slate-50 rounded-lg p-2.5 flex flex-col gap-1.5 border border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">平均做卡时效</span>
            <span className="font-numeric-table font-semibold text-emerald-600">
              {data.merchants.avgFulfillmentSec}s{' '}
              <span className="font-normal text-slate-400">(提速 {data.merchants.speedupSec}s)</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">全网可用承揽额度</span>
            <span className="font-numeric-table font-semibold text-slate-900">
              {currencyPrefix}{formatNumber(data.merchants.availableCapacity)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">即时供需平抑指数</span>
            <span className="font-numeric-table font-semibold text-slate-900">
              {data.merchants.stabilizationIndex}
            </span>
          </div>
        </div>
      </div>

      {/* Pillar 4: Gross Margin & Retention */}
      <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-sm transition-shadow">
        <div>
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">pie_chart</span>
              <span className="font-label-caps text-[11px] text-slate-500 uppercase font-semibold">
                毛利留存 · Net Margin
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-code-token text-[11px] font-semibold border border-emerald-200/60">
              {data.margin.netMarginRatio} 净率
            </span>
          </div>

          <div className="mt-1">
            <div className="font-numeric-stat text-[30px] sm:text-[32px] font-bold text-slate-900 tracking-tight leading-none">
              {currencyPrefix}{formatNumber(data.margin.netProfit)}
              <span className="text-[18px] font-normal text-slate-400">.00</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
              <span>
                综合净毛利率 <span className="font-numeric-table font-semibold text-blue-600">{data.margin.profitRate}</span>
              </span>
              <span>·</span>
              <span className="text-slate-400">利差留存良好</span>
            </div>
          </div>
        </div>

        <div className="mt-5 bg-slate-50 rounded-lg p-2.5 flex flex-col gap-1.5 border border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">交易总价差利差</span>
            <span className="font-numeric-table font-semibold text-slate-900">
              {currencyPrefix}{formatNumber(data.margin.spreadAmount)}.00
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">待结资金安全水位</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="font-numeric-table font-semibold text-emerald-600">
                {data.margin.escrowSafetyRate}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">净资产风险敞口</span>
            <span className="font-numeric-table font-semibold text-slate-900">
              {data.margin.riskExposure}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
