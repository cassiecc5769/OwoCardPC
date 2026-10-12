import React, { useState } from 'react';
import { DispatchTaskItem } from '../data/mockOperations';

interface OperationDetailModalProps {
  task: DispatchTaskItem | null;
  isOpen: boolean;
  onClose: () => void;
  onIntervene: (actionName: string, taskId: string) => void;
  onOpenDecisionDesk?: (task: DispatchTaskItem) => void;
}

export const OperationDetailModal: React.FC<OperationDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onIntervene
}) => {
  if (!isOpen || !task) return null;

  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-end animate-fade-in">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-slide-left text-xs text-slate-800">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-blue-600 text-[22px]">troubleshoot</span>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-slate-900 font-mono">{task.orderNo}</span>
                <span className="text-[11px] text-slate-400">实时调度排障链路与详情</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Order Snapshot Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">核对凭证与卡密</span>
              <span className="font-mono text-[11px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                SLA 仅剩 {task.slaDisplay}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-white p-2 rounded-lg border border-slate-200/60">
              <div>
                <span className="text-slate-400 font-sans">卡种品类:</span>{' '}
                <strong className="text-slate-900">{task.brandName}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-sans">申报面额:</span>{' '}
                <strong className="text-blue-600">{task.declaredAmount}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-sans">出卡大户:</span>{' '}
                <span className="text-slate-800 font-sans">{task.userName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-sans">承揽商户:</span>{' '}
                <span className="text-slate-800 font-sans">{task.merchantName}</span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-sans">已脱敏卡密:</span>
                <span className="font-mono text-sm font-bold text-slate-900 tracking-wider select-all">
                  {task.maskedToken}
                </span>
              </div>
              <button
                onClick={() => handleCopy(task.secretToken)}
                className="px-2.5 py-1 bg-slate-100 text-slate-800 font-mono text-xs rounded-lg hover:bg-slate-200 font-medium transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px] text-blue-600">
                  {copied ? 'check' : 'content_copy'}
                </span>
                <span>{copied ? '已复制明文' : '复制卡密'}</span>
              </button>
            </div>
          </div>

          {/* Realtime Life Cycle Chain */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">执行链路回溯</span>
            <div className="space-y-3 pl-2 border-l-2 border-blue-500/30 font-sans">
              {task.timeline.map((step, idx) => (
                <div key={idx} className="relative pl-4">
                  <div
                    className={`absolute -left-[13px] top-1 w-2.5 h-2.5 rounded-full ${
                      step.status === 'success'
                        ? 'bg-emerald-500'
                        : step.status === 'warning'
                        ? 'bg-amber-500 animate-pulse'
                        : 'bg-rose-500 animate-ping'
                    }`}
                  ></div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-400">{step.time}</span>
                    <span
                      className={`font-mono text-[10px] px-1 py-0.2 rounded font-semibold ${
                        step.status === 'success'
                          ? 'bg-emerald-50 text-emerald-700'
                          : step.status === 'warning'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-rose-50 text-rose-800'
                      }`}
                    >
                      {step.badge}
                    </span>
                  </div>
                  <p
                    className={`font-semibold text-xs mt-0.5 ${
                      step.status === 'error' ? 'text-rose-700' : 'text-slate-800'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Manual Action Panel */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2.5">
            <span className="font-semibold text-slate-900 text-xs">执行调度干预决定 ()</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onIntervene('提价 0.5% 全网重播', task.id)}
                className="p-2.5 bg-white hover:bg-blue-50 border border-slate-200 text-slate-800 rounded-lg text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-xs text-blue-700">1. 提价 0.5% 全网重播</div>
                <span className="block font-mono text-[10px] text-slate-400 font-normal mt-0.5">提升商户撮合优先级</span>
              </button>

              <button
                onClick={() => onIntervene('强制指定自营通道', task.id)}
                className="p-2.5 bg-white hover:bg-emerald-50 border border-slate-200 text-slate-800 rounded-lg text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-xs text-emerald-700">2. 拔单转自营收卡池</div>
                <span className="block font-mono text-[10px] text-slate-400 font-normal mt-0.5">毫秒级锁定并接管</span>
              </button>

              <button
                onClick={() => onIntervene('分流到人工核验岗', task.id)}
                className="p-2.5 bg-white hover:bg-indigo-50 border border-slate-200 text-slate-800 rounded-lg text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-xs text-indigo-700">3. 分流到人工核验岗</div>
                <span className="block font-mono text-[10px] text-slate-400 font-normal mt-0.5">人工登录 iTunes 校验</span>
              </button>

              <button
                onClick={() => onIntervene('争议退卡', task.id)}
                className="p-2.5 bg-white hover:bg-rose-50 border border-slate-200 text-slate-800 rounded-lg text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-xs text-rose-700">4. 标记为商户欺诈驳回</div>
                <span className="block font-mono text-[10px] text-slate-400 font-normal mt-0.5">罚没商户保证积点</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between mt-4">
          <span className="font-mono text-[11px] text-slate-400">OPERATOR: #OP-8821</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
          >
            完成调度并关闭
          </button>
        </div>
      </div>
    </div>
  );
};
