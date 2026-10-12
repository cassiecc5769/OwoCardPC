import React from 'react';
import { NavPath } from '../../../types';
import { TimeRangeKey } from './types';

interface BusinessResultsTabProps {
  timeRange: TimeRangeKey;
  onNavigate?: (path: NavPath) => void;
  onDrilldownToTrends?: (metric: string) => void;
}

export const BusinessResultsTab: React.FC<BusinessResultsTabProps> = ({
  timeRange,
  onNavigate,
  onDrilldownToTrends
}) => {
  // 根据时间范围动态生成数据
  const multiplier = timeRange === 'month' ? 30 : timeRange === '7d' ? 7 : timeRange === 'yesterday' ? 0.95 : 1;

  // 12 大核心指标 (.2 A)
  const coreMetrics = [
    // 规模
    {
      id: 'gmv',
      name: 'GMV (成功交易总金额)',
      category: '经营规模',
      val: `$${(1428500 * multiplier).toLocaleString()}`,
      rawVal: 1428500 * multiplier,
      mom: '+12.6%',
      momType: 'up',
      yoy: '+18.4%',
      targetCompletion: '95.2%',
      targetVal: `$${(1500000 * multiplier).toLocaleString()}`,
      desc: '成功交易出卡总流水金额',
      color: 'blue'
    },
    {
      id: 'orders',
      name: '成交订单数',
      category: '交易规模',
      val: `${Math.round(12560 * multiplier).toLocaleString()} 单`,
      rawVal: 12560 * multiplier,
      mom: '+9.4%',
      momType: 'up',
      yoy: '+15.2%',
      targetCompletion: '104.6%',
      targetVal: `${Math.round(12000 * multiplier).toLocaleString()} 单`,
      desc: '平台撮合完成的最终有效订单数',
      color: 'blue'
    },
    {
      id: 'users',
      name: '成交用户数',
      category: '用户规模',
      val: `${Math.round(4210 * (multiplier > 1 ? multiplier * 0.6 : 1)).toLocaleString()} 人`,
      rawVal: 4210,
      mom: '+8.2%',
      momType: 'up',
      yoy: '+12.1%',
      targetCompletion: '98.0%',
      targetVal: `${Math.round(4300 * (multiplier > 1 ? multiplier * 0.6 : 1)).toLocaleString()} 人`,
      desc: '周期内成功完成交易的去重出卡用户',
      color: 'blue'
    },

    // 价值与效率
    {
      id: 'aov',
      name: '客单价 (AOV)',
      category: '用户价值',
      val: '$113.73',
      mom: '+4.1%',
      momType: 'up',
      yoy: '+5.6%',
      targetCompletion: '103.4%',
      targetVal: '$110.00',
      desc: 'GMV ÷ 成交用户数',
      color: 'emerald'
    },
    {
      id: 'success_rate',
      name: '成交率 (交易效率)',
      category: '交易效率',
      val: '98.6%',
      mom: '+0.4%',
      momType: 'up',
      yoy: '+1.2%',
      targetCompletion: '100.6%',
      targetVal: '98.0%',
      desc: '成功订单 ÷ 有效提交订单',
      color: 'emerald'
    },

    // 增长与转化
    {
      id: 'new_users',
      name: '新增注册用户',
      category: '拉新结果',
      val: `${Math.round(342 * (multiplier > 1 ? multiplier * 0.7 : 1)).toLocaleString()} 人`,
      mom: '+15.2%',
      momType: 'up',
      yoy: '+24.5%',
      targetCompletion: '114.0%',
      targetVal: '300 人',
      desc: '周期内新完成注册激活的用户数',
      color: 'purple'
    },
    {
      id: 'first_order_users',
      name: '首单用户数',
      category: '拉新质量',
      val: `${Math.round(248 * (multiplier > 1 ? multiplier * 0.7 : 1)).toLocaleString()} 人`,
      mom: '+12.8%',
      momType: 'up',
      yoy: '+19.3%',
      targetCompletion: '107.8%',
      targetVal: '230 人',
      desc: '周期内首次完成交易的出卡用户',
      color: 'purple'
    },
    {
      id: 'first_order_conv',
      name: '首单转化率',
      category: '新客转化',
      val: '72.5%',
      mom: '+2.4%',
      momType: 'up',
      yoy: '+4.1%',
      targetCompletion: '103.5%',
      targetVal: '70.0%',
      desc: '首单用户 ÷ 新注册用户',
      color: 'purple'
    },
    {
      id: 'repurchase_rate',
      name: '复购率 (30天留存)',
      category: '留存粘性',
      val: '68.4%',
      mom: '+1.8%',
      momType: 'up',
      yoy: '+3.5%',
      targetCompletion: '105.2%',
      targetVal: '65.0%',
      desc: '复购用户 ÷ 可复购用户',
      color: 'purple'
    },

    // 供给与收益
    {
      id: 'merchants',
      name: '活跃商户数 (有效供给)',
      category: '供给充裕度',
      val: '88 家',
      mom: '+3.5%',
      momType: 'up',
      yoy: '+14.3%',
      targetCompletion: '103.5%',
      targetVal: '85 家',
      desc: '周期内实际承接撮合转单的商户',
      color: 'amber'
    },
    {
      id: 'net_profit',
      name: '平台毛利 (净收益)',
      category: '收益规模',
      val: `$${(58420 * multiplier).toLocaleString()}`,
      mom: '+14.2%',
      momType: 'up',
      yoy: '+22.0%',
      targetCompletion: '102.5%',
      targetVal: `$${(57000 * multiplier).toLocaleString()}`,
      desc: '平台撮合收入 - 支付通道费与商户返佣',
      color: 'amber'
    },
    {
      id: 'margin_rate',
      name: '毛利率 (盈利质量)',
      category: '盈利质量',
      val: '4.09%',
      mom: '+0.06%',
      momType: 'up',
      yoy: '+0.15%',
      targetCompletion: '102.2%',
      targetVal: '4.00%',
      desc: '平台毛利 ÷ 平台 GMV',
      color: 'amber'
    }
  ];

  // 6 大业务健康度模块 (.2 B)
  const healthDimensions = [
    {
      id: 'trade',
      title: '交易健康度',
      status: 'HEALTHY',
      statusLabel: '正常运行',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: 'sync_alt',
      metrics: [
        { label: '成交率', val: '98.6%', isGood: true, ref: '目标 ≥98%' },
        { label: '失败率', val: '1.4%', isGood: true, ref: '红线 ≤2.5%' },
        { label: '平均处理时长', val: '38.4s', isGood: true, ref: 'SLA ≤45s' }
      ],
      quickDiagnosis: '交易撮合与履约流转平稳，无系统性卡单或积压。',
      targetPath: 'transaction-analytics' as NavPath
    },
    {
      id: 'quote',
      title: '报价竞争力',
      status: 'HEALTHY',
      statusLabel: '竞争力充足',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: 'price_change',
      metrics: [
        { label: '有竞争力SKU占比', val: '94.2%', isGood: true, ref: '目标 ≥90%' },
        { label: '异常SKU数', val: '3 个', isGood: true, ref: '关注 ≤5个' },
        { label: '大盘溢价指数', val: '+0.8%', isGood: true, ref: '优于竞品' }
      ],
      quickDiagnosis: '主流卡种（Apple/Steam/Target）处于优势收卡汇率。',
      targetPath: 'rule-quote' as NavPath
    },
    {
      id: 'merchant',
      title: '商户履约供给',
      status: 'EXCELLENT',
      statusLabel: '供给充沛',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: 'store',
      metrics: [
        { label: '商户接单率', val: '96.8%', isGood: true, ref: '目标 ≥95%' },
        { label: '履约成功率', val: '99.2%', isGood: true, ref: '目标 ≥98%' },
        { label: '核心SKU覆盖率', val: '100%', isGood: true, ref: '100% 兜底' }
      ],
      quickDiagnosis: '88家商户在线，可用承载额度 $3.26M，供给无瓶颈。',
      targetPath: 'merchant-analytics' as NavPath
    },
    {
      id: 'risk',
      title: '风控拦截质量',
      status: 'HEALTHY',
      statusLabel: '低风险受控',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: 'security',
      metrics: [
        { label: '人工 REVIEW 率', val: '2.1%', isGood: true, ref: '常态 ≤3.0%' },
        { label: '阻断 BLOCK 率', val: '0.8%', isGood: true, ref: '硬拦截 ≤1.5%' },
        { label: '风险挽损金额', val: '$1,250', isGood: true, ref: '已拦截挽损' }
      ],
      quickDiagnosis: '预检引擎正常拦截零余额与重复卡，误报率极低 (0.02%)。',
      targetPath: 'risk-overview' as NavPath
    },
    {
      id: 'aftersale',
      title: '售后争议治理',
      status: 'EXCELLENT',
      statusLabel: '争议极低',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: 'support_agent',
      metrics: [
        { label: '售后工单率', val: '0.42%', isGood: true, ref: '健康 ≤0.8%' },
        { label: '争议败诉率', val: '0.15%', isGood: true, ref: '良性 ≤0.3%' },
        { label: '平台赔付金额', val: '$180.00', isGood: true, ref: '极低' }
      ],
      quickDiagnosis: '全流程凭证存证完整，扫卡争议责任判定明确。',
      targetPath: 'service-analytics' as NavPath
    },
    {
      id: 'finance',
      title: '财务结算对账',
      status: 'HEALTHY',
      statusLabel: '账务平齐',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: 'account_balance_wallet',
      metrics: [
        { label: '结算异常率', val: '0.00%', isGood: true, ref: '0% 目标' },
        { label: '对账差异金额', val: '$0.00', isGood: true, ref: '日清日结' },
        { label: '备付金充盈度', val: '100%', isGood: true, ref: '无垫资敞口' }
      ],
      quickDiagnosis: '双录清算系统实时稽核，无账务长款或短款。',
      targetPath: 'platform-settlement' as NavPath
    }
  ];

  return (
    <div className="space-y-5 text-xs text-slate-800 antialiased animate-in fade-in duration-200">
      {/* 1. 核心经营指标 (.2 A: 12大核心指标卡片矩阵) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
            <h3 className="font-bold text-slate-900 text-sm">
              A. 核心经营指标（规模 → 增长 → 转化 → 收益 → 供给）
            </h3>
          </div>
          <span className="text-slate-400 font-mono text-[11px]">
            当前值 + 环比 + 同比 + 目标完成率
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {coreMetrics.map(item => (
            <div
              key={item.id}
              onClick={() => onDrilldownToTrends && onDrilldownToTrends(item.id)}
              className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between space-y-2.5"
            >
              <div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">{item.name}</span>
                  <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-slate-100 text-slate-600 font-mono">
                    {item.category}
                  </span>
                </div>

                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-lg font-bold text-slate-900 font-mono group-hover:text-blue-600 transition-colors">
                    {item.val}
                  </span>
                </div>
              </div>

              {/* 环比与同比 */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-sans text-[10px]">环比:</span>
                  <span className="font-bold text-emerald-700 flex items-center">
                    <span className="material-symbols-outlined text-[12px]">arrow_upward</span>
                    {item.mom}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-sans text-[10px]">同比:</span>
                  <span className="font-bold text-blue-700">{item.yoy}</span>
                </div>
              </div>

              {/* 目标完成率进度条 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>目标: {item.targetVal}</span>
                  <span className="font-bold font-mono text-slate-700">完成 {item.targetCompletion}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, parseFloat(item.targetCompletion))}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. 业务健康区 (.2 B: 6大维度健康度快速诊断) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-emerald-600 rounded-full"></span>
            <h3 className="font-bold text-slate-900 text-sm">
              B. 经营健康度（回答：今天指标若有波动，平台哪个核心环节变红了？）
            </h3>
          </div>
          <span className="text-slate-400 font-mono text-[11px]">
            交易 · 报价 · 商户 · 风控 · 售后 · 财务
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {healthDimensions.map(dim => (
            <div
              key={dim.id}
              onClick={() => onNavigate && onNavigate(dim.targetPath)}
              className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer group space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-50 text-slate-700 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[18px]">{dim.icon}</span>
                  </div>
                  <span className="font-bold text-slate-900 text-xs">{dim.title}</span>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border font-mono ${dim.statusColor}`}>
                  {dim.statusLabel}
                </span>
              </div>

              {/* 3 项关键指标 */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 font-mono text-center">
                {dim.metrics.map((m, i) => (
                  <div key={i} className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-sans block truncate">{m.label}</span>
                    <strong className="text-xs text-slate-900 font-bold block">{m.val}</strong>
                    <span className="text-[9px] text-slate-500 font-sans block">{m.ref}</span>
                  </div>
                ))}
              </div>

              {/* 简要诊断与钻取 */}
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                <span className="text-slate-600 truncate max-w-[220px]">{dim.quickDiagnosis}</span>
                <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
                  钻取 →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
