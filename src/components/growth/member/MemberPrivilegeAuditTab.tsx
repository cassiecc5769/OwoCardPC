import React from 'react';
import { PrivilegeMarginStat } from './types';

interface MemberPrivilegeAuditTabProps {
  stats: PrivilegeMarginStat[];
  onShowToast: (msg: string) => void;
}

export const MemberPrivilegeAuditTab: React.FC<MemberPrivilegeAuditTabProps> = ({
  stats,
  onShowToast,
}) => {
  const totalGmv = stats.reduce((acc, curr) => acc + curr.totalGmvUsd, 0);
  const totalBonusPayout = stats.reduce((acc, curr) => acc + curr.totalBonusPayoutUsd, 0);

  return (
    <div className="space-y-4 text-slate-800 text-xs antialiased">
      {/* Financial ROI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">高阶加点覆盖出卡流水</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-mono text-2xl font-bold text-slate-900">${(totalGmv / 10000).toFixed(1)}w</span>
            <span className="font-mono text-xs text-slate-400">USD</span>
          </div>
          <div className="text-[11px] text-emerald-600 mt-2 pt-2 border-t border-slate-100 flex justify-between font-medium">
            <span>占平台总盘比例</span>
            <span>68.2%</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">累计会员特权加价支出</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-mono text-2xl font-bold text-blue-600">${totalBonusPayout.toLocaleString()}</span>
            <span className="font-mono text-xs text-slate-400">USD</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex justify-between">
            <span>综合加权加点率</span>
            <span className="font-mono font-semibold text-slate-800">+0.35%</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">特权激励 ROI 投资回报率</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-mono text-2xl font-bold text-emerald-600">312.4%</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex justify-between">
            <span>净毛利增量拉动</span>
            <span className="font-mono text-emerald-600 font-bold">+$133,800 USD</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">极速秒批通道核销总笔数</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-mono text-2xl font-bold text-indigo-600">18,790</span>
            <span className="text-xs text-slate-400">单</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex justify-between">
            <span>平均核销时效</span>
            <span className="font-mono text-slate-800 font-semibold">3.4 秒 (99.8% SLA)</span>
          </div>
        </div>
      </div>

      {/* Brand Breakdown Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">analytics</span>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">卡种梯级加价支出与留存效益矩阵</h4>
              <p className="text-[11px] text-slate-400">实时测算各卡种在不同会员等级的边际贡献率</p>
            </div>
          </div>

          <button
            onClick={() => onShowToast('已重新校准全网特权加点风控毛利安全阈值')}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">sync</span>
            <span>校准毛利红线</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-2.5 px-4">卡种品类</th>
                <th className="py-2.5 px-4">大盘流水占比</th>
                <th className="py-2.5 px-4">出卡成交流水 (USD)</th>
                <th className="py-2.5 px-4">累计核销笔数</th>
                <th className="py-2.5 px-4">平均特权加点</th>
                <th className="py-2.5 px-4">会员溢价补贴支出</th>
                <th className="py-2.5 px-4">复交频次拉动</th>
                <th className="py-2.5 px-4">秒批通道均速</th>
                <th className="py-2.5 px-4 text-right">毛利安全状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-slate-900">
                    {s.cardBrand}
                  </td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-slate-700">
                    {s.gmvSharePercent}%
                  </td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-slate-900">
                    ${s.totalGmvUsd.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-700">
                    {s.orderCount.toLocaleString()} 笔
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold text-emerald-600">
                    {s.avgBonusRate}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-blue-600 font-semibold">
                    ${s.totalBonusPayoutUsd.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold text-emerald-600">
                    {s.repurchaseBoostPercent}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-700">
                    {s.avgSlaSpeedSec} 秒
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                      安全良好 (毛利缓冲充裕)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
