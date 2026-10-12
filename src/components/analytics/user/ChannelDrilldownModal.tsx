import React, { useState } from 'react';
import { ChannelLtvItem } from './types';

interface ChannelDrilldownModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: ChannelLtvItem[];
  initialChannelId?: string;
}

export const ChannelDrilldownModal: React.FC<ChannelDrilldownModalProps> = ({
  isOpen,
  onClose,
  channels,
  initialChannelId,
}) => {
  const [activeChannelId, setActiveChannelId] = useState<string>(
    initialChannelId || channels[0]?.channelId || 'telegram'
  );

  if (!isOpen) return null;

  const currentChannel =
    channels.find((c) => c.channelId === activeChannelId) || channels[0];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 w-full max-w-3xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined text-[20px]">filter_alt</span>
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">获客渠道深度留存与 LTV 效益下钻</h3>
              <p className="text-[11px] text-slate-500">
                对比获客成本 (CAC)、生命周期产出 (90D LTV)、黑产拦截与高价值大客沉淀效能
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* 渠道切换 Tabs */}
        <div className="px-6 pt-3 pb-1 border-b border-slate-200/80 bg-white flex items-center gap-2 overflow-x-auto shrink-0">
          {channels.map((c) => (
            <button
              key={c.channelId}
              onClick={() => setActiveChannelId(c.channelId)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeChannelId === c.channelId
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${c.color}`} />
              <span>{c.channelName}</span>
              <span
                className={`font-code-token text-[10.5px] px-1.5 py-0.2 rounded ${
                  activeChannelId === c.channelId ? 'bg-white/20 text-white' : 'bg-white text-slate-500'
                }`}
              >
                {c.roi}
              </span>
            </button>
          ))}
        </div>

        {/* 主体下钻面板 */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          {/* 4 维核心数值卡 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[11px] block">获客成本 (CAC)</span>
              <span className="font-numeric-stat text-xl font-bold text-slate-900 mt-1 block">
                ${currentChannel.cacUsd.toFixed(2)}
              </span>
              <span className="text-[10.5px] text-slate-400 mt-0.5 block">单新客激活成本</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[11px] block">90天累积单客 LTV</span>
              <span className="font-numeric-stat text-xl font-bold text-blue-700 mt-1 block">
                ${currentChannel.ltv90Usd.toFixed(2)}
              </span>
              <span className="text-[10.5px] text-emerald-700 font-medium mt-0.5 block">
                净回收倍率高
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[11px] block">综合投产比 ROI</span>
              <span className="font-numeric-stat text-xl font-bold text-emerald-700 mt-1 block">
                {currentChannel.roi}
              </span>
              <span className="text-[10.5px] text-slate-400 mt-0.5 block">90天毛利 / CAC</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[11px] block">大客沉淀率 (LV4+)</span>
              <span className="font-numeric-stat text-xl font-bold text-indigo-700 mt-1 block">
                {currentChannel.vipRate}%
              </span>
              <span className="text-[10.5px] text-slate-400 mt-0.5 block">转机构做市客占比</span>
            </div>
          </div>

          {/* 渠道专属画像属性 */}
          <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-200/60 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">
                psychology
              </span>
              <span>渠道用户行为画像与健康度指标</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200/80">
                <span className="text-slate-500 block text-[11px]">累计引流用户规模</span>
                <span className="font-numeric-stat text-base font-bold text-slate-900 mt-0.5 block">
                  {currentChannel.totalAcquired.toLocaleString()} 人
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200/80">
                <span className="text-slate-500 block text-[11px]">首单破冰平均耗时</span>
                <span className="font-numeric-stat text-base font-bold text-slate-900 mt-0.5 block">
                  {Math.round(currentChannel.avgFirstOrderSec / 60)} 分钟
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200/80">
                <span className="text-slate-500 block text-[11px]">黑产 / 假卡拦截率</span>
                <span
                  className={`font-numeric-stat text-base font-bold mt-0.5 block ${
                    currentChannel.fraudInterceptRate > 1 ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {currentChannel.fraudInterceptRate}%
                </span>
              </div>
            </div>
          </div>

          {/* 策略落地引导 */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                verified
              </span>
              <span>业务导向与运营决策建议：{currentChannel.strategicOrientation}</span>
            </h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              {currentChannel.channelId === 'telegram'
                ? '作为全平台综合投产比最高 (35.2x ROI) 且大客沉淀率达 31.8% 的核心出卡渠道，建议增派 2 名专属商务客服常驻做市商大群，提供 24h 优先秒单核销与大额 USDT 即时清算，巩固机构盘基本面。'
                : currentChannel.channelId === 'whatsapp'
                ? '高信用裂变熟人圈层，破冰快、出卡稳定，建议持续迭代“老带新双向返点机制”，对每成功推荐 1 名破冰首单新客的合规老客发放 $10 出卡加成券。'
                : currentChannel.channelId === 'tiktok'
                ? '大众泛流量渠道，获客量大但首单破冰门槛较高且黑产拦截率相对偏高 (1.82%)。需重点优化 H5 落地页的即时卡价展示与小白出卡防骗教学，减少无效落水跳出。'
                : '线下实体当铺、数码档口联盟，客单价大、单笔实体卡出货多。建议在东南亚及中东重点枢纽扩建直连网点，开放本地 POS/扫码核销快捷终端。'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium cursor-pointer shadow-xs"
          >
            完成查看
          </button>
        </div>
      </div>
    </div>
  );
};
