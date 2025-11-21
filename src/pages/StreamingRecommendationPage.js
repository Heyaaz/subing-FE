import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { recommendationService } from '../services/recommendationService';
import { Button } from '../components/common';

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

    const startStreaming = async () => {
      try {
        await recommendationService.getAIRecommendationsStream(
          userId,
          quizData,
          // onChunk: 각 청크를 받을 때마다 호출
          (chunk) => {
            setStreamedText(prev => prev + chunk);
          },
          // onComplete: 스트리밍 완료 시
          () => {
            setIsStreaming(false);
          },
          // onError: 에러 발생 시
          (errorMessage) => {
            setError(errorMessage);
            setIsStreaming(false);
          }
        );
      } catch (err) {
        console.error('Streaming error:', err);
        setError(err.message || '추천 생성에 실패했습니다.');
        setIsStreaming(false);
      }
    };

    startStreaming();
  }, [userId, quizData, navigate]);

  // 스트리밍 완료 후 JSON 파싱 시도
  useEffect(() => {
    if (!isStreaming && streamedText && !parsedResult) {
      try {
        const parsed = JSON.parse(streamedText);
        setParsedResult(parsed);
      } catch (e) {
        console.error('JSON 파싱 실패:', e);
        // JSON 파싱 실패 시에도 텍스트는 보여줌
      }
    }
  }, [isStreaming, streamedText, parsedResult]);

  const handleViewResult = () => {
    if (parsedResult) {
      navigate('/recommendation/result', {
        state: {
          recommendations: parsedResult
        }
      });
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">😞</div>
            <h2 className="text-xl font-bold text-red-900 mb-2">추천 생성 실패</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <Button variant="primary" onClick={() => navigate('/quiz')}>
              다시 시도하기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isStreaming ? 'AI가 분석 중이에요...' : '분석 완료! ✨'}
          </h1>
          <p className="text-gray-600">
            {isStreaming
              ? '맞춤형 추천을 생성하고 있어요'
              : '추천 결과를 확인하세요'}
          </p>
        </div>

        {/* 로딩 애니메이션 */}
        {isStreaming && (
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        {/* 스트리밍 텍스트 표시 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto">
              {streamedText}
              {isStreaming && <span className="inline-block w-2 h-4 bg-primary-500 animate-pulse ml-1"></span>}
            </pre>
          </div>
        </div>

        {/* 완료 후 버튼 */}
        {!isStreaming && parsedResult && (
          <div className="flex justify-center gap-4">
            <Button variant="secondary" onClick={() => navigate('/quiz')}>
              다시 테스트
            </Button>
            <Button variant="primary" onClick={handleViewResult}>
              추천 결과 보기
            </Button>
          </div>
        )}

        {/* 완료했지만 파싱 실패 시 */}
        {!isStreaming && !parsedResult && streamedText && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
            <p className="text-yellow-800 mb-4">
              결과를 파싱하는데 문제가 발생했어요. 다시 시도해주세요.
            </p>
            <Button variant="primary" onClick={() => navigate('/quiz')}>
              다시 시도하기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamingRecommendationPage;