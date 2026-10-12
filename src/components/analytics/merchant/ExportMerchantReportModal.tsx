import React, { useState } from 'react';

interface ExportMerchantReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeRangeLabel: string;
}

export const ExportMerchantReportModal: React.FC<ExportMerchantReportModalProps> = ({
  isOpen,
  onClose,
  timeRangeLabel,
}) => {
  const [fileFormat, setFileFormat] = useState<'xlsx' | 'csv' | 'json'>('xlsx');
  const [includeSuspended, setIncludeSuspended] = useState(true);
  const [includeHhiAnalysis, setIncludeHhiAnalysis] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      const filename = `merchant_capacity_report_${Date.now()}.${fileFormat}`;
      const dummyContent = 'merchant_id,merchant_name,tier,gmv_usd,success_rate,sla_score\nMID-99201,招财进宝科技,Tier-S,125200.00,99.8%,98.5';
      const blob = new Blob([dummyContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 w-full max-w-md overflow-hidden animate-fadeIn">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined text-[20px]">download_for_offline</span>
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                导出商户承揽效能报表
              </h3>
              <span className="text-[11px] text-slate-500 font-code-token">
                MERCHANT CAPACITY AUDIT EXPORT
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-700">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">统计分析周期:</span>
              <span className="font-semibold text-slate-900">{timeRangeLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">入选商户范围:</span>
              <span className="font-semibold text-blue-700 font-numeric-stat">
                共 142 家认证商户 (在岗 88 家)
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-slate-900 block">选择报表导出格式</label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setFileFormat('xlsx')}
                className={`py-2 px-3 rounded-lg border text-center font-medium transition-all cursor-pointer ${
                  fileFormat === 'xlsx'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Excel (.xlsx)
              </button>
              <button
                type="button"
                onClick={() => setFileFormat('csv')}
                className={`py-2 px-3 rounded-lg border text-center font-medium transition-all cursor-pointer ${
                  fileFormat === 'csv'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                标准 CSV
              </button>
              <button
                type="button"
                onClick={() => setFileFormat('json')}
                className={`py-2 px-3 rounded-lg border text-center font-medium transition-all cursor-pointer ${
                  fileFormat === 'json'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                数据 JSON
              </button>
            </div>
          </div>

          <div className="space-y-2.5 border-t border-slate-100 pt-3">
            <label className="font-semibold text-slate-900 block">补充审计维度</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSuspended}
                onChange={(e) => setIncludeSuspended(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700">包含处于风控冻结及清退中的争议商户主体</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeHhiAnalysis}
                onChange={(e) => setIncludeHhiAnalysis(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700">附带 HHI 赫芬达尔指数及单商户垄断风险分布矩阵</span>
            </label>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            {isExporting ? (
              <>
                <span className="material-symbols-outlined text-[15px] animate-spin">refresh</span>
                <span>导出打包中...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[15px]">file_download</span>
                <span>生成并下载</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
