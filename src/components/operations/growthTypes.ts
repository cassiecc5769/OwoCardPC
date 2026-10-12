// 增长运营模块数据类型 (PRD 13.2 规范)

// 1. 核心漏斗阶段
export type FunnelStageKey = 'LEADS' | 'REGISTERED' | 'FIRST_ORDER' | 'SECOND_ORDER' | 'ACTIVE';

export interface FunnelStageData {
  stageKey: FunnelStageKey;
  stageName: string;
  count: number;
  conversionRate: number; // 相对上一环节转化率 %
  overallRate: number;    // 相对初始流量转化率 %
  churnCount: number;     // 流失用户数
  churnRate: number;      // 流失率 %
  growthMoM: string;      // 环比变化
}

// 2. 增长健康度预警
export type GrowthHealthType =
  | 'REGISTRATION_DROP'
  | 'FIRST_ORDER_DROP'
  | 'REPURCHASE_DROP'
  | 'NEW_USER_GMV_DROP'
  | 'CHANNEL_QUALITY_DROP'
  | 'COUNTRY_BRAND_ANOMALY';

export interface GrowthHealthAlert {
  id: string;
  type: GrowthHealthType;
  title: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  metric: string;
  changeRate: string;
  affectedScope: string;
  detectedAt: string;
  targetTab: 'analysis' | 'problems';
  drilldownParam?: string;
  suggestedAction: string;
}

// 3. 渠道对比维度
export interface ChannelGrowthComparisonItem {
  channelId: string;
  channelName: string;
  channelType: 'KOL' | 'MEDIA' | 'AGENCY' | 'COMMUNITY' | 'ORGANIC';
  leadsCount: number;          // 访问/线索
  regRate: number;             // 注册率 %
  firstOrderRate: number;      // 首单率 %
  arpu: number;                // 客单价 $
  repurchaseRate: number;      // 复购率 %
  gmv: number;                 // GMV $
  aftersaleRate: number;       // 售后率 %
  riskRate: number;            // 风险率 %
  qualityTag: '优质高转化' | '假象大流量' | '高风险预警' | '稳健成长' | '潜力渠道';
  qualityReason: string;       // 质量诊断说明
}

// 4. 用户经营统一人群
export type CohortType =
  | 'REG_NO_FIRST_ORDER'   // 已注册未首单
  | 'FIRST_NO_REPURCHASE'  // 首单未复购
  | 'HIGH_FREQ_REPURCHASE' // 高频复购
  | 'HIGH_VALUE'           // 高价值
  | 'ACTIVITY_DECLINING'   // 活跃下降
  | 'SILENT'               // 沉默
  | 'CHURNED'              // 流失
  | 'REACTIVATED';         // 重新激活

export interface GrowthCohortItem {
  id: string;
  type: CohortType;
  name: string;
  userCount: number;
  percentage: number;      // 占比 %
  totalGmv: number;        // GMV $
  arpu: number;            // 客单价 $
  lastTransPeriod: string; // 最近交易时间分布
  primaryBrands: string[]; // 主要卡种
  primarySources: string[];// 主要来源
  definition: string;      // 规则口径
  suggestedAction: string; // 增长策略建议
}

// 5. 增长问题
export type GrowthProblemType =
  | 'ACQUISITION_ANOMALY'  // 拉新异常
  | 'REGISTRATION_ANOMALY' // 注册异常
  | 'FIRST_ORDER_ANOMALY'  // 首单异常
  | 'REPURCHASE_ANOMALY'   // 复购异常
  | 'USER_QUALITY_ANOMALY' // 用户质量异常
  | 'GMV_ANOMALY'          // GMV异常
  | 'AFTERSALE_ANOMALY'    // 售后异常
  | 'RISK_ANOMALY';        // 风险异常

export type GrowthProblemStatus =
  | 'PENDING'      // 待处理 (候选)
  | 'ANALYZING'    // 分析中
  | 'EXECUTING'    // 执行中
  | 'VERIFYING'    // 待验证
  | 'RECOVERED'    // 已恢复
  | 'IGNORED'      // 无需处理
  | 'CLOSED';      // 已关闭

export interface GrowthProblemItem {
  id: string;                      // Problem ID
  type: GrowthProblemType;         // 问题类型
  typeName: string;
  targetObject: string;            // 问题对象 (用户群/渠道/国家/SKU)
  metricName: string;              // 核心指标
  baselineValue: string;           // 基线值
  currentValue: string;            // 当前值
  changeMagnitude: string;         // 变化幅度 (-20% 等)
  affectedUsers: number;           // 影响用户数
  affectedGmv: number;             // 估算影响 GMV
  systemAnalysis: string;          // 系统自动发现的主要变化
  preliminaryCause: string;        // 运营确认初步原因
  owner: string;                   // 负责人
  status: GrowthProblemStatus;     // 当前状态
  strategyId?: string;             // 关联策略 Strategy ID
  planId?: string;                 // 关联计划 Plan ID
  updatedAt: string;
}

// 6. 增长策略
export type StrategyExecutionMethod =
  | 'CHANNEL_PROMOTION_SYSTEM' // 渠道推广系统 (外部触达)
  | 'IN_APP_PRICE_BOOST'       // 站内专属加价/保价权益
  | 'PUSH_AND_EMAIL_AUTOMATION'// 自动化 Push / 邮件
  | 'VIP_CS_PHONE_CALL';       // VIP 1对1 专属客服

export type StrategyStatus =
  | 'DRAFT'              // 策略配置中
  | 'SYNCED_TO_CHANNEL'  // 已同步渠道推广系统
  | 'EXECUTING'          // 触达执行中
  | 'CONVERGED_SUCCESS'  // 交易回流达标 (已验证)
  | 'CLOSED';            // 已闭环结案

export interface GrowthStrategyItem {
  id: string;                      // Strategy ID
  name: string;                    // 策略名称
  sourceProblemId: string;         // 来源问题 Problem ID
  sourceProblemTitle: string;      // 来源问题描述
  targetCohortName: string;        // 目标人群
  targetMetricName: string;        // 目标指标
  currentValue: string;            // 当前值
  targetValue: string;             // 目标值
  strategyDesc: string;            // 策略方案
  incentiveOffer: string;          // 活动/权益 (首单加价/奖励/返现红包)
  executionMethod: StrategyExecutionMethod; // 执行方式
  executionPeriod: string;         // 执行周期
  owner: string;                   // 负责人
  status: StrategyStatus;
  syncedTimestamp?: string;
  verificationResult?: string;     // 回流达标成效
}
