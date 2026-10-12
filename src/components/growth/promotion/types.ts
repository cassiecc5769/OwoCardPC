export type PromoterStatus = 'active' | 'paused' | 'offline';

export interface PromoterItem {
  id: string; // e.g. "EMP-04128"
  name: string;
  initials: string;
  avatarBg: string;
  title: string;
  tag?: string;
  tagColor?: string;
  inviteCode: string;
  teamId: string;
  teamName: string;
  teamLeader: string;
  status: PromoterStatus;
  statusReason?: string;
  phone: string;
  tier1Count: number;
  tier2Count: number;
  blockedCount: number;
  firstOrderConversion: number; // e.g. 84.2%
  monthlyOrders: number;
  gmv: number;
  estimatedCommission: number;
  joinedDate: string;
  isFlagged?: boolean;
}

export interface TeamItem {
  id: string;
  name: string;
  leader: string;
  membersCount: number;
  activeCount: number;
  tier1Total: number;
  tier2Total: number;
  monthlyGmv: number;
  monthlyOrders: number;
  perCapitaGmv: number;
  estimatedCommission: number;
  conversionRate: number;
  auditStatus: 'PASS' | 'REVIEW' | 'WARNING';
}

export type AttributionTier = 'tier1' | 'tier2' | 'tier3_blocked';

export interface AttributionUserItem {
  id: string;
  uid: string;
  phone: string;
  channel: string;
  promoterId: string;
  promoterName: string;
  inviteCode: string;
  tier: AttributionTier;
  registeredAt: string;
  firstOrderCard: string;
  firstOrderAmount: number;
  firstOrderTime: string;
  totalOrders: number;
  totalGmv: number;
  riskStatus: 'NORMAL' | 'OBSERVE' | 'BLOCKED';
  riskScore: number;
  ipLocation: string;
}

export interface OrderAttributionItem {
  orderId: string;
  orderTime: string;
  cardName: string;
  cardIcon: string;
  faceValue: number;
  settledAmount: number; // in USD
  userUid: string;
  promoterId: string;
  promoterName: string;
  inviteCode: string;
  tier: 'tier1' | 'tier2';
  commissionRate: number; // e.g. 0.04 (4%) or 0.01 (1%)
  estimatedCommission: number;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'DISCREPANCY';
  ipAddress: string;
}

export interface SettlementBatchItem {
  batchNo: string;
  period: string; // e.g. "2024-03 (03.01 - 03.31)"
  promoterCount: number;
  totalGmv: number;
  tier1Commission: number;
  tier2Commission: number;
  totalCommission: number;
  auditStatus: 'PASS' | 'AUDITING' | 'REJECTED';
  transferStatus: 'PENDING_TRANSFER' | 'TRANSFERRED' | 'SETTLED';
  transferredAt?: string;
  transferredBy?: string;
  voucherHash?: string;
  discrepancyCount: number;
}
