import React, { useState, useEffect, useRef } from 'react';
import { NavPath } from '../types';
import {
  ListTodo,
  CheckSquare,
  X,
  Search,
  Check,
  CheckCheck,
  CheckCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  FileText,
  Gavel,
  BadgeCheck,
  Landmark,
} from 'lucide-react';

export type TodoCategory =
  | 'all'
  | 'robot-risk'
  | 'robot-pricing'
  | 'robot-marketing'
  | 'transaction-approval'
  | 'finance-review'
  | 'dispute-exception'
  | 'completed';

export interface TodoTask {
  id: string;
  category:
    | 'robot-risk'
    | 'robot-pricing'
    | 'robot-marketing'
    | 'transaction-approval'
    | 'finance-review'
    | 'dispute-exception';
  categoryLabel: string;
  title: string;
  targetEntity: string;
  amountOrValue: string;
  timeAgo: string;
  deadlineText: string;
  urgencyLevel: 'critical' | 'high' | 'medium';
  actionName: string;
  actionPath: NavPath;
  reason: string;
  status: 'pending' | 'completed';
  completedAt?: string;
}

const INITIAL_TODO_TASKS: TodoTask[] = [
  {
    id: 'TASK-ROBOT-01',
    category: 'robot-risk',
    categoryLabel: '卡风控预检',
    title: 'Apple US $100 预检失效拦截 (Card Check 返回 REDEEMED)',
    targetEntity: '出卡用户: UID-98124 · 极速收卡社',
    amountOrValue: '$100.00 (拦截)',
    timeAgo: '2分钟前',
    deadlineText: '剩余 8分钟 (SLA)',
    urgencyLevel: 'critical',
    actionName: '风控复核',
    actionPath: 'abnormal-cards',
    reason: '机器人 Card Check 返回 REDEEMED，卡内余额为 $0.00，前置阻断出资放行，等待客服/风控复核。',
    status: 'pending',
  },
  {
    id: 'TASK-ROBOT-02',
    category: 'robot-pricing',
    categoryLabel: '报价异常',
    title: 'Apple US $100报价偏低 (4家商户报价偏离运营基准)',
    targetEntity: '4家经营商户 (低于外部参考 1.3pp)',
    amountOrValue: '基准 ≥92.8%',
    timeAgo: '6分钟前',
    deadlineText: '剩余 9分钟 (SLA)',
    urgencyLevel: 'critical',
    actionName: '调价协同',
    actionPath: 'quote-anomalies',
    reason: '报价监控机器人巡检发现 Apple US 整体偏低，已自动生成 #PRICE-20261005-001，商户调价后下一轮复核达标自动关闭。',
    status: 'pending',
  },
  {
    id: 'TASK-ROBOT-03',
    category: 'robot-marketing',
    categoryLabel: 'AI待接管',
    title: 'Visitor-2381 咨询大额 Apple 500刀出卡 (TikTok-A)',
    targetEntity: '访客: Visitor-2381 (138****9921)',
    amountOrValue: '预估 $5,000.00',
    timeAgo: '32秒前',
    deadlineText: '等待中 (32s)',
    urgencyLevel: 'high',
    actionName: '接管对话',
    actionPath: 'ai-promotion',
    reason: '大额高意向访客超出通用加价券额度，AI 判断需人工操盘手介入接管谈判。',
    status: 'pending',
  },
  {
    id: 'TASK-APP-01',
    category: 'transaction-approval',
    categoryLabel: '待审批交易',
    title: 'Apple US $500 × 5张 大额交易放款审批',
    targetEntity: '出卡大客: Adebayo Adeleke (UID-8890214)',
    amountOrValue: '$2,500.00',
    timeAgo: '5分钟前',
    deadlineText: '剩余 15分钟 (SLA)',
    urgencyLevel: 'critical',
    actionName: '审批放款',
    actionPath: 'transaction-operations',
    reason: '单笔出款金额超过 $2,000 大额风控门槛，卡密已完成核销，等待运营主管终审放款。',
    status: 'pending',
  },
  {
    id: 'TASK-FIN-01',
    category: 'finance-review',
    categoryLabel: '待复核财务账单',
    title: '万商合众网络 8月第4周日结提现账单复核',
    targetEntity: '接卡商户: 万商合众网络 (MID-8812)',
    amountOrValue: '$34,820.00 USDT',
    timeAgo: '8分钟前',
    deadlineText: '剩余 12分钟 (SLA)',
    urgencyLevel: 'critical',
    actionName: '账单复核',
    actionPath: 'platform-settlement',
    reason: '日结批量提现流水已生成，系统自动轧差扣除 5,000 USDT 质押金，等待出纳主管复核打款。',
    status: 'pending',
  },
  {
    id: 'TASK-APP-02',
    category: 'transaction-approval',
    categoryLabel: '待审批交易',
    title: 'Vanilla Visa $1,000 汇率浮动倒挂放行审批',
    targetEntity: '出卡商户: Chukwudi Eze (UID-8890451)',
    amountOrValue: '$1,000.00',
    timeAgo: '12分钟前',
    deadlineText: '剩余 28分钟',
    urgencyLevel: 'high',
    actionName: '汇率放行',
    actionPath: 'order-management',
    reason: '撮合接单折率与系统指导锁价发生 0.8% 偏差，触发偏离告警，需人工审批放行撮合。',
    status: 'pending',
  },
  {
    id: 'TASK-FIN-02',
    category: 'finance-review',
    categoryLabel: '待复核财务账单',
    title: '广州天河汇商 大额对公银行汇款充值流水勾对',
    targetEntity: '付款方: 广州天河汇商国际贸易有限公司',
    amountOrValue: '¥180,000.00 (≈ $25,200)',
    timeAgo: '20分钟前',
    deadlineText: '剩余 40分钟',
    urgencyLevel: 'high',
    actionName: '流水勾对',
    actionPath: 'recharge-management',
    reason: '网银转账附言中未填全商户席位识别号，系统无法自动认领，需人工核对电子回单并入账。',
    status: 'pending',
  },
  {
    id: 'TASK-DISP-01',
    category: 'dispute-exception',
    categoryLabel: '待仲裁争议',
    title: 'Razer Gold $200 碰卡时间戳证据链裁决',
    targetEntity: '争议双方: U7712 vs 星辰数字科技',
    amountOrValue: '$200.00',
    timeAgo: '16分钟前',
    deadlineText: '剩余 14分钟 (SLA)',
    urgencyLevel: 'critical',
    actionName: '争议仲裁',
    actionPath: 'dispute-resolution',
    reason: '出卡方与商户均出具兑换截图，需质检员调取第三方官方 API 兑换时间戳进行最终责任仲裁。',
    status: 'pending',
  },
  {
    id: 'TASK-FIN-03',
    category: 'finance-review',
    categoryLabel: '待复核财务账单',
    title: '跨境多币种结算日终四账勾稽平衡调差单复核',
    targetEntity: '清算核心: USD / NGN / CNY 汇兑轧差',
    amountOrValue: '-$342.15 (点差平衡)',
    timeAgo: '35分钟前',
    deadlineText: '今日 20:00前',
    urgencyLevel: 'medium',
    actionName: '调差复核',
    actionPath: 'financial-reconciliation',
    reason: '四账勾稽核对发现日终汇率换算尾差 $342.15，需财务专员复核平账凭单并确认入账。',
    status: 'pending',
  },
  {
    id: 'TASK-APP-03',
    category: 'transaction-approval',
    categoryLabel: '待审批交易',
    title: 'Steam UK £500 特殊费率优惠阶梯申请',
    targetEntity: '接卡商户: 极速数码科技有限公司 (MID-8815)',
    amountOrValue: '£500.00',
    timeAgo: '28分钟前',
    deadlineText: '今日 18:00前',
    urgencyLevel: 'medium',
    actionName: '阶梯审批',
    actionPath: 'quote-management',
    reason: '商户申请月度流水达标折率优惠，扣点从 1.2% 下调至 0.95%，需商务与风控双签。',
    status: 'pending',
  },
  {
    id: 'TASK-DISP-02',
    category: 'dispute-exception',
    categoryLabel: '待处理异常',
    title: 'Google Play €100 介质折角模糊人工验码核实',
    targetEntity: '出卡用户: Carlos Silva (UID-99412)',
    amountOrValue: '€100.00',
    timeAgo: '24分钟前',
    deadlineText: '剩余 36分钟',
    urgencyLevel: 'medium',
    actionName: '验码放行',
    actionPath: 'order-management',
    reason: '实体卡涂层反光模糊，OCR 置信度 71%，需人工比对卡密后 6 位并推入撮合池。',
    status: 'pending',
  },
];

interface TodoCenterProps {
  onNavigate: (path: NavPath) => void;
}

export const TodoCenter: React.FC<TodoCenterProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TodoCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState<TodoTask[]>(() => {
    try {
      const saved = localStorage.getItem('platform_todo_tasks_v2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_TODO_TASKS;
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('platform_todo_tasks_v2', JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  // Counts
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const pendingCount = pendingTasks.length;
  const criticalCount = pendingTasks.filter(t => t.urgencyLevel === 'critical').length;

  const approvalCount = pendingTasks.filter(t => t.category === 'transaction-approval').length;
  const financeCount = pendingTasks.filter(t => t.category === 'finance-review').length;
  const disputeCount = pendingTasks.filter(t => t.category === 'dispute-exception').length;
  const robotRiskCount = pendingTasks.filter(t => t.category === 'robot-risk').length;
  const robotPricingCount = pendingTasks.filter(t => t.category === 'robot-pricing').length;
  const robotMarketingCount = pendingTasks.filter(t => t.category === 'robot-marketing').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  // Filtered task list
  const filteredTasks = tasks.filter(task => {
    // Tab filter
    if (activeTab === 'completed') {
      if (task.status !== 'completed') return false;
    } else {
      if (task.status !== 'pending') return false;
      if (activeTab !== 'all' && task.category !== activeTab) return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        task.targetEntity.toLowerCase().includes(q) ||
        task.amountOrValue.toLowerCase().includes(q) ||
        task.reason.toLowerCase().includes(q) ||
        task.categoryLabel.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Action handlers
  const handleCompleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setTasks(prev =>
      prev.map(t =>
        t.id === id ? { ...t, status: 'completed', completedAt: timeStr } : t
      )
    );

    const actionText =
      task.category === 'robot-risk'
        ? '已完成卡风控快照复核与处置'
        : task.category === 'robot-pricing'
        ? '已协同商户调价并由监控机器人自动复核闭环'
        : task.category === 'robot-marketing'
        ? '已成功接入该访客实时人工谈判对话'
        : task.category === 'transaction-approval'
        ? '已成功审批该笔交易并放行'
        : task.category === 'finance-review'
        ? '已完成财务账单复核'
        : '已完成该待办事项处理';

    showToast(`${task.title.slice(0, 16)}... ${actionText}`);
  };

  const handleRevertTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, status: 'pending', completedAt: undefined } : t))
    );
    showToast('已撤回至待办事项列表');
  };

  const handleBatchApproveAll = () => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setTasks(prev =>
      prev.map(t =>
        t.status === 'pending' ? { ...t, status: 'completed', completedAt: timeStr } : t
      )
    );
    showToast('所有待办任务已批量处理完毕！');
  };

  const handleResetTasks = () => {
    setTasks(INITIAL_TODO_TASKS);
    showToast('已重置恢复全部待办任务');
  };

  const handleJumpToTask = (path: NavPath) => {
    onNavigate(path);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Header Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
          isOpen
            ? 'bg-blue-50/80 border-blue-300 text-blue-800 shadow-xs'
            : pendingCount > 0
            ? 'bg-amber-50/70 border-amber-200/90 text-amber-900 hover:bg-amber-100/70'
            : 'bg-slate-100 border-slate-200/80 text-slate-700 hover:bg-slate-200/70'
        }`}
        title="待办事项中心"
        type="button"
      >
        <ListTodo
          className={`w-4 h-4 ${
            pendingCount > 0 ? 'text-amber-600' : 'text-slate-500'
          }`}
        />
        <span className="font-semibold tracking-tight">待办事项</span>

        {/* Real-time Badge Count */}
        {pendingCount > 0 ? (
          <span
            className={`flex items-center justify-center min-w-[19px] h-4.5 px-1.5 rounded-full text-[11px] font-bold text-white shadow-2xs ${
              criticalCount > 0 ? 'bg-rose-600 animate-pulse' : 'bg-amber-600'
            }`}
          >
            {pendingCount}
          </span>
        ) : (
          <span className="flex items-center justify-center px-1.5 h-4 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">
            全部完成
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[490px] max-w-[94vw] bg-white rounded-xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden flex flex-col max-h-[82vh] animate-in fade-in zoom-in-95 duration-150">
          {/* Top Title Bar */}
          <div className="p-3.5 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">待办事项中心</h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    实时待办: {pendingCount} 项
                  </span>
                  {criticalCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                      {criticalCount} 项临界加急
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  聚合交易审批、财务账单复核与售后争议仲裁
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {pendingCount > 0 ? (
                <button
                  onClick={handleBatchApproveAll}
                  className="px-2 py-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                  title="将当前待办全部标为已处理"
                >
                  一键全部处理
                </button>
              ) : (
                <button
                  onClick={handleResetTasks}
                  className="px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                  title="恢复示例待办数据以供演示测试"
                >
                  重置待办
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                title="关闭"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Quick Filter Tabs - Standard Image Tab Bar Style */}
          <div className="px-2 pt-2 bg-white border-b border-slate-100 flex items-center justify-between gap-1 overflow-x-auto text-xs">
            <div className="flex items-center gap-1 overflow-x-auto">
              {[
                { id: 'all', label: '全部待办', badge: `${pendingCount}`, icon: ListTodo },
                { id: 'transaction-approval', label: '待审批交易', badge: `${approvalCount}`, icon: BadgeCheck },
                { id: 'finance-review', label: '待复核账单', badge: `${financeCount}`, icon: Landmark },
                { id: 'dispute-exception', label: '争议异常', badge: `${disputeCount}`, icon: Gavel },
                { id: 'robot-risk', label: '卡风控', badge: `${robotRiskCount}`, icon: ShieldAlert },
                { id: 'completed', label: '已完成', badge: `${completedCount}`, icon: CheckCircle }
              ].map(tab => {
                const isActive = activeTab === tab.id;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as TodoCategory)}
                    className={`px-3 py-2 font-bold rounded-t-lg transition-colors shrink-0 flex items-center gap-1.5 relative cursor-pointer text-xs ${
                      isActive
                        ? 'text-[#004ac6] bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#004ac6]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono transition-colors ${
                        isActive ? 'bg-blue-100 text-[#004ac6] font-semibold' : 'bg-slate-100 text-slate-600 font-medium'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Filter input */}
          <div className="px-3 py-1.5 bg-slate-50/70 border-b border-slate-100 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="快速检索待办单号、主体、金额或关键词..."
              className="w-full text-xs bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Toast Notice */}
          {toastMessage && (
            <div className="px-3 py-1.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs flex items-center gap-1.5 animate-in fade-in duration-200">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate font-medium">{toastMessage}</span>
            </div>
          )}

          {/* Task List Items Container */}
          <div className="overflow-y-auto divide-y divide-slate-100 p-2 space-y-2 max-h-[52vh] bg-slate-50/30">
            {filteredTasks.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-2">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {activeTab === 'completed'
                    ? '暂无已完成记录'
                    : searchQuery
                    ? '未找到匹配的待办任务'
                    : '太棒了！当前分类下已无待办事项'}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                  {activeTab === 'completed'
                    ? '在待办列表中点击“一键通过”或“复核”后，记录将归档于此。'
                    : '所有交易审批与账单复核均处于正常履约节奏，暂无需人工强干预事项。'}
                </p>
                {tasks.every(t => t.status === 'completed') && (
                  <button
                    onClick={handleResetTasks}
                    className="mt-3 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                  >
                    重置演示待办数据
                  </button>
                )}
              </div>
            ) : (
              filteredTasks.map(task => {
                const isCompleted = task.status === 'completed';
                const isApproval = task.category === 'transaction-approval';
                const isFinance = task.category === 'finance-review';

                return (
                  <div
                    key={task.id}
                    className={`rounded-xl border p-3 transition-all ${
                      isCompleted
                        ? 'bg-white/80 border-slate-200/60 opacity-75'
                        : task.urgencyLevel === 'critical'
                        ? 'bg-white border-rose-200 hover:border-rose-300 shadow-2xs hover:shadow-xs'
                        : 'bg-white border-slate-200 hover:border-blue-200 shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    {/* Header tags row */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        {/* Category Label */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-semibold border ${
                            isApproval
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : isFinance
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {isApproval ? (
                            <BadgeCheck className="w-3.5 h-3.5" />
                          ) : isFinance ? (
                            <FileText className="w-3.5 h-3.5" />
                          ) : (
                            <Gavel className="w-3.5 h-3.5" />
                          )}
                          <span>{task.categoryLabel}</span>
                        </span>

                        {/* Urgency Badge */}
                        {!isCompleted && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              task.urgencyLevel === 'critical'
                                ? 'bg-rose-600 text-white'
                                : task.urgencyLevel === 'high'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {task.urgencyLevel === 'critical'
                              ? '加急/SLA'
                              : task.urgencyLevel === 'high'
                              ? '高优先级'
                              : '常规复核'}
                          </span>
                        )}
                      </div>

                      {/* SLA Countdown or Completed Time */}
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        {isCompleted ? (
                          <span className="text-emerald-600 font-medium flex items-center gap-1">
                            <CheckCheck className="w-3.5 h-3.5" />
                            已完成 ({task.completedAt || '刚刚'})
                          </span>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span
                              className={`font-mono ${
                                task.urgencyLevel === 'critical'
                                  ? 'text-rose-600 font-semibold'
                                  : 'text-slate-500'
                              }`}
                            >
                              {task.deadlineText}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Task Title */}
                    <div className="text-xs font-bold text-slate-900 leading-snug">
                      {task.title}
                    </div>

                    {/* Metadata Highlight: Amount & Entity */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">金额/价值:</span>
                        <span className="font-mono font-bold text-slate-900">
                          {task.amountOrValue}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 truncate max-w-[240px]">
                        <span className="text-slate-400">主体:</span>
                        <span className="truncate font-medium text-slate-700">
                          {task.targetEntity}
                        </span>
                      </div>
                    </div>

                    {/* Reason / Context */}
                    <p className="mt-1.5 text-[11px] text-slate-500 leading-relaxed">
                      {task.reason}
                    </p>

                    {/* Footer Actions */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">
                        单号: {task.id} · {task.timeAgo}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {isCompleted ? (
                          <button
                            onClick={e => handleRevertTask(task.id, e)}
                            className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                          >
                            撤销标记
                          </button>
                        ) : (
                          <>
                            {/* Inline quick approve / verify button */}
                            <button
                              onClick={e => handleCompleteTask(task.id, e)}
                              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
                                isApproval
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                  : isFinance
                                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                              title="在待办中心直接快速完成"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>
                                {isApproval ? '审批通过' : isFinance ? '确认复核' : '直接完成'}
                              </span>
                            </button>

                            {/* Jump to module */}
                            <button
                              onClick={() => handleJumpToTask(task.actionPath)}
                              className="px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded-md transition-colors cursor-pointer flex items-center gap-0.5"
                              title="前往对应业务系统深层处理"
                            >
                              <span>跳转处理</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Summary Bar */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-[11px] flex items-center justify-between text-slate-500">
            <div className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>队列实时轮询中 (30s 心跳同步)</span>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                onNavigate('workbench');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>查看工作台大盘待办</span>
              <span className="material-symbols-outlined text-[13px]">open_in_new</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
