import React, { useState, useEffect } from 'react';
import { CardSkuMasterItem } from './types';

interface CardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardSkuMasterItem | null;
  onSave: (card: CardSkuMasterItem) => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  isOpen,
  onClose,
  card,
  onSave,
}) => {
  const isEditing = Boolean(card);

  const [formData, setFormData] = useState<Partial<CardSkuMasterItem>>({
    id: 'SKU-NEW-01',
    internalId: `#008${Math.floor(Math.random() * 90 + 10)}`,
    brandName: '',
    subTitle: '',
    category: '游戏点卡',
    iconType: 'custom',
    iconBg: '#1e293b',
    iconText: 'NEW',
    countryCode: 'US',
    countryName: '美国 (US)',
    countryFlag: '🇺🇸',
    currency: 'USD',
    currencyDesc: 'USD ($) 结算',
    minAmount: 10,
    maxAmount: 500,
    faceValueModel: 'FIXED',
    faceValueRangeDesc: '$10.00 ~ $500.00',
    ladderDetailDesc: '常规阶梯: 25 / 50 / 100 浮动',
    ladders: [
      { amount: 25, rateDiscount: 85.0, minMerchantRate: 80.0, dailyLimit: 100000, enabled: true },
      { amount: 50, rateDiscount: 86.5, minMerchantRate: 81.5, dailyLimit: 150000, enabled: true },
      { amount: 100, rateDiscount: 87.5, minMerchantRate: 82.5, dailyLimit: 200000, enabled: true },
    ],
    regexRule: '^[A-Z0-9]{16}$',
    regexDisplay: '^[A-Z0-9]{16}$ (16位)',
    cardMaterial: '实体涂层卡 / 电子码 (E-Code)',
    ocrCapabilities: [
      { text: '深度OCR 99.0%', type: 'success' },
      { text: '官方直连查余', type: 'info' },
    ],
    status: 'active',
    riskTier: 'normal',
    balanceCheckSupported: true,
  });

  // Regex testing state
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<boolean | null>(null);

  useEffect(() => {
    if (card) {
      setFormData(card);
      setTestInput('');
      setTestResult(null);
    } else {
      setFormData({
        id: `SKU-CFG-${Math.floor(Math.random() * 900 + 100)}`,
        internalId: `#008${Math.floor(Math.random() * 90 + 10)}`,
        brandName: '',
        subTitle: '',
        category: '应用/软件',
        iconType: 'custom',
        iconBg: '#1e293b',
        countryCode: 'US',
        countryName: '美国 (US)',
        countryFlag: '🇺🇸',
        currency: 'USD',
        currencyDesc: 'USD ($) 结算',
        minAmount: 10,
        maxAmount: 500,
        faceValueModel: 'RANGE',
        faceValueRangeDesc: '$10.00 ~ $500.00',
        ladderDetailDesc: '常规阶梯: 25 / 50 / 100 浮动',
        ladders: [
          { amount: 25, rateDiscount: 85.0, minMerchantRate: 80.0, dailyLimit: 100000, enabled: true },
          { amount: 50, rateDiscount: 86.5, minMerchantRate: 81.5, dailyLimit: 150000, enabled: true },
          { amount: 100, rateDiscount: 87.5, minMerchantRate: 82.5, dailyLimit: 200000, enabled: true },
        ],
        regexRule: '^[A-Z0-9]{16}$',
        regexDisplay: '^[A-Z0-9]{16}$ (16位)',
        cardMaterial: '实体涂层卡 / 电子码 (E-Code)',
        ocrCapabilities: [
          { text: '深度OCR 99.0%', type: 'success' },
          { text: '官方直连查余', type: 'info' },
        ],
        status: 'active',
        riskTier: 'normal',
        balanceCheckSupported: true,
      });
      setTestInput('');
      setTestResult(null);
    }
  }, [card, isOpen]);

  if (!isOpen) return null;

  const handleTestRegex = (val: string) => {
    setTestInput(val);
    if (!val.trim()) {
      setTestResult(null);
      return;
    }
    try {
      const reg = new RegExp(formData.regexRule || '');
      setTestResult(reg.test(val.trim()));
    } catch {
      setTestResult(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brandName || !formData.id) return;

    const updated: CardSkuMasterItem = {
      ...formData,
      id: formData.id || 'SKU-NEW',
      internalId: formData.internalId || '#00899',
      brandName: formData.brandName || '',
      subTitle: formData.subTitle || '',
      category: formData.category || '应用/软件',
      iconType: formData.iconType || 'custom',
      iconBg: formData.iconBg || '#1e293b',
      countryCode: formData.countryCode || 'US',
      countryName: formData.countryName || '美国 (US)',
      countryFlag: formData.countryFlag || '🇺🇸',
      currency: formData.currency || 'USD',
      currencyDesc: formData.currencyDesc || `${formData.currency} 结算`,
      minAmount: Number(formData.minAmount) || 10,
      maxAmount: Number(formData.maxAmount) || 500,
      faceValueModel: formData.faceValueModel || 'FIXED',
      faceValueRangeDesc: `$${formData.minAmount || 10}.00 ~ $${formData.maxAmount || 500}.00`,
      ladderDetailDesc: formData.ladderDetailDesc || '阶梯浮动',
      ladders: formData.ladders || [],
      regexRule: formData.regexRule || '^[A-Z0-9]+$',
      regexDisplay: formData.regexDisplay || formData.regexRule || '',
      cardMaterial: formData.cardMaterial || '实体涂层卡 / 电子码',
      ocrCapabilities: formData.ocrCapabilities || [{ text: '深度OCR 99.0%', type: 'success' }],
      status: formData.status || 'active',
      riskTier: formData.riskTier || 'normal',
      riskBadge: formData.riskTier === 'high_risk' ? '高风控' : undefined,
      balanceCheckSupported: Boolean(formData.balanceCheckSupported),
      lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 19),
      auditHash: `HASH: ${Math.random().toString(16).substring(2, 6).toUpperCase()}-${Math.random()
        .toString(16)
        .substring(2, 6)
        .toUpperCase()}-01A1`,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 flex flex-col animate-fadeIn">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined text-[20px]">
                {isEditing ? 'edit_note' : 'add_box'}
              </span>
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {isEditing ? `编辑卡种主配置 · ${card?.brandName}` : '新增全网卡种主数据品牌'}
              </h3>
              <span className="font-code-token text-[11px] text-slate-500">
                MASTER DATA CONFIGURATION & RUNTIME REGEX PIPELINE
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-700">
          {/* Row 1: SKU & Brand Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                卡种全局唯一编码 (SKU) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                placeholder="如: SKU-APL-US"
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                品牌正式名称 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                placeholder="如: Apple Gift Card"
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-800 block mb-1">本地化中文定义</label>
              <input
                type="text"
                value={formData.subTitle}
                onChange={(e) => setFormData({ ...formData, subTitle: e.target.value })}
                placeholder="如: 苹果综合充值卡 (美区)"
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Row 2: Category, Geo, Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-800 block mb-1">卡种大类品类</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white cursor-pointer"
              >
                <option value="应用/软件">应用/软件 (Apps/Software)</option>
                <option value="游戏点卡">游戏点卡 (Gaming)</option>
                <option value="电商购物">电商购物 (E-Commerce)</option>
                <option value="金融预付">金融预付 (Prepaid Card)</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-800 block mb-1">发行属地 / 地区</label>
              <select
                value={formData.countryCode}
                onChange={(e) => {
                  const val = e.target.value;
                  let flag = '🇺🇸';
                  let name = '美国 (US)';
                  if (val === 'UK') {
                    flag = '🇬🇧';
                    name = '英国 (UK)';
                  } else if (val === 'DE') {
                    flag = '🇩🇪';
                    name = '德国 (DE)';
                  } else if (val === 'JP') {
                    flag = '🇯🇵';
                    name = '日本 (JP)';
                  } else if (val === 'NG') {
                    flag = '🇳🇬';
                    name = '尼日利亚 (NG)';
                  } else if (val === 'GLB') {
                    flag = '🌍';
                    name = '全球通用 (GLB)';
                  }
                  setFormData({
                    ...formData,
                    countryCode: val,
                    countryName: name,
                    countryFlag: flag,
                  });
                }}
                className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white cursor-pointer"
              >
                <option value="US">🇺🇸 美国 (US)</option>
                <option value="UK">🇬🇧 英国 (UK)</option>
                <option value="DE">🇩🇪 德国 (DE)</option>
                <option value="JP">🇯🇵 日本 (JP)</option>
                <option value="NG">🇳🇬 尼日利亚 (NG)</option>
                <option value="GLB">🌍 全球通用 (GLB)</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-800 block mb-1">结算货币币种</label>
              <select
                value={formData.currency}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currency: e.target.value,
                    currencyDesc: `${e.target.value} ($) 结算`,
                  })
                }
                className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white cursor-pointer"
              >
                <option value="USD">USD ($) 美元</option>
                <option value="GBP">GBP (£) 英镑</option>
                <option value="EUR">EUR (€) 欧元</option>
                <option value="NGN">NGN (₦) 奈拉</option>
                <option value="JPY">JPY (¥) 日元</option>
              </select>
            </div>
          </div>

          {/* Row 3: Face Value Model & Range */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <label className="font-semibold text-slate-800 block mb-1">面值支持模型</label>
              <select
                value={formData.faceValueModel}
                onChange={(e) =>
                  setFormData({ ...formData, faceValueModel: e.target.value as any })
                }
                className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
              >
                <option value="FIXED">固定面值阶梯 (Fixed)</option>
                <option value="RANGE">范围浮动面值 (Range)</option>
                <option value="BOTH">固定/范围混合 (Both)</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-800 block mb-1">单卡承揽最低金额</label>
              <input
                type="number"
                value={formData.minAmount}
                onChange={(e) => setFormData({ ...formData, minAmount: Number(e.target.value) })}
                className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-800 block mb-1">单卡承揽最高金额</label>
              <input
                type="number"
                value={formData.maxAmount}
                onChange={(e) => setFormData({ ...formData, maxAmount: Number(e.target.value) })}
                className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Row 4: Regex validation and Interactive Regex Playground */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-blue-600">code</span>
                <span>卡密校验正则表达式 (Regex Rule)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                JavaScript ECMA Regex
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-500 block mb-0.5">正则语法规则</label>
                <input
                  type="text"
                  required
                  value={formData.regexRule}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      regexRule: e.target.value,
                      regexDisplay: `${e.target.value}`,
                    })
                  }
                  placeholder="如: ^X[A-Z0-9]{15}$"
                  className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg font-mono text-xs text-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-0.5">卡形态物料说明</label>
                <input
                  type="text"
                  value={formData.cardMaterial}
                  onChange={(e) => setFormData({ ...formData, cardMaterial: e.target.value })}
                  placeholder="如: 实体涂层卡 / 电子码 (E-Code)"
                  className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Interactive Regex Test Bar */}
            <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-600 shrink-0">实时测试卡密:</span>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={testInput}
                  onChange={(e) => handleTestRegex(e.target.value)}
                  placeholder="输入测试卡密以校验正则匹配..."
                  className="w-full h-7 px-2 bg-white border border-slate-200 rounded text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              {testResult !== null && (
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold font-mono flex items-center gap-1 ${
                    testResult
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {testResult ? 'check' : 'close'}
                  </span>
                  <span>{testResult ? '匹配成功' : '格式不合规'}</span>
                </span>
              )}
            </div>
          </div>

          {/* Row 5: Capabilities & Risk Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                实时余额反查能力
              </label>
              <select
                value={formData.balanceCheckSupported ? 'true' : 'false'}
                onChange={(e) =>
                  setFormData({ ...formData, balanceCheckSupported: e.target.value === 'true' })
                }
                className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
              >
                <option value="true">支持 (官方直连 API 反查)</option>
                <option value="false">不支持 (免查直接做卡)</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                风控准入与复核级别
              </label>
              <select
                value={formData.riskTier}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    riskTier: e.target.value as any,
                    riskBadge: e.target.value === 'high_risk' ? '高风控' : undefined,
                  })
                }
                className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
              >
                <option value="normal">标准收卡准入 (自动核验)</option>
                <option value="high_risk">高风控准入 (人工二次复核)</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-800 block mb-1">全网启收状态</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as any,
                    riskBadge: e.target.value === 'maintenance' ? '维护停收' : undefined,
                  })
                }
                className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
              >
                <option value="active">正常在收 (ACTIVE)</option>
                <option value="maintenance">维护停收 (PAUSED)</option>
              </select>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">
              保存后自动注入分布式撮合节点 (Hash 保全)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 font-medium cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                <span>{isEditing ? '保存并热下发' : '提交创建并生效'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
