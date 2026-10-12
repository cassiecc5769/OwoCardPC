import React, { useState } from 'react';

interface ExportSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalCount: number;
}

export const ExportSnapshotModal: React.FC<ExportSnapshotModalProps> = ({
  isOpen,
  onClose,
  totalCount
}) => {
  const [format, setFormat] = useState<'csv' | 'excel' | 'mt940' | 'json'>('csv');
  const [dateRange, setDateRange] = useState('2026-09-18 00:00:00 - 23:59:59');
  const [includeEscrow, setIncludeEscrow] = useState(true);
  const [includeDoubleEntry, setIncludeDoubleEntry] = useState(true);
  const [includeHashSign, setIncludeHashSign] = useState(true);
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
      }, 1800);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">sync_alt</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-slate-900">
                导出积点底层账本对账流水快照
              </h3>
              <p className="font-code-token text-xs text-slate-500 mt-0.5">
                AUDIT SNAPSHOT EXPORT ENGINE
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

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
              <span>已成功生成并导出对账流水快照【LEDGER-SNAPSHOT-20260918.{format}】，包含 {totalCount} 笔事实记录。</span>
            </div>
          )}

          {/* Format selection */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-700 block">选择导出报表格式</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  format === 'csv'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-900 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] text-blue-600 shrink-0">table_chart</span>
                <div>
                  <div className="font-semibold text-xs">标准审计 CSV (推荐)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">毫秒精度 · 适合大数据导入</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('excel')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  format === 'excel'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-900 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] text-emerald-600 shrink-0">view_compact</span>
                <div>
                  <div className="font-semibold text-xs">Microsoft Excel (.xlsx)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">包含自动计算汇总与分录表</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('mt940')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  format === 'mt940'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-900 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] text-indigo-600 shrink-0">account_balance</span>
                <div>
                  <div className="font-semibold text-xs">SWIFT MT940 / CAMT</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">银行与金融机构专用清算报文</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  format === 'json'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-900 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] text-amber-600 shrink-0">code</span>
                <div>
                  <div className="font-semibold text-xs">JSON 离线加密账本</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">含公私钥数字签名与原始回执</div>
                </div>
              </button>
            </div>
          </div>

          {/* Time range */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">对账基准窗口与时间范围</label>
            <input
              type="text"
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-numeric-table text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Configuration checkboxes */}
          <div className="space-y-2.5 pt-1">
            <label className="flex items-center gap-2.5 text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeEscrow}
                onChange={e => setIncludeEscrow(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <span>包含在途冻结与解冻流水 (Hold / Escrow Transactions)</span>
            </label>

            <label className="flex items-center gap-2.5 text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeDoubleEntry}
                onChange={e => setIncludeDoubleEntry(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <span>展开复式记账借贷会计科目编码 (Dr 借方 / Cr 贷方)</span>
            </label>

            <label className="flex items-center gap-2.5 text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeHashSign}
                onChange={e => setIncludeHashSign(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <span>在文件尾部附加平台公私钥数字签名 (防伪与合规司法存证)</span>
            </label>
          </div>

          {/* Summary Box */}
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-900">
              <span className="material-symbols-outlined text-[18px] text-blue-600">info</span>
              <span>预计导出记账行数：<strong className="font-numeric-stat font-bold text-blue-700">{totalCount}</strong> 条</span>
            </div>
            <span className="font-code-token text-[11px] text-blue-600 font-semibold">
              预计体积 ~ 2.4 MB
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
                <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>
                <span>生成快照打包中...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[15px]">download</span>
                <span>立即生成并下载快照</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
