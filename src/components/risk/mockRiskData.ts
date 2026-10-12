import {
  RiskOverviewKPIs,
  RiskTypeStatItem,
  RiskBrandStatItem,
  RiskLevelStatItem,
  RiskWarningCardItem,
  PrecheckRecordItem,
  AbnormalCardItem,
  RiskEventRecordItem
} from './riskTypes';

// 1. 风控总览 KPI 指标数据
export const MOCK_RISK_OVERVIEW_KPIS: Record<'today' | 'yesterday' | '7days' | '30days', RiskOverviewKPIs> = {
  today: {
    precheckCount: 3840,
    riskCardCount: 118,
    riskCardRate: 3.07,
    autoBlockCount: 76,
    pendingManualCount: 14,
    riskInvolvedAmount: 35800,
    avoidedLossAmount: 29400,
    precheckGrowthRate: 8.4,
    riskRateGrowthRate: -0.42,
    avoidedLossGrowthRate: 15.2
  },
  yesterday: {
    precheckCount: 3540,
    riskCardCount: 124,
    riskCardRate: 3.50,
    autoBlockCount: 78,
    pendingManualCount: 0,
    riskInvolvedAmount: 39200,
    avoidedLossAmount: 31000,
    precheckGrowthRate: 5.1,
    riskRateGrowthRate: 0.15,
    avoidedLossGrowthRate: 8.9
  },
  '7days': {
    precheckCount: 26400,
    riskCardCount: 785,
    riskCardRate: 2.97,
    autoBlockCount: 520,
    pendingManualCount: 14,
    riskInvolvedAmount: 248000,
    avoidedLossAmount: 198500,
    precheckGrowthRate: 12.6,
    riskRateGrowthRate: -0.85,
    avoidedLossGrowthRate: 22.4
  },
  '30days': {
    precheckCount: 114500,
    riskCardCount: 3420,
    riskCardRate: 2.98,
    autoBlockCount: 2280,
    pendingManualCount: 14,
    riskInvolvedAmount: 1086000,
    avoidedLossAmount: 869000,
    precheckGrowthRate: 18.2,
    riskRateGrowthRate: -1.10,
    avoidedLossGrowthRate: 28.5
  }
};

// 2. 风险结构：按风险类型
export const MOCK_RISK_TYPE_STATS: RiskTypeStatItem[] = [
  { key: 'ZERO_BALANCE', name: '零余额', count: 42, ratioPct: 35.6, amount: 12800, periodGrowthPct: 4.2, colorClass: 'bg-rose-500 text-white' },
  { key: 'REDEEMED', name: '已兑换', count: 28, ratioPct: 23.7, amount: 8900, periodGrowthPct: -2.1, colorClass: 'bg-amber-500 text-white' },
  { key: 'DUPLICATE_CARD', name: '重复卡 (撞库)', count: 20, ratioPct: 16.9, amount: 6400, periodGrowthPct: 12.8, colorClass: 'bg-purple-500 text-white' },
  { key: 'FACE_MISMATCH', name: '面额异常 (少于申报)', count: 14, ratioPct: 11.9, amount: 4200, periodGrowthPct: -1.5, colorClass: 'bg-orange-500 text-white' },
  { key: 'STATUS_ANOMALY', name: '状态异常 (锁卡/未激活)', count: 8, ratioPct: 6.8, amount: 2100, periodGrowthPct: 0.8, colorClass: 'bg-cyan-500 text-white' },
  { key: 'BLACKLIST_HIT', name: '黑名单命中', count: 4, ratioPct: 3.4, amount: 1000, periodGrowthPct: -18.2, colorClass: 'bg-red-700 text-white' },
  { key: 'SUSPECTED_FRAUD', name: '疑似欺诈', count: 2, ratioPct: 1.7, amount: 400, periodGrowthPct: 0.0, colorClass: 'bg-slate-700 text-white' }
];

// 3. 风险结构：按卡种
export const MOCK_RISK_BRAND_STATS: RiskBrandStatItem[] = [
  { brand: 'Apple', name: 'Apple Gift Card', precheckCount: 1680, riskCount: 68, riskRate: 4.05, amount: 21500, isSpikeAnomaly: true },
  { brand: 'Steam', name: 'Steam Wallet Key', precheckCount: 1120, riskCount: 24, riskRate: 2.14, amount: 6200, isSpikeAnomaly: false },
  { brand: 'Target', name: 'Target US Card', precheckCount: 410, riskCount: 12, riskRate: 2.93, amount: 3600, isSpikeAnomaly: false },
  { brand: 'Sephora', name: 'Sephora Beauty Card', precheckCount: 340, riskCount: 8, riskRate: 2.35, amount: 2400, isSpikeAnomaly: false },
  { brand: 'Foot Locker', name: 'Foot Locker Footwear', precheckCount: 180, riskCount: 4, riskRate: 2.22, amount: 1300, isSpikeAnomaly: false },
  { brand: "Macy's", name: "Macy's Department", precheckCount: 110, riskCount: 2, riskRate: 1.82, amount: 800, isSpikeAnomaly: false }
];

// 4. 风险结构：按风险等级
export const MOCK_RISK_LEVEL_STATS: RiskLevelStatItem[] = [
  { level: 'HIGH', levelName: '高危风险', count: 58, ratioPct: 49.2, amount: 20400, badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
  { level: 'MEDIUM', levelName: '中危风险', count: 44, ratioPct: 37.3, amount: 12600, badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  { level: 'LOW', levelName: '低危关注', count: 16, ratioPct: 13.5, amount: 2800, badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' }
];

// 5. 风险预警卡片
export const MOCK_RISK_WARNINGS: RiskWarningCardItem[] = [
  {
    id: 'WARN-20261005-01',
    title: 'Apple US 零余额卡率突增告警',
    issueDesc: 'Apple US 零余额卡率今日骤升至 8.6%，过去 7 日均值仅 2.1% (超出 3 倍基线)',
    currentVal: '8.6%',
    baselineVal: '2.1%',
    affectedCards: 38,
    involvedAmount: 11400,
    startTime: '今日 11:20',
    riskLevel: 'HIGH',
    suggestedAction: '建议收紧 Apple US 自动放行策略，对非白名单出卡人实施双通道交叉验真',
    filterRiskType: '零余额',
    filterBrand: 'Apple'
  },
  {
    id: 'WARN-20261005-02',
    title: '同出卡人在 30 分钟内连续提交 12 张重复卡',
    issueDesc: '出卡用户 UID-88934 (Kofi Mensah) 持续提交已被核销的历史废卡，疑似脚本自动化撞库',
    currentVal: '12 张 / 30min',
    baselineVal: '0 张',
    affectedCards: 12,
    involvedAmount: 2400,
    startTime: '今日 14:10',
    riskLevel: 'HIGH',
    suggestedAction: '系统已临时封锁该用户出卡权限，生成高危风险事件并移交客服安全组',
    filterRiskType: '重复卡'
  },
  {
    id: 'WARN-20261005-03',
    title: 'Steam 某批次卡面额不符偏高',
    issueDesc: '东南亚渠道提交的 Steam 卡申报价 $100，实际官方验真仅 $50 或 $20，占比超 15%',
    currentVal: '15.4%',
    baselineVal: '3.0%',
    affectedCards: 9,
    involvedAmount: 1800,
    startTime: '今日 13:00',
    riskLevel: 'MEDIUM',
    suggestedAction: '建议按实际查询余额重新报价，并提示用户二次确认',
    filterRiskType: '面额不符',
    filterBrand: 'Steam'
  }
];

// 6. 交易预检数据流水 (Transaction Precheck Records)
export const INITIAL_PRECHECK_DATA: PrecheckRecordItem[] = [
  {
    id: 'CRD-20261005-001',
    orderId: 'ORD-20261005-8801',
    userId: 'UID-88912',
    userName: 'Chinedu Obi',
    userRiskTag: '正常',
    brand: 'Apple',
    country: 'US',
    cardCodeMasked: 'X892-F91A-****-QQ01',
    pinMasked: '98**',
    declaredValue: 100,
    queryBalance: 100,
    cardStatus: 'Active',
    currency: 'USD',
    duplicateCheck: '正常',
    balanceCheck: '正常',
    faceMatchCheck: '一致',
    userRiskCheck: '正常',
    blacklistCheck: '未命中',
    decisionResult: 'PASS',
    riskLevel: 'LOW',
    precheckTime: '2026-10-05 14:45:10',
    defaultAction: '正常卡单流程放行 ➔ 自动进入撮合引擎',
    cardCheckDetail: {
      balance: 100,
      cardStatusText: '未兑换 (Active)',
      source: 'Apple Enterprise Direct API (主通道)',
      checkTime: '2026-10-05 14:45:11',
      isSuccess: true,
      isToolError: false,
      latencyMs: 1120,
      rawEvidenceSignature: '0x8F1901AA_APPLE_US_OK'
    },
    checkItems: [
      { key: 'DUP', name: '重复卡检查', status: 'PASSED', resultText: '未命中', description: '全库检索无历史提交记录 (24h/全周期唯一)' },
      { key: 'BAL', name: '余额/状态检查', status: 'PASSED', resultText: 'Active ($100)', description: '官方直连查验状态有效，余额充足' },
      { key: 'FACE', name: '面额一致性检查', status: 'PASSED', resultText: '申报 $100 = 查验 $100', description: '用户申报值与官方查验余额完全一致' },
      { key: 'RULE', name: '卡种/国家规则', status: 'PASSED', resultText: '符合 US 规则', description: '卡种格式与发卡地区标准校验通过' },
      { key: 'USER', name: '用户风险检查', status: 'PASSED', resultText: '信用优秀 (Tier-A)', description: '出卡人历史履约率 99.4%，无争议与违规记录' },
      { key: 'BLACK', name: '黑名单命中检查', status: 'PASSED', resultText: '未命中', description: '用户 ID、设备指纹及 IP 均未在风险黑名单中' }
    ]
  },
  {
    id: 'CRD-20261005-002',
    orderId: 'ORD-20261005-8802',
    userId: 'UID-88934',
    userName: 'Kofi Mensah',
    userRiskTag: '高风险',
    brand: 'Steam',
    country: 'Global',
    cardCodeMasked: '7921-MM22-****-4432',
    declaredValue: 50,
    queryBalance: 0,
    cardStatus: 'Redeemed',
    currency: 'USD',
    duplicateCheck: '正常',
    balanceCheck: '异常',
    faceMatchCheck: '异常',
    userRiskCheck: '风险',
    blacklistCheck: '未命中',
    decisionResult: 'BLOCK',
    riskLevel: 'HIGH',
    precheckTime: '2026-10-05 14:42:00',
    defaultAction: '阻断交易 ➔ 生成高危异常卡并归入风险档案',
    cardCheckDetail: {
      balance: 0,
      cardStatusText: '已兑换 (Redeemed)',
      source: 'Valve KeyVerify Global Engine',
      checkTime: '2026-10-05 14:42:01',
      isSuccess: true,
      isToolError: false,
      latencyMs: 890,
      errorCode: 'ERR_ALREADY_REDEEMED',
      rawEvidenceSignature: '0xC28A9B23_VALVE_ZERO_BALANCE'
    },
    checkItems: [
      { key: 'DUP', name: '重复卡检查', status: 'PASSED', resultText: '未命中', description: '无重复提交记录' },
      { key: 'BAL', name: '余额/状态检查', status: 'FAILED', resultText: 'Redeemed ($0)', ruleId: 'RULE-ZERO-BALANCE-AUTO-DROP', description: '官方接口返回已兑换核销，当前可用余额为 $0.00' },
      { key: 'FACE', name: '面额一致性检查', status: 'FAILED', resultText: '申报 $50 != 查验 $0', description: '申报值与实际有效余额严重倒挂 ($50 差异)' },
      { key: 'RULE', name: '卡种/国家规则', status: 'PASSED', resultText: '符合 Global 规则', description: 'Steam 全球通用码格式正确' },
      { key: 'USER', name: '用户风险检查', status: 'WARNING', resultText: '存在 2 笔历史争议', description: '该出卡人在近 30 天曾因空卡引发售后争议' },
      { key: 'BLACK', name: '黑名单命中检查', status: 'PASSED', resultText: '未命中', description: '未在硬性封禁名单中' }
    ]
  },
  {
    id: 'CRD-20261005-003',
    orderId: 'ORD-20261005-8803',
    userId: 'UID-88955',
    userName: 'Emeka Nwosu',
    userRiskTag: '关注',
    brand: 'Target',
    country: 'US',
    cardCodeMasked: '0812-9901-****-7711',
    pinMasked: '44**',
    declaredValue: 200,
    queryBalance: 100,
    cardStatus: 'Active',
    currency: 'USD',
    duplicateCheck: '正常',
    balanceCheck: '正常',
    faceMatchCheck: '异常',
    userRiskCheck: '关注',
    blacklistCheck: '未命中',
    decisionResult: 'REVIEW',
    riskLevel: 'MEDIUM',
    precheckTime: '2026-10-05 14:38:15',
    defaultAction: '生成待确认异常卡 ➔ 派发客服重新核对/重新报价',
    cardCheckDetail: {
      balance: 100,
      cardStatusText: '未兑换 (Active)',
      source: 'Target Direct Gateway API',
      checkTime: '2026-10-05 14:38:16',
      isSuccess: true,
      isToolError: false,
      latencyMs: 1420,
      rawEvidenceSignature: '0x99A100BB_TARGET_PARTIAL_BALANCE'
    },
    checkItems: [
      { key: 'DUP', name: '重复卡检查', status: 'PASSED', resultText: '未命中', description: '库内无重复' },
      { key: 'BAL', name: '余额/状态检查', status: 'PASSED', resultText: 'Active ($100)', description: '卡密本身足额有效，卡状态正常' },
      { key: 'FACE', name: '面额一致性检查', status: 'FAILED', resultText: '申报 $200 != 查验 $100', ruleId: 'RULE-FACE-MISMATCH-WARN', description: '用户申报面额 $200.00，实际卡内余额仅 $100.00 (少充 $100)' },
      { key: 'RULE', name: '卡种/国家规则', status: 'PASSED', resultText: '符合 US 规则', description: 'Target 格式与 PIN 长度符合规范' },
      { key: 'USER', name: '用户风险检查', status: 'WARNING', resultText: '新注册未满 7 天', description: '首单出卡，建议人工客服核对用户申报意图' },
      { key: 'BLACK', name: '黑名单命中检查', status: 'PASSED', resultText: '未命中', description: '风控库未命中黑名单' }
    ]
  },
  {
    id: 'CRD-20261005-004',
    orderId: 'ORD-20261005-8804',
    userId: 'UID-88978',
    userName: 'David Adeleke',
    userRiskTag: '正常',
    brand: 'Sephora',
    country: 'US',
    cardCodeMasked: '6019-3388-****-1109',
    pinMasked: '12**',
    declaredValue: 150,
    queryBalance: 0,
    cardStatus: 'Query Failed',
    currency: 'USD',
    duplicateCheck: '正常',
    balanceCheck: '正常',
    faceMatchCheck: '一致',
    userRiskCheck: '正常',
    blacklistCheck: '未命中',
    decisionResult: 'CHECK_FAILED',
    riskLevel: 'LOW',
    precheckTime: '2026-10-05 14:35:00',
    defaultAction: '查询通道超时/异常 ➔ 自动轮询备用源或人工查卡 (严禁误判为风险卡)',
    cardCheckDetail: {
      balance: 0,
      cardStatusText: '查询工具异常 (Timeout)',
      source: 'Sephora US POS Gateway (Primary)',
      checkTime: '2026-10-05 14:35:05',
      isSuccess: false,
      isToolError: true,
      latencyMs: 5000,
      errorCode: 'ERR_GATEWAY_TIMEOUT_504',
      rawEvidenceSignature: '0x00000000_TIMEOUT_RETRY'
    },
    checkItems: [
      { key: 'DUP', name: '重复卡检查', status: 'PASSED', resultText: '未命中', description: '无重复记录' },
      { key: 'BAL', name: '余额/状态检查', status: 'ERROR', resultText: '通道超时 504', ruleId: 'RULE-TOOL-EXCEPTION-FALLBACK', description: '第三方网关接口超时，非卡本身失效，需触发备用源' },
      { key: 'FACE', name: '面额一致性检查', status: 'WARNING', resultText: '等待余额返回', description: '尚未取得有效余额，无法比对' },
      { key: 'RULE', name: '卡种/国家规则', status: 'PASSED', resultText: '符合 US 规则', description: '卡号 16 位 + PIN 8 位格式合法' },
      { key: 'USER', name: '用户风险检查', status: 'PASSED', resultText: '正常', description: '出卡人无异常标签' },
      { key: 'BLACK', name: '黑名单命中检查', status: 'PASSED', resultText: '未命中', description: '正常放行池' }
    ]
  },
  {
    id: 'CRD-20261005-005',
    orderId: 'ORD-20261005-8805',
    userId: 'UID-88934',
    userName: 'Kofi Mensah',
    userRiskTag: '高风险',
    brand: 'Apple',
    country: 'US',
    cardCodeMasked: 'X892-F91A-****-QQ01',
    declaredValue: 100,
    queryBalance: 100,
    cardStatus: 'Active',
    currency: 'USD',
    duplicateCheck: '命中',
    balanceCheck: '正常',
    faceMatchCheck: '一致',
    userRiskCheck: '风险',
    blacklistCheck: '未命中',
    decisionResult: 'BLOCK',
    riskLevel: 'HIGH',
    precheckTime: '2026-10-05 14:30:20',
    defaultAction: '命中 24h 重复卡规则 ➔ 强制阻断并提示已有历史关联单',
    cardCheckDetail: {
      balance: 100,
      cardStatusText: '未兑换 (Active)',
      source: 'Apple Enterprise Direct API',
      checkTime: '2026-10-05 14:30:21',
      isSuccess: true,
      isToolError: false,
      latencyMs: 980,
      rawEvidenceSignature: '0x8F1901AA_APPLE_US_DUPLICATE'
    },
    checkItems: [
      { key: 'DUP', name: '重复卡检查', status: 'FAILED', resultText: '命中重复卡', ruleId: 'RULE-DUPLICATE-CARD-24H', description: '该卡密已在 14 分钟前由用户提交至卡单 ORD-20261005-8801！' },
      { key: 'BAL', name: '余额/状态检查', status: 'PASSED', resultText: 'Active ($100)', description: '卡密未消费但已在交易中' },
      { key: 'FACE', name: '面额一致性检查', status: 'PASSED', resultText: '一致', description: '面额一致' },
      { key: 'RULE', name: '卡种/国家规则', status: 'PASSED', resultText: '正常', description: '规则合规' },
      { key: 'USER', name: '用户风险检查', status: 'FAILED', resultText: '重复撞库行为', description: '短时间内重复提单，判定涉嫌一卡多卖欺诈' },
      { key: 'BLACK', name: '黑名单命中检查', status: 'PASSED', resultText: '未命中', description: '未在名单中' }
    ]
  }
];

// 7. 异常卡工作池数据 (Abnormal Cards Data)
export const INITIAL_ABNORMAL_CARDS: AbnormalCardItem[] = [
  {
    exceptionId: 'EXP-20261005-001',
    cardId: 'CRD-20261005-002',
    orderId: 'ORD-20261005-8802',
    userId: 'UID-88934',
    userName: 'Kofi Mensah',
    userRiskTag: '高风险',
    brand: 'Steam',
    country: 'Global',
    cardCodeMasked: '7921-MM22-****-4432',
    declaredValue: 50,
    actualBalance: 0,
    currency: 'USD',
    riskType: '已兑换',
    riskLevel: 'HIGH',
    ruleId: 'RULE-ZERO-BALANCE-AUTO-DROP',
    ruleDescription: 'Card Check 官方验真返回 REDEEMED ($0.00)，提单前已消费核销',
    systemSuggestedAction: '建议：阻断交易并移交售后调查，存证兑换时间戳',
    currentHandler: '客服专员 (王芳 · CS03)',
    slaRemainingMinutes: -12, // 已超时 12 分钟 (用于优先排序)
    isOverdue: true,
    isNearOverdue: false,
    status: '待处理',
    createdAt: '2026-10-05 14:42:00',
    evidenceList: [
      { id: 'EV-01', type: 'Card Check 记录', title: 'Valve 官方接口查验结果', detail: '返回 Card Status: REDEEMED, 可用余额 $0.00, 官方兑换时间 2026-10-05 12:10 (早于提单时间 2.5小时)', time: '14:42:01', source: 'Valve API' },
      { id: 'EV-02', type: '用户历史争议', title: '出卡人近 30 天涉诉记录', detail: '曾于 2026-09-28 提交失效 Steam $100，争议仲裁判定出卡人全责', time: '09-28 10:00', source: '售后争议系统' },
      { id: 'EV-03', type: '历史余额快照', title: 'T1 提交初始快照', detail: '快照哈希: c28a9b23... 存证已锁定', time: '14:42:00', source: '风控存证服务' }
    ]
  },
  {
    exceptionId: 'EXP-20261005-002',
    cardId: 'CRD-20261005-005',
    orderId: 'ORD-20261005-8805',
    userId: 'UID-88934',
    userName: 'Kofi Mensah',
    userRiskTag: '高风险',
    brand: 'Apple',
    country: 'US',
    cardCodeMasked: 'X892-F91A-****-QQ01',
    declaredValue: 100,
    actualBalance: 100,
    currency: 'USD',
    riskType: '重复卡',
    riskLevel: 'HIGH',
    ruleId: 'RULE-DUPLICATE-CARD-24H',
    ruleDescription: '相同卡码 24 小时内已提交 2 次，命中防一卡多售阻断规则',
    systemSuggestedAction: '建议：检查原卡单 ORD-20261005-8801 是否已完成，核实后直接阻断',
    currentHandler: '客服专员 (李伟 · CS01)',
    slaRemainingMinutes: 8, // 即将超时 (<15min)
    isOverdue: false,
    isNearOverdue: true,
    status: '处理中',
    createdAt: '2026-10-05 14:30:20',
    evidenceList: [
      { id: 'EV-04', type: '重复卡记录', title: '24h 重复碰撞记录', detail: '原卡单号: ORD-20261005-8801, 首次提单时间: 14:16:00 (已被商户 M08 接单处理中)', time: '14:30:21', source: '交易撮合引擎' },
      { id: 'EV-05', type: '相关关联订单', title: '原卡单当前状态', detail: '商户科技互联已锁定卡密进行充值，重复提单涉嫌欺诈撞库', time: '14:16:30', source: '商户工作台' }
    ]
  },
  {
    exceptionId: 'EXP-20261005-003',
    cardId: 'CRD-20261005-003',
    orderId: 'ORD-20261005-8803',
    userId: 'UID-88955',
    userName: 'Emeka Nwosu',
    userRiskTag: '关注',
    brand: 'Target',
    country: 'US',
    cardCodeMasked: '0812-9901-****-7711',
    declaredValue: 200,
    actualBalance: 100,
    currency: 'USD',
    riskType: '面额不符',
    riskLevel: 'MEDIUM',
    ruleId: 'RULE-FACE-MISMATCH-WARN',
    ruleDescription: '申报面额 $200.00 与实际查验余额 $100.00 不一致',
    systemSuggestedAction: '建议：按实际余额 $100.00 重新报价，并推送用户确认',
    currentHandler: '客服专员 (张立 · CS02)',
    slaRemainingMinutes: 32,
    isOverdue: false,
    isNearOverdue: false,
    status: '待确认',
    createdAt: '2026-10-05 14:38:15',
    evidenceList: [
      { id: 'EV-06', type: 'Card Check 记录', title: 'Target 官方查验结果', detail: '返回 Card Status: Active, 当前可用余额: $100.00', time: '14:38:16', source: 'Target API' },
      { id: 'EV-07', type: '历史余额快照', title: 'T1 用户提交申报单', detail: '申报面额字段: 200 USD', time: '14:38:15', source: '前端收卡表单' }
    ]
  },
  {
    exceptionId: 'EXP-20261005-004',
    cardId: 'CRD-20261005-004',
    orderId: 'ORD-20261005-8804',
    userId: 'UID-88978',
    userName: 'David Adeleke',
    userRiskTag: '正常',
    brand: 'Sephora',
    country: 'US',
    cardCodeMasked: '6019-3388-****-1109',
    declaredValue: 150,
    actualBalance: 0,
    currency: 'USD',
    riskType: '其他',
    riskLevel: 'LOW',
    ruleId: 'RULE-TOOL-EXCEPTION-FALLBACK',
    ruleDescription: 'Sephora 主查询源接口超时 (Timeout 504)，未能完成自动查验',
    systemSuggestedAction: '建议：切换备用查询源 / 调用卡工具人工余额查询',
    currentHandler: '系统自动轮询',
    slaRemainingMinutes: 45,
    isOverdue: false,
    isNearOverdue: false,
    status: '待处理',
    createdAt: '2026-10-05 14:35:00',
    evidenceList: [
      { id: 'EV-08', type: 'Card Check 记录', title: '主通道报错日志', detail: 'Sephora POS Gateway HTTP 504 Gateway Timeout (5000ms)', time: '14:35:05', source: 'Card Check 网关' }
    ]
  }
];

// 8. 风险记录 (永久档案 Risk Events Data)
export const INITIAL_RISK_EVENTS: RiskEventRecordItem[] = [
  {
    riskEventId: 'RISK-EVT-20261005-001',
    cardId: 'CRD-20261005-002',
    orderId: 'ORD-20261005-8802',
    userId: 'UID-88934',
    userName: 'Kofi Mensah',
    merchantId: 'MID-M08',
    merchantName: '极速卡业科技',
    riskType: '已兑换 (零余额欺诈)',
    riskLevel: 'HIGH',
    triggerRule: 'RULE-ZERO-BALANCE-AUTO-DROP',
    evidence: 'Valve 官方接口查验可用余额 $0.00，兑换时间早于提单时间 2.5 小时',
    amount: 50,
    interceptAmount: 50,
    action: '系统自动拦截 ➔ 客服复核阻断 ➔ 用户标记高风险',
    result: '已阻断 (成功避免损失 $50.00)',
    handler: '客服专员 (王芳 · CS03)',
    createdTime: '2026-10-05 14:42:00',
    closedTime: '2026-10-05 14:48:22',
    timeline: [
      { time: '14:42:00', action: '用户提交卡密', operator: '用户 (UID-88934)', note: '提交 Steam Global $50 电子卡密' },
      { time: '14:42:01', action: 'Card Check 自动查验', operator: '风控引擎', note: 'Valve 官方验真返回 REDEEMED，可用余额 $0.00' },
      { time: '14:42:01', action: '命中零余额拦截规则', operator: 'RULE-ZERO-BALANCE-AUTO-DROP', note: '系统阻断正常放行流程，生成异常卡 EXP-20261005-001' },
      { time: '14:45:10', action: '客服人工复核调阅', operator: '王芳 (CS03)', note: '调取 Valve 兑换存证哈希，确认该卡已被兑换' },
      { time: '14:48:20', action: '执行最终阻断裁决', operator: '王芳 (CS03)', note: '确认风险闭环，自动更新出卡人风险标签为【高风险】' },
      { time: '14:48:22', action: '卡单正式关闭', operator: '系统', note: '交易终止，全流程归档入库' }
    ]
  },
  {
    riskEventId: 'RISK-EVT-20261005-002',
    cardId: 'CRD-20261005-005',
    orderId: 'ORD-20261005-8805',
    userId: 'UID-88934',
    userName: 'Kofi Mensah',
    merchantId: 'MID-M02',
    merchantName: '全球数码直通',
    riskType: '重复卡 (撞库多卖)',
    riskLevel: 'HIGH',
    triggerRule: 'RULE-DUPLICATE-CARD-24H',
    evidence: '命中 24h 重复卡检测，关联原单 ORD-20261005-8801',
    amount: 100,
    interceptAmount: 100,
    action: '强制阻断交易 ➔ 冻结该用户当日出卡权限',
    result: '已阻断 (成功避免损失 $100.00)',
    handler: '风控自动拦截引擎',
    createdTime: '2026-10-05 14:30:20',
    closedTime: '2026-10-05 14:31:05',
    timeline: [
      { time: '14:30:20', action: '用户提单', operator: '用户 (UID-88934)', note: '提交 Apple US $100' },
      { time: '14:30:21', action: '重复碰撞命中', operator: 'RULE-DUPLICATE-CARD-24H', note: '检出与卡单 ORD-20261005-8801 卡码哈希完全一致' },
      { time: '14:31:05', action: '系统硬拦截阻断', operator: '风控引擎', note: '直接终止卡单，封禁该账号 24h 提交权限' }
    ]
  },
  {
    riskEventId: 'RISK-EVT-20261004-008',
    cardId: 'CRD-20261004-9021',
    orderId: 'ORD-20261004-7120',
    userId: 'UID-87110',
    userName: 'Sarah Jenkins',
    merchantId: 'MID-M01',
    merchantName: '易兑数字供应链',
    riskType: '面额不符误报',
    riskLevel: 'LOW',
    triggerRule: 'RULE-FACE-MISMATCH-WARN',
    evidence: '用户申报 $500，初筛接口返回 $200，人工复查官方直连显示由于官方货币转换汇率显示为 £200，折算实际即为 $500',
    amount: 500,
    interceptAmount: 0,
    action: '人工核对币种与卡种 ➔ 判定系统规则误报 ➔ 人工放行',
    result: '已确认误报 (人工放行并记录规则优化依据)',
    handler: '客服专员 (李伟 · CS01)',
    createdTime: '2026-10-04 16:20:00',
    closedTime: '2026-10-04 16:35:10',
    timeline: [
      { time: '16:20:00', action: '用户提交 Apple UK £200', operator: '用户 (UID-87110)', note: '申报 USD 等值 $500' },
      { time: '16:20:02', action: '初筛规则告警面额不符', operator: 'RULE-FACE-MISMATCH-WARN', note: '币种转换逻辑未适配' },
      { time: '16:35:00', action: '客服人工查验放行', operator: '李伟 (CS01)', note: '确认面额无误，标记【已确认误报】，提交规则引擎优化工单' },
      { time: '16:35:10', action: '卡单继续流转', operator: '系统', note: '订单正常完成撮合' }
    ]
  }
];
