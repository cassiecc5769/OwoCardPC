import React, { useState, useMemo } from 'react';
import { NavPath } from '../../types';
import {
  ToolQueryRecordItem,
  ToolCallLogItem,
  CardBusinessEvidenceItem,
  CallChainHop,
  EvidenceTimelineNode,
  QueryResultCode,
  CallerType,
  CapabilityCode,
  CAPABILITY_MAP
} from './types';
import {
  INITIAL_TOOL_QUERY_RECORDS,
  INITIAL_TOOL_CALL_LOGS,
  INITIAL_BUSINESS_EVIDENCE_LIST
} from './mockCardToolsData';

interface ToolRecordsViewProps {
  currentPath?: NavPath;
  onNavigate?: (path: NavPath) => void;
}

type TabType = 'QUERY_RECORDS' | 'CALL_LOGS' | 'BUSINESS_EVIDENCE';

export const ToolRecordsView: React.FC<ToolRecordsViewProps> = ({ currentPath, onNavigate }) => {
  // 当前 Tab: 根据传入的路由初始化
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (currentPath === 'card-tools-logs') return 'CALL_LOGS';
    if (currentPath === 'card-tools-evidence') return 'BUSINESS_EVIDENCE';
    return 'QUERY_RECORDS';
  });

  // 数据集状态
  const [queryRecords] = useState<ToolQueryRecordItem[]>(INITIAL_TOOL_QUERY_RECORDS);
  const [callLogs] = useState<ToolCallLogItem[]>(INITIAL_TOOL_CALL_LOGS);
  const [evidenceList] = useState<CardBusinessEvidenceItem[]>(INITIAL_BUSINESS_EVIDENCE_LIST);

  // Tab 1: 查询记录 筛选条件
  const [qrKeyword, setQrKeyword] = useState('');
  const [qrBrand, setQrBrand] = useState('ALL');
  const [qrCapability, setQrCapability] = useState('ALL');
  const [qrCallerType, setQrCallerType] = useState('ALL');
  const [qrResult, setQrResult] = useState('ALL');
  const [selectedQueryRecord, setSelectedQueryRecord] = useState<ToolQueryRecordItem | null>(null);

  // Tab 2: 调用日志 筛选条件
  const [clKeyword, setClKeyword] = useState('');
  const [clFailoverStatus, setClFailoverStatus] = useState('ALL');
  const [clResult, setClResult] = useState('ALL');
  const [selectedCallLog, setSelectedCallLog] = useState<ToolCallLogItem | null>(null);

  // Tab 3: 业务证据 筛选条件
  const [evKeyword, setEvKeyword] = useState('');
  const [evBrand, setEvBrand] = useState('ALL');
  const [evStatus, setEvStatus] = useState('ALL');
  const [selectedEvidence, setSelectedEvidence] = useState<CardBusinessEvidenceItem | null>(null);

  // 操作反馈 Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // ---------------------------------------------------------------------------
  // 1. 过滤：查询记录 (Tab 1 - 面向业务人员)
  // ---------------------------------------------------------------------------
  const filteredQueryRecords = useMemo(() => {
    return queryRecords.filter((r) => {
      if (qrBrand !== 'ALL' && r.brand !== qrBrand) return false;
      if (qrCapability !== 'ALL' && r.capability !== qrCapability) return false;
      if (qrCallerType !== 'ALL' && r.callerType !== qrCallerType) return false;
      if (qrResult !== 'ALL' && r.result !== qrResult) return false;

      if (qrKeyword.trim()) {
        const kw = qrKeyword.toLowerCase().trim();
        const match =
          r.requestId.toLowerCase().includes(kw) ||
          r.cardId.toLowerCase().includes(kw) ||
          r.orderId.toLowerCase().includes(kw) ||
          r.merchantId.toLowerCase().includes(kw) ||
          r.merchantName.toLowerCase().includes(kw) ||
          r.caller.toLowerCase().includes(kw) ||
          r.brand.toLowerCase().includes(kw) ||
          r.country.toLowerCase().includes(kw);
        if (!match) return false;
      }
      return true;
    });
  }, [queryRecords, qrBrand, qrCapability, qrCallerType, qrResult, qrKeyword]);

  // ---------------------------------------------------------------------------
  // 2. 过滤：调用日志 (Tab 2 - 面向管理员排查链路与 Failover)
  // ---------------------------------------------------------------------------
  const filteredCallLogs = useMemo(() => {
    return callLogs.filter((l) => {
      if (clFailoverStatus !== 'ALL' && l.failoverStatus !== clFailoverStatus) return false;
      if (clResult !== 'ALL' && l.resultCode !== clResult) return false;

      if (clKeyword.trim()) {
        const kw = clKeyword.toLowerCase().trim();
        const match =
          l.requestId.toLowerCase().includes(kw) ||
          l.toolId.toLowerCase().includes(kw) ||
          l.source.toLowerCase().includes(kw) ||
          (l.errorCode && l.errorCode.toLowerCase().includes(kw)) ||
          (l.errorMessage && l.errorMessage.toLowerCase().includes(kw)) ||
          l.caller.toLowerCase().includes(kw);
        if (!match) return false;
      }
      return true;
    });
  }, [callLogs, clFailoverStatus, clResult, clKeyword]);

  // ---------------------------------------------------------------------------
  // 3. 过滤：业务证据 (Tab 3 - 固化不可覆盖事实证据)
  // ---------------------------------------------------------------------------
  const filteredEvidence = useMemo(() => {
    return evidenceList.filter((e) => {
      if (evBrand !== 'ALL' && e.brand !== evBrand) return false;
      if (evStatus !== 'ALL' && e.status !== evStatus) return false;

      if (evKeyword.trim()) {
        const kw = evKeyword.toLowerCase().trim();
        const match =
          e.evidenceId.toLowerCase().includes(kw) ||
          e.cardId.toLowerCase().includes(kw) ||
          e.orderId.toLowerCase().includes(kw) ||
          e.merchantId.toLowerCase().includes(kw) ||
          e.merchantName.toLowerCase().includes(kw) ||
          (e.verdict && e.verdict.toLowerCase().includes(kw));
        if (!match) return false;
      }
      return true;
    });
  }, [evidenceList, evBrand, evStatus, evKeyword]);

  // 辅助渲染结果 Badge
  const renderResultBadge = (code: QueryResultCode) => {
    switch (code) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            SUCCESS 成功
          </span>
        );
      case 'BUSINESS_EXCEPTION':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            BUSINESS_EXCEPTION 业务异常
          </span>
        );
      case 'DATA_MISMATCH':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            DATA_MISMATCH 倒挂差异
          </span>
        );
      case 'TOOL_ERROR':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            TOOL_ERROR 工具故障
          </span>
        );
      case 'UNKNOWN':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {code}
          </span>
        );
    }
  };

  const renderCallerTypeBadge = (callerType: CallerType) => {
    switch (callerType) {
      case 'SYSTEM':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <span className="material-symbols-outlined text-[13px]">smart_toy</span>
            SYSTEM 系统
          </span>
        );
      case 'MERCHANT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span className="material-symbols-outlined text-[13px]">storefront</span>
            MERCHANT 商户
          </span>
        );
      case 'PLATFORM_CS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
            <span className="material-symbols-outlined text-[13px]">support_agent</span>
            PLATFORM_CS 客服
          </span>
        );
      default:
        return <span className="text-xs text-slate-600">{callerType}</span>;
    }
  };

  const renderFailoverBadge = (status: ToolCallLogItem['failoverStatus']) => {
    switch (status) {
      case 'FAILOVER_SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <span className="material-symbols-outlined text-[13px]">alt_route</span>
            Failover 切换成功
          </span>
        );
      case 'RETRY_SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <span className="material-symbols-outlined text-[13px]">replay</span>
            重试后成功
          </span>
        );
      case 'ALL_FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="material-symbols-outlined text-[13px]">error</span>
            全链路故障失败
          </span>
        );
      case 'NONE':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            主通道直通正常
          </span>
        );
    }
  };

  const renderEvidenceStatusBadge = (status: CardBusinessEvidenceItem['status']) => {
    switch (status) {
      case 'RESOLVED_USER_FAULT':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            裁决：出卡人全责 (欺诈空卡)
          </span>
        );
      case 'RESOLVED_MERCHANT_FAULT':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            裁决：商户超时全责 (履约延误)
          </span>
        );
      case 'DISPUTE_PROCESSING':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
            售后争议复核中
          </span>
        );
      case 'SETTLED':
      case 'NORMAL':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            履约完结 · 无争议
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast 提示 */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-sm border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="material-symbols-outlined text-emerald-400 text-base">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 顶部 Header 说明 Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-xl">history_edu</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">工具记录</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                审计与存证中心
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              统一记录卡工具过去发生过什么，以及这些查询结果能否作为后续业务判断的证据。
              业务人员随时调阅卡历史，管理员深度排查链路故障，售后风控一键引用不可篡改固化证据。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            onClick={() => onNavigate && onNavigate('card-tools-query')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">search</span>
            发起卡查询
          </button>
          <button
            onClick={() => onNavigate && onNavigate('card-tools-management')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">tune</span>
            工具与商户授权
          </button>
        </div>
      </div>

      {/* 3 大标准 Tab 导航栏 (统一标准风格) */}
      <section className="bg-white rounded-xl border border-slate-200/80 px-4 pt-1 shadow-xs flex items-center gap-1 overflow-x-auto text-xs">
        {[
          {
            id: 'QUERY_RECORDS',
            label: '查询记录 (Query Records)',
            icon: 'receipt_long',
            badge: filteredQueryRecords.length,
            badgeClass: 'bg-blue-100 text-blue-800'
          },
          {
            id: 'CALL_LOGS',
            label: '调用日志 (Call Logs & Failover)',
            icon: 'alt_route',
            badge: filteredCallLogs.length,
            badgeClass: 'bg-purple-100 text-purple-800'
          },
          {
            id: 'BUSINESS_EVIDENCE',
            label: '业务证据 (Business Evidence)',
            icon: 'verified_user',
            badge: filteredEvidence.length,
            badgeClass: 'bg-emerald-100 text-emerald-800'
          }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-5 py-3.5 font-bold rounded-t-lg transition-colors shrink-0 flex items-center gap-2 relative cursor-pointer text-xs ${
                isActive
                  ? 'text-[#004ac6] bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#004ac6]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isActive ? 'bg-blue-100 text-blue-800' : tab.badgeClass
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </section>

      {/* ======================================================================= */}
      {/* TAB 1: 查询记录 (面向业务人员的工具使用历史)                             */}
      {/* ======================================================================= */}
      {activeTab === 'QUERY_RECORDS' && (
        <div className="space-y-4">
          {/* 筛选过滤工具条 */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[240px]">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                search
              </span>
              <input
                type="text"
                placeholder="搜索 Request ID / Card ID / 订单 / 商户 / 调用人..."
                value={qrKeyword}
                onChange={(e) => setQrKeyword(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
              {qrKeyword && (
                <button
                  onClick={() => setQrKeyword('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* 品牌 */}
            <select
              value={qrBrand}
              onChange={(e) => setQrBrand(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">全部品牌 (Brand)</option>
              <option value="Apple">Apple</option>
              <option value="Steam">Steam</option>
              <option value="Target">Target</option>
              <option value="Sephora">Sephora</option>
              <option value="Razer">Razer</option>
            </select>

            {/* 能力 */}
            <select
              value={qrCapability}
              onChange={(e) => setQrCapability(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">全部能力 (Capability)</option>
              <option value="BALANCE_CHECK">余额查询 (BALANCE_CHECK)</option>
              <option value="STATUS_CHECK">状态查询 (STATUS_CHECK)</option>
              <option value="ORDER_CHECK">订单查询 (ORDER_CHECK)</option>
              <option value="FAST_REDEEM">快充能力 (FAST_REDEEM)</option>
              <option value="CODE_COMPLETE">卡码补全 (CODE_COMPLETE)</option>
            </select>

            {/* 调用主体 */}
            <select
              value={qrCallerType}
              onChange={(e) => setQrCallerType(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">全部调用主体 (Caller Type)</option>
              <option value="SYSTEM">SYSTEM 系统</option>
              <option value="MERCHANT">MERCHANT 商户</option>
              <option value="PLATFORM_CS">PLATFORM_CS 客服</option>
            </select>

            {/* 查询结果 */}
            <select
              value={qrResult}
              onChange={(e) => setQrResult(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">全部结果 (Result)</option>
              <option value="SUCCESS">SUCCESS 成功</option>
              <option value="BUSINESS_EXCEPTION">BUSINESS_EXCEPTION 业务异常</option>
              <option value="DATA_MISMATCH">DATA_MISMATCH 倒挂差异</option>
              <option value="TOOL_ERROR">TOOL_ERROR 工具故障</option>
            </select>

            <button
              onClick={() => {
                setQrKeyword('');
                setQrBrand('ALL');
                setQrCapability('ALL');
                setQrCallerType('ALL');
                setQrResult('ALL');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1"
            >
              重置
            </button>
          </div>

          {/* 查询记录列表表格 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="py-3 px-3">Request ID / 时间</th>
                    <th className="py-3 px-3">卡号 (Card ID) / 订单</th>
                    <th className="py-3 px-3">品牌 / 国家</th>
                    <th className="py-3 px-3">能力 (Capability)</th>
                    <th className="py-3 px-3">调用主体 / 调用人 / 场景</th>
                    <th className="py-3 px-3">查询结果 (Result)</th>
                    <th className="py-3 px-3">余额 / 卡状态</th>
                    <th className="py-3 px-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQueryRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl block mb-2 text-slate-300">
                          inbox
                        </span>
                        暂无符合条件的查询记录
                      </td>
                    </tr>
                  ) : (
                    filteredQueryRecords.map((item) => (
                      <tr key={item.requestId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-mono font-medium text-slate-900">{item.requestId}</div>
                          <div className="text-[11px] text-slate-400">{item.queryTime}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-mono text-indigo-600 font-medium">{item.cardId}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            {item.orderId ? (
                              <span className="font-mono text-slate-500">单: {item.orderId}</span>
                            ) : (
                              <span className="text-slate-300">单卡查询</span>
                            )}
                            {item.merchantName && (
                              <span className="px-1 py-0.2 bg-slate-100 rounded text-[10px] text-slate-600">
                                {item.merchantName}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-800">{item.brand}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{item.country}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {CAPABILITY_MAP[item.capability]?.name || item.capabilityName}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div>{renderCallerTypeBadge(item.callerType)}</div>
                          <div className="text-[11px] text-slate-600 font-medium mt-1">{item.caller}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.callScene}</div>
                        </td>
                        <td className="py-2.5 px-3">{renderResultBadge(item.result)}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">
                            {item.currency} {item.balance.toFixed(2)}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">{item.cardStatus}</div>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => setSelectedQueryRecord(item)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                          >
                            查看详情
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 2: 调用日志 (面向管理员排查工具运行与 Failover 故障链)             */}
      {/* ======================================================================= */}
      {activeTab === 'CALL_LOGS' && (
        <div className="space-y-4">
          {/* 说明 */}
          <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-purple-900">
            <span className="material-symbols-outlined text-purple-600 text-lg mt-0.5">schema</span>
            <div className="leading-relaxed">
              <span className="font-bold">平台管理员排查视图：</span>
              记录每一次底层的通道跃迁（Primary ➔ Retry ➔ Backup
              Failover）。业务人员只看最终结果，管理员可穿透查看完整调用链、延迟与网络返回码。
            </div>
          </div>

          {/* 筛选过滤工具条 */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[240px]">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                search
              </span>
              <input
                type="text"
                placeholder="搜索 Request ID / Tool ID / Source / Error Message..."
                value={clKeyword}
                onChange={(e) => setClKeyword(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Failover 状态 */}
            <select
              value={clFailoverStatus}
              onChange={(e) => setClFailoverStatus(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">全部路由/Failover状态</option>
              <option value="FAILOVER_SUCCESS">Failover 切换成功</option>
              <option value="RETRY_SUCCESS">重试后成功</option>
              <option value="NONE">主通道直通成功</option>
              <option value="ALL_FAILED">全链路故障失败</option>
            </select>

            {/* 结果 */}
            <select
              value={clResult}
              onChange={(e) => setClResult(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">全部结果 (Result Code)</option>
              <option value="SUCCESS">SUCCESS 成功</option>
              <option value="BUSINESS_EXCEPTION">BUSINESS_EXCEPTION 业务异常</option>
              <option value="TOOL_ERROR">TOOL_ERROR 工具故障</option>
            </select>

            <button
              onClick={() => {
                setClKeyword('');
                setClFailoverStatus('ALL');
                setClResult('ALL');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1"
            >
              重置
            </button>
          </div>

          {/* 调用日志列表与链路简要表格 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="py-3 px-3">Request ID / 工具 ID</th>
                    <th className="py-3 px-3">品牌 / 能力 / 调用者</th>
                    <th className="py-3 px-3">请求与响应时间</th>
                    <th className="py-3 px-3">耗时 (Duration)</th>
                    <th className="py-3 px-3">重试与 Failover 状态</th>
                    <th className="py-3 px-3">最终通道与链路轨迹</th>
                    <th className="py-3 px-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCallLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl block mb-2 text-slate-300">
                          alt_route
                        </span>
                        未检索到符合条件的调用日志
                      </td>
                    </tr>
                  ) : (
                    filteredCallLogs.map((log) => (
                      <tr key={log.requestId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-mono font-bold text-slate-900">{log.requestId}</div>
                          <div className="text-[11px] text-indigo-600 font-mono mt-0.5">{log.toolId}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-800">
                            {log.brand} · {log.country}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {CAPABILITY_MAP[log.capability]?.name || log.capability} · {log.caller}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="text-slate-700">{log.requestTime}</div>
                          <div className="text-[11px] text-slate-400">{log.responseTime}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div
                            className={`font-mono font-bold ${
                              log.durationMs > 3000
                                ? 'text-rose-600'
                                : log.durationMs > 1500
                                ? 'text-amber-600'
                                : 'text-slate-700'
                            }`}
                          >
                            {log.durationMs} ms
                          </div>
                          <div className="text-[10px] text-slate-400">重试: {log.retryCount} 次</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div>{renderFailoverBadge(log.failoverStatus)}</div>
                          <div className="mt-1">{renderResultBadge(log.resultCode)}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="text-slate-800 font-medium">{log.source}</div>
                          <div className="flex items-center gap-1.5 flex-wrap mt-1">
                            {log.callChain.map((hop, idx) => (
                              <div key={idx} className="flex items-center gap-1 text-[10px]">
                                <span
                                  className={`px-1.5 py-0.5 rounded font-mono ${
                                    hop.status === 'SUCCESS'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {hop.sourceName.split(' ')[0]} ({hop.status})
                                </span>
                                {idx < log.callChain.length - 1 && (
                                  <span className="text-slate-400 font-bold">➔</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => setSelectedCallLog(log)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors inline-flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-xs">schema</span>
                            排查链路
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 3: 业务证据 (固化不可覆盖的事实证据，服务争议与风控复核)             */}
      {/* ======================================================================= */}
      {activeTab === 'BUSINESS_EVIDENCE' && (
        <div className="space-y-4">
          {/* 证据存证机制说明 */}
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3.5 flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-600 text-xl mt-0.5">lock</span>
            <div className="text-xs text-blue-900 leading-relaxed flex-1">
              <span className="font-bold">业务证据固化机制说明：</span>
              把不同业务时间点（T1 提单预检、T2 商户接卡、T3 商户处理、T4 完结、T5 售后复核）的卡查询结果固化成不可覆盖的事实证据。
              记录发生时间点与真实结果，后续任何查询仅追加新快照节点，绝不覆盖已有历史事实。
              售后争议与风控复核可直接引用作为判定责任的仲裁依据。
            </div>
          </div>

          {/* 筛选过滤工具条 */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[240px]">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                search
              </span>
              <input
                type="text"
                placeholder="搜索 Evidence ID / Card ID / 订单 / 商户 / 裁决理由..."
                value={evKeyword}
                onChange={(e) => setEvKeyword(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* 品牌 */}
            <select
              value={evBrand}
              onChange={(e) => setEvBrand(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">全部品牌 (Brand)</option>
              <option value="Apple">Apple</option>
              <option value="Steam">Steam</option>
            </select>

            {/* 裁决状态 */}
            <select
              value={evStatus}
              onChange={(e) => setEvStatus(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">全部证据状态</option>
              <option value="RESOLVED_USER_FAULT">出卡人全责 (USER_FAULT)</option>
              <option value="RESOLVED_MERCHANT_FAULT">商户超时全责 (MERCHANT_FAULT)</option>
              <option value="DISPUTE_PROCESSING">争议复核中 (DISPUTE_PROCESSING)</option>
              <option value="SETTLED">正常履约完结 (SETTLED)</option>
            </select>

            <button
              onClick={() => {
                setEvKeyword('');
                setEvBrand('ALL');
                setEvStatus('ALL');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1"
            >
              重置
            </button>
          </div>

          {/* 业务证据列表卡片 */}
          <div className="grid grid-cols-1 gap-4">
            {filteredEvidence.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl block mb-2 text-slate-300">
                  verified_user
                </span>
                暂无符合条件的业务证据档案
              </div>
            ) : (
              filteredEvidence.map((ev) => (
                <div
                  key={ev.evidenceId}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 hover:border-indigo-300 transition-all"
                >
                  {/* 头部元信息 */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {ev.evidenceId}
                      </span>
                      <span className="font-mono text-xs text-slate-500">卡号: {ev.cardId}</span>
                      <span className="font-mono text-xs text-slate-500">订单: {ev.orderId}</span>
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 font-medium">
                        {ev.brand} · {ev.country} · 面额 {ev.currency} {ev.declaredValue}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {renderEvidenceStatusBadge(ev.status)}
                      <button
                        onClick={() => setSelectedEvidence(ev)}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                      >
                        展开证据链
                      </button>
                    </div>
                  </div>

                  {/* 证据对比裁决摘要 */}
                  {ev.verdict && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-amber-600 text-base">gavel</span>
                        <span>仲裁判定：{ev.verdict}</span>
                      </div>
                      <p className="text-slate-600 mt-1 leading-relaxed">{ev.verdictDetail}</p>
                    </div>
                  )}

                  {/* 核心证据多时间点时间轴 (Timeline) */}
                  <div className="py-3">
                    <div className="text-xs font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-indigo-600 text-sm">timeline</span>
                      <span>固化事实时间轴 ({ev.timelineNodes.length} 个关键业务节点快照)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {ev.timelineNodes.map((node: EvidenceTimelineNode, nIdx: number) => (
                        <div
                          key={nIdx}
                          className="p-2.5 rounded-lg border bg-slate-50/80 border-slate-200 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between font-semibold text-slate-800">
                            <span>{node.stageName}</span>
                            <span className="text-[10px] font-mono text-slate-400">{node.stage}</span>
                          </div>

                          <div className="text-[10px] text-slate-400">{node.queryTime}</div>

                          <div className="bg-white p-2 rounded border border-slate-100 font-mono text-[11px] space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-400">余额:</span>
                              <span className="font-bold text-slate-900">
                                {node.currency} {node.balance.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">状态:</span>
                              <span
                                className={`font-bold ${
                                  node.cardStatus.includes('Redeemed') || node.cardStatus.includes('已兑换')
                                    ? 'text-rose-600'
                                    : 'text-slate-800'
                                }`}
                              >
                                {node.cardStatus}
                              </span>
                            </div>
                            {node.externalOrderId && (
                              <div className="flex justify-between text-[10px]">
                                <span className="text-slate-400">外部单号:</span>
                                <span className="text-indigo-600 font-bold">{node.externalOrderId}</span>
                              </div>
                            )}
                          </div>

                          <div className="text-[10px] text-slate-500 leading-tight">
                            来源: <span className="text-slate-700">{node.source}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 底部商户与防伪 */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between text-xs text-slate-500 gap-2">
                    <div>
                      商户: <span className="font-medium text-slate-800">{ev.merchantName} ({ev.merchantId})</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-slate-400">固化建档时间: {ev.createdAt}</span>
                      <button
                        onClick={() => showToast(`已复制证据档案编号: ${ev.evidenceId}`)}
                        className="text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                      >
                        <span className="material-symbols-outlined text-xs">content_copy</span>
                        复制案卷号
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 弹窗 1: 查询记录业务详情弹窗 (Tab 1)                                   */}
      {/* ======================================================================= */}
      {selectedQueryRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 lg:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600">receipt_long</span>
                <h3 className="text-base font-bold text-slate-900">卡工具查询记录详情</h3>
                <span className="px-2 py-0.5 rounded font-mono text-xs bg-slate-100 text-slate-700">
                  {selectedQueryRecord.requestId}
                </span>
              </div>
              <button
                onClick={() => setSelectedQueryRecord(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block mb-1">卡号 (Card ID)</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{selectedQueryRecord.cardId}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block mb-1">关联订单 (Order ID)</span>
                <span className="font-mono font-bold text-indigo-600 text-sm">
                  {selectedQueryRecord.orderId || '无关联订单 (单卡查询)'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block mb-1">品牌 / 国家 / 能力</span>
                <span className="font-bold text-slate-800">
                  {selectedQueryRecord.brand} · {selectedQueryRecord.country} ·{' '}
                  {CAPABILITY_MAP[selectedQueryRecord.capability]?.name || selectedQueryRecord.capabilityName}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block mb-1">查询时间 / 耗时</span>
                <span className="font-medium text-slate-800">
                  {selectedQueryRecord.queryTime}{' '}
                  <span className="text-slate-500 font-mono">({selectedQueryRecord.durationMs} ms)</span>
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block mb-1">调用主体 / 调用人</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {renderCallerTypeBadge(selectedQueryRecord.callerType)}
                  <span className="font-medium text-slate-800">{selectedQueryRecord.caller}</span>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block mb-1">调用场景 (Call Scene)</span>
                <span className="font-mono font-semibold text-slate-800">{selectedQueryRecord.callScene}</span>
              </div>
            </div>

            {/* 查询返回事实 */}
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2">
              <div className="text-xs font-bold text-indigo-950 flex items-center justify-between">
                <span>查询返回事实快照 (Tool Result Snapshot)</span>
                {renderResultBadge(selectedQueryRecord.result)}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2 text-xs font-mono">
                <div className="bg-white p-2.5 rounded border border-indigo-100">
                  <span className="text-slate-400 text-[10px] block">卡余额 (Balance)</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedQueryRecord.currency} {selectedQueryRecord.balance.toFixed(2)}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded border border-indigo-100">
                  <span className="text-slate-400 text-[10px] block">卡状态 (Status)</span>
                  <span className="font-bold text-slate-900">{selectedQueryRecord.cardStatus}</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-indigo-100">
                  <span className="text-slate-400 text-[10px] block">防伪验签指纹</span>
                  <span className="text-[10px] text-slate-600 break-all">{selectedQueryRecord.rawSignature}</span>
                </div>
              </div>
              <div className="bg-white p-2.5 rounded border border-indigo-100 text-xs text-slate-700">
                <span className="font-bold text-slate-900">返回详情说明：</span>
                {selectedQueryRecord.resultText}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  showToast(`已将 Request ${selectedQueryRecord.requestId} 查询事实导出至风控`);
                  setSelectedQueryRecord(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
              >
                引用为风控证据
              </button>
              <button
                onClick={() => setSelectedQueryRecord(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 弹窗 2: 管理员调用链排查弹窗 (Tab 2)                                   */}
      {/* ======================================================================= */}
      {selectedCallLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 lg:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600">schema</span>
                <h3 className="text-base font-bold text-slate-900">工具调用链与 Failover 故障排查</h3>
                <span className="px-2 py-0.5 rounded font-mono text-xs bg-slate-100 text-slate-700">
                  {selectedCallLog.requestId}
                </span>
              </div>
              <button
                onClick={() => setSelectedCallLog(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* 核心排查卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block mb-1">工具 ID</span>
                <span className="font-bold text-slate-900 font-mono">{selectedCallLog.toolId}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block mb-1">最终响应通道</span>
                <span className="font-bold text-indigo-700">{selectedCallLog.source}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block mb-1">总耗时 / 重试</span>
                <span className="font-mono font-bold text-slate-900">
                  {selectedCallLog.durationMs} ms / {selectedCallLog.retryCount} 次重试
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block mb-1">Failover 状态</span>
                {renderFailoverBadge(selectedCallLog.failoverStatus)}
              </div>
            </div>

            {/* 调用链可视化 (Hop by Hop) */}
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5 font-bold text-slate-200">
                  <span className="material-symbols-outlined text-emerald-400 text-sm">route</span>
                  完整调用链轨迹 (Full Call Chain Execution Trace)
                </span>
                <span className="text-[11px]">{selectedCallLog.callChain.length} 个节点跃迁</span>
              </div>

              <div className="space-y-3 pt-2">
                {selectedCallLog.callChain.map((hop: CallChainHop, hIdx: number) => (
                  <div
                    key={hIdx}
                    className={`p-3 rounded-lg border ${
                      hop.status === 'SUCCESS'
                        ? 'bg-slate-800/80 border-emerald-500/40 text-slate-200'
                        : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            hop.status === 'SUCCESS' ? 'bg-emerald-500 text-slate-900' : 'bg-rose-500 text-white'
                          }`}
                        >
                          {hop.hopIndex}
                        </span>
                        <span className="font-bold text-white text-sm">{hop.sourceName}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] ${
                            hop.nodeType === 'PRIMARY'
                              ? 'bg-blue-500/20 text-blue-300'
                              : hop.nodeType === 'RETRY'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-purple-500/20 text-purple-300'
                          }`}
                        >
                          {hop.nodeType}
                        </span>
                      </div>
                      <span className="font-bold">{hop.durationMs} ms</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 mt-2 bg-slate-950/60 p-2 rounded">
                      <div>
                        状态: <span className={hop.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'}>{hop.status}</span>
                      </div>
                      <div>
                        HTTP Status: <span className="text-slate-200">{hop.statusCode}</span>
                      </div>
                      {hop.errorCode && (
                        <div className="col-span-2 text-rose-400">
                          错误: [{hop.errorCode}] {hop.errorDetail}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedCallLog(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800"
              >
                完成排查
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 弹窗 3: 业务证据全量时间轴与存证详情 (Tab 3)                           */}
      {/* ======================================================================= */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 lg:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">verified_user</span>
                <h3 className="text-base font-bold text-slate-900">业务不可篡改事实证据卷宗</h3>
                <span className="px-2 py-0.5 rounded font-mono text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {selectedEvidence.evidenceId}
                </span>
              </div>
              <button
                onClick={() => setSelectedEvidence(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* 基本信息 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block mb-1">卡号 / 订单</span>
                <span className="font-mono font-bold text-slate-900 block">{selectedEvidence.cardId}</span>
                <span className="font-mono text-[11px] text-indigo-600">{selectedEvidence.orderId}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block mb-1">卡种 / 申报面额</span>
                <span className="font-bold text-slate-900 block">
                  {selectedEvidence.brand} ({selectedEvidence.country})
                </span>
                <span className="text-[11px] text-slate-600">
                  {selectedEvidence.currency} {selectedEvidence.declaredValue}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block mb-1">承接商户</span>
                <span className="font-bold text-slate-900 block">{selectedEvidence.merchantName}</span>
                <span className="font-mono text-[11px] text-slate-500">{selectedEvidence.merchantId}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block mb-1">证据卷宗状态</span>
                {renderEvidenceStatusBadge(selectedEvidence.status)}
              </div>
            </div>

            {/* 裁决与原因 */}
            {selectedEvidence.verdict && (
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-700 text-base">gavel</span>
                  <span>争议仲裁结论：{selectedEvidence.verdict}</span>
                </div>
                <p className="text-amber-800 mt-1.5 leading-relaxed">{selectedEvidence.verdictDetail}</p>
              </div>
            )}

            {/* 完整时间线对比 */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-indigo-600 text-sm">history</span>
                业务各阶段固化证据对比矩阵 (不可覆盖事实)
              </h4>

              <div className="space-y-3">
                {selectedEvidence.timelineNodes.map((node: EvidenceTimelineNode, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border bg-slate-50 border-slate-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{node.stageName}</span>
                        <span className="font-mono text-xs text-slate-500">[{node.stage}]</span>
                      </div>
                      <span className="text-xs font-mono text-slate-500">{node.queryTime}</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs bg-white p-2.5 rounded-lg border border-slate-200">
                      <div>
                        <span className="text-slate-400 block text-[10px]">余额 (Balance)</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {selectedEvidence.currency} {node.balance.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">卡状态 (Status)</span>
                        <span
                          className={`font-bold ${
                            node.cardStatus.includes('Redeemed') || node.cardStatus.includes('已兑换')
                              ? 'text-rose-600'
                              : 'text-slate-800'
                          }`}
                        >
                          {node.cardStatus}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">工具通道 (Source)</span>
                        <span className="font-medium text-slate-700">{node.source}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">请求 ID (Request ID)</span>
                        <span className="font-mono text-indigo-600 font-semibold">{node.requestId}</span>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-slate-600 bg-white/60 p-2 rounded border border-slate-100">
                      <span className="font-semibold text-slate-700">节点事实记录：</span>
                      {node.note}
                    </div>

                    <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                      <div>
                        操作人 / 场景: <span className="font-medium text-slate-800">{node.caller}</span> · <span className="font-mono">{node.callScene}</span>
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">
                        防伪哈希: {node.snapshotHash}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 防伪与操作 */}
            <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">verified</span>
                <div>
                  <span className="text-slate-400 block text-[10px]">不可篡改哈希卷宗 (SHA256 Multi-Node Signature)</span>
                  <span className="font-mono text-emerald-300 text-[11px]">
                    0x77FA2299_EVIDENCE_SEAL_{selectedEvidence.evidenceId}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  showToast(`已生成并导出仲裁存证函: ${selectedEvidence.evidenceId}.pdf`);
                  setSelectedEvidence(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
              >
                导出仲裁存证函
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
