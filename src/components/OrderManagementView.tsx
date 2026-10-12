import React, { useState, useMemo } from 'react';
import { NavPath } from '../types';
import { OrderItem, INITIAL_ORDERS, TransactionStatusCode, RiskStatusCode, AfterSaleStatusCode } from '../data/mockOrders';
import { OrderDetailView } from './OrderDetailView';

interface OrderManagementViewProps {
  onNavigate?: (path: NavPath) => void;
}

export const OrderManagementView: React.FC<OrderManagementViewProps> = ({ onNavigate }) => {
  // Master orders state
  const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);

  // Navigation: list or detail view
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('ORD-20260827-9912');

  // ============================================================================
  // 15.1 查询必须支持字段：
  // 订单号、卡单号、用户、商户、国家、卡种、面额、交易状态、风险状态、售后状态、时间
  // ============================================================================
  const [filterOrderId, setFilterOrderId] = useState('');
  const [filterCardOrderId, setFilterCardOrderId] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterMerchant, setFilterMerchant] = useState('');
  const [filterCountry, setFilterCountry] = useState('ALL');
  const [filterBrand, setFilterBrand] = useState('ALL');
  const [filterFaceValue, setFilterFaceValue] = useState('ALL');
  const [filterTxnStatus, setFilterTxnStatus] = useState<string>('ALL');
  const [filterRiskStatus, setFilterRiskStatus] = useState<string>('ALL');
  const [filterAfterSaleStatus, setFilterAfterSaleStatus] = useState<string>('ALL');
  const [filterTimeRange, setFilterTimeRange] = useState<string>('TODAY');

  // Quick Tab Filter (快捷视图) - PRD 规定: 全部 / 进行中 / 已完成 / 异常 / 已关闭
  const [quickTab, setQuickTab] = useState<'ALL' | 'IN_FLIGHT' | 'COMPLETED' | 'ANOMALY' | 'CLOSED'>('ALL');

  // Table selection & pagination
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Quick Inspection Modal
  const [inspectOrder, setInspectOrder] = useState<OrderItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const handleUpdateOrder = (updated: OrderItem) => {
    setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
  };

  const selectedOrder = useMemo(() => {
    return orders.find(o => o.orderId === selectedOrderId) || orders[0];
  }, [orders, selectedOrderId]);

  // Reset all filters
  const handleResetFilters = () => {
    setFilterOrderId('');
    setFilterCardOrderId('');
    setFilterUser('');
    setFilterMerchant('');
    setFilterCountry('ALL');
    setFilterBrand('ALL');
    setFilterFaceValue('ALL');
    setFilterTxnStatus('ALL');
    setFilterRiskStatus('ALL');
    setFilterAfterSaleStatus('ALL');
    setFilterTimeRange('TODAY');
    setQuickTab('ALL');
    setCurrentPage(1);
    showToast('已重置所有查询过滤条件');
  };

  // 15.1 多维联合过滤引擎
  const filteredList = useMemo(() => {
    return orders.filter(item => {
      // 1. 快捷 Tab (PRD 标准)
      if (quickTab === 'IN_FLIGHT' && !['precheck', 'pending', 'waiting_merchant', 'merchant_processing'].includes(item.txnStatus)) return false;
      if (quickTab === 'COMPLETED' && item.txnStatus !== 'completed') return false;
      if (quickTab === 'ANOMALY' && !['precheck_anomaly', 'merchant_rejected', 'merchant_failed'].includes(item.txnStatus)) return false;
      if (quickTab === 'CLOSED' && item.txnStatus !== 'disputing') return false;

      // 2. 订单号
      if (filterOrderId.trim() && !item.orderId.toLowerCase().includes(filterOrderId.trim().toLowerCase())) return false;

      // 3. 卡单号
      if (filterCardOrderId.trim()) {
        const target = (item.cardOrderId || '').toLowerCase();
        if (!target.includes(filterCardOrderId.trim().toLowerCase())) return false;
      }

      // 4. 用户 (UID / 手机 / 姓名)
      if (filterUser.trim()) {
        const q = filterUser.trim().toLowerCase();
        const matchUid = item.userUid.toLowerCase().includes(q);
        const matchName = (item.userName || '').toLowerCase().includes(q);
        const matchPhone = item.userPhone.includes(q);
        if (!matchUid && !matchName && !matchPhone) return false;
      }

      // 5. 商户 (MID / 商户名)
      if (filterMerchant.trim()) {
        const q = filterMerchant.trim().toLowerCase();
        const matchMid = item.merchantMid.toLowerCase().includes(q);
        const matchName = item.merchantName.toLowerCase().includes(q);
        if (!matchMid && !matchName) return false;
      }

      // 6. 国家
      if (filterCountry !== 'ALL' && item.country !== filterCountry) return false;

      // 7. 卡种
      if (filterBrand !== 'ALL' && item.brandCode !== filterBrand) return false;

      // 8. 面额
      if (filterFaceValue !== 'ALL') {
        if (filterFaceValue === '50' && item.faceValue !== 50) return false;
        if (filterFaceValue === '100' && item.faceValue !== 100) return false;
        if (filterFaceValue === '200' && item.faceValue !== 200) return false;
        if (filterFaceValue === '250' && item.faceValue !== 250) return false;
        if (filterFaceValue === '500' && item.faceValue !== 500) return false;
        if (filterFaceValue === 'HIGH' && item.faceValue < 500) return false;
      }

      // 9. 交易状态
      if (filterTxnStatus !== 'ALL' && item.txnStatus !== filterTxnStatus) return false;

      // 10. 风险状态
      if (filterRiskStatus !== 'ALL' && item.riskStatus !== filterRiskStatus) return false;

      // 11. 售后状态
      if (filterAfterSaleStatus !== 'ALL' && item.afterSaleStatus !== filterAfterSaleStatus) return false;

      // 12. 时间 (模拟时段匹配)
      if (filterTimeRange === 'YESTERDAY' && !item.time.startsWith('14')) return false;

      return true;
    });
  }, [
    orders,
    quickTab,
    filterOrderId,
    filterCardOrderId,
    filterUser,
    filterMerchant,
    filterCountry,
    filterBrand,
    filterFaceValue,
    filterTxnStatus,
    filterRiskStatus,
    filterAfterSaleStatus,
    filterTimeRange
  ]);

  // 分页计算
  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage, pageSize]);

  // 选择行
  const handleToggleSelectAll = (checked: boolean) => {
    setSelectedRowIds(checked ? filteredList.map(o => o.id) : []);
  };

  const handleToggleRow = (id: string) => {
    setSelectedRowIds(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]));
  };

  const handleOpenDetail = (orderId: string) => {
    setSelectedOrderId(orderId);
    setViewMode('detail');
  };

  // KPI 大盘指标摘要
  const metrics = useMemo(() => {
    const total = orders.length;
    const completed = orders.filter(o => o.txnStatus === 'completed').length;
    const inFlight = orders.filter(o => ['precheck', 'pending', 'waiting_merchant', 'merchant_processing'].includes(o.txnStatus)).length;
    const anomaly = orders.filter(o => ['precheck_anomaly', 'merchant_rejected', 'merchant_failed'].includes(o.txnStatus)).length;
    const disputing = orders.filter(o => o.txnStatus === 'disputing' || o.afterSaleStatus !== 'none').length;
    const totalGmv = orders.reduce((sum, o) => sum + o.faceValue, 0);

    return { total, completed, inFlight, anomaly, disputing, totalGmv };
  }, [orders]);

  if (viewMode === 'detail' && selectedOrder) {
    return (
      <OrderDetailView
        order={selectedOrder}
        onBack={() => setViewMode('list')}
        onUpdateOrder={handleUpdateOrder}
        showToast={showToast}
      />
    );
  }

  return (
    <div className="flex flex-col w-full text-slate-800 antialiased text-xs space-y-4">
      {/* Toast 反馈 */}
      {toastMsg && (
        <div className="fixed top-16 right-8 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 border border-slate-700 animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">info</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 头部定位与事实中心概览 */}
      <section className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
            </span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">卡单管理</h1>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-200">
              全平台交易事实中心
            </span>
            <span className="text-slate-400 font-mono text-xs">
              十四~十六规范覆盖
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            全生命周期事实存证录入、多维卡单查询、十六步交易状态机流转与审计日志归档。
          </p>
        </div>

        {/* 顶部指标卡横栏 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-right">
          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
            <span className="text-[10px] text-slate-400 block font-medium">累计成交 GMV</span>
            <span className="font-mono font-bold text-slate-900 text-sm">${metrics.totalGmv.toFixed(2)}</span>
          </div>
          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
            <span className="text-[10px] text-slate-400 block font-medium">履约成功率</span>
            <span className="font-mono font-bold text-emerald-700 text-sm">
              {((metrics.completed / (metrics.total || 1)) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
            <span className="text-[10px] text-slate-400 block font-medium">在途处理中</span>
            <span className="font-mono font-bold text-blue-700 text-sm">{metrics.inFlight} 笔</span>
          </div>
          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
            <span className="text-[10px] text-slate-400 block font-medium">异常与争议</span>
            <span className="font-mono font-bold text-rose-700 text-sm">{metrics.anomaly + metrics.disputing} 笔</span>
          </div>
        </div>
      </section>

      {/* 快捷视图切换选项卡 */}
      <div className="bg-white rounded-xl p-1.5 border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {[
            { id: 'ALL', label: '全部', count: metrics.total },
            { id: 'IN_FLIGHT', label: '进行中', count: metrics.inFlight },
            { id: 'COMPLETED', label: '已完成', count: metrics.completed },
            { id: 'ANOMALY', label: '异常', count: metrics.anomaly },
            { id: 'CLOSED', label: '已关闭', count: metrics.disputing }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setQuickTab(tab.id as any);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                quickTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] ${
                quickTab === tab.id ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs font-mono">
            检索命中: <strong className="text-slate-900">{filteredList.length}</strong> / {orders.length} 笔
          </span>
          <button
            onClick={handleResetFilters}
            className="px-2.5 py-1 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded text-xs font-medium transition-colors cursor-pointer"
          >
            重置筛选
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 15.1 查询核心面板 (严格支持 11 项指定查询维度) */}
      {/* ==================================================================== */}
      <section className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[18px]">search</span>
            <span className="font-bold text-slate-900 text-xs">联合查询控制台（支持指定 11 大核心维度）</span>
          </div>
          <span className="text-[11px] text-slate-400">实时联动 · 输入即筛选</span>
        </div>

        {/* 11 项查询输入网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          {/* 1. 订单号 */}
          <div>
            <label className="block text-slate-500 text-[11px] mb-1 font-medium">1. 订单号 (Order ID)</label>
            <input
              type="text"
              value={filterOrderId}
              onChange={e => {
                setFilterOrderId(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="例: ORD-2026..."
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs outline-none focus:border-blue-500 bg-slate-50/50"
            />
          </div>

          {/* 2. 卡单号 */}
          <div>
            <label className="block text-slate-500 text-[11px] mb-1 font-medium">2. 卡单号 (Card Order ID)</label>
            <input
              type="text"
              value={filterCardOrderId}
              onChange={e => {
                setFilterCardOrderId(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="例: KD-2026..."
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs outline-none focus:border-blue-500 bg-slate-50/50"
            />
          </div>

          {/* 3. 用户 */}
          <div>
            <label className="block text-slate-500 text-[11px] mb-1 font-medium">3. 用户 (UID / 手机 / 姓名)</label>
            <input
              type="text"
              value={filterUser}
              onChange={e => {
                setFilterUser(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="UID / 手机号 / 姓名"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-500 bg-slate-50/50"
            />
          </div>

          {/* 4. 商户 */}
          <div>
            <label className="block text-slate-500 text-[11px] mb-1 font-medium">4. 商户 (MID / 名称)</label>
            <input
              type="text"
              value={filterMerchant}
              onChange={e => {
                setFilterMerchant(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="MID / 商户名称"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-500 bg-slate-50/50"
            />
          </div>

          {/* 5. 国家 */}
          <div>
            <label className="block text-slate-500 text-[11px] mb-1 font-medium">5. 国家 (Country)</label>
            <select
              value={filterCountry}
              onChange={e => {
                setFilterCountry(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-500 bg-white"
            >
              <option value="ALL">全部国家/地区</option>
              <option value="US">🇺🇸 美国 (US)</option>
              <option value="GB">🇬🇧 英国 (GB)</option>
              <option value="DE">🇩🇪 德国 (DE)</option>
              <option value="AR">🇦🇷 阿根廷 (AR)</option>
            </select>
          </div>

          {/* 6. 卡种 */}
          <div>
            <label className="block text-slate-500 text-[11px] mb-1 font-medium">6. 卡种 (Card Type)</label>
            <select
              value={filterBrand}
              onChange={e => {
                setFilterBrand(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-500 bg-white"
            >
              <option value="ALL">全部卡种</option>
              <option value="APPLE">Apple Store 充值卡</option>
              <option value="STEAM">Steam 钱包卡</option>
              <option value="GOOGLE">Google Play 礼品卡</option>
              <option value="AMAZON">Amazon 礼品券</option>
              <option value="RAZER">Razer Gold 雷蛇卡</option>
            </select>
          </div>

          {/* 7. 面额 */}
          <div>
            <label className="block text-slate-500 text-[11px] mb-1 font-medium">7. 面额 (Face Value)</label>
            <select
              value={filterFaceValue}
              onChange={e => {
                setFilterFaceValue(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-500 bg-white"
            >
              <option value="ALL">全部面额</option>
              <option value="50">50 面额</option>
              <option value="100">100 面额</option>
              <option value="200">200 面额</option>
              <option value="250">250 面额</option>
              <option value="500">500 面额</option>
              <option value="HIGH">大额卡 (&gt;=$500)</option>
            </select>
          </div>

          {/* 8. 交易状态 (状态机对应) */}
          <div>
            <label className="block text-slate-500 text-[11px] mb-1 font-medium">8. 交易状态 (状态机)</label>
            <select
              value={filterTxnStatus}
              onChange={e => {
                setFilterTxnStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-500 bg-white font-medium text-slate-800"
            >
              <option value="ALL">全部交易状态</option>
              <optgroup label="主链路">
                <option value="created">已创建 (created)</option>
                <option value="precheck">预检中 (precheck)</option>
                <option value="pending">待处理 (pending)</option>
                <option value="waiting_merchant">待商户接单</option>
                <option value="merchant_processing">商户处理中</option>
                <option value="completed">已完成 (completed)</option>
              </optgroup>
              <optgroup label="分支状态">
                <option value="precheck_anomaly">预检异常 (待人工确认)</option>
                <option value="merchant_rejected">商户拒单 (待转单)</option>
                <option value="merchant_failed">商户失败 (异常处理中)</option>
                <option value="disputing">用户争议 (售后中)</option>
              </optgroup>
            </select>
          </div>

          {/* 9. 风险状态 */}
          <div>
            <label className="block text-slate-500 text-[11px] mb-1 font-medium">9. 风险状态 (Risk)</label>
            <select
              value={filterRiskStatus}
              onChange={e => {
                setFilterRiskStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-500 bg-white"
            >
              <option value="ALL">全部风险状态</option>
              <option value="normal">正常 (无风险)</option>
              <option value="low">低风险 (常规放行)</option>
              <option value="medium">中风险 (预警关注)</option>
              <option value="high">高风险拦截 (硬拦截)</option>
              <option value="pending_review">待人工确认 (OCR字残等)</option>
            </select>
          </div>

          {/* 10. 售后状态 */}
          <div>
            <label className="block text-slate-500 text-[11px] mb-1 font-medium">10. 售后状态 (After-Sale)</label>
            <select
              value={filterAfterSaleStatus}
              onChange={e => {
                setFilterAfterSaleStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-500 bg-white"
            >
              <option value="ALL">全部售后状态</option>
              <option value="none">无售后</option>
              <option value="disputing">争议中 (举证质证)</option>
              <option value="case_filed">已立案</option>
              <option value="under_review">责任认定中</option>
              <option value="compensated">已先行垫付/赔付</option>
              <option value="rejected">已驳回</option>
            </select>
          </div>

          {/* 11. 时间 */}
          <div className="sm:col-span-2">
            <label className="block text-slate-500 text-[11px] mb-1 font-medium">11. 时间维度 (Time Range)</label>
            <div className="flex items-center gap-1">
              {[
                { id: 'TODAY', label: '今日' },
                { id: 'YESTERDAY', label: '昨日' },
                { id: '7DAYS', label: '近7日' },
                { id: '30DAYS', label: '近30日' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFilterTimeRange(t.id)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                    filterTimeRange === t.id
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 数据列表区域 */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* 表格操作控制栏 */}
        <div className="p-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedRowIds.length > 0 && selectedRowIds.length === filteredList.length}
              onChange={e => handleToggleSelectAll(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-slate-500">已选中 {selectedRowIds.length} 项</span>
            {selectedRowIds.length > 0 && (
              <button
                onClick={() => {
                  showToast(`已批量对 ${selectedRowIds.length} 笔卡单发起状态健康巡检`);
                  setSelectedRowIds([]);
                }}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded font-medium cursor-pointer"
              >
                批量健康巡检
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
            <span>显示第 1 ~ {paginatedList.length} 项 / 共 {filteredList.length} 项</span>
          </div>
        </div>

        {/* 响应式数据表格 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-600 font-semibold text-[11px]">
                <th className="py-2.5 px-3 w-10"></th>
                <th className="py-2.5 px-3">订单号 / 卡单号</th>
                <th className="py-2.5 px-3">出卡用户</th>
                <th className="py-2.5 px-3">卡种 / 国家 / 面额</th>
                <th className="py-2.5 px-3">Card Check</th>
                <th className="py-2.5 px-3">报价与利润</th>
                <th className="py-2.5 px-3">商户履约</th>
                <th className="py-2.5 px-3">交易状态 (状态机)</th>
                <th className="py-2.5 px-3">风控状态</th>
                <th className="py-2.5 px-3">售后状态</th>
                <th className="py-2.5 px-3">提交时间</th>
                <th className="py-2.5 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedList.map(item => {
                const isSelected = selectedRowIds.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-blue-50/30 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}
                  >
                    {/* 勾选框 */}
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleRow(item.id)}
                        className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    {/* 订单号 / 卡单号 */}
                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        <button
                          onClick={() => handleOpenDetail(item.orderId)}
                          className="font-mono font-bold text-blue-600 hover:underline text-xs block cursor-pointer"
                        >
                          {item.orderId}
                        </button>
                        <span className="font-mono text-[10px] text-indigo-700 bg-indigo-50 px-1 rounded block w-fit border border-indigo-100">
                          {item.cardOrderId || 'KD-20261005-001'}
                        </span>
                      </div>
                    </td>

                    {/* 用户 */}
                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-slate-900">{item.userName || '用户'}</span>
                          <span className="font-mono text-[9px] px-1 rounded bg-slate-100 text-slate-700 font-bold">
                            {item.userVip || 'V1'}
                          </span>
                        </div>
                        <div className="font-mono text-[10px] text-slate-400">{item.userUid}</div>
                      </div>
                    </td>

                    {/* 卡种 / 国家 / 面额 */}
                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 font-semibold text-slate-900">
                          <span>{item.countryFlag || '🌍'}</span>
                          <span className="truncate max-w-[120px]">{item.brand}</span>
                        </div>
                        <div className="font-mono font-bold text-slate-900 text-xs">
                          {item.currency === 'USD' ? '$' : item.currency === 'EUR' ? '€' : item.currency === 'GBP' ? '£' : ''}
                          {item.faceValue.toFixed(2)} {item.currency}
                        </div>
                      </div>
                    </td>

                    {/* Card Check */}
                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        <span className={`inline-block font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          item.cardCheckDetails?.status === '有效足额' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                          item.cardCheckDetails?.status === '部分余额' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                          'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {item.cardCheckDetails?.status || '有效足额'}
                        </span>
                        <div className="font-mono text-[10px] text-slate-400">
                          {item.cardCheckDetails?.source || '官方直连'}
                        </div>
                      </div>
                    </td>

                    {/* 报价与利润 */}
                    <td className="py-3 px-3 font-mono">
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between text-[11px] gap-2">
                          <span className="text-slate-400">买入/卖出:</span>
                          <span className="text-slate-700">{item.userRate}% / {item.merchantRate}%</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] gap-2">
                          <span className="text-slate-400">平台净利:</span>
                          <span className={`font-bold ${item.marginAmount >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            ${item.marginAmount.toFixed(2)} ({item.marginPercent}%)
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 商户履约 */}
                    <td className="py-3 px-3">
                      <div className="space-y-0.5 max-w-[120px]">
                        <span className="font-medium text-slate-800 truncate block">{item.merchantName}</span>
                        <span className="font-mono text-[10px] text-slate-400 block">{item.merchantMid}</span>
                      </div>
                    </td>

                    {/* 交易状态 (状态机) */}
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-full font-bold border ${
                        item.txnStatus === 'completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                        item.txnStatus === 'merchant_processing' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                        item.txnStatus === 'disputing' ? 'bg-purple-50 text-purple-800 border-purple-300' :
                        item.txnStatus === 'precheck_anomaly' || item.txnStatus === 'merchant_rejected' || item.txnStatus === 'merchant_failed'
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : 'bg-slate-100 text-slate-800 border-slate-300'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {item.txnStatusLabel || item.txnStatus}
                      </span>
                    </td>

                    {/* 风控状态 */}
                    <td className="py-3 px-3">
                      <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        item.riskStatus === 'normal' || item.riskStatus === 'low'
                          ? 'bg-emerald-50 text-emerald-700'
                          : item.riskStatus === 'medium'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {item.riskStatusLabel || item.riskStatus}
                      </span>
                    </td>

                    {/* 售后状态 */}
                    <td className="py-3 px-3">
                      <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        item.afterSaleStatus === 'none'
                          ? 'text-slate-400'
                          : item.afterSaleStatus === 'disputing'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {item.afterSaleStatusLabel || '无售后'}
                      </span>
                    </td>

                    {/* 提交时间 */}
                    <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                      {item.time}
                    </td>

                    {/* 操作 */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenDetail(item.orderId)}
                          className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          详情
                        </button>
                        <button
                          onClick={() => setInspectOrder(item)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                          title="快速检视"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedList.length === 0 && (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <span className="material-symbols-outlined text-[32px] text-slate-300">search_off</span>
                      <span>未查询到匹配的卡单数据，请尝试放宽查询过滤条件</span>
                      <button
                        onClick={handleResetFilters}
                        className="text-blue-600 hover:underline font-medium text-xs cursor-pointer"
                      >
                        重置所有筛选
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 分页导航 */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-slate-500">每页显示:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-slate-200 rounded text-xs outline-none bg-slate-50"
            >
              <option value="5">5 条/页</option>
              <option value="10">10 条/页</option>
              <option value="20">20 条/页</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-500">第 {currentPage} / {totalPages} 页</span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-2.5 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                上一页
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 快捷抽屉检视模态框 */}
      {inspectOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-end animate-fade-in">
          <div className="w-full max-w-md h-full bg-white shadow-2xl p-5 overflow-y-auto space-y-4 border-l border-slate-200 animate-in slide-in-from-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">receipt_long</span>
                <span className="font-bold text-slate-900 text-sm">卡单快速快照检视</span>
              </div>
              <button
                onClick={() => setInspectOrder(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">订单号:</span>
                <span className="font-bold text-slate-900">{inspectOrder.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">卡单号:</span>
                <span className="font-bold text-indigo-700">{inspectOrder.cardOrderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">卡种面额:</span>
                <span className="font-bold text-slate-900">{inspectOrder.brand} (${inspectOrder.faceValue})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">交易状态:</span>
                <span className="font-bold text-blue-700">{inspectOrder.txnStatusLabel}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-900 block">最近状态变更事件:</span>
              <div className="space-y-1.5">
                {(inspectOrder.stateEventLogs || []).slice(0, 3).map((log, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-200/60 text-[11px] space-y-0.5">
                    <div className="flex justify-between font-mono text-slate-400">
                      <span>{log.time}</span>
                      <span>{log.operator}</span>
                    </div>
                    <div className="font-semibold text-slate-800">
                      {log.fromState} ➔ {log.toState}
                    </div>
                    <div className="text-slate-500 text-[10px]">{log.reason}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  const id = inspectOrder.orderId;
                  setInspectOrder(null);
                  handleOpenDetail(id);
                }}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-center cursor-pointer shadow-xs"
              >
                进入完整卡单详情 (8大固定分区)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
