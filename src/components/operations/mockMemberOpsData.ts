import {
  MemberLevelConfigItem,
  MemberVsNonMemberComparison,
  MemberLifecycleStageItem
} from './memberOpsTypes';

// 1. 会员等级配置矩阵 (PRD 13.4.3)
export const INITIAL_MEMBER_LEVELS: MemberLevelConfigItem[] = [
  {
    id: 'LVL-V0',
    levelCode: 'V0',
    levelName: '普通注册用户',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    upgradeCondition: '注册账号并完成基础实名认证',
    maintainCondition: '无保级要求',
    downgradeCondition: '无降级',
    quoteBonusRate: 0.0,
    privileges: ['标准牌价结算', '常规客服支持', '基础提单验真'],
    validityPeriodMonths: 999,
    memberCount: 5730,
    percentage: 19.1,
    avgMonthlyGmv: 45.0,
    avgOrderCount: 0.6
  },
  {
    id: 'LVL-V1',
    levelCode: 'V1',
    levelName: '青铜会员 (首单新人)',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    upgradeCondition: '完成首笔卡单交易 (任意面额)',
    maintainCondition: '永久不过期',
    downgradeCondition: '无降级',
    quoteBonusRate: 0.2,
    privileges: ['全卡种报价溢价 +0.2%', '出卡提现免手续费', '新人进阶加价礼包'],
    validityPeriodMonths: 999,
    memberCount: 14200,
    percentage: 47.3,
    avgMonthlyGmv: 110.0,
    avgOrderCount: 1.4
  },
  {
    id: 'LVL-V2',
    levelCode: 'V2',
    levelName: '白银会员 (活跃出卡)',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    upgradeCondition: '近 90 天累计出卡 >= $500.00 或 3 笔有效交易',
    maintainCondition: '每季度完成出卡 >= $200.00',
    downgradeCondition: '季度未达保级线降级至 V1',
    quoteBonusRate: 0.5,
    privileges: ['全卡种报价溢价 +0.5%', '极速审核绿色通道', '大促提前专享选品'],
    validityPeriodMonths: 12,
    memberCount: 6850,
    percentage: 22.8,
    avgMonthlyGmv: 420.0,
    avgOrderCount: 3.5
  },
  {
    id: 'LVL-V3',
    levelCode: 'V3',
    levelName: '黄金会员 (核心骨干)',
    badgeColor: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    upgradeCondition: '近 90 天累计出卡 >= $2,500.00 或 10 笔有效交易',
    maintainCondition: '每季度完成出卡 >= $1,000.00',
    downgradeCondition: '季度未达保级线降级至 V2',
    quoteBonusRate: 0.8,
    privileges: ['全卡种报价溢价 +0.8%', '优先撮合 Tier-1 核心商户', '延时出卡保价特权'],
    validityPeriodMonths: 12,
    memberCount: 2420,
    percentage: 8.1,
    avgMonthlyGmv: 1650.0,
    avgOrderCount: 7.2
  },
  {
    id: 'LVL-V4',
    levelCode: 'V4',
    levelName: '铂金至尊 (高净值)',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    upgradeCondition: '近 90 天累计出卡 >= $10,000.00 或 30 笔有效交易',
    maintainCondition: '每季度完成出卡 >= $4,000.00',
    downgradeCondition: '季度未达保级线降级至 V3',
    quoteBonusRate: 1.2,
    privileges: ['报价溢价 +1.2%', '大额免预检极速秒放款', '专属 VIP 客服驻点'],
    validityPeriodMonths: 12,
    memberCount: 680,
    percentage: 2.3,
    avgMonthlyGmv: 5200.0,
    avgOrderCount: 16.5
  },
  {
    id: 'LVL-BLACK',
    levelCode: 'BLACK_GOLD',
    levelName: '黑金王者 (机构大户)',
    badgeColor: 'bg-slate-900 text-amber-300 border-slate-700',
    upgradeCondition: '近 90 天累计出卡 >= $30,000.00 (受邀准入)',
    maintainCondition: '专属商务经理季度评估',
    downgradeCondition: '由平台合规与业务委员会审议',
    quoteBonusRate: 1.8,
    privileges: ['报价溢价 +1.8%', '1对1 定制买入大宗协议价', '平台授信垫付', '7x24h 专属风控直连'],
    validityPeriodMonths: 12,
    memberCount: 120,
    percentage: 0.4,
    avgMonthlyGmv: 18500.0,
    avgOrderCount: 42.0
  }
];

// 2. 会员 vs 非会员 经营价值对比矩阵 (PRD 13.4.2)
export const INITIAL_MEMBER_VS_NON_MEMBER: MemberVsNonMemberComparison[] = [
  {
    dimension: '交易贡献 GMV',
    memberValue: '$2,480,000 / 月',
    nonMemberValue: '$1,140,000 / 月',
    ratioOrDiff: '会员贡献 68.5% 全盘 GMV',
    statusText: '会员体系带来 2.17 倍 GMV 产出'
  },
  {
    dimension: '30 天复购率',
    memberValue: '72.4%',
    nonMemberValue: '28.5%',
    ratioOrDiff: '+43.9pp 高留存',
    statusText: '会员复购频次显著领先，出卡心智稳固'
  },
  {
    dimension: '交易客单价 (ARPU)',
    memberValue: '$215.0',
    nonMemberValue: '$68.0',
    ratioOrDiff: '3.16 倍客单价差距',
    statusText: '高等级会员倾向于提交大额/多张卡券组合'
  },
  {
    dimension: '月均出卡频次',
    memberValue: '4.8 次 / 月',
    nonMemberValue: '1.2 次 / 月',
    ratioOrDiff: '4.0 倍交易活跃度',
    statusText: '黄金及以上会员形成高频每周固定出卡习惯'
  },
  {
    dimension: '售后与争议纠纷率',
    memberValue: '0.6%',
    nonMemberValue: '3.8%',
    ratioOrDiff: '低于非会员 84.2%',
    statusText: '会员信用良好，极少发生恶意提交空卡欺诈'
  },
  {
    dimension: '90 天用户流失率',
    memberValue: '8.5%',
    nonMemberValue: '48.2%',
    ratioOrDiff: '流失率大幅降低 39.7pp',
    statusText: '保级与加价权益形成强大护城河'
  }
];

// 3. 六大会员生命周期阶段 (PRD 13.4.4)
export const INITIAL_MEMBER_LIFECYCLES: MemberLifecycleStageItem[] = [
  {
    stageKey: 'NEW_MEMBER',
    stageName: '新会员 (首单后30天)',
    tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    definitionRule: '完成首单进入体系 <= 30天，尚未形成稳定二次出卡',
    primaryGoal: '促二单 (30天内完成第2笔交易)',
    userCount: 3820,
    userPercentage: 15.7,
    avgMonthlyGmv: 95.0,
    avgOrderFreq: '1.1次/月',
    riskOrHealthTag: 'HEALTHY',
    suggestedAction: '新客成长任务：下发二单限时加价 +1.0% 券，引导添加企微客服',
    incentivePackage: '二单立返 $5 红包 + 100 积分'
  },
  {
    stageKey: 'GROWING_MEMBER',
    stageName: '成长会员 (连续交易)',
    tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
    definitionRule: '处于 V2/V3 等级，近 60 天出卡频次 >= 2次，处于上升活跃期',
    primaryGoal: '提升频次 (激励跃迁黄金/铂金高阶等级)',
    userCount: 6850,
    userPercentage: 28.2,
    avgMonthlyGmv: 480.0,
    avgOrderFreq: '3.6次/月',
    riskOrHealthTag: 'STABLE',
    suggestedAction: '阶梯冲级奖励：月累计满 $1,000 额外奖励 500 积分与极速审核特权',
    incentivePackage: '阶梯加息券 + 冲级返佣'
  },
  {
    stageKey: 'HIGH_VALUE_MEMBER',
    stageName: '高价值会员 (高GMV/高频)',
    tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
    definitionRule: 'V4 铂金及黑金王者，月均 GMV >= $3,000，且出卡频次 >= 10次',
    primaryGoal: '长效高留存与专属大宗撮合保全',
    userCount: 800,
    userPercentage: 3.3,
    avgMonthlyGmv: 6200.0,
    avgOrderFreq: '18.5次/月',
    riskOrHealthTag: 'HEALTHY',
    suggestedAction: '1对1专属商务客户经理走访，配置定制化大宗保价与 0 账期极速授信',
    incentivePackage: '黑金专属 1.8% 溢价 + 0手续费垫资'
  },
  {
    stageKey: 'ACTIVITY_DECLINING',
    stageName: '活跃下降会员 (流失预警)',
    tagColor: 'bg-amber-50 text-amber-800 border-amber-200',
    definitionRule: '原 V2~V4 会员，近 30 天交易频次或金额环比下滑超 45%',
    primaryGoal: '防流失干预与保级预警唤醒',
    userCount: 1420,
    userPercentage: 5.8,
    avgMonthlyGmv: 210.0,
    avgOrderFreq: '0.8次/月',
    riskOrHealthTag: 'WARNING',
    suggestedAction: '提前 15 天 Push 与短信下发保级预警，提供限时保级加价救济券',
    incentivePackage: '限时保级 +1.2% 加价救济券'
  },
  {
    stageKey: 'SILENT_MEMBER',
    stageName: '沉默会员 (45~90天无交易)',
    tagColor: 'bg-rose-50 text-rose-700 border-rose-200',
    definitionRule: '账号处于 V1~V3，已超过 45 天无任何登录、查价或提单记录',
    primaryGoal: '定向唤醒 (触发重新出卡)',
    userCount: 3100,
    userPercentage: 12.8,
    avgMonthlyGmv: 0.0,
    avgOrderFreq: '0次/月',
    riskOrHealthTag: 'ALERT',
    suggestedAction: '形成增长策略发送给渠道推广系统，批量定向触达「回归专属礼包」',
    incentivePackage: '老友回归 $10 礼包 + 限时保级'
  },
  {
    stageKey: 'CHURNED_MEMBER',
    stageName: '流失会员 (>90天未交易)',
    tagColor: 'bg-slate-100 text-slate-600 border-slate-200',
    definitionRule: '曾为会员但已超过 90 天无交易，等级已降级或失效',
    primaryGoal: '大促召回与再激活',
    userCount: 8280,
    userPercentage: 34.1,
    avgMonthlyGmv: 0.0,
    avgOrderFreq: '0次/月',
    riskOrHealthTag: 'CHURNED',
    suggestedAction: '季度大促联合外部投放与专属邮件重新拉活，完成首笔即恢复历史等级',
    incentivePackage: '大促限时恢复白银资格'
  }
];
