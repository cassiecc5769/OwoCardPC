export interface DisputeCaseItem {
  id: string;
  orderNo: string;
  channel: string;
  createTime: string;
  initiator: '商户发起' | '出卡用户';
  userUid: string;
  userName: string;
  userTier: string;
  userRiskScore: number;
  merchantMid: string;
  merchantName: string;
  merchantCollateral: string;
  cardName: string;
  cardFaceValue: string;
  disputeType: string;
  claimDetail: string;
  claimAmount: string;
  pointsConverted: string;
  status: 'processing' | 'awaiting_evidence' | 'under_review' | 'awaiting_acceptance' | 'awaiting_settlement' | 'closed';
  statusBadgeText: string;
  statusBadgeColor: string;
  initialVerdict: string;
  initialVerdictSub: string;
  handler: string;
  slaRemaining: string;
  slaPercentage: number;
  isUrgent: boolean;
  userEvidence: {
    text: string;
    receiptImg: string;
    receiptDesc: string;
    cardBackImg: string;
    cardBackDesc: string;
    submitTime: string;
    ocrStatus: string;
  };
  merchantEvidence: {
    text: string;
    apiRawJson: string;
    responseTime: string;
    responseAssessment: string;
  };
  officialGroundTruth: {
    gatewayName: string;
    signature: string;
    verified: boolean;
    redeemTimeEst: string;
    ticketTimeEst: string;
    platformOrderTimeEst: string;
    merchantAttemptTimeEst: string;
    forensicFinding: string;
    discrepancySeconds: number;
  };
  arbitrationVerdict?: {
    decision: 'USER_FAULT' | 'MERCHANT_FAULT' | 'PLATFORM_SUBVENTION';
    decisionText: string;
    legalReasonText: string;
    finCommandId: string;
    executedAt?: string;
    isClosed: boolean;
  };
}

export const INITIAL_DISPUTE_CASES: DisputeCaseItem[] = [
  {
    id: 'DIS-20260827-0091',
    orderNo: 'ORD-20260827-89104',
    channel: 'API-POOL-A',
    createTime: '08-27 10:14:22',
    initiator: '商户发起',
    userUid: 'UID_892044',
    userName: 'Adebayo Adeleke',
    userTier: 'Tier-B (92分)',
    userRiskScore: 32,
    merchantMid: 'MID-800412',
    merchantName: '极速易兑网络',
    merchantCollateral: '¥50W',
    cardName: 'Apple Gift Card US',
    cardFaceValue: '$500.00',
    disputeType: '卡密已被兑换',
    claimDetail: '商户主张已被兑 / 用户主张盗刷',
    claimAmount: '$500.00',
    pointsConverted: '3,475 PTS',
    status: 'processing',
    statusBadgeText: '处理中(48h SLA)',
    statusBadgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    initialVerdict: '拟判出卡人全责',
    initialVerdictSub: '已提取苹果官方Redeem日志',
    handler: 'OP-8821',
    slaRemaining: '14h 08m',
    slaPercentage: 72,
    isUrgent: true,
    userEvidence: {
      text: '“实体店现买现出，实体卡刮开后第一时间提单，绝无二次转卖给他人，商户接单后恶意拒付！”',
      receiptImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCV04fY1Z3cmLbjCqPbopbQEp0oKN9WtmozikdSmK0JINJkNCCP_rBYQFEJQW3hWPrVSvwhUcCa7SjLu4Odwcx-7BwWkG8hUgFJbEb2OCp7VrJFObxyAo3VZJhWm-hjmpNzrIiy3YqUlrArknelg9er3YNJmyrbdOhJdcjioAdraVhlYHTqpMtAhlHbb8qj7H0vLL8cYUA65XflJ8P5sjwUzNIBYwZ89teNIv-Rk6v4I78zxnuxnbGlJA',
      receiptDesc: 'BESTBUY POS小票实拍 (出票时间: 15:30:10 EST)',
      cardBackImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBH-epdluelbWNoKLgjP45B-dNKvV7VsH9ryX00t56KEpXo3uSRX3Nt74RQFuprFJuWClk-QJ6RatgHX5t8DTHMSucFfGdSzB_jL0rVLAc0Zxhu31eShtOteorBs2GUQCo56cpXWF97t5BLeh0VY8bN0PxjGUosdPQr-KE-fc3T_D54V6UhFqE5SXU-IBpL17pXpkqp3OaptRvQL_-kj4xTJRwrDIuCfSmkJCj6Sj4PtoQpFcA91uf0sg',
      cardBackDesc: '涂层卡背实拍 (已刮开, PIN: X89Q-****-299L)',
      submitTime: '2026-08-27 15:32:10 EST',
      ocrStatus: 'OCR卡号无误'
    },
    merchantEvidence: {
      text: '“系统分配此单后 35 秒内自动化流水线接入核销，直接返回卡密已被提前兑换，存在二手卡撞库或提前消费。”',
      apiRawJson: JSON.stringify({
        order_id: 'ORD-20260827-89104',
        pin_masked: 'X89Q-****-****-299L',
        attempt_time: '2026-08-27T15:32:45.102-05:00',
        gateway_status: 'REJECTED',
        vendor_raw_code: 'REDEMPTION_CODE_ALREADY_USED',
        error_description: 'This code has already been redeemed to an account.'
      }, null, 2),
      responseTime: '35.1 秒 (优于 180 秒 SLA)',
      responseAssessment: '无压单嫌疑'
    },
    officialGroundTruth: {
      gatewayName: 'Apple Enterprise Partner Gateway',
      signature: '0x8F0429C91B8801A99B',
      verified: true,
      redeemTimeEst: '15:30:05 EST',
      ticketTimeEst: '15:30:10 EST',
      platformOrderTimeEst: '15:32:10 EST',
      merchantAttemptTimeEst: '15:32:45 EST',
      forensicFinding: '根据 Apple Gateway 底座底层数据穿透：目标卡密已于 15:30:05 EST 在 Apple ID (k***n@icloud.com) 完成激活。该时刻早于出卡方宣称的小票出票时间 5 秒，且提单至本平台前 125 秒已处于已兑状态。明确判定出卡方提交已失效废卡，商户无任何违规压单或侵占事实。',
      discrepancySeconds: -5
    },
    arbitrationVerdict: {
      decision: 'USER_FAULT',
      decisionText: '裁定出卡方责任 (驳回申诉)',
      legalReasonText: '经调取 Apple Enterprise 官方底层核销网关对账单，该卡已于 15:30:05 激活兑换，早于提单时间 125 秒。出卡方未能提供在此时间点前的未消费官方证据。根据《平台礼品卡交易合规守则》第 14 条之规定，判定出卡方承担全额损失，解冻核销商户积点，工单予以驳回结案。',
      finCommandId: 'CMD-FIN-20260827-0491',
      isClosed: false
    }
  },
  {
    id: 'DIS-20260827-0088',
    orderNo: 'ORD-20260827-88921',
    channel: 'DISPATCH_V2',
    createTime: '08-27 09:41:10',
    initiator: '出卡用户',
    userUid: 'UID_774120',
    userName: '周立宏',
    userTier: '信用良好',
    userRiskScore: 88,
    merchantMid: 'MID-910221',
    merchantName: '云卡算力汇兑',
    merchantCollateral: '¥20W',
    cardName: 'Steam Wallet Card',
    cardFaceValue: '$100.00',
    disputeType: '面额少充/不符',
    claimDetail: '商户实认 $20.00 / 差额 $80.00',
    claimAmount: '$80.00',
    pointsConverted: '560 PTS',
    status: 'awaiting_evidence',
    statusBadgeText: '待举证',
    statusBadgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    initialVerdict: '需商户提交账单流水',
    initialVerdictSub: '催促举证倒计时 05h',
    handler: 'OP-8804',
    slaRemaining: '29h 12m',
    slaPercentage: 40,
    isUrgent: false,
    userEvidence: {
      text: '“申报 $100 面值的实体卡，充值后商户声称只有 $20，要求补偿差额 $80。”',
      receiptImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCV04fY1Z3cmLbjCqPbopbQEp0oKN9WtmozikdSmK0JINJkNCCP_rBYQFEJQW3hWPrVSvwhUcCa7SjLu4Odwcx-7BwWkG8hUgFJbEb2OCp7VrJFObxyAo3VZJhWm-hjmpNzrIiy3YqUlrArknelg9er3YNJmyrbdOhJdcjioAdraVhlYHTqpMtAhlHbb8qj7H0vLL8cYUA65XflJ8P5sjwUzNIBYwZ89teNIv-Rk6v4I78zxnuxnbGlJA',
      receiptDesc: 'Steam $100 纸质账单',
      cardBackImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBH-epdluelbWNoKLgjP45B-dNKvV7VsH9ryX00t56KEpXo3uSRX3Nt74RQFuprFJuWClk-QJ6RatgHX5t8DTHMSucFfGdSzB_jL0rVLAc0Zxhu31eShtOteorBs2GUQCo56cpXWF97t5BLeh0VY8bN0PxjGUosdPQr-KE-fc3T_D54V6UhFqE5SXU-IBpL17pXpkqp3OaptRvQL_-kj4xTJRwrDIuCfSmkJCj6Sj4PtoQpFcA91uf0sg',
      cardBackDesc: 'Steam 刮刮卡实拍',
      submitTime: '2026-08-27 09:41:10 EST',
      ocrStatus: '卡面金额标注 $100'
    },
    merchantEvidence: {
      text: '“入库充值时 Valve 钱包账单仅入账 $20，怀疑出卡方购买了低面额错版卡。”',
      apiRawJson: JSON.stringify({
        order_id: 'ORD-20260827-88921',
        redeemed_value: '20.00 USD',
        steam_transaction_id: 'TX-VALVE-88910'
      }, null, 2),
      responseTime: '42.0 秒',
      responseAssessment: '需补全官方充值流水PDF'
    },
    officialGroundTruth: {
      gatewayName: 'Valve Partner Billing Node',
      signature: '0x3301B8801A99BAA712',
      verified: true,
      redeemTimeEst: '09:42:00 EST',
      ticketTimeEst: '09:30:00 EST',
      platformOrderTimeEst: '09:41:10 EST',
      merchantAttemptTimeEst: '09:42:05 EST',
      forensicFinding: 'Valve 官方结算接口反馈正在同步中，初审判定需商户在 5 小时内上传完整流水截图证明入账仅为 $20。',
      discrepancySeconds: 0
    }
  },
  {
    id: 'DIS-20260827-0074',
    orderNo: 'ORD-20260827-87611',
    channel: 'MANUAL_BOT',
    createTime: '08-27 08:20:05',
    initiator: '商户发起',
    userUid: 'UID_655018',
    userName: '陈国强',
    userTier: '中度关注',
    userRiskScore: 64,
    merchantMid: 'MID-800109',
    merchantName: '深圳领航点卡行',
    merchantCollateral: '¥30W',
    cardName: 'Google Play Gift Card',
    cardFaceValue: '$50.00',
    disputeType: '卡密无效/错误',
    claimDetail: '格式少于 16 位字符校验',
    claimAmount: '$50.00',
    pointsConverted: '350 PTS',
    status: 'under_review',
    statusBadgeText: '待审核/复核',
    statusBadgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    initialVerdict: '拟判出卡人全责 (废卡)',
    initialVerdictSub: '待质检专员签批',
    handler: 'OP-8821',
    slaRemaining: '36h 40m',
    slaPercentage: 25,
    isUrgent: false,
    userEvidence: {
      text: '“上传卡密时手滑漏输了一位，要求补充正确卡密重新兑换。”',
      receiptImg: '',
      receiptDesc: '未提供',
      cardBackImg: '',
      cardBackDesc: '未提供',
      submitTime: '2026-08-27 08:20:05 EST',
      ocrStatus: '仅15位'
    },
    merchantEvidence: {
      text: '“卡密无效，校验码算法未通过，商户工位直接报错中断。”',
      apiRawJson: JSON.stringify({ error: 'INVALID_CODE_FORMAT', length: 15 }, null, 2),
      responseTime: '12.4 秒',
      responseAssessment: '废卡立退'
    },
    officialGroundTruth: {
      gatewayName: 'Google Play API',
      signature: '0x7710BA880199',
      verified: true,
      redeemTimeEst: 'N/A',
      ticketTimeEst: 'N/A',
      platformOrderTimeEst: '08:20:05 EST',
      merchantAttemptTimeEst: '08:20:17 EST',
      forensicFinding: '字符格式不合法，未产生官方充值请求，符合格式阻断认定。',
      discrepancySeconds: 0
    }
  },
  {
    id: 'DIS-20260827-0062',
    orderNo: 'ORD-20260827-86501',
    channel: 'API-POOL-C',
    createTime: '08-27 07:12:44',
    initiator: '商户发起',
    userUid: 'UID_440912',
    userName: '高桥凉介',
    userTier: '核心会员',
    userRiskScore: 92,
    merchantMid: 'MID-800778',
    merchantName: '东京数码国际流转',
    merchantCollateral: '¥100W',
    cardName: 'PlayStation Network JPY',
    cardFaceValue: '¥10,000',
    disputeType: '跨区Geo不匹配',
    claimDetail: '申报日区但实际绑定港服',
    claimAmount: '¥480.00',
    pointsConverted: '480 PTS',
    status: 'awaiting_acceptance',
    statusBadgeText: '待受理',
    statusBadgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    initialVerdict: '尚未指定初审',
    initialVerdictSub: '排队自动分配中',
    handler: '自动分派中',
    slaRemaining: '45h 10m',
    slaPercentage: 8,
    isUrgent: false,
    userEvidence: {
      text: '“购买时误以为是全区通用，希望更换通道或折价转让。”',
      receiptImg: '',
      receiptDesc: '未提供',
      cardBackImg: '',
      cardBackDesc: '未提供',
      submitTime: '2026-08-27 07:12:44 JST',
      ocrStatus: 'PSN-HK 格式'
    },
    merchantEvidence: {
      text: '“商户只接收日服账户充值，港卡无法入库。”',
      apiRawJson: JSON.stringify({ error: 'GEO_REGION_MISMATCH', account_region: 'JP', card_region: 'HK' }, null, 2),
      responseTime: '18.0 秒',
      responseAssessment: '无压单'
    },
    officialGroundTruth: {
      gatewayName: 'Sony PSN Network Auth',
      signature: '0x99182377A12',
      verified: true,
      redeemTimeEst: 'N/A',
      ticketTimeEst: 'N/A',
      platformOrderTimeEst: '07:12:44 JST',
      merchantAttemptTimeEst: '07:13:02 JST',
      forensicFinding: '区域锁限制，商户无法执行核销，建议改派港服专用档口。',
      discrepancySeconds: 0
    }
  },
  {
    id: 'DIS-20260827-0051',
    orderNo: 'ORD-20260827-85420',
    channel: 'API-POOL-A',
    createTime: '08-27 06:05:18',
    initiator: '出卡用户',
    userUid: 'UID_331002',
    userName: '林佳琪',
    userTier: '极高信用',
    userRiskScore: 95,
    merchantMid: 'MID-800311',
    merchantName: '华南迅捷卡商',
    merchantCollateral: '¥80W',
    cardName: 'Razer Gold PIN',
    cardFaceValue: '$100.00',
    disputeType: '商户延时吞卡确认',
    claimDetail: '商户已承认自身兑换成功未回传',
    claimAmount: '¥710.00',
    pointsConverted: '710 PTS',
    status: 'awaiting_settlement',
    statusBadgeText: '待资金处理',
    statusBadgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    initialVerdict: '商户全责 (执行划扣)',
    initialVerdictSub: '终审单据号: ARB-99014',
    handler: 'OP-8821',
    slaRemaining: '已定损待划',
    slaPercentage: 100,
    isUrgent: false,
    userEvidence: {
      text: '“交卡后商户迟迟不回调，后来在官方雷蛇账户发现充值成功了，商户吞卡！”',
      receiptImg: '',
      receiptDesc: '未提供',
      cardBackImg: '',
      cardBackDesc: '未提供',
      submitTime: '2026-08-27 06:05:18 CST',
      ocrStatus: '已校验'
    },
    merchantEvidence: {
      text: '“商户系统掉单，后台已查实充值成功，同意全额扣保赔付。”',
      apiRawJson: JSON.stringify({ status: 'ACKNOWLEDGED_FAULT', auto_compensate: true }, null, 2),
      responseTime: '600.0 秒 (严重超时)',
      responseAssessment: '商户自认责任'
    },
    officialGroundTruth: {
      gatewayName: 'Razer Gold Gateway',
      signature: '0x1102948771A',
      verified: true,
      redeemTimeEst: '06:06:00 CST',
      ticketTimeEst: 'N/A',
      platformOrderTimeEst: '06:05:18 CST',
      merchantAttemptTimeEst: '06:05:55 CST',
      forensicFinding: '商户已在接口承认掉单，待执行备付金直划。',
      discrepancySeconds: 0
    }
  },
  {
    id: 'DIS-20260827-0045',
    orderNo: 'ORD-20260827-84912',
    channel: 'API-POOL-B',
    createTime: '08-27 05:14:02',
    initiator: '商户发起',
    userUid: 'UID_110943',
    userName: '诈骗团伙黑卡',
    userTier: '已熔断封号',
    userRiskScore: 18,
    merchantMid: 'MID-800201',
    merchantName: '盛大数卡中枢',
    merchantCollateral: '¥150W',
    cardName: 'Xbox Live Gift Card',
    cardFaceValue: '$50.00',
    disputeType: '黑卡欺诈已确认',
    claimDetail: '微软逆向退款拒付反冲',
    claimAmount: '$50.00',
    pointsConverted: '350 PTS',
    status: 'closed',
    statusBadgeText: '已结案 (归档)',
    statusBadgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    initialVerdict: '出卡方全责 (扣除信用)',
    initialVerdictSub: '仲裁编号 ARB-99002',
    handler: 'OP-8801',
    slaRemaining: '耗时 1.4h',
    slaPercentage: 100,
    isUrgent: false,
    userEvidence: {
      text: '“（该出卡账号已被司法风控联合拉黑封停）”',
      receiptImg: '',
      receiptDesc: '未提供',
      cardBackImg: '',
      cardBackDesc: '未提供',
      submitTime: '2026-08-27 05:14:02 EST',
      ocrStatus: '黑名单匹配'
    },
    merchantEvidence: {
      text: '“微软反洗钱通知，该卡由盗刷信用卡购买，已全额 chargeback。”',
      apiRawJson: JSON.stringify({ chargeback_notice: 'FRAUD_REVERSAL_MS_CORP' }, null, 2),
      responseTime: '15.0 秒',
      responseAssessment: '合规阻断'
    },
    officialGroundTruth: {
      gatewayName: 'Microsoft Security Bureau',
      signature: '0x889100021A',
      verified: true,
      redeemTimeEst: '05:15:00 EST',
      ticketTimeEst: 'N/A',
      platformOrderTimeEst: '05:14:02 EST',
      merchantAttemptTimeEst: '05:14:17 EST',
      forensicFinding: '官方黑卡反冲确认，全额追偿完成。',
      discrepancySeconds: 0
    }
  }
];
