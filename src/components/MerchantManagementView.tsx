import React, { useState, useMemo, useEffect } from 'react';
import { MerchantItem, NavPath } from '../types';
import { INITIAL_MERCHANTS } from '../data/mockMerchants';
import { MerchantDetailView } from './MerchantDetailView';
import { MerchantCapacityTab } from './merchant/MerchantCapacityTab';
import { MerchantAnomaliesTab } from './merchant/MerchantAnomaliesTab';

interface MerchantManagementViewProps {
  initialMerchants?: MerchantItem[];
  currentPath?: NavPath;
  onNavigate?: (path: NavPath) => void;
}

export type MerchantSubTab = 'list' | 'capacity' | 'anomalies';

export const MerchantManagementView: React.FC<MerchantManagementViewProps> = ({
  initialMerchants = INITIAL_MERCHANTS,
  currentPath,
  onNavigate,
}) => {
  const [merchants, setMerchants] = useState<MerchantItem[]>(initialMerchants);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>(merchants[0]?.id || '1');
  const [subTab, setSubTab] = useState<MerchantSubTab>('list');
  const [isDetailMode, setIsDetailMode] = useState<boolean>(currentPath === 'merchant-profile');
  const [detailInitialTab, setDetailInitialTab] = useState<number>(1);

  // Route sync
  useEffect(() => {
    if (currentPath === 'merchant-capacity') {
      setSubTab('capacity');
      setIsDetailMode(false);
    } else if (currentPath === 'merchant-anomalies') {
      setSubTab('anomalies');
      setIsDetailMode(false);
    } else if (currentPath === 'merchant-profile') {
      setIsDetailMode(true);
    } else if (currentPath === 'merchant-list' || currentPath === 'merchant-management') {
      setSubTab('list');
      setIsDetailMode(false);
    }
  }, [currentPath]);

  // Quick Slice Filter Tabs
  const [quickSlice, setQuickSlice] = useState<'all' | 'active' | 'vip' | 'timeout' | 'margin'>('all');

  useEffect(() => {
    if (currentPath === 'merchant-operations') {
      setQuickSlice('timeout');
    }
  }, [currentPath]);

  // Multi-dimensional filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCard, setSelectedCard] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedMargin, setSelectedMargin] = useState('');

  // Table selection & batch actions
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modals & Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showNewMerchantModal, setShowNewMerchantModal] = useState(false);
  const [newMchName, setNewMchName] = useState('');
  const [newMchLegal, setNewMchLegal] = useState('');
  const [newMchPhone, setNewMchPhone] = useState('');
  const [newMchTier, setNewMchTier] = useState('Tier-A 优质核心大商');
  const [newMchCollateral, setNewMchCollateral] = useState('100000');

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configTargetMerchant, setConfigTargetMerchant] = useState<MerchantItem | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleUpdateMerchant = (updated: MerchantItem) => {
    setMerchants(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  const selectedMerchant = useMemo(() => {
    return merchants.find(m => m.id === selectedMerchantId) || merchants[0];
  }, [merchants, selectedMerchantId]);

  const filteredMerchants = useMemo(() => {
    return merchants.filter(m => {
      // Quick Slice
      if (quickSlice === 'active') {
        if (m.status !== '在线接单中' && m.status !== '正常接卡') return false;
      }
      if (quickSlice === 'vip') {
        if (!m.tier.includes('Tier-S') && !m.vipTag.includes('战略自营') && !m.tier.includes('Tier-A')) return false;
      }
      if (quickSlice === 'timeout') {
        if (m.avgTimeSec < 40 && m.slaRate >= 99.0) return false;
      }
      if (quickSlice === 'margin') {
        if (m.collateralStatus !== '押金告警' && m.collateralStatus !== '争议挂起中' && (m.remainingQuotaUsd || 50000) > 5000) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = m.name.toLowerCase().includes(q) || m.fullName.toLowerCase().includes(q);
        const matchMid = m.mid.toLowerCase().includes(q);
        const matchLegal = m.legalPerson.toLowerCase().includes(q);
        const matchPhone = m.phone.toLowerCase().includes(q);
        if (!matchName && !matchMid && !matchLegal && !matchPhone) return false;
      }

      // Tier Filter
      if (selectedTier) {
        if (selectedTier === 'S' && !m.tier.includes('Tier-S')) return false;
        if (selectedTier === 'A' && !m.tier.includes('Tier-A')) return false;
        if (selectedTier === 'B' && !m.tier.includes('Tier-B')) return false;
        if (selectedTier === 'C' && !m.tier.includes('Tier-C')) return false;
      }

      // Receive Status Filter
      if (selectedStatus) {
        if (selectedStatus === 'active' && m.status !== '在线接单中' && m.status !== '正常接卡') return false;
        if (selectedStatus === 'offline' && m.status !== '打烊暂停中' && m.status !== '暂停接单') return false;
        if (selectedStatus === 'circuit' && m.status !== '熔断管制中' && m.status !== '风控冻结') return false;
      }

      // Card Filter
      if (selectedCard) {
        const cardMatch = m.supportedCards.some(c => c.name.toLowerCase().includes(selectedCard.toLowerCase()));
        if (!cardMatch) return false;
      }

      // Country Filter
      if (selectedCountry) {
        if (m.supportedRegions && !m.supportedRegions.includes(selectedCountry) && !m.supportedRegions.includes('GLOBAL') && !m.supportedRegions.includes('GL')) {
          return false;
        }
      }

      // Margin Filter
      if (selectedMargin) {
        if (selectedMargin === 'safe' && m.collateralStatus !== '正常充足') return false;
        if (selectedMargin === 'warn' && m.collateralStatus !== '押金告警') return false;
        if (selectedMargin === 'danger' && m.collateralStatus !== '争议挂起中') return false;
      }

      return true;
    });
  }, [merchants, quickSlice, searchQuery, selectedTier, selectedStatus, selectedCard, selectedCountry, selectedMargin]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTier('');
    setSelectedStatus('');
    setSelectedCard('');
    setSelectedCountry('');
    setSelectedMargin('');
    setQuickSlice('all');
    showToast('筛选过滤矩阵已重置为默认供给池全集');
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowIds(filteredMerchants.map(m => m.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleRowSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedRowIds.includes(id)) {
      setSelectedRowIds(selectedRowIds.filter(x => x !== id));
    } else {
      setSelectedRowIds([...selectedRowIds, id]);
    }
  };

  const handleCreateNewMerchant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMchName.trim()) {
      showToast('请输入企业主体全称');
      return;
    }
    const newMid = `MID-M0${Math.floor(600 + Math.random() * 300)}`;
    const newMch: MerchantItem = {
      id: String(merchants.length + 1),
      mid: newMid,
      name: newMchName.length > 8 ? newMchName.slice(0, 6) + '科技' : newMchName,
      fullName: newMchName,
      initial: newMchName.slice(0, 1),
      colorClass: 'bg-blue-600',
      legalPerson: newMchLegal || '新签约主理人',
      phone: newMchPhone || '+86 138****0000',
      email: 'service@merchant-partner.com',
      vipTag: newMchTier.split(' ')[0],
      tier: newMchTier,
      channelType: '企业级独立接卡通道',
      daysActive: 1,
      seatsOnline: 3,
      seatsTotal: 5,
      is24h: true,
      status: '在线接单中',
      apiLatency: '15ms',
      supportedCards: [
        { name: 'Apple US/UK', percent: 60 },
        { name: 'Steam GL', percent: 40 }
      ],
      todayOrders: 0,
      todayGmvUsd: 0,
      quotaUsedPercent: 0,
      quotaMaxUsd: 50000,
      remainingQuotaUsd: 50000,
      avgTimeSec: 25.0,
      slaRate: 100.0,
      disputeRateText: '0.0% / 0.00%',
      starRating: 5.0,
      collateralUsd: parseFloat(newMchCollateral) || 100000,
      collateralStatus: '正常充足',
      points: 200000,
      pendingSettlementCny: 0,
      kycStatus: '企业实名已认证',
      reputationScore: 98.0,
      riskTier: 'Tier-1 极优',
      appId: `mch_live_${Date.now()}`,
      webhookUrl: 'https://api.partner.com/notify',
      whitelistIps: '2 个专线节点',
      settlementCycle: 'T+0 实时秒结',
      tags: ['新准入商户', '质押已验讫', 'VIP通道候选'],
      quotaCreditUsedCny: 0,
      quotaCreditTotalCny: 500000,
      collateralPenaltyCount: 0,
      disputeCount: 0,
      recentTrades: [],
      opsLogs: [
        { time: '刚刚', operator: '准入审核岗', title: '完成新商户准入认证', desc: '质押资金到账核验完毕，分配初始接单配额', type: 'primary' }
      ]
    };
    setMerchants([newMch, ...merchants]);
    setShowNewMerchantModal(false);
    setNewMchName('');
    setNewMchLegal('');
    setNewMchPhone('');
    showToast(`成功准入并认证新接卡商户: ${newMch.fullName} (${newMch.mid})`);
  };

  const handleQuickPause = (merchant: MerchantItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = (merchant.status === '在线接单中' || merchant.status === '正常接卡')
      ? '打烊暂停中'
      : '在线接单中';
    handleUpdateMerchant({
      ...merchant,
      status: nextStatus
    });
    showToast(`已${nextStatus === '在线接单中' ? '开启' : '暂停'}商户 ${merchant.name} 的派单流`);
  };

  const handleOpenMerchantDetail = (merchantId: string, initialTab: number = 1) => {
    setSelectedMerchantId(merchantId);
    setDetailInitialTab(initialTab);
    setIsDetailMode(true);
    if (onNavigate) onNavigate('merchant-profile');
  };

  const handleBackToList = () => {
    setIsDetailMode(false);
    setSubTab('list');
    if (onNavigate) onNavigate('merchant-list');
  };

  // If in detail mode, render 360° Merchant Profile view as subpage directly
  if (isDetailMode && selectedMerchant) {
    return (
      <MerchantDetailView
        merchant={selectedMerchant}
        initialTab={detailInitialTab}
        onBack={handleBackToList}
        onUpdateMerchant={handleUpdateMerchant}
      />
    );
  }

  return (
    <div className="flex flex-col w-full space-y-4 text-slate-800 antialiased pb-12">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900/90 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 backdrop-blur border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 3 大标准子模块导航 Tab 栏 */}
      <section className="bg-white rounded-xl border border-slate-200/80 px-4 pt-1 shadow-xs flex items-center gap-1 overflow-x-auto text-xs">
        {[
          { id: 'list', label: '商户列表', icon: 'storefront' },
          { id: 'capacity', label: '承接能力 (转单/匹配基础)', icon: 'layers' },
          { id: 'anomalies', label: '商户异常记录', icon: 'warning' }
        ].map(tab => {
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                const next = tab.id as MerchantSubTab;
                setSubTab(next);
                if (onNavigate) {
                  const pathMap: Record<MerchantSubTab, NavPath> = {
                    list: 'merchant-list',
                    capacity: 'merchant-capacity',
                    anomalies: 'merchant-anomalies'
                  };
                  onNavigate(pathMap[next]);
                }
              }}
              className={`px-4 py-3 font-semibold rounded-t-lg transition-colors shrink-0 flex items-center gap-1.5 relative cursor-pointer ${
                isActive
                  ? 'text-[#004ac6] bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#004ac6]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </section>

      {/* SubTab 3: 承接能力 */}
      {subTab === 'capacity' && <MerchantCapacityTab showToast={showToast} />}

      {/* SubTab 4: 商户异常记录 */}
      {subTab === 'anomalies' && <MerchantAnomaliesTab showToast={showToast} />}

      {/* SubTab 1: 商户列表 */}
      {subTab === 'list' && (
        <>
          {/* 头部业务导航与控制栏 */}
          <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white px-5 py-4 rounded-xl border border-slate-200/80 shadow-xs">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  商户管理 · 接卡商户供给池
                </h1>
                <span className="font-code-token text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                  POOL-MGT-v2.0
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-4xl leading-relaxed">
                全景监控接卡商户在线履约状态、授信水位、通道打通与准入认证流转，保障派单撮合平稳高效。
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-slate-500">派单撮合引擎:</span>
                <span className="text-emerald-700 font-bold font-code-token">ACTIVE · 0.08s</span>
              </div>
              <button
                onClick={() => showToast('已成功导出接卡商户全量供给池运行时镜像数据 (JSON/CSV)')}
                className="h-8 px-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-slate-500">download</span>
                <span>导出供给池镜像</span>
              </button>
              <button
                onClick={() => setShowNewMerchantModal(true)}
                className="h-8 px-3.5 bg-[#004ac6] hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">domain_add</span>
                <span>准入认证新商户</span>
              </button>
            </div>
          </header>

      {/* 1. 置顶4列等宽商户供给大盘 (Merchant Supply KPI Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: 全平台认证商户 */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-blue-600">verified_user</span>
                全平台认证商户 (MERCHANTS)
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded">
                +3 今日入驻
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-900">142</span>
              <span className="text-xs text-slate-500">家接入</span>
              <span className="ml-auto text-xs text-emerald-700 font-semibold font-code-token">95.8% 履约中</span>
            </div>
          </div>
          <div className="mt-3 pt-2 bg-slate-50 px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs border border-slate-100">
            <span className="text-slate-500 text-[11px]">保证金质押池:</span>
            <span className="font-semibold text-blue-700 font-code-token">$860,000.00 USD</span>
            <span className="text-[10px] text-emerald-700 bg-emerald-100/60 px-1 rounded font-semibold">充分</span>
          </div>
        </div>

        {/* Card 2: 实时在线接卡商户与通道 */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-emerald-600">wifi_tethering</span>
                实时在线接卡 (ACTIVE CHANNELS)
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded font-code-token">
                LOAD 74.2%
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-900">88</span>
              <span className="text-xs text-slate-500">家在线接单</span>
              <span className="ml-auto text-xs text-slate-500 font-medium font-code-token">318 并发席位</span>
            </div>
          </div>
          <div className="mt-3 pt-2 bg-slate-50 px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs border border-slate-100">
            <span className="text-slate-500 text-[11px]">高信誉专属通道:</span>
            <span className="font-semibold text-slate-800 font-code-token">52 条 VIP 通道</span>
            <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: '74%' }}></div>
            </div>
          </div>
        </div>

        {/* Card 3: 今日商户接卡总额 GMV */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-blue-600">payments</span>
                今日接卡 GMV / 吞吐
              </span>
              <span className="text-[10px] text-white bg-blue-600 px-1.5 py-0.2 rounded font-bold font-code-token">
                REAL-TIME
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-900">$386,450.00</span>
              <span className="text-xs text-slate-500 font-code-token">USD</span>
            </div>
          </div>
          <div className="mt-3 pt-2 bg-slate-50 px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs border border-slate-100">
            <span className="text-slate-500 text-[11px]">5,420 笔 · 履约 98.6%</span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-emerald-600">bolt</span>
              <span className="font-semibold text-slate-800 font-code-token">均耗 35.1s</span>
            </div>
          </div>
        </div>

        {/* Card 4: 履约健康与风控状态 */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-emerald-600">health_and_safety</span>
                履约健康与风控 (RISK & HEALTH)
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded">
                Tier-1 极优
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-emerald-700">99.20%</span>
              <span className="text-xs text-slate-500">综合健康度</span>
            </div>
          </div>
          <div className="mt-3 pt-2 bg-slate-50 px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs border border-slate-100">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              <span className="text-[11px] text-rose-600 font-medium">挂起预警: 2 家</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-rose-500">gavel</span>
              <span className="text-[11px] text-slate-600">争议定损: 4 笔</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 快捷切片 Tab 栏与多维组合筛选区 */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4 space-y-3.5">
        {/* 快捷切片 Tab 栏 */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
            <button
              onClick={() => setQuickSlice('all')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 ${
                quickSlice === 'all'
                  ? 'bg-[#004ac6] text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>全部商户</span>
              <span className={`px-1.5 py-0.2 rounded text-[11px] font-code-token ${
                quickSlice === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>142</span>
            </button>
            <button
              onClick={() => setQuickSlice('active')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 ${
                quickSlice === 'active'
                  ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-100'
              }`}
            >
              <span>正在接单</span>
              <span className="px-1.5 py-0.2 rounded text-[11px] font-code-token font-bold bg-emerald-200/60 text-emerald-900">88</span>
            </button>
            <button
              onClick={() => setQuickSlice('vip')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 ${
                quickSlice === 'vip'
                  ? 'bg-[#004ac6] text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>高评分战略自营/VIP</span>
              <span className="px-1.5 py-0.2 rounded text-[11px] font-code-token bg-slate-200 text-slate-700">52</span>
            </button>
            <button
              onClick={() => setQuickSlice('timeout')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 border ${
                quickSlice === 'timeout'
                  ? 'bg-rose-50 text-rose-700 border-rose-200/90 font-bold shadow-2xs'
                  : 'bg-rose-50/50 text-rose-700 hover:bg-rose-100/60 border-rose-100'
              }`}
            >
              <span>履约超时预警</span>
              <span className="px-1.5 py-0.2 rounded text-[11px] font-code-token font-bold bg-rose-200/60 text-rose-900">6</span>
            </button>
            <button
              onClick={() => setQuickSlice('margin')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 ${
                quickSlice === 'margin'
                  ? 'bg-amber-600 text-white font-semibold shadow-2xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
              }`}
            >
              <span>质押保证金不足告警</span>
              <span className="px-1.5 py-0.2 rounded text-[11px] font-code-token font-bold bg-amber-200/60 text-amber-900">2</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 font-code-token text-xs">
            <span className="material-symbols-outlined text-[15px]">autorenew</span>
            <span>自动刷新: 10s</span>
          </div>
        </div>

        {/* 组合筛选输入网格 (7列响应式) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-2.5">
          {/* 搜索框 */}
          <div className="xl:col-span-2 relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-3 text-xs bg-slate-50 focus:bg-white text-slate-800 rounded-lg placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all"
              placeholder="商户名称 / MID / 企业主体 / 联系人 / 手机号"
              type="text"
            />
          </div>

          {/* 商户等级 */}
          <div>
            <select
              value={selectedTier}
              onChange={e => setSelectedTier(e.target.value)}
              className="w-full h-9 px-2 text-xs bg-slate-50 text-slate-700 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              <option value="">商户等级: 全部</option>
              <option value="S">Tier-S 战略自营旗舰</option>
              <option value="A">Tier-A 优质核心大商</option>
              <option value="B">Tier-B 标准履约商</option>
              <option value="C">Tier-C 重点观察商户</option>
            </select>
          </div>

          {/* 实时接卡状态 */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full h-9 px-2 text-xs bg-slate-50 text-slate-700 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              <option value="">接单状态: 全部</option>
              <option value="active">正在接单 (绿色在线)</option>
              <option value="offline">打烊暂停 (灰色离线)</option>
              <option value="circuit">熔断管制 (红色冻结)</option>
            </select>
          </div>

          {/* 核心支持卡种 */}
          <div>
            <select
              value={selectedCard}
              onChange={e => setSelectedCard(e.target.value)}
              className="w-full h-9 px-2 text-xs bg-slate-50 text-slate-700 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              <option value="">核心卡种: 全部</option>
              <option value="Apple">Apple US / UK / JP</option>
              <option value="Steam">Steam 全球钱包充值卡</option>
              <option value="Google">Google Play 充值卡</option>
              <option value="Razer">Razer Gold 雷蛇金币</option>
              <option value="Vanilla">Vanilla Visa / MC 预付卡</option>
            </select>
          </div>

          {/* 支持国家地区 */}
          <div>
            <select
              value={selectedCountry}
              onChange={e => setSelectedCountry(e.target.value)}
              className="w-full h-9 px-2 text-xs bg-slate-50 text-slate-700 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              <option value="">支持国家: 全部地区</option>
              <option value="US">美国 (US)</option>
              <option value="UK">英国 (UK)</option>
              <option value="DE">德国 (DE/EU)</option>
              <option value="JP">日本 (JP)</option>
              <option value="GLOBAL">全球通用 (GLOBAL)</option>
            </select>
          </div>

          {/* 质押金状态与操作 */}
          <div>
            <select
              value={selectedMargin}
              onChange={e => setSelectedMargin(e.target.value)}
              className="w-full h-9 px-2 text-xs bg-slate-50 text-slate-700 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              <option value="">质押水位: 全部</option>
              <option value="safe">正常充足 (&gt;80%)</option>
              <option value="warn">临界预警 (50%-80%)</option>
              <option value="danger">低于安全线 (&lt;50%)</option>
            </select>
          </div>
        </div>

        {/* 快捷重置与应用 */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span>当前生效条件:</span>
            <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-code-token text-slate-700">
              匹配商户: {filteredMerchants.length} 家
            </span>
            <button
              onClick={handleResetFilters}
              className="text-blue-600 hover:underline text-xs ml-1 cursor-pointer"
            >
              清空所有条件
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetFilters}
              className="h-8 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors cursor-pointer"
            >
              重置
            </button>
            <button
              onClick={() => showToast(`已执行筛选，当前匹配出 ${filteredMerchants.length} 家承揽商户`)}
              className="h-8 px-4 bg-[#004ac6] hover:bg-blue-700 text-white rounded-lg font-semibold shadow-2xs transition-all cursor-pointer"
            >
              查询筛选
            </button>
          </div>
        </div>
      </div>

      {/* 3. 高密度商户供给池明细表格 (Merchant Supply Matrix Table) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 h-9 text-slate-500 text-[11px] font-semibold uppercase tracking-wider select-none border-b border-slate-200">
                <th className="w-10 px-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedRowIds.length === filteredMerchants.length && filteredMerchants.length > 0}
                    onChange={e => handleSelectAll(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 align-middle cursor-pointer"
                  />
                </th>
                <th className="px-4 min-w-[220px]">商户名称与唯一编码</th>
                <th className="px-3 min-w-[110px]">经营等级</th>
                <th className="px-3 min-w-[110px]">实时接单状态</th>
                <th className="px-4 min-w-[210px]">经营卡类</th>
                <th className="px-4 min-w-[170px] text-right">今日接单 / 核销GMV</th>
                <th className="px-4 min-w-[180px]">可用积点 / 剩余承揽额</th>
                <th className="px-3 min-w-[110px] text-center">30天成功率</th>
                <th className="px-3 min-w-[100px] text-center">平均时效</th>
                <th className="px-3 min-w-[110px] text-center">异常/争议率</th>
                <th className="px-3 min-w-[100px] text-center">综合履约分</th>
                <th className="px-4 min-w-[170px] text-right sticky right-0 bg-slate-50 shadow-[-4px_0_8px_rgba(0,0,0,0.02)]">
                  快捷操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-900">
              {filteredMerchants.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-4xl text-slate-300">storefront</span>
                      <span>未查询到匹配的承兑商户，请重新调整筛选条件</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMerchants.map(merchant => {
                  const isSelected = selectedRowIds.includes(merchant.id);
                  const realtimeStatus = merchant.status === '在线接单中' || merchant.status === '正常接卡'
                    ? '正常'
                    : merchant.status === '打烊暂停中' || merchant.status === '暂停接单'
                      ? '暂停接卡(未开启接卡开关)'
                      : merchant.status === '风控冻结'
                        ? '已禁用'
                        : merchant.collateralStatus === '押金告警'
                          ? '异常(余额不足)'
                          : '暂停接卡(无有效报价)';
                  const isPaused = realtimeStatus !== '正常';
                  const isCircuit = realtimeStatus === '异常(余额不足)' || realtimeStatus === '已禁用';
                  const isWarn = merchant.collateralStatus === '押金告警';

                  return (
                    <tr
                      key={merchant.id}
                      onClick={() => handleOpenMerchantDetail(merchant.id, 1)}
                      className={`h-14 hover:bg-blue-50/40 transition-colors cursor-pointer group ${
                        isCircuit ? 'bg-rose-50/20' : isWarn ? 'bg-amber-50/20' : isPaused ? 'opacity-85' : ''
                      } ${isSelected ? 'bg-blue-50/40' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="px-3 text-center" onClick={e => handleRowSelect(merchant.id, e)}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 align-middle cursor-pointer"
                        />
                      </td>

                      {/* Name & MID */}
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg ${merchant.colorClass} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}>
                            {merchant.initial}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                                {merchant.name}
                              </span>
                              {merchant.tier.includes('Tier-S') && (
                                <span className="material-symbols-outlined text-blue-600 text-[15px]" title="企业已完成四要素实名认证与牌照核验">
                                  verified
                                </span>
                              )}
                              {isWarn && (
                                <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200/80 px-1.5 py-0.2 rounded font-bold">
                                  押金告警
                                </span>
                              )}
                              {isCircuit && (
                                <span className="text-[10px] bg-rose-100 text-rose-800 border border-rose-200 px-1.5 py-0.2 rounded font-bold">
                                  争议挂起中
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-code-token">
                              <span className="font-semibold text-slate-600">{merchant.id === '1' ? 'GF005001' : merchant.mid}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Tier */}
                      <td className="px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-medium tracking-wide">
                          预留字段
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-3">
                        {realtimeStatus === '正常' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>正常</span>
                          </span>
                        ) : isCircuit ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                            <span>{realtimeStatus}</span>
                          </span>
                        ) : isPaused ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            <span>{realtimeStatus}</span>
                          </span>
                        ) : null}
                      </td>

                      {/* Supported Cards */}
                      <td className="px-4">
                        <div className="flex flex-wrap gap-1">
                          {merchant.supportedCards.slice(0, 3).map((card, cidx) => (
                            <span
                              key={cidx}
                              className={`text-[11px] px-1.5 py-0.5 rounded font-code-token ${
                                card.isTag
                                  ? 'bg-slate-200 text-slate-700'
                                  : 'bg-slate-100 text-slate-800 border border-slate-200/60'
                              }`}
                            >
                              {card.name}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Today GMV & Orders */}
                      <td className="px-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-numeric-stat font-bold text-slate-900 text-[13px]">
                            {merchant.todayGmvUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="font-code-token text-[11px] text-slate-500">
                            {merchant.todayOrders.toLocaleString()} 单核销完成
                          </span>
                        </div>
                      </td>

                      {/* Points & Remaining Quota */}
                      <td className="px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className={`font-semibold font-code-token ${
                              isWarn ? 'text-rose-600 font-bold' : 'text-blue-700'
                            }`}>
                              {merchant.points.toLocaleString()} PTS
                            </span>
                            <span className={`font-code-token ${
                              isWarn ? 'text-rose-600 font-bold' : 'text-emerald-700'
                            }`}>
                              {isWarn ? `余 ${merchant.remainingQuotaUsd?.toLocaleString()} (不足)` : isCircuit ? `冻结 ${merchant.collateralUsd.toLocaleString()}` : `余 ${merchant.remainingQuotaUsd?.toLocaleString()}`}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden border border-slate-200/40">
                            <div
                              className={`h-full rounded-full ${
                                isWarn || isCircuit ? 'bg-rose-500' : 'bg-blue-600'
                              }`}
                              style={{ width: `${merchant.quotaUsedPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* 30-day Success Rate */}
                      <td className="px-3 text-center">
                        <span className={`font-numeric-stat font-bold text-xs ${
                          merchant.slaRate >= 99.0 ? 'text-emerald-700' : merchant.slaRate >= 95.0 ? 'text-slate-800' : 'text-rose-600'
                        }`}>
                          {merchant.slaRate}%
                        </span>
                      </td>

                      {/* Avg Time */}
                      <td className="px-3 text-center">
                        <span className={`font-code-token font-semibold text-xs ${
                          merchant.avgTimeSec <= 30 ? 'text-slate-900' : merchant.avgTimeSec <= 45 ? 'text-slate-700' : 'text-rose-600'
                        }`}>
                          {merchant.avgTimeSec}s
                        </span>
                      </td>

                      {/* Dispute Rate */}
                      <td className="px-3 text-center">
                        <span className={`font-code-token text-xs ${
                          isCircuit ? 'text-rose-600 font-bold' : 'text-slate-500'
                        }`}>
                          {merchant.disputeRateText || '0.3% / 0.08%'}
                        </span>
                      </td>

                      {/* Reputation Score */}
                      <td className="px-3 text-center">
                        <span className={`font-numeric-stat text-sm font-bold ${
                          merchant.reputationScore >= 95 ? 'text-emerald-700' : merchant.reputationScore >= 90 ? 'text-blue-700' : 'text-rose-600'
                        }`}>
                          {merchant.reputationScore}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 text-right sticky right-0 bg-white group-hover:bg-blue-50/40 transition-colors shadow-[-4px_0_8px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center justify-end gap-1">
                          {isWarn ? (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                showToast(`已向商户 ${merchant.name} 下发紧急质押催缴通知书`);
                              }}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold cursor-pointer shadow-2xs"
                            >
                              催缴
                            </button>
                          ) : null}
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleOpenMerchantDetail(merchant.id, 1);
                            }}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#004ac6] border border-blue-200 rounded text-xs font-semibold cursor-pointer flex items-center gap-1"
                            title="查看商户 360° 全息档案"
                          >
                            <span className="material-symbols-outlined text-[13px]">badge</span>
                            <span>360档案</span>
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleOpenMerchantDetail(merchant.id, 2); // Directly jump to Tab 02 接卡能力!
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium cursor-pointer"
                            title="卡种与接卡能力配置"
                          >
                            配置
                          </button>
                          <button
                            onClick={e => handleQuickPause(merchant, e)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title={isPaused ? '唤醒接单' : isCircuit ? '解冻复核' : '快速暂停派单'}
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {isPaused ? 'play_circle' : isCircuit ? 'lock_reset' : 'pause_circle'}
                            </span>
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

        {/* 4. 底部批量管理与分页栏 */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          {/* 批量动作托盘 */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-md font-medium text-slate-800 shadow-2xs">
              <span className="text-slate-400">已选定:</span>
              <span className="font-bold text-blue-700 font-code-token">{selectedRowIds.length}</span>
              <span className="text-slate-400">家商户</span>
            </div>
            <button
              onClick={() => {
                if (selectedRowIds.length === 0) {
                  showToast('请先在表格左侧勾选目标商户');
                  return;
                }
                setMerchants(prev => prev.map(m => selectedRowIds.includes(m.id) ? { ...m, status: '在线接单中' } : m));
                showToast(`已批量开启选中的 ${selectedRowIds.length} 家商户接单通道`);
              }}
              className="h-8 px-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px] text-emerald-600">play_arrow</span>
              <span>批量开启接单</span>
            </button>
            <button
              onClick={() => {
                if (selectedRowIds.length === 0) {
                  showToast('请先在表格左侧勾选目标商户');
                  return;
                }
                setMerchants(prev => prev.map(m => selectedRowIds.includes(m.id) ? { ...m, status: '打烊暂停中' } : m));
                showToast(`已批量暂停选中的 ${selectedRowIds.length} 家商户派单`);
              }}
              className="h-8 px-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px] text-rose-600">pause</span>
              <span>批量暂停派单</span>
            </button>
            <button
              onClick={() => {
                if (selectedRowIds.length === 0) {
                  showToast('请先在表格左侧勾选目标商户');
                  return;
                }
                showToast(`已成功向选中的 ${selectedRowIds.length} 家商户下达质押催缴令`);
              }}
              className="h-8 px-2.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">notification_important</span>
              <span>下发质押催缴令</span>
            </button>
          </div>

          {/* 分页器 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-slate-500">
              <span>共 <strong className="text-slate-900 font-code-token">142</strong> 家商户</span>
              <span className="text-slate-300">|</span>
              <select
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
                className="h-8 px-2 bg-white border border-slate-200 rounded-md text-xs text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value={20}>20 条/页</option>
                <option value={50}>50 条/页</option>
                <option value={100}>100 条/页</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="w-8 h-8 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-[#004ac6] text-white font-code-token font-bold shadow-2xs">
                1
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-700 font-code-token hover:bg-slate-100 cursor-pointer">
                2
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-700 font-code-token hover:bg-slate-100 cursor-pointer">
                3
              </button>
              <span className="px-1 text-slate-400">...</span>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-700 font-code-token hover:bg-slate-100 cursor-pointer">
                8
              </button>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                className="w-8 h-8 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      </>
      )}

      {/* Modal: 准入认证新商户 */}
      {showNewMerchantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">domain_add</span>
                <h3 className="text-sm font-bold text-slate-900">准入认证新承兑商户</h3>
              </div>
              <button
                onClick={() => setShowNewMerchantModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateNewMerchant} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  企业主体全称 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如: 杭州卡易达网络科技有限公司"
                  value={newMchName}
                  onChange={e => setNewMchName(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">法定代表人 / 主理人</label>
                  <input
                    type="text"
                    placeholder="姓名"
                    value={newMchLegal}
                    onChange={e => setNewMchLegal(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">主营业务联系手机</label>
                  <input
                    type="text"
                    placeholder="+86 138****0000"
                    value={newMchPhone}
                    onChange={e => setNewMchPhone(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">签约经营评级</label>
                  <select
                    value={newMchTier}
                    onChange={e => setNewMchTier(e.target.value)}
                    className="w-full h-9 px-2.5 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                  >
                    <option>Tier-A 优质核心大商</option>
                    <option>Tier-S 战略自营旗舰</option>
                    <option>Tier-B 标准履约商</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">实收质押保证金 ($ USD)</label>
                  <input
                    type="number"
                    value={newMchCollateral}
                    onChange={e => setNewMchCollateral(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600 font-code-token"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg text-blue-800 text-[11px] leading-relaxed">
                准入说明：录入审核完成后，系统将自动分配独立清算席位，并建立专属密钥证书，默认开启 API 直连与自动化调度撮合。
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewMerchantModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#004ac6] hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-2xs cursor-pointer"
                >
                  确认准入审核
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
