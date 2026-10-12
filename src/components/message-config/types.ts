export type MessageDomain = 'all' | 'trade' | 'aftersale' | 'finance' | 'member';

export type ReceiverRole =
  | 'all'
  | 'seller'
  | 'merchant'
  | 'ops'
  | 'cs'
  | 'finance'
  | 'risk';

export type ChannelKey =
  | 'ws'
  | 'sms'
  | 'dingtalk'
  | 'webhook'
  | 'tts'
  | 'push'
  | 'email'
  | 'whatsapp'
  | 'telegram';

export interface ChannelBadge {
  key: ChannelKey;
  label: string;
  bg: string;
  text: string;
  border?: string;
}

export interface EventRuleItem {
  id: string; // e.g. 'EVT-ORD-SUBMIT'
  name: string; // e.g. '用户出卡下单'
  domain: 'trade' | 'aftersale' | 'finance' | 'member';
  domainLabel: string;
  source: string; // e.g. '交易核心 · 挂单流'
  icon: string;
  iconBg: string;
  iconColor: string;
  targetRole: {
    primary: string;
    secondary?: string;
    icon: string;
    iconColor: string;
  };
  channels: {
    ws?: boolean;
    sms?: boolean;
    dingtalk?: boolean;
    webhook?: boolean;
    tts?: boolean;
    push?: boolean;
    email?: boolean;
    whatsapp?: boolean;
    telegram?: boolean;
    customLabels?: string[];
  };
  throttlePolicy: {
    timing: string;
    rateLimit: string;
    isHighRisk?: boolean;
  };
  templateId: string;
  templateName: string;
  status: 'running' | 'throttled' | 'fused';
  statusText: string;
  updatedAt: string;
}

export type PreviewFormat = 'sms' | 'push' | 'email' | 'webhook';

export interface MessageTemplateItem {
  id: string;
  name: string;
  category: string;
  domain: 'trade' | 'aftersale' | 'finance' | 'member';
  version: string;
  channelsSupported: ChannelKey[];
  smsBody: string;
  pushTitle: string;
  pushBody: string;
  emailSubject: string;
  emailHtml: string;
  webhookJson: string;
  variableKeys: string[];
  charCount: number;
  smsSegments: number;
  lastEditedBy: string;
  lastEditedAt: string;
}

export interface VariableItem {
  key: string;
  label: string;
  desc: string;
  example: string;
  category: 'user' | 'order' | 'card' | 'finance' | 'sla';
}

export interface DispatchLogItem {
  id: string;
  eventId: string;
  eventName: string;
  templateId: string;
  recipient: string;
  recipientType: string;
  channel: string;
  channelKey: ChannelKey;
  status: 'success' | 'retry' | 'failed';
  latency: string;
  timestamp: string;
  sha256: string;
  payloadSummary: string;
  payloadSnippet?: string;
  retryCount: number;
}

export interface GatewayStatusItem {
  name: string;
  description: string;
  status: 'online' | 'busy' | 'offline';
  badge: string;
  latency: string;
  packetLoss: string;
  trafficRate: string;
}

export interface SnapshotVersion {
  version: string;
  timestamp: string;
  operator: string;
  rulesCount: number;
  templatesCount: number;
  hash: string;
  comment: string;
  isCurrent: boolean;
}
