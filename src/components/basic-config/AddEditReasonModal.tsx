import React, { useState, useEffect } from 'react';
import { BusinessReasonItem } from './types';

interface AddEditReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  reasonToEdit?: BusinessReasonItem | null;
  onSave: (reason: BusinessReasonItem) => void;
}

export const AddEditReasonModal: React.FC<AddEditReasonModalProps> = ({
  isOpen,
  onClose,
  reasonToEdit,
  onSave,
}) => {
  const [shortCode, setShortCode] = useState('');
  const [codeIdentifier, setCodeIdentifier] = useState('');
  const [nameZh, setNameZh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [domain, setDomain] = useState<'F' | 'A' | 'D' | 'ADJ'>('F');
  const [actionDecision, setActionDecision] = useState('');
  const [actionTooltip, setActionTooltip] = useState('');
  const [dependencies, setDependencies] = useState<string[]>(['交易']);
  const [zhText, setZhText] = useState('');
  const [enText, setEnText] = useState('');
  const [pidginText, setPidginText] = useState('');
  const [userAppTip, setUserAppTip] = useState('');
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (reasonToEdit) {
      setShortCode(reasonToEdit.shortCode);
      setCodeIdentifier(reasonToEdit.code.replace(`[${reasonToEdit.shortCode}] `, ''));
      setNameZh(reasonToEdit.nameZh);
      setNameEn(reasonToEdit.nameEn);
      setDomain(reasonToEdit.domain);
      setActionDecision(reasonToEdit.actionDecision);
      setActionTooltip(reasonToEdit.actionTooltip);
      setDependencies(reasonToEdit.dependencies);
      setZhText(reasonToEdit.i18n.zhCN.text);
      setEnText(reasonToEdit.i18n.enUS.text);
      setPidginText(reasonToEdit.i18n.pidgin.text);
      setUserAppTip(reasonToEdit.clientRenders.userAppTip);
      setEnabled(reasonToEdit.enabled);
    } else {
      setShortCode('F006');
      setCodeIdentifier('ERR_BALANCE_INSUFFICIENT');
      setNameZh('卡内可用余额不足');
      setNameEn('Insufficient Card Balance');
      setDomain('F');
      setActionDecision('提示出卡方核对卡片消费记录并重新核实');
      setActionTooltip('卡内实际可用承兑金额小于用户所选报单面额');
      setDependencies(['交易', '出卡端']);
      setZhText('卡内实际可用余额不足以支持本次兑换。');
      setEnText('Insufficient balance on this gift card.');
      setPidginText('The card no get enough money reach wetin you enter.');
      setUserAppTip('抱歉，此卡经官方核验余额不足，请核实消费记录。');
      setEnabled(true);
    }
  }, [reasonToEdit, isOpen]);

  if (!isOpen) return null;

  const handleToggleDep = (dep: string) => {
    if (dependencies.includes(dep)) {
      if (dependencies.length > 1) {
        setDependencies(dependencies.filter((d) => d !== dep));
      }
    } else {
      setDependencies([...dependencies, dep]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortCode.trim() || !nameZh.trim()) return;

    const domainLabels: Record<string, string> = {
      F: '交易失败',
      A: '异常阻断',
      D: '售后争议',
      ADJ: '财务调账',
    };

    const fullCode = `[${shortCode.trim()}] ${codeIdentifier.trim() || 'ERR_CUSTOM'}`;

    const newOrUpdated: BusinessReasonItem = {
      id: reasonToEdit ? reasonToEdit.id : `108${Math.floor(50 + Math.random() * 50)}`,
      code: fullCode,
      shortCode: shortCode.trim(),
      nameZh: nameZh.trim(),
      nameEn: nameEn.trim() || 'Custom Reason',
      domain,
      domainLabel: domainLabels[domain] || '业务原因',
      actionDecision: actionDecision.trim() || '系统自动处理',
      actionTooltip: actionTooltip.trim() || actionDecision.trim(),
      dependencies,
      enabled,
      constraintLevel: reasonToEdit?.constraintLevel || 'LEVEL-1 (禁止硬删除)',
      todayHits: reasonToEdit?.todayHits || 0,
      i18n: {
        zhCN: { text: zhText.trim(), note: 'DEFAULT' },
        enUS: { text: enText.trim(), note: 'VERIFIED' },
        pidgin: { text: pidginText.trim(), note: 'NIGERIA HUB' },
      },
      clientRenders: {
        userAppTip: userAppTip.trim(),
        merchantApiError: reasonToEdit?.clientRenders.merchantApiError || {
          httpStatus: 'HTTP 422 Unprocessable',
          json: `{"err_code": "${shortCode.trim()}", "reason": "${codeIdentifier.trim()}", "retryable": false}`,
        },
      },
    };

    onSave(newOrUpdated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">
              {reasonToEdit ? 'edit_note' : 'add_circle'}
            </span>
            <h3 className="font-bold text-slate-900 text-sm">
              {reasonToEdit ? '编辑业务原因字典项' : '新增业务原因字典项 (Create Reason Code)'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs max-h-[78vh] overflow-y-auto">
          {/* Row 1: Code and Domain */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-600 block mb-1 font-medium">
                短编码 (如 F001, A014) *
              </label>
              <input
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value.toUpperCase())}
                placeholder="F001"
                required
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-blue-700 uppercase"
              />
            </div>

            <div>
              <label className="text-slate-600 block mb-1 font-medium">系统标识符 (IDENTIFIER)</label>
              <input
                value={codeIdentifier}
                onChange={(e) => setCodeIdentifier(e.target.value.toUpperCase())}
                placeholder="ERR_CODE_REDEEMED"
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-800 uppercase"
              />
            </div>

            <div>
              <label className="text-slate-600 block mb-1 font-medium">所属业务领域 *</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value as any)}
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800"
              >
                <option value="F">交易失败 [F]</option>
                <option value="A">异常阻断 [A]</option>
                <option value="D">售后争议 [D]</option>
                <option value="ADJ">财务调账 [ADJ]</option>
              </select>
            </div>
          </div>

          {/* Row 2: Chinese and English Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 block mb-1 font-medium">标准业务语义 / 中文定义 *</label>
              <input
                value={nameZh}
                onChange={(e) => setNameZh(e.target.value)}
                placeholder="如: 卡密已被他人兑换"
                required
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 font-medium"
              />
            </div>
            <div>
              <label className="text-slate-600 block mb-1 font-medium">英文名称 (English Name)</label>
              <input
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Already Redeemed Prior"
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-800"
              />
            </div>
          </div>

          {/* Row 3: Action Decision and Tooltip */}
          <div className="space-y-2">
            <div>
              <label className="text-slate-600 block mb-1 font-medium">建议处置决策动作</label>
              <input
                value={actionDecision}
                onChange={(e) => setActionDecision(e.target.value)}
                placeholder="如: 判定出卡方欺诈出旧卡，驳回申诉"
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800"
              />
            </div>
            <div>
              <label className="text-slate-600 block mb-1 font-medium">业务背景与规约说明 (Tooltip)</label>
              <input
                value={actionTooltip}
                onChange={(e) => setActionTooltip(e.target.value)}
                placeholder="完整业务执行细则与违约处罚说明..."
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800"
              />
            </div>
          </div>

          {/* Row 4: Dependencies */}
          <div>
            <label className="text-slate-600 block mb-1 font-medium">关联依赖系统</label>
            <div className="flex flex-wrap gap-2">
              {['交易', '仲裁', '出卡端', '风控', '财务', '清算', '网关'].map((dep) => {
                const isSelected = dependencies.includes(dep);
                return (
                  <button
                    key={dep}
                    type="button"
                    onClick={() => handleToggleDep(dep)}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {dep}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 5: i18n Texts */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
              多语言与回显仿真文案
            </span>

            <div>
              <label className="text-slate-500 block mb-1 text-[11px]">简体中文 (zh-CN) 提示文案</label>
              <input
                value={zhText}
                onChange={(e) => setZhText(e.target.value)}
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="text-slate-500 block mb-1 text-[11px]">英语 (en-US) 提示文案</label>
              <input
                value={enText}
                onChange={(e) => setEnText(e.target.value)}
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="text-slate-500 block mb-1 text-[11px]">
                西非洋泾浜英语 (Pidgin / Local)
              </label>
              <input
                value={pidginText}
                onChange={(e) => setPidginText(e.target.value)}
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="text-slate-500 block mb-1 text-[11px]">
                出卡用户端 App UI 告警文案
              </label>
              <input
                value={userAppTip}
                onChange={(e) => setUserAppTip(e.target.value)}
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300"
              />
              <span className="text-xs text-slate-700 font-medium">立即发布生效 (Active)</span>
            </label>

            <div className="flex items-center gap-2">
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
                保存并广播全网
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
