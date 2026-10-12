import React, { useState } from 'react';
import { NavPath } from '../../../types';

interface TradeOperationsTabProps {
  onNavigate?: (path: NavPath) => void;
}

export const TradeOperationsTab: React.FC<TradeOperationsTabProps> = ({ onNavigate }) => {
  // 筛选器
  const [filterBrand, setFilterBrand] = useState('ALL');
  const [filterCountry, setFilterCountry] = useState('ALL');
  const [filterDenomination, setFilterDenomination] = useState('ALL');
  const [filterMerchant, setFilterMerchant] = useState('ALL');
  const [selectedFunnelStep, setSelectedFunnelStep] = useState<number | null>(null);

  // 完整交易漏斗数据 (PRD 17.3.2 标准 7 步链路)
  const funnelSteps = [
    {
      step: 1,
      name: '1. 用户提交订单',
      count: 10000,
      convRate: '-',
      dropCount: 0,
      dropRate: '0.0%',
      desc: '用户在前端或通过 API 成功提交的出卡提单总量',
      lossReason: '初始进入漏斗'
    },
    {
      step: 2,
      name: '2. 预检通过 (Card Check)',
      count: 9500,
      convRate: '95.0%',
      dropCount: 500,
      dropRate: '5.0%',
      desc: '通过风控排重、格式规则与 Card Check 官方初筛验真',
      lossReason: '零余额空卡拦截 320 单、重复卡 120 单、黑名单 60 单'
    },
    {
      step: 3,
      name: '3. 成功分配商户',
      count: 9300,
      convRate: '97.9%',
      dropCount: 200,
      dropRate: '2.1%',
      desc: '撮合引擎成功为卡单匹配到有可用额度且报价最优的做卡商户',
      lossReason: '部分冷门 SKU 无商户在线承接 (断供) 或额度熔断'
    },
    {
      step: 4,
      name: '4. 商户确认接单',
      count: 8900,
      convRate: '95.7%',
      dropCount: 400,
      dropRate: '4.3%',
      desc: '商户在规定 SLA (≤60s) 内完成接单并锁定卡密',
      lossReason: '商户响应超时 240 单、商户主动拒单 160 单'
    },
    {
      step: 5,
      name: '5. 商户处理成功',
      count: 8400,
      convRate: '94.4%',
      dropCount: 500,
      dropRate: '5.6%',
      desc: '商户完成充值核销并回传官方兑换外部单号',
      lossReason: '商户二次查验发现已被核销 280 单、面额不符用户取消 220 单'
    },
    {
      step: 6,
      name: '6. 交易撮合成功',
      count: 8370,
      convRate: '99.6%',
      dropCount: 30,
      dropRate: '0.4%',
      desc: '交易状态确认为 SUCCESS，出卡人账户获得待结算积分',
      lossReason: '交易最终确认超时或异常流转'
    },
    {
      step: 7,
      name: '7. 完成结算放款',
      count: 8350,
      convRate: '99.8%',
      dropCount: 20,
      dropRate: '0.2%',
      desc: '财务清算完成，积分到账出卡人钱包，商户货款扣减闭环',
      lossReason: '偶发售后争议拦截或反洗钱风控挂起'
    }
  ];

  // 最终未成交下钻归因 (5 大主因)
  const failureRootCauses = [
    {
      rank: 1,
      reason: '预检零余额/已消费核销 (出卡欺诈)',
      lostOrders: 320,
      lostGmv: '$36,400',
      ratio: '19.4%',
      affectedBrands: 'Steam (58%), Apple (24%)',
      actionText: '进入风控黑名单与策略调优',
      targetPath: 'risk-overview' as NavPath
    },
    {
      rank: 2,
      reason: '商户端接单超时未响应 (供给响应慢)',
      lostOrders: 240,
      lostGmv: '$27,800',
      ratio: '14.5%',
      affectedBrands: 'Target (45%), Sephora (35%)',
      actionText: '前往商户运营调整转单路由与降级',
      targetPath: 'merchant-ops-overview' as NavPath
    },
    {
      rank: 3,
      reason: '申报面额与实际查验倒挂 (用户取消)',
      lostOrders: 220,
      lostGmv: '$24,500',
      ratio: '13.3%',
      affectedBrands: 'Target US, Vanilla US',
      actionText: '前往报价运营调整二次议价机制',
      targetPath: 'rule-quote' as NavPath
    },
    {
      rank: 4,
      reason: '冷门小众 SKU 无商户在线承接 (供给断供)',
      lostOrders: 200,
      lostGmv: '$18,200',
      ratio: '12.1%',
      affectedBrands: 'Google Play UK, Razer Gold DE',
      actionText: '前往商户管理招募与配置兜底商户',
      targetPath: 'merchant-capacity' as NavPath
    },
    {
      rank: 5,
      reason: '重复卡码 24h 撞库提交 (重复提单)',
      lostOrders: 120,
      lostGmv: '$14,000',
      ratio: '7.3%',
      affectedBrands: 'Apple US',
      actionText: '前往风控监控查看撞库拦截证据',
      targetPath: 'risk-monitor' as NavPath
    }
  ];

  return (
    <div className="space-y-4 text-xs text-slate-800 antialiased animate-in fade-in duration-200">
      {/* 顶部多维下钻过滤条 (国家 → Brand → SKU → 商户) */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-900 text-xs">下钻维度:</span>

          {/* 国家 */}
          <select
            value={filterCountry}
            onChange={e => setFilterCountry(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
          >
            <option value="ALL">全部国家/地区 (Country)</option>
            <option value="US">US (美国)</option>
            <option value="UK">UK (英国)</option>
            <option value="CA">CA (加拿大)</option>
            <option value="Global">Global (全球)</option>
          </select>

          {/* 品牌 */}
          <select
            value={filterBrand}
            onChange={e => setFilterBrand(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
          >
            <option value="ALL">全部卡种品牌 (Brand)</option>
            <option value="Apple">Apple Store</option>
            <option value="Steam">Steam Wallet</option>
            <option value="Target">Target 百货</option>
            <option value="Sephora">Sephora 美妆</option>
          </select>

          {/* SKU面额 */}
          <select
            value={filterDenomination}
            onChange={e => setFilterDenomination(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 font-mono"
          >
            <option value="ALL">全部 SKU 面额档位</option>
            <option value="100">$100 (主力走货)</option>
            <option value="50">$50 (小额档位)</option>
            <option value="200">$200~$500 (大额大宗)</option>
          </select>

          {/* 商户 */}
          <select
            value={filterMerchant}
            onChange={e => setFilterMerchant(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
          >
            <option value="ALL">全部承接商户 (Merchant)</option>
            <option value="MID-M01">MID-M01 (易兑数字科技)</option>
            <option value="MID-M02">MID-M02 (全球数码直通)</option>
            <option value="MID-M08">MID-M08 (极速卡业科技)</option>
          </select>
        </div>

        <button
          onClick={() => onNavigate && onNavigate('order-management')}
          className="px-3.5 py-1.5 bg-[#004ac6] hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <span className="material-symbols-outlined text-[15px]">list_alt</span>
          进入交易订单明细
        </button>
      </div>

      {/* 1. 完整交易漏斗分析 (PRD 17.3.2 数量 / 转化率 / 流失量 / 流失率) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              完整交易链路漏斗分析（提交 ➔ 预检 ➔ 分配 ➔ 接单 ➔ 处理 ➔ 成功 ➔ 结算）
            </h4>
            <p className="text-slate-500 text-xs mt-0.5">
              总进单 10,000 笔 ➔ 最终完成结算 8,350 笔，<strong className="text-blue-700">全链路端到端总转化率 83.5%</strong>，流失 1,650 笔。
            </p>
          </div>
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg font-mono font-bold text-xs border border-emerald-200">
            健康度: 83.5% (优于大盘基准 80%)
          </span>
        </div>

        {/* 漏斗各层卡片 */}
        <div className="space-y-2.5">
          {funnelSteps.map((step, idx) => {
            const widthPct = Math.round((step.count / 10000) * 100);
            const isLast = idx === funnelSteps.length - 1;
            return (
              <div
                key={step.step}
                onClick={() => setSelectedFunnelStep(step.step)}
                className="p-3 bg-slate-50 hover:bg-blue-50/40 rounded-xl border border-slate-200/80 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold font-mono text-[11px] flex items-center justify-center">
                      {step.step}
                    </span>
                    <strong className="text-slate-900">{step.name}</strong>
                    <span className="text-[11px] text-slate-500 font-normal">({step.desc})</span>
                  </div>

                  <div className="flex items-center gap-4 font-mono">
                    <span className="text-slate-900 font-bold text-sm">
                      {step.count.toLocaleString()} 单
                    </span>
                    <span className="text-blue-700 font-bold">
                      环节转化: {step.convRate}
                    </span>
                    {step.dropCount > 0 ? (
                      <span className="text-rose-600 font-bold text-[11px] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        流失: -{step.dropCount} 单 ({step.dropRate})
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">基准起点</span>
                    )}
                  </div>
                </div>

                {/* 漏斗横条 */}
                <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isLast ? 'bg-emerald-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${widthPct}%` }}
                  ></div>
                </div>

                {step.dropCount > 0 && (
                  <p className="text-[10.5px] text-slate-500">
                    • <strong>主要流失原因:</strong> {step.lossReason}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. 最终未成交下钻归因排行 (回答：交易为什么没有成交？) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              交易流失归因排行（回答：交易为什么没有成交？）
            </h4>
            <p className="text-slate-500 text-xs mt-0.5">
              按照国家 → Brand → SKU → 商户 → 失败原因精准定位，并支持一键下钻进入对应业务模块排查。
            </p>
          </div>
          <span className="text-slate-400 font-mono text-[11px]">累计流失金额: $120,900 USD</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold">
                <th className="py-2.5 px-3">排名 / 失败核心原因</th>
                <th className="py-2.5 px-3">流失单量</th>
                <th className="py-2.5 px-3">损失交易额 (GMV)</th>
                <th className="py-2.5 px-3">占总流失比重</th>
                <th className="py-2.5 px-3">主要波及品牌与地区</th>
                <th className="py-2.5 px-3 text-right">业务闭环下钻</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {failureRootCauses.map(c => (
                <tr key={c.rank} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-2.5 px-3 font-sans">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-bold font-mono text-[10px] flex items-center justify-center">
                        {c.rank}
                      </span>
                      <strong className="text-slate-900">{c.reason}</strong>
                    </div>
                  </td>

                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {c.lostOrders} 单
                  </td>

                  <td className="py-2.5 px-3 font-bold text-rose-600">
                    {c.lostGmv}
                  </td>

                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                      {c.ratio}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 font-sans text-slate-600">
                    {c.affectedBrands}
                  </td>

                  <td className="py-2.5 px-3 text-right font-sans">
                    <button
                      onClick={() => onNavigate && onNavigate(c.targetPath)}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 rounded cursor-pointer transition-colors"
                    >
                      {c.actionText} →
                    </button>
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
