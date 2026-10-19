import React from 'react';
import type { CardEntryElement } from './types';
import { EntryValueRuleEditor } from './EntryValueRuleEditor';

type EntryDraft = Omit<CardEntryElement, 'id'>;

interface Props {
  draft: EntryDraft;
  editing: boolean;
  elementTypes: { type: string; name: string; property: '图片' | '文本类' }[];
  error: string;
  onChange: (patch: Partial<EntryDraft>) => void;
  onTypeChange: (type: string) => void;
  onClose: () => void;
  onSave: () => void;
}

const fieldClass = 'w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500';

export const EntryElementModal: React.FC<Props> = ({ draft, editing, elementTypes, error, onChange, onTypeChange, onClose, onSave }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4">
    <div className="w-full max-w-3xl max-h-[90vh] rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
        <h4 className="font-bold text-slate-900">{editing ? '编辑录入要素' : '新增录入要素'}</h4>
        <button type="button" onClick={onClose} aria-label="关闭录入要素设置" className="text-slate-400 hover:text-slate-700 cursor-pointer"><span className="material-symbols-outlined">close</span></button>
      </div>
      <div className="p-5 space-y-4 text-xs overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block"><span className="font-semibold text-slate-800 block mb-1.5">要素类型 <span className="text-rose-500">*</span></span><select value={draft.type} onChange={(event) => onTypeChange(event.target.value)} className={`${fieldClass} cursor-pointer`}>{elementTypes.map((item) => <option key={item.type} value={item.type}>{item.type}</option>)}</select></label>
          <label className="block"><span className="font-semibold text-slate-800 block mb-1.5">要素名称 <span className="text-rose-500">*</span> <span className="font-normal text-slate-400">APP端展示</span></span><input value={draft.name} onChange={(event) => onChange({ name: event.target.value, prompt: `Enter a Valid ${event.target.value}` })} className={fieldClass} /></label>
          <div><span className="font-semibold text-slate-800 block mb-1.5">要素属性</span><div className="h-9 px-3 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 flex items-center"><span className="material-symbols-outlined text-[16px] mr-1.5">{draft.property === '图片' ? 'image' : 'text_fields'}</span>{draft.property}（由类型自动确定）</div></div>
          <label className="block"><span className="font-semibold text-slate-800 block mb-1.5">要素录入提示词 <span className="text-rose-500">*</span></span><input value={draft.prompt} onChange={(event) => onChange({ prompt: event.target.value })} className={fieldClass} /></label>
        </div>
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="font-bold text-slate-800">要素录入规则</div>
          <div role="radiogroup" aria-label="是否必填" className="flex items-center gap-4">
            <span className="font-semibold text-slate-800">是否必填</span>
            <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700"><input type="radio" name="entry-required" checked={draft.required} onChange={() => onChange({ required: true })} className="accent-blue-600" />是</label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700"><input type="radio" name="entry-required" checked={!draft.required} onChange={() => onChange({ required: false })} className="accent-blue-600" />否</label>
          </div>
          <EntryValueRuleEditor element={draft} onChange={onChange} />
        </div>
        {error && <div role="alert" className="px-3 py-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-700">{error}</div>}
      </div>
      <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0">
        <button type="button" onClick={onClose} className="h-8 px-3.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer">取消</button>
        <button type="button" onClick={onSave} className="h-8 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer">保存要素</button>
      </div>
    </div>
  </div>
);
