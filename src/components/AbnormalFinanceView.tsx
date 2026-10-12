import React, { useState, useMemo } from 'react';
import { NavPath } from '../types';

export type ExtendedAbnormalCategory =
  | '平台余额不足'
  | '提现失败'
  | '提现状态未知'
  | '用户钱包异常'
  | '商户积点异常'
  | '对账差异'
  | '挂账'
  | '调账'
  | '赔付'
  | '转单损失'
  | '平台损失';

export interface ExtendedAbnormalItem {
  id: string;
  category: ExtendedAbnormalCategory;
  title: string;
  targetName: string;
  targetId: string;
  amountNumber: number;
  severity: '高危' | '中危' | '关注';
  agingDays: number;
  description: string;
  status: '待处理' | '审批中' | '已核销结案';
  handler: string;
}

const MOCK_EXTENDED_ITEMS: ExtendedAbnormalItem[] = [
  {
    id: 'ABN-PL-2026-01',
    category: '平台余额不足',
    title: '平台对公结算账户低于最低安全水位 ($300,000)',
    targetName: '平台对公汇丰托管户',
    targetId: 'ACC-HSBC-001',
    amountNumber: 240000,
    severity: '高危',
    agingDays: 1,
    description: '可用可用头寸仅剩 $240,000.00，低于 30 万安全线，触发高优先级财务充值任务',
    status: '待处理',
    handler: '李总账 (CFO)'
  },
  {
    id: 'ABN-WD-2026-02',
    category: '提现状态未知',
    title: '用户提现超 30 分钟代付网关无响应',
    targetName: 'Chinedu Obi (US-USR-9921010)',
    targetId: 'WD-20261005-001',
    amountNumber: 2200,
    severity: '高危',
    agingDays: 1,
    description: '代付请求已下发，但渠道网络超时未回传终端状态，资金处于挂起状态',
    status: '待处理',
    handler: '张出纳 (FA02)'
  },
  {
    id: 'ABN-WLF-2026-03',
    category: '提现失败',
    title: 'USDT 链上代付失败 (GAS不足/地址校验错)',
    targetName: 'Adebayo Adeleke (US-USR-8804912)',
    targetId: 'WD-20261005-002',
    amountNumber: 450,
    severity: '中危',
    agingDays: 2,
    description: 'TRC20 链上网关返回 OUT_OF_ENERGY，提现解冻退回用户钱包',
    status: '已核销结案',
    handler: '系统自动化代付引擎'
  },
  {
    id: 'ABN-TL-2026-04',
    category: '转单损失',
    title: '大额 Apple US 拒单转单溢价亏损',
    targetName: 'ORD-20261005-88912',
    targetId: 'FAILOVER-LOSS-001',
    amountNumber: 56.5,
    severity: '高危',
    agingDays: 1,
    description: '原商户处理失败转单至新商户，转单增加成本 $65.00 - 原利润 $8.50 = 平台损失 $56.50 (> $50 阈值)',
    status: '审批中',
    handler: '待财务总监双人关章签批'
  },
  {
    id: 'ABN-UW-2026-05',
    category: '用户钱包异常',
    title: '用户钱包退款双重做账差异',
    targetName: 'Kofi Mensah (US-USR-88934)',
    targetId: 'UW-88934',
    amountNumber: 150,
    severity: '关注',
    agingDays: 3,
    description: '争议工单解冻时二次触发充值，产生 $150 溢额',
    status: '待处理',
    handler: '张出纳 (FA02)'
  }
];

interface AbnormalFinanceViewProps {
  onNavigate?: (path: NavPath) => void;
}

export const AbnormalFinanceView: React.FC<AbnormalFinanceViewProps> = ({ onNavigate }) => {
  const [items, setItems] = useState<ExtendedAbnormalItem[]>(MOCK_EXTENDED_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const filteredItems = useMemo(() => {
    return items.filter(i => {
      if (selectedCategory !== 'ALL' && i.category !== selectedCategory) return false;
      if (selectedSeverity !== 'ALL' && i.severity !== selectedSeverity) return false;
      return true;
    });
  }, [items, selectedCategory, selectedSeverity]);

  const handleResolveItem = (id: string) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          return { ...item, status: '已核销结案' };
        }
        return item;
      })
    );
    showToast(`✅ 财务异常单【${id}】已成功处理并结案，生成对账核销凭证！`);
  };

  return (
    <div className="flex flex-col w-full text-slate-800 antialiased space-y-4 pb-16 text-xs">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900/90 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 backdrop-blur border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 顶部 Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
            <span className="material-symbols-outlined text-xl">warning</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">财务异常管理</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                11 大标准财务异常分类全覆盖
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              覆盖平台余额不足、提现失败、提现状态未知、用户钱包异常、商户积点异常、对账差异、挂账、调账、赔付、转单损失与平台损失。
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate && onNavigate('points-account')}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer shrink-0"
        >
          返回资金账户
        </button>
      </div>

      {/* 11 大异常分类标签速查过滤器 */}
      <section className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2">
        <div className="font-bold text-slate-900 text-xs">异常分类过滤 (5.6 分类)</div>
        <div className="flex flex-wrap gap-1.5">
          {[
            'ALL',
            '平台余额不足',
            '提现失败',
            '提现状态未知',
            '用户钱包异常',
            '商户积点异常',
            '对账差异',
            '挂账',
            '调账',
            '赔付',
            '转单损失',
            '平台损失'
          ].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                selectedCategory === cat ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat === 'ALL' ? '全部异常分类' : cat}
            </button>
          ))}
        </div>
      </section>

      {/* 财务异常 Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold text-[11px]">
                <th className="py-2.5 px-3">异常单号</th>
                <th className="py-2.5 px-3">异常分类</th>
                <th className="py-2.5 px-3">异常事件描述</th>
                <th className="py-2.5 px-3">关联主体/单号</th>
                <th className="py-2.5 px-3 font-mono text-right">涉及金额</th>
                <th className="py-2.5 px-3">严重级别</th>
                <th className="py-2.5 px-3">账龄</th>
                <th className="py-2.5 px-3">处理状态</th>
                <th className="py-2.5 px-3 text-right">操作处理</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-mono">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{item.id}</td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px]">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">{item.title}</td>
                  <td className="py-2.5 px-3 text-blue-700">{item.targetName} ({item.targetId})</td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-700">${item.amountNumber.toFixed(2)}</td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      item.severity === '高危' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.severity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{item.agingDays} 天</td>
                  <td className="py-2.5 px-3 font-sans font-bold">
                    <span className={item.status === '已核销结案' ? 'text-emerald-700' : 'text-amber-800'}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    {item.status !== '已核销结案' ? (
                      <button
                        onClick={() => handleResolveItem(item.id)}
                        className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold cursor-pointer"
                      >
                        核销处理
                      </button>
                    ) : (
                      <span className="text-slate-400">已结案</span>
                    )}
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
