export type SettlementEntityType = 'MERCHANT' | 'AFFILIATE' | 'CHANNEL';

export type SettlementStatus = 
  | 'SETTLED'            // 已结案
  | 'PENDING_PAYOUT'      // 待打款出账
  | 'SUSPENDED_RISK'     // 差异挂起
  | 'PENDING_APPROVAL';  // 待确认审批

export type PayoutChannelType =
  | 'CMB_DIRECT'         // 招行企业直连
  | 'USDT_CONTRACT'      // USDT 智能合约
  | 'OPAY_DIRECT'        // OPay Local Bank
  | 'ALIPAY_LARGE';      // 支付宝大额通道

export interface SettlementLedgerItem {
  id: string;
  settlementNo: string;        // SET202609-M0192
  period: string;              // 2026-09-01 ~ 2026-09-15 (半月结)
  periodType: 'HALF_MONTH' | 'MONTH' | 'WEEK' | 'CUSTOM';
  entityType: SettlementEntityType;
  entityTypeLabel: string;     // 商户接单承揽 / 推广员直属分佣 / 渠道合作商户
  targetEntity: string;        // 深圳极速数码兑付服务中心
  creditCodeOrSource: string;  // 统一社会信用代码: 91440300MA5XXXX89X / 提成单源: #GRW-20260915-09
  cardOrderCount: number;      // 1,420 笔
  gmvUSD: number;              // $185,000.00
  deductFeeAmount: number;     // -$7,400.00
  deductDetailText: string;    // 费率4% (退单抵扣$0)
  payableAmount: number;       // $177,600.00
  actualPayoutAmount: number;  // 实结: $177,600.00
  actualPayoutNote?: string;   // 暂缓实付 / 应付待核 / 实结
  channel: PayoutChannelType;
  channelName: string;         // 招行企业直连 / USDT 智能合约 / OPay Local Bank
  channelIcon: string;         // corporate_fare / toll / account_balance
  status: SettlementStatus;
  statusLabel: string;
  riskLevel?: string;          // RISK-L2
  suspendReason?: string;      // 汇差对账赤字 $1,280
  
  // PRD 6.3 6 大 Tab 穿透详细数据
  inspectorData: {
    // 1. 账单总览
    overview: {
      reconPassRate: string;   // 100.00%
      reconNote: string;       // 1,420 笔卡密全量完成三方存证，未现任何重复核销争端
      bankHostStatus: string;  // CMB-HOST-TO-HOST: 交易成功
      bankSerialNo: string;    // 流水号: CMB20260916-891273910248
      targetAccount: string;   // 打款落地账户: 招商银行深圳分行南山支行 7559 **** **** 8819
      taxInvoiceStatus: string;// 专票已校验匹配并完成认证
      invoiceCode: string;     // 044032100111 | 金额: ¥1,243,200.00
      taxNote: string;         // 抵扣链条完整，可随时备查
      netReceivableUSD: number;
      platformRetainFeeUSD: number;
      disputeDeductionUSD: number;
    };
    // 2. 交易流水明细
    transactions: Array<{
      orderId: string;
      cardType: string;
      faceValue: number;
      rate: string;
      settleAmount: number;
      finishTime: string;
      status: string;
    }>;
    // 3. 平台费用与扣划清单
    feeDeductions: Array<{
      itemCode: string;
      itemName: string;
      calcBase: string;
      ratePercent: string;
      amountUSD: number;
      direction: 'SUB' | 'ADD';
      remark: string;
    }>;
    // 4. 争议与退单判责归因
    disputes: Array<{
      disputeId: string;
      cardNo: string;
      disputeReason: string;
      verdict: string;
      deductAmountUSD: number;
      responsibleParty: string;
      arbitrateTime: string;
    }>;
    // 5. 银企打款及发票凭据
    payoutVoucher: {
      voucherNo: string;
      paymentMethod: string;
      payoutTime: string;
      bankReceiptUrl?: string;
      txHash?: string;
      invoiceNumber: string;
      invoiceTaxAmount: number;
      verificationSeal: string;
    };
    // 6. 审计日志与追溯链
    auditLogs: Array<{
      stepId: string;
      actionName: string;
      operator: string;
      timestamp: string;
      node: string;
      notes: string;
      verifyStatus: 'PASS' | 'PENDING' | 'WARN';
    }>;
  };
}

export interface SettlementKPISummary {
  pendingSettlementUSD: number;       // $1,486,250.00
  pendingMerchantCount: number;       // 42
  pendingAffiliateCount: number;      // 18
  completedNetSettlementUSD: number;  // $3,850,400.00
  platformRetentionFeeUSD: number;    // $58,420.00
  platformFeeRatePercent: number;     // 3.92
  collateralDeductUSD: number;        // 14200
  suspendedDisputeCount: number;      // 2
  suspendedRiskLabel: string;         // RISK-L2
}
