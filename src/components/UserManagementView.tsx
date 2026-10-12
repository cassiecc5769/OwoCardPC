import React, { useState, useMemo, useEffect } from 'react';
import { UserItem, NavPath } from '../types';
import { UserDetailView } from './UserDetailView';
import { UserTagsTab } from './user/UserTagsTab';
import { UserSegmentsTab } from './user/UserSegmentsTab';
import { UserColumnSettingsModal, ColumnConfigItem, DEFAULT_USER_COLUMNS } from './UserColumnSettingsModal';

interface UserManagementViewProps {
  users: UserItem[];
  onUpdateUser: (updatedUser: UserItem) => void;
  currentPath?: NavPath;
  onNavigate?: (path: NavPath) => void;
}

export type UserSubTab = 'list' | 'tags' | 'segments';

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  onUpdateUser,
  currentPath,
  onNavigate,
}) => {
  // Sub-tabs: list (用户列表) | tags (用户标签) | segments (用户分群)
  const [subTab, setSubTab] = useState<UserSubTab>('list');
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '1');
  const [isDetailMode, setIsDetailMode] = useState<boolean>(currentPath === 'user-profile');

  // Route sync
  useEffect(() => {
    if (currentPath === 'user-tags') {
      setSubTab('tags');
      setIsDetailMode(false);
    } else if (currentPath === 'user-segments') {
      setSubTab('segments');
      setIsDetailMode(false);
    } else if (currentPath === 'user-profile') {
      setIsDetailMode(true);
    } else if (currentPath === 'user-list' || currentPath === 'user-management') {
      setSubTab('list');
      setIsDetailMode(false);
    }
  }, [currentPath]);

  // Custom Columns configuration & localStorage persistence
  const [showColumnSettingsModal, setShowColumnSettingsModal] = useState(false);
  const [columns, setColumns] = useState<ColumnConfigItem[]>(() => {
    try {
      const saved = localStorage.getItem('USER_TABLE_CUSTOM_COLUMNS_V2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge to ensure new fields in schema exist
          const savedMap = new Map(parsed.map((item: ColumnConfigItem) => [item.id, item]));
          return DEFAULT_USER_COLUMNS.map(def => {
            const existing = savedMap.get(def.id);
            if (existing) {
              return { ...def, visible: def.required ? true : existing.visible };
            }
            return def;
          });
        }
      }
    } catch (e) {
      console.error('Failed to parse saved user columns', e);
    }
    return DEFAULT_USER_COLUMNS;
  });

  const handleSaveColumns = (newCols: ColumnConfigItem[]) => {
    setColumns(newCols);
    try {
      localStorage.setItem('USER_TABLE_CUSTOM_COLUMNS_V2', JSON.stringify(newCols));
    } catch (e) {
      console.error('Failed to save user columns to storage', e);
    }
    showToast(`已成功保存并应用 ${newCols.filter(c => c.visible).length} 个自定义显示列偏好`);
  };

  const activeVisibleColumns = useMemo(() => {
    return columns.filter(c => c.visible);
  }, [columns]);

  // Quick Slice Tab filter
  const [quickSlice, setQuickSlice] = useState<'all' | 'recent' | 'vip' | 'dispute' | 'risk'>('all');

  useEffect(() => {
    if (currentPath === 'user-operations') {
      setQuickSlice('recent');
    }
  }, [currentPath]);

  // Multi-dimensional filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('全部等级');
  const [selectedKyc, setSelectedKyc] = useState('全部认证状态');
  const [selectedChannel, setSelectedChannel] = useState('全部获客来源');
  const [selectedRisk, setSelectedRisk] = useState('全部风控信誉');
  const [accountStatus, setAccountStatus] = useState<'全部' | '正常' | '限制交易' | '已冻结'>('全部');
  const [dateRangePreset, setDateRangePreset] = useState<'all' | 'today' | '7days' | 'month'>('all');

  // Table selection & batch actions
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Modals & UI notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showWhitelistModal, setShowWhitelistModal] = useState(false);
  const [newWhitelistUid, setNewWhitelistUid] = useState('');
  const [newWhitelistName, setNewWhitelistName] = useState('');
  const [newWhitelistPhone, setNewWhitelistPhone] = useState('');
  const [newWhitelistTier, setNewWhitelistTier] = useState('LV3 黄金户');
  const [newWhitelistChannel, setNewWhitelistChannel] = useState('WhatsApp VIP 群 #02');

  const [showBatchTagModal, setShowBatchTagModal] = useState(false);
  const [batchTagInput, setBatchTagInput] = useState('');

  const [showBatchCouponModal, setShowBatchCouponModal] = useState(false);
  const [couponName, setCouponName] = useState('大客户出卡专属 +1.5% 加价券');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    showToast(`已复制 ${label}: ${text}`);
  };

  const selectedUser = useMemo(() => {
    return users.find(u => u.id === selectedUserId) || users[0];
  }, [users, selectedUserId]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Quick Slice Filter
      if (quickSlice === 'recent') {
        if (!user.lastCardTime.includes('分钟') && !user.lastCardTime.includes('小时')) return false;
      }
      if (quickSlice === 'vip') {
        if (!user.tier.includes('LV4') && !user.tier.includes('LV5') && user.gmv < 3000000) return false;
      }
      if (quickSlice === 'dispute') {
        if (user.lastCardStatus !== '涉诉冻结' && user.riskLabel !== '限制交易') return false;
      }
      if (quickSlice === 'risk') {
        if (user.riskTier !== 'Tier-C' && user.riskLabel !== '限制交易' && user.riskLabel !== '嫌疑碰卡') return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchUid = user.uid.toLowerCase().includes(q);
        const matchName = user.name.toLowerCase().includes(q);
        const matchPhone = user.phone.toLowerCase().includes(q);
        const matchRef = (user.employeeRef || '').toLowerCase().includes(q);
        const matchRep = (user.assignedRep || '').toLowerCase().includes(q);
        if (!matchUid && !matchName && !matchPhone && !matchRef && !matchRep) return false;
      }

      // Tier
      if (selectedTier !== '全部等级') {
        if (!user.tier.includes(selectedTier.replace(/ \(.*/, ''))) return false;
      }

      // KYC Status
      if (selectedKyc !== '全部认证状态') {
        if (selectedKyc === '未实名' && user.kycStatus !== '未认证') return false;
        if (selectedKyc === '基础实名' && !user.kycStatus.includes('基础')) return false;
        if (selectedKyc === 'KYC高级认证' && !user.kycStatus.includes('高级') && !user.kycStatus.includes('KYC已认证')) return false;
      }

      // Channel
      if (selectedChannel !== '全部获客来源') {
        const channelPrefix = selectedChannel.slice(0, 4);
        if (!user.channel.includes(channelPrefix)) return false;
      }

      // Risk
      if (selectedRisk !== '全部风控信誉') {
        if (selectedRisk.includes('Tier-A') && user.riskTier !== 'Tier-A') return false;
        if (selectedRisk.includes('Tier-B') && user.riskTier !== 'Tier-B') return false;
        if (selectedRisk.includes('Tier-C') && user.riskTier !== 'Tier-C') return false;
      }

      // Account status
      if (accountStatus !== '全部') {
        if (accountStatus === '正常' && (user.accountState === '限制交易' || user.accountState === '已冻结')) return false;
        if (accountStatus === '限制交易' && user.accountState !== '限制交易') return false;
        if (accountStatus === '已冻结' && user.accountState !== '已冻结') return false;
      }

      return true;
    });
  }, [users, quickSlice, searchQuery, selectedTier, selectedKyc, selectedChannel, selectedRisk, accountStatus]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTier('全部等级');
    setSelectedKyc('全部认证状态');
    setSelectedChannel('全部获客来源');
    setSelectedRisk('全部风控信誉');
    setAccountStatus('全部');
    setDateRangePreset('all');
    setQuickSlice('all');
    showToast('筛选条件已重置');
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowIds(filteredUsers.map(u => u.id));
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

  const handleCreateWhitelistUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhitelistName.trim()) {
      showToast('请输入用户真实姓名');
      return;
    }
    const newUid = newWhitelistUid.trim() || `UID-889${Math.floor(1000 + Math.random() * 9000)}`;
    const initials = newWhitelistName.slice(0, 2).toUpperCase();
    const newUser: UserItem = {
      id: String(users.length + 1),
      name: newWhitelistName,
      initials,
      avatarBg: 'bg-[#004ac6]',
      tag: '白名单大客',
      tagColor: 'bg-blue-100 text-blue-800',
      uid: newUid,
      phone: newWhitelistPhone || '+234 800****000',
      channel: newWhitelistChannel,
      assignedRep: 'OP-882 (Sarah)',
      employeeRef: 'EMP-8802 (张文翰) · 录入白名单',
      tier: newWhitelistTier,
      tierColor: 'text-amber-800 bg-amber-100',
      preferCards: 'Apple / Steam / Vanilla',
      gmv: 500000,
      gmvUsd: 72000,
      tradesCount: 20,
      withdrawUsdt: 5000,
      lastCardType: 'Apple $500',
      lastCardAmount: 500,
      lastCardStatus: '核销成功',
      lastCardTime: '刚刚录入',
      points: 2000,
      growthPoints: 3000,
      maxGrowthPoints: 10000,
      pendingSettlement: 0,
      collateral: 20000,
      kycStatus: 'KYC高级',
      kycDocType: 'NG-NIN',
      riskLabel: '正常履约',
      riskTier: 'Tier-A',
      accountState: '正常',
      creditScore: 99.0,
      daysActive: 1,
      registeredDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
      email: `${newWhitelistName.toLowerCase().replace(/\s+/g, '.')}@cardking.ng`,
      location: '尼日利亚 (Lagos)',
      deviceModel: 'Apple iPhone 15 Pro',
      lastIp: '102.89.20.11',
      inviteCode: 'VIP-WHITE',
      opayAccount: 'OPay Bank · 800***9988',
      usdtAddress: '0x99AA...11CC (TRC20)',
      peakHours: '14:00 - 19:00 WAT',
      tags: ['白名单直通', '大宗优先', '绿色风控通道'],
      referralShare: '0.25%',
      riskLogs: [
        {
          title: '风控白名单特权录入',
          time: '刚刚',
          desc: '运营专员提交直通审核，通过信誉担保资质核验。'
        }
      ],
      transactions: [
        { id: `ORD-${Date.now().toString().slice(-8)}`, card: 'Apple $500', amount: 3410, time: '刚刚', status: '已核销打款', rate: '0.9200' }
      ]
    };
    onUpdateUser(newUser);
    setShowWhitelistModal(false);
    setNewWhitelistName('');
    setNewWhitelistUid('');
    setNewWhitelistPhone('');
    showToast(`成功录入出卡大户白名单: ${newUser.name} (${newUser.uid})`);
  };

  const handleApplyBatchTags = () => {
    if (!batchTagInput.trim()) return;
    const tag = batchTagInput.trim();
    selectedRowIds.forEach(id => {
      const u = users.find(x => x.id === id);
      if (u && !u.tags.includes(tag)) {
        onUpdateUser({
          ...u,
          tags: [...u.tags, tag]
        });
      }
    });
    setShowBatchTagModal(false);
    setBatchTagInput('');
    showToast(`已为 ${selectedRowIds.length} 个用户批量追加运营标签: "${tag}"`);
  };

  const handleSendBatchCoupons = () => {
    setShowBatchCouponModal(false);
    showToast(`已成功向选中的 ${selectedRowIds.length} 名出卡用户定向补发: "${couponName}"`);
  };

  const handleOpenUserDetail = (userId: string) => {
    setSelectedUserId(userId);
    setIsDetailMode(true);
    if (onNavigate) onNavigate('user-profile');
  };

  const handleBackToList = () => {
    setIsDetailMode(false);
    setSubTab('list');
    if (onNavigate) onNavigate('user-list');
  };

  // If in detail mode, render 360° Profile view as subpage directly
  if (isDetailMode && selectedUser) {
    return (
      <UserDetailView
        user={selectedUser}
        onBack={handleBackToList}
        onUpdateUser={onUpdateUser}
      />
    );
  }

  return (
    <div className="flex flex-col w-full space-y-4 text-slate-800 antialiased pb-12">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900/90 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 backdrop-blur border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 3 大标准子模块导航 Tab 栏 (用户列表 / 用户标签 / 用户分群) */}
      <section className="bg-white rounded-xl border border-slate-200/80 px-4 pt-1 shadow-xs flex items-center gap-1 overflow-x-auto text-xs">
        {[
          { id: 'list', label: '用户列表', icon: 'list_alt' },
          { id: 'tags', label: '用户标签 (系统/业务)', icon: 'label' },
          { id: 'segments', label: '用户分群 (跨模块共享)', icon: 'groups' }
        ].map(tab => {
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                const next = tab.id as UserSubTab;
                setSubTab(next);
                if (onNavigate) {
                  const pathMap: Record<UserSubTab, NavPath> = {
                    list: 'user-list',
                    tags: 'user-tags',
                    segments: 'user-segments'
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

      {/* SubTab 3: 用户标签 */}
      {subTab === 'tags' && <UserTagsTab showToast={showToast} />}

      {/* SubTab 4: 用户分群 */}
      {subTab === 'segments' && (
        <UserSegmentsTab
          showToast={showToast}
          onNavigateToGrowth={() => onNavigate && onNavigate('growth-cohort')}
        />
      )}

      {/* SubTab 1: 用户列表 */}
      {subTab === 'list' && (
        <>
          {/* 头部业务导航与控制栏 */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-5 py-4 rounded-xl border border-slate-200/80 shadow-xs">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  用户管理 (出卡方)
                </h1>
                <span className="text-xs text-slate-500">
                  共 248,520 位注册出卡方 · 渠道推广系统只同步来源结果
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                监控出卡方生命周期、风控信用评级、KYC 认证合规及动销频次（平台不在用户档案里做推广生产）。
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                onClick={() => showToast('全量对账清单已生成导出任务，下载中...')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition-colors shadow-2xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-slate-500">file_download</span>
                <span>导出清单</span>
              </button>
              <button
                onClick={() => setShowWhitelistModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-2xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                <span>+ 录入白名单/新用户</span>
              </button>
            </div>
          </header>

      {/* Section 1: 置顶数据统计看板 (4列等宽高密度金融风) */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {/* Card 1: 全量出卡用户 */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              全量出卡用户 / TOTAL USERS
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-code-token font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
              +15.0% 环比
            </span>
          </div>
          <div className="my-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900">248,520</span>
            <span className="text-xs text-slate-500">人</span>
          </div>
          <div className="flex items-center justify-between pt-1 text-slate-500 text-xs">
            <span className="flex items-center gap-1">
              今日 <strong className="text-emerald-700 font-semibold font-code-token">+1,236</strong>
            </span>
            <span className="font-code-token text-slate-400">在册率: 98.2% / KYC合规率: 84.6%</span>
          </div>
        </div>

        {/* Card 2: 活跃出卡客群 */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              活跃出卡客群 / ACTIVE TRADED
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-code-token font-medium bg-blue-50 text-blue-700 border border-blue-100">
              月活 27.5%
            </span>
          </div>
          <div className="my-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900">68,430</span>
            <span className="text-xs text-slate-500">月活客</span>
          </div>
          <div className="flex items-center justify-between pt-1 text-slate-500 text-xs">
            <span>大客 <strong className="text-slate-800 font-code-token">4,210人</strong></span>
            <span className="font-code-token text-slate-400">近7日动销: 21,840 / 复出频次: 42.6%</span>
          </div>
        </div>

        {/* Card 3: 累计出卡总额 */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              累计出卡总额 / GMV VOLUME
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-code-token font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
              折合 $21.38M USD
            </span>
          </div>
          <div className="my-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900">¥148,250,000</span>
          </div>
          <div className="flex items-center justify-between pt-1 text-slate-500 text-xs">
            <span>99.1% 履约率</span>
            <span className="font-code-token text-slate-400">笔均面值: ¥680.00 / 均耗时: 42s/笔</span>
          </div>
        </div>

        {/* Card 4: 风控信誉与拦截 */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              风控信誉与拦截 / RISK & AUDIT
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-code-token font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
              Tier-1 极高稳健
            </span>
          </div>
          <div className="my-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900">99.85%</span>
            <span className="text-xs text-emerald-700 font-medium">无违约</span>
          </div>
          <div className="flex items-center justify-between pt-1 text-slate-500 text-xs">
            <span>拦截 <strong className="text-rose-600 font-semibold font-code-token">38人</strong></span>
            <span className="font-code-token text-slate-400">挂起限制中: 12人 / 误拒申诉率: 0.03%</span>
          </div>
        </div>
      </section>

      {/* Section 2: 快捷切片 Tab 栏与多维复合搜索矩阵 */}
      <section className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4 space-y-3.5">
        {/* Quick Slice Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto text-xs font-medium">
            <button
              onClick={() => setQuickSlice('all')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap ${
                quickSlice === 'all'
                  ? 'bg-[#004ac6] text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              全部出卡用户 (248,520)
            </button>
            <button
              onClick={() => setQuickSlice('recent')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap ${
                quickSlice === 'recent'
                  ? 'bg-[#004ac6] text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              近30天有动销 (68,430)
            </button>
            <button
              onClick={() => setQuickSlice('vip')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1 ${
                quickSlice === 'vip'
                  ? 'bg-[#004ac6] text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>⭐ 大额出卡商户 (4,210)</span>
            </button>
            <button
              onClick={() => setQuickSlice('dispute')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap border ${
                quickSlice === 'dispute'
                  ? 'bg-rose-50 text-rose-700 border-rose-200/90 font-bold shadow-2xs'
                  : 'bg-rose-50/50 text-rose-700 hover:bg-rose-100/60 border-rose-100'
              }`}
            >
              涉诉待仲裁 (12)
            </button>
            <button
              onClick={() => setQuickSlice('risk')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap ${
                quickSlice === 'risk'
                  ? 'bg-slate-800 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              限制风控观察 (38)
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
            <button
              onClick={() => setShowColumnSettingsModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-700 hover:text-blue-800 rounded-lg border border-slate-200 hover:border-blue-300 shadow-2xs font-semibold cursor-pointer transition-all"
              title="配置并调整出卡用户列表显示列"
            >
              <span className="material-symbols-outlined text-[16px] text-blue-600">view_column</span>
              <span>自定义列 ({activeVisibleColumns.length}/{columns.length})</span>
            </button>
          </div>
        </div>

        {/* Filter Suite Row 1: Key Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* 搜索框 */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-3 bg-slate-50 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600"
              placeholder="用户ID / 手机 / 昵称 / 邀请码"
              type="text"
            />
          </div>

          {/* 会员等级 */}
          <div>
            <select
              value={selectedTier}
              onChange={e => setSelectedTier(e.target.value)}
              className="w-full h-9 px-2.5 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              <option>全部等级</option>
              <option>LV1 新客试水</option>
              <option>LV2 白银出卡达人</option>
              <option>LV3 黄金高频户 (核心主力)</option>
              <option>LV4 钻石大宗商</option>
              <option>LV5 殿堂资深做市商</option>
            </select>
          </div>

          {/* KYC 认证状态 */}
          <div>
            <select
              value={selectedKyc}
              onChange={e => setSelectedKyc(e.target.value)}
              className="w-full h-9 px-2.5 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              <option>全部认证状态</option>
              <option>未实名</option>
              <option>基础实名</option>
              <option>KYC高级认证</option>
            </select>
          </div>

          {/* 引流渠道 */}
          <div>
            <select
              value={selectedChannel}
              onChange={e => setSelectedChannel(e.target.value)}
              className="w-full h-9 px-2.5 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              <option>全部获客来源</option>
              <option>WhatsApp 专线大户群</option>
              <option>Telegram VIP 群组直连</option>
              <option>TikTok 视频创作者挂链</option>
              <option>拉各斯电脑城 (Ikeja) 地推合作</option>
              <option>自然直客注册</option>
            </select>
          </div>

          {/* 反欺诈风控评级 */}
          <div>
            <select
              value={selectedRisk}
              onChange={e => setSelectedRisk(e.target.value)}
              className="w-full h-9 px-2.5 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              <option>全部风控信誉</option>
              <option>Tier-A 优质低风险</option>
              <option>Tier-B 观察中风险</option>
              <option>Tier-C 疑似黑产/高风险</option>
            </select>
          </div>
        </div>

        {/* Filter Suite Row 2: Secondary Attributes & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400">账号状态:</span>
            {(['全部', '正常', '限制交易', '已冻结'] as const).map(st => (
              <button
                key={st}
                onClick={() => setAccountStatus(st)}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  accountStatus === st
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}

            <span className="text-slate-300 mx-1">|</span>

            <span className="text-slate-400">注册时段:</span>
            {(['all', 'today', '7days', 'month'] as const).map(preset => {
              const labelMap = { all: '全部时段', today: '今日', '7days': '近7天', month: '本月' };
              return (
                <button
                  key={preset}
                  onClick={() => setDateRangePreset(preset)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    dateRangePreset === preset
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {labelMap[preset]}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors cursor-pointer"
            >
              重置
            </button>
            <button
              onClick={() => showToast(`已完成查询，共检索匹配出 ${filteredUsers.length} 条有效出卡用户`)}
              className="px-4 py-1.5 bg-[#004ac6] hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">filter_alt</span>
              <span>执行查询筛选 ({filteredUsers.length}匹配)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Section 3: 高密度金融风出卡用户账本大表 */}
      <section className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Table Meta & Operational Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 bg-slate-50/70 border-b border-slate-200 text-xs text-slate-500">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-semibold text-slate-700">展示排序: 累计交易额从高到低 (DESC)</span>
            <span>·</span>
            <span>多通道网关状态: 尼日利亚Naira / 加纳Cedis结算极速</span>
            <span>·</span>
            <span className="font-code-token text-[11px] text-slate-400">当前缓存更新周期: 30s</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast('已强制刷新并同步最新链上/档口核销数据')}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">refresh</span>
              <span>强制刷新</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-11 bg-slate-100/60 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="px-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedRowIds.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={e => handleSelectAll(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                {activeVisibleColumns.map(col => {
                  switch (col.id) {
                    case 'uid_kyc':
                      return <th key={col.id} className="px-3.5 whitespace-nowrap">用户UID / 认证资质</th>;
                    case 'user_info':
                      return <th key={col.id} className="px-3.5 whitespace-nowrap">用户昵称 / 关联手机</th>;
                    case 'tier':
                      return <th key={col.id} className="px-3.5 whitespace-nowrap">会员等级</th>;
                    case 'tags':
                      return <th key={col.id} className="px-3.5 whitespace-nowrap">客群运营标签</th>;
                    case 'channel_rep':
                      return <th key={col.id} className="px-3.5 whitespace-nowrap">渠道归因 / 专职客服</th>;
                    case 'gmv':
                      return <th key={col.id} className="px-3.5 whitespace-nowrap text-left">累计出卡总额 (GMV)</th>;
                    case 'trades':
                      return <th key={col.id} className="px-3.5 whitespace-nowrap">成单笔数 / 核销率</th>;
                    case 'last_card_time':
                      return <th key={col.id} className="px-3.5 whitespace-nowrap">最近出卡时间</th>;
                    case 'status_risk':
                      return <th key={col.id} className="px-3.5 whitespace-nowrap">状态 / 风控</th>;
                    case 'points':
                      return <th key={col.id} className="px-3.5 whitespace-nowrap text-left">积点可用余额 (PTS)</th>;
                    case 'pending_settlement':
                      return <th key={col.id} className="px-3.5 whitespace-nowrap text-left">待结算款项 / 质押</th>;
                    case 'credit_score':
                      return <th key={col.id} className="px-3.5 whitespace-nowrap">履约信用分</th>;
                    case 'prefer_cards':
                      return <th key={col.id} className="px-3.5 whitespace-nowrap">主力偏好卡种</th>;
                    case 'last_card_detail':
                      return <th key={col.id} className="px-3.5 whitespace-nowrap">最近一笔卡单</th>;
                    case 'registered_info':
                      return <th key={col.id} className="px-3.5 whitespace-nowrap">注册时间 / 活跃</th>;
                    case 'location_device':
                      return <th key={col.id} className="px-3.5 whitespace-nowrap">归属地 / 常用设备</th>;
                    default:
                      return <th key={col.id} className="px-3.5 whitespace-nowrap">{col.name}</th>;
                  }
                })}
                <th className="px-3.5 text-right whitespace-nowrap">作业穿透</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={activeVisibleColumns.length + 2} className="py-14 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
                      <span>未查询到匹配的出卡用户记录，请调整筛选条件</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isSelected = selectedRowIds.includes(user.id);
                  const isDisputed = user.riskTier === 'Tier-C' || user.riskLabel === '限制交易';

                  return (
                    <tr
                      key={user.id}
                      onClick={() => handleOpenUserDetail(user.id)}
                      className={`h-16 hover:bg-blue-50/40 transition-colors cursor-pointer group ${
                        isSelected ? 'bg-blue-50/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-3.5 text-center" onClick={e => handleRowSelect(user.id, e)}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Dynamic Columns */}
                      {activeVisibleColumns.map(col => {
                        switch (col.id) {
                          case 'uid_kyc':
                            return (
                              <td key={col.id} className="px-3.5 py-2.5">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1.5 font-code-token font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                                    <span>{user.uid}</span>
                                    <button
                                      onClick={e => {
                                        e.stopPropagation();
                                        copyToClipboard(user.uid, 'UID');
                                      }}
                                      className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                                      title="点击复制UID"
                                    >
                                      <span className="material-symbols-outlined text-[14px]">content_copy</span>
                                    </button>
                                  </div>
                                  <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold w-fit ${
                                    user.kycStatus === 'KYC高级'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                      : user.kycStatus === '基础实名'
                                      ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                      : user.kycStatus === '高危复核'
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {user.kycStatus} {user.kycDocType ? `(${user.kycDocType})` : ''}
                                  </span>
                                </div>
                              </td>
                            );

                          case 'user_info':
                            return (
                              <td key={col.id} className="px-3.5 py-2.5">
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-8 h-8 rounded-full ${user.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}>
                                    {user.initials}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-1">
                                      <span className="font-semibold text-slate-900 truncate">
                                        {user.name}
                                      </span>
                                      {isDisputed && (
                                        <span className="material-symbols-outlined text-rose-500 text-[15px]" title="触发高危碰卡规则">
                                          flag
                                        </span>
                                      )}
                                    </div>
                                    <span className="font-code-token text-[11px] text-slate-500">
                                      {user.phone}
                                    </span>
                                  </div>
                                </div>
                              </td>
                            );

                          case 'tier':
                            return (
                              <td key={col.id} className="px-3.5 py-2.5">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${user.tierColor}`}>
                                  <span className="material-symbols-outlined text-[15px]">
                                    {user.tier.includes('LV5') ? 'diamond' : user.tier.includes('LV4') ? 'workspace_premium' : user.tier.includes('LV3') ? 'military_tech' : user.tier.includes('LV2') ? 'shield' : 'verified'}
                                  </span>
                                  <span>{user.tier}</span>
                                </span>
                              </td>
                            );

                          case 'tags':
                            return (
                              <td key={col.id} className="px-3.5 py-2.5">
                                <div className="flex flex-wrap gap-1 max-w-[190px]">
                                  {user.tags.slice(0, 3).map((tag, idx) => (
                                    <span
                                      key={idx}
                                      className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </td>
                            );

                          case 'channel_rep':
                            return (
                              <td key={col.id} className="px-3.5 py-2.5">
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-slate-900 font-medium truncate max-w-[140px]">{user.channel}</span>
                                  <span className="text-[11px] font-code-token text-blue-600">
                                    {user.assignedRep || user.employeeRef.split('·')[0]}
                                  </span>
                                </div>
                              </td>
                            );

                          case 'gmv':
                            return (
                              <td key={col.id} className="px-3.5 py-2.5">
                                <div className="flex flex-col">
                                  <span className="font-numeric-stat font-bold text-slate-900 text-[13px]">
                                    ¥{user.gmv.toLocaleString()}
                                  </span>
                                  <span className="font-code-token text-[11px] text-slate-400">
                                    ${(user.gmvUsd || Math.round(user.gmv / 6.9)).toLocaleString()} USD
                                  </span>
                                </div>
                              </td>
                            );

                          case 'trades':
                            return (
                              <td key={col.id} className="px-3.5 py-2.5">
                                <div className="flex flex-col">
                                  <span className="font-code-token font-semibold text-slate-800">
                                    {user.tradesCount.toLocaleString()} 笔
                                  </span>
                                  <span className="text-[11px] text-emerald-700 font-medium">
                                    {user.successRate || '99.4% 成功核销'}
                                  </span>
                                </div>
                              </td>
                            );

                          case 'last_card_time':
                            return (
                              <td key={col.id} className="px-3.5 py-2.5">
                                <span className="font-code-token text-slate-600 text-[11px] block whitespace-nowrap">
                                  {user.lastCardTime}
                                </span>
                              </td>
                            );

                          case 'status_risk':
                            return (
                              <td key={col.id} className="px-3.5 py-2.5">
                                <div className="flex flex-col gap-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${
                                      isDisputed ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'
                                    }`} />
                                    <span className={`font-semibold text-xs ${
                                      isDisputed ? 'text-rose-700' : 'text-slate-800'
                                    }`}>
                                      {user.riskLabel}
                                    </span>
                                  </div>
                                  <span className={`text-[10px] font-code-token ${
                                    isDisputed ? 'text-rose-600 font-semibold' : 'text-slate-400'
                                  }`}>
                                    {user.riskTier || 'Tier-A'} {isDisputed ? '涉诉排查' : '低风控'}
                                  </span>
                                </div>
                              </td>
                            );

                          case 'points':
                            return (
                              <td key={col.id} className="px-3.5 py-2.5">
                                <div className="flex flex-col">
                                  <span className="font-code-token font-bold text-amber-700 text-xs">
                                    {(user.points || 0).toLocaleString()} PTS
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-code-token">
                                    ≈ ¥{((user.points || 0) * 0.718).toFixed(0)} RMB
                                  </span>
                                </div>
                              </td>
                            );

                          case 'pending_settlement':
                            return (
                              <td key={col.id} className="px-3.5 py-2.5">
                                <div className="flex flex-col">
                                  <span className="font-numeric-stat font-semibold text-blue-700 text-xs">
                                    ¥{(user.pendingSettlement || 0).toLocaleString()}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-code-token">
                                    押款: ¥{(user.collateral || 0).toLocaleString()}
                                  </span>
                                </div>
                              </td>
                            );

                          case 'credit_score':
                            const score = user.creditScore || 88;
                            return (
                              <td key={col.id} className="px-3.5 py-2.5">
                                <div className="flex items-center gap-1.5">
                                  <span className={`font-code-token font-bold text-xs ${
                                    score >= 90 ? 'text-emerald-700' : score >= 75 ? 'text-blue-700' : 'text-rose-600'
                                  }`}>
                                    {score}分
                                  </span>
                                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                    score >= 90 ? 'bg-emerald-50 text-emerald-700' : score >= 75 ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                                  }`}>
                                    {score >= 90 ? '极信' : score >= 75 ? '良好' : '高危'}
                                  </span>
                                </div>
                              </td>
                            );

                          case 'prefer_cards':
                            return (
                              <td key={col.id} className="px-3.5 py-2.5">
                                <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/60 truncate max-w-[130px]">
                                  {user.preferCards || 'Apple / Steam'}
                                </span>
                              </td>
                            );

                          case 'last_card_detail':
                            return (
                              <td key={col.id} className="px-3.5 py-2.5">
                                <div className="flex flex-col text-[11px]">
                                  <span className="font-medium text-slate-900 truncate max-w-[130px]">{user.lastCardType}</span>
                                  <div className="flex items-center gap-1 text-[10px]">
                                    <span className="font-numeric-stat text-slate-600">${user.lastCardAmount}</span>
                                    <span className={`px-1 rounded ${
                                      user.lastCardStatus === '核销成功' ? 'bg-emerald-50 text-emerald-700' : user.lastCardStatus === '涉诉冻结' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
                                    }`}>
                                      {user.lastCardStatus}
                                    </span>
                                  </div>
                                </div>
                              </td>
                            );

                          case 'registered_info':
                            return (
                              <td key={col.id} className="px-3.5 py-2.5">
                                <div className="flex flex-col text-[11px]">
                                  <span className="text-slate-700 font-code-token">{user.registeredDate || '2025-08-12'}</span>
                                  <span className="text-[10px] text-slate-400">活跃 {user.daysActive || 45} 天</span>
                                </div>
                              </td>
                            );

                          case 'location_device':
                            return (
                              <td key={col.id} className="px-3.5 py-2.5">
                                <div className="flex flex-col text-[11px] max-w-[140px]">
                                  <span className="text-slate-800 font-medium truncate">{user.location || '尼日利亚 · 拉各斯'}</span>
                                  <span className="text-[10px] text-slate-400 truncate">{user.deviceModel || 'iPhone 15 Pro'}</span>
                                </div>
                              </td>
                            );

                          default:
                            return <td key={col.id} className="px-3.5 py-2.5 text-slate-500">--</td>;
                        }
                      })}

                      {/* Action */}
                      <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleOpenUserDetail(user.id);
                          }}
                          className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                            isDisputed
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {isDisputed ? '仲裁复核' : '360° 档案'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Batch Action Floating Drawer */}
        {selectedRowIds.length > 0 && (
          <div className="bg-slate-900 text-white px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>
                已选定 <strong className="text-blue-400 font-bold">{selectedRowIds.length}</strong> / 20 项出卡用户
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setShowBatchTagModal(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-md border border-slate-700 cursor-pointer"
              >
                批量调整标签
              </button>
              <button
                onClick={() => {
                  showToast(`已为 ${selectedRowIds.length} 名用户下发风控信誉重新调权任务`);
                  setSelectedRowIds([]);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-md border border-slate-700 cursor-pointer"
              >
                风控等级调权
              </button>
              <button
                onClick={() => setShowBatchCouponModal(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md cursor-pointer"
              >
                批量发送营销权益券
              </button>
              <button
                onClick={() => setSelectedRowIds([])}
                className="px-2.5 py-1.5 text-slate-400 hover:text-white cursor-pointer ml-1"
              >
                取消全选
              </button>
            </div>
          </div>
        )}

        {/* Pagination Unit */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-200 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>共 248,520 条数据</span>
            <span>·</span>
            <span>每页 {pageSize} 条</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded border border-slate-200 disabled:opacity-40 cursor-pointer"
            >
              上一页
            </button>
            <button className="px-2.5 py-1 bg-[#004ac6] text-white rounded font-semibold">1</button>
            <button className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded border border-slate-200">2</button>
            <button className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded border border-slate-200">3</button>
            <span className="px-1 text-slate-400">...</span>
            <button className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded border border-slate-200">12426</button>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded border border-slate-200 cursor-pointer"
            >
              下一页
            </button>
            <div className="flex items-center gap-1 ml-2">
              <span>跳至</span>
              <input
                type="number"
                defaultValue={1}
                className="w-12 h-7 text-center rounded border border-slate-200 text-xs"
              />
              <span>页</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: 底部风控审计与快速运营观察底栏 (Fast Insights) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">router</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-xs">大客专属通道分配率: 98.4%</span>
            </div>
            <span className="text-[11px] font-code-token text-slate-500 truncate">
              GATEWAY-WESTAFRICA-01 · 负载 41% 极佳
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">verified_user</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-xs">反洗钱 / 欺诈防范规则执行</span>
            </div>
            <span className="text-[11px] font-code-token text-slate-500 truncate">
              RULE-SET: RISK-AUTO-DROP-v4 · 阻断率 100%
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">redeem</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-xs">出卡加息权益补贴进行中</span>
            </div>
            <span className="text-[11px] font-code-token text-slate-500 truncate">
              CAMPAIGN-ID: #ACT-202405-NG · 有效至今日 24:00
            </span>
          </div>
        </div>
      </section>
      </>
      )}

      {/* Modal: 录入白名单/新用户 */}
      {showWhitelistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">person_add</span>
                <h3 className="text-sm font-bold text-slate-900">录入出卡大户白名单</h3>
              </div>
              <button
                onClick={() => setShowWhitelistModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateWhitelistUser} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  用户真实全名 / 档口名称 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如: Chinedu Obi / Ikeja CardKing"
                  value={newWhitelistName}
                  onChange={e => setNewWhitelistName(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">自定义系统UID (选填)</label>
                  <input
                    type="text"
                    placeholder="UID-889xxxx"
                    value={newWhitelistUid}
                    onChange={e => setNewWhitelistUid(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">联系手机 / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="+234 800 000 0000"
                    value={newWhitelistPhone}
                    onChange={e => setNewWhitelistPhone(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">初始会员等级</label>
                  <select
                    value={newWhitelistTier}
                    onChange={e => setNewWhitelistTier(e.target.value)}
                    className="w-full h-9 px-2.5 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                  >
                    <option>LV3 黄金户</option>
                    <option>LV4 钻石大客</option>
                    <option>LV5 殿堂资深做市商</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">获客渠道归因</label>
                  <select
                    value={newWhitelistChannel}
                    onChange={e => setNewWhitelistChannel(e.target.value)}
                    className="w-full h-9 px-2.5 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                  >
                    <option>WhatsApp VIP 群 #02</option>
                    <option>拉各斯电脑城 (Ikeja)</option>
                    <option>Telegram VIP 频道</option>
                    <option>线下大户直约档口</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg text-blue-800 text-[11px] leading-relaxed">
                提示：录入白名单后，该用户将默认分配至绿色直通核销通道，享受自动汇率加成补贴与免质押授信放行特权。
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowWhitelistModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#004ac6] hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-xs cursor-pointer"
                >
                  确认录入生效
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: 批量调整运营标签 */}
      {showBatchTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900">批量修改运营标签</h3>
              <button
                onClick={() => setShowBatchTagModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-5 space-y-3.5 text-xs">
              <p className="text-slate-500">
                已选中 <strong className="text-slate-900">{selectedRowIds.length}</strong> 位用户，请输入需要追加的客群运营标签：
              </p>
              <input
                type="text"
                placeholder="例如: 实体大额批量 / 优质小票 / 优先秒结"
                value={batchTagInput}
                onChange={e => setBatchTagInput(e.target.value)}
                className="w-full h-9 px-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600"
              />
              <div className="flex flex-wrap gap-1.5">
                {['实体超市卡', 'Steam主力', '夜间高频', '大宗批量商', '零碰卡标兵'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setBatchTagInput(tag)}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[11px] cursor-pointer"
                  >
                    +{tag}
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowBatchTagModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={handleApplyBatchTags}
                  className="px-4 py-1.5 bg-[#004ac6] text-white rounded-lg font-semibold cursor-pointer"
                >
                  确认批量添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: 批量发放营销权益券 */}
      {showBatchCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900">批量定向发放权益券</h3>
              <button
                onClick={() => setShowBatchCouponModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-5 space-y-3.5 text-xs">
              <p className="text-slate-500">
                将向已选定的 <strong className="text-slate-900">{selectedRowIds.length}</strong> 位出卡用户派发营销权益：
              </p>
              <select
                value={couponName}
                onChange={e => setCouponName(e.target.value)}
                className="w-full h-9 px-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
              >
                <option>大客户出卡专属 +1.5% 加价券</option>
                <option>Apple/Steam 实体卡专属 +2.0% 溢价补贴券</option>
                <option>免排队极速放款 VIP 绿色通行证</option>
                <option>首单出卡保费 100% 减免豁免券</option>
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowBatchCouponModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={handleSendBatchCoupons}
                  className="px-4 py-1.5 bg-[#004ac6] text-white rounded-lg font-semibold cursor-pointer"
                >
                  确认立即派发
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: 自定义表格列配置 */}
      <UserColumnSettingsModal
        isOpen={showColumnSettingsModal}
        onClose={() => setShowColumnSettingsModal(false)}
        columns={columns}
        onSaveColumns={handleSaveColumns}
      />
    </div>
  );
};
