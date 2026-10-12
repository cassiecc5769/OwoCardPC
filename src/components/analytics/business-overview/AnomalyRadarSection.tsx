import React, { useState } from 'react';
import { NavPath } from '../../../types';
import { AnomalyItem } from './types';
import { AnomalyResolutionModal } from './AnomalyResolutionModal';

interface AnomalyRadarSectionProps {
  onNavigate?: (path: NavPath) => void;
}

const INITIAL_ANOMALIES: AnomalyItem[] = [
  {
    id: 'WARN-202609-001',
    category: '成功率预警',
    title: '今日 Apple 英国区卡单成功率较 7 日均值异常下降 8.4% (现为 86.2%)',
    description:
      '影响订单 182 笔，多集中于 UK 零售收据卡，怀疑上游通道对英国 IP 风控策略收紧或兑付通道限流。',
    deltaMetric: '波动 -8.4%',
    targetPath: 'transaction-analytics',
    targetActionText: '下钻至交易分析',
    targetModuleText: '交易分析',
    severity: 'high',
    timestamp: '15:20:14',
    impactValue: '182 笔卡单 / $24,800 GMV',
    recommendedAction: '临时调优英国区海外中继代理出口IP，并对英国零售收据卡开启OCR预验规则。',
  },
  {
    id: 'WARN-202609-002',
    category: '供给缺口',
    title: 'Steam 美区当前承揽能力出现即时缺口 $120,000.00，流单率攀升 12.0%',
    description:
      '大商「北美极光兑换」临时保证金耗尽暂停接单，导致排队卡池积压，需紧急调配自营兜底池或调高大商授信。',
    deltaMetric: '缺口 $120k',
    targetPath: 'merchant-analytics',
    targetActionText: '下钻至商户分析',
    targetModuleText: '商户分析',
    severity: 'medium',
    timestamp: '15:10:02',
    impactValue: '$120,000.00 承揽缺口',
    recommendedAction: '自动向自营流动性池划拨 $150,000 应急额度，并向大商推送保证金充值授信通知。',
  },
  {
    id: 'WARN-202609-003',
    category: '时效超时',
    title: '认证商户「招财进宝科技」平均做卡时效上升 45 秒，引发 3 笔排队超时熔断',
    description:
      '商户人工打码员响应缓慢，触发行规 QoS 惩罚降权，其在路由队列权重已由 80 临时下调至 40。',
    deltaMetric: '延迟 +45s',
    targetPath: 'merchant-analytics',
    targetActionText: '下钻至商户履约',
    targetModuleText: '商户履约分析',
    severity: 'warning',
    timestamp: '14:52:19',
    impactValue: '3 笔超时订单 / 延迟 +45s',
    recommendedAction: '下调商户路由配额 50%，开启备用自动审核节点，直至其近30单平均时效恢复至 30s 以内。',
  },
  {
    id: 'WARN-202609-004',
    category: '成本波动',
    title: '今日争议赔付与买家申诉先行垫付金额异常激增 $1,250.00 (环比 +210%)',
    description:
      '发现一批 Google Play 面值 $100 充值卡存在二手“已兑换”欺诈嫌疑，已自动冻结 2 个关联代理商账户。',
    deltaMetric: '异常激增 +$1,250',
    targetPath: 'financial-analytics',
    targetActionText: '下钻至财务分析',
    targetModuleText: '财务分析',
    severity: 'high',
    timestamp: '14:38:40',
    impactValue: '$1,250.00 异常先行垫付',
    recommendedAction: '拦截涉事代理商名下待结款项，将该批次 Google Play 卡密批量提交官方后台比对兑换时间戳。',
  },
];

export const AnomalyRadarSection: React.FC<AnomalyRadarSectionProps> = ({ onNavigate }) => {
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>(INITIAL_ANOMALIES);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyItem | null>(null);
  const [allIgnored, setAllIgnored] = useState<boolean>(false);

  const activeCount = anomalies.filter((a) => !a.isResolved && !allIgnored).length;

  const handleToggleIgnoreAll = () => {
    setAllIgnored(!allIgnored);
  };

  const handleResolve = (id: string) => {
    setAnomalies((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isResolved: true } : item))
    );
  };

  return (
    <section className="bg-white p-5 rounded-xl shadow-xs border border-slate-200/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <span className="material-symbols-outlined text-[20px]">warning</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline-md text-base font-bold text-slate-900">
                智能经营异常雷达
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full font-code-token text-[11px] font-bold border ${
                  activeCount > 0
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {activeCount > 0 ? `${activeCount} 项偏离预警` : '全部处置完毕'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              系统基于过去 14 天平滑均线算法检测到以下业务偏离，建议调度员即刻下钻处置：
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleIgnoreAll}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-semibold transition-colors cursor-pointer self-end sm:self-center"
        >
          <span>{allIgnored ? '恢复显示全部预警' : '批量忽略非核心通知'}</span>
          <span className="material-symbols-outlined text-[16px]">done_all</span>
        </button>
      </div>

      {/* Anomaly Alert Feed Items */}
      <div className="space-y-3 mt-4">
        {allIgnored ? (
          <div className="p-6 bg-slate-50 rounded-xl text-center text-xs text-slate-500 border border-slate-200/60">
            <span className="material-symbols-outlined text-slate-400 text-[28px] mb-1 block">
              notifications_off
            </span>
            <span>已忽略当前非核心预警通知。新的高危异常产生时系统将重新拉起。</span>
          </div>
        ) : (
          anomalies.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                item.isResolved
                  ? 'bg-slate-50/70 border-slate-200 text-slate-500 opacity-80'
                  : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200/80'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`px-2 py-1 rounded text-[10.5px] font-label-caps uppercase whitespace-nowrap font-semibold border ${
                    item.isResolved
                      ? 'bg-slate-200 text-slate-600 border-slate-300'
                      : item.category === '成功率预警'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : item.category === '供给缺口'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : item.category === '时效超时'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {item.isResolved ? '已处置' : item.category}
                </span>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${
                        item.isResolved ? 'text-slate-600 line-through' : 'text-slate-900'
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[11.5px] text-slate-500 mt-1 leading-relaxed">
                    {item.description}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                <span
                  className={`font-code-token text-xs font-semibold ${
                    item.isResolved
                      ? 'text-slate-400'
                      : item.category === '成功率预警' || item.category === '成本波动'
                      ? 'text-rose-600'
                      : item.category === '供给缺口'
                      ? 'text-indigo-600'
                      : 'text-amber-600'
                  }`}
                >
                  {item.deltaMetric}
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedAnomaly(item)}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/80 rounded-lg text-xs font-medium shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px] text-blue-600">tune</span>
                  <span>排查处置</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate(item.targetPath)}
                  className="flex items-center gap-1 bg-white hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-200 hover:border-blue-600 px-3 py-1.5 rounded-lg text-xs font-medium shadow-2xs transition-colors cursor-pointer"
                >
                  <span>{item.targetActionText}</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail & Diagnostic modal */}
      <AnomalyResolutionModal
        anomaly={selectedAnomaly}
        isOpen={!!selectedAnomaly}
        onClose={() => setSelectedAnomaly(null)}
        onNavigate={onNavigate}
        onResolveAnomaly={handleResolve}
      />
    </section>
  );
};
