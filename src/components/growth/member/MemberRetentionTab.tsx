import React, { useState } from 'react';
import { RetentionCareItem } from './types';

interface MemberRetentionTabProps {
  carePool: RetentionCareItem[];
  onOpenCareModal: (item: RetentionCareItem) => void;
  onShowToast: (msg: string) => void;
}

export const MemberRetentionTab: React.FC<MemberRetentionTabProps> = ({
  carePool,
  onOpenCareModal,
  onShowToast,
}) => {
  const [filterTier, setFilterTier] = useState('全部');
  const [batchSelecting, setBatchSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredPool = carePool.filter((c) => {
    return filterTier === '全部' || c.tier === filterTier;
  });

  const handleSelectAll = () => {
    if (selectedIds.length === filteredPool.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPool.map((c) => c.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBatchCare = () => {
    const count = selectedIds.length > 0 ? selectedIds.length : filteredPool.length;
    onShowToast(`已批量向 ${count} 名临界预警大客派发 +0.50% 定向挽留券与专属提醒`);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-4 text-slate-800 text-xs antialiased">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-blue-500/5 border border-red-200/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
            <span className="material-symbols-outlined text-[24px]">crisis_alert</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>保级周期倒计时与流失预警拦截池</span>
              <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-mono text-[10px] font-bold">
                PRD 5.2.2 守护机制
              </span>
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              180天滚动周期即将届满且未达成“满3笔”或“达成50%门槛”的大客户，系统自动发起平滑顺降一级前多渠道挽留。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setBatchSelecting(!batchSelecting)}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 cursor-pointer"
          >
            {batchSelecting ? '退出多选' : '批量勾选'}
          </button>
          <button
            onClick={handleBatchCare}
            className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">campaign</span>
            <span>一键派发挽留券包</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">当前预警池高危大客</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-mono text-2xl font-bold text-red-600">4</span>
            <span className="text-xs text-slate-400">人 (全网排查)</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex justify-between">
            <span>距降级 &lt;7 天极危</span>
            <span className="font-mono text-red-600 font-bold">2 人</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">潜在受影响月度出卡 GMV</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-mono text-2xl font-bold text-slate-900">$4,810.00</span>
            <span className="font-mono text-xs text-slate-400">USD</span>
          </div>
          <div className="text-[11px] text-emerald-600 mt-2 pt-2 border-t border-slate-100 flex justify-between font-medium">
            <span>挽留成功预估保留度</span>
            <span>82.5%</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">自动化关怀 Push 触达率</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-mono text-2xl font-bold text-blue-600">100.0%</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex justify-between">
            <span>倒计时 15/7/3 天</span>
            <span className="font-mono text-slate-700 font-semibold">三级梯度触达</span>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600 text-[20px]">notification_important</span>
            <h4 className="font-bold text-slate-900 text-sm">重点预警会员达标监控看板</h4>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="h-8 px-2.5 bg-white text-slate-800 rounded-lg border border-slate-200 text-xs focus:outline-none"
            >
              <option value="全部">全部等级</option>
              <option value="LV5">LV5 殿堂核心</option>
              <option value="LV4">LV4 钻石大客</option>
              <option value="LV3">LV3 黄金会员</option>
              <option value="LV2">LV2 白银会员</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80 uppercase text-[11px] tracking-wider">
              <tr>
                {batchSelecting && (
                  <th className="py-2.5 px-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredPool.length && filteredPool.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                )}
                <th className="py-2.5 px-4">会员标识</th>
                <th className="py-2.5 px-4">当前等级</th>
                <th className="py-2.5 px-4">倒计时剩余天数</th>
                <th className="py-2.5 px-4">180天出卡笔数进度</th>
                <th className="py-2.5 px-4">成长值门槛达成率</th>
                <th className="py-2.5 px-4">建议运营动作</th>
                <th className="py-2.5 px-4">触达状态</th>
                <th className="py-2.5 px-4 text-right">调度操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPool.map((item) => {
                const isUrgent = item.daysRemaining <= 7;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {batchSelecting && (
                      <td className="py-2.5 px-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => handleToggleSelect(item.id)}
                        />
                      </td>
                    )}
                    <td className="py-2.5 px-4">
                      <div className="font-bold text-slate-900">{item.uid}</div>
                      <div className="font-mono text-[11px] text-slate-400">{item.phone}</div>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-800">
                        {item.tierName}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                        isUrgent ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        还剩 {item.daysRemaining} 天
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800">
                          {item.rollingTradesCount} / {item.targetTradesCount} 笔
                        </span>
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.rollingTradesCount >= item.targetTradesCount ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${Math.min(100, (item.rollingTradesCount / item.targetTradesCount) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="font-mono text-slate-700">
                        {item.rollingPts.toLocaleString()} / {item.targetPts.toLocaleString()} PTS
                      </div>
                      <span className="text-[10px] text-emerald-600 font-medium">已满足50%底线门槛</span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 max-w-[220px]">
                      {item.suggestedAction}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        item.careStatus === '待触达'
                          ? 'bg-red-50 text-red-700'
                          : item.careStatus === '已推送预警'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {item.careStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenCareModal(item)}
                          className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px] shadow-2xs transition-colors cursor-pointer"
                        >
                          发挽留券
                        </button>
                        <button
                          onClick={() => onShowToast(`已为 ${item.uid} 申请保级考察期延长 7 天宽限`)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-colors cursor-pointer"
                        >
                          宽限7天
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
