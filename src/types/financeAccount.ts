export type MerchantStatus = 'ACTIVE' | 'RESTRICTED' | 'FROZEN';
export type RiskLevel = 'SAFE' | 'WARNING' | 'CRITICAL';
export type MerchantTier = 'TIER-S' | 'TIER-A' | 'TIER-B' | 'TIER-C';

export interface MerchantLedgerItem {
  id: string;
  mid: string;
  name: string;
  tier: MerchantTier;
  tierColor: string;
  manager: string;
  channel: string;
  status: MerchantStatus;
  statusLabel: string;
  totalPoints: number;
  usdEquivalent: number;
  availablePoints: number;
  frozenEscrowPoints: number;
  pendingRecharge: number;
  todayConsumption: number;
  lastUpdateTime: string;
  lastSerialNo: string;
  warningTag?: string;
  warningTagType?: 'warning' | 'error' | 'info';
  riskLevel: RiskLevel;
  contactPhone: string;
  settlementRate: string;
  apiHealth: string;
  inEscrowOrdersCount: number;
}

export type AdjustmentType = 'INCREASE' | 'DECREASE' | 'FREEZE' | 'UNFREEZE';

export interface AdjustmentTicket {
  id: string;
  ticketNo: string;
  targetMid: string;
  targetName: string;
  type: AdjustmentType;
  typeLabel: string;
  deltaAmount: number;
  preAvailable: number;
  postAvailable: number;
  preTotal: number;
  postTotal: number;
  docRef: string;
  reason: string;
  applicant: string;
  approver: string;
  status: 'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED';
  timestamp: string;
  ledgerHash: string;
}
