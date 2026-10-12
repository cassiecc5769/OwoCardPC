export type UserTimeRangeKey = 'today' | '7d' | 'month' | '30d' | '90d' | 'custom';

export interface UserAnalyticsFilterState {
  timeRange: UserTimeRangeKey;
  customStartDate: string;
  customEndDate: string;
  acquisitionChannel: string;
  userTier: string;
  activationStatus: string;
  riskLevel: string;
}

export interface UserMacroKpiData {
  // Card 1: 累计出卡用户与今日活跃
  totalUsers: number;
  totalUsersMom: string;
  complianceRate: number;
  monthlyNewUsers: number;
  todayTransUsers?: number;
  todayTransUsersMom?: string;

  // Card 2: 交易大盘与客单价
  todayGmvYuan?: number;
  todayGmvYuanMom?: string;
  todayAtvYuan?: number;
  todayAtvMom?: string;

  // Card 3: 订单总量与兑付成功率
  todaySuccessOrders?: number;
  todaySuccessRate?: number;
  todaySuccessRateMom?: string;

  // Card 4: 首单破冰转化率与复购
  activationRate: number;
  activationStatusTag: string;
  activationMedianMinutes: number;
  repurchaseRate30d: number;

  // Card 5: 核心高价值大客规模
  highValueVipCount: number;
  highValueVipPercent: number;
  highValueVipGmvShare: number;

  // 辅助留存与毛利频次
  monthlyAvgFrequency: number;
  frequencyMom: string;
  monthlyAvgMarginUsd: number;
}

export interface LifecycleFunnelStep {
  stepIndex: number;
  stepCode: string;
  stepName: string;
  stageSubtitle: string;
  count: number;
  ratePercent: number;
  rateLabel?: string;
  subText: string;
  icon?: string;
  isHighlight?: boolean;
  progressColor?: string;
  // Detail insights for modal/hover
  benchmarkDescription?: string;
  dropOffReason?: string;
  channelConversionTips?: string;
}

export interface CohortMatrixRow {
  cohortMonth: string;
  initialUsers: number;
  m1: string;
  m1Val?: number;
  m2: string;
  m2Val?: number;
  m3: string;
  m3Val?: number;
  m4: string;
  m4Val?: number;
  m5: string;
  m5Val?: number;
  cumulativeLtvUsd: number;
  isCurrentMonth?: boolean;
  // Details for drilldown
  avgFirstOrderDenomination?: number;
  dominantCardBrand?: string;
  churnMainPhase?: string;
}

export interface MemberTierValueItem {
  tierId: string;
  tierLevel: string;
  tierName: string;
  userSharePercent: number;
  gmvSharePercent: number;
  userCount: number;
  color: string;
  barColor: string;
  criteria: string;
  protectionPolicy: string;
}

export interface ChannelLtvItem {
  channelId: string;
  channelName: string;
  tag: string;
  cacUsd: number;
  ltv90Usd: number;
  roi: string;
  roiVal: number;
  vipRate: number;
  strategicOrientation: string;
  color: string;
  // Details for drilldown
  totalAcquired: number;
  avgFirstOrderSec: number;
  fraudInterceptRate: number;
}
