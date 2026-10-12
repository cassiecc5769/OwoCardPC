import React, { useState, useMemo } from 'react';
import { NavPath } from '../../types';
import {
  AbnormalCardItem,
  AbnormalCardStatus,
  AbnormalStandardAction,
  RiskEventRecordItem,
  RiskLevel
} from './riskTypes';
import { INITIAL_ABNORMAL_CARDS, INITIAL_RISK_EVENTS } from './mockRiskData';

interface RiskMonitorViewProps {
  currentPath?: NavPath;
  onNavigate?: (path: NavPath) => void;
}

// 5 大标准状态 Tab
export type RiskMonitorStatusTab = 'pending' | 'processing' | 'confirming' | 'resolved' | 'records';

export const RiskMonitorView: React.FC<RiskMonitorViewProps> = ({
  currentPath = 'risk-monitor',
  onNavigate
}) => {
  // 5 大状态 Tab 切换
  const [statusTab, setStatusTab] = useState<RiskMonitorStatusTab>('pending');
  const [cards, setCards] = useState<AbnormalCardItem[]>(INITIAL_ABNORMAL_CARDS);
  const [records, setRecords] = useState<RiskEventRecordItem[]>(INITIAL_RISK_EVENTS);
  const [selectedCard, setSelectedCard] = useState<AbnormalCardItem | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<RiskEventRecordItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 筛选与搜索
  const [filterRiskType, setFilterRiskType] = useState<string>('ALL');
  const [filterBrand, setFilterBrand] = useState<string>('ALL');
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 详情抽屉内「人工决定」表单状态
  const [manualAction, setManualAction] = useState<AbnormalStandardAction>('阻断');
  const [manualReason, setManualReason] = useState<string>('官方接口证实已在提单前兑换核销，卡内余额为 0，属恶意提单。');
  const [operatorName, setOperatorName] = useState<string>('当前风控专员 (张文翰 · OP08)');
  const [isFalsePositive, setIsFalsePositive] = useState<boolean>(false);
  const [customQuoteVal, setCustomQuoteVal] = useState<string>('100');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  // 路由同步
  React.useEffect(() => {
    if (currentPath === 'risk-records') {
      setStatusTab('records');
    }
  }, [currentPath]);

  // 根据当前状态 Tab 过滤卡片列表
  const filteredCards = useMemo(() => {
    const statusMap: Record<Exclude<RiskMonitorStatusTab, 'records'>, AbnormalCardStatus> = {
      pending: '待处理',
      processing: '处理中',
      confirming: '待确认',
      resolved: '已处理'
    };

    if (statusTab === 'records') return [];

    const targetStatus = statusMap[statusTab];
    return cards.filter(item => {
      if (item.status !== targetStatus) return false;
      if (filterRiskType !== 'ALL' && item.riskType !== filterRiskType) return false;
      if (filterBrand !== 'ALL' && item.brand !== filterBrand) return false;
      if (filterRiskLevel !== 'ALL' && item.riskLevel !== filterRiskLevel) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = item.exceptionId.toLowerCase().includes(q) || item.cardId.toLowerCase().includes(q) || item.orderId.toLowerCase().includes(q);
        const matchUser = item.userName.toLowerCase().includes(q) || item.userId.toLowerCase().includes(q);
        const matchCode = item.cardCodeMasked.toLowerCase().includes(q);
        if (!matchId && !matchUser && !matchCode) return false;
      }
      return true;
    }).sort((a, b) => {
      // 超时优先 ➔ 即将超时 ➔ 高危
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      if (a.isNearOverdue && !b.isNearOverdue) return -1;
      if (!a.isNearOverdue && b.isNearOverdue) return 1;
      return (b.riskLevel === 'HIGH' ? 3 : b.riskLevel === 'MEDIUM' ? 2 : 1) - (a.riskLevel === 'HIGH' ? 3 : a.riskLevel === 'MEDIUM' ? 2 : 1);
    });
  }, [cards, statusTab, filterRiskType, filterBrand, filterRiskLevel, searchQuery]);

  // 过滤风控记录档案
  const filteredRecords = useMemo(() => {
    if (statusTab !== 'records') return [];
    return records.filter(rec => {
      if (filterRiskLevel !== 'ALL' && rec.riskLevel !== filterRiskLevel) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = rec.riskEventId.toLowerCase().includes(q) || rec.cardId.toLowerCase().includes(q) || rec.orderId.toLowerCase().includes(q);
        const matchUser = rec.userName.toLowerCase().includes(q) || rec.userId.toLowerCase().includes(q);
        if (!matchId && !matchUser) return false;
      }
      return true;
    });
  }, [records, statusTab, filterRiskLevel, searchQuery]);

  // 打开异常卡详情
  const handleOpenCardDetail = (card: AbnormalCardItem) => {
    setSelectedCard(card);
    setSelectedRecord(null);
    // 默认预设合适的人工决定
    if (card.riskType.includes('面额')) {
      setManualAction('重新报价');
      setManualReason(`实际余额为 $${card.actualBalance}，按实际金额调整报价推送用户二次确认。`);
      setCustomQuoteVal(String(card.actualBalance));
      setIsFalsePositive(false);
    } else if (card.riskType.includes('已兑换') || card.riskType.includes('重复')) {
      setManualAction('阻断');
      setManualReason('官方验真证实无可用余额或重复提单，确认风险并强制阻断。');
      setIsFalsePositive(false);
    } else if (card.riskLevel === 'LOW' && card.ruleId.includes('TOOL')) {
      setManualAction('转人工查卡');
      setManualReason('网关通道超时，切换备用源或由人工完成二次查验。');
      setIsFalsePositive(false);
    } else {
      setManualAction('阻断');
      setManualReason('命中核心风控规则，确认阻断。');
      setIsFalsePositive(false);
    }
  };

  // 提交「人工决定」裁决
  const handleExecuteManualDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) return;

    if (!manualReason.trim()) {
      showToast('请填写人工决定判定理由与说明！');
      return;
    }

    let finalVerdict: '已放行' | '已阻断' | '已重新报价' | '已转售后' | '已确认风险' | '已确认误报' = '已确认风险';
    if (isFalsePositive || manualAction === '放行') {
      finalVerdict = isFalsePositive ? '已确认误报' : '已放行';
    } else if (manualAction === '阻断') {
      finalVerdict = '已阻断';
    } else if (manualAction === '重新报价') {
      finalVerdict = '已重新报价';
    } else if (manualAction === '转售后') {
      finalVerdict = '已转售后';
    }

    const nextStatus: AbnormalCardStatus = (manualAction === '重新报价' || manualAction === '转售后') ? '待确认' : '已处理';

    const updatedCard: AbnormalCardItem = {
      ...selectedCard,
      status: nextStatus,
      resolution: {
        action: manualAction,
        finalVerdict,
        handler: operatorName,
        reason: manualReason,
        isFalsePositive,
        handledAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        writeBackOrderId: selectedCard.orderId
      }
    };

    // 同步生成风控记录档案入库
    const newRiskEvent: RiskEventRecordItem = {
      riskEventId: `RISK-EVT-${Date.now().toString().slice(-8)}`,
      cardId: selectedCard.cardId,
      orderId: selectedCard.orderId,
      userId: selectedCard.userId,
      userName: selectedCard.userName,
      merchantId: 'MID-M08',
      merchantName: '极速数字科技',
      riskType: selectedCard.riskType,
      riskLevel: selectedCard.riskLevel,
      triggerRule: selectedCard.ruleId,
      evidence: selectedCard.evidenceList.map(e => e.detail).join('; '),
      amount: selectedCard.declaredValue,
      interceptAmount: finalVerdict === '已阻断' ? selectedCard.declaredValue : 0,
      action: `人工决定：${manualAction} (${finalVerdict})`,
      result: `${finalVerdict} · ${manualReason}`,
      handler: operatorName,
      createdTime: selectedCard.createdAt,
      closedTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
      timeline: [
        { time: selectedCard.createdAt, action: '预检检出异常', operator: '风控引擎', note: selectedCard.ruleDescription },
        { time: new Date().toISOString().slice(11, 19), action: `执行人工决定 [${manualAction}]`, operator: operatorName, note: manualReason },
        { time: new Date().toISOString().slice(11, 19), action: '回写卡单并归档', operator: '系统自动流转', note: `卡单 ${selectedCard.orderId} 状态已联动更新` }
      ]
    };

    setCards(prev => prev.map(c => c.exceptionId === selectedCard.exceptionId ? updatedCard : c));
    setRecords(prev => [newRiskEvent, ...prev]);
    setSelectedCard(updatedCard);

    showToast(`处置完成！已执行人工决定：[${manualAction}] ➔ 判定为 [${finalVerdict}]，卡单状态已联动回写！`);
  };

  // 快捷预设理由模版
  const quickReasons = [
    { label: '空卡/已兑换', text: '官方接口返回 REDEEMED，可用余额 $0.00，提单前已被核销，判定为欺诈空卡。' },
    { label: '重复撞库', text: '24小时内同一卡码在多笔卡单中重复提交，命中防一卡多售阻断规则。' },
    { label: '面额少充', text: `用户申报面额与官方查验余额不符，按实际查验余额 $${selectedCard?.actualBalance || 100} 重新报价。` },
    { label: '通道误报', text: '官方接口因币种换算或汇率展示存在偏差，经人工核查卡密真实有效，标记误报并放行。' }
  ];

  // 统计各状态数量
  const counts = {
    pending: cards.filter(c => c.status === '待处理').length,
    processing: cards.filter(c => c.status === '处理中').length,
    confirming: cards.filter(c => c.status === '待确认').length,
    resolved: cards.filter(c => c.status === '已处理').length,
    records: records.length
  };

  return (
    <div className="flex flex-col w-full space-y-4 text-slate-800 antialiased pb-12">
      {/* Toast 提示 */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900/90 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 backdrop-blur border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 头部 Header */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0">
            <span className="material-symbols-outlined text-[22px]">warning</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-slate-900 text-sm">风险监控（回答：有什么风险、怎么处置、如何闭环归档？）</h2>
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-mono text-[10px] font-bold border border-rose-200">
                风险全流程闭环工作台
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              严格按照标准化处置流转：<strong>待处理 ➔ 处理中 ➔ 待确认 ➔ 已处理 ➔ 风险记录</strong>，详情涵盖 8 大核心证据与人工决定。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {counts.pending > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              <span>待处理告警: {counts.pending} 笔</span>
            </div>
          )}
        </div>
      </div>

      {/* 5 大标准状态 Tab 导航栏 */}
      <section className="bg-white rounded-xl border border-slate-200/80 px-4 pt-1 shadow-xs flex items-center gap-1 overflow-x-auto text-xs">
        {[
          { id: 'pending', label: '待处理', icon: 'pending_actions', count: counts.pending, badgeColor: 'bg-rose-600 text-white' },
          { id: 'processing', label: '处理中', icon: 'sync', count: counts.processing, badgeColor: 'bg-blue-100 text-blue-800' },
          { id: 'confirming', label: '待确认', icon: 'mark_email_unread', count: counts.confirming, badgeColor: 'bg-amber-100 text-amber-800' },
          { id: 'resolved', label: '已处理', icon: 'task_alt', count: counts.resolved, badgeColor: 'bg-emerald-100 text-emerald-800' },
          { id: 'records', label: '风险记录 (永久档案)', icon: 'history_edu', count: counts.records, badgeColor: 'bg-slate-200 text-slate-700' }
        ].map(tab => {
          const isActive = statusTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setStatusTab(tab.id as RiskMonitorStatusTab);
                if (onNavigate) {
                  onNavigate(tab.id === 'records' ? 'risk-records' : 'risk-monitor');
                }
              }}
              className={`px-4 py-3 font-semibold rounded-t-lg transition-colors shrink-0 flex items-center gap-1.5 relative cursor-pointer ${
                isActive
                  ? 'text-[#004ac6] bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#004ac6]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${tab.badgeColor}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </section>

      {/* 筛选与搜索工具条 */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {statusTab !== 'records' && (
            <select
              value={filterRiskType}
              onChange={e => setFilterRiskType(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="ALL">全部风险类型</option>
              <option value="零余额">零余额空卡</option>
              <option value="已兑换">已兑换核销</option>
              <option value="重复卡">重复撞库卡</option>
              <option value="面额不符">面额少充/不符</option>
              <option value="黑名单命中">黑名单命中</option>
              <option value="其他">其他/通道超时</option>
            </select>
          )}

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

          <select
            value={filterRiskLevel}
            onChange={e => setFilterRiskLevel(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
          >
            <option value="ALL">全部风险等级</option>
            <option value="HIGH">高危 (HIGH)</option>
            <option value="MEDIUM">中危 (MEDIUM)</option>
            <option value="LOW">低危 (LOW)</option>
          </select>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
              search
            </span>
            <input
              type="text"
              placeholder="搜索 异常单号 / 卡单号 / Card ID / 用户..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 w-64"
            />
          </div>
        </div>

        <span className="text-slate-400 font-mono text-[11px]">
          共检索到 {statusTab === 'records' ? filteredRecords.length : filteredCards.length} 项监控事项
        </span>
      </div>

      {/* 列表渲染：状态 1~4 (待处理 / 处理中 / 待确认 / 已处理) */}
      {statusTab !== 'records' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">异常单号 / 关联卡单</th>
                  <th className="py-2.5 px-3">出卡用户</th>
                  <th className="py-2.5 px-3">卡种 / 掩码卡密</th>
                  <th className="py-2.5 px-3">申报面额 / 实际查验</th>
                  <th className="py-2.5 px-3">风险等级 / 风险类型</th>
                  <th className="py-2.5 px-3">命中规则</th>
                  <th className="py-2.5 px-3">系统处置建议</th>
                  <th className="py-2.5 px-3">经办专员 / SLA</th>
                  <th className="py-2.5 px-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredCards.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 font-sans">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <span className="material-symbols-outlined text-slate-300 text-[32px]">check_circle</span>
                        <span>当前状态分类下无待办风险卡事项</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCards.map(card => (
                    <tr
                      key={card.exceptionId}
                      onClick={() => handleOpenCardDetail(card)}
                      className={`hover:bg-blue-50/40 transition-colors cursor-pointer font-sans ${
                        card.isOverdue ? 'bg-rose-50/30' : card.isNearOverdue ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-blue-700 font-mono text-xs">{card.exceptionId}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{card.orderId}</div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{card.userName}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-mono">{card.userId}</span>
                          <span className={`px-1 py-0.1 rounded text-[9px] font-bold ${
                            card.userRiskTag === '高风险' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            card.userRiskTag === '关注' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {card.userRiskTag}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{card.brand}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{card.country} · {card.cardCodeMasked}</div>
                      </td>

                      <td className="py-2.5 px-3 font-mono">
                        <div className="font-bold text-slate-900">${card.declaredValue}</div>
                        <div className={`text-[10px] font-bold ${card.actualBalance === card.declaredValue ? 'text-emerald-700' : 'text-rose-600'}`}>
                          实际: ${card.actualBalance}
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold font-mono ${
                            card.riskLevel === 'HIGH' ? 'bg-rose-600 text-white' :
                            card.riskLevel === 'MEDIUM' ? 'bg-amber-500 text-white' :
                            'bg-blue-600 text-white'
                          }`}>
                            {card.riskLevel}
                          </span>
                          <span className="font-bold text-slate-800 text-xs">{card.riskType}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-mono text-[11px] font-bold text-slate-700">{card.ruleId}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1 max-w-xs">{card.ruleDescription}</div>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="text-[11px] text-slate-700 font-medium line-clamp-1">{card.systemSuggestedAction}</span>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="text-slate-800 text-xs">{card.currentHandler}</div>
                        <div className="mt-0.5">
                          {card.isOverdue ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-600 text-white">
                              已超时 {Math.abs(card.slaRemainingMinutes)}m
                            </span>
                          ) : card.isNearOverdue ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-white">
                              即将超时 {card.slaRemainingMinutes}m
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">余 {card.slaRemainingMinutes}m</span>
                          )}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleOpenCardDetail(card);
                          }}
                          className="px-2.5 py-1 bg-[#004ac6] hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer shadow-2xs"
                        >
                          {statusTab === 'resolved' ? '查看详情/归档' : '调阅详情/处置'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 列表渲染：状态 5 (风险记录 - 永久档案) */}
      {statusTab === 'records' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">风险事件编号 / 归档时间</th>
                  <th className="py-2.5 px-3">出卡用户 / 商户</th>
                  <th className="py-2.5 px-3">Card ID / 卡单号</th>
                  <th className="py-2.5 px-3">风险类型 / 等级</th>
                  <th className="py-2.5 px-3">涉案金额 / 避免损失</th>
                  <th className="py-2.5 px-3">触发规则与核心证据</th>
                  <th className="py-2.5 px-3">处置结论与经办人</th>
                  <th className="py-2.5 px-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredRecords.map(rec => (
                  <tr
                    key={rec.riskEventId}
                    onClick={() => {
                      setSelectedRecord(rec);
                      setSelectedCard(null);
                    }}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer font-sans"
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 font-mono text-xs">{rec.riskEventId}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{rec.closedTime}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{rec.userName} ({rec.userId})</div>
                      <div className="text-[10px] text-slate-500">{rec.merchantName} ({rec.merchantId})</div>
                    </td>

                    <td className="py-2.5 px-3 font-mono">
                      <div className="font-bold text-blue-700">{rec.cardId}</div>
                      <div className="text-[10px] text-slate-400">{rec.orderId}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold font-mono ${
                          rec.riskLevel === 'HIGH' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          rec.riskLevel === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {rec.riskLevel}
                        </span>
                        <span className="font-bold text-slate-800">{rec.riskType}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-mono">
                      <div className="font-bold text-slate-900">${rec.amount}</div>
                      <div className="text-[10px] font-bold text-emerald-700">挽损: ${rec.interceptAmount}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-mono text-[11px] font-bold text-slate-700">{rec.triggerRule}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1 max-w-sm">{rec.evidence}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900 text-xs">{rec.result}</div>
                      <div className="text-[10px] text-slate-400">{rec.handler}</div>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedRecord(rec);
                          setSelectedCard(null);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 rounded cursor-pointer"
                      >
                        档案详情
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 详情模态框 / 抽屉：严格涵盖 8 大核心版块                                  */}
      {/* 风险对象 / 风险等级 / 命中规则 / 工具事实 / 历史证据 / 系统建议 / 人工决定 / 处理结果 */}
      {/* ========================================================================= */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 lg:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* 模态框 Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-rose-400 text-[22px]">security</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm">
                      风险监控详情: {selectedCard.exceptionId} ({selectedCard.riskType})
                    </h3>
                    <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-rose-500 text-white font-mono">
                      {selectedCard.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                    Card ID: {selectedCard.cardId} · 关联卡单: {selectedCard.orderId} · 进单时间: {selectedCard.createdAt}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCard(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* 模态框 Body: 8 大版块 */}
            <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-800">
              {/* ① 风险对象 (Risk Object) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <span className="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
                    ① 风险对象 (出卡用户 / 卡密 / 关联单 / 环境指纹)
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">Object Target Profiling</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 font-sans block">出卡用户</span>
                    <span className="font-bold text-slate-900">{selectedCard.userName}</span>
                    <span className="text-slate-500 block">{selectedCard.userId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block">卡种与面额</span>
                    <span className="font-bold text-slate-900">{selectedCard.brand} ({selectedCard.country})</span>
                    <span className="text-blue-700 font-bold block">申报面额: ${selectedCard.declaredValue} USD</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block">卡码与 PIN</span>
                    <span className="font-bold text-slate-900">{selectedCard.cardCodeMasked}</span>
                    <span className="text-slate-500 block">PIN: 88** (已掩码存证)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block">关联卡单 & 撮合商户</span>
                    <span className="font-bold text-blue-700">{selectedCard.orderId}</span>
                    <span className="text-slate-500 block">MID-M08 (极速卡业)</span>
                  </div>
                </div>
              </div>

              {/* ② 风险等级 & ③ 命中规则 (并排网格) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* ② 风险等级 */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <span className="w-1.5 h-3.5 bg-rose-600 rounded-full"></span>
                    ② 风险等级与综合研判
                  </span>
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1.5 rounded-xl font-mono font-bold text-sm ${
                      selectedCard.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                      selectedCard.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}>
                      等级: {selectedCard.riskLevel}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">风险类型: {selectedCard.riskType}</div>
                      <div className="text-[11px] text-slate-500">综合风险危害指数: {selectedCard.riskLevel === 'HIGH' ? '92/100 (极高危)' : '65/100 (中度关注)'}</div>
                    </div>
                  </div>
                </div>

                {/* ③ 命中规则 */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <span className="w-1.5 h-3.5 bg-purple-600 rounded-full"></span>
                    ③ 命中规则详情 (Triggered Rules)
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {selectedCard.ruleId}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      {selectedCard.ruleDescription}
                    </p>
                  </div>
                </div>
              </div>

              {/* ④ 工具事实 & ⑤ 历史证据 (并排网格) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* ④ 工具事实 */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <span className="w-1.5 h-3.5 bg-emerald-600 rounded-full"></span>
                    ④ 工具事实 (Card Check 查卡真实快照)
                  </span>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 font-mono text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-sans">实际可用余额:</span>
                      <span className={`font-bold ${selectedCard.actualBalance === 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        ${selectedCard.actualBalance}.00 USD
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-sans">官方返回状态:</span>
                      <span className="font-bold text-slate-800">{selectedCard.actualBalance === 0 ? 'REDEEMED (已核销)' : 'Active (有效未兑换)'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-sans">验真接口源:</span>
                      <span className="text-slate-700">{selectedCard.brand} Official Enterprise Gateway (890ms)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-sans">防伪存证签名:</span>
                      <span className="text-slate-400">0x8F19...C28A (已防篡改存证)</span>
                    </div>
                  </div>
                </div>

                {/* ⑤ 历史证据 */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <span className="w-1.5 h-3.5 bg-amber-600 rounded-full"></span>
                    ⑤ 历史证据与关联溯源 (Historical Evidence)
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {selectedCard.evidenceList.map(ev => (
                      <div key={ev.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200/60 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{ev.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{ev.source} · {ev.time}</span>
                        </div>
                        <p className="text-slate-600 mt-0.5 line-clamp-2">{ev.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ⑥ 系统建议 (System Recommendation) */}
              <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 flex items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-blue-600 text-[22px] shrink-0">psychology</span>
                  <div>
                    <span className="font-bold text-blue-950 text-xs">⑥ 系统处置建议 (AI & 规则引擎推荐)</span>
                    <p className="text-blue-900 text-[11px] mt-0.5">{selectedCard.systemSuggestedAction}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-[10px] font-bold">
                    置信度 99.4%
                  </span>
                </div>
              </div>

              {/* ⑦ 人工决定 (Manual Decision) 处置表单 */}
              <form onSubmit={handleExecuteManualDecision} className="bg-white p-4 rounded-xl border-2 border-[#004ac6]/30 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <span className="w-1.5 h-3.5 bg-blue-700 rounded-full"></span>
                    ⑦ 人工决定与处置执行 (Manual Decision Action)
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">操作人: {operatorName}</span>
                </div>

                {/* 动作选择 */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                    选择处置动作 (Action):
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { id: '阻断', label: '🛑 阻断拦截 (BLOCK)', color: 'border-rose-300 text-rose-700 hover:bg-rose-50' },
                      { id: '放行', label: '✅ 人工放行 (PASS)', color: 'border-emerald-300 text-emerald-700 hover:bg-emerald-50' },
                      { id: '重新报价', label: '🔄 重新报价 (RE-QUOTE)', color: 'border-amber-300 text-amber-700 hover:bg-amber-50' },
                      { id: '转售后', label: '⚖️ 转售后争议 (DISPUTE)', color: 'border-purple-300 text-purple-700 hover:bg-purple-50' },
                      { id: '转人工查卡', label: '🔍 转人工查卡', color: 'border-blue-300 text-blue-700 hover:bg-blue-50' }
                    ].map(btn => (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => setManualAction(btn.id as AbnormalStandardAction)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          manualAction === btn.id
                            ? 'bg-[#004ac6] text-white border-[#004ac6] shadow-xs'
                            : `bg-white ${btn.color}`
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 快捷理由选择 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-700">
                      判定理由与结论说明 (Decision Reason):
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">快捷理由模板:</span>
                      {quickReasons.map((qr, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setManualReason(qr.text)}
                          className="text-[10px] text-blue-600 hover:underline cursor-pointer"
                        >
                          [{qr.label}]
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={manualReason}
                    onChange={e => setManualReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 font-sans"
                    placeholder="请输入人工决定的判定依据..."
                    required
                  />
                </div>

                {/* 误报标记与提交 */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={isFalsePositive}
                      onChange={e => setIsFalsePositive(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="font-medium">标记为【系统规则误报】(自动提交至风控策略自学习库)</span>
                  </label>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#004ac6] hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs transition-colors"
                  >
                    确认提交人工决定
                  </button>
                </div>
              </form>

              {/* ⑧ 处理结果 (Resolution Result & Timeline) */}
              {selectedCard.resolution && (
                <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-emerald-200/80">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                      <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                      ⑧ 处理结果与归档回写 (Resolution Outcome)
                    </span>
                    <span className="font-mono text-emerald-800 text-[11px] font-bold">
                      {selectedCard.resolution.finalVerdict} · {selectedCard.resolution.handledAt}
                    </span>
                  </div>
                  <div className="text-xs text-emerald-900 space-y-1">
                    <p>• <strong>经办专员:</strong> {selectedCard.resolution.handler}</p>
                    <p>• <strong>判定理由:</strong> {selectedCard.resolution.reason}</p>
                    <p>• <strong>卡单回写状态:</strong> 卡单 {selectedCard.resolution.writeBackOrderId} 已自动联动为【{selectedCard.resolution.finalVerdict}】状态</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 风险记录永久档案弹窗：同样完整呈现 8 大核心版块 */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 lg:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 text-xs">
            {/* 模态框 Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-purple-400 text-[22px]">history_edu</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm">
                      风险记录永久档案: {selectedRecord.riskEventId}
                    </h3>
                    <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-purple-500 text-white font-mono">
                      已归档
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                    Card ID: {selectedRecord.cardId} · 关联单: {selectedRecord.orderId} · 归档时间: {selectedRecord.closedTime}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* 模态框 Body: 8 大标准版块档案 */}
            <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-800">
              {/* ① 风险对象 */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <span className="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
                    ① 风险对象 (出卡用户 / 商户 / 卡密 / 关联单)
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">Object Profiling</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 font-sans block">出卡用户</span>
                    <span className="font-bold text-slate-900">{selectedRecord.userName}</span>
                    <span className="text-slate-500 block">{selectedRecord.userId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block">关联商户</span>
                    <span className="font-bold text-slate-900">{selectedRecord.merchantName || '极速卡业'}</span>
                    <span className="text-slate-500 block">{selectedRecord.merchantId || 'MID-M08'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block">涉案金额</span>
                    <span className="font-bold text-blue-700">${selectedRecord.amount} USD</span>
                    <span className="text-emerald-700 font-bold block">挽回损失: ${selectedRecord.interceptAmount} USD</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block">关联卡单 & 卡ID</span>
                    <span className="font-bold text-slate-900">{selectedRecord.cardId}</span>
                    <span className="text-blue-700 block">{selectedRecord.orderId}</span>
                  </div>
                </div>
              </div>

              {/* ② 风险等级 & ③ 命中规则 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* ② 风险等级 */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <span className="w-1.5 h-3.5 bg-rose-600 rounded-full"></span>
                    ② 风险等级与研判
                  </span>
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1.5 rounded-xl font-mono font-bold text-sm ${
                      selectedRecord.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                      selectedRecord.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}>
                      等级: {selectedRecord.riskLevel}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">风险类型: {selectedRecord.riskType}</div>
                      <div className="text-[11px] text-slate-500">归档定性: 真实风险事件 · 闭环留存</div>
                    </div>
                  </div>
                </div>

                {/* ③ 命中规则 */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <span className="w-1.5 h-3.5 bg-purple-600 rounded-full"></span>
                    ③ 命中规则
                  </span>
                  <div>
                    <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {selectedRecord.triggerRule}
                    </span>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      触发风控规则硬性拦截或中度预警策略，由规则引擎自动派发工单并捕获事实。
                    </p>
                  </div>
                </div>
              </div>

              {/* ④ 工具事实 & ⑤ 历史证据 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* ④ 工具事实 */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <span className="w-1.5 h-3.5 bg-emerald-600 rounded-full"></span>
                    ④ 工具事实 (查验存证)
                  </span>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 font-mono text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-sans">工具验真状态:</span>
                      <span className="font-bold text-slate-800">已捕获存证 (Verified)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-sans">存证签名哈希:</span>
                      <span className="text-slate-400">0x7C92...A10F (不可篡改)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-sans">接入服务来源:</span>
                      <span className="text-slate-700">Official Gateway Direct</span>
                    </div>
                  </div>
                </div>

                {/* ⑤ 历史证据 */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <span className="w-1.5 h-3.5 bg-amber-600 rounded-full"></span>
                    ⑤ 历史证据与溯源
                  </span>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px] leading-relaxed text-slate-700">
                    <p><strong>核心证据事实:</strong> {selectedRecord.evidence}</p>
                  </div>
                </div>
              </div>

              {/* ⑥ 系统建议 */}
              <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 flex items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-blue-600 text-[22px] shrink-0">psychology</span>
                  <div>
                    <span className="font-bold text-blue-950 text-xs">⑥ 系统建议</span>
                    <p className="text-blue-900 text-[11px] mt-0.5">系统初筛建议：阻断恶意卡单，存证兑换时间戳并调整出卡人信用评级。</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-[10px] font-bold">
                  引擎推荐
                </span>
              </div>

              {/* ⑦ 人工决定 */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <span className="w-1.5 h-3.5 bg-blue-700 rounded-full"></span>
                  ⑦ 人工决定
                </span>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] space-y-1">
                  <div><strong>执行操作:</strong> {selectedRecord.action}</div>
                  <div><strong>经办专员:</strong> {selectedRecord.handler}</div>
                </div>
              </div>

              {/* ⑧ 处理结果与时间线 */}
              <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-emerald-200/80">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                    ⑧ 处理结果与全流程时间线
                  </span>
                  <span className="font-mono text-emerald-800 text-[11px] font-bold">
                    {selectedRecord.result}
                  </span>
                </div>
                
                {/* 时间线 */}
                <div className="space-y-2 border-l-2 border-emerald-300 pl-3 ml-1.5">
                  {selectedRecord.timeline.map((node, i) => (
                    <div key={i} className="text-[11px] relative">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 absolute -left-[17px] top-1"></span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-500">{node.time}</span>
                        <span className="font-bold text-slate-800">{node.action}</span>
                        <span className="text-slate-500 font-mono">({node.operator})</span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{node.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
