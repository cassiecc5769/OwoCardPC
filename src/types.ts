export type UserRole = 'operations' | 'customer_service' | 'finance' | 'admin' | 'u_rate_manager';

export interface RoleConfig {
  id: UserRole;
  name: string;
  shortName: string;
  tagline: string; // 一句话定位
  coreFocus: string; // 核心问题
  avatarBg: string;
  badgeBg: string;
  badgeText: string;
  primaryPath: NavPath;
}

export type NavPath =
  // 01 工作台
  | 'workbench'
  | 'workbench-operations'
  | 'workbench-cs'
  | 'workbench-cs-orders'
  | 'workbench-cs-merchant'
  | 'workbench-cs-promotion'
  | 'workbench-finance'
  | 'online-service'
  | 'my-messages'
  | 'my-orders'
  // 02 交易管理
  | 'order-management'
  | 'transaction-operations'
  | 'exception-orders'
  | 'exception-handling'
  | 'dispute-resolution'
  | 'claim-audit'
  // 03 报价运营
  | 'quote-operations'
  | 'quote-management'
  | 'quote-monitor'
  | 'quote-realtime'
  | 'quote-anomalies'
  | 'market-trends'
  | 'price-adjust-logs'
  // 04 用户与商户
  | 'user-management'
  | 'user-list'
  | 'user-profile'
  | 'user-tags'
  | 'user-segments'
  | 'user-operations'
  | 'merchant-management'
  | 'merchant-list'
  | 'merchant-profile'
  | 'merchant-capacity'
  | 'merchant-anomalies'
  | 'merchant-operations'
  // 05 运营管理
  | 'channel-operations'
  | 'channel-management'
  | 'channel-overview'
  | 'channel-quality'
  | 'channel-user-quality'
  | 'channel-issues'
  | 'growth-operations'
  | 'growth-overview'
  | 'growth-funnel'
  | 'growth-cohort'
  | 'growth-conversion-issues'
  | 'growth-strategy'
  | 'merchant-ops'
  | 'merchant-ops-overview'
  | 'merchant-tiering'
  | 'merchant-ops-issues'
  | 'member-operations'
  | 'member-levels'
  | 'member-growth'
  | 'member-lifecycle'
  | 'activity-operations'
  | 'activity-management'
  | 'activity-config'
  | 'activity-performance'
  | 'benefit-management'
  | 'benefit-config'
  | 'benefit-distribution'
  | 'benefit-records'
  | 'benefits-governance'
  | 'coupon-management'
  | 'marketing-assets'
  | 'operation-plans'
  | 'plan-management'
  | 'plan-actions'
  | 'plan-verification'
  | 'product-requirements'
  | 'campaign-promotion'
  | 'promotion-operations'
  | 'ai-promotion'
  // 06 风控管理
  | 'risk-management'
  | 'risk-overview'
  | 'risk-monitor'
  | 'risk-precheck'
  | 'risk-trends'
  | 'abnormal-cards'
  | 'card-check-logs'
  | 'risk-records'
  | 'risk-rules'
  // 07 财务结算
  | 'points-account'
  | 'recharge-management'
  | 'points-transactions'
  | 'points-management'
  | 'points-flow'
  | '03-points-flow'
  | 'platform-settlement'
  | 'merchant-reconciliation'
  | 'financial-reconciliation'
  | 'abnormal-finance'
  | 'discrepancy-accounts'
  | 'collateral-management'
  // 08 卡工具管理
  | 'card-tools'
  | 'card-tools-management'
  | 'card-tools-auth'
  | 'card-tools-query'
  | 'card-tools-logs'
  | 'card-tools-records'
  | 'card-tools-evidence'
  | 'card-tools-apple'
  | 'card-tools-order'
  | 'card-tools-batch'
  // 09 经营分析
  | 'business-overview'
  | 'analytics-special'
  | 'analytics-trade'
  | 'transaction-analytics'
  | 'growth-analytics'
  | 'user-analytics'
  | 'channel-analytics'
  | 'merchant-analytics'
  | 'operations-analytics'
  | 'service-analytics'
  | 'efficiency-analytics'
  | 'fulfillment-analytics'
  | 'financial-analytics'
  | 'data-reports'
  | 'report-center'
  | 'report-standard'
  | 'report-custom'
  | 'report-export'
  | 'robot-analytics'
  // 10 平台配置
  | 'business-config'
  | 'rules-config'
  | 'system-management'
  | 'card-catalog'
  | 'card-config'
  | 'trading-config'
  | 'trading-rules'
  | 'business-rules'
  | 'quote-rules'
  | 'rule-quote'
  | 'rule-card-check'
  | 'rule-card-making'
  | 'rule-withdrawal'
  | 'rule-risk'
  | 'rule-sla'
  | 'rule-loss'
  | 'risk-rules-config'
  | 'sla-rules'
  | 'loss-rules'
  | 'message-config'
  | 'permission-config'
  | 'operation-settings'
  | 'basic-config'
  | 'audit-logs';

export interface UserItem {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  tag: string;
  tagColor: string;
  uid: string;
  phone: string;
  channel: string;
  employeeRef: string;
  tier: string;
  tierColor: string;
  preferCards: string;
  gmv: number;
  gmvUsd?: number;
  tradesCount: number;
  withdrawUsdt: number;
  lastCardType: string;
  lastCardAmount: number;
  lastCardStatus: '核销成功' | '处理中' | '涉诉冻结' | '匹配中';
  lastCardTime: string;
  points: number;
  pendingSettlement: number;
  collateral: number;
  kycStatus: 'KYC已认证' | '基础认证' | '待补凭证' | '未认证' | 'KYC高级' | '基础实名' | 'KYC审核中' | '高危复核';
  kycDocType?: string;
  riskLabel: '极信绿标' | '正常' | '嫌疑碰卡' | '重点监控' | '正常履约' | '限制交易' | '已冻结';
  riskTier?: 'Tier-A' | 'Tier-B' | 'Tier-C';
  accountState?: '正常' | '限制交易' | '已冻结';
  successRate?: string;
  assignedRep?: string;
  creditScore: number;
  daysActive: number;
  opayAccount: string;
  usdtAddress: string;
  peakHours: string;
  tags: string[];
  referralShare: string;
  registeredDate?: string;
  email?: string;
  registrationMethod?: 'email' | 'phone';
  userWhatsAppNumbers?: string[];
  operatorWhatsAppNumbers?: string[];
  location?: string;
  growthPoints?: number;
  maxGrowthPoints?: number;
  inviteCode?: string;
  deviceModel?: string;
  lastIp?: string;
  avatarUrl?: string;
  riskLogs: { title: string; time: string; desc: string }[];
  transactions: {
    id: string;
    card: string;
    amount: number;
    time: string;
    status: string;
    rate?: string;
    orderNo?: string;
    cardName?: string;
    country?: string;
    faceValueQuantity?: string;
    quote?: string;
    totalAmount?: string;
    reward?: string;
    settlementTotal?: string;
    orderTime?: string;
    processingStatus?: string;
  }[];
}

export interface CardOrderItem {
  orderId: string;
  cardName: string;
  cardCategory?: string;
  faceValue: number;
  currency: string;
  userUid: string;
  userName: string;
  userTier?: string;
  userPhone?: string;
  matchedMerchant: string;
  merchantMid?: string;
  rate: number;
  merchantRate?: number;
  spreadProfit?: number;
  settleAmount: number;
  status: '待匹配' | '商户核销中' | '核销成功' | '涉诉争议' | '已结算' | '异常挂起';
  ocrStatus: '已校验 (0.4s)' | '人工补验' | '校验中' | 'OCR识别异常';
  cardCodeMasked?: string;
  cardCodeFull?: string;
  cardPinMasked?: string;
  cardPinFull?: string;
  cardImageUrl?: string;
  hasReceipt?: boolean;
  createTime: string;
  assignedTime?: string;
  finishTime?: string;
  durationSec?: number;
  timeline?: {
    time: string;
    step: string;
    actor: string;
    desc: string;
    status: 'success' | 'warning' | 'error' | 'info';
  }[];
  operatorNotes?: string;
  disputeReason?: string;
}

export interface QuoteItem {
  id: string;
  cardName: string;
  category: 'Apple' | 'Steam' | 'Razer' | 'Vanilla' | 'Google' | 'Amazon' | 'Other';
  currency: string;
  country: string;
  flag: string;
  denominationType: 'Fixed' | 'Range';
  denominations: string;
  userBuyRatePercent: number; // 用户收卡折扣率 (例如 78.5%)
  pointsPerDollar: number; // 用户折合积点
  merchantSellRatePercent: number; // 商户出货价折扣率 (例如 82.2%)
  spreadMarginPercent: number; // 平台毛利点差 (例如 3.7%)
  spreadPer100Usd: number; // 每$100毛利
  inventoryLevel: '充裕' | '正常' | '紧张' | '超负荷';
  activeMerchantsCount: number;
  autoFloatPricing: boolean;
  status: '正常收卡' | '暂停回收' | '限额收购' | '调价待审';
  lastUpdateTime: string;
  operator: string;
}

export interface TransactionOperationsItem {
  id: string;
  orderId: string;
  cardName: string;
  faceValue: number;
  currency: string;
  userUid: string;
  userName: string;
  merchantMid: string;
  merchantName: string;
  stage: '待调度' | '商户作业中' | 'OCR/密文反查' | '阻塞/超时异常';
  elapsedSeconds: number;
  slaMaxSeconds: number;
  isTimeout: boolean;
  blockReason?: '商户席位未响应' | 'OCR反光模糊' | '卡密已被兑换' | '面额申报不符' | '通道网络丢包';
  merchantChannel: string;
  assignedOperator: string;
  suggestedAction: '强制转派VIP商户' | '撤单退卡回滚' | '转交人工核验' | '移交争议仲裁' | '商户一键催办';
  createTime: string;
}

export interface DisputeItem {
  id: string;
  disputeId: string;
  orderId: string;
  cardName: string;
  faceValue: number;
  currency: string;
  userUid: string;
  userName: string;
  userPhone: string;
  userCreditScore: number;
  merchantMid: string;
  merchantName: string;
  merchantReputation: number;
  disputeType: '卡密已被兑换' | '卡号不存在/无效' | '面额不符' | '接单后被盗刷' | '假卡/伪造小票';
  amountUsd: number;
  collateralFrozenUsd: number; // 质押保证金冻结金额
  userClaimDesc: string;
  userProofUrls: string[];
  userSubmissionTime: string;
  merchantProofDesc: string;
  merchantApiLog: {
    vendorReturnCode: string;
    redeemedUtcTime: string;
    redeemedAccount: string;
    diffWithOrderTimeSec: number;
  };
  merchantProofUrls: string[];
  status: '待仲裁' | '举证补齐中' | '已判定-支持用户' | '已判定-支持商户' | '双方和解结案';
  arbitrator?: string;
  verdictTime?: string;
  verdictNote?: string;
  createTime: string;
}

export interface PointsLedgerItem {
  id: string;
  serialNo: string;
  type: '充值入账' | '出卡结算' | '积点扣除' | '质押冻结' | '质押返还' | '商户分润';
  userOrMerchant: string;
  pointsChange: number;
  amountCny: number;
  balanceAfter: number;
  time: string;
  status: '成功' | '已冻结' | '已冲正';
  note: string;
}

// 账户管理
export interface FinanceAccountItem {
  id: string;
  accountNo: string;
  entityType: '用户 (出卡方)' | '商户 (接卡方)' | '平台备付金';
  entityName: string;
  entityId: string;
  currency: string;
  availableBalance: number; // 可用余额/积点
  frozenCollateral: number; // 质押冻结资金/积点
  pendingSettlement: number; // 待结算金额
  totalInflow: number; // 累计入账
  totalOutflow: number; // 累计出账
  status: '正常' | '部分冻结' | '风控锁定';
  updatedAt: string;
}

// 充值管理
export interface RechargeRecordItem {
  id: string;
  orderNo: string;
  merchantOrUserName: string;
  entityId: string;
  rechargeChannel: '企业对公银行电汇' | 'USDT-TRC20链上充值' | 'OPay企业通道' | '支付宝大额通道';
  payAmount: number;
  currency: string;
  pointsCredited: number;
  status: '充值成功' | '处理中' | '待人工复核' | '已冲正拦截';
  createTime: string;
  finishTime: string;
  operator: string;
  txHashOrReceipt?: string;
  note: string;
}

// 结算管理
export interface SettlementRecordItem {
  id: string;
  settlementNo: string;
  targetEntity: string;
  entityType: '商户接卡' | '用户出卡' | '渠道佣金';
  period: string;
  orderCount: number;
  tradeGmv: number;
  settleRate: string;
  settleAmount: number;
  deductFee: number;
  actualPayout: number;
  channel: 'USDT (TRC20)' | 'OPay Direct' | '境内银行对公';
  status: '已打款' | '待打款' | '审核中' | '打款失败挂起';
  applyTime: string;
  settleTime: string;
  payoutTxId?: string;
}

// 财务对账
export interface ReconciliationSummaryItem {
  id: string;
  reconcileDate: string;
  channelOrType: '系统全链路内部平衡' | 'USDT链上钱包对账' | '银行对公托管户' | 'OPay综合网关';
  systemTotalAmount: number;
  channelTotalAmount: number;
  diffAmount: number;
  status: '对账平齐' | '差异待平' | '调账已平衡';
  diffCount: number;
  lastCheckedTime: string;
  auditor: string;
  notes: string;
}

export interface MerchantCapabilityRule {
  id: string;
  ruleCode: string;
  cardName: string;
  icon: string;
  iconBg: string;
  country: string;
  countryCode: string;
  currency: string;
  mediaType: string;
  faceValueRange: string;
  faceValueNote: string;
  settleMethod: string;
  settleMethodType: 'api' | 'manual' | 'dual' | 'paused';
  rate: number;
  rateNote: string;
  singleLimit: string;
  dailyLimit: string;
  progressAmount: string;
  progressPercent: number;
  progressRemaining: string;
  workHours: string;
  workHoursNote: string;
  isActive: boolean;
}

export type ProcessingDenominationType = '不限' | '倍数面值' | '范围面值' | '指定面值';

export interface MerchantProcessingDurationRule {
  id: string;
  countries: string[];
  cardHeads: string[];
  cardTypes: string[];
  speeds: string[];
  denominationTypes: ProcessingDenominationType[];
  rangeMin?: number;
  rangeMax?: number;
  multipleBase?: number;
  multipleMin?: number;
  multipleMax?: number;
  specifiedValues?: string;
  processingDurationSec: number;
  afterSalesDurationMin: number;
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface MerchantProcessingCardRule {
  cardName: string;
  allowException: boolean;
  selfDelayEnabled: boolean;
  selfDelayMinutes: number;
  durationRules: MerchantProcessingDurationRule[];
}

export interface MerchantItem {
  id: string;
  mid: string;
  name: string;
  fullName: string;
  initial: string;
  colorClass: string;
  legalPerson: string;
  phone: string;
  email: string;
  remark?: string;
  vipTag: string;
  tier: string;
  tierCode?: 'S' | 'A' | 'B' | 'C';
  channelType: string;
  orgCode?: string; // 统一机构代码
  directSeatNode?: string; // 直连清算席位
  supportedRegions?: string[]; // 支持地区
  daysActive: number;
  seatsOnline: number;
  seatsTotal: number;
  is24h: boolean;
  status: '正常接卡' | '暂停接单' | '风控冻结' | '在线接单中' | '打烊暂停中' | '熔断管制中';
  apiLatency: string;
  supportedCards: { name: string; percent?: number; isTag?: boolean }[];
  todayOrders: number;
  todayGmvUsd: number;
  quotaUsedPercent: number;
  quotaMaxUsd: number;
  remainingQuotaUsd?: number;
  avgTimeSec: number;
  slaRate: number;
  disputeRateText?: string;
  starRating: number;
  collateralUsd: number;
  collateralStatus: string;
  points: number;
  pendingSettlementCny: number;
  kycStatus: string;
  reputationScore: number;
  riskTier: string;
  appId: string;
  webhookUrl: string;
  whitelistIps: string;
  settlementCycle: string;
  tags: string[];
  quotaCreditUsedCny: number;
  quotaCreditTotalCny: number;
  collateralPenaltyCount: number;
  disputeCount: number;
  capabilityRules?: MerchantCapabilityRule[];
  processingRuleConfigs?: MerchantProcessingCardRule[];
  pointsWallet?: MerchantPointsWallet;
  recentTrades: {
    id: string;
    card: string;
    currency: string;
    faceValue: number;
    rate: number;
    duration: string;
    durationHighlight?: boolean;
    settleCny: number;
    seat: string;
    status: string;
  }[];
  opsLogs: {
    time: string;
    operator: string;
    title: string;
    desc: string;
    type: 'primary' | 'secondary' | 'neutral';
  }[];
}

export interface MerchantPointsWallet {
  status: '正常' | '已被禁用';
  availablePoints: number;
  frozenPoints: number;
  totalRechargedPoints: number;
  withdrawnPoints: number;
  settledPoints: number;
  uAddress?: string;
  disabledInfo?: {
    reason: string;
    operatedAt: string;
    operator: string;
  };
  frozenDetails: MerchantFrozenPointsRecord[];
}

export interface MerchantFrozenPointsRecord {
  id: string;
  amount: number;
  frozenAt: string;
  operator: string;
}

// 经营分析 (Business Analytics) Interfaces
export interface BusinessOverviewMetric {
  gmvToday: number;
  gmvCompareYesterday: string;
  orderCountToday: number;
  orderCountCompare: string;
  platformNetRevenue: number;
  revenueCompare: string;
  activeUsersCount: number;
  activeMerchantsCount: number;
  verificationSlaRate: string;
  disputeRate: string;
}

export interface CardCategoryTradeStat {
  category: string;
  categoryIcon: string;
  gmvShare: number; // percentage e.g. 38.5
  gmvAmount: number;
  orderCount: number;
  avgDiscountRate: string;
  avgVerifySec: number;
  disputeCount: number;
  trend: 'up' | 'down' | 'steady';
}

export interface HourlyTrafficTrend {
  hour: string;
  gmv: number;
  orders: number;
  matchedRate: number;
}

export interface UserCohortStat {
  userGroup: string;
  userCount: number;
  gmvContribution: number;
  avgOrderAmount: number;
  repurchaseRate30d: string;
  riskIndex: string;
  churnRate: string;
}

export interface MerchantPerformanceStat {
  merchantId: string;
  merchantName: string;
  tier: 'S级认证商' | 'A级认证商' | '普通商户';
  dailyLimitUsedRatio: string;
  receivedGmvToday: number;
  verifiedOrderCount: number;
  avgVerificationTime: string;
  collateralBalance: number;
  disputeCount: number;
  slaCompliance: string;
}

export interface FinancialPnLStat {
  subject: string;
  type: '收入' | '成本' | '净收益' | '备付金及资金池';
  amountThisMonth: number;
  budgetRatio: string;
  compareLastMonth: string;
  notes: string;
}

// 业务配置 (Business Configuration) Interfaces
export interface CardConfigItem {
  id: string;
  name: string;
  code: string;
  category: '游戏点卡' | '应用流媒体' | '虚拟预付卡' | '电商零售';
  icon: string;
  currencies: string[];
  faceValues: string[];
  guideDiscountRate: string;
  settleDiscountRate: string;
  platformCommissionRate: string;
  slaSeconds: number;
  verifyMethod: 'API直连自动化' | 'OCR+网页核销' | '商户人工核验';
  status: 'active' | 'maintenance' | 'restricted';
  dailyGmvLimit: number;
  minAmount: number;
  maxAmount: number;
  ocrEnabled: boolean;
  priorityOrder: number;
}

export interface TradingRulesConfig {
  dispatchStrategy: 'collateral_priority' | 'sla_priority' | 'round_robin' | 'custom_whitelist';
  orderTimeoutSeconds: number;
  disputeWindowHours: number;
  baseCommissionRate: number;
  volumeTierDiscountRate: number;
  newUserMaxDailyLimit: number;
  newUserForceOcr: boolean;
  merchantMinCollateralRequirement: number;
  autoCompensateOnTimeout: boolean;
  timeoutCompensationPercent: number;
  evidenceRequirements: string[];
  riskInterceptThreshold: number;
}

export interface MessageConfigItem {
  id: string;
  name: string;
  eventCode: string;
  category: '交易撮合' | '履约超时' | '争议仲裁' | '商户风控' | '资金清算';
  channels: {
    dingtalk: boolean;
    sms: boolean;
    email: boolean;
    webSocket: boolean;
    telegram: boolean;
  };
  template: string;
  triggerCondition: string;
  enabled: boolean;
  recipientRoles: string[];
}

export interface BasicSystemConfig {
  platformName: string;
  systemStatus: 'normal' | 'maintenance' | 'read_only';
  primaryCurrency: 'CNY' | 'USDT';
  exchangeRateSource: string;
  exchangeRateBufferPercent: number;
  dailyCutoffTime: string;
  fastSettlementEnabled: boolean;
  enforce2FA: boolean;
  sessionTimeoutMinutes: number;
  apiSignAlgorithm: string;
  ipWhitelistEnabled: boolean;
  allowedIps: string[];
  auditLogRetentionDays: number;
  disasterRecoveryMode: boolean;
}

