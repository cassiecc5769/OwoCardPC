// Card Tool Service 平台统一卡工具架构 (PRD 16.2 规范)

// 5 大标准 Capability 统一定义
export type CapabilityCode =
  | 'BALANCE_CHECK'   // 余额查询: 查询当前余额
  | 'STATUS_CHECK'    // 状态查询: 查询卡当前状态
  | 'ORDER_CHECK'     // 订单查询: 查询相关外部订单
  | 'FAST_REDEEM'     // 快充: 执行快充能力 (高风险敏感)
  | 'CODE_COMPLETE';  // 卡码补全: 补全卡码信息 (高风险敏感)

export const CAPABILITY_MAP: Record<CapabilityCode, { name: string; desc: string; isSensitive: boolean; icon: string }> = {
  BALANCE_CHECK: { name: '余额查询', desc: '查询卡内实际可用余额与币种', isSensitive: false, icon: 'account_balance_wallet' },
  STATUS_CHECK: { name: '状态查询', desc: '查询卡当前状态 (Active/Redeemed/Locked)', isSensitive: false, icon: 'fact_check' },
  ORDER_CHECK: { name: '订单查询', desc: '查询卡密关联的官方外部订单与消费记录', isSensitive: false, icon: 'receipt_long' },
  FAST_REDEEM: { name: '快充', desc: '执行卡密快充代充能力 (敏感操作)', isSensitive: true, icon: 'bolt' },
  CODE_COMPLETE: { name: '卡码补全', desc: '通过智能算法与特征比对补全模糊卡码 (敏感操作)', isSensitive: true, icon: 'auto_fix_high' }
};

// 调用主体定义
export type CallerType = 'SYSTEM' | 'MERCHANT' | 'PLATFORM_CS' | 'PLATFORM_ADMIN';

// 服务来源优先级
export type SourcePriority = 'PRIMARY' | 'BACKUP_1' | 'BACKUP_2';

// 工具状态与健康度
export type ToolStatus = 'ENABLED' | 'DISABLED';
export type ToolHealthStatus = 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';

// 1. 工具定义模型 (Tool Item)
export interface ToolItem {
  toolId: string;           // 工具唯一ID (如 TOOL-APP-US-BAL-01)
  name: string;             // 工具名称 (如 Apple US 官方直连余额查验)
  brand: string;            // Brand (Apple / Steam / Sephora / Target / Vanilla 等)
  country: string;          // Country (US / CA / UK / Global 等)
  capability: CapabilityCode; // Capability
  capabilityName: string;   // 中文能力名
  source: string;           // 实际服务来源 (Source)
  sourcePriority: SourcePriority; // 主/备及优先级
  status: ToolStatus;       // 启用/停用 (ENABLED / DISABLED)
  healthStatus: ToolHealthStatus; // 正常/异常/不可用
  timeoutMs: number;        // 超时时间 (毫秒)
  retryPolicy: string;      // 重试策略 (如 "2次/指数退避 (1s/2s)")
  callerTypes: CallerType[]; // 调用主体 [SYSTEM, MERCHANT, PLATFORM_CS]
  version: string;          // 当前版本 (如 "v2.4.1")
  updatedTime: string;      // 最近更新时间
  // 详情扩展字段
  description: string;
  endpointType: 'DIRECT_API' | 'POS_GATEWAY' | 'RPC_PIPELINE' | 'OCR_AI_CLUSTER';
  primarySource: string;
  backupSource: string;
  inputMapping: string;
  outputMapping: string;
  // 运行情况
  stats: {
    successRate: number;    // 成功率 %
    failureRate: number;    // 失败率 %
    avgLatencyMs: number;   // 平均耗时 ms
    todayCalls: number;     // 今日调用量
    recentAnomaly: string;  // 最近异常
    recentCalledTime: string; // 最近调用时间
  };
  // 版本记录
  versionHistory: Array<{
    version: string;
    operator: string;
    changeNote: string;
    date: string;
  }>;
}

// 2. 商户授权模型 (Merchant × Brand × Country × Capability)
export type AuthStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'REVOKED';
export type AuthType = 'PERMANENT' | 'TEMPORARY';

export interface MerchantAuthItem {
  authId: string;           // 授权ID (如 AUTH-MCH01-APP-US-BAL)
  merchantId: string;       // 商户ID (如 MID-M01)
  merchantName: string;     // 商户名称 (如 易兑数字科技)
  merchantCode: string;     // 商户编号 (如 MCH-ED-001)
  brand: string;            // Brand (如 Apple)
  country: string;          // Country (如 US)
  capability: CapabilityCode; // Capability (如 BALANCE_CHECK)
  capabilityName: string;   // 能力中文名
  status: AuthStatus;       // 待生效 / 生效中 / 已过期 / 已关闭
  authType: AuthType;       // 永久授权 / 临时授权
  effectiveFrom: string;    // 生效时间
  expiresAt: string;        // 到期时间 (或 "PERMANENT")
  isSensitive: boolean;     // 是否敏感高危权限 (FAST_REDEEM / CODE_COMPLETE)
  dailyCallQuota: number;   // 日调用限额
  todayUsedCalls: number;   // 今日已用
  maxQps: number;           // QPS 限流
  grantedBy: string;        // 授权人
  reason: string;           // 授权原因与业务审批单号
  updatedAt: string;        // 更新时间
}

// 3. 授权审计记录
export interface ToolAuditLogItem {
  logId: string;
  operator: string;         // 操作人
  timestamp: string;        // 操作时间
  actionType:
    | 'TOOL_CREATE'
    | 'TOOL_CONFIG_CHANGE'
    | 'TOOL_STATUS_CHANGE'
    | 'MERCHANT_GRANT'
    | 'MERCHANT_REVOKE'
    | 'SOURCE_ROUTING'
    | 'SOURCE_FAILOVER'
    | 'SENSITIVE_ACCESS';
  actionName: string;
  targetObject: string;     // 目标对象 (如 "商户A · Apple US BALANCE_CHECK")
  beforeState: string;      // 修改前
  afterState: string;       // 修改后
  reason: string;           // 原因
  ipAddress: string;
}

// 4. 树形层级结构 (Brand ➔ Country ➔ Capability ➔ Sources)
export interface CapabilityNode {
  capability: CapabilityCode;
  capabilityName: string;
  primaryTool: ToolItem;
  backupTools: ToolItem[];
  allTools: ToolItem[];
}

export interface CountryNode {
  country: string;
  countryName: string;
  capabilities: Record<CapabilityCode, CapabilityNode>;
}

export interface BrandNode {
  brand: string;
  brandName: string;
  icon: string;
  countries: Record<string, CountryNode>;
}

// ---------------------------------------------------------------------------
// 5. 卡查询模块数据契约 (PRD 16.3 统一输入输出与异常处理)
// ---------------------------------------------------------------------------

// 7 大标准调用场景 (Call Scene)
export type CallScene =
  | 'PRE_CHECK'          // 预检进单
  | 'MERCHANT_ACCEPT'    // 商户接单前核验
  | 'MERCHANT_PROCESS'   // 商户处理中核验
  | 'PLATFORM_REVIEW'    // 平台人工复核
  | 'RISK_REVIEW'        // 风控复核
  | 'AFTERSALE_REVIEW'   // 售后争议调查
  | 'MANUAL_QUERY';      // 独立人工临时查询

export const CALL_SCENE_MAP: Record<CallScene, { label: string; desc: string }> = {
  PRE_CHECK: { label: 'PRE_CHECK (预检进单)', desc: '用户进单环节自动触发验真与排重' },
  MERCHANT_ACCEPT: { label: 'MERCHANT_ACCEPT (商户接单核验)', desc: '商户接单前确认卡密状态' },
  MERCHANT_PROCESS: { label: 'MERCHANT_PROCESS (商户履约处理)', desc: '商户充值或核销中调取官方接口' },
  PLATFORM_REVIEW: { label: 'PLATFORM_REVIEW (平台人工复核)', desc: '客服/运营人工核对卡单信息' },
  RISK_REVIEW: { label: 'RISK_REVIEW (风控复核)', desc: '风控异常卡调阅底层真实快照' },
  AFTERSALE_REVIEW: { label: 'AFTERSALE_REVIEW (售后争议调查)', desc: '售后仲裁调阅历史消费与订单收据' },
  MANUAL_QUERY: { label: 'MANUAL_QUERY (独立临时查询)', desc: '客服手工临时查询单张卡情况' }
};

// 5 大统一查询结果分类 (Result Code)
export type QueryResultCode =
  | 'SUCCESS'             // 正常获得结果 (正常展示并可回写)
  | 'BUSINESS_EXCEPTION'  // 工具正常，但卡存在业务异常 (余额=0 / 已兑换 / 锁卡)
  | 'DATA_MISMATCH'       // 返回数据与申报不一致 (申报100，实际50)
  | 'TOOL_ERROR'          // 工具调用失败 (接口超时504 / 异常，支持Retry/Failover，不误判坏卡)
  | 'UNKNOWN';            // 无法确定 (超时且结果未知，阻断重复操作)

// 统一输入模型 (Card Query Input)
export interface CardQueryInput {
  brand: string;            // 是: 卡品牌 (Apple / Steam / Sephora / Target / Vanilla 等)
  country: string;          // 是: 国家 (US / CA / UK / Global 等)
  currency?: string;        // 视能力: 币种 (USD, GBP, EUR, CAD 等)
  cardCode: string;         // 是: 卡码
  pin?: string;             // 视能力: PIN 码
  declaredValue?: number;   // 否: 用户申报面额
  cardId?: string;          // 业务场景必传: 平台 Card ID
  orderId?: string;         // 有订单时必传: 平台卡单号
  merchantId?: string;      // 商户场景传: 商户号
  callerType: CallerType;   // 是: 调用主体 (PLATFORM_CS / SYSTEM / MERCHANT / PLATFORM_ADMIN)
  callerId: string;         // 是: 调用人 (如 "客服专员 (王芳 · CS03)")
  callScene: CallScene;     // 是: 7大调用场景
  capability: CapabilityCode; // 是: 选择执行的能力
}

// 统一输出模型 (Card Query Output)
export interface CardQueryOutput {
  requestId: string;        // 唯一请求ID (如 REQ-20261006-89104)
  toolId: string;           // 工具ID (如 TOOL-APP-US-BAL-01)
  resultCode: QueryResultCode; // 统一结果状态
  resultMessage: string;    // 结果中文说明
  balance: number;          // 可用余额
  currency: string;         // 币种
  cardStatus: string;       // 卡状态 (Active / Redeemed / Inactive / Locked)
  externalOrderId?: string; // 外部官方订单号
  externalOrderStatus?: string; // 外部官方订单状态
  source: string;           // 实际服务源
  queryTime: string;        // 查询时间
  durationMs: number;       // 耗时毫秒
  errorCode?: string;       // 错误码 (若有)
  rawResultRef: string;     // 底层防伪签名哈希
  // 敏感能力/业务扩展
  isMismatch?: boolean;     // 是否面额倒挂
  writtenBackToOrder?: boolean; // 是否已回写卡单
  cardCandidates?: string[]; // 卡码补全候选
  targetAccount?: string;   // 快充目标账户
  rechargeStatusText?: string;
}

// 关联卡单快速索引
export interface QueryOrderPreset {
  orderId: string;
  cardId: string;
  brand: string;
  country: string;
  currency: string;
  declaredValue: number;
  cardCode: string;
  maskedCode: string;
  pin?: string;
  userName: string;
  userId: string;
  status: string;
  scene: CallScene;
}

// ---------------------------------------------------------------------------
// 6. 工具记录数据契约 (PRD 16.4: 查询记录 / 调用日志 / 业务证据)
// ---------------------------------------------------------------------------

// 6.1 查询记录 (面向业务人员)
export interface ToolQueryRecordItem {
  requestId: string;
  cardId: string;
  orderId: string;
  merchantId: string;
  merchantName: string;
  brand: string;
  country: string;
  capability: CapabilityCode;
  capabilityName: string;
  callerType: CallerType;
  caller: string;
  callScene: CallScene;
  result: QueryResultCode;
  resultText: string;
  balance: number;
  currency: string;
  cardStatus: string;
  queryTime: string;
  rawSignature: string;
  durationMs: number;
}

// 6.2 调用日志链路节点 (面向管理员排查问题)
export interface CallChainHop {
  hopIndex: number;
  nodeType: 'PRIMARY' | 'RETRY' | 'BACKUP';
  sourceName: string;
  requestTime: string;
  durationMs: number;
  status: 'SUCCESS' | 'TIMEOUT' | 'ERROR' | 'NETWORK_ERR';
  statusCode: number;
  errorCode?: string;
  errorDetail?: string;
}

export interface ToolCallLogItem {
  requestId: string;
  toolId: string;
  source: string;
  requestTime: string;
  responseTime: string;
  durationMs: number;
  retryCount: number;
  failoverStatus: 'NONE' | 'RETRY_SUCCESS' | 'FAILOVER_SUCCESS' | 'ALL_FAILED';
  resultCode: QueryResultCode;
  errorCode?: string;
  errorMessage?: string;
  callerType: CallerType;
  caller: string;
  brand: string;
  country: string;
  capability: CapabilityCode;
  callChain: CallChainHop[];
}

// 6.3 业务证据时间轴节点 (不可覆盖快照)
export interface EvidenceTimelineNode {
  stage: 'T1_SUBMIT' | 'T2_MERCHANT_ACCEPT' | 'T3_MERCHANT_PROCESS' | 'T4_COMPLETE_OR_ABNORMAL' | 'T5_AFTERSALE_REVIEW';
  stageName: string;
  queryTime: string;
  balance: number;
  currency: string;
  cardStatus: string;
  source: string;
  caller: string;
  callScene: CallScene;
  requestId: string;
  snapshotHash: string;
  externalOrderId?: string;
  note: string;
}

export interface CardBusinessEvidenceItem {
  evidenceId: string;
  cardId: string;
  orderId: string;
  merchantId: string;
  merchantName: string;
  brand: string;
  country: string;
  currency: string;
  declaredValue: number;
  maskedCardCode: string;
  createdAt: string;
  status: 'NORMAL' | 'DISPUTE_PROCESSING' | 'RESOLVED_MERCHANT_FAULT' | 'RESOLVED_USER_FAULT' | 'SETTLED';
  disputeType?: 'USER_SUBMIT_EMPTY' | 'MERCHANT_SWEEP_DELAY' | 'FACE_MISMATCH' | 'NONE';
  timelineNodes: EvidenceTimelineNode[];
  verdict?: string;
  verdictDetail?: string;
}

