import React, { useState } from 'react';
import { NavPath } from '../../../types';

interface MerchantOperationsTabProps {
  onNavigate?: (path: NavPath) => void;
}

export const MerchantOperationsTab: React.FC<MerchantOperationsTabProps> = ({ onNavigate }) => {
  const [filterTier, setFilterTier] = useState('ALL');

  // 商户 4 大分析维度 (PRD 17.3.4)
  const dimensions = [
    {
      id: 'supply',
      title: '1. 供给维度 (Supply & Capacity)',
      icon: 'inventory_2',
      color: 'blue',
      metrics: [
        { label: '活跃承揽商户数', val: '88 家', mom: '+3.5%', status: '正常' },
        { label: '可承接 SKU 覆盖数', val: '210 款', mom: '+12款', status: '充足' },
        { label: 'SKU 平均覆盖商户数', val: '4.2 家/SKU', mom: '+0.3', status: '充足' },
        { label: '无可用商户 SKU (断供预警)', val: '2 款', mom: '-1款', status: '关注', isAlert: true },
        { label: '单商户独家依赖 SKU (脆弱性)', val: '6 款', mom: '-2款', status: '可控', isAlert: true }
      ],
      insight: '主流 Apple/Steam/Target 均有 5 家以上主力做卡商户竞争兜底；需重点招募 Google Play DE 备用商户。'
    },
    {
      id: 'pricing',
      title: '2. 报价维度 (Pricing & Competitiveness)',
      icon: 'price_check',
      color: 'emerald',
      metrics: [
        { label: '有竞争力 SKU 占比', val: '94.2%', mom: '+1.5%', status: '优势' },
        { label: '大盘溢价指数 (对标竞品)', val: '+0.8%', mom: '+0.1%', status: '领先' },
        { label: '报价异常率 (倒挂/离群)', val: '0.6%', mom: '-0.2%', status: '良性' },
        { label: '调价平均响应时间', val: '8.4 分钟', mom: '-2.1m', status: '极快' }
      ],
      insight: '商户做卡报价自动化策略跟进迅速，外盘价格波动 10 分钟内完成全盘重新挂单。'
    },
    {
      id: 'fulfillment',
      title: '3. 履约维度 (Fulfillment & Speed)',
      icon: 'speed',
      color: 'amber',
      metrics: [
        { label: '商户接单率', val: '96.8%', mom: '+0.4%', status: '优秀' },
        { label: '主动拒单率', val: '3.2%', mom: '-0.4%', status: '良性' },
        { label: '核销处理成功率', val: '99.2%', mom: '+0.1%', status: '优秀' },
        { label: '处理超时率 (>60s)', val: '1.8%', mom: '-0.3%', status: '达标' },
        { label: '平均处理时长', val: '38.4 秒', mom: '-3.2s', status: '极速' }
      ],
      insight: '95% 以上订单在 45 秒内由商户完成直连核销充值，转单重试机制运转顺畅。'
    },
    {
      id: 'quality',
      title: '4. 质量维度 (Quality & Disputes)',
      icon: 'verified_user',
      color: 'purple',
      metrics: [
        { label: '售后工单率', val: '0.42%', mom: '-0.08%', status: '极低' },
        { label: '争议仲裁率', val: '0.15%', mom: '-0.02%', status: '良性' },
        { label: '商户责任败诉率', val: '0.04%', mom: '-0.01%', status: '受控' },
        { label: '转单重试率 (Fallback)', val: '2.4%', mom: '-0.5%', status: '正常' }
      ],
      insight: '商户端全流程 Card Check 存证完备，扫卡争议判定明确，商户责任败诉率低于万分之五。'
    }
  ];

  // 商户综合经营评价画像榜 (PRD 17.3.4: 综合评价而非简单按 GMV 排名)
  const merchantScorecards = [
    {
      merchantId: 'MID-M01',
      name: '易兑数字科技',
      tier: 'Tier-S 核心战略大商',
      tierColor: 'bg-purple-100 text-purple-800 border-purple-200',
      compositeScore: 98.4,
      supplyScore: 99.0,
      pricingScore: 98.2,
      fulfillmentScore: 99.5,
      qualityScore: 97.0,
      monthlyGmv: '$771,400',
      coreBrands: 'Apple US, Steam Global',
      status: '优先派单',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      merchantId: 'MID-M02',
      name: '全球数码直通',
      tier: 'Tier-S 核心做卡商',
      tierColor: 'bg-purple-100 text-purple-800 border-purple-200',
      compositeScore: 95.8,
      supplyScore: 96.0,
      pricingScore: 97.5,
      fulfillmentScore: 94.2,
      qualityScore: 95.5,
      monthlyGmv: '$485,700',
      coreBrands: 'Apple UK, Target US',
      status: '正常派单',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      merchantId: 'MID-M08',
      name: '极速卡业科技',
      tier: 'Tier-A 中坚主力商户',
      tierColor: 'bg-blue-100 text-blue-800 border-blue-200',
      compositeScore: 92.1,
      supplyScore: 90.5,
      pricingScore: 94.0,
      fulfillmentScore: 91.8,
      qualityScore: 92.0,
      monthlyGmv: '$312,000',
      coreBrands: 'Steam Global, Sephora US',
      status: '正常派单',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      merchantId: 'MID-M14',
      name: '万卡连线数码',
      tier: 'Tier-B 需关注改善商户',
      tierColor: 'bg-amber-100 text-amber-800 border-amber-200',
      compositeScore: 78.5,
      supplyScore: 82.0,
      pricingScore: 80.0,
      fulfillmentScore: 74.5,
      qualityScore: 77.5,
      monthlyGmv: '$98,000',
      coreBrands: 'Vanilla US, Razer Gold',
      status: '限流整改中',
      statusColor: 'bg-rose-50 text-rose-700 border-rose-200'
    }
  ];

  return (
    <div className="space-y-4 text-xs text-slate-800 antialiased animate-in fade-in duration-200">
      {/* 顶部操作 */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 text-xs">商户评级过滤:</span>
          <select
            value={filterTier}
            onChange={e => setFilterTier(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 font-medium"
          >
            <option value="ALL">全部商户层级 (Tier ALL)</option>
            <option value="S">Tier-S 核心战略商户</option>
            <option value="A">Tier-A 中坚做卡商户</option>
            <option value="B">Tier-B 观察整改商户</option>
          </select>
        </div>

        <button
          onClick={() => onNavigate && onNavigate('merchant-ops-overview')}
          className="px-3.5 py-1.5 bg-[#004ac6] hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <span className="material-symbols-outlined text-[15px]">storefront</span>
          进入商户运营工作台
        </button>
      </div>

      {/* 1. 商户四大分析维度 (供给、报价、履约、质量) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dimensions.map(dim => (
          <div key={dim.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">{dim.icon}</span>
                {dim.title}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">KPI Breakdown</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
              {dim.metrics.map((m, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg border ${
                    m.isAlert
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                      : 'bg-slate-50/80 border-slate-200/60 text-slate-800'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 font-sans block truncate">{m.label}</span>
                  <strong className="text-xs text-slate-900 font-bold block mt-0.5">{m.val}</strong>
                  <span className="text-[9px] text-slate-500 font-sans block">环比 {m.mom}</span>
                </div>
              ))}
            </div>

            <p className="text-[10.5px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 leading-relaxed font-sans">
              • <strong>经营洞察:</strong> {dim.insight}
            </p>
          </div>
        ))}
      </div>

      {/* 2. 商户综合经营评价画像榜 (PRD 17.3.4: 综合评价而非按 GMV 简单排序) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              商户综合经营评价与履约画像（供给 × 报价 × 履约 × 质量）
            </h4>
            <p className="text-slate-500 text-xs mt-0.5">
              依托多维经营指标进行动态评分与派单权重调节，确保平台订单派给履约最稳、价格最优的商户。
            </p>
          </div>
          <span className="text-slate-400 font-mono text-[11px]">共 88 家合作商户</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold font-mono">
                <th className="py-2.5 px-3">商户名称 / ID</th>
                <th className="py-2.5 px-3">商户层级 (Tier)</th>
                <th className="py-2.5 px-3">综合评分 (Composite)</th>
                <th className="py-2.5 px-3">供给能力</th>
                <th className="py-2.5 px-3">报价竞争力</th>
                <th className="py-2.5 px-3">履约时效</th>
                <th className="py-2.5 px-3">质量安全</th>
                <th className="py-2.5 px-3">月度流水 (GMV)</th>
                <th className="py-2.5 px-3">核心承接品类</th>
                <th className="py-2.5 px-3 text-right">派单调度状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
              {merchantScorecards.map((m, idx) => (
                <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-2.5 px-3 font-sans">
                    <strong className="text-slate-900 block">{m.name}</strong>
                    <span className="text-[10px] text-slate-400 font-mono">{m.merchantId}</span>
                  </td>

                  <td className="py-2.5 px-3 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${m.tierColor}`}>
                      {m.tier}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 font-bold text-blue-700 text-sm">
                    {m.compositeScore} 分
                  </td>

                  <td className="py-2.5 px-3 text-slate-700">{m.supplyScore}</td>
                  <td className="py-2.5 px-3 text-slate-700">{m.pricingScore}</td>
                  <td className="py-2.5 px-3 text-slate-700">{m.fulfillmentScore}</td>
                  <td className="py-2.5 px-3 text-slate-700">{m.qualityScore}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{m.monthlyGmv}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600">{m.coreBrands}</td>

                  <td className="py-2.5 px-3 text-right font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${m.statusColor}`}>
                      {m.status}
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
