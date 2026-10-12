import React, { useState, useMemo } from 'react';
import { NavPath } from '../types';
import { RechargeAuditRecord, RechargeFlowStatus, RechargeCurrency } from '../types/rechargeAudit';
import { INITIAL_RECHARGE_AUDIT_RECORDS } from '../data/rechargeAuditData';
import { RechargeProofModal } from './recharge/RechargeProofModal';
import { RechargeAuditActionModal, ActionModalType } from './recharge/RechargeAuditActionModal';
import { BankImportModal } from './recharge/BankImportModal';

interface RechargeManagementViewProps {
  onNavigate?: (path: NavPath) => void;
}

export const RechargeManagementView: React.FC<RechargeManagementViewProps> = ({ onNavigate }) => {
  const [records, setRecords] = useState<RechargeAuditRecord[]>(INITIAL_RECHARGE_AUDIT_RECORDS);

  // Filters
  const [orderQuery, setOrderQuery] = useState<string>('');
  const [merchantQuery, setMerchantQuery] = useState<string>('');
  const [currencyFilter, setCurrencyFilter] = useState<string>('ALL');
  const [channelFilter, setChannelFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Selected for Batch
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [proofRecord, setProofRecord] = useState<RechargeAuditRecord | null>(null);
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: ActionModalType;
    record: RechargeAuditRecord | null;
  }>({
    isOpen: false,
    type: 'VERIFY',
    record: null
  });
  const [isBankImportOpen, setIsBankImportOpen] = useState<boolean>(false);

  // UX Feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [copiedOrderNo, setCopiedOrderNo] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCopyOrderNo = (orderNo: string) => {
    navigator.clipboard.writeText(orderNo);
    setCopiedOrderNo(orderNo);
    setTimeout(() => setCopiedOrderNo(null), 1500);
  };

  const handleRefreshStream = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('充值流水已实时同步，节点与网银心跳连通率 100%');
    }, 600);
  };

  // Open Action Modal
  const handleOpenAction = (record: RechargeAuditRecord, type: ActionModalType) => {
    setActionModal({
      isOpen: true,
      type,
      record
    });
  };

  // Action Confirmation
  const handleConfirmAction = (recordId: string, actionType: ActionModalType, remark?: string) => {
    setRecords(prev =>
      prev.map(r => {
        if (r.id === recordId) {
          if (actionType === 'VERIFY') {
            return {
              ...r,
              status: 'verified',
              statusLabel: '已到账',
              teller: '出纳-张敏 (OP-02 已验资)',
              reviewer: '复核: AUDIT-MGR-08',
              receivedTime: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
              countdown: undefined,
              elapsedTime: '验资耗时 1m05s'
            };
          }
          if (actionType === 'CREDIT_PTS') {
            return {
              ...r,
              status: 'credited',
              statusLabel: '已入账',
              reviewer: '复核: AUDIT-MGR-08 (放行)',
              creditedTime: new Date().toLocaleTimeString('zh-CN', { hour12: false })
            };
          }
          if (actionType === 'REJECT') {
            return {
              ...r,
              status: 'rejected',
              statusLabel: '已驳回',
              teller: '出纳-张敏 (驳回)',
              reviewer: '复核: AUDIT-MGR-08 (核准)',
              rejectReason: remark || '风控介入驳回',
              countdown: undefined
            };
          }
        }
        return r;
      })
    );

    if (actionType === 'VERIFY') {
      showToast('已确认验资到账！单据已流转至主管复核放行队列');
    } else if (actionType === 'CREDIT_PTS') {
      showToast('已确认入账 PTS 积点！已纳秒级写入商户资产账簿并广播推送');
    } else {
      showToast('已驳回该笔申报，并同步记入平台反洗钱风控日志库');
    }
  };

  // Batch Operations
  const handleBatchVerify = () => {
    setRecords(prev =>
      prev.map(r => {
        if (selectedIds.includes(r.id) && r.status === 'pending') {
          return {
            ...r,
            status: 'verified',
            statusLabel: '已到账',
            teller: '出纳-批量复核',
            reviewer: '复核: AUDIT-MGR-08'
          };
        }
        return r;
      })
    );
    showToast(`已批量核验通过选中的 ${selectedIds.length} 笔充值单据`);
    setSelectedIds([]);
  };

  const handleBatchCredit = () => {
    setRecords(prev =>
      prev.map(r => {
        if (selectedIds.includes(r.id) && r.status === 'verified') {
          return {
            ...r,
            status: 'credited',
            statusLabel: '已入账',
            reviewer: '复核: AUDIT-MGR-08 (批量放行)'
          };
        }
        return r;
      })
    );
    showToast(`已批量释放选中的 ${selectedIds.length} 笔单据的 PTS 积点`);
    setSelectedIds([]);
  };

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // Order query
      if (orderQuery.trim() && !r.orderNo.toLowerCase().includes(orderQuery.toLowerCase().trim())) {
        return false;
      }
      // Merchant query
      if (merchantQuery.trim()) {
        const q = merchantQuery.toLowerCase().trim();
        const match = r.merchantName.toLowerCase().includes(q) || r.mid.includes(q);
        if (!match) return false;
      }
      // Currency filter
      if (currencyFilter !== 'ALL' && r.currency !== currencyFilter) {
        return false;
      }
      // Channel filter
      if (channelFilter) {
        if (channelFilter === 'trc20' && r.payMethodType !== 'usdt') return false;
        if (channelFilter === 'bank_cmb' && !r.payMethod.includes('招商')) return false;
        if (channelFilter === 'bank_ocbc' && !r.payMethod.includes('OCBC')) return false;
        if (channelFilter === 'local_pay' && r.payMethodType !== 'local') return false;
      }
      // Status filter
      if (statusFilter && r.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [records, orderQuery, merchantQuery, currencyFilter, channelFilter, statusFilter]);

  // Select all checkbox
  const isAllSelected = filteredRecords.length > 0 && selectedIds.length === filteredRecords.length;
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecords.map(r => r.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  };

  // Quick switch to Teller Bench (filter pending)
  const handleActivateTellerBench = () => {
    setStatusFilter('pending');
    setCurrencyFilter('ALL');
    setChannelFilter('');
    showToast('已切换至【财务出纳查验台】，当前聚焦待人工验资单据');
  };

  return (
    <div className="flex flex-col w-full pb-16 gap-4 text-[#0b1c30] antialiased">
      {/* Toast message floating pill */}
      {toastMsg && (
        <div className="fixed top-16 right-8 z-50 bg-[#0b1c30] text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 头部业务导航与控制栏 */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white px-5 py-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              资金结算 · 商户充值审核与入账工作台
            </h1>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              RECHARGE-AUDIT-v2.0
            </span>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              PRD SEC-4
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-4xl leading-relaxed">
            依据标准实施双岗复核、不可撤销链上/银行确凿验资及 PTS 积点自动发行与防超发闭环。
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-500">账本同步:</span>
            <span className="font-bold text-emerald-700">1s 心跳</span>
          </div>
          <button
            onClick={handleRefreshStream}
            className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 transition-colors text-xs font-semibold shadow-2xs cursor-pointer"
            type="button"
          >
            <span className={`material-symbols-outlined text-[16px] text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>刷新流水</span>
          </button>
        </div>
      </header>

      {/* 1. Top Dashboard Grid (4 Columns Metric Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Confirmed Amount */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
              今日充值确认总额
            </span>
            <span className="font-mono text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[13px]">check_circle</span> 已确凿到账
            </span>
          </div>
          <div className="flex flex-col mt-1">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-slate-900 tracking-tight">$865,400.00</span>
              <span className="font-mono text-xs text-slate-400 font-bold">USD</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs text-slate-400">折算积点总计:</span>
              <span className="font-mono text-xs text-blue-600 font-bold tracking-tight">+6,230,880.00 PTS</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: '82%' }}></div>
          </div>
        </div>

        {/* Card 2: Pending Verifications */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
              待确认充值单量
            </span>
            <span className="font-mono text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping"></span> 实时排队
            </span>
          </div>
          <div className="flex flex-col mt-1">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-indigo-700 tracking-tight">14</span>
              <span className="text-xs text-slate-600 font-medium">笔待审</span>
            </div>
            <div className="flex items-center justify-between mt-1 text-xs">
              <span className="text-slate-400">平均到账查验时效:</span>
              <span className="font-mono text-slate-900 font-semibold">3.8 分钟 / 笔</span>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/60">
            <span className="material-symbols-outlined text-[14px] text-indigo-600">schedule</span>
            <span className="text-[11px]">其中 3 笔单据即将触达 10min 告警阈值</span>
          </div>
        </div>

        {/* Card 3: Rejected / Exceptions */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
              今日驳回 / 异常单
            </span>
            <span className="font-mono text-[11px] bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">shield</span> 风控介入
            </span>
          </div>
          <div className="flex flex-col mt-1">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-rose-600 tracking-tight">2</span>
              <span className="text-xs text-slate-600 font-medium">笔异常拦截</span>
            </div>
            <div className="flex flex-col gap-1 mt-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">虚假水单拦截:</span>
                <span className="font-mono font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                  1 笔 (篡改图片EXIF)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">流水金额不符:</span>
                <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                  1 笔 (少付 $200)
                </span>
              </div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>风控误伤率 0.00%</span>
            <span
              onClick={() => setStatusFilter('rejected')}
              className="text-blue-600 cursor-pointer hover:underline font-semibold"
            >
              调阅日志 →
            </span>
          </div>
        </div>

        {/* Card 4: Channel Distribution (Compact SVG Donut Chart) */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
              主流通道充值分布
            </span>
            <span className="font-mono text-[10px] text-slate-400 font-semibold">LIVE FEED</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            {/* Donut Chart */}
            <div className="w-13 h-13 relative flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.8"
                ></path>
                {/* USDT 68% */}
                <path
                  className="text-blue-600"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="68, 100"
                  strokeLinecap="round"
                  strokeWidth="3.8"
                ></path>
                {/* Bank Wire 24% */}
                <path
                  className="text-emerald-600"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="24, 100"
                  strokeDashoffset="-68"
                  strokeLinecap="round"
                  strokeWidth="3.8"
                ></path>
                {/* Local 8% */}
                <path
                  className="text-indigo-500"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="8, 100"
                  strokeDashoffset="-92"
                  strokeLinecap="round"
                  strokeWidth="3.8"
                ></path>
              </svg>
            </div>
            <div className="flex flex-col gap-1 flex-grow text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span className="text-slate-600">USDT (TRC20)</span>
                </div>
                <span className="font-mono font-bold text-slate-900">68%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span className="text-slate-600">对公电汇</span>
                </div>
                <span className="font-mono font-bold text-slate-900">24%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  <span className="text-slate-600">本地代收</span>
                </div>
                <span className="font-mono font-bold text-slate-900">8%</span>
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>汇率基准: 1 USD = 7.20 PTS</span>
            <span className="font-mono text-emerald-700 font-semibold">T+0 即时入账</span>
          </div>
        </div>
      </div>

      {/* 2. Multi-dimensional Filters & Quick Action Bar */}
      <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Input filters */}
          <div className="flex flex-wrap items-center gap-2.5 flex-grow">
            {/* Recharge Order ID */}
            <div className="relative min-w-[200px] flex-1 max-w-[260px]">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[16px] text-slate-400">
                search
              </span>
              <input
                value={orderQuery}
                onChange={e => setOrderQuery(e.target.value)}
                className="w-full h-9 pl-8 pr-3 text-xs bg-slate-50 text-slate-800 rounded-lg placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="充值单号 (TOP...)"
                type="text"
              />
            </div>

            {/* Merchant / MID */}
            <div className="relative min-w-[190px] flex-1 max-w-[250px]">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[16px] text-slate-400">
                storefront
              </span>
              <input
                value={merchantQuery}
                onChange={e => setMerchantQuery(e.target.value)}
                className="w-full h-9 pl-8 pr-3 text-xs bg-slate-50 text-slate-800 rounded-lg placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="商户主体 / MID"
                type="text"
              />
            </div>

            {/* Currency Selector Pills */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-medium border border-slate-200/60">
              <span
                onClick={() => setCurrencyFilter('ALL')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  currencyFilter === 'ALL'
                    ? 'bg-white text-blue-600 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                全部币种
              </span>
              <span
                onClick={() => setCurrencyFilter('USDT')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  currencyFilter === 'USDT'
                    ? 'bg-white text-blue-600 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                USDT
              </span>
              <span
                onClick={() => setCurrencyFilter('USD')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  currencyFilter === 'USD'
                    ? 'bg-white text-blue-600 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                USD
              </span>
              <span
                onClick={() => setCurrencyFilter('NGN')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  currencyFilter === 'NGN'
                    ? 'bg-white text-blue-600 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                NGN
              </span>
            </div>

            {/* Channel Filter */}
            <select
              value={channelFilter}
              onChange={e => setChannelFilter(e.target.value)}
              className="h-9 px-2.5 text-xs bg-slate-50 text-slate-700 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer font-medium"
            >
              <option value="">全部充值渠道</option>
              <option value="trc20">TRC20 链上充币专线</option>
              <option value="bank_cmb">招商银行离岸对公户</option>
              <option value="bank_ocbc">华侨银行 (OCBC) 新加坡</option>
              <option value="local_pay">非洲本地代收通道</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-9 px-2.5 text-xs bg-slate-50 text-slate-700 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer font-medium"
            >
              <option value="">流转状态: 全部</option>
              <option value="pending">待确认 (Pending Audit)</option>
              <option value="verified">已到账 (Funds Confirmed)</option>
              <option value="credited">已入账 (PTS Credited)</option>
              <option value="rejected">已驳回 (Rejected)</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0 self-end lg:self-auto">
            <button
              onClick={() => setIsBankImportOpen(true)}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-blue-600">upload_file</span>
              <span>批量网银对账导入</span>
            </button>
            <button
              onClick={handleActivateTellerBench}
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-xs font-semibold shadow-xs cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
              <span>财务出纳查验台</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. High-Density Reconciliation & Approval Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden flex flex-col">
        {/* Table Meta Bar */}
        <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <input
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                id="selectAll"
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleSelectAll}
              />
              <label className="text-[11px] font-semibold text-slate-500 uppercase cursor-pointer" htmlFor="selectAll">
                全选当页单据
              </label>
            </div>
            <span className="text-slate-300 font-mono">/</span>
            <span className="text-xs text-slate-500">
              共匹配到 <span className="font-mono font-bold text-slate-900">{filteredRecords.length}</span> 笔充值充点记录
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-500 font-mono text-[11px]">系统双向自动校验通过率: 98.4%</span>
            </div>
            <div
              onClick={() => showToast('当前已呈现全套字段：申报资金、预折积点、凭证哈希与经办复核')}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span className="text-xs">自定义列</span>
            </div>
          </div>
        </div>

        {/* The Dense Data Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[1100px]">
            <thead>
              <tr className="h-9 bg-slate-50 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200 select-none">
                <th className="w-10 px-4 text-center">#</th>
                <th className="px-3">充值单号 / 申报时间</th>
                <th className="px-3">商户主体 / MID</th>
                <th className="px-3 text-right">申报充值资金</th>
                <th className="px-3 text-right">预折算积点 (PTS)</th>
                <th className="px-3">付款方式 / 收款账户</th>
                <th className="px-3">真实凭证 / 链上TXID</th>
                <th className="px-3 text-center">流转状态</th>
                <th className="px-3">经办出纳 / 复核岗</th>
                <th className="px-4 text-center w-48">核验操作动作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-medium">
                    没有找到符合条件的充值审核单据
                  </td>
                </tr>
              ) : (
                filteredRecords.map(item => {
                  const isChecked = selectedIds.includes(item.id);
                  const isRejected = item.status === 'rejected';

                  return (
                    <tr
                      key={item.id}
                      className={`h-14 hover:bg-slate-50/80 transition-colors group ${
                        isRejected ? 'bg-rose-50/20' : item.status === 'verified' ? 'bg-blue-50/10' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 text-center">
                        <input
                          className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(item.id)}
                        />
                      </td>

                      {/* Order No / Create Time */}
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span
                              className={`font-mono text-xs font-bold tracking-tight ${
                                isRejected ? 'text-rose-700' : 'text-blue-600'
                              }`}
                            >
                              {item.orderNo}
                            </span>
                            <button
                              onClick={() => handleCopyOrderNo(item.orderNo)}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity p-0.5 cursor-pointer"
                              title="复制单号"
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {copiedOrderNo === item.orderNo ? 'check' : 'content_copy'}
                              </span>
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] text-slate-400">{item.createTime}</span>
                            {item.countdown && (
                              <span className="font-mono text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1 py-0.2 rounded font-semibold animate-pulse">
                                {item.countdown}
                              </span>
                            )}
                            {item.elapsedTime && (
                              <span className="font-mono text-[10px] text-slate-400">{item.elapsedTime}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Merchant Legal Name / MID */}
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-xs font-semibold ${
                                isRejected ? 'text-rose-800 font-bold' : 'text-slate-900'
                              }`}
                            >
                              {item.merchantName}
                            </span>
                            <span className={`font-mono text-[10px] px-1 rounded font-bold ${item.tierColor}`}>
                              {item.tier}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400 mt-0.5">MID: {item.mid}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-3 py-2 text-right">
                        <div className="flex flex-col items-end">
                          <span
                            className={`font-mono text-xs font-bold tracking-tight ${
                              isRejected ? 'text-slate-400 line-through' : 'text-slate-900'
                            }`}
                          >
                            {item.currency === 'NGN'
                              ? `₦${item.amount.toLocaleString()}`
                              : `$${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                          </span>
                          <span
                            className={`font-mono text-[10px] font-semibold ${
                              item.currency === 'USDT'
                                ? 'text-blue-600'
                                : isRejected
                                ? 'text-slate-400'
                                : 'text-slate-600'
                            }`}
                          >
                            {item.currencySub}
                          </span>
                        </div>
                      </td>

                      {/* Points Credited */}
                      <td className="px-3 py-2 text-right">
                        <div className="flex flex-col items-end">
                          <span
                            className={`font-mono text-xs font-semibold tracking-tight ${
                              isRejected ? 'text-slate-400 line-through' : 'text-emerald-700'
                            }`}
                          >
                            +{item.pointsCredited.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {isRejected ? '已冻结申报' : `RATE: ${item.exchangeRate.toFixed(2)}`}
                          </span>
                        </div>
                      </td>

                      {/* Pay Method / Receiving Account */}
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.payMethodType === 'usdt'
                                  ? 'bg-blue-600'
                                  : item.payMethodType === 'bank'
                                  ? 'bg-emerald-600'
                                  : 'bg-indigo-600'
                              }`}
                            ></span>
                            <span className="text-xs font-medium text-slate-800">{item.payMethod}</span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400 truncate max-w-[180px] mt-0.5">
                            {item.receivingAccount}
                          </span>
                        </div>
                      </td>

                      {/* Proof / TxID */}
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div
                            onClick={() => setProofRecord(item)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors border ${
                              isRejected
                                ? 'bg-rose-50 border-rose-200 text-rose-600'
                                : item.proofType === 'blockchain'
                                ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                            }`}
                            title="点击查验原始水单 / 凭证存证"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {item.proofType === 'fake_alert'
                                ? 'broken_image'
                                : item.proofType === 'blockchain'
                                ? 'receipt_long'
                                : item.proofType === 'swift'
                                ? 'description'
                                : 'attach_file'}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <span
                                className={`font-mono text-[11px] truncate max-w-[90px] ${
                                  isRejected ? 'text-rose-700 font-bold' : 'text-slate-800'
                                }`}
                                title={item.proofRef}
                              >
                                {item.proofRef.length > 14 ? `${item.proofRef.slice(0, 10)}...` : item.proofRef}
                              </span>
                              {item.proofType === 'blockchain' && (
                                <button
                                  onClick={() => window.open(item.proofUrl || '#', '_blank')}
                                  className="text-slate-400 hover:text-blue-600 cursor-pointer"
                                  title="前往区块链浏览器查验"
                                >
                                  <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                                </button>
                              )}
                            </div>
                            <span
                              className={`font-mono text-[10px] ${
                                isRejected ? 'text-slate-400' : 'text-emerald-700 font-medium'
                              }`}
                            >
                              {item.proofStatus}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Flow Status */}
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                            item.status === 'pending'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : item.status === 'verified'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : item.status === 'credited'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.status === 'pending'
                                ? 'bg-indigo-600'
                                : item.status === 'verified'
                                ? 'bg-blue-600'
                                : item.status === 'credited'
                                ? 'bg-emerald-500'
                                : 'bg-rose-500'
                            }`}
                          ></span>
                          {item.statusLabel}
                        </span>
                      </td>

                      {/* Teller / Reviewer */}
                      <td className="px-3 py-2">
                        <div className="flex flex-col text-xs">
                          <span
                            className={`font-medium ${
                              isRejected ? 'text-rose-700' : 'text-slate-800'
                            }`}
                          >
                            {item.teller}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 mt-0.5">{item.reviewer}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {item.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleOpenAction(item, 'VERIFY')}
                                className="h-7 px-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[14px]">check</span>
                                <span>核验到账</span>
                              </button>
                              <button
                                onClick={() => setProofRecord(item)}
                                className="h-7 px-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-xs font-medium cursor-pointer"
                                type="button"
                              >
                                凭证
                              </button>
                              <button
                                onClick={() => handleOpenAction(item, 'REJECT')}
                                className="h-7 px-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white transition-colors text-xs font-medium cursor-pointer"
                                title="驳回此充值单"
                                type="button"
                              >
                                驳回
                              </button>
                            </>
                          )}

                          {item.status === 'verified' && (
                            <>
                              <button
                                onClick={() => handleOpenAction(item, 'CREDIT_PTS')}
                                className="h-7 px-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-opacity text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[14px]">currency_exchange</span>
                                <span>确认入账PTS</span>
                              </button>
                              <button
                                onClick={() => setProofRecord(item)}
                                className="h-7 px-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-xs font-medium cursor-pointer"
                                type="button"
                              >
                                详情
                              </button>
                            </>
                          )}

                          {item.status === 'credited' && (
                            <button
                              onClick={() => setProofRecord(item)}
                              className="h-7 px-2.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-xs font-medium flex items-center gap-1 cursor-pointer"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[14px] text-blue-600">receipt</span>
                              <span>凭据存证</span>
                            </button>
                          )}

                          {item.status === 'rejected' && (
                            <button
                              onClick={() => setProofRecord(item)}
                              className="h-7 px-2.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors text-xs font-medium flex items-center gap-1 cursor-pointer"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[14px]">policy</span>
                              <span>风控查处单</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination & Selection Summary Bar */}
        <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              显示第 <strong className="text-slate-900 font-mono">1 至 {filteredRecords.length}</strong> 项，共计{' '}
              <strong className="text-slate-900 font-mono">128</strong> 项
            </span>
            <div className="flex items-center gap-1.5">
              <span>每页显示:</span>
              <select
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
                className="h-7 px-2 bg-white text-slate-800 rounded border border-slate-200 font-mono text-xs cursor-pointer focus:outline-none"
              >
                <option value={10}>10 条 / 页</option>
                <option value={20}>20 条 / 页</option>
                <option value={50}>50 条 / 页</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="h-7 px-2.5 rounded bg-white text-slate-500 hover:bg-slate-100 border border-slate-200 disabled:opacity-50 text-xs flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">chevron_left</span>
              <span>上一页</span>
            </button>
            <div className="flex items-center gap-1">
              <span className="h-7 w-7 rounded bg-blue-600 text-white flex items-center justify-center text-xs font-semibold font-mono shadow-xs">
                1
              </span>
              <span
                onClick={() => showToast('已切换至第 2 页')}
                className="h-7 w-7 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-xs cursor-pointer font-mono"
              >
                2
              </span>
              <span
                onClick={() => showToast('已切换至第 3 页')}
                className="h-7 w-7 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-xs cursor-pointer font-mono"
              >
                3
              </span>
              <span className="h-7 w-7 text-slate-400 flex items-center justify-center text-xs">...</span>
              <span
                onClick={() => showToast('已跳转至尾页')}
                className="h-7 w-7 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-xs cursor-pointer font-mono"
              >
                13
              </span>
            </div>
            <button
              onClick={() => showToast('已翻至下一页')}
              className="h-7 px-2.5 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs flex items-center gap-1 cursor-pointer"
            >
              <span>下一页</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Closed-Loop Recharge Lifecycle Flow Indicator (底部充值闭环链路指示器) */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[18px]">verified_user</span>
            <span className="font-bold text-slate-900 text-xs sm:text-sm">
              充值闭环流转控制规范 (双重确凿到账验证体系)
            </span>
          </div>
          <span className="font-mono text-[10px] text-slate-400 font-bold tracking-wider">
            STRICT RISK-POLICY ENFORCED
          </span>
        </div>

        {/* Stepper Graphic Bar */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
          {/* Step 1 */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-col gap-1 relative">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                01 步骤
              </span>
              <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
            </div>
            <div className="text-xs font-semibold text-slate-900 mt-1">商户发起申报</div>
            <div className="text-[11px] text-slate-500 leading-relaxed">
              商户作业端提交充值订单，锁定当时结算汇率并分配专属归集收款账户。
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-col gap-1 relative">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                02 步骤
              </span>
              <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
            </div>
            <div className="text-xs font-semibold text-slate-900 mt-1">凭证上传 / TXID登记</div>
            <div className="text-[11px] text-slate-500 leading-relaxed">
              上传清晰网银电子水单或填报链上交易哈希 (TXID)，系统启动反欺诈 EXIF 校验。
            </div>
          </div>

          {/* Step 3: Highlighted Active Stage */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex flex-col gap-1 relative shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold text-white bg-blue-600 px-1.5 py-0.2 rounded">
                03 核心
              </span>
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
            </div>
            <div className="text-xs font-bold text-blue-900 mt-1">财务核实资金到账</div>
            <div className="text-[11px] text-blue-950 font-medium leading-relaxed">
              经办出纳登录网银/节点确认账上收到等额真实法币或数字货币，严禁信用垫付。
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-col gap-1 relative">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                04 步骤
              </span>
              <span className="material-symbols-outlined text-[16px] text-slate-400">pending</span>
            </div>
            <div className="text-xs font-semibold text-slate-900 mt-1">点击确认到账 / 复核</div>
            <div className="text-[11px] text-slate-500 leading-relaxed">
              主管复核岗签署校验意见，触发清算引擎写入不可逆账务流水记录。
            </div>
          </div>

          {/* Step 5 */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-col gap-1 relative">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                05 终态
              </span>
              <span className="material-symbols-outlined text-[16px] text-emerald-600">rocket_launch</span>
            </div>
            <div className="text-xs font-semibold text-slate-900 mt-1">自动入账 PTS 积点</div>
            <div className="text-[11px] text-slate-500 leading-relaxed">
              核心节点纳秒级自动增加该商户可用积点余额，实时短信与 Webhook 广播推送通知。
            </div>
          </div>
        </div>

        {/* Security Footnote */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="material-symbols-outlined text-blue-600 text-[18px]">info</span>
            <span>
              出纳作业纪律：凡单笔金额超过 <strong className="font-mono text-slate-900 font-bold">$100,000 USD</strong>{' '}
              等值的充值申请，必须由财务总监 (CFO 密匙) 完成终审双签确认。
            </span>
          </div>
          <button
            onClick={() => showToast('已打开《财务内控资金核验与反欺诈作业SOP》合规细则')}
            className="font-mono text-blue-600 hover:text-blue-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>查阅财务内控SOP准则</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* MODAL: Electronic Proof & Anti-Fraud Inspection */}
      <RechargeProofModal
        record={proofRecord}
        onClose={() => setProofRecord(null)}
        onVerify={record => {
          setProofRecord(null);
          handleOpenAction(record, 'VERIFY');
        }}
        onReject={record => {
          setProofRecord(null);
          handleOpenAction(record, 'REJECT');
        }}
      />

      {/* MODAL: Audit Actions (Verify / Credit / Reject) */}
      <RechargeAuditActionModal
        isOpen={actionModal.isOpen}
        type={actionModal.type}
        record={actionModal.record}
        onClose={() => setActionModal({ isOpen: false, type: 'VERIFY', record: null })}
        onConfirm={handleConfirmAction}
      />

      {/* MODAL: Batch Bank Statement Import */}
      <BankImportModal
        isOpen={isBankImportOpen}
        onClose={() => setIsBankImportOpen(false)}
        onImportSuccess={count => {
          showToast(`已成功导入 ${count} 笔对账数据并完成双向匹配核验！`);
        }}
      />

      {/* FLOATING BATCH ACTIONS TOOLBAR (Sticky when rows are checked) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-y-0 -translate-x-1/2 bg-[#0b1c30] text-white px-5 py-3 rounded-2xl shadow-2xl z-40 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 border border-slate-700">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-medium">
              已选中 <strong className="font-mono text-emerald-400 text-sm">{selectedIds.length}</strong> 笔充值单据
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBatchVerify}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>批量核验到账</span>
            </button>
            <button
              onClick={handleBatchCredit}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">currency_exchange</span>
              <span>批量审核入账PTS</span>
            </button>
          </div>
          <button
            onClick={() => setSelectedIds([])}
            className="text-slate-400 hover:text-white p-1 ml-1 cursor-pointer transition-colors"
            title="取消勾选"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}
    </div>
  );
};
