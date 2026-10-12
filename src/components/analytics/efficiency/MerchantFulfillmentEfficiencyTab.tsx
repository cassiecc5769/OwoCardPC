import React, { useState } from 'react';
import { NavPath } from '../../../types';

interface MerchantFulfillmentEfficiencyTabProps {
  onNavigate?: (path: NavPath) => void;
}

export const MerchantFulfillmentEfficiencyTab: React.FC<MerchantFulfillmentEfficiencyTabProps> = ({
  onNavigate
}) => {
  const [filterBrand, setFilterBrand] = useState('ALL');
  const [filterCountry, setFilterCountry] = useState('ALL');

  // 1. 核心链路与时效指标 (PRD 17.4.3)
  const fulfillmentChain = [
    {
      stage: '1. 收到卡单 (Received)',
      metricName: '待分配卡单',
      val: '9,300 单',
      latency: '系统分配 0.2s',
      statusText: '瞬时撮合',
      desc: '系统匹配最优做卡商户并推送接单通知'
    },
    {
      stage: '2. 商户接单 (Accepted)',
      metricName: '接单率: 96.8% (拒单率 3.2%)',
      val: '8,900 单',
      latency: '平均接单耗时: 14.2 秒',
      statusText: 'SLA ≤30s',
      desc: '商户调用 API 或在工作台确认锁定卡密'
    },
    {
      stage: '3. 开始处理 (Processing)',
      metricName: '处理响应时效',
      val: '8,900 单',
      latency: '开始处理平均耗时: 4.8 秒',
      statusText: '自动调起',
      desc: '商户调取充值通道或卡工具发起核销'
    },
    {
      stage: '4. 处理完成 (Completed)',
      metricName: '处理成功率: 99.2% (失败率 0.8%)',
      val: '8,400 单',
      latency: '平均充值核销耗时: 24.2 秒',
      statusText: '全流程 38.4s',
      desc: '回传官方兑换单据，完成撮合闭环'
    }
  ];

  // 2. 8 大核心商户履约指标看板
  const coreMetrics = [
    { label: '商户接单率', val: '96.8%', mom: '+0.4%', ref: '目标 ≥95%', color: 'emerald' },
    { label: '主动拒单率', val: '3.2%', mom: '-0.4%', ref: '红线 ≤5.0%', color: 'blue' },
    { label: '平均接单时长', val: '14.2 秒', mom: '-1.8s', ref: 'SLA ≤30s', color: 'emerald' },
    { label: '平均处理时长', val: '24.2 秒', mom: '-2.4s', ref: 'SLA ≤45s', color: 'emerald' },
    { label: '核销完成率', val: '99.2%', mom: '+0.1%', ref: '目标 ≥98%', color: 'emerald' },
    { label: '履约超时率 (>60s)', val: '1.8%', mom: '-0.3%', ref: '红线 ≤3.0%', color: 'amber' },
    { label: '转单重试率 (Fallback)', val: '2.4%', mom: '-0.5%', ref: '常态 ≤4.0%', color: 'purple' },
    { label: '处理失败率', val: '0.8%', mom: '-0.1%', ref: '红线 ≤1.5%', color: 'rose' }
  ];

  // 3. 商户履约对比明细表 (PRD 17.4.3: 可识别“报价虽然最高，但履约质量差的商户”)
  const merchantComparisons = [
    {
      name: '易兑数字科技 (MID-M01)',
      brandScope: 'Apple US, Steam Global',
      quoteRank: '最高报价 (0.945x)',
      acceptRate: '98.5%',
      rejectRate: '1.5%',
      acceptTime: '8.4s',
      processTime: '18.2s',
      successRate: '99.6%',
      timeoutRate: '0.8%',
      fallbackRate: '1.2%',
      verdict: '报价高且履约极佳 (标杆商户)',
      verdictColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      name: '全球数码直通 (MID-M02)',
      brandScope: 'Apple UK, Target US',
      quoteRank: '中高报价 (0.940x)',
      acceptRate: '96.8%',
      rejectRate: '3.2%',
      acceptTime: '12.6s',
      processTime: '22.4s',
      successRate: '99.2%',
      timeoutRate: '1.5%',
      fallbackRate: '2.0%',
      verdict: '履约平稳',
      verdictColor: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      name: '极速卡业科技 (MID-M08)',
      brandScope: 'Steam Global, Sephora',
      quoteRank: '次高报价 (0.938x)',
      acceptRate: '95.2%',
      rejectRate: '4.8%',
      acceptTime: '16.8s',
      processTime: '28.5s',
      successRate: '98.8%',
      timeoutRate: '2.4%',
      fallbackRate: '3.5%',
      verdict: '良性运转',
      verdictColor: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      name: '万卡连线数码 (MID-M14)',
      brandScope: 'Vanilla US, Razer Gold',
      quoteRank: '虚高报价 (0.952x 抢单)',
      acceptRate: '87.5%',
      rejectRate: '12.5%',
      acceptTime: '48.2s',
      processTime: '85.4s',
      successRate: '94.2%',
      timeoutRate: '8.6%',
      fallbackRate: '11.8%',
      verdict: '⚠️ 虚高报价但履约质量差 (限流降权)',
      verdictColor: 'bg-rose-50 text-rose-700 border-rose-300'
    }
  ];

  return (
    <div className="space-y-4 text-xs text-slate-800 antialiased animate-in fade-in duration-200">
      {/* 顶部过滤条 */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-900 text-xs">履约范围过滤:</span>

          <select
            value={filterBrand}
            onChange={e => setFilterBrand(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
          >
            <option value="ALL">全部卡种品牌 (Brand ALL)</option>
            <option value="Apple">Apple Store</option>
            <option value="Steam">Steam Wallet</option>
            <option value="Target">Target 百货</option>
            <option value="Vanilla">Vanilla 香草卡</option>
          </select>

          <select
            value={filterCountry}
            onChange={e => setFilterCountry(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
          >
            <option value="ALL">全部国家地区 (Country ALL)</option>
            <option value="US">US (美国)</option>
            <option value="UK">UK (英国)</option>
            <option value="CA">CA (加拿大)</option>
          </select>
        </div>

        <button
          onClick={() => onNavigate && onNavigate('merchant-capacity')}
          className="px-3.5 py-1.5 bg-[#004ac6] hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <span className="material-symbols-outlined text-[15px]">tune</span>
          调整商户派单路由权重
        </button>
      </div>

      {/* 1. 8 大核心商户履约指标看板 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {coreMetrics.map((m, i) => (
          <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10.5px] text-slate-500 block truncate">{m.label}</span>
            <strong className="text-sm font-bold font-mono text-slate-900 block">{m.val}</strong>
            <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
              <span>{m.mom}</span>
              <span>{m.ref}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 2. 商户核心履约链路图 (收到 ➔ 接单 ➔ 开始处理 ➔ 处理完成) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              商户履约全链路时效流转（收到卡单 ➔ 接单 ➔ 开始处理 ➔ 处理完成）
            </h4>
            <p className="text-slate-500 text-xs mt-0.5">
              端到端平均履约耗时 <strong className="text-emerald-700 font-bold">38.4 秒</strong>，处于行业领先极速履约水平。
            </p>
          </div>
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg font-mono font-bold text-xs border border-emerald-200">
            全链路中位耗时: 38.4s
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {fulfillmentChain.map((step, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 relative">
              <div className="flex items-center justify-between text-xs">
                <strong className="text-slate-900">{step.stage}</strong>
                <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-mono text-[10px] font-bold">
                  {step.statusText}
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200/60 font-mono space-y-1">
                <div className="font-bold text-slate-900 text-xs">{step.metricName}</div>
                <div className="text-[11px] text-emerald-700 font-bold">{step.latency}</div>
              </div>

              <p className="text-[10.5px] text-slate-500 font-sans leading-relaxed">
                • {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 商户履约质量对比与虚高报价识别 (PRD 17.4.3 核心识别机制) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              各做卡商户实际履约质量对比（精准识别“报价最高但履约极差”的劣质商户）
            </h4>
            <p className="text-slate-500 text-xs mt-0.5">
              不仅看商户报价折扣，更深度考核接单耗时、拒单率、超时率与转单率，对履约差的商户执行自动限流降权。
            </p>
          </div>
          <span className="text-rose-600 font-mono font-bold text-xs">
            发现 1 家需限流降权商户
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold font-mono">
                <th className="py-2.5 px-3">做卡商户 / 承接品类</th>
                <th className="py-2.5 px-3">报价竞争力</th>
                <th className="py-2.5 px-3">接单率 / 拒单率</th>
                <th className="py-2.5 px-3">接单耗时</th>
                <th className="py-2.5 px-3">处理核销耗时</th>
                <th className="py-2.5 px-3">完成率</th>
                <th className="py-2.5 px-3">超时率</th>
                <th className="py-2.5 px-3">转单率</th>
                <th className="py-2.5 px-3 text-right">履约质量裁决</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
              {merchantComparisons.map((m, idx) => (
                <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-2.5 px-3 font-sans">
                    <strong className="text-slate-900 block">{m.name}</strong>
                    <span className="text-[10px] text-slate-400 font-mono">{m.brandScope}</span>
                  </td>

                  <td className="py-2.5 px-3 font-bold text-blue-700">{m.quoteRank}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-emerald-700 font-bold">{m.acceptRate}</span>
                    <span className="text-slate-400 text-[10px] ml-1">/ {m.rejectRate}</span>
                  </td>
                  <td className="py-2.5 px-3">{m.acceptTime}</td>
                  <td className="py-2.5 px-3">{m.processTime}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-700">{m.successRate}</td>
                  <td className="py-2.5 px-3 text-slate-700">{m.timeoutRate}</td>
                  <td className="py-2.5 px-3 text-slate-700">{m.fallbackRate}</td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${m.verdictColor}`}>
                      {m.verdict}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
