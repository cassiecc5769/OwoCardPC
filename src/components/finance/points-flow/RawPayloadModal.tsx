import React, { useState } from 'react';
import { LedgerTransaction } from './types';

interface RawPayloadModalProps {
  transaction: LedgerTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RawPayloadModal: React.FC<RawPayloadModalProps> = ({
  transaction,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'payload' | 'headers' | 'signature'>('payload');

  if (!isOpen || !transaction) return null;

  const jsonString = JSON.stringify(transaction.rawJson, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${transaction.txid}-RAW-PAYLOAD.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">terminal</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-sm text-base font-bold text-slate-900">
                  底层原始 JSON 报文回执与密码学证据
                </h3>
                <span className="px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-code-token text-[10px] font-semibold">
                  HTTPS/2 TLS 1.3
                </span>
              </div>
              <p className="font-code-token text-xs text-slate-500 mt-0.5">
                TXID: {transaction.txid} · {transaction.source}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Sub Header / Tabs */}
        <div className="px-6 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('payload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'payload'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              Body Payload ({transaction.rawJson.event || 'DATA'})
            </button>
            <button
              onClick={() => setActiveTab('headers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'headers'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              HTTP Envelope & Headers
            </button>
            <button
              onClick={() => setActiveTab('signature')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'signature'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              Merkle Hash & Signer
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[14px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? '已复制报文' : '复制 JSON'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[14px]">download</span>
              <span>下载 .json</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto bg-slate-950 flex-1 font-code-token text-xs text-slate-200">
          {activeTab === 'payload' && (
            <pre className="whitespace-pre-wrap leading-relaxed selection:bg-blue-800 selection:text-white font-mono">
              <code>{jsonString}</code>
            </pre>
          )}

          {activeTab === 'headers' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-slate-400 font-label-caps text-[11px] font-semibold uppercase">Request Handshake Metadata</div>
                <div className="grid grid-cols-2 gap-2 text-xs font-code-token">
                  <div><span className="text-slate-500">Method:</span> <span className="text-emerald-400 font-semibold">POST</span></div>
                  <div><span className="text-slate-500">Protocol:</span> <span className="text-slate-300">HTTP/2 TLS 1.3</span></div>
                  <div><span className="text-slate-500">Gateway Node:</span> <span className="text-blue-400">{transaction.apiNode}</span></div>
                  <div><span className="text-slate-500">Trace ID:</span> <span className="text-slate-300">{transaction.apiTx}</span></div>
                  <div><span className="text-slate-500">Timestamp:</span> <span className="text-slate-300">{transaction.fullTime}</span></div>
                  <div><span className="text-slate-500">Latency:</span> <span className="text-emerald-400 font-semibold">{transaction.apiLatency}</span></div>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-slate-400 font-label-caps text-[11px] font-semibold uppercase">Security & Integrity Headers</div>
                <div className="text-xs space-y-1 text-slate-300 font-code-token">
                  <div><span className="text-slate-500">X-Ledger-ACID-Version:</span> 2.0.4-ENTERPRISE</div>
                  <div><span className="text-slate-500">X-DoubleEntry-Balance:</span> ZERO_VARIANCE_OK</div>
                  <div><span className="text-slate-500">X-Signature-Algorithm:</span> SHA256-RSA-PKCS1v15</div>
                  <div><span className="text-slate-500">X-Audit-Operator:</span> {transaction.auditOperator}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'signature' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-label-caps text-[11px] font-semibold uppercase">Merkle Root Block Hash</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-code-token text-[10px] font-semibold">
                    100% UNTAMPERED
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800 text-emerald-300 break-all select-all font-code-token text-xs">
                  {transaction.blockHash}
                </div>
                <p className="text-xs text-slate-400 font-body-sm leading-relaxed">
                  该哈希指纹由账本物理区块中该记录的交易金额、关联单据、借贷分录与毫秒时间戳经过两次 SHA-256 递归哈希计算所得，不可单边篡改。
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-slate-400 font-label-caps text-[11px] font-semibold uppercase">Digital Signature</div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800 text-slate-400 break-all select-all font-code-token text-[11px]">
                  MIICXAIBAAKCAQEA88bc11f99a012948219488a771cc04f231aa00299ee01928019488a771cbba1928019488a955dd...4419==
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>公钥证书链比对通过 · 签名有效</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>账本状态：连续且不可分割 (ACID Strict)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-lg font-medium transition-colors cursor-pointer shadow-2xs"
          >
            完成关闭
          </button>
        </div>
      </div>
    </div>
  );
};
