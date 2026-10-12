import React, { useState } from 'react';
import { UnifiedTaskItem } from './types';

interface TaskExecutionModalProps {
  task: UnifiedTaskItem | null;
  onClose: () => void;
  onSubmit: (taskId: string, action: string, note: string) => void;
}

export const TaskExecutionModal: React.FC<TaskExecutionModalProps> = ({
  task,
  onClose,
  onSubmit,
}) => {
  if (!task) return null;

  const [actionChoice, setActionChoice] = useState('adopt_recommendation');
  const [customNote, setCustomNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit(
        task.id,
        actionChoice === 'adopt_recommendation' ? '采纳系统建议并自动复核' : '人工自定处理方案',
        customNote || task.systemRecommendation
      );
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="material-symbols-outlined text-amber-400 text-2xl">
              assignment_turned_in
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-white font-bold">
                  {task.id}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                  task.priority === 'P0_URGENT' ? 'bg-rose-500 text-white' :
                  task.priority === 'P1_HIGH' ? 'bg-amber-500 text-white' :
                  'bg-blue-500 text-white'
                }`}>
                  {task.priority}
                </span>
              </div>
              <h3 className="text-base font-bold mt-1">{task.taskType} · {task.businessObject}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* 流转规范提示 */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start space-x-3">
            <span className="material-symbols-outlined text-indigo-600 mt-0.5">account_tree</span>
            <div>
              <div className="font-bold text-indigo-900 text-xs">统一任务中心闭环流转标准 (六十五/六十六条)</div>
              <p className="text-xs text-indigo-700 mt-0.5">
                异常/事件 → 规则判断 → 生成任务(SLA: {task.slaStandardDuration}) → 人工决策 → <strong className="text-indigo-950">自动复核并归档</strong>。
              </p>
            </div>
          </div>

          {/* 系统建议 */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-amber-800 font-bold mb-1.5">
              <span className="material-symbols-outlined text-amber-600 text-base">smart_toy</span>
              <span>智能系统建议与研判策略</span>
            </div>
            <p className="text-xs text-amber-950 leading-relaxed bg-white/80 p-3 rounded-lg border border-amber-200/60 font-medium">
              {task.systemRecommendation}
            </p>
          </div>

          {/* 任务详情表 */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500">来源系统:</span>
              <span className="ml-2 font-semibold text-slate-800">{task.source}</span>
            </div>
            <div>
              <span className="text-slate-500">目标角色:</span>
              <span className="ml-2 font-semibold text-slate-800">
                {task.targetRole === 'customer_service' ? '客服专员 (CS)' :
                 task.targetRole === 'operations' ? '运营主管 (OP)' :
                 task.targetRole === 'finance' ? '财务专责 (FIN)' : '系统管理员'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">SLA 截止:</span>
              <span className={`ml-2 font-mono font-bold ${task.slaRemainingMinutes < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {task.slaDeadline} ({task.slaRemainingMinutes < 0 ? `已超时 ${Math.abs(task.slaRemainingMinutes)}m` : `剩余 ${task.slaRemainingMinutes}m`})
              </span>
            </div>
            <div>
              <span className="text-slate-500">当前负责人:</span>
              <span className="ml-2 font-semibold text-slate-800">{task.assignee}</span>
            </div>
          </div>

          {/* 决策操作 */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">选择处理动作</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-start p-3 rounded-xl border cursor-pointer transition-all ${
                  actionChoice === 'adopt_recommendation' ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:bg-slate-50'
                }`}>
                  <input
                    type="radio"
                    name="actionChoice"
                    checked={actionChoice === 'adopt_recommendation'}
                    onChange={() => setActionChoice('adopt_recommendation')}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="ml-2.5">
                    <div className="text-xs font-bold text-slate-900">采纳系统建议 (一键执行)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">自动触发下游联动并在处理后进入自动复核</div>
                  </div>
                </label>

                <label className={`flex items-start p-3 rounded-xl border cursor-pointer transition-all ${
                  actionChoice === 'custom' ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:bg-slate-50'
                }`}>
                  <input
                    type="radio"
                    name="actionChoice"
                    checked={actionChoice === 'custom'}
                    onChange={() => setActionChoice('custom')}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="ml-2.5">
                    <div className="text-xs font-bold text-slate-900">人工自定义方案</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">手工录入处置结论与争议裁定理由</div>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                处置附言 / 审核批注 <span className="text-slate-400 font-normal">(将被计入操作审计日志)</span>
              </label>
              <textarea
                rows={3}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="请输入详细处置原因、联系用户反馈或资金调账依据..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs hover:shadow transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    <span>正在执行并自动复核...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    <span>确认提交处理</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
