import React, { useState } from 'react';
import { SettlementBatchItem } from './types';

interface PromotionSettlementTabProps {
  batches: SettlementBatchItem[];
  onOpenTransferModal: (batch: SettlementBatchItem) => void;
  onShowToast: (msg: string) => void;
}

export const PromotionSettlementTab: React.FC<PromotionSettlementTabProps> = ({
  batches,
  onOpenTransferModal,
  onShowToast
}) => {
  const [selectedVoucher, setSelectedVoucher] = useState<SettlementBatchItem | null>(null);

  const handleExportBatch = (batchNo: string) => {
    onShowToast(`已导出结算批次 ${batchNo} 凭证包及专员核销明细 (.zip)`);
  };

  return (
    <div className="space-y-4">
      {/* 财务隔离提示横幅 */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-start gap-3.5 shadow-xs">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <span className="material-symbols-outlined text-[18px]">account_balance</span>
        </div>
        <div className="flex-1 text-xs">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-emerald-900">红线四：推广与财务结算硬隔离原则实施中</h4>
            <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-800 font-code-token text-[10px] font-semibold border border-emerald-300/60">
              READ-ONLY 预估态
            </span>
          </div>
          <p className="text-emerald-800 mt-1 leading-relaxed">
            推广管理工作台数据仅作为出单效能评估与佣金预估，无任何实际打款、放款或账户资金划转权限。所有提成收益在周期结算日前经过「全员平级 + 两级封顶」合规审计后，以防篡改数字凭证移交给 <strong>04 财务结算中心 (Finance Hub)</strong>，由财务团队完成资金合规拨付。
          </p>
        </div>
      </div>

      {/* 4 大结算指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] text-slate-500 font-label-caps uppercase font-semibold">预估待结算分佣池</span>
            <span className="font-code-token text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200/60">
              本月预估
            </span>
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="font-numeric-stat text-2xl font-bold text-emerald-700 tracking-tight">$112,450</span>
            <span className="text-xs text-slate-400 font-code-token">.00</span>
          </div>
          <div className="text-xs text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>直属一级提成</span>
            <span className="font-numeric-table text-blue-600 font-semibold">$89,960 (80%)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] text-slate-500 font-label-caps uppercase font-semibold">二级裂变提成池</span>
            <span className="font-code-token text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/60">
              1.0% 固定
            </span>
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="font-numeric-stat text-2xl font-bold text-indigo-600 tracking-tight">$22,490</span>
            <span className="text-xs text-slate-400 font-code-token">.00</span>
          </div>
          <div className="text-xs text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>二级提成占比</span>
            <span className="font-numeric-table text-slate-800 font-semibold">20.0% 总池</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] text-slate-500 font-label-caps uppercase font-semibold">已移交财务只读批次</span>
            <span className="font-code-token text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60">
              04 FIN-HUB
            </span>
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="font-numeric-stat text-2xl font-bold text-slate-900 tracking-tight">$55,260</span>
            <span className="text-xs text-slate-400 font-code-token"> (上半月)</span>
          </div>
          <div className="text-xs text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>移交凭证校验</span>
            <span className="font-code-token text-emerald-700 font-semibold">HASH PASS</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] text-slate-500 font-label-caps uppercase font-semibold">待合规移交批次</span>
            <span className="font-code-token text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200/60">
              待出具
            </span>
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="font-numeric-stat text-2xl font-bold text-blue-600 tracking-tight">$57,190</span>
            <span className="text-xs text-slate-400 font-code-token"> (下半月)</span>
          </div>
          <div className="text-xs text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>当前合规状态</span>
            <span className="font-code-token text-amber-600 font-semibold">1 笔存疑待审</span>
          </div>
        </div>
      </div>

      {/* 结算移交批次列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">price_check</span>
              <span>推广结算凭证批次 (移交财务结算中心清单)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              每半月生成一次结算流水只读包，经合规与法务审计签章后推向财务中枢。
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-semibold text-[11px] uppercase tracking-wider h-10 border-b border-slate-200 select-none">
                <th className="py-2.5 px-4 font-semibold">结算批次号</th>
                <th className="py-2.5 px-3 font-semibold">账期时间跨度</th>
                <th className="py-2.5 px-3 font-semibold text-center">覆盖专员数</th>
                <th className="py-2.5 px-3 font-semibold text-right">核销有效流水 (GMV)</th>
                <th className="py-2.5 px-3 font-semibold text-right">一级佣金 (4%)</th>
                <th className="py-2.5 px-3 font-semibold text-right">二级佣金 (1%)</th>
                <th className="py-2.5 px-3 font-semibold text-right">预估提成总额</th>
                <th className="py-2.5 px-3 font-semibold text-center">两级封顶审计</th>
                <th className="py-2.5 px-3 font-semibold text-center">移交财务状态</th>
                <th className="py-2.5 px-4 font-semibold text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {batches.map(b => {
                return (
                  <tr key={b.batchNo} className="h-14 hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4">
                      <span className="font-code-token font-bold text-slate-900 text-xs">{b.batchNo}</span>
                      {b.voucherHash && (
                        <span className="font-code-token text-[10px] text-slate-400 block truncate max-w-[120px]" title={b.voucherHash}>
                          {b.voucherHash}
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="text-slate-800 text-xs font-medium">{b.period}</span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span className="font-numeric-table text-xs font-semibold">{b.promoterCount}</span>
                      <span className="text-slate-400 text-[11px]"> 人</span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-numeric-table font-semibold text-slate-900">
                      ${b.totalGmv.toLocaleString()}
                    </td>

                    <td className="py-2.5 px-3 text-right font-numeric-table text-blue-600 font-semibold">
                      ${b.tier1Commission.toLocaleString()}
                    </td>

                    <td className="py-2.5 px-3 text-right font-numeric-table text-indigo-600 font-semibold">
                      ${b.tier2Commission.toLocaleString()}
                    </td>

                    <td className="py-2.5 px-3 text-right font-numeric-table font-bold text-emerald-700 text-sm">
                      ${b.totalCommission.toLocaleString()}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {b.auditStatus === 'PASS' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-code-token text-[10px] font-semibold border border-emerald-200">
                          PASS 规范
                        </span>
                      )}
                      {b.auditStatus === 'AUDITING' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-code-token text-[10px] font-semibold border border-amber-200">
                          审计复核中
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {b.transferStatus === 'TRANSFERRED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-code-token text-[10px] font-semibold border border-blue-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>已移交财务
                        </span>
                      )}
                      {b.transferStatus === 'PENDING_TRANSFER' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-code-token text-[10px] font-semibold border border-amber-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>待出具移交
                        </span>
                      )}
                      {b.transferStatus === 'SETTLED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-code-token text-[10px] font-semibold border border-slate-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>已出账完税
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {b.transferStatus === 'PENDING_TRANSFER' ? (
                          <button
                            onClick={() => onOpenTransferModal(b)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">send</span>
                            <span>移交财务</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedVoucher(b)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer border border-slate-200/60"
                          >
                            查阅只读凭证
                          </button>
                        )}
                        <button
                          onClick={() => handleExportBatch(b.batchNo)}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                          title="导出结算包"
                        >
                          <span className="material-symbols-outlined text-[16px]">download</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 凭证查阅弹窗 */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">只读数字凭证详情 · {selectedVoucher.batchNo}</h3>
                  <p className="text-[11px] text-slate-500">已向 04 财务结算中心交付的不可篡改账本</p>
                </div>
              </div>
              <button onClick={() => setSelectedVoucher(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs font-numeric-table">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">凭证状态:</span>
                  <span className="font-bold text-emerald-700 font-code-token">READ-ONLY 锁定生效</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">移交时间:</span>
                  <span className="text-slate-800 font-code-token">{selectedVoucher.transferredAt || '2024-03-16 10:30'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">签署审计员:</span>
                  <span className="text-slate-800 font-sans">{selectedVoucher.transferredBy || '合规审计组'}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between">
                  <span className="text-slate-500 font-sans">防篡改哈希:</span>
                  <span className="text-blue-600 font-code-token text-[11px] break-all">{selectedVoucher.voucherHash}</span>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 text-blue-900 font-sans text-xs leading-relaxed">
                此批次预估提成总额为 <strong className="font-numeric-table">${selectedVoucher.totalCommission.toLocaleString()} USD</strong>，对应 GMV <strong className="font-numeric-table">${selectedVoucher.totalGmv.toLocaleString()} USD</strong>。财务结算中心将依照各推广员绑定的对公对私打款账户逐笔完成放款。
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => setSelectedVoucher(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-900 transition-colors text-xs font-sans cursor-pointer shadow-xs"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
