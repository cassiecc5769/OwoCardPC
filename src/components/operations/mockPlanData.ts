import { OperationPlanItem } from './planTypes';

export const INITIAL_OPERATION_PLANS: OperationPlanItem[] = [
  {
    id: 'PLAN-202610-01',
    name: '东南亚新用户首单转化攻坚改善计划',
    owner: '李明 (增长运营专家)',
    participants: ['张伟 (渠道运营)', '王芳 (客服专员)', '刘工 (前端开发)'],
    startDate: '2026-10-01',
    endDate: '2026-10-15',
    status: 'IN_PROGRESS',
    priority: 'P0_CRITICAL',

    // B. 经营问题
    sourceCategory: 'GROWTH_PROBLEM',
    sourceCategoryName: '增长问题',
    sourceProblemId: 'PROB-20261006-01',
    sourceProblemTitle: '东南亚社群渠道引入新用户注册➔首单转化率严重跌破基线',
    affectedObject: '东南亚社群代理引流 (CH-AGENCY-03) × Apple US 卡种',
    currentProblemMetric: '首单转化率 22.0%',
    normalBaselineMetric: '正常基线 36.5%',
    problemCause: '新用户对卡码上传校验存在顾虑，且首屏缺乏针对新人的限时增值返现刺激。',
    expectedBusinessImpact: '导致月度流失近 2,450 位潜在首单出卡人，估算影响 $23.2万 GMV 产出。',

    // C. 目标 (必须是经营指标)
    targetMetricName: 'Apple US 新用户首单率',
    baselineValue: 22.0,
    targetValue: 30.0,
    currentValue: 27.6,
    unit: '%',

    // D. 行动项
    actionItems: [
      {
        id: 'ACT-01',
        actionTitle: '调整首单权益：配置 +1.5% 专属加价补贴券与 $3 现金抵扣红包',
        owner: '李明',
        executorParty: '平台运营中枢',
        startDate: '2026-10-01',
        dueDate: '2026-10-03',
        status: 'COMPLETED',
        completionNote: '权益已在营销资产库上架并关联策略'
      },
      {
        id: 'ACT-02',
        actionTitle: '配置目标人群包：圈选注册 7 天内未出卡新人 (COHORT-01)',
        owner: '李明',
        executorParty: '平台运营中枢',
        startDate: '2026-10-03',
        dueDate: '2026-10-04',
        status: 'COMPLETED',
        completionNote: '人群包已生成共 21,000 人'
      },
      {
        id: 'ACT-03',
        actionTitle: '推送触达执行：发送渠道推广系统，由社群推广员与 AI 助手定向下发教程与补贴',
        owner: '张伟',
        executorParty: '渠道推广系统',
        startDate: '2026-10-05',
        dueDate: '2026-10-12',
        status: 'IN_PROGRESS'
      },
      {
        id: 'ACT-04',
        actionTitle: '落地页新手引导简化：免除首次小额验真等待',
        owner: '刘工',
        executorParty: '前端开发组',
        startDate: '2026-10-06',
        dueDate: '2026-10-10',
        status: 'IN_PROGRESS'
      }
    ],

    // E. 指标跟踪
    metricTrend: [
      { date: '10/01', metricValue: 22.0, label: '基线立项' },
      { date: '10/03', metricValue: 23.5 },
      { date: '10/05', metricValue: 25.8, label: '权益上线' },
      { date: '10/06', metricValue: 27.6, label: '当前最新' }
    ],

    // F. 效果验证
    verificationCycle: '计划执行结束 (10/15) 后持续观测 7 天至 10/22 读取真实达标率'
  },
  {
    id: 'PLAN-202610-02',
    name: 'Apple US $500 大额面额单商户承接破局计划',
    owner: '王雪 (商户运营专家)',
    participants: ['赵强 (风控经理)', '陈明 (商务总监)'],
    startDate: '2026-09-26',
    endDate: '2026-10-05',
    status: 'VERIFYING',
    priority: 'P0_CRITICAL',

    // B. 经营问题
    sourceCategory: 'MERCHANT_PROBLEM',
    sourceCategoryName: '商户问题',
    sourceProblemId: 'M-PROB-01',
    sourceProblemTitle: 'Apple US $500 大额面额全盘 92% 依赖单商户承接',
    affectedObject: 'Apple Gift Card US $500 (SKU-APP-US-500)',
    currentProblemMetric: '单商户承接依赖率 92.0%',
    normalBaselineMetric: '健康基线 <= 50.0%',
    problemCause: '其他商户缺乏大额积点质押额度与大额验真卡工具权限，导致分流不均。',
    expectedBusinessImpact: '一旦主导商户额度耗尽或掉线，大额高价值出卡人将面临直接断供流失。',

    // C. 目标
    targetMetricName: '主导商户承接集中度',
    baselineValue: 92.0,
    targetValue: 50.0,
    currentValue: 46.5,
    unit: '%',

    // D. 行动项
    actionItems: [
      {
        id: 'ACT-21',
        actionTitle: '为招财进宝 (MID-1001) 与鼎盛数字 (MID-1002) 开放大额卡工具权限',
        owner: '王雪',
        executorParty: '卡工具管理中枢',
        startDate: '2026-09-26',
        dueDate: '2026-09-27',
        status: 'COMPLETED',
        completionNote: '已完成商户授权配置'
      },
      {
        id: 'ACT-22',
        actionTitle: '协调财务为新接入大额商户提供 1:1.5 杠杆积点授信支持',
        owner: '陈明',
        executorParty: '财务结算中枢',
        startDate: '2026-09-28',
        dueDate: '2026-09-29',
        status: 'COMPLETED'
      },
      {
        id: 'ACT-23',
        actionTitle: '调整撮合分流引擎，由单商户锁定改为按报价与时效动态三家竞价',
        owner: '赵强',
        executorParty: '撮合引擎组',
        startDate: '2026-09-30',
        dueDate: '2026-10-02',
        status: 'COMPLETED'
      }
    ],

    // E. 指标跟踪
    metricTrend: [
      { date: '09/26', metricValue: 92.0, label: '单商户垄断' },
      { date: '09/29', metricValue: 78.0, label: '新增2家商户' },
      { date: '10/02', metricValue: 54.0, label: '动态撮合' },
      { date: '10/05', metricValue: 46.5, label: '进入验证期' }
    ],

    // F. 效果验证
    verificationCycle: '观测周期 10/05 ~ 10/12',
    verificationResult: 'ACHIEVED',
    verificationSummary: '当前主导商户占比已压降至 46.5% (优于目标 <=50%)，三家商户承兑顺畅，消除断供风险。',
    verifiedAt: '2026-10-06 15:00'
  },
  {
    id: 'PLAN-202610-03',
    name: 'Steam Global 核心玩家复购提频专项计划',
    owner: '张伟 (卡种与会员运营)',
    participants: ['李明 (增长组)', '周工 (Push推送)'],
    startDate: '2026-09-15',
    endDate: '2026-09-30',
    status: 'COMPLETED',
    priority: 'P1_HIGH',

    // B. 经营问题
    sourceCategory: 'GROWTH_PROBLEM',
    sourceCategoryName: '增长问题',
    sourceProblemId: 'PROB-20261006-02',
    sourceProblemTitle: 'Steam 游戏出卡玩家首单后 30 天复购率持续下滑',
    affectedObject: 'Steam Global 玩家群体 (COHORT-02)',
    currentProblemMetric: '30 天复购率 41.2%',
    normalBaselineMetric: '健康基线 52.0%',
    problemCause: '竞品补贴导致次月流失，平台缺乏二单专属续期加息机制。',
    expectedBusinessImpact: '月度损失近 1,320 笔游戏卡二次出卡，影响流水 $14.5万。',

    // C. 目标
    targetMetricName: 'Steam 30 天复购率',
    baselineValue: 41.2,
    targetValue: 52.0,
    currentValue: 54.8,
    unit: '%',

    // D. 行动项
    actionItems: [
      {
        id: 'ACT-31',
        actionTitle: '联合商户端调高 Steam 挂牌买入折率 +0.5pp',
        owner: '张伟',
        executorParty: '报价运营中枢',
        startDate: '2026-09-15',
        dueDate: '2026-09-18',
        status: 'COMPLETED'
      },
      {
        id: 'ACT-32',
        actionTitle: '配置「二单专属 1.0% 加价券」，APP Push 结合邮件自动下发',
        owner: '周工',
        executorParty: '自动化营销触达',
        startDate: '2026-09-18',
        dueDate: '2026-09-25',
        status: 'COMPLETED'
      }
    ],

    // E. 指标跟踪
    metricTrend: [
      { date: '09/15', metricValue: 41.2, label: '基线' },
      { date: '09/20', metricValue: 46.0 },
      { date: '09/25', metricValue: 51.5 },
      { date: '09/30', metricValue: 54.8, label: '超额达标' }
    ],

    // F. 效果验证
    verificationCycle: '观测周期 09/30 ~ 10/06',
    verificationResult: 'ACHIEVED',
    verificationSummary: '复购率最终达成 54.8% (目标 52.0%)，超额完成 105.4%，正式归档结案。',
    verifiedAt: '2026-10-06 10:00'
  },
  {
    id: 'PLAN-202610-04',
    name: '活跃下降高价值大客户 1对1 挽留保全计划',
    owner: '刘晨 (VIP客户总监)',
    participants: ['王芳 (客服专员)', '陈明 (财务结算)'],
    startDate: '2026-10-02',
    endDate: '2026-10-18',
    status: 'IN_PROGRESS',
    priority: 'P0_CRITICAL',

    // B. 经营问题
    sourceCategory: 'MEMBER_PROBLEM',
    sourceCategoryName: '会员问题',
    sourceProblemId: 'M-PROB-04',
    sourceProblemTitle: '核心出卡大客户周均交易 GMV 下滑 27.9%，面临分流风险',
    affectedObject: '北美大额核心出卡人群 (COHORT-04 / 黑金王者)',
    currentProblemMetric: '大客户周均 GMV $49.0万',
    normalBaselineMetric: '正常基线 $68.0万',
    problemCause: '近期提现结算偶发时延引发大客户顾虑，部分转为小额试探。',
    expectedBusinessImpact: '若大客户完全流失将造成每周近 $20万 核心供给真空。',

    // C. 目标
    targetMetricName: '大客户周交易 GMV',
    baselineValue: 49.0,
    targetValue: 68.0,
    currentValue: 61.5,
    unit: '万美元/周',

    // D. 行动项
    actionItems: [
      {
        id: 'ACT-41',
        actionTitle: '开通极速放款 0 账期绿色直通结算通道',
        owner: '陈明',
        executorParty: '财务结算中枢',
        startDate: '2026-10-02',
        dueDate: '2026-10-04',
        status: 'COMPLETED'
      },
      {
        id: 'ACT-42',
        actionTitle: 'VIP 总监 1 对 1 电话走访 12 位月度 5 万刀核心大客户，锁定大宗协议折率',
        owner: '刘晨',
        executorParty: 'VIP 客服团队',
        startDate: '2026-10-04',
        dueDate: '2026-10-10',
        status: 'IN_PROGRESS'
      }
    ],

    // E. 指标跟踪
    metricTrend: [
      { date: '10/02', metricValue: 49.0, label: '危机预警' },
      { date: '10/04', metricValue: 54.0 },
      { date: '10/06', metricValue: 61.5, label: '大额回流中' }
    ],

    // F. 效果验证
    verificationCycle: '计划执行至 10/18 后观测连续 2 周周均交易额'
  },
  {
    id: 'PLAN-202610-05',
    name: 'TikTok 渠道羊毛党空卡刷单与售后纠纷压降计划',
    owner: '王芳 (渠道合规与风控)',
    participants: ['张伟 (渠道运营)', '陈工 (风控策略)'],
    startDate: '2026-09-20',
    endDate: '2026-10-04',
    status: 'ADJUSTING',
    priority: 'P1_HIGH',

    // B. 经营问题
    sourceCategory: 'GROWTH_PROBLEM',
    sourceCategoryName: '增长问题',
    sourceProblemId: 'PROB-20261006-03',
    sourceProblemTitle: '渠道【CH-Media-04】售后纠纷率超标 6 倍 (12.4%)',
    affectedObject: 'TikTok 短视频引流矩阵',
    currentProblemMetric: '售后纠纷率 12.4%',
    normalBaselineMetric: '健康基线 <= 2.0%',
    problemCause: '推广代理投放素材过度夸大高额返现，吸引大量羊毛党提交无效空卡。',
    expectedBusinessImpact: '极度消耗风控与客服资源，损害商户履约积极性。',

    // C. 目标
    targetMetricName: '渠道售后纠纷率',
    baselineValue: 12.4,
    targetValue: 2.0,
    currentValue: 4.8,
    unit: '%',

    // D. 行动项
    actionItems: [
      {
        id: 'ACT-51',
        actionTitle: '暂停该渠道代理佣金 T+0 提现，改为 T+7 质押结算',
        owner: '张伟',
        executorParty: '渠道推广系统',
        startDate: '2026-09-20',
        dueDate: '2026-09-22',
        status: 'COMPLETED'
      },
      {
        id: 'ACT-52',
        actionTitle: '上线高危新号 OCR 设备指纹拦截与首单实名加强验证',
        owner: '陈工',
        executorParty: '风控引擎',
        startDate: '2026-09-22',
        dueDate: '2026-09-26',
        status: 'COMPLETED'
      }
    ],

    // E. 指标跟踪
    metricTrend: [
      { date: '09/20', metricValue: 12.4, label: '高危告警' },
      { date: '09/25', metricValue: 8.5 },
      { date: '09/30', metricValue: 5.6 },
      { date: '10/04', metricValue: 4.8, label: '部分达标' }
    ],

    // F. 效果验证
    verificationCycle: '10/04 ~ 10/06 效果复核',
    verificationResult: 'PARTIAL_ACHIEVED',
    verificationSummary: '纠纷率从 12.4% 降至 4.8%，虽显著改善但仍未达到 <2.0% 严格基线，已转入【调整中】继续追加人脸比对策略。',
    verifiedAt: '2026-10-06 09:00'
  }
];
