import React, { useState, useMemo } from 'react';
import { QuoteAnomalyTicket, AnomalyRuleConfig, AnomalyWorkflowStatus } from './quoteTypes';
import { INITIAL_ANOMALIES, DEFAULT_ANOMALY_RULES } from './mockQuoteData';

interface QuoteAnomaliesTabProps {
  showToast: (msg: string) => void;
  onNavigateToAdjustLogs?: () => void;
  initialStatusFilter?: string;
}

export const QuoteAnomaliesTab: React.FC<QuoteAnomaliesTabProps> = ({ showToast, onNavigateToAdjustLogs, initialStatusFilter }) => {
  // 异常工单列表
  const [anomalies, setAnomalies] = useState<QuoteAnomalyTicket[]>(INITIAL_ANOMALIES);

  // 规则参数配置
  const [rules, setRules] = useState<AnomalyRuleConfig>(DEFAULT_ANOMALY_RULES);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);

  // 筛选器
  const [severityFilter, setSeverityFilter] = useState<'ALL' | '平台级异常' | '商户级异常'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter || 'ALL');
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string>(INITIAL_ANOMALIES[0].id);

  // 当前选中的异常工单详情
  const selectedAnomaly = useMemo(() => {
    return anomalies.find(a => a.id === selectedAnomalyId) || anomalies[0];
  }, [anomalies, selectedAnomalyId]);

  // 筛选后的异常列表 (按平台级异常优先排序，平台级优先级更高)
  const filteredAnomalies = useMemo(() => {
    return anomalies
      .filter(item => {
        if (severityFilter !== 'ALL' && item.severity !== severityFilter) return false;
        if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
        return true;
      })
      .sort((a, b) => {
        // 平台级异常优先级绝对置顶
        if (a.severity === '平台级异常' && b.severity !== '平台级异常') return -1;
        if (a.severity !== '平台级异常' && b.severity === '平台级异常') return 1;
        return 0;
      });
  }, [anomalies, severityFilter, statusFilter]);

  // 24.1 异常闭环流转动作: 状态由一个节点流向下一个节点
  // 待处理 → 已提醒 → 待调整 → 已调整 → 待复核 → 已恢复 (自动关闭)
  const handleAdvanceStatus = (targetId: string, nextStatus: AnomalyWorkflowStatus, actionDesc: string) => {
    const nowTime = new Date().toTimeString().split(' ')[0];
    setAnomalies(prev =>
      prev.map(item => {
        if (item.id !== targetId) return item;

        const isClosing = nextStatus === '已恢复';
        const newLog = {
          time: nowTime,
          operator: '当前操作员 / 机器人比价核验引擎',
          action: nextStatus,
          remark: actionDesc
        };

        return {
          ...item,
          status: nextStatus,
          updatedAt: nowTime,
          closedAt: isClosing ? nowTime : item.closedAt,
          auditLogs: [newLog, ...item.auditLogs]
        };
      })
    );
    showToast(`工单【${targetId}】流程已推进至【${nextStatus}】：${actionDesc}`);
  };

  // 一键圈出问题商户并批量联系催价
  const handleRemindMerchants = (anomaly: QuoteAnomalyTicket) => {
    const merchantNames = anomaly.problematicMerchants.map(m => m.merchantName).join('、');
    handleAdvanceStatus(
      anomaly.id,
      '已提醒',
      `系统已圈出 ${anomaly.problematicMerchants.length} 家倒挂商户（${merchantNames}），已向其收卡作业端推送报价偏低预警并下发催调通知`
    );
  };

  // 模拟商户在收卡业务端完成调价
  const handleMerchantAdjusted = (anomaly: QuoteAnomalyTicket) => {
    handleAdvanceStatus(
      anomaly.id,
      '已调整',
      '商户已在收卡业务端提交提价更新（加价0.8pp~1.2pp），等待机器人重新比价核销'
    );
  };

  // 机器人重新比价并闭环恢复
  const handleRobotRecheckAndClose = (anomaly: QuoteAnomalyTicket) => {
    handleAdvanceStatus(anomaly.id, '待复核', '机器人启动重新全网探针比价核验...');
    setTimeout(() => {
      handleAdvanceStatus(
        anomaly.id,
        '已恢复',
        '机器人最新比价结果：商户报价已全部达到运营标准（价差回升至 +0.2pp 达标区间），异常已恢复，系统自动关闭工单！'
      );
    }, 900);
  };

  // 触发全局机器人重新比价巡检
  const [isScanning, setIsScanning] = useState(false);
  const handleTriggerGlobalRobotScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      showToast('🤖 机器人全网重新比价完成：检出 2 个平台级异常已达标待复核，1 个商户级异常已自动关闭！');
    }, 1000);
  };

  return (
    <div className="flex flex-col space-y-4 text-xs text-slate-800 antialiased">
      {/* 顶部标题与异常架构说明卡 */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0">
            <span className="material-symbols-outlined text-[22px]">warning</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-slate-900 text-sm">报价异常 与 24.1 异常闭环全生命周期流程</h2>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-mono text-[10px] font-bold">
                平台级优先级高于商户级
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono text-[10px] font-bold">
                6 步闭环流转
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              两类问题明确区分：<span className="font-bold text-rose-700">【平台级异常】</span>（多个商户同时无优势，存在平台整体丢单风险，优先级最高）与
              <span className="font-semibold text-amber-700">【商户级异常】</span>（个别商户价格偏弱）。
              闭环流转：<span className="font-mono font-semibold text-slate-700">待处理 → 已提醒 → 待调整 → 已调整 → 待复核 → 已恢复 (自动关闭)</span>。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsRuleModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium border border-slate-200 transition-colors shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-slate-500">tune</span>
            <span>配置 5 大规则参数</span>
          </button>
          <button
            onClick={handleTriggerGlobalRobotScan}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[15px] ${isScanning ? 'animate-spin' : ''}`}>
              smart_toy
            </span>
            <span>{isScanning ? '机器人比价中...' : '机器人重新比价'}</span>
          </button>
        </div>
      </div>

      {/* 5 大规则参数与状态机全景概览横栏 */}
      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/10 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-400 text-[18px]">rule</span>
            <span className="font-bold text-sm text-white">当前生效的 5 大规则判定参数:</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            行情更新 ➔ 机器人比价 ➔ 发现异常 ➔ 圈出商户 ➔ 客服联系 ➔ 收卡端调价 ➔ 机器人比价 ➔ 恢复自动关闭
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs font-mono">
          <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
            <span className="text-slate-400 text-[10px] block">1. 价差阈值</span>
            <span className="font-bold text-sm text-amber-300 block mt-0.5">&gt; {rules.diffThresholdPp} pp</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">商户低于底线超此值</span>
          </div>
          <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
            <span className="text-slate-400 text-[10px] block">2. 异常商户数</span>
            <span className="font-bold text-sm text-white block mt-0.5">&ge; {rules.minAnomalyMerchants} 家</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">同时偏弱商户门槛</span>
          </div>
          <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
            <span className="text-slate-400 text-[10px] block">3. 异常比例</span>
            <span className="font-bold text-sm text-rose-300 block mt-0.5">&gt; {rules.anomalyRatioThreshold}%</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">触发平台级最高优先级</span>
          </div>
          <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
            <span className="text-slate-400 text-[10px] block">4. 持续时间</span>
            <span className="font-bold text-sm text-indigo-300 block mt-0.5">&gt; {rules.durationThresholdMinutes} 分钟</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">未自愈启动强力催办</span>
          </div>
          <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
            <span className="text-slate-400 text-[10px] block">5. 行情有效期</span>
            <span className="font-bold text-sm text-emerald-300 block mt-0.5">{rules.marketValiditySeconds} 秒</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">过期行情不参与比价</span>
          </div>
        </div>
      </div>

      {/* 筛选过滤与双栏布局 (左栏: 异常工单池，右栏: 闭环详情与三方圈出操作) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* 左栏 7/12: 异常工单大盘 */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 font-medium">级别筛选:</span>
              <button
                onClick={() => setSeverityFilter('ALL')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                  severityFilter === 'ALL'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                全部异常 ({anomalies.length})
              </button>
              <button
                onClick={() => setSeverityFilter('平台级异常')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold cursor-pointer transition-all flex items-center gap-1 ${
                  severityFilter === '平台级异常'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                <span>🔴 平台级异常 (高优)</span>
                <span className="font-mono text-[10px] px-1 bg-white/20 rounded">
                  {anomalies.filter(a => a.severity === '平台级异常').length}
                </span>
              </button>
              <button
                onClick={() => setSeverityFilter('商户级异常')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                  severityFilter === '商户级异常'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <span>🟠 商户级异常</span>
                <span className="font-mono text-[10px] px-1 bg-white/20 rounded">
                  {anomalies.filter(a => a.severity === '商户级异常').length}
                </span>
              </button>
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
            >
              <option value="ALL">全部流转状态</option>
              <option value="待处理">待处理</option>
              <option value="已提醒">已提醒</option>
              <option value="待调整">待调整</option>
              <option value="已调整">已调整</option>
              <option value="待复核">待复核</option>
              <option value="已恢复">已恢复 (已关闭)</option>
            </select>
          </div>

          {/* 工单卡片列表 */}
          <div className="space-y-2.5">
            {filteredAnomalies.map(item => {
              const isSelected = item.id === selectedAnomaly.id;
              const isPlatformLevel = item.severity === '平台级异常';

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedAnomalyId(item.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
                    isSelected
                      ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-500/20'
                      : isPlatformLevel
                      ? 'bg-white border-rose-200/80 hover:border-rose-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                            isPlatformLevel
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                          }`}
                        >
                          {item.severity}
                        </span>
                        <span className="font-mono text-slate-500 font-bold">{item.id}</span>
                        <span className="font-mono text-slate-900 font-bold text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {item.standardSku.formattedSKU}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-slate-500 text-[11px] pt-1">
                        <span>
                          市场参考: <strong className="text-slate-800 font-mono">{item.marketReferencePrice}%</strong>
                        </span>
                        <span>
                          运营标准: <strong className="text-blue-700 font-mono">{item.operatingStandard}%</strong>
                        </span>
                        <span>
                          已持续: <strong className="text-rose-600 font-mono">{item.durationMinutes}m</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                          item.status === '已恢复'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : item.status === '待复核'
                            ? 'bg-purple-50 text-purple-700 border-purple-300 animate-pulse'
                            : item.status === '已调整'
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : item.status === '待调整'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : item.status === '已提醒'
                            ? 'bg-cyan-50 text-cyan-800 border-cyan-300'
                            : 'bg-rose-50 text-rose-700 border-rose-300'
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.updatedAt}</span>
                    </div>
                  </div>

                  {/* 圈出问题商户提示 */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className="material-symbols-outlined text-[15px] text-rose-600">group_off</span>
                      <span>
                        圈出问题商户: <strong className="text-slate-900">{item.problematicMerchants.length}</strong> 家 (占比{' '}
                        <strong className="text-rose-600">{item.anomalyRatio}%</strong>)
                      </span>
                    </div>
                    <span className="text-blue-600 font-medium hover:underline flex items-center gap-0.5">
                      <span>查看闭环作业</span>
                      <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右栏 5/12: 闭环作业台 & 圈出问题商户清单 */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">loop</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">24.1 异常闭环作业与调价催促</h3>
                  <span className="text-[11px] text-slate-500 font-mono">{selectedAnomaly.id}</span>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                  selectedAnomaly.severity === '平台级异常'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}
              >
                {selectedAnomaly.severity}
              </span>
            </div>

            {/* 6 步状态机进度条 */}
            <div className="space-y-1.5">
              <span className="text-slate-500 text-[11px] font-semibold block">闭环处理生命周期阶段:</span>
              <div className="grid grid-cols-6 gap-1 text-center font-mono text-[10px]">
                {(['待处理', '已提醒', '待调整', '已调整', '待复核', '已恢复'] as AnomalyWorkflowStatus[]).map((st, idx) => {
                  const stateIndexMap: Record<AnomalyWorkflowStatus, number> = {
                    待处理: 0,
                    已提醒: 1,
                    待调整: 2,
                    已调整: 3,
                    待复核: 4,
                    已恢复: 5
                  };
                  const currentIdx = stateIndexMap[selectedAnomaly.status];
                  const isPassed = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div
                      key={st}
                      className={`p-1 rounded font-bold transition-all ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-xs'
                          : isPassed
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <div>{idx + 1}</div>
                      <div className="truncate">{st}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 圈出问题商户卡片区 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-rose-600">highlight</span>
                  系统已自动圈出问题商户 ({selectedAnomaly.problematicMerchants.length} 家):
                </span>
                <span className="text-[10px] text-slate-400">已关联收卡作业通道</span>
              </div>

              <div className="space-y-2">
                {selectedAnomaly.problematicMerchants.map(m => (
                  <div key={m.merchantId} className="bg-rose-50/50 p-2.5 rounded-lg border border-rose-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                        <strong className="text-slate-900">{m.merchantName}</strong>
                        <span className="font-mono text-slate-400 text-[10px]">({m.merchantId})</span>
                      </div>
                      <span className="font-mono text-rose-600 font-bold">{m.diffPp} pp 偏弱</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1">
                      <span>当前报价: <strong className="text-slate-900 font-mono">{m.currentQuote}%</strong></span>
                      <span>质押积点: <strong className="text-slate-900 font-mono">{(m.points / 10000).toFixed(1)}万</strong></span>
                      {m.adjustedQuote && (
                        <span className="text-emerald-700 font-semibold font-mono">
                          已提价至: {m.adjustedQuote}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 快捷操作动作按钮 */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-slate-500 text-[11px] font-semibold block">闭环推进快捷动作:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => handleRemindMerchants(selectedAnomaly)}
                  disabled={selectedAnomaly.status === '已恢复'}
                  className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[15px]">send</span>
                  <span>下发企微/短信催调通知</span>
                </button>

                <button
                  onClick={() => handleMerchantAdjusted(selectedAnomaly)}
                  disabled={selectedAnomaly.status === '已恢复'}
                  className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[15px]">tune</span>
                  <span>模拟商户收卡端调价</span>
                </button>
              </div>

              <button
                onClick={() => handleRobotRecheckAndClose(selectedAnomaly)}
                disabled={selectedAnomaly.status === '已恢复'}
                className="w-full px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[15px]">verified</span>
                <span>机器人重新比价 ➔ 达标自动闭环恢复</span>
              </button>
            </div>

            {/* 审计日志 */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <span className="font-semibold text-slate-700 text-[11px] block">异常处置轨迹 (审计日志):</span>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {selectedAnomaly.auditLogs.map((log, idx) => (
                  <div key={idx} className="bg-slate-50 p-2 rounded border border-slate-200/80 text-[11px] space-y-0.5">
                    <div className="flex items-center justify-between text-slate-500 font-mono">
                      <span className="font-bold text-slate-800">{log.action}</span>
                      <span>{log.time}</span>
                    </div>
                    <p className="text-slate-600">{log.remark}</p>
                    <span className="text-[10px] text-slate-400 block">操作人: {log.operator}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5 大规则参数配置弹窗 */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-[20px]">tune</span>
                <h3 className="font-bold text-slate-900 text-sm">配置报价异常判定 5 大规则参数</h3>
              </div>
              <button
                onClick={() => setIsRuleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">1. 价差阈值 (pp)</label>
                <input
                  type="number"
                  step="0.1"
                  value={rules.diffThresholdPp}
                  onChange={e => setRules({ ...rules, diffThresholdPp: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900"
                />
                <span className="text-[10px] text-slate-400">商户报价低于平台运营标准超过此阈值，标记为异常商户。</span>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">2. 异常商户数 (家)</label>
                <input
                  type="number"
                  value={rules.minAnomalyMerchants}
                  onChange={e => setRules({ ...rules, minAnomalyMerchants: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900"
                />
                <span className="text-[10px] text-slate-400">达到或超过此商户数量触发聚合异常告警。</span>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">3. 异常比例 (%) ➔ 触发平台级异常</label>
                <input
                  type="number"
                  value={rules.anomalyRatioThreshold}
                  onChange={e => setRules({ ...rules, anomalyRatioThreshold: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900"
                />
                <span className="text-[10px] text-slate-400">倒挂商户占比超过此比例，自动提升为【平台级异常 (P0)】。</span>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">4. 持续时间 (分钟)</label>
                <input
                  type="number"
                  value={rules.durationThresholdMinutes}
                  onChange={e => setRules({ ...rules, durationThresholdMinutes: parseInt(e.target.value) || 5 })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">5. 行情有效期 (秒)</label>
                <input
                  type="number"
                  value={rules.marketValiditySeconds}
                  onChange={e => setRules({ ...rules, marketValiditySeconds: parseInt(e.target.value) || 60 })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsRuleModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium text-xs cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setIsRuleModalOpen(false);
                  showToast('✅ 报价异常 5 大规则判定参数已成功保存并立即应用于实时巡检机器人！');
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs cursor-pointer"
              >
                保存规则生效
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
