import React, { useState } from 'react';
import { NavPath } from '../../types';

interface OnlineServiceViewProps {
  onNavigate: (path: NavPath) => void;
}

export type ServiceUserType = '出卡散户' | 'VIP大客户' | '合作商户客服';

// 7.2 消息状态：发送中 / 已发送 / 已送达 / 已读 / 发送失败 / 已撤回
export type MessageDeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | 'recalled';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  time: string;
  deliveryStatus?: MessageDeliveryStatus; // 7.2 客服消息送达与已读状态
  deliveredTime?: string;
  readTime?: string;
  recallTime?: string;
  orderCard?: {
    orderCode: string;
    cardType: string;
    faceValue: string;
    status: string;
    checkResult: string;
  };
}

// 7.1 在线客服会话定义，强关联六要素
export interface OnlineChatSession {
  id: string; // 界面会话简码
  conversationId: string; // 7.1 统一 Conversation ID (如 CONV-20261006-88109)
  userId: string; // 7.1 User ID
  orderId: string; // 7.1 Order ID
  cardId: string; // 7.1 Card ID
  taskId: string; // 7.1 Task ID
  source: string; // 7.1 来源 (如 APP / iOS v3.2.0, Web H5)
  assignedAgent: string; // 7.1 客服 (如 客服-小张 AG-102)
  user: {
    id: string;
    name: string;
    type: ServiceUserType;
    avatarBg: string;
    kycLevel: string;
    creditScore: number;
    phoneOrEmail: string;
    region: string;
    registeredDate: string;
    userTags: string[]; // 7.3 用户标签
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCK'; // 7.3 风险等级
    riskTags: string[]; // 7.3 风险标签
    userNote: string; // 7.3 用户备注
    noteLogs: Array<{ time: string; agent: string; text: string }>;
  };
  userHistory: {
    totalOrders: number;
    totalGmv: string;
    avgFinishTime: string;
    disputeRate: string;
    satisfactionScore: string;
    previousSessionsCount: number;
  };
  associatedOrders: Array<{
    orderCode: string;
    cardType: string;
    countryFlag: string;
    faceValue: string;
    declaredAmount: string;
    cardCheckStatus: string;
    merchantName: string;
    status: string;
    statusColor: string;
    submitTime: string;
    isAbnormal?: boolean; // 7.3 当前异常订单标记
    abnormalReason?: string;
  }>;
  aftersaleRecords: Array<{ // 7.3 售后记录
    disputeId: string;
    orderCode: string;
    type: string;
    status: string;
    result: string;
    time: string;
  }>;
  currentTopic: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  status: 'active' | 'waiting' | 'closed';
  tag: string;
  tagColor: string;
}

// 7.4 商户消息定义 (发送 → 送达 → 已读 状态追踪)
export interface MerchantNotificationItem {
  id: string;
  merchantMid: string;
  merchantName: string;
  category: '异常提醒' | '运营通知' | '业务通知';
  title: string;
  content: string;
  status: '发送中' | '已发送' | '已送达' | '已读';
  sentTime: string;
  deliveredTime?: string;
  readTime?: string;
  senderAgent: string;
}

const INITIAL_CHATS: OnlineChatSession[] = [
  {
    id: 'CHAT-01',
    conversationId: 'CONV-20261006-88109',
    userId: 'USR-882109',
    orderId: 'KD-20261005-9921',
    cardId: 'CARD-88120',
    taskId: 'TSK-20261005-001',
    source: 'APP / iOS v3.2.0',
    assignedAgent: '客服-小张 (AG-102)',
    user: {
      id: 'USR-882109',
      name: 'David_Trader (美区VIP)',
      type: 'VIP大客户',
      avatarBg: 'bg-blue-600',
      kycLevel: '高级认证 (KYC-3)',
      creditScore: 98,
      phoneOrEmail: '+1 626***8819',
      region: '美国 (加州洛杉矶)',
      registeredDate: '2025-11-20',
      userTags: ['VIP大客户', '高频出卡', '美区专场', '大额卖家'],
      riskLevel: 'LOW',
      riskTags: ['低风险', '优质历史', '高额合规'],
      userNote: '客户习惯英文或简体中文交流，在大额 Apple 充值卡放款时习惯催办；已给予 VIP 快速放款通道授权。',
      noteLogs: [
        { time: '10-05 14:00', agent: 'AG-102', text: '向客户确认首笔 $500 Apple 校验正常，已申请 VIP 加急催办。' },
        { time: '09-28 11:30', agent: 'AG-105', text: '完成 KYC-3 高级认证审核，增加单日提现额度至 50,000 USDT。' }
      ]
    },
    userHistory: {
      totalOrders: 142,
      totalGmv: '$78,500',
      avgFinishTime: '45秒',
      disputeRate: '0.0%',
      satisfactionScore: '5.0 ⭐',
      previousSessionsCount: 6,
    },
    associatedOrders: [
      {
        orderCode: 'KD-20261005-9921',
        cardType: 'Apple Gift Card US',
        countryFlag: '🇺🇸',
        faceValue: '$500.00',
        declaredAmount: '$417.50 USDT',
        cardCheckStatus: '有效余额 $500.00 (官方API通过)',
        merchantName: '极客卡业 (美区专线)',
        status: '即将超时',
        statusColor: 'bg-amber-50 text-amber-800 border-amber-200',
        submitTime: '14:28:10',
        isAbnormal: true,
        abnormalReason: '【接单滞留】商户极客卡业处理接近 SLA 上限，系统已触发 VIP 加急催单'
      },
      {
        orderCode: 'KD-20261003-8812',
        cardType: 'Steam Wallet US',
        countryFlag: '🇺🇸',
        faceValue: '$200.00',
        declaredAmount: '$164.00 USDT',
        cardCheckStatus: '已核销结清',
        merchantName: '极客卡业',
        status: '已结清',
        statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        submitTime: '10-03 16:20',
      },
    ],
    aftersaleRecords: [
      {
        disputeId: 'DSP-20260912-01',
        orderCode: 'KD-20260912-1029',
        type: '碰卡争议',
        status: '仲裁完毕',
        result: '商户败诉并已补发配额放款',
        time: '2026-09-12 18:20'
      }
    ],
    currentTopic: '大额 Apple 卡单放款时效与 VIP 加急咨询',
    lastMessage: '请问我的 $500 Apple 充值卡怎么还在处理中？什么时候能完成放款？',
    lastTime: '14:52',
    unreadCount: 2,
    status: 'active',
    tag: '卡单催办',
    tagColor: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    id: 'CHAT-02',
    conversationId: 'CONV-20261006-99201',
    userId: 'MER-1004',
    orderId: 'KD-20261005-9650',
    cardId: 'CARD-99102',
    taskId: 'TSK-20261005-088',
    source: '合作商户 Api 席位',
    assignedAgent: '客服-小李 (AG-108)',
    user: {
      id: 'MER-1004',
      name: '顺达环球卡券 (商户调度席)',
      type: '合作商户客服',
      avatarBg: 'bg-emerald-600',
      kycLevel: '企业商户实名认证',
      creditScore: 94,
      phoneOrEmail: 'service@shunda-card.com',
      region: '中国香港',
      registeredDate: '2026-02-14',
      userTags: ['合作商户', '美区专线', '高频接单'],
      riskLevel: 'MEDIUM',
      riskTags: ['碰卡关注', '二次兑换疑虑', '近期争议 1 笔'],
      userNote: '该商户处理 Steam 卡种时校验严格，如产生碰卡需调阅官方兑换时间戳。',
      noteLogs: [
        { time: '10-05 14:15', agent: 'AG-108', text: '已向商户索要二次兑换的官方 API 调阅 Log 存证。' }
      ]
    },
    userHistory: {
      totalOrders: 1840,
      totalGmv: '$920,000',
      avgFinishTime: '38秒',
      disputeRate: '0.8%',
      satisfactionScore: '4.8 ⭐',
      previousSessionsCount: 24,
    },
    associatedOrders: [
      {
        orderCode: 'KD-20261005-9650',
        cardType: 'Apple Gift Card US',
        countryFlag: '🇺🇸',
        faceValue: '$100.00',
        declaredAmount: '$83.50 USDT',
        cardCheckStatus: '商户标记已被其他账号充值',
        merchantName: '顺达环球卡券',
        status: '售后争议',
        statusColor: 'bg-purple-50 text-purple-700 border-purple-200',
        submitTime: '14:15:20',
        isAbnormal: true,
        abnormalReason: '【碰卡争议】商户反馈卡密提示已被兑换，用户要求查看兑换时间戳存证'
      },
    ],
    aftersaleRecords: [
      {
        disputeId: 'DSP-20261005-88',
        orderCode: 'KD-20261005-9650',
        type: '二次兑换争议',
        status: '质证仲裁中',
        result: '等待商户上传兑换时间戳',
        time: '2026-10-05 14:20'
      }
    ],
    currentTopic: 'Apple $100 碰卡争议存证核验',
    lastMessage: '这批 Steam $100 卡密提示已在其他账号兑换，已上传官方碰卡截图存证！',
    lastTime: '14:48',
    unreadCount: 1,
    status: 'active',
    tag: '碰卡争议',
    tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    id: 'CHAT-03',
    conversationId: 'CONV-20261006-77312',
    userId: 'USR-652019',
    orderId: 'KD-20261005-9712',
    cardId: 'CARD-77301',
    taskId: 'TSK-20261005-104',
    source: 'Web H5 手机端',
    assignedAgent: '客服-小陈 (AG-112)',
    user: {
      id: 'USR-652019',
      name: 'GlobalSeller_88',
      type: '出卡散户',
      avatarBg: 'bg-amber-600',
      kycLevel: '基础实名 (KYC-1)',
      creditScore: 82,
      phoneOrEmail: '+44 7911****82',
      region: '英国',
      registeredDate: '2026-08-10',
      userTags: ['出卡散户', '英区卡种', '新用户'],
      riskLevel: 'MEDIUM',
      riskTags: ['图片反光', '申报金额溢出嫌疑'],
      userNote: '新用户，上传卡图有闪光灯反光，指导其在深色背景下重拍。',
      noteLogs: [
        { time: '10-05 14:30', agent: 'AG-112', text: '告知用户小票折角反光的重拍规范。' }
      ]
    },
    userHistory: {
      totalOrders: 8,
      totalGmv: '$1,200',
      avgFinishTime: '1.2分钟',
      disputeRate: '0.0%',
      satisfactionScore: '4.9 ⭐',
      previousSessionsCount: 2,
    },
    associatedOrders: [
      {
        orderCode: 'KD-20261005-9712',
        cardType: 'Google Play UK',
        countryFlag: '🇬🇧',
        faceValue: '£50.00',
        declaredAmount: '£41.20',
        cardCheckStatus: '灰余额嫌疑 (申报£50/查实£25)',
        merchantName: '万通鼎盛数码',
        status: '待人工确认',
        statusColor: 'bg-amber-50 text-amber-800 border-amber-200',
        submitTime: '14:29:40',
        isAbnormal: true,
        abnormalReason: '【凭证不符】小票照片有反光且真实金额为 £25.00，待用户确认修改'
      },
    ],
    aftersaleRecords: [],
    currentTopic: '小票反光与金额不符补传咨询',
    lastMessage: '我上传的小票照片有些反光看不清，怎么补传高清背卡实拍？',
    lastTime: '14:35',
    unreadCount: 0,
    status: 'waiting',
    tag: '凭证补传',
    tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
];

const INITIAL_MERCHANT_NOTIFS: MerchantNotificationItem[] = [
  {
    id: 'MNOTIF-01',
    merchantMid: 'MER-1004',
    merchantName: '顺达环球卡券',
    category: '异常提醒',
    title: '【处理超时预警】订单 KD-20261005-9650 需在 2 分钟内出具碰卡 API 调阅 Log',
    content: '出卡用户发起了碰卡争议申诉，请尽快提交 Steam 官方兑换时间戳，逾期将自动认定质证失败并先期清算。',
    status: '已读',
    sentTime: '14:30:10',
    deliveredTime: '14:30:12',
    readTime: '14:31:05',
    senderAgent: '客服-小李 (AG-108)'
  },
  {
    id: 'MNOTIF-02',
    merchantMid: 'MER-1001',
    merchantName: '极客卡业 (美区专线)',
    category: '异常提醒',
    title: '【VIP加急催办】VIP订单 KD-20261005-9921 已等待 45 秒',
    content: '大客户 $500 Apple 实体卡已通过 Card Check 官方验证，请优先打款并提交水单。',
    status: '已送达',
    sentTime: '14:50:00',
    deliveredTime: '14:50:02',
    senderAgent: '客服-小张 (AG-102)'
  },
  {
    id: 'MNOTIF-03',
    merchantMid: 'MER-1008',
    merchantName: '万通鼎盛数码',
    category: '业务通知',
    title: '【调账通知】已核准卡单差异退款 15.50 USDT',
    content: '账单编号 RECON-DIFF-99201 财务冲正手续已办理完毕，请在资金账户管理面板查验。',
    status: '已读',
    sentTime: '13:15:00',
    deliveredTime: '13:15:02',
    readTime: '13:20:45',
    senderAgent: '财务结算组'
  }
];

export const OnlineServiceView: React.FC<OnlineServiceViewProps> = ({ onNavigate }) => {
  const [chats, setChats] = useState<OnlineChatSession[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<string>('CHAT-01');
  const [activeTab, setActiveTab] = useState<'waiting' | 'active' | 'closed'>('waiting');
  const [inputMsg, setInputMsg] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 快捷回复与抽屉
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  // 转接与结束会话模态框
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState('senior_risk');
  const [transferReason, setTransferReason] = useState('');
  const [isCloseSessionModalOpen, setIsCloseSessionModalOpen] = useState(false);
  const [sessionConclusion, setSessionConclusion] = useState('resolved');
  const [sessionNote, setSessionNote] = useState('');

  // 7.4 商户消息列表与模态框
  const [merchantNotifs, setMerchantNotifs] = useState<MerchantNotificationItem[]>(INITIAL_MERCHANT_NOTIFS);
  const [showMerchantMsgModal, setShowMerchantMsgModal] = useState(false);
  const [newNotifCategory, setNewNotifCategory] = useState<'异常提醒' | '运营通知' | '业务通知'>('异常提醒');
  const [newNotifMerchant, setNewNotifMerchant] = useState('MER-1001');
  const [newNotifTitle, setNewNotifTitle] = useState('');
  const [newNotifContent, setNewNotifContent] = useState('');

  // 7.3 用户上下文右侧编辑标签与编辑备注
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [tempNoteText, setTempNoteText] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [showAddTagModal, setShowAddTagModal] = useState(false);

  // 消息体状态记录 (包含 7.2 的发送/送达/已读状态)
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
    'CHAT-01': [
      {
        id: 'M1',
        sender: 'user',
        text: '你好，我刚刚在平台提交了一笔 Apple Gift Card $500 的卡单。',
        time: '14:49:10',
      },
      {
        id: 'M2',
        sender: 'agent',
        text: '您好！平台业务实时客服为您服务。正在为您调阅该卡单【KD-20261005-9921】的实时核销状态，请稍候。',
        time: '14:49:45',
        deliveryStatus: 'read',
        deliveredTime: '14:49:46',
        readTime: '14:49:50'
      },
      {
        id: 'M3',
        sender: 'system',
        text: '客服已调取关联卡单：Apple Gift Card US $500.00，Card Check 官方校验一致，商户极客卡业已认领。',
        time: '14:50:00',
        orderCard: {
          orderCode: 'KD-20261005-9921',
          cardType: 'Apple Gift Card US',
          faceValue: '$500.00',
          status: '即将超时 (商户处理中)',
          checkResult: '有效余额 $500.00',
        },
      },
      {
        id: 'M4',
        sender: 'agent',
        text: '系统查验显示：该卡片官方状态完全正常，目前正在承接商户终审核销节点。已为您触发系统【VIP加急催办】，预计 1 分钟内完成放款结清！',
        time: '14:50:20',
        deliveryStatus: 'read',
        deliveredTime: '14:50:21',
        readTime: '14:51:02'
      },
      {
        id: 'M5',
        sender: 'user',
        text: '请问我的 $500 Apple 充值卡怎么还在处理中？什么时候能完成放款？',
        time: '14:52:05',
      },
    ],
    'CHAT-02': [
      {
        id: 'M2-1',
        sender: 'user',
        text: '这批 Steam $100 卡密提示已在其他账号兑换，已上传官方碰卡截图存证！',
        time: '14:48:00',
      },
      {
        id: 'M2-2',
        sender: 'agent',
        text: '您好，平台仲裁专席已收到您的凭证，正在调阅官方 API 的兑换时间戳，请稍候。',
        time: '14:48:30',
        deliveryStatus: 'delivered',
        deliveredTime: '14:48:31'
      }
    ],
    'CHAT-03': [
      {
        id: 'M3-1',
        sender: 'user',
        text: '我上传的小票照片有些反光看不清，怎么补传高清背卡实拍？',
        time: '14:35:00',
      },
    ],
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];
  const activeMessages = messages[activeChatId] || [];

  // 7.2 发送消息 (初始化状态为 sent ➔ 自动模拟送达 delivered ➔ 可点击/自动模拟 read)
  const handleSendMessage = () => {
    if (!inputMsg.trim()) return;
    const msgId = `M-${Date.now()}`;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    const newMsg: ChatMessage = {
      id: msgId,
      sender: 'agent',
      text: inputMsg.trim(),
      time: nowStr,
      deliveryStatus: 'sent',
    };

    setMessages(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMsg],
    }));
    setInputMsg('');

    // 1秒后自动触发已送达
    setTimeout(() => {
      setMessages(prev => {
        const curList = prev[activeChatId] || [];
        return {
          ...prev,
          [activeChatId]: curList.map(m => m.id === msgId ? { ...m, deliveryStatus: 'delivered', deliveredTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : m)
        };
      });
    }, 1200);
  };

  // 7.2 消息撤回
  const handleRecallMessage = (msgId: string) => {
    setMessages(prev => {
      const curList = prev[activeChatId] || [];
      return {
        ...prev,
        [activeChatId]: curList.map(m => m.id === msgId ? {
          ...m,
          deliveryStatus: 'recalled',
          recallTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        } : m)
      };
    });
    showToast('客服已成功撤回该条消息 (状态更新为: 已撤回)');
  };

  // 7.2 模拟用户已读
  const handleSimulateRead = (msgId: string) => {
    setMessages(prev => {
      const curList = prev[activeChatId] || [];
      return {
        ...prev,
        [activeChatId]: curList.map(m => m.id === msgId ? {
          ...m,
          deliveryStatus: 'read',
          readTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        } : m)
      };
    });
    showToast('已确认用户终端已接收并阅读该消息 (状态更新为: 已读)');
  };

  // 7.3 保存用户备注
  const handleSaveUserNote = () => {
    if (!tempNoteText.trim()) return;
    const nowTime = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newNoteLog = {
      time: nowTime,
      agent: activeChat.assignedAgent.split(' ')[0],
      text: tempNoteText.trim()
    };

    setChats(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          user: {
            ...c.user,
            userNote: tempNoteText.trim(),
            noteLogs: [newNoteLog, ...c.user.noteLogs]
          }
        };
      }
      return c;
    }));
    setIsEditingNote(false);
    showToast('用户备注修改成功，操作已存档于客服日志中！');
  };

  // 7.3 添加用户标签
  const handleAddUserTag = () => {
    if (!newTagInput.trim()) return;
    const tag = newTagInput.trim();
    setChats(prev => prev.map(c => {
      if (c.id === activeChatId && !c.user.userTags.includes(tag)) {
        return {
          ...c,
          user: { ...c.user, userTags: [...c.user.userTags, tag] }
        };
      }
      return c;
    }));
    setNewTagInput('');
    setShowAddTagModal(false);
    showToast(`成功添加用户特征标签 [${tag}]`);
  };

  // 7.4 发送平台商户消息
  const handleSendMerchantNotification = () => {
    if (!newNotifTitle.trim() || !newNotifContent.trim()) {
      showToast('请输入完整的通知标题与通知内容');
      return;
    }
    const mName = newNotifMerchant === 'MER-1001' ? '极客卡业 (美区专线)' : newNotifMerchant === 'MER-1004' ? '顺达环球卡券' : '万通鼎盛数码';
    const sentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newNotif: MerchantNotificationItem = {
      id: `MNOTIF-${Date.now()}`,
      merchantMid: newNotifMerchant,
      merchantName: mName,
      category: newNotifCategory,
      title: newNotifTitle.trim(),
      content: newNotifContent.trim(),
      status: '已发送',
      sentTime: sentTimeStr,
      senderAgent: activeChat.assignedAgent
    };

    setMerchantNotifs(prev => [newNotif, ...prev]);
    setShowMerchantMsgModal(false);
    setNewNotifTitle('');
    setNewNotifContent('');
    showToast(`平台${newNotifCategory}已发送至商户 [${mName}]，底层进入状态追查 (已发送 ➔ 送达 ➔ 已读)！`);

    // 自动模拟 2 秒后送达, 5 秒后已读
    setTimeout(() => {
      setMerchantNotifs(prev => prev.map(n => n.id === newNotif.id ? {
        ...n,
        status: '已送达',
        deliveredTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } : n));
    }, 2000);

    setTimeout(() => {
      setMerchantNotifs(prev => prev.map(n => n.id === newNotif.id ? {
        ...n,
        status: '已读',
        readTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } : n));
    }, 5500);
  };

  // 插入关联卡单信息到会话
  const handleInsertOrderToChat = (orderCode: string) => {
    const targetOrder = activeChat.associatedOrders.find(o => o.orderCode === orderCode);
    if (!targetOrder) return;
    const sysMsg: ChatMessage = {
      id: `SYS-${Date.now()}`,
      sender: 'system',
      text: `客服已共享订单实时状态卡片：${targetOrder.orderCode} (${targetOrder.cardType})`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      orderCard: {
        orderCode: targetOrder.orderCode,
        cardType: targetOrder.cardType,
        faceValue: targetOrder.faceValue,
        status: targetOrder.status,
        checkResult: targetOrder.cardCheckStatus,
      },
    };
    setMessages(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), sysMsg],
    }));
    showToast(`已将卡单 [${orderCode}] 的实时校验卡片插入到会话中！`);
  };

  const QUICK_REPLIES = [
    {
      category: '放款时效',
      replies: [
        '您好！平台大额卡单平均核销时效为 30~60 秒，目前正在商户最后核销验真环节，已为您标记 VIP 加急处理，请稍候片刻。',
        '您好，系统已通过 Card Check 官方验证，正在进行链上批量放款，打款完成后资金将直接进入您的账户余额。',
      ],
    },
    {
      category: '凭证补传',
      replies: [
        '您好！由于您上传的卡图存在反光，请您在出卡记录中点击【补传卡图】，将卡片背面平放在深色背景下、关闭闪光灯重新拍照上传。',
        '您好，由于面额存在轻微差异，请您核对并确认是否同意按官方查验实际面额结算放款？',
      ],
    },
    {
      category: '费率规则',
      replies: [
        '您好！平台自身不收取任何出金中介费，提现扣除的 1 USDT 属于区块链 TRC20 网络矿工费，全网统一标准，请您理解。',
        '您好！当前卡种报价根据全网商户竞价实时浮动，平台严格保障成交时锁定折率不打折。',
      ],
    },
  ];

  const handleConfirmTransfer = () => {
    showToast(`当前会话已成功转接至【${transferTarget === 'senior_risk' ? '高级风控专席' : transferTarget === 'merchant_ops' ? '商户调度专员' : '财务结算组'}】！`);
    setIsTransferModalOpen(false);
  };

  const handleConfirmCloseSession = () => {
    setChats(prev =>
      prev.map(c => (c.id === activeChatId ? { ...c, status: 'closed' } : c))
    );
    showToast(`会话 [${activeChat.conversationId}] 已服务总结归档，记录已写入用户历史档案！`);
    setIsCloseSessionModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 flex-1 w-full max-w-[1600px] mx-auto antialiased text-slate-800 pb-16 text-xs">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-16 right-8 z-50 bg-slate-900/95 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
          <span className="font-medium">{toastMsg}</span>
        </div>
      )}

      {/* 顶栏：7.1 在线客服定位 & 7.4 商户消息发送入口 */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[22px]">support_agent</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">工作台 · 在线客服</h1>
              <span className="text-[10.5px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                坐席实时接入
              </span>
              <span className="text-[10.5px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold">
                PRD 7.1/7.2/7.3/7.4 底层全强化
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              统一处理平台与用户之间的业务咨询和交易问题，强关联 Conversation ID 与业务上下文；底层打通商户消息发送与【发送➔送达➔已读】状态流转。
            </p>
          </div>
        </div>

        {/* 7.4 商户消息发送与追踪入口 */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowMerchantMsgModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">campaign</span>
            <span>发送商户消息 (含送达/已读追踪)</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('my-messages')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">mail</span>
            <span>消息中心</span>
          </button>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* 核心工作台三栏布局 (左: 3/12 会话列表 / 中: 6/12 对话与 7.1 关联条 / 右: 3/12 7.3 用户上下文) */}
      {/* ============================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[780px]">
        
        {/* ==================== 左栏 (3/12)：会话列表 ==================== */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex flex-col overflow-hidden">
          {/* PRD 标准 Tab: 待回复 / 会话中 / 已结束 */}
          <div className="p-2.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold w-full">
              {[
                { id: 'waiting', label: '待回复', count: chats.filter(c => (c.unreadCount > 0 || c.status === 'waiting') && c.status !== 'closed').length, badgeColor: 'bg-rose-500 text-white' },
                { id: 'active', label: '会话中', count: chats.filter(c => c.status === 'active' && c.unreadCount === 0).length, badgeColor: 'bg-emerald-600 text-white' },
                { id: 'closed', label: '已结束', count: chats.filter(c => c.status === 'closed').length, badgeColor: 'bg-slate-300 text-slate-700' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-1 rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold font-mono ${
                    activeTab === tab.id ? tab.badgeColor : 'bg-slate-200 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 会话列表 */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {chats
              .filter(c => {
                if (activeTab === 'closed') return c.status === 'closed';
                if (activeTab === 'waiting') return (c.unreadCount > 0 || c.status === 'waiting') && c.status !== 'closed';
                return c.status === 'active' && c.unreadCount === 0;
              })
              .map(chat => {
                const isSelected = chat.id === activeChatId;
                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setActiveChatId(chat.id);
                      setTempNoteText(chat.user.userNote);
                    }}
                    className={`p-3 transition-colors cursor-pointer flex flex-col gap-1.5 ${
                      isSelected ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-full text-white text-[11px] font-bold flex items-center justify-center shrink-0 ${chat.user.avatarBg}`}
                        >
                          {chat.user.name.slice(0, 1)}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {chat.user.name}
                            </span>
                            <span className="text-[9px] px-1 rounded bg-slate-100 font-medium text-slate-600">
                              {chat.user.type}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{chat.conversationId}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{chat.lastTime}</span>
                    </div>

                    <p className="text-[11.5px] text-slate-600 line-clamp-1 pl-9">
                      {chat.lastMessage}
                    </p>

                    <div className="flex items-center justify-between pl-9 pt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${chat.tagColor}`}>
                        {chat.tag}
                      </span>
                      {chat.unreadCount > 0 && (
                        <span className="font-mono text-[10px] bg-rose-600 text-white font-bold w-4 h-4 rounded-full flex items-center justify-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* ==================== 中栏 (6/12)：当前会话聊天区 + 7.1 会话绑定条 + 7.2 消息送达状态 ==================== */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex flex-col overflow-hidden">
          {/* 会话顶部：7.1 结构化 Conversation ID 及六要素卡片 */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center ${activeChat.user.avatarBg}`}
                >
                  {activeChat.user.name.slice(0, 1)}
                </span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{activeChat.user.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-medium">
                      {activeChat.user.kycLevel}
                    </span>
                    <span className="text-[10px] text-slate-500">归属坐席: <strong>{activeChat.assignedAgent}</strong></span>
                  </div>
                </div>
              </div>

              {/* 会话控制 */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px] text-slate-500">sync_alt</span>
                  <span>转接</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCloseSessionModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">check_circle</span>
                  <span>结束会话</span>
                </button>
              </div>
            </div>

            {/* 7.1 会话显式关联六要素 (Conversation ID / User ID / Order ID / Card ID / Task ID / 来源) */}
            <div className="p-2 bg-white rounded-lg border border-slate-200 text-[10.5px] font-mono grid grid-cols-2 md:grid-cols-3 gap-1.5 shadow-2xs">
              <div className="flex items-center gap-1 text-slate-600">
                <span className="text-slate-400">Conversation ID:</span>
                <strong className="text-blue-700 bg-blue-50 px-1 rounded">{activeChat.conversationId}</strong>
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <span className="text-slate-400">User ID:</span>
                <strong className="text-slate-900">{activeChat.userId}</strong>
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <span className="text-slate-400">Order ID:</span>
                <strong className="text-indigo-700">{activeChat.orderId}</strong>
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <span className="text-slate-400">Card ID:</span>
                <strong className="text-slate-800">{activeChat.cardId}</strong>
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <span className="text-slate-400">Task ID:</span>
                <strong className="text-emerald-700">{activeChat.taskId}</strong>
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <span className="text-slate-400">会话来源:</span>
                <strong className="text-slate-800 font-sans">{activeChat.source}</strong>
              </div>
            </div>
          </div>

          {/* 对话消息流与 7.2 消息状态显示 */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f8fafc]">
            {activeMessages.map(msg => {
              if (msg.sender === 'system') {
                return (
                  <div key={msg.id} className="flex flex-col items-center gap-2 my-2">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-full">
                      {msg.time}
                    </span>
                    {msg.orderCard && (
                      <div className="w-full max-w-md bg-white border border-blue-200 rounded-xl p-3 shadow-xs">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                          <span className="font-mono font-bold text-blue-700 text-xs">
                            {msg.orderCard.orderCode}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 font-bold">
                            {msg.orderCard.status}
                          </span>
                        </div>
                        <div className="mt-2 text-xs flex justify-between items-center">
                          <span className="font-bold text-slate-900">
                            {msg.orderCard.cardType} {msg.orderCard.faceValue}
                          </span>
                          <span className="text-[11px] text-emerald-600 font-semibold">
                            {msg.orderCard.checkResult}
                          </span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-100 flex justify-end">
                          <button
                            type="button"
                            onClick={() => onNavigate('workbench-cs-orders')}
                            className="text-[11px] text-blue-600 hover:underline font-semibold flex items-center gap-0.5"
                          >
                            <span>在卡单作业池查看</span>
                            <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              const isAgent = msg.sender === 'agent';
              const isRecalled = msg.deliveryStatus === 'recalled';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'} group relative`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5 font-mono">
                    <span>{isAgent ? activeChat.assignedAgent.split(' ')[0] : activeChat.user.name}</span>
                    <span>{msg.time}</span>
                  </div>

                  {/* 消息气泡内容 */}
                  {isRecalled ? (
                    <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 italic text-[11px] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">history</span>
                      <span>该条消息已被客服撤回 ({msg.recallTime || msg.time})</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end gap-1 max-w-[85%]">
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                          isAgent
                            ? 'bg-blue-600 text-white rounded-tr-xs'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>

                      {/* 7.2 客服消息送达与已读状态徽章 (发送中 / 已发送 / 已送达 / 已读) */}
                      {isAgent && (
                        <div className="flex items-center gap-1.5 text-[10px] font-mono shrink-0">
                          {msg.deliveryStatus === 'sending' && (
                            <span className="text-slate-400 flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[12px] animate-spin">progress_activity</span>
                              发送中...
                            </span>
                          )}
                          {msg.deliveryStatus === 'sent' && (
                            <span className="text-slate-400 flex items-center gap-0.5" title="消息已提交发送">
                              <span className="material-symbols-outlined text-[12px]">check</span>
                              已发送
                            </span>
                          )}
                          {msg.deliveryStatus === 'delivered' && (
                            <span className="text-emerald-600 font-semibold flex items-center gap-0.5" title="终端已送达">
                              <span className="material-symbols-outlined text-[12px]">done_all</span>
                              已送达 ({msg.deliveredTime || msg.time})
                            </span>
                          )}
                          {msg.deliveryStatus === 'read' && (
                            <span className="text-blue-600 font-bold flex items-center gap-0.5" title="用户已阅读此消息">
                              <span className="material-symbols-outlined text-[13px]">done_all</span>
                              已读 ({msg.readTime || '14:51'})
                            </span>
                          )}

                          {/* 操作悬浮菜单 (撤回 / 模拟已读) */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 ml-2 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                            {msg.deliveryStatus === 'delivered' && (
                              <button
                                type="button"
                                onClick={() => handleSimulateRead(msg.id)}
                                className="text-blue-600 hover:underline font-bold text-[10px] cursor-pointer"
                              >
                                确认用户已读
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRecallMessage(msg.id)}
                              className="text-rose-600 hover:underline font-semibold text-[10px] cursor-pointer"
                            >
                              撤回消息
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 快捷回复面板 (抽屉) */}
          {showQuickReplies && (
            <div className="p-3 border-t border-slate-200 bg-slate-50 animate-in slide-in-from-bottom-2 max-h-48 overflow-y-auto">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                <span className="font-bold text-xs text-slate-900">平台业务标准快捷回复话术</span>
                <button
                  onClick={() => setShowQuickReplies(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
              <div className="space-y-2">
                {QUICK_REPLIES.map((group, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{group.category}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {group.replies.map((reply, rIdx) => (
                        <button
                          key={rIdx}
                          type="button"
                          onClick={() => {
                            setInputMsg(reply);
                            setShowQuickReplies(false);
                          }}
                          className="text-left text-[11px] p-2 bg-white rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-700 line-clamp-1"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 底部输入框与工具栏 */}
          <div className="p-3 border-t border-slate-200 bg-white flex flex-col gap-2">
            <div className="flex items-center justify-between text-slate-500">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickReplies(!showQuickReplies)}
                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px] text-blue-600">bolt</span>
                  <span>快捷回复</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertOrderToChat(activeChat.associatedOrders[0]?.orderCode)}
                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px] text-emerald-600">credit_card</span>
                  <span>发送卡单卡片</span>
                </button>
              </div>
              <span className="text-[10.5px] text-slate-400 font-mono">按 Enter 发送</span>
            </div>

            <div className="flex items-center gap-2">
              <textarea
                rows={2}
                value={inputMsg}
                onChange={e => setInputMsg(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="请输入回复内容，解答用户关于卡单状态、放款时效或凭证的问题..."
                className="w-full p-2 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none"
              />
              <button
                type="button"
                onClick={handleSendMessage}
                className="px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs cursor-pointer shrink-0"
              >
                发送消息
              </button>
            </div>
          </div>
        </div>

        {/* ==================== 右栏 (3/12)：PRD 7.3 全量用户上下文 ==================== */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 flex flex-col gap-3.5 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
              <span className="material-symbols-outlined text-[18px] text-blue-600">account_box</span>
              <span>7.3 用户全景上下文</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">单页沉淀免跳转</span>
          </div>

          {/* 1. 用户基本信息 */}
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/70 text-xs flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">{activeChat.user.name}</span>
              <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1 rounded">{activeChat.user.id}</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 pt-1 border-t border-slate-200/50">
              <div>类别: <strong className="text-slate-800">{activeChat.user.type}</strong></div>
              <div>KYC: <span className="text-emerald-700 font-semibold">{activeChat.user.kycLevel}</span></div>
              <div>联系: <span className="font-mono text-slate-700">{activeChat.user.phoneOrEmail}</span></div>
              <div>注册: <span className="font-mono text-slate-700">{activeChat.user.registeredDate}</span></div>
              <div>归属客服: <span className="text-slate-800 font-semibold">{activeChat.assignedAgent.split(' ')[0]}</span></div>
              <div>信用分: <strong className="text-emerald-600">{activeChat.user.creditScore} 分</strong></div>
            </div>
          </div>

          {/* 2. 用户标签 (支持快捷新增) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] text-slate-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-indigo-600">sell</span>
                用户特征标签
              </span>
              <button
                type="button"
                onClick={() => setShowAddTagModal(true)}
                className="text-[10px] text-blue-600 hover:underline font-semibold"
              >
                + 添加标签
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {activeChat.user.userTags.map((tag, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-semibold">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 3. 风险标签 (LOW/MEDIUM/HIGH/BLOCK) */}
          <div className="p-2 bg-rose-50/60 border border-rose-200/80 rounded-lg flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] text-rose-900 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-rose-600">security</span>
                风险画像评估
              </span>
              <span className={`text-[10px] px-2 py-0.2 rounded font-bold ${
                activeChat.user.riskLevel === 'LOW' ? 'bg-emerald-100 text-emerald-800' :
                activeChat.user.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {activeChat.user.riskLevel} 等级
              </span>
            </div>
            <div className="flex flex-wrap gap-1 pt-1">
              {activeChat.user.riskTags.map((rtag, i) => (
                <span key={i} className="px-1.5 py-0.2 rounded bg-white text-rose-700 border border-rose-200 text-[10px] font-medium">
                  ⚠️ {rtag}
                </span>
              ))}
            </div>
          </div>

          {/* 4. 当前异常订单 (置顶高亮) */}
          {activeChat.associatedOrders.some(o => o.isAbnormal) && (
            <div className="p-2.5 bg-rose-50 border-2 border-rose-300 rounded-lg flex flex-col gap-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-900 text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-rose-600">warning</span>
                  当前异常订单 (高亮)
                </span>
                <span className="text-[9.5px] bg-rose-600 text-white font-bold px-1.5 py-0.2 rounded">需客服介入</span>
              </div>
              {activeChat.associatedOrders.filter(o => o.isAbnormal).map((abO, i) => (
                <div key={i} className="bg-white p-2 rounded border border-rose-200 text-[11px] space-y-1">
                  <div className="flex justify-between font-mono font-bold text-slate-900">
                    <span>{abO.orderCode}</span>
                    <span className="text-rose-700">{abO.faceValue}</span>
                  </div>
                  <div className="text-[10.5px] text-slate-700">{abO.abnormalReason}</div>
                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleInsertOrderToChat(abO.orderCode)}
                      className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px]"
                    >
                      发送卡单状态卡片
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 5. 最近订单列表 */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] text-slate-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-emerald-600">receipt_long</span>
                最近关联订单 ({activeChat.associatedOrders.length})
              </span>
            </div>
            <div className="space-y-1.5">
              {activeChat.associatedOrders.map((order, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded border border-slate-200 bg-slate-50/70 text-[11px] flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-700">{order.orderCode}</span>
                    <span className={`text-[9.5px] px-1.5 py-0.2 rounded font-semibold ${order.statusColor}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium text-slate-800">
                    <span>{order.countryFlag} {order.cardType}</span>
                    <span className="font-mono font-bold">{order.faceValue}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">{order.submitTime} · {order.merchantName}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. 售后与争议记录 */}
          <div className="flex flex-col gap-1.5">
            <span className="font-bold text-[11px] text-slate-700 flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-purple-600">gavel</span>
              历史售后与争议记录 ({activeChat.aftersaleRecords.length})
            </span>
            {activeChat.aftersaleRecords.length === 0 ? (
              <span className="text-[10.5px] text-slate-400 italic">暂无历史售后争议起诉</span>
            ) : (
              activeChat.aftersaleRecords.map((af, i) => (
                <div key={i} className="p-2 bg-purple-50/50 border border-purple-200 rounded text-[10.5px] space-y-1">
                  <div className="flex justify-between font-mono font-bold text-purple-900">
                    <span>{af.disputeId}</span>
                    <span className="text-purple-700">{af.status}</span>
                  </div>
                  <div className="text-slate-700">{af.type} · 结论: {af.result}</div>
                  <div className="text-slate-400 font-mono text-[9.5px]">{af.time}</div>
                </div>
              ))
            )}
          </div>

          {/* 7. 用户备注 (包含可编辑文本框与历史日志) */}
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] text-slate-800 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-amber-600">edit_note</span>
                客服专属用户备注
              </span>
              <button
                type="button"
                onClick={() => setIsEditingNote(!isEditingNote)}
                className="text-[10px] text-blue-600 font-semibold hover:underline"
              >
                {isEditingNote ? '取消修改' : '编辑备注'}
              </button>
            </div>

            {isEditingNote ? (
              <div className="space-y-1.5">
                <textarea
                  rows={3}
                  value={tempNoteText}
                  onChange={e => setTempNoteText(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
                />
                <button
                  type="button"
                  onClick={handleSaveUserNote}
                  className="w-full py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs"
                >
                  保存用户备注
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-slate-700 leading-relaxed bg-white p-2 rounded border border-slate-200/80">
                {activeChat.user.userNote || '暂无客服备注'}
              </p>
            )}

            {/* 备注审计日志 */}
            <div className="pt-1 border-t border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 block font-semibold">历史客服备注记录:</span>
              {activeChat.user.noteLogs.map((log, i) => (
                <div key={i} className="text-[10px] text-slate-600 flex justify-between gap-1">
                  <span>[{log.agent}] {log.text}</span>
                  <span className="text-slate-400 font-mono shrink-0">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* 7.4 发送商户消息模态框 (包含 发送 ➔ 送达 ➔ 已读 实时链路追踪) */}
      {/* ============================================================================ */}
      {showMerchantMsgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-5 flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-xl">campaign</span>
                <span className="font-bold text-sm text-slate-900">发送平台商户通知 (PRD 7.4 送达/已读追踪)</span>
              </div>
              <button onClick={() => setShowMerchantMsgModal(false)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900 text-[11px] leading-relaxed">
              <strong>7.4 商户消息机制保障：</strong>平台发送异常提醒、运营通知、业务通知后，底层自动保存并打上【发送 ➔ 送达 ➔ 已读】时间戳，不再依赖“客服口头通知商户”。
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">目标商户</label>
                  <select
                    value={newNotifMerchant}
                    onChange={e => setNewNotifMerchant(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="MER-1001">极客卡业 (美区专线 - MID-1001)</option>
                    <option value="MER-1004">顺达环球卡券 (MID-1004)</option>
                    <option value="MER-1008">万通鼎盛数码 (MID-1008)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">消息类别</label>
                  <select
                    value={newNotifCategory}
                    onChange={e => setNewNotifCategory(e.target.value as any)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="异常提醒">异常提醒 (质押预警/超时催办/碰卡质证)</option>
                    <option value="运营通知">运营通知 (大额SKU叫牌/活动邀约)</option>
                    <option value="业务通知">业务通知 (调账回执/规程调整)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">通知标题</label>
                <input
                  type="text"
                  value={newNotifTitle}
                  onChange={e => setNewNotifTitle(e.target.value)}
                  placeholder="如：【处理超时预警】订单 KD-20261005-9650 请在 2 分钟内出具 API Log"
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">通知正文</label>
                <textarea
                  rows={3}
                  value={newNotifContent}
                  onChange={e => setNewNotifContent(e.target.value)}
                  placeholder="详细说明通知内容，该内容将直接推送至商户收卡作业端并计入系统审计日志..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              {/* 已发历史商户通知状态追查表 */}
              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-900 block text-[11.5px]">全网商户消息发送与【送达 ➔ 已读】状态追踪表:</span>
                <div className="max-h-36 overflow-y-auto space-y-1.5">
                  {merchantNotifs.map(notif => (
                    <div key={notif.id} className="p-2 bg-slate-50 border border-slate-200 rounded text-[10.5px] flex items-center justify-between gap-2">
                      <div className="min-w-0 flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{notif.merchantName}</span>
                          <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                            {notif.category}
                          </span>
                          <span className="text-slate-500 truncate">{notif.title}</span>
                        </div>
                        <div className="text-slate-400 font-mono text-[9.5px]">
                          发送: {notif.sentTime} {notif.deliveredTime && `| 送达: ${notif.deliveredTime}`} {notif.readTime && `| 商户已读: ${notif.readTime}`}
                        </div>
                      </div>

                      {/* 状态徽章 */}
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] shrink-0 ${
                        notif.status === '已读' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        notif.status === '已送达' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {notif.status === '已读' ? '✅ 已读' : notif.status === '已送达' ? '📫 已送达' : '⏳ 发送中'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowMerchantMsgModal(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-medium"
              >
                关闭
              </button>
              <button
                type="button"
                onClick={handleSendMerchantNotification}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                发送通知并追查状态
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 新增用户特征标签模态框 */}
      {/* ============================================================================ */}
      {showAddTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xs p-4 flex flex-col gap-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900">添加用户特征标签</span>
              <button onClick={() => setShowAddTagModal(false)} className="text-slate-400">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            <div>
              <label className="text-slate-600 block mb-1 font-medium">标签名称</label>
              <input
                type="text"
                value={newTagInput}
                onChange={e => setNewTagInput(e.target.value)}
                placeholder="例如：大额卖家 / 美区专场"
                className="w-full p-2 border border-slate-200 rounded text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddTagModal(false)}
                className="px-3 py-1 rounded border border-slate-200 text-slate-600"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleAddUserTag}
                className="px-3.5 py-1 rounded bg-blue-600 text-white font-semibold"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 转接与结束会话模态框保持不变 */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900">转接当前平台客服会话</span>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-slate-600 block mb-1 font-medium">转接目标专业组</label>
                <select
                  value={transferTarget}
                  onChange={e => setTransferTarget(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="senior_risk">高级风控审核专席 (异地高频/撞库)</option>
                  <option value="merchant_ops">商户调度专员 (商户停滞/改派)</option>
                  <option value="finance">财务结算专员 (出金延时/提现审核)</option>
                  <option value="dispute_arbitration">售后争议仲裁组 (碰卡裁决)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-medium">转接说明 (带入交接记录)</label>
                <textarea
                  rows={3}
                  value={transferReason}
                  onChange={e => setTransferReason(e.target.value)}
                  placeholder="请输入转接背景说明..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmTransfer}
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold"
              >
                确认转接
              </button>
            </div>
          </div>
        </div>
      )}

      {isCloseSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900">结束本次会话并沉淀归档</span>
              <button onClick={() => setIsCloseSessionModalOpen(false)} className="text-slate-400">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-slate-600 block mb-1 font-medium">会话解决结论</label>
                <select
                  value={sessionConclusion}
                  onChange={e => setSessionConclusion(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="resolved">已圆满解决 (卡单已加急结清)</option>
                  <option value="need_follow">需继续跟进 (等待商户处理回执)</option>
                  <option value="dispute_filed">已立案售后争议仲裁</option>
                  <option value="consult_only">常规业务与规则答疑完毕</option>
                </select>
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-medium">服务总结摘要备注</label>
                <textarea
                  rows={3}
                  value={sessionNote}
                  onChange={e => setSessionNote(e.target.value)}
                  placeholder="例如：已向客户确认 Apple $500 卡密无误，触发 VIP 加急催办，客户表示认可。"
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCloseSessionModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmCloseSession}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold"
              >
                保存并沉淀会话记录
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
