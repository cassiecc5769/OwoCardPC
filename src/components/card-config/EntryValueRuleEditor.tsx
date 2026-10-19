import React, { useState } from 'react';
import type { CardEntryAllowedFormat, CardEntryCharacterSet, CardEntryConditionType, CardEntryElement, CardEntryRuleCondition } from './types';
import { validateEntryRuleConfiguration, validateTextEntryValue } from './entryValidation';

type EntryDraft = Omit<CardEntryElement, 'id'>;

interface Props {
  element: EntryDraft;
  onChange: (patch: Partial<EntryDraft>) => void;
}

const CONDITION_TYPES: { value: CardEntryConditionType; label: string }[] = [
  { value: 'fixedLength', label: '固定长度' },
  { value: 'lengthRange', label: '长度区间' },
  { value: 'characters', label: '允许字符' },
  { value: 'prefix', label: '固定前缀' },
  { value: 'suffix', label: '固定后缀' },
  { value: 'position', label: '指定位置内容' },
  { value: 'allowedValues', label: '只允许指定值' },
  { value: 'blockedValues', label: '禁止指定值' },
];
const IMAGE_FORMATS = ['JPG', 'PNG', 'WebP'] as const;
const fieldClass = 'h-8 px-2.5 rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500';
const id = () => `rule-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const newCondition = (type: CardEntryConditionType = 'fixedLength'): CardEntryRuleCondition => ({ id: id(), type, characterSet: 'alphanumeric' });

export const EntryValueRuleEditor: React.FC<Props> = ({ element, onChange }) => {
  const [testInput, setTestInput] = useState('');
  const [tested, setTested] = useState(false);
  const formats = element.allowedFormats || [];
  const configurationError = validateEntryRuleConfiguration(element);
  const testResult = tested ? validateTextEntryValue({ ...element, id: 'test' }, testInput) : null;

  const changeFormats = (next: CardEntryAllowedFormat[]) => onChange({ allowedFormats: next });
  const patchFormat = (formatId: string, patch: Partial<CardEntryAllowedFormat>) => changeFormats(formats.map((format) => format.id === formatId ? { ...format, ...patch } : format));
  const patchCondition = (format: CardEntryAllowedFormat, conditionId: string, patch: Partial<CardEntryRuleCondition>) => patchFormat(format.id, {
    conditions: format.conditions.map((condition) => condition.id === conditionId ? { ...condition, ...patch } : condition),
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label htmlFor="entry-value-rule" className="font-semibold text-slate-800 shrink-0">录入值限制</label>
        <select id="entry-value-rule" value={element.valueRule} onChange={(event) => onChange({ valueRule: event.target.value as EntryDraft['valueRule'] })} className={`${fieldClass} w-28 cursor-pointer`}>
          <option>不限</option><option>限制</option>
        </select>
      </div>

      {element.valueRule === '限制' && element.property === '图片' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <label className="space-y-1"><span className="font-medium text-slate-700">最多上传张数</span><input type="number" min="1" max="20" value={element.maxImages ?? 20} onChange={(event) => onChange({ maxImages: Number(event.target.value) })} className={`${fieldClass} w-full`} /></label>
          <label className="space-y-1"><span className="font-medium text-slate-700">单张大小上限（MB）</span><input type="number" min="0.1" step="0.1" value={element.maxImageSizeMB ?? ''} onChange={(event) => onChange({ maxImageSizeMB: event.target.value ? Number(event.target.value) : undefined })} placeholder="不限制" className={`${fieldClass} w-full`} /></label>
          <div className="space-y-1"><span className="font-medium text-slate-700">允许图片格式</span><div className="flex flex-wrap gap-1.5 pt-1">{IMAGE_FORMATS.map((format) => {
            const selected = element.allowedImageFormats?.includes(format) ?? false;
            return <button key={format} type="button" aria-pressed={selected} onClick={() => onChange({ allowedImageFormats: selected ? (element.allowedImageFormats || []).filter((item) => item !== format) : [...(element.allowedImageFormats || []), format] })} className={`px-2 py-1 rounded border cursor-pointer ${selected ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-600'}`}>{format}</button>;
          })}</div><span className="text-[10px] text-slate-400">未选择表示不限格式</span></div>
        </div>
      )}

      {element.valueRule === '限制' && element.property === '文本类' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-500">多套格式满足任意一套即可；每套格式内须满足全部条件。</span>
            <button type="button" onClick={() => changeFormats([...formats, { id: id(), name: `格式 ${formats.length + 1}`, conditions: [] }])} className="h-8 px-3 shrink-0 rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50 font-medium cursor-pointer">＋ 新增允许格式</button>
          </div>
          {formats.length === 0 && <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-5 text-center text-slate-500">尚未配置允许格式</div>}
          {formats.map((format, index) => (
            <div key={format.id} className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                <span className="font-semibold text-slate-700 shrink-0">格式 {index + 1}</span>
                <input aria-label={`格式 ${index + 1} 名称`} value={format.name} onChange={(event) => patchFormat(format.id, { name: event.target.value })} placeholder="格式名称" className={`${fieldClass} flex-1 min-w-0`} />
                <button type="button" onClick={() => changeFormats(formats.filter((item) => item.id !== format.id))} className="text-slate-500 hover:text-rose-600 cursor-pointer shrink-0">删除格式</button>
              </div>
              <div className="p-3 space-y-2">
                {format.conditions.length === 0 && <div className="text-slate-400">请添加校验条件</div>}
                {format.conditions.map((condition) => (
                  <div key={condition.id} className="rounded-md border border-slate-100 bg-slate-50/60 p-2 flex flex-wrap items-center gap-2">
                    <select aria-label="条件类型" value={condition.type} onChange={(event) => patchCondition(format, condition.id, { ...newCondition(event.target.value as CardEntryConditionType), id: condition.id })} className={`${fieldClass} w-32 cursor-pointer`}>
                      {CONDITION_TYPES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                    {condition.type === 'fixedLength' && <input aria-label="固定长度" type="number" min="1" value={condition.value || ''} onChange={(event) => patchCondition(format, condition.id, { value: event.target.value })} placeholder="位数" className={`${fieldClass} w-24`} />}
                    {condition.type === 'lengthRange' && <><input aria-label="最小长度" type="number" min="1" value={condition.min || ''} onChange={(event) => patchCondition(format, condition.id, { min: event.target.value })} placeholder="最少位" className={`${fieldClass} w-24`} /><span className="text-slate-400">至</span><input aria-label="最大长度" type="number" min="1" value={condition.max || ''} onChange={(event) => patchCondition(format, condition.id, { max: event.target.value })} placeholder="最多位" className={`${fieldClass} w-24`} /></>}
                    {condition.type === 'characters' && <><select aria-label="允许字符类型" value={condition.characterSet || 'alphanumeric'} onChange={(event) => patchCondition(format, condition.id, { characterSet: event.target.value as CardEntryCharacterSet, requireBoth: false })} className={`${fieldClass} cursor-pointer`}><option value="digits">仅数字</option><option value="letters">仅英文字母</option><option value="alphanumeric">英文字母和数字</option><option value="custom">自定义字符</option></select>{condition.characterSet === 'custom' && <input aria-label="允许的字符" value={condition.customCharacters || ''} onChange={(event) => patchCondition(format, condition.id, { customCharacters: event.target.value })} placeholder="输入允许的字符" className={`${fieldClass} min-w-32 flex-1`} />}{(!condition.characterSet || condition.characterSet === 'alphanumeric') && <label className="flex items-center gap-1 whitespace-nowrap text-slate-600"><input type="checkbox" checked={condition.requireBoth || false} onChange={(event) => patchCondition(format, condition.id, { requireBoth: event.target.checked })} className="accent-blue-600" />必须同时含字母和数字</label>}</>}
                    {['prefix', 'suffix', 'position'].includes(condition.type) && <>{condition.type === 'position' && <><span className="text-slate-500">第</span><input aria-label="起始位置" type="number" min="1" value={condition.position || ''} onChange={(event) => patchCondition(format, condition.id, { position: event.target.value })} placeholder="位置" className={`${fieldClass} w-20`} /><span className="text-slate-500">位起</span></>}<input aria-label="固定内容" value={condition.value || ''} onChange={(event) => patchCondition(format, condition.id, { value: event.target.value })} placeholder="输入固定内容（区分大小写）" className={`${fieldClass} flex-1 min-w-44`} /></>}
                    {['allowedValues', 'blockedValues'].includes(condition.type) && <input aria-label="指定值列表" value={condition.value || ''} onChange={(event) => patchCondition(format, condition.id, { value: event.target.value })} placeholder="多个值用逗号分隔" className={`${fieldClass} flex-1 min-w-44`} />}
                    <button type="button" aria-label="删除条件" onClick={() => patchFormat(format.id, { conditions: format.conditions.filter((item) => item.id !== condition.id) })} className="ml-auto text-slate-400 hover:text-rose-600 cursor-pointer"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                  </div>
                ))}
                <button type="button" onClick={() => patchFormat(format.id, { conditions: [...format.conditions, newCondition()] })} className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer">＋ 添加条件</button>
              </div>
            </div>
          ))}
          {configurationError && <div className="text-rose-600">{configurationError}</div>}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-700">测试输入</span>
            <input value={testInput} onChange={(event) => setTestInput(event.target.value)} placeholder="输入样例验证规则" className={`${fieldClass} flex-1 min-w-40`} />
            <button type="button" onClick={() => setTested(true)} className="h-8 px-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer">验证</button>
            {testResult && <span role="status" className={testResult.valid ? 'text-emerald-700' : 'text-rose-600'}>{testResult.valid ? '通过：' : '不通过：'}{testResult.message}</span>}
          </div>
        </div>
      )}
    </div>
  );
};
