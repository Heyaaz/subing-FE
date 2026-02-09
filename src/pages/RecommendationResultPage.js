import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { recommendationService } from '../services/recommendationService';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Alert } from '../components/common';
import { getServiceIconUrl, getServiceColor } from '../utils/serviceIcons';

const ServiceIcon = ({ serviceName }) => {
  const [imgError, setImgError] = useState(false);
  const resolvedUrl = getServiceIconUrl(serviceName, null);

  if (resolvedUrl && !imgError) {
    return (
      <img
        src={resolvedUrl}
        alt=""
        className="w-10 h-10 rounded-lg object-contain shrink-0"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0"
      style={{ backgroundColor: getServiceColor(serviceName) }}
    >
      {(serviceName || '?').charAt(0)}
    </div>
  );
};

const RecommendationResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const recommendations = location.state?.recommendations;
  const recommendationId = location.state?.recommendationId;
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  if (!recommendations) {
    return <Navigate to="/recommendation/quiz" replace />;
  }

  const handleFeedback = async (isHelpful) => {
    if (!user?.id) {
      alert('로그인이 필요해요.');
      return;
    }

    if (!recommendationId) {
      alert('피드백을 제출할 수 없어요.');
      return;
    }

    try {
      await recommendationService.submitFeedback(recommendationId, user.id, isHelpful);
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error('Feedback error:', error);
      alert('피드백을 제출하지 못했어요. 다시 시도해주세요.');
    }
  };

  const handleServiceClick = async (serviceId) => {
    // 클릭 추적 (백그라운드에서 실행)
    if (user?.id && recommendationId && serviceId) {
      await recommendationService.trackClick(recommendationId, user.id, serviceId);
    }
    // 구독 관리 페이지로 이동
    navigate('/subscriptions');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">당신을 위한 추천</h1>
        <p className="text-gray-600 mb-8">AI가 분석한 맞춤 구독 서비스예요</p>

        {/* 추천 카드 */}
        <div className="space-y-6 mb-8">
          {recommendations.recommendations?.map((rec, index) => (
            <Card key={index}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                  <ServiceIcon serviceName={rec.serviceName} />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{rec.serviceName}</h3>
                    <p className="text-gray-600 mt-1">추천 점수: <span className="font-semibold text-primary-600">{rec.score}/100</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-primary-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold">
                    {index + 1}
                  </span>
                </div>
              </div>

              {/* 추천 이유 */}
              <div className="bg-primary-50 border-l-4 border-primary-500 p-4 mb-4 rounded">
                <h4 className="font-semibold text-primary-900 mb-2">추천 이유</h4>
                <p className="text-primary-800">{rec.mainReason}</p>
              </div>

              {/* 장점 */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">👍 장점</h4>
                <ul className="space-y-2">
                  {rec.pros?.map((pro, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-success-500 mr-2 mt-0.5">✅</span>
                      <span className="text-gray-700">{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 단점 */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">⚠️ 단점</h4>
                <ul className="space-y-2">
                  {rec.cons?.map((con, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-error-500 mr-2 mt-0.5">❌</span>
                      <span className="text-gray-700">{con}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 팁 */}
              {rec.tip && (
                <div className="bg-warning-50 border-l-4 border-warning-500 p-4 mb-4 rounded">
                  <p className="text-warning-900">
                    <span className="font-semibold">💡 추천 팁:</span> {rec.tip}
                  </p>
                </div>
              )}

              {/* 구독 추가 버튼 */}
              <Button
                variant="primary"
                onClick={() => handleServiceClick(rec.serviceId)}
                className="w-full"
              >
                구독 관리 페이지로 이동하기
              </Button>
            </Card>
          ))}
        </div>

        {/* 전체 요약 */}
        {recommendations.summary && (
          <Card className="bg-gray-50 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">전체 요약</h3>
            <p className="text-gray-700 leading-relaxed">{recommendations.summary}</p>

            {recommendations.alternatives && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-gray-600 text-sm">
                  <span className="font-semibold">대안:</span> {recommendations.alternatives}
                </p>
              </div>
            )}
          </Card>
        )}

        {/* 피드백 */}
        {!feedbackSubmitted ? (
          <Card className="text-center mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              이 추천이 도움이 되었나요?
            </h3>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleFeedback(true)}
                className="px-6 py-3 bg-success-100 text-success-700 rounded-lg hover:bg-success-200 transition font-semibold"
              >
                👍 도움이 되었어요
              </button>
              <button
                onClick={() => handleFeedback(false)}
                className="px-6 py-3 bg-error-100 text-error-700 rounded-lg hover:bg-error-200 transition font-semibold"
              >
                👎 별로예요
              </button>
            </div>
          </Card>
        ) : (
          <Alert variant="success" className="mb-8">
            피드백 감사해요! 더 나은 추천을 위해 활용할게요.
          </Alert>
        )}

        {/* 다시 테스트하기 */}
        <div className="text-center space-x-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/recommendation/quiz')}
          >
            다시 테스트하기
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/recommendation/history')}
          >
            추천 기록 보기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationResultPage;
