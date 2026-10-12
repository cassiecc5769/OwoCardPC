import React, { useState } from 'react';
import { TimeRangePreset } from './riskTypes';

interface RiskTrendsTabProps {
  showToast: (msg: string) => void;
  onNavigateToPrecheck?: (filterDecision?: string) => void;
}

export const RiskTrendsTab: React.FC<RiskTrendsTabProps> = ({
  showToast,
  onNavigateToPrecheck
}) => {
  const [timeRange, setTimeRange] = useState<TimeRangePreset>('7days');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');

  // 趋势数据模拟
  const trendDays = timeRange === 'today'
    ? ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00']
    : timeRange === 'yesterday'
    ? ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
    : timeRange === '7days'
    ? ['10-01', '10-02', '10-03', '10-04', '10-05', '10-06', '10-07']
    : ['第1周', '第2周', '第3周', '第4周'];

  const trendMetrics = {
    '7days': [
      { date: '10-01', total: 3200, pass: 2980, review: 110, block: 78, checkFailed: 32, riskRate: 2.44, lossAvoided: 24500, failRate: 1.0 },
      { date: '10-02', total: 3450, pass: 3210, review: 125, block: 82, checkFailed: 33, riskRate: 2.38, lossAvoided: 26800, failRate: 0.95 },
      { date: '10-03', total: 3780, pass: 3500, review: 140, block: 95, checkFailed: 45, riskRate: 2.51, lossAvoided: 31200, failRate: 1.19 },
      { date: '10-04', total: 4100, pass: 3790, review: 165, block: 108, checkFailed: 37, riskRate: 2.63, lossAvoided: 35900, failRate: 0.90 },
      { date: '10-05', total: 3950, pass: 3640, review: 152, block: 115, checkFailed: 43, riskRate: 2.91, lossAvoided: 38400, failRate: 1.08 },
      { date: '10-06', total: 4080, pass: 3760, review: 170, block: 112, checkFailed: 38, riskRate: 2.74, lossAvoided: 37200, failRate: 0.93 },
      { date: '10-07', total: 3840, pass: 3546, review: 160, block: 104, checkFailed: 30, riskRate: 2.71, lossAvoided: 34500, failRate: 0.78 }
    ],
    today: [
      { date: '00:00', total: 280, pass: 265, review: 8, block: 5, checkFailed: 2, riskRate: 1.78, lossAvoided: 1600, failRate: 0.71 },
      { date: '03:00', total: 190, pass: 180, review: 5, block: 4, checkFailed: 1, riskRate: 2.10, lossAvoided: 1200, failRate: 0.52 },
      { date: '06:00', total: 310, pass: 290, review: 11, block: 7, checkFailed: 2, riskRate: 2.25, lossAvoided: 2300, failRate: 0.64 },
      { date: '09:00', total: 580, pass: 535, review: 24, block: 16, checkFailed: 5, riskRate: 2.75, lossAvoided: 5400, failRate: 0.86 },
      { date: '12:00', total: 720, pass: 660, review: 32, block: 22, checkFailed: 6, riskRate: 3.05, lossAvoided: 7800, failRate: 0.83 },
      { date: '15:00', total: 840, pass: 770, review: 38, block: 24, checkFailed: 8, riskRate: 2.85, lossAvoided: 8900, failRate: 0.95 },
      { date: '18:00', total: 620, pass: 572, review: 28, block: 16, checkFailed: 4, riskRate: 2.58, lossAvoided: 5200, failRate: 0.64 },
      { date: '21:00', total: 300, pass: 274, review: 14, block: 10, checkFailed: 2, riskRate: 3.33, lossAvoided: 3100, failRate: 0.66 }
    ],
    yesterday: [
      { date: '00:00', total: 290, pass: 272, review: 9, block: 6, checkFailed: 3, riskRate: 2.06, lossAvoided: 1900, failRate: 1.03 },
      { date: '04:00', total: 210, pass: 198, review: 6, block: 4, checkFailed: 2, riskRate: 1.90, lossAvoided: 1300, failRate: 0.95 },
      { date: '08:00', total: 540, pass: 498, review: 22, block: 15, checkFailed: 5, riskRate: 2.77, lossAvoided: 4900, failRate: 0.92 },
      { date: '12:00', total: 710, pass: 652, review: 31, block: 21, checkFailed: 6, riskRate: 2.95, lossAvoided: 7400, failRate: 0.84 },
      { date: '16:00', total: 820, pass: 755, review: 36, block: 22, checkFailed: 7, riskRate: 2.68, lossAvoided: 8200, failRate: 0.85 },
      { date: '20:00', total: 650, pass: 602, review: 27, block: 16, checkFailed: 5, riskRate: 2.46, lossAvoided: 5100, failRate: 0.76 },
      { date: '23:59', total: 320, pass: 295, review: 13, block: 8, checkFailed: 4, riskRate: 2.50, lossAvoided: 2200, failRate: 1.25 }
    ],
    '30days': [
      { date: '第1周', total: 24500, pass: 22800, review: 920, block: 560, checkFailed: 220, riskRate: 2.28, lossAvoided: 182000, failRate: 0.89 },
      { date: '第2周', total: 26800, pass: 24900, review: 1040, block: 610, checkFailed: 250, riskRate: 2.27, lossAvoided: 198000, failRate: 0.93 },
      { date: '第3周', total: 28900, pass: 26700, review: 1180, block: 720, checkFailed: 300, riskRate: 2.49, lossAvoided: 236000, failRate: 1.03 },
      { date: '第4周', total: 34300, pass: 31600, review: 1420, block: 910, checkFailed: 370, riskRate: 2.65, lossAvoided: 294000, failRate: 1.07 }
    ]
  };

  const currentDataset = trendMetrics[timeRange] || trendMetrics['7days'];

  // 总计统计
  const totalCards = currentDataset.reduce((acc, cur) => acc + cur.total, 0);
  const totalPass = currentDataset.reduce((acc, cur) => acc + cur.pass, 0);
  const totalReview = currentDataset.reduce((acc, cur) => acc + cur.review, 0);
  const totalBlock = currentDataset.reduce((acc, cur) => acc + cur.block, 0);
  const totalCheckFailed = currentDataset.reduce((acc, cur) => acc + cur.checkFailed, 0);
  const totalLoss = currentDataset.reduce((acc, cur) => acc + cur.lossAvoided, 0);
  const avgRiskRate = (currentDataset.reduce((acc, cur) => acc + cur.riskRate, 0) / currentDataset.length).toFixed(2);

  return (
    <div className="flex flex-col space-y-4 text-xs text-slate-800 antialiased pb-10">
      {/* 顶部 Header & 时间维度选择 */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200 shrink-0">
            <span className="material-symbols-outlined text-[22px]">trending_up</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-slate-900 text-sm">风控趋势（回答：风控指标如何演变、异常是否扩散、通道质量如何？）</h2>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold border border-indigo-200">
                多维时序趋势分析
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              深度对比预检通过率、拦截率与工具异常率演变轨迹。<strong className="text-slate-700">明确区分：CHECK_FAILED 工具异常波动属于接口健康问题，不计入恶意欺诈 BLOCK 趋势。</strong>
            </p>
          </div>
        </div>

        {/* 时间跨度快速切换 */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          {[
            { id: 'today', label: '今日实时' },
            { id: 'yesterday', label: '昨日对比' },
            { id: '7days', label: '近 7 日趋势' },
            { id: '30days', label: '近 30 日全貌' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => {
                setTimeRange(btn.id as TimeRangePreset);
                showToast(`已切换趋势时间窗口: ${btn.label}`);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                timeRange === btn.id
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* 核心结论 KPI 卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* 1. 总预检量 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-medium">总预检运行量</span>
            <span className="material-symbols-outlined text-slate-400 text-[18px]">query_stats</span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-slate-900">{totalCards.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">覆盖 100% 进单请求</div>
          </div>
        </div>

        {/* 2. PASS 通过 */}
        <div
          onClick={() => onNavigateToPrecheck && onNavigateToPrecheck('PASS')}
          className="bg-white p-3.5 rounded-xl border border-emerald-200/80 shadow-xs flex flex-col justify-between cursor-pointer hover:border-emerald-400 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-emerald-700 text-xs font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              PASS 放行通过
            </span>
            <span className="text-[10px] text-emerald-600 font-mono font-bold">
              {((totalPass / (totalCards || 1)) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-emerald-700">{totalPass.toLocaleString()}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">正常流转至撮合派单</div>
          </div>
        </div>

        {/* 3. REVIEW 人工复核 */}
        <div
          onClick={() => onNavigateToPrecheck && onNavigateToPrecheck('REVIEW')}
          className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-xs flex flex-col justify-between cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-amber-700 text-xs font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              REVIEW 待复核
            </span>
            <span className="text-[10px] text-amber-600 font-mono font-bold">
              {((totalReview / (totalCards || 1)) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-amber-700">{totalReview.toLocaleString()}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">面额微差/新客二次确认</div>
          </div>
        </div>

        {/* 4. BLOCK 风险拦截 */}
        <div
          onClick={() => onNavigateToPrecheck && onNavigateToPrecheck('BLOCK')}
          className="bg-white p-3.5 rounded-xl border border-rose-200/80 shadow-xs flex flex-col justify-between cursor-pointer hover:border-rose-400 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-rose-700 text-xs font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              BLOCK 恶意拦截
            </span>
            <span className="text-[10px] text-rose-600 font-mono font-bold">
              {((totalBlock / (totalCards || 1)) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-rose-600">{totalBlock.toLocaleString()}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">挽回损失 ${totalLoss.toLocaleString()}</div>
          </div>
        </div>

        {/* 5. CHECK_FAILED 预检异常 */}
        <div
          onClick={() => onNavigateToPrecheck && onNavigateToPrecheck('CHECK_FAILED')}
          className="bg-purple-50/50 p-3.5 rounded-xl border border-purple-200 shadow-xs flex flex-col justify-between cursor-pointer hover:border-purple-400 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-purple-700 text-xs font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              CHECK_FAILED 工具异常
            </span>
            <span className="text-[10px] text-purple-600 font-mono font-bold">
              {((totalCheckFailed / (totalCards || 1)) * 100).toFixed(2)}%
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-purple-800">{totalCheckFailed.toLocaleString()}</div>
            <div className="text-[11px] text-purple-600 font-medium mt-0.5">≠ BLOCK (需通道重试)</div>
          </div>
        </div>
      </div>

      {/* 区分声明 Banner */}
      <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-emerald-50 border border-purple-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-purple-600 text-[20px]">info</span>
          <div>
            <span className="font-bold text-slate-900">核心标准原则提醒：CHECK_FAILED 不等于 BLOCK</span>
            <p className="text-slate-600 text-[11px] mt-0.5">
              • <strong className="text-purple-700">CHECK_FAILED</strong>：代表查卡通道网关超时 (504)、API 握手失败或商户接口暂不可用，系统会自动进行备用源轮询或通知人工客服复核，<strong>严禁直接拉黑用户或误判为坏卡</strong>。<br />
              • <strong className="text-rose-700">BLOCK</strong>：代表卡内真实余额为零、已被核销兑换、命中黑名单或涉嫌重复撞库一卡多卖，系统直接予以阻断。
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateToPrecheck && onNavigateToPrecheck('CHECK_FAILED')}
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer shadow-xs"
        >
          查看异常重试流
        </button>
      </div>

      {/* 趋势图表区：1. 决策分布走势柱状/堆叠图 */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">各时段预检结果分类走势 (PASS / REVIEW / BLOCK / CHECK_FAILED)</span>
            <span className="text-[11px] text-slate-400">单位：笔</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> PASS</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500"></span> REVIEW</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-500"></span> BLOCK</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-purple-500"></span> CHECK_FAILED (工具异常)</span>
          </div>
        </div>

        {/* 模拟图表条形堆叠展示 */}
        <div className="pt-6 pb-2 space-y-4">
          {currentDataset.map((row, idx) => {
            const passPct = (row.pass / row.total) * 100;
            const reviewPct = (row.review / row.total) * 100;
            const blockPct = (row.block / row.total) * 100;
            const failedPct = (row.checkFailed / row.total) * 100;

            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-semibold text-slate-700 w-14">{row.date}</span>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-emerald-700">PASS: {row.pass}</span>
                    <span className="text-amber-700">REVIEW: {row.review}</span>
                    <span className="text-rose-600 font-bold">BLOCK: {row.block}</span>
                    <span className="text-purple-700 font-semibold bg-purple-50 px-1 rounded">FAILED: {row.checkFailed}</span>
                    <span className="text-slate-400">总计: {row.total}</span>
                  </div>
                </div>

                {/* 堆叠进度条 */}
                <div className="w-full h-4 bg-slate-100 rounded-full flex overflow-hidden border border-slate-200/50">
                  <div style={{ width: `${passPct}%` }} className="bg-emerald-500 hover:opacity-90 transition-all" title={`PASS: ${row.pass} (${passPct.toFixed(1)}%)`}></div>
                  <div style={{ width: `${reviewPct}%` }} className="bg-amber-500 hover:opacity-90 transition-all" title={`REVIEW: ${row.review} (${reviewPct.toFixed(1)}%)`}></div>
                  <div style={{ width: `${blockPct}%` }} className="bg-rose-500 hover:opacity-90 transition-all" title={`BLOCK: ${row.block} (${blockPct.toFixed(1)}%)`}></div>
                  <div style={{ width: `${failedPct}%` }} className="bg-purple-500 hover:opacity-90 transition-all" title={`CHECK_FAILED: ${row.checkFailed} (${failedPct.toFixed(1)}%)`}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 趋势图表区 2：卡种风险暴露率走势对比 & 通道健康度 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 卡种风险演变 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="font-bold text-slate-900 text-sm">主要卡种风险拦截率趋势 (BLOCK Rate)</span>
            <span className="text-[11px] text-slate-400">基准警戒线 3.0%</span>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {[
              { brand: 'Apple', name: 'Apple Gift Card', rate: '4.05%', trend: '+0.8%', isHigh: true, desc: '近期受批量撞库影响，零余额卡有上升' },
              { brand: 'Steam', name: 'Steam Wallet Key', rate: '2.14%', trend: '-0.3%', isHigh: false, desc: '全球码通道稳定，履约良好' },
              { brand: 'Target', name: 'Target US Card', rate: '2.93%', trend: '+0.1%', isHigh: false, desc: '部分面额少充申报在 REVIEW 中二次确认' },
              { brand: 'Sephora', name: 'Sephora US Card', rate: '2.35%', trend: '+0.4%', isHigh: false, desc: 'POS 通道偶尔发生 CHECK_FAILED 重试' },
              { brand: 'Vanilla', name: 'Vanilla Visa/Master', rate: '1.80%', trend: '-0.2%', isHigh: false, desc: '银行卡组织接口响应平稳' }
            ].map((b, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{b.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                      b.isHigh ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {b.rate}
                    </span>
                    <span className={`text-[10px] font-mono ${b.trend.startsWith('+') && b.isHigh ? 'text-rose-600 font-bold' : 'text-emerald-600'}`}>
                      {b.trend}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{b.desc}</p>
                </div>
                <button
                  onClick={() => onNavigateToPrecheck && onNavigateToPrecheck('BLOCK')}
                  className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded border border-blue-200 cursor-pointer"
                >
                  溯源
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 预检工具通道可用性 (CHECK_FAILED 监控) */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="font-bold text-slate-900 text-sm">预检通道健康度 (CHECK_FAILED 发生率监控)</span>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">全网健康度 99.1%</span>
          </div>

          <div className="mt-3 space-y-3">
            {[
              { gateway: 'Apple Enterprise Direct API', latency: '1,120ms', status: 'HEALTHY', successRate: '99.4%', failedCount: 6 },
              { gateway: 'Valve KeyVerify Global Engine', latency: '890ms', status: 'HEALTHY', successRate: '99.7%', failedCount: 3 },
              { gateway: 'Target Direct Gateway API', latency: '1,420ms', status: 'HEALTHY', successRate: '98.9%', failedCount: 8 },
              { gateway: 'Sephora US POS Gateway (Primary)', latency: '3,800ms', status: 'DEGRADED', successRate: '96.2%', failedCount: 13, note: '偶发 504 超时，备用通道自动接管' },
              { gateway: 'Vanilla Card Balance Network', latency: '1,250ms', status: 'HEALTHY', successRate: '99.1%', failedCount: 4 }
            ].map((g, gi) => (
              <div key={gi} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 text-xs">{g.gateway}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      g.status === 'HEALTHY' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {g.status === 'HEALTHY' ? '正常运行' : '轻微抖动'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-3">
                    <span>平均耗时: {g.latency}</span>
                    <span>可用率: {g.successRate}</span>
                    {g.note && <span className="text-amber-700 font-sans">{g.note}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-purple-700">{g.failedCount} 次异常</div>
                  <div className="text-[10px] text-slate-400">已全部重试恢复</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
