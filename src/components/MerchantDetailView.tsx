import React, { useEffect, useRef, useState } from 'react';
import { MerchantItem, MerchantCapabilityRule, MerchantFrozenPointsRecord, MerchantPointsWallet, MerchantProcessingCardRule, MerchantProcessingDurationRule, ProcessingDenominationType } from '../types';
import { SAMPLE_CAPABILITY_RULES } from '../data/mockMerchants';
import { MerchantEmployeesTab } from './merchant/MerchantEmployeesTab';

const formatRuleTime = () => new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }).replaceAll('/', '-');

const COUNTRY_OPTIONS = ['不限', '美国', '英国', '日本', '德国', '全球'] as const;
const CARD_HEAD_OPTIONS = ['不限', '4xxx', '7xxx', '8xxx'] as const;
const CARD_TYPE_OPTIONS = ['不限', 'ECode', 'Physical'] as const;
const SPEED_OPTIONS = ['不限', '快卡', '慢卡'] as const;
const DENOMINATION_TYPE_OPTIONS: readonly ProcessingDenominationType[] = ['不限', '指定面值', '范围面值', '倍数面值'];

const formatPoints = (value: number) => value.toLocaleString('zh-CN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const createDefaultPointsWallet = (merchant: MerchantItem): MerchantPointsWallet => {
  const isDisabled = merchant.id === '6';
  const frozenDetails: MerchantFrozenPointsRecord[] = isDisabled
    ? []
    : [
        { id: `${merchant.id}-freeze-1`, amount: 35800, frozenAt: '2026-10-15 09:42:18', operator: '系统自动冻结' },
        { id: `${merchant.id}-freeze-2`, amount: 12600, frozenAt: '2026-10-14 16:08:35', operator: '风控岗-周宁' }
      ];

  return {
    status: isDisabled ? '已被禁用' : '正常',
    availablePoints: merchant.points,
    frozenPoints: frozenDetails.reduce((total, item) => total + item.amount, 0),
    totalRechargedPoints: merchant.points + 368000,
    withdrawnPoints: isDisabled ? 32000 : 18000,
    settledPoints: Math.max(0, merchant.points * 0.42),
    uAddress: merchant.id === '4' ? undefined : 'TQ9xK7mR4v2N8sL6pQ3wE5cD1aZ0',
    disabledInfo: isDisabled
      ? { reason: '关联交易争议，等待财务复核', operatedAt: '2026-10-12 18:26:04', operator: '风控岗-周宁' }
      : undefined,
    frozenDetails
  };
};

const createDefaultProcessingConfigs = (merchant: MerchantItem): MerchantProcessingCardRule[] => (
  merchant.supportedCards
    .filter(card => !card.isTag && !card.name.startsWith('+'))
    .map(card => ({
      cardName: card.name,
      allowException: false,
      selfDelayEnabled: false,
      selfDelayMinutes: 10,
      durationRules: [{
        id: `${merchant.id}-${card.name}-general`,
        countries: ['不限'],
        cardHeads: ['不限'],
        cardTypes: ['不限'],
        speeds: ['不限'],
        denominationTypes: ['不限'] as ProcessingDenominationType[],
        processingDurationSec: 0,
        afterSalesDurationMin: 10,
        isActive: true,
        updatedAt: formatRuleTime(),
        createdAt: formatRuleTime()
      }]
    }))
);

const createDraftDurationRule = (): Omit<MerchantProcessingDurationRule, 'id' | 'updatedAt' | 'createdAt'> => ({
  countries: ['不限'],
  cardHeads: ['不限'],
  cardTypes: ['不限'],
  speeds: ['不限'],
  denominationTypes: ['不限'],
  rangeMin: 1,
  rangeMax: 100,
  multipleBase: 5,
  multipleMin: 1,
  multipleMax: 100,
  specifiedValues: '',
  processingDurationSec: 0,
  afterSalesDurationMin: 10,
  isActive: true
});

const CompactSwitch: React.FC<{ checked: boolean; onChange: () => void; label: string }> = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={onChange}
    className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
      checked ? 'bg-blue-600' : 'bg-slate-300'
    }`}
  >
    <span
      className={`pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
        checked ? 'translate-x-4' : 'translate-x-0'
      }`}
    />
  </button>
);

const displayProcessingValues = (values?: string[]) => (!values?.length ? '不限' : values.join('、'));

const formatDenominationRule = (rule: MerchantProcessingDurationRule) => {
  return rule.denominationTypes.map(type => {
    if (type === '不限') return '不限';
    if (type === '范围面值') return `范围面值 ${rule.rangeMin ?? '-'}-${rule.rangeMax ?? '-'}`;
    if (type === '倍数面值') return `倍数面值 ${rule.multipleBase ?? '-'}的倍数${rule.multipleMin ?? '-'}-${rule.multipleMax ?? '-'}`;
    return `指定面值 ${rule.specifiedValues?.trim() || '未配置'}`;
  }).join('；');
};

const toggleMultiChoice = <T extends string>(current: T[], value: T, unlimited: T): T[] => {
  if (value === unlimited) return [unlimited];
  const valuesWithoutUnlimited = current.filter(item => item !== unlimited);
  const next = valuesWithoutUnlimited.includes(value)
    ? valuesWithoutUnlimited.filter(item => item !== value)
    : [...valuesWithoutUnlimited, value];
  return next.length > 0 ? next : [unlimited];
};

interface MultiChoiceFieldProps<T extends string> {
  values: T[];
  options: readonly T[];
  onChange: (values: T[]) => void;
  unlimited: T;
}

const MultiChoiceField = <T extends string>({ values, options, onChange, unlimited }: MultiChoiceFieldProps<T>) => (
  <div className="flex flex-wrap gap-2">
    {options.map(option => {
      const selected = values.includes(option);
      return (
        <button
          type="button"
          key={option}
          aria-pressed={selected}
          onClick={() => onChange(toggleMultiChoice(values, option, unlimited))}
          className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${
            selected
              ? 'border-blue-300 bg-blue-50 text-blue-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">{selected ? 'check_box' : 'check_box_outline_blank'}</span>
          {option}
        </button>
      );
    })}
  </div>
);

interface MultiSelectDropdownProps<T extends string> extends MultiChoiceFieldProps<T> {
  label: string;
  searchPlaceholder: string;
}

const MultiSelectDropdown = <T extends string>({ values, options, onChange, unlimited, label, searchPlaceholder }: MultiSelectDropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const closeDropdown = () => {
    setIsOpen(false);
    setSearchKeyword('');
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) closeDropdown();
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const summary = values.length <= 2 ? values.join('、') : `${values.slice(0, 2).join('、')} +${values.length - 2}`;
  const normalizedKeyword = searchKeyword.trim().toLocaleLowerCase();
  const filteredOptions = options.filter(option => option.toLocaleLowerCase().includes(normalizedKeyword));

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => isOpen ? closeDropdown() : setIsOpen(true)}
        className={`flex h-9 w-full items-center justify-between gap-3 rounded-lg border bg-white px-3 text-left text-xs outline-none transition-colors cursor-pointer ${
          isOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <span className="truncate font-medium text-slate-700">{summary || unlimited}</span>
        <span className={`material-symbols-outlined shrink-0 text-[18px] text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 p-2">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">search</span>
              <input
                autoFocus
                value={searchKeyword}
                onChange={event => setSearchKeyword(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 pl-8 pr-2 text-xs outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>
          <div role="listbox" aria-label={`${label}选项`} aria-multiselectable="true" className="max-h-56 overflow-y-auto p-1.5">
            {filteredOptions.map(option => {
              const selected = values.includes(option);
              return (
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  key={option}
                  onClick={() => onChange(toggleMultiChoice(values, option, unlimited))}
                  className={`flex h-8 w-full items-center gap-2 rounded-md px-2.5 text-left text-xs transition-colors cursor-pointer ${
                    selected ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{selected ? 'check_box' : 'check_box_outline_blank'}</span>
                  <span>{option}</span>
                </button>
              );
            })}
            {filteredOptions.length === 0 && <div className="px-3 py-5 text-center text-xs text-slate-400">无匹配选项</div>}
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-3 py-2">
            <span className="text-[11px] text-slate-500">已选 {values.includes(unlimited) ? 0 : values.length} 项</span>
            <button type="button" onClick={closeDropdown} className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">完成</button>
          </div>
        </div>
      )}
    </div>
  );
};

const RuleFormRow: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required = false, children }) => (
  <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-4 px-5 py-4 items-start">
    <div className="pt-1.5 text-right text-xs font-semibold text-slate-700">
      {required && <span className="mr-1 text-rose-500">*</span>}
      {label}
    </div>
    <div className="min-w-0">{children}</div>
  </div>
);

interface MerchantDetailViewProps {
  merchant: MerchantItem;
  initialTab?: number;
  onBack: () => void;
  onUpdateMerchant: (updated: MerchantItem) => void;
}

export const MerchantDetailView: React.FC<MerchantDetailViewProps> = ({
  merchant,
  initialTab = 1,
  onBack,
  onUpdateMerchant
}) => {
  const [activeTab, setActiveTab] = useState<number>(initialTab);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Capability Rules State (基础承接能力)
  const [rules, setRules] = useState<MerchantCapabilityRule[]>(
    merchant.capabilityRules && merchant.capabilityRules.length > 0
      ? merchant.capabilityRules
      : SAMPLE_CAPABILITY_RULES
  );

  // Capability Rules Filter
  const [ruleSearch, setRuleSearch] = useState('');
  const [ruleCountry, setRuleCountry] = useState('全部');
  const [ruleMedia, setRuleMedia] = useState('全部');
  const [ruleStatus, setRuleStatus] = useState('全部');

  // Modals
  const [showAdjustRateModal, setShowAdjustRateModal] = useState(false);
  const [selectedRuleForAdjust, setSelectedRuleForAdjust] = useState<MerchantCapabilityRule | null>(null);
  const [tempAdjustRate, setTempAdjustRate] = useState('');

  const [showMarginModal, setShowMarginModal] = useState(false);
  const [showFuseModal, setShowFuseModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showFrozenPointsDrawer, setShowFrozenPointsDrawer] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  // 做卡规则：仅从商户经营卡类生成，规则允许并存，执行时由业务引擎计算优先级。
  const [processingConfigs, setProcessingConfigs] = useState<MerchantProcessingCardRule[]>(
    merchant.processingRuleConfigs && merchant.processingRuleConfigs.length > 0
      ? merchant.processingRuleConfigs
      : createDefaultProcessingConfigs(merchant)
  );
  const [selectedProcessingCard, setSelectedProcessingCard] = useState<string>(
    (merchant.processingRuleConfigs && merchant.processingRuleConfigs[0]?.cardName)
      || merchant.supportedCards.find(card => !card.isTag && !card.name.startsWith('+'))?.name
      || ''
  );
  const [showDurationDrawer, setShowDurationDrawer] = useState(false);
  const [editingDurationRuleId, setEditingDurationRuleId] = useState<string | null>(null);
  const [draftDurationRule, setDraftDurationRule] = useState(createDraftDurationRule);
  const [processingRuleSearch, setProcessingRuleSearch] = useState('');
  const [processingRuleStatus, setProcessingRuleStatus] = useState('全部');
  const [processingRuleSortField, setProcessingRuleSortField] = useState<'createdAt' | 'updatedAt'>('updatedAt');
  const [processingRuleSortDirection, setProcessingRuleSortDirection] = useState<'asc' | 'desc'>('desc');
  const [processingRulePage, setProcessingRulePage] = useState(1);
  const [processingRulePageSize, setProcessingRulePageSize] = useState(10);
  const [deleteDurationRuleId, setDeleteDurationRuleId] = useState<string | null>(null);

  // 动态承接能力 & 承接状态控制 (2.2.2 & 2.2.3)
  const [acceptToggle, setAcceptToggle] = useState<boolean>(merchant.status !== '打烊暂停中' && merchant.status !== '暂停接单');
  const [skuMaintenance, setSkuMaintenance] = useState<boolean>(false);
  const [inFlightOrders, setInFlightOrders] = useState<number>(12);
  const [maxConcurrency, setMaxConcurrency] = useState<number>(20);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // 统一承接状态计算 (2.2.3)
  const computeUnifiedStatus = () => {
    if (!acceptToggle) return '禁用';
    if (merchant.status === '熔断管制中' || merchant.status === '风控冻结') return '风险暂停';
    if (merchant.points < 1000) return '积点不足';
    if (skuMaintenance) return 'SKU维护';
    if (inFlightOrders >= maxConcurrency) return '满载';
    if (inFlightOrders >= maxConcurrency * 0.8) return '接近上限';
    return '正常';
  };

  const currentCapacityStatus = computeUnifiedStatus();
  const pointsWallet = merchant.pointsWallet || createDefaultPointsWallet(merchant);

  const handleCopyUAddress = async () => {
    if (!pointsWallet.uAddress) return;
    try {
      await navigator.clipboard.writeText(pointsWallet.uAddress);
      showToast('U地址已复制');
    } catch {
      showToast('U地址复制失败，请手动复制');
    }
  };

  const handleToggleRule = (ruleId: string) => {
    const updated = rules.map(r => {
      if (r.id === ruleId) {
        const next = !r.isActive;
        showToast(`承接能力通道 [${r.ruleCode}] ${next ? '已开启接单' : '已关闭暂停'}`);
        return { ...r, isActive: next };
      }
      return r;
    });
    setRules(updated);
    onUpdateMerchant({
      ...merchant,
      capabilityRules: updated
    });
  };

  const handleSaveRateAdjust = () => {
    if (!selectedRuleForAdjust || !tempAdjustRate) return;
    const rateVal = parseFloat(tempAdjustRate);
    if (isNaN(rateVal)) return;

    const nextRules = rules.map(r => {
      if (r.id === selectedRuleForAdjust.id) {
        return {
          ...r,
          rate: rateVal,
          rateNote: `手动调价 (${rateVal.toFixed(4)})`
        };
      }
      return r;
    });
    setRules(nextRules);
    onUpdateMerchant({
      ...merchant,
      capabilityRules: nextRules
    });
    setShowAdjustRateModal(false);
    showToast(`通道 [${selectedRuleForAdjust.ruleCode}] 承揽折率已更新为 ${rateVal.toFixed(4)}`);
  };

  const handleToggleEmergencyFuse = () => {
    const isCircuit = merchant.status === '熔断管制中';
    const nextStatus = isCircuit ? '在线接单中' : '熔断管制中';
    onUpdateMerchant({
      ...merchant,
      status: nextStatus
    });
    setShowFuseModal(false);
    showToast(isCircuit ? '已解冻恢复商户接单派单权限' : '已对商户执行紧急熔断暂停派单');
  };

  const handleAddTag = () => {
    if (newTagInput.trim() && !merchant.tags.includes(newTagInput.trim())) {
      const updatedTags = [...merchant.tags, newTagInput.trim()];
      onUpdateMerchant({
        ...merchant,
        tags: updatedTags
      });
      setNewTagInput('');
      setShowTagModal(false);
      showToast(`已成功添加商户画像标签: ${newTagInput.trim()}`);
    }
  };

  const handleRemoveTag = (tag: string) => {
    const updatedTags = merchant.tags.filter(t => t !== tag);
    onUpdateMerchant({
      ...merchant,
      tags: updatedTags
    });
    showToast(`已移除标签: ${tag}`);
  };

  const persistProcessingConfigs = (nextConfigs: MerchantProcessingCardRule[]) => {
    setProcessingConfigs(nextConfigs);
    onUpdateMerchant({ ...merchant, processingRuleConfigs: nextConfigs });
  };

  const selectedProcessingConfig = processingConfigs.find(config => config.cardName === selectedProcessingCard);

  const filteredProcessingRules = selectedProcessingConfig?.durationRules.filter(rule => {
    const conditions = [
      ...rule.countries,
      ...rule.cardHeads,
      ...rule.cardTypes,
      ...rule.speeds,
      ...rule.denominationTypes,
      formatDenominationRule(rule)
    ].join(' ').toLowerCase();
    if (processingRuleSearch.trim() && !conditions.includes(processingRuleSearch.trim().toLowerCase())) return false;
    if (processingRuleStatus === '启用' && !rule.isActive) return false;
    if (processingRuleStatus === '禁用' && rule.isActive) return false;
    return true;
  }) || [];

  const sortedProcessingRules = [...filteredProcessingRules].sort((left, right) => {
    const result = left[processingRuleSortField].localeCompare(right[processingRuleSortField]);
    return processingRuleSortDirection === 'asc' ? result : -result;
  });
  const processingRuleTotalPages = Math.max(1, Math.ceil(sortedProcessingRules.length / processingRulePageSize));
  const currentProcessingRulePage = Math.min(processingRulePage, processingRuleTotalPages);
  const paginatedProcessingRules = sortedProcessingRules.slice(
    (currentProcessingRulePage - 1) * processingRulePageSize,
    currentProcessingRulePage * processingRulePageSize
  );

  useEffect(() => {
    if (processingRulePage > processingRuleTotalPages) setProcessingRulePage(processingRuleTotalPages);
  }, [processingRulePage, processingRuleTotalPages]);

  const handleProcessingRuleSort = (field: 'createdAt' | 'updatedAt') => {
    if (processingRuleSortField === field) {
      setProcessingRuleSortDirection(direction => direction === 'desc' ? 'asc' : 'desc');
    } else {
      setProcessingRuleSortField(field);
      setProcessingRuleSortDirection('desc');
    }
    setProcessingRulePage(1);
  };

  const handleToggleException = (cardName: string) => {
    const nextConfigs = processingConfigs.map(config => (
      config.cardName === cardName ? { ...config, allowException: !config.allowException } : config
    ));
    persistProcessingConfigs(nextConfigs);
    showToast(`${cardName} 已${selectedProcessingConfig?.allowException ? '关闭' : '开启'}提交异常`);
  };

  const handleUpdateCardBaseRule = (updates: Partial<MerchantProcessingCardRule>) => {
    if (!selectedProcessingConfig) return;
    persistProcessingConfigs(processingConfigs.map(config => (
      config.cardName === selectedProcessingConfig.cardName ? { ...config, ...updates } : config
    )));
  };

  const handleToggleDurationRuleStatus = (ruleId: string) => {
    if (!selectedProcessingConfig) return;
    const now = formatRuleTime();
    persistProcessingConfigs(processingConfigs.map(config => (
      config.cardName === selectedProcessingConfig.cardName
        ? { ...config, durationRules: config.durationRules.map(rule => rule.id === ruleId ? { ...rule, isActive: !rule.isActive, updatedAt: now } : rule) }
        : config
    )));
  };

  const openDurationDrawer = (rule?: MerchantProcessingDurationRule) => {
    if (rule) {
      const { id, updatedAt, createdAt, ...draft } = rule;
      setEditingDurationRuleId(id);
      setDraftDurationRule(draft);
    } else {
      setEditingDurationRuleId(null);
      setDraftDurationRule(createDraftDurationRule());
    }
    setShowDurationDrawer(true);
  };

  const handleSaveDurationRule = () => {
    if (!selectedProcessingConfig) return;
    const now = formatRuleTime();
    const durationRules = editingDurationRuleId
      ? selectedProcessingConfig.durationRules.map(rule => rule.id === editingDurationRuleId
        ? { ...rule, ...draftDurationRule, updatedAt: now }
        : rule)
      : [...selectedProcessingConfig.durationRules, {
        ...draftDurationRule,
        id: `process-${Date.now()}`,
        updatedAt: now,
        createdAt: now
      }];
    persistProcessingConfigs(processingConfigs.map(config => (
      config.cardName === selectedProcessingConfig.cardName ? { ...config, durationRules } : config
    )));
    setProcessingRulePage(1);
    setShowDurationDrawer(false);
    showToast(editingDurationRuleId ? '时长规则已更新' : '时长规则已新增');
  };

  const handleDeleteDurationRule = (ruleId: string) => {
    if (!selectedProcessingConfig) return;
    const nextConfigs = processingConfigs.map(config => (
      config.cardName === selectedProcessingConfig.cardName
        ? { ...config, durationRules: config.durationRules.filter(rule => rule.id !== ruleId) }
        : config
    ));
    persistProcessingConfigs(nextConfigs);
    setDeleteDurationRuleId(null);
    showToast('时长规则已删除');
  };

  const filteredRules = rules.filter(r => {
    if (ruleSearch.trim()) {
      const q = ruleSearch.toLowerCase();
      if (!r.cardName.toLowerCase().includes(q) && !r.ruleCode.toLowerCase().includes(q) && !r.currency.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (ruleCountry !== '全部') {
      if (!r.country.includes(ruleCountry) && !r.countryCode.includes(ruleCountry)) {
        return false;
      }
    }
    if (ruleMedia !== '全部') {
      if (!r.mediaType.includes(ruleMedia)) return false;
    }
    if (ruleStatus !== '全部') {
      if (ruleStatus === '启用中' && !r.isActive) return false;
      if (ruleStatus === '已暂停' && r.isActive) return false;
    }
    return true;
  });

  const activeRulesCount = rules.filter(r => r.isActive).length;
  const pausedRulesCount = rules.filter(r => !r.isActive).length;

  return (
    <div className="flex flex-col w-full text-slate-800 antialiased space-y-4 pb-16 text-xs">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900/90 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 backdrop-blur border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 面包屑与顶部核心动作条 */}
      <section className="w-full px-5 py-3 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium min-w-0">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors shrink-0 cursor-pointer font-semibold"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>返回商户列表</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500 shrink-0">商户档案与承接工作台</span>
          <span className="text-slate-300">/</span>
          <div className="inline-flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-slate-900 truncate">{merchant.fullName}</span>
            <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-bold font-mono">
              {merchant.mid}
            </span>
          </div>
        </div>

        {/* 动作按钮簇 */}
        <div className="flex items-center flex-wrap gap-2 shrink-0 text-xs">
          <button
            onClick={() => {
              setSelectedRuleForAdjust(rules[0]);
              setTempAdjustRate(rules[0]?.rate.toString() || '6.8450');
              setShowAdjustRateModal(true);
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">price_change</span>
            <span>调整报价折率</span>
          </button>
          <button
            onClick={() => setShowMarginModal(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">assured_workload</span>
            <span>催补质押保证金</span>
          </button>
          <button
            onClick={() => setShowFuseModal(true)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer shadow-2xs ${
              merchant.status === '熔断管制中'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {merchant.status === '熔断管制中' ? 'lock_open' : 'gavel'}
            </span>
            <span>{merchant.status === '熔断管制中' ? '解除熔断管制' : '紧急暂停派单 (熔断)'}</span>
          </button>
        </div>
      </section>

      {/* 顶部商户全景与承接状态核心 Summary 卡片 */}
      <section className="w-full">
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 gap-4 border-b border-slate-100">
            <div className="flex items-start md:items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0 shadow-2xs">
                <span className="material-symbols-outlined text-[28px]">apartment</span>
              </div>
              <div className="flex flex-col space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xl font-bold text-slate-900">{merchant.fullName}</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold">
                    <span className="material-symbols-outlined text-[13px]">military_tech</span>
                    {merchant.vipTag || '核心商户 (Tier-1)'}
                  </span>

                  {/* 2.2.3 统一承接状态勋章 */}
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    currentCapacityStatus === '正常' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                    currentCapacityStatus === '接近上限' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                    currentCapacityStatus === '满载' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                    currentCapacityStatus === '积点不足' ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                    'bg-slate-100 text-slate-700 border border-slate-300'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                    <span>承接状态: {currentCapacityStatus}</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-slate-500 text-xs">
                  <span>商户编号: <strong className="text-slate-900 font-mono">{merchant.mid}</strong></span>
                </div>
              </div>
            </div>

            {/* 当前能不能接卡遥测卡片 */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 shrink-0">
              <span className="text-slate-500 font-semibold block text-[11px]">此刻能否接卡判定 (Dispatch Eligibility)</span>
              <div className="flex items-center gap-2 font-bold text-xs">
                {currentCapacityStatus === '正常' || currentCapacityStatus === '接近上限' ? (
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    可纳入派单池 (Eligible)
                  </span>
                ) : (
                  <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">cancel</span>
                    不可派单 (Ineligible: {currentCapacityStatus})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 商户档案 Tab */}
      <section className="w-full">
        <div className="bg-white rounded-xl border border-slate-200/80 px-4 pt-1 shadow-xs flex items-center gap-1 overflow-x-auto text-xs scrollbar-none">
          {[
            { id: 1, label: '基础信息', icon: 'info' },
            { id: 2, label: '承接能力', icon: 'layers', badge: rules.length },
            { id: 3, label: '当前状态', icon: 'speed', badge: currentCapacityStatus, badgeClass: currentCapacityStatus === '正常' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800' },
            { id: 4, label: '报价', icon: 'request_quote' },
            { id: 5, label: '履约', icon: 'query_stats' },
            { id: 6, label: '资金账户', icon: 'account_balance' },
            { id: 10, label: '积点钱包管理', icon: 'account_balance_wallet' },
            { id: 7, label: '异常', icon: 'warning', badge: merchant.disputeCount || 0 },
            { id: 8, label: '工具权限', icon: 'build' },
            { id: 9, label: '做卡规则', icon: 'tune', badge: processingConfigs.length },
            { id: 11, label: '接卡员工', icon: 'badge', badge: 'NEW' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-semibold rounded-t-lg transition-colors shrink-0 flex items-center gap-1.5 relative cursor-pointer ${
                  isActive
                    ? 'text-blue-700 bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    tab.badgeClass || (isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700')
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Tab 1: 基础信息 */}
      {activeTab === 1 && (
        <section className="w-full space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">verified</span>
                <h3 className="font-bold text-slate-900 text-sm">商户基础信息</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-slate-600">
                <div><span className="text-slate-400 block mb-0.5">商户ID:</span><span className="font-bold text-slate-800 font-mono">{merchant.mid}</span></div>
                <div><span className="text-slate-400 block mb-0.5">商户全称:</span><span className="font-semibold text-slate-800">{merchant.fullName}</span></div>
                <div><span className="text-slate-400 block mb-0.5">联系人信息:</span><span className="font-semibold text-slate-800">{merchant.legalPerson} <span className="ml-1.5 font-mono text-slate-600">{merchant.phone}</span></span></div>
                <div><span className="text-slate-400 block mb-0.5">合作在网:</span><span className="font-semibold text-blue-700 font-mono">{merchant.daysActive} 天</span></div>
                <div><span className="text-slate-400 block mb-0.5">对公邮箱:</span><span className="font-mono text-slate-700">{merchant.email}</span></div>
                {merchant.remark && <div className="col-span-2"><span className="text-slate-400 block mb-0.5">备注:</span><span className="text-slate-700">{merchant.remark}</span></div>}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">hub</span>
                <h3 className="font-bold text-slate-900 text-sm">直连网络与技术接口</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-slate-600">
                <div><span className="text-slate-400 block mb-0.5">直连席位:</span><span className="text-blue-700 font-bold font-mono">{merchant.directSeatNode || 'NODE-CN-SH-DIRECT-09'}</span></div>
                <div><span className="text-slate-400 block mb-0.5">接口延迟:</span><span className="font-bold text-emerald-700 font-mono">{merchant.apiLatency}</span></div>
                <div><span className="text-slate-400 block mb-0.5">AppID:</span><span className="font-mono text-slate-800">{merchant.appId}</span></div>
                <div><span className="text-slate-400 block mb-0.5">清算周期:</span><span className="font-semibold text-emerald-700">{merchant.settlementCycle}</span></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === 11 && <MerchantEmployeesTab />}

      {/* Tab 10: 积点钱包管理 */}
      {activeTab === 10 && (
        <section className="w-full space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[19px]">account_balance_wallet</span>
                <h3 className="font-bold text-slate-900 text-sm">积点钱包管理</h3>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${
                pointsWallet.status === '正常'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {pointsWallet.status}
              </span>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
                <div className="text-[11px] text-slate-500 font-semibold">剩余可用积点</div>
                <div className="mt-1.5 text-lg font-bold text-slate-900 font-mono">{formatPoints(pointsWallet.availablePoints)}</div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
                <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 font-semibold">
                  <span>冻结积点</span>
                  <button
                    type="button"
                    onClick={() => setShowFrozenPointsDrawer(true)}
                    className="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                  >
                    <span>明细</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  </button>
                </div>
                <div className="mt-1.5 text-lg font-bold text-amber-700 font-mono">{formatPoints(pointsWallet.frozenPoints)}</div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
                <div className="text-[11px] text-slate-500 font-semibold">累计充值总积点（含已撤回）</div>
                <div className="mt-1.5 text-lg font-bold text-slate-900 font-mono">{formatPoints(pointsWallet.totalRechargedPoints)}</div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
                <div className="text-[11px] text-slate-500 font-semibold">已撤回总积点</div>
                <div className="mt-1.5 text-lg font-bold text-slate-900 font-mono">{formatPoints(pointsWallet.withdrawnPoints)}</div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
                <div className="text-[11px] text-slate-500 font-semibold">已结算积点（交易结算）</div>
                <div className="mt-1.5 text-lg font-bold text-slate-900 font-mono">{formatPoints(pointsWallet.settledPoints)}</div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 sm:col-span-2 lg:col-span-1">
                <div className="text-[11px] text-slate-500 font-semibold">U地址</div>
                {pointsWallet.uAddress ? (
                  <div className="mt-1.5 flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs text-slate-800 truncate" title={pointsWallet.uAddress}>{pointsWallet.uAddress}</span>
                    <button
                      type="button"
                      aria-label="复制U地址"
                      onClick={handleCopyUAddress}
                      className="inline-flex items-center justify-center w-7 h-7 shrink-0 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">content_copy</span>
                    </button>
                  </div>
                ) : (
                  <div className="mt-1.5 text-sm text-slate-400">未配置</div>
                )}
              </div>
            </div>

            {pointsWallet.status === '已被禁用' && pointsWallet.disabledInfo && (
              <div className="mx-5 mb-5 rounded-lg border border-rose-200 bg-rose-50/70 p-4">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                  <span className="material-symbols-outlined text-[17px]">block</span>
                  <span>钱包禁用信息</span>
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div><span className="block text-rose-600/70 mb-0.5">禁用原因</span><span className="font-semibold text-rose-900">{pointsWallet.disabledInfo.reason}</span></div>
                  <div><span className="block text-rose-600/70 mb-0.5">操作时间</span><span className="font-mono text-rose-900">{pointsWallet.disabledInfo.operatedAt}</span></div>
                  <div><span className="block text-rose-600/70 mb-0.5">操作人</span><span className="font-semibold text-rose-900">{pointsWallet.disabledInfo.operator}</span></div>
                </div>
              </div>
            )}

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60 text-[11px] text-slate-500">
              提示：积点充值明细、U地址配置、积点充值撤回等请联系财务处理
            </div>
          </div>
        </section>
      )}

      {/* Tab 2: 承接能力 (2.2.1 基础承接能力标准模型) */}
      {activeTab === 2 && (
        <section className="w-full space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">view_module</span>
                <span className="font-bold text-slate-900 text-sm">基础承接能力规则矩阵 (Theoretical Capacity)</span>
              </div>
              <span className="text-slate-500 font-mono">
                标准模型: Merchant × Brand × Country × Card Form × Speed × Denomination
              </span>
            </div>
            <p className="text-slate-500 text-[11px]">
              定义本商户理论上能够接哪些卡。最终派单将结合【当前状态】下的动态负载与积点综合判断。
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[11px] font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3">Merchant ID</th>
                    <th className="py-2.5 px-3">Brand (卡种)</th>
                    <th className="py-2.5 px-3">Country / Currency</th>
                    <th className="py-2.5 px-3">Card Form (卡介质)</th>
                    <th className="py-2.5 px-3">Speed (交易速度)</th>
                    <th className="py-2.5 px-3">Min Value (下限)</th>
                    <th className="py-2.5 px-3">Max Value (上限)</th>
                    <th className="py-2.5 px-3">Multiple (倍数)</th>
                    <th className="py-2.5 px-3">Max/Order (单单最大)</th>
                    <th className="py-2.5 px-3">Max Continuous (连续卡)</th>
                    <th className="py-2.5 px-3 text-right">Status (状态)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-mono">
                  {filteredRules.map(rule => (
                    <tr key={rule.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-500">{merchant.mid}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{rule.cardName}</td>
                      <td className="py-2 px-3 text-slate-700">{rule.country} ({rule.currency})</td>
                      <td className="py-2 px-3 text-indigo-700">{rule.mediaType}</td>
                      <td className="py-2 px-3 text-emerald-700">Fast (秒级)</td>
                      <td className="py-2 px-3 text-slate-800">$25</td>
                      <td className="py-2 px-3 text-slate-800">$500</td>
                      <td className="py-2 px-3 text-slate-600">50 倍数</td>
                      <td className="py-2 px-3 text-slate-600">5 张</td>
                      <td className="py-2 px-3 text-slate-600">4 张</td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => handleToggleRule(rule.id)}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                            rule.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {rule.isActive ? '可接单' : '停止接单'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Tab 3: 当前状态 (2.2.2 动态承接能力 & 2.2.3 承接状态) */}
      {activeTab === 3 && (
        <section className="w-full space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">speed</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">动态承接能力与实时负载遥测</h3>
                  <p className="text-slate-500 text-[11px]">静态配置能接 ≠ 此刻一定可以接。派单系统仅从【正常】与【接近上限】池中自动筛选。</p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-slate-500">综合判定结论:</span>
                <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                  currentCapacityStatus === '正常' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {currentCapacityStatus}
                </span>
              </div>
            </div>

            {/* 7 大动态条件卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 条件 1 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-slate-500 font-semibold text-[11px]">
                  <span>1. 当前接单开关</span>
                  <span className="material-symbols-outlined text-[16px] text-blue-600">toggle_on</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{acceptToggle ? '开启接单中' : '商户接卡业务已被禁用'}</span>
                  <button
                    onClick={() => setAcceptToggle(!acceptToggle)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                      acceptToggle ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    切换开关
                  </button>
                </div>
              </div>

              {/* 条件 2 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-slate-500 font-semibold text-[11px]">
                  <span>2. 当前可用积点 (Staking)</span>
                  <span className="material-symbols-outlined text-[16px] text-amber-600">toll</span>
                </div>
                <div className="font-mono font-bold text-slate-900 text-sm">
                  {merchant.points.toLocaleString()} PTS
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold">
                  {merchant.points >= 1000 ? '✅ 质押充裕 (足够冲销)' : '❌ 积点不足 (需补缴)'}
                </div>
              </div>

              {/* 条件 3 & 4 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-slate-500 font-semibold text-[11px]">
                  <span>3. 处理中订单与最大并发</span>
                  <span className="material-symbols-outlined text-[16px] text-purple-600">cloud_sync</span>
                </div>
                <div className="font-mono font-bold text-slate-900 text-sm">
                  {inFlightOrders} / {maxConcurrency} 单
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  负载率: {((inFlightOrders / maxConcurrency) * 100).toFixed(0)}%
                </div>
              </div>

              {/* 条件 5 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-slate-500 font-semibold text-[11px]">
                  <span>4. 异常管制状态</span>
                  <span className="material-symbols-outlined text-[16px] text-rose-600">security</span>
                </div>
                <div className="font-bold text-slate-900">
                  {merchant.status === '熔断管制中' ? '⚠️ 风控熔断暂停' : '✅ 正常无管制'}
                </div>
              </div>

              {/* 条件 6 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-slate-500 font-semibold text-[11px]">
                  <span>5. SKU 临时维护状态</span>
                  <span className="material-symbols-outlined text-[16px] text-indigo-600">build</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{skuMaintenance ? '维护中' : '正常接卡'}</span>
                  <button
                    onClick={() => setSkuMaintenance(!skuMaintenance)}
                    className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                  >
                    切换维护
                  </button>
                </div>
              </div>

              {/* 条件 7 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 col-span-1 sm:col-span-3">
                <div className="flex justify-between items-center text-slate-500 font-semibold text-[11px]">
                  <span>6. 最近履约质量 (SLA & 成功率)</span>
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                </div>
                <div className="font-mono text-slate-800 text-xs">
                  接单成功率: <strong className="text-emerald-700">99.2%</strong> · SLA 均耗: <strong className="text-blue-700">{merchant.avgTimeSec}s</strong> · 超时率: <strong className="text-slate-700">0.02%</strong> (满足派单门槛)
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab 4: 报价 */}
      {activeTab === 4 && (
        <section className="w-full space-y-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex justify-between items-center">
            <span className="font-bold text-slate-900 text-sm">商户报价明细与折率微调</span>
            <button
              onClick={() => {
                setSelectedRuleForAdjust(rules[0]);
                setTempAdjustRate(rules[0]?.rate.toString() || '6.8450');
                setShowAdjustRateModal(true);
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
            >
              调整买入折率
            </button>
          </div>
        </section>
      )}

      {/* Tab 5: 履约 */}
      {activeTab === 5 && (
        <section className="w-full space-y-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="font-bold text-slate-900 text-sm">履约质量 SLA 统计与接单完成率</span>
          </div>
        </section>
      )}

      {/* Tab 6: 资金账户 */}
      {activeTab === 6 && (
        <section className="w-full space-y-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="font-bold text-slate-900 text-sm">资金账户与质押保证金充值履历</span>
          </div>
        </section>
      )}

      {/* Tab 7: 异常 */}
      {activeTab === 7 && (
        <section className="w-full space-y-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="font-bold text-slate-900 text-sm">异常事件与客诉争议处理记录</span>
          </div>
        </section>
      )}

      {/* Tab 8: 工具权限 (2.2.4 只查看，引导至卡工具管理 ➔ 商户授权) */}
      {activeTab === 8 && (
        <section className="w-full space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-700">info</span>
              <span>
                此处为工具权限<strong>只读视图</strong>。如需进行授权开通、变更或解绑，请前往专属配置入口：
              </span>
            </div>
            <button
              onClick={() => showToast('引导跳转：请在左侧菜单点击【08 卡工具管理 ➔ 商户授权】进行授权修改')}
              className="px-3 py-1.5 bg-amber-700 text-white hover:bg-amber-800 rounded-lg font-semibold cursor-pointer shrink-0"
            >
              前往卡工具管理 ➔ 商户授权
            </button>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">已调阅商户工具授权现状 (Read-Only)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="text-slate-500 font-semibold block text-[11px]">Apple 官方余额查验 API</span>
                <span className="text-emerald-700 font-bold">✅ 已授权 (直连调阅)</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="text-slate-500 font-semibold block text-[11px]">Steam 面额及扫卡验真</span>
                <span className="text-emerald-700 font-bold">✅ 已授权 (专线)</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="text-slate-500 font-semibold block text-[11px]">Google Play 余额补全</span>
                <span className="text-slate-500 font-bold">未授权</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab 9: 做卡规则 */}
      {activeTab === 9 && (
        <section className="w-full grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-4">
          <aside className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden h-fit">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600 text-[17px]">category</span>
                <span className="font-bold text-slate-900 text-sm">经营卡类</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{processingConfigs.length}</span>
            </div>
            <div className="p-2 space-y-1">
              {processingConfigs.length > 0 ? processingConfigs.map(config => (
                <button
                  key={config.cardName}
                  onClick={() => { setSelectedProcessingCard(config.cardName); setProcessingRulePage(1); }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                    selectedProcessingCard === config.cardName
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{config.cardName}</span>
                  <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full ${
                    config.allowException ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>{config.durationRules.length}</span>
                </button>
              )) : (
                <div className="px-3 py-8 text-center text-slate-400 text-[11px]">未配置经营卡类</div>
              )}
            </div>
          </aside>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            {selectedProcessingConfig ? (
              <>
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[19px]">tune</span>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{selectedProcessingConfig.cardName} 做卡规则</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">规则可并存，执行时按匹配颗粒度与更新时间取值</div>
                  </div>
                </div>

                <div className="p-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-blue-600 text-[17px]">settings</span>
                    <span className="font-bold text-slate-900 text-sm">基础规则</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-2.5 whitespace-nowrap">
                      <span className="font-semibold text-slate-800">是否允许提交异常</span>
                      <CompactSwitch checked={selectedProcessingConfig.allowException} onChange={() => handleToggleException(selectedProcessingConfig.cardName)} label="是否允许提交异常" />
                      <span className={`text-[11px] font-semibold ${selectedProcessingConfig.allowException ? 'text-emerald-700' : 'text-slate-500'}`}>{selectedProcessingConfig.allowException ? '是' : '否'}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 whitespace-nowrap">
                      <span className="font-semibold text-slate-800">自助延时控制</span>
                      <CompactSwitch checked={selectedProcessingConfig.selfDelayEnabled} onChange={() => handleUpdateCardBaseRule({ selfDelayEnabled: !selectedProcessingConfig.selfDelayEnabled })} label="自助延时控制" />
                      <span className={`text-[11px] font-semibold ${selectedProcessingConfig.selfDelayEnabled ? 'text-emerald-700' : 'text-slate-500'}`}>{selectedProcessingConfig.selfDelayEnabled ? '是' : '否'}</span>
                      {selectedProcessingConfig.selfDelayEnabled && (
                        <span className="flex items-center gap-1.5 pl-3 ml-1 border-l border-slate-200">
                          <span className="text-xs font-medium text-slate-700">延时时长</span>
                          <input type="number" min="1" value={selectedProcessingConfig.selfDelayMinutes} onChange={e => handleUpdateCardBaseRule({ selfDelayMinutes: Math.max(1, Number(e.target.value)) })} className="w-20 h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 font-mono" />
                          <span className="text-xs text-slate-500">分</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex items-center gap-2"><span className="material-symbols-outlined text-blue-600 text-[17px]">rule_settings</span><span className="font-bold text-slate-900 text-sm">做卡规则</span><span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">{filteredProcessingRules.length}</span></div>
                    <button onClick={() => openDurationDrawer()} className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer"><span className="material-symbols-outlined text-[15px]">add</span>新增规则</button>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative w-full sm:w-64 sm:flex-none"><span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">search</span><input value={processingRuleSearch} onChange={e => { setProcessingRuleSearch(e.target.value); setProcessingRulePage(1); }} placeholder="筛选规则条件" className="w-full h-8 pl-8 pr-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-blue-500" /></div>
                    <select value={processingRuleStatus} onChange={e => { setProcessingRuleStatus(e.target.value); setProcessingRulePage(1); }} className="h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"><option>全部</option><option>启用</option><option>禁用</option></select>
                    <button onClick={() => { setProcessingRuleSearch(''); setProcessingRuleStatus('全部'); setProcessingRulePage(1); }} className="h-8 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer">重置</button>
                    <button onClick={() => showToast(`已筛选出 ${filteredProcessingRules.length} 条规则`)} className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer">查询</button>
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[1080px] text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 text-[11px] font-semibold border-b border-slate-200">
                            <th className="px-3 py-2.5">国家</th>
                            <th className="px-3 py-2.5">卡头 / 类型 / 速度</th>
                            <th className="px-3 py-2.5">面值规则</th>
                            <th className="px-3 py-2.5">做卡时长</th>
                            <th className="px-3 py-2.5">售后时长</th>
                            <th className="px-3 py-2.5">状态</th>
                            <th className="px-3 py-2.5" aria-sort={processingRuleSortField === 'createdAt' ? (processingRuleSortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                              <button type="button" onClick={() => handleProcessingRuleSort('createdAt')} className={`inline-flex items-center gap-1 cursor-pointer hover:text-blue-600 ${processingRuleSortField === 'createdAt' ? 'text-blue-600' : ''}`}>
                                创建时间
                                <span className="material-symbols-outlined text-[15px]">{processingRuleSortField === 'createdAt' ? (processingRuleSortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span>
                              </button>
                            </th>
                            <th className="px-3 py-2.5" aria-sort={processingRuleSortField === 'updatedAt' ? (processingRuleSortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                              <button type="button" onClick={() => handleProcessingRuleSort('updatedAt')} className={`inline-flex items-center gap-1 cursor-pointer hover:text-blue-600 ${processingRuleSortField === 'updatedAt' ? 'text-blue-600' : ''}`}>
                                更新时间
                                <span className="material-symbols-outlined text-[15px]">{processingRuleSortField === 'updatedAt' ? (processingRuleSortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span>
                              </button>
                            </th>
                            <th className="px-3 py-2.5 text-right">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {paginatedProcessingRules.length > 0 ? paginatedProcessingRules.map(rule => (
                            <tr key={rule.id} className="hover:bg-slate-50">
                              <td className="px-3 py-3 font-medium text-slate-800">{displayProcessingValues(rule.countries)}</td>
                              <td className="px-3 py-3 text-slate-700"><span>{displayProcessingValues(rule.cardHeads)}</span><span className="mx-1.5 text-slate-300">·</span><span>{displayProcessingValues(rule.cardTypes)}</span><span className="mx-1.5 text-slate-300">·</span><span>{displayProcessingValues(rule.speeds)}</span></td>
                              <td className="px-3 py-3 text-slate-700">{formatDenominationRule(rule)}</td>
                              <td className="px-3 py-3 font-mono font-semibold text-slate-800">{rule.processingDurationSec > 0 ? `${rule.processingDurationSec} 秒` : '未配置'}</td>
                              <td className="px-3 py-3 font-mono font-semibold text-slate-800">{rule.afterSalesDurationMin > 0 ? `${rule.afterSalesDurationMin} 分` : '未配置'}</td>
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-2">
                                  <CompactSwitch checked={rule.isActive} onChange={() => handleToggleDurationRuleStatus(rule.id)} label={`${rule.isActive ? '禁用' : '启用'}该做卡规则`} />
                                  <span className={`text-[11px] font-semibold ${rule.isActive ? 'text-emerald-700' : 'text-slate-500'}`}>{rule.isActive ? '启用' : '禁用'}</span>
                                </div>
                              </td>
                              <td className="px-3 py-3 font-mono text-slate-500 whitespace-nowrap">{rule.createdAt}</td>
                              <td className="px-3 py-3 font-mono text-slate-500 whitespace-nowrap">{rule.updatedAt}</td>
                              <td className="px-3 py-3 text-right whitespace-nowrap"><button onClick={() => openDurationDrawer(rule)} className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer">编辑</button><button onClick={() => setDeleteDurationRuleId(rule.id)} className="ml-3 text-rose-600 hover:text-rose-700 font-semibold cursor-pointer">删除</button></td>
                            </tr>
                          )) : <tr><td colSpan={9} className="py-10 text-center text-slate-400">暂无匹配规则</td></tr>}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50/60 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-end">
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span>共 {sortedProcessingRules.length} 条</span>
                        <select
                          aria-label="每页条数"
                          value={processingRulePageSize}
                          onChange={event => { setProcessingRulePageSize(Number(event.target.value)); setProcessingRulePage(1); }}
                          className="h-7 rounded-md border border-slate-200 bg-white px-2 text-[11px] text-slate-700 outline-none focus:border-blue-500"
                        >
                          <option value={10}>10条/页</option>
                          <option value={50}>50条/页</option>
                          <option value={100}>100条/页</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label="上一页"
                          disabled={currentProcessingRulePage === 1}
                          onClick={() => setProcessingRulePage(page => Math.max(1, page - 1))}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 cursor-pointer hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                        </button>
                        <span className="flex h-7 min-w-7 items-center justify-center rounded-md bg-blue-600 px-2 text-[11px] font-semibold text-white">{currentProcessingRulePage}</span>
                        <span className="px-1 text-[11px] text-slate-400">/ {processingRuleTotalPages}</span>
                        <button
                          type="button"
                          aria-label="下一页"
                          disabled={currentProcessingRulePage === processingRuleTotalPages}
                          onClick={() => setProcessingRulePage(page => Math.min(processingRuleTotalPages, page + 1))}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 cursor-pointer hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs">请选择经营卡类</div>
            )}
          </div>
        </section>
      )}

      {showFrozenPointsDrawer && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="关闭冻结积点明细"
            onClick={() => setShowFrozenPointsDrawer(false)}
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px] cursor-default"
          />
          <aside className="absolute top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">冻结积点明细</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{merchant.fullName} · {merchant.mid}</div>
              </div>
              <button
                type="button"
                aria-label="关闭"
                onClick={() => setShowFrozenPointsDrawer(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50/70 p-3.5 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-amber-900">当前冻结积点</span>
                <span className="font-mono text-base font-bold text-amber-800">{formatPoints(pointsWallet.frozenPoints)}</span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-[11px] font-semibold border-b border-slate-200">
                        <th className="px-4 py-3">冻结金额</th>
                        <th className="px-4 py-3">冻结时间</th>
                        <th className="px-4 py-3">操作人</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pointsWallet.frozenDetails.length > 0 ? pointsWallet.frozenDetails.map(record => (
                        <tr key={record.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono font-semibold text-amber-700">{formatPoints(record.amount)}</td>
                          <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">{record.frozenAt}</td>
                          <td className="px-4 py-3 text-slate-800">{record.operator}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-12 text-center text-slate-400">暂无冻结记录</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowFrozenPointsDrawer(false)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium text-xs cursor-pointer"
              >
                关闭
              </button>
            </div>
          </aside>
        </div>
      )}

      {showDurationDrawer && selectedProcessingConfig && (
        <div className="fixed inset-0 z-50">
          <button aria-label="关闭" onClick={() => setShowDurationDrawer(false)} className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px] cursor-default" />
          <aside className="absolute top-0 right-0 h-full w-full max-w-4xl bg-white shadow-2xl flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">{editingDurationRuleId ? '编辑做卡规则' : '新增做卡规则'}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{selectedProcessingConfig.cardName}</div>
              </div>
              <button onClick={() => setShowDurationDrawer(false)} className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"><span className="material-symbols-outlined text-[20px]">close</span></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="border border-blue-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-blue-50/60 border-b border-blue-100 flex items-center justify-between">
                  <span className="font-bold text-blue-900 text-sm">{editingDurationRuleId ? '编辑时长规则' : '新增时长规则'}</span>
                  <button onClick={() => { setEditingDurationRuleId(null); setDraftDurationRule(createDraftDurationRule()); }} className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer">清空</button>
                </div>
                <div className="divide-y divide-slate-100">
                  <RuleFormRow label="卡种名称" required>
                    <div className="flex h-9 max-w-xl items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-800">
                      {selectedProcessingConfig.cardName}
                    </div>
                  </RuleFormRow>

                  <RuleFormRow label="国家" required>
                    <MultiSelectDropdown label="选择国家" searchPlaceholder="搜索国家" values={draftDurationRule.countries} options={COUNTRY_OPTIONS} unlimited="不限" onChange={countries => setDraftDurationRule({ ...draftDurationRule, countries })} />
                  </RuleFormRow>

                  <RuleFormRow label="卡头" required>
                    <MultiSelectDropdown label="选择卡头" searchPlaceholder="搜索卡头" values={draftDurationRule.cardHeads} options={CARD_HEAD_OPTIONS} unlimited="不限" onChange={cardHeads => setDraftDurationRule({ ...draftDurationRule, cardHeads })} />
                  </RuleFormRow>

                  <RuleFormRow label="类型" required>
                    <MultiChoiceField values={draftDurationRule.cardTypes} options={CARD_TYPE_OPTIONS} unlimited="不限" onChange={cardTypes => setDraftDurationRule({ ...draftDurationRule, cardTypes })} />
                  </RuleFormRow>

                  <RuleFormRow label="交易速度" required>
                    <MultiChoiceField values={draftDurationRule.speeds} options={SPEED_OPTIONS} unlimited="不限" onChange={speeds => setDraftDurationRule({ ...draftDurationRule, speeds })} />
                  </RuleFormRow>

                  <RuleFormRow label="面值类型" required>
                    <MultiChoiceField values={draftDurationRule.denominationTypes} options={DENOMINATION_TYPE_OPTIONS} unlimited="不限" onChange={denominationTypes => setDraftDurationRule({ ...draftDurationRule, denominationTypes })} />
                  </RuleFormRow>

                  {draftDurationRule.denominationTypes.includes('范围面值') && (
                    <RuleFormRow label="范围面值" required>
                      <div className="flex max-w-xl items-center gap-3">
                        <input aria-label="范围面值最小值" type="number" min="0" value={draftDurationRule.rangeMin ?? ''} onChange={e => setDraftDurationRule({ ...draftDurationRule, rangeMin: Number(e.target.value) })} className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-mono outline-none focus:border-blue-500" placeholder="最小值" />
                        <span className="text-slate-400">—</span>
                        <input aria-label="范围面值最大值" type="number" min="0" value={draftDurationRule.rangeMax ?? ''} onChange={e => setDraftDurationRule({ ...draftDurationRule, rangeMax: Number(e.target.value) })} className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-mono outline-none focus:border-blue-500" placeholder="最大值" />
                      </div>
                    </RuleFormRow>
                  )}

                  {draftDurationRule.denominationTypes.includes('倍数面值') && (
                    <RuleFormRow label="倍数面值" required>
                      <div className="flex max-w-2xl flex-wrap items-center gap-2">
                        <input aria-label="面值倍数" type="number" min="1" value={draftDurationRule.multipleBase ?? ''} onChange={e => setDraftDurationRule({ ...draftDurationRule, multipleBase: Number(e.target.value) })} className="h-9 w-24 rounded-lg border border-slate-200 bg-white px-3 text-xs font-mono outline-none focus:border-blue-500" />
                        <span className="text-xs text-slate-500">的倍数，且范围为</span>
                        <input aria-label="倍数面值最小值" type="number" min="0" value={draftDurationRule.multipleMin ?? ''} onChange={e => setDraftDurationRule({ ...draftDurationRule, multipleMin: Number(e.target.value) })} className="h-9 w-28 rounded-lg border border-slate-200 bg-white px-3 text-xs font-mono outline-none focus:border-blue-500" placeholder="最小值" />
                        <span className="text-slate-400">—</span>
                        <input aria-label="倍数面值最大值" type="number" min="0" value={draftDurationRule.multipleMax ?? ''} onChange={e => setDraftDurationRule({ ...draftDurationRule, multipleMax: Number(e.target.value) })} className="h-9 w-28 rounded-lg border border-slate-200 bg-white px-3 text-xs font-mono outline-none focus:border-blue-500" placeholder="最大值" />
                      </div>
                    </RuleFormRow>
                  )}

                  {draftDurationRule.denominationTypes.includes('指定面值') && (
                    <RuleFormRow label="指定面值" required>
                      <input value={draftDurationRule.specifiedValues ?? ''} onChange={e => setDraftDurationRule({ ...draftDurationRule, specifiedValues: e.target.value })} className="h-9 w-full max-w-xl rounded-lg border border-slate-200 bg-white px-3 text-xs font-mono outline-none focus:border-blue-500" placeholder="多个面值使用 / 分隔，如 200/400/500" />
                    </RuleFormRow>
                  )}

                  <RuleFormRow label="做卡时长">
                    <div className="flex items-center gap-2">
                      <input aria-label="做卡时长" type="number" min="0" value={draftDurationRule.processingDurationSec} onChange={e => setDraftDurationRule({ ...draftDurationRule, processingDurationSec: Number(e.target.value) })} className="h-9 w-40 rounded-lg border border-slate-200 bg-white px-3 text-xs font-mono outline-none focus:border-blue-500" />
                      <span className="text-xs text-slate-500">秒</span>
                    </div>
                  </RuleFormRow>

                  <RuleFormRow label="售后时长">
                    <div className="flex items-center gap-2">
                      <input aria-label="售后时长" type="number" min="0" value={draftDurationRule.afterSalesDurationMin} onChange={e => setDraftDurationRule({ ...draftDurationRule, afterSalesDurationMin: Number(e.target.value) })} className="h-9 w-40 rounded-lg border border-slate-200 bg-white px-3 text-xs font-mono outline-none focus:border-blue-500" />
                      <span className="text-xs text-slate-500">分</span>
                    </div>
                  </RuleFormRow>

                  <RuleFormRow label="状态" required>
                    <div className="flex h-8 items-center gap-2">
                      <CompactSwitch checked={draftDurationRule.isActive} onChange={() => setDraftDurationRule({ ...draftDurationRule, isActive: !draftDurationRule.isActive })} label="规则状态" />
                      <span className={`text-xs font-semibold ${draftDurationRule.isActive ? 'text-emerald-700' : 'text-slate-500'}`}>{draftDurationRule.isActive ? '启用' : '禁用'}</span>
                    </div>
                  </RuleFormRow>
                </div>
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                  <button onClick={() => setShowDurationDrawer(false)} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium text-xs cursor-pointer">取消</button>
                  <button onClick={handleSaveDurationRule} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer">保存规则</button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {deleteDurationRuleId && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-5 py-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-rose-600 text-[22px]">delete_forever</span>
              <div>
                <div className="font-bold text-slate-900 text-sm">删除做卡规则</div>
                <div className="text-xs text-slate-500 mt-1">删除后不可恢复，确定删除该规则？</div>
              </div>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setDeleteDurationRuleId(null)} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium text-xs cursor-pointer">取消</button>
              <button onClick={() => handleDeleteDurationRule(deleteDurationRuleId)} className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs cursor-pointer">确认删除</button>
            </div>
          </div>
        </div>
      )}

      {/* 折率微调 Modal */}
      {showAdjustRateModal && selectedRuleForAdjust && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-sm">调整承揽折率</span>
              <button onClick={() => setShowAdjustRateModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">选中卡种规则</label>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-slate-900">{selectedRuleForAdjust.cardName} ({selectedRuleForAdjust.ruleCode})</div>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">新折率 (买入报价)</label>
                <input
                  type="text"
                  value={tempAdjustRate}
                  onChange={e => setTempAdjustRate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono font-bold text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setShowAdjustRateModal(false)} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer">取消</button>
              <button onClick={handleSaveRateAdjust} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer">保存并生效</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
