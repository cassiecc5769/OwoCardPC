import React, { useState } from 'react';

interface BankImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (count: number) => void;
}

export const BankImportModal: React.FC<BankImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const [selectedChannel, setSelectedChannel] = useState<string>('cmb');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulatedUpload = () => {
    setUploadedFile('CMB_HK_STATEMENTS_20260918_MT940.DAT');
  };

  const handleStartReconciliation = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onImportSuccess(14);
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">批量网银 / 节点对账单导入</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                支持 SWIFT MT940 / CAMT.053 / 招商离岸 / TRON 全节点流水
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">选择目标收单清算专户:</label>
            <select
              value={selectedChannel}
              onChange={e => setSelectedChannel(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer font-medium"
            >
              <option value="cmb">招商银行香港分行离岸对公户 (*8820-USD)</option>
              <option value="ocbc">新加坡华侨银行 (OCBC) 资金对公专户 (*7702-SG)</option>
              <option value="tron">TRC20 链上地址归集冷热节点 (HOT-NODE-01)</option>
              <option value="zenith">尼日利亚 Zenith Bank 本地收单通道</option>
            </select>
          </div>

          {/* Upload Area */}
          <div
            onClick={handleSimulatedUpload}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              uploadedFile ? 'border-emerald-400 bg-emerald-50/50' : 'border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/20'
            }`}
          >
            <span className={`material-symbols-outlined text-[36px] ${uploadedFile ? 'text-emerald-600' : 'text-slate-400'}`}>
              {uploadedFile ? 'task' : 'cloud_upload'}
            </span>
            <div className="font-semibold text-xs text-slate-800 mt-2">
              {uploadedFile ? uploadedFile : '点击选择或将银行/节点流水数据拖放至此'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              支持 .dat, .csv, .xml (MT940/CAMT.053) 格式，单个文件不超过 50MB
            </div>
          </div>

          {uploadedFile && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px] space-y-1">
              <div className="font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                文件预解析成功 (Ready for Auto-Reconciliation)
              </div>
              <div>成功识别到 14 笔入账记录，系统预计可自动双向匹配 12 笔待核验充值单。</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={handleStartReconciliation}
            disabled={!uploadedFile || isProcessing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            {isProcessing ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                <span>正在执行双向自动对账...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                <span>启动自动批量验资匹配</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
