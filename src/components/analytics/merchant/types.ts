export interface MerchantFilterState {
  cardBrand: string;
  tier: string;
  fulfillmentMode: string;
  region: string;
  search: string;
  timeRange: 'today' | 'yesterday' | '7d' | 'month' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
}

export interface MerchantMacroKpi {
  totalCertifiedMerchants: number;
  onlineCount: number;
  seatLoadRate: number;

  todayFulfilledGmvUsd: number;
  completedOrdersCount: number;
  onTimeFulfillmentRate: number;

  avgResponseTimeSeconds: number;
  apiDirectPassRate: number;
  manualAvgTimeText: string;

  healthRate: number;
  suspendedMerchantsCount: number;
  disputeOrdersCount: number;
  collateralPoolUsd: number;
}

export interface DemandCapacityRow {
  id: string;
  cardBrand: string;
  currencyOrRegion: string;
  demandGmvUsd: number;
  capacityGmvUsd: number;
  ratioPercent: number;
  barWidthPercent: number;
  status: '充足' | '缺口' | '紧平衡' | '过剩';
  statusBadgeText: string;
  statusType: 'success' | 'danger' | 'warning' | 'neutral';
  strategyAdvice: string;
  actionText: string;
  actionType: 'primary' | 'danger' | 'default';
}

export interface HhiConcentrationData {
  hhiIndex: number;
  hhiRiskLevel: string;
  top1Name: string;
  top1Percent: number;
  top1Redline: number;
  top1BarWidth: number;
  top5Percent: number;
  top5GmvUsd: number;
  top10Percent: number;
  activeMitigationMID: string;
  activeMitigationShare: number;
  backupDivertPercent: number;
  apiVolumeOrders: number;
  apiPercent: number;
  manualVolumeOrders: number;
  manualPercent: number;
  autoThrottleOn: boolean;
}

export interface MerchantPerformanceRow {
  merchantId: string;
  merchantName: string;
  channelDesc: string;
  tier: 'Tier-S' | 'Tier-A' | 'Tier-B' | 'SUSPEND';
  majorCards: string;
  fulfilledOrderCount: number;
  verifiedGmvUsd: number;
  successRate: number;
  avgResponseSeconds: number;
  totalDurationText: string;
  activeRejectRate: number;
  performanceScore: number;
  isHighLatency?: boolean;
  isHighReject?: boolean;
  isSuspended?: boolean;
  collateralUsd?: number;
  creditLimitDailyUsd?: number;
  usedCreditUsd?: number;
  settlementCurrency?: string;
  contactPerson?: string;
  telegramAccount?: string;
  disputeCaseCount?: number;
}
