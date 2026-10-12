import React from 'react';
import { CohortMatrixRow } from './types';

interface CohortDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  cohort: CohortMatrixRow | null;
}

export const CohortDetailModal: React.FC<CohortDetailModalProps> = ({
  isOpen,
  onClose,
  cohort,
}) => {
  if (!isOpen || !cohort) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 w-full max-w-lg overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined text-[20px]">calendar_view_month</span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  {cohort.cohortMonth} 同期群深度流转画像
                </h3>
                {cohort.isCurrentMonth && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-blue-100 text-blue-700 font-semibold">
                    当前跟踪中
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                该月首笔破冰出卡用户全周期价值及留存衰减轨迹
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          {/* 基础大盘三栏 */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[11px] block">首月有效出卡客</span>
              <span className="font-numeric-stat text-base font-bold text-slate-900 mt-0.5 block">
                {cohort.initialUsers.toLocaleString()} 人
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[11px] block">累计单客 LTV</span>
              <span className="font-numeric-stat text-base font-bold text-blue-700 mt-0.5 block">
                ${cohort.cumulativeLtvUsd.toFixed(2)}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[11px] block">首单均值面额</span>
              <span className="font-numeric-stat text-base font-bold text-emerald-700 mt-0.5 block">
                ${cohort.avgFirstOrderDenomination || 150} USD
              </span>
            </div>
          </div>

          {/* 留存各月衰减热力条 */}
          <div className="space-y-2">
            <span className="font-semibold text-slate-900 block">各月留存衰减热力阶梯</span>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-center font-numeric-stat">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 block">+1个月</span>
                <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-xs inline-block">
                  {cohort.m1}
                </span>
              </div>
              <span className="text-slate-300">→</span>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 block">+2个月</span>
                <span className="px-2 py-0.5 rounded bg-blue-400 text-white font-semibold text-xs inline-block">
                  {cohort.m2}
                </span>
              </div>
              <span className="text-slate-300">→</span>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 block">+3个月</span>
                <span className="px-2 py-0.5 rounded bg-blue-200 text-slate-900 font-semibold text-xs inline-block">
                  {cohort.m3}
                </span>
              </div>
              <span className="text-slate-300">→</span>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 block">+4个月</span>
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-xs inline-block">
                  {cohort.m4}
                </span>
              </div>
              <span className="text-slate-300">→</span>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 block">+5个月</span>
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-xs inline-block">
                  {cohort.m5}
                </span>
              </div>
            </div>
          </div>

          {/* 出卡偏好与流失观察 */}
          <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-100 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">主导出卡卡种品类:</span>
              <span className="font-semibold text-slate-900">
                {cohort.dominantCardBrand || 'Apple Store / Steam'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">流失与复购特征:</span>
              <span className="font-semibold text-blue-700">
                {cohort.churnMainPhase || '流失进入长效平稳期'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium cursor-pointer shadow-xs"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};
