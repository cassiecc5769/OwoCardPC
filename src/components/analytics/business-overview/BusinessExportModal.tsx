import React, { useState } from 'react';

interface BusinessExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeRangeLabel: string;
}

export const BusinessExportModal: React.FC<BusinessExportModalProps> = ({
  isOpen,
  onClose,
  timeRangeLabel,
}) => {
  const [format, setFormat] = useState<'xlsx' | 'csv' | 'json'>('xlsx');
  const [includeHourly, setIncludeHourly] = useState(true);
  const [includeAttribution, setIncludeAttribution] = useState(true);
  const [includeAnomalies, setIncludeAnomalies] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleStartExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        onClose();
      }, 1500);
    }, 1100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">file_download</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-slate-900">
                导出平台经营全盘数据报表
              </h3>
              <p className="font-code-token text-xs text-slate-500 mt-0.5">
                EXECUTIVE ANALYTICS DATA EXPORT · {timeRangeLabel}
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

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
              <span>已成功生成并导出经营分析报表【CardOps_Business_Overview.{format}】！</span>
            </div>
          )}

          {/* Format selection */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-700 block">选择报表格式</label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setFormat('xlsx')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  format === 'xlsx'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-900 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600">
                    table_view
                  </span>
                  <span className="font-semibold text-xs">Excel (.xlsx)</span>
                </div>
                <span className="text-[10.5px] text-slate-500">含图表与公式</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  format === 'csv'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-900 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-blue-600">
                    table_chart
                  </span>
                  <span className="font-semibold text-xs">标准 CSV</span>
                </div>
                <span className="text-[10.5px] text-slate-500">通用数据导入</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  format === 'json'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-900 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-indigo-600">code</span>
                  <span className="font-semibold text-xs">JSON 原始流</span>
                </div>
                <span className="text-[10.5px] text-slate-500">程序接口透传</span>
              </button>
            </div>
          </div>

          {/* Scope Checkboxes */}
          <div className="space-y-2.5 pt-1">
            <span className="font-semibold text-slate-700 block">包含的数据子集</span>
            <label className="flex items-center gap-2.5 text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeHourly}
                onChange={(e) => setIncludeHourly(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span>包含 24 小时分时时序流水与买家波峰数据 (Hourly Trends)</span>
            </label>

            <label className="flex items-center gap-2.5 text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeAttribution}
                onChange={(e) => setIncludeAttribution(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span>包含品类分布、国别地区、流量渠道与商户承揽归因 (Bento Attribution)</span>
            </label>

            <label className="flex items-center gap-2.5 text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeAnomalies}
                onChange={(e) => setIncludeAnomalies(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span>包含智能雷达偏离预警事件与调度处置日志 (Operations Incidents)</span>
            </label>
          </div>

          {/* Summary Box */}
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-900">
              <span className="material-symbols-outlined text-[18px] text-blue-600">info</span>
              <span>
                导出时间基准：<strong>{timeRangeLabel}</strong>
              </span>
            </div>
            <span className="font-code-token text-[11px] text-blue-600 font-semibold">
              预计体积 ~ 1.8 MB
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-end gap-2.5 text-xs">
          <button
            onClick={onClose}
            disabled={exporting}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-lg font-medium transition-colors cursor-pointer shadow-2xs"
          >
            取消
          </button>
          <button
            onClick={handleStartExport}
            disabled={exporting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            {exporting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>导出中...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>立即开始导出</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
