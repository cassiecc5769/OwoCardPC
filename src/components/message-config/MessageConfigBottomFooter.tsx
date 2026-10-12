import React from 'react';

export const MessageConfigBottomFooter: React.FC = () => {
  return (
    <footer className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-500">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Kafka Event-Bus 集群双活中</span>
        </div>
        <div className="hidden md:flex items-center gap-2 text-slate-400">
          <span>分区: 16 Partition</span>
          <span>·</span>
          <span>消费堆积: 0 msg</span>
          <span>·</span>
          <span>端到端网络延迟: &lt; 4.2ms</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-slate-600">
          <span className="material-symbols-outlined text-[15px] text-blue-600">
            verified_user
          </span>
          <span>每笔通知 SHA-256 存证链已连接</span>
        </div>
        <span className="text-slate-300">|</span>
        <div className="text-slate-800 font-semibold">
          SLA 保障: 99.99% · 实时热更新启用
        </div>
      </div>
    </footer>
  );
};
