import React from 'react';

interface TradingRulesBottomBannerProps {
  onDownloadReport: () => void;
}

export const TradingRulesBottomBanner: React.FC<TradingRulesBottomBannerProps> = ({
  onDownloadReport,
}) => {
  return (
    <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-800 rounded-lg text-emerald-400">
          <span className="material-symbols-outlined text-[20px]">security</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-100">
              分布式 Redis & 撮合内核强一致性保障
            </span>
            <span className="font-mono text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded font-semibold">
              SYNCED
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            所有已发布的交易规则通过 Raft 共识协议在 20ms 内同步至全网 12 处撮合计算节点，任何修改自动封存至区块链防伪审计存证。
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onDownloadReport}
          className="font-mono text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>BLOCK #142,091,822 · 下载完整合规报告 (PDF)</span>
          <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
        </button>
      </div>
    </div>
  );
};
