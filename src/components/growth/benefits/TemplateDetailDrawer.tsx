import React from 'react';
import { UniversalBenefitTemplate } from './types';

interface TemplateDetailDrawerProps {
  template: UniversalBenefitTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStatus: (tpl: UniversalBenefitTemplate) => void;
  onCloneTemplate: (tpl: UniversalBenefitTemplate) => void;
  onOpenSimulator: (tpl: UniversalBenefitTemplate) => void;
  onUseToIssue: (tpl: UniversalBenefitTemplate) => void;
}

export const TemplateDetailDrawer: React.FC<TemplateDetailDrawerProps> = ({
  template,
  isOpen,
  onClose,
  onToggleStatus,
  onCloneTemplate,
  onOpenSimulator,
  onUseToIssue
}) => {
  if (!isOpen || !template) return null;

  const budgetProgress = template.budgetAllocated > 0
    ? Math.min(100, (template.budgetUsed / template.budgetAllocated) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">{template.name}</h3>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 font-semibold">
                  {template.version}
                </span>
                {template.status === 'active' ? (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    生效中 (ACTIVE)
                  </span>
                ) : template.status === 'paused' ? (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                    已暂停发放
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                    待审核审批
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500 mt-0.5">
                <span className="text-blue-600 font-semibold">{template.code}</span>
                <span>·</span>
                <span>分类：{template.categoryLabel}</span>
                <span>·</span>
                <span>最近更新：{template.lastUpdated} ({template.updatedBy})</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)] text-xs text-slate-700">
          {/* 1. 履约效果与资金占用 KPI 看板 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">累计下发券量</span>
              <div className="font-mono text-lg font-bold text-slate-900 mt-1">
                {template.statTotalIssued.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">张</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-mono font-medium">
                核销率 {template.statRedemptionRate}%
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">已核销收拢</span>
              <div className="font-mono text-lg font-bold text-blue-600 mt-1">
                {template.statRedeemed.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">张</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                流通存量 {(template.statTotalIssued - template.statRedeemed).toLocaleString()}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">撬动卡单 GMV</span>
              <div className="font-mono text-lg font-bold text-emerald-700 mt-1">
                ${(template.statGmvDriven / 1000).toFixed(1)}K
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                USD 交易结算
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">资金杠杆比</span>
              <div className="font-mono text-lg font-bold text-indigo-600 mt-1">
                1 : {(template.budgetUsed > 0 ? (template.statGmvDriven / template.budgetUsed).toFixed(1) : '24.5')}
              </div>
              <span className="text-[10px] text-emerald-700 font-mono">高投资回报</span>
            </div>
          </div>

          {/* 预算消耗进度条 */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-blue-600">account_balance_wallet</span>
                <span className="font-bold text-slate-900">预算池消耗与熔断安全线</span>
              </div>
              <div className="font-mono text-xs">
                <strong className="text-slate-900">${template.budgetUsed.toLocaleString()}</strong>
                <span className="text-slate-400"> / ${template.budgetAllocated.toLocaleString()} USD</span>
                <span className="ml-2 font-bold text-blue-600">({budgetProgress.toFixed(1)}%)</span>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetProgress > 85 ? 'bg-rose-500' : budgetProgress > 60 ? 'bg-amber-500' : 'bg-blue-600'
                }`}
                style={{ width: `${budgetProgress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-0.5">
              <span>归属科目：{template.budgetSubject}</span>
              <span>单日支出熔断阀值：$10,000 USD</span>
            </div>
          </div>

          {/* 2. 权益核心规则参数明细 */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-[16px] text-blue-600">tune</span>
              <span>核心优惠计算与门槛配置 (Discount & Threshold)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 text-[11px] block">权益类型</span>
                <span className="font-semibold text-slate-900 mt-0.5 block">{template.typeLabel}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">加价上浮 / 减免面额</span>
                <span className="font-mono font-bold text-blue-600 text-sm mt-0.5 block">
                  {template.discountDisplay} ({template.discountSub})
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">最高补贴封顶 (Cap)</span>
                <span className="font-mono font-semibold text-slate-900 mt-0.5 block">
                  {template.capAmount > 0 ? `$${template.capAmount.toFixed(2)} USD` : '无限制'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">起用门槛 (Min Order)</span>
                <span className="font-mono font-semibold text-slate-900 mt-0.5 block">{template.minThreshold}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">有效期限模式</span>
                <span className="font-semibold text-slate-900 mt-0.5 block">{template.validity}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">支持出卡币种</span>
                <span className="font-mono text-slate-700 mt-0.5 block">
                  {template.allowedCurrencies.join(' / ')}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] block mb-1">适用卡种白名单</span>
              <div className="flex flex-wrap gap-1.5">
                {template.applicableCardTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono text-[11px] font-medium border border-blue-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 3. 领用与互斥排他规则 */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-[16px] text-blue-600">verified</span>
              <span>发放机制与互斥叠加控制 (Stacking & Claiming)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 text-[11px] block">单人领取上限</span>
                <span className="font-mono font-semibold text-slate-800 mt-0.5 block">
                  限领 {template.maxClaimPerUser} 张
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">单日核销频次</span>
                <span className="font-mono font-semibold text-slate-800 mt-0.5 block">
                  最多 {template.dailyUsageLimit} 次/天
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">叠加大促满减</span>
                <span className={`font-semibold mt-0.5 block ${template.allowStackWithPromotion ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {template.allowStackWithPromotion ? '✓ 允许叠加' : '✕ 互斥排他'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">叠加会员等级特权</span>
                <span className={`font-semibold mt-0.5 block ${template.allowStackWithTier ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {template.allowStackWithTier ? '✓ 允许叠加' : '✕ 互斥排他'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] block mb-1">自动触发核发渠道 (Event Triggers)</span>
              <div className="flex flex-wrap gap-1.5">
                {template.triggerMechanismLabels.map((label, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] flex items-center gap-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    <span>{label}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 4. 业务说明与防刷风控策略 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center gap-1.5 text-slate-800 font-bold">
              <span className="material-symbols-outlined text-[16px] text-amber-600">security</span>
              <span>风控策略与防刷熔断控制 (Risk Mitigation)</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-xs">
              {template.description}
            </p>
            <div className="space-y-1 pt-1">
              {template.riskRules.map((rule, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                  <span className="material-symbols-outlined text-[14px] text-emerald-600">shield</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleStatus(template)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                template.status === 'active'
                  ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              {template.status === 'active' ? '暂停发放此模板' : '恢复启用此模板'}
            </button>
            <button
              onClick={() => onCloneTemplate(template)}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              基于此模板复制
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenSimulator(template)}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">calculate</span>
              <span>沙箱测算</span>
            </button>
            <button
              onClick={() => onUseToIssue(template)}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>使用此模板发券</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
