export type MemberTier = 'LV1' | 'LV2' | 'LV3' | 'LV4' | 'LV5';

export interface MemberTierConfig {
  id: string;
  tier: MemberTier;
  name: string;
  badge: string;
  thresholdPts: number;
  quoteCoefficient: string; // e.g. "100.0%"
  bonusPercent: string; // e.g. "+0.00%", "+0.10%", "+0.30%", "+0.50%", "+0.80%"
  bonusValue: number; // numeric value e.g. 0.008
  queueChannel: string; // "标准排队" | "标准队列" | "极速秒批通道" | "绿色优先专线" | "专属API直连"
  csGuarantee: string; // "智能客服" | "首单返现权益包" | "1对1专属客服" | "专属大额溢价" | "7×24 资深专家驻场"
  memberCount: number;
  badgeBg: string;
  badgeText: string;
  headerBg: string;
  accentColor: string;
}

export interface GrowthFormulaRule {
  id: string;
  code: string;
  title: string;
  desc: string;
  formulaText: string;
  subText: string;
  type: 'accrual' | 'deduction';
  badgeClass: string;
}

export interface RetentionPolicyConfig {
  rollingWindowDays: number; // e.g. 180
  minTradesCount: number; // e.g. 3
  minPtsPercent: number; // e.g. 50%
  decayStrategy: string; // "平滑顺降一级 (LV-1)"
  warningDays: number; // e.g. 15
  autoPushEnabled: boolean;
  cronSchedule: string; // "CRON: DAILY 04:00"
}

export interface MemberProfile {
  id: string;
  uid: string;
  phone: string;
  avatarBg: string;
  tier: MemberTier;
  tierName: string;
  currentPts: number;
  nextTierGapText: string;
  gmv30d: number;
  preferredCards: string[];
  bonusRate: string;
  lastTradeTime: string;
  status: '跃升升级' | '稳定保级' | '预警下调' | '已达最高级';
  warningDaysRemaining?: number;
  tradesCount180d: number;
  kycStatus: '已通过实名认证' | '高级KYC完成' | '基础认证' | '护照已验';
  riskTag: '极信绿标' | '正常' | '重点监控';
  registeredDate: string;
  activeRate: string;
  assignedManager?: string;
  recentTradeCards?: {
    id: string;
    card: string;
    amount: number;
    currency: string;
    ptsEarned: number;
    time: string;
    status: string;
  }[];
}

export interface GrowthPointsLedgerItem {
  id: string;
  serialNo: string;
  uid: string;
  phone: string;
  tier: MemberTier;
  changeType: '卡单实收成交' | '首次成功出卡奖励' | '上传高清小票加分' | '风控违规扣罚' | '人工补发调分' | '争议仲裁补偿';
  pointsChange: number;
  relatedOrderId?: string;
  operator?: string;
  time: string;
  balanceAfter: number;
  note: string;
  status: '已入账' | '已冲正' | '审核通过';
}

export interface RetentionCareItem {
  id: string;
  uid: string;
  phone: string;
  tier: MemberTier;
  tierName: string;
  gmv30d: number;
  rollingTradesCount: number;
  targetTradesCount: number;
  rollingPts: number;
  targetPts: number;
  daysRemaining: number;
  careStatus: '待触达' | '已推送预警' | '已派挽留券' | '达成保级' | '顺降预警';
  suggestedAction: string;
}

export interface PrivilegeMarginStat {
  cardBrand: string;
  gmvSharePercent: number;
  totalGmvUsd: number;
  orderCount: number;
  avgBonusRate: string;
  totalBonusPayoutUsd: number;
  repurchaseBoostPercent: string;
  avgSlaSpeedSec: number;
  fastLaneCount: number;
}
