import React, { useState } from 'react';
import { BasicSystemConfig } from '../../types';

interface SystemRuntimeParamsTabProps {
  config: BasicSystemConfig;
  onChangeConfig: (config: BasicSystemConfig) => void;
  onSave: () => void;
}

export const SystemRuntimeParamsTab: React.FC<SystemRuntimeParamsTabProps> = ({
  config,
  onChangeConfig,
  onSave,
}) => {
  const [newIp, setNewIp] = useState('');

  const handleAddIp = () => {
    if (!newIp.trim()) return;
    onChangeConfig({
      ...config,
      allowedIps: [...config.allowedIps, newIp.trim()],
    });
    setNewIp('');
  };

  const handleRemoveIp = (idx: number) => {
    onChangeConfig({
      ...config,
      allowedIps: config.allowedIps.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-4">
      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: 平台身份与运营模式 */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="material-symbols-outlined text-blue-600 text-[18px]">badge</span>
            <span className="text-xs font-semibold text-slate-900">平台基本标识与营业模式</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-500 block mb-1 font-medium">中台系统全称</label>
              <input
                value={config.platformName}
                onChange={(e) => onChangeConfig({ ...config, platformName: e.target.value })}
                className="w-full h-8 px-2.5 bg-slate-50 rounded border border-slate-200 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="text-slate-500 block mb-1 font-medium">全局营业模式</label>
              <select
                value={config.systemStatus}
                onChange={(e) => onChangeConfig({ ...config, systemStatus: e.target.value as any })}
                className="w-full h-8 px-2.5 bg-slate-50 rounded border border-slate-200 text-xs text-slate-800"
              >
                <option value="normal">正常营业 (24/7 实时极速撮合派单)</option>
                <option value="maintenance">维护模式 (暂停新卡单接收，允许已接订单核销)</option>
                <option value="read_only">紧急只读模式 (冻结全部资产流动)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-500 block mb-1 font-medium">主结算本位币 (Primary Currency)</label>
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="primaryCurrency"
                    checked={config.primaryCurrency === 'CNY'}
                    onChange={() => onChangeConfig({ ...config, primaryCurrency: 'CNY' })}
                    className="accent-blue-600"
                  />
                  <span className="font-semibold text-slate-800">CNY (人民币本位)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="primaryCurrency"
                    checked={config.primaryCurrency === 'USDT'}
                    onChange={() => onChangeConfig({ ...config, primaryCurrency: 'USDT' })}
                    className="accent-blue-600"
                  />
                  <span className="font-semibold text-slate-800">USDT (TRC20/ERC20 链上稳定币本位)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: 汇率与结算时钟 */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="material-symbols-outlined text-blue-600 text-[18px]">currency_exchange</span>
            <span className="text-xs font-semibold text-slate-900">外汇汇率数据源与日结时钟</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-500 block mb-1 font-medium">汇率中间价权威数据源</label>
              <input
                value={config.exchangeRateSource}
                onChange={(e) => onChangeConfig({ ...config, exchangeRateSource: e.target.value })}
                className="w-full h-8 px-2.5 bg-slate-50 rounded border border-slate-200 text-xs font-mono text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 block mb-1 font-medium">汇率波动平抑缓冲扣率 (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.exchangeRateBufferPercent}
                  onChange={(e) =>
                    onChangeConfig({ ...config, exchangeRateBufferPercent: Number(e.target.value) })
                  }
                  className="w-full h-8 px-2.5 bg-slate-50 rounded border border-slate-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-slate-500 block mb-1 font-medium">每日对账日切时钟 (UTC+8)</label>
                <input
                  value={config.dailyCutoffTime}
                  onChange={(e) => onChangeConfig({ ...config, dailyCutoffTime: e.target.value })}
                  className="w-full h-8 px-2.5 bg-slate-50 rounded border border-slate-200 text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="font-medium text-slate-800 block">T+0 实时极速清算放款通道</span>
                <span className="text-[11px] text-slate-400">核销成功秒级出款至出卡商账户</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  onChangeConfig({ ...config, fastSettlementEnabled: !config.fastSettlementEnabled })
                }
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  config.fastSettlementEnabled ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    config.fastSettlementEnabled ? 'left-4.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: 安全加固与鉴权 */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="material-symbols-outlined text-blue-600 text-[18px]">security</span>
            <span className="text-xs font-semibold text-slate-900">安全防护与凭证鉴权标准</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-slate-800 block">强制双因子认证 (2FA / Google Auth)</span>
                <span className="text-[11px] text-slate-400">所有涉及资金提现与规则配置均需 TOTP 动态码</span>
              </div>
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, enforce2FA: !config.enforce2FA })}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  config.enforce2FA ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    config.enforce2FA ? 'left-4.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 block mb-1 font-medium">后台会话超时锁定 (分钟)</label>
                <input
                  type="number"
                  value={config.sessionTimeoutMinutes}
                  onChange={(e) =>
                    onChangeConfig({ ...config, sessionTimeoutMinutes: Number(e.target.value) })
                  }
                  className="w-full h-8 px-2.5 bg-slate-50 rounded border border-slate-200 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-slate-500 block mb-1 font-medium">审计日志归档存储期限 (天)</label>
                <input
                  type="number"
                  value={config.auditLogRetentionDays}
                  onChange={(e) =>
                    onChangeConfig({ ...config, auditLogRetentionDays: Number(e.target.value) })
                  }
                  className="w-full h-8 px-2.5 bg-slate-50 rounded border border-slate-200 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-500 block mb-1 font-medium">开放接口 (OpenAPI) 签名算法</label>
              <input
                value={config.apiSignAlgorithm}
                onChange={(e) => onChangeConfig({ ...config, apiSignAlgorithm: e.target.value })}
                className="w-full h-8 px-2.5 bg-slate-50 rounded border border-slate-200 text-xs font-mono text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Card 4: IP 白名单授权管理 */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">verified_user</span>
              <span className="text-xs font-semibold text-slate-900">核心管理机房 IP 白名单限制</span>
            </div>
            <button
              type="button"
              onClick={() =>
                onChangeConfig({ ...config, ipWhitelistEnabled: !config.ipWhitelistEnabled })
              }
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                config.ipWhitelistEnabled ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  config.ipWhitelistEnabled ? 'left-4.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {config.allowedIps.map((ip, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200 text-slate-800 font-mono text-[11px]"
                >
                  <span>{ip}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveIp(idx)}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">close</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                placeholder="添加白名单 IP 或 CIDR (如 116.228.x.x)..."
                className="flex-1 h-8 px-2.5 bg-slate-50 rounded border border-slate-200 text-xs font-mono"
              />
              <button
                type="button"
                onClick={handleAddIp}
                className="px-3 h-8 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded text-xs cursor-pointer transition-colors"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end pt-2">
        <button
          type="button"
          onClick={onSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">save</span>
          <span>下发并保存安全策略</span>
        </button>
      </div>
    </div>
  );
};
