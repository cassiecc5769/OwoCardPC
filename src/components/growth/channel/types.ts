export interface ChannelItem {
  id: string; // e.g. 'CH-TK-001'
  name: string;
  type: string; // '社媒广告' | '官方私域' | '社群合作' | '线下物料' | '自然搜索流量' | 'SEM搜索'
  manager: string;
  shortUrl: string;
  fullUrl: string;
  uv: number;
  registered: number;
  registeredRate: string;
  quoteRate: string;
  tradingUsers: number;
  firstOrderConvRate: string;
  gmv: number;
  cac: number;
  status: '投放中' | '活跃中' | '正常' | '长期有效' | '已暂停';
  roi: string;
  budget: number;
  spent: number;
  quotaPercent: number;
  ltv: number;
  verificationPassRate: string;
  tag?: string;
  tagColor?: string;
  note?: string;
}

export interface ChannelOrder {
  id: string;
  orderNo: string;
  userTag: string;
  userName: string;
  phone: string;
  cardSpec: string;
  settledAmount: string;
  bonusAmount: string;
  status: '成功核销' | '处理中' | '待补小票';
  timeUtc: string;
}

export interface TrackingLinkItem {
  id: string;
  name: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  fullUrl: string;
  clicks: number;
  conversions: number;
  convRate: string;
  createdAt: string;
  status: 'active' | 'paused';
}

export interface AttributedUser {
  uid: string;
  name: string;
  phone: string;
  registeredTime: string;
  kycStatus: string;
  firstCard: string;
  totalOrders: number;
  totalGmv: number;
  repeatBuyer: boolean;
  riskScore: number;
  lastActive: string;
}

export interface AssociatedCampaign {
  id: string;
  name: string;
  voucherCode: string;
  rule: string;
  benefit: string;
  claimedCount: number;
  usedCount: number;
  status: 'active' | 'expired';
  budgetCap: number;
  spent: number;
}
