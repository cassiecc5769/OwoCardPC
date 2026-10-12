import React, { useState, useMemo } from 'react';
import { AttributionUserItem } from './types';

interface PromotionUserTabProps {
  users: AttributionUserItem[];
  onShowToast: (msg: string) => void;
}

export const PromotionUserTab: React.FC<PromotionUserTabProps> = ({
  users,
  onShowToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'tier1' | 'tier2' | 'tier3_blocked'>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | 'NORMAL' | 'OBSERVE' | 'BLOCKED'>('all');
  const [selectedUser, setSelectedUser] = useState<AttributionUserItem | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch =
        searchTerm === '' ||
        u.uid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.promoterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.inviteCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone.includes(searchTerm);

      const matchesTier = tierFilter === 'all' || u.tier === tierFilter;
      const matchesRisk = riskFilter === 'all' || u.riskStatus === riskFilter;

      return matchesSearch && matchesTier && matchesRisk;
    });
  }, [users, searchTerm, tierFilter, riskFilter]);

  return (
    <div className="space-y-4">
      {/* 核心大盘指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] text-slate-500 font-label-caps uppercase font-semibold">累计裂变用户大盘</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-code-token text-[10px] font-semibold border border-blue-200/60">
              终身锁客
            </span>
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="font-numeric-stat text-2xl font-bold text-slate-900 tracking-tight">68,420</span>
            <span className="text-xs text-slate-400">人</span>
          </div>
          <div className="text-xs text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>活跃出卡用户</span>
            <span className="font-numeric-table text-slate-800 font-semibold">41,250 人 (60.3%)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] text-slate-500 font-label-caps uppercase font-semibold">一级直属绑客 (Tier 1)</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-code-token text-[10px] font-semibold border border-emerald-200/60">
              4.0% 提成
            </span>
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="font-numeric-stat text-2xl font-bold text-blue-600 tracking-tight">45,210</span>
            <span className="text-xs text-slate-400">人 (66.1%)</span>
          </div>
          <div className="text-xs text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>直属首单转化</span>
            <span className="font-code-token text-emerald-700 font-semibold">82.4%</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] text-slate-500 font-label-caps uppercase font-semibold">二级裂变穿透 (Tier 2)</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-code-token text-[10px] font-semibold border border-indigo-200/60">
              1.0% 提成
            </span>
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="font-numeric-stat text-2xl font-bold text-indigo-600 tracking-tight">23,210</span>
            <span className="text-xs text-slate-400">人 (33.9%)</span>
          </div>
          <div className="text-xs text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>次级自然裂变倍率</span>
            <span className="font-code-token text-indigo-700 font-semibold">1 : 0.51</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] text-slate-500 font-label-caps uppercase font-semibold">第3级熔断阻断率</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-code-token text-[10px] font-semibold border border-rose-200/60">
              0 违规穿透
            </span>
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="font-numeric-stat text-2xl font-bold text-emerald-700 tracking-tight">100.0%</span>
            <span className="text-xs text-slate-400">熔断拦截</span>
          </div>
          <div className="text-xs text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>累计拦截阻断次数</span>
            <span className="font-numeric-table text-rose-600 font-semibold">1,429 次</span>
          </div>
        </div>
      </div>

      {/* 搜索过滤栏 */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[260px] max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-slate-400">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="搜索注册用户 UID / 归属专员 / 邀请码 / 手机号..."
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-50 text-slate-900 text-xs border border-slate-200/80 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
              />
            </div>

            {/* 归因层级 */}
            <select
              value={tierFilter}
              onChange={e => setTierFilter(e.target.value as any)}
              className="h-9 px-3 rounded-lg bg-slate-50 text-slate-800 text-xs border border-slate-200/80 focus:bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">层级: 全部归因口径</option>
              <option value="tier1">一级直属客 (Tier 1)</option>
              <option value="tier2">二级裂变客 (Tier 2)</option>
              <option value="tier3_blocked">第3级熔断阻断 (Tier 3 Blocked)</option>
            </select>

            {/* 风控状态 */}
            <select
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value as any)}
              className="h-9 px-3 rounded-lg bg-slate-50 text-slate-800 text-xs border border-slate-200/80 focus:bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">风控: 全部状态</option>
              <option value="NORMAL">正常状态 (Pass)</option>
              <option value="OBSERVE">同IP观察中</option>
              <option value="BLOCKED">智能合约已阻断</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onShowToast('已导出穿透客户清单 (.csv)')}
              className="h-9 px-3.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/60 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>导出客户穿透集</span>
            </button>
          </div>
        </div>
      </div>

      {/* 用户穿透表格 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-semibold text-[11px] uppercase tracking-wider h-10 border-b border-slate-200 select-none">
                <th className="py-2.5 px-4 font-semibold">用户 UID / 绑定手机</th>
                <th className="py-2.5 px-3 font-semibold">归属推广员 / 专属码</th>
                <th className="py-2.5 px-3 font-semibold">触点来源</th>
                <th className="py-2.5 px-3 font-semibold">归因层级与提成点</th>
                <th className="py-2.5 px-3 font-semibold">首单卡种 / 面额</th>
                <th className="py-2.5 px-3 font-semibold text-right">出单次数</th>
                <th className="py-2.5 px-3 font-semibold text-right">累计 GMV 流水</th>
                <th className="py-2.5 px-3 font-semibold text-center">风控安全分</th>
                <th className="py-2.5 px-4 font-semibold text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredUsers.map(u => {
                const isBlocked = u.tier === 'tier3_blocked';

                return (
                  <tr key={u.id} className={`h-12 hover:bg-slate-50/80 transition-colors ${isBlocked ? 'bg-rose-50/30' : ''}`}>
                    <td className="py-2.5 px-4">
                      <div>
                        <span className="font-code-token font-semibold text-slate-900 text-xs">{u.uid}</span>
                        <span className="font-code-token text-[11px] text-slate-400 block">{u.phone}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-800">{u.promoterName}</span>
                        <span className="font-code-token text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-blue-200/60">
                          {u.inviteCode}
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="text-slate-700 text-xs font-medium">{u.channel}</span>
                      <span className="text-slate-400 text-[10px] font-code-token block">{u.ipLocation}</span>
                    </td>

                    <td className="py-2.5 px-3">
                      {u.tier === 'tier1' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-code-token text-[11px] font-semibold border border-blue-200/70">
                          一级直属 (4.0%)
                        </span>
                      )}
                      {u.tier === 'tier2' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-code-token text-[11px] font-semibold border border-indigo-200/70">
                          二级裂变 (1.0%)
                        </span>
                      )}
                      {u.tier === 'tier3_blocked' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-code-token text-[11px] font-semibold border border-rose-300">
                          第3级熔断阻断 (0%)
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="font-medium text-slate-800 text-xs">{u.firstOrderCard}</span>
                      <span className="text-slate-400 text-[10px] font-code-token block">{u.firstOrderTime}</span>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <span className="font-numeric-table text-xs font-semibold text-slate-900">{u.totalOrders} 笔</span>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <span className="font-numeric-table text-xs font-bold text-slate-900">${u.totalGmv.toFixed(2)}</span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span className={`font-code-token text-xs font-bold px-2 py-0.5 rounded-full border ${
                        u.riskScore >= 90
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : u.riskScore >= 60
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-100 text-rose-800 border-rose-200'
                      }`}>
                        {u.riskScore} 分
                      </span>
                    </td>

                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-blue-600 font-medium text-xs transition-colors cursor-pointer border border-slate-200/60"
                      >
                        链路拓扑
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 归因链路拓扑弹窗 */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">account_tree</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">{selectedUser.uid} · 归因链路拓扑</h3>
                  <p className="text-[11px] text-slate-500">两级封顶模型智能合约审计视图</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-3 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
                {/* 节点 1: 推广员 */}
                <div className="relative flex items-start gap-3 pl-8">
                  <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-blue-100"></div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex-1">
                    <span className="text-[10px] text-slate-500 font-label-caps uppercase font-semibold">根触点 · 平台推广专员</span>
                    <div className="font-semibold text-slate-900 mt-1">
                      {selectedUser.promoterName} <span className="font-code-token text-xs text-slate-500">({selectedUser.promoterId})</span>
                    </div>
                    <div className="text-[11px] text-blue-700 font-code-token mt-0.5 font-medium">
                      专属防伪码: {selectedUser.inviteCode}
                    </div>
                  </div>
                </div>

                {/* 节点 2: 一级直属 */}
                <div className="relative flex items-start gap-3 pl-8">
                  <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-indigo-100"></div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-label-caps uppercase font-semibold">一级直属绑客 (Tier 1)</span>
                      <span className="text-emerald-700 font-semibold font-code-token text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">提成: 4.0%</span>
                    </div>
                    <div className="font-semibold text-slate-900 mt-1 font-code-token">
                      {selectedUser.tier === 'tier1' ? selectedUser.uid : 'UID-889021 (上级转介者)'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">注册时间: 2024-03-12 14:22 · 终身锁客</div>
                  </div>
                </div>

                {/* 节点 3: 二级或阻断 */}
                {selectedUser.tier !== 'tier1' && (
                  <div className="relative flex items-start gap-3 pl-8">
                    <div className={`absolute left-2.5 top-1.5 w-3 h-3 rounded-full ring-4 ${
                      selectedUser.tier === 'tier3_blocked' ? 'bg-rose-600 ring-rose-100' : 'bg-indigo-600 ring-indigo-100'
                    }`}></div>
                    <div className={`p-3.5 rounded-xl border flex-1 ${
                      selectedUser.tier === 'tier3_blocked' ? 'bg-rose-50/70 border-rose-200' : 'bg-slate-50 border-slate-200/80'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-600 font-label-caps uppercase font-semibold">
                          {selectedUser.tier === 'tier3_blocked' ? '第 3 级裂变 (熔断拦截)' : '二级裂变穿透 (Tier 2)'}
                        </span>
                        <span className={`font-semibold font-code-token text-[11px] px-2 py-0.5 rounded border ${
                          selectedUser.tier === 'tier3_blocked' ? 'text-rose-700 bg-rose-100 border-rose-200' : 'text-indigo-700 bg-indigo-50 border-indigo-200/60'
                        }`}>
                          {selectedUser.tier === 'tier3_blocked' ? '提成: 0.0% (熔断)' : '提成: 1.0%'}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-900 mt-1 font-code-token">{selectedUser.uid}</div>
                      {selectedUser.tier === 'tier3_blocked' && (
                        <p className="text-[11px] text-rose-700 mt-1.5 bg-white/70 p-2 rounded border border-rose-200/60">
                          智能合约已执行 100% 熔断拦截，不向任何上级派发提成流水，符合反涉传红线三要求。
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-900 transition-colors text-xs cursor-pointer shadow-xs"
                >
                  关闭拓扑
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
