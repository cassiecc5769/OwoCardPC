import React, { useState } from 'react';
import {
  OrderItem,
  TransactionStatusCode,
  OrderTransferRecord,
  FieldEditAuditLog,
  DispatchCandidate
} from '../data/mockOrders';

interface OrderDetailViewProps {
  order: OrderItem;
  onBack: () => void;
  onUpdateOrder: (updated: OrderItem) => void;
  showToast: (msg: string) => void;
}

export const OrderDetailView: React.FC<OrderDetailViewProps> = ({
  order,
  onBack,
  onUpdateOrder,
  showToast
}) => {
  // 敏感信息脱敏开关 (权限控制)
  const [isMaskedCode, setIsMaskedCode] = useState(true);
  const [hasPermission] = useState(true); // 是否具有脱敏解密权限

  // 状态机流转模态框
  const [showStateChangeModal, setShowStateChangeModal] = useState(false);
  const [targetNextState, setTargetNextState] = useState<TransactionStatusCode>('completed');
  const [stateChangeReason, setStateChangeReason] = useState('人工复核通过，推进主链路状态流转');

  // 转单 / 重新派单模态框 (1.2.4)
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferReason, setTransferReason] = useState<'商户拒单' | '商户超时' | '商户处理失败' | '商户积点不足' | '商户临时停止接单' | '不具备实际承接能力' | '人工判断转单'>('商户处理失败');
  const [selectedTargetMerchantMid, setSelectedTargetMerchantMid] = useState('M0088');

  // 敏感字段人工修改模态框 (1.2.6)
  const [showSensitiveEditModal, setShowSensitiveEditModal] = useState(false);
  const [editFieldName, setEditFieldName] = useState<'卡种' | '国家' | '面额' | 'Card Code' | '商户' | '订单状态' | '风险结果' | '失败结果' | '关闭状态'>('卡种');
  const [editNewValue, setEditNewValue] = useState('');
  const [editReason, setEditReason] = useState('');
  const [editEvidence, setEditEvidence] = useState('');
  const [showSecondaryConfirmModal, setShowSecondaryConfirmModal] = useState(false);

  // 快速导航锚点 / 切换固定分区 Tab
  const [activePartition, setActivePartition] = useState<
    'all' | 'basic' | 'admission' | 'card' | 'card_check' | 'risk' | 'dispatch' | 'quote' | 'fulfillment' | 'finance' | 'after_sale' | 'event_logs'
  >('all');

  // 可转单备选商户池
  const candidateMerchantPool = [
    { mid: 'M0088', name: '环球数码极速兑付 (M0088)', rate: 88.5, pts: '$85,000', load: '18/50' },
    { mid: 'M0102', name: '星辰跨境收卡组 (M0102)', rate: 87.8, pts: '$12,000', load: '5/20' },
    { mid: 'M0192', name: '招财进宝科技 (M0192)', rate: 89.2, pts: '$120,000', load: '12/50' }
  ];

  // 处理状态变更 (所有状态变更必须写事件日志)
  const handleConfirmStateChange = () => {
    const stateLabelMap: Record<TransactionStatusCode, string> = {
      created: '已创建',
      precheck: '预检中',
      pending: '待处理',
      waiting_merchant: '待商户接单',
      merchant_processing: '商户处理中',
      completed: '已完成',
      precheck_anomaly: '待人工确认 (预检异常)',
      merchant_rejected: '待转单 (商户拒单)',
      merchant_failed: '异常处理中 (商户失败)',
      disputing: '售后中 (用户争议)'
    };

    const newLog = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      time: new Date().toTimeString().split(' ')[0],
      operator: '当前操作员 (客服/运营)',
      fromState: order.txnStatusLabel || order.txnStatus,
      toState: stateLabelMap[targetNextState],
      reason: stateChangeReason.trim() || '人工指令触发状态流转',
      traceId: `TR-${Date.now().toString().slice(-8)}`
    };

    const updated: OrderItem = {
      ...order,
      txnStatus: targetNextState,
      txnStatusLabel: stateLabelMap[targetNextState],
      stateEventLogs: [newLog, ...(order.stateEventLogs || [])]
    };

    onUpdateOrder(updated);
    setShowStateChangeModal(false);
    showToast(`状态机流转成功：已由【${newLog.fromState}】变更至【${newLog.toState}】，并写入事件审计日志！`);
  };

  // 处理转单执行 (1.2.4)
  const handleExecuteTransfer = () => {
    const targetMerch = candidateMerchantPool.find(m => m.mid === selectedTargetMerchantMid) || candidateMerchantPool[0];
    const origRate = order.merchantRate || order.userRate || 88.0;
    const newRate = targetMerch.rate;
    const gapRate = Math.abs(origRate - newRate);
    const platformLoss = (order.faceValue * gapRate) / 100;
    const lossThreshold = 2.0; // 损失阈值 $2.00
    const isLossExceeded = platformLoss > lossThreshold;

    const newTransferRecord: OrderTransferRecord = {
      id: `TRF-${Date.now().toString().slice(-6)}`,
      transferTime: new Date().toLocaleTimeString(),
      originalMerchantMid: order.merchantMid || 'M0192',
      originalMerchantName: order.merchantName || '原承接商户',
      newMerchantMid: targetMerch.mid,
      newMerchantName: targetMerch.name,
      originalRate: origRate,
      newRate: newRate,
      priceGapRate: parseFloat(gapRate.toFixed(2)),
      platformLossAmount: parseFloat(platformLoss.toFixed(2)),
      transferReason: transferReason,
      operationMode: isLossExceeded ? '人工/财务确认转单' : '自动转单',
      operator: '资深运营-李强 (OP02)',
      isLossExceeded
    };

    const newEventLog = {
      id: `LOG-TRF-${Date.now().toString().slice(-6)}`,
      time: new Date().toLocaleTimeString(),
      operator: '资深运营-李强 (OP02)',
      fromState: order.merchantName,
      toState: targetMerch.name,
      reason: `执行转单：【${transferReason}】➔ 新商户 ${targetMerch.name}，新报价 ${newRate}%，价差 ${gapRate.toFixed(2)}%，平台承担 $${platformLoss.toFixed(2)} (${isLossExceeded ? '超出阈值需二次审批' : '未超阈值'})`,
      traceId: `TR-TRANSFER-${Date.now().toString().slice(-8)}`
    };

    const updatedOrder: OrderItem = {
      ...order,
      merchantMid: targetMerch.mid,
      merchantName: targetMerch.name,
      merchantRate: newRate,
      merchantPrice: (order.faceValue * newRate) / 100,
      marginAmount: parseFloat(((order.faceValue * (newRate - order.userRate)) / 100).toFixed(2)),
      txnStatus: 'waiting_merchant',
      txnStatusLabel: '待商户接单 (已转单)',
      orderTransferLogs: [newTransferRecord, ...(order.orderTransferLogs || [])],
      stateEventLogs: [newEventLog, ...(order.stateEventLogs || [])]
    };

    onUpdateOrder(updatedOrder);
    setShowTransferModal(false);
    showToast(`✅ 转单成功！已将订单派给新商户【${targetMerch.name}】，原价 ${origRate}% ➔ 新价 ${newRate}%，平台补贴 $${platformLoss.toFixed(2)}`);
  };

  // 处理敏感字段修改准备与提交 (1.2.6)
  const handleOpenSensitiveEdit = () => {
    let currentVal = '';
    if (editFieldName === '卡种') currentVal = order.brand;
    else if (editFieldName === '国家') currentVal = `${order.countryName} (${order.country})`;
    else if (editFieldName === '面额') currentVal = `$${order.faceValue} ${order.currency}`;
    else if (editFieldName === 'Card Code') currentVal = order.maskedCode;
    else if (editFieldName === '商户') currentVal = `${order.merchantName} (${order.merchantMid})`;
    else if (editFieldName === '订单状态') currentVal = order.txnStatusLabel || order.txnStatus;
    else if (editFieldName === '风险结果') currentVal = order.riskDetails?.result || '放行通过';
    else if (editFieldName === '失败结果') currentVal = order.exceptionReason || '无失败结果';
    else if (editFieldName === '关闭状态') currentVal = order.txnStatus === 'completed' ? '已完成完结' : '未关闭';

    setEditNewValue('');
    setEditReason('');
    setEditEvidence('');
    setShowSensitiveEditModal(true);
  };

  const handleStepToSecondaryConfirm = () => {
    if (!editNewValue.trim()) {
      showToast('⚠️ 请输入修改后的新值');
      return;
    }
    if (!editReason.trim()) {
      showToast('⚠️ 敏感字段修改必须填写【修改原因】');
      return;
    }
    if (!editEvidence.trim()) {
      showToast('⚠️ 敏感字段修改必须填写【证据/附件说明】');
      return;
    }
    setShowSensitiveEditModal(false);
    setShowSecondaryConfirmModal(true);
  };

  const handleConfirmSensitiveEdit = () => {
    let currentVal = '';
    if (editFieldName === '卡种') currentVal = order.brand;
    else if (editFieldName === '国家') currentVal = `${order.countryName} (${order.country})`;
    else if (editFieldName === '面额') currentVal = `$${order.faceValue} ${order.currency}`;
    else if (editFieldName === 'Card Code') currentVal = order.maskedCode;
    else if (editFieldName === '商户') currentVal = `${order.merchantName} (${order.merchantMid})`;
    else if (editFieldName === '订单状态') currentVal = order.txnStatusLabel || order.txnStatus;
    else if (editFieldName === '风险结果') currentVal = order.riskDetails?.result || '放行通过';
    else if (editFieldName === '失败结果') currentVal = order.exceptionReason || '无';
    else if (editFieldName === '关闭状态') currentVal = order.txnStatus;

    const newAuditLog: FieldEditAuditLog = {
      id: `EDIT-${Date.now().toString().slice(-6)}`,
      editTime: new Date().toLocaleTimeString(),
      operator: '风控总监-赵鹏 (RK01)',
      fieldName: editFieldName,
      originalValue: currentVal,
      newValue: editNewValue.trim(),
      reason: editReason.trim(),
      evidenceDetails: editEvidence.trim(),
      secondConfirmedBy: '系统风控二次校验引擎 (Rule V3.2)'
    };

    const newEventLog = {
      id: `LOG-EDIT-${Date.now().toString().slice(-6)}`,
      time: new Date().toLocaleTimeString(),
      operator: '风控总监-赵鹏 (RK01)',
      fromState: currentVal,
      toState: editNewValue.trim(),
      reason: `敏感字段【${editFieldName}】人工修改：${editReason.trim()} (证据: ${editEvidence.trim()})`,
      traceId: `TR-SENSITIVE-${Date.now().toString().slice(-8)}`
    };

    let updatedOrder: OrderItem = {
      ...order,
      fieldEditAuditLogs: [newAuditLog, ...(order.fieldEditAuditLogs || [])],
      stateEventLogs: [newEventLog, ...(order.stateEventLogs || [])]
    };

    if (editFieldName === '卡种') updatedOrder.brand = editNewValue.trim();
    if (editFieldName === '商户') updatedOrder.merchantName = editNewValue.trim();
    if (editFieldName === '失败结果') updatedOrder.exceptionReason = editNewValue.trim();

    onUpdateOrder(updatedOrder);
    setShowSecondaryConfirmModal(false);
    showToast(`🔒 敏感字段【${editFieldName}】人工修改成功，原值【${currentVal}】➔ 新值【${editNewValue}】，审计存证已写入时间轴！`);
  };

  const handleToggleCodeMask = () => {
    if (isMaskedCode) {
      if (!hasPermission) {
        showToast('⚠️ 权限不足：您当前角色未配置「查看完整明文卡密」敏感权限');
        return;
      }
      setIsMaskedCode(false);
      showToast('👁️ 已解密查看卡密明文，该敏感操作已记录于 IAM 审计日志中！');
    } else {
      setIsMaskedCode(true);
      showToast('🔒 卡密已恢复脱敏掩码显示');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`已复制 ${label}: ${text}`);
  };

  const handleTriggerQuickTool = (toolKey: string) => {
    if (toolKey === 'apple_balance') {
      const newLog = {
        id: `LOG-TOOL-${Date.now().toString().slice(-6)}`,
        time: new Date().toTimeString().split(' ')[0],
        operator: '客服专员-张敏 (CS08)',
        fromState: order.txnStatusLabel || order.txnStatus,
        toState: order.txnStatusLabel || order.txnStatus,
        reason: `调用 Apple 余额查询工具：查验结果 Active，当前可用余额 $${order.faceValue}.00，余额与申报值一致 (100%)`,
        traceId: `TR-TOOL-${Date.now().toString().slice(-8)}`
      };
      const updated: OrderItem = {
        ...order,
        cardCheckDetails: {
          ...order.cardCheckDetails,
          balance: `$${order.faceValue}.00 ${order.currency}`,
          status: '有效足额',
          checkTime: new Date().toLocaleTimeString(),
          result: `Apple Enterprise API 查验有效：卡密处于未兑换状态 (Active)，余额 $${order.faceValue}.00`
        },
        stateEventLogs: [newLog, ...(order.stateEventLogs || [])]
      };
      onUpdateOrder(updated);
      showToast(`✅ Apple 余额查验成功：有效足额 $${order.faceValue}.00，结果已自动回写卡单并记录时间轴！`);
    } else {
      showToast(`🔍 已自动带入卡单信息并调用 ${order.brand} 官方查验通道`);
    }
  };

  return (
    <div className="flex flex-col w-full text-slate-800 antialiased text-xs space-y-4">
      {/* 顶部面包屑与快捷操作栏 */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-slate-500">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>返回卡单管理</span>
          </button>
          <span className="text-slate-300 font-mono">/</span>
          <span>交易事实中心</span>
          <span className="text-slate-300 font-mono">/</span>
          <span className="font-mono text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {order.orderId}
          </span>
          <span className="font-mono text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            卡单号: {order.cardOrderId || 'KD-20261005-001'}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">swap_horiz</span>
            <span>转单 / 重新派单</span>
          </button>
          <button
            onClick={handleOpenSensitiveEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">edit_note</span>
            <span>敏感字段人工修改</span>
          </button>
          <button
            onClick={() => setShowStateChangeModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">alt_route</span>
            <span>状态机手动流转</span>
          </button>
        </div>
      </div>

      {/* 专项卡工具可用操作条 */}
      <section className="bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/80 rounded-xl p-3.5 border border-blue-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <span className="material-symbols-outlined text-[18px]">build</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-xs">可用专项卡工具（自动带入当前卡单信息）</span>
              <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[10px] font-mono font-semibold">
                {order.brand} · {order.country}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              直接在卡单内调用工具，结果自动回写时间轴与证据链，无需二次复制粘贴。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => handleTriggerQuickTool('apple_balance')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
          >
            <span className="material-symbols-outlined text-[14px]">account_balance_wallet</span>
            <span>余额/状态查询</span>
          </button>
        </div>
      </section>

      {/* 卡单主流程 (14 节点全链条) */}
      <section className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[18px]">schema</span>
            <span className="font-bold text-slate-900 text-sm">卡单主流程全链路图谱</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-500">主状态:</span>
            <span className="px-2.5 py-0.5 rounded-full font-bold text-xs bg-blue-100 text-blue-800 border border-blue-300">
              {order.txnStatusLabel || order.txnStatus}
            </span>
          </div>
        </div>

        {/* 14 节点主流程拓扑 */}
        <div className="overflow-x-auto py-2">
          <div className="min-w-[1100px] flex items-center justify-between relative px-2">
            <div className="absolute top-1/2 left-6 right-6 h-1 bg-slate-100 -translate-y-1/2 z-0"></div>

            {[
              { label: '选择SKU', desc: '用户选卡种面额' },
              { label: '交易准入', desc: '规则版本校验' },
              { label: '基础校验', desc: '卡码面值格式' },
              { label: '确认规则', desc: '特殊协议勾选' },
              { label: '创建Order', desc: 'Order + Card' },
              { label: 'Card Check', desc: '官方探针查验' },
              { label: '风险判断', desc: '风控引擎规则' },
              { label: '商户筛选', desc: '可承接池匹配' },
              { label: '派单策略', desc: '最高价与履约分' },
              { label: '分配商户', desc: '锁定商户席位' },
              { label: '商户接单', desc: '冻结质押保证金' },
              { label: '商户处理', desc: 'Calling API/核销' },
              { label: '交易成功', desc: '回传核销结果' },
              { label: '结算', desc: '分账放款入账' }
            ].map((node, index) => {
              const isPast = index <= (order.txnStatus === 'completed' ? 13 : 10);
              const isCurrent = order.txnStatus === 'completed' ? index === 13 : index === 10;

              return (
                <div key={index} className="flex flex-col items-center relative z-10 space-y-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shadow-xs transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                      : isPast
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                  }`}>
                    {isPast && !isCurrent ? (
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={`font-semibold text-[11px] ${isCurrent ? 'text-blue-600 font-bold' : isPast ? 'text-slate-800' : 'text-slate-400'}`}>
                    {node.label}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono text-center max-w-[70px] truncate">
                    {node.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 固定分区切换器 / 快速索引导航 */}
      <div className="bg-white rounded-xl p-1.5 border border-slate-200 shadow-xs flex items-center gap-1 overflow-x-auto scrollbar-none">
        {[
          { id: 'all', label: '固定全景 (全量分区)', icon: 'view_agenda' },
          { id: 'basic', label: '基础信息', icon: 'info' },
          { id: 'admission', label: '交易准入结果', icon: 'fact_check' },
          { id: 'card', label: '卡信息 (脱敏)', icon: 'pin' },
          { id: 'card_check', label: 'Card Check', icon: 'verified' },
          { id: 'risk', label: '风控引擎', icon: 'shield' },
          { id: 'dispatch', label: '派单过程', icon: 'route' },
          { id: 'quote', label: '报价模型', icon: 'request_quote' },
          { id: 'fulfillment', label: '商户履约', icon: 'storefront' },
          { id: 'finance', label: '财务清算', icon: 'payments' },
          { id: 'after_sale', label: '售后争议', icon: 'gavel' },
          { id: 'event_logs', label: '事件时间轴 (审计)', icon: 'history' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActivePartition(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activePartition === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 分区内容展示 */}
      <div className="space-y-4">
        {/* 分区 1: 基础信息 */}
        {(activePartition === 'all' || activePartition === 'basic') && (
          <section className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">info</span>
                <span className="font-bold text-slate-900 text-sm">基础信息</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">交易主体与核心标识</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">系统订单号 (Order ID)</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 text-sm">{order.orderId}</span>
                  <button onClick={() => copyToClipboard(order.orderId, '订单号')} className="text-slate-400 hover:text-blue-600 cursor-pointer">
                    <span className="material-symbols-outlined text-[15px]">content_copy</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 space-y-1">
                <span className="text-indigo-500 text-[11px] block">卡单号 (Card Order ID)</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-indigo-900 text-sm">{order.cardOrderId || 'KD-20261005-001'}</span>
                  <button onClick={() => copyToClipboard(order.cardOrderId || 'KD-20261005-001', '卡单号')} className="text-indigo-400 hover:text-indigo-700 cursor-pointer">
                    <span className="material-symbols-outlined text-[15px]">content_copy</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">出卡用户 (User)</span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-900">{order.userName || '出卡用户'}</span>
                    <span className="font-mono text-[10px] px-1 rounded bg-blue-100 text-blue-700 font-bold">{order.userVip || 'V2'}</span>
                  </div>
                  <span className="font-mono text-slate-500 text-[11px]">{order.userUid}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">创建接收时间 (Created Time)</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-slate-800 text-xs">{order.time}</span>
                  <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">TLS 1.3 PASS</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 交易准入结果 (1.2.2) */}
        {(activePartition === 'all' || activePartition === 'admission') && (
          <section className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">verified_user</span>
                <span className="font-bold text-slate-900 text-sm">交易准入结果</span>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                准入判定: 允许交易 (Trade Allowed)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">使用规则版本 (Rule Version)</span>
                <span className="font-mono font-bold text-slate-900 text-xs">{order.tradeAdmission?.ruleVersion || 'v3.2.0-STD'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">标准 SKU (Standard SKU)</span>
                <span className="font-mono font-bold text-indigo-900 text-xs truncate block">{order.tradeAdmission?.sku || `${order.brand} / ${order.country} / ${order.currency} / Physical / Fast / $${order.faceValue}`}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">是否允许交易 (Trade Allowed)</span>
                <span className="font-bold text-emerald-700 text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">check_circle</span>
                  {order.tradeAdmission?.tradeAllowed !== false ? '允许交易' : '禁止交易'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">面值合法性 (Denomination Result)</span>
                <span className="font-semibold text-slate-800 text-xs">{order.tradeAdmission?.denominationResult || '合法在册 ($500.00 允许)'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">卡码格式 (Code Format Result)</span>
                <span className="font-semibold text-slate-800 text-xs">{order.tradeAdmission?.codeFormatResult || '16位标准正则匹配成功'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">通道维护状态 (Maintenance Status)</span>
                <span className="font-semibold text-slate-800 text-xs">{order.tradeAdmission?.maintenanceStatus || '管道服务正常 (未维护)'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">质押规则要求 (Pledge Rule)</span>
                <span className="font-semibold text-slate-800 text-xs">{order.tradeAdmission?.pledgeRule || '要求保证金足额 ($500.00)'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">用户确认状态 (User Confirmed)</span>
                <span className="font-bold text-blue-700 text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">done_all</span>
                  {order.tradeAdmission?.userConfirmed !== false ? '已勾选确认特殊规则协议' : '未确认'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">校验时间戳 (Check Time)</span>
                <span className="font-mono text-slate-800 text-xs">{order.tradeAdmission?.checkTime || order.time}</span>
              </div>
            </div>

            <div className="p-2.5 bg-blue-50/60 border border-blue-200/80 rounded-lg text-[11px] text-blue-800 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-blue-600">info</span>
              <span>记录用户提交卡单时系统实时展示给用户的校验结论与提示协议，主要用于客诉举证与责任追溯。</span>
            </div>
          </section>
        )}

        {/* 分区 3: 卡信息 */}
        {(activePartition === 'all' || activePartition === 'card') && (
          <section className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-[18px]">pin</span>
                <span className="font-bold text-slate-900 text-sm">卡信息（敏感信息按权限脱敏）</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleCodeMask}
                  className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    isMaskedCode
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                      : 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">{isMaskedCode ? 'visibility' : 'visibility_off'}</span>
                  <span>{isMaskedCode ? '解密明文 (需审计授权)' : '恢复脱敏掩码'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">卡种与品牌 (Brand)</span>
                <span className="font-bold text-slate-900 text-sm">{order.brand}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">发卡国家/地区 (Country)</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{order.countryFlag || '🌍'}</span>
                  <span className="font-bold text-slate-900 text-sm">{order.countryName || order.country}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">申报面额 (Face Value)</span>
                <span className="font-mono font-bold text-slate-900 text-base">
                  ${order.faceValue.toFixed(2)} <span className="text-xs font-normal text-slate-500">{order.currency}</span>
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">卡密凭证介质形态</span>
                <span className="font-semibold text-slate-800 text-xs">{order.mediaType}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-900 text-white rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-400 uppercase font-semibold">Card Code / PIN 码:</span>
                  <span className="font-mono text-base font-bold text-emerald-400 tracking-wider">
                    {isMaskedCode ? order.maskedCode : (order.fullCode || order.cardPin || 'X72K-99PW-QQ82-41MN')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => copyToClipboard(isMaskedCode ? order.maskedCode : (order.fullCode || order.cardPin || ''), '卡密代码')}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-[15px]">content_copy</span>
                <span>复制卡密</span>
              </button>
            </div>
          </section>
        )}

        {/* Card Check */}
        {(activePartition === 'all' || activePartition === 'card_check') && (
          <section className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">fact_check</span>
                <span className="font-bold text-slate-900 text-sm">Card Check（卡密官方/通道验真）</span>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {order.cardCheckDetails?.status || '有效足额'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">查询时间戳 (Check Time)</span>
                <span className="font-mono font-bold text-slate-900 text-xs">{order.cardCheckDetails?.checkTime || order.time}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">查验实际余额 (Balance)</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">{order.cardCheckDetails?.balance || `$${order.faceValue}.00 ${order.currency}`}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">查验数据来源 (Source)</span>
                <span className="font-semibold text-slate-800 text-xs">{order.cardCheckDetails?.source || '官方直连API'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">查验状态结论 (Status)</span>
                <span className="font-bold text-slate-900 text-xs">{order.cardCheckDetails?.status || '有效足额'}</span>
              </div>
            </div>
          </section>
        )}

        {/* 风控引擎与重复卡规则 (1.2.5) */}
        {(activePartition === 'all' || activePartition === 'risk') && (
          <section className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-[18px]">shield</span>
                <span className="font-bold text-slate-900 text-sm">风控引擎诊断 & 重复卡规则</span>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                风险等级: {order.riskDetails?.riskLevel || order.riskStatusLabel}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">风险评分与等级</span>
                <span className="font-mono font-bold text-slate-900 text-base">{order.riskDetails?.riskScore ?? 12} 分</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">风控处理结果</span>
                <span className="font-bold text-xs inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {order.riskDetails?.result || '放行通过'}
                </span>
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-200 space-y-1">
                <span className="text-indigo-600 text-[11px] block">重复卡检测机制</span>
                <span className="font-semibold text-slate-900 text-xs">
                  {order.duplicateCardDetails?.isDuplicate ? '⚠️ 识别为 24h 内重复提交卡' : '✅ 首提交卡 (无重复)'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {order.duplicateCardDetails?.ruleDecision || '规则决策: 优先派给原商户，防止跨商户扫卡争端'}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* 派单过程与候选商户 (1.2.3 & 1.2.4) */}
        {(activePartition === 'all' || activePartition === 'dispatch') && (
          <section className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-[18px]">route</span>
                <span className="font-bold text-slate-900 text-sm">派单过程与候选商户决策表</span>
              </div>
              <button
                onClick={() => setShowTransferModal(true)}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold cursor-pointer"
              >
                触发手动转单
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 text-xs space-y-1">
              <div className="flex items-center justify-between font-mono text-slate-700">
                <span>派单时间: {order.dispatchRecord?.dispatchTime || order.time}</span>
                <span>派单策略: {order.dispatchRecord?.strategyName || '综合最高报价与高履约分智能路由'}</span>
                <span>最终选择: <strong className="text-blue-700">{order.merchantName} ({order.merchantMid})</strong></span>
              </div>
            </div>

            {/* 候选商户明细表 */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold text-[11px]">
                    <th className="py-2 px-3">商户</th>
                    <th className="py-2 px-3">SKU承接</th>
                    <th className="py-2 px-3">积点/保证金</th>
                    <th className="py-2 px-3">当前负载</th>
                    <th className="py-2 px-3">商户报价</th>
                    <th className="py-2 px-3">履约分</th>
                    <th className="py-2 px-3">风险承接</th>
                    <th className="py-2 px-3">派单结果</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {(order.dispatchRecord?.candidates || [
                    { merchantName: order.merchantName, merchantMid: order.merchantMid, skuAccepted: true, stakingStatus: '足够 ($120,000 PTS)', currentLoad: '12/50', quoteRate: order.merchantRate, fulfillmentScore: 96, riskHandlingSupport: true, result: '选中' },
                    { merchantName: '环球数码极速兑付 (M0088)', merchantMid: 'M0088', skuAccepted: true, stakingStatus: '足够 ($85,000 PTS)', currentLoad: '50/50 (满载)', quoteRate: order.merchantRate + 0.3, fulfillmentScore: 92, riskHandlingSupport: true, result: '排除 (满载)' },
                    { merchantName: '星辰跨境收卡组 (M0102)', merchantMid: 'M0102', skuAccepted: true, stakingStatus: '不足 ($50 PTS)', currentLoad: '0/20', quoteRate: order.merchantRate - 1.2, fulfillmentScore: 84, riskHandlingSupport: false, result: '排除 (积点不足)' }
                  ]).map((cand: DispatchCandidate, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-2 px-3 font-semibold text-slate-900">{cand.merchantName}</td>
                      <td className="py-2 px-3 font-mono">{cand.skuAccepted ? '✅ 支持' : '❌ 不支持'}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{cand.stakingStatus}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{cand.currentLoad}</td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">{cand.quoteRate}%</td>
                      <td className="py-2 px-3 font-mono text-emerald-700 font-bold">{cand.fulfillmentScore} 分</td>
                      <td className="py-2 px-3 font-mono">{cand.riskHandlingSupport ? '支持' : '不支持'}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          cand.result === '选中' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {cand.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 历史转单记录履历 */}
            {(order.orderTransferLogs || []).length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-amber-600">history_toggle_off</span>
                  转单履历存证 (Transfer History)
                </span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-amber-50/50 text-slate-600 font-semibold text-[10px]">
                        <th className="py-1.5 px-2">转单时间</th>
                        <th className="py-1.5 px-2">原商户 ➔ 新商户</th>
                        <th className="py-1.5 px-2">原报价 ➔ 新报价</th>
                        <th className="py-1.5 px-2">价差 / 平台承担</th>
                        <th className="py-1.5 px-2">转单原因</th>
                        <th className="py-1.5 px-2">模式 / 操作人</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-mono">
                      {order.orderTransferLogs?.map((tr, idx) => (
                        <tr key={tr.id || idx}>
                          <td className="py-1.5 px-2 text-slate-500">{tr.transferTime}</td>
                          <td className="py-1.5 px-2 font-semibold text-slate-900">{tr.originalMerchantName} ➔ {tr.newMerchantName}</td>
                          <td className="py-1.5 px-2 text-slate-800">{tr.originalRate}% ➔ {tr.newRate}%</td>
                          <td className="py-1.5 px-2 text-rose-700 font-bold">{tr.priceGapRate}% / ${tr.platformLossAmount}</td>
                          <td className="py-1.5 px-2 text-slate-700">{tr.transferReason}</td>
                          <td className="py-1.5 px-2 text-slate-600">{tr.operationMode} ({tr.operator})</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 报价模型 */}
        {(activePartition === 'all' || activePartition === 'quote') && (
          <section className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">request_quote</span>
                <span className="font-bold text-slate-900 text-sm">报价与价差模型</span>
              </div>
              <span className="font-mono font-bold text-xs text-emerald-700">
                平台毛利率: {order.marginPercent}% (+${order.marginAmount.toFixed(2)})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 space-y-1">
                <span className="text-blue-600 text-[11px] block">用户报价 (User Quote)</span>
                <span className="font-mono font-bold text-slate-900 text-base">{order.userRate.toFixed(1)}%</span>
                <span className="text-[11px] font-mono text-slate-600 block">买入价: ${order.userPrice.toFixed(2)}</span>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200 space-y-1">
                <span className="text-emerald-600 text-[11px] block">商户报价 (Merchant Quote)</span>
                <span className="font-mono font-bold text-slate-900 text-base">{order.merchantRate.toFixed(1)}%</span>
                <span className="text-[11px] font-mono text-slate-600 block">承接价: ${order.merchantPrice.toFixed(2)}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">市场参考报价</span>
                <span className="font-mono font-bold text-slate-800 text-base">{order.quoteDetails?.marketRefRate?.toFixed(1) || '87.5'}%</span>
              </div>

              <div className="p-3 bg-purple-50/60 rounded-lg border border-purple-200 space-y-1">
                <span className="text-purple-600 text-[11px] block">平台净收益</span>
                <span className="font-mono font-bold text-base text-purple-700">${order.marginAmount.toFixed(2)} USD</span>
              </div>
            </div>
          </section>
        )}

        {/* 商户履约 */}
        {(activePartition === 'all' || activePartition === 'fulfillment') && (
          <section className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-[18px]">storefront</span>
                <span className="font-bold text-slate-900 text-sm">商户履约</span>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                履约状态: {order.merchantFulfillment?.result || '核销成功'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">承接商户</span>
                <span className="font-bold text-slate-900 text-sm">{order.merchantName}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">商户接卡时间</span>
                <span className="font-mono font-bold text-slate-800 text-xs">{order.merchantFulfillment?.acceptTime || order.time}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">处理完成时间</span>
                <span className="font-mono font-bold text-slate-800 text-xs">{order.merchantFulfillment?.fulfillTime || '15:32:34'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">履约结果</span>
                <span className="font-bold text-emerald-700 text-xs">{order.merchantFulfillment?.result || '核销成功'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">处理结果来源</span>
                <span className={`font-bold text-xs ${order.processCompletionSource === '系统超时自动成功' ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {order.processCompletionSource || '商户提交成功'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">做卡时限规则快照</span>
                <span className="font-bold text-slate-800 text-xs block">
                  {order.processingRuleSnapshot ? `${order.processingRuleSnapshot.source} · ${order.processingRuleSnapshot.durationMinutes} 分钟` : '平台默认 · 15 分钟'}
                </span>
                <span className="font-mono text-[10px] text-slate-500 block">
                  截止 {order.processingRuleSnapshot?.deadline || '未记录'}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* 财务清算 */}
        {(activePartition === 'all' || activePartition === 'finance') && (
          <section className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">payments</span>
                <span className="font-bold text-slate-900 text-sm">财务对账与清算损益</span>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {order.financialDetails?.isSettled ? '已完成清算结算' : '结算清算挂起中'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">交易金额</span>
                <span className="font-mono font-bold text-slate-900 text-base">${order.userPrice} {order.currency}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">交易成本</span>
                <span className="font-mono font-bold text-slate-800 text-base">${order.userPrice}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">平台毛利</span>
                <span className="font-mono font-bold text-emerald-700 text-base">+${order.marginAmount}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">异常损失</span>
                <span className="font-mono font-bold text-slate-700 text-base">$0.00</span>
              </div>
            </div>
          </section>
        )}

        {/* 售后争议 */}
        {(activePartition === 'all' || activePartition === 'after_sale') && (
          <section className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600 text-[18px]">gavel</span>
                <span className="font-bold text-slate-900 text-sm">售后争议与责任判定</span>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {order.afterSaleStatusLabel || '无售后'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">售后状态</span>
                <span className="font-bold text-slate-900 text-sm">{order.afterSaleStatusLabel || '无售后争议'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">争议原因主张</span>
                <span className="font-medium text-slate-800 text-xs">{order.afterSaleDetails?.disputeReason || '暂无争议诉求'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">责任认定结果</span>
                <span className="font-bold text-purple-700 text-sm">{order.afterSaleDetails?.liabilityResult || '无责任'}</span>
              </div>
            </div>
          </section>
        )}

        {/* 敏感字段人工修改审计记录 (1.2.6) */}
        {(order.fieldEditAuditLogs || []).length > 0 && (
          <section className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-800 text-[18px]">edit_note</span>
                <span className="font-bold text-slate-900 text-sm">敏感字段人工修改审计记录</span>
              </div>
              <span className="font-mono text-xs text-slate-500">共 {order.fieldEditAuditLogs?.length} 条修改日志</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold text-[11px]">
                    <th className="py-2 px-3">修改时间</th>
                    <th className="py-2 px-3">操作人</th>
                    <th className="py-2 px-3">修改敏感字段</th>
                    <th className="py-2 px-3">原值 ➔ 新值</th>
                    <th className="py-2 px-3">修改原因</th>
                    <th className="py-2 px-3">证据/附件说明</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {order.fieldEditAuditLogs?.map((editLog, idx) => (
                    <tr key={editLog.id || idx} className="hover:bg-slate-50/60">
                      <td className="py-2 px-3 font-mono text-slate-600">{editLog.editTime}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{editLog.operator}</td>
                      <td className="py-2 px-3 font-bold text-blue-700">{editLog.fieldName}</td>
                      <td className="py-2 px-3 font-mono text-slate-800">{editLog.originalValue} ➔ <strong className="text-emerald-700">{editLog.newValue}</strong></td>
                      <td className="py-2 px-3 text-slate-700">{editLog.reason}</td>
                      <td className="py-2 px-3 text-slate-600">{editLog.evidenceDetails}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* 事件时间轴 (1.2.7) */}
        {(activePartition === 'all' || activePartition === 'event_logs') && (
          <section className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-700 text-[18px]">history</span>
                <span className="font-bold text-slate-900 text-sm">卡单事件时间轴 (Event Timeline)</span>
              </div>
              <span className="font-mono text-xs text-slate-500">
                完整记录关键业务事件存证
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold text-[11px]">
                    <th className="py-2 px-3">时间</th>
                    <th className="py-2 px-3">操作人 / 系统</th>
                    <th className="py-2 px-3">原状态 / 动作</th>
                    <th className="py-2 px-3">变更后状态</th>
                    <th className="py-2 px-3">事件说明与 TraceID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {(order.stateEventLogs || []).map((log, idx) => (
                    <tr key={log.id || idx} className="hover:bg-slate-50/60">
                      <td className="py-2 px-3 font-mono text-slate-600">{log.time}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{log.operator}</td>
                      <td className="py-2 px-3 font-mono text-slate-500">{log.fromState}</td>
                      <td className="py-2 px-3">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {log.toState}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-700">
                        <div>{log.reason}</div>
                        <div className="font-mono text-[10px] text-slate-400 mt-0.5">{log.traceId}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {/* 转单 / 重新派单模态框 (1.2.4) */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600 text-[20px]">swap_horiz</span>
                <span className="font-bold text-slate-900 text-sm">卡单转单 / 重新派单</span>
              </div>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">转单触发场景 / 原因</label>
                <select
                  value={transferReason}
                  onChange={e => setTransferReason(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium outline-none focus:border-blue-500"
                >
                  <option value="商户拒单">商户拒单</option>
                  <option value="商户超时">商户超时</option>
                  <option value="商户处理失败">商户处理失败</option>
                  <option value="商户积点不足">商户积点不足</option>
                  <option value="商户临时停止接单">商户临时停止接单</option>
                  <option value="不具备实际承接能力">当前商户不具备实际承接能力</option>
                  <option value="人工判断转单">人工判断需要转单</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">重新筛选备选新商户</label>
                <select
                  value={selectedTargetMerchantMid}
                  onChange={e => setSelectedTargetMerchantMid(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium outline-none focus:border-blue-500"
                >
                  {candidateMerchantPool.map(m => (
                    <option key={m.mid} value={m.mid}>
                      {m.name} · 报价 {m.rate}% · 质押 {m.pts} · 负载 {m.load}
                    </option>
                  ))}
                </select>
              </div>

              {/* 损失阈值计算卡片 */}
              {(() => {
                const targetMerch = candidateMerchantPool.find(m => m.mid === selectedTargetMerchantMid) || candidateMerchantPool[0];
                const origRate = order.merchantRate || 89.2;
                const newRate = targetMerch.rate;
                const gapRate = Math.abs(origRate - newRate);
                const platformLoss = (order.faceValue * gapRate) / 100;
                const isLossExceeded = platformLoss > 2.0;

                return (
                  <div className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                    isLossExceeded ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}>
                    <div className="font-bold flex items-center justify-between">
                      <span>价差与平台损失计算:</span>
                      <span>{isLossExceeded ? '⚠️ 超过 $2.00 损失阈值 (需财务确认)' : '✅ 正常差价区间 (自动转单)'}</span>
                    </div>
                    <div className="font-mono text-[11px] flex justify-between pt-1 border-t border-slate-200/50">
                      <span>原报价: {origRate}% ➔ 新报价: {newRate}%</span>
                      <span>价差: {gapRate.toFixed(2)}% (${platformLoss.toFixed(2)})</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setShowTransferModal(false)} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer">
                取消
              </button>
              <button onClick={handleExecuteTransfer} className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs cursor-pointer">
                确认转单并重新派单
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 敏感字段修改模态框 (1.2.6 Step 1) */}
      {showSensitiveEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-800 text-[20px]">edit_note</span>
                <span className="font-bold text-slate-900 text-sm">卡单敏感字段人工修改</span>
              </div>
              <button onClick={() => setShowSensitiveEditModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">选择敏感字段 (禁止直接覆盖)</label>
                <select
                  value={editFieldName}
                  onChange={e => setEditFieldName(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium outline-none focus:border-blue-500"
                >
                  <option value="卡种">卡种 (Brand)</option>
                  <option value="国家">国家 (Country)</option>
                  <option value="面额">面额 (Denomination)</option>
                  <option value="Card Code">Card Code 关联信息</option>
                  <option value="商户">商户 (Merchant)</option>
                  <option value="订单状态">订单状态 (Txn Status)</option>
                  <option value="风险结果">风险结果 (Risk Result)</option>
                  <option value="失败结果">失败结果 (Failure Cause)</option>
                  <option value="关闭状态">关闭状态 (Closed Status)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">修改后的新值</label>
                <input
                  type="text"
                  value={editNewValue}
                  onChange={e => setEditNewValue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                  placeholder="请输入修正后的新值"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">修改原因 (必填)</label>
                <textarea
                  value={editReason}
                  onChange={e => setEditReason(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500"
                  placeholder="请输入修改的具体业务逻辑与原因"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">证据 / 附件说明 (必填)</label>
                <textarea
                  value={editEvidence}
                  onChange={e => setEditEvidence(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500"
                  placeholder="例如：官方小票扫描件工单凭证 #AUD-88210"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setShowSensitiveEditModal(false)} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer">
                取消
              </button>
              <button onClick={handleStepToSecondaryConfirm} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs cursor-pointer">
                下一步 · 提交二次确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 敏感字段二次确认模态框 (1.2.6 Step 2) */}
      {showSecondaryConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-rose-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-rose-700 pb-2 border-b border-rose-100">
              <span className="material-symbols-outlined text-[22px]">warning</span>
              <span className="font-bold text-sm">敏感字段修改 · 高风险二次确认</span>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <p>您正在人工修改卡单敏感字段 <strong className="text-slate-900 underline">{editFieldName}</strong>：</p>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] space-y-1">
                <div>修正字段: {editFieldName}</div>
                <div>修改新值: <span className="text-emerald-700 font-bold">{editNewValue}</span></div>
                <div>修改原因: {editReason}</div>
                <div>证据存证: {editEvidence}</div>
              </div>
              <p className="text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 text-[11px]">
                ⚠️ 警示：提交后原值与新值将永久存证于卡单审计链条，无法二次篡改。
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => { setShowSecondaryConfirmModal(false); setShowSensitiveEditModal(true); }} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer">
                返回修改
              </button>
              <button onClick={handleConfirmSensitiveEdit} className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs cursor-pointer">
                确认授权修改并写入审计链
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 状态机流转模态框 */}
      {showStateChangeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">alt_route</span>
                <span className="font-bold text-slate-900 text-sm">推进交易状态机 · 写入事件日志</span>
              </div>
              <button onClick={() => setShowStateChangeModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 flex justify-between items-center">
                <span className="text-slate-500">当前卡单状态:</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {order.txnStatusLabel || order.txnStatus}
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">目标流转状态</label>
                <select
                  value={targetNextState}
                  onChange={e => setTargetNextState(e.target.value as TransactionStatusCode)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium outline-none focus:border-blue-500"
                >
                  <optgroup label="主链路">
                    <option value="created">已创建 (created)</option>
                    <option value="precheck">预检中 (precheck)</option>
                    <option value="pending">待处理 (pending)</option>
                    <option value="waiting_merchant">待商户接单 (waiting_merchant)</option>
                    <option value="merchant_processing">商户处理中 (merchant_processing)</option>
                    <option value="completed">已完成 (completed)</option>
                  </optgroup>
                  <optgroup label="分支路径">
                    <option value="precheck_anomaly">预检异常 ➔ 待人工确认 (precheck_anomaly)</option>
                    <option value="merchant_rejected">商户拒单 ➔ 待转单 (merchant_rejected)</option>
                    <option value="merchant_failed">商户失败 ➔ 异常处理中 (merchant_failed)</option>
                    <option value="disputing">用户争议 ➔ 售后中 (disputing)</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">状态变更原因 (写入审计日志)</label>
                <textarea
                  value={stateChangeReason}
                  onChange={e => setStateChangeReason(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500"
                  placeholder="请输入变更原因"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setShowStateChangeModal(false)} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer">
                取消
              </button>
              <button onClick={handleConfirmStateChange} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs cursor-pointer">
                确认流转并写入日志
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
