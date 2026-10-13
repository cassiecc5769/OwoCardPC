import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { CardBrandLogo } from '../card-config/CardBrandLogo';
import {
  CardOrderTask,
  MockCardCodeImagePair,
  MockCardPinItem,
  MockCardExpiryItem,
  MockCardReceiptItem,
  EDIT_CARD_TYPE_OPTIONS,
  EDIT_COUNTRY_OPTIONS,
  EDIT_MEDIA_TYPE_OPTIONS,
  EDIT_SPEED_OPTIONS,
  getTaskCardItems,
  getTaskPins,
  getTaskExpiries,
  getTaskReceipts,
  SplitDraftOrder,
} from './CustomerServiceCockpit';

export interface SplitOrderWorkbenchProps {
  task: CardOrderTask;
  splitDraftOrders: SplitDraftOrder[];
  splitGeneralError: string | null;
  splitShowCodesPlain: Record<string, boolean>;
  onToggleSplitCode: (codeId: string) => void;
  onUpdateSplitDraft: (draftId: string, updates: Partial<SplitDraftOrder>) => void;
  onToggleDraftImage: (draftId: string, item: MockCardCodeImagePair) => void;
  onToggleDraftPin: (draftId: string, item: MockCardPinItem) => void;
  onToggleDraftExpiry: (draftId: string, item: MockCardExpiryItem) => void;
  onToggleDraftReceipt: (draftId: string, item: MockCardReceiptItem) => void;
  onAddAnotherSplitDraft: () => void;
  onRemoveSplitDraft: (draftId: string) => void;
  onPreviewImage: (modal: { url: string; title: string }) => void;
}

export const SplitOrderWorkbench: React.FC<SplitOrderWorkbenchProps> = ({
  task,
  splitDraftOrders,
  splitGeneralError,
  splitShowCodesPlain,
  onToggleSplitCode,
  onUpdateSplitDraft,
  onToggleDraftImage,
  onToggleDraftPin,
  onToggleDraftExpiry,
  onToggleDraftReceipt,
  onAddAnotherSplitDraft,
  onRemoveSplitDraft,
  onPreviewImage,
}) => {
  const allOrigItems = getTaskCardItems(task);
  const origPins = getTaskPins(task);
  const origExpiries = getTaskExpiries(task);
  const origReceipts = getTaskReceipts(task);

  const allAssignedImageIds = splitDraftOrders.flatMap(d => d.selectedImageIds);
  const remainingImagesCount = allOrigItems.length - allAssignedImageIds.length;
  const canAddMoreDraft = remainingImagesCount >= 2;

  return (
    <div className="p-5 flex-1 min-h-0 max-h-[calc(90vh-130px)] flex flex-col gap-4 text-xs overflow-y-auto overscroll-contain pr-3">
      {/* 全局错误警告提示 (若有) */}
      {splitGeneralError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium text-xs flex items-center gap-2">
          <MaterialIcon name="error" size={16} className="text-rose-500 shrink-0" />
          <span>{splitGeneralError}</span>
        </div>
      )}

      {/* 模块一：原卡单信息 (只读，国家展示为 US美国，报价合并，状态在原单号后，回显原单总数量) */}
      <div className="flex flex-col gap-2.5 bg-slate-50/90 rounded-xl p-3.5 border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
          <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <MaterialIcon name="info" size={16} className="text-blue-600" />
            <span>模块一：原卡单信息</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-mono">原单号: {task.id}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100/80 text-blue-700">
              {task.statusLabel}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <CardBrandLogo card={{ brandName: task.cardType, iconType: task.cardTypeIcon }} size="xs" />
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-slate-900 text-xs truncate">
                {task.cardFullName || task.cardType}
              </span>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-medium leading-none flex items-center gap-1">
                  <span>{task.countryFlag || '🇺🇸'}</span>
                  <span>{task.country}{task.countryName}</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100/70 text-blue-700 font-medium leading-none">
                  {task.mediaTypeLabel || '卡图'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100/70 text-emerald-700 font-medium leading-none">
                  {task.speedTag || '快卡'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-mono text-slate-900 text-xs font-semibold flex items-center justify-end gap-3.5">
              <span>面值: {task.faceValue}</span>
              <span>原单卡数量: <strong className="text-slate-900 font-bold">{task.cardQuantity || allOrigItems.length}张</strong> (原单总数量)</span>
            </div>
            <div className="text-[11px] font-mono mt-1 text-slate-700 flex items-center justify-end gap-1.5">
              <span className="text-slate-500">收卡报价 / 用户成交价:</span>
              <strong className="text-blue-700 font-semibold">{task.merchantQuote || '￥7.9200'}</strong>
              <span className="text-slate-600 font-normal">({task.userDealQuote || '￥7.5240/₦1505'})</span>
            </div>
          </div>
        </div>

        {/* 原单资产扣减实时动态指示 */}
        <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-200/60 text-[11px] bg-white/70 px-3 py-1.5 rounded-lg border border-slate-200/50">
          <span className="text-slate-600 font-medium flex items-center gap-1.5">
            <MaterialIcon name="inventory_2" size={14} className="text-indigo-600" />
            <span>拆单后原单最终保留资产预览:</span>
          </span>
          <div className="flex items-center gap-3 font-mono">
            <span className={`px-2 py-0.5 rounded font-bold ${remainingImagesCount >= 1 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
              保留卡图: {remainingImagesCount} / {allOrigItems.length} 张 {remainingImagesCount < 1 && '(不足，原单需至少留1张)'}
            </span>
            {origPins.length > 0 && (
              <span className="text-slate-500">
                原单PIN: {origPins.length} 条
              </span>
            )}
            {origReceipts.length > 0 && (
              <span className="text-slate-500">
                原单收据: {origReceipts.length} 张
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 模块二：拆出新卡单配置 (支持同屏直接配置、追加新单、独立配置卡种/国家/面额/凭证) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <MaterialIcon name="call_split" size={16} className="text-blue-600" />
              <span>模块二：拆出新卡单配置</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
              共 {splitDraftOrders.length} 笔拆出新单
            </span>
          </div>

          {/* + 继续添加拆出新单 按钮 */}
          <button
            type="button"
            onClick={onAddAnotherSplitDraft}
            disabled={!canAddMoreDraft}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold shadow-2xs transition-all ${
              canAddMoreDraft
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
            title={canAddMoreDraft ? '原单余图充足，点击可再拆出一个独立新卡单' : '原单必须保留至少 1 张卡图凭证，当前余图不足以继续追加新单'}
          >
            <MaterialIcon name="add" size={15} />
            <span>+ 继续添加拆出新单</span>
            {!canAddMoreDraft && <span className="text-[10px] font-normal">(原单余图需≥2)</span>}
          </button>
        </div>

        {/* 新卡单配置卡片列表 */}
        <div className="flex flex-col gap-3.5">
          {splitDraftOrders.map((draft, draftIdx) => {
            const otherDrafts = splitDraftOrders.filter(d => d.id !== draft.id);
            const otherAssignedImgIds = otherDrafts.flatMap(d => d.selectedImageIds);

            return (
              <div
                key={draft.id}
                className="flex flex-col gap-3.5 bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all"
              >
                {/* 卡片头部 */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center">
                      {draftIdx + 1}
                    </span>
                    <span className="font-bold text-slate-900 text-xs">
                      新卡单 #{draftIdx + 1}
                    </span>
                    <span className="text-[11px] text-blue-700 font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-200/50">
                      单号: {draft.id}
                    </span>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium border border-amber-200/50">
                      已划入卡图: {draft.selectedImageIds.length} 张
                    </span>
                  </div>

                  {splitDraftOrders.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveSplitDraft(draft.id)}
                      className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-0.5 rounded cursor-pointer transition-colors"
                      title="删除此拆出新单，释放其占用的凭证"
                    >
                      <MaterialIcon name="delete" size={14} />
                      <span>删除此新单</span>
                    </button>
                  )}
                </div>

                {/* 1. 基础配置第一行: 卡种、国家、面额、介质、速度 */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                      <span className="text-rose-500 font-bold">*</span>卡种
                    </span>
                    <select
                      value={draft.cardType}
                      onChange={e => onUpdateSplitDraft(draft.id, { cardType: e.target.value })}
                      className="p-2 bg-slate-50/70 hover:bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
                    >
                      {EDIT_CARD_TYPE_OPTIONS.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                      <span className="text-rose-500 font-bold">*</span>国家
                    </span>
                    <select
                      value={draft.country}
                      onChange={e => onUpdateSplitDraft(draft.id, { country: e.target.value })}
                      className="p-2 bg-slate-50/70 hover:bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
                    >
                      {EDIT_COUNTRY_OPTIONS.map(c => (
                        <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                      <span className="text-rose-500 font-bold">*</span>卡面值
                    </span>
                    <input
                      type="text"
                      value={draft.faceValue}
                      onChange={e => onUpdateSplitDraft(draft.id, { faceValue: e.target.value })}
                      placeholder="如 100"
                      className={`p-2 bg-white border rounded-lg text-xs font-mono font-semibold text-slate-800 focus:outline-none ${
                        draft.faceValueError ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-blue-500'
                      }`}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-slate-700">介质类型</span>
                    <select
                      value={draft.mediaType}
                      onChange={e => onUpdateSplitDraft(draft.id, { mediaType: e.target.value })}
                      className="p-2 bg-slate-50/70 hover:bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
                    >
                      {EDIT_MEDIA_TYPE_OPTIONS.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-slate-700">交易速度</span>
                    <select
                      value={draft.speed}
                      onChange={e => onUpdateSplitDraft(draft.id, { speed: e.target.value })}
                      className="p-2 bg-slate-50/70 hover:bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
                    >
                      {EDIT_SPEED_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. 报价与成交价配置行 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/60 p-2.5 rounded-xl border border-slate-200/60">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                        <span className="text-rose-500 font-bold">*</span>
                        <span>收卡报价 (Merchant Quote)</span>
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-slate-400 font-mono text-xs">￥</span>
                      <input
                        type="text"
                        value={draft.purchaseRate}
                        onChange={e => onUpdateSplitDraft(draft.id, { purchaseRate: e.target.value })}
                        className={`w-full pl-6 p-1.5 bg-white border rounded-lg text-xs font-mono font-semibold text-slate-800 focus:outline-none ${
                          draft.purchaseRateError ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-blue-500'
                        }`}
                      />
                    </div>
                    {draft.purchaseRateError && (
                      <span className="text-[10px] text-rose-500">{draft.purchaseRateError}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-slate-700">
                      用户成交报价 (联动自动计算)
                    </span>
                    <div className="p-1.5 bg-emerald-50/80 border border-emerald-200/80 rounded-lg font-mono text-xs font-bold text-emerald-800 flex items-center justify-between">
                      <span>{draft.userDealQuote}</span>
                      <span className="text-[9px] text-emerald-600 font-normal">95%折率 + ₦整</span>
                    </div>
                  </div>
                </div>

                {/* 3. 英文备注行 */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                      <span className="text-rose-500 font-bold">*</span>
                      <span>备注 (Note)</span>
                      <span className="text-[10px] text-slate-400 font-normal">必填项，用户端展示，仅支持英文描述，不支持输入汉字</span>
                    </span>
                  </div>
                  <input
                    type="text"
                    value={draft.note}
                    onChange={e => onUpdateSplitDraft(draft.id, { note: e.target.value })}
                    placeholder="e.g. Split batch from original order #1"
                    className={`p-2 bg-white border rounded-lg text-xs text-slate-800 font-sans focus:outline-none ${
                      draft.noteError ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                  {draft.noteError && (
                    <span className="text-[10px] text-rose-500 flex items-center gap-1 font-medium">
                      <MaterialIcon name="error" size={12} />
                      {draft.noteError}
                    </span>
                  )}
                </div>

                {/* 4. 选择卡图卡密凭证分类面板 */}
                <div className="flex flex-col gap-2.5 bg-slate-50/80 rounded-xl p-3 border border-slate-200/80">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <MaterialIcon name="verified_user" size={15} className="text-blue-600" />
                      <span>选择卡图卡密凭证 (分配给本新单)</span>
                    </span>
                    <span className="text-[10px] text-slate-500">
                      本单已选卡图: <strong className="text-blue-700">{draft.selectedImageIds.length}</strong> 张
                    </span>
                  </div>

                  {/* 分类 1: 卡图卡代码 (必选) */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <span className="text-rose-500 font-bold">*</span>
                        <span>1. 卡图卡代码 (必选，每个新单至少选1张，点击卡片切换)</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-0.5">
                      {allOrigItems.map((item, idx) => {
                        const isClaimedByOther = otherAssignedImgIds.includes(item.id);
                        const claimedDraft = isClaimedByOther ? otherDrafts.find(d => d.selectedImageIds.includes(item.id)) : null;
                        const isSelected = draft.selectedImageIds.includes(item.id);

                        if (isClaimedByOther) {
                          return (
                            <div
                              key={item.id}
                              className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 bg-slate-100/70 opacity-60 cursor-not-allowed select-none"
                              title={`已划入新卡单 [${claimedDraft?.id}]`}
                            >
                              <div className="relative w-9 h-9 rounded bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                                {item.imageUrl ? (
                                  <img src={item.imageUrl} alt={item.cardName} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <MaterialIcon name="image" size={16} />
                                  </div>
                                )}
                                <div className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-black/60 text-white font-mono font-bold text-[7px] flex items-center justify-center">
                                  {idx + 1}
                                </div>
                              </div>
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="font-bold text-slate-600 text-[10px] truncate">{item.cardName}</span>
                                <span className="text-[9px] font-semibold text-purple-700 truncate">
                                  已归新单: {claimedDraft?.id}
                                </span>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={item.id}
                            onClick={() => onToggleDraftImage(draft.id, item)}
                            className={`flex items-center gap-2 p-1.5 rounded-lg border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-amber-50/80 border-amber-400 shadow-2xs ring-2 ring-amber-100'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="relative w-9 h-9 rounded bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.cardName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  <MaterialIcon name="image" size={16} />
                                </div>
                              )}
                              <div className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-black/60 text-white font-mono font-bold text-[7px] flex items-center justify-center">
                                {idx + 1}
                              </div>
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="font-bold text-slate-900 text-[10px] truncate">{item.cardName}</span>
                              <span className="text-[9px] text-slate-500 font-mono truncate">{item.code || '无明文卡代码'}</span>
                              <span className={`text-[9px] font-semibold ${isSelected ? 'text-amber-700' : 'text-slate-400'}`}>
                                {isSelected ? '✓ 已划入本单' : '点击勾选'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 分类 2: PIN码凭证 (可选) */}
                  {origPins.length > 0 && (
                    <div className="flex flex-col gap-1.5 pt-1.5 border-t border-slate-200/70">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <MaterialIcon name="pin" size={13} className="text-emerald-600" />
                          <span>2. PIN码凭证 (可选，原单共 {origPins.length} 条)</span>
                        </span>
                        <span className="text-slate-400">本单已选 {draft.selectedPinIds.length} 条</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {origPins.map((p, pIdx) => {
                          const isPinSelected = draft.selectedPinIds.includes(p.id);
                          const isPinPlain = !!splitShowCodesPlain[p.id];
                          return (
                            <div
                              key={p.id}
                              onClick={() => onToggleDraftPin(draft.id, p)}
                              className={`flex items-center justify-between p-1.5 rounded-lg border cursor-pointer transition-all ${
                                isPinSelected
                                  ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-100 shadow-2xs'
                                  : 'bg-white border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isPinSelected}
                                  onChange={() => {}}
                                  className="rounded text-emerald-600 focus:ring-0 cursor-pointer pointer-events-none w-3.5 h-3.5"
                                />
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[9px] text-slate-400 font-mono">PIN #{pIdx + 1}</span>
                                  <span className="text-[11px] font-mono font-bold text-slate-800 truncate">
                                    {isPinPlain ? p.pin : '••••••'}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  onToggleSplitCode(p.id);
                                }}
                                className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                                title={isPinPlain ? '隐藏PIN' : '查看PIN'}
                              >
                                <MaterialIcon name={isPinPlain ? 'visibility_off' : 'visibility'} size={13} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 分类 3: 有效期凭证 (可选) */}
                  {origExpiries.length > 0 && (
                    <div className="flex flex-col gap-1.5 pt-1.5 border-t border-slate-200/70">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <MaterialIcon name="calendar_today" size={13} className="text-purple-600" />
                          <span>3. 有效期凭证 (可选，原单共 {origExpiries.length} 条)</span>
                        </span>
                        <span className="text-slate-400">本单已选 {draft.selectedExpiryIds.length} 条</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {origExpiries.map((exp, eIdx) => {
                          const isExpSelected = draft.selectedExpiryIds.includes(exp.id);
                          const isExpPlain = !!splitShowCodesPlain[exp.id];
                          return (
                            <div
                              key={exp.id}
                              onClick={() => onToggleDraftExpiry(draft.id, exp)}
                              className={`flex items-center justify-between p-1.5 rounded-lg border cursor-pointer transition-all ${
                                isExpSelected
                                  ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-100 shadow-2xs'
                                  : 'bg-white border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isExpSelected}
                                  onChange={() => {}}
                                  className="rounded text-purple-600 focus:ring-0 cursor-pointer pointer-events-none w-3.5 h-3.5"
                                />
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[9px] text-slate-400 font-mono">有效期 #{eIdx + 1}</span>
                                  <span className="text-[11px] font-mono font-bold text-slate-800 truncate">
                                    {isExpPlain ? exp.expiryDate : '****-**-**'}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  onToggleSplitCode(exp.id);
                                }}
                                className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                                title={isExpPlain ? '隐藏' : '查看'}
                              >
                                <MaterialIcon name={isExpPlain ? 'visibility_off' : 'visibility'} size={13} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 分类 4: 收据凭证 (可选) */}
                  {origReceipts.length > 0 && (
                    <div className="flex flex-col gap-1.5 pt-1.5 border-t border-slate-200/70">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <MaterialIcon name="receipt_long" size={13} className="text-teal-600" />
                          <span>4. 收据凭证 (可选，原单共 {origReceipts.length} 张)</span>
                        </span>
                        <span className="text-slate-400">本单已选 {draft.selectedReceiptIds.length} 张</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {origReceipts.map((rec, rIdx) => {
                          const isRecSelected = draft.selectedReceiptIds.includes(rec.id);
                          return (
                            <div
                              key={rec.id}
                              onClick={() => onToggleDraftReceipt(draft.id, rec)}
                              className={`flex items-center gap-1.5 p-1 rounded-lg border cursor-pointer transition-all ${
                                isRecSelected
                                  ? 'bg-teal-50/80 border-teal-300 ring-2 ring-teal-100 shadow-2xs'
                                  : 'bg-white border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isRecSelected}
                                onChange={() => {}}
                                className="rounded text-teal-600 focus:ring-0 cursor-pointer pointer-events-none w-3.5 h-3.5"
                              />
                              <div
                                className="w-8 h-7 rounded bg-slate-200 overflow-hidden shrink-0 border border-slate-300"
                                onClick={e => {
                                  e.stopPropagation();
                                  onPreviewImage({ url: rec.imageUrl, title: rec.name || `收据凭证 #${rIdx + 1}` });
                                }}
                                title="查看大图"
                              >
                                <img src={rec.imageUrl} alt={rec.name} className="w-full h-full object-cover" />
                              </div>
                              <span className="text-[9px] font-medium text-slate-700 truncate flex-1">
                                {rec.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
