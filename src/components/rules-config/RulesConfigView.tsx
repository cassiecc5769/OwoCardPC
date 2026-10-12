import React, { useState, useEffect } from 'react';
import { NavPath } from '../../types';

export type RuleCategory = 'quote' | 'card_check' | 'risk' | 'sla' | 'loss';

export interface RuleItem {
  id: string;
  category: RuleCategory;
  name: string;
  key: string;
  currentValue: string | number;
  unit: string;
  description: string;
  impactScope: string;
  lastUpdated: string;
  lastOperator: string;
  version: string;
}

export interface RuleAuditLog {
  id: string;
  ruleId: string;
  ruleName: string;
  category: RuleCategory;
  oldValue: string;
  newValue: string;
  operator: string;
  reason: string;
  effectiveTime: string;
  approvalTicket: string;
}

export const RulesConfigView: React.FC<{
  initialCategory?: RuleCategory;
  onNavigate?: (path: NavPath) => void;
}> = ({ initialCategory = 'quote', onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<RuleCategory>(initialCategory);

  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  // 1. 规则数据
  const [rules, setRules] = useState<RuleItem[]>([
    // 报价规则
    { id: 'RL-QUOTE-01', category: 'quote', name: '价差告警阈值', key: 'SPREAD_ALERT_THRESHOLD', currentValue: '5.0', unit: '%', description: '平台商户报价与外部主力行情价差超出此比例时触发预警', impactScope: '全品类报价监控机器人', lastUpdated: '2026-10-04 18:30:00', lastOperator: '策略运营-张宇', version: 'v3.2' },
    { id: 'RL-QUOTE-02', category: 'quote', name: '异常波动连续笔数', key: 'ABNORMAL_VOLATILITY_COUNT', currentValue: '3', unit: '笔', description: '连续N笔撮合价格出现剧烈震荡时启动防套利保护', impactScope: '实时撮合引擎', lastUpdated: '2026-10-02 11:00:00', lastOperator: '策略运营-张宇', version: 'v3.1' },
    { id: 'RL-QUOTE-03', category: 'quote', name: '异常报价比例熔断', key: 'PRICE_FROZEN_RATIO', currentValue: '8.0', unit: '%', description: '报价偏离度超过此比例自动熔断该商户对该SKU的接单权限', impactScope: '商户报价池', lastUpdated: '2026-09-28 15:40:00', lastOperator: '风控总监-赵鹏', version: 'v2.8' },
    { id: 'RL-QUOTE-04', category: 'quote', name: '外部行情抓取有效期', key: 'MARKET_TICK_VALIDITY', currentValue: '15', unit: '分钟', description: '超过此时间未获取到有效行情源则标记为行情过期', impactScope: '行情抓取爬虫矩阵', lastUpdated: '2026-10-01 09:00:00', lastOperator: '系统架构组', version: 'v1.9' },

    // Card Check规则
    { id: 'RL-CHK-01', category: 'card_check', name: '查询源轮询与主备策略', key: 'QUERY_SOURCE_STRATEGY', currentValue: '主节点A直连 + 故障自动切换备节点B', unit: '策略', description: '首批支持 Apple、Steam、Sephora、Target、Foot Locker、Macy\'s 等品牌官方与专线查验', impactScope: 'Card Check 查验中心', lastUpdated: '2026-10-05 08:20:00', lastOperator: '风控策略组', version: 'v4.0' },
    { id: 'RL-CHK-02', category: 'card_check', name: 'Card Check 请求超时时限', key: 'CARD_CHECK_TIMEOUT', currentValue: '3.5', unit: '秒', description: '单次官方API接口响应超过此时间即判定为临时超时', impactScope: 'Card Check 接入网关', lastUpdated: '2026-09-30 14:15:00', lastOperator: '风控策略组', version: 'v2.4' },
    { id: 'RL-CHK-03', category: 'card_check', name: '查验失败最大重试次数', key: 'CARD_CHECK_MAX_RETRY', currentValue: '2', unit: '次', description: '遇到502/504等网络抖动时自动轮询备用节点的重试上限', impactScope: '交易预检引擎', lastUpdated: '2026-10-03 16:00:00', lastOperator: '风控策略组', version: 'v2.1' },
    { id: 'RL-CHK-04', category: 'card_check', name: '品牌卡种差异化查验策略', key: 'BRAND_SPECIFIC_POLICIES', currentValue: 'Apple强制余额+状态；Steam强制查验激活状态+T1证据', unit: '策略集', description: '针对不同卡种配置不同的字段比对模式', impactScope: '全品牌查验适配器', lastUpdated: '2026-10-04 10:00:00', lastOperator: '风控总监-赵鹏', version: 'v3.5' },

    // 风控规则
    { id: 'RL-RISK-01', category: 'risk', name: '重复卡密全库比对周期', key: 'DUPLICATE_CHECK_WINDOW', currentValue: '90', unit: '天', description: '提交卡密哈希与全库历史卡密进行碰撞比对的追溯时间', impactScope: '防碰卡/防重复引擎', lastUpdated: '2026-09-25 12:00:00', lastOperator: '风控策略组', version: 'v2.0' },
    { id: 'RL-RISK-02', category: 'risk', name: '余额比对申报容差', key: 'BALANCE_MISMATCH_TOLERANCE', currentValue: '0.00', unit: 'USD', description: '严谨0容差：真实余额低于申报面额哪怕$0.01即拦截判定异常', impactScope: '交易预检比对层', lastUpdated: '2026-10-01 10:00:00', lastOperator: '风控总监-赵鹏', version: 'v3.0' },
    { id: 'RL-RISK-03', category: 'risk', name: '状态机严密合规校验', key: 'STATE_MACHINE_VALIDATION', currentValue: '强制验证 T1提交 -> T2接单 -> T3处理 -> T4完成', unit: '状态约束', description: '缺失前置状态节点证据则直接拦截结算', impactScope: '履约状态机', lastUpdated: '2026-09-20 18:00:00', lastOperator: '风控架构组', version: 'v2.2' },
    { id: 'RL-RISK-04', category: 'risk', name: '出卡方历史风险加权', key: 'USER_RISK_WEIGHTING', currentValue: '历史争议率>2% 强制转人工预检', unit: '阈值', description: '有历史争议或黑名单关联特征的出卡用户自动升级审查', impactScope: '用户信誉评级引擎', lastUpdated: '2026-10-03 14:00:00', lastOperator: '风控策略组', version: 'v2.6' },

    // SLA规则
    { id: 'RL-SLA-01', category: 'sla', name: '客服首次响应时限', key: 'CS_FIRST_RESPONSE_SLA', currentValue: '30', unit: '秒', description: '用户或商户发起在线咨询客服必须响应的时限', impactScope: '在线客服工作台', lastUpdated: '2026-09-15 09:00:00', lastOperator: '客服主管-李雪', version: 'v1.5' },
    { id: 'RL-SLA-02', category: 'sla', name: '客服异常工单处理时限', key: 'CS_TASK_PROCESS_SLA', currentValue: '15', unit: '分钟', description: '统一任务中心指派给客服的异常卡核验与转单SLA', impactScope: '统一任务中心', lastUpdated: '2026-10-02 17:30:00', lastOperator: '客服主管-李雪', version: 'v2.0' },
    { id: 'RL-SLA-03', category: 'sla', name: '商户接单响应时限', key: 'MERCHANT_ACCEPT_SLA', currentValue: '60', unit: '秒', description: '撮合派单到达商户后超过此时间未接单自动触发流单转单', impactScope: '承接能力调度池', lastUpdated: '2026-10-04 11:20:00', lastOperator: '商户运营组', version: 'v3.0' },
    { id: 'RL-SLA-04', category: 'sla', name: '商户核销处理完成时限', key: 'MERCHANT_REDEEM_SLA', currentValue: '3', unit: '分钟', description: '商户认领卡密后回报核销结果的最大允许耗时', impactScope: '商户履约监控', lastUpdated: '2026-10-04 11:20:00', lastOperator: '商户运营组', version: 'v3.0' },

    // 损失规则
    { id: 'RL-LOSS-01', category: 'loss', name: 'Tier-1 转单/赔付免审/主管审批阈值', key: 'LOSS_TIER_1_THRESHOLD', currentValue: '100', unit: 'USD', description: '转单损失或客诉赔付 ≤ $100 时由客服主管/一线运营主管快速审批', impactScope: '异常账务与赔付', lastUpdated: '2026-09-10 14:00:00', lastOperator: '财务总监-钱立', version: 'v1.8' },
    { id: 'RL-LOSS-02', category: 'loss', name: 'Tier-2 财务经理审批阈值', key: 'LOSS_TIER_2_THRESHOLD', currentValue: '1000', unit: 'USD', description: '转单损失在 $100 ~ $1000 区间必须流转至财务经理审批', impactScope: '财务结算审批流', lastUpdated: '2026-09-10 14:00:00', lastOperator: '财务总监-钱立', version: 'v1.8' },
    { id: 'RL-LOSS-03', category: 'loss', name: 'Tier-3 财务总监终审阈值', key: 'LOSS_TIER_3_THRESHOLD', currentValue: '1000', unit: 'USD (超过)', description: '单笔损失超过 $1000 触发最高级别财务总监与风控总监联签审批', impactScope: '高风险损失熔断', lastUpdated: '2026-09-10 14:00:00', lastOperator: '财务总监-钱立', version: 'v1.8' },
  ]);

  // 2. 规则变更全量审计履历 (旧值 → 新值 → 修改人 → 原因 → 生效时间)
  const [auditLogs, setAuditLogs] = useState<RuleAuditLog[]>([
    { id: 'RAUD-20261005-01', ruleId: 'RL-CHK-01', ruleName: '查询源轮询与主备策略', category: 'card_check', oldValue: '主节点A单点', newValue: '主节点A直连 + 故障自动切换备节点B', operator: '风控总监-赵鹏', reason: '提升Steam和Apple高峰期官方查验成功率与容灾', effectiveTime: '2026-10-05 08:20:00', approvalTicket: 'APPR-RULE-8891' },
    { id: 'RAUD-20261004-02', ruleId: 'RL-SLA-03', ruleName: '商户接单响应时限', category: 'sla', oldValue: '90 秒', newValue: '60 秒', operator: '商户运营-张宇', reason: '缩短用户出卡等待时长，加速整体撮合履约周转', effectiveTime: '2026-10-04 11:20:00', approvalTicket: 'APPR-RULE-8884' },
    { id: 'RAUD-20261004-03', ruleId: 'RL-QUOTE-01', ruleName: '价差告警阈值', category: 'quote', oldValue: '8.0 %', newValue: '5.0 %', operator: '策略运营-张宇', reason: '加密货币波动加剧，收紧外盘行情偏离监控力度', effectiveTime: '2026-10-04 18:30:00', approvalTicket: 'APPR-RULE-8879' },
    { id: 'RAUD-20261003-04', ruleId: 'RL-RISK-04', ruleName: '出卡方历史风险加权', category: 'risk', oldValue: '历史争议率>5%', newValue: '历史争议率>2% 强制转人工预检', operator: '风控策略组', reason: '近期黑产恶意倒卖卡增多，收紧出卡方初筛门槛', effectiveTime: '2026-10-03 14:00:00', approvalTicket: 'APPR-RULE-8862' },
  ]);

  // 3. 编辑模态窗
  const [editingRule, setEditingRule] = useState<RuleItem | null>(null);
  const [newValInput, setNewValInput] = useState('');
  const [editReason, setEditReason] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleOpenEdit = (rule: RuleItem) => {
    setEditingRule(rule);
    setNewValInput(String(rule.currentValue));
    setEditReason('');
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    const oldValDisplay = `${editingRule.currentValue} ${editingRule.unit}`;
    const newValDisplay = `${newValInput} ${editingRule.unit}`;
    const nowTime = new Date().toISOString().replace('T', ' ').slice(0, 19);

    // Update rule
    setRules(prev => prev.map(r => {
      if (r.id === editingRule.id) {
        return {
          ...r,
          currentValue: newValInput,
          lastUpdated: nowTime,
          lastOperator: '当前策略管理员',
          version: `v${(parseFloat(r.version.replace('v', '')) + 0.1).toFixed(1)}`,
        };
      }
      return r;
    }));

    // Record audit entry
    const newAuditLog: RuleAuditLog = {
      id: `RAUD-${Date.now()}`,
      ruleId: editingRule.id,
      ruleName: editingRule.name,
      category: editingRule.category,
      oldValue: oldValDisplay,
      newValue: newValDisplay,
      operator: '当前策略管理员',
      reason: editReason || '业务指标例行调优',
      effectiveTime: nowTime,
      approvalTicket: `APPR-RULE-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    setAuditLogs(prev => [newAuditLog, ...prev]);

    setEditingRule(null);
    showToast(`规则 [${editingRule.name}] 修改已生效并生成全流程审计记录！`);
  };

  const currentCategoryRules = rules.filter(r => r.category === activeCategory);

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl text-xs flex items-center space-x-2 border border-slate-700 animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-sm">verified</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5">
              <span className="inline-flex items-center justify-center p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
                <span className="material-symbols-outlined text-xl">rule</span>
              </span>
              <span className="text-xs font-mono tracking-wider text-indigo-300 font-bold uppercase">
                Unified Business Rules Governance (六十三条规范)
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">规则配置中心</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              统一管理 5 大核心业务规则：<strong className="text-amber-300">报价规则 ｜ Card Check规则 ｜ 风控规则 ｜ SLA规则 ｜ 损失规则</strong>。每次规则修改严谨记录：<strong className="text-emerald-300">旧值 → 新值 → 修改人 → 原因 → 生效时间</strong>。
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-xs space-y-1 text-right">
            <div className="text-slate-400 font-medium">策略热加载状态</div>
            <div className="text-emerald-400 font-bold flex items-center justify-end space-x-1">
              <span className="material-symbols-outlined text-sm">bolt</span>
              <span>毫秒级配置中心热推送已就绪</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Main Rule Categories - Standard Image Tab Bar Style */}
      <section className="bg-white rounded-xl border border-slate-200/90 shadow-2xs px-2 pt-2 flex items-center justify-between gap-1 overflow-x-auto text-xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'quote', label: '报价规则', icon: 'trending_up', badge: '价差/波动/熔断' },
            { id: 'card_check', label: 'Card Check 规则', icon: 'verified_user', badge: '查验源/超时/策略' },
            { id: 'risk', label: '风控规则', icon: 'security', badge: '重复/余额/状态/加权' },
            { id: 'sla', label: 'SLA 规则', icon: 'timer', badge: '客服/商户/时限' },
            { id: 'loss', label: '损失规则', icon: 'payments', badge: '阈值/审批级别' }
          ].map(tab => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as RuleCategory)}
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

      {/* Rules Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="font-bold text-xs text-slate-800">
            {activeCategory === 'quote' ? '报价监控与自动调价策略' :
             activeCategory === 'card_check' ? 'Card Check 官方接口与查验策略' :
             activeCategory === 'risk' ? '交易预检与反欺诈风控规则' :
             activeCategory === 'sla' ? '全链路履约与客服SLA响应时限' : '转单损失与客诉赔付审批矩阵'}
          </div>
          <div className="text-xs text-slate-500">
            共 <strong className="text-blue-600 font-mono">{currentCategoryRules.length}</strong> 条核心策略
          </div>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-white border-b border-slate-200 text-slate-500 font-semibold uppercase">
            <tr>
              <th className="px-4 py-3">规则ID / Key</th>
              <th className="px-4 py-3">规则名称</th>
              <th className="px-4 py-3">当前生效值</th>
              <th className="px-4 py-3">规则描述与业务影响</th>
              <th className="px-4 py-3">作用范围</th>
              <th className="px-4 py-3">最近变更</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentCategoryRules.map((rule) => (
              <tr key={rule.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3 font-mono">
                  <div className="font-bold text-slate-900">{rule.id}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{rule.key}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-bold text-slate-900">{rule.name}</div>
                  <span className="inline-block px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-mono mt-1">
                    {rule.version}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 font-mono font-bold text-blue-900 text-xs">
                    {rule.currentValue} {rule.unit}
                  </div>
                </td>
                <td className="px-4 py-3 max-w-sm text-slate-600 leading-relaxed">
                  {rule.description}
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-200">
                    {rule.impactScope}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                  <div>{rule.lastUpdated}</div>
                  <div className="text-slate-700 font-sans mt-0.5">{rule.lastOperator}</div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleOpenEdit(rule)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-xs transition-colors cursor-pointer"
                  >
                    调整策略
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 规则修改全景审计履历 (六十三条核心要求: 旧值 → 新值 → 修改人 → 原因 → 生效时间) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="material-symbols-outlined text-amber-400 text-lg">history_edu</span>
            <div>
              <div className="text-xs font-bold text-white">规则修改全景审计履历 (旧值 → 新值 → 修改人 → 原因 → 生效时间)</div>
              <div className="text-[11px] text-slate-400 mt-0.5">所有规则参数变更强制记录完整的决策审批单与时间链</div>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-white/10 rounded-lg text-slate-300 font-mono text-xs">
            不可篡改审计账本 (Active)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">审计单号 / 审批单</th>
                <th className="px-4 py-3">修改规则项</th>
                <th className="px-4 py-3">旧值 (Before)</th>
                <th className="px-4 py-3">新值 (After)</th>
                <th className="px-4 py-3">修改人</th>
                <th className="px-4 py-3">变更原因与决策依据</th>
                <th className="px-4 py-3 text-right">生效时间戳</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-mono">
                    <div className="font-bold text-slate-900">{log.id}</div>
                    <div className="text-[10px] text-blue-600 font-semibold mt-0.5">{log.approvalTicket}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-800">{log.ruleName}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">{log.ruleId}</div>
                  </td>
                  <td className="px-4 py-3 font-mono">
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 line-through border border-rose-200">
                      {log.oldValue}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      {log.newValue}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {log.operator}
                  </td>
                  <td className="px-4 py-3 max-w-xs text-slate-600">
                    {log.reason}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-500 text-right">
                    {log.effectiveTime}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Rule Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-amber-400">tune</span>
                <h3 className="font-bold text-sm">调整业务规则: {editingRule.name}</h3>
              </div>
              <button onClick={() => setEditingRule(null)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="text-slate-500">规则编码: <span className="font-mono font-bold text-slate-800">{editingRule.key}</span></div>
                <div className="text-slate-500">当前旧值: <span className="font-mono font-bold text-rose-600">{editingRule.currentValue} {editingRule.unit}</span></div>
                <div className="text-slate-500">规则说明: <span className="text-slate-700">{editingRule.description}</span></div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  输入新阈值/策略参数 ({editingRule.unit})
                </label>
                <input
                  type="text"
                  required
                  value={newValInput}
                  onChange={(e) => setNewValInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  变更原因与业务依据 <span className="text-slate-400 font-normal">(强制记录到审计履历)</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="例如：为应对加密货币行情大幅波动，收紧外盘价差告警阈值至5%..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer transition-colors"
                >
                  确认变更并生效
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
