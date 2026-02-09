import React, { useState } from 'react';
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
// import TierLimitModal from '../components/TierLimitModal'; // 임시 숨김

const OptimizationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  // const [showTierModal, setShowTierModal] = useState(false); // 임시 숨김

  const fetchSuggestions = async () => {
    if (!user?.id) return;
    setErrorMessage(null);
    setLoading(true);
    try {
      const response = await optimizationService.getOptimizationSuggestions(user.id);
      setSuggestions(response.data);
    } catch (error) {
      console.error('Failed to fetch optimization suggestions:', error);
      const message = error?.message || error?.data?.message || error?.data?.data?.message;
      setErrorMessage(message || '최적화 제안을 불러오지 못했어요. 다시 시도해주세요.');
      setSuggestions(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
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

  const hasSuggestions = suggestions.duplicateServices.length > 0 || suggestions.cheaperAlternatives.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">최적화 제안</h1>
          <p className="text-gray-600">구독을 분석해서 비용을 절감할 수 있는 방법을 알려드려요</p>
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
                <p className="text-sm opacity-90 mb-2">월 최대 절약 가능</p>
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
        {suggestions.cheaperAlternatives.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              저렴한 대안 ({suggestions.cheaperAlternatives.length})
            </h2>
            <div className="space-y-4">
              {suggestions.cheaperAlternatives.map((alternative, index) => (
                <Card key={index} className="border-success-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="success">
                          월 {formatCurrency(alternative.savings)} 절약
                        </Badge>
                      </div>
                      <p className="text-gray-700 text-lg">{alternative.message}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 현재 구독 */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <p className="text-sm text-gray-500 mb-2">현재 구독</p>
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
                      <p className="text-sm text-success-700 mb-2">추천 대안</p>
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

                  {alternative.alternativePlan.description && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">{alternative.alternativePlan.description}</p>
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
                      >
                        대안 서비스 확인
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/subscriptions`)}
                    >
                      현재 구독 관리
                    </Button>
                  </div>
                </Card>
              ))}
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

      {/* 티어 제한 모달 (임시 숨김) */}
      {/* <TierLimitModal
        isOpen={showTierModal}
        onClose={() => setShowTierModal(false)}
        limitType="optimization"
      /> */}
    </div>
  );
};

export default OptimizationPage;
