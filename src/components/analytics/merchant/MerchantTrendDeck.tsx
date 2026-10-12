import React, { useState } from 'react';
import {
  MerchantSevenDayTrendChart,
  MerchantDailyTrendItem,
  MerchantTrendViewMode,
} from './MerchantSevenDayTrendChart';

export interface MerchantTrendDeckProps {
  onShowToast: (msg: string) => void;
  onNavigateToReport?: () => void;
}

export const MerchantTrendDeck: React.FC<MerchantTrendDeckProps> = ({
  onShowToast,
  onNavigateToReport,
}) => {
  const [trendView, setTrendView] = useState<MerchantTrendViewMode>('gmv-orders');
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(6); // 默认今日 08-27

  // 近7日全网商户接单承揽走势数据 (2026-08-21 ~ 2026-08-27)
  const DAILY_TREND_DATA: MerchantDailyTrendItem[] = [
    {
      date: '08-21',
      fullDate: '2026-08-21',
      dayLabel: '周五',
      gmvUsd: 1180000,
      ordersAccepted: 10100,
      ordersSuccess: 9928,
      successRate: 98.30,
      avgResponseSec: 16.2,
      avgFulfillmentSec: 42.5,
      rejectRate: 0.88,
      disputeRate: 0.19,
      activeMerchantsCount: 82,
    },
    {
      date: '08-22',
      fullDate: '2026-08-22',
      dayLabel: '周六',
      gmvUsd: 1210000,
      ordersAccepted: 10400,
      ordersSuccess: 10212,
      successRate: 98.20,
      avgResponseSec: 15.6,
      avgFulfillmentSec: 41.2,
      rejectRate: 0.85,
      disputeRate: 0.17,
      activeMerchantsCount: 84,
    },
    {
      date: '08-23',
      fullDate: '2026-08-23',
      dayLabel: '周日',
      gmvUsd: 1254000,
      ordersAccepted: 10800,
      ordersSuccess: 10638,
      successRate: 98.50,
      avgResponseSec: 15.1,
      avgFulfillmentSec: 39.8,
      rejectRate: 0.82,
      disputeRate: 0.15,
      activeMerchantsCount: 85,
    },
    {
      date: '08-24',
      fullDate: '2026-08-24',
      dayLabel: '周一',
      gmvUsd: 1298400,
      ordersAccepted: 11200,
      ordersSuccess: 11032,
      successRate: 98.50,
      avgResponseSec: 14.8,
      avgFulfillmentSec: 40.2,
      rejectRate: 0.80,
      disputeRate: 0.14,
      activeMerchantsCount: 86,
    },
    {
      date: '08-25',
      fullDate: '2026-08-25',
      dayLabel: '周二',
      gmvUsd: 1342000,
      ordersAccepted: 11620,
      ordersSuccess: 11460,
      successRate: 98.62,
      avgResponseSec: 13.9,
      avgFulfillmentSec: 37.8,
      rejectRate: 0.71,
      disputeRate: 0.13,
      activeMerchantsCount: 87,
    },
    {
      date: '08-26',
      fullDate: '2026-08-26',
      dayLabel: '周三',
      gmvUsd: 1386200,
      ordersAccepted: 11950,
      ordersSuccess: 11782,
      successRate: 98.59,
      avgResponseSec: 14.5,
      avgFulfillmentSec: 39.1,
      rejectRate: 0.78,
      disputeRate: 0.16,
      activeMerchantsCount: 87,
    },
    {
      date: '08-27',
      fullDate: '2026-08-27',
      dayLabel: '今日实时',
      gmvUsd: 1428500,
      ordersAccepted: 12380,
      ordersSuccess: 12210,
      successRate: 98.63,
      avgResponseSec: 14.2,
      avgFulfillmentSec: 38.4,
      rejectRate: 0.74,
      disputeRate: 0.14,
      activeMerchantsCount: 88,
    },
  ];

  const currentDay = DAILY_TREND_DATA[selectedDateIndex] || DAILY_TREND_DATA[6];
  const prevDay = selectedDateIndex > 0 ? DAILY_TREND_DATA[selectedDateIndex - 1] : null;

  // 计算日环比 DoD
  const gmvDod = prevDay ? (((currentDay.gmvUsd - prevDay.gmvUsd) / prevDay.gmvUsd) * 100).toFixed(2) : '+3.05';
  const ordersDod = prevDay ? (((currentDay.ordersSuccess - prevDay.ordersSuccess) / prevDay.ordersSuccess) * 100).toFixed(2) : '+3.63';
  const responseDelta = prevDay ? (currentDay.avgResponseSec - prevDay.avgResponseSec).toFixed(1) : '-0.3';

  return (
    <section className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 flex flex-col gap-4">
      {/* 头部标题与跳转多维报表 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-4.5 bg-blue-600 rounded-xs" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                近7日商户承揽与SLA履约时效时序走势
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-50 text-blue-700 font-semibold border border-blue-200/60">
                双轴交互图表 · 3大视角自由切换
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              监控全网认证商户承揽规模爬坡、核销时效SLA与风控纠纷波动，点击图表节点联动下钻当日切面
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToReport && (
            <button
              type="button"
              onClick={onNavigateToReport}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200/70"
            >
              <span className="material-symbols-outlined text-[15px]">calendar_month</span>
              <span>查看日期多维报表</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          )}
        </div>
      </div>

      {/* 走势图表分析引擎 */}
      <MerchantSevenDayTrendChart
        data={DAILY_TREND_DATA}
        trendView={trendView}
        onTrendViewChange={setTrendView}
        selectedDateIndex={selectedDateIndex}
        onSelectDateIndex={setSelectedDateIndex}
        onShowToast={onShowToast}
      />

      {/* 当日商户履约深度切面解读 (与点击日期深度联动) */}
      <div className="bg-slate-50/70 rounded-xl border border-slate-200/80 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-200/70">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-blue-600 text-white">
              <span className="material-symbols-outlined text-[16px]">analytics</span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-xs">
                  {currentDay.fullDate} ({currentDay.dayLabel}) 商户履约深度切面解读
                </span>
                <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-mono text-[10.5px] font-semibold">
                  活跃坐席 {currentDay.activeMerchantsCount} 家
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                当日商户承揽总流水与 SLA 履约综合评价
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1">
              <span className="text-slate-500">承揽 GMV:</span>
              <span className="font-bold text-slate-900">${currentDay.gmvUsd.toLocaleString()}</span>
              <span className="text-emerald-600 font-semibold text-[11px]">
                ({Number(gmvDod) >= 0 ? `+${gmvDod}%` : `${gmvDod}%`} DoD)
              </span>
            </div>
            <div className="h-3 w-px bg-slate-200" />
            <div className="flex items-center gap-1">
              <span className="text-slate-500">完单数量:</span>
              <span className="font-bold text-slate-900">{currentDay.ordersSuccess.toLocaleString()} 笔</span>
              <span className="text-emerald-600 font-semibold text-[11px]">
                ({Number(ordersDod) >= 0 ? `+${ordersDod}%` : `${ordersDod}%`} DoD)
              </span>
            </div>
            <div className="h-3 w-px bg-slate-200" />
            <div className="flex items-center gap-1">
              <span className="text-slate-500">平均响应:</span>
              <span className="font-bold text-indigo-700">{currentDay.avgResponseSec}s</span>
              <span className="text-slate-500 text-[11px]">
                ({Number(responseDelta) <= 0 ? `${responseDelta}s` : `+${responseDelta}s`})
              </span>
            </div>
          </div>
        </div>

        {/* 关键履约诊断详情 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
          <div className="p-2.5 bg-white rounded-lg border border-slate-200/60 flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>履约成功率与稳定性</span>
              <span className="font-bold text-emerald-700 font-mono">{currentDay.successRate}%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-0.5">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${currentDay.successRate}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              当日接单 {currentDay.ordersAccepted.toLocaleString()} 单，成功核销率处于高位平稳区间。
            </p>
          </div>

          <div className="p-2.5 bg-white rounded-lg border border-slate-200/60 flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>核销时效 (SLA) 表现</span>
              <span className="font-bold text-blue-700 font-mono">总核销 {currentDay.avgFulfillmentSec}s</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-0.5">
              <div
                className="bg-blue-600 h-full rounded-full"
                style={{ width: `${Math.max(10, Math.min(100, (60 / currentDay.avgFulfillmentSec) * 100))}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              响应延迟 {currentDay.avgResponseSec}s，符合 45s 基线要求，API直通占比超 78%。
            </p>
          </div>

          <div className="p-2.5 bg-white rounded-lg border border-slate-200/60 flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>摩擦与风控预警</span>
              <span className="font-bold text-slate-700 font-mono">
                拒单 {currentDay.rejectRate}% / 争议 {currentDay.disputeRate}%
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-0.5">
              <div
                className="bg-rose-500 h-full rounded-full"
                style={{ width: `${(currentDay.rejectRate + currentDay.disputeRate) * 40}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              低摩擦健康状态，未发生单商爆仓或停机跳票，防爆仓熔断防线运转正常。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
