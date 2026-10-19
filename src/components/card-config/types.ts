export interface FaceValueLadder {
  amount: number;
  rateDiscount: number;
  minMerchantRate: number;
  dailyLimit: number;
  enabled: boolean;
}

export interface OcrCapabilityBadge {
  text: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'neutral';
}

export interface TransactionElementGroup {
  category: '速度' | '介质';
  values: string[];
}

export type CardEntryConditionType =
  | 'fixedLength'
  | 'lengthRange'
  | 'characters'
  | 'prefix'
  | 'suffix'
  | 'position'
  | 'allowedValues'
  | 'blockedValues';

export type CardEntryCharacterSet = 'digits' | 'letters' | 'alphanumeric' | 'custom';

export interface CardEntryRuleCondition {
  id: string;
  type: CardEntryConditionType;
  value?: string;
  min?: string;
  max?: string;
  position?: string;
  characterSet?: CardEntryCharacterSet;
  customCharacters?: string;
  requireBoth?: boolean;
}

export interface CardEntryAllowedFormat {
  id: string;
  name: string;
  conditions: CardEntryRuleCondition[];
}

export interface CardEntryElement {
  id: string;
  type: string;
  name: string;
  property: '图片' | '文本类';
  prompt: string;
  required: boolean;
  valueRule: '不限' | '限制';
  allowedFormats?: CardEntryAllowedFormat[];
  maxImages?: number;
  allowedImageFormats?: ('JPG' | 'PNG' | 'WebP')[];
  maxImageSizeMB?: number;
}

export interface CardSupportedCountry {
  code: string;
  name: string;
  nameEn: string;
  flag: string;
  cardHeadEnabled: boolean;
  cardHeads: string;
}

export interface CardSkuMasterItem {
  id: string; // e.g. "SKU-APL-US"
  /** 面向运营展示的卡种编码；未配置时保留兼容旧 SKU 数据。 */
  cardCode?: string;
  internalId: string; // e.g. "#00841"
  brandName: string; // e.g. "Apple Gift Card"
  subTitle: string; // e.g. "苹果综合充值卡 (美区)"
  category: string; // e.g. "应用/软件", "游戏点卡", "电商购物", "金融预付"
  transactionElements?: TransactionElementGroup[];
  quantity?: '单卡' | '多卡';
  maxCards?: number;
  entryElements?: CardEntryElement[];
  logoName?: string;
  supportCountries?: CardSupportedCountry[];
  associatedCountries?: string[];
  commonFaceValues?: number[];
  otherAttributes?: string[];
  createdAt?: string;
  grabOrderEnabled?: boolean;
  listed?: boolean;
  iconType: 'apple' | 'steam' | 'google' | 'razer' | 'vanilla' | 'amazon' | 'custom';
  iconBg: string;
  iconText?: string;
  countryCode: string; // "US" | "UK" | "DE" | "JP" | "NG" | "GLB"
  countryName: string; // "美国 (US)"
  countryFlag: string; // "🇺🇸"
  currency: string; // "USD"
  currencyDesc: string; // "USD ($) 结算"
  minAmount: number;
  maxAmount: number;
  faceValueModel: 'FIXED' | 'RANGE' | 'BOTH';
  faceValueRangeDesc: string; // "$10.00 ~ $500.00"
  ladderDetailDesc: string; // "常规阶梯: 25 / 50 / 100 / 200 浮动"
  ladders: FaceValueLadder[];
  regexRule: string; // "^X[A-Z0-9]{15}$"
  regexDisplay: string; // "^X[A-Z0-9]{15}$ (16位)"
  cardMaterial: string; // "实体涂层卡 / 电子码 (E-Code)"
  ocrCapabilities: OcrCapabilityBadge[];
  status: 'active' | 'maintenance';
  riskTier: 'normal' | 'high_risk';
  riskBadge?: string; // "高风控"
  balanceCheckSupported: boolean;
  notes?: string;
  lastUpdated: string;
  auditHash: string;
}

export interface CardConfigKpiData {
  totalBrandsCount: number;
  activeBrandsCount: number;
  pausedBrandsCount: number;
  highRiskCount: number;
  ladderDimensionCount: number;
  ocrAvgLatencyMs: number;
  ocrConfidenceRate: number;
  balanceCheckSupportedCount: number;
  interceptRate: number;
}

export interface CardConfigFilterState {
  tab: 'all' | 'active' | 'maintenance' | 'high_risk';
  search: string;
  region: string;
  currency: string;
  model: string;
  includeInactive: boolean;
}

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  operator: string;
  targetSku: string;
  action: string;
  details: string;
  hash: string;
}
