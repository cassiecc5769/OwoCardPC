import React, { useState, useMemo } from 'react';
import { PrecheckRecordItem, PrecheckDecision, RiskLevel } from './riskTypes';
import { INITIAL_PRECHECK_DATA } from './mockRiskData';

interface PrecheckRunTabProps {
  showToast: (msg: string) => void;
  onNavigateToTrends?: () => void;
  defaultFilterDecision?: string;
}

export const PrecheckRunTab: React.FC<PrecheckRunTabProps> = ({
  showToast,
  onNavigateToTrends,
  defaultFilterDecision = 'ALL'
}) => {
  const [records, setRecords] = useState<PrecheckRecordItem[]>(INITIAL_PRECHECK_DATA);
  const [selectedRecord, setSelectedRecord] = useState<PrecheckRecordItem | null>(null);
  const [filterDecision, setFilterDecision] = useState<string>(defaultFilterDecision);
  const [filterBrand, setFilterBrand] = useState<string>('ALL');
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 预检运行模拟器状态
  const [simBrand, setSimBrand] = useState<string>('Apple');
  const [simCardCode, setSimCardCode] = useState<string>('X892-F91A-9811-QQ09');
  const [simDeclaredValue, setSimDeclaredValue] = useState<string>('100');
  const [simPin, setSimPin] = useState<string>('8821');
  const [simUser, setSimUser] = useState<string>('UID-88912 (Chinedu Obi)');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<PrecheckRecordItem | null>(null);

  // 重新查卡 / 通道重试
  const handleRetryCheck = (rec: PrecheckRecordItem) => {
    showToast(`已向备用网关通道发起重新查验: ${rec.id}`);
    const updated: PrecheckRecordItem = {
      ...rec,
      decisionResult: 'PASS',
      cardStatus: 'Active',
      queryBalance: rec.declaredValue,
      cardCheckDetail: {
        ...rec.cardCheckDetail,
        isSuccess: true,
        isToolError: false,
        latencyMs: 1200,
        source: 'Secondary Direct Fallback Gateway',
        cardStatusText: '未兑换 (Active)',
        balance: rec.declaredValue
      },
      checkItems: rec.checkItems.map(item => item.key === 'BAL' ? {
        ...item,
        status: 'PASSED',
        resultText: `Active ($${rec.declaredValue})`,
        description: '备用通道重新查验成功，余额有效足额'
      } : item)
    };
    setRecords(prev => prev.map(r => r.id === rec.id ? updated : r));
    if (selectedRecord?.id === rec.id) {
      setSelectedRecord(updated);
    }
  };

  // 执行单卡预检测试
  const handleRunSimulator = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      const decVal = parseFloat(simDeclaredValue) || 100;
      let decResult: PrecheckDecision = 'PASS';
      let qBalance = decVal;
      let cardStat = 'Active';

      // 模拟根据卡号不同特征的判断
      if (simCardCode.includes('ZERO') || simCardCode.includes('0000')) {
        decResult = 'BLOCK';
        qBalance = 0;
        cardStat = 'Redeemed';
      } else if (simCardCode.includes('DIFF') || simCardCode.includes('50')) {
        decResult = 'REVIEW';
        qBalance = decVal / 2;
        cardStat = 'Active';
      } else if (simCardCode.includes('ERR') || simCardCode.includes('TIMEOUT')) {
        decResult = 'CHECK_FAILED';
        qBalance = 0;
        cardStat = 'Query Failed';
      }

      const newRecord: PrecheckRecordItem = {
        id: `CRD-${Date.now().toString().slice(-8)}`,
        orderId: `ORD-${Date.now().toString().slice(-8)}`,
        userId: simUser.split(' ')[0],
        userName: simUser.split(' ')[1]?.replace(/[()]/g, '') || 'Test User',
        userRiskTag: '正常',
        brand: simBrand as any,
        country: 'US',
        cardCodeMasked: `${simCardCode.slice(0, 4)}-****-****-${simCardCode.slice(-4)}`,
        pinMasked: simPin ? `${simPin.slice(0, 2)}**` : undefined,
        declaredValue: decVal,
        queryBalance: qBalance,
        cardStatus: cardStat,
        currency: 'USD',
        duplicateCheck: '正常',
        balanceCheck: qBalance === 0 ? '异常' : '正常',
        faceMatchCheck: qBalance === decVal ? '一致' : '异常',
        userRiskCheck: '正常',
        blacklistCheck: '未命中',
        decisionResult: decResult,
        riskLevel: decResult === 'BLOCK' ? 'HIGH' : decResult === 'REVIEW' ? 'MEDIUM' : 'LOW',
        precheckTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
        defaultAction: decResult === 'PASS'
          ? '正常放行 ➔ 自动撮合'
          : decResult === 'REVIEW'
          ? '人工复核 ➔ 确认面额'
          : decResult === 'BLOCK'
          ? '拦截阻断 ➔ 记录坏卡'
          : '工具异常 ➔ 切换备用源重试',
        cardCheckDetail: {
          balance: qBalance,
          cardStatusText: cardStat,
          source: `${simBrand} Gateway Engine (Live)`,
          checkTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
          isSuccess: decResult !== 'CHECK_FAILED',
          isToolError: decResult === 'CHECK_FAILED',
          latencyMs: 980,
          rawEvidenceSignature: `0x${Math.random().toString(16).slice(2, 10).toUpperCase()}_PRECHECK`
        },
        checkItems: [
          { key: 'DUP', name: '重复卡检查', status: 'PASSED', resultText: '未命中', description: '全库无重复记录' },
          { key: 'BAL', name: '余额/状态检查', status: decResult === 'BLOCK' ? 'FAILED' : decResult === 'CHECK_FAILED' ? 'ERROR' : 'PASSED', resultText: `${cardStat} ($${qBalance})`, description: '官方接口实时查询' },
          { key: 'FACE', name: '面额一致性检查', status: decResult === 'REVIEW' ? 'WARNING' : decResult === 'BLOCK' ? 'FAILED' : 'PASSED', resultText: `申报 $${decVal} / 查验 $${qBalance}`, description: '面额与卡内余额校验' },
          { key: 'RULE', name: '卡种/国家规则', status: 'PASSED', resultText: '符合 US 规范', description: '格式合规' },
          { key: 'USER', name: '用户风险检查', status: 'PASSED', resultText: '信用良好', description: '出卡人无异常标记' },
          { key: 'BLACK', name: '黑名单命中检查', status: 'PASSED', resultText: '未命中', description: '风控黑名单未命中' }
        ]
      };

      setSimResult(newRecord);
      setRecords(prev => [newRecord, ...prev]);
      showToast(`预检运行完成！判定结果为: [${decResult}]`);
    }, 600);
  };

  // 过滤后的预检列表
  const filteredRecords = useMemo(() => {
    return records.filter(item => {
      if (filterDecision !== 'ALL' && item.decisionResult !== filterDecision) return false;
      if (filterBrand !== 'ALL' && item.brand !== filterBrand) return false;
      if (filterRiskLevel !== 'ALL' && item.riskLevel !== filterRiskLevel) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = item.id.toLowerCase().includes(q) || item.orderId.toLowerCase().includes(q);
        const matchUser = item.userName.toLowerCase().includes(q) || item.userId.toLowerCase().includes(q);
        const matchCode = item.cardCodeMasked.toLowerCase().includes(q);
        if (!matchId && !matchUser && !matchCode) return false;
      }
      return true;
    });
  }, [records, filterDecision, filterBrand, filterRiskLevel, searchQuery]);

  return (
    <div className="flex flex-col space-y-4 text-xs text-slate-800 antialiased pb-10">
      {/* 职责说明卡 */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0">
            <span className="material-symbols-outlined text-[22px]">play_circle</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-slate-900 text-sm">预检运行（回答：每笔交易进单时，系统执行了什么检查、得到什么结果？）</h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-[10px] font-bold border border-blue-200">
                运行时预检事实中心
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              实时追踪交易进单的 6 重事实预检流水，支持单卡即时验真与通道异常重试。<strong className="text-purple-700">预检结果统一分为：PASS / REVIEW / BLOCK / CHECK_FAILED 四大状态。</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('已从预检引擎拉取最新实时进单数据流！')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">sync</span>
            <span>刷新预检流</span>
          </button>
        </div>
      </div>

      {/* 四大统一结果定义看板与 CHECK_FAILED 说明 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* 1. PASS */}
        <div
          onClick={() => setFilterDecision('PASS')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            filterDecision === 'PASS' ? 'bg-emerald-50 border-emerald-400 shadow-xs ring-2 ring-emerald-400/30' : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
              PASS 放行通过
            </span>
            <span className="font-mono text-xs font-bold text-emerald-700">
              {records.filter(r => r.decisionResult === 'PASS').length} 笔
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            卡密有效且足额、无重复、无黑名单命中，直接进入撮合派单。
          </p>
        </div>

        {/* 2. REVIEW */}
        <div
          onClick={() => setFilterDecision('REVIEW')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            filterDecision === 'REVIEW' ? 'bg-amber-50 border-amber-400 shadow-xs ring-2 ring-amber-400/30' : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
              REVIEW 人工复核
            </span>
            <span className="font-mono text-xs font-bold text-amber-700">
              {records.filter(r => r.decisionResult === 'REVIEW').length} 笔
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            申报面额与实际查验有微差、新注册用户首单或卡种需二次人工核对。
          </p>
        </div>

        {/* 3. BLOCK */}
        <div
          onClick={() => setFilterDecision('BLOCK')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            filterDecision === 'BLOCK' ? 'bg-rose-50 border-rose-400 shadow-xs ring-2 ring-rose-400/30' : 'bg-white border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
              BLOCK 风险拦截
            </span>
            <span className="font-mono text-xs font-bold text-rose-700">
              {records.filter(r => r.decisionResult === 'BLOCK').length} 笔
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            零余额卡、已兑换卡、撞库重复卡或黑名单硬性拦截，自动阻断。
          </p>
        </div>

        {/* 4. CHECK_FAILED */}
        <div
          onClick={() => setFilterDecision('CHECK_FAILED')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            filterDecision === 'CHECK_FAILED' ? 'bg-purple-50 border-purple-400 shadow-xs ring-2 ring-purple-400/30' : 'bg-white border-purple-200 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">
              CHECK_FAILED 工具异常
            </span>
            <span className="font-mono text-xs font-bold text-purple-700">
              {records.filter(r => r.decisionResult === 'CHECK_FAILED').length} 笔
            </span>
          </div>
          <p className="text-[11px] text-purple-700 mt-2 font-medium">
            ⚠️ <strong>≠ BLOCK</strong>：属于网关超时/接口网络异常，绝不判为坏卡，支持通道重试。
          </p>
        </div>
      </div>

      {/* 预检运行控制台：筛选与快速单卡预检工具 */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            {/* 决策筛选 */}
            <select
              value={filterDecision}
              onChange={e => setFilterDecision(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="ALL">全部预检结果 (PASS / REVIEW / BLOCK / CHECK_FAILED)</option>
              <option value="PASS">PASS (放行通过)</option>
              <option value="REVIEW">REVIEW (人工复核)</option>
              <option value="BLOCK">BLOCK (风险阻断)</option>
              <option value="CHECK_FAILED">CHECK_FAILED (工具异常 · 非BLOCK)</option>
            </select>

            {/* 卡种 */}
            <select
              value={filterBrand}
              onChange={e => setFilterBrand(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="ALL">全部卡种</option>
              <option value="Apple">Apple</option>
              <option value="Steam">Steam</option>
              <option value="Target">Target</option>
              <option value="Sephora">Sephora</option>
            </select>

            {/* 风险等级 */}
            <select
              value={filterRiskLevel}
              onChange={e => setFilterRiskLevel(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="ALL">全部风险等级</option>
              <option value="HIGH">高危 (HIGH)</option>
              <option value="MEDIUM">中危 (MEDIUM)</option>
              <option value="LOW">低危/正常 (LOW)</option>
            </select>

            {/* 搜索 */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
                search
              </span>
              <input
                type="text"
                placeholder="搜索 Card ID / 卡单号 / 用户名 / 卡码..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 w-60"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px]">共检索到 {filteredRecords.length} 笔预检事实记录</span>
          </div>
        </div>

        {/* 预检表格 */}
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold">
                <th className="py-2.5 px-3">Card ID / 卡单号</th>
                <th className="py-2.5 px-3">出卡用户</th>
                <th className="py-2.5 px-3">卡种 / 国家</th>
                <th className="py-2.5 px-3">申报面额</th>
                <th className="py-2.5 px-3">查询余额</th>
                <th className="py-2.5 px-3">卡状态</th>
                <th className="py-2.5 px-3">重复检查</th>
                <th className="py-2.5 px-3">面额检查</th>
                <th className="py-2.5 px-3">统一预检结果</th>
                <th className="py-2.5 px-3">预检时间</th>
                <th className="py-2.5 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredRecords.map(rec => (
                <tr
                  key={rec.id}
                  onClick={() => setSelectedRecord(rec)}
                  className={`hover:bg-blue-50/40 transition-colors cursor-pointer font-sans ${
                    selectedRecord?.id === rec.id ? 'bg-blue-50/70' : ''
                  }`}
                >
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-blue-700 font-mono text-xs">{rec.id}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{rec.orderId}</div>
                  </td>

                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900">{rec.userName}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[10px] text-slate-400 font-mono">{rec.userId}</span>
                      <span className={`px-1 py-0.1 rounded text-[9px] font-bold ${
                        rec.userRiskTag === '高风险' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        rec.userRiskTag === '关注' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {rec.userRiskTag}
                      </span>
                    </div>
                  </td>

                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900">{rec.brand}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{rec.country} · {rec.cardCodeMasked}</div>
                  </td>

                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    ${rec.declaredValue}
                  </td>

                  <td className="py-2.5 px-3 font-mono">
                    <span className={`font-bold ${
                      rec.decisionResult === 'CHECK_FAILED' ? 'text-purple-600' :
                      rec.queryBalance === rec.declaredValue ? 'text-emerald-700' : 'text-rose-600'
                    }`}>
                      {rec.decisionResult === 'CHECK_FAILED' ? '异常待重试' : `$${rec.queryBalance}`}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rec.cardStatus === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      rec.cardStatus === 'Redeemed' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}>
                      {rec.cardStatus}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 font-sans">
                    {rec.duplicateCheck === '命中' ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        ❌ 命中重复
                      </span>
                    ) : (
                      <span className="text-emerald-700 text-[11px] font-medium">✅ 正常</span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 font-sans">
                    {rec.faceMatchCheck === '一致' ? (
                      <span className="text-emerald-700 text-[11px] font-medium">✅ 一致</span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        ⚠️ 异常
                      </span>
                    )}
                  </td>

                  {/* 统一预检结果 */}
                  <td className="py-2.5 px-3 font-sans">
                    {rec.decisionResult === 'PASS' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        PASS (通过)
                      </span>
                    )}
                    {rec.decisionResult === 'REVIEW' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                        REVIEW (复核)
                      </span>
                    )}
                    {rec.decisionResult === 'BLOCK' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                        BLOCK (拦截)
                      </span>
                    )}
                    {rec.decisionResult === 'CHECK_FAILED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300" title="工具异常不等于风险拦截，请重试">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping"></span>
                        CHECK_FAILED (工具异常)
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-slate-400 font-mono text-[10px]">
                    {rec.precheckTime}
                  </td>

                  <td className="py-2.5 px-3 text-right font-sans">
                    <div className="flex items-center justify-end gap-1.5">
                      {rec.decisionResult === 'CHECK_FAILED' ? (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleRetryCheck(rec);
                          }}
                          className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-semibold cursor-pointer shadow-2xs flex items-center gap-0.5"
                        >
                          <span className="material-symbols-outlined text-[13px]">refresh</span>
                          <span>通道重试</span>
                        </button>
                      ) : null}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedRecord(rec);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 rounded cursor-pointer"
                      >
                        排查凭证
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 预检模拟测试器 (Precheck Simulator) */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">science</span>
            <span className="font-bold text-slate-900 text-sm">单卡即时预检运行测试器 (Precheck Simulator)</span>
          </div>
          <span className="text-[11px] text-slate-400">支持直接调试预检规则与通道返回状态</span>
        </div>

        <form onSubmit={handleRunSimulator} className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">卡种品牌</label>
            <select
              value={simBrand}
              onChange={e => setSimBrand(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
            >
              <option value="Apple">Apple Gift Card</option>
              <option value="Steam">Steam Wallet</option>
              <option value="Target">Target US</option>
              <option value="Sephora">Sephora US</option>
              <option value="Vanilla">Vanilla Visa</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">卡号 / 卡密 (输入 ZERO触发BLOCK, DIFF触发REVIEW, TIMEOUT触发FAILED)</label>
            <input
              type="text"
              value={simCardCode}
              onChange={e => setSimCardCode(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
              placeholder="例如: X892-F91A-9811-QQ09"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">申报面额 ($)</label>
            <input
              type="number"
              value={simDeclaredValue}
              onChange={e => setSimDeclaredValue(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">PIN 码 (选填)</label>
            <input
              type="text"
              value={simPin}
              onChange={e => setSimPin(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
              placeholder="8821"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSimulating}
              className="w-full py-2 bg-[#004ac6] hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs flex items-center justify-center gap-1 transition-colors"
            >
              {isSimulating ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                  <span>预检运行中...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  <span>立即执行预检</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 预检凭证与规则判定抽屉 / 详情弹窗 */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">fact_check</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    预检运行事实凭证: {selectedRecord.id} ({selectedRecord.brand})
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">{selectedRecord.orderId} · {selectedRecord.precheckTime}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* 统一决策展示 */}
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              selectedRecord.decisionResult === 'PASS' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
              selectedRecord.decisionResult === 'REVIEW' ? 'bg-amber-50 border-amber-200 text-amber-900' :
              selectedRecord.decisionResult === 'BLOCK' ? 'bg-rose-50 border-rose-200 text-rose-900' :
              'bg-purple-50 border-purple-300 text-purple-900'
            }`}>
              <div>
                <span className="font-bold text-xs uppercase tracking-wide">
                  统一预检决策: [{selectedRecord.decisionResult}]
                </span>
                <p className="text-[11px] mt-0.5">{selectedRecord.defaultAction}</p>
              </div>
              {selectedRecord.decisionResult === 'CHECK_FAILED' && (
                <button
                  onClick={() => handleRetryCheck(selectedRecord)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                >
                  通道立即重试
                </button>
              )}
            </div>

            {/* 6 大检查项明细 */}
            <div className="space-y-2">
              <span className="font-bold text-slate-800 text-xs">6 大核心检查项运行明细</span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {selectedRecord.checkItems.map((item, i) => (
                  <div key={i} className="p-2.5 bg-white flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{item.name}</span>
                        {item.ruleId && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                            {item.ruleId}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      item.status === 'PASSED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      item.status === 'WARNING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      item.status === 'FAILED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}>
                      {item.resultText}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 底层 Card Check 网关通信快照 */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between text-slate-600 font-sans font-semibold">
                <span>底层通道通信凭证 (Raw Evidence Trace)</span>
                <span className="text-emerald-700">{selectedRecord.cardCheckDetail.latencyMs}ms</span>
              </div>
              <div className="text-slate-500">接口源: {selectedRecord.cardCheckDetail.source}</div>
              <div className="text-slate-500">数字签名: {selectedRecord.cardCheckDetail.rawEvidenceSignature}</div>
              <div className="text-slate-500">查验时间: {selectedRecord.cardCheckDetail.checkTime}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
