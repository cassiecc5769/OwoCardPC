import React, { useState } from 'react';
import { MessageTemplateItem, VariableItem } from './types';
import { SYSTEM_VARIABLES } from './mockData';

interface TemplatesGovernanceTabProps {
  templates: MessageTemplateItem[];
  onSelectTemplate: (template: MessageTemplateItem) => void;
  onEditTemplate: (template: MessageTemplateItem) => void;
  onTestDispatch: (template: MessageTemplateItem) => void;
  onCopyVariable: (key: string) => void;
}

export const TemplatesGovernanceTab: React.FC<TemplatesGovernanceTabProps> = ({
  templates,
  onSelectTemplate,
  onEditTemplate,
  onTestDispatch,
  onCopyVariable,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [variableCategory, setVariableCategory] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const categories = ['all', '交易结算', '交易撮合', '履约超时', '售后仲裁', '资金财务', '运营会员'];

  const filteredTemplates = templates.filter((t) => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    return true;
  });

  const filteredVariables = SYSTEM_VARIABLES.filter((v) => {
    if (variableCategory !== 'all' && v.category !== variableCategory) return false;
    return true;
  });

  const handleCopy = (key: string) => {
    navigator.clipboard?.writeText(key);
    setCopiedKey(key);
    onCopyVariable(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Category selector */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-700 mr-2">模板业务分类:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat === 'all' ? '全部分类 (58套)' : cat}
            </button>
          ))}
        </div>

        <div className="text-xs font-mono text-slate-500">
          已纳管 <span className="font-bold text-blue-600">{filteredTemplates.length}</span> 套活跃模板
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-sm hover:border-blue-300 transition-all p-4 flex flex-col justify-between gap-3"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{template.name}</span>
                    <span className="font-mono text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-100 font-semibold">
                      {template.version}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-blue-600 font-medium mt-0.5">
                    {template.id}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-medium shrink-0">
                  {template.category}
                </span>
              </div>

              {/* Body snippet */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-600 leading-relaxed line-clamp-3">
                {template.smsBody}
              </div>

              {/* Supported channel chips */}
              <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400">支持渠道:</span>
                {template.channelsSupported.map((ch) => (
                  <span
                    key={ch}
                    className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-mono uppercase"
                  >
                    {ch}
                  </span>
                ))}
              </div>

              {/* Variables count */}
              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span>引用变量: {template.variableKeys.length} 个</span>
                <span>字数: {template.charCount} 字</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => onTestDispatch(template)}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">send</span>
                <span>测试</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectTemplate(template)}
                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">preview</span>
                <span>沙盒预览</span>
              </button>
              <button
                type="button"
                onClick={() => onEditTemplate(template)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
                <span>编辑</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* System Variables Dictionary */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
              <span className="material-symbols-outlined text-[18px]">data_object</span>
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                全域动态变量字典池 (18 个标准占位符)
              </h3>
              <p className="text-xs text-slate-500">
                支持在任何模版中通过双大括号无缝插值，系统在事件流转时毫秒级解包注入
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setVariableCategory('all')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium cursor-pointer ${
                variableCategory === 'all' ? 'bg-white text-purple-700 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              全部
            </button>
            <button
              type="button"
              onClick={() => setVariableCategory('user')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium cursor-pointer ${
                variableCategory === 'user' ? 'bg-white text-purple-700 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              用户主体
            </button>
            <button
              type="button"
              onClick={() => setVariableCategory('card')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium cursor-pointer ${
                variableCategory === 'card' ? 'bg-white text-purple-700 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              卡券标的
            </button>
            <button
              type="button"
              onClick={() => setVariableCategory('finance')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium cursor-pointer ${
                variableCategory === 'finance' ? 'bg-white text-purple-700 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              资产财务
            </button>
            <button
              type="button"
              onClick={() => setVariableCategory('sla')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium cursor-pointer ${
                variableCategory === 'sla' ? 'bg-white text-purple-700 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              时序SLA
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredVariables.map((v) => {
            const isCopied = copiedKey === v.key;
            return (
              <div
                key={v.key}
                onClick={() => handleCopy(v.key)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isCopied
                    ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20 shadow-xs'
                    : 'bg-slate-50 hover:bg-purple-50/50 hover:border-purple-200 border-slate-200/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-purple-700 truncate">
                    {v.key}
                  </span>
                  <span className="material-symbols-outlined text-[14px] text-slate-400">
                    {isCopied ? 'check' : 'content_copy'}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-800">{v.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{v.desc}</div>
                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">示例值:</span>
                  <span className="text-emerald-700 font-semibold truncate max-w-[120px]">
                    {v.example}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
