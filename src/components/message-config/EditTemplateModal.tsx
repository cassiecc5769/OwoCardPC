import React, { useState, useEffect } from 'react';
import { MessageTemplateItem } from './types';
import { SYSTEM_VARIABLES } from './mockData';

interface EditTemplateModalProps {
  template: MessageTemplateItem | null;
  onClose: () => void;
  onSave: (updatedTemplate: MessageTemplateItem) => void;
}

export const EditTemplateModal: React.FC<EditTemplateModalProps> = ({
  template,
  onClose,
  onSave,
}) => {
  if (!template) return null;

  const [name, setName] = useState(template.name);
  const [category, setCategory] = useState(template.category);
  const [smsBody, setSmsBody] = useState(template.smsBody);
  const [pushTitle, setPushTitle] = useState(template.pushTitle);
  const [pushBody, setPushBody] = useState(template.pushBody);
  const [activeTab, setActiveTab] = useState<'sms' | 'push' | 'email'>('sms');

  useEffect(() => {
    setName(template.name);
    setCategory(template.category);
    setSmsBody(template.smsBody);
    setPushTitle(template.pushTitle);
    setPushBody(template.pushBody);
  }, [template]);

  const insertVariable = (variableKey: string) => {
    if (activeTab === 'sms') {
      setSmsBody((prev) => prev + variableKey);
    } else if (activeTab === 'push') {
      setPushBody((prev) => prev + variableKey);
    }
  };

  const handleSave = () => {
    const updated: MessageTemplateItem = {
      ...template,
      name,
      category,
      smsBody,
      pushTitle,
      pushBody,
      charCount: smsBody.length,
      smsSegments: Math.ceil(smsBody.length / 70) || 1,
      lastEditedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      lastEditedBy: '超级管理员 (AD)',
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
              <span className="material-symbols-outlined text-[20px]">edit_note</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                编辑消息模板 · <span className="font-mono text-blue-600">{template.id}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                支持多通道文案定制与系统动态变量解包插值
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">模板标题</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">业务分类</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="交易结算">交易结算</option>
                <option value="交易撮合">交易撮合</option>
                <option value="履约超时">履约超时</option>
                <option value="售后仲裁">售后仲裁</option>
                <option value="资金财务">资金财务</option>
                <option value="运营会员">运营会员</option>
              </select>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('sms')}
              className={`px-3 py-1 rounded-lg font-medium cursor-pointer ${
                activeTab === 'sms'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              SMS 短信正文
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('push')}
              className={`px-3 py-1 rounded-lg font-medium cursor-pointer ${
                activeTab === 'push'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              App Push 标题与正文
            </button>
          </div>

          {activeTab === 'sms' && (
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                短信模版正文 (已输入 {smsBody.length} 字，约计 {Math.ceil(smsBody.length / 70)} 条计费短信)
              </label>
              <textarea
                rows={5}
                value={smsBody}
                onChange={(e) => setSmsBody(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans leading-relaxed focus:ring-1 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          )}

          {activeTab === 'push' && (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Push 标头</label>
                <input
                  type="text"
                  value={pushTitle}
                  onChange={(e) => setPushTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Push 正文</label>
                <textarea
                  rows={4}
                  value={pushBody}
                  onChange={(e) => setPushBody(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans leading-relaxed focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* Quick Insert Variables */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-600 font-semibold">
                点击直接插入变量占位符到光标末尾:
              </span>
              <span className="text-slate-400 font-mono text-[11px]">8 个常用变量</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SYSTEM_VARIABLES.slice(0, 8).map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => insertVariable(v.key)}
                  className="px-2 py-1 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 font-mono text-[11px] text-slate-700 cursor-pointer border border-slate-200 transition-colors"
                >
                  + {v.key}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>保存模板配置</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
