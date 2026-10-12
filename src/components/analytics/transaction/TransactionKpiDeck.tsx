import React from 'react';
import { MacroKpiData } from './types';

interface TransactionKpiDeckProps {
  data: MacroKpiData;
}

export const TransactionKpiDeck: React.FC<TransactionKpiDeckProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* Pillar 1: 申报卡单总量 */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-500 font-label-caps uppercase tracking-wider">
              申报卡单总量
            </span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              <span className="material-symbols-outlined text-[13px]">trending_up</span>
              {data.submittedOrdersYoy}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl lg:text-[26px] font-bold text-slate-900 font-numeric-stat tracking-tight">
              {data.submittedOrders.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-normal">笔</span>
          </div>
        </div>

        {/* Sub-box */}
        <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/60 -mx-4 -mb-4 px-4 py-2.5 rounded-b-xl flex flex-col gap-1 text-[11.5px]">
          <div className="flex justify-between items-center text-slate-600">
            <span className="text-slate-400">申报面值总额:</span>
            <span className="font-numeric-stat font-semibold text-slate-800">
              ${data.submittedFaceValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="text-slate-400">客单均值:</span>
            <span className="font-numeric-stat font-medium text-slate-700">
              ${data.aov.toFixed(2)} / 笔
            </span>
          </div>
        </div>
      </div>

      {/* Pillar 2: 成功核销单量 */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-500 font-label-caps uppercase tracking-wider">
              成功核销单量
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
              转化率 {data.conversionRate}%
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl lg:text-[26px] font-bold text-blue-600 font-numeric-stat tracking-tight">
              {data.successfulOrders.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-normal">笔</span>
          </div>
        </div>

        {/* Sub-box */}
        <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/60 -mx-4 -mb-4 px-4 py-2.5 rounded-b-xl flex flex-col gap-1 text-[11.5px]">
          <div className="flex justify-between items-center text-slate-600">
            <span className="text-slate-400">成交清算 GMV:</span>
            <span className="font-numeric-stat font-semibold text-blue-700">
              ${data.settledGmv.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="text-slate-400">兑现有效差额:</span>
            <span className="font-code-token text-emerald-700 font-medium">
              损耗率仅 {data.lossRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Pillar 3: 秒级直通率 (AUTO-PASS) */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-500 font-label-caps uppercase tracking-wider">
              秒级直通率 (AUTO-PASS)
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              <span className="material-symbols-outlined text-[13px] fill-current">bolt</span>
              {data.autoPassSec}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl lg:text-[26px] font-bold text-emerald-700 font-numeric-stat tracking-tight">
              {data.autoPassRate}%
            </span>
          </div>
        </div>

        {/* Sub-box with mini progress */}
        <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/60 -mx-4 -mb-4 px-4 py-2.5 rounded-b-xl flex flex-col gap-1.5 text-[11px]">
          <div className="flex justify-between items-center text-slate-600">
            <span className="text-slate-400">API 自动化做卡:</span>
            <span className="font-numeric-stat font-medium text-slate-800">
              {data.apiAutoCount.toLocaleString()} 笔 ({data.autoPassRate}%)
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${data.autoPassRate}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-slate-500 pt-0.5">
            <span className="text-slate-400">人工客服/风控做卡:</span>
            <span className="font-numeric-stat text-slate-700">
              {data.manualAuditCount.toLocaleString()} 笔 ({(100 - data.autoPassRate).toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Pillar 4: 全链路平均流转时效 */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-500 font-label-caps uppercase tracking-wider">
              全链路平均流转时效
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              <span className="material-symbols-outlined text-[13px]">verified</span>
              SLA {data.slaRate}%
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl lg:text-[26px] font-bold text-slate-900 font-numeric-stat tracking-tight">
              {data.avgVelocityTime}
            </span>
          </div>
        </div>

        {/* Sub-box */}
        <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/60 -mx-4 -mb-4 px-4 py-2.5 rounded-b-xl flex flex-col gap-1 text-[11.5px]">
          <div className="flex justify-between items-center text-slate-600">
            <span className="text-slate-400">异常滞留率:</span>
            <span className="font-code-token font-semibold text-amber-600">
              {data.abnormalPendingRate}%
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="text-slate-400">售后争议率:</span>
            <span className="font-code-token font-semibold text-slate-700">
              {data.disputeRate}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
