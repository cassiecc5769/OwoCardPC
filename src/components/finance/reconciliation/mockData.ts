import { ReconVarianceItem, ReconTaskSummary } from './types';

export const INITIAL_RECON_TASK: ReconTaskSummary = {
  taskId: '#REC-TASK-20260918-D01',
  taskName: '2026-09-18 平台商户与资金综合日对账',
  taskPeriod: '2026-09-18 00:00:00 - 23:59:59',
  status: 'RUNNING',
  accuracyRate: 99.98,
  throughputVolume: 48250,
  unresolvedVariancesCount: 3,
  unresolvedVarianceTypes: {
    unilateralCount: 1,
    deficitCount: 1,
    uncreditedCount: 1
  },
  lockedRiskValueUSD: 1280.00,
  lockedRiskValueCNY: 9216.00,
  globalFundWaterLevelCNY: 48290400.00,
  auditedPendingCount: 2,
  approvingCount: 1,
  settledClosedCount: 18,
  lastRecheckTime: '2026-09-19 03:12:00'
};

export const INITIAL_VARIANCE_ITEMS: ReconVarianceItem[] = [
  {
    id: 'diff-01',
    diffNo: 'DIF-20260918-001',
    timestamp: '2026-09-18 14:22:04',
    nodeTrigger: '[CORE-SETTLE]',
    merchantName: '极光数码收卡旗舰 (M1092)',
    merchantId: 'M1092',
    merchantShort: '极光数码收卡旗舰',
    relatedBizId: 'KD-20260918-992144',
    bizType: 'ORDER_CARD',
    type: 'PTS_DEFICIT',
    typeName: '少扣积点 (PTS-DEFICIT)',
    bizAmountStr: '业务: $500.00',
    pointsAmountStr: '积点: 350.00 PTS',
    diffPoints: -150.0,
    diffCurrency: -150.0,
    diffCurrencyStr: '(折合 -$150.00)',
    rootCause: '积点扣减MQ重试超限断流',
    rootCauseDetail: 'Kafka 积点账务扣减 Topic 发生短暂集群网络抖动，消息消费重试 3 次后触达限时阈值进入 DLQ 死信队列。业务端收卡状态已判定成功，但积点账本扣减缺失 150.00 PTS。',
    responsibility: '系统接口 (RPC-TIMEOUT)',
    responsibilityType: 'SYSTEM',
    proposedAction: '生成标准账户调整单 (补扣)',
    actionType: 'ADJUST_DEBIT',
    status: 'PENDING_CHECK',
    auditor: 'AUDIT-MGR-08',
    approver: 'CFO-01',
    lockedAtRiskValue: 150.0,
    isLocked: true,
    ledgerEvidence: {
      bizLedgerEntry: {
        id: 'KD-20260918-992144',
        status: 'SUCCESS_CONFIRMED',
        amount: 500.0,
        time: '2026-09-18 14:22:01.120'
      },
      pointsLedgerEntry: {
        txid: 'PTS-TX-992144-PARTIAL',
        status: 'PARTIAL_DEDUCT_350',
        points: 350.0,
        time: '2026-09-18 14:22:02.850'
      },
      settleLedgerEntry: {
        batchId: 'SETTLE-B20260918-04',
        status: 'PENDING_RECON_HOLD',
        rate: '1.0 USD = 1.0 PTS'
      },
      bankLedgerEntry: {
        bankTx: 'BANK-SYNC-N/A',
        channel: 'INTERNAL-BALANCE',
        verified: true
      }
    }
  },
  {
    id: 'diff-02',
    diffNo: 'DIF-20260918-002',
    timestamp: '2026-09-18 11:05:12',
    nodeTrigger: '[PAY-GATEWAY]',
    merchantName: '远东跨境互娱 (M0041)',
    merchantId: 'M0041',
    merchantShort: '远东跨境互娱',
    relatedBizId: 'TOP-20260918-400192',
    bizType: 'RECHARGE_TOPUP',
    type: 'UNCREDITED',
    typeName: '充值未入账 (UNCREDITED)',
    bizAmountStr: '资金账: $1,000.00',
    pointsAmountStr: '积点账: 0.00 PTS',
    diffPoints: 1000.0,
    diffCurrency: 1000.0,
    diffCurrencyStr: '待补登积点',
    rootCause: '网银Webhook回调丢单/超时',
    rootCauseDetail: '第三方 USDT 充值通道触发链上 12 个确认后推送 Webhook，因网关 WAF 拦截规则误判造成 HTTP 504 Gateway Timeout，资金账已到账但商户积点账户未触发自动加款。',
    responsibility: '第三方通道 (USDT-GATE)',
    responsibilityType: 'CHANNEL',
    proposedAction: '生成标准账户调整单 (补入)',
    actionType: 'ADJUST_CREDIT',
    status: 'APPROVAL_IN_FLIGHT',
    auditor: 'AUDIT-MGR-08',
    approver: 'CFO-01',
    lockedAtRiskValue: 1000.0,
    isLocked: true,
    ledgerEvidence: {
      bizLedgerEntry: {
        id: 'TOP-20260918-400192',
        status: 'CALLBACK_PENDING_MANUAL',
        amount: 1000.0,
        time: '2026-09-18 11:04:40.000'
      },
      pointsLedgerEntry: {
        txid: 'PTS-TOP-UNCREDITED',
        status: 'ZERO_ENTRY_PENDING',
        points: 0.0,
        time: '2026-09-18 11:05:12.000'
      },
      settleLedgerEntry: {
        batchId: 'SET-TOP-20260918-02',
        status: 'AWAITING_CREDIT_ENTRY',
        rate: '1.0 USD = 1.0 PTS'
      },
      bankLedgerEntry: {
        bankTx: 'TRX-USDT-TXID-9918237192',
        channel: 'USDT-TRC20-GATE',
        verified: true
      }
    }
  },
  {
    id: 'diff-03',
    diffNo: 'DIF-20260918-003',
    timestamp: '2026-09-18 09:12:45',
    nodeTrigger: '[SETTLE-ENGINE]',
    merchantName: '闪电卡券全球社 (M0819)',
    merchantId: 'M0819',
    merchantShort: '闪电卡券全球社',
    relatedBizId: 'KD-20260918-771802',
    bizType: 'ORDER_CARD',
    type: 'UNILATERAL',
    typeName: '单边账 (UNILATERAL)',
    bizAmountStr: '业务账: 已作废 (VOID)',
    pointsAmountStr: '结算账: 130.00 PTS',
    diffPoints: -130.0,
    diffCurrency: -130.0,
    diffCurrencyStr: '(折合 -$130.00)',
    rootCause: '卡单风控拦截但结算账未联动撤销',
    rootCauseDetail: '商户提交卡单后在 T+3 秒内被风控反欺诈模块熔断拦截作废，业务订单状态置为 VOID，但结算批次引擎拉取账单快照出现 10 秒时间差，仍将该作废卡计入结算账生成了 130.00 PTS 记账。',
    responsibility: '运营配置 (RULE-MISSING)',
    responsibilityType: 'OPERATIONS',
    proposedAction: '红字冲正流水 (REVERSAL)',
    actionType: 'REVERSAL_RED',
    status: 'PENDING_CHECK',
    auditor: 'AUDIT-MGR-08',
    approver: 'CFO-01',
    lockedAtRiskValue: 130.0,
    isLocked: true,
    ledgerEvidence: {
      bizLedgerEntry: {
        id: 'KD-20260918-771802',
        status: 'VOID_INTERCEPTED',
        amount: 130.0,
        time: '2026-09-18 09:12:35.400'
      },
      pointsLedgerEntry: {
        txid: 'PTS-ROLLBACK-OK',
        status: 'ROLLEDBACK_0',
        points: 0.0,
        time: '2026-09-18 09:12:36.100'
      },
      settleLedgerEntry: {
        batchId: 'SETTLE-B20260918-01',
        status: 'UNILATERAL_OVER_CREDIT',
        rate: '1.0 USD = 1.0 PTS'
      },
      bankLedgerEntry: {
        bankTx: 'BANK-NO-PAYOUT',
        channel: 'PAYOUT_HELD',
        verified: true
      }
    }
  }
];

export const HISTORICAL_TASKS = [
  {
    taskId: '#REC-TASK-20260918-D01',
    name: '2026-09-18 平台商户与资金综合日对账',
    period: '2026-09-18 00:00 - 23:59',
    accuracy: 99.98,
    totalVolume: 48250,
    variances: 3,
    status: 'RUNNING',
    operator: 'AUDIT-MGR-08'
  },
  {
    taskId: '#REC-TASK-20260917-D01',
    name: '2026-09-17 平台商户与资金综合日对账',
    period: '2026-09-17 00:00 - 23:59',
    accuracy: 100.0,
    totalVolume: 46190,
    variances: 0,
    status: 'COMPLETED',
    operator: 'AUDIT-MGR-08'
  },
  {
    taskId: '#REC-TASK-20260916-D01',
    name: '2026-09-16 平台商户与资金综合日对账',
    period: '2026-09-16 00:00 - 23:59',
    accuracy: 99.99,
    totalVolume: 44800,
    variances: 0,
    status: 'COMPLETED',
    operator: 'AUDIT-MGR-08'
  },
  {
    taskId: '#REC-TASK-20260915-D01',
    name: '2026-09-15 平台商户与资金综合日对账',
    period: '2026-09-15 00:00 - 23:59',
    accuracy: 99.97,
    totalVolume: 49300,
    variances: 0,
    status: 'COMPLETED',
    operator: 'AUDIT-LEAD-03'
  }
];
