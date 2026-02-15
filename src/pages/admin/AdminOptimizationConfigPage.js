import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getOptimizationConfig,
  getOptimizationConfigAudits,
  rollbackOptimizationConfig,
  rollbackOptimizationConfigByKey,
  updateOptimizationConfig
} from '../../services/adminService';
import Loading from '../../components/Loading';

const POLICY_FIELDS = [
  { key: 'pricing.yearlyDivisor', label: '연간 환산 분모', type: 'number' },
  { key: 'pricing.sameServiceSwitchCost', label: '동일 서비스 전환비용', type: 'number' },
  { key: 'pricing.crossServiceBaseSwitchCost', label: '타 서비스 기본 전환비용', type: 'number' },
  { key: 'pricing.yearlyBillingPenalty', label: '연간 결제 추가 페널티', type: 'number' },
  { key: 'pricing.crossCategoryPenalty', label: '카테고리 변경 페널티', type: 'number' },
  { key: 'portfolio.maxChangesPerRun', label: '최대 변경 건수', type: 'number' },
  { key: 'performance.topKPlansPerService', label: '서비스별 후보 Top-K', type: 'number' },
  { key: 'performance.candidateSearchTimeoutMs', label: '후보 탐색 타임아웃(ms)', type: 'number' },
  { key: 'performance.portfolioOptimizeTimeoutMs', label: '포트폴리오 최적화 타임아웃(ms)', type: 'number' },
  { key: 'performance.runtimeCacheTtlMs', label: '런타임 캐시 TTL(ms)', type: 'number' },
  { key: 'tracking.enabled', label: '이벤트 트래킹 활성화', type: 'boolean' }
];

const POLICY_KEY_TO_EFFECTIVE_FIELD = {
  'pricing.yearlyDivisor': 'yearlyDivisor',
  'pricing.sameServiceSwitchCost': 'sameServiceSwitchCost',
  'pricing.crossServiceBaseSwitchCost': 'crossServiceBaseSwitchCost',
  'pricing.yearlyBillingPenalty': 'yearlyBillingPenalty',
  'pricing.crossCategoryPenalty': 'crossCategoryPenalty',
  'portfolio.maxChangesPerRun': 'maxChangesPerRun',
  'performance.topKPlansPerService': 'topKPlansPerService',
  'performance.candidateSearchTimeoutMs': 'candidateSearchTimeoutMs',
  'performance.portfolioOptimizeTimeoutMs': 'portfolioOptimizeTimeoutMs',
  'performance.runtimeCacheTtlMs': 'runtimeCacheTtlMs',
  'tracking.enabled': 'trackingEnabled'
};

const ACTION_TYPE_LABEL = {
  UPSERT: '설정 변경',
  DEACTIVATE: '오버라이드 해제',
  ROLLBACK_KEY: '키 단위 롤백',
  ROLLBACK_ALL: '전체 롤백'
};

const formatPolicyValue = (value) => {
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  return String(value ?? '');
};

const formatAuditValue = (value) => (value == null || value === '' ? '(없음)' : String(value));

const AdminOptimizationConfigPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);
  const [rollingBackKeyMap, setRollingBackKeyMap] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [configData, setConfigData] = useState(null);
  const [overrideInputs, setOverrideInputs] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);

  const applyConfigPayload = useCallback((payload) => {
    setConfigData(payload);
    setOverrideInputs(payload?.activeOverrides || {});
    if (Array.isArray(payload?.recentAudits)) {
      setAuditLogs(payload.recentAudits);
    }
  }, []);

  const loadAudits = useCallback(async () => {
    const response = await getOptimizationConfigAudits({ limit: 30 });
    const payload = response?.data || response || [];
    setAuditLogs(Array.isArray(payload) ? payload : []);
  }, []);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await getOptimizationConfig();
      const payload = response?.data || response;
      applyConfigPayload(payload);
      if (!Array.isArray(payload?.recentAudits)) {
        await loadAudits();
      }
    } catch (error) {
      console.error('최적화 정책 조회 실패:', error);
      if (error.response?.status === 403) {
        alert('관리자 권한이 필요해요.');
        navigate('/');
        return;
      }
      setErrorMessage('정책 데이터를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, [applyConfigPayload, loadAudits, navigate]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const fieldRows = useMemo(() => {
    if (!configData) return [];
    const defaults = configData.defaultPolicy || {};
    const effective = configData.effectivePolicy || {};

    return POLICY_FIELDS.map((field) => {
      const effectiveField = POLICY_KEY_TO_EFFECTIVE_FIELD[field.key];
      return {
        ...field,
        defaultValue: formatPolicyValue(defaults[effectiveField]),
        effectiveValue: formatPolicyValue(effective[effectiveField]),
        overrideValue: overrideInputs[field.key] ?? ''
      };
    });
  }, [configData, overrideInputs]);

  const handleOverrideChange = (key, value) => {
    setOverrideInputs((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccessMessage('');
      setErrorMessage('');

      const payload = Object.fromEntries(
        Object.entries(overrideInputs).map(([key, value]) => [key, String(value ?? '')])
      );

      const response = await updateOptimizationConfig(payload);
      const data = response?.data || response;
      applyConfigPayload(data);
      if (!Array.isArray(data?.recentAudits)) {
        await loadAudits();
      }
      setSuccessMessage('최적화 정책이 저장되었어요.');
    } catch (error) {
      console.error('최적화 정책 저장 실패:', error);
      const message = error?.response?.data?.message || error?.message || '저장에 실패했어요.';
      setErrorMessage(message);
    } finally {
      setSaving(false);
    }
  };

  const handleRollback = async () => {
    try {
      setRollingBack(true);
      setSuccessMessage('');
      setErrorMessage('');

      const response = await rollbackOptimizationConfig();
      const data = response?.data || response;
      applyConfigPayload(data);
      if (!Array.isArray(data?.recentAudits)) {
        await loadAudits();
      }
      setSuccessMessage('정책이 기본값으로 롤백되었어요.');
    } catch (error) {
      console.error('최적화 정책 롤백 실패:', error);
      const message = error?.response?.data?.message || error?.message || '롤백에 실패했어요.';
      setErrorMessage(message);
    } finally {
      setRollingBack(false);
    }
  };

  const handleRollbackByKey = async (configKey) => {
    try {
      setRollingBackKeyMap((prev) => ({ ...prev, [configKey]: true }));
      setSuccessMessage('');
      setErrorMessage('');

      const response = await rollbackOptimizationConfigByKey(configKey);
      const data = response?.data || response;
      applyConfigPayload(data);
      if (!Array.isArray(data?.recentAudits)) {
        await loadAudits();
      }
      setSuccessMessage(`키 단위 롤백이 완료되었어요: ${configKey}`);
    } catch (error) {
      console.error('키 단위 롤백 실패:', error);
      const message = error?.response?.data?.message || error?.message || '키 롤백에 실패했어요.';
      setErrorMessage(message);
    } finally {
      setRollingBackKeyMap((prev) => ({ ...prev, [configKey]: false }));
    }
  };

  if (loading) {
    return <Loading text="최적화 정책을 불러오고 있어요..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">최적화 정책 관리</h1>
          <p className="mt-2 text-sm text-gray-600">
            런타임 파라미터를 조정하고, 키 단위/전체 롤백과 변경 이력 추적을 할 수 있어요.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(errorMessage || successMessage) && (
          <div className={`mb-6 rounded-lg px-4 py-3 text-sm ${errorMessage ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {errorMessage || successMessage}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Policy Overrides</h2>
              <p className="text-xs text-gray-500 mt-1">
                캐시 로드 시각: {configData?.cacheLoadedAtEpochMs ? new Date(configData.cacheLoadedAtEpochMs).toLocaleString('ko-KR') : '-'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRollback}
                disabled={rollingBack || saving}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50"
              >
                {rollingBack ? '롤백 중...' : '기본값 롤백'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || rollingBack}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {saving ? '저장 중...' : '정책 저장'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">키</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">기본값</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">현재 적용값</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">오버라이드 입력값</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">키 단위 롤백</th>
                </tr>
              </thead>
              <tbody>
                {fieldRows.map((row) => (
                  <tr key={row.key} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{row.key}</td>
                    <td className="px-4 py-3 text-gray-800">{row.defaultValue}</td>
                    <td className="px-4 py-3 text-gray-800">{row.effectiveValue}</td>
                    <td className="px-4 py-3">
                      {row.type === 'boolean' ? (
                        <select
                          value={row.overrideValue}
                          onChange={(e) => handleOverrideChange(row.key, e.target.value)}
                          className="w-full max-w-xs border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="">(오버라이드 해제)</option>
                          <option value="true">true</option>
                          <option value="false">false</option>
                        </select>
                      ) : (
                        <input
                          type="number"
                          value={row.overrideValue}
                          onChange={(e) => handleOverrideChange(row.key, e.target.value)}
                          placeholder="비우면 오버라이드 해제"
                          className="w-full max-w-xs border border-gray-300 rounded-md px-3 py-2"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleRollbackByKey(row.key)}
                        disabled={saving || rollingBack || rollingBackKeyMap[row.key]}
                        className="px-3 py-2 text-xs font-medium text-primary-700 bg-primary-50 rounded-md hover:bg-primary-100 disabled:opacity-50"
                      >
                        {rollingBackKeyMap[row.key] ? '롤백 중...' : '이 키 롤백'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">최근 정책 변경 이력</h2>
            <p className="text-xs text-gray-500 mt-1">최신 30건 기준으로 표시됩니다.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">시각</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">키</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">액션</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">변경 전</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">변경 후</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">작업자</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      변경 이력이 없습니다.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((audit) => (
                    <tr key={audit.id} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-700">
                        {audit.changedAt ? new Date(audit.changedAt).toLocaleString('ko-KR') : '-'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{audit.configKey}</td>
                      <td className="px-4 py-3 text-gray-800">{ACTION_TYPE_LABEL[audit.actionType] || audit.actionType}</td>
                      <td className="px-4 py-3 text-gray-700">{formatAuditValue(audit.beforeValue)}</td>
                      <td className="px-4 py-3 text-gray-700">{formatAuditValue(audit.afterValue)}</td>
                      <td className="px-4 py-3 text-gray-700">{audit.changedByUserId ?? '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOptimizationConfigPage;
