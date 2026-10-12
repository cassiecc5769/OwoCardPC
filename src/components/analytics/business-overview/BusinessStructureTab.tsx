import React, { useState } from 'react';
import { NavPath } from '../../../types';

interface BusinessStructureTabProps {
  onNavigate?: (path: NavPath) => void;
}

export type StructureDimension = 'country' | 'brand' | 'sku' | 'user_type' | 'channel' | 'merchant';

export const BusinessStructureTab: React.FC<BusinessStructureTabProps> = ({
  onNavigate
}) => {
  const [activeDimension, setActiveDimension] = useState<StructureDimension>('brand');

  // 6 大核心结构维度数据 (PRD 17.2.4)
  const structureDatasets = {
    country: {
      title: '国家与地区结构 (Country Composition)',
      summary: 'US (美国) 贡献大盘 64.2% 的核心流水，UK 与 CA 增长显著 (+28.4%)。',
      items: [
        { label: 'US (美国)', gmv: '$917,000', ratio: 64.2, mom: '+8.4%', trend: '稳定主力' },
        { label: 'UK (英国)', gmv: '$257,000', ratio: 18.0, mom: '+24.5%', trend: '高速增长' },
        { label: 'CA (加拿大)', gmv: '$143,000', ratio: 10.0, mom: '+15.2%', trend: '稳步上升' },
        { label: 'Global / 其他', gmv: '$111,500', ratio: 7.8, mom: '-2.1%', trend: '轻度收缩' }
      ]
    },
    brand: {
      title: '卡品牌结构 (Brand Composition)',
      summary: 'Apple 占比 48.5% 保持第一大支柱地位；Steam 因通道抖动本周微跌 -6.2%。',
      items: [
        { label: 'Apple Store & iTunes', gmv: '$692,800', ratio: 48.5, mom: '+14.2%', trend: '大盘支柱 (稳定)' },
        { label: 'Steam Wallet (全球通用)', gmv: '$342,800', ratio: 24.0, mom: '-6.2%', trend: '关注 (通道承压)' },
        { label: 'Target (百货礼品卡)', gmv: '$199,900', ratio: 14.0, mom: '+18.5%', trend: '品类扩张' },
        { label: 'Sephora (美妆礼品卡)', gmv: '$114,200', ratio: 8.0, mom: '+9.4%', trend: '高毛利' },
        { label: 'Vanilla (香草预付卡)', gmv: '$78,800', ratio: 5.5, mom: '+32.0%', trend: '新拓展' }
      ]
    },
    sku: {
      title: 'SKU 面额区间结构 (Denomination Composition)',
      summary: '$100 面额是主力走货 SKU (42.0%)，$500 大额卡占比稳步提升至 12.0%。',
      items: [
        { label: '$100 标准面额', gmv: '$600,000', ratio: 42.0, mom: '+10.2%', trend: '主流单品' },
        { label: '$50 中等面额', gmv: '$400,000', ratio: 28.0, mom: '+8.5%', trend: '走量单品' },
        { label: '$200~$300 面额', gmv: '$257,000', ratio: 18.0, mom: '+15.4%', trend: '大宗出卡' },
        { label: '$500+ 超大面额', gmv: '$171,500', ratio: 12.0, mom: '+22.8%', trend: '高客单' }
      ]
    },
    user_type: {
      title: '新老用户结构 (Customer Type Composition)',
      summary: '老客复购贡献 71.6% GMV (留存黏性极强)，新客首单转化贡献 28.4%。',
      items: [
        { label: '老客复购 (30天内多次交易)', gmv: '$1,022,800', ratio: 71.6, mom: '+11.5%', trend: '复购主力' },
        { label: '新客首单 (首次完成撮合)', gmv: '$405,700', ratio: 28.4, mom: '+15.8%', trend: '拉新驱动' }
      ]
    },
    channel: {
      title: '渠道流量来源结构 (Traffic Source Composition)',
      summary: '推广人裂变渠道贡献 38.2% 流水，社媒精准投放带来高转化新客。',
      items: [
        { label: '推广人裂变 (Referral Affiliate)', gmv: '$545,700', ratio: 38.2, mom: '+18.4%', trend: '低成本裂变' },
        { label: '精准社媒投放 (Paid Ads)', gmv: '$457,100', ratio: 32.0, mom: '+12.1%', trend: '核心买量' },
        { label: '自然私域社群 (Direct/Community)', gmv: '$314,300', ratio: 22.0, mom: '+5.6%', trend: '高黏性' },
        { label: '开放平台 API 直连 (B2B Partners)', gmv: '$111,400', ratio: 7.8, mom: '+28.0%', trend: '高速爆发' }
      ]
    },
    merchant: {
      title: '商户承接结构 (Merchant Fulfillment Composition)',
      summary: 'Top 3 头部做卡商户承接 54.0% 订单，长尾商户健康分散，无单一垄断风险。',
      items: [
        { label: 'Tier-S 核心大商 (Top 3 头部商户)', gmv: '$771,400', ratio: 54.0, mom: '+9.2%', trend: '履约核心' },
        { label: 'Tier-A 中坚做卡商户 (25家)', gmv: '$485,700', ratio: 34.0, mom: '+16.5%', trend: '承揽主力' },
        { label: '普通认证做卡商户 (60家)', gmv: '$171,400', ratio: 12.0, mom: '+14.0%', trend: '长尾补充' }
      ]
    }
  };

  const currentDataset = structureDatasets[activeDimension];

  return (
    <div className="space-y-4 text-xs text-slate-800 antialiased animate-in fade-in duration-200">
      {/* 结构分析高价值洞察案例横幅 (PRD 17.2.4 典型案例) */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[18px]">insights</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-blue-950 text-xs">
              高价值结构洞察案例（回答“生意到底是由什么构成的”）
            </h4>
            <span className="px-2 py-0.2 rounded bg-blue-100 text-blue-800 font-mono text-[10px] font-bold">
              归因诊断引擎
            </span>
          </div>
          <p className="text-blue-900 text-[11px] leading-relaxed">
            例如某周 GMV 发生波动：结构分析可精准发现<strong>「Apple US 基本保持稳定；Steam US 下降 35%，且主要由新用户首单下降引起」</strong>，从而帮助管理层直接定位是做卡通道问题还是拉新渠道策略问题。
          </p>
        </div>
      </div>

      {/* 6 大维度切换 Tab 胶囊 */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto text-xs">
        {[
          { id: 'brand', label: '1. 卡品牌结构', icon: 'credit_card' },
          { id: 'country', label: '2. 国家地区结构', icon: 'public' },
          { id: 'sku', label: '3. SKU面额结构', icon: 'payments' },
          { id: 'user_type', label: '4. 新老用户结构', icon: 'group' },
          { id: 'channel', label: '5. 渠道来源结构', icon: 'alt_route' },
          { id: 'merchant', label: '6. 商户承接结构', icon: 'store' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveDimension(tab.id as StructureDimension)}
            className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeDimension === tab.id
                ? 'bg-[#004ac6] text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 结构分布与详细占比列表 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">{currentDataset.title}</h4>
            <p className="text-slate-500 text-xs mt-0.5">{currentDataset.summary}</p>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">基准总流水: $1,428,500 USD (100.0%)</span>
        </div>

        {/* 结构占比条形可视化 */}
        <div className="space-y-3.5">
          {currentDataset.items.map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px]">
                    {idx + 1}
                  </span>
                  <strong className="text-slate-900 font-sans text-xs">{item.label}</strong>
                  <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-sans text-[10px]">
                    {item.trend}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-900">{item.gmv}</span>
                  <span className="font-bold text-blue-700 text-sm">{item.ratio}%</span>
                  <span className={`text-[11px] font-bold ${item.mom.startsWith('+') ? 'text-emerald-700' : 'text-rose-600'}`}>
                    环比: {item.mom}
                  </span>
                </div>
              </div>

              {/* 占比条 */}
              <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.ratio}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
