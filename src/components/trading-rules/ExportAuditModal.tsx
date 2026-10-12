import React, { useState } from 'react';

interface ExportAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportDone: (format: string) => void;
}

export const ExportAuditModal: React.FC<ExportAuditModalProps> = ({
  isOpen,
  onClose,
  onExportDone,
}) => {
  if (!isOpen) return null;

  const [format, setFormat] = useState<'pdf' | 'csv' | 'json'>('pdf');
  const [includeSignature, setIncludeSignature] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      onExportDone(format.toUpperCase());
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
              <span className="material-symbols-outlined text-[20px]">file_download</span>
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">导出规则全量审计清单</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                包含基线规则配置表、变更时序日志与数字防伪签名
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
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              选择导出格式
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                  format === 'pdf'
                    ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs text-blue-700 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="material-symbols-outlined text-[24px] mb-1">picture_as_pdf</div>
                <div className="text-xs">PDF 报告</div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">合规审计格式</div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                  format === 'csv'
                    ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs text-blue-700 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="material-symbols-outlined text-[24px] mb-1">table_view</div>
                <div className="text-xs">CSV 数据包</div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">Excel / 表格分析</div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                  format === 'json'
                    ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs text-blue-700 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="material-symbols-outlined text-[24px] mb-1">code</div>
                <div className="text-xs">JSON 镜像</div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">API 策略导入</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              审计数据时间周期
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="current">当前生效基线 (最新 v2.4-STABLE)</option>
              <option value="30d">过去 30 天全量变更流水 (包含 186 条操作)</option>
              <option value="90d">过去 90 天风控核验全账本</option>
              <option value="all">全周期不可篡改历史记录 (含所有归档快照)</option>
            </select>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSignature}
                onChange={(e) => setIncludeSignature(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-700 font-medium">
                附带 SHA-256 签名链校验报告与经办人数字凭据
              </span>
            </label>
            <p className="text-[11px] text-slate-500 pl-6">
              经区块链与 Raft 共识节点认证，具备向第三方会计事务所和监管机构提供的法律证明力。
            </p>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              disabled={isExporting}
              onClick={handleExport}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  <span>打包签名中...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>开始导出文件</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
