import React, { useState, useEffect } from 'react';
import { NavPath } from '../types';
import {
  INITIAL_DISPATCH_TASKS,
  DispatchTaskItem
} from '../data/mockOperations';
import { OperationDetailModal } from './OperationDetailModal';
import { OperationOcrModal } from './OperationOcrModal';
import { OperationCircuitBreakerModal } from './OperationCircuitBreakerModal';

interface TransactionOperationsViewProps {
  onNavigate?: (path: NavPath) => void;
}

export const TransactionOperationsView: React.FC<TransactionOperationsViewProps> = ({ onNavigate }) => {
  // Tasks state
  const [tasks, setTasks] = useState<DispatchTaskItem[]>(INITIAL_DISPATCH_TASKS);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // Filters
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('all');
  const [selectedAnomalyFilter, setSelectedAnomalyFilter] = useState<string>('all');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState<boolean>(false);

  // Modals state
  const [drawerTask, setDrawerTask] = useState<DispatchTaskItem | null>(null);
  const [ocrModalTask, setOcrModalTask] = useState<DispatchTaskItem | null>(null);
  const [isCircuitBreakerOpen, setIsCircuitBreakerOpen] = useState<boolean>(false);

  // Live heartbeats
  const [syncTimer, setSyncTimer] = useState<string>('1.4s');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Heartbeat pulse simulation
  useEffect(() => {
    const timer = setInterval(() => {
      const ms = (0.8 + Math.random() * 0.9).toFixed(1);
      setSyncTimer(`${ms}s`);
    }, 3000);
    return () => clearInterval(timer);
  }, []);


  // Multi-select handlers
  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTaskIds(tasks.map(t => t.id));
    } else {
      setSelectedTaskIds([]);
    }
  };

  const handleToggleSelectRow = (id: string) => {
    if (selectedTaskIds.includes(id)) {
      setSelectedTaskIds(selectedTaskIds.filter(i => i !== id));
    } else {
      setSelectedTaskIds([...selectedTaskIds, id]);
    }
  };

  const handleDeselectAll = () => {
    setSelectedTaskIds([]);
  };

  // Refresh pool
  const handleRefreshTaskPool = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('已重新计算全网实时撮合队列，任务状态已刷新！');
    }, 600);
  };

  // Batch Broadcast
  const handleBatchBroadcast = () => {
    showToast('已触发一键广播放派单：正在对 14 笔流单以基准溢价 +0.2% 重新向在线合格商户广播！');
  };

  // Batch Actions
  const handleBatchAction = (type: 'rate_broadcast' | 'reassign_merchant' | 'force_terminate') => {
    const count = selectedTaskIds.length;
    if (count === 0) {
      showToast('请先勾选需要批量操作的卡单！');
      return;
    }
    if (type === 'rate_broadcast') {
      showToast(`批量改价广播成功：已对选中的 ${count} 笔卡单执行费率上浮 0.5% 并重新向全网广播！`);
    } else if (type === 'reassign_merchant') {
      showToast(`批量转单成功：已将 ${count} 笔卡单从原商户强行拔出，转入自营大户专席！`);
    } else if (type === 'force_terminate') {
      showToast(`已批量终止 ${count} 笔在途交易，资金与卡券原路退回出卡方，商户计入违约率考核！`);
      setTasks(prev => prev.filter(t => !selectedTaskIds.includes(t.id)));
    }
    setSelectedTaskIds([]);
  };

  // Single intervention
  const handleIntervention = (actionName: string, taskId: string) => {
    showToast(`[指令已下达] 正在执行: 【${actionName}】\n卡单: ORD-20260827-${taskId}\n操作员: #OP-8821 已存证留痕！`);
    if (drawerTask) setDrawerTask(null);
  };


  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    // Tab filter
    if (activeTab === 'pending_take' && task.statusCategory !== 'pending_take') return false;
    if (activeTab === 'taking' && task.statusCategory !== 'taking') return false;
    if (activeTab === 'processing' && task.statusCategory !== 'processing') return false;
    if (activeTab === 'warning' && task.statusCategory !== 'warning') return false;
    if (activeTab === 'timeout' && task.statusCategory !== 'timeout') return false;
    if (activeTab === 'failed' && task.statusCategory !== 'failed') return false;
    if (activeTab === 'locked' && task.statusCategory !== 'locked') return false;
    if (activeTab === 'manual' && task.statusCategory !== 'manual') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNo = task.orderNo.toLowerCase().includes(q);
      const matchUser = task.userName.toLowerCase().includes(q) || task.userPhone.includes(q);
      const matchBrand = task.brandName.toLowerCase().includes(q);
      const matchMerchant = task.merchantName.toLowerCase().includes(q);
      const matchToken = task.secretToken.toLowerCase().includes(q);
      if (!matchNo && !matchUser && !matchBrand && !matchMerchant && !matchToken) return false;
    }

    // Brand filter
    if (selectedBrandFilter !== 'all') {
      if (!task.brandName.toLowerCase().includes(selectedBrandFilter.toLowerCase())) return false;
    }

    // Anomaly filter
    if (selectedAnomalyFilter !== 'all') {
      if (!task.anomalyType.includes(selectedAnomalyFilter) && !task.anomalyCategory.includes(selectedAnomalyFilter)) {
        return false;
      }
    }

    return true;
  });

  const isAllSelected = filteredTasks.length > 0 && filteredTasks.every(t => selectedTaskIds.includes(t.id));

  return (
    <div className="flex flex-col w-full gap-3.5 text-[#0b1c30] antialiased text-xs">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-16 right-8 z-50 bg-[#0b1c30] text-white text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 border border-slate-700 animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 头部业务导航与控制栏 */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white px-5 py-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              交易作业 · 实时调度控制塔
            </h1>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              TOWER-DISPATCH-v2.0
            </span>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/60">
              撮合路由 100% UP
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-4xl leading-relaxed">
            面向超时流标单、商户拒单及高危异常订单的强力二次调度、溢价撮合与熔断降级处置中心。
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-500">心跳流:</span>
            <span className="font-mono text-blue-600 font-semibold">{syncTimer}</span>
          </div>

          <button
            onClick={handleRefreshTaskPool}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            <span className={`material-symbols-outlined text-[16px] text-slate-500 ${isSyncing ? 'animate-spin' : ''}`}>
              autorenew
            </span>
            <span>刷新撮合池</span>
          </button>
          <button
            onClick={() => setIsCircuitBreakerOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg transition-colors border border-red-200 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            <span>通道熔断降级</span>
          </button>
          <button
            onClick={handleBatchBroadcast}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-[#004ac6] text-white hover:bg-blue-700 text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">podcasts</span>
            <span>一键自动广播放单</span>
          </button>
        </div>
      </header>

      {/* Tower Control 4-Card Cockpit Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* Card 1: In-Flight Realtime */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group hover:shadow transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                秒级在途单 / IN-FLIGHT
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-2xl text-slate-900 font-bold tracking-tight">48</span>
                <span className="font-mono text-[11px] text-emerald-700 font-semibold">活跃中 (RUNNING)</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[22px]">swap_horizontal_circle</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 bg-slate-50 -mx-4 -mb-4 px-4 pb-3 flex items-center justify-between border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-slate-600">
                API自动核销 <strong className="text-blue-600 font-semibold">32</strong>
              </span>
              <span className="text-slate-300 font-mono">/</span>
              <span className="font-mono text-[11px] text-slate-600">
                客服核对 <strong className="text-slate-800 font-semibold">16</strong>
              </span>
            </div>
            <span className="font-mono text-[10px] text-emerald-800 font-semibold bg-emerald-100 px-1.5 py-0.5 rounded">
              均耗时 34.2s
            </span>
          </div>
        </div>

        {/* Card 2: SLA Warning Critical */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group hover:shadow transition-shadow">
          <div className="absolute top-0 right-0 left-0 h-1 bg-amber-500"></div>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] text-amber-700 uppercase tracking-wider font-semibold block">
                超时临界池 / SLA WARNING &lt; 60s
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-2xl text-amber-600 font-bold tracking-tight animate-pulse">06</span>
                <span className="font-mono text-[11px] text-amber-700 font-semibold">高危急迫</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined text-[22px]">alarm</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 bg-amber-50/60 -mx-4 -mb-4 px-4 pb-3 flex items-center justify-between border-t border-amber-100">
            <span className="font-mono text-[11px] text-amber-900">
              最快超时仅剩 <strong>28s</strong> (ORD-9912)
            </span>
            <button
              onClick={() => {
                setActiveTab('warning');
                showToast('已筛选并定位超时临界急迫单据群！');
              }}
              className="text-[11px] text-amber-900 underline font-semibold cursor-pointer hover:text-amber-950"
            >
              立即抢单调度
            </button>
          </div>
        </div>

        {/* Card 3: Failed to Take Pool */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group hover:shadow transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                流单 / 拒单孤儿池 / FAILED TO TAKE
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-2xl text-indigo-600 font-bold tracking-tight">14</span>
                <span className="font-mono text-[11px] text-indigo-700 font-semibold">需转派广播</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <span className="material-symbols-outlined text-[22px]">person_off</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 bg-slate-50 -mx-4 -mb-4 px-4 pb-3 flex items-center justify-between border-t border-slate-100">
            <span className="font-mono text-[11px] text-slate-600">商户无应答 9 笔 · 额度超限拒单 5 笔</span>
            <span
              onClick={() => {
                setActiveTab('pending_take');
                showToast('已定位流单孤儿池，正准备调价重推！');
              }}
              className="font-mono text-[11px] text-blue-600 font-semibold cursor-pointer hover:underline"
            >
              调价重推(14)
            </span>
          </div>
        </div>

        {/* Card 4: Blocked & Risk Holds */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group hover:shadow transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] text-red-600 uppercase tracking-wider font-semibold block">
                阻塞异常池 / BLOCKED EXECUTION
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-2xl text-red-600 font-bold tracking-tight">08</span>
                <span className="font-mono text-[11px] text-red-600 font-semibold">阻断挂起中</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <span className="material-symbols-outlined text-[22px]">rule_folder</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 bg-red-50/50 -mx-4 -mb-4 px-4 pb-3 flex items-center justify-between border-t border-red-100">
            <span className="font-mono text-[11px] text-red-900 font-medium">卡密错误 3 · 跨区IP 3 · 接口超时 2</span>
            <span
              onClick={() => {
                setActiveTab('locked');
                showToast('已筛选需人工审核与风控排障的阻塞单据！');
              }}
              className="font-mono text-[11px] text-red-600 font-bold cursor-pointer hover:underline"
            >
              转人工介入
            </span>
          </div>
        </div>
      </div>

      {/* Operational Filter Hub & View Switcher */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-4 flex flex-col gap-3.5">
        {/* View Switcher & Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Table Scope & Title */}
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-slate-900 text-sm">交易作业任务池</span>
            <span className="text-xs text-slate-300 font-mono">|</span>
            <span className="text-xs text-slate-500">
              当前在途调度卡单 <strong className="font-mono text-slate-800 font-semibold">{filteredTasks.length}</strong> 笔
            </span>
          </div>

          {/* Live Search & Fast Filter inputs */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative min-w-[240px]">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-slate-400">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 bg-slate-50 text-slate-900 rounded-lg outline-none placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-blue-500 border border-slate-200"
                placeholder="搜卡单号 / 出卡手机 / 卡密后4位 / 商户席位"
              />
            </div>

            <select
              value={selectedBrandFilter}
              onChange={e => setSelectedBrandFilter(e.target.value)}
              className="h-8 px-2.5 bg-slate-50 text-slate-800 rounded-lg outline-none cursor-pointer border border-slate-200"
            >
              <option value="all">全部卡种品类 (All Cards)</option>
              <option value="Apple">Apple App Store & iTunes</option>
              <option value="Steam">Steam Wallet Gift Card</option>
              <option value="Google">Google Play Card</option>
              <option value="Razer">Razer Gold Global</option>
              <option value="Amazon">Amazon Balance Card</option>
            </select>

            <select
              value={selectedAnomalyFilter}
              onChange={e => setSelectedAnomalyFilter(e.target.value)}
              className="h-8 px-2.5 bg-slate-50 text-slate-800 rounded-lg outline-none cursor-pointer border border-slate-200"
            >
              <option value="all">异常类型: 全部 (8类)</option>
              <option value="商户超时未核销">商户超时未核销</option>
              <option value="格式报错">格式报错 (OCR待核正)</option>
              <option value="商户拒单">商户拒单 (额度不足)</option>
              <option value="跨区代理">跨国境代理 IP 碰撞</option>
              <option value="网关 Timeout">API 上游网关 Timeout</option>
              <option value="正常作业中">正常作业中</option>
            </select>

            <button
              onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
              className={`h-8 px-3 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                showAdvancedFilter
                  ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">filter_alt</span>
              <span>高级过滤</span>
            </button>
          </div>
        </div>

        {/* Status Tabs - Standard Image Tab Bar Style */}
        <div className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 pt-2 text-nowrap">
          {[
            { id: 'all', label: '全部在途', count: 48, icon: 'all_inclusive' },
            { id: 'pending_take', label: '待接卡', count: 12, icon: 'hourglass_empty' },
            { id: 'taking', label: '接卡中', count: 14, icon: 'front_hand' },
            { id: 'processing', label: '作业中', count: 16, icon: 'sync' },
            { id: 'warning', label: '即将超时', count: 6, icon: 'alarm', dot: true },
            { id: 'timeout', label: '已超时', count: 2, icon: 'timer_off' },
            { id: 'failed', label: '处理失败', count: 4, icon: 'cancel' },
            { id: 'locked', label: '异常锁定', count: 4, icon: 'lock' },
            { id: 'manual', label: '待人工处理', count: 4, icon: 'support_agent' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 font-bold rounded-t-lg transition-colors shrink-0 flex items-center gap-2 relative cursor-pointer text-xs ${
                  isActive
                    ? 'text-[#004ac6] bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#004ac6]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.icon && <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>}
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono transition-colors ${
                    isActive ? 'bg-blue-100 text-[#004ac6] font-semibold' : 'bg-slate-100 text-slate-600 font-medium'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main High-Throughput Task Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[1180px]">
            <thead>
              <tr className="bg-slate-50/80 h-9 text-slate-500 text-[11px] uppercase tracking-wider select-none border-b border-slate-200">
                <th className="w-10 px-3 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={e => handleToggleSelectAll(e.target.checked)}
                    className="rounded text-blue-600 cursor-pointer h-3.5 w-3.5"
                  />
                </th>
                <th className="py-2 px-3">卡单号 / 入池时间</th>
                <th className="py-2 px-3">卡种品牌 & 介质</th>
                <th className="py-2 px-3">申报面值 & 应付金额</th>
                <th className="py-2 px-3">出卡用户 (等级/信用)</th>
                <th className="py-2 px-3">承接商户 (席位)</th>
                <th className="py-2 px-3">作业节点 & 异常诊断 (8类)</th>
                <th className="py-2 px-3">SLA 剩余倒计时</th>
                <th className="py-2 px-3">风控态势</th>
                <th className="py-2 px-3 text-right pr-4">调度干预操作 ()</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-mono">
              {filteredTasks.map(task => {
                const isSelected = selectedTaskIds.includes(task.id);
                const isWarningRow = task.slaStatus === 'critical' || task.statusCategory === 'warning';
                return (
                  <tr
                    key={task.id}
                    className={`transition-colors group ${
                      isSelected
                        ? 'bg-blue-50/40 hover:bg-blue-50/60'
                        : isWarningRow
                        ? 'bg-amber-50/40 hover:bg-amber-50/80'
                        : task.statusCategory === 'locked'
                        ? 'bg-red-50/20 hover:bg-red-50/40'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-3 text-center py-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectRow(task.id)}
                        className="rounded text-blue-600 cursor-pointer h-3.5 w-3.5"
                      />
                    </td>

                    {/* Order No */}
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900">{task.orderNo}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(task.orderNo);
                              showToast(`单号 ${task.orderNo} 已复制`);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-blue-600 cursor-pointer"
                            title="复制卡单号"
                          >
                            <span className="material-symbols-outlined text-[13px]">content_copy</span>
                          </button>
                        </div>
                        <span className="font-mono text-[11px] text-slate-400">
                          {task.poolTime} ({task.inFlightDuration})
                        </span>
                      </div>
                    </td>

                    {/* Brand */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2 font-sans">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center font-mono text-[10px] font-bold ${task.brandColorClass}`}
                        >
                          {task.brandCode}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">{task.brandName}</span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-[10px] bg-slate-100 px-1 rounded text-slate-600">
                              {task.cardMedium}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">{task.exchangeRate}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Value */}
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col">
                        <span className="font-mono font-semibold text-slate-900">{task.declaredAmount}</span>
                        <span className="font-mono text-[11px] text-emerald-700 font-medium">{task.payableAmount}</span>
                      </div>
                    </td>

                    {/* User */}
                    <td className="py-2.5 px-3 font-sans">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-900 font-medium">{task.userName}</span>
                          <span className="font-mono text-[10px] bg-blue-100 text-blue-800 px-1 rounded font-bold">
                            {task.userLevel}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-400">{task.userPhone}</span>
                      </div>
                    </td>

                    {/* Merchant */}
                    <td className="py-2.5 px-3 font-sans">
                      <div className="flex flex-col">
                        <span
                          className={`font-medium ${
                            task.merchantName.includes('拒单') || task.merchantName.includes('隔离')
                              ? 'text-red-700'
                              : 'text-slate-800'
                          }`}
                        >
                          {task.merchantName}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">{task.merchantStatusDesc}</span>
                      </div>
                    </td>

                    {/* Anomaly */}
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col gap-1 font-sans">
                        <div
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[11px] font-bold w-fit ${task.anomalyBadgeClass}`}
                        >
                          {task.anomalyType.includes('超时') && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                          )}
                          {task.anomalyType.includes('格式') && (
                            <span className="material-symbols-outlined text-[13px]">spellcheck</span>
                          )}
                          {task.anomalyType.includes('拒单') && (
                            <span className="material-symbols-outlined text-[13px]">block</span>
                          )}
                          {task.anomalyType.includes('正常') && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                          )}
                          {task.anomalyType.includes('跨区') && (
                            <span className="material-symbols-outlined text-[13px]">security_update_warning</span>
                          )}
                          <span>{task.anomalyType}</span>
                        </div>
                        <span className="text-[11px] text-slate-600">{task.anomalyDetail}</span>
                      </div>
                    </td>

                    {/* SLA countdown */}
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col">
                        <div
                          className={`flex items-center gap-1 font-bold ${
                            task.slaStatus === 'critical'
                              ? 'text-amber-600 animate-pulse'
                              : task.slaStatus === 'paused'
                              ? 'text-slate-400'
                              : task.slaStatus === 'warning'
                              ? 'text-indigo-600'
                              : 'text-emerald-700'
                          }`}
                        >
                          {task.slaStatus === 'critical' && (
                            <span className="material-symbols-outlined text-[15px]">timer</span>
                          )}
                          <span>{task.slaDisplay}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 font-sans">{task.slaSubtext}</span>
                      </div>
                    </td>

                    {/* Risk */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[11px] font-medium font-sans ${task.riskPostureClass}`}
                      >
                        {task.riskPosture}
                      </span>
                    </td>

                    {/* Interventions */}
                    <td className="py-2.5 px-3 text-right pr-4">
                      <div className="flex items-center justify-end gap-1 font-sans">
                        {task.id === '9910' ? (
                          <button
                            onClick={() => setOcrModalTask(task)}
                            className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 font-mono text-[11px] font-semibold transition-colors shadow-xs cursor-pointer"
                          >
                            人工核正OCR
                          </button>
                        ) : task.id === '9908' ? (
                          <button
                            onClick={() => handleIntervention('转派自营商户 #HUB-01', task.id)}
                            className="px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 font-mono text-[11px] font-semibold transition-colors shadow-xs cursor-pointer"
                          >
                            转派自营商户
                          </button>
                        ) : task.id === '9870' ? (
                          <>
                            <button
                              onClick={() => handleIntervention('人工放行派单', task.id)}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-[11px] font-semibold cursor-pointer"
                            >
                              放行
                            </button>
                            <button
                              onClick={() => handleIntervention('终止并作废', task.id)}
                              className="px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700 font-mono text-[11px] font-bold cursor-pointer"
                            >
                              作废
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setDrawerTask(task)}
                            className="px-2.5 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 font-mono text-[11px] font-semibold transition-colors shadow-xs cursor-pointer"
                          >
                            调度详情
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Pagination & Statistics Sub-Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border-t border-slate-200">
          <div className="flex items-center gap-3 text-slate-500 text-xs">
            <span>
              当前共筛选到在途单 <strong className="font-mono text-slate-900 font-semibold">{filteredTasks.length}</strong> 笔
            </span>
            <span className="text-slate-300 font-mono">|</span>
            <span>当前显示 1 - {filteredTasks.length} 条</span>
            <span className="text-slate-300 font-mono">|</span>
            <div className="flex items-center gap-1">
              <span>每页显示:</span>
              <select className="bg-slate-50 text-slate-800 rounded px-1.5 py-0.5 text-xs font-medium outline-none border border-slate-200">
                <option>20 条/页</option>
                <option>50 条/页</option>
                <option>100 条/页</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 text-slate-400 disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600 text-white font-mono text-xs font-bold shadow-xs">
              1
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-700 font-mono text-xs cursor-pointer">
              2
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-700 font-mono text-xs cursor-pointer">
              3
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer">
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Floating Dispatch Dock (PRD Batch Action Bar) */}
      <div
        className={`fixed bottom-6 left-[244px] right-6 z-30 bg-slate-900 text-white p-3.5 rounded-xl shadow-2xl flex items-center justify-between transition-all duration-300 transform ${
          selectedTaskIds.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-white text-sm">批量实时作业控制</span>
          </div>
          <div className="h-4 w-px bg-slate-700"></div>
          <span className="text-slate-300 text-xs">
            已勾选 <strong className="text-emerald-400 font-mono text-sm">{selectedTaskIds.length}</strong> 笔任务卡单
          </span>
          <span className="font-mono text-[11px] bg-white/10 px-2 py-0.5 rounded text-slate-300 hidden sm:inline-block">
            支持一键跨商户转移/改价推流
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleBatchAction('rate_broadcast')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">campaign</span>
            <span>批量加价广播 (+0.3%~1.0%)</span>
          </button>
          <button
            onClick={() => handleBatchAction('reassign_merchant')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">supervised_user_circle</span>
            <span>批量转派自营商户</span>
          </button>
          <button
            onClick={() => handleBatchAction('force_terminate')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">stop_circle</span>
            <span>批量人工终止</span>
          </button>
          <button
            onClick={handleDeselectAll}
            className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            title="取消所有选择"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <OperationDetailModal
        task={drawerTask}
        isOpen={!!drawerTask}
        onClose={() => setDrawerTask(null)}
        onIntervene={handleIntervention}
      />

      <OperationOcrModal
        task={ocrModalTask}
        isOpen={!!ocrModalTask}
        onClose={() => setOcrModalTask(null)}
        onConfirm={(correctedToken, id) => {
          setTasks(prev =>
            prev.map(t =>
              t.id === id
                ? {
                    ...t,
                    secretToken: correctedToken,
                    anomalyType: '正常作业中 (已人工纠错)',
                    anomalyBadgeClass: 'bg-emerald-100 text-emerald-800',
                    anomalyDetail: `已纠错为 ${correctedToken}，重新发起 API 验密通过`,
                    slaStatus: 'healthy',
                    statusCategory: 'processing'
                  }
                : t
            )
          );
          showToast(`核正成功！卡密已纠正并重新触发 API 校验：${correctedToken}`);
        }}
      />

      <OperationCircuitBreakerModal
        isOpen={isCircuitBreakerOpen}
        onClose={() => setIsCircuitBreakerOpen(false)}
        onConfirm={(reason, channels) => {
          showToast(`熔断机制已启动：已将 ${channels.length} 家高延迟/异常商户席位降级并脱钩！`);
        }}
      />


    </div>
  );
};
