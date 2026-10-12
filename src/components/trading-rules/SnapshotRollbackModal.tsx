import React, { useState } from 'react';
import { SnapshotVersion } from './types';

interface SnapshotRollbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  versions: SnapshotVersion[];
  onRollback: (version: SnapshotVersion) => void;
}

export const SnapshotRollbackModal: React.FC<SnapshotRollbackModalProps> = ({
  isOpen,
  onClose,
  versions,
  onRollback,
}) => {
  if (!isOpen) return null;

  const [selectedVersion, setSelectedVersion] = useState<SnapshotVersion>(versions[0]);
  const [confirmingRollback, setConfirmingRollback] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600">
              <span className="material-symbols-outlined text-[20px]">history</span>
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                规则版本演进与全量回溯快照
                <span className="font-mono text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded font-semibold">
                  SHA-256 存证链
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                支持追溯任意历史时刻的规则全景状态，毫秒级还原历史卡单在当时的撮合判定依据
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
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left list of versions */}
          <div className="md:col-span-5 space-y-2 border-r border-slate-100 pr-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              全网快照归档 ({versions.length})
            </div>
            {versions.map((ver) => {
              const isSelected = selectedVersion.version === ver.version;
              return (
                <div
                  key={ver.version}
                  onClick={() => {
                    setSelectedVersion(ver);
                    setConfirmingRollback(false);
                  }}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {ver.version}
                    </span>
                    {ver.isCurrent ? (
                      <span className="font-mono text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded font-semibold">
                        当前运行中
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded">
                        已封存
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                    {ver.description}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>{ver.releaseDate}</span>
                    <span>{ver.ruleCount} 项规则</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right snapshot details */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  快照元数据详细
                </span>
                <span className="font-mono text-xs text-blue-600 font-bold">
                  {selectedVersion.version}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">归档哈希指纹:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedVersion.hash}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">全网生效时刻:</span>
                  <span className="font-mono text-slate-700">
                    {selectedVersion.releaseDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">经办负责人:</span>
                  <span className="font-medium text-slate-800">
                    {selectedVersion.operator}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">共识节点确认:</span>
                  <span className="font-mono text-emerald-600 font-semibold">
                    12 / 12 Raft 节点全量同步
                  </span>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-700 mb-1.5">版本描述</div>
                <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                  {selectedVersion.description}
                </p>
              </div>

              <div className="p-3.5 bg-blue-50/70 border border-blue-200/70 rounded-xl text-xs text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>回溯沙盒核验支持</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  系统支持将争议订单带入该快照版本进行仿真沙盒演算，自动判定在当时的规则体系下该订单是否应该被阻断或熔断。
                </p>
              </div>
            </div>

            {/* Rollback actions */}
            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                状态: {selectedVersion.isCurrent ? '当前运行版本' : '历史安全快照'}
              </span>

              {selectedVersion.isCurrent ? (
                <button
                  disabled
                  className="px-4 py-2 text-xs font-semibold text-slate-400 bg-slate-100 rounded-lg cursor-not-allowed"
                >
                  当前已是此版本
                </button>
              ) : confirmingRollback ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConfirmingRollback(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => onRollback(selectedVersion)}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                    确认全网回滚至 {selectedVersion.version}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingRollback(true)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">history</span>
                  准备回溯并覆盖生效
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
