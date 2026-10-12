import React, { useState } from 'react';
import { NavPath } from '../../types';

interface StatusItem {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  isCoreProtected: boolean; // 核心保护流转不能随意删除
  enabled: boolean;
  color: string;
  sortOrder: number;
}

interface ReasonItem {
  id: string;
  code: string;
  name: string;
  type: 'anomaly' | 'dispute' | 'failover';
  description: string;
  decisionAction: string;
  isCoreProtected: boolean;
  enabled: boolean;
  usageCount: number;
}

export const TradingConfigView: React.FC<{ onNavigate?: (path: NavPath) => void }> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'order_status' | 'card_status' | 'anomaly_reasons' | 'dispute_reasons' | 'failover_reasons'>('order_status');

  // 1. 订单状态配置
  const [orderStatuses, setOrderStatuses] = useState<StatusItem[]>([
    { id: 'OS-01', code: 'PENDING_DISPATCH', name: '待分配/待撮合', category: '撮合阶段', description: '用户提交卡密已完成初筛，等待分发商户', isCoreProtected: true, enabled: true, color: 'bg-amber-50 text-amber-700 border-amber-200', sortOrder: 1 },
    { id: 'OS-02', code: 'MERCHANT_CLAIMED', name: '商户已接单', category: '履约阶段', description: '商户已认领卡密，进入SLA履约核销计时', isCoreProtected: true, enabled: true, color: 'bg-blue-50 text-blue-700 border-blue-200', sortOrder: 2 },
    { id: 'OS-03', code: 'PROCESSING', name: '核销处理中', category: '履约阶段', description: '商户正在兑换/卡密核验中', isCoreProtected: true, enabled: true, color: 'bg-blue-50 text-blue-700 border-blue-200', sortOrder: 3 },
    { id: 'OS-04', code: 'COMPLETED', name: '交易已完成', category: '终态', description: '核销成功，已扣减商户积点，资金已入账用户余额', isCoreProtected: true, enabled: true, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', sortOrder: 4 },
    { id: 'OS-05', code: 'SUSPENDED_VERIFY', name: '挂起核验/可疑', category: '风控阶段', description: '命中风控或Card Check申报差异，进入人工预检任务', isCoreProtected: true, enabled: true, color: 'bg-amber-50 text-amber-700 border-amber-200', sortOrder: 5 },
    { id: 'OS-06', code: 'DISPUTE_ARBITRATION', name: '售后争议仲裁中', category: '售后阶段', description: '商户或出卡方发起争议，客服调取T1~T4快照裁决', isCoreProtected: true, enabled: true, color: 'bg-purple-50 text-purple-700 border-purple-200', sortOrder: 6 },
    { id: 'OS-07', code: 'CANCELLED_REFUND', name: '已取消退回', category: '终态', description: '假卡拦截、无效卡退回或超时取消', isCoreProtected: false, enabled: true, color: 'bg-slate-100 text-slate-700 border-slate-200', sortOrder: 7 },
  ]);

  // 2. 卡单状态配置
  const [cardStatuses, setCardStatuses] = useState<StatusItem[]>([
    { id: 'CS-01', code: 'CARD_SUBMITTED', name: 'T1 用户提交', category: '证据链T1', description: '出卡端原始录入，生成卡密哈希与申报面额', isCoreProtected: true, enabled: true, color: 'bg-slate-100 text-slate-700 border-slate-200', sortOrder: 1 },
    { id: 'CS-02', code: 'CARD_PRECHECKING', name: 'Card Check 预检中', category: '风控检验', description: '调用官方查验API比对余额与卡状态', isCoreProtected: true, enabled: true, color: 'bg-blue-50 text-blue-700 border-blue-200', sortOrder: 2 },
    { id: 'CS-03', code: 'CARD_CHECK_PASSED', name: '预检通过有效卡', category: '风控检验', description: '余额一致且未兑换，允许进入撮合池', isCoreProtected: true, enabled: true, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', sortOrder: 3 },
    { id: 'CS-04', code: 'CARD_MERCHANT_LOCK', name: 'T2 商户接卡锁定', category: '证据链T2', description: '商户认领密文，扣除商户安全冻结积点', isCoreProtected: true, enabled: true, color: 'bg-blue-50 text-blue-700 border-blue-200', sortOrder: 4 },
    { id: 'CS-05', code: 'CARD_REDEEMING', name: 'T3 商户充值核销', category: '证据链T3', description: '商户向官方充值，记录核销发起时间戳', isCoreProtected: true, enabled: true, color: 'bg-blue-50 text-blue-700 border-blue-200', sortOrder: 5 },
    { id: 'CS-06', code: 'CARD_SETTLED_SUCCESS', name: 'T4 核销完成清算', category: '证据链T4', description: '商户确认核销成功，生成结算与收益明细', isCoreProtected: true, enabled: true, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', sortOrder: 6 },
    { id: 'CS-07', code: 'CARD_ABNORMAL_FAILOVER', name: '异常待转单', category: '转单流转', description: '商户拒单或超时，自动进入承接能力池二次转单', isCoreProtected: true, enabled: true, color: 'bg-purple-50 text-purple-700 border-purple-200', sortOrder: 7 },
  ]);

  // 3. 异常原因配置
  const [anomalyReasons, setAnomalyReasons] = useState<ReasonItem[]>([
    { id: 'AR-01', code: 'ERR_ZERO_BALANCE', name: 'Card Check 零余额 (已兑换)', type: 'anomaly', description: '官方查验API返回当前卡密余额为0', decisionAction: '拦截订单并通知用户', isCoreProtected: true, enabled: true, usageCount: 428 },
    { id: 'AR-02', code: 'ERR_VALUE_MISMATCH', name: '申报面额与实际余额不符', type: 'anomaly', description: '用户申报$100，API查验实为$50或$25', decisionAction: '挂起核验或按实核销', isCoreProtected: true, enabled: true, usageCount: 194 },
    { id: 'AR-03', code: 'ERR_INVALID_CODE', name: '卡号/PIN格式错误或不存在', type: 'anomaly', description: '卡密字符不符合正则规则或官方返回无效卡号', decisionAction: '自动拦截拒绝', isCoreProtected: true, enabled: true, usageCount: 312 },
    { id: 'AR-04', code: 'ERR_REGION_MISMATCH', name: '卡种国家/地区限制不符', type: 'anomaly', description: '美区提交了欧区/英区卡密', decisionAction: '建议用户修正国家重新提交', isCoreProtected: false, enabled: true, usageCount: 86 },
    { id: 'AR-05', code: 'ERR_MERCHANT_TIMEOUT', name: '商户履约处理超时', type: 'anomaly', description: '商户认领后超出SLA时限未回报核销结果', decisionAction: '触发商户承接能力池转单', isCoreProtected: true, enabled: true, usageCount: 65 },
  ]);

  // 4. 售后原因配置
  const [disputeReasons, setDisputeReasons] = useState<ReasonItem[]>([
    { id: 'DR-01', code: 'DISP_USED_BY_OTHERS', name: '商户反馈已被使用 (Already Redeemed)', type: 'dispute', description: '商户充值时官方提示卡已被其他账号兑换', decisionAction: '对比T1~T4快照判定兑换时间责任', isCoreProtected: true, enabled: true, usageCount: 142 },
    { id: 'DR-02', code: 'DISP_CARD_LOCKED', name: '卡密已被锁定/风控冻结 (Card Locked)', type: 'dispute', description: '官方发卡行对该卡实施反洗钱或防欺诈冻结', decisionAction: '要求出卡方提供原始小票凭证', isCoreProtected: true, enabled: true, usageCount: 97 },
    { id: 'DR-03', code: 'DISP_INACTIVE_CARD', name: '卡未激活 (Not Activated at Register)', type: 'dispute', description: '线下商超收银台未扫码激活有效', decisionAction: '判定出卡方全责，原路退回', isCoreProtected: true, enabled: true, usageCount: 53 },
    { id: 'DR-04', code: 'DISP_INVALID_PIN', name: 'PIN码被刮损或遮挡错误', type: 'dispute', description: '实体卡涂层刮花导致关键位模糊', decisionAction: '客服人工图片增强识别', isCoreProtected: false, enabled: true, usageCount: 38 },
  ]);

  // 5. 转单原因配置
  const [failoverReasons, setFailoverReasons] = useState<ReasonItem[]>([
    { id: 'FR-01', code: 'FAILOVER_MERCHANT_TIMEOUT', name: '原商户接单/核销超时', type: 'failover', description: '原商户在规定SLA时限内未完成处理', decisionAction: '读取承接池推荐最优商户转单', isCoreProtected: true, enabled: true, usageCount: 182 },
    { id: 'FR-02', code: 'FAILOVER_POINTS_LOW', name: '原商户积点水位不足', type: 'failover', description: '原商户可用积点低于订单所需保证金', decisionAction: '自动剔除并重配高积点商户', isCoreProtected: true, enabled: true, usageCount: 79 },
    { id: 'FR-03', code: 'FAILOVER_MERCHANT_REJECT', name: '原商户主动报异/配额用尽', type: 'failover', description: '商户因单日额度饱和主动申请流单', decisionAction: '平滑转单至备选报价商户', isCoreProtected: true, enabled: true, usageCount: 114 },
    { id: 'FR-04', code: 'FAILOVER_SYSTEM_SWITCH', name: '系统风控熔断强制转单', type: 'failover', description: '原商户被风控判定异常风险评级上升', decisionAction: '即刻回收密文并安全重派', isCoreProtected: true, enabled: true, usageCount: 26 },
  ]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const toggleStatusEnabled = (id: string, isOrder: boolean) => {
    if (isOrder) {
      setOrderStatuses(prev => prev.map(s => {
        if (s.id === id) {
          if (s.isCoreProtected && s.enabled) {
            showToast(`核心受保护状态 [${s.name}] 不可随意停用，已限制操作`);
            return s;
          }
          const next = !s.enabled;
          showToast(`订单状态 [${s.name}] 已${next ? '启用' : '停用'}`);
          return { ...s, enabled: next };
        }
        return s;
      }));
    } else {
      setCardStatuses(prev => prev.map(s => {
        if (s.id === id) {
          if (s.isCoreProtected && s.enabled) {
            showToast(`核心证据链状态 [${s.name}] 受保护，不可随意停用`);
            return s;
          }
          const next = !s.enabled;
          showToast(`卡单状态 [${s.name}] 已${next ? '启用' : '停用'}`);
          return { ...s, enabled: next };
        }
        return s;
      }));
    }
  };

  const toggleReasonEnabled = (id: string, type: 'anomaly' | 'dispute' | 'failover') => {
    const updateList = (prev: ReasonItem[]) => prev.map(r => {
      if (r.id === id) {
        const next = !r.enabled;
        showToast(`原因项 [${r.name}] 已${next ? '启用' : '停用'}`);
        return { ...r, enabled: next };
      }
      return r;
    });

    if (type === 'anomaly') setAnomalyReasons(updateList);
    else if (type === 'dispute') setDisputeReasons(updateList);
    else setFailoverReasons(updateList);
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl text-xs flex items-center space-x-2 border border-slate-700 animate-fade-in">
          <span className="material-symbols-outlined text-amber-400 text-sm">info</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5">
              <span className="inline-flex items-center justify-center p-1.5 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
                <span className="material-symbols-outlined text-xl">swap_horiz</span>
              </span>
              <span className="text-xs font-mono tracking-wider text-blue-300 font-bold uppercase">
                Trading Core Configuration (六十二条规范)
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">交易配置中心</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              统一配置：<strong className="text-blue-300">订单状态 ｜ 卡单状态 ｜ 异常原因 ｜ 售后原因 ｜ 转单原因</strong>。支持灵活启停，核心状态流转设置系统级防删除保护，保障履约与对账一致性。
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-xs space-y-1">
            <div className="text-slate-400 font-medium">核心安全规范</div>
            <div className="text-amber-300 font-bold flex items-center space-x-1">
              <span className="material-symbols-outlined text-sm">lock</span>
              <span>核心状态保护机制生效中 (禁止删除)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs - Standard Image Tab Bar Style */}
      <section className="bg-white rounded-xl border border-slate-200/90 shadow-2xs px-2 pt-2 flex items-center justify-between gap-1 overflow-x-auto text-xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'order_status', label: '订单状态配置', icon: 'receipt_long', badge: `${orderStatuses.length}项` },
            { id: 'card_status', label: '卡单证据链状态', icon: 'credit_card', badge: `${cardStatuses.length}项` },
            { id: 'anomaly_reasons', label: '异常原因配置', icon: 'warning', badge: `${anomalyReasons.length}项` },
            { id: 'dispute_reasons', label: '售后争议原因', icon: 'gavel', badge: `${disputeReasons.length}项` },
            { id: 'failover_reasons', label: '转单原因配置', icon: 'alt_route', badge: `${failoverReasons.length}项` }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-3 font-bold rounded-t-lg transition-colors shrink-0 flex items-center gap-2 relative cursor-pointer text-xs sm:text-sm ${
                  isActive
                    ? 'text-[#004ac6] bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#004ac6]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono transition-colors ${
                    isActive ? 'bg-blue-100 text-[#004ac6] font-semibold' : 'bg-slate-100 text-slate-600 font-medium'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Tab 1: 订单状态 */}
      {activeTab === 'order_status' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">序号</th>
                <th className="px-4 py-3">状态代码 / 名称</th>
                <th className="px-4 py-3">业务生命周期阶段</th>
                <th className="px-4 py-3">状态定义与流转说明</th>
                <th className="px-4 py-3">核心流转保护</th>
                <th className="px-4 py-3">状态启停</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orderStatuses.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-mono text-slate-400 font-bold">{s.sortOrder}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${s.color}`}>
                      {s.name}
                    </span>
                    <div className="text-[11px] font-mono text-slate-400 mt-1">{s.code}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{s.category}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-sm leading-relaxed">{s.description}</td>
                  <td className="px-4 py-3">
                    {s.isCoreProtected ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                        <span className="material-symbols-outlined text-xs">lock</span>
                        <span>核心保护 (不可删除)</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">自定义扩展</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatusEnabled(s.id, true)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        s.enabled ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          s.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => showToast(`已查看 [${s.name}] 的状态机前置后置映射流`)}
                      className="px-2.5 py-1 text-xs text-blue-600 hover:bg-blue-50 font-bold rounded-lg transition-colors"
                    >
                      流转图谱
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: 卡单证据链状态 */}
      {activeTab === 'card_status' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">序号</th>
                <th className="px-4 py-3">证据链代码 / 名称</th>
                <th className="px-4 py-3">T1~T4 证据链归属</th>
                <th className="px-4 py-3">说明</th>
                <th className="px-4 py-3">保护状态</th>
                <th className="px-4 py-3">启停</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cardStatuses.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-mono text-slate-400 font-bold">{s.sortOrder}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${s.color}`}>
                      {s.name}
                    </span>
                    <div className="text-[11px] font-mono text-slate-400 mt-1">{s.code}</div>
                  </td>
                  <td className="px-4 py-3 font-bold text-indigo-900">{s.category}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-sm leading-relaxed">{s.description}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      <span>快照证据保护</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatusEnabled(s.id, false)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        s.enabled ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          s.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => showToast(`已查看 [${s.name}] 的快照校验规则`)}
                      className="px-2.5 py-1 text-xs text-blue-600 hover:bg-blue-50 font-bold rounded-lg transition-colors"
                    >
                      证据配置
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3, 4, 5: 字典原因配置 */}
      {(activeTab === 'anomaly_reasons' || activeTab === 'dispute_reasons' || activeTab === 'failover_reasons') && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">原因编号 / 代码</th>
                <th className="px-4 py-3">原因名称</th>
                <th className="px-4 py-3">描述说明</th>
                <th className="px-4 py-3">系统联动决策动作</th>
                <th className="px-4 py-3">累计调用频次</th>
                <th className="px-4 py-3">启停控制</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(activeTab === 'anomaly_reasons' ? anomalyReasons : activeTab === 'dispute_reasons' ? disputeReasons : failoverReasons).map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-mono font-bold text-slate-800">
                    <div>{r.id}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{r.code}</div>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">{r.name}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs">{r.description}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 font-medium border border-indigo-200 text-[11px]">
                      ⚡ {r.decisionAction}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-slate-700">{r.usageCount} 次</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleReasonEnabled(r.id, r.type)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        r.enabled ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          r.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => showToast(`编辑原因项: ${r.name}`)}
                      className="px-2.5 py-1 text-xs text-blue-600 hover:bg-blue-50 font-bold rounded-lg transition-colors"
                    >
                      编辑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
