// 风控管理模块核心数据契约与标准定义 (PRD v3.0 对齐)

// 风险等级定义
export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

// 综合决策结果
// 核心原则：CHECK_FAILED 工具异常必须与 BLOCK 拦截完全分开！
export type PrecheckDecision = 'PASS' | 'REVIEW' | 'BLOCK' | 'CHECK_FAILED';

// 风险类型定义
export type RiskCategoryType =
  | 'ZERO_BALANCE' // 零余额
  | 'REDEEMED' // 已兑换
  | 'DUPLICATE_CARD' // 重复卡
  | 'FACE_MISMATCH' // 面额异常 / 不符
  | 'STATUS_ANOMALY' // 状态异常 (锁卡/未激活)
  | 'SUSPECTED_FRAUD' // 疑似欺诈 / 撞库
  | 'BLACKLIST_HIT' // 黑名单命中
  | 'HISTORY_DISPUTE' // 历史争议高频
  | 'QUERY_FAILED'; // 查询工具异常

// 卡种支持
export type SupportedRiskBrand =
  | 'Apple'
  | 'Steam'
  | 'Sephora'
  | 'Target'
  | 'Foot Locker'
  | "Macy's"
  | 'Vanilla'
  | 'Nike';

// 用户风险标签
export type UserRiskTag = '正常' | '关注' | '高风险';

// ---------------------------------------------------------------------------
// 1. 风控总览数据契约
// ---------------------------------------------------------------------------

export type TimeRangePreset = 'today' | 'yesterday' | '7days' | '30days';

export interface RiskOverviewKPIs {
  precheckCount: number; // 预检卡数
  riskCardCount: number; // 风险卡数
  riskCardRate: number; // 风险卡率 (%)
  autoBlockCount: number; // 自动拦截数
  pendingManualCount: number; // 待人工处理 (当前未处理异常卡)
  riskInvolvedAmount: number; // 风险涉及金额 ($)
  avoidedLossAmount: number; // 今日避免损失 ($)
  // 环比 / 同比
  precheckGrowthRate: number;
  riskRateGrowthRate: number;
  avoidedLossGrowthRate: number;
}

// 风险结构：按风险类型
export interface RiskTypeStatItem {
  key: RiskCategoryType;
  name: string;
  count: number;
  ratioPct: number;
  amount: number;
  periodGrowthPct: number;
  colorClass: string;
}

// 风险结构：按卡种
export interface RiskBrandStatItem {
  brand: SupportedRiskBrand;
  name: string;
  precheckCount: number;
  riskCount: number;
  riskRate: number;
  amount: number;
  isSpikeAnomaly: boolean; // 是否出现突增异常
}

// 风险结构：按风险等级
export interface RiskLevelStatItem {
  level: RiskLevel;
  levelName: string;
  count: number;
  ratioPct: number;
  amount: number;
  badgeClass: string;
}

// 风险预警卡片
export interface RiskWarningCardItem {
  id: string;
  title: string;
  issueDesc: string;
  currentVal: string;
  baselineVal: string;
  affectedCards: number;
  involvedAmount: number;
  startTime: string;
  riskLevel: RiskLevel;
  suggestedAction: string;
  filterRiskType: string;
  filterBrand?: SupportedRiskBrand;
}

// ---------------------------------------------------------------------------
// 2. 交易预检数据契约
// ---------------------------------------------------------------------------

export interface PrecheckCheckItem {
  key: string;
  name: string;
  status: 'PASSED' | 'WARNING' | 'FAILED' | 'ERROR';
  resultText: string;
  ruleId?: string;
  description: string;
}

export interface PrecheckRecordItem {
  id: string; // Card ID (如 CRD-20261005-091)
  orderId: string; // 关联卡单号 (如 ORD-20261005-882)
  userId: string;
  userName: string;
  userRiskTag: UserRiskTag;
  brand: SupportedRiskBrand;
  country: string;
  cardCodeMasked: string;
  pinMasked?: string;
  declaredValue: number;
  queryBalance: number;
  cardStatus: string;
  currency: string;
  duplicateCheck: '正常' | '命中';
  balanceCheck: '正常' | '异常';
  faceMatchCheck: '一致' | '异常';
  userRiskCheck: '正常' | '关注' | '风险';
  blacklistCheck: '未命中' | '命中';
  decisionResult: PrecheckDecision;
  riskLevel: RiskLevel;
  precheckTime: string;
  defaultAction: string;
  // Card Check 详细凭证
  cardCheckDetail: {
    balance: number;
    cardStatusText: string;
    source: string;
    checkTime: string;
    isSuccess: boolean;
    isToolError: boolean;
    latencyMs: number;
    rawEvidenceSignature: string;
    errorCode?: string;
  };
  checkItems: PrecheckCheckItem[];
}

// ---------------------------------------------------------------------------
// 3. 异常卡数据契约 (处理工作池)
// ---------------------------------------------------------------------------

export type AbnormalCardStatus = '待处理' | '处理中' | '待确认' | '已处理';

export type AbnormalStandardAction =
  | '放行'
  | '阻断'
  | '重新查询'
  | '转人工查卡'
  | '重新报价'
  | '转售后'
  | '转商户异常'
  | '加入风险关注'
  | '关闭异常';

export interface AbnormalResolutionResult {
  action: AbnormalStandardAction;
  finalVerdict: '已放行' | '已阻断' | '已重新报价' | '已转售后' | '已确认风险' | '已确认误报';
  handler: string;
  reason: string;
  isFalsePositive: boolean; // 是否判定为误报
  handledAt: string;
  writeBackOrderId?: string;
}

export interface AbnormalEvidenceItem {
  id: string;
  type: 'Card Check 记录' | '历史余额快照' | '重复卡记录' | '用户历史争议' | '相关关联订单' | '黑名单记录' | '商户处理结果';
  title: string;
  detail: string;
  time: string;
  source: string;
}

export interface AbnormalCardItem {
  exceptionId: string; // 异常单号 (如 EXP-20261005-001)
  cardId: string;
  orderId: string;
  userId: string;
  userName: string;
  userRiskTag: UserRiskTag;
  brand: SupportedRiskBrand;
  country: string;
  cardCodeMasked: string;
  declaredValue: number;
  actualBalance: number;
  currency: string;
  riskType: string;
  riskLevel: RiskLevel;
  ruleId: string;
  ruleDescription: string;
  systemSuggestedAction: string;
  currentHandler: string;
  slaRemainingMinutes: number; // 剩余分钟数
  isOverdue: boolean; // 是否已超时
  isNearOverdue: boolean; // 是否即将超时 (<15min)
  status: AbnormalCardStatus;
  evidenceList: AbnormalEvidenceItem[];
  resolution?: AbnormalResolutionResult;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// 4. 风险记录数据契约 (永久档案)
// ---------------------------------------------------------------------------

export interface RiskTimelineNode {
  time: string;
  action: string;
  operator: string;
  note: string;
}

export interface RiskEventRecordItem {
  riskEventId: string; // 风险事件编号 (如 RISK-EVT-20261005-001)
  cardId: string;
  orderId: string;
  userId: string;
  userName: string;
  merchantId?: string;
  merchantName?: string;
  riskType: string;
  riskLevel: RiskLevel;
  triggerRule: string;
  evidence: string;
  amount: number;
  interceptAmount: number;
  action: string;
  result: string;
  handler: string;
  createdTime: string;
  closedTime: string;
  timeline: RiskTimelineNode[];
}

// ---------------------------------------------------------------------------
// 5. 统一风险对象与用户风险画像 (PRD 4.1 - 4.5)
// ---------------------------------------------------------------------------

export type RiskEntityType = 'CARD' | 'ORDER' | 'USER' | 'RELATED_USER' | 'DEVICE' | 'MERCHANT';

export interface RelatedAccountInfo {
  userId: string;
  userName: string;
  relationshipType: '同设备指纹' | '推荐/邀请关系' | '相同提现地址' | '相同IP网段' | '相似交易行为';
  associationScore: number; // 关联度 %
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCK';
  tradeAllowed: boolean;
}

export interface UserRiskProfile {
  userId: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  deviceFingerprint: string;
  currentRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCK';
  currentTradeRestrictions: string;
  currentDispatchRestrictions: string;
  
  // 核心风险维度 (4.3)
  historicalRiskOrdersCount: number;
  historicalRiskOrdersAmount: number;
  riskCardsCount: number;
  afterSaleDisputesCount: number;
  cardProbeSweepsCount: number;
  chargebackFraudCount: number;
  
  // 关联账号 (4.4)
  relatedAccounts: RelatedAccountInfo[];
  
  // 交易控制动作 Matrix (4.5)
  actionMatrix: {
    allowTrade: boolean;
    requireManualReview: boolean;
    extendCollateralStakingHours: number; // 延长质押小时数 (如 72h)
    restrictSkus: string[];
    maxTradeAmountLimit: number;
    routeToFallbackMerchantOnly: boolean;
    blockTrade: boolean;
  };
}
