import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NavPath } from '../../types';
import { CardBrandLogo } from '../card-config/CardBrandLogo';
import { StatusBadge, RegionBadge, MediaBadge } from '../common/DesignSystemBadges';
import { MaterialIcon } from '../common/MaterialIcon';

interface CustomerServiceCockpitProps {
  currentPath?: NavPath;
  onNavigate: (path: NavPath) => void;
  initialSubTab?: 'orders' | 'merchant' | 'promotion';
}

// ============================================================================
// 8. 卡单作业数据结构与状态定义
// ============================================================================
export type OrderOperationalStatus =
  | 'pending_claim' // 无商户接卡
  | 'merchant_reported_anomaly' // 商户提交异常
  | 'manual_recalled_pending' // 已撤回·待处理
  | 'waiting_merchant_claim' // 待商户接卡
  | 'waiting_merchant_process' // 待商户处理
  | 'after_sale' // 售后中
  | 'failed_pending_audit' // 失败待审核
  | 'completed' // 处理成功
  | 'failed' // 处理失败
  | 'processing' // 处理中 (兼容现有)
  | 'pending_confirm' // 待人工确认 (兼容现有)
  | 'overdue_soon' // 即将超时 (兼容现有)
  | 'overdue' // 已超时 (兼容现有)
  | 'dispute'; // 争议中 (兼容现有)

export type OrderFilterTab =
  | 'all_pending' // 全部待处理
  | 'pending_claim' // 无商户接卡
  | 'merchant_reported_anomaly' // 商户提交异常
  | 'manual_recalled_pending' // 已撤回·待处理
  | 'all_orders'; // 全部卡单

export type UserLevel = 'V1' | 'V2' | 'V3' | 'V4' | 'V5' | 'V6' | 'V7';

export const getUserLevelBadgeClass = (level?: string) => {
  const normLevel = (level || 'V1').replace('VIP', 'V');
  switch (normLevel) {
    case 'V1':
    case 'V2':
      return 'bg-slate-100 text-slate-600 border border-slate-200/60';
    case 'V3':
    case 'V4':
      return 'bg-blue-50 text-blue-700 border border-blue-200/70';
    case 'V5':
    case 'V6':
      return 'bg-purple-50 text-purple-700 border border-purple-200/70';
    case 'V7':
      return 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 border border-amber-300 font-extrabold shadow-2xs';
    default:
      return 'bg-slate-100 text-slate-600 border border-slate-200/60';
  }
};

/**
 * 格式化简洁等待时长 (mm:ss，超过1小时展示 hh:mm:ss)
 */
export const formatConciseDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const remM = m % 60;
    return `${String(h).padStart(2, '0')}:${String(remM).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

/**
 * 格式化剩余秒数为可读展示 (如: 42分20秒)
 */
export const formatSeconds = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const remM = m % 60;
    return `${h}小时${remM}分${s}秒`;
  }
  return `${m}分${s}秒`;
};

export type CardActionModalType =
  | 'dispatch'
  | 'editCard'
  | 'splitOrder'
  | 'transfer'
  | 'directProcess'
  | 'syncUser'
  | 'recall'
  | 'resolveAnomaly'
  | 'manualDelay';

export interface CardActionModalState {
  type: CardActionModalType;
  task: CardOrderTask;
}

export const CARD_ACTION_MODAL_CONFIG: Record<
  CardActionModalType,
  {
    title: string;
    badge: string;
    badgeClass: string;
    icon: string;
    iconBg: string;
    iconColor: string;
    description: string;
  }
> = {
  dispatch: {
    title: '人工派单',
    badge: '人工调度',
    badgeClass: 'bg-blue-100 text-blue-700',
    icon: 'send',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    description: '客服手动将卡单指定分配给指定商户或履约渠道',
  },
  editCard: {
    title: '修改卡信息',
    badge: '信息修正',
    badgeClass: 'bg-indigo-100 text-indigo-700',
    icon: 'edit_note',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    description: '人工修正卡种、卡密、面额或卡图解析数据',
  },
  splitOrder: {
    title: '拆单处理',
    badge: '业务拆单',
    badgeClass: 'bg-amber-100 text-amber-800',
    icon: 'call_split',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
    description: '将原卡单中的多张卡图/卡密拆分生成独立的全新卡单',
  },
  transfer: {
    title: '转单',
    badge: '工单流转',
    badgeClass: 'bg-amber-100 text-amber-700',
    icon: 'swap_horiz',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    description: '将当前卡单转交至其他客服专员、高级风控或渠道主管',
  },
  directProcess: {
    title: '直接处理',
    badge: '直接处理',
    badgeClass: 'bg-purple-100 text-purple-700',
    icon: 'bolt',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    description: '客服直接对卡单进行成功或失败处理',
  },
  syncUser: {
    title: '同步用户信息',
    badge: '数据同步',
    badgeClass: 'bg-emerald-100 text-emerald-700',
    icon: 'sync',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    description: '向用户澄清说明该卡单的相关异常信息与举证记录，便于用户实时知晓',
  },
  recall: {
    title: '撤回卡单',
    badge: '功能预留',
    badgeClass: 'bg-amber-100 text-amber-700',
    icon: 'undo',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    description: '申请将当前商户处理中的卡单撤回至客服调度池',
  },
  resolveAnomaly: {
    title: '解除异常确认',
    badge: '异常复核',
    badgeClass: 'bg-emerald-100 text-emerald-700',
    icon: 'check_circle',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    description: '核实商户上报异常，解除后卡单将恢复为待商户处理状态继续流转',
  },
  manualDelay: {
    title: '手动延时',
    badge: '人工顺延',
    badgeClass: 'bg-amber-100 text-amber-800',
    icon: 'more_time',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
    description: '为商户处理卡单预留更多时间，顺延卡单处理时长',
  },
};

export interface DispatchMerchantOption {
  id: string;
  name: string;
  statusDesc: string;
  isNormal: boolean;
  isFallback: boolean;
  customerServices: Array<{ id: string; label: string }>;
}

export interface PlatformCustomerService {
  id: string;
  name: string;
  email: string;
  label: string; // e.g. "青青(989898@163.com)"
  status: 'working' | 'offline' | 'break'; // 'working' 表示“开启工作状态”，其他未开启
  statusDesc: string;
  isWorking: boolean;
}

export const PLATFORM_CUSTOMER_SERVICES: PlatformCustomerService[] = [
  {
    id: 'cs_qq',
    name: '青青',
    email: '989898@163.com',
    label: '青青(989898@163.com)',
    status: 'working',
    statusDesc: '开启工作状态',
    isWorking: true,
  },
  {
    id: 'cs_dff',
    name: '大飞飞',
    email: '3456@163.com',
    label: '大飞飞(3456@163.com)',
    status: 'working',
    statusDesc: '开启工作状态',
    isWorking: true,
  },
  {
    id: 'cs_xpp',
    name: '小胖胖',
    email: '19203@163.com',
    label: '小胖胖(19203@163.com)',
    status: 'working',
    statusDesc: '开启工作状态',
    isWorking: true,
  },
  {
    id: 'cs_yc',
    name: '雨晨',
    email: 'yuchen88@163.com',
    label: '雨晨(yuchen88@163.com)',
    status: 'working',
    statusDesc: '开启工作状态',
    isWorking: true,
  },
  {
    id: 'cs_kn',
    name: '柯南',
    email: 'kenan_cs@163.com',
    label: '柯南(kenan_cs@163.com)',
    status: 'break',
    statusDesc: '小休中(未开启工作状态)',
    isWorking: false,
  },
  {
    id: 'cs_wm',
    name: '文梅',
    email: 'wenmei_cs@163.com',
    label: '文梅(wenmei_cs@163.com)',
    status: 'offline',
    statusDesc: '离线(未开启工作状态)',
    isWorking: false,
  },
];

export type SyncUserInfoType = '无效卡同步' | '其他';

export interface SyncUserProofImage {
  id: string;
  name: string;
  size: string;
  dataUrl: string;
}

export interface SyncUserInfoItem {
  id: string;
  type: SyncUserInfoType;
  content: string; // 最多 1000 字符，仅支持英文
  proofImages: SyncUserProofImage[]; // 支持多张举证图，最多 12 张
  contentError?: string | null;
  imageError?: string | null;
}

export const DISPATCH_MERCHANT_LIST: DispatchMerchantOption[] = [
  {
    id: 'fallback',
    name: '兜底商户',
    statusDesc: '正常',
    isNormal: true,
    isFallback: true,
    customerServices: [
      { id: 'cs_dff', label: '大飞飞(3456@163.com)' },
      { id: 'cs_xpp', label: '小胖胖(19203@163.com)' },
    ],
  },
  {
    id: 'zhaocai',
    name: '招财',
    statusDesc: '正常',
    isNormal: true,
    isFallback: false,
    customerServices: [
      { id: 'cs_zc_dff', label: '大飞飞(3456@163.com)' },
      { id: 'cs_zc_xpp', label: '小胖胖(19203@163.com)' },
    ],
  },
  {
    id: 'bubugaosheng',
    name: '补补高升',
    statusDesc: '暂停接卡(余额不足)',
    isNormal: false,
    isFallback: false,
    customerServices: [],
  },
  {
    id: 'yuanbao',
    name: '元宝',
    statusDesc: '暂停接卡(无客服在线)',
    isNormal: false,
    isFallback: false,
    customerServices: [],
  },
];

// 直接处理 - 失败原因下拉选项 (单选字典)
export const DIRECT_PROCESS_FAIL_REASONS = [
  { value: 'redeemed', label: '卡已被兑换 / 已使用 (Card already redeemed)' },
  { value: 'invalid_code', label: '无效卡密 / 卡号密码错误 (Invalid card / code error)' },
  { value: 'amount_mismatch', label: '面额/币种与订单不符 (Value / currency mismatch)' },
  { value: 'inactive_card', label: '卡片未激活 / 无法兑付 (Card not activated)' },
  { value: 'multi_card_issue', label: '多张卡未拆分 / 无法核验 (Multiple cards / split issue)' },
  { value: 'risk_black_card', label: '系统风控拦截 / 黑卡 (Risk control / black card)' },
  { value: 'other_user_reason', label: '其他用户端原因 (Other user reasons)' },
];

// 修改卡信息 - 下拉字典选项
export const EDIT_CARD_TYPE_OPTIONS = [
  'Steam',
  'Apple / iTunes',
  'Google Play',
  'Amazon',
  'eBay',
  'Razer Gold',
  'Nike',
  'Sephora',
  'Walmart',
  'Xbox',
];

export const EDIT_COUNTRY_OPTIONS = [
  { code: 'US', name: '美国', flag: '🇺🇸' },
  { code: 'UK', name: '英国', flag: '🇬🇧' },
  { code: 'DE', name: '德国', flag: '🇩🇪' },
  { code: 'NG', name: '尼日利亚', flag: '🇳🇬' },
  { code: 'CA', name: '加拿大', flag: '🇨🇦' },
  { code: 'AU', name: '澳大利亚', flag: '🇦🇺' },
  { code: 'FR', name: '法国', flag: '🇫🇷' },
  { code: 'JP', name: '日本', flag: '🇯🇵' },
];

export const EDIT_MEDIA_TYPE_OPTIONS = ['电子码', '卡图'];
export const EDIT_SPEED_OPTIONS = ['快卡', '慢卡', '普通卡'];

// 修改卡信息 - 默认回显的卡图与卡代码 Mock 数据 (支持多个卡密与卡图展示，支持无码有图与无图有码)
export interface MockCardCodeImagePair {
  id: string;
  cardName: string;
  hasImage: boolean;
  imageUrl?: string;
  hasCode: boolean;
  code?: string;
}

export const MOCK_EDIT_CARD_ITEMS: MockCardCodeImagePair[] = [
  {
    id: 'p1',
    cardName: '卡片 #1',
    hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
    hasCode: true,
    code: 'STM-UK-9921-X992-0012',
  },
  {
    id: 'p2',
    cardName: '卡片 #2',
    hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    hasCode: true,
    code: 'STM-UK-9921-X992-0013',
  },
  {
    id: 'p3',
    cardName: '卡片 #3',
    hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
    hasCode: false, // 有卡图无卡代码 -> 提示 卡代码提取失败，卡图默认为加密状态
  },
  {
    id: 'p4',
    cardName: '卡片 #4',
    hasImage: false, // 无卡图有卡代码 -> 提示 无卡图，卡代码默认为加密状态
    hasCode: true,
    code: 'STM-UK-9921-X992-0015',
  },
];

// PIN 凭证 Mock 数据 (纯卡码，示例 324533，默认展示3条，超过3条支持展开/收起)
export interface MockCardPinItem {
  id: string;
  pin: string;
}

export const MOCK_EDIT_CARD_PINS: MockCardPinItem[] = [
  { id: 'pin-1', pin: '324533' },
  { id: 'pin-2', pin: '882019' },
  { id: 'pin-3', pin: '440291' },
  { id: 'pin-4', pin: '710492' },
];

// 有效期凭证 Mock 数据 (示例 2025-10-19，默认展示3条，超过3条支持展开/收起)
export interface MockCardExpiryItem {
  id: string;
  expiryDate: string;
}

export const MOCK_EDIT_CARD_EXPIRIES: MockCardExpiryItem[] = [
  { id: 'exp-1', expiryDate: '2025-10-19' },
  { id: 'exp-2', expiryDate: '2026-06-30' },
  { id: 'exp-3', expiryDate: '2027-12-15' },
  { id: 'exp-4', expiryDate: '2028-09-30' },
];

// 收据凭证 Mock 数据 (纯图片，默认展示3条，超过3条支持展开/收起)
export interface MockCardReceiptItem {
  id: string;
  name: string;
  imageUrl: string;
}

export const MOCK_EDIT_CARD_RECEIPTS: MockCardReceiptItem[] = [
  {
    id: 'rec-1',
    name: '购买收据凭证 #1',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
  },
  {
    id: 'rec-2',
    name: '购买收据凭证 #2',
    imageUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800',
  },
  {
    id: 'rec-3',
    name: '购买收据凭证 #3',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800',
  },
  {
    id: 'rec-4',
    name: '购买收据凭证 #4',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
  },
];

export const MOCK_EDIT_CARD_CODES = MOCK_EDIT_CARD_ITEMS.filter(it => it.hasCode).map(it => ({
  id: it.id,
  code: it.code!,
}));

export const MOCK_EDIT_CARD_IMAGES = MOCK_EDIT_CARD_ITEMS.filter(it => it.hasImage).map(it => ({
  id: it.id,
  name: it.cardName,
  url: it.imageUrl!,
}));


export interface CardOrderTask {
  id: string; // 卡单号
  user: {
    userId: string; // 用户ID (固定长度，如 USNEO3N9Z)
    name: string; // 用户昵称
    level: UserLevel | string; // 等级: V1 ~ V7
    creditScore?: number; // 信用分
    isNewUser?: boolean;
    phoneOrEmail: string;
  };
  cardType: string; // 卡种 (Apple/Steam/Google Play/Razer)
  cardTypeIcon: string;
  cardFullName?: string; // 卡全名，如 苹果/Apple&iTunes
  mediaTypeLabel?: string; // 介质标签，如 卡图 / 电子码
  speedTag?: string; // 时效标签，如 快卡 / 慢卡 / 普通卡
  cardQuantity?: number; // 卡数量，如 1
  userDealQuote?: string; // 用户成交报价 (用户最终成交的报价)
  merchantQuote?: string; // 收卡报价 (最终收卡商户做卡的报价)
  country: string; // 国家代码 (US, UK, DE, etc.)
  countryName: string;
  countryFlag: string;
  faceValue: number; // 面额
  declaredAmount: number; // 申报金额 (用户实收估值 USDT)
  currency: string;
  cardCheckResult: {
    status: 'valid' | 'invalid' | 'grey_balance' | 'redeemed' | 'timeout' | 'not_activated';
    label: string;
    realBalance?: number;
    checkTime: string;
    provider: string;
  };
  riskTags: string[]; // 风险标签 (正常/频控命中/重复卡密嫌疑/异地IP/余额不符/疑似撞库等)
  isRiskAnomaly: boolean; // 是否存在风险异常
  currentMerchant: {
    id: string;
    name: string;
    rate: string; // 核销率
    claimTime?: string;
  } | null;
  status: OrderOperationalStatus;
  statusLabel: string;
  auditReviewer?: string; // 审核人 (用于失败待审核状态展示)
  entryReason: 'normal_manual' | 'auto_failed' | 'risk_unconfirmed' | 'merchant_anomaly' | 'dispute';
  entryReasonLabel: string; // 进入条件说明
  waitingDurationSeconds: number; // 等待时间 (当前节点)
  slaRemainingSeconds: number; // SLA 剩余秒数 (负数为超时)
  slaTotalSeconds: number;
  slaStatus: 'normal' | 'warning' | 'overdue';
  systemAdvice: string; // 系统建议下一步
  cardDetails: {
    cardCode: string; // 卡密
    pinCode?: string;
    ocrConfidence: number;
    imageUrl: string;
    imageReflections: boolean; // 是否反光
  };
  cardItems?: MockCardCodeImagePair[]; // 卡图卡密凭证清单
  assignedCs?: {
    id: string;
    name: string;
    email: string;
    label: string;
  } | null;
  historyLogs: Array<{
    time: string;
    operator: string;
    action: string;
    note?: string;
  }>;
}

/**
 * 获取卡单绑定的卡图卡密明细清单
 */
export const getTaskCardItems = (task: CardOrderTask): MockCardCodeImagePair[] => {
  if (task.cardItems && task.cardItems.length > 0) {
    return task.cardItems;
  }
  if (task.cardQuantity && task.cardQuantity > 1) {
    return MOCK_EDIT_CARD_ITEMS.slice(0, Math.min(task.cardQuantity, MOCK_EDIT_CARD_ITEMS.length));
  }
  if (task.cardDetails?.imageUrl || task.cardDetails?.cardCode) {
    return [
      {
        id: `${task.id}-c1`,
        cardName: '卡片 #1',
        hasImage: !!task.cardDetails.imageUrl,
        imageUrl: task.cardDetails.imageUrl?.startsWith('http')
          ? task.cardDetails.imageUrl
          : 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
        hasCode: !!task.cardDetails.cardCode,
        code: task.cardDetails.cardCode || 'STM-US-8821-9921-001',
      },
    ];
  }
  return [];
};

export type ChatTargetType = 'user' | 'merchant' | 'handler';

export interface ChatSessionState {
  type: ChatTargetType;
  taskId: string;
  targetName: string;
  targetSub: string;
  task: CardOrderTask;
}

export interface ChatMessageItem {
  id: string;
  sender: 'self' | 'target' | 'system';
  senderName: string;
  content: string;
  time: string;
}

export const getTaskHandler = (task: CardOrderTask): { id: string; name: string; email: string; label: string } | null => {
  // 1. 无商户接卡、已撤回·待处理、待商户接卡 这些状态是没值的
  if (
    task.status === 'pending_claim' ||
    task.status === 'manual_recalled_pending' ||
    task.status === 'waiting_merchant_claim'
  ) {
    return null;
  }
  // 2. 其它状态一定存在处理人
  if (task.assignedCs) {
    return task.assignedCs;
  }
  return {
    id: 'cs_qq',
    name: '青青',
    email: '123442@163.com',
    label: '青青(123442@163.com)',
  };
};

// ============================================================================
// 9. 商户异常任务数据结构
// ============================================================================
export type MerchantAnomalyType =
  | 'rejection' // 商户拒单
  | 'claim_timeout' // 接单超时
  | 'process_timeout' // 处理超时
  | 'cannot_process' // 商户无法处理
  | 'price_anomaly_urge' // 报价异常需人工催价
  | 'capacity_abnormal'; // 承接能力异常 (额度耗尽/质押不足)

export interface MerchantAnomalyTask {
  id: string;
  merchant: {
    id: string;
    name: string;
    tier: string;
    depositBalance: string; // 质押金
  };
  anomalyType: MerchantAnomalyType;
  anomalyTypeLabel: string;
  relatedSku: string; // 关联SKU
  relatedOrderCodes: string[]; // 关联卡单列表
  occurredTime: string; // 发生时间
  durationMinutes: number; // 持续时间
  impactedOrdersCount: number; // 影响订单数
  impactedAmount: string; // 影响金额
  suggestedAction: string; // 系统建议动作
  owner: string; // 负责人
  status: 'pending_intervene' | 'processing' | 'merchant_handling' | 'resolved';
  statusLabel: string;
  detailCause: string;
}

// ============================================================================
// 10. 推广异常数据结构 (来自渠道推广系统)
// ============================================================================
export interface PromotionAnomalyTicket {
  ticketId: string;
  visitorOrUserId: string;
  channel: string; // 获客渠道
  campaign: string; // 推广活动
  issueType: 'registration_failed' | 'account_issue' | 'sell_card_issue' | 'order_issue' | 'special_quote' | 'platform_rules';
  issueTypeLabel: string;
  issueSummary: string; // 问题摘要
  chatSummary: string; // 会话摘要 (前序多轮沟通纪要)
  relatedCardType: string; // 关联卡种
  relatedOrderCode?: string; // 关联订单
  priority: 'P0' | 'P1' | 'P2';
  createdTime: string; // 创建时间
  status: 'pending_receive' | 'pending_process' | 'processing' | 'resolved' | 'synced_back' | 'escalated' | 'failed';
  statusLabel: string;
  resolutionNote?: string;
}

const CardCheckRow = ({ checkItem, idx, setPreviewImageModal, editShowCodesPlain, triggerToast, setTraceModal }: any) => {
  const [status, setStatus] = useState(checkItem.status);
  const [statusType, setStatusType] = useState(checkItem.statusType);
  const [code, setCode] = useState(checkItem.code);
  const [balance, setBalance] = useState(checkItem.balance);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const isUnhidden = !!editShowCodesPlain['cardCheck_show'];

  const addHistory = (action: string) => {
    const now = new Date().toLocaleString('sv-SE').replace('/', '-').replace('/', '-');
    setHistory(prev => [`${now} ${action}`, ...prev]);
  };

  return (
    <div
      key={checkItem.id}
      className="flex items-center justify-between gap-3 bg-white px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors shadow-2xs text-xs"
    >
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="font-mono text-slate-500 font-bold text-[11px]">
          #{idx + 1}
        </span>
        {checkItem.hasImage && checkItem.imageUrl ? (
          <div
            className="group relative w-11 h-7 rounded-md overflow-hidden bg-slate-900 border border-slate-200 shrink-0 cursor-pointer flex items-center justify-center shadow-2xs"
            onClick={() => setPreviewImageModal({ url: checkItem.imageUrl!, title: `Card Check #${idx + 1}` })}
            title="点击查看大图"
          >
            <img
              src={checkItem.imageUrl}
              alt={checkItem.name}
              className="w-full h-full object-cover transition-all duration-150 scale-105 group-hover:scale-100"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
              <MaterialIcon name="visibility" size={13} className="text-white drop-shadow-xs" />
            </div>
          </div>
        ) : (
          <div className="w-11 h-7 rounded-md border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 text-slate-400" title="无卡图">
            <MaterialIcon name="image_not_supported" size={12} className="text-slate-300" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          {code ? (
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs">
              {isUnhidden
                ? code
                : `${code.slice(0, 4)}-****-****-${code.slice(-4)}`}
            </span>
          ) : (
            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px] font-medium flex items-center gap-1">
              <MaterialIcon name="error_outline" size={13} />
              <span>{isProcessing ? '提取中...' : '卡代码提取失败'}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
          <span>
            状态:{' '}
            <strong className={`px-1.5 py-0.2 rounded font-sans text-[10px] ${
              statusType === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : statusType === 'warning'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-rose-100 text-rose-800 border border-rose-200'
            }`}>
              {status}
            </strong>
          </span>
          <span>|</span>
          <span>
            余额: <strong className={balance === '$0.00' ? 'text-rose-600' : 'text-slate-800'}>{isProcessing ? '查询中...' : balance}</strong>
          </span>
          {checkItem.time && <span>(2026-10-09 {checkItem.time})</span>}
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-1">
        <button
          type="button"
          onClick={() => {
            if (setTraceModal) {
              setTraceModal({ isOpen: true, cardId: checkItem.id, cardName: checkItem.name });
            }
          }}
          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 text-[11px] font-medium cursor-pointer border border-slate-200"
        >
          <MaterialIcon name="history" size={13} />
          <span>轨迹</span>
        </button>
        {!code && (
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => {
              setIsProcessing(true);
              addHistory('手动触发重提');
              setTimeout(() => {
                setCode('AP-9999-RETRY-0001');
                setStatus('有效');
                setStatusType('success');
                setBalance('$50.00');
                setIsProcessing(false);
                triggerToast(`[${checkItem.name}] 重新提取成功`);
              }, 1500);
            }}
            className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors flex items-center gap-1 text-[11px] font-medium cursor-pointer border border-blue-200 disabled:opacity-50"
          >
            <MaterialIcon name="refresh" size={13} />
            <span>{isProcessing ? '处理中...' : '重提'}</span>
          </button>
        )}
        {balance === '--' && (
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => {
              setIsProcessing(true);
              addHistory('手动触发重查');
              setTimeout(() => {
                setBalance('$50.00');
                setStatus('有效');
                setStatusType('success');
                setIsProcessing(false);
                triggerToast(`[${checkItem.name}] 重新查询成功`);
              }, 1500);
            }}
            className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors flex items-center gap-1 text-[11px] font-medium cursor-pointer border border-indigo-200 disabled:opacity-50"
          >
            <MaterialIcon name="sync" size={13} />
            <span>{isProcessing ? '查询中...' : '重查'}</span>
          </button>
        )}
      </div>
    </div>
  );
};


const TraceModal = ({ isOpen, cardId, cardName, onClose }: { isOpen: boolean; cardId: string; cardName: string; onClose: () => void }) => {
  if (!isOpen) return null;
  const mockTrace = [
    { time: '2026-10-09 20:30:00', event: '系统自动提取', operator: '系统任务', details: 'OCR识别成功' },
    { time: '2026-10-09 20:31:05', event: '查看卡密', operator: '客服-Cassie', details: 'IP: 192.168.1.1' },
    { time: '2026-10-09 20:35:10', event: '余额查询', operator: '系统任务', details: '查询失败：无响应' },
    { time: '2026-10-09 20:36:00', event: '余额重查', operator: '客服-Cassie', details: '手动触发' },
    { time: '2026-10-09 20:37:00', event: '再次查看', operator: '客服-Cassie', details: 'IP: 192.168.1.1' },
    { time: '2026-10-09 20:38:00', event: '修改备注', operator: '客服-Cassie', details: '更新处理流程' },
    { time: '2026-10-09 20:39:00', event: '转交风控', operator: '客服-Cassie', details: '疑难杂症' },
    { time: '2026-10-09 20:40:00', event: '风控结案', operator: '系统任务', details: '标记为已处理' },
  ].reverse();
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">轨迹 - {cardName} ({cardId})</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <MaterialIcon name="close" size={18} />
          </button>
        </div>
        <div className="p-4 max-h-[30vh] overflow-y-auto">
          <div className="flex flex-col gap-3">
            {mockTrace.map((t, idx) => (
              <div key={idx} className="flex gap-2.5">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  {idx !== mockTrace.length - 1 && <div className="w-0.5 grow bg-slate-200 my-0.5" />}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-slate-400 font-mono">{t.time}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-800">{t.event}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{t.operator}</span>
                  </div>
                  <span className="text-[11px] text-slate-600">{t.details}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const CustomerServiceCockpit: React.FC<CustomerServiceCockpitProps> = ({
  currentPath,
  onNavigate,
  initialSubTab,
}) => {
  // 顶层主 Tab：卡单作业 ｜ 商户异常 ｜ 推广异常 ｜ 售后待办 (PRD 标准)
  const [activeMainTab, setActiveMainTab] = useState<'orders' | 'merchant' | 'promotion' | 'after_sale'>(() => {
    if (currentPath === 'workbench-cs-merchant') return 'merchant';
    if (currentPath === 'workbench-cs-promotion') return 'promotion';
    if (initialSubTab) return initialSubTab as any;
    return 'orders';
  });

  // 同步外部 currentPath 变化
  useEffect(() => {
    if (currentPath === 'workbench-cs-merchant') {
      setActiveMainTab('merchant');
    } else if (currentPath === 'workbench-cs-promotion') {
      setActiveMainTab('promotion');
    } else if (currentPath === 'workbench-cs-orders' || currentPath === 'workbench-cs') {
      setActiveMainTab('orders');
    }
  }, [currentPath]);

  // 8.3 卡单作业专属 Tab
  const [orderFilterTab, setOrderFilterTab] = useState<OrderFilterTab>('all_pending');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<CardOrderTask | null>(null);

  // 模态框与操作抽屉
  const [isProcessingDrawerOpen, setIsProcessingDrawerOpen] = useState(false);
  const [processingOrder, setProcessingOrder] = useState<CardOrderTask | null>(null);
  const [operatorNote, setOperatorNote] = useState('');
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  // 商户异常与推广异常模态框
  const [selectedMerchantTask, setSelectedMerchantTask] = useState<MerchantAnomalyTask | null>(null);
  const [selectedPromotionTicket, setSelectedPromotionTicket] = useState<PromotionAnomalyTicket | null>(null);
  const [promotionResolveText, setPromotionResolveText] = useState('');

  // 动态时钟与倒计时
  const [nowSec, setNowSec] = useState<number>(Date.now());
  // 工作状态开关 (开: 在线工作/接收异常卡单派发; 关: 离线休息/不接收派发)
  const [isWorking, setIsWorking] = useState<boolean>(true);

  useEffect(() => {
    const t = setInterval(() => setNowSec(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // 抽屉打开时锁定外层背景滚动，防止滚动穿透
  useEffect(() => {
    if (isProcessingDrawerOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isProcessingDrawerOpen]);

  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);

  const handleCopyUserId = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(userId);
    setCopiedUserId(userId);
    setTimeout(() => setCopiedUserId(null), 1500);
  };

  const triggerToast = (msg: string) => {
    setActionSuccessToast(msg);
    setTimeout(() => setActionSuccessToast(null), 3000);
  };

  // 卡单操作栏交互状态: 「更多」下拉菜单 (点击展开) & 预留空内容弹窗
  const [activeDropdownOrderId, setActiveDropdownOrderId] = useState<string | null>(null);
  const [cardActionModal, setCardActionModal] = useState<CardActionModalState | null>(null);
  // 解除商户异常二次确认弹窗 (方案A)
  const [resolveAnomalyOrder, setResolveAnomalyOrder] = useState<CardOrderTask | null>(null);

  const handleConfirmResolveAnomaly = () => {
    if (!resolveAnomalyOrder) return;
    const targetId = resolveAnomalyOrder.id;
    setOrderTasks(prev =>
      prev.map(task => {
        if (task.id === targetId) {
          return {
            ...task,
            status: 'waiting_merchant_process' as OrderOperationalStatus,
            statusLabel: '待商户处理',
            historyLogs: [
              {
                time: new Date().toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                }),
                operator: '人工客服',
                action: '已解除商户异常，状态恢复为【待商户处理】',
              },
              ...task.historyLogs,
            ],
          };
        }
        return task;
      })
    );
    triggerToast(`已成功解除卡单 ${targetId} 异常状态，已恢复为【待商户处理】！`);
    setResolveAnomalyOrder(null);
  };

  // ============================================================================
  // 实时会话小悬浮窗口状态及事件处理
  // ============================================================================
  const [activeChatSession, setActiveChatSession] = useState<ChatSessionState | null>(null);
  const [isChatMinimized, setIsChatMinimized] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>([]);
  const [chatInputText, setChatInputText] = useState<string>('');

  const handleOpenLiveChat = (type: ChatTargetType, task: CardOrderTask) => {
    let targetName = '';
    let targetSub = '';
    if (type === 'user') {
      targetName = `用户：${task.user.name}`;
      targetSub = `${(task.user.level || 'V1').replace('VIP', 'V')} · ${task.user.userId || 'USNEO3N9Z'}`;
    } else if (type === 'merchant') {
      targetName = `商户：${task.currentMerchant?.name || '承接商户'}`;
      targetSub = `履约率 ${task.currentMerchant?.rate || '98%'}`;
    } else {
      const handler = getTaskHandler(task);
      targetName = `处理人：${handler?.name || '青青'}`;
      targetSub = handler?.email || '123442@163.com';
    }

    const nowTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    const initialMessages: ChatMessageItem[] = [
      {
        id: `sys-${Date.now()}`,
        sender: 'system',
        senderName: '系统通知',
        content: `已接入卡单 [${task.id}] 实时在线沟通流。当前状态：${task.statusLabel}（${task.faceValue} ${task.currency}）。`,
        time: nowTime,
      },
    ];

    if (type === 'user') {
      initialMessages.push({
        id: `msg-${Date.now() + 1}`,
        sender: 'target',
        senderName: task.user.name,
        content: `客服您好，我的卡单 [${task.id}] 当前进展如何了？想咨询一下大概什么时候放款。`,
        time: nowTime,
      });
    } else if (type === 'merchant') {
      initialMessages.push({
        id: `msg-${Date.now() + 1}`,
        sender: 'target',
        senderName: task.currentMerchant?.name || '商户坐席',
        content: `收到，卡单 [${task.id}] 正在通过官方渠道加急查验中，请客服放心。`,
        time: nowTime,
      });
    } else {
      const handler = getTaskHandler(task);
      initialMessages.push({
        id: `msg-${Date.now() + 1}`,
        sender: 'target',
        senderName: handler?.name || '青青',
        content: `你好，这笔卡单目前由我负责跟踪。已核验卡图和申报面额，正在等待渠道最终回执。`,
        time: nowTime,
      });
    }

    setActiveChatSession({
      type,
      taskId: task.id,
      targetName,
      targetSub,
      task,
    });
    setIsChatMinimized(false);
    setChatMessages(initialMessages);
    setChatInputText('');
  };

  const handleSendChatMessage = () => {
    if (!chatInputText.trim() || !activeChatSession) return;
    const content = chatInputText.trim();
    const nowTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessageItem = {
      id: `self-${Date.now()}`,
      sender: 'self',
      senderName: '人工客服',
      content,
      time: nowTime,
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInputText('');

    setTimeout(() => {
      const replyTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      let replyText = '好的，已收到您的信息，正在同步跟进处理！';
      if (activeChatSession.type === 'user') {
        replyText = '好的客服，谢谢您帮忙催单，我随时关注系统通知！';
      } else if (activeChatSession.type === 'merchant') {
        replyText = '收到客服提醒，已将本单提权至优先核销队列！';
      } else {
        replyText = '明白，我这边立即核实并更新处理状态。';
      }

      setChatMessages(prev => [
        ...prev,
        {
          id: `reply-${Date.now()}`,
          sender: 'target',
          senderName: activeChatSession.targetName.replace(/^.+?：/, ''),
          content: replyText,
          time: replyTime,
        },
      ]);
    }, 900);
  };

  const getQuickPhrases = (type: ChatTargetType) => {
    if (type === 'user') {
      return [
        '您好，已为您加急催促商户核销，请稍候！',
        '请您补充上传卡图正面完整且无反光的清晰照片。',
        '经核验该卡密已被兑换，请核对卡密是否误用。',
        '卡单已核销成功，款项已释放至您的钱包！',
      ];
    }
    if (type === 'merchant') {
      return [
        '商户您好，该单已进入超时预警，请优先完成核销回执！',
        '用户反馈卡密有效，请提供官方通道兑换时间凭证截图。',
        '如当前无法处理请及时驳回或转交，避免触发质押金扣罚。',
      ];
    }
    return [
      '收到，请核实该卡单的最新核销时间节点并同步举证。',
      '该卡单用户已在催单，处理完成后请及时同步状态。',
      '已标记协同复核，请注意SLA超时风险！',
    ];
  };

  // 人工派单表单状态
  const [dispatchMerchantId, setDispatchMerchantId] = useState<string>('fallback');
  const [dispatchAssignCs, setDispatchAssignCs] = useState<'yes' | 'no'>('no');
  const [dispatchCsValue, setDispatchCsValue] = useState<string>('');
  const [dispatchCsError, setDispatchCsError] = useState<string | null>(null);

  // 转单表单状态
  const [transferCsId, setTransferCsId] = useState<string>('');
  const [transferCsError, setTransferCsError] = useState<string | null>(null);

  // 撤回卡单表单状态
  const [recallReasonInput, setRecallReasonInput] = useState<string>('');
  const [recallReasonError, setRecallReasonError] = useState<string | null>(null);

  // 手动延迟表单状态
  const [manualDelayMinutesInput, setManualDelayMinutesInput] = useState<string>('5');
  const [manualDelayReasonInput, setManualDelayReasonInput] = useState<string>('');
  const [manualDelayImages, setManualDelayImages] = useState<
    Array<{ id: string; name: string; size: string; dataUrl: string }>
  >([]);
  const [manualDelayError, setManualDelayError] = useState<string | null>(null);
  const [manualDelayImageError, setManualDelayImageError] = useState<string | null>(null);
  const manualDelayFileInputRef = useRef<HTMLInputElement | null>(null);

  // 直接处理表单状态 (两步处理逻辑: 第一步单选处理结果，第二步分支处理)
  const [directProcessStep, setDirectProcessStep] = useState<1 | 2>(1);
  const [directProcessResult, setDirectProcessResult] = useState<'success' | 'failure'>('success');
  const [directProcessCardCodes, setDirectProcessCardCodes] = useState<string>('');
  const [directProcessCardCodesError, setDirectProcessCardCodesError] = useState<string | null>(null);
  const [directProcessNote, setDirectProcessNote] = useState<string>('');
  const [directProcessNoteError, setDirectProcessNoteError] = useState<string | null>(null);
  const [directProcessImages, setDirectProcessImages] = useState<
    Array<{ id: string; name: string; size: string; dataUrl: string }>
  >([]);
  const [directProcessImageError, setDirectProcessImageError] = useState<string | null>(null);
  const directProcessFileInputRef = useRef<HTMLInputElement | null>(null);

  // 计算卡代码有效行数
  const directProcessLineCount = useMemo(() => {
    if (!directProcessCardCodes.trim()) return 0;
    return directProcessCardCodes.split('\n').filter(line => line.trim().length > 0).length;
  }, [directProcessCardCodes]);

  const handleDirectProcessCardCodesChange = (val: string) => {
    setDirectProcessCardCodes(val);
    const count = val.trim() ? val.split('\n').filter(line => line.trim().length > 0).length : 0;
    if (count > 100) {
      setDirectProcessCardCodesError('卡代码数量已超过 100 行上限，请删减');
    } else {
      setDirectProcessCardCodesError(null);
    }
  };

  const handleDirectProcessNoteChange = (val: string) => {
    if (val.length > 1000) val = val.slice(0, 1000);
    const hasNonEnglish = /[^\x00-\x7F]/.test(val);
    setDirectProcessNote(val);
    setDirectProcessNoteError(hasNonEnglish ? '选填，仅支持输入英文（英文字母、数字、标点及空格）' : null);
  };

  const handleProcessDirectImages = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validExtensions = ['image/png', 'image/jpeg', 'image/jpg'];
    const currentCount = directProcessImages.length;
    if (currentCount >= 12) {
      triggerToast('图片最多支持上传 12 张');
      return;
    }

    const availableSlots = 12 - currentCount;
    const filesToProcess = fileArray.slice(0, availableSlots);
    if (fileArray.length > availableSlots) {
      triggerToast(`已达到 12 张上限，本次仅添加前 ${availableSlots} 张`);
    }

    let hasInvalid = false;
    filesToProcess.forEach(file => {
      const fileName = file.name.toLowerCase();
      const isValid =
        validExtensions.includes(file.type) ||
        fileName.endsWith('.png') ||
        fileName.endsWith('.jpg') ||
        fileName.endsWith('.jpeg');

      if (!isValid) {
        hasInvalid = true;
        return;
      }

      const reader = new FileReader();
      reader.onload = e => {
        const dataUrl = e.target?.result as string;
        const sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
        const newImg = {
          id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          size: sizeStr,
          dataUrl,
        };

        setDirectProcessImages(prev => {
          if (prev.length >= 12) return prev;
          return [...prev, newImg];
        });
        setDirectProcessImageError(null);
      };
      reader.readAsDataURL(file);
    });

    if (hasInvalid) {
      setDirectProcessImageError('部分文件格式不支持，请上传 png/jpg/jpeg 格式');
    }
  };

  const handleDirectProcessRemoveImage = (imgId: string) => {
    setDirectProcessImages(prev => prev.filter(img => img.id !== imgId));
  };

  const handleDirectProcessFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessDirectImages(e.target.files);
      e.target.value = '';
    }
  };

  const handleProcessManualDelayImages = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validExtensions = ['image/png', 'image/jpeg', 'image/jpg'];
    const currentCount = manualDelayImages.length;
    if (currentCount >= 12) {
      triggerToast('举证图最多支持上传 12 张');
      return;
    }

    const availableSlots = 12 - currentCount;
    const filesToProcess = fileArray.slice(0, availableSlots);

    let hasInvalid = false;
    filesToProcess.forEach(file => {
      const fileName = file.name.toLowerCase();
      const isValid =
        validExtensions.includes(file.type) ||
        fileName.endsWith('.png') ||
        fileName.endsWith('.jpg') ||
        fileName.endsWith('.jpeg');

      if (!isValid) {
        hasInvalid = true;
        return;
      }

      const reader = new FileReader();
      reader.onload = ev => {
        const dataUrl = ev.target?.result as string;
        const sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
        const newImg = {
          id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          size: sizeStr,
          dataUrl,
        };
        setManualDelayImages(prev => (prev.length >= 12 ? prev : [...prev, newImg]));
        setManualDelayImageError(null);
      };
      reader.readAsDataURL(file);
    });

    if (hasInvalid) {
      setManualDelayImageError('部分文件格式不支持，请上传 png/jpg/jpeg 格式');
    }
  };

  const handleManualDelayRemoveImage = (imgId: string) => {
    setManualDelayImages(prev => prev.filter(img => img.id !== imgId));
  };

  const handleManualDelayFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessManualDelayImages(e.target.files);
      e.target.value = '';
    }
  };

  const handleDirectProcessDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessDirectImages(e.dataTransfer.files);
    }
  };

  const handleDirectProcessPaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const files: File[] = [];
      for (let i = 0; i < e.clipboardData.files.length; i++) {
        const file = e.clipboardData.files[i];
        if (file.type.startsWith('image/')) {
          files.push(file);
        }
      }
      if (files.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        handleProcessDirectImages(files);
      }
    }
  };

  // 直接处理 - 处理失败表单状态 (重要提示、卡代码选填、失败原因下拉单选必填、英文备注选填、举证图多张必填)
  const [directProcessFailCardCodes, setDirectProcessFailCardCodes] = useState<string>('');
  const [directProcessFailCardCodesError, setDirectProcessFailCardCodesError] = useState<string | null>(null);
  const [directProcessFailReason, setDirectProcessFailReason] = useState<string>('');
  const [directProcessFailReasonError, setDirectProcessFailReasonError] = useState<string | null>(null);
  const [directProcessFailNote, setDirectProcessFailNote] = useState<string>('');
  const [directProcessFailNoteError, setDirectProcessFailNoteError] = useState<string | null>(null);
  const [directProcessFailImages, setDirectProcessFailImages] = useState<
    Array<{ id: string; name: string; size: string; dataUrl: string }>
  >([]);
  const [directProcessFailImageError, setDirectProcessFailImageError] = useState<string | null>(null);
  const directProcessFailFileInputRef = useRef<HTMLInputElement | null>(null);

  // 计算处理失败卡代码有效行数
  const directProcessFailLineCount = useMemo(() => {
    if (!directProcessFailCardCodes.trim()) return 0;
    return directProcessFailCardCodes.split('\n').filter(line => line.trim().length > 0).length;
  }, [directProcessFailCardCodes]);

  const handleDirectProcessFailCardCodesChange = (val: string) => {
    setDirectProcessFailCardCodes(val);
    const count = val.trim() ? val.split('\n').filter(line => line.trim().length > 0).length : 0;
    if (count > 100) {
      setDirectProcessFailCardCodesError('卡代码数量已超过 100 行上限，请删减');
    } else {
      setDirectProcessFailCardCodesError(null);
    }
  };

  const handleDirectProcessFailNoteChange = (val: string) => {
    if (val.length > 1000) val = val.slice(0, 1000);
    const hasNonEnglish = /[^\x00-\x7F]/.test(val);
    setDirectProcessFailNote(val);
    setDirectProcessFailNoteError(hasNonEnglish ? '选填，仅支持输入英文（英文字母、数字、标点及空格）' : null);
  };

  const handleProcessDirectFailImages = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validExtensions = ['image/png', 'image/jpeg', 'image/jpg'];
    const currentCount = directProcessFailImages.length;
    if (currentCount >= 12) {
      triggerToast('举证图最多支持上传 12 张');
      return;
    }

    const availableSlots = 12 - currentCount;
    const filesToProcess = fileArray.slice(0, availableSlots);
    if (fileArray.length > availableSlots) {
      triggerToast(`已达到 12 张上限，本次仅添加前 ${availableSlots} 张`);
    }

    let hasInvalid = false;
    filesToProcess.forEach(file => {
      const fileName = file.name.toLowerCase();
      const isValid =
        validExtensions.includes(file.type) ||
        fileName.endsWith('.png') ||
        fileName.endsWith('.jpg') ||
        fileName.endsWith('.jpeg');

      if (!isValid) {
        hasInvalid = true;
        return;
      }

      const reader = new FileReader();
      reader.onload = e => {
        const dataUrl = e.target?.result as string;
        const sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
        const newImg = {
          id: `img_fail_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          size: sizeStr,
          dataUrl,
        };

        setDirectProcessFailImages(prev => {
          if (prev.length >= 12) return prev;
          return [...prev, newImg];
        });
        setDirectProcessFailImageError(null);
      };
      reader.readAsDataURL(file);
    });

    if (hasInvalid) {
      setDirectProcessFailImageError('部分文件格式不支持，请上传 png/jpg/jpeg 格式');
    }
  };

  const handleDirectProcessFailRemoveImage = (imgId: string) => {
    setDirectProcessFailImages(prev => prev.filter(img => img.id !== imgId));
  };

  const handleDirectProcessFailFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessDirectFailImages(e.target.files);
      e.target.value = '';
    }
  };

  const handleDirectProcessFailDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessDirectFailImages(e.dataTransfer.files);
    }
  };

  const handleDirectProcessFailPaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const files: File[] = [];
      for (let i = 0; i < e.clipboardData.files.length; i++) {
        const file = e.clipboardData.files[i];
        if (file.type.startsWith('image/')) {
          files.push(file);
        }
      }
      if (files.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        handleProcessDirectFailImages(files);
      }
    }
  };

  // 修改卡信息表单状态 (卡类型、国家、介质、速度、面额、数量、收卡报价、联动成交报价、脱敏代码卡图、英文备注、举证图)
  const [editCardStep, setEditCardStep] = useState<1 | 2>(1); // 步骤 1: 录入修改信息; 步骤 2: 核对变更对比项
  const [editCardType, setEditCardType] = useState<string>('Steam');
  const [editCountry, setEditCountry] = useState<string>('US');
  const [editMediaType, setEditMediaType] = useState<string>('电子码');
  const [editSpeed, setEditSpeed] = useState<string>('快卡');
  const [editFaceValue, setEditFaceValue] = useState<string>('100');
  const [editFaceValueError, setEditFaceValueError] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<string>('1');
  const [editQuantityError, setEditQuantityError] = useState<string | null>(null);
  const [editPurchaseRate, setEditPurchaseRate] = useState<string>('7.3500');
  const [editPurchaseRateError, setEditPurchaseRateError] = useState<string | null>(null);
  const [editShowCodesPlain, setEditShowCodesPlain] = useState<Record<string, boolean>>({});
  const [editVouchersExpanded, setEditVouchersExpanded] = useState<Record<string, boolean>>({}); // 各分类是否展开 (默认展示3条)
  const [isVouchersModuleExpanded, setIsVouchersModuleExpanded] = useState<boolean>(false); // 整个卡图卡密凭证模块默认收起
  const [traceModal, setTraceModal] = useState<{ isOpen: boolean; cardId: string; cardName: string } | null>(null);
  const [isCardCheckExpanded, setIsCardCheckExpanded] = useState<boolean>(false); // Card Check 明细模块默认收起
  const [isOrderTrajectoryExpanded, setIsOrderTrajectoryExpanded] = useState<boolean>(true); // 卡单轨迹详情模块默认展开
  const [trajectoryPage, setTrajectoryPage] = useState<number>(1);
  const [trajectoryPageSize, setTrajectoryPageSize] = useState<number>(10);
  const [editCardNote, setEditCardNote] = useState<string>('');
  const [editCardNoteError, setEditCardNoteError] = useState<string | null>(null);
  const [editCardImages, setEditCardImages] = useState<
    Array<{ id: string; name: string; size: string; dataUrl: string }>
  >([]);
  const [editCardImageError, setEditCardImageError] = useState<string | null>(null);
  const [editCardGeneralError, setEditCardGeneralError] = useState<string | null>(null);
  const editCardFileInputRef = useRef<HTMLInputElement | null>(null);

  // 用户成交报价联动自动计算:
  // 计算规则: 用户成交报价 = 收卡报价（1-5%）* 200，单位是奈拉 (向上取整 Math.ceil)，同时计算人民币 (保留4位小数)
  // 展示样式: ￥6.9800/₦1380
  const calculatedUserDealQuote = useMemo(() => {
    const rate = parseFloat(editPurchaseRate);
    if (!editPurchaseRate.trim() || isNaN(rate) || rate <= 0) {
      return {
        rmb: '0.0000',
        naira: 0,
        formatted: '￥0.0000/₦0',
        isValid: false,
      };
    }
    const rmbVal = (rate * 0.95).toFixed(4);
    // 奈拉计算结果: 向上取整 Math.ceil
    const nairaVal = Math.ceil(rate * 0.95 * 200);
    return {
      rmb: rmbVal,
      naira: nairaVal,
      formatted: `￥${rmbVal}/₦${nairaVal}`,
      isValid: true,
    };
  }, [editPurchaseRate]);

  // 卡图卡密凭证状态控制 (单条点击查看/隐藏)
  const handleToggleEditCode = (codeId: string) => {
    setEditShowCodesPlain(prev => ({
      ...prev,
      [codeId]: !prev[codeId],
    }));
  };

  const handleToggleVoucherCategory = (categoryKey: string) => {
    setEditVouchersExpanded(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey],
    }));
  };

  const handleCopyAllEditCodes = () => {
    const text = MOCK_EDIT_CARD_CODES.map(c => c.code).join('\n');
    navigator.clipboard?.writeText(text);
    triggerToast(`已复制全部 ${MOCK_EDIT_CARD_CODES.length} 组卡代码`);
  };

  // 拆单 (Split Order) 表单交互状态 (两步流：步骤1录入，步骤2二次确认核对)
  const [splitOrderStep, setSplitOrderStep] = useState<1 | 2>(1);
  const [splitSelectedImageIds, setSplitSelectedImageIds] = useState<string[]>([]);
  const [splitCardType, setSplitCardType] = useState<string>('Apple Gift Card');
  const [splitCountry, setSplitCountry] = useState<string>('US');
  const [splitMediaType, setSplitMediaType] = useState<string>('卡图');
  const [splitSpeed, setSplitSpeed] = useState<string>('快卡');
  const [splitFaceValue, setSplitFaceValue] = useState<string>('100');
  const [splitFaceValueError, setSplitFaceValueError] = useState<string | null>(null);
  const [splitQuantity, setSplitQuantity] = useState<string>('1');
  const [splitQuantityError, setSplitQuantityError] = useState<string | null>(null);
  const [splitPurchaseRate, setSplitPurchaseRate] = useState<string>('7.9200');
  const [splitPurchaseRateError, setSplitPurchaseRateError] = useState<string | null>(null);
  const [splitShowCodesPlain, setSplitShowCodesPlain] = useState<Record<string, boolean>>({});
  const [splitNote, setSplitNote] = useState<string>('');
  const [splitGeneralError, setSplitGeneralError] = useState<string | null>(null);
  const [splitNewOrderId, setSplitNewOrderId] = useState<string>('ASPL09KW12');

  // 新增卡单用户成交报价联动自动计算 (与修改卡信息完全一致)
  const calculatedSplitUserDealQuote = useMemo(() => {
    const rate = parseFloat(splitPurchaseRate);
    if (!splitPurchaseRate.trim() || isNaN(rate) || rate <= 0) {
      return {
        rmb: '0.0000',
        naira: 0,
        formatted: '￥0.0000/₦0',
        isValid: false,
      };
    }
    const rmbVal = (rate * 0.95).toFixed(4);
    const nairaVal = Math.ceil(rate * 0.95 * 200);
    return {
      rmb: rmbVal,
      naira: nairaVal,
      formatted: `￥${rmbVal}/₦${nairaVal}`,
      isValid: true,
    };
  }, [splitPurchaseRate]);

  const handleToggleSplitCode = (codeId: string) => {
    setSplitShowCodesPlain(prev => ({
      ...prev,
      [codeId]: !prev[codeId],
    }));
  };

  const handleSplitOrderProceedToReview = () => {
    if (!cardActionModal || cardActionModal.type !== 'splitOrder') return;
    const task = cardActionModal.task;
    const origItems = getTaskCardItems(task);

    // 1. 验证选中的卡图数量 (来源必须是原单图片中选择，至少选1张，且原单需至少保留1张)
    if (splitSelectedImageIds.length === 0) {
      setSplitGeneralError('请至少勾选 1 张原单图片凭证划入新卡单');
      return;
    }
    if (splitSelectedImageIds.length >= origItems.length) {
      setSplitGeneralError('原卡单需至少保留 1 张卡图，不能将全部图片拆出（如需全部转出请使用转单功能）');
      return;
    }

    // 2. 验证面额
    const fv = parseFloat(splitFaceValue);
    if (!splitFaceValue.trim() || isNaN(fv) || fv <= 0) {
      setSplitFaceValueError('请输入有效的面额数值（大于0）');
      return;
    }

    // 3. 验证数量
    const qty = parseInt(splitQuantity, 10);
    if (!splitQuantity.trim() || isNaN(qty) || qty <= 0) {
      setSplitQuantityError('请输入有效的卡数量');
      return;
    }

    // 4. 验证收卡报价
    const pr = parseFloat(splitPurchaseRate);
    if (!splitPurchaseRate.trim() || isNaN(pr) || pr <= 0) {
      setSplitPurchaseRateError('请输入有效的收卡报价（大于0）');
      return;
    }

    setSplitFaceValueError(null);
    setSplitQuantityError(null);
    setSplitPurchaseRateError(null);
    setSplitGeneralError(null);
    setSplitOrderStep(2);
  };

  const handleEditFaceValueChange = (val: string) => {
    setEditFaceValue(val);
    setEditCardGeneralError(null);
    const num = parseFloat(val);
    if (!val.trim()) {
      setEditFaceValueError('请输入卡面值（必填项）');
    } else if (isNaN(num) || num <= 0) {
      setEditFaceValueError('卡面值必须为大于 0 的有效数值');
    } else if (num > 5000) {
      setEditFaceValueError('卡面值最大值为 5000');
    } else if (!/^\d+(\.\d{1,2})?$/.test(val)) {
      setEditFaceValueError('卡面值最多支持两位小数');
    } else {
      setEditFaceValueError(null);
    }
  };

  const handleEditQuantityChange = (val: string) => {
    setEditQuantity(val);
    setEditCardGeneralError(null);
    const num = parseInt(val, 10);
    if (!val.trim()) {
      setEditQuantityError('请输入卡数量（必填项）');
    } else if (isNaN(num) || num <= 0) {
      setEditQuantityError('卡数量必须为大于 0 的整数');
    } else if (num > 20) {
      setEditQuantityError('卡数量最大值为 20');
    } else if (!/^\d+$/.test(val)) {
      setEditQuantityError('卡数量必须为整数');
    } else {
      setEditQuantityError(null);
    }
  };

  const handleEditPurchaseRateChange = (val: string) => {
    setEditPurchaseRate(val);
    setEditCardGeneralError(null);
    const num = parseFloat(val);
    if (!val.trim()) {
      setEditPurchaseRateError('请输入收卡报价（必填项）');
    } else if (isNaN(num) || num <= 0) {
      setEditPurchaseRateError('收卡报价必须为大于 0 的有效数值');
    } else if (num > 20) {
      setEditPurchaseRateError('收卡报价最大值为 20');
    } else if (!/^\d+(\.\d{1,4})?$/.test(val)) {
      setEditPurchaseRateError('收卡报价最多支持录入到小数点后四位');
    } else {
      setEditPurchaseRateError(null);
    }
  };

  const handleEditNoteChange = (val: string) => {
    if (val.length > 1000) val = val.slice(0, 1000);
    setEditCardNote(val);
    setEditCardGeneralError(null);
    const hasChineseOrNonEnglish = /[^\x00-\x7F]/.test(val);
    setEditCardNoteError(hasChineseOrNonEnglish ? '非必填，仅支持输入英文，不支持输入汉字' : null);
  };

  // 点击「保存修改并核对」进入第二步对比视图
  const handleEditCardProceedToReview = () => {
    if (!cardActionModal || cardActionModal.type !== 'editCard') return;

    // 1. 校验面额
    const parsedFaceValue = parseFloat(editFaceValue);
    if (!editFaceValue.trim() || isNaN(parsedFaceValue) || parsedFaceValue <= 0) {
      setEditFaceValueError('请输入有效的大于 0 的卡面值');
      triggerToast('请输入有效的大于 0 的卡面值');
      return;
    }
    if (parsedFaceValue > 5000) {
      setEditFaceValueError('卡面值最大值为 5000');
      triggerToast('卡面值最大值为 5000');
      return;
    }
    if (!/^\d+(\.\d{1,2})?$/.test(editFaceValue)) {
      setEditFaceValueError('卡面值最多支持两位小数');
      triggerToast('卡面值最多支持两位小数');
      return;
    }

    // 2. 校验数量
    const parsedQuantity = parseInt(editQuantity, 10);
    if (!editQuantity.trim() || isNaN(parsedQuantity) || parsedQuantity <= 0) {
      setEditQuantityError('请输入卡数量（大于 0 的整数）');
      triggerToast('请输入卡数量（大于 0 的整数）');
      return;
    }
    if (parsedQuantity > 20) {
      setEditQuantityError('卡数量最大值为 20');
      triggerToast('卡数量最大值为 20');
      return;
    }

    // 3. 校验收卡报价
    const parsedPurchaseRate = parseFloat(editPurchaseRate);
    if (!editPurchaseRate.trim() || isNaN(parsedPurchaseRate) || parsedPurchaseRate <= 0) {
      setEditPurchaseRateError('请输入收卡报价（大于 0 的有效数值）');
      triggerToast('请输入收卡报价');
      return;
    }
    if (parsedPurchaseRate > 20) {
      setEditPurchaseRateError('收卡报价最大值为 20');
      triggerToast('收卡报价最大值为 20');
      return;
    }
    if (!/^\d+(\.\d{1,4})?$/.test(editPurchaseRate)) {
      setEditPurchaseRateError('收卡报价最多支持录入到小数点后四位');
      triggerToast('收卡报价最多支持录入到小数点后四位');
      return;
    }

    // 4. 校验备注: 仅支持英文
    if (editCardNote && /[^\x00-\x7F]/.test(editCardNote)) {
      setEditCardNoteError('非必填，仅支持输入英文，不支持输入汉字');
      triggerToast('备注仅支持输入英文，不支持输入汉字');
      return;
    }

    // 5. 关键业务规则: 如果卡单发生了修改，那么 备注内容和举证图是二选一必填项
    const origTask = cardActionModal.task;
    const origMediaType = origTask.mediaTypeLabel || (origTask.cardDetails?.imageReflections ? '卡图' : '电子码');
    const origSpeed = origTask.speedTag || '快卡';
    const origRateNum = origTask.merchantQuote ? parseFloat(origTask.merchantQuote.replace(/[^\d.]/g, '')) : 7.35;

    const isCardModified =
      editCardType !== origTask.cardType ||
      editCountry !== origTask.country ||
      editMediaType !== origMediaType ||
      editSpeed !== origSpeed ||
      parsedFaceValue !== origTask.faceValue ||
      parsedQuantity !== (origTask.cardQuantity || 1) ||
      Math.abs(parsedPurchaseRate - origRateNum) > 0.00001;

    const hasNote = editCardNote.trim().length > 0;
    const hasImages = editCardImages.length > 0;

    if (isCardModified && !hasNote && !hasImages) {
      setEditCardGeneralError('若卡单信息或报价发生修改，备注内容与举证图二选一必填');
      triggerToast('若卡单信息或报价发生修改，备注内容与举证图二选一必填');
      return;
    }

    setEditCardGeneralError(null);
    setEditCardStep(2);
  };

  const handleProcessEditCardImages = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validExtensions = ['image/png', 'image/jpeg', 'image/jpg'];
    const currentCount = editCardImages.length;
    if (currentCount >= 12) {
      triggerToast('举证图最多支持上传 12 张');
      return;
    }

    const availableSlots = 12 - currentCount;
    const filesToProcess = fileArray.slice(0, availableSlots);
    if (fileArray.length > availableSlots) {
      triggerToast(`已达到 12 张上限，本次仅添加前 ${availableSlots} 张`);
    }

    let hasInvalid = false;
    filesToProcess.forEach(file => {
      const fileName = file.name.toLowerCase();
      const isValid =
        validExtensions.includes(file.type) ||
        fileName.endsWith('.png') ||
        fileName.endsWith('.jpg') ||
        fileName.endsWith('.jpeg');

      if (!isValid) {
        hasInvalid = true;
        return;
      }

      const reader = new FileReader();
      reader.onload = e => {
        const dataUrl = e.target?.result as string;
        const sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
        const newImg = {
          id: `img_edit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          size: sizeStr,
          dataUrl,
        };

        setEditCardImages(prev => {
          if (prev.length >= 12) return prev;
          return [...prev, newImg];
        });
        setEditCardImageError(null);
        setEditCardGeneralError(null);
      };
      reader.readAsDataURL(file);
    });

    if (hasInvalid) {
      setEditCardImageError('部分文件格式不支持，请上传 png/jpg/jpeg 格式');
    }
  };

  const handleEditCardRemoveImage = (imgId: string) => {
    setEditCardImages(prev => prev.filter(img => img.id !== imgId));
  };

  const handleEditCardFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessEditCardImages(e.target.files);
      e.target.value = '';
    }
  };

  const handleEditCardDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessEditCardImages(e.dataTransfer.files);
    }
  };

  const handleEditCardPaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const files: File[] = [];
      for (let i = 0; i < e.clipboardData.files.length; i++) {
        const file = e.clipboardData.files[i];
        if (file.type.startsWith('image/')) {
          files.push(file);
        }
      }
      if (files.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        handleProcessEditCardImages(files);
      }
    }
  };

  // 同步用户信息表单状态 (默认信息1不可删，最多5条，举证图支持最多12张)
  const [syncUserItems, setSyncUserItems] = useState<SyncUserInfoItem[]>([
    {
      id: 'sync_1',
      type: '无效卡同步',
      content: '',
      proofImages: [],
    },
  ]);
  const [previewImageModal, setPreviewImageModal] = useState<{ url: string; title: string } | null>(null);
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const handleAddSyncItem = () => {
    if (syncUserItems.length >= 5) {
      triggerToast('最多支持同时同步 5 条信息');
      return;
    }
    setSyncUserItems(prev => [
      ...prev,
      {
        id: `sync_${Date.now()}_${prev.length + 1}`,
        type: '无效卡同步',
        content: '',
        proofImages: [],
      },
    ]);
  };

  const handleDeleteSyncItem = (index: number) => {
    if (index === 0) return; // 默认展示信息1 ，不可删除
    setSyncUserItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSyncTypeChange = (index: number, type: SyncUserInfoType) => {
    setSyncUserItems(prev =>
      prev.map((item, idx) => (idx === index ? { ...item, type } : item))
    );
  };

  const handleSyncContentChange = (index: number, val: string) => {
    if (val.length > 1000) val = val.slice(0, 1000);
    const hasNonEnglish = /[^\x00-\x7F]/.test(val);
    setSyncUserItems(prev =>
      prev.map((item, idx) => {
        if (idx === index) {
          return {
            ...item,
            content: val,
            contentError: hasNonEnglish ? '仅支持输入英文（英文字母、数字、标点及空格）' : null,
          };
        }
        return item;
      })
    );
  };

  const handleProcessSyncImages = (index: number, files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validExtensions = ['image/png', 'image/jpeg', 'image/jpg'];
    const currentItem = syncUserItems[index];
    if (!currentItem) return;

    const currentCount = currentItem.proofImages.length;
    if (currentCount >= 12) {
      triggerToast('每条信息举证图最多支持上传 12 张');
      return;
    }

    const availableSlots = 12 - currentCount;
    const filesToProcess = fileArray.slice(0, availableSlots);
    if (fileArray.length > availableSlots) {
      triggerToast(`已达到 12 张上限，本次仅添加前 ${availableSlots} 张`);
    }

    let hasInvalid = false;
    filesToProcess.forEach(file => {
      const fileName = file.name.toLowerCase();
      const isValid =
        validExtensions.includes(file.type) ||
        fileName.endsWith('.png') ||
        fileName.endsWith('.jpg') ||
        fileName.endsWith('.jpeg');

      if (!isValid) {
        hasInvalid = true;
        return;
      }

      const reader = new FileReader();
      reader.onload = e => {
        const dataUrl = e.target?.result as string;
        const sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
        const newImg: SyncUserProofImage = {
          id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          size: sizeStr,
          dataUrl,
        };

        setSyncUserItems(prev =>
          prev.map((it, idx) => {
            if (idx === index) {
              if (it.proofImages.length >= 12) return it;
              return {
                ...it,
                proofImages: [...it.proofImages, newImg],
                imageError: null,
              };
            }
            return it;
          })
        );
      };
      reader.readAsDataURL(file);
    });

    if (hasInvalid) {
      setSyncUserItems(prev =>
        prev.map((it, idx) =>
          idx === index
            ? { ...it, imageError: '部分文件格式不支持，请上传 png/jpg/jpeg 格式' }
            : it
        )
      );
    }
  };

  const handleSyncRemoveImage = (index: number, imageId: string) => {
    setSyncUserItems(prev =>
      prev.map((it, idx) =>
        idx === index
          ? {
              ...it,
              proofImages: it.proofImages.filter(img => img.id !== imageId),
              imageError: null,
            }
          : it
      )
    );
  };

  const handleSyncFileInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessSyncImages(index, e.target.files);
    }
    e.target.value = '';
  };

  const handleSyncDrop = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessSyncImages(index, e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSyncContainerPaste = (index: number, e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const files: File[] = [];
      for (let i = 0; i < e.clipboardData.files.length; i++) {
        const file = e.clipboardData.files[i];
        if (file.type.startsWith('image/')) {
          files.push(file);
        }
      }
      if (files.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        handleProcessSyncImages(index, files);
      }
    }
  };

  // 排序规则：兜底商户不论状态固定第一位，正常商户其次，非正常商户置灰置底
  const sortedDispatchMerchants = useMemo(() => {
    return [...DISPATCH_MERCHANT_LIST].sort((a, b) => {
      if (a.isFallback) return -1;
      if (b.isFallback) return 1;
      if (a.isNormal && !b.isNormal) return -1;
      if (!a.isNormal && b.isNormal) return 1;
      return 0;
    });
  }, []);

  const currentSelectedMerchant = useMemo(() => {
    return DISPATCH_MERCHANT_LIST.find(m => m.id === dispatchMerchantId);
  }, [dispatchMerchantId]);

  // 转单可选客服列表：只能选择“开启工作状态”的客服，且排除当前正在处理该卡单的客服
  const availableTransferCsList = useMemo(() => {
    return PLATFORM_CUSTOMER_SERVICES.filter(cs => {
      // 1. 只能选择“开启工作状态”的客服
      if (!cs.isWorking) return false;
      // 2. 排除当前正在处理该单的客服本人 (避免转给自己)
      if (
        cardActionModal?.task?.assignedCs &&
        (cardActionModal.task.assignedCs.id === cs.id || cardActionModal.task.assignedCs.email === cs.email)
      ) {
        return false;
      }
      return true;
    });
  }, [cardActionModal]);

  // 点击空白处收起「更多」下拉菜单
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdownOrderId(null);
    };
    if (activeDropdownOrderId) {
      window.addEventListener('click', handleClickOutside);
      return () => window.removeEventListener('click', handleClickOutside);
    }
  }, [activeDropdownOrderId]);

  // 当操作弹窗或大图预览开启时，锁定底层页面滚动，防止蒙层背景产生联动滑动
  useEffect(() => {
    if (cardActionModal || previewImageModal) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [cardActionModal, previewImageModal]);

  const handleOpenCardActionModal = (type: CardActionModalType, task: CardOrderTask) => {
    setActiveDropdownOrderId(null);
    if (type === 'dispatch') {
      setDispatchMerchantId('fallback');
      setDispatchAssignCs('no');
      setDispatchCsValue('');
      setDispatchCsError(null);
    } else if (type === 'transfer') {
      setTransferCsId('');
      setTransferCsError(null);
    } else if (type === 'recall') {
      setRecallReasonInput('');
      setRecallReasonError(null);
    } else if (type === 'manualDelay') {
      setManualDelayMinutesInput('10');
      setManualDelayReasonInput('');
      setManualDelayImages([]);
      setManualDelayError(null);
      setManualDelayImageError(null);
    } else if (type === 'directProcess') {
      setDirectProcessStep(1);
      setDirectProcessResult('success');
      setDirectProcessCardCodes(task.cardDetails?.cardCode || 'STM-UK-9921-X992-0012');
      setDirectProcessCardCodesError(null);
      setDirectProcessNote('');
      setDirectProcessNoteError(null);
      setDirectProcessImages([]);
      setDirectProcessImageError(null);
      setDirectProcessFailCardCodes('');
      setDirectProcessFailCardCodesError(null);
      setDirectProcessFailReason('');
      setDirectProcessFailReasonError(null);
      setDirectProcessFailNote('');
      setDirectProcessFailNoteError(null);
      setDirectProcessFailImages([]);
      setDirectProcessFailImageError(null);
    } else if (type === 'syncUser') {
      setSyncUserItems([
        {
          id: `sync_${Date.now()}_1`,
          type: '无效卡同步',
          content: '',
          proofImages: [],
        },
      ]);
    } else if (type === 'editCard') {
      setEditCardStep(1);
      setEditCardType(task.cardType || 'Steam');
      setEditCountry(task.country || 'US');
      setEditMediaType(task.mediaTypeLabel || (task.cardDetails?.imageReflections ? '卡图' : '电子码'));
      setEditSpeed(task.speedTag || '快卡');
      setEditFaceValue(String(task.faceValue || 100));
      setEditFaceValueError(null);
      setEditQuantity(String(task.cardQuantity || 1));
      setEditQuantityError(null);
      const initRateNum = task.merchantQuote ? parseFloat(task.merchantQuote.replace(/[^\d.]/g, '')) : 7.92;
      setEditPurchaseRate(isNaN(initRateNum) || initRateNum <= 0 ? '7.9200' : initRateNum.toFixed(4));
      setEditPurchaseRateError(null);
      setEditShowCodesPlain({});
      setEditVouchersExpanded({});
      setEditCardNote('');
      setEditCardNoteError(null);
      setEditCardImages([]);
      setEditCardImageError(null);
      setEditCardGeneralError(null);
    } else if (type === 'splitOrder') {
      const items = getTaskCardItems(task);
      setSplitOrderStep(1);
      // 默认选中最后 1 张卡图划入新单（保证原单至少留 1 张，新单至少有 1 张）
      const initialSelected = items.length > 1 ? [items[items.length - 1].id] : (items.length === 1 ? [items[0].id] : []);
      setSplitSelectedImageIds(initialSelected);
      setSplitCardType(task.cardType || 'Apple Gift Card');
      setSplitCountry(task.country || 'US');
      setSplitMediaType(task.mediaTypeLabel || '卡图');
      setSplitSpeed(task.speedTag || '快卡');
      setSplitFaceValue(String(task.faceValue || 100));
      setSplitFaceValueError(null);
      setSplitQuantity(String(initialSelected.length || 1));
      setSplitQuantityError(null);
      const initRateNum = task.merchantQuote ? parseFloat(task.merchantQuote.replace(/[^\d.]/g, '')) : 7.92;
      setSplitPurchaseRate(isNaN(initRateNum) || initRateNum <= 0 ? '7.9200' : initRateNum.toFixed(4));
      setSplitPurchaseRateError(null);
      setSplitShowCodesPlain({});
      setSplitNote('');
      setSplitGeneralError(null);
      const randNum = Math.floor(1000 + Math.random() * 9000);
      setSplitNewOrderId(`ASPL${new Date().getFullYear().toString().slice(-2)}${randNum}`);
    }
    setCardActionModal({ type, task });
  };

  const handleCloseCardActionModal = () => {
    setCardActionModal(null);
  };

  const handleDirectProcessNextStep = () => {
    setDirectProcessStep(2);
  };

  const handleDirectProcessPrevStep = () => {
    setDirectProcessStep(1);
  };

  const handleConfirmCardAction = () => {
    if (!cardActionModal) return;

    if (cardActionModal.type === 'dispatch') {
      const selectedMerchant = DISPATCH_MERCHANT_LIST.find(m => m.id === dispatchMerchantId);
      if (!selectedMerchant || !selectedMerchant.isNormal) {
        triggerToast('请选择正常可接卡的商户');
        return;
      }

      if (dispatchAssignCs === 'yes' && !dispatchCsValue) {
        setDispatchCsError('请选择商户客服（必填项）');
        return;
      }

      // 更新卡单当前商户与处理状态
      setOrderTasks(prev =>
        prev.map(task => {
          if (task.id === cardActionModal.task.id) {
            return {
              ...task,
              currentMerchant: {
                id: selectedMerchant.id,
                name: selectedMerchant.name,
                rate: '98.5%',
                claimTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
              },
              status: 'processing',
              statusLabel: '处理中(已人工派单)',
              historyLogs: [
                {
                  time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                  operator: '人工客服',
                  action: `人工派单至【${selectedMerchant.name}】${dispatchAssignCs === 'yes' ? `，指定客服: ${dispatchCsValue}` : ''}`,
                },
                ...task.historyLogs,
              ],
            };
          }
          return task;
        })
      );

      triggerToast(
        `已成功将卡单 ${cardActionModal.task.id} 派单至【${selectedMerchant.name}】${
          dispatchAssignCs === 'yes' ? `（指派客服: ${dispatchCsValue}）` : ''
        }`
      );
      handleCloseCardActionModal();
    } else if (cardActionModal.type === 'transfer') {
      // 转单校验与提交
      if (!transferCsId) {
        setTransferCsError('请选择接收卡单客服');
        return;
      }

      const selectedCs = PLATFORM_CUSTOMER_SERVICES.find(cs => cs.id === transferCsId);
      if (!selectedCs || !selectedCs.isWorking) {
        setTransferCsError('只能选择“开启工作状态”的客服');
        return;
      }

      setOrderTasks(prev =>
        prev.map(task => {
          if (task.id === cardActionModal.task.id) {
            return {
              ...task,
              assignedCs: {
                id: selectedCs.id,
                name: selectedCs.name,
                email: selectedCs.email,
                label: selectedCs.label,
              },
              historyLogs: [
                {
                  time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                  operator: '客服转单',
                  action: `已转单给客服【${selectedCs.label}】`,
                },
                ...task.historyLogs,
              ],
            };
          }
          return task;
        })
      );

      triggerToast(`卡单 ${cardActionModal.task.id} 已成功转单至客服 ${selectedCs.label}`);
      handleCloseCardActionModal();
    } else if (cardActionModal.type === 'syncUser') {
      // 校验所有条目：必填且仅支持输入英文
      let hasError = false;
      const updated = syncUserItems.map(item => {
        let contentErr: string | null = null;
        if (!item.content.trim()) {
          contentErr = '请输入同步信息内容（必填项）';
          hasError = true;
        } else if (/[^\x00-\x7F]/.test(item.content)) {
          contentErr = '仅支持输入英文（英文字母、数字、标点及空格）';
          hasError = true;
        }
        return {
          ...item,
          contentError: contentErr,
        };
      });

      if (hasError) {
        setSyncUserItems(updated);
        triggerToast('请检查同步信息内容，必须填写且仅支持输入英文');
        return;
      }

      const count = syncUserItems.length;
      setOrderTasks(prev =>
        prev.map(task => {
          if (task.id === cardActionModal.task.id) {
            return {
              ...task,
              historyLogs: [
                {
                  time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                  operator: '客服同步',
                  action: `已同步用户信息 ${count} 条（${syncUserItems.map((it, i) => `信息${i + 1}: ${it.type}`).join('；')}）`,
                  note: syncUserItems.map((it, i) => `[信息${i + 1}-${it.type}]: ${it.content}${it.proofImages.length ? ` (含${it.proofImages.length}张举证图)` : ''}`).join(' | '),
                },
                ...task.historyLogs,
              ],
            };
          }
          return task;
        })
      );

      triggerToast(`卡单 ${cardActionModal.task.id} 用户信息已成功同步至风控与用户中心（共 ${count} 条）`);
      handleCloseCardActionModal();
    } else if (cardActionModal.type === 'directProcess') {
      if (directProcessResult === 'success') {
        // 校验卡代码: 必填且上限 100 行
        if (!directProcessCardCodes.trim()) {
          setDirectProcessCardCodesError('请输入卡代码（必填项，一行一个）');
          triggerToast('请输入卡代码（必填项）');
          return;
        }
        if (directProcessLineCount > 100) {
          setDirectProcessCardCodesError('卡代码数量已超过 100 行上限，请删减');
          triggerToast('卡代码数量已超过 100 行上限');
          return;
        }

        // 校验备注: 仅支持英文
        if (directProcessNote && /[^\x00-\x7F]/.test(directProcessNote)) {
          setDirectProcessNoteError('选填，仅支持输入英文（英文字母、数字、标点及空格）');
          triggerToast('备注仅支持输入英文');
          return;
        }

        // 处理成功: 状态更新为处理完成 (completed)
        const effectiveFirstCode =
          directProcessCardCodes
            .split('\n')
            .map(s => s.trim())
            .find(s => s.length > 0) || cardActionModal.task.cardDetails.cardCode;

        setOrderTasks(prev =>
          prev.map(task => {
            if (task.id === cardActionModal.task.id) {
              return {
                ...task,
                status: 'completed',
                statusLabel: '处理完成',
                cardDetails: {
                  ...task.cardDetails,
                  cardCode: effectiveFirstCode,
                },
                historyLogs: [
                  {
                    time: new Date().toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    }),
                    operator: '人工客服',
                    action: '直接处理成功并核准结算放款',
                    note: `录入卡代码 ${directProcessLineCount} 行${directProcessNote ? ` | 备注: ${directProcessNote}` : ''}${directProcessImages.length ? ` | 上传凭证图 ${directProcessImages.length} 张` : ''}`,
                  },
                  ...task.historyLogs,
                ],
              };
            }
            return task;
          })
        );

        triggerToast(`卡单 [${cardActionModal.task.id}] 已直接处理成功并结清放款！`);
        handleCloseCardActionModal();
      } else {
        // 校验卡代码: 非必填，但若填写不可超过 100 行
        if (directProcessFailLineCount > 100) {
          setDirectProcessFailCardCodesError('卡代码数量已超过 100 行上限，请删减');
          triggerToast('卡代码数量已超过 100 行上限');
          return;
        }

        // 校验失败原因: 必填项
        if (!directProcessFailReason) {
          setDirectProcessFailReasonError('请选择失败原因（必填项）');
          triggerToast('请选择失败原因（必填项）');
          return;
        }

        // 校验备注: 选填，仅支持英文
        if (directProcessFailNote && /[^\x00-\x7F]/.test(directProcessFailNote)) {
          setDirectProcessFailNoteError('选填，仅支持输入英文（英文字母、数字、标点及空格）');
          triggerToast('备注仅支持输入英文');
          return;
        }

        // 校验举证图: 必填项，至少1张
        if (directProcessFailImages.length === 0) {
          setDirectProcessFailImageError('举证图为必填项，请至少上传 1 张凭证图片');
          triggerToast('请上传举证图（必填项）');
          return;
        }

        const reasonObj = DIRECT_PROCESS_FAIL_REASONS.find(r => r.value === directProcessFailReason);
        const reasonLabel = reasonObj ? reasonObj.label : directProcessFailReason;

        // 处理失败: 状态更新为 dispute (处理失败)，并记录历史日志与凭证
        setOrderTasks(prev =>
          prev.map(task => {
            if (task.id === cardActionModal.task.id) {
              return {
                ...task,
                status: 'dispute',
                statusLabel: '处理失败',
                historyLogs: [
                  {
                    time: new Date().toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    }),
                    operator: '人工客服',
                    action: '直接处理标记为失败',
                    note: `失败原因: ${reasonLabel}${directProcessFailCardCodes.trim() ? ` | 录入卡代码 ${directProcessFailLineCount} 行` : ''}${directProcessFailNote ? ` | 备注: ${directProcessFailNote}` : ''} | 举证图 ${directProcessFailImages.length} 张`,
                  },
                  ...task.historyLogs,
                ],
              };
            }
            return task;
          })
        );

        triggerToast(`卡单 [${cardActionModal.task.id}] 已确认处理失败！`);
        handleCloseCardActionModal();
      }
    } else if (cardActionModal.type === 'splitOrder') {
      // 最终提交生效：
      // 1. 校验面额
      const parsedFaceValue = parseFloat(splitFaceValue);
      if (!splitFaceValue.trim() || isNaN(parsedFaceValue) || parsedFaceValue <= 0) {
        setSplitFaceValueError('请输入有效的大于 0 的卡面值');
        triggerToast('请输入有效的大于 0 的卡面值');
        return;
      }

      // 2. 校验数量
      const parsedQuantity = parseInt(splitQuantity, 10);
      if (!splitQuantity.trim() || isNaN(parsedQuantity) || parsedQuantity <= 0) {
        setSplitQuantityError('请输入卡数量（大于 0 的整数）');
        triggerToast('请输入卡数量（大于 0 的整数）');
        return;
      }

      // 3. 校验收卡报价
      const parsedPurchaseRate = parseFloat(splitPurchaseRate);
      if (!splitPurchaseRate.trim() || isNaN(parsedPurchaseRate) || parsedPurchaseRate <= 0) {
        setSplitPurchaseRateError('请输入收卡报价（大于 0 的数值）');
        triggerToast('请输入收卡报价');
        return;
      }

      const origTask = cardActionModal.task;
      const origItems = getTaskCardItems(origTask);

      // 划分卡图：被选中的图片划入新卡单，剩余的图片留在原卡单
      const newCardItems = origItems.filter(item => splitSelectedImageIds.includes(item.id));
      const remainingCardItems = origItems.filter(item => !splitSelectedImageIds.includes(item.id));

      const selectedCountryObj = EDIT_COUNTRY_OPTIONS.find(c => c.code === splitCountry);
      const newCountryName = selectedCountryObj?.name || '美国';
      const newCountryFlag = selectedCountryObj?.flag || '🇺🇸';

      const timeStr = new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      // 创建的新卡单对象 (默认归属到无商户接卡列表：status: 'pending_claim', statusLabel: '无商户接卡', currentMerchant: null)
      const newSplittedTask: CardOrderTask = {
        id: splitNewOrderId,
        user: { ...origTask.user },
        cardType: splitCardType,
        cardTypeIcon: origTask.cardTypeIcon,
        cardFullName: `${splitCardType} (${newCountryName} ${splitMediaType})`,
        mediaTypeLabel: splitMediaType,
        speedTag: splitSpeed,
        cardQuantity: parsedQuantity,
        userDealQuote: calculatedSplitUserDealQuote.formatted,
        merchantQuote: `￥${parsedPurchaseRate.toFixed(4)}`,
        country: splitCountry,
        countryName: newCountryName,
        countryFlag: newCountryFlag,
        faceValue: parsedFaceValue,
        declaredAmount: parsedFaceValue * 0.85,
        currency: origTask.currency || 'USD',
        cardCheckResult: {
          status: 'valid',
          label: `官方查验有效 $${parsedFaceValue}.00`,
          realBalance: parsedFaceValue,
          checkTime: timeStr,
          provider: 'Official Card Api',
        },
        riskTags: ['拆单生成', '待人工复核'],
        isRiskAnomaly: false,
        currentMerchant: null, // 无商户接卡
        status: 'pending_claim',
        statusLabel: '无商户接卡',
        entryReason: 'normal_manual',
        entryReasonLabel: '由原单卡券拆分生成的独立新卡单',
        waitingDurationSeconds: 15,
        slaRemainingSeconds: 180,
        slaTotalSeconds: 180,
        slaStatus: 'normal',
        systemAdvice: '由原单拆分生成的新卡单，已自动归入【无商户接卡】列表，建议立即人工派单或撮合',
        cardDetails: {
          cardCode: newCardItems[0]?.code || 'SPL-CODE-9988-11',
          ocrConfidence: 99.0,
          imageUrl: newCardItems[0]?.imageUrl || 'DOC_PROOF_SPLIT_01',
          imageReflections: false,
        },
        cardItems: newCardItems,
        assignedCs: origTask.assignedCs,
        historyLogs: [
          {
            time: timeStr,
            operator: '人工客服',
            action: `由原单 ${origTask.id} 拆分生成新卡单`,
            note: `拆分图片 ${newCardItems.length} 张 | 报价: ￥${parsedPurchaseRate.toFixed(4)} | 备注: ${splitNote || '无'}`,
          },
        ],
      };

      // 更新原卡单：扣除拆出的卡图，更新剩余卡数量及历史日志
      setOrderTasks(prev => {
        const updatedPrev = prev.map(task => {
          if (task.id === origTask.id) {
            return {
              ...task,
              cardQuantity: Math.max(1, remainingCardItems.length),
              cardItems: remainingCardItems,
              historyLogs: [
                {
                  time: timeStr,
                  operator: '人工客服',
                  action: `拆单操作：划出 ${newCardItems.length} 张卡图至新卡单 ${splitNewOrderId}`,
                  note: `原单剩余卡图 ${remainingCardItems.length} 张${splitNote ? ` | 备注: ${splitNote}` : ''}`,
                },
                ...task.historyLogs,
              ],
            };
          }
          return task;
        });
        // 将新卡单置顶加入列表
        return [newSplittedTask, ...updatedPrev];
      });

      triggerToast(`成功拆单！新卡单 [${splitNewOrderId}] 已生成并默认归属到【无商户接卡】列表中。`);
      handleCloseCardActionModal();
    } else if (cardActionModal.type === 'editCard') {
      // 1. 校验面额
      const parsedFaceValue = parseFloat(editFaceValue);
      if (!editFaceValue.trim() || isNaN(parsedFaceValue) || parsedFaceValue <= 0) {
        setEditFaceValueError('请输入有效的大于 0 的卡面值');
        triggerToast('请输入有效的大于 0 的卡面值');
        return;
      }
      if (parsedFaceValue > 5000) {
        setEditFaceValueError('卡面值最大值为 5000');
        triggerToast('卡面值最大值为 5000');
        return;
      }
      if (!/^\d+(\.\d{1,2})?$/.test(editFaceValue)) {
        setEditFaceValueError('卡面值最多支持两位小数');
        triggerToast('卡面值最多支持两位小数');
        return;
      }

      // 2. 校验数量
      const parsedQuantity = parseInt(editQuantity, 10);
      if (!editQuantity.trim() || isNaN(parsedQuantity) || parsedQuantity <= 0) {
        setEditQuantityError('请输入卡数量（大于 0 的整数）');
        triggerToast('请输入卡数量（大于 0 的整数）');
        return;
      }
      if (parsedQuantity > 20) {
        setEditQuantityError('卡数量最大值为 20');
        triggerToast('卡数量最大值为 20');
        return;
      }

      // 3. 校验收卡报价
      const parsedPurchaseRate = parseFloat(editPurchaseRate);
      if (!editPurchaseRate.trim() || isNaN(parsedPurchaseRate) || parsedPurchaseRate <= 0) {
        setEditPurchaseRateError('请输入收卡报价（大于 0 的数值）');
        triggerToast('请输入收卡报价');
        return;
      }
      if (parsedPurchaseRate > 20) {
        setEditPurchaseRateError('收卡报价最大值为 20');
        triggerToast('收卡报价最大值为 20');
        return;
      }
      if (!/^\d+(\.\d{1,4})?$/.test(editPurchaseRate)) {
        setEditPurchaseRateError('收卡报价最多支持录入到小数点后四位');
        triggerToast('收卡报价最多支持录入到小数点后四位');
        return;
      }

      // 4. 校验备注: 仅支持英文
      if (editCardNote && /[^\x00-\x7F]/.test(editCardNote)) {
        setEditCardNoteError('非必填，仅支持输入英文，不支持输入汉字');
        triggerToast('备注仅支持输入英文，不支持输入汉字');
        return;
      }

      // 5. 关键业务规则: 如果卡单发生了修改，那么 备注内容和举证图是二选一必填项
      const origTask = cardActionModal.task;
      const origMediaType = origTask.mediaTypeLabel || (origTask.cardDetails?.imageReflections ? '卡图' : '电子码');
      const origSpeed = origTask.speedTag || '快卡';
      const origRateNum = origTask.merchantQuote ? parseFloat(origTask.merchantQuote.replace(/[^\d.]/g, '')) : 7.35;
      const origPurchaseRateStr = isNaN(origRateNum) || origRateNum <= 0 ? '7.3500' : origRateNum.toFixed(4);

      const isCardModified =
        editCardType !== origTask.cardType ||
        editCountry !== origTask.country ||
        editMediaType !== origMediaType ||
        editSpeed !== origSpeed ||
        parsedFaceValue !== origTask.faceValue ||
        parsedQuantity !== (origTask.cardQuantity || 1) ||
        Math.abs(parsedPurchaseRate - origRateNum) > 0.00001;

      const hasNote = editCardNote.trim().length > 0;
      const hasImages = editCardImages.length > 0;

      if (isCardModified && !hasNote && !hasImages) {
        setEditCardGeneralError('卡单信息已发生修改，备注内容和举证图为二选一必填项');
        triggerToast('卡单已修改，备注内容和举证图必须二选一填写');
        return;
      }

      const selectedCountryObj = EDIT_COUNTRY_OPTIONS.find(c => c.code === editCountry);
      const newCountryName = selectedCountryObj?.name || origTask.countryName;
      const newCountryFlag = selectedCountryObj?.flag || origTask.countryFlag;

      // 构建修改变更明细日志
      const changeLogs: string[] = [];
      if (editCardType !== origTask.cardType) changeLogs.push(`卡种: ${origTask.cardType} -> ${editCardType}`);
      if (editCountry !== origTask.country) changeLogs.push(`国家: ${origTask.country} -> ${editCountry}`);
      if (editMediaType !== origMediaType) changeLogs.push(`介质: ${origMediaType} -> ${editMediaType}`);
      if (editSpeed !== origSpeed) changeLogs.push(`时效: ${origSpeed} -> ${editSpeed}`);
      if (parsedFaceValue !== origTask.faceValue) changeLogs.push(`面额: ${origTask.faceValue} -> ${parsedFaceValue}`);
      if (parsedQuantity !== (origTask.cardQuantity || 1)) changeLogs.push(`数量: ${origTask.cardQuantity || 1} -> ${parsedQuantity}`);
      if (Math.abs(parsedPurchaseRate - origRateNum) > 0.00001) changeLogs.push(`收卡报价: ${origPurchaseRateStr} -> ${parsedPurchaseRate.toFixed(4)}`);
      if (origTask.userDealQuote !== calculatedUserDealQuote.formatted) changeLogs.push(`成交报价: ${origTask.userDealQuote || '原单无'} -> ${calculatedUserDealQuote.formatted}`);

      setOrderTasks(prev =>
        prev.map(task => {
          if (task.id === cardActionModal.task.id) {
            return {
              ...task,
              cardType: editCardType,
              cardFullName: `${editCardType} (${newCountryName} ${editMediaType})`,
              country: editCountry,
              countryName: newCountryName,
              countryFlag: newCountryFlag,
              mediaTypeLabel: editMediaType,
              speedTag: editSpeed,
              faceValue: parsedFaceValue,
              cardQuantity: parsedQuantity,
              merchantQuote: `￥${parsedPurchaseRate.toFixed(4)}`,
              userDealQuote: calculatedUserDealQuote.formatted,
              historyLogs: [
                {
                  time: new Date().toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  }),
                  operator: '人工客服',
                  action: '修改卡信息生效',
                  note: `${changeLogs.length ? `变更对比确认生效[${changeLogs.join('; ')}]` : '核验卡信息确认无变更'}${editCardNote ? ` | 英文备注: ${editCardNote}` : ''}${editCardImages.length ? ` | 举证图 ${editCardImages.length} 张` : ''}`,
                },
                ...task.historyLogs,
              ],
            };
          }
          return task;
        })
      );

      triggerToast(`卡单 [${cardActionModal.task.id}] 信息已成功修改并确认生效！`);
      handleCloseCardActionModal();
    } else if (cardActionModal.type === 'resolveAnomaly') {
      // 方案 A：解除异常确认，将卡单恢复为【待商户处理】状态
      setOrderTasks(prev =>
        prev.map(task => {
          if (task.id === cardActionModal.task.id) {
            return {
              ...task,
              status: 'waiting_merchant_process' as OrderOperationalStatus,
              statusLabel: '待商户处理',
              historyLogs: [
                {
                  time: new Date().toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  }),
                  operator: '人工客服',
                  action: '解除异常',
                  note: '客服核实并解除商户提交的异常，卡单状态已恢复为【待商户处理】',
                },
                ...task.historyLogs,
              ],
            };
          }
          return task;
        })
      );
      triggerToast(`卡单 [${cardActionModal.task.id}] 已成功解除异常，恢复为【待商户处理】状态！`);
      handleCloseCardActionModal();
    } else if (cardActionModal.type === 'manualDelay') {
      const delayMins = parseInt(manualDelayMinutesInput, 10);
      if (isNaN(delayMins) || delayMins <= 0) {
        setManualDelayError('请输入有效的延迟分钟数（大于0的正整数）');
        return;
      }
      const finalReason = manualDelayReasonInput.trim();
      if (!finalReason) {
        setManualDelayError('请输入原因描述（必填项，最多500字，仅支持英文）');
        return;
      }
      if (finalReason.length > 500) {
        setManualDelayError('原因描述不能超过 500 个字符');
        return;
      }
      if (/[^\x00-\x7F]/.test(finalReason)) {
        setManualDelayError('原因描述仅支持输入英文字符及英文标点');
        return;
      }
      const addedSeconds = delayMins * 60;
      setOrderTasks(prev =>
        prev.map(task => {
          if (task.id === cardActionModal.task.id) {
            const newRemaining = Math.max(0, (task.slaRemainingSeconds || 0) + addedSeconds);
            const newTotal = (task.slaTotalSeconds || 180) + addedSeconds;
            return {
              ...task,
              slaRemainingSeconds: newRemaining,
              slaTotalSeconds: newTotal,
              slaStatus: newRemaining > 60 ? ('normal' as const) : ('warning' as const),
              historyLogs: [
                {
                  time: new Date().toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  }),
                  operator: '人工客服',
                  action: `手动延迟 ${delayMins} 分钟`,
                  note: `客服手动顺延处理时限 ${delayMins} 分钟 (新增 ${addedSeconds} 秒) | 原因: ${finalReason}${manualDelayImages.length ? ` | 举证图 ${manualDelayImages.length} 张` : ''}`,
                },
                ...task.historyLogs,
              ],
            };
          }
          return task;
        })
      );
      triggerToast(`卡单 [${cardActionModal.task.id}] 已成功手动顺延 ${delayMins} 分钟！`);
      handleCloseCardActionModal();
    } else if (cardActionModal.type === 'recall') {
      if (!recallReasonInput.trim()) {
        setRecallReasonError('请输入撤回原因（必填项）');
        return;
      }
      handleRecallOrder(cardActionModal.task.id, recallReasonInput.trim());
      triggerToast(`卡单 [${cardActionModal.task.id}] 已成功撤回至待调度池`);
      handleCloseCardActionModal();
    } else {
      const config = (CARD_ACTION_MODAL_CONFIG as Record<string, any>)[(cardActionModal as any).type];
      triggerToast(`已提交【${config?.title || '操作'}】（空表单占位已确认）`);
      handleCloseCardActionModal();
    }
  };

  // ============================================================================
  // 8. 卡单作业数据集 (只要需要人工参与即入池，包含正常/自动化受阻/风控待确认/商户异常/售后)
  // ============================================================================
  const [orderTasks, setOrderTasks] = useState<CardOrderTask[]>([
    {
      id: 'AAPP08GW7Z',
      user: { userId: 'USNEO3N9Z', name: 'Alex_VipCard', level: 'V4', creditScore: 98, phoneOrEmail: '+1 626***8819' },
      cardType: 'Apple Gift Card',
      cardTypeIcon: 'apple',
      cardFullName: '苹果/Apple&iTunes',
      mediaTypeLabel: '卡图',
      speedTag: '快卡',
      cardQuantity: 4,
      userDealQuote: '￥7.0000/₦1386',
      merchantQuote: '￥8.0000',
      country: 'US',
      countryName: '美国',
      countryFlag: '🇺🇸',
      faceValue: 500,
      declaredAmount: 417.5,
      currency: 'USD',
      cardCheckResult: {
        status: 'valid',
        label: '有效余额 $500.00',
        realBalance: 500,
        checkTime: '14:28:10',
        provider: 'Apple Official API',
      },
      riskTags: ['正常', '大客通道'],
      isRiskAnomaly: false,
      currentMerchant: { id: 'M-1002', name: '极客卡业 (美区专线)', rate: '98.5%', claimTime: '14:28:15' },
      status: 'waiting_merchant_process',
      statusLabel: '待商户处理',
      entryReason: 'normal_manual',
      entryReasonLabel: '正常人工复核大额卡',
      waitingDurationSeconds: 108,
      slaRemainingSeconds: 32,
      slaTotalSeconds: 140,
      slaStatus: 'warning',
      systemAdvice: '官方查验已核准 $500.00，建议立即人工核实并放款结清',
      cardDetails: {
        cardCode: 'X899-KLP2-9901-MM22',
        ocrConfidence: 99.2,
        imageUrl: 'DOC_PROOF_SHA256_88910',
        imageReflections: false,
      },
      assignedCs: { id: 'cs_xpp', name: '小胖胖', email: '19203@163.com', label: '小胖胖(19203@163.com)' },
      historyLogs: [
        { time: '14:28:10', operator: '系统', action: '用户提交卡单，Card Check通过' },
        { time: '14:28:15', operator: '系统撮合', action: '派发给商户极客卡业' },
      ],
    },
    {
      id: 'ASTE99KLP1',
      user: { userId: 'US88K9LP2', name: 'CryptoTrader_Z', level: 'V2', creditScore: 84, phoneOrEmail: '+86 138****0922' },
      cardType: 'Steam Wallet Card',
      cardTypeIcon: 'sports_esports',
      cardFullName: 'Steam/蒸汽充值卡',
      mediaTypeLabel: '卡图',
      speedTag: '快卡',
      cardQuantity: 4,
      userDealQuote: '￥6.8500/₦1350',
      merchantQuote: '￥7.9200',
      country: 'US',
      countryName: '美国',
      countryFlag: '🇺🇸',
      faceValue: 100,
      declaredAmount: 82.0,
      currency: 'USD',
      cardCheckResult: {
        status: 'valid',
        label: '卡密未兑换',
        realBalance: 100,
        checkTime: '14:26:00',
        provider: 'Steam Store Bot',
      },
      riskTags: ['异地IP出卡', '频控警告'],
      isRiskAnomaly: true,
      currentMerchant: null,
      status: 'pending_claim',
      statusLabel: '无商户接卡',
      entryReason: 'risk_unconfirmed',
      entryReasonLabel: '无商户接卡 (异地IP待人工撮合)',
      waitingDurationSeconds: 240,
      slaRemainingSeconds: -45,
      slaTotalSeconds: 180,
      slaStatus: 'overdue',
      systemAdvice: '商户池暂无承接，建议客服手动指派金牌商户或调整折率撮合',
      cardDetails: {
        cardCode: 'ST-9981-2299-4411',
        ocrConfidence: 94.5,
        imageUrl: 'DOC_PROOF_SHA256_88911',
        imageReflections: true,
      },
      assignedCs: { id: 'cs_dff', name: '大飞飞', email: '3456@163.com', label: '大飞飞(3456@163.com)' },
      historyLogs: [
        { time: '14:24:00', operator: '系统', action: '用户提交，触发异地IP风控策略，等待商户接单' },
      ],
    },
    {
      id: 'AAMZ2244UK',
      user: { userId: 'UK77AMZ01', name: 'AmazonSeller_K', level: 'V3', creditScore: 92, phoneOrEmail: '+44 20****9910' },
      cardType: 'Amazon Gift Card',
      cardTypeIcon: 'shopping_bag',
      cardFullName: '亚马逊/Amazon',
      mediaTypeLabel: '电子码',
      speedTag: '快卡',
      cardQuantity: 4,
      userDealQuote: '￥8.2000/₦1620',
      merchantQuote: '￥9.4500',
      country: 'UK',
      countryName: '英国',
      countryFlag: '🇬🇧',
      faceValue: 250,
      declaredAmount: 205.0,
      currency: 'GBP',
      cardCheckResult: {
        status: 'valid',
        label: '预检有效余额 £250.00',
        realBalance: 250,
        checkTime: '14:32:00',
        provider: 'Amazon 预检引擎',
      },
      riskTags: ['待接卡', '大面额UK卡'],
      isRiskAnomaly: false,
      currentMerchant: null,
      status: 'pending_claim',
      statusLabel: '无商户接卡',
      entryReason: 'normal_manual',
      entryReasonLabel: '商户池暂无承接席位 (英区大面额)',
      waitingDurationSeconds: 180,
      slaRemainingSeconds: 20,
      slaTotalSeconds: 200,
      slaStatus: 'warning',
      systemAdvice: '英区专线商户额度占满，暂无商户接单；建议客服紧急指派【顺达环球卡券】或联系商户临时增额',
      cardDetails: {
        cardCode: 'AMZ-UK-9921-2244-1100',
        ocrConfidence: 98.7,
        imageUrl: 'DOC_PROOF_SHA256_88918',
        imageReflections: false,
      },
      historyLogs: [
        { time: '14:32:00', operator: '系统', action: '自动核验通过，广播商户池无人接单' },
      ],
    },
    {
      id: 'ASTE8821DE',
      user: { userId: 'DE66STM92', name: 'EuroGamer_Max', level: 'V3', creditScore: 91, phoneOrEmail: '+49 170****992' },
      cardType: 'Steam Wallet Card',
      cardTypeIcon: 'sports_esports',
      cardFullName: 'Steam/蒸汽充值卡',
      mediaTypeLabel: '电子码',
      speedTag: '快卡',
      cardQuantity: 4,
      userDealQuote: '￥6.9500/₦1372',
      merchantQuote: '￥8.0500',
      country: 'DE',
      countryName: '德国',
      countryFlag: '🇩🇪',
      faceValue: 100,
      declaredAmount: 85.0,
      currency: 'EUR',
      cardCheckResult: {
        status: 'invalid',
        label: '商户提报卡密失效/已被充值',
        checkTime: '14:33:10',
        provider: '商户端回执存证',
      },
      riskTags: ['商户异常提报', '卡密核销冲突'],
      isRiskAnomaly: true,
      currentMerchant: { id: 'M-1002', name: '极客卡业 (美区专线)', rate: '98.5%', claimTime: '14:25:00' },
      status: 'merchant_reported_anomaly',
      statusLabel: '商户提交异常',
      entryReason: 'merchant_anomaly',
      entryReasonLabel: '商户提交异常 (提报卡密失效)',
      waitingDurationSeconds: 150,
      slaRemainingSeconds: 45,
      slaTotalSeconds: 180,
      slaStatus: 'warning',
      systemAdvice: '商户提报卡密已被激活使用，附带充值失败凭证；建议客服调取官方时间戳仲裁，若商户误判则指令继续履约，若属实则转争议退卡',
      cardDetails: {
        cardCode: 'STM-DE-8821-K992-PP01',
        ocrConfidence: 99.4,
        imageUrl: 'DOC_PROOF_SHA256_88915',
        imageReflections: false,
      },
      historyLogs: [
        { time: '14:25:00', operator: '商户极客卡业', action: '接单' },
        { time: '14:33:10', operator: '商户极客卡业', action: '提交异常：卡密显示已被其他账户兑换' },
      ],
    },
    {
      id: 'AAPP7712JP',
      user: { userId: 'JP55APL38', name: 'SwiftBuyer_JP', level: 'V2', creditScore: 88, phoneOrEmail: '+81 90****1280' },
      cardType: 'Apple Gift Card',
      cardTypeIcon: 'apple',
      cardFullName: '苹果/Apple&iTunes',
      mediaTypeLabel: '卡图',
      speedTag: '普通卡',
      cardQuantity: 4,
      userDealQuote: '￥0.0460/₦9.1',
      merchantQuote: '￥0.0535',
      country: 'JP',
      countryName: '日本',
      countryFlag: '🇯🇵',
      faceValue: 10000,
      declaredAmount: 68.5,
      currency: 'JPY',
      cardCheckResult: {
        status: 'grey_balance',
        label: '商户提报面额与申报不一致',
        realBalance: 5000,
        checkTime: '14:30:20',
        provider: '商户验卡反馈',
      },
      riskTags: ['商户申报差异', '面额争议待核'],
      isRiskAnomaly: true,
      currentMerchant: { id: 'M-1004', name: '顺达环球卡券', rate: '94.0%', claimTime: '14:26:00' },
      status: 'merchant_reported_anomaly',
      statusLabel: '商户提交异常',
      entryReason: 'merchant_anomaly',
      entryReasonLabel: '商户提交异常 (申报¥10,000/查实¥5,000)',
      waitingDurationSeconds: 110,
      slaRemainingSeconds: 70,
      slaTotalSeconds: 180,
      slaStatus: 'normal',
      systemAdvice: '商户反馈卡内余额仅有 ¥5,000，提报异常待审核；建议客服核实官方明细更正申报面额，或强行改派',
      cardDetails: {
        cardCode: 'AP-JP-7712-4412-8819',
        ocrConfidence: 97.8,
        imageUrl: 'DOC_PROOF_SHA256_88916',
        imageReflections: false,
      },
      historyLogs: [
        { time: '14:26:00', operator: '商户顺达', action: '接单验卡' },
        { time: '14:30:20', operator: '商户顺达', action: '提交异常：实际面额为¥5,000，与申报¥10,000不符' },
      ],
    },
    {
      id: 'AGOO9912US',
      user: { userId: 'US44GPL19', name: 'David_Trader', level: 'V5', creditScore: 95, phoneOrEmail: '+1 415****8823' },
      cardType: 'Google Play Gift Card',
      cardTypeIcon: 'play_arrow',
      cardFullName: '谷歌/Google Play',
      mediaTypeLabel: '电子码',
      speedTag: '快卡',
      cardQuantity: 4,
      userDealQuote: '￥7.1200/₦1408',
      merchantQuote: '￥8.1500',
      country: 'US',
      countryName: '美国',
      countryFlag: '🇺🇸',
      faceValue: 200,
      declaredAmount: 165.0,
      currency: 'USD',
      cardCheckResult: {
        status: 'valid',
        label: '官方查验正常有效 $200.00',
        realBalance: 200,
        checkTime: '14:20:10',
        provider: 'Google API',
      },
      riskTags: ['人工撤回', '原商户处理停滞'],
      isRiskAnomaly: false,
      currentMerchant: null,
      status: 'manual_recalled_pending',
      statusLabel: '已撤回·待处理',
      entryReason: 'normal_manual',
      entryReasonLabel: '客服主动撤回 (原商户处理停滞超90s)',
      waitingDurationSeconds: 75,
      slaRemainingSeconds: 85,
      slaTotalSeconds: 160,
      slaStatus: 'normal',
      systemAdvice: '原接单商户万通鼎盛超时无响应，客服已从商户席位撤回锁定；建议立即改派给高响应商户【极客卡业】并优先放款',
      cardDetails: {
        cardCode: 'GP-US-9912-3344-7721',
        ocrConfidence: 99.1,
        imageUrl: 'DOC_PROOF_SHA256_88917',
        imageReflections: false,
      },
      historyLogs: [
        { time: '14:20:10', operator: '系统', action: '派单给万通鼎盛数码' },
        { time: '14:28:00', operator: '客服人工', action: '商户超时停滞，客服执行人工撤回' },
      ],
    },
    {
      id: 'AGOO4421UK',
      user: { userId: 'UK33GPL84', name: 'GiftMaster_UK', level: 'V6', creditScore: 92, phoneOrEmail: '+44 7911****82' },
      cardType: 'Google Play Gift Card',
      cardTypeIcon: 'play_arrow',
      cardFullName: '谷歌/Google Play',
      mediaTypeLabel: '卡图',
      speedTag: '快卡',
      cardQuantity: 4,
      userDealQuote: '￥8.1500/₦1610',
      merchantQuote: '￥9.3800',
      country: 'UK',
      countryName: '英国',
      countryFlag: '🇬🇧',
      faceValue: 50,
      declaredAmount: 41.2,
      currency: 'GBP',
      cardCheckResult: {
        status: 'grey_balance',
        label: '灰余额嫌疑 (申报£50/查实£25)',
        realBalance: 25,
        checkTime: '14:29:40',
        provider: 'Google Card Check Service',
      },
      riskTags: ['余额不符', '灰余额拦截'],
      isRiskAnomaly: true,
      currentMerchant: { id: 'M-1008', name: '万通鼎盛数码', rate: '96.2%' },
      status: 'pending_confirm',
      statusLabel: '待人工确认',
      entryReason: 'auto_failed',
      entryReasonLabel: '自动化核验无法完成',
      waitingDurationSeconds: 85,
      slaRemainingSeconds: 55,
      slaTotalSeconds: 140,
      slaStatus: 'warning',
      systemAdvice: '申报金额与真实余额差异 £25，建议联系用户修正面额，或按£25放款',
      cardDetails: {
        cardCode: 'GP-4421-9988-1122',
        ocrConfidence: 98.1,
        imageUrl: 'DOC_PROOF_SHA256_88912',
        imageReflections: false,
      },
      historyLogs: [
        { time: '14:29:40', operator: '预检引擎', action: '查验余额 £25 与申报 £50 不符' },
      ],
    },
    {
      id: 'AAPP9901US',
      user: { userId: 'US22APL07', name: 'David_NY', level: 'V1', creditScore: 78, isNewUser: true, phoneOrEmail: '+1 917***1102' },
      cardType: 'Apple Gift Card',
      cardTypeIcon: 'apple',
      cardFullName: '苹果/Apple&iTunes',
      mediaTypeLabel: '卡图',
      speedTag: '慢卡',
      cardQuantity: 4,
      userDealQuote: '￥6.9800/₦1380',
      merchantQuote: '￥7.9800',
      country: 'US',
      countryName: '美国',
      countryFlag: '🇺🇸',
      faceValue: 100,
      declaredAmount: 83.5,
      currency: 'USD',
      cardCheckResult: {
        status: 'redeemed',
        label: '商户反馈已被使用',
        realBalance: 0,
        checkTime: '14:15:20',
        provider: '商户反馈',
      },
      riskTags: ['售后争议', '撞卡争议'],
      isRiskAnomaly: true,
      currentMerchant: { id: 'M-1004', name: '顺达环球卡券', rate: '94.0%' },
      status: 'after_sale',
      statusLabel: '售后中',
      entryReason: 'dispute',
      entryReasonLabel: '用户发起售后申诉',
      waitingDurationSeconds: 620,
      slaRemainingSeconds: -180,
      slaTotalSeconds: 300,
      slaStatus: 'overdue',
      systemAdvice: '商户声称卡已被锁定，用户提供购买小票存证，建议客服调取官方兑换时间戳仲裁',
      cardDetails: {
        cardCode: 'X990-2211-MM44-8899',
        ocrConfidence: 96.0,
        imageUrl: 'DOC_PROOF_SHA256_88913',
        imageReflections: false,
      },
      historyLogs: [
        { time: '14:15:20', operator: '商户顺达', action: '标记该卡已兑换失效' },
        { time: '14:18:10', operator: '用户David', action: '提起售后申诉并上传实体卡收据' },
      ],
    },
    {
      id: 'AWMC1002US',
      user: { userId: 'US55WMT88', name: 'RetailMaster', level: 'V4', creditScore: 94, phoneOrEmail: '+1 312***9910' },
      cardType: 'Walmart Gift Card',
      cardTypeIcon: 'storefront',
      cardFullName: '沃尔玛/Walmart',
      mediaTypeLabel: '电子码',
      speedTag: '普通卡',
      cardQuantity: 4,
      userDealQuote: '￥6.9000/₦1360',
      merchantQuote: '￥7.9000',
      country: 'US',
      countryName: '美国',
      countryFlag: '🇺🇸',
      faceValue: 100,
      declaredAmount: 82.5,
      currency: 'USD',
      cardCheckResult: {
        status: 'valid',
        label: '有效余额 $100.00',
        realBalance: 100,
        checkTime: '14:35:10',
        provider: 'Walmart API',
      },
      riskTags: ['待接卡', '新上架卡种'],
      isRiskAnomaly: false,
      currentMerchant: null,
      status: 'waiting_merchant_claim',
      statusLabel: '待商户接卡',
      entryReason: 'normal_manual',
      entryReasonLabel: '商户池撮合广播中',
      waitingDurationSeconds: 45,
      slaRemainingSeconds: 135,
      slaTotalSeconds: 180,
      slaStatus: 'normal',
      systemAdvice: '订单已在商户接单池广播，等待接单商户响应认领',
      cardDetails: {
        cardCode: 'WM-US-8891-2244-1100',
        ocrConfidence: 99.0,
        imageUrl: 'DOC_PROOF_SHA256_88919',
        imageReflections: false,
      },
      historyLogs: [
        { time: '14:35:10', operator: '系统', action: '用户提交卡单，通过预检并广播至商户接单池' },
      ],
    },
    {
      id: 'AFLT4411US',
      user: { userId: 'US66NKE20', name: 'SneakerKing', level: 'V3', creditScore: 86, phoneOrEmail: '+1 408***3321' },
      cardType: 'Nike Gift Card',
      cardTypeIcon: 'shopping_bag',
      cardFullName: '耐克/Nike',
      mediaTypeLabel: '卡图',
      speedTag: '快卡',
      cardQuantity: 4,
      userDealQuote: '￥6.7500/₦1330',
      merchantQuote: '￥7.8000',
      country: 'US',
      countryName: '美国',
      countryFlag: '🇺🇸',
      faceValue: 150,
      declaredAmount: 122.0,
      currency: 'USD',
      cardCheckResult: {
        status: 'invalid',
        label: '卡密不存在或已被冻结',
        realBalance: 0,
        checkTime: '14:18:00',
        provider: 'Nike Store API',
      },
      riskTags: ['核销失败', '审核流转'],
      isRiskAnomaly: true,
      currentMerchant: { id: 'M-1008', name: '万通鼎盛数码', rate: '96.2%' },
      status: 'failed_pending_audit',
      statusLabel: '失败待审核',
      entryReason: 'auto_failed',
      entryReasonLabel: '商户核销失败，进入客服二级复核',
      waitingDurationSeconds: 310,
      slaRemainingSeconds: -50,
      slaTotalSeconds: 260,
      slaStatus: 'overdue',
      systemAdvice: '商户回执卡密无效，客服需调取用户提交图核实后终审驳回或结清',
      cardDetails: {
        cardCode: 'NK-US-7712-4411-9920',
        ocrConfidence: 95.8,
        imageUrl: 'DOC_PROOF_SHA256_88920',
        imageReflections: true,
      },
      historyLogs: [
        { time: '14:18:00', operator: '商户万通', action: '核销失败并提交失败证明' },
        { time: '14:20:00', operator: '系统', action: '自动流转至【失败待审核】节点' },
      ],
    },
    {
      id: 'ASUC8899US',
      user: { userId: 'US77RZG11', name: 'CyberWarrior', level: 'V5', creditScore: 97, phoneOrEmail: '+1 212***8844' },
      cardType: 'Razer Gold',
      cardTypeIcon: 'hexagon',
      cardFullName: '雷蛇/Razer Gold',
      mediaTypeLabel: '电子码',
      speedTag: '快卡',
      cardQuantity: 4,
      userDealQuote: '￥7.2500/₦1430',
      merchantQuote: '￥8.2800',
      country: 'US',
      countryName: '美国',
      countryFlag: '🇺🇸',
      faceValue: 200,
      declaredAmount: 168.0,
      currency: 'USD',
      cardCheckResult: {
        status: 'valid',
        label: '核销成功 $200.00',
        realBalance: 200,
        checkTime: '14:05:00',
        provider: 'Razer Official',
      },
      riskTags: ['已放款', '履约完成'],
      isRiskAnomaly: false,
      currentMerchant: { id: 'M-1002', name: '极客卡业', rate: '98.5%' },
      status: 'completed',
      statusLabel: '处理成功',
      entryReason: 'normal_manual',
      entryReasonLabel: '核销成功并自动放款',
      waitingDurationSeconds: 0,
      slaRemainingSeconds: 120,
      slaTotalSeconds: 120,
      slaStatus: 'normal',
      systemAdvice: '卡单已终态履约完成，支持同步举证信息或查阅明细',
      cardDetails: {
        cardCode: 'RZ-US-8899-2211-7788',
        ocrConfidence: 99.9,
        imageUrl: 'DOC_PROOF_SHA256_88921',
        imageReflections: false,
      },
      historyLogs: [
        { time: '14:05:00', operator: '商户极客卡业', action: '核销成功' },
        { time: '14:05:30', operator: '系统结算', action: '已自动向用户放款 168.0 USDT' },
      ],
    },
    {
      id: 'AFLS7722US',
      user: { userId: 'UK44GPL99', name: 'BadCodeSubmitter', level: 'V1', creditScore: 65, phoneOrEmail: '+44 7922***11' },
      cardType: 'Google Play Gift Card',
      cardTypeIcon: 'play_arrow',
      cardFullName: '谷歌/Google Play',
      mediaTypeLabel: '卡图',
      speedTag: '普通卡',
      cardQuantity: 4,
      userDealQuote: '￥8.1500/₦1610',
      merchantQuote: '￥9.3800',
      country: 'UK',
      countryName: '英国',
      countryFlag: '🇬🇧',
      faceValue: 50,
      declaredAmount: 41.2,
      currency: 'GBP',
      cardCheckResult: {
        status: 'invalid',
        label: '无效卡密已被兑换',
        realBalance: 0,
        checkTime: '13:50:00',
        provider: 'Google API',
      },
      riskTags: ['核销失败', '已驳回'],
      isRiskAnomaly: true,
      currentMerchant: { id: 'M-1008', name: '万通鼎盛数码', rate: '96.2%' },
      status: 'failed',
      statusLabel: '处理失败',
      entryReason: 'auto_failed',
      entryReasonLabel: '卡密已使用，复核确认失败驳回',
      waitingDurationSeconds: 0,
      slaRemainingSeconds: 0,
      slaTotalSeconds: 120,
      slaStatus: 'normal',
      systemAdvice: '卡单已终态处理失败，支持向用户同步举证信息',
      cardDetails: {
        cardCode: 'GP-UK-7722-1100-3344',
        ocrConfidence: 94.0,
        imageUrl: 'DOC_PROOF_SHA256_88922',
        imageReflections: false,
      },
      historyLogs: [
        { time: '13:50:00', operator: '商户万通', action: '核销失败：官方显示已于昨日被兑换' },
        { time: '13:58:00', operator: '人工客服', action: '复核完成，驳回卡单并标记处理失败' },
      ],
    },
    {
      id: 'ARAZ8819US',
      user: { userId: 'US11RAZ93', name: 'GlobalExpress', level: 'V7', creditScore: 99, phoneOrEmail: '+65 9182****' },
      cardType: 'Razer Gold',
      cardTypeIcon: 'hexagon',
      cardFullName: '雷蛇/Razer Gold',
      mediaTypeLabel: '电子码',
      speedTag: '快卡',
      cardQuantity: 4,
      userDealQuote: '￥7.2500/₦1430',
      merchantQuote: '￥8.2800',
      country: 'US',
      countryName: '美国',
      countryFlag: '🇺🇸',
      faceValue: 200,
      declaredAmount: 168.0,
      currency: 'USD',
      cardCheckResult: {
        status: 'valid',
        label: '有效余额 $200.00',
        realBalance: 200,
        checkTime: '14:31:00',
        provider: 'Razer Official Check',
      },
      riskTags: ['正常', '自动化流转'],
      isRiskAnomaly: false,
      currentMerchant: { id: 'M-1002', name: '极客卡业', rate: '98.5%' },
      status: 'processing',
      statusLabel: '处理中',
      entryReason: 'merchant_anomaly',
      entryReasonLabel: '商户处理停滞超 90s',
      waitingDurationSeconds: 95,
      slaRemainingSeconds: 25,
      slaTotalSeconds: 120,
      slaStatus: 'warning',
      systemAdvice: '商户验卡节点停滞，系统已自动催促，若30秒内未响应建议强行改派',
      cardDetails: {
        cardCode: 'RZ-8819-0021-4411',
        ocrConfidence: 99.8,
        imageUrl: 'DOC_PROOF_SHA256_88914',
        imageReflections: false,
      },
      historyLogs: [
        { time: '14:31:00', operator: '系统', action: '自动核验通过，派单' },
        { time: '14:32:00', operator: '系统SLA', action: '商户处理超过90秒，触发客服关注' },
      ],
    },
  ]);

  // ============================================================================
  // 9. 商户异常任务数据集
  // ============================================================================
  const [merchantAnomalies, setMerchantAnomalies] = useState<MerchantAnomalyTask[]>([
    {
      id: 'MA-20261005-01',
      merchant: { id: 'M-1002', name: '极客卡业 (美区专线)', tier: '金牌承接商', depositBalance: '4,280 USDT' },
      anomalyType: 'capacity_abnormal',
      anomalyTypeLabel: '承接能力异常 (质押金不足)',
      relatedSku: 'Apple Gift Card US / Steam US',
      relatedOrderCodes: ['AAPP08GW7Z', 'AAPP09GW8A', 'AAPP10GW9B'],
      occurredTime: '13:45:20',
      durationMinutes: 48,
      impactedOrdersCount: 28,
      impactedAmount: '$12,400',
      suggestedAction: '致电商户负责人充值补充质押金，或临时开启 30,000 USDT 授信兜底',
      owner: '李四 (商户客服)',
      status: 'pending_intervene',
      statusLabel: '待介入',
      detailCause: '今日出单高峰，极客卡业接单金额超过可用质押金上限95%，新单无法继续分配。',
    },
    {
      id: 'MA-20261005-02',
      merchant: { id: 'M-1004', name: '顺达环球卡券', tier: '银牌商户', depositBalance: '25,000 USDT' },
      anomalyType: 'rejection',
      anomalyTypeLabel: '商户连续拒单',
      relatedSku: 'Google Play UK',
      relatedOrderCodes: ['KD-20261005-8812', 'KD-20261005-8815'],
      occurredTime: '14:10:00',
      durationMinutes: 22,
      impactedOrdersCount: 6,
      impactedAmount: '£1,850',
      suggestedAction: '调查拒单原因，若是汇率倒挂触发调价，若系恶意拒单扣罚履约保证金',
      owner: '王强 (客服组长)',
      status: 'processing',
      statusLabel: '处理中',
      detailCause: '商户端反馈由于英镑兑USDT波幅过大，核销成本倒挂，主动拒绝 4 笔派单。',
    },
    {
      id: 'MA-20261005-03',
      merchant: { id: 'M-1008', name: '万通鼎盛数码', tier: '普通商户', depositBalance: '18,500 USDT' },
      anomalyType: 'process_timeout',
      anomalyTypeLabel: '处理超时 (超 5 分钟未回执)',
      relatedSku: 'Razer Gold Global',
      relatedOrderCodes: ['ARAZ8819US'],
      occurredTime: '14:22:15',
      durationMinutes: 10,
      impactedOrdersCount: 3,
      impactedAmount: '$800',
      suggestedAction: '一键撤回派单并强改派给备用商户，对万通鼎盛记超时告警 1 次',
      owner: '张敏 (在线坐席)',
      status: 'merchant_handling',
      statusLabel: '商户处理中',
      detailCause: '商户夜班客服交接出现 15 分钟无人值守空档，导致卡单积压在确认环节。',
    },
    {
      id: 'MA-20261005-04',
      merchant: { id: 'M-1011', name: '易汇通卡行', tier: '银牌商户', depositBalance: '32,000 USDT' },
      anomalyType: 'price_anomaly_urge',
      anomalyTypeLabel: '报价异常 (低于市场1.5pp)',
      relatedSku: 'Steam Wallet Global',
      relatedOrderCodes: ['KD-20261005-9400'],
      occurredTime: '12:30:00',
      durationMinutes: 120,
      impactedOrdersCount: 15,
      impactedAmount: '$3,200',
      suggestedAction: '系统自动催价未响应，客服人工呼叫商户调度员调整买入折率',
      owner: '王建国 (报价运营协同)',
      status: 'pending_intervene',
      statusLabel: '待介入',
      detailCause: '外部竞品上调收卡折率至 85%，商户仍维持 83.5%，导致用户提交卡单后取消。',
    },
  ]);

  // ============================================================================
  // 10. 推广异常工单数据集 (来自渠道推广系统)
  // ============================================================================
  const [promotionTickets, setPromotionTickets] = useState<PromotionAnomalyTicket[]>([
    {
      ticketId: 'TKT-PROM-20261005-001',
      visitorOrUserId: 'USR-89021 (张先生)',
      channel: 'Google Ads 搜索广告 (美国)',
      campaign: 'US-GiftCard-Autumn-2026',
      issueType: 'sell_card_issue',
      issueTypeLabel: '卖卡问题',
      issueSummary: '新用户出卡提示“风控频控拦截，请联系平台客服”',
      chatSummary:
        '推广员AI会话摘要：用户从谷歌广告落地页进入，持有 $500 Apple 实体卡，因网络代理IP切换触发了新客首单频控规则，用户情绪焦虑但出卡意愿极高，已提供完整购买小票照片。',
      relatedCardType: 'Apple Gift Card US $500',
      relatedOrderCode: 'ASTE99KLP1',
      priority: 'P0',
      createdTime: '14:15:30',
      status: 'pending_process',
      statusLabel: '待处理',
    },
    {
      ticketId: 'TKT-PROM-20261005-002',
      visitorOrUserId: 'VISITOR-10928 (尚未实名)',
      channel: 'Telegram 官方推广合伙人B组',
      campaign: 'TG-Crypto-Bounty-V2',
      issueType: 'registration_failed',
      issueTypeLabel: '注册失败',
      issueSummary: '海外手机号无法接收 SMS 验证码',
      chatSummary:
        '推广员会话摘要：合伙人B组在尼日利亚社群拓展大出卡商，多位用户反映使用 +234 号码注册收不到验证码，怀疑国际短信网关屏蔽或运营商拦截。',
      relatedCardType: 'Steam Wallet Global',
      priority: 'P1',
      createdTime: '13:50:00',
      status: 'processing',
      statusLabel: '处理中',
    },
    {
      ticketId: 'TKT-PROM-20261005-003',
      visitorOrUserId: 'USR-77120 (老客王总)',
      channel: 'WhatsApp 专属大客经理通道',
      campaign: 'VIP-Recall-Q4',
      issueType: 'special_quote',
      issueTypeLabel: '特殊报价咨询',
      issueSummary: '单笔 $5,000 Apple 批量卡要求平台申请 0.3pp 专属加息',
      chatSummary:
        '推广经理摘要：大客户手中沉淀 10 张 $500 实体卡，要求放款折率 84.8% (平台当前大盘 84.5%)，要求客服核实商户池是否有能力吃下并在15分钟内核销放款。',
      relatedCardType: 'Apple Gift Card US (批量)',
      priority: 'P0',
      createdTime: '14:20:00',
      status: 'pending_receive',
      statusLabel: '待接收',
    },
    {
      ticketId: 'TKT-PROM-20261005-004',
      visitorOrUserId: 'USR-65201',
      channel: 'TikTok 创作者短视频带货',
      campaign: 'TK-Creator-Boost-09',
      issueType: 'platform_rules',
      issueTypeLabel: '平台规则疑问',
      issueSummary: '用户咨询结清放款到 USDT TRC20 为何需要扣除 1U 网络矿工费',
      chatSummary:
        '推广会话摘要：推广短视频宣传“0手续费卖卡”，用户放款时发现链上转账扣除了 1 USDT 矿工费，认为是虚假宣传，客服需澄清平台不收费但链上手续费系网络扣除，并可补发 1U 体验券。',
      relatedCardType: 'Google Play US $50',
      priority: 'P2',
      createdTime: '12:10:00',
      status: 'resolved',
      statusLabel: '已解决待回传',
      resolutionNote: '客服已与用户电话沟通，澄清链上网络转账费机制，并赠送 2 USDT 首单补贴券，用户表示满意。',
    },
  ]);

  // ============================================================================
  // 8. 卡单过滤与智能排序：严格遵照「已超时 → 即将超时 → 高风险 → 等待时间长」
  // ============================================================================
  const sortedAndFilteredOrders = useMemo(() => {
    // 8.3 全部卡单逻辑：默认不展示卡单内容，需要卡单号进行精准搜索后才展示
    if (orderFilterTab === 'all_orders') {
      const q = orderSearchQuery.trim().toLowerCase();
      if (!q) {
        return []; // 默认不展示卡单内容
      }
      return orderTasks.filter(task => task.id.toLowerCase() === q);
    }

    return orderTasks
      .filter(task => {
        // Tab 过滤
        if (orderFilterTab === 'pending_claim') return task.status === 'pending_claim';
        if (orderFilterTab === 'merchant_reported_anomaly') return task.status === 'merchant_reported_anomaly';
        if (orderFilterTab === 'manual_recalled_pending') return task.status === 'manual_recalled_pending';
        // 全部待处理: 卡单状态仅为 无商户接卡、商户提交异常、已撤回·待处理，其他状态不能出现在全部待处理中
        return (
          task.status === 'pending_claim' ||
          task.status === 'merchant_reported_anomaly' ||
          task.status === 'manual_recalled_pending'
        );
      })
      .filter(task => {
        // 搜索过滤
        if (!orderSearchQuery.trim()) return true;
        const q = orderSearchQuery.toLowerCase();
        return (
          task.id.toLowerCase().includes(q) ||
          task.user.name.toLowerCase().includes(q) ||
          (task.user.userId && task.user.userId.toLowerCase().includes(q)) ||
          task.cardType.toLowerCase().includes(q) ||
          task.country.toLowerCase().includes(q) ||
          task.cardDetails.cardCode.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        // 1. 已超时排最先 (slaStatus === 'overdue' 或 slaRemainingSeconds <= 0)
        const aOverdue = a.slaRemainingSeconds <= 0;
        const bOverdue = b.slaRemainingSeconds <= 0;
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;

        // 2. 商户提交异常优先排前（需要客服仲裁与止损）
        const aAnomaly = a.status === 'merchant_reported_anomaly';
        const bAnomaly = b.status === 'merchant_reported_anomaly';
        if (aAnomaly && !bAnomaly) return -1;
        if (!aAnomaly && bAnomaly) return 1;

        // 3. 即将超时 (slaStatus === 'warning')
        const aSoon = a.status === 'overdue_soon' || a.slaStatus === 'warning';
        const bSoon = b.status === 'overdue_soon' || b.slaStatus === 'warning';
        if (aSoon && !bSoon) return -1;
        if (!aSoon && bSoon) return 1;

        // 4. 高风险优先
        if (a.isRiskAnomaly && !b.isRiskAnomaly) return -1;
        if (!a.isRiskAnomaly && b.isRiskAnomaly) return 1;

        // 5. 等待时间长优先 (waitingDurationSeconds 越大排越前)
        return b.waitingDurationSeconds - a.waitingDurationSeconds;
      });
  }, [orderTasks, orderFilterTab, orderSearchQuery]);

  // ============================================================================
  // 客服作业处理逻辑 (接单 / 放行 / 标记异常 / 改派 / 人工撤回 / 驳回异常)
  // ============================================================================
  const handleOpenProcessOrder = (task: CardOrderTask) => {
    setProcessingOrder(task);
    setOperatorNote('');
    setIsProcessingDrawerOpen(true);
  };

  // 接单 (无商户接卡 -> 处理中)
  const handleClaimOrder = (orderId: string) => {
    setOrderTasks(prev =>
      prev.map(item =>
        item.id === orderId
          ? {
              ...item,
              status: 'processing',
              statusLabel: '处理中',
              historyLogs: [
                ...item.historyLogs,
                { time: new Date().toLocaleTimeString(), operator: '当前客服', action: '接单并锁定' },
              ],
            }
          : item
      )
    );
    triggerToast(`卡单 [${orderId}] 接单成功，已进入处理中！`);
  };

  // 人工撤回订单 (从商户席位撤回 -> 已撤回·待处理)
  const handleRecallOrder = (orderId: string, reason?: string) => {
    const recallReason = reason || operatorNote || '客服人工从商户席位撤回';
    setOrderTasks(prev =>
      prev.map(item =>
        item.id === orderId
          ? {
              ...item,
              status: 'manual_recalled_pending',
              statusLabel: '已撤回·待处理',
              currentMerchant: null,
              entryReasonLabel: `人工撤回: ${recallReason}`,
              systemAdvice: '卡单已由客服人工撤回，解除商户锁定，建议重新评估改派商户或优先放款',
              historyLogs: [
                ...item.historyLogs,
                {
                  time: new Date().toLocaleTimeString(),
                  operator: '当前客服',
                  action: '执行人工撤回',
                  note: recallReason,
                },
              ],
            }
          : item
      )
    );
    if (processingOrder?.id === orderId) {
      setIsProcessingDrawerOpen(false);
    }
    triggerToast(`卡单 [${orderId}] 已成功人工撤回，进入「已撤回·待处理」队列！`);
  };

  // 驳回商户异常 (商户提交异常 -> 驳回并强制继续履约/处理中)
  const handleRejectMerchantAnomaly = () => {
    if (!processingOrder) return;
    setOrderTasks(prev =>
      prev.map(item =>
        item.id === processingOrder.id
          ? {
              ...item,
              status: 'processing',
              statusLabel: '处理中',
              historyLogs: [
                ...item.historyLogs,
                {
                  time: new Date().toLocaleTimeString(),
                  operator: '当前客服',
                  action: '驳回商户异常提报，指令商户继续履约',
                  note: operatorNote || '官方存证核验卡密有效，商户提报异常不成立',
                },
              ],
            }
          : item
      )
    );
    setIsProcessingDrawerOpen(false);
    triggerToast(`已驳回商户提报异常，卡单 [${processingOrder.id}] 回退至处理中并督促商户履约！`);
  };

  // 放行结清 (处理中/待确认 -> 处理完成)
  const handleCompleteOrder = () => {
    if (!processingOrder) return;
    setOrderTasks(prev =>
      prev.map(item =>
        item.id === processingOrder.id
          ? {
              ...item,
              status: 'completed',
              statusLabel: '处理完成',
              historyLogs: [
                ...item.historyLogs,
                {
                  time: new Date().toLocaleTimeString(),
                  operator: '当前客服',
                  action: '人工核准放款，结算完成',
                  note: operatorNote || '核验一致，予以结清',
                },
              ],
            }
          : item
      )
    );
    setIsProcessingDrawerOpen(false);
    triggerToast(`卡单 [${processingOrder.id}] 放款核准结清完成！`);
  };

  // 强改派商户
  const handleReassignMerchant = () => {
    if (!processingOrder) return;
    setOrderTasks(prev =>
      prev.map(item =>
        item.id === processingOrder.id
          ? {
              ...item,
              currentMerchant: { id: 'M-1004', name: '顺达环球卡券 (备用金牌商户)', rate: '97.2%' },
              status: 'processing',
              statusLabel: '已改派新商户',
              historyLogs: [
                ...item.historyLogs,
                {
                  time: new Date().toLocaleTimeString(),
                  operator: '当前客服',
                  action: '强行改派至备用商户 [顺达环球卡券]',
                  note: operatorNote || '原商户处理停滞超时',
                },
              ],
            }
          : item
      )
    );
    setIsProcessingDrawerOpen(false);
    triggerToast(`已成功将卡单 [${processingOrder.id}] 强行改派给备用商户！`);
  };

  // 标记异常 / 驳回
  const handleMarkAnomaly = () => {
    if (!processingOrder) return;
    setOrderTasks(prev =>
      prev.map(item =>
        item.id === processingOrder.id
          ? {
              ...item,
              status: 'dispute',
              statusLabel: '争议中',
              historyLogs: [
                ...item.historyLogs,
                {
                  time: new Date().toLocaleTimeString(),
                  operator: '当前客服',
                  action: '转入争议与风控复核',
                  note: operatorNote || '卡密或余额异常',
                },
              ],
            }
          : item
      )
    );
    setIsProcessingDrawerOpen(false);
    triggerToast(`已将卡单 [${processingOrder.id}] 标记异常并转入争议流程！`);
  };

  // ============================================================================
  // 商户异常任务介入
  // ============================================================================
  const handleInterveneMerchant = (task: MerchantAnomalyTask) => {
    setSelectedMerchantTask(task);
  };

  const handleResolveMerchantAnomaly = (actionText: string) => {
    if (!selectedMerchantTask) return;
    setMerchantAnomalies(prev =>
      prev.map(item =>
        item.id === selectedMerchantTask.id
          ? {
              ...item,
              status: 'resolved',
              statusLabel: '已恢复',
            }
          : item
      )
    );
    setSelectedMerchantTask(null);
    triggerToast(`商户异常 [${selectedMerchantTask.id}] 处理成功，系统重新校验已恢复正常！`);
  };

  // ============================================================================
  // 推广异常工单处理与回传渠道推广系统 (10.3)
  // ============================================================================
  const handleClaimPromotionTicket = (ticketId: string) => {
    setPromotionTickets(prev =>
      prev.map(item =>
        item.ticketId === ticketId
          ? { ...item, status: 'processing', statusLabel: '处理中' }
          : item
      )
    );
    triggerToast(`推广工单 [${ticketId}] 已接单认领，请尽快处理！`);
  };

  const handleSyncBackPromotionTicket = (ticket: PromotionAnomalyTicket) => {
    setPromotionTickets(prev =>
      prev.map(item =>
        item.ticketId === ticket.ticketId
          ? {
              ...item,
              status: 'synced_back',
              statusLabel: '已回传推广系统',
              resolutionNote: promotionResolveText || '平台问题已闭环处理，推广员可继续服务用户。',
            }
          : item
      )
    );
    setSelectedPromotionTicket(null);
    setPromotionResolveText('');
    triggerToast(`工单 [${ticket.ticketId}] 处理结果已实时回传给渠道推广系统！`);
  };

  return (
    <div className="flex flex-col gap-5 flex-1 w-full max-w-[1600px] mx-auto antialiased text-slate-800 pb-16">
      {/* 消息 Toast */}
      {actionSuccessToast && (
        <div className="fixed top-16 right-8 z-50 bg-slate-900/95 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">task_alt</span>
          <span className="font-medium">{actionSuccessToast}</span>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 顶栏：三大核心模块切换 (卡单作业 ｜ 商户异常 ｜ 推广异常) */}
      {/* ============================================================================ */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">客服工作台</h1>
              {/* 工作开关 */}
              <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${isWorking ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                  <span className="text-xs font-medium text-slate-700">工作状态:</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !isWorking;
                    setIsWorking(nextVal);
                    triggerToast(nextVal ? '已切换为【工作状态】，异常卡单将正常派发至当前坐席' : '已切换为【离线休息状态】，异常卡单将暂停派发');
                  }}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isWorking ? 'bg-emerald-600' : 'bg-slate-300'}`}
                  title={isWorking ? '当前已开工，点击切换为休息离线状态' : '当前已休息，点击切换为工作在线状态'}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${isWorking ? 'translate-x-4' : 'translate-x-0'}`}
                  />
                </button>
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${isWorking ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {isWorking ? '在线工作' : '离线休息'}
                </span>
              </div>
            </div>
          </div>

          {/* 重要提醒：商户报价异常提醒 */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('quote-monitor')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
              title="点击查看商户报价异常详情并跳转至报价监控"
            >
              <span className="material-symbols-outlined text-[16px] text-amber-600 animate-bounce">warning</span>
              <span className="font-bold">商户报价异常提醒 3条</span>
              <span className="text-amber-500 text-[11px] underline">点击查看</span>
            </button>

            <button
              onClick={() => onNavigate('online-service')}
              className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span>在线接待坐席</span>
            </button>
          </div>
        </div>

        {/* 7.1 三大核心模块主导航 Tab */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 rounded-xl shadow-2xs">
          <div className="flex items-center gap-2">
            {/* Tab 1: 卡单作业 */}
            <button
              onClick={() => {
                setActiveMainTab('orders');
                onNavigate('workbench-cs-orders');
              }}
              className={`py-3 px-4 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                activeMainTab === 'orders'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MaterialIcon name="credit_card" size={17} />
              <span>卡单作业</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-bold">
                {orderTasks.filter(o => o.status !== 'completed').length}
              </span>
            </button>

            {/* Tab 2: 商户异常 */}
            <button
              onClick={() => {
                setActiveMainTab('merchant');
                onNavigate('workbench-cs-merchant');
              }}
              className={`py-3 px-4 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                activeMainTab === 'merchant'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MaterialIcon name="storefront" size={17} />
              <span>商户异常</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold">
                {merchantAnomalies.filter(m => m.status !== 'resolved').length}
              </span>
            </button>

            {/* Tab 3: 推广异常 */}
            <button
              onClick={() => {
                setActiveMainTab('promotion');
                onNavigate('workbench-cs-promotion');
              }}
              className={`py-3 px-4 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                activeMainTab === 'promotion'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MaterialIcon name="campaign" size={17} />
              <span>推广异常</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 font-bold">
                {promotionTickets.filter(p => p.status !== 'synced_back').length}
              </span>
            </button>

            {/* Tab 4: 售后待办 */}
            <button
              onClick={() => setActiveMainTab('after_sale')}
              className={`py-3 px-4 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                activeMainTab === 'after_sale'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MaterialIcon name="gavel" size={17} />
              <span>售后待办</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 font-bold">
                2
              </span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            {activeMainTab === 'orders'
              ? ''
              : activeMainTab === 'merchant'
              ? '系统自动诊断 · 明确告诉客服谁有问题、什么问题、怎么处置'
              : activeMainTab === 'promotion'
              ? '渠道推广系统转接 · 包含前序会话纪要 · 处理后一键回传'
              : '碰卡/面额不符争议案卷 · 调取双向凭证 · 客服直接终审裁决'}
          </div>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* 模块一：卡单作业 (8.1 ~ 8.5) */}
      {/* ============================================================================ */}
      {activeMainTab === 'orders' && (
        <div className="flex flex-col gap-4">
          {/* 8.3 页面 Tab 与搜索条 */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
            {/* 8.3 客服卡单作业 5 个状态筛选 Tab */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              {/* 1. 全部待处理 */}
              <button
                onClick={() => setOrderFilterTab('all_pending')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  orderFilterTab === 'all_pending'
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                全部待处理 ({orderTasks.filter(o => o.status === 'pending_claim' || o.status === 'merchant_reported_anomaly' || o.status === 'manual_recalled_pending').length})
              </button>

              {/* 2. 无商户接卡 */}
              <button
                onClick={() => setOrderFilterTab('pending_claim')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  orderFilterTab === 'pending_claim'
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                无商户接卡 ({orderTasks.filter(o => o.status === 'pending_claim').length})
              </button>

              {/* 3. 商户提交异常 */}
              <button
                onClick={() => setOrderFilterTab('merchant_reported_anomaly')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  orderFilterTab === 'merchant_reported_anomaly'
                    ? 'bg-rose-600 text-white shadow-2xs font-bold'
                    : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">report</span>
                <span>商户提交异常</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  orderFilterTab === 'merchant_reported_anomaly' ? 'bg-white text-rose-700' : 'bg-rose-200 text-rose-900'
                }`}>
                  {orderTasks.filter(o => o.status === 'merchant_reported_anomaly').length}
                </span>
              </button>

              {/* 4. 已撤回·待处理 */}
              <button
                onClick={() => setOrderFilterTab('manual_recalled_pending')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  orderFilterTab === 'manual_recalled_pending'
                    ? 'bg-amber-600 text-white shadow-2xs font-bold'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">undo</span>
                <span>已撤回·待处理</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  orderFilterTab === 'manual_recalled_pending' ? 'bg-white text-amber-800' : 'bg-amber-200 text-amber-900'
                }`}>
                  {orderTasks.filter(o => o.status === 'manual_recalled_pending').length}
                </span>
              </button>

              {/* 5. 全部卡单 */}
              <button
                onClick={() => setOrderFilterTab('all_orders')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  orderFilterTab === 'all_orders'
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">search_insights</span>
                <span>全部卡单</span>
              </button>
            </div>

            {/* 搜索框 */}
            <div className="relative w-80 flex items-center">
              <span className="material-symbols-outlined text-[16px] text-slate-400 absolute left-2.5 pointer-events-none">
                search
              </span>
              <input
                type="text"
                placeholder={
                  orderFilterTab === 'all_orders'
                    ? '输入卡单号进行精准搜索 (如 ASTE99KLP1)...'
                    : '搜索卡单号、用户、卡种或卡密...'
                }
                value={orderSearchQuery}
                onChange={e => setOrderSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
              />
              {orderSearchQuery && (
                <button
                  type="button"
                  onClick={() => setOrderSearchQuery('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="清空搜索"
                >
                  <MaterialIcon name="close" size={14} />
                </button>
              )}
            </div>
          </div>

          {/* 8.4 卡片/列表展示规定字段 */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="overflow-x-auto pb-24">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3 min-w-[120px]">卡单号</th>
                    <th className="py-2.5 px-3 min-w-[140px]">用户</th>
                    <th className="py-2.5 px-3 min-w-[180px]">卡种信息</th>
                    <th className="py-2.5 px-3 min-w-[130px]">面额/数量</th>
                    <th className="py-2.5 px-3 min-w-[210px]">报价</th>
                    <th className="py-2.5 px-3 min-w-[120px]">当前商户</th>
                    <th className="py-2.5 px-3 min-w-[170px]">卡单处理人</th>
                    <th className="py-2.5 px-3 w-24">当前状态</th>
                    <th className="py-2.5 px-3 min-w-[110px]">等待时间</th>
                    <th className="py-2.5 px-3 w-[156px] min-w-[156px] text-center sticky right-0 bg-slate-50 z-20 shadow-[-6px_0_8px_-4px_rgba(0,0,0,0.06)] whitespace-nowrap">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedAndFilteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        {orderFilterTab === 'all_orders' ? (
                          !orderSearchQuery.trim() ? (
                            <div className="flex flex-col items-center justify-center max-w-lg mx-auto py-6 text-center">
                              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 shadow-2xs border border-blue-100">
                                <span className="material-symbols-outlined text-[28px]">search</span>
                              </div>
                              <h4 className="text-sm font-bold text-slate-800">请输入卡单号进行精准搜索</h4>
                              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                全部卡单模式下默认不展示卡单内容，需要输入完整的卡单号进行精准搜索后方可查看对应卡单详情及操作。
                              </p>
                              {/* 快捷填入示例 */}
                              <div className="mt-4 flex flex-col items-center gap-2">
                                <span className="text-[11px] text-slate-400 font-medium">点击单号快捷填入体验 9 种状态：</span>
                                <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-lg">
                                  {[
                                    { id: 'ASTE99KLP1', label: '无商户接卡' },
                                    { id: 'ASTE8821DE', label: '商户提交异常' },
                                    { id: 'AGOO9912US', label: '已撤回·待处理' },
                                    { id: 'AWMC1002US', label: '待商户接卡' },
                                    { id: 'AAPP08GW7Z', label: '待商户处理' },
                                    { id: 'AAPP9901US', label: '售后中' },
                                    { id: 'AFLT4411US', label: '失败待审核' },
                                    { id: 'ASUC8899US', label: '处理成功' },
                                    { id: 'AFLS7722US', label: '处理失败' },
                                  ].map(sample => (
                                    <button
                                      key={sample.id}
                                      type="button"
                                      onClick={() => setOrderSearchQuery(sample.id)}
                                      className="px-2 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-700 text-[11px] font-mono border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                                      title={`点击填入 ${sample.id}`}
                                    >
                                      <span className="font-bold">{sample.id}</span>
                                      <span className="text-[10px] text-slate-500 font-sans">({sample.label})</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center max-w-md mx-auto py-6 text-center">
                              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-2.5">
                                <span className="material-symbols-outlined text-[24px]">search_off</span>
                              </div>
                              <h4 className="text-xs font-bold text-slate-700">未查找到匹配的卡单</h4>
                              <p className="text-[11px] text-slate-400 mt-1">
                                卡单号 “<span className="font-mono text-slate-600 font-semibold">{orderSearchQuery}</span>” 未在系统中匹配到记录，请核对卡单号后重新输入。
                              </p>
                              <button
                                type="button"
                                onClick={() => setOrderSearchQuery('')}
                                className="mt-3 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium cursor-pointer transition-colors"
                              >
                                清空搜索
                              </button>
                            </div>
                          )
                        ) : orderFilterTab === 'merchant_reported_anomaly'
                          ? '当前暂无商户提交异常卡单，商户核销运行平稳！'
                          : orderFilterTab === 'manual_recalled_pending'
                          ? '当前暂无已撤回待处理卡单！'
                          : orderFilterTab === 'pending_claim'
                          ? '当前暂无无商户接卡订单，撮合流转顺畅！'
                          : '当前暂无待处理卡单，全平台作业流转顺畅！'}
                      </td>
                    </tr>
                  ) : (
                    sortedAndFilteredOrders.map((task, rowIndex) => {
                      const isOverdue = task.slaRemainingSeconds <= 0;
                      const isSoon = task.status === 'overdue_soon' || task.slaStatus === 'warning';
                      const isDropdownOpen = activeDropdownOrderId === task.id;
                      const isNearBottom = rowIndex >= sortedAndFilteredOrders.length - 2 && sortedAndFilteredOrders.length >= 3;

                      return (
                        <tr
                          key={task.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isDropdownOpen ? 'relative z-30' : ''
                          } ${
                            isOverdue
                              ? 'bg-rose-50/20'
                              : isSoon
                              ? 'bg-amber-50/15'
                              : ''
                          }`}
                        >
                          {/* 卡单号 (去掉了副标题，纯净展示示例 AAPP08GW7Z) */}
                          <td className="py-3 px-3 font-mono font-bold text-blue-600 select-all tracking-wide text-xs">
                            {task.id}
                          </td>

                          {/* 用户 (第1行: 用户昵称 + 发起实时会话标识 / 第2行: 等级和用户ID，示例: V3 USNEO3N9Z) */}
                          <td className="py-3 px-3">
                            <div className="flex flex-col justify-center">
                              {/* 第一行: 用户昵称 + 发起实时会话标识 */}
                              <div className="flex items-center gap-1">
                                <span className="font-semibold text-slate-900 text-xs leading-snug truncate max-w-[110px]" title={task.user.name}>
                                  {task.user.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenLiveChat('user', task)}
                                  className="w-4.5 h-4.5 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                                  title={`与用户「${task.user.name}」发起实时会话`}
                                >
                                  <MaterialIcon name="chat" size={13} />
                                </button>
                              </div>
                              {/* 第二行: 等级和用户ID (示例: V3 USNEO3N9Z) */}
                              <div className="flex items-center gap-1.5 mt-1 group/user relative">
                                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold leading-none ${getUserLevelBadgeClass(task.user.level)}`}>
                                  {(task.user.level || 'V1').replace('VIP', 'V')}
                                </span>
                                <span
                                  onClick={(e) => handleCopyUserId(e, task.user.userId || 'USNEO3N9Z')}
                                  className="font-mono text-[11px] text-slate-500 font-medium hover:text-blue-600 cursor-pointer select-all tracking-tight flex items-center gap-0.5 transition-colors"
                                  title="点击复制用户ID"
                                >
                                  {task.user.userId || 'USNEO3N9Z'}
                                  <span className="material-symbols-outlined text-[12px] opacity-0 group-hover/user:opacity-70 transition-opacity">
                                    content_copy
                                  </span>
                                </span>
                                {copiedUserId === (task.user.userId || 'USNEO3N9Z') && (
                                  <span className="absolute -top-5 left-7 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded shadow-md pointer-events-none z-10 font-sans whitespace-nowrap">
                                    已复制ID
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* 卡种信息 (第1行: 卡图标 和 卡标题 同行不跨行；第2行: 标签 US美国 卡图 快卡，无国旗) */}
                          <td className="py-3 px-3">
                            <div className="flex flex-col justify-center min-w-0">
                              {/* 第一行: 卡图标 + 卡标题 (卡图标不跨两行) */}
                              <div className="flex items-center gap-1.5 min-w-0">
                                <CardBrandLogo card={{ brandName: task.cardType, iconType: task.cardTypeIcon }} size="xs" />
                                <span className="font-bold text-slate-900 truncate text-xs leading-none" title={task.cardFullName || task.cardType}>
                                  {task.cardFullName || task.cardType}
                                </span>
                              </div>
                              {/* 第二行: 标签 US美国 卡图 快卡 (选项1，无国旗) */}
                              <div className="flex items-center gap-1 flex-wrap mt-1.5">
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium leading-none whitespace-nowrap">
                                  {task.country}{task.countryName}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 font-medium leading-none whitespace-nowrap">
                                  {task.mediaTypeLabel || (task.cardDetails?.imageReflections ? '卡图' : '电子码')}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium leading-none whitespace-nowrap">
                                  {task.speedTag || '快卡'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 面额/数量 (去掉货币单位: 面值: 500 / 卡数量: 1) */}
                          <td className="py-3 px-3 font-mono">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900">
                                面值: {task.faceValue}
                              </span>
                              <span className="text-[11px] text-slate-500 font-medium mt-0.5">
                                卡数量: {task.cardQuantity ?? 1}
                              </span>
                            </div>
                          </td>

                          {/* 报价 (放在字段【面额/数量】后面) */}
                          <td className="py-3 px-3">
                            <div className="flex flex-col gap-1 text-xs">
                              {/* 第一行: 用户成交报价 */}
                              <div className="flex items-center gap-1 font-mono whitespace-nowrap">
                                <span className="text-slate-500 font-sans text-[11px]">用户成交报价：</span>
                                <span className="font-semibold text-emerald-700">
                                  {task.userDealQuote || '￥7.0000/₦1386'}
                                </span>
                              </div>
                              {/* 第二行: 收卡报价 */}
                              <div className="flex items-center gap-1 font-mono whitespace-nowrap">
                                <span className="text-slate-500 font-sans text-[11px]">收卡报价：</span>
                                <span className="font-semibold text-blue-700">
                                  {task.merchantQuote || '￥8.0000'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 当前商户 (加发起实时会话标识，去掉了履约率) */}
                          <td className="py-3 px-3">
                            {task.currentMerchant ? (
                              <div className="flex items-center gap-1">
                                <span className="font-semibold text-slate-800 truncate max-w-[100px]" title={task.currentMerchant.name}>
                                  {task.currentMerchant.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenLiveChat('merchant', task)}
                                  className="w-4.5 h-4.5 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                                  title={`与商户「${task.currentMerchant.name}」发起实时会话`}
                                >
                                  <MaterialIcon name="chat" size={13} />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
                                待撮合商户
                              </span>
                            )}
                          </td>

                          {/* 卡单处理人: 放在字段【当前商户】后面 */}
                          <td className="py-3 px-3">
                            {(() => {
                              const handler = getTaskHandler(task);
                              if (!handler) {
                                return (
                                  <span className="text-slate-400 font-mono text-xs select-none">
                                    --
                                  </span>
                                );
                              }
                              return (
                                <div className="flex flex-col justify-center">
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-slate-800 font-medium truncate max-w-[145px]" title={handler.label}>
                                      {handler.label}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenLiveChat('handler', task)}
                                      className="w-4.5 h-4.5 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                                      title={`与处理人「${handler.name}」发起协同会话`}
                                    >
                                      <MaterialIcon name="chat" size={13} />
                                    </button>
                                  </div>
                                  {task.status === 'failed_pending_audit' && (
                                    <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                                      审核人：{task.auditReviewer || '1号客服'}
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                          </td>

                          {/* 当前状态 (5.1 状态胶囊) */}
                          <td className="py-3 px-3">
                            <StatusBadge
                              status={
                                task.status === 'merchant_reported_anomaly' ? 'danger' :
                                task.status === 'manual_recalled_pending' ? 'warning' :
                                task.status === 'waiting_merchant_claim' ? 'warning' :
                                task.status === 'waiting_merchant_process' ? 'info' :
                                task.status === 'after_sale' ? 'dispute' :
                                task.status === 'failed_pending_audit' ? 'danger' :
                                task.status === 'completed' ? 'success' :
                                task.status === 'failed' ? 'danger' :
                                task.status === 'processing' ? 'info' :
                                task.status === 'pending_confirm' ? 'warning' :
                                task.status === 'dispute' ? 'dispute' :
                                task.status === 'overdue_soon' ? 'warning' : 'neutral'
                              }
                              label={task.statusLabel}
                              dot
                            />
                          </td>

                          {/* 等待时间 (第1行: 持续等待时间 简洁格式 03:20，无图标 / 第2行: 超时180s 或 剩余45s 纯秒数，不需要图标和背景图，只需要展示具体值加个颜色即可) */}
                          <td className="py-3 px-3">
                            <div className="flex flex-col justify-center font-mono">
                              {/* 第一行: 持续等待时间 (简洁格式 03:20，去掉图标) */}
                              <span className="text-slate-800 font-semibold text-xs">
                                {formatConciseDuration(task.waitingDurationSeconds)}
                              </span>
                              {/* 第二行: 超时/剩余 (纯秒数，不需要图标和背景图，只需要展示具体值加个颜色即可) */}
                              <div className="mt-1">
                                {isOverdue ? (
                                  <span className="text-[11px] font-semibold text-rose-600 font-mono whitespace-nowrap leading-none">
                                    超时 {Math.abs(task.slaRemainingSeconds)}s
                                  </span>
                                ) : isSoon ? (
                                  <span className="text-[11px] font-semibold text-amber-600 font-mono whitespace-nowrap leading-none">
                                    剩余 {task.slaRemainingSeconds}s
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-medium text-emerald-600 font-mono whitespace-nowrap leading-none">
                                    剩余 {task.slaRemainingSeconds}s
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* 操作: 上下两行布局，视觉宽度严格一致，四字及以上独占一行，去掉小图标仅展示文字 */}
                          <td className={`py-2 px-3 text-center sticky right-0 z-10 whitespace-nowrap shadow-[-6px_0_8px_-4px_rgba(0,0,0,0.06)] ${
                            isOverdue
                              ? 'bg-rose-50/95'
                              : isSoon
                              ? 'bg-amber-50/95'
                              : 'bg-white'
                          }`}>
                            <div className="w-[136px] mx-auto flex flex-col gap-1 items-stretch">
                              {/* 1. 无商户接卡 或 已撤回·待处理 */}
                              {(task.status === 'pending_claim' || task.status === 'manual_recalled_pending') && (
                                <>
                                  <div className="w-full h-[26px]">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenCardActionModal('dispatch', task)}
                                      className="w-full h-full rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-2xs cursor-pointer transition-colors flex items-center justify-center whitespace-nowrap"
                                    >
                                      派单
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-1 w-full h-[26px]">
                                    <div className="relative w-full h-full">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveDropdownOrderId(activeDropdownOrderId === task.id ? null : task.id);
                                        }}
                                        className={`w-full h-full rounded border text-xs font-medium cursor-pointer transition-colors flex items-center justify-center gap-0.5 whitespace-nowrap ${
                                          isDropdownOpen
                                            ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold shadow-2xs'
                                            : 'border-slate-300 hover:bg-slate-100 bg-white text-slate-700'
                                        }`}
                                        title="更多操作"
                                      >
                                        <span>更多 ▾</span>
                                      </button>
                                      {isDropdownOpen && (
                                        <div
                                          className={`absolute left-0 ${isNearBottom ? 'bottom-full mb-1' : 'top-full mt-1'} w-36 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-30 divide-y divide-slate-100 text-left animate-in fade-in zoom-in-95 duration-100`}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <div className="py-0.5">
                                            {/* 1》修改卡信息 */}
                                            <button
                                              type="button"
                                              onClick={() => handleOpenCardActionModal('editCard', task)}
                                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                                            >
                                              <span className="material-symbols-outlined text-[15px] text-indigo-500">edit_note</span>
                                              <span>修改卡信息</span>
                                            </button>
                                            {/* 2》同步用户信息 */}
                                            <button
                                              type="button"
                                              onClick={() => handleOpenCardActionModal('syncUser', task)}
                                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                                            >
                                              <span className="material-symbols-outlined text-[15px] text-emerald-500">sync</span>
                                              <span>同步用户信息</span>
                                            </button>
                                            {/* 3》转单 */}
                                            <button
                                              type="button"
                                              onClick={() => handleOpenCardActionModal('transfer', task)}
                                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                                            >
                                              <span className="material-symbols-outlined text-[15px] text-amber-500">swap_horiz</span>
                                              <span>转单</span>
                                            </button>
                                            {/* 4》直接处理 */}
                                            <button
                                              type="button"
                                              onClick={() => handleOpenCardActionModal('directProcess', task)}
                                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                                            >
                                              <span className="material-symbols-outlined text-[15px] text-purple-500">bolt</span>
                                              <span>直接处理</span>
                                            </button>
                                            {/* 5》拆单 */}
                                            {getTaskCardItems(task).length >= 2 && (
                                              <button
                                                type="button"
                                                onClick={() => handleOpenCardActionModal('splitOrder', task)}
                                                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-800 flex items-center gap-1.5 cursor-pointer transition-colors"
                                              >
                                                <span className="material-symbols-outlined text-[15px] text-amber-600">call_split</span>
                                                <span>拆单</span>
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenProcessOrder(task)}
                                      className="w-full h-full rounded border border-slate-300 hover:bg-slate-100 bg-white text-slate-700 text-xs font-medium cursor-pointer transition-colors flex items-center justify-center whitespace-nowrap"
                                    >
                                      详情
                                    </button>
                                  </div>
                                </>
                              )}

                              {/* 2. 商户提交异常 */}
                              {task.status === 'merchant_reported_anomaly' && (
                                <>
                                  <div className="w-full h-[26px]">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenCardActionModal('resolveAnomaly', task)}
                                      className="w-full h-full rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-2xs cursor-pointer transition-colors flex items-center justify-center whitespace-nowrap"
                                    >
                                      解除异常
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-1 w-full h-[26px]">
                                    <div className="relative w-full h-full">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveDropdownOrderId(activeDropdownOrderId === task.id ? null : task.id);
                                        }}
                                        className={`w-full h-full rounded border text-xs font-medium cursor-pointer transition-colors flex items-center justify-center gap-0.5 whitespace-nowrap ${
                                          isDropdownOpen
                                            ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold shadow-2xs'
                                            : 'border-slate-300 hover:bg-slate-100 bg-white text-slate-700'
                                        }`}
                                        title="更多操作"
                                      >
                                        <span>更多 ▾</span>
                                      </button>
                                      {isDropdownOpen && (
                                        <div
                                          className={`absolute left-0 ${isNearBottom ? 'bottom-full mb-1' : 'top-full mt-1'} w-36 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-30 divide-y divide-slate-100 text-left animate-in fade-in zoom-in-95 duration-100`}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <div className="py-0.5">
                                            <button
                                              type="button"
                                              onClick={() => handleOpenCardActionModal('editCard', task)}
                                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                                            >
                                              <span className="material-symbols-outlined text-[15px] text-indigo-500">edit_note</span>
                                              <span>修改卡信息</span>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleOpenCardActionModal('recall', task)}
                                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                                            >
                                              <span className="material-symbols-outlined text-[15px] text-rose-500">undo</span>
                                              <span>撤回卡单</span>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleOpenCardActionModal('syncUser', task)}
                                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                                            >
                                              <span className="material-symbols-outlined text-[15px] text-emerald-500">sync</span>
                                              <span>同步用户信息</span>
                                            </button>
                                            {getTaskCardItems(task).length >= 2 && (
                                              <button
                                                type="button"
                                                onClick={() => handleOpenCardActionModal('splitOrder', task)}
                                                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-800 flex items-center gap-1.5 cursor-pointer transition-colors"
                                              >
                                                <span className="material-symbols-outlined text-[15px] text-amber-600">call_split</span>
                                                <span>拆单</span>
                                              </button>
                                            )}
                                            <button
                                              type="button"
                                              onClick={() => handleOpenCardActionModal('transfer', task)}
                                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                                            >
                                              <span className="material-symbols-outlined text-[15px] text-amber-500">swap_horiz</span>
                                              <span>转单</span>
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenProcessOrder(task)}
                                      className="w-full h-full rounded border border-slate-300 hover:bg-slate-100 bg-white text-slate-700 text-xs font-medium cursor-pointer transition-colors flex items-center justify-center whitespace-nowrap"
                                    >
                                      详情
                                    </button>
                                  </div>
                                </>
                              )}

                              {/* 3. 待商户处理 */}
                              {(task.status === 'waiting_merchant_process' || task.status === 'processing' || task.status === 'overdue_soon') && (
                                <>
                                  <div className="w-full h-[26px]">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenCardActionModal('editCard', task)}
                                      className="w-full h-full rounded bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-2xs cursor-pointer transition-colors flex items-center justify-center whitespace-nowrap"
                                    >
                                      修改卡信息
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-1 w-full h-[26px]">
                                    <div className="relative w-full h-full">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveDropdownOrderId(activeDropdownOrderId === task.id ? null : task.id);
                                        }}
                                        className={`w-full h-full rounded border text-xs font-medium cursor-pointer transition-colors flex items-center justify-center gap-0.5 whitespace-nowrap ${
                                          isDropdownOpen
                                            ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold shadow-2xs'
                                            : 'border-slate-300 hover:bg-slate-100 bg-white text-slate-700'
                                        }`}
                                        title="更多操作"
                                      >
                                        <span>更多 ▾</span>
                                      </button>
                                      {isDropdownOpen && (
                                        <div
                                          className={`absolute left-0 ${isNearBottom ? 'bottom-full mb-1' : 'top-full mt-1'} w-36 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-30 divide-y divide-slate-100 text-left animate-in fade-in zoom-in-95 duration-100`}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <div className="py-0.5">
                                            <button
                                              type="button"
                                              onClick={() => handleOpenCardActionModal('recall', task)}
                                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                                            >
                                              <span className="material-symbols-outlined text-[15px] text-rose-500">undo</span>
                                              <span>撤回卡单</span>
                                            </button>
                                            {(task.status === 'waiting_merchant_process' || task.statusLabel === '待商户处理') && (
                                              <button
                                                type="button"
                                                onClick={() => handleOpenCardActionModal('manualDelay', task)}
                                                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-800 flex items-center gap-1.5 cursor-pointer transition-colors"
                                              >
                                                <span className="material-symbols-outlined text-[15px] text-amber-600">more_time</span>
                                                <span>手动延时</span>
                                              </button>
                                            )}
                                            <button
                                              type="button"
                                              onClick={() => handleOpenCardActionModal('syncUser', task)}
                                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                                            >
                                              <span className="material-symbols-outlined text-[15px] text-emerald-500">sync</span>
                                              <span>同步用户信息</span>
                                            </button>
                                            {getTaskCardItems(task).length >= 2 && (
                                              <button
                                                type="button"
                                                onClick={() => handleOpenCardActionModal('splitOrder', task)}
                                                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-800 flex items-center gap-1.5 cursor-pointer transition-colors"
                                              >
                                                <span className="material-symbols-outlined text-[15px] text-amber-600">call_split</span>
                                                <span>拆单</span>
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenProcessOrder(task)}
                                      className="w-full h-full rounded border border-slate-300 hover:bg-slate-100 bg-white text-slate-700 text-xs font-medium cursor-pointer transition-colors flex items-center justify-center whitespace-nowrap"
                                    >
                                      详情
                                    </button>
                                  </div>
                                </>
                              )}

                              {/* 4. 待商户接卡 */}
                              {task.status === 'waiting_merchant_claim' && (
                                <>
                                  <div className="w-full h-[26px]">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenCardActionModal('syncUser', task)}
                                      className="w-full h-full rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-2xs cursor-pointer transition-colors flex items-center justify-center whitespace-nowrap"
                                    >
                                      同步用户信息
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-1 w-full h-[26px]">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenCardActionModal('recall', task)}
                                      className="w-full h-full rounded border border-rose-300 hover:bg-rose-50 bg-white text-rose-700 text-xs font-medium cursor-pointer transition-colors flex items-center justify-center whitespace-nowrap"
                                    >
                                      撤回卡单
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenProcessOrder(task)}
                                      className="w-full h-full rounded border border-slate-300 hover:bg-slate-100 bg-white text-slate-700 text-xs font-medium cursor-pointer transition-colors flex items-center justify-center whitespace-nowrap"
                                    >
                                      详情
                                    </button>
                                  </div>
                                </>
                              )}

                              {/* 5. 售后中 或 失败待审核 */}
                              {(task.status === 'after_sale' || task.status === 'failed_pending_audit') && (
                                <div className="grid grid-cols-2 gap-1 w-full h-[26px]">
                                  <div className="relative w-full h-full">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveDropdownOrderId(activeDropdownOrderId === task.id ? null : task.id);
                                        }}
                                        className={`w-full h-full rounded border text-xs font-medium cursor-pointer transition-colors flex items-center justify-center gap-0.5 whitespace-nowrap ${
                                          isDropdownOpen
                                            ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold shadow-2xs'
                                            : 'border-slate-300 hover:bg-slate-100 bg-white text-slate-700'
                                        }`}
                                        title="更多操作"
                                      >
                                        <span>更多 ▾</span>
                                      </button>
                                      {isDropdownOpen && (
                                        <div
                                          className={`absolute left-0 ${isNearBottom ? 'bottom-full mb-1' : 'top-full mt-1'} w-36 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-30 divide-y divide-slate-100 text-left animate-in fade-in zoom-in-95 duration-100`}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <div className="py-0.5">
                                            <button
                                              type="button"
                                              onClick={() => handleOpenCardActionModal('editCard', task)}
                                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                                            >
                                              <span className="material-symbols-outlined text-[15px] text-indigo-500">edit_note</span>
                                              <span>修改卡信息</span>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleOpenCardActionModal('recall', task)}
                                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                                            >
                                              <span className="material-symbols-outlined text-[15px] text-rose-500">undo</span>
                                              <span>撤回卡单</span>
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenProcessOrder(task)}
                                      className="w-full h-full rounded border border-slate-300 hover:bg-slate-100 bg-white text-slate-700 text-xs font-medium cursor-pointer transition-colors flex items-center justify-center whitespace-nowrap"
                                    >
                                      详情
                                    </button>
                                  </div>
                              )}

                              {/* 6. 处理成功或处理失败 */}
                              {(task.status === 'completed' || task.status === 'failed') && (
                                <>
                                  <div className="w-full h-[26px]">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenCardActionModal('syncUser', task)}
                                      className="w-full h-full rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-2xs cursor-pointer transition-colors flex items-center justify-center whitespace-nowrap"
                                    >
                                      同步用户信息
                                    </button>
                                  </div>
                                  <div className="w-full h-[26px]">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenProcessOrder(task)}
                                      className="w-full h-full rounded border border-slate-300 hover:bg-slate-100 bg-white text-slate-700 text-xs font-medium cursor-pointer transition-colors flex items-center justify-center whitespace-nowrap"
                                    >
                                      详情
                                    </button>
                                  </div>
                                </>
                              )}

                              {/* 7. 争议中 或 待人工确认 */}
                              {(task.status === 'dispute' || task.status === 'pending_confirm') && (
                                <>
                                  <div className="w-full h-[26px]">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenCardActionModal('syncUser', task)}
                                      className="w-full h-full rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-2xs cursor-pointer transition-colors flex items-center justify-center whitespace-nowrap"
                                    >
                                      同步用户信息
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-1 w-full h-[26px]">
                                    <div className="relative w-full h-full">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveDropdownOrderId(activeDropdownOrderId === task.id ? null : task.id);
                                        }}
                                        className={`w-full h-full rounded border text-xs font-medium cursor-pointer transition-colors flex items-center justify-center gap-0.5 whitespace-nowrap ${
                                          isDropdownOpen
                                            ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold shadow-2xs'
                                            : 'border-slate-300 hover:bg-slate-100 bg-white text-slate-700'
                                        }`}
                                        title="更多操作"
                                      >
                                        <span>更多 ▾</span>
                                      </button>
                                      {isDropdownOpen && (
                                        <div
                                          className={`absolute left-0 ${isNearBottom ? 'bottom-full mb-1' : 'top-full mt-1'} w-36 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-30 divide-y divide-slate-100 text-left animate-in fade-in zoom-in-95 duration-100`}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <div className="py-0.5">
                                            <button
                                              type="button"
                                              onClick={() => handleOpenCardActionModal('transfer', task)}
                                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                                            >
                                              <span className="material-symbols-outlined text-[15px] text-amber-500">swap_horiz</span>
                                              <span>转单</span>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleOpenCardActionModal('directProcess', task)}
                                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                                            >
                                              <span className="material-symbols-outlined text-[15px] text-purple-500">bolt</span>
                                              <span>直接处理</span>
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenProcessOrder(task)}
                                      className="w-full h-full rounded border border-slate-300 hover:bg-slate-100 bg-white text-slate-700 text-xs font-medium cursor-pointer transition-colors flex items-center justify-center whitespace-nowrap"
                                    >
                                      详情
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 模块二：商户异常任务 (9.1 ~ 9.3) */}
      {/* ============================================================================ */}
      {activeMainTab === 'merchant' && (
        <div className="flex flex-col gap-4">
          {/* 异常看板说明 */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[19px]">report_problem</span>
              </span>
              <div className="flex flex-col">
                <span className="font-bold text-amber-900 text-sm">
                  商户异常自动化介入引擎 · 闭环自愈机制
                </span>
                <span className="text-amber-800 text-[11.5px] mt-0.5">
                  规则：系统自动发现异常 ➔ 无法自愈则派单给客服 ➔ 客服介入协调 ➔ 商户处理 ➔ 系统自动重新验证 ➔ 恢复后自动关闭归档
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded-md bg-white border border-amber-200 text-amber-800 font-mono font-semibold">
                在途异常: {merchantAnomalies.filter(m => m.status !== 'resolved').length} 起
              </span>
            </div>
          </div>

          {/* 9.2 规定字段列表：商户｜异常类型｜关联SKU/卡单｜发生时间｜持续时间｜影响订单｜建议动作｜负责人｜状态 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3 min-w-[130px]">商户</th>
                    <th className="py-2.5 px-3 min-w-[140px]">异常类型</th>
                    <th className="py-2.5 px-3 min-w-[160px]">关联 SKU / 影响卡单</th>
                    <th className="py-2.5 px-3 w-24">发生时间</th>
                    <th className="py-2.5 px-3 w-20">持续时间</th>
                    <th className="py-2.5 px-3 min-w-[110px]">影响范围</th>
                    <th className="py-2.5 px-3 min-w-[200px]">建议动作</th>
                    <th className="py-2.5 px-3 w-28">负责人</th>
                    <th className="py-2.5 px-3 w-24">状态</th>
                    <th className="py-2.5 px-3 w-24 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {merchantAnomalies.map(anomaly => (
                    <tr
                      key={anomaly.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        anomaly.status === 'resolved' ? 'opacity-50 bg-slate-50/50' : ''
                      }`}
                    >
                      {/* 商户 */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{anomaly.merchant.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {anomaly.merchant.id} · 质押: {anomaly.merchant.depositBalance}
                          </span>
                        </div>
                      </td>

                      {/* 异常类型 */}
                      <td className="py-3 px-3">
                        <span className="font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                          {anomaly.anomalyTypeLabel}
                        </span>
                      </td>

                      {/* 关联 SKU / 卡单 */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800">{anomaly.relatedSku}</span>
                          <span className="text-[10px] text-blue-600 font-mono truncate">
                            {anomaly.relatedOrderCodes.join(', ')}
                          </span>
                        </div>
                      </td>

                      {/* 发生时间 */}
                      <td className="py-3 px-3 font-mono text-slate-600">{anomaly.occurredTime}</td>

                      {/* 持续时间 */}
                      <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                        {anomaly.durationMinutes} 分钟
                      </td>

                      {/* 影响订单 */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col font-mono">
                          <span className="font-bold text-slate-900">
                            {anomaly.impactedOrdersCount} 笔卡单
                          </span>
                          <span className="text-[10px] text-rose-600 font-semibold">
                            {anomaly.impactedAmount}
                          </span>
                        </div>
                      </td>

                      {/* 建议动作 */}
                      <td className="py-3 px-3 text-slate-700 leading-snug">
                        <div className="flex items-start gap-1">
                          <span className="material-symbols-outlined text-blue-600 text-[14px] shrink-0 mt-0.5">
                            bolt
                          </span>
                          <span>{anomaly.suggestedAction}</span>
                        </div>
                      </td>

                      {/* 负责人 */}
                      <td className="py-3 px-3">
                        <span className="text-slate-800 font-medium">{anomaly.owner}</span>
                      </td>

                      {/* 状态 */}
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            anomaly.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : anomaly.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {anomaly.statusLabel}
                        </span>
                      </td>

                      {/* 操作 */}
                      <td className="py-3 px-3 text-right">
                        {anomaly.status !== 'resolved' ? (
                          <button
                            type="button"
                            onClick={() => handleInterveneMerchant(anomaly)}
                            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-2xs cursor-pointer"
                          >
                            介入处置
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-semibold">已闭环</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 模块三：推广异常工单 (10.1 ~ 10.3) */}
      {/* ============================================================================ */}
      {activeMainTab === 'promotion' && (
        <div className="flex flex-col gap-4">
          {/* 推广异常总览卡 */}
          <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[19px]">connect_without_contact</span>
              </span>
              <div className="flex flex-col">
                <span className="font-bold text-purple-950 text-sm">
                  渠道推广系统异常接单与回传专线
                </span>
                <span className="text-purple-800 text-[11.5px] mt-0.5">
                  推广系统发现平台问题 ➔ 自动生成 Ticket ➔ 平台客服处理 ➔ 结果实时回传渠道推广系统 ➔ 推广端恢复服务用户
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded-md bg-white border border-purple-200 text-purple-800 font-mono font-semibold">
                待闭环工单: {promotionTickets.filter(p => p.status !== 'synced_back').length} 件
              </span>
            </div>
          </div>

          {/* 10.2 规定入参卡片列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promotionTickets.map(ticket => (
              <div
                key={ticket.ticketId}
                className={`bg-white rounded-xl p-4 border transition-all flex flex-col justify-between ${
                  ticket.status === 'synced_back'
                    ? 'border-slate-200 opacity-60 bg-slate-50/40'
                    : ticket.priority === 'P0'
                    ? 'border-rose-300 shadow-xs ring-1 ring-rose-200'
                    : 'border-slate-200 hover:border-blue-400'
                }`}
              >
                <div>
                  {/* 工单头部 */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-600 text-xs">
                        {ticket.ticketId}
                      </span>
                      <span
                        className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded font-mono ${
                          ticket.priority === 'P0'
                            ? 'bg-rose-500 text-white'
                            : ticket.priority === 'P1'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {ticket.priority}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {ticket.issueTypeLabel}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        ticket.status === 'synced_back'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ticket.status === 'processing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ticket.statusLabel}
                    </span>
                  </div>

                  {/* 10.2 入参详情展示 */}
                  <div className="mt-3 flex flex-col gap-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">
                        {ticket.issueSummary}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded-lg text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">来源渠道 / 活动</span>
                        <span className="text-slate-700 font-medium truncate block">
                          {ticket.channel}
                        </span>
                        <span className="text-slate-400 font-mono text-[9.5px] block truncate">
                          {ticket.campaign}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">受众 / 用户ID</span>
                        <span className="text-slate-700 font-semibold block">{ticket.visitorOrUserId}</span>
                        <span className="text-slate-400 text-[10px] block">
                          创建时间: {ticket.createdTime}
                        </span>
                      </div>
                    </div>

                    {/* 会话摘要 (前序沟通纪要) */}
                    <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-[11.5px] leading-relaxed">
                      <span className="font-bold text-blue-900 block mb-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">forum</span>
                        推广前序会话摘要 (客服无需重复询问用户)：
                      </span>
                      <p className="text-slate-700">{ticket.chatSummary}</p>
                    </div>

                    {/* 关联卡种与订单 */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>关联卡种: <strong className="text-slate-800">{ticket.relatedCardType}</strong></span>
                      {ticket.relatedOrderCode && (
                        <span>关联订单: <strong className="text-blue-600 font-mono">{ticket.relatedOrderCode}</strong></span>
                      )}
                    </div>

                    {ticket.resolutionNote && (
                      <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px]">
                        <strong>已回传处理结果:</strong> {ticket.resolutionNote}
                      </div>
                    )}
                  </div>
                </div>

                {/* 操作栏 */}
                <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2">
                  {ticket.status === 'pending_receive' ? (
                    <button
                      type="button"
                      onClick={() => handleClaimPromotionTicket(ticket.ticketId)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs cursor-pointer"
                    >
                      接单处理
                    </button>
                  ) : ticket.status !== 'synced_back' ? (
                    <button
                      type="button"
                      onClick={() => setSelectedPromotionTicket(ticket)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">send</span>
                      <span>处理并回传推广系统</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">done_all</span>
                      已成功回传渠道推广系统
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 4. 售后待办: 争议案卷快速仲裁与存证审核 (PRD 标准) */}
      {/* ============================================================================ */}
      {activeMainTab === 'after_sale' && (
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-sm font-bold text-slate-900">售后待办争议案卷 (2 笔待仲裁)</span>
              <span className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200 font-semibold">
                SLA 紧迫 · 需客服判定责任与赔付归属
              </span>
            </div>
            <button
              onClick={() => onNavigate('dispute-resolution')}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
            >
              <span>前往售后争议中心完整质证</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: 'CASE-20261005-01',
                orderId: 'KD-20261005-9921',
                type: '卡密已被其他账号充值 (碰卡争议)',
                user: 'Adebayo (VIP3 · 信用分 94)',
                merchant: '万商合众网络 (MID-8812)',
                amount: '$500.00 (Apple US)',
                timeAgo: '18 分钟前',
                proofSummary: '商户提交官方充值失败时间戳 14:12:05；用户提供实体卡购买收据小票 (带有时间 14:05:00)',
                advice: '调取 Card Check T1 证据链，比对官方激活时间。若商户接单前已失效判定用户责任，反之判定商户赔付。'
              },
              {
                id: 'CASE-20261005-02',
                orderId: 'KD-20261005-9712',
                type: '实际查验面额与申报不符 (灰余额)',
                user: 'Carlos Silva (新用户)',
                merchant: '顺达环球卡券 (MID-8815)',
                amount: '£50.00 ➔ 查实 £25.00',
                timeAgo: '32 分钟前',
                proofSummary: '官方Card Check接口返回有效余额 £25.00，用户声明购买原值为 £50.00',
                advice: '发起二次官方查验。若确为 £25.00，建议客服修改结算面额并征询用户确认，差额扣减放款。'
              }
            ].map(item => (
              <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col justify-between gap-3">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-blue-600">{item.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      待责任确认
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-xs">{item.type}</h3>
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>出卡用户: <strong className="text-slate-700">{item.user}</strong></div>
                    <div>承揽商户: <strong className="text-slate-700">{item.merchant}</strong></div>
                    <div>涉案金额: <strong className="text-rose-600">{item.amount}</strong></div>
                    <div>发起时间: <strong className="text-slate-500 font-mono">{item.timeAgo}</strong></div>
                  </div>
                  <div className="text-[11px] text-slate-600 bg-blue-50/50 p-2 rounded border border-blue-100">
                    <span className="font-semibold text-blue-800">存证事实：</span>
                    {item.proofSummary}
                  </div>
                  <div className="text-[11px] text-slate-600 bg-amber-50/50 p-2 rounded border border-amber-100">
                    <span className="font-semibold text-amber-800">建议处置：</span>
                    {item.advice}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onNavigate('dispute-resolution')}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold cursor-pointer"
                  >
                    调取完整证据链
                  </button>
                  <button
                    onClick={() => {
                      triggerToast(`案卷【${item.id}】已由客服受理终审裁决！`);
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer"
                  >
                    立即仲裁结案
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isProcessingDrawerOpen && processingOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-xs overscroll-contain select-none"
          onClick={() => setIsProcessingDrawerOpen(false)}
        >
          <div
            className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 select-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* 抽屉头部 */}
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-slate-900">
                  卡单核验与作业控制台 · {processingOrder.id}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    processingOrder.status === 'merchant_reported_anomaly'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : processingOrder.status === 'manual_recalled_pending'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : processingOrder.status === 'overdue_soon'
                      ? 'bg-amber-100 text-amber-800'
                      : processingOrder.status === 'processing'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {processingOrder.statusLabel}
                </span>
              </div>
              <button
                onClick={() => setIsProcessingDrawerOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            
            {/* Content ... (rest of drawer content) */}

            {/* 抽屉滚动内容区 (精简间距，视口更紧凑) */}
            <div className="flex-1 px-5 py-3.5 overflow-y-auto overscroll-contain flex flex-col gap-3 text-xs">
              {/* 人工撤回专属提醒 */}
              {processingOrder.status === 'manual_recalled_pending' && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <span className="material-symbols-outlined text-amber-700 text-[18px] shrink-0 mt-0.5">
                    history_toggle_off
                  </span>
                  <div className="flex flex-col">
                    <span className="font-bold text-amber-950 text-xs">人工撤回卡单待重新调度</span>
                    <span className="text-amber-900 text-[11px] mt-0.5 leading-relaxed">
                      该卡单已从商户席位撤回锁定（原由：<strong>{processingOrder.entryReasonLabel}</strong>）。当前处于待处理调度池，可重新指派备用商户或核实后直接放款结清。
                    </span>
                  </div>
                </div>
              )}

      {/* 步骤 1: 查看卡信息 */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
          <span className="w-4.5 h-4.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">
            1
          </span>
          <span>卡信息核验</span>
        </div>

        <div className="flex flex-col gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
          <div className="relative">
            <div className="flex items-center gap-2">
              <CardBrandLogo card={{ brandName: processingOrder.cardType, iconType: processingOrder.cardTypeIcon }} size="md" />
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-slate-900 text-xs leading-tight">
                  {processingOrder.cardFullName || processingOrder.cardType}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 font-medium leading-none">
                    {processingOrder.country}{processingOrder.countryName}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 font-medium leading-none">
                    {processingOrder.mediaTypeLabel || (processingOrder.cardDetails?.imageReflections ? '卡图' : '电子码')}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium leading-none">
                    {processingOrder.speedTag || '快卡'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* 右上角展示面值、数量与用户下单时间 */}
            <div className="absolute top-0 right-0 flex flex-col items-end gap-1">
              <div className="flex items-center gap-1">
                <span className="text-[10.5px] font-semibold text-slate-900 px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">
                  面值: {processingOrder.faceValue}
                </span>
                <span className="text-[10.5px] font-semibold text-slate-700 px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">
                  数量: {processingOrder.cardQuantity || 1}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10.5px] text-slate-500 font-mono">
                <span className="text-slate-400 font-sans">下单时间:</span>
                <span>2026-10-10 11:47:56</span>
              </div>
            </div>

            <div className="mt-2.5 pt-1.5 border-t border-slate-200/80 flex flex-col gap-1 font-mono text-[11px]">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-500 font-sans">用户成交报价：</span>
                <span className="font-semibold text-emerald-700">
                  {processingOrder.userDealQuote || '￥7.0000/₦1386'}
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-medium leading-none">
                  <MaterialIcon name="military_tech" size={13} className="text-amber-600" />
                  <span>等级奖励 +1.2%（{(processingOrder.user?.level || 'V3').replace('VIP', 'V')} 专享加成）</span>
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-sans">收卡报价：</span>
                <span className="font-semibold text-blue-700">
                  {processingOrder.merchantQuote || '￥8.0000'}
                </span>
              </div>
            </div>
          </div>

                  {/* 卡图卡密凭证 (默认收起，共10条数据，多分类且各自分类可显示/隐藏/展开/收起) */}
                  <div className="pt-1.5 border-t border-slate-200/80 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <MaterialIcon name="verified_user" size={14} className="text-blue-600" />
                        <span>卡图卡密凭证</span>
                        {(() => {
                          const procCardCodes = [
                            { id: 'cc1', cardName: '卡片 #1', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800', hasCode: true, code: 'STM-US-8821-9921-001' },
                            { id: 'cc2', cardName: '卡片 #2', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800', hasCode: false },
                            { id: 'cc3', cardName: '卡片 #3', hasImage: false, hasCode: true, code: 'STM-US-8821-9921-003' },
                            { id: 'cc4', cardName: '卡片 #4', hasImage: false, hasCode: false },
                            { id: 'cc5', cardName: '卡片 #5', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800', hasCode: true, code: 'STM-US-8821-9921-005' },
                          ];
                          const procPins = [
                            { id: 'pin1', pin: '324533' },
                            { id: 'pin2', pin: '882019' },
                            { id: 'pin3', pin: '440291' },
                            { id: 'pin4', pin: '710492' },
                            { id: 'pin5', pin: '998214' },
                          ];
                          const totalCount = procCardCodes.length + procPins.length;
                          return (
                            <span className="text-[10.5px] font-normal text-slate-500">
                              （原单提交凭证，共计 <strong className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-mono font-bold text-[10.5px]">{totalCount}</strong> 条数据）
                            </span>
                          );
                        })()}
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsVouchersModuleExpanded(prev => !prev)}
                        className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer text-[10.5px] font-semibold border border-blue-200 shadow-2xs"
                      >
                        <span>{isVouchersModuleExpanded ? '收起凭证' : '展开凭证'}</span>
                        <MaterialIcon name={isVouchersModuleExpanded ? 'expand_less' : 'expand_more'} size={13} />
                      </button>
                    </div>

                    {isVouchersModuleExpanded && (
                      <div className="flex flex-col gap-3 pt-1">
                        {/* 分类 1: 卡图卡代码 */}
                        {(() => {
                          const procCardCodes = [
                            { id: 'cc1', cardName: '卡片 #1', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800', hasCode: true, code: 'STM-US-8821-9921-001' },
                            { id: 'cc2', cardName: '卡片 #2', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800', hasCode: false },
                            { id: 'cc3', cardName: '卡片 #3', hasImage: false, hasCode: true, code: 'STM-US-8821-9921-003' },
                            { id: 'cc4', cardName: '卡片 #4', hasImage: false, hasCode: false },
                            { id: 'cc5', cardName: '卡片 #5', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800', hasCode: true, code: 'STM-US-8821-9921-005' },
                          ];
                          const isExpanded = !!editVouchersExpanded['cardCodes_proc'];
                          const isUnhidden = !!editShowCodesPlain['cardCodes_proc_show'];
                          return (
                            <div className="flex flex-col gap-2 bg-white p-3 rounded-xl border border-slate-200/80">
                              <div className="flex items-center justify-between text-[11px] font-medium text-slate-700 px-0.5">
                                <div className="flex items-center gap-1.5 font-bold text-slate-800 cursor-pointer" onClick={() => setEditVouchersExpanded(prev => ({ ...prev, cardCodes_proc: !isExpanded }))}>
                                  <MaterialIcon name="photo_library" size={15} className="text-blue-600" />
                                  <span>卡图卡代码（共{procCardCodes.length}张）</span>
                                  <MaterialIcon name={isExpanded ? 'expand_less' : 'expand_more'} size={14} />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setEditShowCodesPlain(prev => ({ ...prev, cardCodes_proc_show: !isUnhidden }))}
                                  className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1 text-[11px] font-semibold border border-blue-200 shadow-2xs"
                                >
                                  <MaterialIcon name={isUnhidden ? 'visibility_off' : 'visibility'} size={13} />
                                  <span>{isUnhidden ? '隐藏卡密' : '显示卡密'}</span>
                                </button>
                              </div>

                              {isExpanded && (
                                <div className="flex flex-col gap-2">
                                  {procCardCodes.map((item, idx) => (
                                    <div
                                      key={item.id}
                                      className="flex items-center justify-between gap-3 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors shadow-2xs"
                                    >
                                      <div className="flex items-center gap-2.5 shrink-0">
                                        <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-mono font-bold">
                                          #{idx + 1}
                                        </span>
                                        {item.hasImage && item.imageUrl ? (
                                          <div
                                            className="group relative w-11 h-7 rounded-md overflow-hidden bg-slate-900 border border-slate-200 shrink-0 cursor-pointer flex items-center justify-center shadow-2xs"
                                            onClick={() => setPreviewImageModal({ url: item.imageUrl!, title: `卡图 #${idx + 1}` })}
                                            title="点击查看原图"
                                          >
                                            <img
                                              src={item.imageUrl}
                                              alt={item.cardName}
                                              className="w-full h-full object-cover transition-all duration-150 scale-105 group-hover:scale-100"
                                            />
                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                                              <MaterialIcon name="visibility" size={13} className="text-white drop-shadow-xs" />
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="w-11 h-7 rounded-md border border-dashed border-slate-200 bg-slate-100 flex items-center justify-center shrink-0 text-slate-400" title="无卡图">
                                            <MaterialIcon name="image_not_supported" size={12} className="text-slate-300" />
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex-1 min-w-0 flex items-center">
                                        {item.hasCode && item.code ? (
                                          <div className="flex items-center gap-2 min-w-0">
                                            <span className="font-mono text-slate-800 font-semibold text-xs tracking-wider truncate">
                                              {isUnhidden
                                                ? item.code
                                                : `${item.code.slice(0, 4)}-****-****-${item.code.slice(-4)}`}
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/70 text-[11px] font-medium">
                                            <MaterialIcon name="error_outline" size={14} className="text-amber-600 shrink-0" />
                                            <span>卡代码提取失败</span>
                                          </div>
                                        )}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setTraceModal({ isOpen: true, cardId: item.id, cardName: item.cardName })}
                                        className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer shrink-0"
                                      >
                                        轨迹
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* 分类 2: PIN 码 */}
                        {(() => {
                          const procPins = [
                            { id: 'pin1', pin: '324533' },
                            { id: 'pin2', pin: '882019' },
                            { id: 'pin3', pin: '440291' },
                            { id: 'pin4', pin: '710492' },
                            { id: 'pin5', pin: '998214' },
                          ];
                          const isExpanded = !!editVouchersExpanded['pins_proc'];
                          const isUnhidden = !!editShowCodesPlain['pins_proc_show'];
                          return (
                            <div className="flex flex-col gap-2 bg-white p-3 rounded-xl border border-slate-200/80">
                              <div className="flex items-center justify-between text-[11px] font-medium text-slate-700 px-0.5">
                                <div className="flex items-center gap-1.5 font-bold text-slate-800 cursor-pointer" onClick={() => setEditVouchersExpanded(prev => ({ ...prev, pins_proc: !isExpanded }))}>
                                  <MaterialIcon name="pin" size={15} className="text-indigo-600" />
                                  <span>PIN 码（共{procPins.length}条）</span>
                                  <MaterialIcon name={isExpanded ? 'expand_less' : 'expand_more'} size={14} />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setEditShowCodesPlain(prev => ({ ...prev, pins_proc_show: !isUnhidden }))}
                                  className="px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors flex items-center gap-1 text-[11px] font-semibold border border-indigo-200 shadow-2xs"
                                >
                                  <MaterialIcon name={isUnhidden ? 'visibility_off' : 'visibility'} size={13} />
                                  <span>{isUnhidden ? '隐藏PIN' : '显示PIN'}</span>
                                </button>
                              </div>

                              {isExpanded && (
                                <div className="flex flex-col gap-2">
                                  {procPins.map((item, idx) => (
                                    <div
                                      key={item.id}
                                      className="flex items-center justify-between gap-3 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors shadow-2xs"
                                    >
                                      <div className="flex items-center gap-2.5 shrink-0">
                                        <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-mono font-bold">
                                          #{idx + 1}
                                        </span>
                                        <span className="text-slate-500 font-mono text-[11px]">PIN凭证</span>
                                      </div>

                                      <div className="flex-1 min-w-0 flex items-center">
                                        <span className="font-mono text-slate-800 font-semibold text-xs tracking-wider">
                                          {isUnhidden
                                            ? item.pin
                                            : item.pin.replace(/./g, '*')}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 步骤 2: 查看 Card Check 官方实时状态 */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                    <span className="w-4.5 h-4.5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px] font-bold">
                      2
                    </span>
                    <span>Card Check 官方实时预检结果（卡图卡代码明细）</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCardCheckExpanded(prev => !prev)}
                    className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors flex items-center gap-1 cursor-pointer text-[10.5px] font-semibold border border-indigo-200 shadow-2xs"
                  >
                    <span>{isCardCheckExpanded ? '收起明细' : '展开明细'}</span>
                    <MaterialIcon name={isCardCheckExpanded ? 'expand_less' : 'expand_more'} size={13} />
                  </button>
                </div>

                {isCardCheckExpanded && (
                  <div className="flex flex-col gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-700 px-0.5 pb-0.5">
                      <span className="text-slate-500">共 5 张卡图卡代码查验记录</span>
                      <button
                        type="button"
                        onClick={() => setEditShowCodesPlain(prev => ({ ...prev, cardCheck_show: !prev['cardCheck_show'] }))}
                        className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors flex items-center gap-1 text-[10.5px] font-semibold border border-indigo-200 shadow-2xs cursor-pointer"
                      >
                        <MaterialIcon name={editShowCodesPlain['cardCheck_show'] ? 'visibility_off' : 'visibility'} size={12} />
                        <span>{editShowCodesPlain['cardCheck_show'] ? '隐藏卡密' : '显示卡密'}</span>
                      </button>
                    </div>

                      {[
                      { id: 'cc1', name: '卡片 #1', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800', code: 'AP-7721-0PQX-8812', status: '有效', statusType: 'success', balance: '$50.00', time: '11:52:16' },
                      { id: 'cc2', name: '卡片 #2', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800', code: 'AP-9966-ZER0-BAL8', status: '无余额', statusType: 'warning', balance: '$0.00', time: '11:52:01' },
                      { id: 'cc3', name: '卡片 #3', hasImage: false, imageUrl: '', code: 'AP-8892-KLMA-9901', status: '有效', statusType: 'success', balance: '$50.00', time: '11:51:46' },
                      { id: 'cc4', name: '卡片 #4', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800', code: 'XB-IMG-9988-7766', status: '有效', statusType: 'success', balance: '$50.00', time: '11:51:31' },
                      { id: 'cc5', name: '卡片 #5', hasImage: true, imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800', code: '', status: '提取失败', statusType: 'error', balance: '--', time: '' },
                    ].map((checkItem, idx) => (
                      <CardCheckRow
                        key={checkItem.id}
                        checkItem={checkItem}
                        idx={idx}
                        setPreviewImageModal={setPreviewImageModal}
                        editShowCodesPlain={editShowCodesPlain}
                        triggerToast={triggerToast}
                        setTraceModal={setTraceModal}
                      />
                    ))}

                  </div>
                )}
              </div>

              {/* 步骤 3: 出卡用户信息 */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                  <span className="w-4.5 h-4.5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[11px] font-bold">
                    3
                  </span>
                  <span>出卡用户信息</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-800 font-medium">
                      <span>{processingOrder.user.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold leading-none ${getUserLevelBadgeClass(processingOrder.user.level)}`}>
                        {(processingOrder.user.level || 'V1').replace('VIP', 'V')}
                      </span>
                      <span className="font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                        ID: {processingOrder.user.userId || 'USNEO3N9Z'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenLiveChat('user', processingOrder)}
                      className="p-1 rounded text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer"
                      title="发起实时会话"
                    >
                      <MaterialIcon name="chat" size={15} />
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>注册时间: 2026-01-15 10:20:00</span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-slate-500 text-[11px]">命中标签:</span>
                    {processingOrder.riskTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className={`px-1.5 py-0.5 rounded font-semibold text-[10px] ${
                          tag === '正常'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 步骤 4: 查看商户处理状态 */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                  <span className="w-4.5 h-4.5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[11px] font-bold">
                    4
                  </span>
                  <span>商户承接履约状态</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-col gap-1.5">
                  {(processingOrder.status === 'pending_claim' ||
                    processingOrder.status === 'manual_recalled_pending' ||
                    processingOrder.status === 'waiting_merchant_claim') ? (
                    <span className="text-amber-700 font-semibold text-xs">
                      {processingOrder.status === 'pending_claim' && '无商户接卡（系统自动派单失败）'}
                      {processingOrder.status === 'manual_recalled_pending' && '无商户接卡（人工撤回卡单）'}
                      {processingOrder.status === 'waiting_merchant_claim' && '无商户接卡（系统派单流转中）'}
                    </span>
                  ) : (
                    <>
                      {processingOrder.currentMerchant ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div>
                              <span className="font-bold text-slate-900 block text-xs">
                                {processingOrder.currentMerchant.name} (ID: {processingOrder.currentMerchant.id})
                              </span>
                              <span className="text-[10.5px] text-slate-500 block mt-0.5">
                                派单时间: 2026-10-09 11:50:00 · 接卡时间: 2026-10-09 11:51:00
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenLiveChat('merchant', processingOrder)}
                              className="p-1 rounded text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer"
                              title="向商户发起实时会话"
                            >
                              <MaterialIcon name="chat" size={15} />
                            </button>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <div>
                              <span className="font-bold text-slate-900 block text-xs">
                                {processingOrder.assignedCs?.name || '青青'}({processingOrder.assignedCs?.email || '234@163.com'})
                              </span>
                              <span className="text-[10.5px] text-slate-500 block mt-0.5">
                                处理人
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenLiveChat('handler', processingOrder)}
                              className="p-1 rounded text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer"
                              title="向处理人发起实时会话"
                            >
                              <MaterialIcon name="chat" size={15} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs italic">暂无商户接卡信息</span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* 步骤 5: 卡单轨迹详情 */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                    <span className="w-4.5 h-4.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">
                      5
                    </span>
                    <span>卡单轨迹详情</span>
                    <span className="text-[10.5px] font-normal text-slate-500">
                      （全流程操作与审计存证）
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOrderTrajectoryExpanded(prev => !prev)}
                    className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer text-[10.5px] font-semibold border border-emerald-200 shadow-2xs"
                  >
                    <span>{isOrderTrajectoryExpanded ? '收起轨迹' : '展开轨迹'}</span>
                    <MaterialIcon name={isOrderTrajectoryExpanded ? 'expand_less' : 'expand_more'} size={13} />
                  </button>
                </div>

                {isOrderTrajectoryExpanded && (
                  <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
                    {(() => {
                      const fullTrajectoryList = [
                        {
                          id: 'tr-1',
                          time: '2026-10-10 15:41:01',
                          node: '查看卡单信息',
                          subject: '平台客服',
                          subjectType: 'cs',
                          operator: '15@163.com',
                          desc: '平台查看卡单详情',
                          image: null,
                        },
                        {
                          id: 'tr-2',
                          time: '2026-10-10 11:51:02',
                          node: '分配运营客服处理',
                          subject: '商户',
                          subjectType: 'merchant',
                          operator: 'system',
                          desc: '分配至客服：15@163.com(86890008)、工号：86890008',
                          image: null,
                        },
                        {
                          id: 'tr-3',
                          time: '2026-10-10 11:51:01',
                          node: '卡单回撤至平台',
                          subject: '系统',
                          subjectType: 'system',
                          operator: 'system',
                          desc: '转入平台人工处理流程',
                          image: null,
                        },
                        {
                          id: 'tr-4',
                          time: '2026-10-10 11:51:00',
                          node: '接卡超时',
                          subject: '商户',
                          subjectType: 'merchant',
                          operator: processingOrder.currentMerchant?.name || '测试客服商户名称',
                          desc: '商户无人接卡，平台自动回收',
                          image: null,
                        },
                        {
                          id: 'tr-5',
                          time: '2026-10-10 11:49:02',
                          node: '等待接单',
                          subject: '系统',
                          subjectType: 'system',
                          operator: 'system',
                          desc: '接卡截止时间：2026-10-10 11:51:00',
                          image: null,
                        },
                        {
                          id: 'tr-6',
                          time: '2026-10-10 11:49:01',
                          node: '自动派单',
                          subject: '系统',
                          subjectType: 'system',
                          operator: 'system',
                          desc: `派单至商户：${processingOrder.currentMerchant?.name || '测试客服商户名称'}(GF004001)，商户报价：6`,
                          image: null,
                        },
                        {
                          id: 'tr-7',
                          time: '2026-10-10 11:49:00',
                          node: '抢单超时',
                          subject: '系统',
                          subjectType: 'system',
                          operator: 'system',
                          desc: '抢单已截止，自动派单至商户',
                          image: null,
                        },
                        {
                          id: 'tr-8',
                          time: '2026-10-10 11:47:56',
                          node: '提交订单',
                          subject: '用户',
                          subjectType: 'user',
                          operator: `${processingOrder.user?.level || 'V3'}:${processingOrder.user?.userId || 'USNEO3N9Z'}(${processingOrder.user?.name || 'Jackz'})`,
                          desc: `【抢单模式】卡片ID：${processingOrder.id} 订单信息：${processingOrder.cardFullName || processingOrder.cardType} / ${processingOrder.country}${processingOrder.countryName}`,
                          image: null,
                        },
                        {
                          id: 'tr-9',
                          time: '2026-10-10 11:47:30',
                          node: '智能预审校验',
                          subject: '系统',
                          subjectType: 'system',
                          operator: 'system',
                          desc: 'OCR提取卡号密码比对完成，卡种规格吻合，风控评级：低风险',
                          image: null,
                        },
                        {
                          id: 'tr-10',
                          time: '2026-10-10 11:47:15',
                          node: '上传凭证图档',
                          subject: '用户',
                          subjectType: 'user',
                          operator: `${processingOrder.user?.level || 'V3'}:${processingOrder.user?.userId || 'USNEO3N9Z'}(${processingOrder.user?.name || 'Jackz'})`,
                          desc: '用户端上传实体卡背面及购买发票扫描图档（共2张）',
                          image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
                        },
                        {
                          id: 'tr-11',
                          time: '2026-10-10 11:46:50',
                          node: '生成预交卡流水',
                          subject: '系统',
                          subjectType: 'system',
                          operator: 'system',
                          desc: '系统分配临时预锁流水序列号，锁定实时出卡汇率与基准点位',
                          image: null,
                        },
                        {
                          id: 'tr-12',
                          time: '2026-10-10 11:46:02',
                          node: '发起出卡申请',
                          subject: '用户',
                          subjectType: 'user',
                          operator: `${processingOrder.user?.level || 'V3'}:${processingOrder.user?.userId || 'USNEO3N9Z'}(${processingOrder.user?.name || 'Jackz'})`,
                          desc: '用户进入兑卡界面，选择卡种规格与面值提交兑换申请',
                          image: null,
                        },
                      ];

                      const totalRecords = fullTrajectoryList.length;
                      const totalPages = Math.ceil(totalRecords / trajectoryPageSize) || 1;
                      const currentPage = Math.min(Math.max(trajectoryPage, 1), totalPages);
                      const startIndex = (currentPage - 1) * trajectoryPageSize;
                      const currentList = fullTrajectoryList.slice(startIndex, startIndex + trajectoryPageSize);

                      const getSubjectBadge = (type: string, name: string) => {
                        switch (type) {
                          case 'cs':
                            return (
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/70 font-semibold text-[10.5px]">
                                {name}
                              </span>
                            );
                          case 'merchant':
                            return (
                              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/70 font-semibold text-[10.5px]">
                                {name}
                              </span>
                            );
                          case 'user':
                            return (
                              <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200/70 font-semibold text-[10.5px]">
                                {name}
                              </span>
                            );
                          case 'system':
                          default:
                            return (
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-[10.5px]">
                                {name}
                              </span>
                            );
                        }
                      };

                      return (
                        <>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                                  <th className="py-2.5 px-3 whitespace-nowrap">操作时间</th>
                                  <th className="py-2.5 px-3 whitespace-nowrap">操作节点</th>
                                  <th className="py-2.5 px-3 whitespace-nowrap">操作主体</th>
                                  <th className="py-2.5 px-3 whitespace-nowrap">操作人</th>
                                  <th className="py-2.5 px-3">操作说明</th>
                                  <th className="py-2.5 px-3 whitespace-nowrap text-center">处理图片</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700 font-normal">
                                {currentList.map(row => (
                                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                                      {row.time}
                                    </td>
                                    <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap">
                                      {row.node}
                                    </td>
                                    <td className="py-2.5 px-3 whitespace-nowrap">
                                      {getSubjectBadge(row.subjectType, row.subject)}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                                      {row.operator}
                                    </td>
                                    <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-xs leading-relaxed">
                                      {row.desc}
                                    </td>
                                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                      {row.image ? (
                                        <button
                                          type="button"
                                          onClick={() => setPreviewImageModal({ url: row.image!, title: `处理图片凭证 - ${row.node}` })}
                                          className="text-blue-600 hover:text-blue-800 underline font-medium text-[11px] cursor-pointer"
                                        >
                                          查看图片
                                        </button>
                                      ) : (
                                        <span className="text-slate-400 font-mono">--</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* 翻页控制栏 */}
                          <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 text-xs text-slate-600">
                            <div className="flex items-center gap-2">
                              <span>共 <strong className="font-mono text-slate-900 font-bold">{totalRecords}</strong> 条记录</span>
                              <span className="text-slate-300">|</span>
                              <div className="flex items-center gap-1">
                                <span>每页</span>
                                <select
                                  value={trajectoryPageSize}
                                  onChange={e => {
                                    setTrajectoryPageSize(Number(e.target.value));
                                    setTrajectoryPage(1);
                                  }}
                                  className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500"
                                >
                                  <option value={10}>10条</option>
                                  <option value={20}>20条</option>
                                  <option value={50}>50条</option>
                                </select>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-slate-500 text-[11px] mr-1">
                                第 {currentPage} / {totalPages} 页
                              </span>
                              <button
                                type="button"
                                disabled={currentPage <= 1}
                                onClick={() => setTrajectoryPage(prev => Math.max(prev - 1, 1))}
                                className={`px-2 py-0.5 rounded border text-xs font-medium flex items-center gap-0.5 cursor-pointer transition-colors ${
                                  currentPage <= 1
                                    ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 shadow-2xs'
                                }`}
                              >
                                <MaterialIcon name="chevron_left" size={14} />
                                <span>上一页</span>
                              </button>

                              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                <button
                                  key={pageNum}
                                  type="button"
                                  onClick={() => setTrajectoryPage(pageNum)}
                                  className={`w-6 h-6 rounded text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                                    pageNum === currentPage
                                      ? 'bg-blue-600 text-white shadow-2xs'
                                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              ))}

                              <button
                                type="button"
                                disabled={currentPage >= totalPages}
                                onClick={() => setTrajectoryPage(prev => Math.min(prev + 1, totalPages))}
                                className={`px-2 py-0.5 rounded border text-xs font-medium flex items-center gap-0.5 cursor-pointer transition-colors ${
                                  currentPage >= totalPages
                                    ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 shadow-2xs'
                                }`}
                              >
                                <span>下一页</span>
                                <MaterialIcon name="chevron_right" size={14} />
                              </button>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 9.3 商户异常处置模态框 */}
      {/* ============================================================================ */}
      {selectedMerchantTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-700 text-[20px]">store</span>
                <span className="font-bold text-sm text-slate-900">
                  商户异常介入处置 · {selectedMerchantTask.merchant.name}
                </span>
              </div>
              <button
                onClick={() => setSelectedMerchantTask(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 flex flex-col gap-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-700">{selectedMerchantTask.anomalyTypeLabel}</span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    已持续 {selectedMerchantTask.durationMinutes} 分钟
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{selectedMerchantTask.detailCause}</p>
                <div className="text-slate-500 text-[11px] pt-1 border-t border-slate-200">
                  影响范围: <strong>{selectedMerchantTask.impactedOrdersCount} 笔在途卡单</strong> ({selectedMerchantTask.impactedAmount})
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">系统推荐介入动作：</span>
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-medium">
                  {selectedMerchantTask.suggestedAction}
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedMerchantTask(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                关闭
              </button>
              <button
                type="button"
                onClick={() => handleResolveMerchantAnomaly('执行一键调价催办并恢复')}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                确认执行介入并自愈验证
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 10.3 推广异常处理并回传模态框 */}
      {/* ============================================================================ */}
      {selectedPromotionTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 bg-purple-50 border-b border-purple-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-700 text-[20px]">
                  campaign
                </span>
                <span className="font-bold text-sm text-slate-900">
                  推广异常工单处理 · 回传渠道推广系统
                </span>
              </div>
              <button
                onClick={() => setSelectedPromotionTicket(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 flex flex-col gap-3.5 text-xs">
              <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-950">{selectedPromotionTicket.issueSummary}</span>
                  <span className="font-mono text-purple-800 text-[10px]">
                    {selectedPromotionTicket.ticketId}
                  </span>
                </div>
                <span className="text-slate-500 text-[11px]">
                  渠道: {selectedPromotionTicket.channel} · 用户: {selectedPromotionTicket.visitorOrUserId}
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  平台处理结果 (该内容将实时回传给渠道推广系统与推广员)：
                </label>
                <textarea
                  rows={4}
                  value={promotionResolveText}
                  onChange={e => setPromotionResolveText(e.target.value)}
                  placeholder="例如：已在风控中心将用户加入首单信任白名单，解除了异地IP频控限制，已补发 2U 首购补贴，用户可立即出卡。"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedPromotionTicket(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => handleSyncBackPromotionTicket(selectedPromotionTicket)}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px]">send</span>
                <span>写入结果并回传渠道推广系统</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 卡单作业操作弹窗 (人工派单 / 修改卡信息 / 转单 / 客服处理 / 同步用户信息) */}
      {/* 弹窗内容暂时预留为空 */}
      {/* ============================================================================ */}
      {cardActionModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={handleCloseCardActionModal}
        >
          <div
            className={`bg-white rounded-2xl shadow-2xl border border-slate-200 w-full ${
              cardActionModal.type === 'editCard' || cardActionModal.type === 'splitOrder'
                ? 'max-w-3xl'
                : cardActionModal.type === 'syncUser' || cardActionModal.type === 'directProcess'
                ? 'max-w-2xl'
                : cardActionModal.type === 'dispatch'
                ? 'max-w-xl'
                : cardActionModal.type === 'transfer'
                ? 'max-w-lg'
                : 'max-w-lg'
            } max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col relative z-[101]`}
            onClick={e => e.stopPropagation()}
          >
            {/* 弹窗 Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl ${CARD_ACTION_MODAL_CONFIG[cardActionModal.type].iconBg} ${CARD_ACTION_MODAL_CONFIG[cardActionModal.type].iconColor} flex items-center justify-center shrink-0 shadow-2xs`}
                >
                  <MaterialIcon
                    name={
                      cardActionModal.type === 'directProcess' && directProcessStep === 2
                        ? directProcessResult === 'success'
                          ? 'check_circle'
                          : 'cancel'
                        : CARD_ACTION_MODAL_CONFIG[cardActionModal.type].icon
                    }
                    size={20}
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {cardActionModal.type === 'dispatch'
                        ? '人工派单'
                        : cardActionModal.type === 'transfer'
                        ? '转单'
                        : cardActionModal.type === 'syncUser'
                        ? '同步用户信息'
                        : cardActionModal.type === 'directProcess'
                        ? directProcessStep === 2
                          ? directProcessResult === 'success'
                            ? '确认处理成功吗？'
                            : '确认处理失败吗？'
                          : '直接处理'
                        : cardActionModal.type === 'editCard'
                        ? '修改卡信息'
                        : cardActionModal.type === 'splitOrder'
                        ? splitOrderStep === 2
                          ? '确认拆单提交生效吗？'
                          : '卡单拆单处理'
                        : cardActionModal.type === 'recall'
                        ? '撤回卡单'
                        : cardActionModal.type === 'manualDelay'
                        ? '手动延时'
                        : `${(CARD_ACTION_MODAL_CONFIG as Record<string, any>)[(cardActionModal as any).type]?.title || '操作'}弹窗`}
                    </span>
                    {/* 人工派单、修改卡信息、转单、同步用户信息、直接处理、撤回卡单及手动延迟在标题右侧高亮展示卡单ID并提供一键复制 */}
                    {cardActionModal.type === 'dispatch' || cardActionModal.type === 'transfer' || cardActionModal.type === 'syncUser' || cardActionModal.type === 'directProcess' || cardActionModal.type === 'editCard' || cardActionModal.type === 'splitOrder' || cardActionModal.type === 'recall' || cardActionModal.type === 'manualDelay' ? (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(cardActionModal.task.id);
                          triggerToast(`卡单号 ${cardActionModal.task.id} 已复制到剪贴板`);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100/90 border border-blue-200/90 text-blue-700 text-xs font-mono font-bold transition-all cursor-pointer group shadow-2xs"
                        title="点击复制卡单ID"
                      >
                        <span>{cardActionModal.task.id}</span>
                        <MaterialIcon
                          name="content_copy"
                          size={13}
                          className="text-blue-400 group-hover:text-blue-700 transition-colors"
                        />
                      </button>
                    ) : (
                      /* 其他弹窗保留徽标 */
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${(CARD_ACTION_MODAL_CONFIG as Record<string, any>)[(cardActionModal as any).type]?.badgeClass || ''}`}
                      >
                        {(CARD_ACTION_MODAL_CONFIG as Record<string, any>)[(cardActionModal as any).type]?.badge || ''}
                      </span>
                    )}
                  </div>
                  <span className={`text-[11px] text-slate-400 mt-0.5 ${cardActionModal.type === 'dispatch' || cardActionModal.type === 'transfer' || cardActionModal.type === 'syncUser' || cardActionModal.type === 'directProcess' || cardActionModal.type === 'editCard' || cardActionModal.type === 'splitOrder' || cardActionModal.type === 'recall' || cardActionModal.type === 'manualDelay' ? 'font-sans' : 'font-mono'}`}>
                    {cardActionModal.type === 'dispatch'
                      ? '为该卡单指定或改派具体的接卡商户及客服'
                      : cardActionModal.type === 'transfer'
                      ? '为该卡单流转指派新的在线接收客服处理'
                      : cardActionModal.type === 'syncUser'
                      ? '向用户澄清说明该卡单的相关异常信息与举证记录，便于用户实时知晓'
                      : cardActionModal.type === 'editCard'
                      ? editCardStep === 2
                        ? '请仔细核对卡单信息修改对比项，有变更的项目已高亮显示，确认无误后点击提交生效'
                        : '修改卡单规格、报价及参数信息，并向用户补充变更说明'
                      : cardActionModal.type === 'splitOrder'
                      ? splitOrderStep === 2
                        ? '请核对原卡单与新建卡单信息及卡图划入情况，确认无误后提交生效（新卡单默认归属无商户接卡池）'
                        : '勾选原卡单图片凭证划入新卡单，并录入新卡单规格与报价信息'
                      : cardActionModal.type === 'directProcess'
                      ? directProcessStep === 1
                        ? '请先选择当前卡单的处理结果（请谨慎处理）'
                        : directProcessResult === 'success'
                        ? '请核验卡代码、录入备注与举证图片后完成结清放款'
                        : '请核实失败原因并上传举证图后确认处理失败'
                      : cardActionModal.type === 'recall'
                      ? '撤回成功后，卡单请及时跟进处理'
                      : cardActionModal.type === 'manualDelay'
                      ? '为商户处理卡单预留更多时间，顺延卡单处理时长'
                      : `卡单号: ${cardActionModal.task.id} · ${cardActionModal.task.user.name} (${cardActionModal.task.user.level} ${cardActionModal.task.user.userId})`}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseCardActionModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="关闭"
              >
                <MaterialIcon name="close" size={20} />
              </button>
            </div>

            {/* 弹窗内容 */}
            {cardActionModal.type === 'dispatch' ? (
              /* 人工派单定制内容: 水平对齐表单排版，UI/字体大小与当前项目严格保持一致 */
              <div className="p-6 flex flex-col gap-4 text-xs">
                {/* 1. 卡信息 (带卡图标，去掉提单用户和卡密，国家、介质、时效与列表保持一致采用标签样式) */}
                <div className="flex items-start gap-3.5">
                  <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 pt-1.5">
                    卡信息
                  </div>
                  <div className="flex-1 bg-slate-50/90 rounded-xl p-3 border border-slate-200/90 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <CardBrandLogo card={{ brandName: cardActionModal.task.cardType, iconType: cardActionModal.task.cardTypeIcon }} size="xs" />
                        <span className="font-bold text-slate-800 text-xs truncate">
                          {cardActionModal.task.cardFullName || cardActionModal.task.cardType}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs shrink-0">
                        面值: {cardActionModal.task.faceValue}  数量: {cardActionModal.task.cardQuantity || 1}张
                      </span>
                    </div>
                    {/* 第二行: 国家、介质、时效 标签 (与列表完全一致) */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium leading-none whitespace-nowrap">
                        {cardActionModal.task.country}{cardActionModal.task.countryName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 font-medium leading-none whitespace-nowrap">
                        {cardActionModal.task.mediaTypeLabel || (cardActionModal.task.cardDetails?.imageReflections ? '卡图' : '电子码')}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium leading-none whitespace-nowrap">
                        {cardActionModal.task.speedTag || '快卡'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. 当前报价 (独立表单行，取值展示样式与列表严格一致) */}
                <div className="flex items-start gap-3.5">
                  <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 pt-0.5">
                    当前报价
                  </div>
                  <div className="flex-1 flex flex-col gap-1 text-xs">
                    {/* 第一行: 用户成交报价 */}
                    <div className="flex items-center gap-1 font-mono whitespace-nowrap">
                      <span className="text-slate-500 font-sans text-[11px]">用户成交报价：</span>
                      <span className="font-semibold text-emerald-700">
                        {cardActionModal.task.userDealQuote || '￥7.0000/₦1386'}
                      </span>
                    </div>
                    {/* 第二行: 收卡报价 */}
                    <div className="flex items-center gap-1 font-mono whitespace-nowrap">
                      <span className="text-slate-500 font-sans text-[11px]">收卡报价：</span>
                      <span className="font-semibold text-blue-700">
                        {cardActionModal.task.merchantQuote || '￥8.0000'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. 选择接卡商户 */}
                <div className="flex items-center gap-3.5">
                  <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 flex items-center justify-end">
                    <span className="text-rose-500 font-bold mr-1">*</span>
                    <span>选择接卡商户</span>
                  </div>
                  <div className="flex-1 relative">
                    <select
                      value={dispatchMerchantId}
                      onChange={e => {
                        const newId = e.target.value;
                        setDispatchMerchantId(newId);
                        setDispatchCsValue('');
                        setDispatchCsError(null);
                      }}
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer font-medium appearance-none pr-8"
                    >
                      {sortedDispatchMerchants.map(merchant => (
                        <option
                          key={merchant.id}
                          value={merchant.id}
                          disabled={!merchant.isNormal}
                          className={!merchant.isNormal ? 'text-slate-400 bg-slate-100' : 'text-slate-800 font-medium'}
                        >
                          {merchant.name}：【{merchant.statusDesc}】
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined text-[18px] text-slate-400 absolute right-2.5 top-2 pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* 4. 指定商户客服 */}
                <div className="flex items-center gap-3.5">
                  <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 flex items-center justify-end">
                    <span className="text-rose-500 font-bold mr-1">*</span>
                    <span>指定商户客服</span>
                  </div>
                  <div className="flex-1 flex items-center gap-6 h-9">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-700 select-none">
                      <input
                        type="radio"
                        name="dispatchAssignCs"
                        value="no"
                        checked={dispatchAssignCs === 'no'}
                        onChange={() => {
                          setDispatchAssignCs('no');
                          setDispatchCsValue('');
                          setDispatchCsError(null);
                        }}
                        className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                      />
                      <span>否</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-700 select-none">
                      <input
                        type="radio"
                        name="dispatchAssignCs"
                        value="yes"
                        checked={dispatchAssignCs === 'yes'}
                        onChange={() => {
                          setDispatchAssignCs('yes');
                          setDispatchCsError(null);
                        }}
                        className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                      />
                      <span>是</span>
                    </label>
                  </div>
                </div>

                {/* 4.1 选择商户客服 (仅当指定商户客服为“是”时展示，按当前选择商户联动) */}
                {dispatchAssignCs === 'yes' && (
                  <div className="flex items-start gap-3.5 animate-in fade-in duration-150">
                    <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 flex items-center justify-end pt-2">
                      <span className="text-rose-500 font-bold mr-1">*</span>
                      <span>选择商户客服</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="relative">
                        <select
                          value={dispatchCsValue}
                          onChange={e => {
                            setDispatchCsValue(e.target.value);
                            if (e.target.value) setDispatchCsError(null);
                          }}
                          className={`w-full h-9 px-3 bg-white border rounded-lg text-xs text-slate-700 focus:outline-none transition-all cursor-pointer appearance-none pr-8 ${
                            dispatchCsError
                              ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-100'
                              : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                          }`}
                        >
                          <option value="">请选择商户客服...</option>
                          {currentSelectedMerchant?.customerServices.map(cs => (
                            <option key={cs.id} value={cs.label}>
                              {cs.label}
                            </option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined text-[18px] text-slate-400 absolute right-2.5 top-2 pointer-events-none">
                          expand_more
                        </span>
                      </div>
                      {dispatchCsError && (
                        <span className="text-[11px] text-rose-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">error</span>
                          {dispatchCsError}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. 收卡商户报价 */}
                <div className="flex items-center gap-3.5">
                  <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600">
                    收卡商户报价
                  </div>
                  <div className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-lg text-xs text-slate-500 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[15px] text-blue-500 shrink-0">info</span>
                    <span className="leading-relaxed">此处的展示逻辑及操作逻辑保持原逻辑，不做改动</span>
                  </div>
                </div>
              </div>
            ) : cardActionModal.type === 'transfer' ? (
              /* 转单定制内容: 接收卡单客服下拉 + 只能选择“开启工作状态”的客服 提示文案 */
              <div className="p-6 flex flex-col gap-4 text-xs">
                {/* 接收卡单客服 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 flex items-center justify-end pt-2">
                    <span className="text-rose-500 font-bold mr-1">*</span>
                    <span>接收卡单客服</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="relative">
                      <select
                        value={transferCsId}
                        onChange={e => {
                          setTransferCsId(e.target.value);
                          if (e.target.value) setTransferCsError(null);
                        }}
                        className={`w-full h-9 px-3 bg-white border rounded-lg text-xs text-slate-700 focus:outline-none transition-all cursor-pointer appearance-none pr-8 font-medium ${
                          transferCsError
                            ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-100'
                            : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                        }`}
                      >
                        <option value="">请选择接收卡单客服...</option>
                        {availableTransferCsList.map(cs => (
                          <option key={cs.id} value={cs.id}>
                            {cs.label}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined text-[18px] text-slate-400 absolute right-2.5 top-2 pointer-events-none">
                        expand_more
                      </span>
                    </div>

                    {/* 校验错误提示 */}
                    {transferCsError && (
                      <span className="text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                        <span className="material-symbols-outlined text-[13px]">error</span>
                        {transferCsError}
                      </span>
                    )}

                    {/* 提示文案 只能选择“开启工作状态”的客服 */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                      <span className="material-symbols-outlined text-[14px] text-blue-500 shrink-0">info</span>
                      <span>只能选择“开启工作状态”的客服</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : cardActionModal.type === 'syncUser' ? (
              /* 同步用户信息定制内容 */
              <div className="p-6 flex-1 min-h-0 max-h-[calc(90vh-130px)] flex flex-col gap-4 text-xs overflow-y-auto overscroll-contain pr-3">
                {/* 1. 用户信息 (去掉头像、去掉信用评分、用户ID放在昵称右侧同行) */}
                <div className="flex items-start gap-3.5">
                  <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 pt-1.5">
                    用户信息
                  </div>
                  <div className="flex-1 bg-slate-50/90 rounded-xl p-3 border border-slate-200/90 flex flex-col gap-1.5">
                    {/* 第一行: 用户昵称在左，用户ID在右侧 */}
                    <div className="flex items-center justify-between min-w-0 gap-2">
                      <span
                        className="font-bold text-slate-900 text-sm truncate"
                        title={cardActionModal.task.user.name}
                      >
                        {cardActionModal.task.user.name}
                      </span>
                      <span className="text-xs text-slate-500 font-mono shrink-0">
                        用户ID: {cardActionModal.task.user.userId}
                      </span>
                    </div>
                    {/* 第二行: 用户等级、新老客标签 */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/80 text-[10px] font-semibold">
                        {cardActionModal.task.user.level}
                      </span>
                      {cardActionModal.task.user.isNewUser && (
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/80 text-[10px] font-semibold">
                          新用户
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. 卡信息 (与人工派单保持一致) */}
                <div className="flex items-start gap-3.5">
                  <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 pt-1.5">
                    卡信息
                  </div>
                  <div className="flex-1 bg-slate-50/90 rounded-xl p-3 border border-slate-200/90 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <CardBrandLogo card={{ brandName: cardActionModal.task.cardType, iconType: cardActionModal.task.cardTypeIcon }} size="xs" />
                        <span className="font-bold text-slate-800 text-xs truncate">
                          {cardActionModal.task.cardFullName || cardActionModal.task.cardType}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs shrink-0">
                        面值: {cardActionModal.task.faceValue}  数量: {cardActionModal.task.cardQuantity || 1}张
                      </span>
                    </div>
                    {/* 第二行: 国家、介质、时效 标签 (与列表完全一致) */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium leading-none whitespace-nowrap">
                        {cardActionModal.task.country}{cardActionModal.task.countryName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 font-medium leading-none whitespace-nowrap">
                        {cardActionModal.task.mediaTypeLabel || (cardActionModal.task.cardDetails?.imageReflections ? '卡图' : '电子码')}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium leading-none whitespace-nowrap">
                        {cardActionModal.task.speedTag || '快卡'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. 同步用户信息 (支持同时同步多条信息，支持新增和删除操作，最多5条，默认展示信息1不可删) */}
                <div className="flex items-start gap-3.5">
                  <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 pt-2 flex items-center justify-end">
                    <span className="text-rose-500 font-bold mr-1">*</span>
                    <span>同步用户信息</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-3">
                    {syncUserItems.map((item, idx) => {
                      const itemTitle = `信息${idx + 1}`;
                      const canDelete = idx > 0;

                      return (
                        <div
                          key={item.id}
                          className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/90 flex flex-col gap-3.5 relative"
                        >
                          {/* 条目标题与删除按钮 */}
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                              <span className="font-bold text-slate-800 text-xs">{itemTitle}</span>
                              {idx === 0 && (
                                <span className="text-[10px] text-slate-400 font-normal">（默认条目，不可删除）</span>
                              )}
                            </div>
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => handleDeleteSyncItem(idx)}
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-0.5 rounded text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                                title="删除此条信息"
                              >
                                <MaterialIcon name="delete" size={14} />
                                <span>删除</span>
                              </button>
                            )}
                          </div>

                          {/* 1) 信息类型: 单选，必填项，枚举值: 无效卡同步、其他 */}
                          <div className="flex items-center gap-3">
                            <span className="text-slate-600 text-xs font-medium w-24 shrink-0">
                              <span className="text-rose-500 font-bold mr-0.5">*</span>信息类型:
                            </span>
                            <div className="flex items-center gap-5">
                              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-700 select-none">
                                <input
                                  type="radio"
                                  name={`sync_type_${item.id}`}
                                  value="无效卡同步"
                                  checked={item.type === '无效卡同步'}
                                  onChange={() => handleSyncTypeChange(idx, '无效卡同步')}
                                  className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                />
                                <span>无效卡同步</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-700 select-none">
                                <input
                                  type="radio"
                                  name={`sync_type_${item.id}`}
                                  value="其他"
                                  checked={item.type === '其他'}
                                  onChange={() => handleSyncTypeChange(idx, '其他')}
                                  className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                />
                                <span>其他</span>
                              </label>
                            </div>
                          </div>

                          {/* 2) 同步信息内容: 最多1000个字符，仅支持输入英文 */}
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-slate-700 font-medium">
                                  <span className="text-rose-500 font-bold mr-0.5">*</span>同步信息内容:
                                </span>
                                <span className="text-[11px] text-slate-500 font-normal">
                                  用户端展示，仅支持使用英文录入
                                </span>
                              </div>
                              <span
                                className={`font-mono text-[11px] ${
                                  item.content.length >= 1000 ? 'text-rose-600 font-bold' : 'text-slate-400'
                                }`}
                              >
                                {item.content.length}/1000
                              </span>
                            </div>
                            <div className="relative">
                              <textarea
                                rows={3}
                                value={item.content}
                                onChange={e => handleSyncContentChange(idx, e.target.value)}
                                placeholder="请输入"
                                maxLength={1000}
                                className={`w-full p-2.5 bg-white border rounded-lg text-xs placeholder:text-slate-400 focus:outline-none transition-all leading-relaxed ${
                                  item.contentError
                                    ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-100'
                                    : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                                }`}
                              />
                            </div>
                            {item.contentError && (
                              <span className="text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                                <MaterialIcon name="error" size={13} />
                                {item.contentError}
                              </span>
                            )}
                          </div>

                          {/* 3) 举证图: 支持上传多张(最多12张)，多图网格卡片墙样式 */}
                          <div className="flex flex-col gap-1.5">
                            <div className="text-xs">
                              <span className="text-slate-700 font-medium">举证图:</span>
                            </div>

                            {/* 多图卡片网格区域 */}
                            <div
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={e => handleSyncDrop(idx, e)}
                              onPaste={e => handleSyncContainerPaste(idx, e)}
                              tabIndex={0}
                              className="p-3 bg-white border border-slate-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            >
                              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                                {/* 已上传图片卡片 */}
                                {item.proofImages.map((img, imgIdx) => (
                                  <div
                                    key={img.id}
                                    className="group relative w-full aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-50 shadow-2xs hover:shadow-md transition-all flex items-center justify-center"
                                  >
                                    <img
                                      src={img.dataUrl}
                                      alt={img.name}
                                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                    />
                                    {/* 序号角标 */}
                                    <span className="absolute top-1 left-1 bg-black/60 backdrop-blur-xs text-white text-[9px] font-mono px-1 py-0.2 rounded font-semibold leading-none pointer-events-none">
                                      #{imgIdx + 1}
                                    </span>
                                    {/* Hover 遮罩操作 */}
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={e => {
                                          e.stopPropagation();
                                          setPreviewImageModal({
                                            url: img.dataUrl,
                                            title: `举证图 #${imgIdx + 1} - ${img.name}`,
                                          });
                                        }}
                                        className="w-7 h-7 rounded-full bg-white/95 hover:bg-white text-slate-700 flex items-center justify-center transition-transform hover:scale-110 shadow-xs cursor-pointer"
                                        title="查看大图"
                                      >
                                        <MaterialIcon name="zoom_in" size={15} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={e => {
                                          e.stopPropagation();
                                          handleSyncRemoveImage(idx, img.id);
                                        }}
                                        className="w-7 h-7 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-transform hover:scale-110 shadow-xs cursor-pointer"
                                        title="删除此图片"
                                      >
                                        <MaterialIcon name="delete" size={15} />
                                      </button>
                                    </div>
                                  </div>
                                ))}

                                {/* 上传入口卡片 (未满12张时展示) */}
                                {item.proofImages.length < 12 && (
                                  <label className="w-full aspect-square rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center text-center cursor-pointer p-1.5 select-none group">
                                    <input
                                      type="file"
                                      multiple
                                      accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                                      className="hidden"
                                      onChange={e => handleSyncFileInputChange(idx, e)}
                                    />
                                    <div className="w-7 h-7 rounded-full bg-white group-hover:bg-blue-100 text-slate-400 group-hover:text-blue-600 flex items-center justify-center mb-1 transition-colors shadow-2xs border border-slate-200/80 group-hover:border-blue-200">
                                      <MaterialIcon name="add" size={18} />
                                    </div>
                                    <span className="text-[11px] font-semibold text-slate-700 group-hover:text-blue-600 leading-tight">
                                      添加图片
                                    </span>
                                  </label>
                                )}
                              </div>
                            </div>

                            {/* 举证图文案移至下方 */}
                            <div className="text-[11px] text-slate-500">
                              请上传 格式为 png/jpg/jpeg 的文件 【请将图片 拖拽 / 粘贴 在此处上传】
                            </div>

                            {item.imageError && (
                              <span className="text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                                <MaterialIcon name="error" size={13} />
                                {item.imageError}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* 新增按钮 (最多5条) */}
                    {syncUserItems.length < 5 ? (
                      <button
                        type="button"
                        onClick={handleAddSyncItem}
                        className="w-full py-2 border border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_circle</span>
                        <span>新增一条同步信息 ({syncUserItems.length}/5)</span>
                      </button>
                    ) : (
                      <div className="text-center py-1.5 text-[11px] text-slate-400 bg-slate-100 rounded-lg">
                        已达到最大同步信息条数限制（最多 5 条）
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : cardActionModal.type === 'directProcess' ? (
              /* 直接处理定制内容: 两步处理逻辑 (卡单ID已统一置于标题栏) */
              directProcessStep === 1 ? (
                /* 第一步：选择处理结果 (请谨慎处理) */
                <div className="p-6 flex flex-col gap-4 text-xs">
                  {/* 1. 卡信息 (与人工派单弹窗严格保持一致) */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 pt-1.5">
                      卡信息
                    </div>
                    <div className="flex-1 bg-slate-50/90 rounded-xl p-3 border border-slate-200/90 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <CardBrandLogo card={{ brandName: cardActionModal.task.cardType, iconType: cardActionModal.task.cardTypeIcon }} size="xs" />
                          <span className="font-bold text-slate-800 text-xs truncate">
                            {cardActionModal.task.cardFullName || cardActionModal.task.cardType}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs shrink-0">
                          面值: {cardActionModal.task.faceValue}  数量: {cardActionModal.task.cardQuantity || 1}张
                        </span>
                      </div>
                      {/* 第二行: 国家、介质、时效 标签 (与列表完全一致) */}
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium leading-none whitespace-nowrap">
                          {cardActionModal.task.country}{cardActionModal.task.countryName}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 font-medium leading-none whitespace-nowrap">
                          {cardActionModal.task.mediaTypeLabel || (cardActionModal.task.cardDetails?.imageReflections ? '卡图' : '电子码')}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium leading-none whitespace-nowrap">
                          {cardActionModal.task.speedTag || '快卡'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. 第一步：选择处理结果 (请谨慎处理) */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 pt-2 flex items-center justify-end flex-wrap">
                      <span className="text-rose-500 font-bold mr-1">*</span>
                      <span>处理结果</span>
                      <span className="text-amber-600 text-[11px] font-normal ml-0.5">（请谨慎处理）</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* 选项一：提交处理成功 */}
                        <label
                          className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${
                            directProcessResult === 'success'
                              ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="directProcessResult"
                            value="success"
                            checked={directProcessResult === 'success'}
                            onChange={() => setDirectProcessResult('success')}
                            className="mt-0.5 w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                          />
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                              <MaterialIcon name="check_circle" size={16} className="text-emerald-600" />
                              <span>提交处理成功</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              核验无误，进入处理成功页核准卡代码、录入备注凭证并结算放款
                            </p>
                          </div>
                        </label>

                        {/* 选项二：提交处理失败 */}
                        <label
                          className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${
                            directProcessResult === 'failure'
                              ? 'border-rose-500 bg-rose-50/50 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="directProcessResult"
                            value="failure"
                            checked={directProcessResult === 'failure'}
                            onChange={() => setDirectProcessResult('failure')}
                            className="mt-0.5 w-4 h-4 text-rose-600 focus:ring-rose-500 cursor-pointer accent-rose-600"
                          />
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                              <MaterialIcon name="cancel" size={16} className="text-rose-600" />
                              <span>提交处理失败</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              卡密异常或校验未通过，进入处理失败操作页（暂时占位）
                            </p>
                          </div>
                        </label>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        请谨慎处理当前卡单，点击「下一步」进入对应操作页
                      </span>
                    </div>
                  </div>
                </div>
              ) : directProcessResult === 'success' ? (
                /* 第二步：处理成功操作页 (严格提炼截图内容，UI样式与当前项目保持一致) */
                <div className="p-6 flex-1 min-h-0 max-h-[calc(90vh-130px)] flex flex-col gap-4 text-xs overflow-y-auto overscroll-contain pr-3">
                  {/* 1. 卡信息 (与人工派单弹窗严格保持一致) */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 pt-1.5">
                      卡信息
                    </div>
                    <div className="flex-1 bg-slate-50/90 rounded-xl p-3 border border-slate-200/90 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <CardBrandLogo card={{ brandName: cardActionModal.task.cardType, iconType: cardActionModal.task.cardTypeIcon }} size="xs" />
                          <span className="font-bold text-slate-800 text-xs truncate">
                            {cardActionModal.task.cardFullName || cardActionModal.task.cardType}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs shrink-0">
                          面值: {cardActionModal.task.faceValue}  数量: {cardActionModal.task.cardQuantity || 1}张
                        </span>
                      </div>
                      {/* 第二行: 国家、介质、时效 标签 (与列表完全一致) */}
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium leading-none whitespace-nowrap">
                          {cardActionModal.task.country}{cardActionModal.task.countryName}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 font-medium leading-none whitespace-nowrap">
                          {cardActionModal.task.mediaTypeLabel || (cardActionModal.task.cardDetails?.imageReflections ? '卡图' : '电子码')}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium leading-none whitespace-nowrap">
                          {cardActionModal.task.speedTag || '快卡'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. 当前报价 (样式与人工派单样式保持一致，放在卡信息后面) */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 pt-0.5">
                      当前报价
                    </div>
                    <div className="flex-1 flex flex-col gap-1 text-xs">
                      {/* 第一行: 用户成交报价 */}
                      <div className="flex items-center gap-1 font-mono whitespace-nowrap">
                        <span className="text-slate-500 font-sans text-[11px]">用户成交报价：</span>
                        <span className="font-semibold text-emerald-700">
                          {cardActionModal.task.userDealQuote || '￥7.0000/₦1386'}
                        </span>
                      </div>
                      {/* 第二行: 收卡报价 */}
                      <div className="flex items-center gap-1 font-mono whitespace-nowrap">
                        <span className="text-slate-500 font-sans text-[11px]">收卡报价：</span>
                        <span className="font-semibold text-blue-700">
                          {cardActionModal.task.merchantQuote || '￥8.0000'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. * 卡代码 (必填，多行文本域，一行一个卡代码，上限100行) */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 pt-2 flex items-center justify-end">
                      <span className="text-rose-500 font-bold mr-1">*</span>
                      <span>卡代码</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <textarea
                        rows={4}
                        value={directProcessCardCodes}
                        onChange={e => handleDirectProcessCardCodesChange(e.target.value)}
                        placeholder="STM-UK-9921-X992-0012"
                        className={`w-full p-2.5 bg-white border rounded-lg text-xs font-mono placeholder:text-slate-400 focus:outline-none transition-all leading-relaxed ${
                          directProcessCardCodesError
                            ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-100'
                            : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                        }`}
                      />
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">一行一个卡代码</span>
                        <span
                          className={`font-mono ${
                            directProcessLineCount > 100
                              ? 'text-rose-600 font-bold'
                              : 'text-slate-500'
                          }`}
                        >
                          当前: {directProcessLineCount} 行 / 上限 100 行
                        </span>
                      </div>
                      {directProcessCardCodesError && (
                        <span className="text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                          <MaterialIcon name="error" size={13} />
                          {directProcessCardCodesError}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 3. 备注 (选填，用户端展示，仅支持输入英文) */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 pt-2">
                      备注
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <textarea
                        rows={3}
                        value={directProcessNote}
                        onChange={e => handleDirectProcessNoteChange(e.target.value)}
                        placeholder=""
                        maxLength={1000}
                        className={`w-full p-2.5 bg-white border rounded-lg text-xs placeholder:text-slate-400 focus:outline-none transition-all leading-relaxed ${
                          directProcessNoteError
                            ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-100'
                            : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                        }`}
                      />
                      <div className="text-[11px] text-slate-400">
                        <strong className="font-semibold text-slate-700">选填，用户端展示。</strong> 仅支持输入英文
                      </div>
                      {directProcessNoteError && (
                        <span className="text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                          <MaterialIcon name="error" size={13} />
                          {directProcessNoteError}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4. 图片 (选填，用户端展示，支持 png/jpg/jpeg，拖拽/粘贴) */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 pt-2">
                      图片
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDirectProcessDrop}
                        onPaste={handleDirectProcessPaste}
                        tabIndex={0}
                        className="flex items-center gap-2.5 flex-wrap focus:outline-none"
                      >
                        {/* 上传好的图片缩略图 */}
                        {directProcessImages.map((img, idx) => (
                          <div
                            key={img.id}
                            className="group relative w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-2xs hover:shadow-md transition-all flex items-center justify-center shrink-0"
                          >
                            <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                            <span className="absolute top-0.5 left-0.5 bg-black/60 text-white text-[8px] font-mono px-1 rounded leading-none">
                              #{idx + 1}
                            </span>
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => setPreviewImageModal({ url: img.dataUrl, title: `凭证图 #${idx + 1}` })}
                                className="w-5 h-5 rounded-full bg-white text-slate-700 flex items-center justify-center cursor-pointer"
                                title="查看大图"
                              >
                                <MaterialIcon name="zoom_in" size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDirectProcessRemoveImage(img.id)}
                                className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center cursor-pointer"
                                title="删除图片"
                              >
                                <MaterialIcon name="delete" size={13} />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* 上传入口框 (严格契合截图样式) */}
                        {directProcessImages.length < 12 && (
                          <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center text-center cursor-pointer select-none group shrink-0">
                            <input
                              ref={directProcessFileInputRef}
                              type="file"
                              multiple
                              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                              className="hidden"
                              onChange={handleDirectProcessFileInputChange}
                            />
                            <MaterialIcon name="upload" size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                            <span className="text-[10px] text-slate-500 group-hover:text-blue-600 transition-colors mt-0.5">
                              上传图片
                            </span>
                          </label>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        <strong className="font-semibold text-slate-700">选填，用户端展示。</strong> 请上传格式为 <strong className="text-slate-600 font-medium">png/jpg/jpeg</strong> 的文件 【请将图片 <span className="text-blue-600 font-medium">拖拽</span> / <span className="text-blue-600 font-medium">粘贴</span> 在此处上传】
                      </div>
                      {directProcessImageError && (
                        <span className="text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                          <MaterialIcon name="error" size={13} />
                          {directProcessImageError}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* 第二步：处理失败操作页 (根据要求：暂时先不要有内容暂时占位) */
                <div className="p-6 flex-1 min-h-0 max-h-[calc(90vh-130px)] flex flex-col gap-4 text-xs overflow-y-auto overscroll-contain pr-3">
                  {/* 1. 卡信息 (与人工派单弹窗严格保持一致) */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 pt-1.5">
                      卡信息
                    </div>
                    <div className="flex-1 bg-slate-50/90 rounded-xl p-3 border border-slate-200/90 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <CardBrandLogo card={{ brandName: cardActionModal.task.cardType, iconType: cardActionModal.task.cardTypeIcon }} size="xs" />
                          <span className="font-bold text-slate-800 text-xs truncate">
                            {cardActionModal.task.cardFullName || cardActionModal.task.cardType}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs shrink-0">
                          面值: {cardActionModal.task.faceValue}  数量: {cardActionModal.task.cardQuantity || 1}张
                        </span>
                      </div>
                      {/* 第二行: 国家、介质、时效 标签 (与列表完全一致) */}
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium leading-none whitespace-nowrap">
                          {cardActionModal.task.country}{cardActionModal.task.countryName}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 font-medium leading-none whitespace-nowrap">
                          {cardActionModal.task.mediaTypeLabel || (cardActionModal.task.cardDetails?.imageReflections ? '卡图' : '电子码')}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium leading-none whitespace-nowrap">
                          {cardActionModal.task.speedTag || '快卡'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. 重要提示 (琥珀警示横幅) */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-24 shrink-0 text-right text-xs font-medium text-amber-700 pt-1 flex items-center justify-end">
                      <MaterialIcon name="warning" size={16} className="text-amber-500 mr-1" />
                      <span>重要提示</span>
                    </div>
                    <div className="flex-1 bg-amber-50/90 border border-amber-200/90 rounded-xl p-3 text-amber-900 shadow-2xs">
                      <div className="text-xs leading-relaxed font-normal">
                        <span className="font-bold text-amber-950 mr-1">注意：</span>
                        由于卡码卡图等关键信息您已可见，若非用户原因导致处理失败，那么用户损失将由您来承担。请确认清楚后再操作！
                      </div>
                    </div>
                  </div>

                  {/* 3. 卡代码 (非必填，样式与确认处理成功页保持一致，放在失败原因上方) */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 pt-2">
                      卡代码
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <textarea
                        rows={4}
                        value={directProcessFailCardCodes}
                        onChange={e => handleDirectProcessFailCardCodesChange(e.target.value)}
                        placeholder="STM-UK-9921-X992-0012"
                        className={`w-full p-2.5 bg-white border rounded-lg text-xs font-mono placeholder:text-slate-400 focus:outline-none transition-all leading-relaxed ${
                          directProcessFailCardCodesError
                            ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-100'
                            : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                        }`}
                      />
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">一行一个卡代码</span>
                        <span
                          className={`font-mono ${
                            directProcessFailLineCount > 100
                              ? 'text-rose-600 font-bold'
                              : 'text-slate-500'
                          }`}
                        >
                          当前: {directProcessFailLineCount} 行 / 上限 100 行
                        </span>
                      </div>
                      {directProcessFailCardCodesError && (
                        <span className="text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                          <MaterialIcon name="error" size={13} />
                          {directProcessFailCardCodesError}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4. * 失败原因 (下拉选择，单选，必填项) */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 pt-2 flex items-center justify-end">
                      <span className="text-rose-500 font-bold mr-1">*</span>
                      <span>失败原因</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <select
                        value={directProcessFailReason}
                        onChange={e => {
                          setDirectProcessFailReason(e.target.value);
                          if (e.target.value) setDirectProcessFailReasonError(null);
                        }}
                        className={`w-full p-2.5 bg-white border rounded-lg text-xs transition-all focus:outline-none cursor-pointer ${
                          directProcessFailReasonError
                            ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-100'
                            : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                        }`}
                      >
                        <option value="">请选择失败原因（必填）</option>
                        {DIRECT_PROCESS_FAIL_REASONS.map(reason => (
                          <option key={reason.value} value={reason.value}>
                            {reason.label}
                          </option>
                        ))}
                      </select>
                      {directProcessFailReasonError && (
                        <span className="text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                          <MaterialIcon name="error" size={13} />
                          {directProcessFailReasonError}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4. 备注 (选填，用户端展示，仅支持输入英文) */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 pt-2">
                      备注
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <textarea
                        rows={3}
                        value={directProcessFailNote}
                        onChange={e => handleDirectProcessFailNoteChange(e.target.value)}
                        placeholder=""
                        maxLength={1000}
                        className={`w-full p-2.5 bg-white border rounded-lg text-xs placeholder:text-slate-400 focus:outline-none transition-all leading-relaxed ${
                          directProcessFailNoteError
                            ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-100'
                            : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                        }`}
                      />
                      <div className="text-[11px] text-slate-400">
                        <strong className="font-semibold text-slate-700">选填，用户端展示。</strong> 仅支持输入英文
                      </div>
                      {directProcessFailNoteError && (
                        <span className="text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                          <MaterialIcon name="error" size={13} />
                          {directProcessFailNoteError}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 5. * 举证图 (必填项，支持录入多张，提示文案为：必填，用户端展示。请上传格式为 png/jpg/jpeg 的文件【请将图片 拖拽 / 粘贴 在此处上传】) */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 pt-2 flex items-center justify-end">
                      <span className="text-rose-500 font-bold mr-1">*</span>
                      <span>举证图</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDirectProcessFailDrop}
                        onPaste={handleDirectProcessFailPaste}
                        tabIndex={0}
                        className="flex items-center gap-2.5 flex-wrap focus:outline-none"
                      >
                        {/* 上传好的图片缩略图 */}
                        {directProcessFailImages.map((img, idx) => (
                          <div
                            key={img.id}
                            className="group relative w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-2xs hover:shadow-md transition-all flex items-center justify-center shrink-0"
                          >
                            <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                            <span className="absolute top-0.5 left-0.5 bg-black/60 text-white text-[8px] font-mono px-1 rounded leading-none">
                              #{idx + 1}
                            </span>
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => setPreviewImageModal({ url: img.dataUrl, title: `举证图 #${idx + 1}` })}
                                className="w-5 h-5 rounded-full bg-white text-slate-700 flex items-center justify-center cursor-pointer"
                                title="查看大图"
                              >
                                <MaterialIcon name="zoom_in" size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDirectProcessFailRemoveImage(img.id)}
                                className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center cursor-pointer"
                                title="删除图片"
                              >
                                <MaterialIcon name="delete" size={13} />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* 上传入口框 */}
                        {directProcessFailImages.length < 12 && (
                          <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center text-center cursor-pointer select-none group shrink-0">
                            <input
                              ref={directProcessFailFileInputRef}
                              type="file"
                              multiple
                              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                              className="hidden"
                              onChange={handleDirectProcessFailFileInputChange}
                            />
                            <MaterialIcon name="upload" size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                            <span className="text-[10px] text-slate-500 group-hover:text-blue-600 transition-colors mt-0.5">
                              上传图片
                            </span>
                          </label>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        <strong className="font-semibold text-slate-700">必填，用户端展示。</strong> 请上传格式为 <strong className="text-slate-600 font-medium">png/jpg/jpeg</strong> 的文件 【请将图片 <span className="text-blue-600 font-medium">拖拽</span> / <span className="text-blue-600 font-medium">粘贴</span> 在此处上传】
                      </div>
                      {directProcessFailImageError && (
                        <span className="text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                          <MaterialIcon name="error" size={13} />
                          {directProcessFailImageError}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            ) : cardActionModal.type === 'splitOrder' ? (
              splitOrderStep === 1 ? (
                /* 拆单步骤 1: 录入新卡单信息及勾选原单卡图凭证 */
                <div className="p-6 flex-1 min-h-0 max-h-[calc(90vh-130px)] flex flex-col gap-4 text-xs overflow-y-auto overscroll-contain pr-3">
                  {/* 步骤条提示 */}
                  <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">1</span>
                      <span className="text-blue-900 font-bold text-xs">第一步：选择拆分卡图与录入新单信息</span>
                    </div>
                    <MaterialIcon name="arrow_forward" size={16} className="text-slate-400" />
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 font-bold text-[10px] flex items-center justify-center">2</span>
                      <span className="text-slate-500 font-medium text-xs">第二步：核对拆单结果并提交</span>
                    </div>
                  </div>

                  {splitGeneralError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium text-xs flex items-center gap-2">
                      <MaterialIcon name="error" size={16} className="text-rose-500 shrink-0" />
                      <span>{splitGeneralError}</span>
                    </div>
                  )}

                  {/* 模块一：原卡单信息对照 (只读) */}
                  <div className="flex flex-col gap-2 bg-slate-50/90 rounded-xl p-3.5 border border-slate-200/90 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <MaterialIcon name="info" size={16} className="text-blue-600" />
                        <span>模块一：原卡单信息对照</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">原单号: {cardActionModal.task.id}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CardBrandLogo card={{ brandName: cardActionModal.task.cardType, iconType: cardActionModal.task.cardTypeIcon }} size="xs" />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-900 text-xs truncate">
                            {cardActionModal.task.cardFullName || cardActionModal.task.cardType}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-medium leading-none">
                              {cardActionModal.task.country}{cardActionModal.task.countryName}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100/70 text-blue-700 font-medium leading-none">
                              {cardActionModal.task.mediaTypeLabel || '卡图'}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100/70 text-emerald-700 font-medium leading-none">
                              {cardActionModal.task.speedTag || '快卡'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono text-slate-900 text-xs font-semibold flex items-center justify-end gap-3">
                          <span>面值: {cardActionModal.task.faceValue}</span>
                          <span>原单卡图总数: {getTaskCardItems(cardActionModal.task).length}张</span>
                        </div>
                        <div className="text-[11px] font-mono mt-1 text-slate-600">
                          <span>收卡报价: <strong className="text-blue-700 font-semibold">{cardActionModal.task.merchantQuote || '￥7.9200'}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 模块二：选择拆分卡图来源 (必须从原单图片中选择，至少选1张，原单必须保留1张) */}
                  <div className="flex flex-col gap-3 bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <MaterialIcon name="photo_library" size={16} className="text-amber-600" />
                        <span>模块二：选择拆分卡图凭证（来源必须是原单图片中选择）</span>
                      </span>
                      <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
                        已选划入新单: {splitSelectedImageIds.length} 张 / 原单总计: {getTaskCardItems(cardActionModal.task).length} 张
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 leading-relaxed">
                      请勾选需要划入新卡单的卡图凭证。原卡单必须至少保留 1 张卡图。
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                      {getTaskCardItems(cardActionModal.task).map((item, idx) => {
                        const isSelected = splitSelectedImageIds.includes(item.id);
                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              if (isSelected) {
                                if (splitSelectedImageIds.length <= 1) {
                                  setSplitGeneralError('新卡单必须至少包含 1 张卡图');
                                  return;
                                }
                                setSplitSelectedImageIds(prev => prev.filter(id => id !== item.id));
                                setSplitQuantity(String(splitSelectedImageIds.length - 1));
                              } else {
                                if (splitSelectedImageIds.length >= getTaskCardItems(cardActionModal.task).length - 1) {
                                  setSplitGeneralError('原卡单需至少保留 1 张卡图');
                                  return;
                                }
                                setSplitSelectedImageIds(prev => [...prev, item.id]);
                                setSplitQuantity(String(splitSelectedImageIds.length + 1));
                              }
                              setSplitGeneralError(null);
                            }}
                            className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-amber-50/70 border-amber-300 shadow-2xs ring-2 ring-amber-100'
                                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/80'
                            }`}
                          >
                            <div className="relative w-12 h-12 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.cardName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  <MaterialIcon name="image" size={20} />
                                </div>
                              )}
                              <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-black/60 text-white font-mono font-bold text-[9px] flex items-center justify-center">
                                {idx + 1}
                              </div>
                            </div>
                            <div className="flex flex-col min-w-1 flex-1">
                              <span className="font-bold text-slate-900 text-xs truncate">{item.cardName}</span>
                              <span className="text-[10px] text-slate-500 font-mono truncate">{item.code || '无明文卡代码'}</span>
                              <span className={`text-[10px] font-semibold mt-1 ${isSelected ? 'text-amber-700' : 'text-slate-400'}`}>
                                {isSelected ? '✓ 已选划入新单' : '未选中'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 模块三：新卡单信息录入 (字段与修改卡信息一致) */}
                  <div className="flex flex-col gap-3.5 bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <MaterialIcon name="add_card" size={16} className="text-blue-600" />
                        <span>模块三：新卡单信息录入</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">新单号: {splitNewOrderId}</span>
                    </div>

                    {/* 1. 卡类型 */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600">新单卡类型</div>
                      <div className="flex-1">
                        <select
                          value={splitCardType}
                          onChange={e => setSplitCardType(e.target.value)}
                          className="w-56 p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                        >
                          {EDIT_CARD_TYPE_OPTIONS.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* 2. 国家 */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600">国家地区</div>
                      <div className="flex-1">
                        <select
                          value={splitCountry}
                          onChange={e => setSplitCountry(e.target.value)}
                          className="w-56 p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                        >
                          {EDIT_COUNTRY_OPTIONS.map(c => (
                            <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.code})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* 3. 介质 */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600">介质类型</div>
                      <div className="flex-1">
                        <select
                          value={splitMediaType}
                          onChange={e => setSplitMediaType(e.target.value)}
                          className="w-56 p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                        >
                          {EDIT_MEDIA_TYPE_OPTIONS.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {/* 4. 交易速度 */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600">交易速度</div>
                      <div className="flex-1">
                        <select
                          value={splitSpeed}
                          onChange={e => setSplitSpeed(e.target.value)}
                          className="w-56 p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                        >
                          {EDIT_SPEED_OPTIONS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* 5. 面额 & 数量 */}
                    <div className="flex flex-col gap-3.5">
                      <div className="flex items-center gap-3.5">
                        <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600">卡面值</div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={splitFaceValue}
                            onChange={e => {
                              setSplitFaceValue(e.target.value);
                              if (splitFaceValueError) setSplitFaceValueError(null);
                            }}
                            placeholder="如 100"
                            className="w-56 p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3.5">
                        <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600">卡数量</div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={splitQuantity}
                            onChange={e => {
                              setSplitQuantity(e.target.value);
                              if (splitQuantityError) setSplitQuantityError(null);
                            }}
                            placeholder="如 1"
                            className="w-56 p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 6. 报价 */}
                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-semibold text-slate-700">收卡报价 (Merchant Quote)</span>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400 font-mono">￥</span>
                          <input
                            type="text"
                            value={splitPurchaseRate}
                            onChange={e => {
                              setSplitPurchaseRate(e.target.value);
                              if (splitPurchaseRateError) setSplitPurchaseRateError(null);
                            }}
                            className="w-full pl-7 p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                        {splitPurchaseRateError && <span className="text-[10px] text-rose-500 font-medium">{splitPurchaseRateError}</span>}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="font-semibold text-slate-700">用户成交报价 (联动自动计算)</span>
                        <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg font-mono text-xs font-bold text-emerald-800 flex items-center justify-between">
                          <span>{calculatedSplitUserDealQuote.formatted}</span>
                          <span className="text-[10px] text-emerald-600 font-normal">自动折算 (含95%折率及奈拉向上取整)</span>
                        </div>
                      </div>
                    </div>

                    {/* 7. 备注说明 */}
                    <div className="flex flex-col gap-1.5 pt-1">
                      <span className="font-bold text-slate-900 text-xs">备注</span>
                      <textarea
                        value={splitNote}
                        onChange={e => {
                            const val = e.target.value;
                            if (/[\u4e00-\u9fa5]/.test(val)) return; // Simple Chinese check
                            setSplitNote(val);
                        }}
                        rows={2}
                        placeholder="请输入"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-sans focus:outline-none focus:border-blue-500 resize-none"
                      ></textarea>
                      <span className="text-[10px] text-slate-400 font-medium font-bold">非必填</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* 拆单步骤 2: 核对拆单对比项与二次确认提交 */
                <div className="p-6 flex-1 min-h-0 max-h-[calc(90vh-130px)] flex flex-col gap-4 text-xs overflow-y-auto overscroll-contain pr-3">
                  <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 font-bold text-[10px] flex items-center justify-center">1</span>
                      <span className="text-slate-500 font-medium text-xs">第一步：选择拆分卡图与录入新单信息</span>
                    </div>
                    <MaterialIcon name="arrow_forward" size={16} className="text-blue-600" />
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">2</span>
                      <span className="text-blue-900 font-bold text-xs">第二步：核对拆单结果并提交</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 flex items-start gap-3">
                    <MaterialIcon name="warning" size={20} className="text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-xs">拆单二次确认提示</span>
                      <span className="text-[11px] text-amber-800 leading-relaxed">
                        提交成功后，从原单中划出的卡图将独立生成一个新的卡单（新单号：<strong className="font-mono">{splitNewOrderId}</strong>），且该新卡单将默认归属到 <strong className="text-amber-950 font-bold">【无商户接卡】</strong> 列表中，请仔细核对以下对比项：
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* 原卡单变更后概览 */}
                    <div className="flex flex-col gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <MaterialIcon name="receipt" size={15} className="text-slate-600" />
                        <span>原卡单 ({cardActionModal.task.id}) 拆分后状态</span>
                      </span>
                      <div className="flex flex-col gap-1.5 text-xs text-slate-700">
                        <div className="flex justify-between">
                          <span className="text-slate-500">剩余卡图数量:</span>
                          <span className="font-mono font-bold text-slate-900">
                            {getTaskCardItems(cardActionModal.task).length - splitSelectedImageIds.length} 张
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">原单状态:</span>
                          <span className="font-medium text-blue-700">{cardActionModal.task.statusLabel}</span>
                        </div>
                      </div>
                    </div>

                    {/* 新生成卡单概览 */}
                    <div className="flex flex-col gap-2.5 bg-blue-50/60 p-3.5 rounded-xl border border-blue-200">
                      <span className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                        <MaterialIcon name="fiber_new" size={15} className="text-blue-600" />
                        <span>新生成卡单 ({splitNewOrderId}) 概览</span>
                      </span>
                      <div className="flex flex-col gap-1.5 text-xs text-slate-700">
                        <div className="flex justify-between">
                          <span className="text-slate-500">卡类型/地区:</span>
                          <span className="font-semibold text-slate-900">{splitCardType} ({splitCountry})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">面值 / 数量:</span>
                          <span className="font-mono font-bold text-slate-900">{splitFaceValue} / {splitQuantity}张</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">收卡报价:</span>
                          <span className="font-mono font-semibold text-blue-700">￥{parseFloat(splitPurchaseRate || '0').toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">划入卡图数:</span>
                          <span className="font-mono font-bold text-amber-700">{splitSelectedImageIds.length} 张</span>
                        </div>
                        <div className="flex justify-between border-t border-blue-200 pt-1.5">
                          <span className="text-slate-500">默认归属列表:</span>
                          <span className="font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded text-[10px]">无商户接卡</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ) : cardActionModal.type === 'editCard' ? (
              editCardStep === 1 ? (
                /* 步骤 1: 修改卡信息定制表单 (模块一当前信息 + 模块二修改后信息 + 模块三卡单报价 + 模块四备注与举证图) */
                <div className="p-6 flex-1 min-h-0 max-h-[calc(90vh-130px)] flex flex-col gap-4 text-xs overflow-y-auto overscroll-contain pr-3">
                  {/* 步骤条提示 */}
                  <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">1</span>
                      <span className="text-blue-900 font-bold text-xs">第一步：卡信息修改</span>
                    </div>
                    <MaterialIcon name="arrow_forward" size={16} className="text-slate-400" />
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 font-bold text-[10px] flex items-center justify-center">2</span>
                      <span className="text-slate-500 font-medium text-xs">第二步：核对修改对比项</span>
                    </div>
                  </div>

                  {/* 模块一：当前卡单信息 (只读对照卡片) */}
                  <div className="flex flex-col gap-2 bg-slate-50/90 rounded-xl p-3.5 border border-slate-200/90 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <MaterialIcon name="info" size={16} className="text-blue-600" />
                        <span>模块一：当前卡单信息</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">原单数据对照</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CardBrandLogo card={{ brandName: cardActionModal.task.cardType, iconType: cardActionModal.task.cardTypeIcon }} size="xs" />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-900 text-xs truncate">
                            {cardActionModal.task.cardFullName || cardActionModal.task.cardType}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-medium leading-none">
                              {cardActionModal.task.country}{cardActionModal.task.countryName}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100/70 text-blue-700 font-medium leading-none">
                              {cardActionModal.task.mediaTypeLabel || (cardActionModal.task.cardDetails?.imageReflections ? '卡图' : '电子码')}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100/70 text-emerald-700 font-medium leading-none">
                              {cardActionModal.task.speedTag || '快卡'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono text-slate-900 text-xs font-semibold flex items-center justify-end gap-3">
                          <span>面值: {cardActionModal.task.faceValue}</span>
                          <span>数量: {cardActionModal.task.cardQuantity || 1}张</span>
                        </div>
                        <div className="text-[11px] font-mono mt-1 text-slate-600 flex items-center justify-end gap-2 flex-wrap">
                          <span>
                            用户成交报价: <strong className="text-emerald-700 font-semibold">{cardActionModal.task.userDealQuote || '￥7.5240/₦1505'}</strong>
                          </span>
                          <span className="text-slate-300">|</span>
                          <span>
                            收卡报价: <strong className="text-blue-700 font-semibold">{cardActionModal.task.merchantQuote ? cardActionModal.task.merchantQuote.replace('￥', '') : '7.9200'}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 模块二：修改后卡单信息 */}
                  <div className="flex flex-col gap-3.5 bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <MaterialIcon name="edit" size={16} className="text-indigo-600" />
                        <span>模块二：修改后卡单信息</span>
                      </span>
                      <span className="text-[11px] text-slate-400">请核实需要调整的卡单规格参数</span>
                    </div>

                    {/* 1. 卡类型 Card Type (下拉单选，默认带入，下拉框宽度收窄) */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600">
                        卡类型
                      </div>
                      <div className="flex-1">
                        <select
                          value={editCardType}
                          onChange={e => {
                            setEditCardType(e.target.value);
                            setEditCardGeneralError(null);
                          }}
                          className="w-56 p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                        >
                          {EDIT_CARD_TYPE_OPTIONS.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* 2. 国家 Country (下拉单选，默认带入，下拉框宽度收窄) */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600">
                        国家
                      </div>
                      <div className="flex-1">
                        <select
                          value={editCountry}
                          onChange={e => {
                            setEditCountry(e.target.value);
                            setEditCardGeneralError(null);
                          }}
                          className="w-56 p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                        >
                          {EDIT_COUNTRY_OPTIONS.map(c => (
                            <option key={c.code} value={c.code}>
                              {c.flag} {c.name} ({c.code})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* 3. 介质类型 Type (下拉单选，默认带入，下拉框宽度收窄) */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600">
                        介质类型
                      </div>
                      <div className="flex-1">
                        <select
                          value={editMediaType}
                          onChange={e => {
                            setEditMediaType(e.target.value);
                            setEditCardGeneralError(null);
                          }}
                          className="w-56 p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                        >
                          {EDIT_MEDIA_TYPE_OPTIONS.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* 4. 交易速度 Speed (下拉单选，默认带入，下拉框宽度收窄) */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600">
                        交易速度
                      </div>
                      <div className="flex-1">
                        <select
                          value={editSpeed}
                          onChange={e => {
                            setEditSpeed(e.target.value);
                            setEditCardGeneralError(null);
                          }}
                          className="w-56 p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                        >
                          {EDIT_SPEED_OPTIONS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* 5. 卡面值 Balance (输入框调小，提示文案放在输入框后面，最大值 5000，支持两位小数，不展示币种单位) */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 flex items-center justify-end">
                        <span className="text-rose-500 font-bold mr-1">*</span>
                        <span>卡面值</span>
                      </div>
                      <div className="flex-1 flex items-center gap-2.5 flex-wrap">
                        <div className="relative w-44 shrink-0">
                          <input
                            type="number"
                            step="0.01"
                            max={5000}
                            min={0.01}
                            value={editFaceValue}
                            onChange={e => handleEditFaceValueChange(e.target.value)}
                            placeholder="最大值5000"
                            className={`w-full p-2 pr-3 bg-white border rounded-lg text-xs font-mono focus:outline-none transition-all ${
                              editFaceValueError
                                ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-100'
                                : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                            }`}
                          />
                        </div>
                        <span className="text-[11px] text-slate-400">
                          最大值为 5000，最多支持两位小数
                        </span>
                        {editFaceValueError && (
                          <span className="text-[11px] text-rose-500 font-medium flex items-center gap-0.5">
                            <MaterialIcon name="error" size={13} />
                            {editFaceValueError}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 6. 卡数量 Quantity (输入框调小，提示文案放在输入框后面，最大值 20，整数) */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 flex items-center justify-end">
                        <span className="text-rose-500 font-bold mr-1">*</span>
                        <span>卡数量</span>
                      </div>
                      <div className="flex-1 flex items-center gap-2.5 flex-wrap">
                        <div className="relative w-44 shrink-0">
                          <input
                            type="number"
                            step="1"
                            max={20}
                            min={1}
                            value={editQuantity}
                            onChange={e => handleEditQuantityChange(e.target.value)}
                            placeholder="最大值20"
                            className={`w-full p-2 pr-10 bg-white border rounded-lg text-xs font-mono focus:outline-none transition-all ${
                              editQuantityError
                                ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-100'
                                : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                            }`}
                          />
                          <span className="absolute right-2.5 top-2 text-slate-400 text-xs">
                            张
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          最大值为 20，必须为正整数
                        </span>
                        {editQuantityError && (
                          <span className="text-[11px] text-rose-500 font-medium flex items-center gap-0.5">
                            <MaterialIcon name="error" size={13} />
                            {editQuantityError}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 7. 卡图卡密凭证 (作为卡单信息的一部分：含卡图卡密、PIN、有效期、收据等凭证；每个分类默认展示3条，超过3条支持右上角展开/收起；无数据分类不展示；默认加密，单条支持点击查看) */}
                    <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <MaterialIcon name="verified_user" size={15} className="text-blue-600" />
                          <span>卡图卡密凭证</span>
                          <span className="text-[11px] font-normal text-slate-400">（原单提交凭证，支持单条点击查看）</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        {/* 分类 1: 卡图卡密 (若有数据才展示，默认展示3条，超过3条支持右上角展开/收起) */}
                      {MOCK_EDIT_CARD_ITEMS.length > 0 && (() => {
                        const isExpanded = !!editVouchersExpanded['cardCodes'];
                        const displayItems = isExpanded ? MOCK_EDIT_CARD_ITEMS : MOCK_EDIT_CARD_ITEMS.slice(0, 3);
                        return (
                          <div className="flex flex-col gap-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80">
                            <div className="flex items-center justify-between text-[11px] font-medium text-slate-700 px-0.5">
                              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                <MaterialIcon name="photo_library" size={15} className="text-blue-600" />
                                <span>卡图卡代码（共{MOCK_EDIT_CARD_ITEMS.length}张）</span>
                              </div>
                              {MOCK_EDIT_CARD_ITEMS.length > 3 && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleVoucherCategory('cardCodes')}
                                  className="text-[11px] font-medium text-blue-600 hover:text-blue-700 flex items-center gap-0.5 px-2 py-0.5 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                                >
                                  <span>{isExpanded ? '收起' : `展开更多 (${MOCK_EDIT_CARD_ITEMS.length})`}</span>
                                  <MaterialIcon name={isExpanded ? 'expand_less' : 'expand_more'} size={14} />
                                </button>
                              )}
                            </div>

                            <div className="flex flex-col gap-2">
                              {displayItems.map((item, idx) => {
                                const isCodeUnlocked = !!editShowCodesPlain[item.id];
                                const isImgUnlocked = !!editShowCodesPlain[`img_${item.id}`];
                                return (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between gap-3 bg-white px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors shadow-2xs"
                                  >
                                    {/* 序号与卡图部分 */}
                                    <div className="flex items-center gap-2.5 shrink-0">
                                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono font-bold">
                                        #{idx + 1}
                                      </span>

                                      {item.hasImage && item.imageUrl ? (
                                        <div
                                          className="group relative w-11 h-7 rounded-md overflow-hidden bg-slate-900 border border-slate-200 shrink-0 cursor-pointer flex items-center justify-center shadow-2xs"
                                          onClick={() => setPreviewImageModal({ url: item.imageUrl!, title: `卡图 #${idx + 1}` })}
                                          title="点击查看原图"
                                        >
                                          <img
                                            src={item.imageUrl}
                                            alt={item.cardName}
                                            className={`w-full h-full object-cover transition-all duration-150 scale-105 group-hover:scale-100 ${
                                              isImgUnlocked ? 'filter-none' : 'filter blur-[2px] group-hover:blur-none'
                                            }`}
                                          />
                                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                                            <MaterialIcon name="visibility" size={13} className="text-white drop-shadow-xs" />
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="w-11 h-7 rounded-md border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 text-slate-400" title="无卡图">
                                          <MaterialIcon name="image_not_supported" size={12} className="text-slate-300" />
                                        </div>
                                      )}
                                    </div>

                                    {/* 卡代码 / 提取提示部分 */}
                                    <div className="flex-1 min-w-0 flex items-center">
                                      {item.hasCode && item.code ? (
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span className="font-mono text-slate-800 font-semibold text-xs tracking-wider truncate">
                                            {isCodeUnlocked
                                              ? item.code
                                              : `${item.code.slice(0, 4)}-****-****-${item.code.slice(-4)}`}
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-md border border-amber-200/70 text-[11px] font-medium">
                                          <MaterialIcon name="error_outline" size={14} className="text-amber-600 shrink-0" />
                                          <span>卡代码提取失败</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* 右侧操作按钮 */}
                                    <div className="flex items-center gap-1 shrink-0">
                                      {item.hasCode && item.code && (
                                        <button
                                          type="button"
                                          onClick={() => handleToggleEditCode(item.id)}
                                          className="px-2 py-0.5 rounded text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1 cursor-pointer text-[11px] font-medium"
                                        >
                                          <MaterialIcon
                                            name={isCodeUnlocked ? 'visibility_off' : 'visibility'}
                                            size={14}
                                          />
                                          <span>{isCodeUnlocked ? '隐藏' : '点击查看'}</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* 分类 2: PIN (纯卡码，示例 324533，若有数据才展示，默认展示3条，超过3条支持右上角展开/收起) */}
                      {MOCK_EDIT_CARD_PINS.length > 0 && (() => {
                        const isExpanded = !!editVouchersExpanded['pins'];
                        const displayPins = isExpanded ? MOCK_EDIT_CARD_PINS : MOCK_EDIT_CARD_PINS.slice(0, 3);
                        return (
                          <div className="flex flex-col gap-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80">
                            <div className="flex items-center justify-between text-[11px] font-medium text-slate-700 px-0.5">
                              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                <MaterialIcon name="password" size={15} className="text-emerald-600" />
                                <span>PIN码（共{MOCK_EDIT_CARD_PINS.length}条）</span>
                              </div>
                              {MOCK_EDIT_CARD_PINS.length > 3 && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleVoucherCategory('pins')}
                                  className="text-[11px] font-medium text-blue-600 hover:text-blue-700 flex items-center gap-0.5 px-2 py-0.5 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                                >
                                  <span>{isExpanded ? '收起' : `展开更多 (${MOCK_EDIT_CARD_PINS.length})`}</span>
                                  <MaterialIcon name={isExpanded ? 'expand_less' : 'expand_more'} size={14} />
                                </button>
                              )}
                            </div>

                            <div className="flex flex-col gap-2">
                              {displayPins.map((item, idx) => {
                                const isPinUnlocked = !!editShowCodesPlain[item.id];
                                return (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between gap-3 bg-white px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors shadow-2xs"
                                  >
                                    {/* 序号与标识 */}
                                    <div className="flex items-center gap-2.5 shrink-0">
                                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono font-bold">
                                        #{idx + 1}
                                      </span>
                                      <div className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-medium flex items-center gap-1">
                                        <MaterialIcon name="pin" size={12} />
                                        <span>PIN</span>
                                      </div>
                                    </div>

                                    {/* PIN 纯卡码展示 (默认加密 ••••••，解密显示明文如 324533) */}
                                    <div className="flex-1 min-w-0 flex items-center">
                                      <span className="font-mono text-slate-800 font-semibold text-xs tracking-wider">
                                        {isPinUnlocked ? item.pin : '••••••'}
                                      </span>
                                    </div>

                                    {/* 右侧查看/隐藏按钮 */}
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleEditCode(item.id)}
                                        className="px-2 py-0.5 rounded text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1 cursor-pointer text-[11px] font-medium"
                                      >
                                        <MaterialIcon
                                          name={isPinUnlocked ? 'visibility_off' : 'visibility'}
                                          size={14}
                                        />
                                        <span>{isPinUnlocked ? '隐藏' : '点击查看'}</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* 分类 3: 有效期 (示例 2025-10-19，若有数据才展示，默认展示3条，超过3条支持右上角展开/收起) */}
                      {MOCK_EDIT_CARD_EXPIRIES.length > 0 && (() => {
                        const isExpanded = !!editVouchersExpanded['expiries'];
                        const displayExpiries = isExpanded ? MOCK_EDIT_CARD_EXPIRIES : MOCK_EDIT_CARD_EXPIRIES.slice(0, 3);
                        return (
                          <div className="flex flex-col gap-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80">
                            <div className="flex items-center justify-between text-[11px] font-medium text-slate-700 px-0.5">
                              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                <MaterialIcon name="event" size={15} className="text-purple-600" />
                                <span>有效期（共{MOCK_EDIT_CARD_EXPIRIES.length}条）</span>
                              </div>
                              {MOCK_EDIT_CARD_EXPIRIES.length > 3 && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleVoucherCategory('expiries')}
                                  className="text-[11px] font-medium text-blue-600 hover:text-blue-700 flex items-center gap-0.5 px-2 py-0.5 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                                >
                                  <span>{isExpanded ? '收起' : `展开更多 (${MOCK_EDIT_CARD_EXPIRIES.length})`}</span>
                                  <MaterialIcon name={isExpanded ? 'expand_less' : 'expand_more'} size={14} />
                                </button>
                              )}
                            </div>

                            <div className="flex flex-col gap-2">
                              {displayExpiries.map((item, idx) => {
                                const isExpUnlocked = !!editShowCodesPlain[item.id];
                                return (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between gap-3 bg-white px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors shadow-2xs"
                                  >
                                    {/* 序号与标识 */}
                                    <div className="flex items-center gap-2.5 shrink-0">
                                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono font-bold">
                                        #{idx + 1}
                                      </span>
                                      <div className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200/60 text-[10px] font-medium flex items-center gap-1">
                                        <MaterialIcon name="calendar_today" size={12} />
                                        <span>有效期</span>
                                      </div>
                                    </div>

                                    {/* 有效期展示 (默认加密 ****-**-**，解密显示明文如 2025-10-19) */}
                                    <div className="flex-1 min-w-0 flex items-center">
                                      <span className="font-mono text-slate-800 font-semibold text-xs tracking-wider">
                                        {isExpUnlocked ? item.expiryDate : '****-**-**'}
                                      </span>
                                    </div>

                                    {/* 右侧查看/隐藏按钮 */}
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleEditCode(item.id)}
                                        className="px-2 py-0.5 rounded text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1 cursor-pointer text-[11px] font-medium"
                                      >
                                        <MaterialIcon
                                          name={isExpUnlocked ? 'visibility_off' : 'visibility'}
                                          size={14}
                                        />
                                        <span>{isExpUnlocked ? '隐藏' : '点击查看'}</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* 分类 4: 收据凭证 (纯图片，若有数据才展示，默认展示3条，超过3条支持右上角展开/收起) */}
                      {MOCK_EDIT_CARD_RECEIPTS.length > 0 && (() => {
                        const isExpanded = !!editVouchersExpanded['receipts'];
                        const displayReceipts = isExpanded ? MOCK_EDIT_CARD_RECEIPTS : MOCK_EDIT_CARD_RECEIPTS.slice(0, 3);
                        return (
                          <div className="flex flex-col gap-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80">
                            <div className="flex items-center justify-between text-[11px] font-medium text-slate-700 px-0.5">
                              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                <MaterialIcon name="receipt_long" size={15} className="text-teal-600" />
                                <span>收据凭证（共{MOCK_EDIT_CARD_RECEIPTS.length}张）</span>
                              </div>
                              {MOCK_EDIT_CARD_RECEIPTS.length > 3 && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleVoucherCategory('receipts')}
                                  className="text-[11px] font-medium text-blue-600 hover:text-blue-700 flex items-center gap-0.5 px-2 py-0.5 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                                >
                                  <span>{isExpanded ? '收起' : `展开更多 (${MOCK_EDIT_CARD_RECEIPTS.length})`}</span>
                                  <MaterialIcon name={isExpanded ? 'expand_less' : 'expand_more'} size={14} />
                                </button>
                              )}
                            </div>

                            <div className="flex flex-col gap-2">
                              {displayReceipts.map((item, idx) => {
                                const isReceiptUnlocked = !!editShowCodesPlain[item.id];
                                return (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between gap-3 bg-white px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors shadow-2xs"
                                  >
                                    {/* 序号与纯图片缩略图 */}
                                    <div className="flex items-center gap-2.5 shrink-0">
                                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono font-bold">
                                        #{idx + 1}
                                      </span>

                                      <div
                                        className="group relative w-11 h-7 rounded-md overflow-hidden bg-slate-900 border border-slate-200 shrink-0 cursor-pointer flex items-center justify-center shadow-2xs"
                                        onClick={() => setPreviewImageModal({ url: item.imageUrl, title: `收据凭证 #${idx + 1}` })}
                                        title="点击查看原图"
                                      >
                                        <img
                                          src={item.imageUrl}
                                          alt={item.name}
                                          className={`w-full h-full object-cover transition-all duration-150 scale-105 group-hover:scale-100 ${
                                            isReceiptUnlocked ? 'filter-none' : 'filter blur-[2px] group-hover:blur-none'
                                          }`}
                                        />
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                                          <MaterialIcon name="visibility" size={13} className="text-white drop-shadow-xs" />
                                        </div>
                                      </div>
                                    </div>

                                    {/* 收据名称/描述 */}
                                    <div className="flex-1 min-w-0 flex items-center">
                                      <span className="text-slate-800 font-medium text-xs truncate">
                                        {item.name}
                                      </span>
                                    </div>

                                    {/* 右侧查看原图按钮 */}
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => setPreviewImageModal({ url: item.imageUrl, title: `收据凭证 #${idx + 1}` })}
                                        className="px-2 py-0.5 rounded text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1 cursor-pointer text-[11px] font-medium"
                                      >
                                        <MaterialIcon name="visibility" size={14} />
                                        <span>查看大图</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* 模块三：修改卡单报价 (收卡报价支持修改，用户成交报价联动自动计算，奈拉向上取整) */}
                <div className="flex flex-col gap-3.5 bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <MaterialIcon name="payments" size={16} className="text-emerald-600" />
                      <span>模块三：修改卡单报价</span>
                    </span>
                    <span className="text-[11px] text-slate-400">调整收卡报价，系统联动自动核算用户成交报价</span>
                  </div>

                  {/* 原单报价数据展示 (方案 A：顶部基准参考条) */}
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50/90 rounded-lg border border-slate-200 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium shrink-0">
                      <MaterialIcon name="info" size={15} className="text-blue-500" />
                      <span>原单报价参考：</span>
                    </div>
                    <div className="flex items-center gap-4 font-mono text-xs flex-wrap justify-end">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">原收卡报价:</span>
                        <strong className="text-blue-700 font-semibold">
                          {cardActionModal.task.merchantQuote ? cardActionModal.task.merchantQuote.replace('￥', '') : '7.9200'}
                        </strong>
                      </div>
                      <span className="text-slate-300">|</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">原用户成交报价:</span>
                        <strong className="text-emerald-700 font-semibold">
                          {cardActionModal.task.userDealQuote || '￥7.5240/₦1505'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* 1. 收卡报价 (输入框调小，提示文案在输入框后面，最大值 20，最多 4 位小数) */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 flex items-center justify-end">
                      <span className="text-rose-500 font-bold mr-1">*</span>
                      <span>收卡报价</span>
                    </div>
                    <div className="flex-1 flex items-center gap-2.5 flex-wrap">
                      <div className="relative w-44 shrink-0">
                        <input
                          type="number"
                          step="0.0001"
                          max={20}
                          min={0.0001}
                          value={editPurchaseRate}
                          onChange={e => handleEditPurchaseRateChange(e.target.value)}
                          placeholder="例如 7.3500"
                          className={`w-full p-2 pr-6 bg-white border rounded-lg text-xs font-mono focus:outline-none transition-all ${
                            editPurchaseRateError
                              ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-100'
                              : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                          }`}
                        />
                      </div>
                      <span className="text-[11px] text-slate-400">
                        最大值为 20，支持录入到小数点后四位
                      </span>
                      {editPurchaseRateError && (
                        <span className="text-[11px] text-rose-500 font-medium flex items-center gap-0.5">
                          <MaterialIcon name="error" size={13} />
                          {editPurchaseRateError}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 2. 用户成交报价 (联动自动计算: 联动自动计算，奈拉向上取整) */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 flex items-center justify-end">
                      <span>用户成交报价</span>
                    </div>
                    <div className="flex-1 flex items-center gap-2.5 flex-wrap">
                      <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg font-mono font-bold text-xs text-emerald-800 shadow-2xs flex items-center gap-1.5">
                        <MaterialIcon name="calculate" size={14} className="text-emerald-600" />
                        <span>{calculatedUserDealQuote.formatted}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        联动自动计算，奈拉向上取整
                      </span>
                    </div>
                  </div>
                </div>

                {/* 模块四：备注及举证图 */}
                <div className="flex flex-col gap-3.5 bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <MaterialIcon name="note_alt" size={16} className="text-purple-600" />
                      <span>模块四：备注及举证图</span>
                    </span>
                      <span className="text-[11px] text-slate-400">若卡单信息或报价发生修改，备注内容与举证图二选一必填</span>
                    </div>
                    {/* 备注 (移除示例及第二条，仅保留非必填英文提示) */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 pt-2">
                        备注
                      </div>
                      <div className="flex-1 flex flex-col gap-1.5">
                        <div className="relative">
                          <textarea
                            rows={3}
                            value={editCardNote}
                            onChange={e => handleEditNoteChange(e.target.value)}
                            placeholder=""
                            maxLength={1000}
                            className={`w-full p-2.5 bg-white border rounded-lg text-xs placeholder:text-slate-400 focus:outline-none transition-all leading-relaxed ${
                              editCardNoteError
                                ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-100'
                                : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                            }`}
                          />
                        </div>
                        <div className="text-[11px] text-slate-400">
                          <strong className="font-semibold text-slate-700">非必填，用户端展示</strong>，请用英文描述，不支持输入汉字
                        </div>
                        {editCardNoteError && (
                          <span className="text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                            <MaterialIcon name="error" size={13} />
                            {editCardNoteError}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 举证图 */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 pt-2">
                        举证图
                      </div>
                      <div className="flex-1 flex flex-col gap-1.5">
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleEditCardDrop}
                          onPaste={handleEditCardPaste}
                          tabIndex={0}
                          className="flex items-center gap-2.5 flex-wrap focus:outline-none"
                        >
                          {editCardImages.map((img, idx) => (
                            <div
                              key={img.id}
                              className="group relative w-13 h-13 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 shadow-2xs hover:shadow-md transition-all flex items-center justify-center shrink-0"
                            >
                              <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                              <span className="absolute top-0.5 left-0.5 bg-black/60 text-white text-[8px] font-mono px-1 rounded leading-none">
                                #{idx + 1}
                              </span>
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setPreviewImageModal({ url: img.dataUrl, title: `举证图 #${idx + 1}` })}
                                  className="w-5 h-5 rounded-full bg-white text-slate-700 flex items-center justify-center cursor-pointer"
                                  title="查看大图"
                                >
                                  <MaterialIcon name="zoom_in" size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleEditCardRemoveImage(img.id)}
                                  className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center cursor-pointer"
                                  title="删除图片"
                                >
                                  <MaterialIcon name="delete" size={13} />
                                </button>
                              </div>
                            </div>
                          ))}

                          {editCardImages.length < 12 && (
                            <label className="w-13 h-13 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center text-center cursor-pointer select-none group shrink-0">
                              <input
                                ref={editCardFileInputRef}
                                type="file"
                                multiple
                                accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                                className="hidden"
                                onChange={handleEditCardFileInputChange}
                              />
                              <MaterialIcon name="upload" size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                              <span className="text-[9px] text-slate-500 group-hover:text-blue-600 transition-colors mt-0.5">
                                上传图片
                              </span>
                            </label>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          <strong className="font-semibold text-slate-700">用户端展示</strong>，请上传 格式为 <strong className="text-slate-600 font-medium">png/jpg/jpeg</strong> 的文件 【请将图片 <span className="text-blue-600 font-medium">拖拽</span> / <span className="text-blue-600 font-medium">粘贴</span> 在此处上传】
                        </div>
                        {editCardImageError && (
                          <span className="text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                            <MaterialIcon name="error" size={13} />
                            {editCardImageError}
                          </span>
                        )}
                        {editCardGeneralError && (
                          <div className="text-[11px] text-rose-600 font-medium bg-rose-50 p-2 rounded-lg border border-rose-200 flex items-center gap-1.5 mt-1">
                            <MaterialIcon name="warning" size={15} className="shrink-0 text-rose-500" />
                            <span>{editCardGeneralError}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* 步骤 2: 提交保存后，显示修改对比项，有修改的要高亮显示，最终确认提交生效 */
                (() => {
                  const origTask = cardActionModal.task;
                  const origMediaType = origTask.mediaTypeLabel || (origTask.cardDetails?.imageReflections ? '卡图' : '电子码');
                  const origSpeed = origTask.speedTag || '快卡';
                  const origRateNum = origTask.merchantQuote ? parseFloat(origTask.merchantQuote.replace(/[^\d.]/g, '')) : 7.92;
                  const origPurchaseRateStr = origTask.merchantQuote ? origTask.merchantQuote.replace('￥', '') : '7.9200';
                  const origDealQuote = origTask.userDealQuote || '￥7.5240/₦1505';

                  const parsedFaceValue = parseFloat(editFaceValue) || origTask.faceValue;
                  const parsedQuantity = parseInt(editQuantity, 10) || (origTask.cardQuantity || 1);
                  const parsedPurchaseRate = parseFloat(editPurchaseRate) || origRateNum;

                  const origCountryObj = EDIT_COUNTRY_OPTIONS.find(c => c.code === origTask.country);
                  const newCountryObj = EDIT_COUNTRY_OPTIONS.find(c => c.code === editCountry);

                  const isDealQuoteChanged = origDealQuote !== calculatedUserDealQuote.formatted;
                  const isPurchaseRateChanged = Math.abs(origRateNum - parsedPurchaseRate) > 0.00001;
                  const isQuoteChanged = isDealQuoteChanged || isPurchaseRateChanged;

                  const diffItems: Array<{
                    key: string;
                    label: string;
                    oldValue: React.ReactNode;
                    newValue: React.ReactNode;
                    isChanged: boolean;
                  }> = [
                    {
                      key: 'cardType',
                      label: '卡类型 Card Type',
                      oldValue: origTask.cardType,
                      newValue: editCardType,
                      isChanged: origTask.cardType !== editCardType,
                    },
                    {
                      key: 'country',
                      label: '国家 Country',
                      oldValue: `${origCountryObj?.flag || ''} ${origCountryObj?.name || origTask.country} (${origTask.country})`,
                      newValue: `${newCountryObj?.flag || ''} ${newCountryObj?.name || editCountry} (${editCountry})`,
                      isChanged: origTask.country !== editCountry,
                    },
                    {
                      key: 'mediaType',
                      label: '介质类型 Type',
                      oldValue: origMediaType,
                      newValue: editMediaType,
                      isChanged: origMediaType !== editMediaType,
                    },
                    {
                      key: 'speed',
                      label: '交易速度 Speed',
                      oldValue: origSpeed,
                      newValue: editSpeed,
                      isChanged: origSpeed !== editSpeed,
                    },
                    {
                      key: 'faceValue',
                      label: '卡面值 Balance',
                      oldValue: `${origTask.faceValue}`,
                      newValue: `${parsedFaceValue}`,
                      isChanged: origTask.faceValue !== parsedFaceValue,
                    },
                    {
                      key: 'quantity',
                      label: '卡数量 Quantity',
                      oldValue: `${origTask.cardQuantity || 1} 张`,
                      newValue: `${parsedQuantity} 张`,
                      isChanged: (origTask.cardQuantity || 1) !== parsedQuantity,
                    },
                    {
                      key: 'quote',
                      label: '卡单报价 Quote',
                      oldValue: (
                        <div className="flex flex-col gap-0.5 font-mono text-[11px]">
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <span className="text-slate-400 font-sans text-[10px]">用户成交:</span>
                            <span className="text-emerald-700 font-semibold">{origDealQuote}</span>
                          </div>
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <span className="text-slate-400 font-sans text-[10px]">收卡报价:</span>
                            <span className="text-blue-700 font-semibold">￥{origPurchaseRateStr}</span>
                          </div>
                        </div>
                      ),
                      newValue: (
                        <div className="flex flex-col gap-0.5 font-mono text-[11px]">
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <span className="text-slate-400 font-sans text-[10px]">用户成交:</span>
                            {isDealQuoteChanged ? (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-white border border-amber-300 text-amber-900 font-bold shadow-2xs">
                                {calculatedUserDealQuote.formatted}
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-semibold">{calculatedUserDealQuote.formatted}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <span className="text-slate-400 font-sans text-[10px]">收卡报价:</span>
                            {isPurchaseRateChanged ? (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-white border border-amber-300 text-amber-900 font-bold shadow-2xs">
                                ￥{parsedPurchaseRate.toFixed(4)}
                              </span>
                            ) : (
                              <span className="text-blue-700 font-semibold">￥{parsedPurchaseRate.toFixed(4)}</span>
                            )}
                          </div>
                        </div>
                      ),
                      isChanged: isQuoteChanged,
                    },
                  ];

                  const changedCount = diffItems.filter(item => item.isChanged).length;

                  return (
                    <div className="p-6 flex-1 min-h-0 max-h-[calc(90vh-130px)] flex flex-col gap-4 text-xs overflow-y-auto overscroll-contain pr-3">
                      {/* 步骤条提示 */}
                      <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">✓</span>
                          <span className="text-slate-500 font-medium text-xs">第一步：卡信息修改</span>
                        </div>
                        <MaterialIcon name="arrow_forward" size={16} className="text-slate-400" />
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">2</span>
                          <span className="text-blue-900 font-bold text-xs">第二步：核对修改对比项 (有变更已高亮)</span>
                        </div>
                      </div>

                      {/* 修改前后对比表格 (平铺展开，无局部纵向限制，整体顺畅滚动) */}
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
                          <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                            <MaterialIcon name="compare_arrows" size={16} className="text-blue-600" />
                            <span>修改对比表</span>
                          </span>
                          <span className="text-[11px] text-slate-400">
                            变更项: <strong className="font-mono text-amber-700">{changedCount}</strong> / {diffItems.length}
                          </span>
                        </div>

                        <div className="w-full">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 shadow-2xs">
                              <tr className="text-slate-500 font-semibold text-[11px]">
                                <th className="py-2 px-3.5 w-36">规格参数</th>
                                <th className="py-2 px-3.5">修改前 (原单数据)</th>
                                <th className="py-2 px-3.5 w-6 text-center"></th>
                                <th className="py-2 px-3.5">修改后 (变更数据)</th>
                                <th className="py-2 px-3.5 w-24 text-center">状态</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {diffItems.map(item => (
                                <tr
                                  key={item.key}
                                  className={`transition-colors ${
                                    item.isChanged
                                      ? 'bg-amber-50/70 border-l-4 border-l-amber-500 font-medium'
                                      : 'hover:bg-slate-50/50'
                                  }`}
                                >
                                  <td className="py-2 px-3.5">
                                    <span className={item.isChanged ? 'text-amber-950 font-bold' : 'text-slate-700'}>
                                      {item.label}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3.5">
                                    {item.key === 'quote' ? (
                                      item.oldValue
                                    ) : (
                                      <span className="text-slate-500 font-mono">{item.oldValue}</span>
                                    )}
                                  </td>
                                  <td className="py-2 px-3.5 text-center text-slate-300">
                                    <MaterialIcon
                                      name="arrow_forward"
                                      size={14}
                                      className={item.isChanged ? 'text-amber-600' : 'text-slate-300'}
                                    />
                                  </td>
                                  <td className="py-2 px-3.5">
                                    {item.key === 'quote' ? (
                                      item.newValue
                                    ) : item.isChanged ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-amber-300 text-amber-900 font-bold font-mono shadow-2xs">
                                        {item.newValue}
                                      </span>
                                    ) : (
                                      <span className="text-slate-600 font-mono">{item.newValue}</span>
                                    )}
                                  </td>
                                  <td className="py-2 px-3.5 text-center">
                                    {item.isChanged ? (
                                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold shadow-2xs">
                                        <MaterialIcon name="sync_alt" size={11} />
                                        <span>已修改</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[10px]">
                                        未变更
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* 备注与举证图预览 (若有) */}
                      {(editCardNote.trim() || editCardImages.length > 0) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {/* 备注预览 */}
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-1.5">
                            <span className="font-bold text-slate-700 text-xs flex items-center gap-1">
                              <MaterialIcon name="notes" size={14} className="text-blue-600" />
                              <span>用户端英文备注预览：</span>
                            </span>
                            <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800 text-xs font-mono leading-relaxed min-h-[50px]">
                              {editCardNote.trim() || <span className="text-slate-400 italic">未填写英文备注</span>}
                            </div>
                          </div>

                          {/* 举证图预览 */}
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-1.5">
                            <span className="font-bold text-slate-700 text-xs flex items-center gap-1">
                              <MaterialIcon name="image" size={14} className="text-blue-600" />
                              <span>本次上传举证图 ({editCardImages.length} 张)：</span>
                            </span>
                            {editCardImages.length > 0 ? (
                              <div className="flex items-center gap-2 flex-wrap min-h-[50px]">
                                {editCardImages.map((img, idx) => (
                                  <div
                                    key={img.id}
                                    className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden relative group cursor-pointer"
                                    onClick={() => setPreviewImageModal({ url: img.dataUrl, title: `举证图 #${idx + 1}` })}
                                  >
                                    <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                                    <span className="absolute top-0.5 left-0.5 bg-black/60 text-white text-[8px] font-mono px-0.5 rounded">
                                      #{idx + 1}
                                    </span>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <MaterialIcon name="zoom_in" size={14} className="text-white" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-400 italic text-xs min-h-[50px] flex items-center">
                                未上传举证图
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              )
            ) : cardActionModal.type === 'recall' ? (
              /* 撤回卡单弹窗 */
              <div className="p-6 flex flex-col gap-4 text-xs">
                {/* 1. 卡信息 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 pt-1.5">
                    卡信息
                  </div>
                  <div className="flex-1 bg-slate-50/90 rounded-xl p-3 border border-slate-200/90 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <CardBrandLogo card={{ brandName: cardActionModal.task.cardType, iconType: cardActionModal.task.cardTypeIcon }} size="xs" />
                        <span className="font-bold text-slate-800 text-xs truncate">
                          {cardActionModal.task.cardFullName || cardActionModal.task.cardType}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs shrink-0">
                        面值: {cardActionModal.task.faceValue}  数量: {cardActionModal.task.cardQuantity || 1}张
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium leading-none whitespace-nowrap">
                        {cardActionModal.task.country}{cardActionModal.task.countryName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 font-medium leading-none whitespace-nowrap">
                        {cardActionModal.task.mediaTypeLabel || (cardActionModal.task.cardDetails?.imageReflections ? '卡图' : '电子码')}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium leading-none whitespace-nowrap">
                        {cardActionModal.task.speedTag || '快卡'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. 当前收卡商户 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 pt-1.5">
                    当前收卡商户
                  </div>
                  <div className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-1.5 font-sans">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">
                        {cardActionModal.task.currentMerchant?.name || '招财进宝'}
                      </span>
                      {cardActionModal.task.currentMerchant?.rate && (
                        <span className="text-[11px] text-slate-500 font-mono">履约率 {cardActionModal.task.currentMerchant.rate}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono border-t border-slate-200/70 pt-1.5">
                      <span>卡单处理人: <strong className="text-slate-800 font-sans">青青(123442@163.com)</strong></span>
                    </div>
                  </div>
                </div>

                {/* 3. 撤回原因 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 pt-2 flex items-center justify-end gap-0.5">
                    <span className="text-rose-500 font-bold">*</span>
                    <span>撤回原因</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="relative">
                      <textarea
                        value={recallReasonInput}
                        onChange={e => {
                          if (e.target.value.length <= 500) {
                            setRecallReasonInput(e.target.value);
                            if (e.target.value.trim()) setRecallReasonError(null);
                          }
                        }}
                        rows={4}
                        placeholder="请输入撤回卡单的具体原因（必填，最多500字）..."
                        className={`w-full p-3 bg-white border rounded-xl text-xs text-slate-800 focus:outline-none transition-all placeholder:text-slate-400 font-sans leading-relaxed resize-none ${
                          recallReasonError
                            ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-100'
                            : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                        }`}
                      ></textarea>
                      <span className="absolute bottom-2.5 right-3 text-[10px] font-mono text-slate-400 bg-white/80 px-1 py-0.5 rounded">
                        {recallReasonInput.length}/500
                      </span>
                    </div>
                    {recallReasonError && (
                      <span className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                        <MaterialIcon name="error" size={13} />
                        <span>{recallReasonError}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : cardActionModal.type === 'resolveAnomaly' ? (
              /* 解除商户异常确认弹窗 (方案A) */
              <div className="p-6 flex flex-col gap-4 text-xs">
                <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-xl p-3.5 text-emerald-950 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <MaterialIcon name="verified" size={20} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-xs text-emerald-900">确认解除该卡单的商户异常状态？</span>
                    <span className="text-[11px] text-emerald-800 leading-relaxed">
                      解除商户异常后，系统将自动把该卡单状态恢复为【待商户处理】，商户端可继续验卡和处理。
                    </span>
                  </div>
                </div>

                {/* 卡单核实信息卡片 */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>卡单号:</span>
                    <span className="font-mono font-bold text-blue-600">{cardActionModal.task.id}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>卡种信息:</span>
                    <span className="font-semibold text-slate-800">{cardActionModal.task.cardFullName || cardActionModal.task.cardType}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>面值与数量:</span>
                    <span className="font-semibold text-slate-800 font-mono">面值: {cardActionModal.task.faceValue}  数量: {cardActionModal.task.cardQuantity || 1}张</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>提报商户:</span>
                    <span className="font-semibold text-slate-800">{cardActionModal.task.currentMerchant?.name || '未知商户'}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>异常反馈:</span>
                    <span className="font-semibold text-rose-600">{cardActionModal.task.cardCheckResult?.label || '商户提报异常'}</span>
                  </div>
                </div>
              </div>
            ) : cardActionModal.type === 'manualDelay' ? (
              /* 手动延迟弹窗 */
              <div className="p-6 flex flex-col gap-4 text-xs">
                {/* 1. 卡信息 (同撤回卡单) */}
                <div className="flex items-start gap-3.5">
                  <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 pt-1.5">
                    卡信息
                  </div>
                  <div className="flex-1 bg-slate-50/90 rounded-xl p-3 border border-slate-200/90 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <CardBrandLogo card={{ brandName: cardActionModal.task.cardType, iconType: cardActionModal.task.cardTypeIcon }} size="xs" />
                        <span className="font-bold text-slate-800 text-xs truncate">
                          {cardActionModal.task.cardFullName || cardActionModal.task.cardType}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs shrink-0">
                        面值: {cardActionModal.task.faceValue}  数量: {cardActionModal.task.cardQuantity || 1}张
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium leading-none whitespace-nowrap">
                        {cardActionModal.task.country}{cardActionModal.task.countryName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 font-medium leading-none whitespace-nowrap">
                        {cardActionModal.task.mediaTypeLabel || (cardActionModal.task.cardDetails?.imageReflections ? '卡图' : '电子码')}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium leading-none whitespace-nowrap">
                        {cardActionModal.task.speedTag || '快卡'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. 当前收卡商户 (同撤回卡单) */}
                <div className="flex items-start gap-3.5">
                  <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 pt-1.5">
                    当前收卡商户
                  </div>
                  <div className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-1.5 font-sans">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">
                        {cardActionModal.task.currentMerchant?.name || '招财进宝'}
                      </span>
                      {cardActionModal.task.currentMerchant?.rate && (
                        <span className="text-[11px] text-slate-500 font-mono">履约率 {cardActionModal.task.currentMerchant.rate}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono border-t border-slate-200/70 pt-1.5">
                      <span>卡单处理人: <strong className="text-slate-800 font-sans">青青(123442@163.com)</strong></span>
                      <span>接卡时间: <strong className="text-slate-800 font-mono">{cardActionModal.task.currentMerchant?.claimTime || '2026-10-12 14:25:30'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* 3. 设置延时 */}
                {/* 3.1 卡单剩余处理时长 */}
                <div className="flex items-center gap-3.5">
                  <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600">
                    剩余处理时长
                  </div>
                  <div className="flex-1 px-3.5 py-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-center justify-between font-mono">
                    <span className="text-xs text-amber-900 font-medium">当前 SLA 剩余倒计时：</span>
                    <span className="font-bold text-amber-700 text-sm">
                      {formatSeconds(cardActionModal.task.slaRemainingSeconds || 0)}
                    </span>
                  </div>
                </div>

                {/* 3.2 延时时长 (不设上限) */}
                <div className="flex items-center gap-3.5">
                  <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 flex items-center justify-end gap-0.5">
                    <span className="text-rose-500 font-bold">*</span>
                    <span>延时时长</span>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="请输入延时分钟数（不设上限）"
                      value={manualDelayMinutesInput}
                      onChange={e => {
                        setManualDelayMinutesInput(e.target.value);
                        setManualDelayError(null);
                      }}
                      className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-200 font-mono font-bold"
                    />
                    <span className="text-xs text-slate-600 font-medium shrink-0 pr-1">分钟</span>
                  </div>
                </div>

                {/* 3.3 原因描述 (最多500字，仅支持英文，且用户端展示) */}
                <div className="flex items-start gap-3.5">
                  <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 pt-2 flex items-center justify-end gap-0.5">
                    <span className="text-rose-500 font-bold">*</span>
                    <span>原因描述</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="relative">
                      <textarea
                        value={manualDelayReasonInput}
                        onChange={e => {
                          if (e.target.value.length <= 500) {
                            setManualDelayReasonInput(e.target.value);
                            if (e.target.value.trim()) setManualDelayError(null);
                          }
                        }}
                        rows={4}
                        placeholder="请输入..."
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-200 resize-none leading-relaxed font-sans"
                      />
                      <span className="absolute bottom-2.5 right-3 text-[10px] font-mono text-slate-400 bg-white/80 px-1.5 py-0.5 rounded">
                        {manualDelayReasonInput.length}/500
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span><strong className="font-semibold text-slate-700">必填，用户端展示。</strong> 仅支持输入英文 (English only)</span>
                    </div>
                  </div>
                </div>

                {/* 3.4 举证图 (非必填项) */}
                <div className="flex items-start gap-3.5">
                  <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 pt-2">
                    举证图
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {manualDelayImages.map((img, idx) => (
                        <div
                          key={img.id}
                          className="group relative w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-2xs hover:shadow-md transition-all flex items-center justify-center shrink-0"
                        >
                          <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                          <span className="absolute top-0.5 left-0.5 bg-black/60 text-white text-[8px] font-mono px-1 rounded leading-none">
                            #{idx + 1}
                          </span>
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => setPreviewImageModal({ url: img.dataUrl, title: `凭证图 #${idx + 1}` })}
                              className="w-5 h-5 rounded-full bg-white text-slate-700 flex items-center justify-center cursor-pointer"
                              title="查看大图"
                            >
                              <MaterialIcon name="zoom_in" size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleManualDelayRemoveImage(img.id)}
                              className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center cursor-pointer"
                              title="删除图片"
                            >
                              <MaterialIcon name="delete" size={13} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {manualDelayImages.length < 12 && (
                        <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50/70 hover:bg-amber-50/40 transition-all flex flex-col items-center justify-center text-center cursor-pointer select-none group shrink-0">
                          <input
                            ref={manualDelayFileInputRef}
                            type="file"
                            multiple
                            accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                            className="hidden"
                            onChange={handleManualDelayFileInputChange}
                          />
                          <MaterialIcon name="upload" size={18} className="text-slate-400 group-hover:text-amber-600 transition-colors" />
                          <span className="text-[10px] text-slate-500 group-hover:text-amber-600 transition-colors mt-0.5">
                            上传图片
                          </span>
                        </label>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      非必填项，最多上传 12 张凭证图（支持 png / jpg / jpeg 格式）
                    </span>
                    {manualDelayImageError && (
                      <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                        <MaterialIcon name="error" size={13} />
                        {manualDelayImageError}
                      </span>
                    )}
                  </div>
                </div>

                {manualDelayError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-1.5">
                    <MaterialIcon name="error" size={16} />
                    <span>{manualDelayError}</span>
                  </div>
                )}
              </div>
            ) : (
              /* 其他 1 类预留为空的占位区域 */
              <div className="p-6 flex flex-col gap-4 text-xs">
                {/* 预留为空的占位区域 */}
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/50">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[24px]">
                      {(CARD_ACTION_MODAL_CONFIG as Record<string, any>)[(cardActionModal as any).type]?.icon || 'help'}
                    </span>
                  </div>
                  <span className="font-bold text-slate-700 text-sm">
                    【{(CARD_ACTION_MODAL_CONFIG as Record<string, any>)[(cardActionModal as any).type]?.title || '弹窗'}】内容
                  </span>
                  <p className="text-slate-400 text-xs mt-1.5 max-w-xs leading-relaxed">
                    弹窗内容暂时预留为空，待后续业务流程与字段明确后接入相应表单及交互。
                  </p>
                </div>
              </div>
            )}

            {/* 弹窗 Footer */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
              {cardActionModal.type === 'recall' ? (
                <>
                  <button
                    type="button"
                    onClick={handleCloseCardActionModal}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCardAction}
                    className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <MaterialIcon name="undo" size={15} />
                    <span>确认撤回卡单</span>
                  </button>
                </>
              ) : cardActionModal.type === 'resolveAnomaly' ? (
                <>
                  <button
                    type="button"
                    onClick={handleCloseCardActionModal}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCardAction}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <MaterialIcon name="check" size={15} />
                    <span>确认解除异常</span>
                  </button>
                </>
              ) : cardActionModal.type === 'manualDelay' ? (
                <>
                  <button
                    type="button"
                    onClick={handleCloseCardActionModal}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCardAction}
                    className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <MaterialIcon name="more_time" size={15} />
                    <span>确认顺延时限</span>
                  </button>
                </>
              ) : cardActionModal.type === 'directProcess' ? (
                directProcessStep === 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCloseCardActionModal}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={handleDirectProcessNextStep}
                      className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <span>下一步</span>
                      <MaterialIcon name="arrow_forward" size={15} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleDirectProcessPrevStep}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <MaterialIcon name="arrow_back" size={14} />
                      <span>上一步</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseCardActionModal}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmCardAction}
                      className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                    >
                      确认提交
                    </button>
                  </>
                )
              ) : cardActionModal.type === 'splitOrder' ? (
                splitOrderStep === 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCloseCardActionModal}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={handleSplitOrderProceedToReview}
                      className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <span>保存拆单并核对</span>
                      <MaterialIcon name="arrow_forward" size={15} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setSplitOrderStep(1)}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <MaterialIcon name="arrow_back" size={14} />
                      <span>上一步</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseCardActionModal}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmCardAction}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <MaterialIcon name="check" size={15} />
                      <span>确认提交拆单生效</span>
                    </button>
                  </>
                )
              ) : cardActionModal.type === 'editCard' ? (
                editCardStep === 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCloseCardActionModal}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={handleEditCardProceedToReview}
                      className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <span>保存修改并核对</span>
                      <MaterialIcon name="arrow_forward" size={15} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditCardStep(1)}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <MaterialIcon name="arrow_back" size={14} />
                      <span>上一步</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseCardActionModal}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmCardAction}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <MaterialIcon name="check" size={15} />
                      <span>确认提交生效</span>
                    </button>
                  </>
                )
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCloseCardActionModal}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCardAction}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                  >
                    {cardActionModal.type === 'dispatch'
                      ? '确认派单'
                      : cardActionModal.type === 'transfer' || cardActionModal.type === 'syncUser'
                      ? '确认提交'
                      : '确定'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 举证图全屏大图预览灯箱 */}
      {previewImageModal && (
        <div
          className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewImageModal(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700 text-white shrink-0">
              <span className="text-xs font-semibold truncate max-w-md">{previewImageModal.title}</span>
              <button
                type="button"
                onClick={() => setPreviewImageModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
                title="关闭预览"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-4 flex items-center justify-center overflow-auto max-h-[calc(90vh-60px)] bg-black/40">
              <img
                src={previewImageModal.url}
                alt={previewImageModal.title}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-lg select-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 实时会话小悬浮窗口 (IM Floating Window: 支持用户/商户/处理人实时对话与最小化) */}
      {/* ============================================================================ */}
      {activeChatSession && isChatMinimized && (
        <div
          onClick={() => setIsChatMinimized(false)}
          className="fixed bottom-5 right-5 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl rounded-full px-4 py-2.5 flex items-center gap-2.5 cursor-pointer hover:scale-105 active:scale-95 transition-all border border-white/20 select-none animate-in fade-in slide-in-from-bottom-2"
          title="点击展开实时会话窗口"
        >
          <div className="relative flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">forum</span>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span>{activeChatSession.targetName}</span>
            <span className="text-[10px] text-blue-100 font-mono">({activeChatSession.taskId})</span>
          </div>
          <span className="material-symbols-outlined text-[16px] text-blue-200 hover:text-white">open_in_full</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveChatSession(null);
            }}
            className="w-5 h-5 rounded-full hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer ml-1"
            title="关闭会话"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      )}

      {activeChatSession && !isChatMinimized && (
        <div className="fixed bottom-5 right-5 z-50 w-[380px] h-[520px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* 窗口头部 */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 text-white px-3.5 py-2.5 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                activeChatSession.type === 'user' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                activeChatSession.type === 'merchant' ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' :
                'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
              }`}>
                <span className="material-symbols-outlined text-[18px]">
                  {activeChatSession.type === 'user' ? 'person' : activeChatSession.type === 'merchant' ? 'storefront' : 'badge'}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs truncate max-w-[170px]" title={activeChatSession.targetName}>
                    {activeChatSession.targetName}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="在线" />
                </div>
                <span className="text-[10px] text-slate-300 font-mono truncate">
                  {activeChatSession.targetSub}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsChatMinimized(true)}
                className="w-7 h-7 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="最小化到右下角"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveChatSession(null)}
                className="w-7 h-7 rounded-lg hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                title="关闭会话"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>

          {/* 卡单快捷卡片摘要条 */}
          <div className="bg-slate-50 border-b border-slate-200/80 px-3 py-1.5 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-mono font-bold leading-none">卡单</span>
              <span className="font-mono font-bold text-blue-600 truncate">{activeChatSession.task.id}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-700 truncate text-[11px] font-medium">{activeChatSession.task.cardFullName || activeChatSession.task.cardType}</span>
            </div>
            <span className="font-mono font-bold text-slate-700 shrink-0 text-[11px] ml-1">
              {activeChatSession.task.faceValue} {activeChatSession.task.currency}
            </span>
          </div>

          {/* 快捷短语一键填入 */}
          <div className="bg-white border-b border-slate-100 px-3 py-1.5 shrink-0 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
            <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">auto_fix_high</span>
              <span>快捷:</span>
            </span>
            {getQuickPhrases(activeChatSession.type).map((phrase, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setChatInputText(phrase)}
                className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 text-[10px] font-medium whitespace-nowrap transition-colors cursor-pointer border border-slate-200/70 shrink-0"
              >
                {phrase.length > 10 ? `${phrase.slice(0, 10)}...` : phrase}
              </button>
            ))}
          </div>

          {/* 实时消息流 */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/60 text-xs">
            {chatMessages.map(msg => {
              if (msg.sender === 'system') {
                return (
                  <div key={msg.id} className="flex justify-center my-1">
                    <span className="bg-slate-200/80 text-slate-600 text-[10px] px-2.5 py-1 rounded-full text-center max-w-[90%] leading-relaxed">
                      {msg.content}
                    </span>
                  </div>
                );
              }

              const isSelf = msg.sender === 'self';
              return (
                <div key={msg.id} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5 px-0.5">
                    <span>{msg.senderName}</span>
                    <span>{msg.time}</span>
                  </div>
                  <div className={`px-3 py-2 rounded-2xl max-w-[85%] leading-relaxed text-xs shadow-2xs ${
                    isSelf
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 底部输入框 */}
          <div className="p-2.5 bg-white border-t border-slate-200 shrink-0 flex items-center gap-2">
            <input
              type="text"
              value={chatInputText}
              onChange={e => setChatInputText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendChatMessage();
                }
              }}
              placeholder="输入沟通消息，按 Enter 发送..."
              className="flex-1 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none transition-all placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={handleSendChatMessage}
              disabled={!chatInputText.trim()}
              className={`px-3 py-1.5 rounded-xl font-medium text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs ${
                chatInputText.trim()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>发送</span>
              <span className="material-symbols-outlined text-[14px]">send</span>
            </button>
          </div>
        </div>
      )}
      <TraceModal 
        isOpen={traceModal?.isOpen ?? false} 
        cardId={traceModal?.cardId ?? ''} 
        cardName={traceModal?.cardName ?? ''} 
        onClose={() => setTraceModal(null)} 
      />
    </div>
  );
};
