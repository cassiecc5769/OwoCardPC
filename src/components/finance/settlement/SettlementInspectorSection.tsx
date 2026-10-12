import React, { useState } from 'react';
import { SettlementLedgerItem } from './types';

interface SettlementInspectorSectionProps {
  selectedItem: SettlementLedgerItem;
  onRefreshData?: () => void;
}

export const SettlementInspectorSection: React.FC<SettlementInspectorSectionProps> = ({
  selectedItem
}) => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2800);
  };

  const data = selectedItem.inspectorData;

  return (
    <div className="relative bg-white rounded-xl shadow-sm border border-slate-200/80 p-4 mb-6 transition-all">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="absolute top-3 right-4 z-50 bg-slate-900 text-white px-3.5 py-2 rounded-lg shadow-xl flex items-center gap-2 text-xs border border-slate-700 animate-fadeIn">
          <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-5 bg-blue-600 rounded-full"></div>
          <span className="font-headline-sm text-sm font-bold text-slate-900">
            结算单穿透剖析视图 (结算详情 6 大 Tab 标准架构)
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-code-token text-[11px] font-semibold">
            INSPECTOR: {selectedItem.settlementNo}
          </span>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          关联主体：<strong className="text-slate-800">{selectedItem.targetEntity}</strong>
        </span>
      </div>

      {/* Inspector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 border-b border-slate-100">
        <button
          type="button"
          onClick={() => setActiveTab(1)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 1
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          账单总览 (Overview)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab(2)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            activeTab === 2
              ? 'bg-blue-600 text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          交易流水明细 ({selectedItem.cardOrderCount.toLocaleString()}笔)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab(3)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            activeTab === 3
              ? 'bg-blue-600 text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          平台费用与扣划清单 ({data.feeDeductions.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab(4)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            activeTab === 4
              ? 'bg-blue-600 text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          争议与退单判责归因 ({data.disputes.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab(5)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            activeTab === 5
              ? 'bg-blue-600 text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          银企打款及发票凭据
        </button>
        <button
          type="button"
          onClick={() => setActiveTab(6)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            activeTab === 6
              ? 'bg-blue-600 text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          审计日志与追溯链 ({data.auditLogs.length})
        </button>
      </div>

      {/* Tab 1: 账单总览 (Overview) */}
      {activeTab === 1 && (
        <div className="mt-3 bg-slate-50/70 rounded-xl p-4 border border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5 bg-white p-3.5 rounded-lg border border-slate-200/70 shadow-2xs">
            <span className="font-label-caps text-[10px] text-slate-400 uppercase font-semibold">
              本期流水核销进度
            </span>
            <div className="flex items-center justify-between">
              <span className="font-numeric-stat text-xl font-bold text-slate-900">
                {data.overview.reconPassRate}
              </span>
              <span className="font-code-token text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                ZERO-LEAKAGE
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden my-1">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all"
                style={{ width: data.overview.reconPassRate }}
              ></div>
            </div>
            <span className="text-xs text-slate-500 leading-relaxed font-body-sm">
              {data.overview.reconNote}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 bg-white p-3.5 rounded-lg border border-slate-200/70 shadow-2xs">
            <span className="font-label-caps text-[10px] text-slate-400 uppercase font-semibold">
              直联出账银行报文状态
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-900 font-semibold">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">task_alt</span>
              <span>{data.overview.bankHostStatus}</span>
            </div>
            <span className="font-code-token text-[11px] text-slate-600">
              {data.overview.bankSerialNo}
            </span>
            <span className="text-xs text-slate-500 leading-relaxed">
              {data.overview.targetAccount}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 bg-white p-3.5 rounded-lg border border-slate-200/70 shadow-2xs">
            <span className="font-label-caps text-[10px] text-slate-400 uppercase font-semibold">
              合规纳税与增值税发票
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-900 font-semibold">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">receipt</span>
              <span>{data.overview.taxInvoiceStatus}</span>
            </div>
            <span className="font-code-token text-[11px] text-slate-600">
              发票代码: {data.overview.invoiceCode}
            </span>
            <span className="text-xs text-emerald-700 font-medium">
              {data.overview.taxNote}
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: 交易流水明细 */}
      {activeTab === 2 && (
        <div className="mt-3 bg-slate-50/70 rounded-xl p-4 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              关联结算流水共 <strong className="text-slate-800 font-numeric-table">{selectedItem.cardOrderCount.toLocaleString()}</strong> 笔，当前展示抽样核心卡单凭据：
            </span>
            <span className="font-code-token text-[11px] text-blue-600 font-medium">
              全量密文存证 SHA-256
            </span>
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-label-caps uppercase border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">卡单业务流水号</th>
                  <th className="py-2 px-3">卡种品类 / 币种面值</th>
                  <th className="py-2 px-3 text-right">票面面值</th>
                  <th className="py-2 px-3 text-right">核销折扣</th>
                  <th className="py-2 px-3 text-right">应结金额</th>
                  <th className="py-2 px-3">核销达成时间</th>
                  <th className="py-2 px-3 text-center">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.transactions.map((tx) => (
                  <tr key={tx.orderId} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-code-token text-blue-600 font-semibold">
                      {tx.orderId}
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-800">{tx.cardType}</td>
                    <td className="py-2 px-3 text-right font-numeric-table font-semibold text-slate-800">
                      ${tx.faceValue.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right font-code-token text-slate-600">
                      {tx.rate}
                    </td>
                    <td className="py-2 px-3 text-right font-numeric-table font-bold text-slate-900">
                      ${tx.settleAmount.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 font-code-token text-slate-500 text-[11px]">
                      {tx.finishTime}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="font-code-token text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold border border-emerald-200">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: 平台费用与扣划清单 */}
      {activeTab === 3 && (
        <div className="mt-3 bg-slate-50/70 rounded-xl p-4 border border-slate-200/80 space-y-3">
          <div className="text-xs text-slate-600">
            依照合同与平台协议执行自动计费，所有扣费项均产生双向复式凭证：
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-label-caps uppercase border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">费用科目代码</th>
                  <th className="py-2 px-3">费用项目名称</th>
                  <th className="py-2 px-3">计费基数</th>
                  <th className="py-2 px-3 text-right">计算费率</th>
                  <th className="py-2 px-3 text-right">扣划金额 (USD)</th>
                  <th className="py-2 px-3">计费说明与依据</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.feeDeductions.map((f) => (
                  <tr key={f.itemCode} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-code-token text-slate-600">{f.itemCode}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{f.itemName}</td>
                    <td className="py-2.5 px-3 font-code-token text-slate-600">{f.calcBase}</td>
                    <td className="py-2.5 px-3 text-right font-code-token text-slate-700">{f.ratePercent}</td>
                    <td className="py-2.5 px-3 text-right font-numeric-table font-bold text-red-600">
                      -${f.amountUSD.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-xs">{f.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: 争议与退单判责归因 */}
      {activeTab === 4 && (
        <div className="mt-3 bg-slate-50/70 rounded-xl p-4 border border-slate-200/80 space-y-3">
          {data.disputes.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              <span className="material-symbols-outlined text-[28px] text-emerald-500 block mb-1">
                verified_user
              </span>
              本结算周期内无任何有效争议挂起或退单判责扣划记录，状态清白。
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="text-xs text-red-700 font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>发现 {data.disputes.length} 笔判责扣款/挂起追索，依规已在结算实收中冻结扣除：</span>
              </div>
              <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-red-50/50 text-red-800 font-label-caps uppercase border-b border-red-100">
                    <tr>
                      <th className="py-2 px-3">争议案号</th>
                      <th className="py-2 px-3">卡密标识</th>
                      <th className="py-2 px-3">争议申诉原因</th>
                      <th className="py-2 px-3">仲裁判责结论</th>
                      <th className="py-2 px-3 text-right">追偿扣除金额</th>
                      <th className="py-2 px-3">判责时间</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.disputes.map((d) => (
                      <tr key={d.disputeId} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-code-token text-red-600 font-semibold">{d.disputeId}</td>
                        <td className="py-2 px-3 font-code-token text-slate-600">{d.cardNo}</td>
                        <td className="py-2 px-3 text-slate-700">{d.disputeReason}</td>
                        <td className="py-2 px-3 font-medium text-red-700">{d.verdict}</td>
                        <td className="py-2 px-3 text-right font-numeric-table font-bold text-red-600">
                          -${d.deductAmountUSD.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 font-code-token text-slate-500 text-[11px]">{d.arbitrateTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: 银企打款及发票凭据 */}
      {activeTab === 5 && (
        <div className="mt-3 bg-slate-50/70 rounded-xl p-4 border border-slate-200/80 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">receipt_long</span>
                银行付款凭证与链上 Hash
              </span>
              <span className="font-code-token text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                电子凭据已固化
              </span>
            </div>
            <div className="text-xs space-y-1.5 text-slate-600">
              <div>付款凭证编号: <strong className="font-code-token text-slate-900">{data.payoutVoucher.voucherNo}</strong></div>
              <div>通道出账模式: <span className="font-medium text-slate-800">{data.payoutVoucher.paymentMethod}</span></div>
              <div>出账时间节点: <span className="font-code-token text-slate-800">{data.payoutVoucher.payoutTime}</span></div>
              {data.payoutVoucher.txHash && (
                <div>区块链验签: <span className="font-code-token text-xs text-blue-600 font-semibold">{data.payoutVoucher.txHash}</span></div>
              )}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => showToast(`已启动出账回单调阅与下载：${data.payoutVoucher.voucherNo}`)}
                  className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-blue-600">download</span>
                  <span>下载正式银行结算回执单 (PDF)</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                增值税专用发票认证存根
              </span>
              <span className="font-code-token text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
                国税认证勾稽
              </span>
            </div>
            <div className="text-xs space-y-1.5 text-slate-600">
              <div>认证发票号码: <strong className="font-code-token text-slate-900">{data.payoutVoucher.invoiceNumber}</strong></div>
              <div>专票税额合计数: <span className="font-numeric-table font-bold text-slate-900">¥{data.payoutVoucher.invoiceTaxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
              <div>电子验讫戳记: <span className="font-code-token text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">{data.payoutVoucher.verificationSeal}</span></div>
              <p className="text-xs text-slate-400 pt-1">
                发票已在全国增值税发票查验平台完成真伪校验与进项税抵扣勾选。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: 审计日志与追溯链 */}
      {activeTab === 6 && (
        <div className="mt-3 bg-slate-50/70 rounded-xl p-4 border border-slate-200/80 space-y-3">
          <div className="text-xs text-slate-600">
            合规审计追踪链（不可篡改流水操作时序）：
          </div>
          <div className="space-y-2">
            {data.auditLogs.map((log) => (
              <div key={log.stepId} className="bg-white p-3 rounded-lg border border-slate-200/80 flex items-start justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-code-token text-blue-600 font-bold">{log.stepId}</span>
                    <span className="font-semibold text-slate-900">{log.actionName}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 font-code-token text-[10px] text-slate-500">
                      节点: {log.node}
                    </span>
                  </div>
                  <p className="text-slate-600">{log.notes}</p>
                </div>
                <div className="text-right">
                  <span className="font-code-token text-[11px] text-slate-400 block">{log.timestamp}</span>
                  <span className="font-code-token text-[11px] text-slate-700 font-medium">经办: {log.operator}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
