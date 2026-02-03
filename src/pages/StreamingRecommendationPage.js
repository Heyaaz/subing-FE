import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { recommendationService } from '../services/recommendationService';
import { Button, Card, RecommendationSkeleton } from '../components/common';

const StreamingRecommendationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, quizData } = location.state || {};

  const [streamedText, setStreamedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);
  const [error, setError] = useState(null);
  const [parsedResult, setParsedResult] = useState(null);

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
          controller.signal
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

  // 스트리밍 완료 후 JSON 파싱 시도
  useEffect(() => {
    if (!isStreaming && streamedText && !parsedResult) {
      try {
        // 마크다운 코드펜스 제거 (방어적 파싱)
        const cleanJson = streamedText
          .replace(/```json\s*/g, '')
          .replace(/```\s*/g, '')
          .trim();
        const parsed = JSON.parse(cleanJson);
        setParsedResult(parsed);
      } catch (e) {
        console.error('JSON 파싱 실패:', e);
        setError('결과를 처리하는 중 문제가 발생했어요');
      }
    }
  }, [isStreaming, streamedText, parsedResult]);

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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI가 분석 중이에요…
            </h1>
            <p className="text-gray-600">
              취향/예산/목적을 반영해 추천을 만들고 있어요
            </p>
          </div>

          <div className="space-y-6">
            <RecommendationSkeleton />
            <RecommendationSkeleton />
            <RecommendationSkeleton />
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
      </div>
    </div>
  );
};

export default StreamingRecommendationPage;