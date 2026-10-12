import { SettlementLedgerItem, SettlementKPISummary } from './types';

export const INITIAL_SETTLEMENT_KPI: SettlementKPISummary = {
  pendingSettlementUSD: 1486250.00,
  pendingMerchantCount: 42,
  pendingAffiliateCount: 18,
  completedNetSettlementUSD: 3850400.00,
  platformRetentionFeeUSD: 58420.00,
  platformFeeRatePercent: 3.92,
  collateralDeductUSD: 14200.00,
  suspendedDisputeCount: 2,
  suspendedRiskLabel: 'RISK-L2'
};

export const INITIAL_SETTLEMENT_LEDGERS: SettlementLedgerItem[] = [
  // Row 1: Merchant Normal - SET202609-M0192 (深圳极速数码兑付服务中心)
  {
    id: 'set-01',
    settlementNo: 'SET202609-M0192',
    period: '2026-09-01 ~ 2026-09-15 (半月结)',
    periodType: 'HALF_MONTH',
    entityType: 'MERCHANT',
    entityTypeLabel: '商户接单承揽',
    targetEntity: '深圳极速数码兑付服务中心',
    creditCodeOrSource: '统一社会信用代码: 91440300MA5XXXX89X',
    cardOrderCount: 1420,
    gmvUSD: 185000.00,
    deductFeeAmount: -7400.00,
    deductDetailText: '费率4% (退单抵扣$0)',
    payableAmount: 177600.00,
    actualPayoutAmount: 177600.00,
    actualPayoutNote: '实结: $177,600.00',
    channel: 'CMB_DIRECT',
    channelName: '招行企业直连',
    channelIcon: 'corporate_fare',
    status: 'SETTLED',
    statusLabel: '● 已结案',
    inspectorData: {
      overview: {
        reconPassRate: '100.00%',
        reconNote: '1,420 笔卡密全量完成三方存证，未现任何重复核销争端',
        bankHostStatus: 'CMB-HOST-TO-HOST: 交易成功',
        bankSerialNo: '流水号: CMB20260916-891273910248',
        targetAccount: '打款落地账户: 招商银行深圳分行南山支行 7559 **** **** 8819',
        taxInvoiceStatus: '专票已校验匹配并完成认证',
        invoiceCode: '044032100111 | 金额: ¥1,243,200.00',
        taxNote: '抵扣链条完整，可随时备查',
        netReceivableUSD: 177600.00,
        platformRetainFeeUSD: 7400.00,
        disputeDeductionUSD: 0.00
      },
      transactions: [
        {
          orderId: 'KD-20260915-99812',
          cardType: 'Apple Gift Card (US $100)',
          faceValue: 100.0,
          rate: '96.0%',
          settleAmount: 96.0,
          finishTime: '2026-09-15 22:18:04',
          status: '核销完成 (VERIFIED)'
        },
        {
          orderId: 'KD-20260915-99784',
          cardType: 'Steam Wallet Card (US $50)',
          faceValue: 50.0,
          rate: '94.5%',
          settleAmount: 47.25,
          finishTime: '2026-09-15 21:40:19',
          status: '核销完成 (VERIFIED)'
        },
        {
          orderId: 'KD-20260915-99512',
          cardType: 'Razer Gold Global ($200)',
          faceValue: 200.0,
          rate: '97.0%',
          settleAmount: 194.0,
          finishTime: '2026-09-15 19:12:00',
          status: '核销完成 (VERIFIED)'
        },
        {
          orderId: 'KD-20260915-99103',
          cardType: 'Amazon eCode (US $500)',
          faceValue: 500.0,
          rate: '96.5%',
          settleAmount: 482.5,
          finishTime: '2026-09-15 16:05:32',
          status: '核销完成 (VERIFIED)'
        }
      ],
      feeDeductions: [
        {
          itemCode: 'FEE-BASE-4PCT',
          itemName: '平台基础清算技术服务费',
          calcBase: '$185,000.00 GMV',
          ratePercent: '4.00%',
          amountUSD: 7400.0,
          direction: 'SUB',
          remark: '商户基础协议合同约定的结算扣费'
        },
        {
          itemCode: 'FEE-DISPUTE-SUB',
          itemName: '争议仲裁判责追偿款',
          calcBase: '0 笔有效退单',
          ratePercent: '0.00%',
          amountUSD: 0.0,
          direction: 'SUB',
          remark: '本结算周期内无商户判责追偿扣减'
        }
      ],
      disputes: [],
      payoutVoucher: {
        voucherNo: 'VOUCH-CMB-20260916-0192',
        paymentMethod: '招商银行银企直联 Host-to-Host',
        payoutTime: '2026-09-16 09:30:15',
        bankReceiptUrl: 'https://ais-receipt.internal/cmb/receipt-0192.pdf',
        invoiceNumber: '044032100111',
        invoiceTaxAmount: 74592.00,
        verificationSeal: 'CMB-SEAL-DIGITAL-PASS-20260916'
      },
      auditLogs: [
        {
          stepId: 'LOG-01',
          actionName: '周期账单自动汇总生成',
          operator: 'SYSTEM-CRON-SETTLE',
          timestamp: '2026-09-16 02:00:00',
          node: 'CORE-SETTLE-BATCH',
          notes: '拉取 2026-09-01 至 2026-09-15 闭环卡密流水 1,420 笔',
          verifyStatus: 'PASS'
        },
        {
          stepId: 'LOG-02',
          actionName: '财务主管初审通过',
          operator: 'AUDIT-MGR-08',
          timestamp: '2026-09-16 08:15:22',
          node: 'FIN-AUDIT-DESK',
          notes: '核查四账互勾稽 100% 平账无单边挂账，放行出款审批',
          verifyStatus: 'PASS'
        },
        {
          stepId: 'LOG-03',
          actionName: '银企直联全额打款',
          operator: 'CFO-01 (双人复核秘钥)',
          timestamp: '2026-09-16 09:30:15',
          node: 'CMB-H2H-GATEWAY',
          notes: '直联报文流水号 CMB20260916-891273910248，落地成功',
          verifyStatus: 'PASS'
        }
      ]
    }
  },

  // Row 2: Affiliate Commission Normal - SET202609-P0088 (GlobalCard-Alpha Syndicate)
  {
    id: 'set-02',
    settlementNo: 'SET202609-P0088',
    period: '2026-09-01 ~ 2026-09-15 (推广月期)',
    periodType: 'HALF_MONTH',
    entityType: 'AFFILIATE',
    entityTypeLabel: '推广员直属分佣',
    targetEntity: 'GlobalCard-Alpha Syndicate (Alex Lee)',
    creditCodeOrSource: '提成单源: 增长运营-提成核算单 #GRW-20260915-09',
    cardOrderCount: 3890,
    gmvUSD: 412000.00,
    deductFeeAmount: 0.00,
    deductDetailText: '净提成免税款',
    payableAmount: 16480.00,
    actualPayoutAmount: 16480.00,
    actualPayoutNote: '实结: $16,480.00',
    channel: 'USDT_CONTRACT',
    channelName: 'USDT 智能合约',
    channelIcon: 'toll',
    status: 'PENDING_PAYOUT',
    statusLabel: '待打款出账',
    inspectorData: {
      overview: {
        reconPassRate: '100.00%',
        reconNote: '增长运营端推送 3,890 笔有效拉新返佣凭据，全量完成 KYC 认证比对',
        bankHostStatus: 'USDT-CONTRACT-READY: 智能合约签名就绪',
        bankSerialNo: '待广播 Hash: 0x9f88c...d019e (TRC20)',
        targetAccount: '打款钱包地址: TWhJq8X5n2...pQ88Z1 (合规准入机构钱包)',
        taxInvoiceStatus: '境外离岸佣金代扣代缴凭单就绪',
        invoiceCode: 'W-8BEN-E-202609-ALEX',
        taxNote: 'PRD 6.1 增长端提成单源验签无误，可安全出账',
        netReceivableUSD: 16480.00,
        platformRetainFeeUSD: 0.00,
        disputeDeductionUSD: 0.00
      },
      transactions: [
        {
          orderId: 'AFF-COMM-20260915-001',
          cardType: 'Tier-1 代理商直属分销提成',
          faceValue: 12000.0,
          rate: '4.0%',
          settleAmount: 480.0,
          finishTime: '2026-09-15 23:10:00',
          status: '运营核验通过'
        },
        {
          orderId: 'AFF-COMM-20260915-002',
          cardType: 'Tier-2 节点交易流水分润',
          faceValue: 400000.0,
          rate: '4.0%',
          settleAmount: 16000.0,
          finishTime: '2026-09-15 23:15:00',
          status: '运营核验通过'
        }
      ],
      feeDeductions: [
        {
          itemCode: 'FEE-TRON-GAS',
          itemName: 'TRON 链上 Gas 能量代付补贴',
          calcBase: 'TRC20 Contract Call',
          ratePercent: '0.00%',
          amountUSD: 0.0,
          direction: 'ADD',
          remark: '平台全额补贴智能合约转账手续费'
        }
      ],
      disputes: [],
      payoutVoucher: {
        voucherNo: 'VOUCH-USDT-20260915-P0088',
        paymentMethod: 'USDT (TRC20) 智能合约企业代付',
        payoutTime: '待确认触发',
        txHash: 'PENDING-BROADCAST',
        invoiceNumber: 'TAX-AFF-20260915-88',
        invoiceTaxAmount: 0.0,
        verificationSeal: 'GROWTH-OPS-CERTIFIED-SIG'
      },
      auditLogs: [
        {
          stepId: 'LOG-P01',
          actionName: '增长运营端提成单同步接入',
          operator: 'GROWTH-OPS-ENGINE',
          timestamp: '2026-09-16 01:10:00',
          node: 'AFFILIATE-SYNC-BUS',
          notes: '依据 PRD 6.1 协议规范接收提成单 #GRW-20260915-09',
          verifyStatus: 'PASS'
        },
        {
          stepId: 'LOG-P02',
          actionName: '财务清算风控黑名单比对',
          operator: 'RISK-AUTO-SENTINEL',
          timestamp: '2026-09-16 04:20:00',
          node: 'AML-COMPLIANCE-GATE',
          notes: '受益人 Alex Lee 及收款钱包完成反洗钱穿透筛选，无涉黑标记',
          verifyStatus: 'PASS'
        }
      ]
    }
  },

  // Row 3: Nigeria Channel Suspended Risk - SET202609-M0204 (Lagos Fintech Node Solutions)
  {
    id: 'set-03',
    settlementNo: 'SET202609-M0204',
    period: '2026-09-01 ~ 2026-09-15 [汇差差异待调]',
    periodType: 'HALF_MONTH',
    entityType: 'CHANNEL',
    entityTypeLabel: '渠道合作商户',
    targetEntity: 'Lagos Fintech Node Solutions',
    creditCodeOrSource: 'NG-BIZ-ID: 2901-LAG-9812 | 挂起原因: 汇差对账赤字 $1,280',
    cardOrderCount: 512,
    gmvUSD: 62800.00,
    deductFeeAmount: -3450.00,
    deductDetailText: '扣除退款判责 $940',
    payableAmount: 59350.00,
    actualPayoutAmount: 59350.00,
    actualPayoutNote: '暂缓实付',
    channel: 'OPAY_DIRECT',
    channelName: 'OPay Local Bank',
    channelIcon: 'account_balance',
    status: 'SUSPENDED_RISK',
    statusLabel: '● 差异挂起',
    riskLevel: 'RISK-L2',
    suspendReason: '汇差对账赤字 $1,280 且含 2 笔退单判责扣减未确认',
    inspectorData: {
      overview: {
        reconPassRate: '97.20%',
        reconNote: '发现 2 笔争议卡单被风控拦截，同时尼日利亚奈拉汇差波动造成 $1,280.00 账面赤字',
        bankHostStatus: 'OPAY-HOST-SUSPENDED: 财务风险暂缓出款',
        bankSerialNo: '挂单单号: SUSP-REC-20260916-09',
        targetAccount: '打款银行: First Bank of Nigeria (Acct: 3091****88)',
        taxInvoiceStatus: '等待渠道商提供西非增值税免税单',
        invoiceCode: 'NG-VAT-PENDING',
        taxNote: '触发风控红线：差异解决前严禁划拨外汇资金',
        netReceivableUSD: 59350.00,
        platformRetainFeeUSD: 2510.00,
        disputeDeductionUSD: 940.00
      },
      transactions: [
        {
          orderId: 'KD-20260914-NG-012',
          cardType: 'Steam Global Card (US $100)',
          faceValue: 100.0,
          rate: '90.0%',
          settleAmount: 90.0,
          finishTime: '2026-09-14 18:22:10',
          status: '争议拦截中 (DISPUTE_HELD)'
        },
        {
          orderId: 'KD-20260913-NG-099',
          cardType: 'Vanilla Visa (US $500)',
          faceValue: 500.0,
          rate: '88.0%',
          settleAmount: 440.0,
          finishTime: '2026-09-13 14:15:30',
          status: '黑卡预警扣减 (FRAUD_FLAG)'
        }
      ],
      feeDeductions: [
        {
          itemCode: 'FEE-OPAY-NGN-LOSS',
          itemName: '汇率异常波动敞口调差',
          calcBase: 'USD/NGN Spread Slip',
          ratePercent: '2.04%',
          amountUSD: 1280.0,
          direction: 'SUB',
          remark: '银行外汇清算滑点超过阈值 1.5%，需经调差平账'
        },
        {
          itemCode: 'FEE-CHARGEBACK-SUB',
          itemName: '仲裁判责商户应偿退单金',
          calcBase: 'Case #ARB-20260914-02',
          ratePercent: 'Fixed',
          amountUSD: 940.0,
          direction: 'SUB',
          remark: '针对欺诈黑卡申诉失败的判定扣罚'
        }
      ],
      disputes: [
        {
          disputeId: 'DISP-20260914-NG-01',
          cardNo: 'VANILLA-4012-****-9812',
          disputeReason: '发卡行 Chargeback 拒付，持卡人否认交易',
          verdict: '支持持卡人，判定渠道商全额退赔',
          deductAmountUSD: 500.0,
          responsibleParty: '渠道商户 (Lagos Fintech)',
          arbitrateTime: '2026-09-14 20:00:00'
        },
        {
          disputeId: 'DISP-20260914-NG-02',
          cardNo: 'STEAM-NG-****-4412',
          disputeReason: '卡密在被提交前 1 小时已被第三方兑换',
          verdict: '判定二手翻新卡，扣减结算',
          deductAmountUSD: 440.0,
          responsibleParty: '渠道商户 (Lagos Fintech)',
          arbitrateTime: '2026-09-14 22:30:00'
        }
      ],
      payoutVoucher: {
        voucherNo: 'VOUCH-NG-HELD-20260915',
        paymentMethod: 'OPay Direct B2B Payout',
        payoutTime: '已挂起暂缓',
        invoiceNumber: 'NG-TAX-PENDING',
        invoiceTaxAmount: 0.0,
        verificationSeal: 'RISK-L2-INTERCEPT-SEAL'
      },
      auditLogs: [
        {
          stepId: 'LOG-NG01',
          actionName: '汇差熔断警报触发',
          operator: 'FX-AUTO-MONITOR',
          timestamp: '2026-09-15 11:30:00',
          node: 'RISK-CONTROLLER',
          notes: '监测到 NGN 兑付结算赤字 $1,280，系统自动锁定结算单并置为挂起状态',
          verifyStatus: 'WARN'
        },
        {
          stepId: 'LOG-NG02',
          actionName: '财务挂单待调账',
          operator: 'AUDIT-MGR-08',
          timestamp: '2026-09-15 14:10:00',
          node: 'FIN-AUDIT-DESK',
          notes: '已指派专员发起多方会商并通知商户补充举证',
          verifyStatus: 'PENDING'
        }
      ]
    }
  },

  // Row 4: Merchant Pending Approval - SET202609-M0211 (杭州数卡汇通网络技术有限公司)
  {
    id: 'set-04',
    settlementNo: 'SET202609-M0211',
    period: '2026-09-01 ~ 2026-09-15 (半月结)',
    periodType: 'HALF_MONTH',
    entityType: 'MERCHANT',
    entityTypeLabel: '商户接单承揽',
    targetEntity: '杭州数卡汇通网络技术有限公司',
    creditCodeOrSource: '统一社会信用代码: 91330106MA2BXXXX31',
    cardOrderCount: 2110,
    gmvUSD: 294000.00,
    deductFeeAmount: -11760.00,
    deductDetailText: '费率4% (质押扣减$0)',
    payableAmount: 282240.00,
    actualPayoutAmount: 282240.00,
    actualPayoutNote: '应付待核',
    channel: 'CMB_DIRECT',
    channelName: '招行企业直连',
    channelIcon: 'corporate_fare',
    status: 'PENDING_APPROVAL',
    statusLabel: '待确认审批',
    inspectorData: {
      overview: {
        reconPassRate: '100.00%',
        reconNote: '2,110 笔订单全生命周期状态一致，符合 T+15 日常结算审批标准',
        bankHostStatus: 'CMB-HOST-READY: 等待出账审批指令',
        bankSerialNo: '批次凭单: CMB-BATCH-20260916-04',
        targetAccount: '招商银行杭州分行西湖支行 5719 **** **** 3301',
        taxInvoiceStatus: '商户已上传电子完税发票待财务核验',
        invoiceCode: '330022100412 | 金额: ¥1,975,680.00',
        taxNote: '发票真伪经国税平台查验无误',
        netReceivableUSD: 282240.00,
        platformRetainFeeUSD: 11760.00,
        disputeDeductionUSD: 0.00
      },
      transactions: [
        {
          orderId: 'KD-20260915-HZ-001',
          cardType: 'Google Play Gift Card ($100)',
          faceValue: 100.0,
          rate: '96.0%',
          settleAmount: 96.0,
          finishTime: '2026-09-15 18:40:11',
          status: '核销完成 (VERIFIED)'
        },
        {
          orderId: 'KD-20260915-HZ-002',
          cardType: 'Nike US eGift ($200)',
          faceValue: 200.0,
          rate: '95.0%',
          settleAmount: 190.0,
          finishTime: '2026-09-15 19:00:25',
          status: '核销完成 (VERIFIED)'
        }
      ],
      feeDeductions: [
        {
          itemCode: 'FEE-BASE-4PCT',
          itemName: '平台基础技术服务费',
          calcBase: '$294,000.00 GMV',
          ratePercent: '4.00%',
          amountUSD: 11760.0,
          direction: 'SUB',
          remark: '商户标准签约扣点'
        }
      ],
      disputes: [],
      payoutVoucher: {
        voucherNo: 'VOUCH-PENDING-HZ-0211',
        paymentMethod: '招商银行银企直联 Host-to-Host',
        payoutTime: '审批完成后自动触发',
        invoiceNumber: '330022100412',
        invoiceTaxAmount: 118540.80,
        verificationSeal: 'WAITING-CFO-APPROVAL'
      },
      auditLogs: [
        {
          stepId: 'LOG-HZ01',
          actionName: '半月度账单快照结转',
          operator: 'SETTLE-SCHEDULER',
          timestamp: '2026-09-16 02:30:00',
          node: 'CORE-LEDGER-SNAPSHOT',
          notes: '锁定杭州数卡汇通前半月账单数据，计费引擎核算完成',
          verifyStatus: 'PASS'
        },
        {
          stepId: 'LOG-HZ02',
          actionName: '待财务主管审核签字',
          operator: 'AUDIT-MGR-08',
          timestamp: '2026-09-16 08:30:00',
          node: 'FIN-APPROVE-FLOW',
          notes: '已进入待审批队列',
          verifyStatus: 'PENDING'
        }
      ]
    }
  }
];
