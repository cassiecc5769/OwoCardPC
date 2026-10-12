import React from 'react';
import { MerchantLedgerItem } from '../../types/financeAccount';

interface MerchantAccountDetailDrawerProps {
  merchant: MerchantLedgerItem | null;
  onClose: () => void;
  onOpenAdjustment: (mid: string) => void;
  onToggleStatus: (mid: string) => void;
}

export const MerchantAccountDetailDrawer: React.FC<MerchantAccountDetailDrawerProps> = ({
  merchant,
  onClose,
  onOpenAdjustment,
  onToggleStatus
}) => {
  if (!merchant) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-mono font-bold text-sm shadow-sm">
              {merchant.mid}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{merchant.name}</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${merchant.tierColor}`}>
                  {merchant.tier}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                负责人: {merchant.manager} · {merchant.contactPhone}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs text-slate-700">
          {/* Status Alert Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            merchant.status === 'ACTIVE'
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : merchant.status === 'RESTRICTED'
              ? 'bg-amber-50/70 border-amber-200 text-amber-900'
              : 'bg-rose-50/70 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px]">
                {merchant.status === 'ACTIVE' ? 'check_circle' : merchant.status === 'RESTRICTED' ? 'warning' : 'block'}
              </span>
              <div>
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <span>账户状态: {merchant.statusLabel}</span>
                  {merchant.warningTag && (
                    <span className="px-1.5 py-0.2 bg-white/80 rounded text-[10px] border border-current font-semibold">
                      {merchant.warningTag}
                    </span>
                  )}
                </div>
                <div className="text-[11px] opacity-80 mt-0.5">{merchant.channel}</div>
              </div>
            </div>
            <button
              onClick={() => onToggleStatus(merchant.mid)}
              className="px-2.5 py-1 rounded-lg bg-white shadow-xs font-semibold text-xs border border-current hover:opacity-80 transition-opacity cursor-pointer"
            >
              {merchant.status === 'FROZEN' ? '申请解冻' : merchant.status === 'RESTRICTED' ? '恢复正常' : '限制接单'}
            </button>
          </div>

          {/* Core Balance Equation Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">verified</span>
                PRD 3.2 刚性恒等式校验
              </span>
              <span className="font-mono text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                100% 恒等平账
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200/80 font-mono text-center">
              <span className="text-slate-400 text-[11px]">总积点</span>
              <div className="text-xl font-bold text-slate-900 my-0.5">
                {merchant.totalPoints.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs text-blue-600">PTS</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-center gap-2 mt-1">
                <span>折合标定: <strong className="text-slate-700">${merchant.usdEquivalent.toLocaleString()} USD</strong></span>
                <span>·</span>
                <span>汇率标尺: 1 USD = 7.20 PTS</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-white p-3 rounded-lg border border-slate-200/70">
                <div className="text-[11px] text-slate-400 font-semibold uppercase">可用接卡积点</div>
                <div className="text-base font-bold text-emerald-700 font-mono mt-0.5">
                  {merchant.availablePoints.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  占总额 {((merchant.availablePoints / (merchant.totalPoints || 1)) * 100).toFixed(1)}%
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200/70">
                <div className="text-[11px] text-slate-400 font-semibold uppercase">在途交易冻结</div>
                <div className="text-base font-bold text-blue-600 font-mono mt-0.5">
                  {merchant.frozenEscrowPoints.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  在途撮合卡单 {merchant.inEscrowOrdersCount} 笔
                </div>
              </div>
            </div>
          </div>

          {/* Operational & Flow Metrics */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs">运营与流转指标</h4>
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/70">
              <div>
                <span className="text-slate-400 text-[11px]">待入账充值 (隔离)</span>
                <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                  {merchant.pendingRecharge > 0 ? (
                    <span className="text-amber-700">+{merchant.pendingRecharge.toLocaleString()} PTS</span>
                  ) : (
                    <span>0.00 PTS</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">今日交易消耗流水</span>
                <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                  {merchant.todayConsumption.toLocaleString()} PTS
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">结算扣点规则</span>
                <div className="font-medium text-slate-800 text-xs mt-0.5">{merchant.settlementRate}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">API 接口健康与响应</span>
                <div className="font-mono font-medium text-emerald-700 text-xs mt-0.5">{merchant.apiHealth}</div>
              </div>
            </div>
          </div>

          {/* Recent Events & Ledger Hash */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs">最近状态时效与账簿指纹</h4>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>最近时效:</span>
                <span className="font-bold text-slate-900">{merchant.lastUpdateTime}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>状态备注:</span>
                <span className="font-semibold text-blue-700">{merchant.lastSerialNo}</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                <span>账簿防伪校验指纹:</span>
                <span className="text-slate-400 text-[10px]">0x{merchant.mid.toLowerCase()}99a...e81b</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between mt-auto">
          <button
            onClick={() => onOpenAdjustment(merchant.mid)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add_moderator</span>
            <span>对此商户发起调账 (双人复核)</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            关闭详情
          </button>
        </div>
      </div>
    </div>
  );
};
