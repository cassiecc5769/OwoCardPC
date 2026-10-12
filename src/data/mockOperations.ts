export interface DispatchTaskItem {
  id: string;
  orderNo: string;
  poolTime: string;
  inFlightDuration: string;
  brandCode: string;
  brandColorClass: string;
  brandName: string;
  cardMedium: string;
  exchangeRate: string;
  declaredAmount: string;
  declaredValNum: number;
  payableAmount: string;
  payableValNum: number;
  userName: string;
  userLevel: string;
  userPhone: string;
  merchantName: string;
  merchantUid?: string;
  merchantStatusDesc: string;
  anomalyType: string;
  anomalyCategory: string;
  anomalyBadgeClass: string;
  anomalyDetail: string;
  slaCountdownSeconds: number;
  slaDisplay: string;
  slaSubtext: string;
  slaStatus: 'critical' | 'paused' | 'warning' | 'healthy' | 'waiting';
  riskPosture: string;
  riskPostureClass: string;
  statusCategory: 'in_flight' | 'pending_take' | 'taking' | 'processing' | 'warning' | 'timeout' | 'failed' | 'locked' | 'manual';
  secretToken: string;
  maskedToken: string;
  vouchers: {
    title: string;
    description: string;
    type: 'receipt' | 'card';
    imgUrl: string;
    details: string;
  }[];
  timeline: {
    time: string;
    badge: string;
    title: string;
    desc: string;
    status: 'success' | 'warning' | 'error';
  }[];
}

export const INITIAL_DISPATCH_TASKS: DispatchTaskItem[] = [
  {
    id: '9912',
    orderNo: 'ORD-20260827-9912',
    poolTime: '14:48:22',
    inFlightDuration: '在途 2m18s',
    brandCode: 'AAPL',
    brandColorClass: 'text-primary bg-primary-fixed/40',
    brandName: 'Apple US 充值卡',
    cardMedium: '实体卡 (JPG/OCR)',
    exchangeRate: '汇率 7.18',
    declaredAmount: '$200.00',
    declaredValNum: 200,
    payableAmount: '¥1,380.00 (92.0%)',
    payableValNum: 1380,
    userName: '极速回收大户-李**',
    userLevel: 'V4',
    userPhone: '186****9921 · 信用评级: 极优',
    merchantName: '极光数字科技 #M-04',
    merchantUid: 'M-88902',
    merchantStatusDesc: '席位负载 94% (通道拥堵)',
    anomalyType: '商户超时未核销',
    anomalyCategory: '商户超时未核销',
    anomalyBadgeClass: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    anomalyDetail: '商户回执响应超过 120s 警戒线',
    slaCountdownSeconds: 28,
    slaDisplay: '00:28s',
    slaSubtext: '即将熔断入弃单池',
    slaStatus: 'critical',
    riskPosture: '低风险 (98分)',
    riskPostureClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    statusCategory: 'warning',
    secretToken: 'X692-K991-8840-P9LA',
    maskedToken: 'X7B9-****-****-882A',
    vouchers: [
      {
        title: '凭证 01: 实体机打小票',
        description: 'Target #1842 现金付款 $200 · 流水匹配',
        type: 'receipt',
        imgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-f1O3hJEXVjTJ_QvNS9s4qN75oFwoQ-OgNk6UYh-ZlLaIvLNm3KwAU1tMwweyt8vDeF49pezhZt8ZWchOqtVl4WHSacXJ2aXm1XxwHKAKeYd1mTmkN1uong5IWruI4LfhqABGdT0Z_wQrLHu966SKL-NP95E-uP-PI9tDJ0hAzk26dWbkn5mtSVrtGRctZvKrtmxyyK-cbJA2O3LRGo5cECT8h2wxJPuGOZ4UUV2JnV2Tw9nD_8xAUg',
        details: 'Store ID: #1842, POS Terminal #04, Cashier: Emma S., Transaction Time: 2026-08-27 10:14:02 EST'
      },
      {
        title: '凭证 02: 实体卡背涂层图',
        description: '涂层刮开平整 · 序列号后4位 8840 完全一致',
        type: 'card',
        imgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhRF18GeMD66572mGep4VtnclBJbBggh8VKG5rtlMrhsT2seslS7W7csh9ASNqPpwWRFyvkDwX11ykYm2stOKm8_IA_hL8fYAPCnQ9h8My8fBv6yfDevPT07fmcVnuGYcPm7pEeCsabSu8BGknCEu5GRmGNGBE7dNSXt_QUB1ijv5CKS8gpNqC8Eu3CsCbYEsc9hO-szJ4bbow233XuXfQCd--iOqzwwPx2Uu068FvAdJbgcaCo8c9wQ',
        details: 'PIN: X692-K991-8840-P9LA, Micro-engraved Security Layer Intact, Barcode 16-digit verified'
      }
    ],
    timeline: [
      {
        time: '14:48:22',
        badge: '[提单入池]',
        title: '出卡客户发起提交',
        desc: '出卡大户 186****9921 提交订单 (Apple US $200)',
        status: 'success'
      },
      {
        time: '14:48:23',
        badge: '[初始撮合]',
        title: '智能算法分配至商户',
        desc: '风控策略引擎通过 (低风险 98 分) -> 分配至 招财进宝科技 (极光数字科技 #M-04)',
        status: 'success'
      },
      {
        time: '14:50:40',
        badge: '[SLA警报触发]',
        title: '商户超时 90s 无核销回调',
        desc: '触发 PRD 6.2 异常：商户超时未核销，系统强制剥离脱钩，跃迁进入临界人工调度台',
        status: 'error'
      }
    ]
  },
  {
    id: '9910',
    orderNo: 'ORD-20260827-9910',
    poolTime: '14:47:05',
    inFlightDuration: '在途 3m35s',
    brandCode: 'STM',
    brandColorClass: 'text-indigo-600 bg-indigo-50',
    brandName: 'Steam UK 充值卡',
    cardMedium: '实体刮刮卡',
    exchangeRate: '汇率 9.35',
    declaredAmount: '£100.00',
    declaredValNum: 100,
    payableAmount: '¥820.00 (87.7%)',
    payableValNum: 820,
    userName: '个人卖家-周**',
    userLevel: 'V1',
    userPhone: '139****1088 · 首次出卡',
    merchantName: '暂无 (挂起停顿)',
    merchantStatusDesc: '前置卡密清洗拦截',
    anomalyType: '格式报错 (卡密缺失1位)',
    anomalyCategory: '格式报错 (OCR待核正)',
    anomalyBadgeClass: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    anomalyDetail: '标准15位，仅识别到14位 · OCR待人工纠错',
    slaCountdownSeconds: 262,
    slaDisplay: '04:22m',
    slaSubtext: '已冻结倒计时',
    slaStatus: 'paused',
    riskPosture: '需核验图片',
    riskPostureClass: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    statusCategory: 'manual',
    secretToken: 'STM-UK-4891-992?',
    maskedToken: 'STM-****-****-992?',
    vouchers: [
      {
        title: '凭证 01: Steam刮开原图',
        description: '涂层边缘轻微反光，倒数第2位字符模糊',
        type: 'card',
        imgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhRF18GeMD66572mGep4VtnclBJbBggh8VKG5rtlMrhsT2seslS7W7csh9ASNqPpwWRFyvkDwX11ykYm2stOKm8_IA_hL8fYAPCnQ9h8My8fBv6yfDevPT07fmcVnuGYcPm7pEeCsabSu8BGknCEu5GRmGNGBE7dNSXt_QUB1ijv5CKS8gpNqC8Eu3CsCbYEsc9hO-szJ4bbow233XuXfQCd--iOqzwwPx2Uu068FvAdJbgcaCo8c9wQ',
        details: 'OCR Confidence: 78.4%, Missing digit at pos 14'
      }
    ],
    timeline: [
      {
        time: '14:47:05',
        badge: '[提单入池]',
        title: '个人卖家提交 Steam 实体卡',
        desc: '上传图片经由 OCR 自动识别',
        status: 'success'
      },
      {
        time: '14:47:07',
        badge: '[OCR格式报错]',
        title: '识别校验字符位缺失',
        desc: '仅识别到 14 位字符（应为 15 位），自动触发前置拦截挂起',
        status: 'error'
      }
    ]
  },
  {
    id: '9908',
    orderNo: 'ORD-20260827-9908',
    poolTime: '14:45:10',
    inFlightDuration: '在途 5m30s',
    brandCode: 'GGL',
    brandColorClass: 'text-emerald-700 bg-emerald-50',
    brandName: 'Google Play US',
    cardMedium: '电子代码 (Code)',
    exchangeRate: '汇率 7.15',
    declaredAmount: '$200.00',
    declaredValNum: 200,
    payableAmount: '¥1,350.00 (94.4%)',
    payableValNum: 1350,
    userName: '海外工作室-陈**',
    userLevel: 'V5',
    userPhone: '158****4490 · 月销 50w+',
    merchantName: '速盈网络 #M-12',
    merchantStatusDesc: '授信额度已透支 (拒单)',
    anomalyType: '商户拒单 (保证金不足)',
    anomalyCategory: '商户拒单 (额度不足)',
    anomalyBadgeClass: 'bg-purple-50 text-purple-700 border border-purple-200/80',
    anomalyDetail: '商户积点不足以覆盖结算金额',
    slaCountdownSeconds: 70,
    slaDisplay: '01:10m',
    slaSubtext: '排队等候重新派单',
    slaStatus: 'warning',
    riskPosture: '白名单客户',
    riskPostureClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    statusCategory: 'pending_take',
    secretToken: 'GGLP-9921-2290-771B',
    maskedToken: 'GGLP-****-****-771B',
    vouchers: [],
    timeline: [
      {
        time: '14:45:10',
        badge: '[提单入池]',
        title: '工作室提交批量电子代码',
        desc: 'Google Play US $200',
        status: 'success'
      },
      {
        time: '14:45:12',
        badge: '[商户拒单]',
        title: '承揽商授信不足拒单',
        desc: '速盈网络 #M-12 保证金积点仅剩 ¥820，无法承揽 ¥1,350 单据',
        status: 'error'
      }
    ]
  },
  {
    id: '9896',
    orderNo: 'ORD-20260827-9896',
    poolTime: '14:50:02',
    inFlightDuration: '在途 0m38s',
    brandCode: 'RZR',
    brandColorClass: 'text-primary bg-primary-fixed/40',
    brandName: 'Razer Gold Global',
    cardMedium: 'PIN码直充',
    exchangeRate: '汇率 7.20',
    declaredAmount: '$1,000.00',
    declaredValNum: 1000,
    payableAmount: '¥7,020.00 (97.5%)',
    payableValNum: 7020,
    userName: '盛大游戏兑换专线',
    userLevel: 'API机构',
    userPhone: '专线专号 · 授信预充',
    merchantName: '自营撮合专池 #HUB-01',
    merchantStatusDesc: '高优先级自动化席位',
    anomalyType: '正常作业中 (API校验中)',
    anomalyCategory: '正常作业中',
    anomalyBadgeClass: 'bg-blue-50 text-blue-700 border border-blue-200/80',
    anomalyDetail: '直连 Razer 鉴权系统校验余额',
    slaCountdownSeconds: 142,
    slaDisplay: '02:22m',
    slaSubtext: 'SLA 指标健康',
    slaStatus: 'healthy',
    riskPosture: '机构已验签',
    riskPostureClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    statusCategory: 'processing',
    secretToken: 'RZR-GOLD-9988-1120-X8',
    maskedToken: 'RZR-****-****-X8',
    vouchers: [],
    timeline: [
      {
        time: '14:50:02',
        badge: '[API入池]',
        title: '机构专线直连提交',
        desc: '验签通过，分配自营通道 #HUB-01 毫秒级做卡',
        status: 'success'
      }
    ]
  },
  {
    id: '9870',
    orderNo: 'ORD-20260827-9870',
    poolTime: '14:41:19',
    inFlightDuration: '在途 9m21s',
    brandCode: 'AMZN',
    brandColorClass: 'text-amber-700 bg-amber-50',
    brandName: 'Amazon JP 礼品卡',
    cardMedium: '电子礼券',
    exchangeRate: '汇率 0.046',
    declaredAmount: '¥50,000',
    declaredValNum: 50000,
    payableAmount: '¥2,116.00 (92.0%)',
    payableValNum: 2116,
    userName: '散客-赵**',
    userLevel: '高危',
    userPhone: '170****9012 · 新设备指纹',
    merchantName: '熔断隔离 (未派发)',
    merchantStatusDesc: '防黑产注入沙箱',
    anomalyType: '跨区代理IP阻断',
    anomalyCategory: '跨国境代理 IP 碰撞',
    anomalyBadgeClass: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    anomalyDetail: '提交IP为尼日利亚机房代理，出卡地申报为上海',
    slaCountdownSeconds: 0,
    slaDisplay: 'PAUSED',
    slaSubtext: '安全引擎锁单',
    slaStatus: 'paused',
    riskPosture: '高危风控拦截',
    riskPostureClass: 'bg-rose-50 text-rose-700 border border-rose-200/80 font-bold',
    statusCategory: 'locked',
    secretToken: 'AQ99-2810-MM92-8810',
    maskedToken: 'AQ99-****-****-8810',
    vouchers: [],
    timeline: [
      {
        time: '14:41:19',
        badge: '[提单拦截]',
        title: '散客提交 Amazon JP 礼券',
        desc: 'IP 定位 (Lagos, Nigeria) 与注册地 (Shanghai) 冲突，指纹风险值 94 分',
        status: 'error'
      }
    ]
  },
  {
    id: '9865',
    orderNo: 'ORD-20260827-9865',
    poolTime: '14:38:12',
    inFlightDuration: '在途 12m10s',
    brandCode: 'AAPL',
    brandColorClass: 'text-primary bg-primary-fixed/40',
    brandName: 'Apple DE 充值卡',
    cardMedium: '实体卡 (JPG)',
    exchangeRate: '汇率 7.82',
    declaredAmount: '€100.00',
    declaredValNum: 100,
    payableAmount: '¥710.00 (90.8%)',
    payableValNum: 710,
    userName: '德国代购-宋**',
    userLevel: 'V2',
    userPhone: '138****6621 · 履约良好',
    merchantName: '易卡汇智 #M-08',
    merchantStatusDesc: 'API 握手延时超标',
    anomalyType: 'API 上游网关 Timeout',
    anomalyCategory: 'API 上游网关 Timeout',
    anomalyBadgeClass: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    anomalyDetail: '核销上游网关 3 次重试无响应',
    slaCountdownSeconds: 0,
    slaDisplay: '00:00s',
    slaSubtext: '已超时 3m10s',
    slaStatus: 'critical',
    riskPosture: '中度风险',
    riskPostureClass: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    statusCategory: 'timeout',
    secretToken: 'DE-APPL-9921-0021-P1',
    maskedToken: 'DE-****-****-P1',
    vouchers: [],
    timeline: [
      {
        time: '14:38:12',
        badge: '[提单入池]',
        title: '代购提交德国 Apple 充值卡',
        desc: '面额 €100.00 EUR',
        status: 'success'
      },
      {
        time: '14:40:00',
        badge: '[网关超时]',
        title: '上游网关连接中断',
        desc: '欧洲节点 DNS 异常，请求已超时',
        status: 'error'
      }
    ]
  }
];
