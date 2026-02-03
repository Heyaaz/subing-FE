import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { recommendationService } from '../services/recommendationService';
import { Button, Card, RecommendationSkeleton, Toast } from '../components/common';

const StreamingRecommendationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, quizData } = location.state || {};

  const [streamedText, setStreamedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);
  const [error, setError] = useState(null);
  const [parsedResult, setParsedResult] = useState(null);

  // 피드백 상태 관리
  const [feedbackStatus, setFeedbackStatus] = useState({}); // { [recommendationId]: 'like' | 'dislike' }
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!userId || !quizData) {
      alert('잘못된 접근입니다.');
      navigate('/quiz');
      return;
    }

    const controller = new AbortController();

    const startStreaming = async () => {
      try {
        await recommendationService.getAIRecommendationsStream(
          userId,
          quizData,
          (chunk) => {
            setStreamedText(prev => prev + chunk);
          },
          () => {
            setIsStreaming(false);
          },
          (errorMessage) => {
            if (!controller.signal.aborted) {
              setError(errorMessage);
              setIsStreaming(false);
            }
          },
          controller.signal,
          (result) => { setParsedResult(result); }
        );
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error('Streaming error:', err);
          setError(err.message || '추천 생성에 실패했습니다.');
          setIsStreaming(false);
        }
      }
    };

    startStreaming();

    return () => controller.abort();
  }, [userId, quizData, navigate]);

  /** 스트림 텍스트에서 첫 번째 완전한 JSON 객체만 추출 (JSON 뒤에 붙은 텍스트 무시) */
  const extractFirstJson = (text) => {
    const cleaned = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();
    const start = cleaned.indexOf('{');
    if (start === -1) return null;
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = start; i < cleaned.length; i++) {
      const c = cleaned[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (inString) {
        if (c === '\\') escape = true;
        else if (c === '"') inString = false;
        continue;
      }
      if (c === '"') {
        inString = true;
        continue;
      }
      if (c === '{') depth++;
      else if (c === '}') {
        depth--;
        if (depth === 0) return cleaned.slice(start, i + 1);
      }
    }
    return null;
  };

  // 스트리밍 완료 후 JSON 파싱 시도
  useEffect(() => {
    if (!isStreaming && streamedText && !parsedResult) {
      try {
        const jsonStr = extractFirstJson(streamedText);
        if (!jsonStr) {
          setError('결과를 처리하는 중 문제가 발생했어요');
          return;
        }
        const parsed = JSON.parse(jsonStr);
        setParsedResult(parsed);
      } catch (e) {
        console.error('JSON 파싱 실패:', e);
        setError('결과를 처리하는 중 문제가 발생했어요');
      }
    }
  }, [isStreaming, streamedText, parsedResult]);

  // 피드백 제출 핸들러
  const handleFeedback = async (recommendationIndex, feedbackType) => {
    // 이미 피드백을 남긴 경우 중복 방지
    if (feedbackStatus[recommendationIndex]) {
      return;
    }

    try {
      // 피드백 상태 업데이트
      setFeedbackStatus(prev => ({
        ...prev,
        [recommendationIndex]: feedbackType
      }));

      // 토스트 메시지 표시
      if (feedbackType === 'like') {
        setToastMessage('좋은 추천이었군요! 비슷한 서비스를 더 추천해드릴게요');
      } else {
        setToastMessage('피드백 감사합니다! 다음엔 더 나은 추천을 드릴게요');
      }
      setShowToast(true);

      // TODO: 실제 API 호출 (필요시)
      // await recommendationService.submitFeedback(userId, recommendationIndex, feedbackType);
    } catch (error) {
      console.error('피드백 제출 실패:', error);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">🔄</div>
            <h2 className="text-xl font-bold text-yellow-900 mb-2">
              결과 처리 중 문제가 발생했어요
            </h2>
            <p className="text-yellow-700 mb-6">
              {error}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="primary" onClick={() => navigate('/quiz')}>
                다시 시도하기
              </Button>
              <Button variant="secondary" onClick={() => navigate('/optimization')}>
                최적화로 이동
              </Button>
              <Button variant="ghost" onClick={() => navigate('/subscriptions')}>
                구독 관리로 이동
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 스트리밍 중 — 스켈레톤 로딩
  if (isStreaming) {
    return (
      <div className="container mx-auto px-4 py-8">
        <style>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .shimmer {
            background: linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%);
            background-size: 200% 100%;
            animation: shimmer 1.4s infinite linear;
            animation-delay: var(--shimmer-delay, 0ms);
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          .blink {
            animation: blink 1.2s ease-in-out infinite;
          }
        `}</style>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI가 분석 중이에요<span className="blink">…</span>
            </h1>
            <p className="text-gray-600">
              취향/예산/목적을 반영해 추천을 만들고 있어요
            </p>
          </div>

          <div className="space-y-6">
            <RecommendationSkeleton delay={0} />
            <RecommendationSkeleton delay={150} />
            <RecommendationSkeleton delay={300} />
          </div>
        </div>
      </div>
    );
  }

  // 완료 후 — 추천 카드 표시
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">당신을 위한 추천</h1>
        <p className="text-gray-600 mb-8">AI가 분석한 맞춤 구독 서비스예요</p>

        {/* 추천 카드 */}
        <div className="space-y-6 mb-8">
          {parsedResult?.recommendations?.map((rec, index) => (
            <Card key={index}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{rec.serviceName}</h3>
                  <p className="text-gray-600 mt-1">추천 점수: <span className="font-semibold text-primary-600">{rec.score}/100</span></p>
                </div>
                <span className="inline-block bg-primary-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold">
                  {index + 1}
                </span>
              </div>

              {/* 추천 이유 */}
              <div className="bg-primary-50 border-l-4 border-primary-500 p-4 mb-4 rounded">
                <h4 className="font-semibold text-primary-900 mb-2">✨ 추천 이유</h4>
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

              {/* 피드백 섹션 */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">이 추천이 도움이 되었나요?</p>
                  <div className="flex gap-2">
                    {feedbackStatus[index] ? (
                      <span className="text-sm text-gray-500 font-medium">
                        피드백 완료
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleFeedback(index, 'like')}
                          className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 hover:border-success-500 hover:bg-success-50 transition-colors"
                          disabled={!!feedbackStatus[index]}
                        >
                          <span className="text-lg">👍</span>
                          <span className="text-sm text-gray-700">좋아요</span>
                        </button>
                        <button
                          onClick={() => handleFeedback(index, 'dislike')}
                          className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 hover:border-error-500 hover:bg-error-50 transition-colors"
                          disabled={!!feedbackStatus[index]}
                        >
                          <span className="text-lg">👎</span>
                          <span className="text-sm text-gray-700">별로예요</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {feedbackStatus[index] && (
                  <div className="mt-2 text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      feedbackStatus[index] === 'like'
                        ? 'bg-success-100 text-success-800'
                        : 'bg-error-100 text-error-800'
                    }`}>
                      {feedbackStatus[index] === 'like' ? '👍' : '👎'}
                      {feedbackStatus[index] === 'like' ? '도움됨' : '별로'}
                    </span>
                  </div>
                )}
              </div>

              {/* 구독 관리 이동 */}
              <Button
                variant="primary"
                onClick={() => navigate('/subscriptions')}
                className="w-full"
              >
                구독 관리 페이지로 이동하기
              </Button>
            </Card>
          ))}
        </div>

        {/* 전체 요약 */}
        {parsedResult?.summary && (
          <Card className="bg-gray-50 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📝 전체 요약</h3>
            <p className="text-gray-700 leading-relaxed">{parsedResult.summary}</p>

            {parsedResult.alternatives && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-gray-600 text-sm">
                  <span className="font-semibold">💭 대안:</span> {parsedResult.alternatives}
                </p>
              </div>
            )}
          </Card>
        )}

        {/* 다시 테스트 */}
        <div className="text-center">
          <Button variant="secondary" onClick={() => navigate('/quiz')}>
            다시 테스트하기
          </Button>
        </div>

        {/* 토스트 메시지 */}
        <Toast
          message={toastMessage}
          isVisible={showToast}
          onClose={() => setShowToast(false)}
          duration={2500}
        />
      </div>
    </div>
  );
};

export default StreamingRecommendationPage;