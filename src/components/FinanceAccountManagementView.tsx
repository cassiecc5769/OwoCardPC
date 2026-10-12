import React, { useState, useMemo } from 'react';
import { NavPath } from '../types';

interface FinanceAccountManagementViewProps {
  onNavigate?: (path: NavPath) => void;
}

type AccountTab = 'platform' | 'merchant' | 'wallet';

export const FinanceAccountManagementView: React.FC<FinanceAccountManagementViewProps> = ({ onNavigate }) => {
  const [accountTab, setAccountTab] = useState<AccountTab>('platform');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 平台账户 (5.2) 水位与数据
  const [platformMetrics] = useState({
    totalBalance: 1850000.0,
    availableBalance: 1240000.0,
    frozenBalance: 410000.0,
    pendingPayout: 200000.0,
    safetyWatermark: 300000.0, // 30万最低安全水位
    warningWatermark: 500000.0, // 50万财务预警水位
    estimatedWithdrawalCapacity: 1040000.0,
    recentInflow: '$150,000.00 (对公电汇)',
    lastChangeTime: '15:20:10'
  });

  // 用户钱包操作 Modal (5.4 & 5.5)
  const [showWalletActionModal, setShowWalletActionModal] = useState(false);
  const [walletActionType, setWalletActionType] = useState<'COMPENSATE' | 'CLAWBACK' | 'FREEZE' | 'UNFREEZE'>('COMPENSATE');
  const [targetUserUid, setTargetUserUid] = useState('US-USR-8804912');
  const [targetOrderId, setTargetOrderId] = useState('ORD-20261005-882');
  const [actionAmount, setActionAmount] = useState('50.00');
  const [actionReason, setActionReason] = useState('售后争议卡密核销损失补发关怀金');

  // 用户钱包 Mock 数据 (5.4)
  const [walletList, setWalletList] = useState([
    {
      uid: 'US-USR-8804912',
      userName: 'Adebayo Adeleke',
      phone: '138****0912',
      totalBalance: 1250.0,
      availableBalance: 850.0,
      frozenBalance: 200.0,
      withdrawingAmount: 200.0,
      compensatedAmount: 100.0,
      clawbackAmount: 0.0,
      status: '正常'
    },
    {
      uid: 'US-USR-9921010',
      userName: 'Chinedu Obi',
      phone: '139****9921',
      totalBalance: 3400.0,
      availableBalance: 1200.0,
      frozenBalance: 2200.0,
      withdrawingAmount: 2200.0, // 提现处理中
      compensatedAmount: 0.0,
      clawbackAmount: 50.0,
      status: '提现处理中'
    }
  ]);

  // 钱包 Ledger 流水
  const [walletLedgers, setWalletLedger] = useState([
    {
      id: 'WLEDGER-8812',
      time: '15:10:02',
      uid: 'US-USR-8804912',
      actionType: '补偿入账 (COMPENSATE)',
      amount: '+ $50.00',
      orderId: 'ORD-20261005-882',
      reason: '客诉争议超时赔付垫付',
      operator: '客服专员-李敏 (CS01)',
      approver: '财务主管-王总 (FA01)'
    }
  ]);

  // 提现异常状态查询与解冻处理 (5.5)
  const [withdrawalTimeouts, setWithdrawalTimeouts] = useState([
    {
      id: 'WD-20261005-001',
      uid: 'US-USR-9921010',
      userName: 'Chinedu Obi',
      amount: 2200.0,
      channel: 'USDT-TRC20 代付网关',
      applyTime: '14:20:10',
      status: '处理中 (超时无回调)',
      queryResult: '未知 (CHANNEL_TIMEOUT)'
    }
  ]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  // 处理用户钱包动作提交 (5.4)
  const handleExecuteWalletAction = () => {
    if (!actionAmount || isNaN(parseFloat(actionAmount))) {
      showToast('⚠️ 请输入合法的操作金额');
      return;
    }
    if (!actionReason.trim()) {
      showToast('⚠️ 资金变动必须填写【变更原因】并指定关联订单');
      return;
    }

    const amt = parseFloat(actionAmount);
    const actionNameMap = {
      COMPENSATE: '补偿资金',
      CLAWBACK: '追回资金',
      FREEZE: '冻结余额',
      UNFREEZE: '解冻余额'
    };

    // 更新用户钱包
    setWalletList(prev =>
      prev.map(w => {
        if (w.uid === targetUserUid) {
          let newAvail = w.availableBalance;
          let newFrozen = w.frozenBalance;
          let newComp = w.compensatedAmount;
          let newClaw = w.clawbackAmount;

          if (walletActionType === 'COMPENSATE') {
            newAvail += amt;
            newComp += amt;
          } else if (walletActionType === 'CLAWBACK') {
            newAvail = Math.max(0, newAvail - amt);
            newClaw += amt;
          } else if (walletActionType === 'FREEZE') {
            newAvail = Math.max(0, newAvail - amt);
            newFrozen += amt;
          } else if (walletActionType === 'UNFREEZE') {
            newFrozen = Math.max(0, newFrozen - amt);
            newAvail += amt;
          }

          return {
            ...w,
            availableBalance: newAvail,
            frozenBalance: newFrozen,
            compensatedAmount: newComp,
            clawbackAmount: newClaw,
            totalBalance: newAvail + newFrozen + w.withdrawingAmount
          };
        }
        return w;
      })
    );

    // 追加 Ledger 流水
    const newLedger = {
      id: `WLEDGER-${Date.now().toString().slice(-4)}`,
      time: new Date().toLocaleTimeString(),
      uid: targetUserUid,
      actionType: `${actionNameMap[walletActionType]} (${walletActionType})`,
      amount: walletActionType === 'COMPENSATE' || walletActionType === 'UNFREEZE' ? `+ $${amt.toFixed(2)}` : `- $${amt.toFixed(2)}`,
      orderId: targetOrderId,
      reason: actionReason.trim(),
      operator: '财务专员-张华 (FA02)',
      approver: '财务主管-王总 (FA01)'
    };

    setWalletLedger(prev => [newLedger, ...prev]);
    setShowWalletActionModal(false);
    showToast(`✅ 【${actionNameMap[walletActionType]}】执行成功！变动金额 $${amt.toFixed(2)} 已回写用户钱包，并生成严格审计 Ledger 流水！`);
  };

  // 5.5 提现超时状态反查与解冻
  const handleQueryWithdrawalStatus = (wdId: string) => {
    showToast(`🔍 已向代付网关发起 ${wdId} 交易状态反查: 渠道确认交易失败 (FAIL_CHANNEL)`);
    setWithdrawalTimeouts(prev =>
      prev.map(item => {
        if (item.id === wdId) {
          return {
            ...item,
            status: '失败 (已自动解冻资金)',
            queryResult: '已确认失败，资金恢复至可用余额'
          };
        }
        return item;
      })
    );

    // 解冻用户钱包
    setWalletList(prev =>
      prev.map(w => {
        if (w.uid === 'US-USR-9921010') {
          return {
            ...w,
            availableBalance: w.availableBalance + 2200.0,
            withdrawingAmount: 0,
            status: '正常'
          };
        }
        return w;
      })
    );

    showToast(`✅ 提现 ${wdId} 确认失败，已安全自动解冻 $2,200.00 恢复至用户可用余额！`);
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
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
            <span className="material-symbols-outlined text-xl">account_balance</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">资金账户</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                平台 + 商户 + 用户三类资金账户
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              统一管理平台资金水位、商户积点与用户钱包。严格遵循<strong>资金变动必须形成 Ledger 流水，禁止直接改余额</strong>红线。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate && onNavigate('abnormal-finance')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
          >
            查看财务异常事件
          </button>
        </div>
      </div>

      {/* 5.1 三类资金账户 Tab 导航栏 */}
      <section className="bg-white rounded-xl border border-slate-200/80 px-4 pt-1 shadow-xs flex items-center gap-1 overflow-x-auto text-xs">
        {[
          { id: 'platform', label: '平台账户', icon: 'account_balance' },
          { id: 'merchant', label: '商户账户 (积点)', icon: 'storefront' },
          { id: 'wallet', label: '用户钱包', icon: 'account_balance_wallet' }
        ].map(tab => {
          const isActive = accountTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAccountTab(tab.id as AccountTab)}
              className={`px-5 py-3.5 font-bold rounded-t-lg transition-colors shrink-0 flex items-center gap-2 relative cursor-pointer text-xs ${
                isActive
                  ? 'text-emerald-700 bg-emerald-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-emerald-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </section>

      {/* 5.2 平台账户【Tab】 */}
      {accountTab === 'platform' && (
        <div className="space-y-4">
          {/* 水位预警 Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start justify-between gap-3 text-emerald-950">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-emerald-600 text-xl mt-0.5">verified_user</span>
              <div>
                <span className="font-bold">平台可用资金水位评估：安全</span>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  当前平台可用余额 <strong>${platformMetrics.availableBalance.toLocaleString()}</strong> 远高于最低安全水位阈值 <strong>${platformMetrics.safetyWatermark.toLocaleString()}</strong>，可完备承接预计提现请求。
                </p>
              </div>
            </div>
            <span className="font-mono text-xs bg-white text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded font-bold shrink-0">
              安全水位线: ${platformMetrics.safetyWatermark.toLocaleString()}
            </span>
          </div>

          {/* 平台账户核心 8 大字段 KPI 看板 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-slate-400 text-[11px] block">总账户余额 (Total)</span>
              <span className="font-mono text-2xl font-bold text-slate-900">${platformMetrics.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-slate-400 text-[11px] block">可用余额 (Available)</span>
              <span className="font-mono text-2xl font-bold text-emerald-700">${platformMetrics.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-slate-400 text-[11px] block">冻结金额 (Frozen)</span>
              <span className="font-mono text-2xl font-bold text-slate-800">${platformMetrics.frozenBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-slate-400 text-[11px] block">待支付金额 (Pending)</span>
              <span className="font-mono text-2xl font-bold text-purple-700">${platformMetrics.pendingPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-slate-400 text-[11px] block">预计可支撑提现金额</span>
              <span className="font-mono text-xl font-bold text-slate-900">${platformMetrics.estimatedWithdrawalCapacity.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              <span className="text-[10px] text-slate-500 block">扣除在途冻结与待付头寸后净额</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-slate-400 text-[11px] block">最近充值 (Inflow)</span>
              <span className="font-mono text-base font-bold text-blue-700">{platformMetrics.recentInflow}</span>
              <span className="text-[10px] text-slate-500 block">对公网关自动归集确认</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-slate-400 text-[11px] block">最近资金变化时间</span>
              <span className="font-mono text-base font-bold text-slate-800">{platformMetrics.lastChangeTime}</span>
              <span className="text-[10px] text-emerald-700 block">四账恒等式实时平账</span>
            </div>
          </div>
        </div>
      )}

      {/* 5.3 商户账户【Tab】 */}
      {accountTab === 'merchant' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 text-sm">商户积点账户与 Ledger 变动流水</span>
              <p className="text-[11px] text-slate-500 mt-0.5">积点充值、扣减、退款返还、调账均严格自动生成双人复核 Ledger，禁止直接更改余额。</p>
            </div>
            <button
              onClick={() => showToast('引导：请点击商户行侧的“申请调账”提报带 Ledger 的双人复核单据')}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
            >
              提报积点调账单
            </button>
          </div>
        </div>
      )}

      {/* 5.4 用户钱包【Tab】 & 5.5 提现异常 */}
      {accountTab === 'wallet' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 text-sm">用户钱包管理 (User Wallet Ledger)</span>
              <p className="text-[11px] text-slate-500 mt-0.5">管理可用余额、冻结余额、提现中金额、补偿金与追回金。任何变动必须填写原因与关联订单。</p>
            </div>
            <button
              onClick={() => setShowWalletActionModal(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
            >
              用户钱包动作 (补偿/追回/冻结/解冻)
            </button>
          </div>

          {/* 用户钱包 Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 border-b border-slate-100 font-bold text-slate-900 text-xs">
              出卡用户钱包资产台账
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold text-[11px]">
                    <th className="py-2.5 px-3">出卡用户</th>
                    <th className="py-2.5 px-3 font-mono">总钱包余额</th>
                    <th className="py-2.5 px-3 font-mono">可用余额</th>
                    <th className="py-2.5 px-3 font-mono">冻结余额</th>
                    <th className="py-2.5 px-3 font-mono">提现中金额</th>
                    <th className="py-2.5 px-3 font-mono">累计补偿金</th>
                    <th className="py-2.5 px-3 font-mono">累计追回金</th>
                    <th className="py-2.5 px-3">状态</th>
                    <th className="py-2.5 px-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-mono">
                  {walletList.map((w, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{w.userName} ({w.uid})</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">${w.totalBalance.toFixed(2)}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-700">${w.availableBalance.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-slate-800">${w.frozenBalance.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-purple-700">${w.withdrawingAmount.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-blue-700">${w.compensatedAmount.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-rose-700">${w.clawbackAmount.toFixed(2)}</td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          w.status === '正常' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-sans">
                        <button
                          onClick={() => {
                            setTargetUserUid(w.uid);
                            setShowWalletActionModal(true);
                          }}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-xs font-semibold cursor-pointer"
                        >
                          调整/做账
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5.5 提现异常与超时超时状态反查 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600 text-[18px]">history_toggle_off</span>
                <span className="font-bold text-slate-900 text-sm">提现超时未返回反查与解冻机制</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">解决渠道响应延迟引发的用户资金永久冻结问题</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold text-[11px]">
                    <th className="py-2 px-3">提现单号</th>
                    <th className="py-2 px-3">提现用户</th>
                    <th className="py-2 px-3">提现金额</th>
                    <th className="py-2 px-3">代付渠道</th>
                    <th className="py-2 px-3">申请时间</th>
                    <th className="py-2 px-3">渠道状态</th>
                    <th className="py-2 px-3">操作解冻</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-mono">
                  {withdrawalTimeouts.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-900">{item.id}</td>
                      <td className="py-2 px-3 text-slate-800">{item.userName} ({item.uid})</td>
                      <td className="py-2 px-3 font-bold text-purple-700">${item.amount.toFixed(2)}</td>
                      <td className="py-2 px-3 text-slate-700">{item.channel}</td>
                      <td className="py-2 px-3 text-slate-500">{item.applyTime}</td>
                      <td className="py-2 px-3 font-sans font-bold text-amber-700">{item.status}</td>
                      <td className="py-2 px-3 font-sans">
                        <button
                          onClick={() => handleQueryWithdrawalStatus(item.id)}
                          className="px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded font-semibold text-xs cursor-pointer"
                        >
                          反查状态并自动解冻
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 用户钱包 Ledger 审计流水 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
            <span className="font-bold text-slate-900 text-sm block">用户钱包 Ledger 审计流水存证</span>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold text-[11px]">
                    <th className="py-2 px-3">流水号</th>
                    <th className="py-2 px-3">时间</th>
                    <th className="py-2 px-3">用户 UID</th>
                    <th className="py-2 px-3">动作类型</th>
                    <th className="py-2 px-3">变动金额</th>
                    <th className="py-2 px-3">关联订单</th>
                    <th className="py-2 px-3">变更原因</th>
                    <th className="py-2 px-3">操作人 / 审批人</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-mono">
                  {walletLedgers.map((l, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-500">{l.id}</td>
                      <td className="py-2 px-3 text-slate-500">{l.time}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{l.uid}</td>
                      <td className="py-2 px-3 text-emerald-700 font-bold">{l.actionType}</td>
                      <td className="py-2 px-3 font-bold text-emerald-700">{l.amount}</td>
                      <td className="py-2 px-3 text-blue-700">{l.orderId}</td>
                      <td className="py-2 px-3 text-slate-700 font-sans">{l.reason}</td>
                      <td className="py-2 px-3 text-slate-600 font-sans">{l.operator} / {l.approver}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 用户钱包动作 Modal (5.4) */}
      {showWalletActionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-sm">用户钱包变动做账 (写 Ledger)</span>
              <button onClick={() => setShowWalletActionModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">变动动作类型</label>
                <select
                  value={walletActionType}
                  onChange={e => setWalletActionType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium outline-none focus:border-emerald-500"
                >
                  <option value="COMPENSATE">补偿金 (COMPENSATE) ➔ 可用余额增加</option>
                  <option value="CLAWBACK">追回金 (CLAWBACK) ➔ 可用余额扣减</option>
                  <option value="FREEZE">冻结余额 (FREEZE) ➔ 移至冻结账户</option>
                  <option value="UNFREEZE">解冻余额 (UNFREEZE) ➔ 移至可用账户</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">目标用户 UID</label>
                <input
                  type="text"
                  value={targetUserUid}
                  onChange={e => setTargetUserUid(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">关联订单号 (Order ID)</label>
                <input
                  type="text"
                  value={targetOrderId}
                  onChange={e => setTargetOrderId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">变动金额 ($)</label>
                <input
                  type="text"
                  value={actionAmount}
                  onChange={e => setActionAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">变动原因与审批依据 (必填)</label>
                <textarea
                  value={actionReason}
                  onChange={e => setActionReason(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800">
                ⚠️ 红线合规：提交后将写入 Ledger 审计流水，禁止直接修改数据库余额。
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setShowWalletActionModal(false)} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer">
                取消
              </button>
              <button onClick={handleExecuteWalletAction} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer">
                提交并写入 Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
