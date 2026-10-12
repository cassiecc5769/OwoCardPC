// 会员运营模块数据类型定义 (PRD 13.4 规范)

// 1. 会员等级配置
export type MemberLevelCode = 'V0' | 'V1' | 'V2' | 'V3' | 'V4' | 'BLACK_GOLD';

export interface MemberLevelConfigItem {
  id: string;
  levelCode: MemberLevelCode;
  levelName: string;
  badgeColor: string;
  upgradeCondition: string;   // 升级条件 (GMV / 交易次数)
  maintainCondition: string;  // 保级条件 (周期交易)
  downgradeCondition: string; // 降级条件 (长期不活跃)
  quoteBonusRate: number;     // 报价加成溢价 % (如 +0.5% ~ +1.5%)
  privileges: string[];       // 核心权益列表
  validityPeriodMonths: number; // 有效期 (月)
  memberCount: number;        // 当前会员数
  percentage: number;         // 占会员大盘 %
  avgMonthlyGmv: number;      // 该等级月均 GMV
  avgOrderCount: number;      // 该等级月均出卡笔数
}

// 2. 会员 vs 非会员 对比维度
export interface MemberVsNonMemberComparison {
  dimension: string;
  memberValue: string;
  nonMemberValue: string;
  ratioOrDiff: string;
  statusText: string;
}

// 3. 会员生命周期阶段
export type MemberLifecycleStageKey =
  | 'NEW_MEMBER'         // 新会员 (首单后30天)
  | 'GROWING_MEMBER'     // 成长会员 (连续交易)
  | 'HIGH_VALUE_MEMBER'  // 高价值会员 (高GMV/高频)
  | 'ACTIVITY_DECLINING' // 活跃下降 (交易频次下降)
  | 'SILENT_MEMBER'      // 沉默会员 (X天未交易)
  | 'CHURNED_MEMBER';    // 流失会员 (长期未交易)

export interface MemberLifecycleStageItem {
  stageKey: MemberLifecycleStageKey;
  stageName: string;
  tagColor: string;
  definitionRule: string;     // 示例规则口径
  primaryGoal: string;        // 主要经营目标
  userCount: number;          // 覆盖会员数
  userPercentage: number;     // 占比 %
  avgMonthlyGmv: number;      // 人均月 GMV
  avgOrderFreq: string;       // 出卡频次
  riskOrHealthTag: 'HEALTHY' | 'STABLE' | 'WARNING' | 'ALERT' | 'CHURNED';
  suggestedAction: string;    // 针对性经营动作
  incentivePackage: string;   // 适配权益包
}
