import React from 'react';

interface DisputeAuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DisputeAuditLogModal: React.FC<DisputeAuditLogModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const logs = [
    {
      time: '2026-08-27 15:30:45',
      operator: 'OP-8821 (主调度执行员)',
      caseId: 'DIS-20260827-0045',
      action: '终审裁决生效',
      verdict: '出卡方全责 (黑卡欺诈反冲)',
      finTx: 'FIN-TX-20260827-8902',
      collateral: '释放商户保证金 ¥50W',
      status: '已同步记账'
    },
    {
      time: '2026-08-27 14:12:18',
      operator: 'OP-8804 (质检审核员)',
      caseId: 'DIS-20260827-0051',
      action: '责任定损签批',
      verdict: '商户全责 (掉单吞卡延误)',
      finTx: 'FIN-TX-20260827-8744',
      collateral: '划扣商户备付金 ¥710.00',
      status: '待资金划扣'
    },
    {
      time: '2026-08-27 11:20:05',
      operator: 'OP-8801 (合规主管)',
      caseId: 'DIS-20260827-0032',
      action: '平台安全兜底',
      verdict: '平台安全池先行垫付',
      finTx: 'FIN-TX-20260827-8621',
      collateral: '动用风险备付金 $200.00',
      status: '平账闭环'
    },
    {
      time: '2026-08-27 09:15:30',
      operator: 'SYSTEM_BOT (自动化法医引擎)',
      caseId: 'DIS-20260827-0091',
      action: '官方时间链对账',
      verdict: '提取 Apple Enterprise 底座数据',
      finTx: 'N/A',
      collateral: '锁定 $500.00 (3,475 PTS)',
      status: '对质完成'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in text-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">history_toggle_off</span>
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm">售后仲裁流转审计日志 (Audit Stream)</span>
              <p className="text-xs text-slate-400 mt-0.5">全量留痕、防篡改存证、财务动账可追溯</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Table Content */}
        <div className="p-6 overflow-x-auto max-h-[480px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold h-8 text-[11px]">
                <th className="px-3 py-1.5">时间戳 (EST)</th>
                <th className="px-3 py-1.5">操作员/席位</th>
                <th className="px-3 py-1.5">工单编号</th>
                <th className="px-3 py-1.5">动作类型</th>
                <th className="px-3 py-1.5">判定结论</th>
                <th className="px-3 py-1.5">动账流水</th>
                <th className="px-3 py-1.5">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {logs.map((l, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2 text-slate-500">{l.time}</td>
                  <td className="px-3 py-2 text-slate-800 font-sans font-medium">{l.operator}</td>
                  <td className="px-3 py-2 text-blue-600 font-bold">{l.caseId}</td>
                  <td className="px-3 py-2 text-slate-700 font-sans">{l.action}</td>
                  <td className="px-3 py-2 text-slate-900 font-sans font-semibold">{l.verdict}</td>
                  <td className="px-3 py-2 text-slate-600">{l.finTx}</td>
                  <td className="px-3 py-2 font-sans">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="font-mono text-slate-400 text-[11px]">区块链防篡改校验码: 0x8F0429C91B8801A99B</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
