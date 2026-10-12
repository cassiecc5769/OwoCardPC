import React, { useState } from 'react';

interface RiskRecordsTabProps {
  showToast: (msg: string) => void;
}

interface RiskRecordEvent {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  riskCategory: '撞库欺诈' | '已兑换废卡' | '大额面额异常' | '黑产号池' | '异地IP突变' | '高频恶意撤单';
  severity: '高危' | '中危' | '低危';
  triggeredRule: string;
  interceptedAmount: number;
  occurredAt: string;
  punishmentAction: string;
  handler: string;
}

const MOCK_RISK_EVENTS: RiskRecordEvent[] = [
  {
    id: 'RSK-EVT-9901',
    orderId: 'ORD-20261005-88912',
    userId: 'UID-88934',
    userName: 'Kofi Mensah',
    riskCategory: '已兑换废卡',
    severity: '高危',
    triggeredRule: 'RULE-ZERO-BALANCE-AUTO-DROP (零余额即时阻断)',
    interceptedAmount: 50,
    occurredAt: '2026-10-05 14:42:00',
    punishmentAction: '拦截订单 + 降级用户风控信誉至 Tier-C + 限制出卡 24h',
    handler: '系统风控决策引擎 (SEC-ENGINE-01)'
  },
  {
    id: 'RSK-EVT-9902',
    orderId: 'ORD-20261005-88919',
    userId: 'UID-77821',
    userName: 'AnonymousTrader_NG',
    riskCategory: '撞库欺诈',
    severity: '高危',
    triggeredRule: 'RULE-DUPLICATE-CARD-LOCK (一卡多卖防线)',
    interceptedAmount: 150,
    occurredAt: '2026-10-05 14:15:30',
    punishmentAction: '强制关闭卡单 + 封禁设备指纹 + 划入争议黑名单',
    handler: '反欺诈图谱分析组件'
  },
  {
    id: 'RSK-EVT-9903',
    orderId: 'ORD-20261005-88120',
    userId: 'UID-66102',
    userName: 'LagosQuickCard',
    riskCategory: '大额面额异常',
    severity: '中危',
    triggeredRule: 'RULE-VALUE-MISMATCH-ALERT (面额不符预警)',
    interceptedAmount: 200,
    occurredAt: '2026-10-05 11:20:15',
    punishmentAction: '挂起撮合派单 + 转人工客服核验出卡小票',
    handler: '值班风控员 (张立)'
  }
];

export const RiskRecordsTab: React.FC<RiskRecordsTabProps> = ({ showToast }) => {
  const [events] = useState<RiskRecordEvent[]>(MOCK_RISK_EVENTS);
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const filteredEvents = events.filter(e => {
    if (filterSeverity !== 'ALL' && e.severity !== filterSeverity) return false;
    return true;
  });

  return (
    <div className="flex flex-col space-y-4 text-xs text-slate-800 antialiased">
      {/* 顶部标题栏 */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200 shrink-0">
            <span className="material-symbols-outlined text-[22px]">report</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-slate-900 text-sm">风险记录与反欺诈审计档案（规则统一在平台配置维护）</h2>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-mono text-[10px] font-bold">
                全量留痕归档
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              记录平台捕获的所有欺诈撞库、废卡投递、黑名单拦截及风控惩处闭环记录。
            </p>
          </div>
        </div>

        <button
          onClick={() => showToast('已成功导出风险事件处置台账 (CSV)')}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">file_download</span>
          <span>导出风险事件表</span>
        </button>
      </div>

      {/* 核心表格 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="bg-slate-50/90 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200 h-9">
                <th className="py-2.5 px-3">风险事件单号 / 关联订单</th>
                <th className="py-2.5 px-3">涉及出卡人</th>
                <th className="py-2.5 px-2">风险分类</th>
                <th className="py-2.5 px-2">等级</th>
                <th className="py-2.5 px-3">触发命中规则</th>
                <th className="py-2.5 px-2 font-mono">拦截挽损面额</th>
                <th className="py-2.5 px-3">风控惩处 / 处置措施</th>
                <th className="py-2.5 px-2 font-mono">发生时间</th>
                <th className="py-2.5 px-3 text-right">处置主体</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-mono">
              {filteredEvents.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3">
                    <strong className="text-slate-900 block font-bold">{item.id}</strong>
                    <span className="text-[10px] text-blue-600">{item.orderId}</span>
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className="font-bold text-slate-900 block">{item.userName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.userId}</span>
                  </td>
                  <td className="py-2.5 px-2 font-sans">
                    <span className="font-semibold text-slate-800">{item.riskCategory}</span>
                  </td>
                  <td className="py-2.5 px-2 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.severity === '高危'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {item.severity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-700 text-[11px]">
                    {item.triggeredRule}
                  </td>
                  <td className="py-2.5 px-2 font-bold text-emerald-700">
                    +${item.interceptedAmount}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-rose-700 text-[11px]">
                    {item.punishmentAction}
                  </td>
                  <td className="py-2.5 px-2 text-slate-500 text-[11px]">
                    {item.occurredAt.slice(11)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-sans text-slate-600 text-[11px]">
                    {item.handler}
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
