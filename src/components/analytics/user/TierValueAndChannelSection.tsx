import React from 'react';
import { MemberTierValueItem, ChannelLtvItem } from './types';

interface TierValueAndChannelSectionProps {
  tiers: MemberTierValueItem[];
  channels: ChannelLtvItem[];
  onOpenProtectionPolicy: () => void;
  onOpenChannelDrilldown: (channel?: ChannelLtvItem) => void;
  onSelectTier?: (tier: MemberTierValueItem) => void;
}

export const TierValueAndChannelSection: React.FC<TierValueAndChannelSectionProps> = ({
  tiers,
  channels,
  onOpenProtectionPolicy,
  onOpenChannelDrilldown,
  onSelectTier,
}) => {
  return (
    <section className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
      {/* 左侧：LV1~LV5 用户量占比 vs 贡献 GMV 占比倒挂图 (5列) */}
      <div className="xl:col-span-5 bg-white rounded-xl shadow-xs border border-slate-200/80 p-4 flex flex-col justify-between">
        <div className="flex flex-col gap-1 pb-2 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-blue-600 rounded-xs" />
              <h3 className="font-headline-md text-sm font-bold text-slate-900 tracking-tight">
                会员等级价值倒挂结构
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200/70 font-code-token text-[11px] font-semibold">
              头部集中效应
            </span>
          </div>
          <span className="font-body-sm text-xs text-slate-500">
            LV4/LV5 仅占总人口 6.1%，但贡献全平台 58.4% GMV
          </span>
        </div>

        {/* 结构条对比图 */}
        <div className="flex flex-col gap-3.5 my-3">
          {tiers.map((tier) => (
            <div
              key={tier.tierId}
              onClick={() => onSelectTier && onSelectTier(tier)}
              className="flex flex-col gap-1 group cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              title={`点击查看 ${tier.tierName} 详细画像及准入标准`}
            >
              <div className="flex items-center justify-between font-body-sm text-xs">
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: tier.color }}
                  />
                  <span>{tier.tierName}</span>
                </span>

                <div className="flex items-center gap-3 font-numeric-table text-xs">
                  <span className="text-slate-500">人数 {tier.userSharePercent}%</span>
                  <span
                    className={`font-semibold ${
                      tier.tierId === 'lv5' || tier.tierId === 'lv4'
                        ? 'text-blue-700'
                        : 'text-slate-800'
                    }`}
                  >
                    贡献 {tier.gmvSharePercent}% GMV
                  </span>
                </div>
              </div>

              {/* 复合双色进度条 */}
              <div className="w-full bg-slate-100 rounded-full h-2 flex overflow-hidden">
                <div
                  className="bg-slate-200 transition-all duration-300"
                  style={{ width: `${tier.userSharePercent}%` }}
                />
                <div
                  className="transition-all duration-300"
                  style={{
                    width: `${tier.gmvSharePercent}%`,
                    backgroundColor: tier.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* 底部大客流失预警阈值与配置策略 */}
        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between font-code-token text-xs mt-1">
          <span className="text-slate-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-amber-500 text-[16px]">warning</span>
            <span>大客流失预警阈值: 连续 72h 无挂单</span>
          </span>
          <button
            onClick={onOpenProtectionPolicy}
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5 cursor-pointer hover:underline"
          >
            <span>配置分级保护策略</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* 右侧：渠道 LTV 质量横向对比 (7列) */}
      <div className="xl:col-span-7 bg-white rounded-xl shadow-xs border border-slate-200/80 p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-blue-600 rounded-xs" />
            <h3 className="font-headline-md text-sm font-bold text-slate-900 tracking-tight">
              核心获客渠道 CAC 与 90天 LTV 效益矩阵
            </h3>
          </div>
          <span className="font-code-token text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
            结算周期: 90 Days
          </span>
        </div>

        {/* 渠道数据比对表格 */}
        <div className="w-full overflow-x-auto my-1">
          <table className="w-full text-left font-numeric-table text-xs border-collapse">
            <thead>
              <tr className="h-9 bg-slate-50 text-slate-600 font-label-caps text-[11px] uppercase tracking-wider border-b border-slate-200">
                <th className="px-3.5 py-2 font-semibold">获客渠道通道</th>
                <th className="px-3.5 py-2 text-right font-semibold">获客成本 (CAC)</th>
                <th className="px-3.5 py-2 text-right font-semibold">90天 LTV</th>
                <th className="px-3.5 py-2 text-center font-semibold">综合 ROI</th>
                <th className="px-3.5 py-2 text-center font-semibold">大客沉淀率</th>
                <th className="px-3.5 py-2 text-right font-semibold">策略导向</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {channels.map((channel) => (
                <tr
                  key={channel.channelId}
                  onClick={() => onOpenChannelDrilldown(channel)}
                  className="h-12 hover:bg-slate-50/80 transition-colors cursor-pointer"
                  title="点击查看渠道深度留存画像"
                >
                  {/* 获客渠道通道 */}
                  <td className="px-3.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${channel.color}`} />
                      <div>
                        <span className="font-semibold text-slate-900 block leading-snug">
                          {channel.channelName}
                        </span>
                        <span className="font-code-token text-[10.5px] text-slate-400">
                          {channel.tag}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 获客成本 (CAC) */}
                  <td className="px-3.5 text-right text-slate-800 font-numeric-stat">
                    ${channel.cacUsd.toFixed(2)}
                  </td>

                  {/* 90天 LTV */}
                  <td className="px-3.5 text-right font-semibold text-slate-900 font-numeric-stat">
                    ${channel.ltv90Usd.toFixed(2)}
                  </td>

                  {/* 综合 ROI */}
                  <td className="px-3.5 text-center">
                    <span
                      className={`px-2 py-0.5 rounded font-semibold font-code-token text-[11px] ${
                        channel.roiVal >= 30
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
                          : channel.roiVal >= 20
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {channel.roi}
                    </span>
                  </td>

                  {/* 大客沉淀率 */}
                  <td className="px-3.5 text-center text-slate-900 font-semibold font-numeric-stat">
                    {channel.vipRate}%
                  </td>

                  {/* 策略导向 */}
                  <td className="px-3.5 text-right">
                    <span
                      className={`font-body-sm text-xs font-semibold ${
                        channel.channelId === 'telegram'
                          ? 'text-blue-600'
                          : channel.channelId === 'whatsapp' || channel.channelId === 'otc'
                          ? 'text-emerald-700'
                          : 'text-slate-600'
                      }`}
                    >
                      {channel.strategicOrientation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 底部最优渠道与下钻深度漏斗 */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100 font-body-sm text-xs text-slate-500">
          <span>
            综合投产比最优渠道:{' '}
            <strong className="text-blue-600 font-semibold">
              Telegram 做市商群 (35.2x ROI)
            </strong>
          </span>
          <button
            onClick={() => onOpenChannelDrilldown()}
            className="text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>下钻渠道深度留存漏斗</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      </div>
    </section>
  );
};
