import React, { useState, useEffect } from 'react';
import { BusinessReasonItem } from './types';

interface EditI18nModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: BusinessReasonItem | null;
  onSave: (updatedReason: BusinessReasonItem) => void;
}

export const EditI18nModal: React.FC<EditI18nModalProps> = ({
  isOpen,
  onClose,
  reason,
  onSave,
}) => {
  const [zhText, setZhText] = useState('');
  const [enText, setEnText] = useState('');
  const [pidginText, setPidginText] = useState('');
  const [userAppTip, setUserAppTip] = useState('');
  const [merchantJson, setMerchantJson] = useState('');

  useEffect(() => {
    if (reason) {
      setZhText(reason.i18n.zhCN.text);
      setEnText(reason.i18n.enUS.text);
      setPidginText(reason.i18n.pidgin.text);
      setUserAppTip(reason.clientRenders.userAppTip);
      setMerchantJson(reason.clientRenders.merchantApiError.json);
    }
  }, [reason, isOpen]);

  if (!isOpen || !reason) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: BusinessReasonItem = {
      ...reason,
      i18n: {
        zhCN: { ...reason.i18n.zhCN, text: zhText.trim() },
        enUS: { ...reason.i18n.enUS, text: enText.trim() },
        pidgin: { ...reason.i18n.pidgin, text: pidginText.trim() },
      },
      clientRenders: {
        ...reason.clientRenders,
        userAppTip: userAppTip.trim(),
        merchantApiError: {
          ...reason.clientRenders.merchantApiError,
          json: merchantJson.trim(),
        },
      },
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">translate</span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">修改跨语言映射与终端仿真译文</h3>
              <span className="text-[11px] font-mono text-blue-700 font-semibold">
                目标编码: {reason.code}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-700 font-semibold text-xs">简体中文 (zh-CN) 标准译文</label>
              <span className="text-[10px] font-mono text-slate-400">DEFAULT</span>
            </div>
            <textarea
              rows={2}
              value={zhText}
              onChange={(e) => setZhText(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-mono text-slate-800 text-xs focus:bg-white focus:border-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-700 font-semibold text-xs">英语 (en-US) 国际标准译文</label>
              <span className="text-[10px] font-mono text-emerald-600 font-medium">VERIFIED</span>
            </div>
            <textarea
              rows={2}
              value={enText}
              onChange={(e) => setEnText(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-mono text-slate-800 text-xs focus:bg-white focus:border-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-700 font-semibold text-xs">西非洋泾浜英语 (Pidgin / Local)</label>
              <span className="text-[10px] font-mono text-emerald-600 font-medium">NIGERIA HUB</span>
            </div>
            <textarea
              rows={2}
              value={pidginText}
              onChange={(e) => setPidginText(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-mono text-slate-800 text-xs focus:bg-white focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-slate-700 font-semibold text-xs block mb-1">
              出卡端移动 App UI 弹窗回显文案
            </label>
            <input
              value={userAppTip}
              onChange={(e) => setUserAppTip(e.target.value)}
              className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 text-xs focus:bg-white focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-slate-700 font-semibold text-xs block mb-1">
              商户端 OpenAPI 报错报文 (JSON)
            </label>
            <input
              value={merchantJson}
              onChange={(e) => setMerchantJson(e.target.value)}
              className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-800 text-xs focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-medium cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              更新并存证
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
