import React, { useState, useEffect } from 'react';
import { NavPath } from '../types';
import {
  LedgerTransaction,
  LedgerTabType,
  LedgerTxType
} from './finance/points-flow/types';
import {
  MOCK_LEDGER_TRANSACTIONS,
  MOCK_LEDGER_METRICS
} from './finance/points-flow/mockData';
import { ForensicTracePanel } from './finance/points-flow/ForensicTracePanel';
import { RawPayloadModal } from './finance/points-flow/RawPayloadModal';
import { HashVerifyModal } from './finance/points-flow/HashVerifyModal';
import { ExportSnapshotModal } from './finance/points-flow/ExportSnapshotModal';
import { BizDetailDrawer } from './finance/points-flow/BizDetailDrawer';

interface PointsTransactionsViewProps {
  onNavigate?: (path: NavPath) => void;
}

export const PointsTransactionsView: React.FC<PointsTransactionsViewProps> = ({ onNavigate }) => {
  // State
  const [transactions, setTransactions] = useState<LedgerTransaction[]>(MOCK_LEDGER_TRANSACTIONS);
  const [selectedTx, setSelectedTx] = useState<LedgerTransaction>(MOCK_LEDGER_TRANSACTIONS[0]);
  const [activeTab, setActiveTab] = useState<LedgerTabType>('all');

  // Filters
  const [searchTxid, setSearchTxid] = useState('');
  const [searchBizId, setSearchBizId] = useState('');
  const [searchMerchant, setSearchMerchant] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState('2026-09-18 00:00:00 - 23:59:59');

  // Modals & Drawers
  const [isRawModalOpen, setIsRawModalOpen] = useState(false);
  const [isHashModalOpen, setIsHashModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isBizDrawerOpen, setIsBizDrawerOpen] = useState(false);

  // Live millisecond ticker
  const [liveTicker, setLiveTicker] = useState('2026-09-18 16:42:08.841 UTC+8');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const pad = (n: number, len = 2) => String(n).padStart(len, '0');
      const y = now.getFullYear();
      const m = pad(now.getMonth() + 1);
      const d = pad(now.getDate());
      const hh = pad(now.getHours());
      const mm = pad(now.getMinutes());
      const ss = pad(now.getSeconds());
      const ms = pad(now.getMilliseconds(), 3);
      setLiveTicker(`${y}-${m}-${d} ${hh}:${mm}:${ss}.${ms} UTC+8`);
    }, 97);
    return () => clearInterval(timer);
  }, []);

  // Filter logic
  const filteredList = transactions.filter(tx => {
    // Tab filter
    if (activeTab === 'inflow') {
      if (tx.type !== 'RECHARGE' && tx.type !== 'UNFREEZE_RETURN' && tx.type !== 'MANUAL_CREDIT') {
        return false;
      }
    } else if (activeTab === 'outflow') {
      if (tx.type !== 'CARD_DEDUCT' && tx.type !== 'DISPUTE_PENALTY') {
        return false;
      }
    } else if (activeTab === 'escrow') {
      if (tx.type !== 'CARD_LOCK' && tx.type !== 'UNFREEZE_RETURN') {
        return false;
      }
    }

    // Specific filters
    if (searchTxid.trim()) {
      if (!tx.txid.toLowerCase().includes(searchTxid.trim().toLowerCase())) return false;
    }
    if (searchBizId.trim()) {
      if (!tx.bizId.toLowerCase().includes(searchBizId.trim().toLowerCase())) return false;
    }
    if (searchMerchant.trim()) {
      const q = searchMerchant.trim().toLowerCase();
      if (!tx.merchantName.toLowerCase().includes(q) &&
          !tx.merchantShort.toLowerCase().includes(q) &&
          !tx.merchantMid.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (typeFilter) {
      if (tx.type !== typeFilter) return false;
    }

    return true;
  });

  const handleResetFilters = () => {
    setSearchTxid('');
    setSearchBizId('');
    setSearchMerchant('');
    setTypeFilter('');
    setDateRange('2026-09-18 00:00:00 - 23:59:59');
    showToast('检索条件已重置，已展示全量流水事实账本');
  };

  const handleSearch = () => {
    showToast(`检索完成，已匹配 ${filteredList.length} 条事实账本流水`);
  };

  return (
    <div className="flex flex-col w-full pb-12 text-slate-800 antialiased gap-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs border border-slate-700 animate-fadeIn">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 顶部统一业务标头 */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white px-5 py-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              03 积点流水 · 底层账本事实与毫秒级双向穿透审计台
            </h1>
            <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded font-mono text-[11px] font-bold">
              LEDGER-TX-V2.0-ACID
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            基于复式借贷记账法与密码学哈希存证，提供毫秒级时间戳、不可篡改证据链与跨业务单全息双向穿透
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          <div className="flex items-center gap-1.5 bg-slate-100/80 px-3 py-1.5 rounded-lg shadow-2xs border border-slate-200/80">
            <span className="material-symbols-outlined text-slate-400 text-[16px]">schedule</span>
            <span className="text-[11px] text-slate-500 font-semibold uppercase">对账基准窗口:</span>
            <span className="font-mono text-xs text-slate-800 font-medium">
              {liveTicker}
            </span>
          </div>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors shadow-2xs border border-slate-200/80 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-blue-600 text-[16px]">sync_alt</span>
            <span>对账流水快照导出</span>
          </button>

          <button
            onClick={() => setIsHashModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs active:scale-95 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>触发全网哈希核验</span>
          </button>

          {/* Cross Module Navigation */}
          {onNavigate && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onNavigate('points-account')}
                className="px-2.5 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs flex items-center gap-1 transition-colors border border-slate-200/80 cursor-pointer"
                title="跳转至01 账户管理"
              >
                <span className="material-symbols-outlined text-[15px] text-blue-600">account_balance_wallet</span>
                <span>账户管理</span>
              </button>
              <button
                onClick={() => onNavigate('recharge-management')}
                className="px-2.5 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs flex items-center gap-1 transition-colors border border-slate-200/80 cursor-pointer"
                title="跳转至02 充值管理"
              >
                <span className="material-symbols-outlined text-[15px] text-emerald-600">add_card</span>
                <span>充值管理</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 1. 置顶核心流向看板 (4列等宽 KPI Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: 今日全网入账流水 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label-caps text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              今日全网入账流水 (Inflow)
            </span>
            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-code-token text-[10px] font-semibold">
              <span className="material-symbols-outlined text-[12px]">trending_up</span>
              {MOCK_LEDGER_METRICS.inflowGrowth}
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-numeric-stat text-2xl md:text-[28px] text-emerald-600 font-bold leading-none tracking-tight">
                +{MOCK_LEDGER_METRICS.todayInflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="font-code-token text-xs text-slate-400 font-medium">PTS</span>
            </div>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed font-body-sm">
              {MOCK_LEDGER_METRICS.inflowBreakdown}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-500 text-xs">
            <span className="font-code-token text-[11px] text-slate-500 font-medium">
              TOTAL INFLOW TX: {MOCK_LEDGER_METRICS.inflowTxCount.toLocaleString()} 笔
            </span>
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">south_west</span>
          </div>
        </div>

        {/* Card 2: 今日全网出账流水 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label-caps text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              今日全网出账流水 (Outflow)
            </span>
            <span className="flex items-center gap-1 bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-code-token text-[10px] font-semibold">
              <span className="material-symbols-outlined text-[12px]">schedule</span>
              {MOCK_LEDGER_METRICS.outflowStatus}
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-numeric-stat text-2xl md:text-[28px] text-rose-600 font-bold leading-none tracking-tight">
                -{MOCK_LEDGER_METRICS.todayOutflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="font-code-token text-xs text-slate-400 font-medium">PTS</span>
            </div>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed font-body-sm">
              {MOCK_LEDGER_METRICS.outflowBreakdown}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-500 text-xs">
            <span className="font-code-token text-[11px] text-slate-500 font-medium">
              TOTAL OUTFLOW TX: {MOCK_LEDGER_METRICS.outflowTxCount.toLocaleString()} 笔
            </span>
            <span className="material-symbols-outlined text-rose-600 text-[18px]">north_east</span>
          </div>
        </div>

        {/* Card 3: 净变动差额 (Net Change) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label-caps text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              净变动差额 (Net Change)
            </span>
            <span className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-code-token text-[10px] font-semibold">
              池内稳健净增
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-numeric-stat text-2xl md:text-[28px] text-blue-600 font-bold leading-none tracking-tight">
                +{MOCK_LEDGER_METRICS.netChange.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="font-code-token text-xs text-slate-400 font-medium">PTS</span>
            </div>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed font-body-sm">
              全网资产准备池维持正向增益，系统防击穿冗余充沛
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-500 text-xs">
            <span className="font-code-token text-[11px] text-slate-500 font-medium">
              DELTA RATIO: {MOCK_LEDGER_METRICS.deltaRatio}
            </span>
            <span className="material-symbols-outlined text-blue-600 text-[18px]">balance</span>
          </div>
        </div>

        {/* Card 4: 当前在途锁定流水 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label-caps text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              当前在途锁定流水 (In-Escrow)
            </span>
            <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded font-code-token text-[10px] font-semibold">
              <span className="material-symbols-outlined text-[12px]">lock</span>锁定管控
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-numeric-stat text-2xl md:text-[28px] text-indigo-600 font-bold leading-none tracking-tight">
                {MOCK_LEDGER_METRICS.activeEscrowPoints.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="font-code-token text-xs text-slate-400 font-medium">PTS</span>
            </div>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed font-body-sm">
              锁定中 {MOCK_LEDGER_METRICS.activeEscrowOrders.toLocaleString()} 笔卡单预占，等待官方API核销回执
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-500 text-xs">
            <span className="font-code-token text-[11px] text-slate-500 font-medium">
              ACTIVE ESCROW: {MOCK_LEDGER_METRICS.activeEscrowOrders.toLocaleString()} ORDERS
            </span>
            <span className="material-symbols-outlined text-indigo-600 text-[18px]">lock_clock</span>
          </div>
        </div>
      </div>

      {/* 2. 场景化流向筛选 Tab 栏 & 3. 多维组合检索工具栏 */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 flex flex-col gap-3.5">
        {/* Tab 栏 - Standard Image Tab Bar Style */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { id: 'all', label: '全部流水 (All)', badge: '18,420', icon: 'receipt_long' },
              { id: 'inflow', label: '入账流水 (Inflow +)', badge: '9,284', icon: 'add_circle' },
              { id: 'outflow', label: '出账流水 (Outflow -)', badge: '7,716', icon: 'remove_circle' },
              { id: 'escrow', label: '冻结与解冻流水 (Hold/Release)', badge: '1,420', icon: 'lock' }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as LedgerTabType)}
                  className={`px-5 py-3 font-bold rounded-t-lg transition-colors shrink-0 flex items-center gap-2 relative cursor-pointer text-xs sm:text-sm ${
                    isActive
                      ? 'text-[#004ac6] bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#004ac6]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono transition-colors ${
                      isActive ? 'bg-blue-100 text-[#004ac6] font-semibold' : 'bg-slate-100 text-slate-600 font-medium'
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 font-code-token text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>DOUBLE-ENTRY LEDGER COMPLIANT · 无损记账链</span>
          </div>
        </div>

        {/* 多维组合检索工具栏 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/80 shadow-2xs focus-within:border-blue-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-500/20 transition-all">
            <span className="material-symbols-outlined text-slate-400 text-[16px]">tag</span>
            <input
              value={searchTxid}
              onChange={e => setSearchTxid(e.target.value)}
              className="w-full bg-transparent font-code-token text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
              placeholder="流水号 (如 PTS20260918...)"
              type="text"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/80 shadow-2xs focus-within:border-blue-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-500/20 transition-all">
            <span className="material-symbols-outlined text-slate-400 text-[16px]">quick_reference_all</span>
            <input
              value={searchBizId}
              onChange={e => setSearchBizId(e.target.value)}
              className="w-full bg-transparent font-code-token text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
              placeholder="关联业务单 (KD/TOP/ARB...)"
              type="text"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/80 shadow-2xs focus-within:border-blue-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-500/20 transition-all">
            <span className="material-symbols-outlined text-slate-400 text-[16px]">storefront</span>
            <input
              value={searchMerchant}
              onChange={e => setSearchMerchant(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none font-body-sm"
              placeholder="商户主体 / MID (如 MID-8012)"
              type="text"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/80 shadow-2xs focus-within:border-blue-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-500/20 transition-all">
            <span className="material-symbols-outlined text-slate-400 text-[16px]">filter_list</span>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 focus:outline-none cursor-pointer font-body-sm"
            >
              <option value="">全部变动类型 (All Types)</option>
              <option value="RECHARGE">充值入账 (+)</option>
              <option value="CARD_DEDUCT">交易扣减 (-)</option>
              <option value="CARD_LOCK">交易冻结 (🔒)</option>
              <option value="UNFREEZE_RETURN">售后解冻返还 (+)</option>
              <option value="MANUAL_CREDIT">人工调增 (+)</option>
              <option value="DISPUTE_PENALTY">争议赔付扣减 (-)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-1.5 bg-slate-50 px-2.5 py-2 rounded-lg border border-slate-200/80 shadow-2xs">
              <span className="material-symbols-outlined text-slate-400 text-[16px]">calendar_today</span>
              <input
                className="w-full bg-transparent font-numeric-table text-xs text-slate-800 focus:outline-none"
                type="text"
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
              />
            </div>
            <button
              onClick={handleSearch}
              className="h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-all cursor-pointer flex items-center justify-center"
              title="精确检索"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
            </button>
            <button
              onClick={handleResetFilters}
              className="h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200/80 shadow-2xs transition-all cursor-pointer flex items-center justify-center"
              title="重置检索条件"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. 高密度底层账本明细表格 (Ground-Truth 事实) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Table Header Bar */}
        <div className="px-4 py-3 bg-slate-50/80 flex flex-wrap items-center justify-between border-b border-slate-200/80 gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[18px]">data_table</span>
            <span className="font-headline-sm text-sm font-bold text-slate-900">
              底层事实账本数据流 (Acid Transactions Feed)
            </span>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-code-token text-[11px] font-semibold">
              实时延迟 &lt; 8ms
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-code-token text-xs text-slate-500">
              共匹配 18,420 条事实记录 · 当前显示 {filteredList.length} 笔样本
            </span>
            <div className="flex items-center gap-1 text-slate-400 font-label-caps text-[11px] uppercase font-semibold">
              <span>单击任意行联动更新穿透看板</span>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1340px]">
            <thead>
              <tr className="bg-slate-50/90 text-slate-500 font-label-caps text-[11px] uppercase h-9 select-none border-b border-slate-200/80">
                <th className="py-2 px-4 font-semibold">流水号 TXID</th>
                <th className="py-2 px-3 font-semibold">发生时间 (精准至毫秒)</th>
                <th className="py-2 px-3 font-semibold">变动类型</th>
                <th className="py-2 px-3 font-semibold">关联业务单据 (双向穿透)</th>
                <th className="py-2 px-3 font-semibold">商户主体 / MID</th>
                <th className="py-2 px-3 text-right font-semibold">变动积点 (PTS)</th>
                <th className="py-2 px-3 text-center font-semibold">可用余额变动 (前 ➔ 后)</th>
                <th className="py-2 px-3 text-center font-semibold">冻结金额变动 (前 ➔ 后)</th>
                <th className="py-2 px-3 font-semibold">操作来源 / 引擎</th>
                <th className="py-2 px-4 text-right font-semibold">穿透证据链</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 text-xs font-body-sm">
              {filteredList.map(item => {
                const isSelected = selectedTx?.id === item.id;
                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedTx(item)}
                    className={`transition-colors cursor-pointer group select-none ${
                      isSelected
                        ? 'bg-blue-50/50 ring-1 ring-inset ring-blue-500/20'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* TXID */}
                    <td className="py-2.5 px-4 font-code-token font-semibold text-slate-900 group-hover:text-blue-600">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.type === 'CARD_DEDUCT' || item.type === 'DISPUTE_PENALTY'
                            ? 'bg-rose-500'
                            : item.type === 'RECHARGE' || item.type === 'UNFREEZE_RETURN' || item.type === 'MANUAL_CREDIT'
                            ? 'bg-emerald-500'
                            : 'bg-indigo-500'
                        }`}></span>
                        <span>{item.txid}</span>
                      </div>
                    </td>

                    {/* Time */}
                    <td className="py-2.5 px-3 font-numeric-table text-slate-600">
                      {item.time.split('.')[0]}.<span className="text-blue-600 font-bold">{item.ms}</span>
                    </td>

                    {/* Type */}
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-code-token text-[11px] font-semibold border ${
                        item.type === 'CARD_DEDUCT'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : item.type === 'RECHARGE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.type === 'CARD_LOCK'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : item.type === 'UNFREEZE_RETURN'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.type === 'MANUAL_CREDIT'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        <span className="material-symbols-outlined text-[12px]">
                          {item.type === 'CARD_DEDUCT' ? 'remove' :
                           item.type === 'RECHARGE' ? 'add' :
                           item.type === 'CARD_LOCK' ? 'lock' :
                           item.type === 'UNFREEZE_RETURN' ? 'lock_open' :
                           item.type === 'MANUAL_CREDIT' ? 'tune' : 'gavel'}
                        </span>
                        {item.typeName}
                      </span>
                    </td>

                    {/* Biz Order Chip */}
                    <td className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTx(item);
                          setIsBizDrawerOpen(true);
                        }}
                        className={`inline-flex items-center gap-1 font-code-token text-xs px-2 py-0.5 rounded-md transition-all cursor-pointer font-semibold border ${
                          item.bizId.startsWith('KD')
                            ? 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100'
                            : item.bizId.startsWith('TOP')
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                            : item.bizId.startsWith('ARB')
                            ? 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100'
                            : 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100'
                        }`}
                        title="点击展开业务单穿透详情"
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {item.bizId.startsWith('KD') ? 'assignment' :
                           item.bizId.startsWith('TOP') ? 'payments' :
                           item.bizId.startsWith('ARB') ? 'shield_with_heart' : 'contract_edit'}
                        </span>
                        <span>{item.bizId}</span>
                      </button>
                    </td>

                    {/* Merchant / MID */}
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col">
                        <span className="text-slate-900 font-medium">
                          {item.merchantShort}
                        </span>
                        <span className="font-code-token text-[11px] text-slate-400">
                          {item.merchantMid}
                        </span>
                      </div>
                    </td>

                    {/* Points Change */}
                    <td className={`py-2.5 px-3 text-right font-numeric-stat font-bold ${
                      item.isEscrow
                        ? 'text-indigo-600'
                        : item.pointsChange > 0
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    }`}>
                      {item.isEscrow
                        ? `[ ${Math.abs(item.pointsChange).toLocaleString('en-US', { minimumFractionDigits: 2 })} ]`
                        : item.pointsChange > 0
                        ? `+${item.pointsChange.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                        : `${item.pointsChange.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    </td>

                    {/* Available balance before -> after */}
                    <td className="py-2.5 px-3 text-center font-numeric-table text-slate-700">
                      <span className="text-slate-400">{item.availableBefore.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      <span className="text-blue-600 mx-1.5">➔</span>
                      <span className={`font-semibold ${item.pointsChange > 0 ? 'text-emerald-700' : 'text-slate-900'}`}>
                        {item.availableAfter.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Frozen balance before -> after */}
                    <td className="py-2.5 px-3 text-center font-numeric-table text-slate-700">
                      <span className="text-slate-400">{item.frozenBefore.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      <span className={`${item.isEscrow ? 'text-indigo-600' : 'text-slate-400'} mx-1.5`}>➔</span>
                      <span className={`font-semibold ${item.frozenAfter > 0 ? 'text-indigo-700' : 'text-slate-500'}`}>
                        {item.frozenAfter.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Source */}
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 font-code-token text-[11px] bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded text-slate-700">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.source === '官方API核销' ? 'bg-blue-600' :
                          item.source === '系统撮合引擎' ? 'bg-emerald-600' : 'bg-blue-600'
                        }`}></span>
                        <span>{item.source}</span>
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTx(item);
                          setIsRawModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2.5 py-1 rounded-lg font-headline-sm transition-all cursor-pointer font-semibold"
                        title="调阅证据链与哈希存证"
                      >
                        <span>穿透证据</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 表格底部微型分页与统计 */}
        <div className="px-4 py-3 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-body-sm">
            <span>显示第 1 到 {filteredList.length} 条，共 18,420 条底层事实记录</span>
            <span className="text-slate-300">|</span>
            <span>
              哈希指纹校验：
              <span className="font-code-token text-emerald-700 font-semibold ml-1">
                CHAIN-STATE-SYNCHRONIZED (OK)
              </span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled
              className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-400 text-xs opacity-50 cursor-not-allowed border border-slate-200/80"
              type="button"
            >
              上一页
            </button>
            <button
              className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-code-token text-xs shadow-xs font-semibold"
              type="button"
            >
              1
            </button>
            <button
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-code-token text-xs border border-slate-200/80 cursor-pointer"
              type="button"
            >
              2
            </button>
            <button
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-code-token text-xs border border-slate-200/80 cursor-pointer"
              type="button"
            >
              3
            </button>
            <span className="text-slate-400 px-1 text-xs font-code-token">...</span>
            <button
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-code-token text-xs border border-slate-200/80 cursor-pointer"
              type="button"
            >
              3070
            </button>
            <button
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs border border-slate-200/80 cursor-pointer"
              type="button"
            >
              下一页
            </button>
          </div>
        </div>
      </div>

      {/* 5. 底部挂载【PRD 5.3 双向穿透与证据链看板】 */}
      <ForensicTracePanel
        transaction={selectedTx}
        onOpenRawModal={() => setIsRawModalOpen(true)}
        onOpenBizDrawer={() => setIsBizDrawerOpen(true)}
      />

      {/* Modals & Drawers */}
      <RawPayloadModal
        transaction={selectedTx}
        isOpen={isRawModalOpen}
        onClose={() => setIsRawModalOpen(false)}
      />

      <HashVerifyModal
        isOpen={isHashModalOpen}
        onClose={() => setIsHashModalOpen(false)}
      />

      <ExportSnapshotModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        totalCount={18420}
      />

      <BizDetailDrawer
        transaction={selectedTx}
        isOpen={isBizDrawerOpen}
        onClose={() => setIsBizDrawerOpen(false)}
        onNavigate={onNavigate}
      />
    </div>
  );
};
