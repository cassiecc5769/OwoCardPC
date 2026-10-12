import React, { useState } from 'react';
import { NavPath } from '../../../types';

interface BusinessTrendsTabProps {
  initialMetric?: string;
  onNavigate?: (path: NavPath) => void;
}

export type TrendGranularity = 'hour' | 'day' | 'week' | 'month';
export type TrendCompareType = 'previous_period' | 'same_period_last_year' | 'custom_baseline';

export const BusinessTrendsTab: React.FC<BusinessTrendsTabProps> = ({
  initialMetric = 'gmv',
  onNavigate
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>(initialMetric);
  const [granularity, setGranularity] = useState<TrendGranularity>('day');
  const [compareType, setCompareType] = useState<TrendCompareType>('previous_period');
  const [selectedAnomalyPoint, setSelectedAnomalyPoint] = useState<{
    date: string;
    currentVal: string;
    expectedVal: string;
    dropPct: string;
    rootCauses: Array<{ title: string; desc: string; targetPath: NavPath }>;
  } | null>(null);

  // 指标列表
  const metricOptions = [
    { id: 'gmv', name: 'GMV (成功交易流水)', unit: '$', isCurrency: true },
    { id: 'orders', name: '成交订单数', unit: '单' },
    { id: 'users', name: '成交用户数', unit: '人' },
    { id: 'first_order_conv', name: '首单转化率', unit: '%' },
    { id: 'repurchase_rate', name: '复购率 (30天)', unit: '%' },
    { id: 'aov', name: '客单价 (AOV)', unit: '$', isCurrency: true },
    { id: 'net_profit', name: '平台毛利', unit: '$', isCurrency: true },
    { id: 'success_rate', name: '成交率', unit: '%' },
    { id: 'aftersale_rate', name: '售后争议率', unit: '%' }
  ];

  // 趋势模拟序列数据 (包含 PRD 17.2.3 明确指出的 72万 异常点)
  const trendData = [
    { date: '10-01 (周四)', current: 120, prev: 112, isAnomaly: false },
    { date: '10-02 (周五)', current: 110, prev: 108, isAnomaly: false },
    { date: '10-03 (周六)', current: 115, prev: 114, isAnomaly: false },
    {
      date: '10-04 (周日)',
      current: 72,
      prev: 118,
      isAnomaly: true,
      anomalyReason: '异常暴跌 -39.0% (Steam US 渠道由于第三方 API 抖动导致流失)'
    },
    { date: '10-05 (周一)', current: 108, prev: 110, isAnomaly: false },
    { date: '10-06 (周二)', current: 125, prev: 115, isAnomaly: false },
    { date: '10-07 (今日)', current: 142, prev: 126, isAnomaly: false }
  ];

  const maxVal = Math.max(...trendData.map(d => Math.max(d.current, d.prev))) * 1.15;

  const handlePointClick = (point: typeof trendData[0]) => {
    if (point.isAnomaly) {
      setSelectedAnomalyPoint({
        date: point.date,
        currentVal: '$720,000 USD',
        expectedVal: '$1,180,000 USD (上周期基准)',
        dropPct: '-39.0%',
        rootCauses: [
          {
            title: '1. Steam US 品牌通道抖动 (贡献度 -28%)',
            desc: 'Valve 查询主接口 10-04 14:00~18:00 发生持续 504 超时，导致订单未完成撮合自动超时关闭。',
            targetPath: 'card-tools-management'
          },
          {
            title: '2. 新客首单转化率突降 (贡献度 -18%)',
            desc: '投放渠道推广链路临时限流，新注册首单用户减少 120 人。',
            targetPath: 'user-analytics'
          },
          {
            title: '3. 核心商户接单配额耗尽 (贡献度 -12%)',
            desc: '做卡商户 M08 押金保证金未及时追加，触发接单熔断保护 2 小时。',
            targetPath: 'merchant-analytics'
          }
        ]
      });
    }
  };

  return (
    <div className="space-y-4 text-xs text-slate-800 antialiased animate-in fade-in duration-200">
      {/* 顶部控制栏: 指标选择 + 粒度选择 + 对比选择 */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-bold text-slate-900 text-xs">趋势分析指标:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {metricOptions.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMetric(m.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedMetric === m.id
                    ? 'bg-[#004ac6] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* 粒度与对比 */}
        <div className="flex items-center gap-2">
          {/* 粒度 */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/60 font-medium text-[11px]">
            {[
              { id: 'hour', label: '小时' },
              { id: 'day', label: '日' },
              { id: 'week', label: '周' },
              { id: 'month', label: '月' }
            ].map(g => (
              <button
                key={g.id}
                onClick={() => setGranularity(g.id as TrendGranularity)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  granularity === g.id ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* 对比模式 */}
          <select
            value={compareType}
            onChange={e => setCompareType(e.target.value as TrendCompareType)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 font-medium"
          >
            <option value="previous_period">对比: 上周期 (环比)</option>
            <option value="same_period_last_year">对比: 去年同期 (同比)</option>
            <option value="custom_baseline">对比: 自定义经营目标基准</option>
          </select>
        </div>
      </div>

      {/* 趋势图表区 (包含异常点交互下钻) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 text-sm">
                {metricOptions.find(m => m.id === selectedMetric)?.name} 周期演进趋势
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-[10px] font-bold border border-blue-200">
                粒度: {granularity === 'day' ? '按日 (Day)' : granularity === 'hour' ? '按小时 (Hour)' : '按周 (Week)'}
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              实线代表当前周期走势，虚线代表对比周期走势。<span className="text-rose-600 font-bold">红点标记异常突变波动</span>，点击异常点可一键下钻归因分析。
            </p>
          </div>

          {/* 图例 */}
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-blue-600 rounded"></span>
              <span className="text-slate-700">当前周期值</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-slate-300 rounded border-dashed"></span>
              <span className="text-slate-500">对比周期值 (上周期)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
              <span className="text-rose-700 font-bold">系统检测异常点</span>
            </div>
          </div>
        </div>

        {/* 柱状与折线复合趋势看板 */}
        <div className="h-64 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-200">
          {trendData.map((d, i) => {
            const currentHeightPct = Math.round((d.current / maxVal) * 100);
            const prevHeightPct = Math.round((d.prev / maxVal) * 100);

            return (
              <div
                key={i}
                onClick={() => handlePointClick(d)}
                className={`flex-1 flex flex-col items-center justify-end h-full group relative transition-all ${
                  d.isAnomaly ? 'cursor-pointer' : ''
                }`}
              >
                {/* 异常点气泡提手 */}
                {d.isAnomaly && (
                  <div className="absolute -top-3 z-10 animate-bounce">
                    <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-mono text-[9px] font-bold shadow-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-[11px]">warning</span>
                      72万 (异常突降) 点击下钻
                    </span>
                  </div>
                )}

                {/* 数值标签 */}
                <span className={`text-[10px] font-mono font-bold mb-1 ${d.isAnomaly ? 'text-rose-600' : 'text-slate-700'}`}>
                  {d.current}万
                </span>

                {/* 柱状双柱对比 */}
                <div className="w-full max-w-[48px] flex items-end justify-center gap-1.5 h-full">
                  {/* 对比期 */}
                  <div
                    style={{ height: `${prevHeightPct}%` }}
                    className="w-1/2 bg-slate-200 rounded-t-md group-hover:bg-slate-300 transition-all"
                    title={`对比上周期: ${d.prev}万`}
                  ></div>

                  {/* 当期 */}
                  <div
                    style={{ height: `${currentHeightPct}%` }}
                    className={`w-1/2 rounded-t-md transition-all relative ${
                      d.isAnomaly
                        ? 'bg-rose-500 shadow-md ring-2 ring-rose-400'
                        : 'bg-blue-600 group-hover:bg-blue-700'
                    }`}
                    title={`当前周期: ${d.current}万`}
                  >
                    {d.isAnomaly && (
                      <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-rose-600 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                </div>

                {/* X 轴日期 */}
                <span className="text-[10px] text-slate-500 font-mono mt-2 text-center whitespace-nowrap">
                  {d.date.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>数据时间跨度: 2026-10-01 ~ 2026-10-07</span>
          <span>指标健康综合得分: 92/100 (整体处于良性增长通道)</span>
        </div>
      </div>

      {/* 异常点下钻归因分析模态框 (PRD 17.2.3) */}
      {selectedAnomalyPoint && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-5 space-y-4 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">crisis_alert</span>
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    指标异常下钻专题: {selectedAnomalyPoint.date} 突降归因
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    实际: {selectedAnomalyPoint.currentVal} · 基准: {selectedAnomalyPoint.expectedVal} ({selectedAnomalyPoint.dropPct})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAnomalyPoint(null)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* 核心归因要素 */}
            <div className="space-y-2.5">
              <span className="font-bold text-slate-900 text-xs">
                系统智能归因矩阵（回答：到底是用户少了、订单少了、价格下降了、还是交易成功率下降了？）
              </span>

              <div className="space-y-2">
                {selectedAnomalyPoint.rootCauses.map((cause, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{cause.title}</span>
                      <button
                        onClick={() => {
                          setSelectedAnomalyPoint(null);
                          if (onNavigate) onNavigate(cause.targetPath);
                        }}
                        className="text-blue-600 hover:underline font-semibold text-[11px] cursor-pointer flex items-center gap-0.5"
                      >
                        前往专题排查
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">{cause.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 底部动作 */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">
                提示：该异常已自动同步至风控与运维告警中心
              </span>
              <button
                onClick={() => {
                  setSelectedAnomalyPoint(null);
                  if (onNavigate) onNavigate('transaction-analytics');
                }}
                className="px-4 py-2 bg-[#004ac6] hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                进入 02 交易分析专题完整复盘
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
