// 报价运营模块核心数据契约与标准统一 SKU 定义 (PRD 11.3)

// 统一 SKU：Brand × Country × Currency × Card Form × Denomination × Speed
// 示例：Apple / US / USD / $100 / E-Code / Fast
export interface StandardSKU {
  id: string; // SKU唯一代码，例如 SKU-APPL-US-USD-ECODE-FAST-100
  brand: string; // Brand, e.g. Apple
  country: string; // Country, e.g. US
  currency: string; // Currency, e.g. USD
  cardForm: 'E-Code' | 'Physical' | 'Receipt' | 'Direct-PIN' | string; // Card Form
  denomination: number; // 面额
  speed: 'Fast' | 'Standard' | string; // 交易速度: Fast (秒级) | Standard (标准)
  formattedSKU: string; // 标准格式化字符串: Apple / US / USD / $100 / E-Code / Fast
}

// 11.3.3 按SKU Tab 主表列表数据项
export interface SKUQuoteOverview {
  sku: StandardSKU;
  activeMerchantCount: number; // 有效报价商户数
  highestQuote: number; // 当前最高商户报价 (%)
  lowestQuote: number; // 当前最低商户报价 (%)
  platformTargetPrice: number; // 平台当前目标用户报价 (%)
  marketReferencePrice: number | null; // 外部市场参考 (%)；若为 null 显示“暂无市场参考”
  bestMarketDiff: number | null; // 平台最优报价与市场差 (pp)
  competitiveness: '优势' | '正常' | '关注' | '异常'; // 竞争力状态
  bestMerchant: { id: string; name: string }; // 当前最高报价商户
  status: '生效' | '失效'; // 报价状态
  updatedAt: string; // 最新报价时间
}

// 11.3.3 SKU 详情 drawer 中展示的各个商户明细报价
export interface SKUMerchantQuoteDetail {
  merchantId: string;
  merchantName: string;
  merchantTier: string;
  currentQuote: number; // 当前报价 (%)
  rank: number; // 商户排名 #1, #2...
  bestPriceDiff: number; // 与最优价差 (pp)
  marketPriceDiff: number | null; // 与市场价差 (pp)
  quoteStatus: '生效' | '失效'; // 报价状态
  acceptanceStatus: '在线' | '暂停' | '限额预警'; // 接单状态
  acceptanceRate: number; // 接单率 (%)
  successRate: number; // 成功率 (%)
  updatedAt: string;
}

// 11.3.4 按商户 Tab 商户维度列表
export interface MerchantQuoteOverview {
  merchantId: string;
  merchantName: string;
  merchantTier: string;
  totalSKUs: number; // 报价 SKU 数
  activeQuotes: number; // 生效报价数
  advantageSKUs: number; // 优势 SKU 数量
  normalSKUs: number; // 正常 SKU 数量
  attentionSKUs: number; // 关注 SKU 数量
  abnormalSKUs: number; // 异常 SKU 数量
  avgMarketDiff: number; // 综合平均市场价差 (pp)
  lastAdjustTime: string; // 最近调价时间
  status: '正常' | '暂停' | '授信预警'; // 商户状态
}

// 11.3.4 点击商户进入其报价详情列表项
export interface MerchantSKUQuoteMatrixItem {
  sku: StandardSKU;
  currentQuote: number; // 当前报价
  competitiveness: '优势' | '正常' | '关注' | '异常';
  marketReferencePrice: number | null;
  diffToMarket: number | null;
  status: '生效' | '失效';
  updatedAt: string;
}

// 11.3.5 调价记录 Tab 核心数据项
export interface PriceChangeRecordItem {
  changeId: string; // Change ID, e.g. CHG-20261005-081
  merchantId: string;
  merchantName: string;
  sku: StandardSKU;
  oldQuote: number; // 原报价 (%)
  newQuote: number; // 新报价 (%)
  diff: number; // 变化 (+0.10 / -0.15)
  adjustSource: '商户自发' | '系统策略' | '运营应急干预' | '机器人推导'; // 调整来源
  operator: string; // 修改人 / 系统 ID
  adjustedAt: string; // 调整时间
  effectiveStatus: '已生效' | '已撤销' | '待审核'; // 是否生效
}

// 11.3.6 报价计算器输入输出契约
export interface QuoteCalculatorData {
  sku?: StandardSKU;
  brand: string;
  country: string;
  currency: string;
  cardForm: string;
  speed: string;
  denomination: number;
  currentExchangeRate: number; // 当前汇率
  marketReferencePrice: number | null; // 市场参考价
  platformTargetPrice: number; // 平台目标价
  highestMerchantQuote: number; // 最高商户报价
  lowestMerchantQuote: number; // 最低商户报价
  estimatedProfitMargin: number; // 预计利润空间 (%)
  estimatedProfitVal: number; // 预计利润额 ($)
}

// 报价管理字段：
// SKU ｜ 市场参考 ｜ 运营标准 ｜ 商户报价 ｜ 价差 ｜ 积点 ｜ 承接状态 ｜ 竞争力状态
export type CompetitivenessStatus = '强竞争力' | '达标基准' | '边缘偏弱' | '严重倒挂';
export type AcceptanceStatus = '正常接单' | '额度充裕' | '限额预警' | '暂停承接';

export interface QuoteItem {
  id: string;
  sku: StandardSKU;
  merchantId: string;
  merchantName: string;
  merchantTier: 'Tier-S' | 'Tier-A' | 'Tier-B';
  marketReferencePrice: number; // 市场参考价 (百分比或折率, e.g. 92.5%)
  operatingStandard: number; // 平台运营标准 (e.g. 91.8%)
  merchantQuote: number; // 商户报价 (e.g. 91.0%)
  priceDiffPp: number; // 价差 (商户报价 - 运营标准, e.g. -0.80pp)
  availablePoints: number; // 积点 (可用承接积分/保证金质押点数, e.g. 250000)
  acceptanceStatus: AcceptanceStatus; // 承接状态
  competitivenessStatus: CompetitivenessStatus; // 竞争力状态
  lastUpdatedAt: string;
  isProblematic: boolean; // 是否处于异常名单
}

// 报价监控 22.1 数据来源
// 保存：来源 ｜ 原始商品 ｜ 原始报价 ｜ 标准SKU ｜ 采集时间 ｜ 有效期 ｜ 置信度 ｜ 状态
export interface MarketRawSourceItem {
  id: string;
  source: string; // 来源平台 (如 Paxful API, Noones B2B, CoinCola API, Cardtonic Gateway, Tbay Pro)
  rawProduct: string; // 原始商品名 (e.g. "Apple Gift Card US - Digital 100 USD Instant")
  rawQuote: number; // 原始报价 (e.g. 93.10%)
  currency?: string; // 币种 (e.g. USD)
  standardSkuCode: string; // 映射的标准SKU (e.g. "Apple / US / USD / $100 / E-Code / Fast")
  isMapped: boolean; // 是否已完成 SKU 映射
  collectedAt: string; // 采集时间
  validUntil: string; // 有效期
  validitySeconds: number; // 有效秒数倒计时
  confidenceScore: number; // 置信度 (0 ~ 100, e.g. 98%)
  status: '有效' | '正常' | '即将失效' | '已过期' | '异常剔除';
  reliabilityWeight: number; // 来源可靠度权重 (0.0 ~ 1.0)
  isOutlier: boolean; // 是否被异常值过滤算法 (3-Sigma / IQR) 标记
}

// 报价竞争力计算推导核心参数
export interface PricingEngineParams {
  marketReferencePrice: number; // 市场参考价 (e.g. 92.5%)
  targetUserQuote: number; // 用户目标报价 (e.g. 88.0%)
  platformMarginRate: number; // 平台毛利要求 (e.g. 3.2%)
  exchangeRateRiskCost: number; // 汇率及过桥波动准备金 (e.g. 0.5%)
  riskCostBadCardRate: number; // 坏卡拦截与售后兜底风险成本 (e.g. 0.4%)
  derivedMerchantStandard: number; // 最终推导出的商户运营标准底线 (e.g. 91.8%)
}

// 报价异常
// 规则参数：价差阈值 ｜ 异常商户数 ｜ 异常比例 ｜ 持续时间 ｜ 行情有效期
export interface AnomalyRuleConfig {
  diffThresholdPp: number; // 价差阈值 (pp) e.g. 0.8
  minAnomalyMerchants: number; // 异常商户数 (家) e.g. 3
  anomalyRatioThreshold: number; // 异常比例 (%) e.g. 30
  durationThresholdMinutes: number; // 持续时间 (分钟) e.g. 15
  marketValiditySeconds: number; // 行情有效期 (秒) e.g. 300
}

// 异常类型：商户级异常 vs 平台级异常 (平台级优先级更高)
export type AnomalySeverity = '平台级异常' | '商户级异常';

// 11.5.9 报价异常/监控统一 Quote Problem 对象 (PRD 11.5)
export type QuoteProblemType = '平台级' | '商户级' | '无问题';
export type QuoteMonitorStatus = '正常' | '关注' | '异常待处理' | '处理中' | '已恢复';

export interface QuoteProblemItem {
  id: string; // Quote Problem ID, e.g. PRB-20261006-001
  sku: StandardSKU; // SKU ID / StandardSKU
  problemType: QuoteProblemType; // Problem Type (平台级 / 商户级)
  marketPrice: number; // Market Price (外部行情 %, e.g. 84.80)
  targetPrice: number; // Target Price (平台目标 %, e.g. 84.50)
  bestMerchantPrice: number; // Best Merchant Price (当前最高商户报价 %, e.g. 83.10)
  gap: number; // Gap (价差 pp, e.g. -1.40)
  affectedMerchantCount: number; // Affected Merchant count (异常商户数)
  totalMerchantCount: number; // Total Merchant count (有效商户数)
  anomalyRatio: number; // 异常商户占比 (%)
  affectedMerchantNames: string[]; // 影响商户列表
  affectedGmv: number; // Affected GMV ($/日)
  severity: '平台级异常' | '商户级异常' | '正常' | '关注'; // Severity
  startTime: string; // Start Time
  durationMinutes: number; // Duration (分钟)
  owner: string; // Owner (负责人)
  status: QuoteMonitorStatus; // Status (正常 / 关注 / 异常待处理 / 处理中 / 已恢复)
  recoveryTime?: string; // Recovery Time
  competitiveness: '优势' | '正常' | '关注' | '异常'; // Competitiveness
  systemVerdict: string; // 系统判断说明
  merchantQuotesList: SKUMerchantQuoteDetail[]; // 关联商户报价明细
  trendData: Array<{ time: string; marketPrice: number; bestMerchantPrice: number; targetPrice: number }>; // 市场趋势
  auditLogs: Array<{
    time: string;
    operator: string;
    action: string;
    remark: string;
  }>;
}

// 24.1 异常闭环流转状态：
// 待处理 → 已提醒 → 待调整 → 已调整 → 待复核 → 已恢复
export type AnomalyWorkflowStatus = '待处理' | '已提醒' | '待调整' | '已调整' | '待复核' | '已恢复';

export interface QuoteAnomalyTicket {
  id: string; // 异常工单号 e.g. ANO-20261005-001
  severity: AnomalySeverity; // 平台级异常 (更高优先级) vs 商户级异常
  standardSku: StandardSKU;
  marketReferencePrice: number;
  operatingStandard: number;
  problematicMerchants: Array<{
    merchantId: string;
    merchantName: string;
    currentQuote: number;
    diffPp: number;
    points: number;
    remindedAt?: string;
    adjustedQuote?: number;
  }>;
  totalMerchantsCount: number;
  anomalyRatio: number; // 异常商户占比 e.g. 60%
  durationMinutes: number;
  status: AnomalyWorkflowStatus; // 待处理 → 已提醒 → 待调整 → 已调整 → 待复核 → 已恢复
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  auditLogs: Array<{
    time: string;
    operator: string;
    action: string;
    remark: string;
  }>;
}

// 市场行情
// 支持：当前行情 ｜ 历史行情 ｜ 来源对比 ｜ 趋势 (按卡种 / 国家 / SKU 查询)
export interface MarketTrendSKUData {
  sku: StandardSKU;
  currentReferencePrice: number;
  highestSource: { source: string; rate: number };
  lowestSource: { source: string; rate: number };
  averageRate: number;
  sourcesBreakdown: Array<{
    sourceName: string;
    rate: number;
    confidence: number;
    latencyMs: number;
    updatedAt: string;
  }>;
  historyTimeline: Array<{
    timeStr: string;
    referencePrice: number;
    marketHigh: number;
    marketLow: number;
    platformStandard: number;
  }>;
  volatility24h: number; // 24小时波动率
}

// 调价记录
// 保存：商户 ｜ SKU ｜ 原报价 ｜ 新报价 ｜ 调整时间 ｜ 关联异常 ｜ 调整后竞争力 ｜ 恢复时间
// 用于判断：哪些商户长期需要人工催价
export interface PriceAdjustRecord {
  id: string;
  recordNo: string;
  merchantId: string;
  merchantName: string;
  merchantTier: string;
  sku: StandardSKU;
  oldQuote: number; // 原报价 (e.g. 90.20%)
  newQuote: number; // 新报价 (e.g. 91.80%)
  diffPp: number; // 调整点数 (e.g. +1.60pp)
  adjustedAt: string; // 调整时间
  associatedAnomalyId: string; // 关联异常单号
  postAdjustmentCompetitiveness: CompetitivenessStatus; // 调整后竞争力
  recoveredAt: string; // 恢复时间 (闭环耗时)
  responseTimeMinutes: number; // 响应耗时
  isManualReminded: boolean; // 是否需人工催价
  reminderCount: number; // 本次被催促次数
}
