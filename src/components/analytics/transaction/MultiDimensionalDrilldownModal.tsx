import React, { useState } from 'react';
import { MultiDimensionalRowItem, MOCK_DRILLDOWN_ORDERS, DrilldownOrderRecord } from './multiDimensionalData';

interface MultiDimensionalDrilldownModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MultiDimensionalRowItem | null;
  onShowToast?: (msg: string) => void;
}

export const MultiDimensionalDrilldownModal: React.FC<MultiDimensionalDrilldownModalProps> = ({
  isOpen,
  onClose,
  item,
  onShowToast,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<DrilldownOrderRecord | null>(null);

  if (!isOpen || !item) return null;

  const filteredOrders = MOCK_DRILLDOWN_ORDERS.filter((o) => {
    if (filterStatus !== 'ALL' && o.status !== filterStatus) return false;
    return true;
  });

  const handleAction = (actionName: string, orderId: string) => {
    if (onShowToast) {
      onShowToast(`针对订单 ${orderId} 已下发动作: ${actionName}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-outline-variant/30 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-surface-container-low/80 border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${item.iconBg} ${item.iconColor}`}
            >
              {item.iconText}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                  {item.isWarning ? '异常故障卡单穿透排查' : '多维卡单明细穿透流'} · {item.name}
                </h3>
                <span className="font-code-token text-[11px] text-outline px-1.5 py-0.5 bg-white rounded border border-outline-variant/30">
                  {item.code}
                </span>
                {item.isWarning ? (
                  <span className="px-1.5 py-0.5 rounded bg-error text-on-error font-bold text-[10px] flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[12px]">warning</span>
                    触发熔断排查
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded bg-secondary-container/40 text-secondary font-bold text-[10px]">
                    全链路透视
                  </span>
                )}
              </div>
              <p className="text-[11px] text-on-surface-variant">
                已实时关联发卡行网关回执、OCR 智能初审与商户做卡履约双边账单
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-container text-outline hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-5 py-2.5 bg-surface-container-lowest border-b border-outline-variant/20 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-outline font-semibold">状态筛选:</span>
            <div className="flex items-center bg-surface-container-low p-0.5 rounded-lg border border-outline-variant/30">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  filterStatus === 'ALL'
                    ? 'bg-primary text-on-primary font-medium shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                全部 ({MOCK_DRILLDOWN_ORDERS.length})
              </button>
              <button
                onClick={() => setFilterStatus('FAILED')}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  filterStatus === 'FAILED'
                    ? 'bg-error text-on-error font-medium shadow-xs'
                    : 'text-error hover:bg-error/10'
                }`}
              >
                失败待排查 (1)
              </button>
              <button
                onClick={() => setFilterStatus('DISPUTE')}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  filterStatus === 'DISPUTE'
                    ? 'bg-amber-600 text-white font-medium shadow-xs'
                    : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                争议冻结 (1)
              </button>
              <button
                onClick={() => setFilterStatus('SUCCESS')}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  filterStatus === 'SUCCESS'
                    ? 'bg-secondary text-on-secondary font-medium shadow-xs'
                    : 'text-secondary hover:bg-secondary/10'
                }`}
              >
                核销成功 (4)
              </button>
            </div>
          </div>

          <div className="text-outline font-numeric-table text-[11px]">
            当前样本量: {filteredOrders.length} 笔订单
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="rounded-xl border border-outline-variant/30 overflow-hidden">
            <table className="w-full text-left border-collapse text-xs font-numeric-table">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-caps text-[11px] border-b border-outline-variant/20">
                  <th className="py-2.5 px-3">订单号 / 时间</th>
                  <th className="py-2.5 px-3">卡密凭证 (脱敏)</th>
                  <th className="py-2.5 px-3 text-right">面值 (USD)</th>
                  <th className="py-2.5 px-3 text-right">结算折率</th>
                  <th className="py-2.5 px-3">承兑商户 / 通道</th>
                  <th className="py-2.5 px-3">核销时效</th>
                  <th className="py-2.5 px-3">当前状态</th>
                  <th className="py-2.5 px-3 text-center">处置操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low text-on-surface">
                {filteredOrders.map((ord) => {
                  const isErr = ord.status === 'FAILED' || ord.status === 'DISPUTE';
                  return (
                    <tr
                      key={ord.orderId}
                      className={`hover:bg-surface-container-low/50 transition-colors ${
                        isErr ? 'bg-error-container/10' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-on-surface">{ord.orderId}</div>
                        <div className="text-[10px] text-outline">{ord.createdAt}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-code-token px-1.5 py-0.5 bg-surface-container rounded border border-outline-variant/30 text-on-surface">
                          {ord.pinMasked}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-on-surface">
                        ${ord.faceValue}.00
                      </td>
                      <td className="py-2.5 px-3 text-right font-code-token">
                        {ord.discountRate.toFixed(4)}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-body-sm text-xs font-medium text-on-surface">
                          {ord.merchantName}
                        </div>
                        <div className="text-[10px] text-outline">{ord.channelName}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-semibold ${
                            ord.durationSec > 60 ? 'text-error' : 'text-secondary'
                          }`}
                        >
                          {ord.durationSec}s
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {ord.status === 'SUCCESS' && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-secondary-container/40 text-secondary">
                            {ord.statusLabel}
                          </span>
                        )}
                        {ord.status === 'FAILED' && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-error text-on-error">
                            {ord.statusLabel}
                          </span>
                        )}
                        {ord.status === 'DISPUTE' && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500 text-white">
                            {ord.statusLabel}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedRecord(ord)}
                            className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary text-xs cursor-pointer font-medium"
                          >
                            日志
                          </button>
                          {isErr ? (
                            <button
                              onClick={() => handleAction('发起商户质询与重审', ord.orderId)}
                              className="px-2 py-1 rounded bg-error text-on-error hover:bg-error/90 text-xs cursor-pointer font-medium flex items-center gap-0.5"
                            >
                              <span>质询</span>
                              <span className="material-symbols-outlined text-[12px]">send</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAction('复制发卡网关报文', ord.orderId)}
                              className="px-2 py-1 rounded bg-primary text-on-primary hover:bg-primary/90 text-xs cursor-pointer font-medium"
                            >
                              报文
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Selected record details panel */}
          {selectedRecord && (
            <div className="mt-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">terminal</span>
                  <span className="font-bold text-xs text-on-surface">
                    订单审计日志与底层网关回执 · {selectedRecord.orderId}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-outline hover:text-on-surface text-xs cursor-pointer"
                >
                  关闭
                </button>
              </div>
              <div className="mt-2.5 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-outline block">发卡网关错误回执:</span>
                  <p className="font-code-token text-[11px] bg-white p-2 rounded border border-outline-variant/30 text-error mt-1">
                    {selectedRecord.failureReason || 'HTTP 200 OK: STATUS_ACCEPTED_SETTLED'}
                  </p>
                </div>
                <div>
                  <span className="text-outline block">风控策略与后续处置:</span>
                  <p className="text-[11px] bg-white p-2 rounded border border-outline-variant/30 text-on-surface mt-1">
                    {selectedRecord.actionTaken || '系统自动核销闭环完成，已转入商户待清算总账簿。'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-surface-container-low/40 border-t border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-outline">
            <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
            <span>已启用金融级不可篡改数据存证与双边对账追溯</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-primary text-on-primary hover:bg-primary/90 text-xs font-medium rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            关闭透视
          </button>
        </div>
      </div>
    </div>
  );
};
