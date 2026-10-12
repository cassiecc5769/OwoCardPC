export type BenefitType = 'rate' | 'fixed' | 'service' | 'fee' | 'lock';

export type BenefitCategory =
  | 'acquisition' // 市场拉新
  | 'activation'  // 交易促活
  | 'loyalty'     // 会员尊享
  | 'retention'   // 召回挽损
  | 'service'     // 服务保障
  | 'channel';    // 渠道联名

export type BenefitStatus = 'active' | 'paused' | 'review';

export interface UniversalBenefitTemplate {
  id: string;
  code: string;
  name: string;
  badge: string;
  badgeColor: string;
  category: BenefitCategory;
  categoryLabel: string;
  type: BenefitType;
  typeLabel?: string;
  discountValue: number;
  discountUnit: '%' | 'USD' | 'USDT' | '秒' | '分';
  discountDisplay: string;
  discountSub: string;
  capAmount: number; // 封顶上限 USD
  minThresholdValue: number; // 最低卡单面额 USD
  minThreshold: string;
  validityType: 'relative' | 'fixed_range';
  validityDays: number;
  validity: string;
  applicableCards: string;
  applicableCardTags: string[];
  allowedCurrencies: string[];
  maxClaimPerUser: number;
  dailyUsageLimit: number;
  allowStackWithPromotion: boolean; // 允许叠加大促
  allowStackWithTier: boolean;      // 允许叠加会员等级折扣
  triggerMechanisms: string[];      // 触发机制标识
  triggerMechanismLabels: string[]; // 触发机制中文
  budgetSubject: string;            // 预算归属科目
  budgetAllocated: number;          // 预算总额 USD
  budgetUsed: number;               // 已消耗预算 USD
  statTotalIssued: number;          // 累计发放量
  statRedeemed: number;             // 累计核销张数
  statRedemptionRate: number;       // 核销履约率 %
  statGmvDriven: number;            // 撬动出单 GMV USD
  status: BenefitStatus;
  version: string;
  lastUpdated: string;
  updatedBy: string;
  description: string;
  riskRules: string[];
}

export interface BenefitCouponItem {
  id: string;
  couponCode: string;
  name: string;
  type: 'rate' | 'fixed' | 'service';
  typeLabel: string;
  discountDisplay: string;
  discountValue: number;
  cardScope: string;
  cardScopeTags: string[];
  userUid: string;
  userPhone: string;
  sourceType: 'campaign' | 'tier' | 'cs' | 'manual' | 'risk';
  sourceCode: string;
  sourceDesc: string;
  orderId?: string;
  status: 'used' | 'active' | 'expired' | 'frozen';
  statusLabel: string;
  expireTimeText: string;
  usedTime?: string;
  createTime: string;
  minOrderValue: number;
  subsidyAmount?: number;
  riskReason?: string;
  workOrderRef?: string;
}
