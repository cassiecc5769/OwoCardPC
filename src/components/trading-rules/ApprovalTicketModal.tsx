import React from 'react';

interface ApprovalTicketModalProps {
  ticket: string | null;
  onClose: () => void;
}

export const ApprovalTicketModal: React.FC<ApprovalTicketModalProps> = ({
  ticket,
  onClose,
}) => {
  if (!ticket) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
              <span className="material-symbols-outlined text-[20px]">assignment</span>
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                审批工单详情 · <span className="font-mono text-blue-600">{ticket}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">OA风控业务参数调整审批归档凭据</p>
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
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                verified
              </span>
              <span className="font-bold text-emerald-800">已双签核准 (APPROVED)</span>
            </div>
            <span className="font-mono text-[11px] text-emerald-700 font-semibold">
              数字签章有效
            </span>
          </div>

          <div className="space-y-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex justify-between">
              <span className="text-slate-500">工单类型:</span>
              <span className="font-semibold text-slate-800">交易撮合与风控参数变更</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">申请部门:</span>
              <span className="text-slate-800">平台运营部 · 大宗卡商通道组</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">主要经办人:</span>
              <span className="text-slate-800">张文翰 (运营主管)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">终审授权人:</span>
              <span className="text-slate-800">林志华 (首席风控官 / 合规委员)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">核准归档时间:</span>
              <span className="font-mono text-slate-700">2026-08-25 14:18:22</span>
            </div>
          </div>

          <div>
            <span className="text-slate-700 font-bold block mb-1">审批意见与业务背景:</span>
            <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 leading-relaxed">
              经评估，达拉斯大宗机构过往 90 天履约率 100%，且已追加 $200,000
              等额履约保证金质押至平台安全托管账户。本次调整符合《平台特级商户额度管理指引第
              4.2 条》，同意参数放行并同步全网撮合节点。
            </div>
          </div>

          {/* Action */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg cursor-pointer"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
