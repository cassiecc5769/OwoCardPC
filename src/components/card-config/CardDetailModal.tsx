import React, { useEffect, useState } from 'react';
import { CardEntryElement, CardSkuMasterItem, CardSupportedCountry } from './types';
import { EntryElementModal } from './EntryElementModal';
import { validateEntryRuleConfiguration } from './entryValidation';

interface CardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardSkuMasterItem | null;
  onSave: (card: CardSkuMasterItem) => void;
}

const SPEED_OPTIONS = ['快卡', '慢卡', '网单'];
const MEDIA_OPTIONS = ['卡图', '卡密', '横图', '白图', '现金收据', '借记卡收据', '信用卡收据', '激活小票'];
const DEFAULT_CATEGORIES = ['游戏类', '商超类'];
const COUNTRY_OPTIONS: Omit<CardSupportedCountry, 'cardHeadEnabled' | 'cardHeads'>[] = [
  { code: 'US', name: '美国', nameEn: 'United States', flag: '🇺🇸' },
  { code: 'UK', name: '英国', nameEn: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: '加拿大', nameEn: 'Canada', flag: '🇨🇦' },
  { code: 'NG', name: '尼日利亚', nameEn: 'Nigeria', flag: '🇳🇬' },
  { code: 'GH', name: '加纳', nameEn: 'Ghana', flag: '🇬🇭' },
  { code: 'FI', name: '芬兰', nameEn: 'Finland', flag: '🇫🇮' },
  { code: 'BE', name: '比利时', nameEn: 'Belgium', flag: '🇧🇪' },
  { code: 'PL', name: '波兰', nameEn: 'Poland', flag: '🇵🇱' },
  { code: 'AT', name: '奥地利', nameEn: 'Austria', flag: '🇦🇹' },
  { code: 'IE', name: '爱尔兰', nameEn: 'Ireland', flag: '🇮🇪' },
  { code: 'DE', name: '德国', nameEn: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: '法国', nameEn: 'France', flag: '🇫🇷' },
  { code: 'JP', name: '日本', nameEn: 'Japan', flag: '🇯🇵' },
  { code: 'AU', name: '澳大利亚', nameEn: 'Australia', flag: '🇦🇺' },
  { code: 'IN', name: '印度', nameEn: 'India', flag: '🇮🇳' },
  { code: 'BR', name: '巴西', nameEn: 'Brazil', flag: '🇧🇷' },
  { code: 'AE', name: '阿联酋', nameEn: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'SG', name: '新加坡', nameEn: 'Singapore', flag: '🇸🇬' },
  { code: 'KE', name: '肯尼亚', nameEn: 'Kenya', flag: '🇰🇪' },
  { code: 'ZA', name: '南非', nameEn: 'South Africa', flag: '🇿🇦' },
  { code: 'NL', name: '荷兰', nameEn: 'Netherlands', flag: '🇳🇱' },
  { code: 'ES', name: '西班牙', nameEn: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: '意大利', nameEn: 'Italy', flag: '🇮🇹' },
  { code: 'PT', name: '葡萄牙', nameEn: 'Portugal', flag: '🇵🇹' },
  { code: 'CH', name: '瑞士', nameEn: 'Switzerland', flag: '🇨🇭' },
  { code: 'SE', name: '瑞典', nameEn: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', name: '挪威', nameEn: 'Norway', flag: '🇳🇴' },
  { code: 'DK', name: '丹麦', nameEn: 'Denmark', flag: '🇩🇰' },
  { code: 'CZ', name: '捷克', nameEn: 'Czechia', flag: '🇨🇿' },
  { code: 'HU', name: '匈牙利', nameEn: 'Hungary', flag: '🇭🇺' },
  { code: 'RO', name: '罗马尼亚', nameEn: 'Romania', flag: '🇷🇴' },
  { code: 'GR', name: '希腊', nameEn: 'Greece', flag: '🇬🇷' },
  { code: 'TR', name: '土耳其', nameEn: 'Türkiye', flag: '🇹🇷' },
  { code: 'SA', name: '沙特阿拉伯', nameEn: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'IL', name: '以色列', nameEn: 'Israel', flag: '🇮🇱' },
  { code: 'EG', name: '埃及', nameEn: 'Egypt', flag: '🇪🇬' },
  { code: 'MX', name: '墨西哥', nameEn: 'Mexico', flag: '🇲🇽' },
  { code: 'AR', name: '阿根廷', nameEn: 'Argentina', flag: '🇦🇷' },
  { code: 'NZ', name: '新西兰', nameEn: 'New Zealand', flag: '🇳🇿' },
  { code: 'KR', name: '韩国', nameEn: 'South Korea', flag: '🇰🇷' },
];

const ELEMENT_TYPES = [
  { type: '卡图(Card image)', name: 'Card image', property: '图片' as const },
  { type: '卡密码(Ecode)', name: 'Ecode', property: '文本类' as const },
  { type: '卡密码(PIN)', name: 'PIN', property: '文本类' as const },
  { type: '有效期(Expiration Date)', name: 'Expiration Date', property: '文本类' as const },
  { type: '密码(CVV)', name: 'CVV', property: '文本类' as const },
  { type: '现金收据(Cash Receipt)', name: 'Cash Receipt', property: '图片' as const },
  { type: '借记卡收据(Debit Card Receipt)', name: 'Debit Card Receipt', property: '图片' as const },
  { type: '信用卡收据(Credit Card Receipt)', name: 'Credit Card Receipt', property: '图片' as const },
  { type: '激活小票(Activation Slip)', name: 'Activation Slip', property: '图片' as const },
];

type EntryDraft = Omit<CardEntryElement, 'id'>;

interface CardFormState {
  nameCn: string;
  nameEn: string;
  category: string;
  minAmount: string;
  maxAmount: string;
  commonValues: number[];
  quantity: '单卡' | '多卡';
  maxCards: number;
  speeds: string[];
  media: string[];
  entryElements: CardEntryElement[];
  supportCountries: CardSupportedCountry[];
}

const newId = () => `element-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const timestamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19);
const defaultEntry = (): CardEntryElement => ({
  id: newId(), type: '卡图(Card image)', name: 'Card image', property: '图片', prompt: 'Enter a Valid Card image',
  required: false, valueRule: '限制', maxImages: 20,
});
const draftFromType = (type = ELEMENT_TYPES[0].type): EntryDraft => {
  const meta = ELEMENT_TYPES.find((item) => item.type === type) || ELEMENT_TYPES[0];
  const isCardImage = meta.name === 'Card image';
  return { type: meta.type, name: meta.name, property: meta.property, prompt: `Enter a Valid ${meta.name}`, required: false, valueRule: isCardImage ? '限制' : '不限', maxImages: meta.property === '图片' ? (isCardImage ? 20 : 1) : undefined, allowedFormats: [] };
};

const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean; hint?: string }> = ({ children, required, hint }) => (
  <label className="font-semibold text-slate-800 block mb-1.5">
    {children} {required && <span className="text-rose-500">*</span>}
    {hint && <span className="font-normal text-slate-400 ml-1.5">{hint}</span>}
  </label>
);

const OptionChips: React.FC<{ options: string[]; selected: string[]; onChange: (next: string[]) => void }> = ({ options, selected, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((option) => {
      const isSelected = selected.includes(option);
      return <button key={option} type="button" onClick={() => onChange(isSelected ? selected.filter((item) => item !== option) : [...selected, option])} className={`h-7 px-2.5 rounded-md border text-xs transition-colors cursor-pointer ${isSelected ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
        <span className="material-symbols-outlined align-[-3px] text-[14px] mr-1">{isSelected ? 'check_box' : 'check_box_outline_blank'}</span>{option}
      </button>;
    })}
  </div>
);

export const CardDetailModal: React.FC<CardDetailModalProps> = ({ isOpen, onClose, card, onSave }) => {
  const isEditing = Boolean(card);
  const [form, setForm] = useState<CardFormState>({ nameCn: '', nameEn: '', category: '商超类', minAmount: '', maxAmount: '', commonValues: [], quantity: '单卡', maxCards: 20, speeds: [], media: [], entryElements: [defaultEntry()], supportCountries: [] });
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [commonInput, setCommonInput] = useState('');
  const [logoName, setLogoName] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [error, setError] = useState('');
  const [entryDraft, setEntryDraft] = useState<EntryDraft>(draftFromType());
  const [entryError, setEntryError] = useState('');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [isElementModalOpen, setIsElementModalOpen] = useState(false);
  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState(false);
  const [pendingCountryCodes, setPendingCountryCodes] = useState<string[]>([]);
  const [draggingCountryCode, setDraggingCountryCode] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const speed = card?.transactionElements?.find((item) => item.category === '速度')?.values || [];
    const media = card?.transactionElements?.find((item) => item.category === '介质')?.values || [];
    const category = card?.category || '商超类';
    setCategories((previous) => previous.includes(category) ? previous : [...previous, category]);
    setForm({
      nameCn: card?.subTitle || '', nameEn: card?.brandName || '', category,
      minAmount: card ? String(card.minAmount) : '', maxAmount: card ? String(card.maxAmount) : '',
      commonValues: card?.commonFaceValues || card?.ladders.filter((item) => item.enabled).map((item) => item.amount) || [],
      quantity: card?.quantity || '单卡', maxCards: card?.maxCards || (card?.quantity === '多卡' ? 20 : 1), speeds: speed, media,
      entryElements: card?.entryElements?.length ? card.entryElements : [defaultEntry()],
      supportCountries: card?.supportCountries || [],
    });
    setLogoName(card?.logoName || (card ? '已配置卡 logo' : ''));
    setLogoPreview('');
    setCommonInput(''); setError(''); setAddingCategory(false); setNewCategory(''); setIsElementModalOpen(false); setIsCountryPickerOpen(false); setPendingCountryCodes([]);
  }, [card, isOpen]);

  if (!isOpen) return null;

  const updateForm = (patch: Partial<CardFormState>) => setForm((previous) => ({ ...previous, ...patch }));
  const toggleRadio = (value: '单卡' | '多卡') => updateForm({ quantity: value });

  const addCommonValue = () => {
    const amount = Number(commonInput);
    if (!Number.isInteger(amount) || amount <= 0) return setError('常见面值必须为正整数');
    if (form.commonValues.includes(amount)) return setError('该常见面值已存在');
    if (form.commonValues.length >= 10) return setError('最多可添加 10 个常见面值');
    updateForm({ commonValues: [...form.commonValues, amount].sort((a, b) => a - b) });
    setCommonInput(''); setError('');
  };

  const addCategory = () => {
    const value = newCategory.trim();
    if (!value) return;
    if (!categories.includes(value)) setCategories((previous) => [...previous, value]);
    updateForm({ category: value }); setNewCategory(''); setAddingCategory(false);
  };

  const openNewElement = () => { setEditingEntryId(null); setEntryDraft(draftFromType()); setEntryError(''); setIsElementModalOpen(true); };
  const openEditElement = (item: CardEntryElement) => { const { id, ...draft } = item; setEditingEntryId(id); setEntryDraft(draft); setEntryError(''); setIsElementModalOpen(true); };
  const changeElementType = (type: string) => { setEntryDraft(draftFromType(type)); setEntryError(''); };
  const saveEntry = () => {
    if (!entryDraft.name.trim() || !entryDraft.prompt.trim()) return setEntryError('请完整填写要素名称与录入提示词');
    const ruleError = validateEntryRuleConfiguration(entryDraft);
    if (ruleError) return setEntryError(ruleError);
    const element: CardEntryElement = { ...entryDraft, id: editingEntryId || newId() };
    updateForm({ entryElements: editingEntryId ? form.entryElements.map((item) => item.id === editingEntryId ? element : item) : [...form.entryElements, element] });
    setIsElementModalOpen(false); setEntryError(''); setError('');
  };

  const openCountryPicker = () => {
    setPendingCountryCodes(form.supportCountries.map((country) => country.code));
    setIsCountryPickerOpen(true);
  };
  const confirmCountries = () => {
    const existing = new Map(form.supportCountries.map((country) => [country.code, country]));
    const countries = pendingCountryCodes.map((code) => {
      const option = COUNTRY_OPTIONS.find((country) => country.code === code)!;
      return existing.get(code) || { ...option, cardHeadEnabled: false, cardHeads: '' };
    });
    updateForm({ supportCountries: countries });
    setIsCountryPickerOpen(false);
  };
  const updateCountry = (code: string, patch: Partial<CardSupportedCountry>) => updateForm({
    supportCountries: form.supportCountries.map((country) => country.code === code ? { ...country, ...patch } : country),
  });
  const moveCountry = (fromCode: string, toCode: string) => {
    if (fromCode === toCode) return;
    const fromIndex = form.supportCountries.findIndex((country) => country.code === fromCode);
    const toIndex = form.supportCountries.findIndex((country) => country.code === toCode);
    if (fromIndex < 0 || toIndex < 0) return;
    const next = [...form.supportCountries];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    updateForm({ supportCountries: next });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const min = Number(form.minAmount); const max = Number(form.maxAmount);
    if (!form.nameCn.trim() || !form.nameEn.trim() || !form.category || !logoName) return setError('请完成所有必填项，并上传单张卡 logo');
    if (!Number.isInteger(min) || !Number.isInteger(max) || min <= 0 || max <= 0 || min > max) return setError('录入面值范围须为正整数，且最大值不得小于最小值');
    if (!form.speeds.length || !form.media.length) return setError('请至少选择一项交易速度与介质类型');
    const now = timestamp();
    const primaryCountry = form.supportCountries[0];
    const updated: CardSkuMasterItem = {
      id: card?.id || `SKU-CFG-${Math.floor(Math.random() * 900 + 100)}`,
      cardCode: card?.cardCode,
      internalId: card?.internalId || `#00${Math.floor(Math.random() * 9000 + 1000)}`,
      brandName: form.nameEn.trim(), subTitle: form.nameCn.trim(), category: form.category,
      iconType: 'custom', iconBg: '#1e293b', iconText: form.nameEn.trim().slice(0, 3).toUpperCase(), logoName,
      countryCode: primaryCountry?.code || card?.countryCode || 'US', countryName: primaryCountry ? `${primaryCountry.name} (${primaryCountry.code})` : card?.countryName || '美国 (US)', countryFlag: primaryCountry?.flag || card?.countryFlag || '🇺🇸',
      currency: card?.currency || 'USD', currencyDesc: card?.currencyDesc || 'USD ($) 结算',
      minAmount: min, maxAmount: max, faceValueModel: form.commonValues.length ? 'BOTH' : 'RANGE', faceValueRangeDesc: `${min}-${max}`,
      commonFaceValues: form.commonValues, ladders: form.commonValues.map((amount) => ({ amount, rateDiscount: 0, minMerchantRate: 0, dailyLimit: 0, enabled: true })),
      ladderDetailDesc: form.commonValues.length ? `常见面值: ${form.commonValues.join(' / ')}` : '未配置常见面值',
      quantity: form.quantity,
      maxCards: form.maxCards,
      supportCountries: form.supportCountries,
      associatedCountries: form.supportCountries.map((country) => `${country.code}${country.name}`),
      transactionElements: [{ category: '速度', values: form.speeds }, { category: '介质', values: form.media }],
      entryElements: form.entryElements, otherAttributes: form.entryElements.map((item) => item.name),
      regexRule: card?.regexRule || '^[A-Z0-9]+$', regexDisplay: card?.regexDisplay || '由录入要素规则控制', cardMaterial: form.media.join(' / '),
      ocrCapabilities: card?.ocrCapabilities || [{ text: '待配置', type: 'neutral' }], status: card?.status || 'active', riskTier: card?.riskTier || 'normal',
      balanceCheckSupported: card?.balanceCheckSupported || false, grabOrderEnabled: card?.grabOrderEnabled ?? true, listed: card?.listed ?? true,
      createdAt: card?.createdAt || now, lastUpdated: now, auditHash: card?.auditHash || `HASH: ${Math.random().toString(16).slice(2, 10).toUpperCase()}`,
    };
    onSave(updated); onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden border border-slate-200 flex flex-col animate-fadeIn">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5"><span className="p-1.5 rounded-lg bg-blue-50 text-blue-600"><span className="material-symbols-outlined text-[20px]">{isEditing ? 'edit_note' : 'add_box'}</span></span><div><h3 className="font-bold text-slate-900 text-sm">{isEditing ? `编辑卡种 · ${card?.brandName}` : '新增卡种'}</h3><span className="font-code-token text-[11px] text-slate-500">CARD MASTER DATA & ENTRY ELEMENT CONFIGURATION</span></div></div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"><span className="material-symbols-outlined text-[20px]">close</span></button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {error && <div className="px-3 py-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2"><span className="material-symbols-outlined text-[17px]">error</span>{error}</div>}

          <section className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 font-bold text-slate-800 flex items-center gap-2"><span className="material-symbols-outlined text-[17px] text-blue-600">credit_card</span>卡基本信息</div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><FieldLabel required>卡名称-中文</FieldLabel><input required value={form.nameCn} onChange={(event) => updateForm({ nameCn: event.target.value })} placeholder="如：苹果礼品卡（美区）" className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" /></div>
              <div><FieldLabel required hint="APP端展示">卡名称-英文</FieldLabel><input required value={form.nameEn} onChange={(event) => updateForm({ nameEn: event.target.value })} placeholder="e.g. Apple Gift Card" className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" /></div>
              <div><FieldLabel required>所属大类</FieldLabel><div className="flex gap-2"><select required value={form.category} onChange={(event) => updateForm({ category: event.target.value })} className="min-w-0 flex-1 h-9 px-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer">{categories.map((item) => <option key={item}>{item}</option>)}</select><button type="button" onClick={() => setAddingCategory((value) => !value)} className="h-9 px-3 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 font-medium cursor-pointer">新增大类</button></div>{addingCategory && <div className="mt-2 flex gap-2"><input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="输入新大类名称" className="h-8 flex-1 px-2.5 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500" /><button type="button" onClick={addCategory} className="px-3 rounded bg-blue-600 text-white font-medium cursor-pointer">确认</button></div>}</div>
              <div><FieldLabel required hint="单张，用户端展示">卡 logo</FieldLabel><div className="h-16 p-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center gap-3"><div className="w-11 h-11 shrink-0 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden">{logoPreview ? <img src={logoPreview} alt="卡 logo 预览" className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-slate-300 text-[23px]">image</span>}</div><div className="min-w-0 flex-1"><div className="truncate text-slate-700">{logoName || '暂未上传卡 logo'}</div><div className="text-[11px] text-slate-400 mt-0.5">PNG / JPG / WebP，单张图片</div></div><label className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center cursor-pointer shrink-0"><span className="material-symbols-outlined text-[15px] mr-1">upload</span>{logoName ? '替换' : '上传'}<input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) { setLogoName(file.name); setLogoPreview(URL.createObjectURL(file)); setError(''); } }} /></label>{logoName && <button type="button" onClick={() => { setLogoName(''); setLogoPreview(''); }} className="text-slate-400 hover:text-rose-600 cursor-pointer" title="移除 logo"><span className="material-symbols-outlined text-[18px]">delete</span></button>}</div></div>
              <div><FieldLabel required hint="最大值、最小值均为正整数">录入面值范围</FieldLabel><div className="flex items-center gap-2"><input required min="1" step="1" type="number" value={form.minAmount} onChange={(event) => updateForm({ minAmount: event.target.value })} placeholder="最小值" className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500" /><span className="text-slate-400">至</span><input required min="1" step="1" type="number" value={form.maxAmount} onChange={(event) => updateForm({ maxAmount: event.target.value })} placeholder="最大值" className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500" /></div></div>
              <div className="md:col-span-2"><div className="flex items-center gap-2 whitespace-nowrap"><span className="font-semibold text-slate-800 shrink-0">常见面值</span><span className="text-slate-400 shrink-0">非必填，最多 10 个正整数</span><input min="1" step="1" type="number" value={commonInput} onChange={(event) => setCommonInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addCommonValue(); } }} placeholder="输入面值" className="w-28 h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 shrink-0" /><button type="button" onClick={addCommonValue} className="h-9 px-3 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 font-medium cursor-pointer shrink-0">添加</button><div className="min-w-0 flex-1 flex items-center gap-1.5 overflow-x-auto py-1">{form.commonValues.map((value) => <span key={value} className="inline-flex shrink-0 items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-700 font-mono">{value}<button type="button" onClick={() => updateForm({ commonValues: form.commonValues.filter((item) => item !== value) })} className="text-slate-400 hover:text-rose-600 cursor-pointer">×</button></span>)}</div></div></div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 font-bold text-slate-800 flex items-center gap-2"><span className="material-symbols-outlined text-[17px] text-blue-600">tune</span>交易要素设置</div>
            <div className="p-4 grid grid-cols-1 gap-4">
              <div><FieldLabel required>数量 (Quantity)</FieldLabel><div className="flex items-center gap-2 flex-wrap">{(['单卡', '多卡'] as const).map((item) => <button key={item} type="button" onClick={() => { toggleRadio(item); updateForm({ maxCards: item === '多卡' ? 20 : 1 }); }} className={`h-8 px-4 rounded-lg border font-medium cursor-pointer ${form.quantity === item ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{item}</button>)}{form.quantity === '多卡' && <><span className="ml-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded">默认单次最多 20 张</span><label className="flex items-center gap-1.5 text-slate-500">最大张数<input min="1" max="20" type="number" value={form.maxCards} onChange={(event) => updateForm({ maxCards: Math.min(20, Math.max(1, Number(event.target.value) || 1)) })} className="w-14 h-8 px-2 rounded border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500" /></label></>}</div></div>
              <div><FieldLabel required hint="支持多选">交易速度 (Speed)</FieldLabel><OptionChips options={SPEED_OPTIONS} selected={form.speeds} onChange={(speeds) => updateForm({ speeds })} /></div>
              <div><FieldLabel required hint="支持多选">介质类型 (Type)</FieldLabel><OptionChips options={MEDIA_OPTIONS} selected={form.media} onChange={(media) => updateForm({ media })} /></div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3"><div><div className="font-bold text-slate-800 flex items-center gap-2"><span className="material-symbols-outlined text-[17px] text-blue-600">public</span>卡支持国家</div><p className="text-[11px] font-normal text-slate-500 mt-0.5">可通过拖拽排序图标调整国家排序，卡头顺序按照输入顺序展示</p></div><button type="button" onClick={openCountryPicker} className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1 cursor-pointer"><span className="material-symbols-outlined text-[16px]">add</span>选择国家</button></div>
            {form.supportCountries.length === 0 ? <div className="py-8 text-center text-slate-400"><span className="material-symbols-outlined text-[24px] block mb-1">flag</span>尚未配置支持国家，请选择国家后按顺序维护卡头。</div> : <div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left"><thead className="bg-slate-50 text-[11px] text-slate-500"><tr><th className="px-4 py-2.5 w-20">排序</th><th className="px-4 py-2.5">国家名称</th><th className="px-4 py-2.5">是否关联卡头</th><th className="px-4 py-2.5">卡头（多个卡头请用英文逗号隔开）</th><th className="px-4 py-2.5 text-right">操作</th></tr></thead><tbody className="divide-y divide-slate-100">{form.supportCountries.map((country) => <tr key={country.code} draggable onDragStart={() => setDraggingCountryCode(country.code)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (draggingCountryCode) moveCountry(draggingCountryCode, country.code); setDraggingCountryCode(null); }} className="hover:bg-slate-50/70"><td className="px-4 py-3"><span className="material-symbols-outlined text-slate-400 cursor-grab" title="拖拽调整排序">drag_indicator</span></td><td className="px-4 py-3"><div className="flex items-center gap-2"><span className="text-xl leading-none">{country.flag}</span><span className="font-semibold text-slate-800">{country.name}</span><span className="text-slate-400">({country.nameEn})</span></div></td><td className="px-4 py-3"><div className="flex gap-4"><label className="inline-flex items-center gap-1.5 cursor-pointer"><input type="radio" name={`head-${country.code}`} checked={!country.cardHeadEnabled} onChange={() => updateCountry(country.code, { cardHeadEnabled: false, cardHeads: '' })} className="accent-blue-600" />否</label><label className="inline-flex items-center gap-1.5 cursor-pointer"><input type="radio" name={`head-${country.code}`} checked={country.cardHeadEnabled} onChange={() => updateCountry(country.code, { cardHeadEnabled: true })} className="accent-blue-600" />是</label></div></td><td className="px-4 py-3"><input disabled={!country.cardHeadEnabled} value={country.cardHeads} onChange={(event) => updateCountry(country.code, { cardHeads: event.target.value.toUpperCase() })} placeholder="多个卡头请用英文逗号隔开" className="w-full h-8 px-2.5 rounded border border-slate-200 bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500" /></td><td className="px-4 py-3 text-right"><button type="button" onClick={() => updateForm({ supportCountries: form.supportCountries.filter((item) => item.code !== country.code) })} className="h-7 px-2.5 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 font-medium cursor-pointer"><span className="material-symbols-outlined text-[14px] align-[-2px] mr-1">delete</span>删除</button></td></tr>)}</tbody></table></div>}
          </section>

          <section className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3"><div><div className="font-bold text-slate-800 flex items-center gap-2"><span className="material-symbols-outlined text-[17px] text-blue-600">playlist_add</span>录入要素设置</div><p className="text-[11px] font-normal text-slate-500 mt-0.5">用户提交卡单时需要录入的内容</p></div><button type="button" onClick={openNewElement} className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1 cursor-pointer"><span className="material-symbols-outlined text-[16px]">add</span>新增要素</button></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-slate-50 text-[11px] text-slate-500"><tr><th className="px-4 py-2.5">要素</th><th className="px-4 py-2.5">属性</th><th className="px-4 py-2.5">默认填充录入</th><th className="px-4 py-2.5">录入规则</th><th className="px-4 py-2.5 text-right">操作</th></tr></thead><tbody className="divide-y divide-slate-100">{form.entryElements.map((item) => <tr key={item.id}><td className="px-4 py-3"><div className="font-medium text-slate-800">{item.name}</div><div className="text-[11px] text-slate-400">{item.type}</div></td><td className="px-4 py-3"><span className={`px-2 py-0.5 rounded border text-[11px] ${item.property === '图片' ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-sky-50 text-sky-700 border-sky-200'}`}>{item.property}</span></td><td className="px-4 py-3 text-slate-600 max-w-[210px]"><span className="block truncate" title={item.prompt}>{item.property === '图片' && item.valueRule === '限制' && item.maxImages ? `默认最多上传 ${item.maxImages} 张` : item.prompt}</span></td><td className="px-4 py-3 text-slate-500">{item.required ? '必填' : '非必填'} · {item.valueRule === '不限' ? '录入值不限' : item.property === '图片' ? `最多 ${item.maxImages || 20} 张` : `${item.allowedFormats?.length || 0} 套允许格式`}</td><td className="px-4 py-3 text-right whitespace-nowrap"><button type="button" onClick={() => openEditElement(item)} className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer">编辑</button><button type="button" onClick={() => updateForm({ entryElements: form.entryElements.filter((entry) => entry.id !== item.id) })} className="text-slate-500 hover:text-rose-600 ml-3 cursor-pointer">删除</button></td></tr>)}</tbody></table></div>
          </section>

          <div className="pt-1 flex items-center justify-between gap-3"><span className="text-[11px] text-slate-400">保存后，卡种与录入要素配置将即时下发。</span><div className="flex gap-2"><button type="button" onClick={onClose} className="h-9 px-4 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 font-medium cursor-pointer">取消</button><button type="submit" className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"><span className="material-symbols-outlined text-[16px]">check</span>{isEditing ? '保存卡种' : '新增卡种'}</button></div></div>
        </form>
      </div>

      {isElementModalOpen && <EntryElementModal
        draft={entryDraft}
        editing={Boolean(editingEntryId)}
        elementTypes={ELEMENT_TYPES}
        error={entryError}
        onChange={(patch) => { setEntryDraft((draft) => ({ ...draft, ...patch })); setEntryError(''); }}
        onTypeChange={changeElementType}
        onClose={() => setIsElementModalOpen(false)}
        onSave={saveEntry}
      />}
      {isCountryPickerOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-900">选择卡支持国家</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">确认后按选择顺序写入；可在列表中拖拽调整。</p>
              </div>
              <button type="button" onClick={() => setIsCountryPickerOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer" aria-label="关闭国家选择">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="px-5 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">已选择 {pendingCountryCodes.length} / {COUNTRY_OPTIONS.length} 个国家</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setPendingCountryCodes(COUNTRY_OPTIONS.map((country) => country.code))} disabled={pendingCountryCodes.length === COUNTRY_OPTIONS.length} className="h-7 px-3 rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">全选</button>
                <button type="button" onClick={() => setPendingCountryCodes([])} disabled={pendingCountryCodes.length === 0} className="h-7 px-3 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">取消选择</button>
              </div>
            </div>
            <div className="p-5 grid grid-cols-5 gap-2 max-h-[55vh] overflow-y-auto">
              {COUNTRY_OPTIONS.map((country) => {
                const checked = pendingCountryCodes.includes(country.code);
                return (
                  <button key={country.code} type="button" aria-pressed={checked} onClick={() => setPendingCountryCodes((previous) => checked ? previous.filter((code) => code !== country.code) : [...previous, country.code])} className={`min-w-0 p-2.5 rounded-lg border text-left flex items-center gap-2 cursor-pointer ${checked ? 'border-blue-400 bg-blue-50 text-blue-800' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}>
                    <span className="text-lg shrink-0">{country.flag}</span>
                    <span className="min-w-0"><span className="block font-medium truncate">{country.name}</span><span className="block text-[10px] text-slate-400 truncate" title={country.nameEn}>{country.nameEn}</span></span>
                    <span className="material-symbols-outlined text-[16px] ml-auto shrink-0">{checked ? 'check_box' : 'check_box_outline_blank'}</span>
                  </button>
                );
              })}
            </div>
            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button type="button" onClick={() => setIsCountryPickerOpen(false)} className="h-8 px-3.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer">取消</button>
              <button type="button" onClick={confirmCountries} className="h-8 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer">确认选择（{pendingCountryCodes.length}）</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
