import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recommendationService } from '../services/recommendationService';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Badge, EmptyState } from '../components/common';
import Loading from '../components/Loading';

const RecommendationHistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchHistory();
    }
  }, [user?.id]);

  const fetchHistory = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const response = await recommendationService.getRecommendationHistory(user.id);
      setHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch recommendation history:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewRecommendation = (item) => {
    try {
      const resultData = JSON.parse(item.resultData);
      navigate('/recommendation/result', {
        state: { recommendations: resultData, recommendationId: item.id }
      });
    } catch (error) {
      console.error('Failed to parse recommendation data:', error);
    }
  };

  if (loading) {
    return <Loading text="추천 기록을 불러오고 있어요..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">추천 기록</h1>
            <p className="text-gray-600">이전에 받았던 AI 추천을 확인해요</p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/recommendation/quiz')}
          >
            새 추천 받기
          </Button>
        </div>

        {history.length === 0 ? (
          <EmptyState
            title="추천 기록이 없어요"
            description="AI 추천 테스트를 진행하여 맞춤 서비스를 찾아보세요!"
            icon="📋"
            action={{
              label: '추천 테스트 시작하기',
              onClick: () => navigate('/recommendation/quiz')
            }}
          />
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => {
              let quizData, resultData;
              try {
                quizData = JSON.parse(item.quizData);
                resultData = JSON.parse(item.resultData);
              } catch (error) {
                return null;
              }

              return (
                <Card
                  key={item.id}
                  hover
                  className="cursor-pointer"
                  onClick={() => viewRecommendation(item)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="primary">
                          #{history.length - index}
                        </Badge>
                        <span className="text-gray-500 text-sm">
                          {new Date(item.createdAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {quizData.interests?.map((interest, i) => (
                          <Badge key={i} variant="secondary">
                            {interest}
                          </Badge>
                        ))}
                        <Badge variant="success">
                          예산: {quizData.budget?.toLocaleString()}원
                        </Badge>
                      </div>
                      <p className="text-gray-700 font-medium">
                        {resultData.recommendations?.length || 0}개 서비스 추천받음
                      </p>
                    </div>
                    <Button variant="primary" size="sm">
                      자세히 보기
                    </Button>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex gap-2 flex-wrap">
                      {resultData.recommendations?.slice(0, 3).map((rec, i) => (
                        <Badge key={i} variant="info">
                          {rec.serviceName}
                        </Badge>
                      ))}
                      {resultData.recommendations?.length > 3 && (
                        <Badge variant="secondary">
                          +{resultData.recommendations.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationHistoryPage;
