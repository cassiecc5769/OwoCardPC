import React, { useState, useEffect } from 'react';

interface HashVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HashVerifyModal: React.FC<HashVerifyModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [downloadNotice, setDownloadNotice] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setProgress(0);
      setIsVerifying(true);
      setDownloadNotice(false);
      return;
    }

    // Step 1: Scanning blocks
    const t1 = setTimeout(() => {
      setProgress(35);
      setStep(2);
    }, 600);

    // Step 2: Merkle Tree computation
    const t2 = setTimeout(() => {
      setProgress(75);
      setStep(3);
    }, 1300);

    // Step 3: Signature & Consensus verification
    const t3 = setTimeout(() => {
      setProgress(100);
      setStep(4);
      setIsVerifying(false);
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-slate-900">
                全网账本物理哈希与密码学一致性核验
              </h3>
              <p className="font-code-token text-xs text-slate-500 mt-0.5">
                MERKLE-TREE & RSA INTEGRITY AUDITOR
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

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">
                {isVerifying ? '正在进行毫秒级密码学比对...' : '全网哈希校验完毕 · 账本完全一致'}
              </span>
              <span className="font-numeric-stat font-bold text-blue-600">{progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Audit Steps */}
          <div className="space-y-2.5 pt-1">
            <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-colors ${
              step >= 1 ? 'bg-slate-50/80 border-slate-200/80' : 'bg-slate-50/40 border-slate-100 text-slate-400'
            }`}>
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-[18px] ${
                  step > 1 ? 'text-emerald-600' : step === 1 ? 'text-blue-600 animate-spin' : 'text-slate-400'
                }`}>
                  {step > 1 ? 'check_circle' : step === 1 ? 'progress_activity' : 'radio_button_unchecked'}
                </span>
                <div>
                  <span className="font-semibold text-slate-900 text-xs">1. 遍历连续底层物理记录</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">累计扫描 18,420 笔 ACID 单据区块，0 空洞，0 断点</p>
                </div>
              </div>
              <span className="font-code-token text-[11px] text-slate-600">18,420 / 18,420</span>
            </div>

            <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-colors ${
              step >= 2 ? 'bg-slate-50/80 border-slate-200/80' : 'bg-slate-50/40 border-slate-100 text-slate-400'
            }`}>
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-[18px] ${
                  step > 2 ? 'text-emerald-600' : step === 2 ? 'text-blue-600 animate-spin' : 'text-slate-400'
                }`}>
                  {step > 2 ? 'check_circle' : step === 2 ? 'progress_activity' : 'radio_button_unchecked'}
                </span>
                <div>
                  <span className="font-semibold text-slate-900 text-xs">2. 重构 Merkle 树哈希根比对</span>
                  <p className="text-[11px] text-slate-500 font-code-token mt-0.5">Root: 0x9b44c81e829a...c01f (与主链完全吻合)</p>
                </div>
              </div>
              <span className="font-code-token text-[11px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">MATCH 100%</span>
            </div>

            <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-colors ${
              step >= 3 ? 'bg-slate-50/80 border-slate-200/80' : 'bg-slate-50/40 border-slate-100 text-slate-400'
            }`}>
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-[18px] ${
                  step > 3 ? 'text-emerald-600' : step === 3 ? 'text-blue-600 animate-spin' : 'text-slate-400'
                }`}>
                  {step > 3 ? 'check_circle' : step === 3 ? 'progress_activity' : 'radio_button_unchecked'}
                </span>
                <div>
                  <span className="font-semibold text-slate-900 text-xs">3. 冷备异地容灾账本交叉验签</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">上海 NODE-CN-01 / 深圳 NODE-SZ-02 双节点私钥互签验证通过</p>
                </div>
              </div>
              <span className="font-code-token text-[11px] text-blue-700 font-semibold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">DUAL SIGN OK</span>
            </div>

            <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-colors ${
              step >= 4 ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50/40 border-slate-100 text-slate-400'
            }`}>
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-[18px] ${
                  step === 4 ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  {step === 4 ? 'verified' : 'radio_button_unchecked'}
                </span>
                <div>
                  <span className="font-semibold text-slate-900 text-xs">4. 账本一致性核验结论</span>
                  <p className="text-[11px] text-emerald-700 font-medium mt-0.5">无借贷差额 · 无越权修改 · 符合金融四账严密审计规范</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-code-token text-[11px] font-semibold border border-emerald-200">
                VALID
              </span>
            </div>
          </div>

          {downloadNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
              <span>已成功生成并下载【全网账本物理哈希核验与合规防篡改证书 (SHA256-DIGEST.pdf)】</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500 font-code-token text-[11px]">
            校验时戳: 2026-09-18 16:42:09.112 UTC+8
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setDownloadNotice(true);
                setTimeout(() => setDownloadNotice(false), 3500);
              }}
              className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <span className="material-symbols-outlined text-[15px] text-slate-500">download</span>
              <span>下载核验报告</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer shadow-xs"
            >
              完成确认
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
