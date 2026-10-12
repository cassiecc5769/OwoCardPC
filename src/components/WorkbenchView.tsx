import React, { useState } from 'react';
import { NavPath } from '../types';
import { RecentActivityWidget } from './workbench/RecentActivityWidget';

interface WorkbenchViewProps {
  onNavigate: (path: NavPath) => void;
}

interface ActionTask {
  id: string;
  category: 'exception' | 'sla' | 'dispute';
  categoryLabel: string;
  title: string;
  targetEntity: string;
  amountOrValue: string;
  timeAgo: string;
  urgencyLevel: 'high' | 'medium';
  actionName: string;
  actionPath: NavPath;
  reason: string;
}

const ACTION_TASKS: ActionTask[] = [
  {
    id: 'TASK-01',
    category: 'exception',
    categoryLabel: '卡单异常',
    title: 'Apple Store $500 汇率浮动差溢出预警',
    targetEntity: '出卡用户: Adebayo (UID: 98210)',
    amountOrValue: '$500.00',
    timeAgo: '2分钟前',
    urgencyLevel: 'high',
    actionName: '立即排查',
    actionPath: 'transaction-operations',
    reason: '撮合商户接单折率与用户提交折率出现 1.2% 负毛利倒挂，系统自动挂起。',
  },
  {
    id: 'TASK-02',
    category: 'sla',
    categoryLabel: 'SLA超时预警',
    title: 'Steam $100 官方充值核验已达 280 秒 (SLA临界)',
    targetEntity: '接卡商户: 万商合众网络 (MID-8812)',
    amountOrValue: '$100.00',
    timeAgo: '4分钟前',
    urgencyLevel: 'high',
    actionName: '催办/改派',
    actionPath: 'workbench-cs',
    reason: '商户席位未在 300 秒承诺 SLA 内回传充值凭据，即将触发超时自动兜底。',
  },
  {
    id: 'TASK-03',
    category: 'dispute',
    categoryLabel: '售后争议',
    title: 'Razer Gold $200 碰卡申诉质证中',
    targetEntity: '买卖双方: U7712 vs 极速数码',
    amountOrValue: '$200.00',
    timeAgo: '18分钟前',
    urgencyLevel: 'medium',
    actionName: '处理争议',
    actionPath: 'dispute-resolution',
    reason: '用户称充值前卡密已被兑换，商户出具官方兑换时间戳，需客服仲裁。',
  },
  {
    id: 'TASK-04',
    category: 'exception',
    categoryLabel: '卡单异常',
    title: 'Google Play €100 介质模糊需要人工复核',
    targetEntity: '出卡用户: Carlos Silva (UID: 99412)',
    amountOrValue: '€100.00',
    timeAgo: '22分钟前',
    urgencyLevel: 'medium',
    actionName: '人工复核',
    actionPath: 'order-management',
    reason: '用户上传实体卡小票折角模糊，OCR 置信度低于 75%，需人工验码。',
  },
  {
    id: 'TASK-05',
    category: 'sla',
    categoryLabel: 'SLA超时预警',
    title: 'Amazon US $250 席位空置待调配',
    targetEntity: '承揽池: 北美实体卡专席',
    amountOrValue: '$250.00',
    timeAgo: '35分钟前',
    urgencyLevel: 'medium',
    actionName: '调度扩容',
    actionPath: 'merchant-analytics',
    reason: '当前入途卡单需求激增，承揽商户可用额度消耗至 88%，建议提额补水。',
  },
];

export const WorkbenchView: React.FC<WorkbenchViewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'today-focus' | 'process-guide'>('today-focus');
  const [taskFilter, setTaskFilter] = useState<'all' | 'exception' | 'sla' | 'dispute'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  const handleForceRecalc = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshSuccess(true);
      setTimeout(() => setRefreshSuccess(false), 2500);
    }, 450);
  };

  const filteredTasks = ACTION_TASKS.filter(task => {
    if (taskFilter === 'all') return true;
    return task.category === taskFilter;
  });

  return (
    <div className="flex flex-col w-full gap-5 text-slate-800 antialiased">
      {/* 顶部控制栏：模式分层切换与数据刷新 */}
      <section className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">业务作业工作台</h1>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 text-xs">
              <button
                onClick={() => setActiveTab('today-focus')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'today-focus'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">task_alt</span>
                <span>今日作战看板 (重点待办)</span>
              </button>
              <button
                onClick={() => setActiveTab('process-guide')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'process-guide'
                    ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">account_tree</span>
                <span>业务全景流向与导览</span>
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === 'today-focus' 
              ? '今日关键经营态势、高优先级异常挂单与专席工作台直通调度。' 
              : '从用户出卡到商户核销的端到端作业闭环与 7 大核心业务域导航。'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          {refreshSuccess && (
            <span className="text-xs text-emerald-700 font-medium flex items-center gap-1 animate-fade-in">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              指标已更新
            </span>
          )}
          <button
            onClick={handleForceRecalc}
            disabled={isRefreshing}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/70 rounded-lg text-slate-700 border border-slate-200/60 transition-colors text-xs font-medium cursor-pointer"
          >
            <span className={`material-symbols-outlined text-[15px] ${isRefreshing ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>{isRefreshing ? '计算中...' : '刷新大盘'}</span>
          </button>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 视图 1: 今日作战看板 (FOCUS MODE) - 默认激活 */}
      {/* ============================================================== */}
      {activeTab === 'today-focus' && (
        <div className="flex flex-col gap-5">
          {/* 第一层：今日核心态势 (4 个统一规范大盘指标卡) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 指标 1: 今日成交额 */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-medium uppercase tracking-wider text-slate-500">今日成交规模 (GMV)</span>
                <span className="material-symbols-outlined text-[18px] text-blue-600">payments</span>
              </div>
              <div className="font-mono text-2xl font-bold text-slate-900 tracking-tight my-1">
                ¥1,268,500.00
              </div>
              <div className="flex flex-col gap-1 text-xs font-mono mt-1 border-t border-slate-100 pt-2">
                <div className="flex items-center justify-between text-emerald-600 font-semibold">
                  <span>较昨日 +12.6%</span>
                  <span>对比昨日 +¥14.2w</span>
                </div>
                <div className="pt-1 flex items-center justify-between text-slate-400">
                  <span>客单价 ¥101.00 · $176.5k USD</span>
                  <button
                    onClick={() => onNavigate('business-overview')}
                    className="text-blue-600 hover:underline font-medium flex items-center gap-0.5 cursor-pointer font-sans"
                    type="button"
                  >
                    <span>分析</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 指标 2: 履约卡单总量 */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-medium uppercase tracking-wider text-slate-500">今日履约卡单</span>
                <span className="material-symbols-outlined text-[18px] text-indigo-600">inventory_2</span>
              </div>
              <div className="font-mono text-2xl font-bold text-slate-900 tracking-tight my-1">
                12,560 <span className="text-xs font-normal text-slate-500 font-sans">笔</span>
              </div>
              <div className="flex flex-col gap-1 text-xs font-mono mt-1 border-t border-slate-100 pt-2">
                <div className="flex items-center justify-between text-emerald-600 font-semibold">
                  <span>成功率 98.6%</span>
                  <span>较昨日 +8.4%</span>
                </div>
                <div className="pt-1 flex items-center justify-between text-slate-400">
                  <span>平均核销时效 38.4 秒</span>
                  <button
                    onClick={() => onNavigate('transaction-operations')}
                    className="text-indigo-600 hover:underline font-medium flex items-center gap-0.5 cursor-pointer font-sans"
                    type="button"
                  >
                    <span>作业</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 指标 3: 承揽商户在线与负荷 */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-medium uppercase tracking-wider text-slate-500">在线承揽商户与水位</span>
                <span className="material-symbols-outlined text-[18px] text-teal-600">storefront</span>
              </div>
              <div className="font-mono text-2xl font-bold text-slate-900 tracking-tight my-1">
                74.2% <span className="text-xs font-normal text-slate-500 font-sans">(88 / 142 家)</span>
              </div>
              <div className="flex flex-col gap-1 text-xs font-mono mt-1 border-t border-slate-100 pt-2">
                <div className="flex items-center justify-between text-teal-600 font-semibold">
                  <span>可用池 ¥3,260,000</span>
                  <span className="text-slate-600">HHI 0.245 健康</span>
                </div>
                <div className="pt-1 flex items-center justify-between text-slate-400">
                  <span>席位负荷正常无挤兑</span>
                  <button
                    onClick={() => onNavigate('merchant-management')}
                    className="text-teal-600 hover:underline font-medium flex items-center gap-0.5 cursor-pointer font-sans"
                    type="button"
                  >
                    <span>商户</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 指标 4: 紧急待办与风险卡单 */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-medium uppercase tracking-wider text-slate-500">今日重点待办</span>
                <span className="material-symbols-outlined text-[18px] text-rose-600">error</span>
              </div>
              <div className="font-mono text-2xl font-bold text-slate-900 tracking-tight my-1">
                8 <span className="text-xs font-normal text-slate-500 font-sans">项急需处理</span>
              </div>
              <div className="flex flex-col gap-1 text-xs font-mono mt-1 border-t border-slate-100 pt-2">
                <div className="flex items-center justify-between text-rose-600 font-semibold">
                  <span>3单挂单 · 3单预警</span>
                  <span className="text-slate-600">2笔售后争议</span>
                </div>
                <div className="pt-1 flex items-center justify-between text-slate-400">
                  <span>建议响应 ≤ 15 分钟</span>
                  <button
                    onClick={() => setTaskFilter('all')}
                    className="text-rose-600 hover:underline font-medium flex items-center gap-0.5 cursor-pointer font-sans"
                    type="button"
                  >
                    <span>排障</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 第二层：今日重点跟进中枢 (Priority Action Queue) - 直接回答“重点看哪一块” */}
          <section className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-4 bg-rose-600 rounded-sm"></div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  今日重点跟进中枢
                </h2>
                <span className="text-xs text-slate-500">
                  （按紧急度排序，点击右侧按钮直接一键处理）
                </span>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                <button
                  onClick={() => setTaskFilter('all')}
                  className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-all ${
                    taskFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  全部待办 ({ACTION_TASKS.length})
                </button>
                <button
                  onClick={() => setTaskFilter('exception')}
                  className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-all ${
                    taskFilter === 'exception' ? 'bg-white text-rose-600 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  异常挂单 (2)
                </button>
                <button
                  onClick={() => setTaskFilter('sla')}
                  className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-all ${
                    taskFilter === 'sla' ? 'bg-white text-amber-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  SLA预警 (2)
                </button>
                <button
                  onClick={() => setTaskFilter('dispute')}
                  className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-all ${
                    taskFilter === 'dispute' ? 'bg-white text-blue-600 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  争议仲裁 (1)
                </button>
              </div>
            </div>

            {/* Tasks List */}
            <div className="divide-y divide-slate-100 mt-2">
              {filteredTasks.map(task => (
                <div 
                  key={task.id}
                  className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold shrink-0 mt-0.5 ${
                      task.category === 'exception' ? 'bg-rose-100 text-rose-800' :
                      task.category === 'sla' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {task.categoryLabel}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-900">{task.title}</span>
                        <span className="text-xs font-bold text-slate-700">{task.amountOrValue}</span>
                        <span className="text-[11px] text-slate-400">· {task.timeAgo}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {task.reason}
                      </p>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {task.targetEntity}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => onNavigate(task.actionPath)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-2xs flex items-center gap-1 ${
                        task.urgencyLevel === 'high'
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <span>{task.actionName}</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 第三层：三专席直达工作台 (简洁卡片，一键进入对应专班) */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 运营工作台 */}
            <div 
              onClick={() => onNavigate('workbench-operations')}
              className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">trending_up</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">平台运营专席</h3>
                      <p className="text-[11px] text-slate-500">大盘监控 · 供需调度 · 异常干预</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-600 hover:underline">进入 &gt;</span>
                </div>
                <div className="grid grid-cols-2 gap-2 my-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded">
                    <div className="text-slate-500 text-[10px]">今日完成卡单</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">12,560 笔</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded">
                    <div className="text-slate-500 text-[10px]">在途调配需求</div>
                    <div className="font-bold text-blue-600 text-sm mt-0.5">¥428,000</div>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>调度引擎运行正常</span>
                <span className="text-blue-600 font-medium">进入运营控制台</span>
              </div>
            </div>

            {/* 客服工作台 */}
            <div 
              onClick={() => onNavigate('workbench-cs')}
              className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:border-emerald-400 hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">support_agent</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">平台客服专席</h3>
                      <p className="text-[11px] text-slate-500">会话接待 · 工单协同 · 争议处理</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 hover:underline">进入 &gt;</span>
                </div>
                <div className="grid grid-cols-2 gap-2 my-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded">
                    <div className="text-slate-500 text-[10px]">待处理会话</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">32 队列中</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded">
                    <div className="text-slate-500 text-[10px]">平均响应时效</div>
                    <div className="font-bold text-emerald-700 text-sm mt-0.5">2.3 分钟</div>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>客服解决率 96.1%</span>
                <span className="text-emerald-700 font-medium">进入客服工作台</span>
              </div>
            </div>

            {/* 财务工作台 */}
            <div 
              onClick={() => onNavigate('workbench-finance')}
              className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:border-amber-400 hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">平台财务专席</h3>
                      <p className="text-[11px] text-slate-500">充值核销 · 积点流水 · 四账勾稽</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-800 hover:underline">进入 &gt;</span>
                </div>
                <div className="grid grid-cols-2 gap-2 my-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded">
                    <div className="text-slate-500 text-[10px]">今日充值流水</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">¥568,000</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded">
                    <div className="text-slate-500 text-[10px]">账务差异 (轧差)</div>
                    <div className="font-bold text-emerald-700 text-sm mt-0.5">0 (平)</div>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>备付金充盈 100%</span>
                <span className="text-amber-800 font-medium">进入财务控制台</span>
              </div>
            </div>
          </section>

          {/* 第四层：全域实时业务动态流 (Recent Activity Feed) */}
          <RecentActivityWidget onNavigate={onNavigate} />
        </div>
      )}

      {/* ============================================================== */}
      {/* 视图 2: 业务全景流向与导览 (PROCESS & MODULES GUIDE) */}
      {/* ============================================================== */}
      {activeTab === 'process-guide' && (
        <div className="flex flex-col gap-5">
          {/* 业务全景流向与端到端闭环 (6 大横向节点) */}
          <section className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-4 bg-emerald-600 rounded-sm"></div>
                <h2 className="text-base font-bold text-slate-900">业务全景流向与端到端作业闭环</h2>
                <span className="text-xs text-slate-500">（从获客出卡到结算调优的全生命周期）</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600"></span>主交易动线</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-600"></span>风控争议回流</span>
              </div>
            </div>

            {/* 6 大节点 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* 节点 1 */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-blue-600 text-xs">① 拉新获客</span>
                    <span className="material-symbols-outlined text-[16px] text-slate-400">person_add</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="bg-white border border-slate-200/60 px-2 py-1 rounded">渠道引流投放</div>
                    <div className="bg-white border border-slate-200/60 px-2 py-1 rounded">优惠券与满减激励</div>
                    <div className="bg-white border border-slate-200/60 px-2 py-1 rounded">用户注册实名转化</div>
                  </div>
                </div>
                <div className="mt-3 pt-2 text-[11px] text-slate-500 flex justify-between border-t border-slate-200/50">
                  <span>渠道 ROI</span>
                  <span className="text-emerald-700 font-semibold">3.8x</span>
                </div>
              </div>

              {/* 节点 2 */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-blue-600 text-xs">② 用户出卡</span>
                    <span className="material-symbols-outlined text-[16px] text-slate-400">input</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="bg-white border border-slate-200/60 px-2 py-1 rounded">提交卡号卡密</div>
                    <div className="bg-white border border-slate-200/60 px-2 py-1 rounded">OCR 识别初筛</div>
                    <div className="bg-white border border-slate-200/60 px-2 py-1 rounded">卡密有效性验证</div>
                  </div>
                </div>
                <div className="mt-3 pt-2 text-[11px] text-slate-500 flex justify-between border-t border-slate-200/50">
                  <span>出卡转化率</span>
                  <span className="text-blue-600 font-semibold">84.2%</span>
                </div>
              </div>

              {/* 节点 3 */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-blue-600 text-xs">③ 卡单匹配</span>
                    <span className="material-symbols-outlined text-[16px] text-slate-400">sync_alt</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="bg-white border border-slate-200/60 px-2 py-1 rounded">报价与利润规则匹配</div>
                    <div className="bg-white border border-slate-200/60 px-2 py-1 rounded">商户可用额度校验</div>
                    <div className="bg-white border border-slate-200/60 px-2 py-1 rounded">自动/手动派单调度</div>
                  </div>
                </div>
                <div className="mt-3 pt-2 text-[11px] text-slate-500 flex justify-between border-t border-slate-200/50">
                  <span>撮合平均耗时</span>
                  <span className="text-emerald-700 font-semibold">18ms</span>
                </div>
              </div>

              {/* 节点 4 */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-blue-600 text-xs">④ 商户接卡</span>
                    <span className="material-symbols-outlined text-[16px] text-slate-400">store</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="bg-white border border-slate-200/60 px-2 py-1 rounded">商户系统确认接单</div>
                    <div className="bg-white border border-slate-200/60 px-2 py-1 rounded">下游官方核销充值</div>
                    <div className="bg-white border border-slate-200/60 px-2 py-1 rounded">回传核销结果与凭据</div>
                  </div>
                </div>
                <div className="mt-3 pt-2 text-[11px] text-slate-500 flex justify-between border-t border-slate-200/50">
                  <span>平均核销耗时</span>
                  <span className="text-blue-600 font-semibold">38.4s</span>
                </div>
              </div>

              {/* 节点 5 */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-emerald-700 text-xs">⑤ 交易完成</span>
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">task_alt</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="bg-white border border-slate-200/60 px-2 py-1 rounded">验收与状态终审</div>
                    <div className="bg-white border border-slate-200/60 px-2 py-1 rounded">资金与积点即时划转</div>
                    <div className="bg-white border border-slate-200/60 px-2 py-1 rounded">出卡提现/商户收益</div>
                  </div>
                </div>
                <div className="mt-3 pt-2 text-[11px] text-slate-500 flex justify-between border-t border-slate-200/50">
                  <span>履约达成率</span>
                  <span className="text-emerald-700 font-semibold">99.1%</span>
                </div>
              </div>

              {/* 节点 6 */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-blue-600 text-xs">⑥ 分析优化</span>
                    <span className="material-symbols-outlined text-[16px] text-slate-400">analytics</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="bg-white border border-slate-200/60 px-2 py-1 rounded">利润与交易大盘复盘</div>
                    <div className="bg-white border border-slate-200/60 px-2 py-1 rounded">用户商户信用评级</div>
                    <div className="bg-white border border-slate-200/60 px-2 py-1 rounded">动态调整策略与配额</div>
                  </div>
                </div>
                <div className="mt-3 pt-2 text-[11px] text-slate-500 flex justify-between border-t border-slate-200/50">
                  <span>闭环反馈</span>
                  <span className="text-blue-600 font-semibold">持续迭代</span>
                </div>
              </div>
            </div>

            {/* 嵌入式异常与客服仲裁闭环 */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-rose-600 text-[18px]">report_problem</span>
                  <span className="text-xs font-bold text-slate-900">异常处理与客服介入子流程 (嵌入节点 ④ 与 ⑤ 之间)</span>
                </div>
                <span className="text-xs text-slate-500">双向质押兜底 · 争议证据链闭环</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-center text-xs">
                <div className="bg-white border border-slate-200/60 p-2 rounded-lg">
                  <div className="font-semibold text-slate-900">① 申诉发起</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">面值不符/已被兑换</div>
                </div>
                <div className="bg-white border border-slate-200/60 p-2 rounded-lg">
                  <div className="font-semibold text-slate-900">② 客服接待</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">核验充值日志与凭据</div>
                </div>
                <div className="bg-white border border-slate-200/60 p-2 rounded-lg">
                  <div className="font-semibold text-rose-600">③ 异常介入</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">冻结质押/转单重发</div>
                </div>
                <div className="bg-white border border-slate-200/60 p-2 rounded-lg">
                  <div className="font-semibold text-rose-600">④ 争议仲裁</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">权责判定与赔付执行</div>
                </div>
                <div className="bg-white border border-slate-200/60 p-2 rounded-lg">
                  <div className="font-semibold text-emerald-700">⑤ 结果闭环</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">款项调整与信用扣分</div>
                </div>
              </div>
            </div>
          </section>

          {/* 核心功能模块导航矩阵 (7大终版业务模块) */}
          <section className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-4 bg-blue-600 rounded-sm"></div>
                <h2 className="text-base font-bold text-slate-900">核心功能模块导航矩阵</h2>
                <span className="text-xs text-slate-500">（7大业务域快捷直达）</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* 01 交易管理 */}
              <div 
                onClick={() => onNavigate('order-management')}
                className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 hover:bg-white hover:border-blue-400 cursor-pointer transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 text-sm">交易管理</span>
                  <span className="material-symbols-outlined text-[16px] text-slate-400">arrow_forward</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">卡单流转调度、实时报价、异常监控与售后争议</p>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">卡单管理</span>
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">报价管理</span>
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">交易作业</span>
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">售后争议</span>
                </div>
              </div>

              {/* 02 客户管理 */}
              <div 
                onClick={() => onNavigate('user-management')}
                className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 hover:bg-white hover:border-blue-400 cursor-pointer transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 text-sm">客户管理</span>
                  <span className="material-symbols-outlined text-[16px] text-slate-400">arrow_forward</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">出卡方用户画像与接卡商户履约能力精细化管理</p>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">用户管理 (出卡方)</span>
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">商户管理 (接卡方)</span>
                </div>
              </div>

              {/* 03 增长运营 */}
              <div 
                onClick={() => onNavigate('campaign-promotion')}
                className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 hover:bg-white hover:border-blue-400 cursor-pointer transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 text-sm">增长运营</span>
                  <span className="material-symbols-outlined text-[16px] text-slate-400">arrow_forward</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">渠道分发、推广活动、会员运营与权益工具</p>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">渠道管理</span>
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">推广活动</span>
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">会员权益</span>
                </div>
              </div>

              {/* 04 财务结算 */}
              <div 
                onClick={() => onNavigate('points-transactions')}
                className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 hover:bg-white hover:border-blue-400 cursor-pointer transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 text-sm">财务结算</span>
                  <span className="material-symbols-outlined text-[16px] text-slate-400">arrow_forward</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">账户资产、充值核销、积点流水与四账勾稽</p>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">账户管理</span>
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">充值管理</span>
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">积点流水</span>
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">财务对账</span>
                </div>
              </div>

              {/* 05 经营分析 */}
              <div 
                onClick={() => onNavigate('business-overview')}
                className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 hover:bg-white hover:border-blue-400 cursor-pointer transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 text-sm">经营分析</span>
                  <span className="material-symbols-outlined text-[16px] text-slate-400">arrow_forward</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">经营总览、交易分析、用户画像与商户承揽分析</p>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">经营总览</span>
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">交易分析</span>
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">商户分析</span>
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">财务分析</span>
                </div>
              </div>

              {/* 06 业务配置 */}
              <div 
                onClick={() => onNavigate('card-config')}
                className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 hover:bg-white hover:border-blue-400 cursor-pointer transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 text-sm">业务配置</span>
                  <span className="material-symbols-outlined text-[16px] text-slate-400">arrow_forward</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">卡种面额、交易规则、通知模板与基础汇率</p>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">卡种配置</span>
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">交易规则</span>
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">消息配置</span>
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">基础配置</span>
                </div>
              </div>

              {/* 07 专席工作台 */}
              <div 
                onClick={() => onNavigate('workbench-operations')}
                className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 hover:bg-white hover:border-blue-400 cursor-pointer transition-all shadow-2xs lg:col-span-2"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 text-sm">角色专属工作台</span>
                  <span className="material-symbols-outlined text-[16px] text-slate-400">arrow_forward</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">面向运营、客服、财务三大角色的沉浸式专职作业台</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 bg-white border border-blue-200 text-blue-700 font-medium rounded">运营工作台 (秒级调度)</span>
                  <span className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-800 font-medium rounded">客服工作台 (争议仲裁)</span>
                  <span className="px-2.5 py-1 bg-white border border-amber-200 text-amber-900 font-medium rounded">财务工作台 (流水对账)</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
