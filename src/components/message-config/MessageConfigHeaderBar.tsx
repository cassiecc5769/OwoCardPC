import React from 'react';

interface MessageConfigHeaderBarProps {
  onOpenSnapshots: () => void;
  onOpenExportAudit: () => void;
  onOpenCreateRule: () => void;
  onOpenPublish: () => void;
}

export const MessageConfigHeaderBar: React.FC<MessageConfigHeaderBarProps> = ({
  onOpenSnapshots,
  onOpenExportAudit,
  onOpenCreateRule,
  onOpenPublish,
}) => {
  return (
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white px-5 py-4 rounded-xl border border-slate-200/80 shadow-xs">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            消息规则配置 · 全域事件与通信矩阵治理中心
          </h1>
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-[10px] font-semibold border border-blue-200">
            EVENT-HUB V2.4
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          支持对交易、售后、财务等全域业务事件进行多通道路由、频控治理与模版解包渲染
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto shrink-0">
        <button
          type="button"
          onClick={onOpenSnapshots}
          className="px-3.5 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] text-slate-500">history</span>
          <span>规则快照</span>
        </button>

        <button
          type="button"
          onClick={onOpenExportAudit}
          className="px-3.5 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] text-slate-500">download</span>
          <span>导出审计</span>
        </button>

        <button
          type="button"
          onClick={onOpenCreateRule}
          className="px-3.5 h-9 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200/80 shadow-2xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] text-blue-600">add</span>
          <span>新增事件规则</span>
        </button>

        <button
          type="button"
          onClick={onOpenPublish}
          className="px-4 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
          <span>发布并全网生效 (Enter)</span>
        </button>
      </div>
    </header>
  );
};
