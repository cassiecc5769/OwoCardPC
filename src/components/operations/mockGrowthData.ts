import {
  FunnelStageData,
  GrowthHealthAlert,
  ChannelGrowthComparisonItem,
  GrowthCohortItem,
  GrowthProblemItem,
  GrowthStrategyItem
} from './growthTypes';

// 1. 核心增长大盘漏斗
export const INITIAL_GROWTH_FUNNEL: FunnelStageData[] = [
  {
    stageKey: 'LEADS',
    stageName: '访问/线索',
    count: 100000,
    conversionRate: 100.0,
    overallRate: 100.0,
    churnCount: 70000,
    churnRate: 70.0,
    growthMoM: '+8.5%'
  },
  {
    stageKey: 'REGISTERED',
    stageName: '新注册用户',
    count: 30000,
    conversionRate: 30.0,
    overallRate: 30.0,
    churnCount: 21000,
    churnRate: 70.0,
    growthMoM: '+12.4%'
  },
  {
    stageKey: 'FIRST_ORDER',
    stageName: '首单用户',
    count: 9000,
    conversionRate: 30.0,
    overallRate: 9.0,
    churnCount: 4500,
    churnRate: 50.0,
    growthMoM: '-4.2% (预警)'
  },
  {
    stageKey: 'SECOND_ORDER',
    stageName: '二单/复购',
    count: 4500,
    conversionRate: 50.0,
    overallRate: 4.5,
    churnCount: 1300,
    churnRate: 28.9,
    growthMoM: '+3.1%'
  },
  {
    stageKey: 'ACTIVE',
    stageName: '持续活跃沉淀',
    count: 3200,
    conversionRate: 71.1,
    overallRate: 3.2,
    churnCount: 0,
    churnRate: 0.0,
    growthMoM: '+6.8%'
  }
];

// 2. 增长健康度自动标记预警
export const INITIAL_GROWTH_HEALTH_ALERTS: GrowthHealthAlert[] = [
  {
    id: 'ALERT-01',
    type: 'FIRST_ORDER_DROP',
    title: '注册 ➔ 首单转化率连续 7 天下滑',
    severity: 'HIGH',
    metric: '首单率 30.0% (基准 36.5%)',
    changeRate: '-17.8%',
    affectedScope: '东南亚新渠道引入用户 / Apple US 卡种',
    detectedAt: '2026-10-06 09:30',
    targetTab: 'problems',
    drilldownParam: 'PROB-20261006-01',
    suggestedAction: '确认问题候选，制定「首单价格激励+定向触达」策略并同步渠道推广系统'
  },
  {
    id: 'ALERT-02',
    type: 'CHANNEL_QUALITY_DROP',
    title: '渠道【CH-Media-04 短视频引流】出现质量倒挂',
    severity: 'HIGH',
    metric: '注册量 +45%，但首单率仅 8.2%、售后纠纷率达 12.4%',
    changeRate: '-65.0% 质量下降',
    affectedScope: 'CH-Media-04 短视频引流矩阵',
    detectedAt: '2026-10-06 08:15',
    targetTab: 'analysis',
    drilldownParam: 'CH-Media-04',
    suggestedAction: '该渠道属于假象大流量，需暂停引流补贴并联动渠道推广系统调整投放计划'
  },
  {
    id: 'ALERT-03',
    type: 'REPURCHASE_DROP',
    title: 'Steam Global 卡种 30 天复购周期拉长且复购率下降',
    severity: 'MEDIUM',
    metric: '复购率 41.2% (基准 52.0%)',
    changeRate: '-10.8pp',
    affectedScope: 'Steam Global / Razer 核心出卡玩家',
    detectedAt: '2026-10-05 18:00',
    targetTab: 'problems',
    drilldownParam: 'PROB-20261006-02',
    suggestedAction: '触发商户端加价撮合特权，下发限时 1.2% 游戏玩家加息券'
  },
  {
    id: 'ALERT-04',
    type: 'COUNTRY_BRAND_ANOMALY',
    title: 'Sephora US 卡种首次转化与成单率突发异常',
    severity: 'MEDIUM',
    metric: '有效成单率 68.0% (历史 91.5%)',
    changeRate: '-23.5pp',
    affectedScope: '美国北美区 / Sephora $100-$500 面额',
    detectedAt: '2026-10-05 14:20',
    targetTab: 'problems',
    drilldownParam: 'PROB-20261006-03',
    suggestedAction: '查验报价通道是否存在竞品价格倒挂，排查商户接单时延'
  }
];

// 3. 渠道增长表现对比 (强调识别假象优质渠道)
export const INITIAL_CHANNEL_GROWTH_LIST: ChannelGrowthComparisonItem[] = [
  {
    channelId: 'CH-KOL-01',
    channelName: 'YouTube 游戏科技大V推荐',
    channelType: 'KOL',
    leadsCount: 28500,
    regRate: 34.2,
    firstOrderRate: 42.5,
    arpu: 148.5,
    repurchaseRate: 58.2,
    gmv: 425000,
    aftersaleRate: 0.8,
    riskRate: 0.3,
    qualityTag: '优质高转化',
    qualityReason: '受众粘性高，首单快、复购周期短，低风险优质供给渠道'
  },
  {
    channelId: 'CH-MEDIA-04',
    channelName: 'TikTok 短视频矩阵信息流',
    channelType: 'MEDIA',
    leadsCount: 42000,
    regRate: 38.6,
    firstOrderRate: 8.2,
    arpu: 35.0,
    repurchaseRate: 11.4,
    gmv: 48500,
    aftersaleRate: 12.4,
    riskRate: 8.9,
    qualityTag: '假象大流量',
    qualityReason: '注册量巨大但首单和复购极差，欺诈空卡与售后纠纷高发，不可盲目按注册量计酬'
  },
  {
    channelId: 'CH-COMM-02',
    channelName: 'Discord 跨境卡商公会',
    channelType: 'COMMUNITY',
    leadsCount: 12000,
    regRate: 46.8,
    firstOrderRate: 56.0,
    arpu: 380.0,
    repurchaseRate: 68.5,
    gmv: 620000,
    aftersaleRate: 1.2,
    riskRate: 0.5,
    qualityTag: '优质高转化',
    qualityReason: '大额高频专业出卡群体，人均 GMV 极高，核心重点维护'
  },
  {
    channelId: 'CH-AGENCY-03',
    channelName: '东南亚区域分销代理网络',
    channelType: 'AGENCY',
    leadsCount: 11500,
    regRate: 22.4,
    firstOrderRate: 28.5,
    arpu: 95.0,
    repurchaseRate: 38.0,
    gmv: 112000,
    aftersaleRate: 3.8,
    riskRate: 2.1,
    qualityTag: '稳健成长',
    qualityReason: '区域渗透稳步上升，首单与复购率处于健康基准线以上'
  },
  {
    channelId: 'CH-ORG-01',
    channelName: '平台自然搜索与官网口碑',
    channelType: 'ORGANIC',
    leadsCount: 6000,
    regRate: 41.0,
    firstOrderRate: 48.0,
    arpu: 180.0,
    repurchaseRate: 52.0,
    gmv: 216000,
    aftersaleRate: 0.6,
    riskRate: 0.2,
    qualityTag: '优质高转化',
    qualityReason: '品牌心智成熟，获客成本零，转化与留存指标极佳'
  }
];

// 4. 8大用户经营统一人群
export const INITIAL_GROWTH_COHORTS: GrowthCohortItem[] = [
  {
    id: 'COHORT-01',
    type: 'REG_NO_FIRST_ORDER',
    name: '已注册未首单人群 (新人漏斗阻滞)',
    userCount: 21000,
    percentage: 35.0,
    totalGmv: 0,
    arpu: 0,
    lastTransPeriod: '注册 > 7天 无提单',
    primaryBrands: ['Apple', 'Steam', 'Google Play'],
    primarySources: ['TikTok 矩阵', '社群引流'],
    definition: '成功注册账号但 7 天内未发起任何卡单交易',
    suggestedAction: '下发新人极速首单加价 +$3 激励，由渠道推广系统定向触达'
  },
  {
    id: 'COHORT-02',
    type: 'FIRST_NO_REPURCHASE',
    name: '首单未复购人群 (次留阻滞)',
    userCount: 4500,
    percentage: 7.5,
    totalGmv: 427500,
    arpu: 95.0,
    lastTransPeriod: '首单后 15~45天 无新单',
    primaryBrands: ['Steam', 'Razer', 'Apple'],
    primarySources: ['YouTube KOL', '自然搜索'],
    definition: '完成 1 笔交易，但超过 30 天未再次发起交易',
    suggestedAction: '配置「二单专属 1.0% 加价券」，APP Push 结合邮件召回'
  },
  {
    id: 'COHORT-03',
    type: 'HIGH_FREQ_REPURCHASE',
    name: '高频复购核心人群 (主力供给)',
    userCount: 3200,
    percentage: 5.3,
    totalGmv: 1856000,
    arpu: 580.0,
    lastTransPeriod: '近 7 天内均有出卡',
    primaryBrands: ['Apple', 'Steam', 'Sephora', 'Target'],
    primarySources: ['Discord 公会', '老客转介绍'],
    definition: '近 30 天出卡 >= 5 次，且无高危风险记录',
    suggestedAction: '升级黑金特权通道，开通快速极速审核放款与大宗协议价'
  },
  {
    id: 'COHORT-04',
    type: 'HIGH_VALUE',
    name: '高价值大客户出卡人群 (VIP大额)',
    userCount: 850,
    percentage: 1.4,
    totalGmv: 2980000,
    arpu: 3505.0,
    lastTransPeriod: '近 14 天内有出卡',
    primaryBrands: ['Apple $500', 'Vanilla Visa', 'Nordstrom'],
    primarySources: ['专属商务渠道', '线下卡商'],
    definition: '月累计 GMV >= $3000 的高净值出卡用户',
    suggestedAction: '配置专属客服 1 对 1 服务，提供全天候定制报价撮合'
  },
  {
    id: 'COHORT-05',
    type: 'ACTIVITY_DECLINING',
    name: '活跃下降预警人群 (流失苗头)',
    userCount: 1680,
    percentage: 2.8,
    totalGmv: 342000,
    arpu: 203.5,
    lastTransPeriod: '近 14 天交易频次环比 -50%',
    primaryBrands: ['Steam', 'Apple'],
    primarySources: ['YouTube KOL'],
    definition: '以往月均 >= 3 单，近两周仅查价但未提交',
    suggestedAction: '通过 VIP 客服电联调研，下发限时专属挽留补贴'
  },
  {
    id: 'COHORT-06',
    type: 'SILENT',
    name: '沉默沉睡人群 (60天无交互)',
    userCount: 5600,
    percentage: 9.3,
    totalGmv: 168000,
    arpu: 30.0,
    lastTransPeriod: '未登录未出卡 >= 60天',
    primaryBrands: ['Google Play', 'Razer'],
    primarySources: ['推广活动'],
    definition: '连续 60 天无任何登录、查价或交易行为',
    suggestedAction: '短信批量下发大额限时保价通知，激活沉睡资产'
  },
  {
    id: 'COHORT-07',
    type: 'CHURNED',
    name: '已流失用户人群 (>90天无交易)',
    userCount: 8200,
    percentage: 13.7,
    totalGmv: 0,
    arpu: 0,
    lastTransPeriod: '90天以上完全无动静',
    primaryBrands: ['各种历史卡种'],
    primarySources: ['全渠道'],
    definition: '曾有成交历史，但 >90 天无任何平台行为',
    suggestedAction: '纳入季度大促召回名单，配合外部渠道投放二次触达'
  },
  {
    id: 'COHORT-08',
    type: 'REACTIVATED',
    name: '重新激活回流人群 (召回成功)',
    userCount: 920,
    percentage: 1.5,
    totalGmv: 184000,
    arpu: 200.0,
    lastTransPeriod: '沉默后近 7 天重新提单',
    primaryBrands: ['Apple', 'Steam'],
    primarySources: ['短信召回', '专属客服'],
    definition: '沉睡 60 天以上，受策略激励在近 7 天内完成新交易',
    suggestedAction: '巩固回流效果，发放二单续期红包避免再次沉默'
  }
];

// 5. 增长问题完整数据集 (PRD 13.2.4 八大核心字段与状态机)
export const INITIAL_GROWTH_PROBLEMS: GrowthProblemItem[] = [
  {
    id: 'PROB-20261006-01',
    type: 'FIRST_ORDER_ANOMALY',
    typeName: '首单异常',
    targetObject: '东南亚社群引流渠道 (CH-AGENCY-03) × Apple 卡种',
    metricName: '首单转化率',
    baselineValue: '36.5%',
    currentValue: '22.0%',
    changeMagnitude: '-14.5pp (-39.7%)',
    affectedUsers: 2450,
    affectedGmv: 232000,
    systemAnalysis: '新用户注册后卡在提单引导页，新手教程跳出率高达 62%，提单流程缺乏即时加价利益点提示。',
    preliminaryCause: '东南亚新用户对卡码上传校验存在顾虑，且首屏缺乏针对新人的限时增值返现刺激。',
    owner: '运营专家 (李明)',
    status: 'EXECUTING',
    strategyId: 'STRAT-202610-01',
    planId: 'PLAN-202610-Q4-01',
    updatedAt: '2026-10-06 11:20'
  },
  {
    id: 'PROB-20261006-02',
    type: 'REPURCHASE_ANOMALY',
    typeName: '复购异常',
    targetObject: 'Steam Global 玩家出卡群体 (COHORT-02)',
    metricName: '30天复购率',
    baselineValue: '52.0%',
    currentValue: '41.2%',
    changeMagnitude: '-10.8pp (-20.7%)',
    affectedUsers: 1320,
    affectedGmv: 145000,
    systemAnalysis: '主要竞品近期针对 Steam 卡开展补贴活动（买入折率高 0.8%），导致首单用户次月被分流。',
    preliminaryCause: '平台在 Steam 卡品类的挂牌保价缺乏二次出卡加息机制，用户对比价格后发生流失。',
    owner: '卡种运营 (张伟)',
    status: 'ANALYZING',
    strategyId: 'STRAT-202610-02',
    planId: 'PLAN-202610-Q4-02',
    updatedAt: '2026-10-06 10:15'
  },
  {
    id: 'PROB-20261006-03',
    type: 'USER_QUALITY_ANOMALY',
    typeName: '用户质量异常',
    targetObject: '渠道【CH-Media-04 短视频矩阵】引入人群',
    metricName: '首单完成率 / 售后争议率',
    baselineValue: '首单率 35% / 售后率 <2%',
    currentValue: '首单率 8.2% / 售后率 12.4%',
    changeMagnitude: '首单 -76% / 售后超标 6 倍',
    affectedUsers: 4200,
    affectedGmv: 48500,
    systemAnalysis: '引流素材过度夸大高额返现，吸引大量羊毛党提交无效空卡，严重消耗风控及客服资源。',
    preliminaryCause: '推广代理商投放素材偏离真实卡券交易，招募低质羊毛刷单人员。',
    owner: '渠道合规 (王芳)',
    status: 'PENDING',
    updatedAt: '2026-10-06 08:30'
  },
  {
    id: 'PROB-20261006-04',
    type: 'GMV_ANOMALY',
    typeName: 'GMV异常',
    targetObject: '北美大额核心出卡人群 (COHORT-04)',
    metricName: '大客户周均交易 GMV',
    baselineValue: '$680,000 / 周',
    currentValue: '$490,000 / 周',
    changeMagnitude: '-27.9%',
    affectedUsers: 120,
    affectedGmv: 190000,
    systemAnalysis: '5 位月 GMV 超 5 万美金的大客户出卡频次骤减，部分转为小额试探。',
    preliminaryCause: '近期提现到账时延偶发波动，引发大额出卡人对资金结算时效的担忧。',
    owner: 'VIP客户总监 (刘晨)',
    status: 'VERIFYING',
    strategyId: 'STRAT-202610-03',
    planId: 'PLAN-202610-Q4-03',
    updatedAt: '2026-10-05 17:40'
  },
  {
    id: 'PROB-20261006-05',
    type: 'REGISTRATION_ANOMALY',
    typeName: '注册异常',
    targetObject: '拉美西语区移动端落地页 (ES-Mobile)',
    metricName: '落地页注册转化率',
    baselineValue: '28.0%',
    currentValue: '16.5%',
    changeMagnitude: '-11.5pp (-41.0%)',
    affectedUsers: 5600,
    affectedGmv: 85000,
    systemAnalysis: '西语翻译存在术语不准确，且短信验证码网关在墨西哥和智利存在 18% 丢包率。',
    preliminaryCause: '第三方短信通道不稳定，且本地化翻译存在歧义。',
    owner: '技术与增长 (陈工)',
    status: 'RECOVERED',
    updatedAt: '2026-10-04 15:00'
  }
];

// 6. 增长策略完整数据集 (PRD 13.2.5 明确平台运营与渠道推广系统边界)
export const INITIAL_GROWTH_STRATEGIES: GrowthStrategyItem[] = [
  {
    id: 'STRAT-202610-01',
    name: '注册未首单用户定向首单加价转化策略',
    sourceProblemId: 'PROB-20261006-01',
    sourceProblemTitle: '东南亚新渠道首单转化率骤降 (-39.7%)',
    targetCohortName: '注册 7 天未首单出卡新人 (COHORT-01)',
    targetMetricName: '首单转化率',
    currentValue: '22.0%',
    targetValue: '32.0% (+10.0pp)',
    strategyDesc: '新用户注册第 2 天与第 5 天自动触发首单加价权益；简化新手出卡流程，免除首次小额验真等待。',
    incentiveOffer: '首单立享 +1.5% 增值补贴 + 专属 $3 现金抵扣红包',
    executionMethod: 'CHANNEL_PROMOTION_SYSTEM',
    executionPeriod: '2026-10-06 ~ 2026-10-20 (14天)',
    owner: '运营专家 (李明)',
    status: 'EXECUTING',
    syncedTimestamp: '2026-10-06 11:30',
    verificationResult: '首单率已回升至 28.4% (达标 64%)'
  },
  {
    id: 'STRAT-202610-02',
    name: 'Steam Global 游戏出卡玩家复购提升方案',
    sourceProblemId: 'PROB-20261006-02',
    sourceProblemTitle: 'Steam 30 天复购率持续下滑 (-10.8pp)',
    targetCohortName: '首单已完成但 30 天未复购出卡人 (COHORT-02)',
    targetMetricName: '30 天复购率',
    currentValue: '41.2%',
    targetValue: '52.0% (+10.8pp)',
    strategyDesc: '联动商户端调高 Steam 挂牌保价买入折率，出卡即赠二单续期加价券，APP Push + 邮件定向唤醒。',
    incentiveOffer: 'Steam 专属 +1.0% 加价券 + 积分双倍返还',
    executionMethod: 'IN_APP_PRICE_BOOST',
    executionPeriod: '2026-10-07 ~ 2026-10-25 (18天)',
    owner: '卡种运营 (张伟)',
    status: 'SYNCED_TO_CHANNEL',
    syncedTimestamp: '2026-10-06 10:45'
  },
  {
    id: 'STRAT-202610-03',
    name: '北美高净值大客户 1对1 结算专线保全策略',
    sourceProblemId: 'PROB-20261006-04',
    sourceProblemTitle: '核心出卡大客户周交易 GMV 下滑 27.9%',
    targetCohortName: '大额高价值出卡人 (COHORT-04)',
    targetMetricName: '大客户周交易 GMV',
    currentValue: '$490,000 / 周',
    targetValue: '$680,000 / 周 (恢复正常水平)',
    strategyDesc: '开通极速结算放款专属绿色通道，由 VIP 客户总监 1 对 1 专属客服电联走访，锁定大额协议买入价。',
    incentiveOffer: '提现手续费全免 + 0 账期极速放款 + 专享 93.8% 协议折率',
    executionMethod: 'VIP_CS_PHONE_CALL',
    executionPeriod: '2026-10-01 ~ 2026-10-15 (15天)',
    owner: 'VIP客户总监 (刘晨)',
    status: 'CONVERGED_SUCCESS',
    syncedTimestamp: '2026-10-01 09:00',
    verificationResult: '本周 GMV 已恢复至 $695,000 (超额 102% 达标)'
  }
];
