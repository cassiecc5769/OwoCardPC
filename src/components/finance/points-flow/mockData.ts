import { LedgerTransaction, LedgerSummaryMetrics } from './types';

export const MOCK_LEDGER_METRICS: LedgerSummaryMetrics = {
  todayInflow: 8450200,
  inflowGrowth: '+12.4%',
  inflowTxCount: 9284,
  inflowBreakdown: '包含商户充值 +4.2M / 流单退款 +3.1M / 争议赔偿 +1.15M',
  todayOutflow: 7120400,
  outflowStatus: '正常峰值',
  outflowTxCount: 7716,
  outflowBreakdown: '卡单核销做卡 -6.4M / 售后追索冲正 -720.4K',
  netChange: 1329800,
  deltaRatio: '+18.67%',
  activeEscrowPoints: 15770400,
  activeEscrowOrders: 1420
};

export const MOCK_LEDGER_TRANSACTIONS: LedgerTransaction[] = [
  {
    id: 'tx-01',
    txid: 'PTS20260918-8809',
    time: '16:41:52.921',
    fullTime: '2026-09-18 16:41:52.921',
    ms: '921',
    type: 'CARD_DEDUCT',
    typeName: '交易扣减',
    bizId: 'KD20260827-9912',
    bizType: '卡单兑付核销 (Gift Card Settle)',
    merchantName: '上海鼎盛数字科技有限公司',
    merchantShort: '鼎盛数字科技',
    merchantMid: 'MID-8012',
    pointsChange: -50000,
    availableBefore: 1240000,
    availableAfter: 1190000,
    frozenBefore: 50000,
    frozenAfter: 0,
    source: '官方API核销',
    note: 'App Store 500面值礼品卡批量兑付出账',
    cardDetails: 'Apple App Store 电子卡 · ¥500.00 × 100 张',
    settlementRate: '100.0% (1元 = 1 PTS)',
    debitSubject: '2001.01 [商户在途冻结负债户]',
    creditSubject: '1002.04 [平台做卡应兑付成本户]',
    auditOperator: 'AUDIT-MGR-08 (系统直通清算)',
    apiNode: 'NODE-APPLE-V3-PROD-SH',
    apiTx: 'APL-RT-20260918-91028374',
    apiLatency: '142 ms (实时直联)',
    blockHash: '0x892ac01f92e84...77bb',
    rawJson: {
      version: '2.0.4-ACID',
      event: 'CARD_REDEEM_EXECUTE',
      txid: 'PTS20260918-8809',
      timestamp: '2026-09-18T16:41:52.921Z',
      biz_order: {
        order_id: 'KD20260827-9912',
        card_brand: 'Apple App Store',
        denomination: 500,
        currency: 'CNY',
        quantity: 100,
        settle_rate: 1.0,
        face_value_total: 50000.0
      },
      merchant: {
        mid: 'MID-8012',
        name: '上海鼎盛数字科技有限公司',
        tier: 'VIP-05'
      },
      accounting_entry: {
        dr: { account: '2001.01', name: '商户在途冻结负债户', amount: 50000.0 },
        cr: { account: '1002.04', name: '平台做卡应兑付成本户', amount: 50000.0 },
        delta_points: -50000.0,
        balance_snapshot: {
          available_before: 1240000.0,
          available_after: 1190000.0,
          frozen_before: 50000.0,
          frozen_after: 0.0
        }
      },
      upstream_receipt: {
        gateway: 'APPLE-REDEEM-API-v3',
        remote_tx: 'APL-RT-20260918-91028374',
        http_status: 200,
        latency_ms: 142,
        auth_code: 'AUTH-OK-99214'
      },
      security: {
        merkle_root: '0x892ac01f92e8477bb32018ea1928374a',
        rsa_signature: 'MIICXAIBAAKCAQEA10a8b9f71c42f...912a==',
        signer: 'NODE-APPLE-V3-PROD-SH'
      }
    }
  },
  {
    id: 'tx-02',
    txid: 'PTS20260918-8810',
    time: '16:38:12.104',
    fullTime: '2026-09-18 16:38:12.104',
    ms: '104',
    type: 'RECHARGE',
    typeName: '充值入账',
    bizId: 'TOP-0018',
    bizType: '商户现汇充值入池 (Cash Inflow)',
    merchantName: '深圳市迅捷卡券运营有限公司',
    merchantShort: '迅捷卡券运营',
    merchantMid: 'MID-7731',
    pointsChange: 2000000,
    availableBefore: 4850000,
    availableAfter: 6850000,
    frozenBefore: 120000,
    frozenAfter: 120000,
    source: '系统撮合引擎',
    note: '大额现汇加款入池，由招商银行直联接口自动入账',
    cardDetails: '大额现汇充值款 · 招商银行专线网银',
    settlementRate: '1.0 USD = 7.20 PTS (等值汇率)',
    debitSubject: '1001.01 [银行存款结算待清账户]',
    creditSubject: '2001.02 [商户可用积点权益户]',
    auditOperator: 'SYSTEM-CMB-HOOK (招行直联自动清算)',
    apiNode: 'NODE-BANK-CMB-PROD-SZ',
    apiTx: 'CMB-NET-994012948210',
    apiLatency: '88 ms (银行网关)',
    blockHash: '0x51fd8a22bc901...44fe',
    rawJson: {
      version: '2.0.4-ACID',
      event: 'MERCHANT_RECHARGE_CONFIRM',
      txid: 'PTS20260918-8810',
      timestamp: '2026-09-18T16:38:12.104Z',
      biz_order: {
        order_id: 'TOP-0018',
        channel: '招商银行离岸网银专线',
        currency: 'USD',
        amount: 277777.78,
        exchange_rate: 7.20,
        credited_pts: 2000000.0
      },
      merchant: {
        mid: 'MID-7731',
        name: '深圳市迅捷卡券运营有限公司',
        tier: 'VIP-04'
      },
      accounting_entry: {
        dr: { account: '1001.01', name: '银行存款结算待清账户', amount: 2000000.0 },
        cr: { account: '2001.02', name: '商户可用积点权益户', amount: 2000000.0 },
        delta_points: 2000000.0,
        balance_snapshot: {
          available_before: 4850000.0,
          available_after: 6850000.0,
          frozen_before: 120000.0,
          frozen_after: 120000.0
        }
      },
      upstream_receipt: {
        gateway: 'CMB-DIRECT-CONNECT',
        remote_tx: 'CMB-NET-994012948210',
        http_status: 200,
        latency_ms: 88,
        auth_code: 'BANK-CREDIT-ACK-001'
      },
      security: {
        merkle_root: '0x51fd8a22bc90144fecb001928019488a',
        rsa_signature: 'MIICXAIBAAKCAQEA88bc11f99a...8831==',
        signer: 'NODE-BANK-CMB-PROD-SZ'
      }
    }
  },
  {
    id: 'tx-03',
    txid: 'PTS20260918-8811',
    time: '16:35:40.550',
    fullTime: '2026-09-18 16:35:40.550',
    ms: '550',
    type: 'CARD_LOCK',
    typeName: '交易冻结',
    bizId: 'KD20260827-9915',
    bizType: '卡单撮合预占锁定 (Order Escrow)',
    merchantName: '北京万联互娱网络技术部',
    merchantShort: '万联互娱技术',
    merchantMid: 'MID-6302',
    pointsChange: -12000,
    isEscrow: true,
    availableBefore: 612000,
    availableAfter: 600000,
    frozenBefore: 0,
    frozenAfter: 12000,
    source: '系统撮合引擎',
    note: '京东E卡 1000面值*12张 履约锁定中',
    cardDetails: '京东E卡 · ¥1,000.00 × 12 张',
    settlementRate: '100.0% (1元 = 1 PTS)',
    debitSubject: '2001.02 [商户可用积点权益户]',
    creditSubject: '2001.01 [商户在途冻结负债户]',
    auditOperator: 'ENGINE-AUTO-DISPATCH (智能接卡分流)',
    apiNode: 'NODE-JD-API-ENGINE-BJ',
    apiTx: 'JD-ESCROW-20260918-4421',
    apiLatency: '45 ms (内存预占)',
    blockHash: '0xcc04f231aa002...99ee',
    rawJson: {
      version: '2.0.4-ACID',
      event: 'ORDER_ESCROW_LOCK',
      txid: 'PTS20260918-8811',
      timestamp: '2026-09-18T16:35:40.550Z',
      biz_order: {
        order_id: 'KD20260827-9915',
        card_brand: '京东E卡 (JD-CARD)',
        denomination: 1000,
        currency: 'CNY',
        quantity: 12,
        lock_pts: 12000.0
      },
      merchant: {
        mid: 'MID-6302',
        name: '北京万联互娱网络技术部',
        tier: 'VIP-03'
      },
      accounting_entry: {
        dr: { account: '2001.02', name: '商户可用积点权益户', amount: 12000.0 },
        cr: { account: '2001.01', name: '商户在途冻结负债户', amount: 12000.0 },
        delta_points: -12000.0,
        balance_snapshot: {
          available_before: 612000.0,
          available_after: 600000.0,
          frozen_before: 0.0,
          frozen_after: 12000.0
        }
      },
      upstream_receipt: {
        gateway: 'JD-ESCROW-MANAGER',
        remote_tx: 'JD-ESCROW-20260918-4421',
        http_status: 200,
        latency_ms: 45,
        auth_code: 'LOCK-ACK-PASS'
      },
      security: {
        merkle_root: '0xcc04f231aa00299ee01928019488a771',
        rsa_signature: 'MIICXAIBAAKCAQEA33ac99f...7721==',
        signer: 'NODE-JD-API-ENGINE-BJ'
      }
    }
  },
  {
    id: 'tx-04',
    txid: 'PTS20260918-8812',
    time: '16:31:09.680',
    fullTime: '2026-09-18 16:31:09.680',
    ms: '680',
    type: 'UNFREEZE_RETURN',
    typeName: '售后解冻返还',
    bizId: 'ARB-0941',
    bizType: '售后争议裁定解冻返还 (Arbitration Refund)',
    merchantName: '杭州创享权益服务中心',
    merchantShort: '创享权益中心',
    merchantMid: 'MID-9118',
    pointsChange: 8500,
    availableBefore: 284000,
    availableAfter: 292500,
    frozenBefore: 8500,
    frozenAfter: 0,
    source: '财务人工审批',
    note: '上游卡密验证不可用，触发工单仲裁驳回，冻结积点全额解冻原路返还商户可用账户',
    cardDetails: '沃尔玛超市卡 · 卡密异常驳回退回',
    settlementRate: '100.0% (1元 = 1 PTS)',
    debitSubject: '2001.01 [商户在途冻结负债户]',
    creditSubject: '2001.02 [商户可用积点权益户]',
    auditOperator: 'AUDIT-LEAD-03 (客服主管与仲裁庭裁定)',
    apiNode: 'INTERNAL-ARBITRATION-FLOW',
    apiTx: 'ARB-REV-9018442018',
    apiLatency: '112 ms (内部冲正审批)',
    blockHash: '0x11be993d55ab1...7710',
    rawJson: {
      version: '2.0.4-ACID',
      event: 'ESCROW_UNFREEZE_REFUND',
      txid: 'PTS20260918-8812',
      timestamp: '2026-09-18T16:31:09.680Z',
      biz_order: {
        order_id: 'ARB-0941',
        reason: '上游卡密无效，经查验属卖方空卡',
        refund_pts: 8500.0,
        adjudicator: 'DISPUTE-JURY-PANEL-02'
      },
      merchant: {
        mid: 'MID-9118',
        name: '杭州创享权益服务中心',
        tier: 'VIP-02'
      },
      accounting_entry: {
        dr: { account: '2001.01', name: '商户在途冻结负债户', amount: 8500.0 },
        cr: { account: '2001.02', name: '商户可用积点权益户', amount: 8500.0 },
        delta_points: 8500.0,
        balance_snapshot: {
          available_before: 284000.0,
          available_after: 292500.0,
          frozen_before: 8500.0,
          frozen_after: 0.0
        }
      },
      upstream_receipt: {
        gateway: 'ARBITRATION-LEDGER-LINK',
        remote_tx: 'ARB-REV-9018442018',
        http_status: 200,
        latency_ms: 112,
        auth_code: 'REFUND-RELEASE-OK'
      },
      security: {
        merkle_root: '0x11be993d55ab1771092837482910488a',
        rsa_signature: 'MIICXAIBAAKCAQEA11ff...2981==',
        signer: 'INTERNAL-ARBITRATION-FLOW'
      }
    }
  },
  {
    id: 'tx-05',
    txid: 'PTS20260918-8813',
    time: '16:20:15.002',
    fullTime: '2026-09-18 16:20:15.002',
    ms: '002',
    type: 'MANUAL_CREDIT',
    typeName: '人工调增',
    bizId: 'FIN-ADJ-442',
    bizType: '财务复核手工冲正调整入账 (Manual Adjustment)',
    merchantName: '广州易销通商贸工作室',
    merchantShort: '易销通商贸',
    merchantMid: 'MID-4029',
    pointsChange: 5000,
    availableBefore: 45000,
    availableAfter: 50000,
    frozenBefore: 0,
    frozenAfter: 0,
    source: '财务人工审批',
    note: '手工冲正对账补记，双签授权单 AUDIT-MGR-08 与 CFO-01',
    cardDetails: '跨期汇率差额补记 · 官方复核单据',
    settlementRate: '双签特批调账',
    debitSubject: '5002.01 [营业外支出与补差调增户]',
    creditSubject: '2001.02 [商户可用积点权益户]',
    auditOperator: 'AUDIT-MGR-08 & CFO-01 (双人密钥会签)',
    apiNode: 'FINANCE-AUDIT-CONSOLE-MGR',
    apiTx: 'FIN-TX-20260918-77182',
    apiLatency: '310 ms (双因子审批流)',
    blockHash: '0xaa714401bb220...881c',
    rawJson: {
      version: '2.0.4-ACID',
      event: 'MANUAL_CREDIT_ENTRY',
      txid: 'PTS20260918-8813',
      timestamp: '2026-09-18T16:20:15.002Z',
      biz_order: {
        order_id: 'FIN-ADJ-442',
        reason: '跨期网银电汇漏记手工冲正，附银行盖章水单',
        credit_pts: 5000.0,
        signers: ['AUDIT-MGR-08', 'CFO-01']
      },
      merchant: {
        mid: 'MID-4029',
        name: '广州易销通商贸工作室',
        tier: 'VIP-01'
      },
      accounting_entry: {
        dr: { account: '5002.01', name: '营业外支出与补差调增户', amount: 5000.0 },
        cr: { account: '2001.02', name: '商户可用积点权益户', amount: 5000.0 },
        delta_points: 5000.0,
        balance_snapshot: {
          available_before: 45000.0,
          available_after: 50000.0,
          frozen_before: 0.0,
          frozen_after: 0.0
        }
      },
      upstream_receipt: {
        gateway: 'FINANCE-CORE-DOUBLE-KEY',
        remote_tx: 'FIN-TX-20260918-77182',
        http_status: 200,
        latency_ms: 310,
        auth_code: 'DOUBLE-SIGN-APPROVED'
      },
      security: {
        merkle_root: '0xaa714401bb220881cbba1928019488a9',
        rsa_signature: 'MIICXAIBAAKCAQEA55dd...4419==',
        signer: 'FINANCE-AUDIT-CONSOLE-MGR'
      }
    }
  },
  {
    id: 'tx-06',
    txid: 'PTS20260918-8814',
    time: '16:11:44.382',
    fullTime: '2026-09-18 16:11:44.382',
    ms: '382',
    type: 'DISPUTE_PENALTY',
    typeName: '争议赔付扣减',
    bizId: 'ARB-0994',
    bizType: '违约追偿扣除与买家赔付 (Dispute Clawback)',
    merchantName: '武汉光谷数码在线卡行',
    merchantShort: '光谷数码在线',
    merchantMid: 'MID-3301',
    pointsChange: -15000,
    availableBefore: 98000,
    availableAfter: 83000,
    frozenBefore: 0,
    frozenAfter: 0,
    source: '系统撮合引擎',
    note: '二次充值恶意销卡违约，平台风控自动执行保证金直接划扣赔付受损买家',
    cardDetails: 'Steam充值卡 · 恶意回收追偿',
    settlementRate: '平台风控仲裁条例第4.3条',
    debitSubject: '2001.02 [商户可用积点权益户]',
    creditSubject: '2003.01 [平台对买家代偿备付金专户]',
    auditOperator: 'RISK-DEFENSE-CRON (风控拦截与代偿清算)',
    apiNode: 'NODE-RISK-ENGINE-WUHAN',
    apiTx: 'RSK-CLAW-20260918-1109',
    apiLatency: '62 ms (熔断强扣)',
    blockHash: '0xfe901109cc882...3310',
    rawJson: {
      version: '2.0.4-ACID',
      event: 'DISPUTE_CLAWBACK_EXEC',
      txid: 'PTS20260918-8814',
      timestamp: '2026-09-18T16:11:44.382Z',
      biz_order: {
        order_id: 'ARB-0994',
        violation: '二手转卖二次充值导致买方卡密失效',
        clawback_pts: 15000.0,
        compensation_target: 'USR-8991204 (受损买方)'
      },
      merchant: {
        mid: 'MID-3301',
        name: '武汉光谷数码在线卡行',
        tier: 'VIP-02 (已列入风控警示)'
      },
      accounting_entry: {
        dr: { account: '2001.02', name: '商户可用积点权益户', amount: 15000.0 },
        cr: { account: '2003.01', name: '平台对买家代偿备付金专户', amount: 15000.0 },
        delta_points: -15000.0,
        balance_snapshot: {
          available_before: 98000.0,
          available_after: 83000.0,
          frozen_before: 0.0,
          frozen_after: 0.0
        }
      },
      upstream_receipt: {
        gateway: 'RISK-AUTO-PENALTY-LINK',
        remote_tx: 'RSK-CLAW-20260918-1109',
        http_status: 200,
        latency_ms: 62,
        auth_code: 'CLAWBACK-ENFORCED'
      },
      security: {
        merkle_root: '0xfe901109cc882331001928019488a002',
        rsa_signature: 'MIICXAIBAAKCAQEA77ee...9912==',
        signer: 'NODE-RISK-ENGINE-WUHAN'
      }
    }
  },
  {
    id: 'tx-07',
    txid: 'PTS20260918-8815',
    time: '16:04:22.119',
    fullTime: '2026-09-18 16:04:22.119',
    ms: '119',
    type: 'RECHARGE',
    typeName: '充值入账',
    bizId: 'TOP-0019',
    bizType: '商户现汇充值入池 (Cash Inflow)',
    merchantName: '上海鼎盛数字科技有限公司',
    merchantShort: '鼎盛数字科技',
    merchantMid: 'MID-8012',
    pointsChange: 500000,
    availableBefore: 1190000,
    availableAfter: 1690000,
    frozenBefore: 0,
    frozenAfter: 0,
    source: '系统撮合引擎',
    note: 'USDT-TRC20 链上充值确认，自动兑换入账',
    cardDetails: 'USDT-TRC20 · 69,444.44 USDT',
    settlementRate: '1.0 USD = 7.20 PTS',
    debitSubject: '1001.03 [数字资产归集钱包结算户]',
    creditSubject: '2001.02 [商户可用积点权益户]',
    auditOperator: 'TRON-CHAIN-NODE-LISTENER',
    apiNode: 'NODE-TRON-MAINNET-04',
    apiTx: 'TXID-TRX-20260918-09184021',
    apiLatency: '1,200 ms (20 Block Confirmations)',
    blockHash: '0x3344bb19fa001...88ab',
    rawJson: {
      version: '2.0.4-ACID',
      event: 'CRYPTO_RECHARGE_CONFIRM',
      txid: 'PTS20260918-8815',
      timestamp: '2026-09-18T16:04:22.119Z',
      biz_order: {
        order_id: 'TOP-0019',
        currency: 'USDT',
        network: 'TRC20',
        amount: 69444.44,
        pts: 500000.0
      }
    }
  },
  {
    id: 'tx-08',
    txid: 'PTS20260918-8816',
    time: '15:58:30.405',
    fullTime: '2026-09-18 15:58:30.405',
    ms: '405',
    type: 'CARD_DEDUCT',
    typeName: '交易扣减',
    bizId: 'KD20260827-9918',
    bizType: '卡单兑付核销 (Gift Card Settle)',
    merchantName: '深圳极光数码网络技术有限责任公司',
    merchantShort: '极光数字网络',
    merchantMid: 'MID-5104',
    pointsChange: -28000,
    availableBefore: 340000,
    availableAfter: 312000,
    frozenBefore: 28000,
    frozenAfter: 0,
    source: '官方API核销',
    note: 'Steam 礼品卡 200面值*140张 兑付出账',
    cardDetails: 'Steam Wallet Card · ¥200.00 × 140 张',
    settlementRate: '100.0% (1元 = 1 PTS)',
    debitSubject: '2001.01 [商户在途冻结负债户]',
    creditSubject: '1002.04 [平台做卡应兑付成本户]',
    auditOperator: 'STEAM-GATEWAY-AGENT',
    apiNode: 'NODE-VALVE-STEAM-HK',
    apiTx: 'STM-VAL-20260918-8821940',
    apiLatency: '175 ms (Valve API Direct)',
    blockHash: '0x9910aa22ff112...00cc',
    rawJson: {
      version: '2.0.4-ACID',
      event: 'CARD_REDEEM_EXECUTE',
      txid: 'PTS20260918-8816',
      timestamp: '2026-09-18T15:58:30.405Z',
      biz_order: {
        order_id: 'KD20260827-9918',
        card_brand: 'Steam Wallet Card',
        denomination: 200,
        quantity: 140,
        total_pts: 28000.0
      }
    }
  }
];
