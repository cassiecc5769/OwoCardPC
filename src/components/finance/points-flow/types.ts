export type LedgerTxType =
  | 'CARD_DEDUCT'
  | 'RECHARGE'
  | 'CARD_LOCK'
  | 'UNFREEZE_RETURN'
  | 'MANUAL_CREDIT'
  | 'DISPUTE_PENALTY';

export type LedgerTabType = 'all' | 'inflow' | 'outflow' | 'escrow';

export interface LedgerTransaction {
  id: string;
  txid: string; // e.g. PTS20260918-8809
  time: string; // e.g. 16:41:52.921
  fullTime: string; // e.g. 2026-09-18 16:41:52.921
  ms: string; // 921
  type: LedgerTxType;
  typeName: string; // 交易扣减
  bizId: string; // KD20260827-9912
  bizType: string; // 卡单兑付核销 (Gift Card Settle)
  merchantName: string;
  merchantShort: string;
  merchantMid: string;
  pointsChange: number; // e.g. -50000
  isEscrow?: boolean;
  availableBefore: number;
  availableAfter: number;
  frozenBefore: number;
  frozenAfter: number;
  source: string; // 官方API核销 / 系统撮合引擎 / 财务人工审批
  note: string;
  cardDetails: string;
  settlementRate: string;
  debitSubject: string; // Dr
  creditSubject: string; // Cr
  auditOperator: string;
  apiNode: string;
  apiTx: string;
  apiLatency: string;
  blockHash: string;
  rawJson: Record<string, any>;
}

export interface LedgerSummaryMetrics {
  todayInflow: number; // +8,450,200.00 PTS
  inflowGrowth: string; // +12.4%
  inflowTxCount: number; // 9,284
  inflowBreakdown: string; // 包含商户充值 +4.2M / 流单退款 +3.1M / 争议赔偿 +1.15M
  todayOutflow: number; // -7,120,400.00 PTS
  outflowStatus: string; // 正常峰值
  outflowTxCount: number; // 7,716
  outflowBreakdown: string; // 卡单核销做卡 -6.4M / 售后追索冲正 -720.4K
  netChange: number; // +1,329,800.00 PTS
  deltaRatio: string; // +18.67%
  activeEscrowPoints: number; // 15,770,400.00 PTS
  activeEscrowOrders: number; // 1,420
}
