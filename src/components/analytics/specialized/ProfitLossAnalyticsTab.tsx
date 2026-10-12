import React, { useState } from 'react';
import { NavPath } from '../../../types';

interface ProfitLossAnalyticsTabProps {
  onNavigate?: (path: NavPath) => void;
}

export const ProfitLossAnalyticsTab: React.FC<ProfitLossAnalyticsTabProps> = ({ onNavigate }) => {
  const [filterDimension, setFilterDimension] = useState<'brand' | 'sku' | 'merchant' | 'country'>('sku');

  // 1. 损益拆解树 (PRD 17.3.5 核心拆解逻辑)
  const pnlWaterfall = [
    { name: '1. 用户交易金额 (GMV)', val: '$1,428,500.00', ratio: '100.0%', type: 'base', desc: '平台撮合成功的出卡总面额/流水' },
    { name: '2. 减：商户收卡结算成本', val: '-$1,342,790.00', ratio: '-94.00%', type: 'cost', desc: '支付给接单商户的采购结算款项' },
    { name: '3. = 基础交易毛利 (Gross Margin)', val: '$85,710.00', ratio: '6.00%', type: 'subtotal', desc: '平台基础买卖点位差额' },
    { name: '4. 减：售后争议赔付金额', val: '-$1,280.00', ratio: '-0.09%', type: 'loss', desc: '平台针对争议判责后的先行赔付支出' },
    { name: '5. 减：转单价差贴补 (Fallback)', val: '-$2,450.00', ratio: '-0.17%', type: 'loss', desc: '原商户超时后切换高报价备用商户的平台贴水' },
    { name: '6. 减：平台承担死卡/欺诈损失', val: '-$1,860.00', ratio: '-0.13%', type: 'loss', desc: '极端风控漏检导致的坏账与通道坏死扣款' },
    { name: '7. 减：通道手续费与技术成本', val: '-$21,700.00', ratio: '-1.52%', type: 'loss', desc: '支付提现通道费、短信及 Card Check 查卡 API 费用' },
    { name: '8. = 最终实际经营净收益 (Net Profit)', val: '$58,420.00', ratio: '4.09%', type: 'final', desc: '平台实际最终留存的经营净利润' }
  ];

  // 2. 亏损 / 微利 SKU 预警榜 (PRD 17.3.5 核心洞察: GMV 高但考虑赔付后实际亏损)
  const lossMakingSkus = [
    {
      sku: 'Steam US $500 大额卡',
      brand: 'Steam',
      country: 'US',
      gmv: '$145,000',
      grossProfit: '+$4,350 (3.0%)',
      disputeLoss: '-$5,200',
      fallbackCost: '-$850',
      netProfit: '-$1,700',
      netMargin: '-1.17%',
      status: '实际亏损 (负毛利)',
      warning: '大额空卡欺诈争议高，商户核销超时导致多笔转单贴水，扣除赔付后亏损 $1,700！',
      action: '前往规则配置下调 Steam $500 溢价并提高风控阈值',
      targetPath: 'rule-quote' as NavPath
    },
    {
      sku: 'Google Play UK £100 卡',
      brand: 'Google Play',
      country: 'UK',
      gmv: '$68,000',
      grossProfit: '+$2,040 (3.0%)',
      disputeLoss: '-$1,400',
      fallbackCost: '-$780',
      netProfit: '-$140',
      netMargin: '-0.21%',
      status: '实际微亏',
      warning: 'UK 承接商户少，转单率高达 8.4%，转单补贴吞噬了全部利润。',
      action: '前往商户管理补充 UK 承接商户',
      targetPath: 'merchant-capacity' as NavPath
    },
    {
      sku: 'Apple US $100 标准卡',
      brand: 'Apple',
      country: 'US',
      gmv: '$600,000',
      grossProfit: '+$36,000 (6.0%)',
      disputeLoss: '-$420',
      fallbackCost: '-$350',
      netProfit: '+$31,200',
      netMargin: '+5.20%',
      status: '高盈利标杆',
      warning: '履约顺畅，争议率万分之三，贡献平台 53.4% 净利润。',
      action: '保持优势收卡价格',
      targetPath: 'rule-quote' as NavPath
    }
  ];

  return (
    <div className="space-y-4 text-xs text-slate-800 antialiased animate-in fade-in duration-200">
      {/* 顶部核心警告横幅 (PRD 17.3.5) */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-amber-950 text-xs">
              收益分析核心准则（GMV 高不代表业务健康！）
            </h4>
            <span className="px-2 py-0.2 rounded bg-amber-100 text-amber-800 font-mono text-[10px] font-bold">
              真实利润洞察
            </span>
          </div>
          <p className="text-amber-900 text-[11px] leading-relaxed">
            平台赚了多少钱、利润从哪里来、哪里正在亏钱？某个 SKU 交易量可能很大，但<strong>扣除售后赔付、转单价差贴补和死卡损失后实际发生亏损</strong>。必须穿透毛利看净收益！
          </p>
        </div>
      </div>

      {/* 1. 完整收益拆解瀑布看板 (PRD 17.3.5) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              平台全链路收益拆解瀑布（GMV ➔ 采购成本 ➔ 毛利 ➔ 损失扣减 ➔ 实际净收益）
            </h4>
            <p className="text-slate-500 text-xs mt-0.5">
              总流水 $1,428,500.00 ➔ 实际经营净收益 <strong className="text-emerald-700 font-bold">$58,420.00 USD (净利率 4.09%)</strong>。
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-lg font-mono font-bold text-xs border border-emerald-200">
            实际收益: $58,420.00
          </span>
        </div>

        <div className="space-y-2">
          {pnlWaterfall.map((node, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                node.type === 'final'
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-xs'
                  : node.type === 'subtotal'
                  ? 'bg-blue-50/70 border-blue-200 text-blue-950'
                  : node.type === 'loss'
                  ? 'bg-rose-50/40 border-rose-200/80 text-rose-950'
                  : 'bg-slate-50/80 border-slate-200/80 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-6 h-6 rounded-full font-mono text-[11px] font-bold flex items-center justify-center ${
                  node.type === 'final' ? 'bg-emerald-600 text-white' :
                  node.type === 'loss' ? 'bg-rose-100 text-rose-700' :
                  'bg-slate-200 text-slate-700'
                }`}>
                  {idx + 1}
                </span>
                <div>
                  <strong className="text-xs block">{node.name}</strong>
                  <span className="text-[10.5px] text-slate-500 font-sans">{node.desc}</span>
                </div>
              </div>

              <div className="text-right font-mono">
                <div className={`font-bold text-sm ${
                  node.type === 'final' ? 'text-emerald-700 text-base' :
                  node.type === 'loss' ? 'text-rose-600' :
                  node.type === 'cost' ? 'text-slate-700' :
                  'text-slate-900'
                }`}>
                  {node.val}
                </div>
                <span className="text-[10px] text-slate-400">占 GMV 比重: {node.ratio}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. 亏损 / 微利 SKU 穿透剖析榜 (回答：哪里正在亏钱？) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              重点品类/SKU 真实盈利穿透榜（穿透赔付与转单损失）
            </h4>
            <p className="text-slate-500 text-xs mt-0.5">
              识别表象毛利正常但被高赔付、高转单价差拖垮的负收益 SKU，支持直接下钻至规则配置调优。
            </p>
          </div>
          <span className="text-rose-600 font-mono font-bold text-xs">
            发现 2 款负收益/微利 SKU
          </span>
        </div>

        <div className="space-y-3">
          {lossMakingSkus.map((sku, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border space-y-2.5 transition-all ${
                sku.status.includes('亏损')
                  ? 'bg-rose-50/30 border-rose-300'
                  : sku.status.includes('微亏')
                  ? 'bg-amber-50/30 border-amber-300'
                  : 'bg-emerald-50/20 border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <strong className="text-slate-900 text-xs">{sku.sku}</strong>
                  <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-slate-100 text-slate-700">
                    {sku.brand} · {sku.country}
                  </span>
                  <span className={`px-2 py-0.2 rounded text-[10px] font-bold border ${
                    sku.status.includes('亏损') ? 'bg-rose-50 text-rose-700 border-rose-200/80' :
                    sku.status.includes('微亏') ? 'bg-amber-50 text-amber-700 border-amber-200/80' :
                    'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                  }`}>
                    {sku.status}
                  </span>
                </div>

                <button
                  onClick={() => onNavigate && onNavigate(sku.targetPath)}
                  className="text-blue-600 hover:underline font-semibold text-xs cursor-pointer flex items-center gap-0.5 font-sans"
                >
                  {sku.action} →
                </button>
              </div>

              {/* 指标矩阵 */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-white p-2.5 rounded-lg border border-slate-200/80 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 font-sans block text-[10px]">流水 (GMV)</span>
                  <span className="font-bold text-slate-900">{sku.gmv}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans block text-[10px]">表象毛利</span>
                  <span className="font-bold text-blue-700">{sku.grossProfit}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans block text-[10px]">争议赔付支出</span>
                  <span className="font-bold text-rose-600">{sku.disputeLoss}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans block text-[10px]">转单贴补成本</span>
                  <span className="font-bold text-rose-600">{sku.fallbackCost}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans block text-[10px]">最终实际净利</span>
                  <span className={`font-bold text-xs ${sku.netMargin.startsWith('-') ? 'text-rose-600 font-bold' : 'text-emerald-700'}`}>
                    {sku.netProfit} ({sku.netMargin})
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 font-sans leading-relaxed">
                • <strong>亏损归因诊断:</strong> {sku.warning}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
