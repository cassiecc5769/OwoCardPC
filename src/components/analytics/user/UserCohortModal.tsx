import React from 'react';
import { UserMultiDimensionalRow } from './userMultiDimensionalData';

interface UserCohortModalProps {
  isOpen: boolean;
  onClose: () => void;
  row: UserMultiDimensionalRow | null;
  onShowToast: (msg: string) => void;
}

export const UserCohortModal: React.FC<UserCohortModalProps> = ({
  isOpen,
  onClose,
  row,
  onShowToast,
}) => {
  if (!isOpen || !row) return null;

  // 模拟该维度的同期群留存趋势（D1, D3, D7, D14, D30, D60, D90）
  const baseRate = row.repeatRate30d;
  const d1 = Math.min(95, Math.round(baseRate * 1.18));
  const d3 = Math.min(90, Math.round(baseRate * 1.12));
  const d7 = Math.min(85, Math.round(baseRate * 1.06));
  const d14 = Math.min(80, Math.round(baseRate * 1.02));
  const d30 = Math.round(baseRate);
  const d60 = Math.max(15, Math.round(baseRate * 0.88));
  const d90 = Math.max(10, Math.round(baseRate * 0.76));

  const periods = [
    { label: '次日留存 (D1)', rate: d1, benchmark: '78.5%' },
    { label: '3日留存 (D3)', rate: d3, benchmark: '72.0%' },
    { label: '7日留存 (D7)', rate: d7, benchmark: '64.5%' },
    { label: '14日留存 (D14)', rate: d14, benchmark: '58.0%' },
    { label: '30日留存 (D30)', rate: d30, benchmark: '52.0%' },
    { label: '60日留存 (D60)', rate: d60, benchmark: '44.0%' },
    { label: '90日留存 (D90)', rate: d90, benchmark: '38.0%' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-surface-container-low/80 border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${row.iconBg} ${row.iconColor}`}
            >
              <span className="material-symbols-outlined text-[18px]">{row.icon}</span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                  Cohort 同期群复购留存衰减 · {row.name}
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-code-token bg-surface-container text-primary">
                  {row.code}
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                基于首单出卡时间戳切片，追踪观察周期内真实交易持续复购衰减曲线
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-container text-outline hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Key stats banner */}
          <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-surface-container-low/60 border border-outline-variant/20 text-xs">
            <div>
              <span className="text-outline block text-[11px]">首单破冰样本</span>
              <span className="font-numeric-stat text-sm font-bold text-on-surface">
                {row.firstOrderUsers.toLocaleString()} 人
              </span>
            </div>
            <div>
              <span className="text-outline block text-[11px]">30日真实复购</span>
              <div className="flex items-baseline gap-1">
                <span className={`font-numeric-stat text-sm font-bold ${row.retentionColorClass}`}>
                  {row.repeatRate30d}%
                </span>
                <span className="text-[10px] text-outline">({row.retentionEvaluation})</span>
              </div>
            </div>
            <div>
              <span className="text-outline block text-[11px]">90日累积毛利贡献</span>
              <span className="font-numeric-stat text-sm font-bold text-secondary">
                +${row.grossProfit90d.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Retention periods visual progress */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-on-surface flex items-center justify-between">
              <span>周期留存走势对比 (本渠道 vs 全网大盘均值)</span>
              <span className="text-[11px] font-normal text-outline">基准周期: 2026-08</span>
            </h4>

            <div className="space-y-2">
              {periods.map((item, idx) => {
                const isExcellent = item.rate >= 70;
                const isPoor = item.rate < 40;
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-on-surface">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-outline font-numeric-table">
                          大盘基线: {item.benchmark}
                        </span>
                        <span
                          className={`font-numeric-table font-bold ${
                            isExcellent ? 'text-secondary' : isPoor ? 'text-error' : 'text-primary'
                          }`}
                        >
                          {item.rate}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isExcellent ? 'bg-secondary' : isPoor ? 'bg-error' : 'bg-primary'
                        }`}
                        style={{ width: `${item.rate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-surface-container-low/40 border-t border-outline-variant/20 flex items-center justify-between">
          <button
            onClick={() => {
              onShowToast(`已将 [${row.name}] Cohort 衰减模型推演报告导出为 CSV`);
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg bg-surface border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container text-xs transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">download</span>
            <span>导出同期群数据</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-primary text-on-primary hover:bg-primary/90 text-xs font-medium rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            完成查看
          </button>
        </div>
      </div>
    </div>
  );
};
