// 运营计划数据类型定义 (PRD 13.5 规范)

export type PlanStatus =
  | 'DRAFT'        // 草稿
  | 'IN_PROGRESS'  // 进行中
  | 'VERIFYING'    // 待验证 (计划周期结束，系统读取指标中)
  | 'COMPLETED'    // 已完成 (达标后关闭)
  | 'ADJUSTING'    // 调整中 (未达标或部分达标，调整后重新进入进行中)
  | 'CANCELLED'    // 已取消
  | 'CLOSED';      // 已关闭

export type VerificationResult =
  | 'ACHIEVED'        // 达标
  | 'PARTIAL_ACHIEVED'// 部分达标
  | 'NOT_ACHIEVED'    // 未达标
  | 'INSUFFICIENT_DATA'; // 数据不足

export type PlanSourceCategory =
  | 'GROWTH_PROBLEM'   // 增长问题
  | 'MERCHANT_PROBLEM' // 商户问题
  | 'MEMBER_PROBLEM'   // 会员问题
  | 'QUOTE_PROBLEM'    // 报价问题
  | 'MANUAL_CREATED';  // 运营人工创建

export type PlanPriority = 'P0_CRITICAL' | 'P1_HIGH' | 'P2_MEDIUM';

// D. 行动项
export interface PlanActionItem {
  id: string;
  actionTitle: string;        // 行动项内容
  owner: string;              // 负责人
  executorParty: string;      // 执行方 (平台 / 渠道推广系统 / 商户端 / 运营组)
  startDate: string;          // 开始时间
  dueDate: string;            // 截止时间
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'; // 状态
  completionNote?: string;    // 完成说明
}

// E. 指标跟踪节点
export interface MetricTrendPoint {
  date: string;
  metricValue: number;
  label?: string;
}

// 核心运营计划模型 (覆盖 A~F 六大区域)
export interface OperationPlanItem {
  // A. 计划概览
  id: string;                 // Plan ID (如 PLAN-202610-01)
  name: string;               // 计划名称
  owner: string;              // 负责人
  participants: string[];     // 参与人
  startDate: string;          // 开始时间
  endDate: string;            // 计划结束时间
  status: PlanStatus;         // 当前状态
  priority: PlanPriority;     // 优先级

  // B. 经营问题 (为什么做)
  sourceCategory: PlanSourceCategory; // 来源分类
  sourceCategoryName: string;
  sourceProblemId?: string;   // 来源 Problem ID (如 PROB-20261006-01)
  sourceProblemTitle: string; // 来源问题说明
  affectedObject: string;     // 影响对象 (如 东南亚社群引流 × Apple US)
  currentProblemMetric: string; // 发现问题时的当前指标
  normalBaselineMetric: string; // 正常基线
  problemCause: string;       // 问题根本原因
  expectedBusinessImpact: string; // 预计业务影响

  // C. 目标 (必须是经营指标)
  targetMetricName: string;   // 经营目标指标名 (如 Apple US 新用户首单率)
  baselineValue: number;      // 基线值 (如 22.0)
  targetValue: number;        // 目标值 (如 30.0)
  currentValue: number;       // 当前值 (如 27.6)
  unit: string;               // 单位 (% / $ / 秒)

  // D. 行动项 (关键经营行动)
  actionItems: PlanActionItem[];

  // E. 指标跟踪 (Baseline ➔ Target ➔ Current 及趋势)
  metricTrend: MetricTrendPoint[];

  // F. 效果验证 (待验证 ➔ 达标 / 部分达标 / 未达标 / 数据不足)
  verificationCycle: string;  // 验证周期 (如 "计划结束后持续观测 7 天")
  verificationResult?: VerificationResult; // 验证结果
  verificationSummary?: string; // 验证结论与数据
  verifiedAt?: string;        // 验证时间
}
