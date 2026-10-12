import React, { useState, useMemo } from 'react';
import {
  AbnormalCardItem,
  AbnormalCardStatus,
  AbnormalStandardAction,
  RiskLevel
} from './riskTypes';
import { INITIAL_ABNORMAL_CARDS } from './mockRiskData';

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

const INITIAL_RISK_EVENTS: RiskRecordEvent[] = [
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
  },
  {
    id: 'RSK-EVT-9904',
    orderId: 'ORD-20261004-77192',
    userId: 'UID-55219',
    userName: 'FastCardPro',
    riskCategory: '黑产号池',
    severity: '高危',
    triggeredRule: 'RULE-BLACKLIST-IP-BLOCK (黑名单即时熔断)',
    interceptedAmount: 500,
    occurredAt: '2026-10-04 18:30:10',
    punishmentAction: '全站账户冻结 + 冻结在途未结资金 + 永久列入黑名单',
    handler: '安全审计策略组'
  }
];

interface RiskMonitorTabProps {
  showToast: (msg: string) => void;
  initialFilterType?: string;
  initialStatusTab?: 'ALL' | '待处理' | '处理中' | '待确认' | '已处理' | 'RECORDS';
}

export const RiskMonitorTab: React.FC<RiskMonitorTabProps> = ({
  showToast,
  initialFilterType,
  initialStatusTab = 'ALL'
}) => {
  const [cards, setCards] = useState<AbnormalCardItem[]>(INITIAL_ABNORMAL_CARDS);
  const [riskEvents, setRiskEvents] = useState<RiskRecordEvent[]>(INITIAL_RISK_EVENTS);
  const [selectedCard, setSelectedCard] = useState<AbnormalCardItem | null>(null);

  // 状态 Tab：全部 ｜ 待处理 3 ｜ 处理中 ｜ 待确认 ｜ 已处理 ｜ 风险记录 (已关闭/档案)
  const [statusTab, setStatusTab] = useState<'ALL' | AbnormalCardStatus | 'RECORDS'>(
    initialStatusTab === 'RECORDS' ? 'RECORDS' : (initialStatusTab || 'ALL')
  );

  const [filterRiskType, setFilterRiskType] = useState<string>(initialFilterType || 'ALL');
  const [filterBrand, setFilterBrand] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 风险记录专属筛选
  const [recordsSeverityFilter, setRecordsSeverityFilter] = useState<string>('ALL');

  // 处置动作模态框与表单状态
  const [activeAction, setActiveAction] = useState<AbnormalStandardAction | null>(null);
  const [actionReason, setActionReason] = useState<string>('');
  const [operatorName] = useState<string>('当前风控/客服专员 (工号CS08)');
  const [isFalsePositive, setIsFalsePositive] = useState<boolean>(false);
  const [newQuoteAmount, setNewQuoteAmount] = useState<string>('100');

  // 统计待处理数
  const pendingCount = useMemo(() => {
    return cards.filter(c => c.status === '待处理').length;
  }, [cards]);

  // 过滤后的异常卡列表
  const filteredCards = useMemo(() => {
    return cards
      .filter(item => {
        if (statusTab !== 'ALL' && statusTab !== 'RECORDS') {
          if (item.status !== statusTab) return false;
        }

        if (filterRiskType !== 'ALL' && item.riskType !== filterRiskType) return false;
        if (filterBrand !== 'ALL' && item.brand !== filterBrand) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchId =
            item.exceptionId.toLowerCase().includes(q) ||
            item.cardId.toLowerCase().includes(q) ||
            item.orderId.toLowerCase().includes(q);
          const matchUser = item.userName.toLowerCase().includes(q) || item.userId.toLowerCase().includes(q);
          const matchRule = item.ruleId.toLowerCase().includes(q);
          if (!matchId && !matchUser && !matchRule) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        if (a.isNearOverdue && !b.isNearOverdue) return -1;
        if (!a.isNearOverdue && b.isNearOverdue) return 1;
        const levelWeight: Record<RiskLevel, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        if (levelWeight[a.riskLevel] !== levelWeight[b.riskLevel]) {
          return levelWeight[b.riskLevel] - levelWeight[a.riskLevel];
        }
        return b.declaredValue - a.declaredValue;
      });
  }, [cards, statusTab, filterRiskType, filterBrand, searchQuery]);

  // 过滤后的风险记录档案
  const filteredRiskEvents = useMemo(() => {
    return riskEvents.filter(ev => {
      if (recordsSeverityFilter !== 'ALL' && ev.severity !== recordsSeverityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          ev.id.toLowerCase().includes(q) ||
          ev.orderId.toLowerCase().includes(q) ||
          ev.userName.toLowerCase().includes(q) ||
          ev.triggeredRule.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [riskEvents, recordsSeverityFilter, searchQuery]);

  // 执行标准化处置动作
  const handleExecuteResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAction || !selectedCard) return;

    if (!actionReason.trim()) {
      showToast('请填写处置判定理由与说明！');
      return;
    }

    let verdict: '已放行' | '已阻断' | '已重新报价' | '已转售后' | '已确认风险' | '已确认误报' = '已确认风险';
    if (isFalsePositive || activeAction === '放行') {
      verdict = isFalsePositive ? '已确认误报' : '已放行';
    } else if (activeAction === '阻断') {
      verdict = '已阻断';
    } else if (activeAction === '重新报价') {
      verdict = '已重新报价';
    } else if (activeAction === '转售后') {
      verdict = '已转售后';
    }

    const handledTime = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const updatedCard: AbnormalCardItem = {
      ...selectedCard,
      status: '已处理',
      resolution: {
        action: activeAction,
        finalVerdict: verdict,
        handler: operatorName,
        reason: actionReason.trim(),
        isFalsePositive,
        handledAt: handledTime,
        writeBackOrderId: selectedCard.orderId
      }
    };

    // 更新异常卡状态
    setCards(prev => prev.map(c => (c.exceptionId === updatedCard.exceptionId ? updatedCard : c)));

    // 同步新增一条风险事件记录档案 (闭环留档)
    const newRecordEvent: RiskRecordEvent = {
      id: `RSK-EVT-${Date.now().toString().slice(-4)}`,
      orderId: selectedCard.orderId,
      userId: selectedCard.userId,
      userName: selectedCard.userName,
      riskCategory: (selectedCard.riskType === '零余额' ? '已兑换废卡' : selectedCard.riskType === '重复卡' ? '撞库欺诈' : '大额面额异常') as any,
      severity: selectedCard.riskLevel === 'HIGH' ? '高危' : '中危',
      triggeredRule: selectedCard.ruleId,
      interceptedAmount: selectedCard.declaredValue,
      occurredAt: handledTime,
      punishmentAction: `${verdict} 处置完毕 (理由: ${actionReason.trim()}) ➔ 自动回写卡单`,
      handler: operatorName
    };
    setRiskEvents(prev => [newRecordEvent, ...prev]);

    setSelectedCard(null);
    setActiveAction(null);
    setActionReason('');
    setIsFalsePositive(false);

    showToast(`✅ 卡单【${selectedCard.orderId}】已完成【${verdict}】处置！已自动回写卡单与风险档案。`);
  };

  return (
    <div className="flex flex-col space-y-4 text-xs text-slate-800 antialiased">
      {/* 职责说明卡 */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0">
            <span className="material-symbols-outlined text-[22px]">warning</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-slate-900 text-sm">风险监控（回答：现在有哪些风险需要关注和处理？）</h2>
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-mono text-[10px] font-bold border border-rose-200">
                处置工作台与档案中心
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              链路闭环：<strong className="text-slate-700">发现风险 ➔ 形成异常 ➔ 查看证据与Card Tool历史 ➔ 处置动作 ➔ 结果回写 ➔ 形成风险记录</strong>。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 font-bold font-mono text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
            <span>待人工处理: {pendingCount} 张</span>
          </div>
        </div>
      </div>

      {/* 状态 Tab 导航条：全部 ｜ 待处理 3 ｜ 处理中 ｜ 待确认 ｜ 已处理 ｜ 风险记录 (已关闭) */}
      <div className="bg-white rounded-xl p-1.5 border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'ALL', label: '全部风险卡', count: cards.length },
            { id: '待处理', label: '待处理', count: pendingCount, isAlert: true },
            { id: '处理中', label: '处理中', count: cards.filter(c => c.status === '处理中').length },
            { id: '待确认', label: '待确认', count: cards.filter(c => c.status === '待确认').length },
            { id: '已处理', label: '已处理', count: cards.filter(c => c.status === '已处理').length },
            { id: 'RECORDS', label: '风险记录 (历史档案)', count: riskEvents.length, icon: 'history_edu' }
          ].map(tab => {
            const isActive = statusTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.icon && <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>}
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : tab.isAlert && tab.count > 0
                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {statusTab === 'RECORDS' && (
          <button
            onClick={() => showToast('已成功导出历史风险事件审计留档 (CSV)')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium border border-slate-200 text-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">file_download</span>
            <span>导出留档台账</span>
          </button>
        )}
      </div>

      {/* 筛选与搜索工具栏 */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {statusTab !== 'RECORDS' ? (
            <>
              <select
                value={filterRiskType}
                onChange={e => setFilterRiskType(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
              >
                <option value="ALL">全部风险类型</option>
                <option value="零余额">零余额</option>
                <option value="已兑换">已兑换</option>
                <option value="重复卡">重复卡 (撞库)</option>
                <option value="面额不符">面额不符</option>
                <option value="状态异常">状态异常</option>
                <option value="黑名单">黑名单命中</option>
                <option value="疑似欺诈">疑似欺诈</option>
              </select>

              <select
                value={filterBrand}
                onChange={e => setFilterBrand(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
              >
                <option value="ALL">全部卡种</option>
                <option value="Apple">Apple</option>
                <option value="Steam">Steam</option>
                <option value="Target">Target</option>
                <option value="Sephora">Sephora</option>
              </select>
            </>
          ) : (
            <select
              value={recordsSeverityFilter}
              onChange={e => setRecordsSeverityFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="ALL">全部危害等级</option>
              <option value="高危">高危 (强拦截)</option>
              <option value="中危">中危 (人工复核)</option>
              <option value="低危">低危 (关注)</option>
            </select>
          )}

          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
              search
            </span>
            <input
              type="text"
              placeholder={statusTab === 'RECORDS' ? '搜索档案单号 / 卡单 / 规则 / 用户...' : '搜索卡单号 / 异常单 / 卡ID / 用户...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 w-64"
            />
          </div>
        </div>

        <span className="text-slate-400 font-mono text-[11px]">
          {statusTab === 'RECORDS'
            ? `共 ${filteredRiskEvents.length} 条已归档留痕`
            : `共 ${filteredCards.length} 笔需监控异常卡`}
        </span>
      </div>

      {/* 视图 1：风险监控与异常卡工作池列表 (PRD 标准表格设计) */}
      {statusTab !== 'RECORDS' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold font-sans">
                  <th className="py-2.5 px-3">卡单 / 异常单</th>
                  <th className="py-2.5 px-3">卡种 / 国家</th>
                  <th className="py-2.5 px-3">金额 (申报 ➔ 查验)</th>
                  <th className="py-2.5 px-3">风险类型</th>
                  <th className="py-2.5 px-3">风险等级</th>
                  <th className="py-2.5 px-3">命中规则</th>
                  <th className="py-2.5 px-3">系统建议动作</th>
                  <th className="py-2.5 px-3">当前状态</th>
                  <th className="py-2.5 px-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredCards.map(item => {
                  const isPending = item.status === '待处理';
                  return (
                    <tr
                      key={item.exceptionId}
                      className={`hover:bg-blue-50/30 transition-colors font-sans ${
                        item.isOverdue ? 'bg-rose-50/20' : item.isNearOverdue ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono">
                        <div className="font-bold text-slate-900">{item.orderId}</div>
                        <span className="text-[10px] text-slate-400 block font-mono">{item.exceptionId}</span>
                      </td>

                      <td className="py-2.5 px-3 font-sans">
                        <div className="font-semibold text-slate-900">{item.brand} {item.country}</div>
                        <span className="text-[10px] text-slate-400 font-mono">{item.cardCodeMasked}</span>
                      </td>

                      <td className="py-2.5 px-3 font-mono">
                        <span className="text-slate-500">${item.declaredValue}</span>
                        <span className="text-slate-400 mx-1">&rarr;</span>
                        <span className={`font-bold ${item.actualBalance === 0 ? 'text-rose-600' : 'text-blue-700'}`}>
                          ${item.actualBalance}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-block">
                          {item.riskType}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 font-sans">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            item.riskLevel === 'HIGH'
                              ? 'bg-rose-600 text-white'
                              : item.riskLevel === 'MEDIUM'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {item.riskLevel === 'HIGH' ? '高' : item.riskLevel === 'MEDIUM' ? '中' : '低'}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 max-w-[140px] truncate" title={item.ruleDescription}>
                        <span className="font-bold text-slate-800">{item.ruleId}</span>
                      </td>

                      <td className="py-2.5 px-3 font-sans text-slate-600 text-[11px] max-w-xs truncate" title={item.systemSuggestedAction}>
                        {item.systemSuggestedAction}
                      </td>

                      <td className="py-2.5 px-3 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === '待处理'
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : item.status === '处理中'
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : item.status === '待确认'
                              ? 'bg-amber-100 text-amber-700 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right font-sans">
                        <button
                          onClick={() => setSelectedCard(item)}
                          className={`px-3 py-1 font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-xs ${
                            isPending
                              ? 'bg-rose-600 hover:bg-rose-700 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {isPending ? '立即处置' : '查看/处置'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* 视图 2：风险记录历史档案 (已关闭留痕) */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-purple-600">verified</span>
              <span>历史上发生过的风险事件与最终处置档案（全生命周期留痕）</span>
            </h3>
            <span className="text-slate-400 font-mono text-[11px]">具备不可篡改审计效力</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-white text-slate-500 font-semibold font-sans">
                  <th className="py-2.5 px-3">档案编号 / 卡单号</th>
                  <th className="py-2.5 px-3">涉案用户</th>
                  <th className="py-2.5 px-3">事件定性</th>
                  <th className="py-2.5 px-3">风险等级</th>
                  <th className="py-2.5 px-3">命中规则代码</th>
                  <th className="py-2.5 px-3">阻断/挽损金额</th>
                  <th className="py-2.5 px-3">最终处置与惩戒动作</th>
                  <th className="py-2.5 px-3">处置责任人</th>
                  <th className="py-2.5 px-3">留档时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredRiskEvents.map(evt => (
                  <tr key={evt.id} className="hover:bg-slate-50 transition-colors font-sans">
                    <td className="py-2.5 px-3 font-mono">
                      <div className="font-bold text-purple-800">{evt.id}</div>
                      <span className="text-[10px] text-slate-400">{evt.orderId}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-900">{evt.userName}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{evt.userId}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {evt.riskCategory}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          evt.severity === '高危'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : evt.severity === '中危'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {evt.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 max-w-[140px] truncate" title={evt.triggeredRule}>
                      {evt.triggeredRule}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">
                      +${evt.interceptedAmount}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 text-[11px] max-w-xs truncate" title={evt.punishmentAction}>
                      {evt.punishmentAction}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {evt.handler}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[10px]">
                      {evt.occurredAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 处置工作台 Drawer / Modal */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-[22px]">gpp_maybe</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">
                      风险卡处置工作台 ({selectedCard.orderId})
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedCard.riskLevel === 'HIGH' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                      }`}
                    >
                      {selectedCard.riskType} · {selectedCard.riskLevel === 'HIGH' ? '高风险' : '中风险'}
                    </span>
                  </div>
                  <span className="text-slate-500 text-[11px] font-mono">
                    异常单: {selectedCard.exceptionId} · 关联Card ID: {selectedCard.cardId} · 检出时间: {selectedCard.createdAt}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCard(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Body 5 大区域 */}
            <div className="p-5 space-y-4">
              {/* 1. 卡基本信息 */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">badge</span>
                  <span>1. 卡基本信息</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-400 font-sans block text-[10px]">出卡用户:</span>
                    <strong className="text-slate-800">{selectedCard.userName} ({selectedCard.userId})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block text-[10px]">品牌 / 国家:</span>
                    <strong className="text-slate-800">{selectedCard.brand} ({selectedCard.country})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block text-[10px]">申报金额 vs 实际余额:</span>
                    <strong className="text-rose-600">${selectedCard.declaredValue} &rarr; ${selectedCard.actualBalance} {selectedCard.currency}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block text-[10px]">卡码掩码:</span>
                    <strong className="text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block font-mono">
                      {selectedCard.cardCodeMasked}
                    </strong>
                  </div>
                </div>
              </div>

              {/* 2. 风险原因 与 命中规则 */}
              <div className="bg-rose-50/60 rounded-xl p-3.5 border border-rose-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-rose-600">report_problem</span>
                    <span>2. 风险原因 与 命中规则</span>
                  </h4>
                  <span className="font-mono text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-rose-300 text-rose-800">
                    {selectedCard.ruleId}
                  </span>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed">
                  {selectedCard.ruleDescription}
                </p>
              </div>

              {/* 3. 聚合风险证据链 */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-purple-600">auto_awesome_motion</span>
                  <span>3. 聚合风险证据链（Card Tool 证据时间轴）</span>
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {selectedCard.evidenceList.map(ev => (
                    <div key={ev.id} className="p-3 bg-white hover:bg-slate-50 flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            {ev.type}
                          </span>
                          <span className="font-bold text-slate-900">{ev.title}</span>
                          <span className="text-slate-400 font-mono text-[10px]">({ev.source})</span>
                        </div>
                        <p className="text-slate-600 text-[11px] font-mono leading-relaxed pl-1">
                          {ev.detail}
                        </p>
                      </div>
                      <span className="text-slate-400 font-mono text-[10px] shrink-0">{ev.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. 系统建议动作 */}
              <div className="bg-amber-50/70 rounded-xl p-3.5 border border-amber-200 space-y-1">
                <h4 className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-600">lightbulb</span>
                  <span>4. 系统建议处置动作</span>
                </h4>
                <p className="text-slate-800 text-xs font-semibold">
                  {selectedCard.systemSuggestedAction}
                </p>
              </div>

              {/* 5. 标准化人工处置操作台 */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">gavel</span>
                  <span>5. 标准化处置动作（自动回写卡单 ➔ 留档风险记录）</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { action: '阻断' as AbnormalStandardAction, label: '阻断交易', icon: 'block', desc: '明确欺诈/零余额', color: 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100' },
                    { action: '放行' as AbnormalStandardAction, label: '确认放行', icon: 'check_circle', desc: '复核无风险/误报', color: 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100' },
                    { action: '重新报价' as AbnormalStandardAction, label: '重新报价', icon: 'price_change', desc: '按实际余额重新计价', color: 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100' },
                    { action: '转售后' as AbnormalStandardAction, label: '转售后争议', icon: 'support_agent', desc: '移交售后仲裁', color: 'bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100' },
                    { action: '重新查询' as AbnormalStandardAction, label: '重新查验', icon: 'sync', desc: '通道超时重试', color: 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100' }
                  ].map(btn => (
                    <button
                      key={btn.action}
                      type="button"
                      onClick={() => {
                        setActiveAction(btn.action);
                        if (btn.action === '放行') setIsFalsePositive(true);
                        else setIsFalsePositive(false);
                      }}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        activeAction === btn.action
                          ? 'ring-2 ring-blue-600 bg-white font-bold shadow-xs'
                          : btn.color
                      }`}
                    >
                      <div className="flex items-center gap-1 text-xs">
                        <span className="material-symbols-outlined text-[15px]">{btn.icon}</span>
                        <span>{btn.label}</span>
                      </div>
                      <span className="text-[10px] opacity-75 block mt-0.5 truncate">{btn.desc}</span>
                    </button>
                  ))}
                </div>

                {/* 提交表单 */}
                {activeAction && (
                  <form onSubmit={handleExecuteResolution} className="space-y-3 pt-3 border-t border-slate-200 animate-in fade-in">
                    {activeAction === '重新报价' && (
                      <div className="flex items-center gap-2 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                        <span className="font-semibold text-amber-800">新报价对应面额 ($):</span>
                        <input
                          type="number"
                          value={newQuoteAmount}
                          onChange={e => setNewQuoteAmount(e.target.value)}
                          className="px-2 py-1 bg-white border border-amber-300 rounded font-mono font-bold text-slate-900 w-24 text-xs"
                        />
                        <span className="text-slate-500 text-[11px] font-sans">
                          (原申报: ${selectedCard.declaredValue}，实际余额: ${selectedCard.actualBalance})
                        </span>
                      </div>
                    )}

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        处置判定依据与说明 <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        value={actionReason}
                        onChange={e => setActionReason(e.target.value)}
                        placeholder={`请填写执行【${activeAction}】的事实说明与处置理由...`}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 resize-none font-mono"
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isFalsePositive}
                          onChange={e => setIsFalsePositive(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span className="text-slate-700 font-medium">同时记录为「风控规则误报」，用于模型回溯调优</span>
                      </label>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveAction(null)}
                          className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-200 text-xs font-semibold cursor-pointer"
                        >
                          取消
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[15px]">send</span>
                          <span>确认执行【{activeAction}】并回写卡单</span>
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
