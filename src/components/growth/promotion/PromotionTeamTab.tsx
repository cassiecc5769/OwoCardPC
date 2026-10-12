import React, { useState } from 'react';
import { TeamItem, PromoterItem } from './types';

interface PromotionTeamTabProps {
  teams: TeamItem[];
  promoters: PromoterItem[];
  onSelectTeamMember: (promoter: PromoterItem) => void;
  onShowToast: (msg: string) => void;
}

export const PromotionTeamTab: React.FC<PromotionTeamTabProps> = ({
  teams,
  promoters,
  onSelectTeamMember,
  onShowToast
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'gmv' | 'perCapita' | 'members'>('gmv');

  const sortedTeams = [...teams].sort((a, b) => {
    if (sortBy === 'gmv') return b.monthlyGmv - a.monthlyGmv;
    if (sortBy === 'perCapita') return b.perCapitaGmv - a.perCapitaGmv;
    return b.membersCount - a.membersCount;
  });

  const activeTeam = teams.find(t => t.id === selectedTeamId);
  const activeTeamPromoters = promoters.filter(p => p.teamId === selectedTeamId);

  return (
    <div className="space-y-4">
      {/* 团队大盘宏观指标 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-label-caps uppercase font-semibold">战队编制总览</span>
          <div className="my-1.5 flex items-baseline gap-2">
            <span className="font-numeric-stat text-2xl font-bold text-slate-900 tracking-tight">18</span>
            <span className="text-xs text-slate-400">个战队组 / 142 名专员</span>
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>平均每组专员</span>
            <span className="font-numeric-table text-slate-800 font-semibold">7.9 人 / 组</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-label-caps uppercase font-semibold">战队平均在岗率</span>
          <div className="my-1.5 flex items-baseline gap-2">
            <span className="font-numeric-stat text-2xl font-bold text-emerald-700 tracking-tight">92.4%</span>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-code-token font-semibold border border-emerald-200/60">在岗 128人</span>
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>休假托管</span>
            <span className="font-numeric-table text-slate-800 font-semibold">14 人</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-label-caps uppercase font-semibold">全网平均人效 GMV</span>
          <div className="my-1.5 flex items-baseline gap-2">
            <span className="font-numeric-stat text-2xl font-bold text-blue-600 tracking-tight">$20,410</span>
            <span className="text-xs text-slate-400">/ 专员月均</span>
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>最高人效战队</span>
            <span className="font-code-token text-blue-600 font-semibold">中东直营 ($26,000)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-label-caps uppercase font-semibold">全员平级体系巡检</span>
          <div className="my-1.5 flex items-baseline gap-2">
            <span className="font-numeric-stat text-2xl font-bold text-emerald-700 tracking-tight">PASS</span>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-code-token font-semibold border border-emerald-200/60">0 代理层级</span>
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>抽水抽成防范</span>
            <span className="font-code-token text-emerald-700 font-semibold">100% 严禁</span>
          </div>
        </div>
      </div>

      {/* 团队列表与人效矩阵表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">groups</span>
              <span>18 组推广战队人效矩阵与合规监控</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              各团队严格实施作业排班与一人一码考核，严禁组长从组员业绩中抽取提成。
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">排序方式:</span>
            <button
              onClick={() => setSortBy('gmv')}
              className={`px-3 py-1 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
                sortBy === 'gmv' ? 'bg-blue-600 text-white shadow-xs font-semibold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
              }`}
            >
              月流水 GMV
            </button>
            <button
              onClick={() => setSortBy('perCapita')}
              className={`px-3 py-1 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
                sortBy === 'perCapita' ? 'bg-blue-600 text-white shadow-xs font-semibold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
              }`}
            >
              人均出单效能
            </button>
            <button
              onClick={() => setSortBy('members')}
              className={`px-3 py-1 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
                sortBy === 'members' ? 'bg-blue-600 text-white shadow-xs font-semibold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
              }`}
            >
              编制规模
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-semibold text-[11px] uppercase tracking-wider h-10 border-b border-slate-200 select-none">
                <th className="py-2.5 px-4 font-semibold">战队名称 / 驻地</th>
                <th className="py-2.5 px-3 font-semibold">战队负责人</th>
                <th className="py-2.5 px-3 font-semibold text-center">编制人数 / 在岗</th>
                <th className="py-2.5 px-3 font-semibold text-right">直属一级客</th>
                <th className="py-2.5 px-3 font-semibold text-right">二级裂变客</th>
                <th className="py-2.5 px-3 font-semibold text-right">月核销单量</th>
                <th className="py-2.5 px-3 font-semibold text-right">贡献流水 (GMV)</th>
                <th className="py-2.5 px-3 font-semibold text-right">人均产出 (GMV/人)</th>
                <th className="py-2.5 px-3 font-semibold text-right">预估团队提成池</th>
                <th className="py-2.5 px-3 font-semibold text-center">合规状态</th>
                <th className="py-2.5 px-4 font-semibold text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {sortedTeams.map((team, idx) => {
                const isReview = team.auditStatus === 'REVIEW';

                return (
                  <tr key={team.id} className="h-12 hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="font-code-token text-xs font-bold text-slate-400 w-5">
                          #{idx + 1}
                        </span>
                        <div>
                          <span className="font-semibold text-slate-900 text-xs">{team.name}</span>
                          <span className="font-code-token text-[10px] text-slate-400 block">{team.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="font-medium text-slate-800 text-xs">{team.leader}</span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span className="font-numeric-table text-xs font-semibold text-slate-900">{team.membersCount}</span>
                      <span className="text-slate-400 text-[11px]"> 人 (在岗 {team.activeCount})</span>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <span className="font-numeric-table text-xs font-semibold text-blue-600">
                        {team.tier1Total.toLocaleString()}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <span className="font-numeric-table text-xs font-semibold text-indigo-600">
                        {team.tier2Total.toLocaleString()}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <span className="font-numeric-table text-xs font-semibold text-slate-800">
                        {team.monthlyOrders.toLocaleString()} <span className="text-slate-400 font-normal text-[11px]">单</span>
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <span className="font-numeric-table text-xs font-bold text-slate-900">
                        ${team.monthlyGmv.toLocaleString()}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <span className="font-numeric-table text-xs font-semibold text-emerald-700">
                        ${team.perCapitaGmv.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <span className="font-numeric-table text-xs font-bold text-slate-800">
                        ${team.estimatedCommission.toLocaleString()}
                      </span>
                      <span className="font-code-token text-[10px] text-slate-400 block">专员直发</span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {isReview ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-code-token text-[10px] font-semibold border border-amber-200">
                          风控核验中
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-code-token text-[10px] font-semibold border border-emerald-200">
                          PASS 规范
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedTeamId(team.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-blue-600 font-medium text-xs transition-colors cursor-pointer border border-slate-200/60"
                      >
                        战队专员 ({team.membersCount})
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 战队专员穿透模态框 */}
      {activeTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[80vh] flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">groups</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">{activeTeam.name} · 专员名录与业绩</h3>
                  <p className="text-[11px] text-slate-500">组长: {activeTeam.leader} · 全员平级独立核算</p>
                </div>
              </div>
              <button onClick={() => setSelectedTeamId(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3">
              {activeTeamPromoters.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  暂无匹配的专员明细样本，该战队共包含 {activeTeam.membersCount} 位成员。
                </div>
              ) : (
                activeTeamPromoters.map(p => (
                  <div key={p.id} className="p-3.5 rounded-lg border border-slate-200/80 bg-white flex items-center justify-between hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded font-code-token font-bold text-xs flex items-center justify-center ${p.avatarBg}`}>
                        {p.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 text-xs">{p.name}</span>
                          <span className="font-code-token text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-blue-200/60">
                            码: {p.inviteCode}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-code-token">{p.id} · {p.title}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-numeric-table">
                      <div className="text-right">
                        <span className="text-slate-400 text-[10px] block font-sans">月有效 GMV</span>
                        <span className="font-bold text-slate-900">${p.gmv.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 text-[10px] block font-sans">预估提成</span>
                        <span className="font-bold text-emerald-700">${p.estimatedCommission.toLocaleString()}</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedTeamId(null);
                          onSelectTeamMember(p);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer text-xs shadow-xs"
                      >
                        穿透分析
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-[11px] text-slate-500 font-code-token">组内推广员无层级差额提成，100% 遵循红线一平级规范</span>
              <button
                onClick={() => setSelectedTeamId(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-900 transition-colors text-xs cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
