import React, { useState, useEffect } from 'react';

interface PublishConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublished: () => void;
}

export const PublishConfirmModal: React.FC<PublishConfirmModalProps> = ({
  isOpen,
  onClose,
  onPublished,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (step === 2) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep(3);
            return 100;
          }
          return prev + 25;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleStartPublish = () => {
    setStep(2);
    setProgress(10);
  };

  const handleFinish = () => {
    onPublished();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
              <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">发布并全网生效</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                同步至 Kafka Event-Bus 集群与全网 12 节点
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-xs space-y-4">
          {step === 1 && (
            <>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-amber-900">
                <div className="font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-amber-600">
                    warning
                  </span>
                  全网热加载风险提示
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  您即将向生产环境广播发布最新的消息矩阵与模版变量配置。本次发布无需重启容器，将在 42ms 内完成毫秒级无损平滑重载。
                </p>
              </div>

              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">发布目标:</span>
                  <span className="font-semibold text-slate-800">Kafka Event-Bus 16 Partition</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">分布式共识:</span>
                  <span className="font-mono text-emerald-600 font-semibold">12/12 Raft Quorum</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">版本升迁:</span>
                  <span className="font-mono text-blue-600 font-bold">v2.4-STABLE (Hot-Patch)</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleStartPublish}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">publish</span>
                  <span>确认发布广播 (Enter)</span>
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mx-auto"></div>
              <div className="font-bold text-slate-800 text-sm">正在全网热同步消息矩阵...</div>
              <p className="text-slate-500 text-xs">
                正在校验模版变量语法树，并通知 12 处网关重载路由表
              </p>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-2">
                <div
                  className="bg-blue-600 h-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="font-mono text-[11px] text-slate-400">{progress}% 同步中</div>
            </div>
          )}

          {step === 3 && (
            <div className="py-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[28px]">verified</span>
              </div>
              <div className="font-bold text-slate-900 text-sm">全网消息配置广播生效成功！</div>
              <p className="text-slate-600 text-xs">
                Kafka 分区已全部接收最新订阅映射，端到端延迟维持在 42ms 极速区间。
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleFinish}
                  className="w-full py-2 bg-slate-900 hover:bg-black text-white font-semibold rounded-lg shadow-xs cursor-pointer text-xs"
                >
                  完成并返回
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
