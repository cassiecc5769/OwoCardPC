import React, { useState, useMemo } from 'react';
import { NavPath } from '../../types';
import {
  CapabilityCode,
  CallerType,
  CallScene,
  QueryResultCode,
  CardQueryInput,
  CardQueryOutput,
  QueryOrderPreset,
  CAPABILITY_MAP,
  CALL_SCENE_MAP
} from './types';
import {
  INITIAL_TOOLS,
  MOCK_QUERY_PRESET_ORDERS,
  INITIAL_QUERY_HISTORY
} from './mockCardToolsData';

interface CardQueryViewProps {
  currentPath?: NavPath;
  onNavigate?: (path: NavPath) => void;
  initialOrderId?: string;
}

export const CardQueryView: React.FC<CardQueryViewProps> = ({
  onNavigate,
  initialOrderId
}) => {
  const [historyRecords, setHistoryRecords] = useState<CardQueryOutput[]>(INITIAL_QUERY_HISTORY);
  const [selectedOutput, setSelectedOutput] = useState<CardQueryOutput | null>(INITIAL_QUERY_HISTORY[0]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 输入表单状态 (统一输入 )
  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialOrderId || 'ORD-20261005-8801');
  const [brand, setBrand] = useState<string>('Apple');
  const [country, setCountry] = useState<string>('US');
  const [currency, setCurrency] = useState<string>('USD');
  const [cardCode, setCardCode] = useState<string>('X892-F91A-9811-QQ01');
  const [pin, setPin] = useState<string>('9821');
  const [showPlainCode, setShowPlainCode] = useState<boolean>(false);
  const [declaredValue, setDeclaredValue] = useState<string>('100');
  const [cardId, setCardId] = useState<string>('CRD-20261005-001');
  const [orderId, setOrderId] = useState<string>('ORD-20261005-8801');
  const [merchantId, setMerchantId] = useState<string>('MID-M01');
  const [callerType, setCallerType] = useState<CallerType>('PLATFORM_CS');
  const [callerId, setCallerId] = useState<string>('客服专员 (王芳 · CS03)');
  const [callScene, setCallScene] = useState<CallScene>('PLATFORM_REVIEW');
  const [selectedCapability, setSelectedCapability] = useState<CapabilityCode>('BALANCE_CHECK');

  // 快充目标账号 (FAST_REDEEM)
  const [targetAccount, setTargetAccount] = useState<string>('steve.jobs.test@gmail.com');

  // 查询执行中状态
  const [isQuerying, setIsQuerying] = useState<boolean>(false);

  // 敏感操作二次确认弹窗 (FAST_REDEEM / CODE_COMPLETE / 明文查看)
  const [showSensitiveModal, setShowSensitiveModal] = useState<boolean>(false);
  const [sensitiveActionType, setSensitiveActionType] = useState<'FAST_REDEEM' | 'CODE_COMPLETE' | 'VIEW_PLAIN'>('FAST_REDEEM');
  const [sensitiveReason, setSensitiveReason] = useState<string>('审批单 #OA-20261006-8801: 售后客户申请代充');
  const [sensitiveApprover, setSensitiveApprover] = useState<string>('风控主管 (李雷)');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // 根据选中的 Brand + Country 动态计算当前可用能力 (16.3.2 动态加载)
  const availableCapabilities = useMemo(() => {
    const matchingTools = INITIAL_TOOLS.filter(
      t => t.brand === brand && (t.country === country || t.country === 'Global') && t.status === 'ENABLED'
    );
    const caps = Array.from(new Set(matchingTools.map(t => t.capability)));
    // 保证至少有 BALANCE_CHECK
    if (caps.length === 0) return ['BALANCE_CHECK' as CapabilityCode];
    return caps;
  }, [brand, country]);

  // 当可用能力变化时，如果当前选中的能力不在列表中，自动重置为第一个
  React.useEffect(() => {
    if (!availableCapabilities.includes(selectedCapability)) {
      setSelectedCapability(availableCapabilities[0] || 'BALANCE_CHECK');
    }
  }, [availableCapabilities, selectedCapability]);

  // 快捷从卡单预设导入 (16.3.1)
  const handleSelectPresetOrder = (presetOrderId: string) => {
    setSelectedPresetId(presetOrderId);
    const preset = MOCK_QUERY_PRESET_ORDERS.find(p => p.orderId === presetOrderId);
    if (preset) {
      setBrand(preset.brand);
      setCountry(preset.country);
      setCurrency(preset.currency);
      setCardCode(preset.cardCode);
      setPin(preset.pin || '');
      setDeclaredValue(String(preset.declaredValue));
      setCardId(preset.cardId);
      setOrderId(preset.orderId);
      setCallScene(preset.scene);
      showToast(`已从卡单 [${preset.orderId}] 自动带入卡密与上下文信息！`);
    }
  };

  // 执行单卡统一作业查询
  const handleExecuteQuery = (e?: React.FormEvent, overrideSource?: string) => {
    if (e) e.preventDefault();
    if (!cardCode.trim()) {
      showToast('请输入有效的卡号 / 卡密！');
      return;
    }

    // 若触发敏感能力且未经过二次确认
    if ((selectedCapability === 'FAST_REDEEM' || selectedCapability === 'CODE_COMPLETE') && !showSensitiveModal) {
      setSensitiveActionType(selectedCapability);
      setShowSensitiveModal(true);
      return;
    }

    setIsQuerying(true);
    const targetTool = INITIAL_TOOLS.find(
      t => t.brand === brand && t.capability === selectedCapability && t.status === 'ENABLED'
    ) || INITIAL_TOOLS[0];

    setTimeout(() => {
      setIsQuerying(false);
      const decVal = parseFloat(declaredValue) || 100;
      let resCode: QueryResultCode = 'SUCCESS';
      let balance = decVal;
      let cardStatus = 'Active (未兑换)';
      let msg = '官方直连查验通过，卡密状态有效，可用余额足额。';
      let errCode: string | undefined = undefined;
      let extOrdId: string | undefined = undefined;
      let extOrdStatus: string | undefined = undefined;
      let candidates: string[] | undefined = undefined;

      // 模拟各种典型业务场景
      if (selectedCapability === 'FAST_REDEEM') {
        resCode = 'SUCCESS';
        balance = 0;
        cardStatus = 'Redeemed (快充已核销)';
        msg = `快充成功！已充入目标账户 [${targetAccount}]，金额 $${decVal}.00 USD。`;
      } else if (selectedCapability === 'CODE_COMPLETE') {
        resCode = 'SUCCESS';
        candidates = [`${cardCode.slice(0, 8)}7712${cardCode.slice(-4)}`, `${cardCode.slice(0, 8)}8821${cardCode.slice(-4)}`];
        msg = '卡码 AI 补全算法执行完成，检出 2 个高置信度候选卡码。';
      } else if (selectedCapability === 'ORDER_CHECK') {
        resCode = 'SUCCESS';
        extOrdId = `MH0981${Math.floor(100000 + Math.random() * 900000)}`;
        extOrdStatus = 'COMPLETED (已完成)';
        balance = 0;
        cardStatus = 'Redeemed';
        msg = `成功调取官方消费订单凭据：订单号 ${extOrdId}，已于 2 小时前完成内购扣款。`;
      } else if (cardCode.includes('ZERO') || cardCode.includes('0000')) {
        resCode = 'BUSINESS_EXCEPTION';
        balance = 0;
        cardStatus = 'Redeemed (已兑换)';
        msg = '工具正常查验返回：官方已核销兑换，可用余额为 $0.00 (提单前已消费)';
        errCode = 'ERR_CARD_ALREADY_REDEEMED';
      } else if (cardCode.includes('DIFF') || cardCode.includes('50')) {
        resCode = 'DATA_MISMATCH';
        balance = decVal / 2;
        cardStatus = 'Active (部分余额)';
        msg = `数据不一致：用户申报面额 $${decVal}.00，实际官方查验余额仅 $${decVal / 2}.00 (少充)`;
      } else if (cardCode.includes('TIMEOUT') || cardCode.includes('ERR')) {
        resCode = 'TOOL_ERROR';
        balance = 0;
        cardStatus = 'Query Failed (通道异常)';
        msg = '主网关响应超时 504 (5000ms)，已触发备用源 Failover 重试';
        errCode = 'ERR_GATEWAY_TIMEOUT_504';
      }

      const newOutput: CardQueryOutput = {
        requestId: `REQ-${Date.now().toString().slice(-8)}`,
        toolId: targetTool.toolId,
        resultCode: resCode,
        resultMessage: msg,
        balance,
        currency,
        cardStatus,
        externalOrderId: extOrdId,
        externalOrderStatus: extOrdStatus,
        source: overrideSource || targetTool.source,
        queryTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
        durationMs: Math.floor(800 + Math.random() * 600),
        errorCode: errCode,
        rawResultRef: `0x${Math.random().toString(16).slice(2, 10).toUpperCase()}_QUERY_EVIDENCE_SIG`,
        isMismatch: resCode === 'DATA_MISMATCH',
        writtenBackToOrder: false,
        cardCandidates: candidates,
        targetAccount: selectedCapability === 'FAST_REDEEM' ? targetAccount : undefined
      };

      setSelectedOutput(newOutput);
      setHistoryRecords(prev => [newOutput, ...prev]);
      showToast(`单卡查验完成！判定结果：[${resCode}]`);
    }, 650);
  };

  // 确认敏感操作并执行
  const handleConfirmSensitiveAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sensitiveReason.trim()) {
      showToast('必须填写敏感操作原因与审批单号！');
      return;
    }
    setShowSensitiveModal(false);
    if (sensitiveActionType === 'VIEW_PLAIN') {
      setShowPlainCode(true);
      showToast('已查看明文卡密，该操作已记录至安全审计日志！');
    } else {
      handleExecuteQuery();
    }
  };

  // 一键回写卡单
  const handleWriteBackToOrder = (output: CardQueryOutput) => {
    const updated = { ...output, writtenBackToOrder: true };
    setSelectedOutput(updated);
    setHistoryRecords(prev => prev.map(r => r.requestId === output.requestId ? updated : r));
    showToast(`✅ 已将本次查询事实凭据 (${output.requestId}) 自动写入卡单 [${orderId}] 时间轴存证！`);
  };

  // 一键重试或切备源 (Failover)
  const handleRetryOrFailover = (isBackup: boolean) => {
    showToast(isBackup ? '正在切换 Backup 备用通道并重新查询...' : '正在原通道重新发起 Retry 查询...');
    handleExecuteQuery(undefined, isBackup ? 'US Retail Aggregator Backup Source' : undefined);
  };

  return (
    <div className="space-y-4 text-xs text-slate-800 antialiased pb-12">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-16 right-8 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 backdrop-blur-md animate-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
          <span className="font-medium">{toastMsg}</span>
        </div>
      )}

      {/* 模块 Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0">
            <span className="material-symbols-outlined text-[22px]">search</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-slate-900 text-sm">卡查询（Card Query 平台统一查验作业入口）</h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-[10px] font-bold border border-blue-200">
                标准作业工作台
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              为客服/运营提供卡单核实、异常处理、售后争议与风控复核的统一入口。根据 <strong className="text-slate-700">Brand + Country + 权限</strong> 动态加载能力，结果分类明确、敏感操作全审计。
            </p>
          </div>
        </div>

        {/* 快速导入卡单关联选择器 (16.3.1) */}
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 font-sans">
          <span className="material-symbols-outlined text-blue-600 text-[18px]">link</span>
          <span className="text-slate-500 font-semibold text-xs">卡单关联带入:</span>
          <select
            value={selectedPresetId}
            onChange={e => handleSelectPresetOrder(e.target.value)}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
          >
            {MOCK_QUERY_PRESET_ORDERS.map(preset => (
              <option key={preset.orderId} value={preset.orderId}>
                {preset.orderId} · {preset.brand} ${preset.declaredValue} ({preset.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 主工作区：左侧统一输入表单 + 右侧统一输出结果卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ========================================================================= */}
        {/* 左侧：统一输入区域 (Unified Input - )                               */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
                统一输入参数 (Card Query Input)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">标准契约</span>
            </div>

            <form onSubmit={handleExecuteQuery} className="mt-3 space-y-3">
              {/* Brand & Country */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Brand (卡品牌) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="Apple">Apple</option>
                    <option value="Steam">Steam</option>
                    <option value="Target">Target</option>
                    <option value="Sephora">Sephora</option>
                    <option value="Vanilla">Vanilla</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Country (国家) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold font-mono"
                  >
                    <option value="US">US (美国)</option>
                    <option value="Global">Global (全球)</option>
                    <option value="CA">CA (加拿大)</option>
                    <option value="UK">UK (英国)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Currency (币种)</label>
                  <input
                    type="text"
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* 动态加载 Capability 能力按钮组 (16.3.2) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-semibold text-slate-700">
                    动态可用查询能力 (Capability for {brand} {country}) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">根据 Brand+Country 自动匹配</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableCapabilities.map(cap => {
                    const isSelected = selectedCapability === cap;
                    const capMeta = CAPABILITY_MAP[cap];
                    return (
                      <button
                        key={cap}
                        type="button"
                        onClick={() => setSelectedCapability(cap)}
                        className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-50 border-[#004ac6] text-blue-900 shadow-2xs ring-1 ring-[#004ac6]'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs flex items-center gap-1 font-mono">
                            <span className="material-symbols-outlined text-[15px] text-blue-600">
                              {capMeta?.icon || 'handyman'}
                            </span>
                            {cap}
                          </span>
                          {capMeta?.isSensitive && (
                            <span className="px-1 py-0.1 rounded text-[8px] font-bold bg-rose-100 text-rose-700">
                              敏感
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1">{capMeta?.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card Code & PIN */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-700">
                    Card Code (卡码 / 卡密) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!showPlainCode) {
                        setSensitiveActionType('VIEW_PLAIN');
                        setShowSensitiveModal(true);
                      } else {
                        setShowPlainCode(false);
                      }
                    }}
                    className="text-[10px] text-blue-600 hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      {showPlainCode ? 'visibility_off' : 'visibility'}
                    </span>
                    <span>{showPlainCode ? '隐藏明文' : '查看完整明文 (需审批)'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2 relative">
                    <input
                      type={showPlainCode ? 'text' : 'password'}
                      value={cardCode}
                      onChange={e => setCardCode(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono tracking-wider font-bold"
                      placeholder="输入卡号或电子卡密..."
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={pin}
                      onChange={e => setPin(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                      placeholder="PIN 码 (若有)"
                    />
                  </div>
                </div>
              </div>

              {/* 快充特有输入项 */}
              {selectedCapability === 'FAST_REDEEM' && (
                <div className="p-2.5 bg-purple-50/70 border border-purple-200 rounded-lg space-y-1 animate-in fade-in">
                  <label className="block text-[11px] font-bold text-purple-900">
                    快充目标账号 (Target Account / Apple ID / Steam ID) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={targetAccount}
                    onChange={e => setTargetAccount(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs font-mono"
                    placeholder="例如: customer@apple.com"
                    required
                  />
                  <span className="text-[10px] text-purple-700 block">
                    ⚡ 快充将直接向该账号核销充值，请二次核对充值目标。
                  </span>
                </div>
              )}

              {/* 上下文业务字段: Declared Value / Order ID / Card ID / Call Scene */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">申报面额 ($)</label>
                  <input
                    type="number"
                    value={declaredValue}
                    onChange={e => setDeclaredValue(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Card ID</label>
                  <input
                    type="text"
                    value={cardId}
                    onChange={e => setCardId(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-blue-700 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">关联卡单号</label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={e => setOrderId(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">商户号 (MID)</label>
                  <input
                    type="text"
                    value={merchantId}
                    onChange={e => setMerchantId(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-mono"
                  />
                </div>
              </div>

              {/* 调用主体与 7 大场景 (Call Scene) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                    Call Scene (7 大标准调用场景) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={callScene}
                    onChange={e => setCallScene(e.target.value as CallScene)}
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-semibold"
                  >
                    {Object.entries(CALL_SCENE_MAP).map(([key, item]) => (
                      <option key={key} value={key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Caller ID (操作人)</label>
                  <input
                    type="text"
                    value={callerId}
                    onChange={e => setCallerId(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isQuerying}
                  className="w-full py-2.5 bg-[#004ac6] hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs flex items-center justify-center gap-2 transition-all"
                >
                  {isQuerying ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                      <span>Card Tool Service 实时路由查验中...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">search_check</span>
                      <span>执行单卡统一查验 ({brand} · {selectedCapability})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 右侧：统一输出区域 (Unified Output & 异常处理 - / 16.3.4)            */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-3.5 bg-emerald-600 rounded-full"></span>
                统一输出事实凭据 (Card Query Output)
              </span>
              {selectedOutput && (
                <span className="text-[11px] text-slate-400 font-mono">
                  {selectedOutput.requestId} · {selectedOutput.durationMs}ms
                </span>
              )}
            </div>

            {selectedOutput ? (
              <div className="mt-3 space-y-3">
                {/* 5 大统一结果分类 Banner (16.3.4) */}
                <div className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                  selectedOutput.resultCode === 'SUCCESS' ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' :
                  selectedOutput.resultCode === 'BUSINESS_EXCEPTION' ? 'bg-rose-50/80 border-rose-200 text-rose-950' :
                  selectedOutput.resultCode === 'DATA_MISMATCH' ? 'bg-amber-50/80 border-amber-200 text-amber-950' :
                  selectedOutput.resultCode === 'TOOL_ERROR' ? 'bg-purple-50/80 border-purple-200 text-purple-950' :
                  'bg-slate-100 border-slate-200 text-slate-800'
                }`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        selectedOutput.resultCode === 'SUCCESS' ? 'bg-emerald-600 text-white' :
                        selectedOutput.resultCode === 'BUSINESS_EXCEPTION' ? 'bg-rose-600 text-white' :
                        selectedOutput.resultCode === 'DATA_MISMATCH' ? 'bg-amber-600 text-white' :
                        selectedOutput.resultCode === 'TOOL_ERROR' ? 'bg-purple-600 text-white' :
                        'bg-slate-700 text-white'
                      }`}>
                        Result Code: [{selectedOutput.resultCode}]
                      </span>
                      <span className="font-bold text-xs">{selectedOutput.cardStatus}</span>
                    </div>
                    <p className="text-xs mt-1.5 font-medium leading-relaxed">
                      {selectedOutput.resultMessage}
                    </p>
                  </div>
                </div>

                {/* 核心事实指标卡片 */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] font-sans block">实际查验余额</span>
                    <span className={`text-lg font-bold ${
                      selectedOutput.balance === 0 && selectedOutput.resultCode === 'BUSINESS_EXCEPTION' ? 'text-rose-600' : 'text-emerald-700'
                    }`}>
                      ${selectedOutput.balance}.00 {selectedOutput.currency}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] font-sans block">卡状态 (Card Status)</span>
                    <span className="text-xs font-bold text-slate-900 block mt-1">{selectedOutput.cardStatus}</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] font-sans block">底层服务来源 (Source)</span>
                    <span className="text-[10px] font-bold text-blue-700 truncate block mt-1" title={selectedOutput.source}>
                      {selectedOutput.source}
                    </span>
                  </div>
                </div>

                {/* 外部订单/快充/补全扩展信息 */}
                {selectedOutput.externalOrderId && (
                  <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-200 font-mono text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-blue-900 font-bold">
                      <span>外部官方消费订单 (External Order)</span>
                      <span>{selectedOutput.externalOrderStatus}</span>
                    </div>
                    <div className="text-slate-600">订单号: {selectedOutput.externalOrderId}</div>
                  </div>
                )}

                {selectedOutput.cardCandidates && (
                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] space-y-1">
                    <span className="font-bold text-amber-900 block">AI 推荐补全候选卡码:</span>
                    <div className="flex items-center gap-2">
                      {selectedOutput.cardCandidates.map((cand, ci) => (
                        <span key={ci} className="px-2 py-0.5 rounded bg-white border border-amber-300 font-mono font-bold text-amber-900">
                          {cand}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 防伪证据签名哈希 */}
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] font-mono space-y-1">
                  <div className="flex items-center justify-between text-slate-500 font-sans">
                    <span>数字防伪凭证签名 (Raw Result Ref)</span>
                    <span>Tool ID: {selectedOutput.toolId}</span>
                  </div>
                  <div className="text-slate-700 select-all">{selectedOutput.rawResultRef}</div>
                  <div className="text-[10px] text-slate-400">查询时间: {selectedOutput.queryTime} · 耗时: {selectedOutput.durationMs}ms</div>
                </div>

                {/* 异常处置与卡单回写操作栏 (16.3.4 & 16.3.6) */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    {selectedOutput.resultCode === 'TOOL_ERROR' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleRetryOrFailover(false)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-2xs flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[15px]">refresh</span>
                          <span>自动 Retry 重试</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRetryOrFailover(true)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[15px]">alt_route</span>
                          <span>切 Backup 备源</span>
                        </button>
                      </>
                    ) : null}

                    {selectedOutput.resultCode === 'BUSINESS_EXCEPTION' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (onNavigate) onNavigate('risk-monitor');
                          showToast('已将该异常事实转入【风险监控 ➔ 待处理】工作池！');
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
                      >
                        一键流转风控异常单
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleWriteBackToOrder(selectedOutput)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs flex items-center gap-1.5 ${
                      selectedOutput.writtenBackToOrder
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-[#004ac6] hover:bg-blue-700 text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {selectedOutput.writtenBackToOrder ? 'check_circle' : 'note_add'}
                    </span>
                    <span>{selectedOutput.writtenBackToOrder ? '已回写卡单' : '将事实结果回写卡单'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400">
                <span className="material-symbols-outlined text-[36px] text-slate-300">manage_search</span>
                <p className="text-xs mt-1">请在左侧配置参数并点击执行单卡查验</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 历史查验流水存证列表 (16.3.6) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-blue-400">history</span>
            <span className="font-bold text-sm">单卡查询历史记录与防伪存证流水</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">共 {historyRecords.length} 笔查询</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold whitespace-nowrap">
                <th className="py-2.5 px-3">Request ID</th>
                <th className="py-2.5 px-3">Result Code</th>
                <th className="py-2.5 px-3">实际余额</th>
                <th className="py-2.5 px-3">卡状态</th>
                <th className="py-2.5 px-3">服务源 (Source)</th>
                <th className="py-2.5 px-3">查询时间</th>
                <th className="py-2.5 px-3">耗时</th>
                <th className="py-2.5 px-3">卡单回写</th>
                <th className="py-2.5 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {historyRecords.map(rec => (
                <tr
                  key={rec.requestId}
                  onClick={() => setSelectedOutput(rec)}
                  className="hover:bg-blue-50/40 transition-colors cursor-pointer font-sans whitespace-nowrap"
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                    {rec.requestId}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      rec.resultCode === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                      rec.resultCode === 'BUSINESS_EXCEPTION' ? 'bg-rose-100 text-rose-800' :
                      rec.resultCode === 'DATA_MISMATCH' ? 'bg-amber-100 text-amber-800' :
                      rec.resultCode === 'TOOL_ERROR' ? 'bg-purple-100 text-purple-800' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {rec.resultCode}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold">
                    ${rec.balance}.00 {rec.currency}
                  </td>
                  <td className="py-2.5 px-3">
                    {rec.cardStatus}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate" title={rec.source}>
                    {rec.source}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                    {rec.queryTime}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">
                    {rec.durationMs}ms
                  </td>
                  <td className="py-2.5 px-3">
                    {rec.writtenBackToOrder ? (
                      <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                        已回写
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">未回写</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedOutput(rec);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 rounded cursor-pointer"
                    >
                      调阅事实
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 敏感操作二次校验弹窗 (16.3.5) */}
      {showSensitiveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-3.5 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-[20px]">shield_lock</span>
                <h3 className="font-bold text-slate-900 text-sm">敏感操作二次授权校验</h3>
              </div>
              <button
                onClick={() => setShowSensitiveModal(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-slate-600 leading-relaxed">
              您正在尝试执行高风险敏感操作：<strong className="text-rose-600">[{sensitiveActionType}]</strong>。依据平台风控合规要求，必须输入本次操作的业务审批单号与具体原因，该操作将全量计入安全审计日志。
            </p>

            <form onSubmit={handleConfirmSensitiveAction} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  审批单号与使用原因 (Reason & OA Ticket) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={sensitiveReason}
                  onChange={e => setSensitiveReason(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  placeholder="例如: 审批单 #OA-20261006-8801: 售后客户申请代充..."
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">授权审批人 (Approver)</label>
                <input
                  type="text"
                  value={sensitiveApprover}
                  onChange={e => setSensitiveApprover(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSensitiveModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
                >
                  确认授权并执行
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
