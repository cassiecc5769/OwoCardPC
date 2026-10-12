import React, { useState } from 'react';
import { AnomalyItem } from './types';
import { NavPath } from '../../../types';

interface AnomalyResolutionModalProps {
  anomaly: AnomalyItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (path: NavPath) => void;
  onResolveAnomaly: (id: string) => void;
}

export const AnomalyResolutionModal: React.FC<AnomalyResolutionModalProps> = ({
  anomaly,
  isOpen,
  onClose,
  onNavigate,
  onResolveAnomaly,
}) => {
  const [executing, setExecuting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !anomaly) return null;

  const handleApplyRemedy = () => {
    setExecuting(true);
    setTimeout(() => {
      setExecuting(false);
      setSuccessMsg(`已成功执行系统推荐策略：【${anomaly.recommendedAction}】。监控日志已同步至审计网关。`);
      onResolveAnomaly(anomaly.id);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1600);
    }, 1000);
  };

  const handleDrilldown = () => {
    onClose();
    if (onNavigate) {
      onNavigate(anomaly.targetPath);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-xs ${
                anomaly.category === '成功率预警' || anomaly.category === '成本波动'
                  ? 'bg-rose-50 text-rose-600'
                  : anomaly.category === '供给缺口'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'bg-amber-50 text-amber-600'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">troubleshoot</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-slate-900 flex items-center gap-2">
                <span>业务异常智能诊断与处置</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                  {anomaly.category}
                </span>
              </h3>
              <p className="font-code-token text-xs text-slate-500 mt-0.5">
                INCIDENT ID: {anomaly.id} · {anomaly.timestamp}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Anomaly Title */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-xs font-semibold text-slate-900 leading-snug">{anomaly.title}</div>
            <p className="text-slate-500 mt-1.5 leading-relaxed">{anomaly.description}</p>
          </div>

          {/* Diagnostic Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-slate-200/80 bg-white">
              <span className="text-slate-400 font-label-caps text-[10.5px] uppercase font-semibold">
                偏离严重度与波动
              </span>
              <div className="text-sm font-bold font-numeric-stat text-rose-600 mt-1">
                {anomaly.deltaMetric}
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">触发 14 天平滑均线预警</span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200/80 bg-white">
              <span className="text-slate-400 font-label-caps text-[10.5px] uppercase font-semibold">
                预计影响规模
              </span>
              <div className="text-sm font-bold font-numeric-stat text-slate-900 mt-1">
                {anomaly.impactValue}
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">平台调度器已建立保护屏障</span>
            </div>
          </div>

          {/* Recommended automated action */}
          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/60 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-blue-600 text-[18px] shrink-0 mt-0.5">
              auto_fix_high
            </span>
            <div className="flex-1">
              <div className="font-semibold text-blue-900 text-xs">系统推荐的一键处置对策</div>
              <p className="text-blue-800 text-[11.5px] mt-0.5 leading-relaxed">
                {anomaly.recommendedAction}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handleDrilldown}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-blue-600 border border-blue-200 rounded-lg font-medium transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
          >
            <span>下钻至{anomaly.targetModuleText}</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-lg font-medium transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleApplyRemedy}
              disabled={executing || !!anomaly.isResolved}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              {executing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>执行中...</span>
                </>
              ) : anomaly.isResolved ? (
                <>
                  <span className="material-symbols-outlined text-[15px]">check</span>
                  <span>已处置生效</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[15px]">bolt</span>
                  <span>立即执行处置</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
