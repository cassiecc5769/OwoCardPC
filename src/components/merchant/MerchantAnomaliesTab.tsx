import React, { useState, useMemo } from 'react';

interface MerchantAnomaliesTabProps {
  showToast: (msg: string) => void;
}

export interface MerchantAnomalyRecord {
  id: string;
  mid: string;
  merchantName: string;
  orderId: string;
  anomalyType: '超时未接单' | '接单后超时未处理' | '主动拒单' | '验卡失败误判' | '积点不足熔断' | '涉诉争议挂起';
  skuDesc: string; // SKU (如 Apple US $100 E-Code)
  orderAmount: number;
  occurredAt: string;
  handlingDurationSec: number;
  failoverResult: string; // '已成功转单至 MID-1003' | '已成功转单至 MID-1001' | '人工客服介入强制核销' | '卡密原路退回出卡方' | '商户扣罚积点并赔付'
  penaltyPoints: number; // 扣除积点
  handler: string;
  status: '已结案' | '跟进中' | '待商户申诉';
}

const INITIAL_ANOMALIES: MerchantAnomalyRecord[] = [
  {
    id: 'M-ANOM-202610-01',
    mid: 'MID-1004',
    merchantName: '极速易换点卡商行',
    orderId: 'ORD-20261005-9921',
    anomalyType: '超时未接单',
    skuDesc: 'Steam / Global / USD / E-Code / $50',
    orderAmount: 50,
    occurredAt: '2026-10-05 14:12:08',
    handlingDurationSec: 185,
    failoverResult: '已成功转单至 MID-1003',
    penaltyPoints: 500,
    handler: '系统撮合调度器 (转单公海引擎)',
    status: '已结案'
  },
  {
    id: 'M-ANOM-202610-02',
    mid: 'MID-1005',
    merchantName: '拉美数字通',
    orderId: 'ORD-20261005-9934',
    anomalyType: '主动拒单',
    skuDesc: 'Razer Gold / Global / USD / Direct-PIN / $100',
    orderAmount: 100,
    occurredAt: '2026-10-05 13:45:22',
    handlingDurationSec: 45,
    failoverResult: '已成功转单至 MID-1001',
    penaltyPoints: 1000,
    handler: '智能异常转单策略组',
    status: '已结案'
  },
  {
    id: 'M-ANOM-202610-03',
    mid: 'MID-1002',
    merchantName: '鼎盛数字科技',
    orderId: 'ORD-20261005-9890',
    anomalyType: '接单后超时未处理',
    skuDesc: 'Apple / US / USD / Physical / $200',
    orderAmount: 200,
    occurredAt: '2026-10-05 11:20:15',
    handlingDurationSec: 320,
    failoverResult: '人工客服介入强制核销',
    penaltyPoints: 1500,
    handler: '客服风控值班席 (李倩)',
    status: '已结案'
  },
  {
    id: 'M-ANOM-202610-04',
    mid: 'MID-1005',
    merchantName: '拉美数字通',
    orderId: 'ORD-20261004-8812',
    anomalyType: '涉诉争议挂起',
    skuDesc: 'Google Play / US / USD / E-Code / $100',
    orderAmount: 100,
    occurredAt: '2026-10-04 18:30:00',
    handlingDurationSec: 1200,
    failoverResult: '商户扣罚积点并赔付',
    penaltyPoints: 3000,
    handler: '争议仲裁专员 (王工)',
    status: '待商户申诉'
  }
];

export const MerchantAnomaliesTab: React.FC<MerchantAnomaliesTabProps> = ({ showToast }) => {
  const [anomalies] = useState<MerchantAnomalyRecord[]>(INITIAL_ANOMALIES);
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredList = useMemo(() => {
    return anomalies.filter(item => {
      if (filterType !== 'ALL' && item.anomalyType !== filterType) return false;
      if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
      return true;
    });
  }, [anomalies, filterType, filterStatus]);

  return (
    <div className="flex flex-col space-y-4 text-xs text-slate-800 antialiased">
      {/* 顶部标题栏 */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0">
            <span className="material-symbols-outlined text-[22px]">warning</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-slate-900 text-sm">商户异常记录中心（超时拒单、转单与违规留痕）</h2>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-mono text-[10px] font-bold">
                履约审计归档
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              记录商户在收卡业务中的超时未接单、主动拒单、验卡误判、积点罚扣及自动转单处理闭环。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('已成功导出近30天商户履约异常与罚扣清单 (CSV)')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>导出异常审计表</span>
          </button>
        </div>
      </div>

      {/* 筛选过滤工具条 */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
          >
            <option value="ALL">全部异常类型</option>
            <option value="超时未接单">超时未接单</option>
            <option value="接单后超时未处理">接单后超时未处理</option>
            <option value="主动拒单">主动拒单</option>
            <option value="验卡失败误判">验卡失败误判</option>
            <option value="涉诉争议挂起">涉诉争议挂起</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
          >
            <option value="ALL">全部处理状态</option>
            <option value="已结案">已结案</option>
            <option value="跟进中">跟进中</option>
            <option value="待商户申诉">待商户申诉</option>
          </select>
        </div>

        <span className="text-slate-400 font-mono text-[11px]">共计 {filteredList.length} 笔异常事件记录</span>
      </div>

      {/* 核心异常记录表格 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="bg-slate-50/90 font-semibold text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200 h-9">
                <th className="py-2.5 px-3">异常单号 / 关联订单</th>
                <th className="py-2.5 px-3">商户信息</th>
                <th className="py-2.5 px-2">异常类型</th>
                <th className="py-2.5 px-3">涉及 SKU / 面额</th>
                <th className="py-2.5 px-2 font-mono">发生时间 / 耗时</th>
                <th className="py-2.5 px-3">转单 / 处置结果</th>
                <th className="py-2.5 px-2 font-mono">罚扣积点</th>
                <th className="py-2.5 px-2">责任人/调度器</th>
                <th className="py-2.5 px-3 text-right">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-mono">
              {filteredList.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3">
                    <strong className="text-slate-900 block font-bold">{item.id}</strong>
                    <span className="text-[10px] text-blue-600 font-medium">{item.orderId}</span>
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className="text-slate-900 font-bold block">{item.merchantName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.mid}</span>
                  </td>
                  <td className="py-2.5 px-2 font-sans">
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                      {item.anomalyType}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-800 font-medium">
                    {item.skuDesc}
                  </td>
                  <td className="py-2.5 px-2 text-slate-500 text-[11px]">
                    <div>{item.occurredAt}</div>
                    <span className="text-amber-700 font-semibold">{item.handlingDurationSec}s 超时</span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-700 text-[11px]">
                    <span className="inline-flex items-center gap-1 font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                      <span className="material-symbols-outlined text-[13px]">published_with_changes</span>
                      {item.failoverResult}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-rose-700 font-bold">
                    -{item.penaltyPoints} PTS
                  </td>
                  <td className="py-2.5 px-2 font-sans text-slate-600 text-[11px]">
                    {item.handler}
                  </td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {item.status}
                    </span>
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
