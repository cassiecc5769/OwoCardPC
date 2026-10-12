import React, { useState } from 'react';

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

  const [isPublishing, setIsPublishing] = useState(false);
  const [step, setStep] = useState<number>(0);

  const handlePublish = () => {
    setIsPublishing(true);
    setStep(1); // Packaging
    setTimeout(() => {
      setStep(2); // Raft quorum
      setTimeout(() => {
        setStep(3); // Redis broadcast
        setTimeout(() => {
          setIsPublishing(false);
          onPublished();
          onClose();
        }, 600);
      }, 600);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
              <span className="material-symbols-outlined text-[20px]">publish</span>
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">发布并全网广播生效</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                通过分布式 Raft 共识协议热加载至 12 处撮合计算节点
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

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">目标版本:</span>
              <span className="font-mono font-bold text-blue-700">v2.4-STABLE (Hot Reload)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">在线撮合节点:</span>
              <span className="font-mono text-emerald-600 font-semibold">
                12 / 12 节点全部在线
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">预计全网传播延迟:</span>
              <span className="font-mono text-slate-800 font-bold">≤ 20ms (无感切换)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">历史快照留痕:</span>
              <span className="font-mono text-slate-700">自动写入区块链存证哈希</span>
            </div>
          </div>

          {/* Progress bar during publish */}
          {isPublishing && (
            <div className="p-4 bg-slate-900 rounded-xl text-white text-xs space-y-2 font-mono">
              <div className="flex items-center justify-between">
                <span>
                  {step === 1 && '1. 规则语法与安全隔离沙盒校验...'}
                  {step === 2 && '2. 提交 Raft 集群多数派共识表决...'}
                  {step === 3 && '3. 分布式 Redis 广播与全网热挂载...'}
                </span>
                <span className="text-emerald-400">{step * 33}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${step * 33.3}%` }}
                ></div>
              </div>
            </div>
          )}

          <p className="text-xs text-slate-500 leading-relaxed">
            点击确认后，新规则将立即对所有新进入流水线的卡密及撮合订单生效；正在验卡作业中的历史在途订单不受影响，以接单时刻的快照为准。
          </p>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={isPublishing}
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer disabled:opacity-50"
            >
              取消
            </button>
            <button
              type="button"
              disabled={isPublishing}
              onClick={handlePublish}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isPublishing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  <span>全网广播中...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  <span>确认发布全网生效 (Enter)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
