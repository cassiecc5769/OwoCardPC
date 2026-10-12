import React, { useState, useEffect } from 'react';
import { UniversalBenefitTemplate, BenefitType, BenefitCategory } from './types';

interface CreateEditTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: UniversalBenefitTemplate) => void;
  initialTemplate?: UniversalBenefitTemplate | null;
  mode: 'create' | 'edit' | 'clone';
}

const AVAILABLE_CARDS = [
  '全卡通用',
  'Apple',
  'Steam',
  'Google Play',
  'Razer Gold',
  'Amazon',
  'Sephora',
  "Macy's",
  'Nordstrom',
  'USDT TRC20',
  'USDT ERC20'
];

export const CreateEditTemplateModal: React.FC<CreateEditTemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTemplate,
  mode
}) => {
  const [formData, setFormData] = useState<Partial<UniversalBenefitTemplate>>({
    code: '',
    name: '',
    badge: '新创特权',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    category: 'activation',
    categoryLabel: '交易促活',
    type: 'rate',
    typeLabel: '比例加价券',
    discountValue: 1.0,
    discountUnit: '%',
    discountDisplay: '+1.00%',
    discountSub: '报价即时上浮',
    capAmount: 20.0,
    minThresholdValue: 100.0,
    minThreshold: '单笔满 $100.00 USD',
    validityType: 'relative',
    validityDays: 7,
    validity: '7 天有效 · 领券即生效',
    applicableCards: 'Apple / Steam 专享',
    applicableCardTags: ['Apple', 'Steam'],
    allowedCurrencies: ['USD', 'EUR', 'GBP'],
    maxClaimPerUser: 2,
    dailyUsageLimit: 2,
    allowStackWithPromotion: true,
    allowStackWithTier: true,
    triggerMechanisms: ['order_complete', 'manual_issue'],
    triggerMechanismLabels: ['订单完成自动达标下发', '客服人工审核下发'],
    budgetSubject: '2026核心卡种促活基金',
    budgetAllocated: 50000.0,
    budgetUsed: 0.0,
    statTotalIssued: 0,
    statRedeemed: 0,
    statRedemptionRate: 0,
    statGmvDriven: 0,
    status: 'active',
    version: 'v1.0',
    description: '适用于重点卡种出卡活跃度提升，拉动中小做市商出卡意愿。',
    riskRules: ['同IP单日最多领用 2 张', '风控高危账户自动拦截']
  });

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialTemplate) {
      if (mode === 'clone') {
        setFormData({
          ...initialTemplate,
          id: `tpl-${Date.now()}`,
          code: `TPL-${initialTemplate.type.toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
          name: `${initialTemplate.name} (复制)`,
          version: 'v1.0',
          budgetUsed: 0,
          statTotalIssued: 0,
          statRedeemed: 0,
          statRedemptionRate: 0,
          statGmvDriven: 0,
          lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' '),
          updatedBy: '运营管理员 (OP-SELF)'
        });
      } else {
        setFormData({ ...initialTemplate });
      }
    } else {
      const randomCode = `TPL-RATE-${Math.floor(10 + Math.random() * 90)}`;
      setFormData({
        code: randomCode,
        name: '全球卡商尊享阶梯加价券',
        badge: '运营特惠',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
        category: 'activation',
        categoryLabel: '交易促活',
        type: 'rate',
        typeLabel: '比例加价券',
        discountValue: 1.0,
        discountUnit: '%',
        discountDisplay: '+1.00%',
        discountSub: '报价即时上浮',
        capAmount: 25.0,
        minThresholdValue: 100.0,
        minThreshold: '单笔满 $100.00 USD',
        validityType: 'relative',
        validityDays: 7,
        validity: '7 天有效 · 领券即生效',
        applicableCards: '全卡通用',
        applicableCardTags: ['全卡通用'],
        allowedCurrencies: ['USD', 'EUR'],
        maxClaimPerUser: 2,
        dailyUsageLimit: 2,
        allowStackWithPromotion: true,
        allowStackWithTier: true,
        triggerMechanisms: ['order_complete'],
        triggerMechanismLabels: ['订单完成自动下发'],
        budgetSubject: '2026做市商赋能专项',
        budgetAllocated: 50000.0,
        budgetUsed: 0,
        statTotalIssued: 0,
        statRedeemed: 0,
        statRedemptionRate: 0,
        statGmvDriven: 0,
        status: 'active',
        version: 'v1.0',
        description: '鼓励出卡用户集中交付重点卡密，提升平台流动性吞吐能力。',
        riskRules: ['同设备限领 2 张', '需完成基础实名核验']
      });
    }
  }, [initialTemplate, mode, isOpen]);

  if (!isOpen) return null;

  const handleCardTagToggle = (card: string) => {
    const current = formData.applicableCardTags || [];
    let updated: string[];
    if (card === '全卡通用') {
      updated = ['全卡通用'];
    } else {
      const filtered = current.filter(c => c !== '全卡通用');
      if (filtered.includes(card)) {
        updated = filtered.filter(c => c !== card);
        if (updated.length === 0) updated = ['全卡通用'];
      } else {
        updated = [...filtered, card];
      }
    }
    setFormData({
      ...formData,
      applicableCardTags: updated,
      applicableCards: updated.join(' / ')
    });
  };

  const handleTypeChange = (type: BenefitType) => {
    let typeLabel = '比例加价券';
    let discountUnit: '%' | 'USD' | 'USDT' | '秒' | '分' = '%';
    let discountDisplay = `+${formData.discountValue || 1.0}%`;
    let discountSub = '报价即时上浮';

    if (type === 'fixed') {
      typeLabel = '固定金额加价券';
      discountUnit = 'USD';
      discountDisplay = `+$${formData.discountValue || 10.0}`;
      discountSub = '现金直接立补';
    } else if (type === 'fee') {
      typeLabel = '提现免手续费卡';
      discountUnit = 'USDT';
      discountDisplay = `免 ${formData.discountValue || 15} USDT`;
      discountSub = 'Gas手续费全免';
    } else if (type === 'service') {
      typeLabel = '极速直通专线卡';
      discountUnit = '秒';
      discountDisplay = '0 秒排队';
      discountSub = '专线秒级核销';
    } else if (type === 'lock') {
      typeLabel = '汇率保价锁汇卡';
      discountUnit = '分';
      discountDisplay = '30 分钟锁定';
      discountSub = '防止汇率下挫';
    }

    setFormData({
      ...formData,
      type,
      typeLabel,
      discountUnit,
      discountDisplay,
      discountSub
    });
  };

  const handleCategoryChange = (category: BenefitCategory) => {
    const map: Record<BenefitCategory, string> = {
      acquisition: '市场拉新',
      activation: '交易促活',
      loyalty: '会员尊享',
      retention: '召回挽损',
      service: '服务保障',
      channel: '渠道联名'
    };
    setFormData({
      ...formData,
      category,
      categoryLabel: map[category]
    });
  };

  const handleSubmit = () => {
    if (!formData.name?.trim()) {
      setErrorMsg('请填写权益模板名称');
      setActiveStep(1);
      return;
    }
    setErrorMsg(null);

    const finalTpl: UniversalBenefitTemplate = {
      id: formData.id || `tpl-${Date.now()}`,
      code: formData.code || `TPL-${(formData.type || 'RATE').toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      name: formData.name,
      badge: formData.badge || '运营特惠',
      badgeColor: formData.badgeColor || 'bg-blue-100 text-blue-800 border-blue-200',
      category: formData.category || 'activation',
      categoryLabel: formData.categoryLabel || '交易促活',
      type: formData.type || 'rate',
      typeLabel: formData.typeLabel || '比例加价券',
      discountValue: Number(formData.discountValue) || 1.0,
      discountUnit: formData.discountUnit || '%',
      discountDisplay: formData.discountDisplay || '+1.00%',
      discountSub: formData.discountSub || '报价即时上浮',
      capAmount: Number(formData.capAmount) || 20.0,
      minThresholdValue: Number(formData.minThresholdValue) || 50.0,
      minThreshold: `满 $${Number(formData.minThresholdValue || 50).toFixed(2)} USD`,
      validityType: 'relative',
      validityDays: Number(formData.validityDays) || 7,
      validity: `${formData.validityDays || 7} 天有效 · 领券即生效`,
      applicableCards: formData.applicableCards || '全卡通用',
      applicableCardTags: formData.applicableCardTags || ['全卡通用'],
      allowedCurrencies: formData.allowedCurrencies || ['USD', 'EUR', 'GBP'],
      maxClaimPerUser: Number(formData.maxClaimPerUser) || 2,
      dailyUsageLimit: Number(formData.dailyUsageLimit) || 2,
      allowStackWithPromotion: !!formData.allowStackWithPromotion,
      allowStackWithTier: !!formData.allowStackWithTier,
      triggerMechanisms: formData.triggerMechanisms || ['order_complete'],
      triggerMechanismLabels: formData.triggerMechanismLabels || ['订单完成自动下发'],
      budgetSubject: formData.budgetSubject || '2026营销补贴专项',
      budgetAllocated: Number(formData.budgetAllocated) || 50000.0,
      budgetUsed: formData.budgetUsed || 0,
      statTotalIssued: formData.statTotalIssued || 0,
      statRedeemed: formData.statRedeemed || 0,
      statRedemptionRate: formData.statRedemptionRate || 0,
      statGmvDriven: formData.statGmvDriven || 0,
      status: formData.status || 'active',
      version: formData.version || 'v1.0',
      lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' '),
      updatedBy: '运营调度中枢 (OP-ADMIN)',
      description: formData.description || '全域通用权益配置模板，打通各业务线自动发券与核销。',
      riskRules: formData.riskRules || ['同设备防刷频控', '大宗交易双人复核']
    };

    onSave(finalTpl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">
                {mode === 'edit' ? 'edit_note' : mode === 'clone' ? 'file_copy' : 'add_circle'}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>
                  {mode === 'edit' ? '编辑权益模板配置' : mode === 'clone' ? '复制并衍生新模板' : '创建新通用权益模板 ()'}
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                  RULE-BUILDER
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                规范化配置权益类型、上浮加成比例、适用卡种限制与风控熔断规则
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

        {/* Wizard Step Indicator */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-2.5 bg-white text-xs">
          <button
            onClick={() => setActiveStep(1)}
            className={`flex items-center gap-2 font-medium cursor-pointer ${
              activeStep === 1 ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
              activeStep === 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}>1</span>
            <span>基础定义与业务属性</span>
          </button>
          <div className="w-8 h-[1px] bg-slate-200"></div>
          <button
            onClick={() => setActiveStep(2)}
            className={`flex items-center gap-2 font-medium cursor-pointer ${
              activeStep === 2 ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
              activeStep === 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}>2</span>
            <span>优惠规则与门槛白名单</span>
          </button>
          <div className="w-8 h-[1px] bg-slate-200"></div>
          <button
            onClick={() => setActiveStep(3)}
            className={`flex items-center gap-2 font-medium cursor-pointer ${
              activeStep === 3 ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
              activeStep === 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}>3</span>
            <span>领用互斥与风控熔断</span>
          </button>
        </div>

        {/* Validation Error Banner */}
        {errorMsg && (
          <div className="mx-6 mt-3 px-3.5 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-rose-600 text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Step 1: 基础定义 */}
          {activeStep === 1 && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    模板代码 (Code) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full h-8 px-3 rounded-lg bg-slate-50 border border-slate-200 font-mono font-bold text-blue-600 focus:bg-white focus:outline-none focus:border-blue-500"
                    placeholder="如：TPL-RATE-09"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    模板名称 (Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-8 px-3 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                    placeholder="如：Apple 充值卡大额专享加价券"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    业务归属场景 (Category)
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => handleCategoryChange(e.target.value as BenefitCategory)}
                    className="w-full h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="acquisition">市场拉新 (新手首单/破冰)</option>
                    <option value="activation">交易促活 (大额大宗/品类狂欢)</option>
                    <option value="loyalty">会员尊享 (等级阶梯/做市商回馈)</option>
                    <option value="retention">召回挽损 (客服争议安抚/流失唤醒)</option>
                    <option value="service">服务保障 (极速结算/锁汇保价/提现贴息)</option>
                    <option value="channel">渠道联名 (BD专属公会定制)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    战役营销角标 (Badge Text)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={e => setFormData({ ...formData, badge: e.target.value })}
                      className="w-full h-8 px-3 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                      placeholder="如：限时加价"
                    />
                    <select
                      value={formData.badgeColor}
                      onChange={e => setFormData({ ...formData, badgeColor: e.target.value })}
                      className="h-8 px-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] cursor-pointer"
                    >
                      <option value="bg-blue-100 text-blue-800 border-blue-200">蓝色 (标准)</option>
                      <option value="bg-emerald-100 text-emerald-800 border-emerald-200">绿色 (大促)</option>
                      <option value="bg-amber-100 text-amber-800 border-amber-200">金黄 (高返)</option>
                      <option value="bg-purple-100 text-purple-800 border-purple-200">紫色 (特权)</option>
                      <option value="bg-rose-100 text-rose-800 border-rose-200">红色 (补偿)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  业务说明与规则解读 (Description)
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 leading-relaxed"
                  placeholder="说明此模板的业务发券背景、主要刺激目标人群及考核指标..."
                />
              </div>
            </div>
          )}

          {/* Step 2: 优惠计算与门槛 */}
          {activeStep === 2 && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    权益形态类型 (Benefit Type) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={e => handleTypeChange(e.target.value as BenefitType)}
                    className="w-full h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="rate">比例加价券 (Rate % - 汇率报价直接上浮)</option>
                    <option value="fixed">固定现金加价 (Fixed Cash - 满额立补现金)</option>
                    <option value="fee">提现免手续费 (Fee Waiver - 免USDT矿工费)</option>
                    <option value="service">极速核销直通 (Speed Lane - 0秒排队优先销卡)</option>
                    <option value="lock">锁汇保价特权 (Rate Lock - 锁定高位汇率防跌)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    加价幅度 / 面值数值 ({formData.discountUnit}) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step={formData.type === 'rate' ? '0.1' : '1'}
                      value={formData.discountValue}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0;
                        setFormData({
                          ...formData,
                          discountValue: val,
                          discountDisplay:
                            formData.type === 'rate'
                              ? `+${val}%`
                              : formData.type === 'fixed'
                              ? `+$${val}`
                              : formData.type === 'fee'
                              ? `免 ${val} USDT`
                              : `${val} 专享`
                        });
                      }}
                      className="w-full h-8 pl-3 pr-8 rounded-lg bg-slate-50 border border-slate-200 font-mono font-bold text-blue-600 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                    <span className="absolute right-3 top-2 font-mono text-slate-400 font-semibold">
                      {formData.discountUnit}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    最高加价封顶 ($ USD)
                  </label>
                  <input
                    type="number"
                    value={formData.capAmount}
                    onChange={e => setFormData({ ...formData, capAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full h-8 px-3 rounded-lg bg-slate-50 border border-slate-200 font-mono font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                    placeholder="0 表示不封顶"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">防止巨额卡单引发过度补贴</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    单笔起用门槛 ($ USD)
                  </label>
                  <input
                    type="number"
                    value={formData.minThresholdValue}
                    onChange={e => {
                      const val = parseFloat(e.target.value) || 0;
                      setFormData({
                        ...formData,
                        minThresholdValue: val,
                        minThreshold: val > 0 ? `单笔满 $${val.toFixed(2)} USD` : '无门槛限制'
                      });
                    }}
                    className="w-full h-8 px-3 rounded-lg bg-slate-50 border border-slate-200 font-mono font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">0 表示无出卡面值门槛</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    有效使用天数 (天)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={formData.validityDays}
                    onChange={e => {
                      const val = parseInt(e.target.value) || 7;
                      setFormData({
                        ...formData,
                        validityDays: val,
                        validity: `${val} 天有效 · 领券即生效`
                      });
                    }}
                    className="w-full h-8 px-3 rounded-lg bg-slate-50 border border-slate-200 font-mono font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">自领券时间戳起算</span>
                </div>
              </div>

              {/* 适用卡种白名单 */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  适用卡种品类白名单限制 (Card Whitelist)
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_CARDS.map(card => {
                    const isChecked = formData.applicableCardTags?.includes(card);
                    return (
                      <button
                        type="button"
                        key={card}
                        onClick={() => handleCardTagToggle(card)}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {card}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: 领用与风控 */}
          {activeStep === 3 && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    单人最多限领数量 (张)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.maxClaimPerUser}
                    onChange={e => setFormData({ ...formData, maxClaimPerUser: parseInt(e.target.value) || 1 })}
                    className="w-full h-8 px-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    单日核销使用频次上限 (次/天)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.dailyUsageLimit}
                    onChange={e => setFormData({ ...formData, dailyUsageLimit: parseInt(e.target.value) || 1 })}
                    className="w-full h-8 px-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <span className="font-bold text-slate-800 block">互斥叠加控制策略</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowStackWithPromotion}
                      onChange={e => setFormData({ ...formData, allowStackWithPromotion: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-slate-700">允许与全站大促满减优惠叠加</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowStackWithTier}
                      onChange={e => setFormData({ ...formData, allowStackWithTier: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-slate-700">允许与会员等级加成折率叠加</span>
                  </label>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <span className="font-bold text-slate-800 block">预算资金归属与额度</span>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">预算占用会计科目</label>
                    <input
                      type="text"
                      value={formData.budgetSubject}
                      onChange={e => setFormData({ ...formData, budgetSubject: e.target.value })}
                      className="w-full h-7 px-2 rounded bg-white border border-slate-200 text-slate-800 text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">规划总预算池 ($ USD)</label>
                    <input
                      type="number"
                      value={formData.budgetAllocated}
                      onChange={e => setFormData({ ...formData, budgetAllocated: parseFloat(e.target.value) || 0 })}
                      className="w-full h-7 px-2 rounded bg-white border border-slate-200 font-mono text-slate-800 text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* 实时券面预览卡片 */}
              <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">券面实时动态预览 (PREVIEW)</span>
                  <span className="font-mono text-[10px] text-emerald-400">实时计算中</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/90 border border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-semibold ${formData.badgeColor}`}>
                        {formData.badge}
                      </span>
                      <span className="font-bold text-white text-xs">{formData.name || '模板名称预览'}</span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      {formData.minThreshold} · {formData.applicableCards} · {formData.validity}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xl font-bold text-emerald-400 block">
                      {formData.discountDisplay}
                    </span>
                    <span className="text-[10px] text-slate-400">{formData.discountSub}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            {activeStep > 1 && (
              <button
                type="button"
                onClick={() => setActiveStep((activeStep - 1) as any)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs cursor-pointer transition-colors"
              >
                上一步
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs cursor-pointer transition-colors"
            >
              取消
            </button>
            {activeStep < 3 ? (
              <button
                type="button"
                onClick={() => setActiveStep((activeStep + 1) as any)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs cursor-pointer transition-colors"
              >
                下一步：{activeStep === 1 ? '配置优惠与门槛' : '领用与风控'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs cursor-pointer transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>确认并入库生效</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
