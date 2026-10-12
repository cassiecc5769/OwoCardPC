import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NavPath } from '../../types';

export type ActivityCategory = 'card_flow' | 'financial_adjustment' | 'user_change';
export type ActivityStatus = 'success' | 'processing' | 'warning' | 'error';

export interface ActivityItem {
  id: string;
  traceId: string;
  category: ActivityCategory;
  categoryLabel: string;
  type: string;
  title: string;
  description: string;
  timestamp: string; // HH:mm:ss
  isoTime: string;
  status: ActivityStatus;
  statusLabel: string;
  actor: string;
  targetEntity: {
    name: string;
    id: string;
    type: 'user' | 'merchant' | 'system';
  };
  metrics?: {
    label: string;
    value: string;
    trend?: 'up' | 'down' | 'neutral';
    highlight?: boolean;
  };
  diff?: {
    before: string;
    after: string;
  };
  tags: string[];
  targetPath: NavPath;
  targetPathLabel: string;
  auditDetails: {
    sourceIp: string;
    deviceOrChannel: string;
    hash: string;
    reason?: string;
    operatorNote?: string;
  };
}

interface RecentActivityWidgetProps {
  onNavigate: (path: NavPath) => void;
}

// Initial realistic seed activity items
const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'ACT-0927-001',
    traceId: 'TRC-99120-AAPL',
    category: 'card_flow',
    categoryLabel: '卡单流转',
    type: 'smart_dispatched',
    title: 'Apple US $100 纯卡密智能撮合完成',
    description: '用户提交卡密通过OCR快速初筛(耗时0.38s)，系统自动匹配并分发给 TIER-S 商户「招财进宝科技」。',
    timestamp: '14:38:42',
    isoTime: new Date(Date.now() - 15000).toISOString(),
    status: 'success',
    statusLabel: '撮合成功',
    actor: '撮合调度引擎 v3.4',
    targetEntity: {
      name: '招财进宝科技有限公司',
      id: 'M0192',
      type: 'merchant'
    },
    metrics: {
      label: '单笔金额',
      value: '$100.00 (¥718.50)',
      trend: 'neutral',
      highlight: true
    },
    diff: {
      before: '待派单撮合池 (排队 18ms)',
      after: '商户核销中 (锁定质押 718 PTS)'
    },
    tags: ['Apple US', '纯卡密', '直连秒验', '自动派单'],
    targetPath: 'order-management',
    targetPathLabel: '卡单管理',
    auditDetails: {
      sourceIp: '14.215.177.38',
      deviceOrChannel: 'API 直连高速节点 #04',
      hash: '0x8f19a0d24e12bc4911d09e887fa231bcae884102',
      reason: '商户接单权重 98.5，满足单日余量配额要求'
    }
  },
  {
    id: 'ACT-0927-002',
    traceId: 'TRC-99119-RECH',
    category: 'financial_adjustment',
    categoryLabel: '资金调账',
    type: 'recharge_credited',
    title: '大额 USDT 充值审核通过，增记 718,000 PTS',
    description: '商户「汇通寰宇数字科技」提交的 100,000 USDT (TRC-20) 对公充值确认到账，财务双人复核已通过。',
    timestamp: '14:37:10',
    isoTime: new Date(Date.now() - 48000).toISOString(),
    status: 'success',
    statusLabel: '入账平账',
    actor: '财务主管 (AUDIT-MGR-08)',
    targetEntity: {
      name: '汇通寰宇数字科技有限公司',
      id: 'M0045',
      type: 'merchant'
    },
    metrics: {
      label: '充值金额',
      value: '+718,000 PTS ($100k)',
      trend: 'up',
      highlight: true
    },
    diff: {
      before: '可用 44,100,000 PTS',
      after: '可用 44,818,000 PTS'
    },
    tags: ['USDT-TRC20', '网银大额', '双人签章', '自动划转'],
    targetPath: 'points-transactions',
    targetPathLabel: '积点流水',
    auditDetails: {
      sourceIp: '183.14.132.90',
      deviceOrChannel: '财务审批控制台 PC-03',
      hash: '0x438df1099238ebcf0912fa92019482baed821033',
      reason: '区块链 24 确认数核验无误，凭证文件 HASH 一致'
    }
  },
  {
    id: 'ACT-0927-003',
    traceId: 'TRC-99118-USER',
    category: 'user_change',
    categoryLabel: '用户/商户',
    type: 'kyc_approved',
    title: '核心出卡大户 Victor Chen 完成 KYC-2 高级认证',
    description: '提交尼日利亚护照及住址流水，AI反欺诈交叉人脸比对置信度 99.4%，系统自动授予专属绿色通道特权。',
    timestamp: '14:35:55',
    isoTime: new Date(Date.now() - 110000).toISOString(),
    status: 'success',
    statusLabel: '认证成功',
    actor: '智能合规风控引擎',
    targetEntity: {
      name: 'Victor Chen (+234 812***882)',
      id: 'U90821',
      type: 'user'
    },
    metrics: {
      label: '认证等级',
      value: '基础实名 → KYC高级',
      trend: 'up',
      highlight: true
    },
    diff: {
      before: '单日限额 $2,000 / 基础费率',
      after: '单日限额 $50,000 / VIP专享费率'
    },
    tags: ['海外KYC', '护照核验', '信用绿标', '额度跃升'],
    targetPath: 'user-management',
    targetPathLabel: '用户管理',
    auditDetails: {
      sourceIp: '197.210.226.15',
      deviceOrChannel: 'Mobile App (iOS 17.5 / iPhone 15 Pro)',
      hash: '0x6629910cf91a329be9012d0918ef9381c8129033',
      reason: '人脸与护照特征向量距离 0.08，合规筛查无制裁黑名单记录'
    }
  },
  {
    id: 'ACT-0927-004',
    traceId: 'TRC-99117-RISK',
    category: 'card_flow',
    categoryLabel: '卡单流转',
    type: 'risk_intercepted',
    title: '涉嫌重复碰卡提交阻断 (高危风控拦截)',
    description: '检测到同一个 IP 在 6 秒内重复提交同一批 Steam UK £100 卡密，命中规则 R-RISK-09，已紧急挂起防穿透。',
    timestamp: '14:33:18',
    isoTime: new Date(Date.now() - 195000).toISOString(),
    status: 'warning',
    statusLabel: '风险拦截',
    actor: '分布式风控雷达',
    targetEntity: {
      name: '匿名出卡账户 (+234 809***119)',
      id: 'U88102',
      type: 'user'
    },
    metrics: {
      label: '涉险面值',
      value: '£500.00 (拦截阻断)',
      trend: 'down',
      highlight: true
    },
    diff: {
      before: '提交申请',
      after: '拦截锁定 / 加入重点监控名单'
    },
    tags: ['Steam UK', '重复卡号', '碰卡防御', '自动挂起'],
    targetPath: 'order-management',
    targetPathLabel: '异常监控',
    auditDetails: {
      sourceIp: '102.89.44.120',
      deviceOrChannel: 'Web API Direct (无指纹特征)',
      hash: '0x99238efb0192384aedc0919238faec0981923019',
      reason: '同一卡号哈希在30分钟内跨设备尝试提交4次'
    }
  },
  {
    id: 'ACT-0927-005',
    traceId: 'TRC-99116-ADJ',
    category: 'financial_adjustment',
    categoryLabel: '资金调账',
    type: 'escrow_locked',
    title: '商户接单质押保证金划扣冻结 20,000 PTS',
    description: '商户「极速易换跨境电商联营社」承接批量 Razer Gold 大额卡单，系统依交易规则预先锁定对应履约保证金。',
    timestamp: '14:30:05',
    isoTime: new Date(Date.now() - 320000).toISOString(),
    status: 'processing',
    statusLabel: '履约质押中',
    actor: '资金清算中心',
    targetEntity: {
      name: '极速易换跨境电商联营社',
      id: 'M0331',
      type: 'merchant'
    },
    metrics: {
      label: '质押金额',
      value: '-20,000 PTS (可用转冻结)',
      trend: 'neutral',
      highlight: false
    },
    diff: {
      before: '冻结质押 240,000 PTS',
      after: '冻结质押 260,000 PTS'
    },
    tags: ['Razer Gold', '履约质押', '自动冻结', '防违约'],
    targetPath: 'points-transactions',
    targetPathLabel: '积点流水',
    auditDetails: {
      sourceIp: '119.123.77.201',
      deviceOrChannel: '结算系统微服务 Node-F2',
      hash: '0x22948ebfa09192419ec910398fbaec0918230194',
      reason: '单笔订单金额超过门槛，启动100%保额质押锁定'
    }
  },
  {
    id: 'ACT-0927-006',
    traceId: 'TRC-99115-MCH',
    category: 'user_change',
    categoryLabel: '用户/商户',
    type: 'merchant_tier_up',
    title: '商户「金玉满堂数码商业集团」信用履约跃升 TIER-S',
    description: '过去30天核销完成率达到 99.92%，客诉争议率降至 0.01%，月交易量突破 3,000 万积点，已提级至 TIER-S 顶级席位。',
    timestamp: '14:26:12',
    isoTime: new Date(Date.now() - 520000).toISOString(),
    status: 'success',
    statusLabel: '评级晋升',
    actor: '商户信誉评级系统',
    targetEntity: {
      name: '金玉满堂数码商业集团',
      id: 'M0204',
      type: 'merchant'
    },
    metrics: {
      label: '商户等级',
      value: 'TIER-A → TIER-S',
      trend: 'up',
      highlight: true
    },
    diff: {
      before: '结算费率 0.15% / 单日限额 500k',
      after: '结算费率 0.12% / 单日限额 2,000k'
    },
    tags: ['商户提级', '信誉加分', '费率优惠', '超高权重'],
    targetPath: 'merchant-management',
    targetPathLabel: '商户管理',
    auditDetails: {
      sourceIp: '120.24.88.92',
      deviceOrChannel: '自动评级调度 CronJob-Daily',
      hash: '0x55910293ebc0192384aedc0919238faec0981923',
      reason: '所有 6 项评级指标全面达标，运营总监完成提级免审复核'
    }
  },
  {
    id: 'ACT-0927-007',
    traceId: 'TRC-99114-SETTLE',
    category: 'financial_adjustment',
    categoryLabel: '资金调账',
    type: 'settlement_payout',
    title: 'T+1 商户收益批量清算完成，划款 ¥328,600.00',
    description: '完成对 14 家活跃商户昨日核销交易的自动批量对账与对公转账清算，账实核对完全一致，0 差错挂账。',
    timestamp: '14:22:40',
    isoTime: new Date(Date.now() - 780000).toISOString(),
    status: 'success',
    statusLabel: '自动结清',
    actor: '自动清算机器人',
    targetEntity: {
      name: '14 家合作商户联营账户池',
      id: 'POOL-ALL',
      type: 'system'
    },
    metrics: {
      label: '出金额度',
      value: '¥328,600.00 (100%成功)',
      trend: 'neutral',
      highlight: true
    },
    diff: {
      before: '待结算 ¥328,600.00',
      after: '待结算 ¥0.00 (已划拨银行代付网关)'
    },
    tags: ['T+1日结', '银企直连', '0错账', '对账单闭环'],
    targetPath: 'platform-settlement',
    targetPathLabel: '平台结算',
    auditDetails: {
      sourceIp: '10.0.8.12',
      deviceOrChannel: '内网专用结算清算通道',
      hash: '0x1182390192384aedc0919238faec0981923019aa',
      reason: '对账系统确认无未决争议，触发每日自动化代付'
    }
  },
  {
    id: 'ACT-0927-008',
    traceId: 'TRC-99113-SEC',
    category: 'user_change',
    categoryLabel: '用户/商户',
    type: 'security_bind_2fa',
    title: '商户操作员绑定双因子验证 (2FA / Google Authenticator)',
    description: '商户「优享全球互娱」财务席操作员成功绑定 TOTP 双因子动态令牌，已激活资金敏感调拨权限。',
    timestamp: '14:18:05',
    isoTime: new Date(Date.now() - 1050000).toISOString(),
    status: 'success',
    statusLabel: '安全加固',
    actor: '安全风控审计模块',
    targetEntity: {
      name: '优享全球数字互娱商务',
      id: 'M0771',
      type: 'merchant'
    },
    metrics: {
      label: '安全分级',
      value: '中危 → 极信安全',
      trend: 'up',
      highlight: false
    },
    diff: {
      before: '单密码验证',
      after: '密码 + TOTP 2FA 双因素强校验'
    },
    tags: ['安全设置', '2FA绑定', '动态令牌', '提现安全'],
    targetPath: 'merchant-management',
    targetPathLabel: '商户管理',
    auditDetails: {
      sourceIp: '116.228.89.14',
      deviceOrChannel: '商户工作台 Web Console (Chrome 128)',
      hash: '0x7781290192384aedc0919238faec0981923019bb',
      reason: '管理员初次登录时触发强制安全合规指引完成绑定'
    }
  }
];

// Pool of dynamic new events generated periodically to simulate a rich live feed
const EVENT_TEMPLATES: Omit<ActivityItem, 'id' | 'traceId' | 'timestamp' | 'isoTime'>[] = [
  {
    category: 'card_flow',
    categoryLabel: '卡单流转',
    type: 'card_submitted',
    title: 'Google Play $50 实体卡提交并启动 OCR 智能识别',
    description: '用户通过移动端拍照提交卡面与小票实拍，OCR识别置信度 99.8%，有效过滤模糊与污损图。',
    status: 'processing',
    statusLabel: 'OCR校验中',
    actor: 'OCR视觉处理服务',
    targetEntity: {
      name: '用户 David O. (+234 814***901)',
      id: 'U91042',
      type: 'user'
    },
    metrics: {
      label: '卡单面值',
      value: '$50.00 (¥359.25)',
      trend: 'neutral',
      highlight: true
    },
    diff: {
      before: '用户提交',
      after: 'OCR秒验入池'
    },
    tags: ['Google Play', '实体卡实拍', 'OCR识别', '秒级入池'],
    targetPath: 'order-management',
    targetPathLabel: '卡单管理',
    auditDetails: {
      sourceIp: '197.210.45.19',
      deviceOrChannel: 'Android Client v2.4.1',
      hash: '0xaa19284192384aedc0919238faec0981923019cc',
      reason: '图片清晰度评分为 96.2，EXIF包含有效发卡国地理坐标'
    }
  },
  {
    category: 'financial_adjustment',
    categoryLabel: '资金调账',
    type: 'dispute_compensated',
    title: '争议单权责明确，商户向出卡方先行赔付 350 PTS',
    description: '卡密被兑换争议调取官方核销日志证实发生在派单之前，商户按规则获得全额解冻，平台向出卡方发放兜底补贴。',
    status: 'success',
    statusLabel: '赔付结案',
    actor: '客服仲裁组 (CS-LEAD-03)',
    targetEntity: {
      name: '星际联通商贸结算部',
      id: 'M0823',
      type: 'merchant'
    },
    metrics: {
      label: '调账额度',
      value: '+350 PTS (平台垫付)',
      trend: 'up',
      highlight: true
    },
    diff: {
      before: '争议挂账 350 PTS',
      after: '结案平账 / 履约保证金退还'
    },
    tags: ['争议裁决', '先行赔付', '官方日志', '质押返还'],
    targetPath: 'dispute-resolution',
    targetPathLabel: '售后争议',
    auditDetails: {
      sourceIp: '10.12.3.88',
      deviceOrChannel: '客服工作台工单系统',
      hash: '0xbb29384192384aedc0919238faec0981923019dd',
      reason: '官方发卡行 API 返回兑换时间点先于用户上传时间 14 分钟'
    }
  },
  {
    category: 'card_flow',
    categoryLabel: '卡单流转',
    type: 'redemption_success',
    title: 'Steam 钱包充值卡 £100 核销完结，积点即时划转',
    description: '商户「华夏通达卡兑」API直连核销成功，出卡方账户即刻进账 742,000 PTS，系统抽取利差 18,000 PTS。',
    status: 'success',
    statusLabel: '交易完结',
    actor: '自动撮合核销引擎',
    targetEntity: {
      name: '华夏通达卡兑网络科技',
      id: 'M0562',
      type: 'merchant'
    },
    metrics: {
      label: '结算收益',
      value: '+742,000 PTS (利润 2.4%)',
      trend: 'up',
      highlight: true
    },
    diff: {
      before: '核销中 (锁定质押 742k)',
      after: '完结归档 (商户消耗划扣)'
    },
    tags: ['Steam UK', 'API直连秒验', '利润入账', '实时到账'],
    targetPath: 'order-management',
    targetPathLabel: '卡单管理',
    auditDetails: {
      sourceIp: '114.119.160.22',
      deviceOrChannel: '专线高频对接服务器 #02',
      hash: '0xcc39485192384aedc0919238faec0981923019ee',
      reason: '核销响应耗时 2.1s，发卡商回执代码 200 SUCCESS'
    }
  },
  {
    category: 'user_change',
    categoryLabel: '用户/商户',
    type: 'quota_increased',
    title: '商户「招财进宝科技」单日接单限额提至 $300,000',
    description: '基于连续 14 天充值充沛与履约时效 <30s，风控策略中心自动扩展其单日高额卡池承接配额。',
    status: 'success',
    statusLabel: '额度扩展',
    actor: '动态授信模型',
    targetEntity: {
      name: '招财进宝科技有限公司',
      id: 'M0192',
      type: 'merchant'
    },
    metrics: {
      label: '单日配额',
      value: '$200k → $300k',
      trend: 'up',
      highlight: true
    },
    diff: {
      before: '单日承接上限 $200,000',
      after: '单日承接上限 $300,000 (池额扩增)'
    },
    tags: ['额度调优', '优质商户', '自动扩容', '高额通道'],
    targetPath: 'merchant-management',
    targetPathLabel: '商户管理',
    auditDetails: {
      sourceIp: '10.0.1.18',
      deviceOrChannel: '风险与额度中台微服务',
      hash: '0xdd49586192384aedc0919238faec0981923019ff',
      reason: '商户可用保证金池充裕，平均日活接卡率达 94.6%'
    }
  },
  {
    category: 'financial_adjustment',
    categoryLabel: '资金调账',
    type: 'rebate_credited',
    title: '渠道拉新阶梯返佣结算 +18,500 PTS 自动发放',
    description: '推广渠道「TG社群联运合作方」周结达标，邀请 120 位出卡用户产生有效交易，佣金已划入渠道积点账户。',
    status: 'success',
    statusLabel: '佣金到账',
    actor: '增长结算中心',
    targetEntity: {
      name: 'TG社群联盟渠道商',
      id: 'CHN-9901',
      type: 'user'
    },
    metrics: {
      label: '佣金结算',
      value: '+18,500 PTS ($2,570)',
      trend: 'up',
      highlight: true
    },
    diff: {
      before: '待核算佣金 18,500 PTS',
      after: '已划拨到可用积点余额'
    },
    tags: ['增长裂变', '渠道佣金', '自动清算', 'ROI正向'],
    targetPath: 'points-transactions',
    targetPathLabel: '积点流水',
    auditDetails: {
      sourceIp: '10.0.12.9',
      deviceOrChannel: '增长分佣服务 CronJob-Weekly',
      hash: '0xee59687192384aedc0919238faec098192301900',
      reason: '有效转化率达标 18.2%，无虚假小号批量对冲异常'
    }
  }
];

export const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({ onNavigate }) => {
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAutoLive, setIsAutoLive] = useState(true);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [selectedActivityForAudit, setSelectedActivityForAudit] = useState<ActivityItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const templateIndexRef = useRef(0);

  // Keep a local timer tick for relative time display updating
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Simulated live event feed every 6 seconds if auto-live is enabled
  useEffect(() => {
    if (!isAutoLive) return;

    const interval = setInterval(() => {
      const template = EVENT_TEMPLATES[templateIndexRef.current % EVENT_TEMPLATES.length];
      templateIndexRef.current += 1;

      const dateObj = new Date();
      const timeStr = dateObj.toTimeString().split(' ')[0];
      const randomRandomSuffix = Math.floor(1000 + Math.random() * 9000);

      const newEvent: ActivityItem = {
        ...template,
        id: `ACT-${dateObj.getMonth() + 1}${dateObj.getDate()}-${randomRandomSuffix}`,
        traceId: `TRC-${randomRandomSuffix}-${template.category.slice(0, 3).toUpperCase()}`,
        timestamp: timeStr,
        isoTime: dateObj.toISOString()
      };

      setActivities(prev => [newEvent, ...prev.slice(0, 49)]); // Keep max 50 items
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoLive]);

  // Handle manual pull/refresh
  const handleManualRefresh = () => {
    setIsManualRefreshing(true);
    setTimeout(() => {
      const template = EVENT_TEMPLATES[templateIndexRef.current % EVENT_TEMPLATES.length];
      templateIndexRef.current += 1;
      const dateObj = new Date();
      const timeStr = dateObj.toTimeString().split(' ')[0];
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);

      const refreshedEvent: ActivityItem = {
        ...template,
        id: `ACT-${dateObj.getMonth() + 1}${dateObj.getDate()}-${randomSuffix}`,
        traceId: `TRC-${randomSuffix}-${template.category.slice(0, 3).toUpperCase()}`,
        timestamp: timeStr,
        isoTime: dateObj.toISOString()
      };

      setActivities(prev => [refreshedEvent, ...prev.slice(0, 49)]);
      setIsManualRefreshing(false);
    }, 500);
  };

  // Copy handler
  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Relative time helper
  const getRelativeTime = (isoTime: string) => {
    const elapsed = Math.floor((now - new Date(isoTime).getTime()) / 1000);
    if (elapsed < 10) return '刚刚';
    if (elapsed < 60) return `${elapsed}秒前`;
    if (elapsed < 3600) return `${Math.floor(elapsed / 60)}分钟前`;
    return `${Math.floor(elapsed / 3600)}小时前`;
  };

  // Filtered activity items
  const filteredActivities = useMemo(() => {
    return activities.filter(item => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchId = item.id.toLowerCase().includes(query);
        const matchTrace = item.traceId.toLowerCase().includes(query);
        const matchEntity = item.targetEntity.name.toLowerCase().includes(query) || item.targetEntity.id.toLowerCase().includes(query);
        const matchActor = item.actor.toLowerCase().includes(query);
        const matchTags = item.tags.some(t => t.toLowerCase().includes(query));
        if (!matchTitle && !matchDesc && !matchId && !matchTrace && !matchEntity && !matchActor && !matchTags) {
          return false;
        }
      }
      return true;
    });
  }, [activities, selectedCategory, statusFilter, searchQuery]);

  // Aggregate Category Counts
  const counts = useMemo(() => {
    return {
      all: activities.length,
      card_flow: activities.filter(a => a.category === 'card_flow').length,
      financial_adjustment: activities.filter(a => a.category === 'financial_adjustment').length,
      user_change: activities.filter(a => a.category === 'user_change').length
    };
  }, [activities]);

  // Category Icon & Styling Helper
  const getCategoryTheme = (category: ActivityCategory) => {
    switch (category) {
      case 'card_flow':
        return {
          icon: 'credit_card',
          bgLight: 'bg-blue-50',
          textColor: 'text-blue-600',
          borderColor: 'border-blue-200',
          chipBg: 'bg-blue-50/80 text-blue-700 border-blue-200',
          pillColor: 'bg-blue-600'
        };
      case 'financial_adjustment':
        return {
          icon: 'account_balance_wallet',
          bgLight: 'bg-amber-50',
          textColor: 'text-amber-700',
          borderColor: 'border-amber-200',
          chipBg: 'bg-amber-50/80 text-amber-800 border-amber-200',
          pillColor: 'bg-amber-600'
        };
      case 'user_change':
        return {
          icon: 'person_pin',
          bgLight: 'bg-purple-50',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-200',
          chipBg: 'bg-purple-50/80 text-purple-800 border-purple-200',
          pillColor: 'bg-purple-600'
        };
    }
  };

  // Status Styling Helper
  const getStatusBadge = (status: ActivityStatus, statusLabel: string) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {statusLabel}
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            {statusLabel}
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            {statusLabel}
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-800 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
            {statusLabel}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      {/* 1. Header Section */}
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/90 via-white to-blue-50/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Title & Live Status */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">sensors</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">全域实时动态流水</h2>
                <span className="text-xs text-slate-500 font-normal">Recent Activity Live Feed</span>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                  isAutoLive 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isAutoLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                  {isAutoLive ? '实时轮询中' : '已暂停'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                高保真捕获全平台卡单流转动作、大额资金财务调账及用户/商户实体敏感变更
              </p>
            </div>
          </div>

          {/* Controls: Live Toggle, Refresh, Audio, Count */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xs text-slate-500 font-code-token hidden xl:block mr-1">
              今日累计流水: <strong className="text-slate-900 font-numeric-table font-semibold">1,429</strong> 笔
            </div>

            {/* Toggle auto live */}
            <button
              onClick={() => setIsAutoLive(!isAutoLive)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                isAutoLive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title={isAutoLive ? '点击暂停自动抓取' : '点击开启实时捕获'}
            >
              <span className="material-symbols-outlined text-[15px]">
                {isAutoLive ? 'pause_circle' : 'play_circle'}
              </span>
              <span>{isAutoLive ? '自动更新中' : '已暂停轮询'}</span>
            </button>

            {/* Manual Refresh */}
            <button
              onClick={handleManualRefresh}
              disabled={isManualRefreshing}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/90 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
            >
              <span className={`material-symbols-outlined text-[15px] ${isManualRefreshing ? 'animate-spin' : ''}`}>
                refresh
              </span>
              <span>拉取最新</span>
            </button>

            {/* Sound notification toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                  : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
              }`}
              title={soundEnabled ? '声效提示: 已开启' : '声效提示: 已关闭'}
            >
              <span className="material-symbols-outlined text-[16px]">
                {soundEnabled ? 'volume_up' : 'volume_off'}
              </span>
            </button>
          </div>
        </div>

        {/* 2. Top Metric Indicator Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-3.5 pt-3 border-t border-slate-200/60">
          <div className="p-2.5 rounded-lg bg-white border border-slate-200/70 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">实时流转卡单</span>
              <span className="material-symbols-outlined text-blue-600 text-[16px]">credit_card</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-[18px] font-bold text-slate-900 font-numeric-stat">12,560</span>
              <span className="text-[11px] text-slate-500">笔今日</span>
            </div>
            <div className="text-[10px] text-emerald-700 font-medium mt-0.5 flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              98.6% 撮合率 · 平均延时 18ms
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-slate-200/70 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">财务调整净额</span>
              <span className="material-symbols-outlined text-amber-600 text-[16px]">account_balance_wallet</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-[18px] font-bold text-slate-900 font-numeric-stat">+¥568,000</span>
              <span className="text-[11px] text-slate-500">入账</span>
            </div>
            <div className="text-[10px] text-blue-600 font-medium mt-0.5 flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              42 笔调账工单 · 0 差错账
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-slate-200/70 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">主体敏感变更</span>
              <span className="material-symbols-outlined text-purple-600 text-[16px]">security</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-[18px] font-bold text-slate-900 font-numeric-stat">86</span>
              <span className="text-[11px] text-slate-500">起变更</span>
            </div>
            <div className="text-[10px] text-purple-700 font-medium mt-0.5 flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              KYC认证 32人 · 评级升降 6家
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-slate-200/70 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">全链路响应时效</span>
              <span className="material-symbols-outlined text-emerald-600 text-[16px]">speed</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-[18px] font-bold text-slate-900 font-numeric-stat">0.38s</span>
              <span className="text-[11px] text-slate-500">OCR</span>
            </div>
            <div className="text-[10px] text-emerald-700 font-medium mt-0.5 flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              平均核销 42s · SLA达标 99.8%
            </div>
          </div>
        </div>
      </div>

      {/* 3. Category Filter Tabs & Search Bar */}
      <div className="p-3 bg-slate-50/70 border-b border-slate-200/70 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <span>全部动态</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-code-token font-bold ${
              selectedCategory === 'all' ? 'bg-blue-700/80 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('card_flow')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedCategory === 'card_flow'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white hover:bg-blue-50 text-slate-700 border border-slate-200 hover:text-blue-700'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">credit_card</span>
            <span>卡单流转</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-code-token font-bold ${
              selectedCategory === 'card_flow' ? 'bg-blue-700/80 text-white' : 'bg-blue-50 text-blue-700'
            }`}>
              {counts.card_flow}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('financial_adjustment')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedCategory === 'financial_adjustment'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white hover:bg-amber-50 text-slate-700 border border-slate-200 hover:text-amber-800'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">account_balance_wallet</span>
            <span>资金账务调整</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-code-token font-bold ${
              selectedCategory === 'financial_adjustment' ? 'bg-amber-700/80 text-white' : 'bg-amber-50 text-amber-800'
            }`}>
              {counts.financial_adjustment}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('user_change')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedCategory === 'user_change'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white hover:bg-purple-50 text-slate-700 border border-slate-200 hover:text-purple-800'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">group</span>
            <span>用户/商户变更</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-code-token font-bold ${
              selectedCategory === 'user_change' ? 'bg-purple-700/80 text-white' : 'bg-purple-50 text-purple-800'
            }`}>
              {counts.user_change}
            </span>
          </button>
        </div>

        {/* Right filters: Status select & keyword search */}
        <div className="flex items-center gap-2">
          {/* Status filter pills */}
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setStatusFilter('success')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                statusFilter === 'success' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              成功
            </button>
            <button
              onClick={() => setStatusFilter('processing')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                statusFilter === 'processing' ? 'bg-blue-50 text-blue-800 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              处理中
            </button>
            <button
              onClick={() => setStatusFilter('warning')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                statusFilter === 'warning' ? 'bg-rose-50 text-rose-800 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              风险拦截
            </button>
          </div>

          {/* Keyword Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="搜索单号/商户/用户/标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 lg:w-56 pl-7 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-800 placeholder-slate-400"
            />
            <span className="material-symbols-outlined absolute left-2 top-2 text-slate-400 text-[14px]">
              search
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Activity Feed List */}
      <div className="divide-y divide-slate-100 max-h-[580px] overflow-y-auto">
        {filteredActivities.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
              <span className="material-symbols-outlined text-[24px]">filter_list_off</span>
            </div>
            <p className="text-sm font-medium text-slate-700">未找到符合条件的实时动态记录</p>
            <p className="text-xs text-slate-400 mt-1">请尝试切换分类或清除搜索关键字</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="mt-3 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-medium cursor-pointer transition-colors"
            >
              重置筛选条件
            </button>
          </div>
        ) : (
          filteredActivities.map((activity) => {
            const theme = getCategoryTheme(activity.category);
            return (
              <div
                key={activity.id}
                className="p-3.5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-3 group"
              >
                {/* Left: Category Icon, Content, Key Metrics, Diff */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Category Badge Icon */}
                  <div className={`w-9 h-9 rounded-xl ${theme.bgLight} ${theme.textColor} border ${theme.borderColor} flex items-center justify-center shrink-0 mt-0.5 shadow-2xs`}>
                    <span className="material-symbols-outlined text-[20px]">
                      {theme.icon}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    {/* Top Row: Category Pill, Status Badge, Title, Timestamp */}
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${theme.chipBg}`}>
                        {activity.categoryLabel}
                      </span>
                      {getStatusBadge(activity.status, activity.statusLabel)}
                      <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">
                        {activity.title}
                      </h4>
                      <span className="ml-auto text-xs text-slate-400 font-code-token flex items-center gap-1 shrink-0">
                        <span className="material-symbols-outlined text-[13px]">schedule</span>
                        <strong className="text-slate-600 font-medium">{getRelativeTime(activity.isoTime)}</strong>
                        <span className="text-slate-300">|</span>
                        <span>{activity.timestamp}</span>
                      </span>
                    </div>

                    {/* Description Paragraph */}
                    <p className="text-xs text-slate-600 leading-relaxed mb-2">
                      {activity.description}
                    </p>

                    {/* Metadata & Diff Strip */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {/* Target Entity */}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100/90 text-slate-700 font-medium border border-slate-200/50">
                        <span className="material-symbols-outlined text-[13px] text-slate-400">
                          {activity.targetEntity.type === 'merchant' ? 'storefront' : activity.targetEntity.type === 'user' ? 'person' : 'hub'}
                        </span>
                        <span>{activity.targetEntity.name}</span>
                        <span className="font-code-token text-[10px] text-slate-500 font-bold">({activity.targetEntity.id})</span>
                      </span>

                      {/* Actor */}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100/90 text-slate-600 border border-slate-200/50">
                        <span className="material-symbols-outlined text-[13px] text-slate-400">smart_toy</span>
                        <span>触发: {activity.actor}</span>
                      </span>

                      {/* Metrics Pill */}
                      {activity.metrics && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-numeric-stat font-bold ${
                          activity.metrics.highlight 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200/70' 
                            : 'bg-slate-100 text-slate-800 border border-slate-200/50'
                        }`}>
                          <span className="text-[10px] font-normal text-slate-500 font-sans">{activity.metrics.label}:</span>
                          <span>{activity.metrics.value}</span>
                        </span>
                      )}

                      {/* Diff Strip if present */}
                      {activity.diff && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50/70 text-emerald-800 border border-emerald-200/60 font-code-token text-[11px]">
                          <span className="text-slate-500 line-through truncate max-w-[130px]">{activity.diff.before}</span>
                          <span className="material-symbols-outlined text-[12px] text-emerald-600">arrow_right_alt</span>
                          <span className="font-semibold truncate max-w-[180px]">{activity.diff.after}</span>
                        </span>
                      )}

                      {/* Tags */}
                      {activity.tags.map((tag, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-50 text-slate-500 text-[10px] font-code-token border border-slate-200/40">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Quick Action Buttons */}
                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="flex items-center gap-1">
                    {/* Trace ID copy */}
                    <button
                      onClick={(e) => handleCopy(activity.traceId, e)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[11px] font-code-token font-medium border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                      title="复制全链路追踪ID"
                    >
                      <span className="material-symbols-outlined text-[13px]">
                        {copiedId === activity.traceId ? 'check' : 'content_copy'}
                      </span>
                      <span>{copiedId === activity.traceId ? '已复制' : activity.traceId}</span>
                    </button>

                    {/* Audit detail modal open */}
                    <button
                      onClick={() => setSelectedActivityForAudit(activity)}
                      className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded text-xs font-medium border border-slate-200/80 shadow-2xs flex items-center gap-1 transition-colors cursor-pointer"
                      title="查看底层审计与特征载荷"
                    >
                      <span className="material-symbols-outlined text-[14px] text-blue-600">receipt_long</span>
                      <span>审计追溯</span>
                    </button>
                  </div>

                  {/* Direct navigate to target module */}
                  <button
                    onClick={() => onNavigate(activity.targetPath)}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded text-xs font-semibold border border-blue-200 hover:border-blue-600 flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                  >
                    <span>直达{activity.targetPathLabel}</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Footer Bar */}
      <div className="p-3 bg-slate-50/90 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>全链路业务事件流已接入 Kafka 高可靠消息总线 (Retention 180天可穿透)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-code-token">当前显示 {filteredActivities.length} / {activities.length} 条</span>
          <button
            onClick={() => onNavigate('order-management')}
            className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>进入全量事件与卡单调度中心</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* 6. Forensic Audit Detail Modal */}
      {selectedActivityForAudit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 border border-slate-200 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <span className="material-symbols-outlined text-[20px]">fingerprint</span>
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">事件底层审计全景追溯</h3>
                  <span className="font-code-token text-[11px] text-slate-500">
                    Trace ID: {selectedActivityForAudit.traceId} · Event ID: {selectedActivityForAudit.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedActivityForAudit(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-4 space-y-4 text-xs">
              {/* Event Summary Card */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 text-sm">{selectedActivityForAudit.title}</span>
                  {getStatusBadge(selectedActivityForAudit.status, selectedActivityForAudit.statusLabel)}
                </div>
                <p className="text-slate-600 leading-relaxed">{selectedActivityForAudit.description}</p>
                <div className="mt-2 pt-2 border-t border-slate-200/50 flex flex-wrap gap-2 text-[11px] text-slate-500 font-code-token">
                  <span>时间: <strong>{selectedActivityForAudit.timestamp}</strong></span>
                  <span>·</span>
                  <span>执行单元: <strong className="text-blue-700">{selectedActivityForAudit.actor}</strong></span>
                  <span>·</span>
                  <span>分类: <strong className="text-slate-800">{selectedActivityForAudit.categoryLabel}</strong></span>
                </div>
              </div>

              {/* State Diff Snapshot */}
              {selectedActivityForAudit.diff && (
                <div>
                  <h5 className="font-semibold text-slate-800 mb-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-emerald-600">compare_arrows</span>
                    <span>业务状态前后快照比对 (State Diff)</span>
                  </h5>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="p-2 bg-white rounded border border-slate-200/60">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">变更前 (PRE-STATE)</span>
                      <span className="text-slate-700 font-code-token text-xs">{selectedActivityForAudit.diff.before}</span>
                    </div>
                    <div className="p-2 bg-emerald-50/50 rounded border border-emerald-200">
                      <span className="text-[10px] text-emerald-700 font-bold uppercase block mb-0.5">变更后 (POST-STATE)</span>
                      <span className="text-emerald-900 font-code-token text-xs font-semibold">{selectedActivityForAudit.diff.after}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Forensic Details Grid */}
              <div>
                <h5 className="font-semibold text-slate-800 mb-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-blue-600">policy</span>
                  <span>审计载荷与安全特征 (Security Forensics)</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700">
                  <div>
                    <span className="text-slate-500 block text-[11px]">发起节点 / 来源IP:</span>
                    <span className="font-code-token font-semibold text-slate-900">{selectedActivityForAudit.auditDetails.sourceIp}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">设备通道 / 客户端指纹:</span>
                    <span className="font-code-token font-semibold text-slate-900">{selectedActivityForAudit.auditDetails.deviceOrChannel}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 block text-[11px]">不可篡改哈希签名 (Ledger Hash):</span>
                    <span className="font-code-token text-[11px] text-blue-700 break-all bg-white px-2 py-1 rounded border border-slate-200 block mt-0.5">
                      {selectedActivityForAudit.auditDetails.hash}
                    </span>
                  </div>
                  {selectedActivityForAudit.auditDetails.reason && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 block text-[11px]">决策依据与判定规则:</span>
                      <span className="text-slate-800 font-medium block mt-0.5">
                        {selectedActivityForAudit.auditDetails.reason}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
              <span className="text-slate-400 text-xs">
                双因子审计日志已归档至合规冷存储
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedActivityForAudit(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                >
                  关闭
                </button>
                <button
                  onClick={() => {
                    const target = selectedActivityForAudit.targetPath;
                    setSelectedActivityForAudit(null);
                    onNavigate(target);
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>直达{selectedActivityForAudit.targetPathLabel}</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
