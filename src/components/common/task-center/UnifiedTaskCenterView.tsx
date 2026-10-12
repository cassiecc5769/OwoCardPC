import React, { useState, useMemo } from 'react';
import { UserRole, NavPath } from '../../../types';
import { UnifiedExceptionItem, UnifiedTaskItem, TaskStatus, TaskPriority } from './types';
import { INITIAL_UNIFIED_EXCEPTIONS, INITIAL_UNIFIED_TASKS } from './mockData';
import { TaskExecutionModal } from './TaskExecutionModal';

interface UnifiedTaskCenterViewProps {
  currentRole?: UserRole;
  onNavigate?: (path: NavPath) => void;
  filterRole?: UserRole | 'all';
}

export const UnifiedTaskCenterView: React.FC<UnifiedTaskCenterViewProps> = ({
  currentRole = 'operations',
  onNavigate,
  filterRole: initialFilterRole = 'all',
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'exceptions' | 'flow'>('tasks');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>(initialFilterRole);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [tasks, setTasks] = useState<UnifiedTaskItem[]>(INITIAL_UNIFIED_TASKS);
  const [exceptions, setExceptions] = useState<UnifiedExceptionItem[]>(INITIAL_UNIFIED_EXCEPTIONS);
  const [selectedTask, setSelectedTask] = useState<UnifiedTaskItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (roleFilter !== 'all' && t.targetRole !== roleFilter) return false;
      if (statusFilter !== 'all') {
        if (statusFilter === 'pending_processing' && t.status !== 'pending' && t.status !== 'processing') return false;
        if (statusFilter === 'verifying' && t.status !== 'verifying') return false;
        if (statusFilter === 'completed' && t.status !== 'completed') return false;
        if (statusFilter === 'abnormal' && t.status !== 'timeout' && t.status !== 'closed' && t.status !== 'escalated') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          t.id.toLowerCase().includes(q) ||
          t.businessObject.toLowerCase().includes(q) ||
          t.taskType.toLowerCase().includes(q) ||
          t.assignee.toLowerCase().includes(q) ||
          t.systemRecommendation.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tasks, roleFilter, statusFilter, searchQuery]);

  // Handle task submission
  const handleTaskSubmit = (taskId: string, action: string, note: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'verifying',
            processResult: `${action}：${note}`,
            verificationResult: '自动复核通过: 数据状态一致，任务已闭环',
            updatedTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
          };
        }
        return t;
      })
    );
    setSelectedTask(null);
    showToast(`任务 [${taskId}] 已提交并进入自动复核流程！`);
  };

  // KPI calculations
  const kpis = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === 'pending' || t.status === 'processing').length;
    const verifying = tasks.filter((t) => t.status === 'verifying').length;
    const timeout = tasks.filter((t) => t.status === 'timeout' || t.slaRemainingMinutes < 0).length;
    const autoResolved = exceptions.filter((e) => e.status === 'auto_resolved').length;
    return { total, pending, verifying, timeout, autoResolved };
  }, [tasks, exceptions]);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl text-xs flex items-center space-x-2 border border-slate-700 animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / Philosophy Deck */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5">
              <span className="inline-flex items-center justify-center p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
                <span className="material-symbols-outlined text-xl">hub</span>
              </span>
              <span className="text-xs font-mono tracking-wider text-indigo-300 font-bold uppercase">
                Enterprise Unified Task & Exception Center (六十四~六十六条)
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              统一任务与异常中心
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              底层通用公共能力：<strong className="text-amber-300">“不是所有异常都需要人”</strong>。异常事件由规则前置判断，能自动处理的自动闭环；需人工介入的自动分流至客服、运营、财务角色视图，经 <strong className="text-emerald-300">SLA 驱动处理与自动复核</strong>。
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-4 gap-3 bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10 text-center">
            <div className="px-2">
              <div className="text-[11px] text-slate-400">待办/处理中</div>
              <div className="text-lg font-bold font-mono text-amber-400">{kpis.pending}</div>
            </div>
            <div className="px-2 border-l border-white/10">
              <div className="text-[11px] text-slate-400">待自动复核</div>
              <div className="text-lg font-bold font-mono text-cyan-400">{kpis.verifying}</div>
            </div>
            <div className="px-2 border-l border-white/10">
              <div className="text-[11px] text-slate-400">SLA超时告警</div>
              <div className="text-lg font-bold font-mono text-rose-400">{kpis.timeout}</div>
            </div>
            <div className="px-2 border-l border-white/10">
              <div className="text-[11px] text-slate-400">自动闭环消解</div>
              <div className="text-lg font-bold font-mono text-emerald-400">{kpis.autoResolved}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs - Standard Image Tab Bar Style */}
      <section className="bg-white rounded-xl border border-slate-200/90 shadow-2xs px-2 pt-2 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'tasks', label: '统一任务工单池', badge: `${tasks.length} 项`, icon: 'assignment' },
            { id: 'exceptions', label: '统一异常中心监控', badge: `${exceptions.length} 项`, icon: 'warning' },
            { id: 'flow', label: '自动化决策与流转架构图', badge: '规则引擎', icon: 'schema' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
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

        {activeTab === 'tasks' && (
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                roleFilter === 'all' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              全部角色
            </button>
            <button
              onClick={() => setRoleFilter('customer_service')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                roleFilter === 'customer_service' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              客服视图
            </button>
            <button
              onClick={() => setRoleFilter('operations')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                roleFilter === 'operations' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              运营视图
            </button>
            <button
              onClick={() => setRoleFilter('finance')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                roleFilter === 'finance' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              财务视图
            </button>
          </div>
        )}
      </section>

      {/* Tab 1: 统一任务池 */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
                <input
                  type="text"
                  placeholder="搜索 Task ID、业务对象、任务类型或智能建议..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 font-medium"
              >
                <option value="all">所有状态 (待处理/处理中/待复核/完成)</option>
                <option value="pending_processing">待处理 / 处理中</option>
                <option value="verifying">待自动复核</option>
                <option value="abnormal">异常状态 (已超时/已关闭/已升级)</option>
              </select>
            </div>

            <div className="text-xs text-slate-500">
              共筛选出 <strong className="text-slate-900 font-mono">{filteredTasks.length}</strong> 条统一工单
            </div>
          </div>

          {/* Task Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Task ID / 来源</th>
                    <th className="px-4 py-3">业务对象 / 任务类型</th>
                    <th className="px-4 py-3">角色 & 负责人</th>
                    <th className="px-4 py-3">优先级 & SLA时限</th>
                    <th className="px-4 py-3">智能系统建议</th>
                    <th className="px-4 py-3">状态 & 复核</th>
                    <th className="px-4 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">inbox</span>
                        <p>暂无符合筛选条件的统一任务</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-mono font-bold text-indigo-950">{task.id}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{task.source}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{task.taskType}</div>
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5">{task.businessObject}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            task.targetRole === 'customer_service' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            task.targetRole === 'operations' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            task.targetRole === 'finance' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {task.targetRole === 'customer_service' ? '客服视图' :
                             task.targetRole === 'operations' ? '运营视图' :
                             task.targetRole === 'finance' ? '财务视图' : '系统管理'}
                          </span>
                          <div className="text-[11px] text-slate-600 mt-1">{task.assignee}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                              task.priority === 'P0_URGENT' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              task.priority === 'P1_HIGH' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              {task.priority}
                            </span>
                            <span className={`font-mono text-[11px] font-bold ${task.slaRemainingMinutes < 0 ? 'text-rose-600 animate-pulse' : 'text-slate-700'}`}>
                              {task.slaRemainingMinutes < 0 ? `已超时 ${Math.abs(task.slaRemainingMinutes)}m` : `剩余 ${task.slaRemainingMinutes}m`}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{task.slaStandardDuration}</div>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <p className="text-[11px] text-slate-700 bg-amber-50/50 p-2 rounded-lg border border-amber-200/50 leading-relaxed truncate" title={task.systemRecommendation}>
                            💡 {task.systemRecommendation}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            task.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            task.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            task.status === 'verifying' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            task.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            task.status === 'timeout' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {task.status === 'pending' ? '待处理' :
                             task.status === 'processing' ? '处理中' :
                             task.status === 'verifying' ? '待自动复核' :
                             task.status === 'completed' ? '已完成' :
                             task.status === 'timeout' ? '已超时' : task.status}
                          </span>
                          {task.verificationResult && (
                            <div className="text-[10px] text-emerald-600 mt-1 font-medium truncate max-w-[120px]" title={task.verificationResult}>
                              ✓ {task.verificationResult}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setSelectedTask(task)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer"
                          >
                            处理任务
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 统一异常中心 */}
      {activeTab === 'exceptions' && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              <span className="material-symbols-outlined text-amber-400">shield_lock</span>
              <div>
                <span className="font-bold text-amber-300">底层公共异常池 (六十四条规范)</span>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  统一接入：卡单异常 ｜ 商户异常 ｜ 报价异常 ｜ 推广转入异常 ｜ 财务异常 ｜ 系统异常
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-white/10 rounded-lg text-slate-200 font-mono">
              全域监听中 (Active)
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Exception ID</th>
                  <th className="px-4 py-3">来源系统 & 业务对象</th>
                  <th className="px-4 py-3">异常类型 & 根因</th>
                  <th className="px-4 py-3">严重等级</th>
                  <th className="px-4 py-3">首次/最后发生时间</th>
                  <th className="px-4 py-3">处理方式 & 状态</th>
                  <th className="px-4 py-3 text-right">派发工单</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exceptions.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {exp.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{exp.sourceSystem}</div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">{exp.businessObject}</div>
                    </td>
                    <td className="px-4 py-3 max-w-sm">
                      <div className="font-bold text-slate-800">{exp.exceptionType}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{exp.rootCauseDesc}</div>
                      {exp.autoProcessResult && (
                        <div className="text-[10px] text-emerald-700 bg-emerald-50 p-1.5 rounded mt-1 border border-emerald-200">
                          {exp.autoProcessResult}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        exp.severity === 'P0_FATAL' ? 'bg-rose-600 text-white' :
                        exp.severity === 'P1_SEVERE' ? 'bg-rose-100 text-rose-700' :
                        exp.severity === 'P2_MEDIUM' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {exp.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                      <div>首发: {exp.firstDiscoveredTime}</div>
                      <div>最后: {exp.lastOccurredTime}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-700">
                        {exp.handlingType === 'auto_process' ? '🤖 规则自动处理' :
                         exp.handlingType === 'dispatch_task' ? '👤 派发人工任务' : '⚠️ 规则升级'}
                      </div>
                      <span className={`inline-block px-1.5 py-0.2 text-[10px] font-bold rounded mt-1 ${
                        exp.status === 'auto_resolved' ? 'bg-emerald-100 text-emerald-800' :
                        exp.status === 'task_generated' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {exp.status === 'auto_resolved' ? '已自动消除' :
                         exp.status === 'task_generated' ? '已生成任务' : exp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {exp.generatedTaskId ? (
                        <span className="font-mono text-xs text-indigo-600 font-bold">
                          {exp.generatedTaskId}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">无需工单</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: 流转架构图 */}
      {activeTab === 'flow' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center space-x-2">
            <span className="material-symbols-outlined text-indigo-600">account_tree</span>
            <span>统一任务与异常中心标准流转机制 (六十五条 / 六十六条)</span>
          </h3>

          <div className="max-w-4xl mx-auto bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-6">
            <div className="flex items-center justify-between text-center gap-4">
              <div className="flex-1 bg-white p-4 rounded-xl border border-slate-300 shadow-xs">
                <div className="text-xs font-bold text-slate-900">1. 异常 / 业务事件</div>
                <div className="text-[11px] text-slate-500 mt-1">风控、报价、核心、网关、推广</div>
              </div>
              <span className="material-symbols-outlined text-slate-400">arrow_forward</span>
              <div className="flex-1 bg-indigo-50 p-4 rounded-xl border border-indigo-200 shadow-xs">
                <div className="text-xs font-bold text-indigo-950">2. 规则决策中枢</div>
                <div className="text-[11px] text-indigo-700 mt-1">能自动处理？判断判定树</div>
              </div>
              <span className="material-symbols-outlined text-slate-400">arrow_forward</span>
              <div className="flex-1 bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-xs">
                <div className="text-xs font-bold text-amber-950">3. 角色分流 & SLA</div>
                <div className="text-[11px] text-amber-800 mt-1">客服 / 运营 / 财务 视图</div>
              </div>
              <span className="material-symbols-outlined text-slate-400">arrow_forward</span>
              <div className="flex-1 bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-xs">
                <div className="text-xs font-bold text-emerald-950">4. 自动复核与完成</div>
                <div className="text-[11px] text-emerald-800 mt-1">待验证 → 已完成 闭环</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-xs">
              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200">
                <div className="font-bold text-blue-900 mb-1">🎧 客服工作台视图</div>
                <p className="text-slate-600 text-[11px]">
                  异常卡人工核验、用户争议仲裁、商户转单客服确认。
                </p>
              </div>
              <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-200">
                <div className="font-bold text-purple-900 mb-1">📈 运营工作台视图</div>
                <p className="text-slate-600 text-[11px]">
                  报价异常调优、渠道转化骤降排查、商户承接能力调配。
                </p>
              </div>
              <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
                <div className="font-bold text-emerald-900 mb-1">💰 财务工作台视图</div>
                <p className="text-slate-600 text-[11px]">
                  三账差异对账单修复、转单损失/挂账调账审批。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Execution Modal */}
      {selectedTask && (
        <TaskExecutionModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSubmit={handleTaskSubmit}
        />
      )}
    </div>
  );
};
