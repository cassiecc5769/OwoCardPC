import React, { useState, useMemo } from 'react';
import { UniversalTemplateLibraryModule } from './UniversalTemplateLibraryModule';
import { INITIAL_UNIVERSAL_TEMPLATES } from './templateMockData';
import { UniversalBenefitTemplate } from './types';

export interface BenefitCouponItem {
  id: string;
  couponCode: string;
  name: string;
  type: 'rate' | 'fixed' | 'service';
  typeLabel: string;
  discountDisplay: string;
  discountValue: number; // e.g. 1.0 for 1% or 15 for $15
  cardScope: string;
  cardScopeTags: string[];
  userUid: string;
  userPhone: string;
  sourceType: 'campaign' | 'tier' | 'cs' | 'manual' | 'risk';
  sourceCode: string;
  sourceDesc: string;
  orderId?: string;
  status: 'used' | 'active' | 'expired' | 'frozen';
  statusLabel: string;
  expireTimeText: string;
  usedTime?: string;
  createTime: string;
  minOrderValue: number;
  subsidyAmount?: number;
  riskReason?: string;
  workOrderRef?: string;
}

export interface BenefitTemplate {
  id: string;
  code: string;
  name: string;
  badge: string;
  badgeColor: string;
  type: 'rate' | 'fixed' | 'service' | 'fee';
  discountText: string;
  discountSub: string;
  minThreshold: string;
  validity: string;
  applicableCards: string;
  statTriggerCount: string;
  statEffectText: string;
  effectType: 'primary' | 'secondary' | 'tertiary' | 'error';
  status: 'active' | 'paused';
}

const INITIAL_TEMPLATES: BenefitTemplate[] = [
  {
    id: 'tpl-1',
    code: 'TPL-FIRST-01',
    name: '首单破冰加价券',
    badge: '首单专享',
    badgeColor: 'bg-blue-100 text-blue-800',
    type: 'rate',
    discountText: '+1.0%',
    discountSub: '加价上浮',
    minThreshold: '满 $50.00 USD',
    validity: '3 天有效 · 注册自动发',
    applicableCards: '全卡通用',
    statTriggerCount: '累计触发: 12,480 次',
    statEffectText: '履约率 78.1%',
    effectType: 'secondary',
    status: 'active'
  },
  {
    id: 'tpl-2',
    code: 'TPL-LARGE-02',
    name: '大额卡单满减溢价券',
    badge: '大宗促动',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    type: 'fixed',
    discountText: '+$15.00',
    discountSub: '现金直接立补',
    minThreshold: '单笔满 $500.00 USD',
    validity: '7 天有效 · 领券即生效',
    applicableCards: 'Apple / Steam 专享',
    statTriggerCount: '促进交易: $1.42M',
    statEffectText: '高客单转化',
    effectType: 'primary',
    status: 'active'
  },
  {
    id: 'tpl-3',
    code: 'TPL-WEEK-03',
    name: '高频出卡周度返现特权',
    badge: '忠诚阶梯',
    badgeColor: 'bg-indigo-100 text-indigo-800',
    type: 'rate',
    discountText: '+0.3%',
    discountSub: '结算额外返现',
    minThreshold: '单周出卡满 3 单触发',
    validity: '周度重置周期履约',
    applicableCards: 'Google Play / Razer',
    statTriggerCount: '周活商家: 420 户',
    statEffectText: '留存率 89.2%',
    effectType: 'tertiary',
    status: 'active'
  },
  {
    id: 'tpl-4',
    code: 'TPL-CS-04',
    name: '客服客诉安抚补偿券',
    badge: '服务挽损',
    badgeColor: 'bg-rose-100 text-rose-800',
    type: 'fixed',
    discountText: '≤ $10.00',
    discountSub: '无门槛减免额',
    minThreshold: '无门槛限制 · 双人复核',
    validity: '工单发放后 5 天有效',
    applicableCards: '全卡通用',
    statTriggerCount: '本周支出: $310.00',
    statEffectText: '双人签批',
    effectType: 'error',
    status: 'active'
  },
  {
    id: 'tpl-5',
    code: 'TPL-FEE-05',
    name: 'USDT提现免手续费卡 (单笔)',
    badge: '结算通道',
    badgeColor: 'bg-amber-100 text-amber-800',
    type: 'fee',
    discountText: '免 15 USDT',
    discountSub: 'Gas手续费全免',
    minThreshold: '提现满 200 USDT 可用',
    validity: '当月有效 · 自然月清空',
    applicableCards: 'USDT (TRC20 / ERC20)',
    statTriggerCount: '月消耗: 8,420 张',
    statEffectText: '资金回笼提速 +35%',
    effectType: 'primary',
    status: 'active'
  },
  {
    id: 'tpl-6',
    code: 'TPL-SPEED-06',
    name: '极速核销优先VIP直通卡',
    badge: '服务特权',
    badgeColor: 'bg-purple-100 text-purple-800',
    type: 'service',
    discountText: '0 秒排队',
    discountSub: '专线秒级核销',
    minThreshold: '单笔订单面值 ≥ $200',
    validity: 'V3+ 专属永久生效',
    applicableCards: 'Steam / Razer / Apple',
    statTriggerCount: '保全时效 ≤ 45s',
    statEffectText: '大额吞吐主力',
    effectType: 'secondary',
    status: 'active'
  }
];

const INITIAL_COUPONS: BenefitCouponItem[] = [
  {
    id: 'cpn-1',
    couponCode: 'CPN-20260827-0941',
    name: '首单破冰加价券',
    type: 'rate',
    typeLabel: '比例加价券',
    discountDisplay: '+1.00%',
    discountValue: 1.0,
    cardScope: '全卡通用',
    cardScopeTags: ['全卡通用'],
    userUid: '8849102',
    userPhone: '138****0922',
    sourceType: 'campaign',
    sourceCode: 'ACT-REG-2026',
    sourceDesc: '全球新合伙人首单破冰计划',
    orderId: 'KD-20260827-8912',
    status: 'used',
    statusLabel: '已核销',
    expireTimeText: '已核销',
    usedTime: '2026-08-27 14:22:08',
    createTime: '2026-08-25 10:15:00',
    minOrderValue: 50,
    subsidyAmount: 2.5
  },
  {
    id: 'cpn-2',
    couponCode: 'CPN-20260827-0811',
    name: '大额卡单满减溢价券',
    type: 'fixed',
    typeLabel: '固定溢价补贴',
    discountDisplay: '+$15.00 USD',
    discountValue: 15.0,
    cardScope: 'Apple Store / Steam',
    cardScopeTags: ['Apple Store', 'Steam'],
    userUid: '9002144',
    userPhone: '159****4410',
    sourceType: 'tier',
    sourceCode: 'TIER-VIP3-AUTO',
    sourceDesc: 'V3 黄金会员月度专属福利自动配发',
    orderId: 'KD-20260827-7703',
    status: 'used',
    statusLabel: '已核销',
    expireTimeText: '已核销',
    usedTime: '2026-08-27 13:58:31',
    createTime: '2026-08-22 09:00:00',
    minOrderValue: 500,
    subsidyAmount: 15.0
  },
  {
    id: 'cpn-3',
    couponCode: 'CPN-20260827-0518',
    name: '高频出卡周度返现特权',
    type: 'rate',
    typeLabel: '阶梯结算补贴',
    discountDisplay: '+0.30%',
    discountValue: 0.3,
    cardScope: 'Google Play',
    cardScopeTags: ['Google Play'],
    userUid: '7720918',
    userPhone: '186****3391',
    sourceType: 'tier',
    sourceCode: 'WEEKLY-CYCLE-08',
    sourceDesc: '出卡周期履约返现自动空投',
    status: 'active',
    statusLabel: '生效中 (余 48h)',
    expireTimeText: '余 48h 有效',
    createTime: '2026-08-25 18:30:00',
    minOrderValue: 100
  },
  {
    id: 'cpn-4',
    couponCode: 'CPN-20260827-0204',
    name: '客服客诉安抚补偿券',
    type: 'fixed',
    typeLabel: '工单双人签发',
    discountDisplay: '+$8.00 USD',
    discountValue: 8.0,
    cardScope: '全卡通用',
    cardScopeTags: ['全卡通用'],
    userUid: '6511209',
    userPhone: '131****8801',
    sourceType: 'cs',
    sourceCode: 'WO-20260826-092',
    sourceDesc: '客服争议时延补偿双人审批工单',
    workOrderRef: 'WO-20260826-092',
    status: 'active',
    statusLabel: '生效中 (余 5天)',
    expireTimeText: '余 5天 有效',
    createTime: '2026-08-26 16:40:00',
    minOrderValue: 0
  },
  {
    id: 'cpn-5',
    couponCode: 'CPN-20260824-0012',
    name: '新客限时加成券',
    type: 'rate',
    typeLabel: '3天时效券',
    discountDisplay: '+0.80%',
    discountValue: 0.8,
    cardScope: 'Steam',
    cardScopeTags: ['Steam'],
    userUid: '5901238',
    userPhone: '177****5521',
    sourceType: 'campaign',
    sourceCode: 'ACT-REG-OLD',
    sourceDesc: '历史新客注册转化战役',
    status: 'expired',
    statusLabel: '已过期',
    expireTimeText: '2026-08-27 00:00:00',
    createTime: '2026-08-23 00:00:00',
    minOrderValue: 50
  },
  {
    id: 'cpn-6',
    couponCode: 'CPN-20260826-9901',
    name: '大额卡单满减溢价券',
    type: 'fixed',
    typeLabel: '同IP多号聚集',
    discountDisplay: '+$15.00 USD',
    discountValue: 15.0,
    cardScope: 'Razer Gold',
    cardScopeTags: ['Razer Gold'],
    userUid: '9110294',
    userPhone: '198****1299',
    sourceType: 'risk',
    sourceCode: 'RISK-INTERCEPT',
    sourceDesc: '检测到异地高频刷券撞库，系统自动熔断',
    riskReason: '同IP多号聚集抢券，关联卡单 KD-9921 命中防羊毛黑名单',
    status: 'frozen',
    statusLabel: '已冻结 (风控)',
    expireTimeText: '已冻结锁定',
    createTime: '2026-08-26 11:20:00',
    minOrderValue: 500
  },
  {
    id: 'cpn-7',
    couponCode: 'CPN-20260827-1102',
    name: 'Vanilla 大额闪电兑付补贴券',
    type: 'rate',
    typeLabel: '卡种定向冲量',
    discountDisplay: '+0.50%',
    discountValue: 0.5,
    cardScope: 'Vanilla Visa',
    cardScopeTags: ['Vanilla Visa'],
    userUid: '8220491',
    userPhone: '158****2209',
    sourceType: 'campaign',
    sourceCode: 'ACT-202310-064',
    sourceDesc: 'Vanilla Visa 大额闪电兑付专项战役',
    orderId: 'KD-20260827-6641',
    status: 'used',
    statusLabel: '已核销',
    expireTimeText: '已核销',
    usedTime: '2026-08-27 15:10:44',
    createTime: '2026-08-26 08:30:00',
    minOrderValue: 200,
    subsidyAmount: 5.0
  },
  {
    id: 'cpn-8',
    couponCode: 'CPN-20260827-0105',
    name: '极速核销优先VIP直通卡',
    type: 'service',
    typeLabel: '秒级核销特权',
    discountDisplay: '0 秒排队',
    discountValue: 0,
    cardScope: 'Apple / Steam / Razer',
    cardScopeTags: ['Apple', 'Steam', 'Razer'],
    userUid: '9481023',
    userPhone: '139****7721',
    sourceType: 'tier',
    sourceCode: 'TIER-VIP4-PASS',
    sourceDesc: 'V4 铂金黑钻年度专线通道',
    status: 'active',
    statusLabel: '生效中 (永久)',
    expireTimeText: '长期有效',
    createTime: '2026-08-01 00:00:00',
    minOrderValue: 0
  }
];

export const BenefitsGovernanceView: React.FC = () => {
  const [coupons, setCoupons] = useState<BenefitCouponItem[]>(INITIAL_COUPONS);
  const [templates, setTemplates] = useState<BenefitTemplate[]>(INITIAL_TEMPLATES);
  const [universalTemplates, setUniversalTemplates] = useState<UniversalBenefitTemplate[]>(INITIAL_UNIVERSAL_TEMPLATES);
  const [activeSubTab, setActiveSubTab] = useState<
    'workbench' | 'templates' | 'coupons' | 'records' | 'settlement'
  >('workbench');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'used' | 'expired' | 'frozen'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [cardFilter, setCardFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>(['cpn-1', 'cpn-3', 'cpn-6']);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal states
  const [selectedProofCoupon, setSelectedProofCoupon] = useState<BenefitCouponItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isManualIssueModalOpen, setIsManualIssueModalOpen] = useState(false);
  const [riskReviewCoupon, setRiskReviewCoupon] = useState<BenefitCouponItem | null>(null);
  const [isTemplateLibModalOpen, setIsTemplateLibModalOpen] = useState(false);

  // Form states for new template
  const [newTemplateForm, setNewTemplateForm] = useState({
    name: '',
    type: 'rate' as 'rate' | 'fixed' | 'service' | 'fee',
    badge: '运营特惠',
    discountVal: '0.5',
    minThreshold: '100',
    applicableCards: '全卡通用',
    validityDays: '7',
    capBudget: '10000'
  });

  // Form states for manual issue
  const [manualIssueForm, setManualIssueForm] = useState({
    targetUid: '8849102',
    templateId: 'tpl-1',
    reason: 'VIP客户卡单超时补偿，经主管授权补发加价特权券',
    workOrderRef: 'WO-20260827-099',
    reviewerName: '超级调度员 (OP-01)'
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3200);
  };

  // Filtered coupons
  const filteredCoupons = useMemo(() => {
    return coupons.filter(item => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (cardFilter !== 'all' && !item.cardScope.toLowerCase().includes(cardFilter.toLowerCase()) && item.cardScope !== '全卡通用') {
        return false;
      }
      if (channelFilter !== 'all' && item.sourceType !== channelFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.couponCode.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.userUid.includes(q) ||
          item.userPhone.includes(q) ||
          (item.orderId && item.orderId.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [coupons, statusFilter, typeFilter, cardFilter, channelFilter, searchQuery]);

  // Bulk actions
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCoupons.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCoupons.map(c => c.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const handleBatchExtend = () => {
    if (selectedIds.length === 0) return;
    setCoupons(prev =>
      prev.map(c => (selectedIds.includes(c.id) ? { ...c, expireTimeText: '已延长 24h 有效期' } : c))
    );
    showToast(`已为选中的 ${selectedIds.length} 张权益券顺延 +24h 有效使用时限！`);
  };

  const handleBatchFreeze = () => {
    if (selectedIds.length === 0) return;
    setCoupons(prev =>
      prev.map(c =>
        selectedIds.includes(c.id)
          ? { ...c, status: 'frozen', statusLabel: '已冻结 (批量风控)' }
          : c
      )
    );
    showToast(`风控防线生效：已将选中的 ${selectedIds.length} 个权益资产项目标记异常并锁定！`);
  };

  const handleBatchPass = () => {
    if (selectedIds.length === 0) return;
    setCoupons(prev =>
      prev.map(c =>
        selectedIds.includes(c.id) && c.status === 'frozen'
          ? { ...c, status: 'active', statusLabel: '生效中 (人工放行)' }
          : c
      )
    );
    showToast(`人工双人复核已通过：已解冻并放行选中的权益凭证！`);
  };

  // Create new template handler
  const handleCreateTemplate = () => {
    if (!newTemplateForm.name?.trim()) {
      showToast('请填写权益模板名称！');
      return;
    }
    const newTpl: BenefitTemplate = {
      id: `tpl-${Date.now()}`,
      code: `TPL-${newTemplateForm.type.toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      name: newTemplateForm.name,
      badge: newTemplateForm.badge,
      badgeColor: 'bg-blue-100 text-blue-800',
      type: newTemplateForm.type,
      discountText:
        newTemplateForm.type === 'rate'
          ? `+${newTemplateForm.discountVal}%`
          : newTemplateForm.type === 'fixed'
          ? `+$${newTemplateForm.discountVal}`
          : '专属特权',
      discountSub: newTemplateForm.type === 'rate' ? '加价上浮' : '直接补贴',
      minThreshold: `满 $${newTemplateForm.minThreshold}.00 USD`,
      validity: `${newTemplateForm.validityDays} 天有效`,
      applicableCards: newTemplateForm.applicableCards,
      statTriggerCount: '新创未发放',
      statEffectText: '待上线流转',
      effectType: 'primary',
      status: 'active'
    };
    setTemplates([newTpl, ...templates]);
    setIsCreateModalOpen(false);
    showToast(`新权益模板【${newTemplateForm.name}】(${newTpl.code}) 已生成并纳入全域规则库！`);
  };

  // Manual issue submit handler
  const handleManualIssueSubmit = () => {
    const targetTpl = templates.find(t => t.id === manualIssueForm.templateId) || templates[0];
    const newCoupon: BenefitCouponItem = {
      id: `cpn-${Date.now()}`,
      couponCode: `CPN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      name: targetTpl.name,
      type: targetTpl.type === 'rate' ? 'rate' : targetTpl.type === 'service' ? 'service' : 'fixed',
      typeLabel: targetTpl.type === 'rate' ? '比例加价券' : targetTpl.type === 'service' ? '专属特权' : '固定补贴券',
      discountDisplay: targetTpl.discountText,
      discountValue: parseFloat(targetTpl.discountText.replace(/[^0-9.]/g, '')) || 0,
      cardScope: targetTpl.applicableCards,
      cardScopeTags: [targetTpl.applicableCards],
      userUid: manualIssueForm.targetUid,
      userPhone: '138****' + Math.floor(1000 + Math.random() * 9000),
      sourceType: 'manual',
      sourceCode: manualIssueForm.workOrderRef,
      sourceDesc: `运营双人复核手动补发 · ${manualIssueForm.reason}`,
      status: 'active',
      statusLabel: '生效中 (余 7天)',
      expireTimeText: '余 7天 有效',
      createTime: new Date().toLocaleString(),
      minOrderValue: 50,
      workOrderRef: manualIssueForm.workOrderRef
    };

    setCoupons([newCoupon, ...coupons]);
    setIsManualIssueModalOpen(false);
    showToast(`已成功为用户 UID:${manualIssueForm.targetUid} 手动补发【${targetTpl.name}】(${newCoupon.couponCode})！`);
  };

  // Unfreeze single coupon
  const handleUnfreezeSingle = (c: BenefitCouponItem) => {
    setCoupons(prev =>
      prev.map(item =>
        item.id === c.id ? { ...item, status: 'active', statusLabel: '生效中 (已解冻)' } : item
      )
    );
    setRiskReviewCoupon(null);
    showToast(`券码【${c.couponCode}】经核验无异常，已完成解冻复核并恢复履约权限！`);
  };

  return (
    <div className="flex flex-col w-full space-y-4 text-[#0b1c30] antialiased text-xs">
      {/* 顶部浮动消息通知 */}
      {toastMsg && (
        <div className="fixed top-16 right-8 z-50 bg-[#0b1c30] text-white text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 border border-slate-700 animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 顶部统一业务标头 */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white px-5 py-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              05 权益管理 · 全域权益中枢与优惠券加价券治理台
            </h1>
            <span className="font-mono text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full uppercase font-semibold inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Engine Active · 实时对账
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1 max-w-4xl">
            统一纳管优惠券、报价加成特权、成长值与专属服务，打通发放来源追溯与交易结账核销闭环。
          </p>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 shadow-2xs">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">verified_user</span>
            <div className="flex flex-col text-right">
              <span className="font-mono text-[10px] text-slate-400">风控阻断阈值</span>
              <span className="font-mono text-xs font-semibold text-slate-800">CAP &lt; 2.0%</span>
            </div>
          </div>
          <button
            onClick={() => showToast('全域权益与优惠券核销大盘已同步最新结算数据！')}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-500">sync</span>
            <span>刷新大盘</span>
          </button>
        </div>
      </header>

      {/* 顶部场景化 Tab 切换栏 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 bg-white p-1 rounded-xl shadow-xs border border-slate-200/80">
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveSubTab('workbench')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeSubTab === 'workbench'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              <span>全景工作台</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-white/20 text-white font-semibold">
                ACTIVE
              </span>
            </button>
            <button
              onClick={() => setActiveSubTab('templates')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeSubTab === 'templates'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>权益配置 (通用模板库)</span>
              <span className="font-mono text-[10px] px-1 rounded bg-slate-200/60 text-slate-600">
                {universalTemplates.length}
              </span>
            </button>
            <button
              onClick={() => setActiveSubTab('coupons')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeSubTab === 'coupons'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
              <span>优惠券管理 (加价券台账)</span>
            </button>
            <button
              onClick={() => setActiveSubTab('records')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeSubTab === 'records'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">track_changes</span>
              <span>发放记录 (全量来源追溯)</span>
            </button>
            <button
              onClick={() => setActiveSubTab('settlement')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeSubTab === 'settlement'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">receipt</span>
              <span>核销流水 (卡单关联穿透)</span>
            </button>
          </div>
          <div className="flex items-center gap-2 px-2 text-slate-400 font-mono text-[11px] self-end md:self-auto">
            <span>结算节点: US-EAST-01</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        </div>

      {activeSubTab === 'templates' ? (
        <UniversalTemplateLibraryModule
          templates={universalTemplates}
          onUpdateTemplates={setUniversalTemplates}
          onOpenManualIssue={tpl => {
            setManualIssueForm(prev => ({
              ...prev,
              templateId: tpl.id,
              reason: `基于通用模板【${tpl.name}】运营补发`
            }));
            setIsManualIssueModalOpen(true);
          }}
          showToast={showToast}
        />
      ) : (
        <>
          {/* 第一视线层：4 大权益资金与核销宏观大盘看板 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 指标 1 */}
        <div className="relative overflow-hidden p-4 rounded-xl bg-white shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                在途有效券包总值
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-mono text-2xl font-bold text-slate-900">$86,400.00</span>
                <span className="font-mono text-xs text-slate-400">USD</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between bg-slate-50 -mx-4 -mb-4 px-4 py-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              <span className="text-[11px] text-slate-500">未核销锁定中 · 防超发机制</span>
            </div>
            <span className="font-mono text-[11px] text-blue-600 font-semibold">99.4% 安全池</span>
          </div>
        </div>

        {/* 指标 2 */}
        <div className="relative overflow-hidden p-4 rounded-xl bg-white shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                本月累计核销补贴支出
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-mono text-2xl font-bold text-slate-900">$38,250.00</span>
                <span className="font-mono text-xs text-slate-400">USD</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined text-[20px]">price_check</span>
            </div>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between bg-slate-50 -mx-4 -mb-4 px-4 py-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500">GMV 占比:</span>
              <span className="font-mono text-[11px] font-semibold text-emerald-700">1.25%</span>
            </div>
            <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-semibold font-mono">
              警戒线 2.0% 内
            </span>
          </div>
        </div>

        {/* 指标 3 */}
        <div className="relative overflow-hidden p-4 rounded-xl bg-white shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                报价加权平均上浮点
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-mono text-2xl font-bold text-emerald-700">+0.28%</span>
                <span className="font-mono text-xs text-slate-400">PTS</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[20px]">currency_exchange</span>
            </div>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between bg-slate-50 -mx-4 -mb-4 px-4 py-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500">出卡实得汇率平均上浮</span>
            <div className="flex items-center text-emerald-700 font-mono text-[11px] font-semibold">
              <span className="material-symbols-outlined text-[14px]">north</span>
              <span>0.04% 环比</span>
            </div>
          </div>
        </div>

        {/* 指标 4 */}
        <div className="relative overflow-hidden p-4 rounded-xl bg-white shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                权益拉动出单转化率
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-mono text-2xl font-bold text-slate-900">68.4%</span>
                <span className="font-mono text-xs text-emerald-700 font-semibold ml-1">↑ 高履约</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
            </div>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between bg-slate-50 -mx-4 -mb-4 px-4 py-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500">持券用户 7 日内核销履约</span>
            <div className="w-20 bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: '68.4%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* 第二视线层：核心权益模板库展示 (卡片式) */}
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">verified</span>
            <h2 className="text-sm font-bold text-slate-900">优惠券与权益资产分类台账</h2>
            <span className="font-mono text-[11px] text-slate-500 px-2 py-0.5 rounded bg-slate-100 border border-slate-200/60">
              已纳管 {universalTemplates.length} 类重点发券模板
            </span>
          </div>
          <button
            onClick={() => setActiveSubTab('templates')}
            className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium cursor-pointer"
          >
            <span>进入通用模板库管理全部 ({universalTemplates.length})</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {templates.slice(0, 4).map(tpl => (
            <div
              key={tpl.id}
              className="group p-4 rounded-xl bg-white hover:bg-slate-50/80 transition-all shadow-sm border border-slate-200/80 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-3xl pointer-events-none"></div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold ${tpl.badgeColor}`}>
                    {tpl.badge}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{tpl.name}</h3>
                <div className="flex items-baseline gap-1 my-2">
                  <span
                    className={`font-mono text-2xl font-bold ${
                      tpl.effectType === 'secondary'
                        ? 'text-emerald-700'
                        : tpl.effectType === 'tertiary'
                        ? 'text-indigo-600'
                        : tpl.effectType === 'error'
                        ? 'text-rose-600'
                        : 'text-blue-600'
                    }`}
                  >
                    {tpl.discountText}
                  </span>
                  <span className="text-xs text-slate-400">{tpl.discountSub}</span>
                </div>
                <div className="space-y-1 text-slate-600 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-slate-400">check_circle</span>
                    <span>门槛：{tpl.minThreshold}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-slate-400">schedule</span>
                    <span>有效期：{tpl.validity}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-slate-400 font-mono text-[11px]">
                <span>{tpl.statTriggerCount}</span>
                <span className="text-emerald-700 font-medium">{tpl.statEffectText}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 第三视线层：多条件综合检索栏与全局操作 */}
      <div className="p-3.5 rounded-xl bg-white shadow-sm border border-slate-200/80 flex flex-col gap-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {/* 搜索框 */}
          <div className="lg:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <span className="material-symbols-outlined text-[18px]">search</span>
            </div>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
              placeholder="搜索券码 (CPN-xxxx) / 权益名称 / 用户 UID / 手机号"
              type="text"
            />
          </div>

          {/* 权益类型 */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full h-8 px-2.5 appearance-none rounded-lg bg-slate-50 border border-slate-200/80 text-slate-800 text-xs focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer font-medium"
            >
              <option value="all">全部权益类型</option>
              <option value="rate">比例加价券 (Percentage)</option>
              <option value="fixed">固定金额加价券 (Fixed Cash)</option>
              <option value="service">极速核销服务特权</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-slate-400">
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </div>
          </div>

          {/* 适用卡种限制 */}
          <div className="relative">
            <select
              value={cardFilter}
              onChange={e => setCardFilter(e.target.value)}
              className="w-full h-8 px-2.5 appearance-none rounded-lg bg-slate-50 border border-slate-200/80 text-slate-800 text-xs focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer font-medium"
            >
              <option value="all">全卡种适用 (通用)</option>
              <option value="apple">Apple Store Gift Card</option>
              <option value="steam">Steam Wallet Global</option>
              <option value="google">Google Play Cards</option>
              <option value="razer">Razer Gold PIN</option>
              <option value="vanilla">Vanilla Visa / Mastercard</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-slate-400">
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </div>
          </div>

          {/* 发放渠道 */}
          <div className="relative">
            <select
              value={channelFilter}
              onChange={e => setChannelFilter(e.target.value)}
              className="w-full h-8 px-2.5 appearance-none rounded-lg bg-slate-50 border border-slate-200/80 text-slate-800 text-xs focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer font-medium"
            >
              <option value="all">全渠道来源</option>
              <option value="campaign">活动触发 (拉新/首购)</option>
              <option value="tier">等级自动享有 (VIP)</option>
              <option value="cs">客服争议补偿工单</option>
              <option value="manual">运营批量人工配发</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-slate-400">
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </div>
          </div>
        </div>

        {/* 二级检索与操作按钮组 */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">使用状态:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === 'all'
                    ? 'text-white bg-blue-600 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                全部 ({coupons.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === 'active'
                    ? 'text-white bg-blue-600 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                生效中 ({coupons.filter(c => c.status === 'active').length})
              </button>
              <button
                onClick={() => setStatusFilter('used')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === 'used'
                    ? 'text-white bg-blue-600 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                已核销 ({coupons.filter(c => c.status === 'used').length})
              </button>
              <button
                onClick={() => setStatusFilter('expired')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === 'expired'
                    ? 'text-white bg-blue-600 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                已过期 ({coupons.filter(c => c.status === 'expired').length})
              </button>
              <button
                onClick={() => setStatusFilter('frozen')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === 'frozen'
                    ? 'text-white bg-rose-600 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                已冻结 ({coupons.filter(c => c.status === 'frozen').length})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                showToast(`已生成全量 ${filteredCoupons.length} 笔核销流水对账报表 (CSV/Excel)`);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-slate-500">download</span>
              <span>导出核销流水对账单</span>
            </button>
            <button
              onClick={() => setIsManualIssueModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-indigo-600">approval</span>
              <span>批量人工补发 (双人复核)</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>+ 创建新权益模板</span>
            </button>
          </div>
        </div>
      </div>

      {/* 第四视线层：全域权益发放与卡单核销穿透明细表格 */}
      <div className="rounded-xl bg-white shadow-sm border border-slate-200/80 overflow-hidden flex flex-col">
        <div className="p-3 flex items-center justify-between bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">权益明细台账与核销追溯流</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-[10px] font-semibold">
              实时撮合流水
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <span>当前选定: <strong className="text-slate-800">全部渠道</strong></span>
            <span>·</span>
            <span>对账匹配率: <strong className="text-emerald-700 font-mono">100.00%</strong></span>
          </div>
        </div>

        {/* 表格内容 */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[1280px]">
            <thead>
              <tr className="h-9 bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200">
                <th className="px-3 py-2 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredCoupons.length && filteredCoupons.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded bg-white text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="px-3 py-2">券码编号</th>
                <th className="px-3 py-2">权益名称与类型</th>
                <th className="px-3 py-2">面额 / 加成比例</th>
                <th className="px-3 py-2">适用卡种限制</th>
                <th className="px-3 py-2">持有出卡用户</th>
                <th className="px-3 py-2">发放来源追溯</th>
                <th className="px-3 py-2">关联交易卡单号</th>
                <th className="px-3 py-2">券状态</th>
                <th className="px-3 py-2">核销时间戳</th>
                <th className="px-3 py-2 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-[36px] text-slate-300 block mb-1">inbox</span>
                    未找到符合当前检索条件的权益明细记录
                  </td>
                </tr>
              ) : (
                filteredCoupons.map(row => {
                  const isSelected = selectedIds.includes(row.id);
                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-50/80 transition-colors h-12 ${
                        isSelected ? 'bg-blue-50/30' : ''
                      } ${row.status === 'frozen' ? 'bg-rose-50/30' : ''}`}
                    >
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(row.id)}
                          className="rounded bg-white text-blue-600 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-2 font-mono text-blue-600 font-medium">
                        {row.couponCode}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">{row.name}</span>
                          <span className="text-slate-400 font-mono text-[10px]">{row.typeLabel}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 font-mono font-bold">
                        <span
                          className={
                            row.type === 'rate'
                              ? 'text-emerald-700'
                              : row.type === 'service'
                              ? 'text-purple-700'
                              : row.status === 'frozen'
                              ? 'text-rose-600'
                              : 'text-blue-600'
                          }
                        >
                          {row.discountDisplay}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap items-center gap-1">
                          {row.cardScopeTags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <span className="font-mono font-medium text-slate-900">UID: {row.userUid}</span>
                          <span className="text-slate-400 font-mono text-[10px]">{row.userPhone}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          {row.sourceType === 'campaign' ? (
                            <span className="material-symbols-outlined text-[16px] text-blue-600">campaign</span>
                          ) : row.sourceType === 'tier' ? (
                            <span className="material-symbols-outlined text-[16px] text-amber-600">workspace_premium</span>
                          ) : row.sourceType === 'cs' ? (
                            <span className="material-symbols-outlined text-[16px] text-rose-500">support_agent</span>
                          ) : row.sourceType === 'risk' ? (
                            <span className="material-symbols-outlined text-[16px] text-rose-600">security</span>
                          ) : (
                            <span className="material-symbols-outlined text-[16px] text-slate-400">autorenew</span>
                          )}
                          <span className="font-mono text-xs">{row.sourceCode}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        {row.orderId ? (
                          <button
                            onClick={() => setSelectedProofCoupon(row)}
                            className="font-mono text-blue-600 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                          >
                            <span>{row.orderId}</span>
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                          </button>
                        ) : row.status === 'frozen' ? (
                          <span className="font-mono text-rose-600">已拦截挂起</span>
                        ) : (
                          <span className="font-mono text-slate-400">待提交出卡</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {row.status === 'used' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            已核销
                          </span>
                        ) : row.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono text-[10px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                            {row.statusLabel}
                          </span>
                        ) : row.status === 'expired' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-mono text-[10px]">
                            已过期
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-mono text-[10px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                            已冻结 (风控)
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono text-slate-500 text-[11px]">
                        {row.usedTime || '--'}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {row.status === 'used' ? (
                          <button
                            onClick={() => setSelectedProofCoupon(row)}
                            className="text-blue-600 hover:underline font-medium cursor-pointer"
                          >
                            凭证穿透
                          </button>
                        ) : row.status === 'frozen' ? (
                          <button
                            onClick={() => setRiskReviewCoupon(row)}
                            className="text-rose-600 hover:underline font-bold cursor-pointer"
                          >
                            解冻复核
                          </button>
                        ) : row.workOrderRef ? (
                          <button
                            onClick={() => {
                              showToast(`查看工单【${row.workOrderRef}】：双人审批合规签批已归档`);
                            }}
                            className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                          >
                            查看工单
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setCoupons(prev =>
                                prev.map(c =>
                                  c.id === row.id ? { ...c, status: 'frozen', statusLabel: '已冻结 (手动)' } : c
                                )
                              );
                              showToast(`已将券码【${row.couponCode}】临时锁定冻结`);
                            }}
                            className="text-slate-500 hover:text-slate-900 font-medium cursor-pointer"
                          >
                            冻结管理
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 表格底部与沉稳分页栏 */}
        <div className="p-3 flex flex-wrap items-center justify-between gap-2 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center gap-3 text-slate-500 text-xs">
            <span>
              显示第 <strong className="text-slate-900">1</strong> 到{' '}
              <strong className="text-slate-900">{filteredCoupons.length}</strong> 条，共{' '}
              <strong className="text-slate-900">1,280</strong> 条权益账单记录
            </span>
            <div className="flex items-center gap-1 text-slate-500">
              <span>每页行数:</span>
              <select className="h-6 px-1 rounded bg-white border border-slate-200 text-slate-800 font-mono text-[11px] focus:outline-none">
                <option>20 条/页</option>
                <option>50 条/页</option>
                <option>100 条/页</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              className="w-7 h-7 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 disabled:opacity-40 cursor-pointer"
              disabled
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <button className="w-7 h-7 rounded bg-blue-600 text-white font-mono text-xs font-semibold flex items-center justify-center shadow-xs">
              1
            </button>
            <button className="w-7 h-7 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-mono text-xs flex items-center justify-center cursor-pointer">
              2
            </button>
            <button className="w-7 h-7 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-mono text-xs flex items-center justify-center cursor-pointer">
              3
            </button>
            <span className="px-1 text-slate-400">...</span>
            <button className="w-7 h-7 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-mono text-xs flex items-center justify-center cursor-pointer">
              64
            </button>
            <button className="w-7 h-7 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer">
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* 浮动批量作业操作条 (Sticky Action Dock, 默认显示支持批量风控与复核) */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold text-white">批量快速处置中心</span>
          </div>
          <div className="h-4 w-[1px] bg-slate-700"></div>
          <span className="text-xs text-slate-300">
            已选中 <strong className="text-emerald-400 font-mono">{selectedIds.length}</strong> 个权益资产项目
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleBatchExtend}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs transition-colors cursor-pointer"
          >
            延长有效期限 (+24h)
          </button>
          <button
            onClick={handleBatchFreeze}
            className="px-3 py-1.5 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-rose-100 text-xs font-medium transition-colors cursor-pointer"
          >
            标记异常风控冻结
          </button>
          <button
            onClick={handleBatchPass}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
          >
            发起人工重核并放行
          </button>
        </div>
      </div>
      </>
      )}

      {/* ======================================================== */}
      {/* 模态 1: 凭证穿透与卡单溯源抽屉 (Voucher Proof Drawer) */}
      {/* ======================================================== */}
      {selectedProofCoupon && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xl h-full bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200">
            <div>
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">核销凭证穿透与全链路溯源</h3>
                    <div className="font-mono text-xs text-blue-600 font-semibold mt-0.5">
                      {selectedProofCoupon.couponCode}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProofCoupon(null)}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)]">
                {/* 状态总览卡 */}
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-700 uppercase font-semibold font-mono">核销状态</span>
                    <div className="text-base font-bold text-emerald-900 flex items-center gap-1.5 mt-0.5">
                      <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                      <span>已成功核销抵扣</span>
                    </div>
                    <div className="text-xs text-emerald-700 font-mono mt-1">
                      核销时间: {selectedProofCoupon.usedTime || '2026-08-27 14:22:08'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400">实际补贴支出</span>
                    <div className="font-mono text-xl font-bold text-emerald-700">
                      +${(selectedProofCoupon.subsidyAmount || 5.0).toFixed(2)} USD
                    </div>
                  </div>
                </div>

                {/* 关联交易卡单信息 */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-900">关联交易卡单 (Order Info)</span>
                    <span className="font-mono text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                      {selectedProofCoupon.orderId || 'KD-20260827-8912'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400">出卡商户/用户:</span>
                      <div className="font-semibold text-slate-800">
                        UID {selectedProofCoupon.userUid} ({selectedProofCoupon.userPhone})
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">适用卡种/类目:</span>
                      <div className="font-semibold text-slate-800">{selectedProofCoupon.cardScope}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">门槛要求:</span>
                      <div className="font-mono text-slate-700">单笔 ≥ ${selectedProofCoupon.minOrderValue}.00 USD</div>
                    </div>
                    <div>
                      <span className="text-slate-400">核销优惠规则:</span>
                      <div className="font-semibold text-emerald-700">{selectedProofCoupon.discountDisplay}</div>
                    </div>
                  </div>
                </div>

                {/* 来源追溯 */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                  <span className="text-xs font-bold text-slate-900">来源追溯链路 (Audit Trail)</span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">发放活动/工单代号:</span>
                      <span className="font-mono font-semibold text-slate-800">{selectedProofCoupon.sourceCode}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">来源场景描述:</span>
                      <span className="text-slate-700">{selectedProofCoupon.sourceDesc}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">发券时间戳:</span>
                      <span className="font-mono text-slate-600">{selectedProofCoupon.createTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">防重放防伪签名:</span>
                      <span className="font-mono text-[10px] text-slate-500 truncate max-w-[240px]">
                        sha256:7f9b8c2e4a1d0f5e6a7c8b9d0e1f2a3b
                      </span>
                    </div>
                  </div>
                </div>

                {/* 会计分录分摊明细 */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                  <span className="text-xs font-bold text-slate-900">财务结算分摊与预算占用</span>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>卡单原始报价基准:</span>
                      <span className="font-mono">$245.00 USD</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>权益加价补贴金额 ({selectedProofCoupon.discountDisplay}):</span>
                      <span className="font-mono">+${(selectedProofCoupon.subsidyAmount || 5.0).toFixed(2)} USD</span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-bold border-t border-slate-100 pt-1">
                      <span>出卡方实际到账结算金额:</span>
                      <span className="font-mono text-blue-600">
                        ${(245.0 + (selectedProofCoupon.subsidyAmount || 5.0)).toFixed(2)} USD
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  showToast(`已调取凭证 PDF 归档件：${selectedProofCoupon.couponCode}.pdf`);
                }}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium cursor-pointer"
              >
                下载对账核销凭据
              </button>
              <button
                onClick={() => setSelectedProofCoupon(null)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 模态 2: 创建新权益模板 (Create Benefit Modal) */}
      {/* ======================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">add_circle</span>
                <h3 className="text-sm font-bold text-slate-900">创建新权益发券模板 ()</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="material-symbols-outlined text-slate-400 hover:text-slate-700 text-[20px] cursor-pointer"
              >
                close
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">权益模板名称</label>
                <input
                  type="text"
                  placeholder="如：Black Friday Steam 独家限时满赠加价券"
                  value={newTemplateForm.name}
                  onChange={e => setNewTemplateForm({ ...newTemplateForm, name: e.target.value })}
                  className="w-full h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">权益类型</label>
                  <select
                    value={newTemplateForm.type}
                    onChange={e =>
                      setNewTemplateForm({ ...newTemplateForm, type: e.target.value as any })
                    }
                    className="w-full h-8 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="rate">比例加价券 (Percentage)</option>
                    <option value="fixed">固定金额加价 (Fixed Cash)</option>
                    <option value="fee">提现免手续费卡 (Fee Waiver)</option>
                    <option value="service">极速专线核销卡 (Speed Lane)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">战役标签</label>
                  <input
                    type="text"
                    value={newTemplateForm.badge}
                    onChange={e => setNewTemplateForm({ ...newTemplateForm, badge: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {newTemplateForm.type === 'rate' ? '上浮比例 (%)' : '固定补贴金额 ($)'}
                  </label>
                  <input
                    type="text"
                    value={newTemplateForm.discountVal}
                    onChange={e => setNewTemplateForm({ ...newTemplateForm, discountVal: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">最低卡单起用门槛 ($)</label>
                  <input
                    type="text"
                    value={newTemplateForm.minThreshold}
                    onChange={e => setNewTemplateForm({ ...newTemplateForm, minThreshold: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">适用卡种</label>
                  <input
                    type="text"
                    value={newTemplateForm.applicableCards}
                    onChange={e =>
                      setNewTemplateForm({ ...newTemplateForm, applicableCards: e.target.value })
                    }
                    className="w-full h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">有效时限 (天)</label>
                  <input
                    type="text"
                    value={newTemplateForm.validityDays}
                    onChange={e => setNewTemplateForm({ ...newTemplateForm, validityDays: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">security</span>
                <span>防刷熔断控制：已自动挂载单人最多 5 次 / 单日总补贴上限 $10,000 USD 限制</span>
              </div>
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleCreateTemplate}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium cursor-pointer shadow-xs"
              >
                确认创建并发布
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 模态 3: 批量人工补发与双人复核 (Manual Issue Modal) */}
      {/* ======================================================== */}
      {isManualIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-[20px]">approval</span>
                <h3 className="text-sm font-bold text-slate-900">人工补发权益凭证 (双人审核流)</h3>
              </div>
              <button
                onClick={() => setIsManualIssueModalOpen(false)}
                className="material-symbols-outlined text-slate-400 hover:text-slate-700 text-[20px] cursor-pointer"
              >
                close
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">目标出卡用户 (UID 或手机号)</label>
                <input
                  type="text"
                  value={manualIssueForm.targetUid}
                  onChange={e => setManualIssueForm({ ...manualIssueForm, targetUid: e.target.value })}
                  className="w-full h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono focus:bg-white focus:outline-none"
                  placeholder="输入用户 UID，支持英文逗号批量录入"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">选择补发的权益模板</label>
                <select
                  value={manualIssueForm.templateId}
                  onChange={e => setManualIssueForm({ ...manualIssueForm, templateId: e.target.value })}
                  className="w-full h-8 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none cursor-pointer"
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.discountText} - {t.minThreshold})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">关联服务争议/仲裁工单号</label>
                <input
                  type="text"
                  value={manualIssueForm.workOrderRef}
                  onChange={e => setManualIssueForm({ ...manualIssueForm, workOrderRef: e.target.value })}
                  className="w-full h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">补发申请原因与审计说明</label>
                <textarea
                  rows={2}
                  value={manualIssueForm.reason}
                  onChange={e => setManualIssueForm({ ...manualIssueForm, reason: e.target.value })}
                  className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center justify-between">
                <div>
                  <span className="font-semibold block">复核审批人</span>
                  <span>{manualIssueForm.reviewerName}</span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-200 text-blue-900 font-semibold">
                  AUDIT PASS
                </span>
              </div>
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsManualIssueModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleManualIssueSubmit}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium cursor-pointer shadow-xs"
              >
                签署并即刻空投
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 模态 4: 解冻与风控复核弹窗 (Risk Review Modal) */}
      {/* ======================================================== */}
      {riskReviewCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-rose-50/80">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-[20px]">gfm</span>
                <h3 className="text-sm font-bold text-rose-900">风控冻结研判与人工解冻</h3>
              </div>
              <button
                onClick={() => setRiskReviewCoupon(null)}
                className="material-symbols-outlined text-slate-400 hover:text-slate-700 text-[20px] cursor-pointer"
              >
                close
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">冻结券码:</span>
                  <span className="font-mono font-semibold text-rose-600">{riskReviewCoupon.couponCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">所属用户:</span>
                  <span className="font-mono text-slate-800">UID: {riskReviewCoupon.userUid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">优惠内容:</span>
                  <span className="font-bold text-slate-800">{riskReviewCoupon.name} ({riskReviewCoupon.discountDisplay})</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
                <span className="font-bold block">风控规则拦截原因</span>
                <p className="leading-relaxed">{riskReviewCoupon.riskReason || '异地IP突增 / 关联黑产撞库'}</p>
              </div>

              <p className="text-slate-500 text-[11px] leading-relaxed">
                若经核验确认该用户为真实合规出卡方，可发起人工解冻。解冻后该券立即恢复可用状态，并自动从风险封控池释放。
              </p>
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setRiskReviewCoupon(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium cursor-pointer"
              >
                维持冻结
              </button>
              <button
                onClick={() => handleUnfreezeSingle(riskReviewCoupon)}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer shadow-xs"
              >
                确认放行解冻
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 模态 5: 全量通用模板库弹窗 (Template Library Modal) */}
      {/* ======================================================== */}
      {isTemplateLibModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-3xl max-h-[85vh] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col justify-between">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">category</span>
                <h3 className="text-sm font-bold text-slate-900">通用权益模板库 ({templates.length})</h3>
              </div>
              <button
                onClick={() => setIsTemplateLibModalOpen(false)}
                className="material-symbols-outlined text-slate-400 hover:text-slate-700 text-[20px] cursor-pointer"
              >
                close
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {templates.map(tpl => (
                  <div
                    key={tpl.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-sm transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{tpl.name}</span>
                      <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-semibold ${tpl.badgeColor}`}>
                        {tpl.badge}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-xl font-bold text-blue-600">{tpl.discountText}</span>
                      <span className="text-slate-400 text-xs">{tpl.discountSub}</span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-0.5">
                      <div>门槛：{tpl.minThreshold}</div>
                      <div>适用卡种：{tpl.applicableCards}</div>
                      <div>有效期：{tpl.validity}</div>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{tpl.code}</span>
                      <button
                        onClick={() => {
                          setManualIssueForm({ ...manualIssueForm, templateId: tpl.id });
                          setIsTemplateLibModalOpen(false);
                          setIsManualIssueModalOpen(true);
                        }}
                        className="text-blue-600 hover:underline font-semibold font-sans cursor-pointer"
                      >
                        使用此模板补发
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setIsTemplateLibModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium cursor-pointer shadow-xs"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
