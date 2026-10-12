// 商户运营模块数据类型定义 (PRD 13.3 规范)

// 1. 商户分层类型 (基于 贡献 × 报价竞争力 × 承接能力 × 履约质量 × 异常情况)
export type MerchantTierGrade =
  | 'CORE'           // 核心商户 (贡献高、履约稳、报价强)
  | 'GROWING'        // 成长商户 (高潜力、上升期)
  | 'STANDARD'       // 普通商户 (常态承接)
  | 'NEEDS_IMPROVE'  // 待改善商户 (报价偏弱/时效偏慢)
  | 'HIGH_RISK';     // 风险商户 (售后高/拒单高/异常多)

export interface MerchantTierItem {
  id: string;
  mid: string;
  name: string;
  tier: MerchantTierGrade;
  tierName: string;
  monthlyGmv: number;              // 贡献 GMV ($)
  monthlyOrders: number;           // 月订单量
  quoteCompetitiveness: number;    // 报价竞争力达标率 %
  capacityPoints: number;          // 承接能力 (可用积点/押金 $)
  fulfillmentSuccessRate: number;  // 履约成功率 %
  avgAcceptSeconds: number;        // 平均接单时延 (秒)
  avgProcessSeconds: number;       // 平均处理时延 (秒)
  aftersaleDisputeRate: number;    // 售后争议率 %
  anomalyCount: number;            // 异常事件数
  coveredSkuCount: number;         // 承接 SKU 数
  quotaWeight: string;             // 分流配额权重 (如 1.5x, 1.0x, 0.5x)
  resourceAllocation: string;      // 运营资源倾斜方案
  primaryBrands: string[];         // 主力承接品牌
}

// 2. 供给分析维度 (SKU 维度)
export type SkuSupplyHealthStatus =
  | 'HEALTHY'             // 供给充足 (>=3家竞价)
  | 'SINGLE_DEPENDENCY'   // 单商户依赖 (仅1家承接，单点脆弱)
  | 'NO_MERCHANT'         // 无商户承接 (完全断供)
  | 'MANY_NO_QUOTE'       // 商户多但无人挂牌报价
  | 'UNCOMPETITIVE_PRICE' // 有报价但严重低于市场价
  | 'LOW_ACCEPT_RATE';    // 有报价但实际接单率极低

export interface SkuSupplyAnalysisItem {
  skuId: string;
  brand: string;
  country: string;
  faceValue: number;
  currency: string;
  skuName: string;
  eligibleMerchantsCount: number;  // 可承接商户数量
  activeQuotingMerchants: number;  // 活跃报价商户数
  topQuotePrice: number;           // 当前最高买入折率 %
  marketBenchmarkPrice: number;    // 市场公允参考价 %
  monthlyVolume: number;           // 实际成交卡量
  monthlyGmv: number;              // 实际月度 GMV
  isSingleDependency: boolean;     // 是否存在单商户依赖
  dominantMerchantName?: string;   // 主导依赖商户
  dominantMerchantRatio?: number;  // 主导商户吞吐占比 %
  supplyStatus: SkuSupplyHealthStatus;
  statusText: string;
  actionSuggestion: string;        // 运营招募/促报价动作
}

// 3. 履约链路分析 (分发 ➔ 接单 ➔ 处理 ➔ 完成)
export interface FulfillmentDrilldownItem {
  key: string;
  merchantMid: string;
  merchantName: string;
  brand: string;
  country: string;
  skuName: string;
  dispatchedOrders: number;        // 平台分发订单数
  acceptedOrders: number;          // 商户接单数
  acceptRate: number;              // 接单率 %
  rejectedOrders: number;          // 拒单数
  rejectRate: number;              // 拒单率 %
  avgAcceptDurationSec: number;    // 接单时长 (秒)
  avgProcessDurationSec: number;   // 处理时长 (秒)
  completedOrders: number;         // 成功完成数
  completeRate: number;            // 完成率 %
  timeoutOrders: number;           // 超时订单数
  timeoutRate: number;             // 超时率 %
  transferOrders: number;          // 转单数 (拒单后重派)
  transferRate: number;            // 转单率 %
  failedOrders: number;            // 处理失败数
  failRate: number;                // 失败率 %
}

// 4. 商户经营问题
export type MerchantProblemCategory =
  | 'SUPPLY'       // 供给问题 (单商户依赖/断供)
  | 'QUOTE'        // 报价问题 (价格偏低/不响应)
  | 'ACCEPTANCE'   // 接单问题 (接单率下滑/频繁拒单)
  | 'FULFILLMENT'  // 履约问题 (处理成功率低/扫卡争议)
  | 'LATENCY'      // 时效问题 (超时未处理/核销慢)
  | 'QUALITY'      // 质量问题 (售后/风险高发)
  | 'CAPACITY';    // 资金问题 (积点不足停摆)

export type MerchantProblemStatus =
  | 'PENDING'      // 待处理
  | 'COMMUNICATING'// 约谈改善中
  | 'QUOTA_ADJUSTED' // 已调整分流权重
  | 'VERIFYING'    // 待验证成效
  | 'RESOLVED'     // 已恢复良好
  | 'PENALIZED';   // 已降级/暂停接单

export interface MerchantProblemItem {
  id: string;
  category: MerchantProblemCategory;
  categoryName: string;
  merchantMid: string;
  merchantName: string;
  title: string;
  description: string;
  affectedSkuScope: string;
  coreMetric: string;
  baseline: string;
  currentValue: string;
  impactLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: MerchantProblemStatus;
  suggestedAction: string;
  externalModuleLink?: {
    moduleName: string;
    path: string;
    actionLabel: string;
  };
  owner: string;
  updatedAt: string;
}
