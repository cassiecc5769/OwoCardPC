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

  const [format, setFormat] = useState<'PDF' | 'CSV' | 'JSON'>('PDF');
  const [includePayload, setIncludePayload] = useState(true);
  const [includeSignature, setIncludeSignature] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      onExportDone(format);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
              <span className="material-symbols-outlined text-[20px]">download</span>
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">导出通知审计清单</h3>
              <p className="text-xs text-slate-500 mt-0.5">下载全域消息触发与投递流水电子存证凭证</p>
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
        <div className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-2">导出文件格式</label>
            <div className="grid grid-cols-3 gap-2">
              {(['PDF', 'CSV', 'JSON'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFormat(fmt)}
                  className={`py-2 px-3 rounded-lg border font-medium text-center cursor-pointer transition-all ${
                    format === fmt
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {fmt} 数据包
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includePayload}
                onChange={(e) => setIncludePayload(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700 font-medium">包含完整消息正文与脱敏变量字典</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSignature}
                onChange={(e) => setIncludeSignature(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700 font-medium">包含区块链与密码学 SHA-256 存证签名</span>
            </label>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2 text-blue-800">
            <span className="material-symbols-outlined text-[18px] text-blue-600 shrink-0">
              verified_user
            </span>
            <span className="text-[11px] leading-relaxed">
              导出的审计文件包含平台防伪数字印章，可直接用于第三方司法核验与合规取证。
            </span>
          </div>

          {/* Actions */}
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
              <span className="material-symbols-outlined text-[16px]">
                {isExporting ? 'sync' : 'download'}
              </span>
              <span>{isExporting ? '正在打包报表...' : '确认导出并下载'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
