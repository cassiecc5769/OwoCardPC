import React, { useState } from 'react';
import { UserMultiDimensionalRow, MOCK_USER_DRILLDOWN_CUSTOMERS } from './userMultiDimensionalData';

interface UserCustomerGroupDrilldownModalProps {
  isOpen: boolean;
  onClose: () => void;
  row: UserMultiDimensionalRow | null;
  onShowToast: (msg: string) => void;
}

export const UserCustomerGroupDrilldownModal: React.FC<UserCustomerGroupDrilldownModalProps> = ({
  isOpen,
  onClose,
  row,
  onShowToast,
}) => {
  const [filterTier, setFilterTier] = useState<string>('ALL');

  if (!isOpen || !row) return null;

  const customers = MOCK_USER_DRILLDOWN_CUSTOMERS.filter((c) => {
    if (filterTier !== 'ALL' && !c.tier.includes(filterTier)) return false;
    return true;
  });

  const handleAction = (actionName: string, username: string) => {
    onShowToast(`已对客户 [${username}] 执行【${actionName}】操作`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-surface-container-low/80 border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${row.iconBg} ${row.iconColor}`}
            >
              <span className="material-symbols-outlined text-[18px]">group</span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                  重点客群交易穿透画像 · {row.name}
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-code-token bg-surface-container text-primary">
                  {row.code}
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                穿透下挂出卡用户主体、累计交易 GMV、偏好卡种与流失预警状态
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
            <span className="text-outline font-semibold">分层筛选:</span>
            <div className="flex items-center bg-surface-container-low p-0.5 rounded-lg border border-outline-variant/30">
              <button
                onClick={() => setFilterTier('ALL')}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  filterTier === 'ALL'
                    ? 'bg-primary text-on-primary font-medium shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                全部大客 ({MOCK_USER_DRILLDOWN_CUSTOMERS.length})
              </button>
              <button
                onClick={() => setFilterTier('LV5')}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  filterTier === 'LV5'
                    ? 'bg-amber-600 text-white font-medium shadow-xs'
                    : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                LV5 皇冠至尊
              </button>
              <button
                onClick={() => setFilterTier('LV4')}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  filterTier === 'LV4'
                    ? 'bg-primary text-on-primary font-medium shadow-xs'
                    : 'text-primary hover:bg-primary/10'
                }`}
              >
                LV4 钻石黑金
              </button>
              <button
                onClick={() => setFilterTier('LV2')}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  filterTier === 'LV2'
                    ? 'bg-secondary text-on-secondary font-medium shadow-xs'
                    : 'text-secondary hover:bg-secondary/10'
                }`}
              >
                成长客群
              </button>
            </div>
          </div>

          <div className="text-outline font-numeric-table text-[11px]">
            当前客群规模: {row.monthlyActiveUsers.toLocaleString()} 月活 · 贡献 GMV ${row.gmvUsd.toLocaleString()}
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="rounded-xl border border-outline-variant/30 overflow-hidden">
            <table className="w-full text-left border-collapse text-xs font-numeric-table">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-caps text-[11px] border-b border-outline-variant/20">
                  <th className="py-2.5 px-3">UID / 客户昵称</th>
                  <th className="py-2.5 px-3">会员等级</th>
                  <th className="py-2.5 px-3">注册 / 首单时间</th>
                  <th className="py-2.5 px-3 text-right">累计出卡</th>
                  <th className="py-2.5 px-3 text-right">贡献 GMV</th>
                  <th className="py-2.5 px-3">偏好主力卡种</th>
                  <th className="py-2.5 px-3">活跃状态</th>
                  <th className="py-2.5 px-3 text-center">专属运营策略</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low text-on-surface">
                {customers.map((c) => (
                  <tr key={c.uid} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-on-surface">{c.username}</div>
                      <div className="text-[10px] text-outline font-code-token">{c.uid}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          c.tier.includes('LV5')
                            ? 'bg-amber-100 text-amber-800'
                            : c.tier.includes('LV4')
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c.tier}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[11px]">
                      <div className="text-on-surface">{c.registrationDate}</div>
                      <div className="text-[10px] text-outline">首单: {c.firstOrderDate}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-on-surface">
                      {c.totalOrders} 笔
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-primary">
                      ${c.totalGmvUsd.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-code-token px-1.5 py-0.5 bg-surface-container rounded border border-outline-variant/30 text-[11px]">
                        {c.preferredBrand}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          c.status === 'VIP'
                            ? 'bg-secondary/15 text-secondary'
                            : c.status === 'AT_RISK'
                            ? 'bg-error-container text-error font-bold'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {c.statusLabel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleAction('发放定向做卡加价券', c.username)}
                          className="px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary hover:text-white text-xs cursor-pointer transition-colors font-medium"
                        >
                          加价券
                        </button>
                        <button
                          onClick={() => handleAction('分配专属运营经理跟进', c.username)}
                          className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-xs cursor-pointer transition-colors"
                        >
                          私域触达
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-surface-container-low/40 border-t border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-outline">
            <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
            <span>穿透客群已同步防黑卡反欺诈风控白名单体系</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-primary text-on-primary hover:bg-primary/90 text-xs font-medium rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            完成查看
          </button>
        </div>
      </div>
    </div>
  );
};
