export type ReconVarianceType =
  | 'PTS_DEFICIT'       // 少扣积点 (PTS-DEFICIT)
  | 'UNCREDITED'         // 充值未入账 (UNCREDITED)
  | 'UNILATERAL'         // 单边账 (UNILATERAL)
  | 'PTS_SURPLUS'        // 多扣积点 (PTS-SURPLUS)
  | 'FEE_MISMATCH'       // 费率结算差额 (FEE-MISMATCH)
  | 'REVERSE_FAIL';      // 冲正挂账 (REVERSE-FAIL)

export type ReconVarianceStatus =
  | 'PENDING_CHECK'      // 待核查
  | 'APPROVAL_IN_FLIGHT' // 调账审批中
  | 'SETTLED_BALANCED'   // 已平账结案
  | 'REJECTED';          // 已驳回

export interface ReconVarianceItem {
  id: string;
  diffNo: string;               // e.g. DIF-20260918-001
  timestamp: string;            // 2026-09-18 14:22:04
  nodeTrigger: string;          // [CORE-SETTLE]
  merchantName: string;         // 极光数码收卡旗舰
  merchantId: string;           // M1092
  merchantShort: string;        // 极光数码
  relatedBizId: string;         // KD-20260918-992144 / TOP-20260918-400192
  bizType: 'ORDER_CARD' | 'RECHARGE_TOPUP' | 'DISPUTE_CLAIM' | 'SETTLE_PAYOUT';
  type: ReconVarianceType;
  typeName: string;             // 少扣积点 (PTS-DEFICIT)
  bizAmountStr: string;         // 业务: $500.00 / 资金账: $1,000.00
  pointsAmountStr: string;      // 积点: 350.00 PTS
  diffPoints: number;           // -150.00 PTS
  diffCurrency: number;         // -$150.00 USD
  diffCurrencyStr: string;      // (折合 -$150.00)
  rootCause: string;            // 积点扣减MQ重试超限断流
  rootCauseDetail: string;      // Kafka积点变更Topic消费异常，重试3次超时后进入死信队列，业务单成功核销但积点账未完成扣减。
  responsibility: string;       // 系统接口 (RPC-TIMEOUT) / 第三方通道 (USDT-GATE) / 运营配置 (RULE-MISSING)
  responsibilityType: 'SYSTEM' | 'CHANNEL' | 'OPERATIONS' | 'MERCHANT';
  proposedAction: string;       // 生成标准账户调整单 (补扣)
  actionType: 'ADJUST_DEBIT' | 'ADJUST_CREDIT' | 'REVERSAL_RED' | 'FORCE_SETTLE';
  status: ReconVarianceStatus;
  auditor: string;              // AUDIT-MGR-08
  approver?: string;            // CFO-01
  lockedAtRiskValue: number;    // 150.00 USD
  isLocked: boolean;
  ledgerEvidence: {
    bizLedgerEntry?: { id: string; status: string; amount: number; time: string };
    pointsLedgerEntry?: { txid: string; status: string; points: number; time: string };
    settleLedgerEntry?: { batchId: string; status: string; rate: string };
    bankLedgerEntry?: { bankTx: string; channel: string; verified: boolean };
  };
}

export interface ReconTaskSummary {
  taskId: string;               // #REC-TASK-20260918-D01
  taskName: string;             // 2026-09-18 平台商户与资金综合日对账
  taskPeriod: string;           // 2026-09-18 00:00:00 - 23:59:59
  status: 'RUNNING' | 'COMPLETED' | 'EXCEPTION';
  accuracyRate: number;         // 99.98%
  throughputVolume: number;     // 48,250
  unresolvedVariancesCount: number; // 3
  unresolvedVarianceTypes: {
    unilateralCount: number;    // 单边账 1 笔
    deficitCount: number;       // 少扣 1 笔
    uncreditedCount: number;    // 充值未入 1 笔
  };
  lockedRiskValueUSD: number;   // 1280.00 USD
  lockedRiskValueCNY: number;   // 9216.00 CNY
  globalFundWaterLevelCNY: number; // 48,290,400.00
  auditedPendingCount: number;  // 待核查: 2
  approvingCount: number;       // 调账审批中: 1
  settledClosedCount: number;   // 已平账结案: 18
  lastRecheckTime: string;      // 2026-09-19 03:12:00
}

export interface AdjustmentOrderForm {
  diffId: string;
  diffNo: string;
  merchantName: string;
  merchantId: string;
  direction: 'DEBIT_SUB' | 'CREDIT_ADD' | 'REVERSAL'; // 借记补扣 / 贷记补入 / 红字冲正
  amountPTS: number;
  equivalentUSD: number;
  reason: string;
  accountingSubjectDebit: string;
  accountingSubjectCredit: string;
  auditManager: string;
  secondSignApprover: string;
  remark: string;
  executeImmediately: boolean;
}
