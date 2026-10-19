import React, { useMemo, useState } from 'react';
import { UserItem } from '../types';

const TRADE_STATUSES = [
  '待商户接卡',
  '待商户处理',
  '售后中',
  '商户提交异常',
  '失败待审核',
  '处理成功',
  '处理失败',
  '无商户接卡',
  '已撤回·待处理'
] as const;

type TradeStatus = typeof TRADE_STATUSES[number];

type TradeRow = {
  orderNo: string;
  cardName: string;
  country: string;
  faceValueQuantity: string;
  quote: string;
  totalAmount: string;
  reward: string;
  settlementTotal: string;
  orderTime: string;
  status: TradeStatus;
};

type WalletStatus = '成功' | '失败' | '进行中';

type WalletLedgerRow = {
  orderId: string;
  businessType: '提现' | '转账';
  withdrawNaira: string;
  withdrawCny: string;
  serviceFeeNaira: string;
  fiatRate: string;
  balanceBefore: string;
  balanceAfter: string;
  initiatedAt: string;
  completedAt: string;
  status: WalletStatus;
  note?: string;
};

const getCardName = (card: string) => {
  if (/apple/i.test(card)) return '苹果卡';
  if (/steam/i.test(card)) return 'Steam卡';
  if (/vanilla/i.test(card)) return 'Vanilla Visa卡';
  if (/amazon/i.test(card)) return '亚马逊卡';
  if (/razor|razer/i.test(card)) return 'Razer Gold卡';
  return card.split(/\s+\$|\s+£/)[0] || '礼品卡';
};

const getStatus = (status: string, index: number): TradeStatus => {
  if ((TRADE_STATUSES as readonly string[]).includes(status)) return status as TradeStatus;
  if (/冻结|争议|售后/i.test(status)) return '售后中';
  if (/处理中|匹配中/i.test(status)) return index % 2 === 0 ? '待商户接卡' : '待商户处理';
  if (/失败|异常/i.test(status)) return '处理失败';
  return '处理成功';
};

const getOrderTime = (time: string, index: number) => {
  if (/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/.test(time)) return time;
  const fallback = [
    '2026/10/15 09:44:24',
    '2026/10/14 18:40:00',
    '2026/10/13 16:15:00',
    '2026/10/12 11:20:00'
  ];
  return fallback[index] || `2026/10/${String(Math.max(1, 15 - index)).padStart(2, '0')} 10:00:00`;
};

const toSortableTime = (time: string) => {
  const parsed = new Date(time.replaceAll('/', '-')).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const toDateInput = (time: string) => time.slice(0, 10).replaceAll('/', '-');

const getStatusClass = (status: TradeStatus) => {
  if (status === '处理成功') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === '处理失败' || status === '商户提交异常') return 'bg-rose-50 text-rose-700 border-rose-200';
  if (status === '售后中' || status === '失败待审核') return 'bg-amber-50 text-amber-800 border-amber-200';
  return 'bg-blue-50 text-blue-700 border-blue-200';
};

interface UserDetailViewProps {
  user: UserItem;
  onBack: () => void;
  onUpdateUser: (updatedUser: UserItem) => void;
}

export const UserDetailView: React.FC<UserDetailViewProps> = ({
  user,
  onBack,
  onUpdateUser
}) => {
  const registrationMethod = user.registrationMethod || (user.email ? 'email' : 'phone');
  const maskEmail = (email: string) => {
    const [localPart, domain = ''] = email.split('@');
    const maskedLocal = localPart.length <= 2
      ? `${localPart.charAt(0)}*`
      : `${localPart.slice(0, 2)}${'*'.repeat(Math.min(5, Math.max(2, localPart.length - 2)))}`;
    return `${maskedLocal}${domain ? `@${domain}` : ''}`;
  };
  const maskPhone = (phone: string) => {
    const compact = phone.replace(/\s+/g, '');
    if (compact.length <= 7) return `${compact.slice(0, 2)}****${compact.slice(-2)}`;
    return `${compact.slice(0, 4)}****${compact.slice(-3)}`;
  };
  const maskWhatsApp = (number: string) => maskPhone(number);

  const [activeTab, setActiveTab] = useState<
    'profile' | 'trades' | 'wallet' | 'persona' | 'referral' | 'benefits' | 'aftersales' | 'risk' | 'logs'
  >('profile');

  const tradeRows = useMemo<TradeRow[]>(() => user.transactions.map((tx, index) => ({
    orderNo: tx.orderNo || tx.id,
    cardName: tx.cardName || getCardName(tx.card),
    country: tx.country || 'US美国',
    faceValueQuantity: tx.faceValueQuantity || tx.card.match(/(\d[\d,]*)\s*[×x]\s*(\d+)张/i)?.[0] || tx.card,
    quote: tx.quote || `₦${(tx.amount * 200).toFixed(4)}/¥${(tx.amount / 50).toFixed(4)}`,
    totalAmount: tx.totalAmount || `₦${(tx.amount * 200).toFixed(2)}/¥${tx.amount.toFixed(2)}`,
    reward: tx.reward || `₦${(tx.amount * 0.4).toFixed(2)}/¥${(tx.amount * 0.004).toFixed(2)}`,
    settlementTotal: tx.settlementTotal || `₦${(tx.amount * 200.4).toFixed(0)}/¥${(tx.amount * 1.004).toFixed(2)}`,
    orderTime: tx.orderTime || getOrderTime(tx.time, index),
    status: getStatus(tx.processingStatus || tx.status, index)
  })).sort((a, b) => toSortableTime(b.orderTime) - toSortableTime(a.orderTime)), [user.transactions]);

  const [tradeDraftFilters, setTradeDraftFilters] = useState({
    keyword: '',
    country: '全部',
    status: '全部',
    startDate: '',
    endDate: ''
  });
  const [tradeFilters, setTradeFilters] = useState(tradeDraftFilters);
  const [tradePage, setTradePage] = useState(1);
  const [tradePageSize, setTradePageSize] = useState(10);

  const walletRows = useMemo<WalletLedgerRow[]>(() => [
    {
      orderId: 'WD2026072003002',
      businessType: '提现',
      withdrawNaira: '₦320,000.00',
      withdrawCny: '¥1,455.21',
      serviceFeeNaira: '₦3,200.00',
      fiatRate: '219.90',
      balanceBefore: '₦1,604,600.00',
      balanceAfter: '₦1,284,600.00',
      initiatedAt: '2026/07/20 15:03:02',
      completedAt: '2026/07/20 15:05:18',
      status: '成功'
    },
    {
      orderId: 'WD2026071803017',
      businessType: '转账',
      withdrawNaira: '₦180,000.00',
      withdrawCny: '¥818.55',
      serviceFeeNaira: '₦1,800.00',
      fiatRate: '219.90',
      balanceBefore: '₦1,784,600.00',
      balanceAfter: '₦1,604,600.00',
      initiatedAt: '2026/07/18 10:21:44',
      completedAt: '2026/07/18 10:22:36',
      status: '成功',
      note: '转入用户绑定 OPay 账户'
    },
    {
      orderId: 'WD2026071603008',
      businessType: '提现',
      withdrawNaira: '₦450,000.00',
      withdrawCny: '¥2,046.39',
      serviceFeeNaira: '₦4,500.00',
      fiatRate: '219.90',
      balanceBefore: '₦2,234,600.00',
      balanceAfter: '₦1,784,600.00',
      initiatedAt: '2026/07/16 19:40:12',
      completedAt: '2026/07/16 19:43:57',
      status: '成功'
    },
    {
      orderId: 'WD2026071403021',
      businessType: '提现',
      withdrawNaira: '₦95,000.00',
      withdrawCny: '¥432.01',
      serviceFeeNaira: '₦950.00',
      fiatRate: '219.90',
      balanceBefore: '₦2,329,600.00',
      balanceAfter: '₦2,329,600.00',
      initiatedAt: '2026/07/14 08:12:06',
      completedAt: '2026/07/14 08:13:11',
      status: '失败',
      note: '收款账户校验失败，金额已原路退回'
    },
    {
      orderId: 'WD2026071203011',
      businessType: '转账',
      withdrawNaira: '₦230,000.00',
      withdrawCny: '¥1,046.84',
      serviceFeeNaira: '₦2,300.00',
      fiatRate: '219.60',
      balanceBefore: '₦2,559,600.00',
      balanceAfter: '₦2,329,600.00',
      initiatedAt: '2026/07/12 14:36:25',
      completedAt: '2026/07/12 14:37:10',
      status: '成功'
    },
    {
      orderId: 'WD2026071003004',
      businessType: '提现',
      withdrawNaira: '₦125,000.00',
      withdrawCny: '¥568.44',
      serviceFeeNaira: '₦1,250.00',
      fiatRate: '219.90',
      balanceBefore: '₦2,684,600.00',
      balanceAfter: '₦2,559,600.00',
      initiatedAt: '2026/07/10 21:05:43',
      completedAt: '—',
      status: '进行中'
    }
  ], []);

  const [walletDraftFilters, setWalletDraftFilters] = useState({ orderId: '', startDate: '', endDate: '' });
  const [walletFilters, setWalletFilters] = useState(walletDraftFilters);
  const [walletPage, setWalletPage] = useState(1);
  const [walletPageSize, setWalletPageSize] = useState(10);

  const filteredWalletRows = useMemo(() => {
    const orderId = walletFilters.orderId.trim().toLowerCase();
    return walletRows.filter(row => {
      const matchesOrderId = !orderId || row.orderId.toLowerCase().includes(orderId);
      const rowDate = toDateInput(row.initiatedAt);
      const matchesStart = !walletFilters.startDate || rowDate >= walletFilters.startDate;
      const matchesEnd = !walletFilters.endDate || rowDate <= walletFilters.endDate;
      return matchesOrderId && matchesStart && matchesEnd;
    });
  }, [walletFilters, walletRows]);

  const walletPageCount = Math.max(1, Math.ceil(filteredWalletRows.length / walletPageSize));
  const visibleWalletRows = filteredWalletRows.slice((walletPage - 1) * walletPageSize, walletPage * walletPageSize);

  const applyWalletFilters = () => {
    setWalletFilters(walletDraftFilters);
    setWalletPage(1);
  };

  const resetWalletFilters = () => {
    const resetFilters = { orderId: '', startDate: '', endDate: '' };
    setWalletDraftFilters(resetFilters);
    setWalletFilters(resetFilters);
    setWalletPage(1);
  };

  // Modals & States
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [showAdjustRateModal, setShowAdjustRateModal] = useState(false);
  const [spreadDiscount, setSpreadDiscount] = useState('+0.0200 (上浮 200 BPS)');
  const [creditLimit, setCreditLimit] = useState(user.collateral.toString());

  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponType, setCouponType] = useState('大客户出卡专属 +1.5% 加价券');
  const [couponValidDays, setCouponValidDays] = useState('7天有效');

  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [freezeReason, setFreezeReason] = useState('涉诉卡密核验排查');
  const [newOperatorWhatsApp, setNewOperatorWhatsApp] = useState('');
  const [editingOperatorWhatsAppIndex, setEditingOperatorWhatsAppIndex] = useState<number | null>(null);
  const [editingOperatorWhatsApp, setEditingOperatorWhatsApp] = useState('');

  const filteredTradeRows = useMemo(() => {
    const keyword = tradeFilters.keyword.trim().toLowerCase();
    return tradeRows.filter(row => {
      const matchesKeyword = !keyword || [row.orderNo, row.cardName, row.faceValueQuantity].some(value => value.toLowerCase().includes(keyword));
      const matchesCountry = tradeFilters.country === '全部' || row.country === tradeFilters.country;
      const matchesStatus = tradeFilters.status === '全部' || row.status === tradeFilters.status;
      const rowDate = toDateInput(row.orderTime);
      const matchesStart = !tradeFilters.startDate || rowDate >= tradeFilters.startDate;
      const matchesEnd = !tradeFilters.endDate || rowDate <= tradeFilters.endDate;
      return matchesKeyword && matchesCountry && matchesStatus && matchesStart && matchesEnd;
    });
  }, [tradeFilters, tradeRows]);

  const tradePageCount = Math.max(1, Math.ceil(filteredTradeRows.length / tradePageSize));
  const visibleTradeRows = filteredTradeRows.slice((tradePage - 1) * tradePageSize, tradePage * tradePageSize);

  const applyTradeFilters = () => {
    setTradeFilters(tradeDraftFilters);
    setTradePage(1);
  };

  const resetTradeFilters = () => {
    const resetFilters = { keyword: '', country: '全部', status: '全部', startDate: '', endDate: '' };
    setTradeDraftFilters(resetFilters);
    setTradeFilters(resetFilters);
    setTradePage(1);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    showToast(`已复制 ${label}: ${text}`);
  };

  const handleSaveRateAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    const collateralNum = parseFloat(creditLimit);
    onUpdateUser({
      ...user,
      collateral: isNaN(collateralNum) ? user.collateral : collateralNum
    });
    setShowAdjustRateModal(false);
    showToast(`已成功为用户 ${user.name} 调整专属结算折率及授信额度`);
  };

  const handleAddTag = (tagToAdd?: string) => {
    const tag = (tagToAdd || newTagInput).trim();
    if (!tag) return;
    if (!user.tags.includes(tag)) {
      onUpdateUser({
        ...user,
        tags: [...user.tags, tag]
      });
      showToast(`已添加新标签: "${tag}"`);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateUser({
      ...user,
      tags: user.tags.filter(t => t !== tagToRemove)
    });
    showToast(`已移除标签: "${tagToRemove}"`);
  };

  const handleToggleFreeze = () => {
    const isCurrentlyFrozen = user.riskLabel === '限制交易' || user.accountState === '限制交易';
    const nextLabel = isCurrentlyFrozen ? '正常履约' : '限制交易';
    const nextAccount = isCurrentlyFrozen ? '正常' : '限制交易';
    const nextRiskTier = isCurrentlyFrozen ? 'Tier-A' : 'Tier-C';

    onUpdateUser({
      ...user,
      riskLabel: nextLabel,
      accountState: nextAccount,
      riskTier: nextRiskTier
    });
    setShowFreezeModal(false);
    showToast(isCurrentlyFrozen ? `已成功解除用户 ${user.name} 的交易限制` : `已对用户 ${user.name} 实施临时风控冻结并挂起交易`);
  };

  const isFrozen = user.riskLabel === '限制交易' || user.accountState === '限制交易';

  const addOperatorWhatsApp = () => {
    const number = newOperatorWhatsApp.trim();
    if (!number) return;
    onUpdateUser({ ...user, operatorWhatsAppNumbers: [...(user.operatorWhatsAppNumbers || []), number] });
    setNewOperatorWhatsApp('');
    showToast('已新增运营人员录入的 WhatsApp 号');
  };

  const removeOperatorWhatsApp = (index: number) => {
    onUpdateUser({ ...user, operatorWhatsAppNumbers: (user.operatorWhatsAppNumbers || []).filter((_, itemIndex) => itemIndex !== index) });
    showToast('已删除运营人员录入的 WhatsApp 号');
  };

  const startEditOperatorWhatsApp = (index: number) => {
    setEditingOperatorWhatsAppIndex(index);
    setEditingOperatorWhatsApp(user.operatorWhatsAppNumbers?.[index] || '');
  };

  const saveOperatorWhatsApp = () => {
    if (editingOperatorWhatsAppIndex === null || !editingOperatorWhatsApp.trim()) return;
    const numbers = [...(user.operatorWhatsAppNumbers || [])];
    numbers[editingOperatorWhatsAppIndex] = editingOperatorWhatsApp.trim();
    onUpdateUser({ ...user, operatorWhatsAppNumbers: numbers });
    setEditingOperatorWhatsAppIndex(null);
    setEditingOperatorWhatsApp('');
    showToast('已更新运营人员录入的 WhatsApp 号');
  };

  return (
    <div className="flex flex-col w-full space-y-4 text-slate-800 antialiased pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900/90 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 backdrop-blur border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 顶部面包屑与快捷全局指令栏 (Action Toolbar) */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white px-5 py-3.5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>返回用户列表</span>
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span>平台作业端</span>
            <span>/</span>
            <span>客户管理</span>
            <span>/</span>
            <span>用户管理</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">
              用户详情 360° 档案中枢 (UID: {user.uid})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => setShowAdjustRateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-blue-600">percent</span>
            <span>调整结算折率/授信</span>
          </button>
          <button
            onClick={() => setShowTagModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-amber-600">label</span>
            <span>修改运营标签</span>
          </button>
          <button
            onClick={() => setShowCouponModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-600">confirmation_number</span>
            <span>补发加价券</span>
          </button>
          <button
            onClick={() => setShowFreezeModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer ${
              isFrozen
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isFrozen ? 'lock_open' : 'gpp_bad'}
            </span>
            <span>{isFrozen ? '解除冻结放行' : '限制交易/冻结'}</span>
          </button>
          <button
            onClick={() => {
              showToast('已启动安全打印引擎，生成包含水印防伪的 360° 用户合规履约凭证');
              window.print?.();
            }}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
            title="打印档案凭证"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
          </button>
        </div>
      </header>

      {/* 固定全景摘要 Master Header 卡片 */}
      <section className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          {/* Left: User Core Profile & Badges */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative shrink-0">
              <div className={`w-16 h-16 rounded-2xl ${user.avatarBg} text-white font-bold text-2xl flex items-center justify-center shadow-sm`}>
                {user.initials}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-xs" title="当前实时在线">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              </span>
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{user.name}</h1>
                <div className="flex items-center gap-1 font-code-token text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  <span>{user.uid}</span>
                  <button
                    onClick={() => copyToClipboard(user.uid, 'UID')}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="复制UID"
                  >
                    <span className="material-symbols-outlined text-[13px]">content_copy</span>
                  </button>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  isFrozen
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {isFrozen ? '限制交易挂起' : '正常在册'}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold ${user.tierColor}`}>
                  <span className="material-symbols-outlined text-[15px]">
                    {user.tier.includes('LV5') ? 'diamond' : user.tier.includes('LV4') ? 'workspace_premium' : 'military_tech'}
                  </span>
                  <span>{user.tier}</span>
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 font-code-token flex-wrap">
                <span>手机: <strong className="text-slate-800">{user.phone}</strong> ({user.kycStatus === 'KYC高级' ? 'KYC-3 高级认证' : user.kycStatus})</span>
                <span>·</span>
                <span>区域: <strong className="text-slate-800">{user.location || '尼日利亚 (Lagos, Ikeja Hub)'}</strong></span>
                <span>·</span>
                <span>风控等级: <strong className="text-emerald-700 font-semibold">{user.riskTier || 'Tier-A'} {user.creditScore}分</strong> (极低风险)</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                <span className="text-slate-400">渠道归因:</span>
                <span className="text-slate-800 font-medium">{user.channel}</span>
                <span className="text-slate-300">/</span>
                <span className="font-code-token text-slate-600">{user.employeeRef}</span>
              </div>
            </div>
          </div>

          {/* Right: Financial Stat Mosaic (3-column metrics) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full xl:w-auto shrink-0">
            <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/70 flex flex-col justify-between min-w-[160px]">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">卡交易金额</span>
              <div className="my-1">
                <span className="text-lg font-bold text-slate-900 font-numeric-stat">
                  ¥{user.gmv.toLocaleString()}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-code-token">
                等级奖励：XXXX
              </span>
            </div>

            <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/70 flex flex-col justify-between min-w-[160px]">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">累计卡单履约</span>
              <div className="my-1 flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-slate-900 font-numeric-stat">
                  {user.tradesCount}
                </span>
                <span className="text-xs text-slate-500">笔</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-code-token font-medium">
                成功率 99.4%
              </span>
            </div>

            <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/70 flex flex-col justify-between min-w-[160px]">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">最新作业时效</span>
              <div className="my-1">
                <span className="text-lg font-bold text-blue-700 font-numeric-stat">
                  14分钟前
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-code-token">
                2026-08-27 15:32:10 · 活跃在线
              </span>
            </div>
          </div>
        </div>

        {/* Growth Value Progress bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 w-full max-w-xl">
            <span className="text-slate-500 font-medium shrink-0">等级进度:</span>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden relative">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, ((user.growthPoints || 8650) / (user.maxGrowthPoints || 10000)) * 100)}%` }}
              />
            </div>
            <span className="font-code-token font-bold text-slate-800 shrink-0">
              {user.growthPoints || 8650} / {user.maxGrowthPoints || 10000} XP
            </span>
          </div>
          <span className="text-slate-400 font-code-token shrink-0">
            距晋升 LV5 殿堂做市商 还需 1,350 XP (预计本周达成)
          </span>
        </div>
      </section>

      {/* 8 大企业级功能 Tab 切换栏 */}
      <section className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 px-4 gap-2 overflow-x-auto text-xs font-semibold bg-slate-50/70 scrollbar-none">
          {[
            { key: 'profile', label: '01 用户概况 (360°)', icon: 'person' },
            { key: 'trades', label: `02 交易记录 (${user.tradesCount})`, icon: 'receipt_long' },
            { key: 'wallet', label: `03 钱包记录 (${walletRows.length})`, icon: 'account_balance_wallet' },
            { key: 'persona', label: '04 用户画像 (VIP)', icon: 'radar' },
            { key: 'referral', label: '05 推广关系', icon: 'hub' },
            { key: 'benefits', label: '06 营销权益 (3券有效)', icon: 'loyalty' },
            { key: 'aftersales', label: '07 服务/售后 (1完结)', icon: 'support_agent' },
            { key: 'risk', label: '08 风险记录 (绿点)', icon: 'security' },
            { key: 'logs', label: '09 操作日志 (SEC-LOG)', icon: 'history' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-3.5 px-3 relative shrink-0 cursor-pointer flex items-center gap-1.5 transition-colors ${
                activeTab === tab.key
                  ? 'text-[#004ac6] font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#004ac6] rounded-t-full"></span>
              )}
            </button>
          ))}
        </div>

        {/* Tab 1: 01 用户概况 (360°) */}
        {activeTab === 'profile' && (
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Span 7 */}
              <div className="lg:col-span-7 space-y-5">
                {/* Module 1: 基础资料 */}
                <div className="bg-slate-50/60 rounded-xl border border-slate-200/80 p-4.5 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600 text-[18px]">badge</span>
                      <h3 className="font-bold text-slate-900 text-xs">基础资料</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">用户识别码 / 系统UID</span>
                      <div className="flex items-center gap-1.5 mt-0.5 font-code-token font-bold text-slate-800">
                        <span>{user.uid}</span>
                        <span className="text-slate-400 font-normal text-[11px]">/ USR-902104</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">客户姓名 (KYC全称 / 称谓)</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">{user.name} (Ade-CardKing)</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">手机号 {registrationMethod === 'phone' && <em className="not-italic text-blue-600">· 注册账号</em>}</span>
                      <span className="font-code-token text-slate-800 mt-0.5 block">{maskPhone(user.phone)}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">邮箱 {registrationMethod === 'email' && <em className="not-italic text-blue-600">· 注册账号</em>}</span>
                      <span className="font-code-token text-slate-800 mt-0.5 block">{maskEmail(user.email || 'adebayo.trader@alhikma.ng')}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">注册时间与触达通道</span>
                      <span className="font-code-token text-slate-800 mt-0.5 block">
                        {user.registeredDate || '2025-11-04 09:18:22'} (拉各斯地推档口)
                      </span>
                    </div>
                  </div>

                  <section className="bg-white rounded-lg border border-slate-200/80 p-3 space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <span className="material-symbols-outlined text-emerald-600 text-[16px]">forum</span>
                      <h4 className="font-semibold text-slate-800 text-xs">WhatsApp 联系方式</h4>
                    </div>
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 font-medium">用户录入 · 实时数据</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {(user.userWhatsAppNumbers || []).length > 0 ? (user.userWhatsAppNumbers || []).map((number, index) => (
                            <span key={`user-wa-${index}`} className="px-2 py-1 rounded bg-slate-50 border border-slate-200 font-code-token text-[11px] text-slate-700">
                              {maskWhatsApp(number)}
                            </span>
                          )) : <span className="text-[11px] text-slate-400">未录入</span>}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-medium">运营人员录入</span>
                        <div className="space-y-1 mt-1">
                          {(user.operatorWhatsAppNumbers || []).map((number, index) => (
                            <div key={`operator-wa-${index}`} className="flex items-center gap-2">
                              {editingOperatorWhatsAppIndex === index ? (
                                <input autoFocus value={editingOperatorWhatsApp} onChange={(e) => setEditingOperatorWhatsApp(e.target.value)} className="w-44 px-2 py-1.5 rounded border border-blue-300 bg-white text-[11px] outline-none" />
                              ) : (
                                <span className="px-2 py-1 rounded bg-slate-50 border border-slate-200 font-code-token text-[11px] text-slate-700">{maskWhatsApp(number)}</span>
                              )}
                              {editingOperatorWhatsAppIndex === index ? (
                                <button type="button" onClick={saveOperatorWhatsApp} className="text-[11px] text-blue-600 hover:text-blue-700">保存</button>
                              ) : (
                                <button type="button" onClick={() => startEditOperatorWhatsApp(index)} className="text-[11px] text-blue-600 hover:text-blue-700">编辑</button>
                              )}
                              <button type="button" onClick={() => removeOperatorWhatsApp(index)} className="text-[11px] text-rose-600 hover:text-rose-700">删除</button>
                            </div>
                          ))}
                          <div className="flex items-center gap-2">
                            <input value={newOperatorWhatsApp} onChange={(e) => setNewOperatorWhatsApp(e.target.value)} placeholder="录入 WhatsApp 号" className="w-44 px-2 py-1.5 rounded border border-slate-200 bg-white text-[11px] outline-none focus:border-blue-400" />
                            <button type="button" onClick={addOperatorWhatsApp} className="px-2.5 py-1.5 rounded bg-blue-600 text-white text-[11px] font-medium hover:bg-blue-700">新增</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Terminal & Security Baseline */}
                  <div className="pt-3 border-t border-slate-200/60 text-xs text-slate-500 space-y-1">
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="material-symbols-outlined text-[14px] text-slate-400">devices</span>
                      <span>终端安全基线:</span>
                      <strong className="text-slate-700">{user.deviceModel || 'Apple iPhone 15 Pro Max (iOS 17.5.1 / App v3.4.1)'}</strong>
                    </div>
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="material-symbols-outlined text-[14px] text-slate-400">lan</span>
                      <span>最后登录 IP:</span>
                      <strong className="text-slate-700 font-code-token">{user.lastIp || '102.89.44.112 (尼日利亚 拉各斯 莱基半岛 MTN固定商用专线)'}</strong>
                    </div>
                  </div>
                </div>

                {/* Module 3: 交易能力与数据摘要 (Trading Summary) */}
                <div className="bg-slate-50/60 rounded-xl border border-slate-200/80 p-4.5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-[18px]">query_stats</span>
                      <h3 className="font-bold text-slate-900 text-xs">
                        交易能力与数据摘要 (Trading Summary)
                      </h3>
                    </div>
                    <span className="text-slate-400 font-code-token text-[11px]">近30天滚动统计</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">近30日成交流水</span>
                      <span className="text-base font-bold text-slate-900 font-numeric-stat mt-0.5 block">
                        ¥8,450,000
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">成功出卡笔数</span>
                      <span className="text-base font-bold text-emerald-700 font-numeric-stat mt-0.5 block">
                        310 单 (99.36%)
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">平均单笔客单价</span>
                      <span className="text-base font-bold text-slate-900 font-numeric-stat mt-0.5 block">
                        ¥134,800
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">平均核销放款时效</span>
                      <span className="text-base font-bold text-blue-700 font-numeric-stat mt-0.5 block">
                        4分12秒
                      </span>
                    </div>
                  </div>

                  {/* 出卡偏好分布 */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-700 block">出卡偏好分布 (Top Gift Cards):</span>
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                          <span>Apple Store & iTunes 实体卡 (62%)</span>
                          <span className="font-code-token font-bold text-slate-800">¥25,916,000</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '62%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                          <span>Steam Wallet 全球卡密 (28%)</span>
                          <span className="font-code-token font-bold text-slate-800">¥11,704,000</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '28%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                          <span>Google Play / Razer Gold (10%)</span>
                          <span className="font-code-token font-bold text-slate-800">¥4,180,000</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '10%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 集中出卡活跃窗口 (WAT 拉各斯时间) */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">集中出卡活跃窗口 (WAT 拉各斯时间):</span>
                      <span className="font-code-token text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        主力窗口: 14:00 - 19:00 WAT (当地档口打烊盘点)
                      </span>
                    </div>
                    {/* 24-hour micro bar visualization */}
                    <div className="flex items-end gap-1 h-12 pt-2 px-2 bg-white rounded-lg border border-slate-200/80">
                      {[1, 0, 0, 0, 1, 2, 3, 5, 8, 12, 16, 22, 28, 35, 48, 52, 49, 44, 32, 20, 14, 8, 4, 2].map((val, idx) => (
                        <div
                          key={idx}
                          className="flex-1 bg-slate-100 hover:bg-blue-600 rounded-xs transition-colors group relative cursor-pointer"
                          style={{ height: `${Math.max(10, (val / 52) * 100)}%` }}
                        >
                          <span className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1 py-0.5 rounded whitespace-nowrap z-10 font-code-token">
                            {idx}:00 ({val}单)
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-code-token px-1">
                      <span>00:00</span>
                      <span>06:00</span>
                      <span>12:00</span>
                      <span>18:00 (高峰)</span>
                      <span>23:00</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Span 5 */}
              <div className="lg:col-span-5 space-y-5">
                {/* Module 2: 等级成长与演进流水 (VIP Tier Evolution) */}
                <div className="bg-slate-50/60 rounded-xl border border-slate-200/80 p-4.5 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-600 text-[18px]">military_tech</span>
                      <h3 className="font-bold text-slate-900 text-xs">
                        等级成长与演进流水 (VIP Tier Evolution)
                      </h3>
                    </div>
                    <span className="text-amber-700 font-bold text-xs">LV3 黄金会员</span>
                  </div>

                  {/* 黄金会员专属运营特权 Banner */}
                  <div className="p-3 bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-200/80 rounded-xl space-y-1 text-xs">
                    <span className="font-bold text-amber-900 flex items-center gap-1 text-[11px]">
                      <span className="material-symbols-outlined text-[15px] text-amber-600">stars</span>
                      黄金会员专属运营特权 (Tier-3 Perks):
                    </span>
                    <ul className="text-amber-800 text-[11px] space-y-0.5 list-disc list-inside">
                      <li>出卡上浮 <strong>+200 BPS</strong> 溢价 (+0.0200 专属折率)</li>
                      <li>通道专享 <strong>极速核销免排队</strong></li>
                      <li>客服通道 <strong>7x24h 专家直通</strong></li>
                    </ul>
                  </div>

                  {/* Stream of level changes */}
                  <div className="space-y-3 pt-1">
                    <span className="text-[11px] font-semibold text-slate-500 block">等级晋升与成长流水记录:</span>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-start gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <strong className="text-slate-800">LV2 白银 → LV3 黄金</strong>
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 rounded font-code-token font-semibold">+1,200 XP</span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-code-token">2026-08-15 · 自动触发晋升规则 (SYS-AUTO)</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <strong className="text-slate-800">LV1 普通 → LV2 白银</strong>
                            <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 rounded font-code-token font-semibold">+850 XP</span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-code-token">2026-05-20 · 累计出卡破 ¥1,000,000 触发</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <strong className="text-slate-800">初始注册 → LV1 普通</strong>
                            <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 rounded font-code-token font-semibold">+100 XP</span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-code-token">2025-11-04 · 地推专员录入登记 (EMP-8802)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Module 4: 关联快速穿透视图 (Recent Orders & Risk Guard) */}
                <div className="bg-slate-50/60 rounded-xl border border-slate-200/80 p-4.5 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600 text-[18px]">receipt</span>
                      <h3 className="font-bold text-slate-900 text-xs">
                        最近卡单穿透与风控守护 (Recent Orders)
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('trades')}
                      className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold cursor-pointer"
                    >
                      查看全部单据 →
                    </button>
                  </div>

                  {/* 3 Recent orders */}
                  <div className="space-y-2">
                    {user.transactions.slice(0, 3).map(tx => (
                      <div
                        key={tx.id}
                        className="bg-white p-3 rounded-lg border border-slate-200/80 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-900 truncate">{tx.card}</span>
                          <span className="text-[11px] text-slate-400 font-code-token">
                            {tx.id} · {tx.time} · 汇率 {tx.rate || '0.9200'}
                          </span>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <span className="font-bold text-slate-900 font-numeric-stat">
                            ¥{tx.amount.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Risk & Service Highlights */}
                  <div className="pt-2 border-t border-slate-200/60 space-y-2 text-xs">
                    <span className="text-[11px] font-semibold text-slate-500 block">风控合规与客诉画像:</span>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">历史争议率</span>
                        <span className="font-bold text-slate-800 text-xs font-code-token">0.32%</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">累计获赔金额</span>
                        <span className="font-bold text-emerald-700 text-xs font-code-token">¥0.00</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">黑产关联度</span>
                        <span className="font-bold text-slate-800 text-xs font-code-token">0.00% (纯净)</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg text-slate-700 text-[11px] leading-relaxed">
                      <strong>运营主管最新人工备注:</strong> 「尼日利亚 Ikeja 电脑城核心批发大户，日均出卡稳定在 50~100 张实体小票，核销配合度极高，建议维持 VIP 绿色直通通道放款。」
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Security Watermark */}
            <div className="text-center py-2 text-[10px] text-slate-300 font-code-token">
              敏感数据水印保护 SESSION: 8a91-fd23-0091 | NODE: LAGOS-GATE-01 | 当前操作人: OP-882 (Sarah)
            </div>
          </div>
        )}

        {/* Tab 2: 02 交易记录 */}
        {activeTab === 'trades' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold text-slate-900 text-xs">交易记录 ({filteredTradeRows.length} 条)</h3>
              <button
                onClick={() => showToast('已导出当前筛选条件下的交易记录')}
                className="h-8 px-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-md text-xs font-medium cursor-pointer"
              >
                导出
              </button>
            </div>

            <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-lg">
              <div className="flex flex-wrap items-end gap-2.5">
                <label className="space-y-1">
                  <span className="block text-[11px] font-medium text-slate-500">订单号 / 礼品卡名称</span>
                  <input
                    type="text"
                    value={tradeDraftFilters.keyword}
                    onChange={e => setTradeDraftFilters(prev => ({ ...prev, keyword: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') applyTradeFilters(); }}
                    placeholder="请输入关键词"
                    className="h-8 px-2.5 bg-white border border-slate-200 rounded-md text-xs w-52 outline-none focus:border-blue-400"
                  />
                </label>
                <label className="space-y-1">
                  <span className="block text-[11px] font-medium text-slate-500">国家</span>
                  <select
                    value={tradeDraftFilters.country}
                    onChange={e => setTradeDraftFilters(prev => ({ ...prev, country: e.target.value }))}
                    className="h-8 px-2.5 bg-white border border-slate-200 rounded-md text-xs min-w-28 outline-none focus:border-blue-400"
                  >
                    <option>全部</option>
                    <option>US美国</option>
                    <option>GB英国</option>
                    <option>CA加拿大</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="block text-[11px] font-medium text-slate-500">处理状态</span>
                  <select
                    value={tradeDraftFilters.status}
                    onChange={e => setTradeDraftFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="h-8 px-2.5 bg-white border border-slate-200 rounded-md text-xs min-w-32 outline-none focus:border-blue-400"
                  >
                    <option>全部</option>
                    {TRADE_STATUSES.map(status => <option key={status}>{status}</option>)}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="block text-[11px] font-medium text-slate-500">下单时间起</span>
                  <input
                    type="date"
                    value={tradeDraftFilters.startDate}
                    onChange={e => setTradeDraftFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="h-8 px-2.5 bg-white border border-slate-200 rounded-md text-xs outline-none focus:border-blue-400"
                  />
                </label>
                <label className="space-y-1">
                  <span className="block text-[11px] font-medium text-slate-500">下单时间止</span>
                  <input
                    type="date"
                    value={tradeDraftFilters.endDate}
                    onChange={e => setTradeDraftFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="h-8 px-2.5 bg-white border border-slate-200 rounded-md text-xs outline-none focus:border-blue-400"
                  />
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={applyTradeFilters}
                    className="h-8 px-4 bg-[#004ac6] text-white rounded-md text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                  >
                    查询
                  </button>
                  <button
                    onClick={resetTradeFilters}
                    className="h-8 px-4 bg-white border border-slate-200 text-slate-600 rounded-md text-xs font-medium hover:bg-slate-100 cursor-pointer"
                  >
                    重置
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full min-w-[1320px] text-left text-xs border-collapse">
                <thead>
                  <tr className="h-10 bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <th className="px-3 whitespace-nowrap">订单号</th>
                    <th className="px-3 whitespace-nowrap">礼品卡名称</th>
                    <th className="px-3 whitespace-nowrap">国家</th>
                    <th className="px-3 whitespace-nowrap">面值/数量</th>
                    <th className="px-3 whitespace-nowrap">卡成交报价</th>
                    <th className="px-3 whitespace-nowrap">卡成交总额</th>
                    <th className="px-3 whitespace-nowrap">等级奖励</th>
                    <th className="px-3 whitespace-nowrap">实际结算总额</th>
                    <th className="px-3 whitespace-nowrap">下单时间 ↓</th>
                    <th className="px-3 whitespace-nowrap">处理状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleTradeRows.map(row => (
                    <tr key={row.orderNo} className="h-12 hover:bg-slate-50/80">
                      <td className="px-3 font-code-token font-bold text-slate-800 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{row.orderNo}</span>
                          <button
                            onClick={() => copyToClipboard(row.orderNo, '订单号')}
                            className="text-slate-400 hover:text-blue-600 cursor-pointer"
                            title="复制订单号"
                          >
                            <span className="material-symbols-outlined text-[14px]">content_copy</span>
                          </button>
                        </div>
                      </td>
                      <td className="px-3 font-medium text-slate-900 whitespace-nowrap">{row.cardName}</td>
                      <td className="px-3 text-slate-600 whitespace-nowrap">{row.country}</td>
                      <td className="px-3 font-code-token text-slate-700 whitespace-nowrap">{row.faceValueQuantity}</td>
                      <td className="px-3 font-code-token text-slate-700 whitespace-nowrap">{row.quote}</td>
                      <td className="px-3 font-code-token font-semibold text-slate-900 whitespace-nowrap">{row.totalAmount}</td>
                      <td className="px-3 font-code-token text-amber-700 whitespace-nowrap">{row.reward}</td>
                      <td className="px-3 font-code-token font-bold text-emerald-700 whitespace-nowrap">{row.settlementTotal}</td>
                      <td className="px-3 font-code-token text-slate-500 whitespace-nowrap">{row.orderTime}</td>
                      <td className="px-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 border rounded text-[11px] font-semibold ${getStatusClass(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {visibleTradeRows.length === 0 && (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">暂无符合条件的交易记录</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-4 text-xs text-slate-500">
              <span>共 {filteredTradeRows.length} 条</span>
              <select
                value={tradePageSize}
                onChange={e => { setTradePageSize(Number(e.target.value)); setTradePage(1); }}
                className="h-8 px-2 bg-white border border-slate-200 rounded-md text-xs outline-none"
              >
                <option value={10}>10条/页</option>
                <option value={50}>50条/页</option>
                <option value={100}>100条/页</option>
              </select>
              <div className="flex items-center gap-1">
                <button
                  disabled={tradePage <= 1}
                  onClick={() => setTradePage(page => Math.max(1, page - 1))}
                  className="w-8 h-8 border border-slate-200 rounded-md bg-white disabled:text-slate-300 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                  aria-label="上一页"
                >
                  ‹
                </button>
                <span className="min-w-8 h-8 px-2 flex items-center justify-center bg-blue-50 border border-blue-200 text-blue-700 rounded-md font-semibold">
                  {Math.min(tradePage, tradePageCount)}
                </span>
                <button
                  disabled={tradePage >= tradePageCount}
                  onClick={() => setTradePage(page => Math.min(tradePageCount, page + 1))}
                  className="w-8 h-8 border border-slate-200 rounded-md bg-white disabled:text-slate-300 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                  aria-label="下一页"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: 03 钱包记录 */}
        {activeTab === 'wallet' && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                <span className="text-[11px] text-slate-500 font-semibold block">钱包状态</span>
                <span className={`inline-flex items-center gap-1.5 mt-2 px-2 py-1 rounded-md border text-xs font-bold ${isFrozen ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isFrozen ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                  {isFrozen ? '冻结' : '正常'}
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                <span className="text-[11px] text-slate-500 font-semibold block">可提现余额</span>
                <span className="mt-1 block text-base font-bold text-slate-900 font-numeric-stat">₦1,284,600.00</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                <span className="text-[11px] text-slate-500 font-semibold block">冻结金额</span>
                <span className="mt-1 block text-base font-bold text-amber-700 font-numeric-stat">₦86,000.00</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                <span className="text-[11px] text-slate-500 font-semibold block">已提现余额(含服务费)</span>
                <span className="mt-1 block text-base font-bold text-blue-700 font-numeric-stat">₦8,942,300.00</span>
              </div>
            </div>

            <h3 className="font-bold text-slate-900 text-xs">钱包流水记录 ({filteredWalletRows.length} 条)</h3>

            <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-lg">
              <div className="flex flex-wrap items-end gap-2.5">
                <label className="space-y-1">
                  <span className="block text-[11px] font-medium text-slate-500">订单ID</span>
                  <input
                    type="text"
                    value={walletDraftFilters.orderId}
                    onChange={e => setWalletDraftFilters(prev => ({ ...prev, orderId: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') applyWalletFilters(); }}
                    placeholder="请输入订单ID"
                    className="h-8 px-2.5 bg-white border border-slate-200 rounded-md text-xs w-52 outline-none focus:border-blue-400"
                  />
                </label>
                <label className="space-y-1">
                  <span className="block text-[11px] font-medium text-slate-500">发起时间起</span>
                  <input
                    type="date"
                    value={walletDraftFilters.startDate}
                    onChange={e => setWalletDraftFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="h-8 px-2.5 bg-white border border-slate-200 rounded-md text-xs outline-none focus:border-blue-400"
                  />
                </label>
                <label className="space-y-1">
                  <span className="block text-[11px] font-medium text-slate-500">发起时间止</span>
                  <input
                    type="date"
                    value={walletDraftFilters.endDate}
                    onChange={e => setWalletDraftFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="h-8 px-2.5 bg-white border border-slate-200 rounded-md text-xs outline-none focus:border-blue-400"
                  />
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={applyWalletFilters}
                    className="h-8 px-4 bg-[#004ac6] text-white rounded-md text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                  >
                    查询
                  </button>
                  <button
                    onClick={resetWalletFilters}
                    className="h-8 px-4 bg-white border border-slate-200 text-slate-600 rounded-md text-xs font-medium hover:bg-slate-100 cursor-pointer"
                  >
                    重置
                  </button>
                  <button
                    onClick={() => showToast('已导出当前筛选条件下的钱包流水记录')}
                    className="h-8 px-4 bg-white border border-slate-200 hover:bg-slate-50 rounded-md text-xs font-medium cursor-pointer"
                  >
                    导出
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full min-w-[1900px] text-left text-xs border-collapse">
                <thead>
                  <tr className="h-10 bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <th className="px-3 whitespace-nowrap">订单ID</th>
                    <th className="px-3 whitespace-nowrap">业务类型</th>
                    <th className="px-3 whitespace-nowrap">提现金额（₦）</th>
                    <th className="px-3 whitespace-nowrap">提现金额（￥）</th>
                    <th className="px-3 whitespace-nowrap">服务费（₦）</th>
                    <th className="px-3 whitespace-nowrap">法币汇率（₦）</th>
                    <th className="px-3 whitespace-nowrap">变动前剩余可提现余额（₦）</th>
                    <th className="px-3 whitespace-nowrap">变动后剩余可提现金额（₦）</th>
                    <th className="px-3 whitespace-nowrap">发起时间</th>
                    <th className="px-3 whitespace-nowrap">完成时间</th>
                    <th className="px-3 whitespace-nowrap">提现状态</th>
                    <th className="px-3 whitespace-nowrap">备注</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleWalletRows.map(row => (
                    <tr key={row.orderId} className="h-12 hover:bg-slate-50/80">
                      <td className="px-3 font-code-token font-bold text-slate-800 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{row.orderId}</span>
                          <button
                            onClick={() => copyToClipboard(row.orderId, '订单ID')}
                            className="text-slate-400 hover:text-blue-600 cursor-pointer"
                            title="复制订单ID"
                          >
                            <span className="material-symbols-outlined text-[14px]">content_copy</span>
                          </button>
                        </div>
                      </td>
                      <td className="px-3 whitespace-nowrap"><span className={`inline-flex px-2 py-1 rounded border text-[11px] font-semibold ${row.businessType === '提现' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-violet-50 text-violet-700 border-violet-200'}`}>{row.businessType}</span></td>
                      <td className="px-3 font-code-token font-semibold text-slate-900 whitespace-nowrap">{row.withdrawNaira}</td>
                      <td className="px-3 font-code-token font-semibold text-slate-900 whitespace-nowrap">{row.withdrawCny}</td>
                      <td className="px-3 font-code-token text-amber-700 whitespace-nowrap">{row.serviceFeeNaira}</td>
                      <td className="px-3 font-code-token text-slate-700 whitespace-nowrap">{row.fiatRate}</td>
                      <td className="px-3 font-code-token text-slate-700 whitespace-nowrap">{row.balanceBefore}</td>
                      <td className="px-3 font-code-token font-semibold text-slate-900 whitespace-nowrap">{row.balanceAfter}</td>
                      <td className="px-3 font-code-token text-slate-500 whitespace-nowrap">{row.initiatedAt}</td>
                      <td className="px-3 font-code-token text-slate-500 whitespace-nowrap">{row.completedAt}</td>
                      <td className="px-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 border rounded text-[11px] font-semibold ${row.status === '成功' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : row.status === '失败' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 text-slate-600 whitespace-nowrap">{row.note || ''}</td>
                    </tr>
                  ))}
                  {visibleWalletRows.length === 0 && (
                    <tr>
                      <td colSpan={12} className="py-12 text-center text-slate-400">暂无符合条件的钱包流水记录</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-4 text-xs text-slate-500">
              <span>共 {filteredWalletRows.length} 条</span>
              <select
                value={walletPageSize}
                onChange={e => { setWalletPageSize(Number(e.target.value)); setWalletPage(1); }}
                className="h-8 px-2 bg-white border border-slate-200 rounded-md text-xs outline-none"
              >
                <option value={10}>10条/页</option>
                <option value={50}>50条/页</option>
                <option value={100}>100条/页</option>
              </select>
              <div className="flex items-center gap-1">
                <button
                  disabled={walletPage <= 1}
                  onClick={() => setWalletPage(page => Math.max(1, page - 1))}
                  className="w-8 h-8 border border-slate-200 rounded-md bg-white disabled:text-slate-300 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                  aria-label="上一页"
                >
                  ‹
                </button>
                <span className="min-w-8 h-8 px-2 flex items-center justify-center bg-blue-50 border border-blue-200 text-blue-700 rounded-md font-semibold">{Math.min(walletPage, walletPageCount)}</span>
                <button
                  disabled={walletPage >= walletPageCount}
                  onClick={() => setWalletPage(page => Math.min(walletPageCount, page + 1))}
                  className="w-8 h-8 border border-slate-200 rounded-md bg-white disabled:text-slate-300 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                  aria-label="下一页"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: 04 用户画像 (VIP) */}
        {activeTab === 'persona' && (
          <div className="p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-xs">出卡用户 360° 全维特征画像</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">业务偏好特征</span>
                <p className="text-slate-600">主力经营 Apple 实体卡与 Steam 全球卡，习惯批量手持原始小票拍照上传，核销拒绝率低于 0.2%。</p>
                <div className="flex flex-wrap gap-1 pt-2">
                  {user.tags.map((t, i) => (
                    <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px]">{t}</span>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">活跃时段与环境</span>
                <p className="text-slate-600">集中在西非时间 (WAT) 下午 14:00 至 19:00，通过固定的商用光纤专线上线，设备指纹长期稳定无漂移。</p>
                <span className="text-[11px] text-slate-500 font-code-token">峰值时段: {user.peakHours}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">资金结算习惯</span>
                <p className="text-slate-600">主要采用 OPay 银行账户或 TRC20 链上秒级清算，提现频率高，无沉淀资金滞留风险。</p>
                <span className="text-[11px] text-slate-500 font-code-token">链上地址: {user.usdtAddress}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: 04 推广关系 */}
        {activeTab === 'referral' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 text-xs">
            <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100 bg-slate-50/70">
                <span className="material-symbols-outlined text-blue-600 text-[16px]">person_search</span>
                <h3 className="font-bold text-slate-900">一级推荐人</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-3 py-2.5">
                <div>
                  <span className="text-[11px] text-slate-400 block">推荐人类型</span>
                  <span className="inline-flex mt-0.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 font-semibold">
                    个人用户
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">推荐码</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-code-token font-bold text-slate-800">{user.inviteCode || 'L2FDA'}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(user.inviteCode || 'L2FDA', '推荐码')}
                      className="text-slate-400 hover:text-blue-600 cursor-pointer"
                      title="复制推荐码"
                    >
                      <span className="material-symbols-outlined text-[15px]">content_copy</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100 bg-slate-50/70">
                <span className="material-symbols-outlined text-emerald-600 text-[16px]">group_add</span>
                <h3 className="font-bold text-slate-900">我的邀请用户</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 px-3 py-2.5">
                <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-2.5">
                  <span className="text-[11px] text-slate-400 block">总邀请用户数</span>
                  <span className="mt-0.5 block text-base font-bold text-slate-900 font-numeric-stat">XXXX</span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-2.5">
                  <span className="text-[11px] text-slate-400 block">邀请收益</span>
                  <span className="mt-0.5 block text-base font-bold text-emerald-700 font-numeric-stat">XXXX<span className="text-xs font-semibold ml-1">奈拉</span></span>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Tab 5: 05 营销权益 */}
        {activeTab === 'benefits' && (
          <div className="p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">已发放营销权益与加息补贴券 (3张有效)</h3>
              <button
                onClick={() => setShowCouponModal(true)}
                className="px-3 py-1.5 bg-[#004ac6] text-white rounded-lg font-semibold cursor-pointer"
              >
                + 补发加价券
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                <span className="font-bold text-amber-900 block">大客户出卡专属 +1.5% 加价券</span>
                <span className="text-amber-700 font-code-token text-[11px] block">单笔上限 ¥500 · 有效期至今日 24:00</span>
                <span className="text-amber-600 text-[10px]">来源: 5月西非出卡季专属权益</span>
              </div>
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                <span className="font-bold text-blue-900 block">Apple/Steam 实体卡专属 +2.0% 补贴</span>
                <span className="text-blue-700 font-code-token text-[11px] block">无门槛 · 剩余 3 天</span>
                <span className="text-blue-600 text-[10px]">来源: 钻石商户月度保级礼包</span>
              </div>
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                <span className="font-bold text-emerald-900 block">极速放款 VIP 绿色通行证</span>
                <span className="text-emerald-700 font-code-token text-[11px] block">核销成功秒级打款无需人工二审</span>
                <span className="text-emerald-600 text-[10px]">永久有效</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: 06 服务/售后 */}
        {activeTab === 'aftersales' && (
          <div className="p-5 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900">客服工单与争议售后记录</h3>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">工单 #TK-20260819-01 (已完结)</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[11px] font-semibold">已核实放款</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                卡图边缘轻微模糊，客服 OP-882 (Sarah) 联系用户补传高清照片后，核销成功，历时 12 分钟闭环。
              </p>
            </div>
          </div>
        )}

        {/* Tab 7: 07 风险记录 */}
        {activeTab === 'risk' && (
          <div className="p-5 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900">反洗钱与风控拦截审计记录</h3>
            {user.riskLogs.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                该用户历史信誉评级极高，无任何高危碰撞、涉诉黑产违规记录。
              </div>
            ) : (
              user.riskLogs.map((log, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{log.title}</span>
                    <span className="text-slate-400 font-code-token text-[11px]">{log.time}</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{log.desc}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 8: 08 操作日志 */}
        {activeTab === 'logs' && (
          <div className="p-5 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900">安全合规审计与平台作业日志</h3>
            <div className="space-y-2 font-code-token text-[11px]">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                <span>[2026-08-27 12:48:02] OP-882 查看用户 360° 全息档案 (SESSION-LAGOS)</span>
                <span className="text-slate-400">SUCCESS</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                <span>[2026-08-15 14:20:11] 系统触发等级跃迁: LV2 白银 -&gt; LV3 黄金</span>
                <span className="text-emerald-700">AUTO-PASS</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                <span>[2025-11-04 09:18:22] 档口地推专员 EMP-8802 录入直属邀请白名单</span>
                <span className="text-blue-700">CREATED</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Modal: 调整结算折率/授信 */}
      {showAdjustRateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900">调整专属折率与履约授信</h3>
              <button
                onClick={() => setShowAdjustRateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveRateAdjust} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">专属出卡折率浮动点差 (BPS)</label>
                <input
                  type="text"
                  value={spreadDiscount}
                  onChange={e => setSpreadDiscount(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600 font-code-token"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">免押授信/风险保证金 (¥ RMB)</label>
                <input
                  type="number"
                  value={creditLimit}
                  onChange={e => setCreditLimit(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600 font-code-token font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustRateModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#004ac6] text-white rounded-lg font-semibold cursor-pointer"
                >
                  确认调整
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: 修改运营标签 */}
      {showTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900">客群运营标签管理</h3>
              <button
                onClick={() => setShowTagModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <span className="text-slate-500 block">当前已赋予标签 (点击可快速移除):</span>
                <div className="flex flex-wrap gap-1.5">
                  {user.tags.map(tag => (
                    <span
                      key={tag}
                      onClick={() => handleRemoveTag(tag)}
                      className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-rose-50 hover:text-rose-700 border border-blue-200 hover:border-rose-200 rounded-md cursor-pointer transition-colors flex items-center gap-1 group"
                    >
                      <span>{tag}</span>
                      <span className="material-symbols-outlined text-[13px]">close</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-slate-500 block">新增自定义标签:</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="输入新标签..."
                    value={newTagInput}
                    onChange={e => setNewTagInput(e.target.value)}
                    className="flex-1 h-9 px-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600"
                  />
                  <button
                    onClick={() => handleAddTag()}
                    className="px-4 h-9 bg-[#004ac6] text-white rounded-lg font-semibold cursor-pointer shrink-0"
                  >
                    添加
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowTagModal(false)}
                  className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-lg cursor-pointer"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: 补发加价券 */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900">补发营销加价券</h3>
              <button
                onClick={() => setShowCouponModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">选择权益券种</label>
                <select
                  value={couponType}
                  onChange={e => setCouponType(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                >
                  <option>大客户出卡专属 +1.5% 加价券</option>
                  <option>Apple/Steam 实体卡专属 +2.0% 补贴</option>
                  <option>首单保费 100% 豁免券</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">有效期设置</label>
                <select
                  value={couponValidDays}
                  onChange={e => setCouponValidDays(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                >
                  <option>7天有效</option>
                  <option>15天有效</option>
                  <option>30天有效</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowCouponModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    setShowCouponModal(false);
                    showToast(`已向 ${user.name} 补发: ${couponType}`);
                  }}
                  className="px-4 py-1.5 bg-[#004ac6] text-white rounded-lg font-semibold cursor-pointer"
                >
                  确认补发
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: 限制交易/冻结 */}
      {showFreezeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900">
                {isFrozen ? '确认解除冻结放行？' : '确认限制该用户出卡交易？'}
              </h3>
              <button
                onClick={() => setShowFreezeModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-5 space-y-3.5 text-xs">
              <p className="text-slate-600">
                {isFrozen
                  ? `解除后，用户 ${user.name} (${user.uid}) 将恢复正常出卡核销与自动提现权限。`
                  : `限制交易后，用户 ${user.name} (${user.uid}) 提交的卡单将被系统阻断，资金提现将被强制挂起待审。`}
              </p>
              {!isFrozen && (
                <div>
                  <label className="block text-slate-600 font-medium mb-1">冻结限制原因</label>
                  <input
                    type="text"
                    value={freezeReason}
                    onChange={e => setFreezeReason(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-rose-600"
                  />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowFreezeModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={handleToggleFreeze}
                  className={`px-4 py-1.5 rounded-lg font-semibold text-white cursor-pointer ${
                    isFrozen ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isFrozen ? '确认解除限制' : '执行风控冻结'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
