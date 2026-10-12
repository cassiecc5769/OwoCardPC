import React from 'react';

interface QuoteRuleChainModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuoteRuleChainModal: React.FC<QuoteRuleChainModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">account_tree</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">风控引擎实时规则链追踪 (Rule Chain Inspector)</span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">PASS</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">校验哈希: <span className="font-mono text-slate-600">#8f92a10e-SEC-20231120</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto max-h-[70vh]">
          {/* Status summary banner */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-emerald-600 text-[22px]">verified</span>
              <div>
                <div className="font-semibold text-emerald-900">42条活跃通道全部通过校验</div>
                <div className="text-emerald-700 text-[11px] mt-0.5">最近一次自动比对耗时 14ms，342 次高频撮合测试 0 异常</div>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-700 bg-white px-2 py-1 rounded border border-emerald-200">
              100% HEALTHY
            </span>
          </div>

          {/* Rule Chain Stages */}
          <div className="space-y-3 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
            {/* Stage 1 */}
            <div className="relative pl-9">
              <div className="absolute left-2.5 top-2 w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-white"></div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Stage 1: 中行实时外汇基准锚定 (BOC Mid Benchmark)</span>
                  <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 font-semibold">T+0 SYNC</span>
                </div>
                <p className="text-slate-600 mt-1 text-[11px]">
                  实时拉取中国银行现汇买入/卖出中间价 (当前 USD/CNY 7.2341)。若单日牌价波动超过 ±0.50%，触发全局等比平移重算。
                </p>
                <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center gap-2">
                  <span>当前波动: +0.12%</span>
                  <span>|</span>
                  <span>阈值上限: ±0.50%</span>
                  <span>|</span>
                  <span className="text-emerald-600 font-semibold">状态: 正常通行</span>
                </div>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="relative pl-9">
              <div className="absolute left-2.5 top-2 w-3.5 h-3.5 rounded-full bg-indigo-600 ring-4 ring-white"></div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Stage 2: 下游商户积分与承兑点池监控 (Inventory Circuit)</span>
                  <span className="font-mono text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 font-semibold">CAPACITY</span>
                </div>
                <p className="text-slate-600 mt-1 text-[11px]">
                  监控下游合作商户的待结算点池与授信可用额度。若某品类可用点池低于 50,000 PTS，系统启动定向局部停收熔断。
                </p>
                <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center gap-2">
                  <span>Nike 实体卡: 点池不足 (已停收)</span>
                  <span>|</span>
                  <span>Amazon 日区: 告警熔断</span>
                  <span>|</span>
                  <span className="text-amber-600 font-semibold">已触发2处拦截</span>
                </div>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="relative pl-9">
              <div className="absolute left-2.5 top-2 w-3.5 h-3.5 rounded-full bg-emerald-600 ring-4 ring-white"></div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Stage 3: 价格倒挂硬性拦截 (Anti-Inversion Hard Barrier)</span>
                  <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">TOP PRIORITY</span>
                </div>
                <p className="text-slate-600 mt-1 text-[11px]">
                  严格执行平台毛利留存公式：(用户买入折率 - 商户承揽底价) ÷ 用户买入折率 ≥ 1.00%。任何低于此阈值的人工与API调价均被底层内核阻断。
                </p>
                <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center gap-2">
                  <span>倒挂违规拦截计数: 0 次</span>
                  <span>|</span>
                  <span>边际预警数: 1 处 (Apple UK)</span>
                  <span>|</span>
                  <span className="text-emerald-600 font-semibold">状态: 强制阻断开启</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">规则引擎版本: V3.82-REV-ENGINE</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors cursor-pointer"
          >
            完成查看
          </button>
        </div>
      </div>
    </div>
  );
};
