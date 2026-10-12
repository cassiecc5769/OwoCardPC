import React, { useState, useMemo } from 'react';
import {
  AbnormalCardItem,
  AbnormalCardStatus,
  AbnormalStandardAction,
  RiskLevel
} from './riskTypes';
import { INITIAL_ABNORMAL_CARDS } from './mockRiskData';

interface AbnormalCardsTabProps {
  showToast: (msg: string) => void;
  initialFilterType?: string;
}

export const AbnormalCardsTab: React.FC<AbnormalCardsTabProps> = ({
  showToast,
  initialFilterType
}) => {
  const [cards, setCards] = useState<AbnormalCardItem[]>(INITIAL_ABNORMAL_CARDS);
  const [selectedCard, setSelectedCard] = useState<AbnormalCardItem | null>(null);
  const [statusTab, setStatusTab] = useState<'ALL' | AbnormalCardStatus | 'HIGH_RISK'>('ALL');
  const [filterRiskType, setFilterRiskType] = useState<string>(initialFilterType || 'ALL');
  const [filterBrand, setFilterBrand] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 处置动作模态框
  const [activeAction, setActiveAction] = useState<AbnormalStandardAction | null>(null);
  const [actionReason, setActionReason] = useState<string>('');
  const [operatorName, setOperatorName] = useState<string>('当前客服专员 (工号CS08)');
  const [isFalsePositive, setIsFalsePositive] = useState<boolean>(false);
  const [newQuoteAmount, setNewQuoteAmount] = useState<string>('100');

  // 排序与过滤：按已超时 ➔ 即将超时 ➔ 高风险 ➔ 高金额 ➔ 等待时间
  const filteredAndSortedCards = useMemo(() => {
    return cards
      .filter(item => {
        // Tab 状态筛选
        if (statusTab === 'HIGH_RISK') {
          if (item.riskLevel !== 'HIGH') return false;
        } else if (statusTab !== 'ALL') {
          if (item.status !== statusTab) return false;
        }

        // 风险类型筛选
        if (filterRiskType !== 'ALL' && item.riskType !== filterRiskType) return false;

        // 品牌筛选
        if (filterBrand !== 'ALL' && item.brand !== filterBrand) return false;

        // 关键词
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchId = item.exceptionId.toLowerCase().includes(q) || item.cardId.toLowerCase().includes(q) || item.orderId.toLowerCase().includes(q);
          const matchUser = item.userName.toLowerCase().includes(q) || item.userId.toLowerCase().includes(q);
          if (!matchId && !matchUser) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // 1. 已超时排第一
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;

        // 2. 即将超时排第二
        if (a.isNearOverdue && !b.isNearOverdue) return -1;
        if (!a.isNearOverdue && b.isNearOverdue) return 1;

        // 3. 高风险排第三
        const levelWeight: Record<RiskLevel, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        if (levelWeight[a.riskLevel] !== levelWeight[b.riskLevel]) {
          return levelWeight[b.riskLevel] - levelWeight[a.riskLevel];
        }

        // 4. 高金额排第四
        return b.declaredValue - a.declaredValue;
      });
  }, [cards, statusTab, filterRiskType, filterBrand, searchQuery]);

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

    const updated: AbnormalCardItem = {
      ...selectedCard,
      status: '已处理',
      resolution: {
        action: activeAction,
        finalVerdict: verdict,
        handler: operatorName,
        reason: actionReason.trim(),
        isFalsePositive,
        handledAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        writeBackOrderId: selectedCard.orderId
      }
    };

    setCards(prev => prev.map(c => c.exceptionId === updated.exceptionId ? updated : c));
    setSelectedCard(updated);
    setActiveAction(null);
    setActionReason('');
    setIsFalsePositive(false);

    showToast(`✅ 异常卡【${selectedCard.exceptionId}】已完成【${verdict}】处置！已自动回写卡单 ${selectedCard.orderId} 与风险档案。`);
  };

  return (
    <div className="flex flex-col space-y-4 text-xs text-slate-800 antialiased">
      {/* 职责说明卡 */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0">
            <span className="material-symbols-outlined text-[22px]">gpp_maybe</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-slate-900 text-sm">异常卡（当前需要自动或人工处置的风险卡工作池）</h2>
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-mono text-[10px] font-bold border border-rose-200">
                处理事情的业务工作池
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              按 <strong className="text-slate-700">已超时 ➔ 即将超时 ➔ 高风险 ➔ 高金额</strong> 智能置顶，标准化处置动作，杜绝自由随意输入，支持误报记录与卡单自动回写。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 font-bold font-mono text-xs flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">timer</span>
            <span>待处理: {cards.filter(c => c.status !== '已处理').length} 张</span>
          </div>
        </div>
      </div>

      {/* 状态 Tab 切换栏 (全部 ｜ 待处理 ｜ 处理中 ｜ 待人工确认 ｜ 已处理 ｜ 高风险) */}
      <div className="bg-white rounded-xl p-1.5 border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'ALL', label: '全部异常卡', count: cards.length },
            { id: '待处理', label: '待处理', count: cards.filter(c => c.status === '待处理').length, badgeColor: 'bg-rose-50 text-rose-700 border-rose-200' },
            { id: '处理中', label: '处理中', count: cards.filter(c => c.status === '处理中').length, badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
            { id: '待确认', label: '待人工确认', count: cards.filter(c => c.status === '待确认').length, badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
            { id: '已处理', label: '已处理', count: cards.filter(c => c.status === '已处理').length, badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            { id: 'HIGH_RISK', label: '🔥 高风险集中池', count: cards.filter(c => c.riskLevel === 'HIGH').length, badgeColor: 'bg-red-600 text-white' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                statusTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                statusTab === tab.id ? 'bg-white/20 text-white' : tab.badgeColor || 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 风险类型筛选与搜索条 */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
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
            <option value="其他">其他 / 查询失败</option>
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

          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
              search
            </span>
            <input
              type="text"
              placeholder="搜索异常单号 / Card ID / 卡单号 / 用户..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 w-64"
            />
          </div>
        </div>

        <span className="text-slate-400 font-mono text-[11px]">
          共 {filteredAndSortedCards.length} 笔异常待办 (智能按 SLA 优先级排序)
        </span>
      </div>

      {/* 异常卡工作池双栏/列表 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold">
                <th className="py-2.5 px-3">异常单号 / 关联卡单</th>
                <th className="py-2.5 px-3">出卡用户</th>
                <th className="py-2.5 px-3">卡种 / 国家</th>
                <th className="py-2.5 px-3">申报 / 查验余额</th>
                <th className="py-2.5 px-3">风险类型</th>
                <th className="py-2.5 px-3">风险等级</th>
                <th className="py-2.5 px-3">系统建议动作</th>
                <th className="py-2.5 px-3">当前处理人</th>
                <th className="py-2.5 px-3">SLA 时效</th>
                <th className="py-2.5 px-3">当前状态</th>
                <th className="py-2.5 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredAndSortedCards.map(item => (
                <tr
                  key={item.exceptionId}
                  onClick={() => setSelectedCard(item)}
                  className={`hover:bg-blue-50/40 transition-colors cursor-pointer font-sans ${
                    item.isOverdue ? 'bg-rose-50/20' : item.isNearOverdue ? 'bg-amber-50/20' : ''
                  }`}
                >
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-rose-700 font-mono text-xs">{item.exceptionId}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.orderId} · {item.cardId}</div>
                  </td>

                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900">{item.userName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.userId}</div>
                  </td>

                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900">{item.brand}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.country} · {item.cardCodeMasked}</div>
                  </td>

                  <td className="py-2.5 px-3 font-mono">
                    <span className="text-slate-500">${item.declaredValue}</span>
                    <span className="text-slate-400 mx-1">&rarr;</span>
                    <span className={`font-bold ${item.actualBalance === 0 ? 'text-rose-600' : 'text-blue-700'}`}>
                      ${item.actualBalance}
                    </span>
                  </td>

                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      {item.riskType}
                    </span>
                  </td>

                  <td className="py-2.5 px-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      item.riskLevel === 'HIGH' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      item.riskLevel === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {item.riskLevel === 'HIGH' ? '高危' : item.riskLevel === 'MEDIUM' ? '中危' : '低危'}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-xs truncate" title={item.systemSuggestedAction}>
                    {item.systemSuggestedAction}
                  </td>

                  <td className="py-2.5 px-3 text-slate-700 text-[11px]">
                    {item.currentHandler}
                  </td>

                  <td className="py-2.5 px-3 font-mono text-[11px]">
                    {item.status === '已处理' ? (
                      <span className="text-slate-400">已结案</span>
                    ) : item.isOverdue ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                        已超时 {Math.abs(item.slaRemainingMinutes)}m
                      </span>
                    ) : item.isNearOverdue ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white">
                        剩余 {item.slaRemainingMinutes}m
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold">
                        剩余 {item.slaRemainingMinutes}m
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === '待处理' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      item.status === '处理中' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      item.status === '待确认' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {item.status}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedCard(item);
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      处置工作台
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 异常卡详情与标准化处置 Drawer / Modal (5 大区域) */}
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
                      异常卡处置工作台 ({selectedCard.exceptionId})
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedCard.riskLevel === 'HIGH' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {selectedCard.riskType} · {selectedCard.riskLevel}
                    </span>
                  </div>
                  <span className="text-slate-500 text-[11px] font-mono">
                    关联卡单: {selectedCard.orderId} · 关联卡: {selectedCard.cardId} · 检出时间: {selectedCard.createdAt}
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
              {/* 15.1 卡信息 */}
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
                    <span className="text-slate-400 font-sans block text-[10px]">卡码摘要:</span>
                    <strong className="text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">{selectedCard.cardCodeMasked}</strong>
                  </div>
                </div>
              </div>

              {/* 15.2 风险原因与命中规则 */}
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

              {/* 15.3 风险证据链 (自动聚合) */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-purple-600">auto_awesome_motion</span>
                  <span>3. 聚合风险证据链（无需跨页面拼凑证据）</span>
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

              {/* 15.4 系统建议动作 */}
              <div className="bg-amber-50/70 rounded-xl p-3.5 border border-amber-200 space-y-1">
                <h4 className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-600">lightbulb</span>
                  <span>4. 系统建议处置动作</span>
                </h4>
                <p className="text-slate-800 text-xs font-semibold">
                  {selectedCard.systemSuggestedAction}
                </p>
              </div>

              {/* 15.5 标准化处置动作操作台 */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">gavel</span>
                  <span>5. 标准化人工处置操作台（留痕存证）</span>
                </h4>

                {/* 标准动作快捷选择 */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { action: '阻断' as AbnormalStandardAction, label: '阻断交易', icon: 'block', desc: '明确欺诈/零余额废卡', color: 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100' },
                    { action: '放行' as AbnormalStandardAction, label: '确认放行', icon: 'check_circle', desc: '人工复核无风险', color: 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100' },
                    { action: '重新报价' as AbnormalStandardAction, label: '重新报价', icon: 'price_change', desc: '按实际余额重新计价', color: 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100' },
                    { action: '转售后' as AbnormalStandardAction, label: '转售后争议', icon: 'support_agent', desc: '移交售后调查仲裁', color: 'bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100' },
                    { action: '重新查询' as AbnormalStandardAction, label: '重新查验', icon: 'sync', desc: '通道超时重试/切备用源', color: 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100' }
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
                        <span className="material-symbols-outlined text-[16px]">{btn.icon}</span>
                        <span>{btn.label}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{btn.desc}</div>
                    </button>
                  ))}
                </div>

                {/* 执行处置表单 */}
                {activeAction && (
                  <form onSubmit={handleExecuteResolution} className="bg-white p-3.5 rounded-xl border border-slate-300 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-700 text-xs flex items-center gap-1">
                        <span>正在执行处置动作:</span>
                        <strong className="underline font-mono">{activeAction}</strong>
                      </span>
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isFalsePositive}
                          onChange={e => setIsFalsePositive(e.target.checked)}
                          className="rounded text-blue-600"
                        />
                        <span className="font-semibold text-purple-700">记录为系统风控规则【误报】(作为规则调优依据)</span>
                      </label>
                    </div>

                    {activeAction === '重新报价' && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-600 font-medium">调整后有效面额:</span>
                        <input
                          type="number"
                          value={newQuoteAmount}
                          onChange={e => setNewQuoteAmount(e.target.value)}
                          className="w-28 p-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                        />
                        <span className="text-slate-500 font-mono">USD</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-slate-700 font-semibold text-xs mb-1">
                        处置判定原因与事实依据说明 (必填，写入审计底稿):
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="例如：调阅 Valve 官方激活时间戳，确认该卡已被兑换核销，执行阻断并将用户标记为高风险..."
                        value={actionReason}
                        onChange={e => setActionReason(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-400 font-mono text-[11px]">
                        操作人: {operatorName}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveAction(null)}
                          className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-medium cursor-pointer"
                        >
                          取消
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer"
                        >
                          确认并执行处置
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* 已结案结果展示 */}
                {selectedCard.resolution && (
                  <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-800">
                        已结案：【{selectedCard.resolution.finalVerdict}】
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        结案时间: {selectedCard.resolution.handledAt} · 处理人: {selectedCard.resolution.handler}
                      </span>
                    </div>
                    <p className="text-slate-700 text-[11px]">
                      说理原因: {selectedCard.resolution.reason}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/80">
              <span className="text-slate-400 text-xs font-mono">
                异常卡处理与客服工作台共享同一事实中心，杜绝数据孤岛
              </span>
              <button
                onClick={() => setSelectedCard(null)}
                className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200 text-xs cursor-pointer"
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
