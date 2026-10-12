import React from 'react';

interface DisputeCaseLawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DisputeCaseLawModal: React.FC<DisputeCaseLawModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const standards = [
    {
      title: '场景一：卡密已被兑换（官方时间戳早于提单时间）',
      rule: '出卡方全责',
      ruleClass: 'bg-red-100 text-red-800 border-red-200',
      desc: '经官方底层网关核验，卡密核销时间早于用户在平台提交订单时间。判定用户提交废卡或二次倒卖，全额解冻商户保证金，扣除用户信誉分50分。'
    },
    {
      title: '场景二：卡密已被兑换（官方时间戳在商户接单后）',
      rule: '商户全责',
      ruleClass: 'bg-amber-100 text-amber-800 border-amber-200',
      desc: '商户接单时卡密处于未兑状态，商户持有期间超时无响应，且卡密在此区间被官方兑换。判定商户泄露或私兑，全额划扣商户保证金赔付用户。'
    },
    {
      title: '场景三：面额少充/面额不符',
      rule: '差额划扣 / 双向质证',
      ruleClass: 'bg-blue-100 text-blue-800 border-blue-200',
      desc: '需商户出具官方钱包明细账单。如确系低面额卡，按实际到账面额结算，多余冻结资金原路退回；如商户无法提供官方流水，判定商户全责补足差额。'
    },
    {
      title: '场景四：跨区 Geo 限制无法核销',
      rule: '无责退回 / 改派通道',
      ruleClass: 'bg-purple-100 text-purple-800 border-purple-200',
      desc: '卡密未被核销但因发行国家/货币不匹配。双方无恶意欺诈，立即撤回原卡单，解冻商户积点，将卡券退还用户或一键改派对应国家专线商户。'
    },
    {
      title: '场景五：上游接口故障或网络超时漂移',
      rule: '平台备付金先行垫付',
      ruleClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      desc: '因平台调度网关时钟漂移、官方接口故障导致双边状态不一致。动用平台风险备付金先行赔付出卡方与商户，双方免责，转入技术排障工单。'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in text-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">rule</span>
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm">判例基准库 (PRD v2.0 SEC-7 仲裁裁量权基准)</span>
              <p className="text-xs text-slate-400 mt-0.5">客观定损标准与自动化规则映射体系</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* List */}
        <div className="p-6 space-y-3 overflow-y-auto max-h-[480px]">
          {standards.map((s, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 text-xs">{s.title}</span>
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${s.ruleClass}`}>
                  {s.rule}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
};
