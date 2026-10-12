export type RechargeFlowStatus = 'pending' | 'verified' | 'credited' | 'rejected';
export type RechargeCurrency = 'USDT' | 'USD' | 'NGN' | 'CNY';
export type RechargeProofType = 'blockchain' | 'swift' | 'bank_slip' | 'fake_alert';

export interface RechargeAuditRecord {
  id: string;
  orderNo: string;
  createTime: string;
  countdown?: string;
  elapsedTime?: string;
  merchantName: string;
  tier: string;
  tierColor?: string;
  mid: string;
  amount: number;
  currency: RechargeCurrency;
  currencySub: string;
  pointsCredited: number;
  exchangeRate: number;
  payMethod: string;
  payMethodType: 'usdt' | 'bank' | 'local';
  receivingAccount: string;
  proofType: RechargeProofType;
  proofRef: string;
  proofStatus: string;
  proofUrl?: string;
  status: RechargeFlowStatus;
  statusLabel: string;
  teller: string;
  reviewer: string;
  rejectReason?: string;
  isUrgent?: boolean;
  payerAccount?: string;
  receivedTime?: string;
  creditedTime?: string;
  exifSecurityScore?: number; // 0-100
}
