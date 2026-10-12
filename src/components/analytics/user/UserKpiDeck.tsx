import React from 'react';
import { UserMacroKpiData } from './types';

interface UserKpiDeckProps {
  data: UserMacroKpiData;
}

export const UserKpiDeck: React.FC<UserKpiDeckProps> = ({ data }) => {
  const transUsers = data.todayTransUsers ?? 1734;
  const transUsersMom = data.todayTransUsersMom ?? '+18.2% DoD';
  const gmvYuan = data.todayGmvYuan ?? 1123504;
  const gmvMom = data.todayGmvYuanMom ?? '+24.39% WoW';
  const atvYuan = data.todayAtvYuan ?? 525.10;
  const atvMom = data.todayAtvMom ?? '+15.64%';
  const successOrders = data.todaySuccessOrders ?? 2208;
  const successRate = data.todaySuccessRate ?? 78.53;
  const successRateMom = data.todaySuccessRateMom ?? '-1.75%';

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 items-stretch">
      {/* 指标 1: 累计出卡在册与今日活跃 */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4 flex flex-col justify-between relative overflow-hidden group hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[17px]">groups</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">出卡在册与活跃</span>
              <span className="text-[10px] font-mono text-slate-400 block">USERS SCALE</span>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-semibold border border-emerald-200/60">
            {data.totalUsersMom}
          </span>
        </div>

        <div className="my-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {data.totalUsers.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">人</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-600">
            <span>今日活跃交易:</span>
            <strong className="text-slate-900 font-mono font-semibold">
              {transUsers.toLocaleString()} 人
            </strong>
            <span className="text-[10px] font-mono text-emerald-600 font-semibold">{transUsersMom}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-2 text-slate-500 border-t border-slate-100">
          <span>本月新增: <strong className="text-blue-600 font-mono">{data.monthlyNewUsers.toLocaleString()}</strong> 人</span>
          <span>实名率: <strong className="text-slate-700 font-mono">{data.complianceRate}%</strong></span>
        </div>
      </div>

      {/* 指标 2: 全盘出卡成交 GMV 与客单价 */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4 flex flex-col justify-between relative overflow-hidden group hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[17px]">payments</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">出卡成交 GMV</span>
              <span className="text-[10px] font-mono text-slate-400 block">GROSS VOLUME</span>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-semibold border border-blue-200/60">
            {gmvMom}
          </span>
        </div>

        <div className="my-2.5">
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-blue-600 font-bold">¥</span>
            <span className="text-2xl font-bold font-mono text-slate-900">
              {gmvYuan.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-600">
            <span>笔均客单 (ATV):</span>
            <strong className="text-blue-700 font-mono font-semibold">
              ¥{atvYuan.toFixed(2)}
            </strong>
            <span className="text-[10px] font-mono text-emerald-600 font-semibold">{atvMom}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-2 text-slate-500 border-t border-slate-100">
          <span>大面额占比: <strong className="text-slate-800 font-mono font-semibold">38.6%</strong></span>
          <span>汇率: <strong className="text-slate-600 font-mono">USD 7.10</strong></span>
        </div>
      </div>

      {/* 指标 3: 成功出卡订单与兑付履约率 */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4 flex flex-col justify-between relative overflow-hidden group hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[17px]">task_alt</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">成功出卡订单数</span>
              <span className="text-[10px] font-mono text-slate-400 block">FULFILLED ORDERS</span>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-semibold border border-emerald-200/60">
            秒兑质效
          </span>
        </div>

        <div className="my-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {successOrders.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">笔</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-600">
            <span>兑付成功率:</span>
            <strong className="text-slate-900 font-mono font-semibold">
              {successRate.toFixed(2)}%
            </strong>
            <span className="text-[10px] font-mono text-rose-500 font-medium">{successRateMom}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-2 text-slate-500 border-t border-slate-100">
          <span>申请总量: <strong className="text-slate-700 font-mono font-semibold">2,248</strong> 笔</span>
          <span>风控拦截率: <strong className="text-amber-600 font-mono font-semibold">1.75%</strong></span>
        </div>
      </div>

      {/* 指标 4: 首单破冰与复购留存 */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4 flex flex-col justify-between relative overflow-hidden group hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[17px]">flash_on</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">首单破冰与复购</span>
              <span className="text-[10px] font-mono text-slate-400 block">ACTIVATION &amp; RETENTION</span>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-semibold border border-blue-200/60">
            {data.activationStatusTag}
          </span>
        </div>

        <div className="my-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {data.activationRate.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-500">破冰率</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-600">
            <span>30天复购留存:</span>
            <strong className="text-emerald-700 font-mono font-semibold">
              {data.repurchaseRate30d}%
            </strong>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-2 text-slate-500 border-t border-slate-100">
          <span>破冰中位耗时: <strong className="text-slate-800 font-mono font-semibold">{data.activationMedianMinutes} 分钟</strong></span>
          <span>次月留存: <strong className="text-slate-700 font-mono font-semibold">52.8%</strong></span>
        </div>
      </div>

      {/* 指标 5: 核心高价值大客 VIP 资产池 */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4 flex flex-col justify-between relative overflow-hidden group hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[17px]">workspace_premium</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">高价值 VIP 资产池</span>
              <span className="text-[10px] font-mono text-slate-400 block">LV4/LV5 HIGH-NET</span>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-mono text-[10px] font-semibold border border-purple-200/60">
            头部倒挂
          </span>
        </div>

        <div className="my-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {data.highValueVipCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">人 (占 {data.highValueVipPercent}%)</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-600">
            <span>贡献 GMV 占比:</span>
            <strong className="text-purple-700 font-mono font-bold">
              {data.highValueVipGmvShare}%
            </strong>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-2 text-slate-500 border-t border-slate-100">
          <span>人均月出卡: <strong className="text-slate-800 font-mono font-semibold">{data.monthlyAvgFrequency} 次</strong></span>
          <span className="text-purple-600 font-semibold flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[13px]">verified_user</span>
            专席护航
          </span>
        </div>
      </div>
    </section>
  );
};
