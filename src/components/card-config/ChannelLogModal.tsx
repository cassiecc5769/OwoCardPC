import React, { useEffect, useState } from 'react';
import { CardSkuMasterItem } from './types';

interface ChannelLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardSkuMasterItem | null;
  onAttemptReconnect: (cardId: string) => void;
}

/** 保留文件名以兼容页面引用，内容改为失败审核规则配置。 */
export const ChannelLogModal: React.FC<ChannelLogModalProps> = ({
  isOpen,
  onClose,
  card,
  onAttemptReconnect,
}) => {
  const [autoAudit, setAutoAudit] = useState(true);
  const [requireEvidence, setRequireEvidence] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setAutoAudit(true);
      setRequireEvidence(true);
    }
  }, [isOpen, card?.id]);

  if (!isOpen || !card) return null;

  const RuleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-300'}`}
    >
      <span className={`absolute top-[2px] h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col animate-fadeIn">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <span className="material-symbols-outlined text-[20px]">rule_settings</span>
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">失败审核设置 · {card.brandName}</h3>
              <span className="font-code-token text-[11px] text-slate-500">{card.cardCode || card.id} · FAILURE REVIEW POLICY</span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 space-y-3 text-xs text-slate-700">
          <p className="text-slate-500 leading-relaxed">配置该卡种交易失败后的审核流转规则；保存后仅对新增失败订单生效。</p>
          <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            <div className="p-3.5 flex items-center justify-between gap-4">
              <div><div className="font-semibold text-slate-800">自动进入失败审核队列</div><div className="text-[11px] text-slate-500 mt-1">接口失败、卡密校验失败时自动创建审核任务</div></div>
              <RuleSwitch checked={autoAudit} onChange={() => setAutoAudit((value) => !value)} />
            </div>
            <div className="p-3.5 flex items-center justify-between gap-4">
              <div><div className="font-semibold text-slate-800">要求补充凭证</div><div className="text-[11px] text-slate-500 mt-1">审核员处理前须上传 Card image 或交易凭证</div></div>
              <RuleSwitch checked={requireEvidence} onChange={() => setRequireEvidence((value) => !value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="font-medium text-slate-700 block mb-1">失败次数阈值</span><input defaultValue="3" type="number" min="1" className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500" /></label>
            <label className="block"><span className="font-medium text-slate-700 block mb-1">审核时限（分钟）</span><input defaultValue="30" type="number" min="1" className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500" /></label>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 font-medium cursor-pointer">取消</button>
          <button type="button" onClick={() => { onAttemptReconnect(card.id); onClose(); }} className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs cursor-pointer">保存设置</button>
        </div>
      </div>
    </div>
  );
};
