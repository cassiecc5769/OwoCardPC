import React, { useState } from 'react';
import { AnomalyItem } from './types';

interface CardOrderDrilldownModalProps {
  anomaly: AnomalyItem | null;
  onClose: () => void;
  onNavigateToOrder?: (orderId: string) => void;
}

export const CardOrderDrilldownModal: React.FC<CardOrderDrilldownModalProps> = ({
  anomaly,
  onClose,
  onNavigateToOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'ocr' | 'payload' | 'decision'>('timeline');
  const [actionDoneMsg, setActionDoneMsg] = useState<string | null>(null);

  if (!anomaly) return null;

  const handleAction = (msg: string) => {
    setActionDoneMsg(msg);
    setTimeout(() => {
      setActionDoneMsg(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 w-full max-w-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm font-code-token">
                  {anomaly.typicalTxId}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold ${anomaly.statusColor}`}
                >
                  {anomaly.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                全链路流转穿透排查 · 根因: {anomaly.causeCategory} ({anomaly.responsibleParty})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-100 flex gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'timeline'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            流转生命周期轨迹
          </button>
          <button
            onClick={() => setActiveTab('ocr')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'ocr'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            OCR 与卡密比对
          </button>
          <button
            onClick={() => setActiveTab('payload')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'payload'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            商户网关回执报文
          </button>
          <button
            onClick={() => setActiveTab('decision')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'decision'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            风控判定与闭环处置
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-xs text-slate-700 max-h-[60vh] overflow-y-auto space-y-4">
          {/* Metadata Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50/70 p-3 rounded-xl border border-slate-200/70 text-[11.5px]">
            <div>
              <span className="text-slate-400 block text-[10px]">卡种/国家</span>
              <span className="font-semibold text-slate-900">{anomaly.detailLog.cardType}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">申报面值</span>
              <span className="font-bold text-slate-900 font-numeric-stat">
                {anomaly.detailLog.faceValue}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">接单承揽商户</span>
              <span className="font-semibold text-blue-700">{anomaly.detailLog.merchantName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">上报时间戳</span>
              <span className="font-code-token text-slate-600">{anomaly.detailLog.reportedAt}</span>
            </div>
          </div>

          {/* Tab 1: Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-3">
              <div className="relative pl-6 border-l-2 border-slate-200 space-y-4 my-2">
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">01. 用户提交出卡</span>
                    <span className="text-slate-400 font-code-token text-[10.5px]">14:22:01.120</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    用户上传实体卡刮开照片及背面小票，OCR 识别完成度 99.1%
                  </p>
                </div>

                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">02. 系统撮合报价</span>
                    <span className="text-slate-400 font-code-token text-[10.5px]">14:22:01.902 (+0.78s)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    撮合引擎匹配最优出卡折扣率 85.2%，生成预扣锁定单
                  </p>
                </div>

                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">03. 用户确认锁定出卡</span>
                    <span className="text-slate-400 font-code-token text-[10.5px]">14:22:08.310</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    用户同意即时出卡并签署电子清算确认函
                  </p>
                </div>

                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">04. 商户接单承揽受理</span>
                    <span className="text-slate-400 font-code-token text-[10.5px]">14:22:10.540 (+2.23s)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    承兑商 {anomaly.detailLog.merchantName} 扣除保证金积点，向官方接口发起兑换请求
                  </p>
                </div>

                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 ring-4 ring-white" />
                  <div className="flex justify-between">
                    <span className="font-bold text-rose-600">05. 官方核销返回异常阻断</span>
                    <span className="text-rose-500 font-code-token text-[10.5px]">14:22:42.100 (+31.5s)</span>
                  </div>
                  <p className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-100 mt-1">
                    {anomaly.summary} · 网关回执: &quot;{anomaly.detailLog.gatewayResponse}&quot;
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: OCR */}
          {activeTab === 'ocr' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-800">OCR 图像与卡密哈希比对</span>
                  <span className="text-emerald-700 font-semibold font-code-token text-[11px]">
                    置信度评分: {anomaly.detailLog.ocrConfidence}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">识别卡密明文</span>
                    <span className="font-mono font-bold text-slate-900">
                      ABCD-****-****-EF92
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">图像防伪与反光指纹</span>
                    <span className="font-mono font-semibold text-emerald-700">PASS (无涂抹PS)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Payload */}
          {activeTab === 'payload' && (
            <div className="space-y-2">
              <span className="text-slate-500 font-semibold block text-[11px]">
                API 交互 Raw JSON Payload (HTTP 422 Gateway Response):
              </span>
              <pre className="p-3 bg-slate-950 text-emerald-400 rounded-xl font-mono text-[10.5px] overflow-x-auto leading-relaxed">
{JSON.stringify(
  {
    transaction_id: anomaly.typicalTxId,
    timestamp_utc: anomaly.detailLog.reportedAt,
    merchant_id: anomaly.detailLog.merchantName,
    error_code: 'ERR_CARD_ALREADY_REDEEMED',
    gateway_message: anomaly.detailLog.gatewayResponse,
    official_provider_ref: 'REF-OFFICIAL-992144-NYC',
    dispute_classification: anomaly.causeCategory,
    risk_score: anomaly.detailLog.riskScore,
    responsible_side: anomaly.responsibleParty,
  },
  null,
  2
)}
              </pre>
            </div>
          )}

          {/* Tab 4: Decision */}
          {activeTab === 'decision' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl">
                <span className="font-bold text-blue-900 block text-xs">
                  风控处置决议建议 (Arbitration Recommendation)
                </span>
                <p className="text-xs text-blue-800/90 mt-1">
                  {anomaly.detailLog.auditDecision}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => handleAction('已触发要求商户在 2 小时内上传兑换时间日志与官方回执')}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer"
                >
                  要求商户 2h 内补证
                </button>
                <button
                  onClick={() => handleAction('已将该单标记为先行垫付，已向申报用户账户原路返还')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
                >
                  平台先行垫付并追偿
                </button>
                <button
                  onClick={() => handleAction('已将关联用户申报特征与卡密前缀加入风险观察名单')}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium cursor-pointer"
                >
                  列入风控黑名单
                </button>
              </div>

              {actionDoneMsg && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs animate-fadeIn flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>{actionDoneMsg}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div>
            {onNavigateToOrder && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToOrder(anomaly.typicalTxId);
                }}
                className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>跳转至订单中心查看详情</span>
                <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium cursor-pointer"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
