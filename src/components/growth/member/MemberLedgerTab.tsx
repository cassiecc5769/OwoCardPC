import React, { useState } from 'react';
import { GrowthPointsLedgerItem } from './types';

interface MemberLedgerTabProps {
  ledger: GrowthPointsLedgerItem[];
  onOpenManualAdjust: () => void;
  onShowToast: (msg: string) => void;
}

export const MemberLedgerTab: React.FC<MemberLedgerTabProps> = ({
  ledger,
  onOpenManualAdjust,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('全部');

  const filteredList = ledger.filter((item) => {
    const matchesSearch =
      item.serialNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.uid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.includes(searchTerm) ||
      (item.relatedOrderId && item.relatedOrderId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === '全部' || item.changeType === typeFilter;

    return matchesSearch && matchesType;
  });

  const totalAdded = ledger
    .filter((l) => l.pointsChange > 0)
    .reduce((acc, curr) => acc + curr.pointsChange, 0);

  const totalDeducted = ledger
    .filter((l) => l.pointsChange < 0)
    .reduce((acc, curr) => acc + Math.abs(curr.pointsChange), 0);

  return (
    <div className="space-y-4 text-slate-800 text-xs antialiased">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">成长值累计发放总量</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined text-[18px]">add_chart</span>
            </span>
          </div>
          <div className="mt-2">
            <span className="font-mono text-2xl font-bold text-slate-900">{totalAdded.toLocaleString()}</span>
            <span className="font-mono text-xs text-slate-400 ml-1">PTS</span>
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            <span>核销出单自动实时折算</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">风控安全扣罚点数</span>
            <span className="p-1.5 rounded-lg bg-red-50 text-red-600">
              <span className="material-symbols-outlined text-[18px]">gavel</span>
            </span>
          </div>
          <div className="mt-2">
            <span className="font-mono text-2xl font-bold text-red-600">-{totalDeducted.toLocaleString()}</span>
            <span className="font-mono text-xs text-slate-400 ml-1">PTS</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            包含空卡/盗刷/重复提交
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">小票OCR验真奖励</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            </span>
          </div>
          <div className="mt-2">
            <span className="font-mono text-2xl font-bold text-slate-900">+42,850</span>
            <span className="font-mono text-xs text-slate-400 ml-1">PTS</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            累计过审 857 张小票
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">人工补偿/审批调分</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
            </span>
          </div>
          <div className="mt-2">
            <span className="font-mono text-2xl font-bold text-indigo-600">+12,500</span>
            <span className="font-mono text-xs text-slate-400 ml-1">PTS</span>
          </div>
          <div className="text-[11px] text-indigo-600 mt-1">
            工单留痕率 100%
          </div>
        </div>
      </div>

      {/* Main Ledger Table Container */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden flex flex-col">
        {/* Header & Filter */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">account_balance_wallet</span>
            <div>
              <h3 className="font-bold text-sm text-slate-900">成长值收支流水明细账本</h3>
              <p className="text-[11px] text-slate-400">实时记账 · 凭证级防篡改哈希审计</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="流水号 / UID / 手机号 / 关联订单..."
                className="w-56 h-8.5 pl-8 pr-3 bg-white text-slate-800 placeholder:text-slate-400 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs shadow-2xs"
              />
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-slate-400">search</span>
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-8.5 px-3 bg-white text-slate-800 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs shadow-2xs"
            >
              <option value="全部">全部变动类型</option>
              <option value="卡单实收成交">卡单实收成交</option>
              <option value="首次成功出卡奖励">首次成功出卡奖励</option>
              <option value="上传高清小票加分">上传高清小票加分</option>
              <option value="风控违规扣罚">风控违规扣罚</option>
              <option value="人工补发调分">人工补发调分</option>
            </select>

            <button
              onClick={onOpenManualAdjust}
              className="h-8.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>发起调分审批</span>
            </button>

            <button
              onClick={() => onShowToast(`已导出 ${filteredList.length} 条成长值流水凭证`)}
              className="h-8.5 px-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center gap-1 font-medium transition-colors shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>导出账本</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-2.5 px-4">流水单号</th>
                <th className="py-2.5 px-4">会员标识</th>
                <th className="py-2.5 px-4">当前等级</th>
                <th className="py-2.5 px-4">变动类型</th>
                <th className="py-2.5 px-4">变动分值 (PTS)</th>
                <th className="py-2.5 px-4">变动后结余</th>
                <th className="py-2.5 px-4">关联交易/工单</th>
                <th className="py-2.5 px-4">发生时间</th>
                <th className="py-2.5 px-4">记账备注</th>
                <th className="py-2.5 px-4 text-right">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    暂无匹配的成长值收支记录
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-semibold text-slate-900">
                      {item.serialNo}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="font-bold text-slate-800">{item.uid}</div>
                      <div className="font-mono text-[11px] text-slate-400">{item.phone}</div>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-700">
                        {item.tier}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        item.changeType.includes('扣罚')
                          ? 'bg-red-50 text-red-700'
                          : item.changeType.includes('小票')
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {item.changeType}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold">
                      <span className={item.pointsChange > 0 ? 'text-emerald-600' : 'text-red-600'}>
                        {item.pointsChange > 0 ? `+${item.pointsChange.toLocaleString()}` : item.pointsChange.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono font-semibold text-slate-900">
                      {item.balanceAfter.toLocaleString()} PTS
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-blue-600">
                      {item.relatedOrderId || item.operator || '-'}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-400 text-[11px]">
                      {item.time}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 max-w-[200px] truncate" title={item.note}>
                      {item.note}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50/80 border-t border-slate-200/80 text-right text-slate-400 text-[11px]">
          展示最近 50 条实时记账记录 · SHA-256 数字时间戳保护中
        </div>
      </div>
    </div>
  );
};
