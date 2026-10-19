import assert from 'node:assert/strict';
import test from 'node:test';
import type { CardEntryElement } from './types';
import { validateEntryRuleConfiguration, validateImageEntryFiles, validateTextEntryValue } from './entryValidation';

const ecode: CardEntryElement = {
  id: 'ecode', type: '卡密码(Ecode)', name: 'Ecode', property: '文本类', prompt: 'Enter a Valid Ecode',
  required: true, valueRule: '限制',
  allowedFormats: [
    { id: 'standard', name: '普通格式', conditions: [
      { id: 'a', type: 'fixedLength', value: '12' },
      { id: 'b', type: 'characters', characterSet: 'alphanumeric' },
    ] },
    { id: 'tr', name: 'TR 格式', conditions: [
      { id: 'c', type: 'fixedLength', value: '10' },
      { id: 'd', type: 'prefix', value: 'TR' },
      { id: 'e', type: 'characters', characterSet: 'alphanumeric' },
    ] },
  ],
};

test('任一允许格式匹配即通过，同一格式内所有条件必须匹配', () => {
  assert.equal(validateTextEntryValue(ecode, 'AB12CD34EF56').matchedFormat, '普通格式');
  assert.equal(validateTextEntryValue(ecode, 'TR12AB34CD').matchedFormat, 'TR 格式');
  assert.equal(validateTextEntryValue(ecode, 'TR12AB34C').valid, false);
  assert.equal(validateTextEntryValue(ecode, 'tr12AB34CD').valid, false);
  assert.equal(validateTextEntryValue(ecode, 'TR12AB34C!').valid, false);
  assert.equal(validateTextEntryValue(ecode, 'AB12CD34EF56 ').valid, false);
});

test('每个要素独立配置，指定位置和禁用值可组合', () => {
  const pin: CardEntryElement = { ...ecode, id: 'pin', name: 'PIN', allowedFormats: [{ id: 'pin-format', name: 'PIN 格式', conditions: [
    { id: 'length', type: 'fixedLength', value: '6' },
    { id: 'digits', type: 'characters', characterSet: 'digits' },
    { id: 'third', type: 'position', position: '3', value: '7' },
    { id: 'blocked', type: 'blockedValues', value: '127456, 997000' },
  ] }] };
  assert.equal(validateTextEntryValue(pin, '127456').valid, false);
  assert.equal(validateTextEntryValue(pin, '117456').valid, true);
  assert.equal(validateTextEntryValue(pin, '118456').valid, false);
  assert.equal(validateTextEntryValue(ecode, '117456').valid, false);
});

test('无效配置不能误判为通过；非必填要素允许留空', () => {
  const bad = { ...ecode, allowedFormats: [{ id: 'empty', name: '空格式', conditions: [] }] };
  assert.match(validateEntryRuleConfiguration(bad) || '', /至少添加一个校验条件/);
  assert.equal(validateTextEntryValue(bad, 'anything').valid, false);
  assert.equal(validateTextEntryValue({ ...ecode, required: false }, '').valid, true);
  assert.equal(validateTextEntryValue(ecode, '').valid, false);
});

test('图片要素按自身配置校验张数、格式和大小', () => {
  const image: CardEntryElement = {
    id: 'image', type: '卡图(Card image)', name: 'Card image', property: '图片', prompt: 'Enter a Valid Card image',
    required: true, valueRule: '限制', maxImages: 2, allowedImageFormats: ['JPG', 'PNG'], maxImageSizeMB: 1,
  };
  const jpg = { name: 'card.jpg', type: 'image/jpeg', size: 500_000 };
  assert.equal(validateImageEntryFiles(image, [jpg]).valid, true);
  assert.equal(validateImageEntryFiles(image, [jpg, jpg, jpg]).valid, false);
  assert.equal(validateImageEntryFiles(image, [{ ...jpg, type: 'image/webp' }]).valid, false);
  assert.equal(validateImageEntryFiles(image, [{ ...jpg, size: 2_000_000 }]).valid, false);
});
