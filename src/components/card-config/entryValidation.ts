import type { CardEntryAllowedFormat, CardEntryElement, CardEntryRuleCondition } from './types';

export interface EntryValidationResult {
  valid: boolean;
  message: string;
  matchedFormat?: string;
}

const positiveInteger = (value: string | undefined) => {
  const number = Number(value);
  return value?.trim() && Number.isInteger(number) && number > 0 ? number : null;
};

const splitValues = (value: string | undefined) => (value || '')
  .split(/[,，\n]/)
  .map((item) => item.trim())
  .filter(Boolean);

export const validateEntryRuleConfiguration = (element: Pick<CardEntryElement, 'property' | 'valueRule' | 'allowedFormats' | 'maxImages' | 'maxImageSizeMB'>): string | null => {
  if (element.valueRule === '不限') return null;
  if (element.property === '图片') {
    if (!Number.isInteger(element.maxImages) || !element.maxImages || element.maxImages < 1 || element.maxImages > 20) return '图片最大张数须为 1–20 的整数';
    if (element.maxImageSizeMB !== undefined && (!Number.isFinite(element.maxImageSizeMB) || element.maxImageSizeMB <= 0)) return '单张图片大小上限须大于 0';
    return null;
  }

  if (!element.allowedFormats?.length) return '请至少新增一套允许格式';
  for (const [formatIndex, format] of element.allowedFormats.entries()) {
    const label = format.name.trim() || `格式 ${formatIndex + 1}`;
    if (!format.name.trim()) return `请填写格式 ${formatIndex + 1} 的名称`;
    if (!format.conditions.length) return `「${label}」请至少添加一个校验条件`;
    for (const condition of format.conditions) {
      if (condition.type === 'fixedLength' && !positiveInteger(condition.value)) return `「${label}」的固定长度须为正整数`;
      if (condition.type === 'lengthRange') {
        const min = positiveInteger(condition.min);
        const max = positiveInteger(condition.max);
        if (!min || !max || min > max) return `「${label}」的长度区间须为有效的正整数，且最小值不大于最大值`;
      }
      if (['prefix', 'suffix', 'position'].includes(condition.type) && !condition.value) return `「${label}」请填写固定内容`;
      if (condition.type === 'position' && !positiveInteger(condition.position)) return `「${label}」的指定位置须为正整数`;
      if (condition.type === 'characters' && condition.characterSet === 'custom' && !condition.customCharacters) return `「${label}」请填写允许的字符`;
      if (['allowedValues', 'blockedValues'].includes(condition.type) && !splitValues(condition.value).length) return `「${label}」请填写值列表`;
    }
  }
  return null;
};

const matchesCondition = (input: string, condition: CardEntryRuleCondition): boolean => {
  const chars = Array.from(input);
  switch (condition.type) {
    case 'fixedLength': return chars.length === Number(condition.value);
    case 'lengthRange': return chars.length >= Number(condition.min) && chars.length <= Number(condition.max);
    case 'prefix': return input.startsWith(condition.value || '');
    case 'suffix': return input.endsWith(condition.value || '');
    case 'position': {
      const expected = condition.value || '';
      return chars.slice(Number(condition.position) - 1, Number(condition.position) - 1 + Array.from(expected).length).join('') === expected;
    }
    case 'allowedValues': return splitValues(condition.value).includes(input);
    case 'blockedValues': return !splitValues(condition.value).includes(input);
    case 'characters': {
      const set = condition.characterSet || 'alphanumeric';
      if (set === 'digits') return /^[0-9]+$/.test(input);
      if (set === 'letters') return /^[A-Za-z]+$/.test(input);
      if (set === 'custom') return chars.every((char) => Array.from(condition.customCharacters || '').includes(char));
      return /^[A-Za-z0-9]+$/.test(input) && (!condition.requireBoth || (/[A-Za-z]/.test(input) && /[0-9]/.test(input)));
    }
  }
};

const matchesFormat = (input: string, format: CardEntryAllowedFormat) => format.conditions.every((condition) => matchesCondition(input, condition));

/** 同一格式中的条件全部满足；任一允许格式匹配即通过。输入不会被静默修剪或转换大小写。 */
export const validateTextEntryValue = (element: CardEntryElement, input: string): EntryValidationResult => {
  if (element.property !== '文本类') return { valid: false, message: '该要素不是文本类' };
  const configurationError = validateEntryRuleConfiguration(element);
  if (configurationError) return { valid: false, message: configurationError };
  if (!input) return element.required ? { valid: false, message: '该要素为必填项' } : { valid: true, message: '非必填，可留空' };
  if (element.valueRule === '不限') return { valid: true, message: '校验通过' };
  const matched = element.allowedFormats?.find((format) => matchesFormat(input, format));
  return matched
    ? { valid: true, message: `符合「${matched.name}」`, matchedFormat: matched.name }
    : { valid: false, message: '不符合任何一套允许格式' };
};

interface EntryImageFile {
  name: string;
  size: number;
  type: string;
}

export const validateImageEntryFiles = (element: CardEntryElement, files: readonly EntryImageFile[]): EntryValidationResult => {
  if (element.property !== '图片') return { valid: false, message: '该要素不是图片类' };
  const configurationError = validateEntryRuleConfiguration(element);
  if (configurationError) return { valid: false, message: configurationError };
  if (!files.length) return element.required ? { valid: false, message: '该要素为必填项' } : { valid: true, message: '非必填，可留空' };
  if (element.valueRule === '不限') return { valid: true, message: '校验通过' };
  if (files.length > (element.maxImages || 20)) return { valid: false, message: `最多上传 ${element.maxImages} 张图片` };
  for (const file of files) {
    if (element.maxImageSizeMB && file.size > element.maxImageSizeMB * 1024 * 1024) return { valid: false, message: `单张图片不能超过 ${element.maxImageSizeMB} MB` };
    const format = file.type === 'image/jpeg' ? 'JPG' : file.type === 'image/png' ? 'PNG' : file.type === 'image/webp' ? 'WebP' : '';
    if (element.allowedImageFormats?.length && !element.allowedImageFormats.includes(format as 'JPG' | 'PNG' | 'WebP')) return { valid: false, message: `图片格式仅支持 ${element.allowedImageFormats.join('、')}` };
  }
  return { valid: true, message: '校验通过' };
};
