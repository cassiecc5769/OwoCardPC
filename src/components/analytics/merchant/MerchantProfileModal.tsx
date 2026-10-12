import React from 'react';
import { MerchantPerformanceRow } from './types';

interface MerchantProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchant: MerchantPerformanceRow | null;
  onAdjustQuota?: (merchant: MerchantPerformanceRow) => void;
}

export const MerchantProfileModal: React.FC<MerchantProfileModalProps> = ({
  isOpen,
  onClose,
  merchant,
  onAdjustQuota,
}) => {
  if (!isOpen || !merchant) return null;

  const usedRatio = merchant.creditLimitDailyUsd && merchant.creditLimitDailyUsd > 0
    ? Math.min(100, Math.round(((merchant.usedCreditUsd || 0) / merchant.creditLimitDailyUsd) * 100))
    : 0;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 w-full max-w-xl overflow-hidden animate-fadeIn">
        {/* 头部 */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined text-[20px]">store</span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  商户履约全景档案 · {merchant.merchantName}
                </h3>
                <span className={`px-2 py-0.5 rounded font-code-token text-[11px] font-semibold ${
                  merchant.tier === 'Tier-S'
                    ? 'bg-blue-600 text-white'
                    : merchant.tier === 'Tier-A'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : merchant.tier === 'Tier-B'
                    ? 'bg-slate-100 text-slate-700'
                    : 'bg-rose-100 text-rose-700 font-bold animate-pulse'
                }`}>
                  {merchant.tier}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-code-token">
                {merchant.merchantId} · {merchant.channelDesc}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* 主体内容 */}
        <div className="p-6 space-y-4 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
          {/* 4格关键资产与配额概览 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
              <span className="text-slate-400 block text-[11px]">质押保证金</span>
              <span className="font-numeric-stat font-bold text-blue-600 text-sm">
                ${(merchant.collateralUsd || 0).toLocaleString()}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
              <span className="text-slate-400 block text-[11px]">今日接单GMV</span>
              <span className="font-numeric-stat font-bold text-slate-900 text-sm">
                ${merchant.verifiedGmvUsd.toLocaleString()}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
              <span className="text-slate-400 block text-[11px]">综合成功率</span>
              <span className="font-numeric-stat font-bold text-emerald-700 text-sm">
                {merchant.successRate}%
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
              <span className="text-slate-400 block text-[11px]">履约评分</span>
              <span className="font-numeric-stat font-bold text-slate-900 text-sm">
                {merchant.performanceScore} / 100
              </span>
            </div>
          </div>

          {/* 额度消耗进度 */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-medium">日承揽授信额度消耗</span>
              <span className="font-numeric-stat text-slate-900 font-semibold">
                ${(merchant.usedCreditUsd || 0).toLocaleString()} / ${(merchant.creditLimitDailyUsd || 0).toLocaleString()} ({usedRatio}%)
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  usedRatio > 85 ? 'bg-amber-500' : 'bg-blue-600'
                }`}
                style={{ width: `${usedRatio}%` }}
              />
            </div>
          </div>

          {/* 业务链路详细指标 */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <span className="font-semibold text-slate-900 block text-xs">承揽效率与通信链路</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/50">
                <span className="text-slate-500">平均核销耗时:</span>
                <span className="font-numeric-stat font-semibold text-slate-900">
                  {merchant.avgResponseSeconds}s (总耗时: {merchant.totalDurationText})
                </span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/50">
                <span className="text-slate-500">主动拒单率:</span>
                <span className={`font-numeric-stat font-semibold ${merchant.isHighReject ? 'text-rose-600' : 'text-slate-900'}`}>
                  {merchant.activeRejectRate}%
                </span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/50">
                <span className="text-slate-500">主力承揽品类:</span>
                <span className="font-medium text-slate-800">{merchant.majorCards}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/50">
                <span className="text-slate-500">涉诉纠纷笔数:</span>
                <span className={`font-numeric-stat font-semibold ${merchant.disputeCaseCount && merchant.disputeCaseCount > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {merchant.disputeCaseCount || 0} 笔争议
                </span>
              </div>
            </div>
          </div>

          {/* 联络与结算通道 */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <span className="font-semibold text-slate-900 block text-xs">商业联系与清算通道</span>
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">专属联系人</span>
                <span className="font-medium text-slate-900">{merchant.contactPerson || '未设置'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Telegram 专线</span>
                <span className="font-code-token font-medium text-blue-600">
                  {merchant.telegramAccount || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">清算币种</span>
                <span className="font-code-token font-semibold text-slate-900">
                  {merchant.settlementCurrency || 'USDT'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              if (onAdjustQuota) {
                onClose();
                onAdjustQuota(merchant);
              }
            }}
            className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer text-xs flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>调整承揽授信额度</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
          >
            关闭档案
          </button>
        </div>
      </div>
    </div>
  );
};
