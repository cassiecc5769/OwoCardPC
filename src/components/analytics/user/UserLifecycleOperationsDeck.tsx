import React, { useState } from 'react';
import { UserSevenDayTrendChart, DailyTrendItem, TrendViewMode } from './UserSevenDayTrendChart';

export interface UserLifecycleOperationsDeckProps {
  onShowToast: (msg: string) => void;
  onNavigateToReport?: () => void;
}

export const UserLifecycleOperationsDeck: React.FC<UserLifecycleOperationsDeckProps> = ({
  onShowToast,
  onNavigateToReport,
}) => {
  // 趋势图视图切换：'gmv-orders' (交易与GMV走势) | 'acquisition-conversion' (拉新与破冰走势) | 'rate-atv' (成功率与客单价)
  const [trendView, setTrendView] = useState<TrendViewMode>('gmv-orders');
  // 当前聚焦选中的日期 (默认 9/18 今日峰值)
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(6);

  // 近7日真实交易走势数据 (2026-09-12 ~ 2026-09-18，与图片分析维度精准契合)
  const DAILY_TREND_DATA: DailyTrendItem[] = [
    {
      date: '09-12',
      fullDate: '2026-09-12',
      dayLabel: '周六',
      registeredUsers: 390,
      firstOrderUsers: 205,
      firstConvRate: 52.6,
      transUsers: 1210,
      successOrders: 1480,
      gmvYuan: 768816, // GMV 折合人民币 (以汇率 7.1 计算)
      gmvTenThousand: 76.88,
      atvYuan: 519.47,
      successRate: 79.2,
    },
    {
      date: '09-13',
      fullDate: '2026-09-13',
      dayLabel: '周日',
      registeredUsers: 410,
      firstOrderUsers: 220,
      firstConvRate: 53.7,
      transUsers: 1280,
      successOrders: 1590,
      gmvYuan: 817920,
      gmvTenThousand: 81.79,
      atvYuan: 514.41,
      successRate: 79.8,
    },
    {
      date: '09-14',
      fullDate: '2026-09-14',
      dayLabel: '周一',
      registeredUsers: 440,
      firstOrderUsers: 245,
      firstConvRate: 55.7,
      transUsers: 1390,
      successOrders: 1720,
      gmvYuan: 861940,
      gmvTenThousand: 86.19,
      atvYuan: 501.12,
      successRate: 80.1,
    },
    {
      date: '09-15',
      fullDate: '2026-09-15',
      dayLabel: '周二',
      registeredUsers: 460,
      firstOrderUsers: 260,
      firstConvRate: 56.5,
      transUsers: 1480,
      successOrders: 1840,
      gmvYuan: 912350,
      gmvTenThousand: 91.24,
      atvYuan: 495.84,
      successRate: 79.5,
    },
    {
      date: '09-16',
      fullDate: '2026-09-16',
      dayLabel: '周三',
      registeredUsers: 490,
      firstOrderUsers: 270,
      firstConvRate: 55.1,
      transUsers: 1510,
      successOrders: 1910,
      gmvYuan: 971280,
      gmvTenThousand: 97.13,
      atvYuan: 508.52,
      successRate: 78.9,
    },
    {
      date: '09-17',
      fullDate: '2026-09-17',
      dayLabel: '周四',
      registeredUsers: 520,
      firstOrderUsers: 285,
      firstConvRate: 54.8,
      transUsers: 1620,
      successOrders: 2040,
      gmvYuan: 1008910,
      gmvTenThousand: 100.89,
      atvYuan: 494.56,
      successRate: 78.1,
    },
    {
      date: '09-18',
      fullDate: '2026-09-18',
      dayLabel: '周五 (今日)',
      registeredUsers: 580,
      firstOrderUsers: 312,
      firstConvRate: 53.8,
      transUsers: 1734,
      successOrders: 2208,
      gmvYuan: 1123504,
      gmvTenThousand: 112.35,
      atvYuan: 525.10,
      successRate: 78.53,
    },
  ];

  const currentDay = DAILY_TREND_DATA[selectedDateIndex] || DAILY_TREND_DATA[6];

  return (
    <section className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 flex flex-col gap-4">
      {/* 头部标题与维度标签 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-4.5 bg-blue-600 rounded-xs" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                近7日核心指标时序走势与经营质效诊断
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-50 text-blue-700 font-semibold border border-blue-200/60">
                双轴交互图表 · 3大视角自由切换
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              深度对比近7日 GMV 体量、破冰与复购转化效率、笔均客单价 (ATV) 动态演变，点击图表节点联动下钻当日切面
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
              <span className="material-symbols-outlined text-[15px]">table_chart</span>
              <span>查看日期多维报表</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          )}
        </div>
      </div>

      {/* 走势图表分析引擎：近7日指标时序走势交互图表 (双轴柱线复合 / 平滑面积折线 / 对比柱状) */}
      <UserSevenDayTrendChart
        data={DAILY_TREND_DATA}
        trendView={trendView}
        onTrendViewChange={setTrendView}
        selectedDateIndex={selectedDateIndex}
        onSelectDateIndex={setSelectedDateIndex}
        onShowToast={onShowToast}
      />

      {/* 当日经营切面与诊断解读卡片 (随图表点击点选实时联动) */}
      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-100/70 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">insights</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">
                {currentDay.date} ({currentDay.dayLabel}) 经营深度切面解读
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                稳健增长
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {currentDay.fullDate}
              </span>
            </div>
            <p className="text-slate-600 text-xs mt-0.5">
              当日成交 GMV <strong className="font-mono text-slate-900">¥{(currentDay.gmvYuan).toLocaleString()}</strong> 元，
              出卡活跃交易 <strong className="font-mono text-slate-900">{currentDay.transUsers.toLocaleString()}</strong> 人，
              首单破冰转化率 <strong className="font-mono text-blue-700">{currentDay.firstConvRate}%</strong>，
              笔均客单价 <strong className="font-mono text-slate-900">¥{currentDay.atvYuan.toFixed(2)}</strong>，
              交易兑付成功率 <strong className="font-mono text-emerald-700">{currentDay.successRate}%</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
          <span>首单破冰中位耗时: <strong className="text-slate-800">18.5 分钟</strong></span>
          <span>·</span>
          <span>当日注册用户: <strong className="text-slate-800">{currentDay.registeredUsers} 人</strong></span>
          <span>·</span>
          <span>成功出卡申请: <strong className="text-slate-800">{currentDay.successOrders} 笔</strong></span>
        </div>
      </div>
    </section>
  );
};
