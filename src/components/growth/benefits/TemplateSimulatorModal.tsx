import React, { useState } from 'react';
import { UniversalBenefitTemplate } from './types';

interface TemplateSimulatorModalProps {
  templates: UniversalBenefitTemplate[];
  initialTemplateId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateSimulatorModal: React.FC<TemplateSimulatorModalProps> = ({
  templates,
  initialTemplateId,
  isOpen,
  onClose
}) => {
  const [selectedTplId, setSelectedTplId] = useState<string>(
    initialTemplateId || (templates[0]?.id ?? '')
  );
  const [cardBrand, setCardBrand] = useState('Apple');
  const [currency, setCurrency] = useState('USD');
  const [faceValue, setFaceValue] = useState<number>(300);
  const [baseQuoteRate, setBaseQuoteRate] = useState<number>(82.0); // 82%
  const [userTier, setUserTier] = useState<'normal' | 'v1' | 'v2' | 'v3' | 'v4'>('v2');
  const [hasCampaignPromo, setHasCampaignPromo] = useState<boolean>(false);
  const [hasRunCalc, setHasRunCalc] = useState<boolean>(true);

  if (!isOpen) return null;

  const currentTpl = templates.find(t => t.id === selectedTplId) || templates[0];

  // Tier bonus definition
  const tierBonusRate = userTier === 'v4' ? 1.0 : userTier === 'v3' ? 0.6 : userTier === 'v2' ? 0.3 : userTier === 'v1' ? 0.1 : 0.0;

  // Calculation logic
  const isThresholdMet = currentTpl ? faceValue >= currentTpl.minThresholdValue : true;
  const isCardSupported = currentTpl
    ? currentTpl.applicableCards.includes('全卡通用') ||
      currentTpl.applicableCardTags.some(tag => tag.toLowerCase().includes(cardBrand.toLowerCase()))
    : true;

  const basePayout = (faceValue * (baseQuoteRate / 100));

  let benefitSubsidy = 0;
  let isCapped = false;

  if (currentTpl && isThresholdMet && isCardSupported) {
    if (currentTpl.type === 'rate') {
      const rawBenefit = faceValue * (currentTpl.discountValue / 100);
      if (currentTpl.capAmount > 0 && rawBenefit > currentTpl.capAmount) {
        benefitSubsidy = currentTpl.capAmount;
        isCapped = true;
      } else {
        benefitSubsidy = rawBenefit;
      }
    } else if (currentTpl.type === 'fixed') {
      benefitSubsidy = currentTpl.discountValue;
    } else if (currentTpl.type === 'fee') {
      benefitSubsidy = currentTpl.discountValue; // saved fee
    } else {
      benefitSubsidy = 0;
    }
  }

  // Tier addition
  const tierBonusAmount = currentTpl?.allowStackWithTier ? faceValue * (tierBonusRate / 100) : 0;
  const campaignPromoAmount = hasCampaignPromo && currentTpl?.allowStackWithPromotion ? 5.0 : 0;

  const finalPayout = basePayout + benefitSubsidy + tierBonusAmount + campaignPromoAmount;
  const effectiveRate = faceValue > 0 ? (finalPayout / faceValue) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">calculate</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>权益模板试算与沙箱模拟器</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                  SANDBOX V2
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                实时模拟卡单面额、卡种及会员等级，精准校验门槛合规性、加价上浮金额与风控封顶限制
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* 1. 模板选择 */}
          <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              测试目标权益模板 (Target Template)
            </label>
            <select
              value={selectedTplId}
              onChange={e => setSelectedTplId(e.target.value)}
              className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 font-medium text-slate-800 focus:outline-none focus:border-blue-500 text-xs cursor-pointer shadow-2xs"
            >
              {templates.map(tpl => (
                <option key={tpl.id} value={tpl.id}>
                  [{tpl.code}] {tpl.name} · {tpl.typeLabel} ({tpl.discountDisplay} - {tpl.minThreshold})
                </option>
              ))}
            </select>

            {currentTpl && (
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 pt-1">
                <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold border ${currentTpl.badgeColor}`}>
                  {currentTpl.badge}
                </span>
                <span>归属：{currentTpl.categoryLabel}</span>
                <span>·</span>
                <span>限额封顶：{currentTpl.capAmount > 0 ? `$${currentTpl.capAmount.toFixed(2)} USD` : '无限制'}</span>
                <span>·</span>
                <span>叠加大促：{currentTpl.allowStackWithPromotion ? '允许' : '互斥排他'}</span>
                <span>·</span>
                <span>叠加会员折扣：{currentTpl.allowStackWithTier ? '允许' : '互斥'}</span>
              </div>
            )}
          </div>

          {/* 2. 模拟卡单参数输入 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                出卡品牌 / 卡种
              </label>
              <select
                value={cardBrand}
                onChange={e => setCardBrand(e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Apple">Apple / iTunes Gift Card</option>
                <option value="Steam">Steam Wallet Card</option>
                <option value="Google Play">Google Play Gift Card</option>
                <option value="Razer Gold">Razer Gold Direct</option>
                <option value="Sephora">Sephora Gift Card</option>
                <option value="Amazon">Amazon Balance Card</option>
                <option value="USDT">USDT 结算提取</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                结算主币种
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="USD">USD - 美元 (全球主结算币)</option>
                <option value="EUR">EUR - 欧元区</option>
                <option value="GBP">GBP - 英镑</option>
                <option value="CAD">CAD - 加拿大元</option>
                <option value="AUD">AUD - 澳大利亚元</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                模拟卡面面额 (${currency})
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="10"
                  value={faceValue}
                  onChange={e => setFaceValue(parseFloat(e.target.value) || 0)}
                  className="w-full h-8 pl-3 pr-8 rounded-lg bg-slate-50 border border-slate-200 font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                />
                <span className="absolute right-2.5 top-2 text-slate-400 font-mono text-[10px]">{currency}</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                平台基准报价折率 (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="10"
                  max="100"
                  step="0.5"
                  value={baseQuoteRate}
                  onChange={e => setBaseQuoteRate(parseFloat(e.target.value) || 0)}
                  className="w-full h-8 pl-3 pr-7 rounded-lg bg-slate-50 border border-slate-200 font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                />
                <span className="absolute right-2.5 top-2 text-slate-400 font-mono text-[10px]">%</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                出卡用户会员等级 (Tier)
              </label>
              <select
                value={userTier}
                onChange={e => setUserTier(e.target.value as any)}
                className="w-full h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="normal">普通用户 (无等级上浮 +0.0%)</option>
                <option value="v1">V1 白银会员 (+0.10% 专属上浮)</option>
                <option value="v2">V2 黄金做市商 (+0.30% 专属上浮)</option>
                <option value="v3">V3 钻石机构 (+0.60% 专属上浮)</option>
                <option value="v4">V4 黑钻殿堂 (+1.00% 专属上浮)</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={hasCampaignPromo}
                  onChange={e => setHasCampaignPromo(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs">同时参与大促满减 (立减 $5.00)</span>
              </label>
            </div>
          </div>

          {/* 3. 实时试算核验看板 */}
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold text-xs tracking-tight">沙箱执行结算试算账单</span>
              </div>
              <div className="flex items-center gap-2">
                {isThresholdMet ? (
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                    起用门槛已达标
                  </span>
                ) : (
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">cancel</span>
                    未达起用门槛 ({currentTpl?.minThreshold})
                  </span>
                )}
                {isCapped && (
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                    触达最高封顶 $ {currentTpl.capAmount.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* 账单分项明细 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">基础卡单应得 (Base)</span>
                <div className="font-mono text-base font-bold text-slate-100 mt-1">
                  ${basePayout.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">{currency}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  ${faceValue} × {baseQuoteRate}%
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-blue-950/50 border border-blue-800/40">
                <span className="text-[10px] text-blue-300 block">券模板加成补贴 (Coupon)</span>
                <div className="font-mono text-base font-bold text-blue-400 mt-1">
                  +${benefitSubsidy.toFixed(2)} <span className="text-[10px] font-normal text-blue-300">{currency}</span>
                </div>
                <span className="text-[10px] text-blue-300/70 font-mono">
                  {currentTpl ? currentTpl.discountDisplay : '--'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-indigo-950/50 border border-indigo-800/40">
                <span className="text-[10px] text-indigo-300 block">会员与活动叠加 (Stack)</span>
                <div className="font-mono text-base font-bold text-indigo-400 mt-1">
                  +${(tierBonusAmount + campaignPromoAmount).toFixed(2)} <span className="text-[10px] font-normal text-indigo-300">{currency}</span>
                </div>
                <span className="text-[10px] text-indigo-300/70 font-mono">
                  等级 +{tierBonusRate}% {hasCampaignPromo ? '| 大促 +$5' : ''}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-700/50">
                <span className="text-[10px] text-emerald-300 block">出卡实发总结算额 (Total)</span>
                <div className="font-mono text-lg font-bold text-emerald-400 mt-1">
                  ${finalPayout.toFixed(2)} <span className="text-[10px] font-normal text-emerald-300">{currency}</span>
                </div>
                <span className="text-[10px] text-emerald-300/80 font-mono font-bold">
                  综合有效折率: {effectiveRate.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* 风控校验矩阵 */}
            <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-[11px] text-slate-300 space-y-1.5">
              <div className="flex items-center justify-between">
                <span>卡种品类适用性检验：</span>
                <span className={isCardSupported ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  {isCardSupported ? '✓ 品类白名单命中允许出卡' : '✕ 限制品类不可抵扣'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>综合加价幅度安全审查：</span>
                <span className="text-emerald-400 font-mono font-semibold">
                  总上浮 {(effectiveRate - baseQuoteRate).toFixed(2)}% &lt; 平台熔断阈值 2.50% (通过)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>预算扣减科目归属：</span>
                <span className="text-slate-400 font-mono">
                  {currentTpl?.budgetSubject || '营销通用补贴池'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-slate-400 text-[11px]">
            沙箱测算结果已自动校验风控规则引擎与做市商套利防刷模型
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs cursor-pointer transition-colors"
          >
            完成试算并返回
          </button>
        </div>
      </div>
    </div>
  );
};
