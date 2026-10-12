import React, { useState, useMemo } from 'react';
import { PrecheckRecordItem, PrecheckDecision, RiskLevel } from './riskTypes';
import { INITIAL_PRECHECK_DATA } from './mockRiskData';

interface TransactionPrecheckTabProps {
  showToast: (msg: string) => void;
  onNavigateToAbnormal?: () => void;
}

export const TransactionPrecheckTab: React.FC<TransactionPrecheckTabProps> = ({
  showToast,
  onNavigateToAbnormal
}) => {
  const [records, setRecords] = useState<PrecheckRecordItem[]>(INITIAL_PRECHECK_DATA);
  const [selectedRecord, setSelectedRecord] = useState<PrecheckRecordItem | null>(null);
  const [filterDecision, setFilterDecision] = useState<string>('ALL');
  const [filterBrand, setFilterBrand] = useState<string>('ALL');
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

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
    <div className="flex flex-col space-y-4 text-xs text-slate-800 antialiased">
      {/* 职责说明卡 */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0">
            <span className="material-symbols-outlined text-[22px]">verified_user</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-slate-900 text-sm">交易预检（回答：每笔交易进入时，系统到底检查了什么、结果是什么？）</h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-[10px] font-bold border border-blue-200">
                风险识别排查依据中心
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              用于查看预检结果、排查为什么被拦截、复核系统判断依据与售后溯源。<strong className="text-slate-700">区分明确：CHECK_FAILED 工具异常绝不误判为风险卡。</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('已刷新最新 50 笔进单预检数据流！')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">sync</span>
            <span>刷新预检流</span>
          </button>
        </div>
      </div>

      {/* 筛选与搜索工具条 */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* 综合决策筛选 */}
          <select
            value={filterDecision}
            onChange={e => setFilterDecision(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
          >
            <option value="ALL">全部决策结果</option>
            <option value="PASS">PASS (正常放行)</option>
            <option value="REVIEW">REVIEW (待人工确认)</option>
            <option value="BLOCK">BLOCK (阻断拦截)</option>
            <option value="CHECK_FAILED">CHECK_FAILED (工具异常)</option>
          </select>

          {/* 卡种筛选 */}
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

          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
              search
            </span>
            <input
              type="text"
              placeholder="搜索 Card ID / 卡单号 / 用户名 / 卡码..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 w-64"
            />
          </div>
        </div>

        <span className="text-slate-400 font-mono text-[11px]">共检索到 {filteredRecords.length} 笔预检事实记录</span>
      </div>

      {/* 预检列表表格 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
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
                <th className="py-2.5 px-3">用户风险</th>
                <th className="py-2.5 px-3">综合结果</th>
                <th className="py-2.5 px-3">风险等级</th>
                <th className="py-2.5 px-3">预检时间</th>
                <th className="py-2.5 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredRecords.map(rec => (
                <tr
                  key={rec.id}
                  onClick={() => setSelectedRecord(rec)}
                  className="hover:bg-blue-50/40 transition-colors cursor-pointer font-sans"
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
                    <span className={`font-bold ${rec.queryBalance === rec.declaredValue ? 'text-emerald-700' : 'text-rose-600'}`}>
                      ${rec.queryBalance}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rec.cardStatus === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      rec.cardStatus === 'Redeemed' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      'bg-slate-100 text-slate-600 border border-slate-200'
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

                  <td className="py-2.5 px-3 font-sans">
                    {rec.userRiskCheck === '正常' && <span className="text-emerald-700 text-[11px]">✅ 正常</span>}
                    {rec.userRiskCheck === '关注' && <span className="text-amber-700 text-[11px] font-semibold">⚠️ 关注</span>}
                    {rec.userRiskCheck === '风险' && <span className="text-rose-600 text-[11px] font-bold">❌ 风险</span>}
                  </td>

                  <td className="py-2.5 px-3 font-sans">
                    {rec.decisionResult === 'PASS' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        PASS 放行
                      </span>
                    )}
                    {rec.decisionResult === 'REVIEW' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        REVIEW 待确认
                      </span>
                    )}
                    {rec.decisionResult === 'BLOCK' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        BLOCK 拦截
                      </span>
                    )}
                    {rec.decisionResult === 'CHECK_FAILED' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                        工具异常 (重试)
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 font-sans">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      rec.riskLevel === 'HIGH' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      rec.riskLevel === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {rec.riskLevel === 'HIGH' ? '高' : rec.riskLevel === 'MEDIUM' ? '中' : '低'}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[10px]">
                    {rec.precheckTime}
                  </td>

                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedRecord(rec);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-blue-600 font-bold rounded-lg border border-slate-200 text-[11px] cursor-pointer"
                    >
                      详情依据
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 预检详情 Drawer / Modal (分四大部分) */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">fact_check</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    交易预检详细依据与决策底稿 ({selectedRecord.id})
                  </h3>
                  <span className="text-slate-500 text-[11px] font-mono">
                    关联卡单: {selectedRecord.orderId} · 预检时间: {selectedRecord.precheckTime}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Body: 4 大区域 */}
            <div className="p-5 space-y-4">
              {/* 9.1 卡基础信息 */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">badge</span>
                  <span>1. 卡基础信息</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-400 font-sans block text-[10px]">Card ID / 卡单号:</span>
                    <strong className="text-slate-800">{selectedRecord.id} / {selectedRecord.orderId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block text-[10px]">出卡用户:</span>
                    <strong className="text-slate-800">{selectedRecord.userName} ({selectedRecord.userId})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block text-[10px]">品牌 / 国家:</span>
                    <strong className="text-slate-800">{selectedRecord.brand} ({selectedRecord.country})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block text-[10px]">申报面额:</span>
                    <strong className="text-blue-700">${selectedRecord.declaredValue} {selectedRecord.currency}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 font-sans block text-[10px]">卡码摘要 (脱敏保护):</span>
                    <strong className="text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">{selectedRecord.cardCodeMasked}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 font-sans block text-[10px]">出卡人风险评级:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedRecord.userRiskTag === '高风险' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      selectedRecord.userRiskTag === '关注' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {selectedRecord.userRiskTag}信用
                    </span>
                  </div>
                </div>
              </div>

              {/* 9.2 Card Check 结果 */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">fact_check</span>
                    <span>2. Card Check 官方验真结果</span>
                  </h4>
                  {selectedRecord.cardCheckDetail.isToolError ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                      ⚠️ 工具通道异常 (非卡异常)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      通道响应成功 ({selectedRecord.cardCheckDetail.latencyMs}ms)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-400 font-sans block text-[10px]">实际可用余额:</span>
                    <strong className={`text-base ${selectedRecord.cardCheckDetail.balance > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      ${selectedRecord.cardCheckDetail.balance}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block text-[10px]">官方卡状态:</span>
                    <strong className="text-slate-900">{selectedRecord.cardCheckDetail.cardStatusText}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block text-[10px]">查询通道源:</span>
                    <span className="text-slate-700">{selectedRecord.cardCheckDetail.source}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block text-[10px]">验真哈希签名:</span>
                    <span className="text-slate-500 truncate block">{selectedRecord.cardCheckDetail.rawEvidenceSignature}</span>
                  </div>
                </div>
              </div>

              {/* 9.3 6 项风险检查项 */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-purple-600">checklist</span>
                  <span>3. 预检 6 大风险规则检查项（逐项排查）</span>
                </h4>

                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {selectedRecord.checkItems.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[12px] shrink-0 ${
                          item.status === 'PASSED' ? 'bg-emerald-100 text-emerald-700' :
                          item.status === 'WARNING' ? 'bg-amber-100 text-amber-700' :
                          item.status === 'FAILED' ? 'bg-rose-100 text-rose-700' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {item.status === 'PASSED' ? '✓' : item.status === 'WARNING' ? '!' : item.status === 'FAILED' ? '✕' : '?'}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900">{item.name}</div>
                          <div className="text-[11px] text-slate-500">{item.description}</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`font-semibold font-mono text-[11px] ${
                          item.status === 'PASSED' ? 'text-emerald-700' :
                          item.status === 'WARNING' ? 'text-amber-700' :
                          item.status === 'FAILED' ? 'text-rose-600' :
                          'text-slate-600'
                        }`}>
                          {item.resultText}
                        </span>
                        {item.ruleId && (
                          <div className="text-[9px] text-slate-400 font-mono">{item.ruleId}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 9.4 综合决策与后续动作 */}
              <div className="bg-blue-50/60 rounded-xl p-3.5 border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">gavel</span>
                    <span>4. 综合风险决策 与 触发动作</span>
                  </h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    selectedRecord.decisionResult === 'PASS' ? 'bg-emerald-600 text-white' :
                    selectedRecord.decisionResult === 'REVIEW' ? 'bg-amber-600 text-white' :
                    selectedRecord.decisionResult === 'BLOCK' ? 'bg-rose-600 text-white' :
                    'bg-slate-700 text-white'
                  }`}>
                    {selectedRecord.decisionResult}
                  </span>
                </div>
                <div className="text-xs text-slate-700 flex items-center gap-2">
                  <span className="text-slate-500">执行动作:</span>
                  <strong>{selectedRecord.defaultAction}</strong>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/80">
              <span className="text-slate-400 text-xs font-mono">
                SHA-256 存证已加密上链 · 供售后与争议随时调阅
              </span>
              <div className="flex items-center gap-2">
                {selectedRecord.decisionResult !== 'PASS' && onNavigateToAbnormal && (
                  <button
                    onClick={() => {
                      setSelectedRecord(null);
                      onNavigateToAbnormal();
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    前往异常卡工作池处理 &rarr;
                  </button>
                )}
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200 text-xs cursor-pointer"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
