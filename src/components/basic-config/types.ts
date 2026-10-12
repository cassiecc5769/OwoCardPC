export type BasicConfigTab = 'reasons' | 'countries' | 'currencies' | 'runtime-params';

export type ReasonDomain = 'ALL' | 'F' | 'A' | 'D' | 'ADJ';

export interface BusinessReasonItem {
  id: string;
  code: string;
  shortCode: string;
  nameZh: string;
  nameEn: string;
  domain: 'F' | 'A' | 'D' | 'ADJ';
  domainLabel: string;
  actionDecision: string;
  actionTooltip: string;
  dependencies: string[];
  enabled: boolean;
  constraintLevel: string;
  todayHits: number;
  i18n: {
    zhCN: { text: string; note: string };
    enUS: { text: string; note: string };
    pidgin: { text: string; note: string };
  };
  clientRenders: {
    userAppTip: string;
    merchantApiError: {
      httpStatus: string;
      json: string;
    };
  };
  auditHistory?: {
    time: string;
    operator: string;
    action: string;
    diff: string;
    hash: string;
    impactCount: number;
  }[];
}

export interface CountryRegionItem {
  codeAlpha2: string;
  codeAlpha3: string;
  nameZh: string;
  nameEn: string;
  flagEmoji: string;
  callingCode: string;
  continent: string;
  currency: string;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  riskLabel: string;
  kycLevel: string;
  cardChannelStatus: 'NORMAL' | 'RATE_BUFFER' | 'LIMIT_CONTROL';
  cardChannelLabel: string;
  localPaymentGateways: string[];
  taxRatePercent: number;
  enabled: boolean;
  supportedCards: string[];
}

export interface CurrencyStandardItem {
  code: string;
  nameZh: string;
  nameEn: string;
  symbol: string;
  type: 'FIAT' | 'CRYPTO';
  typeLabel: string;
  decimalPrecision: number;
  priceSource: string;
  referenceRate: number;
  floatThresholdPercent: number;
  roundingMethod: string;
  dailyVolumeUsd: string;
  enabled: boolean;
  basisPointsDiff: number;
  lastSyncTime: string;
}

export interface BasicAuditLogEntry {
  id: string;
  timestamp: string;
  operator: string;
  role: string;
  category: string;
  targetCode: string;
  targetName: string;
  actionType: 'UPDATE_TEXT' | 'TOGGLE_STATUS' | 'ADD_CODE' | 'SYNC_RATE' | 'PARAM_CHANGE';
  beforeVal: string;
  afterVal: string;
  sha256: string;
  impactedOrders: number;
}
