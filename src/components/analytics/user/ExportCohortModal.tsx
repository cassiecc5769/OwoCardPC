import React, { useState } from 'react';

interface ExportCohortModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeRangeLabel: string;
}

export const ExportCohortModal: React.FC<ExportCohortModalProps> = ({
  isOpen,
  onClose,
  timeRangeLabel,
}) => {
  const [format, setFormat] = useState<'xlsx' | 'csv' | 'json'>('xlsx');
  const [metricScope, setMetricScope] = useState<'all' | 'retention_only' | 'ltv_only'>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        onClose();
      }, 900);
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 w-full max-w-lg overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined text-[20px]">download</span>
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">导出 Cohort 留存模型数据表</h3>
              <p className="text-[11px] text-slate-500">
                以自然月首单激活分组 · 包含 +1 至 +5 月热力梯度及累积 LTV
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
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
            <div className="flex justify-between items-center text-[11.5px]">
              <span className="text-slate-500">当前筛选周期:</span>
              <span className="font-semibold text-slate-900">{timeRangeLabel}</span>
            </div>
            <div className="flex justify-between items-center text-[11.5px]">
              <span className="text-slate-500">统计口径:</span>
              <span className="font-code-token text-slate-700 font-medium">
                首单 ≥$50 USD 有效核销出卡用户
              </span>
            </div>
            <div className="flex justify-between items-center text-[11.5px]">
              <span className="text-slate-500">同期群批次数:</span>
              <span className="font-semibold text-blue-700 font-numeric-stat">
                6 个历史月度批次 (2026-03 ~ 2026-08)
              </span>
            </div>
          </div>

          {/* 指标颗粒度选择 */}
          <div>
            <label className="font-semibold text-slate-900 block mb-1.5">选择导出数据颗粒度</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMetricScope('all')}
                className={`py-2 px-3 rounded-lg border text-center font-medium transition-all cursor-pointer ${
                  metricScope === 'all'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-semibold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                全维度全量指标
              </button>
              <button
                type="button"
                onClick={() => setMetricScope('retention_only')}
                className={`py-2 px-3 rounded-lg border text-center font-medium transition-all cursor-pointer ${
                  metricScope === 'retention_only'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-semibold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                仅留存率热力表
              </button>
              <button
                type="button"
                onClick={() => setMetricScope('ltv_only')}
                className={`py-2 px-3 rounded-lg border text-center font-medium transition-all cursor-pointer ${
                  metricScope === 'ltv_only'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-semibold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                仅累计单客 LTV
              </button>
            </div>
          </div>

          {/* 文件格式选择 */}
          <div>
            <label className="font-semibold text-slate-900 block mb-1.5">导出文件格式</label>
            <div className="grid grid-cols-3 gap-2.5">
              <label
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                  format === 'xlsx'
                    ? 'border-blue-600 bg-blue-50/40 text-blue-700 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value="xlsx"
                  checked={format === 'xlsx'}
                  onChange={() => setFormat('xlsx')}
                  className="text-blue-600"
                />
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                  table_view
                </span>
                <span>Excel (.xlsx)</span>
              </label>

              <label
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                  format === 'csv'
                    ? 'border-blue-600 bg-blue-50/40 text-blue-700 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={() => setFormat('csv')}
                  className="text-blue-600"
                />
                <span className="material-symbols-outlined text-blue-600 text-[18px]">
                  description
                </span>
                <span>CSV (.csv)</span>
              </label>

              <label
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                  format === 'json'
                    ? 'border-blue-600 bg-blue-50/40 text-blue-700 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={format === 'json'}
                  onChange={() => setFormat('json')}
                  className="text-blue-600"
                />
                <span className="material-symbols-outlined text-purple-600 text-[18px]">data_object</span>
                <span>JSON 原始数据</span>
              </label>
            </div>
          </div>

          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-2 text-xs animate-fadeIn">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                check_circle
              </span>
              <span>报表已成功生成并推送到下载序列 (Cohort_Matrix_202608.xlsx)！</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium cursor-pointer"
          >
            取消
          </button>
          <button
            disabled={isExporting}
            onClick={handleExport}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
          >
            {isExporting ? (
              <>
                <span className="material-symbols-outlined text-[15px] animate-spin">refresh</span>
                <span>正在生成并导出...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[15px]">download</span>
                <span>确认下载模型报表</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
