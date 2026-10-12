import React, { useState, useMemo } from 'react';

export interface CampaignItem {
  id: string;
  code: string;
  name: string;
  tag: string;
  tagType: 'focus' | 'regular' | 'auto' | 'warmup' | 'draft';
  goal: 'vip' | 'new_user' | 'dormant' | 'card_incentive';
  goalLabel: string;
  cardScope: string;
  region: string;
  cohortSize: number;
  startDate: string;
  endDate: string;
  remainingDaysText: string;
  status: 'live' | 'pending' | 'ended' | 'draft' | 'suspended';
  statusLabel: string;
  reachedCount: number;
  convertedCount: number;
  conversionRateText: string;
  orderCount: number;
  gmv: number;
  subsidyCost: number;
  budgetLimit: number;
  roi: number; // e.g. 63.68 -> 1 : 63.68
}

const INITIAL_CAMPAIGNS: CampaignItem[] = [
  {
    id: 'camp-1',
    code: 'ACT-202310-091',
    name: '西非秋季大额出卡狂欢节',
    tag: '重点保供',
    tagType: 'focus',
    goal: 'vip',
    goalLabel: '高客促活',
    cardScope: 'Apple / Steam 卡',
    region: 'NG 尼日利亚 / GH 加纳',
    cohortSize: 4210,
    startDate: '10-12',
    endDate: '10-26',
    remainingDaysText: '剩余 8 天',
    status: 'live',
    statusLabel: '进行中',
    reachedCount: 3980,
    convertedCount: 1842,
    conversionRateText: '46.2%',
    orderCount: 6480,
    gmv: 942500,
    subsidyCost: 14800,
    budgetLimit: 20000,
    roi: 63.68
  },
  {
    id: 'camp-2',
    code: 'ACT-202310-088',
    name: '全球新合伙人首单破冰计划',
    tag: '常态化运营',
    tagType: 'regular',
    goal: 'new_user',
    goalLabel: '拉新破冰',
    cardScope: '全卡种通用',
    region: '全球合规全区',
    cohortSize: 3200,
    startDate: '10-01',
    endDate: '10-31',
    remainingDaysText: '长期通道',
    status: 'live',
    statusLabel: '进行中',
    reachedCount: 2850,
    convertedCount: 1420,
    conversionRateText: '49.8%',
    orderCount: 2940,
    gmv: 428000,
    subsidyCost: 11200,
    budgetLimit: 15000,
    roi: 38.21
  },
  {
    id: 'camp-3',
    code: 'ACT-202310-072',
    name: '60天沉睡批发商专属返佣令',
    tag: '自动化流水线',
    tagType: 'auto',
    goal: 'dormant',
    goalLabel: '沉睡召回',
    cardScope: 'Razer Gold / Google',
    region: '东南亚 / 欧洲区',
    cohortSize: 5120,
    startDate: '10-05',
    endDate: '10-25',
    remainingDaysText: '剩余 7 天',
    status: 'live',
    statusLabel: '进行中',
    reachedCount: 4910,
    convertedCount: 1518,
    conversionRateText: '30.9%',
    orderCount: 4120,
    gmv: 582000,
    subsidyCost: 12400,
    budgetLimit: 18000,
    roi: 46.93
  },
  {
    id: 'camp-4',
    code: 'ACT-202310-099',
    name: 'Steam秋季特惠定向加价冲量赛',
    tag: '待预热',
    tagType: 'warmup',
    goal: 'card_incentive',
    goalLabel: '卡种定向加价',
    cardScope: 'Steam Wallet (USD/EUR)',
    region: '全球美欧节点',
    cohortSize: 6800,
    startDate: '10-20',
    endDate: '11-03',
    remainingDaysText: '2天后启动',
    status: 'pending',
    statusLabel: '待上线 (就绪)',
    reachedCount: 0,
    convertedCount: 0,
    conversionRateText: '排队推送中',
    orderCount: 0,
    gmv: 0,
    subsidyCost: 0,
    budgetLimit: 25000,
    roi: 0
  },
  {
    id: 'camp-5',
    code: 'ACT-202310-064',
    name: 'Vanilla Visa 大额闪电兑付补贴',
    tag: '重点保供',
    tagType: 'focus',
    goal: 'card_incentive',
    goalLabel: '卡种定向加价',
    cardScope: 'Vanilla / OneVanilla',
    region: 'US 美国本土',
    cohortSize: 2100,
    startDate: '10-08',
    endDate: '10-22',
    remainingDaysText: '剩余 4 天',
    status: 'live',
    statusLabel: '进行中',
    reachedCount: 1960,
    convertedCount: 1020,
    conversionRateText: '52.0%',
    orderCount: 2810,
    gmv: 532500,
    subsidyCost: 9800,
    budgetLimit: 12000,
    roi: 54.33
  },
  {
    id: 'camp-6',
    code: 'ACT-202309-055',
    name: 'Google Play 大额冲量加价券派发',
    tag: '常态化运营',
    tagType: 'regular',
    goal: 'card_incentive',
    goalLabel: '卡种定向加价',
    cardScope: 'Google Play (全区)',
    region: '全球全区',
    cohortSize: 3500,
    startDate: '09-15',
    endDate: '09-30',
    remainingDaysText: '已归档',
    status: 'ended',
    statusLabel: '已结束',
    reachedCount: 3420,
    convertedCount: 1890,
    conversionRateText: '55.3%',
    orderCount: 3920,
    gmv: 680000,
    subsidyCost: 15000,
    budgetLimit: 15000,
    roi: 45.33
  },
  {
    id: 'camp-7',
    code: 'ACT-202309-041',
    name: '新合伙人次月留存激活大礼包',
    tag: '自动化流水线',
    tagType: 'auto',
    goal: 'dormant',
    goalLabel: '沉睡召回',
    cardScope: 'Amazon / Apple',
    region: '欧亚区',
    cohortSize: 2400,
    startDate: '09-01',
    endDate: '09-20',
    remainingDaysText: '已归档',
    status: 'ended',
    statusLabel: '已结束',
    reachedCount: 2210,
    convertedCount: 980,
    conversionRateText: '44.3%',
    orderCount: 1840,
    gmv: 320000,
    subsidyCost: 8200,
    budgetLimit: 10000,
    roi: 39.02
  },
  {
    id: 'camp-8',
    code: 'ACT-202311-D01',
    name: 'Q4 战略出卡商排位赛 (储备草稿)',
    tag: '待预热',
    tagType: 'draft',
    goal: 'vip',
    goalLabel: '高客促活',
    cardScope: '全卡种',
    region: '全球合规全区',
    cohortSize: 1500,
    startDate: '11-15',
    endDate: '11-30',
    remainingDaysText: '草稿待定',
    status: 'draft',
    statusLabel: '草稿箱',
    reachedCount: 0,
    convertedCount: 0,
    conversionRateText: '--',
    orderCount: 0,
    gmv: 0,
    subsidyCost: 0,
    budgetLimit: 30000,
    roi: 0
  }
];

export const ActivityOperationsView: React.FC = () => {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(INITIAL_CAMPAIGNS);
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'pending' | 'ended' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [goalFilter, setGoalFilter] = useState('all');
  const [cardFilter, setCardFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('2023-10-01 ~ 2023-10-31');
  const [selectedIds, setSelectedIds] = useState<string[]>(['camp-1', 'camp-2']);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modals state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [retroItem, setRetroItem] = useState<CampaignItem | null>(null);
  const [budgetItem, setBudgetItem] = useState<CampaignItem | null>(null);
  const [budgetAddAmount, setBudgetAddAmount] = useState('5000');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Sandbox dynamic state
  const [sandboxPreset, setSandboxPreset] = useState({
    tag: '西非秋季大额出卡狂欢节',
    goal: '促活高频客群',
    region: 'NG 尼日利亚 / GH 加纳',
    tier: 'LV3 - LV5 核心批发',
    cards: 'Apple Store / Steam',
    dormancy: '≥ 30天未核销',
    cohort: 4210,
    minVal: 100,
    maxFreq: 5,
    budget: 15000,
    benefit1: { name: '满 $200 加价券', sub: '汇率上浮 +0.5%', code: 'BNF-2023-9021' },
    benefit2: { name: '成长值翻倍加速', sub: '双倍积分兑换资格', code: 'BNF-2023-9022' }
  });
  const [isRecalculating, setIsRecalculating] = useState(false);

  // New campaign wizard form data
  const [formData, setFormData] = useState({
    name: 'Steam & Apple 跨区大宗专享收卡季',
    goal: 'vip' as 'vip' | 'new_user' | 'dormant' | 'card_incentive',
    tag: '重点保供',
    region: '全球欧美及西非区',
    cardScope: 'Steam / Apple Store',
    tierScope: 'LV2 ~ LV5 会员',
    dormancyDays: '15',
    minFaceValue: '100',
    maxTimesPerUser: '5',
    budgetLimit: '20000',
    benefitType: 'add_rate_coupon',
    couponRate: '+0.50%',
    mountDoublePoints: true
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3200);
  };

  // Recalculate sandbox cohort
  const handleRecalculateSandbox = () => {
    setIsRecalculating(true);
    setTimeout(() => {
      const delta = Math.floor(Math.random() * 200) - 100;
      const newCohort = Math.max(3800, sandboxPreset.cohort + delta);
      setSandboxPreset(prev => ({ ...prev, cohort: newCohort }));
      setIsRecalculating(false);
      showToast(`沙盘推演引擎完成重算：当前客群交叉匹配规模为 ${newCohort.toLocaleString()} 人`);
    }, 600);
  };

  // Apply template to sandbox
  const applyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setSandboxPreset({
      tag: tpl.name,
      goal: tpl.goal,
      region: tpl.region,
      tier: tpl.tier,
      cards: tpl.cards,
      dormancy: tpl.dormancy,
      cohort: tpl.cohort,
      minVal: tpl.minVal,
      maxFreq: tpl.maxFreq,
      budget: tpl.budget,
      benefit1: tpl.benefit1,
      benefit2: tpl.benefit2
    });
    setIsTemplateModalOpen(false);
    showToast(`已载入「${tpl.name}」历史推演沙盘方案！`);
  };

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(item => {
      // Tab filter
      if (activeTab === 'live' && item.status !== 'live') return false;
      if (activeTab === 'pending' && item.status !== 'pending') return false;
      if (activeTab === 'ended' && item.status !== 'ended') return false;
      if (activeTab === 'draft' && item.status !== 'draft') return false;

      // Goal filter
      if (goalFilter !== 'all' && item.goal !== goalFilter) return false;

      // Card filter
      if (cardFilter !== 'all' && !item.cardScope.toLowerCase().includes(cardFilter.toLowerCase()) && item.cardScope !== '全卡种通用') {
        return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.name.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          item.tag.toLowerCase().includes(q) ||
          item.cardScope.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [campaigns, activeTab, goalFilter, cardFilter, searchQuery]);

  // Statistics calculation
  const totalLive = campaigns.filter(c => c.status === 'live').length;
  const totalGmv = campaigns.reduce((sum, c) => sum + c.gmv, 0);
  const totalSubsidy = campaigns.reduce((sum, c) => sum + c.subsidyCost, 0);
  const totalParticipants = campaigns.reduce((sum, c) => sum + c.convertedCount, 0);
  const overallRoi = totalSubsidy > 0 ? (totalGmv / totalSubsidy).toFixed(2) : '0';

  // Toggle selection
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCampaigns.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCampaigns.map(c => c.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Batch actions
  const handleBatchBudget = () => {
    if (selectedIds.length === 0) return;
    setCampaigns(prev =>
      prev.map(c => (selectedIds.includes(c.id) ? { ...c, budgetLimit: Math.round(c.budgetLimit * 1.1) } : c))
    );
    showToast(`已为选中的 ${selectedIds.length} 场活动批量上浮 +10% 补贴预算额度！`);
  };

  const handleBatchExtend = () => {
    if (selectedIds.length === 0) return;
    setCampaigns(prev =>
      prev.map(c => (selectedIds.includes(c.id) ? { ...c, remainingDaysText: '已延长7天' } : c))
    );
    showToast(`已为选中的 ${selectedIds.length} 场战役顺延 7 天活动排期！`);
  };

  const handleBatchCircuitBreak = () => {
    if (selectedIds.length === 0) return;
    setCampaigns(prev =>
      prev.map(c => (selectedIds.includes(c.id) ? { ...c, status: 'suspended', statusLabel: '已熔断' } : c))
    );
    showToast(`安全防线就绪：选中的 ${selectedIds.length} 场活动已紧急批次熔断下线！`);
  };

  // Toggle single campaign circuit break
  const toggleCircuitBreak = (item: CampaignItem) => {
    if (item.status === 'suspended') {
      setCampaigns(prev =>
        prev.map(c => (c.id === item.id ? { ...c, status: 'live', statusLabel: '进行中' } : c))
      );
      showToast(`活动【${item.name}】已恢复常态化线上核销流转`);
    } else {
      setCampaigns(prev =>
        prev.map(c => (c.id === item.id ? { ...c, status: 'suspended', statusLabel: '已熔断' } : c))
      );
      showToast(`警报已触发：【${item.name}】已立即执行熔断并冻结权益卡发放`);
    }
  };

  // Add budget to single campaign
  const handleAddSingleBudget = () => {
    if (!budgetItem) return;
    const addVal = parseFloat(budgetAddAmount) || 0;
    setCampaigns(prev =>
      prev.map(c => (c.id === budgetItem.id ? { ...c, budgetLimit: c.budgetLimit + addVal } : c))
    );
    showToast(`已成功为【${budgetItem.name}】追加 $${addVal.toLocaleString()} USD 预算储备！`);
    setBudgetItem(null);
  };

  // Create campaign from wizard
  const handleCreateCampaignSubmit = () => {
    const newId = `camp-${Date.now()}`;
    const newCode = `ACT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`;
    const newCampaign: CampaignItem = {
      id: newId,
      code: newCode,
      name: formData.name,
      tag: formData.tag,
      tagType: 'focus',
      goal: formData.goal,
      goalLabel:
        formData.goal === 'vip'
          ? '高客促活'
          : formData.goal === 'new_user'
          ? '拉新破冰'
          : formData.goal === 'dormant'
          ? '沉睡召回'
          : '卡种定向加价',
      cardScope: formData.cardScope,
      region: formData.region,
      cohortSize: 4200,
      startDate: '10-20',
      endDate: '11-10',
      remainingDaysText: '21天周期',
      status: 'live',
      statusLabel: '进行中',
      reachedCount: 0,
      convertedCount: 0,
      conversionRateText: '刚启动',
      orderCount: 0,
      gmv: 0,
      subsidyCost: 0,
      budgetLimit: parseFloat(formData.budgetLimit) || 15000,
      roi: 0
    };

    setCampaigns([newCampaign, ...campaigns]);
    setIsWizardOpen(false);
    setWizardStep(1);
    showToast(`活动【${formData.name}】(${newCode}) 已完成 4 步沙盘校验并全网生效！`);
  };

  return (
    <div className="flex flex-col w-full space-y-4 text-[#0b1c30] antialiased text-xs">
      {/* 顶部轻量浮动通知 */}
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
              04 活动运营 · 智能客群圈选与活动全生命周期大盘
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-mono text-[11px] font-semibold border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              ACTIVE MATRIX
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1 max-w-4xl leading-relaxed">
            回答“对哪些用户，在什么时间，通过什么规则，给什么权益，促成什么交易”，精准覆盖拉新破冰、高客促活、沉睡召回与卡种定向冲量。
          </p>
        </div>

        {/* 顶部状态速报小标 */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80">
          <span className="material-symbols-outlined text-blue-600 text-[20px]">bolt</span>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">实时决策执行引擎</span>
            <span className="font-mono text-[11px] text-slate-800 font-medium">SLA &lt; 85ms · 权益核销零拥堵</span>
          </div>
        </div>
      </header>

      {/* 第一视线层：4 大活动运营全局大盘看板 (Bento KPI Grid) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1 */}
        <div className="relative bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 hover:shadow-md transition-shadow overflow-hidden group flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">进行中运营活动</span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold">LIVE</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl leading-tight text-slate-900 font-bold">{totalLive}</span>
            <span className="text-xs text-slate-400">场</span>
          </div>
          <div className="mt-1 text-slate-500 text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>覆盖卡种: Apple / Steam / GP / Razer</span>
          </div>
          <div className="mt-2.5 pt-1.5 bg-slate-50 px-2 py-1 rounded flex items-center justify-between text-slate-500 text-xs">
            <span>全域排期状态</span>
            <span className="font-mono text-[11px] font-semibold text-emerald-700">全链路正常 · 无冲突</span>
          </div>
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-[90px] text-blue-600">event_available</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="relative bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 hover:shadow-md transition-shadow overflow-hidden group flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">累计撬动交易 GMV</span>
            <span className="inline-flex items-center text-emerald-700 font-mono text-[11px] font-semibold">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +31.2%
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono text-xs text-slate-400">$</span>
            <span className="font-mono text-2xl leading-tight text-slate-900 font-bold">
              {totalGmv.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-1 text-slate-500 text-xs">
            <span>活动贡献占比全网</span>
            <span className="font-mono text-xs font-semibold text-blue-600 ml-1">26.8%</span>
          </div>
          <div className="mt-2.5 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: '26.8%' }}></div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="relative bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 hover:shadow-md transition-shadow overflow-hidden group flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">活动核销补贴总成本</span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono text-[10px] font-semibold">极高效能</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono text-xs text-slate-400">$</span>
            <span className="font-mono text-2xl leading-tight text-slate-900 font-bold">
              {totalSubsidy.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-1 text-slate-500 text-xs flex items-center justify-between">
            <span>综合活动 ROI</span>
            <span className="font-mono text-xs text-emerald-700 font-bold">1 : {overallRoi}</span>
          </div>
          <div className="mt-2.5 pt-1.5 bg-slate-50 px-2 py-1 rounded flex items-center justify-between text-slate-500 text-xs">
            <span>补贴边际支出率</span>
            <span className="font-mono text-[11px] font-medium text-slate-800">1.94% 处于安全线内</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="relative bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 hover:shadow-md transition-shadow overflow-hidden group flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">触达与参与出卡客群</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">DORMANCY-CONV</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl leading-tight text-slate-900 font-bold">16,840</span>
            <span className="text-xs text-slate-400">人</span>
          </div>
          <div className="mt-1 text-slate-500 text-xs flex items-center justify-between">
            <span>客群转化率</span>
            <span className="font-mono text-xs font-semibold text-blue-600">42.1%</span>
          </div>
          <div className="mt-2.5 pt-1.5 bg-slate-50 px-2 py-1 rounded flex items-center justify-between text-slate-500 text-xs">
            <span>首单破冰新客</span>
            <span className="font-mono text-[11px] font-semibold text-emerald-700">+{totalParticipants.toLocaleString()} 人</span>
          </div>
        </div>
      </section>

      {/* 第二视线层：4步智能活动向导与沙盘推演引擎 (PRD 6.2 分步沙盘预览与联动引擎) */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pb-3 bg-slate-50 -mx-4 -mt-4 p-4 rounded-t-xl border-b border-slate-200/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                4步智能活动向导与沙盘推演引擎
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-semibold">PRD v2.0 SPEC</span>
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                联动「客户画像中枢」与「权益核销规则库」，所选即所得，实时测算客群圈选规模与预算承压
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-500">history</span>
              历史沙盘模板
            </button>
            <button
              onClick={() => {
                setIsWizardOpen(true);
                setWizardStep(1);
              }}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium text-xs flex items-center gap-1 shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">play_arrow</span>
              一键校验并生成活动
            </button>
          </div>
        </div>

        {/* 4-Step Interactive Sandbox Visualizer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 pt-1">
          {/* Step 1 */}
          <div className="flex flex-col justify-between bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/70 hover:bg-slate-50 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-600 text-white font-semibold">STEP 01</span>
                <span className="material-symbols-outlined text-slate-400 text-[18px]">target</span>
              </div>
              <h3 className="text-xs font-bold text-slate-900">目标设定</h3>
              <p className="text-[11px] text-slate-500">明确运营核心命题与战役周期</p>

              <div className="space-y-1.5 pt-1">
                <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                  <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-0.5">主营战役标签</label>
                  <div className="font-semibold text-slate-900 truncate text-xs">{sandboxPreset.tag}</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/80 flex items-center justify-between">
                  <span className="text-slate-500 text-xs">目标定位</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                    {sandboxPreset.goal}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/80 flex items-center justify-between">
                  <span className="text-slate-500 text-xs">地区围栏</span>
                  <span className="font-medium text-slate-900 text-xs">{sandboxPreset.region}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-1.5 border-t border-slate-200/60 text-right">
              <span className="text-emerald-700 font-mono text-[11px] flex items-center justify-end gap-1 font-semibold">
                <span className="material-symbols-outlined text-[14px]">check_circle</span> 规则基线已确立
              </span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col justify-between bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/70 hover:bg-slate-50 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-600 text-white font-semibold">STEP 02</span>
                <span className="material-symbols-outlined text-slate-400 text-[18px]">group_add</span>
              </div>
              <h3 className="text-xs font-bold text-slate-900">智能客群圈选器</h3>
              <p className="text-[11px] text-slate-500">联动客户画像多维指标交叉匹配</p>

              <div className="space-y-1.5 pt-1">
                <div className="bg-white p-2 rounded-lg border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">等级要求:</span>
                    <span className="font-mono font-medium text-slate-900">{sandboxPreset.tier}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">常卖卡种:</span>
                    <span className="font-mono font-medium text-slate-900">{sandboxPreset.cards}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">休眠时效:</span>
                    <span className="font-mono text-rose-600 font-medium">{sandboxPreset.dormancy}</span>
                  </div>
                </div>

                {/* Dynamic Cohort Calculator Widget */}
                <div className="bg-blue-50/70 border border-blue-100 p-2 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] text-blue-800 uppercase font-bold">预计圈选规模</span>
                    <span className="font-mono text-base text-blue-700 font-bold">
                      {sandboxPreset.cohort.toLocaleString()} <span className="text-xs font-normal text-slate-500">人</span>
                    </span>
                  </div>
                  <button
                    onClick={handleRecalculateSandbox}
                    disabled={isRecalculating}
                    className="px-2 py-1 rounded bg-white text-blue-600 border border-blue-200 font-mono text-[11px] hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <span className={`material-symbols-outlined text-[14px] ${isRecalculating ? 'animate-spin' : ''}`}>
                      refresh
                    </span>
                    {isRecalculating ? '计算中' : '重算'}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-1.5 border-t border-slate-200/60 text-right">
              <span className="text-slate-400 font-mono text-[11px]">画像匹配度: 99.4%</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col justify-between bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/70 hover:bg-slate-50 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-600 text-white font-semibold">STEP 03</span>
                <span className="material-symbols-outlined text-slate-400 text-[18px]">verified_user</span>
              </div>
              <h3 className="text-xs font-bold text-slate-900">触发规则与约束</h3>
              <p className="text-[11px] text-slate-500">门槛防刷风控与风控频控锁</p>

              <div className="space-y-1.5 pt-1">
                <div className="bg-white p-2 rounded-lg border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">单笔最低面值:</span>
                    <span className="font-mono font-semibold text-slate-900">≥ ${sandboxPreset.minVal}.00</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">参与频次上限:</span>
                    <span className="font-mono font-semibold text-slate-900">{sandboxPreset.maxFreq} 次 / 人</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">总补贴预算限额:</span>
                    <span className="font-mono font-semibold text-blue-600">
                      ${sandboxPreset.budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/80 flex items-center gap-1.5 text-slate-500 text-xs">
                  <span className="material-symbols-outlined text-emerald-600 text-[16px]">shield</span>
                  <span>设备指纹防羊毛党熔断生效</span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-1.5 border-t border-slate-200/60 text-right">
              <span className="text-emerald-700 font-mono text-[11px] flex items-center justify-end gap-1 font-semibold">
                <span className="material-symbols-outlined text-[14px]">lock</span> 预算熔断闭环就绪
              </span>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col justify-between bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/70 hover:bg-slate-50 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-600 text-white font-semibold">STEP 04</span>
                <span className="material-symbols-outlined text-slate-400 text-[18px]">redeem</span>
              </div>
              <h3 className="text-xs font-bold text-slate-900">挂载活动权益</h3>
              <p className="text-[11px] text-slate-500">直通权益中枢，即时核销发放</p>

              <div className="space-y-1.5 pt-1">
                {/* Benefit Ticket 1 */}
                <div className="bg-white p-2 rounded-lg border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-900">{sandboxPreset.benefit1.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">{sandboxPreset.benefit1.sub}</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold font-mono">
                    已挂载
                  </span>
                </div>
                {/* Benefit Ticket 2 */}
                <div className="bg-white p-2 rounded-lg border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-900">{sandboxPreset.benefit2.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">{sandboxPreset.benefit2.sub}</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold font-mono">
                    已挂载
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-slate-400 text-xs">
              <span>调用权益凭证</span>
              <span className="font-mono text-[11px] text-blue-600 font-semibold">{sandboxPreset.benefit1.code}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 第三视线层：活动生命周期快捷 Tab 与多维组合检索过滤栏 */}
      <section className="space-y-3">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* 快捷状态 Tab (统一标准风格) */}
          <section className="bg-white rounded-xl border border-slate-200/80 px-4 pt-1 shadow-xs flex items-center gap-1 overflow-x-auto text-xs">
            {[
              { id: 'all', label: '全部活动', badge: campaigns.length, badgeClass: 'bg-slate-100 text-slate-700' },
              { id: 'live', label: '进行中', badge: campaigns.filter(c => c.status === 'live').length, badgeClass: 'bg-emerald-100 text-emerald-800 font-semibold' },
              { id: 'pending', label: '待上线 (排期待审)', badge: campaigns.filter(c => c.status === 'pending').length, badgeClass: 'bg-blue-100 text-blue-800' },
              { id: 'ended', label: '已结束 (归档)', badge: campaigns.filter(c => c.status === 'ended').length, badgeClass: 'bg-slate-100 text-slate-700' },
              { id: 'draft', label: '草稿箱', badge: campaigns.filter(c => c.status === 'draft').length, badgeClass: 'bg-amber-100 text-amber-800' }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 font-bold rounded-t-lg transition-colors shrink-0 flex items-center gap-1.5 relative cursor-pointer text-xs ${
                    isActive
                      ? 'text-[#004ac6] bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#004ac6]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isActive ? 'bg-blue-100 text-blue-800' : tab.badgeClass
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </section>

          {/* 右侧行动点 (Action Triggers) */}
          <div className="flex items-center gap-2 self-end xl:self-auto">
            <button
              onClick={() => {
                const liveItem = campaigns.find(c => c.status === 'live') || campaigns[0];
                setRetroItem(liveItem);
              }}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-blue-600">analytics</span>
              活动效果复盘看板
            </button>
            <button
              onClick={() => {
                setIsWizardOpen(true);
                setWizardStep(1);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.99] cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              + 创建运营活动 (4步向导)
            </button>
          </div>
        </div>

        {/* 筛选条件组 (Filter Matrix) */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200/80 flex flex-wrap items-center gap-2.5">
          {/* 搜索活动名称或ID */}
          <div className="flex-1 min-w-[240px] relative">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-[18px]">search</span>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
              placeholder="搜索活动编号、活动战役名称、标签..."
              type="text"
            />
          </div>

          {/* 活动目标下拉 */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-lg">
            <span className="text-[11px] text-slate-400">活动目标:</span>
            <select
              value={goalFilter}
              onChange={e => setGoalFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-800 focus:outline-none cursor-pointer font-medium"
            >
              <option value="all">全部目标分类</option>
              <option value="new_user">拉新破冰 (New User)</option>
              <option value="vip">高客促活 (VIP Retention)</option>
              <option value="dormant">沉睡召回 (Dormant Recall)</option>
              <option value="card_incentive">卡种定向加价 (Card Incentive)</option>
            </select>
          </div>

          {/* 适用卡种下拉 */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-lg">
            <span className="text-[11px] text-slate-400">适用卡种:</span>
            <select
              value={cardFilter}
              onChange={e => setCardFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-800 focus:outline-none cursor-pointer font-medium"
            >
              <option value="all">全域卡种 (All Brands)</option>
              <option value="Apple">Apple Store Gift Card</option>
              <option value="Steam">Steam Wallet Card</option>
              <option value="Google Play">Google Play</option>
              <option value="Razer">Razer Gold</option>
              <option value="Vanilla">Vanilla Visa / Mastercard</option>
            </select>
          </div>

          {/* 起止时间范围 */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-lg">
            <span className="material-symbols-outlined text-slate-400 text-[16px]">calendar_today</span>
            <span className="text-[11px] text-slate-400">排期周期:</span>
            <span className="font-mono text-xs text-slate-800">{dateRangeFilter}</span>
            {dateRangeFilter && (
              <button
                onClick={() => setDateRangeFilter('')}
                className="material-symbols-outlined text-slate-400 hover:text-slate-600 text-[16px] cursor-pointer"
                title="清除日期范围"
              >
                close
              </button>
            )}
          </div>

          {/* 重置按钮 */}
          <button
            onClick={() => {
              setSearchQuery('');
              setGoalFilter('all');
              setCardFilter('all');
              setDateRangeFilter('2023-10-01 ~ 2023-10-31');
              setActiveTab('all');
              showToast('已重置所有检索条件');
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="重置筛选"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
          </button>
        </div>
      </section>

      {/* 第四视线层：进行中与近期活动全景明细表格（含 ROI 复盘指标） */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Table Container with Horizontal Scroll support */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[1300px]">
            <thead>
              <tr className="bg-slate-50/90 text-slate-500 font-semibold text-[11px] uppercase h-9 tracking-wider border-b border-slate-200">
                <th className="px-3 py-2 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="px-3 py-2">活动编号 / 战役名称</th>
                <th className="px-3 py-2">活动目标</th>
                <th className="px-3 py-2">适用卡种与区域</th>
                <th className="px-3 py-2 text-right">圈选客群规模</th>
                <th className="px-3 py-2">排期周期</th>
                <th className="px-3 py-2">状态</th>
                <th className="px-3 py-2 text-right">已触达 / 转化</th>
                <th className="px-3 py-2 text-right">产出卡单量</th>
                <th className="px-3 py-2 text-right">撬动 GMV</th>
                <th className="px-3 py-2 text-right">补贴成本</th>
                <th className="px-3 py-2 text-right">ROI (投产比)</th>
                <th className="px-4 py-2 text-center">调度操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-[36px] text-slate-300 block mb-1">inbox</span>
                    未找到符合当前检索条件的运营活动
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map(row => {
                  const isSelected = selectedIds.includes(row.id);
                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-50/80 transition-colors h-14 ${
                        isSelected ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(row.id)}
                          className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <span
                            onClick={() => setRetroItem(row)}
                            className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                          >
                            {row.name}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] text-slate-400">{row.code}</span>
                            <span
                              className={`px-1 py-0.2 text-[10px] font-mono rounded font-medium ${
                                row.tagType === 'focus'
                                  ? 'bg-blue-50 text-blue-700'
                                  : row.tagType === 'regular'
                                  ? 'bg-slate-100 text-slate-600'
                                  : row.tagType === 'auto'
                                  ? 'bg-purple-50 text-purple-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {row.tag}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold ${
                            row.goal === 'vip'
                              ? 'bg-emerald-100 text-emerald-800'
                              : row.goal === 'new_user'
                              ? 'bg-blue-100 text-blue-800'
                              : row.goal === 'dormant'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {row.goalLabel}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">{row.cardScope}</span>
                          <span className="font-mono text-[10px] text-slate-400">{row.region}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-semibold text-slate-900">
                        {row.cohortSize.toLocaleString()} 人
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <span className="font-mono text-slate-800">
                            {row.startDate} ~ {row.endDate}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{row.remainingDaysText}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        {row.status === 'live' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            进行中
                          </span>
                        )}
                        {row.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono text-[10px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                            待上线 (就绪)
                          </span>
                        )}
                        {row.status === 'ended' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono text-[10px] font-semibold">
                            已结束 (归档)
                          </span>
                        )}
                        {row.status === 'draft' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono text-[10px] font-semibold">
                            草稿
                          </span>
                        )}
                        {row.status === 'suspended' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-mono text-[10px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                            已熔断
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {row.reachedCount > 0 ? (
                          <div className="flex flex-col items-end">
                            <span className="font-mono text-slate-800">{row.reachedCount.toLocaleString()} 触达</span>
                            <span className="font-mono text-[10px] text-emerald-700">
                              转化 {row.convertedCount.toLocaleString()} ({row.conversionRateText})
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span className="font-mono text-slate-400">--</span>
                            <span className="font-mono text-[10px] text-slate-400">{row.conversionRateText}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-semibold text-slate-900">
                        {row.orderCount > 0 ? `${row.orderCount.toLocaleString()} 张` : '--'}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                        {row.gmv > 0 ? `$${row.gmv.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '--'}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-rose-600 font-medium">
                        {row.subsidyCost > 0
                          ? `$${row.subsidyCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                          : `$0.00 / $${row.budgetLimit.toLocaleString()}`}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {row.roi > 0 ? (
                          <span className="font-mono font-bold text-emerald-700 text-xs">1 : {row.roi}</span>
                        ) : (
                          <span className="font-mono text-slate-400">--</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setRetroItem(row)}
                            className="px-1.5 py-0.5 rounded text-blue-600 hover:bg-blue-50 font-mono text-[11px] cursor-pointer transition-colors"
                            title="复盘详情"
                          >
                            复盘
                          </button>
                          <button
                            onClick={() => setBudgetItem(row)}
                            className="px-1.5 py-0.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-mono text-[11px] cursor-pointer transition-colors"
                            title="追加预算"
                          >
                            预算
                          </button>
                          <button
                            onClick={() => toggleCircuitBreak(row)}
                            className={`px-1.5 py-0.5 rounded font-mono text-[11px] cursor-pointer transition-colors ${
                              row.status === 'suspended'
                                ? 'text-emerald-700 hover:bg-emerald-50'
                                : 'text-rose-600 hover:bg-rose-50'
                            }`}
                            title={row.status === 'suspended' ? '恢复上线' : '暂停下线'}
                          >
                            {row.status === 'suspended' ? '恢复' : '熔断'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 底部状态汇总与标准分页控件 (Footer Pagination) */}
        <div className="px-4 py-2.5 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-200">
          <div className="flex items-center gap-3 text-slate-500 text-xs">
            <span>
              显示第 1 至 {filteredCampaigns.length} 条，共 {filteredCampaigns.length} 场匹配活动
            </span>
            <div className="hidden md:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>
                当前总撬动 GMV 估值:{' '}
                <strong className="text-slate-900 font-mono">
                  ${totalGmv.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </strong>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                showToast('已导出活动效果复盘明细报表 (.xlsx)');
              }}
              className="px-3 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              导出本期复盘报表
            </button>
            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              <button
                disabled
                className="w-7 h-7 rounded bg-white border border-slate-200 text-slate-400 flex items-center justify-center shadow-xs disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <button className="w-7 h-7 rounded bg-blue-600 text-white font-mono text-xs font-semibold flex items-center justify-center shadow-xs">
                1
              </button>
              <button
                onClick={() => showToast('已切换至第 2 页')}
                className="w-7 h-7 rounded bg-white border border-slate-200 text-slate-600 hover:text-slate-900 font-mono text-xs flex items-center justify-center shadow-xs cursor-pointer"
              >
                2
              </button>
              <button
                onClick={() => showToast('已切换至下一页')}
                className="w-7 h-7 rounded bg-white border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 浮动批处理控制坞 (Floating Batch Action Dock) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 right-8 left-68 z-40 flex justify-end pointer-events-none animate-fade-in">
          <div className="pointer-events-auto bg-[#0b1c30] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-4 border border-slate-700">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
              <span className="text-xs">
                已选中 <strong className="text-emerald-400 font-mono">{selectedIds.length}</strong> 场战役
              </span>
            </div>
            <div className="h-4 w-[1px] bg-slate-700"></div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBatchBudget}
                className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs transition-colors cursor-pointer"
              >
                批量上浮预算 (+10%)
              </button>
              <button
                onClick={handleBatchExtend}
                className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs transition-colors cursor-pointer"
              >
                一键延长活动排期
              </button>
              <button
                onClick={handleBatchCircuitBreak}
                className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs transition-colors cursor-pointer font-medium"
              >
                紧急批次熔断
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-slate-400 hover:text-white text-xs ml-1 cursor-pointer"
                title="取消选中"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 弹窗 1: 活动效果复盘看板抽屉 (Retrospective Modal)                       */}
      {/* ========================================================================= */}
      {retroItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 overflow-y-auto max-h-[90vh] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">analytics</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{retroItem.name}</h3>
                  <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                    <span>{retroItem.code}</span>
                    <span>•</span>
                    <span>{retroItem.goalLabel}</span>
                    <span>•</span>
                    <span>{retroItem.region}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setRetroItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* 核心投产看板 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">撬动交易 GMV</span>
                <div className="font-mono text-lg font-bold text-slate-900 mt-1">
                  ${retroItem.gmv.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-emerald-700 mt-0.5 flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px]">trending_up</span> 达成预期目标的 128.4%
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">补贴总支出</span>
                <div className="font-mono text-lg font-bold text-rose-600 mt-1">
                  ${retroItem.subsidyCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  预算使用率 {(retroItem.budgetLimit > 0 ? (retroItem.subsidyCost / retroItem.budgetLimit * 100).toFixed(1) : 0)}%
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">实测投产比 (ROI)</span>
                <div className="font-mono text-lg font-bold text-emerald-700 mt-1">
                  1 : {retroItem.roi}
                </div>
                <div className="text-[10px] text-emerald-700 mt-0.5">超行业均值 2.4倍</div>
              </div>
            </div>

            {/* 转化漏斗模型 */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <span className="text-xs font-bold text-slate-900 block">四阶全链路漏斗转化</span>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">1. 圈选目标客群底池</span>
                    <span className="font-mono font-bold text-slate-900">{retroItem.cohortSize.toLocaleString()} 人 (100%)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-slate-600 h-full rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">2. 触达出卡商户</span>
                    <span className="font-mono font-bold text-blue-600">
                      {retroItem.reachedCount.toLocaleString()} 人 (
                      {((retroItem.reachedCount / Math.max(1, retroItem.cohortSize)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (retroItem.reachedCount / Math.max(1, retroItem.cohortSize)) * 100)}%`
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">3. 产出有效卡单商户</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {retroItem.convertedCount.toLocaleString()} 人 (
                      {((retroItem.convertedCount / Math.max(1, retroItem.cohortSize)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (retroItem.convertedCount / Math.max(1, retroItem.cohortSize)) * 100)}%`
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">4. 累计产生合格卡单</span>
                    <span className="font-mono font-bold text-indigo-600">
                      {retroItem.orderCount.toLocaleString()} 张卡单
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 卡种贡献分布 */}
            <div className="border border-slate-200 rounded-xl p-3">
              <span className="text-xs font-bold text-slate-900 block mb-2">主营卡种出卡与利润贡献</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-slate-50 flex items-center justify-between">
                  <span>Apple Store Gift Card (US)</span>
                  <span className="font-mono font-semibold text-slate-900">54.2% GMV</span>
                </div>
                <div className="p-2 rounded bg-slate-50 flex items-center justify-between">
                  <span>Steam Wallet (USD)</span>
                  <span className="font-mono font-semibold text-slate-900">32.8% GMV</span>
                </div>
                <div className="p-2 rounded bg-slate-50 flex items-center justify-between">
                  <span>Razer Gold Global</span>
                  <span className="font-mono font-semibold text-slate-900">8.5% GMV</span>
                </div>
                <div className="p-2 rounded bg-slate-50 flex items-center justify-between">
                  <span>Vanilla Visa 闪付</span>
                  <span className="font-mono font-semibold text-slate-900">4.5% GMV</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  showToast(`已下载【${retroItem.name}】完整复盘 PDF 分析简报`);
                }}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium cursor-pointer"
              >
                导出 PDF 简报
              </button>
              <button
                onClick={() => setRetroItem(null)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium cursor-pointer"
              >
                关闭复盘看板
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 弹窗 2: 追加预算调控弹窗 (Budget Modal)                                   */}
      {/* ========================================================================= */}
      {budgetItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">account_balance_wallet</span>
                <h3 className="text-sm font-bold text-slate-900">调整活动补贴预算</h3>
              </div>
              <button
                onClick={() => setBudgetItem(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div>
              <div className="font-semibold text-slate-900 text-xs">{budgetItem.name}</div>
              <div className="font-mono text-[11px] text-slate-400 mt-0.5">{budgetItem.code}</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl space-y-2 border border-slate-200/80 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">当前预算上限:</span>
                <span className="font-mono font-bold text-slate-900">
                  ${budgetItem.budgetLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">已核销补贴支出:</span>
                <span className="font-mono font-bold text-rose-600">
                  ${budgetItem.subsidyCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">当前剩余可用储备:</span>
                <span className="font-mono font-bold text-emerald-700">
                  ${Math.max(0, budgetItem.budgetLimit - budgetItem.subsidyCost).toLocaleString('en-US', {
                    minimumFractionDigits: 2
                  })}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">追加预算金额 (USD):</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-mono">$</span>
                <input
                  type="number"
                  value={budgetAddAmount}
                  onChange={e => setBudgetAddAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:bg-white focus:border-blue-500"
                  placeholder="输入追加金额"
                />
              </div>
              <div className="flex gap-2 mt-2">
                {['2000', '5000', '10000', '20000'].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setBudgetAddAmount(val)}
                    className="flex-1 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] cursor-pointer"
                  >
                    +${parseInt(val) / 1000}k
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setBudgetItem(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleAddSingleBudget}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium cursor-pointer"
              >
                确认追加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 弹窗 3: 4步创建运营活动向导弹窗 (Interactive Campaign Wizard)            */}
      {/* ========================================================================= */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* 顶部标题与步骤指示 */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">4 步创建运营活动向导</h3>
                <p className="text-slate-400 text-xs mt-0.5">联动客户画像中枢与权益核销规则库</p>
              </div>
              <button
                onClick={() => setIsWizardOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* 步骤条 */}
            <div className="flex items-center justify-between px-2">
              {[
                { step: 1, label: '目标设定' },
                { step: 2, label: '客群圈选' },
                { step: 3, label: '风控约束' },
                { step: 4, label: '挂载权益' }
              ].map(s => (
                <div key={s.step} className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                      wizardStep === s.step
                        ? 'bg-blue-600 text-white'
                        : wizardStep > s.step
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {wizardStep > s.step ? '✓' : s.step}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      wizardStep === s.step ? 'text-blue-600 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {s.label}
                  </span>
                  {s.step < 4 && <div className="w-8 h-[1px] bg-slate-200 mx-1"></div>}
                </div>
              ))}
            </div>

            {/* Step 1 内容 */}
            {wizardStep === 1 && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">主营战役名称:</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">活动目标定位:</label>
                    <select
                      value={formData.goal}
                      onChange={e => setFormData({ ...formData, goal: e.target.value as any })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer"
                    >
                      <option value="vip">高客促活 (VIP Retention)</option>
                      <option value="new_user">拉新破冰 (New User)</option>
                      <option value="dormant">沉睡召回 (Dormant Recall)</option>
                      <option value="card_incentive">卡种定向加价 (Card Incentive)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">战役优先级标签:</label>
                    <input
                      type="text"
                      value={formData.tag}
                      onChange={e => setFormData({ ...formData, tag: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">地区围栏覆盖:</label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={e => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Step 2 内容 */}
            {wizardStep === 2 && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">会员等级范围:</label>
                    <select
                      value={formData.tierScope}
                      onChange={e => setFormData({ ...formData, tierScope: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer"
                    >
                      <option value="LV2 ~ LV5 会员">LV2 ~ LV5 核心批发商</option>
                      <option value="LV1 ~ LV2 新晋">LV1 ~ LV2 新晋客群</option>
                      <option value="LV4 ~ LV5 殿堂黑钻">LV4 ~ LV5 顶级战略商</option>
                      <option value="全量会员 (LV1~LV5)">全量在籍会员 (LV1~LV5)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">偏好卡种圈选:</label>
                    <input
                      type="text"
                      value={formData.cardScope}
                      onChange={e => setFormData({ ...formData, cardScope: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">休眠天数约束:</label>
                  <input
                    type="number"
                    value={formData.dormancyDays}
                    onChange={e => setFormData({ ...formData, dormancyDays: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                    placeholder="如：≥ 15 天未核销"
                  />
                </div>

                <div className="bg-blue-50/70 border border-blue-100 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-blue-800 font-bold uppercase block">沙盘推演预计圈选人数</span>
                    <span className="font-mono text-xl font-bold text-blue-700">4,200 人</span>
                  </div>
                  <span className="text-xs text-slate-500">画像交叉匹配度 99.1%</span>
                </div>
              </div>
            )}

            {/* Step 3 内容 */}
            {wizardStep === 3 && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">单笔最低卡单面值 (USD):</label>
                    <input
                      type="number"
                      value={formData.minFaceValue}
                      onChange={e => setFormData({ ...formData, minFaceValue: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">单人最高参与频次:</label>
                    <input
                      type="number"
                      value={formData.maxTimesPerUser}
                      onChange={e => setFormData({ ...formData, maxTimesPerUser: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">总补贴预算限额 (USD):</label>
                  <input
                    type="number"
                    value={formData.budgetLimit}
                    onChange={e => setFormData({ ...formData, budgetLimit: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2 text-emerald-800 text-xs">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>已启用设备指纹风控锁，拦截多账号同 IP/同设备重复领取</span>
                </div>
              </div>
            )}

            {/* Step 4 内容 */}
            {wizardStep === 4 && (
              <div className="space-y-3 pt-2">
                <span className="text-xs font-medium text-slate-700 block">选择挂载权益:</span>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={true}
                        readOnly
                        className="rounded text-blue-600 focus:ring-0"
                      />
                      <div>
                        <div className="font-semibold text-slate-900 text-xs">出卡加价特权券 (满 $200 可用)</div>
                        <div className="text-[11px] text-slate-400 font-mono">汇率定向加成 {formData.couponRate}</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold font-mono">
                      已选定
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.mountDoublePoints}
                        onChange={e => setFormData({ ...formData, mountDoublePoints: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <div>
                        <div className="font-semibold text-slate-900 text-xs">成长值翻倍加速特权</div>
                        <div className="text-[11px] text-slate-400 font-mono">出卡成功双倍累积 EXP 积分</div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold font-mono ${
                        formData.mountDoublePoints
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {formData.mountDoublePoints ? '已挂载' : '未挂载'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">挂载凭证代号:</span>
                    <span className="font-mono font-bold text-blue-600">BNF-2023-AUTO-99</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">权益核销响应 SLA:</span>
                    <span className="font-mono text-emerald-700 font-semibold">&lt; 85ms 实时兑付</span>
                  </div>
                </div>
              </div>
            )}

            {/* 底部向导切换按钮 */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (wizardStep > 1) {
                    setWizardStep((wizardStep - 1) as any);
                  } else {
                    setIsWizardOpen(false);
                  }
                }}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs cursor-pointer"
              >
                {wizardStep === 1 ? '取消' : '上一步'}
              </button>

              <div className="flex items-center gap-2">
                {wizardStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => setWizardStep((wizardStep + 1) as any)}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium cursor-pointer"
                  >
                    下一步
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCreateCampaignSubmit}
                    className="px-5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer shadow-sm"
                  >
                    确认创建并上线
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 弹窗 4: 历史沙盘模板弹窗 (Template Modal)                                */}
      {/* ========================================================================= */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">history_edu</span>
                <h3 className="text-sm font-bold text-slate-900">选择历史沙盘推演模板</h3>
              </div>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-500">
              选用经过实战验证的精算战役模板，一键重载目标设定、客群圈选与权益匹配参数：
            </p>

            <div className="space-y-2">
              {TEMPLATES.map((tpl, idx) => (
                <div
                  key={idx}
                  onClick={() => applyTemplate(tpl)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                      {tpl.name}
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {tpl.goal}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-3">
                    <span>覆盖: {tpl.region}</span>
                    <span>圈选规模: {tpl.cohort.toLocaleString()}人</span>
                    <span>预算: ${tpl.budget.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs cursor-pointer"
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

const TEMPLATES = [
  {
    name: '西非秋季大额出卡狂欢节',
    goal: '促活高频客群',
    region: 'NG 尼日利亚 / GH 加纳',
    tier: 'LV3 - LV5 核心批发',
    cards: 'Apple Store / Steam',
    dormancy: '≥ 30天未核销',
    cohort: 4210,
    minVal: 100,
    maxFreq: 5,
    budget: 15000,
    benefit1: { name: '满 $200 加价券', sub: '汇率上浮 +0.5%', code: 'BNF-2023-9021' },
    benefit2: { name: '成长值翻倍加速', sub: '双倍积分兑换资格', code: 'BNF-2023-9022' }
  },
  {
    name: '全球新合伙人首单破冰计划',
    goal: '拉新破冰',
    region: '全球合规全区',
    tier: 'LV1 ~ LV2 新晋客群',
    cards: '全卡种通用',
    dormancy: '注册 7 天内',
    cohort: 3200,
    minVal: 50,
    maxFreq: 1,
    budget: 12000,
    benefit1: { name: '首单返现 $10 礼金', sub: '首单出卡成功自动入账', code: 'BNF-2023-1001' },
    benefit2: { name: '免手续费提现券', sub: '单笔提现 0 磨损', code: 'BNF-2023-1002' }
  },
  {
    name: '黑五 Steam & Razer 大宗定向冲量赛',
    goal: '卡种定向加价',
    region: '全球美欧节点',
    tier: 'LV3 ~ LV5 核心批发',
    cards: 'Steam Wallet / Razer Gold',
    dormancy: '常态化活跃',
    cohort: 6800,
    minVal: 200,
    maxFreq: 10,
    budget: 30000,
    benefit1: { name: '满 $500 返现 1.5%', sub: '大宗结算专项返点', code: 'BNF-2023-2001' },
    benefit2: { name: '极速绿色核销通道', sub: '秒级出单优先排队', code: 'BNF-2023-2002' }
  }
];
