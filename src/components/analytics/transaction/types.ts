export type TimeRangeKey = 'today' | 'yesterday' | '7d' | 'month' | 'custom';

export interface GlobalFilterState {
  timeRange: TimeRangeKey;
  customStartDate: string;
  customEndDate: string;
  brand: string;
  region: string;
  mediaType: string;
  denomination: string;
  merchant: string;
  channelMode: string;
}

export interface FunnelStepData {
  stepIndex: number;
  stepNumber: string;
  stepName: string;
  count: number;
  retentionPercent: number; // e.g. 100.0, 95.0, 77.9
  lossCount: number;
  lossPercent: number; // e.g. 5.0, 18.0, 3.0
  lossReasons: string[];
  isFinal?: boolean;
  finalSettlementNote?: string;
}

export interface QuadrantBrandItem {
  id: string;
  name: string;
  region: string;
  categoryIcon: string;
  successRate: number; // % e.g. 96.8
  avgDurationSec: number; // seconds e.g. 14
  orderCount: number;
  gmvAmount: number; // USD
  quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4'; // Q1: 核心高标杆, Q2: 需提速卡种, Q3: 风险警告区, Q4: 淘汰滞留区
  tagColor: string;
  note: string;
}

export interface AnomalyItem {
  id: string;
  causeCategory: string;
  icon: string;
  occurrences: number;
  ratioPercent: number;
  amountUsd: number;
  responsibleParty: '用户申报侧' | '商户承兑侧' | '平台规则与网关侧';
  affectedBrands: string[];
  status: '已闭环追偿' | '待商户补证' | '平台先行垫付' | '锁定冻结中' | '已退还用户';
  statusColor: string;
  typicalTxId: string;
  summary: string;
  detailLog: {
    reportedAt: string;
    cardType: string;
    faceValue: string;
    merchantName: string;
    ocrConfidence: number;
    riskScore: number;
    gatewayResponse: string;
    auditDecision: string;
  };
}

export interface MacroKpiData {
  submittedOrders: number;
  submittedOrdersYoy: string;
  submittedFaceValue: number;
  aov: number;
  successfulOrders: number;
  conversionRate: number;
  settledGmv: number;
  lossRate: number;
  autoPassRate: number;
  autoPassSec: string;
  apiAutoCount: number;
  manualAuditCount: number;
  avgVelocityTime: string;
  slaRate: number;
  abnormalPendingRate: number;
  disputeRate: number;
}
