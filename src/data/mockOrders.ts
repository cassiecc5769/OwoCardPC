export interface TimelineNode {
  step: string;
  tag: string;
  tagColor: string;
  time: string;
  desc: string;
  icon: string;
  iconBg: string;
}

export interface AuditLogItem {
  time: string;
  operator: string;
  action: string;
  details: string;
}

// 交易准入结果 (PRD 1.2.2)
export interface TradeAdmissionDetails {
  ruleVersion: string;         // 使用规则版本
  sku: string;                 // 标准SKU
  tradeAllowed: boolean;       // 是否允许交易
  tradeAllowedReason?: string;
  denominationResult: string; // 面值是否合法
  codeFormatResult: string;   // 卡码是否合法
  maintenanceStatus: string;  // 是否维护
  pledgeRule: string;         // 是否存在质押
  userConfirmed: boolean;     // 用户是否确认
  checkTime: string;          // 校验时间
}

// 派单过程候选商户 (PRD 1.2.3)
export interface DispatchCandidate {
  merchantName: string;
  merchantMid: string;
  skuAccepted: boolean;        // SKU 承接 ✅/❌
  stakingStatus: string;       // 积点/保证金
  currentLoad: string;         // 当前负载
  quoteRate: number;           // 报价
  fulfillmentScore: number;    // 履约分
  riskHandlingSupport: boolean;// 风险承接
  result: '选中' | '排除 (满载)' | '排除 (积点不足)' | '排除 (报价偏低)' | '排除 (风险不符)';
  exclusionReason?: string;
}

export interface DispatchRecord {
  dispatchTime: string;
  chosenMerchantMid: string;
  chosenMerchantName: string;
  strategyName: string;         // 派单策略计算名称
  candidates: DispatchCandidate[];
}

// 转单记录 (PRD 1.2.4)
export interface OrderTransferRecord {
  id: string;
  transferTime: string;
  originalMerchantMid: string;
  originalMerchantName: string;
  newMerchantMid: string;
  newMerchantName: string;
  originalRate: number;
  newRate: number;
  priceGapRate: number;          // 价差
  platformLossAmount: number;   // 平台承担金额 ($)
  transferReason: '商户拒单' | '商户超时' | '商户处理失败' | '商户积点不足' | '商户临时停止接单' | '不具备实际承接能力' | '人工判断转单';
  operationMode: '自动转单' | '人工/财务确认转单';
  operator: string;
  isLossExceeded: boolean;       // 是否超过损失阈值
}

// 重复卡检测规则 (PRD 1.2.5)
export interface DuplicateCardDetails {
  isDuplicate: boolean;
  originalOrderId?: string;
  originalCardOrderId?: string;
  originalSubmissionTime?: string;
  originalMerchantName?: string;
  originalMerchantMid?: string;
  ruleDecision: string;          // 规则决策
  riskImpact: string;            // 风控结果影响
  dispatchImpact: string;        // 派单条件影响
}

// 敏感字段人工修改审计记录 (PRD 1.2.6)
export interface FieldEditAuditLog {
  id: string;
  editTime: string;
  operator: string;
  fieldName: string;             // 卡种、国家、面额、Card Code、商户、订单状态、风险结果、失败结果、关闭状态
  originalValue: string;
  newValue: string;
  reason: string;
  evidenceDetails: string;
  secondConfirmedBy?: string;
}

// 统一交易状态机
export type TransactionStatusCode =
  | 'created'             // 已创建
  | 'precheck'            // 预检中
  | 'pending'             // 待处理
  | 'waiting_merchant'    // 待商户接单
  | 'merchant_processing' // 商户处理中
  | 'completed'           // 已完成
  // 分支
  | 'precheck_anomaly'    // 预检异常(待人工确认)
  | 'merchant_rejected'   // 商户拒单(待转单)
  | 'merchant_failed'     // 商户失败(异常处理中)
  | 'disputing';          // 用户争议(售后中)

export type RiskStatusCode = 'normal' | 'low' | 'medium' | 'high' | 'pending_review';
export type AfterSaleStatusCode = 'none' | 'disputing' | 'case_filed' | 'under_review' | 'compensated' | 'rejected';

export interface StateChangeEventLog {
  id: string;
  time: string;
  operator: string;
  fromState: string;
  toState: string;
  reason: string;
  traceId: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  cardOrderId: string; // 15.1 卡单号
  time: string;
  brand: string;
  brandCode: string;
  country: string;
  countryName: string;
  countryFlag: string;
  mediaType: string;
  faceValue: number;
  currency: string;
  userUid: string;
  userName?: string;
  userPhone: string;
  userVip: string;
  merchantMid: string;
  merchantName: string;
  userRate: number;
  userPrice: number;
  merchantRate: number;
  merchantPrice: number;
  marginAmount: number;
  marginPercent: number;

  // 统一交易状态机
  txnStatus: TransactionStatusCode;
  txnStatusLabel: string;
  // 保持旧接口兼容
  status: '成功完结' | '异常挂起' | '处理中' | '人工做卡兜底' | '风控拦截审核';
  statusCode: 'completed' | 'suspended' | 'processing' | 'manual' | 'risk';

  // 风险状态
  riskStatus: RiskStatusCode;
  riskStatusLabel: string;

  // 售后状态
  afterSaleStatus: AfterSaleStatusCode;
  afterSaleStatusLabel: string;

  duration: string;
  durationCode: string;
  maskedCode: string;
  fullCode: string;
  isHighValue?: boolean;
  isInverted?: boolean;

  // 15.2 固定分区结构化数据
  cardCheckDetails: {
    checkTime: string;
    balance: string;
    status: '有效足额' | '部分余额' | '空卡/已核销' | '查验超时' | '查验异常';
    source: '官方直连API' | '商户查验网关' | '自动化探针';
    result: string;
    rawResponse?: string;
  };

  riskDetails: {
    hitRules: string[];
    riskLevel: '正常' | '低风险' | '中风险' | '高风险拦截' | '待人工确认';
    riskScore: number;
    result: '放行通过' | '触发人工复核' | '拦截阻断' | '熔断挂起';
  };

  quoteDetails: {
    userRate: number;
    userPrice: number;
    merchantRate: number;
    merchantPrice: number;
    marketRefRate: number;
    platformProfit: number;
    platformProfitPercent: number;
  };

  merchantFulfillment: {
    merchantName: string;
    merchantMid: string;
    acceptTime: string;
    fulfillTime: string;
    durationSeconds: number;
    result: '核销成功' | '处理中' | '拒单转单' | '超时未接' | '凭证冲突';
  };

  financialDetails: {
    tradeAmount: number;
    currency: string;
    costAmount: number;
    profitAmount: number;
    compensationAmount: number;
    lossAmount: number;
    isSettled: boolean;
    settleBatchNo?: string;
  };

  afterSaleDetails: {
    afterSaleStatus: string;
    disputeId?: string;
    disputeReason?: string;
    liabilityResult?: '商户全责' | '用户全责' | '平台兜底垫付' | '无责任' | '待判定';
    compensationPaid?: number;
  };

  // 状态变更事件日志
  stateEventLogs: StateChangeEventLog[];

  // PRD 1.2 增强属性
  tradeAdmission?: TradeAdmissionDetails;
  dispatchRecord?: DispatchRecord;
  orderTransferLogs?: OrderTransferRecord[];
  duplicateCardDetails?: DuplicateCardDetails;
  fieldEditAuditLogs?: FieldEditAuditLog[];

  // 详情附属属性
  productTitle?: string;
  productCategoryCode?: string;
  exifStatus?: string;
  slaDuration?: string;
  slaMet?: boolean;
  dispatchSeat?: string;
  exchangeRate?: number;
  settleTotalCny?: number;
  grossProfitCny?: number;
  merchantPts?: number;
  traceId?: string;
  httpStatus?: string;
  cardPin?: string;
  barcodeUpc?: string;
  serialNumber?: string;
  posTimestamp?: string;
  ocrConfidence?: string;
  userCreditScore?: number;
  userTotalTrades?: number;
  userSuccessRate?: string;
  userDisputeRate?: string;
  userPayoutMethod?: string;
  userCountry?: string;
  merchantPointsBalance?: number;
  merchantDeposit?: number;
  merchantAvgSpeed?: string;
  merchantDailyVolume?: string;
  financialLedgerId?: string;
  financialEntryTime?: string;
  hashProof?: string;
  exceptionCode?: string;
  exceptionReason?: string;
  disputeCase?: {
    disputeId: string;
    reason: string;
    submitTime: string;
    status: string;
    buyerClaim: string;
    merchantRebuttal: string;
  };
  timelineNodes?: TimelineNode[];
  auditLogs?: AuditLogItem[];
}

export const INITIAL_ORDERS: OrderItem[] = [
  {
    id: '0',
    orderId: 'ORD-20260827-9912',
    cardOrderId: 'KD-20260827-991201',
    time: '15:32:10',
    brand: 'Apple Gift Card US',
    brandCode: 'APPLE',
    country: 'US',
    countryName: '美国',
    countryFlag: '🇺🇸',
    mediaType: '实体卡带小票 (Receipt Bound)',
    faceValue: 500.00,
    currency: 'USD',
    userUid: 'US-USR-8804912',
    userName: 'Adebayo Adeleke',
    userPhone: '138****0912',
    userVip: 'V5',
    merchantMid: 'M0192',
    merchantName: '招财进宝科技 (自动化网关)',
    userRate: 84.0,
    userPrice: 420.00,
    merchantRate: 89.2,
    merchantPrice: 446.00,
    marginAmount: 26.00,
    marginPercent: 5.83,
    txnStatus: 'completed',
    txnStatusLabel: '已完成',
    status: '成功完结',
    statusCode: 'completed',
    riskStatus: 'normal',
    riskStatusLabel: '正常 (无风险)',
    afterSaleStatus: 'none',
    afterSaleStatusLabel: '无售后',
    duration: '24.2s',
    durationCode: 'SLA-MET',
    maskedCode: 'X72K-****-****-41MN',
    fullCode: 'X72K-99PW-QQ82-41MN',
    isHighValue: true,
    isInverted: false,
    cardCheckDetails: {
      checkTime: '15:32:11.890',
      balance: '$500.00 USD',
      status: '有效足额',
      source: '官方直连API',
      result: '官方网关返回: 卡片状态 ACTIVE, 余额 $500.00 与申报面额 100% 吻合',
      rawResponse: '{"status":"ACTIVE","balance":500.00,"currency":"USD","gateway_latency_ms":182}'
    },
    riskDetails: {
      hitRules: ['大额面额交易 (>=$300)', '海外漫游IP扫描 (Clean)'],
      riskLevel: '低风险',
      riskScore: 12,
      result: '放行通过'
    },
    quoteDetails: {
      userRate: 84.0,
      userPrice: 420.00,
      merchantRate: 89.2,
      merchantPrice: 446.00,
      marketRefRate: 87.5,
      platformProfit: 26.00,
      platformProfitPercent: 5.83
    },
    merchantFulfillment: {
      merchantName: '招财进宝科技 (自动化网关)',
      merchantMid: 'M0192',
      acceptTime: '15:32:12.441',
      fulfillTime: '15:32:34.210',
      durationSeconds: 22,
      result: '核销成功'
    },
    financialDetails: {
      tradeAmount: 420.00,
      currency: 'USD',
      costAmount: 420.00,
      profitAmount: 26.00,
      compensationAmount: 0.00,
      lossAmount: 0.00,
      isSettled: true,
      settleBatchNo: 'BATCH-20260827-01'
    },
    afterSaleDetails: {
      afterSaleStatus: '无售后',
      disputeReason: undefined,
      liabilityResult: '无责任'
    },
    stateEventLogs: [
      { id: 'LOG-01', time: '15:32:10', operator: '系统网关', fromState: '初始', toState: '已创建', reason: '用户提交卡单及小票存证', traceId: 'TR-88219-01' },
      { id: 'LOG-02', time: '15:32:11', operator: '预检引擎', fromState: '已创建', toState: '预检中', reason: '触发官方 Card Check 探针与 OCR 提取', traceId: 'TR-88219-02' },
      { id: 'LOG-03', time: '15:32:12', operator: '路由调度', fromState: '预检中', toState: '待商户接单', reason: 'Card Check 验证通过，面额与余额一致', traceId: 'TR-88219-03' },
      { id: 'LOG-04', time: '15:32:15', operator: '商户系统 (M0192)', fromState: '待商户接单', toState: '商户处理中', reason: '商户成功抢单接单，冻结质押金 $446.00', traceId: 'TR-88219-04' },
      { id: 'LOG-05', time: '15:32:34', operator: '清算服务', fromState: '商户处理中', toState: '已完成', reason: '商户回传核销成功，自动分账并给用户放款', traceId: 'TR-88219-05' },
    ],
    tradeAdmission: {
      ruleVersion: 'v3.2.0-STD',
      sku: 'Apple Gift Card / US / USD / Physical / Fast / $500.00',
      tradeAllowed: true,
      tradeAllowedReason: '规则引擎校验通过，当前 SKU 允许提交交易',
      denominationResult: '合法在册 ($500 在开放面额白名单中)',
      codeFormatResult: '16位标准正则校验通过 (X72K-****-41MN)',
      maintenanceStatus: '通道正常 (无系统维护)',
      pledgeRule: '质押标准正常 (需要保证金 $500.00)',
      userConfirmed: true,
      checkTime: '15:32:10.104'
    },
    dispatchRecord: {
      dispatchTime: '15:32:12',
      chosenMerchantMid: 'M0192',
      chosenMerchantName: '招财进宝科技 (自动化网关)',
      strategyName: '综合最高报价与履约分智能路由策略 v2.4',
      candidates: [
        {
          merchantName: '招财进宝科技 (自动化网关)',
          merchantMid: 'M0192',
          skuAccepted: true,
          stakingStatus: '足够 ($120,000 PTS)',
          currentLoad: '12/50 (正常)',
          quoteRate: 89.2,
          fulfillmentScore: 96,
          riskHandlingSupport: true,
          result: '选中'
        },
        {
          merchantName: '环球数码极速兑付 (M0088)',
          merchantMid: 'M0088',
          skuAccepted: true,
          stakingStatus: '足够 ($85,000 PTS)',
          currentLoad: '50/50 (满载)',
          quoteRate: 89.5,
          fulfillmentScore: 92,
          riskHandlingSupport: true,
          result: '排除 (满载)',
          exclusionReason: '队列已满'
        },
        {
          merchantName: '星辰跨境收卡组 (M0102)',
          merchantMid: 'M0102',
          skuAccepted: true,
          stakingStatus: '不足 ($50 PTS)',
          currentLoad: '0/20',
          quoteRate: 88.0,
          fulfillmentScore: 84,
          riskHandlingSupport: false,
          result: '排除 (积点不足)',
          exclusionReason: '可用质押积点少于申报面额'
        }
      ]
    },
    duplicateCardDetails: {
      isDuplicate: false,
      ruleDecision: '经全局哈希数据库比对，该卡密为首提交卡 (无 24h 内重复记录)',
      riskImpact: '未触发重复卡风控扣分',
      dispatchImpact: '正常进入公海撮合派单队列'
    },
    orderTransferLogs: [],
    fieldEditAuditLogs: [],
    productTitle: 'Apple Gift Card (US) 实体卡带小票',
    productCategoryCode: 'ITUNES-US-PHYS',
    exifStatus: 'EXIF 防伪 PASS',
    slaDuration: '24.2s',
    slaMet: true,
    dispatchSeat: 'Lagos-Core-Engine-A12',
    exchangeRate: 7.1850,
    settleTotalCny: 3592.50,
    grossProfitCny: 67.50,
    merchantPts: 3592.50,
    traceId: 'TR-88219-OK',
    httpStatus: 'HTTP 200',
    cardPin: 'X72K-99PW-QQ82-41MN',
    barcodeUpc: '0190199728812',
    serialNumber: 'GCA-99214-PASS',
    posTimestamp: '2026-08-27 15:28:40 EDT',
    ocrConfidence: '99.4%',
    userCreditScore: 98.5,
    userTotalTrades: 1492,
    userSuccessRate: '99.1%',
    userDisputeRate: '0.02%',
    userPayoutMethod: 'USDT-TRC20 (TXYp...99xQ)',
    userCountry: '尼日利亚 (NG) / 漫游提交',
    merchantPointsBalance: 985658.00,
    merchantDeposit: 500000,
    merchantAvgSpeed: '19.2s',
    merchantDailyVolume: '¥1,892,400.00 (342单)',
    financialLedgerId: 'PTS20260827-0089',
    financialEntryTime: '2026-08-27 15:32:35',
    hashProof: '0x9fa1c78e34892bc...88c2f',
    timelineNodes: [
      { step: '1. 出卡用户提交凭证', tag: 'BATCH_UPLOAD', tagColor: 'bg-slate-100 text-slate-600', time: '15:32:10.114', desc: '用户 Adebayo Adeleke 经加密端上传实体卡数据与收银小票存据.', icon: 'upload_file', iconBg: 'bg-slate-200 text-blue-600' },
      { step: '2. OCR 视觉引擎解析完成', tag: 'CONFIDENCE 99.4%', tagColor: 'bg-emerald-100 text-emerald-800 font-semibold', time: '15:32:11.025 (+911ms)', desc: '自动提取卡密 X72K-99PW-QQ82-41MN，比对小票面额 $500.00 USD，防篡改算法通过.', icon: 'document_scanner', iconBg: 'bg-emerald-100 text-emerald-700' },
      { step: '3. 智能路由承揽撮合', tag: 'ROUTER_FAST_MATCH', tagColor: 'bg-blue-100 text-blue-800 font-semibold', time: '15:32:12.441 (+1,416ms)', desc: '算法命中最优买方商户: 招财进宝科技 (MID: M0192)，执行接单分派.', icon: 'alt_route', iconBg: 'bg-blue-100 text-blue-700' },
      { step: '4. 预冻结商户账户积点', tag: 'LEDGER_HOLD', tagColor: 'bg-slate-100 text-slate-600', time: '15:32:15.008 (+2,567ms)', desc: '成功冻结商户 3,592.50 PTS，确保买方兑付资信充足.', icon: 'lock_clock', iconBg: 'bg-amber-100 text-amber-700' },
      { step: '5. 商户调用官方 API 核销通过', tag: 'HTTP 200 SUCCESS', tagColor: 'bg-emerald-100 text-emerald-800 font-semibold', time: '15:32:34.210 (+19,202ms)', desc: '商户网关回执返回：Apple 官方账户充值入账确认无误，卡片状态变更为已核销.', icon: 'check_circle', iconBg: 'bg-emerald-100 text-emerald-700' },
      { step: '6. 账务扣减终结与分账清算', tag: 'CLEARED', tagColor: 'bg-blue-600 text-white font-semibold', time: '15:32:35.102 (+892ms)', desc: '积点扣减生效，出卡用户账面入账 ¥3,525.00，平台沉淀净利差 ¥67.50，主交易终态归档.', icon: 'task_alt', iconBg: 'bg-blue-600 text-white' }
    ],
    auditLogs: [
      { time: '15:32:35', operator: 'SYSTEM', action: 'SETTLEMENT_CLEAR', details: '自动清算分账触发，写入对账单号 PTS20260827-0089' },
      { time: '15:32:34', operator: 'M0192_API', action: 'API_VERIFIED', details: '商户调用 Apple 网关核销成功返回 200 OK' },
      { time: '15:32:15', operator: 'LEDGER_ENGINE', action: 'PTS_HOLD', details: '预冻结商户 3,592.50 PTS' },
      { time: '15:32:12', operator: 'ROUTER_ALGO', action: 'ROUTE_MATCH', details: '权重匹配至招财进宝科技有限公司' },
      { time: '15:32:11', operator: 'OCR_SERVICE', action: 'OCR_PARSE', details: 'OCR置信度 99.4% 提取完成' }
    ]
  },
  {
    id: '1',
    orderId: 'ORD-20261005-88410',
    cardOrderId: 'KD-20261005-884101',
    time: '14:37:12',
    brand: 'Apple Store 美区充值',
    brandCode: 'APPLE',
    country: 'US',
    countryName: '美国',
    countryFlag: '🇺🇸',
    mediaType: '电子码(E-Code)',
    faceValue: 100.00,
    currency: 'USD',
    userUid: 'U890214',
    userName: 'David Miller',
    userPhone: '138****9920',
    userVip: 'VIP3',
    merchantMid: 'MID-GLOBAL-EX',
    merchantName: '极速自动网关 #01',
    userRate: 82.5,
    userPrice: 82.50,
    merchantRate: 87.0,
    merchantPrice: 87.00,
    marginAmount: 4.50,
    marginPercent: 5.45,
    txnStatus: 'completed',
    txnStatusLabel: '已完成',
    status: '成功完结',
    statusCode: 'completed',
    riskStatus: 'normal',
    riskStatusLabel: '正常 (无风险)',
    afterSaleStatus: 'none',
    afterSaleStatusLabel: '无售后',
    duration: '1.8s',
    durationCode: 'API-FAST',
    maskedCode: 'X7P8-****-****-9821',
    fullCode: 'X7P8-WW92-MKL2-9821',
    cardCheckDetails: {
      checkTime: '14:37:12.800',
      balance: '$100.00 USD',
      status: '有效足额',
      source: '官方直连API',
      result: 'Apple 官方即时鉴真验证通过，代码有效且未兑换'
    },
    riskDetails: {
      hitRules: ['白名单高信誉用户直通'],
      riskLevel: '正常',
      riskScore: 5,
      result: '放行通过'
    },
    quoteDetails: {
      userRate: 82.5,
      userPrice: 82.50,
      merchantRate: 87.0,
      merchantPrice: 87.00,
      marketRefRate: 85.0,
      platformProfit: 4.50,
      platformProfitPercent: 5.45
    },
    merchantFulfillment: {
      merchantName: '极速自动网关 #01',
      merchantMid: 'MID-GLOBAL-EX',
      acceptTime: '14:37:13.100',
      fulfillTime: '14:37:14.200',
      durationSeconds: 1.8,
      result: '核销成功'
    },
    financialDetails: {
      tradeAmount: 82.50,
      currency: 'USD',
      costAmount: 82.50,
      profitAmount: 4.50,
      compensationAmount: 0.00,
      lossAmount: 0.00,
      isSettled: true,
      settleBatchNo: 'BATCH-20261005-02'
    },
    afterSaleDetails: {
      afterSaleStatus: '无售后',
      liabilityResult: '无责任'
    },
    stateEventLogs: [
      { id: 'LOG-01', time: '14:37:12', operator: '系统网关', fromState: '初始', toState: '已创建', reason: '用户提交卡密代码', traceId: 'TR-77102-01' },
      { id: 'LOG-02', time: '14:37:12', operator: '预检引擎', fromState: '已创建', toState: '预检中', reason: 'Card Check 官方鉴真执行中', traceId: 'TR-77102-02' },
      { id: 'LOG-03', time: '14:37:13', operator: '调度引擎', fromState: '预检中', toState: '商户处理中', reason: 'API极速撮合派发', traceId: 'TR-77102-03' },
      { id: 'LOG-04', time: '14:37:14', operator: '清算网关', fromState: '商户处理中', toState: '已完成', reason: '商户极速核销入账', traceId: 'TR-77102-04' },
    ],
    productTitle: 'Apple Store 官方电子礼品兑换码 (US)',
    productCategoryCode: 'ITUNES-US-ECODE',
    exifStatus: '纯数字码免验',
    slaDuration: '1.8s',
    slaMet: true,
    dispatchSeat: 'SH-FAST-ROUTER-01',
    exchangeRate: 7.2010,
    settleTotalCny: 626.49,
    grossProfitCny: 32.40,
    merchantPts: 626.49,
    traceId: 'TR-77102-FAST',
    httpStatus: 'HTTP 200',
    cardPin: 'X7P8-WW92-MKL2-9821',
    barcodeUpc: '0190199721102',
    serialNumber: 'APL-88219-FAST',
    posTimestamp: '2026-10-05 14:35:00 UTC',
    ocrConfidence: '100%',
    userCreditScore: 95.0,
    userTotalTrades: 890,
    userSuccessRate: '99.5%',
    userDisputeRate: '0.01%',
    userPayoutMethod: 'USDT-TRC20',
    userCountry: '美国 (US)',
    merchantPointsBalance: 420000.00,
    merchantDeposit: 200000,
    merchantAvgSpeed: '2.1s',
    merchantDailyVolume: '¥890,000.00 (192单)',
    financialLedgerId: 'PTS20261005-0410',
    financialEntryTime: '2026-10-05 14:37:14',
    hashProof: '0x12a8f90234bc123...99aa1'
  },
  {
    id: '2',
    orderId: 'ORD-20261005-88409',
    cardOrderId: 'KD-20261005-884091',
    time: '14:36:58',
    brand: 'Steam 钱包充值卡',
    brandCode: 'STEAM',
    country: 'DE',
    countryName: '德国',
    countryFlag: '🇩🇪',
    mediaType: '电子代码卡密',
    faceValue: 50.00,
    currency: 'EUR',
    userUid: 'U443109',
    userName: 'Klaus Schmidt',
    userPhone: '186****1104',
    userVip: 'V1',
    merchantMid: 'MID-SPEEDY-EU',
    merchantName: '速兑通欧区卡商',
    userRate: 75.0,
    userPrice: 37.50,
    merchantRate: 82.0,
    merchantPrice: 41.00,
    marginAmount: 3.50,
    marginPercent: 4.67,
    txnStatus: 'disputing',
    txnStatusLabel: '售后中 (用户争议)',
    status: '异常挂起',
    statusCode: 'suspended',
    riskStatus: 'medium',
    riskStatusLabel: '中风险 (争议待裁)',
    afterSaleStatus: 'disputing',
    afterSaleStatusLabel: '争议中 (碰卡调查)',
    duration: '124s',
    durationCode: 'SLA-TIMEOUT',
    maskedCode: 'STM-****-****-1192',
    fullCode: 'STM-9821-4412-1192',
    cardCheckDetails: {
      checkTime: '14:37:02.100',
      balance: '€0.00 (已兑换)',
      status: '空卡/已核销',
      source: '官方直连API',
      result: 'Steam官方接口回执: Error Code 0x44: Already Redeemed，兑换时间戳冲突',
      rawResponse: '{"error":"DUPLICATE_CODE","redeemed_at":"2026-10-05 11:20:00"}'
    },
    riskDetails: {
      hitRules: ['卡密状态为已兑换', '争议率偏高用户 (4.76%)'],
      riskLevel: '中风险',
      riskScore: 68,
      result: '触发人工复核'
    },
    quoteDetails: {
      userRate: 75.0,
      userPrice: 37.50,
      merchantRate: 82.0,
      merchantPrice: 41.00,
      marketRefRate: 80.0,
      platformProfit: 3.50,
      platformProfitPercent: 4.67
    },
    merchantFulfillment: {
      merchantName: '速兑通欧区卡商',
      merchantMid: 'MID-SPEEDY-EU',
      acceptTime: '14:37:05.000',
      fulfillTime: '14:38:10.000',
      durationSeconds: 65,
      result: '凭证冲突'
    },
    financialDetails: {
      tradeAmount: 37.50,
      currency: 'EUR',
      costAmount: 0.00,
      profitAmount: 0.00,
      compensationAmount: 0.00,
      lossAmount: 0.00,
      isSettled: false
    },
    afterSaleDetails: {
      afterSaleStatus: '争议中',
      disputeId: 'DISP-20261005-001',
      disputeReason: '商户核销返回卡密已被使用，出卡人主张卡密系全新购买',
      liabilityResult: '待判定'
    },
    stateEventLogs: [
      { id: 'LOG-01', time: '14:36:58', operator: '系统网关', fromState: '初始', toState: '已创建', reason: '出卡用户提交 Steam €50 卡密', traceId: 'TR-STM-01' },
      { id: 'LOG-02', time: '14:37:00', operator: '预检引擎', fromState: '已创建', toState: '待商户接单', reason: '基础黑名单与格式校验通过', traceId: 'TR-STM-02' },
      { id: 'LOG-03', time: '14:37:05', operator: '商户系统', fromState: '待商户接单', toState: '商户处理中', reason: '商户 MID-SPEEDY-EU 接单核验', traceId: 'TR-STM-03' },
      { id: 'LOG-04', time: '14:38:10', operator: '商户接口', fromState: '商户处理中', toState: '用户争议', reason: '商户核销报告空卡(0x44)，出卡人提起争议，流转进入售后中', traceId: 'TR-STM-04' },
    ],
    productTitle: 'Steam Wallet Card (EUR 欧区代码)',
    productCategoryCode: 'STEAM-EU-DIGITAL',
    exifStatus: '未上传凭据',
    slaDuration: '124s',
    slaMet: false,
    dispatchSeat: 'FRA-HUB-B03',
    exchangeRate: 7.7820,
    settleTotalCny: 0,
    grossProfitCny: 0,
    merchantPts: 0,
    traceId: 'TR-ERR-REDEEMED',
    httpStatus: 'HTTP 409 CONFLICT',
    cardPin: 'STM-9821-4412-1192',
    exceptionCode: 'CODE_ALREADY_REDEEMED',
    exceptionReason: '商户调用 Steam 网关时提示该卡密已在 2026-10-05 11:20:00 于其他账户兑换完毕',
    disputeCase: {
      disputeId: 'DISP-20261005-001',
      reason: '商户核销返回卡密已被使用，出卡人主张卡密系全新购买',
      submitTime: '2026-10-05 14:38:00',
      status: '待举证仲裁',
      buyerClaim: '充值账户提示 Duplicate Code，附上 Steam 官方充值错误存证。',
      merchantRebuttal: '已调取官方接口 TraceID，时间戳早于提交时间。'
    },
    userCreditScore: 78.0,
    userTotalTrades: 42,
    userSuccessRate: '88.1%',
    userDisputeRate: '4.76%',
    userPayoutMethod: '银行卡结算',
    userCountry: '德国 (DE)',
    merchantPointsBalance: 310000.00,
    merchantDeposit: 150000,
    merchantAvgSpeed: '32.0s',
    merchantDailyVolume: '¥340,000.00 (60单)',
    financialLedgerId: 'PTS-SUSPEND-88409',
    financialEntryTime: '未入账 (挂起冻结中)',
    hashProof: '0x88f2910aa11bcde...ee441'
  },
  {
    id: '3',
    orderId: 'ORD-20261005-88408',
    cardOrderId: 'KD-20261005-884081',
    time: '14:36:30',
    brand: 'Google Play Gift Card',
    brandCode: 'GOOGLE',
    country: 'US',
    countryName: '美国',
    countryFlag: '🇺🇸',
    mediaType: '电子代码卡密',
    faceValue: 200.00,
    currency: 'USD',
    userUid: 'U998231',
    userName: 'Chloe Bennett',
    userPhone: '159****8831',
    userVip: 'V2',
    merchantMid: 'MID-APEX-GAME',
    merchantName: 'APEX数字直通车',
    userRate: 80.0,
    userPrice: 160.00,
    merchantRate: 85.5,
    merchantPrice: 171.00,
    marginAmount: 11.00,
    marginPercent: 6.87,
    txnStatus: 'merchant_processing',
    txnStatusLabel: '商户处理中',
    status: '处理中',
    statusCode: 'processing',
    riskStatus: 'low',
    riskStatusLabel: '低风险 (常规)',
    afterSaleStatus: 'none',
    afterSaleStatusLabel: '无售后',
    duration: '12s',
    durationCode: 'IN-FLIGHT',
    maskedCode: 'GGL-****-****-7729',
    fullCode: 'GGL-8821-4401-7729',
    cardCheckDetails: {
      checkTime: '14:36:31.500',
      balance: '$200.00 USD',
      status: '有效足额',
      source: '官方直连API',
      result: '官方探针校验余额足额 $200.00，无锁定异常'
    },
    riskDetails: {
      hitRules: ['常规交易'],
      riskLevel: '低风险',
      riskScore: 18,
      result: '放行通过'
    },
    quoteDetails: {
      userRate: 80.0,
      userPrice: 160.00,
      merchantRate: 85.5,
      merchantPrice: 171.00,
      marketRefRate: 83.5,
      platformProfit: 11.00,
      platformProfitPercent: 6.87
    },
    merchantFulfillment: {
      merchantName: 'APEX数字直通车',
      merchantMid: 'MID-APEX-GAME',
      acceptTime: '14:36:32.000',
      fulfillTime: '核销处理中...',
      durationSeconds: 12,
      result: '处理中'
    },
    financialDetails: {
      tradeAmount: 160.00,
      currency: 'USD',
      costAmount: 160.00,
      profitAmount: 11.00,
      compensationAmount: 0.00,
      lossAmount: 0.00,
      isSettled: false
    },
    afterSaleDetails: {
      afterSaleStatus: '无售后',
      liabilityResult: '无责任'
    },
    stateEventLogs: [
      { id: 'LOG-01', time: '14:36:30', operator: '系统网关', fromState: '初始', toState: '已创建', reason: '用户提交 Google Play $200 卡密', traceId: 'TR-GGL-01' },
      { id: 'LOG-02', time: '14:36:31', operator: '预检引擎', fromState: '已创建', toState: '预检中', reason: '官方探针预检执行', traceId: 'TR-GGL-02' },
      { id: 'LOG-03', time: '14:36:32', operator: '撮合调度', fromState: '预检中', toState: '待商户接单', reason: '预检通过派单', traceId: 'TR-GGL-03' },
      { id: 'LOG-04', time: '14:36:33', operator: '商户网关', fromState: '待商户接单', toState: '商户处理中', reason: '商户 MID-APEX-GAME 已认领处理', traceId: 'TR-GGL-04' },
    ],
    productTitle: 'Google Play 兑换券 (US)',
    productCategoryCode: 'GGL-PLAY-US-CODE',
    exifStatus: '系统排队中',
    slaDuration: '12s (计时中)',
    slaMet: true,
    dispatchSeat: 'SH-CORE-ROUTER-04',
    exchangeRate: 7.1850,
    settleTotalCny: 1228.63,
    grossProfitCny: 79.03,
    merchantPts: 1228.63,
    traceId: 'TR-IN-FLIGHT-991',
    httpStatus: 'HTTP 102 PROCESSING',
    cardPin: 'GGL-8821-4401-7729',
    userCreditScore: 92.4,
    userTotalTrades: 320,
    userSuccessRate: '98.8%',
    userDisputeRate: '0.10%',
    userPayoutMethod: 'USDT-TRC20',
    userCountry: '加拿大 (CA)',
    merchantPointsBalance: 580000.00,
    merchantDeposit: 300000,
    merchantAvgSpeed: '14.5s',
    merchantDailyVolume: '¥1,200,000.00 (210单)',
    financialLedgerId: 'PRE-PTS-88408',
    financialEntryTime: '预冻结中',
    hashProof: '0x3342aa9901bcfff...771a2'
  },
  {
    id: '4',
    orderId: 'ORD-20261005-88405',
    cardOrderId: 'KD-20261005-884051',
    time: '14:35:10',
    brand: 'Razer Gold PIN Global',
    brandCode: 'RAZER',
    country: 'US',
    countryName: '美国',
    countryFlag: '🇺🇸',
    mediaType: '实体卡+收银存证',
    faceValue: 500.00,
    currency: 'USD',
    userUid: 'U109204',
    userName: 'Tan Wei Long',
    userPhone: '177****4491',
    userVip: 'V3',
    merchantMid: 'DESK-MANUAL-02',
    merchantName: '人工做卡专席 #OP-99',
    userRate: 84.0,
    userPrice: 420.00,
    merchantRate: 89.2,
    merchantPrice: 446.00,
    marginAmount: 26.00,
    marginPercent: 6.19,
    txnStatus: 'precheck_anomaly',
    txnStatusLabel: '待人工确认 (预检异常)',
    status: '人工做卡兜底',
    statusCode: 'manual',
    riskStatus: 'pending_review',
    riskStatusLabel: '待人工确认 (OCR字残)',
    afterSaleStatus: 'none',
    afterSaleStatusLabel: '无售后',
    duration: '45s',
    durationCode: 'MANUAL-AUDIT',
    maskedCode: 'RZ-MAN-****-8812',
    fullCode: 'RZ-MAN-9921-8812',
    isHighValue: true,
    cardCheckDetails: {
      checkTime: '14:35:12.000',
      balance: '待人工查验',
      status: '查验异常',
      source: '自动化探针',
      result: '涂层反光造成第14位字符识别置信度仅78.4%，转入人工做卡核对'
    },
    riskDetails: {
      hitRules: ['OCR字符残缺', '大额 $500 实体卡'],
      riskLevel: '待人工确认',
      riskScore: 55,
      result: '触发人工复核'
    },
    quoteDetails: {
      userRate: 84.0,
      userPrice: 420.00,
      merchantRate: 89.2,
      merchantPrice: 446.00,
      marketRefRate: 87.0,
      platformProfit: 26.00,
      platformProfitPercent: 6.19
    },
    merchantFulfillment: {
      merchantName: '人工做卡专席 #OP-99',
      merchantMid: 'DESK-MANUAL-02',
      acceptTime: '14:35:15.000',
      fulfillTime: '待客服核对',
      durationSeconds: 45,
      result: '处理中'
    },
    financialDetails: {
      tradeAmount: 420.00,
      currency: 'USD',
      costAmount: 420.00,
      profitAmount: 26.00,
      compensationAmount: 0.00,
      lossAmount: 0.00,
      isSettled: false
    },
    afterSaleDetails: {
      afterSaleStatus: '无售后',
      liabilityResult: '无责任'
    },
    stateEventLogs: [
      { id: 'LOG-01', time: '14:35:10', operator: '系统网关', fromState: '初始', toState: '已创建', reason: '用户提交 Razer Gold $500', traceId: 'TR-RZ-01' },
      { id: 'LOG-02', time: '14:35:11', operator: 'OCR引擎', fromState: '已创建', toState: '预检中', reason: 'OCR视觉分析', traceId: 'TR-RZ-02' },
      { id: 'LOG-03', time: '14:35:12', operator: '风控引擎', fromState: '预检中', toState: '预检异常', reason: '置信度低，触发分支：预检异常 ➔ 待人工确认', traceId: 'TR-RZ-03' },
    ],
    productTitle: 'Razer Gold 实体充值卡附带 7-Eleven 纸质小票存根',
    productCategoryCode: 'RAZER-GLD-PHYS',
    exifStatus: '人工复核 PASS',
    slaDuration: '45s',
    slaMet: true,
    dispatchSeat: 'DESK-MANUAL-02 (坐席 OP-99)',
    exchangeRate: 7.1850,
    settleTotalCny: 3204.51,
    grossProfitCny: 186.81,
    merchantPts: 3204.51,
    traceId: 'TR-MAN-AUDIT-992',
    httpStatus: 'MANUAL REPAIR',
    cardPin: 'RZ-MAN-9921-8812',
    userCreditScore: 94.1,
    userTotalTrades: 512,
    userSuccessRate: '98.2%',
    userDisputeRate: '0.15%',
    userPayoutMethod: 'USDT-TRC20',
    userCountry: '新加坡 (SG)',
    merchantPointsBalance: 720000.00,
    merchantDeposit: 400000,
    merchantAvgSpeed: '42.0s',
    merchantDailyVolume: '¥650,000.00 (95单)',
    financialLedgerId: 'PTS20261005-0405',
    financialEntryTime: '2026-10-05 14:36:00',
    hashProof: '0x99281a44efbc901...33b01'
  },
  {
    id: '5',
    orderId: 'ORD-20261005-88400',
    cardOrderId: 'KD-20261005-884001',
    time: '14:34:02',
    brand: 'Amazon 礼品券兑换码',
    brandCode: 'AMAZON',
    country: 'GB',
    countryName: '英国',
    countryFlag: '🇬🇧',
    mediaType: '纯代码 (E-Code)',
    faceValue: 150.00,
    currency: 'GBP',
    userUid: 'U881023',
    userName: 'James Wilson',
    userPhone: '139****1903',
    userVip: 'V2',
    merchantMid: 'MID-UK-CHANNEL',
    merchantName: '直通专线 #03',
    userRate: 83.0,
    userPrice: 124.50,
    merchantRate: 88.0,
    merchantPrice: 132.00,
    marginAmount: 7.50,
    marginPercent: 6.02,
    txnStatus: 'completed',
    txnStatusLabel: '已完成',
    status: '成功完结',
    statusCode: 'completed',
    riskStatus: 'normal',
    riskStatusLabel: '正常 (无风险)',
    afterSaleStatus: 'none',
    afterSaleStatusLabel: '无售后',
    duration: '2.3s',
    durationCode: 'API-FAST',
    maskedCode: 'AMZ-****-****-0129',
    fullCode: 'AMZ-8812-4412-0129',
    cardCheckDetails: {
      checkTime: '14:34:03.100',
      balance: '£150.00 GBP',
      status: '有效足额',
      source: '官方直连API',
      result: 'Amazon UK 官方接口核验卡码有效足额 £150.00'
    },
    riskDetails: {
      hitRules: ['常规白名单出卡'],
      riskLevel: '正常',
      riskScore: 2,
      result: '放行通过'
    },
    quoteDetails: {
      userRate: 83.0,
      userPrice: 124.50,
      merchantRate: 88.0,
      merchantPrice: 132.00,
      marketRefRate: 86.0,
      platformProfit: 7.50,
      platformProfitPercent: 6.02
    },
    merchantFulfillment: {
      merchantName: '直通专线 #03',
      merchantMid: 'MID-UK-CHANNEL',
      acceptTime: '14:34:03.500',
      fulfillTime: '14:34:04.400',
      durationSeconds: 2.3,
      result: '核销成功'
    },
    financialDetails: {
      tradeAmount: 124.50,
      currency: 'GBP',
      costAmount: 124.50,
      profitAmount: 7.50,
      compensationAmount: 0.00,
      lossAmount: 0.00,
      isSettled: true,
      settleBatchNo: 'BATCH-20261005-03'
    },
    afterSaleDetails: {
      afterSaleStatus: '无售后',
      liabilityResult: '无责任'
    },
    stateEventLogs: [
      { id: 'LOG-01', time: '14:34:02', operator: '系统网关', fromState: '初始', toState: '已创建', reason: '用户提交卡密', traceId: 'TR-AMZ-01' },
      { id: 'LOG-02', time: '14:34:03', operator: '预检引擎', fromState: '已创建', toState: '预检中', reason: '官方探针校验', traceId: 'TR-AMZ-02' },
      { id: 'LOG-03', time: '14:34:03', operator: '撮合调度', fromState: '预检中', toState: '商户处理中', reason: '秒级撮合至英国专线', traceId: 'TR-AMZ-03' },
      { id: 'LOG-04', time: '14:34:04', operator: '清算网关', fromState: '商户处理中', toState: '已完成', reason: '商户完成兑付放款', traceId: 'TR-AMZ-04' },
    ],
    productTitle: 'Amazon UK 电子代码充值券',
    productCategoryCode: 'AMZN-UK-ECODE',
    exifStatus: '纯代码通过',
    slaDuration: '2.3s',
    slaMet: true,
    dispatchSeat: 'LON-ROUTER-A01',
    exchangeRate: 9.3200,
    settleTotalCny: 1230.24,
    grossProfitCny: 69.90,
    merchantPts: 1230.24,
    traceId: 'TR-AMZ-UK-88400',
    httpStatus: 'HTTP 200',
    cardPin: 'AMZ-8812-4412-0129',
    userCreditScore: 96.8,
    userTotalTrades: 620,
    userSuccessRate: '99.4%',
    userDisputeRate: '0.00%',
    userPayoutMethod: '银行电汇',
    userCountry: '英国 (UK)',
    merchantPointsBalance: 510000.00,
    merchantDeposit: 250000,
    merchantAvgSpeed: '3.1s',
    merchantDailyVolume: '¥980,000.00 (140单)',
    financialLedgerId: 'PTS20261005-0400',
    financialEntryTime: '2026-10-05 14:34:05',
    hashProof: '0x4489bc01aef8821...11dd9'
  },
  {
    id: '6',
    orderId: 'ORD-20261005-88392',
    cardOrderId: 'KD-20261005-883921',
    time: '14:31:40',
    brand: 'Steam 充值卡 (阿根廷)',
    brandCode: 'STEAM',
    country: 'AR',
    countryName: '阿根廷',
    countryFlag: '🇦🇷',
    mediaType: '汇率高波动兑换码',
    faceValue: 100.00,
    currency: 'USD',
    userUid: 'U776102',
    userName: 'Mateo Rossi',
    userPhone: '158****2299',
    userVip: 'V1',
    merchantMid: 'MID-LATAM-01',
    merchantName: '拉美数字通',
    userRate: 86.0,
    userPrice: 86.00,
    merchantRate: 84.5,
    merchantPrice: 84.50,
    marginAmount: -1.50,
    marginPercent: -1.74,
    txnStatus: 'merchant_rejected',
    txnStatusLabel: '待转单 (商户拒单)',
    status: '风控拦截审核',
    statusCode: 'risk',
    riskStatus: 'high',
    riskStatusLabel: '高风险拦截 (倒挂)',
    afterSaleStatus: 'none',
    afterSaleStatusLabel: '无售后',
    duration: '88s',
    durationCode: 'PAUSED',
    maskedCode: 'STM-LAT-****-9901',
    fullCode: 'STM-LAT-7712-9901',
    isInverted: true,
    cardCheckDetails: {
      checkTime: '14:31:42.000',
      balance: '$100.00 USD',
      status: '有效足额',
      source: '官方直连API',
      result: '卡密有效但触发系统价格保护倒挂熔断'
    },
    riskDetails: {
      hitRules: ['汇率倒挂预警 (-1.74%)', '商户拒单率超阈值'],
      riskLevel: '高风险拦截',
      riskScore: 89,
      result: '拦截阻断'
    },
    quoteDetails: {
      userRate: 86.0,
      userPrice: 86.00,
      merchantRate: 84.5,
      merchantPrice: 84.50,
      marketRefRate: 85.0,
      platformProfit: -1.50,
      platformProfitPercent: -1.74
    },
    merchantFulfillment: {
      merchantName: '拉美数字通',
      merchantMid: 'MID-LATAM-01',
      acceptTime: '14:31:45.000',
      fulfillTime: '14:32:10.000',
      durationSeconds: 25,
      result: '拒单转单'
    },
    financialDetails: {
      tradeAmount: 86.00,
      currency: 'USD',
      costAmount: 86.00,
      profitAmount: -1.50,
      compensationAmount: 0.00,
      lossAmount: 1.50,
      isSettled: false
    },
    afterSaleDetails: {
      afterSaleStatus: '无售后',
      liabilityResult: '待判定'
    },
    stateEventLogs: [
      { id: 'LOG-01', time: '14:31:40', operator: '系统网关', fromState: '初始', toState: '已创建', reason: '用户提交卡密', traceId: 'TR-AR-01' },
      { id: 'LOG-02', time: '14:31:42', operator: '调度引擎', fromState: '已创建', toState: '待商户接单', reason: '自动撮合至商户拉美数字通', traceId: 'TR-AR-02' },
      { id: 'LOG-03', time: '14:32:10', operator: '商户网关', fromState: '待商户接单', toState: '商户拒单', reason: '商户反馈报价倒挂主动拒单，触发分支：商户拒单 ➔ 待转单', traceId: 'TR-AR-03' },
    ],
    productTitle: 'Steam ARS 汇率高波动兑换码',
    productCategoryCode: 'STEAM-ARS-RISK',
    exifStatus: '倒挂风控拦截',
    slaDuration: '88s (已暂停)',
    slaMet: false,
    dispatchSeat: 'RISK-ENGINE-01',
    exchangeRate: 7.1850,
    settleTotalCny: 607.13,
    grossProfitCny: -10.78,
    merchantPts: 607.13,
    traceId: 'TR-RISK-INVERTED',
    httpStatus: 'INTERCEPT_SUSPEND',
    cardPin: 'STM-LAT-7712-9901',
    exceptionCode: 'RATE_INVERTED_NEGATIVE_MARGIN',
    exceptionReason: '商户报价 84.5% 低于用户买入价 86.0%，平台毛利 -1.74% 触发硬熔断保护机制',
    userCreditScore: 84.5,
    userTotalTrades: 88,
    userSuccessRate: '94.2%',
    userDisputeRate: '1.20%',
    userPayoutMethod: 'USDT-TRC20',
    userCountry: '阿根廷 (AR)',
    merchantPointsBalance: 290000.00,
    merchantDeposit: 150000,
    merchantAvgSpeed: '25.0s',
    merchantDailyVolume: '¥210,000.00 (45单)',
    financialLedgerId: 'PTS-HOLD-88392',
    financialEntryTime: '熔断挂起中',
    hashProof: '0xee99102bcff4421...0011a'
  },
  {
    id: '7',
    orderId: 'ORD-20261005-88380',
    cardOrderId: 'KD-20261005-883801',
    time: '14:28:15',
    brand: 'Amazon eGift US',
    brandCode: 'AMAZON',
    country: 'US',
    countryName: '美国',
    countryFlag: '🇺🇸',
    mediaType: '电子代码卡密',
    faceValue: 250.00,
    currency: 'USD',
    userUid: 'U339102',
    userName: 'Elena Rostova',
    userPhone: '188****3312',
    userVip: 'V4',
    merchantMid: 'MID-US-TITAN',
    merchantName: '泰坦卡业北美专线',
    userRate: 85.0,
    userPrice: 212.50,
    merchantRate: 90.0,
    merchantPrice: 225.00,
    marginAmount: 12.50,
    marginPercent: 5.56,
    txnStatus: 'merchant_failed',
    txnStatusLabel: '异常处理中 (商户核销失败)',
    status: '异常挂起',
    statusCode: 'suspended',
    riskStatus: 'high',
    riskStatusLabel: '高风险拦截 (核销失败)',
    afterSaleStatus: 'case_filed',
    afterSaleStatusLabel: '已立案 (商户失效应急)',
    duration: '210s',
    durationCode: 'FAILED-DISPATCH',
    maskedCode: 'AMZ-US-****-8841',
    fullCode: 'AMZ-US-9912-8841',
    cardCheckDetails: {
      checkTime: '14:28:16.200',
      balance: '$250.00 USD',
      status: '有效足额',
      source: '官方直连API',
      result: '官方探针通过，但商户兑换端接口返回网络熔断超时'
    },
    riskDetails: {
      hitRules: ['商户端响应超时 (>=180s)', '大额卡单未完成'],
      riskLevel: '高风险拦截',
      riskScore: 75,
      result: '触发人工复核'
    },
    quoteDetails: {
      userRate: 85.0,
      userPrice: 212.50,
      merchantRate: 90.0,
      merchantPrice: 225.00,
      marketRefRate: 88.0,
      platformProfit: 12.50,
      platformProfitPercent: 5.56
    },
    merchantFulfillment: {
      merchantName: '泰坦卡业北美专线',
      merchantMid: 'MID-US-TITAN',
      acceptTime: '14:28:18.000',
      fulfillTime: '核销失败',
      durationSeconds: 180,
      result: '超时未接'
    },
    financialDetails: {
      tradeAmount: 212.50,
      currency: 'USD',
      costAmount: 212.50,
      profitAmount: 0.00,
      compensationAmount: 0.00,
      lossAmount: 0.00,
      isSettled: false
    },
    afterSaleDetails: {
      afterSaleStatus: '已立案',
      disputeId: 'DISP-20261005-002',
      disputeReason: '商户节点接口异常导致卡单未核销，已紧急移交兜底调度',
      liabilityResult: '商户全责'
    },
    stateEventLogs: [
      { id: 'LOG-01', time: '14:28:15', operator: '系统网关', fromState: '初始', toState: '已创建', reason: '用户提交卡单', traceId: 'TR-TITAN-01' },
      { id: 'LOG-02', time: '14:28:18', operator: '调度引擎', fromState: '已创建', toState: '商户处理中', reason: '分配给商户 MID-US-TITAN', traceId: 'TR-TITAN-02' },
      { id: 'LOG-03', time: '14:31:18', operator: 'SLA监控守护进程', fromState: '商户处理中', toState: '商户失败', reason: '商户处理超过 180 秒无心跳，触发分支：商户失败 ➔ 异常处理中', traceId: 'TR-TITAN-03' },
    ],
    productTitle: 'Amazon eGift US $250.00 电子卡',
    productCategoryCode: 'AMZN-US-250',
    exifStatus: '官方探针通过',
    slaDuration: '210s',
    slaMet: false,
    dispatchSeat: 'US-ENGINE-B09',
    exchangeRate: 7.1850,
    settleTotalCny: 1526.81,
    grossProfitCny: 0.00,
    merchantPts: 0.00,
    traceId: 'TR-TITAN-FAIL',
    httpStatus: 'HTTP 504 GATEWAY TIMEOUT',
    cardPin: 'AMZ-US-9912-8841',
    userCreditScore: 91.0,
    userTotalTrades: 210,
    userSuccessRate: '97.6%',
    userDisputeRate: '0.48%',
    userPayoutMethod: 'USDT-TRC20',
    userCountry: '美国 (US)',
    merchantPointsBalance: 450000.00,
    merchantDeposit: 250000,
    merchantAvgSpeed: '120.0s',
    merchantDailyVolume: '¥620,000.00 (80单)',
    financialLedgerId: 'PTS-HOLD-88380',
    financialEntryTime: '挂起中',
    hashProof: '0xbb881920acdef11...44002'
  }
];
