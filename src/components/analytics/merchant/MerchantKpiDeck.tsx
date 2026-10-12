import React from 'react';
import { MerchantMacroKpi } from './types';

interface MerchantKpiDeckProps {
  data: MerchantMacroKpi;
}

export const MerchantKpiDeck: React.FC<MerchantKpiDeckProps> = ({ data }) => {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3.5">
      {/* 指标 1: 认证接单商户与在线坐席 */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3.5 flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-[11px] text-slate-500 uppercase font-semibold">
            认证承揽商户总数
          </span>
          <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <span className="material-symbols-outlined text-[18px]">domain_verification</span>
          </span>
        </div>

        <div className="my-2.5 flex items-baseline gap-1.5">
          <span className="font-numeric-stat text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            {data.totalCertifiedMerchants}
          </span>
          <span className="font-body-sm text-xs text-slate-500">家合格主体</span>
        </div>

        <div className="pt-2 bg-slate-50 -mx-3.5 -mb-3.5 px-3.5 py-1.5 rounded-b-xl flex items-center justify-between font-code-token text-[11px] text-slate-600 border-t border-slate-100">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>实时在线 {data.onlineCount} 家</span>
          </span>
          <span className="text-slate-800 font-semibold">
            负载率 {data.seatLoadRate}%
          </span>
        </div>
      </div>

      {/* 指标 2: 今日商户承揽流水 GMV */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3.5 flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-[11px] text-slate-500 uppercase font-semibold">
            今日商户承揽总额 (GMV)
          </span>
          <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <span className="material-symbols-outlined text-[18px]">payments</span>
          </span>
        </div>

        <div className="my-2.5 flex items-baseline gap-1">
          <span className="font-numeric-stat text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            ${data.todayFulfilledGmvUsd.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
          <span className="font-code-token text-[11px] text-slate-500 font-normal">USD</span>
        </div>

        <div className="pt-2 bg-slate-50 -mx-3.5 -mb-3.5 px-3.5 py-1.5 rounded-b-xl flex items-center justify-between font-code-token text-[11px] text-slate-600 border-t border-slate-100">
          <span>完单 {data.completedOrdersCount.toLocaleString()} 笔</span>
          <span className="text-emerald-700 font-semibold">
            准时履约 {data.onTimeFulfillmentRate}%
          </span>
        </div>
      </div>

      {/* 指标 3: 平均做卡响应时效 (SLA) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3.5 flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-[11px] text-slate-500 uppercase font-semibold">
            平均做卡响应时效
          </span>
          <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <span className="material-symbols-outlined text-[18px]">speed</span>
          </span>
        </div>

        <div className="my-2.5 flex items-baseline gap-1.5">
          <span className="font-numeric-stat text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            {data.avgResponseTimeSeconds.toFixed(1)}
          </span>
          <span className="font-body-sm text-xs text-slate-500">秒 (基线 45s)</span>
        </div>

        <div className="pt-2 bg-slate-50 -mx-3.5 -mb-3.5 px-3.5 py-1.5 rounded-b-xl flex items-center justify-between font-code-token text-[11px] text-slate-600 border-t border-slate-100">
          <span>API直通 {data.apiDirectPassRate}%</span>
          <span className="text-slate-800 font-medium">人工 {data.manualAvgTimeText}</span>
        </div>
      </div>

      {/* 指标 4: 履约综合健康度 */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3.5 flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-[11px] text-slate-500 uppercase font-semibold">
            履约综合健康度
          </span>
          <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
          </span>
        </div>

        <div className="my-2.5 flex items-baseline gap-2">
          <span className="font-numeric-stat text-2xl lg:text-3xl font-bold text-emerald-700 tracking-tight">
            {data.healthRate.toFixed(1)}%
          </span>
          <span className="font-code-token text-[10.5px] text-rose-600 font-medium bg-rose-50 px-1 py-0.2 rounded border border-rose-200">
            争议 {data.disputeOrdersCount} 笔
          </span>
        </div>

        <div className="pt-2 bg-slate-50 -mx-3.5 -mb-3.5 px-3.5 py-1.5 rounded-b-xl flex items-center justify-between font-code-token text-[11px] text-slate-600 border-t border-slate-100">
          <span>风控挂起 {data.suspendedMerchantsCount} 家</span>
          <span className="text-emerald-700 font-semibold">
            履约评分 98.4
          </span>
        </div>
      </div>

      {/* 指标 5: 质押风控保证金总池 */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3.5 flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-[11px] text-slate-500 uppercase font-semibold">
            质押风控保证金池
          </span>
          <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
            <span className="material-symbols-outlined text-[18px]">shield</span>
          </span>
        </div>

        <div className="my-2.5 flex items-baseline gap-1">
          <span className="font-numeric-stat text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            ${(data.collateralPoolUsd / 10000).toFixed(1)}
          </span>
          <span className="font-body-sm text-xs text-slate-500">万 USD</span>
        </div>

        <div className="pt-2 bg-slate-50 -mx-3.5 -mb-3.5 px-3.5 py-1.5 rounded-b-xl flex items-center justify-between font-code-token text-[11px] text-slate-600 border-t border-slate-100">
          <span>覆盖敞口 2.23x</span>
          <span className="text-emerald-700 font-semibold">
            违约率 0.00%
          </span>
        </div>
      </div>
    </section>
  );
};
