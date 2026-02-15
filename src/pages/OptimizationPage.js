import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { optimizationService } from '../services/optimizationService';
import { useAuth } from '../context/AuthContext';
import { Card, Badge, Alert, Button } from '../components/common';
import Loading from '../components/Loading';
import { getServiceIconUrl, getServiceColor } from '../utils/serviceIcons';

const ServiceIcon = ({ serviceName, iconUrl }) => {
  const [imgError, setImgError] = useState(false);
  const resolvedUrl = getServiceIconUrl(serviceName, iconUrl);

  if (resolvedUrl && !imgError) {
    return (
      <img
        src={resolvedUrl}
        alt=""
        className="w-8 h-8 rounded-lg object-contain shrink-0"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
      style={{ backgroundColor: getServiceColor(serviceName) }}
    >
      {(serviceName || '?').charAt(0)}
    </div>
  );
};

const OptimizationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const trackedImpressionKeysRef = useRef(new Set());
  const fetchSuggestions = useCallback(async () => {
    if (!user?.id) return;
    setErrorMessage(null);
    setLoading(true);
    trackedImpressionKeysRef.current.clear();
    try {
      const response = await optimizationService.getOptimizationSuggestions(user.id);
      setSuggestions(response.data);
    } catch (error) {
      console.error('Failed to fetch optimization suggestions:', error);
      const message = error?.message || error?.data?.message;
      setErrorMessage(message || '최적화 제안을 불러오지 못했어요. 다시 시도해주세요.');
      setSuggestions(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // 페이지 진입 시 자동 분석
  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const displayedAlternatives = useMemo(
    () => (suggestions?.optimizedAlternatives?.length > 0
      ? suggestions.optimizedAlternatives
      : (suggestions?.cheaperAlternatives || [])),
    [suggestions]
  );

  useEffect(() => {
    if (!user?.id || displayedAlternatives.length === 0) return;

    displayedAlternatives.forEach((alternative) => {
      const planId = alternative.alternativePlan?.planId || 'na';
      const key = `${alternative.currentSubscription?.id}-${alternative.alternativeServiceId}-${planId}`;
      if (trackedImpressionKeysRef.current.has(key)) return;
      trackedImpressionKeysRef.current.add(key);

      optimizationService.trackOptimizationEvent(user.id, {
        eventType: 'IMPRESSION',
        currentSubscriptionId: alternative.currentSubscription?.id,
        alternativeServiceId: alternative.alternativeServiceId,
        suggestionType: alternative.suggestionType,
        source: 'OPTIMIZATION_PAGE',
        metadata: {
          confidence: alternative.confidence,
          netSavings: alternative.netSavings ?? alternative.savings
        }
      });
    });
  }, [user?.id, displayedAlternatives]);

  const handleRefresh = () => {
    if (user?.id) {
      optimizationService.trackOptimizationEvent(user.id, {
        eventType: 'REFRESH',
        source: 'OPTIMIZATION_PAGE'
      });
    }
    fetchSuggestions();
  };

  const trackAlternativeClick = (eventType, alternative) => {
    if (!user?.id) return;
    optimizationService.trackOptimizationEvent(user.id, {
      eventType,
      currentSubscriptionId: alternative.currentSubscription?.id,
      alternativeServiceId: alternative.alternativeServiceId,
      suggestionType: alternative.suggestionType,
      source: 'OPTIMIZATION_PAGE',
      metadata: {
        confidence: alternative.confidence,
        netSavings: alternative.netSavings ?? alternative.savings
      }
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  const getReasonLabel = (reasonCode) => {
    const labels = {
      SAME_SERVICE_DOWNGRADE: '동일 서비스 다운그레이드',
      CATEGORY_SWITCH: '카테고리 내 서비스 변경',
      YEARLY_BILLING_NORMALIZED: '연간 결제 월환산 반영',
      MONTHLY_BILLING_BASE: '월간 결제 기준',
      SWITCH_COST_APPLIED: '전환 비용 반영',
      HIGH_CONFIDENCE: '신뢰도 높음',
      MEDIUM_CONFIDENCE: '신뢰도 보통',
      LOW_CONFIDENCE: '신뢰도 낮음'
    };
    return labels[reasonCode] || reasonCode;
  };

  if (loading) {
    return <Loading text="최적화 제안을 분석하고 있어요..." />;
  }

  if (!suggestions) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-[60vh] flex items-center justify-center">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">최적화 제안</h1>
            <p className="text-gray-600 mb-6">구독을 분석해서 비용을 절감할 수 있는 방법을 알려드려요</p>
            <Button onClick={fetchSuggestions} disabled={loading}>
              최적화 분석하기
            </Button>
          </div>
          {errorMessage && (
            <Alert variant="error">
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    );
  }

  const hasSuggestions = suggestions.duplicateServices.length > 0 || displayedAlternatives.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">최적화 제안</h1>
            <p className="text-gray-600">구독을 분석해서 비용을 절감할 수 있는 방법을 알려드려요</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다시 분석하기
          </button>
        </div>

        {/* 요약 카드 */}
        <div className={`rounded-xl shadow-lg p-8 mb-8 ${
          hasSuggestions ? 'bg-gradient-to-r from-warning-500 to-error-500' : 'bg-gradient-to-r from-success-500 to-success-600'
        } text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">
                {hasSuggestions ? '개선 기회를 찾았어요!' : '완벽하게 최적화되었어요!'}
              </h2>
              <p className="text-lg opacity-90">{suggestions.summary}</p>
            </div>
            {suggestions.totalPotentialSavings > 0 && (
              <div className="text-right ml-4">
                <p className="text-sm opacity-90 mb-2">월 최대 순절감 예상</p>
                <p className="text-5xl font-bold">{formatCurrency(suggestions.totalPotentialSavings)}</p>
              </div>
            )}
          </div>
        </div>

        {/* 중복 서비스 카드 */}
        {suggestions.duplicateServices.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              중복 서비스 ({suggestions.duplicateServices.length})
            </h2>
            <div className="space-y-4">
              {suggestions.duplicateServices.map((group, index) => (
                <Card key={index} className="border-warning-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {group.categoryDescription} 카테고리
                      </h3>
                      <p className="text-gray-600">{group.message}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">총 비용</p>
                      <p className="text-2xl font-bold text-warning-600">
                        {formatCurrency(group.totalCost)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">구독 중인 서비스:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {group.subscriptions.map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <ServiceIcon serviceName={sub.serviceName} iconUrl={sub.serviceIcon} />
                            <span className="font-medium text-gray-900">{sub.serviceName}</span>
                          </div>
                          <span className="text-gray-600">{formatCurrency(sub.monthlyPrice)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 액션 버튼 그룹 */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate('/subscriptions')}
                    >
                      구독 관리에서 확인
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 저렴한 대안 카드 */}
        {displayedAlternatives.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              저렴한 대안 ({displayedAlternatives.length})
            </h2>
            <div className="space-y-4">
              {displayedAlternatives.map((alternative, index) => {
                const netSavings = alternative.netSavings ?? alternative.savings;
                const confidence = alternative.confidence ?? 0;

                return (
                <Card key={index} className="border-success-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="success">
                          월 순절감 {formatCurrency(netSavings)}
                        </Badge>
                        {confidence > 0 && (
                          <Badge variant={confidence >= 80 ? 'success' : 'warning'}>
                            신뢰도 {confidence}점
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-700 text-lg">{alternative.message}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 현재 구독 */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <p className="text-sm text-gray-500 mb-2">현재 구독 (월 환산)</p>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">
                        {alternative.currentSubscription.serviceName}
                      </h4>
                      {alternative.currentSubscription.planName && (
                        <p className="text-sm text-gray-600 mb-2">{alternative.currentSubscription.planName}</p>
                      )}
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(alternative.currentPrice)}
                      </p>
                    </div>

                    {/* 대안 서비스 */}
                    <div className="border border-success-300 rounded-lg p-4 bg-success-50">
                      <p className="text-sm text-success-700 mb-2">추천 대안 (월 환산)</p>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">
                        {alternative.alternativeServiceName}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">{alternative.alternativePlan.planName}</p>
                      <p className="text-2xl font-bold text-success-600">
                        {formatCurrency(alternative.alternativePrice)}
                      </p>
                      {alternative.alternativeServiceUrl && (
                        <a
                          href={alternative.alternativeServiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-3 text-sm text-success-600 hover:text-success-700 underline"
                        >
                          서비스 확인하기 →
                        </a>
                      )}
                    </div>
                  </div>

                  {alternative.switchCost > 0 && (
                    <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                      <p className="text-sm text-amber-800">
                        전환 비용 {formatCurrency(alternative.switchCost)} 반영 후
                        월 순절감 {formatCurrency(alternative.netSavings ?? alternative.savings)} 기준입니다.
                      </p>
                    </div>
                  )}

                  {alternative.alternativePlan.description && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">{alternative.alternativePlan.description}</p>
                    </div>
                  )}

                  {alternative.reasonCodes?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">추천 근거</p>
                      <div className="flex flex-wrap gap-2">
                        {alternative.reasonCodes.map((reasonCode) => (
                          <span
                            key={reasonCode}
                            className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
                          >
                            {getReasonLabel(reasonCode)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 액션 버튼 그룹 */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    {alternative.alternativeServiceUrl && (
                      <Button
                        variant="primary"
                        size="sm"
                        as="a"
                        href={alternative.alternativeServiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackAlternativeClick('CLICK_ALTERNATIVE', alternative)}
                      >
                        대안 서비스 확인
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        trackAlternativeClick('CLICK_MANAGE', alternative);
                        navigate(`/subscriptions`);
                      }}
                    >
                      현재 구독 관리
                    </Button>
                  </div>
                </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* 제안이 없을 때 */}
        {!hasSuggestions && (
          <Card className="p-12 text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              완벽하게 최적화되었어요!
            </h3>
            <p className="text-gray-600 mb-6">
              중복 서비스도 없고, 지금 최저가로 구독 중이에요.
            </p>
            <p className="text-sm text-gray-500">
              새로운 구독을 추가하거나 변경사항이 있으면 다시 확인해보세요.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OptimizationPage;
